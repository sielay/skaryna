(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
 * @see App
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
    function Node(id) {
        _classCallCheck(this, Node);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Node).call(this));

        _this.name = id || randomID(_this);

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
    }, {
        key: 'set',
        value: function set() {
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
        key: 'setById',
        value: function setById(id, value) {
            var _this3 = this;

            var found = false;
            this.items.forEach(function (child, index) {
                if (found) return;
                if (child.name === id) {
                    _this3.items[index] = value;
                    found = true;
                    return;
                }
                found = child.setById ? child.setById(id, value) : false;
            });
            return found;
        }
    }, {
        key: 'set',
        value: function set(path, value) {

            if (path[0] === '@') {
                return this.setById(path.slice(1), value);
            }

            var elements = path.split('.'),
                index = elements.shift(),
                rest = elements.join('.'),
                child = void 0;

            if (isNaN(index)) {
                return null;
            }

            if (rest.length && child) {
                return this.items[+index].set(rest, value);
            }

            this.items.splice(+index, 0, value);
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

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(TextNode).call(this));

        _this6.text = text && text.toString ? text.toString() : '';
        _this6.formats = formats || null;
        _this6.attrs = attrs;
        return _this6;
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
            var _this7 = this;

            if (!(node instanceof TextNode)) {
                throw new Error('Only text nodes can be joined');
            }
            if (node.formats) {
                this.formats = this.formats || [];
                node.formats.forEach(function (format) {
                    _this7.formats.push({
                        slice: [format.slice[0] + _this7.text.length, format.slice[1]],
                        apply: format.apply
                    });
                });
            }
            this.text += node.text;
        }
    }, {
        key: 'decorate',
        value: function decorate(element) {
            var self = this;
            return (0, _toHTML.toHTML)(this, {
                edit: true
            }).then(function (html) {
                element.setAttribute('contenteditable', true);
                element.setAttribute('data-skaryna-id', self.name);
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

        var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(Image).call(this, 'image'));

        _this9.src = source;
        _this9.title = title;
        _this9.alt = alt;
        return _this9;
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

        var _this10 = _possibleConstructorReturn(this, Object.getPrototypeOf(Heading).call(this, text, formats, attrs));

        _this10.level = Math.min(6, level || 1);
        return _this10;
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

        var _this12 = _possibleConstructorReturn(this, Object.getPrototypeOf(Fields).call(this));

        _this12._map = data || {};
        return _this12;
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
        key: 'set',
        value: function set(path, value) {
            var elements = path.split('.'),
                index = elements.shift(),
                rest = elements.join('.'),
                child = void 0;

            if (rest.length && child) {
                return this._map[index].get(rest, value);
            }

            this._map[index] = value;
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

        var _this13 = _possibleConstructorReturn(this, Object.getPrototypeOf(Variants).call(this));

        _this13._variants = data;
        return _this13;
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

},{"./emitter":2,"./serializer/toHTML":7,"./util":8}],2:[function(require,module,exports){
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

/**
 * Adds listener for an event
 * @param {string} eventName
 * @param {function} handler
 * @param {object} context
 * @param {array} args
 * @param {boolean} once
 */
function _on(eventName, handler, context, args, once) {
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
function _once(eventName, handler, context, args) {
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
function _off(eventName, handler, context, args, once) {
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
function _emit(eventName, data, parent) {
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
function _bubbleEvent(eventName, toEmitter) {
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
function _getListeners(eventName, handler, context, args) {
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

/*
 * @class Emitter
 */

var Emitter = exports.Emitter = function () {
    function Emitter() {
        _classCallCheck(this, Emitter);
    }

    _createClass(Emitter, [{
        key: 'on',
        value: function on() {
            _on.apply(this, arguments);
        }
    }, {
        key: 'once',
        value: function once() {
            _once.apply(this, arguments);
        }
    }, {
        key: 'off',
        value: function off() {
            _off.apply(this, arguments);
        }
    }, {
        key: 'emit',
        value: function emit() {
            _emit.apply(this, arguments);
        }
    }, {
        key: 'bubbleEvent',
        value: function bubbleEvent() {
            _bubbleEvent.apply(this, arguments);
        }
    }, {
        key: 'getListeners',
        value: function getListeners() {
            return _getListeners.apply(this, arguments);
        }
    }], [{
        key: 'on',
        value: function on() {
            _on.apply(this, arguments);
        }
    }, {
        key: 'once',
        value: function once() {
            _once.apply(this, arguments);
        }
    }, {
        key: 'off',
        value: function off() {
            _off.apply(this, arguments);
        }
    }, {
        key: 'emit',
        value: function emit() {
            _emit.apply(this, arguments);
        }
    }, {
        key: 'bubbleEvent',
        value: function bubbleEvent() {
            _bubbleEvent.apply(this, arguments);
        }
    }, {
        key: 'getListeners',
        value: function getListeners() {
            return _getListeners.apply(this, arguments);
        }
    }]);

    return Emitter;
}();

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"./../document":1,"./../parser":3,"./../util":8}],5:[function(require,module,exports){
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

},{"./../document":1,"./../parser":3}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

    formats.forEach(function (format) {
        var from = format.slice[0],
            to = from + format.slice[1];

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
            if (node instanceof _document.TextNode) {
                elem.setAttribute('contenteditable', 'true');
            }
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

},{"./../document":1,"./../serializer":6,"./../util":8}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.arraize = arraize;
exports.query = query;
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

function query(node, query) {
    return arraize(node.querySelectorAll(query));
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

},{}],9:[function(require,module,exports){
'use strict';

var _skaryna = require('./skaryna');

var _util = require('pageobjectmodel/src/util');

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

(0, _util.query)(document.body, '[data-skaryna]').forEach(function (element) {
    return _skaryna.Skaryna.initEditor(element);
});

window.Skaryna = _skaryna.Skaryna;

},{"./skaryna":10,"pageobjectmodel/src/util":8}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Skaryna = exports.Repository = exports.XHR = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* jslint esnext:true, node:true, browser:true */
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

var _fromHTML = require('pageobjectmodel/src/parser/fromHTML');

var _fromPOM = require('pageobjectmodel/src/parser/fromPOM');

var _toHTML = require('pageobjectmodel/src/serializer/toHTML');

var _document = require('pageobjectmodel/src/document');

var _emitter = require('pageobjectmodel/src/emitter');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_DOCUMENT = '#default';

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

/**
 * @class
 * @name XHR
 */

var XHR = exports.XHR = function () {
    function XHR() {
        _classCallCheck(this, XHR);
    }

    _createClass(XHR, null, [{
        key: 'ajax',

        /**
         * Rerform asynchrounous request
         * @param   {stirng}  path   URL to resource
         * @param   {string}  method HTTP method to be used
         * @param   {mixed}   data   data to be sent in post or put
         * @param   {boolean} raw    if should not parse response as JSON
         * @returns {Promise}
         */
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
        /**
         * Performs GET request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw   if should not parse response as JSON
         * @returns {Promise}
         */

    }, {
        key: 'get',
        value: function get(path, raw) {
            return XHR.ajax(path, 'get', null, raw);
        }
        /**
         * Performs POST request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw  if should not parse response as JSON
         * @param   {mixed}   data data to be sent
         * @returns {Promise}
         */

    }, {
        key: 'post',
        value: function post(path, data, raw) {
            return XHR.ajax(path, 'post', data, raw);
        }
        /**
         * Performs PUT request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw  if should not parse response as JSON
         * @param   {mixed}   data data to be sent
         * @returns {Promise}
         */

    }, {
        key: 'put',
        value: function put(path, data, raw) {
            return XHR.ajax(path, 'put', data, raw);
        }
        /**
         * Performs DELETE request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw   if should not parse response as JSON
         * @returns {Promise}
         */

    }, {
        key: 'delete',
        value: function _delete(path, raw) {
            return XHR.ajax(path, 'delete', null, raw);
        }
    }]);

    return XHR;
}();

/**
 * @class
 * @name Repository
 * @extends Emitter
 */


var Repository = exports.Repository = function (_Emitter) {
    _inherits(Repository, _Emitter);

    function Repository() {
        _classCallCheck(this, Repository);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Repository).apply(this, arguments));
    }

    _createClass(Repository, null, [{
        key: 'report',


        /**
         * Reports change/update in document
         * @param {string} doc             name of document
         * @param {string|undefined} path  path in document or undefined if whole document has updated
         * @param {mixed}  value           new content
         */
        value: function report(doc, path, value) {
            var docs = this.documents;

            if (path === undefined) {
                docs[doc] = value;
            } else {
                if (!docs.hasOwnProperty(doc)) {
                    docs[doc] = new _document.Fields();
                }
                docs[doc].set(path, value);
            }
            this.emit('change', {
                doc: doc,
                path: path,
                id: value.name
            });
            document.querySelector('#pom').innerText = JSON.stringify(this.documents, null, 2);
        }
    }, {
        key: 'documents',


        /**
         * @property {object} documents hashmap
         */
        get: function get() {
            this._documents = this._documents || {};
            return this._documents;
        }
    }]);

    return Repository;
}(_emitter.Emitter);

function attr(element, attribute, fallback) {
    if (!element.hasAttribute(attribute)) {
        return fallback;
    }
    return element.getAttribute(attribute).toString();
}

var Skaryna = exports.Skaryna = function () {
    _createClass(Skaryna, null, [{
        key: 'initEditor',
        value: function initEditor(element) {
            var config = {
                allow: attr(element, 'data-skaryna-allow', '*').split(/\s*,\s*/),
                path: attr(element, 'data-skaryna-path'),
                placeholder: attr(element, 'placeholder'),
                doc: attr(element, 'data-skaryna-doc', DEFAULT_DOCUMENT),
                variant: attr(element, 'data-skaryna-variant')
            },
                editor = new Skaryna(element, config);
            Skaryna.editors.push(editor);
            return editor;
        }
    }, {
        key: 'load',
        value: function load(path, asDocument) {
            return XHR.get(path).then(function (content) {
                return (0, _fromPOM.fromPOM)(JSON.parse(content));
            }).then(function (pom) {
                return Repository.report(asDocument || DEFAULT_DOCUMENT, undefined, pom);
            });
        }
    }, {
        key: 'editors',
        get: function get() {
            this._editors = this._editors || [];
            return this._editors;
        }
    }]);

    function Skaryna(element, config) {
        _classCallCheck(this, Skaryna);

        this._config = config;
        this.element = element;
        Repository.on('change', this.onRepositoryUpdate.bind(this));
        this.ready = (0, _fromHTML.fromHTML)(element).then(function (content) {
            Repository.report(config.doc, config.path, content);
        });
    }

    _createClass(Skaryna, [{
        key: 'redrawEditor',
        value: function redrawEditor() {
            var self = this,
                node = Repository.documents[this._config.doc];

            if (this._config.path) {
                node = node.get(this._config.path);
            }

            if (node && node.type === 'Variants' && node.best) {
                node = node.best(this._config.variant || '*');
            }

            if (!node) {
                return;
            }

            return node.decorate(self.element).then(function () {
                self.element.addEventListener('keydown', self.onKeyUp.bind(self));
            });
        }
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
            node = this.getEditableNode(node);
            document.querySelector('#current-element').innerText = node.outerHTML;
            return node;
        }
    }, {
        key: 'getEditableNode',
        value: function getEditableNode(node) {
            while (node && (!node.hasAttribute || !node.hasAttribute('data-skaryna-id'))) {
                node = node.parentNode;
            }
            return node;
        }

        /**
         * Handles key up event
         * @param {Event} event
         */

    }, {
        key: 'onKeyUp',
        value: function onKeyUp(event) {
            var _this2 = this;

            var current = this.getCurrentElement(event.target);
            if (PREVENT.indexOf(event.keyCode) !== -1) {
                event.stopPropagation();
                event.preventDefault();
                //this.ownAction(event.keyCode, current);
            } else {
                setTimeout(function () {
                    return _this2.elementUpdated(current);
                }, 0);
            }
        }
    }, {
        key: 'onRepositoryUpdate',
        value: function onRepositoryUpdate(event) {
            if (event.data.doc !== this._config.doc) return;
            if (event.data.path === undefined) {
                this.redrawEditor();
            }
        }
    }, {
        key: 'elementUpdated',
        value: function elementUpdated(element) {
            var self = this;
            (0, _fromHTML.fromHTML)(element).then(function (pom) {
                pom.name = element.getAttribute('data-skaryna-id').toString();
                Repository.report(self._config.doc, '@' + pom.name, pom);
            });
        }
    }]);

    return Skaryna;
}();

},{"pageobjectmodel/src/document":1,"pageobjectmodel/src/emitter":2,"pageobjectmodel/src/parser/fromHTML":4,"pageobjectmodel/src/parser/fromPOM":5,"pageobjectmodel/src/serializer/toHTML":7}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9wb20vc3JjL2RvY3VtZW50LmpzIiwiLi4vcG9tL3NyYy9lbWl0dGVyLmpzIiwiLi4vcG9tL3NyYy9wYXJzZXIuanMiLCIuLi9wb20vc3JjL3BhcnNlci9mcm9tSFRNTC5qcyIsIi4uL3BvbS9zcmMvcGFyc2VyL2Zyb21QT00uanMiLCIuLi9wb20vc3JjL3NlcmlhbGl6ZXIuanMiLCIuLi9wb20vc3JjL3NlcmlhbGl6ZXIvdG9IVE1MLmpzIiwiLi4vcG9tL3NyYy91dGlsLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NrYXJ5bmEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7OztRQytDZ0IsWSxHQUFBLFk7UUFVQSxTLEdBQUEsUztRQW1CQSxPLEdBQUEsTztRQUlBLFMsR0FBQSxTO1FBUUEsUSxHQUFBLFE7O0FBL0RoQjs7QUFJQTs7QUFLQTs7Ozs7OytlQWxDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQ0EsSUFBSSxhQUFhLEVBQWpCOztBQUdBOzs7OztBQUtPLFNBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEyQjtBQUM5QixXQUFPLE9BQU8sR0FBUCxFQUFZLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtELE1BQWxELENBQVA7QUFDSDs7QUFFRDs7Ozs7O0FBTU8sU0FBUyxTQUFULENBQW1CLElBQW5CLEVBQXlCLE1BQXpCLEVBQWlDO0FBQ3BDLFFBQUksU0FBUyxJQUFiO0FBQUEsUUFDSSxJQURKOztBQUdBLFNBQUssT0FBTCxDQUFhLFVBQVUsSUFBVixFQUFnQjtBQUN6QixZQUFJLFNBQVMsSUFBSSxNQUFKLENBQVcsYUFBYSxJQUFiLEVBQW1CLE9BQW5CLENBQTJCLE9BQTNCLEVBQW9DLE1BQXBDLENBQVgsQ0FBYjtBQUFBLFlBQ0ksU0FBUyxLQUFLLEtBQUwsQ0FBVyxHQUFYLEVBQWdCLE1BQWhCLENBQXVCLFVBQVUsSUFBVixFQUFn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RCxNQUlPO0FBQ0gsMkJBQVc7QUFBQSwyQkFBTSxPQUFLLGNBQUwsQ0FBb0IsT0FBcEIsQ0FBTjtBQUFBLGlCQUFYLEVBQStDLENBQS9DO0FBQ0g7QUFDSjs7OzJDQUVrQixLLEVBQU87QUFDdEIsZ0JBQUksTUFBTSxJQUFOLENBQVcsR0FBWCxLQUFtQixLQUFLLE9BQUwsQ0FBYSxHQUFwQyxFQUF5QztBQUN6QyxnQkFBSSxNQUFNLElBQU4sQ0FBVyxJQUFYLEtBQW9CLFNBQXhCLEVBQW1DO0FBQy9CLHFCQUFLLFlBQUw7QUFDSDtBQUNKOzs7dUNBRWMsTyxFQUFTO0FBQ3BCLGdCQUFJLE9BQU8sSUFBWDtBQUNBLG9DQUFTLE9BQVQsRUFDSyxJQURMLENBQ1UsZUFBTztBQUNULG9CQUFJLElBQUosR0FBVyxRQUFRLFlBQVIsQ0FBcUIsaUJBQXJCLEVBQXdDLFFBQXhDLEVBQVg7QUFDQSwyQkFBVyxNQUFYLENBQWtCLEtBQUssT0FBTCxDQUFhLEdBQS9CLEVBQW9DLE1BQU0sSUFBSSxJQUE5QyxFQUFvRCxHQUFwRDtBQUNILGFBSkw7QUFLSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgRW1pdHRlclxufVxuZnJvbSAnLi9lbWl0dGVyJztcbmltcG9ydCB7XG4gICAgY2xvbmUsXG4gICAgYXJyYWl6ZVxufVxuZnJvbSAnLi91dGlsJztcbmltcG9ydCB7XG4gICAgdG9IVE1MXG59XG5mcm9tICcuL3NlcmlhbGl6ZXIvdG9IVE1MJztcblxubGV0IGVsZW1lbnRNYXAgPSB7fTtcblxuXG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NvbXBvbmVudC9lc2NhcGUtcmVnZXhwXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdleHAoc3RyKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UoLyhbLiorPz1eIToke30oKXxbXFxdXFwvXFxcXF0pL2csICdcXFxcJDEnKTtcbn1cblxuLyoqXG4gKiBAc2VlIEFwcFxuICogQHBhcmFtICAge2FycmF5fSBsaXN0XG4gKiBAcGFyYW0gICB7c3RyaW5nfSAgIGZpbHRlclxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlc3RNYXRjaChsaXN0LCBmaWx0ZXIpIHtcbiAgICB2YXIgbG93ZXN0ID0gbnVsbCxcbiAgICAgICAgYmVzdDtcblxuICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdleHAocnVsZSkucmVwbGFjZSgvXFxcXFxcKi9nLCAnKC4rKScpKSxcbiAgICAgICAgICAgIHdlaWdodCA9IHJ1bGUuc3BsaXQoJyonKS5maWx0ZXIoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFydC5sZW5ndGg7XG4gICAgICAgICAgICB9KS5sZW5ndGgsXG4gICAgICAgICAgICBtYXRjaCA9IGZpbHRlci5tYXRjaChyZWdleHApO1xuXG4gICAgICAgIGlmIChtYXRjaCAmJiAobG93ZXN0ID09PSBudWxsIHx8IChtYXRjaC5sZW5ndGggLSB3ZWlnaHQpIDwgbG93ZXN0KSkge1xuICAgICAgICAgICAgbG93ZXN0ID0gbWF0Y2gubGVuZ3RoIC0gd2VpZ2h0O1xuICAgICAgICAgICAgYmVzdCA9IHJ1bGU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYmVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gZWxlbWVudE1hcFtpZF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCeU5vZGUoZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IGlkID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcpO1xuICAgIHJldHVybiBnZXRCeUlkKGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUlEKHNldFZhbHVlKSB7XG4gICAgdmFyIHBvc3NpYmxlID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OScsXG4gICAgICAgIHRleHQgPSAnJztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuICAgIH1cblxuICAgIGlmIChPYmplY3Qua2V5cyhlbGVtZW50TWFwKS5pbmRleE9mKHRleHQpID09PSAtMSkge1xuICAgICAgICBlbGVtZW50TWFwW3RleHRdID0gZWxlbWVudE1hcFt0ZXh0XSB8fCBzZXRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIHJldHVybiByYW5kb21JRChzZXRWYWx1ZSk7XG59XG5cbi8qKlxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0cyBOb2RlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoaWQpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLm5hbWUgPSBpZCB8fCByYW5kb21JRCh0aGlzKTtcblxuICAgICAgICB0aGlzLl9fbG9ja2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0IGxvY2tlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19sb2NrZWQ7XG4gICAgfVxuXG4gICAgbG9jaygpIHtcbiAgICAgICAgdGhpcy5fX2xvY2tlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgYXR0cigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cnM7XG4gICAgfVxuXG4gICAgZ2V0KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBiZSBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIHNldCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgYmUgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAYWJzdHJhY3RcbiAgICAgKiBAdGhyb3dzIHtFcnJvcn1cbiAgICAgKi9cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcignU2hvdWxkIGJlIGltcGxlbWVudGVkJyk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IGFsbG93ZWROZXdJdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAY2xhc3NcbiAqIERlZmluZWQgZm9yIEltYWdlLCBWaWRlbywgRW1iZWQsIFRhYmxlLCBIb3Jpem9uYWxSdWxlLCBUYWJsZSwgTGlzdCBvciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNsYXNzIEJsb2NrTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IodHlwZSwgaXRlbXMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXMgfHwgW107XG4gICAgICAgIHRoaXMuYXR0cnMgPSBhdHRycztcbiAgICB9XG5cbiAgICBnZXQocGF0aCkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBwYXRoLnNwbGl0KCcuJyksXG4gICAgICAgICAgICBpbmRleCA9IGVsZW1lbnRzLnNoaWZ0KCksXG4gICAgICAgICAgICByZXN0ID0gZWxlbWVudHMuam9pbignLicpLFxuICAgICAgICAgICAgY2hpbGQ7XG5cbiAgICAgICAgaWYgKGlzTmFOKGluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZCA9IHRoaXMuaXRlbXNbK2luZGV4XTtcblxuICAgICAgICBpZiAocmVzdC5sZW5ndGggJiYgY2hpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZC5nZXQocmVzdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGQ7XG5cbiAgICB9XG5cbiAgICBzZXRCeUlkKGlkLCB2YWx1ZSkge1xuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKChjaGlsZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmIChmb3VuZCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm91bmQgPSBjaGlsZC5zZXRCeUlkID8gY2hpbGQuc2V0QnlJZChpZCwgdmFsdWUpIDogZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgfVxuXG4gICAgc2V0KHBhdGgsIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKHBhdGhbMF0gPT09ICdAJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0QnlJZChwYXRoLnNsaWNlKDEpLCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZWxlbWVudHMgPSBwYXRoLnNwbGl0KCcuJyksXG4gICAgICAgICAgICBpbmRleCA9IGVsZW1lbnRzLnNoaWZ0KCksXG4gICAgICAgICAgICByZXN0ID0gZWxlbWVudHMuam9pbignLicpLFxuICAgICAgICAgICAgY2hpbGQ7XG5cbiAgICAgICAgaWYgKGlzTmFOKGluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdC5sZW5ndGggJiYgY2hpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLml0ZW1zWytpbmRleF0uc2V0KHJlc3QsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKCtpbmRleCwgMCwgdmFsdWUpO1xuXG4gICAgfVxuXG4gICAgZ2V0IGVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGggPD0gMDtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0ge1xuICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMubWFwKChpdGVtKSA9PiBpdGVtLnRvSlNPTigpKVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5hdHRycykge1xuICAgICAgICAgICAgb3V0cHV0LmF0dHJzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmF0dHJzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBkZWNvcmF0ZShlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0b0hUTUwodGhpcywge1xuICAgICAgICAgICAgICAgIGVkaXQ6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgYXJyYWl6ZShodG1sLmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIERvY3VtZW50IGV4dGVuZHMgQmxvY2tOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKGl0ZW1zKSB7XG4gICAgICAgIHN1cGVyKCdkb2N1bWVudCcsIGl0ZW1zKTtcbiAgICB9XG5cbiAgICBnZXQgZGVmYXVsdE5ld0l0ZW0oKSB7XG4gICAgICAgIHJldHVybiBQYXJhZ3JhcGg7XG4gICAgfVxuXG4gICAgZ2V0IGFsbG93ZWROZXdJdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFBhcmFncmFwaCxcbiAgICAgICAgICAgIEltYWdlXG4gICAgICAgIF07XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBRdW90ZSBleHRlbmRzIEJsb2NrTm9kZSB7XG4gICAgY29uc3RydWN0b3IoaXRlbXMpIHtcbiAgICAgICAgc3VwZXIoJ3F1b3RlJywgaXRlbXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAY2xhc3NcbiAqIERlZmluZWQgZm9yIFRleHQsIFBhcmFncmFwaCwgTGlzdEl0ZW0sIFF1b3RlIGFuZCBIZWFkaW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBUZXh0Tm9kZSBleHRlbmRzIE5vZGUge1xuXG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAndGV4dCc7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ3RleHQnO1xuICAgIH1cblxuICAgIGdldCBlbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnRleHQgfHwgIXRoaXMudGV4dC5yZXBsYWNlKC9eKFtcXHNcXG5cXHJcXHRdKyl8KFtcXHNcXG5cXHJcXHRdKykkLywgJycpLmxlbmd0aDtcbiAgICB9XG5cbiAgICBnZXQgYWJzb2x1dGVFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dC5sZW5ndGggPT09IDA7XG4gICAgfVxuXG4gICAgYXR0cigpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLmF0dHIoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih0ZXh0LCBmb3JtYXRzLCBhdHRycykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnRleHQgPSAodGV4dCAmJiB0ZXh0LnRvU3RyaW5nKSA/IHRleHQudG9TdHJpbmcoKSA6ICcnO1xuICAgICAgICB0aGlzLmZvcm1hdHMgPSBmb3JtYXRzIHx8IG51bGw7XG4gICAgICAgIHRoaXMuYXR0cnMgPSBhdHRycztcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnRleHRcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuZm9ybWF0cykge1xuICAgICAgICAgICAgb3V0cHV0LmZvcm1hdHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuZm9ybWF0cykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF0dHJzICYmIHRoaXMudHlwZSAhPT0gJ3RleHQnKSB7XG4gICAgICAgICAgICBvdXRwdXQuYXR0cnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXR0cnMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGFwcGVuZChub2RlKSB7XG4gICAgICAgIGlmICghKG5vZGUgaW5zdGFuY2VvZiBUZXh0Tm9kZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT25seSB0ZXh0IG5vZGVzIGNhbiBiZSBqb2luZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5mb3JtYXRzKSB7XG4gICAgICAgICAgICB0aGlzLmZvcm1hdHMgPSB0aGlzLmZvcm1hdHMgfHwgW107XG4gICAgICAgICAgICBub2RlLmZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtYXRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzbGljZTogW2Zvcm1hdC5zbGljZVswXSArIHRoaXMudGV4dC5sZW5ndGgsIGZvcm1hdC5zbGljZVsxXV0sXG4gICAgICAgICAgICAgICAgICAgIGFwcGx5OiBmb3JtYXQuYXBwbHlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGV4dCArPSBub2RlLnRleHQ7XG4gICAgfVxuXG4gICAgZGVjb3JhdGUoZWxlbWVudCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiB0b0hUTUwodGhpcywge1xuICAgICAgICAgICAgICAgIGVkaXQ6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLWlkJywgc2VsZi5uYW1lKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWwudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0Tm9kZSB7XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdwYXJhZ3JhcGgnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdwYXJhZ3JhcGgnO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHRleHQsIGZvcm1hdHMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKHRleHQsIGZvcm1hdHMsIGF0dHJzKTtcbiAgICB9XG5cbiAgICBnZXQgbmV4dE5vZGVUeXBlKCkge1xuICAgICAgICByZXR1cm4gUGFyYWdyYXBoO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UsIHRpdGxlLCBhbHQpIHtcbiAgICAgICAgc3VwZXIoJ2ltYWdlJyk7XG4gICAgICAgIHRoaXMuc3JjID0gc291cmNlO1xuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgICAgIHRoaXMuYWx0ID0gYWx0O1xuICAgIH1cblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ2ltYWdlJztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnaW1hZ2UnO1xuICAgIH1cblxuICAgIGF0dHIoKSB7XG4gICAgICAgIGxldCBhdHRyaWJ1dGVzID0gc3VwZXIuYXR0cigpIHx8IHt9O1xuICAgICAgICBpZiAodGhpcy5zcmMpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMuc3JjID0gdGhpcy5zcmM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGl0bGUpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMudGl0bGUgPSB0aGlzLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFsdCkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5hbHQgPSB0aGlzLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgICAgICBzcmM6IHRoaXMuc3JjXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLnRpdGxlKSB7XG4gICAgICAgICAgICBvdXRwdXQudGl0bGUgPSB0aGlzLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFsdCkge1xuICAgICAgICAgICAgb3V0cHV0LmFsdCA9IHRoaXMuYWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGVhZGluZyBleHRlbmRzIFRleHROb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKGxldmVsLCB0ZXh0LCBmb3JtYXRzLCBhdHRycykge1xuICAgICAgICBzdXBlcih0ZXh0LCBmb3JtYXRzLCBhdHRycyk7XG4gICAgICAgIHRoaXMubGV2ZWwgPSBNYXRoLm1pbig2LCBsZXZlbCB8fCAxKTtcbiAgICB9XG5cbiAgICBhdHRyKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuYXR0cigpO1xuICAgIH1cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdoZWFkaW5nJztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnaGVhZGluZyc7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQganNvbiA9IHN1cGVyLnRvSlNPTigpO1xuICAgICAgICBqc29uLmxldmVsID0gdGhpcy5sZXZlbDtcbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3RhdGljQmxvY2tOb2RlIGV4dGVuZHMgQmxvY2tOb2RlIHtcbiAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBnZXQgZGVmYXVsdE5ld0l0ZW0oKSB7XG4gICAgICAgIHJldHVybiBQYXJhZ3JhcGg7XG4gICAgfVxuXG4gICAgZ2V0IGFsbG93ZWROZXdJdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFBhcmFncmFwaCxcbiAgICAgICAgICAgIEltYWdlXG4gICAgICAgIF07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmllbGRzIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX21hcCA9IGRhdGEgfHwge307XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnRmllbGRzJztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnRmllbGRzJztcbiAgICB9XG5cbiAgICBnZXQocGF0aCkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBwYXRoLnNwbGl0KCcuJyksXG4gICAgICAgICAgICBpbmRleCA9IGVsZW1lbnRzLnNoaWZ0KCksXG4gICAgICAgICAgICByZXN0ID0gZWxlbWVudHMuam9pbignLicpLFxuICAgICAgICAgICAgY2hpbGQ7XG5cbiAgICAgICAgY2hpbGQgPSB0aGlzLl9tYXBbaW5kZXhdO1xuXG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCAmJiBjaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkLmdldChyZXN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGlsZDtcblxuICAgIH1cblxuICAgIHNldChwYXRoLCB2YWx1ZSkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBwYXRoLnNwbGl0KCcuJyksXG4gICAgICAgICAgICBpbmRleCA9IGVsZW1lbnRzLnNoaWZ0KCksXG4gICAgICAgICAgICByZXN0ID0gZWxlbWVudHMuam9pbignLicpLFxuICAgICAgICAgICAgY2hpbGQ7XG5cbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoICYmIGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFwW2luZGV4XS5nZXQocmVzdCwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbWFwW2luZGV4XSA9IHZhbHVlO1xuXG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4gY2xvbmUoW1xuICAgICAgICAgICAgdGhpcy5fbWFwLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdGaWVsZHMnXG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhbnRzIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX3ZhcmlhbnRzID0gZGF0YTtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdWYXJpYW50cyc7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ1ZhcmlhbnRzJztcbiAgICB9XG5cblxuICAgIGJlc3QodmFyaWFudCkge1xuICAgICAgICBsZXQgYmVzdCA9IGJlc3RNYXRjaChPYmplY3Qua2V5cyh0aGlzLl92YXJpYW50cyksIHZhcmlhbnQpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFyaWFudHNbYmVzdF07XG5cbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiBjbG9uZShbXG4gICAgICAgICAgICB0aGlzLl9tYXAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1ZhcmlhbnRzJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9XG59XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbi8qKlxuICogQG5hbWVzcGFjZSBza2FyeW5hXG4gKlxuICogQGNsYXNzIEV2ZW50Q29uZmlnXG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBmbiBsaXN0ZW5lclxuICogQHByb3BlcnR5IHtvYmplY3R9IGNvbnRleHRcbiAqIEBwcm9wZXJ0eSB7YXJyYXl9IGFyZ3MgYXJndW1lbnRzIHRvIGJlIHBhc3NlZFxuICogQHByb3BlcnR5IHtib29sZWFufSBvbmNlIGlmIHNob3VsZCBiZSBmaXJlZCBvbmx5IG9uY2VcbiAqL1xuXG4vKipcbiAqIEBjbGFzcyBFdmVudFxuICovXG5leHBvcnQgY2xhc3MgRXZlbnQge1xuICAgIC8qKlxuICAgICAqIENvbnRydWN0b3JcbiAgICAgKiBAY29uc3RydWN0cyBFdmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHttaXhlZH0gZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzb3VyY2VcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBwYXJlbnRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhLCBzb3VyY2UsIHBhcmVudCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfVxuICAgICAgICAgICAgICogQG5hbWUgRXZlbnQjbmFtZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge21peGVkfVxuICAgICAgICAgICAgICogQG5hbWUgRXZlbnQjZGF0YVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge29iamVjdH1cbiAgICAgICAgICAgICAqIEBuYW1lIEV2ZW50I3NvdXJjZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogc291cmNlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtFdmVudHxudWxsfVxuICAgICAgICAgICAgICogQG5hbWUgRXZlbnQjcGFyZW50XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHBhcmVudDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJlbnQsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnRXZlbnQ6ICcgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTigpKTtcbiAgICB9XG59XG5cbi8qKlxuICogW1tEZXNjcmlwdGlvbl1dXG4gKiBAcGFyYW0ge0V2ZW50fSBjb2ZuaWdcbiAqIEBwYXJhbSB7RXZlbnRDb25maWd9IHRoaXNPYmplY3RcbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZShldmVudCwgY29uZmlnKSB7XG4gICAgbGV0IHtcbiAgICAgICAgZm4sIGNvbnRleHQsIGFyZ3NcbiAgICB9ID0gY29uZmlnLFxuICAgIHBhcmFtcyA9IFtldmVudF0uY29uY2F0KGFyZ3MpO1xuXG4gICAgZm4uYXBwbHkoY29udGV4dCB8fCBudWxsLCBwYXJhbXMpO1xufVxuXG4vKipcbiAqIEFkZHMgbGlzdGVuZXIgZm9yIGFuIGV2ZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuICogQHBhcmFtIHthcnJheX0gYXJnc1xuICogQHBhcmFtIHtib29sZWFufSBvbmNlXG4gKi9cbmZ1bmN0aW9uIG9uKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgb25jZSkge1xuICAgIHRoaXMuX19saXN0ZW5lcnMgPSB0aGlzLl9fbGlzdGVuZXJzIHx8IHt9O1xuICAgIHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSA9IHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICB0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0ucHVzaCh7XG4gICAgICAgIGZuOiBoYW5kbGVyLFxuICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICBvbmNlOiAhIW9uY2VcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBZGRzIGxpc3RlbmVyIGZvciBhbiBldmVudCB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb25jZVxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gaGFuZGxlclxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3NcbiAqL1xuZnVuY3Rpb24gb25jZShldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIGFyZ3MpIHtcbiAgICB0aGlzLm9uKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgdHJ1ZSk7XG59XG5cbi8qKlxuICogQWRkcyBsaXN0ZW5lciBmb3IgYW4gZXZlbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0XG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9uY2VcbiAqL1xuZnVuY3Rpb24gb2ZmKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgb25jZSkge1xuICAgIGlmICghdGhpcy5fX2xpc3RlbmVycyB8fCAhdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpc1xuICAgICAgICAuZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgb25jZSlcbiAgICAgICAgLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdLnNwbGljZSh0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0uaW5kZXhPZihjb25maWcpLCAxKTtcbiAgICAgICAgfSk7XG5cbn1cblxuLyoqXG4gKiBFbWl0cyBhbiBldmVudFxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHttaXhlZH0gZGF0YVxuICogQHBhcmFtIHtFdmVudHxudWxsfSBwYXJlbnRcbiAqL1xuZnVuY3Rpb24gZW1pdChldmVudE5hbWUsIGRhdGEsIHBhcmVudCkge1xuICAgIGlmICghdGhpcy5fX2xpc3RlbmVycyB8fCAhdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXMsXG4gICAgICAgIGV2ZW50ID0gbmV3IEV2ZW50KGV2ZW50TmFtZSwgZGF0YSwgdGhpcywgcGFyZW50KTtcblxuICAgIHRoaXNcbiAgICAgICAgLmdldExpc3RlbmVycyhldmVudE5hbWUpXG4gICAgICAgIC5mb3JFYWNoKChjb25maWcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb25maWcub25jZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub2ZmKGV2ZW50TmFtZSwgY29uZmlnLmZuLCBjb25maWcuY29udGV4dCwgY29uZmlnLmFyZ3MsIGNvbmZpZy5vbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWN1dGUoZXZlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xufVxuXG4vKipcbiAqIEJ1YmJsZXMgZXZlbnQgdG8gb3RoZXIgZW1pdHRlclxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHtvYmplY3R9IHRvRW1pdHRlclxuICovXG5mdW5jdGlvbiBidWJibGVFdmVudChldmVudE5hbWUsIHRvRW1pdHRlcikge1xuICAgIHRoaXMub24oZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdG9FbWl0dGVyLmVtaXQoZXZlbnROYW1lLCBldmVudC5kYXRhLCBldmVudCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogR2V0cyBhbGwgbGlzdGVuZXJzIHRoYXQgbWF0Y2ggY3JpdGVyaWFcbiAqIEBwYXJhbSAgIHtzdHJpbmd9IGV2ZW50TmFtZSByZXF1aXJlZFxuICogQHBhcmFtICAge2Z1bmN0aW9ufSBoYW5kbGVyICAgaWYgZGVmaW5lZCB3aWxsIGJlIHVzZWQgZm9yIG1hdGNoXG4gKiBAcGFyYW0gICB7b2JqZWN0fSBjb250ZXh0ICAgaWYgZGVmaW5lZCB3aWxsIGJlIHVzZWQgZm9yIG1hdGNoXG4gKiBAcGFyYW0gICB7YXJyYXl9IGFyZ3MgICAgICBpZiBkZWZpbmVkIHdpbGwgYmUgdXNlZCBmb3IgbWF0Y2hcbiAqIEByZXR1cm5zIHthcnJheTxFdmVudENvbmZpZz58bnVsbH1cbiAqL1xuZnVuY3Rpb24gZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncykge1xuICAgIGlmICghdGhpcy5fX2xpc3RlbmVycyB8fCAhdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV1cbiAgICAgICAgLm1hcCgoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGNvbmZpZy5mbiAhPT0gaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb250ZXh0ICE9PSB1bmRlZmluZWQgJiYgY29uZmlnLmNvbnRleHQgIT09IGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJncyAhPT0gdW5kZWZpbmVkICYmIGNvbmZpZy5hcmdzICE9PSBhcmdzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcigocmVzdWx0KSA9PiAhIXJlc3VsdCk7XG59XG5cbi8qXG4gKiBAY2xhc3MgRW1pdHRlclxuICovXG5leHBvcnQgY2xhc3MgRW1pdHRlciB7XG5cbiAgICBzdGF0aWMgb24oKSB7XG4gICAgICAgIG9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgb24oKSB7XG4gICAgICAgIG9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIG9uY2UoKSB7XG4gICAgICAgIG9uY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBvbmNlKCkge1xuICAgICAgICBvbmNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIG9mZigpIHtcbiAgICAgICAgb2ZmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgICBvZmYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZW1pdCgpIHtcbiAgICAgICAgZW1pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgZW1pdCgpIHtcbiAgICAgICAgZW1pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGJ1YmJsZUV2ZW50KCkge1xuICAgICAgICBidWJibGVFdmVudC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYnViYmxlRXZlbnQoKSB7XG4gICAgICAgIGJ1YmJsZUV2ZW50LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0TGlzdGVuZXJzKCkge1xuICAgICAgICByZXR1cm4gZ2V0TGlzdGVuZXJzLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBnZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHJldHVybiBnZXRMaXN0ZW5lcnMuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuICAgIH1cbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuY2xhc3MgUGFyc2VyIHtcblxuICAgIHBhcnNlKGZvcm1hdCwgdG9rZW4sIGRhdGEsIG9wdGlvbnMpIHtcblxuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdNb2RlbCBpcyBlbXB0eScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZShmb3JtYXQsIHRva2VuLCBkYXRhLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBvbihmb3JtYXQsIHRva2VuLCBoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzID0gdGhpcy5faGFuZGxlcnMgfHwge307XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gPSB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdIHx8IHt9O1xuICAgICAgICB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdW3Rva2VuXSA9IGhhbmRsZXI7XG4gICAgfVxuXG4gICAgaGFuZGxlKGZvcm1hdCwgdG9rZW4sIGRhdGEsIG9wdGlvbnMpIHtcblxuICAgICAgICBsZXQgaGFuZGxlciA9ICh0aGlzLl9oYW5kbGVycyAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bdG9rZW5dKSA/IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bdG9rZW5dIDogbnVsbDtcbiAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICBoYW5kbGVyID0gKHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVsnKiddKSA/IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bJyonXSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdObyBoYW5kbGVyIGRlZmluZWQgZm9yICcgKyBmb3JtYXQgKyAnIDogJyArIHRva2VuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGFuZGxlcih0b2tlbiwgZGF0YSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChQT00pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUE9NO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcigpO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qIGdsb2JhbHMgZG9jdW1lbnQgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIHBhcnNlclxufVxuZnJvbSAnLi8uLi9wYXJzZXInO1xuaW1wb3J0IHtcbiAgICBhcnJhaXplLFxuICAgIGNsb25lXG59XG5mcm9tICcuLy4uL3V0aWwnO1xuaW1wb3J0IHtcbiAgICBEb2N1bWVudCxcbiAgICBUZXh0Tm9kZSxcbiAgICBCbG9ja05vZGUsXG4gICAgUGFyYWdyYXBoLFxuICAgIEhlYWRpbmcsXG4gICAgSW1hZ2UsXG4gICAgUXVvdGUsXG4gICAgU3RhdGljQmxvY2tOb2RlXG59XG5mcm9tICcuLy4uL2RvY3VtZW50JztcblxuZnVuY3Rpb24gd2hhdFdyYXBwZXIocm9vdE5vZGUpIHtcbiAgICBzd2l0Y2ggKHJvb3ROb2RlKSB7XG4gICAgY2FzZSAndGQnOlxuICAgIGNhc2UgJ3RoJzpcbiAgICAgICAgcmV0dXJuICd0cic7XG4gICAgY2FzZSAndHInOlxuICAgICAgICByZXR1cm4gJ3RhYmxlJztcbiAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2Rpdic7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBlZGl0TW9kZShub2RlLCBlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5lZGl0KSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtaWQnLCBub2RlLm5hbWUpO1xuICAgICAgICBub2RlLl9fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzQ2hpbGRyZW4oZWxlbWVudCwgb3B0aW9ucykge1xuICAgIGlmICghZWxlbWVudCB8fCAhZWxlbWVudC5jaGlsZE5vZGVzKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAuYWxsKGFycmFpemUoZWxlbWVudC5jaGlsZE5vZGVzKVxuICAgICAgICAgICAgLm1hcCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDEgfHwgY2hpbGQubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZyb21IVE1MKGNoaWxkLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgLnRoZW4oKGl0ZW1zKSA9PiBpdGVtcy5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbnN0cnVjdG9yID09PSBUZXh0Tm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhaXRlbS5hYnNvbHV0ZUVtcHR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0gIT09IG51bGw7XG4gICAgICAgIH0pKTtcbn1cblxuLyoqXG4gKiBQYXJzZSBQT00gSlNPTiByZXByZXNlbnRhdGlvblxuICogQHBhcmFtICAge3N0cmluZ3xIVE1MRWxlbWVudH0gICBtb2RlbFxuICogQHBhcmFtICAge29wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPE5vZGU+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbUhUTUwoaW5wdXQsIG9wdGlvbnMpIHtcblxuICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh3aGF0V3JhcHBlcihpbnB1dC5yZXBsYWNlKCcvXihcXHMqKTwoW2EtekEtWjAtOV8tXSspJywgJyQyJykudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB3cmFwcGVyLmlubmVySFRNTCA9IGlucHV0O1xuICAgICAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKHdyYXBwZXIsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoY2hpbGRyZW4pID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoaXRlbSkgPT4gIShpdGVtIGluc3RhbmNlb2YgVGV4dE5vZGUgfHwgaXRlbSBpbnN0YW5jZW9mIElubGluZU5vZGUpKVxuICAgICAgICAgICAgICAgICAgICAubGVuZ3RoXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5tYXAoKGl0ZW0pID0+IGl0ZW0gaW5zdGFuY2VvZiBCbG9ja05vZGUpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEb2N1bWVudChjaGlsZHJlbi5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQYXJhZ3JhcGgoaXRlbS50ZXh0LCBpdGVtLmZvcm1hdHMsIGl0ZW0uYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50KGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW1zID0gY2hpbGRyZW4ubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIElubGluZU5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KFtpdGVtXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUZXh0Tm9kZSh0ZXh0LCBmb3JtYXRzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IGl0ZW1zLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaXJzdC5hcHBlbmQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0O1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZXIucGFyc2UoJ2h0bWwnLCBpbnB1dC5ub2RlVHlwZSA9PT0gMyA/ICd0ZXh0JyA6IGlucHV0Lm5vZGVOYW1lLCBpbnB1dCk7XG59XG5cbmNsYXNzIElubGluZU5vZGUgZXh0ZW5kcyBCbG9ja05vZGUge1xuXG59XG5cbmZ1bmN0aW9uIGZvcm1hdFR5cGUoaXRlbSwgdGV4dCkge1xuICAgIGlmIChpdGVtLnR5cGUgPT09ICdBJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ0EnLFxuICAgICAgICAgICAgdGl0bGU6IGl0ZW0uYXR0cnMudGl0bGUgfHwgdGV4dCxcbiAgICAgICAgICAgIGhyZWY6IGl0ZW0uYXR0cnMuaHJlZlxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gaXRlbS50eXBlO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkoaXRlbXMpIHtcbiAgICBsZXQgdGV4dCA9ICcnLFxuICAgICAgICBmb3JtYXRzID0gW10sXG4gICAgICAgIGluZGV4ID0gMDtcblxuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBJbmxpbmVOb2RlKSB7XG4gICAgICAgICAgICBsZXQgW2lubmVyVGV4dCwgaW5uZXJGb3JtYXRzXSA9IHN0cmluZ2lmeShpdGVtLml0ZW1zKSxcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWNlOiBbaW5kZXgsIGlubmVyVGV4dC5sZW5ndGhdLFxuICAgICAgICAgICAgICAgICAgICBhcHBseTogW2Zvcm1hdFR5cGUoaXRlbSwgaW5uZXJUZXh0KV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9ybWF0cy5wdXNoKGZvcm1hdCk7XG4gICAgICAgICAgICBpbm5lckZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICAgICAgZm9ybWF0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgc2xpY2U6IFtpbmRleCArIGZvcm1hdC5zbGljZVswXSwgZm9ybWF0LnNsaWNlWzFdXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwbHk6IGZvcm1hdC5hcHBseVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3JtYXRzLmZvckVhY2goKGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvcm1hdHMuZm9yRWFjaCgob3RoZXJGb3JtYXQsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZm9ybWF0ICE9PSBvdGhlckZvcm1hdCAmJiBmb3JtYXQuc2xpY2VbMF0gPT09IG90aGVyRm9ybWF0LnNsaWNlWzBdICYmIGZvcm1hdC5zbGljZVsxXSA9PT0gb3RoZXJGb3JtYXQuc2xpY2VbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdC5hcHBseSA9IGZvcm1hdC5hcHBseS5jb25jYXQob3RoZXJGb3JtYXQuYXBwbHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0cy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0ZXh0ICs9IGlubmVyVGV4dDtcbiAgICAgICAgICAgIGluZGV4ICs9IGlubmVyVGV4dC5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbSBpbnN0YW5jZW9mIFRleHROb2RlKSB7XG4gICAgICAgICAgICB0ZXh0ICs9IGl0ZW0udGV4dDtcbiAgICAgICAgICAgIGluZGV4ICs9IGl0ZW0udGV4dC5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIFt0ZXh0LCBmb3JtYXRzXTtcbn1cblxuZnVuY3Rpb24gaGVhZGluZyh0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuXG4gICAgcmV0dXJuIHByb2Nlc3NDaGlsZHJlbihkYXRhLCBvcHRpb25zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIGxldCBbdGV4dCwgZm9ybWF0c10gPSBzdHJpbmdpZnkoaXRlbXMpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSGVhZGluZyh0b2tlblsxXS50b0xvd2VyQ2FzZSgpLCB0ZXh0IHx8ICcnLCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsLCBvcHRpb25zKSk7XG4gICAgICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwYXJhZ3JhcGgodG9rZW4sIGRhdGEsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgbGV0IFt0ZXh0LCBmb3JtYXRzXSA9IHN0cmluZ2lmeShpdGVtcyk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBQYXJhZ3JhcGgodGV4dCwgZm9ybWF0cy5sZW5ndGggPyBmb3JtYXRzIDogbnVsbCkpO1xuICAgICAgICB9KTtcbn1cblxuZnVuY3Rpb24gYXR0cmlidXRlcyhpbnB1dCkge1xuICAgIGxldCBvdXRwdXQgPSBudWxsO1xuICAgIGFycmFpemUoaW5wdXQpXG4gICAgICAgIC5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dCB8fCB7fTtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGUudmFsdWUgJiYgYXR0cmlidXRlLnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG91dHB1dFthdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBvdXRwdXQ7XG5cbn1cblxuZnVuY3Rpb24gaWZBdHRyKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBxdW90ZSh0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGl0ZW1zKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBwYXJhZ3JhcGhzID0gW10sXG4gICAgICAgICAgICAgICAgbGFzdFBhcmFncmFwaCA9IFtdO1xuICAgICAgICAgICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgUGFyYWdyYXBoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0UGFyYWdyYXBoLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFt0ZXh0LCBmb3JtYXRzXSA9IHN0cmluZ2lmeShpdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhZ3JhcGhzLnB1c2goUHJvbWlzZS5yZXNvbHZlKG5ldyBQYXJhZ3JhcGgodGV4dCwgZm9ybWF0cy5sZW5ndGggPyBmb3JtYXRzIDogbnVsbCwgb3B0aW9ucykpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQYXJhZ3JhcGggPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYXJhZ3JhcGhzLnB1c2goUHJvbWlzZS5yZXNvbHZlKGl0ZW0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYXN0UGFyYWdyYXBoLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAobGFzdFBhcmFncmFwaC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW1zKTtcbiAgICAgICAgICAgICAgICBwYXJhZ3JhcGhzLnB1c2goUHJvbWlzZS5yZXNvbHZlKG5ldyBQYXJhZ3JhcGgodGV4dCwgZm9ybWF0cy5sZW5ndGggPyBmb3JtYXRzIDogbnVsbCwgb3B0aW9ucykpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHBhcmFncmFwaHMpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFF1b3RlKGl0ZW1zKSk7XG4gICAgICAgIH0pO1xufVxuXG5wYXJzZXIub24oJ2h0bWwnLCAndGV4dCcsICh0b2tlbiwgZGF0YSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFRleHROb2RlKGRhdGEudGV4dENvbnRlbnQsIG51bGwsIG9wdGlvbnMpKTtcbn0pO1xucGFyc2VyLm9uKCdodG1sJywgJ0gxJywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDInLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdIMycsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ0g0JywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDUnLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdINicsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ1AnLCBwYXJhZ3JhcGgpO1xucGFyc2VyLm9uKCdodG1sJywgJ0JMT0NLUVVPVEUnLCBxdW90ZSk7XG5cbnBhcnNlci5vbignaHRtbCcsICdJTUcnLCAodG9rZW4sIGRhdGEsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBJbWFnZShkYXRhLnNyYywgaWZBdHRyKGRhdGEuZ2V0QXR0cmlidXRlKCd0aXRsZScpKSwgaWZBdHRyKGRhdGEuZ2V0QXR0cmlidXRlKCdhbHQnKSksIGNsb25lKFthdHRyaWJ1dGVzKGRhdGEuYXR0cmlidXRlcyldLCBbJ3NyYycsICd0aXRsZScsICdhbHQnXSkpLCBvcHRpb25zKTtcbn0pO1xuXG5bJ0FERFJFU1MnLCAnQVJUSUNMRScsICdBU0lERScsICdESVYnLCAnRklHVVJFJywgJ0ZPT1RFUicsICdIRUFERVInLCAnTUFJTicsICdOQVYnLCAnU0VDVElPTiddLmZvckVhY2goKG5vZGVOYW1lKSA9PiB7XG4gICAgcGFyc2VyLm9uKCdodG1sJywgbm9kZU5hbWUsICh0b2tlbiwgZGF0YSwgb3B0aW9ucykgPT4ge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBTdGF0aWNCbG9ja05vZGUodG9rZW4sIGl0ZW1zLCBhdHRyaWJ1dGVzKGRhdGEuYXR0cmlidXRlcykpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnBhcnNlci5vbignaHRtbCcsICcqJywgKHRva2VuLCBkYXRhLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIHByb2Nlc3NDaGlsZHJlbihkYXRhLCBvcHRpb25zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IElubGluZU5vZGUodG9rZW4sIGl0ZW1zLCBhdHRyaWJ1dGVzKGRhdGEuYXR0cmlidXRlcykpLCBvcHRpb25zKTtcbiAgICAgICAgfSk7XG59KTtcbi8qXG5wYXJzZXIub24oJ2h0bWwnLCAnI3RleHQnLCAodG9rZW4sIGRhdGEpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBUZXh0Tm9kZShkYXRhLnRleHRDb250ZW50KSk7XG59KTtcblxuW1xuICAgIFsnYicsICdzdHJvbmcnXSxcbiAgICBbJ2JpZycsICdzdHJvbmcnXSxcbiAgICBbJ2knLCAnZW0nXSxcbiAgICAnc21hbGwnLFxuICAgIFsndHQnLCAnY29kZSddLFxuICAgIFsnYWJicicsICdzZW1hbnRpYycsICdhYmJyJ10sXG4gICAgWydhY3JvbnltJywgJ2FiYnInLCAnYWJiciddLFxuICAgIFsnY2l0ZScsICdzZW1hbnRpYycsICdjaXRlJ10sXG4gICAgJ2NvZGUnLFxuICAgIFsnZGZuJywgJ3NlbWFudGljJywgJ2RlZmluaXRpb24nXSxcbiAgICAnZW0nLFxuICAgIFsndGltZScsICdzZW1hbnRpYycsICd0aW1lJ10sXG4gICAgWyd2YXInLCAnY29kZScsICd2YXInXSxcbiAgICBbJ2tiZCcsICdjb2RlJywgJ2tiZCddLFxuICAgICdzdHJvbmcnLFxuICAgIFsnc2FtcCcsICdjb2RlJywgJ3NhbXBsZSddLFxuICAgICdiZG8nLFxuICAgICdhJyxcbiAgICAvLydicicsXG4gICAgLy8naW1nLFxuICAgIC8vJ21hcCcsXG4gICAgLy8nb2JqZWN0JyxcbiAgICBbJ3EnLCAnc2VtYW50aWMnLCAncXVvdGF0aW9uJ10sXG4gICAgLy9zY3JpcHRcbiAgICAnc3BhbicsXG4gICAgZGVsLFxuICAgIHNcbiAgICAnc3ViJyxcbiAgICAnc3VwJyxcbiAgICAvL2J1dHRvblxuICAgIC8vaW5wdXRcbiAgICAvL2xhYmVsXG4gICAgLy9zZWxlY3RcbiAgICAvL3RleHRhcmVhXG5dLmZvckVhY2goKGlubGluZVJ1bGUpID0+IHtcblxuICAgIGxldCBpbnB1dCA9IHR5cGVvZiBpbmxpbmVSdWxlID09PSAnc3RyaW5nJyA/IGlubGluZVJ1bGUgOiBpbmxpbmVSdWxlWzBdO1xuXG4gICAgcGFyc2VyLm9uKCdodG1sJywgaW5wdXQsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEpXG4gICAgICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcblxuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pO1xuKi9cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBwYXJzZXJcbn1cbmZyb20gJy4vLi4vcGFyc2VyJztcblxuaW1wb3J0IHtcbiAgICBUZXh0Tm9kZSxcbiAgICBEb2N1bWVudCxcbiAgICBIZWFkaW5nLFxuICAgIFBhcmFncmFwaCxcbiAgICBJbWFnZSxcbiAgICBGaWVsZHMsXG4gICAgVmFyaWFudHNcbn1cbmZyb20gJy4vLi4vZG9jdW1lbnQnO1xuXG4vKipcbiAqIFBhcnNlIFBPTSBKU09OIHJlcHJlc2VudGF0aW9uXG4gKiBAcGFyYW0gICB7b2JqZWN0fSAgIG1vZGVsXG4gKiBAcGFyYW0gICB7b3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8Tm9kZT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUE9NKG1vZGVsKSB7XG4gICAgaWYgKCFtb2RlbCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlKCdwb20nLCBtb2RlbC50eXBlLCBtb2RlbCk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDaGlsZE5vZGVzKGl0ZW1zKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGl0ZW1zKSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJvbVBPTShpdGVtKTtcbiAgICB9KSkudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4gISFpdGVtKTtcbiAgICB9KTtcbn1cblxucGFyc2VyLm9uKCdwb20nLCAnZG9jdW1lbnQnLCAodG9rZW4sIGRhdGEpID0+IHtcbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkTm9kZXMoZGF0YS5pdGVtcylcbiAgICAgICAgLnRoZW4oKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50KGl0ZW1zKTtcbiAgICAgICAgfSk7XG59KTtcblxucGFyc2VyLm9uKCdwb20nLCAnaGVhZGluZycsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEhlYWRpbmcoZGF0YS5sZXZlbCwgZGF0YS50ZXh0LCBkYXRhLmZvcm1hdHMsIGRhdGEuYXR0cnMpKTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdwYXJhZ3JhcGgnLCAodG9rZW4sIGRhdGEpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBQYXJhZ3JhcGgoZGF0YS50ZXh0LCBkYXRhLmZvcm1hdHMsIGRhdGEuYXR0cnMpKTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICd0ZXh0JywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgVGV4dE5vZGUoZGF0YS50ZXh0LCBkYXRhLmZvcm1hdHMpKTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdpbWFnZScsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEltYWdlKGRhdGEuc3JjLCBkYXRhLnRpdGxlLCBkYXRhLmFsdCkpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ0ZpZWxkcycsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIGxldCBmaWVsZHMgPSB7fTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0XG4gICAgICAgICAgICAua2V5cyhkYXRhKVxuICAgICAgICAgICAgLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICd0eXBlJylcbiAgICAgICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBmcm9tUE9NKGRhdGFba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKFBPTSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRzW2tleV0gPSBQT007XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEZpZWxkcyhmaWVsZHMpKTtcbiAgICAgICAgfSk7XG59KTtcblxucGFyc2VyLm9uKCdwb20nLCAnVmFyaWFudHMnLCAodG9rZW4sIGRhdGEpID0+IHtcbiAgICBsZXQgdmFyaWFudHMgPSB7fTtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0XG4gICAgICAgICAgICAua2V5cyhkYXRhKVxuICAgICAgICAgICAgLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICd0eXBlJylcbiAgICAgICAgICAgIC5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBmcm9tUE9NKGRhdGFba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKFBPTSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFudHNba2V5XSA9IFBPTTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgVmFyaWFudHModmFyaWFudHMpKTtcbiAgICAgICAgfSk7XG59KTtcbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuY2xhc3MgU2VyaWFsaXplciB7XG5cbiAgICBzZXJpYWxpemUoZm9ybWF0LCBub2RlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdNb2RlbCBpcyBlbXB0eScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbm9kZS50eXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdVbmRlZmluZWQgbm9kZSB0eXBlJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlKGZvcm1hdCwgbm9kZS50eXBlLCBub2RlLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBvbihmb3JtYXQsIG5vZGVUeXBlLCBoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzID0gdGhpcy5faGFuZGxlcnMgfHwge307XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gPSB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdIHx8IHt9O1xuICAgICAgICB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdW25vZGVUeXBlXSA9IGhhbmRsZXI7XG4gICAgfVxuXG4gICAgaGFuZGxlKGZvcm1hdCwgbm9kZVR5cGUsIG5vZGUsIG9wdGlvbnMpIHtcblxuICAgICAgICBsZXQgaGFuZGxlciA9ICh0aGlzLl9oYW5kbGVycyAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bbm9kZVR5cGVdKSA/IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bbm9kZVR5cGVdIDogbnVsbDtcbiAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICBoYW5kbGVyID0gKHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVsnKiddKSA/IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bJyonXSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdObyBoYW5kbGVyIGRlZmluZWQgZm9yICcgKyBmb3JtYXQgKyAnIDogJyArIG5vZGVUeXBlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZXIobm9kZSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVDb250ZW50cyhmb3JtYXQsIGFycmF5LCBvcHRpb25zKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgICAgIC5hbGwoYXJyYXkubWFwKChjb250ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuc2VyaWFsaXplKCdodG1sJywgY29udGVudCwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9KSk7XG5cbiAgICB9XG59XG5cbmV4cG9ydCB2YXIgc2VyaWFsaXplciA9IG5ldyBTZXJpYWxpemVyKCk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyogZ2xvYmFscyBkb2N1bWVudCAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgc2VyaWFsaXplclxufVxuZnJvbSAnLi8uLi9zZXJpYWxpemVyJztcblxuaW1wb3J0IHtcbiAgICBUZXh0Tm9kZVxufVxuZnJvbSAnLi8uLi9kb2N1bWVudCc7XG5pbXBvcnQge1xuICAgIGFycmFpemVcbn1cbmZyb20gJy4vLi4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0hUTUwobW9kZWwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gc2VyaWFsaXplci5zZXJpYWxpemUoJ2h0bWwnLCBtb2RlbCwgb3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIG90aGVyQXR0cnMob2JqZWN0LCBleGNlcHQpIHtcbiAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgT2JqZWN0XG4gICAgICAgIC5rZXlzKG9iamVjdClcbiAgICAgICAgLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZXhjZXB0LmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgICAgIH0pXG4gICAgICAgIC5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XG4gICAgICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdChzdHJpbmcsIGZvcm1hdHMpIHtcbiAgICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKSxcbiAgICAgICAgc2xpY2VzID0gc3RyaW5nLnNwbGl0KCcnKS5tYXAoKGNoYXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2hhcjogY2hhcixcbiAgICAgICAgICAgICAgICBhcHBseTogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgc2xpY2VzLnB1c2goe1xuICAgICAgICBjaGFyOiAnJyxcbiAgICAgICAgYXBwbHk6IFtdXG4gICAgfSk7XG5cbiAgICBmb3JtYXRzLmZvckVhY2goKGZvcm1hdCkgPT4ge1xuICAgICAgICBsZXQgZnJvbSA9IGZvcm1hdC5zbGljZVswXSxcbiAgICAgICAgICAgIHRvID0gZnJvbSArIGZvcm1hdC5zbGljZVsxXTtcblxuICAgICAgICBmb3JtYXQuYXBwbHkuZm9yRWFjaCgoYXBwbHkpID0+IHtcbiAgICAgICAgICAgIGlmIChzbGljZXNbZnJvbV0uYXBwbHkuaW5kZXhPZihhcHBseSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzbGljZXNbZnJvbV0uYXBwbHkucHVzaChhcHBseSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2xpY2VzW3RvXS5hcHBseS5pbmRleE9mKCcvJyArIGFwcGx5KSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIHNsaWNlc1t0b10uYXBwbHkucHVzaCgnLycgKyBhcHBseSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gc2xpY2VzLm1hcCgoY2hhcikgPT4ge1xuICAgICAgICByZXR1cm4gY2hhci5hcHBseS5tYXAoKHRhZykgPT4gJzwnICsgdGFnICsgJz4nKS5qb2luKCcnKSArIGNoYXIuY2hhcjtcbiAgICB9KS5qb2luKCcnKTtcbiAgICByZXR1cm4gYXJyYWl6ZSh3cmFwcGVyLmNoaWxkTm9kZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZWxlbWVudChub2RlLCBub2RlVHlwZSwgYXR0cmlidXRlcywgY29udGVudCwgb3B0aW9ucykge1xuXG4gICAgbGV0IHByb21pc2U7XG5cbiAgICBpZiAoY29udGVudCkge1xuXG4gICAgICAgIHByb21pc2UgPSBzZXJpYWxpemVyLmhhbmRsZUNvbnRlbnRzKCdodG1sJywgY29udGVudCB8fCBbXSwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKChjb250ZW50KSA9PiB7XG5cbiAgICAgICAgaWYgKG5vZGUuZm9ybWF0cyAmJiBub2RlLmZvcm1hdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gZm9ybWF0KGNvbnRlbnRbMF0ubm9kZVZhbHVlLCBub2RlLmZvcm1hdHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVUeXBlKTtcbiAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5lZGl0KSB7XG4gICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLWlkJywgbm9kZS5uYW1lKTtcbiAgICAgICAgICAgIGlmKG5vZGUgaW5zdGFuY2VvZiBUZXh0Tm9kZSkge1xuICAgICAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnLCd0cnVlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIE9iamVjdFxuICAgICAgICAgICAgICAgIC5rZXlzKGF0dHJpYnV0ZXMpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goKGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuZm9yRWFjaCgoY2hpbGQpID0+IGVsZW0uYXBwZW5kQ2hpbGQoY2hpbGQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbTtcbiAgICB9KTtcbn1cblxuY2xhc3MgRmFrZURvYyB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgIH1cblxuICAgIGFwcGVuZENoaWxkKGNoaWxkKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgfVxuXG4gICAgZ2V0IG91dGVySFRNTCgpIHtcbiAgICAgICAgbGV0IHN0ciA9ICcnO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gY2hpbGQub3V0ZXJIVE1MO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gY2hpbGQudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbn1cblxuc2VyaWFsaXplci5vbignaHRtbCcsICdkb2N1bWVudCcsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXJcbiAgICAgICAgLmhhbmRsZUNvbnRlbnRzKCdodG1sJywgbm9kZS5pdGVtcyB8fCBbXSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGNvbnRlbnRzKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cHV0ID0gbmV3IEZha2VEb2MoKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbnRlbnRzKSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRzLmZvckVhY2goKGNoaWxkKSA9PiBvdXRwdXQuYXBwZW5kQ2hpbGQoY2hpbGQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0pO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnaGVhZGluZycsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGVsZW1lbnQobm9kZSwgJ2gnICsgKG5vZGUubGV2ZWwgfHwgMSksIG5vZGUuYXR0cigpLCBbbmV3IFRleHROb2RlKG5vZGUudGV4dCwgbm9kZS5mb3JtYXRzKV0sIG9wdGlvbnMpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAncGFyYWdyYXBoJywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gZWxlbWVudChub2RlLCAncCcsIG5vZGUuYXR0cigpLCBbbmV3IFRleHROb2RlKG5vZGUudGV4dCwgbm9kZS5mb3JtYXRzKV0sIG9wdGlvbnMpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnaW1hZ2UnLCAobm9kZSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBlbGVtZW50KG5vZGUsICdpbWcnLCBub2RlLmF0dHIoKSwgbnVsbCwgb3B0aW9ucyk7XG59KTtcblxuc2VyaWFsaXplci5vbignaHRtbCcsICd0ZXh0JywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUudGV4dCk7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5lZGl0KSB7XG4gICAgICAgIC8vZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBub2RlLm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGVsZW1lbnQpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnKicsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGVsZW1lbnQobm9kZSwgbm9kZS5fdHlwZSwgbm9kZS5hdHRyKCksIG5vZGUuaXRlbXMsIG9wdGlvbnMpO1xufSk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbi8qKlxuICogQ29udmVydCBpdGVyYWJsZSBvYmplY3RzIGludG8gYXJyYXlzXG4gKiBAcGFyYW0gICB7SXRlcmFibGV9IGl0ZXJhYmxlXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJhaXplKGl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuIFtdLnNsaWNlLmFwcGx5KGl0ZXJhYmxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5KG5vZGUsIHF1ZXJ5KSB7XG4gICAgcmV0dXJuIGFycmFpemUobm9kZS5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShpbnB1dHMsIGV4Y2VwdCkge1xuICAgIGxldCByZXN1bHQgPSB7fTtcbiAgICBpbnB1dHNcbiAgICAgICAgLmZvckVhY2goKGlucHV0KSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE9iamVjdFxuICAgICAgICAgICAgICAgIC5rZXlzKGlucHV0KVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4Y2VwdCAmJiBleGNlcHQuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpbnB1dFtrZXldKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSwgYnJvd3Nlcjp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBTa2FyeW5hXG59XG5mcm9tICcuL3NrYXJ5bmEnO1xuXG5pbXBvcnQge1xuICAgIHF1ZXJ5XG59XG5mcm9tICdwYWdlb2JqZWN0bW9kZWwvc3JjL3V0aWwnO1xuXG5xdWVyeShkb2N1bWVudC5ib2R5LCAnW2RhdGEtc2thcnluYV0nKVxuICAgIC5mb3JFYWNoKGVsZW1lbnQgPT4gU2thcnluYS5pbml0RWRpdG9yKGVsZW1lbnQpKTtcblxud2luZG93LlNrYXJ5bmEgPSBTa2FyeW5hO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUsIGJyb3dzZXI6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgZnJvbUhUTUxcbn1cbmZyb20gJ3BhZ2VvYmplY3Rtb2RlbC9zcmMvcGFyc2VyL2Zyb21IVE1MJztcblxuaW1wb3J0IHtcbiAgICBmcm9tUE9NXG59XG5mcm9tICdwYWdlb2JqZWN0bW9kZWwvc3JjL3BhcnNlci9mcm9tUE9NJztcblxuaW1wb3J0IHtcbiAgICB0b0hUTUxcbn1cbmZyb20gJ3BhZ2VvYmplY3Rtb2RlbC9zcmMvc2VyaWFsaXplci90b0hUTUwnO1xuXG5pbXBvcnQge1xuICAgIEZpZWxkc1xufVxuZnJvbSAncGFnZW9iamVjdG1vZGVsL3NyYy9kb2N1bWVudCc7XG5cbmltcG9ydCB7XG4gICAgRW1pdHRlclxufVxuZnJvbSAncGFnZW9iamVjdG1vZGVsL3NyYy9lbWl0dGVyJztcblxuY29uc3QgREVGQVVMVF9ET0NVTUVOVCA9ICcjZGVmYXVsdCc7XG5cbmNvbnN0XG4gICAgQkFDS1NQQUNFID0gOCxcbiAgICBUQUIgPSA5LFxuICAgIEVOVEVSID0gMTMsXG4gICAgU0hJRlQgPSAxNixcbiAgICBDQVBTID0gMjAsXG4gICAgRVNDID0gMjcsXG4gICAgU1BBQ0UgPSAzMixcbiAgICBVUCA9IDM4LFxuICAgIERPV04gPSA0MCxcbiAgICBERUxFVEUgPSA0NixcbiAgICBQUkVWRU5UID0gW0VOVEVSXTtcblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBuYW1lIFhIUlxuICovXG5leHBvcnQgY2xhc3MgWEhSIHtcbiAgICAvKipcbiAgICAgKiBSZXJmb3JtIGFzeW5jaHJvdW5vdXMgcmVxdWVzdFxuICAgICAqIEBwYXJhbSAgIHtzdGlybmd9ICBwYXRoICAgVVJMIHRvIHJlc291cmNlXG4gICAgICogQHBhcmFtICAge3N0cmluZ30gIG1ldGhvZCBIVFRQIG1ldGhvZCB0byBiZSB1c2VkXG4gICAgICogQHBhcmFtICAge21peGVkfSAgIGRhdGEgICBkYXRhIHRvIGJlIHNlbnQgaW4gcG9zdCBvciBwdXRcbiAgICAgKiBAcGFyYW0gICB7Ym9vbGVhbn0gcmF3ICAgIGlmIHNob3VsZCBub3QgcGFyc2UgcmVzcG9uc2UgYXMgSlNPTlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBhamF4KHBhdGgsIG1ldGhvZCwgZGF0YSwgcmF3KSB7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgICAgICAgICAgICAgICAgIGh0dHBNZXRob2QgPSBtZXRob2QudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIHhoci5vcGVuKGh0dHBNZXRob2QsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChodHRwTWV0aG9kID09PSAncG9zdCcgfHwgaHR0cE1ldGhvZCA9PT0gJ3B1dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IERPTkUgPSA0LCAvLyByZWFkeVN0YXRlIDQgbWVhbnMgdGhlIHJlcXVlc3QgaXMgZG9uZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIE9LID0gMjAwOyAvLyBzdGF0dXMgMjAwIGlzIGEgc3VjY2Vzc2Z1bCByZXR1cm4uXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gRE9ORSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IE9LKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHIucmVzcG9uc2VUZXh0KTsgLy8gJ1RoaXMgaXMgdGhlIHJldHVybmVkIHRleHQuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh4aHIuc3RhdHVzID09PSAnMjA0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0Vycm9yOiAnICsgeGhyLnN0YXR1cykpOyAvLyBBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgdGhlIHJlcXVlc3QuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgeGhyLnNlbmQoZGF0YSA/IChyYXcgPyBkYXRhIDogSlNPTi5zdHJpbmdpZnkoZGF0YSkpIDogbnVsbCk7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQZXJmb3JtcyBHRVQgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgcGF0aCBVUkwgdG8gcmVzb3VyY2VcbiAgICAgICAgICogQHBhcmFtICAge2Jvb2xlYW59IHJhdyAgIGlmIHNob3VsZCBub3QgcGFyc2UgcmVzcG9uc2UgYXMgSlNPTlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgICAgICovXG4gICAgc3RhdGljIGdldChwYXRoLCByYXcpIHtcbiAgICAgICAgICAgIHJldHVybiBYSFIuYWpheChwYXRoLCAnZ2V0JywgbnVsbCwgcmF3KTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgUE9TVCByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBwYXRoIFVSTCB0byByZXNvdXJjZVxuICAgICAgICAgKiBAcGFyYW0gICB7Ym9vbGVhbn0gcmF3ICBpZiBzaG91bGQgbm90IHBhcnNlIHJlc3BvbnNlIGFzIEpTT05cbiAgICAgICAgICogQHBhcmFtICAge21peGVkfSAgIGRhdGEgZGF0YSB0byBiZSBzZW50XG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICBzdGF0aWMgcG9zdChwYXRoLCBkYXRhLCByYXcpIHtcbiAgICAgICAgICAgIHJldHVybiBYSFIuYWpheChwYXRoLCAncG9zdCcsIGRhdGEsIHJhdyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1zIFBVVCByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBwYXRoIFVSTCB0byByZXNvdXJjZVxuICAgICAgICAgKiBAcGFyYW0gICB7Ym9vbGVhbn0gcmF3ICBpZiBzaG91bGQgbm90IHBhcnNlIHJlc3BvbnNlIGFzIEpTT05cbiAgICAgICAgICogQHBhcmFtICAge21peGVkfSAgIGRhdGEgZGF0YSB0byBiZSBzZW50XG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICBzdGF0aWMgcHV0KHBhdGgsIGRhdGEsIHJhdykge1xuICAgICAgICAgICAgcmV0dXJuIFhIUi5hamF4KHBhdGgsICdwdXQnLCBkYXRhLCByYXcpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQZXJmb3JtcyBERUxFVEUgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgcGF0aCBVUkwgdG8gcmVzb3VyY2VcbiAgICAgICAgICogQHBhcmFtICAge2Jvb2xlYW59IHJhdyAgIGlmIHNob3VsZCBub3QgcGFyc2UgcmVzcG9uc2UgYXMgSlNPTlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgICAgICovXG4gICAgc3RhdGljIGRlbGV0ZShwYXRoLCByYXcpIHtcbiAgICAgICAgcmV0dXJuIFhIUi5hamF4KHBhdGgsICdkZWxldGUnLCBudWxsLCByYXcpO1xuICAgIH1cbn1cblxuXG4vKipcbiAqIEBjbGFzc1xuICogQG5hbWUgUmVwb3NpdG9yeVxuICogQGV4dGVuZHMgRW1pdHRlclxuICovXG5leHBvcnQgY2xhc3MgUmVwb3NpdG9yeSBleHRlbmRzIEVtaXR0ZXIge1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IHtvYmplY3R9IGRvY3VtZW50cyBoYXNobWFwXG4gICAgICovXG4gICAgc3RhdGljIGdldCBkb2N1bWVudHMoKSB7XG4gICAgICAgIHRoaXMuX2RvY3VtZW50cyA9IHRoaXMuX2RvY3VtZW50cyB8fCB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXBvcnRzIGNoYW5nZS91cGRhdGUgaW4gZG9jdW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZG9jICAgICAgICAgICAgIG5hbWUgb2YgZG9jdW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IHBhdGggIHBhdGggaW4gZG9jdW1lbnQgb3IgdW5kZWZpbmVkIGlmIHdob2xlIGRvY3VtZW50IGhhcyB1cGRhdGVkXG4gICAgICogQHBhcmFtIHttaXhlZH0gIHZhbHVlICAgICAgICAgICBuZXcgY29udGVudFxuICAgICAqL1xuICAgIHN0YXRpYyByZXBvcnQoZG9jLCBwYXRoLCB2YWx1ZSkge1xuICAgICAgICBsZXQgZG9jcyA9IHRoaXMuZG9jdW1lbnRzO1xuXG4gICAgICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRvY3NbZG9jXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFkb2NzLmhhc093blByb3BlcnR5KGRvYykpIHtcbiAgICAgICAgICAgICAgICBkb2NzW2RvY10gPSBuZXcgRmllbGRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2NzW2RvY10uc2V0KHBhdGgsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScsIHtcbiAgICAgICAgICAgIGRvYzogZG9jLFxuICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgIGlkOiB2YWx1ZS5uYW1lXG4gICAgICAgIH0pO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcG9tJykuaW5uZXJUZXh0ID0gSlNPTi5zdHJpbmdpZnkodGhpcy5kb2N1bWVudHMsIG51bGwsIDIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYXR0cihlbGVtZW50LCBhdHRyaWJ1dGUsIGZhbGxiYWNrKSB7XG4gICAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxsYmFjaztcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkudG9TdHJpbmcoKTtcbn1cblxuZXhwb3J0IGNsYXNzIFNrYXJ5bmEge1xuXG4gICAgc3RhdGljIGdldCBlZGl0b3JzKCkge1xuICAgICAgICB0aGlzLl9lZGl0b3JzID0gdGhpcy5fZWRpdG9ycyB8fCBbXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VkaXRvcnM7XG4gICAgfVxuXG4gICAgc3RhdGljIGluaXRFZGl0b3IoZWxlbWVudCkge1xuICAgICAgICBsZXQgY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIGFsbG93OiBhdHRyKGVsZW1lbnQsICdkYXRhLXNrYXJ5bmEtYWxsb3cnLCAnKicpLnNwbGl0KC9cXHMqLFxccyovKSxcbiAgICAgICAgICAgICAgICBwYXRoOiBhdHRyKGVsZW1lbnQsICdkYXRhLXNrYXJ5bmEtcGF0aCcpLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBhdHRyKGVsZW1lbnQsICdwbGFjZWhvbGRlcicpLFxuICAgICAgICAgICAgICAgIGRvYzogYXR0cihlbGVtZW50LCAnZGF0YS1za2FyeW5hLWRvYycsIERFRkFVTFRfRE9DVU1FTlQpLFxuICAgICAgICAgICAgICAgIHZhcmlhbnQ6IGF0dHIoZWxlbWVudCwgJ2RhdGEtc2thcnluYS12YXJpYW50JylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlZGl0b3IgPSBuZXcgU2thcnluYShlbGVtZW50LCBjb25maWcpO1xuICAgICAgICBTa2FyeW5hLmVkaXRvcnMucHVzaChlZGl0b3IpO1xuICAgICAgICByZXR1cm4gZWRpdG9yO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2FkKHBhdGgsIGFzRG9jdW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIFhIUlxuICAgICAgICAgICAgLmdldChwYXRoKVxuICAgICAgICAgICAgLnRoZW4oY29udGVudCA9PiBmcm9tUE9NKEpTT04ucGFyc2UoY29udGVudCkpKVxuICAgICAgICAgICAgLnRoZW4ocG9tID0+IFJlcG9zaXRvcnkucmVwb3J0KGFzRG9jdW1lbnQgfHwgREVGQVVMVF9ET0NVTUVOVCwgdW5kZWZpbmVkLCBwb20pKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICAgICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBSZXBvc2l0b3J5Lm9uKCdjaGFuZ2UnLCB0aGlzLm9uUmVwb3NpdG9yeVVwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5yZWFkeSA9XG4gICAgICAgICAgICBmcm9tSFRNTChlbGVtZW50KVxuICAgICAgICAgICAgLnRoZW4oY29udGVudCA9PiB7XG4gICAgICAgICAgICAgICAgUmVwb3NpdG9yeS5yZXBvcnQoY29uZmlnLmRvYywgY29uZmlnLnBhdGgsIGNvbnRlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVkcmF3RWRpdG9yKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBub2RlID0gUmVwb3NpdG9yeS5kb2N1bWVudHNbdGhpcy5fY29uZmlnLmRvY107XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5wYXRoKSB7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5nZXQodGhpcy5fY29uZmlnLnBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGUgJiYgbm9kZS50eXBlID09PSAnVmFyaWFudHMnICYmIG5vZGUuYmVzdCkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUuYmVzdCh0aGlzLl9jb25maWcudmFyaWFudCB8fCAnKicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIW5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub2RlLmRlY29yYXRlKHNlbGYuZWxlbWVudClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbGYub25LZXlVcC5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRFbGVtZW50KGVsZW1lbnQpIHtcblxuICAgICAgICBsZXQgZG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50IHx8IGVsZW1lbnQuZG9jdW1lbnQsXG4gICAgICAgICAgICB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdyxcbiAgICAgICAgICAgIHNlbCxcbiAgICAgICAgICAgIG5vZGU7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB3aW4uZ2V0U2VsZWN0aW9uICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzZWwgPSB3aW4uZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWwgPSBkb2Muc2VsZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9kZSA9IHNlbC5mb2N1c05vZGU7XG5cbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gdGhpcy5nZXRFZGl0YWJsZU5vZGUobm9kZSk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LWVsZW1lbnQnKS5pbm5lclRleHQgPSBub2RlLm91dGVySFRNTDtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgZ2V0RWRpdGFibGVOb2RlKG5vZGUpIHtcbiAgICAgICAgd2hpbGUgKG5vZGUgJiYgKCFub2RlLmhhc0F0dHJpYnV0ZSB8fCAhbm9kZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcpKSkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIGtleSB1cCBldmVudFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAgICovXG4gICAgb25LZXlVcChldmVudCkge1xuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMuZ2V0Q3VycmVudEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKFBSRVZFTlQuaW5kZXhPZihldmVudC5rZXlDb2RlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIC8vdGhpcy5vd25BY3Rpb24oZXZlbnQua2V5Q29kZSwgY3VycmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZWxlbWVudFVwZGF0ZWQoY3VycmVudCksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXBvc2l0b3J5VXBkYXRlKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5kYXRhLmRvYyAhPT0gdGhpcy5fY29uZmlnLmRvYykgcmV0dXJuO1xuICAgICAgICBpZiAoZXZlbnQuZGF0YS5wYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmVkcmF3RWRpdG9yKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbGVtZW50VXBkYXRlZChlbGVtZW50KSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgZnJvbUhUTUwoZWxlbWVudClcbiAgICAgICAgICAgIC50aGVuKHBvbSA9PiB7XG4gICAgICAgICAgICAgICAgcG9tLm5hbWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLWlkJykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBSZXBvc2l0b3J5LnJlcG9ydChzZWxmLl9jb25maWcuZG9jLCAnQCcgKyBwb20ubmFtZSwgcG9tKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==
