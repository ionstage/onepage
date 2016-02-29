(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var PublishForm = helper.inherits(function(props) {
    PublishForm.super_.call(this);

    this.element = this.prop(props.element);
  }, Component);

  PublishForm.prototype.textElement = function() {
    return dom.child(this.element(), 0);
  };

  PublishForm.prototype.buttonElement = function() {
    return dom.child(this.element(), 1);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishForm;
  else
    app.PublishForm = PublishForm;
})(this.app || (this.app = {}));