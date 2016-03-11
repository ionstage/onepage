(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var PublishDialog = helper.inherits(function(props) {
    PublishDialog.super_.call(this);

    this.title = this.prop('');
    this.url = this.prop('');
    this.visible = this.prop(false);
    this.element = this.prop(props.element);

    // select all text in the url-text when clicked
    dom.on(this.urlTextElement(), 'click', function(event) {
      dom.selectAll(dom.currentTarget(event));
    });

    this.closer = props.closer;

    var onclose = PublishDialog.prototype.onclose.bind(this);

    dom.on(this.element(), dom.eventType('start'), onclose);
    dom.on(this.closeButtonElement(), 'click', onclose);
  }, Component);

  PublishDialog.prototype.urlTextElement = function() {
    return dom.child(this.element(), 0, 0, 0, 0, 0);
  };

  PublishDialog.prototype.openLinkElement = function() {
    return dom.child(this.element(), 0, 0, 1, 0, 0);
  };

  PublishDialog.prototype.emailLinkElement = function() {
    return dom.child(this.element(), 0, 0, 1, 1, 0);
  };

  PublishDialog.prototype.twitterLinkElement = function() {
    return dom.child(this.element(), 0, 0, 1, 2, 0);
  };

  PublishDialog.prototype.facebookLinkElement = function() {
    return dom.child(this.element(), 0, 0, 1, 3, 0);
  };

  PublishDialog.prototype.closeButtonElement = function() {
    return dom.child(this.element(), 0, 1);
  };

  PublishDialog.prototype.redraw = function() {
    if (this.visible()) {
      var title = this.title();
      var url = this.url();

      var encodedTitle = encodeURIComponent(title);
      var encodedURL = encodeURIComponent(url);

      dom.value(this.urlTextElement(), url);
      dom.href(this.openLinkElement(), url);
      dom.href(this.emailLinkElement(), 'mailto:?subject=' + encodedTitle + '&body=%0A%0A' + encodedURL);
      dom.href(this.twitterLinkElement(), 'https://twitter.com/share?text=' + encodedTitle + '&url=' + encodedURL);
      dom.href(this.facebookLinkElement(), 'https://www.facebook.com/sharer/sharer.php?u=' + encodedURL);

      dom.addClass(dom.body(), 'unscrollable');
      dom.on(dom.doc(), 'touchmove', dom.cancel);
      dom.removeClass(this.element(), 'hide');

      // don't select text without touch in mobile devices
      if (!dom.supportsTouch())
        dom.selectAll(this.urlTextElement());
    } else {
      dom.removeClass(dom.body(), 'unscrollable');
      dom.off(dom.doc(), 'touchmove', dom.cancel);
      dom.addClass(this.element(), 'hide');
    }
  };

  PublishDialog.prototype.onclose = function(event) {
    // accept event of the element that the event handler has been attached
    if (dom.target(event) !== dom.currentTarget(event))
      return;

    if (dom.type(event) === 'touchstart')
      dom.cancel(event);

    this.closer();
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishDialog;
  else
    app.PublishDialog = PublishDialog;
})(this.app || (this.app = {}));