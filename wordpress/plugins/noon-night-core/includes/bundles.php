<?php
/**
 * Bundles are simple products with a _nn_includes list of SKUs.
 * This shows "What's inside" with links and the saving vs. buying separately.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

/**
 * Products contained in a bundle.
 *
 * @param int $product_id Bundle ID.
 * @return WC_Product[]
 */
function nn_bundle_items( $product_id ) {
	$skus  = array_filter( array_map( 'trim', explode( ',', (string) nn_product_field( $product_id, '_nn_includes' ) ) ) );
	$items = array();
	foreach ( $skus as $sku ) {
		$id = wc_get_product_id_by_sku( $sku );
		if ( $id ) {
			$product = wc_get_product( $id );
			if ( $product ) {
				$items[] = $product;
			}
		}
	}
	return $items;
}

/**
 * Sum of the items' regular prices.
 */
function nn_bundle_value( $product_id ) {
	$total = 0.0;
	foreach ( nn_bundle_items( $product_id ) as $item ) {
		$total += (float) $item->get_regular_price();
	}
	return $total;
}

add_action( 'woocommerce_single_product_summary', function () {
	$id    = get_the_ID();
	$items = nn_bundle_items( $id );
	if ( ! $items ) {
		return;
	}
	$product = wc_get_product( $id );
	$value   = nn_bundle_value( $id );
	$saving  = $value - (float) $product->get_price();

	echo '<div class="nn-bundle"><p class="nn-bundle__title">' . esc_html__( "What's inside", 'noon-night' ) . '</p><ul>';
	foreach ( $items as $item ) {
		printf(
			'<li><a href="%s">%s</a> <span>%s</span></li>',
			esc_url( $item->get_permalink() ),
			esc_html( $item->get_name() ),
			wp_kses_post( wc_price( $item->get_regular_price() ) )
		);
	}
	echo '</ul>';
	if ( $saving > 0 ) {
		printf(
			'<p class="nn-bundle__save">%s</p>',
			wp_kses_post(
				sprintf(
					/* translators: 1: total value, 2: saving */
					__( 'Worth %1$s separately. <strong>You save %2$s.</strong>', 'noon-night' ),
					wc_price( $value ),
					wc_price( $saving )
				)
			)
		);
	}
	echo '</div>';
}, 16 );
