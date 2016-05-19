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
    Emitter
}
from './emitter';

let styles;

const SVGS = {
    paragraph: 'M832 320v704q0 104-40.5 198.5t-109.5 163.5-163.5 109.5-198.5 40.5h-64q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h64q106 0 181-75t75-181v-32q0-40-28-68t-68-28h-224q-80 0-136-56t-56-136v-384q0-80 56-136t136-56h384q80 0 136 56t56 136zm896 0v704q0 104-40.5 198.5t-109.5 163.5-163.5 109.5-198.5 40.5h-64q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h64q106 0 181-75t75-181v-32q0-40-28-68t-68-28h-224q-80 0-136-56t-56-136v-384q0-80 56-136t136-56h384q80 0 136 56t56 136z',
    image: 'M576 576q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm1024 384v448h-1408v-192l320-320 160 160 512-512zm96-704h-1600q-13 0-22.5 9.5t-9.5 22.5v1216q0 13 9.5 22.5t22.5 9.5h1600q13 0 22.5-9.5t9.5-22.5v-1216q0-13-9.5-22.5t-22.5-9.5zm160 32v1216q0 66-47 113t-113 47h-1600q-66 0-113-47t-47-113v-1216q0-66 47-113t113-47h1600q66 0 113 47t47 113z',
    dimensions: '0 0 1792 1792'
};

export class Injector extends Emitter {

    constructor(allowedNodes) {
        super();

        let
            self = this,
            div = document.createElement('div');

        div.innerHTML = '<div data-skaryna-tooltip="left"><div></div><div></div></div>';

        this.element = div.firstChild;

        allowedNodes.forEach(node => {
            let action = document.createElement('a'),
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

            action.addEventListener('mousedown', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log(node);
                self.emit('injectnode', node);

            }, true);
            this.element.children[1].appendChild(action);
        });

        if (!styles) {
            styles = document.createElement('style');
            styles.innerText = `
        [data-skaryna-tooltip] {
            position: absolute;
            z-index: 1070;
            display: block;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 1.42857143;
            text-align: left;
            text-align: start;
            text-decoration: none;
            text-shadow: none;
            text-transform: none;
            letter-spacing: normal;
            word-break: normal;
            word-spacing: normal;
            word-wrap: normal;
            white-space: normal;
            /*filter: alpha(opacity=0);
            opacity: 0;*/
            line-break: auto;
            transition: opacity 0.5s;
        }
        [data-skaryna-tooltip] div:nth-child(2) {
            max-width: 200px;
            padding: 3px 8px;
            color: #fff;
            text-align: center;
            background-color: #000;
            border-radius: 4px;
        }
        [data-skaryna-tooltip] div:nth-child(1) {
            position: absolute;
            width: 0;
            height: 0;
            border-color: transparent;
            border-style: solid;
        }
        [data-skaryna-tooltip="left"] {
            padding: 0 5px;
            margin-left: -3px;
        }
        [data-skaryna-tooltip="top"] {
            padding: 5px 0;
            margin-top: -3px;
        }
        [data-skaryna-tooltip="bottom"] {
            padding: 5px 0;
            margin-top: 3px;
        }
        [data-skaryna-tooltip="right"] {
            padding: 0 5px;
            margin-left: 3px;
        }
        [data-skaryna-tooltip="left"] div:nth-child(1) {
            top: 50%;
            right: 0;
            margin-top: -5px;
            border-width: 5px 0 5px 5px;
            border-left-color: #000;
        }
        [data-skaryna-tooltip="top"] div:nth-child(1) {
            bottom: 0;
            left: 50%;
            margin-left: -5px;
            border-width: 5px 5px 0;
            border-top-color: #000;
        }
        [data-skaryna-tooltip="bottom"] div:nth-child(1) {
            top: 0;
            left: 50%;
            margin-left: -5px;
            border-width: 0 5px 5px;
            border-bottom-color: #000;
        }
        [data-skaryna-tooltip="right"] div:nth-child(1) {
            top: 50%;
            left: 0;
            margin-top: -5px;
            border-width: 5px 5px 5px 0;
            border-right-color: #000;
        }
        [data-skaryna-tooltip] a {
            margin-left: 10px;
        }
        [data-skaryna-tooltip] a:first-child{
            margin-left: 0px;
        }`;

            document.body.appendChild(styles);
        }
    }
}
