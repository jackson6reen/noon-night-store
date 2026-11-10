/**
 * "Build your 3" live summary (template-parts/home/build.php).
 * The form works without this script; this adds the slots, total and the 3-pick limit.
 */
(function () {
	'use strict';
	var build = document.querySelector('[data-ev-build]');
	if (!build) return;

	var boxes = Array.prototype.slice.call(build.querySelectorAll('input[name="ev_build[]"]'));
	var slots = build.querySelectorAll('.ev-summary__slot');
	var order = [];
	var money = function (n) { return '$' + n.toFixed(2); };

	function render() {
		var chosen = order.map(function (b) { return { price: parseFloat(b.dataset.price) || 0, img: b.dataset.img, el: b }; });
		var cheapest = chosen.length === 3 ? chosen.slice().sort(function (a, b) { return a.price - b.price; })[0] : null;
		var value = chosen.reduce(function (n, c) { return n + c.price; }, 0);
		var total = value - (cheapest ? cheapest.price : 0);

		for (var i = 0; i < 3; i++) {
			var c = chosen[i];
			slots[i].className = 'ev-summary__slot' + (c && cheapest && c.el === cheapest.el ? ' is-free' : '');
			slots[i].textContent = '';
			if (c && c.img) {
				var im = document.createElement('img');
				im.src = c.img;
				im.alt = '';
				slots[i].appendChild(im);
			} else {
				slots[i].textContent = 'Pick ' + (i + 1);
			}
		}
		build.querySelector('[data-ev-count]').textContent = chosen.length + '/3 selected';
		build.querySelector('[data-ev-left]').textContent = cheapest ? '1 free' : (3 - chosen.length) + ' to go';
		var totalEl = build.querySelector('[data-ev-total]');
		totalEl.textContent = '';
		if (cheapest) {
			var s = document.createElement('s');
			s.textContent = money(value);
			totalEl.appendChild(s);
		}
		totalEl.appendChild(document.createTextNode(money(total)));
		var submit = build.querySelector('[data-ev-submit]');
		submit.setAttribute('aria-disabled', chosen.length < 3 ? 'true' : 'false');
		submit.textContent = chosen.length < 3 ? 'Pick ' + (3 - chosen.length) + ' more' : 'Add my 3 to cart';
	}

	boxes.forEach(function (box) {
		box.addEventListener('change', function () {
			if (box.checked) {
				order.push(box);
				if (order.length > 3) order.shift().checked = false; // Keep the 3 most recent picks.
			} else {
				order = order.filter(function (b) { return b !== box; });
			}
			render();
		});
	});
	build.addEventListener('submit', function (e) {
		if (order.length < 3) e.preventDefault();
	});
	render();
})();
