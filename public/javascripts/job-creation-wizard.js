let JobCreationWizard = function () {
};

JobCreationWizard.prototype.init = function () {

    this.jobOfferInfo = {};

    this.jobCreationForm = $('#job-form');
    if (this.jobCreationForm.length != 1)
        return;

    this.jobCreationForm.submit(this.submit.bind(this));
}

JobCreationWizard.prototype.submit = function (event) {
    let validationInfo = slworld.validator.validateForm(event);
    if (!validationInfo.valid) {
        event.preventDefault();
        $('#job-creation-error-box').removeClass('d-none');
        let invalidFields = validationInfo.invalidFields;
        if (invalidFields.length > 0) {
            $('#job-creation-error-list').empty();
            invalidFields.forEach((field) => {
                let labelText = $('#' + field.getAttribute('id')).closest('.form-group').find('label').text();
                $('<li>' + labelText + '</div>').appendTo('#job-creation-error-list');
            });
        }
    } else {
        return true;
    }

};
