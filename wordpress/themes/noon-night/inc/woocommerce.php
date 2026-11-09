<?php
/**
 * WooCommerce integration through hooks only. No template overrides, so
 * WooCommerce updates never leave us with outdated template copies.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

// Our own content wrappers instead of WooCommerce's generic ones.
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );

add_action( 'woocommerce_before_main_content', function () {
	echo '<main id="main" class="nn-main nn-shop"><div class="nn-container">';
}, 10 );
add_action( 'woocommerce_after_main_content', function () {
	echo '</div></main>';
}, 10 );

// Breadcrumb styling.
add_filter( 'woocommerce_breadcrumb_defaults', function ( $args ) {
	$args['delimiter']   = '<span aria-hidden="true"> / </span>';
	$args['wrap_before'] = '<nav class="nn-breadcrumb" aria-label="' . esc_attr__( 'Breadcrumb', 'noon-night' ) . '">';
	$args['wrap_after']  = '</nav>';
	return $args;
} );

/**
 * Concern hub header: icon + tagline above the grid.
 */
add_action( 'woocommerce_archive_description', function () {
	if ( ! is_product_category() || ! function_exists( 'nn_concern_field' ) ) {
		return;
	}
	$term    = get_queried_object();
	$tagline = nn_concern_field( $term->term_id, 'nn_tagline' );
	if ( $tagline ) {
		printf(
			'<p class="nn-hub-tagline" style="--accent:%s">%s %s</p>',
			esc_attr( nn_concern_color( $term->slug ) ),
			nn_icon( nn_concern_field( $term->term_id, 'nn_icon' ) ?: 'leaf', 20 ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			esc_html( $tagline )
		);
	}
}, 5 );

/**
 * Concern filter chips on shop and category pages.
 */
add_action( 'woocommerce_before_shop_loop', function () {
	$current = is_product_category() ? get_queried_object_id() : 0;
	echo '<nav class="nn-chips" aria-label="' . esc_attr__( 'Shop by concern', 'noon-night' ) . '">';
	printf(
		'<a href="%s"%s>%s</a>',
		esc_url( wc_get_page_permalink( 'shop' ) ),
		$current ? '' : ' aria-current="page"',
		esc_html__( 'All', 'noon-night' )
	);
	foreach ( nn_get_concerns( true ) as $term ) {
		printf(
			'<a href="%s"%s>%s</a>',
			esc_url( get_term_link( $term ) ),
			$current === $term->term_id ? ' aria-current="page"' : '',
			esc_html( $term->name )
		);
	}
	echo '</nav>';
}, 5 );

/**
 * Product cards: show the tagline under the title.
 */
add_action( 'woocommerce_after_shop_loop_item_title', function () {
	if ( function_exists( 'nn_product_field' ) ) {
		$tagline = nn_product_field( get_the_ID(), '_nn_tagline' );
		if ( $tagline ) {
			echo '<p class="nn-card-tagline">' . esc_html( $tagline ) . '</p>';
		}
	}
}, 7 );

/**
 * Until real photos are uploaded, draw a bottle tinted by the product's first concern.
 */
function nn_product_bottle( WC_Product $product ) {
	$terms  = get_the_terms( $product->get_id(), 'product_cat' );
	$accent = ( $terms && ! is_wp_error( $terms ) ) ? nn_concern_color( $terms[0]->slug ) : '#3B2A5A';
	$name   = preg_replace( '/:.*$/', '', $product->get_name() );
	return '<span class="nn-placeholder">' . nn_bottle_svg( $name, $accent ) . '</span>';
}

add_filter( 'woocommerce_placeholder_img', function ( $html ) {
	global $product;
	return $product instanceof WC_Product ? nn_product_bottle( $product ) : $html;
} );

// Single product gallery uses its own placeholder markup.
add_filter( 'woocommerce_single_product_image_thumbnail_html', function ( $html, $attachment_id ) {
	global $product;
	if ( $attachment_id || ! $product instanceof WC_Product ) {
		return $html;
	}
	return '<div class="woocommerce-product-gallery__image--placeholder">' . nn_product_bottle( $product ) . '</div>';
}, 10, 2 );

/**
 * Header cart count stays fresh after AJAX add-to-cart.
 */
add_filter( 'woocommerce_add_to_cart_fragments', function ( $fragments ) {
	ob_start();
	nn_cart_count();
	$fragments['span.nn-cart-count'] = ob_get_clean();
	return $fragments;
} );

function nn_cart_count() {
	$count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
	printf(
		'<span class="nn-cart-count" aria-label="%s">%s</span>',
		/* translators: %d: items in cart */
		esc_attr( sprintf( _n( '%d item in cart', '%d items in cart', $count, 'noon-night' ), $count ) ),
		esc_html( $count )
	);
}

/**
 * Mobile sticky add-to-cart bar on single products.
 */
add_action( 'woocommerce_after_single_product', function () {
	global $product;
	if ( ! $product || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
		return;
	}
	printf(
		'<div class="nn-sticky-atc" hidden><span class="nn-sticky-atc__name">%s</span><span class="nn-sticky-atc__price">%s</span><button type="button" class="nn-btn" data-nn-sticky-atc>%s</button></div>',
		esc_html( $product->get_name() ),
		wp_kses_post( $product->get_price_html() ),
		esc_html__( 'Add to cart', 'noon-night' )
	);
} );

// Related products: 3 across.
add_filter( 'woocommerce_output_related_products_args', function ( $args ) {
	$args['posts_per_page'] = 3;
	$args['columns']        = 3;
	return $args;
} );

add_filter( 'loop_shop_columns', function () {
	return 3;
} );
