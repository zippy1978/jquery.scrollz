# jQuery Scrollz

Modern scrolling for jQuery.

Primarly designed to work on touch devices, the plugin works as well on desktop browsers.
At the moment only vertical scroll is supported.

## Getting Started
Download the [production version][min] or the [development version][max] and the [CSS][css].

[min]: https://raw.github.com/zippy1978/jquery.scrollz/master/dist/jquery.scrollz.min.js
[max]: https://raw.github.com/zippy1978/jquery.scrollz/master/dist/jquery.scrollz.js
[css]: https://raw.github.com/zippy1978/jquery.scrollz/master/dist/jquery.scrollz.css

In your web page:

```html
<link rel="stylesheet" href="jquery.scrollz.css">
<script src="jquery.js"></script>
<script src="jquery.scrollz.min.js"></script>
<script>
jQuery(function($) {
  // #content must have a height set before calling scrollz
  $('#content').scrollz();
});
</script>
```

## Documentation

### Options
Options can be set when calling .scrollz():

```html
<script>
jQuery(function($) {
  $('#content').scrollz({
    styleClass: 'myClass',
    pull: true
  });
});
</script>
```

Available options are:

* styleClass (string): style class to apply on the scrolling area (default: none).
* inertia (boolean): should scrolling area scroll with inertia effect (default: true).
* pull (boolean): should scrolling area support 'pull' feature. In this case, a pull header is added on top of the content. When scrolling area is 'pull' at its top, the header appears (default: false).
* pullHeaderHTML (map): HTML code used to render the pull header for the following states : 'initial', 'release' and 'waiting'. A default HTML rendition is provided for each state.
* emulateTouchEvents (boolean): should the plugin emulate touch events on devices without touch support (default: false).

### Events
The plugin can trigger the following events:

* bottomreached: notifies that the bottom of the scrolling area is reached.
* pulled: notifies that the scrolling area (with pull header) was pulled.

The bottomreached event is usefull to implement 'infinte scroll' feature.

When pull option is enabled, it is necessary to bind the pulled event in order to hide the pull header one the action triggered on pull is finished:

```html
<script>
jQuery(function($) {

  // Enable scrollz
  $('#content').scrollz({
    pull: true
  });
  
  // Bind pulled event
  $('#content').bind('pulled', function() {
  
    // Process pull action here
    
    // Hide pull header when done
    $('#scrollz2').scrollz('hidePullHeader');
  });
});
</script>
```

### Methods
Scrollz provides the following methods:

* height(height) : redefines scrolling area height.
* hidePullHeader : hides the pull header (must be called after processing of the pull action completed).

```html
<script>
jQuery(function($) {

  // Enable scrollz
  $('#content').scrollz();
  
  // Change height
  $('#content').scrollz('hidePullHeader');

  // Hide pull header
  $('#content').scrollz('height', 600);
});
</script>
```

### Styling
The plugin is provided with a default CSS. This CSS includes pull header and scroll thumb styling.

* Styling on the different pull header states (based on the default pullHeaderHTML markup).
* Pull header icons (as base64) : arrow and animated loader, with retina support.
* Pull header arrow animations (up and down).
* Scroll thumb simple styling.

## Examples
* [Examples with markup and script description](http://dl.dropbox.com/u/26978903/scrollz/examples.html).
* [jQuery Mobile](http://dl.dropbox.com/u/26978903/scrollz/mobile.html).

## Release History
Version 1.0.0 (16 August 2012):
* First release.

Version 1.0.1 (18 August 2012):
* Better inertia support.
* Fixed default container height when smaller than pull header.

## License
Copyright (c) 2012 Gilles Grousset  
Licensed under the MIT, GPL licenses.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

### Important notes
Please don't edit files in the `dist` subdirectory as they are generated via grunt. You'll find source code in the `src` subdirectory!

While grunt can run the included unit tests via PhantomJS, this shouldn't be considered a substitute for the real thing. Please be sure to test the `test/*.html` unit test file(s) in _actual_ browsers.

### Installing grunt
_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Test that grunt is installed globally by running `grunt --version` at the command-line.
1. If grunt isn't installed globally, run `npm install -g grunt` to install the latest version. _You may need to run `sudo npm install -g grunt`._
1. From the root directory of this project, run `npm install` to install the project's dependencies.

### Installing PhantomJS

In order for the qunit task to work properly, [PhantomJS](http://www.phantomjs.org/) must be installed and in the system PATH (if you can run "phantomjs" at the command line, this task should work).

Unfortunately, PhantomJS cannot be installed automatically via npm or grunt, so you need to install it yourself. There are a number of ways to install PhantomJS.

* [PhantomJS and Mac OS X](http://ariya.ofilabs.com/2012/02/phantomjs-and-mac-os-x.html)
* [PhantomJS Installation](http://code.google.com/p/phantomjs/wiki/Installation) (PhantomJS wiki)

Note that the `phantomjs` executable needs to be in the system `PATH` for grunt to see it.

* [How to set the path and environment variables in Windows](http://www.computerhope.com/issues/ch000549.htm)
* [Where does $PATH get set in OS X 10.6 Snow Leopard?](http://superuser.com/questions/69130/where-does-path-get-set-in-os-x-10-6-snow-leopard)
* [How do I change the PATH variable in Linux](https://www.google.com/search?q=How+do+I+change+the+PATH+variable+in+Linux)
