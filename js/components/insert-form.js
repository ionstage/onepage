(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var InsertForm = helper.inherits(function(props) {
    InsertForm.super_.call(this);
    this.element = this.prop(props.element);
    this.inserter = props.inserter;

    dom.on(this.textElement(), 'input', InsertForm.prototype.oninput.bind(this));
    dom.on(this.buttonElement(), 'click', InsertForm.prototype.onclick.bind(this));

    // redraw for the initial value of the text element
    this.markDirty();
  }, Component);

  InsertForm.prototype.textElement = function() {
    return dom.child(this.element(), 0);
  };

  InsertForm.prototype.buttonElement = function() {
    return dom.child(this.element(), 1);
  };

  InsertForm.prototype.redraw = function() {
    var text = dom.value(this.textElement());
    dom.disabled(this.buttonElement(), !text);
  };

  InsertForm.prototype.oninput = function() {
    this.markDirty();
  };

  InsertForm.prototype.onclick = function() {
    var textElement = this.textElement();
    var text = dom.value(textElement);

    dom.disabled(textElement, true);
    dom.disabled(this.buttonElement(), true);

    this.inserter(text).then(function() {
      var textElement = this.textElement();
      dom.value(textElement, '');
      dom.disabled(textElement, false);
      dom.disabled(this.buttonElement(), false);
      this.markDirty();
    }.bind(this)).catch(function() {
      dom.disabled(this.textElement(), false);
      dom.disabled(this.buttonElement(), false);
    }.bind(this));
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = InsertForm;
  else
    app.InsertForm = InsertForm;
})(this.app || (this.app = {}));