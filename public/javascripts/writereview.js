// Tooltips Initialization
$(function() {
  $('[data-toggle="tooltip"]').tooltip()
})

let addSchoolCallback = function(data) {
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

let ajaxAddSchool = function(url) {

  $.ajax({
    type: "POST",
    url: url,
    data: $("#add-school-form").serialize(), // serializes the form's elements.
    success: addSchoolCallback
  });
}

let returnFormName = function(pathname) {
  if (pathname.indexOf('review') != -1) {
    return 'review-form';
  } else if (pathname.indexOf('job') != -1) {
    return 'job-form';
  } else {
    return undefined;
  }
}


$(document).ready(() => {
  let schoolList;
  let locationSpecified;

  let finalFormName = returnFormName(window.location.pathname);

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
  
  $('#citySelect').change(function() {
    if ($(this).val() != '') {
      $('#noSchool').prop('disabled', false);
    } else {
      $('#noSchool').prop('disabled', true);
    }
  });
  
  // On collapse, change school name input to be part of add-school-form
  $('#addSchoolCollapsible').on('shown.bs.collapse', function() {
    $('#provinceSelect').prop('required', true);
    $('#citySelect').prop('required', true);
  })
  $('#addSchoolCollapsible').on('hidden.bs.collapse', function() {
    $('#provinceSelect').prop('required', false);
    $('#citySelect').prop('required', false);
  })
  
  
  // Map craete school button submission
  $('#addSchool').click(function(event) {
    
    // Intercept create school form submission
    $('#add-school-form').submit(function(event) {
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



});
