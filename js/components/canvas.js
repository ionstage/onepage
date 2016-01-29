(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');
  var CanvasElement = app.CanvasElement || require('./canvas-element.js');

  var Canvas = helper.inherits(function(props) {
    Canvas.super_.call(this);

    this.canvasElements = this.prop([]);
    this.element = this.prop(props.element);
  }, Component);

  Canvas.prototype.containerElement = function() {
    return dom.child(this.element(), 0);
  };

  Canvas.prototype.handleElement = function() {
    return dom.child(this.element(), 1);
  };

  Canvas.prototype.loadElement = function(srcText, cx, cy) {
    return CanvasElement.load({
      srcText: srcText,
      cx: cx,
      cy: cy,
      parentElement: this.containerElement()
    }).then(function(canvasElement) {
      this.canvasElements().push(canvasElement);
      return canvasElement;
    }.bind(this));
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Canvas;
  else
    app.Canvas = Canvas;
})(this.app || (this.app = {}));