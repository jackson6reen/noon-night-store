<?php
/**
 * Shared helpers used by the plugin and the theme.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

/**
 * Default values for every setting. The settings screen and nn_option() both read this.
 */
function nn_option_defaults() {
	return array(
		'business_name'      => 'Evenly',
		'legal_entity'       => '[LEGAL ENTITY NAME, e.g. Evenly LLC]',
		'address'            => '[BUSINESS MAILING ADDRESS]',
		'support_email'      => 'support@example.com',
		'phone'              => '',
		'state_of_law'       => '[STATE, e.g. Delaware]',
		'free_ship_min'      => 50,
		'guarantee_days'     => 30,
		'announcement'       => 'Buy 2, get 1 free on every formula · Free US shipping over $50',
		'offer_enabled'      => 1,
		'offer_label'        => 'Buy 2, get 1 free',
		'manufacturing_claim_verified' => 0,
		'ga4_id'             => '',
		'meta_pixel_id'      => '',
		'policy_updated'     => '2026-11-09',
	);
}

/**
 * Get one setting.
 *
 * @param string $key Setting key.
 * @return mixed
 */
function nn_option( $key ) {
	$defaults = nn_option_defaults();
	$saved    = get_option( 'nn_settings', array() );
	if ( is_array( $saved ) && isset( $saved[ $key ] ) && '' !== $saved[ $key ] ) {
		return $saved[ $key ];
	}
	return isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';
}

/**
 * The FDA (DSHEA) disclaimer required next to structure/function claims.
 */
function nn_fda_disclaimer() {
	return __( '*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.', 'evenly' );
}

/**
 * Split a "one item per line" textarea into an array of trimmed lines.
 *
 * @param string $text Raw text.
 * @return string[]
 */
function nn_lines( $text ) {
	$lines = preg_split( '/\r\n|\r|\n/', (string) $text );
	return array_values( array_filter( array_map( 'trim', $lines ), 'strlen' ) );
}

/**
 * Parse "Question | Answer" lines into pairs.
 *
 * @param string $text Raw text.
 * @return array<int, array{0:string,1:string}>
 */
function nn_pairs( $text, $columns = 2 ) {
	$out = array();
	foreach ( nn_lines( $text ) as $line ) {
		$parts = array_map( 'trim', explode( '|', $line ) );
		if ( count( $parts ) >= 2 ) {
			$out[] = array_pad( array_slice( $parts, 0, $columns ), $columns, '' );
		}
	}
	return $out;
}

/**
 * Allowed HTML for rich text fields (SEO content blocks).
 */
function nn_allowed_html() {
	return wp_kses_allowed_html( 'post' );
}
