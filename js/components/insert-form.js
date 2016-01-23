(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var InsertForm = helper.inherits(function(props) {
    InsertForm.super_.call(this);
    this.element = this.prop(props.element);
  }, Component);

  InsertForm.prototype.textElement = function() {
    return dom.child(this.element(), 0);
  };

  InsertForm.prototype.buttonElement = function() {
    return dom.child(this.element(), 1);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = InsertForm;
  else
    app.InsertForm = InsertForm;
})(this.app || (this.app = {}));