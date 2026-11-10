<?php
/**
 * Home: shop by what hurts (lifestyle photo tiles).
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
$concerns = nn_get_concerns( false );
if ( ! $concerns ) {
	return;
}
?>
<section class="nn-section nn-container" aria-labelledby="nn-concerns-title">
	<div class="nn-section__head">
		<p class="nn-eyebrow"><?php esc_html_e( 'Shop by what hurts', 'evenly' ); ?></p>
		<h2 id="nn-concerns-title"><?php esc_html_e( "What's keeping you from feeling like you?", 'evenly' ); ?></h2>
	</div>
	<div class="nn-concern-grid">
		<?php foreach ( $concerns as $term ) : ?>
			<?php
			$tagline = function_exists( 'nn_concern_field' ) ? nn_concern_field( $term->term_id, 'nn_tagline' ) : '';
			$image   = nn_concern_image( $term );
			?>
			<a class="nn-concern" href="<?php echo esc_url( get_term_link( $term ) ); ?>" style="--accent:<?php echo esc_attr( nn_concern_color( $term->slug ) ); ?>">
				<?php if ( $image ) : ?>
					<img class="nn-concern__img" src="<?php echo esc_url( $image ); ?>" alt="" loading="lazy" width="960" height="1280">
				<?php endif; ?>
				<span class="nn-concern__name"><?php echo esc_html( $term->name ); ?></span>
				<?php if ( $tagline ) : ?>
					<span class="nn-concern__tag"><?php echo esc_html( $tagline ); ?></span>
				<?php endif; ?>
				<span class="nn-concern__go"><?php esc_html_e( 'Shop now', 'evenly' ); ?></span>
			</a>
		<?php endforeach; ?>
	</div>
</section>
