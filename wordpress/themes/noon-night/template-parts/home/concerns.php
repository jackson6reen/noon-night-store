<?php
/**
 * Home: shop by concern.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
$concerns = nn_get_concerns( false );
if ( ! $concerns ) {
	return;
}
?>
<section class="nn-section nn-container" aria-labelledby="nn-concerns-title">
	<div class="nn-section__head">
		<h2 id="nn-concerns-title"><?php esc_html_e( 'What do you need help with?', 'noon-night' ); ?></h2>
		<p><?php esc_html_e( 'Start with what hurts. We\'ll show you what can help, and why.', 'noon-night' ); ?></p>
	</div>
	<div class="nn-concern-grid">
		<?php foreach ( $concerns as $term ) : ?>
			<?php
			$icon    = function_exists( 'nn_concern_field' ) ? nn_concern_field( $term->term_id, 'nn_icon' ) : '';
			$tagline = function_exists( 'nn_concern_field' ) ? nn_concern_field( $term->term_id, 'nn_tagline' ) : '';
			?>
			<a class="nn-concern" href="<?php echo esc_url( get_term_link( $term ) ); ?>" style="--accent:<?php echo esc_attr( nn_concern_color( $term->slug ) ); ?>">
				<span class="nn-concern__icon"><?php echo nn_icon( $icon ?: 'leaf', 28 ); // phpcs:ignore ?></span>
				<span class="nn-concern__name"><?php echo esc_html( $term->name ); ?></span>
				<?php if ( $tagline ) : ?>
					<span class="nn-concern__tag"><?php echo esc_html( $tagline ); ?></span>
				<?php endif; ?>
				<span class="nn-concern__go"><?php esc_html_e( 'Explore', 'noon-night' ); ?> <?php echo nn_icon( 'arrow', 16 ); // phpcs:ignore ?></span>
			</a>
		<?php endforeach; ?>
	</div>
</section>
