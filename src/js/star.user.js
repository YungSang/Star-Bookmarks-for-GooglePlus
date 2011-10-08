(function($) {
	var PLUS_URL = 'https://plus.google.com/';

	var favorites = {};

/*
 * Google+ CSS
 *
 * version : 20110831
 */
	var SELECTOR = {
		individual_post : 'div[id^="update-"]',
			post_header   : '.kr, .jr', // not used
				post_icon   : '.Km img, .Nm img',
				post_info   : '.Nw, .Ex', // not used
					post_name : '.nC a, .eE a',
					post_date : '.Fl, .hl',
			post_content  : '.un.Ao, .Us.Gk',
	};

/*
 * Main
 */
	var timer = null;
	function update() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}

		$(SELECTOR.individual_post).each(function() {
			setStarToPost(this);
		});

		timer = setTimeout(update, 500);
	}

	function setStarToPost(elm) {
		if (elm.added_star) {
			return; // prevent addding again and again
		}
		elm.added_star = true;

		var $elm = $(elm);

		var $nameLink   = $(SELECTOR.post_name,    $elm);
		var $contentBox = $(SELECTOR.post_content, $elm);
		var $imgElm     = $(SELECTOR.post_icon,    $elm);
		var $postLink   = $(SELECTOR.post_date,    $elm);

		var favorite = {
			id          : elm.id,
			name        : $nameLink.html(),
			post_date   : $postLink.attr('title'),
			post_url    : PLUS_URL + $postLink.attr('href'),
			text        : $contentBox.get(0).innerText.substring(0, 130) + '...',
			picture_url : $imgElm.attr('src')
		};

		var processing = false;

		var $starHolder = $('<div class="post_star"/>')
			.hover(
				function() {
					if (processing) return;
					$(this).addClass('starred');
				},
				function() {
					if (processing) return;
					if (!favorites[favorite.id]) $(this).removeClass('starred');
				}
			)
			.click(function() {
				var $this = $(this);

				if (processing) return;
				processing = true;

				if (favorites[favorite.id]) {
					$this.removeClass('starred');
					chrome.extension.sendRequest(
						{
							action   : 'removeBookmark',
							favorite : favorite
						},
						function(response) {
							delete favorites[favorite.id];
							processing = false;
						}
					);
				}
				else {
					$this.addClass('starred');
					chrome.extension.sendRequest(
						{
							action   : 'addBookmark',
							favorite : favorite
						},
						function(response) {
							favorites[favorite.id] = true;
							processing = false;
						}
					);
				}
			});

		processing = true;
		chrome.extension.sendRequest(
			{
				action   : 'inBookmarks',
				favorite : favorite
			},
			function(response) {
				if (response.result) {
					favorites[favorite.id] = true;
					$starHolder.addClass('starred');
				}
				processing = false;
			}
		);

		$elm.append($starHolder);
	}

/*
 * CSS
 */
	function functionToString(func) {
		return func.toString().match(/\/\*([\s\S]*)\*\//)[1].replace(/^\s+|\s+$/, '');
	}

	function setCSSFromFunction(func) {
		var style = document.createElement('style');
		style.type = 'text/css';
		style.textContent = functionToString(func);
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	function starred_css() {/*
		div.post_star {
			position:absolute;
			top:38px;
			right:20px;
			width:14px;
			height:14px;
			background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAOCAYAAABKKc6PAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA7ZJREFUeNqkVV9oU1cYP+eee5Obf/2TpElcm5mipg3R2ozqZG1x2YT5INsUEbQvFhHHRCxVEB8GBZ+2hzlERRhYBg7Rh7INtodtWKWgKxY1k6SJUlqTtCEkaRObpLk3ubl+J9pAmmCDHgj35Dv3/L7f/X2/7xyMaozZ2Vk+l8tN0XmxWNzldDrT6D3G6OhRXo2bHmGMGJQWew6dvFqFx9TaCCSOcxy3WaFQbGEY5hv0nkPDNJ9oaDTamw0fbMEN/Mla71QRGR8fZzHG55uampR6vV4BRM7S2LuSGB8ZYQlhv9u6vY90be9nCGbP0di6RCwWywAhhNdoNIjneQRzArGv3pVIpG1xQKlQ8G2tbchkakEanY6LWONVeNjn8/0GCnwhyzK/GmxpaVnWarU6Os9ms2I0GlWUN2Ccg8c9IPl1e3t7bi3gzeunf8cM3luUpPKeT/o+FTZu3Kyk83B4Tpq49y8pK0GIKMvFu9jv90cNBoMJEtf1hZlMBsXj8aQkSdZaJr71y1Bs546PjTabrS68YPAF+m9y8iXUj3y2uLh4XxCEBvAE/eKaG0AxtLS0hJaXlzOwp6+zs7NmJ3FK1u3xPH4Qi0W0Pa4uBOrUxivK6MlTL5qbC61wStJbesvr9WqhS+5Ago9MJhNh2UovFQoFFIvFQARpOp1O97tcruTbvvL2lW+1KqPuLsuR7v5eF9Go+Yr1bDaH7k8+lVZyQiCREXoHB39KVtANBAJBUMW6tkxvypGIRCIWt9tdqNeoYzeGg93bbNZ2m6myHOE4mno0k9DPNFrcIyOFiq4BVbpBfgvtlrVDrVbTR6PZbO6pl8Svo0PdoL7lQ6uxaq11g566vnG+NdFT1b5QmgtwdnCrHkmlUqUf9QaN6XQ66qfv6yWi4siFrY42jpDXKQLPF5AvMF/yBo1tsplZtVpRxitlnZ6etkEyn9VqVdHE4Ic8mHcWlgTwiwN8Qw85FAqF6Lni6Ojo8L+NxM3RIRthZN/+fTtVhYKEHjx8lk+msiU8jVrp2LXDzlIyf/wFtwgjO44MXvavKrIbjvM49UI4HBbz+fxF8IMTOqML7pozCwsLAl1TqVRBMOzn66khS8XdRr0u/iIUR3/+/URMvVy52Py8wXlg4McuISed+efO/0J4PoEs5uYgLjIlPPbNxTYD94tBFMUJ+Dtst9unVkFhfsnj8YxBma4BiT2gjHfdumA8E42lDMlkdiIvisMHj10u4315+IdLN34+Nebzz18ThPweSF7CeyXAAFoogvWsxuyAAAAAAElFTkSuQmCC);
			background-position:0 0;
			background-repeat:no-repeat;
			cursor:pointer;
		}

		div.post_star.starred {
			background-position:-20px 0;
		}
*/}
	setCSSFromFunction(starred_css);

	$(update);

})(jQuery);
