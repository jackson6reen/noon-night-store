<?php
/**
 * 404: send people somewhere useful instead of a dead end.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main" class="nn-main">
	<div class="nn-container nn-container--narrow nn-center">
		<h1><?php esc_html_e( "This page is taking a nap.", 'evenly' ); ?></h1>
		<p class="nn-lead"><?php esc_html_e( "We couldn't find it. Here's where most people were headed:", 'evenly' ); ?></p>
		<div class="nn-chips nn-chips--center">
			<?php foreach ( nn_get_concerns( true ) as $term ) : ?>
				<a href="<?php echo esc_url( get_term_link( $term ) ); ?>"><?php echo esc_html( $term->name ); ?></a>
			<?php endforeach; ?>
		</div>
		<?php get_search_form(); ?>
	</div>
</main>
<?php
get_footer();
