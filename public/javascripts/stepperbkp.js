let Stepper = function () {
    this.finalForm;

    this.contentSections;
    this.contentSectionForms;
    this.navigationButtons;
    
    this.currentStep = -1;
    this.nextButtons;
    this.prevButtons;
};

Stepper.prototype.init = function () {

    let that = this;
    this.finalForm = $('.stepper form');
    this.contentSections = this.finalForm.children('.setup-content');
    this.navigationButtons = $('.stepper nav .step');

    this.navigationButtons.addClass('disabled');

    if (this.contentSections.length != this.navigationButtons.length) {
        throw new Error('Number of navigation tabs is different from the number of sections');
    }

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

    this.initNavigationButtons();
    // this.initFlowButtons();

}

Stepper.prototype.toggleFormsToFromFinal = function (goToStep) {
    if (goToStep == this.navigationButtons.length) {
        $('.form-form-0').attr('form', this.finalForm.attr('id'))
        $('.form-form-1').attr('form', this.finalForm.attr('id'))
        $('.form-form-2').attr('form', this.finalForm.attr('id'))

    } else {
        $('.form-form-0').attr('form', 'form-form-0')
        $('.form-form-1').attr('form', 'form-form-1')
        $('.form-form-2').attr('form', 'form-form-2')
    }
};

Stepper.prototype.initFlowButtons = function () {

    this.nextButtons = $('.stepper .nextBtn');
    this.prevButtons = $('.stepper .prevBtn');

    this.prevButtons.click(function () {
        let curStep = $(this).closest(".setup-content");
        let curStepBtn = curStep.attr("id");
        let prevStepSteps = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a");
        prevStepSteps.removeAttr('disabled').trigger('click');
    });

    this.nextButtons.click(function () {
        let curStepElement = $(this).closest(".setup-content");
        let curStepBtn = curStepElement.attr("id");
        let curStepValue = curStepBtn.slice('5');
        let nextStepSteps = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a");
        nextStepSteps.trigger('click', [curStepValue]);
    });
};

Stepper.prototype.navButtonClick = function (event) {

    event.preventDefault();

    let target;
    
    $.each(that.navigationButtons, function (index, navigationButton) {
        if (navigationButton.isSameNode(this)) {
            target = navigationButton;
        };
    });

    // let $target = $($(this).attr('href'));
    // let $item = $(this);
    // let goToStep = $target.attr('id').slice('5')
    // let goToStepBtn = $('div.setup-panel div a[href="#step-' + goToStep + '"]');

    let pressButton = function () {
        if (!target.hasClass('disabled')) {
            // Toggle active navlink and display correct page
            that.navigationButtons[that.currentStep].removeClass('active')
            $item.addClass('active');
            that.contentSections.hide();
            $target.show();
            currentStep = goToStep;
        }

        // If on final step, change the 'nested' fields to review-form to be submitted along
        that.toggleFormsToFromFinal(goToStep);

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

        navigationButton.click(that.navButtonClick);
    });
};

