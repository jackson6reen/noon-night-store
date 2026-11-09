<?php
/**
 * Cookie / privacy consent for US shoppers (CCPA/CPRA + other state laws).
 * - Analytics (GA4) and marketing (Meta Pixel) load only after consent.
 * - Browsers sending Global Privacy Control are treated as "do not sell or share".
 * - Any link with class "nn-privacy-choices" (or to #privacy-choices) reopens the panel.
 * No tracking code is printed server-side, so nothing fires before the choice.
 *
 * @package NoonNight
 */

defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'nn-consent', NN_CORE_URL . 'assets/consent.css', array(), NN_CORE_VERSION );
	wp_enqueue_script( 'nn-consent', NN_CORE_URL . 'assets/consent.js', array(), NN_CORE_VERSION, array( 'strategy' => 'defer', 'in_footer' => true ) );
	wp_localize_script(
		'nn-consent',
		'nnConsent',
		array(
			'ga4'     => nn_option( 'ga4_id' ),
			'pixel'   => nn_option( 'meta_pixel_id' ),
			'privacy' => esc_url( get_privacy_policy_url() ),
		)
	);
} );

add_action( 'wp_footer', function () {
	?>
	<div class="nn-consent" id="nn-consent" role="dialog" aria-modal="false" aria-labelledby="nn-consent-title" hidden>
		<div class="nn-consent__inner">
			<p class="nn-consent__title" id="nn-consent-title"><?php esc_html_e( 'Your privacy choices', 'noon-night' ); ?></p>
			<p class="nn-consent__text">
				<?php esc_html_e( 'We use essential cookies to run the store. With your OK, we also use analytics to improve the site and marketing cookies to show you relevant ads.', 'noon-night' ); ?>
				<a href="<?php echo esc_url( get_privacy_policy_url() ); ?>"><?php esc_html_e( 'Privacy Policy', 'noon-night' ); ?></a>
			</p>
			<fieldset class="nn-consent__options" hidden>
				<legend class="screen-reader-text"><?php esc_html_e( 'Cookie categories', 'noon-night' ); ?></legend>
				<label><input type="checkbox" checked disabled> <?php esc_html_e( 'Essential (always on)', 'noon-night' ); ?></label>
				<label><input type="checkbox" name="analytics"> <?php esc_html_e( 'Analytics', 'noon-night' ); ?></label>
				<label class="nn-consent__marketing"><input type="checkbox" name="marketing"> <?php esc_html_e( 'Marketing / targeted ads ("sharing")', 'noon-night' ); ?></label>
				<p class="nn-consent__gpc" hidden><?php esc_html_e( 'Your browser sent a Global Privacy Control signal, so we have opted you out of sale and sharing.', 'noon-night' ); ?></p>
			</fieldset>
			<div class="nn-consent__actions">
				<button type="button" class="nn-btn nn-btn--ghost" data-consent="customize"><?php esc_html_e( 'Customize', 'noon-night' ); ?></button>
				<button type="button" class="nn-btn nn-btn--ghost" data-consent="reject"><?php esc_html_e( 'Essential only', 'noon-night' ); ?></button>
				<button type="button" class="nn-btn" data-consent="accept"><?php esc_html_e( 'Accept all', 'noon-night' ); ?></button>
				<button type="button" class="nn-btn" data-consent="save" hidden><?php esc_html_e( 'Save choices', 'noon-night' ); ?></button>
			</div>
		</div>
	</div>
	<?php
}, 5 );
