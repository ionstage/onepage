(function(app) {
  'use strict';

  var dom = app.dom || require('./dom.js');
  var Canvas = app.Canvas || require('./components/canvas.js');
  var URLComponent = app.URLComponent || require('./components/url-component.js');

  var Viewer = function() {
    var noop = function() {};

    this.canvas = new Canvas({
      hasCanvasElementHandle: false,
      element: dom.el('.canvas'),
      inserter: noop,
      updater: noop,
      deleter: noop
    });

    this.urlComponent = new URLComponent();

    this.loadURLFragment();
  };

  Viewer.prototype.loadURLFragment = function() {
    var fragment = this.urlComponent.fragment();

    var data;
    try {
      data = JSON.parse(dom.atob(fragment.substring(1)));
    } catch (e) {
      data = { title: '', list: [] };
    }

    dom.title(data.title + ' - OnePage');

    return this.canvas.loadCanvasElementAll(data.list).then(function() {
      return data;
    });
  };

  app.main = new Viewer();
})(this.app || (this.app = {}));