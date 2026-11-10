/**
 * Evenly theme script: mobile nav, search panel, quiz, sticky add-to-cart.
 * Vanilla JS, no dependencies, under 3 KB.
 */
(function () {
	'use strict';

	/* Mobile navigation ------------------------------------------------- */
	var toggle = document.querySelector('.nn-menu-toggle');
	var nav = document.getElementById('nn-nav');
	function setNav(open) {
		if (!toggle || !nav) return;
		toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		nav.classList.toggle('is-open', open);
		document.body.classList.toggle('nn-nav-open', open);
		if (open) {
			var first = nav.querySelector('a');
			if (first) first.focus();
		}
	}
	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			setNav(toggle.getAttribute('aria-expanded') !== 'true');
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && nav.classList.contains('is-open')) {
				setNav(false);
				toggle.focus();
			}
		});
		document.addEventListener('click', function (e) {
			if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
		});
	}

	/* Search panel ------------------------------------------------------ */
	var searchBtn = document.querySelector('[data-nn-search]');
	var panel = document.querySelector('.nn-search-panel');
	if (searchBtn && panel) {
		searchBtn.setAttribute('role', 'button');
		searchBtn.setAttribute('aria-expanded', 'false');
		searchBtn.addEventListener('click', function (e) {
			e.preventDefault();
			panel.hidden = !panel.hidden;
			searchBtn.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
			if (!panel.hidden) {
				var input = panel.querySelector('input[type="search"]');
				if (input) input.focus();
			}
		});
	}

	/* Quiz -------------------------------------------------------------- */
	var quiz = document.querySelector('[data-nn-quiz]');
	if (quiz) {
		var links = {};
		try { links = JSON.parse(quiz.getAttribute('data-links')) || {}; } catch (e) { links = {}; }
		var steps = quiz.querySelectorAll('.nn-quiz__step');
		var result = quiz.querySelector('.nn-quiz__result');
		var form = quiz.querySelector('form');

		form.addEventListener('change', function (e) {
			if (e.target.type !== 'radio') return;
			var step = e.target.closest('.nn-quiz__step');
			var i = parseInt(step.getAttribute('data-step'), 10);
			setTimeout(function () {
				step.hidden = true;
				if (i + 1 < steps.length) {
					steps[i + 1].hidden = false;
					var next = steps[i + 1].querySelector('input');
					if (next) next.focus();
				} else {
					showResult();
				}
			}, 180);
		});

		function showResult() {
			var score = {};
			form.querySelectorAll('input:checked').forEach(function (input, idx) {
				score[input.value] = (score[input.value] || 0) + (idx === 0 ? 2 : 1); // Q1 weighs most.
			});
			var values = Object.keys(score).map(function (k) { return score[k]; });
			var distinct = Object.keys(score).length;
			var best = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; })[0];
			// Three different answers = several things going on, so a bundle fits best.
			if ((distinct >= 3 && Math.max.apply(null, values) < 3) || best === 'bundles') {
				best = links.bundles ? 'bundles' : best;
			}
			var target = links[best] || links[Object.keys(links)[0]];
			result.querySelector('.nn-quiz__result-name').textContent = target.name;
			result.querySelector('.nn-quiz__result-link').href = target.url;
			result.hidden = false;
			result.querySelector('.nn-quiz__result-link').focus();
		}

		quiz.querySelector('[data-nn-quiz-restart]').addEventListener('click', function () {
			form.reset();
			result.hidden = true;
			steps.forEach(function (s, i) { s.hidden = i !== 0; });
			var first = steps[0].querySelector('input');
			if (first) first.focus();
		});
	}

	/* Sticky add-to-cart (mobile) -------------------------------------- */
	var sticky = document.querySelector('.nn-sticky-atc');
	var realBtn = document.querySelector('form.cart .single_add_to_cart_button');
	if (sticky && realBtn && 'IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			sticky.hidden = entries[0].isIntersecting || entries[0].boundingClientRect.top > 0;
		}).observe(realBtn);
		sticky.querySelector('[data-nn-sticky-atc]').addEventListener('click', function () {
			realBtn.click();
		});
	}
})();
