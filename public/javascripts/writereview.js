$(document).ready(() => {
  const slider = new Slider('#ex1', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });
  const slider2 = new Slider('#ex2', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });
  const slider3 = new Slider('#ex3', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });
  const slider4 = new Slider('#ex4', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });
  const slider5 = new Slider('#ex5', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });
  const slider6 = new Slider('#ex6', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });
  const slider7 = new Slider('#ex7', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });
  const slider8 = new Slider('#ex8', {
    formatter(value) {
      return `Current value: ${value}`;
    },
  });

  $('#ex1').on('slide', (slideEvt) => {
    $('#ex1SliderVal').text(slideEvt.value);
  });

  $('#ex2').on('slide', (slideEvt) => {
    $('#ex2SliderVal').text(slideEvt.value);
  });

  $('#ex3').on('slide', (slideEvt) => {
    $('#ex3SliderVal').text(slideEvt.value);
  });

  $('#ex4').on('slide', (slideEvt) => {
    $('#ex4SliderVal').text(slideEvt.value);
  });

  $('#ex5').on('slide', (slideEvt) => {
    $('#ex5SliderVal').text(slideEvt.value);
  });

  $('#ex6').on('slide', (slideEvt) => {
    $('#ex6SliderVal').text(slideEvt.value);
  });

  $('#ex7').on('slide', (slideEvt) => {
    $('#ex7SliderVal').text(slideEvt.value);
  });

  $('#ex8').on('slide', (slideEvt) => {
    $('#ex8SliderVal').text(slideEvt.value);
  });

  $(() => {
    $('#datetimepicker1').datetimepicker({
      format: 'dddd, MMMM Do YYYY',
      allowInputToggle: true,
    });
  });

  $(() => {
    $('#datetimepicker2').datetimepicker({
      format: 'dddd, MMMM Do YYYY',
      allowInputToggle: true,
    });
  });
});
