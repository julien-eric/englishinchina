let Rating = function () { }

Rating.prototype.init = function () {
    $('.rating').rate({
        readonly: false,
    });

    // Destroy makes it uninteractive, but doesn't remove the DOM elements.
    $('.rating').rate('destroy');
};


