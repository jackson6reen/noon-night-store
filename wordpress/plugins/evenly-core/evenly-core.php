<?php
/**
 * Plugin Name:       Evenly Core
 * Description:       Store logic for Evenly: supplement product fields, concern hubs, FDA/FTC compliance blocks, SEO schema, privacy consent (CCPA + GPC), and security hardening. Theme-independent by design.
 * Version:           1.1.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * Author:            Evenly
 * Text Domain:       evenly
 * License:           GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

define( 'NN_CORE_VERSION', '1.0.0' );
define( 'NN_CORE_FILE', __FILE__ );
define( 'NN_CORE_DIR', plugin_dir_path( __FILE__ ) );
define( 'NN_CORE_URL', plugin_dir_url( __FILE__ ) );

/**
 * Each module is a small, single-purpose file. Add new features as new files here.
 */
$nn_modules = array(
	'helpers',      // nn_option(), nn_business(), FDA text.
	'settings',     // Settings > Evenly (business details, pixels, shipping threshold).
	'security',     // Headers, XML-RPC off, user-enumeration block, generic login errors.
	'compliance',   // FDA disclaimer, shortcodes for legal pages, checkout acknowledgement.
	'product-fields', // Admin fields + front-end tabs for ingredients, safety, FAQ.
	'concern-fields', // Extra SEO content + FAQ on product categories (concern hubs).
	'bundles',      // "What's inside" + savings for bundle products.
	'schema',       // FAQPage / Organization JSON-LD (skips what SEO plugins already output).
	'consent',      // Cookie banner, Global Privacy Control, consent-gated GA4 / Meta Pixel.
	'commerce',     // Free-shipping progress, trust badges under add-to-cart.
	'offer',        // "Buy 2, get 1 free", Build-your-3 links, cart hand-off from the Vercel preview.
	'setup-page',   // Tools > Evenly Setup: one-click content import (no WP-CLI needed).
);

foreach ( $nn_modules as $nn_module ) {
	require_once NN_CORE_DIR . 'includes/' . $nn_module . '.php';
}
unset( $nn_modules, $nn_module );
