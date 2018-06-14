
/***********************
 * TYPEAHEAD 
 ***********************/

var schoolList = false;
var notFoundTemplate;

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


$(document).ready(() => {

  var pathname = window.location.pathname;
  var autoTriggerValidation = false;
  notFoundTemplate = ['<div class="mx-2 empty-message"><b>No results found</b></div>'];

  if (pathname.indexOf('review') != -1 || pathname.indexOf('job') != -1){
    autoTriggerValidation = true;
    notFoundTemplate = undefined;
  }

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
        notFound: notFoundTemplate,
        suggestion: function(data) {
          return '<div>' + data.name + ', <span class="text-muted text-capitalize">' + data.province.name + ', ' + data.city.pinyinName + '</span></div>';
        }
      }
    }
  ).blur(function() {

    let hasSelection = null;

    // If we find this inputs value in the schoolList we have a selection
    if (schoolList) {
      hasSelection = schoolList.find((school) => {
        return school.name == $(this).val();
      });
    }

    if (hasSelection == null && autoTriggerValidation) {
      $('#noSchoolGroup').removeClass('d-none');
    }

    // If page requires this input's validation, trigger it
    if (autoTriggerValidation) {
      validateField($('#schoolInfo')[0]);
    }

  });

  $('.typeahead').bind('typeahead:select', function(ev, suggestion) {

    // Set the schoolId to hidden input
    $('#schoolId').val(suggestion._id);

    $('#noSchool').prop('checked', false);
    $('#addSchoolCollapsible').collapse('hide');
    $('#noSchoolGroup').addClass('d-none');

    // If page requires this input's validation, trigger it
    if (autoTriggerValidation) {
      validateField($('#schoolInfo')[0]);
    }
  });

  $('#schoolInfo').on('keyup', function(ev, suggestion, async, data) {

    let hasSelection = false;
    if (schoolList) {
      hasSelection = schoolList.find((school) => {
        return school.name == $(this).val();
      });
    }

    if (!hasSelection && autoTriggerValidation) {
      $('#schoolId').val('');
      $('#noSchoolGroup').removeClass('d-none');
    }

    // If page requires this input's validation, trigger it
    if (autoTriggerValidation) {
      validateField($('#schoolInfo')[0]);
      $('#addSchoolName').val($(this).val());
    }
  });

});