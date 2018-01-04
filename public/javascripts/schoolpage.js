$(document).ready(() => {
  $('.chart').horizBarChart({
    selector: '.bar',
    speed: 1800,
  });

  const height = $('.description-container').height();
  if (height > 550) {
    $('.description-container').animate({'max-height': '550px'}, 500, () => {});
    $('#read-more').click(() => {
      $('.description-container').animate({'max-height': '2000px'}, 500, () => {
        $('#read-more').remove();
      });
    });
  } else {
    $('#read-more').remove();
  }

  $(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();
    $(this).ekkoLightbox();
  });

  $('.ajax-login').click(() => {
    const xhr = new XMLHttpRequest();
    const pathname = window.location.pathname;
    xhr.open('GET', `/loginajax?url=${pathname}`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          $('#modal-body').empty();
          const response = JSON.parse(xhr.responseText);
          const elements = $($.parseHTML(response.html));
          $.each(elements, (index, element) => {
            $(element).appendTo('#modal-body');
          });
          $('#modal').trigger('click');
          setUploadFile();
        } else {
          alert('Problem.');
        }
      }
    };
    xhr.send();
  });

  $('#ajax-add-photo').click(() => {
    const schoolid = $('#schoolid').attr('value');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/school/addphotoajax/${schoolid}`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          $('#modal-body').empty();
          const response = JSON.parse(xhr.responseText);
          const elements = $($.parseHTML(response.html));
          $.each(elements, (index, element) => {
            $(element).appendTo('#modal-body');
          });
          $('#modal').trigger('click');
          setUploadFile();
        } else {
          alert('Problem.');
        }
      }
    };
    xhr.send();
  });

  $(document).on('click', '.helpful', function(e) {
    e.preventDefault();
    let element;
    let reviewId;
    if ($(this).closest('.list-group-review')[0]) {
      element = $(this).closest('.list-group-review')[0];
      reviewId = element.id;
    } else if ($(this).closest('.single-review')[0]) {
      element = $(this).closest('.single-review')[0];
      reviewId = element.id;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/school/helpfuls/0/${reviewId}`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          if (result.result == '1') {
            const elements = $($.parseHTML(result.html));
            $(`.hf_${result.reviewId}`).replaceWith(elements);
          }
        } else {
          alert('Problem.');
        }
      }
    };
    xhr.send();
  });

  $('.readmore').click(function(e) {
    e.preventDefault();
    const reviewid = $(this).closest('.list-group-review')[0].id;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/school/reviews/${reviewid}?ajax=true`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          $('#modal-body').empty();
          const response = JSON.parse(xhr.responseText);
          const elements = $($.parseHTML(response.html));
          $.each(elements, (index, element) => {
            $(element).appendTo('#modal-body');
          });
          $('#modal').trigger('click');
          $('.rating').rate({
            readonly: false,
          });
          $('.rating').rate('destroy');
          $('.chart').horizBarChart({
            selector: '.bar',
            speed: 1800,
          });
        } else {
          alert('Problem.');
        }
      }
    };
    xhr.send();
  });

  $('#load-more-reviews').click(() => {
    const schoolid = $('#schoolid').attr('value');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/school/reviews/${schoolid}/${page}`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          // alert("success." + response.html);
          const elements = $($.parseHTML(response.html));
          $.each(elements, (index, element) => {
            $(element).appendTo('#reviews');
          });
          $('.rating').rate({
            readonly: false,
          });
          $('.rating').rate('destroy');
          $('.readmore').unbind();
          $('.school-img-list-item').unbind();
          $('#lightbox').unbind();
          page++;
          setLightboxOnReadmore();
        } else {
          alert('Problem.');
        }
      }
    };
    xhr.send();
  });
});
