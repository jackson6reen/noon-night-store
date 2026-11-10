<?php
/**
 * Home: scrolling offer / trust band.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$items = array(
	nn_theme_option( 'offer_label', 'Buy 2, get 1 free' ),
	sprintf( /* translators: %d dollars */ __( 'Free US shipping over $%d', 'evenly' ), (int) nn_theme_option( 'free_ship_min', 50 ) ),
	sprintf( /* translators: %d days */ __( '%d-day money-back guarantee', 'evenly' ), (int) nn_theme_option( 'guarantee_days', 30 ) ),
	__( 'Made in the USA', 'evenly' ),
	__( 'Every dose on the label', 'evenly' ),
);
$items = array_merge( $items, $items ); // Duplicated for a seamless loop.
?>
<div class="ev-offer-band" aria-hidden="true">
	<div class="ev-offer-band__track">
		<?php foreach ( $items as $item ) : ?>
			<span><?php echo esc_html( $item ); ?></span>
		<?php endforeach; ?>
	</div>
</div>
