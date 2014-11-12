var opopMapVisualizations = (function(){
    var opopMaps = window.opopMaps || {}
        ,googleMap
        ,heatData
        ,$opop // local offerpop jquery
        ,bodyHead = document.querySelector('head') || document.querySelector('body')
        ,jQueryVersion = '1.11.0'; // jquery version

    var ugcStorage = {}
        ,heatmap
        ,heatData = []
        ,googleMap
        ,ugcCounter = 1

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
                var mapOptions = {
                    zoom : opopMapInfo.zoom // Set zoom level of map
                    ,center : new google.maps.LatLng(opopMapInfo.center.lat, opopMapInfo.center.long) // Set center of map
                }

                googleMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                opopMaps.prepLib.parseLib('RichMarker');

            },
            pullFeed : function(){
                var baseURL = 'https://s3.amazonaws.com/assets.offerpop.com/Assets/Boohoo/script/response.json' // API Endpoint

                var ajax = $.getJSON(baseURL,{ get_param: 'value' }, function(data) {
                    console.log(data);
                    opopMaps.mapManager.storeUGC(data);

                    if (ugcStorage['item1']){
                        var first = ugcStorage['item1']
                            ,coord = new google.maps.LatLng(first.latitude, first.longitude);

                            googleMap.panTo(coord);
                    }

                });


                ajax.complete(function(){
                      /* Sets to latest item in feed
                       * Currently no detection if positive/negative
                       * Will add in functionality to pan to latest item in feed pos || neg
                       */
                      opopMaps.addons.heatMap();
                      console.log(ugcStorage);
                });

            },
            storeUGC : function(data){
            console.log(data);

                for (var i in data){
                    console.log(data[i])
                    var content         = data[i].content
                        ,platform_data  = content.platform_data
                        ,geo_data       = platform_data.geo_data
                        ,images         = content.media.media_urls
                        ,network        = content.social_platform;

                    console.log(geo_data);

                    // Store necessary UGC data into geoStore object
                    var newUGC = {
                                author          : content.author.username
                                ,avatar         : content.author.profile.avatar
                                ,caption        : content.text
                                ,latitude       : geo_data.coordinates.latitude
                                ,longitude      : geo_data.coordinates.longitude
                                ,large_image    : images.large_image
                                ,network        : network
                                ,timestamp      : new Date(content.created_on).toDateString()
                                ,platform_link  : platform_data.social_platform_original_url
                    }

                    // If twitter, store the tweet #
                    if (network === 'twitter') newUGC.platform_ref = content.platform_ref;
                    // Twitter desktop stores location as Polygon; Store first polygon value
                    if (geo_data.coordinates['0']){
                        newUGC.latitude = geo_data.coordinates['0'].latitude;
                        newUGC.longitude = geo_data.coordinates['0'].longitude;
                    }

                    // Store geo data in global array
                    ugcStorage['item' + ugcCounter] = newUGC; // Store obj in global repo
                    // Store geo data in heatMap array
                    heatData.push(new google.maps.LatLng(newUGC.latitude, newUGC.longitude));

                    // Create marker with data
                    opopMaps.mapManager.createMarker(newUGC);
                    ugcCounter++;
                }
            },
            createMarker : function(data){
            // create variable with path to geo data
            var geo = new google.maps.LatLng(data.latitude, data.longitude)
                console.log('data');
                console.log(data);
                var cMarker = new RichMarker({
                    position: geo,
                    map: googleMap,
                    content: '<div class="ugc-content" id="item' + ugcCounter + '"></div>'
                });

              cMarker.setMap(googleMap); // Set RichMarker with UGC
            }

        };

        opopMaps.addons = {
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

                heatmap = new google.maps.visualization.HeatmapLayer({
                    data: pointArray
                });

                heatmap.set('radius', (opopMapInfo.radius || opopMaps.defaults.map.radius));
                heatmap.set('gradient', (opopMapInfo.gradient || opopMaps.defaults.map.gradient));

                opopMaps.addons.toggleHeat(); // Toggles heatmap and ugc thumbnails
            },
            toggleHeat : function(){
                google.maps.event.addListener(googleMap, 'zoom_changed', function() {
                    var current = googleMap.getZoom();

                    if (current < opopMapInfo.zoom){
                        $('.ugc-content').hide();
                        heatmap.setMap(googleMap);
                    } else {
                        $('.ugc-content').show();
                        heatmap.setMap(null);
                    }

                }); // Returns zoom level of map when changed
            }
        };

        opopMaps.defaults = {
            map : {
                gradient : [
                        'rgba(0, 255, 255, 0)',
                        'rgba(0, 255, 255, 1)',
                        'rgba(0, 63, 255, 1)',
                        'rgba(0, 0, 255, 1)',
                        'rgba(0, 0, 127, 1)',
                        'rgba(63, 0, 91, 1)',
                        'rgba(191, 0, 31, 1)',
                        'rgba(255, 0, 0, 1)'
                    ]
                ,radius : 20
            }
        }

        opopMaps.mapManager.init(opopMapInfo);

        return {
            configureMap : opopMaps.mapManager.configureMap
            // configureMap is returned to global scope so gmaps callback will fire
        }

})();
