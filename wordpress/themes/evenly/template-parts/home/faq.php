<?php
/**
 * Home: FAQ. Edit it in the Home page's "nn_faq" custom field (Question | Answer per line).
 * The Core plugin also prints FAQPage schema from the same field.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'nn_pairs' ) ) {
	return;
}
$page_id = (int) get_option( 'page_on_front' );
$faq     = $page_id ? nn_pairs( get_post_meta( $page_id, 'nn_faq', true ) ) : array();
if ( ! $faq ) {
	return;
}
?>
<section class="nn-section nn-container nn-container--narrow" aria-labelledby="nn-faq-title">
	<div class="nn-section__head">
		<h2 id="nn-faq-title"><?php esc_html_e( 'Questions, answered', 'evenly' ); ?></h2>
	</div>
	<?php nn_render_faq( $faq ); ?>
</section>
