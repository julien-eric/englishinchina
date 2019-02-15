let Dashboard = function () { };

Dashboard.prototype.init = function () {

    this.valuePropModal = $('#teacher-profile-vp');
    if (this.valuePropModal.length == 1) {
        this.valuePropModal.find('#vp-close').click(this.closeValueProp.bind(this));
        this.valuePropModal.find('#gotit-vp').click(this.closeValueProp.bind(this));
    }

    //Init the component if we are on the current page
    // if ($('#user-profile').length == 0) { return; }

    if ($('#user-job-list').length != 0) {
        $('.delete-job').click(this.handleJobDelete.bind(this));
    }

};

Dashboard.prototype.closeValueProp = function () {
    this.valuePropModal.hide('fast');
}

Dashboard.prototype.handleJobDelete = function (event) {
    if (confirm('Are you sure you want to delete "' + event.target.dataset.title + '"')) {
        $.post('/job/delete/' + event.target.dataset.url, function (data) {
            if (data.success) {
                window.location.href = "/user";
            } else {
                alert('There was an error trying to delete the job offer, please try again later.');
            }
        })
    }
}
