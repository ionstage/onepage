(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var CanvasElement = helper.inherits(function() {
    CanvasElement.super_.call(this);
  }, Component);

  CanvasElement.load = function(props) {
    return CanvasTextElement.load(props);
  };

  var CanvasTextElement = helper.inherits(function(props) {
    CanvasTextElement.super_.call(this);

    this.cx = this.prop(props.cx);
    this.cy = this.prop(props.cy);
    this.width = this.prop(props.width);
    this.height = this.prop(props.height);
    this.element = this.prop(props.element);
  }, CanvasElement);

  CanvasTextElement.prototype.redraw = function() {
    var element = this.element();
    var x = this.cx() - this.width() / 2;
    var y = this.cy() - this.height() / 2;
    var translate = 'translate(' + x + 'px, ' + y + 'px)';

    dom.css(element, {
      msTransform: translate,
      transform: translate,
      webkitTransform: translate
    });
  };

  CanvasTextElement.load = function(props) {
    var srcText = props.srcText;
    var cx = props.cx;
    var cy = props.cy;
    var parentElement = props.parentElement;

    return Promise.resolve().then(function() {
      var element = dom.el('<div>');

      dom.addClass(element, 'canvas-element');
      dom.text(element, srcText);
      dom.visible(element, false);
      dom.append(parentElement, element);

      var rect = dom.rect(element);

      var instance = new CanvasTextElement({
        cx: cx,
        cy: cy,
        width: rect.width,
        height: rect.height,
        element: element
      });

      instance.redraw();
      dom.visible(element, true);

      return instance;
    });
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = CanvasElement;
  else
    app.CanvasElement = CanvasElement;
})(this.app || (this.app = {}));