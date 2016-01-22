(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var Component = app.Component || require('./component.js');

  var InsertForm = helper.inherits(function() {
    InsertForm.super_.call(this);
  }, Component);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = InsertForm;
  else
    app.InsertForm = InsertForm;
})(this.app || (this.app = {}));