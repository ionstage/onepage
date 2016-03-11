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

  dom.doc = function() {
    return document;
  };

  dom.body = function() {
    return document.body;
  };

  dom.title = function(s) {
    document.title = s;
  };

  dom.append = function(parent, el) {
    parent.appendChild(el);
  };

  dom.remove = function(el) {
    el.parentNode.removeChild(el);
  };

  dom.child = function(el, index) {
    var len = arguments.length;

    if (len === 2)
      return el.children[index];

    for (var i = 1; i < len; i++) {
      index = arguments[i];
      el = el.children[index];
    }

    return el;
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

  dom.removeClass = function(el, className) {
    el.classList.remove(className);
  };

  dom.html = function(el, s) {
    el.innerHTML = s;
  };

  dom.value = function(el, s) {
    if (typeof s === 'undefined')
      return el.value;

    el.value = s;
  };

  dom.href = function(el, s) {
    el.setAttribute('href', s);
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

  dom.resetScroll = function(el) {
    el.scrollTop = 0;
  };

  dom.removeFocus = function() {
    document.activeElement.blur();
  };

  dom.selectAll = function(el) {
    el.setSelectionRange(0, el.value.length);
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

  dom.urlOrigin = function() {
    return location.protocol + '//' + location.host;
  };

  dom.urlPathName = function() {
    return location.pathname;
  };

  dom.urlFragment = function(s) {
    if (typeof s === 'undefined')
      return location.hash.substring(1);

    location.replace('#' + s);
  };

  dom.supportsTouch = function() {
    return 'createTouch' in document;
  };

  dom.target = function(event) {
    if (dom.supportsTouch() && 'changedTouches' in event)
      event = event.changedTouches[0];

    return event.target;
  };

  dom.currentTarget = function(event) {
    return event.currentTarget;
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

  dom.eventType = function(name) {
    var supportsTouch = dom.supportsTouch();

    switch (name) {
    case 'start':
      return (supportsTouch ? 'touchstart' : 'mousedown');
    case 'move':
      return (supportsTouch ? 'touchmove' : 'mousemove');
    case 'end':
      return (supportsTouch ? 'touchend' : 'mouseup');
    }
  };

  dom.draggable = (function() {
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

      dom.on(this.el, dom.eventType('start'), this.start);
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

      dom.on(document, dom.eventType('move'), this.move);
      dom.on(document, dom.eventType('end'), this.end);
    };

    var move = function(event) {
      var onmove = this.onmove;
      var d = dom.pagePoint(event, this.startingPoint);

      if (typeof onmove === 'function')
        onmove(d.x, d.y, event);
    };

    var end = function(event) {
      dom.off(document, dom.eventType('move'), this.move);
      dom.off(document, dom.eventType('end'), this.end);

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

  dom.droppable = function(el, ondrop) {
    dom.on(el, 'dragover', dom.cancel);

    dom.on(el, 'drop', function(event) {
      dom.cancel(event);

      var rect = dom.rect(el);
      var p = dom.clientPoint(event, {
        x: rect.left - dom.scrollLeft(el),
        y: rect.top - dom.scrollTop(el)
      });

      ondrop(p.x, p.y, event);
    });
  };

  dom.getTextData = function(event) {
    return event.dataTransfer.getData('text');
  };

  dom.getImageURLData = function(event) {
    var dataTransfer = event.dataTransfer;
    var types = dataTransfer.types;

    if (!types)
      return null;

    var indexOf = Array.prototype.indexOf;

    if (indexOf.call(types, 'text/uri-list') !== -1 && indexOf.call(types, 'text/html') !== -1) {
      var text = dataTransfer.getData('text/html');
      var m = text.match(/<img.*?src=(["\'])(.+?)\1.*?>/i);
      if (m)
        return m[2];
    }

    return null;
  };

  dom.btoa = function(s) {
    return window.btoa(escape(encodeURIComponent(s))).replace(/[+\/]/g, function(s) {
      switch (s) {
      case '+':
        return '-';
      case '/':
        return '_';
      }
    });
  };

  dom.atob = function(s) {
    return decodeURIComponent(unescape(window.atob(s.replace(/[-_]/g, function(s) {
      switch (s) {
      case '-':
        return '+';
      case '_':
        return '/';
      }
    }))));
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = dom;
  else
    app.dom = dom;
})(this.app || (this.app = {}));