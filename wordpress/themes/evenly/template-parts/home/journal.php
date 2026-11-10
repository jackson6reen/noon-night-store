<?php
/**
 * Home: latest journal articles (internal links pass authority to the blog).
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$posts = new WP_Query( array(
	'post_type'           => 'post',
	'posts_per_page'      => 3,
	'ignore_sticky_posts' => true,
	'no_found_rows'       => true,
) );
if ( ! $posts->have_posts() ) {
	return;
}
$blog = get_option( 'page_for_posts' ) ? get_permalink( get_option( 'page_for_posts' ) ) : home_url( '/blog/' );
?>
<section class="nn-section nn-section--tint" aria-labelledby="nn-journal-title">
	<div class="nn-container">
		<div class="nn-section__head nn-section__head--row">
			<h2 id="nn-journal-title"><?php esc_html_e( 'The Journal: honest answers', 'evenly' ); ?></h2>
			<a href="<?php echo esc_url( $blog ); ?>"><?php esc_html_e( 'All articles', 'evenly' ); ?> <?php echo nn_icon( 'arrow', 16 ); // phpcs:ignore ?></a>
		</div>
		<div class="nn-post-grid">
			<?php
			while ( $posts->have_posts() ) :
				$posts->the_post();
				get_template_part( 'template-parts/card', 'post' );
			endwhile;
			wp_reset_postdata();
			?>
		</div>
	</div>
</section>
