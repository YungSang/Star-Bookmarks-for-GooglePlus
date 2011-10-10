(function($) {
	var GB_LABEL = 'Google+Star'
	var BASE_URL = 'https://www.google.com/bookmarks/';
	var FIND_URL = BASE_URL + 'find';
	var MARK_URL = BASE_URL + 'mark';
	var HOME_URL = BASE_URL + 'lookup?q=label:' + encodeURIComponent(GB_LABEL);

	var signature = null;

	$(function() {
		loadBookmarks();
	});

	function loadBookmarks(callback) {
		$.ajax({
			type     : 'GET',
			url      : FIND_URL,
			dataType : 'xml',
			data     : {
				q      : 'label:' + GB_LABEL,
				num    : 1000,
				output : 'rss'
			},
			success  : function(data) {
		    signature = $('signature', data).text();

				var $article = $('article').empty();

				var $ul = $('<ul />');

				var $items = $('rss channel item', data).each(function() {
					addBookmarkToList(this, $ul);
				});

				$article.append($ul);

				chrome.browserAction.setBadgeBackgroundColor({
					color : [255, 0, 0, 255]
				});
				chrome.browserAction.setBadgeText({
					text : $items.length ? $items.length + '' : ''
				});

				if (typeof callback == 'function') callback();
			}
		});
	}

	function addBookmarkToList(item, $ul, prepend) {
		var title      = $('title', item).text();
		var link       = $('link', item).text();
		var bkmk_id    = $('bkmk_id', item).text();
		var annotation = $('bkmk_annotation', item).text();

		var $li = $('<li />', {
			id    : 'bkmk_' + bkmk_id,
			class : 'bookmark',
			title : link
		});
		
		if (prepend) {
			$li.prependTo($ul);
		}
		else {
			$li.appendTo($ul);
		}

		$('<img/>', {
			src : getUserIcon(link)
		}).appendTo($li);

		$('<div class="star" />').css({
			'background-image' : 'url('+chrome.extension.getURL('img/starred.png')+')'
		}).appendTo($li);

		$('<span/>').css({
			'font-weight' : 'bold',
			color         : '#36C'
		}).append(title).appendTo($li);

		$('<div/>').css({
			width : '90%'
		}).append(annotation).appendTo($li);

		$('<div/>').css({
			clear : 'both'
		}).appendTo($li);
	}

	function getBookmark(url, callback) {
		$.ajax({
			type         : 'GET',
			dataType     : 'xml',
			url          : FIND_URL,
			data : {
				q          : url,
				num        : 1,
				output     : 'rss'
			},
			success      : function(data) {
				callback($('rss channel item', data).get(0));
			}
		});
	}

	function addBookmark(favorite) {
		$.ajax({
			type         : 'POST',
			dataType     : 'html',
			url          : MARK_URL,
			data : {
				sig        : signature,
				bkmk       : favorite.post_url,
				title      : favorite.name + ' - ' + favorite.post_date,
				labels     : GB_LABEL,
				annotation : favorite.text
			},
			success  : function(data) {
				getBookmark(favorite.post_url, function(item) {
					addBookmarkToList(item, $('article ul'), true)
					var $items = $('article ul li.bookmark');
					chrome.browserAction.setBadgeText({
						text : $items.length ? $items.length + '' : ''
					});
				});
			}
		});
	}

	function removeBookmark(bkmk_id) {
		$.ajax({
			type     : 'POST',
			dataType : 'html',
			url      : MARK_URL,
			data : {
				sig    : signature,
				dlq    : bkmk_id
			},
			success  : function(data) {
				$('#bkmk_' + bkmk_id).remove();
				var $items = $('article ul li.bookmark');
				chrome.browserAction.setBadgeText({
					text : $items.length ? $items.length + '' : ''
				});
			}
		});
	}

	function inBookmarks(url) {
		return !!$('article ul li.bookmark[title="' + url + '"]').length;
	}

	window.STAR_API = {
		loadBookmarks  : loadBookmarks,
		removeBookmark : removeBookmark
	};

	chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {
			if (request.action == 'addBookmark') {
				addBookmark(request.favorite);
			}
			else if (request.action == 'removeBookmark') {
				getBookmark(request.favorite.post_url, function(item) {
					var bkmk_id = $('bkmk_id', item).text();
					removeBookmark(bkmk_id);
				});
			}
			else if (request.action == 'inBookmarks') {
				var result = inBookmarks(request.favorite.post_url);
				return sendResponse({result : result})
			}
			sendResponse({});
		}
	);

	function getUserIcon(url) {
		if (url.match(/([0-9]+)\/posts\//)) {
			return 'http://www.google.com/s2/photos/profile/' + RegExp.$1 + '?sz=48';
		}
		else {
			return 'http://www.gstatic.com/s2/oz/images/interest/sparks.png';
		}
	}

})(jQuery);