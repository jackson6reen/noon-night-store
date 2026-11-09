<?php
/**
 * Home: how it works.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

$steps = array(
	array( __( 'Pick what hurts', 'noon-night' ), __( 'Sleep, period, bloating or stress. Or take the 30-second quiz.', 'noon-night' ) ),
	array( __( 'Make it a ritual', 'noon-night' ), __( 'Clear directions for when to take each one. Most routines take under a minute a day.', 'noon-night' ) ),
	array( __( 'Give it 30 days', 'noon-night' ), __( 'Many women notice a difference in the first weeks. If you don\'t, we refund your first order.', 'noon-night' ) ),
);
?>
<section class="nn-section nn-section--night" aria-labelledby="nn-how-title">
	<div class="nn-container">
		<div class="nn-section__head">
			<h2 id="nn-how-title"><?php esc_html_e( 'How it works', 'noon-night' ); ?></h2>
		</div>
		<ol class="nn-steps">
			<?php foreach ( $steps as $i => $step ) : ?>
				<li>
					<span class="nn-steps__num" aria-hidden="true"><?php echo (int) $i + 1; ?></span>
					<h3><?php echo esc_html( $step[0] ); ?></h3>
					<p><?php echo esc_html( $step[1] ); ?></p>
				</li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>
