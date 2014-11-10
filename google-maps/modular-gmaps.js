var opopMapVisualizations = (function(){
    var opopMaps = window.opopMaps || {}
        ,googleMap
        ,heatData
        ,$opop // local offerpop jquery
        ,bodyHead = document.querySelector('head') || document.querySelector('body')
        ,jQueryVersion = '1.11.0'; // jquery version

    var vendorLibs = {
        'jQuery' : {
            source : 'https://ajax.googleapis.com/ajax/libs/jquery/' + jQueryVersion + '/jquery.min.js'
        }
        ,'google.maps' : {
            source : 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=visualization&callback=opopMapVisualizations.configureMap'
        }
        ,'RichMarker' : {
            source : 'https://s3.amazonaws.com/assets.offerpop.com/roblum/Content_API/maps_v2/script/rich-marker.js'
        }
    };

        opopMaps.prepLib = {
            parseLib : function(vendor){
                var detector = (vendor === 'jQuery') ? opopMaps.prepLib.jqPreLoad : opopMaps.prepLib.handleLoad;

                    detector(vendor);
            },
            jqPreLoad : function(vendor){
                if (window.jQuery === undefined || window.jQuery.fn.jquery !== jQueryVersion) {
                    opopMaps.prepLib.handleLoad(vendor);
                } else {
                    $opop = window.jQuery; // Assign global jQuery to $opop
                    return;
                }

                return;
            },
            handleLoad : function(vendor){
                vendorLibs[vendor].elem = document.createElement('script');
                vendorLibs[vendor].elem.src = vendorLibs[vendor].source;

                if (vendorLibs[vendor].elem.readyState) { // For old versions of IE
                    vendorLibs[vendor].elem.onreadystatechange = function () {
                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                            if (vendor != 'google.maps'){
                                opopMaps.prepLib.loadSteps(vendor);
                            }
                        }
                    };
                } else { // Other browsers
                    if (vendor != 'google.maps'){
                        vendorLibs[vendor].elem.onload = function(){
                            opopMaps.prepLib.loadSteps(vendor);
                        }
                    }
                }

                (bodyHead).appendChild(vendorLibs[vendor].elem);
            },
            loadSteps : function(vendor){
                if (vendor === 'jQuery'){
                    $opop = window.jQuery.noConflict(true);
                    console.log($opop.fn.jquery);

                    opopMaps.prepLib.parseLib('google.maps');
                } else if (vendor === 'RichMarker'){
                    opopMaps.mapManager.pullFeed();
                }

                return;
            }
        };

        opopMaps.mapManager = {
            init : function(){
                var heat = false;

                opopMaps.prepLib.parseLib('jQuery');

            },
            configureMap : function(){
                mapOptions = {
                    zoom : opopMapInfo.zoom // Set zoom level of map
                    ,center : new google.maps.LatLng(opopMapInfo.center.lat, opopMapInfo.center.long) // Set center of map
                }

                var googleMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                opopMaps.prepLib.parseLib('RichMarker');

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

        opopMaps.Addons = {
            /*
             * Map Add-ons. These features will be optional.
             * Heatmap will be a configuration option.
             * If marked as true, the below functions will run.
             * As we pull UGC from Content API, we will store coords into heatData []
             *
             * Possible add-ons: Customize heat colors/radius
             */
            heatMap : function(){
                var pointArray = new google.maps.MVCArray(heatData);
                    ,gradient = [
                        'rgba(0, 255, 255, 0)',
                        'rgba(0, 255, 255, 1)',
                        'rgba(0, 63, 255, 1)',
                        'rgba(0, 0, 255, 1)',
                        'rgba(0, 0, 127, 1)',
                        'rgba(63, 0, 91, 1)',
                        'rgba(191, 0, 31, 1)',
                        'rgba(255, 0, 0, 1)'
                    ] // Add 'defaultGradient'; gradient || defaultGradient;

                heatmap = new google.maps.visualization.HeatmapLayer({
                    data: pointArray
                });

                heatmap.set('radius', 20);
                heatmap.set('gradient', (mapOptions.gradient || gradient));

                opopMaps.Addons.toggleHeat(); // Toggles heatmap and ugc thumbnails
            },
            toggleHeat : function(){
                google.maps.event.addListener(googleMap, 'zoom_changed', function() {
                    var current = googleMap.getZoom();

                    if (current < mapOptions.zoom){
                        $('.ugc-content').hide();
                        heatmap.setMap(googleMap);
                    } else {
                        $('.ugc-content').show();
                        heatmap.setMap(null);
                    }

                }); // Returns zoom level of map when changed
            }
        };

        opopMaps.mapManager.init(opopMapInfo);

        return {
            configureMap : opopMaps.mapManager.configureMap
            // configureMap is returned to global scope so gmaps callback will fire
        }

})();
