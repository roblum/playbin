(function(){
    var mapConfigurations = (function(){

        var mapOptions;

        var configureMap = function(campaign, zoom, center, optional){
            var heat = false;

            mapOptions = {
                zoom : zoom // Set zoom level of map
                ,center : new google.maps.LatLng(center.lat, center.lng) // Set center of map
            }

        }

        var googleMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        var _ajax = function(){
            var baseURL // API Endpoint
                , apiKey // API Key
                , positive = [] // Positive Latitude Coordinates
                , negative = []; // Negative Latitude Coordinates

            function jsonp(url, callback) {
                var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
                window[callbackName] = function(data) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    callback(data);
                };

                var script = document.createElement('script');
                script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
                document.body.appendChild(script);
            }

            jsonp('https://api.instagram.com/v1/users/276609664/media/recent/?client_id=df70d4f39d3649a9b724876a0f2de343', function(data) {
                console.log(data);
                    // Send data to negative or positive arrays based on latitude

            });

            return {
                pos : positive
                , neg : negative
            }; // This data can go to heat map if its enabled. otherwise will be parsed for loading

        }

        var _markerCreation = function(){

        }

        return {
            configureMap : configureMap
        }

    });


})();
