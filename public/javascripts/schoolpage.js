$(document).ready(function() {

    $('.chart').horizBarChart({
        selector: '.bar',
        speed: 1800
    });

    $( "#description-readmore" ).click(function() {
        $(".description-container").animate({"max-height":'2000px'}, 500);
    });

    $( ".school-img-list-item" ).click(function() {


        var photoid = this.closest('.school-image-item').id;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/school/getphoto/" + photoid);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    $( "#modal-dialog").empty();
                    var response = JSON.parse(xhr.responseText);
                    var elements = $($.parseHTML(response.html));
                    $.each(elements,function(index, element){
                        $(element).appendTo("#modal-dialog");
                    });
                    $( "#modal" ).trigger( "click" );
                    setUploadFile();
                }
                else {
                    alert("Problem.");
                }
            }
        };
        xhr.send();





        //var url = $(this).css('background-image');
        //url = url.substring(5);
        //url = url.substring(0, (url.length-2));
        //url = url.replace("th_", "");
        //var img = $('<img id="dynamic">'); //Equivalent: $(document.createElement('img'))
        //img.addClass('image-lightbox');
        //img.attr('src', url);
        ////img.appendTo('#lightboxcontent');
        //
        //var div = $('<div class="col-sm-10 col-sm-offset-1">');
        //img.appendTo(div);
        //
        //$( "#modal-body").empty();
        //div.appendTo("#modal-body");
        //$( "#modal" ).trigger( "click" );
    });

    $("#ajax-add-photo" ).click(function() {
        var schoolid = $('#schoolid').attr('value')
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/school/addphotoajax/" + schoolid);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    $( "#modal-dialog").empty();
                    var response = JSON.parse(xhr.responseText);
                    var elements = $($.parseHTML(response.html));
                    $.each(elements,function(index, element){
                        $(element).appendTo("#modal-dialog");
                    });
                    $( "#modal" ).trigger( "click" );
                    setUploadFile();
                }
                else {
                    alert("Problem.");
                }
            }
        };
        xhr.send();
    });

    $( ".readmore" ).click(function() {
        var reviewid = this.closest('.list-group-review').id;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/school/reviews/" + reviewid);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    $( "#modal-dialog").empty();
                    var response = JSON.parse(xhr.responseText);
                    var elements = $($.parseHTML(response.html));
                    $.each(elements,function(index, element){
                        $(element).appendTo("#modal-dialog");
                    });
                    $( "#modal" ).trigger( "click" );
                    $(".rating").rate({
                        readonly: false
                    });
                    $(".rating").rate("destroy");
                    $('.chart').horizBarChart({
                        selector: '.bar',
                        speed: 1800
                    });
                }
                else {
                    alert("Problem.");
                }
            }
        };
        xhr.send();
    });

    $( "#load-more-reviews" ).click(function() {
        var schoolid = $('#schoolid').attr('value')
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/school/reviews/" + schoolid + "/" + page);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    //alert("success." + response.html);
                    var elements = $($.parseHTML(response.html));
                    $.each(elements,function(index, element){
                        $(element).appendTo("#reviews");
                    });
                    $(".rating").rate({
                        readonly: false
                    });
                    $(".rating").rate("destroy");
                    $(".readmore").unbind();
                    $(".school-img-list-item").unbind();
                    $("#lightbox").unbind();
                    page++;
                    setLightboxOnReadmore();

                }
                else {
                    alert("Problem.");
                }
            }
        };
        xhr.send();
    });

});