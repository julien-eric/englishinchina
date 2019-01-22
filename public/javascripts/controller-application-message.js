let ApplicationMessage = function () { };

ApplicationMessage.prototype.init = function () {

    //Init the component if we are on the current page
    if ($('#apply-to-job').length == 0) { return; }

    this.valuePrompt = $('#write-message-prompt');
    if (this.valuePrompt.length == 1) {
        this.valuePrompt.find('#write-button').click(function () {
            $('html,body').animate({
                scrollTop: $("#write-message-area").offset().top - 75
            }, 'slow');
        });
    }

};
