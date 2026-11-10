<?php
/**
 * "Buy 2, get 1 free": for every 3 single formulas in the cart, the cheapest one is free.
 * Bundles (products with _nn_includes) are already discounted and don't count.
 * Calculated server-side as a negative cart fee, so it can't be tampered with in the browser.
 *
 * Also handles two cart links:
 *   /?ev_build[]=SKU&ev_build[]=SKU&ev_build[]=SKU  "Build your 3" form → adds 3 items, opens cart
 *   /?nn_cart=SKU:QTY,SKU:QTY                        hand-off from the Vercel preview → replaces cart, opens checkout
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

function nn_offer_enabled() {
	return (bool) nn_option( 'offer_enabled' );
}

function nn_is_bundle( $product_id ) {
	return '' !== (string) get_post_meta( $product_id, '_nn_includes', true );
}

add_action( 'woocommerce_cart_calculate_fees', function ( $cart ) {
	if ( ! nn_offer_enabled() || ( is_admin() && ! wp_doing_ajax() ) ) {
		return;
	}
	$units = array();
	foreach ( $cart->get_cart() as $item ) {
		if ( nn_is_bundle( $item['product_id'] ) ) {
			continue;
		}
		$price = (float) $item['data']->get_price();
		for ( $i = 0; $i < (int) $item['quantity']; $i++ ) {
			$units[] = $price;
		}
	}
	sort( $units );
	$free     = intdiv( count( $units ), 3 );
	$discount = array_sum( array_slice( $units, 0, $free ) );
	if ( $discount > 0 ) {
		$cart->add_fee( nn_option( 'offer_label' ), -$discount, false );
	}
} );

/**
 * Turn a list of SKUs into cart items.
 *
 * @param array $pairs [sku => qty].
 */
function nn_fill_cart( array $pairs, $empty_first ) {
	if ( null === WC()->cart ) {
		wc_load_cart();
	}
	if ( $empty_first ) {
		WC()->cart->empty_cart();
	}
	foreach ( $pairs as $sku => $qty ) {
		$product_id = wc_get_product_id_by_sku( $sku );
		if ( $product_id ) {
			WC()->cart->add_to_cart( $product_id, $qty );
		}
	}
}

add_action( 'wp_loaded', function () {
	if ( is_admin() || ! function_exists( 'WC' ) ) {
		return;
	}
	// phpcs:disable WordPress.Security.NonceVerification -- public, idempotent add-to-cart links (like WooCommerce's own ?add-to-cart=).
	if ( isset( $_GET['ev_build'] ) && is_array( $_GET['ev_build'] ) ) {
		$skus  = array_slice( array_unique( array_map( 'wc_clean', wp_unslash( $_GET['ev_build'] ) ) ), 0, 3 );
		$pairs = array_fill_keys( $skus, 1 );
		nn_fill_cart( $pairs, false );
		wp_safe_redirect( wc_get_cart_url() );
		exit;
	}
	if ( ! empty( $_GET['nn_cart'] ) ) {
		$raw   = sanitize_text_field( wp_unslash( $_GET['nn_cart'] ) );
		$pairs = array();
		foreach ( array_slice( array_filter( explode( ',', $raw ) ), 0, 50 ) as $pair ) {
			$parts = explode( ':', $pair );
			$sku   = isset( $parts[0] ) ? wc_clean( rawurldecode( $parts[0] ) ) : '';
			if ( '' !== $sku ) {
				$pairs[ $sku ] = isset( $parts[1] ) ? max( 1, min( 99, absint( $parts[1] ) ) ) : 1;
			}
		}
		nn_fill_cart( $pairs, true );
		wp_safe_redirect( wc_get_checkout_url() );
		exit;
	}
	// phpcs:enable
} );

/**
 * Nudge in the cart: how many more formulas until one is free.
 */
function nn_offer_nudge() {
	if ( ! nn_offer_enabled() || ! WC()->cart ) {
		return '';
	}
	$singles = 0;
	foreach ( WC()->cart->get_cart() as $item ) {
		if ( ! nn_is_bundle( $item['product_id'] ) ) {
			$singles += (int) $item['quantity'];
		}
	}
	if ( ! $singles ) {
		return '';
	}
	$to_next = 3 - ( $singles % 3 );
	if ( 3 === $to_next ) {
		$msg = sprintf( '<strong>%s</strong> %s', esc_html__( 'Your free formula is applied!', 'evenly' ), esc_html( nn_option( 'offer_label' ) ) );
	} else {
		/* translators: %d: formulas to add */
		$msg = sprintf( __( 'Add <strong>%d more formula(s)</strong> and the 3rd one is free.', 'evenly' ), $to_next );
	}
	return '<p class="ev-offer-note" role="status">' . wp_kses_post( $msg ) . '</p>';
}
add_action( 'woocommerce_before_cart', function () {
	echo nn_offer_nudge(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}, 20 );
add_filter( 'render_block_woocommerce/cart', function ( $html ) {
	return nn_offer_nudge() . $html;
}, 20 );

/**
 * Offer note on single formula pages.
 */
add_action( 'woocommerce_single_product_summary', function () {
	if ( ! nn_offer_enabled() || nn_is_bundle( get_the_ID() ) ) {
		return;
	}
	printf(
		'<p class="ev-offer-note"><span class="nn-badge">%s</span> <span>%s</span></p>',
		esc_html( nn_option( 'offer_label' ) ),
		wp_kses_post( __( 'Add any 3 formulas and <strong>the cheapest is free</strong>. Applied in your cart.', 'evenly' ) )
	);
}, 25 );
