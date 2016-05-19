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

export class Toolbar {

    constructor() {
        //super();

        this.element = document.createElement('div');
        this.element.setAttribute('data-skaryna-toolbar', '');
        this.element.innerHTML = '<div data-skaryna-toolbar-actions>aaaaaaaaa</div><div data-skaryna-toolbar-arrow><span></span></div>';
        this.arrow = this.element.querySelector('[data-skaryna-toolbar-arrow]');

        let styles = document.createElement('style');
        styles.innerText = `
            [data-skaryna-toolbar] {
                position: absolute;
                visibility: hidden;
                display: none;
                z-index: 10000;
                transition: none;
                top: 0;
                left: 0;
            }

            [data-skaryna-toolbar-actions] {
                position: relative;
                background-image: linear-gradient(to bottom,rgba(49,49,47,.99),#262625);
                background-repeat: repeat-x;
                border-radius: 5px;
            }

            [data-skaryna-toolbar-arrow] {
                position: absolute;
                bottom: -10px;
                left: 50%;
                clip: rect(10px 20px 20px 0);
                margin-left: -10px;
            }

            [data-skaryna-toolbar-arrow] > span {
                display: block;
                width: 20px;
                height: 20px;
                background-color: #262625;
                transform: rotate(45deg) scale(.5);
            }
            `;

        document.body.appendChild(styles);
        document.body.appendChild(this.element);
    }

    getSelectionCoords(theWindow) {
        let win = theWindow || window,
            doc = win.document,
            sel = doc.selection,
            range, rects, rect,
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
                        span.appendChild(doc.createTextNode("\u200b"));
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

    anchor() {
        let coords = this.getSelectionCoords(),
            self = this,
            rect,
            arrow;
        this.element.style.display = 'block';
        this.element.style.visibility = 'visible';

        setTimeout(() => {
            rect = this.element.getBoundingClientRect();
            arrow = this.arrow.getBoundingClientRect();
            console.log(rect, coords, arrow);
            this.show(coords.x, coords.y - rect.height - 10);
        }, 1);
    }

    show(x, y) {
        this.element.style.top = y + 'px';
        this.element.style.left = x + 'px';
    }
    hide() {
        this.element.style.display = null;
        this.element.style.visibility = null;
    }
}
