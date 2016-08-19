(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Pipe = require('../pipe').Pipe;

var Context = function Context(){
};

Context.prototype.setResult = function(result) {
	this.result = result;
	this.hasResult = true;
	return this;
};

Context.prototype.exit = function() {
	this.exiting = true;
	return this;
};

Context.prototype.switchTo = function(next, pipe) {
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

Context.prototype.push = function(child, name) {
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

},{"../pipe":15}],2:[function(require,module,exports){
var Context = require('./context').Context;
var dateReviver = require('../date-reviver');

var DiffContext = function DiffContext(left, right) {
  this.left = left;
  this.right = right;
  this.pipe = 'diff';
};

DiffContext.prototype = new Context();

DiffContext.prototype.setResult = function(result) {
  if (this.options.cloneDiffValues) {
    var clone = typeof this.options.cloneDiffValues === 'function' ?
      this.options.cloneDiffValues : function(value) {
        return JSON.parse(JSON.stringify(value), dateReviver);
      };
    if (typeof result[0] === 'object') {
      result[0] = clone(result[0]);
    }
    if (typeof result[1] === 'object') {
      result[1] = clone(result[1]);
    }
  }
  return Context.prototype.setResult.apply(this, arguments);
};

exports.DiffContext = DiffContext;

},{"../date-reviver":5,"./context":1}],3:[function(require,module,exports){
var Context = require('./context').Context;

var PatchContext = function PatchContext(left, delta) {
  this.left = left;
  this.delta = delta;
  this.pipe = 'patch';
};

PatchContext.prototype = new Context();

exports.PatchContext = PatchContext;

},{"./context":1}],4:[function(require,module,exports){
var Context = require('./context').Context;

var ReverseContext = function ReverseContext(delta) {
  this.delta = delta;
  this.pipe = 'reverse';
};

ReverseContext.prototype = new Context();

exports.ReverseContext = ReverseContext;

},{"./context":1}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
  this.processor.pipe(new Pipe('diff').append(
    nested.collectChildrenDiffFilter,
    trivial.diffFilter,
    dates.diffFilter,
    texts.diffFilter,
    nested.objectsDiffFilter,
    arrays.diffFilter
  ).shouldHaveResult());
  this.processor.pipe(new Pipe('patch').append(
    nested.collectChildrenPatchFilter,
    arrays.collectChildrenPatchFilter,
    trivial.patchFilter,
    texts.patchFilter,
    nested.patchFilter,
    arrays.patchFilter
  ).shouldHaveResult());
  this.processor.pipe(new Pipe('reverse').append(
    nested.collectChildrenReverseFilter,
    arrays.collectChildrenReverseFilter,
    trivial.reverseFilter,
    texts.reverseFilter,
    nested.reverseFilter,
    arrays.reverseFilter
  ).shouldHaveResult());
};

DiffPatcher.prototype.options = function() {
  return this.processor.options.apply(this.processor, arguments);
};

DiffPatcher.prototype.diff = function(left, right) {
  return this.processor.process(new DiffContext(left, right));
};

DiffPatcher.prototype.patch = function(left, delta) {
  return this.processor.process(new PatchContext(left, delta));
};

DiffPatcher.prototype.reverse = function(delta) {
  return this.processor.process(new ReverseContext(delta));
};

DiffPatcher.prototype.unpatch = function(right, delta) {
  return this.patch(right, this.reverse(delta));
};

exports.DiffPatcher = DiffPatcher;

},{"./contexts/diff":2,"./contexts/patch":3,"./contexts/reverse":4,"./filters/arrays":8,"./filters/dates":9,"./filters/nested":11,"./filters/texts":12,"./filters/trivial":13,"./pipe":15,"./processor":16}],7:[function(require,module,exports){

exports.isBrowser = typeof window !== 'undefined';

},{}],8:[function(require,module,exports){
var DiffContext = require('../contexts/diff').DiffContext;
var PatchContext = require('../contexts/patch').PatchContext;
var ReverseContext = require('../contexts/reverse').ReverseContext;

var lcs = require('./lcs');

var ARRAY_MOVE = 3;

var isArray = (typeof Array.isArray === 'function') ?
  // use native function
  Array.isArray :
  // use instanceof operator
  function(a) {
    return a instanceof Array;
  };

var arrayIndexOf = typeof Array.prototype.indexOf === 'function' ?
  function(array, item) {
    return array.indexOf(item);
  } : function(array, item) {
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
  if (typeof value1 !== 'object' || typeof value2 !== 'object') {
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

  if (len1 > 0 && len2 > 0 && !matchContext.objectHash &&
    typeof matchContext.matchByPosition !== 'boolean') {
    matchContext.matchByPosition = !arraysHaveMatchByRef(array1, array2, len1, len2);
  }

  // separate common head
  while (commonHead < len1 && commonHead < len2 &&
    matchItems(array1, array2, commonHead, commonHead, matchContext)) {
    index = commonHead;
    child = new DiffContext(context.left[index], context.right[index]);
    context.push(child, index);
    commonHead++;
  }
  // separate common tail
  while (commonTail + commonHead < len1 && commonTail + commonHead < len2 &&
    matchItems(array1, array2, len1 - 1 - commonTail, len2 - 1 - commonTail, matchContext)) {
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
  var seq = lcs.get(
    trimmed1, trimmed2,
    matchItems,
    matchContext
  );
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
          if (matchItems(trimmed1, trimmed2, index1 - commonHead,
            index - commonHead, matchContext)) {
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
  numerically: function(a, b) {
    return a - b;
  },
  numericallyBy: function(name) {
    return function(a, b) {
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
          throw new Error('only removal or move can be applied at original array indices' +
            ', invalid diff type: ' + delta[index][2]);
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

var reverseArrayDeltaIndex = function(delta, index, itemDelta) {
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

},{"../contexts/diff":2,"../contexts/patch":3,"../contexts/reverse":4,"./lcs":10}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/*

LCS implementation that supports arrays or strings

reference: http://en.wikipedia.org/wiki/Longest_common_subsequence_problem

*/

var defaultMatch = function(array1, array2, index1, index2) {
  return array1[index1] === array2[index2];
};

var lengthMatrix = function(array1, array2, match, context) {
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

var backtrack = function(matrix, array1, array2, index1, index2, context) {
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

var get = function(array1, array2, match, context) {
  context = context || {};
  var matrix = lengthMatrix(array1, array2, match || defaultMatch, context);
  var result = backtrack(matrix, array1, array2, array1.length, array2.length, context);
  if (typeof array1 === 'string' && typeof array2 === 'string') {
    result.sequence = result.sequence.join('');
  }
  return result;
};

exports.get = get;

},{}],11:[function(require,module,exports){
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

  var name, child, propertyFilter = context.options.propertyFilter;
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

},{"../contexts/diff":2,"../contexts/patch":3,"../contexts/reverse":4}],12:[function(require,module,exports){
/* global diff_match_patch */
var TEXT_DIFF = 2;
var DEFAULT_MIN_LENGTH = 60;
var cachedDiffPatch = null;

var getDiffMatchPatch = function(required) {
  /*jshint camelcase: false */

  if (!cachedDiffPatch) {
    var instance;
    if (typeof diff_match_patch !== 'undefined') {
      // already loaded, probably a browser
      instance = typeof diff_match_patch === 'function' ?
        new diff_match_patch() : new diff_match_patch.diff_match_patch();
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
      diff: function(txt1, txt2) {
        return instance.patch_toText(instance.patch_make(txt1, txt2));
      },
      patch: function(txt1, patch) {
        var results = instance.patch_apply(instance.patch_fromText(patch), txt1);
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
  var minLength = (context.options && context.options.textDiff &&
    context.options.textDiff.minLength) || DEFAULT_MIN_LENGTH;
  if (context.left.length < minLength ||
    context.right.length < minLength) {
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

var textDeltaReverse = function(delta) {
  var i, l, lines, line, lineTmp, header = null,
    headerRegex = /^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/,
    lineHeader, lineAdd, lineRemove;
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

},{}],13:[function(require,module,exports){
var isArray = (typeof Array.isArray === 'function') ?
  // use native function
  Array.isArray :
  // use instanceof operator
  function(a) {
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
  context.leftType = context.left === null ? 'null' : typeof context.left;
  context.rightType = context.right === null ? 'null' : typeof context.right;
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

},{}],14:[function(require,module,exports){

var environment = require('./environment');

var DiffPatcher = require('./diffpatcher').DiffPatcher;
exports.DiffPatcher = DiffPatcher;

exports.create = function(options){
  return new DiffPatcher(options);
};

exports.dateReviver = require('./date-reviver');

var defaultInstance;

exports.diff = function() {
  if (!defaultInstance) {
    defaultInstance = new DiffPatcher();
  }
  return defaultInstance.diff.apply(defaultInstance, arguments);
};

exports.patch = function() {
  if (!defaultInstance) {
    defaultInstance = new DiffPatcher();
  }
  return defaultInstance.patch.apply(defaultInstance, arguments);
};

exports.unpatch = function() {
  if (!defaultInstance) {
    defaultInstance = new DiffPatcher();
  }
  return defaultInstance.unpatch.apply(defaultInstance, arguments);
};

exports.reverse = function() {
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

},{"./date-reviver":5,"./diffpatcher":6,"./environment":7}],15:[function(require,module,exports){
var Pipe = function Pipe(name) {
  this.name = name;
  this.filters = [];
};

Pipe.prototype.process = function(input) {
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
    if (typeof context === 'object' && context.exiting) {
      context.exiting = false;
      break;
    }
  }
  if (!context.next && this.resultCheck) {
    this.resultCheck(context);
  }
};

Pipe.prototype.log = function(msg) {
  console.log('[jsondiffpatch] ' + this.name + ' pipe, ' + msg);
};

Pipe.prototype.append = function() {
  this.filters.push.apply(this.filters, arguments);
  return this;
};

Pipe.prototype.prepend = function() {
  this.filters.unshift.apply(this.filters, arguments);
  return this;
};

Pipe.prototype.indexOf = function(filterName) {
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

Pipe.prototype.list = function() {
  var names = [];
  for (var index = 0; index < this.filters.length; index++) {
    var filter = this.filters[index];
    names.push(filter.filterName);
  }
  return names;
};

Pipe.prototype.after = function(filterName) {
  var index = this.indexOf(filterName);
  var params = Array.prototype.slice.call(arguments, 1);
  if (!params.length) {
    throw new Error('a filter is required');
  }
  params.unshift(index + 1, 0);
  Array.prototype.splice.apply(this.filters, params);
  return this;
};

Pipe.prototype.before = function(filterName) {
  var index = this.indexOf(filterName);
  var params = Array.prototype.slice.call(arguments, 1);
  if (!params.length) {
    throw new Error('a filter is required');
  }
  params.unshift(index, 0);
  Array.prototype.splice.apply(this.filters, params);
  return this;
};

Pipe.prototype.clear = function() {
  this.filters.length = 0;
  return this;
};

Pipe.prototype.shouldHaveResult = function(should) {
  if (should === false) {
    this.resultCheck = null;
    return;
  }
  if (this.resultCheck) {
    return;
  }
  var pipe = this;
  this.resultCheck = function(context) {
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

},{}],16:[function(require,module,exports){

var Processor = function Processor(options){
  this.selfOptions = options || {};
  this.pipes = {};
};

Processor.prototype.options = function(options) {
  if (options) {
    this.selfOptions = options;
  }
  return this.selfOptions;
};

Processor.prototype.pipe = function(name, pipe) {
  if (typeof name === 'string') {
    if (typeof pipe === 'undefined') {
      return this.pipes[name];
    } else {
      this.pipes[name] = pipe;
    }
  }
  if (name && name.name) {
    pipe = name;
    if (pipe.processor === this) { return pipe; }
    this.pipes[pipe.name] = pipe;
  }
  pipe.processor = this;
  return pipe;
};

Processor.prototype.process = function(input, pipe) {
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

},{}],17:[function(require,module,exports){
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

},{"./editor":19,"./index":21,"./repository":26,"./xhr":32}],18:[function(require,module,exports){
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
        key: 'set',
        value: function set(path, value) {
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

        _this9.level = Math.min(6, level || 1);
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

},{"./emitter":20,"./serializer/toHTML":28,"./util":31}],19:[function(require,module,exports){
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

var _toPOM = require('./serializer/toPOM');

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
 * @name Editor
 */

var Editor = exports.Editor = function (_Emitter) {
    _inherits(Editor, _Emitter);

    _createClass(Editor, null, [{
        key: 'factory',


        /**
         * Creates new editor instance
         * @param {HTMLElement} element
         * @returns {Promise<Editor>} promise of fully loaded and rendered editor
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
            var self = this;
            return Promise.all((0, _util.arraize)(element.querySelectorAll('[data-skaryna]')).map(function (element) {
                return Editor.factory(element);
            })).then(function (editors) {
                self.editors = editors;
                return editors;
            });
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
                return self.render();
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
        value: function getSelectionLength() {}
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

                self.element.addEventListener('mouseup', function (event) {
                    var sel = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
                    if (sel && sel.length) {
                        self.onSelect(event);
                    }
                }, true);
            }).then(function () {
                return self;
            });
        }
    }, {
        key: 'onSelect',
        value: function onSelect() {
            this.showToolbar();
            this.strong();
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
                box = afterNode.getBoundingClientRect();

            document.body.appendChild(injectorObject.element);
            injectorObject.goTo(box.left, box.top);
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
        value: function onExternalChange() {
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
                self = this,
                asEditor = Editor.editors.reduce(function (previous, current) {
                if (current.element === currentTarget) {
                    return current;
                }
                return previous;
            }, null);

            while (node !== null) {
                if (!node) {
                    if (asEditor) {
                        var index = Editor.editors.indexOf(asEditor) + 1;
                        if (index >= Editor.editors.length) {
                            index = 0;
                        }
                        self.editNode(Editor.editors[index].element);
                    }
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
                asEditor = asEditor || Editor.editors.reduce(function (previous, current) {
                    if (current.element === currentTarget) {
                        return current;
                    }
                    return previous;
                }, null);
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
            var _this4 = this;

            var current = this.getCurrentElement(event.target);
            if (PREVENT.indexOf(event.keyCode) !== -1) {
                event.stopPropagation();
                event.preventDefault();
                this.ownAction(event.keyCode, current);
            } else {
                setTimeout(function () {
                    return _this4.update(current);
                }, 0);
            }
        }
    }, {
        key: 'update',
        value: function update(element) {
            var _this5 = this;

            var self = this,
                doc = _repository.repository.get(self.document);

            if (self.documentPath) {
                doc = doc.set(self.documentPath, self.content);
                _repository.repository.emit(_repository.CHANGE);
            } else {
                //TODO
            }

            (0, _fromHTML.fromHTML)(element).then(function (POM) {
                Editor.emit('selected', {
                    editor: _this5,
                    element: element,
                    node: POM
                });
            });
        }
    }]);

    return Editor;
}(_emitter.Emitter);

var styles = document.createElement('style');
styles.innerText = '\n        p[data-skaryna-id]:empty {\n                display: block;\n                height: 1em;\n            }\n        }\n        ';

document.body.appendChild(styles);

},{"./document":18,"./emitter":20,"./injector":22,"./parser/fromHTML":24,"./parser/fromPOM":25,"./repository":26,"./serializer/toHTML":28,"./serializer/toPOM":29,"./toolbar":30,"./util":31,"./xhr":32}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{"./emitter":20}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Injector = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

        div.innerHTML = '<skaryna><div data-skaryna-tooltip="left"><div></div><div></div></div></skaryna>';

        _this.element = div.firstChild;

        div = _this.element.firstChild;

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
                self.emit('injectnode', node);
            }, true);
            div.children[1].appendChild(action);
        });

        if (!styles) {
            styles = document.createElement('style');
            styles.innerText = '\n        [data-skaryna-tooltip] {\n            position: absolute;\n            z-index: 1070;\n            display: block;\n            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n            font-size: 12px;\n            font-style: normal;\n            font-weight: 400;\n            line-height: 1.42857143;\n            text-align: left;\n            text-align: start;\n            text-decoration: none;\n            text-shadow: none;\n            text-transform: none;\n            letter-spacing: normal;\n            word-break: normal;\n            word-spacing: normal;\n            word-wrap: normal;\n            white-space: normal;\n            /*filter: alpha(opacity=0);\n            opacity: 0;*/\n            line-break: auto;\n            transition: opacity 0.5s;\n        }\n        [data-skaryna-tooltip] div:nth-child(2) {\n            max-width: 200px;\n            padding: 3px 8px;\n            color: #fff;\n            text-align: center;\n            background-color: #000;\n            border-radius: 4px;\n        }\n        [data-skaryna-tooltip] div:nth-child(1) {\n            position: absolute;\n            width: 0;\n            height: 0;\n            border-color: transparent;\n            border-style: solid;\n        }\n        [data-skaryna-tooltip="left"] {\n            padding: 0 5px;\n            margin-left: -3px;\n        }\n        [data-skaryna-tooltip="top"] {\n            padding: 5px 0;\n            margin-top: -3px;\n        }\n        [data-skaryna-tooltip="bottom"] {\n            padding: 5px 0;\n            margin-top: 3px;\n        }\n        [data-skaryna-tooltip="right"] {\n            padding: 0 5px;\n            margin-left: 3px;\n        }\n        [data-skaryna-tooltip="left"] div:nth-child(1) {\n            top: 50%;\n            right: 0;\n            margin-top: -5px;\n            border-width: 5px 0 5px 5px;\n            border-left-color: #000;\n        }\n        [data-skaryna-tooltip="top"] div:nth-child(1) {\n            bottom: 0;\n            left: 50%;\n            margin-left: -5px;\n            border-width: 5px 5px 0;\n            border-top-color: #000;\n        }\n        [data-skaryna-tooltip="bottom"] div:nth-child(1) {\n            top: 0;\n            left: 50%;\n            margin-left: -5px;\n            border-width: 0 5px 5px;\n            border-bottom-color: #000;\n        }\n        [data-skaryna-tooltip="right"] div:nth-child(1) {\n            top: 50%;\n            left: 0;\n            margin-top: -5px;\n            border-width: 5px 5px 5px 0;\n            border-right-color: #000;\n        }\n        [data-skaryna-tooltip] a {\n            margin-left: 10px;\n        }\n        [data-skaryna-tooltip] a:first-child{\n            margin-left: 0px;\n        }';

            document.body.appendChild(styles);
        }
        return _this;
    }

    _createClass(Injector, [{
        key: 'goTo',
        value: function goTo(x, y) {
            var _this2 = this;

            setTimeout(function () {
                var div = _this2.element.firstChild,
                    injectorBox = div.getBoundingClientRect();
                div.style.top = y + 'px';
                div.style.left = x - injectorBox.width + 'px';
            }, 0);
        }
    }]);

    return Injector;
}(_emitter.Emitter);

},{"./emitter":20}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"./../document":18,"./../parser":23,"./../util":31}],25:[function(require,module,exports){
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

},{"./../document":18,"./../parser":23}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.repository = exports.DEFAULT_DOCUMENT = exports.CHANGE = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _emitter = require('./emitter');

var _jsondiffpatch = require('jsondiffpatch');

var _toPOM = require('./serializer/toPOM');

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
            var previous = this._documents[documentId] || {
                initial: (0, _toPOM.toPOM)(value)
            };
            this._documents[documentId] = {
                initial: previous.initial,
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
        key: 'diff',
        value: function diff(documentId) {
            var _this2 = this;

            if (!documentId) {
                var _ret = function () {
                    var result = {},
                        self = _this2;
                    return {
                        v: Promise.all(Object.keys(_this2._documents).map(function (key) {
                            return self.diff(key).then(function (delta) {
                                result[key] = delta;
                            });
                        })).then(function () {
                            return result;
                        })
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }

            return Promise.all([this._documents[documentId].initial, (0, _toPOM.toPOM)(this._documents[documentId].content)]).then(function (results) {
                console.log(results);
                return (0, _jsondiffpatch.diff)(results[0], results[1]);
            });
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var _this3 = this;

            var data = {};
            Object.keys(this._documents).forEach(function (key) {
                //console.log(this._documents[key].content);
                data[key] = {
                    id: key,
                    content: _this3._documents[key].content.toJSON()
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

},{"./emitter":20,"./serializer/toPOM":29,"jsondiffpatch":14}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"./../document":18,"./../serializer":27,"./../util":31}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toPOM = toPOM;

var _serializer = require('./../serializer');

function toPOM(model, options) {
    return _serializer.serializer.serialize('pom', model, options);
} /* jslint esnext:true, node:true */
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

_serializer.serializer.on('pom', '*', function (node) {
    return Promise.resolve(node.toJSON());
});

},{"./../serializer":27}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
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

},{}]},{},[17])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvY29udGV4dHMvY29udGV4dC5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9jb250ZXh0cy9kaWZmLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2NvbnRleHRzL3BhdGNoLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2NvbnRleHRzL3JldmVyc2UuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvZGF0ZS1yZXZpdmVyLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2RpZmZwYXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2Vudmlyb25tZW50LmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2ZpbHRlcnMvYXJyYXlzLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL2ZpbHRlcnMvZGF0ZXMuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvZmlsdGVycy9sY3MuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvZmlsdGVycy9uZXN0ZWQuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvZmlsdGVycy90ZXh0cy5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9maWx0ZXJzL3RyaXZpYWwuanMiLCJub2RlX21vZHVsZXMvanNvbmRpZmZwYXRjaC9zcmMvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy9qc29uZGlmZnBhdGNoL3NyYy9waXBlLmpzIiwibm9kZV9tb2R1bGVzL2pzb25kaWZmcGF0Y2gvc3JjL3Byb2Nlc3Nvci5qcyIsInNyYy9icm93c2VyLmpzIiwic3JjL2RvY3VtZW50LmpzIiwic3JjL2VkaXRvci5qcyIsInNyYy9lbWl0dGVyLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2luamVjdG9yLmpzIiwic3JjL3BhcnNlci5qcyIsInNyYy9wYXJzZXIvZnJvbUhUTUwuanMiLCJzcmMvcGFyc2VyL2Zyb21QT00uanMiLCJzcmMvcmVwb3NpdG9yeS5qcyIsInNyYy9zZXJpYWxpemVyLmpzIiwic3JjL3NlcmlhbGl6ZXIvdG9IVE1MLmpzIiwic3JjL3NlcmlhbGl6ZXIvdG9QT00uanMiLCJzcmMvdG9vbGJhci5qcyIsInNyYy91dGlsLmpzIiwic3JjL3hoci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUksTUFBSixLQUFlLEVBQW5CLEVBQXVCO0FBQ3JCLHNCQUFRLElBQUksWUFBWixFO0FBQ0QsYUFGRCxNQUVPLElBQUksSUFBSSxNQUFKLEtBQWUsS0FBbkIsRUFBMEI7QUFDL0Isd0JBQVEsSUFBUjtBQUNELGVBRk0sTUFFQTtBQUNMLHVCQUFPLElBQUksS0FBSixDQUFVLFlBQVksSUFBSSxNQUExQixDQUFQLEU7QUFDRDtBQUNGO0FBQ0YsU0FaRDs7QUFjQSxZQUFJLElBQUosQ0FBUyxPQUFRLE1BQU0sSUFBTixHQUFhLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBckIsR0FBNkMsSUFBdEQ7QUFFRCxPQTFCTSxDQUFQO0FBMkJEOzs7d0JBQ1UsSSxFQUFNLEcsRUFBSztBQUNwQixhQUFPLElBQUksSUFBSixDQUFTLElBQVQsRUFBZSxLQUFmLEVBQXNCLElBQXRCLEVBQTRCLEdBQTVCLENBQVA7QUFDRDs7O3lCQUNXLEksRUFBTSxJLEVBQU0sRyxFQUFLO0FBQzNCLGFBQU8sSUFBSSxJQUFKLENBQVMsSUFBVCxFQUFlLE1BQWYsRUFBdUIsSUFBdkIsRUFBNkIsR0FBN0IsQ0FBUDtBQUNEOzs7d0JBQ1UsSSxFQUFNLEksRUFBTSxHLEVBQUs7QUFDMUIsYUFBTyxJQUFJLElBQUosQ0FBUyxJQUFULEVBQWUsS0FBZixFQUFzQixJQUF0QixFQUE0QixHQUE1QixDQUFQO0FBQ0Q7Ozs0QkFDYSxJLEVBQU0sRyxFQUFLO0FBQ3ZCLGFBQU8sSUFBSSxJQUFKLENBQVMsSUFBVCxFQUFlLFFBQWYsRUFBeUIsSUFBekIsRUFBK0IsR0FBL0IsQ0FBUDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxudmFyIFBpcGUgPSByZXF1aXJlKCcuLi9waXBlJykuUGlwZTtcblxudmFyIENvbnRleHQgPSBmdW5jdGlvbiBDb250ZXh0KCl7XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5zZXRSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcblx0dGhpcy5yZXN1bHQgPSByZXN1bHQ7XG5cdHRoaXMuaGFzUmVzdWx0ID0gdHJ1ZTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5leGl0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZXhpdGluZyA9IHRydWU7XG5cdHJldHVybiB0aGlzO1xufTtcblxuQ29udGV4dC5wcm90b3R5cGUuc3dpdGNoVG8gPSBmdW5jdGlvbihuZXh0LCBwaXBlKSB7XG5cdGlmICh0eXBlb2YgbmV4dCA9PT0gJ3N0cmluZycgfHwgbmV4dCBpbnN0YW5jZW9mIFBpcGUpIHtcblx0XHR0aGlzLm5leHRQaXBlID0gbmV4dDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLm5leHQgPSBuZXh0O1xuXHRcdGlmIChwaXBlKSB7XG5cdFx0XHR0aGlzLm5leHRQaXBlID0gcGlwZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Db250ZXh0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oY2hpbGQsIG5hbWUpIHtcblx0Y2hpbGQucGFyZW50ID0gdGhpcztcblx0aWYgKHR5cGVvZiBuYW1lICE9PSAndW5kZWZpbmVkJykge1xuXHRcdGNoaWxkLmNoaWxkTmFtZSA9IG5hbWU7XG5cdH1cblx0Y2hpbGQucm9vdCA9IHRoaXMucm9vdCB8fCB0aGlzO1xuXHRjaGlsZC5vcHRpb25zID0gY2hpbGQub3B0aW9ucyB8fCB0aGlzLm9wdGlvbnM7XG5cdGlmICghdGhpcy5jaGlsZHJlbikge1xuXHRcdHRoaXMuY2hpbGRyZW4gPSBbY2hpbGRdO1xuXHRcdHRoaXMubmV4dEFmdGVyQ2hpbGRyZW4gPSB0aGlzLm5leHQgfHwgbnVsbDtcblx0XHR0aGlzLm5leHQgPSBjaGlsZDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dCA9IGNoaWxkO1xuXHRcdHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdH1cblx0Y2hpbGQubmV4dCA9IHRoaXM7XG5cdHJldHVybiB0aGlzO1xufTtcblxuZXhwb3J0cy5Db250ZXh0ID0gQ29udGV4dDtcbiIsInZhciBDb250ZXh0ID0gcmVxdWlyZSgnLi9jb250ZXh0JykuQ29udGV4dDtcbnZhciBkYXRlUmV2aXZlciA9IHJlcXVpcmUoJy4uL2RhdGUtcmV2aXZlcicpO1xuXG52YXIgRGlmZkNvbnRleHQgPSBmdW5jdGlvbiBEaWZmQ29udGV4dChsZWZ0LCByaWdodCkge1xuICB0aGlzLmxlZnQgPSBsZWZ0O1xuICB0aGlzLnJpZ2h0ID0gcmlnaHQ7XG4gIHRoaXMucGlwZSA9ICdkaWZmJztcbn07XG5cbkRpZmZDb250ZXh0LnByb3RvdHlwZSA9IG5ldyBDb250ZXh0KCk7XG5cbkRpZmZDb250ZXh0LnByb3RvdHlwZS5zZXRSZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5jbG9uZURpZmZWYWx1ZXMpIHtcbiAgICB2YXIgY2xvbmUgPSB0eXBlb2YgdGhpcy5vcHRpb25zLmNsb25lRGlmZlZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICB0aGlzLm9wdGlvbnMuY2xvbmVEaWZmVmFsdWVzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpLCBkYXRlUmV2aXZlcik7XG4gICAgICB9O1xuICAgIGlmICh0eXBlb2YgcmVzdWx0WzBdID09PSAnb2JqZWN0Jykge1xuICAgICAgcmVzdWx0WzBdID0gY2xvbmUocmVzdWx0WzBdKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXN1bHRbMV0gPT09ICdvYmplY3QnKSB7XG4gICAgICByZXN1bHRbMV0gPSBjbG9uZShyZXN1bHRbMV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gQ29udGV4dC5wcm90b3R5cGUuc2V0UmVzdWx0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG5leHBvcnRzLkRpZmZDb250ZXh0ID0gRGlmZkNvbnRleHQ7XG4iLCJ2YXIgQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dCcpLkNvbnRleHQ7XG5cbnZhciBQYXRjaENvbnRleHQgPSBmdW5jdGlvbiBQYXRjaENvbnRleHQobGVmdCwgZGVsdGEpIHtcbiAgdGhpcy5sZWZ0ID0gbGVmdDtcbiAgdGhpcy5kZWx0YSA9IGRlbHRhO1xuICB0aGlzLnBpcGUgPSAncGF0Y2gnO1xufTtcblxuUGF0Y2hDb250ZXh0LnByb3RvdHlwZSA9IG5ldyBDb250ZXh0KCk7XG5cbmV4cG9ydHMuUGF0Y2hDb250ZXh0ID0gUGF0Y2hDb250ZXh0O1xuIiwidmFyIENvbnRleHQgPSByZXF1aXJlKCcuL2NvbnRleHQnKS5Db250ZXh0O1xuXG52YXIgUmV2ZXJzZUNvbnRleHQgPSBmdW5jdGlvbiBSZXZlcnNlQ29udGV4dChkZWx0YSkge1xuICB0aGlzLmRlbHRhID0gZGVsdGE7XG4gIHRoaXMucGlwZSA9ICdyZXZlcnNlJztcbn07XG5cblJldmVyc2VDb250ZXh0LnByb3RvdHlwZSA9IG5ldyBDb250ZXh0KCk7XG5cbmV4cG9ydHMuUmV2ZXJzZUNvbnRleHQgPSBSZXZlcnNlQ29udGV4dDtcbiIsIi8vIHVzZSBhcyAybmQgcGFyYW1ldGVyIGZvciBKU09OLnBhcnNlIHRvIHJldml2ZSBEYXRlIGluc3RhbmNlc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkYXRlUmV2aXZlcihrZXksIHZhbHVlKSB7XG4gIHZhciBwYXJ0cztcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBwYXJ0cyA9IC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlUKFxcZHsyfSk6KFxcZHsyfSk6KFxcZHsyfSkoPzpcXC4oXFxkKikpPyhafChbK1xcLV0pKFxcZHsyfSk6KFxcZHsyfSkpJC8uZXhlYyh2YWx1ZSk7XG4gICAgaWYgKHBhcnRzKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoK3BhcnRzWzFdLCArcGFydHNbMl0gLSAxLCArcGFydHNbM10sICtwYXJ0c1s0XSwgK3BhcnRzWzVdLCArcGFydHNbNl0sICsocGFydHNbN10gfHwgMCkpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufTtcbiIsInZhciBQcm9jZXNzb3IgPSByZXF1aXJlKCcuL3Byb2Nlc3NvcicpLlByb2Nlc3NvcjtcbnZhciBQaXBlID0gcmVxdWlyZSgnLi9waXBlJykuUGlwZTtcbnZhciBEaWZmQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dHMvZGlmZicpLkRpZmZDb250ZXh0O1xudmFyIFBhdGNoQ29udGV4dCA9IHJlcXVpcmUoJy4vY29udGV4dHMvcGF0Y2gnKS5QYXRjaENvbnRleHQ7XG52YXIgUmV2ZXJzZUNvbnRleHQgPSByZXF1aXJlKCcuL2NvbnRleHRzL3JldmVyc2UnKS5SZXZlcnNlQ29udGV4dDtcblxudmFyIHRyaXZpYWwgPSByZXF1aXJlKCcuL2ZpbHRlcnMvdHJpdmlhbCcpO1xudmFyIG5lc3RlZCA9IHJlcXVpcmUoJy4vZmlsdGVycy9uZXN0ZWQnKTtcbnZhciBhcnJheXMgPSByZXF1aXJlKCcuL2ZpbHRlcnMvYXJyYXlzJyk7XG52YXIgZGF0ZXMgPSByZXF1aXJlKCcuL2ZpbHRlcnMvZGF0ZXMnKTtcbnZhciB0ZXh0cyA9IHJlcXVpcmUoJy4vZmlsdGVycy90ZXh0cycpO1xuXG52YXIgRGlmZlBhdGNoZXIgPSBmdW5jdGlvbiBEaWZmUGF0Y2hlcihvcHRpb25zKSB7XG4gIHRoaXMucHJvY2Vzc29yID0gbmV3IFByb2Nlc3NvcihvcHRpb25zKTtcbiAgdGhpcy5wcm9jZXNzb3IucGlwZShuZXcgUGlwZSgnZGlmZicpLmFwcGVuZChcbiAgICBuZXN0ZWQuY29sbGVjdENoaWxkcmVuRGlmZkZpbHRlcixcbiAgICB0cml2aWFsLmRpZmZGaWx0ZXIsXG4gICAgZGF0ZXMuZGlmZkZpbHRlcixcbiAgICB0ZXh0cy5kaWZmRmlsdGVyLFxuICAgIG5lc3RlZC5vYmplY3RzRGlmZkZpbHRlcixcbiAgICBhcnJheXMuZGlmZkZpbHRlclxuICApLnNob3VsZEhhdmVSZXN1bHQoKSk7XG4gIHRoaXMucHJvY2Vzc29yLnBpcGUobmV3IFBpcGUoJ3BhdGNoJykuYXBwZW5kKFxuICAgIG5lc3RlZC5jb2xsZWN0Q2hpbGRyZW5QYXRjaEZpbHRlcixcbiAgICBhcnJheXMuY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIsXG4gICAgdHJpdmlhbC5wYXRjaEZpbHRlcixcbiAgICB0ZXh0cy5wYXRjaEZpbHRlcixcbiAgICBuZXN0ZWQucGF0Y2hGaWx0ZXIsXG4gICAgYXJyYXlzLnBhdGNoRmlsdGVyXG4gICkuc2hvdWxkSGF2ZVJlc3VsdCgpKTtcbiAgdGhpcy5wcm9jZXNzb3IucGlwZShuZXcgUGlwZSgncmV2ZXJzZScpLmFwcGVuZChcbiAgICBuZXN0ZWQuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcixcbiAgICBhcnJheXMuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcixcbiAgICB0cml2aWFsLnJldmVyc2VGaWx0ZXIsXG4gICAgdGV4dHMucmV2ZXJzZUZpbHRlcixcbiAgICBuZXN0ZWQucmV2ZXJzZUZpbHRlcixcbiAgICBhcnJheXMucmV2ZXJzZUZpbHRlclxuICApLnNob3VsZEhhdmVSZXN1bHQoKSk7XG59O1xuXG5EaWZmUGF0Y2hlci5wcm90b3R5cGUub3B0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzb3Iub3B0aW9ucy5hcHBseSh0aGlzLnByb2Nlc3NvciwgYXJndW1lbnRzKTtcbn07XG5cbkRpZmZQYXRjaGVyLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgcmV0dXJuIHRoaXMucHJvY2Vzc29yLnByb2Nlc3MobmV3IERpZmZDb250ZXh0KGxlZnQsIHJpZ2h0KSk7XG59O1xuXG5EaWZmUGF0Y2hlci5wcm90b3R5cGUucGF0Y2ggPSBmdW5jdGlvbihsZWZ0LCBkZWx0YSkge1xuICByZXR1cm4gdGhpcy5wcm9jZXNzb3IucHJvY2VzcyhuZXcgUGF0Y2hDb250ZXh0KGxlZnQsIGRlbHRhKSk7XG59O1xuXG5EaWZmUGF0Y2hlci5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uKGRlbHRhKSB7XG4gIHJldHVybiB0aGlzLnByb2Nlc3Nvci5wcm9jZXNzKG5ldyBSZXZlcnNlQ29udGV4dChkZWx0YSkpO1xufTtcblxuRGlmZlBhdGNoZXIucHJvdG90eXBlLnVucGF0Y2ggPSBmdW5jdGlvbihyaWdodCwgZGVsdGEpIHtcbiAgcmV0dXJuIHRoaXMucGF0Y2gocmlnaHQsIHRoaXMucmV2ZXJzZShkZWx0YSkpO1xufTtcblxuZXhwb3J0cy5EaWZmUGF0Y2hlciA9IERpZmZQYXRjaGVyO1xuIiwiXG5leHBvcnRzLmlzQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xuIiwidmFyIERpZmZDb250ZXh0ID0gcmVxdWlyZSgnLi4vY29udGV4dHMvZGlmZicpLkRpZmZDb250ZXh0O1xudmFyIFBhdGNoQ29udGV4dCA9IHJlcXVpcmUoJy4uL2NvbnRleHRzL3BhdGNoJykuUGF0Y2hDb250ZXh0O1xudmFyIFJldmVyc2VDb250ZXh0ID0gcmVxdWlyZSgnLi4vY29udGV4dHMvcmV2ZXJzZScpLlJldmVyc2VDb250ZXh0O1xuXG52YXIgbGNzID0gcmVxdWlyZSgnLi9sY3MnKTtcblxudmFyIEFSUkFZX01PVkUgPSAzO1xuXG52YXIgaXNBcnJheSA9ICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykgP1xuICAvLyB1c2UgbmF0aXZlIGZ1bmN0aW9uXG4gIEFycmF5LmlzQXJyYXkgOlxuICAvLyB1c2UgaW5zdGFuY2VvZiBvcGVyYXRvclxuICBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIGEgaW5zdGFuY2VvZiBBcnJheTtcbiAgfTtcblxudmFyIGFycmF5SW5kZXhPZiA9IHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJyA/XG4gIGZ1bmN0aW9uKGFycmF5LCBpdGVtKSB7XG4gICAgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSk7XG4gIH0gOiBmdW5jdGlvbihhcnJheSwgaXRlbSkge1xuICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbmZ1bmN0aW9uIGFycmF5c0hhdmVNYXRjaEJ5UmVmKGFycmF5MSwgYXJyYXkyLCBsZW4xLCBsZW4yKSB7XG4gIGZvciAodmFyIGluZGV4MSA9IDA7IGluZGV4MSA8IGxlbjE7IGluZGV4MSsrKSB7XG4gICAgdmFyIHZhbDEgPSBhcnJheTFbaW5kZXgxXTtcbiAgICBmb3IgKHZhciBpbmRleDIgPSAwOyBpbmRleDIgPCBsZW4yOyBpbmRleDIrKykge1xuICAgICAgdmFyIHZhbDIgPSBhcnJheTJbaW5kZXgyXTtcbiAgICAgIGlmICh2YWwxID09PSB2YWwyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtYXRjaEl0ZW1zKGFycmF5MSwgYXJyYXkyLCBpbmRleDEsIGluZGV4MiwgY29udGV4dCkge1xuICB2YXIgdmFsdWUxID0gYXJyYXkxW2luZGV4MV07XG4gIHZhciB2YWx1ZTIgPSBhcnJheTJbaW5kZXgyXTtcbiAgaWYgKHZhbHVlMSA9PT0gdmFsdWUyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZTEgIT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZTIgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBvYmplY3RIYXNoID0gY29udGV4dC5vYmplY3RIYXNoO1xuICBpZiAoIW9iamVjdEhhc2gpIHtcbiAgICAvLyBubyB3YXkgdG8gbWF0Y2ggb2JqZWN0cyB3YXMgcHJvdmlkZWQsIHRyeSBtYXRjaCBieSBwb3NpdGlvblxuICAgIHJldHVybiBjb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiAmJiBpbmRleDEgPT09IGluZGV4MjtcbiAgfVxuICB2YXIgaGFzaDE7XG4gIHZhciBoYXNoMjtcbiAgaWYgKHR5cGVvZiBpbmRleDEgPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5oYXNoQ2FjaGUxID0gY29udGV4dC5oYXNoQ2FjaGUxIHx8IFtdO1xuICAgIGhhc2gxID0gY29udGV4dC5oYXNoQ2FjaGUxW2luZGV4MV07XG4gICAgaWYgKHR5cGVvZiBoYXNoMSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRleHQuaGFzaENhY2hlMVtpbmRleDFdID0gaGFzaDEgPSBvYmplY3RIYXNoKHZhbHVlMSwgaW5kZXgxKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaGFzaDEgPSBvYmplY3RIYXNoKHZhbHVlMSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBoYXNoMSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHR5cGVvZiBpbmRleDIgPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5oYXNoQ2FjaGUyID0gY29udGV4dC5oYXNoQ2FjaGUyIHx8IFtdO1xuICAgIGhhc2gyID0gY29udGV4dC5oYXNoQ2FjaGUyW2luZGV4Ml07XG4gICAgaWYgKHR5cGVvZiBoYXNoMiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRleHQuaGFzaENhY2hlMltpbmRleDJdID0gaGFzaDIgPSBvYmplY3RIYXNoKHZhbHVlMiwgaW5kZXgyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaGFzaDIgPSBvYmplY3RIYXNoKHZhbHVlMik7XG4gIH1cbiAgaWYgKHR5cGVvZiBoYXNoMiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGhhc2gxID09PSBoYXNoMjtcbn1cblxudmFyIGRpZmZGaWx0ZXIgPSBmdW5jdGlvbiBhcnJheXNEaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0LmxlZnRJc0FycmF5KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1hdGNoQ29udGV4dCA9IHtcbiAgICBvYmplY3RIYXNoOiBjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLm9iamVjdEhhc2gsXG4gICAgbWF0Y2hCeVBvc2l0aW9uOiBjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLm1hdGNoQnlQb3NpdGlvblxuICB9O1xuICB2YXIgY29tbW9uSGVhZCA9IDA7XG4gIHZhciBjb21tb25UYWlsID0gMDtcbiAgdmFyIGluZGV4O1xuICB2YXIgaW5kZXgxO1xuICB2YXIgaW5kZXgyO1xuICB2YXIgYXJyYXkxID0gY29udGV4dC5sZWZ0O1xuICB2YXIgYXJyYXkyID0gY29udGV4dC5yaWdodDtcbiAgdmFyIGxlbjEgPSBhcnJheTEubGVuZ3RoO1xuICB2YXIgbGVuMiA9IGFycmF5Mi5sZW5ndGg7XG5cbiAgdmFyIGNoaWxkO1xuXG4gIGlmIChsZW4xID4gMCAmJiBsZW4yID4gMCAmJiAhbWF0Y2hDb250ZXh0Lm9iamVjdEhhc2ggJiZcbiAgICB0eXBlb2YgbWF0Y2hDb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgbWF0Y2hDb250ZXh0Lm1hdGNoQnlQb3NpdGlvbiA9ICFhcnJheXNIYXZlTWF0Y2hCeVJlZihhcnJheTEsIGFycmF5MiwgbGVuMSwgbGVuMik7XG4gIH1cblxuICAvLyBzZXBhcmF0ZSBjb21tb24gaGVhZFxuICB3aGlsZSAoY29tbW9uSGVhZCA8IGxlbjEgJiYgY29tbW9uSGVhZCA8IGxlbjIgJiZcbiAgICBtYXRjaEl0ZW1zKGFycmF5MSwgYXJyYXkyLCBjb21tb25IZWFkLCBjb21tb25IZWFkLCBtYXRjaENvbnRleHQpKSB7XG4gICAgaW5kZXggPSBjb21tb25IZWFkO1xuICAgIGNoaWxkID0gbmV3IERpZmZDb250ZXh0KGNvbnRleHQubGVmdFtpbmRleF0sIGNvbnRleHQucmlnaHRbaW5kZXhdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIGluZGV4KTtcbiAgICBjb21tb25IZWFkKys7XG4gIH1cbiAgLy8gc2VwYXJhdGUgY29tbW9uIHRhaWxcbiAgd2hpbGUgKGNvbW1vblRhaWwgKyBjb21tb25IZWFkIDwgbGVuMSAmJiBjb21tb25UYWlsICsgY29tbW9uSGVhZCA8IGxlbjIgJiZcbiAgICBtYXRjaEl0ZW1zKGFycmF5MSwgYXJyYXkyLCBsZW4xIC0gMSAtIGNvbW1vblRhaWwsIGxlbjIgLSAxIC0gY29tbW9uVGFpbCwgbWF0Y2hDb250ZXh0KSkge1xuICAgIGluZGV4MSA9IGxlbjEgLSAxIC0gY29tbW9uVGFpbDtcbiAgICBpbmRleDIgPSBsZW4yIC0gMSAtIGNvbW1vblRhaWw7XG4gICAgY2hpbGQgPSBuZXcgRGlmZkNvbnRleHQoY29udGV4dC5sZWZ0W2luZGV4MV0sIGNvbnRleHQucmlnaHRbaW5kZXgyXSk7XG4gICAgY29udGV4dC5wdXNoKGNoaWxkLCBpbmRleDIpO1xuICAgIGNvbW1vblRhaWwrKztcbiAgfVxuICB2YXIgcmVzdWx0O1xuICBpZiAoY29tbW9uSGVhZCArIGNvbW1vblRhaWwgPT09IGxlbjEpIHtcbiAgICBpZiAobGVuMSA9PT0gbGVuMikge1xuICAgICAgLy8gYXJyYXlzIGFyZSBpZGVudGljYWxcbiAgICAgIGNvbnRleHQuc2V0UmVzdWx0KHVuZGVmaW5lZCkuZXhpdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB0cml2aWFsIGNhc2UsIGEgYmxvY2sgKDEgb3IgbW9yZSBjb25zZWN1dGl2ZSBpdGVtcykgd2FzIGFkZGVkXG4gICAgcmVzdWx0ID0gcmVzdWx0IHx8IHtcbiAgICAgIF90OiAnYSdcbiAgICB9O1xuICAgIGZvciAoaW5kZXggPSBjb21tb25IZWFkOyBpbmRleCA8IGxlbjIgLSBjb21tb25UYWlsOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gW2FycmF5MltpbmRleF1dO1xuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChyZXN1bHQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbW1vbkhlYWQgKyBjb21tb25UYWlsID09PSBsZW4yKSB7XG4gICAgLy8gdHJpdmlhbCBjYXNlLCBhIGJsb2NrICgxIG9yIG1vcmUgY29uc2VjdXRpdmUgaXRlbXMpIHdhcyByZW1vdmVkXG4gICAgcmVzdWx0ID0gcmVzdWx0IHx8IHtcbiAgICAgIF90OiAnYSdcbiAgICB9O1xuICAgIGZvciAoaW5kZXggPSBjb21tb25IZWFkOyBpbmRleCA8IGxlbjEgLSBjb21tb25UYWlsOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbJ18nICsgaW5kZXhdID0gW2FycmF5MVtpbmRleF0sIDAsIDBdO1xuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChyZXN1bHQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gcmVzZXQgaGFzaCBjYWNoZVxuICBkZWxldGUgbWF0Y2hDb250ZXh0Lmhhc2hDYWNoZTE7XG4gIGRlbGV0ZSBtYXRjaENvbnRleHQuaGFzaENhY2hlMjtcblxuICAvLyBkaWZmIGlzIG5vdCB0cml2aWFsLCBmaW5kIHRoZSBMQ1MgKExvbmdlc3QgQ29tbW9uIFN1YnNlcXVlbmNlKVxuICB2YXIgdHJpbW1lZDEgPSBhcnJheTEuc2xpY2UoY29tbW9uSGVhZCwgbGVuMSAtIGNvbW1vblRhaWwpO1xuICB2YXIgdHJpbW1lZDIgPSBhcnJheTIuc2xpY2UoY29tbW9uSGVhZCwgbGVuMiAtIGNvbW1vblRhaWwpO1xuICB2YXIgc2VxID0gbGNzLmdldChcbiAgICB0cmltbWVkMSwgdHJpbW1lZDIsXG4gICAgbWF0Y2hJdGVtcyxcbiAgICBtYXRjaENvbnRleHRcbiAgKTtcbiAgdmFyIHJlbW92ZWRJdGVtcyA9IFtdO1xuICByZXN1bHQgPSByZXN1bHQgfHwge1xuICAgIF90OiAnYSdcbiAgfTtcbiAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMSAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICBpZiAoYXJyYXlJbmRleE9mKHNlcS5pbmRpY2VzMSwgaW5kZXggLSBjb21tb25IZWFkKSA8IDApIHtcbiAgICAgIC8vIHJlbW92ZWRcbiAgICAgIHJlc3VsdFsnXycgKyBpbmRleF0gPSBbYXJyYXkxW2luZGV4XSwgMCwgMF07XG4gICAgICByZW1vdmVkSXRlbXMucHVzaChpbmRleCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGRldGVjdE1vdmUgPSB0cnVlO1xuICBpZiAoY29udGV4dC5vcHRpb25zICYmIGNvbnRleHQub3B0aW9ucy5hcnJheXMgJiYgY29udGV4dC5vcHRpb25zLmFycmF5cy5kZXRlY3RNb3ZlID09PSBmYWxzZSkge1xuICAgIGRldGVjdE1vdmUgPSBmYWxzZTtcbiAgfVxuICB2YXIgaW5jbHVkZVZhbHVlT25Nb3ZlID0gZmFsc2U7XG4gIGlmIChjb250ZXh0Lm9wdGlvbnMgJiYgY29udGV4dC5vcHRpb25zLmFycmF5cyAmJiBjb250ZXh0Lm9wdGlvbnMuYXJyYXlzLmluY2x1ZGVWYWx1ZU9uTW92ZSkge1xuICAgIGluY2x1ZGVWYWx1ZU9uTW92ZSA9IHRydWU7XG4gIH1cblxuICB2YXIgcmVtb3ZlZEl0ZW1zTGVuZ3RoID0gcmVtb3ZlZEl0ZW1zLmxlbmd0aDtcbiAgZm9yIChpbmRleCA9IGNvbW1vbkhlYWQ7IGluZGV4IDwgbGVuMiAtIGNvbW1vblRhaWw7IGluZGV4KyspIHtcbiAgICB2YXIgaW5kZXhPbkFycmF5MiA9IGFycmF5SW5kZXhPZihzZXEuaW5kaWNlczIsIGluZGV4IC0gY29tbW9uSGVhZCk7XG4gICAgaWYgKGluZGV4T25BcnJheTIgPCAwKSB7XG4gICAgICAvLyBhZGRlZCwgdHJ5IHRvIG1hdGNoIHdpdGggYSByZW1vdmVkIGl0ZW0gYW5kIHJlZ2lzdGVyIGFzIHBvc2l0aW9uIG1vdmVcbiAgICAgIHZhciBpc01vdmUgPSBmYWxzZTtcbiAgICAgIGlmIChkZXRlY3RNb3ZlICYmIHJlbW92ZWRJdGVtc0xlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yICh2YXIgcmVtb3ZlSXRlbUluZGV4MSA9IDA7IHJlbW92ZUl0ZW1JbmRleDEgPCByZW1vdmVkSXRlbXNMZW5ndGg7IHJlbW92ZUl0ZW1JbmRleDErKykge1xuICAgICAgICAgIGluZGV4MSA9IHJlbW92ZWRJdGVtc1tyZW1vdmVJdGVtSW5kZXgxXTtcbiAgICAgICAgICBpZiAobWF0Y2hJdGVtcyh0cmltbWVkMSwgdHJpbW1lZDIsIGluZGV4MSAtIGNvbW1vbkhlYWQsXG4gICAgICAgICAgICBpbmRleCAtIGNvbW1vbkhlYWQsIG1hdGNoQ29udGV4dCkpIHtcbiAgICAgICAgICAgIC8vIHN0b3JlIHBvc2l0aW9uIG1vdmUgYXM6IFtvcmlnaW5hbFZhbHVlLCBuZXdQb3NpdGlvbiwgQVJSQVlfTU9WRV1cbiAgICAgICAgICAgIHJlc3VsdFsnXycgKyBpbmRleDFdLnNwbGljZSgxLCAyLCBpbmRleCwgQVJSQVlfTU9WRSk7XG4gICAgICAgICAgICBpZiAoIWluY2x1ZGVWYWx1ZU9uTW92ZSkge1xuICAgICAgICAgICAgICAvLyBkb24ndCBpbmNsdWRlIG1vdmVkIHZhbHVlIG9uIGRpZmYsIHRvIHNhdmUgYnl0ZXNcbiAgICAgICAgICAgICAgcmVzdWx0WydfJyArIGluZGV4MV1bMF0gPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5kZXgyID0gaW5kZXg7XG4gICAgICAgICAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dChjb250ZXh0LmxlZnRbaW5kZXgxXSwgY29udGV4dC5yaWdodFtpbmRleDJdKTtcbiAgICAgICAgICAgIGNvbnRleHQucHVzaChjaGlsZCwgaW5kZXgyKTtcbiAgICAgICAgICAgIHJlbW92ZWRJdGVtcy5zcGxpY2UocmVtb3ZlSXRlbUluZGV4MSwgMSk7XG4gICAgICAgICAgICBpc01vdmUgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWlzTW92ZSkge1xuICAgICAgICAvLyBhZGRlZFxuICAgICAgICByZXN1bHRbaW5kZXhdID0gW2FycmF5MltpbmRleF1dO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtYXRjaCwgZG8gaW5uZXIgZGlmZlxuICAgICAgaW5kZXgxID0gc2VxLmluZGljZXMxW2luZGV4T25BcnJheTJdICsgY29tbW9uSGVhZDtcbiAgICAgIGluZGV4MiA9IHNlcS5pbmRpY2VzMltpbmRleE9uQXJyYXkyXSArIGNvbW1vbkhlYWQ7XG4gICAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dChjb250ZXh0LmxlZnRbaW5kZXgxXSwgY29udGV4dC5yaWdodFtpbmRleDJdKTtcbiAgICAgIGNvbnRleHQucHVzaChjaGlsZCwgaW5kZXgyKTtcbiAgICB9XG4gIH1cblxuICBjb250ZXh0LnNldFJlc3VsdChyZXN1bHQpLmV4aXQoKTtcblxufTtcbmRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdhcnJheXMnO1xuXG52YXIgY29tcGFyZSA9IHtcbiAgbnVtZXJpY2FsbHk6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYSAtIGI7XG4gIH0sXG4gIG51bWVyaWNhbGx5Qnk6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGFbbmFtZV0gLSBiW25hbWVdO1xuICAgIH07XG4gIH1cbn07XG5cbnZhciBwYXRjaEZpbHRlciA9IGZ1bmN0aW9uIG5lc3RlZFBhdGNoRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCAhPT0gJ2EnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCwgaW5kZXgxO1xuXG4gIHZhciBkZWx0YSA9IGNvbnRleHQuZGVsdGE7XG4gIHZhciBhcnJheSA9IGNvbnRleHQubGVmdDtcblxuICAvLyBmaXJzdCwgc2VwYXJhdGUgcmVtb3ZhbHMsIGluc2VydGlvbnMgYW5kIG1vZGlmaWNhdGlvbnNcbiAgdmFyIHRvUmVtb3ZlID0gW107XG4gIHZhciB0b0luc2VydCA9IFtdO1xuICB2YXIgdG9Nb2RpZnkgPSBbXTtcbiAgZm9yIChpbmRleCBpbiBkZWx0YSkge1xuICAgIGlmIChpbmRleCAhPT0gJ190Jykge1xuICAgICAgaWYgKGluZGV4WzBdID09PSAnXycpIHtcbiAgICAgICAgLy8gcmVtb3ZlZCBpdGVtIGZyb20gb3JpZ2luYWwgYXJyYXlcbiAgICAgICAgaWYgKGRlbHRhW2luZGV4XVsyXSA9PT0gMCB8fCBkZWx0YVtpbmRleF1bMl0gPT09IEFSUkFZX01PVkUpIHtcbiAgICAgICAgICB0b1JlbW92ZS5wdXNoKHBhcnNlSW50KGluZGV4LnNsaWNlKDEpLCAxMCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb25seSByZW1vdmFsIG9yIG1vdmUgY2FuIGJlIGFwcGxpZWQgYXQgb3JpZ2luYWwgYXJyYXkgaW5kaWNlcycgK1xuICAgICAgICAgICAgJywgaW52YWxpZCBkaWZmIHR5cGU6ICcgKyBkZWx0YVtpbmRleF1bMl0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZGVsdGFbaW5kZXhdLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIC8vIGFkZGVkIGl0ZW0gYXQgbmV3IGFycmF5XG4gICAgICAgICAgdG9JbnNlcnQucHVzaCh7XG4gICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoaW5kZXgsIDEwKSxcbiAgICAgICAgICAgIHZhbHVlOiBkZWx0YVtpbmRleF1bMF1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBtb2RpZmllZCBpdGVtIGF0IG5ldyBhcnJheVxuICAgICAgICAgIHRvTW9kaWZ5LnB1c2goe1xuICAgICAgICAgICAgaW5kZXg6IHBhcnNlSW50KGluZGV4LCAxMCksXG4gICAgICAgICAgICBkZWx0YTogZGVsdGFbaW5kZXhdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgaXRlbXMsIGluIHJldmVyc2Ugb3JkZXIgdG8gYXZvaWQgc2F3aW5nIG91ciBvd24gZmxvb3JcbiAgdG9SZW1vdmUgPSB0b1JlbW92ZS5zb3J0KGNvbXBhcmUubnVtZXJpY2FsbHkpO1xuICBmb3IgKGluZGV4ID0gdG9SZW1vdmUubGVuZ3RoIC0gMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuICAgIGluZGV4MSA9IHRvUmVtb3ZlW2luZGV4XTtcbiAgICB2YXIgaW5kZXhEaWZmID0gZGVsdGFbJ18nICsgaW5kZXgxXTtcbiAgICB2YXIgcmVtb3ZlZFZhbHVlID0gYXJyYXkuc3BsaWNlKGluZGV4MSwgMSlbMF07XG4gICAgaWYgKGluZGV4RGlmZlsyXSA9PT0gQVJSQVlfTU9WRSkge1xuICAgICAgLy8gcmVpbnNlcnQgbGF0ZXJcbiAgICAgIHRvSW5zZXJ0LnB1c2goe1xuICAgICAgICBpbmRleDogaW5kZXhEaWZmWzFdLFxuICAgICAgICB2YWx1ZTogcmVtb3ZlZFZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBpbnNlcnQgaXRlbXMsIGluIHJldmVyc2Ugb3JkZXIgdG8gYXZvaWQgbW92aW5nIG91ciBvd24gZmxvb3JcbiAgdG9JbnNlcnQgPSB0b0luc2VydC5zb3J0KGNvbXBhcmUubnVtZXJpY2FsbHlCeSgnaW5kZXgnKSk7XG4gIHZhciB0b0luc2VydExlbmd0aCA9IHRvSW5zZXJ0Lmxlbmd0aDtcbiAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdG9JbnNlcnRMZW5ndGg7IGluZGV4KyspIHtcbiAgICB2YXIgaW5zZXJ0aW9uID0gdG9JbnNlcnRbaW5kZXhdO1xuICAgIGFycmF5LnNwbGljZShpbnNlcnRpb24uaW5kZXgsIDAsIGluc2VydGlvbi52YWx1ZSk7XG4gIH1cblxuICAvLyBhcHBseSBtb2RpZmljYXRpb25zXG4gIHZhciB0b01vZGlmeUxlbmd0aCA9IHRvTW9kaWZ5Lmxlbmd0aDtcbiAgdmFyIGNoaWxkO1xuICBpZiAodG9Nb2RpZnlMZW5ndGggPiAwKSB7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdG9Nb2RpZnlMZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBtb2RpZmljYXRpb24gPSB0b01vZGlmeVtpbmRleF07XG4gICAgICBjaGlsZCA9IG5ldyBQYXRjaENvbnRleHQoY29udGV4dC5sZWZ0W21vZGlmaWNhdGlvbi5pbmRleF0sIG1vZGlmaWNhdGlvbi5kZWx0YSk7XG4gICAgICBjb250ZXh0LnB1c2goY2hpbGQsIG1vZGlmaWNhdGlvbi5pbmRleCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb250ZXh0LmNoaWxkcmVuKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoY29udGV4dC5sZWZ0KS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnRleHQuZXhpdCgpO1xufTtcbnBhdGNoRmlsdGVyLmZpbHRlck5hbWUgPSAnYXJyYXlzJztcblxudmFyIGNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyID0gZnVuY3Rpb24gY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQgfHwgIWNvbnRleHQuY2hpbGRyZW4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEuX3QgIT09ICdhJykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNoaWxkID0gY29udGV4dC5jaGlsZHJlbltpbmRleF07XG4gICAgY29udGV4dC5sZWZ0W2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gIH1cbiAgY29udGV4dC5zZXRSZXN1bHQoY29udGV4dC5sZWZ0KS5leGl0KCk7XG59O1xuY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXIuZmlsdGVyTmFtZSA9ICdhcnJheXNDb2xsZWN0Q2hpbGRyZW4nO1xuXG52YXIgcmV2ZXJzZUZpbHRlciA9IGZ1bmN0aW9uIGFycmF5c1JldmVyc2VGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQubmVzdGVkKSB7XG4gICAgaWYgKGNvbnRleHQuZGVsdGFbMl0gPT09IEFSUkFZX01PVkUpIHtcbiAgICAgIGNvbnRleHQubmV3TmFtZSA9ICdfJyArIGNvbnRleHQuZGVsdGFbMV07XG4gICAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5kZWx0YVswXSwgcGFyc2VJbnQoY29udGV4dC5jaGlsZE5hbWUuc3Vic3RyKDEpLCAxMCksIEFSUkFZX01PVkVdKS5leGl0KCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCAhPT0gJ2EnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuYW1lLCBjaGlsZDtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQuZGVsdGEpIHtcbiAgICBpZiAobmFtZSA9PT0gJ190Jykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNoaWxkID0gbmV3IFJldmVyc2VDb250ZXh0KGNvbnRleHQuZGVsdGFbbmFtZV0pO1xuICAgIGNvbnRleHQucHVzaChjaGlsZCwgbmFtZSk7XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59O1xucmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ2FycmF5cyc7XG5cbnZhciByZXZlcnNlQXJyYXlEZWx0YUluZGV4ID0gZnVuY3Rpb24oZGVsdGEsIGluZGV4LCBpdGVtRGVsdGEpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3N0cmluZycgJiYgaW5kZXhbMF0gPT09ICdfJykge1xuICAgIHJldHVybiBwYXJzZUludChpbmRleC5zdWJzdHIoMSksIDEwKTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KGl0ZW1EZWx0YSkgJiYgaXRlbURlbHRhWzJdID09PSAwKSB7XG4gICAgcmV0dXJuICdfJyArIGluZGV4O1xuICB9XG5cbiAgdmFyIHJldmVyc2VJbmRleCA9ICtpbmRleDtcbiAgZm9yICh2YXIgZGVsdGFJbmRleCBpbiBkZWx0YSkge1xuICAgIHZhciBkZWx0YUl0ZW0gPSBkZWx0YVtkZWx0YUluZGV4XTtcbiAgICBpZiAoaXNBcnJheShkZWx0YUl0ZW0pKSB7XG4gICAgICBpZiAoZGVsdGFJdGVtWzJdID09PSBBUlJBWV9NT1ZFKSB7XG4gICAgICAgIHZhciBtb3ZlRnJvbUluZGV4ID0gcGFyc2VJbnQoZGVsdGFJbmRleC5zdWJzdHIoMSksIDEwKTtcbiAgICAgICAgdmFyIG1vdmVUb0luZGV4ID0gZGVsdGFJdGVtWzFdO1xuICAgICAgICBpZiAobW92ZVRvSW5kZXggPT09ICtpbmRleCkge1xuICAgICAgICAgIHJldHVybiBtb3ZlRnJvbUluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlRnJvbUluZGV4IDw9IHJldmVyc2VJbmRleCAmJiBtb3ZlVG9JbmRleCA+IHJldmVyc2VJbmRleCkge1xuICAgICAgICAgIHJldmVyc2VJbmRleCsrO1xuICAgICAgICB9IGVsc2UgaWYgKG1vdmVGcm9tSW5kZXggPj0gcmV2ZXJzZUluZGV4ICYmIG1vdmVUb0luZGV4IDwgcmV2ZXJzZUluZGV4KSB7XG4gICAgICAgICAgcmV2ZXJzZUluZGV4LS07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGVsdGFJdGVtWzJdID09PSAwKSB7XG4gICAgICAgIHZhciBkZWxldGVJbmRleCA9IHBhcnNlSW50KGRlbHRhSW5kZXguc3Vic3RyKDEpLCAxMCk7XG4gICAgICAgIGlmIChkZWxldGVJbmRleCA8PSByZXZlcnNlSW5kZXgpIHtcbiAgICAgICAgICByZXZlcnNlSW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkZWx0YUl0ZW0ubGVuZ3RoID09PSAxICYmIGRlbHRhSW5kZXggPD0gcmV2ZXJzZUluZGV4KSB7XG4gICAgICAgIHJldmVyc2VJbmRleC0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXZlcnNlSW5kZXg7XG59O1xuXG52YXIgY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlciA9IGZ1bmN0aW9uIGNvbGxlY3RDaGlsZHJlblJldmVyc2VGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQgfHwgIWNvbnRleHQuY2hpbGRyZW4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEuX3QgIT09ICdhJykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgdmFyIGRlbHRhID0ge1xuICAgIF90OiAnYSdcbiAgfTtcblxuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY2hpbGQgPSBjb250ZXh0LmNoaWxkcmVuW2luZGV4XTtcbiAgICB2YXIgbmFtZSA9IGNoaWxkLm5ld05hbWU7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAndW5kZWZpbmVkJykge1xuICAgICAgbmFtZSA9IHJldmVyc2VBcnJheURlbHRhSW5kZXgoY29udGV4dC5kZWx0YSwgY2hpbGQuY2hpbGROYW1lLCBjaGlsZC5yZXN1bHQpO1xuICAgIH1cbiAgICBpZiAoZGVsdGFbbmFtZV0gIT09IGNoaWxkLnJlc3VsdCkge1xuICAgICAgZGVsdGFbbmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gICAgfVxuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KGRlbHRhKS5leGl0KCk7XG59O1xuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ2FycmF5c0NvbGxlY3RDaGlsZHJlbic7XG5cbmV4cG9ydHMuZGlmZkZpbHRlciA9IGRpZmZGaWx0ZXI7XG5leHBvcnRzLnBhdGNoRmlsdGVyID0gcGF0Y2hGaWx0ZXI7XG5leHBvcnRzLmNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXI7XG5leHBvcnRzLnJldmVyc2VGaWx0ZXIgPSByZXZlcnNlRmlsdGVyO1xuZXhwb3J0cy5jb2xsZWN0Q2hpbGRyZW5SZXZlcnNlRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcjtcbiIsInZhciBkaWZmRmlsdGVyID0gZnVuY3Rpb24gZGF0ZXNEaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKGNvbnRleHQubGVmdCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICBpZiAoY29udGV4dC5yaWdodCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgIGlmIChjb250ZXh0LmxlZnQuZ2V0VGltZSgpICE9PSBjb250ZXh0LnJpZ2h0LmdldFRpbWUoKSkge1xuICAgICAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSk7XG4gICAgfVxuICAgIGNvbnRleHQuZXhpdCgpO1xuICB9IGVsc2UgaWYgKGNvbnRleHQucmlnaHQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQubGVmdCwgY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgfVxufTtcbmRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdkYXRlcyc7XG5cbmV4cG9ydHMuZGlmZkZpbHRlciA9IGRpZmZGaWx0ZXI7XG4iLCIvKlxuXG5MQ1MgaW1wbGVtZW50YXRpb24gdGhhdCBzdXBwb3J0cyBhcnJheXMgb3Igc3RyaW5nc1xuXG5yZWZlcmVuY2U6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9uZ2VzdF9jb21tb25fc3Vic2VxdWVuY2VfcHJvYmxlbVxuXG4qL1xuXG52YXIgZGVmYXVsdE1hdGNoID0gZnVuY3Rpb24oYXJyYXkxLCBhcnJheTIsIGluZGV4MSwgaW5kZXgyKSB7XG4gIHJldHVybiBhcnJheTFbaW5kZXgxXSA9PT0gYXJyYXkyW2luZGV4Ml07XG59O1xuXG52YXIgbGVuZ3RoTWF0cml4ID0gZnVuY3Rpb24oYXJyYXkxLCBhcnJheTIsIG1hdGNoLCBjb250ZXh0KSB7XG4gIHZhciBsZW4xID0gYXJyYXkxLmxlbmd0aDtcbiAgdmFyIGxlbjIgPSBhcnJheTIubGVuZ3RoO1xuICB2YXIgeCwgeTtcblxuICAvLyBpbml0aWFsaXplIGVtcHR5IG1hdHJpeCBvZiBsZW4xKzEgeCBsZW4yKzFcbiAgdmFyIG1hdHJpeCA9IFtsZW4xICsgMV07XG4gIGZvciAoeCA9IDA7IHggPCBsZW4xICsgMTsgeCsrKSB7XG4gICAgbWF0cml4W3hdID0gW2xlbjIgKyAxXTtcbiAgICBmb3IgKHkgPSAwOyB5IDwgbGVuMiArIDE7IHkrKykge1xuICAgICAgbWF0cml4W3hdW3ldID0gMDtcbiAgICB9XG4gIH1cbiAgbWF0cml4Lm1hdGNoID0gbWF0Y2g7XG4gIC8vIHNhdmUgc2VxdWVuY2UgbGVuZ3RocyBmb3IgZWFjaCBjb29yZGluYXRlXG4gIGZvciAoeCA9IDE7IHggPCBsZW4xICsgMTsgeCsrKSB7XG4gICAgZm9yICh5ID0gMTsgeSA8IGxlbjIgKyAxOyB5KyspIHtcbiAgICAgIGlmIChtYXRjaChhcnJheTEsIGFycmF5MiwgeCAtIDEsIHkgLSAxLCBjb250ZXh0KSkge1xuICAgICAgICBtYXRyaXhbeF1beV0gPSBtYXRyaXhbeCAtIDFdW3kgLSAxXSArIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXRyaXhbeF1beV0gPSBNYXRoLm1heChtYXRyaXhbeCAtIDFdW3ldLCBtYXRyaXhbeF1beSAtIDFdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1hdHJpeDtcbn07XG5cbnZhciBiYWNrdHJhY2sgPSBmdW5jdGlvbihtYXRyaXgsIGFycmF5MSwgYXJyYXkyLCBpbmRleDEsIGluZGV4MiwgY29udGV4dCkge1xuICBpZiAoaW5kZXgxID09PSAwIHx8IGluZGV4MiA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBzZXF1ZW5jZTogW10sXG4gICAgICBpbmRpY2VzMTogW10sXG4gICAgICBpbmRpY2VzMjogW11cbiAgICB9O1xuICB9XG5cbiAgaWYgKG1hdHJpeC5tYXRjaChhcnJheTEsIGFycmF5MiwgaW5kZXgxIC0gMSwgaW5kZXgyIC0gMSwgY29udGV4dCkpIHtcbiAgICB2YXIgc3Vic2VxdWVuY2UgPSBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgaW5kZXgxIC0gMSwgaW5kZXgyIC0gMSwgY29udGV4dCk7XG4gICAgc3Vic2VxdWVuY2Uuc2VxdWVuY2UucHVzaChhcnJheTFbaW5kZXgxIC0gMV0pO1xuICAgIHN1YnNlcXVlbmNlLmluZGljZXMxLnB1c2goaW5kZXgxIC0gMSk7XG4gICAgc3Vic2VxdWVuY2UuaW5kaWNlczIucHVzaChpbmRleDIgLSAxKTtcbiAgICByZXR1cm4gc3Vic2VxdWVuY2U7XG4gIH1cblxuICBpZiAobWF0cml4W2luZGV4MV1baW5kZXgyIC0gMV0gPiBtYXRyaXhbaW5kZXgxIC0gMV1baW5kZXgyXSkge1xuICAgIHJldHVybiBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgaW5kZXgxLCBpbmRleDIgLSAxLCBjb250ZXh0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFja3RyYWNrKG1hdHJpeCwgYXJyYXkxLCBhcnJheTIsIGluZGV4MSAtIDEsIGluZGV4MiwgY29udGV4dCk7XG4gIH1cbn07XG5cbnZhciBnZXQgPSBmdW5jdGlvbihhcnJheTEsIGFycmF5MiwgbWF0Y2gsIGNvbnRleHQpIHtcbiAgY29udGV4dCA9IGNvbnRleHQgfHwge307XG4gIHZhciBtYXRyaXggPSBsZW5ndGhNYXRyaXgoYXJyYXkxLCBhcnJheTIsIG1hdGNoIHx8IGRlZmF1bHRNYXRjaCwgY29udGV4dCk7XG4gIHZhciByZXN1bHQgPSBiYWNrdHJhY2sobWF0cml4LCBhcnJheTEsIGFycmF5MiwgYXJyYXkxLmxlbmd0aCwgYXJyYXkyLmxlbmd0aCwgY29udGV4dCk7XG4gIGlmICh0eXBlb2YgYXJyYXkxID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYXJyYXkyID09PSAnc3RyaW5nJykge1xuICAgIHJlc3VsdC5zZXF1ZW5jZSA9IHJlc3VsdC5zZXF1ZW5jZS5qb2luKCcnKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0cy5nZXQgPSBnZXQ7XG4iLCJ2YXIgRGlmZkNvbnRleHQgPSByZXF1aXJlKCcuLi9jb250ZXh0cy9kaWZmJykuRGlmZkNvbnRleHQ7XG52YXIgUGF0Y2hDb250ZXh0ID0gcmVxdWlyZSgnLi4vY29udGV4dHMvcGF0Y2gnKS5QYXRjaENvbnRleHQ7XG52YXIgUmV2ZXJzZUNvbnRleHQgPSByZXF1aXJlKCcuLi9jb250ZXh0cy9yZXZlcnNlJykuUmV2ZXJzZUNvbnRleHQ7XG5cbnZhciBjb2xsZWN0Q2hpbGRyZW5EaWZmRmlsdGVyID0gZnVuY3Rpb24gY29sbGVjdENoaWxkcmVuRGlmZkZpbHRlcihjb250ZXh0KSB7XG4gIGlmICghY29udGV4dCB8fCAhY29udGV4dC5jaGlsZHJlbikge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgdmFyIHJlc3VsdCA9IGNvbnRleHQucmVzdWx0O1xuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY2hpbGQgPSBjb250ZXh0LmNoaWxkcmVuW2luZGV4XTtcbiAgICBpZiAodHlwZW9mIGNoaWxkLnJlc3VsdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgcmVzdWx0W2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gIH1cbiAgaWYgKHJlc3VsdCAmJiBjb250ZXh0LmxlZnRJc0FycmF5KSB7XG4gICAgcmVzdWx0Ll90ID0gJ2EnO1xuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KHJlc3VsdCkuZXhpdCgpO1xufTtcbmNvbGxlY3RDaGlsZHJlbkRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdjb2xsZWN0Q2hpbGRyZW4nO1xuXG52YXIgb2JqZWN0c0RpZmZGaWx0ZXIgPSBmdW5jdGlvbiBvYmplY3RzRGlmZkZpbHRlcihjb250ZXh0KSB7XG4gIGlmIChjb250ZXh0LmxlZnRJc0FycmF5IHx8IGNvbnRleHQubGVmdFR5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG5hbWUsIGNoaWxkLCBwcm9wZXJ0eUZpbHRlciA9IGNvbnRleHQub3B0aW9ucy5wcm9wZXJ0eUZpbHRlcjtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQubGVmdCkge1xuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHQubGVmdCwgbmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAocHJvcGVydHlGaWx0ZXIgJiYgIXByb3BlcnR5RmlsdGVyKG5hbWUsIGNvbnRleHQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY2hpbGQgPSBuZXcgRGlmZkNvbnRleHQoY29udGV4dC5sZWZ0W25hbWVdLCBjb250ZXh0LnJpZ2h0W25hbWVdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIG5hbWUpO1xuICB9XG4gIGZvciAobmFtZSBpbiBjb250ZXh0LnJpZ2h0KSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29udGV4dC5yaWdodCwgbmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAocHJvcGVydHlGaWx0ZXIgJiYgIXByb3BlcnR5RmlsdGVyKG5hbWUsIGNvbnRleHQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0LmxlZnRbbmFtZV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjaGlsZCA9IG5ldyBEaWZmQ29udGV4dCh1bmRlZmluZWQsIGNvbnRleHQucmlnaHRbbmFtZV0pO1xuICAgICAgY29udGV4dC5wdXNoKGNoaWxkLCBuYW1lKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbnRleHQuY2hpbGRyZW4gfHwgY29udGV4dC5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dC5leGl0KCk7XG59O1xub2JqZWN0c0RpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICdvYmplY3RzJztcblxudmFyIHBhdGNoRmlsdGVyID0gZnVuY3Rpb24gbmVzdGVkUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoIWNvbnRleHQubmVzdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLl90KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuYW1lLCBjaGlsZDtcbiAgZm9yIChuYW1lIGluIGNvbnRleHQuZGVsdGEpIHtcbiAgICBjaGlsZCA9IG5ldyBQYXRjaENvbnRleHQoY29udGV4dC5sZWZ0W25hbWVdLCBjb250ZXh0LmRlbHRhW25hbWVdKTtcbiAgICBjb250ZXh0LnB1c2goY2hpbGQsIG5hbWUpO1xuICB9XG4gIGNvbnRleHQuZXhpdCgpO1xufTtcbnBhdGNoRmlsdGVyLmZpbHRlck5hbWUgPSAnb2JqZWN0cyc7XG5cbnZhciBjb2xsZWN0Q2hpbGRyZW5QYXRjaEZpbHRlciA9IGZ1bmN0aW9uIGNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0IHx8ICFjb250ZXh0LmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLl90KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsZW5ndGggPSBjb250ZXh0LmNoaWxkcmVuLmxlbmd0aDtcbiAgdmFyIGNoaWxkO1xuICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY2hpbGQgPSBjb250ZXh0LmNoaWxkcmVuW2luZGV4XTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbnRleHQubGVmdCwgY2hpbGQuY2hpbGROYW1lKSAmJiBjaGlsZC5yZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVsZXRlIGNvbnRleHQubGVmdFtjaGlsZC5jaGlsZE5hbWVdO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dC5sZWZ0W2NoaWxkLmNoaWxkTmFtZV0gIT09IGNoaWxkLnJlc3VsdCkge1xuICAgICAgY29udGV4dC5sZWZ0W2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gICAgfVxuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQubGVmdCkuZXhpdCgpO1xufTtcbmNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyLmZpbHRlck5hbWUgPSAnY29sbGVjdENoaWxkcmVuJztcblxudmFyIHJldmVyc2VGaWx0ZXIgPSBmdW5jdGlvbiBuZXN0ZWRSZXZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKCFjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbmFtZSwgY2hpbGQ7XG4gIGZvciAobmFtZSBpbiBjb250ZXh0LmRlbHRhKSB7XG4gICAgY2hpbGQgPSBuZXcgUmV2ZXJzZUNvbnRleHQoY29udGV4dC5kZWx0YVtuYW1lXSk7XG4gICAgY29udGV4dC5wdXNoKGNoaWxkLCBuYW1lKTtcbiAgfVxuICBjb250ZXh0LmV4aXQoKTtcbn07XG5yZXZlcnNlRmlsdGVyLmZpbHRlck5hbWUgPSAnb2JqZWN0cyc7XG5cbnZhciBjb2xsZWN0Q2hpbGRyZW5SZXZlcnNlRmlsdGVyID0gZnVuY3Rpb24gY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcihjb250ZXh0KSB7XG4gIGlmICghY29udGV4dCB8fCAhY29udGV4dC5jaGlsZHJlbikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5fdCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuZ3RoID0gY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7XG4gIHZhciBjaGlsZDtcbiAgdmFyIGRlbHRhID0ge307XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICBjaGlsZCA9IGNvbnRleHQuY2hpbGRyZW5baW5kZXhdO1xuICAgIGlmIChkZWx0YVtjaGlsZC5jaGlsZE5hbWVdICE9PSBjaGlsZC5yZXN1bHQpIHtcbiAgICAgIGRlbHRhW2NoaWxkLmNoaWxkTmFtZV0gPSBjaGlsZC5yZXN1bHQ7XG4gICAgfVxuICB9XG4gIGNvbnRleHQuc2V0UmVzdWx0KGRlbHRhKS5leGl0KCk7XG59O1xuY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlci5maWx0ZXJOYW1lID0gJ2NvbGxlY3RDaGlsZHJlbic7XG5cbmV4cG9ydHMuY29sbGVjdENoaWxkcmVuRGlmZkZpbHRlciA9IGNvbGxlY3RDaGlsZHJlbkRpZmZGaWx0ZXI7XG5leHBvcnRzLm9iamVjdHNEaWZmRmlsdGVyID0gb2JqZWN0c0RpZmZGaWx0ZXI7XG5leHBvcnRzLnBhdGNoRmlsdGVyID0gcGF0Y2hGaWx0ZXI7XG5leHBvcnRzLmNvbGxlY3RDaGlsZHJlblBhdGNoRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUGF0Y2hGaWx0ZXI7XG5leHBvcnRzLnJldmVyc2VGaWx0ZXIgPSByZXZlcnNlRmlsdGVyO1xuZXhwb3J0cy5jb2xsZWN0Q2hpbGRyZW5SZXZlcnNlRmlsdGVyID0gY29sbGVjdENoaWxkcmVuUmV2ZXJzZUZpbHRlcjtcbiIsIi8qIGdsb2JhbCBkaWZmX21hdGNoX3BhdGNoICovXG52YXIgVEVYVF9ESUZGID0gMjtcbnZhciBERUZBVUxUX01JTl9MRU5HVEggPSA2MDtcbnZhciBjYWNoZWREaWZmUGF0Y2ggPSBudWxsO1xuXG52YXIgZ2V0RGlmZk1hdGNoUGF0Y2ggPSBmdW5jdGlvbihyZXF1aXJlZCkge1xuICAvKmpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG5cbiAgaWYgKCFjYWNoZWREaWZmUGF0Y2gpIHtcbiAgICB2YXIgaW5zdGFuY2U7XG4gICAgaWYgKHR5cGVvZiBkaWZmX21hdGNoX3BhdGNoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gYWxyZWFkeSBsb2FkZWQsIHByb2JhYmx5IGEgYnJvd3NlclxuICAgICAgaW5zdGFuY2UgPSB0eXBlb2YgZGlmZl9tYXRjaF9wYXRjaCA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIG5ldyBkaWZmX21hdGNoX3BhdGNoKCkgOiBuZXcgZGlmZl9tYXRjaF9wYXRjaC5kaWZmX21hdGNoX3BhdGNoKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGRtcE1vZHVsZU5hbWUgPSAnZGlmZl9tYXRjaF9wYXRjaF91bmNvbXByZXNzZWQnO1xuICAgICAgICB2YXIgZG1wID0gcmVxdWlyZSgnLi4vLi4vcHVibGljL2V4dGVybmFsLycgKyBkbXBNb2R1bGVOYW1lKTtcbiAgICAgICAgaW5zdGFuY2UgPSBuZXcgZG1wLmRpZmZfbWF0Y2hfcGF0Y2goKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpbnN0YW5jZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGlmICghcmVxdWlyZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ3RleHQgZGlmZl9tYXRjaF9wYXRjaCBsaWJyYXJ5IG5vdCBmb3VuZCcpO1xuICAgICAgZXJyb3IuZGlmZl9tYXRjaF9wYXRjaF9ub3RfZm91bmQgPSB0cnVlO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGNhY2hlZERpZmZQYXRjaCA9IHtcbiAgICAgIGRpZmY6IGZ1bmN0aW9uKHR4dDEsIHR4dDIpIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLnBhdGNoX3RvVGV4dChpbnN0YW5jZS5wYXRjaF9tYWtlKHR4dDEsIHR4dDIpKTtcbiAgICAgIH0sXG4gICAgICBwYXRjaDogZnVuY3Rpb24odHh0MSwgcGF0Y2gpIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBpbnN0YW5jZS5wYXRjaF9hcHBseShpbnN0YW5jZS5wYXRjaF9mcm9tVGV4dChwYXRjaCksIHR4dDEpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHNbMV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoIXJlc3VsdHNbMV1baV0pIHtcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcigndGV4dCBwYXRjaCBmYWlsZWQnKTtcbiAgICAgICAgICAgIGVycm9yLnRleHRQYXRjaEZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGNhY2hlZERpZmZQYXRjaDtcbn07XG5cbnZhciBkaWZmRmlsdGVyID0gZnVuY3Rpb24gdGV4dHNEaWZmRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKGNvbnRleHQubGVmdFR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtaW5MZW5ndGggPSAoY29udGV4dC5vcHRpb25zICYmIGNvbnRleHQub3B0aW9ucy50ZXh0RGlmZiAmJlxuICAgIGNvbnRleHQub3B0aW9ucy50ZXh0RGlmZi5taW5MZW5ndGgpIHx8IERFRkFVTFRfTUlOX0xFTkdUSDtcbiAgaWYgKGNvbnRleHQubGVmdC5sZW5ndGggPCBtaW5MZW5ndGggfHxcbiAgICBjb250ZXh0LnJpZ2h0Lmxlbmd0aCA8IG1pbkxlbmd0aCkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGxhcmdlIHRleHQsIHRyeSB0byB1c2UgYSB0ZXh0LWRpZmYgYWxnb3JpdGhtXG4gIHZhciBkaWZmTWF0Y2hQYXRjaCA9IGdldERpZmZNYXRjaFBhdGNoKCk7XG4gIGlmICghZGlmZk1hdGNoUGF0Y2gpIHtcbiAgICAvLyBkaWZmLW1hdGNoLXBhdGNoIGxpYnJhcnkgbm90IGF2YWlsYWJsZSwgZmFsbGJhY2sgdG8gcmVndWxhciBzdHJpbmcgcmVwbGFjZVxuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBkaWZmID0gZGlmZk1hdGNoUGF0Y2guZGlmZjtcbiAgY29udGV4dC5zZXRSZXN1bHQoW2RpZmYoY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0KSwgMCwgVEVYVF9ESUZGXSkuZXhpdCgpO1xufTtcbmRpZmZGaWx0ZXIuZmlsdGVyTmFtZSA9ICd0ZXh0cyc7XG5cbnZhciBwYXRjaEZpbHRlciA9IGZ1bmN0aW9uIHRleHRzUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAoY29udGV4dC5uZXN0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGFbMl0gIT09IFRFWFRfRElGRikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHRleHQtZGlmZiwgdXNlIGEgdGV4dC1wYXRjaCBhbGdvcml0aG1cbiAgdmFyIHBhdGNoID0gZ2V0RGlmZk1hdGNoUGF0Y2godHJ1ZSkucGF0Y2g7XG4gIGNvbnRleHQuc2V0UmVzdWx0KHBhdGNoKGNvbnRleHQubGVmdCwgY29udGV4dC5kZWx0YVswXSkpLmV4aXQoKTtcbn07XG5wYXRjaEZpbHRlci5maWx0ZXJOYW1lID0gJ3RleHRzJztcblxudmFyIHRleHREZWx0YVJldmVyc2UgPSBmdW5jdGlvbihkZWx0YSkge1xuICB2YXIgaSwgbCwgbGluZXMsIGxpbmUsIGxpbmVUbXAsIGhlYWRlciA9IG51bGwsXG4gICAgaGVhZGVyUmVnZXggPSAvXkBAICtcXC0oXFxkKyksKFxcZCspICtcXCsoXFxkKyksKFxcZCspICtAQCQvLFxuICAgIGxpbmVIZWFkZXIsIGxpbmVBZGQsIGxpbmVSZW1vdmU7XG4gIGxpbmVzID0gZGVsdGEuc3BsaXQoJ1xcbicpO1xuICBmb3IgKGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIHZhciBsaW5lU3RhcnQgPSBsaW5lLnNsaWNlKDAsIDEpO1xuICAgIGlmIChsaW5lU3RhcnQgPT09ICdAJykge1xuICAgICAgaGVhZGVyID0gaGVhZGVyUmVnZXguZXhlYyhsaW5lKTtcbiAgICAgIGxpbmVIZWFkZXIgPSBpO1xuICAgICAgbGluZUFkZCA9IG51bGw7XG4gICAgICBsaW5lUmVtb3ZlID0gbnVsbDtcblxuICAgICAgLy8gZml4IGhlYWRlclxuICAgICAgbGluZXNbbGluZUhlYWRlcl0gPSAnQEAgLScgKyBoZWFkZXJbM10gKyAnLCcgKyBoZWFkZXJbNF0gKyAnICsnICsgaGVhZGVyWzFdICsgJywnICsgaGVhZGVyWzJdICsgJyBAQCc7XG4gICAgfSBlbHNlIGlmIChsaW5lU3RhcnQgPT09ICcrJykge1xuICAgICAgbGluZUFkZCA9IGk7XG4gICAgICBsaW5lc1tpXSA9ICctJyArIGxpbmVzW2ldLnNsaWNlKDEpO1xuICAgICAgaWYgKGxpbmVzW2kgLSAxXS5zbGljZSgwLCAxKSA9PT0gJysnKSB7XG4gICAgICAgIC8vIHN3YXAgbGluZXMgdG8ga2VlcCBkZWZhdWx0IG9yZGVyICgtKylcbiAgICAgICAgbGluZVRtcCA9IGxpbmVzW2ldO1xuICAgICAgICBsaW5lc1tpXSA9IGxpbmVzW2kgLSAxXTtcbiAgICAgICAgbGluZXNbaSAtIDFdID0gbGluZVRtcDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGxpbmVTdGFydCA9PT0gJy0nKSB7XG4gICAgICBsaW5lUmVtb3ZlID0gaTtcbiAgICAgIGxpbmVzW2ldID0gJysnICsgbGluZXNbaV0uc2xpY2UoMSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbn07XG5cbnZhciByZXZlcnNlRmlsdGVyID0gZnVuY3Rpb24gdGV4dHNSZXZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKGNvbnRleHQubmVzdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhWzJdICE9PSBURVhUX0RJRkYpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyB0ZXh0LWRpZmYsIHVzZSBhIHRleHQtZGlmZiBhbGdvcml0aG1cbiAgY29udGV4dC5zZXRSZXN1bHQoW3RleHREZWx0YVJldmVyc2UoY29udGV4dC5kZWx0YVswXSksIDAsIFRFWFRfRElGRl0pLmV4aXQoKTtcbn07XG5yZXZlcnNlRmlsdGVyLmZpbHRlck5hbWUgPSAndGV4dHMnO1xuXG5leHBvcnRzLmRpZmZGaWx0ZXIgPSBkaWZmRmlsdGVyO1xuZXhwb3J0cy5wYXRjaEZpbHRlciA9IHBhdGNoRmlsdGVyO1xuZXhwb3J0cy5yZXZlcnNlRmlsdGVyID0gcmV2ZXJzZUZpbHRlcjtcbiIsInZhciBpc0FycmF5ID0gKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSA/XG4gIC8vIHVzZSBuYXRpdmUgZnVuY3Rpb25cbiAgQXJyYXkuaXNBcnJheSA6XG4gIC8vIHVzZSBpbnN0YW5jZW9mIG9wZXJhdG9yXG4gIGZ1bmN0aW9uKGEpIHtcbiAgICByZXR1cm4gYSBpbnN0YW5jZW9mIEFycmF5O1xuICB9O1xuXG52YXIgZGlmZkZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxNYXRjaGVzRGlmZkZpbHRlcihjb250ZXh0KSB7XG4gIGlmIChjb250ZXh0LmxlZnQgPT09IGNvbnRleHQucmlnaHQpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBjb250ZXh0LmxlZnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Z1bmN0aW9ucyBhcmUgbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIDAsIDBdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0eXBlb2YgY29udGV4dC5sZWZ0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBjb250ZXh0LnJpZ2h0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmdW5jdGlvbnMgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxuICBjb250ZXh0LmxlZnRUeXBlID0gY29udGV4dC5sZWZ0ID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGNvbnRleHQubGVmdDtcbiAgY29udGV4dC5yaWdodFR5cGUgPSBjb250ZXh0LnJpZ2h0ID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGNvbnRleHQucmlnaHQ7XG4gIGlmIChjb250ZXh0LmxlZnRUeXBlICE9PSBjb250ZXh0LnJpZ2h0VHlwZSkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmxlZnQsIGNvbnRleHQucmlnaHRdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmxlZnRUeXBlID09PSAnYm9vbGVhbicgfHwgY29udGV4dC5sZWZ0VHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5sZWZ0LCBjb250ZXh0LnJpZ2h0XSkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5sZWZ0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb250ZXh0LmxlZnRJc0FycmF5ID0gaXNBcnJheShjb250ZXh0LmxlZnQpO1xuICB9XG4gIGlmIChjb250ZXh0LnJpZ2h0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb250ZXh0LnJpZ2h0SXNBcnJheSA9IGlzQXJyYXkoY29udGV4dC5yaWdodCk7XG4gIH1cbiAgaWYgKGNvbnRleHQubGVmdElzQXJyYXkgIT09IGNvbnRleHQucmlnaHRJc0FycmF5KSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoW2NvbnRleHQubGVmdCwgY29udGV4dC5yaWdodF0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbn07XG5kaWZmRmlsdGVyLmZpbHRlck5hbWUgPSAndHJpdmlhbCc7XG5cbnZhciBwYXRjaEZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxNYXRjaGVzUGF0Y2hGaWx0ZXIoY29udGV4dCkge1xuICBpZiAodHlwZW9mIGNvbnRleHQuZGVsdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29udGV4dC5zZXRSZXN1bHQoY29udGV4dC5sZWZ0KS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnRleHQubmVzdGVkID0gIWlzQXJyYXkoY29udGV4dC5kZWx0YSk7XG4gIGlmIChjb250ZXh0Lm5lc3RlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5sZW5ndGggPT09IDEpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChjb250ZXh0LmRlbHRhWzBdKS5leGl0KCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLmxlbmd0aCA9PT0gMikge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQuZGVsdGFbMV0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEubGVuZ3RoID09PSAzICYmIGNvbnRleHQuZGVsdGFbMl0gPT09IDApIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdCh1bmRlZmluZWQpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbn07XG5wYXRjaEZpbHRlci5maWx0ZXJOYW1lID0gJ3RyaXZpYWwnO1xuXG52YXIgcmV2ZXJzZUZpbHRlciA9IGZ1bmN0aW9uIHRyaXZpYWxSZWZlcnNlRmlsdGVyKGNvbnRleHQpIHtcbiAgaWYgKHR5cGVvZiBjb250ZXh0LmRlbHRhID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KGNvbnRleHQuZGVsdGEpLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29udGV4dC5uZXN0ZWQgPSAhaXNBcnJheShjb250ZXh0LmRlbHRhKTtcbiAgaWYgKGNvbnRleHQubmVzdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChjb250ZXh0LmRlbHRhLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbnRleHQuc2V0UmVzdWx0KFtjb250ZXh0LmRlbHRhWzBdLCAwLCAwXSkuZXhpdCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoY29udGV4dC5kZWx0YS5sZW5ndGggPT09IDIpIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5kZWx0YVsxXSwgY29udGV4dC5kZWx0YVswXV0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGNvbnRleHQuZGVsdGEubGVuZ3RoID09PSAzICYmIGNvbnRleHQuZGVsdGFbMl0gPT09IDApIHtcbiAgICBjb250ZXh0LnNldFJlc3VsdChbY29udGV4dC5kZWx0YVswXV0pLmV4aXQoKTtcbiAgICByZXR1cm47XG4gIH1cbn07XG5yZXZlcnNlRmlsdGVyLmZpbHRlck5hbWUgPSAndHJpdmlhbCc7XG5cbmV4cG9ydHMuZGlmZkZpbHRlciA9IGRpZmZGaWx0ZXI7XG5leHBvcnRzLnBhdGNoRmlsdGVyID0gcGF0Y2hGaWx0ZXI7XG5leHBvcnRzLnJldmVyc2VGaWx0ZXIgPSByZXZlcnNlRmlsdGVyO1xuIiwiXG52YXIgZW52aXJvbm1lbnQgPSByZXF1aXJlKCcuL2Vudmlyb25tZW50Jyk7XG5cbnZhciBEaWZmUGF0Y2hlciA9IHJlcXVpcmUoJy4vZGlmZnBhdGNoZXInKS5EaWZmUGF0Y2hlcjtcbmV4cG9ydHMuRGlmZlBhdGNoZXIgPSBEaWZmUGF0Y2hlcjtcblxuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgcmV0dXJuIG5ldyBEaWZmUGF0Y2hlcihvcHRpb25zKTtcbn07XG5cbmV4cG9ydHMuZGF0ZVJldml2ZXIgPSByZXF1aXJlKCcuL2RhdGUtcmV2aXZlcicpO1xuXG52YXIgZGVmYXVsdEluc3RhbmNlO1xuXG5leHBvcnRzLmRpZmYgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFkZWZhdWx0SW5zdGFuY2UpIHtcbiAgICBkZWZhdWx0SW5zdGFuY2UgPSBuZXcgRGlmZlBhdGNoZXIoKTtcbiAgfVxuICByZXR1cm4gZGVmYXVsdEluc3RhbmNlLmRpZmYuYXBwbHkoZGVmYXVsdEluc3RhbmNlLCBhcmd1bWVudHMpO1xufTtcblxuZXhwb3J0cy5wYXRjaCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWRlZmF1bHRJbnN0YW5jZSkge1xuICAgIGRlZmF1bHRJbnN0YW5jZSA9IG5ldyBEaWZmUGF0Y2hlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UucGF0Y2guYXBwbHkoZGVmYXVsdEluc3RhbmNlLCBhcmd1bWVudHMpO1xufTtcblxuZXhwb3J0cy51bnBhdGNoID0gZnVuY3Rpb24oKSB7XG4gIGlmICghZGVmYXVsdEluc3RhbmNlKSB7XG4gICAgZGVmYXVsdEluc3RhbmNlID0gbmV3IERpZmZQYXRjaGVyKCk7XG4gIH1cbiAgcmV0dXJuIGRlZmF1bHRJbnN0YW5jZS51bnBhdGNoLmFwcGx5KGRlZmF1bHRJbnN0YW5jZSwgYXJndW1lbnRzKTtcbn07XG5cbmV4cG9ydHMucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWRlZmF1bHRJbnN0YW5jZSkge1xuICAgIGRlZmF1bHRJbnN0YW5jZSA9IG5ldyBEaWZmUGF0Y2hlcigpO1xuICB9XG4gIHJldHVybiBkZWZhdWx0SW5zdGFuY2UucmV2ZXJzZS5hcHBseShkZWZhdWx0SW5zdGFuY2UsIGFyZ3VtZW50cyk7XG59O1xuXG5pZiAoZW52aXJvbm1lbnQuaXNCcm93c2VyKSB7XG4gIGV4cG9ydHMuaG9tZXBhZ2UgPSAne3twYWNrYWdlLWhvbWVwYWdlfX0nO1xuICBleHBvcnRzLnZlcnNpb24gPSAne3twYWNrYWdlLXZlcnNpb259fSc7XG59IGVsc2Uge1xuICB2YXIgcGFja2FnZUluZm9Nb2R1bGVOYW1lID0gJy4uL3BhY2thZ2UuanNvbic7XG4gIHZhciBwYWNrYWdlSW5mbyA9IHJlcXVpcmUocGFja2FnZUluZm9Nb2R1bGVOYW1lKTtcbiAgZXhwb3J0cy5ob21lcGFnZSA9IHBhY2thZ2VJbmZvLmhvbWVwYWdlO1xuICBleHBvcnRzLnZlcnNpb24gPSBwYWNrYWdlSW5mby52ZXJzaW9uO1xuXG4gIHZhciBmb3JtYXR0ZXJNb2R1bGVOYW1lID0gJy4vZm9ybWF0dGVycyc7XG4gIHZhciBmb3JtYXR0ZXJzID0gcmVxdWlyZShmb3JtYXR0ZXJNb2R1bGVOYW1lKTtcbiAgZXhwb3J0cy5mb3JtYXR0ZXJzID0gZm9ybWF0dGVycztcbiAgLy8gc2hvcnRjdXQgZm9yIGNvbnNvbGVcbiAgZXhwb3J0cy5jb25zb2xlID0gZm9ybWF0dGVycy5jb25zb2xlO1xufVxuIiwidmFyIFBpcGUgPSBmdW5jdGlvbiBQaXBlKG5hbWUpIHtcbiAgdGhpcy5uYW1lID0gbmFtZTtcbiAgdGhpcy5maWx0ZXJzID0gW107XG59O1xuXG5QaXBlLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgaWYgKCF0aGlzLnByb2Nlc3Nvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYWRkIHRoaXMgcGlwZSB0byBhIHByb2Nlc3NvciBiZWZvcmUgdXNpbmcgaXQnKTtcbiAgfVxuICB2YXIgZGVidWcgPSB0aGlzLmRlYnVnO1xuICB2YXIgbGVuZ3RoID0gdGhpcy5maWx0ZXJzLmxlbmd0aDtcbiAgdmFyIGNvbnRleHQgPSBpbnB1dDtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgIHZhciBmaWx0ZXIgPSB0aGlzLmZpbHRlcnNbaW5kZXhdO1xuICAgIGlmIChkZWJ1Zykge1xuICAgICAgdGhpcy5sb2coJ2ZpbHRlcjogJyArIGZpbHRlci5maWx0ZXJOYW1lKTtcbiAgICB9XG4gICAgZmlsdGVyKGNvbnRleHQpO1xuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcgJiYgY29udGV4dC5leGl0aW5nKSB7XG4gICAgICBjb250ZXh0LmV4aXRpbmcgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoIWNvbnRleHQubmV4dCAmJiB0aGlzLnJlc3VsdENoZWNrKSB7XG4gICAgdGhpcy5yZXN1bHRDaGVjayhjb250ZXh0KTtcbiAgfVxufTtcblxuUGlwZS5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24obXNnKSB7XG4gIGNvbnNvbGUubG9nKCdbanNvbmRpZmZwYXRjaF0gJyArIHRoaXMubmFtZSArICcgcGlwZSwgJyArIG1zZyk7XG59O1xuXG5QaXBlLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5maWx0ZXJzLnB1c2guYXBwbHkodGhpcy5maWx0ZXJzLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblBpcGUucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5maWx0ZXJzLnVuc2hpZnQuYXBwbHkodGhpcy5maWx0ZXJzLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblBpcGUucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihmaWx0ZXJOYW1lKSB7XG4gIGlmICghZmlsdGVyTmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignYSBmaWx0ZXIgbmFtZSBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmZpbHRlcnMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgdmFyIGZpbHRlciA9IHRoaXMuZmlsdGVyc1tpbmRleF07XG4gICAgaWYgKGZpbHRlci5maWx0ZXJOYW1lID09PSBmaWx0ZXJOYW1lKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignZmlsdGVyIG5vdCBmb3VuZDogJyArIGZpbHRlck5hbWUpO1xufTtcblxuUGlwZS5wcm90b3R5cGUubGlzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbmFtZXMgPSBbXTtcbiAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuZmlsdGVycy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICB2YXIgZmlsdGVyID0gdGhpcy5maWx0ZXJzW2luZGV4XTtcbiAgICBuYW1lcy5wdXNoKGZpbHRlci5maWx0ZXJOYW1lKTtcbiAgfVxuICByZXR1cm4gbmFtZXM7XG59O1xuXG5QaXBlLnByb3RvdHlwZS5hZnRlciA9IGZ1bmN0aW9uKGZpbHRlck5hbWUpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGZpbHRlck5hbWUpO1xuICB2YXIgcGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgaWYgKCFwYXJhbXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhIGZpbHRlciBpcyByZXF1aXJlZCcpO1xuICB9XG4gIHBhcmFtcy51bnNoaWZ0KGluZGV4ICsgMSwgMCk7XG4gIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkodGhpcy5maWx0ZXJzLCBwYXJhbXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblBpcGUucHJvdG90eXBlLmJlZm9yZSA9IGZ1bmN0aW9uKGZpbHRlck5hbWUpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKGZpbHRlck5hbWUpO1xuICB2YXIgcGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgaWYgKCFwYXJhbXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhIGZpbHRlciBpcyByZXF1aXJlZCcpO1xuICB9XG4gIHBhcmFtcy51bnNoaWZ0KGluZGV4LCAwKTtcbiAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSh0aGlzLmZpbHRlcnMsIHBhcmFtcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUGlwZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5maWx0ZXJzLmxlbmd0aCA9IDA7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUGlwZS5wcm90b3R5cGUuc2hvdWxkSGF2ZVJlc3VsdCA9IGZ1bmN0aW9uKHNob3VsZCkge1xuICBpZiAoc2hvdWxkID09PSBmYWxzZSkge1xuICAgIHRoaXMucmVzdWx0Q2hlY2sgPSBudWxsO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5yZXN1bHRDaGVjaykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcGlwZSA9IHRoaXM7XG4gIHRoaXMucmVzdWx0Q2hlY2sgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYgKCFjb250ZXh0Lmhhc1Jlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coY29udGV4dCk7XG4gICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IocGlwZS5uYW1lICsgJyBmYWlsZWQnKTtcbiAgICAgIGVycm9yLm5vUmVzdWx0ID0gdHJ1ZTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5leHBvcnRzLlBpcGUgPSBQaXBlO1xuIiwiXG52YXIgUHJvY2Vzc29yID0gZnVuY3Rpb24gUHJvY2Vzc29yKG9wdGlvbnMpe1xuICB0aGlzLnNlbGZPcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5waXBlcyA9IHt9O1xufTtcblxuUHJvY2Vzc29yLnByb3RvdHlwZS5vcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBpZiAob3B0aW9ucykge1xuICAgIHRoaXMuc2VsZk9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG4gIHJldHVybiB0aGlzLnNlbGZPcHRpb25zO1xufTtcblxuUHJvY2Vzc29yLnByb3RvdHlwZS5waXBlID0gZnVuY3Rpb24obmFtZSwgcGlwZSkge1xuICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBwaXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMucGlwZXNbbmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGlwZXNbbmFtZV0gPSBwaXBlO1xuICAgIH1cbiAgfVxuICBpZiAobmFtZSAmJiBuYW1lLm5hbWUpIHtcbiAgICBwaXBlID0gbmFtZTtcbiAgICBpZiAocGlwZS5wcm9jZXNzb3IgPT09IHRoaXMpIHsgcmV0dXJuIHBpcGU7IH1cbiAgICB0aGlzLnBpcGVzW3BpcGUubmFtZV0gPSBwaXBlO1xuICB9XG4gIHBpcGUucHJvY2Vzc29yID0gdGhpcztcbiAgcmV0dXJuIHBpcGU7XG59O1xuXG5Qcm9jZXNzb3IucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbihpbnB1dCwgcGlwZSkge1xuICB2YXIgY29udGV4dCA9IGlucHV0O1xuICBjb250ZXh0Lm9wdGlvbnMgPSB0aGlzLm9wdGlvbnMoKTtcbiAgdmFyIG5leHRQaXBlID0gcGlwZSB8fCBpbnB1dC5waXBlIHx8ICdkZWZhdWx0JztcbiAgdmFyIGxhc3RQaXBlLCBsYXN0Q29udGV4dDtcbiAgd2hpbGUgKG5leHRQaXBlKSB7XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0Lm5leHRBZnRlckNoaWxkcmVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gY2hpbGRyZW4gcHJvY2Vzc2VkIGFuZCBjb21pbmcgYmFjayB0byBwYXJlbnRcbiAgICAgIGNvbnRleHQubmV4dCA9IGNvbnRleHQubmV4dEFmdGVyQ2hpbGRyZW47XG4gICAgICBjb250ZXh0Lm5leHRBZnRlckNoaWxkcmVuID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5leHRQaXBlID09PSAnc3RyaW5nJykge1xuICAgICAgbmV4dFBpcGUgPSB0aGlzLnBpcGUobmV4dFBpcGUpO1xuICAgIH1cbiAgICBuZXh0UGlwZS5wcm9jZXNzKGNvbnRleHQpO1xuICAgIGxhc3RDb250ZXh0ID0gY29udGV4dDtcbiAgICBsYXN0UGlwZSA9IG5leHRQaXBlO1xuICAgIG5leHRQaXBlID0gbnVsbDtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgaWYgKGNvbnRleHQubmV4dCkge1xuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5uZXh0O1xuICAgICAgICBuZXh0UGlwZSA9IGxhc3RDb250ZXh0Lm5leHRQaXBlIHx8IGNvbnRleHQucGlwZSB8fCBsYXN0UGlwZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQuaGFzUmVzdWx0ID8gY29udGV4dC5yZXN1bHQgOiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnRzLlByb2Nlc3NvciA9IFByb2Nlc3NvcjtcbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlLCBicm93c2VyOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIFNrYXJ5bmFcbn1cbmZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IHtcbiAgICBFZGl0b3Jcbn1cbmZyb20gJy4vZWRpdG9yJztcbmltcG9ydCB7XG4gICAgcmVwb3NpdG9yeVxufVxuZnJvbSAnLi9yZXBvc2l0b3J5JztcbmltcG9ydCB7XG4gICAgWEhSXG59XG5mcm9tICcuL3hocic7XG5cblNrYXJ5bmEuRWRpdG9yID0gRWRpdG9yO1xuU2thcnluYS5yZXBvc2l0b3J5ID0gcmVwb3NpdG9yeTtcblNrYXJ5bmEuWEhSID0gWEhSO1xuXG53aW5kb3cuU2thcnluYSA9IFNrYXJ5bmE7XG5cbmlmIChBcnJheS5pc0FycmF5KHdpbmRvdy5fX19Ta2FyeW5hKSkge1xuICAgIHdpbmRvdy5fX19Ta2FyeW5hLmZvckVhY2goKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KHdpbmRvdyk7XG4gICAgfSk7XG59XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgRW1pdHRlclxufVxuZnJvbSAnLi9lbWl0dGVyJztcbmltcG9ydCB7XG4gICAgY2xvbmUsXG4gICAgYXJyYWl6ZVxufVxuZnJvbSAnLi91dGlsJztcbmltcG9ydCB7XG4gICAgdG9IVE1MXG59XG5mcm9tICcuL3NlcmlhbGl6ZXIvdG9IVE1MJztcblxubGV0IGVsZW1lbnRNYXAgPSB7fTtcblxuXG4vKipcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NvbXBvbmVudC9lc2NhcGUtcmVnZXhwXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdleHAoc3RyKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UoLyhbLiorPz1eIToke30oKXxbXFxdXFwvXFxcXF0pL2csICdcXFxcJDEnKTtcbn1cblxuLyoqXG4gKiBAc2VlIEFwcFxuICogQHBhcmFtICAge2FycmF5fSBsaXN0XG4gKiBAcGFyYW0gICB7c3RyaW5nfSAgIGZpbHRlclxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlc3RNYXRjaChsaXN0LCBmaWx0ZXIpIHtcbiAgICB2YXIgbG93ZXN0ID0gbnVsbCxcbiAgICAgICAgYmVzdDtcblxuICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdleHAocnVsZSkucmVwbGFjZSgvXFxcXFxcKi9nLCAnKC4rKScpKSxcbiAgICAgICAgICAgIHdlaWdodCA9IHJ1bGUuc3BsaXQoJyonKS5maWx0ZXIoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFydC5sZW5ndGg7XG4gICAgICAgICAgICB9KS5sZW5ndGgsXG4gICAgICAgICAgICBtYXRjaCA9IGZpbHRlci5tYXRjaChyZWdleHApO1xuXG4gICAgICAgIGlmIChtYXRjaCAmJiAobG93ZXN0ID09PSBudWxsIHx8IChtYXRjaC5sZW5ndGggLSB3ZWlnaHQpIDwgbG93ZXN0KSkge1xuICAgICAgICAgICAgbG93ZXN0ID0gbWF0Y2gubGVuZ3RoIC0gd2VpZ2h0O1xuICAgICAgICAgICAgYmVzdCA9IHJ1bGU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYmVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gZWxlbWVudE1hcFtpZF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCeU5vZGUoZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IGlkID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcpO1xuICAgIHJldHVybiBnZXRCeUlkKGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUlEKHNldFZhbHVlKSB7XG4gICAgdmFyIHBvc3NpYmxlID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OScsXG4gICAgICAgIHRleHQgPSAnJztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIHRleHQgKz0gcG9zc2libGUuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBvc3NpYmxlLmxlbmd0aCkpO1xuICAgIH1cblxuICAgIGlmIChPYmplY3Qua2V5cyhlbGVtZW50TWFwKS5pbmRleE9mKHRleHQpID09PSAtMSkge1xuICAgICAgICBlbGVtZW50TWFwW3RleHRdID0gZWxlbWVudE1hcFt0ZXh0XSB8fCBzZXRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIHJldHVybiByYW5kb21JRChzZXRWYWx1ZSk7XG59XG5cbi8qKlxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0cyBOb2RlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5uYW1lID0gcmFuZG9tSUQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5fX2xvY2tlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbG9ja2VkO1xuICAgIH1cblxuICAgIGxvY2soKSB7XG4gICAgICAgIHRoaXMuX19sb2NrZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGF0dHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJzO1xuICAgIH1cblxuICAgIGdldCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgYmUgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBzZXQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU2hvdWxkIGJlIGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGFic3RyYWN0XG4gICAgICogQHRocm93cyB7RXJyb3J9XG4gICAgICovXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoJ1Nob3VsZCBiZSBpbXBsZW1lbnRlZCcpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG5cbiAgICBnZXQgZGVmYXVsdE5ld0l0ZW0oKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldCBhbGxvd2VkTmV3SXRlbXMoKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG59XG5cbi8qKlxuICogQGNsYXNzXG4gKiBEZWZpbmVkIGZvciBJbWFnZSwgVmlkZW8sIEVtYmVkLCBUYWJsZSwgSG9yaXpvbmFsUnVsZSwgVGFibGUsIExpc3Qgb3IgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBCbG9ja05vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKHR5cGUsIGl0ZW1zLCBhdHRycykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zIHx8IFtdO1xuICAgICAgICB0aGlzLmF0dHJzID0gYXR0cnM7XG4gICAgfVxuXG4gICAgZ2V0KHBhdGgpIHtcbiAgICAgICAgbGV0IGVsZW1lbnRzID0gcGF0aC5zcGxpdCgnLicpLFxuICAgICAgICAgICAgaW5kZXggPSBlbGVtZW50cy5zaGlmdCgpLFxuICAgICAgICAgICAgcmVzdCA9IGVsZW1lbnRzLmpvaW4oJy4nKSxcbiAgICAgICAgICAgIGNoaWxkO1xuXG4gICAgICAgIGlmIChpc05hTihpbmRleCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQgPSB0aGlzLml0ZW1zWytpbmRleF07XG5cbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoICYmIGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGQuZ2V0KHJlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuXG4gICAgfVxuXG4gICAgc2V0KHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCAmJiBjaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbK2luZGV4XS5zZXQocmVzdCwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoK2luZGV4LCAwLCB2YWx1ZSk7XG5cbiAgICB9XG5cbiAgICBnZXQgZW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aCA8PSAwO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBvdXRwdXQgPSB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcy5tYXAoKGl0ZW0pID0+IGl0ZW0udG9KU09OKCkpXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmF0dHJzKSB7XG4gICAgICAgICAgICBvdXRwdXQuYXR0cnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXR0cnMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGRlY29yYXRlKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRvSFRNTCh0aGlzLCB7XG4gICAgICAgICAgICAgICAgZWRpdDogdHJ1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChodG1sKSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBhcnJhaXplKGh0bWwuY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRG9jdW1lbnQgZXh0ZW5kcyBCbG9ja05vZGUge1xuXG4gICAgY29uc3RydWN0b3IoaXRlbXMpIHtcbiAgICAgICAgc3VwZXIoJ2RvY3VtZW50JywgaXRlbXMpO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcmFncmFwaDtcbiAgICB9XG5cbiAgICBnZXQgYWxsb3dlZE5ld0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgUGFyYWdyYXBoLFxuICAgICAgICAgICAgSW1hZ2VcbiAgICAgICAgXTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFF1b3RlIGV4dGVuZHMgQmxvY2tOb2RlIHtcbiAgICBjb25zdHJ1Y3RvcihpdGVtcykge1xuICAgICAgICBzdXBlcigncXVvdGUnLCBpdGVtcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBjbGFzc1xuICogRGVmaW5lZCBmb3IgVGV4dCwgUGFyYWdyYXBoLCBMaXN0SXRlbSwgUXVvdGUgYW5kIEhlYWRpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIFRleHROb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICd0ZXh0JztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAndGV4dCc7XG4gICAgfVxuXG4gICAgZ2V0IGVtcHR5KCkge1xuICAgICAgICByZXR1cm4gIXRoaXMudGV4dCB8fCAhdGhpcy50ZXh0LnJlcGxhY2UoL14oW1xcc1xcblxcclxcdF0rKXwoW1xcc1xcblxcclxcdF0rKSQvLCAnJykubGVuZ3RoO1xuICAgIH1cblxuICAgIGdldCBhYnNvbHV0ZUVtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0Lmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICBhdHRyKCkge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuYXR0cigpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHRleHQsIGZvcm1hdHMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudGV4dCA9ICh0ZXh0ICYmIHRleHQudG9TdHJpbmcpID8gdGV4dC50b1N0cmluZygpIDogJyc7XG4gICAgICAgIHRoaXMuZm9ybWF0cyA9IGZvcm1hdHMgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5hdHRycyA9IGF0dHJzO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMudGV4dFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5mb3JtYXRzKSB7XG4gICAgICAgICAgICBvdXRwdXQuZm9ybWF0cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5mb3JtYXRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXR0cnMgJiYgdGhpcy50eXBlICE9PSAndGV4dCcpIHtcbiAgICAgICAgICAgIG91dHB1dC5hdHRycyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hdHRycykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgYXBwZW5kKG5vZGUpIHtcbiAgICAgICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIFRleHROb2RlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IHRleHQgbm9kZXMgY2FuIGJlIGpvaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmZvcm1hdHMpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0cyA9IHRoaXMuZm9ybWF0cyB8fCBbXTtcbiAgICAgICAgICAgIG5vZGUuZm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm1hdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHNsaWNlOiBbZm9ybWF0LnNsaWNlWzBdICsgdGhpcy50ZXh0Lmxlbmd0aCwgZm9ybWF0LnNsaWNlWzFdXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwbHk6IGZvcm1hdC5hcHBseVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50ZXh0ICs9IG5vZGUudGV4dDtcbiAgICB9XG5cbiAgICBkZWNvcmF0ZShlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0b0hUTUwodGhpcywge1xuICAgICAgICAgICAgICAgIGVkaXQ6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbC50ZXh0Q29udGVudDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHROb2RlIHtcblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ3BhcmFncmFwaCc7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ3BhcmFncmFwaCc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IodGV4dCwgZm9ybWF0cywgYXR0cnMpIHtcbiAgICAgICAgc3VwZXIodGV4dCwgZm9ybWF0cywgYXR0cnMpO1xuICAgIH1cblxuICAgIGdldCBuZXh0Tm9kZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiBQYXJhZ3JhcGg7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW1hZ2UgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSwgdGl0bGUsIGFsdCkge1xuICAgICAgICBzdXBlcignaW1hZ2UnKTtcbiAgICAgICAgdGhpcy5zcmMgPSBzb3VyY2U7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5hbHQgPSBhbHQ7XG4gICAgfVxuXG4gICAgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnaW1hZ2UnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgfVxuXG4gICAgYXR0cigpIHtcbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBzdXBlci5hdHRyKCkgfHwge307XG4gICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5zcmMgPSB0aGlzLnNyYztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aXRsZSkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy50aXRsZSA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWx0KSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzLmFsdCA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgICAgIHNyYzogdGhpcy5zcmNcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMudGl0bGUpIHtcbiAgICAgICAgICAgIG91dHB1dC50aXRsZSA9IHRoaXMudGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWx0KSB7XG4gICAgICAgICAgICBvdXRwdXQuYWx0ID0gdGhpcy5hbHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIZWFkaW5nIGV4dGVuZHMgVGV4dE5vZGUge1xuXG4gICAgY29uc3RydWN0b3IobGV2ZWwsIHRleHQsIGZvcm1hdHMsIGF0dHJzKSB7XG4gICAgICAgIHN1cGVyKHRleHQsIGZvcm1hdHMsIGF0dHJzKTtcbiAgICAgICAgdGhpcy5sZXZlbCA9IE1hdGgubWluKDYsIGxldmVsIHx8IDEpO1xuICAgIH1cblxuICAgIGF0dHIoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5hdHRyKCk7XG4gICAgfVxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ2hlYWRpbmcnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdoZWFkaW5nJztcbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIGxldCBqc29uID0gc3VwZXIudG9KU09OKCk7XG4gICAgICAgIGpzb24ubGV2ZWwgPSB0aGlzLmxldmVsO1xuICAgICAgICByZXR1cm4ganNvbjtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNCbG9ja05vZGUgZXh0ZW5kcyBCbG9ja05vZGUge1xuICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGdldCBkZWZhdWx0TmV3SXRlbSgpIHtcbiAgICAgICAgcmV0dXJuIFBhcmFncmFwaDtcbiAgICB9XG5cbiAgICBnZXQgYWxsb3dlZE5ld0l0ZW1zKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgUGFyYWdyYXBoLFxuICAgICAgICAgICAgSW1hZ2VcbiAgICAgICAgXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGaWVsZHMgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fbWFwID0gZGF0YTtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdGaWVsZHMnO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgdHlwZSgpIHtcbiAgICAgICAgcmV0dXJuICdGaWVsZHMnO1xuICAgIH1cblxuICAgIGdldChwYXRoKSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBjaGlsZCA9IHRoaXMuX21hcFtpbmRleF07XG5cbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoICYmIGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGQuZ2V0KHJlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuXG4gICAgfVxuXG4gICAgc2V0KHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IHBhdGguc3BsaXQoJy4nKSxcbiAgICAgICAgICAgIGluZGV4ID0gZWxlbWVudHMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJlc3QgPSBlbGVtZW50cy5qb2luKCcuJyksXG4gICAgICAgICAgICBjaGlsZDtcblxuICAgICAgICBpZiAocmVzdC5sZW5ndGggJiYgY2hpbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXBbaW5kZXhdLmdldChyZXN0LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tYXBbaW5kZXhdID0gdmFsdWU7XG5cbiAgICB9XG5cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiBjbG9uZShbXG4gICAgICAgICAgICB0aGlzLl9tYXAsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0ZpZWxkcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmFyaWFudHMgZXh0ZW5kcyBOb2RlIHtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fdmFyaWFudHMgPSBkYXRhO1xuICAgIH1cblxuICAgIGdldCB0eXBlKCkge1xuICAgICAgICByZXR1cm4gJ1ZhcmlhbnRzJztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiAnVmFyaWFudHMnO1xuICAgIH1cblxuXG4gICAgYmVzdCh2YXJpYW50KSB7XG4gICAgICAgIGxldCBiZXN0ID0gYmVzdE1hdGNoKE9iamVjdC5rZXlzKHRoaXMuX3ZhcmlhbnRzKSwgdmFyaWFudCk7XG4gICAgICAgIHJldHVybiB0aGlzLl92YXJpYW50c1tiZXN0XTtcblxuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIGNsb25lKFtcbiAgICAgICAgICAgIHRoaXMuX21hcCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnVmFyaWFudHMnXG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH1cbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlLCBicm93c2VyOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIEV2ZW50LCBFbWl0dGVyXG59XG5mcm9tICcuL2VtaXR0ZXInO1xuXG5pbXBvcnQge1xuICAgIGFycmFpemVcbn1cbmZyb20gJy4vdXRpbCc7XG5pbXBvcnQge1xuICAgIHJlcG9zaXRvcnksIENIQU5HRSwgREVGQVVMVF9ET0NVTUVOVFxufVxuZnJvbSAnLi9yZXBvc2l0b3J5JztcbmltcG9ydCB7XG4gICAgdG9IVE1MXG59XG5mcm9tICcuL3NlcmlhbGl6ZXIvdG9IVE1MJztcbmltcG9ydCB7XG4gICAgdG9QT01cbn1cbmZyb20gJy4vc2VyaWFsaXplci90b1BPTSc7XG5pbXBvcnQge1xuICAgIGZyb21IVE1MXG59XG5mcm9tICcuL3BhcnNlci9mcm9tSFRNTCc7XG5pbXBvcnQge1xuICAgIGZyb21QT01cbn1cbmZyb20gJy4vcGFyc2VyL2Zyb21QT00nO1xuaW1wb3J0IHtcbiAgICBYSFJcbn1cbmZyb20gJy4veGhyJztcbmltcG9ydCB7XG4gICAgVmFyaWFudHMsXG4gICAgcmFuZG9tSUQsXG4gICAgZ2V0QnlJZCxcbiAgICBnZXRCeU5vZGVcbn1cbmZyb20gJy4vZG9jdW1lbnQnO1xuXG5jb25zdCBCQUNLU1BBQ0UgPSA4LFxuICAgIFRBQiA9IDksXG4gICAgRU5URVIgPSAxMyxcbiAgICBTSElGVCA9IDE2LFxuICAgIENBUFMgPSAyMCxcbiAgICBFU0MgPSAyNyxcbiAgICBTUEFDRSA9IDMyLFxuICAgIFVQID0gMzgsXG4gICAgRE9XTiA9IDQwLFxuICAgIERFTEVURSA9IDQ2LFxuICAgIFBSRVZFTlQgPSBbRU5URVJdO1xuXG5pbXBvcnQge1xuICAgIFRvb2xiYXJcbn1cbmZyb20gJy4vdG9vbGJhcic7XG5pbXBvcnQge1xuICAgIEluamVjdG9yXG59XG5mcm9tICcuL2luamVjdG9yJztcblxubGV0IHRvb2xiYXIgPSBuZXcgVG9vbGJhcigpLFxuICAgIGluamVjdG9yO1xuXG4vKipcbiAqIEBjbGFzc1xuICogQG5hbWUgRWRpdG9yXG4gKi9cbmV4cG9ydCBjbGFzcyBFZGl0b3IgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbmV3IGVkaXRvciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxFZGl0b3I+fSBwcm9taXNlIG9mIGZ1bGx5IGxvYWRlZCBhbmQgcmVuZGVyZWQgZWRpdG9yXG4gICAgICovXG4gICAgc3RhdGljIGZhY3RvcnkoZWxlbWVudCkge1xuICAgICAgICBsZXQgZWRpdG9yID0gbmV3IEVkaXRvcihlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIGVkaXRvci5pbml0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogW1tEZXNjcmlwdGlvbl1dXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSBbW0Rlc2NyaXB0aW9uXV1cbiAgICAgKi9cbiAgICBzdGF0aWMgaW5pdEVkaXRvcnMoZWxlbWVudCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChhcnJhaXplKGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2thcnluYV0nKSlcbiAgICAgICAgICAgICAgICAubWFwKChlbGVtZW50KSA9PiBFZGl0b3IuZmFjdG9yeShlbGVtZW50KSkpXG4gICAgICAgICAgICAudGhlbihlZGl0b3JzID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLmVkaXRvcnMgPSBlZGl0b3JzO1xuICAgICAgICAgICAgICAgIHJldHVybiBlZGl0b3JzO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogW1tEZXNjcmlwdGlvbl1dXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRvY3VtZW50Qm9keSBbW0Rlc2NyaXB0aW9uXV1cbiAgICAgKiBAcGFyYW0ge1tbVHlwZV1dfSBkb2N1bWVudElkICAgW1tEZXNjcmlwdGlvbl1dXG4gICAgICovXG4gICAgc3RhdGljIHJlZ2lzdGVyRG9jdW1lbnQoZG9jdW1lbnRCb2R5LCBkb2N1bWVudElkKSB7XG4gICAgICAgIHJlcG9zaXRvcnkuc2V0KGRvY3VtZW50SWQgfHwgREVGQVVMVF9ET0NVTUVOVCwgZG9jdW1lbnRCb2R5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBkYXRhIGZyb20gUkVTVCBlbmRwb2ludFxuICAgICAqIEBwYXJhbSAgIHtzdHJpbmd9IHBhdGhcbiAgICAgKiBAcGFyYW0gICB7c3RyaW5nfSBkb2N1bWVudElkXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgc3RhdGljIGxvYWQocGF0aCwgZG9jdW1lbnRJZCkge1xuICAgICAgICByZXR1cm4gWEhSXG4gICAgICAgICAgICAuZ2V0KHBhdGgpXG4gICAgICAgICAgICAudGhlbigoY29udGVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBmcm9tUE9NKEpTT04ucGFyc2UoY29udGVudCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChjb250ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVwb3NpdG9yeS5zZXQoZG9jdW1lbnRJZCB8fCBERUZBVUxUX0RPQ1VNRU5ULCBjb250ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgdGhpcy5kb2N1bWVudFBhdGggPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLXBhdGgnKSB8fCBudWxsO1xuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1kb2MnKSB8fCBERUZBVUxUX0RPQ1VNRU5UO1xuICAgICAgICB0aGlzLnZhcmlhbnQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLXZhcmlhbnQnKSB8fCBudWxsO1xuXG4gICAgICAgIHRoaXMuX3BlbmRpbmdTdGF0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlbmRlcmluZyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdHMgY29tcG9uZW50XG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgaW5pdCgpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5pbml0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXRlZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluaXRlZCA9IGZyb21IVE1MKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIGVkaXQ6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoY29udGVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQubG9jaygpO1xuICAgICAgICAgICAgICAgIGlmIChyZXBvc2l0b3J5LmhhcyhzZWxmLmRvY3VtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZG9jID0gcmVwb3NpdG9yeS5nZXQoc2VsZi5kb2N1bWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmRvY3VtZW50UGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jID0gZG9jLmdldChzZWxmLmRvY3VtZW50UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9jICYmIGRvYy50eXBlID09PSAnVmFyaWFudHMnICYmIGRvYy5iZXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jID0gZG9jLmJlc3Qoc2VsZi52YXJpYW50IHx8ICcqJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb250ZW50ID0gZG9jO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNvbnRlbnQuZW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3NpdG9yeS5zZXQoc2VsZi5kb2N1bWVudCwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY29udGVudCA9IGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLnN0YWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldENhcmV0Q2hhcmFjdGVyT2Zmc2V0V2l0aGluKGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IGNhcmV0T2Zmc2V0ID0gMCxcbiAgICAgICAgICAgIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50LmRvY3VtZW50LFxuICAgICAgICAgICAgd2luID0gZG9jLmRlZmF1bHRWaWV3IHx8IGRvYy5wYXJlbnRXaW5kb3csXG4gICAgICAgICAgICBzZWw7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luLmdldFNlbGVjdGlvbiAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgc2VsID0gd2luLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKHNlbC5yYW5nZUNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IHdpbi5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApLFxuICAgICAgICAgICAgICAgICAgICBwcmVDYXJldFJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHByZUNhcmV0UmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHByZUNhcmV0UmFuZ2Uuc2V0RW5kKHJhbmdlLmVuZENvbnRhaW5lciwgcmFuZ2UuZW5kT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBjYXJldE9mZnNldCA9IHByZUNhcmV0UmFuZ2UudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoKHNlbCA9IGRvYy5zZWxlY3Rpb24pICYmIHNlbC50eXBlICE9ICdDb250cm9sJykge1xuICAgICAgICAgICAgbGV0IHRleHRSYW5nZSA9IHNlbC5jcmVhdGVSYW5nZSgpLFxuICAgICAgICAgICAgICAgIHByZUNhcmV0VGV4dFJhbmdlID0gZG9jLmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICBwcmVDYXJldFRleHRSYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChlbGVtZW50KTtcbiAgICAgICAgICAgIHByZUNhcmV0VGV4dFJhbmdlLnNldEVuZFBvaW50KCdFbmRUb0VuZCcsIHRleHRSYW5nZSk7XG4gICAgICAgICAgICBjYXJldE9mZnNldCA9IHByZUNhcmV0VGV4dFJhbmdlLnRleHQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXJldE9mZnNldDtcbiAgICB9XG5cbiAgICBnZXRTZWxlY3Rpb25MZW5ndGgoKSB7XG5cbiAgICB9XG5cbiAgICBnZXRDdXJyZW50RWxlbWVudChlbGVtZW50KSB7XG5cbiAgICAgICAgbGV0IGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50LmRvY3VtZW50LFxuICAgICAgICAgICAgd2luID0gZG9jLmRlZmF1bHRWaWV3IHx8IGRvYy5wYXJlbnRXaW5kb3csXG4gICAgICAgICAgICBzZWwsXG4gICAgICAgICAgICBub2RlO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygd2luLmdldFNlbGVjdGlvbiAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgc2VsID0gd2luLmdldFNlbGVjdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsID0gZG9jLnNlbGVjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vZGUgPSBzZWwuZm9jdXNOb2RlO1xuXG4gICAgICAgIGlmIChub2RlID09PSB0aGlzLmVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWRpdGFibGVOb2RlKG5vZGUpO1xuICAgIH1cblxuICAgIGdldEVkaXRhYmxlTm9kZShub2RlKSB7XG4gICAgICAgIHdoaWxlIChub2RlICYmICghbm9kZS5oYXNBdHRyaWJ1dGUgfHwgIW5vZGUuaGFzQXR0cmlidXRlKCdkYXRhLXNrYXJ5bmEtaWQnKSkpIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgb25ET00oc2VsZWN0b3JPUkVsZW1lbnQsIGV2ZW50TmFtZSwgbXlNZXRob2QpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoc2VsZWN0b3JPUkVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgc2VsZWN0b3JPUkVsZW1lbnQgPSBbc2VsZWN0b3JPUkVsZW1lbnRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0b3JPUkVsZW1lbnQgPSBhcnJhaXplKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yT1JFbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0b3JPUkVsZW1lbnRcbiAgICAgICAgICAgIC5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbXlNZXRob2QuYXBwbHkoc2VsZiwgW2V2ZW50XSk7XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIFVJXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLl9yZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBwcm9taXNlO1xuXG4gICAgICAgIGlmICghdGhpcy5jb250ZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2UgPSB0aGlzLmNvbnRlbnRcbiAgICAgICAgICAgICAgICAuZGVjb3JhdGUodGhpcy5lbGVtZW50KVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcsIHNlbGYuY29udGVudCA/IHNlbGYuY29udGVudC5uYW1lIDogcmFuZG9tSUQodHJ1ZSkpO1xuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsICcnKTtcbiAgICAgICAgICAgICAgICBzZWxmLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uS2V5VXAoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYub25ET00oJ1tkYXRhLXNrYXJ5bmEtaWRdJywgJ21vdXNldXAnLCBzZWxmLmZvY3VzKTtcbiAgICAgICAgICAgICAgICBzZWxmLm9uRE9NKHNlbGYuZWxlbWVudCwgJ21vdXNldXAnLCBzZWxmLmZvY3VzKTtcblxuICAgICAgICAgICAgICAgIHNlbGYuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uID8gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCkgOiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsICYmIHNlbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25TZWxlY3QoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gc2VsZik7XG4gICAgfVxuXG4gICAgb25TZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2hvd1Rvb2xiYXIoKTtcbiAgICAgICAgdGhpcy5zdHJvbmcoKTtcbiAgICB9XG5cbiAgICBzaG93VG9vbGJhcigpIHtcbiAgICAgICAgdG9vbGJhci5hbmNob3IoKTtcbiAgICB9XG5cbiAgICBmb2N1cyhldmVudCkge1xuICAgICAgICBsZXQgbm9kZSA9IHRoaXMuZ2V0RWRpdGFibGVOb2RlKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBmb2N1c2VkTm9kZSA9IGdldEJ5Tm9kZShub2RlKSxcbiAgICAgICAgICAgIHBhcmVudE5vZGUgPSBnZXRCeU5vZGUobm9kZS5wYXJlbnROb2RlKSxcbiAgICAgICAgICAgIG5ld0l0ZW1zLFxuICAgICAgICAgICAgaW5qZWN0b3JPYmplY3Q7XG5cbiAgICAgICAgbmV3SXRlbXMgPSBwYXJlbnROb2RlID8gcGFyZW50Tm9kZS5hbGxvd2VkTmV3SXRlbXMgOiBmb2N1c2VkTm9kZS5hbGxvd2VkTmV3SXRlbXM7XG5cbiAgICAgICAgdGhpcy5oaWRlSW5qZWN0b3IoKTtcblxuICAgICAgICBpZiAobmV3SXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKCFwYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgaW5qZWN0b3JPYmplY3QgPSB0aGlzLnNob3dJbmplY3Rvcihub2RlLnBhcmVudE5vZGUubGFzdENoaWxkLCBuZXdJdGVtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluamVjdG9yT2JqZWN0ID0gdGhpcy5zaG93SW5qZWN0b3Iobm9kZSwgbmV3SXRlbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5qZWN0b3JPYmplY3Qub24oJ2luamVjdG5vZGUnLCBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gcGFyZW50Tm9kZS5pdGVtcy5pbmRleE9mKGZvY3VzZWROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50Tm9kZS5pdGVtcy5zcGxpY2UoaW5kZXgsIDAsIG5ldyBldmVudC5kYXRhKCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE5vZGUuaXRlbXMucHVzaChuZXcgZXZlbnQuZGF0YSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvd0luamVjdG9yKGFmdGVyTm9kZSwgcG9zc2libGVJdGVtcykge1xuICAgICAgICBsZXQgaW5qZWN0b3JPYmplY3QgPSBuZXcgSW5qZWN0b3IocG9zc2libGVJdGVtcyksXG4gICAgICAgICAgICBib3ggPSBhZnRlck5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbmplY3Rvck9iamVjdC5lbGVtZW50KTtcbiAgICAgICAgaW5qZWN0b3JPYmplY3QuZ29Ubyhib3gubGVmdCwgYm94LnRvcCk7XG4gICAgICAgIHJldHVybiBpbmplY3Rvck9iamVjdDtcblxuICAgIH1cblxuICAgIGhpZGVJbmplY3RvcigpIHtcbiAgICAgICAgaWYgKGluamVjdG9yKSB7XG4gICAgICAgICAgICBpZiAoaW5qZWN0b3IucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgIGluamVjdG9yLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaW5qZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5qZWN0b3IgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3Ryb25nKCkge1xuICAgICAgICBsZXQgdGV4dE5vZGUgPSB0aGlzLmdldEN1cnJlbnRFbGVtZW50KGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uID8gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCkgOiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS50ZXh0LFxuICAgICAgICAgICAgdG8gPSBzZWwubGVuZ3RoLFxuICAgICAgICAgICAgZnJvbSA9IHRoaXMuZ2V0Q2FyZXRDaGFyYWN0ZXJPZmZzZXRXaXRoaW4odGV4dE5vZGUpIC0gdG87XG5cblxuICAgICAgICBmcm9tSFRNTCh0ZXh0Tm9kZSlcbiAgICAgICAgICAgIC50aGVuKChQT00pID0+IHtcbiAgICAgICAgICAgICAgICBQT00uZm9ybWF0cyA9IFBPTS5mb3JtYXRzIHx8IFtdO1xuICAgICAgICAgICAgICAgIFBPTS5mb3JtYXRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzbGljZTogW2Zyb20sIHRvXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwbHk6IFsnc3Ryb25nJ11cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9IVE1MKFBPTSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKEhUTUwpID0+IHtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5pbm5lckhUTUwgPSBIVE1MLmlubmVySFRNTDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgZXh0ZXJuYWwgY2hhbmdlXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50XG4gICAgICovXG4gICAgb25FeHRlcm5hbENoYW5nZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlbmRlcmluZykge1xuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ1N0YXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIG5ld0l0ZW0odGFyZ2V0KSB7XG4gICAgICAgIGxldCBjdXJyZW50VGFyZ2V0ID0gdGFyZ2V0LFxuICAgICAgICAgICAgbm9kZSA9IGdldEJ5Tm9kZShjdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgYXNFZGl0b3IgPSBFZGl0b3IuZWRpdG9ycy5yZWR1Y2UoKHByZXZpb3VzLCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQuZWxlbWVudCA9PT0gY3VycmVudFRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzO1xuICAgICAgICAgICAgfSwgbnVsbCk7XG5cbiAgICAgICAgd2hpbGUgKG5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChhc0VkaXRvcikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBFZGl0b3IuZWRpdG9ycy5pbmRleE9mKGFzRWRpdG9yKSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSBFZGl0b3IuZWRpdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmVkaXROb2RlKEVkaXRvci5lZGl0b3JzW2luZGV4XS5lbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUuZGVmYXVsdE5ld0l0ZW0pIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3RWxlbWVudCA9IG5ldyhub2RlLmRlZmF1bHROZXdJdGVtKSgpO1xuICAgICAgICAgICAgICAgIG5vZGUuaXRlbXMucHVzaChuZXdFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIHRvSFRNTChuZXdFbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGh0bWxFbGVtZW50ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYXBwZW5kQ2hpbGQoaHRtbEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lZGl0Tm9kZShodG1sRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQgPSBjdXJyZW50VGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICAgICAgICBub2RlID0gZ2V0QnlOb2RlKGN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgYXNFZGl0b3IgPSBhc0VkaXRvciB8fCBFZGl0b3IuZWRpdG9ycy5yZWR1Y2UoKHByZXZpb3VzLCBjdXJyZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQuZWxlbWVudCA9PT0gY3VycmVudFRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzO1xuICAgICAgICAgICAgfSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlZGl0Tm9kZShub2RlKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCksXG4gICAgICAgICAgICBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHJhbmdlLnNldFN0YXJ0KG5vZGUsIDApO1xuICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cblxuICAgIG93bkFjdGlvbihrZXksIHRhcmdldCkge1xuICAgICAgICBpZiAoa2V5ID09PSBFTlRFUikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmV3SXRlbSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBrZXkgdXAgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgICAqL1xuICAgIG9uS2V5VXAoZXZlbnQpIHtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnRFbGVtZW50KGV2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChQUkVWRU5ULmluZGV4T2YoZXZlbnQua2V5Q29kZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLm93bkFjdGlvbihldmVudC5rZXlDb2RlLCBjdXJyZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoY3VycmVudCksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKGVsZW1lbnQpIHtcbiAgICAgICAgbGV0XG4gICAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGRvYyA9IHJlcG9zaXRvcnkuZ2V0KHNlbGYuZG9jdW1lbnQpO1xuXG4gICAgICAgIGlmIChzZWxmLmRvY3VtZW50UGF0aCkge1xuICAgICAgICAgICAgZG9jID0gZG9jLnNldChzZWxmLmRvY3VtZW50UGF0aCwgc2VsZi5jb250ZW50KTtcbiAgICAgICAgICAgIHJlcG9zaXRvcnkuZW1pdChDSEFOR0UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9UT0RPXG4gICAgICAgIH1cblxuICAgICAgICBmcm9tSFRNTChlbGVtZW50KVxuICAgICAgICAgICAgLnRoZW4oUE9NID0+IHtcbiAgICAgICAgICAgICAgICBFZGl0b3IuZW1pdCgnc2VsZWN0ZWQnLCB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgbm9kZTogUE9NXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmxldCBzdHlsZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuc3R5bGVzLmlubmVyVGV4dCA9IGBcbiAgICAgICAgcFtkYXRhLXNrYXJ5bmEtaWRdOmVtcHR5IHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDFlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBgO1xuXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlcyk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbi8qKlxuICogQG5hbWVzcGFjZSBza2FyeW5hXG4gKlxuICogQGNsYXNzIEV2ZW50Q29uZmlnXG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBmbiBsaXN0ZW5lclxuICogQHByb3BlcnR5IHtvYmplY3R9IGNvbnRleHRcbiAqIEBwcm9wZXJ0eSB7YXJyYXl9IGFyZ3MgYXJndW1lbnRzIHRvIGJlIHBhc3NlZFxuICogQHByb3BlcnR5IHtib29sZWFufSBvbmNlIGlmIHNob3VsZCBiZSBmaXJlZCBvbmx5IG9uY2VcbiAqL1xuXG4vKipcbiAqIEBjbGFzcyBFdmVudFxuICovXG5leHBvcnQgY2xhc3MgRXZlbnQge1xuICAgIC8qKlxuICAgICAqIENvbnRydWN0b3JcbiAgICAgKiBAY29uc3RydWN0cyBFdmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHttaXhlZH0gZGF0YVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzb3VyY2VcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBwYXJlbnRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhLCBzb3VyY2UsIHBhcmVudCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfVxuICAgICAgICAgICAgICogQG5hbWUgRXZlbnQjbmFtZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge21peGVkfVxuICAgICAgICAgICAgICogQG5hbWUgRXZlbnQjZGF0YVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGRhdGEsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcHJvcGVydHkge29iamVjdH1cbiAgICAgICAgICAgICAqIEBuYW1lIEV2ZW50I3NvdXJjZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogc291cmNlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IHtFdmVudHxudWxsfVxuICAgICAgICAgICAgICogQG5hbWUgRXZlbnQjcGFyZW50XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHBhcmVudDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJlbnQsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnRXZlbnQ6ICcgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnRvSlNPTigpKTtcbiAgICB9XG59XG5cbi8qKlxuICogW1tEZXNjcmlwdGlvbl1dXG4gKiBAcGFyYW0ge0V2ZW50fSBjb2ZuaWdcbiAqIEBwYXJhbSB7RXZlbnRDb25maWd9IHRoaXNPYmplY3RcbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZShldmVudCwgY29uZmlnKSB7XG4gICAgbGV0IHtcbiAgICAgICAgZm4sIGNvbnRleHQsIGFyZ3NcbiAgICB9ID0gY29uZmlnLFxuICAgIHBhcmFtcyA9IFtldmVudF0uY29uY2F0KGFyZ3MpO1xuXG4gICAgZm4uYXBwbHkoY29udGV4dCB8fCBudWxsLCBwYXJhbXMpO1xufVxuXG4vKipcbiAqIEFkZHMgbGlzdGVuZXIgZm9yIGFuIGV2ZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYW5kbGVyXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuICogQHBhcmFtIHthcnJheX0gYXJnc1xuICogQHBhcmFtIHtib29sZWFufSBvbmNlXG4gKi9cbmZ1bmN0aW9uIG9uKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgb25jZSkge1xuICAgIHRoaXMuX19saXN0ZW5lcnMgPSB0aGlzLl9fbGlzdGVuZXJzIHx8IHt9O1xuICAgIHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSA9IHRoaXMuX19saXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICB0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0ucHVzaCh7XG4gICAgICAgIGZuOiBoYW5kbGVyLFxuICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICBhcmdzOiBhcmdzLFxuICAgICAgICBvbmNlOiAhIW9uY2VcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBZGRzIGxpc3RlbmVyIGZvciBhbiBldmVudCB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb25jZVxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gaGFuZGxlclxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcbiAqIEBwYXJhbSB7YXJyYXl9IGFyZ3NcbiAqL1xuZnVuY3Rpb24gb25jZShldmVudE5hbWUsIGhhbmRsZXIsIGNvbnRleHQsIGFyZ3MpIHtcbiAgICB0aGlzLm9uKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgdHJ1ZSk7XG59XG5cbi8qKlxuICogQWRkcyBsaXN0ZW5lciBmb3IgYW4gZXZlbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGhhbmRsZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0XG4gKiBAcGFyYW0ge2FycmF5fSBhcmdzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9uY2VcbiAqL1xuZnVuY3Rpb24gb2ZmKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgb25jZSkge1xuICAgIGlmICghdGhpcy5fX2xpc3RlbmVycyB8fCAhdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpc1xuICAgICAgICAuZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncywgb25jZSlcbiAgICAgICAgLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdLnNwbGljZSh0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV0uaW5kZXhPZihjb25maWcpLCAxKTtcbiAgICAgICAgfSk7XG5cbn1cblxuLyoqXG4gKiBFbWl0cyBhbiBldmVudFxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHttaXhlZH0gZGF0YVxuICogQHBhcmFtIHtFdmVudHxudWxsfSBwYXJlbnRcbiAqL1xuZnVuY3Rpb24gZW1pdChldmVudE5hbWUsIGRhdGEsIHBhcmVudCkge1xuICAgIGlmICghdGhpcy5fX2xpc3RlbmVycyB8fCAhdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc2VsZiA9IHRoaXMsXG4gICAgICAgIGV2ZW50ID0gbmV3IEV2ZW50KGV2ZW50TmFtZSwgZGF0YSwgdGhpcywgcGFyZW50KTtcblxuICAgIHRoaXNcbiAgICAgICAgLmdldExpc3RlbmVycyhldmVudE5hbWUpXG4gICAgICAgIC5mb3JFYWNoKChjb25maWcpID0+IHtcbiAgICAgICAgICAgIGlmIChjb25maWcub25jZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub2ZmKGV2ZW50TmFtZSwgY29uZmlnLmZuLCBjb25maWcuY29udGV4dCwgY29uZmlnLmFyZ3MsIGNvbmZpZy5vbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4ZWN1dGUoZXZlbnQsIGNvbmZpZyk7XG4gICAgICAgIH0pO1xufVxuXG4vKipcbiAqIEJ1YmJsZXMgZXZlbnQgdG8gb3RoZXIgZW1pdHRlclxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHtvYmplY3R9IHRvRW1pdHRlclxuICovXG5mdW5jdGlvbiBidWJibGVFdmVudChldmVudE5hbWUsIHRvRW1pdHRlcikge1xuICAgIHRoaXMub24oZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgdG9FbWl0dGVyLmVtaXQoZXZlbnROYW1lLCBldmVudC5kYXRhLCBldmVudCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogR2V0cyBhbGwgbGlzdGVuZXJzIHRoYXQgbWF0Y2ggY3JpdGVyaWFcbiAqIEBwYXJhbSAgIHtzdHJpbmd9IGV2ZW50TmFtZSByZXF1aXJlZFxuICogQHBhcmFtICAge2Z1bmN0aW9ufSBoYW5kbGVyICAgaWYgZGVmaW5lZCB3aWxsIGJlIHVzZWQgZm9yIG1hdGNoXG4gKiBAcGFyYW0gICB7b2JqZWN0fSBjb250ZXh0ICAgaWYgZGVmaW5lZCB3aWxsIGJlIHVzZWQgZm9yIG1hdGNoXG4gKiBAcGFyYW0gICB7YXJyYXl9IGFyZ3MgICAgICBpZiBkZWZpbmVkIHdpbGwgYmUgdXNlZCBmb3IgbWF0Y2hcbiAqIEByZXR1cm5zIHthcnJheTxFdmVudENvbmZpZz58bnVsbH1cbiAqL1xuZnVuY3Rpb24gZ2V0TGlzdGVuZXJzKGV2ZW50TmFtZSwgaGFuZGxlciwgY29udGV4dCwgYXJncykge1xuICAgIGlmICghdGhpcy5fX2xpc3RlbmVycyB8fCAhdGhpcy5fX2xpc3RlbmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fbGlzdGVuZXJzW2V2ZW50TmFtZV1cbiAgICAgICAgLm1hcCgoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkICYmIGNvbmZpZy5mbiAhPT0gaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb250ZXh0ICE9PSB1bmRlZmluZWQgJiYgY29uZmlnLmNvbnRleHQgIT09IGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJncyAhPT0gdW5kZWZpbmVkICYmIGNvbmZpZy5hcmdzICE9PSBhcmdzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcigocmVzdWx0KSA9PiAhIXJlc3VsdCk7XG59XG5cbi8qXG4gKiBAY2xhc3MgRW1pdHRlclxuICovXG5leHBvcnQgY2xhc3MgRW1pdHRlciB7XG5cbiAgICBzdGF0aWMgb24oKSB7XG4gICAgICAgIG9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgb24oKSB7XG4gICAgICAgIG9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIG9uY2UoKSB7XG4gICAgICAgIG9uY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBvbmNlKCkge1xuICAgICAgICBvbmNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIG9mZigpIHtcbiAgICAgICAgb2ZmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgb2ZmKCkge1xuICAgICAgICBvZmYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZW1pdCgpIHtcbiAgICAgICAgZW1pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgZW1pdCgpIHtcbiAgICAgICAgZW1pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGJ1YmJsZUV2ZW50KCkge1xuICAgICAgICBidWJibGVFdmVudC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgYnViYmxlRXZlbnQoKSB7XG4gICAgICAgIGJ1YmJsZUV2ZW50LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0TGlzdGVuZXJzKCkge1xuICAgICAgICByZXR1cm4gZ2V0TGlzdGVuZXJzLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBnZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHJldHVybiBnZXRMaXN0ZW5lcnMuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuICAgIH1cbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuZXhwb3J0IHtFdmVudCwgRW1pdHRlcn0gZnJvbSAnLi9lbWl0dGVyJztcblxuZXhwb3J0IGNsYXNzIFNrYXJ5bmEge1xufVxuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUsIGJyb3dzZXI6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5pbXBvcnQge1xuICAgIEVtaXR0ZXJcbn1cbmZyb20gJy4vZW1pdHRlcic7XG5cbmxldCBzdHlsZXM7XG5cbmNvbnN0IFNWR1MgPSB7XG4gICAgcGFyYWdyYXBoOiAnTTgzMiAzMjB2NzA0cTAgMTA0LTQwLjUgMTk4LjV0LTEwOS41IDE2My41LTE2My41IDEwOS41LTE5OC41IDQwLjVoLTY0cS0yNiAwLTQ1LTE5dC0xOS00NXYtMTI4cTAtMjYgMTktNDV0NDUtMTloNjRxMTA2IDAgMTgxLTc1dDc1LTE4MXYtMzJxMC00MC0yOC02OHQtNjgtMjhoLTIyNHEtODAgMC0xMzYtNTZ0LTU2LTEzNnYtMzg0cTAtODAgNTYtMTM2dDEzNi01NmgzODRxODAgMCAxMzYgNTZ0NTYgMTM2em04OTYgMHY3MDRxMCAxMDQtNDAuNSAxOTguNXQtMTA5LjUgMTYzLjUtMTYzLjUgMTA5LjUtMTk4LjUgNDAuNWgtNjRxLTI2IDAtNDUtMTl0LTE5LTQ1di0xMjhxMC0yNiAxOS00NXQ0NS0xOWg2NHExMDYgMCAxODEtNzV0NzUtMTgxdi0zMnEwLTQwLTI4LTY4dC02OC0yOGgtMjI0cS04MCAwLTEzNi01NnQtNTYtMTM2di0zODRxMC04MCA1Ni0xMzZ0MTM2LTU2aDM4NHE4MCAwIDEzNiA1NnQ1NiAxMzZ6JyxcbiAgICBpbWFnZTogJ001NzYgNTc2cTAgODAtNTYgMTM2dC0xMzYgNTYtMTM2LTU2LTU2LTEzNiA1Ni0xMzYgMTM2LTU2IDEzNiA1NiA1NiAxMzZ6bTEwMjQgMzg0djQ0OGgtMTQwOHYtMTkybDMyMC0zMjAgMTYwIDE2MCA1MTItNTEyem05Ni03MDRoLTE2MDBxLTEzIDAtMjIuNSA5LjV0LTkuNSAyMi41djEyMTZxMCAxMyA5LjUgMjIuNXQyMi41IDkuNWgxNjAwcTEzIDAgMjIuNS05LjV0OS41LTIyLjV2LTEyMTZxMC0xMy05LjUtMjIuNXQtMjIuNS05LjV6bTE2MCAzMnYxMjE2cTAgNjYtNDcgMTEzdC0xMTMgNDdoLTE2MDBxLTY2IDAtMTEzLTQ3dC00Ny0xMTN2LTEyMTZxMC02NiA0Ny0xMTN0MTEzLTQ3aDE2MDBxNjYgMCAxMTMgNDd0NDcgMTEzeicsXG4gICAgZGltZW5zaW9uczogJzAgMCAxNzkyIDE3OTInXG59O1xuXG5leHBvcnQgY2xhc3MgSW5qZWN0b3IgZXh0ZW5kcyBFbWl0dGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGFsbG93ZWROb2Rlcykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGxldFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICBkaXYuaW5uZXJIVE1MID0gJzxza2FyeW5hPjxkaXYgZGF0YS1za2FyeW5hLXRvb2x0aXA9XCJsZWZ0XCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2Pjwvc2thcnluYT4nO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRpdi5maXJzdENoaWxkO1xuXG4gICAgICAgIGRpdiA9IHRoaXMuZWxlbWVudC5maXJzdENoaWxkO1xuXG4gICAgICAgIGFsbG93ZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAgICAgbGV0IGFjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKSxcbiAgICAgICAgICAgICAgICBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3N2ZycpLFxuICAgICAgICAgICAgICAgIHBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3BhdGgnKTtcblxuICAgICAgICAgICAgc3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAzMCk7XG4gICAgICAgICAgICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAzMCk7XG4gICAgICAgICAgICBzdmcuc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgU1ZHUy5kaW1lbnNpb25zKTtcbiAgICAgICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyk7XG4gICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnZCcsIFNWR1Nbbm9kZS50eXBlXSk7XG4gICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnZmlsbCcsICcjZmZmJyk7XG5cbiAgICAgICAgICAgIHN2Zy5hcHBlbmRDaGlsZChwYXRoKTtcbiAgICAgICAgICAgIGFjdGlvbi5hcHBlbmRDaGlsZChzdmcpO1xuXG4gICAgICAgICAgICBhY3Rpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXQoJ2luamVjdG5vZGUnLCBub2RlKTtcblxuICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICBkaXYuY2hpbGRyZW5bMV0uYXBwZW5kQ2hpbGQoYWN0aW9uKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFzdHlsZXMpIHtcbiAgICAgICAgICAgIHN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICBzdHlsZXMuaW5uZXJUZXh0ID0gYFxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXBdIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgIHotaW5kZXg6IDEwNzA7XG4gICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBcIkhlbHZldGljYSBOZXVlXCIsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XG4gICAgICAgICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICAgICAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gICAgICAgICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNDI4NTcxNDM7XG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogc3RhcnQ7XG4gICAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgICAgICB0ZXh0LXNoYWRvdzogbm9uZTtcbiAgICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICAgICAgICAgICAgbGV0dGVyLXNwYWNpbmc6IG5vcm1hbDtcbiAgICAgICAgICAgIHdvcmQtYnJlYWs6IG5vcm1hbDtcbiAgICAgICAgICAgIHdvcmQtc3BhY2luZzogbm9ybWFsO1xuICAgICAgICAgICAgd29yZC13cmFwOiBub3JtYWw7XG4gICAgICAgICAgICB3aGl0ZS1zcGFjZTogbm9ybWFsO1xuICAgICAgICAgICAgLypmaWx0ZXI6IGFscGhhKG9wYWNpdHk9MCk7XG4gICAgICAgICAgICBvcGFjaXR5OiAwOyovXG4gICAgICAgICAgICBsaW5lLWJyZWFrOiBhdXRvO1xuICAgICAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjVzO1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcF0gZGl2Om50aC1jaGlsZCgyKSB7XG4gICAgICAgICAgICBtYXgtd2lkdGg6IDIwMHB4O1xuICAgICAgICAgICAgcGFkZGluZzogM3B4IDhweDtcbiAgICAgICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgfVxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXBdIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgd2lkdGg6IDA7XG4gICAgICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgICAgfVxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXA9XCJsZWZ0XCJdIHtcbiAgICAgICAgICAgIHBhZGRpbmc6IDAgNXB4O1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IC0zcHg7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwPVwidG9wXCJdIHtcbiAgICAgICAgICAgIHBhZGRpbmc6IDVweCAwO1xuICAgICAgICAgICAgbWFyZ2luLXRvcDogLTNweDtcbiAgICAgICAgfVxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXA9XCJib3R0b21cIl0ge1xuICAgICAgICAgICAgcGFkZGluZzogNXB4IDA7XG4gICAgICAgICAgICBtYXJnaW4tdG9wOiAzcHg7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwPVwicmlnaHRcIl0ge1xuICAgICAgICAgICAgcGFkZGluZzogMCA1cHg7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogM3B4O1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcD1cImxlZnRcIl0gZGl2Om50aC1jaGlsZCgxKSB7XG4gICAgICAgICAgICB0b3A6IDUwJTtcbiAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgICAgbWFyZ2luLXRvcDogLTVweDtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogNXB4IDAgNXB4IDVweDtcbiAgICAgICAgICAgIGJvcmRlci1sZWZ0LWNvbG9yOiAjMDAwO1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcD1cInRvcFwiXSBkaXY6bnRoLWNoaWxkKDEpIHtcbiAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAtNXB4O1xuICAgICAgICAgICAgYm9yZGVyLXdpZHRoOiA1cHggNXB4IDA7XG4gICAgICAgICAgICBib3JkZXItdG9wLWNvbG9yOiAjMDAwO1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcD1cImJvdHRvbVwiXSBkaXY6bnRoLWNoaWxkKDEpIHtcbiAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAtNXB4O1xuICAgICAgICAgICAgYm9yZGVyLXdpZHRoOiAwIDVweCA1cHg7XG4gICAgICAgICAgICBib3JkZXItYm90dG9tLWNvbG9yOiAjMDAwO1xuICAgICAgICB9XG4gICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbHRpcD1cInJpZ2h0XCJdIGRpdjpudGgtY2hpbGQoMSkge1xuICAgICAgICAgICAgdG9wOiA1MCU7XG4gICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgbWFyZ2luLXRvcDogLTVweDtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogNXB4IDVweCA1cHggMDtcbiAgICAgICAgICAgIGJvcmRlci1yaWdodC1jb2xvcjogIzAwMDtcbiAgICAgICAgfVxuICAgICAgICBbZGF0YS1za2FyeW5hLXRvb2x0aXBdIGEge1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDEwcHg7XG4gICAgICAgIH1cbiAgICAgICAgW2RhdGEtc2thcnluYS10b29sdGlwXSBhOmZpcnN0LWNoaWxke1xuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDBweDtcbiAgICAgICAgfWA7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3R5bGVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdvVG8oeCwgeSkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGxldFxuICAgICAgICAgICAgICAgIGRpdiA9IHRoaXMuZWxlbWVudC5maXJzdENoaWxkLFxuICAgICAgICAgICAgICAgIGluamVjdG9yQm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgZGl2LnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSAoeCAtIGluamVjdG9yQm94LndpZHRoKSArICdweCc7XG4gICAgICAgIH0sIDApO1xuXG4gICAgfVxufVxuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5jbGFzcyBQYXJzZXIge1xuXG4gICAgcGFyc2UoZm9ybWF0LCB0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ01vZGVsIGlzIGVtcHR5JykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlKGZvcm1hdCwgdG9rZW4sIGRhdGEsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIG9uKGZvcm1hdCwgdG9rZW4sIGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5faGFuZGxlcnMgPSB0aGlzLl9oYW5kbGVycyB8fCB7fTtcbiAgICAgICAgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSA9IHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gfHwge307XG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bdG9rZW5dID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBoYW5kbGUoZm9ybWF0LCB0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuXG4gICAgICAgIGxldCBoYW5kbGVyID0gKHRoaXMuX2hhbmRsZXJzICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF0gJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVt0b2tlbl0pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVt0b2tlbl0gOiBudWxsO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIgPSAodGhpcy5faGFuZGxlcnMgJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdWycqJ10pID8gdGhpcy5faGFuZGxlcnNbZm9ybWF0XVsnKiddIDogbnVsbDtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vIGhhbmRsZXIgZGVmaW5lZCBmb3IgJyArIGZvcm1hdCArICcgOiAnICsgdG9rZW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoYW5kbGVyKHRva2VuLCBkYXRhLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKFBPTSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQT007XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKCk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyogZ2xvYmFscyBkb2N1bWVudCAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgcGFyc2VyXG59XG5mcm9tICcuLy4uL3BhcnNlcic7XG5pbXBvcnQge1xuICAgIGFycmFpemUsXG4gICAgY2xvbmVcbn1cbmZyb20gJy4vLi4vdXRpbCc7XG5pbXBvcnQge1xuICAgIERvY3VtZW50LFxuICAgIFRleHROb2RlLFxuICAgIEJsb2NrTm9kZSxcbiAgICBQYXJhZ3JhcGgsXG4gICAgSGVhZGluZyxcbiAgICBJbWFnZSxcbiAgICBRdW90ZSxcbiAgICBTdGF0aWNCbG9ja05vZGVcbn1cbmZyb20gJy4vLi4vZG9jdW1lbnQnO1xuXG5mdW5jdGlvbiB3aGF0V3JhcHBlcihyb290Tm9kZSkge1xuICAgIHN3aXRjaCAocm9vdE5vZGUpIHtcbiAgICBjYXNlICd0ZCc6XG4gICAgY2FzZSAndGgnOlxuICAgICAgICByZXR1cm4gJ3RyJztcbiAgICBjYXNlICd0cic6XG4gICAgICAgIHJldHVybiAndGFibGUnO1xuICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnZGl2JztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVkaXRNb2RlKG5vZGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVkaXQpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcsIG5vZGUubmFtZSk7XG4gICAgICAgIG5vZGUuX19lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDaGlsZHJlbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50LmNoaWxkTm9kZXMpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgIC5hbGwoYXJyYWl6ZShlbGVtZW50LmNoaWxkTm9kZXMpXG4gICAgICAgICAgICAubWFwKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSB8fCBjaGlsZC5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnJvbUhUTUwoY2hpbGQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29uc3RydWN0b3IgPT09IFRleHROb2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFpdGVtLmFic29sdXRlRW1wdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaXRlbSAhPT0gbnVsbDtcbiAgICAgICAgfSkpO1xufVxuXG4vKipcbiAqIFBhcnNlIFBPTSBKU09OIHJlcHJlc2VudGF0aW9uXG4gKiBAcGFyYW0gICB7c3RyaW5nfEhUTUxFbGVtZW50fSAgIG1vZGVsXG4gKiBAcGFyYW0gICB7b3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8Tm9kZT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tSFRNTChpbnB1dCwgb3B0aW9ucykge1xuXG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHdoYXRXcmFwcGVyKGlucHV0LnJlcGxhY2UoJy9eKFxccyopPChbYS16QS1aMC05Xy1dKyknLCAnJDInKS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaW5wdXQ7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4od3JhcHBlciwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChjaGlsZHJlbikgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW5bMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChpdGVtKSA9PiAhKGl0ZW0gaW5zdGFuY2VvZiBUZXh0Tm9kZSB8fCBpdGVtIGluc3RhbmNlb2YgSW5saW5lTm9kZSkpXG4gICAgICAgICAgICAgICAgICAgIC5sZW5ndGhcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLm1hcCgoaXRlbSkgPT4gaXRlbSBpbnN0YW5jZW9mIEJsb2NrTm9kZSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERvY3VtZW50KGNoaWxkcmVuLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBhcmFncmFwaChpdGVtLnRleHQsIGl0ZW0uZm9ybWF0cywgaXRlbS5hdHRycywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnQoY2hpbGRyZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaXRlbXMgPSBjaGlsZHJlbi5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgSW5saW5lTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbdGV4dCwgZm9ybWF0c10gPSBzdHJpbmdpZnkoW2l0ZW1dKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRleHROb2RlKHRleHQsIGZvcm1hdHMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gaXRlbXMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpcnN0LmFwcGVuZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3Q7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZSgnaHRtbCcsIGlucHV0Lm5vZGVUeXBlID09PSAzID8gJ3RleHQnIDogaW5wdXQubm9kZU5hbWUsIGlucHV0KTtcbn1cblxuY2xhc3MgSW5saW5lTm9kZSBleHRlbmRzIEJsb2NrTm9kZSB7XG5cbn1cblxuZnVuY3Rpb24gZm9ybWF0VHlwZShpdGVtLCB0ZXh0KSB7XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gJ0EnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnQScsXG4gICAgICAgICAgICB0aXRsZTogaXRlbS5hdHRycy50aXRsZSB8fCB0ZXh0LFxuICAgICAgICAgICAgaHJlZjogaXRlbS5hdHRycy5ocmVmXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBpdGVtLnR5cGU7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeShpdGVtcykge1xuICAgIGxldCB0ZXh0ID0gJycsXG4gICAgICAgIGZvcm1hdHMgPSBbXSxcbiAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIElubGluZU5vZGUpIHtcbiAgICAgICAgICAgIGxldCBbaW5uZXJUZXh0LCBpbm5lckZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW0uaXRlbXMpLFxuICAgICAgICAgICAgICAgIGZvcm1hdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2xpY2U6IFtpbmRleCwgaW5uZXJUZXh0Lmxlbmd0aF0sXG4gICAgICAgICAgICAgICAgICAgIGFwcGx5OiBbZm9ybWF0VHlwZShpdGVtLCBpbm5lclRleHQpXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3JtYXRzLnB1c2goZm9ybWF0KTtcbiAgICAgICAgICAgIGlubmVyRm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgICBmb3JtYXRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBzbGljZTogW2luZGV4ICsgZm9ybWF0LnNsaWNlWzBdLCBmb3JtYXQuc2xpY2VbMV1dLFxuICAgICAgICAgICAgICAgICAgICBhcHBseTogZm9ybWF0LmFwcGx5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICAgICAgZm9ybWF0cy5mb3JFYWNoKChvdGhlckZvcm1hdCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JtYXQgIT09IG90aGVyRm9ybWF0ICYmIGZvcm1hdC5zbGljZVswXSA9PT0gb3RoZXJGb3JtYXQuc2xpY2VbMF0gJiYgZm9ybWF0LnNsaWNlWzFdID09PSBvdGhlckZvcm1hdC5zbGljZVsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0LmFwcGx5ID0gZm9ybWF0LmFwcGx5LmNvbmNhdChvdGhlckZvcm1hdC5hcHBseSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXRzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRleHQgKz0gaW5uZXJUZXh0O1xuICAgICAgICAgICAgaW5kZXggKz0gaW5uZXJUZXh0Lmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtIGluc3RhbmNlb2YgVGV4dE5vZGUpIHtcbiAgICAgICAgICAgIHRleHQgKz0gaXRlbS50ZXh0O1xuICAgICAgICAgICAgaW5kZXggKz0gaXRlbS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW3RleHQsIGZvcm1hdHNdO1xufVxuXG5mdW5jdGlvbiBoZWFkaW5nKHRva2VuLCBkYXRhLCBvcHRpb25zKSB7XG5cbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgbGV0IFt0ZXh0LCBmb3JtYXRzXSA9IHN0cmluZ2lmeShpdGVtcyk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBIZWFkaW5nKHRva2VuWzFdLnRvTG93ZXJDYXNlKCksIHRleHQgfHwgJycsIGZvcm1hdHMubGVuZ3RoID8gZm9ybWF0cyA6IG51bGwsIG9wdGlvbnMpKTtcbiAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcmFncmFwaCh0b2tlbiwgZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsKSk7XG4gICAgICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVzKGlucHV0KSB7XG4gICAgbGV0IG91dHB1dCA9IG51bGw7XG4gICAgYXJyYWl6ZShpbnB1dClcbiAgICAgICAgLmZvckVhY2goKGF0dHJpYnV0ZSkgPT4ge1xuICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0IHx8IHt9O1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZS52YWx1ZSAmJiBhdHRyaWJ1dGUudmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcblxufVxuXG5mdW5jdGlvbiBpZkF0dHIodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHF1b3RlKHRva2VuLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHByb2Nlc3NDaGlsZHJlbihkYXRhLCBvcHRpb25zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcblxuICAgICAgICAgICAgbGV0IHBhcmFncmFwaHMgPSBbXSxcbiAgICAgICAgICAgICAgICBsYXN0UGFyYWdyYXBoID0gW107XG4gICAgICAgICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBQYXJhZ3JhcGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RQYXJhZ3JhcGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3RleHQsIGZvcm1hdHNdID0gc3RyaW5naWZ5KGl0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsLCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFBhcmFncmFwaCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUoaXRlbSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RQYXJhZ3JhcGgucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChsYXN0UGFyYWdyYXBoLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxldCBbdGV4dCwgZm9ybWF0c10gPSBzdHJpbmdpZnkoaXRlbXMpO1xuICAgICAgICAgICAgICAgIHBhcmFncmFwaHMucHVzaChQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaCh0ZXh0LCBmb3JtYXRzLmxlbmd0aCA/IGZvcm1hdHMgOiBudWxsLCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFyYWdyYXBocyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgUXVvdGUoaXRlbXMpKTtcbiAgICAgICAgfSk7XG59XG5cbnBhcnNlci5vbignaHRtbCcsICd0ZXh0JywgKHRva2VuLCBkYXRhLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgVGV4dE5vZGUoZGF0YS50ZXh0Q29udGVudCwgbnVsbCwgb3B0aW9ucykpO1xufSk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDEnLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdIMicsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ0gzJywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnSDQnLCBoZWFkaW5nKTtcbnBhcnNlci5vbignaHRtbCcsICdINScsIGhlYWRpbmcpO1xucGFyc2VyLm9uKCdodG1sJywgJ0g2JywgaGVhZGluZyk7XG5wYXJzZXIub24oJ2h0bWwnLCAnUCcsIHBhcmFncmFwaCk7XG5wYXJzZXIub24oJ2h0bWwnLCAnQkxPQ0tRVU9URScsIHF1b3RlKTtcblxucGFyc2VyLm9uKCdodG1sJywgJ0lNRycsICh0b2tlbiwgZGF0YSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEltYWdlKGRhdGEuc3JjLCBpZkF0dHIoZGF0YS5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykpLCBpZkF0dHIoZGF0YS5nZXRBdHRyaWJ1dGUoJ2FsdCcpKSwgY2xvbmUoW2F0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKV0sIFsnc3JjJywgJ3RpdGxlJywgJ2FsdCddKSksIG9wdGlvbnMpO1xufSk7XG5cblsnQUREUkVTUycsICdBUlRJQ0xFJywgJ0FTSURFJywgJ0RJVicsICdGSUdVUkUnLCAnRk9PVEVSJywgJ0hFQURFUicsICdNQUlOJywgJ05BVicsICdTRUNUSU9OJ10uZm9yRWFjaCgobm9kZU5hbWUpID0+IHtcbiAgICBwYXJzZXIub24oJ2h0bWwnLCBub2RlTmFtZSwgKHRva2VuLCBkYXRhLCBvcHRpb25zKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFN0YXRpY0Jsb2NrTm9kZSh0b2tlbiwgaXRlbXMsIGF0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKSksIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxucGFyc2VyLm9uKCdodG1sJywgJyonLCAodG9rZW4sIGRhdGEsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gcHJvY2Vzc0NoaWxkcmVuKGRhdGEsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSW5saW5lTm9kZSh0b2tlbiwgaXRlbXMsIGF0dHJpYnV0ZXMoZGF0YS5hdHRyaWJ1dGVzKSksIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbn0pO1xuLypcbnBhcnNlci5vbignaHRtbCcsICcjdGV4dCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFRleHROb2RlKGRhdGEudGV4dENvbnRlbnQpKTtcbn0pO1xuXG5bXG4gICAgWydiJywgJ3N0cm9uZyddLFxuICAgIFsnYmlnJywgJ3N0cm9uZyddLFxuICAgIFsnaScsICdlbSddLFxuICAgICdzbWFsbCcsXG4gICAgWyd0dCcsICdjb2RlJ10sXG4gICAgWydhYmJyJywgJ3NlbWFudGljJywgJ2FiYnInXSxcbiAgICBbJ2Fjcm9ueW0nLCAnYWJicicsICdhYmJyJ10sXG4gICAgWydjaXRlJywgJ3NlbWFudGljJywgJ2NpdGUnXSxcbiAgICAnY29kZScsXG4gICAgWydkZm4nLCAnc2VtYW50aWMnLCAnZGVmaW5pdGlvbiddLFxuICAgICdlbScsXG4gICAgWyd0aW1lJywgJ3NlbWFudGljJywgJ3RpbWUnXSxcbiAgICBbJ3ZhcicsICdjb2RlJywgJ3ZhciddLFxuICAgIFsna2JkJywgJ2NvZGUnLCAna2JkJ10sXG4gICAgJ3N0cm9uZycsXG4gICAgWydzYW1wJywgJ2NvZGUnLCAnc2FtcGxlJ10sXG4gICAgJ2JkbycsXG4gICAgJ2EnLFxuICAgIC8vJ2JyJyxcbiAgICAvLydpbWcsXG4gICAgLy8nbWFwJyxcbiAgICAvLydvYmplY3QnLFxuICAgIFsncScsICdzZW1hbnRpYycsICdxdW90YXRpb24nXSxcbiAgICAvL3NjcmlwdFxuICAgICdzcGFuJyxcbiAgICBkZWwsXG4gICAgc1xuICAgICdzdWInLFxuICAgICdzdXAnLFxuICAgIC8vYnV0dG9uXG4gICAgLy9pbnB1dFxuICAgIC8vbGFiZWxcbiAgICAvL3NlbGVjdFxuICAgIC8vdGV4dGFyZWFcbl0uZm9yRWFjaCgoaW5saW5lUnVsZSkgPT4ge1xuXG4gICAgbGV0IGlucHV0ID0gdHlwZW9mIGlubGluZVJ1bGUgPT09ICdzdHJpbmcnID8gaW5saW5lUnVsZSA6IGlubGluZVJ1bGVbMF07XG5cbiAgICBwYXJzZXIub24oJ2h0bWwnLCBpbnB1dCwgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hpbGRyZW4oZGF0YSlcbiAgICAgICAgICAgIC50aGVuKChpdGVtcykgPT4ge1xuXG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxufSk7XG4qL1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIHBhcnNlclxufVxuZnJvbSAnLi8uLi9wYXJzZXInO1xuXG5pbXBvcnQge1xuICAgIFRleHROb2RlLFxuICAgIERvY3VtZW50LFxuICAgIEhlYWRpbmcsXG4gICAgUGFyYWdyYXBoLFxuICAgIEltYWdlLFxuICAgIEZpZWxkcyxcbiAgICBWYXJpYW50c1xufVxuZnJvbSAnLi8uLi9kb2N1bWVudCc7XG5cbi8qKlxuICogUGFyc2UgUE9NIEpTT04gcmVwcmVzZW50YXRpb25cbiAqIEBwYXJhbSAgIHtvYmplY3R9ICAgbW9kZWxcbiAqIEBwYXJhbSAgIHtvcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxOb2RlPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21QT00obW9kZWwpIHtcbiAgICBpZiAoIW1vZGVsKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZXIucGFyc2UoJ3BvbScsIG1vZGVsLnR5cGUsIG1vZGVsKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NoaWxkTm9kZXMoaXRlbXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiBmcm9tUE9NKGl0ZW0pO1xuICAgIH0pKS50aGVuKChpdGVtcykgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbXMuZmlsdGVyKChpdGVtKSA9PiAhIWl0ZW0pO1xuICAgIH0pO1xufVxuXG5wYXJzZXIub24oJ3BvbScsICdkb2N1bWVudCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBwcm9jZXNzQ2hpbGROb2RlcyhkYXRhLml0ZW1zKVxuICAgICAgICAudGhlbigoaXRlbXMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRG9jdW1lbnQoaXRlbXMpO1xuICAgICAgICB9KTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdoZWFkaW5nJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSGVhZGluZyhkYXRhLmxldmVsLCBkYXRhLnRleHQsIGRhdGEuZm9ybWF0cywgZGF0YS5hdHRycykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ3BhcmFncmFwaCcsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFBhcmFncmFwaChkYXRhLnRleHQsIGRhdGEuZm9ybWF0cywgZGF0YS5hdHRycykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ3RleHQnLCAodG9rZW4sIGRhdGEpID0+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBUZXh0Tm9kZShkYXRhLnRleHQsIGRhdGEuZm9ybWF0cykpO1xufSk7XG5cbnBhcnNlci5vbigncG9tJywgJ2ltYWdlJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgSW1hZ2UoZGF0YS5zcmMsIGRhdGEudGl0bGUsIGRhdGEuYWx0KSk7XG59KTtcblxucGFyc2VyLm9uKCdwb20nLCAnRmllbGRzJywgKHRva2VuLCBkYXRhKSA9PiB7XG4gICAgbGV0IGZpZWxkcyA9IHt9O1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGRhdGEpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ3R5cGUnKVxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21QT00oZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoUE9NKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHNba2V5XSA9IFBPTTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgRmllbGRzKGZpZWxkcykpO1xuICAgICAgICB9KTtcbn0pO1xuXG5wYXJzZXIub24oJ3BvbScsICdWYXJpYW50cycsICh0b2tlbiwgZGF0YSkgPT4ge1xuICAgIGxldCB2YXJpYW50cyA9IHt9O1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKGRhdGEpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ3R5cGUnKVxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb21QT00oZGF0YVtrZXldKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoUE9NKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50c1trZXldID0gUE9NO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBWYXJpYW50cyh2YXJpYW50cykpO1xuICAgICAgICB9KTtcbn0pO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIEV2ZW50LCBFbWl0dGVyXG59XG5mcm9tICcuL2VtaXR0ZXInO1xuXG5pbXBvcnQge1xuICAgIGRpZmZcbn1cbmZyb20gJ2pzb25kaWZmcGF0Y2gnO1xuaW1wb3J0IHtcbiAgICB0b1BPTVxufVxuZnJvbSAnLi9zZXJpYWxpemVyL3RvUE9NJztcblxuZXhwb3J0IGNvbnN0IENIQU5HRSA9ICdjaGFuZ2UnO1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRE9DVU1FTlQgPSAnI2RlZmF1bHQnO1xuXG5jbGFzcyBSZXBvc2l0b3J5IGV4dGVuZHMgRW1pdHRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRzID0ge307XG4gICAgfVxuXG4gICAgZ2V0IG1haW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kb2N1bWVudHNbREVGQVVMVF9ET0NVTUVOVF07XG4gICAgfVxuXG4gICAgZ2V0KGRvY3VtZW50SWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RvY3VtZW50c1tkb2N1bWVudElkXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50c1tkb2N1bWVudElkXS5jb250ZW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0KGRvY3VtZW50SWQsIHZhbHVlKSB7XG4gICAgICAgIGxldCBwcmV2aW91cyA9IHRoaXMuX2RvY3VtZW50c1tkb2N1bWVudElkXSB8fCB7XG4gICAgICAgICAgICBpbml0aWFsOiB0b1BPTSh2YWx1ZSlcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRzW2RvY3VtZW50SWRdID0ge1xuICAgICAgICAgICAgaW5pdGlhbDogcHJldmlvdXMuaW5pdGlhbCxcbiAgICAgICAgICAgIGNvbnRlbnQ6IHZhbHVlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZW1pdChDSEFOR0UsIHtcbiAgICAgICAgICAgIGlkOiBkb2N1bWVudElkXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhcyhkb2N1bWVudElkKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RvY3VtZW50c1tkb2N1bWVudElkXTtcbiAgICB9XG5cbiAgICBkaWZmKGRvY3VtZW50SWQpIHtcbiAgICAgICAgaWYgKCFkb2N1bWVudElkKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge30sXG4gICAgICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgICAgICAgIC5hbGwoT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIC5rZXlzKHRoaXMuX2RvY3VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgLm1hcChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGlmZihrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZGVsdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IGRlbHRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiByZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgICAgIC5hbGwoW1xuICAgICAgICAgICAgdGhpcy5fZG9jdW1lbnRzW2RvY3VtZW50SWRdLmluaXRpYWwsXG4gICAgICAgICAgICB0b1BPTSh0aGlzLl9kb2N1bWVudHNbZG9jdW1lbnRJZF0uY29udGVudClcbiAgICAgICAgXSlcbiAgICAgICAgICAgIC50aGVuKHJlc3VsdHMgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkaWZmKHJlc3VsdHNbMF0sIHJlc3VsdHNbMV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICBsZXQgZGF0YSA9IHt9O1xuICAgICAgICBPYmplY3RcbiAgICAgICAgICAgIC5rZXlzKHRoaXMuX2RvY3VtZW50cylcbiAgICAgICAgICAgIC5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2RvY3VtZW50c1trZXldLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogdGhpcy5fZG9jdW1lbnRzW2tleV0uY29udGVudC50b0pTT04oKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxufVxuXG5cbmV4cG9ydCB2YXIgcmVwb3NpdG9yeSA9IG5ldyBSZXBvc2l0b3J5KCk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmNsYXNzIFNlcmlhbGl6ZXIge1xuXG4gICAgc2VyaWFsaXplKGZvcm1hdCwgbm9kZSwgb3B0aW9ucykge1xuXG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTW9kZWwgaXMgZW1wdHknKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW5vZGUudHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignVW5kZWZpbmVkIG5vZGUgdHlwZScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZShmb3JtYXQsIG5vZGUudHlwZSwgbm9kZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgb24oZm9ybWF0LCBub2RlVHlwZSwgaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9oYW5kbGVycyA9IHRoaXMuX2hhbmRsZXJzIHx8IHt9O1xuICAgICAgICB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdID0gdGhpcy5faGFuZGxlcnNbZm9ybWF0XSB8fCB7fTtcbiAgICAgICAgdGhpcy5faGFuZGxlcnNbZm9ybWF0XVtub2RlVHlwZV0gPSBoYW5kbGVyO1xuICAgIH1cblxuICAgIGhhbmRsZShmb3JtYXQsIG5vZGVUeXBlLCBub2RlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgbGV0IGhhbmRsZXIgPSAodGhpcy5faGFuZGxlcnMgJiYgdGhpcy5faGFuZGxlcnNbZm9ybWF0XSAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdW25vZGVUeXBlXSkgPyB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdW25vZGVUeXBlXSA6IG51bGw7XG4gICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgaGFuZGxlciA9ICh0aGlzLl9oYW5kbGVycyAmJiB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdICYmIHRoaXMuX2hhbmRsZXJzW2Zvcm1hdF1bJyonXSkgPyB0aGlzLl9oYW5kbGVyc1tmb3JtYXRdWycqJ10gOiBudWxsO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTm8gaGFuZGxlciBkZWZpbmVkIGZvciAnICsgZm9ybWF0ICsgJyA6ICcgKyBub2RlVHlwZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYW5kbGVyKG5vZGUsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBodG1sO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaGFuZGxlQ29udGVudHMoZm9ybWF0LCBhcnJheSwgb3B0aW9ucykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgICAgICAuYWxsKGFycmF5Lm1hcCgoY29udGVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNlcmlhbGl6ZSgnaHRtbCcsIGNvbnRlbnQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSkpO1xuXG4gICAgfVxufVxuXG5leHBvcnQgdmFyIHNlcmlhbGl6ZXIgPSBuZXcgU2VyaWFsaXplcigpO1xuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUgKi9cbi8qIGdsb2JhbHMgZG9jdW1lbnQgKi9cbi8qKlxuICAgIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuXG4gICAgQ29weXJpZ2h0IChjKSAyMDE2IMWBdWthc3ogTWFyZWsgU2llbHNraVxuXG4gICAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICAgIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAgICBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gICAgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICAgIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICAgIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbiAgICBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAgICBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICAgIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICAgIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICAgIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAgICBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICAgIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gICAgU09GVFdBUkUuXG4qL1xuXG5pbXBvcnQge1xuICAgIHNlcmlhbGl6ZXJcbn1cbmZyb20gJy4vLi4vc2VyaWFsaXplcic7XG5cbmltcG9ydCB7XG4gICAgVGV4dE5vZGVcbn1cbmZyb20gJy4vLi4vZG9jdW1lbnQnO1xuaW1wb3J0IHtcbiAgICBhcnJhaXplXG59XG5mcm9tICcuLy4uL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gdG9IVE1MKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXIuc2VyaWFsaXplKCdodG1sJywgbW9kZWwsIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBvdGhlckF0dHJzKG9iamVjdCwgZXhjZXB0KSB7XG4gICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgIE9iamVjdFxuICAgICAgICAua2V5cyhvYmplY3QpXG4gICAgICAgIC5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGV4Y2VwdC5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgICAgICB9KVxuICAgICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmb3JtYXQoc3RyaW5nLCBmb3JtYXRzKSB7XG4gICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyksXG4gICAgICAgIHNsaWNlcyA9IHN0cmluZy5zcGxpdCgnJykubWFwKChjaGFyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNoYXI6IGNoYXIsXG4gICAgICAgICAgICAgICAgYXBwbHk6IFtdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgIHNsaWNlcy5wdXNoKHtcbiAgICAgICAgY2hhcjogJycsXG4gICAgICAgIGFwcGx5OiBbXVxuICAgIH0pO1xuXG4gICAgZm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IHtcbiAgICAgICAgbGV0IGZyb20gPSBmb3JtYXQuc2xpY2VbMF0sXG4gICAgICAgICAgICB0byA9IGZyb20gKyBmb3JtYXQuc2xpY2VbMV07XG5cbiAgICAgICAgZm9ybWF0LmFwcGx5LmZvckVhY2goKGFwcGx5KSA9PiB7XG4gICAgICAgICAgICBpZiAoc2xpY2VzW2Zyb21dLmFwcGx5LmluZGV4T2YoYXBwbHkpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgc2xpY2VzW2Zyb21dLmFwcGx5LnB1c2goYXBwbHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNsaWNlc1t0b10uYXBwbHkuaW5kZXhPZignLycgKyBhcHBseSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzbGljZXNbdG9dLmFwcGx5LnB1c2goJy8nICsgYXBwbHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICB3cmFwcGVyLmlubmVySFRNTCA9IHNsaWNlcy5tYXAoKGNoYXIpID0+IHtcbiAgICAgICAgcmV0dXJuIGNoYXIuYXBwbHkubWFwKCh0YWcpID0+ICc8JyArIHRhZyArICc+Jykuam9pbignJykgKyBjaGFyLmNoYXI7XG4gICAgfSkuam9pbignJyk7XG4gICAgcmV0dXJuIGFycmFpemUod3JhcHBlci5jaGlsZE5vZGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnQobm9kZSwgbm9kZVR5cGUsIGF0dHJpYnV0ZXMsIGNvbnRlbnQsIG9wdGlvbnMpIHtcblxuICAgIGxldCBwcm9taXNlO1xuXG4gICAgaWYgKGNvbnRlbnQpIHtcblxuICAgICAgICBwcm9taXNlID0gc2VyaWFsaXplci5oYW5kbGVDb250ZW50cygnaHRtbCcsIGNvbnRlbnQgfHwgW10sIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoY29udGVudCkgPT4ge1xuXG4gICAgICAgIGlmIChub2RlLmZvcm1hdHMgJiYgbm9kZS5mb3JtYXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGVudCA9IGZvcm1hdChjb250ZW50WzBdLm5vZGVWYWx1ZSwgbm9kZS5mb3JtYXRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlVHlwZSk7XG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZWRpdCkge1xuICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2thcnluYS1pZCcsIG5vZGUubmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIE9iamVjdFxuICAgICAgICAgICAgICAgIC5rZXlzKGF0dHJpYnV0ZXMpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goKGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuZm9yRWFjaCgoY2hpbGQpID0+IGVsZW0uYXBwZW5kQ2hpbGQoY2hpbGQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbTtcbiAgICB9KTtcbn1cblxuY2xhc3MgRmFrZURvYyB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgIH1cblxuICAgIGFwcGVuZENoaWxkKGNoaWxkKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgfVxuXG4gICAgZ2V0IG91dGVySFRNTCgpIHtcbiAgICAgICAgbGV0IHN0ciA9ICcnO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gY2hpbGQub3V0ZXJIVE1MO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gY2hpbGQudGV4dENvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbn1cblxuc2VyaWFsaXplci5vbignaHRtbCcsICdkb2N1bWVudCcsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXJcbiAgICAgICAgLmhhbmRsZUNvbnRlbnRzKCdodG1sJywgbm9kZS5pdGVtcyB8fCBbXSwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oKGNvbnRlbnRzKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cHV0ID0gbmV3IEZha2VEb2MoKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbnRlbnRzKSkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRzLmZvckVhY2goKGNoaWxkKSA9PiBvdXRwdXQuYXBwZW5kQ2hpbGQoY2hpbGQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0pO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnaGVhZGluZycsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGVsZW1lbnQobm9kZSwgJ2gnICsgKG5vZGUubGV2ZWwgfHwgMSksIG5vZGUuYXR0cigpLCBbbmV3IFRleHROb2RlKG5vZGUudGV4dCwgbm9kZS5mb3JtYXRzKV0sIG9wdGlvbnMpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAncGFyYWdyYXBoJywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gZWxlbWVudChub2RlLCAncCcsIG5vZGUuYXR0cigpLCBbbmV3IFRleHROb2RlKG5vZGUudGV4dCwgbm9kZS5mb3JtYXRzKV0sIG9wdGlvbnMpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnaW1hZ2UnLCAobm9kZSwgb3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBlbGVtZW50KG5vZGUsICdpbWcnLCBub2RlLmF0dHIoKSwgbnVsbCwgb3B0aW9ucyk7XG59KTtcblxuc2VyaWFsaXplci5vbignaHRtbCcsICd0ZXh0JywgKG5vZGUsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUudGV4dCk7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5lZGl0KSB7XG4gICAgICAgIC8vZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBub2RlLm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGVsZW1lbnQpO1xufSk7XG5cbnNlcmlhbGl6ZXIub24oJ2h0bWwnLCAnKicsIChub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIGVsZW1lbnQobm9kZSwgbm9kZS5fdHlwZSwgbm9kZS5hdHRyKCksIG5vZGUuaXRlbXMsIG9wdGlvbnMpO1xufSk7XG4iLCIvKiBqc2xpbnQgZXNuZXh0OnRydWUsIG5vZGU6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5cbmltcG9ydCB7XG4gICAgc2VyaWFsaXplclxufVxuZnJvbSAnLi8uLi9zZXJpYWxpemVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRvUE9NKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXIuc2VyaWFsaXplKCdwb20nLCBtb2RlbCwgb3B0aW9ucyk7XG59XG5cbnNlcmlhbGl6ZXIub24oJ3BvbScsICcqJywgKG5vZGUpID0+IFByb21pc2UucmVzb2x2ZShub2RlLnRvSlNPTigpKSk7XG5cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuZXhwb3J0IGNsYXNzIFRvb2xiYXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1za2FyeW5hLXRvb2xiYXInLCAnJyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSAnPGRpdiBkYXRhLXNrYXJ5bmEtdG9vbGJhci1hY3Rpb25zPmFhYWFhYWFhYTwvZGl2PjxkaXYgZGF0YS1za2FyeW5hLXRvb2xiYXItYXJyb3c+PHNwYW4+PC9zcGFuPjwvZGl2Pic7XG4gICAgICAgIHRoaXMuYXJyb3cgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtc2thcnluYS10b29sYmFyLWFycm93XScpO1xuXG4gICAgICAgIGxldCBzdHlsZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZXMuaW5uZXJUZXh0ID0gYFxuICAgICAgICAgICAgW2RhdGEtc2thcnluYS10b29sYmFyXSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgICAgICAgICAgIHotaW5kZXg6IDEwMDAwO1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IG5vbmU7XG4gICAgICAgICAgICAgICAgdG9wOiAwO1xuICAgICAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbGJhci1hY3Rpb25zXSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byBib3R0b20scmdiYSg0OSw0OSw0NywuOTkpLCMyNjI2MjUpO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQteDtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1cHg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFtkYXRhLXNrYXJ5bmEtdG9vbGJhci1hcnJvd10ge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICBib3R0b206IC0xMHB4O1xuICAgICAgICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgICAgICAgICBjbGlwOiByZWN0KDEwcHggMjBweCAyMHB4IDApO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAtMTBweDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgW2RhdGEtc2thcnluYS10b29sYmFyLWFycm93XSA+IHNwYW4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAyMHB4O1xuICAgICAgICAgICAgICAgIGhlaWdodDogMjBweDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjYyNjI1O1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDQ1ZGVnKSBzY2FsZSguNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBgO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3R5bGVzKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICAgIH1cblxuICAgIGdldFNlbGVjdGlvbkNvb3Jkcyh0aGVXaW5kb3cpIHtcbiAgICAgICAgbGV0IHdpbiA9IHRoZVdpbmRvdyB8fCB3aW5kb3csXG4gICAgICAgICAgICBkb2MgPSB3aW4uZG9jdW1lbnQsXG4gICAgICAgICAgICBzZWwgPSBkb2Muc2VsZWN0aW9uLFxuICAgICAgICAgICAgcmFuZ2UsIHJlY3RzLCByZWN0LFxuICAgICAgICAgICAgeCA9IDAsXG4gICAgICAgICAgICB5ID0gMDtcbiAgICAgICAgaWYgKHNlbCkge1xuICAgICAgICAgICAgaWYgKHNlbC50eXBlICE9IFwiQ29udHJvbFwiKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBzZWwuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB4ID0gcmFuZ2UuYm91bmRpbmdMZWZ0O1xuICAgICAgICAgICAgICAgIHkgPSByYW5nZS5ib3VuZGluZ1RvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW4uZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWwgPSB3aW4uZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IHNlbC5nZXRSYW5nZUF0KDApLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2UuZ2V0Q2xpZW50UmVjdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlY3RzID0gcmFuZ2UuZ2V0Q2xpZW50UmVjdHMoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVjdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdCA9IHJlY3RzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHggPSByZWN0LmxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIHkgPSByZWN0LnRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRmFsbCBiYWNrIHRvIGluc2VydGluZyBhIHRlbXBvcmFyeSBlbGVtZW50XG4gICAgICAgICAgICAgICAgaWYgKHggPT0gMCAmJiB5ID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwYW4gPSBkb2MuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcGFuLmdldENsaWVudFJlY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbnN1cmUgc3BhbiBoYXMgZGltZW5zaW9ucyBhbmQgcG9zaXRpb24gYnlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZGluZyBhIHplcm8td2lkdGggc3BhY2UgY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShcIlxcdTIwMGJcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShzcGFuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3QgPSBzcGFuLmdldENsaWVudFJlY3RzKClbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gcmVjdC5sZWZ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHJlY3QudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNwYW5QYXJlbnQgPSBzcGFuLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuUGFyZW50LnJlbW92ZUNoaWxkKHNwYW4pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHbHVlIGFueSBicm9rZW4gdGV4dCBub2RlcyBiYWNrIHRvZ2V0aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuUGFyZW50Lm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFuY2hvcigpIHtcbiAgICAgICAgbGV0IGNvb3JkcyA9IHRoaXMuZ2V0U2VsZWN0aW9uQ29vcmRzKCksXG4gICAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHJlY3QsXG4gICAgICAgICAgICBhcnJvdztcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHJlY3QgPSB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBhcnJvdyA9IHRoaXMuYXJyb3cuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLnNob3coY29vcmRzLngsIGNvb3Jkcy55IC0gcmVjdC5oZWlnaHQgLSAxMCk7XG4gICAgICAgIH0sIDEpO1xuICAgIH1cblxuICAgIHNob3coeCwgeSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0geSArICdweCc7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0geCArICdweCc7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPSBudWxsO1xuICAgIH1cbn1cbiIsIi8qIGpzbGludCBlc25leHQ6dHJ1ZSwgbm9kZTp0cnVlICovXG4vKipcbiAgICBUaGUgTUlUIExpY2Vuc2UgKE1JVClcblxuICAgIENvcHlyaWdodCAoYykgMjAxNiDFgXVrYXN6IE1hcmVrIFNpZWxza2lcblxuICAgIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAgICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gICAgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICAgIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAgICBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAgICBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gICAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gICAgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAgICBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAgICBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAgICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gICAgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAgICBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICAgIFNPRlRXQVJFLlxuKi9cblxuLyoqXG4gKiBDb252ZXJ0IGl0ZXJhYmxlIG9iamVjdHMgaW50byBhcnJheXNcbiAqIEBwYXJhbSAgIHtJdGVyYWJsZX0gaXRlcmFibGVcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmFpemUoaXRlcmFibGUpIHtcbiAgICByZXR1cm4gW10uc2xpY2UuYXBwbHkoaXRlcmFibGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoaW5wdXRzLCBleGNlcHQpIHtcbiAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgaW5wdXRzXG4gICAgICAgIC5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBPYmplY3RcbiAgICAgICAgICAgICAgICAua2V5cyhpbnB1dClcbiAgICAgICAgICAgICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleGNlcHQgJiYgZXhjZXB0LmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaW5wdXRba2V5XSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwiLyoganNsaW50IGVzbmV4dDp0cnVlLCBub2RlOnRydWUsIGJyb3dzZXI6dHJ1ZSAqL1xuLyoqXG4gICAgVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbiAgICBDb3B5cmlnaHQgKGMpIDIwMTYgxYF1a2FzeiBNYXJlayBTaWVsc2tpXG5cbiAgICBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gICAgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICAgIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAgICB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gICAgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gICAgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuICAgIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICAgIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbiAgICBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gICAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gICAgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gICAgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICAgIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gICAgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAgICBTT0ZUV0FSRS5cbiovXG5leHBvcnQgY2xhc3MgWEhSIHtcbiAgc3RhdGljIGFqYXgocGF0aCwgbWV0aG9kLCBkYXRhLCByYXcpIHtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICAgICAgaHR0cE1ldGhvZCA9IG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICB4aHIub3BlbihodHRwTWV0aG9kLCBwYXRoKTtcbiAgICAgIGlmIChodHRwTWV0aG9kID09PSAncG9zdCcgfHwgaHR0cE1ldGhvZCA9PT0gJ3B1dCcpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICB9XG5cbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGxldCBET05FID0gNCwgLy8gcmVhZHlTdGF0ZSA0IG1lYW5zIHRoZSByZXF1ZXN0IGlzIGRvbmUuXG4gICAgICAgICAgT0sgPSAyMDA7IC8vIHN0YXR1cyAyMDAgaXMgYSBzdWNjZXNzZnVsIHJldHVybi5cbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSBET05FKSB7XG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IE9LKSB7XG4gICAgICAgICAgICByZXNvbHZlKHhoci5yZXNwb25zZVRleHQpOyAvLyAnVGhpcyBpcyB0aGUgcmV0dXJuZWQgdGV4dC4nXG4gICAgICAgICAgfSBlbHNlIGlmICh4aHIuc3RhdHVzID09PSAnMjA0Jykge1xuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRXJyb3I6ICcgKyB4aHIuc3RhdHVzKSk7IC8vIEFuIGVycm9yIG9jY3VycmVkIGR1cmluZyB0aGUgcmVxdWVzdC5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHhoci5zZW5kKGRhdGEgPyAocmF3ID8gZGF0YSA6IEpTT04uc3RyaW5naWZ5KGRhdGEpKSA6IG51bGwpO1xuXG4gICAgfSk7XG4gIH1cbiAgc3RhdGljIGdldChwYXRoLCByYXcpIHtcbiAgICByZXR1cm4gWEhSLmFqYXgocGF0aCwgJ2dldCcsIG51bGwsIHJhdyk7XG4gIH1cbiAgc3RhdGljIHBvc3QocGF0aCwgZGF0YSwgcmF3KSB7XG4gICAgcmV0dXJuIFhIUi5hamF4KHBhdGgsICdwb3N0JywgZGF0YSwgcmF3KTtcbiAgfVxuICBzdGF0aWMgcHV0KHBhdGgsIGRhdGEsIHJhdykge1xuICAgIHJldHVybiBYSFIuYWpheChwYXRoLCAncHV0JywgZGF0YSwgcmF3KTtcbiAgfVxuICBzdGF0aWMgZGVsZXRlKHBhdGgsIHJhdykge1xuICAgIHJldHVybiBYSFIuYWpheChwYXRoLCAnZGVsZXRlJywgbnVsbCwgcmF3KTtcbiAgfVxufVxuIl19
