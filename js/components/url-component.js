(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var URLComponent = helper.inherits(function() {
    URLComponent.super_.call(this);

    this.fragment = this.prop(dom.urlFragment());
  }, Component);

  URLComponent.prototype.redraw = function() {
    dom.urlFragment(this.fragment())
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = URLComponent;
  else
    app.URLComponent = URLComponent;
})(this.app || (this.app = {}));