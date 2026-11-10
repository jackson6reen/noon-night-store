<?php
/**
 * Evenly theme bootstrap. Each concern lives in its own file in /inc.
 * Store logic (product fields, compliance, consent, security) lives in the
 * Evenly Core plugin, so changing the theme never breaks the business.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

define( 'NN_THEME_VERSION', '1.0.0' );

require get_template_directory() . '/inc/setup.php';
require get_template_directory() . '/inc/assets.php';
require get_template_directory() . '/inc/icons.php';
require get_template_directory() . '/inc/template-tags.php';

if ( class_exists( 'WooCommerce' ) ) {
	require get_template_directory() . '/inc/woocommerce.php';
}
