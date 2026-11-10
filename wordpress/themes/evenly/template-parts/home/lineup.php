<?php
/**
 * Home: the product lineup band.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$rows = array(
	array( 'Sleep', '#EE91AC', __( "A melatonin formula for the nights your mind won't switch off.", 'evenly' ) ),
	array( 'Cycle', '#FF735E', __( 'Chasteberry, black cohosh and dong quai for a calmer cycle.', 'evenly' ) ),
	array( 'Digest', '#FFC857', __( "Take it with your first bite, so lunch doesn't come back at 3 p.m.", 'evenly' ) ),
	array( 'Calm', '#FFC857', __( "Take the edge off busy days, so you're not still wound up at bedtime.", 'evenly' ) ),
);
?>
<section class="nn-section ev-lineup" aria-labelledby="ev-lineup-title">
	<div class="nn-container ev-lineup__grid">
		<img class="ev-lineup__img" src="<?php echo esc_url( nn_img( 'lineup.webp' ) ); ?>" alt="<?php esc_attr_e( 'evenly Sleep, Cycle, Digest and Calm bottles (packaging render)', 'evenly' ); ?>" loading="lazy" width="1920" height="1088">
		<div>
			<p class="nn-eyebrow"><?php esc_html_e( 'One brand for your whole month', 'evenly' ); ?></p>
			<h2 id="ev-lineup-title"><?php esc_html_e( 'A formula for each hard day.', 'evenly' ); ?></h2>
			<ul>
				<?php foreach ( $rows as $row ) : ?>
					<li><b style="background:<?php echo esc_attr( $row[1] ); ?>"><?php echo esc_html( $row[0] ); ?></b> <span><?php echo esc_html( $row[2] ); ?></span></li>
				<?php endforeach; ?>
			</ul>
			<a class="nn-btn" href="#build"><?php esc_html_e( 'Build your 3', 'evenly' ); ?></a>
		</div>
	</div>
</section>
