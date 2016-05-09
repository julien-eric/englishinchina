$(document).ready(function() {

    var slider = new Slider('#ex1', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    var slider2 = new Slider('#ex2', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    var slider3 = new Slider('#ex3', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    var slider4 = new Slider('#ex4', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    var slider5 = new Slider('#ex5', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    var slider6 = new Slider('#ex6', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    var slider7 = new Slider('#ex7', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });
    var slider8 = new Slider('#ex8', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });

    $("#ex1").on("slide", function (slideEvt) {
        $("#ex1SliderVal").text(slideEvt.value);
    });

    $("#ex2").on("slide", function (slideEvt) {
        $("#ex2SliderVal").text(slideEvt.value);
    });

    $("#ex3").on("slide", function (slideEvt) {
        $("#ex3SliderVal").text(slideEvt.value);
    });

    $("#ex4").on("slide", function (slideEvt) {
        $("#ex4SliderVal").text(slideEvt.value);
    });

    $("#ex5").on("slide", function (slideEvt) {
        $("#ex5SliderVal").text(slideEvt.value);
    });

    $("#ex6").on("slide", function (slideEvt) {
        $("#ex6SliderVal").text(slideEvt.value);
    });

    $("#ex7").on("slide", function (slideEvt) {
        $("#ex7SliderVal").text(slideEvt.value);
    });

    $("#ex8").on("slide", function (slideEvt) {
        $("#ex8SliderVal").text(slideEvt.value);
    });

    $('#mycalendar1').monthly({
        mode: 'picker',
        target: '#mytarget1',
        setWidth: '250px',
        startHidden: true,
        showTrigger: '#mytarget1',
        stylePast: false,
        disablePast: false
    });

    $('#mycalendar2').monthly({
        mode: 'picker',
        target: '#mytarget2',
        setWidth: '250px',
        startHidden: true,
        showTrigger: '#mytarget2',
        stylePast: false,
        disablePast: false
    });

});