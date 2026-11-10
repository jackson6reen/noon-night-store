<?php
/**
 * Fallback template (blog index, archives without a specific template).
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main" class="nn-main">
	<div class="nn-container">
		<header class="nn-page-head">
			<?php if ( is_home() && ! is_front_page() ) : ?>
				<h1><?php single_post_title(); ?></h1>
				<p class="nn-lead"><?php esc_html_e( 'Straight answers about sleep, periods, bloating and stress, written for real life and backed by research.', 'evenly' ); ?></p>
			<?php elseif ( is_search() ) : ?>
				<h1><?php printf( /* translators: %s query */ esc_html__( 'Results for "%s"', 'evenly' ), esc_html( get_search_query() ) ); ?></h1>
			<?php else : ?>
				<?php the_archive_title( '<h1>', '</h1>' ); ?>
				<?php the_archive_description( '<div class="nn-lead">', '</div>' ); ?>
			<?php endif; ?>
		</header>

		<?php if ( have_posts() ) : ?>
			<div class="nn-post-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'template-parts/card', 'post' );
				endwhile;
				?>
			</div>
			<?php the_posts_pagination( array( 'mid_size' => 1 ) ); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'Nothing here yet.', 'evenly' ); ?></p>
			<?php get_search_form(); ?>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
