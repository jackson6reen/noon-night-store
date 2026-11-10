<?php
/**
 * Home: the product lineup band.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$rows = array(
	array( 'Sleep', '#4B2BB8', __( 'Fall asleep faster and wake up clear, not foggy.', 'evenly' ) ),
	array( 'Cycle', '#F0503F', __( 'Chasteberry, black cohosh and dong quai for a calmer cycle.', 'evenly' ) ),
	array( 'Digest', '#3E9B2F', __( 'Take it with your first bite, so lunch doesn\'t come back at 3 p.m.', 'evenly' ) ),
	array( 'Calm', '#E5951A', __( 'Take the edge off busy days, so you\'re not still wound up at bedtime.', 'evenly' ) ),
);
?>
<section class="nn-section ev-lineup" aria-labelledby="ev-lineup-title">
	<div class="nn-container ev-lineup__grid">
		<img class="ev-lineup__img" src="<?php echo esc_url( nn_img( 'lineup.webp' ) ); ?>" alt="<?php esc_attr_e( 'Evenly Sleep, Cycle, Digest and Calm bottles', 'evenly' ); ?>" loading="lazy" width="1920" height="1088">
		<div>
			<p class="nn-eyebrow"><?php esc_html_e( 'One brand for your whole month', 'evenly' ); ?></p>
			<h2 id="ev-lineup-title"><?php esc_html_e( 'Every hard day has a formula.', 'evenly' ); ?></h2>
			<ul>
				<?php foreach ( $rows as $row ) : ?>
					<li><b style="background:<?php echo esc_attr( $row[1] ); ?>"><?php echo esc_html( $row[0] ); ?></b> <?php echo esc_html( $row[2] ); ?></li>
				<?php endforeach; ?>
			</ul>
			<a class="nn-btn" href="#build"><?php esc_html_e( 'Build your 3', 'evenly' ); ?></a>
		</div>
	</div>
</section>
