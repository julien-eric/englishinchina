let InputController = function () { };

InputController.prototype.init = function () {
    this.initSliders();
    // this.initDatePickers();
    this.datepicker = $('.input-daterange').datepicker({
        format: 'MM dd yyyy',
        autoclose: true
    });
    this.initTinyMce();
    this.initRange();
}

InputController.prototype.initSliders = function () {
    let sliders = $('.slider');
    let outputs = $('.output');

    Array.prototype.filter.call(sliders, function (slider, item) {
        slider.oninput = function () {
            outputs[item].innerHTML = this.value;
        }
    });
}

InputController.prototype.initDatePickers = function () {
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
}

InputController.prototype.initTinyMce = function () {
    if ($('#tinymce-textarea')) {
        tinymce.init({
            selector: '#tinymce-textarea',
            menubar: false,
            style_formats: [
                { title: 'Header', format: 'h3' },
            ],
            setup (editor) {
                editor.on('change', () => {
                    editor.save();
                });
            },
            plugins: 'link paste',
            toolbar: 'link undo redo styleselect bold italic bullist numlist',
            //   toolbar: 'link undo redo styleselect bold italic outdent indent bullist numlist',
            paste_as_text: true
        });
    }
};

InputController.prototype.initRange = function () {
    // this script will activate a range selector on every .nouirange element with a specific html structure with valid input. Options like minand max are taken from the html attributes.
    document.querySelectorAll('.nouirange').forEach(function (el) {
        let keypressSlider = document.createElement('div');
        keypressSlider.setAttribute("id", "#rangeHandler");
        let realmininput = el.querySelector('.min');
        let realmaxinput = el.querySelector('.max');
        realmininput.style.display = "none ";
        realmaxinput.style.display = "none ";
        let min = realmininput.getAttribute('min');
        let max = realmaxinput.getAttribute('max');
        let step = realmininput.getAttribute('step');
        el.appendChild(keypressSlider);

        noUiSlider.create(keypressSlider, {
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

        var input0 = document.getElementById('salary-lower');
        var input1 = document.getElementById('salary-higher');
        var inputs = [input0, input1];

        keypressSlider.noUiSlider.on('update', function (values, handle) {
            inputs[handle].value = values[handle];
            // $('#' + inputs[handle].id).change();
        });

        keypressSlider.noUiSlider.on('change', function (values, handle) {
            // inputs[handle].value = values[handle];
            $('#' + inputs[handle].id).change();
        });

        // Listen to keydown events on the input field.
        inputs.forEach(function (input, handle) {

            input.addEventListener('change', function () {
                keypressSlider.noUiSlider.setHandle(handle, this.value);
            });

        });
    });


}
