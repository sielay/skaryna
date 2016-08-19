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
    Event, Emitter
}
from './emitter';

import {
    arraize
}
from './util';
import {
    repository, CHANGE, DEFAULT_DOCUMENT
}
from './repository';
import {
    toHTML
}
from './serializer/toHTML';
import {
    toPOM
}
from './serializer/toPOM';
import {
    fromHTML
}
from './parser/fromHTML';
import {
    fromPOM
}
from './parser/fromPOM';
import {
    XHR
}
from './xhr';
import {
    Variants,
    randomID,
    getById,
    getByNode
}
from './document';

const BACKSPACE = 8,
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

import {
    Toolbar
}
from './toolbar';
import {
    Injector
}
from './injector';

let toolbar = new Toolbar(),
    injector;

/**
 * @class
 * @name Editor
 */
export class Editor extends Emitter {

    /**
     * Creates new editor instance
     * @param {HTMLElement} element
     * @returns {Promise<Editor>} promise of fully loaded and rendered editor
     */
    static factory(element) {
        let editor = new Editor(element);
        return editor.inited;
    }

    /**
     * [[Description]]
     * @param {HTMLElement} element
     * @returns {Promise} [[Description]]
     */
    static initEditors(element) {
        let self = this;
        return Promise.all(arraize(element.querySelectorAll('[data-skaryna]'))
                .map((element) => Editor.factory(element)))
            .then(editors => {
                self.editors = editors;
                return editors;
            });
    }

    /**
     * [[Description]]
     * @param {Object} documentBody [[Description]]
     * @param {[[Type]]} documentId   [[Description]]
     */
    static registerDocument(documentBody, documentId) {
        repository.set(documentId || DEFAULT_DOCUMENT, documentBody);
    }

    /**
     * Loads data from REST endpoint
     * @param   {string} path
     * @param   {string} documentId
     * @returns {Promise}
     */
    static load(path, documentId) {
        return XHR
            .get(path)
            .then((content) => {
                return fromPOM(JSON.parse(content));
            })
            .then((content) => {
                repository.set(documentId || DEFAULT_DOCUMENT, content);
            });
    }

    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        super();

        this.element = element;
        this.documentPath = element.getAttribute('data-skaryna-path') || null;
        this.document = element.getAttribute('data-skaryna-doc') || DEFAULT_DOCUMENT;
        this.variant = element.getAttribute('data-skaryna-variant') || null;

        this._pendingState = null;
        this._rendering = false;

        this.init();

    }

    /**
     * Inits component
     * @returns {Promise}
     */
    init() {
        let self = this;
        if (this.inited) {
            return this.inited;
        }
        this.inited = fromHTML(this.element, {
                edit: true
            })
            .then((content) => {
                content.lock();
                if (repository.has(self.document)) {
                    let doc = repository.get(self.document);
                    if (self.documentPath) {
                        doc = doc.get(self.documentPath);
                        if (doc && doc.type === 'Variants' && doc.best) {
                            doc = doc.best(self.variant || '*');
                        }
                    }
                    self.content = doc;
                } else if (!content.empty) {
                    repository.set(self.document, content);
                    self.content = content;
                }
            })
            .then(() => {
                return self.render();
            })
            .catch((error) => {
                console.log(error);
                console.log(error.stack);
            });
    }

    getCaretCharacterOffsetWithin(element) {
        let caretOffset = 0,
            doc = element.ownerDocument || element.document,
            win = doc.defaultView || doc.parentWindow,
            sel;
        if (typeof win.getSelection != 'undefined') {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                let range = win.getSelection().getRangeAt(0),
                    preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type != 'Control') {
            let textRange = sel.createRange(),
                preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint('EndToEnd', textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }

    getSelectionLength() {

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
        return this.getEditableNode(node);
    }

    getEditableNode(node) {
        while (node && (!node.hasAttribute || !node.hasAttribute('data-skaryna-id'))) {
            node = node.parentNode;
        }
        return node;
    }

    onDOM(selectorORElement, eventName, myMethod) {
        let self = this;
        if (selectorORElement instanceof HTMLElement) {
            selectorORElement = [selectorORElement];
        } else {
            selectorORElement = arraize(this.element.querySelectorAll(selectorORElement));
        }
        selectorORElement
            .forEach(element => {
                element.addEventListener(eventName, event => {
                    myMethod.apply(self, [event]);
                }, true);
            });
    }

    /**
     * Renders UI
     * @returns {Promise}
     */
    render() {
        this._rendering = true;
        let self = this,
            promise;

        if (!this.content) {
            this._rendering = false;
            promise = Promise.resolve();
        } else {
            promise = this.content
                .decorate(this.element)
                .then(() => {
                    this._rendering = false;
                });
        }

        return promise
            .then(() => {
                self.element.setAttribute('data-skaryna-id', self.content ? self.content.name : randomID(true));
                self.element.setAttribute('contentEditable', '');
                self.element.addEventListener('keydown', (event) => {
                    self.onKeyUp(event);
                }, true);
                self.onDOM('[data-skaryna-id]', 'mouseup', self.focus);
                self.onDOM(self.element, 'mouseup', self.focus);

                self.element.addEventListener('mouseup', (event) => {
                    let sel = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
                    if (sel && sel.length) {
                        self.onSelect(event);
                    }
                }, true);
            })
            .then(() => self);
    }

    onSelect() {
        this.showToolbar();
        this.strong();
    }

    showToolbar() {
        toolbar.anchor();
    }

    focus(event) {
        let node = this.getEditableNode(event.target),
            focusedNode = getByNode(node),
            parentNode = getByNode(node.parentNode),
            newItems,
            injectorObject;

        newItems = parentNode ? parentNode.allowedNewItems : focusedNode.allowedNewItems;

        this.hideInjector();

        if (newItems.length > 0) {
            if (!parentNode) {
                injectorObject = this.showInjector(node.parentNode.lastChild, newItems);
            } else {
                injectorObject = this.showInjector(node, newItems);
            }
            injectorObject.on('injectnode', event => {
                if (parentNode) {
                    let index = parentNode.items.indexOf(focusedNode);
                    parentNode.items.splice(index, 0, new event.data());
                } else {
                    parentNode.items.push(new event.data());
                }
                this.render();
            });
        }
    }

    showInjector(afterNode, possibleItems) {
        let injectorObject = new Injector(possibleItems),
            box = afterNode.getBoundingClientRect();

        document.body.appendChild(injectorObject.element);
        injectorObject.goTo(box.left, box.top);
        return injectorObject;

    }

    hideInjector() {
        if (injector) {
            if (injector.parentNode) {
                injector.parentNode.removeChild(injector);
            }
            injector = null;
        }
    }

    strong() {
        let textNode = this.getCurrentElement(event.target),
            sel = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text,
            to = sel.length,
            from = this.getCaretCharacterOffsetWithin(textNode) - to;


        fromHTML(textNode)
            .then((POM) => {
                POM.formats = POM.formats || [];
                POM.formats.push({
                    slice: [from, to],
                    apply: ['strong']
                });
                return toHTML(POM);
            })
            .then((HTML) => {
                textNode.innerHTML = HTML.innerHTML;
            });
    }

    /**
     * Handles external change
     * @param {object} event
     */
    onExternalChange() {
        if (this._rendering) {
            this._pendingState = true;
            return;
        }
        this.render();
    }

    newItem(target) {
        let currentTarget = target,
            node = getByNode(currentTarget),
            self = this,
            asEditor = Editor.editors.reduce((previous, current) => {
                if (current.element === currentTarget) {
                    return current;
                }
                return previous;
            }, null);

        while (node !== null) {
            if (!node) {
                if (asEditor) {
                    let index = Editor.editors.indexOf(asEditor) + 1;
                    if (index >= Editor.editors.length) {
                        index = 0;
                    }
                    self.editNode(Editor.editors[index].element);
                }
                return;
            }
            if (node.defaultNewItem) {
                let newElement = new(node.defaultNewItem)();
                node.items.push(newElement);

                toHTML(newElement, {
                        edit: true
                    })
                    .then(htmlElement => {
                        currentTarget.appendChild(htmlElement);
                        self.editNode(htmlElement);
                    });
                return;
            }
            currentTarget = currentTarget.parentNode;
            node = getByNode(currentTarget);
            asEditor = asEditor || Editor.editors.reduce((previous, current) => {
                if (current.element === currentTarget) {
                    return current;
                }
                return previous;
            }, null);
        }
    }

    editNode(node) {
        let range = document.createRange(),
            sel = window.getSelection();
        range.setStart(node, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    ownAction(key, target) {
        if (key === ENTER) {
            return this.newItem(target);
        }
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
            this.ownAction(event.keyCode, current);
        } else {
            setTimeout(() => this.update(current), 0);
        }
    }

    update(element) {
        let
            self = this,
            doc = repository.get(self.document);

        if (self.documentPath) {
            doc = doc.set(self.documentPath, self.content);
            repository.emit(CHANGE);
        } else {
            //TODO
        }

        fromHTML(element)
            .then(POM => {
                Editor.emit('selected', {
                    editor: this,
                    element: element,
                    node: POM
                });
            });
    }
}

let styles = document.createElement('style');
styles.innerText = `
        p[data-skaryna-id]:empty {
                display: block;
                height: 1em;
            }
        }
        `;

document.body.appendChild(styles);
