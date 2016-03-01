(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var PublishForm = helper.inherits(function(props) {
    PublishForm.super_.call(this);

    this.element = this.prop(props.element);

    dom.on(this.textElement(), 'input', PublishForm.prototype.oninput.bind(this));

    // redraw for the initial value of the text element
    this.markDirty();
  }, Component);

  PublishForm.prototype.textElement = function() {
    return dom.child(this.element(), 0);
  };

  PublishForm.prototype.buttonElement = function() {
    return dom.child(this.element(), 1);
  };

  PublishForm.prototype.redraw = function() {
    var text = dom.value(this.textElement());
    dom.disabled(this.buttonElement(), !text);
  };

  PublishForm.prototype.oninput = function() {
    this.markDirty();
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishForm;
  else
    app.PublishForm = PublishForm;
})(this.app || (this.app = {}));