<?php
/**
 * Small template helpers. Everything degrades gracefully if the Core plugin is off.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

/**
 * Read a store setting from the Core plugin, with a fallback.
 */
function nn_theme_option( $key, $fallback = '' ) {
	return function_exists( 'nn_option' ) ? nn_option( $key ) : $fallback;
}

/**
 * Accent color per concern slug (used for tiles and drawn bottles).
 */
function nn_concern_color( $slug ) {
	$map = array(
		'sleep'          => '#3B2A5A',
		'period-comfort' => '#C2563A',
		'bloating-gut'   => '#4F7A4A',
		'stress-calm'    => '#5C6FA8',
		'bundles'        => '#8A5A83',
	);
	return isset( $map[ $slug ] ) ? $map[ $slug ] : '#3B2A5A';
}

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
