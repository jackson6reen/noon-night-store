<?php
/**
 * Structured data. WooCommerce already outputs Product + Offer + BreadcrumbList,
 * and Rank Math / Yoast output Organization + WebSite. We only add what's missing:
 * FAQPage (products, concern hubs, FAQ page) and Organization when no SEO plugin is active.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

function nn_seo_plugin_active() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || class_exists( 'The_SEO_Framework\\Load' );
}

function nn_print_jsonld( array $data ) {
	echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG ) . "</script>\n";
}

function nn_faq_jsonld( array $pairs ) {
	if ( ! $pairs ) {
		return;
	}
	$entities = array();
	foreach ( $pairs as $pair ) {
		$entities[] = array(
			'@type'          => 'Question',
			'name'           => $pair[0],
			'acceptedAnswer' => array(
				'@type' => 'Answer',
				'text'  => $pair[1],
			),
		);
	}
	nn_print_jsonld(
		array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'mainEntity' => $entities,
		)
	);
}

add_action( 'wp_head', function () {
	if ( function_exists( 'is_product' ) && is_product() ) {
		nn_faq_jsonld( nn_pairs( nn_product_field( get_the_ID(), '_nn_faq' ) ) );
	} elseif ( function_exists( 'is_product_category' ) && is_product_category() ) {
		nn_faq_jsonld( nn_pairs( nn_concern_field( get_queried_object_id(), 'nn_faq' ) ) );
	} elseif ( is_singular() ) {
		// Posts/pages can carry an FAQ in the "nn_faq" custom field (Question | Answer per line).
		nn_faq_jsonld( nn_pairs( get_post_meta( get_the_ID(), 'nn_faq', true ) ) );
	}

	if ( is_front_page() && ! nn_seo_plugin_active() ) {
		nn_print_jsonld(
			array(
				'@context' => 'https://schema.org',
				'@type'    => 'Organization',
				'name'     => nn_option( 'business_name' ),
				'url'      => home_url( '/' ),
				'logo'     => get_site_icon_url( 512 ),
				'email'    => nn_option( 'support_email' ),
			)
		);
	}
}, 20 );

/**
 * Fallback meta description + SEO title when no SEO plugin is active.
 * Reads nn_meta_description / nn_seo_title (set by the seeder; editable as custom fields).
 */
function nn_current_seo_meta( $key ) {
	if ( is_singular() ) {
		$value = get_post_meta( get_queried_object_id(), $key, true );
		if ( ! $value && 'nn_meta_description' === $key ) {
			$post  = get_queried_object();
			$value = has_excerpt( $post ) ? get_the_excerpt( $post ) : '';
		}
		return $value;
	}
	if ( is_category() || is_tax() ) {
		return get_term_meta( get_queried_object_id(), $key, true );
	}
	if ( is_front_page() || is_home() ) {
		$page = (int) get_option( is_front_page() ? 'page_on_front' : 'page_for_posts' );
		return $page ? get_post_meta( $page, $key, true ) : '';
	}
	return '';
}

add_action( 'wp_head', function () {
	if ( nn_seo_plugin_active() ) {
		return;
	}
	$desc = nn_current_seo_meta( 'nn_meta_description' );
	if ( $desc ) {
		echo '<meta name="description" content="' . esc_attr( wp_html_excerpt( wp_strip_all_tags( $desc ), 160, '' ) ) . '">' . "\n";
	}
}, 1 );

add_filter( 'pre_get_document_title', function ( $title ) {
	if ( nn_seo_plugin_active() ) {
		return $title;
	}
	$custom = nn_current_seo_meta( 'nn_seo_title' );
	return $custom ? $custom : $title;
}, 20 );

/**
 * Attach the brand to WooCommerce's Product schema.
 */
add_filter( 'woocommerce_structured_data_product', function ( $markup, $product ) {
	$markup['brand'] = array(
		'@type' => 'Brand',
		'name'  => nn_option( 'business_name' ),
	);
	return $markup;
}, 10, 2 );
