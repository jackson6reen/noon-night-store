<?php
/**
 * Home: why we're different (objection handling).
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$rows = array(
	array( __( 'Melatonin dose', 'evenly' ), __( 'Often 5–10 mg, the "groggy tomorrow" dose', 'evenly' ), __( 'Low dose, paired with magnesium', 'evenly' ) ),
	array( __( 'Magnesium form', 'evenly' ), __( 'Oxide: cheap, poorly absorbed, laxative', 'evenly' ), __( 'Glycinate: gentle and well absorbed', 'evenly' ) ),
	array( __( 'Labels', 'evenly' ), __( '"Proprietary blends" that hide the doses', 'evenly' ), __( 'Every ingredient and amount listed', 'evenly' ) ),
	array( __( 'Approach', 'evenly' ), __( 'Mask one symptom for a few hours', 'evenly' ), __( 'Daily routines that support the root rhythm*', 'evenly' ) ),
	array( __( 'If it doesn\'t work', 'evenly' ), __( 'You\'re out the money', 'evenly' ), __( 'Full refund on your first order', 'evenly' ) ),
);
?>
<section class="nn-section nn-container" aria-labelledby="nn-diff-title">
	<div class="nn-section__head">
		<h2 id="nn-diff-title"><?php esc_html_e( 'Why women switch from the drugstore aisle', 'evenly' ); ?></h2>
		<p><?php esc_html_e( 'You\'ve probably tried something already. Here\'s what we do differently.', 'evenly' ); ?></p>
	</div>
	<div class="nn-table-wrap">
		<table class="nn-compare">
			<thead>
				<tr>
					<td></td>
					<th scope="col"><?php esc_html_e( 'Typical drugstore', 'evenly' ); ?></th>
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
