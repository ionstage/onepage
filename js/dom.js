(function(app) {
  'use strict';

  var dom = {};

  dom.unsupported = function() {
    return (typeof document === 'undefined');
  };

  dom.el = function(selector) {
    if (selector.charAt(0) === '<') {
      selector = selector.match(/<(.+)>/)[1];
      return document.createElement(selector);
    }

    return document.querySelector(selector);
  };

  dom.append = function(parent, el) {
    parent.appendChild(el);
  };

  dom.remove = function(el) {
    el.parentNode.removeChild(el);
  };

  dom.child = function(el, index) {
    return el.children[index];
  };

  dom.parent = function(el) {
    return el.parentNode;
  };

  dom.css = function(el, props) {
    var style = el.style;

    for (var key in props) {
      style[key] = props[key];
    }
  };

  dom.addClass = function(el, className) {
    el.classList.add(className);
  };

  dom.html = function(el, s) {
    el.innerHTML = s;
  };

  dom.value = function(el, s) {
    if (typeof s === 'undefined')
      return el.value;

    el.value = s;
  };

  dom.src = function(el, s) {
    el.src = s;
  };

  dom.disabled = function(el, disabled) {
    el.disabled = disabled;
  };

  dom.visible = function(el, visible) {
    el.style.visibility = (visible ? 'visible' : 'hidden');
  };

  dom.rect = function(el) {
    return el.getBoundingClientRect();
  };

  dom.scrollLeft = function(el) {
    return el.scrollLeft;
  };

  dom.scrollTop = function(el) {
    return el.scrollTop;
  };

  dom.removeFocus = function() {
    document.activeElement.blur();
  };

  dom.on = function(el, type, listener) {
    el.addEventListener(type, listener);
  };

  dom.off = function(el, type, listener) {
    el.removeEventListener(type, listener);
  };

  dom.animate = function(callback) {
    return window.requestAnimationFrame(callback);
  };

  dom.isURL = function(s) {
    try {
      new URL(s);
    } catch (e) {
      return false;
    }

    return true;
  };

  dom.supportsTouch = function() {
    return 'createTouch' in document;
  };

  dom.target = function(event) {
    if (dom.supportsTouch())
      event = event.changedTouches[0];

    return event.target;
  };

  dom.type = function(event) {
    return event.type;
  };

  dom.which = function(event) {
    return (event instanceof KeyboardEvent) ? event.which : null;
  };

  dom.pagePoint = function(event, offset) {
    if (dom.supportsTouch())
      event = event.changedTouches[0];

    return {
      x: event.pageX - (offset ? offset.x : 0),
      y: event.pageY - (offset ? offset.y : 0)
    };
  };

  dom.clientPoint = function(event, offset) {
    if (dom.supportsTouch())
      event = event.changedTouches[0];

    return {
      x: event.clientX - (offset ? offset.x : 0),
      y: event.clientY - (offset ? offset.y : 0)
    };
  };

  dom.cancel = function(event) {
    event.preventDefault();
  };

  dom.stop = function(event) {
    event.stopPropagation();
  };

  dom.draggable = (function() {
    if (dom.unsupported())
      return function() {};

    var supportsTouch = dom.supportsTouch();
    var EVENT_TYPE_START = supportsTouch ? 'touchstart' : 'mousedown';
    var EVENT_TYPE_MOVE = supportsTouch ? 'touchmove' : 'mousemove';
    var EVENT_TYPE_END = supportsTouch ? 'touchend' : 'mouseup';

    var Draggable = function(props) {
      this.el = props.el;
      this.onstart = props.onstart;
      this.onmove = props.onmove;
      this.onend = props.onend;
      this.start = start.bind(this);
      this.move = move.bind(this);
      this.end = end.bind(this);
      this.lock = false;
      this.startingPoint = null;

      dom.on(this.el, EVENT_TYPE_START, this.start);
    };

    var start = function(event) {
      if (this.lock)
        return;

      this.lock = true;
      this.startingPoint = dom.pagePoint(event);

      var el = this.el;
      var onstart = this.onstart;

      var rect = dom.rect(el);
      var p = dom.clientPoint(event, {
        x: rect.left - dom.scrollLeft(el),
        y: rect.top - dom.scrollTop(el)
      });

      if (typeof onstart === 'function')
        onstart(p.x, p.y, event);

      dom.on(document, EVENT_TYPE_MOVE, this.move);
      dom.on(document, EVENT_TYPE_END, this.end);
    };

    var move = function(event) {
      var onmove = this.onmove;
      var d = dom.pagePoint(event, this.startingPoint);

      if (typeof onmove === 'function')
        onmove(d.x, d.y, event);
    };

    var end = function(event) {
      dom.off(document, EVENT_TYPE_MOVE, this.move);
      dom.off(document, EVENT_TYPE_END, this.end);

      var onend = this.onend;
      var d = dom.pagePoint(event, this.startingPoint);

      if (typeof onend === 'function')
        onend(d.x, d.y, event);

      this.lock = false;
    };

    return function(el, onstart, onmove, onend) {
      new Draggable({
        el: el,
        onstart: onstart,
        onmove: onmove,
        onend: onend
      });
    };
  })();

  if (typeof module !== 'undefined' && module.exports)
    module.exports = dom;
  else
    app.dom = dom;
})(this.app || (this.app = {}));