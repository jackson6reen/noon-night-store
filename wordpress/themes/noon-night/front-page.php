<?php
/**
 * Homepage. Each section is its own template part in template-parts/home/,
 * so sections can be reordered, A/B tested or removed in one line.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main" class="nn-main nn-home">
	<?php
	$nn_sections = array(
		'hero',          // Pain-led promise + 2 CTAs.
		'concerns',      // "What do you need help with?" tiles = links to concern hubs.
		'bestsellers',   // Bundles first (highest AOV).
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
