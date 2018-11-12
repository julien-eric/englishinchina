var FileUploader = function () {

  let elements = [];

  let getElementIndex = function (elements, id) {
    let picturePreviewIndex = -1;
    elements.forEach(function (element, index) {
      if (element.inputId == id) {
        picturePreviewIndex = index;
      }
    });
    return picturePreviewIndex;
  }

  let init = function (inputId, urlPrefix, previewPrefix, progressPrefix, fdbPrefix) {

    if (document.getElementById(inputId)) {

      let newElement = {
        dom: $('#' + inputId),
        inputId,
        urlPrefix,
        previewPrefix,
        progressPrefix,
        currentPrefix: 'current',
        fdbPrefix
      }
      elements.push(newElement);

      document.getElementById(inputId).onchange = () => {
        const files = document.getElementById(inputId).files;
        const file = files[0];
        if (file == null) {
          alert('No file selected.');
        } else {
          getSignedRequest(file, getElementIndex(elements, inputId));
          document.getElementById(urlPrefix + '-' + inputId).value = file.name;
        }
      };

      let previewDiv = document.getElementById(previewPrefix + '-' + inputId);
      if (previewDiv) {
        document.getElementById(previewPrefix + '-' + inputId).onclick = () => {
          $('#' + inputId).trigger('click');
        };
      }

    }

  };

  let getSignedRequest = function (file, index) {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/sign_s3?file_name=${file.name}&file_type=${file.type}`);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          uploadFile(file, index, response.signed_request, response.url);
        } else {
          alert('Could not get signed URL.');
        }
      }
    };
    xhr.send();
  }

  function uploadFile(file, index, signed_request, url) {

    element = elements[index];
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signed_request);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        $('#' + element.progressPrefix + '-' + element.inputId).css('width', `${percentComplete}%`).attr('aria-valuenow', percentComplete);
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        const preview = $('#' + element.previewPrefix + '-' + element.inputId);
        const current = $('#' + element.currentPrefix + '-' + element.inputId);
        const fdbLabel = $('#' + element.fdbPrefix + '-' + element.inputId);


        if (preview.is('img')) {
          preview.toggleClass('d-none');
          preview.attr('src', `${'https://' + 'englishinchinaasia' + '.s3.amazonaws.com/'}${url}`);
        } else if (preview.is('div')) {
          preview.css("background-image", "url(https://englishinchinaasia.s3.amazonaws.com/" + url + ")");
        } else if (fdbLabel) {
          fdbLabel.removeClass('d-none');
        }
        
        if(current){
            current.val(file.name);
        }

        document.getElementById(element.urlPrefix + '-' + element.inputId).value = url;

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

    xhr.onerror = function (err) {
      alert(`Could not upload file.${err}`);
    };

    xhr.send(file);
  }

  return {
    init: init
  }
}

$(document).ready(() => {
  let fileUploader = new FileUploader();
  fileUploader.init('job-offer-picture', 'url', 'preview', 'progress');
  fileUploader.init('school-user-picture', 'url', 'preview', 'progress');
  fileUploader.init('new-school-picture', 'url', 'preview', 'progress');
  fileUploader.init('new-company-picture', 'url', 'preview', 'progress');
  fileUploader.init('new-company-logo', 'url', 'preview', 'progress');
  fileUploader.init('resume', 'url', 'preview', 'progress', 'fdb-label');
});



