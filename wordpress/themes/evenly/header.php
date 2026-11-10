<?php
/**
 * Site header.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#3B2A5A">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="nn-skip" href="#main"><?php esc_html_e( 'Skip to content', 'evenly' ); ?></a>

<?php nn_announcement(); ?>

<header class="nn-header">
	<div class="nn-container nn-header__bar">
		<button class="nn-icon-btn nn-menu-toggle" type="button" aria-controls="nn-nav" aria-expanded="false">
			<?php echo nn_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<span class="screen-reader-text"><?php esc_html_e( 'Menu', 'evenly' ); ?></span>
		</button>

		<div class="nn-logo">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php esc_attr_e( 'Evenly home', 'evenly' ); ?>"><?php nn_logo(); ?></a>
			<?php endif; ?>
		</div>

		<nav id="nn-nav" class="nn-nav" aria-label="<?php esc_attr_e( 'Main', 'evenly' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'depth' => 2 ) );
			}
			?>
		</nav>

		<div class="nn-header__actions">
			<a class="nn-icon-btn" href="<?php echo esc_url( home_url( '/?s=&post_type=product' ) ); ?>" data-nn-search>
				<?php echo nn_icon( 'search' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span class="screen-reader-text"><?php esc_html_e( 'Search', 'evenly' ); ?></span>
			</a>
			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<a class="nn-icon-btn nn-hide-sm" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">
					<?php echo nn_icon( 'user' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span class="screen-reader-text"><?php esc_html_e( 'My account', 'evenly' ); ?></span>
				</a>
				<a class="nn-icon-btn nn-cart-link" href="<?php echo esc_url( wc_get_cart_url() ); ?>">
					<?php echo nn_icon( 'cart' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span class="screen-reader-text"><?php esc_html_e( 'Cart', 'evenly' ); ?></span>
					<?php nn_cart_count(); ?>
				</a>
			<?php endif; ?>
		</div>
	</div>

	<div class="nn-search-panel" hidden>
		<div class="nn-container">
			<?php
			if ( function_exists( 'get_product_search_form' ) ) {
				get_product_search_form();
			} else {
				get_search_form();
			}
			?>
		</div>
	</div>
</header>
