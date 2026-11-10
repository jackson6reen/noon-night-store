<?php
/**
 * Home: hero. Promise, needs and actions come first (first on mobile too), then the photo.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
$offer = function_exists( 'nn_offer_enabled' ) && nn_offer_enabled();
?>
<section class="ev-hero" aria-labelledby="ev-hero-title">
	<div class="nn-container ev-hero__grid">
		<div class="ev-hero__copy">
			<?php if ( $offer ) : ?>
				<span class="nn-badge"><?php echo esc_html( nn_theme_option( 'offer_label' ) ); ?> <?php esc_html_e( 'on any formula', 'evenly' ); ?></span>
			<?php endif; ?>
			<h1 id="ev-hero-title"><?php esc_html_e( 'Feel even again.', 'evenly' ); ?></h1>
			<p class="nn-lead"><?php esc_html_e( 'Clean, honest formulas for the sleepless nights, cramps and bloat women are told to just live with.*', 'evenly' ); ?></p>
			<ul class="ev-hero__needs" aria-label="<?php esc_attr_e( 'Shop by need', 'evenly' ); ?>">
				<?php foreach ( nn_get_concerns( false ) as $term ) : ?>
					<li><a href="<?php echo esc_url( get_term_link( $term ) ); ?>"><i style="--dot:<?php echo esc_attr( nn_concern_color( $term->slug ) ); ?>"></i><?php echo esc_html( $term->name ); ?></a></li>
				<?php endforeach; ?>
			</ul>
			<div class="nn-hero__ctas">
				<a class="nn-btn nn-btn--lg" href="#build"><?php esc_html_e( 'Build your 3', 'evenly' ); ?></a>
				<a class="nn-btn nn-btn--secondary nn-btn--lg" href="#nn-quiz"><?php esc_html_e( 'Find my formula', 'evenly' ); ?></a>
			</div>
			<ul class="nn-hero__proof">
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php echo esc_html( sprintf( /* translators: %d days */ __( '%d-day money-back guarantee', 'evenly' ), (int) nn_theme_option( 'guarantee_days', 30 ) ) ); ?></li>
				<li><?php echo nn_icon( 'check', 18 ); // phpcs:ignore ?> <?php echo esc_html( sprintf( /* translators: %d dollars */ __( 'Free US shipping over $%d', 'evenly' ), (int) nn_theme_option( 'free_ship_min', 50 ) ) ); ?></li>
			</ul>
		</div>
		<div class="ev-hero__visual">
			<span class="ev-slices" aria-hidden="true"><svg viewBox="0 0 200 200" focusable="false"><path d="M0 100 A100 100 0 0 1 100 0 L100 100 Z" fill="#EE91AC" opacity=".55"/><path d="M0 200 L0 100 A100 100 0 0 1 100 200 Z" fill="#FFC857" opacity=".75"/><path d="M60 200 A100 100 0 0 1 200 70 L200 200 Z" fill="#FF735E"/></svg></span>
			<picture>
				<source media="(max-width: 900px)" srcset="<?php echo esc_url( nn_img( 'hero-960.webp' ) ); ?>">
				<img class="ev-hero__photo" src="<?php echo esc_url( nn_img( 'hero.webp' ) ); ?>" alt="<?php esc_attr_e( 'Woman waking up rested in bed with a cup of tea', 'evenly' ); ?>" width="1920" height="1088" fetchpriority="high">
			</picture>
			<img class="ev-hero__product" src="<?php echo esc_url( nn_img( 'p-sleep.webp' ) ); ?>" alt="<?php esc_attr_e( 'evenly Sleep bottle (packaging render)', 'evenly' ); ?>" width="1000" height="1000">
		</div>
	</div>
</section>
