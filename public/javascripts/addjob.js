

// Tooltips Initialization
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

let addSchoolCallback = function (data) {
    let school = JSON.parse(data);
    if (school && school._id && school.name) {
        $('#queryInfo').val(school.name);
        $('#schoolId').val(school._id);
        $('#addSchoolCollapsible').collapse('hide');
        $('#addSchoolCollapsible').collapse('dispose');
        $('#noSchool').prop('disabled', true);
        validateField($('#queryInfo')[0]);
    }
}

let ajaxAddSchool = function (url) {

    $.ajax({
        type: "POST",
        url: url,
        data: $("#add-school-form").serialize(), // serializes the form's elements.
        success: addSchoolCallback
    });
}

let initDatePickers = function () {

    let pathname = window.location.pathname;

    $('.datepicker').pickadate({
        formatSubmit: 'MMMM Do YYYY',
        // onSet: function (context) {
        //   validateField(this.$node[0]);
        // },
        onStart: function () {
            $('#start-date').removeAttr('readonly');
            $('#end-date').removeAttr('readonly');
            $('#date-of-birth').removeAttr('readonly');
        }
    });

    let from_picker = $("#start-date").pickadate('picker');
    let to_picker = $("#end-date").pickadate('picker');
    let date_of_birth_picker = $("#date-of-birth").pickadate('picker');

    if (from_picker && to_picker) {

        if (pathname.indexOf('review') != -1) {
            from_picker.set({ 'min': new Date(2000, 1, 1), 'max': Date.now() });
            to_picker.set({ 'min': new Date(2000, 1, 1), 'max': 365 });
        } else if (pathname.indexOf('job') != -1) {
            from_picker.set({ 'min': Date.now() });
            to_picker.set({ 'min': Date.now(), 'max': 1095 });
        }
        
        from_picker.on('set', function (event) {
            if (event.select) {
                to_picker.set('min', from_picker.get('select'))
            } else if ('clear' in event) {
                to_picker.set('min', false)
            }
        });

        to_picker.on('set', function (event) {
            if (event.select) {
                from_picker.set('max', to_picker.get('select'))
            } else if ('clear' in event) {
                from_picker.set('max', false)
            }
        });
    }

    if (date_of_birth_picker) {
        date_of_birth_picker.set('min', new Date(1948, 1, 1));
        date_of_birth_picker.set('max', -(18 * 365));
    }

};

$(document).ready(() => {

    //If we have the school as a param we start on Page 2
    if ($('#schoolId').val() == '') {
        $('#step-0-indicator').trigger('click');
    } else {
        $('#step-1-indicator').trigger('click');
        $('#step-1-indicator').parent().removeClass('disabled');
    }

    let stepper = new Stepper();
    stepper.init();

    let sliders = $('.slider');
    let outputs = $('.output');

    Array.prototype.filter.call(sliders, function (slider, item) {
        slider.oninput = function () {
            outputs[item].innerHTML = this.value;
        }
    });

    initDatePickers();

    $('#citySelect').change(function () {
        if ($(this).val() != '') {
            $('#noSchool').prop('disabled', false);
        } else {
            $('#noSchool').prop('disabled', true);
        }
    });

    // On collapse, change school name input to be part of add-school-form
    $('#addSchoolCollapsible').on('shown.bs.collapse', function () {
        $('#provinceSelect').prop('required', true);
        $('#citySelect').prop('required', true);
    })
    $('#addSchoolCollapsible').on('hidden.bs.collapse', function () {
        $('#provinceSelect').prop('required', false);
        $('#citySelect').prop('required', false);
    })

    // this script will activate a range selector on every .nouirange element with a specific html structure with valid input. Options like minand max are taken from the html attributes.
    document.querySelectorAll('.nouirange').forEach(function (el) {
        let htmlinsert = document.createElement('div');
        let realmininput = el.querySelector('.min');
        let realmaxinput = el.querySelector('.max');
        realmininput.style.display = "none ";
        realmaxinput.style.display = "none ";
        let min = realmininput.getAttribute('min');
        let max = realmaxinput.getAttribute('max');
        let step = realmininput.getAttribute('step');
        el.appendChild(htmlinsert);

        noUiSlider.create(htmlinsert, {
            pips: {
                mode: 'count',
                values: 5,
                density: 5,
                stepped: true
            },
            start: [realmininput.value, realmaxinput.value],
            connect: true,
            step: Number(step),
            range: {
                'min': Number(min),
                'max': Number(max)
            }
        });

        htmlinsert.noUiSlider.on('update', function (values) {
            realmininput.value = String(values[0]);
            $('#salary-lower').val(Math.round(values[0]));
            realmaxinput.value = String(values[1]);
            $('#salary-higher').val(Math.round(values[1]));
        });


    });

    $("#salary-lower").bind('keyup mouseup', function () {
        $('#salaryRange').noUiSlider.set($(this).val());
    });

    $("#salary-higher").bind('keyup mouseup', function () {
        $('#salaryRange').noUiSlider.set($(this).val());
    });


    // Map create school button submission
    $('#addSchool').click(function (event) {

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

        $('#add-school-form').submit();
    });

    //Validation feedback for the user coming for a specific school (it's already selected)
    let searchAll = $('#queryInfo')[0];
    if (searchAll) {
        validateField(searchAll)
    }

});

function countChar(textArea) {
    let charNumber = textArea.value.length;
    let charNumberElem = $('#charNumber');
    charNumberElem.text(charNumber);
    if (charNumber < 140) {
        charNumberElem.addClass('text-danger');
        charNumberElem.removeClass('text-primary');
    } else if (charNumber > 140) {
        charNumberElem.addClass('text-primary');
        charNumberElem.removeClass('text-danger');
    }
};