<?php
/**
 * Security hardening that is safe on any WooCommerce host.
 * Server-level items (WAF, 2FA, backups) are in docs/WORDPRESS-SECURITY.md.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

// No theme/plugin file editor in wp-admin: a stolen admin session can't inject PHP.
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

// XML-RPC is a common brute-force and DDoS amplification target. WooCommerce doesn't need it.
add_filter( 'xmlrpc_enabled', '__return_false' );
add_filter( 'wp_headers', function ( $headers ) {
	unset( $headers['X-Pingback'] );
	return $headers;
} );

// Don't advertise the WordPress version.
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

/**
 * Security headers. CSP is left to the host/CDN because Stripe, PayPal and
 * WooCommerce inject scripts that a strict CSP would break.
 */
add_action( 'send_headers', function () {
	if ( headers_sent() ) {
		return;
	}
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()' );
	if ( is_ssl() ) {
		header( 'Strict-Transport-Security: max-age=31536000; includeSubDomains' );
	}
} );

// Block ?author=N user enumeration on the front end.
add_action( 'template_redirect', function () {
	if ( ! is_admin() && isset( $_GET['author'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
} );

// Hide the users REST endpoints from visitors who aren't logged in.
add_filter( 'rest_endpoints', function ( $endpoints ) {
	if ( is_user_logged_in() ) {
		return $endpoints;
	}
	foreach ( array_keys( $endpoints ) as $route ) {
		if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
			unset( $endpoints[ $route ] );
		}
	}
	return $endpoints;
} );

// Generic login error: don't reveal whether the username exists.
add_filter( 'login_errors', function () {
	return esc_html__( 'Incorrect login details. Please try again.', 'noon-night' );
} );

// Remove oEmbed/RSD/WLW discovery links that only add attack surface.
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
