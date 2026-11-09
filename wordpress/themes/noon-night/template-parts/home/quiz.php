<?php
/**
 * Home: 3-question matcher. Runs fully in the browser; answers are not stored or sent anywhere.
 * Each answer adds points to concern slugs; the top concern hub is recommended.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

$links = array();
foreach ( nn_get_concerns( true ) as $term ) {
	$links[ $term->slug ] = array(
		'url'  => get_term_link( $term ),
		'name' => $term->name,
	);
}
if ( ! $links ) {
	return;
}

$questions = array(
	array(
		'q' => __( 'What bothers you most right now?', 'noon-night' ),
		'a' => array(
			array( __( "I can't fall asleep, or I wake up at 3 a.m.", 'noon-night' ), 'sleep' ),
			array( __( 'Cramps, PMS or my period wipes me out', 'noon-night' ), 'period-comfort' ),
			array( __( "I'm bloated or gassy most days", 'noon-night' ), 'bloating-gut' ),
			array( __( "I'm stressed and can't switch off", 'noon-night' ), 'stress-calm' ),
		),
	),
	array(
		'q' => __( 'When is it worst?', 'noon-night' ),
		'a' => array(
			array( __( 'At night', 'noon-night' ), 'sleep' ),
			array( __( 'The week before or during my period', 'noon-night' ), 'period-comfort' ),
			array( __( 'After meals', 'noon-night' ), 'bloating-gut' ),
			array( __( 'All day, it builds up', 'noon-night' ), 'stress-calm' ),
		),
	),
	array(
		'q' => __( 'Does anything else tag along?', 'noon-night' ),
		'a' => array(
			array( __( 'Tired but wired at bedtime', 'noon-night' ), 'sleep' ),
			array( __( 'Bloating around my period', 'noon-night' ), 'period-comfort' ),
			array( __( 'Irregular or uncomfortable digestion', 'noon-night' ), 'bloating-gut' ),
			array( __( "More than one of these, honestly", 'noon-night' ), 'bundles' ),
		),
	),
);
?>
<section class="nn-section nn-container" id="nn-quiz" aria-labelledby="nn-quiz-title">
	<div class="nn-quiz" data-nn-quiz data-links="<?php echo esc_attr( wp_json_encode( $links ) ); ?>">
		<div class="nn-quiz__intro">
			<p class="nn-eyebrow"><?php esc_html_e( '30-second match', 'noon-night' ); ?></p>
			<h2 id="nn-quiz-title"><?php esc_html_e( 'Not sure where to start?', 'noon-night' ); ?></h2>
			<p><?php esc_html_e( 'Answer three quick questions and we\'ll point you to the routine that fits.', 'noon-night' ); ?></p>
		</div>
		<form class="nn-quiz__form" novalidate>
			<?php foreach ( $questions as $i => $question ) : ?>
				<fieldset class="nn-quiz__step" data-step="<?php echo (int) $i; ?>" <?php echo $i ? 'hidden' : ''; ?>>
					<legend><span class="nn-quiz__count"><?php echo esc_html( sprintf( '%d / %d', $i + 1, count( $questions ) ) ); ?></span> <?php echo esc_html( $question['q'] ); ?></legend>
					<?php foreach ( $question['a'] as $j => $answer ) : ?>
						<label class="nn-quiz__option">
							<input type="radio" name="q<?php echo (int) $i; ?>" value="<?php echo esc_attr( $answer[1] ); ?>">
							<span><?php echo esc_html( $answer[0] ); ?></span>
						</label>
					<?php endforeach; ?>
				</fieldset>
			<?php endforeach; ?>
			<div class="nn-quiz__result" hidden aria-live="polite">
				<p class="nn-eyebrow"><?php esc_html_e( 'Your best place to start', 'noon-night' ); ?></p>
				<p class="nn-quiz__result-name"></p>
				<a class="nn-btn nn-btn--lg nn-quiz__result-link" href="#"><?php esc_html_e( 'See my routine', 'noon-night' ); ?></a>
				<button type="button" class="nn-link-btn" data-nn-quiz-restart><?php esc_html_e( 'Start over', 'noon-night' ); ?></button>
			</div>
		</form>
	</div>
</section>
