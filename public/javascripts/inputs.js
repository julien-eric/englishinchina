let InputController = function () { };

InputController.prototype.init = function () {
    this.initSliders();
    // this.initDatePickers();
    $('.datepicker').datepicker({
        format: 'MM dd yyyy'
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
            $('#salary-lower').val(Math.round(values[0]) * 1000);
            realmaxinput.value = String(values[1]);
            $('#salary-higher').val(Math.round(values[1]) * 1000);
        });
    });

    $("#salary-lower").bind('keyup mouseup', function () {
        $('#salaryRange').noUiSlider.set($(this).val());
    });

    $("#salary-higher").bind('keyup mouseup', function () {
        $('#salaryRange').noUiSlider.set($(this).val());
    });
}
