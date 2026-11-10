<?php
/**
 * Supplement-specific product fields: a "Evenly" tab in the product editor,
 * and front-end output (benefits, how-to, ingredients, safety, FAQ).
 *
 * Meta keys are listed in nn_product_meta_fields() so the seeder, schema and
 * theme all read the same names.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

/**
 * key => [label, type, help]
 */
function nn_product_meta_fields() {
	return array(
		'_nn_tagline'        => array( __( 'Tagline (pain-led one-liner)', 'evenly' ), 'text', '' ),
		'_nn_format'         => array( __( 'Format', 'evenly' ), 'text', __( 'e.g. "60 capsules · 30 days"', 'evenly' ) ),
		'_nn_benefits'       => array( __( 'Benefits (one per line; end claims with *)', 'evenly' ), 'textarea', __( 'Structure/function claims only: "supports", "helps relieve occasional". Never treat/cure/prevent.', 'evenly' ) ),
		'_nn_how_to_use'     => array( __( 'How to take', 'evenly' ), 'textarea', '' ),
		'_nn_ingredients'    => array( __( 'Ingredients (Name | Amount | Why, one per line)', 'evenly' ), 'textarea', __( 'Must match the supplier label exactly.', 'evenly' ) ),
		'_nn_warnings'       => array( __( 'Safety warnings', 'evenly' ), 'textarea', '' ),
		'_nn_faq'            => array( __( 'FAQ (Question | Answer, one per line)', 'evenly' ), 'textarea', '' ),
		'_nn_includes'       => array( __( 'Bundle contents (SKUs, comma-separated)', 'evenly' ), 'text', __( 'Bundles only. Your supplier needs one line item per SKU, so map this in the fulfillment app.', 'evenly' ) ),
		'_nn_supplier_item'  => array( __( 'Supplier product (internal)', 'evenly' ), 'text', __( 'Never shown to customers.', 'evenly' ) ),
		'_nn_label_verified' => array( __( 'Label checked against supplier', 'evenly' ), 'checkbox', __( 'Tick once doses and counts above match the real label.', 'evenly' ) ),
	);
}

/**
 * Read a product field.
 *
 * @param int    $product_id Product ID.
 * @param string $key        Meta key.
 */
function nn_product_field( $product_id, $key ) {
	return get_post_meta( $product_id, $key, true );
}

/* ------------------------------------------------------------------ admin */

add_filter( 'woocommerce_product_data_tabs', function ( $tabs ) {
	$tabs['noon_night'] = array(
		'label'    => __( 'Evenly', 'evenly' ),
		'target'   => 'nn_product_data',
		'priority' => 15,
	);
	return $tabs;
} );

add_action( 'woocommerce_product_data_panels', function () {
	global $post;
	echo '<div id="nn_product_data" class="panel woocommerce_options_panel"><div class="options_group">';
	wp_nonce_field( 'nn_save_product', 'nn_product_nonce' );
	foreach ( nn_product_meta_fields() as $key => $field ) {
		$args = array(
			'id'          => $key,
			'label'       => $field[0],
			'description' => $field[2],
			'desc_tip'    => false,
			'value'       => get_post_meta( $post->ID, $key, true ),
		);
		if ( 'textarea' === $field[1] ) {
			$args['rows']  = 5;
			$args['style'] = 'height:auto;width:100%';
			woocommerce_wp_textarea_input( $args );
		} elseif ( 'checkbox' === $field[1] ) {
			$args['cbvalue'] = 'yes';
			woocommerce_wp_checkbox( $args );
		} else {
			woocommerce_wp_text_input( $args );
		}
	}
	echo '</div></div>';
} );

add_action( 'woocommerce_admin_process_product_object', function ( $product ) {
	if ( ! isset( $_POST['nn_product_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['nn_product_nonce'] ), 'nn_save_product' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_product', $product->get_id() ) ) {
		return;
	}
	foreach ( nn_product_meta_fields() as $key => $field ) {
		if ( 'checkbox' === $field[1] ) {
			$product->update_meta_data( $key, isset( $_POST[ $key ] ) ? 'yes' : 'no' );
			continue;
		}
		$raw = isset( $_POST[ $key ] ) ? wp_unslash( $_POST[ $key ] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$product->update_meta_data( $key, 'textarea' === $field[1] ? sanitize_textarea_field( $raw ) : sanitize_text_field( $raw ) );
	}
} );

/* -------------------------------------------------------------- front end */

/**
 * Tagline + format + benefit bullets right under the price: the "why buy" in 3 seconds.
 */
add_action( 'woocommerce_single_product_summary', function () {
	$id       = get_the_ID();
	$tagline  = nn_product_field( $id, '_nn_tagline' );
	$format   = nn_product_field( $id, '_nn_format' );
	$benefits = nn_lines( nn_product_field( $id, '_nn_benefits' ) );

	if ( $tagline ) {
		echo '<p class="nn-tagline">' . esc_html( $tagline ) . '</p>';
	}
	if ( $benefits ) {
		echo '<ul class="nn-benefits">';
		foreach ( $benefits as $benefit ) {
			echo '<li>' . esc_html( $benefit ) . '</li>';
		}
		echo '</ul>';
	}
	if ( $format ) {
		echo '<p class="nn-format">' . esc_html( $format ) . '</p>';
	}
}, 15 );

/**
 * Product tabs: How to take, Ingredients, Safety, FAQ. Content stays in the HTML, so search engines index it.
 */
add_filter( 'woocommerce_product_tabs', function ( $tabs ) {
	$id = get_the_ID();
	unset( $tabs['additional_information'] );

	if ( nn_product_field( $id, '_nn_how_to_use' ) ) {
		$tabs['nn_how'] = array(
			'title'    => __( 'How to take', 'evenly' ),
			'priority' => 12,
			'callback' => function () use ( $id ) {
				echo '<h2>' . esc_html__( 'How to take', 'evenly' ) . '</h2>';
				if ( 'yes' === nn_product_field( $id, '_nn_label_verified' ) || nn_product_field( $id, '_nn_includes' ) ) {
					echo wp_kses_post( wpautop( esc_html( nn_product_field( $id, '_nn_how_to_use' ) ) ) );
				} else {
					echo '<p><span class="ev-pending">' . esc_html__( 'Pending final label', 'evenly' ) . '</span> ' . esc_html__( 'Directions will match the printed label exactly.', 'evenly' ) . '</p>';
				}
			},
		);
	}
	if ( nn_product_field( $id, '_nn_ingredients' ) ) {
		$tabs['nn_ingredients'] = array(
			'title'    => __( 'Ingredients', 'evenly' ),
			'priority' => 14,
			'callback' => 'nn_render_ingredients_tab',
		);
	}
	if ( nn_product_field( $id, '_nn_warnings' ) ) {
		$tabs['nn_safety'] = array(
			'title'    => __( 'Safety', 'evenly' ),
			'priority' => 16,
			'callback' => function () use ( $id ) {
				echo '<h2>' . esc_html__( 'Safety & who should not take it', 'evenly' ) . '</h2>';
				echo '<p>' . esc_html( nn_product_field( $id, '_nn_warnings' ) ) . '</p>';
				echo '<p>' . esc_html__( 'Supplements are not a substitute for medical care. If your symptoms are severe, sudden, or getting worse, please see a doctor.', 'evenly' ) . '</p>';
			},
		);
	}
	if ( nn_product_field( $id, '_nn_faq' ) ) {
		$tabs['nn_faq'] = array(
			'title'    => __( 'FAQ', 'evenly' ),
			'priority' => 18,
			'callback' => function () use ( $id ) {
				echo '<h2>' . esc_html__( 'Questions women ask us', 'evenly' ) . '</h2>';
				nn_render_faq( nn_pairs( nn_product_field( $id, '_nn_faq' ) ) );
			},
		);
	}
	return $tabs;
}, 20 );

function nn_render_ingredients_tab() {
	$rows = nn_pairs( nn_product_field( get_the_ID(), '_nn_ingredients' ), 3 );
	echo '<h2>' . esc_html__( "What's inside, and why", 'evenly' ) . '</h2>';
	echo '<table class="nn-ingredients"><thead><tr><th scope="col">' . esc_html__( 'Ingredient', 'evenly' ) . '</th><th scope="col">' . esc_html__( 'Per serving', 'evenly' ) . '</th><th scope="col">' . esc_html__( 'Why it\'s here', 'evenly' ) . '</th></tr></thead><tbody>';
	// Amounts are shown only from a label checked against the supplier ("Label checked" box).
	$verified = 'yes' === nn_product_field( get_the_ID(), '_nn_label_verified' );
	$pending  = '<span class="ev-pending">' . esc_html__( 'Pending final label', 'evenly' ) . '</span>';
	foreach ( $rows as $row ) {
		printf( '<tr><td>%s</td><td>%s</td><td>%s</td></tr>', esc_html( $row[0] ), $verified ? esc_html( $row[1] ) : $pending, esc_html( $row[2] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $pending is static escaped markup.
	}
	echo '</tbody></table>';
	echo '<p class="nn-small"><strong>' . esc_html__( 'Supplement Facts:', 'evenly' ) . '</strong> ' . esc_html__( 'a photo of the printed panel will be added with the final label.', 'evenly' );
	if ( ! $verified ) {
		echo ' ' . esc_html__( 'Amounts are published only from the verified label.', 'evenly' );
	}
	if ( nn_option( 'manufacturing_claim_verified' ) ) {
		echo ' ' . esc_html__( 'Made in the USA in a cGMP-certified facility.', 'evenly' );
	}
	echo '</p>';
}

/**
 * Accessible FAQ list built on <details>/<summary> (keyboard and screen-reader friendly, no JS).
 *
 * @param array $pairs [[q, a], ...].
 */
function nn_render_faq( $pairs ) {
	if ( ! $pairs ) {
		return;
	}
	echo '<div class="nn-faq">';
	foreach ( $pairs as $pair ) {
		printf(
			'<details class="nn-faq__item"><summary>%s</summary><div class="nn-faq__answer">%s</div></details>',
			esc_html( $pair[0] ),
			wp_kses_post( wpautop( esc_html( $pair[1] ) ) )
		);
	}
	echo '</div>';
}
