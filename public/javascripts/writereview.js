// Tooltips Initialization
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})


let addSchoolCallback = function (data) {
  let school = JSON.parse(data);
  if (school && school._id && school.name) {
    $('#queryInfo').val(school.name);
    $('#schoolId').val(school._id);
    $('#addSchoolCollapsible').collapse('hide');
    $('#addSchoolCollapsible').collapse('dispose');
    $('#noSchool').prop('disabled', true);
    validateField($('#queryInfo')[0]);
  }
}

let ajaxAddSchool = function (url) {

  $.ajax({
    type: "POST",
    url: url,
    data: $("#add-school-form").serialize(), // serializes the form's elements.
    success: addSchoolCallback
  });
}

let returnFormName = function () {
  let pathname = window.location.pathname;
  if (pathname.indexOf('review') != -1) {
    return 'review-form';
  } else if (pathname.indexOf('job') != -1) {
    return 'job-form';
  } else {
    return undefined;
  }
}

let initDatePickers = function () {

  let pathname = window.location.pathname;

  $('.datepicker').pickadate({
    formatSubmit: 'MMMM Do YYYY',
    onSet: function (context) {
      validateField(this.$node[0]);
    },
    onStart: function () {
      $('#start-date').removeAttr('readonly');
      $('#end-date').removeAttr('readonly');
    }
  });

  let from_picker = $("#start-date").pickadate('picker');
  let to_picker = $("#end-date").pickadate('picker');

  if (pathname.indexOf('review') != -1) {
    from_picker.set({ 'min': new Date(2000, 1, 1), 'max': Date.now() });
    to_picker.set({ 'min': new Date(2000, 1, 1), 'max': 365 });
  } else if (pathname.indexOf('job') != -1) {
    from_picker.set({ 'min': Date.now() });
    to_picker.set({ 'min': Date.now(), 'max': 1095 });
  }

  from_picker.on('set', function (event) {
    if (event.select) {
      to_picker.set('min', from_picker.get('select'))
    } else if ('clear' in event) {
      to_picker.set('min', false)
    }
  });

  to_picker.on('set', function (event) {
    if (event.select) {
      from_picker.set('max', to_picker.get('select'))
    } else if ('clear' in event) {
      from_picker.set('max', false)
    }
  });


};

$(document).ready(() => {

  let finalFormName = returnFormName();

  /***********************
   * STEPPER 
   ************************/
  let navListItems = $('div.setup-panel div a');
  let allWells = $('.setup-content');
  let allNextBtn = $('.nextBtn');
  let allPrevBtn = $('.prevBtn');
  let currentStep = -1;

  allWells.hide();

  navListItems.click(function (e, curStepValue) {
    e.preventDefault();
    let $target = $($(this).attr('href'));
    let $item = $(this);
    let goToStep = $target.attr('id').slice('5')
    let goToStepBtn = $('div.setup-panel div a[href="#step-' + goToStep + '"]');

    let pressButton = function () {
      if (!$item.hasClass('disabled')) {
        // Toggle active navlink and display correct page
        navListItems.removeClass('active')
        $item.addClass('active');
        allWells.hide();
        $target.show();
        currentStep = goToStep;
      }

      // If on final step, change the 'nested' fields to review-form to be submitted along
      if (goToStep == 3) {
        $('.form-form-0').attr('form', finalFormName)
        $('.form-form-1').attr('form', finalFormName)
        $('.form-form-2').attr('form', finalFormName)

      } else {
        $('.form-form-0').attr('form', 'form-form-0')
        $('.form-form-1').attr('form', 'form-form-1')
        $('.form-form-2').attr('form', 'form-form-2')
      }

      $('html,body').animate({
        scrollTop: $('#write-review-title').offset().top
      }, 'slow');
    }

    let form = $('#form-form-' + currentStep);
    if (form.length && goToStep > currentStep) {
      form.submit(function (event) {

        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.checkValidity()) {
          goToStepBtn.parent().removeClass('disabled');
          pressButton();
        }
      });
      form.submit();
    } else {
      pressButton();
    }
  });

  allPrevBtn.click(function () {
    let curStep = $(this).closest(".setup-content");
    let curStepBtn = curStep.attr("id");
    let prevStepSteps = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a");
    prevStepSteps.removeAttr('disabled').trigger('click');
  });

  allNextBtn.click(function () {

    let curStepElement = $(this).closest(".setup-content");
    let curStepBtn = curStepElement.attr("id");
    let curStepValue = curStepBtn.slice('5');
    let nextStepSteps = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a");
    nextStepSteps.trigger('click', [curStepValue]);
  });

  //If we have the school as a param we start on Page 2
  if ($('#schoolId').val() == '') {
    $('#step-0-indicator').trigger('click');
  } else {
    $('#step-1-indicator').trigger('click');
    $('#step-1-indicator').parent().removeClass('disabled');
  }

  let sliders = $('.slider');
  let outputs = $('.output');

  Array.prototype.filter.call(sliders, function (slider, item) {
    slider.oninput = function () {
      outputs[item].innerHTML = this.value;
    }
  });

  initDatePickers();

  $('#citySelect').change(function () {
    if ($(this).val() != '') {
      $('#noSchool').prop('disabled', false);
    } else {
      $('#noSchool').prop('disabled', true);
    }
  });

  // On collapse, change school name input to be part of add-school-form
  $('#addSchoolCollapsible').on('shown.bs.collapse', function () {
    $('#provinceSelect').prop('required', true);
    $('#citySelect').prop('required', true);
  })
  $('#addSchoolCollapsible').on('hidden.bs.collapse', function () {
    $('#provinceSelect').prop('required', false);
    $('#citySelect').prop('required', false);
  })


  // Map create school button submission
  $('#addSchool').click(function (event) {

    // Intercept create school form submission
    $('#add-school-form').submit(function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.currentTarget.checkValidity()) {
        ajaxAddSchool('/school/addschool');
      } else {
        alert('not valid');
      }
    });

    $('#add-school-form').submit();
  });

  //Validation feedback for the user coming for a specific school (it's already selected)
  validateField($('#queryInfo')[0])

});

function countChar(textArea) {
  let charNumber = textArea.value.length;
  let charNumberElem = $('#charNumber');
  charNumberElem.text(charNumber);
  if (charNumber < 140) {
    charNumberElem.addClass('text-danger');
    charNumberElem.removeClass('text-primary');
  } else if (charNumber > 140) {
    charNumberElem.addClass('text-primary');
    charNumberElem.removeClass('text-danger');
  }
};