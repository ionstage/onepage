(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var PublishDialog = helper.inherits(function() {
    PublishDialog.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishDialog;
  else
    app.PublishDialog = PublishDialog;
})(this.app || (this.app = {}));