
/***********************
 * TYPEAHEAD 
 ***********************/
let typeaheadWrapper;
let resultList = false;
let notFoundTemplate;
let currentQuery;
let currentSelection = undefined;
const datasetResultLimit = 5;

let TypeaheadWrapper = function () {
  this.dataSources = [];
  this.totalResults = {};
  this.autoTriggerValidation = false;
  this.currentQueryCallback;
  this.currentQueryDatasets = [];
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
      this.dataSources.push(this.createDataset('schools', 20, schoolSource, 'name', suggestionTemplate));
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

    if (dataset == 'cities') {
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
      rateLimitWait: 130,
      url: queryUrl,
      replace: function (url, query) {
        if ($('#queryInfo').val() != -1) {
          url += '?' + queryInfoName + '=' + query;
        }
        if ($('#provinceSelect')) {
          url += '&province' + '=' + $('#provinceSelect').val();
        }
        if ($('#citySelect')) {
          url += '&city' + '=' + $('#citySelect').val();
        }
        url += '&limit=' + datasetResultLimit;
        return url;

      },
      transform: function (response) {
        // Map the remote source JSON array to a JavaScript object array
        // response = JSON.parse(response);
        if (response.list.length > 0) {
          typeaheadWrapper.totalResults[response.query] = response.total;
          return $.map(response.list, function (element) {
            return element;
          });
        } else {
          return [];
        }
      },
    }
  });
};

TypeaheadWrapper.prototype.createDataset = function (name, limit, source, attributeName, suggestionTemplate) {
  return {
    limit: 100,
    name,
    source,
    display: function (element) {
      if (element) {
        element.type = name;
        if (name == 'schools') {
          return element.name + ', ' + element.province.name + ', ' + element.city.pinyinName;
        } else if (name == 'jobs') {
          return element.title;
        } else if (name == 'cities') {
          return element.pinyinName + ', ' + element.province.name;
        } else if (name == 'provinces') {
          return element.name + ', China';
        }

      }
    },
    templates: {
      header: function (params) {
        let datasetName = params.dataset;
        return '<div class="typeahead-header pl-3 pt-1">' + datasetName + '</div>';
      },
      notFound: TypeaheadWrapper.prototype.notFoundTemplate.bind(this),
      suggestion: suggestionTemplate,
      footer: function (params) {
        let name = params.dataset;
        let number = params.suggestions.length;
        let message = '<div class="typeahead-footer text-small pl-3 py-1">Showing ' + number + '/' + typeaheadWrapper.totalResults[name] + ' ' + name;
        if (number >= datasetResultLimit) {

          switch (name) {
            case 'schools':
              message += ' - <a href="/search?queryInfo=' + params.query + '">see all results</a></div>';
              break;

            case 'jobs':
              message += ' - <a href="/search?queryInfo=' + params.query + '">see all results</a></div>';
              break;

            case 'provinces':
              message += ' - Try narrowing down your search</div>';
              break;

            case 'cities':
              message += ' - Try narrowing down your search</div>';
              break;
          }
          return message;

        } else {
          return undefined;
        }
      },
    }
  }
};

TypeaheadWrapper.prototype.notFoundTemplate = function (element, context) {

  let query = element.query;
  let dataset = element.dataset;
  let pathname = window.location.pathname;

  let generateMessage = function (message) {
    return ['<div class="mx-2 text-small empty-message"><b>' + message + '</b></div>'];
  };

  let handleTemplate = function (query) {
    if (pathname.indexOf('review') != -1) {
      this.autoTriggerValidation = true;
      return generateMessage('No school found for <span class="font-italic">' + query + '</span> (Check box below to proceed with school creation) ');
    } else if (pathname.indexOf('job') != -1) {
      this.autoTriggerValidation = true;
      return generateMessage('No school in our system for <span class="font-italic">' + query + '</span> in the location specified');
    } else {
      return generateMessage('No quick results found for <span class="font-italic">' + query + '</span> (Press Enter to search) ');
    }
  }

  if (this.dataSources.length == 1) {
    return handleTemplate(query);
  }

  if (query === this.currentQueryCallback) {

    this.currentQueryDatasets.push(dataset);
    if (this.currentQueryDatasets.length == this.dataSources.length) {
      return handleTemplate(query);
    }
  } else {
    this.currentQueryCallback = query;
    this.currentQueryDatasets = [];
    this.currentQueryDatasets.push(dataset);
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

  typeaheadWrapper = new TypeaheadWrapper();
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

    // If page requires this input's validation, trigger it
    if (typeaheadWrapper.autoTriggerValidation) {
      let valid = validateField($('#queryInfo')[0]);
      if (!valid) {
        $('#noSchoolGroup').removeClass('d-none');
      }
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

    // get keycode of current keypress event
    let code = (ev.keyCode || ev.which);

    // do nothing if it's an arrow key or enter
    if (code == 37 || code == 38 || code == 39 || code == 40 || code == 13) {
      return;
    }

    if (typeaheadWrapper.autoTriggerValidation) {
      $('#schoolId').val('');
      $('#noSchoolGroup').removeClass('d-none');
    }

    // If page requires this input's validation, trigger it
    if (typeaheadWrapper.autoTriggerValidation) {
      validateField($('#queryInfo')[0]);
      $('#addSchoolName').val($(this).val());
    }
  });

  $('#queryInfo').click( function (ev, suggestion, async, data) {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      let div = $('#queryInfo')
      $('html,body').animate({
        scrollTop: $(div).offset().top - 75
      }, 'slow');
     }
  });
  

  let pathname = window.location.pathname;
  if (pathname.indexOf('review') == -1 && pathname.indexOf('job') == -1) {
    $('#queryInfo').focus();
  }


});