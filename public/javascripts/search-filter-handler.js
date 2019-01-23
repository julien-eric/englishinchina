
/***********************
 * SEARCH FILTERS
 ***********************/

let SearchFilterHandler = function () {
    this.salary = {};
    this.currentSearchQuery;

    this.startDateFrom;
    this.startDateTo;
    this.accomodation;
    this.airfare;
};

SearchFilterHandler.prototype.init = function () {

    // Initialize only on correct page
    if (!document.getElementById('job-list'))
        return;

    let that = this;

    this.searchBox = $('#search-all');
    this.searchBox.input = $('#queryInfo');
    this.searchBox.submit(function (event) {
        event.preventDefault();
        that.apply();
        return false;
    });

    $('.clear-filter').each(function (index) {
        $(this).click(function (event) {
            event.preventDefault();

            let filterTag = $(this).attr('data-filter-clear');
            switch (filterTag) {

                case 'Salary':
                    that.resetSalary(true);
                    break;
                case 'Dates':
                    that.resetDates(true);
                    break;
                case 'Benefits':
                    that.resetBenefits(true);
                    break;
                case 'Class':
                    that.resetClass(true);
                    break;
                default:
                    break;
            }

        });
    });

    $('#clear-all').click(function (event) {
        that.resetAll();
        that.pushHistory();
        that.apply();
    });

    this.salary.lower = $('#salary-lower');
    this.salary.higher = $('#salary-higher');
    this.salary.handler = document.getElementById('#rangeHandler').noUiSlider;

    this.startDateFrom = $('#start-date-from');
    this.startDateTo = $('#start-date-to');

    this.accomodation = $('#accomodation');
    this.airfare = $('#airfare');

    $('.filter').each(function (index, element) {
        $(this).change(function (event) {
            that.pushHistory();
            that.apply();
        });
    });

    slworld.inputs.datepicker.on('hide', function (ev) {
        that.pushHistory();
        that.apply();
    });

    window.onpopstate = function (event) {
        that.apply();
        let url = window.location.href;
        let locationInfo;
        if (event.state && event.state.url)
            url = window.location.protocol + '//' + window.location.host + '/search' + event.state.url;
        if (event.state && event.state.locationInfo)
            locationInfo = event.state.locationInfo;
        that.updateFiltersUI(url, locationInfo);
    };

    let timer = setTimeout(that.updateDirtyState.bind(that), 3000);

    $('.typeahead').bind('typeahead:select', function (ev, suggestion) {
        that.currentSearchQuery = suggestion;
        that.pushHistory();
        that.apply();
    });

    let clearSearch = $('#clear-search');
    if (clearSearch) {
        clearSearch.click(function () {
            that.resetSearchBar(true);
        });
    }
};

SearchFilterHandler.prototype.updateDirtyState = function () {
    let path = window.location.pathname;
    if (history.state && history.state.url) {
        path = history.state.url;
    }

    if (path.length > 8) {
        $('#filter-state-clean').addClass('d-none');
        $('#filter-state-dirty').removeClass('d-none');
    } else {
        $('#filter-state-clean').removeClass('d-none');
        $('#filter-state-dirty').addClass('d-none');
    }

    setTimeout(this.updateDirtyState.bind(this), 1500);

};

SearchFilterHandler.prototype.resetSearchBar = function (updateHistory) {
    $('.typeahead').typeahead('val', '');
    if (updateHistory) {
        this.pushHistory();
        this.apply();
    }
};

SearchFilterHandler.prototype.resetSalary = function (updateHistory) {
    this.salary.handler.set([5, 25]);
    if (updateHistory) {
        this.pushHistory();
        this.apply();
    }
};

SearchFilterHandler.prototype.resetBenefits = function (updateHistory) {
    this.accomodation.val(-1);
    this.airfare.val(-1);
    if (updateHistory) {
        this.pushHistory();
        this.apply();
    }
};

SearchFilterHandler.prototype.resetDates = function (updateHistory) {
    this.startDateFrom.val('');
    this.startDateTo.val('');
    if (updateHistory) {
        this.pushHistory();
        this.apply();
    }
};

SearchFilterHandler.prototype.resetClass = function (updateHistory) {
    if (updateHistory) {
        // this.apply();
    }
};

SearchFilterHandler.prototype.resetAll = function () {
    this.resetSalary(false);
    // this.resetSearchBar(false);
    this.resetBenefits(false);
    this.resetDates(false);
    this.resetClass(false);
    this.pushHistory();
    this.apply();
};

SearchFilterHandler.prototype.updateFiltersUI = function (url, locationInfo) {
    let urlObject = new URL(url);
    let urlSearchParams = urlObject.searchParams;

    if (urlSearchParams.has('province')) {
        $('.typeahead').typeahead('val', locationInfo.name + ', China');
    } else if (urlSearchParams.has('city')) {
        $('.typeahead').typeahead('val', locationInfo.pinyinName);
    } else {
        $('.typeahead').typeahead('val', '');
    }


    if (urlSearchParams.has('salaryLower')) {
        this.salary.handler.set([Number(urlSearchParams.get('salaryLower')) / 1000, null]);
    } else {
        this.salary.handler.set([5, null]);
    }

    if (urlSearchParams.has('salaryHigher')) {
        this.salary.handler.set([null, Number(urlSearchParams.get('salaryHigher')) / 1000]);
    } else {
        this.salary.handler.set([null, 25]);
    }

    if (urlSearchParams.has('accomodation')) {
        this.accomodation.val(urlSearchParams.get('accomodation'));
    } else {
        this.accomodation.val(-1);
    }

    if (urlSearchParams.has('airfare')) {
        this.airfare.val(urlSearchParams.get('airfare'));
    } else {
        this.airfare.val(-1);
    }

    if (urlSearchParams.has('startDateFrom')) {
        this.startDateFrom.val(urlSearchParams.get('startDateFrom'));
    } else {
        this.startDateFrom.val('');
    }

    if (urlSearchParams.has('startDateTo')) {
        this.startDateTo.val(urlSearchParams.get('startDateTo'));
    } else {
        this.startDateTo.val('');
    }

};

SearchFilterHandler.prototype.pushHistory = function () {

    let url = '?';

    if (this.searchBox.input.val() != '' && this.currentSearchQuery) {
        if (this.currentSearchQuery.type == 'cities') {
            url += 'city=' + this.currentSearchQuery.code + '&';
        } else if (this.currentSearchQuery.type == 'provinces') {
            url += 'province=' + this.currentSearchQuery.code + '&';
        }
    }
    if (this.accomodation.val() != -1) {
        url += 'accomodation=' + this.accomodation.val() + '&';
    }
    if (this.airfare.val() != -1) {
        url += 'airfare=' + this.airfare.val() + '&';
    }
    if (this.startDateFrom.val()) {
        url += 'startDateFrom=' + this.startDateFrom.val() + '&';
    }
    if (this.startDateTo.val()) {
        url += 'startDateTo=' + this.startDateTo.val() + '&';
    }
    if (this.salary.lower.val() != -1 && Number(this.salary.lower.val()) != 5) {
        url += 'salaryLower=' + (this.salary.lower.val() * 1000) + '&';
    }
    if (this.salary.higher.val() != -1 && Number(this.salary.higher.val()) != 25) {
        url += 'salaryHigher=' + (this.salary.higher.val() * 1000);
    }

    if (url[url.length - 1] == '&') {
        url = url.substring(0, url.length - 1);
    }

    history.pushState({ url: url, locationInfo: this.currentSearchQuery }, "page 2", url);

};

SearchFilterHandler.prototype.apply = function () {

    let that = this;

    $('#loading-spinner').removeClass('d-none');
    $("#job-list").replaceWith('<div id="job-list"></div>');

    let updateUI = function (data) {
        that.updateDirtyState();
        $("#job-list").replaceWith(data);
        $('#loading-spinner').addClass('d-none');
    }

    if (history.state && history.state.url) {
        $.get(history.state.url + '&ajax=true', updateUI);
    } else {
        $.get('/search' + '&ajax=true', updateUI);
    }

};

