<?php
/**
 * Tools > Evenly Setup: one-click import of the catalog, photos, pages, articles,
 * menus and shipping, without SSH or WP-CLI. Runs the same setup/seed.php.
 *
 * The packaged plugin ZIP ships the content in evenly-core/setup/ (see scripts/package.mjs).
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

/**
 * Where seed.php lives: bundled in the plugin, or uploaded to wp-content/nn-setup.
 */
function nn_setup_seed_file() {
	foreach ( array( NN_CORE_DIR . 'setup/seed.php', WP_CONTENT_DIR . '/nn-setup/seed.php' ) as $file ) {
		if ( file_exists( $file ) ) {
			return $file;
		}
	}
	return '';
}

function nn_setup_has_products() {
	return function_exists( 'wc_get_product_id_by_sku' ) && wc_get_product_id_by_sku( 'EV-CYCLE' );
}

add_action( 'admin_menu', function () {
	add_management_page( __( 'Evenly Setup', 'evenly' ), __( 'Evenly Setup', 'evenly' ), 'manage_options', 'evenly-setup', 'nn_render_setup_page' );
} );

add_action( 'admin_post_nn_run_setup', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You are not allowed to do this.', 'evenly' ), 403 );
	}
	check_admin_referer( 'nn_run_setup' );

	$seed = nn_setup_seed_file();
	if ( ! $seed || ! class_exists( 'WooCommerce' ) ) {
		wp_safe_redirect( admin_url( 'tools.php?page=evenly-setup&nn_setup=missing' ) );
		exit;
	}

	if ( function_exists( 'set_time_limit' ) ) {
		set_time_limit( 300 ); // Importing photos and generating thumbnails can take a minute.
	}
	if ( ! empty( $_POST['nn_fresh'] ) && ! defined( 'NN_SEED_FRESH_SITE' ) ) {
		define( 'NN_SEED_FRESH_SITE', true );
	}
	if ( ! empty( $_POST['nn_overwrite'] ) && ! defined( 'NN_SEED_OVERWRITE' ) ) {
		define( 'NN_SEED_OVERWRITE', true );
	}

	ob_start();
	require $seed;
	$log = (string) ob_get_clean();

	set_transient( 'nn_setup_log_' . get_current_user_id(), $log, HOUR_IN_SECONDS );
	update_option( 'nn_setup_ran', gmdate( 'c' ), false );
	wp_safe_redirect( admin_url( 'tools.php?page=evenly-setup&nn_setup=done' ) );
	exit;
} );

function nn_render_setup_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$seed      = nn_setup_seed_file();
	$has_wc    = class_exists( 'WooCommerce' );
	$theme_ok  = 'evenly' === get_template();
	$imported  = nn_setup_has_products();
	$status    = isset( $_GET['nn_setup'] ) ? sanitize_key( $_GET['nn_setup'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	$log       = get_transient( 'nn_setup_log_' . get_current_user_id() );
	$checks    = array(
		array( $has_wc, __( 'WooCommerce is active', 'evenly' ) ),
		array( $theme_ok, __( 'The Evenly theme is active (needed for the product photos)', 'evenly' ) ),
		array( (bool) $seed, __( 'Store content found', 'evenly' ) ),
	);
	$ready = $has_wc && $theme_ok && $seed;
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Evenly Setup', 'evenly' ); ?></h1>
		<p><?php esc_html_e( 'Imports the products and photos, concern pages, legal pages, journal articles, menus and US shipping in one click.', 'evenly' ); ?></p>

		<?php if ( 'done' === $status ) : ?>
			<div class="notice notice-success"><p><strong><?php esc_html_e( 'Import finished.', 'evenly' ); ?></strong> <a href="<?php echo esc_url( home_url( '/' ) ); ?>" target="_blank"><?php esc_html_e( 'View the store', 'evenly' ); ?></a></p></div>
		<?php elseif ( 'missing' === $status ) : ?>
			<div class="notice notice-error"><p><?php esc_html_e( 'Import could not run. Check the list below.', 'evenly' ); ?></p></div>
		<?php endif; ?>

		<h2><?php esc_html_e( 'Checklist', 'evenly' ); ?></h2>
		<ul>
			<?php foreach ( $checks as $check ) : ?>
				<li><?php echo $check[0] ? '✅' : '❌'; ?> <?php echo esc_html( $check[1] ); ?></li>
			<?php endforeach; ?>
			<li><?php echo $imported ? '✅' : '⬜'; ?> <?php esc_html_e( 'Products imported', 'evenly' ); ?></li>
		</ul>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="nn_run_setup">
			<?php wp_nonce_field( 'nn_run_setup' ); ?>
			<p>
				<label><input type="checkbox" name="nn_fresh" value="1" <?php checked( ! $imported ); ?>>
				<?php esc_html_e( 'This is a new site: also set the homepage, menus, /post-name/ permalinks and US shipping (free over $50).', 'evenly' ); ?></label>
			</p>
			<p>
				<label><input type="checkbox" name="nn_overwrite" value="1">
				<?php esc_html_e( 'Overwrite Evenly products and pages that already exist (your edits to them will be replaced).', 'evenly' ); ?></label>
			</p>
			<?php submit_button( $imported ? __( 'Run import again', 'evenly' ) : __( 'Import the Evenly store', 'evenly' ), 'primary', 'submit', true, $ready ? array() : array( 'disabled' => 'disabled' ) ); ?>
		</form>

		<?php if ( $log ) : ?>
			<h2><?php esc_html_e( 'Last import log', 'evenly' ); ?></h2>
			<pre style="background:#fff;border:1px solid #ccd0d4;padding:12px;max-height:420px;overflow:auto"><?php echo esc_html( wp_specialchars_decode( $log ) ); ?></pre>
		<?php endif; ?>

		<h2><?php esc_html_e( 'Next steps', 'evenly' ); ?></h2>
		<ol>
			<li><a href="<?php echo esc_url( admin_url( 'options-general.php?page=evenly' ) ); ?>"><?php esc_html_e( 'Settings → Evenly', 'evenly' ); ?></a>: <?php esc_html_e( 'legal entity, address, support email.', 'evenly' ); ?></li>
			<li><?php esc_html_e( 'Plugins → Add New: install "WooCommerce Stripe Payment Gateway" and connect Stripe.', 'evenly' ); ?></li>
			<li><?php esc_html_e( 'WooCommerce → Settings → Site visibility: set to Live when ready.', 'evenly' ); ?></li>
		</ol>
	</div>
	<?php
}

/**
 * Point new admins to the setup page until the import has run.
 */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_options' ) || get_option( 'nn_setup_ran' ) || ( isset( $_GET['page'] ) && 'evenly-setup' === $_GET['page'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return;
	}
	printf(
		'<div class="notice notice-info"><p><strong>Evenly:</strong> %s <a class="button button-primary" href="%s">%s</a></p></div>',
		esc_html__( 'Your store content is ready to import.', 'evenly' ),
		esc_url( admin_url( 'tools.php?page=evenly-setup' ) ),
		esc_html__( 'Open Evenly Setup', 'evenly' )
	);
} );
