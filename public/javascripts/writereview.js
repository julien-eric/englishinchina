// Tooltips Initialization
$(function() {
  $('[data-toggle="tooltip"]').tooltip()
})

$(document).ready(() => {
  let schoolList;

  /***********************
   * STEPPER 
   ************************/
  let navListItems = $('div.setup-panel div a');
  let allWells = $('.setup-content');
  let allNextBtn = $('.nextBtn');
  let allPrevBtn = $('.prevBtn');

  allWells.hide();

  navListItems.click(function(e) {
    e.preventDefault();
    let $target = $($(this).attr('href'));
    let $item = $(this);
    let step = $target.attr('id').slice('5')

    if (!$item.hasClass('disabled')) {
      // Toggle active navlink
      navListItems.removeClass('active')
      $item.addClass('active');
      allWells.hide();
      $target.show();
    }

    //On final step, change the 'nested' fields to review-form to be submitted along
    if (step == 3) {
      $('.form-form-0').attr('form', 'review-form')
      $('.form-form-1').attr('form', 'review-form')
      $('.form-form-2').attr('form', 'review-form')
    } else {
      $('.form-form-0').attr('form', 'form-form-0')
      $('.form-form-1').attr('form', 'form-form-1')
      $('.form-form-2').attr('form', 'form-form-2')
    }

    $('html,body').animate({
      scrollTop: $('#write-review-title').offset().top
    }, 'slow');
  });

  allPrevBtn.click(function() {
    let curStep = $(this).closest(".setup-content");
    let curStepBtn = curStep.attr("id");
    let prevStepSteps = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a");
    prevStepSteps.removeAttr('disabled').trigger('click');
  });

  allNextBtn.click(function() {
    let curStep = $(this).closest(".setup-content");
    let curStepBtn = curStep.attr("id");
    let step = curStepBtn.slice('5');
    let nextStepSteps = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a");
    let curInputs = curStep.find("input[type='text'],input[type='url'],input[type='email']");
    let isValid = true;

    let form = $('#form-form-' + step);
    if (form.length) {
      form.submit(function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.currentTarget.checkValidity()) {
          nextStepSteps.parent().removeClass('disabled');
          nextStepSteps.trigger('click');
        }
      });
    }
    form.submit();

  });

  $('div.setup-panel div a.btn-amber').trigger('click');


  /***********************
   * TYPEAHEAD 
   ***********************/
  // Instantiate the Bloodhound suggestion engine
  var schools = new Bloodhound({
    datumTokenizer: function(datum) {
      return Bloodhound.tokenizers.whitespace(datum.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      wildcard: '%QUERY',
      rateLimitWait: 300,
      url: '/school/query',
      replace: function(url, query) {
        if ($('#schoolInfo').val() != -1) {
          url += '?schoolInfo=' + query;
        }
        if ($('#provinceSelect').val() != -1) {
          url += '&province=' + $('#provinceSelect').val();
        }
        if ($('#citySelect').val() && $('#citySelect').val() != -1) {
          url += '&city=' + $('#citySelect').val();
        }
        return url;

      },
      transform: function(response) {
        // Map the remote source JSON array to a JavaScript object array
        if (response.length > 0) {
          schoolList = response;
          return $.map(response, function(school) {
            return school;
          });
        } else {
          return undefined;
        }
      },
    }
  });

  $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
    {
      name: 'states',
      source: schools,
      display: function(school) {
        if (school) {
          return school.name;
        }
      },
      templates: {
        notFound: ['<div class="mx-2 empty-message"><b>No results found</b></div>'],
        suggestion: function(data) {
          return '<div>' + data.name + '</div>';
        }
      }
    }
  ).blur(function() {

    let hasSelection = null;
    if (schoolList) {
      hasSelection = schoolList.find((school) => {
        return school.name == $(this).val();
      });
    }
    if (hasSelection == null) {
      $('.typeahead').val('');
    }
    validateField($('#schoolInfo')[0]);

  });

  $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
    $('#schoolId').val(suggestion._id);
    validateField($('#schoolInfo')[0]);
  });

  $("#typeahead").val("test");

  let sliders = $('.slider');
  let outputs = $('.output');

  Array.prototype.filter.call(sliders, function(slider, item) {
    slider.oninput = function() {
      outputs[item].innerHTML = this.value;
    }
  });

  $('.datepicker').pickadate({
    formatSubmit: 'MMMM Do YYYY',
    onSet: function(context) {
      validateField(this.$node[0]);
    },
    onStart: function() {
      $('#start-date').removeAttr('readonly');
      $('#end-date').removeAttr('readonly');
    }
  });


});
