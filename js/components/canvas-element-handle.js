(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var CanvasElementHandle = helper.inherits(function() {
    CanvasElementHandle.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = CanvasElementHandle;
  else
    app.CanvasElementHandle = CanvasElementHandle;
})(this.app || (this.app = {}));