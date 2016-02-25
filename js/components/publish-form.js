(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var PublishForm = helper.inherits(function() {
    PublishForm.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishForm;
  else
    app.PublishForm = PublishForm;
})(this.app || (this.app = {}));