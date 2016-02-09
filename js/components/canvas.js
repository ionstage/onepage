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

  CanvasElementList.prototype.toFront = function(canvasElement) {
    var data = this.data;
    var index = data.indexOf(canvasElement);

    if (index === -1)
      return;

    data.splice(index, 1);
    data.push(canvasElement);
  };

  var Canvas = helper.inherits(function(props) {
    Canvas.super_.call(this);

    this.canvasElementList = this.prop(new CanvasElementList());
    this.element = this.prop(props.element);
    this.dragContext = this.prop({});

    var onstart = Canvas.prototype.onstart.bind(this);
    var onmove = Canvas.prototype.onmove.bind(this);

    dom.draggable(this.element(), onstart, onmove);
  }, Component);

  Canvas.prototype.borderWidth = function() {
    return 5;
  };

  Canvas.prototype.containerElement = function() {
    return dom.child(this.element(), 0);
  };

  Canvas.prototype.handleElement = function() {
    return dom.child(this.element(), 1);
  };

  Canvas.prototype.updateZIndex = function() {
    this.canvasElementList().toArray().forEach(function(canvasElement, index) {
      canvasElement.zIndex(index);
    });
  };

  Canvas.prototype.loadElement = function(srcText, locator) {
    return CanvasElement.load({
      srcText: srcText,
      locator: locator,
      parentElement: this.containerElement()
    }).then(function(canvasElement) {
      this.canvasElementList().add(canvasElement);
      this.updateZIndex();
      return canvasElement;
    }.bind(this));
  };

  Canvas.prototype.onstart = function(x, y, event) {
    dom.cancel(event);

    var borderWidth = this.borderWidth();

    x -= borderWidth;
    y -= borderWidth;

    var context = this.dragContext();
    var canvasElement = this.canvasElementList().fromPoint(x, y);

    context.canvasElement = canvasElement;

    if (!canvasElement)
      return;

    context.x = canvasElement.x();
    context.y = canvasElement.y();
  };

  Canvas.prototype.onmove = function(dx, dy) {
    var context = this.dragContext();
    var canvasElement = context.canvasElement;

    if (!canvasElement)
      return;

    canvasElement.x(context.x + dx);
    canvasElement.y(context.y + dy);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Canvas;
  else
    app.Canvas = Canvas;
})(this.app || (this.app = {}));