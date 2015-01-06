/*
 * Map Visualization widget for Content API
 * Vendor libs : jQuery 1.11.0, google maps visual, rich-marker
 *      - Stores no conflict version of jQuery to $0pop
 *
 * Setting default values for:
 * Map - Zoom (13)
 * Heat - Color (blue-purple), radius (20)
 * Globals to fix: currentItem
 * To do: Consolidate build objects into one..
 *
 * Change filesDir to beta for beta folder, remove console.logs
 consolidate _.temps? .html in .html for activate units, images, etc...
 */
opopVisual = window.opopVisual || {};

opopVisual.sdk = (function(){
    /* General Vars */
    var opopGlobal = {}
        ,bodyHead = document.querySelector('head') || document.querySelector('body');

    var $0pop;                                  // Local jQuery
    var _0pop;                                  // Local Underscore

    var loadingImg      = 'loading-0pop'        // Map Var
    var gutterSizer     = 'gutter-sizer-0pop'   // Grid Vars
        ,gridItem       = '.grid-item-0pop'     // Grid Vars

    var _ModalHTML                              // Modal Vars - Underscore template - pulled in through ajax
        ,fadeBg0pop     = 'fade-bg-0pop'
        ,$0popFadeBG                            // $0pop('#fade-bg-0pop')
        ,tmplCache      = {};

    var filesDir = 'https://s3.amazonaws.com/assets.offerpop.com/add_ons/visualizationSdk_v2/';
    var ugcStorage = {
            "standard" : {
                dependencies : {
                    "jQuery" : {
                        url : "https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js", // CDN
                    },
                    "_"  : {
                        url : filesDir + "libs/underscore.1.7.0.min.js",
                    }
                }
            },
            "map"         : {
                dependencies : {
                    "google.maps" : {
                        url : "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=visualization&callback=opopVisual.sdk.loaded",
                    },
                    "RichMarker" : {
                        url : filesDir + "libs/rich-marker.js",
                    }
                },
                widgets : []
            },
            "carousel"   : {
                dependencies : {
                    "owlCarousel" : {
                        url : filesDir + "libs/owlCarousel.js",
                    }
                },
                widgets : []
            },
            "grid"       : {
                dependencies : {
                    "masonry"  : {
                        url : filesDir + "libs/masonry.js",
                    },
                    "imagesLoaded" : {
                        url : filesDir + "libs/imagesLoaded.js",
                    }
                },
                widgets : []
            }
    };

        opopGlobal.general = {
                _loadDependencies : function(){
                    if (!document.getElementById(fadeBg0pop)){
                        var fadeBg      = document.createElement('div')
                            ,body       = document.querySelector('body');

                            fadeBg.id   = fadeBg0pop;
                            body.appendChild(fadeBg);

                            opopGlobal.prepLib._parseLib('standard', '_');
                            opopGlobal.prepLib._parseLib('standard', 'jQuery');
                            opopGlobal.prepLib._loadCSS('visualization-styles');
                    }
                },
                _prepareWidgets : function(){
                    opopGlobal.modal._pinModalEvents();
                        for (var i in widgets0pop){ // Check which widgets to build
                            var widgetType = widgets0pop[i].type;
                            var newWidget = $0pop.extend(
                                                    {},
                                                    opopGlobal.defaults[widgetType],
                                                    opopGlobal.defaults.api,
                                                    widgets0pop[i]
                            )
                            ugcStorage[widgetType].widgets.push(newWidget);
                            ugcStorage[widgetType].enabled = true;
                        }

                        for (var i in ugcStorage){
                            if (ugcStorage[i].enabled){ // If user has provided info about type of widget
                                for (var x in ugcStorage[i].dependencies){ // Check all dependencies for each widget
                                    if(x !== 'RichMarker'){
                                        opopGlobal.prepLib._parseLib(i, x) // Load dependencies necessary
                                    }
                                }
                            }
                        }
                },
                _loadTemp : function(temp, data){ // Load in _.temp for owl carousel itemster
                    _ModalHTML = render(temp, data);

                    function render(tmplName, tmplData) {
                        if (!tmplCache[tmplName]){
                            var tmplUrl = filesDir + temp + '-temp-0pop.html'
                                ,tmplHtml;

                            $0pop.ajax({
                                url: tmplUrl,
                                method: 'GET',
                                async: false,
                                success: function(data){
                                    tmplHtml = data;
                                }
                            });

                            tmplCache[tmplName] = _0pop.template(tmplHtml);
                        }

                        return tmplCache[tmplName](tmplData);
                    };
                    return _ModalHTML;
                },
        };

        opopGlobal.prepLib = {
            _parseLib : function(type, vendor){
                var prepLib     = opopGlobal.prepLib
                    ,detector   = (vendor === '_') ? prepLib._noConflict : prepLib._handleLoad;

                    detector(type, vendor);
            },
            _noConflict : function(type, vendor){
                    if (window[vendor] === undefined) {
                        opopGlobal.prepLib._handleLoad(type, vendor);
                    } else {
                        _0pop = window._; // Assign global underscore to _0pop
                    }

                return;
            },
            _handleLoad : function(type, vendor){
                var assets = ugcStorage[type].dependencies[vendor]
                    assets.elem = document.createElement('script');
                    assets.elem.src = assets.url;

                if (assets.elem.readyState) { // For old versions of IE
                    assets.elem.onreadystatechange = function () {
                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                            if (vendor != 'google.maps'){
                                assets.loaded = true;
                                opopGlobal.prepLib._loadSteps(type, vendor);
                            }
                        }
                    };
                } else { // Other browsers
                    if (vendor != 'google.maps'){
                        assets.elem.onload = function(){
                            assets.loaded = true;
                            opopGlobal.prepLib._loadSteps(type, vendor);
                        }
                    }
                }

                (bodyHead).appendChild(assets.elem);
            },
            _loadSteps : function(type, vendor){ // Refactor!!
                var dependencies    = ugcStorage[type].dependencies
                    ,loaded         = [];

                    storeLocalVars(); // Store jQuery and Underscore

                    for (var i in dependencies){
                        loaded.push(dependencies[i].loaded);
                    }

                    if (loaded.indexOf(undefined) === -1){ // If necessary dependencies are loaded
                        if (type === 'standard' && !ugcStorage['standard'].ran){
                            ugcStorage['standard'].ran = true;
                            opopGlobal.general._prepareWidgets();
                        } else {
                            prepareCarousel();

                            for (var i in ugcStorage[type].widgets){
                                var self        = ugcStorage[type].widgets[i]
                                    ,pinEvents  = '_' + type + 'Events';

                                    prepareMap();

                                self.ugc    = {};
                                self.index  = parseInt(i);
                                opopGlobal.modal[pinEvents](self);
                                opopGlobal.capi._pullFeed(self, 1);
                            }
                        }
                    }

                    function storeLocalVars(){
                        if (vendor === '_'){
                            _0pop = _.noConflict();
                        } else if (vendor === 'jQuery'){
                            $0pop = window.jQuery.noConflict(true);
                        }
                    }

                    function prepareCarousel(){
                        if (type === 'carousel'){
                            opopGlobal.prepLib._loadCSS('owlCarousel');
                            owlCarouselPrivate($0pop, window, document);
                        }
                    }

                    function prepareMap(){
                        if (type === 'map'){
                            opopGlobal['mapManager']._build(self);
                        }
                    }
            },
            loadRichMarker : function(){
                    ugcStorage['map'].dependencies['google.maps'].loaded = true;
                    opopGlobal.prepLib._parseLib('map', 'RichMarker');
            },
            _loadCSS : function(vendor){
                var link        = document.createElement('link');
                    link.rel    = 'stylesheet';
                    link.href   = filesDir + 'css/' + vendor + '.css';
                    bodyHead.appendChild(link);
            }
        };

        opopGlobal.capi = {
                _pullFeed: function(self, page) {
                    opopGlobal.capi._xhr(self, page)
                        .done(function(data) {
                            var ugcItems = data['_embedded']['ugc:item'];

                                opopGlobal.capi._storeUGC(self, ugcItems);
                                opopGlobal.capi._nextPage(self, data);

                                if (self.type === 'map'){
                                    handleMap(self, data);
                                } else {
                                    opopGlobal[self.type + 'Manager']._build(self);
                                    console.log('ugcStorage', ugcStorage);
                                }
                        });

                        function handleMap(self, data){
                                if (self.nextPage){
                                    opopGlobal.capi._pullFeed(self, self.nextPage);
                                } else {
                                    opopGlobal.mapManager._completeMap(self);
                                }
                        }
                },
                _nextPage : function(self, data){
                        if (data['_links'].next.href) {
                            var nextUrl     = data['_links'].next.href
                                ,pageIndex  = nextUrl.indexOf('&page=')
                            self.nextPage   = nextUrl.slice(pageIndex + 6, nextUrl.length);
                        } else {
                            self.nextPage   = null;
                            console.log('end of pagination');
                        }
                },
                _storeUGC: function(self, data) {
                    var widgetType = self.type
                        for (var i in data) {
                            if (!isNaN(i)) {
                                var content = data[i].content,
                                    platform_data = content.platform_data

                                if (checkData(widgetType, platform_data)){
                                    self.ugcCounter++;
                                    opopGlobal.capi._ugcData(self, content, platform_data, data[i]);
                                }
                            }
                        }

                        function checkData(type, platform_data){
                            if (type === 'map'){
                                return platform_data && platform_data['geo_data'] && platform_data['geo_data']['coordinates'];
                            } else {
                                return platform_data
                            }
                        }
                },
                _xhr : function(widget, page){
                        return $0pop.ajax({
                                    type        : 'GET',
                                    dataType    : 'json',
                                    url         :   widget.baseUrl +
                                                    widget.campaignId +
                                                    '/?access_token='   + widget.access_token +
                                                    '&page='            + page + // passed in as a parameter
                                                    '&approval_status=' + widget.approval_status +
                                                    '&page_size='       + widget.page_size +
                                                    '&social_platform=' + widget.social_platform +
                                                    '&order='           + widget.order +
                                                    '&media_type='      + widget.media_type +
                                                    '&activate_unit_id='+ widget.activate_unit_id
                        });
                },
                _ugcData : function(self, content, platform_data, data){
                        var network     = content.social_platform;
                        var newUGC      = {
                                            author          : content.author.username
                                            ,avatar         : content.author.profile.avatar
                                            ,caption        : content.text
                                            ,network        : network
                                            ,timestamp      : new Date(content.created_on).toDateString()
                                            ,platform_link  : platform_data.social_platform_original_url
                                            ,ugcCounter     : self.ugcCounter
                                        }

                        // If ugc has images
                        if (content['media'] && content['media']['media_urls']){
                            var images              = content.media.media_urls
                                newUGC.small_image  = images.small_image
                                newUGC.medium_image = images.medium_image
                                newUGC.large_image  = images.large_image
                        }

                        // If twitter, store the tweet #
                        if (network === 'twitter'){
                                newUGC.platform_ref = content.platform_ref;
                        }

                        // If there are activate units
                        if (data['click_units'][0]){
                                newUGC.clickEnabled     = true;
                                newUGC.click_units      = data['click_units'];
                        } else {
                                newUGC.clickEnabled     = false;
                        }

                        // If ugc is for a map (store geo data)
                        if (self.type === 'map'){
                            var geo_data                = platform_data.geo_data
                                // Twitter desktop stores location as Polygon; Store first polygon value
                                if (geo_data.coordinates['0']){
                                    newUGC.latitude     = geo_data.coordinates['0'].latitude;
                                    newUGC.longitude    = geo_data.coordinates['0'].longitude;
                                } else {
                                    newUGC.latitude     = geo_data.coordinates.latitude
                                    newUGC.longitude    = geo_data.coordinates.longitude
                                }

                            if (self.features.indexOf('pin') != -1 || self.features.indexOf('thumb') != -1){
                                    opopGlobal.mapManager._createMarker(self, newUGC);
                            }
                            if (self.features.indexOf('heat') != -1){
                                    self.google.heatData.push(new google.maps.LatLng(newUGC.latitude, newUGC.longitude));
                            }
                        }

                        self.ugc['item' + self.ugcCounter] = newUGC; // Store obj in global repo
                }
        };

        opopGlobal.modal = {
            _carouselEvents : function(current){
                    current.$carousel = $0pop(current.selector);
                    current.$carousel.data('index', current.index);

                current.$carousel.on('click', '.lazyOwl', function(){
                    opopGlobal.modal._fetchTemp(current.$carousel, this.id, 'carousel');
                });
            },
            _mapEvents : function(current){
                var ugcPins = '.ugc-content-0pop';

                    current.$map = $0pop(current.selector);
                    current.$map.data('index', current.index);

                current.$map.on('click', ugcPins, function(){
                    opopGlobal.modal._fetchTemp(current.$map, this.id, 'map');
                });

                /* BRING THUMBNAIL TO TOP */
                current.$map.on({
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
            },
            _gridEvents : function(current){
                    current.$grid = $0pop(current.selector);
                    current.$grid.data('index', current.index);

                current.$grid.on('click', gridItem, function(){
                    opopGlobal.modal._fetchTemp(current.$grid, this.id, 'grid');
                });

            },
            _pinModalEvents : function(){ // Refactor this section
                    $0popFadeBG     = $0pop('#' + fadeBg0pop) // Declared in global

                    $0popFadeBG.on('click', '.modal-pagination-0pop div', function(){
                        var modal       = $0pop(this).closest('#modal-0pop')
                            ,current    = modal.data('item')
                            ,widgetType = modal.data('widget')
                            ,index      = modal.data('index')
                            ,self       = ugcStorage[widgetType].widgets[index];

                            if (this.className.indexOf('prev') !== -1){
                                current = (current <= 1) ? self.ugcCounter - 1 : current - 1;
                            } else if (this.className.indexOf('next') !== -1){
                                current = (current >= self.ugcCounter) ? 1 : current + 1;
                            }

                            opopGlobal.modal._fetchTemp(self['$' + widgetType], 'item' + current, widgetType);
                    });

                    $0popFadeBG.on('click', '.modal-close-0pop', function(){
                        var modal           = $0popFadeBG.find('#modal-0pop')
                            ,currentWidget  = modal.data('widget')
                            ,index          = modal.data('index');

                            $0popFadeBG.fadeOut();
                            $0pop('body').css('overflow', 'auto');

                            if (currentWidget === 'carousel'){
                                var self = ugcStorage.carousel.widgets[index]
                                    // If carousel modal is closed, reactivate autoplay
                                    self.$carousel.trigger('owl.play', self.autoPlay);
                            }
                    }); // Close Modal
            },
            _fetchTemp : function(parent, current, widget){
                console.log(parent);
                    var parentIndex             = parent.data('index')
                        ,self                   = ugcStorage[widget].widgets[parentIndex]
                        ,currentId              = current;

                        opopVisual.currentItem             = self.ugc[currentId];
                        opopVisual.currentItem.widgetType  = widget;
                        opopVisual.currentItem.index       = self.index;

                    var template                = opopGlobal.general._loadTemp('modal', opopVisual.currentItem);
                        // console.log('template', widget, currentItem, template);
                        opopGlobal.modal._populateModal(template);
            },
            _populateModal : function(generated){
                    $0popFadeBG
                        .empty()            // Empty current modal
                        .append(generated)  // Append New Content
                        .fadeIn();          // Reveal Modal

                    $0pop('body').css('overflow', 'hidden'); // Prevent double scroll

                if (opopVisual.hooks && typeof opopVisual.hooks.afterModalLoad === 'function'){
                    opopVisual.hooks.afterModalLoad(); // Run hook if exists
                }
            }
        };

        opopGlobal.mapManager = {
            _build : function(self){
                self.google = {
                    heatData    : [],
                    googleMap   : null,
                    heatMap     : null
                };
                var loadingAnimation    = $0pop('<img/>', {id: loadingImg, src: filesDir + 'images/offerpop_loading.png'})
                    ,mapOptions         = {
                                            zoom        : self.zoom // Set zoom level of map
                                            ,center     : new google.maps.LatLng(self.center.lat, self.center.long)
                                            ,minZoom    : 2
                                            ,maxZoom    : self.maxZoom
                                            ,styles     : self.styles
                                        }
                    // googleMap is a global variable inside opopVisual
                    self.google.googleMap = new google.maps.Map(document.querySelector(self.selector), mapOptions);

                    loadingAnimation.appendTo(self.selector); // TESTING
            },
            _createMarker : function(self, data){
                    var geo = new google.maps.LatLng(data.latitude, data.longitude)
                    if (self.features.indexOf('thumb') !== -1 && data.small_image){
                        var pin = data.small_image;
                    } else {
                        var pin = self.pin;
                    }

                    var cMarker = new RichMarker({
                        position: geo,
                        map: self.google.googleMap,
                        content: '<div class="ugc-content-0pop" id="item' + data.ugcCounter + '" style="background-image:url(' + pin + ');"></div>'
                    });
                    // console.log('googlemap', googleMap);
                cMarker.setMap(self.google.googleMap); // Set RichMarker with UGC
            },
            _completeMap : function(self){
                    if (self.features.indexOf('heat') !== -1){
                        opopGlobal.mapManager.addons._heatMap(self);
                    }
                    if (self.ugc['item1'] && !self.custom) {
                        var first   = self.ugc['item1']
                            ,coord  = new google.maps.LatLng(first.latitude, first.longitude);

                        self.google.googleMap.panTo(coord);
                    }

                    $0pop('#' + loadingImg).hide();
            }

        };

        opopGlobal.mapManager.addons = {
            /*
             * Map Add-ons. These features will be optional.
             * Coordinates stored into heatData []
             */
            _heatMap : function(self){
                var pointArray = new google.maps.MVCArray(self.google.heatData);

                    self.google.heatMap = new google.maps.visualization.HeatmapLayer({
                        data: pointArray
                    });

                    self.google.heatMap.set('radius', self.heat.radius);
                    self.google.heatMap.set('gradient', self.heat.gradient);

                    $0pop('#' + loadingImg).hide();

                if (self.features.indexOf('pin') !== -1 && self.toggleZoom){
                    opopGlobal.mapManager.addons._toggleHeat(self); // Toggles heatmap and ugc thumbnails
                } else{
                    self.google.heatMap.setMap(self.google.googleMap);
                }
            },
            _toggleHeat : function(self){
                google.maps.event.addListener(self.google.googleMap, 'zoom_changed', function() {
                    var current     = self.google.googleMap.getZoom()
                        ,$0popUGC   = self.$map.find('.ugc-content-0pop');
                        console.log(current, self.toggleZoom);

                        if (current < self.toggleZoom){
                            $0popUGC.hide();
                            self.google.heatMap.setMap(self.google.googleMap);
                        } else {
                            $0popUGC.show();
                            self.google.heatMap.setMap(null);
                        }
                }); // Returns zoom level of map when changed
            }
        };

        opopGlobal.carouselManager = {
            _build : function(self){
                // var carouselAmt    = $0pop(self.selector + '.res-carousel-0pop').length
                    // ,increment      = Math.floor(self.ugcCounter / carouselAmt) // 50
                    // ,start          = 1
                    // ,end            = increment;
                    // console.log(carouselAmt, increment, start, end);

                    // for (var i = 1; i <= carouselAmt; i++){
                        // for (var j = start; j < end; j++){
                    for (var i = 1; i <= self.ugcCounter; i++){
                            opopVisual.currentItem      = self.ugc['item' + i];
                            var template                = opopGlobal.general._loadTemp('carousel', opopVisual.currentItem);
                                self.$carousel.append(template);
                        // }
                        // start   += increment;
                        // end     += increment + 1;
                    }
                    // console.log(start);

                    self.$carousel.owlCarousel({
                        items               : self.items,
                        itemsDesktop        : self.itemsDesktop,
                        itemsDesktopSmall   : self.itemsDesktopSmall,
                        itemsTablet         : self.itemsTablet,
                        itemsMobile         : self.itemsMobile,
                        lazyLoad            : self.lazyLoad,
                        navigation          : self.navigation,
                        autoPlay            : self.autoPlay,
                        rewindNav           : self.rewindNav,
                        responsive          : self.responsive,
                        singleItem          : self.singleItem,
                        afterUpdate         : opopGlobal.carouselManager._setHeight(self)
                    });

                    opopGlobal.carouselManager._setHeight(self);

                    // if (opopGlobal.defaults.carousel.border && opopGlobal.defaults.carousel.singleItem){
                    //     opopGlobal.carouselManager._addBorder();
                    // }
            },
            // _addBorder : function(){
            //         var borderImg       = document.createElement('img');
            //             borderImg.id    = 'carousel-border-0pop';
            //             borderImg.src   = opopGlobal.defaults.carousel.border;

            //             $0pop('.res-carousel-0pop').prepend(borderImg);
            // },
            _setHeight : function(self){
                var width = self.$carousel.find('.lazyOwl').css('width');
                    self.$carousel.find('.lazyOwl').css('height', width);
            }
        };

        opopGlobal.gridManager = {
            _build : function(self){
                    self.$grid.append('<div class="' + gutterSizer + '"></div>');
                    self.gridContainer      = document.querySelector(self.selector);

                    opopGlobal.gridManager._addItems(self);
                    self.msnry              = new Masonry( self.gridContainer, {
                                                columnWidth        : 0,
                                                gutter             : '.' + gutterSizer, // Referenced at top
                                                itemSelector       : gridItem
                    });
                    console.log('ugcStorage', ugcStorage);
                        // layout Masonry and setinterval after all images have loaded
                    opopGlobal.gridManager._imagesLoaded(self);
            },
            _addItems : function(self){
                    if (self.transition === 'scroll'){
                        opopGlobal.gridManager._appendTemplates(self, 1, self.ugcCounter);
                    } else {
                        self.area           = self.rows * self.columns;
                        self.nextGridItem   = self.area + 1

                        opopGlobal.gridManager._appendTemplates(self, 1, self.area);
                    }

            },
            _appendTemplates : function(self, start, end){
                var getGutterPx         = $0pop('.' + gutterSizer).width()
                        ,getContainerPx     = self.$grid.width()
                        ,gutters            = self.columns - 1
                        ,gutterSpace        = Math.round((getGutterPx * 100)/getContainerPx) // Calculate the gutterspace in %
                        ,gutterTotal        = gutters * gutterSpace // gutter-sizer is 1% by default
                        ,tileWidth          = (100 - gutterTotal) / self.columns;

                    for (var i = start; i <= end; i++){
                        if (self.ugc['item' + i]){
                            opopVisual.currentItem      = self.ugc['item' + i];
                            var template                = opopGlobal.general._loadTemp('grid', opopVisual.currentItem)
                                ,inner                  = opopGlobal.general._loadTemp('grid-inner', opopVisual.currentItem)
                                ,compiled               = $0pop(template).append(inner);

                            $0pop(compiled).appendTo(self.$grid);
                        }
                    }

                    self.$grid.find(gridItem).css('width', tileWidth + '%');
            },
            _imagesLoaded : function(self){
                    imagesLoaded( self.gridContainer, function() {
                        self.msnry.layout();

                        if (self.transition == 'scroll'){
                            opopGlobal.gridManager.addons['_scroll'](self);
                        } else {
                            setInterval(function(){
                                opopGlobal.gridManager.addons['_' + self.transition](self)
                            }, self.speed);
                        }
                    });
            }
        };

        opopGlobal.gridManager.addons = {
                _random : function(self){
                    // console.log(self.nextGridItem, self.ugcCounter)
                    var randomSpot      = selectRandom(self.area)
                        ,randomElement  = self.$grid.find('.grid-item-0pop')[randomSpot]

                    self.nextGridItem   = (self.nextGridItem >= self.ugcCounter) ? 1 : self.nextGridItem;

                        function selectRandom(rowCol){
                            return Math.floor(Math.random() * rowCol) // If accessing .grid-item-0pop then dont need +1
                        }

                        opopVisual.currentItem      = self.ugc['item' + self.nextGridItem];
                        var inner                   = opopGlobal.general._loadTemp('grid-inner', opopVisual.currentItem);

                    $0pop(randomElement)
                            .fadeOut()
                            .html(inner)
                            .attr('id', 'item' + self.nextGridItem);

                    imagesLoaded(randomElement, function(){
                        $0pop(randomElement).fadeIn();
                    });

                    self.nextGridItem++ // item# > ugcStorage.grid.ugcCounter ? nextGridItem = 1
                },
                _all : function(self){ // Swap all images on interval
                    $0pop('.grid-item-0pop img').attr('src', self.ugc['item' + self.nextGridItem].medium_image);

                    self.nextGridItem++
                },
                _scroll : function(self){
                    self.$grid.scroll(function(){
                        var scrollHeight    = document.querySelector(self.selector).scrollHeight
                            ,innerHeight    = self.$grid.innerHeight()
                            ,scrollTop      = self.$grid.scrollTop()
                            ,totalHeight    = scrollTop + innerHeight;

                        if (totalHeight >= scrollHeight - 200 && self.nextPage && !self.xhrLoading){
                            self.xhrLoading = true;
                            pullNewFeed();
                        }
                    });

                    function pullNewFeed(){
                        opopGlobal.capi._xhr(self, self.nextPage)
                            .done(function(data) {
                                var ugcItems = data['_embedded']['ugc:item']
                                    ,start   = self.ugcCounter + 1;
                                    self.xhrLoading = false;

                                    opopGlobal.capi._storeUGC(self, ugcItems);
                                    opopGlobal.gridManager._appendTemplates(self, start, self.ugcCounter);
                                    opopGlobal.capi._nextPage(self, data);

                                    imagesLoaded( self.gridContainer, function() {
                                        self.msnry.reloadItems();
                                        self.msnry.layout();
                                    });
                            });
                    }
                }
        };

        opopGlobal.defaults = {
            api : {
                baseUrl            : 'https://api.offerpop.com/v1/ugc/collections/',
                campaignId         : null,      // Client must add
                access_token       : null,      // Client must add
                page_size          : 100,
                approval_status    : 'app',
                social_platform    : 'twitter,instagram',
                media_type         : 'image',
                order              : 'date_desc',
                activate_unit_id   : '',
                ugcCounter         : 0,
            },
            map : {
                styles      : null,
                pin         : filesDir + 'images/opop_map_pin.png',
                zoom        : 13,
                maxZoom     : 15,
                toggleZoom  : 0,
                features    : 'pin,heat',
                center : {
                    custom  : false,
                    lat     : 40.7508095,
                    long    : -73.9887535
                },
                heat : {
                    radius      : 25,
                    gradient    :   [
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
            },
            carousel : {
                items               : 5,
                itemsDesktop        : [1199, 5],
                itemsDesktopSmall   : [979, 3],
                itemsTablet         : [768, 3],
                itemsMobile         : [479, 1],
                lazyLoad            : true,
                navigation          : true,
                autoPlay            : 4000,
                rewindNav           : true,
                responsive          : true,
                singleItem          : false,
                border              : false,
            },
            grid : {
                rows                : 3,
                columns             : 5,
                transition          : 'random',
                speed               : 3000,
            }

        };

        window.addEventListener ?
        window.addEventListener("load", opopGlobal.general._loadDependencies, false):
        window.attachEvent && window.attachEvent("onload", opopGlobal.general._loadDependencies);

        return {
                loaded      : opopGlobal.prepLib.loadRichMarker,
                // _loadRichMarker is returned to global scope so gmaps callback will fire
        }

})();
