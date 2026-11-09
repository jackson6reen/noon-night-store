<?php
/**
 * Settings > Noon Night: business details used across legal pages, footer and tracking.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

add_action( 'admin_menu', function () {
	add_options_page(
		__( 'Noon Night', 'noon-night' ),
		__( 'Noon Night', 'noon-night' ),
		'manage_options',
		'noon-night',
		'nn_render_settings_page'
	);
} );

add_action( 'admin_init', function () {
	register_setting(
		'nn_settings_group',
		'nn_settings',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'nn_sanitize_settings',
			'default'           => array(),
		)
	);
} );

/**
 * Field definitions: key => [label, type, help].
 */
function nn_settings_fields() {
	return array(
		'business_name'  => array( __( 'Brand name', 'noon-night' ), 'text', '' ),
		'legal_entity'   => array( __( 'Legal entity', 'noon-night' ), 'text', __( 'Shown in Terms, Privacy and the footer. Required before launch.', 'noon-night' ) ),
		'address'        => array( __( 'Business address', 'noon-night' ), 'text', __( 'A real mailing address builds trust and is required in several policies.', 'noon-night' ) ),
		'support_email'  => array( __( 'Support email', 'noon-night' ), 'email', '' ),
		'phone'          => array( __( 'Support phone (optional)', 'noon-night' ), 'text', '' ),
		'state_of_law'   => array( __( 'Governing-law state', 'noon-night' ), 'text', '' ),
		'free_ship_min'  => array( __( 'Free shipping threshold (USD)', 'noon-night' ), 'number', __( 'Must match your WooCommerce free-shipping rule.', 'noon-night' ) ),
		'guarantee_days' => array( __( 'Money-back guarantee (days)', 'noon-night' ), 'number', '' ),
		'announcement'   => array( __( 'Announcement bar text', 'noon-night' ), 'text', '' ),
		'ga4_id'         => array( __( 'GA4 Measurement ID', 'noon-night' ), 'text', __( 'G-XXXXXXX. Loads only after the visitor accepts analytics cookies.', 'noon-night' ) ),
		'meta_pixel_id'  => array( __( 'Meta Pixel ID', 'noon-night' ), 'text', __( 'Loads only after marketing consent, never when the browser sends Global Privacy Control.', 'noon-night' ) ),
		'policy_updated' => array( __( 'Policies last updated (YYYY-MM-DD)', 'noon-night' ), 'text', '' ),
	);
}

/**
 * Sanitize every field by type.
 *
 * @param mixed $input Raw input.
 * @return array
 */
function nn_sanitize_settings( $input ) {
	$clean = array();
	if ( ! is_array( $input ) ) {
		return $clean;
	}
	foreach ( nn_settings_fields() as $key => $field ) {
		if ( ! isset( $input[ $key ] ) ) {
			continue;
		}
		$value = wp_unslash( $input[ $key ] );
		switch ( $field[1] ) {
			case 'email':
				$clean[ $key ] = sanitize_email( $value );
				break;
			case 'number':
				$clean[ $key ] = absint( $value );
				break;
			default:
				$clean[ $key ] = sanitize_text_field( $value );
		}
	}
	foreach ( array( 'ga4_id', 'meta_pixel_id' ) as $id_key ) {
		if ( isset( $clean[ $id_key ] ) ) {
			$clean[ $id_key ] = preg_replace( '/[^A-Za-z0-9\-]/', '', $clean[ $id_key ] );
		}
	}
	return $clean;
}

function nn_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Noon Night settings', 'noon-night' ); ?></h1>
		<p><?php esc_html_e( 'These values feed the legal pages (via shortcodes), footer, announcement bar and consent-gated tracking.', 'noon-night' ); ?></p>
		<form method="post" action="options.php">
			<?php settings_fields( 'nn_settings_group' ); ?>
			<table class="form-table" role="presentation">
				<?php foreach ( nn_settings_fields() as $key => $field ) : ?>
					<tr>
						<th scope="row"><label for="nn_<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $field[0] ); ?></label></th>
						<td>
							<input class="regular-text" type="<?php echo esc_attr( $field[1] ); ?>" id="nn_<?php echo esc_attr( $key ); ?>" name="nn_settings[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( nn_option( $key ) ); ?>">
							<?php if ( $field[2] ) : ?>
								<p class="description"><?php echo esc_html( $field[2] ); ?></p>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

/**
 * Admin notice until the legal placeholders are filled in.
 */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	if ( false !== strpos( nn_option( 'legal_entity' ), '[' ) || false !== strpos( nn_option( 'address' ), '[' ) ) {
		printf(
			'<div class="notice notice-warning"><p>%s <a href="%s">%s</a></p></div>',
			esc_html__( 'Noon Night: your legal entity and business address are still placeholders. Legal pages show them to customers.', 'noon-night' ),
			esc_url( admin_url( 'options-general.php?page=noon-night' ) ),
			esc_html__( 'Fill them in', 'noon-night' )
		);
	}
} );
