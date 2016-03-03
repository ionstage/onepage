(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var URLComponent = helper.inherits(function() {
    URLComponent.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = URLComponent;
  else
    app.URLComponent = URLComponent;
})(this.app || (this.app = {}));