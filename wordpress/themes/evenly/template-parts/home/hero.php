<?php
/**
 * Home: hero (offer-led, lifestyle photo).
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
$offer = function_exists( 'nn_offer_enabled' ) && nn_offer_enabled();
?>
<section class="ev-hero">
	<picture>
		<source media="(max-width: 860px)" srcset="<?php echo esc_url( nn_img( 'hero-960.webp' ) ); ?>">
		<img class="ev-hero__img" src="<?php echo esc_url( nn_img( 'hero.webp' ) ); ?>" alt="<?php esc_attr_e( 'Woman waking up rested in bed with a cup of tea', 'evenly' ); ?>" width="1920" height="1088" fetchpriority="high">
	</picture>
	<div class="nn-container ev-hero__inner">
		<div class="ev-hero__copy">
			<?php if ( $offer ) : ?>
				<span class="nn-badge"><?php echo esc_html( nn_theme_option( 'offer_label' ) ); ?> · <?php esc_html_e( 'any formula', 'evenly' ); ?></span>
			<?php endif; ?>
			<h1 style="margin-top:18px"><?php esc_html_e( 'Feel even again.', 'evenly' ); ?></h1>
			<p class="nn-lead"><?php esc_html_e( 'Clean, honest formulas for the sleepless nights, cramps and bloat women are told to just live with.*', 'evenly' ); ?></p>
			<div class="nn-hero__ctas">
				<a class="nn-btn nn-btn--lg" href="#build"><?php esc_html_e( 'Build your 3', 'evenly' ); ?></a>
				<a class="nn-btn nn-btn--ghost nn-btn--lg" href="#nn-quiz"><?php esc_html_e( 'Find my formula', 'evenly' ); ?></a>
			</div>
			<ul class="nn-hero__proof">
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php esc_html_e( 'Made in the USA, cGMP', 'evenly' ); ?></li>
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php esc_html_e( 'Every dose listed', 'evenly' ); ?></li>
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php echo esc_html( sprintf( /* translators: %d days */ __( '%d-day guarantee', 'evenly' ), (int) nn_theme_option( 'guarantee_days', 30 ) ) ); ?></li>
			</ul>
		</div>
	</div>
</section>
