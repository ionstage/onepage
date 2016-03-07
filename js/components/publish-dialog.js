(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var PublishDialog = helper.inherits(function(props) {
    PublishDialog.super_.call(this);

    this.visible = this.prop(false);
    this.element = this.prop(props.element);

    this.closer = props.closer;

    var onclose = PublishDialog.prototype.onclose.bind(this);

    dom.on(this.element(), dom.supportsTouch() ? 'touchstart' : 'mousedown', onclose);
    dom.on(this.closeButtonElement(), 'click', onclose);
  }, Component);

  PublishDialog.prototype.closeButtonElement = function() {
    return dom.child(dom.child(this.element(), 0), 1);
  };

  PublishDialog.prototype.redraw = function() {
    if (this.visible())
      dom.removeClass(this.element(), 'hide');
    else
      dom.addClass(this.element(), 'hide');
  };

  PublishDialog.prototype.onclose = function(event) {
    // accept event of the element that the event handler has been attached
    if (dom.target(event) !== dom.currentTarget(event))
      return;

    this.closer();
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishDialog;
  else
    app.PublishDialog = PublishDialog;
})(this.app || (this.app = {}));