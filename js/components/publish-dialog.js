(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var PublishDialog = helper.inherits(function(props) {
    PublishDialog.super_.call(this);

    this.visible = this.prop(false);
    this.element = this.prop(props.element);
  }, Component);

  PublishDialog.prototype.redraw = function() {
    if (this.visible())
      dom.removeClass(this.element(), 'hide');
    else
      dom.addClass(this.element(), 'hide');
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = PublishDialog;
  else
    app.PublishDialog = PublishDialog;
})(this.app || (this.app = {}));