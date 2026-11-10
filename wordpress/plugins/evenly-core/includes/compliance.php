<?php
/**
 * FDA / FTC / legal-page helpers.
 *
 * @package Evenly
 */

defined( 'ABSPATH' ) || exit;

/**
 * [nn_business field="legal_entity"]: business details inside legal pages, so they update from one place.
 */
add_shortcode( 'nn_business', function ( $atts ) {
	$atts    = shortcode_atts( array( 'field' => 'business_name' ), $atts, 'nn_business' );
	$allowed = array_keys( nn_option_defaults() );
	if ( ! in_array( $atts['field'], $allowed, true ) ) {
		return '';
	}
	$value = (string) nn_option( $atts['field'] );
	if ( 'support_email' === $atts['field'] ) {
		return sprintf( '<a href="mailto:%1$s">%1$s</a>', esc_html( antispambot( $value ) ) );
	}
	return esc_html( $value );
} );

/**
 * [nn_fda_disclaimer]
 */
add_shortcode( 'nn_fda_disclaimer', function () {
	return '<p class="nn-fda">' . esc_html( nn_fda_disclaimer() ) . '</p>';
} );

/**
 * FDA disclaimer under every single product summary (claims are marked with *).
 */
add_action( 'woocommerce_single_product_summary', function () {
	echo '<p class="nn-fda nn-fda--product">' . esc_html( nn_fda_disclaimer() ) . '</p>';
}, 45 );

/**
 * Block checkout (the default for new WooCommerce stores): register the same
 * acknowledgement through the Additional Checkout Fields API (WooCommerce 8.9+).
 * It is saved on the order automatically.
 */
add_action( 'woocommerce_init', function () {
	if ( ! function_exists( 'woocommerce_register_additional_checkout_field' ) ) {
		return;
	}
	woocommerce_register_additional_checkout_field( array(
		'id'                => 'evenly/safety-ack',
		'label'             => __( 'I have read the product warnings and health disclaimer, and will check with my doctor if I am pregnant, nursing, taking medication or have a medical condition.', 'evenly' ),
		'optionalLabel'     => __( 'I have read the product warnings and health disclaimer.', 'evenly' ),
		'location'          => 'order',
		'type'              => 'checkbox',
		'required'          => true,
		'error_message'     => __( 'Please confirm you have read the product warnings and health disclaimer.', 'evenly' ),
	) );
} );

/**
 * Classic (shortcode) checkout: health & safety acknowledgement. It isn't required by law, but it documents
 * that warnings were shown, which reduces chargebacks and liability.
 */
add_action( 'woocommerce_review_order_before_submit', function () {
	?>
	<p class="form-row validate-required nn-safety-ack">
		<label class="woocommerce-form__label woocommerce-form__label-for-checkbox checkbox">
			<input type="checkbox" class="woocommerce-form__input woocommerce-form__input-checkbox input-checkbox" name="nn_safety_ack" id="nn_safety_ack" value="1">
			<span>
			<?php
			printf(
				/* translators: %s: link to medical disclaimer */
				wp_kses_post( __( 'I have read the product warnings and the <a href="%s" target="_blank" rel="noopener">health disclaimer</a>. I will check with my doctor if I am pregnant, nursing, taking medication or have a medical condition.', 'evenly' ) ),
				esc_url( home_url( '/medical-disclaimer/' ) )
			);
			?>
			</span>&nbsp;<abbr class="required" title="<?php esc_attr_e( 'required', 'evenly' ); ?>">*</abbr>
		</label>
	</p>
	<?php
} );

add_action( 'woocommerce_checkout_process', function () {
	// WooCommerce verifies the checkout nonce before this hook runs.
	if ( empty( $_POST['nn_safety_ack'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		wc_add_notice( __( 'Please confirm you have read the product warnings and health disclaimer.', 'evenly' ), 'error' );
	}
} );

add_action( 'woocommerce_checkout_create_order', function ( $order ) {
	if ( ! empty( $_POST['nn_safety_ack'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		$order->update_meta_data( '_nn_safety_ack', gmdate( 'c' ) );
	}
} );
