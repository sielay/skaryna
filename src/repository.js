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

import {
    Event, Emitter
}
from './emitter';

export const CHANGE = 'change';
export const DEFAULT_DOCUMENT = '#default';

class Repository extends Emitter {

    constructor() {
        super();
        this._documents = {};
    }

    get main() {
        return this._documents[DEFAULT_DOCUMENT];
    }

    get(documentId) {
        if (this._documents[documentId]) {
            return this._documents[documentId].content;
        }
    }

    set(documentId, value) {
        this._documents[documentId] = {
            content: value
        };
        this.emit(CHANGE, {
            id: documentId
        });
    }

    has(documentId) {
        return !!this._documents[documentId];
    }

    toJSON() {
        let data = {};
        Object
            .keys(this._documents)
            .forEach((key) => {
                //console.log(this._documents[key].content);
                data[key] = {
                    id: key,
                    content: this._documents[key].content.toJSON()
                };
            });
        return data;
    }
}


export var repository = new Repository();
