$(document).ready(
    function(){
        (function () {
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
        xhr.onload = function () {
            if (xhr.status === 200) {
                document.getElementById("preview").src = url;
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
        xhr.onerror = function () {
            alert("Could not upload file.");
        };
        xhr.send(file);
    }

    var returnThumbnail= function(url){
        var a = document.createElement('a');
        a.href = url;
        var pathname = a.pathname;
        var hostname = a.hostname;
        return hostname + "/th_" + pathname.substring(1);
    }
});