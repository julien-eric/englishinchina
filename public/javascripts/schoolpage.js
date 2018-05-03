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
    const reviewId = this.getAttribute('reviewid');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/school/helpfuls/0/${reviewId}`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          if (result.result == '1') {
            const elements = $($.parseHTML(result.html));
            $(`#hf-${result.reviewId}`).replaceWith(elements);
          }
        } else {
          alert('Problem.');
        }
      }
    };
    xhr.send();
  });

  $('#slw-modal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    const reviewId = button.data('reviewid');
    const reviewerName = button.data('reviewuser');
    $('#modal-body').empty();

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/school/reviews/${reviewId}?ajax=true`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const elements = $($.parseHTML(response.html));
          $.each(elements, (index, element) => {
            $(element).appendTo('#modal-body');
          });
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

    var modal = $(this)
    modal.find('.modal-title').text('Review from ' + reviewerName)
  })

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
