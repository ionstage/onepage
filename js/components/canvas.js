(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');
  var CanvasElement = app.CanvasElement || require('./canvas-element.js');

  var CanvasElementList = helper.inherits(function() {
    CanvasElementList.super_.call(this);
  }, helper.List);

  CanvasElementList.prototype.fromPoint = function(x, y) {
    var data = this.data;
    var closeCanvasElement = null;

    for (var i = data.length - 1; i >= 0; i--) {
      var canvasElement = data[i];

      if (canvasElement.contains(x, y, 0))
        return canvasElement;

      if (!closeCanvasElement && canvasElement.contains(x, y, 8))
        closeCanvasElement = canvasElement;
    }

    return closeCanvasElement;
  };

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