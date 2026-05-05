var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var RECYCLED_NODE = 1;
var LAZY_NODE = 2;
var TEXT_NODE = 3;
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var map = EMPTY_ARR.map;
var isArray = Array.isArray;
var defer = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : setTimeout;
var createClass = function(obj) {
  var out = "";
  if (typeof obj === "string") return obj;
  if (isArray(obj) && obj.length > 0) {
    for (var k = 0, tmp; k < obj.length; k++) {
      if ((tmp = createClass(obj[k])) !== "") {
        out += (out && " ") + tmp;
      }
    }
  } else {
    for (var k in obj) {
      if (obj[k]) {
        out += (out && " ") + k;
      }
    }
  }
  return out;
};
var merge = function(a, b) {
  var out = {};
  for (var k in a) out[k] = a[k];
  for (var k in b) out[k] = b[k];
  return out;
};
var batch = function(list) {
  return list.reduce(function(out, item) {
    return out.concat(
      !item || item === true ? 0 : typeof item[0] === "function" ? [item] : batch(item)
    );
  }, EMPTY_ARR);
};
var isSameAction = function(a, b) {
  return isArray(a) && isArray(b) && a[0] === b[0] && typeof a[0] === "function";
};
var shouldRestart = function(a, b) {
  if (a !== b) {
    for (var k in merge(a, b)) {
      if (a[k] !== b[k] && !isSameAction(a[k], b[k])) return true;
      b[k] = a[k];
    }
  }
};
var patchSubs = function(oldSubs, newSubs, dispatch) {
  for (var i = 0, oldSub, newSub, subs = []; i < oldSubs.length || i < newSubs.length; i++) {
    oldSub = oldSubs[i];
    newSub = newSubs[i];
    subs.push(
      newSub ? !oldSub || newSub[0] !== oldSub[0] || shouldRestart(newSub[1], oldSub[1]) ? [
        newSub[0],
        newSub[1],
        newSub[0](dispatch, newSub[1]),
        oldSub && oldSub[2]()
      ] : oldSub : oldSub && oldSub[2]()
    );
  }
  return subs;
};
var patchProperty = function(node, key, oldValue, newValue, listener, isSvg) {
  if (key === "key") ;
  else if (key === "style") {
    for (var k in merge(oldValue, newValue)) {
      oldValue = newValue == null || newValue[k] == null ? "" : newValue[k];
      if (k[0] === "-") {
        node[key].setProperty(k, oldValue);
      } else {
        node[key][k] = oldValue;
      }
    }
  } else if (key[0] === "o" && key[1] === "n") {
    if (!((node.actions || (node.actions = {}))[key = key.slice(2).toLowerCase()] = newValue)) {
      node.removeEventListener(key, listener);
    } else if (!oldValue) {
      node.addEventListener(key, listener);
    }
  } else if (!isSvg && key !== "list" && key in node) {
    node[key] = newValue == null || newValue == "undefined" ? "" : newValue;
  } else if (newValue == null || newValue === false || key === "class" && !(newValue = createClass(newValue))) {
    node.removeAttribute(key);
  } else {
    node.setAttribute(key, newValue);
  }
};
var createNode = function(vdom, listener, isSvg) {
  var ns = "http://www.w3.org/2000/svg";
  var props = vdom.props;
  var node = vdom.type === TEXT_NODE ? document.createTextNode(vdom.name) : (isSvg = isSvg || vdom.name === "svg") ? document.createElementNS(ns, vdom.name, { is: props.is }) : document.createElement(vdom.name, { is: props.is });
  for (var k in props) {
    patchProperty(node, k, null, props[k], listener, isSvg);
  }
  for (var i = 0, len = vdom.children.length; i < len; i++) {
    node.appendChild(
      createNode(
        vdom.children[i] = getVNode(vdom.children[i]),
        listener,
        isSvg
      )
    );
  }
  return vdom.node = node;
};
var getKey = function(vdom) {
  return vdom == null ? null : vdom.key;
};
var patch = function(parent, node, oldVNode, newVNode, listener, isSvg) {
  if (oldVNode === newVNode) ;
  else if (oldVNode != null && oldVNode.type === TEXT_NODE && newVNode.type === TEXT_NODE) {
    if (oldVNode.name !== newVNode.name) node.nodeValue = newVNode.name;
  } else if (oldVNode == null || oldVNode.name !== newVNode.name) {
    node = parent.insertBefore(
      createNode(newVNode = getVNode(newVNode), listener, isSvg),
      node
    );
    if (oldVNode != null) {
      parent.removeChild(oldVNode.node);
    }
  } else {
    var tmpVKid;
    var oldVKid;
    var oldKey;
    var newKey;
    var oldVProps = oldVNode.props;
    var newVProps = newVNode.props;
    var oldVKids = oldVNode.children;
    var newVKids = newVNode.children;
    var oldHead = 0;
    var newHead = 0;
    var oldTail = oldVKids.length - 1;
    var newTail = newVKids.length - 1;
    isSvg = isSvg || newVNode.name === "svg";
    for (var i in merge(oldVProps, newVProps)) {
      if ((i === "value" || i === "selected" || i === "checked" ? node[i] : oldVProps[i]) !== newVProps[i]) {
        patchProperty(node, i, oldVProps[i], newVProps[i], listener, isSvg);
      }
    }
    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldHead])) == null || oldKey !== getKey(newVKids[newHead])) {
        break;
      }
      patch(
        node,
        oldVKids[oldHead].node,
        oldVKids[oldHead],
        newVKids[newHead] = getVNode(
          newVKids[newHead++],
          oldVKids[oldHead++]
        ),
        listener,
        isSvg
      );
    }
    while (newHead <= newTail && oldHead <= oldTail) {
      if ((oldKey = getKey(oldVKids[oldTail])) == null || oldKey !== getKey(newVKids[newTail])) {
        break;
      }
      patch(
        node,
        oldVKids[oldTail].node,
        oldVKids[oldTail],
        newVKids[newTail] = getVNode(
          newVKids[newTail--],
          oldVKids[oldTail--]
        ),
        listener,
        isSvg
      );
    }
    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        node.insertBefore(
          createNode(
            newVKids[newHead] = getVNode(newVKids[newHead++]),
            listener,
            isSvg
          ),
          (oldVKid = oldVKids[oldHead]) && oldVKid.node
        );
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        node.removeChild(oldVKids[oldHead++].node);
      }
    } else {
      for (var i = oldHead, keyed = {}, newKeyed = {}; i <= oldTail; i++) {
        if ((oldKey = oldVKids[i].key) != null) {
          keyed[oldKey] = oldVKids[i];
        }
      }
      while (newHead <= newTail) {
        oldKey = getKey(oldVKid = oldVKids[oldHead]);
        newKey = getKey(
          newVKids[newHead] = getVNode(newVKids[newHead], oldVKid)
        );
        if (newKeyed[oldKey] || newKey != null && newKey === getKey(oldVKids[oldHead + 1])) {
          if (oldKey == null) {
            node.removeChild(oldVKid.node);
          }
          oldHead++;
          continue;
        }
        if (newKey == null || oldVNode.type === RECYCLED_NODE) {
          if (oldKey == null) {
            patch(
              node,
              oldVKid && oldVKid.node,
              oldVKid,
              newVKids[newHead],
              listener,
              isSvg
            );
            newHead++;
          }
          oldHead++;
        } else {
          if (oldKey === newKey) {
            patch(
              node,
              oldVKid.node,
              oldVKid,
              newVKids[newHead],
              listener,
              isSvg
            );
            newKeyed[newKey] = true;
            oldHead++;
          } else {
            if ((tmpVKid = keyed[newKey]) != null) {
              patch(
                node,
                node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),
                tmpVKid,
                newVKids[newHead],
                listener,
                isSvg
              );
              newKeyed[newKey] = true;
            } else {
              patch(
                node,
                oldVKid && oldVKid.node,
                null,
                newVKids[newHead],
                listener,
                isSvg
              );
            }
          }
          newHead++;
        }
      }
      while (oldHead <= oldTail) {
        if (getKey(oldVKid = oldVKids[oldHead++]) == null) {
          node.removeChild(oldVKid.node);
        }
      }
      for (var i in keyed) {
        if (newKeyed[i] == null) {
          node.removeChild(keyed[i].node);
        }
      }
    }
  }
  return newVNode.node = node;
};
var propsChanged = function(a, b) {
  for (var k in a) if (a[k] !== b[k]) return true;
  for (var k in b) if (a[k] !== b[k]) return true;
};
var getTextVNode = function(node) {
  return typeof node === "object" ? node : createTextVNode(node);
};
var getVNode = function(newVNode, oldVNode) {
  return newVNode.type === LAZY_NODE ? ((!oldVNode || !oldVNode.lazy || propsChanged(oldVNode.lazy, newVNode.lazy)) && ((oldVNode = getTextVNode(newVNode.lazy.view(newVNode.lazy))).lazy = newVNode.lazy), oldVNode) : newVNode;
};
var createVNode = function(name, props, children, node, key, type) {
  return {
    name,
    props,
    children,
    node,
    type,
    key
  };
};
var createTextVNode = function(value, node) {
  return createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, void 0, TEXT_NODE);
};
var recycleNode = function(node) {
  return node.nodeType === TEXT_NODE ? createTextVNode(node.nodeValue, node) : createVNode(
    node.nodeName.toLowerCase(),
    EMPTY_OBJ,
    map.call(node.childNodes, recycleNode),
    node,
    void 0,
    RECYCLED_NODE
  );
};
var h = function(name, props) {
  for (var vdom, rest = [], children = [], i = arguments.length; i-- > 2; ) {
    rest.push(arguments[i]);
  }
  while (rest.length > 0) {
    if (isArray(vdom = rest.pop())) {
      for (var i = vdom.length; i-- > 0; ) {
        rest.push(vdom[i]);
      }
    } else if (vdom === false || vdom === true || vdom == null) ;
    else {
      children.push(getTextVNode(vdom));
    }
  }
  props = props || EMPTY_OBJ;
  return typeof name === "function" ? name(props, children) : createVNode(name, props, children, void 0, props.key);
};
var app = function(props) {
  var state = {};
  var lock = false;
  var view = props.view;
  var node = props.node;
  var vdom = node && recycleNode(node);
  var subscriptions = props.subscriptions;
  var subs = [];
  var onEnd = props.onEnd;
  var listener = function(event) {
    dispatch(this.actions[event.type], event);
  };
  var setState = function(newState) {
    if (state !== newState) {
      state = newState;
      if (subscriptions) {
        subs = patchSubs(subs, batch([subscriptions(state)]), dispatch);
      }
      if (view && !lock) defer(render, lock = true);
    }
    return state;
  };
  var dispatch = (props.middleware || function(obj) {
    return obj;
  })(function(action, props2) {
    return typeof action === "function" ? dispatch(action(state, props2)) : isArray(action) ? typeof action[0] === "function" || isArray(action[0]) ? dispatch(
      action[0],
      typeof action[1] === "function" ? action[1](props2) : action[1]
    ) : (batch(action.slice(1)).map(function(fx) {
      fx && fx[0](dispatch, fx[1]);
    }, setState(action[0])), state) : setState(action);
  });
  var render = function() {
    lock = false;
    node = patch(
      node.parentNode,
      node,
      vdom,
      vdom = getTextVNode(view(state)),
      listener
    );
    onEnd();
  };
  dispatch(props.init);
};
var timeFx = function(fx) {
  return function(action, props) {
    return [
      fx,
      {
        action,
        delay: props.delay
      }
    ];
  };
};
var interval = timeFx(
  function(dispatch, props) {
    var id = setInterval(
      function() {
        dispatch(
          props.action,
          Date.now()
        );
      },
      props.delay
    );
    return function() {
      clearInterval(id);
    };
  }
);
const httpEffect = (dispatch, props) => {
  if (!props) {
    return;
  }
  const output = {
    ok: false,
    url: props.url,
    authenticationFail: false,
    parseType: props.parseType ?? "json"
  };
  http(
    dispatch,
    props,
    output
  );
};
const http = (dispatch, props, output, nextDelegate = null) => {
  fetch(
    props.url,
    props.options
  ).then(function(response) {
    if (response) {
      output.ok = response.ok === true;
      output.status = response.status;
      output.type = response.type;
      output.redirected = response.redirected;
      if (response.headers) {
        output.callID = response.headers.get("CallID");
        output.contentType = response.headers.get("content-type");
        if (output.contentType && output.contentType.indexOf("application/json") !== -1) {
          output.parseType = "json";
        }
      }
      if (response.status === 401) {
        output.authenticationFail = true;
        dispatch(
          props.onAuthenticationFailAction,
          output
        );
        return;
      }
    } else {
      output.responseNull = true;
    }
    return response;
  }).then(function(response) {
    try {
      return response.text();
    } catch (error) {
      output.error += `Error thrown with response.text()
`;
    }
  }).then(function(result) {
    output.textData = result;
    if (result && output.parseType === "json") {
      try {
        output.jsonData = JSON.parse(result);
      } catch (err) {
        output.error += `Error thrown parsing response.text() as json
`;
      }
    }
    if (!output.ok) {
      throw result;
    }
    dispatch(
      props.action,
      output
    );
  }).then(function() {
    if (nextDelegate) {
      return nextDelegate.delegate(
        nextDelegate.dispatch,
        nextDelegate.block,
        nextDelegate.nextHttpCall,
        nextDelegate.index
      );
    }
  }).catch(function(error) {
    output.error += error;
    dispatch(
      props.error,
      output
    );
  });
};
const gHttp = (props) => {
  return [
    httpEffect,
    props
  ];
};
const Keys = {
  startUrl: "startUrl"
};
class HttpEffect {
  constructor(name, url, parseType, actionDelegate) {
    __publicField(this, "name");
    __publicField(this, "url");
    __publicField(this, "parseType");
    __publicField(this, "actionDelegate");
    this.name = name;
    this.url = url;
    this.parseType = parseType;
    this.actionDelegate = actionDelegate;
  }
}
const gUtilities = {
  roundUpToNearestTen: (value) => {
    const floor = Math.floor(value / 10);
    return (floor + 1) * 10;
  },
  roundDownToNearestTen: (value) => {
    const floor = Math.floor(value / 10);
    return floor * 10;
  },
  convertMmToFeetInches: (mm) => {
    const inches = mm * 0.03937;
    return gUtilities.convertInchesToFeetInches(inches);
  },
  indexOfAny: (input, chars, startIndex = 0) => {
    for (let i = startIndex; i < input.length; i++) {
      if (chars.includes(input[i]) === true) {
        return i;
      }
    }
    return -1;
  },
  getDirectory: (filePath) => {
    var matches = filePath.match(/(.*)[\/\\]/);
    if (matches && matches.length > 0) {
      return matches[1];
    }
    return "";
  },
  countCharacter: (input, character) => {
    let length = input.length;
    let count2 = 0;
    for (let i = 0; i < length; i++) {
      if (input[i] === character) {
        count2++;
      }
    }
    return count2;
  },
  convertInchesToFeetInches: (inches) => {
    const feet = Math.floor(inches / 12);
    const inchesReamining = inches % 12;
    const inchesReaminingRounded = Math.round(inchesReamining * 10) / 10;
    let result = "";
    if (feet > 0) {
      result = `${feet}' `;
    }
    if (inchesReaminingRounded > 0) {
      result = `${result}${inchesReaminingRounded}"`;
    }
    return result;
  },
  isNullOrWhiteSpace: (input) => {
    if (input === null || input === void 0) {
      return true;
    }
    input = `${input}`;
    return input.match(/^\s*$/) !== null;
  },
  checkArraysEqual: (a, b) => {
    if (a === b) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    const x = [...a];
    const y = [...b];
    x.sort();
    y.sort();
    for (let i = 0; i < x.length; i++) {
      if (x[i] !== y[i]) {
        return false;
      }
    }
    return true;
  },
  shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },
  isNumeric: (input) => {
    if (gUtilities.isNullOrWhiteSpace(input) === true) {
      return false;
    }
    return !isNaN(input);
  },
  isNegativeNumeric: (input) => {
    if (!gUtilities.isNumeric(input)) {
      return false;
    }
    return +input < 0;
  },
  hasDuplicates: (input) => {
    if (new Set(input).size !== input.length) {
      return true;
    }
    return false;
  },
  extend: (array1, array2) => {
    array2.forEach((item) => {
      array1.push(item);
    });
  },
  prettyPrintJsonFromString: (input) => {
    if (!input) {
      return "";
    }
    return gUtilities.prettyPrintJsonFromObject(JSON.parse(input));
  },
  prettyPrintJsonFromObject: (input) => {
    if (!input) {
      return "";
    }
    return JSON.stringify(
      input,
      null,
      4
      // indented 4 spaces
    );
  },
  isPositiveNumeric: (input) => {
    if (!gUtilities.isNumeric(input)) {
      return false;
    }
    return Number(input) >= 0;
  },
  getTime: () => {
    const now = new Date(Date.now());
    const time = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}::${now.getMilliseconds().toString().padStart(3, "0")}:`;
    return time;
  },
  splitByNewLine: (input) => {
    if (gUtilities.isNullOrWhiteSpace(input) === true) {
      return [];
    }
    const results = input.split(/[\r\n]+/);
    const cleaned = [];
    results.forEach((value) => {
      if (!gUtilities.isNullOrWhiteSpace(value)) {
        cleaned.push(value.trim());
      }
    });
    return cleaned;
  },
  splitByPipe: (input) => {
    if (gUtilities.isNullOrWhiteSpace(input) === true) {
      return [];
    }
    const results = input.split("|");
    const cleaned = [];
    results.forEach((value) => {
      if (!gUtilities.isNullOrWhiteSpace(value)) {
        cleaned.push(value.trim());
      }
    });
    return cleaned;
  },
  splitByNewLineAndOrder: (input) => {
    return gUtilities.splitByNewLine(input).sort();
  },
  joinByNewLine: (input) => {
    if (!input || input.length === 0) {
      return "";
    }
    return input.join("\n");
  },
  removeAllChildren: (parent) => {
    if (parent !== null) {
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    }
  },
  isOdd: (x) => {
    return x % 2 === 1;
  },
  shortPrintText: (input, maxLength = 100) => {
    if (gUtilities.isNullOrWhiteSpace(input) === true) {
      return "";
    }
    const firstNewLineIndex = gUtilities.getFirstNewLineIndex(input);
    if (firstNewLineIndex > 0 && firstNewLineIndex <= maxLength) {
      const output2 = input.substr(0, firstNewLineIndex - 1);
      return gUtilities.trimAndAddEllipsis(output2);
    }
    if (input.length <= maxLength) {
      return input;
    }
    const output = input.substr(0, maxLength);
    return gUtilities.trimAndAddEllipsis(output);
  },
  trimAndAddEllipsis: (input) => {
    let output = input.trim();
    let punctuationRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
    let spaceRegex = /\W+/g;
    let lastCharacter = output[output.length - 1];
    let lastCharacterIsPunctuation = punctuationRegex.test(lastCharacter) || spaceRegex.test(lastCharacter);
    while (lastCharacterIsPunctuation === true) {
      output = output.substr(0, output.length - 1);
      lastCharacter = output[output.length - 1];
      lastCharacterIsPunctuation = punctuationRegex.test(lastCharacter) || spaceRegex.test(lastCharacter);
    }
    return `${output}...`;
  },
  getFirstNewLineIndex: (input) => {
    let character;
    for (let i = 0; i < input.length; i++) {
      character = input[i];
      if (character === "\n" || character === "\r") {
        return i;
      }
    }
    return -1;
  },
  upperCaseFirstLetter: (input) => {
    return input.charAt(0).toUpperCase() + input.slice(1);
  },
  generateGuid: (useHypens = false) => {
    let d = (/* @__PURE__ */ new Date()).getTime();
    let d2 = performance && performance.now && performance.now() * 1e3 || 0;
    let pattern = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    if (!useHypens) {
      pattern = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx";
    }
    const guid = pattern.replace(
      /[xy]/g,
      function(c) {
        let r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : r & 3 | 8).toString(16);
      }
    );
    return guid;
  },
  checkIfChrome: () => {
    let tsWindow = window;
    let isChromium = tsWindow.chrome;
    let winNav = window.navigator;
    let vendorName = winNav.vendor;
    let isOpera = typeof tsWindow.opr !== "undefined";
    let isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    let isIOSChrome = winNav.userAgent.match("CriOS");
    if (isIOSChrome) {
      return true;
    } else if (isChromium !== null && typeof isChromium !== "undefined" && vendorName === "Google Inc." && isOpera === false && isIEedge === false) {
      return true;
    }
    return false;
  }
};
class HistoryUrl {
  constructor(url) {
    __publicField(this, "url");
    this.url = url;
  }
}
class RenderSnapShot {
  constructor(url) {
    __publicField(this, "url");
    __publicField(this, "guid", null);
    __publicField(this, "created", null);
    __publicField(this, "modified", null);
    __publicField(this, "expandedOptionIDs", []);
    __publicField(this, "expandedAncillaryIDs", []);
    this.url = url;
  }
}
const buildUrlFromRoot = (root) => {
  const urlAssembler = {
    url: `${location.origin}${location.pathname}?`
  };
  if (!root.selected) {
    return urlAssembler.url;
  }
  printSegmentEnd(
    urlAssembler,
    root
  );
  return urlAssembler.url;
};
const printSegmentEnd = (urlAssembler, fragment) => {
  var _a;
  if (!fragment) {
    return;
  }
  if ((_a = fragment.link) == null ? void 0 : _a.root) {
    let url = urlAssembler.url;
    url = `${url}~${fragment.id}`;
    urlAssembler.url = url;
    printSegmentEnd(
      urlAssembler,
      fragment.link.root
    );
  } else if (!gUtilities.isNullOrWhiteSpace(fragment.exitKey)) {
    let url = urlAssembler.url;
    url = `${url}_${fragment.id}`;
    urlAssembler.url = url;
  } else if (!fragment.link && !fragment.selected) {
    let url = urlAssembler.url;
    url = `${url}-${fragment.id}`;
    urlAssembler.url = url;
  }
  printSegmentEnd(
    urlAssembler,
    fragment.selected
  );
};
const gHistoryCode = {
  resetRaw: () => {
    window.TreeSolve.screen.autofocus = true;
    window.TreeSolve.screen.isAutofocusFirstRun = true;
  },
  pushBrowserHistoryState: (state) => {
    var _a, _b;
    if (state.renderState.isChainLoad === true) {
      return;
    }
    state.renderState.refreshUrl = false;
    if (!((_a = state.renderState.currentSection) == null ? void 0 : _a.current) || !((_b = state.renderState.displayGuide) == null ? void 0 : _b.root)) {
      return;
    }
    gHistoryCode.resetRaw();
    const location2 = window.location;
    let lastUrl;
    if (window.history.state) {
      lastUrl = window.history.state.url;
    } else {
      lastUrl = `${location2.origin}${location2.pathname}${location2.search}`;
    }
    const url = buildUrlFromRoot(state.renderState.displayGuide.root);
    if (lastUrl && url === lastUrl) {
      return;
    }
    history.pushState(
      new RenderSnapShot(url),
      "",
      url
    );
    state.stepHistory.historyChain.push(new HistoryUrl(url));
  }
};
let count = 0;
const gStateCode = {
  setDirty: (state) => {
    state.renderState.ui.raw = false;
    state.renderState.isChainLoad = false;
  },
  getFreshKeyInt: (state) => {
    const nextKey = ++state.nextKey;
    return nextKey;
  },
  getFreshKey: (state) => {
    return `${gStateCode.getFreshKeyInt(state)}`;
  },
  getGuidKey: () => {
    return gUtilities.generateGuid();
  },
  cloneState: (state) => {
    if (state.renderState.refreshUrl === true) {
      gHistoryCode.pushBrowserHistoryState(state);
    }
    let newState = { ...state };
    return newState;
  },
  AddReLoadDataEffectImmediate: (state, name, parseType, url, actionDelegate) => {
    console.log(name);
    console.log(url);
    if (count > 0) {
      return;
    }
    if (url.endsWith("imyo6C08H.html")) {
      count++;
    }
    const effect = state.repeatEffects.reLoadGetHttpImmediate.find((effect2) => {
      return effect2.name === name && effect2.url === url;
    });
    if (effect) {
      return;
    }
    const httpEffect2 = new HttpEffect(
      name,
      url,
      parseType,
      actionDelegate
    );
    state.repeatEffects.reLoadGetHttpImmediate.push(httpEffect2);
  },
  AddRunActionImmediate: (state, actionDelegate) => {
    state.repeatEffects.runActionImmediate.push(actionDelegate);
  },
  getCached_outlineNode: (state, linkID, fragmentID) => {
    if (gUtilities.isNullOrWhiteSpace(fragmentID)) {
      return null;
    }
    const key = gStateCode.getCacheKey(
      linkID,
      fragmentID
    );
    const outlineNode = state.renderState.index_outlineNodes_id[key] ?? null;
    if (!outlineNode) {
      console.log("OutlineNode was null");
    }
    return outlineNode;
  },
  cache_outlineNode: (state, linkID, outlineNode) => {
    if (!outlineNode) {
      return;
    }
    const key = gStateCode.getCacheKey(
      linkID,
      outlineNode.i
    );
    if (state.renderState.index_outlineNodes_id[key]) {
      return;
    }
    state.renderState.index_outlineNodes_id[key] = outlineNode;
  },
  getCached_chainFragment: (state, linkID, fragmentID) => {
    if (gUtilities.isNullOrWhiteSpace(fragmentID) === true) {
      return null;
    }
    const key = gStateCode.getCacheKey(
      linkID,
      fragmentID
    );
    return state.renderState.index_chainFragments_id[key] ?? null;
  },
  cache_chainFragment: (state, renderFragment) => {
    if (!renderFragment) {
      return;
    }
    const key = gStateCode.getCacheKeyFromFragment(renderFragment);
    if (gUtilities.isNullOrWhiteSpace(key) === true) {
      return;
    }
    if (state.renderState.index_chainFragments_id[key]) {
      return;
    }
    state.renderState.index_chainFragments_id[key] = renderFragment;
  },
  getCacheKeyFromFragment: (renderFragment) => {
    return gStateCode.getCacheKey(
      renderFragment.section.linkID,
      renderFragment.id
    );
  },
  getCacheKey: (linkID, fragmentID) => {
    return `${linkID}_${fragmentID}`;
  }
};
const gAuthenticationCode = {
  clearAuthentication: (state) => {
    state.user.authorised = false;
    state.user.name = "";
    state.user.sub = "";
    state.user.logoutUrl = "";
  }
};
var ActionType = /* @__PURE__ */ ((ActionType2) => {
  ActionType2["None"] = "none";
  ActionType2["FilterTopics"] = "filterTopics";
  ActionType2["GetTopic"] = "getTopic";
  ActionType2["GetTopicAndRoot"] = "getTopicAndRoot";
  ActionType2["SaveArticleScene"] = "saveArticleScene";
  ActionType2["GetRoot"] = "getRoot";
  ActionType2["GetStep"] = "getStep";
  ActionType2["GetPage"] = "getPage";
  ActionType2["GetChain"] = "getChain";
  ActionType2["GetOutline"] = "getOutline";
  ActionType2["GetFragment"] = "getFragment";
  ActionType2["GetChainFragment"] = "getChainFragment";
  return ActionType2;
})(ActionType || {});
const gAjaxHeaderCode = {
  buildHeaders: (state, callID, action) => {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-CSRF", "1");
    headers.append("SubscriptionID", state.settings.subscriptionID);
    headers.append("CallID", callID);
    headers.append("Action", action);
    headers.append("withCredentials", "true");
    return headers;
  }
};
const gAuthenticationEffects = {
  checkUserAuthenticated: (state) => {
    if (!state) {
      return;
    }
    const callID = gUtilities.generateGuid();
    let headers = gAjaxHeaderCode.buildHeaders(
      state,
      callID,
      ActionType.None
    );
    const url = `${state.settings.bffUrl}/${state.settings.userPath}?slide=false`;
    return gAuthenticatedHttp({
      url,
      options: {
        method: "GET",
        headers
      },
      response: "json",
      action: gAuthenticationActions.loadSuccessfulAuthentication,
      error: (state2, errorDetails) => {
        console.log(`{
                    "message": "Error trying to authenticate with the server",
                    "url": ${url},
                    "error Details": ${JSON.stringify(errorDetails)},
                    "stack": ${JSON.stringify(errorDetails.stack)},
                    "method": ${gAuthenticationEffects.checkUserAuthenticated.name},
                    "callID: ${callID}
                }`);
        alert(`{
                    "message": "Error trying to authenticate with the server",
                    "url": ${url},
                    "error Details": ${JSON.stringify(errorDetails)},
                    "stack": ${JSON.stringify(errorDetails.stack)},
                    "method": gAuthenticationEffects.checkUserAuthenticated.name,
                    "callID: ${callID},
                    "state": ${JSON.stringify(state2)}
                }`);
        return gStateCode.cloneState(state2);
      }
    });
  }
};
const gAuthenticationActions = {
  loadSuccessfulAuthentication: (state, response) => {
    if (!state || !response || response.parseType !== "json" || !response.jsonData) {
      return state;
    }
    const claims = response.jsonData;
    const name = claims.find(
      (claim) => claim.type === "name"
    );
    const sub = claims.find(
      (claim) => claim.type === "sub"
    );
    if (!name && !sub) {
      return state;
    }
    const logoutUrlClaim = claims.find(
      (claim) => claim.type === "bff:logout_url"
    );
    if (!logoutUrlClaim || !logoutUrlClaim.value) {
      return state;
    }
    state.user.authorised = true;
    state.user.name = name.value;
    state.user.sub = sub.value;
    state.user.logoutUrl = logoutUrlClaim.value;
    return gStateCode.cloneState(state);
  },
  checkUserLoggedIn: (state) => {
    const props = gAuthenticationActions.checkUserLoggedInProps(state);
    if (!props) {
      return state;
    }
    return [
      state,
      props
    ];
  },
  checkUserLoggedInProps: (state) => {
    state.user.raw = false;
    return gAuthenticationEffects.checkUserAuthenticated(state);
  },
  login: (state) => {
    const currentUrl = window.location.href;
    sessionStorage.setItem(
      Keys.startUrl,
      currentUrl
    );
    const url = `${state.settings.bffUrl}/${state.settings.defaultLoginPath}?returnUrl=/`;
    window.location.assign(url);
    return state;
  },
  clearAuthentication: (state) => {
    gAuthenticationCode.clearAuthentication(state);
    return gStateCode.cloneState(state);
  },
  clearAuthenticationAndShowLogin: (state) => {
    gAuthenticationCode.clearAuthentication(state);
    return gAuthenticationActions.login(state);
  },
  logout: (state) => {
    window.location.assign(state.user.logoutUrl);
    return state;
  }
};
function gAuthenticatedHttp(props) {
  const httpAuthenticatedProperties = props;
  httpAuthenticatedProperties.onAuthenticationFailAction = gAuthenticationActions.clearAuthenticationAndShowLogin;
  return gHttp(httpAuthenticatedProperties);
}
const runActionInner = (dispatch, props) => {
  dispatch(
    props.action
  );
};
const runAction = (state, queuedEffects) => {
  const effects = [];
  queuedEffects.forEach((action) => {
    const props = {
      action,
      error: (_state, errorDetails) => {
        console.log(`{
                    "message": "Error running action in repeatActions",
                    "error Details": ${JSON.stringify(errorDetails)},
                    "stack": ${JSON.stringify(errorDetails.stack)},
                    "method": ${runAction},
                }`);
        alert("Error running action in repeatActions");
      }
    };
    effects.push([
      runActionInner,
      props
    ]);
  });
  return [
    gStateCode.cloneState(state),
    ...effects
  ];
};
const sendRequest = (state, queuedEffects) => {
  const effects = [];
  queuedEffects.forEach((httpEffect2) => {
    getEffect(
      state,
      httpEffect2,
      effects
    );
  });
  return [
    gStateCode.cloneState(state),
    ...effects
  ];
};
const getEffect = (_state, httpEffect2, effects) => {
  const url = httpEffect2.url;
  const callID = gUtilities.generateGuid();
  let headers = new Headers();
  headers.append("Accept", "*/*");
  const options = {
    method: "GET",
    headers
  };
  const effect = gAuthenticatedHttp({
    url,
    parseType: httpEffect2.parseType,
    options,
    response: "json",
    action: httpEffect2.actionDelegate,
    error: (_state2, errorDetails) => {
      console.log(`{
                    "message": "Error posting gRepeatActions data to the server",
                    "url": ${url},
                    "error Details": ${JSON.stringify(errorDetails)},
                    "stack": ${JSON.stringify(errorDetails.stack)},
                    "method": ${getEffect.name},
                    "callID: ${callID}
                }`);
      alert("Error posting gRepeatActions data to the server");
    }
  });
  effects.push(effect);
};
const gRepeatActions = {
  httpSilentReLoadImmediate: (state) => {
    if (!state) {
      return state;
    }
    if (state.repeatEffects.reLoadGetHttpImmediate.length === 0) {
      return state;
    }
    const reLoadHttpEffectsImmediate = state.repeatEffects.reLoadGetHttpImmediate;
    state.repeatEffects.reLoadGetHttpImmediate = [];
    return sendRequest(
      state,
      reLoadHttpEffectsImmediate
    );
  },
  silentRunActionImmediate: (state) => {
    if (!state) {
      return state;
    }
    if (state.repeatEffects.runActionImmediate.length === 0) {
      return state;
    }
    const runActionImmediate = state.repeatEffects.runActionImmediate;
    state.repeatEffects.runActionImmediate = [];
    return runAction(
      state,
      runActionImmediate
    );
  }
};
const repeatSubscriptions = {
  buildRepeatSubscriptions: (state) => {
    const buildReLoadDataImmediate = () => {
      if (state.repeatEffects.reLoadGetHttpImmediate.length > 0) {
        return interval(
          gRepeatActions.httpSilentReLoadImmediate,
          { delay: 10 }
        );
      }
    };
    const buildRunActionsImmediate = () => {
      if (state.repeatEffects.runActionImmediate.length > 0) {
        return interval(
          gRepeatActions.silentRunActionImmediate,
          { delay: 10 }
        );
      }
    };
    const repeatSubscription = [
      buildReLoadDataImmediate(),
      buildRunActionsImmediate()
    ];
    return repeatSubscription;
  }
};
const initSubscriptions = (state) => {
  if (!state) {
    return;
  }
  const subscriptions = [
    ...repeatSubscriptions.buildRepeatSubscriptions(state)
  ];
  return subscriptions;
};
/*! @vimeo/player v2.30.3 | (c) 2026 Vimeo | MIT License | https://github.com/vimeo/player.js */
const isNode = typeof global !== "undefined" && {}.toString.call(global) === "[object global]";
const isBun = typeof Bun !== "undefined";
const isDeno = typeof Deno !== "undefined";
const isCloudflareWorker = typeof WebSocketPair === "function" && typeof (caches == null ? void 0 : caches.default) !== "undefined";
const isServerRuntime = isNode || isBun || isDeno || isCloudflareWorker;
function getMethodName(prop, type) {
  if (prop.indexOf(type.toLowerCase()) === 0) {
    return prop;
  }
  return `${type.toLowerCase()}${prop.substr(0, 1).toUpperCase()}${prop.substr(1)}`;
}
function isDomElement(element) {
  return Boolean(element && element.nodeType === 1 && "nodeName" in element && element.ownerDocument && element.ownerDocument.defaultView);
}
function isInteger(value) {
  return !isNaN(parseFloat(value)) && isFinite(value) && Math.floor(value) == value;
}
function isVimeoUrl(url) {
  return /^(https?:)?\/\/((((player|www)\.)?vimeo\.com)|((player\.)?[a-zA-Z0-9-]+\.(videoji\.(hk|cn)|vimeo\.work)))(?=$|\/)/.test(url);
}
function isVimeoEmbed(url) {
  const expr = /^https:\/\/player\.((vimeo\.com)|([a-zA-Z0-9-]+\.(videoji\.(hk|cn)|vimeo\.work)))\/video\/\d+/;
  return expr.test(url);
}
function getOembedDomain(url) {
  const match = (url || "").match(/^(?:https?:)?(?:\/\/)?([^/?]+)/);
  const domain = (match && match[1] || "").replace("player.", "");
  const customDomains = [".videoji.hk", ".vimeo.work", ".videoji.cn"];
  for (const customDomain of customDomains) {
    if (domain.endsWith(customDomain)) {
      return domain;
    }
  }
  return "vimeo.com";
}
function getVimeoUrl() {
  let oEmbedParameters2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  const id = oEmbedParameters2.id;
  const url = oEmbedParameters2.url;
  const idOrUrl = id || url;
  if (!idOrUrl) {
    throw new Error("An id or url must be passed, either in an options object or as a data-vimeo-id or data-vimeo-url attribute.");
  }
  if (isInteger(idOrUrl)) {
    return `https://vimeo.com/${idOrUrl}`;
  }
  if (isVimeoUrl(idOrUrl)) {
    return idOrUrl.replace("http:", "https:");
  }
  if (id) {
    throw new TypeError(`“${id}” is not a valid video id.`);
  }
  throw new TypeError(`“${idOrUrl}” is not a vimeo.com url.`);
}
const subscribe = function(target, eventName, callback) {
  let onName = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "addEventListener";
  let offName = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : "removeEventListener";
  const eventNames = typeof eventName === "string" ? [eventName] : eventName;
  eventNames.forEach((evName) => {
    target[onName](evName, callback);
  });
  return {
    cancel: () => eventNames.forEach((evName) => target[offName](evName, callback))
  };
};
function findIframeBySourceWindow(sourceWindow) {
  let doc = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : document;
  if (!sourceWindow || !doc || typeof doc.querySelectorAll !== "function") {
    return null;
  }
  const iframes = doc.querySelectorAll("iframe");
  for (let i = 0; i < iframes.length; i++) {
    if (iframes[i] && iframes[i].contentWindow === sourceWindow) {
      return iframes[i];
    }
  }
  return null;
}
const arrayIndexOfSupport = typeof Array.prototype.indexOf !== "undefined";
const postMessageSupport = typeof window !== "undefined" && typeof window.postMessage !== "undefined";
if (!isServerRuntime && (!arrayIndexOfSupport || !postMessageSupport)) {
  throw new Error("Sorry, the Vimeo Player API is not available in this browser.");
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function createCommonjsModule(fn, module) {
  return module = { exports: {} }, fn(module, module.exports), module.exports;
}
/*!
 * weakmap-polyfill v2.0.4 - ECMAScript6 WeakMap polyfill
 * https://github.com/polygonplanet/weakmap-polyfill
 * Copyright (c) 2015-2021 polygonplanet <polygon.planet.aqua@gmail.com>
 * @license MIT
 */
(function(self2) {
  if (self2.WeakMap) {
    return;
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasDefine = Object.defineProperty && (function() {
    try {
      return Object.defineProperty({}, "x", {
        value: 1
      }).x === 1;
    } catch (e) {
    }
  })();
  var defineProperty = function(object, name, value) {
    if (hasDefine) {
      Object.defineProperty(object, name, {
        configurable: true,
        writable: true,
        value
      });
    } else {
      object[name] = value;
    }
  };
  self2.WeakMap = (function() {
    function WeakMap2() {
      if (this === void 0) {
        throw new TypeError("Constructor WeakMap requires 'new'");
      }
      defineProperty(this, "_id", genId("_WeakMap"));
      if (arguments.length > 0) {
        throw new TypeError("WeakMap iterable is not supported");
      }
    }
    defineProperty(WeakMap2.prototype, "delete", function(key) {
      checkInstance(this, "delete");
      if (!isObject(key)) {
        return false;
      }
      var entry = key[this._id];
      if (entry && entry[0] === key) {
        delete key[this._id];
        return true;
      }
      return false;
    });
    defineProperty(WeakMap2.prototype, "get", function(key) {
      checkInstance(this, "get");
      if (!isObject(key)) {
        return void 0;
      }
      var entry = key[this._id];
      if (entry && entry[0] === key) {
        return entry[1];
      }
      return void 0;
    });
    defineProperty(WeakMap2.prototype, "has", function(key) {
      checkInstance(this, "has");
      if (!isObject(key)) {
        return false;
      }
      var entry = key[this._id];
      if (entry && entry[0] === key) {
        return true;
      }
      return false;
    });
    defineProperty(WeakMap2.prototype, "set", function(key, value) {
      checkInstance(this, "set");
      if (!isObject(key)) {
        throw new TypeError("Invalid value used as weak map key");
      }
      var entry = key[this._id];
      if (entry && entry[0] === key) {
        entry[1] = value;
        return this;
      }
      defineProperty(key, this._id, [key, value]);
      return this;
    });
    function checkInstance(x, methodName) {
      if (!isObject(x) || !hasOwnProperty.call(x, "_id")) {
        throw new TypeError(methodName + " method called on incompatible receiver " + typeof x);
      }
    }
    function genId(prefix) {
      return prefix + "_" + rand() + "." + rand();
    }
    function rand() {
      return Math.random().toString().substring(2);
    }
    defineProperty(WeakMap2, "_polyfill", true);
    return WeakMap2;
  })();
  function isObject(x) {
    return Object(x) === x;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : commonjsGlobal);
var npo_src = createCommonjsModule(function(module) {
  /*! Native Promise Only
      v0.8.1 (c) Kyle Simpson
      MIT License: http://getify.mit-license.org
  */
  (function UMD(name, context, definition) {
    context[name] = context[name] || definition();
    if (module.exports) {
      module.exports = context[name];
    }
  })("Promise", typeof commonjsGlobal != "undefined" ? commonjsGlobal : commonjsGlobal, function DEF() {
    var builtInProp, cycle, scheduling_queue, ToString = Object.prototype.toString, timer = typeof setImmediate != "undefined" ? function timer2(fn) {
      return setImmediate(fn);
    } : setTimeout;
    try {
      Object.defineProperty({}, "x", {});
      builtInProp = function builtInProp2(obj, name, val, config) {
        return Object.defineProperty(obj, name, {
          value: val,
          writable: true,
          configurable: config !== false
        });
      };
    } catch (err) {
      builtInProp = function builtInProp2(obj, name, val) {
        obj[name] = val;
        return obj;
      };
    }
    scheduling_queue = /* @__PURE__ */ (function Queue() {
      var first, last, item;
      function Item(fn, self2) {
        this.fn = fn;
        this.self = self2;
        this.next = void 0;
      }
      return {
        add: function add(fn, self2) {
          item = new Item(fn, self2);
          if (last) {
            last.next = item;
          } else {
            first = item;
          }
          last = item;
          item = void 0;
        },
        drain: function drain() {
          var f = first;
          first = last = cycle = void 0;
          while (f) {
            f.fn.call(f.self);
            f = f.next;
          }
        }
      };
    })();
    function schedule(fn, self2) {
      scheduling_queue.add(fn, self2);
      if (!cycle) {
        cycle = timer(scheduling_queue.drain);
      }
    }
    function isThenable(o) {
      var _then, o_type = typeof o;
      if (o != null && (o_type == "object" || o_type == "function")) {
        _then = o.then;
      }
      return typeof _then == "function" ? _then : false;
    }
    function notify() {
      for (var i = 0; i < this.chain.length; i++) {
        notifyIsolated(this, this.state === 1 ? this.chain[i].success : this.chain[i].failure, this.chain[i]);
      }
      this.chain.length = 0;
    }
    function notifyIsolated(self2, cb, chain) {
      var ret, _then;
      try {
        if (cb === false) {
          chain.reject(self2.msg);
        } else {
          if (cb === true) {
            ret = self2.msg;
          } else {
            ret = cb.call(void 0, self2.msg);
          }
          if (ret === chain.promise) {
            chain.reject(TypeError("Promise-chain cycle"));
          } else if (_then = isThenable(ret)) {
            _then.call(ret, chain.resolve, chain.reject);
          } else {
            chain.resolve(ret);
          }
        }
      } catch (err) {
        chain.reject(err);
      }
    }
    function resolve(msg) {
      var _then, self2 = this;
      if (self2.triggered) {
        return;
      }
      self2.triggered = true;
      if (self2.def) {
        self2 = self2.def;
      }
      try {
        if (_then = isThenable(msg)) {
          schedule(function() {
            var def_wrapper = new MakeDefWrapper(self2);
            try {
              _then.call(msg, function $resolve$() {
                resolve.apply(def_wrapper, arguments);
              }, function $reject$() {
                reject.apply(def_wrapper, arguments);
              });
            } catch (err) {
              reject.call(def_wrapper, err);
            }
          });
        } else {
          self2.msg = msg;
          self2.state = 1;
          if (self2.chain.length > 0) {
            schedule(notify, self2);
          }
        }
      } catch (err) {
        reject.call(new MakeDefWrapper(self2), err);
      }
    }
    function reject(msg) {
      var self2 = this;
      if (self2.triggered) {
        return;
      }
      self2.triggered = true;
      if (self2.def) {
        self2 = self2.def;
      }
      self2.msg = msg;
      self2.state = 2;
      if (self2.chain.length > 0) {
        schedule(notify, self2);
      }
    }
    function iteratePromises(Constructor, arr, resolver, rejecter) {
      for (var idx = 0; idx < arr.length; idx++) {
        (function IIFE(idx2) {
          Constructor.resolve(arr[idx2]).then(function $resolver$(msg) {
            resolver(idx2, msg);
          }, rejecter);
        })(idx);
      }
    }
    function MakeDefWrapper(self2) {
      this.def = self2;
      this.triggered = false;
    }
    function MakeDef(self2) {
      this.promise = self2;
      this.state = 0;
      this.triggered = false;
      this.chain = [];
      this.msg = void 0;
    }
    function Promise2(executor) {
      if (typeof executor != "function") {
        throw TypeError("Not a function");
      }
      if (this.__NPO__ !== 0) {
        throw TypeError("Not a promise");
      }
      this.__NPO__ = 1;
      var def = new MakeDef(this);
      this["then"] = function then(success, failure) {
        var o = {
          success: typeof success == "function" ? success : true,
          failure: typeof failure == "function" ? failure : false
        };
        o.promise = new this.constructor(function extractChain(resolve2, reject2) {
          if (typeof resolve2 != "function" || typeof reject2 != "function") {
            throw TypeError("Not a function");
          }
          o.resolve = resolve2;
          o.reject = reject2;
        });
        def.chain.push(o);
        if (def.state !== 0) {
          schedule(notify, def);
        }
        return o.promise;
      };
      this["catch"] = function $catch$(failure) {
        return this.then(void 0, failure);
      };
      try {
        executor.call(void 0, function publicResolve(msg) {
          resolve.call(def, msg);
        }, function publicReject(msg) {
          reject.call(def, msg);
        });
      } catch (err) {
        reject.call(def, err);
      }
    }
    var PromisePrototype = builtInProp(
      {},
      "constructor",
      Promise2,
      /*configurable=*/
      false
    );
    Promise2.prototype = PromisePrototype;
    builtInProp(
      PromisePrototype,
      "__NPO__",
      0,
      /*configurable=*/
      false
    );
    builtInProp(Promise2, "resolve", function Promise$resolve(msg) {
      var Constructor = this;
      if (msg && typeof msg == "object" && msg.__NPO__ === 1) {
        return msg;
      }
      return new Constructor(function executor(resolve2, reject2) {
        if (typeof resolve2 != "function" || typeof reject2 != "function") {
          throw TypeError("Not a function");
        }
        resolve2(msg);
      });
    });
    builtInProp(Promise2, "reject", function Promise$reject(msg) {
      return new this(function executor(resolve2, reject2) {
        if (typeof resolve2 != "function" || typeof reject2 != "function") {
          throw TypeError("Not a function");
        }
        reject2(msg);
      });
    });
    builtInProp(Promise2, "all", function Promise$all(arr) {
      var Constructor = this;
      if (ToString.call(arr) != "[object Array]") {
        return Constructor.reject(TypeError("Not an array"));
      }
      if (arr.length === 0) {
        return Constructor.resolve([]);
      }
      return new Constructor(function executor(resolve2, reject2) {
        if (typeof resolve2 != "function" || typeof reject2 != "function") {
          throw TypeError("Not a function");
        }
        var len = arr.length, msgs = Array(len), count2 = 0;
        iteratePromises(Constructor, arr, function resolver(idx, msg) {
          msgs[idx] = msg;
          if (++count2 === len) {
            resolve2(msgs);
          }
        }, reject2);
      });
    });
    builtInProp(Promise2, "race", function Promise$race(arr) {
      var Constructor = this;
      if (ToString.call(arr) != "[object Array]") {
        return Constructor.reject(TypeError("Not an array"));
      }
      return new Constructor(function executor(resolve2, reject2) {
        if (typeof resolve2 != "function" || typeof reject2 != "function") {
          throw TypeError("Not a function");
        }
        iteratePromises(Constructor, arr, function resolver(idx, msg) {
          resolve2(msg);
        }, reject2);
      });
    });
    return Promise2;
  });
});
const callbackMap = /* @__PURE__ */ new WeakMap();
function storeCallback(player, name, callback) {
  const playerCallbacks = callbackMap.get(player.element) || {};
  if (!(name in playerCallbacks)) {
    playerCallbacks[name] = [];
  }
  playerCallbacks[name].push(callback);
  callbackMap.set(player.element, playerCallbacks);
}
function getCallbacks(player, name) {
  const playerCallbacks = callbackMap.get(player.element) || {};
  return playerCallbacks[name] || [];
}
function removeCallback(player, name, callback) {
  const playerCallbacks = callbackMap.get(player.element) || {};
  if (!playerCallbacks[name]) {
    return true;
  }
  if (!callback) {
    playerCallbacks[name] = [];
    callbackMap.set(player.element, playerCallbacks);
    return true;
  }
  const index = playerCallbacks[name].indexOf(callback);
  if (index !== -1) {
    playerCallbacks[name].splice(index, 1);
  }
  callbackMap.set(player.element, playerCallbacks);
  return playerCallbacks[name] && playerCallbacks[name].length === 0;
}
function shiftCallbacks(player, name) {
  const playerCallbacks = getCallbacks(player, name);
  if (playerCallbacks.length < 1) {
    return false;
  }
  const callback = playerCallbacks.shift();
  removeCallback(player, name, callback);
  return callback;
}
function swapCallbacks(oldElement, newElement) {
  const playerCallbacks = callbackMap.get(oldElement);
  callbackMap.set(newElement, playerCallbacks);
  callbackMap.delete(oldElement);
}
function parseMessageData(data) {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.warn(error);
      return {};
    }
  }
  return data;
}
function postMessage(player, method, params) {
  if (!player.element.contentWindow || !player.element.contentWindow.postMessage) {
    return;
  }
  let message = {
    method
  };
  if (params !== void 0) {
    message.value = params;
  }
  const ieVersion = parseFloat(navigator.userAgent.toLowerCase().replace(/^.*msie (\d+).*$/, "$1"));
  if (ieVersion >= 8 && ieVersion < 10) {
    message = JSON.stringify(message);
  }
  player.element.contentWindow.postMessage(message, player.origin);
}
function processData(player, data) {
  data = parseMessageData(data);
  let callbacks = [];
  let param;
  if (data.event) {
    if (data.event === "error") {
      const promises = getCallbacks(player, data.data.method);
      promises.forEach((promise) => {
        const error = new Error(data.data.message);
        error.name = data.data.name;
        promise.reject(error);
        removeCallback(player, data.data.method, promise);
      });
    }
    callbacks = getCallbacks(player, `event:${data.event}`);
    param = data.data;
  } else if (data.method) {
    const callback = shiftCallbacks(player, data.method);
    if (callback) {
      callbacks.push(callback);
      param = data.value;
    }
  }
  callbacks.forEach((callback) => {
    try {
      if (typeof callback === "function") {
        callback.call(player, param);
        return;
      }
      callback.resolve(param);
    } catch (e) {
    }
  });
}
const oEmbedParameters = ["airplay", "audio_tracks", "audiotrack", "autopause", "autoplay", "background", "byline", "cc", "chapter_id", "chapters", "chromecast", "color", "colors", "controls", "dnt", "end_time", "fullscreen", "height", "id", "initial_quality", "interactive_params", "keyboard", "loop", "maxheight", "max_quality", "maxwidth", "min_quality", "muted", "play_button_position", "playsinline", "portrait", "preload", "progress_bar", "quality", "quality_selector", "responsive", "skipping_forward", "speed", "start_time", "texttrack", "thumbnail_id", "title", "transcript", "transparent", "unmute_button", "url", "vimeo_logo", "volume", "watch_full_video", "width"];
function getOEmbedParameters(element) {
  let defaults = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  return oEmbedParameters.reduce((params, param) => {
    const value = element.getAttribute(`data-vimeo-${param}`);
    if (value || value === "") {
      params[param] = value === "" ? 1 : value;
    }
    return params;
  }, defaults);
}
function createEmbed(_ref, element) {
  let {
    html
  } = _ref;
  if (!element) {
    throw new TypeError("An element must be provided");
  }
  if (element.getAttribute("data-vimeo-initialized") !== null) {
    return element.querySelector("iframe");
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  element.appendChild(div.firstChild);
  element.setAttribute("data-vimeo-initialized", "true");
  return element.querySelector("iframe");
}
function getOEmbedData(videoUrl) {
  let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  let element = arguments.length > 2 ? arguments[2] : void 0;
  return new Promise((resolve, reject) => {
    if (!isVimeoUrl(videoUrl)) {
      throw new TypeError(`“${videoUrl}” is not a vimeo.com url.`);
    }
    const domain = getOembedDomain(videoUrl);
    let url = `https://${domain}/api/oembed.json?url=${encodeURIComponent(videoUrl)}`;
    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        url += `&${param}=${encodeURIComponent(params[param])}`;
      }
    }
    const xhr = "XDomainRequest" in window ? new XDomainRequest() : new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function() {
      if (xhr.status === 404) {
        reject(new Error(`“${videoUrl}” was not found.`));
        return;
      }
      if (xhr.status === 403) {
        reject(new Error(`“${videoUrl}” is not embeddable.`));
        return;
      }
      try {
        const json = JSON.parse(xhr.responseText);
        if (json.domain_status_code === 403) {
          createEmbed(json, element);
          reject(new Error(`“${videoUrl}” is not embeddable.`));
          return;
        }
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    xhr.onerror = function() {
      const status = xhr.status ? ` (${xhr.status})` : "";
      reject(new Error(`There was an error fetching the embed code from Vimeo${status}.`));
    };
    xhr.send();
  });
}
function initializeEmbeds() {
  let parent = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document;
  const elements = [].slice.call(parent.querySelectorAll("[data-vimeo-id], [data-vimeo-url]"));
  const handleError = (error) => {
    if ("console" in window && console.error) {
      console.error(`There was an error creating an embed: ${error}`);
    }
  };
  elements.forEach((element) => {
    try {
      if (element.getAttribute("data-vimeo-defer") !== null) {
        return;
      }
      const params = getOEmbedParameters(element);
      const url = getVimeoUrl(params);
      getOEmbedData(url, params, element).then((data) => {
        return createEmbed(data, element);
      }).catch(handleError);
    } catch (error) {
      handleError(error);
    }
  });
}
function resizeEmbeds() {
  let parent = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document;
  if (window.VimeoPlayerResizeEmbeds_) {
    return;
  }
  window.VimeoPlayerResizeEmbeds_ = true;
  const onMessage = (event) => {
    if (!isVimeoUrl(event.origin)) {
      return;
    }
    if (!event.data || event.data.event !== "spacechange") {
      return;
    }
    const senderIFrame = event.source ? findIframeBySourceWindow(event.source, parent) : null;
    if (senderIFrame) {
      const space = senderIFrame.parentElement;
      space.style.paddingBottom = `${event.data.data[0].bottom}px`;
    }
  };
  window.addEventListener("message", onMessage);
}
function initAppendVideoMetadata() {
  let parent = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document;
  if (window.VimeoSeoMetadataAppended) {
    return;
  }
  window.VimeoSeoMetadataAppended = true;
  const onMessage = (event) => {
    if (!isVimeoUrl(event.origin)) {
      return;
    }
    const data = parseMessageData(event.data);
    if (!data || data.event !== "ready") {
      return;
    }
    const senderIFrame = event.source ? findIframeBySourceWindow(event.source, parent) : null;
    if (senderIFrame && isVimeoEmbed(senderIFrame.src)) {
      const player = new Player(senderIFrame);
      player.callMethod("appendVideoMetadata", window.location.href);
    }
  };
  window.addEventListener("message", onMessage);
}
function checkUrlTimeParam() {
  let parent = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document;
  if (window.VimeoCheckedUrlTimeParam) {
    return;
  }
  window.VimeoCheckedUrlTimeParam = true;
  const handleError = (error) => {
    if ("console" in window && console.error) {
      console.error(`There was an error getting video Id: ${error}`);
    }
  };
  const onMessage = (event) => {
    if (!isVimeoUrl(event.origin)) {
      return;
    }
    const data = parseMessageData(event.data);
    if (!data || data.event !== "ready") {
      return;
    }
    const senderIFrame = event.source ? findIframeBySourceWindow(event.source, parent) : null;
    if (senderIFrame && isVimeoEmbed(senderIFrame.src)) {
      const player = new Player(senderIFrame);
      player.getVideoId().then((videoId) => {
        const matches = new RegExp(`[?&]vimeo_t_${videoId}=([^&#]*)`).exec(window.location.href);
        if (matches && matches[1]) {
          const sec = decodeURI(matches[1]);
          player.setCurrentTime(sec);
        }
        return;
      }).catch(handleError);
    }
  };
  window.addEventListener("message", onMessage);
}
function updateDRMEmbeds() {
  if (window.VimeoDRMEmbedsUpdated) {
    return;
  }
  window.VimeoDRMEmbedsUpdated = true;
  const onMessage = (event) => {
    if (!isVimeoUrl(event.origin)) {
      return;
    }
    const data = parseMessageData(event.data);
    if (!data || data.event !== "drminitfailed") {
      return;
    }
    const senderIFrame = event.source ? findIframeBySourceWindow(event.source) : null;
    if (!senderIFrame) {
      return;
    }
    const currentAllow = senderIFrame.getAttribute("allow") || "";
    const allowSupportsDRM = currentAllow.includes("encrypted-media");
    if (!allowSupportsDRM) {
      senderIFrame.setAttribute("allow", `${currentAllow}; encrypted-media`);
      const currentUrl = new URL(senderIFrame.getAttribute("src"));
      currentUrl.searchParams.set("forcereload", "drm");
      senderIFrame.setAttribute("src", currentUrl.toString());
      return;
    }
  };
  window.addEventListener("message", onMessage);
}
function initializeScreenfull() {
  const fn = (function() {
    let val;
    const fnMap = [
      ["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"],
      // New WebKit
      ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"],
      // Old WebKit
      ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"],
      ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"],
      ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]
    ];
    let i = 0;
    const l = fnMap.length;
    const ret = {};
    for (; i < l; i++) {
      val = fnMap[i];
      if (val && val[1] in document) {
        for (i = 0; i < val.length; i++) {
          ret[fnMap[0][i]] = val[i];
        }
        return ret;
      }
    }
    return false;
  })();
  const eventNameMap = {
    fullscreenchange: fn.fullscreenchange,
    fullscreenerror: fn.fullscreenerror
  };
  const screenfull2 = {
    request(element) {
      return new Promise((resolve, reject) => {
        const onFullScreenEntered = function() {
          screenfull2.off("fullscreenchange", onFullScreenEntered);
          resolve();
        };
        screenfull2.on("fullscreenchange", onFullScreenEntered);
        element = element || document.documentElement;
        const returnPromise = element[fn.requestFullscreen]();
        if (returnPromise instanceof Promise) {
          returnPromise.then(onFullScreenEntered).catch(reject);
        }
      });
    },
    exit() {
      return new Promise((resolve, reject) => {
        if (!screenfull2.isFullscreen) {
          resolve();
          return;
        }
        const onFullScreenExit = function() {
          screenfull2.off("fullscreenchange", onFullScreenExit);
          resolve();
        };
        screenfull2.on("fullscreenchange", onFullScreenExit);
        const returnPromise = document[fn.exitFullscreen]();
        if (returnPromise instanceof Promise) {
          returnPromise.then(onFullScreenExit).catch(reject);
        }
      });
    },
    on(event, callback) {
      const eventName = eventNameMap[event];
      if (eventName) {
        document.addEventListener(eventName, callback);
      }
    },
    off(event, callback) {
      const eventName = eventNameMap[event];
      if (eventName) {
        document.removeEventListener(eventName, callback);
      }
    }
  };
  Object.defineProperties(screenfull2, {
    isFullscreen: {
      get() {
        return Boolean(document[fn.fullscreenElement]);
      }
    },
    element: {
      enumerable: true,
      get() {
        return document[fn.fullscreenElement];
      }
    },
    isEnabled: {
      enumerable: true,
      get() {
        return Boolean(document[fn.fullscreenEnabled]);
      }
    }
  });
  return screenfull2;
}
const defaultOptions = {
  role: "viewer",
  autoPlayMuted: true,
  allowedDrift: 0.3,
  maxAllowedDrift: 1,
  minCheckInterval: 0.1,
  maxRateAdjustment: 0.2,
  maxTimeToCatchUp: 1
};
class TimingSrcConnector extends EventTarget {
  /**
   * @param {PlayerControls} player
   * @param {TimingObject} timingObject
   * @param {TimingSrcConnectorOptions} options
   * @param {Logger} logger
   */
  constructor(player, timingObject) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    let logger = arguments.length > 3 ? arguments[3] : void 0;
    super();
    __publicField(this, "logger");
    __publicField(this, "speedAdjustment", 0);
    /**
     * @param {PlayerControls} player
     * @param {number} newAdjustment
     * @return {Promise<void>}
     */
    __publicField(this, "adjustSpeed", async (player, newAdjustment) => {
      if (this.speedAdjustment === newAdjustment) {
        return;
      }
      const newPlaybackRate = await player.getPlaybackRate() - this.speedAdjustment + newAdjustment;
      this.log(`New playbackRate:  ${newPlaybackRate}`);
      await player.setPlaybackRate(newPlaybackRate);
      this.speedAdjustment = newAdjustment;
    });
    this.logger = logger;
    this.init(timingObject, player, {
      ...defaultOptions,
      ...options
    });
  }
  disconnect() {
    this.dispatchEvent(new Event("disconnect"));
  }
  /**
   * @param {TimingObject} timingObject
   * @param {PlayerControls} player
   * @param {TimingSrcConnectorOptions} options
   * @return {Promise<void>}
   */
  async init(timingObject, player, options) {
    await this.waitForTOReadyState(timingObject, "open");
    if (options.role === "viewer") {
      await this.updatePlayer(timingObject, player, options);
      const playerUpdater = subscribe(timingObject, "change", () => this.updatePlayer(timingObject, player, options));
      const positionSync = this.maintainPlaybackPosition(timingObject, player, options);
      this.addEventListener("disconnect", () => {
        positionSync.cancel();
        playerUpdater.cancel();
      });
    } else {
      await this.updateTimingObject(timingObject, player);
      const timingObjectUpdater = subscribe(player, ["seeked", "play", "pause", "ratechange"], () => this.updateTimingObject(timingObject, player), "on", "off");
      this.addEventListener("disconnect", () => timingObjectUpdater.cancel());
    }
  }
  /**
   * Sets the TimingObject's state to reflect that of the player
   *
   * @param {TimingObject} timingObject
   * @param {PlayerControls} player
   * @return {Promise<void>}
   */
  async updateTimingObject(timingObject, player) {
    const [position, isPaused, playbackRate] = await Promise.all([player.getCurrentTime(), player.getPaused(), player.getPlaybackRate()]);
    timingObject.update({
      position,
      velocity: isPaused ? 0 : playbackRate
    });
  }
  /**
   * Sets the player's timing state to reflect that of the TimingObject
   *
   * @param {TimingObject} timingObject
   * @param {PlayerControls} player
   * @param {TimingSrcConnectorOptions} options
   * @return {Promise<void>}
   */
  async updatePlayer(timingObject, player, options) {
    const {
      position,
      velocity
    } = timingObject.query();
    if (typeof position === "number") {
      player.setCurrentTime(position);
    }
    if (typeof velocity === "number") {
      if (velocity === 0) {
        if (await player.getPaused() === false) {
          player.pause();
        }
      } else if (velocity > 0) {
        if (await player.getPaused() === true) {
          await player.play().catch(async (err) => {
            if (err.name === "NotAllowedError" && options.autoPlayMuted) {
              await player.setMuted(true);
              await player.play().catch((err2) => console.error("Couldn't play the video from TimingSrcConnector. Error:", err2));
            }
          });
          this.updatePlayer(timingObject, player, options);
        }
        if (await player.getPlaybackRate() !== velocity) {
          player.setPlaybackRate(velocity);
        }
      }
    }
  }
  /**
   * Since video players do not play with 100% time precision, we need to closely monitor
   * our player to be sure it remains in sync with the TimingObject.
   *
   * If out of sync, we use the current conditions and the options provided to determine
   * whether to re-sync via setting currentTime or adjusting the playbackRate
   *
   * @param {TimingObject} timingObject
   * @param {PlayerControls} player
   * @param {TimingSrcConnectorOptions} options
   * @return {{cancel: (function(): void)}}
   */
  maintainPlaybackPosition(timingObject, player, options) {
    const {
      allowedDrift,
      maxAllowedDrift,
      minCheckInterval,
      maxRateAdjustment,
      maxTimeToCatchUp
    } = options;
    const syncInterval = Math.min(maxTimeToCatchUp, Math.max(minCheckInterval, maxAllowedDrift)) * 1e3;
    const check = async () => {
      if (timingObject.query().velocity === 0 || await player.getPaused() === true) {
        return;
      }
      const diff = timingObject.query().position - await player.getCurrentTime();
      const diffAbs = Math.abs(diff);
      this.log(`Drift: ${diff}`);
      if (diffAbs > maxAllowedDrift) {
        await this.adjustSpeed(player, 0);
        player.setCurrentTime(timingObject.query().position);
        this.log("Resync by currentTime");
      } else if (diffAbs > allowedDrift) {
        const min = diffAbs / maxTimeToCatchUp;
        const max = maxRateAdjustment;
        const adjustment = min < max ? (max - min) / 2 : max;
        await this.adjustSpeed(player, adjustment * Math.sign(diff));
        this.log("Resync by playbackRate");
      }
    };
    const interval2 = setInterval(() => check(), syncInterval);
    return {
      cancel: () => clearInterval(interval2)
    };
  }
  /**
   * @param {string} msg
   */
  log(msg) {
    var _a;
    (_a = this.logger) == null ? void 0 : _a.call(this, `TimingSrcConnector: ${msg}`);
  }
  /**
   * @param {TimingObject} timingObject
   * @param {TConnectionState} state
   * @return {Promise<void>}
   */
  waitForTOReadyState(timingObject, state) {
    return new Promise((resolve) => {
      const check = () => {
        if (timingObject.readyState === state) {
          resolve();
        } else {
          timingObject.addEventListener("readystatechange", check, {
            once: true
          });
        }
      };
      check();
    });
  }
}
const playerMap = /* @__PURE__ */ new WeakMap();
const readyMap = /* @__PURE__ */ new WeakMap();
let screenfull = {};
class Player {
  /**
   * Create a Player.
   *
   * @param {(HTMLIFrameElement|HTMLElement|string|jQuery)} element A reference to the Vimeo
   *        player iframe, and id, or a jQuery object.
   * @param {object} [options] oEmbed parameters to use when creating an embed in the element.
   * @return {Player}
   */
  constructor(element) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (window.jQuery && element instanceof jQuery) {
      if (element.length > 1 && window.console && console.warn) {
        console.warn("A jQuery object with multiple elements was passed, using the first element.");
      }
      element = element[0];
    }
    if (typeof document !== "undefined" && typeof element === "string") {
      element = document.getElementById(element);
    }
    if (!isDomElement(element)) {
      throw new TypeError("You must pass either a valid element or a valid id.");
    }
    if (element.nodeName !== "IFRAME") {
      const iframe = element.querySelector("iframe");
      if (iframe) {
        element = iframe;
      }
    }
    if (element.nodeName === "IFRAME" && !isVimeoUrl(element.getAttribute("src") || "")) {
      throw new Error("The player element passed isn’t a Vimeo embed.");
    }
    if (playerMap.has(element)) {
      return playerMap.get(element);
    }
    this._window = element.ownerDocument.defaultView;
    this.element = element;
    this.origin = "*";
    const readyPromise = new npo_src((resolve, reject) => {
      this._onMessage = (event) => {
        if (!isVimeoUrl(event.origin) || this.element.contentWindow !== event.source) {
          return;
        }
        if (this.origin === "*") {
          this.origin = event.origin;
        }
        const data = parseMessageData(event.data);
        const isError = data && data.event === "error";
        const isReadyError = isError && data.data && data.data.method === "ready";
        if (isReadyError) {
          const error = new Error(data.data.message);
          error.name = data.data.name;
          reject(error);
          return;
        }
        const isReadyEvent = data && data.event === "ready";
        const isPingResponse = data && data.method === "ping";
        if (isReadyEvent || isPingResponse) {
          this.element.setAttribute("data-ready", "true");
          resolve();
          return;
        }
        processData(this, data);
      };
      this._window.addEventListener("message", this._onMessage);
      if (this.element.nodeName !== "IFRAME") {
        const params = getOEmbedParameters(element, options);
        const url = getVimeoUrl(params);
        getOEmbedData(url, params, element).then((data) => {
          const iframe = createEmbed(data, element);
          this.element = iframe;
          this._originalElement = element;
          swapCallbacks(element, iframe);
          playerMap.set(this.element, this);
          return data;
        }).catch(reject);
      }
    });
    readyMap.set(this, readyPromise);
    playerMap.set(this.element, this);
    if (this.element.nodeName === "IFRAME") {
      postMessage(this, "ping");
    }
    if (screenfull.isEnabled) {
      const exitFullscreen = () => screenfull.exit();
      this.fullscreenchangeHandler = () => {
        if (screenfull.isFullscreen) {
          storeCallback(this, "event:exitFullscreen", exitFullscreen);
        } else {
          removeCallback(this, "event:exitFullscreen", exitFullscreen);
        }
        this.ready().then(() => {
          postMessage(this, "fullscreenchange", screenfull.isFullscreen);
        });
      };
      screenfull.on("fullscreenchange", this.fullscreenchangeHandler);
    }
    return this;
  }
  /**
   * Check to see if the URL is a Vimeo URL.
   *
   * @param {string} url The URL string.
   * @return {boolean}
   */
  static isVimeoUrl(url) {
    return isVimeoUrl(url);
  }
  /**
   * Get a promise for a method.
   *
   * @param {string} name The API method to call.
   * @param {...(string|number|object|Array)} args Arguments to send via postMessage.
   * @return {Promise}
   */
  callMethod(name) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    if (name === void 0 || name === null) {
      throw new TypeError("You must pass a method name.");
    }
    return new npo_src((resolve, reject) => {
      return this.ready().then(() => {
        storeCallback(this, name, {
          resolve,
          reject
        });
        if (args.length === 0) {
          args = {};
        } else if (args.length === 1) {
          args = args[0];
        }
        postMessage(this, name, args);
      }).catch(reject);
    });
  }
  /**
   * Get a promise for the value of a player property.
   *
   * @param {string} name The property name
   * @return {Promise}
   */
  get(name) {
    return new npo_src((resolve, reject) => {
      name = getMethodName(name, "get");
      return this.ready().then(() => {
        storeCallback(this, name, {
          resolve,
          reject
        });
        postMessage(this, name);
      }).catch(reject);
    });
  }
  /**
   * Get a promise for setting the value of a player property.
   *
   * @param {string} name The API method to call.
   * @param {mixed} value The value to set.
   * @return {Promise}
   */
  set(name, value) {
    return new npo_src((resolve, reject) => {
      name = getMethodName(name, "set");
      if (value === void 0 || value === null) {
        throw new TypeError("There must be a value to set.");
      }
      return this.ready().then(() => {
        storeCallback(this, name, {
          resolve,
          reject
        });
        postMessage(this, name, value);
      }).catch(reject);
    });
  }
  /**
   * Add an event listener for the specified event. Will call the
   * callback with a single parameter, `data`, that contains the data for
   * that event.
   *
   * @param {string} eventName The name of the event.
   * @param {function(*)} callback The function to call when the event fires.
   * @return {void}
   */
  on(eventName, callback) {
    if (!eventName) {
      throw new TypeError("You must pass an event name.");
    }
    if (!callback) {
      throw new TypeError("You must pass a callback function.");
    }
    if (typeof callback !== "function") {
      throw new TypeError("The callback must be a function.");
    }
    const callbacks = getCallbacks(this, `event:${eventName}`);
    if (callbacks.length === 0) {
      this.callMethod("addEventListener", eventName).catch(() => {
      });
    }
    storeCallback(this, `event:${eventName}`, callback);
  }
  /**
   * Remove an event listener for the specified event. Will remove all
   * listeners for that event if a `callback` isn’t passed, or only that
   * specific callback if it is passed.
   *
   * @param {string} eventName The name of the event.
   * @param {function} [callback] The specific callback to remove.
   * @return {void}
   */
  off(eventName, callback) {
    if (!eventName) {
      throw new TypeError("You must pass an event name.");
    }
    if (callback && typeof callback !== "function") {
      throw new TypeError("The callback must be a function.");
    }
    const lastCallback = removeCallback(this, `event:${eventName}`, callback);
    if (lastCallback) {
      this.callMethod("removeEventListener", eventName).catch((e) => {
      });
    }
  }
  /**
   * A promise to load a new video.
   *
   * @promise LoadVideoPromise
   * @fulfill {number} The video with this id or url successfully loaded.
   * @reject {TypeError} The id was not a number.
   */
  /**
   * Load a new video into this embed. The promise will be resolved if
   * the video is successfully loaded, or it will be rejected if it could
   * not be loaded.
   *
   * @param {number|string|object} options The id of the video, the url of the video, or an object with embed options.
   * @return {LoadVideoPromise}
   */
  loadVideo(options) {
    return this.callMethod("loadVideo", options);
  }
  /**
   * A promise to perform an action when the Player is ready.
   *
   * @todo document errors
   * @promise LoadVideoPromise
   * @fulfill {void}
   */
  /**
   * Trigger a function when the player iframe has initialized. You do not
   * need to wait for `ready` to trigger to begin adding event listeners
   * or calling other methods.
   *
   * @return {ReadyPromise}
   */
  ready() {
    const readyPromise = readyMap.get(this) || new npo_src((resolve, reject) => {
      reject(new Error("Unknown player. Probably unloaded."));
    });
    return npo_src.resolve(readyPromise);
  }
  /**
   * A promise to add a cue point to the player.
   *
   * @promise AddCuePointPromise
   * @fulfill {string} The id of the cue point to use for removeCuePoint.
   * @reject {RangeError} the time was less than 0 or greater than the
   *         video’s duration.
   * @reject {UnsupportedError} Cue points are not supported with the current
   *         player or browser.
   */
  /**
   * Add a cue point to the player.
   *
   * @param {number} time The time for the cue point.
   * @param {object} [data] Arbitrary data to be returned with the cue point.
   * @return {AddCuePointPromise}
   */
  addCuePoint(time) {
    let data = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return this.callMethod("addCuePoint", {
      time,
      data
    });
  }
  /**
   * A promise to remove a cue point from the player.
   *
   * @promise AddCuePointPromise
   * @fulfill {string} The id of the cue point that was removed.
   * @reject {InvalidCuePoint} The cue point with the specified id was not
   *         found.
   * @reject {UnsupportedError} Cue points are not supported with the current
   *         player or browser.
   */
  /**
   * Remove a cue point from the video.
   *
   * @param {string} id The id of the cue point to remove.
   * @return {RemoveCuePointPromise}
   */
  removeCuePoint(id) {
    return this.callMethod("removeCuePoint", id);
  }
  /**
   * A representation of a text track on a video.
   *
   * @typedef {Object} VimeoTextTrack
   * @property {string} language The ISO language code.
   * @property {string} kind The kind of track it is (captions or subtitles).
   * @property {string} label The human‐readable label for the track.
   */
  /**
   * A promise to enable a text track.
   *
   * @promise EnableTextTrackPromise
   * @fulfill {VimeoTextTrack} The text track that was enabled.
   * @reject {InvalidTrackLanguageError} No track was available with the
   *         specified language.
   * @reject {InvalidTrackError} No track was available with the specified
   *         language and kind.
   */
  /**
   * Enable the text track with the specified language, and optionally the
   * specified kind (captions or subtitles).
   *
   * When set via the API, the track language will not change the viewer’s
   * stored preference.
   *
   * @param {string} language The two‐letter language code.
   * @param {string} [kind] The kind of track to enable (captions or subtitles).
   * @param {boolean} [showing] Whether to enable display of closed captions for enabled text track within the player.
   * @return {EnableTextTrackPromise}
   */
  enableTextTrack(language) {
    let kind = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
    let showing = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    if (!language) {
      throw new TypeError("You must pass a language.");
    }
    return this.callMethod("enableTextTrack", {
      language,
      kind,
      showing
    });
  }
  /**
   * A promise to disable the active text track.
   *
   * @promise DisableTextTrackPromise
   * @fulfill {void} The track was disabled.
   */
  /**
   * Disable the currently-active text track.
   *
   * @return {DisableTextTrackPromise}
   */
  disableTextTrack() {
    return this.callMethod("disableTextTrack");
  }
  /** @typedef {import('../types/formats.js').VimeoAudioTrack} VimeoAudioTrack */
  /** @typedef {import('../types/formats.js').AudioLanguage} AudioLanguage */
  /** @typedef {import('../types/formats.js').AudioKind} AudioKind */
  /**
   * A promise to enable an audio track.
   *
   * @promise SelectAudioTrackPromise
   * @fulfill {VimeoAudioTrack} The audio track that was enabled.
   * @reject {NoAudioTracksError} No audio exists for the video.
   * @reject {NoAlternateAudioTracksError} No alternate audio tracks exist for the video.
   * @reject {NoMatchingAudioTrackError} No track was available with the specified
   *         language and kind.
   */
  /**
   * Enable the audio track with the specified language, and optionally the
   * specified kind (main, translation, descriptions, or commentary).
   *
   * When set via the API, the track language will not change the viewer’s
   * stored preference.
   *
   * @param {AudioLanguage} language The two‐letter language code.
   * @param {AudioKind} [kind] The kind of track to enable (main, translation, descriptions, commentary).
   * @return {SelectAudioTrackPromise}
   */
  selectAudioTrack(language, kind) {
    if (!language) {
      throw new TypeError("You must pass a language.");
    }
    return this.callMethod("selectAudioTrack", {
      language,
      kind
    });
  }
  /**
   * Enable the main audio track for the video.
   *
   * @return {SelectAudioTrackPromise}
   */
  selectDefaultAudioTrack() {
    return this.callMethod("selectDefaultAudioTrack");
  }
  /**
   * A promise to pause the video.
   *
   * @promise PausePromise
   * @fulfill {void} The video was paused.
   */
  /**
   * Pause the video if it’s playing.
   *
   * @return {PausePromise}
   */
  pause() {
    return this.callMethod("pause");
  }
  /**
   * A promise to play the video.
   *
   * @promise PlayPromise
   * @fulfill {void} The video was played.
   */
  /**
   * Play the video if it’s paused. **Note:** on iOS and some other
   * mobile devices, you cannot programmatically trigger play. Once the
   * viewer has tapped on the play button in the player, however, you
   * will be able to use this function.
   *
   * @return {PlayPromise}
   */
  play() {
    return this.callMethod("play");
  }
  /**
   * Request that the player enters fullscreen.
   * @return {Promise}
   */
  requestFullscreen() {
    if (screenfull.isEnabled) {
      return screenfull.request(this.element);
    }
    return this.callMethod("requestFullscreen");
  }
  /**
   * Request that the player exits fullscreen.
   * @return {Promise}
   */
  exitFullscreen() {
    if (screenfull.isEnabled) {
      return screenfull.exit();
    }
    return this.callMethod("exitFullscreen");
  }
  /**
   * Returns true if the player is currently fullscreen.
   * @return {Promise}
   */
  getFullscreen() {
    if (screenfull.isEnabled) {
      return npo_src.resolve(screenfull.isFullscreen);
    }
    return this.get("fullscreen");
  }
  /**
   * Request that the player enters picture-in-picture.
   * @return {Promise}
   */
  requestPictureInPicture() {
    return this.callMethod("requestPictureInPicture");
  }
  /**
   * Request that the player exits picture-in-picture.
   * @return {Promise}
   */
  exitPictureInPicture() {
    return this.callMethod("exitPictureInPicture");
  }
  /**
   * Returns true if the player is currently picture-in-picture.
   * @return {Promise}
   */
  getPictureInPicture() {
    return this.get("pictureInPicture");
  }
  /**
   * A promise to prompt the viewer to initiate remote playback.
   *
   * @promise RemotePlaybackPromptPromise
   * @fulfill {void}
   * @reject {NotFoundError} No remote playback device is available.
   */
  /**
   * Request to prompt the user to initiate remote playback.
   *
   * @return {RemotePlaybackPromptPromise}
   */
  remotePlaybackPrompt() {
    return this.callMethod("remotePlaybackPrompt");
  }
  /**
   * A promise to unload the video.
   *
   * @promise UnloadPromise
   * @fulfill {void} The video was unloaded.
   */
  /**
   * Return the player to its initial state.
   *
   * @return {UnloadPromise}
   */
  unload() {
    return this.callMethod("unload");
  }
  /**
   * Cleanup the player and remove it from the DOM
   *
   * It won't be usable and a new one should be constructed
   *  in order to do any operations.
   *
   * @return {Promise}
   */
  destroy() {
    return new npo_src((resolve) => {
      readyMap.delete(this);
      playerMap.delete(this.element);
      if (this._originalElement) {
        playerMap.delete(this._originalElement);
        this._originalElement.removeAttribute("data-vimeo-initialized");
      }
      if (this.element && this.element.nodeName === "IFRAME" && this.element.parentNode) {
        if (this.element.parentNode.parentNode && this._originalElement && this._originalElement !== this.element.parentNode) {
          this.element.parentNode.parentNode.removeChild(this.element.parentNode);
        } else {
          this.element.parentNode.removeChild(this.element);
        }
      }
      if (this.element && this.element.nodeName === "DIV" && this.element.parentNode) {
        this.element.removeAttribute("data-vimeo-initialized");
        const iframe = this.element.querySelector("iframe");
        if (iframe && iframe.parentNode) {
          if (iframe.parentNode.parentNode && this._originalElement && this._originalElement !== iframe.parentNode) {
            iframe.parentNode.parentNode.removeChild(iframe.parentNode);
          } else {
            iframe.parentNode.removeChild(iframe);
          }
        }
      }
      this._window.removeEventListener("message", this._onMessage);
      if (screenfull.isEnabled) {
        screenfull.off("fullscreenchange", this.fullscreenchangeHandler);
      }
      resolve();
    });
  }
  /**
   * A promise to get the autopause behavior of the video.
   *
   * @promise GetAutopausePromise
   * @fulfill {boolean} Whether autopause is turned on or off.
   * @reject {UnsupportedError} Autopause is not supported with the current
   *         player or browser.
   */
  /**
   * Get the autopause behavior for this player.
   *
   * @return {GetAutopausePromise}
   */
  getAutopause() {
    return this.get("autopause");
  }
  /**
   * A promise to set the autopause behavior of the video.
   *
   * @promise SetAutopausePromise
   * @fulfill {boolean} Whether autopause is turned on or off.
   * @reject {UnsupportedError} Autopause is not supported with the current
   *         player or browser.
   */
  /**
   * Enable or disable the autopause behavior of this player.
   *
   * By default, when another video is played in the same browser, this
   * player will automatically pause. Unless you have a specific reason
   * for doing so, we recommend that you leave autopause set to the
   * default (`true`).
   *
   * @param {boolean} autopause
   * @return {SetAutopausePromise}
   */
  setAutopause(autopause) {
    return this.set("autopause", autopause);
  }
  /**
   * A promise to get the buffered property of the video.
   *
   * @promise GetBufferedPromise
   * @fulfill {Array} Buffered Timeranges converted to an Array.
   */
  /**
   * Get the buffered property of the video.
   *
   * @return {GetBufferedPromise}
   */
  getBuffered() {
    return this.get("buffered");
  }
  /**
   * @typedef {Object} CameraProperties
   * @prop {number} props.yaw - Number between 0 and 360.
   * @prop {number} props.pitch - Number between -90 and 90.
   * @prop {number} props.roll - Number between -180 and 180.
   * @prop {number} props.fov - The field of view in degrees.
   */
  /**
   * A promise to get the camera properties of the player.
   *
   * @promise GetCameraPromise
   * @fulfill {CameraProperties} The camera properties.
   */
  /**
   * For 360° videos get the camera properties for this player.
   *
   * @return {GetCameraPromise}
   */
  getCameraProps() {
    return this.get("cameraProps");
  }
  /**
   * A promise to set the camera properties of the player.
   *
   * @promise SetCameraPromise
   * @fulfill {Object} The camera was successfully set.
   * @reject {RangeError} The range was out of bounds.
   */
  /**
   * For 360° videos set the camera properties for this player.
   *
   * @param {CameraProperties} camera The camera properties
   * @return {SetCameraPromise}
   */
  setCameraProps(camera) {
    return this.set("cameraProps", camera);
  }
  /**
   * A representation of a chapter.
   *
   * @typedef {Object} VimeoChapter
   * @property {number} startTime The start time of the chapter.
   * @property {object} title The title of the chapter.
   * @property {number} index The place in the order of Chapters. Starts at 1.
   */
  /**
   * A promise to get chapters for the video.
   *
   * @promise GetChaptersPromise
   * @fulfill {VimeoChapter[]} The chapters for the video.
   */
  /**
   * Get an array of all the chapters for the video.
   *
   * @return {GetChaptersPromise}
   */
  getChapters() {
    return this.get("chapters");
  }
  /**
   * A promise to get the currently active chapter.
   *
   * @promise GetCurrentChaptersPromise
   * @fulfill {VimeoChapter|undefined} The current chapter for the video.
   */
  /**
   * Get the currently active chapter for the video.
   *
   * @return {GetCurrentChaptersPromise}
   */
  getCurrentChapter() {
    return this.get("currentChapter");
  }
  /**
   * A promise to get the accent color of the player.
   *
   * @promise GetColorPromise
   * @fulfill {string} The hex color of the player.
   */
  /**
   * Get the accent color for this player. Note this is deprecated in place of `getColorTwo`.
   *
   * @return {GetColorPromise}
   */
  getColor() {
    return this.get("color");
  }
  /**
   * A promise to get all colors for the player in an array.
   *
   * @promise GetColorsPromise
   * @fulfill {string[]} The hex colors of the player.
   */
  /**
   * Get all the colors for this player in an array: [colorOne, colorTwo, colorThree, colorFour]
   *
   * @return {GetColorPromise}
   */
  getColors() {
    return npo_src.all([this.get("colorOne"), this.get("colorTwo"), this.get("colorThree"), this.get("colorFour")]);
  }
  /**
   * A promise to set the accent color of the player.
   *
   * @promise SetColorPromise
   * @fulfill {string} The color was successfully set.
   * @reject {TypeError} The string was not a valid hex or rgb color.
   * @reject {ContrastError} The color was set, but the contrast is
   *         outside of the acceptable range.
   * @reject {EmbedSettingsError} The owner of the player has chosen to
   *         use a specific color.
   */
  /**
   * Set the accent color of this player to a hex or rgb string. Setting the
   * color may fail if the owner of the video has set their embed
   * preferences to force a specific color.
   * Note this is deprecated in place of `setColorTwo`.
   *
   * @param {string} color The hex or rgb color string to set.
   * @return {SetColorPromise}
   */
  setColor(color) {
    return this.set("color", color);
  }
  /**
   * A promise to set all colors for the player.
   *
   * @promise SetColorsPromise
   * @fulfill {string[]} The colors were successfully set.
   * @reject {TypeError} The string was not a valid hex or rgb color.
   * @reject {ContrastError} The color was set, but the contrast is
   *         outside of the acceptable range.
   * @reject {EmbedSettingsError} The owner of the player has chosen to
   *         use a specific color.
   */
  /**
   * Set the colors of this player to a hex or rgb string. Setting the
   * color may fail if the owner of the video has set their embed
   * preferences to force a specific color.
   * The colors should be passed in as an array: [colorOne, colorTwo, colorThree, colorFour].
   * If a color should not be set, the index in the array can be left as null.
   *
   * @param {string[]} colors Array of the hex or rgb color strings to set.
   * @return {SetColorsPromise}
   */
  setColors(colors) {
    if (!Array.isArray(colors)) {
      return new npo_src((resolve, reject) => reject(new TypeError("Argument must be an array.")));
    }
    const nullPromise = new npo_src((resolve) => resolve(null));
    const colorPromises = [colors[0] ? this.set("colorOne", colors[0]) : nullPromise, colors[1] ? this.set("colorTwo", colors[1]) : nullPromise, colors[2] ? this.set("colorThree", colors[2]) : nullPromise, colors[3] ? this.set("colorFour", colors[3]) : nullPromise];
    return npo_src.all(colorPromises);
  }
  /**
   * A representation of a cue point.
   *
   * @typedef {Object} VimeoCuePoint
   * @property {number} time The time of the cue point.
   * @property {object} data The data passed when adding the cue point.
   * @property {string} id The unique id for use with removeCuePoint.
   */
  /**
   * A promise to get the cue points of a video.
   *
   * @promise GetCuePointsPromise
   * @fulfill {VimeoCuePoint[]} The cue points added to the video.
   * @reject {UnsupportedError} Cue points are not supported with the current
   *         player or browser.
   */
  /**
   * Get an array of the cue points added to the video.
   *
   * @return {GetCuePointsPromise}
   */
  getCuePoints() {
    return this.get("cuePoints");
  }
  /**
   * A promise to get the current time of the video.
   *
   * @promise GetCurrentTimePromise
   * @fulfill {number} The current time in seconds.
   */
  /**
   * Get the current playback position in seconds.
   *
   * @return {GetCurrentTimePromise}
   */
  getCurrentTime() {
    return this.get("currentTime");
  }
  /**
   * A promise to set the current time of the video.
   *
   * @promise SetCurrentTimePromise
   * @fulfill {number} The actual current time that was set.
   * @reject {RangeError} the time was less than 0 or greater than the
   *         video’s duration.
   */
  /**
   * Set the current playback position in seconds. If the player was
   * paused, it will remain paused. Likewise, if the player was playing,
   * it will resume playing once the video has buffered.
   *
   * You can provide an accurate time and the player will attempt to seek
   * to as close to that time as possible. The exact time will be the
   * fulfilled value of the promise.
   *
   * @param {number} currentTime
   * @return {SetCurrentTimePromise}
   */
  setCurrentTime(currentTime) {
    return this.set("currentTime", currentTime);
  }
  /**
   * A promise to get the duration of the video.
   *
   * @promise GetDurationPromise
   * @fulfill {number} The duration in seconds.
   */
  /**
   * Get the duration of the video in seconds. It will be rounded to the
   * nearest second before playback begins, and to the nearest thousandth
   * of a second after playback begins.
   *
   * @return {GetDurationPromise}
   */
  getDuration() {
    return this.get("duration");
  }
  /**
   * A promise to get the ended state of the video.
   *
   * @promise GetEndedPromise
   * @fulfill {boolean} Whether or not the video has ended.
   */
  /**
   * Get the ended state of the video. The video has ended if
   * `currentTime === duration`.
   *
   * @return {GetEndedPromise}
   */
  getEnded() {
    return this.get("ended");
  }
  /**
   * A promise to get the loop state of the player.
   *
   * @promise GetLoopPromise
   * @fulfill {boolean} Whether or not the player is set to loop.
   */
  /**
   * Get the loop state of the player.
   *
   * @return {GetLoopPromise}
   */
  getLoop() {
    return this.get("loop");
  }
  /**
   * A promise to set the loop state of the player.
   *
   * @promise SetLoopPromise
   * @fulfill {boolean} The loop state that was set.
   */
  /**
   * Set the loop state of the player. When set to `true`, the player
   * will start over immediately once playback ends.
   *
   * @param {boolean} loop
   * @return {SetLoopPromise}
   */
  setLoop(loop) {
    return this.set("loop", loop);
  }
  /**
   * A promise to set the muted state of the player.
   *
   * @promise SetMutedPromise
   * @fulfill {boolean} The muted state that was set.
   */
  /**
   * Set the muted state of the player. When set to `true`, the player
   * volume will be muted.
   *
   * @param {boolean} muted
   * @return {SetMutedPromise}
   */
  setMuted(muted) {
    return this.set("muted", muted);
  }
  /**
   * A promise to get the muted state of the player.
   *
   * @promise GetMutedPromise
   * @fulfill {boolean} Whether or not the player is muted.
   */
  /**
   * Get the muted state of the player.
   *
   * @return {GetMutedPromise}
   */
  getMuted() {
    return this.get("muted");
  }
  /**
   * A promise to get the paused state of the player.
   *
   * @promise GetLoopPromise
   * @fulfill {boolean} Whether or not the video is paused.
   */
  /**
   * Get the paused state of the player.
   *
   * @return {GetLoopPromise}
   */
  getPaused() {
    return this.get("paused");
  }
  /**
   * A promise to get the playback rate of the player.
   *
   * @promise GetPlaybackRatePromise
   * @fulfill {number} The playback rate of the player on a scale from 0 to 2.
   */
  /**
   * Get the playback rate of the player on a scale from `0` to `2`.
   *
   * @return {GetPlaybackRatePromise}
   */
  getPlaybackRate() {
    return this.get("playbackRate");
  }
  /**
   * A promise to set the playbackrate of the player.
   *
   * @promise SetPlaybackRatePromise
   * @fulfill {number} The playback rate was set.
   * @reject {RangeError} The playback rate was less than 0 or greater than 2.
   */
  /**
   * Set the playback rate of the player on a scale from `0` to `2`. When set
   * via the API, the playback rate will not be synchronized to other
   * players or stored as the viewer's preference.
   *
   * @param {number} playbackRate
   * @return {SetPlaybackRatePromise}
   */
  setPlaybackRate(playbackRate) {
    return this.set("playbackRate", playbackRate);
  }
  /**
   * A promise to get the played property of the video.
   *
   * @promise GetPlayedPromise
   * @fulfill {Array} Played Timeranges converted to an Array.
   */
  /**
   * Get the played property of the video.
   *
   * @return {GetPlayedPromise}
   */
  getPlayed() {
    return this.get("played");
  }
  /**
   * A promise to get the qualities available of the current video.
   *
   * @promise GetQualitiesPromise
   * @fulfill {Array} The qualities of the video.
   */
  /**
   * Get the qualities of the current video.
   *
   * @return {GetQualitiesPromise}
   */
  getQualities() {
    return this.get("qualities");
  }
  /**
   * A promise to get the current set quality of the video.
   *
   * @promise GetQualityPromise
   * @fulfill {string} The current set quality.
   */
  /**
   * Get the current set quality of the video.
   *
   * @return {GetQualityPromise}
   */
  getQuality() {
    return this.get("quality");
  }
  /**
   * A promise to set the video quality.
   *
   * @promise SetQualityPromise
   * @fulfill {number} The quality was set.
   * @reject {RangeError} The quality is not available.
   */
  /**
   * Set a video quality.
   *
   * @param {string} quality
   * @return {SetQualityPromise}
   */
  setQuality(quality) {
    return this.set("quality", quality);
  }
  /**
   * A promise to get the remote playback availability.
   *
   * @promise RemotePlaybackAvailabilityPromise
   * @fulfill {boolean} Whether remote playback is available.
   */
  /**
   * Get the availability of remote playback.
   *
   * @return {RemotePlaybackAvailabilityPromise}
   */
  getRemotePlaybackAvailability() {
    return this.get("remotePlaybackAvailability");
  }
  /**
   * A promise to get the current remote playback state.
   *
   * @promise RemotePlaybackStatePromise
   * @fulfill {string} The state of the remote playback: connecting, connected, or disconnected.
   */
  /**
   * Get the current remote playback state.
   *
   * @return {RemotePlaybackStatePromise}
   */
  getRemotePlaybackState() {
    return this.get("remotePlaybackState");
  }
  /**
   * A promise to get the seekable property of the video.
   *
   * @promise GetSeekablePromise
   * @fulfill {Array} Seekable Timeranges converted to an Array.
   */
  /**
   * Get the seekable property of the video.
   *
   * @return {GetSeekablePromise}
   */
  getSeekable() {
    return this.get("seekable");
  }
  /**
   * A promise to get the seeking property of the player.
   *
   * @promise GetSeekingPromise
   * @fulfill {boolean} Whether or not the player is currently seeking.
   */
  /**
   * Get if the player is currently seeking.
   *
   * @return {GetSeekingPromise}
   */
  getSeeking() {
    return this.get("seeking");
  }
  /**
   * A promise to get the text tracks of a video.
   *
   * @promise GetTextTracksPromise
   * @fulfill {VimeoTextTrack[]} The text tracks associated with the video.
   */
  /**
   * Get an array of the text tracks that exist for the video.
   *
   * @return {GetTextTracksPromise}
   */
  getTextTracks() {
    return this.get("textTracks");
  }
  /**
   * A promise to get the audio tracks of a video.
   *
   * @promise GetAudioTracksPromise
   * @fulfill {VimeoAudioTrack[]} The audio tracks associated with the video.
   */
  /**
   * Get an array of the audio tracks that exist for the video.
   *
   * @return {GetAudioTracksPromise}
   */
  getAudioTracks() {
    return this.get("audioTracks");
  }
  /**
   * A promise to get the enabled audio track of a video.
   *
   * @promise GetAudioTrackPromise
   * @fulfill {VimeoAudioTrack} The enabled audio track.
   */
  /**
   * Get the enabled audio track for a video.
   *
   * @return {GetAudioTrackPromise}
   */
  getEnabledAudioTrack() {
    return this.get("enabledAudioTrack");
  }
  /**
   * Get the main audio track for a video.
   *
   * @return {GetAudioTrackPromise}
   */
  getDefaultAudioTrack() {
    return this.get("defaultAudioTrack");
  }
  /**
   * A promise to get the embed code for the video.
   *
   * @promise GetVideoEmbedCodePromise
   * @fulfill {string} The `<iframe>` embed code for the video.
   */
  /**
   * Get the `<iframe>` embed code for the video.
   *
   * @return {GetVideoEmbedCodePromise}
   */
  getVideoEmbedCode() {
    return this.get("videoEmbedCode");
  }
  /**
   * A promise to get the id of the video.
   *
   * @promise GetVideoIdPromise
   * @fulfill {number} The id of the video.
   */
  /**
   * Get the id of the video.
   *
   * @return {GetVideoIdPromise}
   */
  getVideoId() {
    return this.get("videoId");
  }
  /**
   * A promise to get the title of the video.
   *
   * @promise GetVideoTitlePromise
   * @fulfill {number} The title of the video.
   */
  /**
   * Get the title of the video.
   *
   * @return {GetVideoTitlePromise}
   */
  getVideoTitle() {
    return this.get("videoTitle");
  }
  /**
   * A promise to get the native width of the video.
   *
   * @promise GetVideoWidthPromise
   * @fulfill {number} The native width of the video.
   */
  /**
   * Get the native width of the currently‐playing video. The width of
   * the highest‐resolution available will be used before playback begins.
   *
   * @return {GetVideoWidthPromise}
   */
  getVideoWidth() {
    return this.get("videoWidth");
  }
  /**
   * A promise to get the native height of the video.
   *
   * @promise GetVideoHeightPromise
   * @fulfill {number} The native height of the video.
   */
  /**
   * Get the native height of the currently‐playing video. The height of
   * the highest‐resolution available will be used before playback begins.
   *
   * @return {GetVideoHeightPromise}
   */
  getVideoHeight() {
    return this.get("videoHeight");
  }
  /**
   * A promise to get the vimeo.com url for the video.
   *
   * @promise GetVideoUrlPromise
   * @fulfill {number} The vimeo.com url for the video.
   * @reject {PrivacyError} The url isn’t available because of the video’s privacy setting.
   */
  /**
   * Get the vimeo.com url for the video.
   *
   * @return {GetVideoUrlPromise}
   */
  getVideoUrl() {
    return this.get("videoUrl");
  }
  /**
   * A promise to get the volume level of the player.
   *
   * @promise GetVolumePromise
   * @fulfill {number} The volume level of the player on a scale from 0 to 1.
   */
  /**
   * Get the current volume level of the player on a scale from `0` to `1`.
   *
   * Most mobile devices do not support an independent volume from the
   * system volume. In those cases, this method will always return `1`.
   *
   * @return {GetVolumePromise}
   */
  getVolume() {
    return this.get("volume");
  }
  /**
   * A promise to set the volume level of the player.
   *
   * @promise SetVolumePromise
   * @fulfill {number} The volume was set.
   * @reject {RangeError} The volume was less than 0 or greater than 1.
   */
  /**
   * Set the volume of the player on a scale from `0` to `1`. When set
   * via the API, the volume level will not be synchronized to other
   * players or stored as the viewer’s preference.
   *
   * Most mobile devices do not support setting the volume. An error will
   * *not* be triggered in that situation.
   *
   * @param {number} volume
   * @return {SetVolumePromise}
   */
  setVolume(volume) {
    return this.set("volume", volume);
  }
  /** @typedef {import('timing-object').ITimingObject} TimingObject */
  /** @typedef {import('./lib/timing-src-connector.types').TimingSrcConnectorOptions} TimingSrcConnectorOptions */
  /** @typedef {import('./lib/timing-src-connector').TimingSrcConnector} TimingSrcConnector */
  /**
   * Connects a TimingObject to the video player (https://webtiming.github.io/timingobject/)
   *
   * @param {TimingObject} timingObject
   * @param {TimingSrcConnectorOptions} options
   *
   * @return {Promise<TimingSrcConnector>}
   */
  async setTimingSrc(timingObject, options) {
    if (!timingObject) {
      throw new TypeError("A Timing Object must be provided.");
    }
    await this.ready();
    const connector = new TimingSrcConnector(this, timingObject, options);
    postMessage(this, "notifyTimingObjectConnect");
    connector.addEventListener("disconnect", () => postMessage(this, "notifyTimingObjectDisconnect"));
    return connector;
  }
}
if (!isServerRuntime) {
  screenfull = initializeScreenfull();
  initializeEmbeds();
  resizeEmbeds();
  initAppendVideoMetadata();
  checkUrlTimeParam();
  updateDRMEmbeds();
}
const Filters = {
  treeSolveGuideID: "treeSolveGuide",
  fragmentBoxDiscussion: "#treeSolveFragments .nt-fr-fragment-box .nt-fr-fragment-discussion"
};
const onFragmentsRenderFinished = () => {
  const fragmentBoxDiscussions = document.querySelectorAll(Filters.fragmentBoxDiscussion);
  let fragmentBox;
  let dataDiscussion;
  for (let i = 0; i < fragmentBoxDiscussions.length; i++) {
    fragmentBox = fragmentBoxDiscussions[i];
    dataDiscussion = fragmentBox.dataset.discussion;
    if (dataDiscussion != null) {
      fragmentBox.innerHTML = dataDiscussion;
      delete fragmentBox.dataset.discussion;
    }
  }
};
const setUpVimeoPlayer = () => {
  const vimeoPlayerDivs = document.querySelectorAll(".nt-tp-vimeo-player");
  if (!vimeoPlayerDivs) {
    return;
  }
  let vimeoPlayerDiv;
  for (let i = 0; i < vimeoPlayerDivs.length; i++) {
    vimeoPlayerDiv = vimeoPlayerDivs[i];
    var options = {
      autopause: false,
      autoplay: false,
      width: 640,
      loop: false,
      responsive: true
    };
    new Player(
      vimeoPlayerDiv,
      options
    );
  }
};
const onRenderFinished = () => {
  onFragmentsRenderFinished();
  setUpVimeoPlayer();
};
const initEvents = {
  onRenderFinished: () => {
    onRenderFinished();
  },
  registerGlobalEvents: () => {
    window.onresize = () => {
      initEvents.onRenderFinished();
    };
  }
};
const initActions = {
  setNotRaw: (state) => {
    var _a, _b;
    if (!((_b = (_a = window == null ? void 0 : window.TreeSolve) == null ? void 0 : _a.screen) == null ? void 0 : _b.isAutofocusFirstRun)) {
      window.TreeSolve.screen.autofocus = false;
    } else {
      window.TreeSolve.screen.isAutofocusFirstRun = false;
    }
    return state;
  }
};
var ParseType = /* @__PURE__ */ ((ParseType2) => {
  ParseType2["None"] = "none";
  ParseType2["Json"] = "json";
  ParseType2["Text"] = "text";
  return ParseType2;
})(ParseType || {});
class RenderFragmentUI {
  constructor() {
    __publicField(this, "fragmentOptionsExpanded", false);
    __publicField(this, "discussionLoaded", false);
    __publicField(this, "ancillaryExpanded", false);
    __publicField(this, "doNotPaint", false);
    __publicField(this, "sectionIndex", 0);
  }
}
class RenderFragment {
  constructor(id, parentFragmentID, section, segmentIndex) {
    __publicField(this, "id");
    __publicField(this, "iKey", null);
    __publicField(this, "iExitKey", null);
    __publicField(this, "exitKey", null);
    __publicField(this, "autoMergeExit", false);
    __publicField(this, "podKey", null);
    __publicField(this, "podText", null);
    __publicField(this, "topLevelMapKey", "");
    __publicField(this, "mapKeyChain", "");
    __publicField(this, "guideID", "");
    __publicField(this, "parentFragmentID");
    __publicField(this, "value", "");
    __publicField(this, "selected", null);
    __publicField(this, "isLeaf", false);
    __publicField(this, "options", []);
    __publicField(this, "variable", []);
    __publicField(this, "classes", []);
    __publicField(this, "option", "");
    __publicField(this, "isAncillary", false);
    __publicField(this, "order", 0);
    __publicField(this, "link", null);
    __publicField(this, "pod", null);
    __publicField(this, "section");
    __publicField(this, "segmentIndex");
    __publicField(this, "ui", new RenderFragmentUI());
    this.id = id;
    this.section = section;
    this.parentFragmentID = parentFragmentID;
    this.segmentIndex = segmentIndex;
  }
}
var OutlineType = /* @__PURE__ */ ((OutlineType2) => {
  OutlineType2["None"] = "none";
  OutlineType2["Node"] = "node";
  OutlineType2["Exit"] = "exit";
  OutlineType2["Link"] = "link";
  return OutlineType2;
})(OutlineType || {});
class RenderOutlineNode {
  constructor() {
    __publicField(this, "i", "");
    // id
    __publicField(this, "c", null);
    // index from outline chart array
    __publicField(this, "d", null);
    // index from outline chart array
    __publicField(this, "x", null);
    // iExit id
    __publicField(this, "_x", null);
    // exit id
    __publicField(this, "o", []);
    // options
    __publicField(this, "parent", null);
    __publicField(this, "type", OutlineType.Node);
    __publicField(this, "isChart", true);
    __publicField(this, "isRoot", false);
    __publicField(this, "isLast", false);
  }
}
class RenderOutline {
  constructor(path, baseURI) {
    __publicField(this, "path");
    __publicField(this, "baseURI");
    __publicField(this, "loaded", false);
    __publicField(this, "v", "");
    __publicField(this, "r", new RenderOutlineNode());
    __publicField(this, "c", []);
    __publicField(this, "e");
    __publicField(this, "mv");
    this.path = path;
    this.baseURI = baseURI;
  }
}
class RenderOutlineChart {
  constructor() {
    __publicField(this, "i", "");
    __publicField(this, "b", "");
    __publicField(this, "p", "");
  }
}
class DisplayGuide {
  constructor(linkID, guide, rootID) {
    __publicField(this, "linkID");
    __publicField(this, "guide");
    __publicField(this, "outline", null);
    __publicField(this, "root");
    __publicField(this, "current", null);
    this.linkID = linkID;
    this.guide = guide;
    this.root = new RenderFragment(
      rootID,
      "guideRoot",
      this,
      0
    );
  }
}
class RenderGuide {
  constructor(id) {
    __publicField(this, "id");
    __publicField(this, "title", "");
    __publicField(this, "description", "");
    __publicField(this, "path", "");
    __publicField(this, "fragmentFolderUrl", null);
    this.id = id;
  }
}
var ScrollHopType = /* @__PURE__ */ ((ScrollHopType2) => {
  ScrollHopType2["None"] = "none";
  ScrollHopType2["Up"] = "up";
  ScrollHopType2["Down"] = "down";
  return ScrollHopType2;
})(ScrollHopType || {});
class Screen {
  constructor() {
    __publicField(this, "autofocus", false);
    __publicField(this, "isAutofocusFirstRun", true);
    __publicField(this, "hideBanner", false);
    __publicField(this, "scrollToTop", false);
    __publicField(this, "scrollToElement", null);
    __publicField(this, "scrollHop", ScrollHopType.None);
    __publicField(this, "lastScrollY", 0);
    __publicField(this, "ua", null);
  }
}
class TreeSolve {
  constructor() {
    __publicField(this, "renderingComment", null);
    __publicField(this, "screen", new Screen());
  }
}
const gFileConstants = {
  fragmentsFolderSuffix: "_frags",
  fragmentFileExtension: ".html",
  guideOutlineFilename: "outline.tsoln",
  guideRenderCommentTag: "tsGuideRenderComment ",
  fragmentRenderCommentTag: "tsFragmentRenderComment "
};
const parseGuide = (rawGuide) => {
  const guide = new RenderGuide(rawGuide.id);
  guide.title = rawGuide.title ?? "";
  guide.description = rawGuide.description ?? "";
  guide.path = rawGuide.path ?? null;
  guide.fragmentFolderUrl = gRenderCode.getGuideFragmentFolderUrl(rawGuide.fragmentFolderPath);
  return guide;
};
const parseRenderingComment = (state, raw) => {
  if (!raw) {
    return raw;
  }
  const guide = parseGuide(raw.guide);
  const displayGuide = new DisplayGuide(
    gStateCode.getFreshKeyInt(state),
    guide,
    raw.fragment.id
  );
  gFragmentCode.parseAndLoadGuideRootFragment(
    state,
    raw.fragment,
    displayGuide.root
  );
  state.renderState.displayGuide = displayGuide;
  state.renderState.currentSection = displayGuide;
  gFragmentCode.cacheSectionRoot(
    state,
    state.renderState.displayGuide
  );
};
const gRenderCode = {
  getGuideFragmentFolderUrl: (folderPath) => {
    const url = new URL(
      folderPath,
      document.baseURI
    );
    return url.toString();
  },
  getFragmentFolderUrl: (chart, fragment) => {
    var _a;
    const path = chart.p;
    if (path.startsWith("https://") === true || path.startsWith("http://") === true) {
      return path;
    }
    let baseURI = (_a = fragment.section.outline) == null ? void 0 : _a.baseURI;
    if (!baseURI) {
      baseURI = document.baseURI;
    }
    const url = new URL(
      path,
      baseURI
    );
    return url.toString();
  },
  registerGuideComment: () => {
    const treeSolveGuide = document.getElementById(Filters.treeSolveGuideID);
    if (treeSolveGuide && treeSolveGuide.hasChildNodes() === true) {
      let childNode;
      for (let i = 0; i < treeSolveGuide.childNodes.length; i++) {
        childNode = treeSolveGuide.childNodes[i];
        if (childNode.nodeType === Node.COMMENT_NODE) {
          if (!window.TreeSolve) {
            window.TreeSolve = new TreeSolve();
          }
          window.TreeSolve.renderingComment = childNode.textContent;
          childNode.remove();
          break;
        } else if (childNode.nodeType !== Node.TEXT_NODE) {
          break;
        }
      }
    }
  },
  parseRenderingComment: (state) => {
    var _a;
    if (!((_a = window.TreeSolve) == null ? void 0 : _a.renderingComment)) {
      return;
    }
    try {
      let guideRenderComment = window.TreeSolve.renderingComment;
      guideRenderComment = guideRenderComment.trim();
      if (!guideRenderComment.startsWith(gFileConstants.guideRenderCommentTag)) {
        return;
      }
      guideRenderComment = guideRenderComment.substring(gFileConstants.guideRenderCommentTag.length);
      const raw = JSON.parse(guideRenderComment);
      parseRenderingComment(
        state,
        raw
      );
    } catch (e) {
      console.error(e);
      return;
    }
  },
  registerFragmentComment: () => {
  }
};
class DisplayChart {
  constructor(linkID, chart) {
    __publicField(this, "linkID");
    __publicField(this, "chart");
    __publicField(this, "outline", null);
    __publicField(this, "root", null);
    __publicField(this, "parent", null);
    __publicField(this, "current", null);
    this.linkID = linkID;
    this.chart = chart;
  }
}
class ChainSegment {
  constructor(index, start, end) {
    __publicField(this, "index");
    __publicField(this, "text");
    __publicField(this, "outlineNodes", []);
    __publicField(this, "outlineNodesLoaded", false);
    __publicField(this, "start");
    __publicField(this, "end");
    __publicField(this, "segmentInSection", null);
    __publicField(this, "segmentSection", null);
    __publicField(this, "segmentOutSection", null);
    this.index = index;
    this.start = start;
    this.end = end;
    this.text = `${start.text}${(end == null ? void 0 : end.text) ?? ""}`;
  }
}
class SegmentNode {
  constructor(text, key, type, isRoot, isLast) {
    __publicField(this, "text");
    __publicField(this, "key");
    __publicField(this, "type");
    __publicField(this, "isRoot");
    __publicField(this, "isLast");
    this.text = text;
    this.key = key;
    this.type = type;
    this.isRoot = isRoot;
    this.isLast = isLast;
  }
}
const checkForLinkErrors = (segment, linkSegment, fragment) => {
  if (segment.end.key !== linkSegment.start.key || segment.end.type !== linkSegment.start.type) {
    throw new Error("Link segment start does not match segment end");
  }
  if (!linkSegment.segmentInSection) {
    throw new Error("Segment in section was null - link");
  }
  if (!linkSegment.segmentSection) {
    throw new Error("Segment section was null - link");
  }
  if (!linkSegment.segmentOutSection) {
    throw new Error("Segment out section was null - link");
  }
  if (gUtilities.isNullOrWhiteSpace(fragment.iKey) === true) {
    throw new Error("Mismatch between fragment and outline node - link iKey");
  } else if (linkSegment.start.type !== OutlineType.Link) {
    throw new Error("Mismatch between fragment and outline node - link");
  }
};
const getIdentifierCharacter = (identifierChar) => {
  let startOutlineType = OutlineType.Node;
  let isLast = false;
  if (identifierChar === "~") {
    startOutlineType = OutlineType.Link;
  } else if (identifierChar === "_") {
    startOutlineType = OutlineType.Exit;
  } else if (identifierChar === "-") {
    startOutlineType = OutlineType.Node;
    isLast = true;
  } else {
    throw new Error(`Unexpected query string outline node identifier: ${identifierChar}`);
  }
  return {
    type: startOutlineType,
    isLast
  };
};
const getKeyEndIndex = (remainingChain) => {
  const startKeyEndIndex = gUtilities.indexOfAny(
    remainingChain,
    ["~", "-", "_"],
    1
  );
  if (startKeyEndIndex === -1) {
    return {
      index: remainingChain.length,
      isLast: true
    };
  }
  return {
    index: startKeyEndIndex,
    isLast: null
  };
};
const getOutlineType = (remainingChain) => {
  const identifierChar = remainingChain.substring(0, 1);
  const outlineType = getIdentifierCharacter(identifierChar);
  return outlineType;
};
const getNextSegmentNode = (remainingChain) => {
  let segmentNode = null;
  let endChain = "";
  if (!gUtilities.isNullOrWhiteSpace(remainingChain)) {
    const outlineType = getOutlineType(remainingChain);
    const keyEnd = getKeyEndIndex(remainingChain);
    const key = remainingChain.substring(
      1,
      keyEnd.index
    );
    segmentNode = new SegmentNode(
      remainingChain.substring(0, keyEnd.index),
      key,
      outlineType.type,
      false,
      outlineType.isLast
    );
    if (keyEnd.isLast === true) {
      segmentNode.isLast = true;
    }
    endChain = remainingChain.substring(keyEnd.index);
  }
  return {
    segmentNode,
    endChain
  };
};
const buildSegment = (segments, remainingChain) => {
  const segmentStart = getNextSegmentNode(remainingChain);
  if (!segmentStart.segmentNode) {
    throw new Error("Segment start node was null");
  }
  remainingChain = segmentStart.endChain;
  const segmentEnd = getNextSegmentNode(remainingChain);
  if (!segmentEnd.segmentNode) {
    throw new Error("Segment end node was null");
  }
  const segment = new ChainSegment(
    segments.length,
    segmentStart.segmentNode,
    segmentEnd.segmentNode
  );
  segments.push(segment);
  return {
    remainingChain,
    segment
  };
};
const buildRootSegment = (segments, remainingChain) => {
  const rootSegmentStart = new SegmentNode(
    "guideRoot",
    "",
    OutlineType.Node,
    true,
    false
  );
  const rootSegmentEnd = getNextSegmentNode(remainingChain);
  if (!rootSegmentEnd.segmentNode) {
    throw new Error("Segment start node was null");
  }
  const rootSegment = new ChainSegment(
    segments.length,
    rootSegmentStart,
    rootSegmentEnd.segmentNode
  );
  segments.push(rootSegment);
  return {
    remainingChain,
    segment: rootSegment
  };
};
const loadSegment = (state, segment, startOutlineNode = null) => {
  gSegmentCode.loadSegmentOutlineNodes(
    state,
    segment,
    startOutlineNode
  );
  const nextSegmentOutlineNodes = segment.outlineNodes;
  if (nextSegmentOutlineNodes.length > 0) {
    const firstNode = nextSegmentOutlineNodes[nextSegmentOutlineNodes.length - 1];
    if (firstNode.i === segment.start.key) {
      firstNode.type = segment.start.type;
    }
    const lastNode = nextSegmentOutlineNodes[0];
    if (lastNode.i === segment.end.key) {
      lastNode.type = segment.end.type;
      lastNode.isLast = segment.end.isLast;
    }
  }
  gFragmentCode.loadNextChainFragment(
    state,
    segment
  );
};
const gSegmentCode = {
  setNextSegmentSection: (state, segmentIndex, link) => {
    if (!segmentIndex || !state.renderState.isChainLoad) {
      return;
    }
    const segment = state.renderState.segments[segmentIndex - 1];
    if (!segment) {
      throw new Error("Segment is null");
    }
    segment.segmentOutSection = link;
    const nextSegment = state.renderState.segments[segmentIndex];
    if (nextSegment) {
      nextSegment.segmentInSection = segment.segmentSection;
      nextSegment.segmentSection = link;
      nextSegment.segmentOutSection = link;
      loadSegment(
        state,
        nextSegment
      );
    }
  },
  loadLinkSegment: (state, linkSegmentIndex, linkFragment, link) => {
    var _a, _b;
    const segments = state.renderState.segments;
    if (linkSegmentIndex < 1) {
      throw new Error("Index < 0");
    }
    const currentSegment = segments[linkSegmentIndex - 1];
    currentSegment.segmentOutSection = link;
    if (linkSegmentIndex >= segments.length) {
      throw new Error("Next index >= array length");
    }
    const nextSegment = segments[linkSegmentIndex];
    if (!nextSegment) {
      throw new Error("Next link segment was null");
    }
    if (nextSegment.outlineNodesLoaded === true) {
      return nextSegment;
    }
    nextSegment.outlineNodesLoaded = true;
    nextSegment.segmentInSection = currentSegment.segmentSection;
    nextSegment.segmentSection = link;
    nextSegment.segmentOutSection = link;
    if (!nextSegment.segmentInSection) {
      nextSegment.segmentInSection = currentSegment.segmentSection;
    }
    if (!nextSegment.segmentSection) {
      nextSegment.segmentSection = currentSegment.segmentOutSection;
    }
    if (!nextSegment.segmentOutSection) {
      nextSegment.segmentOutSection = currentSegment.segmentOutSection;
    }
    if (gUtilities.isNullOrWhiteSpace((_a = nextSegment.segmentSection.outline) == null ? void 0 : _a.r.i) === true) {
      throw new Error("Next segment section root key was null");
    }
    let startOutlineNode = gStateCode.getCached_outlineNode(
      state,
      nextSegment.segmentSection.linkID,
      (_b = nextSegment.segmentSection.outline) == null ? void 0 : _b.r.i
    );
    loadSegment(
      state,
      nextSegment,
      startOutlineNode
    );
    checkForLinkErrors(
      currentSegment,
      nextSegment,
      linkFragment
    );
    return nextSegment;
  },
  loadExitSegment: (state, segmentIndex, plugID) => {
    const segments = state.renderState.segments;
    const currentSegment = segments[segmentIndex];
    const exitSegmentIndex = segmentIndex + 1;
    if (exitSegmentIndex >= segments.length) {
      throw new Error("Next index >= array length");
    }
    const exitSegment = segments[exitSegmentIndex];
    if (!exitSegment) {
      throw new Error("Exit link segment was null");
    }
    if (exitSegment.outlineNodesLoaded === true) {
      return exitSegment;
    }
    const segmentSection = currentSegment.segmentSection;
    const link = segmentSection.parent;
    if (!link) {
      throw new Error("Link fragmnt was null");
    }
    currentSegment.segmentOutSection = link.section;
    exitSegment.outlineNodesLoaded = true;
    exitSegment.segmentInSection = currentSegment.segmentSection;
    exitSegment.segmentSection = currentSegment.segmentOutSection;
    exitSegment.segmentOutSection = currentSegment.segmentOutSection;
    if (!exitSegment.segmentInSection) {
      throw new Error("Segment in section was null");
    }
    const exitOutlineNode = gStateCode.getCached_outlineNode(
      state,
      exitSegment.segmentInSection.linkID,
      exitSegment.start.key
    );
    if (!exitOutlineNode) {
      throw new Error("ExitOutlineNode was null");
    }
    if (gUtilities.isNullOrWhiteSpace(exitOutlineNode._x) === true) {
      throw new Error("Exit key was null");
    }
    const plugOutlineNode = gStateCode.getCached_outlineNode(
      state,
      exitSegment.segmentSection.linkID,
      plugID
    );
    if (!plugOutlineNode) {
      throw new Error("PlugOutlineNode was null");
    }
    if (exitOutlineNode._x !== plugOutlineNode.x) {
      throw new Error("PlugOutlineNode does not match exitOutlineNode");
    }
    loadSegment(
      state,
      exitSegment,
      plugOutlineNode
    );
    return exitSegment;
  },
  loadNextSegment: (state, segment) => {
    if (segment.outlineNodesLoaded === true) {
      return;
    }
    segment.outlineNodesLoaded = true;
    const nextSegmentIndex = segment.index + 1;
    const segments = state.renderState.segments;
    if (nextSegmentIndex >= segments.length) {
      throw new Error("Next index >= array length");
    }
    const nextSegment = segments[nextSegmentIndex];
    if (nextSegment) {
      if (!nextSegment.segmentInSection) {
        nextSegment.segmentInSection = segment.segmentSection;
      }
      if (!nextSegment.segmentSection) {
        nextSegment.segmentSection = segment.segmentOutSection;
      }
      if (!nextSegment.segmentOutSection) {
        nextSegment.segmentOutSection = segment.segmentOutSection;
      }
      loadSegment(
        state,
        nextSegment
      );
    }
  },
  getNextSegmentOutlineNode: (state, segment) => {
    let outlineNode = segment.outlineNodes.pop() ?? null;
    if ((outlineNode == null ? void 0 : outlineNode.isLast) === true) {
      return outlineNode;
    }
    if (segment.outlineNodes.length === 0) {
      const nextSegment = state.renderState.segments[segment.index + 1];
      if (!nextSegment) {
        throw new Error("NextSegment was null");
      }
      if (!nextSegment.segmentInSection) {
        nextSegment.segmentInSection = segment.segmentSection;
      }
      if (!nextSegment.segmentSection) {
        nextSegment.segmentSection = segment.segmentOutSection;
      }
      if (!nextSegment.segmentOutSection) {
        nextSegment.segmentOutSection = segment.segmentOutSection;
      }
    }
    return outlineNode;
  },
  parseSegments: (state, queryString) => {
    if (queryString.startsWith("?") === true) {
      queryString = queryString.substring(1);
    }
    if (gUtilities.isNullOrWhiteSpace(queryString) === true) {
      return;
    }
    const segments = [];
    let remainingChain = queryString;
    let result;
    result = buildRootSegment(
      segments,
      remainingChain
    );
    while (!gUtilities.isNullOrWhiteSpace(remainingChain)) {
      result = buildSegment(
        segments,
        remainingChain
      );
      if (result.segment.end.isLast === true) {
        break;
      }
      remainingChain = result.remainingChain;
    }
    state.renderState.segments = segments;
  },
  loadSegmentOutlineNodes: (state, segment, startOutlineNode = null) => {
    if (!segment.segmentInSection) {
      throw new Error("Segment in section was null");
    }
    if (!segment.segmentSection) {
      throw new Error("Segment section was null");
    }
    let segmentOutlineNodes = [];
    if (!startOutlineNode) {
      startOutlineNode = gStateCode.getCached_outlineNode(
        state,
        segment.segmentInSection.linkID,
        segment.start.key
      );
      if (!startOutlineNode) {
        throw new Error("Start outline node was null");
      }
      startOutlineNode.type = segment.start.type;
    }
    let endOutlineNode = gStateCode.getCached_outlineNode(
      state,
      segment.segmentSection.linkID,
      segment.end.key
    );
    if (!endOutlineNode) {
      throw new Error("End outline node was null");
    }
    endOutlineNode.type = segment.end.type;
    let parent = endOutlineNode;
    let firstLoop = true;
    while (parent) {
      segmentOutlineNodes.push(parent);
      if (!firstLoop && (parent == null ? void 0 : parent.isChart) === true && (parent == null ? void 0 : parent.isRoot) === true) {
        break;
      }
      if ((parent == null ? void 0 : parent.i) === startOutlineNode.i) {
        break;
      }
      firstLoop = false;
      parent = parent.parent;
    }
    segment.outlineNodes = segmentOutlineNodes;
  }
};
const gOutlineActions = {
  loadGuideOutlineProperties: (state, outlineResponse, fragmentFolderUrl) => {
    gOutlineCode.loadGuideOutlineProperties(
      state,
      outlineResponse,
      fragmentFolderUrl
    );
    return gStateCode.cloneState(state);
  },
  loadSegmentChartOutlineProperties: (state, outlineResponse, outline, chart, parent, segmentIndex) => {
    gOutlineCode.loadSegmentChartOutlineProperties(
      state,
      outlineResponse,
      outline,
      chart,
      parent,
      segmentIndex
    );
    return gStateCode.cloneState(state);
  },
  loadChartOutlineProperties: (state, outlineResponse, outline, chart, parent) => {
    gOutlineCode.loadChartOutlineProperties(
      state,
      outlineResponse,
      outline,
      chart,
      parent
    );
    return gStateCode.cloneState(state);
  },
  loadPodOutlineProperties: (state, outlineResponse, outline, chart, option) => {
    gOutlineCode.loadPodOutlineProperties(
      state,
      outlineResponse,
      outline,
      chart,
      option
    );
    return gStateCode.cloneState(state);
  },
  loadGuideOutlineAndSegments: (state, outlineResponse, path) => {
    const section = state.renderState.displayGuide;
    if (!section) {
      return state;
    }
    const rootSegment = state.renderState.segments[0];
    if (!rootSegment) {
      return state;
    }
    const fragmentFolderUrl = section.guide.fragmentFolderUrl;
    if (gUtilities.isNullOrWhiteSpace(fragmentFolderUrl) === true) {
      return state;
    }
    rootSegment.segmentInSection = section;
    rootSegment.segmentSection = section;
    rootSegment.segmentOutSection = section;
    gOutlineCode.loadGuideOutlineProperties(
      state,
      outlineResponse,
      path
    );
    gSegmentCode.loadSegmentOutlineNodes(
      state,
      rootSegment
    );
    const firstNode = gSegmentCode.getNextSegmentOutlineNode(
      state,
      rootSegment
    );
    if (firstNode) {
      const url = `${fragmentFolderUrl}/${firstNode.i}${gFileConstants.fragmentFileExtension}`;
      const loadDelegate = (state2, outlineResponse2) => {
        return gFragmentActions.loadChainFragment(
          state2,
          outlineResponse2,
          rootSegment,
          firstNode
        );
      };
      gStateCode.AddReLoadDataEffectImmediate(
        state,
        `loadChainFragment`,
        ParseType.Json,
        url,
        loadDelegate
      );
    } else {
      gSegmentCode.loadNextSegment(
        state,
        rootSegment
      );
    }
    return gStateCode.cloneState(state);
  }
};
const cacheNodeForNewLink = (state, outlineNode, linkID) => {
  gStateCode.cache_outlineNode(
    state,
    linkID,
    outlineNode
  );
  for (const option of outlineNode.o) {
    cacheNodeForNewLink(
      state,
      option,
      linkID
    );
  }
};
const cacheNodeForNewPod = (state, outlineNode, linkID) => {
  gStateCode.cache_outlineNode(
    state,
    linkID,
    outlineNode
  );
  for (const option of outlineNode.o) {
    cacheNodeForNewPod(
      state,
      option,
      linkID
    );
  }
};
const loadNode = (state, rawNode, linkID, parent = null) => {
  const node = new RenderOutlineNode();
  node.i = rawNode.i;
  node.c = rawNode.c ?? null;
  node.d = rawNode.d ?? null;
  node._x = rawNode._x ?? null;
  node.x = rawNode.x ?? null;
  node.parent = parent;
  node.type = OutlineType.Node;
  gStateCode.cache_outlineNode(
    state,
    linkID,
    node
  );
  if (node.c) {
    node.type = OutlineType.Link;
  }
  if (rawNode.o && Array.isArray(rawNode.o) === true && rawNode.o.length > 0) {
    let o;
    for (const option of rawNode.o) {
      o = loadNode(
        state,
        option,
        linkID,
        node
      );
      node.o.push(o);
    }
  }
  return node;
};
const loadCharts = (outline, rawOutlineCharts) => {
  outline.c = [];
  let c;
  for (const chart of rawOutlineCharts) {
    c = new RenderOutlineChart();
    c.i = chart.i;
    c.b = chart.b;
    c.p = chart.p;
    outline.c.push(c);
  }
};
const gOutlineCode = {
  registerOutlineUrlDownload: (state, url) => {
    if (state.renderState.outlineUrls[url] === true) {
      return true;
    }
    state.renderState.outlineUrls[url] = true;
    return false;
  },
  loadGuideOutlineProperties: (state, outlineResponse, fragmentFolderUrl) => {
    if (!state.renderState.displayGuide) {
      throw new Error("DisplayGuide was null.");
    }
    const guide = state.renderState.displayGuide;
    const rawOutline = outlineResponse.jsonData;
    const guideOutline = gOutlineCode.getGuideOutline(
      state,
      fragmentFolderUrl
    );
    gOutlineCode.loadOutlineProperties(
      state,
      rawOutline,
      guideOutline,
      guide.linkID
    );
    guide.outline = guideOutline;
    guideOutline.r.isChart = false;
    if (state.renderState.isChainLoad === true) {
      const segments = state.renderState.segments;
      if (segments.length > 0) {
        const rootSegment = segments[0];
        rootSegment.start.key = guideOutline.r.i;
      }
    }
    gFragmentCode.cacheSectionRoot(
      state,
      guide
    );
    if (guideOutline.r.c != null) {
      const outlineChart = gOutlineCode.getOutlineChart(
        guideOutline,
        guideOutline.r.c
      );
      const guideRoot = guide.root;
      if (!guideRoot) {
        throw new Error("The current fragment was null");
      }
      gOutlineCode.getOutlineFromChart_subscription(
        state,
        outlineChart,
        guideRoot
      );
    } else if (guide.root) {
      gFragmentCode.expandOptionPods(
        state,
        guide.root
      );
      gFragmentCode.autoExpandSingleBlankOption(
        state,
        guide.root
      );
    }
    return guideOutline;
  },
  getOutlineChart: (outline, index) => {
    if (outline.c.length > index) {
      return outline.c[index];
    }
    return null;
  },
  buildDisplayChartFromRawOutline: (state, chart, rawOutline, outline, parent) => {
    const link = new DisplayChart(
      gStateCode.getFreshKeyInt(state),
      chart
    );
    gOutlineCode.loadOutlineProperties(
      state,
      rawOutline,
      outline,
      link.linkID
    );
    link.outline = outline;
    link.parent = parent;
    parent.link = link;
    return link;
  },
  buildPodDisplayChartFromRawOutline: (state, chart, rawOutline, outline, parent) => {
    const pod = new DisplayChart(
      gStateCode.getFreshKeyInt(state),
      chart
    );
    gOutlineCode.loadOutlineProperties(
      state,
      rawOutline,
      outline,
      pod.linkID
    );
    pod.outline = outline;
    pod.parent = parent;
    parent.pod = pod;
    return pod;
  },
  buildDisplayChartFromOutlineForNewLink: (state, chart, outline, parent) => {
    const link = new DisplayChart(
      gStateCode.getFreshKeyInt(state),
      chart
    );
    gOutlineCode.loadOutlinePropertiesForNewLink(
      state,
      outline,
      link.linkID
    );
    link.outline = outline;
    link.parent = parent;
    parent.link = link;
    return link;
  },
  buildDisplayChartFromOutlineForNewPod: (state, chart, outline, parent) => {
    const pod = new DisplayChart(
      gStateCode.getFreshKeyInt(state),
      chart
    );
    gOutlineCode.loadOutlinePropertiesForNewPod(
      state,
      outline,
      pod.linkID
    );
    pod.outline = outline;
    pod.parent = parent;
    parent.pod = pod;
    return pod;
  },
  loadSegmentChartOutlineProperties: (state, outlineResponse, outline, chart, parent, segmentIndex) => {
    var _a;
    if (parent.link) {
      throw new Error(`Link already loaded, rootID: ${(_a = parent.link.root) == null ? void 0 : _a.id}`);
    }
    const rawOutline = outlineResponse.jsonData;
    const link = gOutlineCode.buildDisplayChartFromRawOutline(
      state,
      chart,
      rawOutline,
      outline,
      parent
    );
    gSegmentCode.loadLinkSegment(
      state,
      segmentIndex,
      parent,
      link
    );
    gOutlineCode.setChartAsCurrent(
      state,
      link
    );
    gFragmentCode.cacheSectionRoot(
      state,
      link
    );
  },
  loadChartOutlineProperties: (state, outlineResponse, outline, chart, parent) => {
    var _a;
    if (parent.link) {
      throw new Error(`Link already loaded, rootID: ${(_a = parent.link.root) == null ? void 0 : _a.id}`);
    }
    const rawOutline = outlineResponse.jsonData;
    const link = gOutlineCode.buildDisplayChartFromRawOutline(
      state,
      chart,
      rawOutline,
      outline,
      parent
    );
    gFragmentCode.cacheSectionRoot(
      state,
      link
    );
    gOutlineCode.setChartAsCurrent(
      state,
      link
    );
    gOutlineCode.postGetChartOutlineRoot_subscription(
      state,
      link
    );
  },
  loadPodOutlineProperties: (state, outlineResponse, outline, chart, option) => {
    var _a;
    if (option.pod) {
      throw new Error(`Link already loaded, rootID: ${(_a = option.pod.root) == null ? void 0 : _a.id}`);
    }
    const rawOutline = outlineResponse.jsonData;
    const pod = gOutlineCode.buildPodDisplayChartFromRawOutline(
      state,
      chart,
      rawOutline,
      outline,
      option
    );
    gFragmentCode.cacheSectionRoot(
      state,
      pod
    );
    gOutlineCode.postGetPodOutlineRoot_subscription(
      state,
      pod
    );
  },
  postGetChartOutlineRoot_subscription: (state, section) => {
    if (section.root) {
      return;
    }
    const outline = section.outline;
    if (!outline) {
      throw new Error("Section outline was null");
    }
    const rootFragmenID = outline.r.i;
    const path = outline.path;
    const url = `${path}/${rootFragmenID}${gFileConstants.fragmentFileExtension}`;
    const loadAction = (state2, response) => {
      return gFragmentActions.loadRootFragmentAndSetSelected(
        state2,
        response,
        section
      );
    };
    gStateCode.AddReLoadDataEffectImmediate(
      state,
      `loadChartOutlineRoot`,
      ParseType.Text,
      url,
      loadAction
    );
  },
  postGetPodOutlineRoot_subscription: (state, section) => {
    if (section.root) {
      return;
    }
    const outline = section.outline;
    if (!outline) {
      throw new Error("Section outline was null");
    }
    const rootFragmenID = outline.r.i;
    const path = outline.path;
    const url = `${path}/${rootFragmenID}${gFileConstants.fragmentFileExtension}`;
    const loadAction = (state2, response) => {
      return gFragmentActions.loadPodRootFragment(
        state2,
        response,
        section
      );
    };
    gStateCode.AddReLoadDataEffectImmediate(
      state,
      `loadChartOutlineRoot`,
      ParseType.Text,
      url,
      loadAction
    );
  },
  setChartAsCurrent: (state, displaySection) => {
    state.renderState.currentSection = displaySection;
  },
  getGuideOutline: (state, fragmentFolderUrl) => {
    let outline = state.renderState.outlines[fragmentFolderUrl];
    if (outline) {
      return outline;
    }
    outline = new RenderOutline(
      fragmentFolderUrl,
      document.baseURI
    );
    state.renderState.outlines[fragmentFolderUrl] = outline;
    return outline;
  },
  getOutline: (state, fragmentFolderUrl, chart, linkFragment) => {
    var _a;
    let outline = state.renderState.outlines[fragmentFolderUrl];
    if (outline) {
      return outline;
    }
    let baseURI = chart.b;
    if (gUtilities.isNullOrWhiteSpace(baseURI) === true) {
      baseURI = ((_a = linkFragment.section.outline) == null ? void 0 : _a.baseURI) ?? null;
    }
    if (!baseURI) {
      baseURI = document.baseURI;
    }
    outline = new RenderOutline(
      fragmentFolderUrl,
      baseURI
    );
    state.renderState.outlines[fragmentFolderUrl] = outline;
    return outline;
  },
  // getFragmentLinkChartOutline: (
  //     state: IState,
  //     fragment: IRenderFragment
  // ): void => {
  //     const outline = fragment.section.outline;
  //     if (!outline) {
  //         return;
  //     }
  //     const outlineNode = gStateCode.getCached_outlineNode(
  //         state,
  //         fragment.section.linkID,
  //         fragment.id
  //     );
  //     if (outlineNode?.c == null) {
  //         return;
  //     }
  //     const outlineChart = gOutlineCode.getOutlineChart(
  //         outline,
  //         outlineNode?.c
  //     );
  //     gOutlineCode.getOutlineFromChart_subscription(
  //         state,
  //         outlineChart,
  //         fragment
  //     );
  // },
  getLinkOutline_subscripion: (state, option) => {
    const outline = option.section.outline;
    if (!outline) {
      return;
    }
    const outlineNode = gStateCode.getCached_outlineNode(
      state,
      option.section.linkID,
      option.id
    );
    if ((outlineNode == null ? void 0 : outlineNode.c) == null || state.renderState.isChainLoad === true) {
      return;
    }
    const outlineChart = gOutlineCode.getOutlineChart(
      outline,
      outlineNode == null ? void 0 : outlineNode.c
    );
    gOutlineCode.getOutlineFromChart_subscription(
      state,
      outlineChart,
      option
    );
  },
  getPodOutline_subscripion: (state, option, section) => {
    if (gUtilities.isNullOrWhiteSpace(option.podKey) === true) {
      return;
    }
    const outline = section.outline;
    if (!outline) {
      return;
    }
    const outlineNode = gStateCode.getCached_outlineNode(
      state,
      option.section.linkID,
      option.id
    );
    if ((outlineNode == null ? void 0 : outlineNode.d) == null) {
      return;
    }
    const outlineChart = gOutlineCode.getOutlineChart(
      outline,
      outlineNode == null ? void 0 : outlineNode.d
    );
    gOutlineCode.getOutlineFromPod_subscription(
      state,
      outlineChart,
      option
    );
  },
  getSegmentOutline_subscription: (state, chart, linkFragment, segmentIndex) => {
    var _a, _b;
    if (!chart) {
      throw new Error("OutlineChart was null");
    }
    if ((_a = linkFragment.link) == null ? void 0 : _a.root) {
      console.log(`Link root already loaded: ${(_b = linkFragment.link.root) == null ? void 0 : _b.id}`);
      return;
    }
    let nextSegmentIndex = segmentIndex;
    if (nextSegmentIndex != null) {
      nextSegmentIndex++;
    }
    const fragmentFolderUrl = gRenderCode.getFragmentFolderUrl(
      chart,
      linkFragment
    );
    if (!gUtilities.isNullOrWhiteSpace(fragmentFolderUrl)) {
      const outline = gOutlineCode.getOutline(
        state,
        fragmentFolderUrl,
        chart,
        linkFragment
      );
      if (outline.loaded === true) {
        if (!linkFragment.link) {
          const link = gOutlineCode.buildDisplayChartFromOutlineForNewLink(
            state,
            chart,
            outline,
            linkFragment
          );
          gSegmentCode.setNextSegmentSection(
            state,
            nextSegmentIndex,
            link
          );
        }
        gOutlineCode.setChartAsCurrent(
          state,
          linkFragment.link
        );
      } else {
        const url = `${fragmentFolderUrl}/${gFileConstants.guideOutlineFilename}`;
        const loadRequested = gOutlineCode.registerOutlineUrlDownload(
          state,
          url
        );
        if (loadRequested === true) {
          return;
        }
        let name;
        if (state.renderState.isChainLoad === true) {
          name = `loadChainChartOutlineFile`;
        } else {
          name = `loadChartOutlineFile`;
        }
        const loadDelegate = (state2, outlineResponse) => {
          return gOutlineActions.loadSegmentChartOutlineProperties(
            state2,
            outlineResponse,
            outline,
            chart,
            linkFragment,
            nextSegmentIndex
          );
        };
        gStateCode.AddReLoadDataEffectImmediate(
          state,
          name,
          ParseType.Json,
          url,
          loadDelegate
        );
      }
    }
  },
  getOutlineFromChart_subscription: (state, chart, linkFragment) => {
    var _a, _b;
    if (!chart) {
      throw new Error("OutlineChart was null");
    }
    if ((_a = linkFragment.link) == null ? void 0 : _a.root) {
      console.log(`Link root already loaded: ${(_b = linkFragment.link.root) == null ? void 0 : _b.id}`);
      return;
    }
    let fragmentFolderUrl;
    const outlineChartPath = chart.p;
    if (!chart.i) {
      fragmentFolderUrl = outlineChartPath;
    } else {
      fragmentFolderUrl = gRenderCode.getFragmentFolderUrl(
        chart,
        linkFragment
      );
    }
    if (!gUtilities.isNullOrWhiteSpace(fragmentFolderUrl)) {
      const outline = gOutlineCode.getOutline(
        state,
        fragmentFolderUrl,
        chart,
        linkFragment
      );
      if (outline.loaded === true) {
        if (!linkFragment.link) {
          gOutlineCode.buildDisplayChartFromOutlineForNewLink(
            state,
            chart,
            outline,
            linkFragment
          );
        }
        gOutlineCode.setChartAsCurrent(
          state,
          linkFragment.link
        );
        gOutlineCode.postGetChartOutlineRoot_subscription(
          state,
          linkFragment.link
        );
      } else {
        const url = `${fragmentFolderUrl}/${gFileConstants.guideOutlineFilename}`;
        const loadRequested = gOutlineCode.registerOutlineUrlDownload(
          state,
          url
        );
        if (loadRequested === true) {
          return;
        }
        let name;
        if (state.renderState.isChainLoad === true) {
          name = `loadChainChartOutlineFile`;
        } else {
          name = `loadChartOutlineFile`;
        }
        const loadDelegate = (state2, outlineResponse) => {
          return gOutlineActions.loadChartOutlineProperties(
            state2,
            outlineResponse,
            outline,
            chart,
            linkFragment
          );
        };
        gStateCode.AddReLoadDataEffectImmediate(
          state,
          name,
          ParseType.Json,
          url,
          loadDelegate
        );
      }
    }
  },
  getOutlineFromPod_subscription: (state, chart, optionFragment) => {
    var _a, _b;
    if (!chart) {
      throw new Error("OutlineChart was null");
    }
    if ((_a = optionFragment.link) == null ? void 0 : _a.root) {
      console.log(`Link root already loaded: ${(_b = optionFragment.link.root) == null ? void 0 : _b.id}`);
      return;
    }
    const fragmentFolderUrl = gRenderCode.getFragmentFolderUrl(
      chart,
      optionFragment
    );
    if (gUtilities.isNullOrWhiteSpace(fragmentFolderUrl)) {
      return;
    }
    const outline = gOutlineCode.getOutline(
      state,
      fragmentFolderUrl,
      chart,
      optionFragment
    );
    if (outline.loaded === true) {
      if (!optionFragment.pod) {
        gOutlineCode.buildDisplayChartFromOutlineForNewPod(
          state,
          chart,
          outline,
          optionFragment
        );
      }
      gOutlineCode.postGetPodOutlineRoot_subscription(
        state,
        optionFragment.pod
      );
    } else {
      const url = `${fragmentFolderUrl}/${gFileConstants.guideOutlineFilename}`;
      const loadRequested = gOutlineCode.registerOutlineUrlDownload(
        state,
        url
      );
      if (loadRequested === true) {
        return;
      }
      let name;
      if (state.renderState.isChainLoad === true) {
        name = `loadChainChartOutlineFile`;
      } else {
        name = `loadChartOutlineFile`;
      }
      const loadDelegate = (state2, outlineResponse) => {
        return gOutlineActions.loadPodOutlineProperties(
          state2,
          outlineResponse,
          outline,
          chart,
          optionFragment
        );
      };
      gStateCode.AddReLoadDataEffectImmediate(
        state,
        name,
        ParseType.Json,
        url,
        loadDelegate
      );
    }
  },
  loadOutlineProperties: (state, rawOutline, outline, linkID) => {
    outline.v = rawOutline.v;
    if (rawOutline.c && Array.isArray(rawOutline.c) === true && rawOutline.c.length > 0) {
      loadCharts(
        outline,
        rawOutline.c
      );
    }
    if (rawOutline.e) {
      outline.e = rawOutline.e;
    }
    outline.r = loadNode(
      state,
      rawOutline.r,
      linkID
    );
    outline.loaded = true;
    outline.r.isRoot = true;
    outline.mv = rawOutline.mv;
    return outline;
  },
  loadOutlinePropertiesForNewLink: (state, outline, linkID) => {
    cacheNodeForNewLink(
      state,
      outline.r,
      linkID
    );
  },
  loadOutlinePropertiesForNewPod: (state, outline, linkID) => {
    cacheNodeForNewPod(
      state,
      outline.r,
      linkID
    );
  }
};
const getFragment = (state, fragmentID, fragmentPath, _action, loadAction) => {
  if (!state) {
    return;
  }
  const callID = gUtilities.generateGuid();
  const url = `${fragmentPath}`;
  return gAuthenticatedHttp({
    url,
    parseType: "text",
    options: {
      method: "GET"
      // headers: headers,
    },
    response: "text",
    action: loadAction,
    error: (state2, errorDetails) => {
      console.log(`{
                "message": "Error getting fragment from the server, path: ${fragmentPath}, id: ${fragmentID}",
                "url": ${url},
                "error Details": ${JSON.stringify(errorDetails)},
                "stack": ${JSON.stringify(errorDetails.stack)},
                "method": ${getFragment},
                "callID: ${callID}
            }`);
      alert(`{
                "message": "Error getting fragment from the server, path: ${fragmentPath}, id: ${fragmentID}",
                "url": ${url},
                "error Details": ${JSON.stringify(errorDetails)},
                "stack": ${JSON.stringify(errorDetails.stack)},
                "method": ${getFragment.name},
                "callID: ${callID}
            }`);
      return gStateCode.cloneState(state2);
    }
  });
};
const gFragmentEffects = {
  getFragment: (state, option, fragmentPath) => {
    const loadAction = (state2, response) => {
      const newState = gFragmentActions.loadFragment(
        state2,
        response,
        option
      );
      newState.renderState.refreshUrl = true;
      return newState;
    };
    return getFragment(
      state,
      option.id,
      fragmentPath,
      ActionType.GetFragment,
      loadAction
    );
  }
};
const getFragmentFile = (state, option) => {
  var _a, _b;
  state.loading = true;
  window.TreeSolve.screen.hideBanner = true;
  const fragmentPath = `${(_b = (_a = option.section) == null ? void 0 : _a.outline) == null ? void 0 : _b.path}/${option.id}${gFileConstants.fragmentFileExtension}`;
  return [
    state,
    gFragmentEffects.getFragment(
      state,
      option,
      fragmentPath
    )
  ];
};
const processChainFragmentType = (state, segment, outlineNode, fragment) => {
  if (fragment) {
    if (outlineNode.i !== fragment.id) {
      throw new Error("Mismatch between fragment id and outline fragment id");
    }
    if (outlineNode.type === OutlineType.Link) {
      processLink(
        state,
        segment,
        outlineNode,
        fragment
      );
    } else if (outlineNode.type === OutlineType.Exit) {
      processExit(
        state,
        segment,
        outlineNode,
        fragment
      );
    } else if (outlineNode.isChart === true && outlineNode.isRoot === true) {
      processChartRoot(
        state,
        segment,
        fragment
      );
    } else if (outlineNode.isLast === true) {
      processLast(
        state,
        segment,
        outlineNode,
        fragment
      );
    } else if (outlineNode.type === OutlineType.Node) {
      processNode(
        state,
        segment,
        outlineNode,
        fragment
      );
    } else {
      throw new Error("Unexpected fragment type.");
    }
  }
  return gStateCode.cloneState(state);
};
const checkForLastFragmentErrors = (segment, outlineNode, fragment) => {
  if (!segment.segmentSection) {
    throw new Error("Segment section was null - last");
  }
  if (outlineNode.i !== fragment.id) {
    throw new Error("Mismatch between outline node id and fragment id");
  }
};
const checkForNodeErrors = (segment, outlineNode, fragment) => {
  if (!segment.segmentSection) {
    throw new Error("Segment section was null - node");
  }
  if (!gUtilities.isNullOrWhiteSpace(fragment.iKey)) {
    throw new Error("Mismatch between fragment and outline node - link");
  } else if (!gUtilities.isNullOrWhiteSpace(fragment.iExitKey)) {
    throw new Error("Mismatch between fragment and outline node - exit");
  }
  if (outlineNode.i !== fragment.id) {
    throw new Error("Mismatch between outline node id and fragment id");
  }
};
const checkForChartRootErrors = (segment, fragment) => {
  if (!segment.segmentSection) {
    throw new Error("Segment section was null - root");
  }
  if (!gUtilities.isNullOrWhiteSpace(fragment.iKey)) {
    throw new Error("Mismatch between fragment and outline root - link");
  } else if (!gUtilities.isNullOrWhiteSpace(fragment.iExitKey)) {
    throw new Error("Mismatch between fragment and outline root - exit");
  }
};
const checkForExitErrors = (segment, outlineNode, fragment) => {
  if (!segment.segmentSection) {
    throw new Error("Segment section was null - exit");
  }
  if (!segment.segmentOutSection) {
    throw new Error("Segment out section was null - exit");
  }
  if (gUtilities.isNullOrWhiteSpace(fragment.exitKey) === true) {
    throw new Error("Mismatch between fragment and outline - exit");
  } else if (segment.end.type !== OutlineType.Exit) {
    throw new Error("Mismatch between fragment and outline node - exit");
  }
  if (outlineNode.i !== fragment.id) {
    throw new Error("Mismatch between outline node id and fragment id");
  }
};
const processChartRoot = (state, segment, fragment) => {
  checkForChartRootErrors(
    segment,
    fragment
  );
  gFragmentCode.loadNextChainFragment(
    state,
    segment
  );
  setLinksRoot(
    state,
    segment,
    fragment
  );
};
const setLinksRoot = (state, segment, fragment) => {
  const inSection = segment.segmentInSection;
  if (!inSection) {
    throw new Error("Segment in section was null - chart root");
  }
  const section = segment.segmentSection;
  if (!section) {
    throw new Error("Segment section was null - chart root");
  }
  let parent = gStateCode.getCached_chainFragment(
    state,
    inSection.linkID,
    segment.start.key
  );
  if (parent == null ? void 0 : parent.link) {
    if (parent.id === fragment.id) {
      throw new Error("Parent and Fragment are the same");
    }
    parent.link.root = fragment;
  } else {
    throw new Error("ParentFragment was null");
  }
  section.current = fragment;
};
const processNode = (state, segment, outlineNode, fragment) => {
  checkForNodeErrors(
    segment,
    outlineNode,
    fragment
  );
  gFragmentCode.loadNextChainFragment(
    state,
    segment
  );
  processFragment(
    state,
    fragment
  );
};
const processLast = (state, segment, outlineNode, fragment) => {
  var _a;
  checkForLastFragmentErrors(
    segment,
    outlineNode,
    fragment
  );
  processFragment(
    state,
    fragment
  );
  fragment.link = null;
  fragment.selected = null;
  if (((_a = fragment.options) == null ? void 0 : _a.length) > 0) {
    gFragmentCode.resetFragmentUis(state);
    fragment.ui.fragmentOptionsExpanded = true;
    state.renderState.ui.optionsExpanded = true;
  }
};
const processLink = (state, segment, outlineNode, fragment) => {
  if (outlineNode.i !== fragment.id) {
    throw new Error("Mismatch between outline node id and fragment id");
  }
  const outline = fragment.section.outline;
  if (!outline) {
    return;
  }
  if ((outlineNode == null ? void 0 : outlineNode.c) == null) {
    throw new Error();
  }
  if (outlineNode.isRoot === true && outlineNode.isChart === true) {
    setLinksRoot(
      state,
      segment,
      fragment
    );
  }
  const outlineChart = gOutlineCode.getOutlineChart(
    outline,
    outlineNode == null ? void 0 : outlineNode.c
  );
  gOutlineCode.getSegmentOutline_subscription(
    state,
    outlineChart,
    fragment,
    segment.index
  );
};
const processExit = (state, segment, outlineNode, exitFragment) => {
  checkForExitErrors(
    segment,
    outlineNode,
    exitFragment
  );
  const section = exitFragment.section;
  const sectionParent = section.parent;
  if (!sectionParent) {
    throw new Error("IDisplayChart parent is null");
  }
  const iExitKey = exitFragment.exitKey;
  for (const option of sectionParent.options) {
    if (option.iExitKey === iExitKey) {
      gSegmentCode.loadExitSegment(
        state,
        segment.index,
        option.id
      );
      gFragmentCode.setCurrent(
        state,
        exitFragment
      );
    }
  }
};
const loadFragment = (state, response, option) => {
  const parentFragmentID = option.parentFragmentID;
  if (gUtilities.isNullOrWhiteSpace(parentFragmentID) === true) {
    throw new Error("Parent fragment ID is null");
  }
  const renderFragment = gFragmentCode.parseAndLoadFragment(
    state,
    response.textData,
    parentFragmentID,
    option.id,
    option.section
  );
  state.loading = false;
  return renderFragment;
};
const loadPodFragment = (state, response, option) => {
  const parentFragmentID = option.parentFragmentID;
  if (gUtilities.isNullOrWhiteSpace(parentFragmentID) === true) {
    throw new Error("Parent fragment ID is null");
  }
  const renderFragment = gFragmentCode.parseAndLoadPodFragment(
    state,
    response.textData,
    parentFragmentID,
    option.id,
    option.section
  );
  state.loading = false;
  return renderFragment;
};
const processFragment = (state, fragment) => {
  if (!state) {
    return;
  }
  let expandedOption = null;
  let parentFragment = gStateCode.getCached_chainFragment(
    state,
    fragment.section.linkID,
    fragment.parentFragmentID
  );
  if (!parentFragment) {
    return;
  }
  for (const option of parentFragment.options) {
    if (option.id === fragment.id) {
      expandedOption = option;
      break;
    }
  }
  if (expandedOption) {
    expandedOption.ui.fragmentOptionsExpanded = true;
    gFragmentCode.showOptionNode(
      state,
      parentFragment,
      expandedOption
    );
  }
};
const gFragmentActions = {
  showAncillaryNode: (state, ancillary) => {
    return getFragmentFile(
      state,
      ancillary
    );
  },
  showOptionNode: (state, parentFragment, option) => {
    gFragmentCode.clearParentSectionSelected(parentFragment.section);
    gFragmentCode.clearOrphanedSteps(parentFragment);
    gFragmentCode.prepareToShowOptionNode(
      state,
      option
    );
    return getFragmentFile(
      state,
      option
    );
  },
  loadFragment: (state, response, option) => {
    if (!state || gUtilities.isNullOrWhiteSpace(option.id)) {
      return state;
    }
    loadFragment(
      state,
      response,
      option
    );
    return gStateCode.cloneState(state);
  },
  loadFragmentAndSetSelected: (state, response, option, optionText = null) => {
    if (!state) {
      return state;
    }
    const node = loadFragment(
      state,
      response,
      option
    );
    if (node) {
      gFragmentCode.setCurrent(
        state,
        node
      );
      if (optionText) {
        node.option = optionText;
      }
    }
    if (!state.renderState.isChainLoad) {
      state.renderState.refreshUrl = true;
    }
    return gStateCode.cloneState(state);
  },
  loadPodFragment: (state, response, option, optionText = null) => {
    if (!state) {
      return state;
    }
    const node = loadPodFragment(
      state,
      response,
      option
    );
    if (node) {
      gFragmentCode.setPodCurrent(
        state,
        node
      );
      if (optionText) {
        node.option = optionText;
      }
    }
    if (!state.renderState.isChainLoad) {
      state.renderState.refreshUrl = true;
    }
    return gStateCode.cloneState(state);
  },
  loadRootFragmentAndSetSelected: (state, response, section) => {
    var _a;
    if (!state) {
      return state;
    }
    const outlineNodeID = (_a = section.outline) == null ? void 0 : _a.r.i;
    if (!outlineNodeID) {
      return state;
    }
    const renderFragment = gFragmentCode.parseAndLoadFragment(
      state,
      response.textData,
      "root",
      outlineNodeID,
      section
    );
    state.loading = false;
    if (renderFragment) {
      renderFragment.section.root = renderFragment;
      renderFragment.section.current = renderFragment;
    }
    state.renderState.refreshUrl = true;
    return gStateCode.cloneState(state);
  },
  loadPodRootFragment: (state, response, section) => {
    var _a;
    if (!state) {
      return state;
    }
    const outlineNodeID = (_a = section.outline) == null ? void 0 : _a.r.i;
    if (!outlineNodeID) {
      return state;
    }
    const renderFragment = gFragmentCode.parseAndLoadPodFragment(
      state,
      response.textData,
      "root",
      outlineNodeID,
      section
    );
    state.loading = false;
    if (renderFragment) {
      renderFragment.section.root = renderFragment;
      renderFragment.section.current = renderFragment;
    }
    state.renderState.refreshUrl = true;
    return gStateCode.cloneState(state);
  },
  loadChainFragment: (state, response, segment, outlineNode) => {
    var _a;
    if (!state) {
      return state;
    }
    const segmentSection = segment.segmentSection;
    if (!segmentSection) {
      throw new Error("Segment section is null");
    }
    let parentFragmentID = (_a = outlineNode.parent) == null ? void 0 : _a.i;
    if (outlineNode.isRoot === true) {
      if (!outlineNode.isChart) {
        parentFragmentID = "guideRoot";
      } else {
        parentFragmentID = "root";
      }
    } else if (gUtilities.isNullOrWhiteSpace(parentFragmentID) === true) {
      throw new Error("Parent fragment ID is null");
    }
    const result = gFragmentCode.parseAndLoadFragmentBase(
      state,
      response.textData,
      parentFragmentID,
      outlineNode.i,
      segmentSection,
      segment.index
    );
    const fragment = result.fragment;
    state.loading = false;
    if (fragment) {
      let parentFragment = gStateCode.getCached_chainFragment(
        state,
        segmentSection.linkID,
        parentFragmentID
      );
      segmentSection.current = fragment;
      if (parentFragment) {
        if (parentFragment.id === fragment.id) {
          throw new Error("ParentFragment and Fragment are the same");
        }
        parentFragment.selected = fragment;
        fragment.ui.sectionIndex = parentFragment.ui.sectionIndex + 1;
      }
    }
    return processChainFragmentType(
      state,
      segment,
      outlineNode,
      fragment
    );
  }
};
const gHookRegistryCode = {
  executeStepHook: (state, step) => {
    if (!window.HookRegistry) {
      return;
    }
    window.HookRegistry.executeStepHook(
      state,
      step
    );
  }
};
const getVariableValue = (section, variableValues, variableName) => {
  var _a, _b;
  let value = variableValues[variableName];
  if (value) {
    return value;
  }
  const currentValue = (_b = (_a = section.outline) == null ? void 0 : _a.mv) == null ? void 0 : _b[variableName];
  if (currentValue) {
    variableValues[variableName] = currentValue;
  }
  getAncestorVariableValue(
    section,
    variableValues,
    variableName
  );
  return variableValues[variableName] ?? null;
};
const getAncestorVariableValue = (section, variableValues, variableName) => {
  var _a, _b, _c;
  const chart = section;
  const parent = (_a = chart.parent) == null ? void 0 : _a.section;
  if (!parent) {
    return;
  }
  const parentValue = (_c = (_b = parent.outline) == null ? void 0 : _b.mv) == null ? void 0 : _c[variableName];
  if (parentValue) {
    variableValues[variableName] = parentValue;
  }
  getAncestorVariableValue(
    parent,
    variableValues,
    variableName
  );
};
const checkForVariables = (fragment) => {
  const value = fragment.value;
  const variableRefPattern = /〈¦‹(?<variableName>[^›¦]+)›¦〉/gmu;
  const matches = value.matchAll(variableRefPattern);
  let variableName;
  let variableValues = {};
  let result = "";
  let marker = 0;
  for (const match of matches) {
    if (match && match.groups && match.index != null) {
      variableName = match.groups.variableName;
      const variableValue = getVariableValue(
        fragment.section,
        variableValues,
        variableName
      );
      if (!variableValue) {
        throw new Error(`Variable: ${variableName} could not be found`);
      }
      result = result + value.substring(marker, match.index) + variableValue;
      marker = match.index + match[0].length;
    }
  }
  result = result + value.substring(marker, value.length);
  fragment.value = result;
};
const clearSiblingChains = (parent, fragment) => {
  for (const option of parent.options) {
    if (option.id !== fragment.id) {
      clearFragmentChains(option);
    }
  }
};
const clearFragmentChains = (fragment) => {
  var _a, _b;
  if (!fragment) {
    return;
  }
  clearFragmentChains((_a = fragment.link) == null ? void 0 : _a.root);
  for (const option of fragment.options) {
    clearFragmentChains(option);
  }
  fragment.selected = null;
  if ((_b = fragment.link) == null ? void 0 : _b.root) {
    fragment.link.root.selected = null;
  }
};
const loadOption = (state, rawOption, outlineNode, section, parentFragmentID, segmentIndex) => {
  const option = new RenderFragment(
    rawOption.id,
    parentFragmentID,
    section,
    segmentIndex
  );
  option.option = rawOption.option ?? "";
  option.isAncillary = rawOption.isAncillary === true;
  option.order = rawOption.order ?? 0;
  option.iExitKey = rawOption.iExitKey ?? "";
  option.autoMergeExit = rawOption.autoMergeExit === true;
  option.podKey = rawOption.podKey ?? "";
  option.podText = rawOption.podText ?? "";
  if (outlineNode) {
    for (const outlineOption of outlineNode.o) {
      if (outlineOption.i === option.id) {
        gStateCode.cache_outlineNode(
          state,
          section.linkID,
          outlineOption
        );
        break;
      }
    }
  }
  gStateCode.cache_chainFragment(
    state,
    option
  );
  gOutlineCode.getPodOutline_subscripion(
    state,
    option,
    section
  );
  return option;
};
const showPlug_subscription = (state, exit, optionText) => {
  const section = exit.section;
  const parent = section.parent;
  if (!parent) {
    throw new Error("IDisplayChart parent is null");
  }
  const iExitKey = exit.exitKey;
  for (const option of parent.options) {
    if (option.iExitKey === iExitKey) {
      return showOptionNode_subscripton(
        state,
        option,
        optionText
      );
    }
  }
};
const showOptionNode_subscripton = (state, option, optionText = null) => {
  var _a, _b;
  if (!option || !((_b = (_a = option.section) == null ? void 0 : _a.outline) == null ? void 0 : _b.path)) {
    return;
  }
  gFragmentCode.prepareToShowOptionNode(
    state,
    option
  );
  return gFragmentCode.getFragmentAndLinkOutline_subscripion(
    state,
    option,
    optionText
  );
};
const loadNextFragmentInSegment = (state, segment) => {
  var _a, _b;
  const nextOutlineNode = gSegmentCode.getNextSegmentOutlineNode(
    state,
    segment
  );
  if (!nextOutlineNode) {
    return;
  }
  const fragmentFolderUrl = (_b = (_a = segment.segmentSection) == null ? void 0 : _a.outline) == null ? void 0 : _b.path;
  const url = `${fragmentFolderUrl}/${nextOutlineNode.i}${gFileConstants.fragmentFileExtension}`;
  const loadDelegate = (state2, outlineResponse) => {
    return gFragmentActions.loadChainFragment(
      state2,
      outlineResponse,
      segment,
      nextOutlineNode
    );
  };
  gStateCode.AddReLoadDataEffectImmediate(
    state,
    `loadChainFragment`,
    ParseType.Json,
    url,
    loadDelegate
  );
};
const gFragmentCode = {
  loadNextChainFragment: (state, segment) => {
    if (segment.outlineNodes.length > 0) {
      loadNextFragmentInSegment(
        state,
        segment
      );
    } else {
      gSegmentCode.loadNextSegment(
        state,
        segment
      );
    }
  },
  hasOption: (fragment, optionID) => {
    for (const option of fragment.options) {
      if (option.id === optionID) {
        return true;
      }
    }
    return false;
  },
  checkSelected: (fragment) => {
    var _a, _b;
    if (!((_a = fragment.selected) == null ? void 0 : _a.id)) {
      return;
    }
    if (!gFragmentCode.hasOption(fragment, (_b = fragment.selected) == null ? void 0 : _b.id)) {
      throw new Error("Selected has been set to fragment that isn't an option");
    }
  },
  clearParentSectionSelected: (displayChart) => {
    const parent = displayChart.parent;
    if (!parent) {
      return;
    }
    gFragmentCode.clearParentSectionOrphanedSteps(parent);
    gFragmentCode.clearParentSectionSelected(parent.section);
  },
  clearParentSectionOrphanedSteps: (fragment) => {
    if (!fragment) {
      return;
    }
    gFragmentCode.clearOrphanedSteps(fragment.selected);
    fragment.selected = null;
  },
  clearOrphanedSteps: (fragment) => {
    var _a;
    if (!fragment) {
      return;
    }
    gFragmentCode.clearOrphanedSteps((_a = fragment.link) == null ? void 0 : _a.root);
    gFragmentCode.clearOrphanedSteps(fragment.selected);
    fragment.selected = null;
    fragment.link = null;
  },
  getFragmentAndLinkOutline_subscripion: (state, option, optionText = null) => {
    var _a, _b;
    state.loading = true;
    window.TreeSolve.screen.hideBanner = true;
    gOutlineCode.getLinkOutline_subscripion(
      state,
      option
    );
    const url = `${(_b = (_a = option.section) == null ? void 0 : _a.outline) == null ? void 0 : _b.path}/${option.id}${gFileConstants.fragmentFileExtension}`;
    const loadAction = (state2, response) => {
      return gFragmentActions.loadFragmentAndSetSelected(
        state2,
        response,
        option,
        optionText
      );
    };
    gStateCode.AddReLoadDataEffectImmediate(
      state,
      `loadFragmentFile`,
      ParseType.Text,
      url,
      loadAction
    );
  },
  getPodFragment_subscripion: (state, option, optionText = null) => {
    var _a, _b;
    state.loading = true;
    window.TreeSolve.screen.hideBanner = true;
    const url = `${(_b = (_a = option.section) == null ? void 0 : _a.outline) == null ? void 0 : _b.path}/${option.id}${gFileConstants.fragmentFileExtension}`;
    const loadAction = (state2, response) => {
      return gFragmentActions.loadPodFragment(
        state2,
        response,
        option,
        optionText
      );
    };
    gStateCode.AddReLoadDataEffectImmediate(
      state,
      `loadFragmentFile`,
      ParseType.Text,
      url,
      loadAction
    );
  },
  // getLinkOutline_subscripion: (
  //     state: IState,
  //     option: IRenderFragment,
  // ): void => {
  //     const outline = option.section.outline;
  //     if (!outline) {
  //         return;
  //     }
  //     const outlineNode = gStateCode.getCached_outlineNode(
  //         state,
  //         option.section.linkID,
  //         option.id
  //     );
  //     if (outlineNode?.c == null
  //         || state.renderState.isChainLoad === true // Will load it from a segment
  //     ) {
  //         return;
  //     }
  //     const outlineChart = gOutlineCode.getOutlineChart(
  //         outline,
  //         outlineNode?.c
  //     );
  //     gOutlineCode.getOutlineFromChart_subscription(
  //         state,
  //         outlineChart,
  //         option
  //     );
  // },
  getLinkElementID: (fragmentID) => {
    return `nt_lk_frag_${fragmentID}`;
  },
  getFragmentElementID: (fragmentID) => {
    return `nt_fr_frag_${fragmentID}`;
  },
  prepareToShowOptionNode: (state, option) => {
    gFragmentCode.markOptionsExpanded(
      state,
      option
    );
    gFragmentCode.setCurrent(
      state,
      option
    );
    gHistoryCode.pushBrowserHistoryState(state);
  },
  prepareToShowPodOptionNode: (state, option) => {
    gFragmentCode.markOptionsExpanded(
      state,
      option
    );
    gFragmentCode.setPodCurrent(
      state,
      option
    );
  },
  parseAndLoadFragment: (state, response, parentFragmentID, outlineNodeID, section) => {
    const result = gFragmentCode.parseAndLoadFragmentBase(
      state,
      response,
      parentFragmentID,
      outlineNodeID,
      section
    );
    const fragment = result.fragment;
    if (result.continueLoading === true) {
      gFragmentCode.autoExpandSingleBlankOption(
        state,
        result.fragment
      );
      if (!fragment.link) {
        gOutlineCode.getLinkOutline_subscripion(
          state,
          fragment
        );
      }
    }
    return fragment;
  },
  parseAndLoadPodFragment: (state, response, parentFragmentID, outlineNodeID, section) => {
    const result = gFragmentCode.parseAndLoadFragmentBase(
      state,
      response,
      parentFragmentID,
      outlineNodeID,
      section
    );
    const fragment = result.fragment;
    if (result.continueLoading === true) {
      gFragmentCode.autoExpandSingleBlankOption(
        state,
        result.fragment
      );
    }
    return fragment;
  },
  parseAndLoadFragmentBase: (state, response, parentFragmentID, outlineNodeID, section, segmentIndex = null) => {
    if (!section.outline) {
      throw new Error("Option section outline was null");
    }
    const rawFragment = gFragmentCode.parseFragment(response);
    if (!rawFragment) {
      throw new Error("Raw fragment was null");
    }
    if (outlineNodeID !== rawFragment.id) {
      throw new Error("The rawFragment id does not match the outlineNodeID");
    }
    let fragment = gStateCode.getCached_chainFragment(
      state,
      section.linkID,
      outlineNodeID
    );
    if (!fragment) {
      fragment = new RenderFragment(
        rawFragment.id,
        parentFragmentID,
        section,
        segmentIndex
      );
    }
    let continueLoading = false;
    gFragmentCode.loadFragment(
      state,
      rawFragment,
      fragment
    );
    gStateCode.cache_chainFragment(
      state,
      fragment
    );
    continueLoading = true;
    return {
      fragment,
      continueLoading
    };
  },
  autoExpandSingleBlankOption: (state, fragment) => {
    const optionsAndAncillaries = gFragmentCode.splitOptionsAndAncillaries(fragment.options);
    if (optionsAndAncillaries.options.length === 1 && gUtilities.isNullOrWhiteSpace(fragment.iKey) && (optionsAndAncillaries.options[0].option === "" || optionsAndAncillaries.options[0].autoMergeExit === true)) {
      const outlineNode = gStateCode.getCached_outlineNode(
        state,
        fragment.section.linkID,
        fragment.id
      );
      if ((outlineNode == null ? void 0 : outlineNode.c) != null) {
        return;
      }
      return showOptionNode_subscripton(
        state,
        optionsAndAncillaries.options[0]
      );
    } else if (!gUtilities.isNullOrWhiteSpace(fragment.exitKey)) {
      showPlug_subscription(
        state,
        fragment,
        fragment.option
      );
    }
  },
  expandOptionPods: (state, fragment) => {
    const optionsAndAncillaries = gFragmentCode.splitOptionsAndAncillaries(fragment.options);
    for (const option of optionsAndAncillaries.options) {
      const outlineNode = gStateCode.getCached_outlineNode(
        state,
        option.section.linkID,
        option.id
      );
      if ((outlineNode == null ? void 0 : outlineNode.d) == null || option.pod != null) {
        return;
      }
      gOutlineCode.getPodOutline_subscripion(
        state,
        option,
        option.section
      );
    }
  },
  cacheSectionRoot: (state, displaySection) => {
    if (!displaySection) {
      return;
    }
    const rootFragment = displaySection.root;
    if (!rootFragment) {
      return;
    }
    gStateCode.cache_chainFragment(
      state,
      rootFragment
    );
    displaySection.current = displaySection.root;
    for (const option of rootFragment.options) {
      gStateCode.cache_chainFragment(
        state,
        option
      );
    }
  },
  elementIsParagraph: (value) => {
    let trimmed = value;
    if (!gUtilities.isNullOrWhiteSpace(trimmed)) {
      if (trimmed.length > 20) {
        trimmed = trimmed.substring(0, 20);
        trimmed = trimmed.replace(/\s/g, "");
      }
    }
    if (trimmed.startsWith("<p>") === true && trimmed[3] !== "<") {
      return true;
    }
    return false;
  },
  parseAndLoadGuideRootFragment: (state, rawFragment, root) => {
    if (!rawFragment) {
      return;
    }
    gFragmentCode.loadFragment(
      state,
      rawFragment,
      root
    );
  },
  loadFragment: (state, rawFragment, fragment) => {
    var _a;
    fragment.topLevelMapKey = rawFragment.topLevelMapKey ?? "";
    fragment.mapKeyChain = rawFragment.mapKeyChain ?? "";
    fragment.guideID = rawFragment.guideID ?? "";
    fragment.iKey = rawFragment.iKey ?? null;
    fragment.exitKey = rawFragment.exitKey ?? null;
    fragment.variable = rawFragment.variable ?? [];
    fragment.classes = rawFragment.classes ?? [];
    fragment.value = rawFragment.value ?? "";
    fragment.value = fragment.value.trim();
    fragment.ui.doNotPaint = false;
    checkForVariables(
      fragment
    );
    const outlineNode = gStateCode.getCached_outlineNode(
      state,
      fragment.section.linkID,
      fragment.id
    );
    fragment.parentFragmentID = ((_a = outlineNode == null ? void 0 : outlineNode.parent) == null ? void 0 : _a.i) ?? "";
    let option;
    if (rawFragment.options && Array.isArray(rawFragment.options)) {
      for (const rawOption of rawFragment.options) {
        option = fragment.options.find((o) => o.id === rawOption.id);
        if (!option) {
          option = loadOption(
            state,
            rawOption,
            outlineNode,
            fragment.section,
            fragment.id,
            fragment.segmentIndex
          );
          fragment.options.push(option);
        } else {
          option.option = rawOption.option ?? "";
          option.isAncillary = rawOption.isAncillary === true;
          option.order = rawOption.order ?? 0;
          option.iExitKey = rawOption.iExitKey ?? "";
          option.exitKey = rawOption.exitKey ?? "";
          option.autoMergeExit = rawOption.autoMergeExit ?? "";
          option.podKey = rawOption.podKey ?? "";
          option.podText = rawOption.podText ?? "";
          option.section = fragment.section;
          option.parentFragmentID = fragment.id;
          option.segmentIndex = fragment.segmentIndex;
        }
        option.ui.doNotPaint = false;
      }
    }
    gHookRegistryCode.executeStepHook(
      state,
      fragment
    );
  },
  parseFragment: (response) => {
    const lines = response.split("\n");
    const renderCommentStart = `<!-- ${gFileConstants.fragmentRenderCommentTag}`;
    const renderCommentEnd = ` -->`;
    let fragmentRenderComment = null;
    let line;
    let buildValue = false;
    let value = "";
    for (let i = 0; i < lines.length; i++) {
      line = lines[i];
      if (buildValue) {
        value = `${value}
${line}`;
        continue;
      }
      if (line.startsWith(renderCommentStart) === true) {
        fragmentRenderComment = line.substring(renderCommentStart.length);
        buildValue = true;
      }
    }
    if (!fragmentRenderComment) {
      return;
    }
    fragmentRenderComment = fragmentRenderComment.trim();
    if (fragmentRenderComment.endsWith(renderCommentEnd) === true) {
      const length = fragmentRenderComment.length - renderCommentEnd.length;
      fragmentRenderComment = fragmentRenderComment.substring(
        0,
        length
      );
    }
    fragmentRenderComment = fragmentRenderComment.trim();
    let rawFragment = null;
    try {
      rawFragment = JSON.parse(fragmentRenderComment);
    } catch (e) {
      console.log(e);
    }
    rawFragment.value = value;
    return rawFragment;
  },
  markOptionsExpanded: (state, fragment) => {
    if (!state) {
      return;
    }
    gFragmentCode.resetFragmentUis(state);
    state.renderState.ui.optionsExpanded = true;
    fragment.ui.fragmentOptionsExpanded = true;
  },
  collapseFragmentsOptions: (fragment) => {
    if (!fragment || fragment.options.length === 0) {
      return;
    }
    for (const option of fragment.options) {
      option.ui.fragmentOptionsExpanded = false;
    }
  },
  showOptionNode: (state, fragment, option) => {
    gFragmentCode.collapseFragmentsOptions(fragment);
    option.ui.fragmentOptionsExpanded = false;
    gFragmentCode.setCurrent(
      state,
      option
    );
  },
  resetFragmentUis: (state) => {
    const chainFragments = state.renderState.index_chainFragments_id;
    for (const propName in chainFragments) {
      gFragmentCode.resetFragmentUi(chainFragments[propName]);
    }
  },
  resetFragmentUi: (fragment) => {
    fragment.ui.fragmentOptionsExpanded = false;
    fragment.ui.doNotPaint = false;
  },
  setAncillaryActive: (state, ancillary) => {
    state.renderState.activeAncillary = ancillary;
  },
  clearAncillaryActive: (state) => {
    state.renderState.activeAncillary = null;
  },
  splitOptionsAndAncillaries: (children) => {
    const ancillaries = [];
    const options = [];
    let option;
    if (!children) {
      return {
        options,
        ancillaries,
        total: 0
      };
    }
    for (let i = 0; i < children.length; i++) {
      option = children[i];
      if (!option.isAncillary) {
        options.push(option);
      } else {
        ancillaries.push(option);
      }
    }
    return {
      options,
      ancillaries,
      total: children.length
    };
  },
  setCurrent: (state, fragment) => {
    const section = fragment.section;
    let parent = gStateCode.getCached_chainFragment(
      state,
      section.linkID,
      fragment.parentFragmentID
    );
    if (parent) {
      if (parent.id === fragment.id) {
        throw new Error("Parent and Fragment are the same");
      }
      parent.selected = fragment;
      fragment.ui.sectionIndex = parent.ui.sectionIndex + 1;
      clearSiblingChains(
        parent,
        fragment
      );
    } else {
      throw new Error("ParentFragment was null");
    }
    section.current = fragment;
    gFragmentCode.checkSelected(fragment);
  },
  setPodCurrent: (state, fragment) => {
    const section = fragment.section;
    let parent = gStateCode.getCached_chainFragment(
      state,
      section.linkID,
      fragment.parentFragmentID
    );
    if (parent) {
      if (parent.id === fragment.id) {
        throw new Error("Parent and Fragment are the same");
      }
      parent.selected = fragment;
      fragment.ui.sectionIndex = parent.ui.sectionIndex + 1;
      clearSiblingChains(
        parent,
        fragment
      );
    } else {
      throw new Error("ParentFragment was null");
    }
    gFragmentCode.checkSelected(fragment);
  }
};
const hideFromPaint = (fragment, hide) => {
  var _a;
  if (!fragment) {
    return;
  }
  fragment.ui.doNotPaint = hide;
  hideFromPaint(
    fragment.selected,
    hide
  );
  hideFromPaint(
    (_a = fragment.link) == null ? void 0 : _a.root,
    hide
  );
};
const hideOptionsFromPaint = (fragment, hide) => {
  if (!fragment) {
    return;
  }
  for (const option of fragment == null ? void 0 : fragment.options) {
    hideFromPaint(
      option,
      hide
    );
  }
  hideSectionParentSelected(
    fragment.section,
    hide
  );
};
const hideSectionParentSelected = (displayChart, hide) => {
  if (!(displayChart == null ? void 0 : displayChart.parent)) {
    return;
  }
  hideFromPaint(
    displayChart.parent.selected,
    hide
  );
  hideSectionParentSelected(
    displayChart.parent.section,
    hide
  );
};
const fragmentActions = {
  expandOptions: (state, fragment) => {
    if (!state || !fragment) {
      return state;
    }
    const ignoreEvent = state.renderState.activeAncillary != null;
    gFragmentCode.clearAncillaryActive(state);
    if (ignoreEvent === true) {
      return gStateCode.cloneState(state);
    }
    gStateCode.setDirty(state);
    gFragmentCode.resetFragmentUis(state);
    const expanded = fragment.ui.fragmentOptionsExpanded !== true;
    state.renderState.ui.optionsExpanded = expanded;
    fragment.ui.fragmentOptionsExpanded = expanded;
    hideOptionsFromPaint(
      fragment,
      true
    );
    return gStateCode.cloneState(state);
  },
  hideOptions: (state, fragment) => {
    if (!state || !fragment) {
      return state;
    }
    const ignoreEvent = state.renderState.activeAncillary != null;
    gFragmentCode.clearAncillaryActive(state);
    if (ignoreEvent === true) {
      return gStateCode.cloneState(state);
    }
    gStateCode.setDirty(state);
    gFragmentCode.resetFragmentUis(state);
    fragment.ui.fragmentOptionsExpanded = false;
    state.renderState.ui.optionsExpanded = false;
    hideOptionsFromPaint(
      fragment,
      false
    );
    return gStateCode.cloneState(state);
  },
  showOptionNode: (state, payload) => {
    if (!state || !(payload == null ? void 0 : payload.parentFragment) || !(payload == null ? void 0 : payload.option)) {
      return state;
    }
    const ignoreEvent = state.renderState.activeAncillary != null;
    gFragmentCode.clearAncillaryActive(state);
    if (ignoreEvent === true) {
      return gStateCode.cloneState(state);
    }
    gStateCode.setDirty(state);
    return gFragmentActions.showOptionNode(
      state,
      payload.parentFragment,
      payload.option
    );
  },
  toggleAncillaryNode: (state, payload) => {
    if (!state) {
      return state;
    }
    const ancillary = payload.option;
    gFragmentCode.setAncillaryActive(
      state,
      ancillary
    );
    if (ancillary) {
      gStateCode.setDirty(state);
      if (!ancillary.ui.ancillaryExpanded) {
        ancillary.ui.ancillaryExpanded = true;
        return gFragmentActions.showAncillaryNode(
          state,
          ancillary
        );
      }
      ancillary.ui.ancillaryExpanded = false;
    }
    return gStateCode.cloneState(state);
  }
};
class FragmentPayload {
  constructor(parentFragment, option, element) {
    __publicField(this, "parentFragment");
    __publicField(this, "option");
    __publicField(this, "element");
    this.parentFragment = parentFragment;
    this.option = option;
    this.element = element;
  }
}
const buildPodDiscussionView = (fragment, views) => {
  var _a, _b;
  let adjustForCollapsedOptions = false;
  let adjustForPriorAncillaries = false;
  const viewsLength = views.length;
  if (viewsLength > 0) {
    const lastView = views[viewsLength - 1];
    if (((_a = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _a.isCollapsed) === true) {
      adjustForCollapsedOptions = true;
    }
    if (((_b = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _b.hasAncillaries) === true) {
      adjustForPriorAncillaries = true;
    }
  }
  const linkELementID = gFragmentCode.getLinkElementID(fragment.id);
  const results = optionsViews.buildView(fragment);
  if (linkELementID === "nt_lk_frag_t968OJ1wo") {
    console.log(`R-DRAWING ${linkELementID}_d`);
  }
  let classes = "nt-fr-fragment-box";
  if (fragment.classes) {
    if (fragment.classes) {
      for (const className of fragment.classes) {
        classes = `${classes} nt-ur-${className}`;
      }
    }
  }
  if (adjustForCollapsedOptions === true) {
    classes = `${classes} nt-fr-prior-collapsed-options`;
  }
  if (adjustForPriorAncillaries === true) {
    classes = `${classes} nt-fr-prior-is-ancillary`;
  }
  const view = h(
    "div",
    {
      id: `${linkELementID}_d`,
      class: `${classes}`
    },
    [
      h(
        "div",
        {
          class: `nt-fr-fragment-discussion`,
          "data-discussion": fragment.value
        },
        ""
      ),
      results.views
    ]
  );
  if (results.optionsCollapsed === true) {
    const viewAny = view;
    if (!viewAny.ui) {
      viewAny.ui = {};
    }
    viewAny.ui.isCollapsed = true;
  }
  if (results.hasAncillaries === true) {
    const viewAny = view;
    if (!viewAny.ui) {
      viewAny.ui = {};
    }
    viewAny.ui.hasAncillaries = true;
  }
  views.push(view);
};
const buildView = (fragment) => {
  const views = [];
  buildPodDiscussionView(
    fragment,
    views
  );
  fragmentViews.buildView(
    fragment.selected,
    views
  );
  return views;
};
const podViews = {
  buildView: (option) => {
    var _a, _b;
    if (!option || !((_a = option.pod) == null ? void 0 : _a.root)) {
      return null;
    }
    const view = h(
      "div",
      { class: "nt-fr-pod-box" },
      buildView((_b = option.pod) == null ? void 0 : _b.root)
    );
    return view;
  }
};
const buildAncillaryDiscussionView = (ancillary) => {
  if (!ancillary.ui.ancillaryExpanded) {
    return [];
  }
  const view = [];
  fragmentViews.buildView(
    ancillary,
    view
  );
  return view;
};
const buildExpandedAncillaryView = (parent, ancillary) => {
  if (!ancillary || !ancillary.isAncillary) {
    return null;
  }
  const view = h("div", { class: "nt-fr-ancillary-box" }, [
    h("div", { class: "nt-fr-ancillary-head" }, [
      h(
        "a",
        {
          class: "nt-fr-ancillary nt-fr-ancillary-target",
          onMouseDown: [
            fragmentActions.toggleAncillaryNode,
            (target) => {
              return new FragmentPayload(
                parent,
                ancillary,
                target
              );
            }
          ]
        },
        [
          h("span", { class: "nt-fr-ancillary-text nt-fr-ancillary-target" }, ancillary.option),
          h("span", { class: "nt-fr-ancillary-x nt-fr-ancillary-target" }, "✕")
        ]
      )
    ]),
    buildAncillaryDiscussionView(ancillary)
  ]);
  return view;
};
const buildCollapsedAncillaryView = (parent, ancillary) => {
  if (!ancillary || !ancillary.isAncillary) {
    return null;
  }
  const view = h("div", { class: "nt-fr-ancillary-box nt-fr-collapsed" }, [
    h("div", { class: "nt-fr-ancillary-head" }, [
      h(
        "a",
        {
          class: "nt-fr-ancillary nt-fr-ancillary-target",
          onMouseDown: [
            fragmentActions.toggleAncillaryNode,
            (target) => {
              return new FragmentPayload(
                parent,
                ancillary,
                target
              );
            }
          ]
        },
        [
          h("span", { class: "nt-fr-ancillary-target" }, ancillary.option)
        ]
      )
    ])
  ]);
  return view;
};
const BuildAncillaryView = (parent, ancillary) => {
  if (!ancillary || !ancillary.isAncillary) {
    return null;
  }
  if (ancillary.ui.ancillaryExpanded === true) {
    return buildExpandedAncillaryView(
      parent,
      ancillary
    );
  }
  return buildCollapsedAncillaryView(
    parent,
    ancillary
  );
};
const BuildExpandedOptionView = (parent, option) => {
  var _a;
  if (!option || option.isAncillary === true) {
    return null;
  }
  let buttonClass = "nt-fr-option";
  let innerView;
  if ((_a = option.pod) == null ? void 0 : _a.root) {
    buttonClass = `${buttonClass} nt-fr-pod-button`;
    innerView = podViews.buildView(option);
  } else {
    innerView = h("span", { class: "nt-fr-option-text" }, option.option);
  }
  const view = h(
    "div",
    { class: "nt-fr-option-box" },
    [
      h(
        "a",
        {
          class: `${buttonClass}`,
          onMouseDown: [
            fragmentActions.showOptionNode,
            (target) => {
              return new FragmentPayload(
                parent,
                option,
                target
              );
            }
          ]
        },
        [
          innerView
        ]
      )
    ]
  );
  return view;
};
const buildExpandedOptionsView = (fragment, options) => {
  const optionViews = [];
  let optionVew;
  for (const option of options) {
    optionVew = BuildExpandedOptionView(
      fragment,
      option
    );
    if (optionVew) {
      optionViews.push(optionVew);
    }
  }
  let optionsClasses = "nt-fr-fragment-options";
  if (fragment.selected) {
    optionsClasses = `${optionsClasses} nt-fr-fragment-chain`;
  }
  const view = h(
    "div",
    {
      class: `${optionsClasses}`,
      tabindex: 0,
      onBlur: [
        fragmentActions.hideOptions,
        (_event) => fragment
      ]
    },
    optionViews
  );
  return {
    view,
    isCollapsed: false
  };
};
const buildExpandedOptionsBoxView = (fragment, options, fragmentELementID, views) => {
  const optionsView = buildExpandedOptionsView(
    fragment,
    options
  );
  if (!optionsView) {
    return;
  }
  let classes = "nt-fr-fragment-box";
  if (fragment.classes) {
    if (fragment.classes) {
      for (const className of fragment.classes) {
        classes = `${classes} nt-ur-${className}`;
      }
    }
  }
  views.push(
    h(
      "div",
      {
        id: `${fragmentELementID}_eo`,
        class: `${classes}`
      },
      [
        optionsView.view
      ]
    )
  );
};
const buildCollapsedOptionsView = (fragment) => {
  var _a, _b, _c;
  let buttonClass = "nt-fr-fragment-options nt-fr-collapsed";
  if ((_b = (_a = fragment.selected) == null ? void 0 : _a.pod) == null ? void 0 : _b.root) {
    buttonClass = `${buttonClass} nt-fr-pod-button`;
  }
  const view = h(
    "a",
    {
      class: `${buttonClass}`,
      onMouseDown: [
        fragmentActions.expandOptions,
        (_event) => fragment
      ]
    },
    [
      podViews.buildView(fragment.selected),
      h("span", { class: `nt-fr-option-selected` }, `${(_c = fragment.selected) == null ? void 0 : _c.option}`)
    ]
  );
  return view;
};
const buildCollapsedOptionsBoxView = (fragment, fragmentELementID, views) => {
  const optionView = buildCollapsedOptionsView(fragment);
  let classes = "nt-fr-fragment-box";
  if (fragment.classes) {
    if (fragment.classes) {
      for (const className of fragment.classes) {
        classes = `${classes} nt-ur-${className}`;
      }
    }
  }
  const view = h(
    "div",
    {
      id: `${fragmentELementID}_co`,
      class: `${classes}`
    },
    [
      optionView
    ]
  );
  const viewAny = view;
  if (!viewAny.ui) {
    viewAny.ui = {};
  }
  viewAny.ui.isCollapsed = true;
  views.push(view);
};
const buildAncillariesView = (fragment, ancillaries) => {
  if (ancillaries.length === 0) {
    return null;
  }
  const ancillariesViews = [];
  let ancillaryView;
  for (const ancillary of ancillaries) {
    ancillaryView = BuildAncillaryView(
      fragment,
      ancillary
    );
    if (ancillaryView) {
      ancillariesViews.push(ancillaryView);
    }
  }
  if (ancillariesViews.length === 0) {
    return null;
  }
  let ancillariesClasses = "nt-fr-fragment-ancillaries";
  if (fragment.selected) {
    ancillariesClasses = `${ancillariesClasses} nt-fr-fragment-chain`;
  }
  const view = h(
    "div",
    {
      class: `${ancillariesClasses}`,
      tabindex: 0
      // onBlur: [
      //     fragmentActions.hideOptions,
      //     (_event: any) => fragment
      // ]
    },
    ancillariesViews
  );
  return view;
};
const buildAncillariesBoxView = (fragment, ancillaries, fragmentELementID, views) => {
  const ancillariesView = buildAncillariesView(
    fragment,
    ancillaries
  );
  if (!ancillariesView) {
    return;
  }
  let classes = "nt-fr-fragment-box";
  if (fragment.classes) {
    if (fragment.classes) {
      for (const className of fragment.classes) {
        classes = `${classes} nt-ur-${className}`;
      }
    }
  }
  const view = h(
    "div",
    {
      id: `${fragmentELementID}_a`,
      class: `${classes}`
    },
    [
      ancillariesView
    ]
  );
  const viewAny = view;
  if (!viewAny.ui) {
    viewAny.ui = {};
  }
  viewAny.ui.hasAncillaries = true;
  views.push(view);
};
const buildOptionsView = (fragment, options) => {
  if (options.length === 0) {
    return null;
  }
  if (options.length === 1 && (options[0].option === "" || options[0].autoMergeExit === true)) {
    return null;
  }
  if (fragment.selected && !fragment.ui.fragmentOptionsExpanded) {
    const view = buildCollapsedOptionsView(fragment);
    return {
      view,
      isCollapsed: true
    };
  }
  return buildExpandedOptionsView(
    fragment,
    options
  );
};
const buildOptionsBoxView = (fragment, options, fragmentELementID, views) => {
  if (options.length === 0) {
    return;
  }
  if (options.length === 1 && (options[0].option === "" || options[0].autoMergeExit === true)) {
    return;
  }
  if (fragment.selected && !fragment.ui.fragmentOptionsExpanded) {
    buildCollapsedOptionsBoxView(
      fragment,
      fragmentELementID,
      views
    );
    return;
  }
  buildExpandedOptionsBoxView(
    fragment,
    options,
    fragmentELementID,
    views
  );
};
const optionsViews = {
  buildView: (fragment) => {
    if (!fragment.options || fragment.options.length === 0 || !gUtilities.isNullOrWhiteSpace(fragment.iKey)) {
      return {
        views: [],
        optionsCollapsed: false,
        hasAncillaries: false
      };
    }
    if (fragment.options.length === 1 && (fragment.options[0].option === "" || fragment.options[0].autoMergeExit === true)) {
      return {
        views: [],
        optionsCollapsed: false,
        hasAncillaries: false
      };
    }
    const optionsAndAncillaries = gFragmentCode.splitOptionsAndAncillaries(fragment.options);
    let hasAncillaries = false;
    const views = [
      buildAncillariesView(
        fragment,
        optionsAndAncillaries.ancillaries
      )
    ];
    if (views.length > 0) {
      hasAncillaries = true;
    }
    const optionsViewResults = buildOptionsView(
      fragment,
      optionsAndAncillaries.options
    );
    if (optionsViewResults) {
      views.push(optionsViewResults.view);
    }
    return {
      views,
      optionsCollapsed: (optionsViewResults == null ? void 0 : optionsViewResults.isCollapsed) ?? false,
      hasAncillaries
    };
  },
  buildView2: (fragment, views) => {
    if (!fragment.options || fragment.options.length === 0 || !gUtilities.isNullOrWhiteSpace(fragment.iKey)) {
      return;
    }
    if (fragment.options.length === 1 && (fragment.options[0].option === "" || fragment.options[0].autoMergeExit === true)) {
      return;
    }
    const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);
    const optionsAndAncillaries = gFragmentCode.splitOptionsAndAncillaries(fragment.options);
    buildAncillariesBoxView(
      fragment,
      optionsAndAncillaries.ancillaries,
      fragmentELementID,
      views
    );
    buildOptionsBoxView(
      fragment,
      optionsAndAncillaries.options,
      fragmentELementID,
      views
    );
  }
};
const buildLinkDiscussionView = (fragment, views) => {
  var _a, _b;
  let adjustForCollapsedOptions = false;
  let adjustForPriorAncillaries = false;
  const viewsLength = views.length;
  if (viewsLength > 0) {
    const lastView = views[viewsLength - 1];
    if (((_a = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _a.isCollapsed) === true) {
      adjustForCollapsedOptions = true;
    }
    if (((_b = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _b.hasAncillaries) === true) {
      adjustForPriorAncillaries = true;
    }
  }
  const linkELementID = gFragmentCode.getLinkElementID(fragment.id);
  const results = optionsViews.buildView(fragment);
  if (linkELementID === "nt_lk_frag_t968OJ1wo") {
    console.log(`R-DRAWING ${linkELementID}_l`);
  }
  let classes = "nt-fr-fragment-box";
  if (fragment.classes) {
    if (fragment.classes) {
      for (const className of fragment.classes) {
        classes = `${classes} nt-ur-${className}`;
      }
    }
  }
  if (adjustForCollapsedOptions === true) {
    classes = `${classes} nt-fr-prior-collapsed-options`;
  }
  if (adjustForPriorAncillaries === true) {
    classes = `${classes} nt-fr-prior-is-ancillary`;
  }
  const view = h(
    "div",
    {
      id: `${linkELementID}_l`,
      class: `${classes}`
    },
    [
      h(
        "div",
        {
          class: `nt-fr-fragment-discussion`,
          "data-discussion": fragment.value
        },
        ""
      ),
      results.views
    ]
  );
  if (results.optionsCollapsed === true) {
    const viewAny = view;
    if (!viewAny.ui) {
      viewAny.ui = {};
    }
    viewAny.ui.isCollapsed = true;
  }
  if (results.hasAncillaries === true) {
    const viewAny = view;
    if (!viewAny.ui) {
      viewAny.ui = {};
    }
    viewAny.ui.hasAncillaries = true;
  }
  views.push(view);
};
const linkViews = {
  buildView: (fragment, views) => {
    var _a;
    if (!fragment || fragment.ui.doNotPaint === true) {
      return;
    }
    buildLinkDiscussionView(
      fragment,
      views
    );
    linkViews.buildView(
      (_a = fragment.link) == null ? void 0 : _a.root,
      views
    );
    fragmentViews.buildView(
      fragment.selected,
      views
    );
  }
};
const buildDiscussionView = (fragment, views) => {
  var _a, _b;
  if (gUtilities.isNullOrWhiteSpace(fragment.value) === true) {
    return;
  }
  let adjustForCollapsedOptions = false;
  let adjustForPriorAncillaries = false;
  const viewsLength = views.length;
  if (viewsLength > 0) {
    const lastView = views[viewsLength - 1];
    if (((_a = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _a.isCollapsed) === true) {
      adjustForCollapsedOptions = true;
    }
    if (((_b = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _b.hasAncillaries) === true) {
      adjustForPriorAncillaries = true;
    }
  }
  const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);
  let classes = "nt-fr-fragment-box";
  if (fragment.classes) {
    if (fragment.classes) {
      for (const className of fragment.classes) {
        classes = `${classes} nt-ur-${className}`;
      }
    }
  }
  if (adjustForCollapsedOptions === true) {
    classes = `${classes} nt-fr-prior-collapsed-options`;
  }
  if (adjustForPriorAncillaries === true) {
    classes = `${classes} nt-fr-prior-is-ancillary`;
  }
  views.push(
    h(
      "div",
      {
        id: `${fragmentELementID}_d`,
        class: `${classes}`
      },
      [
        h(
          "div",
          {
            class: `nt-fr-fragment-discussion`,
            "data-discussion": fragment.value
          },
          ""
        )
      ]
    )
  );
};
const fragmentViews = {
  buildView: (fragment, views) => {
    var _a;
    if (!fragment || fragment.ui.doNotPaint === true) {
      return;
    }
    buildDiscussionView(
      fragment,
      views
    );
    linkViews.buildView(
      (_a = fragment.link) == null ? void 0 : _a.root,
      views
    );
    optionsViews.buildView2(
      fragment,
      views
    );
    fragmentViews.buildView(
      fragment.selected,
      views
    );
  }
};
const guideViews = {
  buildContentView: (state) => {
    var _a;
    const innerViews = [];
    fragmentViews.buildView(
      (_a = state.renderState.displayGuide) == null ? void 0 : _a.root,
      innerViews
    );
    const view = h(
      "div",
      {
        id: "nt_fr_Fragments"
      },
      innerViews
    );
    return view;
  }
};
const initView = {
  buildView: (state) => {
    const view = h(
      "div",
      {
        onClick: initActions.setNotRaw,
        id: "treeSolveFragments"
      },
      [
        guideViews.buildContentView(state)
      ]
    );
    return view;
  }
};
class Settings {
  constructor() {
    __publicField(this, "key", "-1");
    __publicField(this, "r", "-1");
    // Authentication
    __publicField(this, "userPath", `user`);
    __publicField(this, "defaultLogoutPath", `logout`);
    __publicField(this, "defaultLoginPath", `login`);
    __publicField(this, "returnUrlStart", `returnUrl`);
    __publicField(this, "baseUrl", window.ASSISTANT_BASE_URL ?? "");
    __publicField(this, "linkUrl", window.ASSISTANT_LINK_URL ?? "");
    __publicField(this, "subscriptionID", window.ASSISTANT_SUBSCRIPTION_ID ?? "");
    __publicField(this, "apiUrl", `${this.baseUrl}/api`);
    __publicField(this, "bffUrl", `${this.baseUrl}/bff`);
    __publicField(this, "fileUrl", `${this.baseUrl}/file`);
  }
}
var navigationDirection = /* @__PURE__ */ ((navigationDirection2) => {
  navigationDirection2["Buttons"] = "buttons";
  navigationDirection2["Backwards"] = "backwards";
  navigationDirection2["Forwards"] = "forwards";
  return navigationDirection2;
})(navigationDirection || {});
class History {
  constructor() {
    __publicField(this, "historyChain", []);
    __publicField(this, "direction", navigationDirection.Buttons);
    __publicField(this, "currentIndex", 0);
  }
}
class User {
  constructor() {
    __publicField(this, "key", `0123456789`);
    __publicField(this, "r", "-1");
    __publicField(this, "useVsCode", true);
    __publicField(this, "authorised", false);
    __publicField(this, "raw", true);
    __publicField(this, "logoutUrl", "");
    __publicField(this, "showMenu", false);
    __publicField(this, "name", "");
    __publicField(this, "sub", "");
  }
}
class RepeateEffects {
  constructor() {
    __publicField(this, "shortIntervalHttp", []);
    __publicField(this, "reLoadGetHttpImmediate", []);
    __publicField(this, "runActionImmediate", []);
  }
}
class RenderStateUI {
  constructor() {
    __publicField(this, "raw", true);
    __publicField(this, "optionsExpanded", false);
  }
}
class RenderState {
  constructor() {
    __publicField(this, "refreshUrl", false);
    __publicField(this, "isChainLoad", false);
    __publicField(this, "segments", []);
    __publicField(this, "displayGuide", null);
    __publicField(this, "outlines", {});
    __publicField(this, "outlineUrls", {});
    __publicField(this, "currentSection", null);
    __publicField(this, "activeAncillary", null);
    // Search indices
    __publicField(this, "index_outlineNodes_id", {});
    __publicField(this, "index_chainFragments_id", {});
    __publicField(this, "ui", new RenderStateUI());
  }
}
class State {
  constructor() {
    __publicField(this, "loading", true);
    __publicField(this, "debug", true);
    __publicField(this, "genericError", false);
    __publicField(this, "nextKey", -1);
    __publicField(this, "settings");
    __publicField(this, "user", new User());
    __publicField(this, "renderState", new RenderState());
    __publicField(this, "repeatEffects", new RepeateEffects());
    __publicField(this, "stepHistory", new History());
    const settings = new Settings();
    this.settings = settings;
  }
}
const getGuideOutline = (state, fragmentFolderUrl, loadDelegate) => {
  if (gUtilities.isNullOrWhiteSpace(fragmentFolderUrl) === true) {
    return;
  }
  const callID = gUtilities.generateGuid();
  let headers = gAjaxHeaderCode.buildHeaders(
    state,
    callID,
    ActionType.GetOutline
  );
  const url = `${fragmentFolderUrl}/${gFileConstants.guideOutlineFilename}`;
  const loadRequested = gOutlineCode.registerOutlineUrlDownload(
    state,
    url
  );
  if (loadRequested === true) {
    return;
  }
  return gAuthenticatedHttp({
    url,
    options: {
      method: "GET",
      headers
    },
    response: "json",
    action: loadDelegate,
    error: (state2, errorDetails) => {
      console.log(`{
                "message": "Error getting outline data from the server.",
                "url": ${url},
                "error Details": ${JSON.stringify(errorDetails)},
                "stack": ${JSON.stringify(errorDetails.stack)},
                "method": ${gRenderEffects.getGuideOutline.name},
                "callID: ${callID}
            }`);
      alert(`{
                "message": "Error getting outline data from the server.",
                "url": ${url},
                "error Details": ${JSON.stringify(errorDetails)},
                "stack": ${JSON.stringify(errorDetails.stack)},
                "method": ${gRenderEffects.getGuideOutline.name},
                "callID: ${callID}
            }`);
      return gStateCode.cloneState(state2);
    }
  });
};
const gRenderEffects = {
  getGuideOutline: (state) => {
    var _a;
    if (!state) {
      return;
    }
    const fragmentFolderUrl = ((_a = state.renderState.displayGuide) == null ? void 0 : _a.guide.fragmentFolderUrl) ?? "null";
    const loadDelegate = (state2, outlineResponse) => {
      return gOutlineActions.loadGuideOutlineProperties(
        state2,
        outlineResponse,
        fragmentFolderUrl
      );
    };
    return getGuideOutline(
      state,
      fragmentFolderUrl,
      loadDelegate
    );
  },
  getGuideOutlineAndLoadSegments: (state) => {
    var _a;
    if (!state) {
      return;
    }
    const fragmentFolderUrl = ((_a = state.renderState.displayGuide) == null ? void 0 : _a.guide.fragmentFolderUrl) ?? "null";
    const loadDelegate = (state2, outlineResponse) => {
      return gOutlineActions.loadGuideOutlineAndSegments(
        state2,
        outlineResponse,
        fragmentFolderUrl
      );
    };
    return getGuideOutline(
      state,
      fragmentFolderUrl,
      loadDelegate
    );
  }
};
const initialiseState = () => {
  if (!window.TreeSolve) {
    window.TreeSolve = new TreeSolve();
  }
  const state = new State();
  gRenderCode.parseRenderingComment(state);
  return state;
};
const buildRenderDisplay = (state) => {
  var _a, _b, _c, _d;
  if (!((_a = state.renderState.displayGuide) == null ? void 0 : _a.root)) {
    return state;
  }
  if (gUtilities.isNullOrWhiteSpace((_b = state.renderState.displayGuide) == null ? void 0 : _b.root.iKey) === true && (!((_c = state.renderState.displayGuide) == null ? void 0 : _c.root.options) || ((_d = state.renderState.displayGuide) == null ? void 0 : _d.root.options.length) === 0)) {
    return state;
  }
  return [
    state,
    gRenderEffects.getGuideOutline(state)
  ];
};
const buildSegmentsRenderDisplay = (state, queryString) => {
  state.renderState.isChainLoad = true;
  gSegmentCode.parseSegments(
    state,
    queryString
  );
  const segments = state.renderState.segments;
  if (segments.length === 0) {
    return state;
  }
  if (segments.length === 1) {
    throw new Error("There was only 1 segment");
  }
  const rootSegment = segments[0];
  if (!rootSegment.start.isRoot) {
    throw new Error("GuideRoot not present");
  }
  const firstSegment = segments[1];
  if (!firstSegment.start.isLast && firstSegment.start.type !== OutlineType.Link) {
    throw new Error("Invalid query string format - it should start with '-' or '~'");
  }
  return [
    state,
    gRenderEffects.getGuideOutlineAndLoadSegments(state)
  ];
};
const initState = {
  initialise: () => {
    const state = initialiseState();
    const queryString = window.location.search;
    try {
      if (!gUtilities.isNullOrWhiteSpace(queryString)) {
        return buildSegmentsRenderDisplay(
          state,
          queryString
        );
      }
      return buildRenderDisplay(state);
    } catch (e) {
      state.genericError = true;
      console.log(e);
      return state;
    }
  }
};
const renderComments = {
  registerGuideComment: () => {
    const treeSolveGuide = document.getElementById(Filters.treeSolveGuideID);
    if (treeSolveGuide && treeSolveGuide.hasChildNodes() === true) {
      let childNode;
      for (let i = 0; i < treeSolveGuide.childNodes.length; i++) {
        childNode = treeSolveGuide.childNodes[i];
        if (childNode.nodeType === Node.COMMENT_NODE) {
          if (!window.TreeSolve) {
            window.TreeSolve = new TreeSolve();
          }
          window.TreeSolve.renderingComment = childNode.textContent;
          childNode.remove();
          break;
        } else if (childNode.nodeType !== Node.TEXT_NODE) {
          break;
        }
      }
    }
  }
};
initEvents.registerGlobalEvents();
renderComments.registerGuideComment();
window.CompositeFlowsAuthor = app({
  node: document.getElementById("treeSolveFragments"),
  init: initState.initialise,
  view: initView.buildView,
  subscriptions: initSubscriptions,
  onEnd: initEvents.onRenderFinished
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpZGUuQzZIZ3VPT0ouanMiLCJzb3VyY2VzIjpbIi4uLy4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uLy4uL3Jvb3Qvc3JjL2h5cGVyQXBwL3RpbWUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dIdHRwLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3QudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nVXRpbGl0aWVzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnlVcmwudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3QudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dIaXN0b3J5Q29kZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uQ29kZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvaHR0cC9nQWpheEhlYWRlckNvZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkVmZmVjdHMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkFjdGlvbnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkh0dHAudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdWJzY3JpcHRpb25zL3JlcGVhdFN1YnNjcmlwdGlvbi50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQHZpbWVvL3BsYXllci9kaXN0L3BsYXllci5lcy5qcyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvY29uc3RhbnRzL0ZpbHRlcnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL2NvZGUvb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZC50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvb25SZW5kZXJGaW5pc2hlZC50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdEV2ZW50cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2FjdGlvbnMvaW5pdEFjdGlvbnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS91aS9SZW5kZXJGcmFnbWVudFVJLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyRnJhZ21lbnQudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lTm9kZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lQ2hhcnQudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUd1aWRlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyR3VpZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvZW51bXMvU2Nyb2xsSG9wVHlwZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvd2luZG93L1NjcmVlbi50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvd2luZG93L1RyZWVTb2x2ZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2dGaWxlQ29uc3RhbnRzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nUmVuZGVyQ29kZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvZGlzcGxheS9EaXNwbGF5Q2hhcnQudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3NlZ21lbnRzL0NoYWluU2VnbWVudC50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvc2VnbWVudHMvU2VnbWVudE5vZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dTZWdtZW50Q29kZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2FjdGlvbnMvZ091dGxpbmVBY3Rpb25zLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nT3V0bGluZUNvZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9lZmZlY3RzL2dGcmFnbWVudEVmZmVjdHMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dIb29rUmVnaXN0cnlDb2RlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy9hY3Rpb25zL2ZyYWdtZW50QWN0aW9ucy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvcGF5bG9hZHMvRnJhZ21lbnRQYXlsb2FkLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy92aWV3cy9wb2RWaWV3cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvdmlld3Mvb3B0aW9uc1ZpZXdzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy92aWV3cy9saW5rVmlld3MudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2ZyYWdtZW50Vmlld3MudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2d1aWRlVmlld3MudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlldy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdXNlci9TZXR0aW5ncy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9uYXZpZ2F0aW9uRGlyZWN0aW9uLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnkudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VzZXIvVXNlci50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvZWZmZWN0cy9SZXBlYXRlRWZmZWN0cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyU3RhdGVVSS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvUmVuZGVyU3RhdGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL1N0YXRlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nUmVuZGVyRWZmZWN0cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9yZW5kZXJDb21tZW50cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBSRUNZQ0xFRF9OT0RFID0gMVxyXG52YXIgTEFaWV9OT0RFID0gMlxyXG52YXIgVEVYVF9OT0RFID0gM1xyXG52YXIgRU1QVFlfT0JKID0ge31cclxudmFyIEVNUFRZX0FSUiA9IFtdXHJcbnZhciBtYXAgPSBFTVBUWV9BUlIubWFwXHJcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxyXG52YXIgZGVmZXIgPVxyXG4gIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09IFwidW5kZWZpbmVkXCJcclxuICAgID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgICA6IHNldFRpbWVvdXRcclxuXHJcbnZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uKG9iaikge1xyXG4gIHZhciBvdXQgPSBcIlwiXHJcblxyXG4gIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSByZXR1cm4gb2JqXHJcblxyXG4gIGlmIChpc0FycmF5KG9iaikgJiYgb2JqLmxlbmd0aCA+IDApIHtcclxuICAgIGZvciAodmFyIGsgPSAwLCB0bXA7IGsgPCBvYmoubGVuZ3RoOyBrKyspIHtcclxuICAgICAgaWYgKCh0bXAgPSBjcmVhdGVDbGFzcyhvYmpba10pKSAhPT0gXCJcIikge1xyXG4gICAgICAgIG91dCArPSAob3V0ICYmIFwiIFwiKSArIHRtcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmpba10pIHtcclxuICAgICAgICBvdXQgKz0gKG91dCAmJiBcIiBcIikgKyBrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxudmFyIG1lcmdlID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIHZhciBvdXQgPSB7fVxyXG5cclxuICBmb3IgKHZhciBrIGluIGEpIG91dFtrXSA9IGFba11cclxuICBmb3IgKHZhciBrIGluIGIpIG91dFtrXSA9IGJba11cclxuXHJcbiAgcmV0dXJuIG91dFxyXG59XHJcblxyXG52YXIgYmF0Y2ggPSBmdW5jdGlvbihsaXN0KSB7XHJcbiAgcmV0dXJuIGxpc3QucmVkdWNlKGZ1bmN0aW9uKG91dCwgaXRlbSkge1xyXG4gICAgcmV0dXJuIG91dC5jb25jYXQoXHJcbiAgICAgICFpdGVtIHx8IGl0ZW0gPT09IHRydWVcclxuICAgICAgICA/IDBcclxuICAgICAgICA6IHR5cGVvZiBpdGVtWzBdID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgICA/IFtpdGVtXVxyXG4gICAgICAgIDogYmF0Y2goaXRlbSlcclxuICAgIClcclxuICB9LCBFTVBUWV9BUlIpXHJcbn1cclxuXHJcbnZhciBpc1NhbWVBY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgcmV0dXJuIGlzQXJyYXkoYSkgJiYgaXNBcnJheShiKSAmJiBhWzBdID09PSBiWzBdICYmIHR5cGVvZiBhWzBdID09PSBcImZ1bmN0aW9uXCJcclxufVxyXG5cclxudmFyIHNob3VsZFJlc3RhcnQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgaWYgKGEgIT09IGIpIHtcclxuICAgIGZvciAodmFyIGsgaW4gbWVyZ2UoYSwgYikpIHtcclxuICAgICAgaWYgKGFba10gIT09IGJba10gJiYgIWlzU2FtZUFjdGlvbihhW2tdLCBiW2tdKSkgcmV0dXJuIHRydWVcclxuICAgICAgYltrXSA9IGFba11cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnZhciBwYXRjaFN1YnMgPSBmdW5jdGlvbihvbGRTdWJzLCBuZXdTdWJzLCBkaXNwYXRjaCkge1xyXG4gIGZvciAoXHJcbiAgICB2YXIgaSA9IDAsIG9sZFN1YiwgbmV3U3ViLCBzdWJzID0gW107XHJcbiAgICBpIDwgb2xkU3Vicy5sZW5ndGggfHwgaSA8IG5ld1N1YnMubGVuZ3RoO1xyXG4gICAgaSsrXHJcbiAgKSB7XHJcbiAgICBvbGRTdWIgPSBvbGRTdWJzW2ldXHJcbiAgICBuZXdTdWIgPSBuZXdTdWJzW2ldXHJcbiAgICBzdWJzLnB1c2goXHJcbiAgICAgIG5ld1N1YlxyXG4gICAgICAgID8gIW9sZFN1YiB8fFxyXG4gICAgICAgICAgbmV3U3ViWzBdICE9PSBvbGRTdWJbMF0gfHxcclxuICAgICAgICAgIHNob3VsZFJlc3RhcnQobmV3U3ViWzFdLCBvbGRTdWJbMV0pXHJcbiAgICAgICAgICA/IFtcclxuICAgICAgICAgICAgICBuZXdTdWJbMF0sXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzFdLFxyXG4gICAgICAgICAgICAgIG5ld1N1YlswXShkaXNwYXRjaCwgbmV3U3ViWzFdKSxcclxuICAgICAgICAgICAgICBvbGRTdWIgJiYgb2xkU3ViWzJdKClcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgOiBvbGRTdWJcclxuICAgICAgICA6IG9sZFN1YiAmJiBvbGRTdWJbMl0oKVxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4gc3Vic1xyXG59XHJcblxyXG52YXIgcGF0Y2hQcm9wZXJ0eSA9IGZ1bmN0aW9uKG5vZGUsIGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICBpZiAoa2V5ID09PSBcImtleVwiKSB7XHJcbiAgfSBlbHNlIGlmIChrZXkgPT09IFwic3R5bGVcIikge1xyXG4gICAgZm9yICh2YXIgayBpbiBtZXJnZShvbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XHJcbiAgICAgIG9sZFZhbHVlID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZVtrXSA9PSBudWxsID8gXCJcIiA6IG5ld1ZhbHVlW2tdXHJcbiAgICAgIGlmIChrWzBdID09PSBcIi1cIikge1xyXG4gICAgICAgIG5vZGVba2V5XS5zZXRQcm9wZXJ0eShrLCBvbGRWYWx1ZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2RlW2tleV1ba10gPSBvbGRWYWx1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChrZXlbMF0gPT09IFwib1wiICYmIGtleVsxXSA9PT0gXCJuXCIpIHtcclxuICAgIGlmIChcclxuICAgICAgISgobm9kZS5hY3Rpb25zIHx8IChub2RlLmFjdGlvbnMgPSB7fSkpW1xyXG4gICAgICAgIChrZXkgPSBrZXkuc2xpY2UoMikudG9Mb3dlckNhc2UoKSlcclxuICAgICAgXSA9IG5ld1ZhbHVlKVxyXG4gICAgKSB7XHJcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKVxyXG4gICAgfSBlbHNlIGlmICghb2xkVmFsdWUpIHtcclxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGtleSwgbGlzdGVuZXIpXHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICghaXNTdmcgJiYga2V5ICE9PSBcImxpc3RcIiAmJiBrZXkgaW4gbm9kZSkge1xyXG4gICAgbm9kZVtrZXldID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZSA9PSBcInVuZGVmaW5lZFwiID8gXCJcIiA6IG5ld1ZhbHVlXHJcbiAgfSBlbHNlIGlmIChcclxuICAgIG5ld1ZhbHVlID09IG51bGwgfHxcclxuICAgIG5ld1ZhbHVlID09PSBmYWxzZSB8fFxyXG4gICAgKGtleSA9PT0gXCJjbGFzc1wiICYmICEobmV3VmFsdWUgPSBjcmVhdGVDbGFzcyhuZXdWYWx1ZSkpKVxyXG4gICkge1xyXG4gICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxyXG4gIH0gZWxzZSB7XHJcbiAgICBub2RlLnNldEF0dHJpYnV0ZShrZXksIG5ld1ZhbHVlKVxyXG4gIH1cclxufVxyXG5cclxudmFyIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbih2ZG9tLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICB2YXIgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcclxuICB2YXIgcHJvcHMgPSB2ZG9tLnByb3BzXHJcbiAgdmFyIG5vZGUgPVxyXG4gICAgdmRvbS50eXBlID09PSBURVhUX05PREVcclxuICAgICAgPyBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2ZG9tLm5hbWUpXHJcbiAgICAgIDogKGlzU3ZnID0gaXNTdmcgfHwgdmRvbS5uYW1lID09PSBcInN2Z1wiKVxyXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG4gICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG5cclxuICBmb3IgKHZhciBrIGluIHByb3BzKSB7XHJcbiAgICBwYXRjaFByb3BlcnR5KG5vZGUsIGssIG51bGwsIHByb3BzW2tdLCBsaXN0ZW5lciwgaXNTdmcpXHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmRvbS5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgbm9kZS5hcHBlbmRDaGlsZChcclxuICAgICAgY3JlYXRlTm9kZShcclxuICAgICAgICAodmRvbS5jaGlsZHJlbltpXSA9IGdldFZOb2RlKHZkb20uY2hpbGRyZW5baV0pKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICByZXR1cm4gKHZkb20ubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBnZXRLZXkgPSBmdW5jdGlvbih2ZG9tKSB7XHJcbiAgcmV0dXJuIHZkb20gPT0gbnVsbCA/IG51bGwgOiB2ZG9tLmtleVxyXG59XHJcblxyXG52YXIgcGF0Y2ggPSBmdW5jdGlvbihwYXJlbnQsIG5vZGUsIG9sZFZOb2RlLCBuZXdWTm9kZSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgaWYgKG9sZFZOb2RlID09PSBuZXdWTm9kZSkge1xyXG4gIH0gZWxzZSBpZiAoXHJcbiAgICBvbGRWTm9kZSAhPSBudWxsICYmXHJcbiAgICBvbGRWTm9kZS50eXBlID09PSBURVhUX05PREUgJiZcclxuICAgIG5ld1ZOb2RlLnR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICkge1xyXG4gICAgaWYgKG9sZFZOb2RlLm5hbWUgIT09IG5ld1ZOb2RlLm5hbWUpIG5vZGUubm9kZVZhbHVlID0gbmV3Vk5vZGUubmFtZVxyXG4gIH0gZWxzZSBpZiAob2xkVk5vZGUgPT0gbnVsbCB8fCBvbGRWTm9kZS5uYW1lICE9PSBuZXdWTm9kZS5uYW1lKSB7XHJcbiAgICBub2RlID0gcGFyZW50Lmluc2VydEJlZm9yZShcclxuICAgICAgY3JlYXRlTm9kZSgobmV3Vk5vZGUgPSBnZXRWTm9kZShuZXdWTm9kZSkpLCBsaXN0ZW5lciwgaXNTdmcpLFxyXG4gICAgICBub2RlXHJcbiAgICApXHJcbiAgICBpZiAob2xkVk5vZGUgIT0gbnVsbCkge1xyXG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQob2xkVk5vZGUubm9kZSlcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIHRtcFZLaWRcclxuICAgIHZhciBvbGRWS2lkXHJcblxyXG4gICAgdmFyIG9sZEtleVxyXG4gICAgdmFyIG5ld0tleVxyXG5cclxuICAgIHZhciBvbGRWUHJvcHMgPSBvbGRWTm9kZS5wcm9wc1xyXG4gICAgdmFyIG5ld1ZQcm9wcyA9IG5ld1ZOb2RlLnByb3BzXHJcblxyXG4gICAgdmFyIG9sZFZLaWRzID0gb2xkVk5vZGUuY2hpbGRyZW5cclxuICAgIHZhciBuZXdWS2lkcyA9IG5ld1ZOb2RlLmNoaWxkcmVuXHJcblxyXG4gICAgdmFyIG9sZEhlYWQgPSAwXHJcbiAgICB2YXIgbmV3SGVhZCA9IDBcclxuICAgIHZhciBvbGRUYWlsID0gb2xkVktpZHMubGVuZ3RoIC0gMVxyXG4gICAgdmFyIG5ld1RhaWwgPSBuZXdWS2lkcy5sZW5ndGggLSAxXHJcblxyXG4gICAgaXNTdmcgPSBpc1N2ZyB8fCBuZXdWTm9kZS5uYW1lID09PSBcInN2Z1wiXHJcblxyXG4gICAgZm9yICh2YXIgaSBpbiBtZXJnZShvbGRWUHJvcHMsIG5ld1ZQcm9wcykpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChpID09PSBcInZhbHVlXCIgfHwgaSA9PT0gXCJzZWxlY3RlZFwiIHx8IGkgPT09IFwiY2hlY2tlZFwiXHJcbiAgICAgICAgICA/IG5vZGVbaV1cclxuICAgICAgICAgIDogb2xkVlByb3BzW2ldKSAhPT0gbmV3VlByb3BzW2ldXHJcbiAgICAgICkge1xyXG4gICAgICAgIHBhdGNoUHJvcGVydHkobm9kZSwgaSwgb2xkVlByb3BzW2ldLCBuZXdWUHJvcHNbaV0sIGxpc3RlbmVyLCBpc1N2ZylcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwgJiYgb2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAob2xkS2V5ID0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWRdKSkgPT0gbnVsbCB8fFxyXG4gICAgICAgIG9sZEtleSAhPT0gZ2V0S2V5KG5ld1ZLaWRzW25ld0hlYWRdKVxyXG4gICAgICApIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaChcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZEhlYWRdLm5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0sXHJcbiAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUoXHJcbiAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkKytdLFxyXG4gICAgICAgICAgb2xkVktpZHNbb2xkSGVhZCsrXVxyXG4gICAgICAgICkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsICYmIG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKG9sZEtleSA9IGdldEtleShvbGRWS2lkc1tvbGRUYWlsXSkpID09IG51bGwgfHxcclxuICAgICAgICBvbGRLZXkgIT09IGdldEtleShuZXdWS2lkc1tuZXdUYWlsXSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGF0Y2goXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRUYWlsXS5ub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLFxyXG4gICAgICAgIChuZXdWS2lkc1tuZXdUYWlsXSA9IGdldFZOb2RlKFxyXG4gICAgICAgICAgbmV3VktpZHNbbmV3VGFpbC0tXSxcclxuICAgICAgICAgIG9sZFZLaWRzW29sZFRhaWwtLV1cclxuICAgICAgICApKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9sZEhlYWQgPiBvbGRUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwpIHtcclxuICAgICAgICBub2RlLmluc2VydEJlZm9yZShcclxuICAgICAgICAgIGNyZWF0ZU5vZGUoXHJcbiAgICAgICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKG5ld1ZLaWRzW25ld0hlYWQrK10pKSxcclxuICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkXSkgJiYgb2xkVktpZC5ub2RlXHJcbiAgICAgICAgKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG5ld0hlYWQgPiBuZXdUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWRzW29sZEhlYWQrK10ubm9kZSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IG9sZEhlYWQsIGtleWVkID0ge30sIG5ld0tleWVkID0ge307IGkgPD0gb2xkVGFpbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKChvbGRLZXkgPSBvbGRWS2lkc1tpXS5rZXkpICE9IG51bGwpIHtcclxuICAgICAgICAgIGtleWVkW29sZEtleV0gPSBvbGRWS2lkc1tpXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCkge1xyXG4gICAgICAgIG9sZEtleSA9IGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWRdKSlcclxuICAgICAgICBuZXdLZXkgPSBnZXRLZXkoXHJcbiAgICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShuZXdWS2lkc1tuZXdIZWFkXSwgb2xkVktpZCkpXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICBuZXdLZXllZFtvbGRLZXldIHx8XHJcbiAgICAgICAgICAobmV3S2V5ICE9IG51bGwgJiYgbmV3S2V5ID09PSBnZXRLZXkob2xkVktpZHNbb2xkSGVhZCArIDFdKSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWQubm9kZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdLZXkgPT0gbnVsbCB8fCBvbGRWTm9kZS50eXBlID09PSBSRUNZQ0xFRF9OT0RFKSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLFxyXG4gICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgbmV3SGVhZCsrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XHJcbiAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQsXHJcbiAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBuZXdLZXllZFtuZXdLZXldID0gdHJ1ZVxyXG4gICAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICgodG1wVktpZCA9IGtleWVkW25ld0tleV0pICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZSh0bXBWS2lkLm5vZGUsIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlKSxcclxuICAgICAgICAgICAgICAgIHRtcFZLaWQsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgbmV3S2V5ZWRbbmV3S2V5XSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5ld0hlYWQrK1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICAgIGlmIChnZXRLZXkoKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkKytdKSkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBpIGluIGtleWVkKSB7XHJcbiAgICAgICAgaWYgKG5ld0tleWVkW2ldID09IG51bGwpIHtcclxuICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQoa2V5ZWRbaV0ubm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiAobmV3Vk5vZGUubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBwcm9wc0NoYW5nZWQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgZm9yICh2YXIgayBpbiBhKSBpZiAoYVtrXSAhPT0gYltrXSkgcmV0dXJuIHRydWVcclxuICBmb3IgKHZhciBrIGluIGIpIGlmIChhW2tdICE9PSBiW2tdKSByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG52YXIgZ2V0VGV4dFZOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gIHJldHVybiB0eXBlb2Ygbm9kZSA9PT0gXCJvYmplY3RcIiA/IG5vZGUgOiBjcmVhdGVUZXh0Vk5vZGUobm9kZSlcclxufVxyXG5cclxudmFyIGdldFZOb2RlID0gZnVuY3Rpb24obmV3Vk5vZGUsIG9sZFZOb2RlKSB7XHJcbiAgcmV0dXJuIG5ld1ZOb2RlLnR5cGUgPT09IExBWllfTk9ERVxyXG4gICAgPyAoKCFvbGRWTm9kZSB8fCAhb2xkVk5vZGUubGF6eSB8fCBwcm9wc0NoYW5nZWQob2xkVk5vZGUubGF6eSwgbmV3Vk5vZGUubGF6eSkpXHJcbiAgICAgICAgJiYgKChvbGRWTm9kZSA9IGdldFRleHRWTm9kZShuZXdWTm9kZS5sYXp5LnZpZXcobmV3Vk5vZGUubGF6eSkpKS5sYXp5ID1cclxuICAgICAgICAgIG5ld1ZOb2RlLmxhenkpLFxyXG4gICAgICBvbGRWTm9kZSlcclxuICAgIDogbmV3Vk5vZGVcclxufVxyXG5cclxudmFyIGNyZWF0ZVZOb2RlID0gZnVuY3Rpb24obmFtZSwgcHJvcHMsIGNoaWxkcmVuLCBub2RlLCBrZXksIHR5cGUpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogbmFtZSxcclxuICAgIHByb3BzOiBwcm9wcyxcclxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgIG5vZGU6IG5vZGUsXHJcbiAgICB0eXBlOiB0eXBlLFxyXG4gICAga2V5OiBrZXlcclxuICB9XHJcbn1cclxuXHJcbnZhciBjcmVhdGVUZXh0Vk5vZGUgPSBmdW5jdGlvbih2YWx1ZSwgbm9kZSkge1xyXG4gIHJldHVybiBjcmVhdGVWTm9kZSh2YWx1ZSwgRU1QVFlfT0JKLCBFTVBUWV9BUlIsIG5vZGUsIHVuZGVmaW5lZCwgVEVYVF9OT0RFKVxyXG59XHJcblxyXG52YXIgcmVjeWNsZU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICAgPyBjcmVhdGVUZXh0Vk5vZGUobm9kZS5ub2RlVmFsdWUsIG5vZGUpXHJcbiAgICA6IGNyZWF0ZVZOb2RlKFxyXG4gICAgICAgIG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBFTVBUWV9PQkosXHJcbiAgICAgICAgbWFwLmNhbGwobm9kZS5jaGlsZE5vZGVzLCByZWN5Y2xlTm9kZSksXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICB1bmRlZmluZWQsXHJcbiAgICAgICAgUkVDWUNMRURfTk9ERVxyXG4gICAgICApXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgTGF6eSA9IGZ1bmN0aW9uKHByb3BzKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGxhenk6IHByb3BzLFxyXG4gICAgdHlwZTogTEFaWV9OT0RFXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIGggPSBmdW5jdGlvbihuYW1lLCBwcm9wcykge1xyXG4gIGZvciAodmFyIHZkb20sIHJlc3QgPSBbXSwgY2hpbGRyZW4gPSBbXSwgaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkge1xyXG4gICAgcmVzdC5wdXNoKGFyZ3VtZW50c1tpXSlcclxuICB9XHJcblxyXG4gIHdoaWxlIChyZXN0Lmxlbmd0aCA+IDApIHtcclxuICAgIGlmIChpc0FycmF5KCh2ZG9tID0gcmVzdC5wb3AoKSkpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSB2ZG9tLmxlbmd0aDsgaS0tID4gMDsgKSB7XHJcbiAgICAgICAgcmVzdC5wdXNoKHZkb21baV0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodmRvbSA9PT0gZmFsc2UgfHwgdmRvbSA9PT0gdHJ1ZSB8fCB2ZG9tID09IG51bGwpIHtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goZ2V0VGV4dFZOb2RlKHZkb20pKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvcHMgPSBwcm9wcyB8fCBFTVBUWV9PQkpcclxuXHJcbiAgcmV0dXJuIHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCJcclxuICAgID8gbmFtZShwcm9wcywgY2hpbGRyZW4pXHJcbiAgICA6IGNyZWF0ZVZOb2RlKG5hbWUsIHByb3BzLCBjaGlsZHJlbiwgdW5kZWZpbmVkLCBwcm9wcy5rZXkpXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgYXBwID0gZnVuY3Rpb24ocHJvcHMpIHtcclxuICB2YXIgc3RhdGUgPSB7fVxyXG4gIHZhciBsb2NrID0gZmFsc2VcclxuICB2YXIgdmlldyA9IHByb3BzLnZpZXdcclxuICB2YXIgbm9kZSA9IHByb3BzLm5vZGVcclxuICB2YXIgdmRvbSA9IG5vZGUgJiYgcmVjeWNsZU5vZGUobm9kZSlcclxuICB2YXIgc3Vic2NyaXB0aW9ucyA9IHByb3BzLnN1YnNjcmlwdGlvbnNcclxuICB2YXIgc3VicyA9IFtdXHJcbiAgdmFyIG9uRW5kID0gcHJvcHMub25FbmRcclxuXHJcbiAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGRpc3BhdGNoKHRoaXMuYWN0aW9uc1tldmVudC50eXBlXSwgZXZlbnQpXHJcbiAgfVxyXG5cclxuICB2YXIgc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xyXG4gICAgaWYgKHN0YXRlICE9PSBuZXdTdGF0ZSkge1xyXG4gICAgICBzdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XHJcbiAgICAgICAgc3VicyA9IHBhdGNoU3VicyhzdWJzLCBiYXRjaChbc3Vic2NyaXB0aW9ucyhzdGF0ZSldKSwgZGlzcGF0Y2gpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHZpZXcgJiYgIWxvY2spIGRlZmVyKHJlbmRlciwgKGxvY2sgPSB0cnVlKSlcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZVxyXG4gIH1cclxuXHJcbiAgdmFyIGRpc3BhdGNoID0gKHByb3BzLm1pZGRsZXdhcmUgfHxcclxuICAgIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gb2JqXHJcbiAgICB9KShmdW5jdGlvbihhY3Rpb24sIHByb3BzKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgID8gZGlzcGF0Y2goYWN0aW9uKHN0YXRlLCBwcm9wcykpXHJcbiAgICAgIDogaXNBcnJheShhY3Rpb24pXHJcbiAgICAgID8gdHlwZW9mIGFjdGlvblswXSA9PT0gXCJmdW5jdGlvblwiIHx8IGlzQXJyYXkoYWN0aW9uWzBdKVxyXG4gICAgICAgID8gZGlzcGF0Y2goXHJcbiAgICAgICAgICAgIGFjdGlvblswXSxcclxuICAgICAgICAgICAgdHlwZW9mIGFjdGlvblsxXSA9PT0gXCJmdW5jdGlvblwiID8gYWN0aW9uWzFdKHByb3BzKSA6IGFjdGlvblsxXVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIDogKGJhdGNoKGFjdGlvbi5zbGljZSgxKSkubWFwKGZ1bmN0aW9uKGZ4KSB7XHJcbiAgICAgICAgICAgIGZ4ICYmIGZ4WzBdKGRpc3BhdGNoLCBmeFsxXSlcclxuICAgICAgICAgIH0sIHNldFN0YXRlKGFjdGlvblswXSkpLFxyXG4gICAgICAgICAgc3RhdGUpXHJcbiAgICAgIDogc2V0U3RhdGUoYWN0aW9uKVxyXG4gIH0pXHJcblxyXG4gIHZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGxvY2sgPSBmYWxzZVxyXG4gICAgbm9kZSA9IHBhdGNoKFxyXG4gICAgICBub2RlLnBhcmVudE5vZGUsXHJcbiAgICAgIG5vZGUsXHJcbiAgICAgIHZkb20sXHJcbiAgICAgICh2ZG9tID0gZ2V0VGV4dFZOb2RlKHZpZXcoc3RhdGUpKSksXHJcbiAgICAgIGxpc3RlbmVyXHJcbiAgICApXHJcbiAgICBvbkVuZCgpXHJcbiAgfVxyXG5cclxuICBkaXNwYXRjaChwcm9wcy5pbml0KVxyXG59XHJcbiIsInZhciB0aW1lRnggPSBmdW5jdGlvbiAoZng6IGFueSkge1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoXHJcbiAgICAgICAgYWN0aW9uOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBmeCxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBkZWxheTogcHJvcHMuZGVsYXlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF07XHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IHZhciB0aW1lb3V0ID0gdGltZUZ4KFxyXG5cclxuICAgIGZ1bmN0aW9uIChcclxuICAgICAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRpc3BhdGNoKHByb3BzLmFjdGlvbik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzLmRlbGF5XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuKTtcclxuXHJcbmV4cG9ydCB2YXIgaW50ZXJ2YWwgPSB0aW1lRngoXHJcblxyXG4gICAgZnVuY3Rpb24gKFxyXG4gICAgICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICB2YXIgaWQgPSBzZXRJbnRlcnZhbChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgRGF0ZS5ub3coKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcHMuZGVsYXlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuKTtcclxuXHJcblxyXG4vLyBleHBvcnQgdmFyIG5vd1xyXG4vLyBleHBvcnQgdmFyIHJldHJ5XHJcbi8vIGV4cG9ydCB2YXIgZGVib3VuY2VcclxuLy8gZXhwb3J0IHZhciB0aHJvdHRsZVxyXG4vLyBleHBvcnQgdmFyIGlkbGVDYWxsYmFjaz9cclxuIiwiXHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwQXV0aGVudGljYXRlZFByb3BzXCI7XHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9ja1wiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IElIdHRwT3V0cHV0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBPdXRwdXRcIjtcclxuaW1wb3J0IHsgSUh0dHBTZXF1ZW50aWFsRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cFNlcXVlbnRpYWxGZXRjaEl0ZW1cIjtcclxuXHJcbmNvbnN0IHNlcXVlbnRpYWxIdHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHNlcXVlbnRpYWxCbG9ja3M6IEFycmF5PElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2s+KTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIHdpbGwgcnVuIHNlcXVlbnRpYWxseVxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBpbiBlYWNoIGJsb2NrIHdpbGwgcnVubiBpbiBwYXJhbGxlbFxyXG4gICAgbGV0IGJsb2NrOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrO1xyXG4gICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgbGV0IGh0dHBDYWxsOiBhbnk7XHJcbiAgICBsZXQgbGFzdEh0dHBDYWxsOiBhbnk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IHNlcXVlbnRpYWxCbG9ja3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgICAgYmxvY2sgPSBzZXF1ZW50aWFsQmxvY2tzW2ldO1xyXG5cclxuICAgICAgICBpZiAoYmxvY2sgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGJsb2NrKSkge1xyXG5cclxuICAgICAgICAgICAgaHR0cENhbGwgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZTogcHJvY2Vzc0Jsb2NrLFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxyXG4gICAgICAgICAgICAgICAgYmxvY2s6IGJsb2NrLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGAke2l9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBodHRwQ2FsbCA9IHtcclxuICAgICAgICAgICAgICAgIGRlbGVnYXRlOiBwcm9jZXNzUHJvcHMsXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICBibG9jazogYmxvY2ssXHJcbiAgICAgICAgICAgICAgICBpbmRleDogYCR7aX1gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3VjY2Vzcykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGFzdEh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SHR0cENhbGwgPSBsYXN0SHR0cENhbGw7XHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRJbmRleCA9IGxhc3RIdHRwQ2FsbC5pbmRleDtcclxuICAgICAgICAgICAgaHR0cENhbGwubmV4dEJsb2NrID0gbGFzdEh0dHBDYWxsLmJsb2NrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGFzdEh0dHBDYWxsID0gaHR0cENhbGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgIGh0dHBDYWxsLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICBodHRwQ2FsbC5kaXNwYXRjaCxcclxuICAgICAgICAgICAgaHR0cENhbGwuYmxvY2ssXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgaHR0cENhbGwuaW5kZXhcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBwcm9jZXNzQmxvY2sgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgYmxvY2s6IElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2ssXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBwYXJhbGxlbFByb3BzOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz4gPSBibG9jayBhcyBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz47XHJcbiAgICBjb25zdCBkZWxlZ2F0ZXM6IGFueVtdID0gW107XHJcbiAgICBsZXQgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzO1xyXG5cclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFyYWxsZWxQcm9wcy5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICBwcm9wcyA9IHBhcmFsbGVsUHJvcHNbal07XHJcblxyXG4gICAgICAgIGRlbGVnYXRlcy5wdXNoKFxyXG4gICAgICAgICAgICBwcm9jZXNzUHJvcHMoXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgUHJvbWlzZVxyXG4gICAgICAgICAgICAuYWxsKGRlbGVnYXRlcylcclxuICAgICAgICAgICAgLnRoZW4oKVxyXG4gICAgICAgICAgICAuY2F0Y2goKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NQcm9wcyA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMsXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghcHJvcHMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0OiBJSHR0cE91dHB1dCA9IHtcclxuICAgICAgICBvazogZmFsc2UsXHJcbiAgICAgICAgdXJsOiBwcm9wcy51cmwsXHJcbiAgICAgICAgYXV0aGVudGljYXRpb25GYWlsOiBmYWxzZSxcclxuICAgICAgICBwYXJzZVR5cGU6IFwidGV4dFwiLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dCxcclxuICAgICAgICBuZXh0RGVsZWdhdGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBodHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXByb3BzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dHB1dDogSUh0dHBPdXRwdXQgPSB7XHJcbiAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgIHVybDogcHJvcHMudXJsLFxyXG4gICAgICAgIGF1dGhlbnRpY2F0aW9uRmFpbDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBwcm9wcy5wYXJzZVR5cGUgPz8gJ2pzb24nLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGh0dHAgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzLFxyXG4gICAgb3V0cHV0OiBJSHR0cE91dHB1dCxcclxuICAgIG5leHREZWxlZ2F0ZTogYW55ID0gbnVsbCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGZldGNoKFxyXG4gICAgICAgIHByb3BzLnVybCxcclxuICAgICAgICBwcm9wcy5vcHRpb25zKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3V0cHV0Lm9rID0gcmVzcG9uc2Uub2sgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnR5cGUgPSByZXNwb25zZS50eXBlO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnJlZGlyZWN0ZWQgPSByZXNwb25zZS5yZWRpcmVjdGVkO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5jYWxsSUQgPSByZXNwb25zZS5oZWFkZXJzLmdldChcIkNhbGxJRFwiKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIikgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3V0cHV0LmNvbnRlbnRUeXBlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHB1dC5jb250ZW50VHlwZS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSAhPT0gLTEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wYXJzZVR5cGUgPSBcImpzb25cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5hdXRoZW50aWNhdGlvbkZhaWwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25BdXRoZW50aWNhdGlvbkZhaWxBY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5yZXNwb25zZU51bGwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuZXJyb3IgKz0gYEVycm9yIHRocm93biB3aXRoIHJlc3BvbnNlLnRleHQoKVxyXG5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQudGV4dERhdGEgPSByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0XHJcbiAgICAgICAgICAgICAgICAmJiBvdXRwdXQucGFyc2VUeXBlID09PSAnanNvbidcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuanNvbkRhdGEgPSBKU09OLnBhcnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmVycm9yICs9IGBFcnJvciB0aHJvd24gcGFyc2luZyByZXNwb25zZS50ZXh0KCkgYXMganNvblxyXG5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW91dHB1dC5vaykge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXh0RGVsZWdhdGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dERlbGVnYXRlLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZS5kaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuYmxvY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuaW5kZXhcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgIG91dHB1dC5lcnJvciArPSBlcnJvcjtcclxuXHJcbiAgICAgICAgICAgIGRpc3BhdGNoKFxyXG4gICAgICAgICAgICAgICAgcHJvcHMuZXJyb3IsXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdIdHRwID0gKHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyk6IElIdHRwRmV0Y2hJdGVtID0+IHtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIGh0dHBFZmZlY3QsXHJcbiAgICAgICAgcHJvcHNcclxuICAgIF1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdTZXF1ZW50aWFsSHR0cCA9IChwcm9wc0Jsb2NrOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrPik6IElIdHRwU2VxdWVudGlhbEZldGNoSXRlbSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzZXF1ZW50aWFsSHR0cEVmZmVjdCxcclxuICAgICAgICBwcm9wc0Jsb2NrXHJcbiAgICBdXHJcbn1cclxuIiwiXHJcbmNvbnN0IEtleXMgPSB7XHJcblxyXG4gICAgc3RhcnRVcmw6ICdzdGFydFVybCcsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEtleXM7XHJcblxyXG4iLCJpbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHR0cEVmZmVjdCBpbXBsZW1lbnRzIElIdHRwRWZmZWN0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdXJsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBQYXJzZVR5cGUsXHJcbiAgICAgICAgYWN0aW9uRGVsZWdhdGU6IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSkge1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgICAgIHRoaXMucGFyc2VUeXBlID0gcGFyc2VUeXBlO1xyXG4gICAgICAgIHRoaXMuYWN0aW9uRGVsZWdhdGUgPSBhY3Rpb25EZWxlZ2F0ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIHVybDogc3RyaW5nO1xyXG4gICAgcHVibGljIHBhcnNlVHlwZTogUGFyc2VUeXBlO1xyXG4gICAgcHVibGljIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXk7XHJcbn1cclxuIiwiXHJcblxyXG5jb25zdCBnVXRpbGl0aWVzID0ge1xyXG5cclxuICAgIHJvdW5kVXBUb05lYXJlc3RUZW46ICh2YWx1ZTogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZsb29yID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChmbG9vciArIDEpICogMTA7XHJcbiAgICB9LFxyXG5cclxuICAgIHJvdW5kRG93blRvTmVhcmVzdFRlbjogKHZhbHVlOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZmxvb3IgPSBNYXRoLmZsb29yKHZhbHVlIC8gMTApO1xyXG5cclxuICAgICAgICByZXR1cm4gZmxvb3IgKiAxMDtcclxuICAgIH0sXHJcblxyXG4gICAgY29udmVydE1tVG9GZWV0SW5jaGVzOiAobW06IG51bWJlcik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGluY2hlcyA9IG1tICogMC4wMzkzNztcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMuY29udmVydEluY2hlc1RvRmVldEluY2hlcyhpbmNoZXMpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbmRleE9mQW55OiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBjaGFyczogc3RyaW5nW10sXHJcbiAgICAgICAgc3RhcnRJbmRleCA9IDBcclxuICAgICk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFycy5pbmNsdWRlcyhpbnB1dFtpXSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXREaXJlY3Rvcnk6IChmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBmaWxlUGF0aC5tYXRjaCgvKC4qKVtcXC9cXFxcXS8pO1xyXG5cclxuICAgICAgICBpZiAobWF0Y2hlc1xyXG4gICAgICAgICAgICAmJiBtYXRjaGVzLmxlbmd0aCA+IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNbMV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvdW50Q2hhcmFjdGVyOiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBjaGFyYWN0ZXI6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dFtpXSA9PT0gY2hhcmFjdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbnZlcnRJbmNoZXNUb0ZlZXRJbmNoZXM6IChpbmNoZXM6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZlZXQgPSBNYXRoLmZsb29yKGluY2hlcyAvIDEyKTtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmcgPSBpbmNoZXMgJSAxMjtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmdSb3VuZGVkID0gTWF0aC5yb3VuZChpbmNoZXNSZWFtaW5pbmcgKiAxMCkgLyAxMDsgLy8gMSBkZWNpbWFsIHBsYWNlc1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBpZiAoZmVldCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGAke2ZlZXR9JyBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluY2hlc1JlYW1pbmluZ1JvdW5kZWQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBgJHtyZXN1bHR9JHtpbmNoZXNSZWFtaW5pbmdSb3VuZGVkfVwiYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTnVsbE9yV2hpdGVTcGFjZTogKGlucHV0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dCA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucHV0ID0gYCR7aW5wdXR9YDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0Lm1hdGNoKC9eXFxzKiQvKSAhPT0gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tBcnJheXNFcXVhbDogKGE6IHN0cmluZ1tdLCBiOiBzdHJpbmdbXSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoYSA9PT0gYikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYSA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBiID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3QgY2FyZSBhYm91dCB0aGUgb3JkZXIgb2YgdGhlIGVsZW1lbnRzIGluc2lkZVxyXG4gICAgICAgIC8vIHRoZSBhcnJheSwgeW91IHNob3VsZCBzb3J0IGJvdGggYXJyYXlzIGhlcmUuXHJcbiAgICAgICAgLy8gUGxlYXNlIG5vdGUgdGhhdCBjYWxsaW5nIHNvcnQgb24gYW4gYXJyYXkgd2lsbCBtb2RpZnkgdGhhdCBhcnJheS5cclxuICAgICAgICAvLyB5b3UgbWlnaHQgd2FudCB0byBjbG9uZSB5b3VyIGFycmF5IGZpcnN0LlxyXG5cclxuICAgICAgICBjb25zdCB4OiBzdHJpbmdbXSA9IFsuLi5hXTtcclxuICAgICAgICBjb25zdCB5OiBzdHJpbmdbXSA9IFsuLi5iXTtcclxuXHJcbiAgICAgICAgeC5zb3J0KCk7XHJcbiAgICAgICAgeS5zb3J0KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhbaV0gIT09IHlbaV0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaHVmZmxlKGFycmF5OiBBcnJheTxhbnk+KTogQXJyYXk8YW55PiB7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50SW5kZXggPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHRlbXBvcmFyeVZhbHVlOiBhbnlcclxuICAgICAgICBsZXQgcmFuZG9tSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgICAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xyXG4gICAgICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhcnJheTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoaW5wdXQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIWlzTmFOKGlucHV0KTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNOZWdhdGl2ZU51bWVyaWM6IChpbnB1dDogYW55KTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZ1V0aWxpdGllcy5pc051bWVyaWMoaW5wdXQpKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gK2lucHV0IDwgMDsgLy8gKyBjb252ZXJ0cyBhIHN0cmluZyB0byBhIG51bWJlciBpZiBpdCBjb25zaXN0cyBvbmx5IG9mIGRpZ2l0cy5cclxuICAgIH0sXHJcblxyXG4gICAgaGFzRHVwbGljYXRlczogPFQ+KGlucHV0OiBBcnJheTxUPik6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAobmV3IFNldChpbnB1dCkuc2l6ZSAhPT0gaW5wdXQubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgZXh0ZW5kOiA8VD4oYXJyYXkxOiBBcnJheTxUPiwgYXJyYXkyOiBBcnJheTxUPik6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBhcnJheTIuZm9yRWFjaCgoaXRlbTogVCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgYXJyYXkxLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXR0eVByaW50SnNvbkZyb21TdHJpbmc6IChpbnB1dDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMucHJldHR5UHJpbnRKc29uRnJvbU9iamVjdChKU09OLnBhcnNlKGlucHV0KSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXR0eVByaW50SnNvbkZyb21PYmplY3Q6IChpbnB1dDogb2JqZWN0IHwgbnVsbCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgNCAvLyBpbmRlbnRlZCA0IHNwYWNlc1xyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzUG9zaXRpdmVOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdW1lcmljKGlucHV0KSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE51bWJlcihpbnB1dCkgPj0gMDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0VGltZTogKCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdzogRGF0ZSA9IG5ldyBEYXRlKERhdGUubm93KCkpO1xyXG4gICAgICAgIGNvbnN0IHRpbWU6IHN0cmluZyA9IGAke25vdy5nZXRGdWxsWWVhcigpfS0keyhub3cuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0tJHtub3cuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0gJHtub3cuZ2V0SG91cnMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7bm93LmdldE1pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7bm93LmdldFNlY29uZHMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9Ojoke25vdy5nZXRNaWxsaXNlY29uZHMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDMsICcwJyl9OmA7XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdEJ5TmV3TGluZTogKGlucHV0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGlucHV0LnNwbGl0KC9bXFxyXFxuXSsvKTtcclxuICAgICAgICBjb25zdCBjbGVhbmVkOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZSh2YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGVhbmVkLnB1c2godmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gY2xlYW5lZDtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRCeVBpcGU6IChpbnB1dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBpbnB1dC5zcGxpdCgnfCcpO1xyXG4gICAgICAgIGNvbnN0IGNsZWFuZWQ6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKHZhbHVlKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNsZWFuZWQucHVzaCh2YWx1ZS50cmltKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjbGVhbmVkO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdEJ5TmV3TGluZUFuZE9yZGVyOiAoaW5wdXQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gZ1V0aWxpdGllc1xyXG4gICAgICAgICAgICAuc3BsaXRCeU5ld0xpbmUoaW5wdXQpXHJcbiAgICAgICAgICAgIC5zb3J0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGpvaW5CeU5ld0xpbmU6IChpbnB1dDogQXJyYXk8c3RyaW5nPik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXRcclxuICAgICAgICAgICAgfHwgaW5wdXQubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQuam9pbignXFxuJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZUFsbENoaWxkcmVuOiAocGFyZW50OiBFbGVtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGlzT2RkOiAoeDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiB4ICUgMiA9PT0gMTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvcnRQcmludFRleHQ6IChcclxuICAgICAgICBpbnB1dDogc3RyaW5nLFxyXG4gICAgICAgIG1heExlbmd0aDogbnVtYmVyID0gMTAwKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3ROZXdMaW5lSW5kZXg6IG51bWJlciA9IGdVdGlsaXRpZXMuZ2V0Rmlyc3ROZXdMaW5lSW5kZXgoaW5wdXQpO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3ROZXdMaW5lSW5kZXggPiAwXHJcbiAgICAgICAgICAgICYmIGZpcnN0TmV3TGluZUluZGV4IDw9IG1heExlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gaW5wdXQuc3Vic3RyKDAsIGZpcnN0TmV3TGluZUluZGV4IC0gMSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1V0aWxpdGllcy50cmltQW5kQWRkRWxsaXBzaXMob3V0cHV0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPD0gbWF4TGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRwdXQgPSBpbnB1dC5zdWJzdHIoMCwgbWF4TGVuZ3RoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMudHJpbUFuZEFkZEVsbGlwc2lzKG91dHB1dCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRyaW1BbmRBZGRFbGxpcHNpczogKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0cHV0OiBzdHJpbmcgPSBpbnB1dC50cmltKCk7XHJcbiAgICAgICAgbGV0IHB1bmN0dWF0aW9uUmVnZXg6IFJlZ0V4cCA9IC9bLixcXC8jISQlXFxeJlxcKjs6e309XFwtX2B+KCldL2c7XHJcbiAgICAgICAgbGV0IHNwYWNlUmVnZXg6IFJlZ0V4cCA9IC9cXFcrL2c7XHJcbiAgICAgICAgbGV0IGxhc3RDaGFyYWN0ZXI6IHN0cmluZyA9IG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGxldCBsYXN0Q2hhcmFjdGVySXNQdW5jdHVhdGlvbjogYm9vbGVhbiA9XHJcbiAgICAgICAgICAgIHB1bmN0dWF0aW9uUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKVxyXG4gICAgICAgICAgICB8fCBzcGFjZVJlZ2V4LnRlc3QobGFzdENoYXJhY3Rlcik7XHJcblxyXG5cclxuICAgICAgICB3aGlsZSAobGFzdENoYXJhY3RlcklzUHVuY3R1YXRpb24gPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5zdWJzdHIoMCwgb3V0cHV0Lmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBsYXN0Q2hhcmFjdGVyID0gb3V0cHV0W291dHB1dC5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgICAgIGxhc3RDaGFyYWN0ZXJJc1B1bmN0dWF0aW9uID1cclxuICAgICAgICAgICAgICAgIHB1bmN0dWF0aW9uUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKVxyXG4gICAgICAgICAgICAgICAgfHwgc3BhY2VSZWdleC50ZXN0KGxhc3RDaGFyYWN0ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGAke291dHB1dH0uLi5gO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGaXJzdE5ld0xpbmVJbmRleDogKGlucHV0OiBzdHJpbmcpOiBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgICBsZXQgY2hhcmFjdGVyOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGlucHV0W2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNoYXJhY3RlciA9PT0gJ1xcbidcclxuICAgICAgICAgICAgICAgIHx8IGNoYXJhY3RlciA9PT0gJ1xccicpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cHBlckNhc2VGaXJzdExldHRlcjogKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBpbnB1dC5zbGljZSgxKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2VuZXJhdGVHdWlkOiAodXNlSHlwZW5zOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICBsZXQgZDIgPSAocGVyZm9ybWFuY2VcclxuICAgICAgICAgICAgJiYgcGVyZm9ybWFuY2Uubm93XHJcbiAgICAgICAgICAgICYmIChwZXJmb3JtYW5jZS5ub3coKSAqIDEwMDApKSB8fCAwO1xyXG5cclxuICAgICAgICBsZXQgcGF0dGVybiA9ICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnO1xyXG5cclxuICAgICAgICBpZiAoIXVzZUh5cGVucykge1xyXG4gICAgICAgICAgICBwYXR0ZXJuID0gJ3h4eHh4eHh4eHh4eDR4eHh5eHh4eHh4eHh4eHh4eHh4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGd1aWQgPSBwYXR0ZXJuXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgL1t4eV0vZyxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChjKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCByID0gTWF0aC5yYW5kb20oKSAqIDE2O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSAoZCArIHIpICUgMTYgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSAoZDIgKyByKSAlIDE2IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDIgPSBNYXRoLmZsb29yKGQyIC8gMTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChjID09PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBndWlkO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja0lmQ2hyb21lOiAoKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIC8vIHBsZWFzZSBub3RlLCBcclxuICAgICAgICAvLyB0aGF0IElFMTEgbm93IHJldHVybnMgdW5kZWZpbmVkIGFnYWluIGZvciB3aW5kb3cuY2hyb21lXHJcbiAgICAgICAgLy8gYW5kIG5ldyBPcGVyYSAzMCBvdXRwdXRzIHRydWUgZm9yIHdpbmRvdy5jaHJvbWVcclxuICAgICAgICAvLyBidXQgbmVlZHMgdG8gY2hlY2sgaWYgd2luZG93Lm9wciBpcyBub3QgdW5kZWZpbmVkXHJcbiAgICAgICAgLy8gYW5kIG5ldyBJRSBFZGdlIG91dHB1dHMgdG8gdHJ1ZSBub3cgZm9yIHdpbmRvdy5jaHJvbWVcclxuICAgICAgICAvLyBhbmQgaWYgbm90IGlPUyBDaHJvbWUgY2hlY2tcclxuICAgICAgICAvLyBzbyB1c2UgdGhlIGJlbG93IHVwZGF0ZWQgY29uZGl0aW9uXHJcblxyXG4gICAgICAgIGxldCB0c1dpbmRvdzogYW55ID0gd2luZG93IGFzIGFueTtcclxuICAgICAgICBsZXQgaXNDaHJvbWl1bSA9IHRzV2luZG93LmNocm9tZTtcclxuICAgICAgICBsZXQgd2luTmF2ID0gd2luZG93Lm5hdmlnYXRvcjtcclxuICAgICAgICBsZXQgdmVuZG9yTmFtZSA9IHdpbk5hdi52ZW5kb3I7XHJcbiAgICAgICAgbGV0IGlzT3BlcmEgPSB0eXBlb2YgdHNXaW5kb3cub3ByICE9PSBcInVuZGVmaW5lZFwiO1xyXG4gICAgICAgIGxldCBpc0lFZWRnZSA9IHdpbk5hdi51c2VyQWdlbnQuaW5kZXhPZihcIkVkZ2VcIikgPiAtMTtcclxuICAgICAgICBsZXQgaXNJT1NDaHJvbWUgPSB3aW5OYXYudXNlckFnZW50Lm1hdGNoKFwiQ3JpT1NcIik7XHJcblxyXG4gICAgICAgIGlmIChpc0lPU0Nocm9tZSkge1xyXG4gICAgICAgICAgICAvLyBpcyBHb29nbGUgQ2hyb21lIG9uIElPU1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNDaHJvbWl1bSAhPT0gbnVsbFxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgaXNDaHJvbWl1bSAhPT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgICAgICAgICAmJiB2ZW5kb3JOYW1lID09PSBcIkdvb2dsZSBJbmMuXCJcclxuICAgICAgICAgICAgJiYgaXNPcGVyYSA9PT0gZmFsc2VcclxuICAgICAgICAgICAgJiYgaXNJRWVkZ2UgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIC8vIGlzIEdvb2dsZSBDaHJvbWVcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnVXRpbGl0aWVzOyIsImltcG9ydCBJSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5VXJsXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGlzdG9yeVVybCBpbXBsZW1lbnRzIElIaXN0b3J5VXJsIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZykge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlclNuYXBTaG90IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSVJlbmRlclNuYXBTaG90XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyU25hcFNob3QgaW1wbGVtZW50cyBJUmVuZGVyU25hcFNob3Qge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxuICAgIHB1YmxpYyBndWlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBjcmVhdGVkOiBEYXRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgbW9kaWZpZWQ6IERhdGUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBleHBhbmRlZE9wdGlvbklEczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgcHVibGljIGV4cGFuZGVkQW5jaWxsYXJ5SURzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbn1cclxuIiwiaW1wb3J0IElVcmxBc3NlbWJsZXIgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JVXJsQXNzZW1ibGVyXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9IaXN0b3J5VXJsXCI7XHJcbmltcG9ydCBSZW5kZXJTbmFwU2hvdCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9SZW5kZXJTbmFwU2hvdFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkVXJsRnJvbVJvb3QgPSAocm9vdDogSVJlbmRlckZyYWdtZW50KTogc3RyaW5nID0+IHtcclxuXHJcbiAgICBjb25zdCB1cmxBc3NlbWJsZXI6IElVcmxBc3NlbWJsZXIgPSB7XHJcblxyXG4gICAgICAgIHVybDogYCR7bG9jYXRpb24ub3JpZ2lufSR7bG9jYXRpb24ucGF0aG5hbWV9P2BcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJvb3Quc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVybEFzc2VtYmxlci51cmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpbnRTZWdtZW50RW5kKFxyXG4gICAgICAgIHVybEFzc2VtYmxlcixcclxuICAgICAgICByb290XHJcbiAgICApXHJcblxyXG4gICAgcmV0dXJuIHVybEFzc2VtYmxlci51cmw7XHJcbn07XHJcblxyXG5jb25zdCBwcmludFNlZ21lbnRFbmQgPSAoXHJcbiAgICB1cmxBc3NlbWJsZXI6IElVcmxBc3NlbWJsZXIsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH1+JHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcblxyXG4gICAgICAgIHByaW50U2VnbWVudEVuZChcclxuICAgICAgICAgICAgdXJsQXNzZW1ibGVyLFxyXG4gICAgICAgICAgICBmcmFnbWVudC5saW5rLnJvb3QsXHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmV4aXRLZXkpKSB7XHJcblxyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH1fJHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghZnJhZ21lbnQubGlua1xyXG4gICAgICAgICYmICFmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IHVybEFzc2VtYmxlci51cmw7XHJcbiAgICAgICAgdXJsID0gYCR7dXJsfS0ke2ZyYWdtZW50LmlkfWA7XHJcbiAgICAgICAgdXJsQXNzZW1ibGVyLnVybCA9IHVybDtcclxuICAgIH1cclxuXHJcbiAgICBwcmludFNlZ21lbnRFbmQoXHJcbiAgICAgICAgdXJsQXNzZW1ibGVyLFxyXG4gICAgICAgIGZyYWdtZW50LnNlbGVjdGVkLFxyXG4gICAgKVxyXG59O1xyXG5cclxuXHJcbmNvbnN0IGdIaXN0b3J5Q29kZSA9IHtcclxuXHJcbiAgICByZXNldFJhdzogKCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5hdXRvZm9jdXMgPSB0cnVlO1xyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmlzQXV0b2ZvY3VzRmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBwdXNoQnJvd3Nlckhpc3RvcnlTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50U2VjdGlvbj8uY3VycmVudFxyXG4gICAgICAgICAgICB8fCAhc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdIaXN0b3J5Q29kZS5yZXNldFJhdygpO1xyXG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xyXG4gICAgICAgIGxldCBsYXN0VXJsOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5zdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgbGFzdFVybCA9IHdpbmRvdy5oaXN0b3J5LnN0YXRlLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxhc3RVcmwgPSBgJHtsb2NhdGlvbi5vcmlnaW59JHtsb2NhdGlvbi5wYXRobmFtZX0ke2xvY2F0aW9uLnNlYXJjaH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gYnVpbGRVcmxGcm9tUm9vdChzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUucm9vdCk7XHJcblxyXG4gICAgICAgIGlmIChsYXN0VXJsXHJcbiAgICAgICAgICAgICYmIHVybCA9PT0gbGFzdFVybCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShcclxuICAgICAgICAgICAgbmV3IFJlbmRlclNuYXBTaG90KHVybCksXHJcbiAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgIHVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLnN0ZXBIaXN0b3J5Lmhpc3RvcnlDaGFpbi5wdXNoKG5ldyBIaXN0b3J5VXJsKHVybCkpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0hpc3RvcnlDb2RlO1xyXG5cclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJQWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lBY3Rpb25cIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IEh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL3N0YXRlL2VmZmVjdHMvSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0hpc3RvcnlDb2RlIGZyb20gXCIuL2dIaXN0b3J5Q29kZVwiO1xyXG5cclxubGV0IGNvdW50ID0gMDtcclxuXHJcbmNvbnN0IGdTdGF0ZUNvZGUgPSB7XHJcblxyXG4gICAgc2V0RGlydHk6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLnJhdyA9IGZhbHNlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID0gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyZXNoS2V5SW50OiAoc3RhdGU6IElTdGF0ZSk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5leHRLZXkgPSArK3N0YXRlLm5leHRLZXk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXh0S2V5O1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmVzaEtleTogKHN0YXRlOiBJU3RhdGUpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7Z1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSl9YDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0R3VpZEtleTogKCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBVLmdlbmVyYXRlR3VpZCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZVN0YXRlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnSGlzdG9yeUNvZGUucHVzaEJyb3dzZXJIaXN0b3J5U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5ld1N0YXRlOiBJU3RhdGUgPSB7IC4uLnN0YXRlIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgIH0sXHJcblxyXG4gICAgQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHBhcnNlVHlwZTogUGFyc2VUeXBlLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXlcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG5cclxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh1cmwuZW5kc1dpdGgoJ2lteW82QzA4SC5odG1sJykpIHtcclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVmZmVjdDogSUh0dHBFZmZlY3QgfCB1bmRlZmluZWQgPSBzdGF0ZVxyXG4gICAgICAgICAgICAucmVwZWF0RWZmZWN0c1xyXG4gICAgICAgICAgICAucmVMb2FkR2V0SHR0cEltbWVkaWF0ZVxyXG4gICAgICAgICAgICAuZmluZCgoZWZmZWN0OiBJSHR0cEVmZmVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBlZmZlY3QubmFtZSA9PT0gbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICYmIGVmZmVjdC51cmwgPT09IHVybDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChlZmZlY3QpIHsgLy8gYWxyZWFkeSBhZGRlZC5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaHR0cEVmZmVjdDogSUh0dHBFZmZlY3QgPSBuZXcgSHR0cEVmZmVjdChcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBwYXJzZVR5cGUsXHJcbiAgICAgICAgICAgIGFjdGlvbkRlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlLnB1c2goaHR0cEVmZmVjdCk7XHJcbiAgICB9LFxyXG5cclxuICAgIEFkZFJ1bkFjdGlvbkltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgYWN0aW9uRGVsZWdhdGU6IElBY3Rpb24pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5ydW5BY3Rpb25JbW1lZGlhdGUucHVzaChhY3Rpb25EZWxlZ2F0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldENhY2hlZF9vdXRsaW5lTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgKTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudElEKSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50SUQgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSA/PyBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk91dGxpbmVOb2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmVOb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjYWNoZV9vdXRsaW5lTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVLZXkoXHJcbiAgICAgICAgICAgIGxpbmtJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUuaVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSA9IG91dGxpbmVOb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZWRfY2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgKTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudElEKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50SUQgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkW2tleV0gPz8gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2FjaGVfY2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVuZGVyRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXJlbmRlckZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVLZXlGcm9tRnJhZ21lbnQocmVuZGVyRnJhZ21lbnQpO1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uoa2V5KSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWRba2V5IGFzIHN0cmluZ10pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWRba2V5IGFzIHN0cmluZ10gPSByZW5kZXJGcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2FjaGVLZXlGcm9tRnJhZ21lbnQ6IChyZW5kZXJGcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICByZW5kZXJGcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuaWRcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZUtleTogKFxyXG5cclxuICAgICAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgICAgICBmcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgJHtsaW5rSUR9XyR7ZnJhZ21lbnRJRH1gO1xyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdTdGF0ZUNvZGU7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdBdXRoZW50aWNhdGlvbkNvZGUgPSB7XHJcblxyXG4gICAgY2xlYXJBdXRoZW50aWNhdGlvbjogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUudXNlci5hdXRob3Jpc2VkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhdGUudXNlci5uYW1lID0gXCJcIjtcclxuICAgICAgICBzdGF0ZS51c2VyLnN1YiA9IFwiXCI7XHJcbiAgICAgICAgc3RhdGUudXNlci5sb2dvdXRVcmwgPSBcIlwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uQ29kZTtcclxuIiwiXHJcbmV4cG9ydCBlbnVtIEFjdGlvblR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBGaWx0ZXJUb3BpY3MgPSAnZmlsdGVyVG9waWNzJyxcclxuICAgIEdldFRvcGljID0gJ2dldFRvcGljJyxcclxuICAgIEdldFRvcGljQW5kUm9vdCA9ICdnZXRUb3BpY0FuZFJvb3QnLFxyXG4gICAgU2F2ZUFydGljbGVTY2VuZSA9ICdzYXZlQXJ0aWNsZVNjZW5lJyxcclxuICAgIEdldFJvb3QgPSAnZ2V0Um9vdCcsXHJcbiAgICBHZXRTdGVwID0gJ2dldFN0ZXAnLFxyXG4gICAgR2V0UGFnZSA9ICdnZXRQYWdlJyxcclxuICAgIEdldENoYWluID0gJ2dldENoYWluJyxcclxuICAgIEdldE91dGxpbmUgPSAnZ2V0T3V0bGluZScsXHJcbiAgICBHZXRGcmFnbWVudCA9ICdnZXRGcmFnbWVudCcsXHJcbiAgICBHZXRDaGFpbkZyYWdtZW50ID0gJ2dldENoYWluRnJhZ21lbnQnXHJcbn1cclxuXHJcbiIsImltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgZ0FqYXhIZWFkZXJDb2RlID0ge1xyXG5cclxuICAgIGJ1aWxkSGVhZGVyczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2FsbElEOiBzdHJpbmcsXHJcbiAgICAgICAgYWN0aW9uOiBBY3Rpb25UeXBlKTogSGVhZGVycyA9PiB7XHJcblxyXG4gICAgICAgIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnWC1DU1JGJywgJzEnKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnU3Vic2NyaXB0aW9uSUQnLCBzdGF0ZS5zZXR0aW5ncy5zdWJzY3JpcHRpb25JRCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0NhbGxJRCcsIGNhbGxJRCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0FjdGlvbicsIGFjdGlvbik7XHJcblxyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCd3aXRoQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xyXG5cclxuICAgICAgICByZXR1cm4gaGVhZGVycztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdBamF4SGVhZGVyQ29kZTtcclxuXHJcbiIsImltcG9ydCB7IGdBdXRoZW50aWNhdGVkSHR0cCB9IGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkh0dHBcIjtcclxuXHJcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4vZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25BY3Rpb25zIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkFjdGlvbnNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBnQXV0aGVudGljYXRpb25FZmZlY3RzID0ge1xyXG5cclxuICAgIGNoZWNrVXNlckF1dGhlbnRpY2F0ZWQ6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbGxJRDogc3RyaW5nID0gVS5nZW5lcmF0ZUd1aWQoKTtcclxuXHJcbiAgICAgICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgY2FsbElELFxyXG4gICAgICAgICAgICBBY3Rpb25UeXBlLk5vbmVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3N0YXRlLnNldHRpbmdzLmJmZlVybH0vJHtzdGF0ZS5zZXR0aW5ncy51c2VyUGF0aH0/c2xpZGU9ZmFsc2VgO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVzcG9uc2U6ICdqc29uJyxcclxuICAgICAgICAgICAgYWN0aW9uOiBnQXV0aGVudGljYXRpb25BY3Rpb25zLmxvYWRTdWNjZXNzZnVsQXV0aGVudGljYXRpb24sXHJcbiAgICAgICAgICAgIGVycm9yOiAoc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIHRyeWluZyB0byBhdXRoZW50aWNhdGUgd2l0aCB0aGUgc2VydmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dBdXRoZW50aWNhdGlvbkVmZmVjdHMuY2hlY2tVc2VyQXV0aGVudGljYXRlZC5uYW1lfSxcclxuICAgICAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQoYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciB0cnlpbmcgdG8gYXV0aGVudGljYXRlIHdpdGggdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cy5jaGVja1VzZXJBdXRoZW50aWNhdGVkLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YXRlXCI6ICR7SlNPTi5zdHJpbmdpZnkoc3RhdGUpfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQXV0aGVudGljYXRpb25FZmZlY3RzO1xyXG4iLCJpbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IEtleXMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvY29uc3RhbnRzL0tleXNcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkNvZGUgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uQ29kZVwiO1xyXG5pbXBvcnQgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cyBmcm9tIFwiLi9nQXV0aGVudGljYXRpb25FZmZlY3RzXCI7XHJcblxyXG5cclxuY29uc3QgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucyA9IHtcclxuXHJcbiAgICBsb2FkU3VjY2Vzc2Z1bEF1dGhlbnRpY2F0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55KTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFyZXNwb25zZVxyXG4gICAgICAgICAgICB8fCByZXNwb25zZS5wYXJzZVR5cGUgIT09IFwianNvblwiXHJcbiAgICAgICAgICAgIHx8ICFyZXNwb25zZS5qc29uRGF0YSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xhaW1zOiBhbnkgPSByZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgbmFtZTogYW55ID0gY2xhaW1zLmZpbmQoXHJcbiAgICAgICAgICAgIChjbGFpbTogYW55KSA9PiBjbGFpbS50eXBlID09PSAnbmFtZSdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBzdWI6IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ3N1YidcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIW5hbWVcclxuICAgICAgICAgICAgJiYgIXN1Yikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9nb3V0VXJsQ2xhaW06IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ2JmZjpsb2dvdXRfdXJsJ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghbG9nb3V0VXJsQ2xhaW1cclxuICAgICAgICAgICAgfHwgIWxvZ291dFVybENsYWltLnZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS51c2VyLmF1dGhvcmlzZWQgPSB0cnVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubmFtZSA9IG5hbWUudmFsdWU7XHJcbiAgICAgICAgc3RhdGUudXNlci5zdWIgPSBzdWIudmFsdWU7XHJcbiAgICAgICAgc3RhdGUudXNlci5sb2dvdXRVcmwgPSBsb2dvdXRVcmxDbGFpbS52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrVXNlckxvZ2dlZEluOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvcHM6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5jaGVja1VzZXJMb2dnZWRJblByb3BzKHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFwcm9wcykge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHByb3BzXHJcbiAgICAgICAgXTtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tVc2VyTG9nZ2VkSW5Qcm9wczogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnVzZXIucmF3ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiBnQXV0aGVudGljYXRpb25FZmZlY3RzLmNoZWNrVXNlckF1dGhlbnRpY2F0ZWQoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2dpbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuXHJcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcclxuICAgICAgICAgICAgS2V5cy5zdGFydFVybCxcclxuICAgICAgICAgICAgY3VycmVudFVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7c3RhdGUuc2V0dGluZ3MuYmZmVXJsfS8ke3N0YXRlLnNldHRpbmdzLmRlZmF1bHRMb2dpblBhdGh9P3JldHVyblVybD0vYDtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKHVybCk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJBdXRoZW50aWNhdGlvbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcbiAgICAgICAgZ0F1dGhlbnRpY2F0aW9uQ29kZS5jbGVhckF1dGhlbnRpY2F0aW9uKHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb25BbmRTaG93TG9naW46IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnQXV0aGVudGljYXRpb25Db2RlLmNsZWFyQXV0aGVudGljYXRpb24oc3RhdGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5sb2dpbihzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvZ291dDogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24oc3RhdGUudXNlci5sb2dvdXRVcmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQXV0aGVudGljYXRpb25BY3Rpb25zO1xyXG4iLCJpbXBvcnQgeyBnSHR0cCB9IGZyb20gXCIuL2dIdHRwXCI7XHJcblxyXG5pbXBvcnQgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1wiO1xyXG5pbXBvcnQgSUh0dHBQcm9wcyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwUHJvcHNcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uQWN0aW9uc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnQXV0aGVudGljYXRlZEh0dHAocHJvcHM6IElIdHRwUHJvcHMpOiBhbnkge1xyXG5cclxuICAgIGNvbnN0IGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgPSBwcm9wcyBhcyBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcztcclxuXHJcbiAgICAvLyAvLyBUbyByZWdpc3RlciBmYWlsZWQgYXV0aGVudGljYXRpb25cclxuICAgIC8vIGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllcy5vbkF1dGhlbnRpY2F0aW9uRmFpbEFjdGlvbiA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2xlYXJBdXRoZW50aWNhdGlvbjtcclxuXHJcbiAgICAvLyBUbyByZWdpc3RlciBmYWlsZWQgYXV0aGVudGljYXRpb24gYW5kIHNob3cgbG9naW4gcGFnZVxyXG4gICAgaHR0cEF1dGhlbnRpY2F0ZWRQcm9wZXJ0aWVzLm9uQXV0aGVudGljYXRpb25GYWlsQWN0aW9uID0gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5jbGVhckF1dGhlbnRpY2F0aW9uQW5kU2hvd0xvZ2luO1xyXG5cclxuICAgIHJldHVybiBnSHR0cChodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXMpO1xyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcblxyXG5jb25zdCBydW5BY3Rpb25Jbm5lciA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogYW55KTogdm9pZCA9PiB7XHJcblxyXG4gICAgZGlzcGF0Y2goXHJcbiAgICAgICAgcHJvcHMuYWN0aW9uLFxyXG4gICAgKTtcclxufTtcclxuXHJcblxyXG5jb25zdCBydW5BY3Rpb24gPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVldWVkRWZmZWN0czogQXJyYXk8SUFjdGlvbj5cclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGNvbnN0IGVmZmVjdHM6IGFueVtdID0gW107XHJcblxyXG4gICAgcXVldWVkRWZmZWN0cy5mb3JFYWNoKChhY3Rpb246IElBY3Rpb24pID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvcHMgPSB7XHJcbiAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICBlcnJvcjogKF9zdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgcnVubmluZyBhY3Rpb24gaW4gcmVwZWF0QWN0aW9uc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke3J1bkFjdGlvbn0sXHJcbiAgICAgICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJFcnJvciBydW5uaW5nIGFjdGlvbiBpbiByZXBlYXRBY3Rpb25zXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIGVmZmVjdHMucHVzaChbXHJcbiAgICAgICAgICAgIHJ1bkFjdGlvbklubmVyLFxyXG4gICAgICAgICAgICBwcm9wc1xyXG4gICAgICAgIF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3Qgc2VuZFJlcXVlc3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVldWVkRWZmZWN0czogQXJyYXk8SUh0dHBFZmZlY3Q+XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBjb25zdCBlZmZlY3RzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHF1ZXVlZEVmZmVjdHMuZm9yRWFjaCgoaHR0cEVmZmVjdDogSUh0dHBFZmZlY3QpID0+IHtcclxuXHJcbiAgICAgICAgZ2V0RWZmZWN0KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgaHR0cEVmZmVjdCxcclxuICAgICAgICAgICAgZWZmZWN0cyxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0RWZmZWN0ID0gKFxyXG4gICAgX3N0YXRlOiBJU3RhdGUsXHJcbiAgICBodHRwRWZmZWN0OiBJSHR0cEVmZmVjdCxcclxuICAgIGVmZmVjdHM6IEFycmF5PElIdHRwRWZmZWN0PlxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCB1cmw6IHN0cmluZyA9IGh0dHBFZmZlY3QudXJsO1xyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMuYXBwZW5kKCdBY2NlcHQnLCAnKi8qJyk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgaGVhZGVyczogaGVhZGVyc1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBlZmZlY3QgPSBnQXV0aGVudGljYXRlZEh0dHAoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIHBhcnNlVHlwZTogaHR0cEVmZmVjdC5wYXJzZVR5cGUsXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICByZXNwb25zZTogJ2pzb24nLFxyXG4gICAgICAgIGFjdGlvbjogaHR0cEVmZmVjdC5hY3Rpb25EZWxlZ2F0ZSxcclxuICAgICAgICBlcnJvcjogKF9zdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBwb3N0aW5nIGdSZXBlYXRBY3Rpb25zIGRhdGEgdG8gdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRFZmZlY3QubmFtZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgYWxlcnQoXCJFcnJvciBwb3N0aW5nIGdSZXBlYXRBY3Rpb25zIGRhdGEgdG8gdGhlIHNlcnZlclwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBlZmZlY3RzLnB1c2goZWZmZWN0KTtcclxufTtcclxuXHJcbmNvbnN0IGdSZXBlYXRBY3Rpb25zID0ge1xyXG5cclxuICAgIGh0dHBTaWxlbnRSZUxvYWRJbW1lZGlhdGU6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBNdXN0IHJldHVybiBhbHRlcmVkIHN0YXRlIGZvciB0aGUgc3Vic2NyaXB0aW9uIG5vdCB0byBnZXQgcmVtb3ZlZFxyXG4gICAgICAgICAgICAvLyByZXR1cm4gc3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZUxvYWRIdHRwRWZmZWN0c0ltbWVkaWF0ZTogQXJyYXk8SUh0dHBFZmZlY3Q+ID0gc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZSA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VuZFJlcXVlc3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZUxvYWRIdHRwRWZmZWN0c0ltbWVkaWF0ZVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNpbGVudFJ1bkFjdGlvbkltbWVkaWF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gTXVzdCByZXR1cm4gYWx0ZXJlZCBzdGF0ZSBmb3IgdGhlIHN1YnNjcmlwdGlvbiBub3QgdG8gZ2V0IHJlbW92ZWRcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHN0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcnVuQWN0aW9uSW1tZWRpYXRlOiBBcnJheTxJQWN0aW9uPiA9IHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlID0gW107XHJcblxyXG4gICAgICAgIHJldHVybiBydW5BY3Rpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBydW5BY3Rpb25JbW1lZGlhdGVcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1JlcGVhdEFjdGlvbnM7XHJcblxyXG4iLCJpbXBvcnQgeyBpbnRlcnZhbCB9IGZyb20gXCIuLi8uLi9oeXBlckFwcC90aW1lXCI7XHJcblxyXG5pbXBvcnQgZ1JlcGVhdEFjdGlvbnMgZnJvbSBcIi4uL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgcmVwZWF0U3Vic2NyaXB0aW9ucyA9IHtcclxuXHJcbiAgICBidWlsZFJlcGVhdFN1YnNjcmlwdGlvbnM6IChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1aWxkUmVMb2FkRGF0YUltbWVkaWF0ZSA9ICgpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsKFxyXG4gICAgICAgICAgICAgICAgICAgIGdSZXBlYXRBY3Rpb25zLmh0dHBTaWxlbnRSZUxvYWRJbW1lZGlhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgeyBkZWxheTogMTAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1aWxkUnVuQWN0aW9uc0ltbWVkaWF0ZSA9ICgpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJ2YWwoXHJcbiAgICAgICAgICAgICAgICAgICAgZ1JlcGVhdEFjdGlvbnMuc2lsZW50UnVuQWN0aW9uSW1tZWRpYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHsgZGVsYXk6IDEwIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCByZXBlYXRTdWJzY3JpcHRpb246IGFueVtdID0gW1xyXG5cclxuICAgICAgICAgICAgYnVpbGRSZUxvYWREYXRhSW1tZWRpYXRlKCksXHJcbiAgICAgICAgICAgIGJ1aWxkUnVuQWN0aW9uc0ltbWVkaWF0ZSgpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlcGVhdFN1YnNjcmlwdGlvbjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHJlcGVhdFN1YnNjcmlwdGlvbnM7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgcmVwZWF0U3Vic2NyaXB0aW9ucyBmcm9tIFwiLi4vLi4vLi4vc3Vic2NyaXB0aW9ucy9yZXBlYXRTdWJzY3JpcHRpb25cIjtcclxuXHJcblxyXG5jb25zdCBpbml0U3Vic2NyaXB0aW9ucyA9IChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zOiBhbnlbXSA9IFtcclxuXHJcbiAgICAgICAgLi4ucmVwZWF0U3Vic2NyaXB0aW9ucy5idWlsZFJlcGVhdFN1YnNjcmlwdGlvbnMoc3RhdGUpXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFN1YnNjcmlwdGlvbnM7XHJcblxyXG4iLCIvKiEgQHZpbWVvL3BsYXllciB2Mi4zMC4zIHwgKGMpIDIwMjYgVmltZW8gfCBNSVQgTGljZW5zZSB8IGh0dHBzOi8vZ2l0aHViLmNvbS92aW1lby9wbGF5ZXIuanMgKi9cbi8qKlxuICogQG1vZHVsZSBsaWIvZnVuY3Rpb25zXG4gKi9cblxuLyoqXG4gKiBDaGVjayB0byBzZWUgdGhpcyBpcyBhIE5vZGUgZW52aXJvbm1lbnQuXG4gKiBAdHlwZSB7Ym9vbGVhbn1cbiAqL1xuLyogZ2xvYmFsIGdsb2JhbCAqL1xuY29uc3QgaXNOb2RlID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChnbG9iYWwpID09PSAnW29iamVjdCBnbG9iYWxdJztcblxuLyoqXG4gKiBDaGVjayB0byBzZWUgaWYgdGhpcyBpcyBhIEJ1biBlbnZpcm9ubWVudC5cbiAqIEBzZWUgaHR0cHM6Ly9idW4uc2gvZ3VpZGVzL3V0aWwvZGV0ZWN0LWJ1blxuICogQHR5cGUge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGlzQnVuID0gdHlwZW9mIEJ1biAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgYSBEZW5vIGVudmlyb25tZW50LlxuICogQHNlZSBodHRwczovL2RvY3MuZGVuby5jb20vYXBpL2Rlbm8vfi9EZW5vXG4gKiBAdHlwZSB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNEZW5vID0gdHlwZW9mIERlbm8gIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGEgQ2xvdWRmbGFyZSBXb3JrZXIgZW52aXJvbm1lbnQuXG4gKiBAc2VlIGh0dHBzOi8vY29tbXVuaXR5LmNsb3VkZmxhcmUuY29tL3QvaG93LXRvLWRldGVjdC10aGUtY2xvdWRmbGFyZS13b3JrZXItcnVudGltZS8yOTM3MTVcbiAqIEB0eXBlIHtib29sZWFufVxuICovXG5jb25zdCBpc0Nsb3VkZmxhcmVXb3JrZXIgPSB0eXBlb2YgV2ViU29ja2V0UGFpciA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgY2FjaGVzPy5kZWZhdWx0ICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGlzIGEgc2VydmVyIHJ1bnRpbWVcbiAqIEB0eXBlIHtib29sZWFufVxuICovXG5jb25zdCBpc1NlcnZlclJ1bnRpbWUgPSBpc05vZGUgfHwgaXNCdW4gfHwgaXNEZW5vIHx8IGlzQ2xvdWRmbGFyZVdvcmtlcjtcblxuLyoqXG4gKiBHZXQgdGhlIG5hbWUgb2YgdGhlIG1ldGhvZCBmb3IgYSBnaXZlbiBnZXR0ZXIgb3Igc2V0dGVyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIEVpdGhlciDigJxnZXTigJ0gb3Ig4oCcc2V04oCdLlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRNZXRob2ROYW1lKHByb3AsIHR5cGUpIHtcbiAgaWYgKHByb3AuaW5kZXhPZih0eXBlLnRvTG93ZXJDYXNlKCkpID09PSAwKSB7XG4gICAgcmV0dXJuIHByb3A7XG4gIH1cbiAgcmV0dXJuIGAke3R5cGUudG9Mb3dlckNhc2UoKX0ke3Byb3Auc3Vic3RyKDAsIDEpLnRvVXBwZXJDYXNlKCl9JHtwcm9wLnN1YnN0cigxKX1gO1xufVxuXG4vKipcbiAqIENoZWNrIHRvIHNlZSBpZiB0aGUgb2JqZWN0IGlzIGEgRE9NIEVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHsqfSBlbGVtZW50IFRoZSBvYmplY3QgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0RvbUVsZW1lbnQoZWxlbWVudCkge1xuICByZXR1cm4gQm9vbGVhbihlbGVtZW50ICYmIGVsZW1lbnQubm9kZVR5cGUgPT09IDEgJiYgJ25vZGVOYW1lJyBpbiBlbGVtZW50ICYmIGVsZW1lbnQub3duZXJEb2N1bWVudCAmJiBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpO1xufVxuXG4vKipcbiAqIENoZWNrIHRvIHNlZSB3aGV0aGVyIHRoZSB2YWx1ZSBpcyBhIG51bWJlci5cbiAqXG4gKiBAc2VlIGh0dHA6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3UvMzUxNDYvanMvdGVzdHMvaXNOdW1iZXIuaHRtbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGludGVnZXIgQ2hlY2sgaWYgdGhlIHZhbHVlIGlzIGFuIGludGVnZXIuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0ludGVnZXIodmFsdWUpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxuICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQodmFsdWUpKSAmJiBpc0Zpbml0ZSh2YWx1ZSkgJiYgTWF0aC5mbG9vcih2YWx1ZSkgPT0gdmFsdWU7XG59XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBVUkwgaXMgYSBWaW1lbyB1cmwuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgdXJsIHN0cmluZy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzVmltZW9VcmwodXJsKSB7XG4gIHJldHVybiAvXihodHRwcz86KT9cXC9cXC8oKCgocGxheWVyfHd3dylcXC4pP3ZpbWVvXFwuY29tKXwoKHBsYXllclxcLik/W2EtekEtWjAtOS1dK1xcLih2aWRlb2ppXFwuKGhrfGNuKXx2aW1lb1xcLndvcmspKSkoPz0kfFxcLykvLnRlc3QodXJsKTtcbn1cblxuLyoqXG4gKiBDaGVjayB0byBzZWUgaWYgdGhlIFVSTCBpcyBmb3IgYSBWaW1lbyBlbWJlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSB1cmwgc3RyaW5nLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNWaW1lb0VtYmVkKHVybCkge1xuICBjb25zdCBleHByID0gL15odHRwczpcXC9cXC9wbGF5ZXJcXC4oKHZpbWVvXFwuY29tKXwoW2EtekEtWjAtOS1dK1xcLih2aWRlb2ppXFwuKGhrfGNuKXx2aW1lb1xcLndvcmspKSlcXC92aWRlb1xcL1xcZCsvO1xuICByZXR1cm4gZXhwci50ZXN0KHVybCk7XG59XG5mdW5jdGlvbiBnZXRPZW1iZWREb21haW4odXJsKSB7XG4gIGNvbnN0IG1hdGNoID0gKHVybCB8fCAnJykubWF0Y2goL14oPzpodHRwcz86KT8oPzpcXC9cXC8pPyhbXi8/XSspLyk7XG4gIGNvbnN0IGRvbWFpbiA9IChtYXRjaCAmJiBtYXRjaFsxXSB8fCAnJykucmVwbGFjZSgncGxheWVyLicsICcnKTtcbiAgY29uc3QgY3VzdG9tRG9tYWlucyA9IFsnLnZpZGVvamkuaGsnLCAnLnZpbWVvLndvcmsnLCAnLnZpZGVvamkuY24nXTtcbiAgZm9yIChjb25zdCBjdXN0b21Eb21haW4gb2YgY3VzdG9tRG9tYWlucykge1xuICAgIGlmIChkb21haW4uZW5kc1dpdGgoY3VzdG9tRG9tYWluKSkge1xuICAgICAgcmV0dXJuIGRvbWFpbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICd2aW1lby5jb20nO1xufVxuXG4vKipcbiAqIEdldCB0aGUgVmltZW8gVVJMIGZyb20gYW4gZWxlbWVudC5cbiAqIFRoZSBlbGVtZW50IG11c3QgaGF2ZSBlaXRoZXIgYSBkYXRhLXZpbWVvLWlkIG9yIGRhdGEtdmltZW8tdXJsIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb0VtYmVkUGFyYW1ldGVycyBUaGUgb0VtYmVkIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFZpbWVvVXJsKCkge1xuICBsZXQgb0VtYmVkUGFyYW1ldGVycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gIGNvbnN0IGlkID0gb0VtYmVkUGFyYW1ldGVycy5pZDtcbiAgY29uc3QgdXJsID0gb0VtYmVkUGFyYW1ldGVycy51cmw7XG4gIGNvbnN0IGlkT3JVcmwgPSBpZCB8fCB1cmw7XG4gIGlmICghaWRPclVybCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQW4gaWQgb3IgdXJsIG11c3QgYmUgcGFzc2VkLCBlaXRoZXIgaW4gYW4gb3B0aW9ucyBvYmplY3Qgb3IgYXMgYSBkYXRhLXZpbWVvLWlkIG9yIGRhdGEtdmltZW8tdXJsIGF0dHJpYnV0ZS4nKTtcbiAgfVxuICBpZiAoaXNJbnRlZ2VyKGlkT3JVcmwpKSB7XG4gICAgcmV0dXJuIGBodHRwczovL3ZpbWVvLmNvbS8ke2lkT3JVcmx9YDtcbiAgfVxuICBpZiAoaXNWaW1lb1VybChpZE9yVXJsKSkge1xuICAgIHJldHVybiBpZE9yVXJsLnJlcGxhY2UoJ2h0dHA6JywgJ2h0dHBzOicpO1xuICB9XG4gIGlmIChpZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYOKAnCR7aWR94oCdIGlzIG5vdCBhIHZhbGlkIHZpZGVvIGlkLmApO1xuICB9XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoYOKAnCR7aWRPclVybH3igJ0gaXMgbm90IGEgdmltZW8uY29tIHVybC5gKTtcbn1cblxuLyogZXNsaW50LWRpc2FibGUgbWF4LXBhcmFtcyAqL1xuLyoqXG4gKiBBIHV0aWxpdHkgbWV0aG9kIGZvciBhdHRhY2hpbmcgYW5kIGRldGFjaGluZyBldmVudCBoYW5kbGVyc1xuICpcbiAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IHRhcmdldFxuICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gZXZlbnROYW1lXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHBhcmFtIHsnYWRkRXZlbnRMaXN0ZW5lcicgfCAnb24nfSBvbk5hbWVcbiAqIEBwYXJhbSB7J3JlbW92ZUV2ZW50TGlzdGVuZXInIHwgJ29mZid9IG9mZk5hbWVcbiAqIEByZXR1cm4ge3tjYW5jZWw6IChmdW5jdGlvbigpOiB2b2lkKX19XG4gKi9cbmNvbnN0IHN1YnNjcmliZSA9IGZ1bmN0aW9uICh0YXJnZXQsIGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgbGV0IG9uTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogJ2FkZEV2ZW50TGlzdGVuZXInO1xuICBsZXQgb2ZmTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICBjb25zdCBldmVudE5hbWVzID0gdHlwZW9mIGV2ZW50TmFtZSA9PT0gJ3N0cmluZycgPyBbZXZlbnROYW1lXSA6IGV2ZW50TmFtZTtcbiAgZXZlbnROYW1lcy5mb3JFYWNoKGV2TmFtZSA9PiB7XG4gICAgdGFyZ2V0W29uTmFtZV0oZXZOYW1lLCBjYWxsYmFjayk7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIGNhbmNlbDogKCkgPT4gZXZlbnROYW1lcy5mb3JFYWNoKGV2TmFtZSA9PiB0YXJnZXRbb2ZmTmFtZV0oZXZOYW1lLCBjYWxsYmFjaykpXG4gIH07XG59O1xuXG4vKipcbiAqIEZpbmQgdGhlIGlmcmFtZSBlbGVtZW50IHRoYXQgY29udGFpbnMgYSBzcGVjaWZpYyBzb3VyY2Ugd2luZG93XG4gKlxuICogQHBhcmFtIHtXaW5kb3d9IHNvdXJjZVdpbmRvdyBUaGUgc291cmNlIHdpbmRvdyB0byBmaW5kIHRoZSBpZnJhbWUgZm9yXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBbZG9jPWRvY3VtZW50XSBUaGUgZG9jdW1lbnQgdG8gc2VhcmNoIHdpdGhpblxuICogQHJldHVybiB7SFRNTElGcmFtZUVsZW1lbnR8bnVsbH0gVGhlIGlmcmFtZSBlbGVtZW50IGlmIGZvdW5kLCBvdGhlcndpc2UgbnVsbFxuICovXG5mdW5jdGlvbiBmaW5kSWZyYW1lQnlTb3VyY2VXaW5kb3coc291cmNlV2luZG93KSB7XG4gIGxldCBkb2MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGRvY3VtZW50O1xuICBpZiAoIXNvdXJjZVdpbmRvdyB8fCAhZG9jIHx8IHR5cGVvZiBkb2MucXVlcnlTZWxlY3RvckFsbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGlmcmFtZXMgPSBkb2MucXVlcnlTZWxlY3RvckFsbCgnaWZyYW1lJyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpZnJhbWVzW2ldICYmIGlmcmFtZXNbaV0uY29udGVudFdpbmRvdyA9PT0gc291cmNlV2luZG93KSB7XG4gICAgICByZXR1cm4gaWZyYW1lc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmNvbnN0IGFycmF5SW5kZXhPZlN1cHBvcnQgPSB0eXBlb2YgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgIT09ICd1bmRlZmluZWQnO1xuY29uc3QgcG9zdE1lc3NhZ2VTdXBwb3J0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5wb3N0TWVzc2FnZSAhPT0gJ3VuZGVmaW5lZCc7XG5pZiAoIWlzU2VydmVyUnVudGltZSAmJiAoIWFycmF5SW5kZXhPZlN1cHBvcnQgfHwgIXBvc3RNZXNzYWdlU3VwcG9ydCkpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdTb3JyeSwgdGhlIFZpbWVvIFBsYXllciBBUEkgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIGJyb3dzZXIuJyk7XG59XG5cbnZhciBjb21tb25qc0dsb2JhbCA9IHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbFRoaXMgOiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHt9O1xuXG5mdW5jdGlvbiBjcmVhdGVDb21tb25qc01vZHVsZShmbiwgbW9kdWxlKSB7XG5cdHJldHVybiBtb2R1bGUgPSB7IGV4cG9ydHM6IHt9IH0sIGZuKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMpLCBtb2R1bGUuZXhwb3J0cztcbn1cblxuLyohXG4gKiB3ZWFrbWFwLXBvbHlmaWxsIHYyLjAuNCAtIEVDTUFTY3JpcHQ2IFdlYWtNYXAgcG9seWZpbGxcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wb2x5Z29ucGxhbmV0L3dlYWttYXAtcG9seWZpbGxcbiAqIENvcHlyaWdodCAoYykgMjAxNS0yMDIxIHBvbHlnb25wbGFuZXQgPHBvbHlnb24ucGxhbmV0LmFxdWFAZ21haWwuY29tPlxuICogQGxpY2Vuc2UgTUlUXG4gKi9cblxuKGZ1bmN0aW9uIChzZWxmKSB7XG5cbiAgaWYgKHNlbGYuV2Vha01hcCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgaGFzRGVmaW5lID0gT2JqZWN0LmRlZmluZVByb3BlcnR5ICYmIGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgLy8gQXZvaWQgSUU4J3MgYnJva2VuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxuICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3gnLCB7XG4gICAgICAgIHZhbHVlOiAxXG4gICAgICB9KS54ID09PSAxO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH0oKTtcbiAgdmFyIGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoaGFzRGVmaW5lKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgfTtcbiAgc2VsZi5XZWFrTWFwID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEVDTUEtMjYyIDIzLjMgV2Vha01hcCBPYmplY3RzXG4gICAgZnVuY3Rpb24gV2Vha01hcCgpIHtcbiAgICAgIGlmICh0aGlzID09PSB2b2lkIDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNvbnN0cnVjdG9yIFdlYWtNYXAgcmVxdWlyZXMgJ25ldydcIik7XG4gICAgICB9XG4gICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2lkJywgZ2VuSWQoJ19XZWFrTWFwJykpO1xuXG4gICAgICAvLyBFQ01BLTI2MiAyMy4zLjEuMSBXZWFrTWFwKFtpdGVyYWJsZV0pXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQ3VycmVudGx5LCBXZWFrTWFwIGBpdGVyYWJsZWAgYXJndW1lbnQgaXMgbm90IHN1cHBvcnRlZFxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdXZWFrTWFwIGl0ZXJhYmxlIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFQ01BLTI2MiAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgIGRlZmluZVByb3BlcnR5KFdlYWtNYXAucHJvdG90eXBlLCAnZGVsZXRlJywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgY2hlY2tJbnN0YW5jZSh0aGlzLCAnZGVsZXRlJyk7XG4gICAgICBpZiAoIWlzT2JqZWN0KGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGVudHJ5ID0ga2V5W3RoaXMuX2lkXTtcbiAgICAgIGlmIChlbnRyeSAmJiBlbnRyeVswXSA9PT0ga2V5KSB7XG4gICAgICAgIGRlbGV0ZSBrZXlbdGhpcy5faWRdO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIEVDTUEtMjYyIDIzLjMuMy4zIFdlYWtNYXAucHJvdG90eXBlLmdldChrZXkpXG4gICAgZGVmaW5lUHJvcGVydHkoV2Vha01hcC5wcm90b3R5cGUsICdnZXQnLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBjaGVja0luc3RhbmNlKHRoaXMsICdnZXQnKTtcbiAgICAgIGlmICghaXNPYmplY3Qoa2V5KSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgdmFyIGVudHJ5ID0ga2V5W3RoaXMuX2lkXTtcbiAgICAgIGlmIChlbnRyeSAmJiBlbnRyeVswXSA9PT0ga2V5KSB7XG4gICAgICAgIHJldHVybiBlbnRyeVsxXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfSk7XG5cbiAgICAvLyBFQ01BLTI2MiAyMy4zLjMuNCBXZWFrTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgIGRlZmluZVByb3BlcnR5KFdlYWtNYXAucHJvdG90eXBlLCAnaGFzJywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgY2hlY2tJbnN0YW5jZSh0aGlzLCAnaGFzJyk7XG4gICAgICBpZiAoIWlzT2JqZWN0KGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGVudHJ5ID0ga2V5W3RoaXMuX2lkXTtcbiAgICAgIGlmIChlbnRyeSAmJiBlbnRyeVswXSA9PT0ga2V5KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gRUNNQS0yNjIgMjMuMy4zLjUgV2Vha01hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXG4gICAgZGVmaW5lUHJvcGVydHkoV2Vha01hcC5wcm90b3R5cGUsICdzZXQnLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgY2hlY2tJbnN0YW5jZSh0aGlzLCAnc2V0Jyk7XG4gICAgICBpZiAoIWlzT2JqZWN0KGtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCB2YWx1ZSB1c2VkIGFzIHdlYWsgbWFwIGtleScpO1xuICAgICAgfVxuICAgICAgdmFyIGVudHJ5ID0ga2V5W3RoaXMuX2lkXTtcbiAgICAgIGlmIChlbnRyeSAmJiBlbnRyeVswXSA9PT0ga2V5KSB7XG4gICAgICAgIGVudHJ5WzFdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgZGVmaW5lUHJvcGVydHkoa2V5LCB0aGlzLl9pZCwgW2tleSwgdmFsdWVdKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xuICAgIGZ1bmN0aW9uIGNoZWNrSW5zdGFuY2UoeCwgbWV0aG9kTmFtZSkge1xuICAgICAgaWYgKCFpc09iamVjdCh4KSB8fCAhaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX2lkJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtZXRob2ROYW1lICsgJyBtZXRob2QgY2FsbGVkIG9uIGluY29tcGF0aWJsZSByZWNlaXZlciAnICsgdHlwZW9mIHgpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBnZW5JZChwcmVmaXgpIHtcbiAgICAgIHJldHVybiBwcmVmaXggKyAnXycgKyByYW5kKCkgKyAnLicgKyByYW5kKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJhbmQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygpLnN1YnN0cmluZygyKTtcbiAgICB9XG4gICAgZGVmaW5lUHJvcGVydHkoV2Vha01hcCwgJ19wb2x5ZmlsbCcsIHRydWUpO1xuICAgIHJldHVybiBXZWFrTWFwO1xuICB9KCk7XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4gT2JqZWN0KHgpID09PSB4O1xuICB9XG59KSh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWxUaGlzIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIGNvbW1vbmpzR2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGNvbW1vbmpzR2xvYmFsIDogY29tbW9uanNHbG9iYWwpO1xuXG52YXIgbnBvX3NyYyA9IGNyZWF0ZUNvbW1vbmpzTW9kdWxlKGZ1bmN0aW9uIChtb2R1bGUpIHtcbi8qISBOYXRpdmUgUHJvbWlzZSBPbmx5XG4gICAgdjAuOC4xIChjKSBLeWxlIFNpbXBzb25cbiAgICBNSVQgTGljZW5zZTogaHR0cDovL2dldGlmeS5taXQtbGljZW5zZS5vcmdcbiovXG5cbihmdW5jdGlvbiBVTUQobmFtZSwgY29udGV4dCwgZGVmaW5pdGlvbikge1xuICAvLyBzcGVjaWFsIGZvcm0gb2YgVU1EIGZvciBwb2x5ZmlsbGluZyBhY3Jvc3MgZXZpcm9ubWVudHNcbiAgY29udGV4dFtuYW1lXSA9IGNvbnRleHRbbmFtZV0gfHwgZGVmaW5pdGlvbigpO1xuICBpZiAobW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNvbnRleHRbbmFtZV07XG4gIH1cbn0pKFwiUHJvbWlzZVwiLCB0eXBlb2YgY29tbW9uanNHbG9iYWwgIT0gXCJ1bmRlZmluZWRcIiA/IGNvbW1vbmpzR2xvYmFsIDogY29tbW9uanNHbG9iYWwsIGZ1bmN0aW9uIERFRigpIHtcblxuICB2YXIgYnVpbHRJblByb3AsXG4gICAgY3ljbGUsXG4gICAgc2NoZWR1bGluZ19xdWV1ZSxcbiAgICBUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgdGltZXIgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlICE9IFwidW5kZWZpbmVkXCIgPyBmdW5jdGlvbiB0aW1lcihmbikge1xuICAgICAgcmV0dXJuIHNldEltbWVkaWF0ZShmbik7XG4gICAgfSA6IHNldFRpbWVvdXQ7XG5cbiAgLy8gZGFtbWl0LCBJRTguXG4gIHRyeSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCBcInhcIiwge30pO1xuICAgIGJ1aWx0SW5Qcm9wID0gZnVuY3Rpb24gYnVpbHRJblByb3Aob2JqLCBuYW1lLCB2YWwsIGNvbmZpZykge1xuICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgICAgdmFsdWU6IHZhbCxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogY29uZmlnICE9PSBmYWxzZVxuICAgICAgfSk7XG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgYnVpbHRJblByb3AgPSBmdW5jdGlvbiBidWlsdEluUHJvcChvYmosIG5hbWUsIHZhbCkge1xuICAgICAgb2JqW25hbWVdID0gdmFsO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9XG5cbiAgLy8gTm90ZTogdXNpbmcgYSBxdWV1ZSBpbnN0ZWFkIG9mIGFycmF5IGZvciBlZmZpY2llbmN5XG4gIHNjaGVkdWxpbmdfcXVldWUgPSBmdW5jdGlvbiBRdWV1ZSgpIHtcbiAgICB2YXIgZmlyc3QsIGxhc3QsIGl0ZW07XG4gICAgZnVuY3Rpb24gSXRlbShmbiwgc2VsZikge1xuICAgICAgdGhpcy5mbiA9IGZuO1xuICAgICAgdGhpcy5zZWxmID0gc2VsZjtcbiAgICAgIHRoaXMubmV4dCA9IHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGFkZDogZnVuY3Rpb24gYWRkKGZuLCBzZWxmKSB7XG4gICAgICAgIGl0ZW0gPSBuZXcgSXRlbShmbiwgc2VsZik7XG4gICAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgICAgbGFzdC5uZXh0ID0gaXRlbTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaXJzdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgbGFzdCA9IGl0ZW07XG4gICAgICAgIGl0ZW0gPSB2b2lkIDA7XG4gICAgICB9LFxuICAgICAgZHJhaW46IGZ1bmN0aW9uIGRyYWluKCkge1xuICAgICAgICB2YXIgZiA9IGZpcnN0O1xuICAgICAgICBmaXJzdCA9IGxhc3QgPSBjeWNsZSA9IHZvaWQgMDtcbiAgICAgICAgd2hpbGUgKGYpIHtcbiAgICAgICAgICBmLmZuLmNhbGwoZi5zZWxmKTtcbiAgICAgICAgICBmID0gZi5uZXh0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSgpO1xuICBmdW5jdGlvbiBzY2hlZHVsZShmbiwgc2VsZikge1xuICAgIHNjaGVkdWxpbmdfcXVldWUuYWRkKGZuLCBzZWxmKTtcbiAgICBpZiAoIWN5Y2xlKSB7XG4gICAgICBjeWNsZSA9IHRpbWVyKHNjaGVkdWxpbmdfcXVldWUuZHJhaW4pO1xuICAgIH1cbiAgfVxuXG4gIC8vIHByb21pc2UgZHVjayB0eXBpbmdcbiAgZnVuY3Rpb24gaXNUaGVuYWJsZShvKSB7XG4gICAgdmFyIF90aGVuLFxuICAgICAgb190eXBlID0gdHlwZW9mIG87XG4gICAgaWYgKG8gIT0gbnVsbCAmJiAob190eXBlID09IFwib2JqZWN0XCIgfHwgb190eXBlID09IFwiZnVuY3Rpb25cIikpIHtcbiAgICAgIF90aGVuID0gby50aGVuO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIF90aGVuID09IFwiZnVuY3Rpb25cIiA/IF90aGVuIDogZmFsc2U7XG4gIH1cbiAgZnVuY3Rpb24gbm90aWZ5KCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jaGFpbi5sZW5ndGg7IGkrKykge1xuICAgICAgbm90aWZ5SXNvbGF0ZWQodGhpcywgdGhpcy5zdGF0ZSA9PT0gMSA/IHRoaXMuY2hhaW5baV0uc3VjY2VzcyA6IHRoaXMuY2hhaW5baV0uZmFpbHVyZSwgdGhpcy5jaGFpbltpXSk7XG4gICAgfVxuICAgIHRoaXMuY2hhaW4ubGVuZ3RoID0gMDtcbiAgfVxuXG4gIC8vIE5PVEU6IFRoaXMgaXMgYSBzZXBhcmF0ZSBmdW5jdGlvbiB0byBpc29sYXRlXG4gIC8vIHRoZSBgdHJ5Li5jYXRjaGAgc28gdGhhdCBvdGhlciBjb2RlIGNhbiBiZVxuICAvLyBvcHRpbWl6ZWQgYmV0dGVyXG4gIGZ1bmN0aW9uIG5vdGlmeUlzb2xhdGVkKHNlbGYsIGNiLCBjaGFpbikge1xuICAgIHZhciByZXQsIF90aGVuO1xuICAgIHRyeSB7XG4gICAgICBpZiAoY2IgPT09IGZhbHNlKSB7XG4gICAgICAgIGNoYWluLnJlamVjdChzZWxmLm1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY2IgPT09IHRydWUpIHtcbiAgICAgICAgICByZXQgPSBzZWxmLm1zZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXQgPSBjYi5jYWxsKHZvaWQgMCwgc2VsZi5tc2cpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXQgPT09IGNoYWluLnByb21pc2UpIHtcbiAgICAgICAgICBjaGFpbi5yZWplY3QoVHlwZUVycm9yKFwiUHJvbWlzZS1jaGFpbiBjeWNsZVwiKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoX3RoZW4gPSBpc1RoZW5hYmxlKHJldCkpIHtcbiAgICAgICAgICBfdGhlbi5jYWxsKHJldCwgY2hhaW4ucmVzb2x2ZSwgY2hhaW4ucmVqZWN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGFpbi5yZXNvbHZlKHJldCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNoYWluLnJlamVjdChlcnIpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiByZXNvbHZlKG1zZykge1xuICAgIHZhciBfdGhlbixcbiAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gYWxyZWFkeSB0cmlnZ2VyZWQ/XG4gICAgaWYgKHNlbGYudHJpZ2dlcmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYudHJpZ2dlcmVkID0gdHJ1ZTtcblxuICAgIC8vIHVud3JhcFxuICAgIGlmIChzZWxmLmRlZikge1xuICAgICAgc2VsZiA9IHNlbGYuZGVmO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgaWYgKF90aGVuID0gaXNUaGVuYWJsZShtc2cpKSB7XG4gICAgICAgIHNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgZGVmX3dyYXBwZXIgPSBuZXcgTWFrZURlZldyYXBwZXIoc2VsZik7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIF90aGVuLmNhbGwobXNnLCBmdW5jdGlvbiAkcmVzb2x2ZSQoKSB7XG4gICAgICAgICAgICAgIHJlc29sdmUuYXBwbHkoZGVmX3dyYXBwZXIsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAkcmVqZWN0JCgpIHtcbiAgICAgICAgICAgICAgcmVqZWN0LmFwcGx5KGRlZl93cmFwcGVyLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZWplY3QuY2FsbChkZWZfd3JhcHBlciwgZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5tc2cgPSBtc2c7XG4gICAgICAgIHNlbGYuc3RhdGUgPSAxO1xuICAgICAgICBpZiAoc2VsZi5jaGFpbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgc2NoZWR1bGUobm90aWZ5LCBzZWxmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmVqZWN0LmNhbGwobmV3IE1ha2VEZWZXcmFwcGVyKHNlbGYpLCBlcnIpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiByZWplY3QobXNnKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gYWxyZWFkeSB0cmlnZ2VyZWQ/XG4gICAgaWYgKHNlbGYudHJpZ2dlcmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYudHJpZ2dlcmVkID0gdHJ1ZTtcblxuICAgIC8vIHVud3JhcFxuICAgIGlmIChzZWxmLmRlZikge1xuICAgICAgc2VsZiA9IHNlbGYuZGVmO1xuICAgIH1cbiAgICBzZWxmLm1zZyA9IG1zZztcbiAgICBzZWxmLnN0YXRlID0gMjtcbiAgICBpZiAoc2VsZi5jaGFpbi5sZW5ndGggPiAwKSB7XG4gICAgICBzY2hlZHVsZShub3RpZnksIHNlbGYpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBpdGVyYXRlUHJvbWlzZXMoQ29uc3RydWN0b3IsIGFyciwgcmVzb2x2ZXIsIHJlamVjdGVyKSB7XG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgYXJyLmxlbmd0aDsgaWR4KyspIHtcbiAgICAgIChmdW5jdGlvbiBJSUZFKGlkeCkge1xuICAgICAgICBDb25zdHJ1Y3Rvci5yZXNvbHZlKGFycltpZHhdKS50aGVuKGZ1bmN0aW9uICRyZXNvbHZlciQobXNnKSB7XG4gICAgICAgICAgcmVzb2x2ZXIoaWR4LCBtc2cpO1xuICAgICAgICB9LCByZWplY3Rlcik7XG4gICAgICB9KShpZHgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBNYWtlRGVmV3JhcHBlcihzZWxmKSB7XG4gICAgdGhpcy5kZWYgPSBzZWxmO1xuICAgIHRoaXMudHJpZ2dlcmVkID0gZmFsc2U7XG4gIH1cbiAgZnVuY3Rpb24gTWFrZURlZihzZWxmKSB7XG4gICAgdGhpcy5wcm9taXNlID0gc2VsZjtcbiAgICB0aGlzLnN0YXRlID0gMDtcbiAgICB0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuY2hhaW4gPSBbXTtcbiAgICB0aGlzLm1zZyA9IHZvaWQgMDtcbiAgfVxuICBmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKSB7XG4gICAgaWYgKHR5cGVvZiBleGVjdXRvciAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fX05QT19fICE9PSAwKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBwcm9taXNlXCIpO1xuICAgIH1cblxuICAgIC8vIGluc3RhbmNlIHNoYWRvd2luZyB0aGUgaW5oZXJpdGVkIFwiYnJhbmRcIlxuICAgIC8vIHRvIHNpZ25hbCBhbiBhbHJlYWR5IFwiaW5pdGlhbGl6ZWRcIiBwcm9taXNlXG4gICAgdGhpcy5fX05QT19fID0gMTtcbiAgICB2YXIgZGVmID0gbmV3IE1ha2VEZWYodGhpcyk7XG4gICAgdGhpc1tcInRoZW5cIl0gPSBmdW5jdGlvbiB0aGVuKHN1Y2Nlc3MsIGZhaWx1cmUpIHtcbiAgICAgIHZhciBvID0ge1xuICAgICAgICBzdWNjZXNzOiB0eXBlb2Ygc3VjY2VzcyA9PSBcImZ1bmN0aW9uXCIgPyBzdWNjZXNzIDogdHJ1ZSxcbiAgICAgICAgZmFpbHVyZTogdHlwZW9mIGZhaWx1cmUgPT0gXCJmdW5jdGlvblwiID8gZmFpbHVyZSA6IGZhbHNlXG4gICAgICB9O1xuICAgICAgLy8gTm90ZTogYHRoZW4oLi4pYCBpdHNlbGYgY2FuIGJlIGJvcnJvd2VkIHRvIGJlIHVzZWQgYWdhaW5zdFxuICAgICAgLy8gYSBkaWZmZXJlbnQgcHJvbWlzZSBjb25zdHJ1Y3RvciBmb3IgbWFraW5nIHRoZSBjaGFpbmVkIHByb21pc2UsXG4gICAgICAvLyBieSBzdWJzdGl0dXRpbmcgYSBkaWZmZXJlbnQgYHRoaXNgIGJpbmRpbmcuXG4gICAgICBvLnByb21pc2UgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihmdW5jdGlvbiBleHRyYWN0Q2hhaW4ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBvLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBvLnJlamVjdCA9IHJlamVjdDtcbiAgICAgIH0pO1xuICAgICAgZGVmLmNoYWluLnB1c2gobyk7XG4gICAgICBpZiAoZGVmLnN0YXRlICE9PSAwKSB7XG4gICAgICAgIHNjaGVkdWxlKG5vdGlmeSwgZGVmKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvLnByb21pc2U7XG4gICAgfTtcbiAgICB0aGlzW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAkY2F0Y2gkKGZhaWx1cmUpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCBmYWlsdXJlKTtcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBleGVjdXRvci5jYWxsKHZvaWQgMCwgZnVuY3Rpb24gcHVibGljUmVzb2x2ZShtc2cpIHtcbiAgICAgICAgcmVzb2x2ZS5jYWxsKGRlZiwgbXNnKTtcbiAgICAgIH0sIGZ1bmN0aW9uIHB1YmxpY1JlamVjdChtc2cpIHtcbiAgICAgICAgcmVqZWN0LmNhbGwoZGVmLCBtc2cpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZWplY3QuY2FsbChkZWYsIGVycik7XG4gICAgfVxuICB9XG4gIHZhciBQcm9taXNlUHJvdG90eXBlID0gYnVpbHRJblByb3Aoe30sIFwiY29uc3RydWN0b3JcIiwgUHJvbWlzZSwgLypjb25maWd1cmFibGU9Ki9mYWxzZSk7XG5cbiAgLy8gTm90ZTogQW5kcm9pZCA0IGNhbm5vdCB1c2UgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSguLilgIGhlcmVcbiAgUHJvbWlzZS5wcm90b3R5cGUgPSBQcm9taXNlUHJvdG90eXBlO1xuXG4gIC8vIGJ1aWx0LWluIFwiYnJhbmRcIiB0byBzaWduYWwgYW4gXCJ1bmluaXRpYWxpemVkXCIgcHJvbWlzZVxuICBidWlsdEluUHJvcChQcm9taXNlUHJvdG90eXBlLCBcIl9fTlBPX19cIiwgMCwgLypjb25maWd1cmFibGU9Ki9mYWxzZSk7XG4gIGJ1aWx0SW5Qcm9wKFByb21pc2UsIFwicmVzb2x2ZVwiLCBmdW5jdGlvbiBQcm9taXNlJHJlc29sdmUobXNnKSB7XG4gICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgIC8vIHNwZWMgbWFuZGF0ZWQgY2hlY2tzXG4gICAgLy8gbm90ZTogYmVzdCBcImlzUHJvbWlzZVwiIGNoZWNrIHRoYXQncyBwcmFjdGljYWwgZm9yIG5vd1xuICAgIGlmIChtc2cgJiYgdHlwZW9mIG1zZyA9PSBcIm9iamVjdFwiICYmIG1zZy5fX05QT19fID09PSAxKSB7XG4gICAgICByZXR1cm4gbXNnO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWYgKHR5cGVvZiByZXNvbHZlICE9IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcmVqZWN0ICE9IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUobXNnKTtcbiAgICB9KTtcbiAgfSk7XG4gIGJ1aWx0SW5Qcm9wKFByb21pc2UsIFwicmVqZWN0XCIsIGZ1bmN0aW9uIFByb21pc2UkcmVqZWN0KG1zZykge1xuICAgIHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG4gICAgICB9XG4gICAgICByZWplY3QobXNnKTtcbiAgICB9KTtcbiAgfSk7XG4gIGJ1aWx0SW5Qcm9wKFByb21pc2UsIFwiYWxsXCIsIGZ1bmN0aW9uIFByb21pc2UkYWxsKGFycikge1xuICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAvLyBzcGVjIG1hbmRhdGVkIGNoZWNrc1xuICAgIGlmIChUb1N0cmluZy5jYWxsKGFycikgIT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICByZXR1cm4gQ29uc3RydWN0b3IucmVqZWN0KFR5cGVFcnJvcihcIk5vdCBhbiBhcnJheVwiKSk7XG4gICAgfVxuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gQ29uc3RydWN0b3IucmVzb2x2ZShbXSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgICAgfVxuICAgICAgdmFyIGxlbiA9IGFyci5sZW5ndGgsXG4gICAgICAgIG1zZ3MgPSBBcnJheShsZW4pLFxuICAgICAgICBjb3VudCA9IDA7XG4gICAgICBpdGVyYXRlUHJvbWlzZXMoQ29uc3RydWN0b3IsIGFyciwgZnVuY3Rpb24gcmVzb2x2ZXIoaWR4LCBtc2cpIHtcbiAgICAgICAgbXNnc1tpZHhdID0gbXNnO1xuICAgICAgICBpZiAoKytjb3VudCA9PT0gbGVuKSB7XG4gICAgICAgICAgcmVzb2x2ZShtc2dzKTtcbiAgICAgICAgfVxuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfSk7XG4gIGJ1aWx0SW5Qcm9wKFByb21pc2UsIFwicmFjZVwiLCBmdW5jdGlvbiBQcm9taXNlJHJhY2UoYXJyKSB7XG4gICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgIC8vIHNwZWMgbWFuZGF0ZWQgY2hlY2tzXG4gICAgaWYgKFRvU3RyaW5nLmNhbGwoYXJyKSAhPSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICAgIHJldHVybiBDb25zdHJ1Y3Rvci5yZWplY3QoVHlwZUVycm9yKFwiTm90IGFuIGFycmF5XCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG4gICAgICB9XG4gICAgICBpdGVyYXRlUHJvbWlzZXMoQ29uc3RydWN0b3IsIGFyciwgZnVuY3Rpb24gcmVzb2x2ZXIoaWR4LCBtc2cpIHtcbiAgICAgICAgcmVzb2x2ZShtc2cpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBQcm9taXNlO1xufSk7XG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIGxpYi9jYWxsYmFja3NcbiAqL1xuXG5jb25zdCBjYWxsYmFja01hcCA9IG5ldyBXZWFrTWFwKCk7XG5cbi8qKlxuICogU3RvcmUgYSBjYWxsYmFjayBmb3IgYSBtZXRob2Qgb3IgZXZlbnQgZm9yIGEgcGxheWVyLlxuICpcbiAqIEBwYXJhbSB7UGxheWVyfSBwbGF5ZXIgVGhlIHBsYXllciBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbWV0aG9kIG9yIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0geyhmdW5jdGlvbih0aGlzOlBsYXllciwgKik6IHZvaWR8e3Jlc29sdmU6IGZ1bmN0aW9uLCByZWplY3Q6IGZ1bmN0aW9ufSl9IGNhbGxiYWNrXG4gKiAgICAgICAgVGhlIGNhbGxiYWNrIHRvIGNhbGwgb3IgYW4gb2JqZWN0IHdpdGggcmVzb2x2ZSBhbmQgcmVqZWN0IGZ1bmN0aW9ucyBmb3IgYSBwcm9taXNlLlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gc3RvcmVDYWxsYmFjayhwbGF5ZXIsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGNvbnN0IHBsYXllckNhbGxiYWNrcyA9IGNhbGxiYWNrTWFwLmdldChwbGF5ZXIuZWxlbWVudCkgfHwge307XG4gIGlmICghKG5hbWUgaW4gcGxheWVyQ2FsbGJhY2tzKSkge1xuICAgIHBsYXllckNhbGxiYWNrc1tuYW1lXSA9IFtdO1xuICB9XG4gIHBsYXllckNhbGxiYWNrc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgY2FsbGJhY2tNYXAuc2V0KHBsYXllci5lbGVtZW50LCBwbGF5ZXJDYWxsYmFja3MpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgY2FsbGJhY2tzIGZvciBhIHBsYXllciBhbmQgZXZlbnQgb3IgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7UGxheWVyfSBwbGF5ZXIgVGhlIHBsYXllciBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbWV0aG9kIG9yIGV2ZW50IG5hbWVcbiAqIEByZXR1cm4ge2Z1bmN0aW9uW119XG4gKi9cbmZ1bmN0aW9uIGdldENhbGxiYWNrcyhwbGF5ZXIsIG5hbWUpIHtcbiAgY29uc3QgcGxheWVyQ2FsbGJhY2tzID0gY2FsbGJhY2tNYXAuZ2V0KHBsYXllci5lbGVtZW50KSB8fCB7fTtcbiAgcmV0dXJuIHBsYXllckNhbGxiYWNrc1tuYW1lXSB8fCBbXTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYSBzdG9yZWQgY2FsbGJhY2sgZm9yIGEgbWV0aG9kIG9yIGV2ZW50IGZvciBhIHBsYXllci5cbiAqXG4gKiBAcGFyYW0ge1BsYXllcn0gcGxheWVyIFRoZSBwbGF5ZXIgb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG1ldGhvZCBvciBldmVudCBuYW1lXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBzcGVjaWZpYyBjYWxsYmFjayB0byByZW1vdmUuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXYXMgdGhpcyB0aGUgbGFzdCBjYWxsYmFjaz9cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlQ2FsbGJhY2socGxheWVyLCBuYW1lLCBjYWxsYmFjaykge1xuICBjb25zdCBwbGF5ZXJDYWxsYmFja3MgPSBjYWxsYmFja01hcC5nZXQocGxheWVyLmVsZW1lbnQpIHx8IHt9O1xuICBpZiAoIXBsYXllckNhbGxiYWNrc1tuYW1lXSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gSWYgbm8gY2FsbGJhY2sgaXMgcGFzc2VkLCByZW1vdmUgYWxsIGNhbGxiYWNrcyBmb3IgdGhlIGV2ZW50XG4gIGlmICghY2FsbGJhY2spIHtcbiAgICBwbGF5ZXJDYWxsYmFja3NbbmFtZV0gPSBbXTtcbiAgICBjYWxsYmFja01hcC5zZXQocGxheWVyLmVsZW1lbnQsIHBsYXllckNhbGxiYWNrcyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgY29uc3QgaW5kZXggPSBwbGF5ZXJDYWxsYmFja3NbbmFtZV0uaW5kZXhPZihjYWxsYmFjayk7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICBwbGF5ZXJDYWxsYmFja3NbbmFtZV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxuICBjYWxsYmFja01hcC5zZXQocGxheWVyLmVsZW1lbnQsIHBsYXllckNhbGxiYWNrcyk7XG4gIHJldHVybiBwbGF5ZXJDYWxsYmFja3NbbmFtZV0gJiYgcGxheWVyQ2FsbGJhY2tzW25hbWVdLmxlbmd0aCA9PT0gMDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGZpcnN0IHN0b3JlZCBjYWxsYmFjayBmb3IgYSBwbGF5ZXIgYW5kIGV2ZW50IG9yIG1ldGhvZC5cbiAqXG4gKiBAcGFyYW0ge1BsYXllcn0gcGxheWVyIFRoZSBwbGF5ZXIgb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG1ldGhvZCBvciBldmVudCBuYW1lLlxuICogQHJldHVybiB7ZnVuY3Rpb259IFRoZSBjYWxsYmFjaywgb3IgZmFsc2UgaWYgdGhlcmUgd2VyZSBub25lXG4gKi9cbmZ1bmN0aW9uIHNoaWZ0Q2FsbGJhY2tzKHBsYXllciwgbmFtZSkge1xuICBjb25zdCBwbGF5ZXJDYWxsYmFja3MgPSBnZXRDYWxsYmFja3MocGxheWVyLCBuYW1lKTtcbiAgaWYgKHBsYXllckNhbGxiYWNrcy5sZW5ndGggPCAxKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGNhbGxiYWNrID0gcGxheWVyQ2FsbGJhY2tzLnNoaWZ0KCk7XG4gIHJlbW92ZUNhbGxiYWNrKHBsYXllciwgbmFtZSwgY2FsbGJhY2spO1xuICByZXR1cm4gY2FsbGJhY2s7XG59XG5cbi8qKlxuICogTW92ZSBjYWxsYmFja3MgYXNzb2NpYXRlZCB3aXRoIGFuIGVsZW1lbnQgdG8gYW5vdGhlciBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG9sZEVsZW1lbnQgVGhlIG9sZCBlbGVtZW50LlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbmV3RWxlbWVudCBUaGUgbmV3IGVsZW1lbnQuXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5mdW5jdGlvbiBzd2FwQ2FsbGJhY2tzKG9sZEVsZW1lbnQsIG5ld0VsZW1lbnQpIHtcbiAgY29uc3QgcGxheWVyQ2FsbGJhY2tzID0gY2FsbGJhY2tNYXAuZ2V0KG9sZEVsZW1lbnQpO1xuICBjYWxsYmFja01hcC5zZXQobmV3RWxlbWVudCwgcGxheWVyQ2FsbGJhY2tzKTtcbiAgY2FsbGJhY2tNYXAuZGVsZXRlKG9sZEVsZW1lbnQpO1xufVxuXG4vKipcbiAqIEBtb2R1bGUgbGliL3Bvc3RtZXNzYWdlXG4gKi9cblxuLyoqXG4gKiBQYXJzZSBhIG1lc3NhZ2UgcmVjZWl2ZWQgZnJvbSBwb3N0TWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0geyp9IGRhdGEgVGhlIGRhdGEgcmVjZWl2ZWQgZnJvbSBwb3N0TWVzc2FnZS5cbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuZnVuY3Rpb24gcGFyc2VNZXNzYWdlRGF0YShkYXRhKSB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICB0cnkge1xuICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIElmIHRoZSBtZXNzYWdlIGNhbm5vdCBiZSBwYXJzZWQsIHRocm93IHRoZSBlcnJvciBhcyBhIHdhcm5pbmdcbiAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkYXRhO1xufVxuXG4vKipcbiAqIFBvc3QgYSBtZXNzYWdlIHRvIHRoZSBzcGVjaWZpZWQgdGFyZ2V0LlxuICpcbiAqIEBwYXJhbSB7UGxheWVyfSBwbGF5ZXIgVGhlIHBsYXllciBvYmplY3QgdG8gdXNlLlxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCBUaGUgQVBJIG1ldGhvZCB0byBjYWxsLlxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfG9iamVjdHxBcnJheXx1bmRlZmluZWR9IHBhcmFtcyBUaGUgcGFyYW1ldGVycyB0byBzZW5kIHRvIHRoZSBwbGF5ZXIuXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5mdW5jdGlvbiBwb3N0TWVzc2FnZShwbGF5ZXIsIG1ldGhvZCwgcGFyYW1zKSB7XG4gIGlmICghcGxheWVyLmVsZW1lbnQuY29udGVudFdpbmRvdyB8fCAhcGxheWVyLmVsZW1lbnQuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgbWVzc2FnZSA9IHtcbiAgICBtZXRob2RcbiAgfTtcbiAgaWYgKHBhcmFtcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbWVzc2FnZS52YWx1ZSA9IHBhcmFtcztcbiAgfVxuXG4gIC8vIElFIDggYW5kIDkgZG8gbm90IHN1cHBvcnQgcGFzc2luZyBtZXNzYWdlcywgc28gc3RyaW5naWZ5IHRoZW1cbiAgY29uc3QgaWVWZXJzaW9uID0gcGFyc2VGbG9hdChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXi4qbXNpZSAoXFxkKykuKiQvLCAnJDEnKSk7XG4gIGlmIChpZVZlcnNpb24gPj0gOCAmJiBpZVZlcnNpb24gPCAxMCkge1xuICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgfVxuICBwbGF5ZXIuZWxlbWVudC5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UsIHBsYXllci5vcmlnaW4pO1xufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBkYXRhIHJlY2VpdmVkIGZyb20gYSBtZXNzYWdlIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7UGxheWVyfSBwbGF5ZXIgVGhlIHBsYXllciB0aGF0IHJlY2VpdmVkIHRoZSBtZXNzYWdlLlxuICogQHBhcmFtIHsoT2JqZWN0fHN0cmluZyl9IGRhdGEgVGhlIG1lc3NhZ2UgZGF0YS4gU3RyaW5ncyB3aWxsIGJlIHBhcnNlZCBpbnRvIEpTT04uXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5mdW5jdGlvbiBwcm9jZXNzRGF0YShwbGF5ZXIsIGRhdGEpIHtcbiAgZGF0YSA9IHBhcnNlTWVzc2FnZURhdGEoZGF0YSk7XG4gIGxldCBjYWxsYmFja3MgPSBbXTtcbiAgbGV0IHBhcmFtO1xuICBpZiAoZGF0YS5ldmVudCkge1xuICAgIGlmIChkYXRhLmV2ZW50ID09PSAnZXJyb3InKSB7XG4gICAgICBjb25zdCBwcm9taXNlcyA9IGdldENhbGxiYWNrcyhwbGF5ZXIsIGRhdGEuZGF0YS5tZXRob2QpO1xuICAgICAgcHJvbWlzZXMuZm9yRWFjaChwcm9taXNlID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoZGF0YS5kYXRhLm1lc3NhZ2UpO1xuICAgICAgICBlcnJvci5uYW1lID0gZGF0YS5kYXRhLm5hbWU7XG4gICAgICAgIHByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgICAgcmVtb3ZlQ2FsbGJhY2socGxheWVyLCBkYXRhLmRhdGEubWV0aG9kLCBwcm9taXNlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3MocGxheWVyLCBgZXZlbnQ6JHtkYXRhLmV2ZW50fWApO1xuICAgIHBhcmFtID0gZGF0YS5kYXRhO1xuICB9IGVsc2UgaWYgKGRhdGEubWV0aG9kKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSBzaGlmdENhbGxiYWNrcyhwbGF5ZXIsIGRhdGEubWV0aG9kKTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIHBhcmFtID0gZGF0YS52YWx1ZTtcbiAgICB9XG4gIH1cbiAgY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwocGxheWVyLCBwYXJhbSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrLnJlc29sdmUocGFyYW0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIGVtcHR5XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBAbW9kdWxlIGxpYi9lbWJlZFxuICovXG5jb25zdCBvRW1iZWRQYXJhbWV0ZXJzID0gWydhaXJwbGF5JywgJ2F1ZGlvX3RyYWNrcycsICdhdWRpb3RyYWNrJywgJ2F1dG9wYXVzZScsICdhdXRvcGxheScsICdiYWNrZ3JvdW5kJywgJ2J5bGluZScsICdjYycsICdjaGFwdGVyX2lkJywgJ2NoYXB0ZXJzJywgJ2Nocm9tZWNhc3QnLCAnY29sb3InLCAnY29sb3JzJywgJ2NvbnRyb2xzJywgJ2RudCcsICdlbmRfdGltZScsICdmdWxsc2NyZWVuJywgJ2hlaWdodCcsICdpZCcsICdpbml0aWFsX3F1YWxpdHknLCAnaW50ZXJhY3RpdmVfcGFyYW1zJywgJ2tleWJvYXJkJywgJ2xvb3AnLCAnbWF4aGVpZ2h0JywgJ21heF9xdWFsaXR5JywgJ21heHdpZHRoJywgJ21pbl9xdWFsaXR5JywgJ211dGVkJywgJ3BsYXlfYnV0dG9uX3Bvc2l0aW9uJywgJ3BsYXlzaW5saW5lJywgJ3BvcnRyYWl0JywgJ3ByZWxvYWQnLCAncHJvZ3Jlc3NfYmFyJywgJ3F1YWxpdHknLCAncXVhbGl0eV9zZWxlY3RvcicsICdyZXNwb25zaXZlJywgJ3NraXBwaW5nX2ZvcndhcmQnLCAnc3BlZWQnLCAnc3RhcnRfdGltZScsICd0ZXh0dHJhY2snLCAndGh1bWJuYWlsX2lkJywgJ3RpdGxlJywgJ3RyYW5zY3JpcHQnLCAndHJhbnNwYXJlbnQnLCAndW5tdXRlX2J1dHRvbicsICd1cmwnLCAndmltZW9fbG9nbycsICd2b2x1bWUnLCAnd2F0Y2hfZnVsbF92aWRlbycsICd3aWR0aCddO1xuXG4vKipcbiAqIEdldCB0aGUgJ2RhdGEtdmltZW8nLXByZWZpeGVkIGF0dHJpYnV0ZXMgZnJvbSBhbiBlbGVtZW50IGFzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IFtkZWZhdWx0cz17fV0gVGhlIGRlZmF1bHQgdmFsdWVzIHRvIHVzZS5cbiAqIEByZXR1cm4ge09iamVjdDxzdHJpbmcsIHN0cmluZz59XG4gKi9cbmZ1bmN0aW9uIGdldE9FbWJlZFBhcmFtZXRlcnMoZWxlbWVudCkge1xuICBsZXQgZGVmYXVsdHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICByZXR1cm4gb0VtYmVkUGFyYW1ldGVycy5yZWR1Y2UoKHBhcmFtcywgcGFyYW0pID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGBkYXRhLXZpbWVvLSR7cGFyYW19YCk7XG4gICAgaWYgKHZhbHVlIHx8IHZhbHVlID09PSAnJykge1xuICAgICAgcGFyYW1zW3BhcmFtXSA9IHZhbHVlID09PSAnJyA/IDEgOiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfSwgZGVmYXVsdHMpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBlbWJlZCBmcm9tIG9FbWJlZCBkYXRhIGluc2lkZSBhbiBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIFRoZSBvRW1iZWQgZGF0YS5cbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gcHV0IHRoZSBpZnJhbWUgaW4uXG4gKiBAcmV0dXJuIHtIVE1MSUZyYW1lRWxlbWVudH0gVGhlIGlmcmFtZSBlbWJlZC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRW1iZWQoX3JlZiwgZWxlbWVudCkge1xuICBsZXQge1xuICAgIGh0bWxcbiAgfSA9IF9yZWY7XG4gIGlmICghZWxlbWVudCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FuIGVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZCcpO1xuICB9XG4gIGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS12aW1lby1pbml0aWFsaXplZCcpICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvcignaWZyYW1lJyk7XG4gIH1cbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5pbm5lckhUTUwgPSBodG1sO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKGRpdi5maXJzdENoaWxkKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdmltZW8taW5pdGlhbGl6ZWQnLCAndHJ1ZScpO1xuICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKTtcbn1cblxuLyoqXG4gKiBNYWtlIGFuIG9FbWJlZCBjYWxsIGZvciB0aGUgc3BlY2lmaWVkIFVSTC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmlkZW9VcmwgVGhlIHZpbWVvLmNvbSB1cmwgZm9yIHRoZSB2aWRlby5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcGFyYW1zXSBQYXJhbWV0ZXJzIHRvIHBhc3MgdG8gb0VtYmVkLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudC5cbiAqIEByZXR1cm4ge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIGdldE9FbWJlZERhdGEodmlkZW9VcmwpIHtcbiAgbGV0IHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIGxldCBlbGVtZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKCFpc1ZpbWVvVXJsKHZpZGVvVXJsKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihg4oCcJHt2aWRlb1VybH3igJ0gaXMgbm90IGEgdmltZW8uY29tIHVybC5gKTtcbiAgICB9XG4gICAgY29uc3QgZG9tYWluID0gZ2V0T2VtYmVkRG9tYWluKHZpZGVvVXJsKTtcbiAgICBsZXQgdXJsID0gYGh0dHBzOi8vJHtkb21haW59L2FwaS9vZW1iZWQuanNvbj91cmw9JHtlbmNvZGVVUklDb21wb25lbnQodmlkZW9VcmwpfWA7XG4gICAgZm9yIChjb25zdCBwYXJhbSBpbiBwYXJhbXMpIHtcbiAgICAgIGlmIChwYXJhbXMuaGFzT3duUHJvcGVydHkocGFyYW0pKSB7XG4gICAgICAgIHVybCArPSBgJiR7cGFyYW19PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtc1twYXJhbV0pfWA7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHhociA9ICdYRG9tYWluUmVxdWVzdCcgaW4gd2luZG93ID8gbmV3IFhEb21haW5SZXF1ZXN0KCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGDigJwke3ZpZGVvVXJsfeKAnSB3YXMgbm90IGZvdW5kLmApKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDQwMykge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGDigJwke3ZpZGVvVXJsfeKAnSBpcyBub3QgZW1iZWRkYWJsZS5gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAvLyBDaGVjayBhcGkgcmVzcG9uc2UgZm9yIDQwMyBvbiBvZW1iZWRcbiAgICAgICAgaWYgKGpzb24uZG9tYWluX3N0YXR1c19jb2RlID09PSA0MDMpIHtcbiAgICAgICAgICAvLyBXZSBzdGlsbCB3YW50IHRvIGNyZWF0ZSB0aGUgZW1iZWQgdG8gZ2l2ZSB1c2VycyB2aXN1YWwgZmVlZGJhY2tcbiAgICAgICAgICBjcmVhdGVFbWJlZChqc29uLCBlbGVtZW50KTtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGDigJwke3ZpZGVvVXJsfeKAnSBpcyBub3QgZW1iZWRkYWJsZS5gKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoanNvbik7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH07XG4gICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSB4aHIuc3RhdHVzID8gYCAoJHt4aHIuc3RhdHVzfSlgIDogJyc7XG4gICAgICByZWplY3QobmV3IEVycm9yKGBUaGVyZSB3YXMgYW4gZXJyb3IgZmV0Y2hpbmcgdGhlIGVtYmVkIGNvZGUgZnJvbSBWaW1lbyR7c3RhdHVzfS5gKSk7XG4gICAgfTtcbiAgICB4aHIuc2VuZCgpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIGFsbCBlbWJlZHMgd2l0aGluIGEgc3BlY2lmaWMgZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJlbnQ9ZG9jdW1lbnRdIFRoZSBwYXJlbnQgZWxlbWVudC5cbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluaXRpYWxpemVFbWJlZHMoKSB7XG4gIGxldCBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IGRvY3VtZW50O1xuICBjb25zdCBlbGVtZW50cyA9IFtdLnNsaWNlLmNhbGwocGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXZpbWVvLWlkXSwgW2RhdGEtdmltZW8tdXJsXScpKTtcbiAgY29uc3QgaGFuZGxlRXJyb3IgPSBlcnJvciA9PiB7XG4gICAgaWYgKCdjb25zb2xlJyBpbiB3aW5kb3cgJiYgY29uc29sZS5lcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgVGhlcmUgd2FzIGFuIGVycm9yIGNyZWF0aW5nIGFuIGVtYmVkOiAke2Vycm9yfWApO1xuICAgIH1cbiAgfTtcbiAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gU2tpcCBhbnkgdGhhdCBoYXZlIGRhdGEtdmltZW8tZGVmZXJcbiAgICAgIGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS12aW1lby1kZWZlcicpICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBhcmFtcyA9IGdldE9FbWJlZFBhcmFtZXRlcnMoZWxlbWVudCk7XG4gICAgICBjb25zdCB1cmwgPSBnZXRWaW1lb1VybChwYXJhbXMpO1xuICAgICAgZ2V0T0VtYmVkRGF0YSh1cmwsIHBhcmFtcywgZWxlbWVudCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUVtYmVkKGRhdGEsIGVsZW1lbnQpO1xuICAgICAgfSkuY2F0Y2goaGFuZGxlRXJyb3IpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBoYW5kbGVFcnJvcihlcnJvcik7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBSZXNpemUgZW1iZWRzIHdoZW4gbWVzc2FnZWQgYnkgdGhlIHBsYXllci5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbcGFyZW50PWRvY3VtZW50XSBUaGUgcGFyZW50IGVsZW1lbnQuXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5mdW5jdGlvbiByZXNpemVFbWJlZHMoKSB7XG4gIGxldCBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IGRvY3VtZW50O1xuICAvLyBQcmV2ZW50IGV4ZWN1dGlvbiBpZiB1c2VycyBpbmNsdWRlIHRoZSBwbGF5ZXIuanMgc2NyaXB0IG11bHRpcGxlIHRpbWVzLlxuICBpZiAod2luZG93LlZpbWVvUGxheWVyUmVzaXplRW1iZWRzXykge1xuICAgIHJldHVybjtcbiAgfVxuICB3aW5kb3cuVmltZW9QbGF5ZXJSZXNpemVFbWJlZHNfID0gdHJ1ZTtcbiAgY29uc3Qgb25NZXNzYWdlID0gZXZlbnQgPT4ge1xuICAgIGlmICghaXNWaW1lb1VybChldmVudC5vcmlnaW4pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gJ3NwYWNlY2hhbmdlJyBpcyBmaXJlZCBvbmx5IG9uIGVtYmVkcyB3aXRoIGNhcmRzXG4gICAgaWYgKCFldmVudC5kYXRhIHx8IGV2ZW50LmRhdGEuZXZlbnQgIT09ICdzcGFjZWNoYW5nZScpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2VuZGVySUZyYW1lID0gZXZlbnQuc291cmNlID8gZmluZElmcmFtZUJ5U291cmNlV2luZG93KGV2ZW50LnNvdXJjZSwgcGFyZW50KSA6IG51bGw7XG4gICAgaWYgKHNlbmRlcklGcmFtZSkge1xuICAgICAgLy8gQ2hhbmdlIHBhZGRpbmctYm90dG9tIG9mIHRoZSBlbmNsb3NpbmcgZGl2IHRvIGFjY29tbW9kYXRlXG4gICAgICAvLyBjYXJkIGNhcm91c2VsIHdpdGhvdXQgZGlzdG9ydGluZyBhc3BlY3QgcmF0aW9cbiAgICAgIGNvbnN0IHNwYWNlID0gc2VuZGVySUZyYW1lLnBhcmVudEVsZW1lbnQ7XG4gICAgICBzcGFjZS5zdHlsZS5wYWRkaW5nQm90dG9tID0gYCR7ZXZlbnQuZGF0YS5kYXRhWzBdLmJvdHRvbX1weGA7XG4gICAgfVxuICB9O1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG9uTWVzc2FnZSk7XG59XG5cbi8qKlxuICogQWRkIGNoYXB0ZXJzIHRvIGV4aXN0aW5nIG1ldGFkYXRhIGZvciBHb29nbGUgU0VPXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW3BhcmVudD1kb2N1bWVudF0gVGhlIHBhcmVudCBlbGVtZW50LlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gaW5pdEFwcGVuZFZpZGVvTWV0YWRhdGEoKSB7XG4gIGxldCBwYXJlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IGRvY3VtZW50O1xuICAvLyAgUHJldmVudCBleGVjdXRpb24gaWYgdXNlcnMgaW5jbHVkZSB0aGUgcGxheWVyLmpzIHNjcmlwdCBtdWx0aXBsZSB0aW1lcy5cbiAgaWYgKHdpbmRvdy5WaW1lb1Nlb01ldGFkYXRhQXBwZW5kZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgd2luZG93LlZpbWVvU2VvTWV0YWRhdGFBcHBlbmRlZCA9IHRydWU7XG4gIGNvbnN0IG9uTWVzc2FnZSA9IGV2ZW50ID0+IHtcbiAgICBpZiAoIWlzVmltZW9VcmwoZXZlbnQub3JpZ2luKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkYXRhID0gcGFyc2VNZXNzYWdlRGF0YShldmVudC5kYXRhKTtcbiAgICBpZiAoIWRhdGEgfHwgZGF0YS5ldmVudCAhPT0gJ3JlYWR5Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzZW5kZXJJRnJhbWUgPSBldmVudC5zb3VyY2UgPyBmaW5kSWZyYW1lQnlTb3VyY2VXaW5kb3coZXZlbnQuc291cmNlLCBwYXJlbnQpIDogbnVsbDtcblxuICAgIC8vIEluaXRpYXRlIGFwcGVuZFZpZGVvTWV0YWRhdGEgaWYgaWZyYW1lIGlzIGEgVmltZW8gZW1iZWRcbiAgICBpZiAoc2VuZGVySUZyYW1lICYmIGlzVmltZW9FbWJlZChzZW5kZXJJRnJhbWUuc3JjKSkge1xuICAgICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcihzZW5kZXJJRnJhbWUpO1xuICAgICAgcGxheWVyLmNhbGxNZXRob2QoJ2FwcGVuZFZpZGVvTWV0YWRhdGEnLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgfVxuICB9O1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIG9uTWVzc2FnZSk7XG59XG5cbi8qKlxuICogU2VlayB0byB0aW1lIGluZGljYXRlZCBieSB2aW1lb190IHF1ZXJ5IHBhcmFtZXRlciBpZiBwcmVzZW50IGluIFVSTFxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJlbnQ9ZG9jdW1lbnRdIFRoZSBwYXJlbnQgZWxlbWVudC5cbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGNoZWNrVXJsVGltZVBhcmFtKCkge1xuICBsZXQgcGFyZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBkb2N1bWVudDtcbiAgLy8gIFByZXZlbnQgZXhlY3V0aW9uIGlmIHVzZXJzIGluY2x1ZGUgdGhlIHBsYXllci5qcyBzY3JpcHQgbXVsdGlwbGUgdGltZXMuXG4gIGlmICh3aW5kb3cuVmltZW9DaGVja2VkVXJsVGltZVBhcmFtKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHdpbmRvdy5WaW1lb0NoZWNrZWRVcmxUaW1lUGFyYW0gPSB0cnVlO1xuICBjb25zdCBoYW5kbGVFcnJvciA9IGVycm9yID0+IHtcbiAgICBpZiAoJ2NvbnNvbGUnIGluIHdpbmRvdyAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBUaGVyZSB3YXMgYW4gZXJyb3IgZ2V0dGluZyB2aWRlbyBJZDogJHtlcnJvcn1gKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IG9uTWVzc2FnZSA9IGV2ZW50ID0+IHtcbiAgICBpZiAoIWlzVmltZW9VcmwoZXZlbnQub3JpZ2luKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkYXRhID0gcGFyc2VNZXNzYWdlRGF0YShldmVudC5kYXRhKTtcbiAgICBpZiAoIWRhdGEgfHwgZGF0YS5ldmVudCAhPT0gJ3JlYWR5Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzZW5kZXJJRnJhbWUgPSBldmVudC5zb3VyY2UgPyBmaW5kSWZyYW1lQnlTb3VyY2VXaW5kb3coZXZlbnQuc291cmNlLCBwYXJlbnQpIDogbnVsbDtcbiAgICBpZiAoc2VuZGVySUZyYW1lICYmIGlzVmltZW9FbWJlZChzZW5kZXJJRnJhbWUuc3JjKSkge1xuICAgICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcihzZW5kZXJJRnJhbWUpO1xuICAgICAgcGxheWVyLmdldFZpZGVvSWQoKS50aGVuKHZpZGVvSWQgPT4ge1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gbmV3IFJlZ0V4cChgWz8mXXZpbWVvX3RfJHt2aWRlb0lkfT0oW14mI10qKWApLmV4ZWMod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuICAgICAgICBpZiAobWF0Y2hlcyAmJiBtYXRjaGVzWzFdKSB7XG4gICAgICAgICAgY29uc3Qgc2VjID0gZGVjb2RlVVJJKG1hdGNoZXNbMV0pO1xuICAgICAgICAgIHBsYXllci5zZXRDdXJyZW50VGltZShzZWMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0pLmNhdGNoKGhhbmRsZUVycm9yKTtcbiAgICB9XG4gIH07XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgb25NZXNzYWdlKTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGlmcmFtZSBlbWJlZHMgdG8gc3VwcG9ydCBEUk0gY29udGVudCBwbGF5YmFjayBieSBhZGRpbmcgdGhlICdlbmNyeXB0ZWQtbWVkaWEnIHBlcm1pc3Npb25cbiAqIHRvIHRoZSBpZnJhbWUncyBhbGxvdyBhdHRyaWJ1dGUgd2hlbiBEUk0gaW5pdGlhbGl6YXRpb24gZmFpbHMuIFRoaXMgZnVuY3Rpb24gYWN0cyBhcyBhIGZhbGxiYWNrXG4gKiBtZWNoYW5pc20gdG8gZW5hYmxlIHBsYXliYWNrIG9mIERSTS1wcm90ZWN0ZWQgY29udGVudCBpbiBlbWJlZHMgdGhhdCB3ZXJlbid0IHByb3Blcmx5IGNvbmZpZ3VyZWQuXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gdXBkYXRlRFJNRW1iZWRzKCkge1xuICBpZiAod2luZG93LlZpbWVvRFJNRW1iZWRzVXBkYXRlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB3aW5kb3cuVmltZW9EUk1FbWJlZHNVcGRhdGVkID0gdHJ1ZTtcblxuICAvKipcbiAgICogSGFuZGxlIG1lc3NhZ2UgZXZlbnRzIGZvciBEUk0gaW5pdGlhbGl6YXRpb24gZmFpbHVyZXNcbiAgICogQHBhcmFtIHtNZXNzYWdlRXZlbnR9IGV2ZW50IC0gVGhlIG1lc3NhZ2UgZXZlbnQgZnJvbSB0aGUgaWZyYW1lXG4gICAqL1xuICBjb25zdCBvbk1lc3NhZ2UgPSBldmVudCA9PiB7XG4gICAgaWYgKCFpc1ZpbWVvVXJsKGV2ZW50Lm9yaWdpbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IHBhcnNlTWVzc2FnZURhdGEoZXZlbnQuZGF0YSk7XG4gICAgaWYgKCFkYXRhIHx8IGRhdGEuZXZlbnQgIT09ICdkcm1pbml0ZmFpbGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzZW5kZXJJRnJhbWUgPSBldmVudC5zb3VyY2UgPyBmaW5kSWZyYW1lQnlTb3VyY2VXaW5kb3coZXZlbnQuc291cmNlKSA6IG51bGw7XG4gICAgaWYgKCFzZW5kZXJJRnJhbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudEFsbG93ID0gc2VuZGVySUZyYW1lLmdldEF0dHJpYnV0ZSgnYWxsb3cnKSB8fCAnJztcbiAgICBjb25zdCBhbGxvd1N1cHBvcnRzRFJNID0gY3VycmVudEFsbG93LmluY2x1ZGVzKCdlbmNyeXB0ZWQtbWVkaWEnKTtcbiAgICBpZiAoIWFsbG93U3VwcG9ydHNEUk0pIHtcbiAgICAgIC8vIEZvciBEUk0gcGxheWJhY2sgdG8gc3VjY2Vzc2Z1bGx5IG9jY3VyLCB0aGUgaWZyYW1lIGBhbGxvd2AgYXR0cmlidXRlIG11c3QgaW5jbHVkZSAnZW5jcnlwdGVkLW1lZGlhJy5cbiAgICAgIC8vIElmIHRoZSB2aWRlbyByZXF1aXJlcyBEUk0gYnV0IGRvZXNuJ3QgaGF2ZSB0aGUgYXR0cmlidXRlLCB3ZSB0cnkgdG8gYWRkIG9uIGJlaGFsZiBvZiB0aGUgZW1iZWQgb3duZXJcbiAgICAgIC8vIGFzIGEgdGVtcG9yYXJ5IG1lYXN1cmUgdG8gZW5hYmxlIHBsYXliYWNrIHVudGlsIHRoZXkncmUgYWJsZSB0byB1cGRhdGUgdGhlaXIgZW1iZWRzLlxuICAgICAgc2VuZGVySUZyYW1lLnNldEF0dHJpYnV0ZSgnYWxsb3cnLCBgJHtjdXJyZW50QWxsb3d9OyBlbmNyeXB0ZWQtbWVkaWFgKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRVcmwgPSBuZXcgVVJMKHNlbmRlcklGcmFtZS5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcblxuICAgICAgLy8gQWRkaW5nIHRoaXMgZm9yY2VzIHRoZSBlbWJlZCB0byByZWxvYWQgb25jZSBgYWxsb3dgIGhhcyBiZWVuIHVwZGF0ZWQgd2l0aCBgZW5jcnlwdGVkLW1lZGlhYC5cbiAgICAgIGN1cnJlbnRVcmwuc2VhcmNoUGFyYW1zLnNldCgnZm9yY2VyZWxvYWQnLCAnZHJtJyk7XG4gICAgICBzZW5kZXJJRnJhbWUuc2V0QXR0cmlidXRlKCdzcmMnLCBjdXJyZW50VXJsLnRvU3RyaW5nKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBvbk1lc3NhZ2UpO1xufVxuXG4vKiBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIFNpbmRyZSBTb3JodXMgPHNpbmRyZXNvcmh1c0BnbWFpbC5jb20+IChzaW5kcmVzb3JodXMuY29tKVxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5UZXJtcyAqL1xuXG5mdW5jdGlvbiBpbml0aWFsaXplU2NyZWVuZnVsbCgpIHtcbiAgY29uc3QgZm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IHZhbDtcbiAgICBjb25zdCBmbk1hcCA9IFtbJ3JlcXVlc3RGdWxsc2NyZWVuJywgJ2V4aXRGdWxsc2NyZWVuJywgJ2Z1bGxzY3JlZW5FbGVtZW50JywgJ2Z1bGxzY3JlZW5FbmFibGVkJywgJ2Z1bGxzY3JlZW5jaGFuZ2UnLCAnZnVsbHNjcmVlbmVycm9yJ10sXG4gICAgLy8gTmV3IFdlYktpdFxuICAgIFsnd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4nLCAnd2Via2l0RXhpdEZ1bGxzY3JlZW4nLCAnd2Via2l0RnVsbHNjcmVlbkVsZW1lbnQnLCAnd2Via2l0RnVsbHNjcmVlbkVuYWJsZWQnLCAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsICd3ZWJraXRmdWxsc2NyZWVuZXJyb3InXSxcbiAgICAvLyBPbGQgV2ViS2l0XG4gICAgWyd3ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbicsICd3ZWJraXRDYW5jZWxGdWxsU2NyZWVuJywgJ3dlYmtpdEN1cnJlbnRGdWxsU2NyZWVuRWxlbWVudCcsICd3ZWJraXRDYW5jZWxGdWxsU2NyZWVuJywgJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCAnd2Via2l0ZnVsbHNjcmVlbmVycm9yJ10sIFsnbW96UmVxdWVzdEZ1bGxTY3JlZW4nLCAnbW96Q2FuY2VsRnVsbFNjcmVlbicsICdtb3pGdWxsU2NyZWVuRWxlbWVudCcsICdtb3pGdWxsU2NyZWVuRW5hYmxlZCcsICdtb3pmdWxsc2NyZWVuY2hhbmdlJywgJ21vemZ1bGxzY3JlZW5lcnJvciddLCBbJ21zUmVxdWVzdEZ1bGxzY3JlZW4nLCAnbXNFeGl0RnVsbHNjcmVlbicsICdtc0Z1bGxzY3JlZW5FbGVtZW50JywgJ21zRnVsbHNjcmVlbkVuYWJsZWQnLCAnTVNGdWxsc2NyZWVuQ2hhbmdlJywgJ01TRnVsbHNjcmVlbkVycm9yJ11dO1xuICAgIGxldCBpID0gMDtcbiAgICBjb25zdCBsID0gZm5NYXAubGVuZ3RoO1xuICAgIGNvbnN0IHJldCA9IHt9O1xuICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YWwgPSBmbk1hcFtpXTtcbiAgICAgIGlmICh2YWwgJiYgdmFsWzFdIGluIGRvY3VtZW50KSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICByZXRbZm5NYXBbMF1baV1dID0gdmFsW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSgpO1xuICBjb25zdCBldmVudE5hbWVNYXAgPSB7XG4gICAgZnVsbHNjcmVlbmNoYW5nZTogZm4uZnVsbHNjcmVlbmNoYW5nZSxcbiAgICBmdWxsc2NyZWVuZXJyb3I6IGZuLmZ1bGxzY3JlZW5lcnJvclxuICB9O1xuICBjb25zdCBzY3JlZW5mdWxsID0ge1xuICAgIHJlcXVlc3QoZWxlbWVudCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgb25GdWxsU2NyZWVuRW50ZXJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzY3JlZW5mdWxsLm9mZignZnVsbHNjcmVlbmNoYW5nZScsIG9uRnVsbFNjcmVlbkVudGVyZWQpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyZWVuZnVsbC5vbignZnVsbHNjcmVlbmNoYW5nZScsIG9uRnVsbFNjcmVlbkVudGVyZWQpO1xuICAgICAgICBlbGVtZW50ID0gZWxlbWVudCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHJldHVyblByb21pc2UgPSBlbGVtZW50W2ZuLnJlcXVlc3RGdWxsc2NyZWVuXSgpO1xuICAgICAgICBpZiAocmV0dXJuUHJvbWlzZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICByZXR1cm5Qcm9taXNlLnRoZW4ob25GdWxsU2NyZWVuRW50ZXJlZCkuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBleGl0KCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKCFzY3JlZW5mdWxsLmlzRnVsbHNjcmVlbikge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb25GdWxsU2NyZWVuRXhpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzY3JlZW5mdWxsLm9mZignZnVsbHNjcmVlbmNoYW5nZScsIG9uRnVsbFNjcmVlbkV4aXQpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2NyZWVuZnVsbC5vbignZnVsbHNjcmVlbmNoYW5nZScsIG9uRnVsbFNjcmVlbkV4aXQpO1xuICAgICAgICBjb25zdCByZXR1cm5Qcm9taXNlID0gZG9jdW1lbnRbZm4uZXhpdEZ1bGxzY3JlZW5dKCk7XG4gICAgICAgIGlmIChyZXR1cm5Qcm9taXNlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgIHJldHVyblByb21pc2UudGhlbihvbkZ1bGxTY3JlZW5FeGl0KS5jYXRjaChyZWplY3QpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIG9uKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgY29uc3QgZXZlbnROYW1lID0gZXZlbnROYW1lTWFwW2V2ZW50XTtcbiAgICAgIGlmIChldmVudE5hbWUpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9mZihldmVudCwgY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGV2ZW50TmFtZU1hcFtldmVudF07XG4gICAgICBpZiAoZXZlbnROYW1lKSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzY3JlZW5mdWxsLCB7XG4gICAgaXNGdWxsc2NyZWVuOiB7XG4gICAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKGRvY3VtZW50W2ZuLmZ1bGxzY3JlZW5FbGVtZW50XSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbGVtZW50OiB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnRbZm4uZnVsbHNjcmVlbkVsZW1lbnRdO1xuICAgICAgfVxuICAgIH0sXG4gICAgaXNFbmFibGVkOiB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0KCkge1xuICAgICAgICAvLyBDb2VyY2UgdG8gYm9vbGVhbiBpbiBjYXNlIG9mIG9sZCBXZWJLaXRcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oZG9jdW1lbnRbZm4uZnVsbHNjcmVlbkVuYWJsZWRdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc2NyZWVuZnVsbDtcbn1cblxuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4vdGltaW5nLXNyYy1jb25uZWN0b3IudHlwZXMnKS5QbGF5ZXJDb250cm9sc30gUGxheWVyQ29udHJvbHMgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCd0aW1pbmctb2JqZWN0JykuSVRpbWluZ09iamVjdH0gVGltaW5nT2JqZWN0ICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi90aW1pbmctc3JjLWNvbm5lY3Rvci50eXBlcycpLlRpbWluZ1NyY0Nvbm5lY3Rvck9wdGlvbnN9IFRpbWluZ1NyY0Nvbm5lY3Rvck9wdGlvbnMgKi9cbi8qKiBAdHlwZWRlZiB7KG1zZzogc3RyaW5nKSA9PiBhbnl9IExvZ2dlciAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJ3RpbWluZy1vYmplY3QnKS5UQ29ubmVjdGlvblN0YXRlfSBUQ29ubmVjdGlvblN0YXRlICovXG5cbi8qKlxuICogQHR5cGUge1RpbWluZ1NyY0Nvbm5lY3Rvck9wdGlvbnN9XG4gKlxuICogRm9yIGRldGFpbHMgb24gdGhlc2UgcHJvcGVydGllcyBhbmQgdGhlaXIgZWZmZWN0cywgc2VlIHRoZSB0eXBlc2NyaXB0IGRlZmluaXRpb24gcmVmZXJlbmNlZCBhYm92ZS5cbiAqL1xuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIHJvbGU6ICd2aWV3ZXInLFxuICBhdXRvUGxheU11dGVkOiB0cnVlLFxuICBhbGxvd2VkRHJpZnQ6IDAuMyxcbiAgbWF4QWxsb3dlZERyaWZ0OiAxLFxuICBtaW5DaGVja0ludGVydmFsOiAwLjEsXG4gIG1heFJhdGVBZGp1c3RtZW50OiAwLjIsXG4gIG1heFRpbWVUb0NhdGNoVXA6IDFcbn07XG5cbi8qKlxuICogVGhlcmUncyBhIHByb3Bvc2VkIFczQyBzcGVjIGZvciB0aGUgVGltaW5nIE9iamVjdCB3aGljaCB3b3VsZCBpbnRyb2R1Y2UgYSBuZXcgc2V0IG9mIEFQSXMgdGhhdCB3b3VsZCBzaW1wbGlmeSB0aW1lLXN5bmNocm9uaXphdGlvbiB0YXNrcyBmb3IgYnJvd3NlciBhcHBsaWNhdGlvbnMuXG4gKlxuICogUHJvcG9zZWQgc3BlYzogaHR0cHM6Ly93ZWJ0aW1pbmcuZ2l0aHViLmlvL3RpbWluZ29iamVjdC9cbiAqIFYzIFNwZWM6IGh0dHBzOi8vdGltaW5nc3JjLnJlYWR0aGVkb2NzLmlvL2VuL2xhdGVzdC9cbiAqIERlbXV4ZWQgdGFsazogaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1jWlNqRGFHRG1YOFxuICpcbiAqIFRoaXMgY2xhc3MgbWFrZXMgaXQgZWFzeSB0byBjb25uZWN0IFZpbWVvLlBsYXllciB0byBhIHByb3ZpZGVkIFRpbWluZ09iamVjdCB2aWEgVmltZW8uUGxheWVyLnNldFRpbWluZ1NyYyhteVRpbWluZ09iamVjdCwgb3B0aW9ucykgYW5kIHRoZSBzeW5jaHJvbml6YXRpb24gd2lsbCBiZSBoYW5kbGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogVGhlcmUgYXJlIDUgZ2VuZXJhbCByZXNwb25zaWJpbGl0aWVzIGluIFRpbWluZ1NyY0Nvbm5lY3RvcjpcbiAqXG4gKiAxLiBgdXBkYXRlUGxheWVyKClgIHdoaWNoIHNldHMgdGhlIHBsYXllcidzIGN1cnJlbnRUaW1lLCBwbGF5YmFja1JhdGUgYW5kIHBhdXNlL3BsYXkgc3RhdGUgYmFzZWQgb24gY3VycmVudCBzdGF0ZSBvZiB0aGUgVGltaW5nT2JqZWN0LlxuICogMi4gYHVwZGF0ZVRpbWluZ09iamVjdCgpYCB3aGljaCBzZXRzIHRoZSBUaW1pbmdPYmplY3QncyBwb3NpdGlvbiBhbmQgdmVsb2NpdHkgZnJvbSB0aGUgcGxheWVyJ3Mgc3RhdGUuXG4gKiAzLiBgcGxheWVyVXBkYXRlcmAgd2hpY2ggbGlzdGVucyBmb3IgY2hhbmdlIGV2ZW50cyBvbiB0aGUgVGltaW5nT2JqZWN0IGFuZCB3aWxsIHJlc3BvbmQgYnkgY2FsbGluZyB1cGRhdGVQbGF5ZXIuXG4gKiA0LiBgdGltaW5nT2JqZWN0VXBkYXRlcmAgd2hpY2ggbGlzdGVucyB0byB0aGUgcGxheWVyIGV2ZW50cyBvZiBzZWVrZWQsIHBsYXkgYW5kIHBhdXNlIGFuZCB3aWxsIHJlc3BvbmQgYnkgY2FsbGluZyBgdXBkYXRlVGltaW5nT2JqZWN0KClgLlxuICogNS4gYG1haW50YWluUGxheWJhY2tQb3NpdGlvbmAgdGhpcyBpcyBjb2RlIHRoYXQgY29uc3RhbnRseSBtb25pdG9ycyB0aGUgcGxheWVyIHRvIG1ha2Ugc3VyZSBpdCdzIGFsd2F5cyBpbiBzeW5jIHdpdGggdGhlIFRpbWluZ09iamVjdC4gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB2aWRlb3Mgd2lsbCBnZW5lcmFsbHkgbm90IHBsYXkgd2l0aCBwcmVjaXNlIHRpbWUgYWNjdXJhY3kgYW5kIHRoZXJlIHdpbGwgYmUgc29tZSBkcmlmdCB3aGljaCBiZWNvbWVzIG1vcmUgbm90aWNlYWJsZSBvdmVyIGxvbmdlciBwZXJpb2RzIChhcyBub3RlZCBpbiB0aGUgdGltaW5nLW9iamVjdCBzcGVjKS4gTW9yZSBkZXRhaWxzIG9uIHRoaXMgbWV0aG9kIGJlbG93LlxuICovXG5jbGFzcyBUaW1pbmdTcmNDb25uZWN0b3IgZXh0ZW5kcyBFdmVudFRhcmdldCB7XG4gIGxvZ2dlcjtcblxuICAvKipcbiAgICogQHBhcmFtIHtQbGF5ZXJDb250cm9sc30gcGxheWVyXG4gICAqIEBwYXJhbSB7VGltaW5nT2JqZWN0fSB0aW1pbmdPYmplY3RcbiAgICogQHBhcmFtIHtUaW1pbmdTcmNDb25uZWN0b3JPcHRpb25zfSBvcHRpb25zXG4gICAqIEBwYXJhbSB7TG9nZ2VyfSBsb2dnZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBsYXllciwgdGltaW5nT2JqZWN0KSB7XG4gICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgIGxldCBsb2dnZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMyA/IGFyZ3VtZW50c1szXSA6IHVuZGVmaW5lZDtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubG9nZ2VyID0gbG9nZ2VyO1xuICAgIHRoaXMuaW5pdCh0aW1pbmdPYmplY3QsIHBsYXllciwge1xuICAgICAgLi4uZGVmYXVsdE9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zXG4gICAgfSk7XG4gIH1cbiAgZGlzY29ubmVjdCgpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdkaXNjb25uZWN0JykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VGltaW5nT2JqZWN0fSB0aW1pbmdPYmplY3RcbiAgICogQHBhcmFtIHtQbGF5ZXJDb250cm9sc30gcGxheWVyXG4gICAqIEBwYXJhbSB7VGltaW5nU3JjQ29ubmVjdG9yT3B0aW9uc30gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgYXN5bmMgaW5pdCh0aW1pbmdPYmplY3QsIHBsYXllciwgb3B0aW9ucykge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvclRPUmVhZHlTdGF0ZSh0aW1pbmdPYmplY3QsICdvcGVuJyk7XG4gICAgaWYgKG9wdGlvbnMucm9sZSA9PT0gJ3ZpZXdlcicpIHtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlUGxheWVyKHRpbWluZ09iamVjdCwgcGxheWVyLCBvcHRpb25zKTtcbiAgICAgIGNvbnN0IHBsYXllclVwZGF0ZXIgPSBzdWJzY3JpYmUodGltaW5nT2JqZWN0LCAnY2hhbmdlJywgKCkgPT4gdGhpcy51cGRhdGVQbGF5ZXIodGltaW5nT2JqZWN0LCBwbGF5ZXIsIG9wdGlvbnMpKTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uU3luYyA9IHRoaXMubWFpbnRhaW5QbGF5YmFja1Bvc2l0aW9uKHRpbWluZ09iamVjdCwgcGxheWVyLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignZGlzY29ubmVjdCcsICgpID0+IHtcbiAgICAgICAgcG9zaXRpb25TeW5jLmNhbmNlbCgpO1xuICAgICAgICBwbGF5ZXJVcGRhdGVyLmNhbmNlbCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlVGltaW5nT2JqZWN0KHRpbWluZ09iamVjdCwgcGxheWVyKTtcbiAgICAgIGNvbnN0IHRpbWluZ09iamVjdFVwZGF0ZXIgPSBzdWJzY3JpYmUocGxheWVyLCBbJ3NlZWtlZCcsICdwbGF5JywgJ3BhdXNlJywgJ3JhdGVjaGFuZ2UnXSwgKCkgPT4gdGhpcy51cGRhdGVUaW1pbmdPYmplY3QodGltaW5nT2JqZWN0LCBwbGF5ZXIpLCAnb24nLCAnb2ZmJyk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB0aW1pbmdPYmplY3RVcGRhdGVyLmNhbmNlbCgpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgVGltaW5nT2JqZWN0J3Mgc3RhdGUgdG8gcmVmbGVjdCB0aGF0IG9mIHRoZSBwbGF5ZXJcbiAgICpcbiAgICogQHBhcmFtIHtUaW1pbmdPYmplY3R9IHRpbWluZ09iamVjdFxuICAgKiBAcGFyYW0ge1BsYXllckNvbnRyb2xzfSBwbGF5ZXJcbiAgICogQHJldHVybiB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIGFzeW5jIHVwZGF0ZVRpbWluZ09iamVjdCh0aW1pbmdPYmplY3QsIHBsYXllcikge1xuICAgIGNvbnN0IFtwb3NpdGlvbiwgaXNQYXVzZWQsIHBsYXliYWNrUmF0ZV0gPSBhd2FpdCBQcm9taXNlLmFsbChbcGxheWVyLmdldEN1cnJlbnRUaW1lKCksIHBsYXllci5nZXRQYXVzZWQoKSwgcGxheWVyLmdldFBsYXliYWNrUmF0ZSgpXSk7XG4gICAgdGltaW5nT2JqZWN0LnVwZGF0ZSh7XG4gICAgICBwb3NpdGlvbixcbiAgICAgIHZlbG9jaXR5OiBpc1BhdXNlZCA/IDAgOiBwbGF5YmFja1JhdGVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwbGF5ZXIncyB0aW1pbmcgc3RhdGUgdG8gcmVmbGVjdCB0aGF0IG9mIHRoZSBUaW1pbmdPYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtUaW1pbmdPYmplY3R9IHRpbWluZ09iamVjdFxuICAgKiBAcGFyYW0ge1BsYXllckNvbnRyb2xzfSBwbGF5ZXJcbiAgICogQHBhcmFtIHtUaW1pbmdTcmNDb25uZWN0b3JPcHRpb25zfSBvcHRpb25zXG4gICAqIEByZXR1cm4ge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBhc3luYyB1cGRhdGVQbGF5ZXIodGltaW5nT2JqZWN0LCBwbGF5ZXIsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICBwb3NpdGlvbixcbiAgICAgIHZlbG9jaXR5XG4gICAgfSA9IHRpbWluZ09iamVjdC5xdWVyeSgpO1xuICAgIGlmICh0eXBlb2YgcG9zaXRpb24gPT09ICdudW1iZXInKSB7XG4gICAgICBwbGF5ZXIuc2V0Q3VycmVudFRpbWUocG9zaXRpb24pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZlbG9jaXR5ID09PSAnbnVtYmVyJykge1xuICAgICAgaWYgKHZlbG9jaXR5ID09PSAwKSB7XG4gICAgICAgIGlmICgoYXdhaXQgcGxheWVyLmdldFBhdXNlZCgpKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh2ZWxvY2l0eSA+IDApIHtcbiAgICAgICAgaWYgKChhd2FpdCBwbGF5ZXIuZ2V0UGF1c2VkKCkpID09PSB0cnVlKSB7XG4gICAgICAgICAgYXdhaXQgcGxheWVyLnBsYXkoKS5jYXRjaChhc3luYyBlcnIgPT4ge1xuICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnTm90QWxsb3dlZEVycm9yJyAmJiBvcHRpb25zLmF1dG9QbGF5TXV0ZWQpIHtcbiAgICAgICAgICAgICAgYXdhaXQgcGxheWVyLnNldE11dGVkKHRydWUpO1xuICAgICAgICAgICAgICBhd2FpdCBwbGF5ZXIucGxheSgpLmNhdGNoKGVycjIgPT4gY29uc29sZS5lcnJvcignQ291bGRuXFwndCBwbGF5IHRoZSB2aWRlbyBmcm9tIFRpbWluZ1NyY0Nvbm5lY3Rvci4gRXJyb3I6JywgZXJyMikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMudXBkYXRlUGxheWVyKHRpbWluZ09iamVjdCwgcGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGF3YWl0IHBsYXllci5nZXRQbGF5YmFja1JhdGUoKSkgIT09IHZlbG9jaXR5KSB7XG4gICAgICAgICAgcGxheWVyLnNldFBsYXliYWNrUmF0ZSh2ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2luY2UgdmlkZW8gcGxheWVycyBkbyBub3QgcGxheSB3aXRoIDEwMCUgdGltZSBwcmVjaXNpb24sIHdlIG5lZWQgdG8gY2xvc2VseSBtb25pdG9yXG4gICAqIG91ciBwbGF5ZXIgdG8gYmUgc3VyZSBpdCByZW1haW5zIGluIHN5bmMgd2l0aCB0aGUgVGltaW5nT2JqZWN0LlxuICAgKlxuICAgKiBJZiBvdXQgb2Ygc3luYywgd2UgdXNlIHRoZSBjdXJyZW50IGNvbmRpdGlvbnMgYW5kIHRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIGRldGVybWluZVxuICAgKiB3aGV0aGVyIHRvIHJlLXN5bmMgdmlhIHNldHRpbmcgY3VycmVudFRpbWUgb3IgYWRqdXN0aW5nIHRoZSBwbGF5YmFja1JhdGVcbiAgICpcbiAgICogQHBhcmFtIHtUaW1pbmdPYmplY3R9IHRpbWluZ09iamVjdFxuICAgKiBAcGFyYW0ge1BsYXllckNvbnRyb2xzfSBwbGF5ZXJcbiAgICogQHBhcmFtIHtUaW1pbmdTcmNDb25uZWN0b3JPcHRpb25zfSBvcHRpb25zXG4gICAqIEByZXR1cm4ge3tjYW5jZWw6IChmdW5jdGlvbigpOiB2b2lkKX19XG4gICAqL1xuICBtYWludGFpblBsYXliYWNrUG9zaXRpb24odGltaW5nT2JqZWN0LCBwbGF5ZXIsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICBhbGxvd2VkRHJpZnQsXG4gICAgICBtYXhBbGxvd2VkRHJpZnQsXG4gICAgICBtaW5DaGVja0ludGVydmFsLFxuICAgICAgbWF4UmF0ZUFkanVzdG1lbnQsXG4gICAgICBtYXhUaW1lVG9DYXRjaFVwXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgY29uc3Qgc3luY0ludGVydmFsID0gTWF0aC5taW4obWF4VGltZVRvQ2F0Y2hVcCwgTWF0aC5tYXgobWluQ2hlY2tJbnRlcnZhbCwgbWF4QWxsb3dlZERyaWZ0KSkgKiAxMDAwO1xuICAgIGNvbnN0IGNoZWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKHRpbWluZ09iamVjdC5xdWVyeSgpLnZlbG9jaXR5ID09PSAwIHx8IChhd2FpdCBwbGF5ZXIuZ2V0UGF1c2VkKCkpID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpZmYgPSB0aW1pbmdPYmplY3QucXVlcnkoKS5wb3NpdGlvbiAtIChhd2FpdCBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XG4gICAgICBjb25zdCBkaWZmQWJzID0gTWF0aC5hYnMoZGlmZik7XG4gICAgICB0aGlzLmxvZyhgRHJpZnQ6ICR7ZGlmZn1gKTtcbiAgICAgIGlmIChkaWZmQWJzID4gbWF4QWxsb3dlZERyaWZ0KSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYWRqdXN0U3BlZWQocGxheWVyLCAwKTtcbiAgICAgICAgcGxheWVyLnNldEN1cnJlbnRUaW1lKHRpbWluZ09iamVjdC5xdWVyeSgpLnBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5sb2coJ1Jlc3luYyBieSBjdXJyZW50VGltZScpO1xuICAgICAgfSBlbHNlIGlmIChkaWZmQWJzID4gYWxsb3dlZERyaWZ0KSB7XG4gICAgICAgIGNvbnN0IG1pbiA9IGRpZmZBYnMgLyBtYXhUaW1lVG9DYXRjaFVwO1xuICAgICAgICBjb25zdCBtYXggPSBtYXhSYXRlQWRqdXN0bWVudDtcbiAgICAgICAgY29uc3QgYWRqdXN0bWVudCA9IG1pbiA8IG1heCA/IChtYXggLSBtaW4pIC8gMiA6IG1heDtcbiAgICAgICAgYXdhaXQgdGhpcy5hZGp1c3RTcGVlZChwbGF5ZXIsIGFkanVzdG1lbnQgKiBNYXRoLnNpZ24oZGlmZikpO1xuICAgICAgICB0aGlzLmxvZygnUmVzeW5jIGJ5IHBsYXliYWNrUmF0ZScpO1xuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiBjaGVjaygpLCBzeW5jSW50ZXJ2YWwpO1xuICAgIHJldHVybiB7XG4gICAgICBjYW5jZWw6ICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbXNnXG4gICAqL1xuICBsb2cobXNnKSB7XG4gICAgdGhpcy5sb2dnZXI/LihgVGltaW5nU3JjQ29ubmVjdG9yOiAke21zZ31gKTtcbiAgfVxuICBzcGVlZEFkanVzdG1lbnQgPSAwO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1BsYXllckNvbnRyb2xzfSBwbGF5ZXJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld0FkanVzdG1lbnRcbiAgICogQHJldHVybiB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIGFkanVzdFNwZWVkID0gYXN5bmMgKHBsYXllciwgbmV3QWRqdXN0bWVudCkgPT4ge1xuICAgIGlmICh0aGlzLnNwZWVkQWRqdXN0bWVudCA9PT0gbmV3QWRqdXN0bWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBuZXdQbGF5YmFja1JhdGUgPSAoYXdhaXQgcGxheWVyLmdldFBsYXliYWNrUmF0ZSgpKSAtIHRoaXMuc3BlZWRBZGp1c3RtZW50ICsgbmV3QWRqdXN0bWVudDtcbiAgICB0aGlzLmxvZyhgTmV3IHBsYXliYWNrUmF0ZTogICR7bmV3UGxheWJhY2tSYXRlfWApO1xuICAgIGF3YWl0IHBsYXllci5zZXRQbGF5YmFja1JhdGUobmV3UGxheWJhY2tSYXRlKTtcbiAgICB0aGlzLnNwZWVkQWRqdXN0bWVudCA9IG5ld0FkanVzdG1lbnQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VGltaW5nT2JqZWN0fSB0aW1pbmdPYmplY3RcbiAgICogQHBhcmFtIHtUQ29ubmVjdGlvblN0YXRlfSBzdGF0ZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgd2FpdEZvclRPUmVhZHlTdGF0ZSh0aW1pbmdPYmplY3QsIHN0YXRlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgY29uc3QgY2hlY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aW1pbmdPYmplY3QucmVhZHlTdGF0ZSA9PT0gc3RhdGUpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGltaW5nT2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCBjaGVjaywge1xuICAgICAgICAgICAgb25jZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hlY2soKTtcbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBwbGF5ZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmVhZHlNYXAgPSBuZXcgV2Vha01hcCgpO1xubGV0IHNjcmVlbmZ1bGwgPSB7fTtcbmNsYXNzIFBsYXllciB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBQbGF5ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7KEhUTUxJRnJhbWVFbGVtZW50fEhUTUxFbGVtZW50fHN0cmluZ3xqUXVlcnkpfSBlbGVtZW50IEEgcmVmZXJlbmNlIHRvIHRoZSBWaW1lb1xuICAgKiAgICAgICAgcGxheWVyIGlmcmFtZSwgYW5kIGlkLCBvciBhIGpRdWVyeSBvYmplY3QuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gb0VtYmVkIHBhcmFtZXRlcnMgdG8gdXNlIHdoZW4gY3JlYXRpbmcgYW4gZW1iZWQgaW4gdGhlIGVsZW1lbnQuXG4gICAqIEByZXR1cm4ge1BsYXllcn1cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgLyogZ2xvYmFsIGpRdWVyeSAqL1xuICAgIGlmICh3aW5kb3cualF1ZXJ5ICYmIGVsZW1lbnQgaW5zdGFuY2VvZiBqUXVlcnkpIHtcbiAgICAgIGlmIChlbGVtZW50Lmxlbmd0aCA+IDEgJiYgd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignQSBqUXVlcnkgb2JqZWN0IHdpdGggbXVsdGlwbGUgZWxlbWVudHMgd2FzIHBhc3NlZCwgdXNpbmcgdGhlIGZpcnN0IGVsZW1lbnQuJyk7XG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudFswXTtcbiAgICB9XG5cbiAgICAvLyBGaW5kIGFuIGVsZW1lbnQgYnkgSURcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50KTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYW4gZWxlbWVudCFcbiAgICBpZiAoIWlzRG9tRWxlbWVudChlbGVtZW50KSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBlaXRoZXIgYSB2YWxpZCBlbGVtZW50IG9yIGEgdmFsaWQgaWQuJyk7XG4gICAgfVxuXG4gICAgLy8gQWxyZWFkeSBpbml0aWFsaXplZCBhbiBlbWJlZCBpbiB0aGlzIGRpdiwgc28gZ3JhYiB0aGUgaWZyYW1lXG4gICAgaWYgKGVsZW1lbnQubm9kZU5hbWUgIT09ICdJRlJBTUUnKSB7XG4gICAgICBjb25zdCBpZnJhbWUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpO1xuICAgICAgaWYgKGlmcmFtZSkge1xuICAgICAgICBlbGVtZW50ID0gaWZyYW1lO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmcmFtZSB1cmwgaXMgbm90IGEgVmltZW8gdXJsXG4gICAgaWYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdJRlJBTUUnICYmICFpc1ZpbWVvVXJsKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSB8fCAnJykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHBsYXllciBlbGVtZW50IHBhc3NlZCBpc27igJl0IGEgVmltZW8gZW1iZWQuJyk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHBsYXllciBvYmplY3QgaW4gdGhlIG1hcCwgcmV0dXJuIHRoYXRcbiAgICBpZiAocGxheWVyTWFwLmhhcyhlbGVtZW50KSkge1xuICAgICAgcmV0dXJuIHBsYXllck1hcC5nZXQoZWxlbWVudCk7XG4gICAgfVxuICAgIHRoaXMuX3dpbmRvdyA9IGVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldztcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3JpZ2luID0gJyonO1xuICAgIGNvbnN0IHJlYWR5UHJvbWlzZSA9IG5ldyBucG9fc3JjKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX29uTWVzc2FnZSA9IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCFpc1ZpbWVvVXJsKGV2ZW50Lm9yaWdpbikgfHwgdGhpcy5lbGVtZW50LmNvbnRlbnRXaW5kb3cgIT09IGV2ZW50LnNvdXJjZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcmlnaW4gPT09ICcqJykge1xuICAgICAgICAgIHRoaXMub3JpZ2luID0gZXZlbnQub3JpZ2luO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRhdGEgPSBwYXJzZU1lc3NhZ2VEYXRhKGV2ZW50LmRhdGEpO1xuICAgICAgICBjb25zdCBpc0Vycm9yID0gZGF0YSAmJiBkYXRhLmV2ZW50ID09PSAnZXJyb3InO1xuICAgICAgICBjb25zdCBpc1JlYWR5RXJyb3IgPSBpc0Vycm9yICYmIGRhdGEuZGF0YSAmJiBkYXRhLmRhdGEubWV0aG9kID09PSAncmVhZHknO1xuICAgICAgICBpZiAoaXNSZWFkeUVycm9yKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoZGF0YS5kYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgIGVycm9yLm5hbWUgPSBkYXRhLmRhdGEubmFtZTtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc1JlYWR5RXZlbnQgPSBkYXRhICYmIGRhdGEuZXZlbnQgPT09ICdyZWFkeSc7XG4gICAgICAgIGNvbnN0IGlzUGluZ1Jlc3BvbnNlID0gZGF0YSAmJiBkYXRhLm1ldGhvZCA9PT0gJ3BpbmcnO1xuICAgICAgICBpZiAoaXNSZWFkeUV2ZW50IHx8IGlzUGluZ1Jlc3BvbnNlKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1yZWFkeScsICd0cnVlJyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzRGF0YSh0aGlzLCBkYXRhKTtcbiAgICAgIH07XG4gICAgICB0aGlzLl93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMuX29uTWVzc2FnZSk7XG4gICAgICBpZiAodGhpcy5lbGVtZW50Lm5vZGVOYW1lICE9PSAnSUZSQU1FJykge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBnZXRPRW1iZWRQYXJhbWV0ZXJzKGVsZW1lbnQsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCB1cmwgPSBnZXRWaW1lb1VybChwYXJhbXMpO1xuICAgICAgICBnZXRPRW1iZWREYXRhKHVybCwgcGFyYW1zLCBlbGVtZW50KS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgIGNvbnN0IGlmcmFtZSA9IGNyZWF0ZUVtYmVkKGRhdGEsIGVsZW1lbnQpO1xuICAgICAgICAgIC8vIE92ZXJ3cml0ZSBlbGVtZW50IHdpdGggdGhlIG5ldyBpZnJhbWUsXG4gICAgICAgICAgLy8gYnV0IHN0b3JlIHJlZmVyZW5jZSB0byB0aGUgb3JpZ2luYWwgZWxlbWVudFxuICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGlmcmFtZTtcbiAgICAgICAgICB0aGlzLl9vcmlnaW5hbEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICAgIHN3YXBDYWxsYmFja3MoZWxlbWVudCwgaWZyYW1lKTtcbiAgICAgICAgICBwbGF5ZXJNYXAuc2V0KHRoaXMuZWxlbWVudCwgdGhpcyk7XG4gICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBTdG9yZSBhIGNvcHkgb2YgdGhpcyBQbGF5ZXIgaW4gdGhlIG1hcFxuICAgIHJlYWR5TWFwLnNldCh0aGlzLCByZWFkeVByb21pc2UpO1xuICAgIHBsYXllck1hcC5zZXQodGhpcy5lbGVtZW50LCB0aGlzKTtcblxuICAgIC8vIFNlbmQgYSBwaW5nIHRvIHRoZSBpZnJhbWUgc28gdGhlIHJlYWR5IHByb21pc2Ugd2lsbCBiZSByZXNvbHZlZCBpZlxuICAgIC8vIHRoZSBwbGF5ZXIgaXMgYWxyZWFkeSByZWFkeS5cbiAgICBpZiAodGhpcy5lbGVtZW50Lm5vZGVOYW1lID09PSAnSUZSQU1FJykge1xuICAgICAgcG9zdE1lc3NhZ2UodGhpcywgJ3BpbmcnKTtcbiAgICB9XG4gICAgaWYgKHNjcmVlbmZ1bGwuaXNFbmFibGVkKSB7XG4gICAgICBjb25zdCBleGl0RnVsbHNjcmVlbiA9ICgpID0+IHNjcmVlbmZ1bGwuZXhpdCgpO1xuICAgICAgdGhpcy5mdWxsc2NyZWVuY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKHNjcmVlbmZ1bGwuaXNGdWxsc2NyZWVuKSB7XG4gICAgICAgICAgc3RvcmVDYWxsYmFjayh0aGlzLCAnZXZlbnQ6ZXhpdEZ1bGxzY3JlZW4nLCBleGl0RnVsbHNjcmVlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVtb3ZlQ2FsbGJhY2sodGhpcywgJ2V2ZW50OmV4aXRGdWxsc2NyZWVuJywgZXhpdEZ1bGxzY3JlZW4pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICB0aGlzLnJlYWR5KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcG9zdE1lc3NhZ2UodGhpcywgJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzY3JlZW5mdWxsLmlzRnVsbHNjcmVlbik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHNjcmVlbmZ1bGwub24oJ2Z1bGxzY3JlZW5jaGFuZ2UnLCB0aGlzLmZ1bGxzY3JlZW5jaGFuZ2VIYW5kbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgdG8gc2VlIGlmIHRoZSBVUkwgaXMgYSBWaW1lbyBVUkwuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCBzdHJpbmcuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzdGF0aWMgaXNWaW1lb1VybCh1cmwpIHtcbiAgICByZXR1cm4gaXNWaW1lb1VybCh1cmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHByb21pc2UgZm9yIGEgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgQVBJIG1ldGhvZCB0byBjYWxsLlxuICAgKiBAcGFyYW0gey4uLihzdHJpbmd8bnVtYmVyfG9iamVjdHxBcnJheSl9IGFyZ3MgQXJndW1lbnRzIHRvIHNlbmQgdmlhIHBvc3RNZXNzYWdlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgY2FsbE1ldGhvZChuYW1lKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuICAgIGlmIChuYW1lID09PSB1bmRlZmluZWQgfHwgbmFtZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIG1ldGhvZCBuYW1lLicpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IG5wb19zcmMoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gV2UgYXJlIHN0b3JpbmcgdGhlIHJlc29sdmUvcmVqZWN0IGhhbmRsZXJzIHRvIGNhbGwgbGF0ZXIsIHNvIHdlXG4gICAgICAvLyBjYW7igJl0IHJldHVybiBoZXJlLlxuICAgICAgcmV0dXJuIHRoaXMucmVhZHkoKS50aGVuKCgpID0+IHtcbiAgICAgICAgc3RvcmVDYWxsYmFjayh0aGlzLCBuYW1lLCB7XG4gICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICByZWplY3RcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGFyZ3MgPSB7fTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICB9XG4gICAgICAgIHBvc3RNZXNzYWdlKHRoaXMsIG5hbWUsIGFyZ3MpO1xuICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogR2V0IGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mIGEgcGxheWVyIHByb3BlcnR5LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgcHJvcGVydHkgbmFtZVxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgZ2V0KG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IG5wb19zcmMoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbmFtZSA9IGdldE1ldGhvZE5hbWUobmFtZSwgJ2dldCcpO1xuXG4gICAgICAvLyBXZSBhcmUgc3RvcmluZyB0aGUgcmVzb2x2ZS9yZWplY3QgaGFuZGxlcnMgdG8gY2FsbCBsYXRlciwgc28gd2VcbiAgICAgIC8vIGNhbuKAmXQgcmV0dXJuIGhlcmUuXG4gICAgICByZXR1cm4gdGhpcy5yZWFkeSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzdG9yZUNhbGxiYWNrKHRoaXMsIG5hbWUsIHtcbiAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgIHJlamVjdFxuICAgICAgICB9KTtcbiAgICAgICAgcG9zdE1lc3NhZ2UodGhpcywgbmFtZSk7XG4gICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHByb21pc2UgZm9yIHNldHRpbmcgdGhlIHZhbHVlIG9mIGEgcGxheWVyIHByb3BlcnR5LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgQVBJIG1ldGhvZCB0byBjYWxsLlxuICAgKiBAcGFyYW0ge21peGVkfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBucG9fc3JjKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIG5hbWUgPSBnZXRNZXRob2ROYW1lKG5hbWUsICdzZXQnKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZXJlIG11c3QgYmUgYSB2YWx1ZSB0byBzZXQuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIGFyZSBzdG9yaW5nIHRoZSByZXNvbHZlL3JlamVjdCBoYW5kbGVycyB0byBjYWxsIGxhdGVyLCBzbyB3ZVxuICAgICAgLy8gY2Fu4oCZdCByZXR1cm4gaGVyZS5cbiAgICAgIHJldHVybiB0aGlzLnJlYWR5KCkudGhlbigoKSA9PiB7XG4gICAgICAgIHN0b3JlQ2FsbGJhY2sodGhpcywgbmFtZSwge1xuICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgcmVqZWN0XG4gICAgICAgIH0pO1xuICAgICAgICBwb3N0TWVzc2FnZSh0aGlzLCBuYW1lLCB2YWx1ZSk7XG4gICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBldmVudCBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudC4gV2lsbCBjYWxsIHRoZVxuICAgKiBjYWxsYmFjayB3aXRoIGEgc2luZ2xlIHBhcmFtZXRlciwgYGRhdGFgLCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIGZvclxuICAgKiB0aGF0IGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbigqKX0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgZXZlbnQgZmlyZXMuXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqL1xuICBvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFldmVudE5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gZXZlbnQgbmFtZS4nKTtcbiAgICB9XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIGNhbGxiYWNrIGZ1bmN0aW9uLicpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cbiAgICBjb25zdCBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3ModGhpcywgYGV2ZW50OiR7ZXZlbnROYW1lfWApO1xuICAgIGlmIChjYWxsYmFja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmNhbGxNZXRob2QoJ2FkZEV2ZW50TGlzdGVuZXInLCBldmVudE5hbWUpLmNhdGNoKCgpID0+IHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBlcnJvci4gVGhlcmUgd2lsbCBiZSBhbiBlcnJvciBldmVudCBmaXJlZCB0aGF0XG4gICAgICAgIC8vIHdpbGwgdHJpZ2dlciB0aGUgZXJyb3IgY2FsbGJhY2sgaWYgdGhleSBhcmUgbGlzdGVuaW5nLlxuICAgICAgfSk7XG4gICAgfVxuICAgIHN0b3JlQ2FsbGJhY2sodGhpcywgYGV2ZW50OiR7ZXZlbnROYW1lfWAsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gZXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuIFdpbGwgcmVtb3ZlIGFsbFxuICAgKiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgaWYgYSBgY2FsbGJhY2tgIGlzbuKAmXQgcGFzc2VkLCBvciBvbmx5IHRoYXRcbiAgICogc3BlY2lmaWMgY2FsbGJhY2sgaWYgaXQgaXMgcGFzc2VkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgc3BlY2lmaWMgY2FsbGJhY2sgdG8gcmVtb3ZlLlxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKi9cbiAgb2ZmKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIWV2ZW50TmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBldmVudCBuYW1lLicpO1xuICAgIH1cbiAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cbiAgICBjb25zdCBsYXN0Q2FsbGJhY2sgPSByZW1vdmVDYWxsYmFjayh0aGlzLCBgZXZlbnQ6JHtldmVudE5hbWV9YCwgY2FsbGJhY2spO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIGNhbGxiYWNrcyBsZWZ0LCByZW1vdmUgdGhlIGxpc3RlbmVyXG4gICAgaWYgKGxhc3RDYWxsYmFjaykge1xuICAgICAgdGhpcy5jYWxsTWV0aG9kKCdyZW1vdmVFdmVudExpc3RlbmVyJywgZXZlbnROYW1lKS5jYXRjaChlID0+IHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBlcnJvci4gVGhlcmUgd2lsbCBiZSBhbiBlcnJvciBldmVudCBmaXJlZCB0aGF0XG4gICAgICAgIC8vIHdpbGwgdHJpZ2dlciB0aGUgZXJyb3IgY2FsbGJhY2sgaWYgdGhleSBhcmUgbGlzdGVuaW5nLlxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBsb2FkIGEgbmV3IHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBMb2FkVmlkZW9Qcm9taXNlXG4gICAqIEBmdWxmaWxsIHtudW1iZXJ9IFRoZSB2aWRlbyB3aXRoIHRoaXMgaWQgb3IgdXJsIHN1Y2Nlc3NmdWxseSBsb2FkZWQuXG4gICAqIEByZWplY3Qge1R5cGVFcnJvcn0gVGhlIGlkIHdhcyBub3QgYSBudW1iZXIuXG4gICAqL1xuICAvKipcbiAgICogTG9hZCBhIG5ldyB2aWRlbyBpbnRvIHRoaXMgZW1iZWQuIFRoZSBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgaWZcbiAgICogdGhlIHZpZGVvIGlzIHN1Y2Nlc3NmdWxseSBsb2FkZWQsIG9yIGl0IHdpbGwgYmUgcmVqZWN0ZWQgaWYgaXQgY291bGRcbiAgICogbm90IGJlIGxvYWRlZC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfG9iamVjdH0gb3B0aW9ucyBUaGUgaWQgb2YgdGhlIHZpZGVvLCB0aGUgdXJsIG9mIHRoZSB2aWRlbywgb3IgYW4gb2JqZWN0IHdpdGggZW1iZWQgb3B0aW9ucy5cbiAgICogQHJldHVybiB7TG9hZFZpZGVvUHJvbWlzZX1cbiAgICovXG4gIGxvYWRWaWRlbyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnbG9hZFZpZGVvJywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIHBlcmZvcm0gYW4gYWN0aW9uIHdoZW4gdGhlIFBsYXllciBpcyByZWFkeS5cbiAgICpcbiAgICogQHRvZG8gZG9jdW1lbnQgZXJyb3JzXG4gICAqIEBwcm9taXNlIExvYWRWaWRlb1Byb21pc2VcbiAgICogQGZ1bGZpbGwge3ZvaWR9XG4gICAqL1xuICAvKipcbiAgICogVHJpZ2dlciBhIGZ1bmN0aW9uIHdoZW4gdGhlIHBsYXllciBpZnJhbWUgaGFzIGluaXRpYWxpemVkLiBZb3UgZG8gbm90XG4gICAqIG5lZWQgdG8gd2FpdCBmb3IgYHJlYWR5YCB0byB0cmlnZ2VyIHRvIGJlZ2luIGFkZGluZyBldmVudCBsaXN0ZW5lcnNcbiAgICogb3IgY2FsbGluZyBvdGhlciBtZXRob2RzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtSZWFkeVByb21pc2V9XG4gICAqL1xuICByZWFkeSgpIHtcbiAgICBjb25zdCByZWFkeVByb21pc2UgPSByZWFkeU1hcC5nZXQodGhpcykgfHwgbmV3IG5wb19zcmMoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignVW5rbm93biBwbGF5ZXIuIFByb2JhYmx5IHVubG9hZGVkLicpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbnBvX3NyYy5yZXNvbHZlKHJlYWR5UHJvbWlzZSk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGFkZCBhIGN1ZSBwb2ludCB0byB0aGUgcGxheWVyLlxuICAgKlxuICAgKiBAcHJvbWlzZSBBZGRDdWVQb2ludFByb21pc2VcbiAgICogQGZ1bGZpbGwge3N0cmluZ30gVGhlIGlkIG9mIHRoZSBjdWUgcG9pbnQgdG8gdXNlIGZvciByZW1vdmVDdWVQb2ludC5cbiAgICogQHJlamVjdCB7UmFuZ2VFcnJvcn0gdGhlIHRpbWUgd2FzIGxlc3MgdGhhbiAwIG9yIGdyZWF0ZXIgdGhhbiB0aGVcbiAgICogICAgICAgICB2aWRlb+KAmXMgZHVyYXRpb24uXG4gICAqIEByZWplY3Qge1Vuc3VwcG9ydGVkRXJyb3J9IEN1ZSBwb2ludHMgYXJlIG5vdCBzdXBwb3J0ZWQgd2l0aCB0aGUgY3VycmVudFxuICAgKiAgICAgICAgIHBsYXllciBvciBicm93c2VyLlxuICAgKi9cbiAgLyoqXG4gICAqIEFkZCBhIGN1ZSBwb2ludCB0byB0aGUgcGxheWVyLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGltZSBUaGUgdGltZSBmb3IgdGhlIGN1ZSBwb2ludC5cbiAgICogQHBhcmFtIHtvYmplY3R9IFtkYXRhXSBBcmJpdHJhcnkgZGF0YSB0byBiZSByZXR1cm5lZCB3aXRoIHRoZSBjdWUgcG9pbnQuXG4gICAqIEByZXR1cm4ge0FkZEN1ZVBvaW50UHJvbWlzZX1cbiAgICovXG4gIGFkZEN1ZVBvaW50KHRpbWUpIHtcbiAgICBsZXQgZGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnYWRkQ3VlUG9pbnQnLCB7XG4gICAgICB0aW1lLFxuICAgICAgZGF0YVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byByZW1vdmUgYSBjdWUgcG9pbnQgZnJvbSB0aGUgcGxheWVyLlxuICAgKlxuICAgKiBAcHJvbWlzZSBBZGRDdWVQb2ludFByb21pc2VcbiAgICogQGZ1bGZpbGwge3N0cmluZ30gVGhlIGlkIG9mIHRoZSBjdWUgcG9pbnQgdGhhdCB3YXMgcmVtb3ZlZC5cbiAgICogQHJlamVjdCB7SW52YWxpZEN1ZVBvaW50fSBUaGUgY3VlIHBvaW50IHdpdGggdGhlIHNwZWNpZmllZCBpZCB3YXMgbm90XG4gICAqICAgICAgICAgZm91bmQuXG4gICAqIEByZWplY3Qge1Vuc3VwcG9ydGVkRXJyb3J9IEN1ZSBwb2ludHMgYXJlIG5vdCBzdXBwb3J0ZWQgd2l0aCB0aGUgY3VycmVudFxuICAgKiAgICAgICAgIHBsYXllciBvciBicm93c2VyLlxuICAgKi9cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGN1ZSBwb2ludCBmcm9tIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkIFRoZSBpZCBvZiB0aGUgY3VlIHBvaW50IHRvIHJlbW92ZS5cbiAgICogQHJldHVybiB7UmVtb3ZlQ3VlUG9pbnRQcm9taXNlfVxuICAgKi9cbiAgcmVtb3ZlQ3VlUG9pbnQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdyZW1vdmVDdWVQb2ludCcsIGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHJlcHJlc2VudGF0aW9uIG9mIGEgdGV4dCB0cmFjayBvbiBhIHZpZGVvLlxuICAgKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBWaW1lb1RleHRUcmFja1xuICAgKiBAcHJvcGVydHkge3N0cmluZ30gbGFuZ3VhZ2UgVGhlIElTTyBsYW5ndWFnZSBjb2RlLlxuICAgKiBAcHJvcGVydHkge3N0cmluZ30ga2luZCBUaGUga2luZCBvZiB0cmFjayBpdCBpcyAoY2FwdGlvbnMgb3Igc3VidGl0bGVzKS5cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IGxhYmVsIFRoZSBodW1hbuKAkHJlYWRhYmxlIGxhYmVsIGZvciB0aGUgdHJhY2suXG4gICAqL1xuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGVuYWJsZSBhIHRleHQgdHJhY2suXG4gICAqXG4gICAqIEBwcm9taXNlIEVuYWJsZVRleHRUcmFja1Byb21pc2VcbiAgICogQGZ1bGZpbGwge1ZpbWVvVGV4dFRyYWNrfSBUaGUgdGV4dCB0cmFjayB0aGF0IHdhcyBlbmFibGVkLlxuICAgKiBAcmVqZWN0IHtJbnZhbGlkVHJhY2tMYW5ndWFnZUVycm9yfSBObyB0cmFjayB3YXMgYXZhaWxhYmxlIHdpdGggdGhlXG4gICAqICAgICAgICAgc3BlY2lmaWVkIGxhbmd1YWdlLlxuICAgKiBAcmVqZWN0IHtJbnZhbGlkVHJhY2tFcnJvcn0gTm8gdHJhY2sgd2FzIGF2YWlsYWJsZSB3aXRoIHRoZSBzcGVjaWZpZWRcbiAgICogICAgICAgICBsYW5ndWFnZSBhbmQga2luZC5cbiAgICovXG4gIC8qKlxuICAgKiBFbmFibGUgdGhlIHRleHQgdHJhY2sgd2l0aCB0aGUgc3BlY2lmaWVkIGxhbmd1YWdlLCBhbmQgb3B0aW9uYWxseSB0aGVcbiAgICogc3BlY2lmaWVkIGtpbmQgKGNhcHRpb25zIG9yIHN1YnRpdGxlcykuXG4gICAqXG4gICAqIFdoZW4gc2V0IHZpYSB0aGUgQVBJLCB0aGUgdHJhY2sgbGFuZ3VhZ2Ugd2lsbCBub3QgY2hhbmdlIHRoZSB2aWV3ZXLigJlzXG4gICAqIHN0b3JlZCBwcmVmZXJlbmNlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGFuZ3VhZ2UgVGhlIHR3b+KAkGxldHRlciBsYW5ndWFnZSBjb2RlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2tpbmRdIFRoZSBraW5kIG9mIHRyYWNrIHRvIGVuYWJsZSAoY2FwdGlvbnMgb3Igc3VidGl0bGVzKS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbc2hvd2luZ10gV2hldGhlciB0byBlbmFibGUgZGlzcGxheSBvZiBjbG9zZWQgY2FwdGlvbnMgZm9yIGVuYWJsZWQgdGV4dCB0cmFjayB3aXRoaW4gdGhlIHBsYXllci5cbiAgICogQHJldHVybiB7RW5hYmxlVGV4dFRyYWNrUHJvbWlzZX1cbiAgICovXG4gIGVuYWJsZVRleHRUcmFjayhsYW5ndWFnZSkge1xuICAgIGxldCBraW5kID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgIGxldCBzaG93aW5nID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB0cnVlO1xuICAgIGlmICghbGFuZ3VhZ2UpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSBsYW5ndWFnZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnZW5hYmxlVGV4dFRyYWNrJywge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICBraW5kLFxuICAgICAgc2hvd2luZ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBkaXNhYmxlIHRoZSBhY3RpdmUgdGV4dCB0cmFjay5cbiAgICpcbiAgICogQHByb21pc2UgRGlzYWJsZVRleHRUcmFja1Byb21pc2VcbiAgICogQGZ1bGZpbGwge3ZvaWR9IFRoZSB0cmFjayB3YXMgZGlzYWJsZWQuXG4gICAqL1xuICAvKipcbiAgICogRGlzYWJsZSB0aGUgY3VycmVudGx5LWFjdGl2ZSB0ZXh0IHRyYWNrLlxuICAgKlxuICAgKiBAcmV0dXJuIHtEaXNhYmxlVGV4dFRyYWNrUHJvbWlzZX1cbiAgICovXG4gIGRpc2FibGVUZXh0VHJhY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnZGlzYWJsZVRleHRUcmFjaycpO1xuICB9XG5cbiAgLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL3R5cGVzL2Zvcm1hdHMuanMnKS5WaW1lb0F1ZGlvVHJhY2t9IFZpbWVvQXVkaW9UcmFjayAqL1xuICAvKiogQHR5cGVkZWYge2ltcG9ydCgnLi4vdHlwZXMvZm9ybWF0cy5qcycpLkF1ZGlvTGFuZ3VhZ2V9IEF1ZGlvTGFuZ3VhZ2UgKi9cbiAgLyoqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL3R5cGVzL2Zvcm1hdHMuanMnKS5BdWRpb0tpbmR9IEF1ZGlvS2luZCAqL1xuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGVuYWJsZSBhbiBhdWRpbyB0cmFjay5cbiAgICpcbiAgICogQHByb21pc2UgU2VsZWN0QXVkaW9UcmFja1Byb21pc2VcbiAgICogQGZ1bGZpbGwge1ZpbWVvQXVkaW9UcmFja30gVGhlIGF1ZGlvIHRyYWNrIHRoYXQgd2FzIGVuYWJsZWQuXG4gICAqIEByZWplY3Qge05vQXVkaW9UcmFja3NFcnJvcn0gTm8gYXVkaW8gZXhpc3RzIGZvciB0aGUgdmlkZW8uXG4gICAqIEByZWplY3Qge05vQWx0ZXJuYXRlQXVkaW9UcmFja3NFcnJvcn0gTm8gYWx0ZXJuYXRlIGF1ZGlvIHRyYWNrcyBleGlzdCBmb3IgdGhlIHZpZGVvLlxuICAgKiBAcmVqZWN0IHtOb01hdGNoaW5nQXVkaW9UcmFja0Vycm9yfSBObyB0cmFjayB3YXMgYXZhaWxhYmxlIHdpdGggdGhlIHNwZWNpZmllZFxuICAgKiAgICAgICAgIGxhbmd1YWdlIGFuZCBraW5kLlxuICAgKi9cbiAgLyoqXG4gICAqIEVuYWJsZSB0aGUgYXVkaW8gdHJhY2sgd2l0aCB0aGUgc3BlY2lmaWVkIGxhbmd1YWdlLCBhbmQgb3B0aW9uYWxseSB0aGVcbiAgICogc3BlY2lmaWVkIGtpbmQgKG1haW4sIHRyYW5zbGF0aW9uLCBkZXNjcmlwdGlvbnMsIG9yIGNvbW1lbnRhcnkpLlxuICAgKlxuICAgKiBXaGVuIHNldCB2aWEgdGhlIEFQSSwgdGhlIHRyYWNrIGxhbmd1YWdlIHdpbGwgbm90IGNoYW5nZSB0aGUgdmlld2Vy4oCZc1xuICAgKiBzdG9yZWQgcHJlZmVyZW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtBdWRpb0xhbmd1YWdlfSBsYW5ndWFnZSBUaGUgdHdv4oCQbGV0dGVyIGxhbmd1YWdlIGNvZGUuXG4gICAqIEBwYXJhbSB7QXVkaW9LaW5kfSBba2luZF0gVGhlIGtpbmQgb2YgdHJhY2sgdG8gZW5hYmxlIChtYWluLCB0cmFuc2xhdGlvbiwgZGVzY3JpcHRpb25zLCBjb21tZW50YXJ5KS5cbiAgICogQHJldHVybiB7U2VsZWN0QXVkaW9UcmFja1Byb21pc2V9XG4gICAqL1xuICBzZWxlY3RBdWRpb1RyYWNrKGxhbmd1YWdlLCBraW5kKSB7XG4gICAgaWYgKCFsYW5ndWFnZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIGxhbmd1YWdlLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdzZWxlY3RBdWRpb1RyYWNrJywge1xuICAgICAgbGFuZ3VhZ2UsXG4gICAgICBraW5kXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIHRoZSBtYWluIGF1ZGlvIHRyYWNrIGZvciB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEByZXR1cm4ge1NlbGVjdEF1ZGlvVHJhY2tQcm9taXNlfVxuICAgKi9cbiAgc2VsZWN0RGVmYXVsdEF1ZGlvVHJhY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnc2VsZWN0RGVmYXVsdEF1ZGlvVHJhY2snKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gcGF1c2UgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBQYXVzZVByb21pc2VcbiAgICogQGZ1bGZpbGwge3ZvaWR9IFRoZSB2aWRlbyB3YXMgcGF1c2VkLlxuICAgKi9cbiAgLyoqXG4gICAqIFBhdXNlIHRoZSB2aWRlbyBpZiBpdOKAmXMgcGxheWluZy5cbiAgICpcbiAgICogQHJldHVybiB7UGF1c2VQcm9taXNlfVxuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGF1c2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gcGxheSB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIFBsYXlQcm9taXNlXG4gICAqIEBmdWxmaWxsIHt2b2lkfSBUaGUgdmlkZW8gd2FzIHBsYXllZC5cbiAgICovXG4gIC8qKlxuICAgKiBQbGF5IHRoZSB2aWRlbyBpZiBpdOKAmXMgcGF1c2VkLiAqKk5vdGU6Kiogb24gaU9TIGFuZCBzb21lIG90aGVyXG4gICAqIG1vYmlsZSBkZXZpY2VzLCB5b3UgY2Fubm90IHByb2dyYW1tYXRpY2FsbHkgdHJpZ2dlciBwbGF5LiBPbmNlIHRoZVxuICAgKiB2aWV3ZXIgaGFzIHRhcHBlZCBvbiB0aGUgcGxheSBidXR0b24gaW4gdGhlIHBsYXllciwgaG93ZXZlciwgeW91XG4gICAqIHdpbGwgYmUgYWJsZSB0byB1c2UgdGhpcyBmdW5jdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7UGxheVByb21pc2V9XG4gICAqL1xuICBwbGF5KCkge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3BsYXknKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRoYXQgdGhlIHBsYXllciBlbnRlcnMgZnVsbHNjcmVlbi5cbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIHJlcXVlc3RGdWxsc2NyZWVuKCkge1xuICAgIGlmIChzY3JlZW5mdWxsLmlzRW5hYmxlZCkge1xuICAgICAgcmV0dXJuIHNjcmVlbmZ1bGwucmVxdWVzdCh0aGlzLmVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdyZXF1ZXN0RnVsbHNjcmVlbicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgdGhhdCB0aGUgcGxheWVyIGV4aXRzIGZ1bGxzY3JlZW4uXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICBleGl0RnVsbHNjcmVlbigpIHtcbiAgICBpZiAoc2NyZWVuZnVsbC5pc0VuYWJsZWQpIHtcbiAgICAgIHJldHVybiBzY3JlZW5mdWxsLmV4aXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnZXhpdEZ1bGxzY3JlZW4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHBsYXllciBpcyBjdXJyZW50bHkgZnVsbHNjcmVlbi5cbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIGdldEZ1bGxzY3JlZW4oKSB7XG4gICAgaWYgKHNjcmVlbmZ1bGwuaXNFbmFibGVkKSB7XG4gICAgICByZXR1cm4gbnBvX3NyYy5yZXNvbHZlKHNjcmVlbmZ1bGwuaXNGdWxsc2NyZWVuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdmdWxsc2NyZWVuJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0aGF0IHRoZSBwbGF5ZXIgZW50ZXJzIHBpY3R1cmUtaW4tcGljdHVyZS5cbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIHJlcXVlc3RQaWN0dXJlSW5QaWN0dXJlKCkge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3JlcXVlc3RQaWN0dXJlSW5QaWN0dXJlJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0aGF0IHRoZSBwbGF5ZXIgZXhpdHMgcGljdHVyZS1pbi1waWN0dXJlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgZXhpdFBpY3R1cmVJblBpY3R1cmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnZXhpdFBpY3R1cmVJblBpY3R1cmUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHBsYXllciBpcyBjdXJyZW50bHkgcGljdHVyZS1pbi1waWN0dXJlLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKi9cbiAgZ2V0UGljdHVyZUluUGljdHVyZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3BpY3R1cmVJblBpY3R1cmUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gcHJvbXB0IHRoZSB2aWV3ZXIgdG8gaW5pdGlhdGUgcmVtb3RlIHBsYXliYWNrLlxuICAgKlxuICAgKiBAcHJvbWlzZSBSZW1vdGVQbGF5YmFja1Byb21wdFByb21pc2VcbiAgICogQGZ1bGZpbGwge3ZvaWR9XG4gICAqIEByZWplY3Qge05vdEZvdW5kRXJyb3J9IE5vIHJlbW90ZSBwbGF5YmFjayBkZXZpY2UgaXMgYXZhaWxhYmxlLlxuICAgKi9cbiAgLyoqXG4gICAqIFJlcXVlc3QgdG8gcHJvbXB0IHRoZSB1c2VyIHRvIGluaXRpYXRlIHJlbW90ZSBwbGF5YmFjay5cbiAgICpcbiAgICogQHJldHVybiB7UmVtb3RlUGxheWJhY2tQcm9tcHRQcm9taXNlfVxuICAgKi9cbiAgcmVtb3RlUGxheWJhY2tQcm9tcHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncmVtb3RlUGxheWJhY2tQcm9tcHQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gdW5sb2FkIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgVW5sb2FkUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7dm9pZH0gVGhlIHZpZGVvIHdhcyB1bmxvYWRlZC5cbiAgICovXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHBsYXllciB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAgICpcbiAgICogQHJldHVybiB7VW5sb2FkUHJvbWlzZX1cbiAgICovXG4gIHVubG9hZCgpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCd1bmxvYWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnVwIHRoZSBwbGF5ZXIgYW5kIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICpcbiAgICogSXQgd29uJ3QgYmUgdXNhYmxlIGFuZCBhIG5ldyBvbmUgc2hvdWxkIGJlIGNvbnN0cnVjdGVkXG4gICAqICBpbiBvcmRlciB0byBkbyBhbnkgb3BlcmF0aW9ucy5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgcmV0dXJuIG5ldyBucG9fc3JjKHJlc29sdmUgPT4ge1xuICAgICAgcmVhZHlNYXAuZGVsZXRlKHRoaXMpO1xuICAgICAgcGxheWVyTWFwLmRlbGV0ZSh0aGlzLmVsZW1lbnQpO1xuICAgICAgaWYgKHRoaXMuX29yaWdpbmFsRWxlbWVudCkge1xuICAgICAgICBwbGF5ZXJNYXAuZGVsZXRlKHRoaXMuX29yaWdpbmFsRWxlbWVudCk7XG4gICAgICAgIHRoaXMuX29yaWdpbmFsRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdmltZW8taW5pdGlhbGl6ZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50Lm5vZGVOYW1lID09PSAnSUZSQU1FJyAmJiB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAvLyBJZiB3ZSd2ZSBhZGRlZCBhbiBhZGRpdGlvbmFsIHdyYXBwZXIgZGl2LCByZW1vdmUgdGhhdCBmcm9tIHRoZSBET00uXG4gICAgICAgIC8vIElmIG5vdCwganVzdCByZW1vdmUgdGhlIGlmcmFtZSBlbGVtZW50LlxuICAgICAgICBpZiAodGhpcy5lbGVtZW50LnBhcmVudE5vZGUucGFyZW50Tm9kZSAmJiB0aGlzLl9vcmlnaW5hbEVsZW1lbnQgJiYgdGhpcy5fb3JpZ2luYWxFbGVtZW50ICE9PSB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50LnBhcmVudE5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIGNsaXAgaXMgcHJpdmF0ZSB0aGVyZSBpcyBhIGNhc2Ugd2hlcmUgdGhlIGVsZW1lbnQgc3RheXMgdGhlXG4gICAgICAvLyBkaXYgZWxlbWVudC4gRGVzdHJveSBzaG91bGQgcmVzZXQgdGhlIGRpdiBhbmQgcmVtb3ZlIHRoZSBpZnJhbWUgY2hpbGQuXG4gICAgICBpZiAodGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5ub2RlTmFtZSA9PT0gJ0RJVicgJiYgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS12aW1lby1pbml0aWFsaXplZCcpO1xuICAgICAgICBjb25zdCBpZnJhbWUgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignaWZyYW1lJyk7XG4gICAgICAgIGlmIChpZnJhbWUgJiYgaWZyYW1lLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAvLyBJZiB3ZSd2ZSBhZGRlZCBhbiBhZGRpdGlvbmFsIHdyYXBwZXIgZGl2LCByZW1vdmUgdGhhdCBmcm9tIHRoZSBET00uXG4gICAgICAgICAgLy8gSWYgbm90LCBqdXN0IHJlbW92ZSB0aGUgaWZyYW1lIGVsZW1lbnQuXG4gICAgICAgICAgaWYgKGlmcmFtZS5wYXJlbnROb2RlLnBhcmVudE5vZGUgJiYgdGhpcy5fb3JpZ2luYWxFbGVtZW50ICYmIHRoaXMuX29yaWdpbmFsRWxlbWVudCAhPT0gaWZyYW1lLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIGlmcmFtZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaWZyYW1lLnBhcmVudE5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLl9vbk1lc3NhZ2UpO1xuICAgICAgaWYgKHNjcmVlbmZ1bGwuaXNFbmFibGVkKSB7XG4gICAgICAgIHNjcmVlbmZ1bGwub2ZmKCdmdWxsc2NyZWVuY2hhbmdlJywgdGhpcy5mdWxsc2NyZWVuY2hhbmdlSGFuZGxlcik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgYXV0b3BhdXNlIGJlaGF2aW9yIG9mIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgR2V0QXV0b3BhdXNlUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7Ym9vbGVhbn0gV2hldGhlciBhdXRvcGF1c2UgaXMgdHVybmVkIG9uIG9yIG9mZi5cbiAgICogQHJlamVjdCB7VW5zdXBwb3J0ZWRFcnJvcn0gQXV0b3BhdXNlIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aCB0aGUgY3VycmVudFxuICAgKiAgICAgICAgIHBsYXllciBvciBicm93c2VyLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCB0aGUgYXV0b3BhdXNlIGJlaGF2aW9yIGZvciB0aGlzIHBsYXllci5cbiAgICpcbiAgICogQHJldHVybiB7R2V0QXV0b3BhdXNlUHJvbWlzZX1cbiAgICovXG4gIGdldEF1dG9wYXVzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2F1dG9wYXVzZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBzZXQgdGhlIGF1dG9wYXVzZSBiZWhhdmlvciBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIFNldEF1dG9wYXVzZVByb21pc2VcbiAgICogQGZ1bGZpbGwge2Jvb2xlYW59IFdoZXRoZXIgYXV0b3BhdXNlIGlzIHR1cm5lZCBvbiBvciBvZmYuXG4gICAqIEByZWplY3Qge1Vuc3VwcG9ydGVkRXJyb3J9IEF1dG9wYXVzZSBpcyBub3Qgc3VwcG9ydGVkIHdpdGggdGhlIGN1cnJlbnRcbiAgICogICAgICAgICBwbGF5ZXIgb3IgYnJvd3Nlci5cbiAgICovXG4gIC8qKlxuICAgKiBFbmFibGUgb3IgZGlzYWJsZSB0aGUgYXV0b3BhdXNlIGJlaGF2aW9yIG9mIHRoaXMgcGxheWVyLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB3aGVuIGFub3RoZXIgdmlkZW8gaXMgcGxheWVkIGluIHRoZSBzYW1lIGJyb3dzZXIsIHRoaXNcbiAgICogcGxheWVyIHdpbGwgYXV0b21hdGljYWxseSBwYXVzZS4gVW5sZXNzIHlvdSBoYXZlIGEgc3BlY2lmaWMgcmVhc29uXG4gICAqIGZvciBkb2luZyBzbywgd2UgcmVjb21tZW5kIHRoYXQgeW91IGxlYXZlIGF1dG9wYXVzZSBzZXQgdG8gdGhlXG4gICAqIGRlZmF1bHQgKGB0cnVlYCkuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b3BhdXNlXG4gICAqIEByZXR1cm4ge1NldEF1dG9wYXVzZVByb21pc2V9XG4gICAqL1xuICBzZXRBdXRvcGF1c2UoYXV0b3BhdXNlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KCdhdXRvcGF1c2UnLCBhdXRvcGF1c2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIGJ1ZmZlcmVkIHByb3BlcnR5IG9mIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgR2V0QnVmZmVyZWRQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtBcnJheX0gQnVmZmVyZWQgVGltZXJhbmdlcyBjb252ZXJ0ZWQgdG8gYW4gQXJyYXkuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBidWZmZXJlZCBwcm9wZXJ0eSBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEByZXR1cm4ge0dldEJ1ZmZlcmVkUHJvbWlzZX1cbiAgICovXG4gIGdldEJ1ZmZlcmVkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnYnVmZmVyZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBDYW1lcmFQcm9wZXJ0aWVzXG4gICAqIEBwcm9wIHtudW1iZXJ9IHByb3BzLnlhdyAtIE51bWJlciBiZXR3ZWVuIDAgYW5kIDM2MC5cbiAgICogQHByb3Age251bWJlcn0gcHJvcHMucGl0Y2ggLSBOdW1iZXIgYmV0d2VlbiAtOTAgYW5kIDkwLlxuICAgKiBAcHJvcCB7bnVtYmVyfSBwcm9wcy5yb2xsIC0gTnVtYmVyIGJldHdlZW4gLTE4MCBhbmQgMTgwLlxuICAgKiBAcHJvcCB7bnVtYmVyfSBwcm9wcy5mb3YgLSBUaGUgZmllbGQgb2YgdmlldyBpbiBkZWdyZWVzLlxuICAgKi9cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIGNhbWVyYSBwcm9wZXJ0aWVzIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBwcm9taXNlIEdldENhbWVyYVByb21pc2VcbiAgICogQGZ1bGZpbGwge0NhbWVyYVByb3BlcnRpZXN9IFRoZSBjYW1lcmEgcHJvcGVydGllcy5cbiAgICovXG4gIC8qKlxuICAgKiBGb3IgMzYwwrAgdmlkZW9zIGdldCB0aGUgY2FtZXJhIHByb3BlcnRpZXMgZm9yIHRoaXMgcGxheWVyLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRDYW1lcmFQcm9taXNlfVxuICAgKi9cbiAgZ2V0Q2FtZXJhUHJvcHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjYW1lcmFQcm9wcycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBzZXQgdGhlIGNhbWVyYSBwcm9wZXJ0aWVzIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBwcm9taXNlIFNldENhbWVyYVByb21pc2VcbiAgICogQGZ1bGZpbGwge09iamVjdH0gVGhlIGNhbWVyYSB3YXMgc3VjY2Vzc2Z1bGx5IHNldC5cbiAgICogQHJlamVjdCB7UmFuZ2VFcnJvcn0gVGhlIHJhbmdlIHdhcyBvdXQgb2YgYm91bmRzLlxuICAgKi9cbiAgLyoqXG4gICAqIEZvciAzNjDCsCB2aWRlb3Mgc2V0IHRoZSBjYW1lcmEgcHJvcGVydGllcyBmb3IgdGhpcyBwbGF5ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FtZXJhUHJvcGVydGllc30gY2FtZXJhIFRoZSBjYW1lcmEgcHJvcGVydGllc1xuICAgKiBAcmV0dXJuIHtTZXRDYW1lcmFQcm9taXNlfVxuICAgKi9cbiAgc2V0Q2FtZXJhUHJvcHMoY2FtZXJhKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KCdjYW1lcmFQcm9wcycsIGNhbWVyYSk7XG4gIH1cblxuICAvKipcbiAgICogQSByZXByZXNlbnRhdGlvbiBvZiBhIGNoYXB0ZXIuXG4gICAqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFZpbWVvQ2hhcHRlclxuICAgKiBAcHJvcGVydHkge251bWJlcn0gc3RhcnRUaW1lIFRoZSBzdGFydCB0aW1lIG9mIHRoZSBjaGFwdGVyLlxuICAgKiBAcHJvcGVydHkge29iamVjdH0gdGl0bGUgVGhlIHRpdGxlIG9mIHRoZSBjaGFwdGVyLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gaW5kZXggVGhlIHBsYWNlIGluIHRoZSBvcmRlciBvZiBDaGFwdGVycy4gU3RhcnRzIGF0IDEuXG4gICAqL1xuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCBjaGFwdGVycyBmb3IgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRDaGFwdGVyc1Byb21pc2VcbiAgICogQGZ1bGZpbGwge1ZpbWVvQ2hhcHRlcltdfSBUaGUgY2hhcHRlcnMgZm9yIHRoZSB2aWRlby5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgYW4gYXJyYXkgb2YgYWxsIHRoZSBjaGFwdGVycyBmb3IgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRDaGFwdGVyc1Byb21pc2V9XG4gICAqL1xuICBnZXRDaGFwdGVycygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NoYXB0ZXJzJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgY3VycmVudGx5IGFjdGl2ZSBjaGFwdGVyLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRDdXJyZW50Q2hhcHRlcnNQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtWaW1lb0NoYXB0ZXJ8dW5kZWZpbmVkfSBUaGUgY3VycmVudCBjaGFwdGVyIGZvciB0aGUgdmlkZW8uXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50bHkgYWN0aXZlIGNoYXB0ZXIgZm9yIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHJldHVybiB7R2V0Q3VycmVudENoYXB0ZXJzUHJvbWlzZX1cbiAgICovXG4gIGdldEN1cnJlbnRDaGFwdGVyKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY3VycmVudENoYXB0ZXInKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IHRoZSBhY2NlbnQgY29sb3Igb2YgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHByb21pc2UgR2V0Q29sb3JQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtzdHJpbmd9IFRoZSBoZXggY29sb3Igb2YgdGhlIHBsYXllci5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgdGhlIGFjY2VudCBjb2xvciBmb3IgdGhpcyBwbGF5ZXIuIE5vdGUgdGhpcyBpcyBkZXByZWNhdGVkIGluIHBsYWNlIG9mIGBnZXRDb2xvclR3b2AuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldENvbG9yUHJvbWlzZX1cbiAgICovXG4gIGdldENvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY29sb3InKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IGFsbCBjb2xvcnMgZm9yIHRoZSBwbGF5ZXIgaW4gYW4gYXJyYXkuXG4gICAqXG4gICAqIEBwcm9taXNlIEdldENvbG9yc1Byb21pc2VcbiAgICogQGZ1bGZpbGwge3N0cmluZ1tdfSBUaGUgaGV4IGNvbG9ycyBvZiB0aGUgcGxheWVyLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCBhbGwgdGhlIGNvbG9ycyBmb3IgdGhpcyBwbGF5ZXIgaW4gYW4gYXJyYXk6IFtjb2xvck9uZSwgY29sb3JUd28sIGNvbG9yVGhyZWUsIGNvbG9yRm91cl1cbiAgICpcbiAgICogQHJldHVybiB7R2V0Q29sb3JQcm9taXNlfVxuICAgKi9cbiAgZ2V0Q29sb3JzKCkge1xuICAgIHJldHVybiBucG9fc3JjLmFsbChbdGhpcy5nZXQoJ2NvbG9yT25lJyksIHRoaXMuZ2V0KCdjb2xvclR3bycpLCB0aGlzLmdldCgnY29sb3JUaHJlZScpLCB0aGlzLmdldCgnY29sb3JGb3VyJyldKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gc2V0IHRoZSBhY2NlbnQgY29sb3Igb2YgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHByb21pc2UgU2V0Q29sb3JQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtzdHJpbmd9IFRoZSBjb2xvciB3YXMgc3VjY2Vzc2Z1bGx5IHNldC5cbiAgICogQHJlamVjdCB7VHlwZUVycm9yfSBUaGUgc3RyaW5nIHdhcyBub3QgYSB2YWxpZCBoZXggb3IgcmdiIGNvbG9yLlxuICAgKiBAcmVqZWN0IHtDb250cmFzdEVycm9yfSBUaGUgY29sb3Igd2FzIHNldCwgYnV0IHRoZSBjb250cmFzdCBpc1xuICAgKiAgICAgICAgIG91dHNpZGUgb2YgdGhlIGFjY2VwdGFibGUgcmFuZ2UuXG4gICAqIEByZWplY3Qge0VtYmVkU2V0dGluZ3NFcnJvcn0gVGhlIG93bmVyIG9mIHRoZSBwbGF5ZXIgaGFzIGNob3NlbiB0b1xuICAgKiAgICAgICAgIHVzZSBhIHNwZWNpZmljIGNvbG9yLlxuICAgKi9cbiAgLyoqXG4gICAqIFNldCB0aGUgYWNjZW50IGNvbG9yIG9mIHRoaXMgcGxheWVyIHRvIGEgaGV4IG9yIHJnYiBzdHJpbmcuIFNldHRpbmcgdGhlXG4gICAqIGNvbG9yIG1heSBmYWlsIGlmIHRoZSBvd25lciBvZiB0aGUgdmlkZW8gaGFzIHNldCB0aGVpciBlbWJlZFxuICAgKiBwcmVmZXJlbmNlcyB0byBmb3JjZSBhIHNwZWNpZmljIGNvbG9yLlxuICAgKiBOb3RlIHRoaXMgaXMgZGVwcmVjYXRlZCBpbiBwbGFjZSBvZiBgc2V0Q29sb3JUd29gLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgVGhlIGhleCBvciByZ2IgY29sb3Igc3RyaW5nIHRvIHNldC5cbiAgICogQHJldHVybiB7U2V0Q29sb3JQcm9taXNlfVxuICAgKi9cbiAgc2V0Q29sb3IoY29sb3IpIHtcbiAgICByZXR1cm4gdGhpcy5zZXQoJ2NvbG9yJywgY29sb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBzZXQgYWxsIGNvbG9ycyBmb3IgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHByb21pc2UgU2V0Q29sb3JzUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7c3RyaW5nW119IFRoZSBjb2xvcnMgd2VyZSBzdWNjZXNzZnVsbHkgc2V0LlxuICAgKiBAcmVqZWN0IHtUeXBlRXJyb3J9IFRoZSBzdHJpbmcgd2FzIG5vdCBhIHZhbGlkIGhleCBvciByZ2IgY29sb3IuXG4gICAqIEByZWplY3Qge0NvbnRyYXN0RXJyb3J9IFRoZSBjb2xvciB3YXMgc2V0LCBidXQgdGhlIGNvbnRyYXN0IGlzXG4gICAqICAgICAgICAgb3V0c2lkZSBvZiB0aGUgYWNjZXB0YWJsZSByYW5nZS5cbiAgICogQHJlamVjdCB7RW1iZWRTZXR0aW5nc0Vycm9yfSBUaGUgb3duZXIgb2YgdGhlIHBsYXllciBoYXMgY2hvc2VuIHRvXG4gICAqICAgICAgICAgdXNlIGEgc3BlY2lmaWMgY29sb3IuXG4gICAqL1xuICAvKipcbiAgICogU2V0IHRoZSBjb2xvcnMgb2YgdGhpcyBwbGF5ZXIgdG8gYSBoZXggb3IgcmdiIHN0cmluZy4gU2V0dGluZyB0aGVcbiAgICogY29sb3IgbWF5IGZhaWwgaWYgdGhlIG93bmVyIG9mIHRoZSB2aWRlbyBoYXMgc2V0IHRoZWlyIGVtYmVkXG4gICAqIHByZWZlcmVuY2VzIHRvIGZvcmNlIGEgc3BlY2lmaWMgY29sb3IuXG4gICAqIFRoZSBjb2xvcnMgc2hvdWxkIGJlIHBhc3NlZCBpbiBhcyBhbiBhcnJheTogW2NvbG9yT25lLCBjb2xvclR3bywgY29sb3JUaHJlZSwgY29sb3JGb3VyXS5cbiAgICogSWYgYSBjb2xvciBzaG91bGQgbm90IGJlIHNldCwgdGhlIGluZGV4IGluIHRoZSBhcnJheSBjYW4gYmUgbGVmdCBhcyBudWxsLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjb2xvcnMgQXJyYXkgb2YgdGhlIGhleCBvciByZ2IgY29sb3Igc3RyaW5ncyB0byBzZXQuXG4gICAqIEByZXR1cm4ge1NldENvbG9yc1Byb21pc2V9XG4gICAqL1xuICBzZXRDb2xvcnMoY29sb3JzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbG9ycykpIHtcbiAgICAgIHJldHVybiBuZXcgbnBvX3NyYygocmVzb2x2ZSwgcmVqZWN0KSA9PiByZWplY3QobmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhbiBhcnJheS4nKSkpO1xuICAgIH1cbiAgICBjb25zdCBudWxsUHJvbWlzZSA9IG5ldyBucG9fc3JjKHJlc29sdmUgPT4gcmVzb2x2ZShudWxsKSk7XG4gICAgY29uc3QgY29sb3JQcm9taXNlcyA9IFtjb2xvcnNbMF0gPyB0aGlzLnNldCgnY29sb3JPbmUnLCBjb2xvcnNbMF0pIDogbnVsbFByb21pc2UsIGNvbG9yc1sxXSA/IHRoaXMuc2V0KCdjb2xvclR3bycsIGNvbG9yc1sxXSkgOiBudWxsUHJvbWlzZSwgY29sb3JzWzJdID8gdGhpcy5zZXQoJ2NvbG9yVGhyZWUnLCBjb2xvcnNbMl0pIDogbnVsbFByb21pc2UsIGNvbG9yc1szXSA/IHRoaXMuc2V0KCdjb2xvckZvdXInLCBjb2xvcnNbM10pIDogbnVsbFByb21pc2VdO1xuICAgIHJldHVybiBucG9fc3JjLmFsbChjb2xvclByb21pc2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHJlcHJlc2VudGF0aW9uIG9mIGEgY3VlIHBvaW50LlxuICAgKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBWaW1lb0N1ZVBvaW50XG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB0aW1lIFRoZSB0aW1lIG9mIHRoZSBjdWUgcG9pbnQuXG4gICAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBkYXRhIFRoZSBkYXRhIHBhc3NlZCB3aGVuIGFkZGluZyB0aGUgY3VlIHBvaW50LlxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gaWQgVGhlIHVuaXF1ZSBpZCBmb3IgdXNlIHdpdGggcmVtb3ZlQ3VlUG9pbnQuXG4gICAqL1xuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgY3VlIHBvaW50cyBvZiBhIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRDdWVQb2ludHNQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtWaW1lb0N1ZVBvaW50W119IFRoZSBjdWUgcG9pbnRzIGFkZGVkIHRvIHRoZSB2aWRlby5cbiAgICogQHJlamVjdCB7VW5zdXBwb3J0ZWRFcnJvcn0gQ3VlIHBvaW50cyBhcmUgbm90IHN1cHBvcnRlZCB3aXRoIHRoZSBjdXJyZW50XG4gICAqICAgICAgICAgcGxheWVyIG9yIGJyb3dzZXIuXG4gICAqL1xuICAvKipcbiAgICogR2V0IGFuIGFycmF5IG9mIHRoZSBjdWUgcG9pbnRzIGFkZGVkIHRvIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHJldHVybiB7R2V0Q3VlUG9pbnRzUHJvbWlzZX1cbiAgICovXG4gIGdldEN1ZVBvaW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2N1ZVBvaW50cycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZSBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIEdldEN1cnJlbnRUaW1lUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7bnVtYmVyfSBUaGUgY3VycmVudCB0aW1lIGluIHNlY29uZHMuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHBsYXliYWNrIHBvc2l0aW9uIGluIHNlY29uZHMuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldEN1cnJlbnRUaW1lUHJvbWlzZX1cbiAgICovXG4gIGdldEN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnY3VycmVudFRpbWUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gc2V0IHRoZSBjdXJyZW50IHRpbWUgb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBTZXRDdXJyZW50VGltZVByb21pc2VcbiAgICogQGZ1bGZpbGwge251bWJlcn0gVGhlIGFjdHVhbCBjdXJyZW50IHRpbWUgdGhhdCB3YXMgc2V0LlxuICAgKiBAcmVqZWN0IHtSYW5nZUVycm9yfSB0aGUgdGltZSB3YXMgbGVzcyB0aGFuIDAgb3IgZ3JlYXRlciB0aGFuIHRoZVxuICAgKiAgICAgICAgIHZpZGVv4oCZcyBkdXJhdGlvbi5cbiAgICovXG4gIC8qKlxuICAgKiBTZXQgdGhlIGN1cnJlbnQgcGxheWJhY2sgcG9zaXRpb24gaW4gc2Vjb25kcy4gSWYgdGhlIHBsYXllciB3YXNcbiAgICogcGF1c2VkLCBpdCB3aWxsIHJlbWFpbiBwYXVzZWQuIExpa2V3aXNlLCBpZiB0aGUgcGxheWVyIHdhcyBwbGF5aW5nLFxuICAgKiBpdCB3aWxsIHJlc3VtZSBwbGF5aW5nIG9uY2UgdGhlIHZpZGVvIGhhcyBidWZmZXJlZC5cbiAgICpcbiAgICogWW91IGNhbiBwcm92aWRlIGFuIGFjY3VyYXRlIHRpbWUgYW5kIHRoZSBwbGF5ZXIgd2lsbCBhdHRlbXB0IHRvIHNlZWtcbiAgICogdG8gYXMgY2xvc2UgdG8gdGhhdCB0aW1lIGFzIHBvc3NpYmxlLiBUaGUgZXhhY3QgdGltZSB3aWxsIGJlIHRoZVxuICAgKiBmdWxmaWxsZWQgdmFsdWUgb2YgdGhlIHByb21pc2UuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50VGltZVxuICAgKiBAcmV0dXJuIHtTZXRDdXJyZW50VGltZVByb21pc2V9XG4gICAqL1xuICBzZXRDdXJyZW50VGltZShjdXJyZW50VGltZSkge1xuICAgIHJldHVybiB0aGlzLnNldCgnY3VycmVudFRpbWUnLCBjdXJyZW50VGltZSk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgZHVyYXRpb24gb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXREdXJhdGlvblByb21pc2VcbiAgICogQGZ1bGZpbGwge251bWJlcn0gVGhlIGR1cmF0aW9uIGluIHNlY29uZHMuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBkdXJhdGlvbiBvZiB0aGUgdmlkZW8gaW4gc2Vjb25kcy4gSXQgd2lsbCBiZSByb3VuZGVkIHRvIHRoZVxuICAgKiBuZWFyZXN0IHNlY29uZCBiZWZvcmUgcGxheWJhY2sgYmVnaW5zLCBhbmQgdG8gdGhlIG5lYXJlc3QgdGhvdXNhbmR0aFxuICAgKiBvZiBhIHNlY29uZCBhZnRlciBwbGF5YmFjayBiZWdpbnMuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldER1cmF0aW9uUHJvbWlzZX1cbiAgICovXG4gIGdldER1cmF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZHVyYXRpb24nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IHRoZSBlbmRlZCBzdGF0ZSBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIEdldEVuZGVkUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZpZGVvIGhhcyBlbmRlZC5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVuZGVkIHN0YXRlIG9mIHRoZSB2aWRlby4gVGhlIHZpZGVvIGhhcyBlbmRlZCBpZlxuICAgKiBgY3VycmVudFRpbWUgPT09IGR1cmF0aW9uYC5cbiAgICpcbiAgICogQHJldHVybiB7R2V0RW5kZWRQcm9taXNlfVxuICAgKi9cbiAgZ2V0RW5kZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdlbmRlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIGxvb3Agc3RhdGUgb2YgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHByb21pc2UgR2V0TG9vcFByb21pc2VcbiAgICogQGZ1bGZpbGwge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBwbGF5ZXIgaXMgc2V0IHRvIGxvb3AuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBsb29wIHN0YXRlIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldExvb3BQcm9taXNlfVxuICAgKi9cbiAgZ2V0TG9vcCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2xvb3AnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gc2V0IHRoZSBsb29wIHN0YXRlIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBwcm9taXNlIFNldExvb3BQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtib29sZWFufSBUaGUgbG9vcCBzdGF0ZSB0aGF0IHdhcyBzZXQuXG4gICAqL1xuICAvKipcbiAgICogU2V0IHRoZSBsb29wIHN0YXRlIG9mIHRoZSBwbGF5ZXIuIFdoZW4gc2V0IHRvIGB0cnVlYCwgdGhlIHBsYXllclxuICAgKiB3aWxsIHN0YXJ0IG92ZXIgaW1tZWRpYXRlbHkgb25jZSBwbGF5YmFjayBlbmRzLlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGxvb3BcbiAgICogQHJldHVybiB7U2V0TG9vcFByb21pc2V9XG4gICAqL1xuICBzZXRMb29wKGxvb3ApIHtcbiAgICByZXR1cm4gdGhpcy5zZXQoJ2xvb3AnLCBsb29wKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gc2V0IHRoZSBtdXRlZCBzdGF0ZSBvZiB0aGUgcGxheWVyLlxuICAgKlxuICAgKiBAcHJvbWlzZSBTZXRNdXRlZFByb21pc2VcbiAgICogQGZ1bGZpbGwge2Jvb2xlYW59IFRoZSBtdXRlZCBzdGF0ZSB0aGF0IHdhcyBzZXQuXG4gICAqL1xuICAvKipcbiAgICogU2V0IHRoZSBtdXRlZCBzdGF0ZSBvZiB0aGUgcGxheWVyLiBXaGVuIHNldCB0byBgdHJ1ZWAsIHRoZSBwbGF5ZXJcbiAgICogdm9sdW1lIHdpbGwgYmUgbXV0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbXV0ZWRcbiAgICogQHJldHVybiB7U2V0TXV0ZWRQcm9taXNlfVxuICAgKi9cbiAgc2V0TXV0ZWQobXV0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy5zZXQoJ211dGVkJywgbXV0ZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIG11dGVkIHN0YXRlIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBwcm9taXNlIEdldE11dGVkUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHBsYXllciBpcyBtdXRlZC5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgdGhlIG11dGVkIHN0YXRlIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldE11dGVkUHJvbWlzZX1cbiAgICovXG4gIGdldE11dGVkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnbXV0ZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IHRoZSBwYXVzZWQgc3RhdGUgb2YgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHByb21pc2UgR2V0TG9vcFByb21pc2VcbiAgICogQGZ1bGZpbGwge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2aWRlbyBpcyBwYXVzZWQuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBwYXVzZWQgc3RhdGUgb2YgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHJldHVybiB7R2V0TG9vcFByb21pc2V9XG4gICAqL1xuICBnZXRQYXVzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwYXVzZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IHRoZSBwbGF5YmFjayByYXRlIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBwcm9taXNlIEdldFBsYXliYWNrUmF0ZVByb21pc2VcbiAgICogQGZ1bGZpbGwge251bWJlcn0gVGhlIHBsYXliYWNrIHJhdGUgb2YgdGhlIHBsYXllciBvbiBhIHNjYWxlIGZyb20gMCB0byAyLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCB0aGUgcGxheWJhY2sgcmF0ZSBvZiB0aGUgcGxheWVyIG9uIGEgc2NhbGUgZnJvbSBgMGAgdG8gYDJgLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRQbGF5YmFja1JhdGVQcm9taXNlfVxuICAgKi9cbiAgZ2V0UGxheWJhY2tSYXRlKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncGxheWJhY2tSYXRlJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIHNldCB0aGUgcGxheWJhY2tyYXRlIG9mIHRoZSBwbGF5ZXIuXG4gICAqXG4gICAqIEBwcm9taXNlIFNldFBsYXliYWNrUmF0ZVByb21pc2VcbiAgICogQGZ1bGZpbGwge251bWJlcn0gVGhlIHBsYXliYWNrIHJhdGUgd2FzIHNldC5cbiAgICogQHJlamVjdCB7UmFuZ2VFcnJvcn0gVGhlIHBsYXliYWNrIHJhdGUgd2FzIGxlc3MgdGhhbiAwIG9yIGdyZWF0ZXIgdGhhbiAyLlxuICAgKi9cbiAgLyoqXG4gICAqIFNldCB0aGUgcGxheWJhY2sgcmF0ZSBvZiB0aGUgcGxheWVyIG9uIGEgc2NhbGUgZnJvbSBgMGAgdG8gYDJgLiBXaGVuIHNldFxuICAgKiB2aWEgdGhlIEFQSSwgdGhlIHBsYXliYWNrIHJhdGUgd2lsbCBub3QgYmUgc3luY2hyb25pemVkIHRvIG90aGVyXG4gICAqIHBsYXllcnMgb3Igc3RvcmVkIGFzIHRoZSB2aWV3ZXIncyBwcmVmZXJlbmNlLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcGxheWJhY2tSYXRlXG4gICAqIEByZXR1cm4ge1NldFBsYXliYWNrUmF0ZVByb21pc2V9XG4gICAqL1xuICBzZXRQbGF5YmFja1JhdGUocGxheWJhY2tSYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KCdwbGF5YmFja1JhdGUnLCBwbGF5YmFja1JhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIHBsYXllZCBwcm9wZXJ0eSBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIEdldFBsYXllZFByb21pc2VcbiAgICogQGZ1bGZpbGwge0FycmF5fSBQbGF5ZWQgVGltZXJhbmdlcyBjb252ZXJ0ZWQgdG8gYW4gQXJyYXkuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBwbGF5ZWQgcHJvcGVydHkgb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRQbGF5ZWRQcm9taXNlfVxuICAgKi9cbiAgZ2V0UGxheWVkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncGxheWVkJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgcXVhbGl0aWVzIGF2YWlsYWJsZSBvZiB0aGUgY3VycmVudCB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgR2V0UXVhbGl0aWVzUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7QXJyYXl9IFRoZSBxdWFsaXRpZXMgb2YgdGhlIHZpZGVvLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCB0aGUgcXVhbGl0aWVzIG9mIHRoZSBjdXJyZW50IHZpZGVvLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRRdWFsaXRpZXNQcm9taXNlfVxuICAgKi9cbiAgZ2V0UXVhbGl0aWVzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncXVhbGl0aWVzJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgY3VycmVudCBzZXQgcXVhbGl0eSBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIEdldFF1YWxpdHlQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtzdHJpbmd9IFRoZSBjdXJyZW50IHNldCBxdWFsaXR5LlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBzZXQgcXVhbGl0eSBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEByZXR1cm4ge0dldFF1YWxpdHlQcm9taXNlfVxuICAgKi9cbiAgZ2V0UXVhbGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3F1YWxpdHknKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gc2V0IHRoZSB2aWRlbyBxdWFsaXR5LlxuICAgKlxuICAgKiBAcHJvbWlzZSBTZXRRdWFsaXR5UHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7bnVtYmVyfSBUaGUgcXVhbGl0eSB3YXMgc2V0LlxuICAgKiBAcmVqZWN0IHtSYW5nZUVycm9yfSBUaGUgcXVhbGl0eSBpcyBub3QgYXZhaWxhYmxlLlxuICAgKi9cbiAgLyoqXG4gICAqIFNldCBhIHZpZGVvIHF1YWxpdHkuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdWFsaXR5XG4gICAqIEByZXR1cm4ge1NldFF1YWxpdHlQcm9taXNlfVxuICAgKi9cbiAgc2V0UXVhbGl0eShxdWFsaXR5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0KCdxdWFsaXR5JywgcXVhbGl0eSk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgcmVtb3RlIHBsYXliYWNrIGF2YWlsYWJpbGl0eS5cbiAgICpcbiAgICogQHByb21pc2UgUmVtb3RlUGxheWJhY2tBdmFpbGFiaWxpdHlQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtib29sZWFufSBXaGV0aGVyIHJlbW90ZSBwbGF5YmFjayBpcyBhdmFpbGFibGUuXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBhdmFpbGFiaWxpdHkgb2YgcmVtb3RlIHBsYXliYWNrLlxuICAgKlxuICAgKiBAcmV0dXJuIHtSZW1vdGVQbGF5YmFja0F2YWlsYWJpbGl0eVByb21pc2V9XG4gICAqL1xuICBnZXRSZW1vdGVQbGF5YmFja0F2YWlsYWJpbGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3JlbW90ZVBsYXliYWNrQXZhaWxhYmlsaXR5Jyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgY3VycmVudCByZW1vdGUgcGxheWJhY2sgc3RhdGUuXG4gICAqXG4gICAqIEBwcm9taXNlIFJlbW90ZVBsYXliYWNrU3RhdGVQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtzdHJpbmd9IFRoZSBzdGF0ZSBvZiB0aGUgcmVtb3RlIHBsYXliYWNrOiBjb25uZWN0aW5nLCBjb25uZWN0ZWQsIG9yIGRpc2Nvbm5lY3RlZC5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgcmVtb3RlIHBsYXliYWNrIHN0YXRlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtSZW1vdGVQbGF5YmFja1N0YXRlUHJvbWlzZX1cbiAgICovXG4gIGdldFJlbW90ZVBsYXliYWNrU3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdyZW1vdGVQbGF5YmFja1N0YXRlJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgc2Vla2FibGUgcHJvcGVydHkgb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRTZWVrYWJsZVByb21pc2VcbiAgICogQGZ1bGZpbGwge0FycmF5fSBTZWVrYWJsZSBUaW1lcmFuZ2VzIGNvbnZlcnRlZCB0byBhbiBBcnJheS5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgdGhlIHNlZWthYmxlIHByb3BlcnR5IG9mIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHJldHVybiB7R2V0U2Vla2FibGVQcm9taXNlfVxuICAgKi9cbiAgZ2V0U2Vla2FibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdzZWVrYWJsZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIHNlZWtpbmcgcHJvcGVydHkgb2YgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHByb21pc2UgR2V0U2Vla2luZ1Byb21pc2VcbiAgICogQGZ1bGZpbGwge2Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBwbGF5ZXIgaXMgY3VycmVudGx5IHNlZWtpbmcuXG4gICAqL1xuICAvKipcbiAgICogR2V0IGlmIHRoZSBwbGF5ZXIgaXMgY3VycmVudGx5IHNlZWtpbmcuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldFNlZWtpbmdQcm9taXNlfVxuICAgKi9cbiAgZ2V0U2Vla2luZygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3NlZWtpbmcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IHRoZSB0ZXh0IHRyYWNrcyBvZiBhIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRUZXh0VHJhY2tzUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7VmltZW9UZXh0VHJhY2tbXX0gVGhlIHRleHQgdHJhY2tzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdmlkZW8uXG4gICAqL1xuICAvKipcbiAgICogR2V0IGFuIGFycmF5IG9mIHRoZSB0ZXh0IHRyYWNrcyB0aGF0IGV4aXN0IGZvciB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEByZXR1cm4ge0dldFRleHRUcmFja3NQcm9taXNlfVxuICAgKi9cbiAgZ2V0VGV4dFRyYWNrcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3RleHRUcmFja3MnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IHRoZSBhdWRpbyB0cmFja3Mgb2YgYSB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgR2V0QXVkaW9UcmFja3NQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtWaW1lb0F1ZGlvVHJhY2tbXX0gVGhlIGF1ZGlvIHRyYWNrcyBhc3NvY2lhdGVkIHdpdGggdGhlIHZpZGVvLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCBhbiBhcnJheSBvZiB0aGUgYXVkaW8gdHJhY2tzIHRoYXQgZXhpc3QgZm9yIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHJldHVybiB7R2V0QXVkaW9UcmFja3NQcm9taXNlfVxuICAgKi9cbiAgZ2V0QXVkaW9UcmFja3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdhdWRpb1RyYWNrcycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIGVuYWJsZWQgYXVkaW8gdHJhY2sgb2YgYSB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgR2V0QXVkaW9UcmFja1Byb21pc2VcbiAgICogQGZ1bGZpbGwge1ZpbWVvQXVkaW9UcmFja30gVGhlIGVuYWJsZWQgYXVkaW8gdHJhY2suXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBlbmFibGVkIGF1ZGlvIHRyYWNrIGZvciBhIHZpZGVvLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRBdWRpb1RyYWNrUHJvbWlzZX1cbiAgICovXG4gIGdldEVuYWJsZWRBdWRpb1RyYWNrKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZW5hYmxlZEF1ZGlvVHJhY2snKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG1haW4gYXVkaW8gdHJhY2sgZm9yIGEgdmlkZW8uXG4gICAqXG4gICAqIEByZXR1cm4ge0dldEF1ZGlvVHJhY2tQcm9taXNlfVxuICAgKi9cbiAgZ2V0RGVmYXVsdEF1ZGlvVHJhY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZWZhdWx0QXVkaW9UcmFjaycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIGVtYmVkIGNvZGUgZm9yIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgR2V0VmlkZW9FbWJlZENvZGVQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtzdHJpbmd9IFRoZSBgPGlmcmFtZT5gIGVtYmVkIGNvZGUgZm9yIHRoZSB2aWRlby5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgdGhlIGA8aWZyYW1lPmAgZW1iZWQgY29kZSBmb3IgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRWaWRlb0VtYmVkQ29kZVByb21pc2V9XG4gICAqL1xuICBnZXRWaWRlb0VtYmVkQ29kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ZpZGVvRW1iZWRDb2RlJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgaWQgb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRWaWRlb0lkUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7bnVtYmVyfSBUaGUgaWQgb2YgdGhlIHZpZGVvLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCB0aGUgaWQgb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRWaWRlb0lkUHJvbWlzZX1cbiAgICovXG4gIGdldFZpZGVvSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd2aWRlb0lkJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgdGl0bGUgb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRWaWRlb1RpdGxlUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7bnVtYmVyfSBUaGUgdGl0bGUgb2YgdGhlIHZpZGVvLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCB0aGUgdGl0bGUgb2YgdGhlIHZpZGVvLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRWaWRlb1RpdGxlUHJvbWlzZX1cbiAgICovXG4gIGdldFZpZGVvVGl0bGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd2aWRlb1RpdGxlJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgbmF0aXZlIHdpZHRoIG9mIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHByb21pc2UgR2V0VmlkZW9XaWR0aFByb21pc2VcbiAgICogQGZ1bGZpbGwge251bWJlcn0gVGhlIG5hdGl2ZSB3aWR0aCBvZiB0aGUgdmlkZW8uXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBuYXRpdmUgd2lkdGggb2YgdGhlIGN1cnJlbnRseeKAkHBsYXlpbmcgdmlkZW8uIFRoZSB3aWR0aCBvZlxuICAgKiB0aGUgaGlnaGVzdOKAkHJlc29sdXRpb24gYXZhaWxhYmxlIHdpbGwgYmUgdXNlZCBiZWZvcmUgcGxheWJhY2sgYmVnaW5zLlxuICAgKlxuICAgKiBAcmV0dXJuIHtHZXRWaWRlb1dpZHRoUHJvbWlzZX1cbiAgICovXG4gIGdldFZpZGVvV2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd2aWRlb1dpZHRoJyk7XG4gIH1cblxuICAvKipcbiAgICogQSBwcm9taXNlIHRvIGdldCB0aGUgbmF0aXZlIGhlaWdodCBvZiB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIEdldFZpZGVvSGVpZ2h0UHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7bnVtYmVyfSBUaGUgbmF0aXZlIGhlaWdodCBvZiB0aGUgdmlkZW8uXG4gICAqL1xuICAvKipcbiAgICogR2V0IHRoZSBuYXRpdmUgaGVpZ2h0IG9mIHRoZSBjdXJyZW50bHnigJBwbGF5aW5nIHZpZGVvLiBUaGUgaGVpZ2h0IG9mXG4gICAqIHRoZSBoaWdoZXN04oCQcmVzb2x1dGlvbiBhdmFpbGFibGUgd2lsbCBiZSB1c2VkIGJlZm9yZSBwbGF5YmFjayBiZWdpbnMuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldFZpZGVvSGVpZ2h0UHJvbWlzZX1cbiAgICovXG4gIGdldFZpZGVvSGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndmlkZW9IZWlnaHQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gZ2V0IHRoZSB2aW1lby5jb20gdXJsIGZvciB0aGUgdmlkZW8uXG4gICAqXG4gICAqIEBwcm9taXNlIEdldFZpZGVvVXJsUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7bnVtYmVyfSBUaGUgdmltZW8uY29tIHVybCBmb3IgdGhlIHZpZGVvLlxuICAgKiBAcmVqZWN0IHtQcml2YWN5RXJyb3J9IFRoZSB1cmwgaXNu4oCZdCBhdmFpbGFibGUgYmVjYXVzZSBvZiB0aGUgdmlkZW/igJlzIHByaXZhY3kgc2V0dGluZy5cbiAgICovXG4gIC8qKlxuICAgKiBHZXQgdGhlIHZpbWVvLmNvbSB1cmwgZm9yIHRoZSB2aWRlby5cbiAgICpcbiAgICogQHJldHVybiB7R2V0VmlkZW9VcmxQcm9taXNlfVxuICAgKi9cbiAgZ2V0VmlkZW9VcmwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd2aWRlb1VybCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcHJvbWlzZSB0byBnZXQgdGhlIHZvbHVtZSBsZXZlbCBvZiB0aGUgcGxheWVyLlxuICAgKlxuICAgKiBAcHJvbWlzZSBHZXRWb2x1bWVQcm9taXNlXG4gICAqIEBmdWxmaWxsIHtudW1iZXJ9IFRoZSB2b2x1bWUgbGV2ZWwgb2YgdGhlIHBsYXllciBvbiBhIHNjYWxlIGZyb20gMCB0byAxLlxuICAgKi9cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCB2b2x1bWUgbGV2ZWwgb2YgdGhlIHBsYXllciBvbiBhIHNjYWxlIGZyb20gYDBgIHRvIGAxYC5cbiAgICpcbiAgICogTW9zdCBtb2JpbGUgZGV2aWNlcyBkbyBub3Qgc3VwcG9ydCBhbiBpbmRlcGVuZGVudCB2b2x1bWUgZnJvbSB0aGVcbiAgICogc3lzdGVtIHZvbHVtZS4gSW4gdGhvc2UgY2FzZXMsIHRoaXMgbWV0aG9kIHdpbGwgYWx3YXlzIHJldHVybiBgMWAuXG4gICAqXG4gICAqIEByZXR1cm4ge0dldFZvbHVtZVByb21pc2V9XG4gICAqL1xuICBnZXRWb2x1bWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd2b2x1bWUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHByb21pc2UgdG8gc2V0IHRoZSB2b2x1bWUgbGV2ZWwgb2YgdGhlIHBsYXllci5cbiAgICpcbiAgICogQHByb21pc2UgU2V0Vm9sdW1lUHJvbWlzZVxuICAgKiBAZnVsZmlsbCB7bnVtYmVyfSBUaGUgdm9sdW1lIHdhcyBzZXQuXG4gICAqIEByZWplY3Qge1JhbmdlRXJyb3J9IFRoZSB2b2x1bWUgd2FzIGxlc3MgdGhhbiAwIG9yIGdyZWF0ZXIgdGhhbiAxLlxuICAgKi9cbiAgLyoqXG4gICAqIFNldCB0aGUgdm9sdW1lIG9mIHRoZSBwbGF5ZXIgb24gYSBzY2FsZSBmcm9tIGAwYCB0byBgMWAuIFdoZW4gc2V0XG4gICAqIHZpYSB0aGUgQVBJLCB0aGUgdm9sdW1lIGxldmVsIHdpbGwgbm90IGJlIHN5bmNocm9uaXplZCB0byBvdGhlclxuICAgKiBwbGF5ZXJzIG9yIHN0b3JlZCBhcyB0aGUgdmlld2Vy4oCZcyBwcmVmZXJlbmNlLlxuICAgKlxuICAgKiBNb3N0IG1vYmlsZSBkZXZpY2VzIGRvIG5vdCBzdXBwb3J0IHNldHRpbmcgdGhlIHZvbHVtZS4gQW4gZXJyb3Igd2lsbFxuICAgKiAqbm90KiBiZSB0cmlnZ2VyZWQgaW4gdGhhdCBzaXR1YXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2b2x1bWVcbiAgICogQHJldHVybiB7U2V0Vm9sdW1lUHJvbWlzZX1cbiAgICovXG4gIHNldFZvbHVtZSh2b2x1bWUpIHtcbiAgICByZXR1cm4gdGhpcy5zZXQoJ3ZvbHVtZScsIHZvbHVtZSk7XG4gIH1cblxuICAvKiogQHR5cGVkZWYge2ltcG9ydCgndGltaW5nLW9iamVjdCcpLklUaW1pbmdPYmplY3R9IFRpbWluZ09iamVjdCAqL1xuICAvKiogQHR5cGVkZWYge2ltcG9ydCgnLi9saWIvdGltaW5nLXNyYy1jb25uZWN0b3IudHlwZXMnKS5UaW1pbmdTcmNDb25uZWN0b3JPcHRpb25zfSBUaW1pbmdTcmNDb25uZWN0b3JPcHRpb25zICovXG4gIC8qKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2xpYi90aW1pbmctc3JjLWNvbm5lY3RvcicpLlRpbWluZ1NyY0Nvbm5lY3Rvcn0gVGltaW5nU3JjQ29ubmVjdG9yICovXG5cbiAgLyoqXG4gICAqIENvbm5lY3RzIGEgVGltaW5nT2JqZWN0IHRvIHRoZSB2aWRlbyBwbGF5ZXIgKGh0dHBzOi8vd2VidGltaW5nLmdpdGh1Yi5pby90aW1pbmdvYmplY3QvKVxuICAgKlxuICAgKiBAcGFyYW0ge1RpbWluZ09iamVjdH0gdGltaW5nT2JqZWN0XG4gICAqIEBwYXJhbSB7VGltaW5nU3JjQ29ubmVjdG9yT3B0aW9uc30gb3B0aW9uc1xuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPFRpbWluZ1NyY0Nvbm5lY3Rvcj59XG4gICAqL1xuICBhc3luYyBzZXRUaW1pbmdTcmModGltaW5nT2JqZWN0LCBvcHRpb25zKSB7XG4gICAgaWYgKCF0aW1pbmdPYmplY3QpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgVGltaW5nIE9iamVjdCBtdXN0IGJlIHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnJlYWR5KCk7XG4gICAgY29uc3QgY29ubmVjdG9yID0gbmV3IFRpbWluZ1NyY0Nvbm5lY3Rvcih0aGlzLCB0aW1pbmdPYmplY3QsIG9wdGlvbnMpO1xuICAgIHBvc3RNZXNzYWdlKHRoaXMsICdub3RpZnlUaW1pbmdPYmplY3RDb25uZWN0Jyk7XG4gICAgY29ubmVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc2Nvbm5lY3QnLCAoKSA9PiBwb3N0TWVzc2FnZSh0aGlzLCAnbm90aWZ5VGltaW5nT2JqZWN0RGlzY29ubmVjdCcpKTtcbiAgICByZXR1cm4gY29ubmVjdG9yO1xuICB9XG59XG5cbi8vIFNldHVwIGVtYmVkIG9ubHkgaWYgdGhpcyBpcyBub3QgYSBzZXJ2ZXIgcnVudGltZVxuaWYgKCFpc1NlcnZlclJ1bnRpbWUpIHtcbiAgc2NyZWVuZnVsbCA9IGluaXRpYWxpemVTY3JlZW5mdWxsKCk7XG4gIGluaXRpYWxpemVFbWJlZHMoKTtcbiAgcmVzaXplRW1iZWRzKCk7XG4gIGluaXRBcHBlbmRWaWRlb01ldGFkYXRhKCk7XG4gIGNoZWNrVXJsVGltZVBhcmFtKCk7XG4gIHVwZGF0ZURSTUVtYmVkcygpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7XG4iLCJcclxuY29uc3QgRmlsdGVycyA9IHtcclxuXHJcbiAgICB0cmVlU29sdmVHdWlkZUlEOiBcInRyZWVTb2x2ZUd1aWRlXCIsXHJcbiAgICB0cmVlU29sdmVGcmFnbWVudHNJRDogXCJ0cmVlU29sdmVGcmFnbWVudHNcIixcclxuICAgIHVwTmF2RWxlbWVudDogJyNzdGVwTmF2IC5jaGFpbi11cHdhcmRzJyxcclxuICAgIGRvd25OYXZFbGVtZW50OiAnI3N0ZXBOYXYgLmNoYWluLWRvd253YXJkcycsXHJcblxyXG4gICAgZnJhZ21lbnRCb3g6ICcjdHJlZVNvbHZlRnJhZ21lbnRzIC5udC1mci1mcmFnbWVudC1ib3gnLFxyXG4gICAgZnJhZ21lbnRCb3hEaXNjdXNzaW9uOiAnI3RyZWVTb2x2ZUZyYWdtZW50cyAubnQtZnItZnJhZ21lbnQtYm94IC5udC1mci1mcmFnbWVudC1kaXNjdXNzaW9uJyxcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmlsdGVycztcclxuIiwiaW1wb3J0IEZpbHRlcnMgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzXCI7XHJcblxyXG5cclxuY29uc3Qgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCA9ICgpID0+IHtcclxuXHJcbiAgICBjb25zdCBmcmFnbWVudEJveERpc2N1c3Npb25zOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChGaWx0ZXJzLmZyYWdtZW50Qm94RGlzY3Vzc2lvbik7XHJcbiAgICBsZXQgZnJhZ21lbnRCb3g6IEhUTUxEaXZFbGVtZW50O1xyXG4gICAgbGV0IGRhdGFEaXNjdXNzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFnbWVudEJveERpc2N1c3Npb25zLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Qm94ID0gZnJhZ21lbnRCb3hEaXNjdXNzaW9uc1tpXSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgICAgICBkYXRhRGlzY3Vzc2lvbiA9IGZyYWdtZW50Qm94LmRhdGFzZXQuZGlzY3Vzc2lvbjtcclxuXHJcbiAgICAgICAgaWYgKGRhdGFEaXNjdXNzaW9uICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50Qm94LmlubmVySFRNTCA9IGRhdGFEaXNjdXNzaW9uO1xyXG4gICAgICAgICAgICBkZWxldGUgZnJhZ21lbnRCb3guZGF0YXNldC5kaXNjdXNzaW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQ7XHJcbiIsImltcG9ydCBQbGF5ZXIgZnJvbSBcIkB2aW1lby9wbGF5ZXJcIjtcclxuXHJcbmltcG9ydCBvbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkIGZyb20gXCIuLi8uLi9mcmFnbWVudHMvY29kZS9vbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkXCI7XHJcblxyXG5cclxuY29uc3Qgc2V0VXBWaW1lb1BsYXllciA9ICgpID0+IHtcclxuXHJcbiAgICAvLyBJZiB5b3Ugd2FudCB0byBjb250cm9sIHRoZSBlbWJlZHMsIHlvdSdsbCBuZWVkIHRvIGNyZWF0ZSBhIFBsYXllciBvYmplY3QuXHJcbiAgICAvLyBZb3UgY2FuIHBhc3MgZWl0aGVyIHRoZSBgPGRpdj5gIG9yIHRoZSBgPGlmcmFtZT5gIGNyZWF0ZWQgaW5zaWRlIHRoZSBkaXYuXHJcblxyXG4gICAgY29uc3QgdmltZW9QbGF5ZXJEaXZzOiBOb2RlTGlzdE9mPEhUTUxEaXZFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5udC10cC12aW1lby1wbGF5ZXInKSBhcyBOb2RlTGlzdE9mPEhUTUxEaXZFbGVtZW50PjtcclxuXHJcbiAgICBpZiAoIXZpbWVvUGxheWVyRGl2cykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdmltZW9QbGF5ZXJEaXY6IEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmltZW9QbGF5ZXJEaXZzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgIHZpbWVvUGxheWVyRGl2ID0gdmltZW9QbGF5ZXJEaXZzW2ldO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYXV0b3BhdXNlOiBmYWxzZSxcclxuICAgICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICB3aWR0aDogNjQwLFxyXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG5ldyBQbGF5ZXIoXHJcbiAgICAgICAgICAgIHZpbWVvUGxheWVyRGl2LFxyXG4gICAgICAgICAgICBvcHRpb25zXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IG9uUmVuZGVyRmluaXNoZWQgPSAoKSA9PiB7XHJcblxyXG4gICAgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCgpO1xyXG4gICAgc2V0VXBWaW1lb1BsYXllcigpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgb25SZW5kZXJGaW5pc2hlZDtcclxuIiwiaW1wb3J0IG9uUmVuZGVyRmluaXNoZWQgZnJvbSBcIi4vb25SZW5kZXJGaW5pc2hlZFwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRFdmVudHMgPSB7XHJcblxyXG4gIG9uUmVuZGVyRmluaXNoZWQ6ICgpID0+IHtcclxuXHJcbiAgICBvblJlbmRlckZpbmlzaGVkKCk7XHJcbiAgfSxcclxuXHJcbiAgcmVnaXN0ZXJHbG9iYWxFdmVudHM6ICgpID0+IHtcclxuXHJcbiAgICB3aW5kb3cub25yZXNpemUgPSAoKSA9PiB7XHJcblxyXG4gICAgICBpbml0RXZlbnRzLm9uUmVuZGVyRmluaXNoZWQoKTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0RXZlbnRzO1xyXG5cclxuXHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRBY3Rpb25zID0ge1xyXG5cclxuICAgIHNldE5vdFJhdzogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdz8uVHJlZVNvbHZlPy5zY3JlZW4/LmlzQXV0b2ZvY3VzRmlyc3RSdW4pIHtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmF1dG9mb2N1cyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaXNBdXRvZm9jdXNGaXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdEFjdGlvbnM7XHJcbiIsIlxyXG5leHBvcnQgZW51bSBQYXJzZVR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBKc29uID0gJ2pzb24nLFxyXG4gICAgVGV4dCA9ICd0ZXh0J1xyXG59XHJcblxyXG4iLCJpbXBvcnQgSVJlbmRlckZyYWdtZW50VUkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlckZyYWdtZW50VUlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJGcmFnbWVudFVJIGltcGxlbWVudHMgSVJlbmRlckZyYWdtZW50VUkge1xyXG5cclxuICAgIHB1YmxpYyBmcmFnbWVudE9wdGlvbnNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGRpc2N1c3Npb25Mb2FkZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBhbmNpbGxhcnlFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGRvTm90UGFpbnQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBzZWN0aW9uSW5kZXg6IG51bWJlciA9IDA7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5pbXBvcnQgUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vdWkvUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckZyYWdtZW50IGltcGxlbWVudHMgSVJlbmRlckZyYWdtZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBpZDogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXIgfCBudWxsXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5zZWN0aW9uID0gc2VjdGlvbjtcclxuICAgICAgICB0aGlzLnBhcmVudEZyYWdtZW50SUQgPSBwYXJlbnRGcmFnbWVudElEO1xyXG4gICAgICAgIHRoaXMuc2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpZDogc3RyaW5nO1xyXG4gICAgcHVibGljIGlLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGlFeGl0S2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBleGl0S2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBhdXRvTWVyZ2VFeGl0OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgcG9kS2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBwb2RUZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyB0b3BMZXZlbE1hcEtleTogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgbWFwS2V5Q2hhaW46IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIGd1aWRlSUQ6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZztcclxuICAgIHB1YmxpYyB2YWx1ZTogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgc2VsZWN0ZWQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGlzTGVhZjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4gPSBbXTtcclxuICAgIHB1YmxpYyB2YXJpYWJsZTogQXJyYXk8W3N0cmluZ10gfCBbc3RyaW5nLCBzdHJpbmddPiA9IFtdO1xyXG4gICAgcHVibGljIGNsYXNzZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBpc0FuY2lsbGFyeTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG9yZGVyOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyBsaW5rOiBJRGlzcGxheUNoYXJ0IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgcG9kOiBJRGlzcGxheUNoYXJ0IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uO1xyXG4gICAgcHVibGljIHNlZ21lbnRJbmRleDogbnVtYmVyIHwgbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgdWk6IElSZW5kZXJGcmFnbWVudFVJID0gbmV3IFJlbmRlckZyYWdtZW50VUkoKTtcclxufVxyXG4iLCJcclxuZXhwb3J0IGVudW0gT3V0bGluZVR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBOb2RlID0gJ25vZGUnLFxyXG4gICAgRXhpdCA9ICdleGl0JyxcclxuICAgIExpbmsgPSAnbGluaydcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJPdXRsaW5lTm9kZSBpbXBsZW1lbnRzIElSZW5kZXJPdXRsaW5lTm9kZSB7XHJcblxyXG4gICAgcHVibGljIGk6IHN0cmluZyA9ICcnOyAvLyBpZFxyXG4gICAgcHVibGljIGM6IG51bWJlciB8IG51bGwgPSBudWxsOyAvLyBpbmRleCBmcm9tIG91dGxpbmUgY2hhcnQgYXJyYXlcclxuICAgIHB1YmxpYyBkOiBudW1iZXIgfCBudWxsID0gbnVsbDsgLy8gaW5kZXggZnJvbSBvdXRsaW5lIGNoYXJ0IGFycmF5XHJcbiAgICBwdWJsaWMgeDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCA9IG51bGw7IC8vIGlFeGl0IGlkXHJcbiAgICBwdWJsaWMgX3g6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQgPSBudWxsOyAvLyBleGl0IGlkXHJcbiAgICBwdWJsaWMgbzogQXJyYXk8SVJlbmRlck91dGxpbmVOb2RlPiA9IFtdOyAvLyBvcHRpb25zXHJcbiAgICBwdWJsaWMgcGFyZW50OiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyB0eXBlOiBPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLk5vZGU7XHJcbiAgICBwdWJsaWMgaXNDaGFydDogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgaXNSb290OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgaXNMYXN0OiBib29sZWFuID0gZmFsc2U7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IFJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuL1JlbmRlck91dGxpbmVOb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyT3V0bGluZSBpbXBsZW1lbnRzIElSZW5kZXJPdXRsaW5lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwYXRoOiBzdHJpbmcsXHJcbiAgICAgICAgYmFzZVVSSTogc3RyaW5nXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xyXG4gICAgICAgIHRoaXMuYmFzZVVSSSA9IGJhc2VVUkk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhdGg6IHN0cmluZztcclxuICAgIHB1YmxpYyBiYXNlVVJJOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgbG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHY6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHI6IElSZW5kZXJPdXRsaW5lTm9kZSA9IG5ldyBSZW5kZXJPdXRsaW5lTm9kZSgpO1xyXG4gICAgcHVibGljIGM6IEFycmF5PElSZW5kZXJPdXRsaW5lQ2hhcnQ+ID0gW107XHJcbiAgICBwdWJsaWMgZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gICAgcHVibGljIG12OiBhbnkgfCB1bmRlZmluZWQ7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJPdXRsaW5lQ2hhcnQgaW1wbGVtZW50cyBJUmVuZGVyT3V0bGluZUNoYXJ0IHtcclxuXHJcbiAgICBwdWJsaWMgaTogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgYjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgcDogc3RyaW5nID0gJyc7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5R3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUd1aWRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uL3JlbmRlci9SZW5kZXJGcmFnbWVudFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BsYXlHdWlkZSBpbXBsZW1lbnRzIElEaXNwbGF5R3VpZGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIGd1aWRlOiBJUmVuZGVyR3VpZGUsXHJcbiAgICAgICAgcm9vdElEOiBzdHJpbmdcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMubGlua0lEID0gbGlua0lEO1xyXG4gICAgICAgIHRoaXMuZ3VpZGUgPSBndWlkZTtcclxuXHJcbiAgICAgICAgdGhpcy5yb290ID0gbmV3IFJlbmRlckZyYWdtZW50KFxyXG4gICAgICAgICAgICByb290SUQsXHJcbiAgICAgICAgICAgIFwiZ3VpZGVSb290XCIsXHJcbiAgICAgICAgICAgIHRoaXMsXHJcbiAgICAgICAgICAgIDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsaW5rSUQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBndWlkZTogSVJlbmRlckd1aWRlO1xyXG4gICAgcHVibGljIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgcm9vdDogSVJlbmRlckZyYWdtZW50O1xyXG4gICAgcHVibGljIGN1cnJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJHdWlkZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckd1aWRlIGltcGxlbWVudHMgSVJlbmRlckd1aWRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaWQ6IHN0cmluZztcclxuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZGVzY3JpcHRpb246IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHBhdGg6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxufVxyXG4iLCJcclxuZXhwb3J0IGVudW0gU2Nyb2xsSG9wVHlwZSB7XHJcbiAgICBOb25lID0gXCJub25lXCIsXHJcbiAgICBVcCA9IFwidXBcIixcclxuICAgIERvd24gPSBcImRvd25cIlxyXG59XHJcbiIsImltcG9ydCB7IFNjcm9sbEhvcFR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9TY3JvbGxIb3BUeXBlXCI7XHJcbmltcG9ydCBJU2NyZWVuIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3dpbmRvdy9JU2NyZWVuXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NyZWVuIGltcGxlbWVudHMgSVNjcmVlbiB7XHJcblxyXG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzQXV0b2ZvY3VzRmlyc3RSdW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGhpZGVCYW5uZXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBzY3JvbGxUb1RvcDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNjcm9sbFRvRWxlbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2Nyb2xsSG9wOiBTY3JvbGxIb3BUeXBlID0gU2Nyb2xsSG9wVHlwZS5Ob25lO1xyXG4gICAgcHVibGljIGxhc3RTY3JvbGxZOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyB1YTogYW55IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElTY3JlZW4gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lTY3JlZW5cIjtcclxuaW1wb3J0IElUcmVlU29sdmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lUcmVlU29sdmVcIjtcclxuaW1wb3J0IFNjcmVlbiBmcm9tIFwiLi9TY3JlZW5cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmVlU29sdmUgaW1wbGVtZW50cyBJVHJlZVNvbHZlIHtcclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyaW5nQ29tbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2NyZWVuOiBJU2NyZWVuID0gbmV3IFNjcmVlbigpO1xyXG59XHJcbiIsIlxyXG5cclxuY29uc3QgZ0ZpbGVDb25zdGFudHMgPSB7XHJcblxyXG4gICAgZnJhZ21lbnRzRm9sZGVyU3VmZml4OiAnX2ZyYWdzJyxcclxuICAgIGZyYWdtZW50RmlsZUV4dGVuc2lvbjogJy5odG1sJyxcclxuICAgIGd1aWRlT3V0bGluZUZpbGVuYW1lOiAnb3V0bGluZS50c29sbicsXHJcbiAgICBndWlkZVJlbmRlckNvbW1lbnRUYWc6ICd0c0d1aWRlUmVuZGVyQ29tbWVudCAnLFxyXG4gICAgZnJhZ21lbnRSZW5kZXJDb21tZW50VGFnOiAndHNGcmFnbWVudFJlbmRlckNvbW1lbnQgJyxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdGaWxlQ29uc3RhbnRzO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJHdWlkZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgRmlsdGVycyBmcm9tIFwiLi4vLi4vc3RhdGUvY29uc3RhbnRzL0ZpbHRlcnNcIjtcclxuaW1wb3J0IERpc3BsYXlHdWlkZSBmcm9tIFwiLi4vLi4vc3RhdGUvZGlzcGxheS9EaXNwbGF5R3VpZGVcIjtcclxuaW1wb3J0IFJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IFRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vc3RhdGUvd2luZG93L1RyZWVTb2x2ZVwiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4vZ1N0YXRlQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IHBhcnNlR3VpZGUgPSAocmF3R3VpZGU6IGFueSk6IElSZW5kZXJHdWlkZSA9PiB7XHJcblxyXG4gICAgY29uc3QgZ3VpZGU6IElSZW5kZXJHdWlkZSA9IG5ldyBSZW5kZXJHdWlkZShyYXdHdWlkZS5pZCk7XHJcbiAgICBndWlkZS50aXRsZSA9IHJhd0d1aWRlLnRpdGxlID8/ICcnO1xyXG4gICAgZ3VpZGUuZGVzY3JpcHRpb24gPSByYXdHdWlkZS5kZXNjcmlwdGlvbiA/PyAnJztcclxuICAgIGd1aWRlLnBhdGggPSByYXdHdWlkZS5wYXRoID8/IG51bGw7XHJcbiAgICBndWlkZS5mcmFnbWVudEZvbGRlclVybCA9IGdSZW5kZXJDb2RlLmdldEd1aWRlRnJhZ21lbnRGb2xkZXJVcmwocmF3R3VpZGUuZnJhZ21lbnRGb2xkZXJQYXRoKTtcclxuXHJcbiAgICByZXR1cm4gZ3VpZGU7XHJcbn07XHJcblxyXG5jb25zdCBwYXJzZVJlbmRlcmluZ0NvbW1lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmF3OiBhbnlcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFyYXcpIHtcclxuICAgICAgICByZXR1cm4gcmF3O1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbntcclxuICAgIFwiZ3VpZGVcIjoge1xyXG4gICAgICAgIFwiaWRcIjogXCJkQnQ3Sk4xdnRcIlxyXG4gICAgfSxcclxuICAgIFwiZnJhZ21lbnRcIjoge1xyXG4gICAgICAgIFwiaWRcIjogXCJkQnQ3Sk4xdnRcIixcclxuICAgICAgICBcInRvcExldmVsTWFwS2V5XCI6IFwiY3YxVFJsMDFyZlwiLFxyXG4gICAgICAgIFwibWFwS2V5Q2hhaW5cIjogXCJjdjFUUmwwMXJmXCIsXHJcbiAgICAgICAgXCJndWlkZUlEXCI6IFwiZEJ0N0pOMUhlXCIsXHJcbiAgICAgICAgXCJwYXJlbnRGcmFnbWVudElEXCI6IG51bGwsXHJcbiAgICAgICAgXCJjaGFydEtleVwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcIm9wdGlvbnNcIjogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZEJ0N0taMUFOXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9wdGlvblwiOiBcIk9wdGlvbiAxXCIsXHJcbiAgICAgICAgICAgICAgICBcImlzQW5jaWxsYXJ5XCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgXCJvcmRlclwiOiAxXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkQnQ3S1oxUmJcIixcclxuICAgICAgICAgICAgICAgIFwib3B0aW9uXCI6IFwiT3B0aW9uIDJcIixcclxuICAgICAgICAgICAgICAgIFwiaXNBbmNpbGxhcnlcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBcIm9yZGVyXCI6IDJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImRCdDdLWjI0QlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcHRpb25cIjogXCJPcHRpb24gM1wiLFxyXG4gICAgICAgICAgICAgICAgXCJpc0FuY2lsbGFyeVwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwib3JkZXJcIjogM1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG59ICAgIFxyXG4gICAgKi9cclxuXHJcbiAgICBjb25zdCBndWlkZSA9IHBhcnNlR3VpZGUocmF3Lmd1aWRlKTtcclxuXHJcbiAgICBjb25zdCBkaXNwbGF5R3VpZGUgPSBuZXcgRGlzcGxheUd1aWRlKFxyXG4gICAgICAgIGdTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpLFxyXG4gICAgICAgIGd1aWRlLFxyXG4gICAgICAgIHJhdy5mcmFnbWVudC5pZFxyXG4gICAgKTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEd1aWRlUm9vdEZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHJhdy5mcmFnbWVudCxcclxuICAgICAgICBkaXNwbGF5R3VpZGUucm9vdFxyXG4gICAgKTtcclxuXHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUgPSBkaXNwbGF5R3VpZGU7XHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50U2VjdGlvbiA9IGRpc3BsYXlHdWlkZTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmNhY2hlU2VjdGlvblJvb3QoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZ1JlbmRlckNvZGUgPSB7XHJcblxyXG4gICAgZ2V0R3VpZGVGcmFnbWVudEZvbGRlclVybDogKGZvbGRlclBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoXHJcbiAgICAgICAgICAgIGZvbGRlclBhdGgsXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJhc2VVUklcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdXJsLnRvU3RyaW5nKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyYWdtZW50Rm9sZGVyVXJsOiAoXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcGF0aCA9IGNoYXJ0LnA7XHJcblxyXG4gICAgICAgIGlmIChwYXRoLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykgPT09IHRydWVcclxuICAgICAgICAgICAgfHwgcGF0aC5zdGFydHNXaXRoKCdodHRwOi8vJykgPT09IHRydWVcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYmFzZVVSSSA9IGZyYWdtZW50LnNlY3Rpb24ub3V0bGluZT8uYmFzZVVSSTtcclxuXHJcbiAgICAgICAgaWYgKCFiYXNlVVJJKSB7XHJcblxyXG4gICAgICAgICAgICBiYXNlVVJJID0gZG9jdW1lbnQuYmFzZVVSSTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoXHJcbiAgICAgICAgICAgIHBhdGgsXHJcbiAgICAgICAgICAgIGJhc2VVUklcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdXJsLnRvU3RyaW5nKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZ2lzdGVyR3VpZGVDb21tZW50OiAoKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHRyZWVTb2x2ZUd1aWRlOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKEZpbHRlcnMudHJlZVNvbHZlR3VpZGVJRCkgYXMgSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0cmVlU29sdmVHdWlkZVxyXG4gICAgICAgICAgICAmJiB0cmVlU29sdmVHdWlkZS5oYXNDaGlsZE5vZGVzKCkgPT09IHRydWVcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkTm9kZTogQ2hpbGROb2RlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2hpbGROb2RlID0gdHJlZVNvbHZlR3VpZGUuY2hpbGROb2Rlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLm5vZGVUeXBlID09PSBOb2RlLkNPTU1FTlRfTk9ERSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUgPSBuZXcgVHJlZVNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnJlbmRlcmluZ0NvbW1lbnQgPSBjaGlsZE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VSZW5kZXJpbmdDb21tZW50OiAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmU/LnJlbmRlcmluZ0NvbW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IGd1aWRlUmVuZGVyQ29tbWVudCA9IHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudDtcclxuICAgICAgICAgICAgZ3VpZGVSZW5kZXJDb21tZW50ID0gZ3VpZGVSZW5kZXJDb21tZW50LnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ3VpZGVSZW5kZXJDb21tZW50LnN0YXJ0c1dpdGgoZ0ZpbGVDb25zdGFudHMuZ3VpZGVSZW5kZXJDb21tZW50VGFnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBndWlkZVJlbmRlckNvbW1lbnQgPSBndWlkZVJlbmRlckNvbW1lbnQuc3Vic3RyaW5nKGdGaWxlQ29uc3RhbnRzLmd1aWRlUmVuZGVyQ29tbWVudFRhZy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjb25zdCByYXcgPSBKU09OLnBhcnNlKGd1aWRlUmVuZGVyQ29tbWVudCk7XHJcblxyXG4gICAgICAgICAgICBwYXJzZVJlbmRlcmluZ0NvbW1lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJhd1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVnaXN0ZXJGcmFnbWVudENvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZW5kZXJDb2RlO1xyXG4iLCJpbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwbGF5Q2hhcnQgaW1wbGVtZW50cyBJRGlzcGxheUNoYXJ0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydFxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5saW5rSUQgPSBsaW5rSUQ7XHJcbiAgICAgICAgdGhpcy5jaGFydCA9IGNoYXJ0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsaW5rSUQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydDtcclxuICAgIHB1YmxpYyBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHJvb3Q6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHBhcmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgY3VycmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lTZWdtZW50Tm9kZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYWluU2VnbWVudCBpbXBsZW1lbnRzIElDaGFpblNlZ21lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgc3RhcnQ6IElTZWdtZW50Tm9kZSxcclxuICAgICAgICBlbmQ6IElTZWdtZW50Tm9kZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgICAgICB0aGlzLnRleHQgPSBgJHtzdGFydC50ZXh0fSR7ZW5kPy50ZXh0ID8/ICcnfWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdGV4dDogc3RyaW5nO1xyXG4gICAgcHVibGljIG91dGxpbmVOb2RlczogQXJyYXk8SVJlbmRlck91dGxpbmVOb2RlPiA9IFtdO1xyXG4gICAgcHVibGljIG91dGxpbmVOb2Rlc0xvYWRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBzdGFydDogSVNlZ21lbnROb2RlO1xyXG4gICAgcHVibGljIGVuZDogSVNlZ21lbnROb2RlO1xyXG5cclxuICAgIHB1YmxpYyBzZWdtZW50SW5TZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24gfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzZWdtZW50U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2VnbWVudE91dFNlY3Rpb246IElEaXNwbGF5U2VjdGlvbiB8IG51bGwgPSBudWxsO1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcbmltcG9ydCBJU2VnbWVudE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSVNlZ21lbnROb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VnbWVudE5vZGUgaW1wbGVtZW50cyBJU2VnbWVudE5vZGV7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgdGV4dDogc3RyaW5nLFxyXG4gICAgICAgIGtleTogc3RyaW5nLFxyXG4gICAgICAgIHR5cGU6IE91dGxpbmVUeXBlLFxyXG4gICAgICAgIGlzUm9vdDogYm9vbGVhbixcclxuICAgICAgICBpc0xhc3Q6IGJvb2xlYW5cclxuICAgICkge1xyXG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLmlzUm9vdCA9IGlzUm9vdDtcclxuICAgICAgICB0aGlzLmlzTGFzdCA9IGlzTGFzdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGV4dDogc3RyaW5nO1xyXG4gICAgcHVibGljIGtleTogc3RyaW5nO1xyXG4gICAgcHVibGljIHR5cGU6IE91dGxpbmVUeXBlO1xyXG4gICAgcHVibGljIGlzUm9vdDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBpc0xhc3Q6IGJvb2xlYW47XHJcbn1cclxuXHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lTZWdtZW50Tm9kZVwiO1xyXG5pbXBvcnQgQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9zdGF0ZS9zZWdtZW50cy9DaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IFNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9zdGF0ZS9zZWdtZW50cy9TZWdtZW50Tm9kZVwiO1xyXG5pbXBvcnQgZ1V0aWxpdGllcyBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBjaGVja0ZvckxpbmtFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgbGlua1NlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmIChzZWdtZW50LmVuZC5rZXkgIT09IGxpbmtTZWdtZW50LnN0YXJ0LmtleVxyXG4gICAgICAgIHx8IHNlZ21lbnQuZW5kLnR5cGUgIT09IGxpbmtTZWdtZW50LnN0YXJ0LnR5cGVcclxuICAgICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpbmsgc2VnbWVudCBzdGFydCBkb2VzIG5vdCBtYXRjaCBzZWdtZW50IGVuZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxpbmtTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsIC0gbGlua1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxpbmtTZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIGxpbmtcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFsaW5rU2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IG91dCBzZWN0aW9uIHdhcyBudWxsIC0gbGlua1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rIGlLZXknKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGxpbmtTZWdtZW50LnN0YXJ0LnR5cGUgIT09IE91dGxpbmVUeXBlLkxpbmspIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnZXRJZGVudGlmaWVyQ2hhcmFjdGVyID0gKGlkZW50aWZpZXJDaGFyOiBzdHJpbmcpOiB7IHR5cGU6IE91dGxpbmVUeXBlLCBpc0xhc3Q6IGJvb2xlYW4gfSA9PiB7XHJcblxyXG4gICAgbGV0IHN0YXJ0T3V0bGluZVR5cGU6IE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuICAgIGxldCBpc0xhc3QgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoaWRlbnRpZmllckNoYXIgPT09ICd+Jykge1xyXG5cclxuICAgICAgICBzdGFydE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTGluaztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGlkZW50aWZpZXJDaGFyID09PSAnXycpIHtcclxuXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLkV4aXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpZGVudGlmaWVyQ2hhciA9PT0gJy0nKSB7XHJcblxyXG4gICAgICAgIHN0YXJ0T3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5Ob2RlO1xyXG4gICAgICAgIGlzTGFzdCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHF1ZXJ5IHN0cmluZyBvdXRsaW5lIG5vZGUgaWRlbnRpZmllcjogJHtpZGVudGlmaWVyQ2hhcn1gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IHN0YXJ0T3V0bGluZVR5cGUsXHJcbiAgICAgICAgaXNMYXN0OiBpc0xhc3RcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRLZXlFbmRJbmRleCA9IChyZW1haW5pbmdDaGFpbjogc3RyaW5nKTogeyBpbmRleDogbnVtYmVyLCBpc0xhc3Q6IGJvb2xlYW4gfCBudWxsIH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0S2V5RW5kSW5kZXggPSBVLmluZGV4T2ZBbnkoXHJcbiAgICAgICAgcmVtYWluaW5nQ2hhaW4sXHJcbiAgICAgICAgWyd+JywgJy0nLCAnXyddLFxyXG4gICAgICAgIDFcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHN0YXJ0S2V5RW5kSW5kZXggPT09IC0xKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluZGV4OiByZW1haW5pbmdDaGFpbi5sZW5ndGgsXHJcbiAgICAgICAgICAgIGlzTGFzdDogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbmRleDogc3RhcnRLZXlFbmRJbmRleCxcclxuICAgICAgICBpc0xhc3Q6IG51bGxcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRPdXRsaW5lVHlwZSA9IChyZW1haW5pbmdDaGFpbjogc3RyaW5nKTogeyB0eXBlOiBPdXRsaW5lVHlwZSwgaXNMYXN0OiBib29sZWFuIH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IGlkZW50aWZpZXJDaGFyID0gcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKDAsIDEpO1xyXG4gICAgY29uc3Qgb3V0bGluZVR5cGUgPSBnZXRJZGVudGlmaWVyQ2hhcmFjdGVyKGlkZW50aWZpZXJDaGFyKTtcclxuXHJcbiAgICByZXR1cm4gb3V0bGluZVR5cGU7XHJcbn07XHJcblxyXG5jb25zdCBnZXROZXh0U2VnbWVudE5vZGUgPSAocmVtYWluaW5nQ2hhaW46IHN0cmluZyk6IHsgc2VnbWVudE5vZGU6IElTZWdtZW50Tm9kZSB8IG51bGwsIGVuZENoYWluOiBzdHJpbmcgfSA9PiB7XHJcblxyXG4gICAgbGV0IHNlZ21lbnROb2RlOiBJU2VnbWVudE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIGxldCBlbmRDaGFpbiA9IFwiXCI7XHJcblxyXG4gICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShyZW1haW5pbmdDaGFpbikpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZVR5cGUgPSBnZXRPdXRsaW5lVHlwZShyZW1haW5pbmdDaGFpbik7XHJcbiAgICAgICAgY29uc3Qga2V5RW5kOiB7IGluZGV4OiBudW1iZXIsIGlzTGFzdDogYm9vbGVhbiB8IG51bGwgfSA9IGdldEtleUVuZEluZGV4KHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICBrZXlFbmQuaW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzZWdtZW50Tm9kZSA9IG5ldyBTZWdtZW50Tm9kZShcclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKDAsIGtleUVuZC5pbmRleCksXHJcbiAgICAgICAgICAgIGtleSxcclxuICAgICAgICAgICAgb3V0bGluZVR5cGUudHlwZSxcclxuICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgIG91dGxpbmVUeXBlLmlzTGFzdFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChrZXlFbmQuaXNMYXN0ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBzZWdtZW50Tm9kZS5pc0xhc3QgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZW5kQ2hhaW4gPSByZW1haW5pbmdDaGFpbi5zdWJzdHJpbmcoa2V5RW5kLmluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNlZ21lbnROb2RlLFxyXG4gICAgICAgIGVuZENoYWluXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRTZWdtZW50ID0gKFxyXG4gICAgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+LFxyXG4gICAgcmVtYWluaW5nQ2hhaW46IHN0cmluZ1xyXG4pOiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfSA9PiB7XHJcblxyXG4gICAgY29uc3Qgc2VnbWVudFN0YXJ0ID0gZ2V0TmV4dFNlZ21lbnROb2RlKHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnRTdGFydC5zZWdtZW50Tm9kZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHN0YXJ0IG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtYWluaW5nQ2hhaW4gPSBzZWdtZW50U3RhcnQuZW5kQ2hhaW47XHJcbiAgICBjb25zdCBzZWdtZW50RW5kID0gZ2V0TmV4dFNlZ21lbnROb2RlKHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnRFbmQuc2VnbWVudE5vZGUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBlbmQgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWdtZW50ID0gbmV3IENoYWluU2VnbWVudChcclxuICAgICAgICBzZWdtZW50cy5sZW5ndGgsXHJcbiAgICAgICAgc2VnbWVudFN0YXJ0LnNlZ21lbnROb2RlLFxyXG4gICAgICAgIHNlZ21lbnRFbmQuc2VnbWVudE5vZGVcclxuICAgICk7XHJcblxyXG4gICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlbWFpbmluZ0NoYWluLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFJvb3RTZWdtZW50ID0gKFxyXG4gICAgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+LFxyXG4gICAgcmVtYWluaW5nQ2hhaW46IHN0cmluZ1xyXG4pOiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfSA9PiB7XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnRTdGFydCA9IG5ldyBTZWdtZW50Tm9kZShcclxuICAgICAgICBcImd1aWRlUm9vdFwiLFxyXG4gICAgICAgICcnLFxyXG4gICAgICAgIE91dGxpbmVUeXBlLk5vZGUsXHJcbiAgICAgICAgdHJ1ZSxcclxuICAgICAgICBmYWxzZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCByb290U2VnbWVudEVuZCA9IGdldE5leHRTZWdtZW50Tm9kZShyZW1haW5pbmdDaGFpbik7XHJcblxyXG4gICAgaWYgKCFyb290U2VnbWVudEVuZC5zZWdtZW50Tm9kZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHN0YXJ0IG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBuZXcgQ2hhaW5TZWdtZW50KFxyXG4gICAgICAgIHNlZ21lbnRzLmxlbmd0aCxcclxuICAgICAgICByb290U2VnbWVudFN0YXJ0LFxyXG4gICAgICAgIHJvb3RTZWdtZW50RW5kLnNlZ21lbnROb2RlXHJcbiAgICApO1xyXG5cclxuICAgIHNlZ21lbnRzLnB1c2gocm9vdFNlZ21lbnQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVtYWluaW5nQ2hhaW4sXHJcbiAgICAgICAgc2VnbWVudDogcm9vdFNlZ21lbnRcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBsb2FkU2VnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgc3RhcnRPdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IG51bGxcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgZ1NlZ21lbnRDb2RlLmxvYWRTZWdtZW50T3V0bGluZU5vZGVzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lTm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBuZXh0U2VnbWVudE91dGxpbmVOb2RlcyA9IHNlZ21lbnQub3V0bGluZU5vZGVzO1xyXG5cclxuICAgIGlmIChuZXh0U2VnbWVudE91dGxpbmVOb2Rlcy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpcnN0Tm9kZSA9IG5leHRTZWdtZW50T3V0bGluZU5vZGVzW25leHRTZWdtZW50T3V0bGluZU5vZGVzLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3ROb2RlLmkgPT09IHNlZ21lbnQuc3RhcnQua2V5KSB7XHJcblxyXG4gICAgICAgICAgICBmaXJzdE5vZGUudHlwZSA9IHNlZ21lbnQuc3RhcnQudHlwZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxhc3ROb2RlID0gbmV4dFNlZ21lbnRPdXRsaW5lTm9kZXNbMF07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Tm9kZS5pID09PSBzZWdtZW50LmVuZC5rZXkpIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3ROb2RlLnR5cGUgPSBzZWdtZW50LmVuZC50eXBlO1xyXG4gICAgICAgICAgICBsYXN0Tm9kZS5pc0xhc3QgPSBzZWdtZW50LmVuZC5pc0xhc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdGcmFnbWVudENvZGUubG9hZE5leHRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnU2VnbWVudENvZGUgPSB7XHJcblxyXG4gICAgc2V0TmV4dFNlZ21lbnRTZWN0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGwsXHJcbiAgICAgICAgbGluazogSURpc3BsYXlDaGFydFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgIHx8ICFzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbc2VnbWVudEluZGV4IC0gMV07XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50c1tzZWdtZW50SW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gbGluazsgLy8gVGhpcyBjb3VsZCBiZSBzZXQgYWdhaW4gd2hlbiB0aGUgZW5kIG5vZGUgaXMgcHJvY2Vzc2VkXHJcblxyXG4gICAgICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRMaW5rU2VnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua1NlZ21lbnRJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIGxpbmtGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGxpbms6IElEaXNwbGF5Q2hhcnRcclxuICAgICk6IElDaGFpblNlZ21lbnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG5cclxuICAgICAgICBpZiAobGlua1NlZ21lbnRJbmRleCA8IDEpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5kZXggPCAwJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50U2VnbWVudCA9IHNlZ21lbnRzW2xpbmtTZWdtZW50SW5kZXggLSAxXTtcclxuICAgICAgICBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7XHJcblxyXG4gICAgICAgIGlmIChsaW5rU2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tsaW5rU2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKCFuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmV4dCBsaW5rIHNlZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV4dFNlZ21lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBsaW5rO1xyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLm91dGxpbmU/LnIuaSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5leHQgc2VnbWVudCBzZWN0aW9uIHJvb3Qga2V5IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0YXJ0T3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ub3V0bGluZT8uci5pIGFzIHN0cmluZ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxvYWRTZWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQsXHJcbiAgICAgICAgICAgIHN0YXJ0T3V0bGluZU5vZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjaGVja0ZvckxpbmtFcnJvcnMoXHJcbiAgICAgICAgICAgIGN1cnJlbnRTZWdtZW50LFxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudCxcclxuICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5leHRTZWdtZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRXhpdFNlZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIHBsdWdJRDogc3RyaW5nXHJcbiAgICApOiBJQ2hhaW5TZWdtZW50ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuICAgICAgICBjb25zdCBjdXJyZW50U2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRJbmRleF07XHJcbiAgICAgICAgY29uc3QgZXhpdFNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XHJcblxyXG4gICAgICAgIGlmIChleGl0U2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXhpdFNlZ21lbnQgPSBzZWdtZW50c1tleGl0U2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKCFleGl0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhpdCBsaW5rIHNlZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXhpdFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZXhpdFNlZ21lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRTZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICAgICAgY29uc3QgbGluayA9IHNlZ21lbnRTZWN0aW9uLnBhcmVudDtcclxuXHJcbiAgICAgICAgaWYgKCFsaW5rKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5rIGZyYWdtbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbmsuc2VjdGlvbjtcclxuICAgICAgICBleGl0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcblxyXG4gICAgICAgIGlmICghZXhpdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXhpdE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQuc3RhcnQua2V5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFleGl0T3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4aXRPdXRsaW5lTm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShleGl0T3V0bGluZU5vZGUuX3gpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeGl0IGtleSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBsdWdPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBwbHVnSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIXBsdWdPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGx1Z091dGxpbmVOb2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV4aXRPdXRsaW5lTm9kZS5feCAhPT0gcGx1Z091dGxpbmVOb2RlLngpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsdWdPdXRsaW5lTm9kZSBkb2VzIG5vdCBtYXRjaCBleGl0T3V0bGluZU5vZGVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGV4aXRTZWdtZW50LFxyXG4gICAgICAgICAgICBwbHVnT3V0bGluZU5vZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZXhpdFNlZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWROZXh0U2VnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnRJbmRleCA9IHNlZ21lbnQuaW5kZXggKyAxO1xyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgICAgIGlmIChuZXh0U2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tuZXh0U2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKG5leHRTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbG9hZFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnZXROZXh0U2VnbWVudE91dGxpbmVOb2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50XHJcbiAgICApOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgbGV0IG91dGxpbmVOb2RlID0gc2VnbWVudC5vdXRsaW5lTm9kZXMucG9wKCkgPz8gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5pc0xhc3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzZWdtZW50Lm91dGxpbmVOb2Rlcy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5leHRTZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbc2VnbWVudC5pbmRleCArIDFdO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmV4dFNlZ21lbnQgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VTZWdtZW50czogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcXVlcnlTdHJpbmc6IHN0cmluZ1xyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChxdWVyeVN0cmluZy5zdGFydHNXaXRoKCc/JykgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKHF1ZXJ5U3RyaW5nKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50czogQXJyYXk8SUNoYWluU2VnbWVudD4gPSBbXTtcclxuICAgICAgICBsZXQgcmVtYWluaW5nQ2hhaW4gPSBxdWVyeVN0cmluZztcclxuICAgICAgICBsZXQgcmVzdWx0OiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfTtcclxuXHJcbiAgICAgICAgcmVzdWx0ID0gYnVpbGRSb290U2VnbWVudChcclxuICAgICAgICAgICAgc2VnbWVudHMsXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYWluXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgd2hpbGUgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShyZW1haW5pbmdDaGFpbikpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGJ1aWxkU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRzLFxyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW5cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc2VnbWVudC5lbmQuaXNMYXN0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW4gPSByZXN1bHQucmVtYWluaW5nQ2hhaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cyA9IHNlZ21lbnRzO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkU2VnbWVudE91dGxpbmVOb2RlczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICAgICBzdGFydE91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gbnVsbFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGluIHNlY3Rpb24gd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZWdtZW50T3V0bGluZU5vZGVzOiBBcnJheTxJUmVuZGVyT3V0bGluZU5vZGU+ID0gW107XHJcblxyXG4gICAgICAgIGlmICghc3RhcnRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgc3RhcnRPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LnNlZ21lbnRJblNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudC5zdGFydC5rZXlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc3RhcnRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0YXJ0IG91dGxpbmUgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhcnRPdXRsaW5lTm9kZS50eXBlID0gc2VnbWVudC5zdGFydC50eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGVuZE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWdtZW50LnNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgc2VnbWVudC5lbmQua2V5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFlbmRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW5kIG91dGxpbmUgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVuZE91dGxpbmVOb2RlLnR5cGUgPSBzZWdtZW50LmVuZC50eXBlO1xyXG4gICAgICAgIGxldCBwYXJlbnQ6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBlbmRPdXRsaW5lTm9kZTtcclxuICAgICAgICBsZXQgZmlyc3RMb29wID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgd2hpbGUgKHBhcmVudCkge1xyXG5cclxuICAgICAgICAgICAgc2VnbWVudE91dGxpbmVOb2Rlcy5wdXNoKHBhcmVudCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZpcnN0TG9vcFxyXG4gICAgICAgICAgICAgICAgJiYgcGFyZW50Py5pc0NoYXJ0ID09PSB0cnVlXHJcbiAgICAgICAgICAgICAgICAmJiBwYXJlbnQ/LmlzUm9vdCA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocGFyZW50Py5pID09PSBzdGFydE91dGxpbmVOb2RlLmkpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaXJzdExvb3AgPSBmYWxzZTtcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlZ21lbnQub3V0bGluZU5vZGVzID0gc2VnbWVudE91dGxpbmVOb2RlcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1NlZ21lbnRDb2RlO1xyXG4iLCJpbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBnT3V0bGluZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ091dGxpbmVDb2RlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4uL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcblxyXG5cclxuY29uc3QgZ091dGxpbmVBY3Rpb25zID0ge1xyXG5cclxuICAgIGxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkR3VpZGVPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlclxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBzZWdtZW50SW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICBwYXJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFBvZE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRQb2RPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkR3VpZGVPdXRsaW5lQW5kU2VnbWVudHM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIHBhdGg6IHN0cmluZ1xyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlO1xyXG5cclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3RTZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbMF07XHJcblxyXG4gICAgICAgIGlmICghcm9vdFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gc2VjdGlvbi5ndWlkZS5mcmFnbWVudEZvbGRlclVybDtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm9vdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlY3Rpb247XHJcbiAgICAgICAgcm9vdFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBzZWN0aW9uO1xyXG4gICAgICAgIHJvb3RTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gc2VjdGlvbjtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXRoXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWRTZWdtZW50T3V0bGluZU5vZGVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcm9vdFNlZ21lbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBmaXJzdE5vZGUgPSBnU2VnbWVudENvZGUuZ2V0TmV4dFNlZ21lbnRPdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJvb3RTZWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGZpcnN0Tm9kZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Zmlyc3ROb2RlLml9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvb3RTZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Tm9kZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgYGxvYWRDaGFpbkZyYWdtZW50YCxcclxuICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBnU2VnbWVudENvZGUubG9hZE5leHRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByb290U2VnbWVudCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ091dGxpbmVBY3Rpb25zO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IFJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdSZW5kZXJDb2RlIGZyb20gXCIuL2dSZW5kZXJDb2RlXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnT3V0bGluZUFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ091dGxpbmVBY3Rpb25zXCI7XHJcbmltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcblxyXG5cclxuY29uc3QgY2FjaGVOb2RlRm9yTmV3TGluayA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuY2FjaGVfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgbGlua0lELFxyXG4gICAgICAgIG91dGxpbmVOb2RlXHJcbiAgICApO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG91dGxpbmVOb2RlLm8pIHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3TGluayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNhY2hlTm9kZUZvck5ld1BvZCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuY2FjaGVfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgbGlua0lELFxyXG4gICAgICAgIG91dGxpbmVOb2RlXHJcbiAgICApO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG91dGxpbmVOb2RlLm8pIHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3UG9kKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICBsaW5rSURcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbG9hZE5vZGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmF3Tm9kZTogYW55LFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBudWxsXHJcbik6IElSZW5kZXJPdXRsaW5lTm9kZSA9PiB7XHJcblxyXG4gICAgY29uc3Qgbm9kZSA9IG5ldyBSZW5kZXJPdXRsaW5lTm9kZSgpO1xyXG4gICAgbm9kZS5pID0gcmF3Tm9kZS5pO1xyXG4gICAgbm9kZS5jID0gcmF3Tm9kZS5jID8/IG51bGw7XHJcbiAgICBub2RlLmQgPSByYXdOb2RlLmQgPz8gbnVsbDtcclxuICAgIG5vZGUuX3ggPSByYXdOb2RlLl94ID8/IG51bGw7XHJcbiAgICBub2RlLnggPSByYXdOb2RlLnggPz8gbnVsbDtcclxuICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xyXG4gICAgbm9kZS50eXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuXHJcbiAgICBnU3RhdGVDb2RlLmNhY2hlX291dGxpbmVOb2RlKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGxpbmtJRCxcclxuICAgICAgICBub2RlXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChub2RlLmMpIHtcclxuXHJcbiAgICAgICAgbm9kZS50eXBlID0gT3V0bGluZVR5cGUuTGluaztcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmF3Tm9kZS5vXHJcbiAgICAgICAgJiYgQXJyYXkuaXNBcnJheShyYXdOb2RlLm8pID09PSB0cnVlXHJcbiAgICAgICAgJiYgcmF3Tm9kZS5vLmxlbmd0aCA+IDBcclxuICAgICkge1xyXG4gICAgICAgIGxldCBvOiBJUmVuZGVyT3V0bGluZU5vZGU7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHJhd05vZGUubykge1xyXG5cclxuICAgICAgICAgICAgbyA9IGxvYWROb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBub2RlLm8ucHVzaChvKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbn07XHJcblxyXG5jb25zdCBsb2FkQ2hhcnRzID0gKFxyXG4gICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICByYXdPdXRsaW5lQ2hhcnRzOiBBcnJheTxhbnk+XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIG91dGxpbmUuYyA9IFtdO1xyXG4gICAgbGV0IGM6IElSZW5kZXJPdXRsaW5lQ2hhcnQ7XHJcblxyXG4gICAgZm9yIChjb25zdCBjaGFydCBvZiByYXdPdXRsaW5lQ2hhcnRzKSB7XHJcblxyXG4gICAgICAgIGMgPSBuZXcgUmVuZGVyT3V0bGluZUNoYXJ0KCk7XHJcbiAgICAgICAgYy5pID0gY2hhcnQuaTtcclxuICAgICAgICBjLmIgPSBjaGFydC5iO1xyXG4gICAgICAgIGMucCA9IGNoYXJ0LnA7XHJcbiAgICAgICAgb3V0bGluZS5jLnB1c2goYyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnT3V0bGluZUNvZGUgPSB7XHJcblxyXG4gICAgcmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHVybDogc3RyaW5nXHJcbiAgICApOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmVVcmxzW3VybF0gPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUub3V0bGluZVVybHNbdXJsXSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEd1aWRlT3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmdcclxuICAgICk6IElSZW5kZXJPdXRsaW5lID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGlzcGxheUd1aWRlIHdhcyBudWxsLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZ3VpZGUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU7XHJcbiAgICAgICAgY29uc3QgcmF3T3V0bGluZSA9IG91dGxpbmVSZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgZ3VpZGVPdXRsaW5lID0gZ091dGxpbmVDb2RlLmdldEd1aWRlT3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIGd1aWRlT3V0bGluZSxcclxuICAgICAgICAgICAgZ3VpZGUubGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ3VpZGUub3V0bGluZSA9IGd1aWRlT3V0bGluZTtcclxuICAgICAgICBndWlkZU91dGxpbmUuci5pc0NoYXJ0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBzZWdtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHJvb3RTZWdtZW50LnN0YXJ0LmtleSA9IGd1aWRlT3V0bGluZS5yLmk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGd1aWRlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGd1aWRlT3V0bGluZS5yLmMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBMb2FkIG91dGxpbmUgZnJvbSB0aGF0IGxvY2F0aW9uIGFuZCBsb2FkIHJvb3RcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmVDaGFydDogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgICAgICAgICAgZ3VpZGVPdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgZ3VpZGVPdXRsaW5lLnIuY1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZ3VpZGVSb290ID0gZ3VpZGUucm9vdDtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ3VpZGVSb290KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY3VycmVudCBmcmFnbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUZyb21DaGFydF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVDaGFydCxcclxuICAgICAgICAgICAgICAgIGd1aWRlUm9vdFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChndWlkZS5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmV4cGFuZE9wdGlvblBvZHMoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGd1aWRlLnJvb3RcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBndWlkZS5yb290XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ3VpZGVPdXRsaW5lO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRPdXRsaW5lQ2hhcnQ6IChcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBpbmRleDogbnVtYmVyXHJcbiAgICApOiBJUmVuZGVyT3V0bGluZUNoYXJ0IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lLmMubGVuZ3RoID4gaW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRsaW5lLmNbaW5kZXhdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkRGlzcGxheUNoYXJ0RnJvbVJhd091dGxpbmU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHJhd091dGxpbmU6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElEaXNwbGF5Q2hhcnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rID0gbmV3IERpc3BsYXlDaGFydChcclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSksXHJcbiAgICAgICAgICAgIGNoYXJ0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIGxpbmsubGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGluay5vdXRsaW5lID0gb3V0bGluZTtcclxuICAgICAgICBsaW5rLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICBwYXJlbnQubGluayA9IGxpbms7XHJcblxyXG4gICAgICAgIHJldHVybiBsaW5rO1xyXG4gICAgfSxcclxuXHJcbiAgICBidWlsZFBvZERpc3BsYXlDaGFydEZyb21SYXdPdXRsaW5lOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICByYXdPdXRsaW5lOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiBJRGlzcGxheUNoYXJ0ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcG9kID0gbmV3IERpc3BsYXlDaGFydChcclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSksXHJcbiAgICAgICAgICAgIGNoYXJ0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIHBvZC5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBwb2Qub3V0bGluZSA9IG91dGxpbmU7XHJcbiAgICAgICAgcG9kLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICBwYXJlbnQucG9kID0gcG9kO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9kO1xyXG4gICAgfSxcclxuXHJcbiAgICBidWlsZERpc3BsYXlDaGFydEZyb21PdXRsaW5lRm9yTmV3TGluazogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiBJRGlzcGxheUNoYXJ0ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgbGluayA9IG5ldyBEaXNwbGF5Q2hhcnQoXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpLFxyXG4gICAgICAgICAgICBjaGFydFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkT3V0bGluZVByb3BlcnRpZXNGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgbGluay5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsaW5rLm91dGxpbmUgPSBvdXRsaW5lO1xyXG4gICAgICAgIGxpbmsucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIHBhcmVudC5saW5rID0gbGluaztcclxuXHJcbiAgICAgICAgcmV0dXJuIGxpbms7XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdQb2Q6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSURpc3BsYXlDaGFydCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBvZCA9IG5ldyBEaXNwbGF5Q2hhcnQoXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpLFxyXG4gICAgICAgICAgICBjaGFydFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkT3V0bGluZVByb3BlcnRpZXNGb3JOZXdQb2QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBwb2QubGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcG9kLm91dGxpbmUgPSBvdXRsaW5lO1xyXG4gICAgICAgIHBvZC5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgcGFyZW50LnBvZCA9IHBvZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBvZDtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlclxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBMaW5rIGFscmVhZHkgbG9hZGVkLCByb290SUQ6ICR7cGFyZW50Lmxpbmsucm9vdD8uaWR9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByYXdPdXRsaW5lID0gb3V0bGluZVJlc3BvbnNlLmpzb25EYXRhO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rID0gZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbVJhd091dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgcGFyZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWRMaW5rU2VnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnRJbmRleCxcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkQ2hhcnRPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudC5saW5rKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYExpbmsgYWxyZWFkeSBsb2FkZWQsIHJvb3RJRDogJHtwYXJlbnQubGluay5yb290Py5pZH1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhd091dGxpbmUgPSBvdXRsaW5lUmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBnT3V0bGluZUNvZGUuYnVpbGREaXNwbGF5Q2hhcnRGcm9tUmF3T3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBwYXJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNhY2hlU2VjdGlvblJvb3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gTmVlZCB0byBidWlsZCBhIGRpc3BsYXlDSGFydCBoZXJlXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5wb3N0R2V0Q2hhcnRPdXRsaW5lUm9vdF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFBvZE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLnBvZCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBMaW5rIGFscmVhZHkgbG9hZGVkLCByb290SUQ6ICR7b3B0aW9uLnBvZC5yb290Py5pZH1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhd091dGxpbmUgPSBvdXRsaW5lUmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IHBvZCA9IGdPdXRsaW5lQ29kZS5idWlsZFBvZERpc3BsYXlDaGFydEZyb21SYXdPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHBvZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIC8vIE5lZWQgdG8gYnVpbGQgYSBkaXNwbGF5Q0hhcnQgaGVyZVxyXG4gICAgICAgIC8vIGdPdXRsaW5lQ29kZS5zZXRDaGFydEFzQ3VycmVudChcclxuICAgICAgICAvLyAgICAgc3RhdGUsXHJcbiAgICAgICAgLy8gICAgIGxpbmtcclxuICAgICAgICAvLyApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUucG9zdEdldFBvZE91dGxpbmVSb290X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHBvZFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBvc3RHZXRDaGFydE91dGxpbmVSb290X3N1YnNjcmlwdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHNlY3Rpb24ucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgKCFzZWN0aW9uLnJvb3QudWkuZGlzY3Vzc2lvbkxvYWRlZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gICAgIHRocm93IG5ldyBFcnJvcignU2VjdGlvbiByb290IGRpc2N1c3Npb24gd2FzIG5vdCBsb2FkZWQnKTtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZSA9IHNlY3Rpb24ub3V0bGluZTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY3Rpb24gb3V0bGluZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgcm9vdEZyYWdtZW5JRCA9IG91dGxpbmUuci5pO1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSBvdXRsaW5lLnBhdGg7XHJcbiAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtwYXRofS8ke3Jvb3RGcmFnbWVuSUR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbiA9IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5sb2FkUm9vdEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgc2VjdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGBsb2FkQ2hhcnRPdXRsaW5lUm9vdGAsXHJcbiAgICAgICAgICAgIFBhcnNlVHlwZS5UZXh0LFxyXG4gICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIGxvYWRBY3Rpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBwb3N0R2V0UG9kT3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc2VjdGlvbi5yb290KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAoIXNlY3Rpb24ucm9vdC51aS5kaXNjdXNzaW9uTG9hZGVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWN0aW9uIHJvb3QgZGlzY3Vzc2lvbiB3YXMgbm90IGxvYWRlZCcpO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lID0gc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2VjdGlvbiBvdXRsaW5lIHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb290RnJhZ21lbklEID0gb3V0bGluZS5yLmk7XHJcbiAgICAgICAgY29uc3QgcGF0aCA9IG91dGxpbmUucGF0aDtcclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3BhdGh9LyR7cm9vdEZyYWdtZW5JRH0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRQb2RSb290RnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgc2VjdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGBsb2FkQ2hhcnRPdXRsaW5lUm9vdGAsXHJcbiAgICAgICAgICAgIFBhcnNlVHlwZS5UZXh0LFxyXG4gICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIGxvYWRBY3Rpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDaGFydEFzQ3VycmVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZGlzcGxheVNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmN1cnJlbnRTZWN0aW9uID0gZGlzcGxheVNlY3Rpb247XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEd1aWRlT3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZ1xyXG4gICAgKTogSVJlbmRlck91dGxpbmUgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0bGluZTogSVJlbmRlck91dGxpbmUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lc1tmcmFnbWVudEZvbGRlclVybF07XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dGxpbmUgPSBuZXcgUmVuZGVyT3V0bGluZShcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmwsXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJhc2VVUklcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lc1tmcmFnbWVudEZvbGRlclVybF0gPSBvdXRsaW5lO1xyXG5cclxuICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0T3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBsaW5rRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVJlbmRlck91dGxpbmUgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0bGluZTogSVJlbmRlck91dGxpbmUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lc1tmcmFnbWVudEZvbGRlclVybF07XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBiYXNlVVJJOiBzdHJpbmcgfCBudWxsID0gY2hhcnQuYjtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGJhc2VVUkkpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBiYXNlVVJJID0gbGlua0ZyYWdtZW50LnNlY3Rpb24ub3V0bGluZT8uYmFzZVVSSSA/PyBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFiYXNlVVJJKSB7XHJcblxyXG4gICAgICAgICAgICBiYXNlVVJJID0gZG9jdW1lbnQuYmFzZVVSSTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dGxpbmUgPSBuZXcgUmVuZGVyT3V0bGluZShcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmwsXHJcbiAgICAgICAgICAgIGJhc2VVUkkhXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUub3V0bGluZXNbZnJhZ21lbnRGb2xkZXJVcmxdID0gb3V0bGluZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmU7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGdldEZyYWdtZW50TGlua0NoYXJ0T3V0bGluZTogKFxyXG4gICAgLy8gICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAvLyAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgLy8gKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IG91dGxpbmUgPSBmcmFnbWVudC5zZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgLy8gICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAvLyAgICAgfVxyXG5cclxuICAgIC8vICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgIC8vICAgICAgICAgZnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAvLyAgICAgICAgIGZyYWdtZW50LmlkXHJcbiAgICAvLyAgICAgKTtcclxuXHJcbiAgICAvLyAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGwpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgY29uc3Qgb3V0bGluZUNoYXJ0ID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVDaGFydChcclxuICAgIC8vICAgICAgICAgb3V0bGluZSxcclxuICAgIC8vICAgICAgICAgb3V0bGluZU5vZGU/LmNcclxuICAgIC8vICAgICApO1xyXG5cclxuICAgIC8vICAgICBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUZyb21DaGFydF9zdWJzY3JpcHRpb24oXHJcbiAgICAvLyAgICAgICAgIHN0YXRlLFxyXG4gICAgLy8gICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAvLyAgICAgICAgIGZyYWdtZW50XHJcbiAgICAvLyAgICAgKTtcclxuICAgIC8vIH0sXHJcblxyXG4gICAgZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBvcHRpb24uc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbi5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgb3B0aW9uLmlkXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGxcclxuICAgICAgICAgICAgfHwgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUgLy8gV2lsbCBsb2FkIGl0IGZyb20gYSBzZWdtZW50XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlPy5jXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRQb2RPdXRsaW5lX3N1YnNjcmlwaW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG9wdGlvbi5wb2RLZXkpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBzZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBvcHRpb24uaWRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGU/LmQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnQgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZT8uZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lRnJvbVBvZF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFNlZ21lbnRPdXRsaW5lX3N1YnNjcmlwdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsLFxyXG4gICAgICAgIGxpbmtGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFjaGFydCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPdXRsaW5lQ2hhcnQgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaW5rRnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExpbmsgcm9vdCBhbHJlYWR5IGxvYWRlZDogJHtsaW5rRnJhZ21lbnQubGluay5yb290Py5pZH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXh0U2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4O1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnRJbmRleCAhPSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudEluZGV4Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybCA9IGdSZW5kZXJDb2RlLmdldEZyYWdtZW50Rm9sZGVyVXJsKFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmUgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmwsXHJcbiAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmUubG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFsaW5rRnJhZ21lbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5rID0gZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdTZWdtZW50Q29kZS5zZXROZXh0U2VnbWVudFNlY3Rpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0U2VnbWVudEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LmxpbmsgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtnRmlsZUNvbnN0YW50cy5ndWlkZU91dGxpbmVGaWxlbmFtZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRSZXF1ZXN0ZWQgPSBnT3V0bGluZUNvZGUucmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsb2FkUmVxdWVzdGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYWluQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ091dGxpbmVBY3Rpb25zLmxvYWRTZWdtZW50Q2hhcnRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRJbmRleFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwsXHJcbiAgICAgICAgbGlua0ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWNoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ091dGxpbmVDaGFydCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpbmtGcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTGluayByb290IGFscmVhZHkgbG9hZGVkOiAke2xpbmtGcmFnbWVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmc7XHJcbiAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0UGF0aCA9IGNoYXJ0LnA7XHJcblxyXG4gICAgICAgIGlmICghY2hhcnQuaSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSXMgYSByZW1vdGUgZ3VpZGVcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmwgPSBvdXRsaW5lQ2hhcnRQYXRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElzIGEgbWFwXHJcbiAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsID0gZ1JlbmRlckNvZGUuZ2V0RnJhZ21lbnRGb2xkZXJVcmwoXHJcbiAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmUgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmwsXHJcbiAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmUubG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFsaW5rRnJhZ21lbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuYnVpbGREaXNwbGF5Q2hhcnRGcm9tT3V0bGluZUZvck5ld0xpbmsoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LmxpbmsgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5wb3N0R2V0Q2hhcnRPdXRsaW5lUm9vdF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LmxpbmsgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtnRmlsZUNvbnN0YW50cy5ndWlkZU91dGxpbmVGaWxlbmFtZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRSZXF1ZXN0ZWQgPSBnT3V0bGluZUNvZGUucmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsb2FkUmVxdWVzdGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYWluQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ091dGxpbmVBY3Rpb25zLmxvYWRDaGFydE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgUGFyc2VUeXBlLkpzb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0T3V0bGluZUZyb21Qb2Rfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwsXHJcbiAgICAgICAgb3B0aW9uRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghY2hhcnQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3V0bGluZUNoYXJ0IHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9uRnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExpbmsgcm9vdCBhbHJlYWR5IGxvYWRlZDogJHtvcHRpb25GcmFnbWVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmwgPSBnUmVuZGVyQ29kZS5nZXRGcmFnbWVudEZvbGRlclVybChcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIG9wdGlvbkZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybCxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIG9wdGlvbkZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmUubG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbkZyYWdtZW50LnBvZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5idWlsZERpc3BsYXlDaGFydEZyb21PdXRsaW5lRm9yTmV3UG9kKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uRnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5wb3N0R2V0UG9kT3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25GcmFnbWVudC5wb2QgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke2dGaWxlQ29uc3RhbnRzLmd1aWRlT3V0bGluZUZpbGVuYW1lfWA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBsb2FkUmVxdWVzdGVkID0gZ091dGxpbmVDb2RlLnJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICB1cmxcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2FkUmVxdWVzdGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFpbkNoYXJ0T3V0bGluZUZpbGVgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA9IGBsb2FkQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdPdXRsaW5lQWN0aW9ucy5sb2FkUG9kT3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uRnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLkFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICBQYXJzZVR5cGUuSnNvbixcclxuICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgbG9hZE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByYXdPdXRsaW5lOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXJcclxuICAgICk6IElSZW5kZXJPdXRsaW5lID0+IHtcclxuXHJcbiAgICAgICAgb3V0bGluZS52ID0gcmF3T3V0bGluZS52O1xyXG5cclxuICAgICAgICBpZiAocmF3T3V0bGluZS5jXHJcbiAgICAgICAgICAgICYmIEFycmF5LmlzQXJyYXkocmF3T3V0bGluZS5jKSA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAmJiByYXdPdXRsaW5lLmMubGVuZ3RoID4gMFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBsb2FkQ2hhcnRzKFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgIHJhd091dGxpbmUuY1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJhd091dGxpbmUuZSkge1xyXG5cclxuICAgICAgICAgICAgb3V0bGluZS5lID0gcmF3T3V0bGluZS5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3V0bGluZS5yID0gbG9hZE5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLnIsXHJcbiAgICAgICAgICAgIGxpbmtJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG91dGxpbmUubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBvdXRsaW5lLnIuaXNSb290ID0gdHJ1ZTtcclxuICAgICAgICBvdXRsaW5lLm12ID0gcmF3T3V0bGluZS5tdjtcclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmU7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRPdXRsaW5lUHJvcGVydGllc0Zvck5ld0xpbms6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3TGluayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmUucixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZE91dGxpbmVQcm9wZXJ0aWVzRm9yTmV3UG9kOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBsaW5rSUQ6IG51bWJlclxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNhY2hlTm9kZUZvck5ld1BvZChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmUucixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdPdXRsaW5lQ29kZTtcclxuXHJcbiIsIlxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG4vLyBpbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuLi9odHRwL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5cclxuXHJcbmNvbnN0IGdldEZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgIGZyYWdtZW50UGF0aDogc3RyaW5nLFxyXG4gICAgX2FjdGlvbjogQWN0aW9uVHlwZSxcclxuICAgIGxvYWRBY3Rpb246IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhbGxJRDogc3RyaW5nID0gVS5nZW5lcmF0ZUd1aWQoKTtcclxuXHJcbiAgICAvLyBsZXQgaGVhZGVycyA9IGdBamF4SGVhZGVyQ29kZS5idWlsZEhlYWRlcnMoXHJcbiAgICAvLyAgICAgc3RhdGUsXHJcbiAgICAvLyAgICAgY2FsbElELFxyXG4gICAgLy8gICAgIGFjdGlvblxyXG4gICAgLy8gKTtcclxuXHJcbiAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke2ZyYWdtZW50UGF0aH1gO1xyXG5cclxuICAgIHJldHVybiBnQXV0aGVudGljYXRlZEh0dHAoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIHBhcnNlVHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIC8vIGhlYWRlcnM6IGhlYWRlcnMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogJ3RleHQnLFxyXG4gICAgICAgIGFjdGlvbjogbG9hZEFjdGlvbixcclxuICAgICAgICBlcnJvcjogKHN0YXRlOiBJU3RhdGUsIGVycm9yRGV0YWlsczogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgZ2V0dGluZyBmcmFnbWVudCBmcm9tIHRoZSBzZXJ2ZXIsIHBhdGg6ICR7ZnJhZ21lbnRQYXRofSwgaWQ6ICR7ZnJhZ21lbnRJRH1cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRGcmFnbWVudH0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBnZXR0aW5nIGZyYWdtZW50IGZyb20gdGhlIHNlcnZlciwgcGF0aDogJHtmcmFnbWVudFBhdGh9LCBpZDogJHtmcmFnbWVudElEfVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dldEZyYWdtZW50Lm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgZ0ZyYWdtZW50RWZmZWN0cyA9IHtcclxuXHJcbiAgICBnZXRGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgZnJhZ21lbnRQYXRoOiBzdHJpbmdcclxuICAgICk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZSA9IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGdGcmFnbWVudEFjdGlvbnMubG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgbmV3U3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3U3RhdGU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLmlkLFxyXG4gICAgICAgICAgICBmcmFnbWVudFBhdGgsXHJcbiAgICAgICAgICAgIEFjdGlvblR5cGUuR2V0RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGxvYWRBY3Rpb25cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZyYWdtZW50RWZmZWN0cztcclxuIiwiaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgSUNoYWluU2VnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi4vY29kZS9nT3V0bGluZUNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi4vY29kZS9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50RWZmZWN0cyBmcm9tIFwiLi4vZWZmZWN0cy9nRnJhZ21lbnRFZmZlY3RzXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5jb25zdCBnZXRGcmFnbWVudEZpbGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIHN0YXRlLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaGlkZUJhbm5lciA9IHRydWU7XHJcbiAgICBjb25zdCBmcmFnbWVudFBhdGggPSBgJHtvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aH0vJHtvcHRpb24uaWR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGdGcmFnbWVudEVmZmVjdHMuZ2V0RnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgIGZyYWdtZW50UGF0aFxyXG4gICAgICAgIClcclxuICAgIF07XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzQ2hhaW5GcmFnbWVudFR5cGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbFxyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGlkIGFuZCBvdXRsaW5lIGZyYWdtZW50IGlkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGUudHlwZSA9PT0gT3V0bGluZVR5cGUuTGluaykge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0xpbmsoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG91dGxpbmVOb2RlLnR5cGUgPT09IE91dGxpbmVUeXBlLkV4aXQpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NFeGl0KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS5pc0NoYXJ0ID09PSB0cnVlXHJcbiAgICAgICAgICAgICYmIG91dGxpbmVOb2RlLmlzUm9vdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0NoYXJ0Um9vdChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG91dGxpbmVOb2RlLmlzTGFzdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0xhc3QoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG91dGxpbmVOb2RlLnR5cGUgPT09IE91dGxpbmVUeXBlLk5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGZyYWdtZW50IHR5cGUuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JMYXN0RnJhZ21lbnRFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIGxhc3RcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjaGVja0Zvck5vZGVFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIG5vZGVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgbm9kZSAtIGxpbmsnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pRXhpdEtleSkpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBleGl0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjaGVja0ZvckNoYXJ0Um9vdEVycm9ycyA9IChcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSByb290XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIHJvb3QgLSBsaW5rJyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUV4aXRLZXkpKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSByb290IC0gZXhpdCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JFeGl0RXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBleGl0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IG91dCBzZWN0aW9uIHdhcyBudWxsIC0gZXhpdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIC0gZXhpdCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoc2VnbWVudC5lbmQudHlwZSAhPT0gT3V0bGluZVR5cGUuRXhpdCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgbm9kZSAtIGV4aXQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIG91dGxpbmUgbm9kZSBpZCBhbmQgZnJhZ21lbnQgaWQnKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NDaGFydFJvb3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JDaGFydFJvb3RFcnJvcnMoXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmxvYWROZXh0Q2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIHNldExpbmtzUm9vdChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0TGlua3NSb290ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IGluU2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudEluU2VjdGlvbjtcclxuXHJcbiAgICBpZiAoIWluU2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGluIHNlY3Rpb24gd2FzIG51bGwgLSBjaGFydCByb290XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG5cclxuICAgIGlmICghc2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBjaGFydCByb290XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGluU2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgc2VnbWVudC5zdGFydC5rZXlcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHBhcmVudD8ubGluaykge1xyXG5cclxuICAgICAgICBpZiAocGFyZW50LmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGFuZCBGcmFnbWVudCBhcmUgdGhlIHNhbWVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJlbnQubGluay5yb290ID0gZnJhZ21lbnQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50RnJhZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VjdGlvbi5jdXJyZW50ID0gZnJhZ21lbnQ7XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzTm9kZSA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JOb2RlRXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5sb2FkTmV4dENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBwcm9jZXNzRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzTGFzdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JMYXN0RnJhZ21lbnRFcnJvcnMoXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBwcm9jZXNzRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgZnJhZ21lbnQubGluayA9IG51bGw7XHJcbiAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG51bGw7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50Lm9wdGlvbnM/Lmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWlzKHN0YXRlKTtcclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NMaW5rID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIG91dGxpbmUgbm9kZSBpZCBhbmQgZnJhZ21lbnQgaWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdXRsaW5lID0gZnJhZ21lbnQuc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGU/LmMgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaXNSb290ID09PSB0cnVlXHJcbiAgICAgICAgJiYgb3V0bGluZU5vZGUuaXNDaGFydCA9PT0gdHJ1ZVxyXG4gICAgKSB7XHJcbiAgICAgICAgc2V0TGlua3NSb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgb3V0bGluZSxcclxuICAgICAgICBvdXRsaW5lTm9kZT8uY1xyXG4gICAgKTtcclxuXHJcbiAgICBnT3V0bGluZUNvZGUuZ2V0U2VnbWVudE91dGxpbmVfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVDaGFydCxcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50LmluZGV4XHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0V4aXQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBleGl0RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjaGVja0ZvckV4aXRFcnJvcnMoXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICBleGl0RnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgc2VjdGlvbjogSURpc3BsYXlDaGFydCA9IGV4aXRGcmFnbWVudC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICBjb25zdCBzZWN0aW9uUGFyZW50ID0gc2VjdGlvbi5wYXJlbnQ7XHJcblxyXG4gICAgaWYgKCFzZWN0aW9uUGFyZW50KSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIklEaXNwbGF5Q2hhcnQgcGFyZW50IGlzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaUV4aXRLZXkgPSBleGl0RnJhZ21lbnQuZXhpdEtleTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBzZWN0aW9uUGFyZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi5pRXhpdEtleSA9PT0gaUV4aXRLZXkpIHtcclxuXHJcbiAgICAgICAgICAgIGdTZWdtZW50Q29kZS5sb2FkRXhpdFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQuaW5kZXgsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24uaWRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuc2V0Q3VycmVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZXhpdEZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbG9hZEZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4pOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0+IHtcclxuXHJcbiAgICBjb25zdCBwYXJlbnRGcmFnbWVudElEID0gb3B0aW9uLnBhcmVudEZyYWdtZW50SUQgYXMgc3RyaW5nO1xyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShwYXJlbnRGcmFnbWVudElEKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgZnJhZ21lbnQgSUQgaXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZW5kZXJGcmFnbWVudCA9IGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2UudGV4dERhdGEsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICBvcHRpb24uaWQsXHJcbiAgICAgICAgb3B0aW9uLnNlY3Rpb25cclxuICAgICk7XHJcblxyXG4gICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiByZW5kZXJGcmFnbWVudDtcclxufTtcclxuXHJcbmNvbnN0IGxvYWRQb2RGcmFnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByZXNwb25zZTogYW55LFxyXG4gICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuKTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgY29uc3QgcGFyZW50RnJhZ21lbnRJRCA9IG9wdGlvbi5wYXJlbnRGcmFnbWVudElEIGFzIHN0cmluZztcclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UocGFyZW50RnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGZyYWdtZW50IElEIGlzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVuZGVyRnJhZ21lbnQgPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZFBvZEZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgb3B0aW9uLmlkLFxyXG4gICAgICAgIG9wdGlvbi5zZWN0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIHN0YXRlLmxvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gcmVuZGVyRnJhZ21lbnQ7XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzRnJhZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBleHBhbmRlZE9wdGlvbjogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgbGV0IHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBmcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICBmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghcGFyZW50RnJhZ21lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgcGFyZW50RnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgZXhwYW5kZWRPcHRpb24gPSBvcHRpb247XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV4cGFuZGVkT3B0aW9uKSB7XHJcblxyXG4gICAgICAgIGV4cGFuZGVkT3B0aW9uLnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zaG93T3B0aW9uTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHBhcmVudEZyYWdtZW50LFxyXG4gICAgICAgICAgICBleHBhbmRlZE9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnRnJhZ21lbnRBY3Rpb25zID0ge1xyXG5cclxuICAgIHNob3dBbmNpbGxhcnlOb2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAvLyBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGlmIChhbmNpbGxhcnkudWkuZGlzY3Vzc2lvbkxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAvLyAgICAgZ0ZyYWdtZW50Q29kZS5hdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb24oXHJcbiAgICAgICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgICAgICAvLyAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgIC8vICAgICApO1xyXG5cclxuICAgICAgICAvLyAgICAgaWYgKCFhbmNpbGxhcnkubGluaykge1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIGdPdXRsaW5lQ29kZS5nZXRGcmFnbWVudExpbmtDaGFydE91dGxpbmUoXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgLy8gICAgICAgICApO1xyXG4gICAgICAgIC8vICAgICB9XHJcblxyXG4gICAgICAgIC8vICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRGcmFnbWVudEZpbGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAvLyBmb3IgKGNvbnN0IGNoaWxkIG9mIHBhcmVudEZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgLy8gICAgIGNoaWxkLnVpLmRpc2N1c3Npb25Mb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJQYXJlbnRTZWN0aW9uU2VsZWN0ZWQocGFyZW50RnJhZ21lbnQuc2VjdGlvbik7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhck9ycGhhbmVkU3RlcHMocGFyZW50RnJhZ21lbnQpO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnByZXBhcmVUb1Nob3dPcHRpb25Ob2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gaWYgKG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIC8vICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAvLyAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgIC8vICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgLy8gICAgICk7XHJcblxyXG4gICAgICAgIC8vICAgICBpZiAoIW9wdGlvbi5saW5rKSB7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgZ091dGxpbmVDb2RlLmdldEZyYWdtZW50TGlua0NoYXJ0T3V0bGluZShcclxuICAgICAgICAvLyAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAvLyAgICAgICAgICAgICBvcHRpb25cclxuICAgICAgICAvLyAgICAgICAgICk7XHJcbiAgICAgICAgLy8gICAgIH1cclxuXHJcbiAgICAgICAgLy8gICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEZyYWdtZW50RmlsZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCBVLmlzTnVsbE9yV2hpdGVTcGFjZShvcHRpb24uaWQpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uVGV4dDogc3RyaW5nIHwgbnVsbCA9IG51bGxcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAobm9kZSkge1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9uVGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgIG5vZGUub3B0aW9uID0gb3B0aW9uVGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCkge1xyXG5cclxuICAgICAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFBvZEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBsb2FkUG9kRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuc2V0UG9kQ3VycmVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgbm9kZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvblRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlLm9wdGlvbiA9IG9wdGlvblRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQpIHtcclxuXHJcbiAgICAgICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRSb290RnJhZ21lbnRBbmRTZXRTZWxlY3RlZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lTm9kZUlEID0gc2VjdGlvbi5vdXRsaW5lPy5yLmk7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZU5vZGVJRCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVuZGVyRnJhZ21lbnQgPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UudGV4dERhdGEsXHJcbiAgICAgICAgICAgIFwicm9vdFwiLFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlELFxyXG4gICAgICAgICAgICBzZWN0aW9uLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLmxvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHJlbmRlckZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZW5kZXJGcmFnbWVudC5zZWN0aW9uLnJvb3QgPSByZW5kZXJGcmFnbWVudDtcclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuc2VjdGlvbi5jdXJyZW50ID0gcmVuZGVyRnJhZ21lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRQb2RSb290RnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGVJRCA9IHNlY3Rpb24ub3V0bGluZT8uci5pO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlSUQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlbmRlckZyYWdtZW50ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRQb2RGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgICAgICBcInJvb3RcIixcclxuICAgICAgICAgICAgb3V0bGluZU5vZGVJRCxcclxuICAgICAgICAgICAgc2VjdGlvbixcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChyZW5kZXJGcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuc2VjdGlvbi5yb290ID0gcmVuZGVyRnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LnNlY3Rpb24uY3VycmVudCA9IHJlbmRlckZyYWdtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkQ2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGVcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudFNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYXJlbnRGcmFnbWVudElEID0gb3V0bGluZU5vZGUucGFyZW50Py5pIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlLmlzUm9vdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFvdXRsaW5lTm9kZS5pc0NoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCA9IFwiZ3VpZGVSb290XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRGcmFnbWVudElEID0gXCJyb290XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UocGFyZW50RnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBmcmFnbWVudCBJRCBpcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiB7IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsIGNvbnRpbnVlTG9hZGluZzogYm9vbGVhbiB9ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudEJhc2UoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZS50ZXh0RGF0YSxcclxuICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUuaSxcclxuICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24sXHJcbiAgICAgICAgICAgIHNlZ21lbnQuaW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHJlc3VsdC5mcmFnbWVudDtcclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24uY3VycmVudCA9IGZyYWdtZW50O1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmVudEZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudEZyYWdtZW50LmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnRGcmFnbWVudCBhbmQgRnJhZ21lbnQgYXJlIHRoZSBzYW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50LnNlbGVjdGVkID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC51aS5zZWN0aW9uSW5kZXggPSBwYXJlbnRGcmFnbWVudC51aS5zZWN0aW9uSW5kZXggKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcHJvY2Vzc0NoYWluRnJhZ21lbnRUeXBlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRBY3Rpb25zO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuXHJcblxyXG5jb25zdCBnSG9va1JlZ2lzdHJ5Q29kZSA9IHtcclxuXHJcbiAgICBleGVjdXRlU3RlcEhvb2s6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHN0ZXA6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdy5Ib29rUmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93Lkhvb2tSZWdpc3RyeS5leGVjdXRlU3RlcEhvb2soXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzdGVwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdIb29rUmVnaXN0cnlDb2RlO1xyXG5cclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSURpc3BsYXlTZWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlTZWN0aW9uXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBJQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lDaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IFJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ0ZyYWdtZW50QWN0aW9uc1wiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnSGlzdG9yeUNvZGUgZnJvbSBcIi4vZ0hpc3RvcnlDb2RlXCI7XHJcbmltcG9ydCBnSG9va1JlZ2lzdHJ5Q29kZSBmcm9tIFwiLi9nSG9va1JlZ2lzdHJ5Q29kZVwiO1xyXG5pbXBvcnQgZ091dGxpbmVDb2RlIGZyb20gXCIuL2dPdXRsaW5lQ29kZVwiO1xyXG5pbXBvcnQgZ1NlZ21lbnRDb2RlIGZyb20gXCIuL2dTZWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi9nU3RhdGVDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVWYWx1ZSA9IChcclxuICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgIHZhcmlhYmxlVmFsdWVzOiBhbnksXHJcbiAgICB2YXJpYWJsZU5hbWU6IHN0cmluZ1xyXG4pOiBzdHJpbmcgfCBudWxsID0+IHtcclxuXHJcbiAgICBsZXQgdmFsdWUgPSB2YXJpYWJsZVZhbHVlc1t2YXJpYWJsZU5hbWVdO1xyXG5cclxuICAgIGlmICh2YWx1ZSkge1xyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3VycmVudFZhbHVlID0gc2VjdGlvbi5vdXRsaW5lPy5tdj8uW3ZhcmlhYmxlTmFtZV07XHJcblxyXG4gICAgaWYgKGN1cnJlbnRWYWx1ZSkge1xyXG5cclxuICAgICAgICB2YXJpYWJsZVZhbHVlc1t2YXJpYWJsZU5hbWVdID0gY3VycmVudFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFuY2VzdG9yVmFyaWFibGVWYWx1ZShcclxuICAgICAgICBzZWN0aW9uLFxyXG4gICAgICAgIHZhcmlhYmxlVmFsdWVzLFxyXG4gICAgICAgIHZhcmlhYmxlTmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXSA/PyBudWxsO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5jZXN0b3JWYXJpYWJsZVZhbHVlID0gKFxyXG4gICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uLFxyXG4gICAgdmFyaWFibGVWYWx1ZXM6IGFueSxcclxuICAgIHZhcmlhYmxlTmFtZTogc3RyaW5nXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IGNoYXJ0ID0gc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0O1xyXG4gICAgY29uc3QgcGFyZW50ID0gY2hhcnQucGFyZW50Py5zZWN0aW9uO1xyXG5cclxuICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcmVudFZhbHVlID0gcGFyZW50Lm91dGxpbmU/Lm12Py5bdmFyaWFibGVOYW1lXTtcclxuXHJcbiAgICBpZiAocGFyZW50VmFsdWUpIHtcclxuXHJcbiAgICAgICAgdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXSA9IHBhcmVudFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFuY2VzdG9yVmFyaWFibGVWYWx1ZShcclxuICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgdmFyaWFibGVWYWx1ZXMsXHJcbiAgICAgICAgdmFyaWFibGVOYW1lXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JWYXJpYWJsZXMgPSAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gZnJhZ21lbnQudmFsdWU7XHJcbiAgICBjb25zdCB2YXJpYWJsZVJlZlBhdHRlcm4gPSAv44CIwqbigLkoPzx2YXJpYWJsZU5hbWU+W17igLrCpl0rKeKAusKm44CJL2dtdTtcclxuICAgIGNvbnN0IG1hdGNoZXMgPSB2YWx1ZS5tYXRjaEFsbCh2YXJpYWJsZVJlZlBhdHRlcm4pO1xyXG4gICAgbGV0IHZhcmlhYmxlTmFtZTogc3RyaW5nO1xyXG4gICAgbGV0IHZhcmlhYmxlVmFsdWVzOiBhbnkgPSB7fTtcclxuICAgIGxldCByZXN1bHQgPSAnJztcclxuICAgIGxldCBtYXJrZXIgPSAwO1xyXG5cclxuICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgbWF0Y2hlcykge1xyXG5cclxuICAgICAgICBpZiAobWF0Y2hcclxuICAgICAgICAgICAgJiYgbWF0Y2guZ3JvdXBzXHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBlcWVxZXFcclxuICAgICAgICAgICAgJiYgbWF0Y2guaW5kZXggIT0gbnVsbFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB2YXJpYWJsZU5hbWUgPSBtYXRjaC5ncm91cHMudmFyaWFibGVOYW1lO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdmFyaWFibGVWYWx1ZSA9IGdldFZhcmlhYmxlVmFsdWUoXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdmFyaWFibGVWYWx1ZXMsXHJcbiAgICAgICAgICAgICAgICB2YXJpYWJsZU5hbWVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFyaWFibGVWYWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVmFyaWFibGU6ICR7dmFyaWFibGVOYW1lfSBjb3VsZCBub3QgYmUgZm91bmRgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICtcclxuICAgICAgICAgICAgICAgIHZhbHVlLnN1YnN0cmluZyhtYXJrZXIsIG1hdGNoLmluZGV4KSArXHJcbiAgICAgICAgICAgICAgICB2YXJpYWJsZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgbWFya2VyID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdCArXHJcbiAgICAgICAgdmFsdWUuc3Vic3RyaW5nKG1hcmtlciwgdmFsdWUubGVuZ3RoKTtcclxuXHJcbiAgICBmcmFnbWVudC52YWx1ZSA9IHJlc3VsdDtcclxufTtcclxuXHJcbmNvbnN0IGNsZWFyU2libGluZ0NoYWlucyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBwYXJlbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLmlkICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgY2xlYXJGcmFnbWVudENoYWlucyhvcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNsZWFyRnJhZ21lbnRDaGFpbnMgPSAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQpOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyRnJhZ21lbnRDaGFpbnMoZnJhZ21lbnQubGluaz8ucm9vdCk7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBjbGVhckZyYWdtZW50Q2hhaW5zKG9wdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnJhZ21lbnQuc2VsZWN0ZWQgPSBudWxsO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Lmxpbmsucm9vdC5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBsb2FkT3B0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJhd09wdGlvbjogYW55LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwsXHJcbiAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGxcclxuKTogSVJlbmRlckZyYWdtZW50ID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb24gPSBuZXcgUmVuZGVyRnJhZ21lbnQoXHJcbiAgICAgICAgcmF3T3B0aW9uLmlkLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgc2VjdGlvbixcclxuICAgICAgICBzZWdtZW50SW5kZXhcclxuICAgICk7XHJcblxyXG4gICAgb3B0aW9uLm9wdGlvbiA9IHJhd09wdGlvbi5vcHRpb24gPz8gJyc7XHJcbiAgICBvcHRpb24uaXNBbmNpbGxhcnkgPSByYXdPcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWU7XHJcbiAgICBvcHRpb24ub3JkZXIgPSByYXdPcHRpb24ub3JkZXIgPz8gMDtcclxuICAgIG9wdGlvbi5pRXhpdEtleSA9IHJhd09wdGlvbi5pRXhpdEtleSA/PyAnJztcclxuICAgIG9wdGlvbi5hdXRvTWVyZ2VFeGl0ID0gcmF3T3B0aW9uLmF1dG9NZXJnZUV4aXQgPT09IHRydWU7XHJcbiAgICBvcHRpb24ucG9kS2V5ID0gcmF3T3B0aW9uLnBvZEtleSA/PyAnJztcclxuICAgIG9wdGlvbi5wb2RUZXh0ID0gcmF3T3B0aW9uLnBvZFRleHQgPz8gJyc7XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3V0bGluZU9wdGlvbiBvZiBvdXRsaW5lTm9kZS5vKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAob3V0bGluZU9wdGlvbi5pID09PSBvcHRpb24uaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmVPcHRpb25cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ1N0YXRlQ29kZS5jYWNoZV9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIG9wdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBnT3V0bGluZUNvZGUuZ2V0UG9kT3V0bGluZV9zdWJzY3JpcGlvbihcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgc2VjdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gb3B0aW9uO1xyXG59O1xyXG5cclxuY29uc3Qgc2hvd1BsdWdfc3Vic2NyaXB0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGV4aXQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvblRleHQ6IHN0cmluZ1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBzZWN0aW9uOiBJRGlzcGxheUNoYXJ0ID0gZXhpdC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICBjb25zdCBwYXJlbnQgPSBzZWN0aW9uLnBhcmVudDtcclxuXHJcbiAgICBpZiAoIXBhcmVudCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJRGlzcGxheUNoYXJ0IHBhcmVudCBpcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlFeGl0S2V5ID0gZXhpdC5leGl0S2V5O1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHBhcmVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24uaUV4aXRLZXkgPT09IGlFeGl0S2V5KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2hvd09wdGlvbk5vZGVfc3Vic2NyaXB0b24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIG9wdGlvblRleHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBzaG93T3B0aW9uTm9kZV9zdWJzY3JpcHRvbiA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghb3B0aW9uXHJcbiAgICAgICAgfHwgIW9wdGlvbi5zZWN0aW9uPy5vdXRsaW5lPy5wYXRoXHJcbiAgICApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5wcmVwYXJlVG9TaG93T3B0aW9uTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb25cclxuICAgICk7XHJcblxyXG4gICAgLy8gaWYgKG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIHJldHVybiBnRnJhZ21lbnRDb2RlLmdldEZyYWdtZW50QW5kTGlua091dGxpbmVfc3Vic2NyaXBpb24oXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgIG9wdGlvblRleHQsXHJcbiAgICApO1xyXG59O1xyXG5cclxuLy8gY29uc3Qgc2hvd1BvZE9wdGlvbk5vZGVfc3Vic2NyaXB0b24gPSAoXHJcbi8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4vLyAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbi8vICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbFxyXG4vLyApOiB2b2lkID0+IHtcclxuXHJcbi8vICAgICBpZiAoIW9wdGlvblxyXG4vLyAgICAgICAgIHx8ICFvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aFxyXG4vLyAgICAgKSB7XHJcbi8vICAgICAgICAgcmV0dXJuO1xyXG4vLyAgICAgfVxyXG5cclxuLy8gICAgIGdGcmFnbWVudENvZGUucHJlcGFyZVRvU2hvd1BvZE9wdGlvbk5vZGUoXHJcbi8vICAgICAgICAgc3RhdGUsXHJcbi8vICAgICAgICAgb3B0aW9uXHJcbi8vICAgICApO1xyXG5cclxuLy8gICAgIHJldHVybiBnRnJhZ21lbnRDb2RlLmdldFBvZEZyYWdtZW50X3N1YnNjcmlwaW9uKFxyXG4vLyAgICAgICAgIHN0YXRlLFxyXG4vLyAgICAgICAgIG9wdGlvbixcclxuLy8gICAgICAgICBvcHRpb25UZXh0LFxyXG4vLyAgICAgKTtcclxuLy8gfTtcclxuXHJcbmNvbnN0IGxvYWROZXh0RnJhZ21lbnRJblNlZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBuZXh0T3V0bGluZU5vZGUgPSBnU2VnbWVudENvZGUuZ2V0TmV4dFNlZ21lbnRPdXRsaW5lTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGlmICghbmV4dE91dGxpbmVOb2RlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbj8ub3V0bGluZT8ucGF0aDtcclxuICAgIGNvbnN0IHVybCA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke25leHRPdXRsaW5lTm9kZS5pfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgIG5leHRPdXRsaW5lTm9kZVxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBgbG9hZENoYWluRnJhZ21lbnRgLFxyXG4gICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgIHVybCxcclxuICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnRnJhZ21lbnRDb2RlID0ge1xyXG5cclxuICAgIGxvYWROZXh0Q2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc2VnbWVudC5vdXRsaW5lTm9kZXMubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgbG9hZE5leHRGcmFnbWVudEluU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdTZWdtZW50Q29kZS5sb2FkTmV4dFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoYXNPcHRpb246IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbklEOiBzdHJpbmdcclxuICAgICk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBmcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9uLmlkID09PSBvcHRpb25JRCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrU2VsZWN0ZWQ6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQuc2VsZWN0ZWQ/LmlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ0ZyYWdtZW50Q29kZS5oYXNPcHRpb24oZnJhZ21lbnQsIGZyYWdtZW50LnNlbGVjdGVkPy5pZCkpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlbGVjdGVkIGhhcyBiZWVuIHNldCB0byBmcmFnbWVudCB0aGF0IGlzbid0IGFuIG9wdGlvblwiKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyUGFyZW50U2VjdGlvblNlbGVjdGVkOiAoZGlzcGxheUNoYXJ0OiBJRGlzcGxheVNlY3Rpb24pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gKGRpc3BsYXlDaGFydCBhcyBJRGlzcGxheUNoYXJ0KS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJQYXJlbnRTZWN0aW9uT3JwaGFuZWRTdGVwcyhwYXJlbnQpO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJQYXJlbnRTZWN0aW9uU2VsZWN0ZWQocGFyZW50LnNlY3Rpb24gYXMgSURpc3BsYXlDaGFydCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyUGFyZW50U2VjdGlvbk9ycGhhbmVkU3RlcHM6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJPcnBoYW5lZFN0ZXBzKGZyYWdtZW50LnNlbGVjdGVkKTtcclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyT3JwaGFuZWRTdGVwczogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhck9ycGhhbmVkU3RlcHMoZnJhZ21lbnQubGluaz8ucm9vdCk7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhck9ycGhhbmVkU3RlcHMoZnJhZ21lbnQuc2VsZWN0ZWQpO1xyXG5cclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgZnJhZ21lbnQubGluayA9IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyYWdtZW50QW5kTGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsLFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIC8vIGlmIChvcHRpb24udWkuZGlzY3Vzc2lvbkxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAvLyAgICAgdGhyb3cgbmV3IEVycm9yKCdEaXNjdXNzaW9uIHdhcyBhbHJlYWR5IGxvYWRlZCcpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaGlkZUJhbm5lciA9IHRydWU7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5nZXRMaW5rT3V0bGluZV9zdWJzY3JpcGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke29wdGlvbi5zZWN0aW9uPy5vdXRsaW5lPy5wYXRofS8ke29wdGlvbi5pZH0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkgPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uVGV4dFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGBsb2FkRnJhZ21lbnRGaWxlYCxcclxuICAgICAgICAgICAgUGFyc2VUeXBlLlRleHQsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFBvZEZyYWdtZW50X3N1YnNjcmlwaW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5oaWRlQmFubmVyID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aH0vJHtvcHRpb24uaWR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5ID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRQb2RGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25UZXh0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYGxvYWRGcmFnbWVudEZpbGVgLFxyXG4gICAgICAgICAgICBQYXJzZVR5cGUuVGV4dCxcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBsb2FkQWN0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgIC8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgLy8gICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgLy8gKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IG91dGxpbmUgPSBvcHRpb24uc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgIC8vICAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgIC8vICAgICAgICAgc3RhdGUsXHJcbiAgICAvLyAgICAgICAgIG9wdGlvbi5zZWN0aW9uLmxpbmtJRCxcclxuICAgIC8vICAgICAgICAgb3B0aW9uLmlkXHJcbiAgICAvLyAgICAgKTtcclxuXHJcbiAgICAvLyAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGxcclxuICAgIC8vICAgICAgICAgfHwgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUgLy8gV2lsbCBsb2FkIGl0IGZyb20gYSBzZWdtZW50XHJcbiAgICAvLyAgICAgKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybjtcclxuICAgIC8vICAgICB9XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAvLyAgICAgICAgIG91dGxpbmUsXHJcbiAgICAvLyAgICAgICAgIG91dGxpbmVOb2RlPy5jXHJcbiAgICAvLyAgICAgKTtcclxuXHJcbiAgICAvLyAgICAgZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uKFxyXG4gICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgIC8vICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgLy8gICAgICAgICBvcHRpb25cclxuICAgIC8vICAgICApO1xyXG4gICAgLy8gfSxcclxuXHJcbiAgICBnZXRMaW5rRWxlbWVudElEOiAoZnJhZ21lbnRJRDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGBudF9sa19mcmFnXyR7ZnJhZ21lbnRJRH1gO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmFnbWVudEVsZW1lbnRJRDogKGZyYWdtZW50SUQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgbnRfZnJfZnJhZ18ke2ZyYWdtZW50SUR9YDtcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGFyZVRvU2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5tYXJrT3B0aW9uc0V4cGFuZGVkKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0hpc3RvcnlDb2RlLnB1c2hCcm93c2VySGlzdG9yeVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGFyZVRvU2hvd1BvZE9wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5tYXJrT3B0aW9uc0V4cGFuZGVkKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRQb2RDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVOb2RlSUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQ6IHsgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCwgY29udGludWVMb2FkaW5nOiBib29sZWFuIH0gPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlELFxyXG4gICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSByZXN1bHQuZnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQuY29udGludWVMb2FkaW5nID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZyYWdtZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkUG9kRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVOb2RlSUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQ6IHsgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCwgY29udGludWVMb2FkaW5nOiBib29sZWFuIH0gPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlELFxyXG4gICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSByZXN1bHQuZnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQuY29udGludWVMb2FkaW5nID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICAgICAgb3V0bGluZU5vZGVJRDogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGwgPSBudWxsXHJcbiAgICApOiB7IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsIGNvbnRpbnVlTG9hZGluZzogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzZWN0aW9uLm91dGxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3B0aW9uIHNlY3Rpb24gb3V0bGluZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmF3RnJhZ21lbnQgPSBnRnJhZ21lbnRDb2RlLnBhcnNlRnJhZ21lbnQocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICBpZiAoIXJhd0ZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JhdyBmcmFnbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlSUQgIT09IHJhd0ZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByYXdGcmFnbWVudCBpZCBkb2VzIG5vdCBtYXRjaCB0aGUgb3V0bGluZU5vZGVJRCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgZnJhZ21lbnQgPSBuZXcgUmVuZGVyRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICByYXdGcmFnbWVudC5pZCxcclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgICAgICAgICBzZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29udGludWVMb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGlmICghZnJhZ21lbnQudWkuZGlzY3Vzc2lvbkxvYWRlZCkge1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50LFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuY2FjaGVfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29udGludWVMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBjb250aW51ZUxvYWRpbmdcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBhdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBvcHRpb25zQW5kQW5jaWxsYXJpZXMgPSBnRnJhZ21lbnRDb2RlLnNwbGl0T3B0aW9uc0FuZEFuY2lsbGFyaWVzKGZyYWdtZW50Lm9wdGlvbnMpO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpXHJcbiAgICAgICAgICAgICYmIChvcHRpb25zQW5kQW5jaWxsYXJpZXMub3B0aW9uc1swXS5vcHRpb24gPT09ICcnIC8vIGlmIG9wdGlvbiBpcyBibGFua1xyXG4gICAgICAgICAgICAgICAgfHwgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnNbMF0uYXV0b01lcmdlRXhpdCA9PT0gdHJ1ZSkgLy8gaWYgYSBzaW5nbGUgZXhpdFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LmlkXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3V0bGluZU5vZGU/LmMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2hvd09wdGlvbk5vZGVfc3Vic2NyaXB0b24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zWzBdXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlbiBmaW5kIHRoZSBwYXJlbnQgb3B0aW9uIHdpdGggYW4gaUV4aXRLZXkgdGhhdCBtYXRjaGVzIHRoaXMgZXhpdEtleVxyXG4gICAgICAgICAgICBzaG93UGx1Z19zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBleHBhbmRPcHRpb25Qb2RzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc0FuZEFuY2lsbGFyaWVzID0gZ0ZyYWdtZW50Q29kZS5zcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllcyhmcmFnbWVudC5vcHRpb25zKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5pZFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5kID09IG51bGxcclxuICAgICAgICAgICAgICAgIHx8IG9wdGlvbi5wb2QgIT0gbnVsbFxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ091dGxpbmVDb2RlLmdldFBvZE91dGxpbmVfc3Vic2NyaXBpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5zZWN0aW9uXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyByZXR1cm4gc2hvd1BvZE9wdGlvbk5vZGVfc3Vic2NyaXB0b24oXHJcbiAgICAgICAgICAgIC8vICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgLy8gICAgIG9wdGlvblxyXG4gICAgICAgICAgICAvLyApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2FjaGVTZWN0aW9uUm9vdDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZGlzcGxheVNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZGlzcGxheVNlY3Rpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgcm9vdEZyYWdtZW50ID0gZGlzcGxheVNlY3Rpb24ucm9vdDtcclxuXHJcbiAgICAgICAgaWYgKCFyb290RnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jYWNoZV9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcm9vdEZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZGlzcGxheVNlY3Rpb24uY3VycmVudCA9IGRpc3BsYXlTZWN0aW9uLnJvb3Q7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHJvb3RGcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZWxlbWVudElzUGFyYWdyYXBoOiAodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBsZXQgdHJpbW1lZCA9IHZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKHRyaW1tZWQpKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAodHJpbW1lZC5sZW5ndGggPiAyMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRyaW1tZWQgPSB0cmltbWVkLnN1YnN0cmluZygwLCAyMCk7XHJcbiAgICAgICAgICAgICAgICB0cmltbWVkID0gdHJpbW1lZC5yZXBsYWNlKC9cXHMvZywgJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHJpbW1lZC5zdGFydHNXaXRoKCc8cD4nKSA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAmJiB0cmltbWVkWzNdICE9PSAnPCcpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZUFuZExvYWRHdWlkZVJvb3RGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmF3RnJhZ21lbnQ6IGFueSxcclxuICAgICAgICByb290OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXJhd0ZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUubG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHJvb3RcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJhd0ZyYWdtZW50OiBhbnksXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnRvcExldmVsTWFwS2V5ID0gcmF3RnJhZ21lbnQudG9wTGV2ZWxNYXBLZXkgPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQubWFwS2V5Q2hhaW4gPSByYXdGcmFnbWVudC5tYXBLZXlDaGFpbiA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5ndWlkZUlEID0gcmF3RnJhZ21lbnQuZ3VpZGVJRCA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5pS2V5ID0gcmF3RnJhZ21lbnQuaUtleSA/PyBudWxsO1xyXG4gICAgICAgIGZyYWdtZW50LmV4aXRLZXkgPSByYXdGcmFnbWVudC5leGl0S2V5ID8/IG51bGw7XHJcbiAgICAgICAgZnJhZ21lbnQudmFyaWFibGUgPSByYXdGcmFnbWVudC52YXJpYWJsZSA/PyBbXTtcclxuICAgICAgICBmcmFnbWVudC5jbGFzc2VzID0gcmF3RnJhZ21lbnQuY2xhc3NlcyA/PyBbXTtcclxuICAgICAgICBmcmFnbWVudC52YWx1ZSA9IHJhd0ZyYWdtZW50LnZhbHVlID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50LnZhbHVlID0gZnJhZ21lbnQudmFsdWUudHJpbSgpO1xyXG4gICAgICAgIC8vIGZyYWdtZW50LnVpLmRpc2N1c3Npb25Mb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmRvTm90UGFpbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY2hlY2tGb3JWYXJpYWJsZXMoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZnJhZ21lbnQuaWRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEID0gb3V0bGluZU5vZGU/LnBhcmVudD8uaSA/PyAnJztcclxuXHJcbiAgICAgICAgbGV0IG9wdGlvbjogSVJlbmRlckZyYWdtZW50IHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAocmF3RnJhZ21lbnQub3B0aW9uc1xyXG4gICAgICAgICAgICAmJiBBcnJheS5pc0FycmF5KHJhd0ZyYWdtZW50Lm9wdGlvbnMpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmF3T3B0aW9uIG9mIHJhd0ZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSBmcmFnbWVudC5vcHRpb25zLmZpbmQobyA9PiBvLmlkID09PSByYXdPcHRpb24uaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IGxvYWRPcHRpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdPcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQuc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9ucy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ub3B0aW9uID0gcmF3T3B0aW9uLm9wdGlvbiA/PyAnJztcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uaXNBbmNpbGxhcnkgPSByYXdPcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLm9yZGVyID0gcmF3T3B0aW9uLm9yZGVyID8/IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLmlFeGl0S2V5ID0gcmF3T3B0aW9uLmlFeGl0S2V5ID8/ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5leGl0S2V5ID0gcmF3T3B0aW9uLmV4aXRLZXkgPz8gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLmF1dG9NZXJnZUV4aXQgPSByYXdPcHRpb24uYXV0b01lcmdlRXhpdCA/PyAnJztcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ucG9kS2V5ID0gcmF3T3B0aW9uLnBvZEtleSA/PyAnJztcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ucG9kVGV4dCA9IHJhd09wdGlvbi5wb2RUZXh0ID8/ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5zZWN0aW9uID0gZnJhZ21lbnQuc2VjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ucGFyZW50RnJhZ21lbnRJRCA9IGZyYWdtZW50LmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5zZWdtZW50SW5kZXggPSBmcmFnbWVudC5zZWdtZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gb3B0aW9uLnVpLmRpc2N1c3Npb25Mb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi51aS5kb05vdFBhaW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdIb29rUmVnaXN0cnlDb2RlLmV4ZWN1dGVTdGVwSG9vayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VGcmFnbWVudDogKHJlc3BvbnNlOiBzdHJpbmcpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPVxcXCJtb2R1bGVcXFwiIHNyYz1cXFwiL0B2aXRlL2NsaWVudFxcXCI+PC9zY3JpcHQ+XHJcbiAgICAgICAgICAgICAgICA8IS0tIHRzRnJhZ21lbnRSZW5kZXJDb21tZW50IHtcXFwibm9kZVxcXCI6e1xcXCJpZFxcXCI6XFxcImRCdDdLbTJNbFxcXCIsXFxcInRvcExldmVsTWFwS2V5XFxcIjpcXFwiY3YxVFJsMDFyZlxcXCIsXFxcIm1hcEtleUNoYWluXFxcIjpcXFwiY3YxVFJsMDFyZlxcXCIsXFxcImd1aWRlSURcXFwiOlxcXCJkQnQ3Sk4xSGVcXFwiLFxcXCJndWlkZVBhdGhcXFwiOlxcXCJjOi9HaXRIdWIvVEVTVC5Eb2N1bWVudGF0aW9uL3RzbWFwc2RhdGFPcHRpb25zRm9sZGVyL0hvbGRlci9kYXRhT3B0aW9ucy50c21hcFxcXCIsXFxcInBhcmVudEZyYWdtZW50SURcXFwiOlxcXCJkQnQ3Sk4xdnRcXFwiLFxcXCJjaGFydEtleVxcXCI6XFxcImN2MVRSbDAxcmZcXFwiLFxcXCJvcHRpb25zXFxcIjpbXX19IC0tPlxyXG5cclxuICAgICAgICAgICAgICAgIDxoNCBpZD1cXFwib3B0aW9uLTEtc29sdXRpb25cXFwiPk9wdGlvbiAxIHNvbHV0aW9uPC9oND5cclxuICAgICAgICAgICAgICAgIDxwPk9wdGlvbiAxIHNvbHV0aW9uPC9wPlxyXG4gICAgICAgICovXHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gcmVzcG9uc2Uuc3BsaXQoJ1xcbicpO1xyXG4gICAgICAgIGNvbnN0IHJlbmRlckNvbW1lbnRTdGFydCA9IGA8IS0tICR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRSZW5kZXJDb21tZW50VGFnfWA7XHJcbiAgICAgICAgY29uc3QgcmVuZGVyQ29tbWVudEVuZCA9IGAgLS0+YDtcclxuICAgICAgICBsZXQgZnJhZ21lbnRSZW5kZXJDb21tZW50OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBsZXQgbGluZTogc3RyaW5nO1xyXG4gICAgICAgIGxldCBidWlsZFZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gJyc7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChidWlsZFZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBgJHt2YWx1ZX1cclxuJHtsaW5lfWA7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChyZW5kZXJDb21tZW50U3RhcnQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRSZW5kZXJDb21tZW50ID0gbGluZS5zdWJzdHJpbmcocmVuZGVyQ29tbWVudFN0YXJ0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBidWlsZFZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudFJlbmRlckNvbW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnJhZ21lbnRSZW5kZXJDb21tZW50ID0gZnJhZ21lbnRSZW5kZXJDb21tZW50LnRyaW0oKTtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50UmVuZGVyQ29tbWVudC5lbmRzV2l0aChyZW5kZXJDb21tZW50RW5kKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gZnJhZ21lbnRSZW5kZXJDb21tZW50Lmxlbmd0aCAtIHJlbmRlckNvbW1lbnRFbmQubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZnJhZ21lbnRSZW5kZXJDb21tZW50ID0gZnJhZ21lbnRSZW5kZXJDb21tZW50LnN1YnN0cmluZyhcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICBsZW5ndGhcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC50cmltKCk7XHJcbiAgICAgICAgbGV0IHJhd0ZyYWdtZW50OiBhbnkgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmF3RnJhZ21lbnQgPSBKU09OLnBhcnNlKGZyYWdtZW50UmVuZGVyQ29tbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmF3RnJhZ21lbnQudmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJhd0ZyYWdtZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBtYXJrT3B0aW9uc0V4cGFuZGVkOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLm9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjb2xsYXBzZUZyYWdtZW50c09wdGlvbnM6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgb3B0aW9uLnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY29sbGFwc2VGcmFnbWVudHNPcHRpb25zKGZyYWdtZW50KTtcclxuICAgICAgICBvcHRpb24udWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXRGcmFnbWVudFVpczogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhaW5GcmFnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19pZDtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiBjaGFpbkZyYWdtZW50cykge1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWkoY2hhaW5GcmFnbWVudHNbcHJvcE5hbWVdKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0RnJhZ21lbnRVaTogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICBmcmFnbWVudC51aS5kb05vdFBhaW50ID0gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEFuY2lsbGFyeUFjdGl2ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuYWN0aXZlQW5jaWxsYXJ5ID0gYW5jaWxsYXJ5O1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhckFuY2lsbGFyeUFjdGl2ZTogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuYWN0aXZlQW5jaWxsYXJ5ID0gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXM6IChjaGlsZHJlbjogQXJyYXk8SVJlbmRlckZyYWdtZW50PiB8IG51bGwgfCB1bmRlZmluZWQpOiB7IG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sIGFuY2lsbGFyaWVzOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+LCB0b3RhbDogbnVtYmVyIH0gPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBhbmNpbGxhcmllczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiA9IFtdO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4gPSBbXTtcclxuICAgICAgICBsZXQgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmICghY2hpbGRyZW4pIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgYW5jaWxsYXJpZXMsXHJcbiAgICAgICAgICAgICAgICB0b3RhbDogMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgb3B0aW9uID0gY2hpbGRyZW5baV0gYXMgSVJlbmRlckZyYWdtZW50O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFvcHRpb24uaXNBbmNpbGxhcnkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2gob3B0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFuY2lsbGFyaWVzLnB1c2gob3B0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICAgICAgYW5jaWxsYXJpZXMsXHJcbiAgICAgICAgICAgIHRvdGFsOiBjaGlsZHJlbi5sZW5ndGhcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDdXJyZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IGZyYWdtZW50LnNlY3Rpb247XHJcblxyXG4gICAgICAgIGxldCBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50LnBhcmVudEZyYWdtZW50SURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAocGFyZW50LmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBhbmQgRnJhZ21lbnQgYXJlIHRoZSBzYW1lXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJlbnQuc2VsZWN0ZWQgPSBmcmFnbWVudDtcclxuICAgICAgICAgICAgZnJhZ21lbnQudWkuc2VjdGlvbkluZGV4ID0gcGFyZW50LnVpLnNlY3Rpb25JbmRleCArIDE7XHJcblxyXG4gICAgICAgICAgICBjbGVhclNpYmxpbmdDaGFpbnMoXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50RnJhZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWN0aW9uLmN1cnJlbnQgPSBmcmFnbWVudDtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNoZWNrU2VsZWN0ZWQoZnJhZ21lbnQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRQb2RDdXJyZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IGZyYWdtZW50LnNlY3Rpb247XHJcblxyXG4gICAgICAgIGxldCBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50LnBhcmVudEZyYWdtZW50SURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAocGFyZW50LmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBhbmQgRnJhZ21lbnQgYXJlIHRoZSBzYW1lXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYXJlbnQuc2VsZWN0ZWQgPSBmcmFnbWVudDtcclxuICAgICAgICAgICAgZnJhZ21lbnQudWkuc2VjdGlvbkluZGV4ID0gcGFyZW50LnVpLnNlY3Rpb25JbmRleCArIDE7XHJcblxyXG4gICAgICAgICAgICBjbGVhclNpYmxpbmdDaGFpbnMoXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50RnJhZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZWN0aW9uLmN1cnJlbnQgPSBmcmFnbWVudDtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNoZWNrU2VsZWN0ZWQoZnJhZ21lbnQpO1xyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdGcmFnbWVudENvZGU7XHJcblxyXG4iLCJpbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2FjdGlvbnMvZ0ZyYWdtZW50QWN0aW9uc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSUZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9wYXlsb2Fkcy9JRnJhZ21lbnRQYXlsb2FkXCI7XHJcblxyXG5cclxuY29uc3QgaGlkZUZyb21QYWludCA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gICAgaGlkZTogYm9vbGVhblxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICAvKiBcclxuICAgICAgICBUaGlzIGlzIGEgZml4IGZvcjpcclxuICAgICAgICBOb3RGb3VuZEVycm9yOiBGYWlsZWQgdG8gZXhlY3V0ZSAnaW5zZXJ0QmVmb3JlJyBvbiAnTm9kZSc6IFRoZSBub2RlIGJlZm9yZSB3aGljaCB0aGUgbmV3IG5vZGUgaXMgdG8gYmUgaW5zZXJ0ZWQgaXMgbm90IGEgY2hpbGQgb2YgdGhpcyBub2RlLlxyXG4gICAgKi9cclxuXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9IGhpZGU7XHJcblxyXG4gICAgaGlkZUZyb21QYWludChcclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgICAgICBoaWRlXHJcbiAgICApO1xyXG5cclxuICAgIGhpZGVGcm9tUGFpbnQoXHJcbiAgICAgICAgZnJhZ21lbnQubGluaz8ucm9vdCxcclxuICAgICAgICBoaWRlXHJcbiAgICApO1xyXG59XHJcblxyXG5jb25zdCBoaWRlT3B0aW9uc0Zyb21QYWludCA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gICAgaGlkZTogYm9vbGVhblxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICAvKiBcclxuICAgICAgICBUaGlzIGlzIGEgZml4IGZvcjpcclxuICAgICAgICBOb3RGb3VuZEVycm9yOiBGYWlsZWQgdG8gZXhlY3V0ZSAnaW5zZXJ0QmVmb3JlJyBvbiAnTm9kZSc6IFRoZSBub2RlIGJlZm9yZSB3aGljaCB0aGUgbmV3IG5vZGUgaXMgdG8gYmUgaW5zZXJ0ZWQgaXMgbm90IGEgY2hpbGQgb2YgdGhpcyBub2RlLlxyXG4gICAgKi9cclxuICAgIGlmICghZnJhZ21lbnQpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBmcmFnbWVudD8ub3B0aW9ucykge1xyXG5cclxuICAgICAgICBoaWRlRnJvbVBhaW50KFxyXG4gICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgIGhpZGVcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVTZWN0aW9uUGFyZW50U2VsZWN0ZWQoXHJcbiAgICAgICAgZnJhZ21lbnQuc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0LFxyXG4gICAgICAgIGhpZGVcclxuICAgICk7XHJcbn1cclxuXHJcbmNvbnN0IGhpZGVTZWN0aW9uUGFyZW50U2VsZWN0ZWQgPSAoXHJcbiAgICBkaXNwbGF5Q2hhcnQ6IElEaXNwbGF5Q2hhcnQsXHJcbiAgICBoaWRlOiBib29sZWFuXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghZGlzcGxheUNoYXJ0Py5wYXJlbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUZyb21QYWludChcclxuICAgICAgICBkaXNwbGF5Q2hhcnQucGFyZW50LnNlbGVjdGVkLFxyXG4gICAgICAgIGhpZGVcclxuICAgICk7XHJcblxyXG4gICAgaGlkZVNlY3Rpb25QYXJlbnRTZWxlY3RlZChcclxuICAgICAgICBkaXNwbGF5Q2hhcnQucGFyZW50LnNlY3Rpb24gYXMgSURpc3BsYXlDaGFydCxcclxuICAgICAgICBoaWRlXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZnJhZ21lbnRBY3Rpb25zID0ge1xyXG5cclxuICAgIGV4cGFuZE9wdGlvbnM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhZnJhZ21lbnRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaWdub3JlRXZlbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5hY3RpdmVBbmNpbGxhcnkgIT0gbnVsbDtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyQW5jaWxsYXJ5QWN0aXZlKHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKGlnbm9yZUV2ZW50ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuc2V0RGlydHkoc3RhdGUpO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgY29uc3QgZXhwYW5kZWQgPSBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCAhPT0gdHJ1ZTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5vcHRpb25zRXhwYW5kZWQgPSBleHBhbmRlZDtcclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IGV4cGFuZGVkO1xyXG5cclxuICAgICAgICBoaWRlT3B0aW9uc0Zyb21QYWludChcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHRydWVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgaGlkZU9wdGlvbnM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhZnJhZ21lbnRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaWdub3JlRXZlbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5hY3RpdmVBbmNpbGxhcnkgIT0gbnVsbDtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyQW5jaWxsYXJ5QWN0aXZlKHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKGlnbm9yZUV2ZW50ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuc2V0RGlydHkoc3RhdGUpO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5vcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaGlkZU9wdGlvbnNGcm9tUGFpbnQoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGF5bG9hZDogSUZyYWdtZW50UGF5bG9hZFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFwYXlsb2FkPy5wYXJlbnRGcmFnbWVudFxyXG4gICAgICAgICAgICB8fCAhcGF5bG9hZD8ub3B0aW9uXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlnbm9yZUV2ZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuYWN0aXZlQW5jaWxsYXJ5ICE9IG51bGw7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhckFuY2lsbGFyeUFjdGl2ZShzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmIChpZ25vcmVFdmVudCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLnNldERpcnR5KHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMuc2hvd09wdGlvbk5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBwYXlsb2FkLnBhcmVudEZyYWdtZW50LFxyXG4gICAgICAgICAgICBwYXlsb2FkLm9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvZ2dsZUFuY2lsbGFyeU5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHBheWxvYWQ6IElGcmFnbWVudFBheWxvYWRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYW5jaWxsYXJ5ID0gcGF5bG9hZC5vcHRpb247XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuc2V0QW5jaWxsYXJ5QWN0aXZlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGFuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5zZXREaXJ0eShzdGF0ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMuc2hvd0FuY2lsbGFyeU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnJhZ21lbnRBY3Rpb25zO1xyXG4iLCJpbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElGcmFnbWVudFBheWxvYWQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvcGF5bG9hZHMvSUZyYWdtZW50UGF5bG9hZFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZyYWdtZW50UGF5bG9hZCBpbXBsZW1lbnRzIElGcmFnbWVudFBheWxvYWQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTEVsZW1lbnRcclxuICAgICkge1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEZyYWdtZW50ID0gcGFyZW50RnJhZ21lbnQ7XHJcbiAgICAgICAgdGhpcy5vcHRpb24gPSBvcHRpb247XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudDtcclxuICAgIHB1YmxpYyBvcHRpb246IElSZW5kZXJGcmFnbWVudDtcclxuICAgIHB1YmxpYyBlbGVtZW50OiBIVE1MRWxlbWVudDtcclxufVxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiwgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkUG9kRGlzY3Vzc2lvblZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgbGV0IGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPSBmYWxzZTtcclxuICAgIGxldCBhZGp1c3RGb3JQcmlvckFuY2lsbGFyaWVzID0gZmFsc2U7XHJcbiAgICBjb25zdCB2aWV3c0xlbmd0aCA9IHZpZXdzLmxlbmd0aDtcclxuXHJcbiAgICBpZiAodmlld3NMZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxhc3RWaWV3OiBhbnkgPSB2aWV3c1t2aWV3c0xlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBpZiAobGFzdFZpZXc/LnVpPy5pc0NvbGxhcHNlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGFzdFZpZXc/LnVpPy5oYXNBbmNpbGxhcmllcyA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmtFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldExpbmtFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgY29uc3QgcmVzdWx0czogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiwgaGFzQW5jaWxsYXJpZXM6IGJvb2xlYW4gfSA9IG9wdGlvbnNWaWV3cy5idWlsZFZpZXcoZnJhZ21lbnQpO1xyXG5cclxuICAgIGlmIChsaW5rRUxlbWVudElEID09PSAnbnRfbGtfZnJhZ190OTY4T0oxd28nKSB7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBSLURSQVdJTkcgJHtsaW5rRUxlbWVudElEfV9kYCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNsYXNzZXMgPSBcIm50LWZyLWZyYWdtZW50LWJveFwiO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNsYXNzTmFtZSBvZiBmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LXVyLSR7Y2xhc3NOYW1lfWBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtZnItcHJpb3ItY29sbGFwc2VkLW9wdGlvbnNgXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LWZyLXByaW9yLWlzLWFuY2lsbGFyeWBcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7bGlua0VMZW1lbnRJRH1fZGAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7Y2xhc3Nlc31gXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBgbnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1kaXNjdXNzaW9uXCI6IGZyYWdtZW50LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcIlwiXHJcbiAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdHMudmlld3NcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgaWYgKHJlc3VsdHMub3B0aW9uc0NvbGxhcHNlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3QW55ID0gdmlldyBhcyBhbnk7XHJcblxyXG4gICAgICAgIGlmICghdmlld0FueS51aSkge1xyXG5cclxuICAgICAgICAgICAgdmlld0FueS51aSA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmlld0FueS51aS5pc0NvbGxhcHNlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdHMuaGFzQW5jaWxsYXJpZXMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0FueSA9IHZpZXcgYXMgYW55O1xyXG5cclxuICAgICAgICBpZiAoIXZpZXdBbnkudWkpIHtcclxuXHJcbiAgICAgICAgICAgIHZpZXdBbnkudWkgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZpZXdBbnkudWkuaGFzQW5jaWxsYXJpZXMgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZpZXdzLnB1c2godmlldyk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFZpZXcgPSAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IENoaWxkcmVuW10gPT4ge1xyXG5cclxuICAgIGNvbnN0IHZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcblxyXG4gICAgYnVpbGRQb2REaXNjdXNzaW9uVmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICB2aWV3c1xyXG4gICAgKTtcclxuXHJcbiAgICBmcmFnbWVudFZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgICAgICB2aWV3c1xyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlld3M7XHJcbn07XHJcblxyXG5jb25zdCBwb2RWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQsXHJcbiAgICApOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIW9wdGlvblxyXG4gICAgICAgICAgICB8fCAhb3B0aW9uLnBvZD8ucm9vdFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXcgPSBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItcG9kLWJveFwiIH0sXHJcblxyXG4gICAgICAgICAgICBidWlsZFZpZXcob3B0aW9uLnBvZD8ucm9vdClcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHBvZFZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IENoaWxkcmVuLCBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuXHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgZnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2ZyYWdtZW50QWN0aW9uc1wiO1xyXG5pbXBvcnQgRnJhZ21lbnRQYXlsb2FkIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS91aS9wYXlsb2Fkcy9GcmFnbWVudFBheWxvYWRcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBmcmFnbWVudFZpZXdzIGZyb20gXCIuL2ZyYWdtZW50Vmlld3NcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IHBvZFZpZXdzIGZyb20gXCIuL3BvZFZpZXdzXCI7XHJcblxyXG5cclxuY29uc3QgYnVpbGRBbmNpbGxhcnlEaXNjdXNzaW9uVmlldyA9IChhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudCk6IENoaWxkcmVuW10gPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBDaGlsZHJlbltdID0gW107XHJcblxyXG4gICAgZnJhZ21lbnRWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgYW5jaWxsYXJ5LFxyXG4gICAgICAgIHZpZXdcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn1cclxuXHJcbmNvbnN0IGJ1aWxkRXhwYW5kZWRBbmNpbGxhcnlWaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5XHJcbiAgICAgICAgfHwgIWFuY2lsbGFyeS5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnktYm94XCIgfSwgW1xyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWhlYWRcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5IG50LWZyLWFuY2lsbGFyeS10YXJnZXRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd246IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy50b2dnbGVBbmNpbGxhcnlOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRhcmdldDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGcmFnbWVudFBheWxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaWxsYXJ5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJzcGFuXCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LXRleHQgbnQtZnItYW5jaWxsYXJ5LXRhcmdldFwiIH0sIGFuY2lsbGFyeS5vcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKFwic3BhblwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS14IG50LWZyLWFuY2lsbGFyeS10YXJnZXRcIiB9LCAn4pyVJylcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIF0pLFxyXG5cclxuICAgICAgICAgICAgYnVpbGRBbmNpbGxhcnlEaXNjdXNzaW9uVmlldyhhbmNpbGxhcnkpXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn1cclxuXHJcbmNvbnN0IGJ1aWxkQ29sbGFwc2VkQW5jaWxsYXJ5VmlldyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeVxyXG4gICAgICAgIHx8ICFhbmNpbGxhcnkuaXNBbmNpbGxhcnkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWJveCBudC1mci1jb2xsYXBzZWRcIiB9LCBbXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnktaGVhZFwiIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1hbmNpbGxhcnkgbnQtZnItYW5jaWxsYXJ5LXRhcmdldFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLnRvZ2dsZUFuY2lsbGFyeU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGFyZ2V0OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50UGF5bG9hZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNpbGxhcnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnktdGFyZ2V0XCIgfSwgYW5jaWxsYXJ5Lm9wdGlvbilcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn1cclxuXHJcbmNvbnN0IEJ1aWxkQW5jaWxsYXJ5VmlldyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeVxyXG4gICAgICAgIHx8ICFhbmNpbGxhcnkuaXNBbmNpbGxhcnkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICByZXR1cm4gYnVpbGRFeHBhbmRlZEFuY2lsbGFyeVZpZXcoXHJcbiAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYnVpbGRDb2xsYXBzZWRBbmNpbGxhcnlWaWV3KFxyXG4gICAgICAgIHBhcmVudCxcclxuICAgICAgICBhbmNpbGxhcnlcclxuICAgICk7XHJcbn1cclxuXHJcbmNvbnN0IEJ1aWxkRXhwYW5kZWRPcHRpb25WaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghb3B0aW9uXHJcbiAgICAgICAgfHwgb3B0aW9uLmlzQW5jaWxsYXJ5ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBidXR0b25DbGFzcyA9IFwibnQtZnItb3B0aW9uXCI7XHJcbiAgICBsZXQgaW5uZXJWaWV3OiBWTm9kZSB8IG51bGw7XHJcblxyXG4gICAgaWYgKG9wdGlvbi5wb2Q/LnJvb3QpIHtcclxuXHJcbiAgICAgICAgYnV0dG9uQ2xhc3MgPSBgJHtidXR0b25DbGFzc30gbnQtZnItcG9kLWJ1dHRvbmA7XHJcbiAgICAgICAgaW5uZXJWaWV3ID0gcG9kVmlld3MuYnVpbGRWaWV3KG9wdGlvbik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpbm5lclZpZXcgPSBoKFwic3BhblwiLCB7IGNsYXNzOiBcIm50LWZyLW9wdGlvbi10ZXh0XCIgfSwgb3B0aW9uLm9wdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItb3B0aW9uLWJveFwiIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogYCR7YnV0dG9uQ2xhc3N9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd246IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5zaG93T3B0aW9uTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0YXJnZXQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnJhZ21lbnRQYXlsb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lclZpZXdcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBidWlsZEV4cGFuZGVkT3B0aW9uc1ZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PlxyXG4pOiB7IHZpZXc6IFZOb2RlLCBpc0NvbGxhcHNlZDogYm9vbGVhbiB9IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uVmlld3M6IENoaWxkcmVuW10gPSBbXTtcclxuICAgIGxldCBvcHRpb25WZXc6IFZOb2RlIHwgbnVsbDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIG9wdGlvblZldyA9IEJ1aWxkRXhwYW5kZWRPcHRpb25WaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvblZldykge1xyXG5cclxuICAgICAgICAgICAgb3B0aW9uVmlld3MucHVzaChvcHRpb25WZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgb3B0aW9uc0NsYXNzZXMgPSBcIm50LWZyLWZyYWdtZW50LW9wdGlvbnNcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgb3B0aW9uc0NsYXNzZXMgPSBgJHtvcHRpb25zQ2xhc3Nlc30gbnQtZnItZnJhZ21lbnQtY2hhaW5gXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtvcHRpb25zQ2xhc3Nlc31gLFxyXG4gICAgICAgICAgICAgICAgdGFiaW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICBvbkJsdXI6IFtcclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFjdGlvbnMuaGlkZU9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgKF9ldmVudDogYW55KSA9PiBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgb3B0aW9uVmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdmlldyxcclxuICAgICAgICBpc0NvbGxhcHNlZDogZmFsc2VcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEV4cGFuZGVkT3B0aW9uc0JveFZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PixcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zVmlldyA9IGJ1aWxkRXhwYW5kZWRPcHRpb25zVmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBvcHRpb25zXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghb3B0aW9uc1ZpZXcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNsYXNzZXMgPSBcIm50LWZyLWZyYWdtZW50LWJveFwiO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNsYXNzTmFtZSBvZiBmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LXVyLSR7Y2xhc3NOYW1lfWBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2aWV3cy5wdXNoKFxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fZW9gLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2NsYXNzZXN9YFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zVmlldy52aWV3XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyA9IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogVk5vZGUgPT4ge1xyXG5cclxuICAgIGxldCBidXR0b25DbGFzcyA9IFwibnQtZnItZnJhZ21lbnQtb3B0aW9ucyBudC1mci1jb2xsYXBzZWRcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWQ/LnBvZD8ucm9vdCkge1xyXG5cclxuICAgICAgICBidXR0b25DbGFzcyA9IGAke2J1dHRvbkNsYXNzfSBudC1mci1wb2QtYnV0dG9uYDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtidXR0b25DbGFzc31gLFxyXG4gICAgICAgICAgICAgICAgb25Nb3VzZURvd246IFtcclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFjdGlvbnMuZXhwYW5kT3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAoX2V2ZW50OiBhbnkpID0+IGZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIHBvZFZpZXdzLmJ1aWxkVmlldyhmcmFnbWVudC5zZWxlY3RlZCksXHJcblxyXG4gICAgICAgICAgICAgICAgaChcInNwYW5cIiwgeyBjbGFzczogYG50LWZyLW9wdGlvbi1zZWxlY3RlZGAgfSwgYCR7ZnJhZ21lbnQuc2VsZWN0ZWQ/Lm9wdGlvbn1gKSxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZENvbGxhcHNlZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25WaWV3ID0gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgbGV0IGNsYXNzZXMgPSBcIm50LWZyLWZyYWdtZW50LWJveFwiO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNsYXNzTmFtZSBvZiBmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LXVyLSR7Y2xhc3NOYW1lfWBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7ZnJhZ21lbnRFTGVtZW50SUR9X2NvYCxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtjbGFzc2VzfWBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uVmlld1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICBjb25zdCB2aWV3QW55ID0gdmlldyBhcyBhbnk7XHJcblxyXG4gICAgaWYgKCF2aWV3QW55LnVpKSB7XHJcblxyXG4gICAgICAgIHZpZXdBbnkudWkgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3QW55LnVpLmlzQ29sbGFwc2VkID0gdHJ1ZTtcclxuICAgIHZpZXdzLnB1c2godmlldyk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEFuY2lsbGFyaWVzVmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcmllczogQXJyYXk8SVJlbmRlckZyYWdtZW50PlxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmIChhbmNpbGxhcmllcy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYW5jaWxsYXJpZXNWaWV3czogQ2hpbGRyZW5bXSA9IFtdO1xyXG4gICAgbGV0IGFuY2lsbGFyeVZpZXc6IFZOb2RlIHwgbnVsbDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGFuY2lsbGFyeSBvZiBhbmNpbGxhcmllcykge1xyXG5cclxuICAgICAgICBhbmNpbGxhcnlWaWV3ID0gQnVpbGRBbmNpbGxhcnlWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGFuY2lsbGFyeVZpZXcpIHtcclxuXHJcbiAgICAgICAgICAgIGFuY2lsbGFyaWVzVmlld3MucHVzaChhbmNpbGxhcnlWaWV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuY2lsbGFyaWVzVmlld3MubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBhbmNpbGxhcmllc0NsYXNzZXMgPSBcIm50LWZyLWZyYWdtZW50LWFuY2lsbGFyaWVzXCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LnNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgIGFuY2lsbGFyaWVzQ2xhc3NlcyA9IGAke2FuY2lsbGFyaWVzQ2xhc3Nlc30gbnQtZnItZnJhZ21lbnQtY2hhaW5gXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHthbmNpbGxhcmllc0NsYXNzZXN9YCxcclxuICAgICAgICAgICAgICAgIHRhYmluZGV4OiAwLFxyXG4gICAgICAgICAgICAgICAgLy8gb25CbHVyOiBbXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgZnJhZ21lbnRBY3Rpb25zLmhpZGVPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgIChfZXZlbnQ6IGFueSkgPT4gZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgIC8vIF1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGFuY2lsbGFyaWVzVmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRBbmNpbGxhcmllc0JveFZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgYW5jaWxsYXJpZXM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sXHJcbiAgICBmcmFnbWVudEVMZW1lbnRJRDogc3RyaW5nLFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3QgYW5jaWxsYXJpZXNWaWV3ID0gYnVpbGRBbmNpbGxhcmllc1ZpZXcoXHJcbiAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgYW5jaWxsYXJpZXNcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFhbmNpbGxhcmllc1ZpZXcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNsYXNzZXMgPSBcIm50LWZyLWZyYWdtZW50LWJveFwiO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNsYXNzTmFtZSBvZiBmcmFnbWVudC5jbGFzc2VzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LXVyLSR7Y2xhc3NOYW1lfWBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7ZnJhZ21lbnRFTGVtZW50SUR9X2FgLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2NsYXNzZXN9YFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllc1ZpZXdcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgY29uc3Qgdmlld0FueSA9IHZpZXcgYXMgYW55O1xyXG5cclxuICAgIGlmICghdmlld0FueS51aSkge1xyXG5cclxuICAgICAgICB2aWV3QW55LnVpID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgdmlld0FueS51aS5oYXNBbmNpbGxhcmllcyA9IHRydWU7XHJcbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRPcHRpb25zVmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+XHJcbik6IHsgdmlldzogVk5vZGUsIGlzQ29sbGFwc2VkOiBib29sZWFuIH0gfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgJiYgKG9wdGlvbnNbMF0ub3B0aW9uID09PSAnJyAvLyBpZiBvcHRpb24gaXMgYmxhbmtcclxuICAgICAgICAgICAgfHwgb3B0aW9uc1swXS5hdXRvTWVyZ2VFeGl0ID09PSB0cnVlKSAvLyBpZiBhIHNpbmdsZSBleGl0XHJcbiAgICApIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWRcclxuICAgICAgICAmJiAhZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQpIHtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldyA9IGJ1aWxkQ29sbGFwc2VkT3B0aW9uc1ZpZXcoZnJhZ21lbnQpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB2aWV3LFxyXG4gICAgICAgICAgICBpc0NvbGxhcHNlZDogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJ1aWxkRXhwYW5kZWRPcHRpb25zVmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBvcHRpb25zXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRPcHRpb25zQm94VmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+LFxyXG4gICAgZnJhZ21lbnRFTGVtZW50SUQ6IHN0cmluZyxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAmJiAob3B0aW9uc1swXS5vcHRpb24gPT09ICcnIC8vIGlmIG9wdGlvbiBpcyBibGFua1xyXG4gICAgICAgICAgICB8fCBvcHRpb25zWzBdLmF1dG9NZXJnZUV4aXQgPT09IHRydWUpIC8vIGlmIGEgc2luZ2xlIGV4aXRcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWRcclxuICAgICAgICAmJiAhZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQpIHtcclxuXHJcbiAgICAgICAgYnVpbGRDb2xsYXBzZWRPcHRpb25zQm94VmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBidWlsZEV4cGFuZGVkT3B0aW9uc0JveFZpZXcoXHJcbiAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICBmcmFnbWVudEVMZW1lbnRJRCxcclxuICAgICAgICB2aWV3c1xyXG4gICAgKTtcclxufTtcclxuXHJcblxyXG5jb25zdCBvcHRpb25zVmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHsgdmlld3M6IENoaWxkcmVuW10sIG9wdGlvbnNDb2xsYXBzZWQ6IGJvb2xlYW4sIGhhc0FuY2lsbGFyaWVzOiBib29sZWFuIH0gPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50Lm9wdGlvbnNcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDBcclxuICAgICAgICAgICAgfHwgIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpIC8vIERvbid0IGRyYXcgb3B0aW9ucyBvZiBsaW5rc1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdmlld3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uc0NvbGxhcHNlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBoYXNBbmNpbGxhcmllczogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudC5vcHRpb25zLmxlbmd0aCA9PT0gMVxyXG4gICAgICAgICAgICAmJiAoZnJhZ21lbnQub3B0aW9uc1swXS5vcHRpb24gPT09ICcnIC8vIGlmIG9wdGlvbiBpcyBibGFua1xyXG4gICAgICAgICAgICAgICAgfHwgZnJhZ21lbnQub3B0aW9uc1swXS5hdXRvTWVyZ2VFeGl0ID09PSB0cnVlKSAvLyBpZiBhIHNpbmdsZSBleGl0XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB2aWV3czogW10sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zQ29sbGFwc2VkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGhhc0FuY2lsbGFyaWVzOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc0FuZEFuY2lsbGFyaWVzID0gZ0ZyYWdtZW50Q29kZS5zcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllcyhmcmFnbWVudC5vcHRpb25zKTtcclxuICAgICAgICBsZXQgaGFzQW5jaWxsYXJpZXMgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld3M6IENoaWxkcmVuW10gPSBbXHJcblxyXG4gICAgICAgICAgICBidWlsZEFuY2lsbGFyaWVzVmlldyhcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgaWYgKHZpZXdzLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGhhc0FuY2lsbGFyaWVzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNWaWV3UmVzdWx0cyA9IGJ1aWxkT3B0aW9uc1ZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBvcHRpb25zQW5kQW5jaWxsYXJpZXMub3B0aW9uc1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zVmlld1Jlc3VsdHMpIHtcclxuXHJcbiAgICAgICAgICAgIHZpZXdzLnB1c2gob3B0aW9uc1ZpZXdSZXN1bHRzLnZpZXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdmlld3MsXHJcbiAgICAgICAgICAgIG9wdGlvbnNDb2xsYXBzZWQ6IG9wdGlvbnNWaWV3UmVzdWx0cz8uaXNDb2xsYXBzZWQgPz8gZmFsc2UsXHJcbiAgICAgICAgICAgIGhhc0FuY2lsbGFyaWVzXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgYnVpbGRWaWV3MjogKFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgdmlld3M6IENoaWxkcmVuW11cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50Lm9wdGlvbnNcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDBcclxuICAgICAgICAgICAgfHwgIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpIC8vIERvbid0IGRyYXcgb3B0aW9ucyBvZiBsaW5rc1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAgICAgJiYgKGZyYWdtZW50Lm9wdGlvbnNbMF0ub3B0aW9uID09PSAnJyAvLyBpZiBvcHRpb24gaXMgYmxhbmtcclxuICAgICAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnNbMF0uYXV0b01lcmdlRXhpdCA9PT0gdHJ1ZSkgLy8gaWYgYSBzaW5nbGUgZXhpdFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEVMZW1lbnRJRCA9IGdGcmFnbWVudENvZGUuZ2V0RnJhZ21lbnRFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGJ1aWxkQW5jaWxsYXJpZXNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICBmcmFnbWVudEVMZW1lbnRJRCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zVmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4gfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkTGlua0Rpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gZmFsc2U7XHJcbiAgICBsZXQgYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9IGZhbHNlO1xyXG4gICAgY29uc3Qgdmlld3NMZW5ndGggPSB2aWV3cy5sZW5ndGg7XHJcblxyXG4gICAgaWYgKHZpZXdzTGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICBjb25zdCBsYXN0VmlldzogYW55ID0gdmlld3Nbdmlld3NMZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8uaXNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8uaGFzQW5jaWxsYXJpZXMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaW5rRUxlbWVudElEID0gZ0ZyYWdtZW50Q29kZS5nZXRMaW5rRWxlbWVudElEKGZyYWdtZW50LmlkKTtcclxuICAgIGNvbnN0IHJlc3VsdHM6IHsgdmlld3M6IENoaWxkcmVuW10sIG9wdGlvbnNDb2xsYXBzZWQ6IGJvb2xlYW4sIGhhc0FuY2lsbGFyaWVzOiBib29sZWFuIH0gPSBvcHRpb25zVmlld3MuYnVpbGRWaWV3KGZyYWdtZW50KTtcclxuXHJcbiAgICBpZiAobGlua0VMZW1lbnRJRCA9PT0gJ250X2xrX2ZyYWdfdDk2OE9KMXdvJykge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgUi1EUkFXSU5HICR7bGlua0VMZW1lbnRJRH1fbGApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBjbGFzc2VzID0gXCJudC1mci1mcmFnbWVudC1ib3hcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBjbGFzc05hbWUgb2YgZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC11ci0ke2NsYXNzTmFtZX1gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LWZyLXByaW9yLWNvbGxhcHNlZC1vcHRpb25zYFxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZGp1c3RGb3JQcmlvckFuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC1mci1wcmlvci1pcy1hbmNpbGxhcnlgXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldyA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2xpbmtFTGVtZW50SUR9X2xgLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2NsYXNzZXN9YFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogYG50LWZyLWZyYWdtZW50LWRpc2N1c3Npb25gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtZGlzY3Vzc2lvblwiOiBmcmFnbWVudC52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcIlxyXG4gICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnZpZXdzXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIGlmIChyZXN1bHRzLm9wdGlvbnNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0FueSA9IHZpZXcgYXMgYW55O1xyXG5cclxuICAgICAgICBpZiAoIXZpZXdBbnkudWkpIHtcclxuXHJcbiAgICAgICAgICAgIHZpZXdBbnkudWkgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZpZXdBbnkudWkuaXNDb2xsYXBzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmhhc0FuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBbnkgPSB2aWV3IGFzIGFueTtcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3QW55LnVpKSB7XHJcblxyXG4gICAgICAgICAgICB2aWV3QW55LnVpID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2aWV3QW55LnVpLmhhc0FuY2lsbGFyaWVzID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRMaW5rRXhpdHNWaWV3ID0gKFxyXG4gICAgX2ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBfdmlldzogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgICAvLyBpZiAoIWZyYWdtZW50Lm9wdGlvbnNcclxuICAgIC8vICAgICB8fCBmcmFnbWVudC5vcHRpb25zLmxlbmd0aCA9PT0gMFxyXG4gICAgLy8gICAgIHx8ICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZFxyXG4gICAgLy8gKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSkpIHtcclxuXHJcbiAgICAvLyAgICAgLy8gVGhlbiBtYXAgaGFzIGEgc2luZ2xlIGV4aXQgYW5kIGl0IHdhcyBtZXJnZWQgaW50byB0aGlzIGZyYWdtZW50XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIHZpZXcucHVzaChcclxuXHJcbiAgICAvLyAgICAgaChcImRpdlwiLFxyXG4gICAgLy8gICAgICAgICB7XHJcbiAgICAvLyAgICAgICAgICAgICBjbGFzczogXCJudC1mci1leGl0cy1ib3hcIlxyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICBbXHJcbiAgICAvLyAgICAgICAgICAgICBvcHRpb25zVmlld3MuYnVpbGRWaWV3KGZyYWdtZW50KVxyXG4gICAgLy8gICAgICAgICBdXHJcbiAgICAvLyAgICAgKVxyXG4gICAgLy8gKTtcclxufTtcclxuXHJcbmNvbnN0IGxpbmtWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgICAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWlsZExpbmtEaXNjdXNzaW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGlua1ZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQubGluaz8ucm9vdCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZExpbmtFeGl0c1ZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbGlua1ZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IENoaWxkcmVuIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBvcHRpb25zVmlld3MgZnJvbSBcIi4vb3B0aW9uc1ZpZXdzXCI7XHJcbmltcG9ydCBsaW5rVmlld3MgZnJvbSBcIi4vbGlua1ZpZXdzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkRGlzY3Vzc2lvblZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LnZhbHVlKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9IGZhbHNlO1xyXG4gICAgbGV0IGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPSBmYWxzZTtcclxuICAgIGNvbnN0IHZpZXdzTGVuZ3RoID0gdmlld3MubGVuZ3RoO1xyXG5cclxuICAgIGlmICh2aWV3c0xlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgY29uc3QgbGFzdFZpZXc6IGFueSA9IHZpZXdzW3ZpZXdzTGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/LmlzQ29sbGFwc2VkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/Lmhhc0FuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBhZGp1c3RGb3JQcmlvckFuY2lsbGFyaWVzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldEZyYWdtZW50RWxlbWVudElEKGZyYWdtZW50LmlkKTtcclxuXHJcbiAgICBsZXQgY2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYm94XCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2xhc3NOYW1lIG9mIGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtdXItJHtjbGFzc05hbWV9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC1mci1wcmlvci1jb2xsYXBzZWQtb3B0aW9uc2BcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtZnItcHJpb3ItaXMtYW5jaWxsYXJ5YFxyXG4gICAgfVxyXG5cclxuICAgIHZpZXdzLnB1c2goXHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9kYCxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtjbGFzc2VzfWBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGBudC1mci1mcmFnbWVudC1kaXNjdXNzaW9uYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWRpc2N1c3Npb25cIjogZnJhZ21lbnQudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiXCJcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZnJhZ21lbnRWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgICAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWlsZERpc2N1c3Npb25WaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsaW5rVmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudC5saW5rPy5yb290LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG9wdGlvbnNWaWV3cy5idWlsZFZpZXcyKFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmcmFnbWVudFZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZyYWdtZW50Vmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4sIFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG4vLyBpbXBvcnQgZ0RlYnVnZ2VyQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0RlYnVnZ2VyQ29kZVwiO1xyXG5cclxuaW1wb3J0IFwiLi4vc2Nzcy9mcmFnbWVudHMuc2Nzc1wiO1xyXG5cclxuXHJcbmNvbnN0IGd1aWRlVmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRDb250ZW50VmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGlubmVyVmlld3M6IENoaWxkcmVuW10gPSBbXTtcclxuXHJcbiAgICAgICAgZnJhZ21lbnRWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdCxcclxuICAgICAgICAgICAgaW5uZXJWaWV3c1xyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gZ0RlYnVnZ2VyQ29kZS5sb2dSb290KHN0YXRlKTtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBcIm50X2ZyX0ZyYWdtZW50c1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGlubmVyVmlld3NcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBndWlkZVZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGluaXRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2luaXRBY3Rpb25zXCI7XHJcbmltcG9ydCBndWlkZVZpZXdzIGZyb20gXCIuLi8uLi9mcmFnbWVudHMvdmlld3MvZ3VpZGVWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRWaWV3ID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiBpbml0QWN0aW9ucy5zZXROb3RSYXcsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IFwidHJlZVNvbHZlRnJhZ21lbnRzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgZ3VpZGVWaWV3cy5idWlsZENvbnRlbnRWaWV3KHN0YXRlKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRWaWV3O1xyXG5cclxuIiwiaW1wb3J0IElTZXR0aW5ncyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lTZXR0aW5nc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNldHRpbmdzIGltcGxlbWVudHMgSVNldHRpbmdzIHtcclxuXHJcbiAgICBwdWJsaWMga2V5OiBzdHJpbmcgPSBcIi0xXCI7XHJcbiAgICBwdWJsaWMgcjogc3RyaW5nID0gXCItMVwiO1xyXG5cclxuICAgIC8vIEF1dGhlbnRpY2F0aW9uXHJcbiAgICBwdWJsaWMgdXNlclBhdGg6IHN0cmluZyA9IGB1c2VyYDtcclxuICAgIHB1YmxpYyBkZWZhdWx0TG9nb3V0UGF0aDogc3RyaW5nID0gYGxvZ291dGA7XHJcbiAgICBwdWJsaWMgZGVmYXVsdExvZ2luUGF0aDogc3RyaW5nID0gYGxvZ2luYDtcclxuICAgIHB1YmxpYyByZXR1cm5VcmxTdGFydDogc3RyaW5nID0gYHJldHVyblVybGA7XHJcblxyXG4gICAgcHJpdmF0ZSBiYXNlVXJsOiBzdHJpbmcgPSAod2luZG93IGFzIGFueSkuQVNTSVNUQU5UX0JBU0VfVVJMID8/ICcnO1xyXG4gICAgcHVibGljIGxpbmtVcmw6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfTElOS19VUkwgPz8gJyc7XHJcbiAgICBwdWJsaWMgc3Vic2NyaXB0aW9uSUQ6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfU1VCU0NSSVBUSU9OX0lEID8/ICcnO1xyXG5cclxuICAgIHB1YmxpYyBhcGlVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vYXBpYDtcclxuICAgIHB1YmxpYyBiZmZVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vYmZmYDtcclxuICAgIHB1YmxpYyBmaWxlVXJsOiBzdHJpbmcgPSBgJHt0aGlzLmJhc2VVcmx9L2ZpbGVgO1xyXG59XHJcbiIsIlxyXG5leHBvcnQgZW51bSBuYXZpZ2F0aW9uRGlyZWN0aW9uIHtcclxuXHJcbiAgICBCdXR0b25zID0gJ2J1dHRvbnMnLFxyXG4gICAgQmFja3dhcmRzID0gJ2JhY2t3YXJkcycsXHJcbiAgICBGb3J3YXJkcyA9ICdmb3J3YXJkcydcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgbmF2aWdhdGlvbkRpcmVjdGlvbiB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL25hdmlnYXRpb25EaXJlY3Rpb25cIjtcclxuaW1wb3J0IElIaXN0b3J5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlcIjtcclxuaW1wb3J0IElIaXN0b3J5VXJsIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlVcmxcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaXN0b3J5IGltcGxlbWVudHMgSUhpc3Rvcnkge1xyXG5cclxuICAgIHB1YmxpYyBoaXN0b3J5Q2hhaW46IEFycmF5PElIaXN0b3J5VXJsPiA9IFtdO1xyXG4gICAgcHVibGljIGRpcmVjdGlvbjogbmF2aWdhdGlvbkRpcmVjdGlvbiA9IG5hdmlnYXRpb25EaXJlY3Rpb24uQnV0dG9ucztcclxuICAgIHB1YmxpYyBjdXJyZW50SW5kZXg6IG51bWJlciA9IDA7XHJcbn1cclxuIiwiaW1wb3J0IElVc2VyIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVVzZXJcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyIGltcGxlbWVudHMgSVVzZXIge1xyXG5cclxuICAgIHB1YmxpYyBrZXk6IHN0cmluZyA9IGAwMTIzNDU2Nzg5YDtcclxuICAgIHB1YmxpYyByOiBzdHJpbmcgPSBcIi0xXCI7XHJcbiAgICBwdWJsaWMgdXNlVnNDb2RlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBhdXRob3Jpc2VkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgcmF3OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBsb2dvdXRVcmw6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgc2hvd01lbnU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIHN1Yjogc3RyaW5nID0gXCJcIjtcclxufVxyXG4iLCJpbXBvcnQgSVJlcGVhdEVmZmVjdHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JUmVwZWF0RWZmZWN0c1wiO1xyXG5pbXBvcnQgSUh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwZWF0ZUVmZmVjdHMgaW1wbGVtZW50cyBJUmVwZWF0RWZmZWN0cyB7XHJcblxyXG4gICAgcHVibGljIHNob3J0SW50ZXJ2YWxIdHRwOiBBcnJheTxJSHR0cEVmZmVjdD4gPSBbXTtcclxuICAgIHB1YmxpYyByZUxvYWRHZXRIdHRwSW1tZWRpYXRlOiBBcnJheTxJSHR0cEVmZmVjdD4gPSBbXTtcclxuICAgIHB1YmxpYyBydW5BY3Rpb25JbW1lZGlhdGU6IEFycmF5PElBY3Rpb24+ID0gW107XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJTdGF0ZVVJIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL0lSZW5kZXJTdGF0ZVVJXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyU3RhdGVVSSBpbXBsZW1lbnRzIElSZW5kZXJTdGF0ZVVJIHtcclxuXHJcbiAgICBwdWJsaWMgcmF3OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBvcHRpb25zRXhwYW5kZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlHdWlkZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5R3VpZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lSZW5kZXJTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlVUkgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlclN0YXRlVUlcIjtcclxuaW1wb3J0IFJlbmRlclN0YXRlVUkgZnJvbSBcIi4vdWkvUmVuZGVyU3RhdGVVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlclN0YXRlIGltcGxlbWVudHMgSVJlbmRlclN0YXRlIHtcclxuXHJcbiAgICBwdWJsaWMgcmVmcmVzaFVybDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzQ2hhaW5Mb2FkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+ID0gW107XHJcbiAgICBwdWJsaWMgZGlzcGxheUd1aWRlOiBJRGlzcGxheUd1aWRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgb3V0bGluZXM6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIG91dGxpbmVVcmxzOiBhbnkgPSB7fTtcclxuICAgIHB1YmxpYyBjdXJyZW50U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIGFjdGl2ZUFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgLy8gU2VhcmNoIGluZGljZXNcclxuICAgIHB1YmxpYyBpbmRleF9vdXRsaW5lTm9kZXNfaWQ6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIGluZGV4X2NoYWluRnJhZ21lbnRzX2lkOiBhbnkgPSB7fTtcclxuXHJcbiAgICBwdWJsaWMgdWk6IElSZW5kZXJTdGF0ZVVJID0gbmV3IFJlbmRlclN0YXRlVUkoKTtcclxufVxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgU2V0dGluZ3MgZnJvbSBcIi4vdXNlci9TZXR0aW5nc1wiO1xyXG5pbXBvcnQgSVNldHRpbmdzIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVNldHRpbmdzXCI7XHJcbmltcG9ydCBJSGlzdG9yeSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5XCI7XHJcbmltcG9ydCBTdGVwSGlzdG9yeSBmcm9tIFwiLi9oaXN0b3J5L0hpc3RvcnlcIjtcclxuaW1wb3J0IElVc2VyIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVVzZXJcIjtcclxuaW1wb3J0IFVzZXIgZnJvbSBcIi4vdXNlci9Vc2VyXCI7XHJcbmltcG9ydCBJUmVwZWF0RWZmZWN0cyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lSZXBlYXRFZmZlY3RzXCI7XHJcbmltcG9ydCBSZXBlYXRlRWZmZWN0cyBmcm9tIFwiLi9lZmZlY3RzL1JlcGVhdGVFZmZlY3RzXCI7XHJcbmltcG9ydCBJUmVuZGVyU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVJlbmRlclN0YXRlXCI7XHJcbmltcG9ydCBSZW5kZXJTdGF0ZSBmcm9tIFwiLi9SZW5kZXJTdGF0ZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlIGltcGxlbWVudHMgSVN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2V0dGluZ3M6IElTZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZGluZzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgZGVidWc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGdlbmVyaWNFcnJvcjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG5leHRLZXk6IG51bWJlciA9IC0xO1xyXG4gICAgcHVibGljIHNldHRpbmdzOiBJU2V0dGluZ3M7XHJcbiAgICBwdWJsaWMgdXNlcjogSVVzZXIgPSBuZXcgVXNlcigpO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVuZGVyU3RhdGU6IElSZW5kZXJTdGF0ZSA9IG5ldyBSZW5kZXJTdGF0ZSgpO1xyXG5cclxuICAgIHB1YmxpYyByZXBlYXRFZmZlY3RzOiBJUmVwZWF0RWZmZWN0cyA9IG5ldyBSZXBlYXRlRWZmZWN0cygpO1xyXG5cclxuICAgIHB1YmxpYyBzdGVwSGlzdG9yeTogSUhpc3RvcnkgPSBuZXcgU3RlcEhpc3RvcnkoKTtcclxufVxyXG5cclxuXHJcbiIsIlxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCB7IElIdHRwRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEZldGNoSXRlbVwiO1xyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4uL2h0dHAvZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnUmVuZGVyQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nT3V0bGluZUFjdGlvbnNcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi4vY29kZS9nT3V0bGluZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBnZXRHdWlkZU91dGxpbmUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyB8IG51bGwsXHJcbiAgICBsb2FkRGVsZWdhdGU6IChzdGF0ZTogSVN0YXRlLCBvdXRsaW5lUmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXlcclxuKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgQWN0aW9uVHlwZS5HZXRPdXRsaW5lXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICBjb25zdCBsb2FkUmVxdWVzdGVkID0gZ091dGxpbmVDb2RlLnJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHVybFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAobG9hZFJlcXVlc3RlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3BvbnNlOiAnanNvbicsXHJcbiAgICAgICAgYWN0aW9uOiBsb2FkRGVsZWdhdGUsXHJcbiAgICAgICAgZXJyb3I6IChzdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgb3V0bGluZSBkYXRhIGZyb20gdGhlIHNlcnZlci5cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUubmFtZX0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBnZXR0aW5nIG91dGxpbmUgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuXCIsXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z1JlbmRlckVmZmVjdHMuZ2V0R3VpZGVPdXRsaW5lLm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmNvbnN0IGdSZW5kZXJFZmZlY3RzID0ge1xyXG5cclxuICAgIGdldEd1aWRlT3V0bGluZTogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyA9IHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8uZ3VpZGUuZnJhZ21lbnRGb2xkZXJVcmwgPz8gJ251bGwnO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdSZW5kZXJBY3Rpb25zLmxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRHdWlkZU91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybCxcclxuICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0R3VpZGVPdXRsaW5lQW5kTG9hZFNlZ21lbnRzOiAoc3RhdGU6IElTdGF0ZSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5ndWlkZS5mcmFnbWVudEZvbGRlclVybCA/PyAnbnVsbCc7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1JlbmRlckFjdGlvbnMubG9hZEd1aWRlT3V0bGluZUFuZFNlZ21lbnRzKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRHdWlkZU91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybCxcclxuICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZW5kZXJFZmZlY3RzO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IFN0YXRlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9TdGF0ZVwiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ1JlbmRlckVmZmVjdHMgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9lZmZlY3RzL2dSZW5kZXJFZmZlY3RzXCI7XHJcbmltcG9ydCBnUmVuZGVyQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1JlbmRlckNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuXHJcblxyXG5jb25zdCBpbml0aWFsaXNlU3RhdGUgPSAoKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmUpIHtcclxuXHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdGF0ZTogSVN0YXRlID0gbmV3IFN0YXRlKCk7XHJcbiAgICBnUmVuZGVyQ29kZS5wYXJzZVJlbmRlcmluZ0NvbW1lbnQoc3RhdGUpO1xyXG5cclxuICAgIHJldHVybiBzdGF0ZTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkUmVuZGVyRGlzcGxheSA9IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290KSB7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uoc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290LmlLZXkpID09PSB0cnVlXHJcbiAgICAgICAgJiYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3Qub3B0aW9uc1xyXG4gICAgICAgICAgICB8fCBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3Qub3B0aW9ucy5sZW5ndGggPT09IDApXHJcbiAgICApIHtcclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUoc3RhdGUpXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRTZWdtZW50c1JlbmRlckRpc3BsYXkgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVlcnlTdHJpbmc6IHN0cmluZ1xyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPSB0cnVlO1xyXG5cclxuICAgIGdTZWdtZW50Q29kZS5wYXJzZVNlZ21lbnRzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHF1ZXJ5U3RyaW5nXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSB3YXMgb25seSAxIHNlZ21lbnRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBzZWdtZW50c1swXTtcclxuXHJcbiAgICBpZiAoIXJvb3RTZWdtZW50LnN0YXJ0LmlzUm9vdCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHdWlkZVJvb3Qgbm90IHByZXNlbnRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlyc3RTZWdtZW50ID0gc2VnbWVudHNbMV07XHJcblxyXG4gICAgaWYgKCFmaXJzdFNlZ21lbnQuc3RhcnQuaXNMYXN0XHJcbiAgICAgICAgJiYgZmlyc3RTZWdtZW50LnN0YXJ0LnR5cGUgIT09IE91dGxpbmVUeXBlLkxpbmtcclxuICAgICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcXVlcnkgc3RyaW5nIGZvcm1hdCAtIGl0IHNob3VsZCBzdGFydCB3aXRoICctJyBvciAnfidcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmVBbmRMb2FkU2VnbWVudHMoc3RhdGUpXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgaW5pdFN0YXRlID0ge1xyXG5cclxuICAgIGluaXRpYWxpc2U6ICgpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlOiBJU3RhdGUgPSBpbml0aWFsaXNlU3RhdGUoKTtcclxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZzogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UocXVlcnlTdHJpbmcpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkU2VnbWVudHNSZW5kZXJEaXNwbGF5KFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5U3RyaW5nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZW5kZXJEaXNwbGF5KHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGU6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgc3RhdGUuZ2VuZXJpY0Vycm9yID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdGF0ZTtcclxuXHJcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcblxyXG5cclxuY29uc3QgcmVuZGVyQ29tbWVudHMgPSB7XHJcblxyXG4gICAgcmVnaXN0ZXJHdWlkZUNvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdHJlZVNvbHZlR3VpZGU6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRmlsdGVycy50cmVlU29sdmVHdWlkZUlEKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRyZWVTb2x2ZUd1aWRlXHJcbiAgICAgICAgICAgICYmIHRyZWVTb2x2ZUd1aWRlLmhhc0NoaWxkTm9kZXMoKSA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGROb2RlOiBDaGlsZE5vZGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93LlRyZWVTb2x2ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudCA9IGNoaWxkTm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGROb2RlLm5vZGVUeXBlICE9PSBOb2RlLlRFWFRfTk9ERSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZW5kZXJDb21tZW50cztcclxuIiwiaW1wb3J0IHsgYXBwIH0gZnJvbSBcIi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgaW5pdFN1YnNjcmlwdGlvbnMgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvc3Vic2NyaXB0aW9ucy9pbml0U3Vic2NyaXB0aW9uc1wiO1xyXG5pbXBvcnQgaW5pdEV2ZW50cyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHNcIjtcclxuaW1wb3J0IGluaXRWaWV3IGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3ZpZXdzL2luaXRWaWV3XCI7XHJcbmltcG9ydCBpbml0U3RhdGUgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9pbml0U3RhdGVcIjtcclxuaW1wb3J0IHJlbmRlckNvbW1lbnRzIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvcmVuZGVyQ29tbWVudHNcIjtcclxuXHJcblxyXG5pbml0RXZlbnRzLnJlZ2lzdGVyR2xvYmFsRXZlbnRzKCk7XHJcbnJlbmRlckNvbW1lbnRzLnJlZ2lzdGVyR3VpZGVDb21tZW50KCk7XHJcblxyXG4od2luZG93IGFzIGFueSkuQ29tcG9zaXRlRmxvd3NBdXRob3IgPSBhcHAoe1xyXG4gICAgXHJcbiAgICBub2RlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRyZWVTb2x2ZUZyYWdtZW50c1wiKSxcclxuICAgIGluaXQ6IGluaXRTdGF0ZS5pbml0aWFsaXNlLFxyXG4gICAgdmlldzogaW5pdFZpZXcuYnVpbGRWaWV3LFxyXG4gICAgc3Vic2NyaXB0aW9uczogaW5pdFN1YnNjcmlwdGlvbnMsXHJcbiAgICBvbkVuZDogaW5pdEV2ZW50cy5vblJlbmRlckZpbmlzaGVkXHJcbn0pO1xyXG5cclxuXHJcbiJdLCJuYW1lcyI6WyJwcm9wcyIsImNvdW50Iiwib3V0cHV0IiwiVSIsImxvY2F0aW9uIiwiZWZmZWN0IiwiaHR0cEVmZmVjdCIsIkFjdGlvblR5cGUiLCJzdGF0ZSIsIl9zdGF0ZSIsIm9FbWJlZFBhcmFtZXRlcnMiLCJzZWxmIiwiV2Vha01hcCIsInRpbWVyIiwiYnVpbHRJblByb3AiLCJpZHgiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNjcmVlbmZ1bGwiLCJpbnRlcnZhbCIsIlBhcnNlVHlwZSIsIk91dGxpbmVUeXBlIiwiU2Nyb2xsSG9wVHlwZSIsIm91dGxpbmVSZXNwb25zZSIsIm5hdmlnYXRpb25EaXJlY3Rpb24iLCJTdGVwSGlzdG9yeSIsImdSZW5kZXJBY3Rpb25zIl0sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFJLGdCQUFnQjtBQUNwQixJQUFJLFlBQVk7QUFDaEIsSUFBSSxZQUFZO0FBQ2hCLElBQUksWUFBWSxDQUFBO0FBQ2hCLElBQUksWUFBWSxDQUFBO0FBQ2hCLElBQUksTUFBTSxVQUFVO0FBQ3BCLElBQUksVUFBVSxNQUFNO0FBQ3BCLElBQUksUUFDRixP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
