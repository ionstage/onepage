(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var CanvasElement = helper.inherits(function() {
    CanvasElement.super_.call(this);
  }, Component);

  CanvasElement.load = function(props) {
    if (dom.isURL(props.srcText))
      return CanvasImageElement.load(props);
    else
      return CanvasTextElement.load(props);
  };

  var CanvasTextElement = helper.inherits(function(props) {
    CanvasTextElement.super_.call(this);

    this.x = this.prop(props.x);
    this.y = this.prop(props.y);
    this.element = this.prop(props.element);
  }, CanvasElement);

  CanvasTextElement.prototype.redraw = function() {
    var element = this.element();
    var translate = 'translate(' + this.x() + 'px, ' + this.y() + 'px)';

    dom.css(element, {
      msTransform: translate,
      transform: translate,
      webkitTransform: translate
    });
  };

  CanvasTextElement.load = function(props) {
    var srcText = props.srcText;
    var locator = props.locator;
    var parentElement = props.parentElement;

    return Promise.resolve().then(function() {
      var element = dom.el('<div>');

      srcText.split(/\r\n|\r|\n/g).forEach(function(text) {
        text = helper.escape(text).replace(/\s/g, '&nbsp;');
        var textElement = dom.el('<div>');
        dom.html(textElement, text || '&nbsp;');
        dom.append(element, textElement);
      });

      dom.addClass(element, 'canvas-element');
      dom.visible(element, false);
      dom.append(parentElement, element);

      var rect = dom.rect(element);

      var point = locator({
        width: rect.width,
        height: rect.height
      });

      var instance = new CanvasTextElement({
        x: point.x,
        y: point.y,
        element: element
      });

      instance.redraw();
      dom.visible(element, true);

      return instance;
    });
  };

  var CanvasImageElement = helper.inherits(function(props) {
    CanvasImageElement.super_.call(this);

    this.x = this.prop(props.x);
    this.y = this.prop(props.y);
    this.element = this.prop(props.element);
  }, CanvasElement);

  CanvasImageElement.prototype.redraw = function() {
    var element = this.element();
    var translate = 'translate(' + this.x() + 'px, ' + this.y() + 'px)';

    dom.css(element, {
      msTransform: translate,
      transform: translate,
      webkitTransform: translate
    });
  };

  CanvasImageElement.load = function(props) {
    var srcText = props.srcText;
    var locator = props.locator;
    var parentElement = props.parentElement;

    return Promise.resolve().then(function() {
      var element = dom.el('<img>');

      dom.addClass(element, 'canvas-element');
      dom.src(element, srcText);
      dom.visible(element, false);

      return new Promise(function(resolve, reject) {
        dom.on(element, 'load', function() {
          var rect = dom.rect(element);

          var point = locator({
            width: rect.width,
            height: rect.height
          });

          var instance = new CanvasImageElement({
            x: point.x,
            y: point.y,
            element: element
          });

          instance.redraw();
          dom.visible(element, true);

          resolve(instance);
        });

        dom.on(element, 'error', function(event) {
          dom.remove(element);
          reject(event);
        });

        dom.append(parentElement, element);
      });
    });
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = CanvasElement;
  else
    app.CanvasElement = CanvasElement;
})(this.app || (this.app = {}));