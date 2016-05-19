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
export class XHR {
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
  static get(path, raw) {
    return XHR.ajax(path, 'get', null, raw);
  }
  static post(path, data, raw) {
    return XHR.ajax(path, 'post', data, raw);
  }
  static put(path, data, raw) {
    return XHR.ajax(path, 'put', data, raw);
  }
  static delete(path, raw) {
    return XHR.ajax(path, 'delete', null, raw);
  }
}
