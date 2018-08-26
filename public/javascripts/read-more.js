$(document).ready(function() {

	$(".show-more-link").click(function(){
		$(".show-more-container").toggleClass('expand')
		$('.show-less-link').toggleClass('d-none');
		$(this).toggleClass('d-none');
		return false;
	});

	$(".show-less-link").click(function(){
		$(".show-more-container").toggleClass('expand')
		$('.show-more-link').toggleClass('d-none');
		$(this).toggleClass('d-none');
		return false;
	});

});