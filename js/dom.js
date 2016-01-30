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

  dom.on = function(el, type, listener) {
    el.addEventListener(type, listener);
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = dom;
  else
    app.dom = dom;
})(this.app || (this.app = {}));