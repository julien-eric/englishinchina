let stepperInstance;

let Stepper = function () {
    stepperInstance = this;

    this.finalForm;

    this.contentSections;
    this.sectionForms;
    this.navigationButtons;

    this.currentStep = -1;
    this.nextButtons;
    this.prevButtons;
};

Stepper.prototype.init = function () {

    this.finalForm = $('.stepper form').not('.stepper-nested-forms form');
    this.contentSections = this.finalForm.children('.setup-content');
    this.navigationButtons = $('.stepper nav .step');
    this.sectionForms = $('.stepper .stepper-nested-forms form');

    this.navigationButtons.addClass('disabled');

    if (this.contentSections.length != this.navigationButtons.length) {
        throw new Error('Number of navigation tabs is different from the number of sections');
    }

    this.initContentSections();
    this.initNavigationButtons();
    this.initSectionForms();
    this.initFlowButtons();
}

Stepper.prototype.returnStepForTarget = function (array, target) {
    let targetIndex;
    $.each(array, function (index, arrayElement) {
        if (arrayElement.isSameNode(target)) {
            targetIndex = index;
        };
    });
    return targetIndex;
};

Stepper.prototype.toggleFormsToFromFinal = function (goToStep) {

    let that = stepperInstance;

    if (goToStep + 1 == that.navigationButtons.length) {
        $.each(that.sectionForms, function (index, sectionForm) {
            let formId = $(sectionForm).attr('id');
            $('.' + formId).attr('form', that.finalForm.attr('id'))
        });
    } else {
        $.each(that.sectionForms, function (index, sectionForm) {
            let formId = $(sectionForm).attr('id');
            $('.' + formId).attr('form', formId)
        });
    }
};

Stepper.prototype.initFlowButtons = function () {

    this.nextButtons = $('.stepper .nextBtn');
    this.prevButtons = $('.stepper .prevBtn');

    this.prevButtons.click(function () {
        let that = stepperInstance;
        $(that.navigationButtons[that.currentStep - 1]).trigger('click');
    });

    this.nextButtons.click(function () {
        let that = stepperInstance;
        $(that.navigationButtons[that.currentStep + 1]).trigger('click');
    });
};

Stepper.prototype.navButtonClick = function (event) {

    let that = stepperInstance;

    event.preventDefault();

    let wantedStep = that.returnStepForTarget(that.navigationButtons, event.currentTarget);

    if (wantedStep > that.currentStep) {
        $(that.sectionForms[that.currentStep]).submit({ wantedStep }, that.runValidation);
        $(that.sectionForms[that.currentStep]).submit();
    } else {
        that.goToPage(wantedStep);
    }
};

Stepper.prototype.runValidation = function (event) {

    let that = stepperInstance;

    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget.checkValidity()) {
        $(that.navigationButtons[event.data.wantedStep]).removeClass('disabled');
        that.goToPage(event.data.wantedStep);
    }
};

Stepper.prototype.goToPage = function (step) {

    let that = stepperInstance;

    // Toggle active navlink and display correct page
    $(that.navigationButtons).removeClass('active')
    $(that.contentSections).hide();

    $(that.contentSections[step]).show();
    $(that.contentSections[step]).addClass('active');

    that.currentStep = step;

    // If on final step, change the 'nested' fields to review-form to be submitted along
    that.toggleFormsToFromFinal(step);

    if (that.navigationButtons[step + 1]) {
        $(that.navigationButtons[step + 1]).removeClass('disabled');
    }

    $('html,body').animate({
        scrollTop: $('#write-review-title').offset().top
    }, 'slow');
}

Stepper.prototype.initContentSections = function () {
    let that = this;

    $.each(this.contentSections, function (index, element) {
        let section = $(element);
        const id = 'step-' + index;
        section.attr('id', id);
        if (!section.hasClass('active')) {
            section.hide();
        } else {
            that.currentStep = index;
        }
    });
};

Stepper.prototype.initNavigationButtons = function () {
    let that = this;

    $.each(this.navigationButtons, function (index, navigationButton) {
        let stepDiv = $(navigationButton);
        let stepLink = stepDiv.children('a');
        const target = 'step-' + index;
        const id = 'step-' + index + '-indicator';
        stepLink.attr('id', id);
        stepLink.attr('href', target);

        if ($(that.contentSections[index]).hasClass('active')) {
            stepDiv.removeClass('disabled');
        } else if (index > 0 && $(that.contentSections[index - 1]).hasClass('active')) {
            stepDiv.removeClass('disabled');
        }

    });

    that.navigationButtons.click(that.navButtonClick);
};

Stepper.prototype.initSectionForms = function () {
    let that = this;

    $.each(this.sectionForms, function (index, sectionForm) {
        let section = $(sectionForm);
        const id = 'form-' + index;
        section.attr('id', id);
        // section.on("submit", that.runValidation);
    });

};
