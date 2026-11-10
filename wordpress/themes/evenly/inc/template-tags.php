<?php
/**
 * Small template helpers. Everything degrades gracefully if the Core plugin is off.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

/**
 * Read a store setting from the Core plugin, with a fallback.
 */
function nn_theme_option( $key, $fallback = '' ) {
	return function_exists( 'nn_option' ) ? nn_option( $key ) : $fallback;
}

/**
 * Accent color per concern slug. Read from the term's nn_color field (set by the seeder),
 * falling back to the brand palette.
 */
function nn_concern_color( $slug ) {
	$term = get_term_by( 'slug', $slug, 'product_cat' );
	if ( $term ) {
		$color = sanitize_hex_color( get_term_meta( $term->term_id, 'nn_color', true ) );
		if ( $color ) {
			return $color;
		}
	}
	$map = array(
		'sleep'          => '#4B2BB8',
		'period-comfort' => '#F0503F',
		'bloating-gut'   => '#3E9B2F',
		'stress-calm'    => '#E5951A',
		'bundles'        => '#0B0B0C',
	);
	return isset( $map[ $slug ] ) ? $map[ $slug ] : '#0B0B0C';
}

/**
 * URL of a bundled theme image (assets/img).
 */
function nn_img( $file ) {
	return get_template_directory_uri() . '/assets/img/' . ltrim( $file, '/' );
}

/**
 * Concern hub photo (term meta nn_image = file in assets/img).
 */
function nn_concern_image( $term ) {
	$file = get_term_meta( $term->term_id, 'nn_image', true );
	return $file ? nn_img( $file ) : '';
}

/**
 * EVENLY logo: "=" mark + wordmark. A Custom Logo set in the Customizer replaces it.
 */
function nn_logo( $size = 26 ) {
	printf(
		'<svg class="ev-mark" width="%1$d" height="%1$d" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="7" fill="#F0503F"/><rect x="7" y="10" width="18" height="4" rx="2" fill="#fff"/><rect x="7" y="18" width="18" height="4" rx="2" fill="#fff"/></svg><span class="ev-wordmark">%2$s</span>',
		(int) $size,
		esc_html( nn_theme_option( 'business_name', 'Evenly' ) )
	);
}

/**
 * Site icon fallback when none is uploaded in Settings > General.
 */
add_action( 'wp_head', function () {
	if ( ! has_site_icon() ) {
		echo '<link rel="icon" href="' . esc_url( nn_img( 'mark.svg' ) ) . '" type="image/svg+xml">' . "\n";
	}
} );

/**
 * The concern hubs (product categories), in menu order, excluding "Uncategorized".
 *
 * @return WP_Term[]
 */
function nn_get_concerns( $include_bundles = false ) {
	if ( ! taxonomy_exists( 'product_cat' ) ) {
		return array();
	}
	$terms = get_terms( array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => false,
		'parent'     => 0,
		'orderby'    => 'menu_order', // WooCommerce's drag-and-drop category order.
		'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
	) );
	if ( is_wp_error( $terms ) ) {
		return array();
	}
	if ( ! $include_bundles ) {
		$terms = array_values( array_filter( $terms, function ( $t ) {
			return 'bundles' !== $t->slug;
		} ) );
	}
	return $terms;
}

/**
 * Announcement bar.
 */
function nn_announcement() {
	$text = nn_theme_option( 'announcement' );
	if ( $text ) {
		echo '<div class="nn-announce"><p>' . esc_html( $text ) . '</p></div>';
	}
}

/**
 * Footer menu with a sensible fallback before menus are assigned.
 */
function nn_footer_menu( $location, $title ) {
	echo '<nav class="nn-footer__col" aria-label="' . esc_attr( $title ) . '"><p class="nn-footer__title">' . esc_html( $title ) . '</p>';
	if ( has_nav_menu( $location ) ) {
		wp_nav_menu( array( 'theme_location' => $location, 'container' => false, 'depth' => 1 ) );
	}
	echo '</nav>';
}

/**
 * Reading time for blog posts (helps engagement signals).
 */
function nn_reading_time( $post_id = null ) {
	$words = str_word_count( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ) );
	return max( 1, (int) round( $words / 230 ) );
}
