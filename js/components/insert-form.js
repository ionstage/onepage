(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var InsertForm = helper.inherits(function(props) {
    InsertForm.super_.call(this);

    this.disabled = this.prop(false);
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
    var disabled = this.disabled();
    var textElement = this.textElement();
    var text = dom.value(textElement);

    dom.disabled(textElement, disabled);
    dom.disabled(this.buttonElement(), disabled || !text);
  };

  InsertForm.prototype.oninput = function(event) {
    this.markDirty();
  };

  InsertForm.prototype.onclick = function() {
    var text = dom.value(this.textElement());

    this.disabled(true);

    this.inserter(text).then(function() {
      dom.value(this.textElement(), '');
      this.disabled(false);
    }.bind(this)).catch(function() {
      this.disabled(false);
    }.bind(this));
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = InsertForm;
  else
    app.InsertForm = InsertForm;
})(this.app || (this.app = {}));