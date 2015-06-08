(function(window) {
  var circuit = require('circuit');
  var Base64 = require('js-base64').Base64;

  var document = window.document;
  var documentFileName;
  var CLIENTJS_SCRIPT_URL = 'https://apis.google.com/js/client.js?onload=handleClientLoad';

  var util = {
    debounce: function(func, wait) {
      if (typeof func !== 'function')
        return;
      var updateTimer = null, context, args;
      return function() {
        context = this;
        args = arguments;
        if (updateTimer !== null)
          clearTimeout(updateTimer);
        updateTimer = setTimeout(function() { func.apply(context, args); }, wait);
      };
    },
    isPlainText: function(s) {
      return s.indexOf("http://") !== 0 &&
             s.indexOf("https://") !== 0 &&
             s.indexOf("file://") !== 0 &&
             s.indexOf("data:image") !== 0;
    },
    loadScript: function(path) {
      var script = document.getElementsByTagName('script')[0],
        new_script = document.createElement('script');
      new_script.src = path;
      script.parentNode.insertBefore(new_script, script);
    },
    indexOf: (function() {
      var nativeIndexOf = Array.prototype.indexOf;
      return function(array, item) {
        if (nativeIndexOf && array.indexOf === nativeIndexOf)
          return array.indexOf(item);
        for (var i = 0, len = array.length; i < len; i += 1) {
          if (array[i] === item)
            return i;
        }
        return -1;
      };
    }())
  };

  var dom = {
    get: function(id) {
      return document.getElementById(id);
    },
    setEvent: function(element, type, listener) {
      element.addEventListener(type, listener, false);
    },
    getValue: function(element) {
      return element.value;
    },
    setValue: function(element, value) {
      element.value = value;
    },
    hasClass: function(element, className) {
      var elementClassName = element.className;
      return (elementClassName + ' ').indexOf(className + ' ') !== -1;
    },
    addClass: function(element, className) {
      var elementClassName = element.className;
      if ((' ' + elementClassName).indexOf(' ' + className) === -1)
        element.className = (elementClassName + ' ' + className).trim();
    },
    removeClass: function(element, className) {
      if (typeof className === 'undefined')
        element.className = '';
      if (dom.hasClass(element, className))
        element.className = (element.className + ' ').replace(className + ' ', '').trim();
    },
    makeCSSText: function(styleMap) {
      var cssText = '';
      for (var key in styleMap) {
        cssText = cssText + key + ':' + styleMap[key] + ';';
      }
      return cssText;
    },
    setDropEvent: function(element, listener) {
      element.addEventListener('dragover', function(event) {
        event.preventDefault();
      }, false);
      element.addEventListener('drop', function(event) {
        event.preventDefault();
        if (typeof listener === 'function') {
          var offsetParent = event.target;
          var offsetLeft = 0;
          var offsetTop = 0;
          while (offsetParent && offsetParent.id !== 'canvas') {
            offsetLeft += offsetParent.offsetLeft;
            offsetTop += offsetParent.offsetTop;
            offsetParent = offsetParent.offsetParent;
          }
          var dataTransfer = event.dataTransfer;
          var types = dataTransfer.types;
          var text = dataTransfer.getData('Text');
          if (types &&
              util.indexOf(types, 'text/html') !== -1 &&
              util.indexOf(types, 'text/uri-list') !== -1) {
            var htmlText = dataTransfer.getData('text/html');
            var m = htmlText.match(/<img.*?src=(["\'])(.+?)\1.*?>/i);
            if (m)
              text = m[2];
          }
          var isFF = (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1);
          var layerX = event.layerX + offsetLeft - (isFF ? 0 : 5);
          var layerY = event.layerY + offsetTop - (isFF ? 0 : 5);
          listener({text: text, x: layerX, y: layerY});
        }
      }, false);
    },
    createImageElement: function(src) {
      var img = new Image();
      img.className = 'canvas-element canvas-element-image';
      img.src = src;
      return img;
    },
    appendImageElementWithCenterPosition: function(element, src, cx, cy, callback) {
      var img = dom.createImageElement(src);
      img.style.visibility = 'hidden';
      img.onload = function() {
        var style = getComputedStyle(img, null);
        var width = parseInt(style.width);
        var height = parseInt(style.height);
        if (width > 640) {
          height *= 640 / width;
          width = 640;
        }
        if (height > 480) {
          width *= 480 / height;
          height = 480;
        }
        if (typeof cx === 'undefined')
          cx = 320;
        if (typeof cy === 'undefined')
          cy = 20 + height / 2;
        img.style.cssText = dom.makeCSSText({
          left: cx - width / 2 + 'px',
          top: cy - height / 2 + 'px',
          width: width + 'px',
          height: height + 'px'
        });
        if (typeof callback === 'function')
          callback();
      };
      img.onerror = function() {
        dom.remove(img);
        alert('Load error!');
      };
      element.appendChild(img);
    },
    createTextElement: function(text) {
      var div = document.createElement('div');
      div.className = 'canvas-element canvas-element-text';
      var textList = text.split('\n');
      for (var i = 0, len = textList.length; i < len; i += 1) {
        var child = document.createElement('div');
        var childText = textList[i];
        if (childText === '')
          child.innerHTML = '&nbsp;';
        else
          child.textContent = childText;
        div.appendChild(child);
      }
      return div;
    },
    appendTextElementWithCenterPosition: function(element, text, cx, cy, fontSize, callback) {
      var div = dom.createTextElement(text);
      div.style.visibility = 'hidden';
      element.appendChild(div);
      var style = getComputedStyle(div, null);
      var width = parseInt(style.width);
      var height = parseInt(style.height);
      if (typeof cx === 'undefined')
        cx = 320;
      if (typeof cy === 'undefined')
        cy = 20 + height / 2;
      div.style.cssText = dom.makeCSSText({
        left: cx - width / 2 + 'px',
        top: cy - height / 2 + 'px',
        'font-size': fontSize + 'px'
      });
      if (typeof callback === 'function')
        callback();
    },
    adjustTargetPosition: function(left, top, width, height) {
      var left = Math.max(left, 20 - width);
      var top = Math.max(top, 20 - height);
      if (left > 620)
        left = 620;
      if (top > 460)
        top = 460;
      return {
        left: left + 'px',
        top: top + 'px'
      };
    },
    setDragMoveEvent: (function() {
      var isTouchEnabled = ('ontouchstart' in window);
      var START = isTouchEnabled ? 'touchstart' : 'mousedown';
      var MOVE = isTouchEnabled ? 'touchmove' : 'mousemove';
      var END = isTouchEnabled ? 'touchend' : 'mouseup';
      return function(element, option) {
        var target, startOffset, targetOffset, targetSize;
        function setTargetPosition(dx, dy) {
          var position = dom.adjustTargetPosition(targetOffset.left + dx,
                                                  targetOffset.top + dy,
                                                  targetSize.width,
                                                  targetSize.height);
          dom.setPosition(target, position);
        }
        function moveListener(event) {
          event.preventDefault();
          event.stopPropagation();
          event = isTouchEnabled ? event.touches[0] : event;
          var dx = event.pageX - startOffset.left;
          var dy = event.pageY - startOffset.top;
          setTargetPosition(dx, dy);
          if (typeof option.drag === 'function')
            option.drag({target: target});
        }
        function endListener(event) {
          event.preventDefault();
          event.stopPropagation();
          if (isTouchEnabled && event.touches.length > 0)
            return;
          event = isTouchEnabled ? event.changedTouches[0] : event;
          document.removeEventListener(MOVE, moveListener, false);
          document.removeEventListener(END, endListener, false);
          var dx = event.pageX - startOffset.left;
          var dy = event.pageY - startOffset.top;
          setTargetPosition(dx, dy);
          if (typeof option.end === 'function')
            option.end({target: target});
        }
        element.addEventListener(START, function(event) {
          target = event.target;
          if (option.handleClass) {
            while (target && !dom.hasClass(target, option.handleClass)) {
              target = target.parentNode;
            }
          }
          if (target === null)
            return;
          targetOffset = {
            left: parseInt(target.style.left),
            top: parseInt(target.style.top)
          };
          var style = getComputedStyle(target, null);
          targetSize = {
            width: parseInt(style.width),
            height: parseInt(style.height)
          };
          event.preventDefault();
          event.stopPropagation();
          event = isTouchEnabled ? event.touches[0] : event;
          startOffset = {left: event.pageX, top: event.pageY};
          if (typeof option.start === 'function')
            option.start({target: target});
          document.addEventListener(MOVE, moveListener, false);
          document.addEventListener(END, endListener, false);
        }, false);
      };
    }()),
    isChild: function(element, parent) {
      do {
        element = element.parentNode;
        if (element === parent)
          return true;
      } while (element && element !== parent);
      return false;
    },
    isTouchEnabled: ('ontouchstart' in window),
    remove: function(element) {
      element.parentNode.removeChild(element);
    },
    isFirstChild: function(element) {
      return element.previousElementSibling === null;
    },
    isLastChild: function(element) {
      return element.nextElementSibling === null;
    },
    up: function(element) {
      var parent = element.parentNode;
      var next = element.nextElementSibling ? element.nextElementSibling.nextElementSibling : null;
      parent.insertBefore(element, next);
    },
    down: function(element) {
      var parent = element.parentNode;
      var next = element.previousElementSibling;
      parent.insertBefore(element, next);
    },
    getPosition: function(element) {
      var style = getComputedStyle(element, null);
      return {
        left: style.left,
        top: style.top
      };
    },
    setPosition: function(element, position) {
      element.style.left = position.left;
      element.style.top = position.top;
    },
    getSize: function(element) {
      var style = getComputedStyle(element, null);
      return {
        width: style.width,
        height: style.height
      };
    },
    setSize: function(element, size) {
      element.style.width = size.width;
      element.style.height = size.height;
    },
    blur: function(element) {
      if (element.blur)
        element.blur();
    },
    setDragEvent: (function() {
      var isTouchEnabled = ('ontouchstart' in window);
      var START = isTouchEnabled ? 'touchstart' : 'mousedown';
      var MOVE = isTouchEnabled ? 'touchmove' : 'mousemove';
      var END = isTouchEnabled ? 'touchend' : 'mouseup';
      return function(element, option) {
        var startOffset;
        function moveListener(event) {
          event.preventDefault();
          event.stopPropagation();
          event = isTouchEnabled ? event.touches[0] : event;
          var dx = event.pageX - startOffset.left;
          var dy = event.pageY - startOffset.top;
          if (typeof option.drag === 'function')
            option.drag(dx, dy);
        }
        function endListener(event) {
          event.preventDefault();
          event.stopPropagation();
          if (isTouchEnabled && event.touches.length > 0)
            return;
          event = isTouchEnabled ? event.changedTouches[0] : event;
          document.removeEventListener(MOVE, moveListener, false);
          document.removeEventListener(END, endListener, false);
          var dx = event.pageX - startOffset.left;
          var dy = event.pageY - startOffset.top;
          if (typeof option.end === 'function')
            option.end(dx, dy);
        }
        element.addEventListener(START, function(event) {
          event.preventDefault();
          event.stopPropagation();
          event = isTouchEnabled ? event.touches[0] : event;
          startOffset = {left: event.pageX, top: event.pageY};
          if (typeof option.start === 'function')
            option.start(startOffset.left, startOffset.top);
          document.addEventListener(MOVE, moveListener, false);
          document.addEventListener(END, endListener, false);
        }, false);
      };
    }()),
    getFontSize: function(element) {
      return element.style.fontSize;
    },
    setFontSize: function(element, size) {
      element.style.fontSize = size;
    },
    children: function(element) {
      return element.children;
    },
    getTextContent: function(element) {
      var children = element.children;
      var text = children[0].textContent;
      for (var i = 1, len = children.length; i < len; i += 1) {
        text = text + '\n' + children[i].textContent;
      }
      return text;
    },
    setTextContent: function(element, text) {
      element.textContent = text;
    },
    appendTextElement: function(element, text, left, top, fontSize) {
      var div = dom.createTextElement(text);
      div.style.cssText = dom.makeCSSText({
        left: left + 'px',
        top: top + 'px',
        'font-size': fontSize + 'px'
      });
      element.appendChild(div);
    },
    appendImageElement: function(element, src, left, top, width, height) {
      var img = dom.createImageElement(src);
      img.style.cssText = dom.makeCSSText({
        left: left + 'px',
        top: top + 'px',
        width: width + 'px',
        height: height + 'px'
      });
      element.appendChild(img);
    },
    setOpacity: function(element, value) {
      element.style.opacity = value;
    },
    setHref: function(element, value) {
      element.setAttribute('href', value);
    },
    setDeleteKeyEvent: function(listener) {
      dom.setEvent(document, 'keyup', function(event) {
        if (event.keyCode === 8) {
          event.preventDefault();
          if (typeof listener === 'function')
            listener(event);
        }
      });
    },
    getScrollTop: function() {
      return document.documentElement.scrollTop || document.body.scrollTop;
    },
    setScrollTop: function(value) {
      document.documentElement.scrollTop = value;
      document.body.scrollTop = value;
    },
    getCanvasElement: function(left, top) {
      var canvasElements = document.getElementsByClassName('canvas-element');
      for (var i = canvasElements.length - 1; i >= 0; i -= 1) {
        var element = canvasElements[i];
        var style = getComputedStyle(element, null);
        var eleft = parseInt(style.left);
        var etop = parseInt(style.top);
        var ewidth = parseInt(style.width);
        var eheight = parseInt(style.height);
        if (eleft <= left && left <= eleft + ewidth &&
            etop  <= top  && top  <= etop  + eheight)
          return element;
      }
      return null;
    }
  };

  window.dom = dom;

  var stringBase = {
    prop: {
      value: {
        'in': function(value) {
          this.element._value = value;
          this.element.updateProperty('isEmpty');
        }
      },
      isEmpty: {
        out: function() {
          return this.element._value === '';
        }
      }
    }
  };

  var textBase = {
    prop: {
      element: {
        'in': function(value) {
          var self = this;
          self.element._element = value;
          var updateText = util.debounce(function() {
            self.element.updateProperty('text');
          }, 1000 / 60);
          dom.setEvent(value, 'keyup', updateText);
          dom.setEvent(value, 'input', updateText);
        }
      },
      text: {
        'in': function(value) {
          dom.setValue(this.element._element, value);
          this.element.updateProperty('text');
        },
        out: function() {
          return dom.getValue(this.element._element);
        }
      }
    },
    event: {
      empty: {
        'in': function() {
          dom.setValue(this.element._element, '');
          this.element.updateProperty('text');
        }
      }
    }
  };

  var buttonBase = {
    prop: {
      element: {
        'in': function(value) {
          var self = this;
          self.element._element = value;
          dom.setEvent(value, 'click', function(event) {
            if (dom.hasClass(value, 'disabled'))
              return;
            self.element.dispatchEvent('click');
          });
        }
      },
      disabled: {
        'in': function(value) {
          if (value) {
            dom.addClass(this.element._element, 'disabled');
          } else {
            dom.removeClass(this.element._element, 'disabled');
          }
        }
      }
    },
    event: {
      click: {
        out: circuit.noop
      }
    }
  };

  var elements = circuit.create({
    prop: {
      textarea: {
        out: function() { return dom.get('textarea'); }
      },
      insertButton: {
        out: function() { return dom.get('insert-button'); }
      },
      canvas: {
        out: function() { return dom.get('canvas'); }
      },
      canvasHandle: {
        out: function() {
          return {
            container: dom.get('canvas-handle-container'),
            element: dom.get('canvas-handle'),
            hitarea: dom.get('canvas-handle-hitarea'),
            deleteButton: dom.get('canvas-handle-delete-button'),
            upButton: dom.get('canvas-handle-up-button'),
            downButton: dom.get('canvas-handle-down-button'),
            sizeHandle: dom.get('canvas-handle-size-handle')
          };
        }
      },
      publishTitleText: {
        out: function() { return dom.get('publish-title-text'); }
      },
      publishButton: {
        out: function() { return dom.get('publish-button'); }
      },
      publishPage: {
        out: function() {
          return {
            element: dom.get('publish-page'),
            loadingSpinner: dom.get('publish-loading-spinner'),
            link: dom.get('publish-link'),
            closeButton: dom.get('publish-close-button')
          };
        }
      }
    }
  });
  var textarea = circuit.create(textBase);
  var textareaString = circuit.create(stringBase);
  var insertButton = circuit.create(buttonBase);
  var canvas = circuit.create({
    prop: {
      element: {
        'in': function(value) {
          var self = this;
          self.element._element = value;
          self.element._insert = function(element, text, x, y, callback) {
            if (text === '') {
              alert('Load error!');
              return;
            }
            if (util.isPlainText(text))
              dom.appendTextElementWithCenterPosition(element, text, x, y, 20, callback);
            else
              dom.appendImageElementWithCenterPosition(element, text, x, y, callback);
          };
          dom.setDropEvent(value, function(data) {
            self.element._insert(value, data.text, data.x, data.y, function() {
              self.element.updateProperty('data');
            });
          });
          dom.setDragMoveEvent(value, {
            handleClass: 'canvas-element',
            start: function(event) {
              var target = event.target;
              self.element._currentTarget = target;
              var handle = self.element._handleElement;
              dom.setPosition(handle.element, dom.getPosition(target));
              self.element._updateHandleHitarea();
              self.element._updateHandleButton();
              self.element._updateSizeHandle();
              dom.removeClass(handle.element, 'hide');
              dom.blur(document.activeElement);
            },
            drag: function(event) {
              var target = event.target;
              var handle = self.element._handleElement;
              dom.setPosition(handle.element, dom.getPosition(target));
            },
            end: function() {
              self.element.updateProperty('data');
            }
          });
          dom.setEvent(document, dom.isTouchEnabled ? 'touchstart' : 'mousedown', function(event) {
            var target = event.target;
            var handle = self.element._handleElement;
            if (!handle)
              return;
            var handleElement = handle.element;
            var handleContainerElement = handle.container;
            if (!dom.isChild(target, handleContainerElement)) {
              dom.addClass(handleElement, 'hide');
              self.element._currentTarget = null;
            }
          });
          dom.setDeleteKeyEvent(function(event) {
            self.element._deleteCurrentTarget();
          });
        }
      },
      input: {
        'in': function(value) {
          this.element._input = value;
        }
      },
      handleElement: {
        'in': function(value) {
          var self = this;
          self.element._handleElement = value;
          self.element._updateHandleHitarea = function() {
            var target = self.element._currentTarget;
            var handle = self.element._handleElement;
            dom.setSize(handle.hitarea, dom.getSize(target));
          };
          self.element._updateHandleButton = function() {
            var target = self.element._currentTarget;
            var handle = self.element._handleElement;
            var upButton = handle.upButton;
            if (dom.isLastChild(target))
              dom.addClass(upButton, 'disabled');
            else
              dom.removeClass(upButton, 'disabled');
            var downButton = handle.downButton;
            if (dom.isFirstChild(target))
              dom.addClass(downButton, 'disabled');
            else
              dom.removeClass(downButton, 'disabled');
          };
          self.element._updateSizeHandle = function() {
            var target = self.element._currentTarget;
            var targetSize = dom.getSize(target);
            var handle = self.element._handleElement;
            dom.setPosition(handle.sizeHandle, {
              left: parseInt(targetSize.width) - 8 + 'px',
              top: parseInt(targetSize.height) - 8 + 'px'
            });
          };
          self.element._deleteCurrentTarget = function() {
            var target = self.element._currentTarget;
            if (!target)
              return;
            dom.remove(target);
            self.element._currentTarget = null;
            var handle = self.element._handleElement;
            var handleElement = handle.element;
            dom.addClass(handleElement, 'hide');
            self.element.updateProperty('data');
          };
          dom.setEvent(value.deleteButton, 'click', self.element._deleteCurrentTarget);
          dom.setEvent(value.upButton, 'click', function() {
            if (dom.hasClass(value.upButton, 'disabled'))
              return;
            var target = self.element._currentTarget;
            dom.up(target);
            self.element._updateHandleButton();
            self.element.updateProperty('data');
          });
          dom.setEvent(value.downButton, 'click', function() {
            if (dom.hasClass(value.downButton, 'disabled'))
              return;
            var target = self.element._currentTarget;
            dom.down(target);
            self.element._updateHandleButton();
            self.element.updateProperty('data');
          });
          dom.setDragEvent(value.sizeHandle, (function() {
            var currentTarget;
            var currentTargetType;
            var currentTargetFontSize;
            var currentTargetChildrenLength;
            var currentTargetSize;
            var currentTargetProportion;
            return {
              start: function(left, top) {
                currentTarget = self.element._currentTarget;
                currentTargetFontSize = parseInt(dom.getFontSize(currentTarget));
                currentTargetChildrenLength = dom.children(currentTarget).length;
                currentTargetSize = dom.getSize(currentTarget);
                currentTargetSize.width = parseInt(currentTargetSize.width);
                currentTargetSize.height = parseInt(currentTargetSize.height);
                currentTargetProportion = currentTargetSize.height / currentTargetSize.width;
                if (dom.hasClass(currentTarget, 'canvas-element-text')) {
                  currentTargetType = 'text';
                } else if (dom.hasClass(currentTarget, 'canvas-element-image')) {
                  currentTargetType = 'image';
                }
                dom.addClass(value.sizeHandle, 'active');
              },
              drag: function(dx, dy) {
                var proportion = dy / dx;
                if (currentTargetProportion > proportion)
                  dx = dy / currentTargetProportion;
                else
                  dy = dx * currentTargetProportion;
                switch (currentTargetType) {
                  case 'text':
                    var fontSize = currentTargetFontSize + dy * 0.85 / currentTargetChildrenLength;
                    if (fontSize < 12)
                      fontSize = 12;
                    dom.setFontSize(currentTarget, fontSize.toFixed(1) + 'px');
                    break;
                  case 'image':
                    var width = currentTargetSize.width + dx;
                    var height = currentTargetSize.height + dy;
                    if (width < 12) {
                      height = 12 * currentTargetProportion;
                      width = 12;
                    }
                    if (height < 12) {
                      width = 12 / currentTargetProportion;
                      height = 12;
                    }
                    dom.setSize(currentTarget, {
                      width: width + 'px',
                      height: height + 'px'
                    });
                    break;
                  default:
                    break;
                }
                self.element._updateHandleHitarea();
                self.element._updateSizeHandle();
              },
              end: function() {
                self.element.updateProperty('data');
                dom.removeClass(value.sizeHandle, 'active');
              }
            };
          }()));
          dom.setDragEvent(value.hitarea, (function() {
            var startOffset, targetSize;
            return {
              start: function(left, top) {
                var target = self.element._currentTarget;
                var targetRect = target.getBoundingClientRect();
                var handle = self.element._handleElement;
                var handlePosition = dom.getPosition(handle.element);
                var clientX = left - targetRect.left + parseInt(handlePosition.left);
                var clientY = top - targetRect.top + parseInt(handlePosition.top) - dom.getScrollTop();
                var canvasElement = dom.getCanvasElement(clientX, clientY);
                if (canvasElement !== null && canvasElement !== target &&
                    0 <= clientX && clientX <= 640 &&
                    0 <= clientY && clientY <= 480) {
                  target = canvasElement;
                  self.element._currentTarget = target;
                  var handle = self.element._handleElement;
                  dom.setPosition(handle.element, dom.getPosition(target));
                  self.element._updateHandleHitarea();
                  self.element._updateHandleButton();
                  self.element._updateSizeHandle();
                }
                startOffset = dom.getPosition(target);
                startOffset.left = parseInt(startOffset.left);
                startOffset.top = parseInt(startOffset.top);
                targetSize = dom.getSize(target);
                targetSize.width = parseInt(targetSize.width);
                targetSize.height = parseInt(targetSize.height);
              },
              drag: function(dx, dy) {
                var target = self.element._currentTarget;
                var size = dom.getSize(target);
                var position = dom.adjustTargetPosition(startOffset.left + dx,
                                                        startOffset.top + dy,
                                                        targetSize.width,
                                                        targetSize.height);
                dom.setPosition(target, position);
                var handle = self.element._handleElement;
                dom.setPosition(handle.element, dom.getPosition(target));
                self.element._updateHandleHitarea();
                self.element._updateHandleButton();
                self.element._updateSizeHandle();
              },
              end: function() {
                self.element.updateProperty('data');
              }
            };
          }()));
        }
      },
      data: {
        'in': function(list) {
          var canvas = this.element._element;
          for (var i = 0, len = list.length; i < len; i += 1) {
            var item = list[i];
            var type = item.type;
            switch (type) {
              case 'text':
                dom.appendTextElement(canvas, item.text, item.left, item.top, item.fontSize);
                break;
              case 'image':
                dom.appendImageElement(canvas, item.src, item.left, item.top, item.width, item.height);
                break;
              default:
                break;
            }
          }
        },
        out: function() {
          var list = [];
          var canvas = this.element._element;
          var children = dom.children(canvas);
          for (var i = 0, len = children.length; i < len; i += 1) {
            var child = children[i];
            if (dom.hasClass(child, 'canvas-element-text')) {
              list.push({
                type: 'text',
                text: dom.getTextContent(child),
                left: parseInt(child.style.left),
                top: parseInt(child.style.top),
                fontSize: parseFloat(child.style.fontSize)
              });
            } else if (dom.hasClass(child, 'canvas-element-image')) {
              list.push({
                type: 'image',
                src: child.getAttribute('src'),
                left: parseInt(child.style.left),
                top: parseInt(child.style.top),
                width: parseInt(child.style.width),
                height: parseInt(child.style.height)
              });
            }
          }
          return list;
        }
      }
    },
    event: {
      insert: {
        'in': function() {
          var self = this, undefined;
          self.element._insert(self.element._element, self.element._input, undefined, undefined, function() {
            self.element.updateProperty('data');
          });
        }
      }
    }
  });
  var publishTitleText = circuit.create(textBase);
  var publishButton = circuit.create(buttonBase);
  var hashController = circuit.create({
    prop: {
      value: {
        out: function() {
          return location.hash.substring(1);
        }
      },
      canvasData: {
        'in': function(value) {
          this.element._canvasData = value;
          this.element._updateHash();
        }
      },
      titleText: {
        'in': function(value) {
          this.element._titleText = value;
          this.element._updateHash();
        }
      },
      initialCanvasData: {
        out: function() {
          var data = this.element._initialHashData();
          return data ? data.data : [];
        }
      },
      initialTitleText: {
        out: function() {
          var data = this.element._initialHashData();
          return data ? data.title : '';
        }
      }
    }
  });
  hashController._updateHash = util.debounce(function() {
    var canvasData = this._canvasData;
    var titleText = this._titleText;
    var hashText = '';
    if (canvasData.length > 0 || titleText) {
      hashText = Base64.encodeURI(JSON.stringify({
        data: canvasData,
        title: titleText
      }));
    }
    if (hashText === '')
      var scroll = dom.getScrollTop();
    location.replace(documentFileName + '#' + hashText);
    if (hashText === '')
      dom.setScrollTop(scroll);
    this.updateProperty('value');
  }, 1000 / 60);
  hashController._initialHashData = (function() {
    var hashText = location.hash.substring(1), data = null;
    if (hashText !== '') {
      try {
        data = JSON.parse(Base64.decode(hashText));
      } catch (e) {
        alert('Load error!');
        var scroll = dom.getScrollTop();
        location.replace(documentFileName + '#');
        dom.setScrollTop(scroll);
      }
    }
    return function() {
      return data;
    };
  }());
  var hashString = circuit.create(stringBase);
  var titleController = circuit.create({
    prop: {
      value: {
        'in': function(value) {
          document.title = (value || '') + ' - OnePage';
        }
      }
    }
  });
  var publishPage = circuit.create({
    prop: {
      element: {
        'in': function(value) {
          var self = this;
          self.element._element = value;
          function hidePage() {
            var element = self.element._element;
            var page = element.element;
            (function amimate(value) {
              value -= 0.1;
              dom.setOpacity(page, value);
              if (value >= 0) {
                setTimeout(function() {
                  amimate(value);
                }, 1000 / 60);
              } else {
                dom.setOpacity(page, 0);
                dom.addClass(page, 'hide');
                dom.addClass(element.loadingSpinner, 'hide');
                dom.addClass(element.link, 'hide');
              }
            }(1));
          }
          dom.setEvent(value.element, 'click', function(event) {
            if (event.target === event.currentTarget)
              hidePage();
          });
          dom.setEvent(value.closeButton, 'click', hidePage);
          self.element._shortenUrl = function(longUrl, callback) {
            (function waitForClientLoad() {
              if (typeof gapi !== 'undefined' && gapi.client && gapi.client.urlshortener) {
                var request = gapi.client.urlshortener.url.insert({
                  'resource': {'longUrl': longUrl}
                });
                request.execute(function(response) {
                  if (response.id != null) {
                    if (typeof callback === 'function') {
                      callback(response.id);
                    }
                  }
                });
              } else {
                window.setTimeout(waitForClientLoad, 10);
              }
            })();
          };
          window.handleClientLoad = function() {
            gapi.client.load('urlshortener', 'v1');
          };
          util.loadScript(CLIENTJS_SCRIPT_URL);
        }
      }
    },
    event: {
      show: {
        'in': function() {
          var self = this;
          var element = self.element._element;
          var page = element.element;
          var shortenUrl = self.element._shortenUrl;
          dom.setOpacity(page, 0);
          dom.removeClass(element.loadingSpinner, 'hide');
          dom.removeClass(page, 'hide');
          (function amimate(value) {
            value += 0.1;
            dom.setOpacity(page, value);
            if (value <= 1.0) {
              setTimeout(function() {
                amimate(value);
              }, 1000 / 60);
            } else {
              dom.setOpacity(page, 1);
              var locs = location.href.split('/');
              locs[locs.length - 1] = 'viewer.html' + location.hash;
              shortenUrl(locs.join('/'), function(url) {
                var element = self.element._element;
                var linkElement = element.link;
                dom.setHref(linkElement, url);
                dom.setTextContent(linkElement, url);
                dom.addClass(element.loadingSpinner, 'hide');
                dom.removeClass(linkElement, 'hide');
              });
            }
          }(0));
        }
      }
    }
  });

  function initializeApp() {
    documentFileName = 'index.html';
    circuit.connect(elements.prop.textarea, textarea.prop.element);
    circuit.connect(elements.prop.insertButton, insertButton.prop.element);
    circuit.connect(elements.prop.canvas, canvas.prop.element);
    circuit.connect(elements.prop.canvasHandle, canvas.prop.handleElement);
    circuit.connect(elements.prop.publishTitleText, publishTitleText.prop.element);
    circuit.connect(elements.prop.publishButton, publishButton.prop.element);
    circuit.connect(elements.prop.publishPage, publishPage.prop.element);

    circuit.connect(textarea.prop.text, textareaString.prop.value);
    circuit.connect(textareaString.prop.isEmpty, insertButton.prop.disabled);

    circuit.connect(textarea.prop.text, canvas.prop.input);
    circuit.connect(insertButton.event.click, canvas.event.insert);
    circuit.connect(insertButton.event.click, textarea.event.empty);

    circuit.connect(hashController.prop.initialCanvasData, canvas.prop.data);
    circuit.connect(hashController.prop.initialTitleText, publishTitleText.prop.text);

    circuit.connect(canvas.prop.data, hashController.prop.canvasData);
    circuit.connect(publishTitleText.prop.text, hashController.prop.titleText);

    circuit.connect(hashController.prop.value, hashString.prop.value);
    circuit.connect(hashString.prop.isEmpty, publishButton.prop.disabled);

    circuit.connect(publishButton.event.click, publishPage.event.show);
  }

  function initializeViewer() {
    documentFileName = 'viewer.html';
    circuit.connect(elements.prop.canvas, canvas.prop.element);
    circuit.connect(hashController.prop.initialCanvasData, canvas.prop.data);
    circuit.connect(hashController.prop.initialTitleText, titleController.prop.value);
  }

  window.onepage = {
    app: {initialize: initializeApp},
    viewer: {initialize: initializeViewer}
  };

}(this));