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

import {
    fromHTML
}
from 'pageobjectmodel/src/parser/fromHTML';

import {
    fromPOM
}
from 'pageobjectmodel/src/parser/fromPOM';

import {
    toHTML
}
from 'pageobjectmodel/src/serializer/toHTML';

import {
    Fields
}
from 'pageobjectmodel/src/document';

import {
    Emitter
}
from 'pageobjectmodel/src/emitter';

const DEFAULT_DOCUMENT = '#default';

const
    BACKSPACE = 8,
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
export class XHR {
    /**
     * Rerform asynchrounous request
     * @param   {stirng}  path   URL to resource
     * @param   {string}  method HTTP method to be used
     * @param   {mixed}   data   data to be sent in post or put
     * @param   {boolean} raw    if should not parse response as JSON
     * @returns {Promise}
     */
    static ajax(path, method, data, raw) {

            return new Promise((resolve, reject) => {

                let xhr = new XMLHttpRequest(),
                    httpMethod = method.toLowerCase();

                xhr.open(httpMethod, path);
                if (httpMethod === 'post' || httpMethod === 'put') {
                    xhr.setRequestHeader('Content-type', 'application/json');
                }

                xhr.onreadystatechange = () => {
                    let DONE = 4, // readyState 4 means the request is done.
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

                xhr.send(data ? (raw ? data : JSON.stringify(data)) : null);

            });
        }
        /**
         * Performs GET request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw   if should not parse response as JSON
         * @returns {Promise}
         */
    static get(path, raw) {
            return XHR.ajax(path, 'get', null, raw);
        }
        /**
         * Performs POST request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw  if should not parse response as JSON
         * @param   {mixed}   data data to be sent
         * @returns {Promise}
         */
    static post(path, data, raw) {
            return XHR.ajax(path, 'post', data, raw);
        }
        /**
         * Performs PUT request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw  if should not parse response as JSON
         * @param   {mixed}   data data to be sent
         * @returns {Promise}
         */
    static put(path, data, raw) {
            return XHR.ajax(path, 'put', data, raw);
        }
        /**
         * Performs DELETE request
         * @param   {string}  path URL to resource
         * @param   {boolean} raw   if should not parse response as JSON
         * @returns {Promise}
         */
    static delete(path, raw) {
        return XHR.ajax(path, 'delete', null, raw);
    }
}


/**
 * @class
 * @name Repository
 * @extends Emitter
 */
export class Repository extends Emitter {

    /**
     * @property {object} documents hashmap
     */
    static get documents() {
        this._documents = this._documents || {};
        return this._documents;
    }

    /**
     * Reports change/update in document
     * @param {string} doc             name of document
     * @param {string|undefined} path  path in document or undefined if whole document has updated
     * @param {mixed}  value           new content
     */
    static report(doc, path, value) {
        let docs = this.documents;

        if (path === undefined) {
            docs[doc] = value;
        } else {
            if (!docs.hasOwnProperty(doc)) {
                docs[doc] = new Fields();
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
}

function attr(element, attribute, fallback) {
    if (!element.hasAttribute(attribute)) {
        return fallback;
    }
    return element.getAttribute(attribute).toString();
}

export class Skaryna {

    static get editors() {
        this._editors = this._editors || [];
        return this._editors;
    }

    static initEditor(element) {
        let config = {
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

    static load(path, asDocument) {
        return XHR
            .get(path)
            .then(content => fromPOM(JSON.parse(content)))
            .then(pom => Repository.report(asDocument || DEFAULT_DOCUMENT, undefined, pom));
    }

    constructor(element, config) {
        this._config = config;
        this.element = element;
        Repository.on('change', this.onRepositoryUpdate.bind(this));
        this.ready =
            fromHTML(element)
            .then(content => {
                Repository.report(config.doc, config.path, content);
            });
    }

    redrawEditor() {
        let self = this,
            node = Repository.documents[this._config.doc];

        if (this._config.path) {
            node = node.get(this._config.path);
        }

        if (node && node.type === 'Variants' && node.best) {
            node = node.best(this._config.variant || '*');
        }

        if(!node) {
            return;
        }

        return node.decorate(self.element)
            .then(() => {
                self.element.addEventListener('keydown', self.onKeyUp.bind(self));
            });
    }

    getCurrentElement(element) {

        let doc = element.ownerDocument || element.document,
            win = doc.defaultView || doc.parentWindow,
            sel,
            node;

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

    getEditableNode(node) {
        while (node && (!node.hasAttribute || !node.hasAttribute('data-skaryna-id'))) {
            node = node.parentNode;
        }
        return node;
    }

    /**
     * Handles key up event
     * @param {Event} event
     */
    onKeyUp(event) {
        let current = this.getCurrentElement(event.target);
        if (PREVENT.indexOf(event.keyCode) !== -1) {
            event.stopPropagation();
            event.preventDefault();
            //this.ownAction(event.keyCode, current);
        } else {
            setTimeout(() => this.elementUpdated(current), 0);
        }
    }

    onRepositoryUpdate(event) {
        if (event.data.doc !== this._config.doc) return;
        if (event.data.path === undefined) {
            this.redrawEditor();
        }
    }

    elementUpdated(element) {
        let self = this;
        fromHTML(element)
            .then(pom => {
                pom.name = element.getAttribute('data-skaryna-id').toString();
                Repository.report(self._config.doc, '@' + pom.name, pom);
            });
    }
}
