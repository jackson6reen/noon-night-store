<?php
/**
 * Site footer: trust, navigation, legal, FDA disclaimer.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
?>
<section class="nn-trust-strip" aria-label="<?php esc_attr_e( 'Why shop with us', 'evenly' ); ?>">
	<div class="nn-container nn-trust-strip__grid">
		<p><?php echo nn_icon( 'shield' ); // phpcs:ignore ?> <span><?php echo esc_html( sprintf( /* translators: %d days */ __( '%d-day money-back guarantee', 'evenly' ), (int) nn_theme_option( 'guarantee_days', 30 ) ) ); ?></span></p>
		<p><?php echo nn_icon( 'truck' ); // phpcs:ignore ?> <span><?php echo esc_html( sprintf( /* translators: %d dollars */ __( 'Free US shipping over $%d', 'evenly' ), (int) nn_theme_option( 'free_ship_min', 50 ) ) ); ?></span></p>
		<p><?php echo nn_icon( 'flask' ); // phpcs:ignore ?> <span><?php esc_html_e( 'Made in the USA, cGMP facility', 'evenly' ); ?></span></p>
		<p><?php echo nn_icon( 'heart' ); // phpcs:ignore ?> <span><?php esc_html_e( 'Real people answer support emails', 'evenly' ); ?></span></p>
	</div>
</section>

<footer class="nn-footer">
	<div class="nn-container">
		<div class="nn-footer__grid">
			<div class="nn-footer__brand">
				<p class="nn-footer__logo"><?php nn_logo( 34 ); ?></p>
				<p><?php esc_html_e( 'Clean, honest formulas for sleep, cramps, bloating and stress. Made for women who are done just pushing through.', 'evenly' ); ?></p>
				<p><a href="mailto:<?php echo esc_attr( antispambot( nn_theme_option( 'support_email' ) ) ); ?>"><?php echo esc_html( antispambot( nn_theme_option( 'support_email' ) ) ); ?></a></p>
			</div>
			<?php
			nn_footer_menu( 'footer_shop', __( 'Shop', 'evenly' ) );
			nn_footer_menu( 'footer_help', __( 'Help', 'evenly' ) );
			nn_footer_menu( 'footer_legal', __( 'Legal', 'evenly' ) );
			?>
		</div>

		<p class="nn-fda nn-footer__fda"><?php echo esc_html( function_exists( 'nn_fda_disclaimer' ) ? nn_fda_disclaimer() : '' ); ?></p>

		<div class="nn-footer__bottom">
			<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( nn_theme_option( 'legal_entity', get_bloginfo( 'name' ) ) ); ?>. <?php esc_html_e( 'All rights reserved.', 'evenly' ); ?></p>
			<p><a href="#privacy-choices" class="nn-privacy-choices"><?php esc_html_e( 'Your Privacy Choices', 'evenly' ); ?></a></p>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
