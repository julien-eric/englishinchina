
$(document).ready(() => {
  var forms = $(".validate-form");
  forms.each((index, form) => {
    form.noValidate = true;
    $('#' + form.getAttribute('id')).submit(validateForm);
  });
});


function validateForm(event) {

  // fetch cross-browser event object and form node
  event = (event ? event : window.event);

  let form = (event.target ? event.target : event.srcElement);
  let f;
  let field;
  let formvalid = true;


  // Loop all fields
  for (f = 0; f < form.elements.length; f++) {

    // Get field
    field = form.elements[f];

    // Ignore buttons, fieldsets, etc.
    if (field.nodeName !== "INPUT" && field.nodeName !== "TEXTAREA" && field.nodeName !== "SELECT") continue;

    formvalid = validateField(field);

  }

  // cancel form submit if validation fails
  if (!formvalid) {
    if (event.preventDefault) event.preventDefault();
  }
  return formvalid;
}

function validateField(field) {


  // Is native browser validation available?
  if (typeof field.willValidate !== "undefined") {

    // Native validation available
    if (field.nodeName === "INPUT" && field.type !== field.getAttribute("type")) {
      // Input type not supported! Use legacy JavaScript validation
      field.setCustomValidity(LegacyValidation(field) ? "" : "error");
    }

    if (isSpecialInput(field)) {
      field.setCustomValidity(validateSpecialInputs(field) ? "" : "error");
    }

    field.checkValidity();


  } else {

    // native validation not available
    field.validity = field.validity || {};
    // set to result of validation function
    field.validity.valid = LegacyValidation(field);
    // if "invalid" events are required, trigger it here
  }

  let $field = $('#' + field.getAttribute('id'));
  if (field.validity.valid) {

    // VALID : remove error styles and messages
    $field.addClass('valid');
    $field.removeClass('invalid');
    return true;

  } else {
    // INVALID : style field, show error, etc.
    $field.addClass('invalid');
    $field.removeClass('valid');
    return false;
  }
}

function isSpecialInput(field) {
  switch (field.getAttribute('id')) {
    case 'schoolId':
      return true;
    case 'schoolInfo':
      return true;
    case 'start-date':
      // return true;
    case 'end-date':
      // return true;

    default:
      return false;
  }
}

function validateSpecialInputs(field) {
  let valid = true;
  let elementId = field.getAttribute('id');

  switch (elementId) {

    case 'start-date':
    case 'end-date':
      if (field.value == '') {

        //School Name Empty. Invalid reset SchoolId
        $('#' + elementId).addClass('invalid');
        $('#' + elementId).removeClass('valid');
        valid = false

      } else {

        //Input is verified. Valid
        $('#' + elementId).addClass('valid');
        $('#' + elementId).removeClass('invalid');

      }

      break;
    case 'schoolId':
      // if (field.value == '') {
      //   valid = false
      //   let sibling = $('#' + elementId).siblings('.tt-input');
      //   console.log(sibling.attr('id') + ' : ' + sibling.val());
      //   $('#' + elementId).siblings('.tt-input').addClass('invalid');
      // } else {
      //   $('#' + elementId).siblings('.tt-input').removeClass('invalid');
      // }
      break;

    case 'schoolInfo':
      let schoolIdInput = $('#' + elementId).siblings('#schoolId');
      if (field.value == '') {

        //School Name Empty. Invalid reset SchoolId
        $('#' + elementId).addClass('invalid');
        $('#' + elementId).removeClass('valid');
        valid = false


      } else if (schoolIdInput.val() == '') {

        //School Name but unverified SchoolId value. Invalid
        $('#' + elementId).addClass('invalid');
        $('#' + elementId).removeClass('valid');
        valid = false;

      } else {

        //Both inputs are verified. Valid
        $('#' + elementId).addClass('valid');
        $('#' + elementId).removeClass('invalid');

      }
      break;

    default:
      break;
  }
  return valid;
}

// basic legacy validation checking
function LegacyValidation(field) {

  var
    valid = true,
    val = field.value,
    type = field.getAttribute("type"),
    chkbox = (type === "checkbox" || type === "radio"),
    required = field.getAttribute("required"),
    minlength = field.getAttribute("minlength"),
    maxlength = field.getAttribute("maxlength"),
    pattern = field.getAttribute("pattern");

  // disabled fields should not be validated
  if (field.disabled) return valid;

  // value required?
  valid = valid && (!required ||
    (chkbox && field.checked) ||
    (!chkbox && val !== "")
  );

  // minlength or maxlength set?
  valid = valid && (chkbox || (
    (!minlength || val.length >= minlength) &&
    (!maxlength || val.length <= maxlength)
  ));

  // test pattern
  if (valid && pattern) {
    pattern = new RegExp(pattern);
    valid = pattern.test(val);
  }

  return valid;
}