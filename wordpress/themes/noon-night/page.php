<?php
/**
 * Generic page (legal pages, About, FAQ, Cart, Checkout, My Account).
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
get_header();

$nn_is_store_page = function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() );

while ( have_posts() ) :
	the_post();
	?>
	<main id="main" class="nn-main">
		<div class="nn-container <?php echo $nn_is_store_page ? '' : 'nn-container--narrow'; ?>">
			<header class="nn-page-head">
				<h1><?php the_title(); ?></h1>
			</header>
			<div class="<?php echo $nn_is_store_page ? 'nn-store-page' : 'nn-prose'; ?>">
				<?php the_content(); ?>
				<?php
				if ( function_exists( 'nn_render_faq' ) ) {
					nn_render_faq( nn_pairs( get_post_meta( get_the_ID(), 'nn_faq', true ) ) );
				}
				?>
			</div>
		</div>
	</main>
	<?php
endwhile;

get_footer();
