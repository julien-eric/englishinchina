

$(document).ready(function() {


    function capitalize(str) {
        strVal = '';
        str = str.split(' ');
        for (var chr = 0; chr < str.length; chr++) {
            strVal += str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length) + ' '
        }
        return strVal
    }

    (function setLightboxOnReadmore() {

        var turnon = function(){
            var original = $(this).closest(".list-group-review");
            var element = original.clone()
            element.find('.review-content').addClass('read-review');
            element.find('h5').remove();
            element.clone().appendTo("#lightboxcontent")
            $("#lightbox").toggle();
            $('body').addClass('noscroll');
        };

        var turnonPicture = function(){
            var original = $(this).closest(".school-img-list-item");
            var element = original.clone()
            element.clone().appendTo("#lightboxcontent")
            $("#lightbox").toggle();
            $('body').addClass('noscroll');
        };

        var turnoff = function(){
            var element = $("#lightboxcontent").empty();
            $("#lightbox").toggle();
            $('body').removeClass('noscroll');
        };

        $(".readmore").click(turnon);
        $(".school-img-list-item").click(turnonPicture);
        $("#lightbox").click(turnoff);
    })();

    (function () {
        if(document.getElementById("file_input")){
            document.getElementById("file_input").onchange = function () {
                var files = document.getElementById("file_input").files;
                var file = files[0];
                if (file == null) {
                    alert("No file selected.");
                }
                else {
                    get_signed_request(file);
                }
            };
        }
    })();

    function get_signed_request(file) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/sign_s3?file_name=" + file.name + "&file_type=" + file.type);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    upload_file(file, response.signed_request, response.url);
                }
                else {
                    alert("Could not get signed URL.");
                }
            }
        };
        xhr.send();
    }

    function upload_file(file, signed_request, url) {
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", signed_request);
        xhr.setRequestHeader('x-amz-acl', 'public-read');
        xhr.upload.onprogress = function(event){
            if (event.lengthComputable)
            {
                //evt.loaded the bytes browser receive
                //evt.total the total bytes seted by the header
                var percentComplete = (event.loaded / event.total)*100;
                $("#progress-bar-picture").css('width', percentComplete+'%').attr('aria-valuenow', percentComplete);
            }
        }
        xhr.onload = function () {
            if (xhr.status === 200) {
                var preview = $("#preview");
                preview.toggle();
                preview.attr("src", url);
                document.getElementById("avatarUrl").value = url;
                //alert("success");
                xhr2 = new XMLHttpRequest();
                xhr2.open("POST", "/pictureuploaded?url=" + url + "&filename=" + file.name + "&filesize=" + file.size)
                if (xhr2.readyState === 4) {
                    if (xhr2.status === 200) {
                        var response = JSON.parse(xhr2.responseText);
                        alert("WORKED.");
                    }
                    else {
                        alert("FAILED.");
                    }
                }
                xhr2.send();
            }
        };
        xhr.onerror = function (err) {
            alert("Could not upload file." + err);
        };
        xhr.send(file);
    }


    $('#city-select').prop('disabled', 'disabled');
    $('#provinceSelect').on('change', function() {
        $('#city-select option:gt(0)').remove(); // remove all options, but not the first
        $('#city-select').prop('disabled', 'disabled');
        $.ajax({url: "/cities/" + this.value, success: function(results){
            $('#city-select').prop('disabled', false);
            var $element = $("#city-select");
            for(var i = 0; i <= results.length; i++){
                $element.append($("<option></option>")
                    .attr("value", results[i].code).text(capitalize(results[i].pinyinName) + " - " + results[i].chineseName));
            }
        }});

    });

    $('#mycalendar1').monthly({
        mode: 'picker',
        target: '#mytarget1',
        setWidth: '250px',
        startHidden: true,
        showTrigger: '#mytarget1',
        stylePast: false,
        disablePast: false
    });

    $('#mycalendar2').monthly({
        mode: 'picker',
        target: '#mytarget2',
        setWidth: '250px',
        startHidden: true,
        showTrigger: '#mytarget2',
        stylePast: false,
        disablePast: false
    });

    $(".rating").rate({
        readonly: false
    });
    $(".rating").rate("destroy");
    //Destroy makes it uninteractive, but doesn't remove the DOM elements.
    var slider = new Slider('#ex1', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
    var slider2 = new Slider('#ex2', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
    var slider3 = new Slider('#ex3', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
    var slider4 = new Slider('#ex4', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
    var slider5 = new Slider('#ex5', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
    var slider6 = new Slider('#ex6', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
    var slider7 = new Slider('#ex7', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });
    var slider8 = new Slider('#ex8', {
        formatter: function(value) {
            return 'Current value: ' + value;
        }
    });

    $("#ex1").on("slide", function(slideEvt) {
        $("#ex1SliderVal").text(slideEvt.value);
    });

    $("#ex2").on("slide", function(slideEvt) {
        $("#ex2SliderVal").text(slideEvt.value);
    });

    $("#ex3").on("slide", function(slideEvt) {
        $("#ex3SliderVal").text(slideEvt.value);
    });

    $("#ex4").on("slide", function(slideEvt) {
        $("#ex4SliderVal").text(slideEvt.value);
    });

    $("#ex5").on("slide", function(slideEvt) {
        $("#ex5SliderVal").text(slideEvt.value);
    });

    $("#ex6").on("slide", function(slideEvt) {
        $("#ex6SliderVal").text(slideEvt.value);
    });

    $("#ex7").on("slide", function(slideEvt) {
        $("#ex7SliderVal").text(slideEvt.value);
    });

    $("#ex8").on("slide", function(slideEvt) {
        $("#ex8SliderVal").text(slideEvt.value);
    });

});


