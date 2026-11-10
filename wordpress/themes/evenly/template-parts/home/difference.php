<?php
/**
 * Home: "What to look for in your supplements": criteria + evenly's verifiable proof.
 * (Replaces the old drugstore comparison, which generalized about other brands.)
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$days  = (int) nn_theme_option( 'guarantee_days', 30 );
$items = array(
	array( '#EE91AC', __( 'The form of the nutrient', 'evenly' ), __( 'Magnesium oxide is cheap but poorly absorbed and often has a laxative effect. Glycinate is gentler on the stomach.', 'evenly' ), __( 'Unwind uses magnesium glycinate.', 'evenly' ) ),
	array( '#FF735E', __( 'Ingredients you can see', 'evenly' ), __( '"Proprietary blends" can hide how much of each ingredient you are getting.', 'evenly' ), __( 'Every product page lists the ingredients, and amounts from each verified label.', 'evenly' ) ),
	array( '#FFC857', __( "Who shouldn't take it", 'evenly' ), __( 'Some herbs and hormones interact with birth control, antidepressants or blood thinners.', 'evenly' ), __( 'Each product has a Safety section with specific warnings.', 'evenly' ) ),
	array( '#123D38', __( "What happens if it's not for you", 'evenly' ), __( "Supplements don't work the same for everyone.", 'evenly' ), sprintf( /* translators: %d days */ __( 'Your first order is covered by a %d-day money-back guarantee.', 'evenly' ), $days ) ),
);
?>
<section class="nn-section nn-container" aria-labelledby="ev-look-title">
	<div class="nn-section__head">
		<p class="nn-eyebrow"><?php esc_html_e( 'Before you buy any supplement', 'evenly' ); ?></p>
		<h2 id="ev-look-title"><?php esc_html_e( 'What to look for in your supplements', 'evenly' ); ?></h2>
		<p><?php esc_html_e( "Four checks we'd use on any brand, including ours.", 'evenly' ); ?></p>
	</div>
	<ul class="ev-criteria">
		<?php foreach ( $items as $item ) : ?>
			<li style="--dot:<?php echo esc_attr( $item[0] ); ?>">
				<h3><?php echo esc_html( $item[1] ); ?></h3>
				<p><?php echo esc_html( $item[2] ); ?></p>
				<p><strong>evenly:</strong> <?php echo esc_html( $item[3] ); ?></p>
			</li>
		<?php endforeach; ?>
	</ul>
</section>
