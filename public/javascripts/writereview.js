$(document).ready(() => {
  let schoolList;

  // var mediaQueryList = window.matchMedia("(min-width: 800px)");
  // function handleOrientationChange(mql) {
  //   if(mql.matches) {
  //     $('#smartwizard').smartWizard("theme", 'circles');
  //   } else {
  //     $('#smartwizard').smartWizard("theme", 'default');
  //   }
  // } // Define a callback function for the event listener.
  // mediaQueryList.addListener(handleOrientationChange); // Add the callback function as a listener to the query list.
  // handleOrientationChange(mediaQueryList); // Run the orientation change handler once.

  // if ($(window).width() < 480) {
    
  // } else {
  //     $('#smartwizard').smartWizard("theme", 'circles');
  // }


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
          return ['No Results Found'];
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
  });

  $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
    $('#schoolId').val(suggestion._id);
  });

  $("#prev-btn").on("click", function() {
    // Navigate previous
    $('#smartwizard').smartWizard("prev");
    return true;
  });

  $("#next-btn").on("click", function() {
    // Navigate next
    $('#smartwizard').smartWizard("next");
    return true;
  });

  $("#submit-btn").on("click", function() {
    $('#review-form').submit();
  });

  // Initialize the showStep event
  $("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection) {

    if (stepNumber == 0) {
      $("#prev-btn").addClass('d-none');
    } else {
      $("#prev-btn").removeClass('d-none');
    }

    if (stepNumber == 5) {
      $("#next-btn").addClass('d-none');
      $("#submit-btn").removeClass('d-none');
      $('.form-form-0').attr('form', 'review-form')
      $('.form-form-1').attr('form', 'review-form')
      $('.form-form-2').attr('form', 'review-form')
      $('.form-form-3').attr('form', 'review-form')
      $('.form-form-4').attr('form', 'review-form')
    } else {
      $("#next-btn").removeClass('d-none');
      $("#submit-btn").addClass('d-none');
      $('.form-form-0').attr('form', 'form-form-0')
      $('.form-form-1').attr('form', 'form-form-1')
      $('.form-form-2').attr('form', 'form-form-2')
      $('.form-form-3').attr('form', 'form-form-3')
      $('.form-form-4').attr('form', 'form-form-4')
    }
  });


  $("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
    var form = $("#form-form-" + stepNumber);
    if (stepDirection === 'forward' && form) {
      // Loop over them and prevent submission
      $("#form-step-" + stepNumber).addClass('was-validated');
      if (form[0].checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
    return true;
  });

  // Smart Wizard
  $(() => {
    $('#smartwizard').smartWizard({
      selected: 0,
      theme: 'circles',
      transitionEffect: 'fade',
      showStepURLhash: true,
      toolbarSettings: {
        toolbarPosition: 'none',
        toolbarButtonPosition: 'end'
      }
    });
  });

  var slider0 = document.getElementById("slider0");
  var output0 = document.getElementById("criteria0");
  output0.innerHTML = slider0.value;

  // Update the current slider value (each time you drag the slider handle)
  slider0.oninput = function() {
    output0.innerHTML = this.value;
  }

  let sliders = $('.slider');
  let outputs = $('.output');

  Array.prototype.filter.call(sliders, function(slider, item) {
    slider.oninput = function() {
      outputs[item].innerHTML = this.value;
    }
  });

  $(() => {
    $('#datetimepicker1').datetimepicker({
      format: 'MMMM Do YYYY',
      allowInputToggle: true,
    });
  });

  $(() => {
    $('#datetimepicker2').datetimepicker({
      format: 'MMMM Do YYYY',
      allowInputToggle: true,
    });
  });



});
