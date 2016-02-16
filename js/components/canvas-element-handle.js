(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var CanvasElementHandle = helper.inherits(function(props) {
    CanvasElementHandle.super_.call(this);

    this.x = this.prop(0);
    this.y = this.prop(0);
    this.width = this.prop(0);
    this.height = this.prop(0);
    this.visible = this.prop(false);
    this.element = this.prop(props.element);

    dom.on(this.element(), dom.supportsTouch() ? 'touchstart' : 'mousedown', function(event) {
      var target = dom.target(event);

      if (dom.parent(target) === this.element()) {
        // make child component of the element manipulable
        dom.stop(event);
        dom.cancel(event);
      }
    }.bind(this));
  }, Component);

  CanvasElementHandle.prototype.deleteButtonElement = function() {
    return dom.child(this.element(), 0);
  };

  CanvasElementHandle.prototype.stepForwardButtonElement = function() {
    return dom.child(this.element(), 1);
  };

  CanvasElementHandle.prototype.stepBackwardButtonElement = function() {
    return dom.child(this.element(), 2);
  };

  CanvasElementHandle.prototype.resizeHandleElement = function() {
    return dom.child(this.element(), 3);
  };

  CanvasElementHandle.prototype.redraw = function() {
    var translate = 'translate(' + this.x() + 'px, ' + this.y() + 'px)';

    dom.css(this.element(), {
      height: this.height() + 'px',
      transform: translate,
      visibility: this.visible() ? 'visible' : 'hidden',
      webkitTransform: translate,
      width: this.width() + 'px'
    });
  };

  CanvasElementHandle.prototype.fitIn = function(canvasElement) {
    this.x(canvasElement.x());
    this.y(canvasElement.y());
    this.width(canvasElement.width());
    this.height(canvasElement.height());
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = CanvasElementHandle;
  else
    app.CanvasElementHandle = CanvasElementHandle;
})(this.app || (this.app = {}));