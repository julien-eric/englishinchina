const setUploadFile = function() {
  if (document.getElementById('file_input')) {
    document.getElementById('file_input').onchange = function() {
      const files = document.getElementById('file_input').files;
      const file = files[0];
      if (file == null) {
        alert('No file selected.');
      } else {
        get_signed_request(file, 1);
        document.getElementById('avatarUrl').value = file.name;
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
        document.getElementById('logoUrl').value = file.name;
      }
    };
  }
};

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

      if (preview.is('img')) {
        preview.toggleClass('d-none');
        preview.attr('src', `${'https://' + 'englishinchinaasia' + '.s3.amazonaws.com/'}${url}`);
      } else if (preview.is('div')) {
        preview.css("background-image", "url(https://englishinchinaasia.s3.amazonaws.com/" + url + ")");
      }
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

  $(function() {
    $('[data-toggle="tooltip"]').tooltip()
  });

  function capitalize(str) {
    strVal = '';
    str = str.split(' ');
    for (let chr = 0; chr < str.length; chr++) {
      strVal += `${str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length)} `;
    }
    return strVal;
  }

  // MDB Lightbox Init
  $(function() {
    $("#mdb-lightbox-ui").load("mdb-addons/mdb-lightbox-ui.html");
  });

  //Photogrid
  $('#collapsePhoto').on('show.bs.collapse', () => {
    $('.photos #show-more').toggleClass('d-none');
    $('.photos #show-less').toggleClass('d-none');
  });

  $('#collapsePhoto').on('hide.bs.collapse', () => {
    $('.photos #show-more').toggleClass('d-none');
    $('.photos #show-less').toggleClass('d-none');
  });

  //School descriptions
  $('#collapseDescription').on('show.bs.collapse', () => {
    $('.description #show-more').toggleClass('d-none');
    $('.description #show-less').toggleClass('d-none');
  });

  $('#collapseDescription').on('hide.bs.collapse', () => {
    $('#show-more').toggleClass('d-none');
    $('#show-less').toggleClass('d-none');
  });

  $('#elicit-email').click(() => {
    const xhr = new XMLHttpRequest();
    const pathname = window.location.pathname;
    xhr.open('GET', '/login');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          $('#modal-body').empty();
          // const response = JSON.parse(xhr.responseText);
          const elements = $($.parseHTML(xhr.responseText));
          $.each(elements, (index, element) => {
            $(element).appendTo('#modal-body');
          });
          // $('#modal-title').val(xhr.response);
          $('#slw-modal').modal('show')
          setUploadFile();
        } else {
          alert('Problem.');
        }
      }
    };
    xhr.send();
  });

  setUploadFile();

  // Material Select Initialization
  $('.mdb-select').material_select();

  /* affix the navbar after scroll below header */
  // $('.main-header').affix({
  //   offset: {
  //     top: $('#search-navigation').offset().top
  //   }
  // });

  $('#citySelect.empty').prop('disabled', 'disabled');

  $('#provinceSelect').on('change', function() {
    $('#citySelect option:gt(0)').remove(); // remove all options, but not the first
    $('#citySelect').prop('disabled', 'disabled');
    $('#citySelect').siblings("input").prop('disabled', 'disabled');
    $.ajax({
      url: `/cities/${this.value}`,
      success(results) {
        const element = $('#citySelect');
        element.prop('disabled', false);
        element.siblings("input").prop('disabled', false);
        for (let i = 0; i < results.length; i++) {
          element.append($('<option></option>')
            .attr('value', results[i].code).text(`${capitalize(results[i].pinyinName)} - ${results[i].chineseName}`));
        }
        element.material_select('destroy');
        element.material_select();
      },
    });
  });
});

