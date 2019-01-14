/***********************
 * SLWORLD 
 ***********************/

slworld = {};
typeaheadWrapper = {};

let SLWorld = function () {
    this.googleMapsWrapper = new GoogleMapsWrapper();
};

SLWorld.prototype.init = function () {

    //file-uploader.js
    this.fileUploader = new FileUploader();
    this.fileUploader.init('job-offer-picture', 'url', 'preview', 'progress');
    this.fileUploader.init('school-user-picture', 'url', 'preview', 'progress');
    this.fileUploader.init('new-school-picture', 'url', 'preview', 'progress');
    this.fileUploader.init('new-company-picture', 'url', 'preview', 'progress');
    this.fileUploader.init('new-company-logo', 'url', 'preview', 'progress');
    this.fileUploader.init('resume', 'url', 'preview', 'progress', 'fdb-label');

    //rating.js
    this.ratingWrapper = new Rating();
    this.ratingWrapper.init();

    //google-maps-wrapper
    this.googleMapsWrapper = new GoogleMapsWrapper();
    // this.googleMapsWrapper.init();

    //inputs.js
    this.inputs = new InputController();
    this.inputs.init();

    //search-filter-handler.js
    this.searchFilterHandler = new SearchFilterHandler();
    this.searchFilterHandler.init();

    //read-more.js
    this.readMoreController = new ReadMore();
    this.readMoreController.init();

    //school-creator.js
    this.schoolCreator = new SchoolCreator();
    this.schoolCreator.init();

    //validator.js
    this.validator = new Validator();
    this.validator.init();

    //stepper-wizard-wrapper.js
    this.stepperWizard = new Stepper();
    this.stepperWizard.init();

    //typeahead-wrapper.js
    typeaheadWrapper = new TypeaheadWrapper();
    this.typeaheadWrapper = typeaheadWrapper;
    typeaheadWrapper.init();

};

slworld = new SLWorld();

$(document).ready(() => {
    slworld.init();
});

//Load Analytics in Prod
if (window.location.origin.indexOf('secondlanguage.world') != -1) {
    (function (i, s, o, g, r, a, m) {
        i.GoogleAnalyticsObject = r; i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
            m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
    }(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'));
    ga('create', 'UA-79825336-1', 'auto');
    ga('send', 'pageview');
}

// Tooltips Initialization
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})