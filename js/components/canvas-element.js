(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var CanvasElement = helper.inherits(function(props) {
    CanvasElement.super_.call(this);

    this.srcText = this.prop(props.srcText);
    this.x = this.prop(props.x);
    this.y = this.prop(props.y);
    this.width = this.prop(props.width);
    this.height = this.prop(props.height);
    this.element = this.prop(props.element);
    this.parentElement = this.prop(props.parentElement);
    this.zIndex = this.prop('auto');
  }, Component);

  CanvasElement.prototype.contains = function(x, y, tolerance) {
    var ex = this.x();
    var ey = this.y();
    var ewidth = this.width();
    var eheight = this.height();

    return (ex - tolerance <= x && x <= ex + ewidth + tolerance &&
            ey - tolerance <= y && y <= ey + eheight + tolerance);
  };

  CanvasElement.prototype.redraw = function() {
    var element = this.element();
    var parentElement = this.parentElement();

    // remove element
    if (!parentElement && element) {
      dom.remove(element);
      this.element(null);
      return;
    }

    var translate = 'translate(' + this.x() + 'px, ' + this.y() + 'px)';

    dom.css(element, {
      transform: translate,
      webkitTransform: translate,
      zIndex: this.zIndex()
    });
  };

  CanvasElement.load = function(props) {
    if (dom.isURL(props.srcText))
      return CanvasImageElement.load(props);
    else
      return CanvasTextElement.load(props);
  };

  var CanvasTextElement = helper.inherits(function(props) {
    CanvasTextElement.super_.call(this, props);

    this.widthPerFontSize = this.prop(props.widthPerFontSize);
    this.heightPerFontSize = this.prop(props.heightPerFontSize);
    this.cache = this.prop({});
  }, CanvasElement);

  CanvasTextElement.prototype.adjustSizeToKeepAspectRatio = function() {
    var cache = this.cache();

    var widthPerFontSize = this.widthPerFontSize();
    var heightPerFontSize = this.heightPerFontSize();

    var fontSize = Math.min(this.width() / widthPerFontSize,
                            this.height() / heightPerFontSize);

    this.width(fontSize * widthPerFontSize);
    this.height(fontSize * heightPerFontSize);

    // keep the new font-size to redraw
    cache.fontSize = fontSize;
  };

  CanvasTextElement.prototype.redraw = function() {
    var cache = this.cache();

    if ('fontSize' in cache)
      dom.css(this.element(), { fontSize: cache.fontSize + 'px' });

    CanvasTextElement.super_.prototype.redraw.call(this);

    delete cache.fontSize;
  };

  CanvasTextElement.load = function(props) {
    var srcText = props.srcText;
    var locator = props.locator;
    var sizer = props.sizer;
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

      var fontSize = 20;

      dom.css(element, { fontSize: fontSize + 'px' });
      dom.visible(element, false);
      dom.append(parentElement, element);

      var rect = dom.rect(element);
      var width = rect.width;
      var height = rect.height;

      var point = locator({
        width: width,
        height: height
      });

      var instance = new CanvasTextElement({
        srcText: srcText,
        x: point.x,
        y: point.y,
        width: width,
        height: height,
        widthPerFontSize: width / fontSize,
        heightPerFontSize: height / fontSize,
        element: element,
        parentElement: parentElement
      });

      var size = sizer({
        width: width,
        height: height
      });

      if (size.width !== width || size.height !== height) {
        instance.width(size.width);
        instance.height(size.height);
        instance.adjustSizeToKeepAspectRatio();
      }

      instance.redraw();
      dom.visible(element, true);

      return instance;
    });
  };

  var CanvasImageElement = helper.inherits(function(props) {
    CanvasImageElement.super_.call(this, props);

    this.aspectRatio = this.prop(props.aspectRatio);
  }, CanvasElement);

  CanvasImageElement.prototype.adjustSizeToKeepAspectRatio = function() {
    var width = this.width();
    var height = this.height();
    var aspectRatio = this.aspectRatio();

    width = Math.min(width, aspectRatio * height);
    height = Math.min(height, width / aspectRatio);

    this.width(width);
    this.height(height);
  };

  CanvasImageElement.prototype.redraw = function() {
    dom.css(this.element(), {
      width: this.width() + 'px',
      height: this.height() + 'px'
    });

    CanvasImageElement.super_.prototype.redraw.call(this);
  };

  CanvasImageElement.load = function(props) {
    var srcText = props.srcText;
    var locator = props.locator;
    var sizer = props.sizer;
    var parentElement = props.parentElement;

    return new Promise(function(resolve, reject) {
      var element = dom.el('<img>');

      dom.addClass(element, 'canvas-element');
      dom.src(element, srcText);
      dom.visible(element, false);

      dom.on(element, 'load', function() {
        var rect = dom.rect(element);
        var width = rect.width;
        var height = rect.height;
        var aspectRatio = width / height;

        var parentRect = dom.rect(parentElement);
        var pwidth = parentRect.width;
        var pheight = parentRect.height;

        if (width > pwidth) {
          width = pwidth;
          height = pwidth / aspectRatio;
        }

        if (height > pheight) {
          width = pheight * aspectRatio;
          height = pheight;
        }

        var point = locator({
          width: width,
          height: height
        });

        var instance = new CanvasImageElement({
          srcText: srcText,
          x: point.x,
          y: point.y,
          width: width,
          height: height,
          aspectRatio: aspectRatio,
          element: element,
          parentElement: parentElement
        });

        var size = sizer({
          width: width,
          height: height
        });

        if (size.width !== width || size.height !== height) {
          instance.width(size.width);
          instance.height(size.height);
          instance.adjustSizeToKeepAspectRatio();
        }

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
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = CanvasElement;
  else
    app.CanvasElement = CanvasElement;
})(this.app || (this.app = {}));