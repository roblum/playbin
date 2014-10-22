(function(){
    var mapConfigurations = (function(campaign, center, zoom, heat){
        var mapOptions;

        var configureMap = function(campaign, center, zoom, heat){
            mapOptions = {
                zoom : zoom
                ,center : new google.maps.LatLng(center.lat, center.lng)
            }

            return mapOptions
        }
        

        var googleMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        return {
            configureMap : configureMap 
        }

    });

})();
