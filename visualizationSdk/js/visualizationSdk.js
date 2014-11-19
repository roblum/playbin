/*
 * Map Visualization widget for Content API
 * Vendor libs : jQuery 1.11.0, google maps visual, rich-marker
 *      - Stores no conflict version of jQuery to $0pop
 *
 * Setting default values for:
 * Map - Zoom (13)
 * Heat - Color (blue-purple), radius (20)
 */
var $0pop;

var opopVisual = (function(){
    /* General Vars */
    var opopGlobal = {}
        ,mapManager = {}
        ,owlCarousel = {}
        ,bodyHead = document.querySelector('head') || document.querySelector('body');

    /* Local Library Vars */
    var _0pop; // private underscore

    /* UGC Vars */
    var ugcStorage = {
            map         : {
                ugcCounter : 1
            },
            carousel    : {
                ugcCounter : 1
            }
    };

    /* Map Vars */
    var googleMap
        ,heatData = []
        ,heatmap;

    /* Carousel Vars */
    var $0popCarousel;

    /* Modal Vars */
    var _ModalHTML // Underscore template - pulled in through ajax
        ,$0popCanvas // $0pop('#map-canvas-0pop')
        ,$0popFadeBG // $0pop('#fade-bg-0pop')
        ,ugcPins // '.ugc-content-0pop';
        ,tmpl_cache = {};

    var visualizationLib = 'https://s3.amazonaws.com/assets.offerpop.com/add_ons/visualizationSdk/';
    var vendorLibs = {
        'jQuery' : {
            version : '1.11.0' // jquery version
            ,source : 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'
        },
        '_' : {
            version : '1.7.0'
            ,source : visualizationLib + 'libs/underscore.1.7.0.min.js'
        },
        'google.maps' : {
            source : 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=visualization&callback=opopVisual.configureMap'
        },
        'RichMarker' : {
            source : visualizationLib + 'libs/rich-marker.js'
        },
        'owlCarousel' : {
            source : visualizationLib + 'libs/owlCarousel.js'
            ,css : visualizationLib + 'libs/owlCarousel.css'
        },
        'modalTemplate' : {
            source : visualizationLib + 'modal-temp-0pop.html'
        },
        'carouselTemplate' : {
            source : visualizationLib + 'carousel-temp-0pop.html'
        },
        'visualization-styles' : {
            css : visualizationLib  + 'css/styles.css'
        }
    };

        opopGlobal.general = {
                loadDependencies : function(){
                        opopGlobal.prepLib._parseLib('jQuery');
                        opopGlobal.prepLib._parseLib('_');
                        opopGlobal.prepLib._loadCSS('visualization-styles');
                },
                buildWidget : function(widgets){
                    // console.log(updated[0]);
                    if (widgets[0]) widgets[0]();
                    updated = widgets.slice(1, widgets.length);

                        console.log(updated);
                },
                _load_Temp : function(temp, data){ // Load in _.temp for owl carousel items
                    console.log('data', data);
                    _ModalHTML = render(temp + '-temp-0pop', data);

                    function render(tmpl_name, tmpl_data) {
                        if (!tmpl_cache[tmpl_name]){
                            var tmpl_url = vendorLibs[temp + 'Template'].source
                                ,tmpl_html;

                            $0pop.ajax({
                                url: tmpl_url,
                                method: 'GET',
                                async: false,
                                success: function(data){
                                    tmpl_html = data;
                                    // console.log(data);
                                }
                            });

                            tmpl_cache[tmpl_name] = _0pop.template(tmpl_html);
                        }

                        return tmpl_cache[tmpl_name](tmpl_data);
                    };
                    // console.log(_ModalHTML);
                    return _ModalHTML;
                },
                _pullFeed : function(widget, page){
                    var baseURL             = 'https://api.offerpop.com/v1/ugc/collections/' // API Endpoint
                        ,campaign           = widget.campaignId
                        ,access_token       = widget.access_token
                        ,page_size          = widget.page_size || 100
                        ,approval_status    = widget.approval || 'app'
                        ,social_platform    = widget.platform || 'twitter%2Cinstagram'
                        ,media_type         = widget.media_type || 'video%2Cimage'
                        ,order              = widget.order || 'date_asc'
                        ,next               = false;

                            console.log(widget);
                        var widgetType = widget.type;
                        console.log(widgetType);

                        var ajax = $0pop.getJSON(
                                    baseURL +
                                    campaign +
                                    '/?access_token='   + access_token +
                                    '&page='            + page + // passed in as a parameter
                                    '&approval_status=' + approval_status +
                                    '&page_size='       + page_size +
                                    '&social_platform=' + social_platform +
                                    '&order='           + order +
                                    '&media_type='      + media_type

                        ,{ get_param: 'value' }, function(data) {
                        console.log(data);

                        var ugcItems = data['_embedded']['ugc:item'];

                        switch(widgetType){
                            case 'map':
                                mapManager._storeUGC(ugcItems);
                                opopGlobal.modal._pinModalEvents();

                                if (data['_links'].next.href) {
                                    var nextUrl     = data['_links'].next.href
                                        ,pageIndex  = nextUrl.indexOf('&page=')
                                        ,nextPage   = nextUrl.slice(pageIndex + 6, nextUrl.length);

                                        console.log(nextPage);
                                        opopGlobal.general._pullFeed(opopMapInfo, nextPage);

                                }

                                if (ugcStorage.map['item1']){
                                    var first = ugcStorage.map['item1']
                                        ,coord = new google.maps.LatLng(first.latitude, first.longitude);

                                        googleMap.panTo(coord);
                                }
                            break;

                            case 'carousel':
                                owlCarousel._storeUGC(ugcItems);
                                opopGlobal.modal._pinModalEvents();
                            break;

                        }

                    });


                    ajax.complete(function(){
                          /*
                           * On complete, enable heat if client enabled in opopMapInfo
                           * Default value is false
                           *
                           */
                            if (widgetType === 'map'){
                                var heatEnabled = (opopMapInfo.heat || opopGlobal.defaults.heat.enabled)
                                if (heatEnabled) mapManager.addons._heatMap();
                            }
                            console.log(ugcStorage);

                            opopGlobal.general.buildWidget(updated)
                            return;
                    });

                },
        };

        opopGlobal.prepLib = {
            /*
             * Prepare libraries on client page
             * 1. opopMap.mapManager.init runs jQuery through first - (jQuery.noconflict || global jQuery)
             * 2. Load google maps visualization library; has callback function (opopMap.mapManager.configureMap);
             * 3. Creates map and loads RichMarker library
             * 4. After RichMarker library is loaded; pullFeed()
             *
             */
            _parseLib : function(vendor){
                var prepLib = opopGlobal.prepLib
                    ,detector = (vendor === 'jQuery' || vendor === '_') ? prepLib._noConflict : prepLib._handleLoad;

                    detector(vendor);
            },
            _noConflict : function(vendor){
                switch(vendor){
                    case 'jQuery':
                        if ($0pop){
                            return;
                        } else if (window[vendor] === undefined || window.jQuery.fn.jquery !== vendorLibs['jQuery'].version) {
                            console.log('handleload');
                            opopGlobal.prepLib._handleLoad(vendor);
                        } else {
                            $0pop = window.jQuery; // Assign global jQuery to $0pop
                        }
                    break;

                    case '_':
                        if (_0pop){
                            return;
                        } else if (window[vendor] === undefined) {
                            console.log('handleload');
                            opopGlobal.prepLib._handleLoad(vendor);
                        } else {
                            _0pop = window._; // Assign global underscore to _0pop
                        }
                    break;
                }

                return;
            },
            _handleLoad : function(vendor){
                vendorLibs[vendor].elem = document.createElement('script');
                vendorLibs[vendor].elem.src = vendorLibs[vendor].source;

                if (vendorLibs[vendor].elem.readyState) { // For old versions of IE
                    vendorLibs[vendor].elem.onreadystatechange = function () {
                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                            if (vendor != 'google.maps'){
                                opopGlobal.prepLib._loadSteps(vendor);
                            }
                        }
                    };
                } else { // Other browsers
                    if (vendor != 'google.maps'){
                        vendorLibs[vendor].elem.onload = function(){
                            opopGlobal.prepLib._loadSteps(vendor);
                        }
                    }
                }

                (bodyHead).appendChild(vendorLibs[vendor].elem);
            },
            _loadSteps : function(vendor){
                switch(vendor){
                    case 'jQuery':
                        $0pop = window.jQuery.noConflict(true);
                        console.log($0pop.fn.jquery);
                    break;

                    case '_':
                        _0pop = _.noConflict();
                        console.log('_.noconf:', _0pop.VERSION);
                        opopGlobal.general.buildWidget(opopVisualWidgets);
                    break;

                    case 'RichMarker':
                        opopGlobal.general._pullFeed(opopMapInfo, 1);
                    break;

                    case 'owlCarousel':
                        opopGlobal.general._pullFeed(opopCarouselInfo, 1);
                    break;
                }

                return;
            },
            _loadCSS : function(vendor){
                var link = document.createElement('link');

                link.rel = 'stylesheet';
                link.href = vendorLibs[vendor].css;
                bodyHead.appendChild(link);
            }
        };

        opopGlobal.modal = {
            _pinModalEvents : function(){ // Refactor this section
                $0popCanvas     = $0pop('#map-canvas-0pop') // Declared in global
                $0popFadeBG     = $0pop('#fade-bg-0pop') // Declared in global
                $0popCarousel   = $0pop('#carousel-0pop');
                ugcPins         = '.ugc-content-0pop'; // Declared in global

                    /* BRING THUMBNAIL TO TOP */
                    $0popCanvas.on({
                        mouseenter : function(){
                            $0pop(this).css({
                                'position' : 'relative'
                                ,'z-index' : '99999'
                            });
                        },
                        mouseleave : function(){
                            $0pop(this).css({
                                'z-index' : '1'
                            });
                        }
                    }, ugcPins); // Bring thumbnail to front if mouseover

                    $0popCanvas.on('click', ugcPins, function(){
                        var current = this.id;

                        currentItem = ugcStorage.map[current];
                        var template = opopGlobal.general._load_Temp('modal', currentItem);

                        opopGlobal.modal._populateModal(template);
                    }); // Returns id of UGC content container when clicked

                    $0popCarousel.on('click', '.lazyOwl', function(){
                        var current = this.id;

                        currentItem = ugcStorage.carousel[current];
                        var template = opopGlobal.general._load_Temp('modal', currentItem);

                        opopGlobal.modal._populateModal(template);
                    });

                    /*********************************************************************/
                    /* Will eventually need to move this when implementing other widgets */
                    $0popFadeBG.on('click', '.modal-close-0pop', function(){
                        $0pop('#fade-bg-0pop').fadeOut();
                        $0pop('body').css('overflow', 'auto');

                        $0popCarousel.trigger('owl.play', 2000); // Need to revise... figure a more dynamic solution
                    }); // Close Modal
            },
            _populateModal : function(generated){
                $0popFadeBG.empty();
                $0popFadeBG.append(generated);

                $0pop('body').css('overflow', 'hidden');
                $0popFadeBG.fadeIn(); // Reveal Modal
            }
        };

        mapManager = {
            init : function(){
                // opopGlobal.prepLib._parseLib('jQuery');
                //     opopGlobal.prepLib._parseLib('_');
                opopGlobal.prepLib._parseLib('google.maps');
            },
            configureMap : function(){
                var mapOptions = {
                    zoom : (opopMapInfo.zoom || opopGlobal.defaults.map.zoom) // Set zoom level of map
                    ,center : new google.maps.LatLng(opopMapInfo.lat || opopGlobal.defaults.map.center.lat, opopMapInfo.long || opopGlobal.defaults.map.center.long)
                    // Set center of map
                    ,minZoom : 2
                }

                googleMap = new google.maps.Map(document.getElementById('map-canvas-0pop'), mapOptions);
                opopGlobal.prepLib._parseLib('RichMarker');
            },
            _storeUGC : function(data){
                for (var i in data){
                    // console.log(data[i])
                    var content         = data[i].content
                        ,platform_data  = content.platform_data

                        if (platform_data && content['media'] && platform_data['geo_data'] && platform_data['geo_data']['coordinates']){
                            var geo_data        = platform_data.geo_data
                                ,images         = content.media.media_urls
                                ,network        = content.social_platform;

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
                            ugcStorage.map['item' + ugcStorage.map.ugcCounter] = newUGC; // Store obj in global repo
                            // Store geo data in heatMap array
                            heatData.push(new google.maps.LatLng(newUGC.latitude, newUGC.longitude));

                            // Create marker with data
                            mapManager._createMarker(newUGC);
                            ugcStorage.map.ugcCounter++;
                        }
                }
            },
            _createMarker : function(data){
                    // create variable with path to geo data
                    var geo = new google.maps.LatLng(data.latitude, data.longitude)

                    var cMarker = new RichMarker({
                        position: geo,
                        map: googleMap,
                        content: '<div class="ugc-content-0pop" id="item' + ugcStorage.map.ugcCounter + '"></div>'
                    });

                cMarker.setMap(googleMap); // Set RichMarker with UGC
            }

        };

        mapManager.addons = {
            /*
             * Map Add-ons. These features will be optional.
             * Heatmap will be a configuration option.
             * If marked as true, the below functions will run.
             * As we pull UGC from Content API, we will store coords into heatData []
             *
             * Possible add-ons: Customize heat colors/radius
             */
            _heatMap : function(){
                var pointArray = new google.maps.MVCArray(heatData);

                heatmap = new google.maps.visualization.HeatmapLayer({
                    data: pointArray
                });

                heatmap.set('radius', (opopMapInfo.radius || opopGlobal.defaults.heat.radius));
                heatmap.set('gradient', (opopMapInfo.gradient || opopGlobal.defaults.heat.gradient));

                mapManager.addons._toggleHeat(); // Toggles heatmap and ugc thumbnails
            },
            _toggleHeat : function(){
                google.maps.event.addListener(googleMap, 'zoom_changed', function() {
                    var current = googleMap.getZoom()
                        ,$0popUGC = $0pop('.ugc-content-0pop');

                        if (current < (opopMapInfo.zoom || opopGlobal.defaults.map.zoom)){
                            $0popUGC.hide();
                            heatmap.setMap(googleMap);
                        } else {
                            $0popUGC.show();
                            heatmap.setMap(null);
                        }

                }); // Returns zoom level of map when changed
            }
        };

        opopGlobal.defaults = { // Will add carousel defaults here later
            map : {
                zoom : 13
                ,center: {
                    lat: 40.7508095,
                    long: -73.9887535
                }
            },
            heat : {
                enabled : false
                ,radius : 20
                ,gradient : [
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)'
                ]
            }
        };

        owlCarousel = {
            init : function(){
                // opopGlobal.prepLib._parseLib('jQuery');
                //     opopGlobal.prepLib._parseLib('_');
                opopGlobal.prepLib._parseLib('owlCarousel');
                opopGlobal.prepLib._loadCSS('owlCarousel');
            },
            _storeUGC : function(data){
                for (var i in data){
                    // console.log(data[i])
                    var content         = data[i].content
                        ,platform_data  = content.platform_data

                        if (platform_data && content['media'] && content['media']['media_urls']){
                            var images          = content.media.media_urls
                                ,network        = content.social_platform;

                            // Store necessary UGC data into geoStore object
                            var newUGC = {
                                        author          : content.author.username
                                        ,avatar         : content.author.profile.avatar
                                        ,caption        : content.text
                                        ,large_image    : images.large_image
                                        ,network        : network
                                        ,timestamp      : new Date(content.created_on).toDateString()
                                        ,platform_link  : platform_data.social_platform_original_url
                                        ,ugcCounter     : ugcStorage.carousel.ugcCounter
                            }

                            // If twitter, store the tweet #
                            if (network === 'twitter') newUGC.platform_ref = content.platform_ref;

                            // Store geo data in global array
                            ugcStorage.carousel['item' + ugcStorage.carousel.ugcCounter] = newUGC; // Store obj in global repo

                            currentItem = ugcStorage.carousel['item' + ugcStorage.carousel.ugcCounter];
                            var template = opopGlobal.general._load_Temp('carousel', currentItem);

                            $0pop(template).appendTo($0popCarousel);

                        }
                        ugcStorage.carousel.ugcCounter++;
                }

                // Create marker with data
                owlCarousel._buildCarousel();
                owlCarousel.setHeight();
            },
            _buildCarousel : function(){
                // console.log(opopCarouselInfo.styles.items);
                $0popCarousel.owlCarousel({
                    // items               : opopCarouselInfo.styles.items || 5,
                    // itemsDesktop        : [1199, ( opopCarouselInfo.styles.items || 5 )],
                    // itemsDesktopSmall   : [979, ( opopCarouselInfo.styles.itemsDesktopSm || 3 )],
                    // itemsTablet         : [768, ( opopCarouselInfo.styles.itemsTablet || 3 )],
                    // itemsMobile         : [479, ( opopCarouselInfo.styles.itemsMobile || 1 )],
                    lazyLoad            : opopCarouselInfo.lazy || true,
                    navigation          : opopCarouselInfo.navigation || true,
                    autoPlay            : true,
                    rewindNav           : true,
                    responsive          : true,
                    afterUpdate         : owlCarousel.setHeight

                });
            },
            setHeight : function(){
                var width = $0pop('.lazyOwl').css('width');
                    $0pop('.lazyOwl').css('height', width);
            }
        };

        opopGlobal.general.loadDependencies();

        return {
                configureMap    : mapManager.configureMap,
                build           : opopGlobal.general.buildWidget,
                initMap         : mapManager.init,
                initOwl         : owlCarousel.init
            // configureMap is returned to global scope so gmaps callback will fire
        }

})();
