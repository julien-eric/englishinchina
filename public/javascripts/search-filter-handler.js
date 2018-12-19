
/***********************
 * SEARCH FILTERS
 ***********************/

let SearchFilterHandler = function () {
    this.salary = {};

    this.startDateFrom;
    this.startDateTo;
    this.accomodation;
    this.airfare;

    this.dirty = false;
    this.filterState = {};
};

SearchFilterHandler.prototype.init = function () {

    if (!document.getElementById('job-list'))
        return;

    let that = this;

    $('.apply-filter').each(function (index) {
        $(this).click(function (event) {
            that.apply();
        });
    });

    $('.clear-filter').each(function (index) {
        $(this).click(function (event) {

            let filterTag = $(this).attr('data-filter-clear');
            switch (filterTag) {

                case 'Salary':
                    that.resetSalary();
                    break;
                case 'Dates':
                    that.resetDates();
                    break;
                case 'Benefits':
                    that.resetBenefits();
                    break;
                case 'Class':
                    that.resetClass();
                    break;
                default:
                    break;
            }

        });
    });

    this.filterState.clean = $('#filter-state-clean');
    this.filterState.dirty = $('#filter-state-dirty');

    $('#clear-all').click(function (event) {
        that.dirty = false;
        that.resetAll();
        that.sendRequest('/search?ajax=true');
    });

    this.salary.lower = $('#salary-lower');
    this.salary.higher = $('#salary-higher');
    this.salary.handler = document.getElementById('#rangeHandler').noUiSlider;

    this.startDateFrom = $('#start-date-from');
    this.startDateTo = $('#start-date-to');

    this.accomodation = $('#accomodation');
    this.airfare = $('#airfare');

};

SearchFilterHandler.prototype.resetSalary = function () {
    this.salary.handler.set([5, 25]);
    this.apply();
};

SearchFilterHandler.prototype.resetBenefits = function () {
    this.accomodation.val(-1);
    this.airfare.val(-1);
    this.apply();
};

SearchFilterHandler.prototype.resetDates = function () {
    this.startDateFrom.val('');
    this.startDateTo.val('');
    this.apply();
};

SearchFilterHandler.prototype.resetClass = function () {
    this.apply();
};

SearchFilterHandler.prototype.resetAll = function () {
    this.resetSalary();
    this.resetBenefits();
    this.resetDates();
    this.resetClass();
};

SearchFilterHandler.prototype.buildUrl = function () {

    let url = '/search?ajax=true';
    if (this.accomodation.val() != -1) {
        url += '&accomodation=' + this.accomodation.val();
    }
    if (this.airfare.val() != -1) {
        url += '&airfare=' + this.airfare.val();
    }
    if (this.startDateFrom.val()) {
        url += '&startDateFrom=' + this.startDateFrom.val();
    }
    if (this.startDateTo.val()) {
        url += '&startDateTo=' + this.startDateTo.val();
    }
    if (this.salary.lower.val() != -1) {
        url += '&salaryLower=' + (this.salary.lower.val() * 1000);
    }
    if (this.salary.higher.val() != -1) {
        url += '&salaryHigher=' + (this.salary.higher.val() * 1000);
    }
    return url;

};

SearchFilterHandler.prototype.apply = function () {

    let url = this.buildUrl();
    this.dirty = true;
    this.sendRequest(url);

};

SearchFilterHandler.prototype.sendRequest = function (url) {

    $.get(url, function (data) {
        $("#job-list").replaceWith(data);
    });

    if (this.dirty) {
        this.filterState.clean.addClass('d-none');
        this.filterState.dirty.removeClass('d-none');
    } else {
        this.filterState.clean.removeClass('d-none');
        this.filterState.dirty.addClass('d-none');
    }
};

