(function(app) {
  'use strict';

  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Component = app.Component || require('./component.js');

  var CanvasElementHandle = helper.inherits(function(props) {
    CanvasElementHandle.super_.call(this);

    this.x = this.prop(0);
    this.y = this.prop(0);
    this.width = this.prop(0);
    this.height = this.prop(0);
    this.visible = this.prop(false);
    this.stepForwardDisabled = this.prop(false);
    this.stepBackwardDisabled = this.prop(false);
    this.element = this.prop(props.element);

    this.deleter = props.deleter;
    this.forwardStepper = props.forwardStepper;
    this.backwardStepper = props.backwardStepper;
    this.resizer = props.resizer;

    this.ondelete = CanvasElementHandle.prototype.ondelete.bind(this);
    this.onstepforward = CanvasElementHandle.prototype.onstepforward.bind(this);
    this.onstepbackward = CanvasElementHandle.prototype.onstepbackward.bind(this);
    this.onresizestart = CanvasElementHandle.prototype.onresizestart.bind(this);
    this.onresizemove = CanvasElementHandle.prototype.onresizemove.bind(this);

    dom.on(this.element(), dom.supportsTouch() ? 'touchstart' : 'mousedown', function(event) {
      var target = dom.target(event);

      if (dom.parent(target) === this.element()) {
        // make child component of the element manipulable
        dom.stop(event);

        if (!dom.supportsTouch())
          dom.cancel(event);
      }
    }.bind(this));

    if (dom.supportsTouch())
      dom.on(this.element(), 'touchmove', dom.cancel);

    dom.on(this.deleteButtonElement(), 'click', this.ondelete);
    dom.on(this.stepForwardButtonElement(), 'click', this.onstepforward);
    dom.on(this.stepBackwardButtonElement(), 'click', this.onstepbackward);
    dom.draggable(this.resizeHandleElement(), this.onresizestart, this.onresizemove);
  }, Component);

  CanvasElementHandle.prototype.deleteButtonElement = function() {
    return dom.child(this.element(), 0);
  };

  CanvasElementHandle.prototype.stepForwardButtonElement = function() {
    return dom.child(this.element(), 1);
  };

  CanvasElementHandle.prototype.stepBackwardButtonElement = function() {
    return dom.child(this.element(), 2);
  };

  CanvasElementHandle.prototype.resizeHandleElement = function() {
    return dom.child(this.element(), 3);
  };

  CanvasElementHandle.prototype.redraw = function() {
    var translate = 'translate(' + this.x() + 'px, ' + this.y() + 'px)';

    dom.css(this.element(), {
      height: this.height() + 'px',
      transform: translate,
      visibility: this.visible() ? 'visible' : 'hidden',
      webkitTransform: translate,
      width: this.width() + 'px'
    });

    dom.disabled(this.stepForwardButtonElement(), this.stepForwardDisabled());
    dom.disabled(this.stepBackwardButtonElement(), this.stepBackwardDisabled());
  };

  CanvasElementHandle.prototype.fitIn = function(canvasElement) {
    this.x(canvasElement.x());
    this.y(canvasElement.y());
    this.width(canvasElement.width());
    this.height(canvasElement.height());
  };

  CanvasElementHandle.prototype.deleteKeyEnabled = function(enabled) {
    if (enabled)
      dom.on(document, 'keydown', this.ondelete);
    else
      dom.off(document, 'keydown', this.ondelete);
  };

  CanvasElementHandle.prototype.ondelete = function(event) {
    var type = dom.type(event);
    var which = dom.which(event);

    var isDeleteButtonClicked = (type === 'click');
    var isDeleteKeyDown = (type === 'keydown' && (which === 8 || which === 46));

    // disable "back" function with the backspace key in the browser
    if (isDeleteKeyDown)
        dom.cancel(event);

    if (isDeleteButtonClicked || isDeleteKeyDown)
      this.deleter();
  };

  CanvasElementHandle.prototype.onstepforward = function() {
    this.forwardStepper();
  };

  CanvasElementHandle.prototype.onstepbackward = function() {
    this.backwardStepper();
  };

  CanvasElementHandle.prototype.onresizestart = function() {
    this.resizer(0, 0, true);
  };

  CanvasElementHandle.prototype.onresizemove = function(dx, dy) {
    this.resizer(dx, dy, false);
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = CanvasElementHandle;
  else
    app.CanvasElementHandle = CanvasElementHandle;
})(this.app || (this.app = {}));