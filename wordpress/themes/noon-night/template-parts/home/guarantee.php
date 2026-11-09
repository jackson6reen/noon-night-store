<?php
/**
 * Home: guarantee (risk reversal).
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
$days = (int) nn_theme_option( 'guarantee_days', 30 );
?>
<section class="nn-section nn-container" aria-labelledby="nn-guarantee-title">
	<div class="nn-guarantee">
		<div class="nn-guarantee__seal" aria-hidden="true">
			<span><?php echo (int) $days; ?></span>
			<small><?php esc_html_e( 'DAYS', 'noon-night' ); ?></small>
		</div>
		<div>
			<h2 id="nn-guarantee-title"><?php echo esc_html( sprintf( /* translators: %d days */ __( 'The %d-day "feel the difference" guarantee', 'noon-night' ), $days ) ); ?></h2>
			<p><?php esc_html_e( 'Try your first order for a full cycle. If you don\'t feel it\'s helping, email us and we\'ll refund you. No forms, and no need to send the bottle back.', 'noon-night' ); ?></p>
			<a href="<?php echo esc_url( home_url( '/refund-policy/' ) ); ?>"><?php esc_html_e( 'Read the refund policy', 'noon-night' ); ?></a>
		</div>
	</div>
</section>
