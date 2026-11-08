<?php
/**
 * Plugin Name: Noon Night Cart Bridge
 * Description: Lets the Noon Night Next.js storefront hand its cart to WooCommerce checkout. Visiting /?nn_cart=SKU:QTY,SKU:QTY fills the Woo cart with those products and redirects to checkout.
 * Version: 1.0.0
 * Author: Noon Night
 * Requires Plugins: woocommerce
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_loaded', function () {
    if (empty($_GET['nn_cart']) || !function_exists('WC') || is_admin()) {
        return;
    }

    $raw   = sanitize_text_field(wp_unslash($_GET['nn_cart']));
    $pairs = array_slice(array_filter(explode(',', $raw)), 0, 50);

    if (null === WC()->cart) {
        wc_load_cart();
    }
    WC()->cart->empty_cart();

    foreach ($pairs as $pair) {
        $parts = explode(':', $pair);
        $sku   = isset($parts[0]) ? wc_clean(rawurldecode($parts[0])) : '';
        $qty   = isset($parts[1]) ? max(1, min(99, absint($parts[1]))) : 1;
        if ('' === $sku) {
            continue;
        }
        $product_id = wc_get_product_id_by_sku($sku);
        if ($product_id) {
            WC()->cart->add_to_cart($product_id, $qty);
        }
    }

    wp_safe_redirect(wc_get_checkout_url());
    exit;
});

/**
 * Allow the storefront (e.g. https://noon-night-store.vercel.app) to read the public Store API.
 * Set the origin in wp-config.php: define('NOON_NIGHT_STOREFRONT', 'https://your-storefront.com');
 */
add_filter('rest_pre_serve_request', function ($served) {
    if (defined('NOON_NIGHT_STOREFRONT')) {
        header('Access-Control-Allow-Origin: ' . esc_url_raw(NOON_NIGHT_STOREFRONT));
    }
    return $served;
});
