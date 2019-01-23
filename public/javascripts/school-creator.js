let SchoolCreator = function () { };

SchoolCreator.prototype.init = function () {

    this.initAddSchoolAjax();
    $('#citySelect').change(function () {
        if ($(this).val() != '') {
            $('#noSchool').prop('disabled', false);
        } else {
            $('#noSchool').prop('disabled', true);
        }
    });
};

SchoolCreator.prototype.addSchoolCallback = function (data) {
    let school = JSON.parse(data);
    if (school && school._id && school.name) {
        $('#queryInfo').val(school.name);
        $('#schoolId').val(school._id);
        $('#addSchoolCollapsible').collapse('hide');
        $('#addSchoolCollapsible').collapse('dispose');
        $('#noSchool').prop('disabled', true);
        validateField($('#queryInfo')[0]);
    }
};

SchoolCreator.prototype.ajaxAddSchool = function (url) {
    $.ajax({
        type: "POST",
        url: url,
        data: $("#add-school-form").serialize(), // serializes the form's elements.
        success: this.addSchoolCallback
    });
};



SchoolCreator.prototype.initAddSchoolAjax = function () {

    if ($('#addSchool').length != 0) {

        // On collapse, change school name input to be part of add-school-form
        $('#addSchoolCollapsible').on('shown.bs.collapse', function () {
            $('#provinceSelect').prop('required', true);
            $('#citySelect').prop('required', true);
        })
        $('#addSchoolCollapsible').on('hidden.bs.collapse', function () {
            $('#provinceSelect').prop('required', false);
            $('#citySelect').prop('required', false);
        })

        // Intercept create school form submission
        $('#add-school-form').submit(function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.currentTarget.checkValidity()) {
                ajaxAddSchool('/school/addschool');
            } else {
                alert('not valid');
            }
        });

        // Map create school button submission
        $('#addSchool').click(function (event) {
            $('#add-school-form').submit();
        });
    }

};
