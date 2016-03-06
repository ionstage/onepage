(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var PublishForm = helper.inherits(function(props) {
    PublishForm.super_.call(this);

    this.publishDisabled = this.prop(false);
    this.element = this.prop(props.element);
    this.updater = props.updater;
    this.publisher = props.publisher;

    dom.on(this.textElement(), 'input', PublishForm.prototype.oninput.bind(this));
    dom.on(this.buttonElement(), 'click', PublishForm.prototype.onclick.bind(this));
  }, Component);

  PublishForm.prototype.textElement = function() {
    return dom.child(this.element(), 0);
  };

  PublishForm.prototype.buttonElement = function() {
    return dom.child(this.element(), 1);
  };

  PublishForm.prototype.text = function(s) {
    if (typeof s !== 'undefined')
      this.markDirty();

    return dom.value(this.textElement(), s);
  };

  PublishForm.prototype.redraw = function() {
    dom.disabled(this.buttonElement(), this.publishDisabled());
  };

  PublishForm.prototype.oninput = function() {
    this.markDirty();
    this.updater();
  };

  PublishForm.prototype.onclick = function() {
    this.publisher(this.text());
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishForm;
  else
    app.PublishForm = PublishForm;
})(this.app || (this.app = {}));