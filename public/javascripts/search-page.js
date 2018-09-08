$(document).ready(() => {

  var height2 = $('#jumbotron-content').height() + 100;
  $('#jumbotron-background').css('min-height', height2);
  $('#school-header').css('min-height', height2);

  $(window).on('resize', () => {
    var height3 = $('#jumbotron-content').height() + 100;
    $('#jumbotron-background').css('min-height', height3);
    $('#school-header').css('min-height', height3);
  });

  $('#sortByRating').change(function (event) {

    let queryInfo = $('#queryInfo').val();
    let province = $('#provinceSelect').val();
    let city = $('#citySelect').val();
    let url = '/search?queryInfo=' + queryInfo + '&province=' + province + '&city=' + city + '&sort=' + $(this).val();
    window.location.href = url;
  });

  $('#sortByName').change(function (event) {
    let queryInfo = $('#queryInfo').val();
    let province = $('#provinceSelect').val();
    let city = $('#citySelect').val();
    let url = '/search?queryInfo=' + queryInfo + '&province=' + province + '&city=' + city + '&sort=' + $(this).val();
    window.location.href = url;
  });

  

});
