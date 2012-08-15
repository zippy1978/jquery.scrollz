/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  module('initialization', {
    setup: function() {
      this.content = $('#scrollz');
    }
  });

  test('is chainable', function() {
    strictEqual(this.content.scrollz(), this.content, 'should be chaninable');
  });
  
  test('generates wrapping markup', function() {
    
    this.content.scrollz();
    
    equal(this.content.closest('.scrollz-content-wrapper').length, 1, 'should have generated content wrapper');
    equal(this.content.closest('.scrollz-container').length, 1, 'should have generated container');
    
  });
  
  module('events triggering', {
    setup: function() {
      this.content = $('#scrollz');
      this.content.scrollz();
    }
  });
  
  test('triggers bottomreached event', function() {
    
    stop();
    
    // Bind event
    this.content.bind('bottomreached', function() {
      ok('done', 'should trigger bottomreached event when scrolled to bottom');
    });
    
    // Scroll to bottom
    var container = this.content.closest('.scrollz-container');
    container.scrollTop(this.content.height());
    
    start();
    
  });

}(jQuery));
