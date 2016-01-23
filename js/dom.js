(function(app) {
  'use strict';

  var dom = {};

  dom.unsupported = function() {
    return (typeof document === 'undefined');
  };

  dom.child = function(el, index) {
    return el.children[index];
  };

  dom.animate = function(callback) {
    return window.requestAnimationFrame(callback);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = dom;
  else
    app.dom = dom;
})(this.app || (this.app = {}));