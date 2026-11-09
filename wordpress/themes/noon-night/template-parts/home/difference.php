<?php
/**
 * Home: why we're different (objection handling).
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

$rows = array(
	array( __( 'Melatonin dose', 'noon-night' ), __( 'Often 5–10 mg, the "groggy tomorrow" dose', 'noon-night' ), __( 'Low dose, paired with magnesium', 'noon-night' ) ),
	array( __( 'Magnesium form', 'noon-night' ), __( 'Oxide: cheap, poorly absorbed, laxative', 'noon-night' ), __( 'Glycinate: gentle and well absorbed', 'noon-night' ) ),
	array( __( 'Labels', 'noon-night' ), __( '"Proprietary blends" that hide the doses', 'noon-night' ), __( 'Every ingredient and amount listed', 'noon-night' ) ),
	array( __( 'Approach', 'noon-night' ), __( 'Mask one symptom for a few hours', 'noon-night' ), __( 'Daily routines that support the root rhythm*', 'noon-night' ) ),
	array( __( 'If it doesn\'t work', 'noon-night' ), __( 'You\'re out the money', 'noon-night' ), __( 'Full refund on your first order', 'noon-night' ) ),
);
?>
<section class="nn-section nn-container" aria-labelledby="nn-diff-title">
	<div class="nn-section__head">
		<h2 id="nn-diff-title"><?php esc_html_e( 'Why women switch from the drugstore aisle', 'noon-night' ); ?></h2>
		<p><?php esc_html_e( 'You\'ve probably tried something already. Here\'s what we do differently.', 'noon-night' ); ?></p>
	</div>
	<div class="nn-table-wrap">
		<table class="nn-compare">
			<thead>
				<tr>
					<td></td>
					<th scope="col"><?php esc_html_e( 'Typical drugstore', 'noon-night' ); ?></th>
					<th scope="col" class="nn-compare__us"><?php bloginfo( 'name' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $rows as $row ) : ?>
					<tr>
						<th scope="row"><?php echo esc_html( $row[0] ); ?></th>
						<td><?php echo esc_html( $row[1] ); ?></td>
						<td class="nn-compare__us"><?php echo esc_html( $row[2] ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</section>
