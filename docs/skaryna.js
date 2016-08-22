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

var Pipe = require('../pipe').Pipe;

var Context = function Context() {};

Context.prototype.setResult = function (result) {
	this.result = result;
	this.hasResult = true;
	return this;
};

Context.prototype.exit = function () {
	this.exiting = true;
	return this;
};

Context.prototype.switchTo = function (next, pipe) {
	if (typeof next === 'string' || next instanceof Pipe) {
		this.nextPipe = next;
	} else {
		this.next = next;
		if (pipe) {
			this.nextPipe = pipe;
		}
	}
	return this;
};

Context.prototype.push = function (child, name) {
	child.parent = this;
	if (typeof name !== 'undefined') {
		child.childName = name;
	}
	child.root = this.root || this;
	child.options = child.options || this.options;
	if (!this.children) {
		this.children = [child];
		this.nextAfterChildren = this.next || null;
		this.next = child;
	} else {
		this.children[this.children.length - 1].next = child;
		this.children.push(child);
	}
	child.next = this;
	return this;
};

exports.Context = Context;

},{"../pipe":23}],10:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Context = require('./context').Context;
var dateReviver = require('../date-reviver');

var DiffContext = function DiffContext(left, right) {
  this.left = left;
  this.right = right;
  this.pipe = 'diff';
};

DiffContext.prototype = new Context();

DiffContext.prototype.setResult = function (result) {
  if (this.options.cloneDiffValues) {
    var clone = typeof this.options.cloneDiffValues === 'function' ? this.options.cloneDiffValues : function (value) {
      return JSON.parse(JSON.stringify(value), dateReviver);
    };
    if (_typeof(result[0]) === 'object') {
      result[0] = clone(result[0]);
    }
    if (_typeof(result[1]) === 'object') {
      result[1] = clone(result[1]);
    }
  }
  return Context.prototype.setResult.apply(this, arguments);
};

exports.DiffContext = DiffContext;

},{"../date-reviver":13,"./context":9}],11:[function(require,module,exports){
'use strict';

var Context = require('./context').Context;

var PatchContext = function PatchContext(left, delta) {
  this.left = left;
  this.delta = delta;
  this.pipe = 'patch';
};

PatchContext.prototype = new Context();

exports.PatchContext = PatchContext;

},{"./context":9}],12:[function(require,module,exports){
'use strict';

var Context = require('./context').Context;

var ReverseContext = function ReverseContext(delta) {
  this.delta = delta;
  this.pipe = 'reverse';
};

ReverseContext.prototype = new Context();

exports.ReverseContext = ReverseContext;

},{"./context":9}],13:[function(require,module,exports){
'use strict';

// use as 2nd parameter for JSON.parse to revive Date instances
module.exports = function dateReviver(key, value) {
  var parts;
  if (typeof value === 'string') {
    parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d*))?(Z|([+\-])(\d{2}):(\d{2}))$/.exec(value);
    if (parts) {
      return new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], +parts[4], +parts[5], +parts[6], +(parts[7] || 0)));
    }
  }
  return value;
};

},{}],14:[function(require,module,exports){
'use strict';

var Processor = require('./processor').Processor;
var Pipe = require('./pipe').Pipe;
var DiffContext = require('./contexts/diff').DiffContext;
var PatchContext = require('./contexts/patch').PatchContext;
var ReverseContext = require('./contexts/reverse').ReverseContext;

var trivial = require('./filters/trivial');
var nested = require('./filters/nested');
var arrays = require('./filters/arrays');
var dates = require('./filters/dates');
var texts = require('./filters/texts');

var DiffPatcher = function DiffPatcher(options) {
  this.processor = new Processor(options);
  this.processor.pipe(new Pipe('diff').append(nested.collectChildrenDiffFilter, trivial.diffFilter, dates.diffFilter, texts.diffFilter, nested.objectsDiffFilter, arrays.diffFilter).shouldHaveResult());
  this.processor.pipe(new Pipe('patch').append(nested.collectChildrenPatchFilter, arrays.collectChildrenPatchFilter, trivial.patchFilter, texts.patchFilter, nested.patchFilter, arrays.patchFilter).shouldHaveResult());
  this.processor.pipe(new Pipe('reverse').append(nested.collectChildrenReverseFilter, arrays.collectChildrenReverseFilter, trivial.reverseFilter, texts.reverseFilter, nested.reverseFilter, arrays.reverseFilter).shouldHaveResult());
};

DiffPatcher.prototype.options = function () {
  return this.processor.options.apply(this.processor, arguments);
};

DiffPatcher.prototype.diff = function (left, right) {
  return this.processor.process(new DiffContext(left, right));
};

DiffPatcher.prototype.patch = function (left, delta) {
  return this.processor.process(new PatchContext(left, delta));
};

DiffPatcher.prototype.reverse = function (delta) {
  return this.processor.process(new ReverseContext(delta));
};

DiffPatcher.prototype.unpatch = function (right, delta) {
  return this.patch(right, this.reverse(delta));
};

exports.DiffPatcher = DiffPatcher;

},{"./contexts/diff":10,"./contexts/patch":11,"./contexts/reverse":12,"./filters/arrays":16,"./filters/dates":17,"./filters/nested":19,"./filters/texts":20,"./filters/trivial":21,"./pipe":23,"./processor":24}],15:[function(require,module,exports){
'use strict';

exports.isBrowser = typeof window !== 'undefined';

},{}],16:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var DiffContext = require('../contexts/diff').DiffContext;
var PatchContext = require('../contexts/patch').PatchContext;
var ReverseContext = require('../contexts/reverse').ReverseContext;

var lcs = require('./lcs');

var ARRAY_MOVE = 3;

var isArray = typeof Array.isArray === 'function' ?
// use native function
Array.isArray :
// use instanceof operator
function (a) {
  return a instanceof Array;
};

var arrayIndexOf = typeof Array.prototype.indexOf === 'function' ? function (array, item) {
  return array.indexOf(item);
} : function (array, item) {
  var length = array.length;
  for (var i = 0; i < length; i++) {
    if (array[i] === item) {
      return i;
    }
  }
  return -1;
};

function arraysHaveMatchByRef(array1, array2, len1, len2) {
  for (var index1 = 0; index1 < len1; index1++) {
    var val1 = array1[index1];
    for (var index2 = 0; index2 < len2; index2++) {
      var val2 = array2[index2];
      if (val1 === val2) {
        return true;
      }
    }
  }
}

function matchItems(array1, array2, index1, index2, context) {
  var value1 = array1[index1];
  var value2 = array2[index2];
  if (value1 === value2) {
    return true;
  }
  if ((typeof value1 === 'undefined' ? 'undefined' : _typeof(value1)) !== 'object' || (typeof value2 === 'undefined' ? 'undefined' : _typeof(value2)) !== 'object') {
    return false;
  }
  var objectHash = context.objectHash;
  if (!objectHash) {
    // no way to match objects was provided, try match by position
    return context.matchByPosition && index1 === index2;
  }
  var hash1;
  var hash2;
  if (typeof index1 === 'number') {
    context.hashCache1 = context.hashCache1 || [];
    hash1 = context.hashCache1[index1];
    if (typeof hash1 === 'undefined') {
      context.hashCache1[index1] = hash1 = objectHash(value1, index1);
    }
  } else {
    hash1 = objectHash(value1);
  }
  if (typeof hash1 === 'undefined') {
    return false;
  }
  if (typeof index2 === 'number') {
    context.hashCache2 = context.hashCache2 || [];
    hash2 = context.hashCache2[index2];
    if (typeof hash2 === 'undefined') {
      context.hashCache2[index2] = hash2 = objectHash(value2, index2);
    }
  } else {
    hash2 = objectHash(value2);
  }
  if (typeof hash2 === 'undefined') {
    return false;
  }
  return hash1 === hash2;
}

var diffFilter = function arraysDiffFilter(context) {
  if (!context.leftIsArray) {
    return;
  }

  var matchContext = {
    objectHash: context.options && context.options.objectHash,
    matchByPosition: context.options && context.options.matchByPosition
  };
  var commonHead = 0;
  var commonTail = 0;
  var index;
  var index1;
  var index2;
  var array1 = context.left;
  var array2 = context.right;
  var len1 = array1.length;
  var len2 = array2.length;

  var child;

  if (len1 > 0 && len2 > 0 && !matchContext.objectHash && typeof matchContext.matchByPosition !== 'boolean') {
    matchContext.matchByPosition = !arraysHaveMatchByRef(array1, array2, len1, len2);
  }

  // separate common head
  while (commonHead < len1 && commonHead < len2 && matchItems(array1, array2, commonHead, commonHead, matchContext)) {
    index = commonHead;
    child = new DiffContext(context.left[index], context.right[index]);
    context.push(child, index);
    commonHead++;
  }
  // separate common tail
  while (commonTail + commonHead < len1 && commonTail + commonHead < len2 && matchItems(array1, array2, len1 - 1 - commonTail, len2 - 1 - commonTail, matchContext)) {
    index1 = len1 - 1 - commonTail;
    index2 = len2 - 1 - commonTail;
    child = new DiffContext(context.left[index1], context.right[index2]);
    context.push(child, index2);
    commonTail++;
  }
  var result;
  if (commonHead + commonTail === len1) {
    if (len1 === len2) {
      // arrays are identical
      context.setResult(undefined).exit();
      return;
    }
    // trivial case, a block (1 or more consecutive items) was added
    result = result || {
      _t: 'a'
    };
    for (index = commonHead; index < len2 - commonTail; index++) {
      result[index] = [array2[index]];
    }
    context.setResult(result).exit();
    return;
  }
  if (commonHead + commonTail === len2) {
    // trivial case, a block (1 or more consecutive items) was removed
    result = result || {
      _t: 'a'
    };
    for (index = commonHead; index < len1 - commonTail; index++) {
      result['_' + index] = [array1[index], 0, 0];
    }
    context.setResult(result).exit();
    return;
  }
  // reset hash cache
  delete matchContext.hashCache1;
  delete matchContext.hashCache2;

  // diff is not trivial, find the LCS (Longest Common Subsequence)
  var trimmed1 = array1.slice(commonHead, len1 - commonTail);
  var trimmed2 = array2.slice(commonHead, len2 - commonTail);
  var seq = lcs.get(trimmed1, trimmed2, matchItems, matchContext);
  var removedItems = [];
  result = result || {
    _t: 'a'
  };
  for (index = commonHead; index < len1 - commonTail; index++) {
    if (arrayIndexOf(seq.indices1, index - commonHead) < 0) {
      // removed
      result['_' + index] = [array1[index], 0, 0];
      removedItems.push(index);
    }
  }

  var detectMove = true;
  if (context.options && context.options.arrays && context.options.arrays.detectMove === false) {
    detectMove = false;
  }
  var includeValueOnMove = false;
  if (context.options && context.options.arrays && context.options.arrays.includeValueOnMove) {
    includeValueOnMove = true;
  }

  var removedItemsLength = removedItems.length;
  for (index = commonHead; index < len2 - commonTail; index++) {
    var indexOnArray2 = arrayIndexOf(seq.indices2, index - commonHead);
    if (indexOnArray2 < 0) {
      // added, try to match with a removed item and register as position move
      var isMove = false;
      if (detectMove && removedItemsLength > 0) {
        for (var removeItemIndex1 = 0; removeItemIndex1 < removedItemsLength; removeItemIndex1++) {
          index1 = removedItems[removeItemIndex1];
          if (matchItems(trimmed1, trimmed2, index1 - commonHead, index - commonHead, matchContext)) {
            // store position move as: [originalValue, newPosition, ARRAY_MOVE]
            result['_' + index1].splice(1, 2, index, ARRAY_MOVE);
            if (!includeValueOnMove) {
              // don't include moved value on diff, to save bytes
              result['_' + index1][0] = '';
            }

            index2 = index;
            child = new DiffContext(context.left[index1], context.right[index2]);
            context.push(child, index2);
            removedItems.splice(removeItemIndex1, 1);
            isMove = true;
            break;
          }
        }
      }
      if (!isMove) {
        // added
        result[index] = [array2[index]];
      }
    } else {
      // match, do inner diff
      index1 = seq.indices1[indexOnArray2] + commonHead;
      index2 = seq.indices2[indexOnArray2] + commonHead;
      child = new DiffContext(context.left[index1], context.right[index2]);
      context.push(child, index2);
    }
  }

  context.setResult(result).exit();
};
diffFilter.filterName = 'arrays';

var compare = {
  numerically: function numerically(a, b) {
    return a - b;
  },
  numericallyBy: function numericallyBy(name) {
    return function (a, b) {
      return a[name] - b[name];
    };
  }
};

var patchFilter = function nestedPatchFilter(context) {
  if (!context.nested) {
    return;
  }
  if (context.delta._t !== 'a') {
    return;
  }
  var index, index1;

  var delta = context.delta;
  var array = context.left;

  // first, separate removals, insertions and modifications
  var toRemove = [];
  var toInsert = [];
  var toModify = [];
  for (index in delta) {
    if (index !== '_t') {
      if (index[0] === '_') {
        // removed item from original array
        if (delta[index][2] === 0 || delta[index][2] === ARRAY_MOVE) {
          toRemove.push(parseInt(index.slice(1), 10));
        } else {
          throw new Error('only removal or move can be applied at original array indices' + ', invalid diff type: ' + delta[index][2]);
        }
      } else {
        if (delta[index].length === 1) {
          // added item at new array
          toInsert.push({
            index: parseInt(index, 10),
            value: delta[index][0]
          });
        } else {
          // modified item at new array
          toModify.push({
            index: parseInt(index, 10),
            delta: delta[index]
          });
        }
      }
    }
  }

  // remove items, in reverse order to avoid sawing our own floor
  toRemove = toRemove.sort(compare.numerically);
  for (index = toRemove.length - 1; index >= 0; index--) {
    index1 = toRemove[index];
    var indexDiff = delta['_' + index1];
    var removedValue = array.splice(index1, 1)[0];
    if (indexDiff[2] === ARRAY_MOVE) {
      // reinsert later
      toInsert.push({
        index: indexDiff[1],
        value: removedValue
      });
    }
  }

  // insert items, in reverse order to avoid moving our own floor
  toInsert = toInsert.sort(compare.numericallyBy('index'));
  var toInsertLength = toInsert.length;
  for (index = 0; index < toInsertLength; index++) {
    var insertion = toInsert[index];
    array.splice(insertion.index, 0, insertion.value);
  }

  // apply modifications
  var toModifyLength = toModify.length;
  var child;
  if (toModifyLength > 0) {
    for (index = 0; index < toModifyLength; index++) {
      var modification = toModify[index];
      child = new PatchContext(context.left[modification.index], modification.delta);
      context.push(child, modification.index);
    }
  }

  if (!context.children) {
    context.setResult(context.left).exit();
    return;
  }
  context.exit();
};
patchFilter.filterName = 'arrays';

var collectChildrenPatchFilter = function collectChildrenPatchFilter(context) {
  if (!context || !context.children) {
    return;
  }
  if (context.delta._t !== 'a') {
    return;
  }
  var length = context.children.length;
  var child;
  for (var index = 0; index < length; index++) {
    child = context.children[index];
    context.left[child.childName] = child.result;
  }
  context.setResult(context.left).exit();
};
collectChildrenPatchFilter.filterName = 'arraysCollectChildren';

var reverseFilter = function arraysReverseFilter(context) {
  if (!context.nested) {
    if (context.delta[2] === ARRAY_MOVE) {
      context.newName = '_' + context.delta[1];
      context.setResult([context.delta[0], parseInt(context.childName.substr(1), 10), ARRAY_MOVE]).exit();
    }
    return;
  }
  if (context.delta._t !== 'a') {
    return;
  }
  var name, child;
  for (name in context.delta) {
    if (name === '_t') {
      continue;
    }
    child = new ReverseContext(context.delta[name]);
    context.push(child, name);
  }
  context.exit();
};
reverseFilter.filterName = 'arrays';

var reverseArrayDeltaIndex = function reverseArrayDeltaIndex(delta, index, itemDelta) {
  if (typeof index === 'string' && index[0] === '_') {
    return parseInt(index.substr(1), 10);
  } else if (isArray(itemDelta) && itemDelta[2] === 0) {
    return '_' + index;
  }

  var reverseIndex = +index;
  for (var deltaIndex in delta) {
    var deltaItem = delta[deltaIndex];
    if (isArray(deltaItem)) {
      if (deltaItem[2] === ARRAY_MOVE) {
        var moveFromIndex = parseInt(deltaIndex.substr(1), 10);
        var moveToIndex = deltaItem[1];
        if (moveToIndex === +index) {
          return moveFromIndex;
        }
        if (moveFromIndex <= reverseIndex && moveToIndex > reverseIndex) {
          reverseIndex++;
        } else if (moveFromIndex >= reverseIndex && moveToIndex < reverseIndex) {
          reverseIndex--;
        }
      } else if (deltaItem[2] === 0) {
        var deleteIndex = parseInt(deltaIndex.substr(1), 10);
        if (deleteIndex <= reverseIndex) {
          reverseIndex++;
        }
      } else if (deltaItem.length === 1 && deltaIndex <= reverseIndex) {
        reverseIndex--;
      }
    }
  }

  return reverseIndex;
};

var collectChildrenReverseFilter = function collectChildrenReverseFilter(context) {
  if (!context || !context.children) {
    return;
  }
  if (context.delta._t !== 'a') {
    return;
  }
  var length = context.children.length;
  var child;
  var delta = {
    _t: 'a'
  };

  for (var index = 0; index < length; index++) {
    child = context.children[index];
    var name = child.newName;
    if (typeof name === 'undefined') {
      name = reverseArrayDeltaIndex(context.delta, child.childName, child.result);
    }
    if (delta[name] !== child.result) {
      delta[name] = child.result;
    }
  }
  context.setResult(delta).exit();
};
collectChildrenReverseFilter.filterName = 'arraysCollectChildren';

exports.diffFilter = diffFilter;
exports.patchFilter = patchFilter;
exports.collectChildrenPatchFilter = collectChildrenPatchFilter;
exports.reverseFilter = reverseFilter;
exports.collectChildrenReverseFilter = collectChildrenReverseFilter;

},{"../contexts/diff":10,"../contexts/patch":11,"../contexts/reverse":12,"./lcs":18}],17:[function(require,module,exports){
'use strict';

var diffFilter = function datesDiffFilter(context) {
  if (context.left instanceof Date) {
    if (context.right instanceof Date) {
      if (context.left.getTime() !== context.right.getTime()) {
        context.setResult([context.left, context.right]);
      } else {
        context.setResult(undefined);
      }
    } else {
      context.setResult([context.left, context.right]);
    }
    context.exit();
  } else if (context.right instanceof Date) {
    context.setResult([context.left, context.right]).exit();
  }
};
diffFilter.filterName = 'dates';

exports.diffFilter = diffFilter;

},{}],18:[function(require,module,exports){
'use strict';

/*

LCS implementation that supports arrays or strings

reference: http://en.wikipedia.org/wiki/Longest_common_subsequence_problem

*/

var defaultMatch = function defaultMatch(array1, array2, index1, index2) {
  return array1[index1] === array2[index2];
};

var lengthMatrix = function lengthMatrix(array1, array2, match, context) {
  var len1 = array1.length;
  var len2 = array2.length;
  var x, y;

  // initialize empty matrix of len1+1 x len2+1
  var matrix = [len1 + 1];
  for (x = 0; x < len1 + 1; x++) {
    matrix[x] = [len2 + 1];
    for (y = 0; y < len2 + 1; y++) {
      matrix[x][y] = 0;
    }
  }
  matrix.match = match;
  // save sequence lengths for each coordinate
  for (x = 1; x < len1 + 1; x++) {
    for (y = 1; y < len2 + 1; y++) {
      if (match(array1, array2, x - 1, y - 1, context)) {
        matrix[x][y] = matrix[x - 1][y - 1] + 1;
      } else {
        matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
      }
    }
  }
  return matrix;
};

var backtrack = function backtrack(matrix, array1, array2, index1, index2, context) {
  if (index1 === 0 || index2 === 0) {
    return {
      sequence: [],
      indices1: [],
      indices2: []
    };
  }

  if (matrix.match(array1, array2, index1 - 1, index2 - 1, context)) {
    var subsequence = backtrack(matrix, array1, array2, index1 - 1, index2 - 1, context);
    subsequence.sequence.push(array1[index1 - 1]);
    subsequence.indices1.push(index1 - 1);
    subsequence.indices2.push(index2 - 1);
    return subsequence;
  }

  if (matrix[index1][index2 - 1] > matrix[index1 - 1][index2]) {
    return backtrack(matrix, array1, array2, index1, index2 - 1, context);
  } else {
    return backtrack(matrix, array1, array2, index1 - 1, index2, context);
  }
};

var get = function get(array1, array2, match, context) {
  context = context || {};
  var matrix = lengthMatrix(array1, array2, match || defaultMatch, context);
  var result = backtrack(matrix, array1, array2, array1.length, array2.length, context);
  if (typeof array1 === 'string' && typeof array2 === 'string') {
    result.sequence = result.sequence.join('');
  }
  return result;
};

exports.get = get;

},{}],19:[function(require,module,exports){
'use strict';

var DiffContext = require('../contexts/diff').DiffContext;
var PatchContext = require('../contexts/patch').PatchContext;
var ReverseContext = require('../contexts/reverse').ReverseContext;

var collectChildrenDiffFilter = function collectChildrenDiffFilter(context) {
  if (!context || !context.children) {
    return;
  }
  var length = context.children.length;
  var child;
  var result = context.result;
  for (var index = 0; index < length; index++) {
    child = context.children[index];
    if (typeof child.result === 'undefined') {
      continue;
    }
    result = result || {};
    result[child.childName] = child.result;
  }
  if (result && context.leftIsArray) {
    result._t = 'a';
  }
  context.setResult(result).exit();
};
collectChildrenDiffFilter.filterName = 'collectChildren';

var objectsDiffFilter = function objectsDiffFilter(context) {
  if (context.leftIsArray || context.leftType !== 'object') {
    return;
  }

  var name,
      child,
      propertyFilter = context.options.propertyFilter;
  for (name in context.left) {
    if (!Object.prototype.hasOwnProperty.call(context.left, name)) {
      continue;
    }
    if (propertyFilter && !propertyFilter(name, context)) {
      continue;
    }
    child = new DiffContext(context.left[name], context.right[name]);
    context.push(child, name);
  }
  for (name in context.right) {
    if (!Object.prototype.hasOwnProperty.call(context.right, name)) {
      continue;
    }
    if (propertyFilter && !propertyFilter(name, context)) {
      continue;
    }
    if (typeof context.left[name] === 'undefined') {
      child = new DiffContext(undefined, context.right[name]);
      context.push(child, name);
    }
  }

  if (!context.children || context.children.length === 0) {
    context.setResult(undefined).exit();
    return;
  }
  context.exit();
};
objectsDiffFilter.filterName = 'objects';

var patchFilter = function nestedPatchFilter(context) {
  if (!context.nested) {
    return;
  }
  if (context.delta._t) {
    return;
  }
  var name, child;
  for (name in context.delta) {
    child = new PatchContext(context.left[name], context.delta[name]);
    context.push(child, name);
  }
  context.exit();
};
patchFilter.filterName = 'objects';

var collectChildrenPatchFilter = function collectChildrenPatchFilter(context) {
  if (!context || !context.children) {
    return;
  }
  if (context.delta._t) {
    return;
  }
  var length = context.children.length;
  var child;
  for (var index = 0; index < length; index++) {
    child = context.children[index];
    if (Object.prototype.hasOwnProperty.call(context.left, child.childName) && child.result === undefined) {
      delete context.left[child.childName];
    } else if (context.left[child.childName] !== child.result) {
      context.left[child.childName] = child.result;
    }
  }
  context.setResult(context.left).exit();
};
collectChildrenPatchFilter.filterName = 'collectChildren';

var reverseFilter = function nestedReverseFilter(context) {
  if (!context.nested) {
    return;
  }
  if (context.delta._t) {
    return;
  }
  var name, child;
  for (name in context.delta) {
    child = new ReverseContext(context.delta[name]);
    context.push(child, name);
  }
  context.exit();
};
reverseFilter.filterName = 'objects';

var collectChildrenReverseFilter = function collectChildrenReverseFilter(context) {
  if (!context || !context.children) {
    return;
  }
  if (context.delta._t) {
    return;
  }
  var length = context.children.length;
  var child;
  var delta = {};
  for (var index = 0; index < length; index++) {
    child = context.children[index];
    if (delta[child.childName] !== child.result) {
      delta[child.childName] = child.result;
    }
  }
  context.setResult(delta).exit();
};
collectChildrenReverseFilter.filterName = 'collectChildren';

exports.collectChildrenDiffFilter = collectChildrenDiffFilter;
exports.objectsDiffFilter = objectsDiffFilter;
exports.patchFilter = patchFilter;
exports.collectChildrenPatchFilter = collectChildrenPatchFilter;
exports.reverseFilter = reverseFilter;
exports.collectChildrenReverseFilter = collectChildrenReverseFilter;

},{"../contexts/diff":10,"../contexts/patch":11,"../contexts/reverse":12}],20:[function(require,module,exports){
'use strict';

/* global diff_match_patch */
var TEXT_DIFF = 2;
var DEFAULT_MIN_LENGTH = 60;
var cachedDiffPatch = null;

var getDiffMatchPatch = function getDiffMatchPatch(required) {
  /*jshint camelcase: false */

  if (!cachedDiffPatch) {
    var instance;
    if (typeof diff_match_patch !== 'undefined') {
      // already loaded, probably a browser
      instance = typeof diff_match_patch === 'function' ? new diff_match_patch() : new diff_match_patch.diff_match_patch();
    } else if (typeof require === 'function') {
      try {
        var dmpModuleName = 'diff_match_patch_uncompressed';
        var dmp = require('../../public/external/' + dmpModuleName);
        instance = new dmp.diff_match_patch();
      } catch (err) {
        instance = null;
      }
    }
    if (!instance) {
      if (!required) {
        return null;
      }
      var error = new Error('text diff_match_patch library not found');
      error.diff_match_patch_not_found = true;
      throw error;
    }
    cachedDiffPatch = {
      diff: function diff(txt1, txt2) {
        return instance.patch_toText(instance.patch_make(txt1, txt2));
      },
      patch: function patch(txt1, _patch) {
        var results = instance.patch_apply(instance.patch_fromText(_patch), txt1);
        for (var i = 0; i < results[1].length; i++) {
          if (!results[1][i]) {
            var error = new Error('text patch failed');
            error.textPatchFailed = true;
          }
        }
        return results[0];
      }
    };
  }
  return cachedDiffPatch;
};

var diffFilter = function textsDiffFilter(context) {
  if (context.leftType !== 'string') {
    return;
  }
  var minLength = context.options && context.options.textDiff && context.options.textDiff.minLength || DEFAULT_MIN_LENGTH;
  if (context.left.length < minLength || context.right.length < minLength) {
    context.setResult([context.left, context.right]).exit();
    return;
  }
  // large text, try to use a text-diff algorithm
  var diffMatchPatch = getDiffMatchPatch();
  if (!diffMatchPatch) {
    // diff-match-patch library not available, fallback to regular string replace
    context.setResult([context.left, context.right]).exit();
    return;
  }
  var diff = diffMatchPatch.diff;
  context.setResult([diff(context.left, context.right), 0, TEXT_DIFF]).exit();
};
diffFilter.filterName = 'texts';

var patchFilter = function textsPatchFilter(context) {
  if (context.nested) {
    return;
  }
  if (context.delta[2] !== TEXT_DIFF) {
    return;
  }

  // text-diff, use a text-patch algorithm
  var patch = getDiffMatchPatch(true).patch;
  context.setResult(patch(context.left, context.delta[0])).exit();
};
patchFilter.filterName = 'texts';

var textDeltaReverse = function textDeltaReverse(delta) {
  var i,
      l,
      lines,
      line,
      lineTmp,
      header = null,
      headerRegex = /^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/,
      lineHeader,
      lineAdd,
      lineRemove;
  lines = delta.split('\n');
  for (i = 0, l = lines.length; i < l; i++) {
    line = lines[i];
    var lineStart = line.slice(0, 1);
    if (lineStart === '@') {
      header = headerRegex.exec(line);
      lineHeader = i;
      lineAdd = null;
      lineRemove = null;

      // fix header
      lines[lineHeader] = '@@ -' + header[3] + ',' + header[4] + ' +' + header[1] + ',' + header[2] + ' @@';
    } else if (lineStart === '+') {
      lineAdd = i;
      lines[i] = '-' + lines[i].slice(1);
      if (lines[i - 1].slice(0, 1) === '+') {
        // swap lines to keep default order (-+)
        lineTmp = lines[i];
        lines[i] = lines[i - 1];
        lines[i - 1] = lineTmp;
      }
    } else if (lineStart === '-') {
      lineRemove = i;
      lines[i] = '+' + lines[i].slice(1);
    }
  }
  return lines.join('\n');
};

var reverseFilter = function textsReverseFilter(context) {
  if (context.nested) {
    return;
  }
  if (context.delta[2] !== TEXT_DIFF) {
    return;
  }

  // text-diff, use a text-diff algorithm
  context.setResult([textDeltaReverse(context.delta[0]), 0, TEXT_DIFF]).exit();
};
reverseFilter.filterName = 'texts';

exports.diffFilter = diffFilter;
exports.patchFilter = patchFilter;
exports.reverseFilter = reverseFilter;

},{}],21:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var isArray = typeof Array.isArray === 'function' ?
// use native function
Array.isArray :
// use instanceof operator
function (a) {
  return a instanceof Array;
};

var diffFilter = function trivialMatchesDiffFilter(context) {
  if (context.left === context.right) {
    context.setResult(undefined).exit();
    return;
  }
  if (typeof context.left === 'undefined') {
    if (typeof context.right === 'function') {
      throw new Error('functions are not supported');
    }
    context.setResult([context.right]).exit();
    return;
  }
  if (typeof context.right === 'undefined') {
    context.setResult([context.left, 0, 0]).exit();
    return;
  }
  if (typeof context.left === 'function' || typeof context.right === 'function') {
    throw new Error('functions are not supported');
  }
  context.leftType = context.left === null ? 'null' : _typeof(context.left);
  context.rightType = context.right === null ? 'null' : _typeof(context.right);
  if (context.leftType !== context.rightType) {
    context.setResult([context.left, context.right]).exit();
    return;
  }
  if (context.leftType === 'boolean' || context.leftType === 'number') {
    context.setResult([context.left, context.right]).exit();
    return;
  }
  if (context.leftType === 'object') {
    context.leftIsArray = isArray(context.left);
  }
  if (context.rightType === 'object') {
    context.rightIsArray = isArray(context.right);
  }
  if (context.leftIsArray !== context.rightIsArray) {
    context.setResult([context.left, context.right]).exit();
    return;
  }
};
diffFilter.filterName = 'trivial';

var patchFilter = function trivialMatchesPatchFilter(context) {
  if (typeof context.delta === 'undefined') {
    context.setResult(context.left).exit();
    return;
  }
  context.nested = !isArray(context.delta);
  if (context.nested) {
    return;
  }
  if (context.delta.length === 1) {
    context.setResult(context.delta[0]).exit();
    return;
  }
  if (context.delta.length === 2) {
    context.setResult(context.delta[1]).exit();
    return;
  }
  if (context.delta.length === 3 && context.delta[2] === 0) {
    context.setResult(undefined).exit();
    return;
  }
};
patchFilter.filterName = 'trivial';

var reverseFilter = function trivialReferseFilter(context) {
  if (typeof context.delta === 'undefined') {
    context.setResult(context.delta).exit();
    return;
  }
  context.nested = !isArray(context.delta);
  if (context.nested) {
    return;
  }
  if (context.delta.length === 1) {
    context.setResult([context.delta[0], 0, 0]).exit();
    return;
  }
  if (context.delta.length === 2) {
    context.setResult([context.delta[1], context.delta[0]]).exit();
    return;
  }
  if (context.delta.length === 3 && context.delta[2] === 0) {
    context.setResult([context.delta[0]]).exit();
    return;
  }
};
reverseFilter.filterName = 'trivial';

exports.diffFilter = diffFilter;
exports.patchFilter = patchFilter;
exports.reverseFilter = reverseFilter;

},{}],22:[function(require,module,exports){
'use strict';

var environment = require('./environment');

var DiffPatcher = require('./diffpatcher').DiffPatcher;
exports.DiffPatcher = DiffPatcher;

exports.create = function (options) {
  return new DiffPatcher(options);
};

exports.dateReviver = require('./date-reviver');

var defaultInstance;

exports.diff = function () {
  if (!defaultInstance) {
    defaultInstance = new DiffPatcher();
  }
  return defaultInstance.diff.apply(defaultInstance, arguments);
};

exports.patch = function () {
  if (!defaultInstance) {
    defaultInstance = new DiffPatcher();
  }
  return defaultInstance.patch.apply(defaultInstance, arguments);
};

exports.unpatch = function () {
  if (!defaultInstance) {
    defaultInstance = new DiffPatcher();
  }
  return defaultInstance.unpatch.apply(defaultInstance, arguments);
};

exports.reverse = function () {
  if (!defaultInstance) {
    defaultInstance = new DiffPatcher();
  }
  return defaultInstance.reverse.apply(defaultInstance, arguments);
};

if (environment.isBrowser) {
  exports.homepage = '{{package-homepage}}';
  exports.version = '{{package-version}}';
} else {
  var packageInfoModuleName = '../package.json';
  var packageInfo = require(packageInfoModuleName);
  exports.homepage = packageInfo.homepage;
  exports.version = packageInfo.version;

  var formatterModuleName = './formatters';
  var formatters = require(formatterModuleName);
  exports.formatters = formatters;
  // shortcut for console
  exports.console = formatters.console;
}

},{"./date-reviver":13,"./diffpatcher":14,"./environment":15}],23:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Pipe = function Pipe(name) {
  this.name = name;
  this.filters = [];
};

Pipe.prototype.process = function (input) {
  if (!this.processor) {
    throw new Error('add this pipe to a processor before using it');
  }
  var debug = this.debug;
  var length = this.filters.length;
  var context = input;
  for (var index = 0; index < length; index++) {
    var filter = this.filters[index];
    if (debug) {
      this.log('filter: ' + filter.filterName);
    }
    filter(context);
    if ((typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object' && context.exiting) {
      context.exiting = false;
      break;
    }
  }
  if (!context.next && this.resultCheck) {
    this.resultCheck(context);
  }
};

Pipe.prototype.log = function (msg) {
  console.log('[jsondiffpatch] ' + this.name + ' pipe, ' + msg);
};

Pipe.prototype.append = function () {
  this.filters.push.apply(this.filters, arguments);
  return this;
};

Pipe.prototype.prepend = function () {
  this.filters.unshift.apply(this.filters, arguments);
  return this;
};

Pipe.prototype.indexOf = function (filterName) {
  if (!filterName) {
    throw new Error('a filter name is required');
  }
  for (var index = 0; index < this.filters.length; index++) {
    var filter = this.filters[index];
    if (filter.filterName === filterName) {
      return index;
    }
  }
  throw new Error('filter not found: ' + filterName);
};

Pipe.prototype.list = function () {
  var names = [];
  for (var index = 0; index < this.filters.length; index++) {
    var filter = this.filters[index];
    names.push(filter.filterName);
  }
  return names;
};

Pipe.prototype.after = function (filterName) {
  var index = this.indexOf(filterName);
  var params = Array.prototype.slice.call(arguments, 1);
  if (!params.length) {
    throw new Error('a filter is required');
  }
  params.unshift(index + 1, 0);
  Array.prototype.splice.apply(this.filters, params);
  return this;
};

Pipe.prototype.before = function (filterName) {
  var index = this.indexOf(filterName);
  var params = Array.prototype.slice.call(arguments, 1);
  if (!params.length) {
    throw new Error('a filter is required');
  }
  params.unshift(index, 0);
  Array.prototype.splice.apply(this.filters, params);
  return this;
};

Pipe.prototype.clear = function () {
  this.filters.length = 0;
  return this;
};

Pipe.prototype.shouldHaveResult = function (should) {
  if (should === false) {
    this.resultCheck = null;
    return;
  }
  if (this.resultCheck) {
    return;
  }
  var pipe = this;
  this.resultCheck = function (context) {
    if (!context.hasResult) {
      console.log(context);
      var error = new Error(pipe.name + ' failed');
      error.noResult = true;
      throw error;
    }
  };
  return this;
};

exports.Pipe = Pipe;

},{}],24:[function(require,module,exports){
'use strict';

var Processor = function Processor(options) {
  this.selfOptions = options || {};
  this.pipes = {};
};

Processor.prototype.options = function (options) {
  if (options) {
    this.selfOptions = options;
  }
  return this.selfOptions;
};

Processor.prototype.pipe = function (name, pipe) {
  if (typeof name === 'string') {
    if (typeof pipe === 'undefined') {
      return this.pipes[name];
    } else {
      this.pipes[name] = pipe;
    }
  }
  if (name && name.name) {
    pipe = name;
    if (pipe.processor === this) {
      return pipe;
    }
    this.pipes[pipe.name] = pipe;
  }
  pipe.processor = this;
  return pipe;
};

Processor.prototype.process = function (input, pipe) {
  var context = input;
  context.options = this.options();
  var nextPipe = pipe || input.pipe || 'default';
  var lastPipe, lastContext;
  while (nextPipe) {
    if (typeof context.nextAfterChildren !== 'undefined') {
      // children processed and coming back to parent
      context.next = context.nextAfterChildren;
      context.nextAfterChildren = null;
    }

    if (typeof nextPipe === 'string') {
      nextPipe = this.pipe(nextPipe);
    }
    nextPipe.process(context);
    lastContext = context;
    lastPipe = nextPipe;
    nextPipe = null;
    if (context) {
      if (context.next) {
        context = context.next;
        nextPipe = lastContext.nextPipe || context.pipe || lastPipe;
      }
    }
  }
  return context.hasResult ? context.result : undefined;
};

exports.Processor = Processor;

},{}],25:[function(require,module,exports){
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

},{"./skaryna":26,"pageobjectmodel/src/util":8}],26:[function(require,module,exports){
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

var _jsondiffpatch = require('jsondiffpatch');

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

var STYLES = '\n[data-skaryna], [data-skaryna] * { outline: none; }\n';

(function () {
    var style = document.createElement('style');
    style.innerText = STYLES;
    document.body.appendChild(style);
})();

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
         * @param {boolean} flushCache     if should clear cached version (used for diff)
         * @param {mixed}  value           new content
         */
        value: function report(doc, path, value, flushCache) {
            var docs = this.documents,
                cache = this.cache;

            if (path === undefined) {
                docs[doc] = value;
                cache[doc] = value.toJSON();
            } else {
                if (!docs.hasOwnProperty(doc)) {
                    docs[doc] = new _document.Fields();
                    cache[doc] = docs[doc].toJSON();
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

        /**
         * @property {object} cache hashmap
         */

    }, {
        key: 'cache',
        get: function get() {
            this._cache = this._cache || {};
            return this._cache;
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
                self.element.addEventListener('mouseup', self.onMouseDown.bind(self));
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
            (0, _fromHTML.fromHTML)(node).then(function (POM) {

                document.querySelector('#current-node').innerText = JSON.stringify(POM, null, 2);

                document.querySelector('#diff').innerHTML = JSON.stringify((0, _jsondiffpatch.diff)(JSON.parse(JSON.stringify(Repository.documents)), Repository.cache));
            });
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
        key: 'onMouseDown',
        value: function onMouseDown(event) {
            this.getCurrentElement(event.target);
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

},{"jsondiffpatch":22,"pageobjectmodel/src/document":1,"pageobjectmodel/src/emitter":2,"pageobjectmodel/src/parser/fromHTML":4,"pageobjectmodel/src/parser/fromPOM":5,"pageobjectmodel/src/serializer/toHTML":7}]},{},[25])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9wb20vc3JjL2RvY3VtZW50LmpzIiwiLi4vcG9tL3NyYy9lbWl0dGVyLmpzIiwiLi4vcG9tL3NyYy9wYXJzZXIuanMiLCIuLi9wb20vc3JjL3BhcnNlci9mcm9tSFRNTC5qcyIsIi4uL3BvbS9zcmMvcGFyc2VyL2Zyb21QT00uanMiLCIuLi9wb20vc3JjL3NlcmlhbGl6ZXIuanMiLCIuLi9wb20vc3JjL3NlcmlhbGl6ZXIvdG9IVE1MLmpzIiwiLi4vcG9tL3NyYy91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2NvbnRleHRzL2NvbnRleHQuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvY29udGV4dHMvZGlmZi5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9jb250ZXh0cy9wYXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9jb250ZXh0cy9yZXZlcnNlLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2RhdGUtcmV2aXZlci5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9kaWZmcGF0Y2hlci5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9lbnZpcm9ubWVudC5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9maWx0ZXJzL2FycmF5cy5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9maWx0ZXJzL2RhdGVzLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2ZpbHRlcnMvbGNzLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2ZpbHRlcnMvbmVzdGVkLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2ZpbHRlcnMvdGV4dHMuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvZmlsdGVycy90cml2aWFsLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvcGlwZS5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9wcm9jZXNzb3IuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvc2thcnluYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O1FDK0NnQixZLEdBQUEsWTtRQVVBLFMsR0FBQSxTO1FBbUJBLE8sR0FBQSxPO1FBSUEsUyxHQUFBLFM7UUFRQSxRLEdBQUEsUTs7QUEvRGhCOztBQUlBOztBQUtBOzs7Ozs7K2VBbENBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNDQSxJQUFJLGFBQWEsRUFBakI7O0FBR0E7Ozs7O0FBS08sU0FBUyxZQUFULENBQXNCLEdBQXRCLEVBQTJCO0FBQzlCLFdBQU8sT0FBTyxHQUFQLEVBQVksT0FBWixDQUFvQiw0QkFBcEIsRUFBa0QsTUFBbEQsQ0FBUDtBQUNIOztBQUVEOzs7Ozs7QUFNTyxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsTUFBekIsRUFBaUM7QUFDcEMsUUFBSSxTQUFTLElBQWI7QUFBQSxRQUNJLElBREo7O0FBR0EsU0FBSyxPQUFMLENBQWEsVUFBVSxJQUFWLEVBQWdCO0FBQ3pCLFlBQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxhQUFhLElBQWIsRUFBbUIsT0FBbkIsQ0FBMkIsT0FBM0IsRUFBb0MsTUFBcEMsQ0FBWCxDQUFiO0FBQUEsWUFDSSxTQUFTLEtBQUssS0FBTCxDQUFXLEdBQVgsRUFBZ0IsTUFBaEIsQ0FBdUIsVUFBVSxJQUFWLEVBQWdCO0FBQzVDLG1CQUFPLEtBQUssTUFBWjtBQUNILFNBRlEsRUFFTixNQUhQO0FBQUEsWUFJSSxRQUFRLE9BQU8sS0FBUCxDQUFhLE1BQWIsQ0FKWjs7QUFNQSxZQUFJLFVBQVUsV0FBVyxJQUFYLElBQW9CLE1B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SyxZQUFOLElBQXNCLENBQUMsS0FBSyxZQUFMLENBQWtCLGlCQUFsQixDQUFoQyxDQUFQLEVBQThFO0FBQzFFLHVCQUFPLEtBQUssVUFBWjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7O2dDQUlRLEssRUFBTztBQUFBOztBQUNYLGdCQUFJLFVBQVUsS0FBSyxpQkFBTCxDQUF1QixNQUFNLE1BQTdCLENBQWQ7QUFDQSxnQkFBSSxRQUFRLE9BQVIsQ0FBZ0IsTUFBTSxPQUF0QixNQUFtQyxDQUFDLENBQXhDLEVBQTJDO0FBQ3ZDLHNCQUFNLGVBQU47QUFDQSxzQkFBTSxjQUFOO0FBQ0E7QUFDSCxhQUpELE1BSU87QUFDSCwyQkFBVztBQUFBLDJCQUFNLE9BQUssY0FBTCxDQUFvQixPQUFwQixDQUFOO0FBQUEsaUJBQVgsRUFBK0MsQ0FBL0M7QUFDSDtBQUNKOzs7b0NBRVcsSyxFQUFPO0FBQ2YsaUJBQUssaUJBQUwsQ0FBdUIsTUFBTSxNQUE3QjtBQUNIOzs7MkNBRWtCLEssRUFBTztBQUN0QixnQkFBSSxNQUFNLElBQU4sQ0FBVyxHQUFYLEtBQW1CLEtBQUssT0FBTCxDQUFhLEdBQXBDLEVBQXlDO0FBQ3pDLGdCQUFJLE1BQU0sSUFBTixDQUFXLElBQVgsS0FBb0IsU0FBeEIsRUFBbUM7QUFDL0IscUJBQUssWUFBTDtBQUNIO0FBQ0o7Ozt1Q0FFYyxPLEVBQVM7QUFDcEIsZ0JBQUksT0FBTyxJQUFYO0FBQ0Esb0NBQVMsT0FBVCxFQUNLLElBREwsQ0FDVSxlQUFPO0FBQ1Qsb0JBQUksSUFBSixHQUFXLFFBQVEsWUFBUixDQUFxQixpQkFBckIsRUFBd0MsUUFBeEMsRUFBWDtBQUNBLDJCQUFXLE1BQVgsQ0FBa0IsS0FBSyxPQUFMLENBQWEsR0FBL0IsRUFBb0MsTUFBTSxJQUFJLElBQTlDLEVBQW9ELEdBQXBEO0FBQ0gsYUFKTDtBQUtIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBFbWl0dGVyXG59XG5mcm9tICcuL2VtaXR0ZXInO1xuaW1wb3J0IHtcbiAgICBjbG9uZSxcbiAgICBhcnJhaXplXG59XG5mcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtcbiAgICB0b0hUTUxcbn1cbmZyb20gJy4vc2VyaWFsaXplci90b0hUTUwnO1xuXG5sZXQgZWxlbWVudE1hcCA9IHt9O1xuXG5cbi8qKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vY29tcG9uZW50L2VzY2FwZS1yZWdleHBcbiAqIEBwYXJhbSAgIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVJlZ2V4cChzdHIpIHtcbiAgICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSgvKFsuKis/PV4hOiR7fSgpfFtcXF1cXC9cXFxcXSkvZywgJ1xcXFwkMScpO1xufVxuXG4vKipcbiAqIEBzZWUgQXBwXG4gKiBAcGFyYW0gICB7YXJyYXl9IGxpc3RcbiAqIEBwYXJhbSAgIHtzdHJpbmd9ICAgZmlsdGVyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVzdE1hdGNoKGxpc3QsIGZpbHRlcikge1xuICAgIHZhciBsb3dlc3QgPSBudWxsLFxuICAgICAgICBiZXN0O1xuXG4gICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ2V4cChydWxlKS5yZXBsYWNlKC9cXFxcXFwqL2csICcoLispJykpLFxuICAgICAgICAgICAgd2VpZ2h0ID0gcnVsZS5zcGxpdCgnKicpLmZpbHRlcihmdW5jdGlvbiAocGFydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0Lmxlbmd0aDtcbiAgICAgICAgICAgIH0pLmxlbmd0aCxcbiAgICAgICAgICAgIG1hdGNoID0gZmlsdGVyLm1hdGNoKHJlZ2V4cCk7XG5cbiAgICAgICAgaWYgKG1hdGNoICYmIChsb3dlc3QgPT09IG51bGwgfHwgKG1hdGNoLmxlbmd0aCAtIHdlaWdodCkgPCBsb3dlc3QpKSB7XG4gICAgICAgICAgICBsb3dlc3QgPSBtYXRjaC5sZW5ndGggLSB3ZWlnaHQ7XG4gICAgICAgICAgICBiZXN0ID0gcnVsZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBiZXN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnlJZChpZCkge1xuICAgIHJldHVybiBlbGVtZW50TWFwW2lkXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJ5Tm9kZShlbGVtZW50KSB7XG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgaWQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLWlkJyk7XG4gICAgcmV0dXJuIGdldEJ5SWQoaWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tSUQoc2V0VmFsdWUpIHtcbiAgICB2YXIgcG9zc2libGUgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JyxcbiAgICAgICAgdGV4dCA9ICcnO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgdGV4dCArPSBwb3NzaWJsZS5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKSk7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5rZXlzKGVsZW1lbnRNYXApLmluZGV4T2YodGV4dCkgPT09IC0xKSB7XG4gICAgICAgIGVsZW1lbnRNYXBbdGV4dF0gPSBlbGVtZW50TWFwW3RleHRdIHx8IHNldFZhbHVlO1xuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmRvbUlEKHNldFZhbHVlKTtcbn1cblxuLyoqXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGUgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RzIE5vZGVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpZCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMubmFtZSA9IGlkIHx8IHJhbmRvbUlEKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX19sb2NrZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXQgbG9ja2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2xvY2tlZDtcbiAgICB9XG5cbiAgICBsb2NrKCkge1xuICAgICAgICB0aGlzLl9fbG9ja2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhdHRyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRycztcbiAgICB9XG5cbiAgICBnZXQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU2hvdWxkIGJlIGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgc2V0KCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBiZSBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqIEB0aHJvd3Mge0Vycm9yfVxuICAgICAqL1xuICAgIHRvSlNPTigpIHtcbiAgICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCdTaG91bGQgYmUgaW1wbGVtZW50ZWQnKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgZ2V0IGRlZmF1bHROZXdJdGVtKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgYWxsb3dlZE5ld0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxufVxuXG4vKipcbiAqIEBjbGFzc1xuICogRGVmaW5lZCBmb3IgSW1hZ2UsIFZpZGVvLCBFbWJlZCwgVGFibGUsIEhvcml6b25hbFJ1bGUsIFRhYmxlLCBMaXN0IG9yIENvbXBvbmVudFxuICovXG5leHBvcnQgY2xhc3MgQmxvY2tOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBjb25zdHJ1Y3Rvcih0eXBlLCBpdGVtcywgYXR0cnMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcyB8fCBbXTtcbiAgICAgICAgdGhpcy5hdHRycyA9IGF0dHJzO1xuICAgIH1cblxuICAgIGdldChwYXRoKSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoaWxkID0gdGhpcy5pdGVtc1sraW5kZXhdO1xuXG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCAmJiBjaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkLmdldChyZXN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGlsZDtcblxuICAgIH1cblxuICAgIHNldEJ5SWQoaWQsIHZhbHVlKSB7XG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLml0ZW1zLmZvckVhY2goKGNoaWxkLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZvdW5kKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoY2hpbGQubmFtZSA9PT0gaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3VuZCA9IGNoaWxkLnNldEJ5SWQgPyBjaGlsZC5zZXRCeUlkKGlkLCB2YWx1ZSkgOiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG5cbiAgICBzZXQocGF0aCwgdmFsdWUpIHtcblxuICAgICAgICBpZiAocGF0aFswXSA9PT0gJ0AnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRCeUlkKHBhdGguc2xpY2UoMSksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCAmJiBjaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbK2luZGV4XS5zZXQocmVzdCwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoK2luZGV4LCAwLCB2YWx1ZSk7XG5cbiAgICB9XG5cbiAgICBnZXQgZW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aCA8PSAwO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcy5tYXAoKGl0ZW0pID0+IGl0ZW0udG9KU09OKCkpXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmF0dHJzKSB7XG4gICAgICAgICAgICBvdXRwdXQuYXR0cnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXR0cnMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGRlY29yYXRlKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRvSFRNTCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgZWRpdDogdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBhcnJhaXplKGh0bWwuY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRG9jdW1lbnQgZXh0ZW5kcyBCbG9ja05vZGUge1xuXG4gICAgY29uc3RydWN0b3IoaXRlbXMpIHtcbiAgICAgICAgc3VwZXIoJ2RvY3VtZW50JywgaXRlbXMpO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcmFncmFwaDtcbiAgICB9XG5cbiAgICBnZXQgYWxsb3dlZE5ld0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgUGFyYWdyYXBoLFxuICAgICAgICAgICAgSW1hZ2VcbiAgICAgICAgXTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFF1b3RlIGV4dGVuZHMgQmxvY2tOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihpdGVtcykge1xuICAgICAgICBzdXBlcigncXVvdGUnLCBpdGVtcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBjbGFzc1xuICogRGVmaW5lZCBmb3IgVGV4dCwgUGFyYWdyYXBoLCBMaXN0SXRlbSwgUXVvdGUgYW5kIEhlYWRpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIFRleHROb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICd0ZXh0JztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAndGV4dCc7XG4gICAgfVxuXG4gICAgZ2V0IGVtcHR5KCkge1xuICAgICAgICByZXR1cm4gIXRoaXMudGV4dCB8fCAhdGhpcy50ZXh0LnJlcGxhY2UoL14oW1xcc1xcblxcclxcdF0rKXwoW1xcc1xcblxcclxcdF0rKSQvLCAnJykubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldCBhYnNvbHV0ZUVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0Lmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICBhdHRyKCkge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuYXR0cigpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHRleHQsIGZvcm1hdHMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudGV4dCA9ICh0ZXh0ICYmIHRleHQudG9TdHJpbmcpID8gdGV4dC50b1N0cmluZygpIDogJyc7XG4gICAgICAgIHRoaXMuZm9ybWF0cyA9IGZvcm1hdHMgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5hdHRycyA9IGF0dHJzO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMudGV4dFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5mb3JtYXRzKSB7XG4gICAgICAgICAgICBvdXRwdXQuZm9ybWF0cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5mb3JtYXRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXR0cnMgJiYgdGhpcy50eXBlICE9PSAndGV4dCcpIHtcbiAgICAgICAgICAgIG91dHB1dC5hdHRycyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hdHRycykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgYXBwZW5kKG5vZGUpIHtcbiAgICAgICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIFRleHROb2RlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IHRleHQgbm9kZXMgY2FuIGJlIGpvaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmZvcm1hdHMpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0cyA9IHRoaXMuZm9ybWF0cyB8fCBbXTtcbiAgICAgICAgICAgIG5vZGUuZm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm1hdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNsaWNlOiBbZm9ybWF0LnNsaWNlWzBdICsgdGhpcy50ZXh0Lmxlbmd0aCwgZm9ybWF0LnNsaWNlWzFdXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwbHk6IGZvcm1hdC5hcHBseVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZXh0ICs9IG5vZGUudGV4dDtcbiAgICB9XG5cbiAgICBkZWNvcmF0ZShlbGVtZW50KSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIHRvSFRNTCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgZWRpdDogdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtaWQnLCBzZWxmLm5hbWUpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHROb2RlIHtcblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ3BhcmFncmFwaCc7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ3BhcmFncmFwaCc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IodGV4dCwgZm9ybWF0cywgYXR0cnMpIHtcbiAgICAgICAgc3VwZXIodGV4dCwgZm9ybWF0cywgYXR0cnMpO1xuICAgIH1cblxuICAgIGdldCBuZXh0Tm9kZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiBQYXJhZ3JhcGg7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2UgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSwgdGl0bGUsIGFsdCkge1xuICAgICAgICBzdXBlcignaW1hZ2UnKTtcbiAgICAgICAgdGhpcy5zcmMgPSBzb3VyY2U7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5hbHQgPSBhbHQ7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnaW1hZ2UnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgfVxuXG4gICAgYXR0cigpIHtcbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBzdXBlci5hdHRyKCkgfHwge307XG4gICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5zcmMgPSB0aGlzLnNyYztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aXRsZSkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy50aXRsZSA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWx0KSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzLmFsdCA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgICAgIHNyYzogdGhpcy5zcmNcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMudGl0bGUpIHtcbiAgICAgICAgICAgIG91dHB1dC50aXRsZSA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWx0KSB7XG4gICAgICAgICAgICBvdXRwdXQuYWx0ID0gdGhpcy5hbHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIZWFkaW5nIGV4dGVuZHMgVGV4dE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IobGV2ZWwsIHRleHQsIGZvcm1hdHMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKHRleHQsIGZvcm1hdHMsIGF0dHJzKTtcbiAgICAgICAgdGhpcy5sZXZlbCA9IE1hdGgubWluKDYsIGxldmVsIHx8IDEpO1xuICAgIH1cblxuICAgIGF0dHIoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5hdHRyKCk7XG4gICAgfVxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ2hlYWRpbmcnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdoZWFkaW5nJztcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBqc29uID0gc3VwZXIudG9KU09OKCk7XG4gICAgICAgIGpzb24ubGV2ZWwgPSB0aGlzLmxldmVsO1xuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNCbG9ja05vZGUgZXh0ZW5kcyBCbG9ja05vZGUge1xuICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcmFncmFwaDtcbiAgICB9XG5cbiAgICBnZXQgYWxsb3dlZE5ld0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgUGFyYWdyYXBoLFxuICAgICAgICAgICAgSW1hZ2VcbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGaWVsZHMgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fbWFwID0gZGF0YSB8fCB7fTtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdGaWVsZHMnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdGaWVsZHMnO1xuICAgIH1cblxuICAgIGdldChwYXRoKSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBjaGlsZCA9IHRoaXMuX21hcFtpbmRleF07XG5cbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoICYmIGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGQuZ2V0KHJlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuXG4gICAgfVxuXG4gICAgc2V0KHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBpZiAocmVzdC5sZW5ndGggJiYgY2hpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXBbaW5kZXhdLmdldChyZXN0LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tYXBbaW5kZXhdID0gdmFsdWU7XG5cbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiBjbG9uZShbXG4gICAgICAgICAgICB0aGlzLl9tYXAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0ZpZWxkcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmFyaWFudHMgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fdmFyaWFudHMgPSBkYXRhO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ1ZhcmlhbnRzJztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnVmFyaWFudHMnO1xuICAgIH1cblxuXG4gICAgYmVzdCh2YXJpYW50KSB7XG4gICAgICAgIGxldCBiZXN0ID0gYmVzdE1hdGNoKE9iamVjdC5rZXlzKHRoaXMuX3ZhcmlhbnRzKSwgdmFyaWFudCk7XG4gICAgICAgIHJldHVybiB0aGlzLl92YXJpYW50c1tiZXN0XTtcblxuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIGNsb25lKFtcbiAgICAgICAgICAgIHRoaXMuX21hcCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnVmFyaWFudHMnXG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH1cbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuLyoqXG4gKiBAbmFtZXNwYWNlIHNrYXJ5bmFcbiAqXG4gKiBAY2xhc3MgRXZlbnRDb25maWdcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IGZuIGxpc3RlbmVyXG4gKiBAcHJvcGVydHkge29iamVjdH0gY29udGV4dFxuICogQHByb3BlcnR5IHthcnJheX0gYXJncyBhcmd1bWVudHMgdG8gYmUgcGFzc2VkXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9uY2UgaWYgc2hvdWxkIGJlIGZpcmVkIG9ubHkgb25jZVxuICovXG5cbi8qKlxuICogQGNsYXNzIEV2ZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudCB7XG4gICAgLyoqXG4gICAgICogQ29udHJ1Y3RvclxuICAgICAqIEBjb25zdHJ1Y3RzIEV2ZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge21peGVkfSBkYXRhXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNvdXJjZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IHBhcmVudFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGRhdGEsIHNvdXJjZSwgcGFyZW50KSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtzdHJpbmd9XG4gICAgICAgICAgICAgKiBAbmFtZSBFdmVudCNuYW1lXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogbmFtZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSB7bWl4ZWR9XG4gICAgICAgICAgICAgKiBAbmFtZSBFdmVudCNkYXRhXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogZGF0YSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSB7b2JqZWN0fVxuICAgICAgICAgICAgICogQG5hbWUgRXZlbnQjc291cmNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNvdXJjZToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBzb3VyY2UsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge0V2ZW50fG51bGx9XG4gICAgICAgICAgICAgKiBAbmFtZSBFdmVudCNwYXJlbnRcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcGFyZW50OiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHBhcmVudCxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdFdmVudDogJyArIEpTT04uc3RyaW5naWZ5KHRoaXMudG9KU09OKCkpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBbW0Rlc2NyaXB0aW9uXV1cbiAqIEBwYXJhbSB7RXZlbnR9IGNvZm5pZ1xuICogQHBhcmFtIHtFdmVudENvbmZpZ30gdGhpc09iamVjdFxuICovXG5mdW5jdGlvbiBleGVjdXRlKGV2ZW50LCBjb25maWcpIHtcbiAgICBsZXQge1xuICAgICAgICBmbiwgY29udGV4dCwgYXJnc1xuICAgIH0gPSBjb25maWcsXG4gICAgcGFyYW1zID0gW2V2ZW50XS5jb25jYXQoYXJncyk7XG5cbiAgICBmbi5hcHBseShjb250ZXh0IHx8IG51bGwsIHBhcmFtcyk7XG59XG5cbi8qKlxuICogQWRkcyBsaXN0ZW5lciBmb3IgYW4gZXZlbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0XG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9uY2VcbiAqL1xuZnVuY3Rpb24gb24oZXZlbnROYW1lLCBoYW5kbGVyLCBjb250ZXh0LCBhcmdzLCBvbmNlKSB7XG4gICAgdGhpcy5fX2xpc3RlbmVycyA9IHRoaXMuX19saXN0ZW5lcnMgfHwge307XG4gICAgdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdID0gdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdO1xuICAgIHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXS5wdXNoKHtcbiAgICAgICAgZm46IGhhbmRsZXIsXG4gICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgIG9uY2U6ICEhb25jZVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEFkZHMgbGlzdGVuZXIgZm9yIGFuIGV2ZW50IHRoYXQgc2hvdWxkIGJlIGNhbGxlZCBvbmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuICogQHBhcmFtIHthcnJheX0gYXJnc1xuICovXG5mdW5jdGlvbiBvbmNlKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncykge1xuICAgIHRoaXMub24oZXZlbnROYW1lLCBoYW5kbGVyLCBjb250ZXh0LCBhcmdzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBBZGRzIGxpc3RlbmVyIGZvciBhbiBldmVudFxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gaGFuZGxlclxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3NcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb25jZVxuICovXG5mdW5jdGlvbiBvZmYoZXZlbnROYW1lLCBoYW5kbGVyLCBjb250ZXh0LCBhcmdzLCBvbmNlKSB7XG4gICAgaWYgKCF0aGlzLl9fbGlzdGVuZXJzIHx8ICF0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzXG4gICAgICAgIC5nZXRMaXN0ZW5lcnMoZXZlbnROYW1lLCBoYW5kbGVyLCBjb250ZXh0LCBhcmdzLCBvbmNlKVxuICAgICAgICAuZm9yRWFjaCgoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0uc3BsaWNlKHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXS5pbmRleE9mKGNvbmZpZyksIDEpO1xuICAgICAgICB9KTtcblxufVxuXG4vKipcbiAqIEVtaXRzIGFuIGV2ZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge21peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0V2ZW50fG51bGx9IHBhcmVudFxuICovXG5mdW5jdGlvbiBlbWl0KGV2ZW50TmFtZSwgZGF0YSwgcGFyZW50KSB7XG4gICAgaWYgKCF0aGlzLl9fbGlzdGVuZXJzIHx8ICF0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzZWxmID0gdGhpcyxcbiAgICAgICAgZXZlbnQgPSBuZXcgRXZlbnQoZXZlbnROYW1lLCBkYXRhLCB0aGlzLCBwYXJlbnQpO1xuXG4gICAgdGhpc1xuICAgICAgICAuZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSlcbiAgICAgICAgLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5vbmNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vZmYoZXZlbnROYW1lLCBjb25maWcuZm4sIGNvbmZpZy5jb250ZXh0LCBjb25maWcuYXJncywgY29uZmlnLm9uY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhlY3V0ZShldmVudCwgY29uZmlnKTtcbiAgICAgICAgfSk7XG59XG5cbi8qKlxuICogQnViYmxlcyBldmVudCB0byBvdGhlciBlbWl0dGVyXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gdG9FbWl0dGVyXG4gKi9cbmZ1bmN0aW9uIGJ1YmJsZUV2ZW50KGV2ZW50TmFtZSwgdG9FbWl0dGVyKSB7XG4gICAgdGhpcy5vbihldmVudE5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICB0b0VtaXR0ZXIuZW1pdChldmVudE5hbWUsIGV2ZW50LmRhdGEsIGV2ZW50KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBHZXRzIGFsbCBsaXN0ZW5lcnMgdGhhdCBtYXRjaCBjcml0ZXJpYVxuICogQHBhcmFtICAge3N0cmluZ30gZXZlbnROYW1lIHJlcXVpcmVkXG4gKiBAcGFyYW0gICB7ZnVuY3Rpb259IGhhbmRsZXIgICBpZiBkZWZpbmVkIHdpbGwgYmUgdXNlZCBmb3IgbWF0Y2hcbiAqIEBwYXJhbSAgIHtvYmplY3R9IGNvbnRleHQgICBpZiBkZWZpbmVkIHdpbGwgYmUgdXNlZCBmb3IgbWF0Y2hcbiAqIEBwYXJhbSAgIHthcnJheX0gYXJncyAgICAgIGlmIGRlZmluZWQgd2lsbCBiZSB1c2VkIGZvciBtYXRjaFxuICogQHJldHVybnMge2FycmF5PEV2ZW50Q29uZmlnPnxudWxsfVxuICovXG5mdW5jdGlvbiBnZXRMaXN0ZW5lcnMoZXZlbnROYW1lLCBoYW5kbGVyLCBjb250ZXh0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl9fbGlzdGVuZXJzIHx8ICF0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXVxuICAgICAgICAubWFwKChjb25maWcpID0+IHtcbiAgICAgICAgICAgIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQgJiYgY29uZmlnLmZuICE9PSBoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbnRleHQgIT09IHVuZGVmaW5lZCAmJiBjb25maWcuY29udGV4dCAhPT0gY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmdzICE9PSB1bmRlZmluZWQgJiYgY29uZmlnLmFyZ3MgIT09IGFyZ3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICB9KVxuICAgICAgICAuZmlsdGVyKChyZXN1bHQpID0+ICEhcmVzdWx0KTtcbn1cblxuLypcbiAqIEBjbGFzcyBFbWl0dGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBFbWl0dGVyIHtcblxuICAgIHN0YXRpYyBvbigpIHtcbiAgICAgICAgb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBvbigpIHtcbiAgICAgICAgb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgb25jZSgpIHtcbiAgICAgICAgb25jZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIG9uY2UoKSB7XG4gICAgICAgIG9uY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgb2ZmKCkge1xuICAgICAgICBvZmYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBvZmYoKSB7XG4gICAgICAgIG9mZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBlbWl0KCkge1xuICAgICAgICBlbWl0LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBlbWl0KCkge1xuICAgICAgICBlbWl0LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYnViYmxlRXZlbnQoKSB7XG4gICAgICAgIGJ1YmJsZUV2ZW50LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBidWJibGVFdmVudCgpIHtcbiAgICAgICAgYnViYmxlRXZlbnQuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHJldHVybiBnZXRMaXN0ZW5lcnMuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGdldExpc3RlbmVycygpIHtcbiAgICAgICAgcmV0dXJuIGdldExpc3RlbmVycy5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfVxufVxuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5jbGFzcyBQYXJzZXIge1xuXG4gICAgcGFyc2UoZm9ybWF0LCB0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ01vZGVsIGlzIGVtcHR5JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlKGZvcm1hdCwgdG9rZW4sIGRhdGEsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIG9uKGZvcm1hdCwgdG9rZW4sIGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlcnMgPSB0aGlzLl9oYW5kbGVycyB8fCB7fTtcbiAgICAgICAgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSA9IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gfHwge307XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bdG9rZW5dID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBoYW5kbGUoZm9ybWF0LCB0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuXG4gICAgICAgIGxldCBoYW5kbGVyID0gKHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVt0b2tlbl0pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVt0b2tlbl0gOiBudWxsO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSAodGhpcy5faGFuZGxlcnMgJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdWycqJ10pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVsnKiddIDogbnVsbDtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vIGhhbmRsZXIgZGVmaW5lZCBmb3IgJyArIGZvcm1hdCArICcgOiAnICsgdG9rZW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHRva2VuLCBkYXRhLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKFBPTSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQT007XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKCk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyogZ2xvYmFscyBkb2N1bWVudCAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgcGFyc2VyXG59XG5mcm9tICcuLy4uL3BhcnNlcic7XG5pbXBvcnQge1xuICAgIGFycmFpemUsXG4gICAgY2xvbmVcbn1cbmZyb20gJy4vLi4vdXRpbCc7XG5pbXBvcnQge1xuICAgIERvY3VtZW50LFxuICAgIFRleHROb2RlLFxuICAgIEJsb2NrTm9kZSxcbiAgICBQYXJhZ3JhcGgsXG4gICAgSGVhZGluZyxcbiAgICBJbWFnZSxcbiAgICBRdW90ZSxcbiAgICBTdGF0aWNCbG9ja05vZGVcbn1cbmZyb20gJy4vLi4vZG9jdW1lbnQnO1xuXG5mdW5jdGlvbiB3aGF0V3JhcHBlcihyb290Tm9kZSkge1xuICAgIHN3aXRjaCAocm9vdE5vZGUpIHtcbiAgICBjYXNlICd0ZCc6XG4gICAgY2FzZSAndGgnOlxuICAgICAgICByZXR1cm4gJ3RyJztcbiAgICBjYXNlICd0cic6XG4gICAgICAgIHJldHVybiAndGFibGUnO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnZGl2JztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVkaXRNb2RlKG5vZGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVkaXQpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcsIG5vZGUubmFtZSk7XG4gICAgICAgIG5vZGUuX19lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDaGlsZHJlbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50LmNoaWxkTm9kZXMpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgIC5hbGwoYXJyYWl6ZShlbGVtZW50LmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAubWFwKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSB8fCBjaGlsZC5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnJvbUhUTUwoY2hpbGQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29uc3RydWN0b3IgPT09IFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFpdGVtLmFic29sdXRlRW1wdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaXRlbSAhPT0gbnVsbDtcbiAgICAgICAgfSkpO1xufVxuXG4vKipcbiAqIFBhcnNlIFBPTSBKU09OIHJlcHJlc2VudGF0aW9uXG4gKiBAcGFyYW0gICB7c3RyaW5nfEhUTUxFbGVtZW50fSAgIG1vZGVsXG4gKiBAcGFyYW0gICB7b3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8Tm9kZT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tSFRNTChpbnB1dCwgb3B0aW9ucykge1xuXG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHdoYXRXcmFwcGVyKGlucHV0LnJlcGxhY2UoJy9eKFxccyopPChbYS16QS1aMC05Xy1dKyknLCAnJDInKS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaW5wdXQ7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4od3JhcHBlciwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChjaGlsZHJlbikgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5bMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChpdGVtKSA9PiAhKGl0ZW0gaW5zdGFuY2VvZiBUZXh0Tm9kZSB8fCBpdGVtIGluc3RhbmNlb2YgSW5saW5lTm9kZSkpXG4gICAgICAgICAgICAgICAgICAgIC5sZW5ndGhcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLm1hcCgoaXRlbSkgPT4gaXRlbSBpbnN0YW5jZW9mIEJsb2NrTm9kZSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50KGNoaWxkcmVuLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBhcmFncmFwaChpdGVtLnRleHQsIGl0ZW0uZm9ybWF0cywgaXRlbS5hdHRycywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnQoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaXRlbXMgPSBjaGlsZHJlbi5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgSW5saW5lTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbdGV4dCwgZm9ybWF0c10gPSBzdHJpbmdpZnkoW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRleHROb2RlKHRleHQsIGZvcm1hdHMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gaXRlbXMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0LmFwcGVuZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3Q7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZSgnaHRtbCcsIGlucHV0Lm5vZGVUeXBlID09PSAzID8gJ3RleHQnIDogaW5wdXQubm9kZU5hbWUsIGlucHV0KTtcbn1cblxuY2xhc3MgSW5saW5lTm9kZSBleHRlbmRzIEJsb2NrTm9kZSB7XG5cbn1cblxuZnVuY3Rpb24gZm9ybWF0VHlwZShpdGVtLCB0ZXh0KSB7XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gJ0EnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnQScsXG4gICAgICAgICAgICB0aXRsZTogaXRlbS5hdHRycy50aXRsZSB8fCB0ZXh0LFxuICAgICAgICAgICAgaHJlZjogaXRlbS5hdHRycy5ocmVmXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBpdGVtLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShpdGVtcykge1xuICAgIGxldCB0ZXh0ID0gJycsXG4gICAgICAgIGZvcm1hdHMgPSBbXSxcbiAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIElubGluZU5vZGUpIHtcbiAgICAgICAgICAgIGxldCBbaW5uZXJUZXh0LCBpbm5lckZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW0uaXRlbXMpLFxuICAgICAgICAgICAgICAgIGZvcm1hdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpY2U6IFtpbmRleCwgaW5uZXJUZXh0Lmxlbmd0aF0sXG4gICAgICAgICAgICAgICAgICAgIGFwcGx5OiBbZm9ybWF0VHlwZShpdGVtLCBpbm5lclRleHQpXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3JtYXRzLnB1c2goZm9ybWF0KTtcbiAgICAgICAgICAgIGlubmVyRm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgICBmb3JtYXRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzbGljZTogW2luZGV4ICsgZm9ybWF0LnNsaWNlWzBdLCBmb3JtYXQuc2xpY2VbMV1dLFxuICAgICAgICAgICAgICAgICAgICBhcHBseTogZm9ybWF0LmFwcGx5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICAgICAgZm9ybWF0cy5mb3JFYWNoKChvdGhlckZvcm1hdCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JtYXQgIT09IG90aGVyRm9ybWF0ICYmIGZvcm1hdC5zbGljZVswXSA9PT0gb3RoZXJGb3JtYXQuc2xpY2VbMF0gJiYgZm9ybWF0LnNsaWNlWzFdID09PSBvdGhlckZvcm1hdC5zbGljZVsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0LmFwcGx5ID0gZm9ybWF0LmFwcGx5LmNvbmNhdChvdGhlckZvcm1hdC5hcHBseSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXRzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRleHQgKz0gaW5uZXJUZXh0O1xuICAgICAgICAgICAgaW5kZXggKz0gaW5uZXJUZXh0Lmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgVGV4dE5vZGUpIHtcbiAgICAgICAgICAgIHRleHQgKz0gaXRlbS50ZXh0O1xuICAgICAgICAgICAgaW5kZXggKz0gaXRlbS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW3RleHQsIGZvcm1hdHNdO1xufVxuXG5mdW5jdGlvbiBoZWFkaW5nKHRva2VuLCBkYXRhLCBvcHRpb25zKSB7XG5cbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgbGV0IFt0ZXh0LCBmb3JtYXRzXSA9IHN0cmluZ2lmeShpdGVtcyk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBIZWFkaW5nKHRva2VuWzFdLnRvTG93ZXJDYXNlKCksIHRleHQgfHwgJycsIGZvcm1hdHMubGVuZ3RoID8gZm9ybWF0cyA6IG51bGwsIG9wdGlvbnMpKTtcbiAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcmFncmFwaCh0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsKSk7XG4gICAgICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVzKGlucHV0KSB7XG4gICAgbGV0IG91dHB1dCA9IG51bGw7XG4gICAgYXJyYWl6ZShpbnB1dClcbiAgICAgICAgLmZvckVhY2goKGF0dHJpYnV0ZSkgPT4ge1xuICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0IHx8IHt9O1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZS52YWx1ZSAmJiBhdHRyaWJ1dGUudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcblxufVxuXG5mdW5jdGlvbiBpZkF0dHIodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHF1b3RlKHRva2VuLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHByb2Nlc3NDaGlsZHJlbihkYXRhLCBvcHRpb25zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcblxuICAgICAgICAgICAgbGV0IHBhcmFncmFwaHMgPSBbXSxcbiAgICAgICAgICAgICAgICBsYXN0UGFyYWdyYXBoID0gW107XG4gICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBQYXJhZ3JhcGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RQYXJhZ3JhcGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsLCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFBhcmFncmFwaCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUoaXRlbSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RQYXJhZ3JhcGgucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChsYXN0UGFyYWdyYXBoLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxldCBbdGV4dCwgZm9ybWF0c10gPSBzdHJpbmdpZnkoaXRlbXMpO1xuICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsLCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFyYWdyYXBocyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgUXVvdGUoaXRlbXMpKTtcbiAgICAgICAgfSk7XG59XG5cbnBhcnNlci5vbignaHRtbCcsICd0ZXh0JywgKHRva2VuLCBkYXRhLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgVGV4dE5vZGUoZGF0YS50ZXh0Q29udGVudCwgbnVsbCwgb3B0aW9ucykpO1xufSk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDEnLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdIMicsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ0gzJywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDQnLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdINScsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ0g2JywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnUCcsIHBhcmFncmFwaCk7XG5wYXJzZXIub24oJ2h0bWwnLCAnQkxPQ0tRVU9URScsIHF1b3RlKTtcblxucGFyc2VyLm9uKCdodG1sJywgJ0lNRycsICh0b2tlbiwgZGF0YSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEltYWdlKGRhdGEuc3JjLCBpZkF0dHIoZGF0YS5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykpLCBpZkF0dHIoZGF0YS5nZXRBdHRyaWJ1dGUoJ2FsdCcpKSwgY2xvbmUoW2F0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKV0sIFsnc3JjJywgJ3RpdGxlJywgJ2FsdCddKSksIG9wdGlvbnMpO1xufSk7XG5cblsnQUREUkVTUycsICdBUlRJQ0xFJywgJ0FTSURFJywgJ0RJVicsICdGSUdVUkUnLCAnRk9PVEVSJywgJ0hFQURFUicsICdNQUlOJywgJ05BVicsICdTRUNUSU9OJ10uZm9yRWFjaCgobm9kZU5hbWUpID0+IHtcbiAgICBwYXJzZXIub24oJ2h0bWwnLCBub2RlTmFtZSwgKHRva2VuLCBkYXRhLCBvcHRpb25zKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFN0YXRpY0Jsb2NrTm9kZSh0b2tlbiwgaXRlbXMsIGF0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKSksIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxucGFyc2VyLm9uKCdodG1sJywgJyonLCAodG9rZW4sIGRhdGEsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSW5saW5lTm9kZSh0b2tlbiwgaXRlbXMsIGF0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKSksIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbn0pO1xuLypcbnBhcnNlci5vbignaHRtbCcsICcjdGV4dCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFRleHROb2RlKGRhdGEudGV4dENvbnRlbnQpKTtcbn0pO1xuXG5bXG4gICAgWydiJywgJ3N0cm9uZyddLFxuICAgIFsnYmlnJywgJ3N0cm9uZyddLFxuICAgIFsnaScsICdlbSddLFxuICAgICdzbWFsbCcsXG4gICAgWyd0dCcsICdjb2RlJ10sXG4gICAgWydhYmJyJywgJ3NlbWFudGljJywgJ2FiYnInXSxcbiAgICBbJ2Fjcm9ueW0nLCAnYWJicicsICdhYmJyJ10sXG4gICAgWydjaXRlJywgJ3NlbWFudGljJywgJ2NpdGUnXSxcbiAgICAnY29kZScsXG4gICAgWydkZm4nLCAnc2VtYW50aWMnLCAnZGVmaW5pdGlvbiddLFxuICAgICdlbScsXG4gICAgWyd0aW1lJywgJ3NlbWFudGljJywgJ3RpbWUnXSxcbiAgICBbJ3ZhcicsICdjb2RlJywgJ3ZhciddLFxuICAgIFsna2JkJywgJ2NvZGUnLCAna2JkJ10sXG4gICAgJ3N0cm9uZycsXG4gICAgWydzYW1wJywgJ2NvZGUnLCAnc2FtcGxlJ10sXG4gICAgJ2JkbycsXG4gICAgJ2EnLFxuICAgIC8vJ2JyJyxcbiAgICAvLydpbWcsXG4gICAgLy8nbWFwJyxcbiAgICAvLydvYmplY3QnLFxuICAgIFsncScsICdzZW1hbnRpYycsICdxdW90YXRpb24nXSxcbiAgICAvL3NjcmlwdFxuICAgICdzcGFuJyxcbiAgICBkZWwsXG4gICAgc1xuICAgICdzdWInLFxuICAgICdzdXAnLFxuICAgIC8vYnV0dG9uXG4gICAgLy9pbnB1dFxuICAgIC8vbGFiZWxcbiAgICAvL3NlbGVjdFxuICAgIC8vdGV4dGFyZWFcbl0uZm9yRWFjaCgoaW5saW5lUnVsZSkgPT4ge1xuXG4gICAgbGV0IGlucHV0ID0gdHlwZW9mIGlubGluZVJ1bGUgPT09ICdzdHJpbmcnID8gaW5saW5lUnVsZSA6IGlubGluZVJ1bGVbMF07XG5cbiAgICBwYXJzZXIub24oJ2h0bWwnLCBpbnB1dCwgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSlcbiAgICAgICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuXG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxufSk7XG4qL1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIHBhcnNlclxufVxuZnJvbSAnLi8uLi9wYXJzZXInO1xuXG5pbXBvcnQge1xuICAgIFRleHROb2RlLFxuICAgIERvY3VtZW50LFxuICAgIEhlYWRpbmcsXG4gICAgUGFyYWdyYXBoLFxuICAgIEltYWdlLFxuICAgIEZpZWxkcyxcbiAgICBWYXJpYW50c1xufVxuZnJvbSAnLi8uLi9kb2N1bWVudCc7XG5cbi8qKlxuICogUGFyc2UgUE9NIEpTT04gcmVwcmVzZW50YXRpb25cbiAqIEBwYXJhbSAgIHtvYmplY3R9ICAgbW9kZWxcbiAqIEBwYXJhbSAgIHtvcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxOb2RlPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21QT00obW9kZWwpIHtcbiAgICBpZiAoIW1vZGVsKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZXIucGFyc2UoJ3BvbScsIG1vZGVsLnR5cGUsIG1vZGVsKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NoaWxkTm9kZXMoaXRlbXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tUE9NKGl0ZW0pO1xuICAgIH0pKS50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtKSA9PiAhIWl0ZW0pO1xuICAgIH0pO1xufVxuXG5wYXJzZXIub24oJ3BvbScsICdkb2N1bWVudCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBwcm9jZXNzQ2hpbGROb2RlcyhkYXRhLml0ZW1zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnQoaXRlbXMpO1xuICAgICAgICB9KTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdoZWFkaW5nJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSGVhZGluZyhkYXRhLmxldmVsLCBkYXRhLnRleHQsIGRhdGEuZm9ybWF0cywgZGF0YS5hdHRycykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ3BhcmFncmFwaCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaChkYXRhLnRleHQsIGRhdGEuZm9ybWF0cywgZGF0YS5hdHRycykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ3RleHQnLCAodG9rZW4sIGRhdGEpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBUZXh0Tm9kZShkYXRhLnRleHQsIGRhdGEuZm9ybWF0cykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ2ltYWdlJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSW1hZ2UoZGF0YS5zcmMsIGRhdGEudGl0bGUsIGRhdGEuYWx0KSk7XG59KTtcblxucGFyc2VyLm9uKCdwb20nLCAnRmllbGRzJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgbGV0IGZpZWxkcyA9IHt9O1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGRhdGEpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ3R5cGUnKVxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21QT00oZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoUE9NKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHNba2V5XSA9IFBPTTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgRmllbGRzKGZpZWxkcykpO1xuICAgICAgICB9KTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdWYXJpYW50cycsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIGxldCB2YXJpYW50cyA9IHt9O1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGRhdGEpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ3R5cGUnKVxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21QT00oZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoUE9NKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50c1trZXldID0gUE9NO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBWYXJpYW50cyh2YXJpYW50cykpO1xuICAgICAgICB9KTtcbn0pO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5jbGFzcyBTZXJpYWxpemVyIHtcblxuICAgIHNlcmlhbGl6ZShmb3JtYXQsIG5vZGUsIG9wdGlvbnMpIHtcblxuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ01vZGVsIGlzIGVtcHR5JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFub2RlLnR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1VuZGVmaW5lZCBub2RlIHR5cGUnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGUoZm9ybWF0LCBub2RlLnR5cGUsIG5vZGUsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIG9uKGZvcm1hdCwgbm9kZVR5cGUsIGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlcnMgPSB0aGlzLl9oYW5kbGVycyB8fCB7fTtcbiAgICAgICAgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSA9IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gfHwge307XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bbm9kZVR5cGVdID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBoYW5kbGUoZm9ybWF0LCBub2RlVHlwZSwgbm9kZSwgb3B0aW9ucykge1xuXG4gICAgICAgIGxldCBoYW5kbGVyID0gKHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVtub2RlVHlwZV0pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVtub2RlVHlwZV0gOiBudWxsO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSAodGhpcy5faGFuZGxlcnMgJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdWycqJ10pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVsnKiddIDogbnVsbDtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vIGhhbmRsZXIgZGVmaW5lZCBmb3IgJyArIGZvcm1hdCArICcgOiAnICsgbm9kZVR5cGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFuZGxlcihub2RlLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKGh0bWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZUNvbnRlbnRzKGZvcm1hdCwgYXJyYXksIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgICAgLmFsbChhcnJheS5tYXAoKGNvbnRlbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5zZXJpYWxpemUoJ2h0bWwnLCBjb250ZW50LCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pKTtcblxuICAgIH1cbn1cblxuZXhwb3J0IHZhciBzZXJpYWxpemVyID0gbmV3IFNlcmlhbGl6ZXIoKTtcbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKiBnbG9iYWxzIGRvY3VtZW50ICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBzZXJpYWxpemVyXG59XG5mcm9tICcuLy4uL3NlcmlhbGl6ZXInO1xuXG5pbXBvcnQge1xuICAgIFRleHROb2RlXG59XG5mcm9tICcuLy4uL2RvY3VtZW50JztcbmltcG9ydCB7XG4gICAgYXJyYWl6ZVxufVxuZnJvbSAnLi8uLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvSFRNTChtb2RlbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBzZXJpYWxpemVyLnNlcmlhbGl6ZSgnaHRtbCcsIG1vZGVsLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gb3RoZXJBdHRycyhvYmplY3QsIGV4Y2VwdCkge1xuICAgIGxldCByZXN1bHQgPSB7fTtcbiAgICBPYmplY3RcbiAgICAgICAgLmtleXMob2JqZWN0KVxuICAgICAgICAuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBleGNlcHQuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XTtcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0KHN0cmluZywgZm9ybWF0cykge1xuICAgIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpLFxuICAgICAgICBzbGljZXMgPSBzdHJpbmcuc3BsaXQoJycpLm1hcCgoY2hhcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjaGFyOiBjaGFyLFxuICAgICAgICAgICAgICAgIGFwcGx5OiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICBzbGljZXMucHVzaCh7XG4gICAgICAgIGNoYXI6ICcnLFxuICAgICAgICBhcHBseTogW11cbiAgICB9KTtcblxuICAgIGZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgICAgIGxldCBmcm9tID0gZm9ybWF0LnNsaWNlWzBdLFxuICAgICAgICAgICAgdG8gPSBmcm9tICsgZm9ybWF0LnNsaWNlWzFdO1xuXG4gICAgICAgIGZvcm1hdC5hcHBseS5mb3JFYWNoKChhcHBseSkgPT4ge1xuICAgICAgICAgICAgaWYgKHNsaWNlc1tmcm9tXS5hcHBseS5pbmRleE9mKGFwcGx5KSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIHNsaWNlc1tmcm9tXS5hcHBseS5wdXNoKGFwcGx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzbGljZXNbdG9dLmFwcGx5LmluZGV4T2YoJy8nICsgYXBwbHkpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgc2xpY2VzW3RvXS5hcHBseS5wdXNoKCcvJyArIGFwcGx5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgd3JhcHBlci5pbm5lckhUTUwgPSBzbGljZXMubWFwKChjaGFyKSA9PiB7XG4gICAgICAgIHJldHVybiBjaGFyLmFwcGx5Lm1hcCgodGFnKSA9PiAnPCcgKyB0YWcgKyAnPicpLmpvaW4oJycpICsgY2hhci5jaGFyO1xuICAgIH0pLmpvaW4oJycpO1xuICAgIHJldHVybiBhcnJhaXplKHdyYXBwZXIuY2hpbGROb2Rlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbGVtZW50KG5vZGUsIG5vZGVUeXBlLCBhdHRyaWJ1dGVzLCBjb250ZW50LCBvcHRpb25zKSB7XG5cbiAgICBsZXQgcHJvbWlzZTtcblxuICAgIGlmIChjb250ZW50KSB7XG5cbiAgICAgICAgcHJvbWlzZSA9IHNlcmlhbGl6ZXIuaGFuZGxlQ29udGVudHMoJ2h0bWwnLCBjb250ZW50IHx8IFtdLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlLnRoZW4oKGNvbnRlbnQpID0+IHtcblxuICAgICAgICBpZiAobm9kZS5mb3JtYXRzICYmIG5vZGUuZm9ybWF0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBmb3JtYXQoY29udGVudFswXS5ub2RlVmFsdWUsIG5vZGUuZm9ybWF0cyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZVR5cGUpO1xuICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVkaXQpIHtcbiAgICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtaWQnLCBub2RlLm5hbWUpO1xuICAgICAgICAgICAgaWYobm9kZSBpbnN0YW5jZW9mIFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScsJ3RydWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cmlidXRlcykge1xuICAgICAgICAgICAgT2JqZWN0XG4gICAgICAgICAgICAgICAgLmtleXMoYXR0cmlidXRlcylcbiAgICAgICAgICAgICAgICAuZm9yRWFjaCgoYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb250ZW50KSkge1xuICAgICAgICAgICAgY29udGVudC5mb3JFYWNoKChjaGlsZCkgPT4gZWxlbS5hcHBlbmRDaGlsZChjaGlsZCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtO1xuICAgIH0pO1xufVxuXG5jbGFzcyBGYWtlRG9jIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgfVxuXG4gICAgYXBwZW5kQ2hpbGQoY2hpbGQpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICB9XG5cbiAgICBnZXQgb3V0ZXJIVE1MKCkge1xuICAgICAgICBsZXQgc3RyID0gJyc7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHN0ciArPSBjaGlsZC5vdXRlckhUTUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0ciArPSBjaGlsZC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxufVxuXG5zZXJpYWxpemVyLm9uKCdodG1sJywgJ2RvY3VtZW50JywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gc2VyaWFsaXplclxuICAgICAgICAuaGFuZGxlQ29udGVudHMoJ2h0bWwnLCBub2RlLml0ZW1zIHx8IFtdLCBvcHRpb25zKVxuICAgICAgICAudGhlbigoY29udGVudHMpID0+IHtcbiAgICAgICAgICAgIGxldCBvdXRwdXQgPSBuZXcgRmFrZURvYygpO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudHMpKSB7XG4gICAgICAgICAgICAgICAgY29udGVudHMuZm9yRWFjaCgoY2hpbGQpID0+IG91dHB1dC5hcHBlbmRDaGlsZChjaGlsZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSk7XG59KTtcblxuc2VyaWFsaXplci5vbignaHRtbCcsICdoZWFkaW5nJywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gZWxlbWVudChub2RlLCAnaCcgKyAobm9kZS5sZXZlbCB8fCAxKSwgbm9kZS5hdHRyKCksIFtuZXcgVGV4dE5vZGUobm9kZS50ZXh0LCBub2RlLmZvcm1hdHMpXSwgb3B0aW9ucyk7XG59KTtcblxuc2VyaWFsaXplci5vbignaHRtbCcsICdwYXJhZ3JhcGgnLCAobm9kZSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBlbGVtZW50KG5vZGUsICdwJywgbm9kZS5hdHRyKCksIFtuZXcgVGV4dE5vZGUobm9kZS50ZXh0LCBub2RlLmZvcm1hdHMpXSwgb3B0aW9ucyk7XG59KTtcblxuc2VyaWFsaXplci5vbignaHRtbCcsICdpbWFnZScsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGVsZW1lbnQobm9kZSwgJ2ltZycsIG5vZGUuYXR0cigpLCBudWxsLCBvcHRpb25zKTtcbn0pO1xuXG5zZXJpYWxpemVyLm9uKCdodG1sJywgJ3RleHQnLCAobm9kZSwgb3B0aW9ucykgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZS50ZXh0KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVkaXQpIHtcbiAgICAgICAgLy9lbGVtZW50LnNldEF0dHJpYnV0ZSgnbmFtZScsIG5vZGUubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZWxlbWVudCk7XG59KTtcblxuc2VyaWFsaXplci5vbignaHRtbCcsICcqJywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gZWxlbWVudChub2RlLCBub2RlLl90eXBlLCBub2RlLmF0dHIoKSwgbm9kZS5pdGVtcywgb3B0aW9ucyk7XG59KTtcbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuLyoqXG4gKiBDb252ZXJ0IGl0ZXJhYmxlIG9iamVjdHMgaW50byBhcnJheXNcbiAqIEBwYXJhbSAgIHtJdGVyYWJsZX0gaXRlcmFibGVcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmFpemUoaXRlcmFibGUpIHtcbiAgICByZXR1cm4gW10uc2xpY2UuYXBwbHkoaXRlcmFibGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnkobm9kZSwgcXVlcnkpIHtcbiAgICByZXR1cm4gYXJyYWl6ZShub2RlLnF1ZXJ5U2VsZWN0b3JBbGwocXVlcnkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGlucHV0cywgZXhjZXB0KSB7XG4gICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgIGlucHV0c1xuICAgICAgICAuZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgT2JqZWN0XG4gICAgICAgICAgICAgICAgLmtleXMoaW5wdXQpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXhjZXB0ICYmIGV4Y2VwdC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGlucHV0W2tleV0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsIlxudmFyIFBpcGUgPSByZXF1aXJlKCcuLi9waXBlJykuUGlwZTtcblxudmFyIENvbnRleHQgPSBmdW5jdGlvbiBDb250ZXh0KCl7XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5zZXRSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcblx0dGhpcy5yZXN1bHQgPSByZXN1bHQ7XG5cdHRoaXMuaGFzUmVzdWx0ID0gdHJ1ZTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5leGl0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZXhpdGluZyA9IHRydWU7XG5cdHJldHVybiB0aGlzO1xufTtcblxuQ29udGV4dC5wcm90b3R5cGUuc3dpdGNoVG8gPSBmdW5jdGlvbihuZXh0LCBwaXBlKSB7XG5cdGlmICh0eXBlb2YgbmV4dCA9PT0gJ3N0cmluZycgfHwgbmV4dCBpbnN0YW5jZW9mIFBpcGUpIHtcblx0XHR0aGlzLm5leHRQaXBlID0gbmV4dDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLm5leHQgPSBuZXh0O1xuXHRcdGlmIChwaXBlKSB7XG5cdFx0XHR0aGlzLm5leHRQaXBlID0gcGlwZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oY2hpbGQsIG5hbWUpIHtcblx0Y2hpbGQucGFyZW50ID0gdGhpcztcblx0aWYgKHR5cGVvZiBuYW1lICE9PSAndW5kZWZpbmVkJykge1xuXHRcdGNoaWxkLmNoaWxkTmFtZSA9IG5hbWU7XG5cdH1cblx0Y2hpbGQucm9vdCA9IHRoaXMucm9vdCB8fCB0aGlzO1xuXHRjaGlsZC5vcHRpb25zID0gY2hpbGQub3B0aW9ucyB8fCB0aGlzLm9wdGlvbnM7XG5cdGlmICghdGhpcy5jaGlsZHJlbikge1xuXHRcdHRoaXMuY2hpbGRyZW4gPSBbY2hpbGRdO1xuXHRcdHRoaXMubmV4dEFmdGVyQ2hpbGRyZW4gPSB0aGlzLm5leHQgfHwgbnVsbDtcblx0XHR0aGlzLm5leHQgPSBjaGlsZDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dCA9IGNoaWxkO1xuXHRcdHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdH1cblx0Y2hpbGQubmV4dCA9IHRoaXM7XG5cdHJldHVybiB0aGlzO1xufTtcblxuZXhwb3J0cy5Db250ZXh0ID0gQ29udGV4dDtcbiIsInZhciBDb250ZXh0ID0gcmVxdWlyZSgnLi9jb250ZXh0JykuQ29udGV4dDtcbnZhciBkYXRlUmV2aXZlciA9IHJlcXVpcmUoJy4uL2RhdGUtcmV2aXZlcicpO1xuXG52YXIgRGlmZkNvbnRleHQgPSBmdW5jdGlvbiBEaWZmQ29udGV4dChsZWZ0LCByaWdodCkge1xuICB0aGlzLmxlZnQgPSBsZWZ0O1xuICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gIHRoaXMucGlwZSA9ICdkaWZmJztcbn07XG5cbkRpZmZDb250ZXh0LnByb3RvdHlwZSA9IG5ldyBDb250ZXh0KCk7XG5cbkRpZmZDb250ZXh0LnByb3RvdHlwZS5zZXRSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5jbG9uZURpZmZWYWx1ZXMpIHtcbiAgICB2YXIgY2xvbmUgPSB0eXBlb2YgdGhpcy5vcHRpb25zLmNsb25lRGlmZlZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICB0aGlzLm9wdGlvbnMuY2xvbmVEaWZmVmFsdWVzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpLCBkYXRlUmV2aXZlcik7XG4gICAgICB9O1xuICAgIGlmICh0eXBlb2YgcmVzdWx0WzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgcmVzdWx0WzBdID0gY2xvbmUocmVzdWx0WzBdKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXN1bHRbMV0gPT09ICdvYmplY3QnKSB7XG4gICAgICByZXN1bHRbMV0gPSBjbG9uZShyZXN1bHRbMV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gQ29udGV4dC5wcm90b3R5cGUuc2V0UmVzdWx0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5leHBvcnRzLkRpZmZDb250ZXh0ID0gRGlmZkNvbnRleHQ7XG4iLCJ2YXIgQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dCcpLkNvbnRleHQ7XG5cbnZhciBQYXRjaENvbnRleHQgPSBmdW5jdGlvbiBQYXRjaENvbnRleHQobGVmdCwgZGVsdGEpIHtcbiAgdGhpcy5sZWZ0ID0gbGVmdDtcbiAgdGhpcy5kZWx0YSA9IGRlbHRhO1xuICB0aGlzLnBpcGUgPSAncGF0Y2gnO1xufTtcblxuUGF0Y2hDb250ZXh0LnByb3RvdHlwZSA9IG5ldyBDb250ZXh0KCk7XG5cbmV4cG9ydHMuUGF0Y2hDb250ZXh0ID0gUGF0Y2hDb250ZXh0O1xuIiwidmFyIENvbnRleHQgPSByZXF1aXJlKCcuL2NvbnRleHQnKS5Db250ZXh0O1xuXG52YXIgUmV2ZXJzZUNvbnRleHQgPSBmdW5jdGlvbiBSZXZlcnNlQ29udGV4dChkZWx0YSkge1xuICB0aGlzLmRlbHRhID0gZGVsdGE7XG4gIHRoaXMucGlwZSA9ICdyZXZlcnNlJztcbn07XG5cblJldmVyc2VDb250ZXh0LnByb3RvdHlwZSA9IG5ldyBDb250ZXh0KCk7XG5cbmV4cG9ydHMuUmV2ZXJzZUNvbnRleHQgPSBSZXZlcnNlQ29udGV4dDtcbiIsIi8vIHVzZSBhcyAybmQgcGFyYW1ldGVyIGZvciBKU09OLnBhcnNlIHRvIHJldml2ZSBEYXRlIGluc3RhbmNlc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkYXRlUmV2aXZlcihrZXksIHZhbHVlKSB7XG4gIHZhciBwYXJ0cztcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBwYXJ0cyA9IC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkoPzpcXC4oXFxkKikpPyhafChbK1xcLV0pKFxcZHsyfSk6KFxcZHsyfSkpJC8uZXhlYyh2YWx1ZSk7XG4gICAgaWYgKHBhcnRzKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoK3BhcnRzWzFdLCArcGFydHNbMl0gLSAxLCArcGFydHNbM10sICtwYXJ0c1s0XSwgK3BhcnRzWzVdLCArcGFydHNbNl0sICsocGFydHNbN10gfHwgMCkpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufTtcbiIsInZhciBQcm9jZXNzb3IgPSByZXF1aXJlKCcuL3Byb2Nlc3NvcicpLlByb2Nlc3NvcjtcbnZhciBQaXBlID0gcmVxdWlyZSgnLi9waXBlJykuUGlwZTtcbnZhciBEaWZmQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dHMvZGlmZicpLkRpZmZDb250ZXh0O1xudmFyIFBhdGNoQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dHMvcGF0Y2gnKS5QYXRjaENvbnRleHQ7XG52YXIgUmV2ZXJzZUNvbnRleHQgPSByZXF1aXJlKCcuL2NvbnRleHRzL3JldmVyc2UnKS5SZXZlcnNlQ29udGV4dDtcblxudmFyIHRyaXZpYWwgPSByZXF1aXJlKCcuL2ZpbHRlcnMvdHJpdmlhbCcpO1xudmFyIG5lc3RlZCA9IHJlcXVpcmUoJy4vZmlsdGVycy9uZXN0ZWQnKTtcbnZhciBhcnJheXMgPSByZXF1aXJlKCcuL2ZpbHRlcnMvYXJyYXlzJyk7XG52YXIgZGF0ZXMgPSByZXF1aXJlKCcuL2ZpbHRlcnMvZGF0ZXMnKTtcbnZhciB0ZXh0cyA9IHJlcXVpcmUoJy4vZmlsdGVycy90ZXh0cycpO1xuXG52YXIgRGlmZlBhdGNoZXIgPSBmdW5jdGlvbiBEaWZmUGF0Y2hlcihvcHRpb25zKSB7XG4gIHRoaXMucHJvY2Vzc29yID0gbmV3IFByb2Nlc3NvcihvcHRpb25zKTtcbiAgdGhpcy5wcm9jZXNzb3IucGlwZShuZXcgUGlwZSgnZGlmZicpLmFwcGVuZChcbiAgICBuZXN0ZWQuY29sbGVjdENoaWxkcmVuRGlmZkZpbHRlcixcbiAgICB0cml2aWFsLmRpZmZGaWx0ZXIsXG4gICAgZGF0ZXMuZGlmZkZpbHRlcixcbiAgICB0ZXh0cy5kaWZmRmlsdGVyLFxuICAgIG5lc3RlZC5vYmplY3RzRGlmZkZpbHRlcixcbiAgICBhcnJheXMuZGlmZkZpbHRlclxuICApLnNob3VsZEhhdmVSZXN1bHQoKSk7XG4gIHRoaXMucHJvY2Vzc29yLnBpcGUobmV3IFBpcGUoJ3BhdGNoJykuYXBwZW5kKFxuICAgIG5lc3RlZC5jb2xsZWN0Q2hpbGRyZW5QYXRjaEZpbHRlcixcbiAgICBhcnJheXMuY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIsXG4gICAgdHJpdmlhbC5wYXRjaEZpbHRlcixcbiAgICB0ZXh0cy5wYXRjaEZpbHRlcixcbiAgICBuZXN0ZWQucGF0Y2hGaWx0ZXIsXG4gICAgYXJyYXlzLnBhdGNoRmlsdGVyXG4gICkuc2hvdWxkSGF2ZVJlc3VsdCgpKTtcbiAgdGhpcy5wcm9jZXNzb3IucGlwZShuZXcgUGlwZSgncmV2ZXJzZScpLmFwcGVuZChcbiAgICBuZXN0ZWQuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcixcbiAgICBhcnJheXMuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcixcbiAgICB0cml2aWFsLnJldmVyc2VGaWx0ZXIsXG4gICAgdGV4dHMucmV2ZXJzZUZpbHRlcixcbiAgICBuZXN0ZWQucmV2ZXJzZUZpbHRlcixcbiAgICBhcnJheXMucmV2ZXJzZUZpbHRlclxuICApLnNob3VsZEhhdmVSZXN1bHQoKSk7XG59O1xuXG5EaWZmUGF0Y2hlci5wcm90b3R5cGUub3B0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzb3Iub3B0aW9ucy5hcHBseSh0aGlzLnByb2Nlc3NvciwgYXJndW1lbnRzKTtcbn07XG5cbkRpZmZQYXRjaGVyLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgcmV0dXJuIHRoaXMucHJvY2Vzc29yLnByb2Nlc3MobmV3IERpZmZDb250ZXh0KGxlZnQsIHJpZ2h0KSk7XG59O1xuXG5EaWZmUGF0Y2hlci5wcm90b3R5cGUucGF0Y2ggPSBmdW5jdGlvbihsZWZ0LCBkZWx0YSkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzb3IucHJvY2VzcyhuZXcgUGF0Y2hDb250ZXh0KGxlZnQsIGRlbHRhKSk7XG59O1xuXG5EaWZmUGF0Y2hlci5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uKGRlbHRhKSB7XG4gIHJldHVybiB0aGlzLnByb2Nlc3Nvci5wcm9jZXNzKG5ldyBSZXZlcnNlQ29udGV4dChkZWx0YSkpO1xufTtcblxuRGlmZlBhdGNoZXIucHJvdG90eXBlLnVucGF0Y2ggPSBmdW5jdGlvbihyaWdodCwgZGVsdGEpIHtcbiAgcmV0dXJuIHRoaXMucGF0Y2gocmlnaHQsIHRoaXMucmV2ZXJzZShkZWx0YSkpO1xufTtcblxuZXhwb3J0cy5EaWZmUGF0Y2hlciA9IERpZmZQYXRjaGVyO1xuIiwiXG5leHBvcnRzLmlzQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xuIiwidmFyIERpZmZDb250ZXh0ID0gcmVxdWlyZSgnLi4vY29udGV4dHMvZGlmZicpLkRpZmZDb250ZXh0O1xudmFyIFBhdGNoQ29udGV4dCA9IHJlcXVpcmUoJy4uL2NvbnRleHRzL3BhdGNoJykuUGF0Y2hDb250ZXh0O1xudmFyIFJldmVyc2VDb250ZXh0ID0gcmVxdWlyZSgnLi4vY29udGV4dHMvcmV2ZXJzZScpLlJldmVyc2VDb250ZXh0O1xuXG52YXIgbGNzID0gcmVxdWlyZSgnLi9sY3MnKTtcblxudmFyIEFSUkFZX01PVkUgPSAzO1xuXG52YXIgaXNBcnJheSA9ICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykgP1xuICAvLyB1c2UgbmF0aXZlIGZ1bmN0aW9uXG4gIEFycmF5LmlzQXJyYXkgOlxuICAvLyB1c2UgaW5zdGFuY2VvZiBvcGVyYXRvclxuICBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIGEgaW5zdGFuY2VvZiBBcnJheTtcbiAgfTtcblxudmFyIGFycmF5SW5kZXhPZiA9IHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJyA/XG4gIGZ1bmN0aW9uKGFycmF5LCBpdGVtKSB7XG4gICAgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSk7XG4gIH0gOiBmdW5jdGlvbihhcnJheSwgaXRlbSkge1xuICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbmZ1bmN0aW9uIGFycmF5c0hhdmVNYXRjaEJ5UmVmKGFycmF5MSwgYXJyYXkyLCBsZW4xLCBsZW4yKSB7XG4gIGZvciAodmFyIGluZGV4MSA9IDA7IGluZGV4MSA8IGxlbjE7IGluZGV4MSsrKSB7XG4gICAgdmFyIHZhbDEgPSBhcnJheTFbaW5kZXgxXTtcbiAgICBmb3IgKHZhciBpbmRleDIgPSAwOyBpbmRleDIgPCBsZW4yOyBpbmRleDIrKykge1xuICAgICAgdmFyIHZhbDIgPSBhcnJheTJbaW5kZXgyXTtcbiAgICAgIGlmICh2YWwxID09PSB2YWwyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYXRjaEl0ZW1zKGFycmF5MSwgYXJyYXkyLCBpbmRleDEsIGluZGV4MiwgY29udGV4dCkge1xuICB2YXIgdmFsdWUxID0gYXJyYXkxW2luZGV4MV07XG4gIHZhciB2YWx1ZTIgPSBhcnJheTJbaW5kZXgyXTtcbiAgaWYgKHZhbHVlMSA9PT0gdmFsdWUyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZTEgIT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZTIgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBvYmplY3RIYXNoID0gY29udGV4dC5vYmplY3RIYXNoO1xuICBpZiAoIW9iamVjdEhhc2gpIHtcbiAgICAvLyBubyB3YXkgdG8gbWF0Y2ggb2JqZWN0cyB3YXMgcHJvdmlkZWQsIHRyeSBtYXRjaCBieSBwb3NpdGlvblxuICAgIHJldHVybiBjb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiAmJiBpbmRleDEgPT09IGluZGV4MjtcbiAgfVxuICB2YXIgaGFzaDE7XG4gIHZhciBoYXNoMjtcbiAgaWYgKHR5cGVvZiBpbmRleDEgPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5oYXNoQ2FjaGUxID0gY29udGV4dC5oYXNoQ2FjaGUxIHx8IFtdO1xuICAgIGhhc2gxID0gY29udGV4dC5oYXNoQ2FjaGUxW2luZGV4MV07XG4gICAgaWYgKHR5cGVvZiBoYXNoMSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRleHQuaGFzaENhY2hlMVtpbmRleDFdID0gaGFzaDEgPSBvYmplY3RIYXNoKHZhbHVlMSwgaW5kZXgxKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaGFzaDEgPSBvYmplY3RIYXNoKHZhbHVlMSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBoYXNoMSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHR5cGVvZiBpbmRleDIgPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5oYXNoQ2FjaGUyID0gY29udGV4dC5oYXNoQ2FjaGUyIHx8IFtdO1xuICAgIGhhc2gyID0gY29udGV4dC5oYXNoQ2FjaGUyW2luZGV4Ml07XG4gICAgaWYgKHR5cGVvZiBoYXNoMiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRleHQuaGFzaENhY2hlMltpbmRleDJdID0gaGFzaDIgPSBvYmplY3RIYXNoKHZhbHVlMiwgaW5kZXgyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaGFzaDIgPSBvYmplY3RIYXNoKHZhbHVlMik7XG4gIH1cbiAgaWYgKHR5cGVvZiBoYXNoMiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGhhc2gxID09PSBoYXNoMjtcbn1cblxudmFyIGRpZmZGaWx0ZXIgPSBmdW5jdGlvbiBhcnJheXNEaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0LmxlZnRJc0FycmF5KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1hdGNoQ29udGV4dCA9IHtcbiAgICBvYmplY3RIYXNoOiBjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLm9iamVjdEhhc2gsXG4gICAgbWF0Y2hCeVBvc2l0aW9uOiBjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLm1hdGNoQnlQb3NpdGlvblxuICB9O1xuICB2YXIgY29tbW9uSGVhZCA9IDA7XG4gIHZhciBjb21tb25UYWlsID0gMDtcbiAgdmFyIGluZGV4O1xuICB2YXIgaW5kZXgxO1xuICB2YXIgaW5kZXgyO1xuICB2YXIgYXJyYXkxID0gY29udGV4dC5sZWZ0O1xuICB2YXIgYXJyYXkyID0gY29udGV4dC5yaWdodDtcbiAgdmFyIGxlbjEgPSBhcnJheTEubGVuZ3RoO1xuICB2YXIgbGVuMiA9IGFycmF5Mi5sZW5ndGg7XG5cbiAgdmFyIGNoaWxkO1xuXG4gIGlmIChsZW4xID4gMCAmJiBsZW4yID4gMCAmJiAhbWF0Y2hDb250ZXh0Lm9iamVjdEhhc2ggJiZcbiAgICB0eXBlb2YgbWF0Y2hDb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgbWF0Y2hDb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiA9ICFhcnJheXNIYXZlTWF0Y2hCeVJlZihhcnJheTEsIGFycmF5MiwgbGVuMSwgbGVuMik7XG4gIH1cblxuICAvLyBzZXBhcmF0ZSBjb21tb24gaGVhZFxuICB3aGlsZSAoY29tbW9uSGVhZCA8IGxlbjEgJiYgY29tbW9uSGVhZCA8IGxlbjIgJiZcbiAgICBtYXRjaEl0ZW1zKGFycmF5MSwgYXJyYXkyLCBjb21tb25IZWFkLCBjb21tb25IZWFkLCBtYXRjaENvbnRleHQpKSB7XG4gICAgaW5kZXggPSBjb21tb25IZWFkO1xuICAgIGNoaWxkID0gbmV3IERpZmZDb250ZXh0KGNvbnRleHQubGVmdFtpbmRleF0sIGNvbnRleHQucmlnaHRbaW5kZXhdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIGluZGV4KTtcbiAgICBjb21tb25IZWFkKys7XG4gIH1cbiAgLy8gc2VwYXJhdGUgY29tbW9uIHRhaWxcbiAgd2hpbGUgKGNvbW1vblRhaWwgKyBjb21tb25IZWFkIDwgbGVuMSAmJiBjb21tb25UYWlsICsgY29tbW9uSGVhZCA8IGxlbjIgJiZcbiAgICBtYXRjaEl0ZW1zKGFycmF5MSwgYXJyYXkyLCBsZW4xIC0gMSAtIGNvbW1vblRhaWwsIGxlbjIgLSAxIC0gY29tbW9uVGFpbCwgbWF0Y2hDb250ZXh0KSkge1xuICAgIGluZGV4MSA9IGxlbjEgLSAxIC0gY29tbW9uVGFpbDtcbiAgICBpbmRleDIgPSBsZW4yIC0gMSAtIGNvbW1vblRhaWw7XG4gICAgY2hpbGQgPSBuZXcgRGlmZkNvbnRleHQoY29udGV4dC5sZWZ0W2luZGV4MV0sIGNvbnRleHQucmlnaHRbaW5kZXgyXSk7XG4gICAgY29udGV4dC5wdXNoKGNoaWxkLCBpbmRleDIpO1xuICAgIGNvbW1vblRhaWwrKztcbiAgfVxuICB2YXIgcmVzdWx0O1xuICBpZiAoY29tbW9uSGVhZCArIGNvbW1vblRhaWwgPT09IGxlbjEpIHtcbiAgICBpZiAobGVuMSA9PT0gbGVuMikge1xuICAgICAgLy8gYXJyYXlzIGFyZSBpZGVudGljYWxcbiAgICAgIGNvbnRleHQuc2V0UmVzdWx0KHVuZGVmaW5lZCkuZXhpdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB0cml2aWFsIGNhc2UsIGEgYmxvY2sgKDEgb3IgbW9yZSBjb25zZWN1dGl2ZSBpdGVtcykgd2FzIGFkZGVkXG4gICAgcmVzdWx0ID0gcmVzdWx0IHx8IHtcbiAgICAgIF90OiAnYSdcbiAgICB9O1xuICAgIGZvciAoaW5kZXggPSBjb21tb25IZWFkOyBpbmRleCA8IGxlbjIgLSBjb21tb25UYWlsOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gW2FycmF5MltpbmRleF1dO1xuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChyZXN1bHQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbW1vbkhlYWQgKyBjb21tb25UYWlsID09PSBsZW4yKSB7XG4gICAgLy8gdHJpdmlhbCBjYXNlLCBhIGJsb2NrICgxIG9yIG1vcmUgY29uc2VjdXRpdmUgaXRlbXMpIHdhcyByZW1vdmVkXG4gICAgcmVzdWx0ID0gcmVzdWx0IHx8IHtcbiAgICAgIF90OiAnYSdcbiAgICB9O1xuICAgIGZvciAoaW5kZXggPSBjb21tb25IZWFkOyBpbmRleCA8IGxlbjEgLSBjb21tb25UYWlsOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbJ18nICsgaW5kZXhdID0gW2FycmF5MVtpbmRleF0sIDAsIDBdO1xuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChyZXN1bHQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gcmVzZXQgaGFzaCBjYWNoZVxuICBkZWxldGUgbWF0Y2hDb250ZXh0Lmhhc2hDYWNoZTE7XG4gIGRlbGV0ZSBtYXRjaENvbnRleHQuaGFzaENhY2hlMjtcblxuICAvLyBkaWZmIGlzIG5vdCB0cml2aWFsLCBmaW5kIHRoZSBMQ1MgKExvbmdlc3QgQ29tbW9uIFN1YnNlcXVlbmNlKVxuICB2YXIgdHJpbW1lZDEgPSBhcnJheTEuc2xpY2UoY29tbW9uSGVhZCwgbGVuMSAtIGNvbW1vblRhaWwpO1xuICB2YXIgdHJpbW1lZDIgPSBhcnJheTIuc2xpY2UoY29tbW9uSGVhZCwgbGVuMiAtIGNvbW1vblRhaWwpO1xuICB2YXIgc2VxID0gbGNzLmdldChcbiAgICB0cmltbWVkMSwgdHJpbW1lZDIsXG4gICAgbWF0Y2hJdGVtcyxcbiAgICBtYXRjaENvbnRleHRcbiAgKTtcbiAgdmFyIHJlbW92ZWRJdGVtcyA9IFtdO1xuICByZXN1bHQgPSByZXN1bHQgfHwge1xuICAgIF90OiAnYSdcbiAgfTtcbiAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMSAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICBpZiAoYXJyYXlJbmRleE9mKHNlcS5pbmRpY2VzMSwgaW5kZXggLSBjb21tb25IZWFkKSA8IDApIHtcbiAgICAgIC8vIHJlbW92ZWRcbiAgICAgIHJlc3VsdFsnXycgKyBpbmRleF0gPSBbYXJyYXkxW2luZGV4XSwgMCwgMF07XG4gICAgICByZW1vdmVkSXRlbXMucHVzaChpbmRleCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGRldGVjdE1vdmUgPSB0cnVlO1xuICBpZiAoY29udGV4dC5vcHRpb25zICYmIGNvbnRleHQub3B0aW9ucy5hcnJheXMgJiYgY29udGV4dC5vcHRpb25zLmFycmF5cy5kZXRlY3RNb3ZlID09PSBmYWxzZSkge1xuICAgIGRldGVjdE1vdmUgPSBmYWxzZTtcbiAgfVxuICB2YXIgaW5jbHVkZVZhbHVlT25Nb3ZlID0gZmFsc2U7XG4gIGlmIChjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLmFycmF5cyAmJiBjb250ZXh0Lm9wdGlvbnMuYXJyYXlzLmluY2x1ZGVWYWx1ZU9uTW92ZSkge1xuICAgIGluY2x1ZGVWYWx1ZU9uTW92ZSA9IHRydWU7XG4gIH1cblxuICB2YXIgcmVtb3ZlZEl0ZW1zTGVuZ3RoID0gcmVtb3ZlZEl0ZW1zLmxlbmd0aDtcbiAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMiAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICB2YXIgaW5kZXhPbkFycmF5MiA9IGFycmF5SW5kZXhPZihzZXEuaW5kaWNlczIsIGluZGV4IC0gY29tbW9uSGVhZCk7XG4gICAgaWYgKGluZGV4T25BcnJheTIgPCAwKSB7XG4gICAgICAvLyBhZGRlZCwgdHJ5IHRvIG1hdGNoIHdpdGggYSByZW1vdmVkIGl0ZW0gYW5kIHJlZ2lzdGVyIGFzIHBvc2l0aW9uIG1vdmVcbiAgICAgIHZhciBpc01vdmUgPSBmYWxzZTtcbiAgICAgIGlmIChkZXRlY3RNb3ZlICYmIHJlbW92ZWRJdGVtc0xlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yICh2YXIgcmVtb3ZlSXRlbUluZGV4MSA9IDA7IHJlbW92ZUl0ZW1JbmRleDEgPCByZW1vdmVkSXRlbXNMZW5ndGg7IHJlbW92ZUl0ZW1JbmRleDErKykge1xuICAgICAgICAgIGluZGV4MSA9IHJlbW92ZWRJdGVtc1tyZW1vdmVJdGVtSW5kZXgxXTtcbiAgICAgICAgICBpZiAobWF0Y2hJdGVtcyh0cmltbWVkMSwgdHJpbW1lZDIsIGluZGV4MSAtIGNvbW1vbkhlYWQsXG4gICAgICAgICAgICBpbmRleCAtIGNvbW1vbkhlYWQsIG1hdGNoQ29udGV4dCkpIHtcbiAgICAgICAgICAgIC8vIHN0b3JlIHBvc2l0aW9uIG1vdmUgYXM6IFtvcmlnaW5hbFZhbHVlLCBuZXdQb3NpdGlvbiwgQVJSQVlfTU9WRV1cbiAgICAgICAgICAgIHJlc3VsdFsnXycgKyBpbmRleDFdLnNwbGljZSgxLCAyLCBpbmRleCwgQVJSQVlfTU9WRSk7XG4gICAgICAgICAgICBpZiAoIWluY2x1ZGVWYWx1ZU9uTW92ZSkge1xuICAgICAgICAgICAgICAvLyBkb24ndCBpbmNsdWRlIG1vdmVkIHZhbHVlIG9uIGRpZmYsIHRvIHNhdmUgYnl0ZXNcbiAgICAgICAgICAgICAgcmVzdWx0WydfJyArIGluZGV4MV1bMF0gPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5kZXgyID0gaW5kZXg7XG4gICAgICAgICAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dChjb250ZXh0LmxlZnRbaW5kZXgxXSwgY29udGV4dC5yaWdodFtpbmRleDJdKTtcbiAgICAgICAgICAgIGNvbnRleHQucHVzaChjaGlsZCwgaW5kZXgyKTtcbiAgICAgICAgICAgIHJlbW92ZWRJdGVtcy5zcGxpY2UocmVtb3ZlSXRlbUluZGV4MSwgMSk7XG4gICAgICAgICAgICBpc01vdmUgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWlzTW92ZSkge1xuICAgICAgICAvLyBhZGRlZFxuICAgICAgICByZXN1bHRbaW5kZXhdID0gW2FycmF5MltpbmRleF1dO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtYXRjaCwgZG8gaW5uZXIgZGlmZlxuICAgICAgaW5kZXgxID0gc2VxLmluZGljZXMxW2luZGV4T25BcnJheTJdICsgY29tbW9uSGVhZDtcbiAgICAgIGluZGV4MiA9IHNlcS5pbmRpY2VzMltpbmRleE9uQXJyYXkyXSArIGNvbW1vbkhlYWQ7XG4gICAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dChjb250ZXh0LmxlZnRbaW5kZXgxXSwgY29udGV4dC5yaWdodFtpbmRleDJdKTtcbiAgICAgIGNvbnRleHQucHVzaChjaGlsZCwgaW5kZXgyKTtcbiAgICB9XG4gIH1cblxuICBjb250ZXh0LnNldFJlc3VsdChyZXN1bHQpLmV4aXQoKTtcblxufTtcbmRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdhcnJheXMnO1xuXG52YXIgY29tcGFyZSA9IHtcbiAgbnVtZXJpY2FsbHk6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYSAtIGI7XG4gIH0sXG4gIG51bWVyaWNhbGx5Qnk6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGFbbmFtZV0gLSBiW25hbWVdO1xuICAgIH07XG4gIH1cbn07XG5cbnZhciBwYXRjaEZpbHRlciA9IGZ1bmN0aW9uIG5lc3RlZFBhdGNoRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCAhPT0gJ2EnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCwgaW5kZXgxO1xuXG4gIHZhciBkZWx0YSA9IGNvbnRleHQuZGVsdGE7XG4gIHZhciBhcnJheSA9IGNvbnRleHQubGVmdDtcblxuICAvLyBmaXJzdCwgc2VwYXJhdGUgcmVtb3ZhbHMsIGluc2VydGlvbnMgYW5kIG1vZGlmaWNhdGlvbnNcbiAgdmFyIHRvUmVtb3ZlID0gW107XG4gIHZhciB0b0luc2VydCA9IFtdO1xuICB2YXIgdG9Nb2RpZnkgPSBbXTtcbiAgZm9yIChpbmRleCBpbiBkZWx0YSkge1xuICAgIGlmIChpbmRleCAhPT0gJ190Jykge1xuICAgICAgaWYgKGluZGV4WzBdID09PSAnXycpIHtcbiAgICAgICAgLy8gcmVtb3ZlZCBpdGVtIGZyb20gb3JpZ2luYWwgYXJyYXlcbiAgICAgICAgaWYgKGRlbHRhW2luZGV4XVsyXSA9PT0gMCB8fCBkZWx0YVtpbmRleF1bMl0gPT09IEFSUkFZX01PVkUpIHtcbiAgICAgICAgICB0b1JlbW92ZS5wdXNoKHBhcnNlSW50KGluZGV4LnNsaWNlKDEpLCAxMCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb25seSByZW1vdmFsIG9yIG1vdmUgY2FuIGJlIGFwcGxpZWQgYXQgb3JpZ2luYWwgYXJyYXkgaW5kaWNlcycgK1xuICAgICAgICAgICAgJywgaW52YWxpZCBkaWZmIHR5cGU6ICcgKyBkZWx0YVtpbmRleF1bMl0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZGVsdGFbaW5kZXhdLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIC8vIGFkZGVkIGl0ZW0gYXQgbmV3IGFycmF5XG4gICAgICAgICAgdG9JbnNlcnQucHVzaCh7XG4gICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoaW5kZXgsIDEwKSxcbiAgICAgICAgICAgIHZhbHVlOiBkZWx0YVtpbmRleF1bMF1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtb2RpZmllZCBpdGVtIGF0IG5ldyBhcnJheVxuICAgICAgICAgIHRvTW9kaWZ5LnB1c2goe1xuICAgICAgICAgICAgaW5kZXg6IHBhcnNlSW50KGluZGV4LCAxMCksXG4gICAgICAgICAgICBkZWx0YTogZGVsdGFbaW5kZXhdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgaXRlbXMsIGluIHJldmVyc2Ugb3JkZXIgdG8gYXZvaWQgc2F3aW5nIG91ciBvd24gZmxvb3JcbiAgdG9SZW1vdmUgPSB0b1JlbW92ZS5zb3J0KGNvbXBhcmUubnVtZXJpY2FsbHkpO1xuICBmb3IgKGluZGV4ID0gdG9SZW1vdmUubGVuZ3RoIC0gMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuICAgIGluZGV4MSA9IHRvUmVtb3ZlW2luZGV4XTtcbiAgICB2YXIgaW5kZXhEaWZmID0gZGVsdGFbJ18nICsgaW5kZXgxXTtcbiAgICB2YXIgcmVtb3ZlZFZhbHVlID0gYXJyYXkuc3BsaWNlKGluZGV4MSwgMSlbMF07XG4gICAgaWYgKGluZGV4RGlmZlsyXSA9PT0gQVJSQVlfTU9WRSkge1xuICAgICAgLy8gcmVpbnNlcnQgbGF0ZXJcbiAgICAgIHRvSW5zZXJ0LnB1c2goe1xuICAgICAgICBpbmRleDogaW5kZXhEaWZmWzFdLFxuICAgICAgICB2YWx1ZTogcmVtb3ZlZFZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBpbnNlcnQgaXRlbXMsIGluIHJldmVyc2Ugb3JkZXIgdG8gYXZvaWQgbW92aW5nIG91ciBvd24gZmxvb3JcbiAgdG9JbnNlcnQgPSB0b0luc2VydC5zb3J0KGNvbXBhcmUubnVtZXJpY2FsbHlCeSgnaW5kZXgnKSk7XG4gIHZhciB0b0luc2VydExlbmd0aCA9IHRvSW5zZXJ0Lmxlbmd0aDtcbiAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdG9JbnNlcnRMZW5ndGg7IGluZGV4KyspIHtcbiAgICB2YXIgaW5zZXJ0aW9uID0gdG9JbnNlcnRbaW5kZXhdO1xuICAgIGFycmF5LnNwbGljZShpbnNlcnRpb24uaW5kZXgsIDAsIGluc2VydGlvbi52YWx1ZSk7XG4gIH1cblxuICAvLyBhcHBseSBtb2RpZmljYXRpb25zXG4gIHZhciB0b01vZGlmeUxlbmd0aCA9IHRvTW9kaWZ5Lmxlbmd0aDtcbiAgdmFyIGNoaWxkO1xuICBpZiAodG9Nb2RpZnlMZW5ndGggPiAwKSB7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdG9Nb2RpZnlMZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBtb2RpZmljYXRpb24gPSB0b01vZGlmeVtpbmRleF07XG4gICAgICBjaGlsZCA9IG5ldyBQYXRjaENvbnRleHQoY29udGV4dC5sZWZ0W21vZGlmaWNhdGlvbi5pbmRleF0sIG1vZGlmaWNhdGlvbi5kZWx0YSk7XG4gICAgICBjb250ZXh0LnB1c2goY2hpbGQsIG1vZGlmaWNhdGlvbi5pbmRleCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb250ZXh0LmNoaWxkcmVuKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoY29udGV4dC5sZWZ0KS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnRleHQuZXhpdCgpO1xufTtcbnBhdGNoRmlsdGVyLmZpbHRlck5hbWUgPSAnYXJyYXlzJztcblxudmFyIGNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyID0gZnVuY3Rpb24gY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQgfHwgIWNvbnRleHQuY2hpbGRyZW4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEuX3QgIT09ICdhJykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNoaWxkID0gY29udGV4dC5jaGlsZHJlbltpbmRleF07XG4gICAgY29udGV4dC5sZWZ0W2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gIH1cbiAgY29udGV4dC5zZXRSZXN1bHQoY29udGV4dC5sZWZ0KS5leGl0KCk7XG59O1xuY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIuZmlsdGVyTmFtZSA9ICdhcnJheXNDb2xsZWN0Q2hpbGRyZW4nO1xuXG52YXIgcmV2ZXJzZUZpbHRlciA9IGZ1bmN0aW9uIGFycmF5c1JldmVyc2VGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQubmVzdGVkKSB7XG4gICAgaWYgKGNvbnRleHQuZGVsdGFbMl0gPT09IEFSUkFZX01PVkUpIHtcbiAgICAgIGNvbnRleHQubmV3TmFtZSA9ICdfJyArIGNvbnRleHQuZGVsdGFbMV07XG4gICAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5kZWx0YVswXSwgcGFyc2VJbnQoY29udGV4dC5jaGlsZE5hbWUuc3Vic3RyKDEpLCAxMCksIEFSUkFZX01PVkVdKS5leGl0KCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCAhPT0gJ2EnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuYW1lLCBjaGlsZDtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQuZGVsdGEpIHtcbiAgICBpZiAobmFtZSA9PT0gJ190Jykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNoaWxkID0gbmV3IFJldmVyc2VDb250ZXh0KGNvbnRleHQuZGVsdGFbbmFtZV0pO1xuICAgIGNvbnRleHQucHVzaChjaGlsZCwgbmFtZSk7XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59O1xucmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ2FycmF5cyc7XG5cbnZhciByZXZlcnNlQXJyYXlEZWx0YUluZGV4ID0gZnVuY3Rpb24oZGVsdGEsIGluZGV4LCBpdGVtRGVsdGEpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3N0cmluZycgJiYgaW5kZXhbMF0gPT09ICdfJykge1xuICAgIHJldHVybiBwYXJzZUludChpbmRleC5zdWJzdHIoMSksIDEwKTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KGl0ZW1EZWx0YSkgJiYgaXRlbURlbHRhWzJdID09PSAwKSB7XG4gICAgcmV0dXJuICdfJyArIGluZGV4O1xuICB9XG5cbiAgdmFyIHJldmVyc2VJbmRleCA9ICtpbmRleDtcbiAgZm9yICh2YXIgZGVsdGFJbmRleCBpbiBkZWx0YSkge1xuICAgIHZhciBkZWx0YUl0ZW0gPSBkZWx0YVtkZWx0YUluZGV4XTtcbiAgICBpZiAoaXNBcnJheShkZWx0YUl0ZW0pKSB7XG4gICAgICBpZiAoZGVsdGFJdGVtWzJdID09PSBBUlJBWV9NT1ZFKSB7XG4gICAgICAgIHZhciBtb3ZlRnJvbUluZGV4ID0gcGFyc2VJbnQoZGVsdGFJbmRleC5zdWJzdHIoMSksIDEwKTtcbiAgICAgICAgdmFyIG1vdmVUb0luZGV4ID0gZGVsdGFJdGVtWzFdO1xuICAgICAgICBpZiAobW92ZVRvSW5kZXggPT09ICtpbmRleCkge1xuICAgICAgICAgIHJldHVybiBtb3ZlRnJvbUluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlRnJvbUluZGV4IDw9IHJldmVyc2VJbmRleCAmJiBtb3ZlVG9JbmRleCA+IHJldmVyc2VJbmRleCkge1xuICAgICAgICAgIHJldmVyc2VJbmRleCsrO1xuICAgICAgICB9IGVsc2UgaWYgKG1vdmVGcm9tSW5kZXggPj0gcmV2ZXJzZUluZGV4ICYmIG1vdmVUb0luZGV4IDwgcmV2ZXJzZUluZGV4KSB7XG4gICAgICAgICAgcmV2ZXJzZUluZGV4LS07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGVsdGFJdGVtWzJdID09PSAwKSB7XG4gICAgICAgIHZhciBkZWxldGVJbmRleCA9IHBhcnNlSW50KGRlbHRhSW5kZXguc3Vic3RyKDEpLCAxMCk7XG4gICAgICAgIGlmIChkZWxldGVJbmRleCA8PSByZXZlcnNlSW5kZXgpIHtcbiAgICAgICAgICByZXZlcnNlSW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkZWx0YUl0ZW0ubGVuZ3RoID09PSAxICYmIGRlbHRhSW5kZXggPD0gcmV2ZXJzZUluZGV4KSB7XG4gICAgICAgIHJldmVyc2VJbmRleC0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXZlcnNlSW5kZXg7XG59O1xuXG52YXIgY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlciA9IGZ1bmN0aW9uIGNvbGxlY3RDaGlsZHJlblJldmVyc2VGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQgfHwgIWNvbnRleHQuY2hpbGRyZW4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEuX3QgIT09ICdhJykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgdmFyIGRlbHRhID0ge1xuICAgIF90OiAnYSdcbiAgfTtcblxuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY2hpbGQgPSBjb250ZXh0LmNoaWxkcmVuW2luZGV4XTtcbiAgICB2YXIgbmFtZSA9IGNoaWxkLm5ld05hbWU7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAndW5kZWZpbmVkJykge1xuICAgICAgbmFtZSA9IHJldmVyc2VBcnJheURlbHRhSW5kZXgoY29udGV4dC5kZWx0YSwgY2hpbGQuY2hpbGROYW1lLCBjaGlsZC5yZXN1bHQpO1xuICAgIH1cbiAgICBpZiAoZGVsdGFbbmFtZV0gIT09IGNoaWxkLnJlc3VsdCkge1xuICAgICAgZGVsdGFbbmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gICAgfVxuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KGRlbHRhKS5leGl0KCk7XG59O1xuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ2FycmF5c0NvbGxlY3RDaGlsZHJlbic7XG5cbmV4cG9ydHMuZGlmZkZpbHRlciA9IGRpZmZGaWx0ZXI7XG5leHBvcnRzLnBhdGNoRmlsdGVyID0gcGF0Y2hGaWx0ZXI7XG5leHBvcnRzLmNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXI7XG5leHBvcnRzLnJldmVyc2VGaWx0ZXIgPSByZXZlcnNlRmlsdGVyO1xuZXhwb3J0cy5jb2xsZWN0Q2hpbGRyZW5SZXZlcnNlRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcjtcbiIsInZhciBkaWZmRmlsdGVyID0gZnVuY3Rpb24gZGF0ZXNEaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKGNvbnRleHQubGVmdCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICBpZiAoY29udGV4dC5yaWdodCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgIGlmIChjb250ZXh0LmxlZnQuZ2V0VGltZSgpICE9PSBjb250ZXh0LnJpZ2h0LmdldFRpbWUoKSkge1xuICAgICAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSk7XG4gICAgfVxuICAgIGNvbnRleHQuZXhpdCgpO1xuICB9IGVsc2UgaWYgKGNvbnRleHQucmlnaHQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQubGVmdCwgY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgfVxufTtcbmRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdkYXRlcyc7XG5cbmV4cG9ydHMuZGlmZkZpbHRlciA9IGRpZmZGaWx0ZXI7XG4iLCIvKlxuXG5MQ1MgaW1wbGVtZW50YXRpb24gdGhhdCBzdXBwb3J0cyBhcnJheXMgb3Igc3RyaW5nc1xuXG5yZWZlcmVuY2U6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9uZ2VzdF9jb21tb25fc3Vic2VxdWVuY2VfcHJvYmxlbVxuXG4qL1xuXG52YXIgZGVmYXVsdE1hdGNoID0gZnVuY3Rpb24oYXJyYXkxLCBhcnJheTIsIGluZGV4MSwgaW5kZXgyKSB7XG4gIHJldHVybiBhcnJheTFbaW5kZXgxXSA9PT0gYXJyYXkyW2luZGV4Ml07XG59O1xuXG52YXIgbGVuZ3RoTWF0cml4ID0gZnVuY3Rpb24oYXJyYXkxLCBhcnJheTIsIG1hdGNoLCBjb250ZXh0KSB7XG4gIHZhciBsZW4xID0gYXJyYXkxLmxlbmd0aDtcbiAgdmFyIGxlbjIgPSBhcnJheTIubGVuZ3RoO1xuICB2YXIgeCwgeTtcblxuICAvLyBpbml0aWFsaXplIGVtcHR5IG1hdHJpeCBvZiBsZW4xKzEgeCBsZW4yKzFcbiAgdmFyIG1hdHJpeCA9IFtsZW4xICsgMV07XG4gIGZvciAoeCA9IDA7IHggPCBsZW4xICsgMTsgeCsrKSB7XG4gICAgbWF0cml4W3hdID0gW2xlbjIgKyAxXTtcbiAgICBmb3IgKHkgPSAwOyB5IDwgbGVuMiArIDE7IHkrKykge1xuICAgICAgbWF0cml4W3hdW3ldID0gMDtcbiAgICB9XG4gIH1cbiAgbWF0cml4Lm1hdGNoID0gbWF0Y2g7XG4gIC8vIHNhdmUgc2VxdWVuY2UgbGVuZ3RocyBmb3IgZWFjaCBjb29yZGluYXRlXG4gIGZvciAoeCA9IDE7IHggPCBsZW4xICsgMTsgeCsrKSB7XG4gICAgZm9yICh5ID0gMTsgeSA8IGxlbjIgKyAxOyB5KyspIHtcbiAgICAgIGlmIChtYXRjaChhcnJheTEsIGFycmF5MiwgeCAtIDEsIHkgLSAxLCBjb250ZXh0KSkge1xuICAgICAgICBtYXRyaXhbeF1beV0gPSBtYXRyaXhbeCAtIDFdW3kgLSAxXSArIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXRyaXhbeF1beV0gPSBNYXRoLm1heChtYXRyaXhbeCAtIDFdW3ldLCBtYXRyaXhbeF1beSAtIDFdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1hdHJpeDtcbn07XG5cbnZhciBiYWNrdHJhY2sgPSBmdW5jdGlvbihtYXRyaXgsIGFycmF5MSwgYXJyYXkyLCBpbmRleDEsIGluZGV4MiwgY29udGV4dCkge1xuICBpZiAoaW5kZXgxID09PSAwIHx8IGluZGV4MiA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBzZXF1ZW5jZTogW10sXG4gICAgICBpbmRpY2VzMTogW10sXG4gICAgICBpbmRpY2VzMjogW11cbiAgICB9O1xuICB9XG5cbiAgaWYgKG1hdHJpeC5tYXRjaChhcnJheTEsIGFycmF5MiwgaW5kZXgxIC0gMSwgaW5kZXgyIC0gMSwgY29udGV4dCkpIHtcbiAgICB2YXIgc3Vic2VxdWVuY2UgPSBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgaW5kZXgxIC0gMSwgaW5kZXgyIC0gMSwgY29udGV4dCk7XG4gICAgc3Vic2VxdWVuY2Uuc2VxdWVuY2UucHVzaChhcnJheTFbaW5kZXgxIC0gMV0pO1xuICAgIHN1YnNlcXVlbmNlLmluZGljZXMxLnB1c2goaW5kZXgxIC0gMSk7XG4gICAgc3Vic2VxdWVuY2UuaW5kaWNlczIucHVzaChpbmRleDIgLSAxKTtcbiAgICByZXR1cm4gc3Vic2VxdWVuY2U7XG4gIH1cblxuICBpZiAobWF0cml4W2luZGV4MV1baW5kZXgyIC0gMV0gPiBtYXRyaXhbaW5kZXgxIC0gMV1baW5kZXgyXSkge1xuICAgIHJldHVybiBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgaW5kZXgxLCBpbmRleDIgLSAxLCBjb250ZXh0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFja3RyYWNrKG1hdHJpeCwgYXJyYXkxLCBhcnJheTIsIGluZGV4MSAtIDEsIGluZGV4MiwgY29udGV4dCk7XG4gIH1cbn07XG5cbnZhciBnZXQgPSBmdW5jdGlvbihhcnJheTEsIGFycmF5MiwgbWF0Y2gsIGNvbnRleHQpIHtcbiAgY29udGV4dCA9IGNvbnRleHQgfHwge307XG4gIHZhciBtYXRyaXggPSBsZW5ndGhNYXRyaXgoYXJyYXkxLCBhcnJheTIsIG1hdGNoIHx8IGRlZmF1bHRNYXRjaCwgY29udGV4dCk7XG4gIHZhciByZXN1bHQgPSBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgYXJyYXkxLmxlbmd0aCwgYXJyYXkyLmxlbmd0aCwgY29udGV4dCk7XG4gIGlmICh0eXBlb2YgYXJyYXkxID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYXJyYXkyID09PSAnc3RyaW5nJykge1xuICAgIHJlc3VsdC5zZXF1ZW5jZSA9IHJlc3VsdC5zZXF1ZW5jZS5qb2luKCcnKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0cy5nZXQgPSBnZXQ7XG4iLCJ2YXIgRGlmZkNvbnRleHQgPSByZXF1aXJlKCcuLi9jb250ZXh0cy9kaWZmJykuRGlmZkNvbnRleHQ7XG52YXIgUGF0Y2hDb250ZXh0ID0gcmVxdWlyZSgnLi4vY29udGV4dHMvcGF0Y2gnKS5QYXRjaENvbnRleHQ7XG52YXIgUmV2ZXJzZUNvbnRleHQgPSByZXF1aXJlKCcuLi9jb250ZXh0cy9yZXZlcnNlJykuUmV2ZXJzZUNvbnRleHQ7XG5cbnZhciBjb2xsZWN0Q2hpbGRyZW5EaWZmRmlsdGVyID0gZnVuY3Rpb24gY29sbGVjdENoaWxkcmVuRGlmZkZpbHRlcihjb250ZXh0KSB7XG4gIGlmICghY29udGV4dCB8fCAhY29udGV4dC5jaGlsZHJlbikge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgdmFyIHJlc3VsdCA9IGNvbnRleHQucmVzdWx0O1xuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY2hpbGQgPSBjb250ZXh0LmNoaWxkcmVuW2luZGV4XTtcbiAgICBpZiAodHlwZW9mIGNoaWxkLnJlc3VsdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgcmVzdWx0W2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gIH1cbiAgaWYgKHJlc3VsdCAmJiBjb250ZXh0LmxlZnRJc0FycmF5KSB7XG4gICAgcmVzdWx0Ll90ID0gJ2EnO1xuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KHJlc3VsdCkuZXhpdCgpO1xufTtcbmNvbGxlY3RDaGlsZHJlbkRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdjb2xsZWN0Q2hpbGRyZW4nO1xuXG52YXIgb2JqZWN0c0RpZmZGaWx0ZXIgPSBmdW5jdGlvbiBvYmplY3RzRGlmZkZpbHRlcihjb250ZXh0KSB7XG4gIGlmIChjb250ZXh0LmxlZnRJc0FycmF5IHx8IGNvbnRleHQubGVmdFR5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG5hbWUsIGNoaWxkLCBwcm9wZXJ0eUZpbHRlciA9IGNvbnRleHQub3B0aW9ucy5wcm9wZXJ0eUZpbHRlcjtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQubGVmdCkge1xuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHQubGVmdCwgbmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAocHJvcGVydHlGaWx0ZXIgJiYgIXByb3BlcnR5RmlsdGVyKG5hbWUsIGNvbnRleHQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY2hpbGQgPSBuZXcgRGlmZkNvbnRleHQoY29udGV4dC5sZWZ0W25hbWVdLCBjb250ZXh0LnJpZ2h0W25hbWVdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIG5hbWUpO1xuICB9XG4gIGZvciAobmFtZSBpbiBjb250ZXh0LnJpZ2h0KSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dC5yaWdodCwgbmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAocHJvcGVydHlGaWx0ZXIgJiYgIXByb3BlcnR5RmlsdGVyKG5hbWUsIGNvbnRleHQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0LmxlZnRbbmFtZV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dCh1bmRlZmluZWQsIGNvbnRleHQucmlnaHRbbmFtZV0pO1xuICAgICAgY29udGV4dC5wdXNoKGNoaWxkLCBuYW1lKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbnRleHQuY2hpbGRyZW4gfHwgY29udGV4dC5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59O1xub2JqZWN0c0RpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdvYmplY3RzJztcblxudmFyIHBhdGNoRmlsdGVyID0gZnVuY3Rpb24gbmVzdGVkUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQubmVzdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLl90KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuYW1lLCBjaGlsZDtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQuZGVsdGEpIHtcbiAgICBjaGlsZCA9IG5ldyBQYXRjaENvbnRleHQoY29udGV4dC5sZWZ0W25hbWVdLCBjb250ZXh0LmRlbHRhW25hbWVdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIG5hbWUpO1xuICB9XG4gIGNvbnRleHQuZXhpdCgpO1xufTtcbnBhdGNoRmlsdGVyLmZpbHRlck5hbWUgPSAnb2JqZWN0cyc7XG5cbnZhciBjb2xsZWN0Q2hpbGRyZW5QYXRjaEZpbHRlciA9IGZ1bmN0aW9uIGNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0IHx8ICFjb250ZXh0LmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLl90KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsZW5ndGggPSBjb250ZXh0LmNoaWxkcmVuLmxlbmd0aDtcbiAgdmFyIGNoaWxkO1xuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY2hpbGQgPSBjb250ZXh0LmNoaWxkcmVuW2luZGV4XTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHQubGVmdCwgY2hpbGQuY2hpbGROYW1lKSAmJiBjaGlsZC5yZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVsZXRlIGNvbnRleHQubGVmdFtjaGlsZC5jaGlsZE5hbWVdO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dC5sZWZ0W2NoaWxkLmNoaWxkTmFtZV0gIT09IGNoaWxkLnJlc3VsdCkge1xuICAgICAgY29udGV4dC5sZWZ0W2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gICAgfVxuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQubGVmdCkuZXhpdCgpO1xufTtcbmNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyLmZpbHRlck5hbWUgPSAnY29sbGVjdENoaWxkcmVuJztcblxudmFyIHJldmVyc2VGaWx0ZXIgPSBmdW5jdGlvbiBuZXN0ZWRSZXZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbmFtZSwgY2hpbGQ7XG4gIGZvciAobmFtZSBpbiBjb250ZXh0LmRlbHRhKSB7XG4gICAgY2hpbGQgPSBuZXcgUmV2ZXJzZUNvbnRleHQoY29udGV4dC5kZWx0YVtuYW1lXSk7XG4gICAgY29udGV4dC5wdXNoKGNoaWxkLCBuYW1lKTtcbiAgfVxuICBjb250ZXh0LmV4aXQoKTtcbn07XG5yZXZlcnNlRmlsdGVyLmZpbHRlck5hbWUgPSAnb2JqZWN0cyc7XG5cbnZhciBjb2xsZWN0Q2hpbGRyZW5SZXZlcnNlRmlsdGVyID0gZnVuY3Rpb24gY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcihjb250ZXh0KSB7XG4gIGlmICghY29udGV4dCB8fCAhY29udGV4dC5jaGlsZHJlbikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgdmFyIGRlbHRhID0ge307XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICBjaGlsZCA9IGNvbnRleHQuY2hpbGRyZW5baW5kZXhdO1xuICAgIGlmIChkZWx0YVtjaGlsZC5jaGlsZE5hbWVdICE9PSBjaGlsZC5yZXN1bHQpIHtcbiAgICAgIGRlbHRhW2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gICAgfVxuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KGRlbHRhKS5leGl0KCk7XG59O1xuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ2NvbGxlY3RDaGlsZHJlbic7XG5cbmV4cG9ydHMuY29sbGVjdENoaWxkcmVuRGlmZkZpbHRlciA9IGNvbGxlY3RDaGlsZHJlbkRpZmZGaWx0ZXI7XG5leHBvcnRzLm9iamVjdHNEaWZmRmlsdGVyID0gb2JqZWN0c0RpZmZGaWx0ZXI7XG5leHBvcnRzLnBhdGNoRmlsdGVyID0gcGF0Y2hGaWx0ZXI7XG5leHBvcnRzLmNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXI7XG5leHBvcnRzLnJldmVyc2VGaWx0ZXIgPSByZXZlcnNlRmlsdGVyO1xuZXhwb3J0cy5jb2xsZWN0Q2hpbGRyZW5SZXZlcnNlRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcjtcbiIsIi8qIGdsb2JhbCBkaWZmX21hdGNoX3BhdGNoICovXG52YXIgVEVYVF9ESUZGID0gMjtcbnZhciBERUZBVUxUX01JTl9MRU5HVEggPSA2MDtcbnZhciBjYWNoZWREaWZmUGF0Y2ggPSBudWxsO1xuXG52YXIgZ2V0RGlmZk1hdGNoUGF0Y2ggPSBmdW5jdGlvbihyZXF1aXJlZCkge1xuICAvKmpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG5cbiAgaWYgKCFjYWNoZWREaWZmUGF0Y2gpIHtcbiAgICB2YXIgaW5zdGFuY2U7XG4gICAgaWYgKHR5cGVvZiBkaWZmX21hdGNoX3BhdGNoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gYWxyZWFkeSBsb2FkZWQsIHByb2JhYmx5IGEgYnJvd3NlclxuICAgICAgaW5zdGFuY2UgPSB0eXBlb2YgZGlmZl9tYXRjaF9wYXRjaCA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIG5ldyBkaWZmX21hdGNoX3BhdGNoKCkgOiBuZXcgZGlmZl9tYXRjaF9wYXRjaC5kaWZmX21hdGNoX3BhdGNoKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGRtcE1vZHVsZU5hbWUgPSAnZGlmZl9tYXRjaF9wYXRjaF91bmNvbXByZXNzZWQnO1xuICAgICAgICB2YXIgZG1wID0gcmVxdWlyZSgnLi4vLi4vcHVibGljL2V4dGVybmFsLycgKyBkbXBNb2R1bGVOYW1lKTtcbiAgICAgICAgaW5zdGFuY2UgPSBuZXcgZG1wLmRpZmZfbWF0Y2hfcGF0Y2goKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpbnN0YW5jZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGlmICghcmVxdWlyZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ3RleHQgZGlmZl9tYXRjaF9wYXRjaCBsaWJyYXJ5IG5vdCBmb3VuZCcpO1xuICAgICAgZXJyb3IuZGlmZl9tYXRjaF9wYXRjaF9ub3RfZm91bmQgPSB0cnVlO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGNhY2hlZERpZmZQYXRjaCA9IHtcbiAgICAgIGRpZmY6IGZ1bmN0aW9uKHR4dDEsIHR4dDIpIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBhdGNoX3RvVGV4dChpbnN0YW5jZS5wYXRjaF9tYWtlKHR4dDEsIHR4dDIpKTtcbiAgICAgIH0sXG4gICAgICBwYXRjaDogZnVuY3Rpb24odHh0MSwgcGF0Y2gpIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBpbnN0YW5jZS5wYXRjaF9hcHBseShpbnN0YW5jZS5wYXRjaF9mcm9tVGV4dChwYXRjaCksIHR4dDEpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHNbMV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoIXJlc3VsdHNbMV1baV0pIHtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcigndGV4dCBwYXRjaCBmYWlsZWQnKTtcbiAgICAgICAgICAgIGVycm9yLnRleHRQYXRjaEZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGNhY2hlZERpZmZQYXRjaDtcbn07XG5cbnZhciBkaWZmRmlsdGVyID0gZnVuY3Rpb24gdGV4dHNEaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKGNvbnRleHQubGVmdFR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtaW5MZW5ndGggPSAoY29udGV4dC5vcHRpb25zICYmIGNvbnRleHQub3B0aW9ucy50ZXh0RGlmZiAmJlxuICAgIGNvbnRleHQub3B0aW9ucy50ZXh0RGlmZi5taW5MZW5ndGgpIHx8IERFRkFVTFRfTUlOX0xFTkdUSDtcbiAgaWYgKGNvbnRleHQubGVmdC5sZW5ndGggPCBtaW5MZW5ndGggfHxcbiAgICBjb250ZXh0LnJpZ2h0Lmxlbmd0aCA8IG1pbkxlbmd0aCkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGxhcmdlIHRleHQsIHRyeSB0byB1c2UgYSB0ZXh0LWRpZmYgYWxnb3JpdGhtXG4gIHZhciBkaWZmTWF0Y2hQYXRjaCA9IGdldERpZmZNYXRjaFBhdGNoKCk7XG4gIGlmICghZGlmZk1hdGNoUGF0Y2gpIHtcbiAgICAvLyBkaWZmLW1hdGNoLXBhdGNoIGxpYnJhcnkgbm90IGF2YWlsYWJsZSwgZmFsbGJhY2sgdG8gcmVndWxhciBzdHJpbmcgcmVwbGFjZVxuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBkaWZmID0gZGlmZk1hdGNoUGF0Y2guZGlmZjtcbiAgY29udGV4dC5zZXRSZXN1bHQoW2RpZmYoY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0KSwgMCwgVEVYVF9ESUZGXSkuZXhpdCgpO1xufTtcbmRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICd0ZXh0cyc7XG5cbnZhciBwYXRjaEZpbHRlciA9IGZ1bmN0aW9uIHRleHRzUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoY29udGV4dC5uZXN0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGFbMl0gIT09IFRFWFRfRElGRikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHRleHQtZGlmZiwgdXNlIGEgdGV4dC1wYXRjaCBhbGdvcml0aG1cbiAgdmFyIHBhdGNoID0gZ2V0RGlmZk1hdGNoUGF0Y2godHJ1ZSkucGF0Y2g7XG4gIGNvbnRleHQuc2V0UmVzdWx0KHBhdGNoKGNvbnRleHQubGVmdCwgY29udGV4dC5kZWx0YVswXSkpLmV4aXQoKTtcbn07XG5wYXRjaEZpbHRlci5maWx0ZXJOYW1lID0gJ3RleHRzJztcblxudmFyIHRleHREZWx0YVJldmVyc2UgPSBmdW5jdGlvbihkZWx0YSkge1xuICB2YXIgaSwgbCwgbGluZXMsIGxpbmUsIGxpbmVUbXAsIGhlYWRlciA9IG51bGwsXG4gICAgaGVhZGVyUmVnZXggPSAvXkBAICtcXC0oXFxkKyksKFxcZCspICtcXCsoXFxkKyksKFxcZCspICtAQCQvLFxuICAgIGxpbmVIZWFkZXIsIGxpbmVBZGQsIGxpbmVSZW1vdmU7XG4gIGxpbmVzID0gZGVsdGEuc3BsaXQoJ1xcbicpO1xuICBmb3IgKGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIHZhciBsaW5lU3RhcnQgPSBsaW5lLnNsaWNlKDAsIDEpO1xuICAgIGlmIChsaW5lU3RhcnQgPT09ICdAJykge1xuICAgICAgaGVhZGVyID0gaGVhZGVyUmVnZXguZXhlYyhsaW5lKTtcbiAgICAgIGxpbmVIZWFkZXIgPSBpO1xuICAgICAgbGluZUFkZCA9IG51bGw7XG4gICAgICBsaW5lUmVtb3ZlID0gbnVsbDtcblxuICAgICAgLy8gZml4IGhlYWRlclxuICAgICAgbGluZXNbbGluZUhlYWRlcl0gPSAnQEAgLScgKyBoZWFkZXJbM10gKyAnLCcgKyBoZWFkZXJbNF0gKyAnICsnICsgaGVhZGVyWzFdICsgJywnICsgaGVhZGVyWzJdICsgJyBAQCc7XG4gICAgfSBlbHNlIGlmIChsaW5lU3RhcnQgPT09ICcrJykge1xuICAgICAgbGluZUFkZCA9IGk7XG4gICAgICBsaW5lc1tpXSA9ICctJyArIGxpbmVzW2ldLnNsaWNlKDEpO1xuICAgICAgaWYgKGxpbmVzW2kgLSAxXS5zbGljZSgwLCAxKSA9PT0gJysnKSB7XG4gICAgICAgIC8vIHN3YXAgbGluZXMgdG8ga2VlcCBkZWZhdWx0IG9yZGVyICgtKylcbiAgICAgICAgbGluZVRtcCA9IGxpbmVzW2ldO1xuICAgICAgICBsaW5lc1tpXSA9IGxpbmVzW2kgLSAxXTtcbiAgICAgICAgbGluZXNbaSAtIDFdID0gbGluZVRtcDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGxpbmVTdGFydCA9PT0gJy0nKSB7XG4gICAgICBsaW5lUmVtb3ZlID0gaTtcbiAgICAgIGxpbmVzW2ldID0gJysnICsgbGluZXNbaV0uc2xpY2UoMSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn07XG5cbnZhciByZXZlcnNlRmlsdGVyID0gZnVuY3Rpb24gdGV4dHNSZXZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKGNvbnRleHQubmVzdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhWzJdICE9PSBURVhUX0RJRkYpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB0ZXh0LWRpZmYsIHVzZSBhIHRleHQtZGlmZiBhbGdvcml0aG1cbiAgY29udGV4dC5zZXRSZXN1bHQoW3RleHREZWx0YVJldmVyc2UoY29udGV4dC5kZWx0YVswXSksIDAsIFRFWFRfRElGRl0pLmV4aXQoKTtcbn07XG5yZXZlcnNlRmlsdGVyLmZpbHRlck5hbWUgPSAndGV4dHMnO1xuXG5leHBvcnRzLmRpZmZGaWx0ZXIgPSBkaWZmRmlsdGVyO1xuZXhwb3J0cy5wYXRjaEZpbHRlciA9IHBhdGNoRmlsdGVyO1xuZXhwb3J0cy5yZXZlcnNlRmlsdGVyID0gcmV2ZXJzZUZpbHRlcjtcbiIsInZhciBpc0FycmF5ID0gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSA/XG4gIC8vIHVzZSBuYXRpdmUgZnVuY3Rpb25cbiAgQXJyYXkuaXNBcnJheSA6XG4gIC8vIHVzZSBpbnN0YW5jZW9mIG9wZXJhdG9yXG4gIGZ1bmN0aW9uKGEpIHtcbiAgICByZXR1cm4gYSBpbnN0YW5jZW9mIEFycmF5O1xuICB9O1xuXG52YXIgZGlmZkZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxNYXRjaGVzRGlmZkZpbHRlcihjb250ZXh0KSB7XG4gIGlmIChjb250ZXh0LmxlZnQgPT09IGNvbnRleHQucmlnaHQpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBjb250ZXh0LmxlZnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Z1bmN0aW9ucyBhcmUgbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIDAsIDBdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0eXBlb2YgY29udGV4dC5sZWZ0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmdW5jdGlvbnMgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxuICBjb250ZXh0LmxlZnRUeXBlID0gY29udGV4dC5sZWZ0ID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGNvbnRleHQubGVmdDtcbiAgY29udGV4dC5yaWdodFR5cGUgPSBjb250ZXh0LnJpZ2h0ID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGNvbnRleHQucmlnaHQ7XG4gIGlmIChjb250ZXh0LmxlZnRUeXBlICE9PSBjb250ZXh0LnJpZ2h0VHlwZSkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmxlZnRUeXBlID09PSAnYm9vbGVhbicgfHwgY29udGV4dC5sZWZ0VHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5sZWZ0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb250ZXh0LmxlZnRJc0FycmF5ID0gaXNBcnJheShjb250ZXh0LmxlZnQpO1xuICB9XG4gIGlmIChjb250ZXh0LnJpZ2h0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb250ZXh0LnJpZ2h0SXNBcnJheSA9IGlzQXJyYXkoY29udGV4dC5yaWdodCk7XG4gIH1cbiAgaWYgKGNvbnRleHQubGVmdElzQXJyYXkgIT09IGNvbnRleHQucmlnaHRJc0FycmF5KSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQubGVmdCwgY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbn07XG5kaWZmRmlsdGVyLmZpbHRlck5hbWUgPSAndHJpdmlhbCc7XG5cbnZhciBwYXRjaEZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxNYXRjaGVzUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAodHlwZW9mIGNvbnRleHQuZGVsdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoY29udGV4dC5sZWZ0KS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnRleHQubmVzdGVkID0gIWlzQXJyYXkoY29udGV4dC5kZWx0YSk7XG4gIGlmIChjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5sZW5ndGggPT09IDEpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChjb250ZXh0LmRlbHRhWzBdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLmxlbmd0aCA9PT0gMikge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQuZGVsdGFbMV0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEubGVuZ3RoID09PSAzICYmIGNvbnRleHQuZGVsdGFbMl0gPT09IDApIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbn07XG5wYXRjaEZpbHRlci5maWx0ZXJOYW1lID0gJ3RyaXZpYWwnO1xuXG52YXIgcmV2ZXJzZUZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxSZWZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKHR5cGVvZiBjb250ZXh0LmRlbHRhID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQuZGVsdGEpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dC5uZXN0ZWQgPSAhaXNBcnJheShjb250ZXh0LmRlbHRhKTtcbiAgaWYgKGNvbnRleHQubmVzdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmRlbHRhWzBdLCAwLCAwXSkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5sZW5ndGggPT09IDIpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5kZWx0YVsxXSwgY29udGV4dC5kZWx0YVswXV0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEubGVuZ3RoID09PSAzICYmIGNvbnRleHQuZGVsdGFbMl0gPT09IDApIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5kZWx0YVswXV0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbn07XG5yZXZlcnNlRmlsdGVyLmZpbHRlck5hbWUgPSAndHJpdmlhbCc7XG5cbmV4cG9ydHMuZGlmZkZpbHRlciA9IGRpZmZGaWx0ZXI7XG5leHBvcnRzLnBhdGNoRmlsdGVyID0gcGF0Y2hGaWx0ZXI7XG5leHBvcnRzLnJldmVyc2VGaWx0ZXIgPSByZXZlcnNlRmlsdGVyO1xuIiwiXG52YXIgZW52aXJvbm1lbnQgPSByZXF1aXJlKCcuL2Vudmlyb25tZW50Jyk7XG5cbnZhciBEaWZmUGF0Y2hlciA9IHJlcXVpcmUoJy4vZGlmZnBhdGNoZXInKS5EaWZmUGF0Y2hlcjtcbmV4cG9ydHMuRGlmZlBhdGNoZXIgPSBEaWZmUGF0Y2hlcjtcblxuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgcmV0dXJuIG5ldyBEaWZmUGF0Y2hlcihvcHRpb25zKTtcbn07XG5cbmV4cG9ydHMuZGF0ZVJldml2ZXIgPSByZXF1aXJlKCcuL2RhdGUtcmV2aXZlcicpO1xuXG52YXIgZGVmYXVsdEluc3RhbmNlO1xuXG5leHBvcnRzLmRpZmYgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFkZWZhdWx0SW5zdGFuY2UpIHtcbiAgICBkZWZhdWx0SW5zdGFuY2UgPSBuZXcgRGlmZlBhdGNoZXIoKTtcbiAgfVxuICByZXR1cm4gZGVmYXVsdEluc3RhbmNlLmRpZmYuYXBwbHkoZGVmYXVsdEluc3RhbmNlLCBhcmd1bWVudHMpO1xufTtcblxuZXhwb3J0cy5wYXRjaCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWRlZmF1bHRJbnN0YW5jZSkge1xuICAgIGRlZmF1bHRJbnN0YW5jZSA9IG5ldyBEaWZmUGF0Y2hlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UucGF0Y2guYXBwbHkoZGVmYXVsdEluc3RhbmNlLCBhcmd1bWVudHMpO1xufTtcblxuZXhwb3J0cy51bnBhdGNoID0gZnVuY3Rpb24oKSB7XG4gIGlmICghZGVmYXVsdEluc3RhbmNlKSB7XG4gICAgZGVmYXVsdEluc3RhbmNlID0gbmV3IERpZmZQYXRjaGVyKCk7XG4gIH1cbiAgcmV0dXJuIGRlZmF1bHRJbnN0YW5jZS51bnBhdGNoLmFwcGx5KGRlZmF1bHRJbnN0YW5jZSwgYXJndW1lbnRzKTtcbn07XG5cbmV4cG9ydHMucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWRlZmF1bHRJbnN0YW5jZSkge1xuICAgIGRlZmF1bHRJbnN0YW5jZSA9IG5ldyBEaWZmUGF0Y2hlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UucmV2ZXJzZS5hcHBseShkZWZhdWx0SW5zdGFuY2UsIGFyZ3VtZW50cyk7XG59O1xuXG5pZiAoZW52aXJvbm1lbnQuaXNCcm93c2VyKSB7XG4gIGV4cG9ydHMuaG9tZXBhZ2UgPSAne3twYWNrYWdlLWhvbWVwYWdlfX0nO1xuICBleHBvcnRzLnZlcnNpb24gPSAne3twYWNrYWdlLXZlcnNpb259fSc7XG59IGVsc2Uge1xuICB2YXIgcGFja2FnZUluZm9Nb2R1bGVOYW1lID0gJy4uL3BhY2thZ2UuanNvbic7XG4gIHZhciBwYWNrYWdlSW5mbyA9IHJlcXVpcmUocGFja2FnZUluZm9Nb2R1bGVOYW1lKTtcbiAgZXhwb3J0cy5ob21lcGFnZSA9IHBhY2thZ2VJbmZvLmhvbWVwYWdlO1xuICBleHBvcnRzLnZlcnNpb24gPSBwYWNrYWdlSW5mby52ZXJzaW9uO1xuXG4gIHZhciBmb3JtYXR0ZXJNb2R1bGVOYW1lID0gJy4vZm9ybWF0dGVycyc7XG4gIHZhciBmb3JtYXR0ZXJzID0gcmVxdWlyZShmb3JtYXR0ZXJNb2R1bGVOYW1lKTtcbiAgZXhwb3J0cy5mb3JtYXR0ZXJzID0gZm9ybWF0dGVycztcbiAgLy8gc2hvcnRjdXQgZm9yIGNvbnNvbGVcbiAgZXhwb3J0cy5jb25zb2xlID0gZm9ybWF0dGVycy5jb25zb2xlO1xufVxuIiwidmFyIFBpcGUgPSBmdW5jdGlvbiBQaXBlKG5hbWUpIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5maWx0ZXJzID0gW107XG59O1xuXG5QaXBlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgaWYgKCF0aGlzLnByb2Nlc3Nvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYWRkIHRoaXMgcGlwZSB0byBhIHByb2Nlc3NvciBiZWZvcmUgdXNpbmcgaXQnKTtcbiAgfVxuICB2YXIgZGVidWcgPSB0aGlzLmRlYnVnO1xuICB2YXIgbGVuZ3RoID0gdGhpcy5maWx0ZXJzLmxlbmd0aDtcbiAgdmFyIGNvbnRleHQgPSBpbnB1dDtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIHZhciBmaWx0ZXIgPSB0aGlzLmZpbHRlcnNbaW5kZXhdO1xuICAgIGlmIChkZWJ1Zykge1xuICAgICAgdGhpcy5sb2coJ2ZpbHRlcjogJyArIGZpbHRlci5maWx0ZXJOYW1lKTtcbiAgICB9XG4gICAgZmlsdGVyKGNvbnRleHQpO1xuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcgJiYgY29udGV4dC5leGl0aW5nKSB7XG4gICAgICBjb250ZXh0LmV4aXRpbmcgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoIWNvbnRleHQubmV4dCAmJiB0aGlzLnJlc3VsdENoZWNrKSB7XG4gICAgdGhpcy5yZXN1bHRDaGVjayhjb250ZXh0KTtcbiAgfVxufTtcblxuUGlwZS5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24obXNnKSB7XG4gIGNvbnNvbGUubG9nKCdbanNvbmRpZmZwYXRjaF0gJyArIHRoaXMubmFtZSArICcgcGlwZSwgJyArIG1zZyk7XG59O1xuXG5QaXBlLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5maWx0ZXJzLnB1c2guYXBwbHkodGhpcy5maWx0ZXJzLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblBpcGUucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5maWx0ZXJzLnVuc2hpZnQuYXBwbHkodGhpcy5maWx0ZXJzLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblBpcGUucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihmaWx0ZXJOYW1lKSB7XG4gIGlmICghZmlsdGVyTmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignYSBmaWx0ZXIgbmFtZSBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmZpbHRlcnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgdmFyIGZpbHRlciA9IHRoaXMuZmlsdGVyc1tpbmRleF07XG4gICAgaWYgKGZpbHRlci5maWx0ZXJOYW1lID09PSBmaWx0ZXJOYW1lKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignZmlsdGVyIG5vdCBmb3VuZDogJyArIGZpbHRlck5hbWUpO1xufTtcblxuUGlwZS5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbmFtZXMgPSBbXTtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZmlsdGVycy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICB2YXIgZmlsdGVyID0gdGhpcy5maWx0ZXJzW2luZGV4XTtcbiAgICBuYW1lcy5wdXNoKGZpbHRlci5maWx0ZXJOYW1lKTtcbiAgfVxuICByZXR1cm4gbmFtZXM7XG59O1xuXG5QaXBlLnByb3RvdHlwZS5hZnRlciA9IGZ1bmN0aW9uKGZpbHRlck5hbWUpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGZpbHRlck5hbWUpO1xuICB2YXIgcGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgaWYgKCFwYXJhbXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhIGZpbHRlciBpcyByZXF1aXJlZCcpO1xuICB9XG4gIHBhcmFtcy51bnNoaWZ0KGluZGV4ICsgMSwgMCk7XG4gIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkodGhpcy5maWx0ZXJzLCBwYXJhbXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblBpcGUucHJvdG90eXBlLmJlZm9yZSA9IGZ1bmN0aW9uKGZpbHRlck5hbWUpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGZpbHRlck5hbWUpO1xuICB2YXIgcGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgaWYgKCFwYXJhbXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhIGZpbHRlciBpcyByZXF1aXJlZCcpO1xuICB9XG4gIHBhcmFtcy51bnNoaWZ0KGluZGV4LCAwKTtcbiAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSh0aGlzLmZpbHRlcnMsIHBhcmFtcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUGlwZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5maWx0ZXJzLmxlbmd0aCA9IDA7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUGlwZS5wcm90b3R5cGUuc2hvdWxkSGF2ZVJlc3VsdCA9IGZ1bmN0aW9uKHNob3VsZCkge1xuICBpZiAoc2hvdWxkID09PSBmYWxzZSkge1xuICAgIHRoaXMucmVzdWx0Q2hlY2sgPSBudWxsO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5yZXN1bHRDaGVjaykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcGlwZSA9IHRoaXM7XG4gIHRoaXMucmVzdWx0Q2hlY2sgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYgKCFjb250ZXh0Lmhhc1Jlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coY29udGV4dCk7XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IocGlwZS5uYW1lICsgJyBmYWlsZWQnKTtcbiAgICAgIGVycm9yLm5vUmVzdWx0ID0gdHJ1ZTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5leHBvcnRzLlBpcGUgPSBQaXBlO1xuIiwiXG52YXIgUHJvY2Vzc29yID0gZnVuY3Rpb24gUHJvY2Vzc29yKG9wdGlvbnMpe1xuICB0aGlzLnNlbGZPcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5waXBlcyA9IHt9O1xufTtcblxuUHJvY2Vzc29yLnByb3RvdHlwZS5vcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBpZiAob3B0aW9ucykge1xuICAgIHRoaXMuc2VsZk9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG4gIHJldHVybiB0aGlzLnNlbGZPcHRpb25zO1xufTtcblxuUHJvY2Vzc29yLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24obmFtZSwgcGlwZSkge1xuICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBwaXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMucGlwZXNbbmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGlwZXNbbmFtZV0gPSBwaXBlO1xuICAgIH1cbiAgfVxuICBpZiAobmFtZSAmJiBuYW1lLm5hbWUpIHtcbiAgICBwaXBlID0gbmFtZTtcbiAgICBpZiAocGlwZS5wcm9jZXNzb3IgPT09IHRoaXMpIHsgcmV0dXJuIHBpcGU7IH1cbiAgICB0aGlzLnBpcGVzW3BpcGUubmFtZV0gPSBwaXBlO1xuICB9XG4gIHBpcGUucHJvY2Vzc29yID0gdGhpcztcbiAgcmV0dXJuIHBpcGU7XG59O1xuXG5Qcm9jZXNzb3IucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbihpbnB1dCwgcGlwZSkge1xuICB2YXIgY29udGV4dCA9IGlucHV0O1xuICBjb250ZXh0Lm9wdGlvbnMgPSB0aGlzLm9wdGlvbnMoKTtcbiAgdmFyIG5leHRQaXBlID0gcGlwZSB8fCBpbnB1dC5waXBlIHx8ICdkZWZhdWx0JztcbiAgdmFyIGxhc3RQaXBlLCBsYXN0Q29udGV4dDtcbiAgd2hpbGUgKG5leHRQaXBlKSB7XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0Lm5leHRBZnRlckNoaWxkcmVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gY2hpbGRyZW4gcHJvY2Vzc2VkIGFuZCBjb21pbmcgYmFjayB0byBwYXJlbnRcbiAgICAgIGNvbnRleHQubmV4dCA9IGNvbnRleHQubmV4dEFmdGVyQ2hpbGRyZW47XG4gICAgICBjb250ZXh0Lm5leHRBZnRlckNoaWxkcmVuID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5leHRQaXBlID09PSAnc3RyaW5nJykge1xuICAgICAgbmV4dFBpcGUgPSB0aGlzLnBpcGUobmV4dFBpcGUpO1xuICAgIH1cbiAgICBuZXh0UGlwZS5wcm9jZXNzKGNvbnRleHQpO1xuICAgIGxhc3RDb250ZXh0ID0gY29udGV4dDtcbiAgICBsYXN0UGlwZSA9IG5leHRQaXBlO1xuICAgIG5leHRQaXBlID0gbnVsbDtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgaWYgKGNvbnRleHQubmV4dCkge1xuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5uZXh0O1xuICAgICAgICBuZXh0UGlwZSA9IGxhc3RDb250ZXh0Lm5leHRQaXBlIHx8IGNvbnRleHQucGlwZSB8fCBsYXN0UGlwZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQuaGFzUmVzdWx0ID8gY29udGV4dC5yZXN1bHQgOiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnRzLlByb2Nlc3NvciA9IFByb2Nlc3NvcjtcbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlLCBicm93c2VyOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIFNrYXJ5bmFcbn1cbmZyb20gJy4vc2thcnluYSc7XG5cbmltcG9ydCB7XG4gICAgcXVlcnlcbn1cbmZyb20gJ3BhZ2VvYmplY3Rtb2RlbC9zcmMvdXRpbCc7XG5cbnF1ZXJ5KGRvY3VtZW50LmJvZHksICdbZGF0YS1za2FyeW5hXScpXG4gICAgLmZvckVhY2goZWxlbWVudCA9PiBTa2FyeW5hLmluaXRFZGl0b3IoZWxlbWVudCkpO1xuXG53aW5kb3cuU2thcnluYSA9IFNrYXJ5bmE7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSwgYnJvd3Nlcjp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IHtcbiAgICBmcm9tSFRNTFxufVxuZnJvbSAncGFnZW9iamVjdG1vZGVsL3NyYy9wYXJzZXIvZnJvbUhUTUwnO1xuXG5pbXBvcnQge1xuICAgIGZyb21QT01cbn1cbmZyb20gJ3BhZ2VvYmplY3Rtb2RlbC9zcmMvcGFyc2VyL2Zyb21QT00nO1xuXG5pbXBvcnQge1xuICAgIHRvSFRNTFxufVxuZnJvbSAncGFnZW9iamVjdG1vZGVsL3NyYy9zZXJpYWxpemVyL3RvSFRNTCc7XG5cbmltcG9ydCB7XG4gICAgRmllbGRzXG59XG5mcm9tICdwYWdlb2JqZWN0bW9kZWwvc3JjL2RvY3VtZW50JztcblxuaW1wb3J0IHtcbiAgICBFbWl0dGVyXG59XG5mcm9tICdwYWdlb2JqZWN0bW9kZWwvc3JjL2VtaXR0ZXInO1xuXG5pbXBvcnQge1xuICAgIGRpZmZcbn1cbmZyb20gJ2pzb25kaWZmcGF0Y2gnO1xuXG5jb25zdCBERUZBVUxUX0RPQ1VNRU5UID0gJyNkZWZhdWx0JztcblxuY29uc3RcbiAgICBCQUNLU1BBQ0UgPSA4LFxuICAgIFRBQiA9IDksXG4gICAgRU5URVIgPSAxMyxcbiAgICBTSElGVCA9IDE2LFxuICAgIENBUFMgPSAyMCxcbiAgICBFU0MgPSAyNyxcbiAgICBTUEFDRSA9IDMyLFxuICAgIFVQID0gMzgsXG4gICAgRE9XTiA9IDQwLFxuICAgIERFTEVURSA9IDQ2LFxuICAgIFBSRVZFTlQgPSBbRU5URVJdO1xuXG5jb25zdCBTVFlMRVMgPSBgXG5bZGF0YS1za2FyeW5hXSwgW2RhdGEtc2thcnluYV0gKiB7IG91dGxpbmU6IG5vbmU7IH1cbmA7XG5cbigoKSA9PiB7XG4gICAgbGV0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5pbm5lclRleHQgPSBTVFlMRVM7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdHlsZSk7XG59KSgpO1xuXG4vKipcbiAqIEBjbGFzc1xuICogQG5hbWUgWEhSXG4gKi9cbmV4cG9ydCBjbGFzcyBYSFIge1xuICAgIC8qKlxuICAgICAqIFJlcmZvcm0gYXN5bmNocm91bm91cyByZXF1ZXN0XG4gICAgICogQHBhcmFtICAge3N0aXJuZ30gIHBhdGggICBVUkwgdG8gcmVzb3VyY2VcbiAgICAgKiBAcGFyYW0gICB7c3RyaW5nfSAgbWV0aG9kIEhUVFAgbWV0aG9kIHRvIGJlIHVzZWRcbiAgICAgKiBAcGFyYW0gICB7bWl4ZWR9ICAgZGF0YSAgIGRhdGEgdG8gYmUgc2VudCBpbiBwb3N0IG9yIHB1dFxuICAgICAqIEBwYXJhbSAgIHtib29sZWFufSByYXcgICAgaWYgc2hvdWxkIG5vdCBwYXJzZSByZXNwb25zZSBhcyBKU09OXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgc3RhdGljIGFqYXgocGF0aCwgbWV0aG9kLCBkYXRhLCByYXcpIHtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICAgICAgICAgICAgICAgICAgaHR0cE1ldGhvZCA9IG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgeGhyLm9wZW4oaHR0cE1ldGhvZCwgcGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKGh0dHBNZXRob2QgPT09ICdwb3N0JyB8fCBodHRwTWV0aG9kID09PSAncHV0Jykge1xuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgRE9ORSA9IDQsIC8vIHJlYWR5U3RhdGUgNCBtZWFucyB0aGUgcmVxdWVzdCBpcyBkb25lLlxuICAgICAgICAgICAgICAgICAgICAgICAgT0sgPSAyMDA7IC8vIHN0YXR1cyAyMDAgaXMgYSBzdWNjZXNzZnVsIHJldHVybi5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSBET05FKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gT0spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZVRleHQpOyAvLyAnVGhpcyBpcyB0aGUgcmV0dXJuZWQgdGV4dC4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHhoci5zdGF0dXMgPT09ICcyMDQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRXJyb3I6ICcgKyB4aHIuc3RhdHVzKSk7IC8vIEFuIGVycm9yIG9jY3VycmVkIGR1cmluZyB0aGUgcmVxdWVzdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB4aHIuc2VuZChkYXRhID8gKHJhdyA/IGRhdGEgOiBKU09OLnN0cmluZ2lmeShkYXRhKSkgOiBudWxsKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1zIEdFVCByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBwYXRoIFVSTCB0byByZXNvdXJjZVxuICAgICAgICAgKiBAcGFyYW0gICB7Ym9vbGVhbn0gcmF3ICAgaWYgc2hvdWxkIG5vdCBwYXJzZSByZXNwb25zZSBhcyBKU09OXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICBzdGF0aWMgZ2V0KHBhdGgsIHJhdykge1xuICAgICAgICAgICAgcmV0dXJuIFhIUi5hamF4KHBhdGgsICdnZXQnLCBudWxsLCByYXcpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQZXJmb3JtcyBQT1NUIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtICAge3N0cmluZ30gIHBhdGggVVJMIHRvIHJlc291cmNlXG4gICAgICAgICAqIEBwYXJhbSAgIHtib29sZWFufSByYXcgIGlmIHNob3VsZCBub3QgcGFyc2UgcmVzcG9uc2UgYXMgSlNPTlxuICAgICAgICAgKiBAcGFyYW0gICB7bWl4ZWR9ICAgZGF0YSBkYXRhIHRvIGJlIHNlbnRcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICAgICAqL1xuICAgIHN0YXRpYyBwb3N0KHBhdGgsIGRhdGEsIHJhdykge1xuICAgICAgICAgICAgcmV0dXJuIFhIUi5hamF4KHBhdGgsICdwb3N0JywgZGF0YSwgcmF3KTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgUFVUIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtICAge3N0cmluZ30gIHBhdGggVVJMIHRvIHJlc291cmNlXG4gICAgICAgICAqIEBwYXJhbSAgIHtib29sZWFufSByYXcgIGlmIHNob3VsZCBub3QgcGFyc2UgcmVzcG9uc2UgYXMgSlNPTlxuICAgICAgICAgKiBAcGFyYW0gICB7bWl4ZWR9ICAgZGF0YSBkYXRhIHRvIGJlIHNlbnRcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICAgICAqL1xuICAgIHN0YXRpYyBwdXQocGF0aCwgZGF0YSwgcmF3KSB7XG4gICAgICAgICAgICByZXR1cm4gWEhSLmFqYXgocGF0aCwgJ3B1dCcsIGRhdGEsIHJhdyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1zIERFTEVURSByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSAgIHtzdHJpbmd9ICBwYXRoIFVSTCB0byByZXNvdXJjZVxuICAgICAgICAgKiBAcGFyYW0gICB7Ym9vbGVhbn0gcmF3ICAgaWYgc2hvdWxkIG5vdCBwYXJzZSByZXNwb25zZSBhcyBKU09OXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICBzdGF0aWMgZGVsZXRlKHBhdGgsIHJhdykge1xuICAgICAgICByZXR1cm4gWEhSLmFqYXgocGF0aCwgJ2RlbGV0ZScsIG51bGwsIHJhdyk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogQGNsYXNzXG4gKiBAbmFtZSBSZXBvc2l0b3J5XG4gKiBAZXh0ZW5kcyBFbWl0dGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXBvc2l0b3J5IGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkge29iamVjdH0gZG9jdW1lbnRzIGhhc2htYXBcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IGRvY3VtZW50cygpIHtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRzID0gdGhpcy5fZG9jdW1lbnRzIHx8IHt9O1xuICAgICAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBjYWNoZSBoYXNobWFwXG4gICAgICovXG4gICAgc3RhdGljIGdldCBjYWNoZSgpIHtcbiAgICAgICAgdGhpcy5fY2FjaGUgPSB0aGlzLl9jYWNoZSB8fCB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcG9ydHMgY2hhbmdlL3VwZGF0ZSBpbiBkb2N1bWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb2MgICAgICAgICAgICAgbmFtZSBvZiBkb2N1bWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gcGF0aCAgcGF0aCBpbiBkb2N1bWVudCBvciB1bmRlZmluZWQgaWYgd2hvbGUgZG9jdW1lbnQgaGFzIHVwZGF0ZWRcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZsdXNoQ2FjaGUgICAgIGlmIHNob3VsZCBjbGVhciBjYWNoZWQgdmVyc2lvbiAodXNlZCBmb3IgZGlmZilcbiAgICAgKiBAcGFyYW0ge21peGVkfSAgdmFsdWUgICAgICAgICAgIG5ldyBjb250ZW50XG4gICAgICovXG4gICAgc3RhdGljIHJlcG9ydChkb2MsIHBhdGgsIHZhbHVlLCBmbHVzaENhY2hlKSB7XG4gICAgICAgIGxldCBkb2NzID0gdGhpcy5kb2N1bWVudHMsXG4gICAgICAgICAgICBjYWNoZSA9IHRoaXMuY2FjaGU7XG5cbiAgICAgICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZG9jc1tkb2NdID0gdmFsdWU7XG4gICAgICAgICAgICBjYWNoZVtkb2NdID0gdmFsdWUudG9KU09OKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWRvY3MuaGFzT3duUHJvcGVydHkoZG9jKSkge1xuICAgICAgICAgICAgICAgIGRvY3NbZG9jXSA9IG5ldyBGaWVsZHMoKTtcbiAgICAgICAgICAgICAgICBjYWNoZVtkb2NdID0gZG9jc1tkb2NdLnRvSlNPTigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9jc1tkb2NdLnNldChwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICBkb2M6IGRvYyxcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICBpZDogdmFsdWUubmFtZVxuICAgICAgICB9KTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BvbScpLmlubmVyVGV4dCA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZG9jdW1lbnRzLCBudWxsLCAyKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGF0dHIoZWxlbWVudCwgYXR0cmlidXRlLCBmYWxsYmFjaykge1xuICAgIGlmICghZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xuICAgICAgICByZXR1cm4gZmFsbGJhY2s7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpLnRvU3RyaW5nKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBTa2FyeW5hIHtcblxuICAgIHN0YXRpYyBnZXQgZWRpdG9ycygpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9ycyA9IHRoaXMuX2VkaXRvcnMgfHwgW107XG4gICAgICAgIHJldHVybiB0aGlzLl9lZGl0b3JzO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbml0RWRpdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICBhbGxvdzogYXR0cihlbGVtZW50LCAnZGF0YS1za2FyeW5hLWFsbG93JywgJyonKS5zcGxpdCgvXFxzKixcXHMqLyksXG4gICAgICAgICAgICAgICAgcGF0aDogYXR0cihlbGVtZW50LCAnZGF0YS1za2FyeW5hLXBhdGgnKSxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogYXR0cihlbGVtZW50LCAncGxhY2Vob2xkZXInKSxcbiAgICAgICAgICAgICAgICBkb2M6IGF0dHIoZWxlbWVudCwgJ2RhdGEtc2thcnluYS1kb2MnLCBERUZBVUxUX0RPQ1VNRU5UKSxcbiAgICAgICAgICAgICAgICB2YXJpYW50OiBhdHRyKGVsZW1lbnQsICdkYXRhLXNrYXJ5bmEtdmFyaWFudCcpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWRpdG9yID0gbmV3IFNrYXJ5bmEoZWxlbWVudCwgY29uZmlnKTtcbiAgICAgICAgU2thcnluYS5lZGl0b3JzLnB1c2goZWRpdG9yKTtcbiAgICAgICAgcmV0dXJuIGVkaXRvcjtcbiAgICB9XG5cbiAgICBzdGF0aWMgbG9hZChwYXRoLCBhc0RvY3VtZW50KSB7XG4gICAgICAgIHJldHVybiBYSFJcbiAgICAgICAgICAgIC5nZXQocGF0aClcbiAgICAgICAgICAgIC50aGVuKGNvbnRlbnQgPT4gZnJvbVBPTShKU09OLnBhcnNlKGNvbnRlbnQpKSlcbiAgICAgICAgICAgIC50aGVuKHBvbSA9PiBSZXBvc2l0b3J5LnJlcG9ydChhc0RvY3VtZW50IHx8IERFRkFVTFRfRE9DVU1FTlQsIHVuZGVmaW5lZCwgcG9tKSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgUmVwb3NpdG9yeS5vbignY2hhbmdlJywgdGhpcy5vblJlcG9zaXRvcnlVcGRhdGUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucmVhZHkgPVxuICAgICAgICAgICAgZnJvbUhUTUwoZWxlbWVudClcbiAgICAgICAgICAgIC50aGVuKGNvbnRlbnQgPT4ge1xuICAgICAgICAgICAgICAgIFJlcG9zaXRvcnkucmVwb3J0KGNvbmZpZy5kb2MsIGNvbmZpZy5wYXRoLCBjb250ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlZHJhd0VkaXRvcigpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgbm9kZSA9IFJlcG9zaXRvcnkuZG9jdW1lbnRzW3RoaXMuX2NvbmZpZy5kb2NdO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb25maWcucGF0aCkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUuZ2V0KHRoaXMuX2NvbmZpZy5wYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub2RlICYmIG5vZGUudHlwZSA9PT0gJ1ZhcmlhbnRzJyAmJiBub2RlLmJlc3QpIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLmJlc3QodGhpcy5fY29uZmlnLnZhcmlhbnQgfHwgJyonKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vZGUuZGVjb3JhdGUoc2VsZi5lbGVtZW50KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VsZi5vbktleVVwLmJpbmQoc2VsZikpO1xuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc2VsZi5vbk1vdXNlRG93bi5iaW5kKHNlbGYpKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRFbGVtZW50KGVsZW1lbnQpIHtcblxuICAgICAgICBsZXQgZG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50IHx8IGVsZW1lbnQuZG9jdW1lbnQsXG4gICAgICAgICAgICB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdyxcbiAgICAgICAgICAgIHNlbCxcbiAgICAgICAgICAgIG5vZGU7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB3aW4uZ2V0U2VsZWN0aW9uICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzZWwgPSB3aW4uZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWwgPSBkb2Muc2VsZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9kZSA9IHNlbC5mb2N1c05vZGU7XG5cbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gdGhpcy5nZXRFZGl0YWJsZU5vZGUobm9kZSk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjdXJyZW50LWVsZW1lbnQnKS5pbm5lclRleHQgPSBub2RlLm91dGVySFRNTDtcbiAgICAgICAgZnJvbUhUTUwobm9kZSlcbiAgICAgICAgICAgIC50aGVuKFBPTSA9PiB7XG5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY3VycmVudC1ub2RlJykuaW5uZXJUZXh0ID0gSlNPTi5zdHJpbmdpZnkoUE9NLCBudWxsLCAyKTtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkaWZmJykuaW5uZXJIVE1MID0gSlNPTi5zdHJpbmdpZnkoZGlmZihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KFJlcG9zaXRvcnkuZG9jdW1lbnRzKSksUmVwb3NpdG9yeS5jYWNoZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIGdldEVkaXRhYmxlTm9kZShub2RlKSB7XG4gICAgICAgIHdoaWxlIChub2RlICYmICghbm9kZS5oYXNBdHRyaWJ1dGUgfHwgIW5vZGUuaGFzQXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtaWQnKSkpIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBrZXkgdXAgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgICAqL1xuICAgIG9uS2V5VXAoZXZlbnQpIHtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRFbGVtZW50KGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChQUkVWRU5ULmluZGV4T2YoZXZlbnQua2V5Q29kZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAvL3RoaXMub3duQWN0aW9uKGV2ZW50LmtleUNvZGUsIGN1cnJlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmVsZW1lbnRVcGRhdGVkKGN1cnJlbnQpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uTW91c2VEb3duKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZ2V0Q3VycmVudEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcbiAgICB9XG5cbiAgICBvblJlcG9zaXRvcnlVcGRhdGUoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEuZG9jICE9PSB0aGlzLl9jb25maWcuZG9jKSByZXR1cm47XG4gICAgICAgIGlmIChldmVudC5kYXRhLnBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5yZWRyYXdFZGl0b3IoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVsZW1lbnRVcGRhdGVkKGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBmcm9tSFRNTChlbGVtZW50KVxuICAgICAgICAgICAgLnRoZW4ocG9tID0+IHtcbiAgICAgICAgICAgICAgICBwb20ubmFtZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtaWQnKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIFJlcG9zaXRvcnkucmVwb3J0KHNlbGYuX2NvbmZpZy5kb2MsICdAJyArIHBvbS5uYW1lLCBwb20pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19
