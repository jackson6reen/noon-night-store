<?php
/**
 * Home: "Build your 3" picker.
 * A plain GET form (/?ev_build[]=SKU x3) handled by evenly-core/includes/offer.php,
 * so it works even without JavaScript; main.js adds the live summary.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'nn_is_bundle' ) ) {
	return;
}
$products = wc_get_products( array(
	'status'  => 'publish',
	'limit'   => 12,
	'orderby' => 'menu_order',
	'order'   => 'ASC',
) );
$products = array_values( array_filter( $products, function ( $p ) {
	return ! nn_is_bundle( $p->get_id() ) && $p->is_purchasable() && $p->is_in_stock();
} ) );
if ( count( $products ) < 3 ) {
	return;
}
$label = nn_theme_option( 'offer_label', 'Buy 2, get 1 free' );
?>
<section class="nn-section ev-build" id="build" aria-labelledby="ev-build-title">
	<div class="nn-container">
		<div class="nn-section__head">
			<p class="nn-eyebrow"><?php echo esc_html( $label ); ?></p>
			<h2 id="ev-build-title"><?php esc_html_e( 'Build your 3. Pay for 2.', 'evenly' ); ?></h2>
			<p><?php esc_html_e( 'Mix any three formulas into your own routine. The cheapest one is on us.', 'evenly' ); ?></p>
		</div>
		<form class="ev-build__grid" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get" data-ev-build>
			<fieldset class="ev-build__options" style="border:0;padding:0;margin:0">
				<legend class="screen-reader-text"><?php esc_html_e( 'Pick any 3 formulas', 'evenly' ); ?></legend>
				<?php foreach ( $products as $p ) : ?>
					<?php
					$parts = array_map( 'trim', explode( ':', $p->get_name(), 2 ) );
					$image = wp_get_attachment_image_url( $p->get_image_id(), 'woocommerce_thumbnail' );
					?>
					<label class="ev-pick">
						<input type="checkbox" name="ev_build[]" value="<?php echo esc_attr( $p->get_sku() ); ?>" data-price="<?php echo esc_attr( $p->get_price() ); ?>" data-img="<?php echo esc_url( (string) $image ); ?>">
						<?php if ( $image ) : ?>
							<img src="<?php echo esc_url( $image ); ?>" alt="" loading="lazy" width="400" height="400">
						<?php endif; ?>
						<span class="ev-pick__check" aria-hidden="true">✓</span>
						<span class="ev-pick__name"><?php echo esc_html( $parts[0] ); ?></span>
						<?php if ( isset( $parts[1] ) ) : ?>
							<span class="ev-pick__meta"><?php echo esc_html( $parts[1] ); ?></span>
						<?php endif; ?>
						<span class="ev-pick__price"><?php echo wp_kses_post( wc_price( $p->get_price() ) ); ?></span>
					</label>
				<?php endforeach; ?>
			</fieldset>
			<aside class="ev-summary" aria-live="polite">
				<span class="nn-badge"><?php echo esc_html( $label ); ?></span>
				<h3 style="margin-top:14px"><?php esc_html_e( 'Your routine', 'evenly' ); ?></h3>
				<div class="ev-summary__slots">
					<div class="ev-summary__slot"><?php esc_html_e( 'Pick 1', 'evenly' ); ?></div>
					<div class="ev-summary__slot"><?php esc_html_e( 'Pick 2', 'evenly' ); ?></div>
					<div class="ev-summary__slot"><?php esc_html_e( 'Pick 3', 'evenly' ); ?></div>
				</div>
				<div class="ev-summary__row"><span data-ev-count>0/3 <?php esc_html_e( 'selected', 'evenly' ); ?></span><span data-ev-left></span></div>
				<div class="ev-summary__row ev-summary__row--total"><span><?php esc_html_e( 'Total', 'evenly' ); ?></span><span data-ev-total>$0.00</span></div>
				<button type="submit" class="nn-btn nn-btn--lg nn-btn--block" data-ev-submit><?php esc_html_e( 'Add my 3 to cart', 'evenly' ); ?></button>
				<p class="ev-summary__note"><?php esc_html_e( 'The cheapest formula is free. Mix and match any way you like. Covered by our 30-day guarantee.', 'evenly' ); ?></p>
			</aside>
		</form>
	</div>
</section>
