$(document).ready(function() {

    $(".rating").rate({
        readonly: false
    });

    $(".rating").rate("destroy");
    //Destroy makes it uninteractive, but doesn't remove the DOM elements.

});


