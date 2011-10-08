(function($) {

	$(function() {
		var bg = chrome.extension.getBackgroundPage();
		$('article').empty().append(bg.$('article').html());

		$('article li.bookmark').live('click' ,function(event) {
			chrome.tabs.create({url: $(this).attr('title')});
			window.close();
		});

		$('article div.star').live('click', function(event) {
			$(this).parent().slideUp(function() {
				$(this).remove();
				bg.STAR_API.removeBookmark(this.id.substring(5));
			});
			event.stopPropagation();
		});

		$('footer a').click(function() {
			chrome.tabs.create({url: $(this).attr('href')});
			window.close();
		});
	});


})(jQuery);