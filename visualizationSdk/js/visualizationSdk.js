/*
 * Map Visualization widget for Content API
 * Vendor libs : jQuery 1.11.0, google maps visual, rich-marker
 *      - Stores no conflict version of jQuery to $0pop
 *
 * Setting default values for:
 * Map - Zoom (13)
 * Heat - Color (blue-purple), radius (20)
 */
var $0pop; // Public so we can pass to owlCarousel

var opopVisual = (function(){
    /* General Vars */
    var opopGlobal = {}
        ,bodyHead = document.querySelector('head') || document.querySelector('body');

    /* Local Library Vars */
    var _0pop;          // private underscore

    /* UGC Vars */
    var ugcStorage = {
        map : {ugcCounter : 1}
        ,carousel : {ugcCounter : 1}
    };

    /* Map Vars */
    var googleMap
        ,heatData = []
        ,heatmap;

    /* Carousel Vars */
    var $0popCarousel;

    /* Modal Vars */
    var _ModalHTML      // Underscore template - pulled in through ajax
        ,$0popCanvas    // $0pop('#map-canvas-0pop')
        ,$0popFadeBG    // $0pop('#fade-bg-0pop')
        ,ugcPins        // '.ugc-content-0pop';
        ,tmpl_cache = {};

    /* Default-User Settings */
    var nowidget = {};
    var userMap         = (widgets0pop.opopMapInfo) ? widgets0pop.opopMapInfo : nowidget
        ,userCarousel   = (widgets0pop.opopCarouselInfo) ? widgets0pop.opopCarouselInfo : nowidget
        ,opopVisualWidgets = []; // Widgets to build


    var filesDir = 'https://s3.amazonaws.com/assets.offerpop.com/add_ons/visualizationSdk/';
    var vendorLibs = {
        'jQuery' : {
            version : '1.11.0' // jquery version
            ,source : 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js' // CDN
        },
        '_' : {
            version : '1.7.0'
            ,source : filesDir + 'libs/underscore.1.7.0.min.js'
        },
        'google.maps' : { // This runs a call back after load (configureMap); Gmaps doesnt allow dynamic insertion
            source : 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=visualization&callback=opopVisual.configureMap'
        },
        'RichMarker' : {
            source : filesDir + 'libs/rich-marker.js'
        },
        'owlCarousel' : {
            source : filesDir + 'libs/owlCarousel.js'
            ,css : filesDir + 'libs/owlCarousel.css'
        },
        'modalTemplate' : {
            source : filesDir + 'modal-temp-0pop.html'
        },
        'carouselTemplate' : {
            source : filesDir + 'carousel-temp-0pop.html'
        },
        'visualization-styles' : {
            css : filesDir  + 'css/styles.css'
        }
    };

        opopGlobal.general = {
                _loadDependencies : function(){
                        opopGlobal.prepLib._parseLib('_');
                        opopGlobal.prepLib._parseLib('jQuery');
                        opopGlobal.prepLib._loadCSS('visualization-styles');

                        for (var i in widgets0pop){ // Check which widgets to build
                            opopVisualWidgets.push(widgets0pop[i].type);
                        }
                },
                _buildWidget : function(widgets){ // Called after jQuery is done loading
                        if (widgets[0]) opopGlobal[widgets[0]]._init();
                        opopVisualWidgets = widgets.slice(1, widgets.length);
                },
                _load_Temp : function(temp, data){ // Load in _.temp for owl carousel itemster
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
                            case 'mapManager':
                                opopGlobal.mapManager._storeUGC(ugcItems);
                                opopGlobal.modal._pinModalEvents();

                                if (data['_links'].next.href) {
                                    var nextUrl     = data['_links'].next.href
                                        ,pageIndex  = nextUrl.indexOf('&page=')
                                        ,nextPage   = nextUrl.slice(pageIndex + 6, nextUrl.length);

                                        console.log(nextPage);
                                        opopGlobal.general._pullFeed(userMap, nextPage);

                                }

                                if (ugcStorage.map['item1']){
                                    var first = ugcStorage.map['item1']
                                        ,coord = new google.maps.LatLng(first.latitude, first.longitude);

                                        googleMap.panTo(coord);
                                }
                            break;

                            case 'carouselManager':
                                opopGlobal.modal._pinModalEvents();
                                opopGlobal.carouselManager._storeUGC(ugcItems);
                            break;

                        }

                    });


                    ajax.complete(function(){
                          /*
                           * On complete, enable heat if client enabled in opopMapInfo
                           * Default value is false
                           *
                           */
                            if (widgetType === 'mapManager'){
                                if (opopGlobal.defaults.heat.enabled) opopGlobal.mapManager.addons._heatMap();
                            }
                            console.log(ugcStorage);

                            opopGlobal.general._buildWidget(opopVisualWidgets)
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
                    ,detector = (vendor === '_') ? prepLib._noConflict : prepLib._handleLoad;

                    detector(vendor);
            },
            _noConflict : function(vendor){
                    if (window[vendor] === undefined) {
                        console.log('handleload');
                        opopGlobal.prepLib._handleLoad(vendor);
                    } else {
                        _0pop = window._; // Assign global underscore to _0pop
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
                    case '_':
                        _0pop = _.noConflict();
                        console.log('_.noconf:', _0pop.VERSION);
                    break;

                    case 'jQuery':
                        $0pop = window.jQuery.noConflict(true);
                        console.log($0pop.fn.jquery);

                        opopGlobal.general._buildWidget(opopVisualWidgets); // This starts the widget building
                    break;

                    case 'RichMarker':
                        opopGlobal.general._pullFeed(userMap, 1);
                    break;

                    case 'owlCarousel':
                        opopGlobal.general._pullFeed(userCarousel, 1);
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
                $0popCarousel   = $0pop('.res-carousel-0pop');
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

        opopGlobal.mapManager = {
            _init : function(){
                opopGlobal.prepLib._parseLib('google.maps');
            },
            configureMap : function(){
                var mapOptions = {
                    zoom : opopGlobal.defaults.map.zoom // Set zoom level of map
                    ,center : new google.maps.LatLng(opopGlobal.defaults.map.center.lat, opopGlobal.defaults.map.center.long)
                    ,minZoom : 2
                }

                googleMap = new google.maps.Map(document.getElementById('map-canvas-0pop'), mapOptions);
                opopGlobal.prepLib._parseLib('RichMarker');
            },
            _storeUGC : function(data){ // Refactor !!! ?!? waiting for geo enabled in CAPI
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
                            opopGlobal.mapManager._createMarker(newUGC);
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

        opopGlobal.mapManager.addons = {
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

                heatmap.set('radius', opopGlobal.defaults.heat.radius);
                heatmap.set('gradient', opopGlobal.defaults.heat.gradient);

                opopGlobal.mapManager.addons._toggleHeat(); // Toggles heatmap and ugc thumbnails
            },
            _toggleHeat : function(){
                google.maps.event.addListener(googleMap, 'zoom_changed', function() {
                    var current = googleMap.getZoom()
                        ,$0popUGC = $0pop('.ugc-content-0pop');

                        if (current < opopGlobal.defaults.map.zoom){
                            $0popUGC.hide();
                            heatmap.setMap(googleMap);
                        } else {
                            $0popUGC.show();
                            heatmap.setMap(null);
                        }

                }); // Returns zoom level of map when changed
            }
        };

        opopGlobal.carouselManager = {
            _init : function(){
                opopGlobal.prepLib._parseLib('owlCarousel');
                opopGlobal.prepLib._loadCSS('owlCarousel');
            },
            _storeUGC : function(data){ // Refactor !!! ?!? waiting for geo enabled in CAPI
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
                opopGlobal.carouselManager._buildCarousel();

            },
            _buildCarousel : function(){
                // console.log(opopCarouselInfo.styles.items);
                var defaults = opopGlobal.defaults.carousel;

                    $0popCarousel.owlCarousel({
                        items               : defaults.items,
                        itemsDesktop        : defaults.itemsDesktop,
                        itemsDesktopSmall   : defaults.itemsDesktopSmall,
                        itemsTablet         : defaults.itemsTablet,
                        itemsMobile         : defaults.itemsMobile,
                        lazyLoad            : defaults.lazyLoad,
                        navigation          : defaults.navigation,
                        autoPlay            : defaults.autoPlay,
                        rewindNav           : defaults.rewindNav,
                        responsive          : defaults.responsive,
                        afterUpdate         : opopGlobal.carouselManager.setHeight
                    });

                    opopGlobal.carouselManager.setHeight();
            },
            setHeight : function(){
                var width = $0pop('.lazyOwl').css('width');
                    $0pop('.lazyOwl').css('height', width);
            }
        };

        opopGlobal.defaults = { // Will add carousel defaults here later
            map : {
                zoom        : userMap.zoom || 13,
                center : {
                    lat     : userMap.lat || 40.7508095,
                    long    : userMap.long || -73.9887535
                }
            },
            heat : {
                enabled     : userMap.heat || false,
                radius      : userMap.radius || 20,
                gradient    : userMap.gradient ||
                                [
                                    'rgba(0, 255, 255, 0)',
                                    'rgba(0, 255, 255, 1)',
                                    'rgba(0, 63, 255, 1)',
                                    'rgba(0, 0, 255, 1)',
                                    'rgba(0, 0, 127, 1)',
                                    'rgba(63, 0, 91, 1)',
                                    'rgba(191, 0, 31, 1)',
                                    'rgba(255, 0, 0, 1)'
                                ]
            },
            carousel : {
                items               : userCarousel.items || 5,
                itemsDesktop        : [1199, ( userCarousel.items || 5 )],
                itemsDesktopSmall   : [979, ( userCarousel.itemsDesktopSm || 3 )],
                itemsTablet         : [768, ( userCarousel.itemsTablet || 3 )],
                itemsMobile         : [479, ( userCarousel.itemsMobile || 1 )],
                lazyLoad            : userCarousel.lazy || true,
                navigation          : userCarousel.navigation || true,
                autoPlay            : userCarousel.autoPlay || true,
                rewindNav           : userCarousel.rewindNav || true,
                responsive          : userCarousel.responsive || true,
            }

        };

        opopGlobal.general._loadDependencies(); // Load dependencies jQuery and _; then build widgets

        return {
                configureMap    : opopGlobal.mapManager.configureMap
                // configureMap is returned to global scope so gmaps callback will fire
        }

})();
