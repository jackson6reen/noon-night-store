<?php
/**
 * Local test for the Supliful (headless Shopify) bridge. Runs only inside WordPress Playground:
 * Shopify is mocked with pre_http_request, so no real request or order is ever made.
 * Open http://localhost:9400/ev-test/fulfillment-test.php
 */
require '/wordpress/wp-load.php';
header( 'Content-Type: text/plain; charset=utf-8' );
if ( 'localhost' !== parse_url( home_url(), PHP_URL_HOST ) && '127.0.0.1' !== parse_url( home_url(), PHP_URL_HOST ) ) {
	exit( 'Playground only.' );
}

$results = array();
$check   = function ( $name, $ok, $detail = '' ) use ( &$results ) {
	$results[] = ( $ok ? 'PASS ' : 'FAIL ' ) . $name . ( $detail ? "  ($detail)" : '' );
};

$map = "EV-UNWIND | 1001\nEV-SLEEP | 1002\nEV-CYCLE | 1003\nEV-DIGEST | 1004\nEV-FLORA | 1005\nEV-RESTORE | 1006";
update_option( EV_SF_OPTION, array(
	'enabled' => 1, 'auto_send' => 1, 'shop' => 'evenly-test.myshopify.com', 'api_version' => '2026-10',
	'token' => 'shpat_test_only', 'webhook_secret' => 'whsec_test_only', 'sku_map' => $map, 'alert_email' => 'alerts@example.test',
) );

// Mock Shopify.
$GLOBALS['ev_sent']   = array();
$GLOBALS['ev_mode']   = 'ok';
add_filter( 'pre_http_request', function ( $pre, $args, $url ) {
	if ( false === strpos( $url, 'myshopify.com' ) ) {
		return $pre;
	}
	if ( false !== strpos( $url, '/admin/oauth/access_token' ) ) {
		$GLOBALS['ev_token_calls'] = ( $GLOBALS['ev_token_calls'] ?? 0 ) + 1;
		$ok = 'cc_secret_test' === ( $args['body']['client_secret'] ?? '' ) && 'client_credentials' === ( $args['body']['grant_type'] ?? '' );
		return array( 'response' => array( 'code' => $ok ? 200 : 400 ), 'body' => wp_json_encode( $ok ? array( 'access_token' => 'cc_token_abc', 'scope' => 'write_orders', 'expires_in' => 86399 ) : array( 'error' => 'invalid_client' ) ), 'headers' => array() );
	}
	$GLOBALS['ev_sent'][]= array( 'url' => $url, 'headers' => $args['headers'], 'body' => json_decode( $args['body'], true ) );
	if ( 'down' === $GLOBALS['ev_mode'] ) {
		return array( 'response' => array( 'code' => 503 ), 'body' => 'unavailable', 'headers' => array() );
	}
	$payload = 'usererror' === $GLOBALS['ev_mode']
		? array( 'data' => array( 'orderCreate' => array( 'order' => null, 'userErrors' => array( array( 'field' => array( 'order', 'shippingAddress', 'zip' ), 'message' => 'is invalid' ) ) ) ) )
		: array( 'data' => array( 'orderCreate' => array( 'order' => array( 'id' => 'gid://shopify/Order/' . ( 555000 + count( $GLOBALS['ev_sent'] ) + wp_rand( 1000, 999999 ) * 1000 ), 'name' => '#1001', 'displayFinancialStatus' => 'PAID' ), 'userErrors' => array() ) ) );
	return array( 'response' => array( 'code' => 200 ), 'body' => wp_json_encode( $payload ), 'headers' => array() );
}, 10, 3 );
add_filter( 'pre_wp_mail', '__return_true' );

$make_order = function ( $items, $phone = '(415) 555-0134' ) {
	$order = wc_create_order();
	foreach ( $items as $sku => $qty ) {
		$order->add_product( wc_get_product( wc_get_product_id_by_sku( $sku ) ), $qty );
	}
	$addr = array( 'first_name' => 'Test', 'last_name' => 'Buyer', 'address_1' => '1 Market St', 'city' => 'San Francisco', 'state' => 'CA', 'postcode' => '94105', 'country' => 'US', 'email' => 'buyer@example.test', 'phone' => $phone );
	$order->set_address( $addr, 'billing' );
	unset( $addr['email'], $addr['phone'] );
	$order->set_address( $addr, 'shipping' );
	$order->set_payment_method( 'stripe' );
	$order->calculate_totals();
	$order->save();
	return $order;
};

/* 1. Paid order with a kit + a single formula. */
$order = $make_order( array( 'EV-KIT-SLEEP' => 1, 'EV-UNWIND' => 2 ) );
$order->payment_complete( 'pi_test_123' );
$check( 'payment sets processing', 'processing' === wc_get_order( $order->get_id() )->get_status() );
$pending = function_exists( 'as_get_scheduled_actions' ) ? as_get_scheduled_actions( array( 'hook' => EV_SF_HOOK, 'args' => array( 'order_id' => $order->get_id() ), 'status' => 'pending' ), 'ids' ) : array();
$check( 'send is queued in the background', count( $pending ) >= 1 );

ev_sf_push_order( $order->get_id() );
$o    = wc_get_order( $order->get_id() );
$sent = end( $GLOBALS['ev_sent'] );
$in   = $sent['body']['variables']['order'];
$lines = array();
foreach ( $in['lineItems'] as $li ) {
	$lines[ $li['variantId'] ] = $li['quantity'];
}
$check( 'endpoint + token header', 'https://evenly-test.myshopify.com/admin/api/2026-10/graphql.json' === $sent['url'] && 'shpat_test_only' === $sent['headers']['X-Shopify-Access-Token'] );
$check( 'kit expanded: Unwind 1+2=3, Sleep 1', 3 === ( $lines['gid://shopify/ProductVariant/1001'] ?? 0 ) && 1 === ( $lines['gid://shopify/ProductVariant/1002'] ?? 0 ) && 2 === count( $lines ), wp_json_encode( $lines ) );
$check( 'marked PAID, receipts off', 'PAID' === $in['financialStatus'] && false === $sent['body']['variables']['options']['sendReceipt'] );
$check( 'phone in E.164 on order + address', '+14155550134' === $in['phone'] && '+14155550134' === $in['shippingAddress']['phone'] );
$check( 'address mapped', 'CA' === $in['shippingAddress']['provinceCode'] && '94105' === $in['shippingAddress']['zip'] && 'US' === $in['shippingAddress']['countryCode'] );
$sid = (string) $o->get_meta( EV_SF_META_ID );
$check( 'Shopify ID saved', 0 === strpos( $sid, 'gid://shopify/Order/' ) );

/* 2. Idempotent: a second call sends nothing. */
$count = count( $GLOBALS['ev_sent'] );
ev_sf_push_order( $order->get_id() );
$check( 'no duplicate Shopify order', count( $GLOBALS['ev_sent'] ) === $count );

/* 3. Tracking webhook: bad signature rejected, good one completes the order. */
$body = wp_json_encode( array( 'id' => 9001, 'order_id' => (int) substr( strrchr( $sid, '/' ), 1 ), 'status' => 'success', 'tracking_company' => 'USPS', 'tracking_number' => '9400100000000000000000', 'tracking_url' => 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400100000000000000000' ) );
$send_hook = function ( $body, $hmac, $id ) {
	$req = new WP_REST_Request( 'POST', '/evenly/v1/shopify-webhook' );
	$req->set_body( $body );
	$req->set_header( 'X-Shopify-Hmac-Sha256', $hmac );
	$req->set_header( 'X-Shopify-Topic', 'fulfillments/create' );
	$req->set_header( 'X-Shopify-Webhook-Id', $id );
	return rest_do_request( $req );
};
$check( 'bad HMAC -> 401', 401 === $send_hook( $body, 'bad', 'w1-' . $sid )->get_status() );
$good = base64_encode( hash_hmac( 'sha256', $body, 'whsec_test_only', true ) );
$res  = $send_hook( $body, $good, 'w2-' . $sid );
$o    = wc_get_order( $order->get_id() );
$notes = wc_get_order_notes( array( 'order_id' => $o->get_id(), 'type' => 'customer' ) );
$check( 'good HMAC -> 200', 200 === $res->get_status() );
$check( 'order completed', 'completed' === $o->get_status() );
$check( 'customer emailed tracking note', $notes && false !== strpos( $notes[0]->content, '9400100000000000000000' ) );
$send_hook( $body, $good, 'w2-' . $sid );
$check( 'duplicate webhook ignored', 1 === count( wc_get_order_notes( array( 'order_id' => $o->get_id(), 'type' => 'customer' ) ) ) );

/* 4. Unmapped product -> on hold, nothing sent. */
$count = count( $GLOBALS['ev_sent'] );
$o2    = $make_order( array( 'EV-CALM' => 1 ) );
$o2->payment_complete( 'pi_test_456' );
ev_sf_push_order( $o2->get_id() );
$o2 = wc_get_order( $o2->get_id() );
$check( 'unmapped SKU -> on-hold, not sent', 'on-hold' === $o2->get_status() && count( $GLOBALS['ev_sent'] ) === $count && ! $o2->get_meta( EV_SF_META_ID ) );

/* 5. Missing phone -> on hold. */
$o3 = $make_order( array( 'EV-DIGEST' => 1 ), '' );
$o3->payment_complete( 'pi_test_789' );
ev_sf_push_order( $o3->get_id() );
$check( 'missing phone -> on-hold', 'on-hold' === wc_get_order( $o3->get_id() )->get_status() );

/* 6. Shopify validation error -> on hold (no retry loop). */
$GLOBALS['ev_mode'] = 'usererror';
$o4 = $make_order( array( 'EV-FLORA' => 1 ) );
$o4->payment_complete( 'pi_test_aaa' );
ev_sf_push_order( $o4->get_id() );
$check( 'Shopify userErrors -> on-hold', 'on-hold' === wc_get_order( $o4->get_id() )->get_status() );

/* 7. Shopify down -> retry scheduled, order stays processing. */
$GLOBALS['ev_mode'] = 'down';
$o5 = $make_order( array( 'EV-RESTORE' => 1 ) );
$o5->payment_complete( 'pi_test_bbb' );
ev_sf_push_order( $o5->get_id() );
$o5 = wc_get_order( $o5->get_id() );
$check( 'Shopify down -> retry 1 of 5, still processing', 1 === (int) $o5->get_meta( EV_SF_META_TRIES ) && 'processing' === $o5->get_status() );

/* 8. Retry via order action after the fix. */
$GLOBALS['ev_mode'] = 'ok';
do_action( 'woocommerce_order_action_ev_sf_send', wc_get_order( $o4->get_id() ) );
$o4 = wc_get_order( $o4->get_id() );
$check( 'manual "Send to Supliful" re-sends held order', $o4->get_meta( EV_SF_META_ID ) && 'processing' === $o4->get_status() );

/* 9. Dev Dashboard app: client ID + secret -> client-credentials token, cached; webhook signed with the client secret. */
update_option( EV_SF_OPTION, array_merge( get_option( EV_SF_OPTION ), array( 'token' => '', 'webhook_secret' => '', 'client_id' => 'cc_id_test', 'client_secret' => 'cc_secret_test' ) ) );
foreach ( array( 'ev_sf_cc_token_' . md5( 'evenly-test.myshopify.com' . 'cc_id_test' ) ) as $t ) {
	delete_transient( $t );
}
$GLOBALS['ev_token_calls'] = 0;
$o6 = $make_order( array( 'EV-CYCLE' => 1 ) );
$o6->payment_complete( 'pi_test_ccc' );
ev_sf_push_order( $o6->get_id() );
$o7 = $make_order( array( 'EV-SLEEP' => 1 ) );
$o7->payment_complete( 'pi_test_ddd' );
ev_sf_push_order( $o7->get_id() );
$last = end( $GLOBALS['ev_sent'] );
$check( 'client credentials: token used + cached (1 token request for 2 orders)', 'cc_token_abc' === $last['headers']['X-Shopify-Access-Token'] && 1 === $GLOBALS['ev_token_calls'] && wc_get_order( $o7->get_id() )->get_meta( EV_SF_META_ID ), 'token calls: ' . $GLOBALS['ev_token_calls'] );
$sid7  = (string) wc_get_order( $o7->get_id() )->get_meta( EV_SF_META_ID );
$body7 = wp_json_encode( array( 'id' => 9002, 'order_id' => (int) substr( strrchr( $sid7, '/' ), 1 ), 'tracking_company' => 'UPS', 'tracking_number' => '1Z999AA10123456784' ) );
$res7  = $send_hook( $body7, base64_encode( hash_hmac( 'sha256', $body7, 'cc_secret_test', true ) ), 'w3-' . $sid7 );
$check( 'webhook signed with client secret accepted', 200 === $res7->get_status() && 'completed' === wc_get_order( $o7->get_id() )->get_status() );

$check( 'phone required (block checkout option)', 'required' === get_option( 'woocommerce_checkout_phone_field' ) );
$fields = WC()->countries->get_address_fields( 'US', 'billing_' );
$check( 'phone required (classic checkout field)', ! empty( $fields['billing_phone']['required'] ) );

echo implode( "\n", $results ), "\n\n", count( array_filter( $results, function ( $r ) { return 0 === strpos( $r, 'PASS' ); } ) ), ' / ', count( $results ), " passed\n";
