var $container = $('#container'),
	$total_price = $('#total_price'),
	$total_hours = $('#total_hours'),
	$menu = $('#menu'),
	total_price = 0,
	total_hours = 0;

// Save the templates

Templates = {};

$('script[type="template/mustache"]').each(function () {
	var $this = $(this),
		name = $this.data('name'),
		content = $.trim($this.html());

	Templates[name] = content;
});

// Function to print the templates

var id = 0;
var Helpers = {
	printTemplate: function (data, $where) {
		$.each(data, function (k, v) {
			v.id = id++;
			var name = v.price ? 'price' : 'hours';
			var $content = $(Mustache.render(Templates[name], v));

			if (v.inputs) {
				Helpers.printTemplate(v.inputs, $content);
			}

			$where.append($content);
		});
	},
	setHash: function () {
		var hashes = $(':checked').map(function () {
			return this.id;
		}).get().join();

		if (hashes[0] === ',') {
			hashes = hashes.substr(1);
		}

		hashes = $menu.val() + '|' + hashes;

		document.location.hash = hashes;
	},
	latestScheme: null,
	loadScheme: function (url, callback) {
		if (Helpers.latestScheme) {
			Helpers.latestScheme.parentNode.removeChild(Helpers.latestScheme);
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		script.addEventListener('load', callback);

		document.body.appendChild(script);

		Helpers.latestScheme = script;
	}
}

$menu.change(function () {
	Helpers.loadScheme($menu.val(), function () {
		total_price = 0,
		total_hours = 0;
		$total_price.html(total_price + '€');
		$total_hours.html(total_hours + 'h');

		Helpers.printTemplate(scheme.inputs, $container.empty());
		Helpers.setHash();

		$menu.trigger('menuChanged');

		$container.on('click', 'input', function () {
			var checked = this.checked,
				value = (this.name === 'price') ? parseInt(this.value) : (scheme.config.price_hour * parseInt(this.value)),
				$subsection = $(this).parent().siblings('section');

			if (checked) {
				total_price += value;
				$subsection.slideDown('normal');

				if (this.name === 'hours') {
					total_hours += parseFloat(this.value);
				}
			} else {
				total_price -= value;
				$subsection.slideUp('normal');
				$subsection.find('> label > :checked').click();

				if (this.name === 'hours') {
					total_hours -= parseFloat(this.value);
				}
			}

			$total_price.html(total_price + '€');
			$total_hours.html(total_hours + 'h');

			Helpers.setHash();
		});
	});
});

// AutoCheck
var hash = document.location.hash;

if (hash) {
	hash = hash.substr(1).split('|', 2);
	$menu.val(hash[0]).on('menuChanged', function () {
		if (hash[1]) {
			$(hash[1].split(',').join(',#')).click();
		}
	});
}
$menu.change();