/**
 * Noon Night consent manager (no dependencies).
 * Stores {analytics, marketing, ts} in the "nn_consent" cookie for 180 days.
 */
(function () {
	'use strict';

	var cfg = window.nnConsent || {};
	var COOKIE = 'nn_consent';
	var gpc = navigator.globalPrivacyControl === true;
	var box = document.getElementById('nn-consent');
	if (!box) return;

	function read() {
		var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
		if (!m) return null;
		try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return null; }
	}

	function write(state) {
		state.ts = Date.now();
		var secure = location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(state)) +
			'; Max-Age=' + (180 * 24 * 3600) + '; Path=/; SameSite=Lax' + secure;
	}

	function loadScript(src) {
		var s = document.createElement('script');
		s.async = true;
		s.src = src;
		document.head.appendChild(s);
	}

	var loaded = { analytics: false, marketing: false };

	function apply(state) {
		if (state.analytics && cfg.ga4 && !loaded.analytics) {
			loaded.analytics = true;
			loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4));
			window.dataLayer = window.dataLayer || [];
			window.gtag = function () { window.dataLayer.push(arguments); };
			window.gtag('js', new Date());
			window.gtag('config', cfg.ga4, { anonymize_ip: true });
		}
		if (state.marketing && !gpc && cfg.pixel && !loaded.marketing) {
			loaded.marketing = true;
			/* Meta Pixel base code */
			!function (f, b, e, v, n, t, s) {
				if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
				if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
				t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
			}(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
			window.fbq('init', cfg.pixel);
			window.fbq('track', 'PageView');
		}
		document.dispatchEvent(new CustomEvent('nn:consent', { detail: state }));
	}

	var options = box.querySelector('.nn-consent__options');
	var btnSave = box.querySelector('[data-consent="save"]');
	var btnCustomize = box.querySelector('[data-consent="customize"]');
	var inputA = box.querySelector('input[name="analytics"]');
	var inputM = box.querySelector('input[name="marketing"]');

	if (gpc) {
		inputM.checked = false;
		inputM.disabled = true;
		box.querySelector('.nn-consent__gpc').hidden = false;
	}

	function open(showOptions) {
		var s = read() || {};
		inputA.checked = !!s.analytics;
		inputM.checked = !!s.marketing && !gpc;
		options.hidden = !showOptions;
		btnSave.hidden = !showOptions;
		btnCustomize.hidden = !!showOptions;
		box.hidden = false;
		var first = box.querySelector('button:not([hidden])');
		if (first && showOptions) first.focus();
	}

	function close(state) {
		write(state);
		box.hidden = true;
		apply(state);
	}

	box.addEventListener('click', function (e) {
		var action = e.target.getAttribute('data-consent');
		if (!action) return;
		if (action === 'accept') close({ analytics: true, marketing: !gpc });
		if (action === 'reject') close({ analytics: false, marketing: false });
		if (action === 'customize') open(true);
		if (action === 'save') close({ analytics: inputA.checked, marketing: inputM.checked && !gpc });
	});

	box.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && read()) box.hidden = true;
	});

	document.addEventListener('click', function (e) {
		var link = e.target.closest('.nn-privacy-choices, a[href$="#privacy-choices"]');
		if (link) {
			e.preventDefault();
			open(true);
		}
	});

	var saved = read();
	if (saved) {
		apply(saved);
	} else {
		open(false);
	}
})();
