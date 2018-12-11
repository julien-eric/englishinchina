let GoogleMapsWrapper = function () { };

GoogleMapsWrapper.prototype.init = function () {

    if (!document.getElementById('map'))
        return;

    let mapDiv = document.getElementById('map');
    let lat = mapDiv.getAttribute('lat');
    let long = mapDiv.getAttribute('long');
    let address = mapDiv.getAttribute('address');

    // The location if specified 
    var location = { lat: Number(lat), lng: Number(long) };

    // The map, centered at Uluru
    var map = new google.maps.Map(mapDiv, { zoom: 6, center: location });

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
};
