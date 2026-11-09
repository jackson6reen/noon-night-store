<?php
/**
 * Single blog post: built for SEO (clear H1, byline, updated date, TOC-friendly
 * headings, product CTA, related reads).
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
get_header();

while ( have_posts() ) :
	the_post();
	$cats = get_the_category();
	?>
	<main id="main" class="nn-main">
		<article <?php post_class( 'nn-article' ); ?>>
			<header class="nn-article__head nn-container nn-container--narrow">
				<?php if ( $cats ) : ?>
					<a class="nn-eyebrow" href="<?php echo esc_url( get_category_link( $cats[0] ) ); ?>"><?php echo esc_html( $cats[0]->name ); ?></a>
				<?php endif; ?>
				<h1><?php the_title(); ?></h1>
				<?php if ( has_excerpt() ) : ?>
					<p class="nn-lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
				<?php endif; ?>
				<p class="nn-article__meta">
					<?php
					$nn_author_name = get_the_author();
					if ( $nn_author_name ) {
						/* translators: %s: author */
						echo esc_html( sprintf( __( 'By %s', 'noon-night' ), $nn_author_name ) ) . ' · ';
					}
					printf(
						/* translators: 1: date, 2: minutes */
						esc_html__( 'Updated %1$s · %2$d min read', 'noon-night' ),
						'<time datetime="' . esc_attr( get_the_modified_date( 'c' ) ) . '">' . esc_html( get_the_modified_date() ) . '</time>', // phpcs:ignore
						(int) nn_reading_time()
					);
					?>
				</p>
			</header>

			<?php if ( has_post_thumbnail() ) : ?>
				<figure class="nn-article__hero nn-container"><?php the_post_thumbnail( 'large', array( 'fetchpriority' => 'high' ) ); ?></figure>
			<?php endif; ?>

			<div class="nn-prose nn-container nn-container--narrow">
				<?php the_content(); ?>

				<?php
				if ( function_exists( 'nn_render_faq' ) && function_exists( 'nn_pairs' ) ) {
					$faq = nn_pairs( get_post_meta( get_the_ID(), 'nn_faq', true ) );
					if ( $faq ) {
						echo '<h2>' . esc_html__( 'Frequently asked questions', 'noon-night' ) . '</h2>';
						nn_render_faq( $faq );
					}
				}
				?>

				<aside class="nn-medical-note">
					<p><strong><?php esc_html_e( 'This article is for education, not medical advice.', 'noon-night' ); ?></strong>
					<?php esc_html_e( 'If your symptoms are severe, sudden or getting worse, please talk to your doctor.', 'noon-night' ); ?></p>
				</aside>
			</div>
		</article>

		<?php
		$related = new WP_Query( array(
			'post_type'           => 'post',
			'posts_per_page'      => 3,
			'post__not_in'        => array( get_the_ID() ),
			'category__in'        => wp_list_pluck( $cats, 'term_id' ),
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		) );
		if ( $related->have_posts() ) :
			?>
			<section class="nn-section nn-container" aria-labelledby="nn-related">
				<h2 id="nn-related"><?php esc_html_e( 'Keep reading', 'noon-night' ); ?></h2>
				<div class="nn-post-grid">
					<?php
					while ( $related->have_posts() ) :
						$related->the_post();
						get_template_part( 'template-parts/card', 'post' );
					endwhile;
					wp_reset_postdata();
					?>
				</div>
			</section>
		<?php endif; ?>
	</main>
	<?php
endwhile;

get_footer();
