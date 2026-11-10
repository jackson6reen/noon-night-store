<?php
/**
 * Blog post card. Without a featured image, it uses the lifestyle photo for the post's category.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

$cats    = get_the_category();
$fallback = array(
	'sleep'          => 'l-sleep.webp',
	'period-comfort' => 'l-cycle.webp',
	'bloating-gut'   => 'l-gut.webp',
	'stress'         => 'l-calm.webp',
);
$cat_slug = $cats ? $cats[0]->slug : '';
?>
<article <?php post_class( 'nn-post-card' ); ?>>
	<a class="nn-post-card__link" href="<?php the_permalink(); ?>">
		<?php if ( has_post_thumbnail() ) : ?>
			<?php the_post_thumbnail( 'nn-card', array( 'loading' => 'lazy', 'alt' => '' ) ); ?>
		<?php else : ?>
			<span class="nn-post-card__art"><img src="<?php echo esc_url( nn_img( isset( $fallback[ $cat_slug ] ) ? $fallback[ $cat_slug ] : 'lineup-960.webp' ) ); ?>" alt="" loading="lazy" width="960" height="600"></span>
		<?php endif; ?>
		<span class="nn-post-card__body">
			<?php if ( $cats ) : ?>
				<span class="nn-eyebrow"><?php echo esc_html( $cats[0]->name ); ?></span>
			<?php endif; ?>
			<span class="nn-post-card__title"><?php the_title(); ?></span>
			<span class="nn-post-card__excerpt"><?php echo esc_html( get_the_excerpt() ); ?></span>
			<span class="nn-post-card__meta"><?php echo esc_html( sprintf( /* translators: %d minutes */ __( '%d min read', 'evenly' ), nn_reading_time() ) ); ?></span>
		</span>
	</a>
</article>
