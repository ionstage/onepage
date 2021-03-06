(function(app) {
  'use strict';

  var helper = {};

  helper.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    return ctor;
  };

  helper.identity = function(value) {
    return value;
  };

  helper.escape = function(s) {
    return s.replace(/[&<>"']/g, function(s) {
      switch (s) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#039;';
      }
    });
  };

  helper.List = (function() {
    var List = function() {
      this.data = [];
    };

    List.prototype.add = function(item) {
      if (!this.contains(item))
        this.data.push(item);
    };

    List.prototype.remove = function(item) {
      var data = this.data;

      for (var i = data.length - 1; i >= 0; i--) {
        if (this.equal(data[i], item)) {
          data.splice(i, 1);
          break;
        }
      }
    };

    List.prototype.contains = function(item) {
      return this.data.some(function(dataItem) {
        return this.equal(dataItem, item);
      }.bind(this));
    };

    List.prototype.equal = function(a, b) {
      return a === b;
    };

    List.prototype.toArray = function() {
      return this.data.slice();
    };

    return List;
  })();

  helper.bindAll = function(obj) {
    var proto = Object.getPrototypeOf(obj);

    for (var key in proto) {
      obj[key] = proto[key].bind(obj);
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = helper;
  else
    app.helper = helper;
})(this.app || (this.app = {}));