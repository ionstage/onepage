(function(app) {
  'use strict';

  var helper = app.helper || require('./helper.js');
  var dom = app.dom || require('./dom.js');
  var InsertForm = app.InsertForm || require('./components/insert-form.js');
  var Canvas = app.Canvas || require('./components/canvas.js');
  var PublishForm = app.PublishForm || require('./components/publish-form.js');
  var PublishDialog = app.PublishDialog || require('./components/publish-dialog.js');
  var URLComponent = app.URLComponent || require('./components/url-component.js');

  var App = function() {
    helper.bindAll(this);

    this.insertForm = new InsertForm({
      element: dom.el('.insert-form'),
      inserter: this.inserter
    });

    this.canvas = new Canvas({
      hasCanvasElementHandle: true,
      element: dom.el('.canvas'),
      inserter: this.inserter,
      updater: this.updater,
      deleter: this.deleter
    });

    this.publishForm = new PublishForm({
      element: dom.el('.publish-form'),
      updater: this.updater,
      publisher: this.publisher
    });

    this.publishDialog = new PublishDialog({
      element: dom.el('.dialog'),
      closer: this.publishDialogCloser
    });

    this.urlComponent = new URLComponent();

    this.loadURLFragment().then(function() {
      this.saveURLFragment().then(this.updatePublishButton);
    }.bind(this));
  };

  App.prototype.inserter = function(text, cx, cy) {
    this.insertForm.disabled(true);

    var hasPoint = (arguments.length === 3);

    return this.canvas.loadCanvasElement(text, function(props) {
      var x, y;

      if (hasPoint) {
        x = cx - props.width / 2;
        y = cy - props.height / 2;
      } else {
        x = (this.canvas.width() - props.width) / 2;
        y = (props.height < this.canvas.height() - 40) ? 20 : 0;
      }

      return { x: x, y: y };
    }.bind(this), helper.identity).then(function() {
      if (!hasPoint) {
        // inserted by using insert-form
        this.insertForm.clearText();
      }

      this.insertForm.disabled(false);
      this.saveURLFragment().then(this.updatePublishButton);
    }.bind(this)).catch(function(e) {
      console.error(e);
      alert('Load error!');
      this.insertForm.disabled(false);
    }.bind(this));
  };

  App.prototype.updater = function() {
    this.saveURLFragment().then(this.updatePublishButton);
  };

  App.prototype.deleter = function() {
    this.saveURLFragment().then(this.updatePublishButton);
  };

  App.prototype.publisher = function(text) {
    var title = text + ' - OnePage';

    var pathNames = dom.urlPathName().split('/');
    pathNames[pathNames.length - 1] = 'viewer.html';

    var url = dom.urlOrigin() + pathNames.join('/') + '#' + this.urlComponent.fragment();

    var publishDialog = this.publishDialog;
    publishDialog.title(title);
    publishDialog.url(url);
    publishDialog.visible(true);
  };

  App.prototype.publishDialogCloser = function() {
    this.publishDialog.visible(false);
  };

  App.prototype.loadURLFragment = function() {
    var fragment = this.urlComponent.fragment();

    var data;
    try {
      data = JSON.parse(dom.atob(fragment.substring(1)));
    } catch (e) {
      data = { title: '', list: [] };
    }

    this.publishForm.text(data.title);

    return this.canvas.loadCanvasElementAll(data.list).then(function() {
      return data;
    });
  };

  App.prototype.saveURLFragment = function(data) {
    var title = this.publishForm.text();
    var list = this.canvas.getCanvasElementPropsList();
    var isEmpty = (!title && list.length === 0);

    var data = {
      title: title,
      list: list
    };

    var fragment = '!' + (!isEmpty ? dom.btoa(JSON.stringify(data)) : '');

    this.urlComponent.fragment(fragment);

    return Promise.resolve(data);
  };

  App.prototype.updatePublishButton = function(data) {
    var isEmpty = (!data.title && data.list.length === 0);
    this.publishForm.publishDisabled(isEmpty);
  };

  app.main = new App();
})(this.app || (this.app = {}));