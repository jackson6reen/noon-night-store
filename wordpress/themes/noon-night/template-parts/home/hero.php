<?php
/**
 * Home: hero.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
$shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
?>
<section class="nn-hero">
	<div class="nn-container nn-hero__grid">
		<div class="nn-hero__copy">
			<p class="nn-eyebrow"><?php esc_html_e( 'For the things women are told to "just live with"', 'noon-night' ); ?></p>
			<h1><?php esc_html_e( 'Better nights. Easier periods. A calmer gut.', 'noon-night' ); ?></h1>
			<p class="nn-lead"><?php esc_html_e( 'Gentle, research-backed supplements for sleep, period comfort and bloating, made for women who are tired of pushing through.*', 'noon-night' ); ?></p>
			<div class="nn-hero__ctas">
				<a class="nn-btn nn-btn--lg" href="#nn-quiz"><?php esc_html_e( 'Find what helps me', 'noon-night' ); ?></a>
				<a class="nn-btn nn-btn--ghost nn-btn--lg" href="<?php echo esc_url( $shop ); ?>"><?php esc_html_e( 'Shop all', 'noon-night' ); ?></a>
			</div>
			<ul class="nn-hero__proof">
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php esc_html_e( 'Made in the USA, cGMP facility', 'noon-night' ); ?></li>
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php esc_html_e( 'Every ingredient and dose listed', 'noon-night' ); ?></li>
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php echo esc_html( sprintf( /* translators: %d days */ __( '%d-day money-back guarantee', 'noon-night' ), (int) nn_theme_option( 'guarantee_days', 30 ) ) ); ?></li>
			</ul>
		</div>
		<div class="nn-hero__art" aria-hidden="true">
			<span class="nn-blob nn-blob--lilac"></span>
			<span class="nn-blob nn-blob--peach"></span>
			<span class="nn-hero__bottle nn-hero__bottle--1"><?php echo nn_bottle_svg( 'CYCLE EASE', nn_concern_color( 'period-comfort' ) ); // phpcs:ignore ?></span>
			<span class="nn-hero__bottle nn-hero__bottle--2"><?php echo nn_bottle_svg( 'NIGHT CALM', nn_concern_color( 'sleep' ) ); // phpcs:ignore ?></span>
			<span class="nn-hero__bottle nn-hero__bottle--3"><?php echo nn_bottle_svg( 'NOON DIGEST', nn_concern_color( 'bloating-gut' ) ); // phpcs:ignore ?></span>
		</div>
	</div>
</section>
