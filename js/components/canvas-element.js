(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var CanvasElement = helper.inherits(function() {
    CanvasElement.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = CanvasElement;
  else
    app.CanvasElement = CanvasElement;
})(this.app || (this.app = {}));