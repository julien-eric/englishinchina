
/***********************
 * TYPEAHEAD 
 ***********************/

let resultList = false;
let notFoundTemplate;
let currentSelection = undefined;
let currentQuery;

let TypeaheadWrapper = function () {
  this.dataSources = [];
  this.autoTriggerValidation = false;
  this.schoolList;
  let pathname = window.location.pathname;

  if (pathname.indexOf('review') != -1 || pathname.indexOf('job') != -1) {
    this.autoTriggerValidation = true;
  }
};

TypeaheadWrapper.prototype.initDatasets = function (bloodhoundDatasets) {

  bloodhoundDatasets.forEach((dataset) => {

    if (dataset == 'schools') {
      let schoolSource = this.createBloodhoundDataset('/school/query', 'queryInfo');
      let suggestionTemplate = function (element) {
        return '<div>' + element.name + ', <span class="text-muted text-capitalize">' + element.province.name + ', ' + element.city.pinyinName + '</span></div>';
      }
      this.dataSources.push(this.createDataset('schools', 5, schoolSource, 'name', suggestionTemplate));
    }

    if (dataset == 'jobs') {
      let jobSource = this.createBloodhoundDataset('/job/query', 'jobInfo');
      let suggestionTemplate = function (element) {
        return '<div>' + element.title + ', China' + '</span></div>';
      }
      this.dataSources.push(this.createDataset('jobs', 5, jobSource, 'title', suggestionTemplate))
    }

    if (dataset == 'provinces') {
      let provinceSource = this.createBloodhoundDataset('/queryprovinces', 'searchInfo');
      let suggestionTemplate = function (element) {
        return '<div>' + element.name + '</span></div>';
      }
      this.dataSources.push(this.createDataset('provinces', 5, provinceSource, 'name', suggestionTemplate))
    }

    if (dataset == 'cities'){
      let citySource = this.createBloodhoundDataset('/querycities', 'searchInfo');
      let suggestionTemplate = function (element) {
        return '<div>' + element.pinyinName + '</span></div>';
      }
      this.dataSources.push(this.createDataset('cities', 5, citySource, 'pinyinName', suggestionTemplate))
    }

  });
};

TypeaheadWrapper.prototype.createBloodhoundDataset = function (queryUrl, queryInfoName) {
  return new Bloodhound({
    datumTokenizer: function (datum) {
      return Bloodhound.tokenizers.whitespace(datum.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      wildcard: '%QUERY',
      rateLimitWait: 300,
      url: queryUrl,
      replace: function (url, query) {
        if ($('#queryInfo').val() != -1) {
          url += '?' + queryInfoName + '=' + query;
        }
        return url;

      },
      transform: function (response) {
        // Map the remote source JSON array to a JavaScript object array
        if (response.length > 0) {
          return $.map(response, function (element) {
            return element;
          });
        } else {
          return undefined;
        }
      },
    }
  });
};

TypeaheadWrapper.prototype.createDataset = function (name, limit, source, attributeName, suggestionTemplate) {
  return {
    limit,
    name,
    source,
    display: function (element) {
      if (element) {
        element.type = name;
        return element[attributeName];
      }
    },
    templates: {
      header: '<div class="typeahead-header pl-3 pt-1">' + name + '</div>',
      notFound: this.notFoundTemplate,
      suggestion: suggestionTemplate
    }
  }
};

TypeaheadWrapper.prototype.notFoundTemplate = function (element) {
  var a = element;

  let pathname = window.location.pathname;
  notFoundTemplate = ['<div class="mx-2 empty-message"><b>No results found</b></div>'];

  if (pathname.indexOf('review') != -1 || pathname.indexOf('job') != -1) {
    this.autoTriggerValidation = true;
    notFoundTemplate = undefined;
  }
}

TypeaheadWrapper.prototype.handleSubmit = function (e) {
  // validation code here

  if (currentSelection) {
    e.preventDefault();

    switch (currentSelection.type) {
      case 'schools':
        window.location.href = '/school/' + currentSelection._id;
        break;

      case 'jobs':
        window.location.href = '/job/' + currentSelection._id;
        break;

      case 'provinces':
        window.location.href = '/search?province=' + currentSelection.code;
        break;

      case 'cities':
        window.location.href = '/search?city=' + currentSelection.code;
        break;

      default:
        break;
    }
  }
}

$(document).ready(() => {

  let typeaheadWrapper = new TypeaheadWrapper();
  let datasetNames = $('#queryInfo').attr('datasets').valueOf().split(' ');
  typeaheadWrapper.initDatasets(datasetNames);
  $('#search-all').on('submit', typeaheadWrapper.handleSubmit);

  $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
    typeaheadWrapper.dataSources
  ).blur(function () {

    let hasSelection = null;

    // If we find this inputs value in the schoolList we have a selection
    if (typeaheadWrapper.schoolList) {
      hasSelection = typeaheadWrapper.schoolList.find((school) => {
        return school.name == $(this).val();
      });
    }

    if (hasSelection == null && typeaheadWrapper.autoTriggerValidation) {
      $('#noSchoolGroup').removeClass('d-none');
    }

    // If page requires this input's validation, trigger it
    if (typeaheadWrapper.autoTriggerValidation) {
      validateField($('#queryInfo')[0]);
    }

  });

  $('.typeahead').bind('typeahead:select', function (ev, suggestion) {

    // Set the schoolId to hidden input
    $('#schoolId').val(suggestion._id);
    currentSelection = suggestion;

    $('#noSchool').prop('checked', false);
    $('#addSchoolCollapsible').collapse('hide');
    $('#noSchoolGroup').addClass('d-none');

    // If page requires this input's validation, trigger it
    if (typeaheadWrapper.autoTriggerValidation) {
      validateField($('#queryInfo')[0]);
    }
  });

  $('#queryInfo').on('keyup', function (ev, suggestion, async, data) {

    let hasSelection = false;
    if (typeaheadWrapper.schoolList) {
      hasSelection = typeaheadWrapper.schoolList.find((school) => {
        return school.name == $(this).val();
      });
    }

    if (!hasSelection && typeaheadWrapper.autoTriggerValidation) {
      $('#schoolId').val('');
      $('#noSchoolGroup').removeClass('d-none');
    }

    // If page requires this input's validation, trigger it
    if (typeaheadWrapper.autoTriggerValidation) {
      validateField($('#queryInfo')[0]);
      $('#addSchoolName').val($(this).val());
    }
  });

});