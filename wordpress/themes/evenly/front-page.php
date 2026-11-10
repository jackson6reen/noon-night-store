<?php
/**
 * Homepage. Each section is its own template part in template-parts/home/,
 * so sections can be reordered, A/B tested or removed in one line.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main" class="nn-main nn-home">
	<?php
	$nn_sections = array(
		'hero',          // Offer-led promise + 2 CTAs.
		'offer-band',    // Scrolling offer / trust strip.
		'concerns',      // "Shop by what hurts" photo tiles = links to concern hubs.
		'build',         // "Build your 3" picker: the main AOV lever (buy 2, get 1 free).
		'bestsellers',   // Ready-made kits.
		'lineup',        // Product lineup band.
		'quiz',          // 3-question matcher.
		'difference',    // Why we're different vs. the drugstore aisle.
		'how',           // 3 steps.
		'guarantee',     // Risk reversal.
		'journal',       // Latest articles (internal links for SEO).
		'faq',           // FAQ from the Home page's nn_faq field.
	);
	foreach ( $nn_sections as $nn_section ) {
		get_template_part( 'template-parts/home/' . $nn_section );
	}
	?>
</main>
<?php
get_footer();
