(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');
  var CanvasElement = app.CanvasElement || require('./canvas-element.js');

  var CanvasElementList = helper.inherits(function() {
    CanvasElementList.super_.call(this);
  }, helper.List);

  var Canvas = helper.inherits(function(props) {
    Canvas.super_.call(this);

    this.canvasElementList = this.prop(new CanvasElementList());
    this.element = this.prop(props.element);
  }, Component);

  Canvas.prototype.containerElement = function() {
    return dom.child(this.element(), 0);
  };

  Canvas.prototype.handleElement = function() {
    return dom.child(this.element(), 1);
  };

  Canvas.prototype.loadElement = function(srcText, locator) {
    return CanvasElement.load({
      srcText: srcText,
      locator: locator,
      parentElement: this.containerElement()
    }).then(function(canvasElement) {
      this.canvasElementList().add(canvasElement);
      return canvasElement;
    }.bind(this));
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Canvas;
  else
    app.Canvas = Canvas;
})(this.app || (this.app = {}));