(function($) {

	$(function() {
		var bg = chrome.extension.getBackgroundPage();
		$('article').empty().append(bg.$('article').html());

		updateStars();

		$('article li.bookmark').live('click' ,function(event) {
			chrome.tabs.create({url: $(this).attr('title')});
			window.close();
		});

		$('article div.star').live('click', function(event) {
			$(this).parent().slideUp(function() {
				$(this).remove();
				bg.STAR_API.removeBookmark(this.id.substring(5), function() {
					updateStars();
				});
			});
			event.stopPropagation();
		});

		$('header nav a').click(function() {
			chrome.tabs.create({url: $(this).attr('href')});
			window.close();
		});

		var $a = $('<a/>', {
				href  : '#',
				title : 'Reload'
			}).click(function() {
				bg.STAR_API.loadBookmarks(function() {
					$('article').empty().append(bg.$('article').html());
					updateStars();
				});
				return false;
			});
		$('<img/>', {
			src : chrome.extension.getURL('img/reload-16.png'),
			alt : ''
		}).appendTo($a);
		$a.append(' Reload').appendTo($('header nav'));
	});

	function updateStars() {
		var $items = $('article ul li.bookmark');
		$('#stars').empty().append($items.length ? '(' + $items.length + ')' : '');
	}

})(jQuery);