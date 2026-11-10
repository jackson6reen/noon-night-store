<?php
/**
 * Home: ready-made kits (bundles).
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}
?>
<section class="nn-section nn-container" aria-labelledby="nn-best-title">
	<div class="nn-section__head nn-section__head--row">
		<div>
			<p class="nn-eyebrow"><?php esc_html_e( 'Ready-made routines', 'evenly' ); ?></p>
			<h2 id="nn-best-title" style="margin-bottom:0"><?php esc_html_e( 'Bestselling kits', 'evenly' ); ?></h2>
		</div>
		<a class="nn-btn nn-btn--ghost" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop all', 'evenly' ); ?></a>
	</div>
	<?php echo do_shortcode( '[products category="bundles" limit="4" columns="4" orderby="price" order="ASC"]' ); // phpcs:ignore ?>
</section>
