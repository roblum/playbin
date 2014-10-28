(function(){
        var opopMaps = window.opopMaps || {}
            ,$opop // local offerpop jquery
            ,jQueryVersion = '1.11.0' // jquery version
            ,googleMap
            ,vendorLibs = {
                'jQuery' : {
                    source : 'https://ajax.googleapis.com/ajax/libs/jquery/' + jQueryVersion + '/jquery.min.js'
                }
                ,'google.maps' : {
                    source : 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=visualization'
                }
                ,'RichMarker' : {
                    source : 'https://s3.amazonaws.com/assets.offerpop.com/roblum/Content_API/maps_v2/script/rich-marker.js'
                }
            }
            ,bodyHead = document.querySelector('head') || document.querySelector('body')



        opopMaps.prepareLibraries = {
            checkJquery : function(vendor){
                for (var i in vendor){
                    var current = vendor[i]
                        ,detector = (current === 'jQuery') ? opopMaps.prepareLibraries.handleJQLoad : opopMaps.prepareLibraries.handleLoad;
                        console.log(current);
                        detector(current);
                }
                return;
            },
            handleJQLoad : function(vendor){
                if (window.jQuery === undefined || window.jQuery.fn.jquery !== jQueryVersion) {
                    opopMaps.prepareLibraries.handleLoad(vendor, true);
                } else {
                    $opop = window.jQuery; // Assign global jQuery to $opop
                    return;
                }

                return;
            },
            handleLoad : function(vendor, jQ){
                vendorLibs[vendor].elem = document.createElement('script');
                vendorLibs[vendor].elem.src = vendorLibs[vendor].source;

                if (vendorLibs[vendor].elem.readyState) {
                    vendorLibs[vendor].elem.onreadystatechange = function () { // For old versions of IE
                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                            return;
                        }
                    };
                } else { // Other browsers
                    vendorLibs[vendor].elem.onload = function(){
                        if (jQ){
                            $opop = window.jQuery.noConflict(true);
                            console.log($opop.fn.jquery);
                        }

                        return;
                    }
                }

                (bodyHead).appendChild(vendorLibs[vendor].elem);
            }
        };

        opopMaps.mapManager = {
            init : function(){
                var heat = false;

                opopMaps.prepareLibraries.checkJquery(['jQuery', 'google.maps', 'RichMarker']);

                console.log('hello');
                    mapOptions = {
                        zoom : opopMapInfo.zoom // Set zoom level of map
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
