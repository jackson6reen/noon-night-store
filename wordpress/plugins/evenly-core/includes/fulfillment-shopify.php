<?php
/**
 * Supliful fulfillment through a headless Shopify store.
 *
 * Supliful only connects to Shopify. Supliful's own guide ("Connect your custom app to
 * Supliful using Shopify Admin API") covers using Shopify as a backend only: customers
 * never see it. This module does that for WooCommerce:
 *
 *   1. A WooCommerce order is paid (Stripe sets it to "processing").
 *   2. We create the same order in Shopify with orderCreate (financialStatus PAID),
 *      using the variant IDs of the products published from Supliful.
 *   3. Shopify auto-fulfills paid orders; Supliful ships them.
 *   4. Shopify sends a fulfillment webhook; we add the tracking number to the WooCommerce
 *      order, email it to the customer and mark the order completed.
 *
 * Settings: WooCommerce > Supliful. Two ways to authenticate:
 *   - Dev Dashboard app (current Shopify way): client ID + client secret. We get a short-lived
 *     token with the client-credentials grant and cache it.
 *   - Older admin-created custom app: a fixed Admin API access token (shpat_...).
 * Secrets can instead be defined in wp-config.php: EVENLY_SHOPIFY_CLIENT_ID,
 * EVENLY_SHOPIFY_CLIENT_SECRET, EVENLY_SHOPIFY_TOKEN, EVENLY_SHOPIFY_WEBHOOK_SECRET.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

const EV_SF_OPTION      = 'ev_supliful';
const EV_SF_META_ID     = '_ev_shopify_order_id';
const EV_SF_META_NAME   = '_ev_shopify_order_name';
const EV_SF_META_TRIES  = '_ev_shopify_tries';
const EV_SF_META_TRACK  = '_ev_tracking';
const EV_SF_HOOK        = 'ev_supliful_push_order';
const EV_SF_MAX_TRIES   = 5;

/* -------------------------------------------------------------------------
 * Settings
 * ---------------------------------------------------------------------- */

function ev_sf_defaults() {
	return array(
		'enabled'        => 0,
		'auto_send'      => 1,
		'shop'           => '',
		'api_version'    => '2026-10',
		'client_id'      => '',
		'client_secret'  => '',
		'token'          => '',
		'webhook_secret' => '',
		'sku_map'        => '',
		'alert_email'    => '',
	);
}

function ev_sf_constants() {
	return array(
		'client_id'      => 'EVENLY_SHOPIFY_CLIENT_ID',
		'client_secret'  => 'EVENLY_SHOPIFY_CLIENT_SECRET',
		'token'          => 'EVENLY_SHOPIFY_TOKEN',
		'webhook_secret' => 'EVENLY_SHOPIFY_WEBHOOK_SECRET',
	);
}

function ev_sf( $key ) {
	$constants = ev_sf_constants();
	if ( isset( $constants[ $key ] ) && defined( $constants[ $key ] ) ) {
		return (string) constant( $constants[ $key ] );
	}
	$saved = get_option( EV_SF_OPTION, array() );
	$def   = ev_sf_defaults();
	if ( is_array( $saved ) && isset( $saved[ $key ] ) ) {
		return $saved[ $key ];
	}
	return isset( $def[ $key ] ) ? $def[ $key ] : '';
}

function ev_sf_ready() {
	return ev_sf( 'enabled' ) && ev_sf( 'shop' ) && ( ev_sf( 'token' ) || ( ev_sf( 'client_id' ) && ev_sf( 'client_secret' ) ) );
}

/**
 * Admin API token: the fixed token if one is set, else a cached client-credentials token.
 *
 * @return string|WP_Error
 */
function ev_sf_access_token( $refresh = false ) {
	if ( ev_sf( 'token' ) ) {
		return ev_sf( 'token' );
	}
	if ( ! ev_sf( 'shop' ) || ! ev_sf( 'client_id' ) || ! ev_sf( 'client_secret' ) ) {
		return new WP_Error( 'ev_sf_config', __( 'Shopify store domain and app credentials are missing.', 'evenly' ) );
	}
	$cache = 'ev_sf_cc_token_' . md5( ev_sf( 'shop' ) . ev_sf( 'client_id' ) );
	if ( ! $refresh ) {
		$cached = get_transient( $cache );
		if ( $cached ) {
			return $cached;
		}
	}
	$res = wp_remote_post( sprintf( 'https://%s/admin/oauth/access_token', ev_sf( 'shop' ) ), array(
		'timeout' => 20,
		'body'    => array(
			'grant_type'    => 'client_credentials',
			'client_id'     => ev_sf( 'client_id' ),
			'client_secret' => ev_sf( 'client_secret' ),
		),
	) );
	if ( is_wp_error( $res ) ) {
		return $res;
	}
	$json = json_decode( wp_remote_retrieve_body( $res ), true );
	if ( empty( $json['access_token'] ) ) {
		return new WP_Error( 'ev_sf_auth', sprintf( 'Shopify token request failed (HTTP %d). Check the client ID/secret and that the app is installed on this store.', wp_remote_retrieve_response_code( $res ) ) );
	}
	$ttl = max( 60, (int) ( $json['expires_in'] ?? 3600 ) - 300 );
	set_transient( $cache, $json['access_token'], $ttl );
	return $json['access_token'];
}

/**
 * "EV-UNWIND | 44012345678901" lines -> [ 'EV-UNWIND' => 'gid://shopify/ProductVariant/44012345678901' ].
 */
function ev_sf_sku_map() {
	$map = array();
	foreach ( preg_split( '/\r\n|\r|\n/', (string) ev_sf( 'sku_map' ) ) as $line ) {
		$parts = array_map( 'trim', explode( '|', $line ) );
		if ( count( $parts ) < 2 || '' === $parts[0] || '' === $parts[1] ) {
			continue;
		}
		$id = $parts[1];
		if ( ctype_digit( $id ) ) {
			$id = 'gid://shopify/ProductVariant/' . $id;
		}
		if ( 0 === strpos( $id, 'gid://shopify/ProductVariant/' ) ) {
			$map[ strtoupper( $parts[0] ) ] = $id;
		}
	}
	return $map;
}

add_action( 'admin_menu', function () {
	add_submenu_page(
		'woocommerce',
		__( 'Supliful fulfillment', 'evenly' ),
		__( 'Supliful', 'evenly' ),
		'manage_woocommerce',
		'evenly-supliful',
		'ev_sf_render_page'
	);
}, 60 );

add_action( 'admin_init', function () {
	register_setting( 'ev_sf_group', EV_SF_OPTION, array(
		'type'              => 'array',
		'sanitize_callback' => 'ev_sf_sanitize',
		'default'           => array(),
	) );
} );

function ev_sf_sanitize( $in ) {
	$in    = is_array( $in ) ? wp_unslash( $in ) : array();
	$old   = get_option( EV_SF_OPTION, array() );
	$shop  = strtolower( trim( (string) ( $in['shop'] ?? '' ) ) );
	$shop  = preg_replace( '#^https?://#', '', $shop );
	$shop  = trim( preg_replace( '#/.*$#', '', $shop ) );
	$clean = array(
		'enabled'     => empty( $in['enabled'] ) ? 0 : 1,
		'auto_send'   => empty( $in['auto_send'] ) ? 0 : 1,
		'shop'        => preg_match( '/^[a-z0-9][a-z0-9\-]*\.myshopify\.com$/', $shop ) ? $shop : '',
		'api_version' => preg_match( '/^\d{4}-\d{2}$/', (string) ( $in['api_version'] ?? '' ) ) ? $in['api_version'] : '2026-10',
		'sku_map'     => sanitize_textarea_field( (string) ( $in['sku_map'] ?? '' ) ),
		'alert_email' => sanitize_email( (string) ( $in['alert_email'] ?? '' ) ),
	);
	$clean['client_id'] = sanitize_text_field( trim( (string) ( $in['client_id'] ?? '' ) ) );
	// Secrets: an empty field keeps the stored value, so they are never echoed back into the form.
	foreach ( array( 'client_secret', 'token', 'webhook_secret' ) as $secret ) {
		$value            = trim( (string) ( $in[ $secret ] ?? '' ) );
		$clean[ $secret ] = '' !== $value ? sanitize_text_field( $value ) : ( $old[ $secret ] ?? '' );
	}
	return $clean;
}

/*
 * Supliful declines orders without a phone number, so it is always required at checkout.
 * Block checkout reads the option (WooCommerce can reset it from the block's own setting,
 * so it is forced here); classic checkout reads the billing fields.
 */
add_filter( 'pre_option_woocommerce_checkout_phone_field', function () {
	return 'required';
} );
add_filter( 'woocommerce_billing_fields', function ( $fields ) {
	if ( isset( $fields['billing_phone'] ) ) {
		$fields['billing_phone']['required'] = true;
	}
	return $fields;
} );

/**
 * Paid = has a payment date. (WooCommerce's is_paid() is false for on-hold orders, and a held
 * order that we stopped on purpose is still paid.)
 */
function ev_sf_is_paid( WC_Order $order ) {
	return null !== $order->get_date_paid();
}

function ev_sf_render_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	$hook_url = rest_url( 'evenly/v1/shopify-webhook' );
	$report   = get_transient( 'ev_sf_admin_report_' . get_current_user_id() );
	delete_transient( 'ev_sf_admin_report_' . get_current_user_id() );
	$skus = array();
	foreach ( wc_get_products( array( 'limit' => -1, 'status' => 'publish', 'return' => 'objects' ) ) as $p ) {
		if ( $p->get_sku() && ! nn_product_field( $p->get_id(), '_nn_includes' ) ) {
			$skus[ $p->get_sku() ] = $p->get_name();
		}
	}
	$map = ev_sf_sku_map();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Supliful fulfillment (via Shopify)', 'evenly' ); ?></h1>
		<p><?php esc_html_e( 'Paid WooCommerce orders are copied to your Shopify store, which Supliful fulfills automatically. Customers only ever see this site.', 'evenly' ); ?></p>

		<?php if ( $report ) : ?>
			<div class="notice notice-<?php echo esc_attr( $report['type'] ); ?>"><p><?php echo wp_kses_post( $report['html'] ); ?></p></div>
		<?php endif; ?>

		<h2><?php esc_html_e( 'Product mapping status', 'evenly' ); ?></h2>
		<table class="widefat striped" style="max-width:760px">
			<thead><tr><th>SKU</th><th><?php esc_html_e( 'Product', 'evenly' ); ?></th><th><?php esc_html_e( 'Shopify variant', 'evenly' ); ?></th></tr></thead>
			<tbody>
			<?php foreach ( $skus as $sku => $name ) : ?>
				<tr>
					<td><code><?php echo esc_html( $sku ); ?></code></td>
					<td><?php echo esc_html( $name ); ?></td>
					<td><?php echo isset( $map[ strtoupper( $sku ) ] ) ? '&#10003; ' . esc_html( substr( strrchr( $map[ strtoupper( $sku ) ], '/' ), 1 ) ) : '<strong style="color:#b32d2e">' . esc_html__( 'Not mapped: orders with this product will be held', 'evenly' ) . '</strong>'; ?></td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<p class="description"><?php esc_html_e( 'Bundles do not need a mapping: they are sent as the formulas inside them.', 'evenly' ); ?></p>

		<form method="post" action="options.php">
			<?php settings_fields( 'ev_sf_group' ); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><?php esc_html_e( 'Enable', 'evenly' ); ?></th>
					<td><label><input type="checkbox" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[enabled]" value="1" <?php checked( ev_sf( 'enabled' ) ); ?>> <?php esc_html_e( 'Send paid orders to Shopify / Supliful', 'evenly' ); ?></label>
					<p class="description"><?php esc_html_e( 'The phone number is always required at checkout, because Supliful declines orders without one.', 'evenly' ); ?></p></td></tr>
				<tr><th scope="row"><?php esc_html_e( 'Send automatically', 'evenly' ); ?></th>
					<td><label><input type="checkbox" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[auto_send]" value="1" <?php checked( ev_sf( 'auto_send' ) ); ?>> <?php esc_html_e( 'As soon as payment succeeds', 'evenly' ); ?></label>
					<p class="description"><?php esc_html_e( 'Off = review each order first and use the "Send to Supliful" order action.', 'evenly' ); ?></p></td></tr>
				<tr><th scope="row"><label for="ev_sf_shop"><?php esc_html_e( 'Shopify store domain', 'evenly' ); ?></label></th>
					<td><input class="regular-text" id="ev_sf_shop" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[shop]" value="<?php echo esc_attr( ev_sf( 'shop' ) ); ?>" placeholder="your-store.myshopify.com"></td></tr>
				<tr><th scope="row"><label for="ev_sf_ver"><?php esc_html_e( 'API version', 'evenly' ); ?></label></th>
					<td><input class="small-text" id="ev_sf_ver" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[api_version]" value="<?php echo esc_attr( ev_sf( 'api_version' ) ); ?>" style="width:7em"></td></tr>
				<tr><th scope="row"><label for="ev_sf_cid"><?php esc_html_e( 'App client ID', 'evenly' ); ?></label></th>
					<td><input class="regular-text" id="ev_sf_cid" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[client_id]" value="<?php echo esc_attr( defined( 'EVENLY_SHOPIFY_CLIENT_ID' ) ? '' : ev_sf( 'client_id' ) ); ?>" <?php disabled( defined( 'EVENLY_SHOPIFY_CLIENT_ID' ) ); ?>>
					<p class="description"><?php esc_html_e( 'From the app you create for this store in the Shopify Dev Dashboard. Scopes: read/write products, orders, customers, fulfillments.', 'evenly' ); ?></p></td></tr>
				<tr><th scope="row"><label for="ev_sf_csec"><?php esc_html_e( 'App client secret', 'evenly' ); ?></label></th>
					<td><input class="regular-text" type="password" autocomplete="new-password" id="ev_sf_csec" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[client_secret]" value="" placeholder="<?php echo ev_sf( 'client_secret' ) ? esc_attr__( 'Saved (leave empty to keep)', 'evenly' ) : ''; ?>" <?php disabled( defined( 'EVENLY_SHOPIFY_CLIENT_SECRET' ) ); ?>></td></tr>
				<tr><th scope="row"><label for="ev_sf_token"><?php esc_html_e( 'Or: fixed Admin API token (older custom apps)', 'evenly' ); ?></label></th>
					<td><input class="regular-text" type="password" autocomplete="new-password" id="ev_sf_token" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[token]" value="" placeholder="<?php echo ev_sf( 'token' ) ? esc_attr__( 'Saved (leave empty to keep)', 'evenly' ) : 'shpat_…'; ?>" <?php disabled( defined( 'EVENLY_SHOPIFY_TOKEN' ) ); ?>>
					<p class="description"><?php esc_html_e( 'Only if your app shows an Admin API access token (shpat_...). Leave empty when using client ID + secret. Secrets can also live in wp-config.php (see the plugin file header).', 'evenly' ); ?></p></td></tr>
				<tr><th scope="row"><label for="ev_sf_secret"><?php esc_html_e( 'Webhook signing secret', 'evenly' ); ?></label></th>
					<td><input class="regular-text" type="password" autocomplete="new-password" id="ev_sf_secret" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[webhook_secret]" value="" placeholder="<?php echo ev_sf( 'webhook_secret' ) ? esc_attr__( 'Saved (leave empty to keep)', 'evenly' ) : ''; ?>" <?php disabled( defined( 'EVENLY_SHOPIFY_WEBHOOK_SECRET' ) ); ?>>
					<p class="description"><?php printf( esc_html__( 'Only for webhooks made in Shopify admin (Settings > Notifications > Webhooks: Fulfillment creation, Fulfillment update, Order cancellation). URL: %s', 'evenly' ), '<code>' . esc_html( $hook_url ) . '</code>' ); ?></p></td></tr>
				<tr><th scope="row"><label for="ev_sf_map"><?php esc_html_e( 'SKU → Shopify variant ID', 'evenly' ); ?></label></th>
					<td><textarea class="large-text code" rows="8" id="ev_sf_map" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[sku_map]" placeholder="EV-UNWIND | 44012345678901"><?php echo esc_textarea( ev_sf( 'sku_map' ) ); ?></textarea>
					<p class="description"><?php esc_html_e( 'One per line: SKU | variant ID. Use "Load Shopify products" below to see the IDs.', 'evenly' ); ?></p></td></tr>
				<tr><th scope="row"><label for="ev_sf_alert"><?php esc_html_e( 'Alert email', 'evenly' ); ?></label></th>
					<td><input class="regular-text" type="email" id="ev_sf_alert" name="<?php echo esc_attr( EV_SF_OPTION ); ?>[alert_email]" value="<?php echo esc_attr( ev_sf( 'alert_email' ) ); ?>" placeholder="<?php echo esc_attr( get_option( 'admin_email' ) ); ?>">
					<p class="description"><?php esc_html_e( 'Gets an email when an order can not be sent after all retries.', 'evenly' ); ?></p></td></tr>
			</table>
			<?php submit_button(); ?>
		</form>

		<h2><?php esc_html_e( 'Tools', 'evenly' ); ?></h2>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block;margin-right:8px">
			<input type="hidden" name="action" value="ev_sf_tool"><input type="hidden" name="tool" value="test">
			<?php wp_nonce_field( 'ev_sf_tool' ); ?>
			<?php submit_button( __( 'Test connection', 'evenly' ), 'secondary', 'submit', false ); ?>
		</form>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block">
			<input type="hidden" name="action" value="ev_sf_tool"><input type="hidden" name="tool" value="products">
			<?php wp_nonce_field( 'ev_sf_tool' ); ?>
			<?php submit_button( __( 'Load Shopify products', 'evenly' ), 'secondary', 'submit', false ); ?>
		</form>
	</div>
	<?php
}

/* -------------------------------------------------------------------------
 * Shopify client
 * ---------------------------------------------------------------------- */

/**
 * Run a GraphQL Admin API call.
 *
 * @return array|WP_Error The "data" member.
 */
function ev_sf_graphql( $query, $variables = array(), $retried = false ) {
	$token = ev_sf_access_token( $retried );
	if ( is_wp_error( $token ) ) {
		return $token;
	}
	$url  = sprintf( 'https://%s/admin/api/%s/graphql.json', ev_sf( 'shop' ), ev_sf( 'api_version' ) );
	$body = array( 'query' => $query );
	if ( $variables ) {
		$body['variables'] = $variables;
	}
	$res = wp_remote_post( $url, array(
		'timeout' => 25,
		'headers' => array(
			'Content-Type'           => 'application/json',
			'X-Shopify-Access-Token' => $token,
		),
		'body'    => wp_json_encode( $body ),
	) );
	if ( is_wp_error( $res ) ) {
		return $res;
	}
	$code = wp_remote_retrieve_response_code( $res );
	if ( 401 === (int) $code && ! $retried && ! ev_sf( 'token' ) ) {
		return ev_sf_graphql( $query, $variables, true ); // Expired client-credentials token: get a new one once.
	}
	$json = json_decode( wp_remote_retrieve_body( $res ), true );
	if ( $code >= 400 || ! is_array( $json ) ) {
		return new WP_Error( 'ev_sf_http', sprintf( 'Shopify HTTP %d: %s', $code, wp_strip_all_tags( substr( wp_remote_retrieve_body( $res ), 0, 300 ) ) ) );
	}
	if ( ! empty( $json['errors'] ) ) {
		$msgs = array();
		foreach ( (array) $json['errors'] as $e ) {
			$msgs[] = is_array( $e ) ? ( $e['message'] ?? wp_json_encode( $e ) ) : (string) $e;
		}
		return new WP_Error( 'ev_sf_gql', implode( '; ', $msgs ) );
	}
	return $json['data'] ?? array();
}

add_action( 'admin_post_ev_sf_tool', function () {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( esc_html__( 'Not allowed.', 'evenly' ), 403 );
	}
	check_admin_referer( 'ev_sf_tool' );
	$tool = sanitize_key( $_POST['tool'] ?? '' );
	if ( 'products' === $tool ) {
		$data = ev_sf_graphql( 'query { productVariants(first: 100) { nodes { id sku title product { title status } } } }' );
		if ( is_wp_error( $data ) ) {
			$report = array( 'type' => 'error', 'html' => esc_html( $data->get_error_message() ) );
		} else {
			$rows = '';
			foreach ( $data['productVariants']['nodes'] ?? array() as $v ) {
				$rows .= sprintf(
					'<tr><td>%s</td><td>%s</td><td>%s</td><td><code>%s</code></td></tr>',
					esc_html( $v['product']['title'] ?? '' ),
					esc_html( 'Default Title' === $v['title'] ? '' : $v['title'] ),
					esc_html( $v['sku'] ?? '' ),
					esc_html( substr( strrchr( $v['id'], '/' ), 1 ) )
				);
			}
			$report = array( 'type' => 'info', 'html' => $rows ? '<table class="widefat striped"><thead><tr><th>Product</th><th>Variant</th><th>Supliful SKU</th><th>Variant ID (copy this)</th></tr></thead><tbody>' . $rows . '</tbody></table>' : esc_html__( 'No products in Shopify yet. Publish them from Supliful with "Publish to Shopify".', 'evenly' ) );
		}
	} else {
		$data   = ev_sf_graphql( 'query { shop { name email currencyCode } }' );
		$report = is_wp_error( $data )
			? array( 'type' => 'error', 'html' => esc_html( $data->get_error_message() ) )
			: array( 'type' => 'success', 'html' => esc_html( sprintf( __( 'Connected to %1$s (%2$s).', 'evenly' ), $data['shop']['name'] ?? '?', $data['shop']['currencyCode'] ?? '?' ) ) );
	}
	set_transient( 'ev_sf_admin_report_' . get_current_user_id(), $report, 120 );
	wp_safe_redirect( admin_url( 'admin.php?page=evenly-supliful' ) );
	exit;
} );

/* -------------------------------------------------------------------------
 * Woo order -> Shopify order
 * ---------------------------------------------------------------------- */

/**
 * US numbers to E.164 (+1XXXXXXXXXX); other numbers keep their digits with a leading +.
 */
function ev_sf_phone( $raw ) {
	$digits = preg_replace( '/\D+/', '', (string) $raw );
	if ( 10 === strlen( $digits ) ) {
		return '+1' . $digits;
	}
	if ( 11 === strlen( $digits ) && '1' === $digits[0] ) {
		return '+' . $digits;
	}
	return $digits ? '+' . $digits : '';
}

/**
 * Formula SKUs and quantities for an order. Bundles expand into their formulas.
 *
 * @return array{lines: array<string,int>, missing: string[]}
 */
function ev_sf_order_lines( WC_Order $order ) {
	$lines   = array();
	$missing = array();
	foreach ( $order->get_items() as $item ) {
		/** @var WC_Order_Item_Product $item */
		$product = $item->get_product();
		$qty     = (int) $item->get_quantity() - absint( $order->get_qty_refunded_for_item( $item->get_id() ) );
		if ( ! $product || $qty <= 0 ) {
			continue;
		}
		$includes = array_filter( array_map( 'trim', explode( ',', (string) nn_product_field( $product->get_id(), '_nn_includes' ) ) ) );
		$skus     = $includes ? $includes : array( $product->get_sku() );
		foreach ( $skus as $sku ) {
			$sku = strtoupper( (string) $sku );
			if ( '' === $sku ) {
				$missing[] = $product->get_name();
				continue;
			}
			$lines[ $sku ] = ( $lines[ $sku ] ?? 0 ) + $qty;
		}
	}
	return array( 'lines' => $lines, 'missing' => $missing );
}

function ev_sf_address( WC_Order $order, $type ) {
	$get = function ( $field ) use ( $order, $type ) {
		$method = "get_{$type}_{$field}";
		return method_exists( $order, $method ) ? (string) $order->$method() : '';
	};
	if ( 'shipping' === $type && '' === $get( 'address_1' ) ) {
		$type = 'billing';
	}
	$phone = ev_sf_phone( 'shipping' === $type && $order->get_shipping_phone() ? $order->get_shipping_phone() : $order->get_billing_phone() );
	$addr  = array(
		'firstName'    => $get( 'first_name' ),
		'lastName'     => $get( 'last_name' ),
		'company'      => $get( 'company' ),
		'address1'     => $get( 'address_1' ),
		'address2'     => $get( 'address_2' ),
		'city'         => $get( 'city' ),
		'provinceCode' => $get( 'state' ),
		'countryCode'  => $get( 'country' ) ? $get( 'country' ) : 'US',
		'zip'          => $get( 'postcode' ),
		'phone'        => $phone,
	);
	return array_filter( $addr, 'strlen' );
}

/**
 * Build the orderCreate input, or return WP_Error when the order can not be sent.
 */
function ev_sf_build_input( WC_Order $order ) {
	$map   = ev_sf_sku_map();
	$parts = ev_sf_order_lines( $order );
	if ( $parts['missing'] ) {
		return new WP_Error( 'ev_sf_sku', sprintf( __( 'Products without a SKU: %s', 'evenly' ), implode( ', ', $parts['missing'] ) ) );
	}
	if ( ! $parts['lines'] ) {
		return new WP_Error( 'ev_sf_empty', __( 'No items to fulfill.', 'evenly' ) );
	}
	$unmapped = array_diff( array_keys( $parts['lines'] ), array_keys( $map ) );
	if ( $unmapped ) {
		return new WP_Error( 'ev_sf_map', sprintf( __( 'No Shopify variant mapped for: %s (WooCommerce > Supliful).', 'evenly' ), implode( ', ', $unmapped ) ) );
	}
	$phone = ev_sf_phone( $order->get_billing_phone() );
	if ( ! $order->get_billing_email() || ! $phone ) {
		return new WP_Error( 'ev_sf_contact', __( 'Supliful needs the customer email and phone number.', 'evenly' ) );
	}
	$shipping = ev_sf_address( $order, 'shipping' );
	if ( empty( $shipping['address1'] ) || empty( $shipping['zip'] ) ) {
		return new WP_Error( 'ev_sf_address', __( 'Shipping address is incomplete.', 'evenly' ) );
	}

	$line_items = array();
	foreach ( $parts['lines'] as $sku => $qty ) {
		$line_items[] = array( 'variantId' => $map[ $sku ], 'quantity' => (int) $qty );
	}

	$ref = 'WC-' . $order->get_order_number();
	return array(
		'lineItems'        => $line_items,
		'email'            => $order->get_billing_email(),
		'phone'            => $phone,
		'shippingAddress'  => $shipping,
		'billingAddress'   => ev_sf_address( $order, 'billing' ),
		'financialStatus'  => 'PAID',
		'note'             => $ref,
		'tags'             => array( 'evenly-woocommerce' ),
		'sourceIdentifier' => (string) $order->get_id(),
		'customAttributes' => array(
			array( 'key' => 'internal_order_id', 'value' => $ref ),
		),
	);
}

/**
 * Send one order. Safe to call more than once: an order that already has a Shopify ID is skipped.
 *
 * @return true|WP_Error
 */
function ev_sf_push_order( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order ) {
		return new WP_Error( 'ev_sf_order', 'Order not found.' );
	}
	if ( $order->get_meta( EV_SF_META_ID ) ) {
		return true;
	}
	if ( ! ev_sf_ready() ) {
		return new WP_Error( 'ev_sf_config', __( 'Supliful fulfillment is off or not configured.', 'evenly' ) );
	}

	// Lock for 2 minutes so a double "processing" event can not create two Shopify orders.
	$lock = 'ev_sf_lock_' . $order->get_id();
	if ( get_transient( $lock ) ) {
		return new WP_Error( 'ev_sf_locked', 'Already sending.' );
	}
	set_transient( $lock, 1, 120 );

	$input = ev_sf_build_input( $order );
	if ( is_wp_error( $input ) ) {
		delete_transient( $lock );
		ev_sf_hold( $order, $input->get_error_message() );
		return $input;
	}

	$data = ev_sf_graphql(
		'mutation evenlyOrder($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
			orderCreate(order: $order, options: $options) {
				order { id name displayFinancialStatus }
				userErrors { field message }
			}
		}',
		array(
			'order'   => $input,
			'options' => array(
				'sendReceipt'            => false,
				'sendFulfillmentReceipt' => false,
				'inventoryBehaviour'     => 'BYPASS',
			),
		)
	);
	delete_transient( $lock );

	if ( ! is_wp_error( $data ) && ! empty( $data['orderCreate']['userErrors'] ) ) {
		$msgs = array();
		foreach ( $data['orderCreate']['userErrors'] as $e ) {
			$msgs[] = implode( '.', (array) ( $e['field'] ?? array() ) ) . ': ' . ( $e['message'] ?? '' );
		}
		// Validation errors will not fix themselves: hold for a person instead of retrying.
		ev_sf_hold( $order, 'Shopify: ' . implode( '; ', $msgs ) );
		return new WP_Error( 'ev_sf_user', implode( '; ', $msgs ) );
	}
	if ( is_wp_error( $data ) || empty( $data['orderCreate']['order']['id'] ) ) {
		$error = is_wp_error( $data ) ? $data : new WP_Error( 'ev_sf_unknown', 'Shopify returned no order.' );
		ev_sf_retry( $order, $error->get_error_message() );
		return $error;
	}

	$shopify = $data['orderCreate']['order'];
	$order->update_meta_data( EV_SF_META_ID, $shopify['id'] );
	$order->update_meta_data( EV_SF_META_NAME, $shopify['name'] ?? '' );
	$order->delete_meta_data( EV_SF_META_TRIES );
	$order->add_order_note( sprintf( __( 'Sent to Supliful via Shopify order %s.', 'evenly' ), $shopify['name'] ?? $shopify['id'] ) );
	$order->save();
	return true;
}

/**
 * A problem a person must fix. The order goes on hold with a note and an alert email.
 */
function ev_sf_hold( WC_Order $order, $reason ) {
	$order->add_order_note( sprintf( __( 'Not sent to Supliful: %s Fix it, then use the order action "Send to Supliful".', 'evenly' ), $reason ) );
	if ( 'on-hold' !== $order->get_status() ) {
		$order->update_status( 'on-hold' );
	}
	$order->save();
	ev_sf_alert( $order, $reason );
}

/**
 * A temporary failure (network, Shopify down). Retry with backoff, then hold.
 */
function ev_sf_retry( WC_Order $order, $reason ) {
	$tries = (int) $order->get_meta( EV_SF_META_TRIES ) + 1;
	$order->update_meta_data( EV_SF_META_TRIES, $tries );
	$order->save();
	if ( $tries >= EV_SF_MAX_TRIES ) {
		ev_sf_hold( $order, sprintf( 'failed %d times. Last error: %s', $tries, $reason ) );
		return;
	}
	$order->add_order_note( sprintf( 'Supliful send failed (try %d of %d), retrying: %s', $tries, EV_SF_MAX_TRIES, $reason ) );
	ev_sf_schedule( $order->get_id(), 300 * $tries );
}

function ev_sf_alert( WC_Order $order, $reason ) {
	$to = ev_sf( 'alert_email' ) ? ev_sf( 'alert_email' ) : get_option( 'admin_email' );
	wp_mail(
		$to,
		sprintf( '[evenly] Order #%s was not sent to Supliful', $order->get_order_number() ),
		sprintf( "Order #%s needs attention: %s\n\n%s", $order->get_order_number(), $reason, $order->get_edit_order_url() )
	);
}

function ev_sf_schedule( $order_id, $delay = 0 ) {
	$args = array( 'order_id' => (int) $order_id );
	if ( function_exists( 'as_schedule_single_action' ) ) {
		as_schedule_single_action( time() + $delay, EV_SF_HOOK, $args, 'evenly' );
	} else {
		wp_schedule_single_event( time() + $delay, EV_SF_HOOK, $args );
	}
}

add_action( EV_SF_HOOK, function ( $order_id ) {
	ev_sf_push_order( $order_id );
} );

/**
 * Paid orders: Stripe moves them to "processing". Send in the background so checkout stays fast.
 */
add_action( 'woocommerce_order_status_processing', function ( $order_id ) {
	if ( ! ev_sf_ready() || ! ev_sf( 'auto_send' ) ) {
		return;
	}
	$order = wc_get_order( $order_id );
	if ( ! $order || $order->get_meta( EV_SF_META_ID ) || ! ev_sf_is_paid( $order ) ) {
		return;
	}
	ev_sf_schedule( $order_id, 0 );
} );

/* Order screen: a manual "Send to Supliful" action (also used to retry a held order). */
add_filter( 'woocommerce_order_actions', function ( $actions, $order = null ) {
	if ( ev_sf_ready() && ( ! $order || ! $order->get_meta( EV_SF_META_ID ) ) ) {
		$actions['ev_sf_send'] = __( 'Send to Supliful', 'evenly' );
	}
	return $actions;
}, 10, 2 );

add_action( 'woocommerce_order_action_ev_sf_send', function ( WC_Order $order ) {
	if ( ! ev_sf_is_paid( $order ) ) {
		$order->add_order_note( __( 'Not sent to Supliful: the order is not paid.', 'evenly' ) );
		return;
	}
	$order->delete_meta_data( EV_SF_META_TRIES );
	$order->save();
	ev_sf_push_order( $order->get_id() );
	$fresh = wc_get_order( $order->get_id() );
	if ( $fresh && $fresh->get_meta( EV_SF_META_ID ) && 'on-hold' === $fresh->get_status() ) {
		$fresh->update_status( 'processing', __( 'Sent to Supliful.', 'evenly' ) );
	}
} );

/* -------------------------------------------------------------------------
 * Shopify -> Woo: tracking
 * ---------------------------------------------------------------------- */

add_action( 'rest_api_init', function () {
	register_rest_route( 'evenly/v1', '/shopify-webhook', array(
		'methods'             => 'POST',
		'callback'            => 'ev_sf_webhook',
		'permission_callback' => '__return_true', // Authenticated by the HMAC signature below.
	) );
} );

/**
 * Webhooks made in Shopify admin (Settings > Notifications) are signed with the key shown there;
 * webhooks subscribed by an app are signed with the app's client secret. Accept either.
 */
function ev_sf_verify( $raw, $header ) {
	if ( ! $header ) {
		return false;
	}
	foreach ( array_filter( array( ev_sf( 'webhook_secret' ), ev_sf( 'client_secret' ) ) ) as $secret ) {
		$calc = base64_encode( hash_hmac( 'sha256', $raw, $secret, true ) );
		if ( hash_equals( $calc, trim( $header ) ) ) {
			return true;
		}
	}
	return false;
}

function ev_sf_webhook( WP_REST_Request $request ) {
	$raw = $request->get_body();
	if ( ! ev_sf_verify( $raw, $request->get_header( 'x_shopify_hmac_sha256' ) ) ) {
		return new WP_REST_Response( array( 'ok' => false ), 401 );
	}
	$webhook_id = sanitize_text_field( (string) $request->get_header( 'x_shopify_webhook_id' ) );
	if ( $webhook_id ) {
		$seen = 'ev_sf_wh_' . md5( $webhook_id );
		if ( get_transient( $seen ) ) {
			return new WP_REST_Response( array( 'ok' => true, 'duplicate' => true ), 200 );
		}
		set_transient( $seen, 1, DAY_IN_SECONDS );
	}
	$topic   = strtolower( (string) $request->get_header( 'x_shopify_topic' ) );
	$payload = json_decode( $raw, true );
	if ( ! is_array( $payload ) ) {
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	// fulfillments/create|update carry order_id; orders/fulfilled is the order itself.
	if ( isset( $payload['order_id'] ) ) {
		$shopify_order = (string) $payload['order_id'];
		$fulfillment   = $payload;
	} else {
		$shopify_order = (string) ( $payload['id'] ?? '' );
		$fulfillment   = is_array( $payload['fulfillments'] ?? null ) ? end( $payload['fulfillments'] ) : array();
	}
	$order = ev_sf_find_order( $shopify_order );
	if ( ! $order ) {
		return new WP_REST_Response( array( 'ok' => true, 'matched' => false ), 200 );
	}

	if ( 'orders/cancelled' === $topic ) {
		$order->add_order_note( __( 'Shopify/Supliful reports this order was cancelled. Check it and refund the customer in Stripe if needed.', 'evenly' ) );
		ev_sf_alert( $order, 'cancelled in Shopify' );
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	$number  = sanitize_text_field( (string) ( $fulfillment['tracking_number'] ?? ( $fulfillment['tracking_numbers'][0] ?? '' ) ) );
	$company = sanitize_text_field( (string) ( $fulfillment['tracking_company'] ?? '' ) );
	$url     = esc_url_raw( (string) ( $fulfillment['tracking_url'] ?? ( $fulfillment['tracking_urls'][0] ?? '' ) ) );
	if ( ! $number ) {
		return new WP_REST_Response( array( 'ok' => true, 'tracking' => false ), 200 );
	}
	$known = (array) $order->get_meta( EV_SF_META_TRACK );
	if ( isset( $known[ $number ] ) ) {
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}
	$known[ $number ] = array( 'company' => $company, 'url' => $url, 'at' => time() );
	$order->update_meta_data( EV_SF_META_TRACK, $known );
	$order->save();

	// Customer note = WooCommerce emails it to the customer.
	$text = trim( sprintf(
		/* translators: 1: carrier, 2: tracking number, 3: tracking link */
		__( 'Your order is on its way. %1$s tracking number: %2$s %3$s', 'evenly' ),
		$company ? $company : __( 'Carrier', 'evenly' ),
		$number,
		$url
	) );
	$order->add_order_note( $text, true );
	if ( in_array( $order->get_status(), array( 'processing', 'on-hold' ), true ) ) {
		$order->update_status( 'completed', __( 'Shipped by Supliful.', 'evenly' ) );
	}
	return new WP_REST_Response( array( 'ok' => true ), 200 );
}

function ev_sf_find_order( $shopify_order ) {
	$shopify_order = preg_replace( '/\D+/', '', (string) $shopify_order );
	if ( ! $shopify_order ) {
		return null;
	}
	$orders = wc_get_orders( array(
		'limit'      => 1,
		'meta_query' => array( // phpcs:ignore WordPress.DB.SlowDBQuery
			array( 'key' => EV_SF_META_ID, 'value' => 'gid://shopify/Order/' . $shopify_order ),
		),
	) );
	return $orders ? $orders[0] : null;
}

/* Tracking on the customer's "My account > Orders" page. */
add_action( 'woocommerce_order_details_after_order_table', function ( $order ) {
	$known = $order instanceof WC_Order ? (array) $order->get_meta( EV_SF_META_TRACK ) : array();
	if ( ! $known ) {
		return;
	}
	echo '<section class="ev-tracking"><h2>' . esc_html__( 'Tracking', 'evenly' ) . '</h2><ul>';
	foreach ( $known as $number => $t ) {
		$label = trim( ( $t['company'] ?? '' ) . ' ' . $number );
		echo '<li>' . ( ! empty( $t['url'] ) ? '<a href="' . esc_url( $t['url'] ) . '" rel="noopener" target="_blank">' . esc_html( $label ) . '</a>' : esc_html( $label ) ) . '</li>';
	}
	echo '</ul></section>';
} );

/* Admin notice when fulfillment is off, so orders are not silently left unshipped. */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_woocommerce' ) || ev_sf_ready() ) {
		return;
	}
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( $screen && false === strpos( (string) $screen->id, 'shop_order' ) && false === strpos( (string) $screen->id, 'wc-orders' ) ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p>%s <a href="%s">%s</a></p></div>',
		esc_html__( 'Supliful fulfillment is not connected: paid orders are not being shipped automatically.', 'evenly' ),
		esc_url( admin_url( 'admin.php?page=evenly-supliful' ) ),
		esc_html__( 'Connect it', 'evenly' )
	);
} );
