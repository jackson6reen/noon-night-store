<?php
/**
 * Home: how it works.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$steps = array(
	array( __( 'Pick what you need', 'evenly' ), __( 'Sleep, period comfort, bloating or stress. Or take the 30-second quiz.', 'evenly' ) ),
	array( __( 'Build your 3, or buy one', 'evenly' ), __( 'Any three single formulas: the lowest-priced one is free. One formula on its own is fine too.', 'evenly' ) ),
	array( __( 'Give it a fair try', 'evenly' ), __( "Some formulas take a full cycle or more. If your first order isn't for you, we refund it.", 'evenly' ) ),
);
?>
<section class="nn-section nn-section--ink" aria-labelledby="nn-how-title">
	<div class="nn-container">
		<div class="nn-section__head">
			<h2 id="nn-how-title"><?php esc_html_e( 'How it works', 'evenly' ); ?></h2>
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
