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

			if (v.editable) {
				name = 'editable-' + name;
			}

			var $content = $(Mustache.render(Templates[name], v));

			if (v.inputs) {
				Helpers.printTemplate(v.inputs, $content);
			}

			$where.append($content);
		});
	},
	setHash: function () {
		var hashes = $(':checked').map(function () {
			var $this = $(this);
			
			if ($this.data('editable')) {
				return $this.attr('id') + '-' + $this.val();
			}

			return $this.attr('id');
		}).get().join();

		if (hashes[0] === ',') {
			hashes = hashes.substr(1);
		}

		hashes = $menu.val() + '|' + hashes;

		window.history.replaceState(null, null, '#' + hashes);
		//document.location.hash = hashes;
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
	},
	update: function () {
		total_price = 0,
		total_hours = 0;

		$container.find(':checked').each(function () {
			var $this = $(this)
				value = (this.name === 'price') ? parseInt(this.value) : (scheme.config.price_hour * parseInt(this.value)),
				$subsection = $this.parent().siblings('section');

			total_price += value;

			if (this.name === 'hours') {
				total_hours += parseFloat(this.value);
			}
		});

		$total_price.html(total_price + '€');
		$total_hours.html(total_hours + 'h');
	}
};

$menu.change(function () {
	Helpers.loadScheme($menu.val(), function () {
		total_price = 0,
		total_hours = 0;
		$total_price.html(total_price + '€');
		$total_hours.html(total_hours + 'h');

		Helpers.printTemplate(scheme.inputs, $container.empty());
		Helpers.setHash();

		$menu.trigger('menuChanged');
	});
});

$container.on('change', 'input[type="checkbox"]', function () {
	var $this = $(this),
		checked = this.checked,
		$subsection = $this.parent().siblings('section');

	if (checked) {
		$subsection.slideDown('normal');
		$this.parent().next('small').removeClass('hidden');
	} else {
		$subsection.slideUp('normal');
		//$subsection.find('> label > :checked').click();
		$this.parent().next('small').addClass('hidden');
	}

	Helpers.update();
	Helpers.setHash();
});

$container.on('change', 'input[type="number"]', function () {
	var $this = $(this);
	$this.parent().prev('label').children('input').attr('value', $this.val());
	
	Helpers.update();
	Helpers.setHash();
});

// AutoCheck
var hash = document.location.hash;

if (hash) {
	hash = hash.substr(1).split('|', 2);
	$menu.val(hash[0]).one('menuChanged', function () {
		if (hash[1]) {
			var items = hash[1].split(',');

			$.each(items, function (k, item) {
				if (item.indexOf('-') === -1) {
					$('#'+item).click();
				} else {
					item = item.split('-');

					$('#'+item[0]).val(item[1]).click().parent().next('small').find('input').val(item[1]);
				}
			});
		}
	}).change();
}
