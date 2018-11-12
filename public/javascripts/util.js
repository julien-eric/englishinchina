$(document).ready(() => {

    $('#school-list-collapse').on('show.bs.collapse', function () {
        $('.school-list-chevron').toggleClass('mdi-chevron-down');
        $('.school-list-chevron').toggleClass('mdi-chevron-up');
    });

    $('#school-list-collapse').on('hide.bs.collapse', function () {
        $('.school-list-chevron').toggleClass('mdi-chevron-down');
        $('.school-list-chevron').toggleClass('mdi-chevron-up');
    });

    $('#company-list-collapse').on('show.bs.collapse', function () {
        $('.company-list-chevron').toggleClass('mdi-chevron-down');
        $('.company-list-chevron').toggleClass('mdi-chevron-up');
    });

    $('#company-list-collapse').on('hide.bs.collapse', function () {
        $('.company-list-chevron').toggleClass('mdi-chevron-down');
        $('.company-list-chevron').toggleClass('mdi-chevron-up');
    });

    $('#job-list-collapse').on('show.bs.collapse', function () {
        $('.job-list-chevron').toggleClass('mdi-chevron-down');
        $('.job-list-chevron').toggleClass('mdi-chevron-up');
    });

    $('#job-list-collapse').on('hide.bs.collapse', function () {
        $('.job-list-chevron').toggleClass('mdi-chevron-down');
        $('.job-list-chevron').toggleClass('mdi-chevron-up');
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    function capitalize(str) {
        strVal = '';
        str = str.split(' ');
        for (let chr = 0; chr < str.length; chr++) {
            strVal += `${str[chr].substring(0, 1).toUpperCase() + str[chr].substring(1, str[chr].length)} `;
        }
        return strVal;
    }

    // MDB Lightbox Init
    $(function () {
        $("#mdb-lightbox-ui").load("mdb-addons/mdb-lightbox-ui.html");
    });

    //Photogrid
    $('#collapsePhoto').on('show.bs.collapse', () => {
        $('.photos #show-more').toggleClass('d-none');
        $('.photos #show-less').toggleClass('d-none');
    });

    $('#collapsePhoto').on('hide.bs.collapse', () => {
        $('.photos #show-more').toggleClass('d-none');
        $('.photos #show-less').toggleClass('d-none');
    });

    //School descriptions
    $('#collapseDescription').on('show.bs.collapse', () => {
        $('.description #show-more').toggleClass('d-none');
        $('.description #show-less').toggleClass('d-none');
    });

    $('#collapseDescription').on('hide.bs.collapse', () => {
        $('#show-more').toggleClass('d-none');
        $('#show-less').toggleClass('d-none');
    });

    $('#elicit-email').click(() => {
        const xhr = new XMLHttpRequest();
        const pathname = window.location.pathname;
        xhr.open('GET', '/login');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    $('#modal-body').empty();
                    // const response = JSON.parse(xhr.responseText);
                    const elements = $($.parseHTML(xhr.responseText));
                    $.each(elements, (index, element) => {
                        $(element).appendTo('#modal-body');
                    });
                    // $('#modal-title').val(xhr.response);
                    $('#slw-modal').modal('show')
                    setUploadFile();
                } else {
                    alert('Problem.');
                }
            }
        };
        xhr.send();
    });


    // Navbar transparency removal
    if ($('#main-header').hasClass('transparent')) {
        var scroll_start = 0;

        $(document).scroll(function () {
            scroll_start = $(this).scrollTop();
            if (scroll_start > 1) {
                $("#main-header").addClass('bg-white');
                $("#main-header").removeClass('transparent');
            } else {
                $("#main-header").removeClass('bg-white');
                $("#main-header").addClass('transparent');
            }
        });
    }

    $('#main-header').on('hide.bs.collapse', function () {
        $("#main-header").addClass('collapsed');
    })

    $('#main-header').on('show.bs.collapse', function () {
        $("#main-header").removeClass('collapsed');
    })

    setTimeout(function () {
        // $('.flash-messages').fadeOut(500);
        $('.flash-messages-container ').fadeOut(2000);
    }, 5000);


    // Material Select Initialization
    $('.mdb-select').material_select();

    $('#citySelect.empty').prop('disabled', 'disabled');

    $('#provinceSelect').on('change', function () {
        $('#citySelect option:gt(0)').remove(); // remove all options, but not the first
        $('#citySelect').prop('disabled', 'disabled');
        $('#citySelect').siblings("input").prop('disabled', 'disabled');
        $.ajax({
            url: `/cities/${this.value}`,
            success(results) {
                const element = $('#citySelect');
                element.prop('disabled', false);
                element.siblings("input").prop('disabled', false);
                for (let i = 0; i < results.length; i++) {
                    element.append($('<option></option>')
                        .attr('value', results[i].code).text(`${capitalize(results[i].pinyinName)} - ${results[i].chineseName}`));
                }
                element.material_select('destroy');
                element.material_select();
            },
        });
    });
});

