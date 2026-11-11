<?php
/**
 * Evenly content seeder.
 *
 * Imports concern hubs, products, bundles, pages, journal posts, menus and shipping
 * from wordpress/setup/data + wordpress/setup/content.
 *
 * SAFE BY DEFAULT: existing pages/posts/products with the same slug or SKU are left alone,
 * and site-wide settings (homepage, permalinks, menus) are NOT changed.
 *
 * Run with WP-CLI from the WordPress root:
 *   wp eval-file /path/to/wordpress/setup/seed.php                     # content only, skip existing
 *   NN_SEED_OVERWRITE=1 wp eval-file .../seed.php                      # also update existing items
 *   NN_SEED_FRESH_SITE=1 wp eval-file .../seed.php                     # new site: also set homepage, menus, permalinks, shipping
 *
 * @package Evenly
 */

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "Run this through WP-CLI: wp eval-file seed.php\n" );
	exit( 1 );
}
if ( ! class_exists( 'WooCommerce' ) ) {
	nn_seed_log( 'WooCommerce must be active.' );
	return;
}

define( 'NN_SEED_DIR', __DIR__ );
$nn_overwrite = (bool) getenv( 'NN_SEED_OVERWRITE' ) || ( defined( 'NN_SEED_OVERWRITE' ) && NN_SEED_OVERWRITE );
$nn_fresh     = (bool) getenv( 'NN_SEED_FRESH_SITE' ) || ( defined( 'NN_SEED_FRESH_SITE' ) && NN_SEED_FRESH_SITE );

function nn_seed_log( $msg ) {
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		WP_CLI::log( $msg );
	} else {
		echo esc_html( $msg ) . "\n";
	}
}

/**
 * Read a content file: returns [meta array, html body].
 */
function nn_seed_read( $relative ) {
	$path = NN_SEED_DIR . '/content/' . $relative;
	if ( ! file_exists( $path ) ) {
		return array( array(), '' );
	}
	$raw  = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$meta = array();
	if ( preg_match( '/^\s*<!--meta\s*(\{.*?\})\s*-->/s', $raw, $m ) ) {
		$meta = json_decode( $m[1], true );
		if ( null === $meta ) {
			nn_seed_log( "  ! Invalid JSON meta in $relative" );
			$meta = array();
		}
		$raw = substr( $raw, strlen( $m[0] ) );
	}
	return array( $meta, trim( $raw ) );
}

function nn_seed_faq_text( $faq ) {
	if ( empty( $faq ) || ! is_array( $faq ) ) {
		return '';
	}
	return implode( "\n", array_map( function ( $p ) {
		return str_replace( '|', '/', $p[0] ) . ' | ' . str_replace( '|', '/', $p[1] );
	}, $faq ) );
}

/**
 * SEO meta for Rank Math and Yoast (whichever is installed reads its own keys) + our fallback.
 */
function nn_seed_post_seo( $post_id, $meta ) {
	if ( ! empty( $meta['description'] ) ) {
		update_post_meta( $post_id, 'nn_meta_description', $meta['description'] );
		update_post_meta( $post_id, 'rank_math_description', $meta['description'] );
		update_post_meta( $post_id, '_yoast_wpseo_metadesc', $meta['description'] );
	}
	if ( ! empty( $meta['seo_title'] ) ) {
		update_post_meta( $post_id, 'nn_seo_title', $meta['seo_title'] );
		update_post_meta( $post_id, 'rank_math_title', $meta['seo_title'] );
		update_post_meta( $post_id, '_yoast_wpseo_title', $meta['seo_title'] );
	}
	if ( ! empty( $meta['faq'] ) ) {
		update_post_meta( $post_id, 'nn_faq', nn_seed_faq_text( $meta['faq'] ) );
	}
}

$data = json_decode( file_get_contents( NN_SEED_DIR . '/data/products.json' ), true ); // phpcs:ignore
if ( ! $data ) {
	nn_seed_log( 'Could not read data/products.json' );
	return;
}

/* ---------------------------------------------------------------- 1. Concern hubs */
nn_seed_log( '1/6 Concern hubs (product categories)' );
$cat_ids = array();
foreach ( $data['concerns'] as $i => $concern ) {
	list( $meta, $body ) = nn_seed_read( $concern['content_file'] );
	$existing            = get_term_by( 'slug', $concern['slug'], 'product_cat' );
	if ( $existing ) {
		$term_id = (int) $existing->term_id;
		if ( $nn_overwrite ) {
			wp_update_term( $term_id, 'product_cat', array( 'name' => $concern['name'], 'description' => $meta['intro'] ?? '' ) );
		}
	} else {
		$res = wp_insert_term( $concern['name'], 'product_cat', array( 'slug' => $concern['slug'], 'description' => $meta['intro'] ?? '' ) );
		if ( is_wp_error( $res ) ) {
			nn_seed_log( '  ! ' . $res->get_error_message() );
			continue;
		}
		$term_id = (int) $res['term_id'];
	}
	$cat_ids[ $concern['slug'] ] = $term_id;
	if ( ! $existing || $nn_overwrite ) {
		update_term_meta( $term_id, 'nn_headline', $concern['headline'] );
		update_term_meta( $term_id, 'nn_tagline', $concern['tagline'] );
		update_term_meta( $term_id, 'nn_icon', $concern['icon'] );
		update_term_meta( $term_id, 'nn_seo_content', $body );
		update_term_meta( $term_id, 'nn_faq', nn_seed_faq_text( $meta['faq'] ?? array() ) );
		update_term_meta( $term_id, 'order', $i + 1 );
		update_term_meta( $term_id, 'nn_meta_description', $meta['description'] ?? '' );
		update_term_meta( $term_id, 'nn_seo_title', $meta['seo_title'] ?? '' );
		update_term_meta( $term_id, 'rank_math_description', $meta['description'] ?? '' );
		update_term_meta( $term_id, 'rank_math_title', $meta['seo_title'] ?? '' );
	}
	// Photo + color are design data, kept in sync on every run.
	update_term_meta( $term_id, 'nn_image', $concern['image'] ?? '' );
	update_term_meta( $term_id, 'nn_color', $concern['color'] ?? '' );
	nn_seed_log( '  ✓ ' . $concern['name'] );
}

/* ---------------------------------------------------------------- 2. Products */
nn_seed_log( '2/6 Products and bundles' );

/**
 * Import an image from the theme's assets/img into the Media Library once (re-used on later runs).
 */
function nn_seed_image( $file ) {
	if ( ! $file ) {
		return 0;
	}
	$existing = get_posts( array(
		'post_type'   => 'attachment',
		'post_status' => 'inherit',
		'meta_key'    => '_ev_source',
		'meta_value'  => $file,
		'fields'      => 'ids',
		'numberposts' => 1,
	) );
	if ( $existing ) {
		return (int) $existing[0];
	}
	$path = get_theme_root() . '/evenly/assets/img/' . $file;
	if ( ! file_exists( $path ) ) {
		nn_seed_log( "  ! Image not found: $path" );
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$upload = wp_upload_bits( $file, null, file_get_contents( $path ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	if ( ! empty( $upload['error'] ) ) {
		nn_seed_log( '  ! Upload failed: ' . $upload['error'] );
		return 0;
	}
	$type = wp_check_filetype( $upload['file'] );
	$id   = wp_insert_attachment( array(
		'post_mime_type' => $type['type'],
		'post_title'     => preg_replace( '/\.[^.]+$/', '', $file ),
		'post_status'    => 'inherit',
	), $upload['file'] );
	wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $upload['file'] ) );
	update_post_meta( $id, '_ev_source', $file );
	return (int) $id;
}

$concern_images = wp_list_pluck( $data['concerns'], 'image', 'slug' );
$all_products   = array_merge( $data['products'], $data['bundles'] );
foreach ( $all_products as $menu_order => $item ) {
	$existing_id = wc_get_product_id_by_sku( $item['sku'] );
	if ( $existing_id && ! $nn_overwrite ) {
		// Still attach photos to products created before images existed.
		$existing = wc_get_product( $existing_id );
		if ( $existing && ! $existing->get_image_id() && ! empty( $item['image'] ) ) {
			$existing->set_image_id( nn_seed_image( $item['image'] ) );
			$existing->save();
			nn_seed_log( '  + photo for ' . $item['sku'] );
		} else {
			nn_seed_log( '  - skip (exists) ' . $item['sku'] );
		}
		continue;
	}
	$product = $existing_id ? wc_get_product( $existing_id ) : new WC_Product_Simple();
	$product->set_menu_order( $menu_order );
	if ( ! empty( $item['image'] ) ) {
		$product->set_image_id( nn_seed_image( $item['image'] ) );
	}
	// Gallery: the lifestyle photo of the product's main concern + the lineup shot.
	$gallery = array();
	if ( empty( $item['includes'] ) ) {
		$main = $concern_images[ $item['concerns'][0] ] ?? '';
		$gallery = array_filter( array( nn_seed_image( $main ), nn_seed_image( 'lineup-960.webp' ) ) );
	}
	$product->set_gallery_image_ids( $gallery );
	$product->set_name( $item['name'] );
	$product->set_slug( $item['slug'] );
	$product->set_sku( $item['sku'] );
	$product->set_regular_price( (string) $item['price'] );
	$product->set_description( $item['description'] );
	$product->set_short_description( '<p>' . esc_html( $item['short'] ) . '</p>' );
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'visible' );
	$product->set_stock_status( 'instock' );
	$product->set_reviews_allowed( true );
	$product->set_category_ids( array_values( array_filter( array_map( function ( $slug ) use ( $cat_ids ) {
		return $cat_ids[ $slug ] ?? 0;
	}, $item['concerns'] ) ) ) );

	$ingredients = '';
	if ( ! empty( $item['ingredients'] ) ) {
		$ingredients = implode( "\n", array_map( function ( $r ) {
			return implode( ' | ', $r );
		}, $item['ingredients'] ) );
	}
	$fields = array(
		'_nn_tagline'        => $item['tagline'] ?? '',
		'_nn_format'         => $item['format'] ?? '',
		'_nn_benefits'       => implode( "\n", $item['benefits'] ?? array() ),
		'_nn_how_to_use'     => $item['how_to_use'] ?? '',
		'_nn_ingredients'    => $ingredients,
		'_nn_warnings'       => $item['warnings'] ?? '',
		'_nn_faq'            => nn_seed_faq_text( $item['faq'] ?? array() ),
		'_nn_includes'       => implode( ',', $item['includes'] ?? array() ),
		'_nn_supplier_item'  => isset( $item['supplier'] ) ? $item['supplier']['name'] . ': ' . $item['supplier']['item'] : '',
		'_nn_label_verified' => ! empty( $item['supplier']['label_verified'] ) ? 'yes' : 'no',
	);
	foreach ( $fields as $key => $value ) {
		$product->update_meta_data( $key, $value );
	}
	$product->update_meta_data( 'rank_math_description', wp_strip_all_tags( $item['short'] ) );
	$product->update_meta_data( '_yoast_wpseo_metadesc', wp_strip_all_tags( $item['short'] ) );
	$product->save();
	nn_seed_log( '  ✓ ' . $item['name'] );
}

// Bundles reference other SKUs, so add the warning for any bundle whose components are missing.
foreach ( $data['bundles'] as $bundle ) {
	foreach ( $bundle['includes'] as $sku ) {
		if ( ! wc_get_product_id_by_sku( $sku ) ) {
			nn_seed_log( "  ! Bundle {$bundle['sku']} references missing SKU $sku" );
		}
	}
}

/* ---------------------------------------------------------------- 3. Pages */
nn_seed_log( '3/6 Pages' );
$page_ids = array();
foreach ( glob( NN_SEED_DIR . '/content/pages/*.html' ) as $file ) {
	list( $meta, $body ) = nn_seed_read( 'pages/' . basename( $file ) );
	$slug                = $meta['slug'] ?? basename( $file, '.html' );
	$existing            = get_page_by_path( $slug, OBJECT, 'page' );
	// WordPress ships an unpublished "Privacy Policy" draft. Unpublished pages are safe to replace.
	if ( $existing && ! $nn_overwrite && 'publish' === $existing->post_status ) {
		$page_ids[ $slug ] = $existing->ID;
		nn_seed_log( '  - skip (exists) /' . $slug );
		continue;
	}
	$id = wp_insert_post( array(
		'ID'           => $existing ? $existing->ID : 0,
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => $meta['title'] ?? ucfirst( $slug ),
		'post_name'    => $slug,
		'post_content' => $body,
	), true );
	if ( is_wp_error( $id ) ) {
		nn_seed_log( '  ! ' . $id->get_error_message() );
		continue;
	}
	nn_seed_post_seo( $id, $meta );
	$page_ids[ $slug ] = $id;
	nn_seed_log( '  ✓ /' . $slug );
}

// The journal (blog) page.
$journal = get_page_by_path( 'journal', OBJECT, 'page' );
$page_ids['journal'] = $journal ? $journal->ID : wp_insert_post( array(
	'post_type'   => 'page',
	'post_status' => 'publish',
	'post_title'  => 'The Journal',
	'post_name'   => 'journal',
) );

// Privacy and terms pages: these are safe to set on any site, since they only register the pages we created.
if ( isset( $page_ids['privacy-policy'] ) && ! get_option( 'wp_page_for_privacy_policy' ) ) {
	update_option( 'wp_page_for_privacy_policy', $page_ids['privacy-policy'] );
}
if ( isset( $page_ids['terms-of-service'] ) && ! get_option( 'woocommerce_terms_page_id' ) ) {
	update_option( 'woocommerce_terms_page_id', $page_ids['terms-of-service'] );
}

/* ---------------------------------------------------------------- 4. Journal posts */
nn_seed_log( '4/6 Journal articles' );
// Attribute articles to the first administrator. Change it to a real, named author (ideally with credentials) for E-E-A-T.
$nn_admins = get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) );
$nn_author = $nn_admins ? (int) $nn_admins[0] : 1;
foreach ( glob( NN_SEED_DIR . '/content/posts/*.html' ) as $file ) {
	list( $meta, $body ) = nn_seed_read( 'posts/' . basename( $file ) );
	$slug                = $meta['slug'] ?? basename( $file, '.html' );
	$existing            = get_page_by_path( $slug, OBJECT, 'post' );
	if ( $existing && ! $nn_overwrite ) {
		nn_seed_log( '  - skip (exists) /' . $slug );
		continue;
	}
	$cat_id = 0;
	if ( ! empty( $meta['category'] ) ) {
		$cat = get_term_by( 'name', $meta['category'], 'category' );
		if ( ! $cat ) {
			$res    = wp_insert_term( $meta['category'], 'category' );
			$cat_id = is_wp_error( $res ) ? 0 : (int) $res['term_id'];
		} else {
			$cat_id = (int) $cat->term_id;
		}
	}
	$id = wp_insert_post( array(
		'ID'            => $existing ? $existing->ID : 0,
		'post_type'     => 'post',
		'post_status'   => 'publish',
		'post_author'   => $nn_author,
		'post_title'    => $meta['title'] ?? $slug,
		'post_name'     => $slug,
		'post_excerpt'  => $meta['excerpt'] ?? '',
		'post_content'  => $body,
		'post_category' => $cat_id ? array( $cat_id ) : array(),
	), true );
	if ( is_wp_error( $id ) ) {
		nn_seed_log( '  ! ' . $id->get_error_message() );
		continue;
	}
	nn_seed_post_seo( $id, $meta );
	nn_seed_log( '  ✓ ' . ( $meta['title'] ?? $slug ) );
}

/* ---------------------------------------------------------------- 5. Store settings */
nn_seed_log( '5/6 Store basics' );
// Safe defaults that don't change what visitors see on an existing site.
update_option( 'woocommerce_currency', 'USD' );
update_option( 'woocommerce_enable_guest_checkout', 'yes' );
update_option( 'woocommerce_checkout_phone_field', 'required' ); // Supliful declines orders without a phone.
update_option( 'woocommerce_enable_signup_and_login_from_checkout', 'yes' );
update_option( 'woocommerce_enable_review_rating', 'yes' );
update_option( 'woocommerce_review_rating_verification_required', 'yes' ); // Only verified buyers can review (FTC-friendly).
update_option( 'woocommerce_review_rating_required', 'yes' );

if ( ! $nn_fresh ) {
	nn_seed_log( '6/6 Skipped site-wide settings (homepage, permalinks, menus, shipping). Set NN_SEED_FRESH_SITE=1 on a new site.' );
	nn_seed_log( 'Done.' );
	return;
}

/* ---------------------------------------------------------------- 6. Fresh-site settings */
nn_seed_log( '6/6 Fresh site: homepage, permalinks, menus, shipping' );
update_option( 'blogname', 'Evenly' );
update_option( 'blogdescription', 'Supplements for sleep, period comfort and bloating' );
update_option( 'woocommerce_default_country', 'US' );
update_option( 'woocommerce_allowed_countries', 'specific' );
update_option( 'woocommerce_specific_allowed_countries', array( 'US' ) );
update_option( 'woocommerce_ship_to_countries', '' );
global $wp_rewrite;
$wp_rewrite->set_permalink_structure( '/%postname%/' ); // Updates the option AND the in-memory rules object.
$wp_rewrite->flush_rules( false );

if ( isset( $page_ids['home'] ) ) {
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $page_ids['home'] );
	update_option( 'page_for_posts', $page_ids['journal'] );
}

// Menus.
$link = function ( $menu_id, $title, $url, $parent = 0 ) {
	return wp_update_nav_menu_item( $menu_id, 0, array(
		'menu-item-title'     => $title,
		'menu-item-url'       => $url,
		'menu-item-status'    => 'publish',
		'menu-item-parent-id' => $parent,
	) );
};
$make_menu = function ( $name ) {
	$menu = wp_get_nav_menu_object( $name );
	if ( $menu ) {
		foreach ( (array) wp_get_nav_menu_items( $menu->term_id ) as $old ) {
			wp_delete_post( $old->ID, true );
		}
		return (int) $menu->term_id;
	}
	return (int) wp_create_nav_menu( $name );
};

$primary = $make_menu( 'Primary' );
foreach ( $data['concerns'] as $concern ) {
	if ( isset( $cat_ids[ $concern['slug'] ] ) ) {
		$link( $primary, $concern['menu_label'], get_term_link( $cat_ids[ $concern['slug'] ], 'product_cat' ) );
	}
}
$link( $primary, 'Journal', get_permalink( $page_ids['journal'] ) );

$shop_menu = $make_menu( 'Footer Shop' );
$link( $shop_menu, 'Shop all', wc_get_page_permalink( 'shop' ) );
foreach ( $data['concerns'] as $concern ) {
	if ( isset( $cat_ids[ $concern['slug'] ] ) ) {
		$link( $shop_menu, $concern['name'], get_term_link( $cat_ids[ $concern['slug'] ], 'product_cat' ) );
	}
}

$help_menu = $make_menu( 'Footer Help' );
foreach ( array( 'about' => 'Our Story', 'faq' => 'FAQ', 'contact' => 'Contact', 'shipping-policy' => 'Shipping', 'refund-policy' => 'Refunds & Guarantee' ) as $slug => $title ) {
	if ( isset( $page_ids[ $slug ] ) ) {
		$link( $help_menu, $title, get_permalink( $page_ids[ $slug ] ) );
	}
}

$legal_menu = $make_menu( 'Footer Legal' );
foreach ( array( 'privacy-policy' => 'Privacy Policy', 'terms-of-service' => 'Terms of Service', 'medical-disclaimer' => 'Medical Disclaimer', 'accessibility' => 'Accessibility' ) as $slug => $title ) {
	if ( isset( $page_ids[ $slug ] ) ) {
		$link( $legal_menu, $title, get_permalink( $page_ids[ $slug ] ) );
	}
}

set_theme_mod( 'nav_menu_locations', array(
	'primary'      => $primary,
	'footer_shop'  => $shop_menu,
	'footer_help'  => $help_menu,
	'footer_legal' => $legal_menu,
) );

// Shipping: US zone, free over threshold, flat rate below.
$zone_name = 'United States';
$zone      = null;
foreach ( WC_Shipping_Zones::get_zones() as $z ) {
	if ( $z['zone_name'] === $zone_name ) {
		$zone = new WC_Shipping_Zone( $z['id'] );
	}
}
if ( ! $zone ) {
	$zone = new WC_Shipping_Zone();
	$zone->set_zone_name( $zone_name );
	$zone->add_location( 'US', 'country' );
	$zone->save();

	$free_id = $zone->add_shipping_method( 'free_shipping' );
	update_option( 'woocommerce_free_shipping_' . $free_id . '_settings', array(
		'title'      => 'Free shipping',
		'requires'   => 'min_amount',
		'min_amount' => '50',
	) );
	$flat_id = $zone->add_shipping_method( 'flat_rate' );
	update_option( 'woocommerce_flat_rate_' . $flat_id . '_settings', array(
		'title'      => 'Standard shipping',
		'tax_status' => 'taxable',
		'cost'       => '5.95',
	) );
}

// Remove the default WordPress sample content on a fresh site.
foreach ( array( 'hello-world' => 'post', 'sample-page' => 'page' ) as $slug => $type ) {
	$sample = get_page_by_path( $slug, OBJECT, $type );
	if ( $sample ) {
		wp_delete_post( $sample->ID, true );
	}
}

nn_seed_log( 'Done.' );
