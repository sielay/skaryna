(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _index = require('./index');

var _editor = require('./editor');

var _repository = require('./repository');

var _xhr = require('./xhr');

/* jslint esnext:true, node:true, browser:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

_index.Skaryna.Editor = _editor.Editor;
_index.Skaryna.repository = _repository.repository;
_index.Skaryna.XHR = _xhr.XHR;

window.Skaryna = _index.Skaryna;

if (Array.isArray(window.___Skaryna)) {
    window.___Skaryna.forEach(function (callback) {
        callback.apply(window);
    });
}

},{"./editor":3,"./index":5,"./repository":10,"./xhr":15}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Variants = exports.Fields = exports.StaticBlockNode = exports.Heading = exports.Image = exports.Paragraph = exports.TextNode = exports.Quote = exports.Document = exports.BlockNode = exports.Node = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.escapeRegexp = escapeRegexp;
exports.bestMatch = bestMatch;
exports.getById = getById;
exports.getByNode = getByNode;
exports.randomID = randomID;

var _emitter = require('./emitter');

var _util = require('./util');

var _toHTML = require('./serializer/toHTML');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var elementMap = {};

/**
 * @see https://github.com/component/escape-regexp
 * @param   {string} str
 * @returns {string}
 */
function escapeRegexp(str) {
    return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
}

/**
 * @see https://github.com/sielay/bestmatch
 * @param   {array} list
 * @param   {string}   filter
 * @returns {string}
 */
function bestMatch(list, filter) {
    var lowest = null,
        best;

    list.forEach(function (rule) {
        var regexp = new RegExp(escapeRegexp(rule).replace(/\\\*/g, '(.+)')),
            weight = rule.split('*').filter(function (part) {
            return part.length;
        }).length,
            match = filter.match(regexp);

        if (match && (lowest === null || match.length - weight < lowest)) {
            lowest = match.length - weight;
            best = rule;
        }
    });
    return best;
}

function getById(id) {
    return elementMap[id];
}

function getByNode(element) {
    if (!element) {
        return null;
    }
    var id = element.getAttribute('data-skaryna-id');
    return getById(id);
}

function randomID(setValue) {
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
        text = '';

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    if (Object.keys(elementMap).indexOf(text) === -1) {
        elementMap[text] = elementMap[text] || setValue;
        return text;
    }
    return randomID(setValue);
}

/**
 * @class
 */

var Node = exports.Node = function (_Emitter) {
    _inherits(Node, _Emitter);

    /**
     * @constructs Node
     */

    function Node() {
        _classCallCheck(this, Node);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Node).call(this));

        _this.name = randomID(_this);

        _this.__locked = false;
        return _this;
    }

    _createClass(Node, [{
        key: 'lock',
        value: function lock() {
            this.__locked = true;
        }
    }, {
        key: 'attr',
        value: function attr() {
            return this.attrs;
        }
    }, {
        key: 'get',
        value: function get() {
            throw new Error('Should be implemented');
        }

        /**
         * @abstract
         * @throws {Error}
         */

    }, {
        key: 'toJSON',
        value: function toJSON() {
            var error = new Error('Should be implemented');
            throw error;
        }
    }, {
        key: 'locked',
        get: function get() {
            return this.__locked;
        }
    }, {
        key: 'defaultNewItem',
        get: function get() {
            return null;
        }
    }, {
        key: 'allowedNewItems',
        get: function get() {
            return [];
        }
    }]);

    return Node;
}(_emitter.Emitter);

/**
 * @class
 * Defined for Image, Video, Embed, Table, HorizonalRule, Table, List or Component
 */


var BlockNode = exports.BlockNode = function (_Node) {
    _inherits(BlockNode, _Node);

    function BlockNode(type, items, attrs) {
        _classCallCheck(this, BlockNode);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(BlockNode).call(this));

        _this2._type = type;
        _this2.items = items || [];
        _this2.attrs = attrs;
        return _this2;
    }

    _createClass(BlockNode, [{
        key: 'get',
        value: function get(path) {
            var elements = path.split('.'),
                index = elements.shift(),
                rest = elements.join('.'),
                child = void 0;

            if (isNaN(index)) {
                return null;
            }

            child = this.items[+index];

            if (rest.length && child) {
                return child.get(rest);
            }

            return child;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var output = {
                type: this.type,
                items: this.items.map(function (item) {
                    return item.toJSON();
                })
            };
            if (this.attrs) {
                output.attrs = JSON.parse(JSON.stringify(this.attrs));
            }
            return output;
        }
    }, {
        key: 'decorate',
        value: function decorate(element) {
            return (0, _toHTML.toHTML)(this, {
                edit: true
            }).then(function (html) {
                element.innerHTML = '';
                (0, _util.arraize)(html.children).forEach(function (child) {
                    element.appendChild(child);
                });
            });
        }
    }, {
        key: 'empty',
        get: function get() {
            return this.items.length <= 0;
        }
    }, {
        key: 'type',
        get: function get() {
            return this._type;
        }
    }]);

    return BlockNode;
}(Node);

var Document = exports.Document = function (_BlockNode) {
    _inherits(Document, _BlockNode);

    function Document(items) {
        _classCallCheck(this, Document);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Document).call(this, 'document', items));
    }

    _createClass(Document, [{
        key: 'defaultNewItem',
        get: function get() {
            return Paragraph;
        }
    }, {
        key: 'allowedNewItems',
        get: function get() {
            return [Paragraph, Image];
        }
    }]);

    return Document;
}(BlockNode);

var Quote = exports.Quote = function (_BlockNode2) {
    _inherits(Quote, _BlockNode2);

    function Quote(items) {
        _classCallCheck(this, Quote);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Quote).call(this, 'quote', items));
    }

    return Quote;
}(BlockNode);

/**
 * @class
 * Defined for Text, Paragraph, ListItem, Quote and Heading
 */


var TextNode = exports.TextNode = function (_Node2) {
    _inherits(TextNode, _Node2);

    _createClass(TextNode, [{
        key: 'attr',
        value: function attr() {
            if (this.type === 'text') {
                return {};
            }
            return _get(Object.getPrototypeOf(TextNode.prototype), 'attr', this).call(this);
        }
    }, {
        key: 'type',
        get: function get() {
            return 'text';
        }
    }, {
        key: 'empty',
        get: function get() {
            return !this.text || !this.text.replace(/^([\s\n\r\t]+)|([\s\n\r\t]+)$/, '').length;
        }
    }, {
        key: 'absoluteEmpty',
        get: function get() {
            return this.text.length === 0;
        }
    }], [{
        key: 'type',
        get: function get() {
            return 'text';
        }
    }]);

    function TextNode(text, formats, attrs) {
        _classCallCheck(this, TextNode);

        var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(TextNode).call(this));

        _this5.text = text && text.toString ? text.toString() : '';
        _this5.formats = formats || null;
        _this5.attrs = attrs;
        return _this5;
    }

    _createClass(TextNode, [{
        key: 'toJSON',
        value: function toJSON() {
            var output = {
                type: this.type,
                text: this.text
            };
            if (this.formats) {
                output.formats = JSON.parse(JSON.stringify(this.formats));
            }
            if (this.attrs && this.type !== 'text') {
                output.attrs = JSON.parse(JSON.stringify(this.attrs));
            }
            return output;
        }
    }, {
        key: 'append',
        value: function append(node) {
            var _this6 = this;

            if (!(node instanceof TextNode)) {
                throw new Error('Only text nodes can be joined');
            }
            if (node.formats) {
                this.formats = this.formats || [];
                node.formats.forEach(function (format) {
                    _this6.formats.push({
                        slice: [format.slice[0] + _this6.text.length, format.slice[1]],
                        apply: format.apply
                    });
                });
            }
            this.text += node.text;
        }
    }, {
        key: 'decorate',
        value: function decorate(element) {
            return (0, _toHTML.toHTML)(this, {
                edit: true
            }).then(function (html) {
                element.innerHTML = html.textContent;
            });
        }
    }]);

    return TextNode;
}(Node);

var Paragraph = exports.Paragraph = function (_TextNode) {
    _inherits(Paragraph, _TextNode);

    _createClass(Paragraph, [{
        key: 'type',
        get: function get() {
            return 'paragraph';
        }
    }], [{
        key: 'type',
        get: function get() {
            return 'paragraph';
        }
    }]);

    function Paragraph(text, formats, attrs) {
        _classCallCheck(this, Paragraph);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Paragraph).call(this, text, formats, attrs));
    }

    _createClass(Paragraph, [{
        key: 'nextNodeType',
        get: function get() {
            return Paragraph;
        }
    }]);

    return Paragraph;
}(TextNode);

var Image = exports.Image = function (_Node3) {
    _inherits(Image, _Node3);

    function Image(source, title, alt) {
        _classCallCheck(this, Image);

        var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(Image).call(this, 'image'));

        _this8.src = source;
        _this8.title = title;
        _this8.alt = alt;
        return _this8;
    }

    _createClass(Image, [{
        key: 'attr',
        value: function attr() {
            var attributes = _get(Object.getPrototypeOf(Image.prototype), 'attr', this).call(this) || {};
            if (this.src) {
                attributes.src = this.src;
            }
            if (this.title) {
                attributes.title = this.title;
            }
            if (this.alt) {
                attributes.alt = this.title;
            }
            return attributes;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var output = {
                type: 'image',
                src: this.src
            };
            if (this.title) {
                output.title = this.title;
            }
            if (this.alt) {
                output.alt = this.alt;
            }
            return output;
        }
    }, {
        key: 'type',
        get: function get() {
            return 'image';
        }
    }], [{
        key: 'type',
        get: function get() {
            return 'image';
        }
    }]);

    return Image;
}(Node);

var Heading = exports.Heading = function (_TextNode2) {
    _inherits(Heading, _TextNode2);

    function Heading(level, text, formats, attrs) {
        _classCallCheck(this, Heading);

        var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(Heading).call(this, text, formats, attrs));

        _this9.level = Math.min(6, level || 0);
        return _this9;
    }

    _createClass(Heading, [{
        key: 'attr',
        value: function attr() {
            return _get(Object.getPrototypeOf(Heading.prototype), 'attr', this).call(this);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var json = _get(Object.getPrototypeOf(Heading.prototype), 'toJSON', this).call(this);
            json.level = this.level;
            return json;
        }
    }, {
        key: 'type',
        get: function get() {
            return 'heading';
        }
    }], [{
        key: 'type',
        get: function get() {
            return 'heading';
        }
    }]);

    return Heading;
}(TextNode);

var StaticBlockNode = exports.StaticBlockNode = function (_BlockNode3) {
    _inherits(StaticBlockNode, _BlockNode3);

    function StaticBlockNode() {
        _classCallCheck(this, StaticBlockNode);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StaticBlockNode).apply(this, arguments));
    }

    _createClass(StaticBlockNode, [{
        key: 'locked',
        get: function get() {
            return true;
        }
    }, {
        key: 'defaultNewItem',
        get: function get() {
            return Paragraph;
        }
    }, {
        key: 'allowedNewItems',
        get: function get() {
            return [Paragraph, Image];
        }
    }]);

    return StaticBlockNode;
}(BlockNode);

var Fields = exports.Fields = function (_Node4) {
    _inherits(Fields, _Node4);

    function Fields(data) {
        _classCallCheck(this, Fields);

        var _this11 = _possibleConstructorReturn(this, Object.getPrototypeOf(Fields).call(this));

        _this11._map = data;
        return _this11;
    }

    _createClass(Fields, [{
        key: 'get',
        value: function get(path) {
            var elements = path.split('.'),
                index = elements.shift(),
                rest = elements.join('.'),
                child = void 0;

            child = this._map[index];

            if (rest.length && child) {
                return child.get(rest);
            }

            return child;
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _util.clone)([this._map, {
                type: 'Fields'
            }]);
        }
    }, {
        key: 'type',
        get: function get() {
            return 'Fields';
        }
    }], [{
        key: 'type',
        get: function get() {
            return 'Fields';
        }
    }]);

    return Fields;
}(Node);

var Variants = exports.Variants = function (_Node5) {
    _inherits(Variants, _Node5);

    function Variants(data) {
        _classCallCheck(this, Variants);

        var _this12 = _possibleConstructorReturn(this, Object.getPrototypeOf(Variants).call(this));

        _this12._variants = data;
        return _this12;
    }

    _createClass(Variants, [{
        key: 'best',
        value: function best(variant) {
            var best = bestMatch(Object.keys(this._variants), variant);
            return this._variants[best];
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            return (0, _util.clone)([this._map, {
                type: 'Variants'
            }]);
        }
    }, {
        key: 'type',
        get: function get() {
            return 'Variants';
        }
    }], [{
        key: 'type',
        get: function get() {
            return 'Variants';
        }
    }]);

    return Variants;
}(Node);

},{"./emitter":4,"./serializer/toHTML":12,"./util":14}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Editor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _emitter = require('./emitter');

var _util = require('./util');

var _repository = require('./repository');

var _toHTML = require('./serializer/toHTML');

var _fromHTML = require('./parser/fromHTML');

var _fromPOM = require('./parser/fromPOM');

var _xhr = require('./xhr');

var _document = require('./document');

var _toolbar = require('./toolbar');

var _injector = require('./injector');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* jslint esnext:true, node:true, browser:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var BACKSPACE = 8,
    TAB = 9,
    ENTER = 13,
    SHIFT = 16,
    CAPS = 20,
    ESC = 27,
    SPACE = 32,
    UP = 38,
    DOWN = 40,
    DELETE = 46,
    PREVENT = [ENTER];

var toolbar = new _toolbar.Toolbar(),
    injector = void 0;

/**
 * @class
 */

var Editor = exports.Editor = function (_Emitter) {
    _inherits(Editor, _Emitter);

    _createClass(Editor, null, [{
        key: 'factory',


        /**
         * [[Description]]
         * @param {HTMLElement} element
         * @returns {Promise} [[Description]]
         */
        value: function factory(element) {
            var editor = new Editor(element);
            return editor.inited;
        }

        /**
         * [[Description]]
         * @param {HTMLElement} element
         * @returns {Promise} [[Description]]
         */

    }, {
        key: 'initEditors',
        value: function initEditors(element) {
            return Promise.all((0, _util.arraize)(element.querySelectorAll('[data-skaryna]')).map(function (element) {
                return Editor.factory(element);
            }));
        }

        /**
         * [[Description]]
         * @param {Object} documentBody [[Description]]
         * @param {[[Type]]} documentId   [[Description]]
         */

    }, {
        key: 'registerDocument',
        value: function registerDocument(documentBody, documentId) {
            _repository.repository.set(documentId || _repository.DEFAULT_DOCUMENT, documentBody);
        }

        /**
         * Loads data from REST endpoint
         * @param   {string} path
         * @param   {string} documentId
         * @returns {Promise}
         */

    }, {
        key: 'load',
        value: function load(path, documentId) {
            return _xhr.XHR.get(path).then(function (content) {
                return (0, _fromPOM.fromPOM)(JSON.parse(content));
            }).then(function (content) {
                _repository.repository.set(documentId || _repository.DEFAULT_DOCUMENT, content);
            });
        }

        /**
         * @param {HTMLElement} element
         */

    }]);

    function Editor(element) {
        _classCallCheck(this, Editor);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Editor).call(this));

        _this.element = element;
        _this.documentPath = element.getAttribute('data-skaryna-path') || null;
        _this.document = element.getAttribute('data-skaryna-doc') || _repository.DEFAULT_DOCUMENT;
        _this.variant = element.getAttribute('data-skaryna-variant') || null;

        _this._pendingState = null;
        _this._rendering = false;

        _this.init();

        return _this;
    }

    /**
     * Inits component
     * @returns {Promise}
     */


    _createClass(Editor, [{
        key: 'init',
        value: function init() {
            var self = this;
            if (this.inited) {
                return this.inited;
            }
            this.inited = (0, _fromHTML.fromHTML)(this.element, {
                edit: true
            }).then(function (content) {
                content.lock();
                if (_repository.repository.has(self.document)) {
                    var doc = _repository.repository.get(self.document);
                    if (self.documentPath) {
                        doc = doc.get(self.documentPath);
                        if (doc && doc.type === 'Variants' && doc.best) {
                            doc = doc.best(self.variant || '*');
                        }
                    }
                    self.content = doc;
                } else if (!content.empty) {
                    _repository.repository.set(self.document, content);
                    self.content = content;
                }
            }).then(function () {
                self.render();
            }).catch(function (error) {
                console.log(error);
                console.log(error.stack);
            });
        }
    }, {
        key: 'getCaretCharacterOffsetWithin',
        value: function getCaretCharacterOffsetWithin(element) {
            var caretOffset = 0,
                doc = element.ownerDocument || element.document,
                win = doc.defaultView || doc.parentWindow,
                sel = void 0;
            if (typeof win.getSelection != 'undefined') {
                sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    var range = win.getSelection().getRangeAt(0),
                        preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(element);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    caretOffset = preCaretRange.toString().length;
                }
            } else if ((sel = doc.selection) && sel.type != 'Control') {
                var textRange = sel.createRange(),
                    preCaretTextRange = doc.body.createTextRange();
                preCaretTextRange.moveToElementText(element);
                preCaretTextRange.setEndPoint('EndToEnd', textRange);
                caretOffset = preCaretTextRange.text.length;
            }
            return caretOffset;
        }
    }, {
        key: 'getSelectionLength',
        value: function getSelectionLength(element) {}
    }, {
        key: 'getCurrentElement',
        value: function getCurrentElement(element) {

            var doc = element.ownerDocument || element.document,
                win = doc.defaultView || doc.parentWindow,
                sel = void 0,
                node = void 0;

            if (typeof win.getSelection != 'undefined') {
                sel = win.getSelection();
            } else {
                sel = doc.selection;
            }

            node = sel.focusNode;

            if (node === this.element) {
                return this.element;
            }
            return this.getEditableNode(node);
        }
    }, {
        key: 'getEditableNode',
        value: function getEditableNode(node) {
            while (node && (!node.hasAttribute || !node.hasAttribute('data-skaryna-id'))) {
                node = node.parentNode;
            }
            return node;
        }
    }, {
        key: 'onDOM',
        value: function onDOM(selectorORElement, eventName, myMethod) {
            var self = this;
            if (selectorORElement instanceof HTMLElement) {
                selectorORElement = [selectorORElement];
            } else {
                selectorORElement = (0, _util.arraize)(this.element.querySelectorAll(selectorORElement));
            }
            selectorORElement.forEach(function (element) {
                element.addEventListener(eventName, function (event) {
                    myMethod.apply(self, [event]);
                }, true);
            });
        }

        /**
         * Renders UI
         * @returns {Promise}
         */

    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            this._rendering = true;
            var self = this,
                promise = void 0;

            if (!this.content) {
                this._rendering = false;
                promise = Promise.resolve();
            } else {
                promise = this.content.decorate(this.element).then(function () {
                    _this2._rendering = false;
                });
            }

            return promise.then(function () {
                self.element.setAttribute('data-skaryna-id', self.content ? self.content.name : (0, _document.randomID)(true));
                self.element.setAttribute('contentEditable', '');
                self.element.addEventListener('keydown', function (event) {
                    self.onKeyUp(event);
                }, true);
                self.onDOM('[data-skaryna-id]', 'mouseup', self.focus);
                self.onDOM(self.element, 'mouseup', self.focus);
                /*
                    self.element.addEventListener('mouseup', (event) => {
                        let sel = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
                        if (sel && sel.length) {
                            self.onSelect(event);
                        }
                    }, true);*/
            });
        }
    }, {
        key: 'onSelect',
        value: function onSelect(event) {

            /*this.showToolbar();
            this.strong();*/
        }
    }, {
        key: 'showToolbar',
        value: function showToolbar() {
            toolbar.anchor();
        }
    }, {
        key: 'focus',
        value: function focus(event) {
            var _this3 = this;

            var node = this.getEditableNode(event.target),
                focusedNode = (0, _document.getByNode)(node),
                parentNode = (0, _document.getByNode)(node.parentNode),
                newItems = void 0,
                injectorObject = void 0;

            newItems = parentNode ? parentNode.allowedNewItems : focusedNode.allowedNewItems;

            this.hideInjector();

            if (newItems.length > 0) {
                if (!parentNode) {
                    injectorObject = this.showInjector(node.parentNode.lastChild, newItems);
                } else {
                    injectorObject = this.showInjector(node, newItems);
                }
                injectorObject.on('injectnode', function (event) {
                    if (parentNode) {
                        var index = parentNode.items.indexOf(focusedNode);
                        parentNode.items.splice(index, 0, new event.data());
                    } else {
                        parentNode.items.push(new event.data());
                    }
                    _this3.render();
                });
            }
        }
    }, {
        key: 'showInjector',
        value: function showInjector(afterNode, possibleItems) {
            var injectorObject = new _injector.Injector(possibleItems),
                box = afterNode.getBoundingClientRect(),
                injectorBox = void 0;

            injector = injectorObject.element;
            document.body.appendChild(injector);
            setTimeout(function () {
                injectorBox = injector.getBoundingClientRect();
                injector.style.top = box.top + 'px';
                injector.style.left = box.left - injectorBox.width + 'px';
            }, 0);
            return injectorObject;
        }
    }, {
        key: 'hideInjector',
        value: function hideInjector() {
            if (injector) {
                if (injector.parentNode) {
                    injector.parentNode.removeChild(injector);
                }
                injector = null;
            }
        }
    }, {
        key: 'strong',
        value: function strong() {
            var textNode = this.getCurrentElement(event.target),
                sel = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text,
                to = sel.length,
                from = this.getCaretCharacterOffsetWithin(textNode) - to;

            (0, _fromHTML.fromHTML)(textNode).then(function (POM) {
                POM.formats = POM.formats || [];
                POM.formats.push({
                    slice: [from, to],
                    apply: ['strong']
                });
                return (0, _toHTML.toHTML)(POM);
            }).then(function (HTML) {
                textNode.innerHTML = HTML.innerHTML;
            });
        }

        /**
         * Handles external change
         * @param {object} event
         */

    }, {
        key: 'onExternalChange',
        value: function onExternalChange(event) {
            if (this._rendering) {
                this._pendingState = true;
                return;
            }
            this.render();
        }
    }, {
        key: 'newItem',
        value: function newItem(target) {
            var currentTarget = target,
                node = (0, _document.getByNode)(currentTarget),
                self = this;
            while (node !== null) {
                if (!node) {
                    return;
                }
                if (node.defaultNewItem) {
                    var newElement = new node.defaultNewItem();
                    node.items.push(newElement);

                    (0, _toHTML.toHTML)(newElement, {
                        edit: true
                    }).then(function (htmlElement) {
                        currentTarget.appendChild(htmlElement);
                        self.editNode(htmlElement);
                    });
                    return;
                }
                currentTarget = currentTarget.parentNode;
                node = (0, _document.getByNode)(currentTarget);
            }
        }
    }, {
        key: 'editNode',
        value: function editNode(node) {
            var range = document.createRange(),
                sel = window.getSelection();
            range.setStart(node, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, {
        key: 'ownAction',
        value: function ownAction(key, target) {
            if (key === ENTER) {
                return this.newItem(target);
            }
        }

        /**
         * Handles key up event
         * @param {Event} event
         */

    }, {
        key: 'onKeyUp',
        value: function onKeyUp(event) {

            if (PREVENT.indexOf(event.keyCode) !== -1) {
                event.stopPropagation();
                event.preventDefault();
                this.ownAction(event.keyCode, this.getCurrentElement(event.target));
            }
        }
    }]);

    return Editor;
}(_emitter.Emitter);

var styles = document.createElement('style');
styles.innerText = '\n        p[data-skaryna-id]:empty {\n                display: block;\n                height: 1em;\n            }\n        }\n        ';

document.body.appendChild(styles);

},{"./document":2,"./emitter":4,"./injector":6,"./parser/fromHTML":8,"./parser/fromPOM":9,"./repository":10,"./serializer/toHTML":12,"./toolbar":13,"./util":14,"./xhr":15}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

/**
 * @namespace skaryna
 *
 * @class EventConfig
 * @property {function} fn listener
 * @property {object} context
 * @property {array} args arguments to be passed
 * @property {boolean} once if should be fired only once
 */

/**
 * @class Event
 */

var Event = exports.Event = function () {
    /**
     * Contructor
     * @constructs Event
     * @param {string} name
     * @param {mixed} data
     * @param {object} source
     * @param {Event} parent
     */

    function Event(name, data, source, parent) {
        _classCallCheck(this, Event);

        Object.defineProperties(this, {
            /**
             * @property {string}
             * @name Event#name
             */
            name: {
                value: name,
                writable: false
            },
            /**
             * @property {mixed}
             * @name Event#data
             */
            data: {
                value: data,
                writable: false
            },
            /**
             * @property {object}
             * @name Event#source
             */
            source: {
                value: source,
                writable: false
            },
            /**
             * @property {Event|null}
             * @name Event#parent
             */
            parent: {
                value: parent,
                writable: false
            }
        });
    }

    _createClass(Event, [{
        key: 'toJSON',
        value: function toJSON() {
            return {
                name: this.name,
                data: this.data,
                source: this.source,
                parent: this.parent
            };
        }
    }, {
        key: 'toString',
        value: function toString() {
            return 'Event: ' + JSON.stringify(this.toJSON());
        }
    }]);

    return Event;
}();

/**
 * [[Description]]
 * @param {Event} cofnig
 * @param {EventConfig} thisObject
 */


function execute(event, config) {
    var fn = config.fn;
    var context = config.context;
    var args = config.args;
    var params = [event].concat(args);

    fn.apply(context || null, params);
}

/*
 * @class Emitter
 */

var Emitter = exports.Emitter = function () {
    function Emitter() {
        _classCallCheck(this, Emitter);
    }

    _createClass(Emitter, [{
        key: 'on',


        /**
         * Adds listener for an event
         * @param {string} eventName
         * @param {function} handler
         * @param {object} context
         * @param {array} args
         * @param {boolean} once
         */
        value: function on(eventName, handler, context, args, once) {
            this.__listeners = this.__listeners || {};
            this.__listeners[eventName] = this.__listeners[eventName] || [];
            this.__listeners[eventName].push({
                fn: handler,
                context: context,
                args: args,
                once: !!once
            });
        }

        /**
         * Adds listener for an event that should be called once
         * @param {string} eventName
         * @param {function} handler
         * @param {object} context
         * @param {array} args
         */

    }, {
        key: 'once',
        value: function once(eventName, handler, context, args) {
            this.on(eventName, handler, context, args, true);
        }

        /**
         * Adds listener for an event
         * @param {string} eventName
         * @param {function} handler
         * @param {object} context
         * @param {array} args
         * @param {boolean} once
         */

    }, {
        key: 'off',
        value: function off(eventName, handler, context, args, once) {
            var _this = this;

            if (!this.__listeners || !this.__listeners[eventName]) {
                return;
            }
            this.getListeners(eventName, handler, context, args, once).forEach(function (config) {
                _this.__listeners[eventName].splice(_this.__listeners[eventName].indexOf(config), 1);
            });
        }

        /**
         * Emits an event
         * @param {string} eventName
         * @param {mixed} data
         * @param {Event|null} parent
         */

    }, {
        key: 'emit',
        value: function emit(eventName, data, parent) {
            if (!this.__listeners || !this.__listeners[eventName]) {
                return;
            }

            var self = this,
                event = new Event(eventName, data, this, parent);

            this.getListeners(eventName).forEach(function (config) {
                if (config.once === true) {
                    self.off(eventName, config.fn, config.context, config.args, config.once);
                }
                execute(event, config);
            });
        }

        /**
         * Bubbles event to other emitter
         * @param {string} eventName
         * @param {object} toEmitter
         */

    }, {
        key: 'bubbleEvent',
        value: function bubbleEvent(eventName, toEmitter) {
            this.on(eventName, function (event) {
                toEmitter.emit(eventName, event.data, event);
            });
        }

        /**
         * Gets all listeners that match criteria
         * @param   {string} eventName required
         * @param   {function} handler   if defined will be used for match
         * @param   {object} context   if defined will be used for match
         * @param   {array} args      if defined will be used for match
         * @returns {array<EventConfig>|null}
         */

    }, {
        key: 'getListeners',
        value: function getListeners(eventName, handler, context, args) {
            if (!this.__listeners || !this.__listeners[eventName]) {
                return null;
            }

            return this.__listeners[eventName].map(function (config) {
                if (handler !== undefined && config.fn !== handler) {
                    return false;
                }
                if (context !== undefined && config.context !== context) {
                    return false;
                }
                if (args !== undefined && config.args !== args) {
                    return false;
                }
                return config;
            }).filter(function (result) {
                return !!result;
            });
        }
    }]);

    return Emitter;
}();

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _emitter = require('./emitter');

Object.defineProperty(exports, 'Event', {
    enumerable: true,
    get: function get() {
        return _emitter.Event;
    }
});
Object.defineProperty(exports, 'Emitter', {
    enumerable: true,
    get: function get() {
        return _emitter.Emitter;
    }
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Skaryna = exports.Skaryna = function Skaryna() {
    _classCallCheck(this, Skaryna);
};

},{"./emitter":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Injector = undefined;

var _emitter = require('./emitter');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* jslint esnext:true, node:true, browser:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/


var styles = void 0;

var SVGS = {
    paragraph: 'M832 320v704q0 104-40.5 198.5t-109.5 163.5-163.5 109.5-198.5 40.5h-64q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h64q106 0 181-75t75-181v-32q0-40-28-68t-68-28h-224q-80 0-136-56t-56-136v-384q0-80 56-136t136-56h384q80 0 136 56t56 136zm896 0v704q0 104-40.5 198.5t-109.5 163.5-163.5 109.5-198.5 40.5h-64q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h64q106 0 181-75t75-181v-32q0-40-28-68t-68-28h-224q-80 0-136-56t-56-136v-384q0-80 56-136t136-56h384q80 0 136 56t56 136z',
    image: 'M576 576q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm1024 384v448h-1408v-192l320-320 160 160 512-512zm96-704h-1600q-13 0-22.5 9.5t-9.5 22.5v1216q0 13 9.5 22.5t22.5 9.5h1600q13 0 22.5-9.5t9.5-22.5v-1216q0-13-9.5-22.5t-22.5-9.5zm160 32v1216q0 66-47 113t-113 47h-1600q-66 0-113-47t-47-113v-1216q0-66 47-113t113-47h1600q66 0 113 47t47 113z',
    dimensions: '0 0 1792 1792'
};

var Injector = exports.Injector = function (_Emitter) {
    _inherits(Injector, _Emitter);

    function Injector(allowedNodes) {
        _classCallCheck(this, Injector);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Injector).call(this));

        var self = _this,
            div = document.createElement('div');

        div.innerHTML = '<div data-skaryna-tooltip="left"><div></div><div></div></div>';

        _this.element = div.firstChild;

        allowedNodes.forEach(function (node) {
            var action = document.createElement('a'),
                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            svg.setAttribute('width', 30);
            svg.setAttribute('height', 30);
            svg.setAttribute('viewBox', SVGS.dimensions);
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            path.setAttribute('d', SVGS[node.type]);
            path.setAttribute('fill', '#fff');

            svg.appendChild(path);
            action.appendChild(svg);

            action.addEventListener('mousedown', function (event) {
                event.preventDefault();
                event.stopPropagation();
                console.log(node);
                self.emit('injectnode', node);
            }, true);
            _this.element.children[1].appendChild(action);
        });

        if (!styles) {
            styles = document.createElement('style');
            styles.innerText = '\n        [data-skaryna-tooltip] {\n            position: absolute;\n            z-index: 1070;\n            display: block;\n            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n            font-size: 12px;\n            font-style: normal;\n            font-weight: 400;\n            line-height: 1.42857143;\n            text-align: left;\n            text-align: start;\n            text-decoration: none;\n            text-shadow: none;\n            text-transform: none;\n            letter-spacing: normal;\n            word-break: normal;\n            word-spacing: normal;\n            word-wrap: normal;\n            white-space: normal;\n            /*filter: alpha(opacity=0);\n            opacity: 0;*/\n            line-break: auto;\n            transition: opacity 0.5s;\n        }\n        [data-skaryna-tooltip] div:nth-child(2) {\n            max-width: 200px;\n            padding: 3px 8px;\n            color: #fff;\n            text-align: center;\n            background-color: #000;\n            border-radius: 4px;\n        }\n        [data-skaryna-tooltip] div:nth-child(1) {\n            position: absolute;\n            width: 0;\n            height: 0;\n            border-color: transparent;\n            border-style: solid;\n        }\n        [data-skaryna-tooltip="left"] {\n            padding: 0 5px;\n            margin-left: -3px;\n        }\n        [data-skaryna-tooltip="top"] {\n            padding: 5px 0;\n            margin-top: -3px;\n        }\n        [data-skaryna-tooltip="bottom"] {\n            padding: 5px 0;\n            margin-top: 3px;\n        }\n        [data-skaryna-tooltip="right"] {\n            padding: 0 5px;\n            margin-left: 3px;\n        }\n        [data-skaryna-tooltip="left"] div:nth-child(1) {\n            top: 50%;\n            right: 0;\n            margin-top: -5px;\n            border-width: 5px 0 5px 5px;\n            border-left-color: #000;\n        }\n        [data-skaryna-tooltip="top"] div:nth-child(1) {\n            bottom: 0;\n            left: 50%;\n            margin-left: -5px;\n            border-width: 5px 5px 0;\n            border-top-color: #000;\n        }\n        [data-skaryna-tooltip="bottom"] div:nth-child(1) {\n            top: 0;\n            left: 50%;\n            margin-left: -5px;\n            border-width: 0 5px 5px;\n            border-bottom-color: #000;\n        }\n        [data-skaryna-tooltip="right"] div:nth-child(1) {\n            top: 50%;\n            left: 0;\n            margin-top: -5px;\n            border-width: 5px 5px 5px 0;\n            border-right-color: #000;\n        }\n        [data-skaryna-tooltip] a {\n            margin-left: 10px;\n        }\n        [data-skaryna-tooltip] a:first-child{\n            margin-left: 0px;\n        }';

            document.body.appendChild(styles);
        }
        return _this;
    }

    return Injector;
}(_emitter.Emitter);

},{"./emitter":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var Parser = function () {
    function Parser() {
        _classCallCheck(this, Parser);
    }

    _createClass(Parser, [{
        key: 'parse',
        value: function parse(format, token, data, options) {

            if (!token) {
                return Promise.reject(new Error('Model is empty'));
            }

            return this.handle(format, token, data, options);
        }
    }, {
        key: 'on',
        value: function on(format, token, handler) {
            this._handlers = this._handlers || {};
            this._handlers[format] = this._handlers[format] || {};
            this._handlers[format][token] = handler;
        }
    }, {
        key: 'handle',
        value: function handle(format, token, data, options) {

            var handler = this._handlers && this._handlers[format] && this._handlers[format][token] ? this._handlers[format][token] : null;
            if (!handler) {
                handler = this._handlers && this._handlers[format] && this._handlers[format]['*'] ? this._handlers[format]['*'] : null;
                if (!handler) {
                    return Promise.reject(new Error('No handler defined for ' + format + ' : ' + token));
                }
            }

            return handler(token, data, options).then(function (POM) {
                return POM;
            });
        }
    }]);

    return Parser;
}();

var parser = exports.parser = new Parser();

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /* jslint esnext:true, node:true */
/* globals document */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

exports.fromHTML = fromHTML;

var _parser = require('./../parser');

var _util = require('./../util');

var _document = require('./../document');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function whatWrapper(rootNode) {
    switch (rootNode) {
        case 'td':
        case 'th':
            return 'tr';
        case 'tr':
            return 'table';
        default:
            return 'div';
    }
}

function editMode(node, element, options) {
    if (options && options.edit) {
        element.setAttribute('data-skaryna-id', node.name);
        node.__element = element;
    }
    return node;
}

function processChildren(element, options) {
    if (!element || !element.childNodes) {
        return Promise.resolve([]);
    }
    return Promise.all((0, _util.arraize)(element.childNodes).map(function (child) {
        if (child.nodeType === 1 || child.nodeType === 3) {
            return fromHTML(child, options);
        } else {
            return null;
        }
    })).then(function (items) {
        return items.filter(function (item) {
            if (item.constructor === _document.TextNode) {
                return !item.absoluteEmpty;
            }
            return item !== null;
        });
    });
}

/**
 * Parse POM JSON representation
 * @param   {string|HTMLElement}   model
 * @param   {options} options
 * @returns {Promise<Node>}
 */
function fromHTML(input, options) {

    if (!input) {
        return Promise.resolve(null);
    }

    if (typeof input === 'string') {
        if (input.length === 0) {
            return Promise.resolve(null);
        }
        var wrapper = document.createElement(whatWrapper(input.replace('/^(\s*)<([a-zA-Z0-9_-]+)', '$2').toLowerCase()));
        wrapper.innerHTML = input;
        return processChildren(wrapper, options).then(function (children) {

            if (children.length === 1) {
                return children[0];
            }
            if (children.filter(function (item) {
                return !(item instanceof _document.TextNode || item instanceof InlineNode);
            }).length) {
                if (children.map(function (item) {
                    return item instanceof _document.BlockNode;
                }).length) {
                    return new _document.Document(children.map(function (item) {
                        if (item.type === 'text') {
                            return new _document.Paragraph(item.text, item.formats, item.attrs, options);
                        }
                        return item;
                    }));
                }
                return new _document.Document(children);
            }
            var items = children.map(function (item) {
                if (item instanceof InlineNode) {
                    var _stringify = stringify([item]);

                    var _stringify2 = _slicedToArray(_stringify, 2);

                    var text = _stringify2[0];
                    var formats = _stringify2[1];

                    return new _document.TextNode(text, formats, options);
                }

                return item;
            }),
                first = items.shift();
            items.forEach(function (item) {
                first.append(item);
            });
            return first;
        });
    }
    return _parser.parser.parse('html', input.nodeType === 3 ? 'text' : input.nodeName, input);
}

var InlineNode = function (_BlockNode) {
    _inherits(InlineNode, _BlockNode);

    function InlineNode() {
        _classCallCheck(this, InlineNode);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(InlineNode).apply(this, arguments));
    }

    return InlineNode;
}(_document.BlockNode);

function formatType(item, text) {
    if (item.type === 'A') {
        return {
            type: 'A',
            title: item.attrs.title || text,
            href: item.attrs.href
        };
    }
    return item.type;
}

function stringify(items) {
    var text = '',
        formats = [],
        index = 0;

    items.forEach(function (item) {
        if (item instanceof InlineNode) {
            var _stringify3 = stringify(item.items);

            var _stringify4 = _slicedToArray(_stringify3, 2);

            var innerText = _stringify4[0];
            var innerFormats = _stringify4[1];
            var format = {
                slice: [index, innerText.length],
                apply: [formatType(item, innerText)]
            };
            formats.push(format);
            innerFormats.forEach(function (format) {
                formats.push({
                    slice: [index + format.slice[0], format.slice[1]],
                    apply: format.apply
                });
            });
            formats.forEach(function (format) {
                formats.forEach(function (otherFormat, idx) {
                    if (format !== otherFormat && format.slice[0] === otherFormat.slice[0] && format.slice[1] === otherFormat.slice[1]) {
                        format.apply = format.apply.concat(otherFormat.apply);
                        formats.splice(idx, 1);
                    }
                });
            });
            text += innerText;
            index += innerText.length;
        } else if (item instanceof _document.TextNode) {
            text += item.text;
            index += item.text.length;
        } else {}
    });

    return [text, formats];
}

function heading(token, data, options) {

    return processChildren(data, options).then(function (items) {
        var _stringify5 = stringify(items);

        var _stringify6 = _slicedToArray(_stringify5, 2);

        var text = _stringify6[0];
        var formats = _stringify6[1];

        return Promise.resolve(new _document.Heading(token[1].toLowerCase(), text || '', formats.length ? formats : null, options));
    });
}

function paragraph(token, data, options) {
    return processChildren(data, options).then(function (items) {
        var _stringify7 = stringify(items);

        var _stringify8 = _slicedToArray(_stringify7, 2);

        var text = _stringify8[0];
        var formats = _stringify8[1];

        return Promise.resolve(new _document.Paragraph(text, formats.length ? formats : null));
    });
}

function attributes(input) {
    var output = null;
    (0, _util.arraize)(input).forEach(function (attribute) {
        output = output || {};
        if (attribute.value && attribute.value.length) {
            output[attribute.name] = attribute.value;
        }
    });
    return output;
}

function ifAttr(value) {
    if (value && value.length) {
        return value;
    }
    return null;
}

function quote(token, data, options) {
    return processChildren(data, options).then(function (items) {

        var paragraphs = [],
            lastParagraph = [];
        items.forEach(function (item) {
            if (item instanceof _document.Paragraph) {
                if (lastParagraph.length) {
                    var _stringify9 = stringify(items);

                    var _stringify10 = _slicedToArray(_stringify9, 2);

                    var text = _stringify10[0];
                    var formats = _stringify10[1];

                    paragraphs.push(Promise.resolve(new _document.Paragraph(text, formats.length ? formats : null, options)));
                    lastParagraph = [];
                }
                paragraphs.push(Promise.resolve(item));
            } else {
                lastParagraph.push(item);
            }
        });
        if (lastParagraph.length) {
            var _stringify11 = stringify(items);

            var _stringify12 = _slicedToArray(_stringify11, 2);

            var text = _stringify12[0];
            var formats = _stringify12[1];

            paragraphs.push(Promise.resolve(new _document.Paragraph(text, formats.length ? formats : null, options)));
        }

        return Promise.all(paragraphs);
    }).then(function (items) {
        return Promise.resolve(new _document.Quote(items));
    });
}

_parser.parser.on('html', 'text', function (token, data, options) {
    return Promise.resolve(new _document.TextNode(data.textContent, null, options));
});
_parser.parser.on('html', 'H1', heading);
_parser.parser.on('html', 'H2', heading);
_parser.parser.on('html', 'H3', heading);
_parser.parser.on('html', 'H4', heading);
_parser.parser.on('html', 'H5', heading);
_parser.parser.on('html', 'H6', heading);
_parser.parser.on('html', 'P', paragraph);
_parser.parser.on('html', 'BLOCKQUOTE', quote);

_parser.parser.on('html', 'IMG', function (token, data, options) {
    return Promise.resolve(new _document.Image(data.src, ifAttr(data.getAttribute('title')), ifAttr(data.getAttribute('alt')), (0, _util.clone)([attributes(data.attributes)], ['src', 'title', 'alt'])), options);
});

['ADDRESS', 'ARTICLE', 'ASIDE', 'DIV', 'FIGURE', 'FOOTER', 'HEADER', 'MAIN', 'NAV', 'SECTION'].forEach(function (nodeName) {
    _parser.parser.on('html', nodeName, function (token, data, options) {
        return processChildren(data, options).then(function (items) {
            return Promise.resolve(new _document.StaticBlockNode(token, items, attributes(data.attributes)), options);
        });
    });
});

_parser.parser.on('html', '*', function (token, data, options) {
    return processChildren(data, options).then(function (items) {
        return Promise.resolve(new InlineNode(token, items, attributes(data.attributes)), options);
    });
});
/*
parser.on('html', '#text', (token, data) => {
    return Promise.resolve(new TextNode(data.textContent));
});

[
    ['b', 'strong'],
    ['big', 'strong'],
    ['i', 'em'],
    'small',
    ['tt', 'code'],
    ['abbr', 'semantic', 'abbr'],
    ['acronym', 'abbr', 'abbr'],
    ['cite', 'semantic', 'cite'],
    'code',
    ['dfn', 'semantic', 'definition'],
    'em',
    ['time', 'semantic', 'time'],
    ['var', 'code', 'var'],
    ['kbd', 'code', 'kbd'],
    'strong',
    ['samp', 'code', 'sample'],
    'bdo',
    'a',
    //'br',
    //'img,
    //'map',
    //'object',
    ['q', 'semantic', 'quotation'],
    //script
    'span',
    del,
    s
    'sub',
    'sup',
    //button
    //input
    //label
    //select
    //textarea
].forEach((inlineRule) => {

    let input = typeof inlineRule === 'string' ? inlineRule : inlineRule[0];

    parser.on('html', input, (token, data) => {
        return processChildren(data)
            .then((items) => {

            });
    });

});
*/

},{"./../document":2,"./../parser":7,"./../util":14}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fromPOM = fromPOM;

var _parser = require('./../parser');

var _document = require('./../document');

/**
 * Parse POM JSON representation
 * @param   {object}   model
 * @param   {options} options
 * @returns {Promise<Node>}
 */
/* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

function fromPOM(model) {
    if (!model) {
        return Promise.resolve(null);
    }
    return _parser.parser.parse('pom', model.type, model);
}

function processChildNodes(items) {
    if (!Array.isArray(items)) {
        return Promise.resolve([]);
    }
    return Promise.all(items.map(function (item) {
        return fromPOM(item);
    })).then(function (items) {
        return items.filter(function (item) {
            return !!item;
        });
    });
}

_parser.parser.on('pom', 'document', function (token, data) {
    return processChildNodes(data.items).then(function (items) {
        return new _document.Document(items);
    });
});

_parser.parser.on('pom', 'heading', function (token, data) {
    return Promise.resolve(new _document.Heading(data.level, data.text, data.formats, data.attrs));
});

_parser.parser.on('pom', 'paragraph', function (token, data) {
    return Promise.resolve(new _document.Paragraph(data.text, data.formats, data.attrs));
});

_parser.parser.on('pom', 'text', function (token, data) {
    return Promise.resolve(new _document.TextNode(data.text, data.formats));
});

_parser.parser.on('pom', 'image', function (token, data) {
    return Promise.resolve(new _document.Image(data.src, data.title, data.alt));
});

_parser.parser.on('pom', 'Fields', function (token, data) {
    var fields = {};
    return Promise.all(Object.keys(data).filter(function (key) {
        return key !== 'type';
    }).map(function (key) {
        return fromPOM(data[key]).then(function (POM) {
            fields[key] = POM;
        });
    })).then(function () {
        return Promise.resolve(new _document.Fields(fields));
    });
});

_parser.parser.on('pom', 'Variants', function (token, data) {
    var variants = {};
    return Promise.all(Object.keys(data).filter(function (key) {
        return key !== 'type';
    }).map(function (key) {
        return fromPOM(data[key]).then(function (POM) {
            variants[key] = POM;
        });
    })).then(function () {
        return Promise.resolve(new _document.Variants(variants));
    });
});

},{"./../document":2,"./../parser":7}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.repository = exports.DEFAULT_DOCUMENT = exports.CHANGE = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _emitter = require('./emitter');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var CHANGE = exports.CHANGE = 'change';
var DEFAULT_DOCUMENT = exports.DEFAULT_DOCUMENT = '#default';

var Repository = function (_Emitter) {
    _inherits(Repository, _Emitter);

    function Repository() {
        _classCallCheck(this, Repository);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Repository).call(this));

        _this._documents = {};
        return _this;
    }

    _createClass(Repository, [{
        key: 'get',
        value: function get(documentId) {
            if (this._documents[documentId]) {
                return this._documents[documentId].content;
            }
        }
    }, {
        key: 'set',
        value: function set(documentId, value) {
            this._documents[documentId] = {
                content: value
            };
            this.emit(CHANGE, {
                id: documentId
            });
        }
    }, {
        key: 'has',
        value: function has(documentId) {
            return !!this._documents[documentId];
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var _this2 = this;

            var data = {};
            Object.keys(this._documents).forEach(function (key) {
                //console.log(this._documents[key].content);
                data[key] = {
                    id: key,
                    content: _this2._documents[key].content.toJSON()
                };
            });
            return data;
        }
    }, {
        key: 'main',
        get: function get() {
            return this._documents[DEFAULT_DOCUMENT];
        }
    }]);

    return Repository;
}(_emitter.Emitter);

var repository = exports.repository = new Repository();

},{"./emitter":4}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var Serializer = function () {
    function Serializer() {
        _classCallCheck(this, Serializer);
    }

    _createClass(Serializer, [{
        key: 'serialize',
        value: function serialize(format, node, options) {

            if (!node) {
                return Promise.reject(new Error('Model is empty'));
            }

            if (!node.type) {
                return Promise.reject(new Error('Undefined node type'));
            }

            return this.handle(format, node.type, node, options);
        }
    }, {
        key: 'on',
        value: function on(format, nodeType, handler) {
            this._handlers = this._handlers || {};
            this._handlers[format] = this._handlers[format] || {};
            this._handlers[format][nodeType] = handler;
        }
    }, {
        key: 'handle',
        value: function handle(format, nodeType, node, options) {

            var handler = this._handlers && this._handlers[format] && this._handlers[format][nodeType] ? this._handlers[format][nodeType] : null;
            if (!handler) {
                handler = this._handlers && this._handlers[format] && this._handlers[format]['*'] ? this._handlers[format]['*'] : null;
                if (!handler) {
                    return Promise.reject(new Error('No handler defined for ' + format + ' : ' + nodeType));
                }
            }
            return handler(node, options).then(function (html) {
                return html;
            });
        }
    }, {
        key: 'handleContents',
        value: function handleContents(format, array, options) {
            var self = this;
            return Promise.all(array.map(function (content) {
                return self.serialize('html', content, options);
            }));
        }
    }]);

    return Serializer;
}();

var serializer = exports.serializer = new Serializer();

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jslint esnext:true, node:true */
/* globals document */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

exports.toHTML = toHTML;
exports.element = element;

var _serializer = require('./../serializer');

var _document = require('./../document');

var _util = require('./../util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function toHTML(model, options) {
    return _serializer.serializer.serialize('html', model, options);
}

function otherAttrs(object, except) {
    var result = {};
    Object.keys(object).filter(function (key) {
        return except.indexOf(key) === -1;
    }).forEach(function (key) {
        result[key] = object[key];
    });
    return result;
}

function format(string, formats) {
    var wrapper = document.createElement('p'),
        slices = string.split('').map(function (char) {
        return {
            char: char,
            apply: []
        };
    });

    slices.push({
        char: '',
        apply: []
    });

    console.log(string);

    formats.forEach(function (format) {
        var from = format.slice[0],
            to = from + format.slice[1];

        console.log(from, to, slices.length);

        format.apply.forEach(function (apply) {
            if (slices[from].apply.indexOf(apply) == -1) {
                slices[from].apply.push(apply);
            }
            if (slices[to].apply.indexOf('/' + apply) == -1) {
                slices[to].apply.push('/' + apply);
            }
        });
    });
    wrapper.innerHTML = slices.map(function (char) {
        return char.apply.map(function (tag) {
            return '<' + tag + '>';
        }).join('') + char.char;
    }).join('');
    return (0, _util.arraize)(wrapper.childNodes);
}

function element(node, nodeType, attributes, content, options) {

    var promise = void 0;

    if (content) {

        promise = _serializer.serializer.handleContents('html', content || [], options);
    } else {
        promise = Promise.resolve(null);
    }

    return promise.then(function (content) {

        if (node.formats && node.formats.length) {
            content = format(content[0].nodeValue, node.formats);
        }

        var elem = document.createElement(nodeType);
        if (options && options.edit) {
            elem.setAttribute('data-skaryna-id', node.name);
        }
        if (attributes) {
            Object.keys(attributes).forEach(function (attributeName) {
                elem.setAttribute(attributeName, attributes[attributeName]);
            });
        }
        if (Array.isArray(content)) {
            content.forEach(function (child) {
                return elem.appendChild(child);
            });
        }
        return elem;
    });
}

var FakeDoc = function () {
    function FakeDoc() {
        _classCallCheck(this, FakeDoc);

        this.children = [];
    }

    _createClass(FakeDoc, [{
        key: 'appendChild',
        value: function appendChild(child) {
            this.children.push(child);
        }
    }, {
        key: 'outerHTML',
        get: function get() {
            var str = '';
            this.children.forEach(function (child) {
                if (child.nodeType === 1) {
                    str += child.outerHTML;
                } else {
                    str += child.textContent;
                }
            });
            return str;
        }
    }]);

    return FakeDoc;
}();

_serializer.serializer.on('html', 'document', function (node, options) {
    return _serializer.serializer.handleContents('html', node.items || [], options).then(function (contents) {
        var output = new FakeDoc();
        if (Array.isArray(contents)) {
            contents.forEach(function (child) {
                return output.appendChild(child);
            });
        }
        return output;
    });
});

_serializer.serializer.on('html', 'heading', function (node, options) {
    return element(node, 'h' + (node.level || 1), node.attr(), [new _document.TextNode(node.text, node.formats)], options);
});

_serializer.serializer.on('html', 'paragraph', function (node, options) {
    return element(node, 'p', node.attr(), [new _document.TextNode(node.text, node.formats)], options);
});

_serializer.serializer.on('html', 'image', function (node, options) {
    return element(node, 'img', node.attr(), null, options);
});

_serializer.serializer.on('html', 'text', function (node, options) {
    var element = document.createTextNode(node.text);
    if (options && options.edit) {
        //element.setAttribute('name', node.name);
    }
    return Promise.resolve(element);
});

_serializer.serializer.on('html', '*', function (node, options) {
    return element(node, node._type, node.attr(), node.items, options);
});

},{"./../document":2,"./../serializer":11,"./../util":14}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var Toolbar = exports.Toolbar = function () {
    function Toolbar() {
        _classCallCheck(this, Toolbar);

        //super();

        this.element = document.createElement('div');
        this.element.setAttribute('data-skaryna-toolbar', '');
        this.element.innerHTML = '<div data-skaryna-toolbar-actions>aaaaaaaaa</div><div data-skaryna-toolbar-arrow><span></span></div>';
        this.arrow = this.element.querySelector('[data-skaryna-toolbar-arrow]');

        var styles = document.createElement('style');
        styles.innerText = '\n            [data-skaryna-toolbar] {\n                position: absolute;\n                visibility: hidden;\n                display: none;\n                z-index: 10000;\n                transition: none;\n                top: 0;\n                left: 0;\n            }\n\n            [data-skaryna-toolbar-actions] {\n                position: relative;\n                background-image: linear-gradient(to bottom,rgba(49,49,47,.99),#262625);\n                background-repeat: repeat-x;\n                border-radius: 5px;\n            }\n\n            [data-skaryna-toolbar-arrow] {\n                position: absolute;\n                bottom: -10px;\n                left: 50%;\n                clip: rect(10px 20px 20px 0);\n                margin-left: -10px;\n            }\n\n            [data-skaryna-toolbar-arrow] > span {\n                display: block;\n                width: 20px;\n                height: 20px;\n                background-color: #262625;\n                transform: rotate(45deg) scale(.5);\n            }\n            ';

        document.body.appendChild(styles);
        document.body.appendChild(this.element);
    }

    _createClass(Toolbar, [{
        key: 'getSelectionCoords',
        value: function getSelectionCoords(theWindow) {
            var win = theWindow || window,
                doc = win.document,
                sel = doc.selection,
                range = void 0,
                rects = void 0,
                rect = void 0,
                x = 0,
                y = 0;
            if (sel) {
                if (sel.type != "Control") {
                    range = sel.createRange();
                    range.collapse(true);
                    x = range.boundingLeft;
                    y = range.boundingTop;
                }
            } else if (win.getSelection) {
                sel = win.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0).cloneRange();
                    if (range.getClientRects) {
                        range.collapse(true);
                        rects = range.getClientRects();

                        if (rects.length > 0) {
                            rect = rects[0];
                        }
                        x = rect.left;
                        y = rect.top;
                    }
                    // Fall back to inserting a temporary element
                    if (x == 0 && y == 0) {
                        var span = doc.createElement("span");
                        if (span.getClientRects) {
                            // Ensure span has dimensions and position by
                            // adding a zero-width space character
                            span.appendChild(doc.createTextNode('​'));
                            range.insertNode(span);
                            rect = span.getClientRects()[0];
                            x = rect.left;
                            y = rect.top;
                            var spanParent = span.parentNode;
                            spanParent.removeChild(span);

                            // Glue any broken text nodes back together
                            spanParent.normalize();
                        }
                    }
                }
            }
            return {
                x: x,
                y: y
            };
        }
    }, {
        key: 'anchor',
        value: function anchor() {
            var _this = this;

            var coords = this.getSelectionCoords(),
                self = this,
                rect = void 0,
                arrow = void 0;
            this.element.style.display = 'block';
            this.element.style.visibility = 'visible';

            setTimeout(function () {
                rect = _this.element.getBoundingClientRect();
                arrow = _this.arrow.getBoundingClientRect();
                console.log(rect, coords, arrow);
                _this.show(coords.x, coords.y - rect.height - 10);
            }, 1);
        }
    }, {
        key: 'show',
        value: function show(x, y) {
            this.element.style.top = y + 'px';
            this.element.style.left = x + 'px';
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.element.style.display = null;
            this.element.style.visibility = null;
        }
    }]);

    return Toolbar;
}();

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.arraize = arraize;
exports.clone = clone;
/* jslint esnext:true, node:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

/**
 * Convert iterable objects into arrays
 * @param   {Iterable} iterable
 * @returns {Array}
 */
function arraize(iterable) {
    return [].slice.apply(iterable);
}

function clone(inputs, except) {
    var result = {};
    inputs.forEach(function (input) {
        if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) !== 'object') {
            return;
        }
        Object.keys(input).forEach(function (key) {
            if (except && except.indexOf(key) !== -1) {
                return;
            }
            result[key] = JSON.parse(JSON.stringify(input[key]));
        });
    });
    return result;
}

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jslint esnext:true, node:true, browser:true */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

var XHR = exports.XHR = function () {
  function XHR() {
    _classCallCheck(this, XHR);
  }

  _createClass(XHR, null, [{
    key: 'ajax',
    value: function ajax(path, method, data, raw) {

      return new Promise(function (resolve, reject) {

        var xhr = new XMLHttpRequest(),
            httpMethod = method.toLowerCase();

        xhr.open(httpMethod, path);
        if (httpMethod === 'post' || httpMethod === 'put') {
          xhr.setRequestHeader('Content-type', 'application/json');
        }

        xhr.onreadystatechange = function () {
          var DONE = 4,
              // readyState 4 means the request is done.
          OK = 200; // status 200 is a successful return.
          if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
              resolve(xhr.responseText); // 'This is the returned text.'
            } else if (xhr.status === '204') {
                resolve(null);
              } else {
                reject(new Error('Error: ' + xhr.status)); // An error occurred during the request.
              }
          }
        };

        xhr.send(data ? raw ? data : JSON.stringify(data) : null);
      });
    }
  }, {
    key: 'get',
    value: function get(path, raw) {
      return XHR.ajax(path, 'get', null, raw);
    }
  }, {
    key: 'post',
    value: function post(path, data, raw) {
      return XHR.ajax(path, 'post', data, raw);
    }
  }, {
    key: 'put',
    value: function put(path, data, raw) {
      return XHR.ajax(path, 'put', data, raw);
    }
  }, {
    key: 'delete',
    value: function _delete(path, raw) {
      return XHR.ajax(path, 'delete', null, raw);
    }
  }]);

  return XHR;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYnJvd3Nlci5qcyIsInNyYy9kb2N1bWVudC5qcyIsInNyYy9lZGl0b3IuanMiLCJzcmMvZW1pdHRlci5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9pbmplY3Rvci5qcyIsInNyYy9wYXJzZXIuanMiLCJzcmMvcGFyc2VyL2Zyb21IVE1MLmpzIiwic3JjL3BhcnNlci9mcm9tUE9NLmpzIiwic3JjL3JlcG9zaXRvcnkuanMiLCJzcmMvc2VyaWFsaXplci5qcyIsInNyYy9zZXJpYWxpemVyL3RvSFRNTC5qcyIsInNyYy90b29sYmFyLmpzIiwic3JjL3V0aWwuanMiLCJzcmMveGhyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUN5QkE7O0FBSUE7O0FBSUE7O0FBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtBLGVBQVEsTUFBUjtBQUNBLGVBQVEsVUFBUjtBQUNBLGVBQVEsR0FBUjs7QUFFQSxPQUFPLE9BQVA7O0FBRUEsSUFBSSxNQUFNLE9BQU4sQ0FBYyxPQUFPLFVBQXJCLENBQUosRUFBc0M7QUFDbEMsV0FBTyxVQUFQLENBQWtCLE9BQWxCLENBQTBCLFVBQUMsUUFBRCxFQUFjO0FBQ3BDLGlCQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0gsS0FGRDtBQUdIOzs7Ozs7Ozs7Ozs7OztRQ0xlLFksR0FBQSxZO1FBVUEsUyxHQUFBLFM7UUFtQkEsTyxHQUFBLE87UUFJQSxTLEdBQUEsUztRQVFBLFEsR0FBQSxROztBQS9EaEI7O0FBSUE7O0FBS0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQSxJQUFJLGFBQWEsRUFBakI7Ozs7Ozs7QUFRTyxTQUFTLFlBQVQsQ0FBc0IsR0FBdEIsRUFBMkI7QUFDOUIsV0FBTyxPQUFPLEdBQVAsRUFBWSxPQUFaLENBQW9CLDRCQUFwQixFQUFrRCxNQUFsRCxDQUFQO0FBQ0g7Ozs7Ozs7O0FBUU0sU0FBUyxT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LEcsRUFBSztBQUMxQixhQUFPLElBQUksSUFBSixDQUFTLElBQVQsRUFBZSxLQUFmLEVBQXNCLElBQXRCLEVBQTRCLEdBQTVCLENBQVA7QUFDRDs7OzRCQUNhLEksRUFBTSxHLEVBQUs7QUFDdkIsYUFBTyxJQUFJLElBQUosQ0FBUyxJQUFULEVBQWUsUUFBZixFQUF5QixJQUF6QixFQUErQixHQUEvQixDQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUsIGJyb3dzZXI6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgU2thcnluYVxufVxuZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQge1xuICAgIEVkaXRvclxufVxuZnJvbSAnLi9lZGl0b3InO1xuaW1wb3J0IHtcbiAgICByZXBvc2l0b3J5XG59XG5mcm9tICcuL3JlcG9zaXRvcnknO1xuaW1wb3J0IHtcbiAgICBYSFJcbn1cbmZyb20gJy4veGhyJztcblxuU2thcnluYS5FZGl0b3IgPSBFZGl0b3I7XG5Ta2FyeW5hLnJlcG9zaXRvcnkgPSByZXBvc2l0b3J5O1xuU2thcnluYS5YSFIgPSBYSFI7XG5cbndpbmRvdy5Ta2FyeW5hID0gU2thcnluYTtcblxuaWYgKEFycmF5LmlzQXJyYXkod2luZG93Ll9fX1NrYXJ5bmEpKSB7XG4gICAgd2luZG93Ll9fX1NrYXJ5bmEuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkod2luZG93KTtcbiAgICB9KTtcbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBFbWl0dGVyXG59XG5mcm9tICcuL2VtaXR0ZXInO1xuaW1wb3J0IHtcbiAgICBjbG9uZSxcbiAgICBhcnJhaXplXG59XG5mcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtcbiAgICB0b0hUTUxcbn1cbmZyb20gJy4vc2VyaWFsaXplci90b0hUTUwnO1xuXG5sZXQgZWxlbWVudE1hcCA9IHt9O1xuXG5cbi8qKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vY29tcG9uZW50L2VzY2FwZS1yZWdleHBcbiAqIEBwYXJhbSAgIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVJlZ2V4cChzdHIpIHtcbiAgICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSgvKFsuKis/PV4hOiR7fSgpfFtcXF1cXC9cXFxcXSkvZywgJ1xcXFwkMScpO1xufVxuXG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3NpZWxheS9iZXN0bWF0Y2hcbiAqIEBwYXJhbSAgIHthcnJheX0gbGlzdFxuICogQHBhcmFtICAge3N0cmluZ30gICBmaWx0ZXJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZXN0TWF0Y2gobGlzdCwgZmlsdGVyKSB7XG4gICAgdmFyIGxvd2VzdCA9IG51bGwsXG4gICAgICAgIGJlc3Q7XG5cbiAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICAgICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnZXhwKHJ1bGUpLnJlcGxhY2UoL1xcXFxcXCovZywgJyguKyknKSksXG4gICAgICAgICAgICB3ZWlnaHQgPSBydWxlLnNwbGl0KCcqJykuZmlsdGVyKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnQubGVuZ3RoO1xuICAgICAgICAgICAgfSkubGVuZ3RoLFxuICAgICAgICAgICAgbWF0Y2ggPSBmaWx0ZXIubWF0Y2gocmVnZXhwKTtcblxuICAgICAgICBpZiAobWF0Y2ggJiYgKGxvd2VzdCA9PT0gbnVsbCB8fCAobWF0Y2gubGVuZ3RoIC0gd2VpZ2h0KSA8IGxvd2VzdCkpIHtcbiAgICAgICAgICAgIGxvd2VzdCA9IG1hdGNoLmxlbmd0aCAtIHdlaWdodDtcbiAgICAgICAgICAgIGJlc3QgPSBydWxlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGJlc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCeUlkKGlkKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRNYXBbaWRdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnlOb2RlKGVsZW1lbnQpIHtcbiAgICBpZighZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IGlkID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcpO1xuICAgIHJldHVybiBnZXRCeUlkKGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUlEKHNldFZhbHVlKSB7XG4gICAgdmFyIHBvc3NpYmxlID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OScsXG4gICAgICAgIHRleHQgPSAnJztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuICAgIH1cblxuICAgIGlmIChPYmplY3Qua2V5cyhlbGVtZW50TWFwKS5pbmRleE9mKHRleHQpID09PSAtMSkge1xuICAgICAgICBlbGVtZW50TWFwW3RleHRdID0gZWxlbWVudE1hcFt0ZXh0XSB8fCBzZXRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIHJldHVybiByYW5kb21JRChzZXRWYWx1ZSk7XG59XG5cbi8qKlxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0cyBOb2RlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5uYW1lID0gcmFuZG9tSUQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5fX2xvY2tlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbG9ja2VkO1xuICAgIH1cblxuICAgIGxvY2soKSB7XG4gICAgICAgIHRoaXMuX19sb2NrZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGF0dHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJzO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgYmUgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKiBAdGhyb3dzIHtFcnJvcn1cbiAgICAgKi9cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcignU2hvdWxkIGJlIGltcGxlbWVudGVkJyk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IGFsbG93ZWROZXdJdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAY2xhc3NcbiAqIERlZmluZWQgZm9yIEltYWdlLCBWaWRlbywgRW1iZWQsIFRhYmxlLCBIb3Jpem9uYWxSdWxlLCBUYWJsZSwgTGlzdCBvciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNsYXNzIEJsb2NrTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IodHlwZSwgaXRlbXMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXMgfHwgW107XG4gICAgICAgIHRoaXMuYXR0cnMgPSBhdHRycztcbiAgICB9XG5cbiAgICBnZXQocGF0aCkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBwYXRoLnNwbGl0KCcuJyksXG4gICAgICAgICAgICBpbmRleCA9IGVsZW1lbnRzLnNoaWZ0KCksXG4gICAgICAgICAgICByZXN0ID0gZWxlbWVudHMuam9pbignLicpLFxuICAgICAgICAgICAgY2hpbGQ7XG5cbiAgICAgICAgaWYgKGlzTmFOKGluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZCA9IHRoaXMuaXRlbXNbK2luZGV4XTtcblxuICAgICAgICBpZiAocmVzdC5sZW5ndGggJiYgY2hpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZC5nZXQocmVzdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGQ7XG5cbiAgICB9XG5cbiAgICBnZXQgZW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aCA8PSAwO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcy5tYXAoKGl0ZW0pID0+IGl0ZW0udG9KU09OKCkpXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmF0dHJzKSB7XG4gICAgICAgICAgICBvdXRwdXQuYXR0cnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXR0cnMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGRlY29yYXRlKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRvSFRNTCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgZWRpdDogdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBhcnJhaXplKGh0bWwuY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRG9jdW1lbnQgZXh0ZW5kcyBCbG9ja05vZGUge1xuXG4gICAgY29uc3RydWN0b3IoaXRlbXMpIHtcbiAgICAgICAgc3VwZXIoJ2RvY3VtZW50JywgaXRlbXMpO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcmFncmFwaDtcbiAgICB9XG5cbiAgICBnZXQgYWxsb3dlZE5ld0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgUGFyYWdyYXBoLFxuICAgICAgICAgICAgSW1hZ2VcbiAgICAgICAgXTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFF1b3RlIGV4dGVuZHMgQmxvY2tOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihpdGVtcykge1xuICAgICAgICBzdXBlcigncXVvdGUnLCBpdGVtcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBjbGFzc1xuICogRGVmaW5lZCBmb3IgVGV4dCwgUGFyYWdyYXBoLCBMaXN0SXRlbSwgUXVvdGUgYW5kIEhlYWRpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIFRleHROb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICd0ZXh0JztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAndGV4dCc7XG4gICAgfVxuXG4gICAgZ2V0IGVtcHR5KCkge1xuICAgICAgICByZXR1cm4gIXRoaXMudGV4dCB8fCAhdGhpcy50ZXh0LnJlcGxhY2UoL14oW1xcc1xcblxcclxcdF0rKXwoW1xcc1xcblxcclxcdF0rKSQvLCAnJykubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldCBhYnNvbHV0ZUVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0Lmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICBhdHRyKCkge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuYXR0cigpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHRleHQsIGZvcm1hdHMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudGV4dCA9ICh0ZXh0ICYmIHRleHQudG9TdHJpbmcpID8gdGV4dC50b1N0cmluZygpIDogJyc7XG4gICAgICAgIHRoaXMuZm9ybWF0cyA9IGZvcm1hdHMgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5hdHRycyA9IGF0dHJzO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMudGV4dFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5mb3JtYXRzKSB7XG4gICAgICAgICAgICBvdXRwdXQuZm9ybWF0cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5mb3JtYXRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXR0cnMgJiYgdGhpcy50eXBlICE9PSAndGV4dCcpIHtcbiAgICAgICAgICAgIG91dHB1dC5hdHRycyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hdHRycykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgYXBwZW5kKG5vZGUpIHtcbiAgICAgICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIFRleHROb2RlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IHRleHQgbm9kZXMgY2FuIGJlIGpvaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmZvcm1hdHMpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0cyA9IHRoaXMuZm9ybWF0cyB8fCBbXTtcbiAgICAgICAgICAgIG5vZGUuZm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm1hdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNsaWNlOiBbZm9ybWF0LnNsaWNlWzBdICsgdGhpcy50ZXh0Lmxlbmd0aCwgZm9ybWF0LnNsaWNlWzFdXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwbHk6IGZvcm1hdC5hcHBseVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZXh0ICs9IG5vZGUudGV4dDtcbiAgICB9XG5cbiAgICBkZWNvcmF0ZShlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0b0hUTUwodGhpcywge1xuICAgICAgICAgICAgICAgIGVkaXQ6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHROb2RlIHtcblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ3BhcmFncmFwaCc7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ3BhcmFncmFwaCc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IodGV4dCwgZm9ybWF0cywgYXR0cnMpIHtcbiAgICAgICAgc3VwZXIodGV4dCwgZm9ybWF0cywgYXR0cnMpO1xuICAgIH1cblxuICAgIGdldCBuZXh0Tm9kZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiBQYXJhZ3JhcGg7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2UgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSwgdGl0bGUsIGFsdCkge1xuICAgICAgICBzdXBlcignaW1hZ2UnKTtcbiAgICAgICAgdGhpcy5zcmMgPSBzb3VyY2U7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5hbHQgPSBhbHQ7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnaW1hZ2UnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgfVxuXG4gICAgYXR0cigpIHtcbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBzdXBlci5hdHRyKCkgfHwge307XG4gICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5zcmMgPSB0aGlzLnNyYztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aXRsZSkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy50aXRsZSA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWx0KSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzLmFsdCA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgICAgIHNyYzogdGhpcy5zcmNcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMudGl0bGUpIHtcbiAgICAgICAgICAgIG91dHB1dC50aXRsZSA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWx0KSB7XG4gICAgICAgICAgICBvdXRwdXQuYWx0ID0gdGhpcy5hbHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIZWFkaW5nIGV4dGVuZHMgVGV4dE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IobGV2ZWwsIHRleHQsIGZvcm1hdHMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKHRleHQsIGZvcm1hdHMsIGF0dHJzKTtcbiAgICAgICAgdGhpcy5sZXZlbCA9IE1hdGgubWluKDYsIGxldmVsIHx8IDApO1xuICAgIH1cblxuICAgIGF0dHIoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5hdHRyKCk7XG4gICAgfVxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ2hlYWRpbmcnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdoZWFkaW5nJztcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBqc29uID0gc3VwZXIudG9KU09OKCk7XG4gICAgICAgIGpzb24ubGV2ZWwgPSB0aGlzLmxldmVsO1xuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNCbG9ja05vZGUgZXh0ZW5kcyBCbG9ja05vZGUge1xuICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcmFncmFwaDtcbiAgICB9XG5cbiAgICBnZXQgYWxsb3dlZE5ld0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgUGFyYWdyYXBoLFxuICAgICAgICAgICAgSW1hZ2VcbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGaWVsZHMgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fbWFwID0gZGF0YTtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdGaWVsZHMnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdGaWVsZHMnO1xuICAgIH1cblxuICAgIGdldChwYXRoKSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBjaGlsZCA9IHRoaXMuX21hcFtpbmRleF07XG5cbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoICYmIGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGQuZ2V0KHJlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuXG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4gY2xvbmUoW1xuICAgICAgICAgICAgdGhpcy5fbWFwLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdGaWVsZHMnXG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhbnRzIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX3ZhcmlhbnRzID0gZGF0YTtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdWYXJpYW50cyc7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ1ZhcmlhbnRzJztcbiAgICB9XG5cblxuICAgIGJlc3QodmFyaWFudCkge1xuICAgICAgICBsZXQgYmVzdCA9IGJlc3RNYXRjaChPYmplY3Qua2V5cyh0aGlzLl92YXJpYW50cyksIHZhcmlhbnQpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFyaWFudHNbYmVzdF07XG5cbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiBjbG9uZShbXG4gICAgICAgICAgICB0aGlzLl9tYXAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1ZhcmlhbnRzJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9XG59XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSwgYnJvd3Nlcjp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBFdmVudCwgRW1pdHRlclxufVxuZnJvbSAnLi9lbWl0dGVyJztcblxuaW1wb3J0IHtcbiAgICBhcnJhaXplXG59XG5mcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtcbiAgICByZXBvc2l0b3J5LCBDSEFOR0UsIERFRkFVTFRfRE9DVU1FTlRcbn1cbmZyb20gJy4vcmVwb3NpdG9yeSc7XG5pbXBvcnQge1xuICAgIHRvSFRNTFxufVxuZnJvbSAnLi9zZXJpYWxpemVyL3RvSFRNTCc7XG5pbXBvcnQge1xuICAgIGZyb21IVE1MXG59XG5mcm9tICcuL3BhcnNlci9mcm9tSFRNTCc7XG5pbXBvcnQge1xuICAgIGZyb21QT01cbn1cbmZyb20gJy4vcGFyc2VyL2Zyb21QT00nO1xuaW1wb3J0IHtcbiAgICBYSFJcbn1cbmZyb20gJy4veGhyJztcbmltcG9ydCB7XG4gICAgVmFyaWFudHMsXG4gICAgcmFuZG9tSUQsXG4gICAgZ2V0QnlJZCxcbiAgICBnZXRCeU5vZGVcbn1cbmZyb20gJy4vZG9jdW1lbnQnO1xuXG5jb25zdCBCQUNLU1BBQ0UgPSA4LFxuICAgIFRBQiA9IDksXG4gICAgRU5URVIgPSAxMyxcbiAgICBTSElGVCA9IDE2LFxuICAgIENBUFMgPSAyMCxcbiAgICBFU0MgPSAyNyxcbiAgICBTUEFDRSA9IDMyLFxuICAgIFVQID0gMzgsXG4gICAgRE9XTiA9IDQwLFxuICAgIERFTEVURSA9IDQ2LFxuICAgIFBSRVZFTlQgPSBbRU5URVJdO1xuXG5pbXBvcnQge1xuICAgIFRvb2xiYXJcbn1cbmZyb20gJy4vdG9vbGJhcic7XG5pbXBvcnQge1xuICAgIEluamVjdG9yXG59XG5mcm9tICcuL2luamVjdG9yJztcblxubGV0IHRvb2xiYXIgPSBuZXcgVG9vbGJhcigpLFxuICAgIGluamVjdG9yO1xuXG4vKipcbiAqIEBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgRWRpdG9yIGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAvKipcbiAgICAgKiBbW0Rlc2NyaXB0aW9uXV1cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHJldHVybnMge1Byb21pc2V9IFtbRGVzY3JpcHRpb25dXVxuICAgICAqL1xuICAgIHN0YXRpYyBmYWN0b3J5KGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGVkaXRvciA9IG5ldyBFZGl0b3IoZWxlbWVudCk7XG4gICAgICAgIHJldHVybiBlZGl0b3IuaW5pdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFtbRGVzY3JpcHRpb25dXVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gW1tEZXNjcmlwdGlvbl1dXG4gICAgICovXG4gICAgc3RhdGljIGluaXRFZGl0b3JzKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGFycmFpemUoZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1za2FyeW5hXScpKVxuICAgICAgICAgICAgLm1hcCgoZWxlbWVudCkgPT4gRWRpdG9yLmZhY3RvcnkoZWxlbWVudCkpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBbW0Rlc2NyaXB0aW9uXV1cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZG9jdW1lbnRCb2R5IFtbRGVzY3JpcHRpb25dXVxuICAgICAqIEBwYXJhbSB7W1tUeXBlXV19IGRvY3VtZW50SWQgICBbW0Rlc2NyaXB0aW9uXV1cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVnaXN0ZXJEb2N1bWVudChkb2N1bWVudEJvZHksIGRvY3VtZW50SWQpIHtcbiAgICAgICAgcmVwb3NpdG9yeS5zZXQoZG9jdW1lbnRJZCB8fCBERUZBVUxUX0RPQ1VNRU5ULCBkb2N1bWVudEJvZHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIGRhdGEgZnJvbSBSRVNUIGVuZHBvaW50XG4gICAgICogQHBhcmFtICAge3N0cmluZ30gcGF0aFxuICAgICAqIEBwYXJhbSAgIHtzdHJpbmd9IGRvY3VtZW50SWRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBzdGF0aWMgbG9hZChwYXRoLCBkb2N1bWVudElkKSB7XG4gICAgICAgIHJldHVybiBYSFJcbiAgICAgICAgICAgIC5nZXQocGF0aClcbiAgICAgICAgICAgIC50aGVuKChjb250ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21QT00oSlNPTi5wYXJzZShjb250ZW50KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKGNvbnRlbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXBvc2l0b3J5LnNldChkb2N1bWVudElkIHx8IERFRkFVTFRfRE9DVU1FTlQsIGNvbnRlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmRvY3VtZW50UGF0aCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtcGF0aCcpIHx8IG51bGw7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLWRvYycpIHx8IERFRkFVTFRfRE9DVU1FTlQ7XG4gICAgICAgIHRoaXMudmFyaWFudCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtdmFyaWFudCcpIHx8IG51bGw7XG5cbiAgICAgICAgdGhpcy5fcGVuZGluZ1N0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcmVuZGVyaW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5pbml0KCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0cyBjb21wb25lbnRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBpbml0KCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICh0aGlzLmluaXRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdGVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5pdGVkID0gZnJvbUhUTUwodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgZWRpdDogdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChjb250ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGVudC5sb2NrKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcG9zaXRvcnkuaGFzKHNlbGYuZG9jdW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkb2MgPSByZXBvc2l0b3J5LmdldChzZWxmLmRvY3VtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuZG9jdW1lbnRQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2MgPSBkb2MuZ2V0KHNlbGYuZG9jdW1lbnRQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2MgJiYgZG9jLnR5cGUgPT09ICdWYXJpYW50cycgJiYgZG9jLmJlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2MgPSBkb2MuYmVzdChzZWxmLnZhcmlhbnQgfHwgJyonKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbnRlbnQgPSBkb2M7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghY29udGVudC5lbXB0eSkge1xuICAgICAgICAgICAgICAgICAgICByZXBvc2l0b3J5LnNldChzZWxmLmRvY3VtZW50LCBjb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb250ZW50ID0gY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYucmVuZGVyKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvci5zdGFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRDYXJldENoYXJhY3Rlck9mZnNldFdpdGhpbihlbGVtZW50KSB7XG4gICAgICAgIGxldCBjYXJldE9mZnNldCA9IDAsXG4gICAgICAgICAgICBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQgfHwgZWxlbWVudC5kb2N1bWVudCxcbiAgICAgICAgICAgIHdpbiA9IGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93LFxuICAgICAgICAgICAgc2VsO1xuICAgICAgICBpZiAodHlwZW9mIHdpbi5nZXRTZWxlY3Rpb24gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHNlbCA9IHdpbi5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIGlmIChzZWwucmFuZ2VDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSB3aW4uZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKSxcbiAgICAgICAgICAgICAgICAgICAgcHJlQ2FyZXRSYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICBwcmVDYXJldFJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcbiAgICAgICAgICAgICAgICBwcmVDYXJldFJhbmdlLnNldEVuZChyYW5nZS5lbmRDb250YWluZXIsIHJhbmdlLmVuZE9mZnNldCk7XG4gICAgICAgICAgICAgICAgY2FyZXRPZmZzZXQgPSBwcmVDYXJldFJhbmdlLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKChzZWwgPSBkb2Muc2VsZWN0aW9uKSAmJiBzZWwudHlwZSAhPSAnQ29udHJvbCcpIHtcbiAgICAgICAgICAgIGxldCB0ZXh0UmFuZ2UgPSBzZWwuY3JlYXRlUmFuZ2UoKSxcbiAgICAgICAgICAgICAgICBwcmVDYXJldFRleHRSYW5nZSA9IGRvYy5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgcHJlQ2FyZXRUZXh0UmFuZ2UubW92ZVRvRWxlbWVudFRleHQoZWxlbWVudCk7XG4gICAgICAgICAgICBwcmVDYXJldFRleHRSYW5nZS5zZXRFbmRQb2ludCgnRW5kVG9FbmQnLCB0ZXh0UmFuZ2UpO1xuICAgICAgICAgICAgY2FyZXRPZmZzZXQgPSBwcmVDYXJldFRleHRSYW5nZS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FyZXRPZmZzZXQ7XG4gICAgfVxuXG4gICAgZ2V0U2VsZWN0aW9uTGVuZ3RoKGVsZW1lbnQpIHtcblxuICAgIH1cblxuICAgIGdldEN1cnJlbnRFbGVtZW50KGVsZW1lbnQpIHtcblxuICAgICAgICBsZXQgZG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50IHx8IGVsZW1lbnQuZG9jdW1lbnQsXG4gICAgICAgICAgICB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdyxcbiAgICAgICAgICAgIHNlbCxcbiAgICAgICAgICAgIG5vZGU7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB3aW4uZ2V0U2VsZWN0aW9uICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzZWwgPSB3aW4uZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWwgPSBkb2Muc2VsZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9kZSA9IHNlbC5mb2N1c05vZGU7XG5cbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRFZGl0YWJsZU5vZGUobm9kZSk7XG4gICAgfVxuXG4gICAgZ2V0RWRpdGFibGVOb2RlKG5vZGUpIHtcbiAgICAgICAgd2hpbGUgKG5vZGUgJiYgKCFub2RlLmhhc0F0dHJpYnV0ZSB8fCAhbm9kZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcpKSkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICBvbkRPTShzZWxlY3Rvck9SRWxlbWVudCwgZXZlbnROYW1lLCBteU1ldGhvZCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxlY3Rvck9SRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICBzZWxlY3Rvck9SRWxlbWVudCA9IFtzZWxlY3Rvck9SRWxlbWVudF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rvck9SRWxlbWVudCA9IGFycmFpemUodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JPUkVsZW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvck9SRWxlbWVudFxuICAgICAgICAgICAgLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBteU1ldGhvZC5hcHBseShzZWxmLCBbZXZlbnRdKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlcnMgVUlcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmluZyA9IHRydWU7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHByb21pc2U7XG5cbiAgICAgICAgaWYgKCF0aGlzLmNvbnRlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZSA9IHRoaXMuY29udGVudFxuICAgICAgICAgICAgICAgIC5kZWNvcmF0ZSh0aGlzLmVsZW1lbnQpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm9taXNlXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLWlkJywgc2VsZi5jb250ZW50ID8gc2VsZi5jb250ZW50Lm5hbWUgOiByYW5kb21JRCh0cnVlKSk7XG4gICAgICAgICAgICAgICAgc2VsZi5lbGVtZW50LnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgJycpO1xuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25LZXlVcChldmVudCk7XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5vbkRPTSgnW2RhdGEtc2thcnluYS1pZF0nLCAnbW91c2V1cCcsIHNlbGYuZm9jdXMpO1xuICAgICAgICAgICAgICAgIHNlbGYub25ET00oc2VsZi5lbGVtZW50LCAnbW91c2V1cCcsIHNlbGYuZm9jdXMpO1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbiA/IHdpbmRvdy5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpIDogZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWwgJiYgc2VsLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25TZWxlY3QoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0cnVlKTsqL1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25TZWxlY3QoZXZlbnQpIHtcblxuICAgICAgICAvKnRoaXMuc2hvd1Rvb2xiYXIoKTtcbiAgICAgICAgdGhpcy5zdHJvbmcoKTsqL1xuICAgIH1cblxuICAgIHNob3dUb29sYmFyKCkge1xuICAgICAgICB0b29sYmFyLmFuY2hvcigpO1xuICAgIH1cblxuICAgIGZvY3VzKGV2ZW50KSB7XG4gICAgICAgIGxldCBub2RlID0gdGhpcy5nZXRFZGl0YWJsZU5vZGUoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIGZvY3VzZWROb2RlID0gZ2V0QnlOb2RlKG5vZGUpLFxuICAgICAgICAgICAgcGFyZW50Tm9kZSA9IGdldEJ5Tm9kZShub2RlLnBhcmVudE5vZGUpLFxuICAgICAgICAgICAgbmV3SXRlbXMsXG4gICAgICAgICAgICBpbmplY3Rvck9iamVjdDtcblxuICAgICAgICBuZXdJdGVtcyA9IHBhcmVudE5vZGUgPyBwYXJlbnROb2RlLmFsbG93ZWROZXdJdGVtcyA6IGZvY3VzZWROb2RlLmFsbG93ZWROZXdJdGVtcztcblxuICAgICAgICB0aGlzLmhpZGVJbmplY3RvcigpO1xuXG4gICAgICAgIGlmIChuZXdJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoIXBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICBpbmplY3Rvck9iamVjdCA9IHRoaXMuc2hvd0luamVjdG9yKG5vZGUucGFyZW50Tm9kZS5sYXN0Q2hpbGQsIG5ld0l0ZW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5qZWN0b3JPYmplY3QgPSB0aGlzLnNob3dJbmplY3Rvcihub2RlLCBuZXdJdGVtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmplY3Rvck9iamVjdC5vbignaW5qZWN0bm9kZScsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJlbnROb2RlLml0ZW1zLmluZGV4T2YoZm9jdXNlZE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnROb2RlLml0ZW1zLnNwbGljZShpbmRleCwgMCwgbmV3IGV2ZW50LmRhdGEoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50Tm9kZS5pdGVtcy5wdXNoKG5ldyBldmVudC5kYXRhKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93SW5qZWN0b3IoYWZ0ZXJOb2RlLCBwb3NzaWJsZUl0ZW1zKSB7XG4gICAgICAgIGxldCBpbmplY3Rvck9iamVjdCA9IG5ldyBJbmplY3Rvcihwb3NzaWJsZUl0ZW1zKSxcbiAgICAgICAgICAgIGJveCA9IGFmdGVyTm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgIGluamVjdG9yQm94O1xuXG4gICAgICAgIGluamVjdG9yID0gaW5qZWN0b3JPYmplY3QuZWxlbWVudDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbmplY3Rvcik7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaW5qZWN0b3JCb3ggPSBpbmplY3Rvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGluamVjdG9yLnN0eWxlLnRvcCA9IChib3gudG9wKSArICdweCc7XG4gICAgICAgICAgICBpbmplY3Rvci5zdHlsZS5sZWZ0ID0gKGJveC5sZWZ0IC0gaW5qZWN0b3JCb3gud2lkdGgpICsgJ3B4JztcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIHJldHVybiBpbmplY3Rvck9iamVjdDtcblxuICAgIH1cblxuICAgIGhpZGVJbmplY3RvcigpIHtcbiAgICAgICAgaWYgKGluamVjdG9yKSB7XG4gICAgICAgICAgICBpZiAoaW5qZWN0b3IucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgIGluamVjdG9yLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaW5qZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5qZWN0b3IgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3Ryb25nKCkge1xuICAgICAgICBsZXQgdGV4dE5vZGUgPSB0aGlzLmdldEN1cnJlbnRFbGVtZW50KGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uID8gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCkgOiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS50ZXh0LFxuICAgICAgICAgICAgdG8gPSBzZWwubGVuZ3RoLFxuICAgICAgICAgICAgZnJvbSA9IHRoaXMuZ2V0Q2FyZXRDaGFyYWN0ZXJPZmZzZXRXaXRoaW4odGV4dE5vZGUpIC0gdG87XG5cblxuICAgICAgICBmcm9tSFRNTCh0ZXh0Tm9kZSlcbiAgICAgICAgICAgIC50aGVuKChQT00pID0+IHtcbiAgICAgICAgICAgICAgICBQT00uZm9ybWF0cyA9IFBPTS5mb3JtYXRzIHx8IFtdO1xuICAgICAgICAgICAgICAgIFBPTS5mb3JtYXRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzbGljZTogW2Zyb20sIHRvXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwbHk6IFsnc3Ryb25nJ11cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9IVE1MKFBPTSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKEhUTUwpID0+IHtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5pbm5lckhUTUwgPSBIVE1MLmlubmVySFRNTDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgZXh0ZXJuYWwgY2hhbmdlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50XG4gICAgICovXG4gICAgb25FeHRlcm5hbENoYW5nZShldmVudCkge1xuICAgICAgICBpZiAodGhpcy5fcmVuZGVyaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9wZW5kaW5nU3RhdGUgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgbmV3SXRlbSh0YXJnZXQpIHtcbiAgICAgICAgbGV0IGN1cnJlbnRUYXJnZXQgPSB0YXJnZXQsXG4gICAgICAgICAgICBub2RlID0gZ2V0QnlOb2RlKGN1cnJlbnRUYXJnZXQpLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIHdoaWxlIChub2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5kZWZhdWx0TmV3SXRlbSkge1xuICAgICAgICAgICAgICAgIGxldCBuZXdFbGVtZW50ID0gbmV3KG5vZGUuZGVmYXVsdE5ld0l0ZW0pKCk7XG4gICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5wdXNoKG5ld0VsZW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgdG9IVE1MKG5ld0VsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXQ6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oaHRtbEVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhcmdldC5hcHBlbmRDaGlsZChodG1sRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVkaXROb2RlKGh0bWxFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VycmVudFRhcmdldCA9IGN1cnJlbnRUYXJnZXQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIG5vZGUgPSBnZXRCeU5vZGUoY3VycmVudFRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlZGl0Tm9kZShub2RlKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCksXG4gICAgICAgICAgICBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHJhbmdlLnNldFN0YXJ0KG5vZGUsIDApO1xuICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cblxuICAgIG93bkFjdGlvbihrZXksIHRhcmdldCkge1xuICAgICAgICBpZiAoa2V5ID09PSBFTlRFUikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmV3SXRlbSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBrZXkgdXAgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgICAqL1xuICAgIG9uS2V5VXAoZXZlbnQpIHtcblxuICAgICAgICBpZiAoUFJFVkVOVC5pbmRleE9mKGV2ZW50LmtleUNvZGUpICE9PSAtMSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5vd25BY3Rpb24oZXZlbnQua2V5Q29kZSwgdGhpcy5nZXRDdXJyZW50RWxlbWVudChldmVudC50YXJnZXQpKTtcbiAgICAgICAgfVxuXG4gICAgfVxufVxuXG5sZXQgc3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbnN0eWxlcy5pbm5lclRleHQgPSBgXG4gICAgICAgIHBbZGF0YS1za2FyeW5hLWlkXTplbXB0eSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYDtcblxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdHlsZXMpO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG4vKipcbiAqIEBuYW1lc3BhY2Ugc2thcnluYVxuICpcbiAqIEBjbGFzcyBFdmVudENvbmZpZ1xuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gZm4gbGlzdGVuZXJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBjb250ZXh0XG4gKiBAcHJvcGVydHkge2FycmF5fSBhcmdzIGFyZ3VtZW50cyB0byBiZSBwYXNzZWRcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb25jZSBpZiBzaG91bGQgYmUgZmlyZWQgb25seSBvbmNlXG4gKi9cblxuLyoqXG4gKiBAY2xhc3MgRXZlbnRcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50IHtcbiAgICAvKipcbiAgICAgKiBDb250cnVjdG9yXG4gICAgICogQGNvbnN0cnVjdHMgRXZlbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7bWl4ZWR9IGRhdGFcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc291cmNlXG4gICAgICogQHBhcmFtIHtFdmVudH0gcGFyZW50XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZSwgZGF0YSwgc291cmNlLCBwYXJlbnQpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge3N0cmluZ31cbiAgICAgICAgICAgICAqIEBuYW1lIEV2ZW50I25hbWVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBuYW1lLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IHttaXhlZH1cbiAgICAgICAgICAgICAqIEBuYW1lIEV2ZW50I2RhdGFcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBkYXRhLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtvYmplY3R9XG4gICAgICAgICAgICAgKiBAbmFtZSBFdmVudCNzb3VyY2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc291cmNlOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHNvdXJjZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSB7RXZlbnR8bnVsbH1cbiAgICAgICAgICAgICAqIEBuYW1lIEV2ZW50I3BhcmVudFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBwYXJlbnQ6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogcGFyZW50LFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICAgICAgcGFyZW50OiB0aGlzLnBhcmVudFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ0V2ZW50OiAnICsgSlNPTi5zdHJpbmdpZnkodGhpcy50b0pTT04oKSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFtbRGVzY3JpcHRpb25dXVxuICogQHBhcmFtIHtFdmVudH0gY29mbmlnXG4gKiBAcGFyYW0ge0V2ZW50Q29uZmlnfSB0aGlzT2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGV4ZWN1dGUoZXZlbnQsIGNvbmZpZykge1xuICAgIGxldCB7XG4gICAgICAgIGZuLCBjb250ZXh0LCBhcmdzXG4gICAgfSA9IGNvbmZpZyxcbiAgICBwYXJhbXMgPSBbZXZlbnRdLmNvbmNhdChhcmdzKTtcblxuICAgIGZuLmFwcGx5KGNvbnRleHQgfHwgbnVsbCwgcGFyYW1zKTtcbn1cblxuLypcbiAqIEBjbGFzcyBFbWl0dGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBFbWl0dGVyIHtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgbGlzdGVuZXIgZm9yIGFuIGV2ZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGFyZ3NcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9uY2VcbiAgICAgKi9cbiAgICBvbihldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIGFyZ3MsIG9uY2UpIHtcbiAgICAgICAgdGhpcy5fX2xpc3RlbmVycyA9IHRoaXMuX19saXN0ZW5lcnMgfHwge307XG4gICAgICAgIHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSA9IHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICAgICAgdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdLnB1c2goe1xuICAgICAgICAgICAgZm46IGhhbmRsZXIsXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgICAgIG9uY2U6ICEhb25jZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGxpc3RlbmVyIGZvciBhbiBldmVudCB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb25jZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBhcmdzXG4gICAgICovXG4gICAgb25jZShldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIGFyZ3MpIHtcbiAgICAgICAgdGhpcy5vbihldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIGFyZ3MsIHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgbGlzdGVuZXIgZm9yIGFuIGV2ZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGFyZ3NcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9uY2VcbiAgICAgKi9cbiAgICBvZmYoZXZlbnROYW1lLCBoYW5kbGVyLCBjb250ZXh0LCBhcmdzLCBvbmNlKSB7XG4gICAgICAgIGlmICghdGhpcy5fX2xpc3RlbmVycyB8fCAhdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLmdldExpc3RlbmVycyhldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIGFyZ3MsIG9uY2UpXG4gICAgICAgICAgICAuZm9yRWFjaCgoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdLnNwbGljZSh0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0uaW5kZXhPZihjb25maWcpLCAxKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW1pdHMgYW4gZXZlbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIHttaXhlZH0gZGF0YVxuICAgICAqIEBwYXJhbSB7RXZlbnR8bnVsbH0gcGFyZW50XG4gICAgICovXG4gICAgZW1pdChldmVudE5hbWUsIGRhdGEsIHBhcmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuX19saXN0ZW5lcnMgfHwgIXRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgZXZlbnQgPSBuZXcgRXZlbnQoZXZlbnROYW1lLCBkYXRhLCB0aGlzLCBwYXJlbnQpO1xuXG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC5nZXRMaXN0ZW5lcnMoZXZlbnROYW1lKVxuICAgICAgICAgICAgLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb25maWcub25jZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9mZihldmVudE5hbWUsIGNvbmZpZy5mbiwgY29uZmlnLmNvbnRleHQsIGNvbmZpZy5hcmdzLCBjb25maWcub25jZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV4ZWN1dGUoZXZlbnQsIGNvbmZpZyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWJibGVzIGV2ZW50IHRvIG90aGVyIGVtaXR0ZXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHRvRW1pdHRlclxuICAgICAqL1xuICAgIGJ1YmJsZUV2ZW50KGV2ZW50TmFtZSwgdG9FbWl0dGVyKSB7XG4gICAgICAgIHRoaXMub24oZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRvRW1pdHRlci5lbWl0KGV2ZW50TmFtZSwgZXZlbnQuZGF0YSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFsbCBsaXN0ZW5lcnMgdGhhdCBtYXRjaCBjcml0ZXJpYVxuICAgICAqIEBwYXJhbSAgIHtzdHJpbmd9IGV2ZW50TmFtZSByZXF1aXJlZFxuICAgICAqIEBwYXJhbSAgIHtmdW5jdGlvbn0gaGFuZGxlciAgIGlmIGRlZmluZWQgd2lsbCBiZSB1c2VkIGZvciBtYXRjaFxuICAgICAqIEBwYXJhbSAgIHtvYmplY3R9IGNvbnRleHQgICBpZiBkZWZpbmVkIHdpbGwgYmUgdXNlZCBmb3IgbWF0Y2hcbiAgICAgKiBAcGFyYW0gICB7YXJyYXl9IGFyZ3MgICAgICBpZiBkZWZpbmVkIHdpbGwgYmUgdXNlZCBmb3IgbWF0Y2hcbiAgICAgKiBAcmV0dXJucyB7YXJyYXk8RXZlbnRDb25maWc+fG51bGx9XG4gICAgICovXG4gICAgZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncykge1xuICAgICAgICBpZiAoIXRoaXMuX19saXN0ZW5lcnMgfHwgIXRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdXG4gICAgICAgICAgICAubWFwKChjb25maWcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGNvbmZpZy5mbiAhPT0gaGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0ICE9PSB1bmRlZmluZWQgJiYgY29uZmlnLmNvbnRleHQgIT09IGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYXJncyAhPT0gdW5kZWZpbmVkICYmIGNvbmZpZy5hcmdzICE9PSBhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKChyZXN1bHQpID0+ICEhcmVzdWx0KTtcbiAgICB9XG5cbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuZXhwb3J0IHtFdmVudCwgRW1pdHRlcn0gZnJvbSAnLi9lbWl0dGVyJztcblxuZXhwb3J0IGNsYXNzIFNrYXJ5bmEge1xufVxuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUsIGJyb3dzZXI6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5pbXBvcnQge1xuICAgIEVtaXR0ZXJcbn1cbmZyb20gJy4vZW1pdHRlcic7XG5cbmxldCBzdHlsZXM7XG5cbmNvbnN0IFNWR1MgPSB7XG4gICAgcGFyYWdyYXBoOiAnTTgzMiAzMjB2NzA0cTAgMTA0LTQwLjUgMTk4LjV0LTEwOS41IDE2My41LTE2My41IDEwOS41LTE5OC41IDQwLjVoLTY0cS0yNiAwLTQ1LTE5dC0xOS00NXYtMTI4cTAtMjYgMTktNDV0NDUtMTloNjRxMTA2IDAgMTgxLTc1dDc1LTE4MXYtMzJxMC00MC0yOC02OHQtNjgtMjhoLTIyNHEtODAgMC0xMzYtNTZ0LTU2LTEzNnYtMzg0cTAtODAgNTYtMTM2dDEzNi01NmgzODRxODAgMCAxMzYgNTZ0NTYgMTM2em04OTYgMHY3MDRxMCAxMDQtNDAuNSAxOTguNXQtMTA5LjUgMTYzLjUtMTYzLjUgMTA5LjUtMTk4LjUgNDAuNWgtNjRxLTI2IDAtNDUtMTl0LTE5LTQ1di0xMjhxMC0yNiAxOS00NXQ0NS0xOWg2NHExMDYgMCAxODEtNzV0NzUtMTgxdi0zMnEwLTQwLTI4LTY4dC02OC0yOGgtMjI0cS04MCAwLTEzNi01NnQtNTYtMTM2di0zODRxMC04MCA1Ni0xMzZ0MTM2LTU2aDM4NHE4MCAwIDEzNiA1NnQ1NiAxMzZ6JyxcbiAgICBpbWFnZTogJ001NzYgNTc2cTAgODAtNTYgMTM2dC0xMzYgNTYtMTM2LTU2LTU2LTEzNiA1Ni0xMzYgMTM2LTU2IDEzNiA1NiA1NiAxMzZ6bTEwMjQgMzg0djQ0OGgtMTQwOHYtMTkybDMyMC0zMjAgMTYwIDE2MCA1MTItNTEyem05Ni03MDRoLTE2MDBxLTEzIDAtMjIuNSA5LjV0LTkuNSAyMi41djEyMTZxMCAxMyA5LjUgMjIuNXQyMi41IDkuNWgxNjAwcTEzIDAgMjIuNS05LjV0OS41LTIyLjV2LTEyMTZxMC0xMy05LjUtMjIuNXQtMjIuNS05LjV6bTE2MCAzMnYxMjE2cTAgNjYtNDcgMTEzdC0xMTMgNDdoLTE2MDBxLTY2IDAtMTEzLTQ3dC00Ny0xMTN2LTEyMTZxMC02NiA0Ny0xMTN0MTEzLTQ3aDE2MDBxNjYgMCAxMTMgNDd0NDcgMTEzeicsXG4gICAgZGltZW5zaW9uczogJzAgMCAxNzkyIDE3OTInXG59O1xuXG5leHBvcnQgY2xhc3MgSW5qZWN0b3IgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGFsbG93ZWROb2Rlcykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGxldFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICBkaXYuaW5uZXJIVE1MID0gJzxkaXYgZGF0YS1za2FyeW5hLXRvb2x0aXA9XCJsZWZ0XCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2Pic7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZGl2LmZpcnN0Q2hpbGQ7XG5cbiAgICAgICAgYWxsb3dlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgICBsZXQgYWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpLFxuICAgICAgICAgICAgICAgIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnc3ZnJyksXG4gICAgICAgICAgICAgICAgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAncGF0aCcpO1xuXG4gICAgICAgICAgICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIDMwKTtcbiAgICAgICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIDMwKTtcbiAgICAgICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCBTVkdTLmRpbWVuc2lvbnMpO1xuICAgICAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgneG1sbnMnLCAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnKTtcbiAgICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKCdkJywgU1ZHU1tub2RlLnR5cGVdKTtcbiAgICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKCdmaWxsJywgJyNmZmYnKTtcblxuICAgICAgICAgICAgc3ZnLmFwcGVuZENoaWxkKHBhdGgpO1xuICAgICAgICAgICAgYWN0aW9uLmFwcGVuZENoaWxkKHN2Zyk7XG5cbiAgICAgICAgICAgIGFjdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5vZGUpO1xuICAgICAgICAgICAgICAgIHNlbGYuZW1pdCgnaW5qZWN0bm9kZScsIG5vZGUpO1xuXG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jaGlsZHJlblsxXS5hcHBlbmRDaGlsZChhY3Rpb24pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXN0eWxlcykge1xuICAgICAgICAgICAgc3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIHN0eWxlcy5pbm5lclRleHQgPSBgXG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcF0ge1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgei1pbmRleDogMTA3MDtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgZm9udC1mYW1pbHk6IFwiSGVsdmV0aWNhIE5ldWVcIiwgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZjtcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMS40Mjg1NzE0MztcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBzdGFydDtcbiAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgICAgIHRleHQtc2hhZG93OiBub25lO1xuICAgICAgICAgICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gICAgICAgICAgICBsZXR0ZXItc3BhY2luZzogbm9ybWFsO1xuICAgICAgICAgICAgd29yZC1icmVhazogbm9ybWFsO1xuICAgICAgICAgICAgd29yZC1zcGFjaW5nOiBub3JtYWw7XG4gICAgICAgICAgICB3b3JkLXdyYXA6IG5vcm1hbDtcbiAgICAgICAgICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7XG4gICAgICAgICAgICAvKmZpbHRlcjogYWxwaGEob3BhY2l0eT0wKTtcbiAgICAgICAgICAgIG9wYWNpdHk6IDA7Ki9cbiAgICAgICAgICAgIGxpbmUtYnJlYWs6IGF1dG87XG4gICAgICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuNXM7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwXSBkaXY6bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICAgIG1heC13aWR0aDogMjAwcHg7XG4gICAgICAgICAgICBwYWRkaW5nOiAzcHggOHB4O1xuICAgICAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNHB4O1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcF0gZGl2Om50aC1jaGlsZCgxKSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB3aWR0aDogMDtcbiAgICAgICAgICAgIGhlaWdodDogMDtcbiAgICAgICAgICAgIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcD1cImxlZnRcIl0ge1xuICAgICAgICAgICAgcGFkZGluZzogMCA1cHg7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogLTNweDtcbiAgICAgICAgfVxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXA9XCJ0b3BcIl0ge1xuICAgICAgICAgICAgcGFkZGluZzogNXB4IDA7XG4gICAgICAgICAgICBtYXJnaW4tdG9wOiAtM3B4O1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcD1cImJvdHRvbVwiXSB7XG4gICAgICAgICAgICBwYWRkaW5nOiA1cHggMDtcbiAgICAgICAgICAgIG1hcmdpbi10b3A6IDNweDtcbiAgICAgICAgfVxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXA9XCJyaWdodFwiXSB7XG4gICAgICAgICAgICBwYWRkaW5nOiAwIDVweDtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAzcHg7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwPVwibGVmdFwiXSBkaXY6bnRoLWNoaWxkKDEpIHtcbiAgICAgICAgICAgIHRvcDogNTAlO1xuICAgICAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgICAgICBtYXJnaW4tdG9wOiAtNXB4O1xuICAgICAgICAgICAgYm9yZGVyLXdpZHRoOiA1cHggMCA1cHggNXB4O1xuICAgICAgICAgICAgYm9yZGVyLWxlZnQtY29sb3I6ICMwMDA7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwPVwidG9wXCJdIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICAgICAgbGVmdDogNTAlO1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IC01cHg7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IDVweCA1cHggMDtcbiAgICAgICAgICAgIGJvcmRlci10b3AtY29sb3I6ICMwMDA7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwPVwiYm90dG9tXCJdIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgbGVmdDogNTAlO1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IC01cHg7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IDAgNXB4IDVweDtcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20tY29sb3I6ICMwMDA7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwPVwicmlnaHRcIl0gZGl2Om50aC1jaGlsZCgxKSB7XG4gICAgICAgICAgICB0b3A6IDUwJTtcbiAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICBtYXJnaW4tdG9wOiAtNXB4O1xuICAgICAgICAgICAgYm9yZGVyLXdpZHRoOiA1cHggNXB4IDVweCAwO1xuICAgICAgICAgICAgYm9yZGVyLXJpZ2h0LWNvbG9yOiAjMDAwO1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcF0gYSB7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICAgICAgfVxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXBdIGE6Zmlyc3QtY2hpbGR7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogMHB4O1xuICAgICAgICB9YDtcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdHlsZXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5jbGFzcyBQYXJzZXIge1xuXG4gICAgcGFyc2UoZm9ybWF0LCB0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ01vZGVsIGlzIGVtcHR5JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlKGZvcm1hdCwgdG9rZW4sIGRhdGEsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIG9uKGZvcm1hdCwgdG9rZW4sIGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlcnMgPSB0aGlzLl9oYW5kbGVycyB8fCB7fTtcbiAgICAgICAgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSA9IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gfHwge307XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bdG9rZW5dID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBoYW5kbGUoZm9ybWF0LCB0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuXG4gICAgICAgIGxldCBoYW5kbGVyID0gKHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVt0b2tlbl0pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVt0b2tlbl0gOiBudWxsO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSAodGhpcy5faGFuZGxlcnMgJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdWycqJ10pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVsnKiddIDogbnVsbDtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vIGhhbmRsZXIgZGVmaW5lZCBmb3IgJyArIGZvcm1hdCArICcgOiAnICsgdG9rZW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHRva2VuLCBkYXRhLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKFBPTSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQT007XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKCk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyogZ2xvYmFscyBkb2N1bWVudCAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgcGFyc2VyXG59XG5mcm9tICcuLy4uL3BhcnNlcic7XG5pbXBvcnQge1xuICAgIGFycmFpemUsXG4gICAgY2xvbmVcbn1cbmZyb20gJy4vLi4vdXRpbCc7XG5pbXBvcnQge1xuICAgIERvY3VtZW50LFxuICAgIFRleHROb2RlLFxuICAgIEJsb2NrTm9kZSxcbiAgICBQYXJhZ3JhcGgsXG4gICAgSGVhZGluZyxcbiAgICBJbWFnZSxcbiAgICBRdW90ZSxcbiAgICBTdGF0aWNCbG9ja05vZGVcbn1cbmZyb20gJy4vLi4vZG9jdW1lbnQnO1xuXG5mdW5jdGlvbiB3aGF0V3JhcHBlcihyb290Tm9kZSkge1xuICAgIHN3aXRjaCAocm9vdE5vZGUpIHtcbiAgICBjYXNlICd0ZCc6XG4gICAgY2FzZSAndGgnOlxuICAgICAgICByZXR1cm4gJ3RyJztcbiAgICBjYXNlICd0cic6XG4gICAgICAgIHJldHVybiAndGFibGUnO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnZGl2JztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVkaXRNb2RlKG5vZGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVkaXQpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcsIG5vZGUubmFtZSk7XG4gICAgICAgIG5vZGUuX19lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDaGlsZHJlbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50LmNoaWxkTm9kZXMpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgIC5hbGwoYXJyYWl6ZShlbGVtZW50LmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAubWFwKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSB8fCBjaGlsZC5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnJvbUhUTUwoY2hpbGQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29uc3RydWN0b3IgPT09IFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFpdGVtLmFic29sdXRlRW1wdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaXRlbSAhPT0gbnVsbDtcbiAgICAgICAgfSkpO1xufVxuXG4vKipcbiAqIFBhcnNlIFBPTSBKU09OIHJlcHJlc2VudGF0aW9uXG4gKiBAcGFyYW0gICB7c3RyaW5nfEhUTUxFbGVtZW50fSAgIG1vZGVsXG4gKiBAcGFyYW0gICB7b3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8Tm9kZT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tSFRNTChpbnB1dCwgb3B0aW9ucykge1xuXG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHdoYXRXcmFwcGVyKGlucHV0LnJlcGxhY2UoJy9eKFxccyopPChbYS16QS1aMC05Xy1dKyknLCAnJDInKS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaW5wdXQ7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4od3JhcHBlciwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChjaGlsZHJlbikgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5bMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChpdGVtKSA9PiAhKGl0ZW0gaW5zdGFuY2VvZiBUZXh0Tm9kZSB8fCBpdGVtIGluc3RhbmNlb2YgSW5saW5lTm9kZSkpXG4gICAgICAgICAgICAgICAgICAgIC5sZW5ndGhcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLm1hcCgoaXRlbSkgPT4gaXRlbSBpbnN0YW5jZW9mIEJsb2NrTm9kZSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50KGNoaWxkcmVuLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBhcmFncmFwaChpdGVtLnRleHQsIGl0ZW0uZm9ybWF0cywgaXRlbS5hdHRycywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnQoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaXRlbXMgPSBjaGlsZHJlbi5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgSW5saW5lTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbdGV4dCwgZm9ybWF0c10gPSBzdHJpbmdpZnkoW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRleHROb2RlKHRleHQsIGZvcm1hdHMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gaXRlbXMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0LmFwcGVuZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3Q7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZSgnaHRtbCcsIGlucHV0Lm5vZGVUeXBlID09PSAzID8gJ3RleHQnIDogaW5wdXQubm9kZU5hbWUsIGlucHV0KTtcbn1cblxuY2xhc3MgSW5saW5lTm9kZSBleHRlbmRzIEJsb2NrTm9kZSB7XG5cbn1cblxuZnVuY3Rpb24gZm9ybWF0VHlwZShpdGVtLCB0ZXh0KSB7XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gJ0EnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnQScsXG4gICAgICAgICAgICB0aXRsZTogaXRlbS5hdHRycy50aXRsZSB8fCB0ZXh0LFxuICAgICAgICAgICAgaHJlZjogaXRlbS5hdHRycy5ocmVmXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBpdGVtLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShpdGVtcykge1xuICAgIGxldCB0ZXh0ID0gJycsXG4gICAgICAgIGZvcm1hdHMgPSBbXSxcbiAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIElubGluZU5vZGUpIHtcbiAgICAgICAgICAgIGxldCBbaW5uZXJUZXh0LCBpbm5lckZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW0uaXRlbXMpLFxuICAgICAgICAgICAgICAgIGZvcm1hdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpY2U6IFtpbmRleCwgaW5uZXJUZXh0Lmxlbmd0aF0sXG4gICAgICAgICAgICAgICAgICAgIGFwcGx5OiBbZm9ybWF0VHlwZShpdGVtLCBpbm5lclRleHQpXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3JtYXRzLnB1c2goZm9ybWF0KTtcbiAgICAgICAgICAgIGlubmVyRm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgICBmb3JtYXRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzbGljZTogW2luZGV4ICsgZm9ybWF0LnNsaWNlWzBdLCBmb3JtYXQuc2xpY2VbMV1dLFxuICAgICAgICAgICAgICAgICAgICBhcHBseTogZm9ybWF0LmFwcGx5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICAgICAgZm9ybWF0cy5mb3JFYWNoKChvdGhlckZvcm1hdCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JtYXQgIT09IG90aGVyRm9ybWF0ICYmIGZvcm1hdC5zbGljZVswXSA9PT0gb3RoZXJGb3JtYXQuc2xpY2VbMF0gJiYgZm9ybWF0LnNsaWNlWzFdID09PSBvdGhlckZvcm1hdC5zbGljZVsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0LmFwcGx5ID0gZm9ybWF0LmFwcGx5LmNvbmNhdChvdGhlckZvcm1hdC5hcHBseSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXRzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRleHQgKz0gaW5uZXJUZXh0O1xuICAgICAgICAgICAgaW5kZXggKz0gaW5uZXJUZXh0Lmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgVGV4dE5vZGUpIHtcbiAgICAgICAgICAgIHRleHQgKz0gaXRlbS50ZXh0O1xuICAgICAgICAgICAgaW5kZXggKz0gaXRlbS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW3RleHQsIGZvcm1hdHNdO1xufVxuXG5mdW5jdGlvbiBoZWFkaW5nKHRva2VuLCBkYXRhLCBvcHRpb25zKSB7XG5cbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgbGV0IFt0ZXh0LCBmb3JtYXRzXSA9IHN0cmluZ2lmeShpdGVtcyk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBIZWFkaW5nKHRva2VuWzFdLnRvTG93ZXJDYXNlKCksIHRleHQgfHwgJycsIGZvcm1hdHMubGVuZ3RoID8gZm9ybWF0cyA6IG51bGwsIG9wdGlvbnMpKTtcbiAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcmFncmFwaCh0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsKSk7XG4gICAgICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVzKGlucHV0KSB7XG4gICAgbGV0IG91dHB1dCA9IG51bGw7XG4gICAgYXJyYWl6ZShpbnB1dClcbiAgICAgICAgLmZvckVhY2goKGF0dHJpYnV0ZSkgPT4ge1xuICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0IHx8IHt9O1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZS52YWx1ZSAmJiBhdHRyaWJ1dGUudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcblxufVxuXG5mdW5jdGlvbiBpZkF0dHIodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHF1b3RlKHRva2VuLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHByb2Nlc3NDaGlsZHJlbihkYXRhLCBvcHRpb25zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcblxuICAgICAgICAgICAgbGV0IHBhcmFncmFwaHMgPSBbXSxcbiAgICAgICAgICAgICAgICBsYXN0UGFyYWdyYXBoID0gW107XG4gICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBQYXJhZ3JhcGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RQYXJhZ3JhcGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsLCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFBhcmFncmFwaCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUoaXRlbSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RQYXJhZ3JhcGgucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChsYXN0UGFyYWdyYXBoLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxldCBbdGV4dCwgZm9ybWF0c10gPSBzdHJpbmdpZnkoaXRlbXMpO1xuICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsLCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFyYWdyYXBocyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgUXVvdGUoaXRlbXMpKTtcbiAgICAgICAgfSk7XG59XG5cbnBhcnNlci5vbignaHRtbCcsICd0ZXh0JywgKHRva2VuLCBkYXRhLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgVGV4dE5vZGUoZGF0YS50ZXh0Q29udGVudCwgbnVsbCwgb3B0aW9ucykpO1xufSk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDEnLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdIMicsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ0gzJywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDQnLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdINScsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ0g2JywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnUCcsIHBhcmFncmFwaCk7XG5wYXJzZXIub24oJ2h0bWwnLCAnQkxPQ0tRVU9URScsIHF1b3RlKTtcblxucGFyc2VyLm9uKCdodG1sJywgJ0lNRycsICh0b2tlbiwgZGF0YSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEltYWdlKGRhdGEuc3JjLCBpZkF0dHIoZGF0YS5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykpLCBpZkF0dHIoZGF0YS5nZXRBdHRyaWJ1dGUoJ2FsdCcpKSwgY2xvbmUoW2F0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKV0sIFsnc3JjJywgJ3RpdGxlJywgJ2FsdCddKSksIG9wdGlvbnMpO1xufSk7XG5cblsnQUREUkVTUycsICdBUlRJQ0xFJywgJ0FTSURFJywgJ0RJVicsICdGSUdVUkUnLCAnRk9PVEVSJywgJ0hFQURFUicsICdNQUlOJywgJ05BVicsICdTRUNUSU9OJ10uZm9yRWFjaCgobm9kZU5hbWUpID0+IHtcbiAgICBwYXJzZXIub24oJ2h0bWwnLCBub2RlTmFtZSwgKHRva2VuLCBkYXRhLCBvcHRpb25zKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFN0YXRpY0Jsb2NrTm9kZSh0b2tlbiwgaXRlbXMsIGF0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKSksIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxucGFyc2VyLm9uKCdodG1sJywgJyonLCAodG9rZW4sIGRhdGEsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSW5saW5lTm9kZSh0b2tlbiwgaXRlbXMsIGF0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKSksIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbn0pO1xuLypcbnBhcnNlci5vbignaHRtbCcsICcjdGV4dCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFRleHROb2RlKGRhdGEudGV4dENvbnRlbnQpKTtcbn0pO1xuXG5bXG4gICAgWydiJywgJ3N0cm9uZyddLFxuICAgIFsnYmlnJywgJ3N0cm9uZyddLFxuICAgIFsnaScsICdlbSddLFxuICAgICdzbWFsbCcsXG4gICAgWyd0dCcsICdjb2RlJ10sXG4gICAgWydhYmJyJywgJ3NlbWFudGljJywgJ2FiYnInXSxcbiAgICBbJ2Fjcm9ueW0nLCAnYWJicicsICdhYmJyJ10sXG4gICAgWydjaXRlJywgJ3NlbWFudGljJywgJ2NpdGUnXSxcbiAgICAnY29kZScsXG4gICAgWydkZm4nLCAnc2VtYW50aWMnLCAnZGVmaW5pdGlvbiddLFxuICAgICdlbScsXG4gICAgWyd0aW1lJywgJ3NlbWFudGljJywgJ3RpbWUnXSxcbiAgICBbJ3ZhcicsICdjb2RlJywgJ3ZhciddLFxuICAgIFsna2JkJywgJ2NvZGUnLCAna2JkJ10sXG4gICAgJ3N0cm9uZycsXG4gICAgWydzYW1wJywgJ2NvZGUnLCAnc2FtcGxlJ10sXG4gICAgJ2JkbycsXG4gICAgJ2EnLFxuICAgIC8vJ2JyJyxcbiAgICAvLydpbWcsXG4gICAgLy8nbWFwJyxcbiAgICAvLydvYmplY3QnLFxuICAgIFsncScsICdzZW1hbnRpYycsICdxdW90YXRpb24nXSxcbiAgICAvL3NjcmlwdFxuICAgICdzcGFuJyxcbiAgICBkZWwsXG4gICAgc1xuICAgICdzdWInLFxuICAgICdzdXAnLFxuICAgIC8vYnV0dG9uXG4gICAgLy9pbnB1dFxuICAgIC8vbGFiZWxcbiAgICAvL3NlbGVjdFxuICAgIC8vdGV4dGFyZWFcbl0uZm9yRWFjaCgoaW5saW5lUnVsZSkgPT4ge1xuXG4gICAgbGV0IGlucHV0ID0gdHlwZW9mIGlubGluZVJ1bGUgPT09ICdzdHJpbmcnID8gaW5saW5lUnVsZSA6IGlubGluZVJ1bGVbMF07XG5cbiAgICBwYXJzZXIub24oJ2h0bWwnLCBpbnB1dCwgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSlcbiAgICAgICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuXG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxufSk7XG4qL1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIHBhcnNlclxufVxuZnJvbSAnLi8uLi9wYXJzZXInO1xuXG5pbXBvcnQge1xuICAgIFRleHROb2RlLFxuICAgIERvY3VtZW50LFxuICAgIEhlYWRpbmcsXG4gICAgUGFyYWdyYXBoLFxuICAgIEltYWdlLFxuICAgIEZpZWxkcyxcbiAgICBWYXJpYW50c1xufVxuZnJvbSAnLi8uLi9kb2N1bWVudCc7XG5cbi8qKlxuICogUGFyc2UgUE9NIEpTT04gcmVwcmVzZW50YXRpb25cbiAqIEBwYXJhbSAgIHtvYmplY3R9ICAgbW9kZWxcbiAqIEBwYXJhbSAgIHtvcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxOb2RlPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21QT00obW9kZWwpIHtcbiAgICBpZiAoIW1vZGVsKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZXIucGFyc2UoJ3BvbScsIG1vZGVsLnR5cGUsIG1vZGVsKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NoaWxkTm9kZXMoaXRlbXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tUE9NKGl0ZW0pO1xuICAgIH0pKS50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtKSA9PiAhIWl0ZW0pO1xuICAgIH0pO1xufVxuXG5wYXJzZXIub24oJ3BvbScsICdkb2N1bWVudCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBwcm9jZXNzQ2hpbGROb2RlcyhkYXRhLml0ZW1zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnQoaXRlbXMpO1xuICAgICAgICB9KTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdoZWFkaW5nJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSGVhZGluZyhkYXRhLmxldmVsLCBkYXRhLnRleHQsIGRhdGEuZm9ybWF0cywgZGF0YS5hdHRycykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ3BhcmFncmFwaCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaChkYXRhLnRleHQsIGRhdGEuZm9ybWF0cywgZGF0YS5hdHRycykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ3RleHQnLCAodG9rZW4sIGRhdGEpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBUZXh0Tm9kZShkYXRhLnRleHQsIGRhdGEuZm9ybWF0cykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ2ltYWdlJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSW1hZ2UoZGF0YS5zcmMsIGRhdGEudGl0bGUsIGRhdGEuYWx0KSk7XG59KTtcblxucGFyc2VyLm9uKCdwb20nLCAnRmllbGRzJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgbGV0IGZpZWxkcyA9IHt9O1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGRhdGEpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ3R5cGUnKVxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21QT00oZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoUE9NKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHNba2V5XSA9IFBPTTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgRmllbGRzKGZpZWxkcykpO1xuICAgICAgICB9KTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdWYXJpYW50cycsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIGxldCB2YXJpYW50cyA9IHt9O1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGRhdGEpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ3R5cGUnKVxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21QT00oZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoUE9NKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50c1trZXldID0gUE9NO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBWYXJpYW50cyh2YXJpYW50cykpO1xuICAgICAgICB9KTtcbn0pO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIEV2ZW50LCBFbWl0dGVyXG59XG5mcm9tICcuL2VtaXR0ZXInO1xuXG5leHBvcnQgY29uc3QgQ0hBTkdFID0gJ2NoYW5nZSc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9ET0NVTUVOVCA9ICcjZGVmYXVsdCc7XG5cbmNsYXNzIFJlcG9zaXRvcnkgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9kb2N1bWVudHMgPSB7fTtcbiAgICB9XG5cbiAgICBnZXQgbWFpbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50c1tERUZBVUxUX0RPQ1VNRU5UXTtcbiAgICB9XG5cbiAgICBnZXQoZG9jdW1lbnRJZCkge1xuICAgICAgICBpZiAodGhpcy5fZG9jdW1lbnRzW2RvY3VtZW50SWRdKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnRzW2RvY3VtZW50SWRdLmNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXQoZG9jdW1lbnRJZCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRzW2RvY3VtZW50SWRdID0ge1xuICAgICAgICAgICAgY29udGVudDogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5lbWl0KENIQU5HRSwge1xuICAgICAgICAgICAgaWQ6IGRvY3VtZW50SWRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaGFzKGRvY3VtZW50SWQpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZG9jdW1lbnRzW2RvY3VtZW50SWRdO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgbGV0IGRhdGEgPSB7fTtcbiAgICAgICAgT2JqZWN0XG4gICAgICAgICAgICAua2V5cyh0aGlzLl9kb2N1bWVudHMpXG4gICAgICAgICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9kb2N1bWVudHNba2V5XS5jb250ZW50KTtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBrZXksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHRoaXMuX2RvY3VtZW50c1trZXldLmNvbnRlbnQudG9KU09OKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbn1cblxuXG5leHBvcnQgdmFyIHJlcG9zaXRvcnkgPSBuZXcgUmVwb3NpdG9yeSgpO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5jbGFzcyBTZXJpYWxpemVyIHtcblxuICAgIHNlcmlhbGl6ZShmb3JtYXQsIG5vZGUsIG9wdGlvbnMpIHtcblxuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ01vZGVsIGlzIGVtcHR5JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFub2RlLnR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1VuZGVmaW5lZCBub2RlIHR5cGUnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGUoZm9ybWF0LCBub2RlLnR5cGUsIG5vZGUsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIG9uKGZvcm1hdCwgbm9kZVR5cGUsIGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlcnMgPSB0aGlzLl9oYW5kbGVycyB8fCB7fTtcbiAgICAgICAgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSA9IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gfHwge307XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bbm9kZVR5cGVdID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBoYW5kbGUoZm9ybWF0LCBub2RlVHlwZSwgbm9kZSwgb3B0aW9ucykge1xuXG4gICAgICAgIGxldCBoYW5kbGVyID0gKHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVtub2RlVHlwZV0pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVtub2RlVHlwZV0gOiBudWxsO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSAodGhpcy5faGFuZGxlcnMgJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdWycqJ10pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVsnKiddIDogbnVsbDtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vIGhhbmRsZXIgZGVmaW5lZCBmb3IgJyArIGZvcm1hdCArICcgOiAnICsgbm9kZVR5cGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFuZGxlcihub2RlLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKGh0bWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZUNvbnRlbnRzKGZvcm1hdCwgYXJyYXksIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgICAgLmFsbChhcnJheS5tYXAoKGNvbnRlbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5zZXJpYWxpemUoJ2h0bWwnLCBjb250ZW50LCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pKTtcblxuICAgIH1cbn1cblxuZXhwb3J0IHZhciBzZXJpYWxpemVyID0gbmV3IFNlcmlhbGl6ZXIoKTtcbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKiBnbG9iYWxzIGRvY3VtZW50ICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBzZXJpYWxpemVyXG59XG5mcm9tICcuLy4uL3NlcmlhbGl6ZXInO1xuXG5pbXBvcnQge1xuICAgIFRleHROb2RlXG59XG5mcm9tICcuLy4uL2RvY3VtZW50JztcbmltcG9ydCB7XG4gICAgYXJyYWl6ZVxufVxuZnJvbSAnLi8uLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvSFRNTChtb2RlbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBzZXJpYWxpemVyLnNlcmlhbGl6ZSgnaHRtbCcsIG1vZGVsLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gb3RoZXJBdHRycyhvYmplY3QsIGV4Y2VwdCkge1xuICAgIGxldCByZXN1bHQgPSB7fTtcbiAgICBPYmplY3RcbiAgICAgICAgLmtleXMob2JqZWN0KVxuICAgICAgICAuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBleGNlcHQuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XTtcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0KHN0cmluZywgZm9ybWF0cykge1xuICAgIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpLFxuICAgICAgICBzbGljZXMgPSBzdHJpbmcuc3BsaXQoJycpLm1hcCgoY2hhcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjaGFyOiBjaGFyLFxuICAgICAgICAgICAgICAgIGFwcGx5OiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICBzbGljZXMucHVzaCh7XG4gICAgICAgIGNoYXI6ICcnLFxuICAgICAgICBhcHBseTogW11cbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKHN0cmluZyk7XG5cbiAgICBmb3JtYXRzLmZvckVhY2goKGZvcm1hdCkgPT4ge1xuICAgICAgICBsZXQgZnJvbSA9IGZvcm1hdC5zbGljZVswXSxcbiAgICAgICAgICAgIHRvID0gZnJvbSArIGZvcm1hdC5zbGljZVsxXTtcblxuICAgICAgICBjb25zb2xlLmxvZyhmcm9tLCB0bywgc2xpY2VzLmxlbmd0aCk7XG5cbiAgICAgICAgZm9ybWF0LmFwcGx5LmZvckVhY2goKGFwcGx5KSA9PiB7XG4gICAgICAgICAgICBpZiAoc2xpY2VzW2Zyb21dLmFwcGx5LmluZGV4T2YoYXBwbHkpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgc2xpY2VzW2Zyb21dLmFwcGx5LnB1c2goYXBwbHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNsaWNlc1t0b10uYXBwbHkuaW5kZXhPZignLycgKyBhcHBseSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzbGljZXNbdG9dLmFwcGx5LnB1c2goJy8nICsgYXBwbHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICB3cmFwcGVyLmlubmVySFRNTCA9IHNsaWNlcy5tYXAoKGNoYXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNoYXIuYXBwbHkubWFwKCh0YWcpID0+ICc8JyArIHRhZyArICc+Jykuam9pbignJykgKyBjaGFyLmNoYXI7XG4gICAgfSkuam9pbignJyk7XG4gICAgcmV0dXJuIGFycmFpemUod3JhcHBlci5jaGlsZE5vZGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnQobm9kZSwgbm9kZVR5cGUsIGF0dHJpYnV0ZXMsIGNvbnRlbnQsIG9wdGlvbnMpIHtcblxuICAgIGxldCBwcm9taXNlO1xuXG4gICAgaWYgKGNvbnRlbnQpIHtcblxuICAgICAgICBwcm9taXNlID0gc2VyaWFsaXplci5oYW5kbGVDb250ZW50cygnaHRtbCcsIGNvbnRlbnQgfHwgW10sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoY29udGVudCkgPT4ge1xuXG4gICAgICAgIGlmIChub2RlLmZvcm1hdHMgJiYgbm9kZS5mb3JtYXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGVudCA9IGZvcm1hdChjb250ZW50WzBdLm5vZGVWYWx1ZSwgbm9kZS5mb3JtYXRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlVHlwZSk7XG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZWRpdCkge1xuICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcsIG5vZGUubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIE9iamVjdFxuICAgICAgICAgICAgICAgIC5rZXlzKGF0dHJpYnV0ZXMpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goKGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuZm9yRWFjaCgoY2hpbGQpID0+IGVsZW0uYXBwZW5kQ2hpbGQoY2hpbGQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbTtcbiAgICB9KTtcbn1cblxuY2xhc3MgRmFrZURvYyB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgIH1cblxuICAgIGFwcGVuZENoaWxkKGNoaWxkKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgfVxuXG4gICAgZ2V0IG91dGVySFRNTCgpIHtcbiAgICAgICAgbGV0IHN0ciA9ICcnO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gY2hpbGQub3V0ZXJIVE1MO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gY2hpbGQudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbn1cblxuc2VyaWFsaXplci5vbignaHRtbCcsICdkb2N1bWVudCcsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXJcbiAgICAgICAgLmhhbmRsZUNvbnRlbnRzKCdodG1sJywgbm9kZS5pdGVtcyB8fCBbXSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGNvbnRlbnRzKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cHV0ID0gbmV3IEZha2VEb2MoKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbnRlbnRzKSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRzLmZvckVhY2goKGNoaWxkKSA9PiBvdXRwdXQuYXBwZW5kQ2hpbGQoY2hpbGQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0pO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnaGVhZGluZycsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGVsZW1lbnQobm9kZSwgJ2gnICsgKG5vZGUubGV2ZWwgfHwgMSksIG5vZGUuYXR0cigpLCBbbmV3IFRleHROb2RlKG5vZGUudGV4dCwgbm9kZS5mb3JtYXRzKV0sIG9wdGlvbnMpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAncGFyYWdyYXBoJywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gZWxlbWVudChub2RlLCAncCcsIG5vZGUuYXR0cigpLCBbbmV3IFRleHROb2RlKG5vZGUudGV4dCwgbm9kZS5mb3JtYXRzKV0sIG9wdGlvbnMpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnaW1hZ2UnLCAobm9kZSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBlbGVtZW50KG5vZGUsICdpbWcnLCBub2RlLmF0dHIoKSwgbnVsbCwgb3B0aW9ucyk7XG59KTtcblxuc2VyaWFsaXplci5vbignaHRtbCcsICd0ZXh0JywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUudGV4dCk7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5lZGl0KSB7XG4gICAgICAgIC8vZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBub2RlLm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGVsZW1lbnQpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnKicsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGVsZW1lbnQobm9kZSwgbm9kZS5fdHlwZSwgbm9kZS5hdHRyKCksIG5vZGUuaXRlbXMsIG9wdGlvbnMpO1xufSk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmV4cG9ydCBjbGFzcyBUb29sYmFyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvL3N1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS10b29sYmFyJywgJycpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gJzxkaXYgZGF0YS1za2FyeW5hLXRvb2xiYXItYWN0aW9ucz5hYWFhYWFhYWE8L2Rpdj48ZGl2IGRhdGEtc2thcnluYS10b29sYmFyLWFycm93PjxzcGFuPjwvc3Bhbj48L2Rpdj4nO1xuICAgICAgICB0aGlzLmFycm93ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXNrYXJ5bmEtdG9vbGJhci1hcnJvd10nKTtcblxuICAgICAgICBsZXQgc3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgc3R5bGVzLmlubmVyVGV4dCA9IGBcbiAgICAgICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbGJhcl0ge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiBoaWRkZW47XG4gICAgICAgICAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgICAgICAgICAgICB6LWluZGV4OiAxMDAwMDtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBub25lO1xuICAgICAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2xiYXItYWN0aW9uc10ge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLHJnYmEoNDksNDksNDcsLjk5KSwjMjYyNjI1KTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0LXg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2xiYXItYXJyb3ddIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgYm90dG9tOiAtMTBweDtcbiAgICAgICAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgICAgICAgICAgY2xpcDogcmVjdCgxMHB4IDIwcHggMjBweCAwKTtcbiAgICAgICAgICAgICAgICBtYXJnaW4tbGVmdDogLTEwcHg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbGJhci1hcnJvd10gPiBzcGFuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICB3aWR0aDogMjBweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDIwcHg7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzI2MjYyNTtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSg0NWRlZykgc2NhbGUoLjUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYDtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlcyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgICB9XG5cbiAgICBnZXRTZWxlY3Rpb25Db29yZHModGhlV2luZG93KSB7XG4gICAgICAgIGxldCB3aW4gPSB0aGVXaW5kb3cgfHwgd2luZG93LFxuICAgICAgICAgICAgZG9jID0gd2luLmRvY3VtZW50LFxuICAgICAgICAgICAgc2VsID0gZG9jLnNlbGVjdGlvbixcbiAgICAgICAgICAgIHJhbmdlLCByZWN0cywgcmVjdCxcbiAgICAgICAgICAgIHggPSAwLFxuICAgICAgICAgICAgeSA9IDA7XG4gICAgICAgIGlmIChzZWwpIHtcbiAgICAgICAgICAgIGlmIChzZWwudHlwZSAhPSBcIkNvbnRyb2xcIikge1xuICAgICAgICAgICAgICAgIHJhbmdlID0gc2VsLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgeCA9IHJhbmdlLmJvdW5kaW5nTGVmdDtcbiAgICAgICAgICAgICAgICB5ID0gcmFuZ2UuYm91bmRpbmdUb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAod2luLmdldFNlbGVjdGlvbikge1xuICAgICAgICAgICAgc2VsID0gd2luLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBzZWwuZ2V0UmFuZ2VBdCgwKS5jbG9uZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlLmdldENsaWVudFJlY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZWN0cyA9IHJhbmdlLmdldENsaWVudFJlY3RzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3QgPSByZWN0c1swXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB4ID0gcmVjdC5sZWZ0O1xuICAgICAgICAgICAgICAgICAgICB5ID0gcmVjdC50b3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZhbGwgYmFjayB0byBpbnNlcnRpbmcgYSB0ZW1wb3JhcnkgZWxlbWVudFxuICAgICAgICAgICAgICAgIGlmICh4ID09IDAgJiYgeSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzcGFuID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3Bhbi5nZXRDbGllbnRSZWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIHNwYW4gaGFzIGRpbWVuc2lvbnMgYW5kIHBvc2l0aW9uIGJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRpbmcgYSB6ZXJvLXdpZHRoIHNwYWNlIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgICAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoXCJcXHUyMDBiXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmdlLmluc2VydE5vZGUoc3Bhbik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWN0ID0gc3Bhbi5nZXRDbGllbnRSZWN0cygpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IHJlY3QubGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSByZWN0LnRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcGFuUGFyZW50ID0gc3Bhbi5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BhblBhcmVudC5yZW1vdmVDaGlsZChzcGFuKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2x1ZSBhbnkgYnJva2VuIHRleHQgbm9kZXMgYmFjayB0b2dldGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhblBhcmVudC5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhbmNob3IoKSB7XG4gICAgICAgIGxldCBjb29yZHMgPSB0aGlzLmdldFNlbGVjdGlvbkNvb3JkcygpLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICByZWN0LFxuICAgICAgICAgICAgYXJyb3c7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICByZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgYXJyb3cgPSB0aGlzLmFycm93LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVjdCwgY29vcmRzLCBhcnJvdyk7XG4gICAgICAgICAgICB0aGlzLnNob3coY29vcmRzLngsIGNvb3Jkcy55IC0gcmVjdC5oZWlnaHQgLSAxMCk7XG4gICAgICAgIH0sIDEpO1xuICAgIH1cblxuICAgIHNob3coeCwgeSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0geSArICdweCc7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0geCArICdweCc7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPSBudWxsO1xuICAgIH1cbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuLyoqXG4gKiBDb252ZXJ0IGl0ZXJhYmxlIG9iamVjdHMgaW50byBhcnJheXNcbiAqIEBwYXJhbSAgIHtJdGVyYWJsZX0gaXRlcmFibGVcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmFpemUoaXRlcmFibGUpIHtcbiAgICByZXR1cm4gW10uc2xpY2UuYXBwbHkoaXRlcmFibGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoaW5wdXRzLCBleGNlcHQpIHtcbiAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgaW5wdXRzXG4gICAgICAgIC5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBPYmplY3RcbiAgICAgICAgICAgICAgICAua2V5cyhpbnB1dClcbiAgICAgICAgICAgICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleGNlcHQgJiYgZXhjZXB0LmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaW5wdXRba2V5XSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUsIGJyb3dzZXI6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5leHBvcnQgY2xhc3MgWEhSIHtcbiAgc3RhdGljIGFqYXgocGF0aCwgbWV0aG9kLCBkYXRhLCByYXcpIHtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICAgICAgaHR0cE1ldGhvZCA9IG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICB4aHIub3BlbihodHRwTWV0aG9kLCBwYXRoKTtcbiAgICAgIGlmIChodHRwTWV0aG9kID09PSAncG9zdCcgfHwgaHR0cE1ldGhvZCA9PT0gJ3B1dCcpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICB9XG5cbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGxldCBET05FID0gNCwgLy8gcmVhZHlTdGF0ZSA0IG1lYW5zIHRoZSByZXF1ZXN0IGlzIGRvbmUuXG4gICAgICAgICAgT0sgPSAyMDA7IC8vIHN0YXR1cyAyMDAgaXMgYSBzdWNjZXNzZnVsIHJldHVybi5cbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSBET05FKSB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IE9LKSB7XG4gICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZVRleHQpOyAvLyAnVGhpcyBpcyB0aGUgcmV0dXJuZWQgdGV4dC4nXG4gICAgICAgICAgfSBlbHNlIGlmICh4aHIuc3RhdHVzID09PSAnMjA0Jykge1xuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRXJyb3I6ICcgKyB4aHIuc3RhdHVzKSk7IC8vIEFuIGVycm9yIG9jY3VycmVkIGR1cmluZyB0aGUgcmVxdWVzdC5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHhoci5zZW5kKGRhdGEgPyAocmF3ID8gZGF0YSA6IEpTT04uc3RyaW5naWZ5KGRhdGEpKSA6IG51bGwpO1xuXG4gICAgfSk7XG4gIH1cbiAgc3RhdGljIGdldChwYXRoLCByYXcpIHtcbiAgICByZXR1cm4gWEhSLmFqYXgocGF0aCwgJ2dldCcsIG51bGwsIHJhdyk7XG4gIH1cbiAgc3RhdGljIHBvc3QocGF0aCwgZGF0YSwgcmF3KSB7XG4gICAgcmV0dXJuIFhIUi5hamF4KHBhdGgsICdwb3N0JywgZGF0YSwgcmF3KTtcbiAgfVxuICBzdGF0aWMgcHV0KHBhdGgsIGRhdGEsIHJhdykge1xuICAgIHJldHVybiBYSFIuYWpheChwYXRoLCAncHV0JywgZGF0YSwgcmF3KTtcbiAgfVxuICBzdGF0aWMgZGVsZXRlKHBhdGgsIHJhdykge1xuICAgIHJldHVybiBYSFIuYWpheChwYXRoLCAnZGVsZXRlJywgbnVsbCwgcmF3KTtcbiAgfVxufVxuIl19
