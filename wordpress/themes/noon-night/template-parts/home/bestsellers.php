<?php
/**
 * Home: routines (bundles) and single products.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}
?>
<section class="nn-section nn-section--tint" aria-labelledby="nn-best-title">
	<div class="nn-container">
		<div class="nn-section__head">
			<h2 id="nn-best-title"><?php esc_html_e( 'Routines that work together', 'noon-night' ); ?></h2>
			<p><?php esc_html_e( 'Our kits pair the products that support each other, and cost less than buying them one by one.', 'noon-night' ); ?></p>
		</div>
		<?php echo do_shortcode( '[products category="bundles" limit="4" columns="4" orderby="price" order="DESC"]' ); // phpcs:ignore ?>
		<div class="nn-section__head nn-section__head--spaced">
			<h2><?php esc_html_e( 'Or start with one', 'noon-night' ); ?></h2>
		</div>
		<?php echo do_shortcode( '[products limit="4" columns="4" cat_operator="NOT IN" category="bundles" orderby="popularity"]' ); // phpcs:ignore ?>
	</div>
</section>
