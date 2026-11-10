<?php
/**
 * "Concern hubs" = WooCommerce product categories (Sleep, Period Comfort, Bloating & Gut, ...).
 * Each one gets a pain-led headline, a long SEO article under the product grid, and an FAQ.
 * These are the pages that rank for "supplements for period cramps" type searches.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

function nn_concern_meta_fields() {
	return array(
		'nn_headline'    => array( __( 'Hub headline (H1)', 'evenly' ), 'text' ),
		'nn_tagline'     => array( __( 'Short tagline (homepage tile)', 'evenly' ), 'text' ),
		'nn_icon'        => array( __( 'Icon (moon, drop, leaf, wave, gift)', 'evenly' ), 'text' ),
		'nn_seo_content' => array( __( 'SEO article below products (HTML allowed)', 'evenly' ), 'html' ),
		'nn_faq'         => array( __( 'FAQ (Question | Answer, one per line)', 'evenly' ), 'textarea' ),
	);
}

function nn_concern_field( $term_id, $key ) {
	return get_term_meta( $term_id, $key, true );
}

add_action( 'product_cat_edit_form_fields', function ( $term ) {
	wp_nonce_field( 'nn_save_concern', 'nn_concern_nonce' );
	foreach ( nn_concern_meta_fields() as $key => $field ) {
		$value = get_term_meta( $term->term_id, $key, true );
		echo '<tr class="form-field"><th scope="row"><label for="' . esc_attr( $key ) . '">' . esc_html( $field[0] ) . '</label></th><td>';
		if ( 'text' === $field[1] ) {
			printf( '<input type="text" id="%1$s" name="%1$s" value="%2$s">', esc_attr( $key ), esc_attr( $value ) );
		} else {
			printf( '<textarea id="%1$s" name="%1$s" rows="%3$d">%2$s</textarea>', esc_attr( $key ), esc_textarea( $value ), 'html' === $field[1] ? 16 : 6 );
		}
		echo '</td></tr>';
	}
} );

add_action( 'edited_product_cat', function ( $term_id ) {
	if ( ! isset( $_POST['nn_concern_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['nn_concern_nonce'] ), 'nn_save_concern' ) ) {
		return;
	}
	if ( ! current_user_can( 'manage_product_terms' ) ) {
		return;
	}
	foreach ( nn_concern_meta_fields() as $key => $field ) {
		if ( ! isset( $_POST[ $key ] ) ) {
			continue;
		}
		$raw = wp_unslash( $_POST[ $key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( 'html' === $field[1] ) {
			$clean = wp_kses_post( $raw );
		} elseif ( 'textarea' === $field[1] ) {
			$clean = sanitize_textarea_field( $raw );
		} else {
			$clean = sanitize_text_field( $raw );
		}
		update_term_meta( $term_id, $key, $clean );
	}
} );

/**
 * Below the product grid on a concern hub: long-form content + FAQ.
 */
add_action( 'woocommerce_after_shop_loop', function () {
	if ( ! is_product_category() ) {
		return;
	}
	$term    = get_queried_object();
	$content = nn_concern_field( $term->term_id, 'nn_seo_content' );
	$faq     = nn_pairs( nn_concern_field( $term->term_id, 'nn_faq' ) );
	if ( ! $content && ! $faq ) {
		return;
	}
	echo '<section class="nn-hub-article" aria-label="' . esc_attr__( 'Guide', 'evenly' ) . '">';
	if ( $content ) {
		echo '<div class="nn-prose">' . wp_kses_post( $content ) . '</div>';
	}
	if ( $faq ) {
		echo '<h2>' . esc_html__( 'Frequently asked questions', 'evenly' ) . '</h2>';
		nn_render_faq( $faq );
	}
	echo '<p class="nn-fda">' . esc_html( nn_fda_disclaimer() ) . '</p>';
	echo '</section>';
}, 30 );

/**
 * Replace the default archive title with the pain-led H1 when one is set.
 */
add_filter( 'woocommerce_page_title', function ( $title ) {
	if ( is_product_category() ) {
		$headline = nn_concern_field( get_queried_object_id(), 'nn_headline' );
		if ( $headline ) {
			return $headline;
		}
	}
	return $title;
} );
