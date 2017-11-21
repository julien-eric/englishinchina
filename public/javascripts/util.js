const setUploadFile = function() {
  if (document.getElementById('file_input')) {
    document.getElementById('file_input').onchange = function() {
      const files = document.getElementById('file_input').files;
      const file = files[0];
      if (file == null) {
        alert('No file selected.');
      } else {
        get_signed_request(file, 1);
      }
    };
  }

  if (document.getElementById('file_input2')) {
    document.getElementById('file_input2').onchange = function() {
      const files = document.getElementById('file_input2').files;
      const file = files[0];
      if (file == null) {
        alert('No file selected.');
      } else {
        get_signed_request(file, 2);
      }
    };
  }
};

function setLightboxOnReadmore() {
  const turnon = function() {
    const original = $(this).closest('.list-group-review');
    const element = original.clone();
    element.find('.review-content').addClass('read-review');
    element.find('h5').remove();
    element.clone().appendTo('#lightboxcontent');
    $('#lightbox').toggle();
    $('body').addClass('noscroll');
  };

  const turnonPicture = function() {
    let url = $(this).css('background-image');
    url = url.substring(5);
    url = url.substring(0, (url.length - 2));
    url = url.replace('th_', '');
    const img = $('<img id="dynamic">'); // Equivalent: $(document.createElement('img'))
    img.addClass('image-lightbox');
    img.attr('src', url);
    img.appendTo('#lightboxcontent');


    // var original = $(this).closest(".school-img-list-item");
    // var element = original.clone()
    // element.clone().appendTo("#lightboxcontent")
    $('#lightbox').toggle();
    $('body').addClass('noscroll');
  };

  const turnoff = function() {
    const element = $('#lightboxcontent').empty();
    $('#lightbox').toggle();
    $('body').removeClass('noscroll');
  };

    // $(".readmore").click(turnon);
    // $(".school-img-list-item").click(turnonPicture);
    // $("#lightbox").click(turnoff);
}

function get_signed_request(file, number) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/sign_s3?file_name=${file.name}&file_type=${file.type}`);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        upload_file(file, number, response.signed_request, response.url);
      } else {
        alert('Could not get signed URL.');
      }
    }
  };
  xhr.send();
}

function upload_file(file, number, signed_request, url) {
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', signed_request);
  xhr.setRequestHeader('x-amz-acl', 'public-read');
  xhr.upload.onprogress = function(event) {
    if (event.lengthComputable) {
      // evt.loaded the bytes browser receive
      // evt.total the total bytes seted by the header
      const percentComplete = (event.loaded / event.total) * 100;
      if (number == 1) {
        $('#progress-bar-picture').css('width', `${percentComplete}%`).attr('aria-valuenow', percentComplete);
      } else {
        $('#progress-bar-picture2').css('width', `${percentComplete}%`).attr('aria-valuenow', percentComplete);
      }
    }
  };
  xhr.onload = function() {
    if (xhr.status === 200) {
      const preview = $('#preview');
      preview.toggle();
      preview.attr('src', `${'https://' + 'englishinchinaasia' + '.s3.amazonaws.com/'}${url}`);
      if (number == 1) {
        document.getElementById('avatarUrl').value = url;
      } else {
        document.getElementById('logoUrl').value = url;
      }
      xhr2 = new XMLHttpRequest();
      xhr2.open('POST', `/pictureuploaded?url=${url}&filename=${file.name}&filesize=${file.size}`);
      if (xhr2.readyState === 4) {
        if (xhr2.status === 200) {
          const response = JSON.parse(xhr2.responseText);
          alert('WORKED.');
        } else {
          alert('FAILED.');
        }
      }
      xhr2.send();
    }
  };
  xhr.onerror = function(err) {
    alert(`Could not upload file.${err}`);
  };
  xhr.send(file);
}

$(document).ready(() => {
  const page = 2;

  function capitalize(str) {
    strVal = '';
    str = str.split(' ');
    for (let chr = 0; chr < str.length; chr++) {
      strVal += `${str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length)} `;
    }
    return strVal;
  }


  setLightboxOnReadmore();
  setUploadFile();


  $('#city-select.empty').prop('disabled', 'disabled');

  $('#provinceSelect').on('change', function() {
    $('#city-select option:gt(0)').remove(); // remove all options, but not the first
    $('#city-select').prop('disabled', 'disabled');
    $.ajax({
      url: `/cities/${this.value}`,
      success(results) {
        $('#city-select').prop('disabled', false);
        const $element = $('#city-select');
        for (let i = 0; i <= results.length; i++) {
          $element.append($('<option></option>')
            .attr('value', results[i].code).text(`${capitalize(results[i].pinyinName)} - ${results[i].chineseName}`));
        }
      },
    });
  });
});

