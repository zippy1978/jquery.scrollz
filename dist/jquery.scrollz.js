/*! jQuery Scrollz - v1.0.1 - 2012-08-18
* https://github.com/zippy1978/jquery.scrollz
* Copyright (c) 2012 Gilles Grousset; Licensed MIT, GPL */

(function($) {
  
  // Methods definition
  var methods = {
    
    /* Initialization */
    init : function(options) { 
      
      // Default options
      var settings = $.extend( {
        'pull' : false, // Pull support
        'pullHeaderHTML' : {
          'initial' : '<div><div class="icon"/><div class="label">Pull to refresh</div></div>', // Pull header on initial state
          'release' : '<div><div class="icon"/><div class="label">Release to refresh</div></div>', // Pull header on release state
          'waiting' : '<div><div class="icon"/><div class="label">Refreshing...</div></div>' // Pull header waiting state
        },
        'inertia' : true, // Inertia support
        'emulateTouchEvents' : false // Emulate touch events when device is not a touch device
      }, options);
      
      // Define easeOutCubic easing function (if not defined yet)
      if ($.easing.easeOutCubic === undefined) {
        $.easing.easeOutCubic = function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        };
      }
      
      // Define scrollstart and scrollstop special events (if not defined yet)
      // As explained here: http://james.padolsey.com/javascript/special-scroll-events-for-jquery
      if (!$.event.special.scrollstart && !$.event.special.scrollend) {
        
        var special = $.event.special,
        uid1 = 'D' + (+new Date()),
        uid2 = 'D' + (+new Date() + 1);
 
        special.scrollstart = {
            setup: function() {
     
              var timer,
                handler =  function(evt) {
 
                  var _self = this,
                      _args = arguments;

                  if (timer) {
                      clearTimeout(timer);
                  } else {
                      evt.type = 'scrollstart';
                      $.event.handle.apply(_self, _args);
                  }

                  timer = setTimeout(function(){
                      timer = null;
                  }, special.scrollstop.latency);
 
                };
   
              $(this).bind('scroll', handler).data(uid1, handler);
     
            },
            teardown: function(){
                $(this).unbind('scroll', $(this).data(uid1));
            }
        };
 
        special.scrollstop = {
            latency: 300,
            setup: function() {
     
              var timer,
                    handler = function(evt) {
 
                    var _self = this,
                        _args = arguments;
 
                    if (timer) {
                        clearTimeout(timer);
                    }
 
                    timer = setTimeout(function(){
 
                        timer = null;
                        evt.type = 'scrollstop';
                        $.event.handle.apply(_self, _args);
 
                    }, special.scrollstop.latency);
   
                  };
   
              $(this).bind('scroll', handler).data(uid2, handler);
     
            },
            teardown: function() {
                $(this).unbind('scroll', $(this).data(uid2));
            }
        };
      }
  
      return this.each(function() {        
  
        var $this = $(this);
           
           // If the plugin hasn't been initialized yet
           if (!$this.data('scrollz')) {
            
             // Store options
             $this.data('options', settings);
           
             // Create markup
             _createMarkup($this);
             
             var container = _getMarkupCache($this, 'container');
             
             // Store container initial position
             _putTrackingData($this, 'initialScrollPosition', container.scrollTop());
             
             // Add touch start listener
             container.bind(_getTouchEventName($this, 'touchstart'), function(event) {
              // Handle
              _handleTouchStartEvent(event, $this);
            });
             
            // Add touch move listener
            container.bind(_getTouchEventName($this, 'touchmove'), function(event) {
              // Prevent default behaviour
              event.preventDefault(); 
              // Handle
              _handleTouchMoveEvent(event, $this);
            });
            
            // Add touch end listener
            container.bind(_getTouchEventName($this, 'touchend'), function(event) {
              // Prevent default behaviour
              event.preventDefault();   
              // Handle
              _handleTouchEndEvent(event, $this);
            });
            
            // Add touch end listener when outside container (in case the last touch is outside the container)
            $('*').not(container).bind(_getTouchEventName($this, 'touchend'), function(event) {
              // Handle
              _handleTouchEndEvent(event, $this);
            });
            
            // Add mousewheel listener
            container.bind('mousewheel DOMMouseScroll', function(event) {
              // Prevent default behaviour
              event.preventDefault();
              // Handle
              _handleMouseWheelEvent(event, $this);
            });
  
            // Add scroll listener
            container.scroll(function(event) {
              // Handle
              _handleScrollEvent(event, $this);
            });
            
            // Add scroll start listener
            container.bind('scrollstart', function(event) {
              // Handle
              _handleScrollStartEvent(event, $this);
            });
            
            // Add scroll stop listener
            container.bind('scrollstop', function(event) {
              // Handle
              _handleScrollStopEvent(event, $this);
            });
             
            // Mark plugin as initialized
            $this.data('scrollz', true);
  
           }
  
        });
        
      },
      
    /* Sets container height */
    height: function(height) {
      
      return this.each(function() {        

        var $this = $(this);
        
        // If plugin initialized
        if ($this.data('scrollz')) {
        
          var settings = $this.data('options');
          var container = _getMarkupCache($this, 'container');
          
          container.height(height);
          $this.css('min-height', container.css('height'));
        }
        
      });
    },
    
    /* Hides pull header */
    hidePullHeader: function() {
      
      return this.each(function() {        

        var $this = $(this);
        
        // If plugin initialized
        if ($this.data('scrollz')) {
        
          var settings = $this.data('options');
          var container = _getMarkupCache($this, 'container');
        
          if (settings.pull) {
            container.animate({scrollTop: _getPullHeaderHeight($this)}, 'fast', function() {
              _changePullHeaderState($this, 'initial');
            });
          }
        }
        
      });
    }
  };
  
  // Private functions
  
  /* Tests if current device is a touch device. */
  function _isTouchDevice() {
    return ('ontouchstart' in document.documentElement);
  }
  
  /* Get pull header height. */
  function _getPullHeaderHeight(instance) {
    
    var contentWrapper = _getMarkupCache(instance, 'contentWrapper');
    var pullHeader = _getMarkupCache(instance, 'pullHeader');
    if (pullHeader) {
      return pullHeader.outerHeight(true);
    } else {
      return 0;
    }
    
  }
  
  /* Converts a touch event name into a supported event name (in case the device is not touch compliant). */
  function _getTouchEventName(instance, eventName) {
    
    var settings = instance.data('options');
    
    if (!_isTouchDevice() && settings.emulateTouchEvents) {
      switch (eventName) {
        case 'touchstart' : return 'mousedown';
        case 'touchend' : return 'mouseup';
        case 'touchmove' : return 'mousemove';
      }
    }
    
    return eventName;
    
  }
  
  /* Puts (set or replace) an item into the markup cache of the instance .*/
  function _putMarkupCache(instance, key, value) {
    
    var markup = instance.data('markup');
    
    // Create cache if not found
    if (!markup)  {
      markup  ={};
      instance.data('markup', markup);
    }
    
    // Store
    markup[key] = value;
  }
  
  /* Retieves an item from the markup cache. */
  function _getMarkupCache(instance, key) {
    
    var markup = instance.data('markup');
    if (markup) {
      return markup[key];
    } else {
      return null;
    }
  }
  
  /* Puts (set or replace) an item into tracking data. */
  function _putTrackingData(instance, key, value) {
    
    var tracking = instance.data('tracking');
    
    // Create array if not found
    if (!tracking)  {
      tracking = {};
      instance.data('tracking', tracking);
    }

    // Store
    tracking[key] = value;
  }
  
  /* Retieves an item from tracking data. */
  function _getTrackingData(instance, key) {
    
    var tracking = instance.data('tracking');
    if (tracking) {
      return tracking[key];
    } else {
      return null;
    }
  }
  
  /* Resets tracking data. */
  function _resetTouchTrackingData(instance) {
    
    _putTrackingData(instance, 'startTouchTime', null);
    _putTrackingData(instance, 'startTouchY', null);
    _putTrackingData(instance, 'previousTouchTime', null);
    _putTrackingData(instance, 'previousTouchY', null);
    _putTrackingData(instance, 'lastTouchTime', null);
    _putTrackingData(instance, 'lastTouchY', null);

  }
  
  /* Makes element unselectable. */
  function _makeUnselectable(element) {
    
    element.attr('unselectable', 'on')
      .css({
          '-moz-user-select':'none',
          '-webkit-user-select':'none',
          'user-select':'none',
          '-ms-user-select':'none'
      })
      .each(function() {
          this.onselectstart = function() { return false; };
      });
      
  }
  
  /* Fixes scrollTop value for container. */
  function _fixContainerScrollTopBounds(instance, scrollTopValue) {
    
    var settings = instance.data('options');
    
    var pullHeaderHeight = _getPullHeaderHeight(instance);
    
    if (settings.pull && (scrollTopValue < pullHeaderHeight)) {
      return pullHeaderHeight;
    } else {
      return scrollTopValue;
    }
  }
  
  /* Creates plugin markup */
  function _createMarkup(instance) {
    
    var settings = instance.data('options');
    
    // Calculate initial heigth
    var initialHeight = instance.height();
    
    // Create content wrapper
    var contentWrapper = $('<div class="scrollz-content-wrapper"/>');
    
    // Create container
    var container = $('<div class="scrollz-container"/>');
    container.css('height', initialHeight);
    container.css('overflow-x', 'hidden');
    container.css('overflow-y', 'hidden');
    if (settings.styleClass) {
       container.addClass(settings.styleClass);
    }
    
    // Wrap container arround content wrapper
    instance.wrap(container).wrap(contentWrapper);
    instance.css('overflow-y', 'visible');
    
    // Update references
    contentWrapper = instance.parent();
    container = contentWrapper.parent();
    
    // Create scroll thumb (and hide it)
    var scrollThumb = $('<div class="scrollz-thumb"></div>');
    scrollThumb.css('position', 'absolute');
    container.prepend(scrollThumb);
    scrollThumb = container.find('.scrollz-thumb');
    scrollThumb.hide();

    // Remove height from content
    instance.css('height', 'auto');
    instance.css('min-height', initialHeight);
    
    // Store generated markup refrerences into object data
    _putMarkupCache(instance, 'contentWrapper', contentWrapper);
    _putMarkupCache(instance, 'container', container);
    _putMarkupCache(instance, 'scrollThumb', scrollThumb);
    
    // Pull support setup
    if (settings.pull) {
     
     // Create pull header
     var pullHeader = $(settings.pullHeaderHTML.initial);
     pullHeader.addClass('scrollz-pull-header').addClass('initial');
       
     // Add pull header
     contentWrapper.prepend(pullHeader);
     
     // Store pull header in markup cache
     _putMarkupCache(instance, 'pullHeader', contentWrapper.children('.scrollz-pull-header'));
     
     // Container height must be at least as high as the pull header
     var pullHeaderHeight = _getPullHeaderHeight(instance);
     if (initialHeight < pullHeaderHeight) {
      container.css('height', pullHeaderHeight);
      instance.css('min-height', pullHeaderHeight);
     }
     // Move container to hide header
     container.scrollTop(pullHeaderHeight);
     
     // Make container unselectable
     _makeUnselectable(container);

    }
  }
  
  /* Change pull header state. */ 
  function _changePullHeaderState(instance, state) {
    
    var settings = instance.data('options');
    var contentWrapper = _getMarkupCache(instance, 'contentWrapper');
    var pullHeader = contentWrapper.children('.scrollz-pull-header');
    
    if (!pullHeader.hasClass(state)) {
      pullHeader.replaceWith($(settings.pullHeaderHTML[state]).addClass('scrollz-pull-header').addClass(state));
    }
    
    // Update pull header in stored markup
    _putMarkupCache(instance, 'pullHeader', contentWrapper.children('.scrollz-pull-header'));
    
    // Store current state
    instance.data('pullHeaderState', state);

  }
  
  /* Returns pull header state */
  function _getPullHeaderState(instance) {
    
    var state = instance.data('pullHeaderState');
    if (!state) {
      // If unknown : take 'initial' as default
      state = 'initial';
    }
    
    return state;
  }
  
  /* Handles pull header */
  function _handlePullHeader(instance) {
    
    var settings = instance.data('options');
    var container = _getMarkupCache(instance, 'container');
    var pullHeaderHeight = _getPullHeaderHeight(instance);
        
    if (settings.pull && (container.scrollTop() < pullHeaderHeight) && (_getPullHeaderState(instance) !== 'waiting')) {
        
        // Handle pull to refresh (half of the header height)
        if (container.scrollTop() < (pullHeaderHeight / 2)) {
          
          // Trigger event
          _changePullHeaderState(instance, 'waiting');
          instance.trigger('pulled');
          
        } else {
          // Animate scroll : move back to initial position
          container.animate({scrollTop: pullHeaderHeight}, 'fast');
        }
        
    }
  }
  
  /* Handles inertia. */
  function _handleInertia(instance) {
    
    var settings = instance.data('options');
    var container = _getMarkupCache(instance, 'container');
    
    // Compute speed and distance
    var previousTouchY = _getTrackingData(instance, 'previousTouchY');
    var lastTouchY = _getTrackingData(instance, 'lastTouchY');
    var previousTouchTime = _getTrackingData(instance, 'previousTouchTime');
    var duration = new Date() - previousTouchTime;
    var distance = previousTouchY - lastTouchY;
    var acceleration = Math.abs(distance / duration);
    
    if (settings.inertia) {
      var offset = Math.pow(acceleration, 2) * 750;
      if (distance < 0) {
        offset *= -1;
      }
  
      container.stop(true, true);
      container.animate({scrollTop: _fixContainerScrollTopBounds(instance, container.scrollTop() + offset)}, {duration: acceleration * 750, easing : 'easeOutCubic'});
    }
  }
  
  /* Handles touchstart event. */
  function _handleTouchStartEvent(event, instance) {
    
    if (_getPullHeaderState(instance) !== 'waiting') {
  
      var settings = instance.data('options');
      var container = _getMarkupCache(instance, 'container');
      
      // Stop animation (if any)
      container.stop();
      
      // Capture initial contact point
      if (_isTouchDevice()) {
        _putTrackingData(instance, 'startTouchY', event.originalEvent.targetTouches[0].screenY);
      } else {
        _putTrackingData(instance, 'startTouchY', event.screenY);
      }
      
      _putTrackingData(instance, 'startTouchTime', new Date());
      _putTrackingData(instance, 'previousTouchY', _getTrackingData(instance, 'startTouchY'));
      _putTrackingData(instance, 'previousTouchTime', _getTrackingData(instance, 'startTouchTime'));
      _putTrackingData(instance, 'lastTouchY', _getTrackingData(instance, 'startTouchY'));
      _putTrackingData(instance, 'lastTouchTime', _getTrackingData(instance, 'startTouchTime'));
      _putTrackingData(instance, 'initialScrollPosition', container.scrollTop());

   }
  }
  
  /* Handles touchmove event. */
  function _handleTouchMoveEvent(event, instance) {
    
    var container = _getMarkupCache(instance, 'container');
    
    var startTouchY = _getTrackingData(instance, 'startTouchY');
    var lastTouchY = _getTrackingData(instance, 'lastTouchY');
    var lastTouchTime = _getTrackingData(instance, 'lastTouchTime');
    var initialScrollPosition = _getTrackingData(instance, 'initialScrollPosition');
    
    if (startTouchY) {
      
      // Store last touch as previous touch
      _putTrackingData(instance, 'previousTouchY', lastTouchY);
      _putTrackingData(instance, 'previousTouchTime', lastTouchTime);
      
      // Compute move and store last touch
      var moveTo = 0;
      if (_isTouchDevice()) {
        moveTo = (startTouchY - event.originalEvent.changedTouches[0].screenY) + initialScrollPosition;
        _putTrackingData(instance, 'lastTouchY',event.originalEvent.targetTouches[0].screenY);
      } else {
        moveTo = (startTouchY - event.screenY) + initialScrollPosition;
        _putTrackingData(instance, 'lastTouchY', event.screenY);
      }
      _putTrackingData(instance, 'lastTouchTime', new Date());
     
      // Move
      container.scrollTop(moveTo);
    }
  }
  
  /* Handles touchend event. */
  function _handleTouchEndEvent(event, instance) {
  
    var container = _getMarkupCache(instance, 'container');
  
    var startTouchY = _getTrackingData(instance, 'startTouchY');
    var previousTouchY = _getTrackingData(instance, 'previousTouchY');
    var lastTouchY = _getTrackingData(instance, 'lastTouchY');
    var initialScrollPosition = _getTrackingData(instance, 'initialScrollPosition');
    
    if (!startTouchY) {
      // Nothing to do : touch was already processed
      return;
    }
    
    var pullHeaderHeight = _getPullHeaderHeight(instance);
    
    if ((startTouchY < lastTouchY) && (container.scrollTop() < pullHeaderHeight)) {

      _handlePullHeader(instance);
      
    } else {
      
      _handleInertia(instance);
    }
    
    // Reset data
    _resetTouchTrackingData(instance);
    
  }
  
  /* Handles mousewheel event. */
  function _handleMouseWheelEvent(event, instance) {
    
    if (_getPullHeaderState(instance) !== 'waiting') {
      
      var container = _getMarkupCache(instance, 'container');
      
      var initialScrollPosition = _getTrackingData(instance, 'initialScrollPosition');
                  
      // Move
      var offset = 0;
      if (event.type === 'mousewheel') {
        offset = event.originalEvent.screenY - (event.originalEvent.screenY + event.originalEvent.wheelDeltaY);
      } else {
        offset = event.originalEvent.screenY - (event.originalEvent.screenY + (event.originalEvent.detail * -1 * 3));
      }
      
      // Slowdown scroll if reaching the pull header
      if ((container.scrollTop() + offset) < _getPullHeaderHeight(instance)) {
        offset *= 0.05;
      }
      
      container.scrollTop(container.scrollTop() + offset);

    }
  }
  
  /* Handles scroll event. */
  function _handleScrollEvent(event, instance) {
    
    var settings = instance.data('options');
    
    var container = _getMarkupCache(instance, 'container');
    var contentWrapper = _getMarkupCache(instance, 'contentWrapper');
    var scrollThumb = _getMarkupCache(instance, 'scrollThumb');
    
    // Bottom reached
    if ((container.scrollTop() + container.height()) >= container.get(0).scrollHeight) {
      // Trigger event
      instance.trigger('bottomreached');
    }
    
    // Refresh threshold reached (half of the header height)
    if (settings.pull) {
     if (container.scrollTop() < (_getPullHeaderHeight(instance) / 2)) {
       _changePullHeaderState(instance, 'release');
     } else {
       _changePullHeaderState(instance, 'initial');
     }
    }
    
    var pullHeaderHeight = _getPullHeaderHeight(instance);
    if (container.scrollTop() >= pullHeaderHeight) {
     
     // Fix the collapsing maring problem
     var firstContentChild = instance.children().first();
     var lastContentChild = instance.children().last();
     if (firstContentChild && parseInt(firstContentChild.css('marginTop'), 10) >= 0) {
      instance.css('padding-top', '1px');
     }
     if (lastContentChild && parseInt(lastContentChild.css('marginBottom'), 10) >= 0) {
      instance.css('padding-bottom', '1px');
     }
     
     // Resize and move scroll thumb
     scrollThumb.height((container.innerHeight() / contentWrapper.outerHeight(true) * (container.innerHeight() + pullHeaderHeight)) -(scrollThumb.outerHeight(true) - scrollThumb.outerHeight()));
     scrollThumb.css('top', container.position().top + ((container.scrollTop() - pullHeaderHeight) / contentWrapper.outerHeight(true) * container.innerHeight()));
     scrollThumb.css('left', container.position().left + container.width() - scrollThumb.outerWidth(true));
  
    } else {
      // Hide scroll thumb when on pull header
      scrollThumb.hide();
    }
  }
  
  /* Handles scrollstart event. */
  function _handleScrollStartEvent(event, instance) {
    
    var container = _getMarkupCache(instance, 'container');
    var scrollThumb = _getMarkupCache(instance, 'scrollThumb');
    
    // Show scroll thumb only if not on pull header
    if (container.scrollTop() > _getPullHeaderHeight(instance)) {
      scrollThumb.stop(true, true);
      scrollThumb.fadeIn(500);
    }
  }
  
  /* Handles scrollstop event. */
  function _handleScrollStopEvent(event, instance) {
    
    var scrollThumb = _getMarkupCache(instance, 'scrollThumb');
    
    // Hide scroll thumb
    scrollThumb.stop(true, true);
    scrollThumb.delay(300).fadeOut(1000);
    
    // Handle pull header for none touch devices (case of scroll with mouse wheel)
    var startTouchY = _getTrackingData(instance, 'startTouchY');
    if (!_isTouchDevice() && !startTouchY) {
      _handlePullHeader(instance);
    }
    
  }
  
  // Public declaration
  $.fn.scrollz = function(method) {
  
    // Method calling logic
    if (methods[method]) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist');
      return null;
    }  

  };
}(jQuery));
