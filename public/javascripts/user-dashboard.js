let Dashboard = function () { };

Dashboard.prototype.init = function () {

    this.valuePropModal = $('#teacher-profile-vp');
    if (this.valuePropModal.length == 1) {
        this.valuePropModal.find('#vp-close').click(this.closeValueProp.bind(this));
        this.valuePropModal.find('#gotit-vp').click(this.closeValueProp.bind(this));
    }

    //Init the component if we are on the current page
    if ($('#user-profile').length == 0) { return; }

};

Dashboard.prototype.closeValueProp = function () {
    this.valuePropModal.hide('fast');
}