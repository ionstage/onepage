(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');
  var Relation = app.Relation || require('./relation.js');
  var CanvasElement = app.CanvasElement || require('./canvas-element.js');
  var CanvasElementHandle = app.CanvasElementHandle || require('./canvas-element-handle.js');

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

  CanvasElementList.prototype.swap = function(i, j) {
    var data = this.data;
    var len = data.length;

    if (i < 0 || i >= len || j < 0 || j >= len)
      return;

    var tmp = data[i];
    data[i] = data[j];
    data[j] = tmp;
  };

  CanvasElementList.prototype.shiftRight = function(canvasElement) {
    var index = this.data.indexOf(canvasElement);

    if (index === -1)
      return;

    this.swap(index, index + 1);
  };

  CanvasElementList.prototype.shiftLeft = function(canvasElement) {
    var index = this.data.indexOf(canvasElement);

    if (index === -1)
      return;

    this.swap(index, index - 1);
  };

  CanvasElementList.prototype.canShiftRight = function(canvasElement) {
    var data = this.data;
    var index = data.indexOf(canvasElement);

    return (index !== -1 && index !== data.length - 1);
  };

  CanvasElementList.prototype.canShiftLeft = function(canvasElement) {
    var index = this.data.indexOf(canvasElement);
    return (index !== -1 && index !== 0);
  };

  var CanvasElementRelation = helper.inherits(function(props) {
    this.canvas = this.prop(props.canvas);
    this.canvasElement = this.prop(props.canvasElement);
  }, Relation);

  CanvasElementRelation.prototype.update = function(changedComponent) {
    var canvasElement = this.canvasElement();

    if (changedComponent === canvasElement) {
      // disable the canvas-element moving out of the canvas
      var canvas = this.canvas();

      var width = canvas.width();
      var height = canvas.height();

      var ex = canvasElement.x();
      var ey = canvasElement.y();
      var ewidth = canvasElement.width();
      var eheight = canvasElement.height();

      var offset = 20;

      var x = Math.max(ex, offset - ewidth);
      var y = Math.max(ey, offset - eheight);

      x = Math.min(x, width - offset);
      y = Math.min(y, height - offset);

      canvasElement.x(x);
      canvasElement.y(y);

      // move the canvas-element-handle onto the selected canvas-element
      if (canvas.hasCanvasElementHandle() && canvas.selectedCanvasElement() === canvasElement)
        canvas.canvasElementHandle().fitIn(canvasElement);
    }
  };

  var Canvas = helper.inherits(function(props) {
    Canvas.super_.call(this);

    this.canvasElementList = this.prop(new CanvasElementList());
    this.disabled = this.prop(false);
    this.hasCanvasElementHandle = this.prop(props.hasCanvasElementHandle);
    this.element = this.prop(props.element);
    this.selectedCanvasElement = this.prop(null);

    var canvasElementHandle;

    if (this.hasCanvasElementHandle()) {
      canvasElementHandle = new CanvasElementHandle({
        element: this.handleElement(),
        deleter: Canvas.prototype.canvasElementDeleter.bind(this),
        forwardStepper: Canvas.prototype.canvasElementForwardStepper.bind(this),
        backwardStepper: Canvas.prototype.canvasElementBackwardStepper.bind(this),
        resizer: Canvas.prototype.resizer.bind(this)
      });
    } else {
      canvasElementHandle = null;
    }

    this.canvasElementHandle = this.prop(canvasElementHandle);

    this.dragContext = this.prop({});

    var onstart = Canvas.prototype.onstart.bind(this);
    var onmove = Canvas.prototype.onmove.bind(this);
    var onend = Canvas.prototype.onend.bind(this);

    dom.draggable(this.element(), onstart, onmove, onend);

    dom.on(document, dom.eventType('start'), function() {
      this.selectedCanvasElement(null);
      this.updateCanvasElementHandle();
    }.bind(this));

    this.inserter = props.inserter;

    var ondrop = Canvas.prototype.ondrop.bind(this);

    dom.droppable(this.element(), ondrop);

    this.updater = props.updater;
    this.deleter = props.deleter;
  }, Component);

  Canvas.prototype.width = function() {
    return 640;
  };

  Canvas.prototype.height = function() {
    return 480;
  };

  Canvas.prototype.borderWidth = function() {
    return 5;
  };

  Canvas.prototype.containerElement = function() {
    return dom.child(this.element(), 0);
  };

  Canvas.prototype.handleElement = function() {
    return dom.child(this.element(), 1);
  };

  Canvas.prototype.redraw = function() {
    if (this.disabled())
      dom.addClass(this.element(), 'disabled');
    else
      dom.removeClass(this.element(), 'disabled');
  };

  Canvas.prototype.updateZIndex = function() {
    this.canvasElementList().toArray().forEach(function(canvasElement, index) {
      canvasElement.zIndex(index);
    });
  };

  Canvas.prototype.updateCanvasElementHandle = function() {
    if (!this.hasCanvasElementHandle())
      return;

    var canvasElement = this.selectedCanvasElement();
    var canvasElementHandle = this.canvasElementHandle();

    if (canvasElement) {
      // update step-forward button and step-backward button
      var canvasElementList = this.canvasElementList();
      canvasElementHandle.stepForwardDisabled(!canvasElementList.canShiftRight(canvasElement));
      canvasElementHandle.stepBackwardDisabled(!canvasElementList.canShiftLeft(canvasElement));

      // show the canvas-element-handle
      canvasElementHandle.fitIn(canvasElement);
      canvasElementHandle.visible(true);
      canvasElementHandle.deleteKeyEnabled(true);
    } else {
      // hide the canvas-element-handle
      canvasElementHandle.visible(false);
      canvasElementHandle.deleteKeyEnabled(false);
    }
  };

  Canvas.prototype.loadCanvasElement = function(srcText, locator, sizer) {
    return CanvasElement.load({
      srcText: srcText,
      locator: locator,
      sizer: sizer,
      parentElement: this.containerElement()
    }).then(function(canvasElement) {
      this.canvasElementList().add(canvasElement);

      var relation = new CanvasElementRelation({
        canvas: this,
        canvasElement: canvasElement
      });

      canvasElement.relations().push(relation);

      this.selectedCanvasElement(canvasElement);
      this.updateCanvasElementHandle();

      this.updateZIndex();
      return canvasElement;
    }.bind(this));
  };

  Canvas.prototype.loadCanvasElementAll = function(propsList) {
    return Promise.all(propsList.map(function(props) {
      var srcText = props.srcText;

      var point = {
        x: props.x,
        y: props.y
      };

      var size = {
        width: props.width,
        height: props.height
      };

      return CanvasElement.load({
        srcText: srcText,
        locator: function() { return point; },
        sizer: function() { return size; },
        parentElement: this.containerElement()
      });
    }.bind(this))).then(function(canvasElements) {
      canvasElements.forEach(function(canvasElement) {
        this.canvasElementList().add(canvasElement);

        var relation = new CanvasElementRelation({
          canvas: this,
          canvasElement: canvasElement
        });

        canvasElement.relations().push(relation);
      }.bind(this));

      this.updateZIndex();
      return canvasElements;
    }.bind(this));
  };

  Canvas.prototype.getCanvasElementPropsList = function() {
    return this.canvasElementList().toArray().map(function(canvasElement) {
      return {
        srcText: canvasElement.srcText(),
        x: canvasElement.x(),
        y: canvasElement.y(),
        width: canvasElement.width(),
        height: canvasElement.height()
      };
    });
  };

  Canvas.prototype.deleteCanvasElement = function(canvasElement) {
    if (!canvasElement)
      return;

    if (this.selectedCanvasElement() === canvasElement) {
      this.selectedCanvasElement(null);
      this.updateCanvasElementHandle();
    }

    // clear relations of the canvas-element
    canvasElement.relations([]);

    // remove DOM element of the canvas-element
    canvasElement.parentElement(null);

    this.canvasElementList().remove(canvasElement);
    this.updateZIndex();
  };

  Canvas.prototype.canvasElementDeleter = function() {
    this.deleteCanvasElement(this.selectedCanvasElement());
    this.deleter();
  };

  Canvas.prototype.canvasElementForwardStepper = function() {
    this.canvasElementList().shiftRight(this.selectedCanvasElement());
    this.updateCanvasElementHandle();
    this.updateZIndex();
    this.updater();
  };

  Canvas.prototype.canvasElementBackwardStepper = function() {
    this.canvasElementList().shiftLeft(this.selectedCanvasElement());
    this.updateCanvasElementHandle();
    this.updateZIndex();
    this.updater();
  };

  Canvas.prototype.resizer = (function() {
    var context = {};

    return function(dx, dy, isStart, isEnd) {
      var canvasElement;

      if (isStart) {
        canvasElement = this.selectedCanvasElement();
        context.canvasElement = canvasElement;
        context.width = canvasElement.width();
        context.height = canvasElement.height();
        return;
      }

      canvasElement = context.canvasElement;

      var aspectRatio = canvasElement.width() / canvasElement.height();
      var width = Math.max(context.width + dx, 12 * aspectRatio, 12);
      var height = Math.max(context.height + dy, 12 / aspectRatio, 12);

      canvasElement.width(width);
      canvasElement.height(height);
      canvasElement.adjustSizeToKeepAspectRatio();

      if (isEnd && (dx !== 0 || dy !== 0))
        this.updater();
    };
  })();

  Canvas.prototype.onstart = function(x, y, event) {
    var supportsTouch = dom.supportsTouch();

    if (!supportsTouch)
      dom.cancel(event);

    dom.removeFocus();

    var borderWidth = this.borderWidth();

    x -= borderWidth;
    y -= borderWidth;

    var context = this.dragContext();
    var canvasElement = this.canvasElementList().fromPoint(x, y);

    context.canvasElement = canvasElement;

    if (!canvasElement)
      return;

    if (supportsTouch)
      dom.cancel(event);

    dom.stop(event);
    this.selectedCanvasElement(canvasElement);
    this.updateCanvasElementHandle();

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

  Canvas.prototype.onend = function(dx, dy) {
    var canvasElement = this.dragContext().canvasElement;

    if (!canvasElement)
      return;

    if (dx !== 0 || dy !== 0)
      this.updater();
  };

  Canvas.prototype.ondrop = function(x, y, event) {
    var borderWidth = this.borderWidth();

    x -= borderWidth;
    y -= borderWidth;

    this.inserter(dom.getImageURLData(event) || dom.getTextData(event), x, y);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Canvas;
  else
    app.Canvas = Canvas;
})(this.app || (this.app = {}));