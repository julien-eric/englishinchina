let replaceAtIndex = function (str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

let initLazyLoading = function () {
    var lazyBackgrounds = [].slice.call(document.querySelectorAll(".lazy-background"));

    if ("IntersectionObserver" in window) {
        let lazyBackgroundObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    let prefixIndex = entry.target.style.backgroundImage.indexOf('th_');
                    entry.target.style.backgroundImage = replaceAtIndex(entry.target.style.backgroundImage, prefixIndex, 'lg_');
                    // entry.target.classList.add("visible");
                    lazyBackgroundObserver.unobserve(entry.target);
                }
            });
        });

        lazyBackgrounds.forEach(function (lazyBackground) {
            lazyBackgroundObserver.observe(lazyBackground);
        });
    }
};

$(document).ready(() => {

    initLazyLoading();

    $('#splash-padding').height($('#search-navigation').height());
    $(window).resize(function () {
        $('#splash-padding').height($('#search-navigation').height());
    });

    let readMore = $('#read-more-container');
    if (readMore) {
        $('#read-more-button').click(function (event) {
            event.preventDefault();
            $('#read-more-container').addClass('show');
            $('#read-more-button').remove();

        });
    }

    $('.collapse-link').each(function (link) {
        let id = $(this).attr('href');
        $(id).on('show.bs.collapse', function () {
            $(id + '-chevron').toggleClass('mdi-chevron-down');
            $(id + '-chevron').toggleClass('mdi-chevron-up');
        });
        $(id).on('hide.bs.collapse', function () {
            $(id + '-chevron').toggleClass('mdi-chevron-down');
            $(id + '-chevron').toggleClass('mdi-chevron-up');
        });
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    function capitalize (str) {
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

    function countChar (textArea) {
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

    // Material Select Initialization
    // $('.mdb-select').material_select();

    $('#citySelect.empty').prop('disabled', 'disabled');

    $('#provinceSelect').on('change', function () {
        $('#citySelect option:gt(0)').remove(); // remove all options, but not the first
        $('#citySelect').prop('disabled', 'disabled');
        $('#citySelect').siblings("input").prop('disabled', 'disabled');
        $.ajax({
            url: `/cities/${this.value}`,
            success (results) {
                const element = $('#citySelect');
                element.prop('disabled', false);
                element.siblings("input").prop('disabled', false);
                for (let i = 0; i < results.length; i++) {
                    element.append($('<option></option>')
                        .attr('value', results[i].code).text(`${capitalize(results[i].pinyinName)} - ${results[i].chineseName}`));
                }
            }
        });
    });
});

