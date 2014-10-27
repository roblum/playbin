(function(){
        var opopMaps = window.opopMaps || {}
            ,$opop // local offerpop jquery
            ,jQueryVersion = '1.11.0' // jquery version
            ,googleMap;

        opopMaps.prepareLibraries = {
            checkPage : function(){
                if (window.jQuery === undefined || window.jQuery.fn.jquery !== jQueryVersion) {
                    var opop_jQuery = document.createElement('script');
                        opop_jQuery.setAttribute('type','text/javascript');
                        opop_jQuery.setAttribute('src',
                            'https://ajax.googleapis.com/ajax/libs/jquery/' + jQueryVersion + '/jquery.min.js');
                    if (opop_jQuery.readyState) {
                        opop_jQuery.onreadystatechange = function () { // For old versions of IE
                            if (this.readyState == 'complete' || this.readyState == 'loaded') {
                                handleLib();
                            }
                        };
                    } else { // Other browsers
                      opop_jQuery.onload = opopMaps.prepareLibraries.handleLib;
                    }

                    (document.querySelector('head') || document.querySelector('body')).appendChild(opop_jQuery);
                } else {
                    // The jQuery version on the window is the one we want to use
                    $opop = window.jQuery;
                    // Run map visualization

                    return;
                }

                return;
            },
            handleLib : function(){
                // Restore $ and window.jQuery to their previous values and store the
                // new local jQuery called $opop
                $opop = window.jQuery.noConflict(true);

                return;
            }
        };

        opopMaps.mapManager = {
            init : function(campaign, zoom, center, optional){
                var heat = false;

                opopMaps.prepareLibraries.checkPage();

                console.log('hello');
                    mapOptions = {
                        zoom : zoom // Set zoom level of map
                        ,center : new google.maps.LatLng(center.lat, center.lng) // Set center of map
                    }
            },
            createMap : function(){
                var googleMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
            },
            pullFeed : function(){
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
            }

        };

        opopMaps.mapManager.init(opopMapInfo);
})();
