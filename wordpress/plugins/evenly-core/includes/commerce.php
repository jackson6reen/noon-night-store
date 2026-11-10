<?php
/**
 * Conversion helpers: free-shipping progress bar and trust row under add-to-cart.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

/**
 * HTML for the free-shipping progress bar, based on the current cart.
 */
function nn_free_shipping_bar() {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return '';
	}
	$min      = (float) nn_option( 'free_ship_min' );
	$subtotal = (float) WC()->cart->get_displayed_subtotal();
	if ( $min <= 0 ) {
		return '';
	}
	$left = max( 0, $min - $subtotal );
	$pct  = min( 100, round( ( $subtotal / $min ) * 100 ) );
	$msg  = $left > 0
		/* translators: %s: amount left */
		? sprintf( __( "You're %s away from free shipping", 'evenly' ), wc_price( $left ) )
		: __( 'You unlocked free US shipping', 'evenly' );

	return sprintf(
		'<div class="nn-ship-bar" role="status"><p>%s</p><div class="nn-ship-bar__track" aria-hidden="true"><span style="width:%d%%"></span></div></div>',
		wp_kses_post( $msg ),
		(int) $pct
	);
}

add_action( 'woocommerce_before_cart', function () {
	echo nn_free_shipping_bar(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside.
} );
add_action( 'woocommerce_before_mini_cart', function () {
	echo nn_free_shipping_bar(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
} );
// Block-based cart page.
add_filter( 'render_block_woocommerce/cart', function ( $html ) {
	return nn_free_shipping_bar() . $html;
} );

/**
 * Trust row under the add-to-cart button.
 */
add_action( 'woocommerce_after_add_to_cart_form', function () {
	$days = (int) nn_option( 'guarantee_days' );
	$min  = (int) nn_option( 'free_ship_min' );
	echo '<ul class="nn-trust-row">';
	/* translators: %d: days */
	echo '<li>' . esc_html( sprintf( __( '%d-day money-back guarantee', 'evenly' ), $days ) ) . '</li>';
	/* translators: %d: dollar threshold */
	echo '<li>' . esc_html( sprintf( __( 'Free US shipping over $%d', 'evenly' ), $min ) ) . '</li>';
	echo '<li>' . esc_html__( 'Made in the USA · cGMP facility', 'evenly' ) . '</li>';
	echo '<li>' . esc_html__( 'Secure checkout by Stripe', 'evenly' ) . '</li>';
	echo '</ul>';
}, 5 );
