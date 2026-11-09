<?php
/**
 * Blog post card.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
?>
<article <?php post_class( 'nn-post-card' ); ?>>
	<a class="nn-post-card__link" href="<?php the_permalink(); ?>">
		<?php if ( has_post_thumbnail() ) : ?>
			<?php the_post_thumbnail( 'nn-card', array( 'loading' => 'lazy', 'alt' => '' ) ); ?>
		<?php else : ?>
			<span class="nn-post-card__art" aria-hidden="true"><?php echo nn_icon( 'leaf', 40 ); // phpcs:ignore ?></span>
		<?php endif; ?>
		<span class="nn-post-card__body">
			<?php
			$cats = get_the_category();
			if ( $cats ) {
				echo '<span class="nn-eyebrow">' . esc_html( $cats[0]->name ) . '</span>';
			}
			?>
			<span class="nn-post-card__title"><?php the_title(); ?></span>
			<span class="nn-post-card__excerpt"><?php echo esc_html( get_the_excerpt() ); ?></span>
			<span class="nn-post-card__meta"><?php echo esc_html( sprintf( /* translators: %d minutes */ __( '%d min read', 'noon-night' ), nn_reading_time() ) ); ?></span>
		</span>
	</a>
</article>
