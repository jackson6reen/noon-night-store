<?php
/**
 * Theme supports, menus, image sizes.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

add_action( 'after_setup_theme', function () {
	load_theme_textdomain( 'evenly', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'custom-logo', array( 'height' => 64, 'width' => 220, 'flex-width' => true, 'flex-height' => true ) );

	add_theme_support( 'woocommerce', array(
		'thumbnail_image_width' => 600,
		'single_image_width'    => 900,
		'product_grid'          => array( 'default_columns' => 3, 'default_rows' => 4, 'min_columns' => 2, 'max_columns' => 4 ),
	) );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	register_nav_menus( array(
		'primary'      => __( 'Primary menu', 'evenly' ),
		'footer_shop'  => __( 'Footer: Shop', 'evenly' ),
		'footer_help'  => __( 'Footer: Help', 'evenly' ),
		'footer_legal' => __( 'Footer: Legal', 'evenly' ),
	) );

	add_image_size( 'nn-card', 640, 420, true );
} );

/**
 * Blog excerpts: shorter, cleaner.
 */
add_filter( 'excerpt_length', function () {
	return 26;
} );
add_filter( 'excerpt_more', function () {
	return '…';
} );
