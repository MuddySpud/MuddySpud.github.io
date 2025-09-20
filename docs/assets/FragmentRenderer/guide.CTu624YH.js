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
      return effect2.name === name;
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
const getEffect = (state, httpEffect2, effects) => {
  const url = httpEffect2.url;
  const callID = gUtilities.generateGuid();
  let headers = gAjaxHeaderCode.buildHeaders(
    state,
    callID,
    ActionType.GetStep
  );
  const effect = gAuthenticatedHttp({
    url,
    parseType: httpEffect2.parseType,
    options: {
      method: "GET",
      headers
    },
    response: "json",
    action: httpEffect2.actionDelegate,
    error: (_state, errorDetails) => {
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
const onRenderFinished = () => {
  onFragmentsRenderFinished();
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
    __publicField(this, "topLevelMapKey", "");
    __publicField(this, "mapKeyChain", "");
    __publicField(this, "guideID", "");
    __publicField(this, "guidePath", "");
    __publicField(this, "parentFragmentID");
    __publicField(this, "value", "");
    __publicField(this, "selected", null);
    __publicField(this, "isLeaf", false);
    __publicField(this, "options", []);
    __publicField(this, "variable", []);
    __publicField(this, "option", "");
    __publicField(this, "isAncillary", false);
    __publicField(this, "order", 0);
    __publicField(this, "link", null);
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
  constructor(path) {
    __publicField(this, "path");
    __publicField(this, "loaded", false);
    __publicField(this, "v", "");
    __publicField(this, "r", new RenderOutlineNode());
    __publicField(this, "c", []);
    __publicField(this, "e");
    __publicField(this, "mv");
    this.path = path;
  }
}
class RenderOutlineChart {
  constructor() {
    __publicField(this, "i", "");
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
  guide.fragmentFolderUrl = gRenderCode.getFragmentFolderUrl(rawGuide.fragmentFolderPath);
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
  getFragmentFolderUrl: (folderPath) => {
    let divider = "";
    if (!gUtilities.isNullOrWhiteSpace(folderPath)) {
      if (!location.origin.endsWith("/")) {
        if (!folderPath.startsWith("/")) {
          divider = "/";
        }
      } else {
        if (folderPath.startsWith("/") === true) {
          folderPath = folderPath.substring(1);
        }
      }
      return `${location.origin}${divider}${folderPath}`;
    }
    return null;
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
const loadNode = (state, rawNode, linkID, parent = null) => {
  const node = new RenderOutlineNode();
  node.i = rawNode.i;
  node.c = rawNode.c ?? null;
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
    const guideOutline = gOutlineCode.getOutline(
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
  setChartAsCurrent: (state, displaySection) => {
    state.renderState.currentSection = displaySection;
  },
  getOutline: (state, fragmentFolderUrl) => {
    let outline = state.renderState.outlines[fragmentFolderUrl];
    if (outline) {
      return outline;
    }
    outline = new RenderOutline(fragmentFolderUrl);
    state.renderState.outlines[fragmentFolderUrl] = outline;
    return outline;
  },
  getFragmentLinkChartOutline: (state, fragment) => {
    const outline = fragment.section.outline;
    if (!outline) {
      return;
    }
    const outlineNode = gStateCode.getCached_outlineNode(
      state,
      fragment.section.linkID,
      fragment.id
    );
    if ((outlineNode == null ? void 0 : outlineNode.c) == null) {
      return;
    }
    const outlineChart = gOutlineCode.getOutlineChart(
      outline,
      outlineNode == null ? void 0 : outlineNode.c
    );
    gOutlineCode.getOutlineFromChart_subscription(
      state,
      outlineChart,
      fragment
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
    const outlineChartPath = chart == null ? void 0 : chart.p;
    const fragmentFolderUrl = gRenderCode.getFragmentFolderUrl(outlineChartPath);
    if (!gUtilities.isNullOrWhiteSpace(fragmentFolderUrl)) {
      const outline = gOutlineCode.getOutline(
        state,
        fragmentFolderUrl
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
    const outlineChartPath = chart == null ? void 0 : chart.p;
    const fragmentFolderUrl = gRenderCode.getFragmentFolderUrl(outlineChartPath);
    if (!gUtilities.isNullOrWhiteSpace(fragmentFolderUrl)) {
      const outline = gOutlineCode.getOutline(
        state,
        fragmentFolderUrl
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
  }
};
const getFragment = (state, fragmentID, fragmentPath, action, loadAction) => {
  if (!state) {
    return;
  }
  const callID = gUtilities.generateGuid();
  let headers = gAjaxHeaderCode.buildHeaders(
    state,
    callID,
    action
  );
  const url = `${fragmentPath}`;
  return gAuthenticatedHttp({
    url,
    parseType: "text",
    options: {
      method: "GET",
      headers
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
    gFragmentCode.getLinkOutline_subscripion(
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
        gOutlineCode.getFragmentLinkChartOutline(
          state,
          fragment
        );
      }
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
    if (optionsAndAncillaries.options.length === 1 && optionsAndAncillaries.options[0].option === "" && gUtilities.isNullOrWhiteSpace(fragment.iKey) && gUtilities.isNullOrWhiteSpace(fragment.exitKey)) {
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
    fragment.guidePath = rawFragment.guidePath ?? "";
    fragment.iKey = rawFragment.iKey ?? null;
    fragment.exitKey = rawFragment.exitKey ?? null;
    fragment.variable = rawFragment.variable ?? null;
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
    gStateCode.setDirty(state);
    return gFragmentActions.showOptionNode(
      state,
      payload.parentFragment,
      payload.option
    );
  },
  toggleAncillaryNode: (state, payload) => {
    if (!state || !(payload == null ? void 0 : payload.option)) {
      return state;
    }
    const ancillary = payload.option;
    gStateCode.setDirty(state);
    if (!ancillary.ui.ancillaryExpanded) {
      ancillary.ui.ancillaryExpanded = true;
      return gFragmentActions.showAncillaryNode(
        state,
        payload.option
      );
    }
    ancillary.ui.ancillaryExpanded = false;
    return gStateCode.cloneState(state);
  }
};
class FragmentPayload {
  constructor(parentFragment, option) {
    __publicField(this, "parentFragment");
    __publicField(this, "option");
    this.parentFragment = parentFragment;
    this.option = option;
  }
}
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
          class: "nt-fr-ancillary",
          onMouseDown: [
            fragmentActions.toggleAncillaryNode,
            (_event) => {
              return new FragmentPayload(
                parent,
                ancillary
              );
            }
          ]
        },
        [
          h("span", { class: "nt-fr-ancillary-text" }, ancillary.option),
          h("span", { class: "nt-fr-ancillary-x" }, "✕")
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
          class: "nt-fr-ancillary",
          onMouseDown: [
            fragmentActions.toggleAncillaryNode,
            (_event) => {
              return new FragmentPayload(
                parent,
                ancillary
              );
            }
          ]
        },
        [
          h("span", {}, ancillary.option)
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
  if (!option || option.isAncillary === true) {
    return null;
  }
  const view = h(
    "div",
    { class: "nt-fr-option-box" },
    [
      h(
        "a",
        {
          class: "nt-fr-option",
          onMouseDown: [
            fragmentActions.showOptionNode,
            (_event) => {
              return new FragmentPayload(
                parent,
                option
              );
            }
          ]
        },
        [
          h("span", {}, option.option)
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
  views.push(
    h(
      "div",
      {
        id: `${fragmentELementID}_eo`,
        class: "nt-fr-fragment-box"
      },
      [
        optionsView.view
      ]
    )
  );
};
const buildCollapsedOptionsView = (fragment) => {
  var _a;
  const view = h(
    "a",
    {
      class: `nt-fr-fragment-options nt-fr-collapsed`,
      onMouseDown: [
        fragmentActions.expandOptions,
        (_event) => fragment
      ]
    },
    [
      h("span", { class: `nt-fr-option-selected` }, `${(_a = fragment.selected) == null ? void 0 : _a.option}`)
    ]
  );
  return view;
};
const buildCollapsedOptionsBoxView = (fragment, fragmentELementID, views) => {
  const optionView = buildCollapsedOptionsView(fragment);
  const view = h(
    "div",
    {
      id: `${fragmentELementID}_co`,
      class: "nt-fr-fragment-box"
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
  const view = h(
    "div",
    {
      id: `${fragmentELementID}_a`,
      class: "nt-fr-fragment-box"
    },
    [
      ancillariesView
    ]
  );
  const viewAny = view;
  if (!viewAny.ui) {
    viewAny.ui = {};
  }
  viewAny.ui.priorIsAncillary = true;
  views.push(view);
};
const buildOptionsView = (fragment, options) => {
  if (options.length === 0) {
    return null;
  }
  if (options.length === 1 && options[0].option === "") {
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
  if (options.length === 1 && options[0].option === "") {
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
        optionsCollapsed: false
      };
    }
    if (fragment.options.length === 1 && fragment.options[0].option === "") {
      return {
        views: [],
        optionsCollapsed: false
      };
    }
    const optionsAndAncillaries = gFragmentCode.splitOptionsAndAncillaries(fragment.options);
    const views = [
      buildAncillariesView(
        fragment,
        optionsAndAncillaries.ancillaries
      )
    ];
    const optionsViewResults = buildOptionsView(
      fragment,
      optionsAndAncillaries.options
    );
    if (optionsViewResults) {
      views.push(optionsViewResults.view);
    }
    return {
      views,
      optionsCollapsed: (optionsViewResults == null ? void 0 : optionsViewResults.isCollapsed) ?? false
    };
  },
  buildView2: (fragment, views) => {
    if (!fragment.options || fragment.options.length === 0 || !gUtilities.isNullOrWhiteSpace(fragment.iKey)) {
      return;
    }
    if (fragment.options.length === 1 && fragment.options[0].option === "") {
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
    if (((_b = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _b.priorIsAncillary) === true) {
      adjustForPriorAncillaries = true;
    }
  }
  const linkELementID = gFragmentCode.getLinkElementID(fragment.id);
  const results = optionsViews.buildView(fragment);
  if (linkELementID === "nt_lk_frag_t968OJ1wo") {
    console.log(`R-DRAWING ${linkELementID}_l`);
  }
  const view = h(
    "div",
    {
      id: `${linkELementID}_l`,
      class: {
        "nt-fr-fragment-box": true,
        "nt-fr-prior-collapsed-options": adjustForCollapsedOptions === true,
        "nt-fr-prior-is-ancillary": adjustForPriorAncillaries === true
      }
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
    if (((_b = lastView == null ? void 0 : lastView.ui) == null ? void 0 : _b.priorIsAncillary) === true) {
      adjustForPriorAncillaries = true;
    }
  }
  const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);
  views.push(
    h(
      "div",
      {
        id: `${fragmentELementID}_d`,
        class: {
          "nt-fr-fragment-box": true,
          "nt-fr-prior-collapsed-options": adjustForCollapsedOptions === true,
          "nt-fr-prior-is-ancillary": adjustForPriorAncillaries === true
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpZGUuQ1R1NjI0WUguanMiLCJzb3VyY2VzIjpbIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL3RpbWUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dIdHRwLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nVXRpbGl0aWVzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnlVcmwudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dIaXN0b3J5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvaHR0cC9nQWpheEhlYWRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkVmZmVjdHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkh0dHAudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdWJzY3JpcHRpb25zL3JlcGVhdFN1YnNjcmlwdGlvbi50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy9jb2RlL29uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL29uUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9hY3Rpb25zL2luaXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyRnJhZ21lbnRVSS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckZyYWdtZW50LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZU5vZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9kaXNwbGF5L0Rpc3BsYXlHdWlkZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckd1aWRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1Njcm9sbEhvcFR5cGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9TY3JlZW4udHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9UcmVlU29sdmUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nRmlsZUNvbnN0YW50cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1JlbmRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9zZWdtZW50cy9DaGFpblNlZ21lbnQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3NlZ21lbnRzL1NlZ21lbnROb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nU2VnbWVudENvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dPdXRsaW5lQWN0aW9ucy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ091dGxpbmVDb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nRnJhZ21lbnRFZmZlY3RzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nSG9va1JlZ2lzdHJ5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvYWN0aW9ucy9mcmFnbWVudEFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VpL3BheWxvYWRzL0ZyYWdtZW50UGF5bG9hZC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvdmlld3Mvb3B0aW9uc1ZpZXdzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy92aWV3cy9saW5rVmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2ZyYWdtZW50Vmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2d1aWRlVmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlldy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdXNlci9TZXR0aW5ncy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9uYXZpZ2F0aW9uRGlyZWN0aW9uLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnkudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VzZXIvVXNlci50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvZWZmZWN0cy9SZXBlYXRlRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyU3RhdGVVSS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvUmVuZGVyU3RhdGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL1N0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nUmVuZGVyRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9yZW5kZXJDb21tZW50cy50cyIsIi4uL3Jvb3Qvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBSRUNZQ0xFRF9OT0RFID0gMVxyXG52YXIgTEFaWV9OT0RFID0gMlxyXG52YXIgVEVYVF9OT0RFID0gM1xyXG52YXIgRU1QVFlfT0JKID0ge31cclxudmFyIEVNUFRZX0FSUiA9IFtdXHJcbnZhciBtYXAgPSBFTVBUWV9BUlIubWFwXHJcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxyXG52YXIgZGVmZXIgPVxyXG4gIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09IFwidW5kZWZpbmVkXCJcclxuICAgID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgICA6IHNldFRpbWVvdXRcclxuXHJcbnZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uKG9iaikge1xyXG4gIHZhciBvdXQgPSBcIlwiXHJcblxyXG4gIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSByZXR1cm4gb2JqXHJcblxyXG4gIGlmIChpc0FycmF5KG9iaikgJiYgb2JqLmxlbmd0aCA+IDApIHtcclxuICAgIGZvciAodmFyIGsgPSAwLCB0bXA7IGsgPCBvYmoubGVuZ3RoOyBrKyspIHtcclxuICAgICAgaWYgKCh0bXAgPSBjcmVhdGVDbGFzcyhvYmpba10pKSAhPT0gXCJcIikge1xyXG4gICAgICAgIG91dCArPSAob3V0ICYmIFwiIFwiKSArIHRtcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmpba10pIHtcclxuICAgICAgICBvdXQgKz0gKG91dCAmJiBcIiBcIikgKyBrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxudmFyIG1lcmdlID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIHZhciBvdXQgPSB7fVxyXG5cclxuICBmb3IgKHZhciBrIGluIGEpIG91dFtrXSA9IGFba11cclxuICBmb3IgKHZhciBrIGluIGIpIG91dFtrXSA9IGJba11cclxuXHJcbiAgcmV0dXJuIG91dFxyXG59XHJcblxyXG52YXIgYmF0Y2ggPSBmdW5jdGlvbihsaXN0KSB7XHJcbiAgcmV0dXJuIGxpc3QucmVkdWNlKGZ1bmN0aW9uKG91dCwgaXRlbSkge1xyXG4gICAgcmV0dXJuIG91dC5jb25jYXQoXHJcbiAgICAgICFpdGVtIHx8IGl0ZW0gPT09IHRydWVcclxuICAgICAgICA/IDBcclxuICAgICAgICA6IHR5cGVvZiBpdGVtWzBdID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgICA/IFtpdGVtXVxyXG4gICAgICAgIDogYmF0Y2goaXRlbSlcclxuICAgIClcclxuICB9LCBFTVBUWV9BUlIpXHJcbn1cclxuXHJcbnZhciBpc1NhbWVBY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgcmV0dXJuIGlzQXJyYXkoYSkgJiYgaXNBcnJheShiKSAmJiBhWzBdID09PSBiWzBdICYmIHR5cGVvZiBhWzBdID09PSBcImZ1bmN0aW9uXCJcclxufVxyXG5cclxudmFyIHNob3VsZFJlc3RhcnQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgaWYgKGEgIT09IGIpIHtcclxuICAgIGZvciAodmFyIGsgaW4gbWVyZ2UoYSwgYikpIHtcclxuICAgICAgaWYgKGFba10gIT09IGJba10gJiYgIWlzU2FtZUFjdGlvbihhW2tdLCBiW2tdKSkgcmV0dXJuIHRydWVcclxuICAgICAgYltrXSA9IGFba11cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnZhciBwYXRjaFN1YnMgPSBmdW5jdGlvbihvbGRTdWJzLCBuZXdTdWJzLCBkaXNwYXRjaCkge1xyXG4gIGZvciAoXHJcbiAgICB2YXIgaSA9IDAsIG9sZFN1YiwgbmV3U3ViLCBzdWJzID0gW107XHJcbiAgICBpIDwgb2xkU3Vicy5sZW5ndGggfHwgaSA8IG5ld1N1YnMubGVuZ3RoO1xyXG4gICAgaSsrXHJcbiAgKSB7XHJcbiAgICBvbGRTdWIgPSBvbGRTdWJzW2ldXHJcbiAgICBuZXdTdWIgPSBuZXdTdWJzW2ldXHJcbiAgICBzdWJzLnB1c2goXHJcbiAgICAgIG5ld1N1YlxyXG4gICAgICAgID8gIW9sZFN1YiB8fFxyXG4gICAgICAgICAgbmV3U3ViWzBdICE9PSBvbGRTdWJbMF0gfHxcclxuICAgICAgICAgIHNob3VsZFJlc3RhcnQobmV3U3ViWzFdLCBvbGRTdWJbMV0pXHJcbiAgICAgICAgICA/IFtcclxuICAgICAgICAgICAgICBuZXdTdWJbMF0sXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzFdLFxyXG4gICAgICAgICAgICAgIG5ld1N1YlswXShkaXNwYXRjaCwgbmV3U3ViWzFdKSxcclxuICAgICAgICAgICAgICBvbGRTdWIgJiYgb2xkU3ViWzJdKClcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgOiBvbGRTdWJcclxuICAgICAgICA6IG9sZFN1YiAmJiBvbGRTdWJbMl0oKVxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4gc3Vic1xyXG59XHJcblxyXG52YXIgcGF0Y2hQcm9wZXJ0eSA9IGZ1bmN0aW9uKG5vZGUsIGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICBpZiAoa2V5ID09PSBcImtleVwiKSB7XHJcbiAgfSBlbHNlIGlmIChrZXkgPT09IFwic3R5bGVcIikge1xyXG4gICAgZm9yICh2YXIgayBpbiBtZXJnZShvbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XHJcbiAgICAgIG9sZFZhbHVlID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZVtrXSA9PSBudWxsID8gXCJcIiA6IG5ld1ZhbHVlW2tdXHJcbiAgICAgIGlmIChrWzBdID09PSBcIi1cIikge1xyXG4gICAgICAgIG5vZGVba2V5XS5zZXRQcm9wZXJ0eShrLCBvbGRWYWx1ZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2RlW2tleV1ba10gPSBvbGRWYWx1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChrZXlbMF0gPT09IFwib1wiICYmIGtleVsxXSA9PT0gXCJuXCIpIHtcclxuICAgIGlmIChcclxuICAgICAgISgobm9kZS5hY3Rpb25zIHx8IChub2RlLmFjdGlvbnMgPSB7fSkpW1xyXG4gICAgICAgIChrZXkgPSBrZXkuc2xpY2UoMikudG9Mb3dlckNhc2UoKSlcclxuICAgICAgXSA9IG5ld1ZhbHVlKVxyXG4gICAgKSB7XHJcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKVxyXG4gICAgfSBlbHNlIGlmICghb2xkVmFsdWUpIHtcclxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGtleSwgbGlzdGVuZXIpXHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICghaXNTdmcgJiYga2V5ICE9PSBcImxpc3RcIiAmJiBrZXkgaW4gbm9kZSkge1xyXG4gICAgbm9kZVtrZXldID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZSA9PSBcInVuZGVmaW5lZFwiID8gXCJcIiA6IG5ld1ZhbHVlXHJcbiAgfSBlbHNlIGlmIChcclxuICAgIG5ld1ZhbHVlID09IG51bGwgfHxcclxuICAgIG5ld1ZhbHVlID09PSBmYWxzZSB8fFxyXG4gICAgKGtleSA9PT0gXCJjbGFzc1wiICYmICEobmV3VmFsdWUgPSBjcmVhdGVDbGFzcyhuZXdWYWx1ZSkpKVxyXG4gICkge1xyXG4gICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxyXG4gIH0gZWxzZSB7XHJcbiAgICBub2RlLnNldEF0dHJpYnV0ZShrZXksIG5ld1ZhbHVlKVxyXG4gIH1cclxufVxyXG5cclxudmFyIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbih2ZG9tLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICB2YXIgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcclxuICB2YXIgcHJvcHMgPSB2ZG9tLnByb3BzXHJcbiAgdmFyIG5vZGUgPVxyXG4gICAgdmRvbS50eXBlID09PSBURVhUX05PREVcclxuICAgICAgPyBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2ZG9tLm5hbWUpXHJcbiAgICAgIDogKGlzU3ZnID0gaXNTdmcgfHwgdmRvbS5uYW1lID09PSBcInN2Z1wiKVxyXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG4gICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG5cclxuICBmb3IgKHZhciBrIGluIHByb3BzKSB7XHJcbiAgICBwYXRjaFByb3BlcnR5KG5vZGUsIGssIG51bGwsIHByb3BzW2tdLCBsaXN0ZW5lciwgaXNTdmcpXHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmRvbS5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgbm9kZS5hcHBlbmRDaGlsZChcclxuICAgICAgY3JlYXRlTm9kZShcclxuICAgICAgICAodmRvbS5jaGlsZHJlbltpXSA9IGdldFZOb2RlKHZkb20uY2hpbGRyZW5baV0pKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICByZXR1cm4gKHZkb20ubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBnZXRLZXkgPSBmdW5jdGlvbih2ZG9tKSB7XHJcbiAgcmV0dXJuIHZkb20gPT0gbnVsbCA/IG51bGwgOiB2ZG9tLmtleVxyXG59XHJcblxyXG52YXIgcGF0Y2ggPSBmdW5jdGlvbihwYXJlbnQsIG5vZGUsIG9sZFZOb2RlLCBuZXdWTm9kZSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgaWYgKG9sZFZOb2RlID09PSBuZXdWTm9kZSkge1xyXG4gIH0gZWxzZSBpZiAoXHJcbiAgICBvbGRWTm9kZSAhPSBudWxsICYmXHJcbiAgICBvbGRWTm9kZS50eXBlID09PSBURVhUX05PREUgJiZcclxuICAgIG5ld1ZOb2RlLnR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICkge1xyXG4gICAgaWYgKG9sZFZOb2RlLm5hbWUgIT09IG5ld1ZOb2RlLm5hbWUpIG5vZGUubm9kZVZhbHVlID0gbmV3Vk5vZGUubmFtZVxyXG4gIH0gZWxzZSBpZiAob2xkVk5vZGUgPT0gbnVsbCB8fCBvbGRWTm9kZS5uYW1lICE9PSBuZXdWTm9kZS5uYW1lKSB7XHJcbiAgICBub2RlID0gcGFyZW50Lmluc2VydEJlZm9yZShcclxuICAgICAgY3JlYXRlTm9kZSgobmV3Vk5vZGUgPSBnZXRWTm9kZShuZXdWTm9kZSkpLCBsaXN0ZW5lciwgaXNTdmcpLFxyXG4gICAgICBub2RlXHJcbiAgICApXHJcbiAgICBpZiAob2xkVk5vZGUgIT0gbnVsbCkge1xyXG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQob2xkVk5vZGUubm9kZSlcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIHRtcFZLaWRcclxuICAgIHZhciBvbGRWS2lkXHJcblxyXG4gICAgdmFyIG9sZEtleVxyXG4gICAgdmFyIG5ld0tleVxyXG5cclxuICAgIHZhciBvbGRWUHJvcHMgPSBvbGRWTm9kZS5wcm9wc1xyXG4gICAgdmFyIG5ld1ZQcm9wcyA9IG5ld1ZOb2RlLnByb3BzXHJcblxyXG4gICAgdmFyIG9sZFZLaWRzID0gb2xkVk5vZGUuY2hpbGRyZW5cclxuICAgIHZhciBuZXdWS2lkcyA9IG5ld1ZOb2RlLmNoaWxkcmVuXHJcblxyXG4gICAgdmFyIG9sZEhlYWQgPSAwXHJcbiAgICB2YXIgbmV3SGVhZCA9IDBcclxuICAgIHZhciBvbGRUYWlsID0gb2xkVktpZHMubGVuZ3RoIC0gMVxyXG4gICAgdmFyIG5ld1RhaWwgPSBuZXdWS2lkcy5sZW5ndGggLSAxXHJcblxyXG4gICAgaXNTdmcgPSBpc1N2ZyB8fCBuZXdWTm9kZS5uYW1lID09PSBcInN2Z1wiXHJcblxyXG4gICAgZm9yICh2YXIgaSBpbiBtZXJnZShvbGRWUHJvcHMsIG5ld1ZQcm9wcykpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChpID09PSBcInZhbHVlXCIgfHwgaSA9PT0gXCJzZWxlY3RlZFwiIHx8IGkgPT09IFwiY2hlY2tlZFwiXHJcbiAgICAgICAgICA/IG5vZGVbaV1cclxuICAgICAgICAgIDogb2xkVlByb3BzW2ldKSAhPT0gbmV3VlByb3BzW2ldXHJcbiAgICAgICkge1xyXG4gICAgICAgIHBhdGNoUHJvcGVydHkobm9kZSwgaSwgb2xkVlByb3BzW2ldLCBuZXdWUHJvcHNbaV0sIGxpc3RlbmVyLCBpc1N2ZylcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwgJiYgb2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAob2xkS2V5ID0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWRdKSkgPT0gbnVsbCB8fFxyXG4gICAgICAgIG9sZEtleSAhPT0gZ2V0S2V5KG5ld1ZLaWRzW25ld0hlYWRdKVxyXG4gICAgICApIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaChcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZEhlYWRdLm5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0sXHJcbiAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUoXHJcbiAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkKytdLFxyXG4gICAgICAgICAgb2xkVktpZHNbb2xkSGVhZCsrXVxyXG4gICAgICAgICkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsICYmIG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKG9sZEtleSA9IGdldEtleShvbGRWS2lkc1tvbGRUYWlsXSkpID09IG51bGwgfHxcclxuICAgICAgICBvbGRLZXkgIT09IGdldEtleShuZXdWS2lkc1tuZXdUYWlsXSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGF0Y2goXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRUYWlsXS5ub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLFxyXG4gICAgICAgIChuZXdWS2lkc1tuZXdUYWlsXSA9IGdldFZOb2RlKFxyXG4gICAgICAgICAgbmV3VktpZHNbbmV3VGFpbC0tXSxcclxuICAgICAgICAgIG9sZFZLaWRzW29sZFRhaWwtLV1cclxuICAgICAgICApKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9sZEhlYWQgPiBvbGRUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwpIHtcclxuICAgICAgICBub2RlLmluc2VydEJlZm9yZShcclxuICAgICAgICAgIGNyZWF0ZU5vZGUoXHJcbiAgICAgICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKG5ld1ZLaWRzW25ld0hlYWQrK10pKSxcclxuICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkXSkgJiYgb2xkVktpZC5ub2RlXHJcbiAgICAgICAgKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG5ld0hlYWQgPiBuZXdUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWRzW29sZEhlYWQrK10ubm9kZSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IG9sZEhlYWQsIGtleWVkID0ge30sIG5ld0tleWVkID0ge307IGkgPD0gb2xkVGFpbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKChvbGRLZXkgPSBvbGRWS2lkc1tpXS5rZXkpICE9IG51bGwpIHtcclxuICAgICAgICAgIGtleWVkW29sZEtleV0gPSBvbGRWS2lkc1tpXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCkge1xyXG4gICAgICAgIG9sZEtleSA9IGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWRdKSlcclxuICAgICAgICBuZXdLZXkgPSBnZXRLZXkoXHJcbiAgICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShuZXdWS2lkc1tuZXdIZWFkXSwgb2xkVktpZCkpXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICBuZXdLZXllZFtvbGRLZXldIHx8XHJcbiAgICAgICAgICAobmV3S2V5ICE9IG51bGwgJiYgbmV3S2V5ID09PSBnZXRLZXkob2xkVktpZHNbb2xkSGVhZCArIDFdKSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWQubm9kZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdLZXkgPT0gbnVsbCB8fCBvbGRWTm9kZS50eXBlID09PSBSRUNZQ0xFRF9OT0RFKSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLFxyXG4gICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgbmV3SGVhZCsrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XHJcbiAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQsXHJcbiAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBuZXdLZXllZFtuZXdLZXldID0gdHJ1ZVxyXG4gICAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICgodG1wVktpZCA9IGtleWVkW25ld0tleV0pICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZSh0bXBWS2lkLm5vZGUsIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlKSxcclxuICAgICAgICAgICAgICAgIHRtcFZLaWQsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgbmV3S2V5ZWRbbmV3S2V5XSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5ld0hlYWQrK1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICAgIGlmIChnZXRLZXkoKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkKytdKSkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBpIGluIGtleWVkKSB7XHJcbiAgICAgICAgaWYgKG5ld0tleWVkW2ldID09IG51bGwpIHtcclxuICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQoa2V5ZWRbaV0ubm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiAobmV3Vk5vZGUubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBwcm9wc0NoYW5nZWQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgZm9yICh2YXIgayBpbiBhKSBpZiAoYVtrXSAhPT0gYltrXSkgcmV0dXJuIHRydWVcclxuICBmb3IgKHZhciBrIGluIGIpIGlmIChhW2tdICE9PSBiW2tdKSByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG52YXIgZ2V0VGV4dFZOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gIHJldHVybiB0eXBlb2Ygbm9kZSA9PT0gXCJvYmplY3RcIiA/IG5vZGUgOiBjcmVhdGVUZXh0Vk5vZGUobm9kZSlcclxufVxyXG5cclxudmFyIGdldFZOb2RlID0gZnVuY3Rpb24obmV3Vk5vZGUsIG9sZFZOb2RlKSB7XHJcbiAgcmV0dXJuIG5ld1ZOb2RlLnR5cGUgPT09IExBWllfTk9ERVxyXG4gICAgPyAoKCFvbGRWTm9kZSB8fCAhb2xkVk5vZGUubGF6eSB8fCBwcm9wc0NoYW5nZWQob2xkVk5vZGUubGF6eSwgbmV3Vk5vZGUubGF6eSkpXHJcbiAgICAgICAgJiYgKChvbGRWTm9kZSA9IGdldFRleHRWTm9kZShuZXdWTm9kZS5sYXp5LnZpZXcobmV3Vk5vZGUubGF6eSkpKS5sYXp5ID1cclxuICAgICAgICAgIG5ld1ZOb2RlLmxhenkpLFxyXG4gICAgICBvbGRWTm9kZSlcclxuICAgIDogbmV3Vk5vZGVcclxufVxyXG5cclxudmFyIGNyZWF0ZVZOb2RlID0gZnVuY3Rpb24obmFtZSwgcHJvcHMsIGNoaWxkcmVuLCBub2RlLCBrZXksIHR5cGUpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogbmFtZSxcclxuICAgIHByb3BzOiBwcm9wcyxcclxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgIG5vZGU6IG5vZGUsXHJcbiAgICB0eXBlOiB0eXBlLFxyXG4gICAga2V5OiBrZXlcclxuICB9XHJcbn1cclxuXHJcbnZhciBjcmVhdGVUZXh0Vk5vZGUgPSBmdW5jdGlvbih2YWx1ZSwgbm9kZSkge1xyXG4gIHJldHVybiBjcmVhdGVWTm9kZSh2YWx1ZSwgRU1QVFlfT0JKLCBFTVBUWV9BUlIsIG5vZGUsIHVuZGVmaW5lZCwgVEVYVF9OT0RFKVxyXG59XHJcblxyXG52YXIgcmVjeWNsZU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICAgPyBjcmVhdGVUZXh0Vk5vZGUobm9kZS5ub2RlVmFsdWUsIG5vZGUpXHJcbiAgICA6IGNyZWF0ZVZOb2RlKFxyXG4gICAgICAgIG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBFTVBUWV9PQkosXHJcbiAgICAgICAgbWFwLmNhbGwobm9kZS5jaGlsZE5vZGVzLCByZWN5Y2xlTm9kZSksXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICB1bmRlZmluZWQsXHJcbiAgICAgICAgUkVDWUNMRURfTk9ERVxyXG4gICAgICApXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgTGF6eSA9IGZ1bmN0aW9uKHByb3BzKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGxhenk6IHByb3BzLFxyXG4gICAgdHlwZTogTEFaWV9OT0RFXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIGggPSBmdW5jdGlvbihuYW1lLCBwcm9wcykge1xyXG4gIGZvciAodmFyIHZkb20sIHJlc3QgPSBbXSwgY2hpbGRyZW4gPSBbXSwgaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkge1xyXG4gICAgcmVzdC5wdXNoKGFyZ3VtZW50c1tpXSlcclxuICB9XHJcblxyXG4gIHdoaWxlIChyZXN0Lmxlbmd0aCA+IDApIHtcclxuICAgIGlmIChpc0FycmF5KCh2ZG9tID0gcmVzdC5wb3AoKSkpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSB2ZG9tLmxlbmd0aDsgaS0tID4gMDsgKSB7XHJcbiAgICAgICAgcmVzdC5wdXNoKHZkb21baV0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodmRvbSA9PT0gZmFsc2UgfHwgdmRvbSA9PT0gdHJ1ZSB8fCB2ZG9tID09IG51bGwpIHtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goZ2V0VGV4dFZOb2RlKHZkb20pKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvcHMgPSBwcm9wcyB8fCBFTVBUWV9PQkpcclxuXHJcbiAgcmV0dXJuIHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCJcclxuICAgID8gbmFtZShwcm9wcywgY2hpbGRyZW4pXHJcbiAgICA6IGNyZWF0ZVZOb2RlKG5hbWUsIHByb3BzLCBjaGlsZHJlbiwgdW5kZWZpbmVkLCBwcm9wcy5rZXkpXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgYXBwID0gZnVuY3Rpb24ocHJvcHMpIHtcclxuICB2YXIgc3RhdGUgPSB7fVxyXG4gIHZhciBsb2NrID0gZmFsc2VcclxuICB2YXIgdmlldyA9IHByb3BzLnZpZXdcclxuICB2YXIgbm9kZSA9IHByb3BzLm5vZGVcclxuICB2YXIgdmRvbSA9IG5vZGUgJiYgcmVjeWNsZU5vZGUobm9kZSlcclxuICB2YXIgc3Vic2NyaXB0aW9ucyA9IHByb3BzLnN1YnNjcmlwdGlvbnNcclxuICB2YXIgc3VicyA9IFtdXHJcbiAgdmFyIG9uRW5kID0gcHJvcHMub25FbmRcclxuXHJcbiAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGRpc3BhdGNoKHRoaXMuYWN0aW9uc1tldmVudC50eXBlXSwgZXZlbnQpXHJcbiAgfVxyXG5cclxuICB2YXIgc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xyXG4gICAgaWYgKHN0YXRlICE9PSBuZXdTdGF0ZSkge1xyXG4gICAgICBzdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XHJcbiAgICAgICAgc3VicyA9IHBhdGNoU3VicyhzdWJzLCBiYXRjaChbc3Vic2NyaXB0aW9ucyhzdGF0ZSldKSwgZGlzcGF0Y2gpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHZpZXcgJiYgIWxvY2spIGRlZmVyKHJlbmRlciwgKGxvY2sgPSB0cnVlKSlcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZVxyXG4gIH1cclxuXHJcbiAgdmFyIGRpc3BhdGNoID0gKHByb3BzLm1pZGRsZXdhcmUgfHxcclxuICAgIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gb2JqXHJcbiAgICB9KShmdW5jdGlvbihhY3Rpb24sIHByb3BzKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgID8gZGlzcGF0Y2goYWN0aW9uKHN0YXRlLCBwcm9wcykpXHJcbiAgICAgIDogaXNBcnJheShhY3Rpb24pXHJcbiAgICAgID8gdHlwZW9mIGFjdGlvblswXSA9PT0gXCJmdW5jdGlvblwiIHx8IGlzQXJyYXkoYWN0aW9uWzBdKVxyXG4gICAgICAgID8gZGlzcGF0Y2goXHJcbiAgICAgICAgICAgIGFjdGlvblswXSxcclxuICAgICAgICAgICAgdHlwZW9mIGFjdGlvblsxXSA9PT0gXCJmdW5jdGlvblwiID8gYWN0aW9uWzFdKHByb3BzKSA6IGFjdGlvblsxXVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIDogKGJhdGNoKGFjdGlvbi5zbGljZSgxKSkubWFwKGZ1bmN0aW9uKGZ4KSB7XHJcbiAgICAgICAgICAgIGZ4ICYmIGZ4WzBdKGRpc3BhdGNoLCBmeFsxXSlcclxuICAgICAgICAgIH0sIHNldFN0YXRlKGFjdGlvblswXSkpLFxyXG4gICAgICAgICAgc3RhdGUpXHJcbiAgICAgIDogc2V0U3RhdGUoYWN0aW9uKVxyXG4gIH0pXHJcblxyXG4gIHZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGxvY2sgPSBmYWxzZVxyXG4gICAgbm9kZSA9IHBhdGNoKFxyXG4gICAgICBub2RlLnBhcmVudE5vZGUsXHJcbiAgICAgIG5vZGUsXHJcbiAgICAgIHZkb20sXHJcbiAgICAgICh2ZG9tID0gZ2V0VGV4dFZOb2RlKHZpZXcoc3RhdGUpKSksXHJcbiAgICAgIGxpc3RlbmVyXHJcbiAgICApXHJcbiAgICBvbkVuZCgpXHJcbiAgfVxyXG5cclxuICBkaXNwYXRjaChwcm9wcy5pbml0KVxyXG59XHJcbiIsInZhciB0aW1lRnggPSBmdW5jdGlvbiAoZng6IGFueSkge1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoXHJcbiAgICAgICAgYWN0aW9uOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBmeCxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBkZWxheTogcHJvcHMuZGVsYXlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF07XHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IHZhciB0aW1lb3V0ID0gdGltZUZ4KFxyXG5cclxuICAgIGZ1bmN0aW9uIChcclxuICAgICAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRpc3BhdGNoKHByb3BzLmFjdGlvbik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzLmRlbGF5XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuKTtcclxuXHJcbmV4cG9ydCB2YXIgaW50ZXJ2YWwgPSB0aW1lRngoXHJcblxyXG4gICAgZnVuY3Rpb24gKFxyXG4gICAgICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICB2YXIgaWQgPSBzZXRJbnRlcnZhbChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgRGF0ZS5ub3coKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcHMuZGVsYXlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuKTtcclxuXHJcblxyXG4vLyBleHBvcnQgdmFyIG5vd1xyXG4vLyBleHBvcnQgdmFyIHJldHJ5XHJcbi8vIGV4cG9ydCB2YXIgZGVib3VuY2VcclxuLy8gZXhwb3J0IHZhciB0aHJvdHRsZVxyXG4vLyBleHBvcnQgdmFyIGlkbGVDYWxsYmFjaz9cclxuIiwiXHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwQXV0aGVudGljYXRlZFByb3BzXCI7XHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9ja1wiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IElIdHRwT3V0cHV0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBPdXRwdXRcIjtcclxuaW1wb3J0IHsgSUh0dHBTZXF1ZW50aWFsRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cFNlcXVlbnRpYWxGZXRjaEl0ZW1cIjtcclxuXHJcbmNvbnN0IHNlcXVlbnRpYWxIdHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHNlcXVlbnRpYWxCbG9ja3M6IEFycmF5PElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2s+KTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIHdpbGwgcnVuIHNlcXVlbnRpYWxseVxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBpbiBlYWNoIGJsb2NrIHdpbGwgcnVubiBpbiBwYXJhbGxlbFxyXG4gICAgbGV0IGJsb2NrOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrO1xyXG4gICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgbGV0IGh0dHBDYWxsOiBhbnk7XHJcbiAgICBsZXQgbGFzdEh0dHBDYWxsOiBhbnk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IHNlcXVlbnRpYWxCbG9ja3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgICAgYmxvY2sgPSBzZXF1ZW50aWFsQmxvY2tzW2ldO1xyXG5cclxuICAgICAgICBpZiAoYmxvY2sgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGJsb2NrKSkge1xyXG5cclxuICAgICAgICAgICAgaHR0cENhbGwgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZTogcHJvY2Vzc0Jsb2NrLFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxyXG4gICAgICAgICAgICAgICAgYmxvY2s6IGJsb2NrLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGAke2l9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBodHRwQ2FsbCA9IHtcclxuICAgICAgICAgICAgICAgIGRlbGVnYXRlOiBwcm9jZXNzUHJvcHMsXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICBibG9jazogYmxvY2ssXHJcbiAgICAgICAgICAgICAgICBpbmRleDogYCR7aX1gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3VjY2Vzcykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGFzdEh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SHR0cENhbGwgPSBsYXN0SHR0cENhbGw7XHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRJbmRleCA9IGxhc3RIdHRwQ2FsbC5pbmRleDtcclxuICAgICAgICAgICAgaHR0cENhbGwubmV4dEJsb2NrID0gbGFzdEh0dHBDYWxsLmJsb2NrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGFzdEh0dHBDYWxsID0gaHR0cENhbGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgIGh0dHBDYWxsLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICBodHRwQ2FsbC5kaXNwYXRjaCxcclxuICAgICAgICAgICAgaHR0cENhbGwuYmxvY2ssXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgaHR0cENhbGwuaW5kZXhcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBwcm9jZXNzQmxvY2sgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgYmxvY2s6IElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2ssXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBwYXJhbGxlbFByb3BzOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz4gPSBibG9jayBhcyBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz47XHJcbiAgICBjb25zdCBkZWxlZ2F0ZXM6IGFueVtdID0gW107XHJcbiAgICBsZXQgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzO1xyXG5cclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFyYWxsZWxQcm9wcy5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICBwcm9wcyA9IHBhcmFsbGVsUHJvcHNbal07XHJcblxyXG4gICAgICAgIGRlbGVnYXRlcy5wdXNoKFxyXG4gICAgICAgICAgICBwcm9jZXNzUHJvcHMoXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgUHJvbWlzZVxyXG4gICAgICAgICAgICAuYWxsKGRlbGVnYXRlcylcclxuICAgICAgICAgICAgLnRoZW4oKVxyXG4gICAgICAgICAgICAuY2F0Y2goKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NQcm9wcyA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMsXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghcHJvcHMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0OiBJSHR0cE91dHB1dCA9IHtcclxuICAgICAgICBvazogZmFsc2UsXHJcbiAgICAgICAgdXJsOiBwcm9wcy51cmwsXHJcbiAgICAgICAgYXV0aGVudGljYXRpb25GYWlsOiBmYWxzZSxcclxuICAgICAgICBwYXJzZVR5cGU6IFwidGV4dFwiLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dCxcclxuICAgICAgICBuZXh0RGVsZWdhdGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBodHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXByb3BzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dHB1dDogSUh0dHBPdXRwdXQgPSB7XHJcbiAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgIHVybDogcHJvcHMudXJsLFxyXG4gICAgICAgIGF1dGhlbnRpY2F0aW9uRmFpbDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBwcm9wcy5wYXJzZVR5cGUgPz8gJ2pzb24nLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGh0dHAgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzLFxyXG4gICAgb3V0cHV0OiBJSHR0cE91dHB1dCxcclxuICAgIG5leHREZWxlZ2F0ZTogYW55ID0gbnVsbCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGZldGNoKFxyXG4gICAgICAgIHByb3BzLnVybCxcclxuICAgICAgICBwcm9wcy5vcHRpb25zKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3V0cHV0Lm9rID0gcmVzcG9uc2Uub2sgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnR5cGUgPSByZXNwb25zZS50eXBlO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnJlZGlyZWN0ZWQgPSByZXNwb25zZS5yZWRpcmVjdGVkO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5jYWxsSUQgPSByZXNwb25zZS5oZWFkZXJzLmdldChcIkNhbGxJRFwiKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIikgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3V0cHV0LmNvbnRlbnRUeXBlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHB1dC5jb250ZW50VHlwZS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSAhPT0gLTEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wYXJzZVR5cGUgPSBcImpzb25cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5hdXRoZW50aWNhdGlvbkZhaWwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25BdXRoZW50aWNhdGlvbkZhaWxBY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5yZXNwb25zZU51bGwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuZXJyb3IgKz0gYEVycm9yIHRocm93biB3aXRoIHJlc3BvbnNlLnRleHQoKVxyXG5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQudGV4dERhdGEgPSByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0XHJcbiAgICAgICAgICAgICAgICAmJiBvdXRwdXQucGFyc2VUeXBlID09PSAnanNvbidcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuanNvbkRhdGEgPSBKU09OLnBhcnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmVycm9yICs9IGBFcnJvciB0aHJvd24gcGFyc2luZyByZXNwb25zZS50ZXh0KCkgYXMganNvblxyXG5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW91dHB1dC5vaykge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXh0RGVsZWdhdGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dERlbGVnYXRlLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZS5kaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuYmxvY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuaW5kZXhcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgIG91dHB1dC5lcnJvciArPSBlcnJvcjtcclxuXHJcbiAgICAgICAgICAgIGRpc3BhdGNoKFxyXG4gICAgICAgICAgICAgICAgcHJvcHMuZXJyb3IsXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdIdHRwID0gKHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyk6IElIdHRwRmV0Y2hJdGVtID0+IHtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIGh0dHBFZmZlY3QsXHJcbiAgICAgICAgcHJvcHNcclxuICAgIF1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdTZXF1ZW50aWFsSHR0cCA9IChwcm9wc0Jsb2NrOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrPik6IElIdHRwU2VxdWVudGlhbEZldGNoSXRlbSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzZXF1ZW50aWFsSHR0cEVmZmVjdCxcclxuICAgICAgICBwcm9wc0Jsb2NrXHJcbiAgICBdXHJcbn1cclxuIiwiXHJcbmNvbnN0IEtleXMgPSB7XHJcblxyXG4gICAgc3RhcnRVcmw6ICdzdGFydFVybCcsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEtleXM7XHJcblxyXG4iLCJpbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHR0cEVmZmVjdCBpbXBsZW1lbnRzIElIdHRwRWZmZWN0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdXJsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBQYXJzZVR5cGUsXHJcbiAgICAgICAgYWN0aW9uRGVsZWdhdGU6IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSkge1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgICAgIHRoaXMucGFyc2VUeXBlID0gcGFyc2VUeXBlO1xyXG4gICAgICAgIHRoaXMuYWN0aW9uRGVsZWdhdGUgPSBhY3Rpb25EZWxlZ2F0ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIHVybDogc3RyaW5nO1xyXG4gICAgcHVibGljIHBhcnNlVHlwZTogUGFyc2VUeXBlO1xyXG4gICAgcHVibGljIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXk7XHJcbn1cclxuIiwiXHJcblxyXG5jb25zdCBnVXRpbGl0aWVzID0ge1xyXG5cclxuICAgIHJvdW5kVXBUb05lYXJlc3RUZW46ICh2YWx1ZTogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZsb29yID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChmbG9vciArIDEpICogMTA7XHJcbiAgICB9LFxyXG5cclxuICAgIHJvdW5kRG93blRvTmVhcmVzdFRlbjogKHZhbHVlOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZmxvb3IgPSBNYXRoLmZsb29yKHZhbHVlIC8gMTApO1xyXG5cclxuICAgICAgICByZXR1cm4gZmxvb3IgKiAxMDtcclxuICAgIH0sXHJcblxyXG4gICAgY29udmVydE1tVG9GZWV0SW5jaGVzOiAobW06IG51bWJlcik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGluY2hlcyA9IG1tICogMC4wMzkzNztcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMuY29udmVydEluY2hlc1RvRmVldEluY2hlcyhpbmNoZXMpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbmRleE9mQW55OiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBjaGFyczogc3RyaW5nW10sXHJcbiAgICAgICAgc3RhcnRJbmRleCA9IDBcclxuICAgICk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFycy5pbmNsdWRlcyhpbnB1dFtpXSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXREaXJlY3Rvcnk6IChmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBmaWxlUGF0aC5tYXRjaCgvKC4qKVtcXC9cXFxcXS8pO1xyXG5cclxuICAgICAgICBpZiAobWF0Y2hlc1xyXG4gICAgICAgICAgICAmJiBtYXRjaGVzLmxlbmd0aCA+IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNbMV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvdW50Q2hhcmFjdGVyOiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBjaGFyYWN0ZXI6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dFtpXSA9PT0gY2hhcmFjdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbnZlcnRJbmNoZXNUb0ZlZXRJbmNoZXM6IChpbmNoZXM6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZlZXQgPSBNYXRoLmZsb29yKGluY2hlcyAvIDEyKTtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmcgPSBpbmNoZXMgJSAxMjtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmdSb3VuZGVkID0gTWF0aC5yb3VuZChpbmNoZXNSZWFtaW5pbmcgKiAxMCkgLyAxMDsgLy8gMSBkZWNpbWFsIHBsYWNlc1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBpZiAoZmVldCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGAke2ZlZXR9JyBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluY2hlc1JlYW1pbmluZ1JvdW5kZWQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBgJHtyZXN1bHR9JHtpbmNoZXNSZWFtaW5pbmdSb3VuZGVkfVwiYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTnVsbE9yV2hpdGVTcGFjZTogKGlucHV0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dCA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucHV0ID0gYCR7aW5wdXR9YDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0Lm1hdGNoKC9eXFxzKiQvKSAhPT0gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tBcnJheXNFcXVhbDogKGE6IHN0cmluZ1tdLCBiOiBzdHJpbmdbXSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoYSA9PT0gYikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYSA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBiID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3QgY2FyZSBhYm91dCB0aGUgb3JkZXIgb2YgdGhlIGVsZW1lbnRzIGluc2lkZVxyXG4gICAgICAgIC8vIHRoZSBhcnJheSwgeW91IHNob3VsZCBzb3J0IGJvdGggYXJyYXlzIGhlcmUuXHJcbiAgICAgICAgLy8gUGxlYXNlIG5vdGUgdGhhdCBjYWxsaW5nIHNvcnQgb24gYW4gYXJyYXkgd2lsbCBtb2RpZnkgdGhhdCBhcnJheS5cclxuICAgICAgICAvLyB5b3UgbWlnaHQgd2FudCB0byBjbG9uZSB5b3VyIGFycmF5IGZpcnN0LlxyXG5cclxuICAgICAgICBjb25zdCB4OiBzdHJpbmdbXSA9IFsuLi5hXTtcclxuICAgICAgICBjb25zdCB5OiBzdHJpbmdbXSA9IFsuLi5iXTtcclxuXHJcbiAgICAgICAgeC5zb3J0KCk7XHJcbiAgICAgICAgeS5zb3J0KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhbaV0gIT09IHlbaV0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaHVmZmxlKGFycmF5OiBBcnJheTxhbnk+KTogQXJyYXk8YW55PiB7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50SW5kZXggPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHRlbXBvcmFyeVZhbHVlOiBhbnlcclxuICAgICAgICBsZXQgcmFuZG9tSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgICAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xyXG4gICAgICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhcnJheTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoaW5wdXQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIWlzTmFOKGlucHV0KTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNOZWdhdGl2ZU51bWVyaWM6IChpbnB1dDogYW55KTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZ1V0aWxpdGllcy5pc051bWVyaWMoaW5wdXQpKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gK2lucHV0IDwgMDsgLy8gKyBjb252ZXJ0cyBhIHN0cmluZyB0byBhIG51bWJlciBpZiBpdCBjb25zaXN0cyBvbmx5IG9mIGRpZ2l0cy5cclxuICAgIH0sXHJcblxyXG4gICAgaGFzRHVwbGljYXRlczogPFQ+KGlucHV0OiBBcnJheTxUPik6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAobmV3IFNldChpbnB1dCkuc2l6ZSAhPT0gaW5wdXQubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgZXh0ZW5kOiA8VD4oYXJyYXkxOiBBcnJheTxUPiwgYXJyYXkyOiBBcnJheTxUPik6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBhcnJheTIuZm9yRWFjaCgoaXRlbTogVCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgYXJyYXkxLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXR0eVByaW50SnNvbkZyb21TdHJpbmc6IChpbnB1dDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMucHJldHR5UHJpbnRKc29uRnJvbU9iamVjdChKU09OLnBhcnNlKGlucHV0KSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXR0eVByaW50SnNvbkZyb21PYmplY3Q6IChpbnB1dDogb2JqZWN0IHwgbnVsbCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgNCAvLyBpbmRlbnRlZCA0IHNwYWNlc1xyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzUG9zaXRpdmVOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdW1lcmljKGlucHV0KSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE51bWJlcihpbnB1dCkgPj0gMDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0VGltZTogKCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdzogRGF0ZSA9IG5ldyBEYXRlKERhdGUubm93KCkpO1xyXG4gICAgICAgIGNvbnN0IHRpbWU6IHN0cmluZyA9IGAke25vdy5nZXRGdWxsWWVhcigpfS0keyhub3cuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0tJHtub3cuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0gJHtub3cuZ2V0SG91cnMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7bm93LmdldE1pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7bm93LmdldFNlY29uZHMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9Ojoke25vdy5nZXRNaWxsaXNlY29uZHMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDMsICcwJyl9OmA7XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdEJ5TmV3TGluZTogKGlucHV0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGlucHV0LnNwbGl0KC9bXFxyXFxuXSsvKTtcclxuICAgICAgICBjb25zdCBjbGVhbmVkOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZSh2YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGVhbmVkLnB1c2godmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gY2xlYW5lZDtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRCeVBpcGU6IChpbnB1dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBpbnB1dC5zcGxpdCgnfCcpO1xyXG4gICAgICAgIGNvbnN0IGNsZWFuZWQ6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKHZhbHVlKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNsZWFuZWQucHVzaCh2YWx1ZS50cmltKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjbGVhbmVkO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdEJ5TmV3TGluZUFuZE9yZGVyOiAoaW5wdXQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gZ1V0aWxpdGllc1xyXG4gICAgICAgICAgICAuc3BsaXRCeU5ld0xpbmUoaW5wdXQpXHJcbiAgICAgICAgICAgIC5zb3J0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGpvaW5CeU5ld0xpbmU6IChpbnB1dDogQXJyYXk8c3RyaW5nPik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXRcclxuICAgICAgICAgICAgfHwgaW5wdXQubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQuam9pbignXFxuJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZUFsbENoaWxkcmVuOiAocGFyZW50OiBFbGVtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGlzT2RkOiAoeDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiB4ICUgMiA9PT0gMTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvcnRQcmludFRleHQ6IChcclxuICAgICAgICBpbnB1dDogc3RyaW5nLFxyXG4gICAgICAgIG1heExlbmd0aDogbnVtYmVyID0gMTAwKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3ROZXdMaW5lSW5kZXg6IG51bWJlciA9IGdVdGlsaXRpZXMuZ2V0Rmlyc3ROZXdMaW5lSW5kZXgoaW5wdXQpO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3ROZXdMaW5lSW5kZXggPiAwXHJcbiAgICAgICAgICAgICYmIGZpcnN0TmV3TGluZUluZGV4IDw9IG1heExlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gaW5wdXQuc3Vic3RyKDAsIGZpcnN0TmV3TGluZUluZGV4IC0gMSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1V0aWxpdGllcy50cmltQW5kQWRkRWxsaXBzaXMob3V0cHV0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPD0gbWF4TGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRwdXQgPSBpbnB1dC5zdWJzdHIoMCwgbWF4TGVuZ3RoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMudHJpbUFuZEFkZEVsbGlwc2lzKG91dHB1dCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRyaW1BbmRBZGRFbGxpcHNpczogKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0cHV0OiBzdHJpbmcgPSBpbnB1dC50cmltKCk7XHJcbiAgICAgICAgbGV0IHB1bmN0dWF0aW9uUmVnZXg6IFJlZ0V4cCA9IC9bLixcXC8jISQlXFxeJlxcKjs6e309XFwtX2B+KCldL2c7XHJcbiAgICAgICAgbGV0IHNwYWNlUmVnZXg6IFJlZ0V4cCA9IC9cXFcrL2c7XHJcbiAgICAgICAgbGV0IGxhc3RDaGFyYWN0ZXI6IHN0cmluZyA9IG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGxldCBsYXN0Q2hhcmFjdGVySXNQdW5jdHVhdGlvbjogYm9vbGVhbiA9XHJcbiAgICAgICAgICAgIHB1bmN0dWF0aW9uUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKVxyXG4gICAgICAgICAgICB8fCBzcGFjZVJlZ2V4LnRlc3QobGFzdENoYXJhY3Rlcik7XHJcblxyXG5cclxuICAgICAgICB3aGlsZSAobGFzdENoYXJhY3RlcklzUHVuY3R1YXRpb24gPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5zdWJzdHIoMCwgb3V0cHV0Lmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBsYXN0Q2hhcmFjdGVyID0gb3V0cHV0W291dHB1dC5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgICAgIGxhc3RDaGFyYWN0ZXJJc1B1bmN0dWF0aW9uID1cclxuICAgICAgICAgICAgICAgIHB1bmN0dWF0aW9uUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKVxyXG4gICAgICAgICAgICAgICAgfHwgc3BhY2VSZWdleC50ZXN0KGxhc3RDaGFyYWN0ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGAke291dHB1dH0uLi5gO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGaXJzdE5ld0xpbmVJbmRleDogKGlucHV0OiBzdHJpbmcpOiBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgICBsZXQgY2hhcmFjdGVyOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGlucHV0W2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNoYXJhY3RlciA9PT0gJ1xcbidcclxuICAgICAgICAgICAgICAgIHx8IGNoYXJhY3RlciA9PT0gJ1xccicpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cHBlckNhc2VGaXJzdExldHRlcjogKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBpbnB1dC5zbGljZSgxKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2VuZXJhdGVHdWlkOiAodXNlSHlwZW5zOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICBsZXQgZDIgPSAocGVyZm9ybWFuY2VcclxuICAgICAgICAgICAgJiYgcGVyZm9ybWFuY2Uubm93XHJcbiAgICAgICAgICAgICYmIChwZXJmb3JtYW5jZS5ub3coKSAqIDEwMDApKSB8fCAwO1xyXG5cclxuICAgICAgICBsZXQgcGF0dGVybiA9ICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnO1xyXG5cclxuICAgICAgICBpZiAoIXVzZUh5cGVucykge1xyXG4gICAgICAgICAgICBwYXR0ZXJuID0gJ3h4eHh4eHh4eHh4eDR4eHh5eHh4eHh4eHh4eHh4eHh4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGd1aWQgPSBwYXR0ZXJuXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgL1t4eV0vZyxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChjKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCByID0gTWF0aC5yYW5kb20oKSAqIDE2O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSAoZCArIHIpICUgMTYgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSAoZDIgKyByKSAlIDE2IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDIgPSBNYXRoLmZsb29yKGQyIC8gMTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChjID09PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBndWlkO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja0lmQ2hyb21lOiAoKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIC8vIHBsZWFzZSBub3RlLCBcclxuICAgICAgICAvLyB0aGF0IElFMTEgbm93IHJldHVybnMgdW5kZWZpbmVkIGFnYWluIGZvciB3aW5kb3cuY2hyb21lXHJcbiAgICAgICAgLy8gYW5kIG5ldyBPcGVyYSAzMCBvdXRwdXRzIHRydWUgZm9yIHdpbmRvdy5jaHJvbWVcclxuICAgICAgICAvLyBidXQgbmVlZHMgdG8gY2hlY2sgaWYgd2luZG93Lm9wciBpcyBub3QgdW5kZWZpbmVkXHJcbiAgICAgICAgLy8gYW5kIG5ldyBJRSBFZGdlIG91dHB1dHMgdG8gdHJ1ZSBub3cgZm9yIHdpbmRvdy5jaHJvbWVcclxuICAgICAgICAvLyBhbmQgaWYgbm90IGlPUyBDaHJvbWUgY2hlY2tcclxuICAgICAgICAvLyBzbyB1c2UgdGhlIGJlbG93IHVwZGF0ZWQgY29uZGl0aW9uXHJcblxyXG4gICAgICAgIGxldCB0c1dpbmRvdzogYW55ID0gd2luZG93IGFzIGFueTtcclxuICAgICAgICBsZXQgaXNDaHJvbWl1bSA9IHRzV2luZG93LmNocm9tZTtcclxuICAgICAgICBsZXQgd2luTmF2ID0gd2luZG93Lm5hdmlnYXRvcjtcclxuICAgICAgICBsZXQgdmVuZG9yTmFtZSA9IHdpbk5hdi52ZW5kb3I7XHJcbiAgICAgICAgbGV0IGlzT3BlcmEgPSB0eXBlb2YgdHNXaW5kb3cub3ByICE9PSBcInVuZGVmaW5lZFwiO1xyXG4gICAgICAgIGxldCBpc0lFZWRnZSA9IHdpbk5hdi51c2VyQWdlbnQuaW5kZXhPZihcIkVkZ2VcIikgPiAtMTtcclxuICAgICAgICBsZXQgaXNJT1NDaHJvbWUgPSB3aW5OYXYudXNlckFnZW50Lm1hdGNoKFwiQ3JpT1NcIik7XHJcblxyXG4gICAgICAgIGlmIChpc0lPU0Nocm9tZSkge1xyXG4gICAgICAgICAgICAvLyBpcyBHb29nbGUgQ2hyb21lIG9uIElPU1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNDaHJvbWl1bSAhPT0gbnVsbFxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgaXNDaHJvbWl1bSAhPT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgICAgICAgICAmJiB2ZW5kb3JOYW1lID09PSBcIkdvb2dsZSBJbmMuXCJcclxuICAgICAgICAgICAgJiYgaXNPcGVyYSA9PT0gZmFsc2VcclxuICAgICAgICAgICAgJiYgaXNJRWVkZ2UgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIC8vIGlzIEdvb2dsZSBDaHJvbWVcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnVXRpbGl0aWVzOyIsImltcG9ydCBJSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5VXJsXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGlzdG9yeVVybCBpbXBsZW1lbnRzIElIaXN0b3J5VXJsIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZykge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlclNuYXBTaG90IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSVJlbmRlclNuYXBTaG90XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyU25hcFNob3QgaW1wbGVtZW50cyBJUmVuZGVyU25hcFNob3Qge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxuICAgIHB1YmxpYyBndWlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBjcmVhdGVkOiBEYXRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgbW9kaWZpZWQ6IERhdGUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBleHBhbmRlZE9wdGlvbklEczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgcHVibGljIGV4cGFuZGVkQW5jaWxsYXJ5SURzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbn1cclxuIiwiaW1wb3J0IElVcmxBc3NlbWJsZXIgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JVXJsQXNzZW1ibGVyXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9IaXN0b3J5VXJsXCI7XHJcbmltcG9ydCBSZW5kZXJTbmFwU2hvdCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9SZW5kZXJTbmFwU2hvdFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkVXJsRnJvbVJvb3QgPSAocm9vdDogSVJlbmRlckZyYWdtZW50KTogc3RyaW5nID0+IHtcclxuXHJcbiAgICBjb25zdCB1cmxBc3NlbWJsZXI6IElVcmxBc3NlbWJsZXIgPSB7XHJcblxyXG4gICAgICAgIHVybDogYCR7bG9jYXRpb24ub3JpZ2lufSR7bG9jYXRpb24ucGF0aG5hbWV9P2BcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJvb3Quc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVybEFzc2VtYmxlci51cmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpbnRTZWdtZW50RW5kKFxyXG4gICAgICAgIHVybEFzc2VtYmxlcixcclxuICAgICAgICByb290XHJcbiAgICApXHJcblxyXG4gICAgcmV0dXJuIHVybEFzc2VtYmxlci51cmw7XHJcbn07XHJcblxyXG5jb25zdCBwcmludFNlZ21lbnRFbmQgPSAoXHJcbiAgICB1cmxBc3NlbWJsZXI6IElVcmxBc3NlbWJsZXIsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH1+JHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcblxyXG4gICAgICAgIHByaW50U2VnbWVudEVuZChcclxuICAgICAgICAgICAgdXJsQXNzZW1ibGVyLFxyXG4gICAgICAgICAgICBmcmFnbWVudC5saW5rLnJvb3QsXHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmV4aXRLZXkpKSB7XHJcblxyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH1fJHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghZnJhZ21lbnQubGlua1xyXG4gICAgICAgICYmICFmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IHVybEFzc2VtYmxlci51cmw7XHJcbiAgICAgICAgdXJsID0gYCR7dXJsfS0ke2ZyYWdtZW50LmlkfWA7XHJcbiAgICAgICAgdXJsQXNzZW1ibGVyLnVybCA9IHVybDtcclxuICAgIH1cclxuXHJcbiAgICBwcmludFNlZ21lbnRFbmQoXHJcbiAgICAgICAgdXJsQXNzZW1ibGVyLFxyXG4gICAgICAgIGZyYWdtZW50LnNlbGVjdGVkLFxyXG4gICAgKVxyXG59O1xyXG5cclxuXHJcbmNvbnN0IGdIaXN0b3J5Q29kZSA9IHtcclxuXHJcbiAgICByZXNldFJhdzogKCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5hdXRvZm9jdXMgPSB0cnVlO1xyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmlzQXV0b2ZvY3VzRmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBwdXNoQnJvd3Nlckhpc3RvcnlTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50U2VjdGlvbj8uY3VycmVudFxyXG4gICAgICAgICAgICB8fCAhc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdIaXN0b3J5Q29kZS5yZXNldFJhdygpO1xyXG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xyXG4gICAgICAgIGxldCBsYXN0VXJsOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5zdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgbGFzdFVybCA9IHdpbmRvdy5oaXN0b3J5LnN0YXRlLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxhc3RVcmwgPSBgJHtsb2NhdGlvbi5vcmlnaW59JHtsb2NhdGlvbi5wYXRobmFtZX0ke2xvY2F0aW9uLnNlYXJjaH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gYnVpbGRVcmxGcm9tUm9vdChzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUucm9vdCk7XHJcblxyXG4gICAgICAgIGlmIChsYXN0VXJsXHJcbiAgICAgICAgICAgICYmIHVybCA9PT0gbGFzdFVybCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShcclxuICAgICAgICAgICAgbmV3IFJlbmRlclNuYXBTaG90KHVybCksXHJcbiAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgIHVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLnN0ZXBIaXN0b3J5Lmhpc3RvcnlDaGFpbi5wdXNoKG5ldyBIaXN0b3J5VXJsKHVybCkpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0hpc3RvcnlDb2RlO1xyXG5cclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJQWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lBY3Rpb25cIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IEh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL3N0YXRlL2VmZmVjdHMvSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0hpc3RvcnlDb2RlIGZyb20gXCIuL2dIaXN0b3J5Q29kZVwiO1xyXG5cclxubGV0IGNvdW50ID0gMDtcclxuXHJcbmNvbnN0IGdTdGF0ZUNvZGUgPSB7XHJcblxyXG4gICAgc2V0RGlydHk6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLnJhdyA9IGZhbHNlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID0gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyZXNoS2V5SW50OiAoc3RhdGU6IElTdGF0ZSk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5leHRLZXkgPSArK3N0YXRlLm5leHRLZXk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXh0S2V5O1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmVzaEtleTogKHN0YXRlOiBJU3RhdGUpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7Z1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSl9YDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0R3VpZEtleTogKCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBVLmdlbmVyYXRlR3VpZCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZVN0YXRlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnSGlzdG9yeUNvZGUucHVzaEJyb3dzZXJIaXN0b3J5U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5ld1N0YXRlOiBJU3RhdGUgPSB7IC4uLnN0YXRlIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgIH0sXHJcblxyXG4gICAgQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHBhcnNlVHlwZTogUGFyc2VUeXBlLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXlcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG5cclxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh1cmwuZW5kc1dpdGgoJ2lteW82QzA4SC5odG1sJykpIHtcclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVmZmVjdDogSUh0dHBFZmZlY3QgfCB1bmRlZmluZWQgPSBzdGF0ZVxyXG4gICAgICAgICAgICAucmVwZWF0RWZmZWN0c1xyXG4gICAgICAgICAgICAucmVMb2FkR2V0SHR0cEltbWVkaWF0ZVxyXG4gICAgICAgICAgICAuZmluZCgoZWZmZWN0OiBJSHR0cEVmZmVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBlZmZlY3QubmFtZSA9PT0gbmFtZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChlZmZlY3QpIHsgLy8gYWxyZWFkeSBhZGRlZC5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaHR0cEVmZmVjdDogSUh0dHBFZmZlY3QgPSBuZXcgSHR0cEVmZmVjdChcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBwYXJzZVR5cGUsXHJcbiAgICAgICAgICAgIGFjdGlvbkRlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlLnB1c2goaHR0cEVmZmVjdCk7XHJcbiAgICB9LFxyXG5cclxuICAgIEFkZFJ1bkFjdGlvbkltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgYWN0aW9uRGVsZWdhdGU6IElBY3Rpb24pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5ydW5BY3Rpb25JbW1lZGlhdGUucHVzaChhY3Rpb25EZWxlZ2F0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldENhY2hlZF9vdXRsaW5lTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgKTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudElEKSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50SUQgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSA/PyBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk91dGxpbmVOb2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmVOb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjYWNoZV9vdXRsaW5lTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVLZXkoXHJcbiAgICAgICAgICAgIGxpbmtJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUuaVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSA9IG91dGxpbmVOb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZWRfY2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgKTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudElEKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50SUQgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkW2tleV0gPz8gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2FjaGVfY2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVuZGVyRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXJlbmRlckZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVLZXlGcm9tRnJhZ21lbnQocmVuZGVyRnJhZ21lbnQpO1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uoa2V5KSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWRba2V5IGFzIHN0cmluZ10pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWRba2V5IGFzIHN0cmluZ10gPSByZW5kZXJGcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2FjaGVLZXlGcm9tRnJhZ21lbnQ6IChyZW5kZXJGcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICByZW5kZXJGcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuaWRcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZUtleTogKFxyXG5cclxuICAgICAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgICAgICBmcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgJHtsaW5rSUR9XyR7ZnJhZ21lbnRJRH1gO1xyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdTdGF0ZUNvZGU7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdBdXRoZW50aWNhdGlvbkNvZGUgPSB7XHJcblxyXG4gICAgY2xlYXJBdXRoZW50aWNhdGlvbjogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUudXNlci5hdXRob3Jpc2VkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhdGUudXNlci5uYW1lID0gXCJcIjtcclxuICAgICAgICBzdGF0ZS51c2VyLnN1YiA9IFwiXCI7XHJcbiAgICAgICAgc3RhdGUudXNlci5sb2dvdXRVcmwgPSBcIlwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uQ29kZTtcclxuIiwiXHJcbmV4cG9ydCBlbnVtIEFjdGlvblR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBGaWx0ZXJUb3BpY3MgPSAnZmlsdGVyVG9waWNzJyxcclxuICAgIEdldFRvcGljID0gJ2dldFRvcGljJyxcclxuICAgIEdldFRvcGljQW5kUm9vdCA9ICdnZXRUb3BpY0FuZFJvb3QnLFxyXG4gICAgU2F2ZUFydGljbGVTY2VuZSA9ICdzYXZlQXJ0aWNsZVNjZW5lJyxcclxuICAgIEdldFJvb3QgPSAnZ2V0Um9vdCcsXHJcbiAgICBHZXRTdGVwID0gJ2dldFN0ZXAnLFxyXG4gICAgR2V0UGFnZSA9ICdnZXRQYWdlJyxcclxuICAgIEdldENoYWluID0gJ2dldENoYWluJyxcclxuICAgIEdldE91dGxpbmUgPSAnZ2V0T3V0bGluZScsXHJcbiAgICBHZXRGcmFnbWVudCA9ICdnZXRGcmFnbWVudCcsXHJcbiAgICBHZXRDaGFpbkZyYWdtZW50ID0gJ2dldENoYWluRnJhZ21lbnQnXHJcbn1cclxuXHJcbiIsImltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgZ0FqYXhIZWFkZXJDb2RlID0ge1xyXG5cclxuICAgIGJ1aWxkSGVhZGVyczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2FsbElEOiBzdHJpbmcsXHJcbiAgICAgICAgYWN0aW9uOiBBY3Rpb25UeXBlKTogSGVhZGVycyA9PiB7XHJcblxyXG4gICAgICAgIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnWC1DU1JGJywgJzEnKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnU3Vic2NyaXB0aW9uSUQnLCBzdGF0ZS5zZXR0aW5ncy5zdWJzY3JpcHRpb25JRCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0NhbGxJRCcsIGNhbGxJRCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0FjdGlvbicsIGFjdGlvbik7XHJcblxyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCd3aXRoQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xyXG5cclxuICAgICAgICByZXR1cm4gaGVhZGVycztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdBamF4SGVhZGVyQ29kZTtcclxuXHJcbiIsImltcG9ydCB7IGdBdXRoZW50aWNhdGVkSHR0cCB9IGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkh0dHBcIjtcclxuXHJcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4vZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25BY3Rpb25zIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkFjdGlvbnNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBnQXV0aGVudGljYXRpb25FZmZlY3RzID0ge1xyXG5cclxuICAgIGNoZWNrVXNlckF1dGhlbnRpY2F0ZWQ6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbGxJRDogc3RyaW5nID0gVS5nZW5lcmF0ZUd1aWQoKTtcclxuXHJcbiAgICAgICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgY2FsbElELFxyXG4gICAgICAgICAgICBBY3Rpb25UeXBlLk5vbmVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3N0YXRlLnNldHRpbmdzLmJmZlVybH0vJHtzdGF0ZS5zZXR0aW5ncy51c2VyUGF0aH0/c2xpZGU9ZmFsc2VgO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVzcG9uc2U6ICdqc29uJyxcclxuICAgICAgICAgICAgYWN0aW9uOiBnQXV0aGVudGljYXRpb25BY3Rpb25zLmxvYWRTdWNjZXNzZnVsQXV0aGVudGljYXRpb24sXHJcbiAgICAgICAgICAgIGVycm9yOiAoc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIHRyeWluZyB0byBhdXRoZW50aWNhdGUgd2l0aCB0aGUgc2VydmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dBdXRoZW50aWNhdGlvbkVmZmVjdHMuY2hlY2tVc2VyQXV0aGVudGljYXRlZC5uYW1lfSxcclxuICAgICAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQoYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciB0cnlpbmcgdG8gYXV0aGVudGljYXRlIHdpdGggdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cy5jaGVja1VzZXJBdXRoZW50aWNhdGVkLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YXRlXCI6ICR7SlNPTi5zdHJpbmdpZnkoc3RhdGUpfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQXV0aGVudGljYXRpb25FZmZlY3RzO1xyXG4iLCJpbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IEtleXMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvY29uc3RhbnRzL0tleXNcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkNvZGUgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uQ29kZVwiO1xyXG5pbXBvcnQgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cyBmcm9tIFwiLi9nQXV0aGVudGljYXRpb25FZmZlY3RzXCI7XHJcblxyXG5cclxuY29uc3QgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucyA9IHtcclxuXHJcbiAgICBsb2FkU3VjY2Vzc2Z1bEF1dGhlbnRpY2F0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55KTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFyZXNwb25zZVxyXG4gICAgICAgICAgICB8fCByZXNwb25zZS5wYXJzZVR5cGUgIT09IFwianNvblwiXHJcbiAgICAgICAgICAgIHx8ICFyZXNwb25zZS5qc29uRGF0YSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xhaW1zOiBhbnkgPSByZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgbmFtZTogYW55ID0gY2xhaW1zLmZpbmQoXHJcbiAgICAgICAgICAgIChjbGFpbTogYW55KSA9PiBjbGFpbS50eXBlID09PSAnbmFtZSdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBzdWI6IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ3N1YidcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIW5hbWVcclxuICAgICAgICAgICAgJiYgIXN1Yikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9nb3V0VXJsQ2xhaW06IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ2JmZjpsb2dvdXRfdXJsJ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghbG9nb3V0VXJsQ2xhaW1cclxuICAgICAgICAgICAgfHwgIWxvZ291dFVybENsYWltLnZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS51c2VyLmF1dGhvcmlzZWQgPSB0cnVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubmFtZSA9IG5hbWUudmFsdWU7XHJcbiAgICAgICAgc3RhdGUudXNlci5zdWIgPSBzdWIudmFsdWU7XHJcbiAgICAgICAgc3RhdGUudXNlci5sb2dvdXRVcmwgPSBsb2dvdXRVcmxDbGFpbS52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrVXNlckxvZ2dlZEluOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvcHM6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5jaGVja1VzZXJMb2dnZWRJblByb3BzKHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFwcm9wcykge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHByb3BzXHJcbiAgICAgICAgXTtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tVc2VyTG9nZ2VkSW5Qcm9wczogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnVzZXIucmF3ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiBnQXV0aGVudGljYXRpb25FZmZlY3RzLmNoZWNrVXNlckF1dGhlbnRpY2F0ZWQoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2dpbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuXHJcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcclxuICAgICAgICAgICAgS2V5cy5zdGFydFVybCxcclxuICAgICAgICAgICAgY3VycmVudFVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7c3RhdGUuc2V0dGluZ3MuYmZmVXJsfS8ke3N0YXRlLnNldHRpbmdzLmRlZmF1bHRMb2dpblBhdGh9P3JldHVyblVybD0vYDtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKHVybCk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJBdXRoZW50aWNhdGlvbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcbiAgICAgICAgZ0F1dGhlbnRpY2F0aW9uQ29kZS5jbGVhckF1dGhlbnRpY2F0aW9uKHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb25BbmRTaG93TG9naW46IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnQXV0aGVudGljYXRpb25Db2RlLmNsZWFyQXV0aGVudGljYXRpb24oc3RhdGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5sb2dpbihzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvZ291dDogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24oc3RhdGUudXNlci5sb2dvdXRVcmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQXV0aGVudGljYXRpb25BY3Rpb25zO1xyXG4iLCJpbXBvcnQgeyBnSHR0cCB9IGZyb20gXCIuL2dIdHRwXCI7XHJcblxyXG5pbXBvcnQgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1wiO1xyXG5pbXBvcnQgSUh0dHBQcm9wcyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwUHJvcHNcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uQWN0aW9uc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnQXV0aGVudGljYXRlZEh0dHAocHJvcHM6IElIdHRwUHJvcHMpOiBhbnkge1xyXG5cclxuICAgIGNvbnN0IGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgPSBwcm9wcyBhcyBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcztcclxuXHJcbiAgICAvLyAvLyBUbyByZWdpc3RlciBmYWlsZWQgYXV0aGVudGljYXRpb25cclxuICAgIC8vIGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllcy5vbkF1dGhlbnRpY2F0aW9uRmFpbEFjdGlvbiA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2xlYXJBdXRoZW50aWNhdGlvbjtcclxuXHJcbiAgICAvLyBUbyByZWdpc3RlciBmYWlsZWQgYXV0aGVudGljYXRpb24gYW5kIHNob3cgbG9naW4gcGFnZVxyXG4gICAgaHR0cEF1dGhlbnRpY2F0ZWRQcm9wZXJ0aWVzLm9uQXV0aGVudGljYXRpb25GYWlsQWN0aW9uID0gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5jbGVhckF1dGhlbnRpY2F0aW9uQW5kU2hvd0xvZ2luO1xyXG5cclxuICAgIHJldHVybiBnSHR0cChodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXMpO1xyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuLi9odHRwL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcblxyXG5jb25zdCBydW5BY3Rpb25Jbm5lciA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogYW55KTogdm9pZCA9PiB7XHJcblxyXG4gICAgZGlzcGF0Y2goXHJcbiAgICAgICAgcHJvcHMuYWN0aW9uLFxyXG4gICAgKTtcclxufTtcclxuXHJcblxyXG5jb25zdCBydW5BY3Rpb24gPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVldWVkRWZmZWN0czogQXJyYXk8SUFjdGlvbj5cclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGNvbnN0IGVmZmVjdHM6IGFueVtdID0gW107XHJcblxyXG4gICAgcXVldWVkRWZmZWN0cy5mb3JFYWNoKChhY3Rpb246IElBY3Rpb24pID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvcHMgPSB7XHJcbiAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICBlcnJvcjogKF9zdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgcnVubmluZyBhY3Rpb24gaW4gcmVwZWF0QWN0aW9uc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke3J1bkFjdGlvbn0sXHJcbiAgICAgICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJFcnJvciBydW5uaW5nIGFjdGlvbiBpbiByZXBlYXRBY3Rpb25zXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIGVmZmVjdHMucHVzaChbXHJcbiAgICAgICAgICAgIHJ1bkFjdGlvbklubmVyLFxyXG4gICAgICAgICAgICBwcm9wc1xyXG4gICAgICAgIF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3Qgc2VuZFJlcXVlc3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVldWVkRWZmZWN0czogQXJyYXk8SUh0dHBFZmZlY3Q+XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBjb25zdCBlZmZlY3RzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHF1ZXVlZEVmZmVjdHMuZm9yRWFjaCgoaHR0cEVmZmVjdDogSUh0dHBFZmZlY3QpID0+IHtcclxuXHJcbiAgICAgICAgZ2V0RWZmZWN0KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgaHR0cEVmZmVjdCxcclxuICAgICAgICAgICAgZWZmZWN0cyxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0RWZmZWN0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGh0dHBFZmZlY3Q6IElIdHRwRWZmZWN0LFxyXG4gICAgZWZmZWN0czogQXJyYXk8SUh0dHBFZmZlY3Q+XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IHVybDogc3RyaW5nID0gaHR0cEVmZmVjdC51cmw7XHJcbiAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGNhbGxJRCxcclxuICAgICAgICBBY3Rpb25UeXBlLkdldFN0ZXBcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgZWZmZWN0ID0gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBwYXJzZVR5cGU6IGh0dHBFZmZlY3QucGFyc2VUeXBlLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogJ2pzb24nLFxyXG4gICAgICAgIGFjdGlvbjogaHR0cEVmZmVjdC5hY3Rpb25EZWxlZ2F0ZSxcclxuICAgICAgICBlcnJvcjogKF9zdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBwb3N0aW5nIGdSZXBlYXRBY3Rpb25zIGRhdGEgdG8gdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRFZmZlY3QubmFtZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgYWxlcnQoXCJFcnJvciBwb3N0aW5nIGdSZXBlYXRBY3Rpb25zIGRhdGEgdG8gdGhlIHNlcnZlclwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBlZmZlY3RzLnB1c2goZWZmZWN0KTtcclxufTtcclxuXHJcbmNvbnN0IGdSZXBlYXRBY3Rpb25zID0ge1xyXG5cclxuICAgIGh0dHBTaWxlbnRSZUxvYWRJbW1lZGlhdGU6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBNdXN0IHJldHVybiBhbHRlcmVkIHN0YXRlIGZvciB0aGUgc3Vic2NyaXB0aW9uIG5vdCB0byBnZXQgcmVtb3ZlZFxyXG4gICAgICAgICAgICAvLyByZXR1cm4gc3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZUxvYWRIdHRwRWZmZWN0c0ltbWVkaWF0ZTogQXJyYXk8SUh0dHBFZmZlY3Q+ID0gc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZSA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VuZFJlcXVlc3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZUxvYWRIdHRwRWZmZWN0c0ltbWVkaWF0ZVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNpbGVudFJ1bkFjdGlvbkltbWVkaWF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gTXVzdCByZXR1cm4gYWx0ZXJlZCBzdGF0ZSBmb3IgdGhlIHN1YnNjcmlwdGlvbiBub3QgdG8gZ2V0IHJlbW92ZWRcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHN0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcnVuQWN0aW9uSW1tZWRpYXRlOiBBcnJheTxJQWN0aW9uPiA9IHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlID0gW107XHJcblxyXG4gICAgICAgIHJldHVybiBydW5BY3Rpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBydW5BY3Rpb25JbW1lZGlhdGVcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1JlcGVhdEFjdGlvbnM7XHJcblxyXG4iLCJpbXBvcnQgeyBpbnRlcnZhbCB9IGZyb20gXCIuLi8uLi9oeXBlckFwcC90aW1lXCI7XHJcblxyXG5pbXBvcnQgZ1JlcGVhdEFjdGlvbnMgZnJvbSBcIi4uL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgcmVwZWF0U3Vic2NyaXB0aW9ucyA9IHtcclxuXHJcbiAgICBidWlsZFJlcGVhdFN1YnNjcmlwdGlvbnM6IChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1aWxkUmVMb2FkRGF0YUltbWVkaWF0ZSA9ICgpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsKFxyXG4gICAgICAgICAgICAgICAgICAgIGdSZXBlYXRBY3Rpb25zLmh0dHBTaWxlbnRSZUxvYWRJbW1lZGlhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgeyBkZWxheTogMTAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1aWxkUnVuQWN0aW9uc0ltbWVkaWF0ZSA9ICgpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJ2YWwoXHJcbiAgICAgICAgICAgICAgICAgICAgZ1JlcGVhdEFjdGlvbnMuc2lsZW50UnVuQWN0aW9uSW1tZWRpYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHsgZGVsYXk6IDEwIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCByZXBlYXRTdWJzY3JpcHRpb246IGFueVtdID0gW1xyXG5cclxuICAgICAgICAgICAgYnVpbGRSZUxvYWREYXRhSW1tZWRpYXRlKCksXHJcbiAgICAgICAgICAgIGJ1aWxkUnVuQWN0aW9uc0ltbWVkaWF0ZSgpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlcGVhdFN1YnNjcmlwdGlvbjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHJlcGVhdFN1YnNjcmlwdGlvbnM7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgcmVwZWF0U3Vic2NyaXB0aW9ucyBmcm9tIFwiLi4vLi4vLi4vc3Vic2NyaXB0aW9ucy9yZXBlYXRTdWJzY3JpcHRpb25cIjtcclxuXHJcblxyXG5jb25zdCBpbml0U3Vic2NyaXB0aW9ucyA9IChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zOiBhbnlbXSA9IFtcclxuXHJcbiAgICAgICAgLi4ucmVwZWF0U3Vic2NyaXB0aW9ucy5idWlsZFJlcGVhdFN1YnNjcmlwdGlvbnMoc3RhdGUpXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFN1YnNjcmlwdGlvbnM7XHJcblxyXG4iLCJcclxuY29uc3QgRmlsdGVycyA9IHtcclxuXHJcbiAgICB0cmVlU29sdmVHdWlkZUlEOiBcInRyZWVTb2x2ZUd1aWRlXCIsXHJcbiAgICB0cmVlU29sdmVGcmFnbWVudHNJRDogXCJ0cmVlU29sdmVGcmFnbWVudHNcIixcclxuICAgIHVwTmF2RWxlbWVudDogJyNzdGVwTmF2IC5jaGFpbi11cHdhcmRzJyxcclxuICAgIGRvd25OYXZFbGVtZW50OiAnI3N0ZXBOYXYgLmNoYWluLWRvd253YXJkcycsXHJcblxyXG4gICAgZnJhZ21lbnRCb3g6ICcjdHJlZVNvbHZlRnJhZ21lbnRzIC5udC1mci1mcmFnbWVudC1ib3gnLFxyXG4gICAgZnJhZ21lbnRCb3hEaXNjdXNzaW9uOiAnI3RyZWVTb2x2ZUZyYWdtZW50cyAubnQtZnItZnJhZ21lbnQtYm94IC5udC1mci1mcmFnbWVudC1kaXNjdXNzaW9uJyxcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmlsdGVycztcclxuIiwiaW1wb3J0IEZpbHRlcnMgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzXCI7XHJcblxyXG5cclxuY29uc3Qgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCA9ICgpID0+IHtcclxuXHJcbiAgICBjb25zdCBmcmFnbWVudEJveERpc2N1c3Npb25zOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChGaWx0ZXJzLmZyYWdtZW50Qm94RGlzY3Vzc2lvbik7XHJcbiAgICBsZXQgZnJhZ21lbnRCb3g6IEhUTUxEaXZFbGVtZW50O1xyXG4gICAgbGV0IGRhdGFEaXNjdXNzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFnbWVudEJveERpc2N1c3Npb25zLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Qm94ID0gZnJhZ21lbnRCb3hEaXNjdXNzaW9uc1tpXSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgICAgICBkYXRhRGlzY3Vzc2lvbiA9IGZyYWdtZW50Qm94LmRhdGFzZXQuZGlzY3Vzc2lvbjtcclxuXHJcbiAgICAgICAgaWYgKGRhdGFEaXNjdXNzaW9uICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50Qm94LmlubmVySFRNTCA9IGRhdGFEaXNjdXNzaW9uO1xyXG4gICAgICAgICAgICBkZWxldGUgZnJhZ21lbnRCb3guZGF0YXNldC5kaXNjdXNzaW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQ7XHJcbiIsImltcG9ydCBvbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkIGZyb20gXCIuLi8uLi9mcmFnbWVudHMvY29kZS9vbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkXCI7XHJcblxyXG5cclxuY29uc3Qgb25SZW5kZXJGaW5pc2hlZCA9ICgpID0+IHtcclxuXHJcbiAgICBvbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkKCk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvblJlbmRlckZpbmlzaGVkO1xyXG4iLCJpbXBvcnQgb25SZW5kZXJGaW5pc2hlZCBmcm9tIFwiLi9vblJlbmRlckZpbmlzaGVkXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdEV2ZW50cyA9IHtcclxuXHJcbiAgb25SZW5kZXJGaW5pc2hlZDogKCkgPT4ge1xyXG5cclxuICAgIG9uUmVuZGVyRmluaXNoZWQoKTtcclxuICB9LFxyXG5cclxuICByZWdpc3Rlckdsb2JhbEV2ZW50czogKCkgPT4ge1xyXG5cclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9ICgpID0+IHtcclxuXHJcbiAgICAgIGluaXRFdmVudHMub25SZW5kZXJGaW5pc2hlZCgpO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRFdmVudHM7XHJcblxyXG5cclxuXHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdEFjdGlvbnMgPSB7XHJcblxyXG4gICAgc2V0Tm90UmF3OiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghd2luZG93Py5UcmVlU29sdmU/LnNjcmVlbj8uaXNBdXRvZm9jdXNGaXJzdFJ1bikge1xyXG5cclxuICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uYXV0b2ZvY3VzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5pc0F1dG9mb2N1c0ZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0QWN0aW9ucztcclxuIiwiXHJcbmV4cG9ydCBlbnVtIFBhcnNlVHlwZSB7XHJcblxyXG4gICAgTm9uZSA9ICdub25lJyxcclxuICAgIEpzb24gPSAnanNvbicsXHJcbiAgICBUZXh0ID0gJ3RleHQnXHJcbn1cclxuXHJcbiIsImltcG9ydCBJUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckZyYWdtZW50VUkgaW1wbGVtZW50cyBJUmVuZGVyRnJhZ21lbnRVSSB7XHJcblxyXG4gICAgcHVibGljIGZyYWdtZW50T3B0aW9uc0V4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgZGlzY3Vzc2lvbkxvYWRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGFuY2lsbGFyeUV4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgZG9Ob3RQYWludDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNlY3Rpb25JbmRleDogbnVtYmVyID0gMDtcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudFVJIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL0lSZW5kZXJGcmFnbWVudFVJXCI7XHJcbmltcG9ydCBSZW5kZXJGcmFnbWVudFVJIGZyb20gXCIuLi91aS9SZW5kZXJGcmFnbWVudFVJXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyRnJhZ21lbnQgaW1wbGVtZW50cyBJUmVuZGVyRnJhZ21lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGxcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG4gICAgICAgIHRoaXMucGFyZW50RnJhZ21lbnRJRCA9IHBhcmVudEZyYWdtZW50SUQ7XHJcbiAgICAgICAgdGhpcy5zZWdtZW50SW5kZXggPSBzZWdtZW50SW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlkOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgaUtleTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgaUV4aXRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGV4aXRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHRvcExldmVsTWFwS2V5OiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBtYXBLZXlDaGFpbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZ3VpZGVJRDogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZ3VpZGVQYXRoOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHNlbGVjdGVkOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBpc0xlYWY6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+ID0gW107XHJcbiAgICBwdWJsaWMgdmFyaWFibGU6IEFycmF5PFtzdHJpbmddIHwgW3N0cmluZywgc3RyaW5nXT4gPSBbXTtcclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBpc0FuY2lsbGFyeTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG9yZGVyOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyBsaW5rOiBJRGlzcGxheUNoYXJ0IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uO1xyXG4gICAgcHVibGljIHNlZ21lbnRJbmRleDogbnVtYmVyIHwgbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgdWk6IElSZW5kZXJGcmFnbWVudFVJID0gbmV3IFJlbmRlckZyYWdtZW50VUkoKTtcclxufVxyXG4iLCJcclxuZXhwb3J0IGVudW0gT3V0bGluZVR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBOb2RlID0gJ25vZGUnLFxyXG4gICAgRXhpdCA9ICdleGl0JyxcclxuICAgIExpbmsgPSAnbGluaydcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJPdXRsaW5lTm9kZSBpbXBsZW1lbnRzIElSZW5kZXJPdXRsaW5lTm9kZSB7XHJcblxyXG4gICAgcHVibGljIGk6IHN0cmluZyA9ICcnOyAvLyBpZFxyXG4gICAgcHVibGljIGM6IG51bWJlciB8IG51bGwgPSBudWxsOyAvLyBpbmRleCBmcm9tIG91dGxpbmUgY2hhcnQgYXJyYXlcclxuICAgIHB1YmxpYyB4OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkID0gbnVsbDsgLy8gaUV4aXQgaWRcclxuICAgIHB1YmxpYyBfeDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCA9IG51bGw7IC8vIGV4aXQgaWRcclxuICAgIHB1YmxpYyBvOiBBcnJheTxJUmVuZGVyT3V0bGluZU5vZGU+ID0gW107IC8vIG9wdGlvbnNcclxuICAgIHB1YmxpYyBwYXJlbnQ6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHR5cGU6IE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuICAgIHB1YmxpYyBpc0NoYXJ0OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBpc1Jvb3Q6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBpc0xhc3Q6IGJvb2xlYW4gPSBmYWxzZTtcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4vUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJPdXRsaW5lIGltcGxlbWVudHMgSVJlbmRlck91dGxpbmUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBhdGg6IHN0cmluZykge1xyXG5cclxuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwYXRoOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgbG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHY6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHI6IElSZW5kZXJPdXRsaW5lTm9kZSA9IG5ldyBSZW5kZXJPdXRsaW5lTm9kZSgpO1xyXG4gICAgcHVibGljIGM6IEFycmF5PElSZW5kZXJPdXRsaW5lQ2hhcnQ+ID0gW107XHJcbiAgICBwdWJsaWMgZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gICAgcHVibGljIG12OiBhbnkgfCB1bmRlZmluZWQ7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJPdXRsaW5lQ2hhcnQgaW1wbGVtZW50cyBJUmVuZGVyT3V0bGluZUNoYXJ0IHtcclxuXHJcbiAgICBwdWJsaWMgaTogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgcDogc3RyaW5nID0gJyc7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5R3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUd1aWRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uL3JlbmRlci9SZW5kZXJGcmFnbWVudFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BsYXlHdWlkZSBpbXBsZW1lbnRzIElEaXNwbGF5R3VpZGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIGd1aWRlOiBJUmVuZGVyR3VpZGUsXHJcbiAgICAgICAgcm9vdElEOiBzdHJpbmdcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMubGlua0lEID0gbGlua0lEO1xyXG4gICAgICAgIHRoaXMuZ3VpZGUgPSBndWlkZTtcclxuXHJcbiAgICAgICAgdGhpcy5yb290ID0gbmV3IFJlbmRlckZyYWdtZW50KFxyXG4gICAgICAgICAgICByb290SUQsXHJcbiAgICAgICAgICAgIFwiZ3VpZGVSb290XCIsXHJcbiAgICAgICAgICAgIHRoaXMsXHJcbiAgICAgICAgICAgIDBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsaW5rSUQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBndWlkZTogSVJlbmRlckd1aWRlO1xyXG4gICAgcHVibGljIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgcm9vdDogSVJlbmRlckZyYWdtZW50O1xyXG4gICAgcHVibGljIGN1cnJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJHdWlkZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckd1aWRlIGltcGxlbWVudHMgSVJlbmRlckd1aWRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaWQ6IHN0cmluZztcclxuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZGVzY3JpcHRpb246IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHBhdGg6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxufVxyXG4iLCJcclxuZXhwb3J0IGVudW0gU2Nyb2xsSG9wVHlwZSB7XHJcbiAgICBOb25lID0gXCJub25lXCIsXHJcbiAgICBVcCA9IFwidXBcIixcclxuICAgIERvd24gPSBcImRvd25cIlxyXG59XHJcbiIsImltcG9ydCB7IFNjcm9sbEhvcFR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9TY3JvbGxIb3BUeXBlXCI7XHJcbmltcG9ydCBJU2NyZWVuIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3dpbmRvdy9JU2NyZWVuXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NyZWVuIGltcGxlbWVudHMgSVNjcmVlbiB7XHJcblxyXG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzQXV0b2ZvY3VzRmlyc3RSdW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGhpZGVCYW5uZXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBzY3JvbGxUb1RvcDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNjcm9sbFRvRWxlbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2Nyb2xsSG9wOiBTY3JvbGxIb3BUeXBlID0gU2Nyb2xsSG9wVHlwZS5Ob25lO1xyXG4gICAgcHVibGljIGxhc3RTY3JvbGxZOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyB1YTogYW55IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElTY3JlZW4gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lTY3JlZW5cIjtcclxuaW1wb3J0IElUcmVlU29sdmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lUcmVlU29sdmVcIjtcclxuaW1wb3J0IFNjcmVlbiBmcm9tIFwiLi9TY3JlZW5cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmVlU29sdmUgaW1wbGVtZW50cyBJVHJlZVNvbHZlIHtcclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyaW5nQ29tbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2NyZWVuOiBJU2NyZWVuID0gbmV3IFNjcmVlbigpO1xyXG59XHJcbiIsIlxyXG5cclxuY29uc3QgZ0ZpbGVDb25zdGFudHMgPSB7XHJcblxyXG4gICAgZnJhZ21lbnRzRm9sZGVyU3VmZml4OiAnX2ZyYWdzJyxcclxuICAgIGZyYWdtZW50RmlsZUV4dGVuc2lvbjogJy5odG1sJyxcclxuICAgIGd1aWRlT3V0bGluZUZpbGVuYW1lOiAnb3V0bGluZS50c29sbicsXHJcbiAgICBndWlkZVJlbmRlckNvbW1lbnRUYWc6ICd0c0d1aWRlUmVuZGVyQ29tbWVudCAnLFxyXG4gICAgZnJhZ21lbnRSZW5kZXJDb21tZW50VGFnOiAndHNGcmFnbWVudFJlbmRlckNvbW1lbnQgJyxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdGaWxlQ29uc3RhbnRzO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJHdWlkZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckd1aWRlXCI7XHJcbmltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5pbXBvcnQgRGlzcGxheUd1aWRlIGZyb20gXCIuLi8uLi9zdGF0ZS9kaXNwbGF5L0Rpc3BsYXlHdWlkZVwiO1xyXG5pbXBvcnQgUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJHdWlkZVwiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4vZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi9nU3RhdGVDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgcGFyc2VHdWlkZSA9IChyYXdHdWlkZTogYW55KTogSVJlbmRlckd1aWRlID0+IHtcclxuXHJcbiAgICBjb25zdCBndWlkZTogSVJlbmRlckd1aWRlID0gbmV3IFJlbmRlckd1aWRlKHJhd0d1aWRlLmlkKTtcclxuICAgIGd1aWRlLnRpdGxlID0gcmF3R3VpZGUudGl0bGUgPz8gJyc7XHJcbiAgICBndWlkZS5kZXNjcmlwdGlvbiA9IHJhd0d1aWRlLmRlc2NyaXB0aW9uID8/ICcnO1xyXG4gICAgZ3VpZGUucGF0aCA9IHJhd0d1aWRlLnBhdGggPz8gbnVsbDtcclxuICAgIGd1aWRlLmZyYWdtZW50Rm9sZGVyVXJsID0gZ1JlbmRlckNvZGUuZ2V0RnJhZ21lbnRGb2xkZXJVcmwocmF3R3VpZGUuZnJhZ21lbnRGb2xkZXJQYXRoKTtcclxuXHJcbiAgICByZXR1cm4gZ3VpZGU7XHJcbn07XHJcblxyXG5jb25zdCBwYXJzZVJlbmRlcmluZ0NvbW1lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmF3OiBhbnlcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFyYXcpIHtcclxuICAgICAgICByZXR1cm4gcmF3O1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbntcclxuICAgIFwiZ3VpZGVcIjoge1xyXG4gICAgICAgIFwiaWRcIjogXCJkQnQ3Sk4xdnRcIlxyXG4gICAgfSxcclxuICAgIFwiZnJhZ21lbnRcIjoge1xyXG4gICAgICAgIFwiaWRcIjogXCJkQnQ3Sk4xdnRcIixcclxuICAgICAgICBcInRvcExldmVsTWFwS2V5XCI6IFwiY3YxVFJsMDFyZlwiLFxyXG4gICAgICAgIFwibWFwS2V5Q2hhaW5cIjogXCJjdjFUUmwwMXJmXCIsXHJcbiAgICAgICAgXCJndWlkZUlEXCI6IFwiZEJ0N0pOMUhlXCIsXHJcbiAgICAgICAgXCJndWlkZVBhdGhcIjogXCJjOi9HaXRIdWIvVEVTVC5Eb2N1bWVudGF0aW9uL3RzbWFwc2RhdGFPcHRpb25zRm9sZGVyL0hvbGRlci9kYXRhT3B0aW9ucy50c21hcFwiLFxyXG4gICAgICAgIFwicGFyZW50RnJhZ21lbnRJRFwiOiBudWxsLFxyXG4gICAgICAgIFwiY2hhcnRLZXlcIjogXCJjdjFUUmwwMXJmXCIsXHJcbiAgICAgICAgXCJvcHRpb25zXCI6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImRCdDdLWjFBTlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcHRpb25cIjogXCJPcHRpb24gMVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpc0FuY2lsbGFyeVwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwib3JkZXJcIjogMVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZEJ0N0taMVJiXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9wdGlvblwiOiBcIk9wdGlvbiAyXCIsXHJcbiAgICAgICAgICAgICAgICBcImlzQW5jaWxsYXJ5XCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgXCJvcmRlclwiOiAyXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkQnQ3S1oyNEJcIixcclxuICAgICAgICAgICAgICAgIFwib3B0aW9uXCI6IFwiT3B0aW9uIDNcIixcclxuICAgICAgICAgICAgICAgIFwiaXNBbmNpbGxhcnlcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBcIm9yZGVyXCI6IDNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH1cclxufSAgICBcclxuICAgICovXHJcblxyXG4gICAgY29uc3QgZ3VpZGUgPSBwYXJzZUd1aWRlKHJhdy5ndWlkZSk7XHJcblxyXG4gICAgY29uc3QgZGlzcGxheUd1aWRlID0gbmV3IERpc3BsYXlHdWlkZShcclxuICAgICAgICBnU3RhdGVDb2RlLmdldEZyZXNoS2V5SW50KHN0YXRlKSxcclxuICAgICAgICBndWlkZSxcclxuICAgICAgICByYXcuZnJhZ21lbnQuaWRcclxuICAgICk7XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRHdWlkZVJvb3RGcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICByYXcuZnJhZ21lbnQsXHJcbiAgICAgICAgZGlzcGxheUd1aWRlLnJvb3RcclxuICAgICk7XHJcblxyXG4gICAgc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlID0gZGlzcGxheUd1aWRlO1xyXG4gICAgc3RhdGUucmVuZGVyU3RhdGUuY3VycmVudFNlY3Rpb24gPSBkaXNwbGF5R3VpZGU7XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5jYWNoZVNlY3Rpb25Sb290KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGdSZW5kZXJDb2RlID0ge1xyXG5cclxuICAgIGdldEZyYWdtZW50Rm9sZGVyVXJsOiAoZm9sZGVyUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGxldCBkaXZpZGVyID0gJyc7XHJcblxyXG4gICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZm9sZGVyUGF0aCkpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghbG9jYXRpb24ub3JpZ2luLmVuZHNXaXRoKCcvJykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWZvbGRlclBhdGguc3RhcnRzV2l0aCgnLycpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRpdmlkZXIgPSAnLyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZm9sZGVyUGF0aC5zdGFydHNXaXRoKCcvJykgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyUGF0aCA9IGZvbGRlclBhdGguc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYCR7bG9jYXRpb24ub3JpZ2lufSR7ZGl2aWRlcn0ke2ZvbGRlclBhdGh9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuXHJcbiAgICByZWdpc3Rlckd1aWRlQ29tbWVudDogKCkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB0cmVlU29sdmVHdWlkZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChGaWx0ZXJzLnRyZWVTb2x2ZUd1aWRlSUQpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgICAgICBpZiAodHJlZVNvbHZlR3VpZGVcclxuICAgICAgICAgICAgJiYgdHJlZVNvbHZlR3VpZGUuaGFzQ2hpbGROb2RlcygpID09PSB0cnVlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZE5vZGU6IENoaWxkTm9kZTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJlZVNvbHZlR3VpZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5DT01NRU5UX05PREUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cuVHJlZVNvbHZlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlID0gbmV3IFRyZWVTb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5yZW5kZXJpbmdDb21tZW50ID0gY2hpbGROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgIT09IE5vZGUuVEVYVF9OT0RFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlUmVuZGVyaW5nQ29tbWVudDogKHN0YXRlOiBJU3RhdGUpID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCF3aW5kb3cuVHJlZVNvbHZlPy5yZW5kZXJpbmdDb21tZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBndWlkZVJlbmRlckNvbW1lbnQgPSB3aW5kb3cuVHJlZVNvbHZlLnJlbmRlcmluZ0NvbW1lbnQ7XHJcbiAgICAgICAgICAgIGd1aWRlUmVuZGVyQ29tbWVudCA9IGd1aWRlUmVuZGVyQ29tbWVudC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWd1aWRlUmVuZGVyQ29tbWVudC5zdGFydHNXaXRoKGdGaWxlQ29uc3RhbnRzLmd1aWRlUmVuZGVyQ29tbWVudFRhZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ3VpZGVSZW5kZXJDb21tZW50ID0gZ3VpZGVSZW5kZXJDb21tZW50LnN1YnN0cmluZyhnRmlsZUNvbnN0YW50cy5ndWlkZVJlbmRlckNvbW1lbnRUYWcubGVuZ3RoKTtcclxuICAgICAgICAgICAgY29uc3QgcmF3ID0gSlNPTi5wYXJzZShndWlkZVJlbmRlckNvbW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgcGFyc2VSZW5kZXJpbmdDb21tZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByYXdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZ2lzdGVyRnJhZ21lbnRDb21tZW50OiAoKSA9PiB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnUmVuZGVyQ29kZTtcclxuIiwiaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGxheUNoYXJ0IGltcGxlbWVudHMgSURpc3BsYXlDaGFydCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnRcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMubGlua0lEID0gbGlua0lEO1xyXG4gICAgICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbGlua0lEOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQ7XHJcbiAgICBwdWJsaWMgb3V0bGluZTogSVJlbmRlck91dGxpbmUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyByb290OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGN1cnJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG59XHJcbiIsImltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBJQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lDaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IElTZWdtZW50Tm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JU2VnbWVudE5vZGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGFpblNlZ21lbnQgaW1wbGVtZW50cyBJQ2hhaW5TZWdtZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBpbmRleDogbnVtYmVyLFxyXG4gICAgICAgIHN0YXJ0OiBJU2VnbWVudE5vZGUsXHJcbiAgICAgICAgZW5kOiBJU2VnbWVudE5vZGVcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XHJcbiAgICAgICAgdGhpcy5lbmQgPSBlbmQ7XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gYCR7c3RhcnQudGV4dH0ke2VuZD8udGV4dCA/PyAnJ31gO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbmRleDogbnVtYmVyO1xyXG4gICAgcHVibGljIHRleHQ6IHN0cmluZztcclxuICAgIHB1YmxpYyBvdXRsaW5lTm9kZXM6IEFycmF5PElSZW5kZXJPdXRsaW5lTm9kZT4gPSBbXTtcclxuICAgIHB1YmxpYyBvdXRsaW5lTm9kZXNMb2FkZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgc3RhcnQ6IElTZWdtZW50Tm9kZTtcclxuICAgIHB1YmxpYyBlbmQ6IElTZWdtZW50Tm9kZTtcclxuXHJcbiAgICBwdWJsaWMgc2VnbWVudEluU2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2VnbWVudFNlY3Rpb246IElEaXNwbGF5U2VjdGlvbiB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHNlZ21lbnRPdXRTZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24gfCBudWxsID0gbnVsbDtcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5pbXBvcnQgSVNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lTZWdtZW50Tm9kZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlZ21lbnROb2RlIGltcGxlbWVudHMgSVNlZ21lbnROb2Rle1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHRleHQ6IHN0cmluZyxcclxuICAgICAgICBrZXk6IHN0cmluZyxcclxuICAgICAgICB0eXBlOiBPdXRsaW5lVHlwZSxcclxuICAgICAgICBpc1Jvb3Q6IGJvb2xlYW4sXHJcbiAgICAgICAgaXNMYXN0OiBib29sZWFuXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMua2V5ID0ga2V5O1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5pc1Jvb3QgPSBpc1Jvb3Q7XHJcbiAgICAgICAgdGhpcy5pc0xhc3QgPSBpc0xhc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRleHQ6IHN0cmluZztcclxuICAgIHB1YmxpYyBrZXk6IHN0cmluZztcclxuICAgIHB1YmxpYyB0eXBlOiBPdXRsaW5lVHlwZTtcclxuICAgIHB1YmxpYyBpc1Jvb3Q6IGJvb2xlYW47XHJcbiAgICBwdWJsaWMgaXNMYXN0OiBib29sZWFuO1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcbmltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBJQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lDaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IElTZWdtZW50Tm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JU2VnbWVudE5vZGVcIjtcclxuaW1wb3J0IENoYWluU2VnbWVudCBmcm9tIFwiLi4vLi4vc3RhdGUvc2VnbWVudHMvQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBTZWdtZW50Tm9kZSBmcm9tIFwiLi4vLi4vc3RhdGUvc2VnbWVudHMvU2VnbWVudE5vZGVcIjtcclxuaW1wb3J0IGdVdGlsaXRpZXMgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4vZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi9nU3RhdGVDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgY2hlY2tGb3JMaW5rRXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIGxpbmtTZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoc2VnbWVudC5lbmQua2V5ICE9PSBsaW5rU2VnbWVudC5zdGFydC5rZXlcclxuICAgICAgICB8fCBzZWdtZW50LmVuZC50eXBlICE9PSBsaW5rU2VnbWVudC5zdGFydC50eXBlXHJcbiAgICApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5rIHNlZ21lbnQgc3RhcnQgZG9lcyBub3QgbWF0Y2ggc2VnbWVudCBlbmRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFsaW5rU2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgaW4gc2VjdGlvbiB3YXMgbnVsbCAtIGxpbmtcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFsaW5rU2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBsaW5rXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghbGlua1NlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBvdXQgc2VjdGlvbiB3YXMgbnVsbCAtIGxpbmtcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSBub2RlIC0gbGluayBpS2V5Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChsaW5rU2VnbWVudC5zdGFydC50eXBlICE9PSBPdXRsaW5lVHlwZS5MaW5rKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSBub2RlIC0gbGluaycpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgZ2V0SWRlbnRpZmllckNoYXJhY3RlciA9IChpZGVudGlmaWVyQ2hhcjogc3RyaW5nKTogeyB0eXBlOiBPdXRsaW5lVHlwZSwgaXNMYXN0OiBib29sZWFuIH0gPT4ge1xyXG5cclxuICAgIGxldCBzdGFydE91dGxpbmVUeXBlOiBPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLk5vZGU7XHJcbiAgICBsZXQgaXNMYXN0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKGlkZW50aWZpZXJDaGFyID09PSAnficpIHtcclxuXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLkxpbms7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpZGVudGlmaWVyQ2hhciA9PT0gJ18nKSB7XHJcblxyXG4gICAgICAgIHN0YXJ0T3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5FeGl0O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoaWRlbnRpZmllckNoYXIgPT09ICctJykge1xyXG5cclxuICAgICAgICBzdGFydE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuICAgICAgICBpc0xhc3QgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBxdWVyeSBzdHJpbmcgb3V0bGluZSBub2RlIGlkZW50aWZpZXI6ICR7aWRlbnRpZmllckNoYXJ9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0eXBlOiBzdGFydE91dGxpbmVUeXBlLFxyXG4gICAgICAgIGlzTGFzdDogaXNMYXN0XHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgZ2V0S2V5RW5kSW5kZXggPSAocmVtYWluaW5nQ2hhaW46IHN0cmluZyk6IHsgaW5kZXg6IG51bWJlciwgaXNMYXN0OiBib29sZWFuIHwgbnVsbCB9ID0+IHtcclxuXHJcbiAgICBjb25zdCBzdGFydEtleUVuZEluZGV4ID0gVS5pbmRleE9mQW55KFxyXG4gICAgICAgIHJlbWFpbmluZ0NoYWluLFxyXG4gICAgICAgIFsnficsICctJywgJ18nXSxcclxuICAgICAgICAxXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChzdGFydEtleUVuZEluZGV4ID09PSAtMSkge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpbmRleDogcmVtYWluaW5nQ2hhaW4ubGVuZ3RoLFxyXG4gICAgICAgICAgICBpc0xhc3Q6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaW5kZXg6IHN0YXJ0S2V5RW5kSW5kZXgsXHJcbiAgICAgICAgaXNMYXN0OiBudWxsXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgZ2V0T3V0bGluZVR5cGUgPSAocmVtYWluaW5nQ2hhaW46IHN0cmluZyk6IHsgdHlwZTogT3V0bGluZVR5cGUsIGlzTGFzdDogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICBjb25zdCBpZGVudGlmaWVyQ2hhciA9IHJlbWFpbmluZ0NoYWluLnN1YnN0cmluZygwLCAxKTtcclxuICAgIGNvbnN0IG91dGxpbmVUeXBlID0gZ2V0SWRlbnRpZmllckNoYXJhY3RlcihpZGVudGlmaWVyQ2hhcik7XHJcblxyXG4gICAgcmV0dXJuIG91dGxpbmVUeXBlO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0TmV4dFNlZ21lbnROb2RlID0gKHJlbWFpbmluZ0NoYWluOiBzdHJpbmcpOiB7IHNlZ21lbnROb2RlOiBJU2VnbWVudE5vZGUgfCBudWxsLCBlbmRDaGFpbjogc3RyaW5nIH0gPT4ge1xyXG5cclxuICAgIGxldCBzZWdtZW50Tm9kZTogSVNlZ21lbnROb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBsZXQgZW5kQ2hhaW4gPSBcIlwiO1xyXG5cclxuICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UocmVtYWluaW5nQ2hhaW4pKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVUeXBlID0gZ2V0T3V0bGluZVR5cGUocmVtYWluaW5nQ2hhaW4pO1xyXG4gICAgICAgIGNvbnN0IGtleUVuZDogeyBpbmRleDogbnVtYmVyLCBpc0xhc3Q6IGJvb2xlYW4gfCBudWxsIH0gPSBnZXRLZXlFbmRJbmRleChyZW1haW5pbmdDaGFpbik7XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IHJlbWFpbmluZ0NoYWluLnN1YnN0cmluZyhcclxuICAgICAgICAgICAgMSxcclxuICAgICAgICAgICAga2V5RW5kLmluZGV4XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc2VnbWVudE5vZGUgPSBuZXcgU2VnbWVudE5vZGUoXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYWluLnN1YnN0cmluZygwLCBrZXlFbmQuaW5kZXgpLFxyXG4gICAgICAgICAgICBrZXksXHJcbiAgICAgICAgICAgIG91dGxpbmVUeXBlLnR5cGUsXHJcbiAgICAgICAgICAgIGZhbHNlLFxyXG4gICAgICAgICAgICBvdXRsaW5lVHlwZS5pc0xhc3RcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoa2V5RW5kLmlzTGFzdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgc2VnbWVudE5vZGUuaXNMYXN0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVuZENoYWluID0gcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKGtleUVuZC5pbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzZWdtZW50Tm9kZSxcclxuICAgICAgICBlbmRDaGFpblxyXG4gICAgfTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkU2VnbWVudCA9IChcclxuICAgIHNlZ21lbnRzOiBBcnJheTxJQ2hhaW5TZWdtZW50PixcclxuICAgIHJlbWFpbmluZ0NoYWluOiBzdHJpbmdcclxuKTogeyByZW1haW5pbmdDaGFpbjogc3RyaW5nLCBzZWdtZW50OiBJQ2hhaW5TZWdtZW50IH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IHNlZ21lbnRTdGFydCA9IGdldE5leHRTZWdtZW50Tm9kZShyZW1haW5pbmdDaGFpbik7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50U3RhcnQuc2VnbWVudE5vZGUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzdGFydCBub2RlIHdhcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbWFpbmluZ0NoYWluID0gc2VnbWVudFN0YXJ0LmVuZENoYWluO1xyXG4gICAgY29uc3Qgc2VnbWVudEVuZCA9IGdldE5leHRTZWdtZW50Tm9kZShyZW1haW5pbmdDaGFpbik7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50RW5kLnNlZ21lbnROb2RlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgZW5kIG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2VnbWVudCA9IG5ldyBDaGFpblNlZ21lbnQoXHJcbiAgICAgICAgc2VnbWVudHMubGVuZ3RoLFxyXG4gICAgICAgIHNlZ21lbnRTdGFydC5zZWdtZW50Tm9kZSxcclxuICAgICAgICBzZWdtZW50RW5kLnNlZ21lbnROb2RlXHJcbiAgICApO1xyXG5cclxuICAgIHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZW1haW5pbmdDaGFpbixcclxuICAgICAgICBzZWdtZW50XHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRSb290U2VnbWVudCA9IChcclxuICAgIHNlZ21lbnRzOiBBcnJheTxJQ2hhaW5TZWdtZW50PixcclxuICAgIHJlbWFpbmluZ0NoYWluOiBzdHJpbmdcclxuKTogeyByZW1haW5pbmdDaGFpbjogc3RyaW5nLCBzZWdtZW50OiBJQ2hhaW5TZWdtZW50IH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IHJvb3RTZWdtZW50U3RhcnQgPSBuZXcgU2VnbWVudE5vZGUoXHJcbiAgICAgICAgXCJndWlkZVJvb3RcIixcclxuICAgICAgICAnJyxcclxuICAgICAgICBPdXRsaW5lVHlwZS5Ob2RlLFxyXG4gICAgICAgIHRydWUsXHJcbiAgICAgICAgZmFsc2VcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnRFbmQgPSBnZXROZXh0U2VnbWVudE5vZGUocmVtYWluaW5nQ2hhaW4pO1xyXG5cclxuICAgIGlmICghcm9vdFNlZ21lbnRFbmQuc2VnbWVudE5vZGUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzdGFydCBub2RlIHdhcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJvb3RTZWdtZW50ID0gbmV3IENoYWluU2VnbWVudChcclxuICAgICAgICBzZWdtZW50cy5sZW5ndGgsXHJcbiAgICAgICAgcm9vdFNlZ21lbnRTdGFydCxcclxuICAgICAgICByb290U2VnbWVudEVuZC5zZWdtZW50Tm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICBzZWdtZW50cy5wdXNoKHJvb3RTZWdtZW50KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlbWFpbmluZ0NoYWluLFxyXG4gICAgICAgIHNlZ21lbnQ6IHJvb3RTZWdtZW50XHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgbG9hZFNlZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIHN0YXJ0T3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBudWxsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGdTZWdtZW50Q29kZS5sb2FkU2VnbWVudE91dGxpbmVOb2RlcyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIHN0YXJ0T3V0bGluZU5vZGVcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgbmV4dFNlZ21lbnRPdXRsaW5lTm9kZXMgPSBzZWdtZW50Lm91dGxpbmVOb2RlcztcclxuXHJcbiAgICBpZiAobmV4dFNlZ21lbnRPdXRsaW5lTm9kZXMubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICBjb25zdCBmaXJzdE5vZGUgPSBuZXh0U2VnbWVudE91dGxpbmVOb2Rlc1tuZXh0U2VnbWVudE91dGxpbmVOb2Rlcy5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgaWYgKGZpcnN0Tm9kZS5pID09PSBzZWdtZW50LnN0YXJ0LmtleSkge1xyXG5cclxuICAgICAgICAgICAgZmlyc3ROb2RlLnR5cGUgPSBzZWdtZW50LnN0YXJ0LnR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsYXN0Tm9kZSA9IG5leHRTZWdtZW50T3V0bGluZU5vZGVzWzBdO1xyXG5cclxuICAgICAgICBpZiAobGFzdE5vZGUuaSA9PT0gc2VnbWVudC5lbmQua2V5KSB7XHJcblxyXG4gICAgICAgICAgICBsYXN0Tm9kZS50eXBlID0gc2VnbWVudC5lbmQudHlwZTtcclxuICAgICAgICAgICAgbGFzdE5vZGUuaXNMYXN0ID0gc2VnbWVudC5lbmQuaXNMYXN0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmxvYWROZXh0Q2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50XHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZ1NlZ21lbnRDb2RlID0ge1xyXG5cclxuICAgIHNldE5leHRTZWdtZW50U2VjdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXIgfCBudWxsLFxyXG4gICAgICAgIGxpbms6IElEaXNwbGF5Q2hhcnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnRJbmRleFxyXG4gICAgICAgICAgICB8fCAhc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudCA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzW3NlZ21lbnRJbmRleCAtIDFdO1xyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBsaW5rO1xyXG4gICAgICAgIGNvbnN0IG5leHRTZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbc2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKG5leHRTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBsaW5rO1xyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7IC8vIFRoaXMgY291bGQgYmUgc2V0IGFnYWluIHdoZW4gdGhlIGVuZCBub2RlIGlzIHByb2Nlc3NlZFxyXG5cclxuICAgICAgICAgICAgbG9hZFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkTGlua1NlZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGxpbmtTZWdtZW50SW5kZXg6IG51bWJlcixcclxuICAgICAgICBsaW5rRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBsaW5rOiBJRGlzcGxheUNoYXJ0XHJcbiAgICApOiBJQ2hhaW5TZWdtZW50ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuXHJcbiAgICAgICAgaWYgKGxpbmtTZWdtZW50SW5kZXggPCAxKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZGV4IDwgMCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY3VycmVudFNlZ21lbnQgPSBzZWdtZW50c1tsaW5rU2VnbWVudEluZGV4IC0gMV07XHJcbiAgICAgICAgY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBsaW5rO1xyXG5cclxuICAgICAgICBpZiAobGlua1NlZ21lbnRJbmRleCA+PSBzZWdtZW50cy5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmV4dCBpbmRleCA+PSBhcnJheSBsZW5ndGgnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5leHRTZWdtZW50ID0gc2VnbWVudHNbbGlua1NlZ21lbnRJbmRleF07XHJcblxyXG4gICAgICAgIGlmICghbmV4dFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5leHQgbGluayBzZWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5leHRTZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5leHRTZWdtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV4dFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBsaW5rO1xyXG4gICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gbGluaztcclxuXHJcbiAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbi5vdXRsaW5lPy5yLmkpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOZXh0IHNlZ21lbnQgc2VjdGlvbiByb290IGtleSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzdGFydE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLm91dGxpbmU/LnIuaSBhcyBzdHJpbmdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LFxyXG4gICAgICAgICAgICBzdGFydE91dGxpbmVOb2RlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY2hlY2tGb3JMaW5rRXJyb3JzKFxyXG4gICAgICAgICAgICBjdXJyZW50U2VnbWVudCxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQsXHJcbiAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXh0U2VnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEV4aXRTZWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlcixcclxuICAgICAgICBwbHVnSUQ6IHN0cmluZ1xyXG4gICAgKTogSUNoYWluU2VnbWVudCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFNlZ21lbnQgPSBzZWdtZW50c1tzZWdtZW50SW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IGV4aXRTZWdtZW50SW5kZXggPSBzZWdtZW50SW5kZXggKyAxO1xyXG5cclxuICAgICAgICBpZiAoZXhpdFNlZ21lbnRJbmRleCA+PSBzZWdtZW50cy5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmV4dCBpbmRleCA+PSBhcnJheSBsZW5ndGgnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGV4aXRTZWdtZW50ID0gc2VnbWVudHNbZXhpdFNlZ21lbnRJbmRleF07XHJcblxyXG4gICAgICAgIGlmICghZXhpdFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4aXQgbGluayBzZWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV4aXRTZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGV4aXRTZWdtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudFNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0O1xyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBzZWdtZW50U2VjdGlvbi5wYXJlbnQ7XHJcblxyXG4gICAgICAgIGlmICghbGluaykge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTGluayBmcmFnbW50IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBsaW5rLnNlY3Rpb247XHJcbiAgICAgICAgZXhpdFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgZXhpdFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG5cclxuICAgICAgICBpZiAoIWV4aXRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgaW4gc2VjdGlvbiB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGV4aXRPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIGV4aXRTZWdtZW50LnN0YXJ0LmtleVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghZXhpdE91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeGl0T3V0bGluZU5vZGUgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZXhpdE91dGxpbmVOb2RlLl94KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhpdCBrZXkgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwbHVnT3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgcGx1Z0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFwbHVnT3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsdWdPdXRsaW5lTm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChleGl0T3V0bGluZU5vZGUuX3ggIT09IHBsdWdPdXRsaW5lTm9kZS54KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbHVnT3V0bGluZU5vZGUgZG9lcyBub3QgbWF0Y2ggZXhpdE91dGxpbmVOb2RlXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9hZFNlZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBleGl0U2VnbWVudCxcclxuICAgICAgICAgICAgcGx1Z091dGxpbmVOb2RlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGV4aXRTZWdtZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkTmV4dFNlZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IG5leHRTZWdtZW50SW5kZXggPSBzZWdtZW50LmluZGV4ICsgMTtcclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnRJbmRleCA+PSBzZWdtZW50cy5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmV4dCBpbmRleCA+PSBhcnJheSBsZW5ndGgnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5leHRTZWdtZW50ID0gc2VnbWVudHNbbmV4dFNlZ21lbnRJbmRleF07XHJcblxyXG4gICAgICAgIGlmIChuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxvYWRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0TmV4dFNlZ21lbnRPdXRsaW5lTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudFxyXG4gICAgKTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGxldCBvdXRsaW5lTm9kZSA9IHNlZ21lbnQub3V0bGluZU5vZGVzLnBvcCgpID8/IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZT8uaXNMYXN0ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3V0bGluZU5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc2VnbWVudC5vdXRsaW5lTm9kZXMubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXh0U2VnbWVudCA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzW3NlZ21lbnQuaW5kZXggKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05leHRTZWdtZW50IHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb3V0bGluZU5vZGU7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlU2VnbWVudHM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHF1ZXJ5U3RyaW5nOiBzdHJpbmdcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAocXVlcnlTdHJpbmcuc3RhcnRzV2l0aCgnPycpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBxdWVyeVN0cmluZyA9IHF1ZXJ5U3RyaW5nLnN1YnN0cmluZygxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShxdWVyeVN0cmluZykgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+ID0gW107XHJcbiAgICAgICAgbGV0IHJlbWFpbmluZ0NoYWluID0gcXVlcnlTdHJpbmc7XHJcbiAgICAgICAgbGV0IHJlc3VsdDogeyByZW1haW5pbmdDaGFpbjogc3RyaW5nLCBzZWdtZW50OiBJQ2hhaW5TZWdtZW50IH07XHJcblxyXG4gICAgICAgIHJlc3VsdCA9IGJ1aWxkUm9vdFNlZ21lbnQoXHJcbiAgICAgICAgICAgIHNlZ21lbnRzLFxyXG4gICAgICAgICAgICByZW1haW5pbmdDaGFpblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHdoaWxlICghVS5pc051bGxPcldoaXRlU3BhY2UocmVtYWluaW5nQ2hhaW4pKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBidWlsZFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50cyxcclxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ0NoYWluXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0LnNlZ21lbnQuZW5kLmlzTGFzdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYWluID0gcmVzdWx0LnJlbWFpbmluZ0NoYWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHMgPSBzZWdtZW50cztcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFNlZ21lbnRPdXRsaW5lTm9kZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IG51bGxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2VnbWVudE91dGxpbmVOb2RlczogQXJyYXk8SVJlbmRlck91dGxpbmVOb2RlPiA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoIXN0YXJ0T3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHN0YXJ0T3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudC5zZWdtZW50SW5TZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQuc3RhcnQua2V5XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXN0YXJ0T3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdGFydCBvdXRsaW5lIG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0YXJ0T3V0bGluZU5vZGUudHlwZSA9IHNlZ21lbnQuc3RhcnQudHlwZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBlbmRPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VnbWVudC5zZWdtZW50U2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIHNlZ21lbnQuZW5kLmtleVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghZW5kT3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVuZCBvdXRsaW5lIG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbmRPdXRsaW5lTm9kZS50eXBlID0gc2VnbWVudC5lbmQudHlwZTtcclxuICAgICAgICBsZXQgcGFyZW50OiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gZW5kT3V0bGluZU5vZGU7XHJcbiAgICAgICAgbGV0IGZpcnN0TG9vcCA9IHRydWU7XHJcblxyXG4gICAgICAgIHdoaWxlIChwYXJlbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHNlZ21lbnRPdXRsaW5lTm9kZXMucHVzaChwYXJlbnQpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFmaXJzdExvb3BcclxuICAgICAgICAgICAgICAgICYmIHBhcmVudD8uaXNDaGFydCA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgJiYgcGFyZW50Py5pc1Jvb3QgPT09IHRydWVcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmVudD8uaSA9PT0gc3RhcnRPdXRsaW5lTm9kZS5pKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZmlyc3RMb29wID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWdtZW50Lm91dGxpbmVOb2RlcyA9IHNlZ21lbnRPdXRsaW5lTm9kZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdTZWdtZW50Q29kZTtcclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgZ091dGxpbmVDb2RlIGZyb20gXCIuLi9jb2RlL2dPdXRsaW5lQ29kZVwiO1xyXG5pbXBvcnQgZ1NlZ21lbnRDb2RlIGZyb20gXCIuLi9jb2RlL2dTZWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4vZ0ZyYWdtZW50QWN0aW9uc1wiO1xyXG5cclxuXHJcbmNvbnN0IGdPdXRsaW5lQWN0aW9ucyA9IHtcclxuXHJcbiAgICBsb2FkR3VpZGVPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZ1xyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZEd1aWRlT3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRTZWdtZW50Q2hhcnRPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXJcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRTZWdtZW50Q2hhcnRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgc2VnbWVudEluZGV4XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRDaGFydE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcGFyZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRHdWlkZU91dGxpbmVBbmRTZWdtZW50czogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgcGF0aDogc3RyaW5nXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU7XHJcblxyXG4gICAgICAgIGlmICghc2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50c1swXTtcclxuXHJcbiAgICAgICAgaWYgKCFyb290U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmwgPSBzZWN0aW9uLmd1aWRlLmZyYWdtZW50Rm9sZGVyVXJsO1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRGb2xkZXJVcmwpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByb290U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gc2VjdGlvbjtcclxuICAgICAgICByb290U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IHNlY3Rpb247XHJcbiAgICAgICAgcm9vdFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBzZWN0aW9uO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZEd1aWRlT3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIHBhdGhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnU2VnbWVudENvZGUubG9hZFNlZ21lbnRPdXRsaW5lTm9kZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByb290U2VnbWVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpcnN0Tm9kZSA9IGdTZWdtZW50Q29kZS5nZXROZXh0U2VnbWVudE91dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcm9vdFNlZ21lbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3ROb2RlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtmaXJzdE5vZGUuaX0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5sb2FkQ2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcm9vdFNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlyc3ROb2RlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBgbG9hZENoYWluRnJhZ21lbnRgLFxyXG4gICAgICAgICAgICAgICAgUGFyc2VUeXBlLkpzb24sXHJcbiAgICAgICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdTZWdtZW50Q29kZS5sb2FkTmV4dFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJvb3RTZWdtZW50LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnT3V0bGluZUFjdGlvbnM7XHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4vZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgZ1JlbmRlckNvZGUgZnJvbSBcIi4vZ1JlbmRlckNvZGVcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ0ZyYWdtZW50QWN0aW9uc1wiO1xyXG5pbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IERpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vc3RhdGUvZGlzcGxheS9EaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGdPdXRsaW5lQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nT3V0bGluZUFjdGlvbnNcIjtcclxuaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5pbXBvcnQgZ1NlZ21lbnRDb2RlIGZyb20gXCIuL2dTZWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuXHJcblxyXG5jb25zdCBjYWNoZU5vZGVGb3JOZXdMaW5rID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBsaW5rSUQ6IG51bWJlcixcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgZ1N0YXRlQ29kZS5jYWNoZV9vdXRsaW5lTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgb3V0bGluZU5vZGVcclxuICAgICk7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3V0bGluZU5vZGUubykge1xyXG5cclxuICAgICAgICBjYWNoZU5vZGVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICBsaW5rSURcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbG9hZE5vZGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmF3Tm9kZTogYW55LFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBudWxsXHJcbik6IElSZW5kZXJPdXRsaW5lTm9kZSA9PiB7XHJcblxyXG4gICAgY29uc3Qgbm9kZSA9IG5ldyBSZW5kZXJPdXRsaW5lTm9kZSgpO1xyXG4gICAgbm9kZS5pID0gcmF3Tm9kZS5pO1xyXG4gICAgbm9kZS5jID0gcmF3Tm9kZS5jID8/IG51bGw7XHJcbiAgICBub2RlLl94ID0gcmF3Tm9kZS5feCA/PyBudWxsO1xyXG4gICAgbm9kZS54ID0gcmF3Tm9kZS54ID8/IG51bGw7XHJcbiAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcclxuICAgIG5vZGUudHlwZSA9IE91dGxpbmVUeXBlLk5vZGU7XHJcblxyXG4gICAgZ1N0YXRlQ29kZS5jYWNoZV9vdXRsaW5lTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgbm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAobm9kZS5jKSB7XHJcblxyXG4gICAgICAgIG5vZGUudHlwZSA9IE91dGxpbmVUeXBlLkxpbms7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJhd05vZGUub1xyXG4gICAgICAgICYmIEFycmF5LmlzQXJyYXkocmF3Tm9kZS5vKSA9PT0gdHJ1ZVxyXG4gICAgICAgICYmIHJhd05vZGUuby5sZW5ndGggPiAwXHJcbiAgICApIHtcclxuICAgICAgICBsZXQgbzogSVJlbmRlck91dGxpbmVOb2RlO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiByYXdOb2RlLm8pIHtcclxuXHJcbiAgICAgICAgICAgIG8gPSBsb2FkTm9kZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgbGlua0lELFxyXG4gICAgICAgICAgICAgICAgbm9kZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgbm9kZS5vLnB1c2gobyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBub2RlO1xyXG59O1xyXG5cclxuY29uc3QgbG9hZENoYXJ0cyA9IChcclxuICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgcmF3T3V0bGluZUNoYXJ0czogQXJyYXk8YW55PlxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBvdXRsaW5lLmMgPSBbXTtcclxuICAgIGxldCBjOiBJUmVuZGVyT3V0bGluZUNoYXJ0O1xyXG5cclxuICAgIGZvciAoY29uc3QgY2hhcnQgb2YgcmF3T3V0bGluZUNoYXJ0cykge1xyXG5cclxuICAgICAgICBjID0gbmV3IFJlbmRlck91dGxpbmVDaGFydCgpO1xyXG4gICAgICAgIGMuaSA9IGNoYXJ0Lmk7XHJcbiAgICAgICAgYy5wID0gY2hhcnQucDtcclxuICAgICAgICBvdXRsaW5lLmMucHVzaChjKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGdPdXRsaW5lQ29kZSA9IHtcclxuXHJcbiAgICByZWdpc3Rlck91dGxpbmVVcmxEb3dubG9hZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgdXJsOiBzdHJpbmdcclxuICAgICk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUub3V0bGluZVVybHNbdXJsXSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lVXJsc1t1cmxdID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkR3VpZGVPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZ1xyXG4gICAgKTogSVJlbmRlck91dGxpbmUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaXNwbGF5R3VpZGUgd2FzIG51bGwuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBndWlkZSA9IHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZTtcclxuICAgICAgICBjb25zdCByYXdPdXRsaW5lID0gb3V0bGluZVJlc3BvbnNlLmpzb25EYXRhO1xyXG5cclxuICAgICAgICBjb25zdCBndWlkZU91dGxpbmUgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIGd1aWRlT3V0bGluZSxcclxuICAgICAgICAgICAgZ3VpZGUubGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ3VpZGUub3V0bGluZSA9IGd1aWRlT3V0bGluZTtcclxuICAgICAgICBndWlkZU91dGxpbmUuci5pc0NoYXJ0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBzZWdtZW50c1swXTtcclxuICAgICAgICAgICAgICAgIHJvb3RTZWdtZW50LnN0YXJ0LmtleSA9IGd1aWRlT3V0bGluZS5yLmk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGd1aWRlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGd1aWRlT3V0bGluZS5yLmMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBMb2FkIG91dGxpbmUgZnJvbSB0aGF0IGxvY2F0aW9uIGFuZCBsb2FkIHJvb3RcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmVDaGFydDogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgICAgICAgICAgZ3VpZGVPdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgZ3VpZGVPdXRsaW5lLnIuY1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZ3VpZGVSb290ID0gZ3VpZGUucm9vdDtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ3VpZGVSb290KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY3VycmVudCBmcmFnbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUZyb21DaGFydF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVDaGFydCxcclxuICAgICAgICAgICAgICAgIGd1aWRlUm9vdFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChndWlkZS5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZ3VpZGUucm9vdFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGd1aWRlT3V0bGluZTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0T3V0bGluZUNoYXJ0OiAoXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgaW5kZXg6IG51bWJlclxyXG4gICAgKTogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZS5jLmxlbmd0aCA+IGluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3V0bGluZS5jW2luZGV4XTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuXHJcbiAgICBidWlsZERpc3BsYXlDaGFydEZyb21SYXdPdXRsaW5lOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICByYXdPdXRsaW5lOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiBJRGlzcGxheUNoYXJ0ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgbGluayA9IG5ldyBEaXNwbGF5Q2hhcnQoXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpLFxyXG4gICAgICAgICAgICBjaGFydFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkT3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBsaW5rLmxpbmtJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxpbmsub3V0bGluZSA9IG91dGxpbmU7XHJcbiAgICAgICAgbGluay5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgcGFyZW50LmxpbmsgPSBsaW5rO1xyXG5cclxuICAgICAgICByZXR1cm4gbGluaztcclxuICAgIH0sXHJcblxyXG4gICAgYnVpbGREaXNwbGF5Q2hhcnRGcm9tT3V0bGluZUZvck5ld0xpbms6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSURpc3BsYXlDaGFydCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBuZXcgRGlzcGxheUNoYXJ0KFxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLmdldEZyZXNoS2V5SW50KHN0YXRlKSxcclxuICAgICAgICAgICAgY2hhcnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZE91dGxpbmVQcm9wZXJ0aWVzRm9yTmV3TGluayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIGxpbmsubGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGluay5vdXRsaW5lID0gb3V0bGluZTtcclxuICAgICAgICBsaW5rLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICBwYXJlbnQubGluayA9IGxpbms7XHJcblxyXG4gICAgICAgIHJldHVybiBsaW5rO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkU2VnbWVudENoYXJ0T3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudC5saW5rKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYExpbmsgYWxyZWFkeSBsb2FkZWQsIHJvb3RJRDogJHtwYXJlbnQubGluay5yb290Py5pZH1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhd091dGxpbmUgPSBvdXRsaW5lUmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBnT3V0bGluZUNvZGUuYnVpbGREaXNwbGF5Q2hhcnRGcm9tUmF3T3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBwYXJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnU2VnbWVudENvZGUubG9hZExpbmtTZWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VnbWVudEluZGV4LFxyXG4gICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jYWNoZVNlY3Rpb25Sb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAocGFyZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTGluayBhbHJlYWR5IGxvYWRlZCwgcm9vdElEOiAke3BhcmVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmF3T3V0bGluZSA9IG91dGxpbmVSZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgbGluayA9IGdPdXRsaW5lQ29kZS5idWlsZERpc3BsYXlDaGFydEZyb21SYXdPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIHBhcmVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBOZWVkIHRvIGJ1aWxkIGEgZGlzcGxheUNIYXJ0IGhlcmVcclxuICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLnBvc3RHZXRDaGFydE91dGxpbmVSb290X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBwb3N0R2V0Q2hhcnRPdXRsaW5lUm9vdF9zdWJzY3JpcHRpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzZWN0aW9uLnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmICghc2VjdGlvbi5yb290LnVpLmRpc2N1c3Npb25Mb2FkZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY3Rpb24gcm9vdCBkaXNjdXNzaW9uIHdhcyBub3QgbG9hZGVkJyk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBzZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWN0aW9uIG91dGxpbmUgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3RGcmFnbWVuSUQgPSBvdXRsaW5lLnIuaTtcclxuICAgICAgICBjb25zdCBwYXRoID0gb3V0bGluZS5wYXRoO1xyXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7cGF0aH0vJHtyb290RnJhZ21lbklEfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRBY3Rpb24gPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZFJvb3RGcmFnbWVudEFuZFNldFNlbGVjdGVkKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIHNlY3Rpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLkFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBgbG9hZENoYXJ0T3V0bGluZVJvb3RgLFxyXG4gICAgICAgICAgICBQYXJzZVR5cGUuVGV4dCxcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBsb2FkQWN0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q2hhcnRBc0N1cnJlbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGRpc3BsYXlTZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50U2VjdGlvbiA9IGRpc3BsYXlTZWN0aW9uO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRPdXRsaW5lOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nXHJcbiAgICApOiBJUmVuZGVyT3V0bGluZSA9PiB7XHJcblxyXG4gICAgICAgIGxldCBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSA9IHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmVzW2ZyYWdtZW50Rm9sZGVyVXJsXTtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRsaW5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3V0bGluZSA9IG5ldyBSZW5kZXJPdXRsaW5lKGZyYWdtZW50Rm9sZGVyVXJsKTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lc1tmcmFnbWVudEZvbGRlclVybF0gPSBvdXRsaW5lO1xyXG5cclxuICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RnJhZ21lbnRMaW5rQ2hhcnRPdXRsaW5lOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZSA9IGZyYWdtZW50LnNlY3Rpb24ub3V0bGluZTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZnJhZ21lbnQuaWRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGU/LmMgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnQgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZT8uY1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lRnJvbUNoYXJ0X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVDaGFydCxcclxuICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRTZWdtZW50T3V0bGluZV9zdWJzY3JpcHRpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0IHwgbnVsbCxcclxuICAgICAgICBsaW5rRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlclxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghY2hhcnQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3V0bGluZUNoYXJ0IHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGlua0ZyYWdtZW50Lmxpbms/LnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMaW5rIHJvb3QgYWxyZWFkeSBsb2FkZWQ6ICR7bGlua0ZyYWdtZW50Lmxpbmsucm9vdD8uaWR9YCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmV4dFNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleDtcclxuXHJcbiAgICAgICAgaWYgKG5leHRTZWdtZW50SW5kZXggIT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgbmV4dFNlZ21lbnRJbmRleCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0UGF0aCA9IGNoYXJ0Py5wIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybCA9IGdSZW5kZXJDb2RlLmdldEZyYWdtZW50Rm9sZGVyVXJsKG91dGxpbmVDaGFydFBhdGgpIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmUgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvdXRsaW5lLmxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbGlua0ZyYWdtZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluayA9IGdPdXRsaW5lQ29kZS5idWlsZERpc3BsYXlDaGFydEZyb21PdXRsaW5lRm9yTmV3TGluayhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rRnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBnU2VnbWVudENvZGUuc2V0TmV4dFNlZ21lbnRTZWN0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudC5saW5rIGFzIElEaXNwbGF5U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkUmVxdWVzdGVkID0gZ091dGxpbmVDb2RlLnJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZFJlcXVlc3RlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFpbkNoYXJ0T3V0bGluZUZpbGVgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGBsb2FkQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICAgICAgICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdPdXRsaW5lQWN0aW9ucy5sb2FkU2VnbWVudENoYXJ0T3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rRnJhZ21lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRTZWdtZW50SW5kZXhcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBnU3RhdGVDb2RlLkFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGUoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBQYXJzZVR5cGUuSnNvbixcclxuICAgICAgICAgICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRPdXRsaW5lRnJvbUNoYXJ0X3N1YnNjcmlwdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsLFxyXG4gICAgICAgIGxpbmtGcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFjaGFydCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPdXRsaW5lQ2hhcnQgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaW5rRnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExpbmsgcm9vdCBhbHJlYWR5IGxvYWRlZDogJHtsaW5rRnJhZ21lbnQubGluay5yb290Py5pZH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVDaGFydFBhdGggPSBjaGFydD8ucCBhcyBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmwgPSBnUmVuZGVyQ29kZS5nZXRGcmFnbWVudEZvbGRlclVybChvdXRsaW5lQ2hhcnRQYXRoKSBhcyBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRGb2xkZXJVcmwpKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3V0bGluZS5sb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWxpbmtGcmFnbWVudC5saW5rKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5idWlsZERpc3BsYXlDaGFydEZyb21PdXRsaW5lRm9yTmV3TGluayhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rRnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5zZXRDaGFydEFzQ3VycmVudChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBsaW5rRnJhZ21lbnQubGluayBhcyBJRGlzcGxheVNlY3Rpb25cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLnBvc3RHZXRDaGFydE91dGxpbmVSb290X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBsaW5rRnJhZ21lbnQubGluayBhcyBJRGlzcGxheVNlY3Rpb25cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke2dGaWxlQ29uc3RhbnRzLmd1aWRlT3V0bGluZUZpbGVuYW1lfWA7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZFJlcXVlc3RlZCA9IGdPdXRsaW5lQ29kZS5yZWdpc3Rlck91dGxpbmVVcmxEb3dubG9hZChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICB1cmxcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRSZXF1ZXN0ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGBsb2FkQ2hhaW5DaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYXJ0T3V0bGluZUZpbGVgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnT3V0bGluZUFjdGlvbnMubG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rRnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBnU3RhdGVDb2RlLkFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGUoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBQYXJzZVR5cGUuSnNvbixcclxuICAgICAgICAgICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkT3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJhd091dGxpbmU6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBsaW5rSUQ6IG51bWJlclxyXG4gICAgKTogSVJlbmRlck91dGxpbmUgPT4ge1xyXG5cclxuICAgICAgICBvdXRsaW5lLnYgPSByYXdPdXRsaW5lLnY7XHJcblxyXG4gICAgICAgIGlmIChyYXdPdXRsaW5lLmNcclxuICAgICAgICAgICAgJiYgQXJyYXkuaXNBcnJheShyYXdPdXRsaW5lLmMpID09PSB0cnVlXHJcbiAgICAgICAgICAgICYmIHJhd091dGxpbmUuYy5sZW5ndGggPiAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGxvYWRDaGFydHMoXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgcmF3T3V0bGluZS5jXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmF3T3V0bGluZS5lKSB7XHJcblxyXG4gICAgICAgICAgICBvdXRsaW5lLmUgPSByYXdPdXRsaW5lLmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvdXRsaW5lLnIgPSBsb2FkTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUucixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgb3V0bGluZS5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIG91dGxpbmUuci5pc1Jvb3QgPSB0cnVlO1xyXG4gICAgICAgIG91dGxpbmUubXYgPSByYXdPdXRsaW5lLm12O1xyXG5cclxuICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZE91dGxpbmVQcm9wZXJ0aWVzRm9yTmV3TGluazogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXJcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjYWNoZU5vZGVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZS5yLFxyXG4gICAgICAgICAgICBsaW5rSURcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ091dGxpbmVDb2RlO1xyXG5cclxuIiwiXHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCB7IElIdHRwRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEZldGNoSXRlbVwiO1xyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4uL2h0dHAvZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcblxyXG5cclxuY29uc3QgZ2V0RnJhZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgZnJhZ21lbnRQYXRoOiBzdHJpbmcsXHJcbiAgICBhY3Rpb246IEFjdGlvblR5cGUsXHJcbiAgICBsb2FkQWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGNhbGxJRCxcclxuICAgICAgICBhY3Rpb25cclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudFBhdGh9YDtcclxuXHJcbiAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBwYXJzZVR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzcG9uc2U6ICd0ZXh0JyxcclxuICAgICAgICBhY3Rpb246IGxvYWRBY3Rpb24sXHJcbiAgICAgICAgZXJyb3I6IChzdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgZnJhZ21lbnQgZnJvbSB0aGUgc2VydmVyLCBwYXRoOiAke2ZyYWdtZW50UGF0aH0sIGlkOiAke2ZyYWdtZW50SUR9XCIsXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z2V0RnJhZ21lbnR9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICBhbGVydChge1xyXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgZ2V0dGluZyBmcmFnbWVudCBmcm9tIHRoZSBzZXJ2ZXIsIHBhdGg6ICR7ZnJhZ21lbnRQYXRofSwgaWQ6ICR7ZnJhZ21lbnRJRH1cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRGcmFnbWVudC5uYW1lfSxcclxuICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGdGcmFnbWVudEVmZmVjdHMgPSB7XHJcblxyXG4gICAgZ2V0RnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGZyYWdtZW50UGF0aDogc3RyaW5nXHJcbiAgICApOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRBY3Rpb246IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGUgPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBnRnJhZ21lbnRBY3Rpb25zLmxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIG5ld1N0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ld1N0YXRlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbi5pZCxcclxuICAgICAgICAgICAgZnJhZ21lbnRQYXRoLFxyXG4gICAgICAgICAgICBBY3Rpb25UeXBlLkdldEZyYWdtZW50LFxyXG4gICAgICAgICAgICBsb2FkQWN0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdGcmFnbWVudEVmZmVjdHM7XHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnT3V0bGluZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ091dGxpbmVDb2RlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4uL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdGcmFnbWVudEVmZmVjdHMgZnJvbSBcIi4uL2VmZmVjdHMvZ0ZyYWdtZW50RWZmZWN0c1wiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcblxyXG5cclxuY29uc3QgZ2V0RnJhZ21lbnRGaWxlID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBzdGF0ZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmhpZGVCYW5uZXIgPSB0cnVlO1xyXG4gICAgY29uc3QgZnJhZ21lbnRQYXRoID0gYCR7b3B0aW9uLnNlY3Rpb24/Lm91dGxpbmU/LnBhdGh9LyR7b3B0aW9uLmlkfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnRnJhZ21lbnRFZmZlY3RzLmdldEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICBmcmFnbWVudFBhdGhcclxuICAgICAgICApXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0NoYWluRnJhZ21lbnRUeXBlID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGxcclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGlmIChmcmFnbWVudCkge1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBpZCBhbmQgb3V0bGluZSBmcmFnbWVudCBpZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlLnR5cGUgPT09IE91dGxpbmVUeXBlLkxpbmspIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NMaW5rKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS50eXBlID09PSBPdXRsaW5lVHlwZS5FeGl0KSB7XHJcblxyXG4gICAgICAgICAgICBwcm9jZXNzRXhpdChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob3V0bGluZU5vZGUuaXNDaGFydCA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAmJiBvdXRsaW5lTm9kZS5pc1Jvb3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NDaGFydFJvb3QoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS5pc0xhc3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NMYXN0KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS50eXBlID09PSBPdXRsaW5lVHlwZS5Ob2RlKSB7XHJcblxyXG4gICAgICAgICAgICBwcm9jZXNzTm9kZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBmcmFnbWVudCB0eXBlLicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yTGFzdEZyYWdtZW50RXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBsYXN0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gb3V0bGluZSBub2RlIGlkIGFuZCBmcmFnbWVudCBpZCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JOb2RlRXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBub2RlXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rJyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUV4aXRLZXkpKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSBub2RlIC0gZXhpdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gb3V0bGluZSBub2RlIGlkIGFuZCBmcmFnbWVudCBpZCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JDaGFydFJvb3RFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gcm9vdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSByb290IC0gbGluaycpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlFeGl0S2V5KSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgcm9vdCAtIGV4aXQnKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yRXhpdEVycm9ycyA9IChcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gZXhpdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBvdXQgc2VjdGlvbiB3YXMgbnVsbCAtIGV4aXRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmV4aXRLZXkpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSAtIGV4aXQnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHNlZ21lbnQuZW5kLnR5cGUgIT09IE91dGxpbmVUeXBlLkV4aXQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBleGl0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzQ2hhcnRSb290ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNoZWNrRm9yQ2hhcnRSb290RXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5sb2FkTmV4dENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBzZXRMaW5rc1Jvb3QoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHNldExpbmtzUm9vdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBpblNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRJblNlY3Rpb247XHJcblxyXG4gICAgaWYgKCFpblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsIC0gY2hhcnQgcm9vdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuXHJcbiAgICBpZiAoIXNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gY2hhcnQgcm9vdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBpblNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgIHNlZ21lbnQuc3RhcnQua2V5XHJcbiAgICApO1xyXG5cclxuICAgIGlmIChwYXJlbnQ/LmxpbmspIHtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudC5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBhbmQgRnJhZ21lbnQgYXJlIHRoZSBzYW1lXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFyZW50Lmxpbmsucm9vdCA9IGZyYWdtZW50O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudEZyYWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlY3Rpb24uY3VycmVudCA9IGZyYWdtZW50O1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc05vZGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNoZWNrRm9yTm9kZUVycm9ycyhcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGdGcmFnbWVudENvZGUubG9hZE5leHRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgcHJvY2Vzc0ZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0xhc3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNoZWNrRm9yTGFzdEZyYWdtZW50RXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgcHJvY2Vzc0ZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGZyYWdtZW50LmxpbmsgPSBudWxsO1xyXG4gICAgZnJhZ21lbnQuc2VsZWN0ZWQgPSBudWxsO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5vcHRpb25zPy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLm9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzTGluayA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0bGluZSA9IGZyYWdtZW50LnNlY3Rpb24ub3V0bGluZTtcclxuXHJcbiAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmlzUm9vdCA9PT0gdHJ1ZVxyXG4gICAgICAgICYmIG91dGxpbmVOb2RlLmlzQ2hhcnQgPT09IHRydWVcclxuICAgICkge1xyXG4gICAgICAgIHNldExpbmtzUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdXRsaW5lQ2hhcnQgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgb3V0bGluZU5vZGU/LmNcclxuICAgICk7XHJcblxyXG4gICAgZ091dGxpbmVDb2RlLmdldFNlZ21lbnRPdXRsaW5lX3N1YnNjcmlwdGlvbihcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgc2VnbWVudC5pbmRleFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NFeGl0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZXhpdEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JFeGl0RXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgZXhpdEZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNlY3Rpb246IElEaXNwbGF5Q2hhcnQgPSBleGl0RnJhZ21lbnQuc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0O1xyXG4gICAgY29uc3Qgc2VjdGlvblBhcmVudCA9IHNlY3Rpb24ucGFyZW50O1xyXG5cclxuICAgIGlmICghc2VjdGlvblBhcmVudCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJRGlzcGxheUNoYXJ0IHBhcmVudCBpcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlFeGl0S2V5ID0gZXhpdEZyYWdtZW50LmV4aXRLZXk7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2Ygc2VjdGlvblBhcmVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24uaUV4aXRLZXkgPT09IGlFeGl0S2V5KSB7XHJcblxyXG4gICAgICAgICAgICBnU2VnbWVudENvZGUubG9hZEV4aXRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LmluZGV4LFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmlkXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEN1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGV4aXRGcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGxvYWRGcmFnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByZXNwb25zZTogYW55LFxyXG4gICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuKTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgY29uc3QgcGFyZW50RnJhZ21lbnRJRCA9IG9wdGlvbi5wYXJlbnRGcmFnbWVudElEIGFzIHN0cmluZztcclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UocGFyZW50RnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGZyYWdtZW50IElEIGlzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVuZGVyRnJhZ21lbnQgPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgb3B0aW9uLmlkLFxyXG4gICAgICAgIG9wdGlvbi5zZWN0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIHN0YXRlLmxvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gcmVuZGVyRnJhZ21lbnQ7XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzRnJhZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBleHBhbmRlZE9wdGlvbjogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgbGV0IHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBmcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICBmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghcGFyZW50RnJhZ21lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgcGFyZW50RnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgZXhwYW5kZWRPcHRpb24gPSBvcHRpb247XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV4cGFuZGVkT3B0aW9uKSB7XHJcblxyXG4gICAgICAgIGV4cGFuZGVkT3B0aW9uLnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zaG93T3B0aW9uTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHBhcmVudEZyYWdtZW50LFxyXG4gICAgICAgICAgICBleHBhbmRlZE9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnRnJhZ21lbnRBY3Rpb25zID0ge1xyXG5cclxuICAgIHNob3dBbmNpbGxhcnlOb2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAvLyBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGlmIChhbmNpbGxhcnkudWkuZGlzY3Vzc2lvbkxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAvLyAgICAgZ0ZyYWdtZW50Q29kZS5hdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb24oXHJcbiAgICAgICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgICAgICAvLyAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgIC8vICAgICApO1xyXG5cclxuICAgICAgICAvLyAgICAgaWYgKCFhbmNpbGxhcnkubGluaykge1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIGdPdXRsaW5lQ29kZS5nZXRGcmFnbWVudExpbmtDaGFydE91dGxpbmUoXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgLy8gICAgICAgICApO1xyXG4gICAgICAgIC8vICAgICB9XHJcblxyXG4gICAgICAgIC8vICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRGcmFnbWVudEZpbGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAvLyBmb3IgKGNvbnN0IGNoaWxkIG9mIHBhcmVudEZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgLy8gICAgIGNoaWxkLnVpLmRpc2N1c3Npb25Mb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJQYXJlbnRTZWN0aW9uU2VsZWN0ZWQocGFyZW50RnJhZ21lbnQuc2VjdGlvbik7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhck9ycGhhbmVkU3RlcHMocGFyZW50RnJhZ21lbnQpO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnByZXBhcmVUb1Nob3dPcHRpb25Ob2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gaWYgKG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIC8vICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAvLyAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgIC8vICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgLy8gICAgICk7XHJcblxyXG4gICAgICAgIC8vICAgICBpZiAoIW9wdGlvbi5saW5rKSB7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgZ091dGxpbmVDb2RlLmdldEZyYWdtZW50TGlua0NoYXJ0T3V0bGluZShcclxuICAgICAgICAvLyAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAvLyAgICAgICAgICAgICBvcHRpb25cclxuICAgICAgICAvLyAgICAgICAgICk7XHJcbiAgICAgICAgLy8gICAgIH1cclxuXHJcbiAgICAgICAgLy8gICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEZyYWdtZW50RmlsZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCBVLmlzTnVsbE9yV2hpdGVTcGFjZShvcHRpb24uaWQpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uVGV4dDogc3RyaW5nIHwgbnVsbCA9IG51bGxcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAobm9kZSkge1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9uVGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgIG5vZGUub3B0aW9uID0gb3B0aW9uVGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCkge1xyXG5cclxuICAgICAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFJvb3RGcmFnbWVudEFuZFNldFNlbGVjdGVkOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55LFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlSUQgPSBzZWN0aW9uLm91dGxpbmU/LnIuaTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lTm9kZUlEKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZW5kZXJGcmFnbWVudCA9IGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZS50ZXh0RGF0YSxcclxuICAgICAgICAgICAgXCJyb290XCIsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlSUQsXHJcbiAgICAgICAgICAgIHNlY3Rpb24sXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAocmVuZGVyRnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LnNlY3Rpb24ucm9vdCA9IHJlbmRlckZyYWdtZW50O1xyXG4gICAgICAgICAgICByZW5kZXJGcmFnbWVudC5zZWN0aW9uLmN1cnJlbnQgPSByZW5kZXJGcmFnbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZENoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIGlzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcGFyZW50RnJhZ21lbnRJRCA9IG91dGxpbmVOb2RlLnBhcmVudD8uaSBhcyBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZS5pc1Jvb3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghb3V0bGluZU5vZGUuaXNDaGFydCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQgPSBcImd1aWRlUm9vdFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCA9IFwicm9vdFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKHBhcmVudEZyYWdtZW50SUQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgZnJhZ21lbnQgSUQgaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdDogeyBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LCBjb250aW51ZUxvYWRpbmc6IGJvb2xlYW4gfSA9IGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkRnJhZ21lbnRCYXNlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UudGV4dERhdGEsXHJcbiAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlLmksXHJcbiAgICAgICAgICAgIHNlZ21lbnRTZWN0aW9uLFxyXG4gICAgICAgICAgICBzZWdtZW50LmluZGV4XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSByZXN1bHQuZnJhZ21lbnQ7XHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SURcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHNlZ21lbnRTZWN0aW9uLmN1cnJlbnQgPSBmcmFnbWVudDtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJlbnRGcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRGcmFnbWVudC5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50RnJhZ21lbnQgYW5kIEZyYWdtZW50IGFyZSB0aGUgc2FtZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRGcmFnbWVudC5zZWxlY3RlZCA9IGZyYWdtZW50O1xyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQudWkuc2VjdGlvbkluZGV4ID0gcGFyZW50RnJhZ21lbnQudWkuc2VjdGlvbkluZGV4ICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NDaGFpbkZyYWdtZW50VHlwZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZyYWdtZW50QWN0aW9ucztcclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcblxyXG5cclxuY29uc3QgZ0hvb2tSZWdpc3RyeUNvZGUgPSB7XHJcblxyXG4gICAgZXhlY3V0ZVN0ZXBIb29rOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzdGVwOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCF3aW5kb3cuSG9va1JlZ2lzdHJ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5Ib29rUmVnaXN0cnkuZXhlY3V0ZVN0ZXBIb29rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc3RlcFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnSG9va1JlZ2lzdHJ5Q29kZTtcclxuXHJcbiIsImltcG9ydCB7IFBhcnNlVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgSUNoYWluU2VnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0hpc3RvcnlDb2RlIGZyb20gXCIuL2dIaXN0b3J5Q29kZVwiO1xyXG5pbXBvcnQgZ0hvb2tSZWdpc3RyeUNvZGUgZnJvbSBcIi4vZ0hvb2tSZWdpc3RyeUNvZGVcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi9nT3V0bGluZUNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4vZ1N0YXRlQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlVmFsdWUgPSAoXHJcbiAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICB2YXJpYWJsZVZhbHVlczogYW55LFxyXG4gICAgdmFyaWFibGVOYW1lOiBzdHJpbmdcclxuKTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgbGV0IHZhbHVlID0gdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXTtcclxuXHJcbiAgICBpZiAodmFsdWUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHNlY3Rpb24ub3V0bGluZT8ubXY/Llt2YXJpYWJsZU5hbWVdO1xyXG5cclxuICAgIGlmIChjdXJyZW50VmFsdWUpIHtcclxuXHJcbiAgICAgICAgdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXSA9IGN1cnJlbnRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbmNlc3RvclZhcmlhYmxlVmFsdWUoXHJcbiAgICAgICAgc2VjdGlvbixcclxuICAgICAgICB2YXJpYWJsZVZhbHVlcyxcclxuICAgICAgICB2YXJpYWJsZU5hbWVcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZhcmlhYmxlVmFsdWVzW3ZhcmlhYmxlTmFtZV0gPz8gbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IGdldEFuY2VzdG9yVmFyaWFibGVWYWx1ZSA9IChcclxuICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgIHZhcmlhYmxlVmFsdWVzOiBhbnksXHJcbiAgICB2YXJpYWJsZU5hbWU6IHN0cmluZ1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBjaGFydCA9IHNlY3Rpb24gYXMgSURpc3BsYXlDaGFydDtcclxuICAgIGNvbnN0IHBhcmVudCA9IGNoYXJ0LnBhcmVudD8uc2VjdGlvbjtcclxuXHJcbiAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXJlbnRWYWx1ZSA9IHBhcmVudC5vdXRsaW5lPy5tdj8uW3ZhcmlhYmxlTmFtZV07XHJcblxyXG4gICAgaWYgKHBhcmVudFZhbHVlKSB7XHJcblxyXG4gICAgICAgIHZhcmlhYmxlVmFsdWVzW3ZhcmlhYmxlTmFtZV0gPSBwYXJlbnRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbmNlc3RvclZhcmlhYmxlVmFsdWUoXHJcbiAgICAgICAgcGFyZW50LFxyXG4gICAgICAgIHZhcmlhYmxlVmFsdWVzLFxyXG4gICAgICAgIHZhcmlhYmxlTmFtZVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yVmFyaWFibGVzID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGZyYWdtZW50LnZhbHVlO1xyXG4gICAgY29uc3QgdmFyaWFibGVSZWZQYXR0ZXJuID0gL+OAiMKm4oC5KD88dmFyaWFibGVOYW1lPlte4oC6wqZdKynigLrCpuOAiS9nbXU7XHJcbiAgICBjb25zdCBtYXRjaGVzID0gdmFsdWUubWF0Y2hBbGwodmFyaWFibGVSZWZQYXR0ZXJuKTtcclxuICAgIGxldCB2YXJpYWJsZU5hbWU6IHN0cmluZztcclxuICAgIGxldCB2YXJpYWJsZVZhbHVlczogYW55ID0ge307XHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICBsZXQgbWFya2VyID0gMDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIG1hdGNoZXMpIHtcclxuXHJcbiAgICAgICAgaWYgKG1hdGNoXHJcbiAgICAgICAgICAgICYmIG1hdGNoLmdyb3Vwc1xyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxXHJcbiAgICAgICAgICAgICYmIG1hdGNoLmluZGV4ICE9IG51bGxcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdmFyaWFibGVOYW1lID0gbWF0Y2guZ3JvdXBzLnZhcmlhYmxlTmFtZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHZhcmlhYmxlVmFsdWUgPSBnZXRWYXJpYWJsZVZhbHVlKFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuc2VjdGlvbixcclxuICAgICAgICAgICAgICAgIHZhcmlhYmxlVmFsdWVzLFxyXG4gICAgICAgICAgICAgICAgdmFyaWFibGVOYW1lXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhcmlhYmxlVmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFZhcmlhYmxlOiAke3ZhcmlhYmxlTmFtZX0gY291bGQgbm90IGJlIGZvdW5kYCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCArXHJcbiAgICAgICAgICAgICAgICB2YWx1ZS5zdWJzdHJpbmcobWFya2VyLCBtYXRjaC5pbmRleCkgK1xyXG4gICAgICAgICAgICAgICAgdmFyaWFibGVWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIG1hcmtlciA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bHQgPSByZXN1bHQgK1xyXG4gICAgICAgIHZhbHVlLnN1YnN0cmluZyhtYXJrZXIsIHZhbHVlLmxlbmd0aCk7XHJcblxyXG4gICAgZnJhZ21lbnQudmFsdWUgPSByZXN1bHQ7XHJcbn07XHJcblxyXG5jb25zdCBjbGVhclNpYmxpbmdDaGFpbnMgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgcGFyZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi5pZCAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIGNsZWFyRnJhZ21lbnRDaGFpbnMob3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjbGVhckZyYWdtZW50Q2hhaW5zID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhckZyYWdtZW50Q2hhaW5zKGZyYWdtZW50Lmxpbms/LnJvb3QpO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgY2xlYXJGcmFnbWVudENoYWlucyhvcHRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZyYWdtZW50LnNlbGVjdGVkID0gbnVsbDtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICBmcmFnbWVudC5saW5rLnJvb3Quc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbG9hZE9wdGlvbiA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByYXdPcHRpb246IGFueSxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsLFxyXG4gICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uLFxyXG4gICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgc2VnbWVudEluZGV4OiBudW1iZXIgfCBudWxsXHJcbik6IElSZW5kZXJGcmFnbWVudCA9PiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uID0gbmV3IFJlbmRlckZyYWdtZW50KFxyXG4gICAgICAgIHJhd09wdGlvbi5pZCxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgIHNlY3Rpb24sXHJcbiAgICAgICAgc2VnbWVudEluZGV4XHJcbiAgICApO1xyXG5cclxuICAgIG9wdGlvbi5vcHRpb24gPSByYXdPcHRpb24ub3B0aW9uID8/ICcnO1xyXG4gICAgb3B0aW9uLmlzQW5jaWxsYXJ5ID0gcmF3T3B0aW9uLmlzQW5jaWxsYXJ5ID09PSB0cnVlO1xyXG4gICAgb3B0aW9uLm9yZGVyID0gcmF3T3B0aW9uLm9yZGVyID8/IDA7XHJcbiAgICBvcHRpb24uaUV4aXRLZXkgPSByYXdPcHRpb24uaUV4aXRLZXkgPz8gJyc7XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3V0bGluZU9wdGlvbiBvZiBvdXRsaW5lTm9kZS5vKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAob3V0bGluZU9wdGlvbi5pID09PSBvcHRpb24uaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmVPcHRpb25cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ1N0YXRlQ29kZS5jYWNoZV9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIG9wdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gb3B0aW9uO1xyXG59O1xyXG5cclxuY29uc3Qgc2hvd1BsdWdfc3Vic2NyaXB0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGV4aXQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvblRleHQ6IHN0cmluZ1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBzZWN0aW9uOiBJRGlzcGxheUNoYXJ0ID0gZXhpdC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICBjb25zdCBwYXJlbnQgPSBzZWN0aW9uLnBhcmVudDtcclxuXHJcbiAgICBpZiAoIXBhcmVudCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJRGlzcGxheUNoYXJ0IHBhcmVudCBpcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlFeGl0S2V5ID0gZXhpdC5leGl0S2V5O1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHBhcmVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24uaUV4aXRLZXkgPT09IGlFeGl0S2V5KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2hvd09wdGlvbk5vZGVfc3Vic2NyaXB0b24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIG9wdGlvblRleHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBzaG93T3B0aW9uTm9kZV9zdWJzY3JpcHRvbiA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghb3B0aW9uXHJcbiAgICAgICAgfHwgIW9wdGlvbi5zZWN0aW9uPy5vdXRsaW5lPy5wYXRoXHJcbiAgICApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5wcmVwYXJlVG9TaG93T3B0aW9uTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb25cclxuICAgICk7XHJcblxyXG4gICAgLy8gaWYgKG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIHJldHVybiBnRnJhZ21lbnRDb2RlLmdldEZyYWdtZW50QW5kTGlua091dGxpbmVfc3Vic2NyaXBpb24oXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgIG9wdGlvblRleHQsXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgbG9hZE5leHRGcmFnbWVudEluU2VnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IG5leHRPdXRsaW5lTm9kZSA9IGdTZWdtZW50Q29kZS5nZXROZXh0U2VnbWVudE91dGxpbmVOb2RlKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFuZXh0T3V0bGluZU5vZGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmwgPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uPy5vdXRsaW5lPy5wYXRoO1xyXG4gICAgY29uc3QgdXJsID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7bmV4dE91dGxpbmVOb2RlLml9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5sb2FkQ2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgbmV4dE91dGxpbmVOb2RlXHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGBsb2FkQ2hhaW5GcmFnbWVudGAsXHJcbiAgICAgICAgUGFyc2VUeXBlLkpzb24sXHJcbiAgICAgICAgdXJsLFxyXG4gICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGdGcmFnbWVudENvZGUgPSB7XHJcblxyXG4gICAgbG9hZE5leHRDaGFpbkZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzZWdtZW50Lm91dGxpbmVOb2Rlcy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBsb2FkTmV4dEZyYWdtZW50SW5TZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWROZXh0U2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGhhc09wdGlvbjogKFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uSUQ6IHN0cmluZ1xyXG4gICAgKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb24uaWQgPT09IG9wdGlvbklEKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tTZWxlY3RlZDogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5zZWxlY3RlZD8uaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFnRnJhZ21lbnRDb2RlLmhhc09wdGlvbihmcmFnbWVudCwgZnJhZ21lbnQuc2VsZWN0ZWQ/LmlkKSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VsZWN0ZWQgaGFzIGJlZW4gc2V0IHRvIGZyYWdtZW50IHRoYXQgaXNuJ3QgYW4gb3B0aW9uXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJQYXJlbnRTZWN0aW9uU2VsZWN0ZWQ6IChkaXNwbGF5Q2hhcnQ6IElEaXNwbGF5U2VjdGlvbik6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBwYXJlbnQgPSAoZGlzcGxheUNoYXJ0IGFzIElEaXNwbGF5Q2hhcnQpLnBhcmVudDtcclxuXHJcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhclBhcmVudFNlY3Rpb25PcnBoYW5lZFN0ZXBzKHBhcmVudCk7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhclBhcmVudFNlY3Rpb25TZWxlY3RlZChwYXJlbnQuc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0KTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJQYXJlbnRTZWN0aW9uT3JwaGFuZWRTdGVwczogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhck9ycGhhbmVkU3RlcHMoZnJhZ21lbnQuc2VsZWN0ZWQpO1xyXG4gICAgICAgIGZyYWdtZW50LnNlbGVjdGVkID0gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJPcnBoYW5lZFN0ZXBzOiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyT3JwaGFuZWRTdGVwcyhmcmFnbWVudC5saW5rPy5yb290KTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyT3JwaGFuZWRTdGVwcyhmcmFnbWVudC5zZWxlY3RlZCk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICBmcmFnbWVudC5saW5rID0gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RnJhZ21lbnRBbmRMaW5rT3V0bGluZV9zdWJzY3JpcGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uVGV4dDogc3RyaW5nIHwgbnVsbCA9IG51bGwsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgLy8gaWYgKG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIC8vICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rpc2N1c3Npb24gd2FzIGFscmVhZHkgbG9hZGVkJyk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5oaWRlQmFubmVyID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5nZXRMaW5rT3V0bGluZV9zdWJzY3JpcGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke29wdGlvbi5zZWN0aW9uPy5vdXRsaW5lPy5wYXRofS8ke29wdGlvbi5pZH0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkgPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uVGV4dFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGBsb2FkRnJhZ21lbnRGaWxlYCxcclxuICAgICAgICAgICAgUGFyc2VUeXBlLlRleHQsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldExpbmtPdXRsaW5lX3N1YnNjcmlwaW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lID0gb3B0aW9uLnNlY3Rpb24ub3V0bGluZTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb24uc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIG9wdGlvbi5pZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZT8uYyA9PSBudWxsXHJcbiAgICAgICAgICAgIHx8IHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlIC8vIFdpbGwgbG9hZCBpdCBmcm9tIGEgc2VnbWVudFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnQgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZT8uY1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lRnJvbUNoYXJ0X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVDaGFydCxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0TGlua0VsZW1lbnRJRDogKGZyYWdtZW50SUQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgbnRfbGtfZnJhZ18ke2ZyYWdtZW50SUR9YDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RnJhZ21lbnRFbGVtZW50SUQ6IChmcmFnbWVudElEOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYG50X2ZyX2ZyYWdfJHtmcmFnbWVudElEfWA7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXBhcmVUb1Nob3dPcHRpb25Ob2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUubWFya09wdGlvbnNFeHBhbmRlZChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuc2V0Q3VycmVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdIaXN0b3J5Q29kZS5wdXNoQnJvd3Nlckhpc3RvcnlTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlQW5kTG9hZEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgICAgICBvdXRsaW5lTm9kZUlEOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiB7IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsIGNvbnRpbnVlTG9hZGluZzogYm9vbGVhbiB9ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudEJhc2UoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGVJRCxcclxuICAgICAgICAgICAgc2VjdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gcmVzdWx0LmZyYWdtZW50O1xyXG5cclxuICAgICAgICBpZiAocmVzdWx0LmNvbnRpbnVlTG9hZGluZyA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5hdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5mcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFmcmFnbWVudC5saW5rKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLmdldEZyYWdtZW50TGlua0NoYXJ0T3V0bGluZShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZUFuZExvYWRGcmFnbWVudEJhc2U6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVOb2RlSUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXIgfCBudWxsID0gbnVsbFxyXG4gICAgKTogeyBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LCBjb250aW51ZUxvYWRpbmc6IGJvb2xlYW4gfSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc2VjdGlvbi5vdXRsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09wdGlvbiBzZWN0aW9uIG91dGxpbmUgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhd0ZyYWdtZW50ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUZyYWdtZW50KHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgaWYgKCFyYXdGcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSYXcgZnJhZ21lbnQgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZUlEICE9PSByYXdGcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcmF3RnJhZ21lbnQgaWQgZG9lcyBub3QgbWF0Y2ggdGhlIG91dGxpbmVOb2RlSUQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGVJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50ID0gbmV3IFJlbmRlckZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgcmF3RnJhZ21lbnQuaWQsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgICAgICAgICAgc2VjdGlvbixcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRJbmRleFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbnRpbnVlTG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBpZiAoIWZyYWdtZW50LnVpLmRpc2N1c3Npb25Mb2FkZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUubG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByYXdGcmFnbWVudCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjb250aW51ZUxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlTG9hZGluZ1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIGF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zQW5kQW5jaWxsYXJpZXMub3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAgICAgJiYgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgICAgICAgICAmJiBVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KVxyXG4gICAgICAgICAgICAmJiBVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LmlkXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3V0bGluZU5vZGU/LmMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2hvd09wdGlvbk5vZGVfc3Vic2NyaXB0b24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zWzBdXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlbiBmaW5kIHRoZSBwYXJlbnQgb3B0aW9uIHdpdGggYW4gaUV4aXRLZXkgdGhhdCBtYXRjaGVzIHRoaXMgZXhpdEtleVxyXG4gICAgICAgICAgICBzaG93UGx1Z19zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBjYWNoZVNlY3Rpb25Sb290OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBkaXNwbGF5U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFkaXNwbGF5U2VjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb290RnJhZ21lbnQgPSBkaXNwbGF5U2VjdGlvbi5yb290O1xyXG5cclxuICAgICAgICBpZiAoIXJvb3RGcmFnbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByb290RnJhZ21lbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBkaXNwbGF5U2VjdGlvbi5jdXJyZW50ID0gZGlzcGxheVNlY3Rpb24ucm9vdDtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2Ygcm9vdEZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuY2FjaGVfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBlbGVtZW50SXNQYXJhZ3JhcGg6ICh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGxldCB0cmltbWVkID0gdmFsdWU7XHJcblxyXG4gICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UodHJpbW1lZCkpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0cmltbWVkLmxlbmd0aCA+IDIwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJpbW1lZCA9IHRyaW1tZWQuc3Vic3RyaW5nKDAsIDIwKTtcclxuICAgICAgICAgICAgICAgIHRyaW1tZWQgPSB0cmltbWVkLnJlcGxhY2UoL1xccy9nLCAnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoJzxwPicpID09PSB0cnVlXHJcbiAgICAgICAgICAgICYmIHRyaW1tZWRbM10gIT09ICc8Jykge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlQW5kTG9hZEd1aWRlUm9vdEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByYXdGcmFnbWVudDogYW55LFxyXG4gICAgICAgIHJvb3Q6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghcmF3RnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5sb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByYXdGcmFnbWVudCxcclxuICAgICAgICAgICAgcm9vdFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmF3RnJhZ21lbnQ6IGFueSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZnJhZ21lbnQudG9wTGV2ZWxNYXBLZXkgPSByYXdGcmFnbWVudC50b3BMZXZlbE1hcEtleSA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5tYXBLZXlDaGFpbiA9IHJhd0ZyYWdtZW50Lm1hcEtleUNoYWluID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50Lmd1aWRlSUQgPSByYXdGcmFnbWVudC5ndWlkZUlEID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50Lmd1aWRlUGF0aCA9IHJhd0ZyYWdtZW50Lmd1aWRlUGF0aCA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5pS2V5ID0gcmF3RnJhZ21lbnQuaUtleSA/PyBudWxsO1xyXG4gICAgICAgIGZyYWdtZW50LmV4aXRLZXkgPSByYXdGcmFnbWVudC5leGl0S2V5ID8/IG51bGw7XHJcbiAgICAgICAgZnJhZ21lbnQudmFyaWFibGUgPSByYXdGcmFnbWVudC52YXJpYWJsZSA/PyBudWxsO1xyXG4gICAgICAgIGZyYWdtZW50LnZhbHVlID0gcmF3RnJhZ21lbnQudmFsdWUgPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQudmFsdWUgPSBmcmFnbWVudC52YWx1ZS50cmltKCk7XHJcbiAgICAgICAgLy8gZnJhZ21lbnQudWkuZGlzY3Vzc2lvbkxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjaGVja0ZvclZhcmlhYmxlcyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudC5pZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnBhcmVudEZyYWdtZW50SUQgPSBvdXRsaW5lTm9kZT8ucGFyZW50Py5pID8/ICcnO1xyXG5cclxuICAgICAgICBsZXQgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGlmIChyYXdGcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgICYmIEFycmF5LmlzQXJyYXkocmF3RnJhZ21lbnQub3B0aW9ucylcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCByYXdPcHRpb24gb2YgcmF3RnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IGZyYWdtZW50Lm9wdGlvbnMuZmluZChvID0+IG8uaWQgPT09IHJhd09wdGlvbi5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gbG9hZE9wdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhd09wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWdtZW50SW5kZXhcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5vcHRpb25zLnB1c2gob3B0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5vcHRpb24gPSByYXdPcHRpb24ub3B0aW9uID8/ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5pc0FuY2lsbGFyeSA9IHJhd09wdGlvbi5pc0FuY2lsbGFyeSA9PT0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ub3JkZXIgPSByYXdPcHRpb24ub3JkZXIgPz8gMDtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uaUV4aXRLZXkgPSByYXdPcHRpb24uaUV4aXRLZXkgPz8gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNlY3Rpb24gPSBmcmFnbWVudC5zZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5wYXJlbnRGcmFnbWVudElEID0gZnJhZ21lbnQuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNlZ21lbnRJbmRleCA9IGZyYWdtZW50LnNlZ21lbnRJbmRleDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBvcHRpb24udWkuZGlzY3Vzc2lvbkxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLnVpLmRvTm90UGFpbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0hvb2tSZWdpc3RyeUNvZGUuZXhlY3V0ZVN0ZXBIb29rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZUZyYWdtZW50OiAocmVzcG9uc2U6IHN0cmluZyk6IGFueSA9PiB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICA8c2NyaXB0IHR5cGU9XFxcIm1vZHVsZVxcXCIgc3JjPVxcXCIvQHZpdGUvY2xpZW50XFxcIj48L3NjcmlwdD5cclxuICAgICAgICAgICAgICAgIDwhLS0gdHNGcmFnbWVudFJlbmRlckNvbW1lbnQge1xcXCJub2RlXFxcIjp7XFxcImlkXFxcIjpcXFwiZEJ0N0ttMk1sXFxcIixcXFwidG9wTGV2ZWxNYXBLZXlcXFwiOlxcXCJjdjFUUmwwMXJmXFxcIixcXFwibWFwS2V5Q2hhaW5cXFwiOlxcXCJjdjFUUmwwMXJmXFxcIixcXFwiZ3VpZGVJRFxcXCI6XFxcImRCdDdKTjFIZVxcXCIsXFxcImd1aWRlUGF0aFxcXCI6XFxcImM6L0dpdEh1Yi9URVNULkRvY3VtZW50YXRpb24vdHNtYXBzZGF0YU9wdGlvbnNGb2xkZXIvSG9sZGVyL2RhdGFPcHRpb25zLnRzbWFwXFxcIixcXFwicGFyZW50RnJhZ21lbnRJRFxcXCI6XFxcImRCdDdKTjF2dFxcXCIsXFxcImNoYXJ0S2V5XFxcIjpcXFwiY3YxVFJsMDFyZlxcXCIsXFxcIm9wdGlvbnNcXFwiOltdfX0gLS0+XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIDxoNCBpZD1cXFwib3B0aW9uLTEtc29sdXRpb25cXFwiPk9wdGlvbiAxIHNvbHV0aW9uPC9oND5cclxuICAgICAgICAgICAgICAgIDxwPk9wdGlvbiAxIHNvbHV0aW9uPC9wPlxyXG4gICAgICAgICovXHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gcmVzcG9uc2Uuc3BsaXQoJ1xcbicpO1xyXG4gICAgICAgIGNvbnN0IHJlbmRlckNvbW1lbnRTdGFydCA9IGA8IS0tICR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRSZW5kZXJDb21tZW50VGFnfWA7XHJcbiAgICAgICAgY29uc3QgcmVuZGVyQ29tbWVudEVuZCA9IGAgLS0+YDtcclxuICAgICAgICBsZXQgZnJhZ21lbnRSZW5kZXJDb21tZW50OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBsZXQgbGluZTogc3RyaW5nO1xyXG4gICAgICAgIGxldCBidWlsZFZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gJyc7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChidWlsZFZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBgJHt2YWx1ZX1cclxuJHtsaW5lfWA7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChyZW5kZXJDb21tZW50U3RhcnQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRSZW5kZXJDb21tZW50ID0gbGluZS5zdWJzdHJpbmcocmVuZGVyQ29tbWVudFN0YXJ0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBidWlsZFZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudFJlbmRlckNvbW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnJhZ21lbnRSZW5kZXJDb21tZW50ID0gZnJhZ21lbnRSZW5kZXJDb21tZW50LnRyaW0oKTtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50UmVuZGVyQ29tbWVudC5lbmRzV2l0aChyZW5kZXJDb21tZW50RW5kKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gZnJhZ21lbnRSZW5kZXJDb21tZW50Lmxlbmd0aCAtIHJlbmRlckNvbW1lbnRFbmQubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZnJhZ21lbnRSZW5kZXJDb21tZW50ID0gZnJhZ21lbnRSZW5kZXJDb21tZW50LnN1YnN0cmluZyhcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICBsZW5ndGhcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC50cmltKCk7XHJcbiAgICAgICAgbGV0IHJhd0ZyYWdtZW50OiBhbnkgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmF3RnJhZ21lbnQgPSBKU09OLnBhcnNlKGZyYWdtZW50UmVuZGVyQ29tbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmF3RnJhZ21lbnQudmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJhd0ZyYWdtZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBtYXJrT3B0aW9uc0V4cGFuZGVkOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLm9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjb2xsYXBzZUZyYWdtZW50c09wdGlvbnM6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgb3B0aW9uLnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY29sbGFwc2VGcmFnbWVudHNPcHRpb25zKGZyYWdtZW50KTtcclxuICAgICAgICBvcHRpb24udWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXRGcmFnbWVudFVpczogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgY2hhaW5GcmFnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19pZDtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiBjaGFpbkZyYWdtZW50cykge1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWkoY2hhaW5GcmFnbWVudHNbcHJvcE5hbWVdKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0RnJhZ21lbnRVaTogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICBmcmFnbWVudC51aS5kb05vdFBhaW50ID0gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIHNwbGl0T3B0aW9uc0FuZEFuY2lsbGFyaWVzOiAoY2hpbGRyZW46IEFycmF5PElSZW5kZXJGcmFnbWVudD4gfCBudWxsIHwgdW5kZWZpbmVkKTogeyBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+LCBhbmNpbGxhcmllczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiwgdG90YWw6IG51bWJlciB9ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgYW5jaWxsYXJpZXM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4gPSBbXTtcclxuICAgICAgICBjb25zdCBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+ID0gW107XHJcbiAgICAgICAgbGV0IG9wdGlvbjogSVJlbmRlckZyYWdtZW50O1xyXG5cclxuICAgICAgICBpZiAoIWNoaWxkcmVuKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIGFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvbiA9IGNoaWxkcmVuW2ldIGFzIElSZW5kZXJGcmFnbWVudDtcclxuXHJcbiAgICAgICAgICAgIGlmICghb3B0aW9uLmlzQW5jaWxsYXJ5KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllcy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgICAgIGFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICB0b3RhbDogY2hpbGRyZW4ubGVuZ3RoXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q3VycmVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSBmcmFnbWVudC5zZWN0aW9uO1xyXG5cclxuICAgICAgICBsZXQgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmVudC5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgYW5kIEZyYWdtZW50IGFyZSB0aGUgc2FtZVwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyZW50LnNlbGVjdGVkID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIGZyYWdtZW50LnVpLnNlY3Rpb25JbmRleCA9IHBhcmVudC51aS5zZWN0aW9uSW5kZXggKyAxO1xyXG5cclxuICAgICAgICAgICAgY2xlYXJTaWJsaW5nQ2hhaW5zKFxyXG4gICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudEZyYWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VjdGlvbi5jdXJyZW50ID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jaGVja1NlbGVjdGVkKGZyYWdtZW50KTtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRDb2RlO1xyXG5cclxuIiwiaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElGcmFnbWVudFBheWxvYWQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvcGF5bG9hZHMvSUZyYWdtZW50UGF5bG9hZFwiO1xyXG5cclxuXHJcbmNvbnN0IGhpZGVGcm9tUGFpbnQgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgIGhpZGU6IGJvb2xlYW5cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLyogXHJcbiAgICAgICAgVGhpcyBpcyBhIGZpeCBmb3I6XHJcbiAgICAgICAgTm90Rm91bmRFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ2luc2VydEJlZm9yZScgb24gJ05vZGUnOiBUaGUgbm9kZSBiZWZvcmUgd2hpY2ggdGhlIG5ldyBub2RlIGlzIHRvIGJlIGluc2VydGVkIGlzIG5vdCBhIGNoaWxkIG9mIHRoaXMgbm9kZS5cclxuICAgICovXHJcblxyXG4gICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGZyYWdtZW50LnVpLmRvTm90UGFpbnQgPSBoaWRlO1xyXG5cclxuICAgIGhpZGVGcm9tUGFpbnQoXHJcbiAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxuXHJcbiAgICBoaWRlRnJvbVBhaW50KFxyXG4gICAgICAgIGZyYWdtZW50Lmxpbms/LnJvb3QsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxufVxyXG5cclxuY29uc3QgaGlkZU9wdGlvbnNGcm9tUGFpbnQgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgIGhpZGU6IGJvb2xlYW5cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLyogXHJcbiAgICAgICAgVGhpcyBpcyBhIGZpeCBmb3I6XHJcbiAgICAgICAgTm90Rm91bmRFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ2luc2VydEJlZm9yZScgb24gJ05vZGUnOiBUaGUgbm9kZSBiZWZvcmUgd2hpY2ggdGhlIG5ldyBub2RlIGlzIHRvIGJlIGluc2VydGVkIGlzIG5vdCBhIGNoaWxkIG9mIHRoaXMgbm9kZS5cclxuICAgICovXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQ/Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaGlkZUZyb21QYWludChcclxuICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICBoaWRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2VjdGlvblBhcmVudFNlbGVjdGVkKFxyXG4gICAgICAgIGZyYWdtZW50LnNlY3Rpb24gYXMgSURpc3BsYXlDaGFydCxcclxuICAgICAgICBoaWRlXHJcbiAgICApO1xyXG59XHJcblxyXG5jb25zdCBoaWRlU2VjdGlvblBhcmVudFNlbGVjdGVkID0gKFxyXG4gICAgZGlzcGxheUNoYXJ0OiBJRGlzcGxheUNoYXJ0LFxyXG4gICAgaGlkZTogYm9vbGVhblxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIWRpc3BsYXlDaGFydD8ucGFyZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVGcm9tUGFpbnQoXHJcbiAgICAgICAgZGlzcGxheUNoYXJ0LnBhcmVudC5zZWxlY3RlZCxcclxuICAgICAgICBoaWRlXHJcbiAgICApO1xyXG5cclxuICAgIGhpZGVTZWN0aW9uUGFyZW50U2VsZWN0ZWQoXHJcbiAgICAgICAgZGlzcGxheUNoYXJ0LnBhcmVudC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGZyYWdtZW50QWN0aW9ucyA9IHtcclxuXHJcbiAgICBleHBhbmRPcHRpb25zOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGVcclxuICAgICAgICAgICAgfHwgIWZyYWdtZW50XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuc2V0RGlydHkoc3RhdGUpO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgY29uc3QgZXhwYW5kZWQgPSBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCAhPT0gdHJ1ZTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5vcHRpb25zRXhwYW5kZWQgPSBleHBhbmRlZDtcclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IGV4cGFuZGVkO1xyXG5cclxuICAgICAgICBoaWRlT3B0aW9uc0Zyb21QYWludChcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHRydWVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgaGlkZU9wdGlvbnM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhZnJhZ21lbnRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5zZXREaXJ0eShzdGF0ZSk7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWlzKHN0YXRlKTtcclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLm9wdGlvbnNFeHBhbmRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBoaWRlT3B0aW9uc0Zyb21QYWludChcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGZhbHNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3dPcHRpb25Ob2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBwYXlsb2FkOiBJRnJhZ21lbnRQYXlsb2FkXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGVcclxuICAgICAgICAgICAgfHwgIXBheWxvYWQ/LnBhcmVudEZyYWdtZW50XHJcbiAgICAgICAgICAgIHx8ICFwYXlsb2FkPy5vcHRpb25cclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5zZXREaXJ0eShzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLnNob3dPcHRpb25Ob2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcGF5bG9hZC5wYXJlbnRGcmFnbWVudCxcclxuICAgICAgICAgICAgcGF5bG9hZC5vcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICB0b2dnbGVBbmNpbGxhcnlOb2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBwYXlsb2FkOiBJRnJhZ21lbnRQYXlsb2FkXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGVcclxuICAgICAgICAgICAgfHwgIXBheWxvYWQ/Lm9wdGlvblxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhbmNpbGxhcnkgPSBwYXlsb2FkLm9wdGlvbjtcclxuICAgICAgICBnU3RhdGVDb2RlLnNldERpcnR5KHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQpIHtcclxuXHJcbiAgICAgICAgICAgIGFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5zaG93QW5jaWxsYXJ5Tm9kZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5vcHRpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZyYWdtZW50QWN0aW9ucztcclxuIiwiaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJRnJhZ21lbnRQYXlsb2FkIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL3BheWxvYWRzL0lGcmFnbWVudFBheWxvYWRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGcmFnbWVudFBheWxvYWQgaW1wbGVtZW50cyBJRnJhZ21lbnRQYXlsb2FkIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50RnJhZ21lbnQgPSBwYXJlbnRGcmFnbWVudDtcclxuICAgICAgICB0aGlzLm9wdGlvbiA9IG9wdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudDtcclxuICAgIHB1YmxpYyBvcHRpb246IElSZW5kZXJGcmFnbWVudDtcclxufVxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiwgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9mcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IEZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvdWkvcGF5bG9hZHMvRnJhZ21lbnRQYXlsb2FkXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZnJhZ21lbnRWaWV3cyBmcm9tIFwiLi9mcmFnbWVudFZpZXdzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgYnVpbGRBbmNpbGxhcnlEaXNjdXNzaW9uVmlldyA9IChhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudCk6IENoaWxkcmVuW10gPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBDaGlsZHJlbltdID0gW107XHJcblxyXG4gICAgZnJhZ21lbnRWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgYW5jaWxsYXJ5LFxyXG4gICAgICAgIHZpZXdcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn1cclxuXHJcbmNvbnN0IGJ1aWxkRXhwYW5kZWRBbmNpbGxhcnlWaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5XHJcbiAgICAgICAgfHwgIWFuY2lsbGFyeS5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnktYm94XCIgfSwgW1xyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWhlYWRcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFjdGlvbnMudG9nZ2xlQW5jaWxsYXJ5Tm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnJhZ21lbnRQYXlsb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnktdGV4dFwiIH0sIGFuY2lsbGFyeS5vcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKFwic3BhblwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS14XCIgfSwgJ+KclScpXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBdKSxcclxuXHJcbiAgICAgICAgICAgIGJ1aWxkQW5jaWxsYXJ5RGlzY3Vzc2lvblZpZXcoYW5jaWxsYXJ5KVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBidWlsZENvbGxhcHNlZEFuY2lsbGFyeVZpZXcgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFhbmNpbGxhcnlcclxuICAgICAgICB8fCAhYW5jaWxsYXJ5LmlzQW5jaWxsYXJ5KSB7XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS1ib3ggbnQtZnItY29sbGFwc2VkXCIgfSwgW1xyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWhlYWRcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFjdGlvbnMudG9nZ2xlQW5jaWxsYXJ5Tm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnJhZ21lbnRQYXlsb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwge30sIGFuY2lsbGFyeS5vcHRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBCdWlsZEFuY2lsbGFyeVZpZXcgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFhbmNpbGxhcnlcclxuICAgICAgICB8fCAhYW5jaWxsYXJ5LmlzQW5jaWxsYXJ5KSB7XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1aWxkRXhwYW5kZWRBbmNpbGxhcnlWaWV3KFxyXG4gICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJ1aWxkQ29sbGFwc2VkQW5jaWxsYXJ5VmlldyhcclxuICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICApO1xyXG59XHJcblxyXG5jb25zdCBCdWlsZEV4cGFuZGVkT3B0aW9uVmlldyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoIW9wdGlvblxyXG4gICAgICAgIHx8IG9wdGlvbi5pc0FuY2lsbGFyeSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJudC1mci1vcHRpb24tYm94XCIgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLW9wdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLnNob3dPcHRpb25Ob2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKF9ldmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGcmFnbWVudFBheWxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKFwic3BhblwiLCB7fSwgb3B0aW9uLm9wdGlvbilcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBidWlsZEV4cGFuZGVkT3B0aW9uc1ZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PlxyXG4pOiB7IHZpZXc6IFZOb2RlLCBpc0NvbGxhcHNlZDogYm9vbGVhbiB9IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uVmlld3M6IENoaWxkcmVuW10gPSBbXTtcclxuICAgIGxldCBvcHRpb25WZXc6IFZOb2RlIHwgbnVsbDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIG9wdGlvblZldyA9IEJ1aWxkRXhwYW5kZWRPcHRpb25WaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvblZldykge1xyXG5cclxuICAgICAgICAgICAgb3B0aW9uVmlld3MucHVzaChvcHRpb25WZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgb3B0aW9uc0NsYXNzZXMgPSBcIm50LWZyLWZyYWdtZW50LW9wdGlvbnNcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgb3B0aW9uc0NsYXNzZXMgPSBgJHtvcHRpb25zQ2xhc3Nlc30gbnQtZnItZnJhZ21lbnQtY2hhaW5gXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtvcHRpb25zQ2xhc3Nlc31gLFxyXG4gICAgICAgICAgICAgICAgdGFiaW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICBvbkJsdXI6IFtcclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFjdGlvbnMuaGlkZU9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgKF9ldmVudDogYW55KSA9PiBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgb3B0aW9uVmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdmlldyxcclxuICAgICAgICBpc0NvbGxhcHNlZDogZmFsc2VcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEV4cGFuZGVkT3B0aW9uc0JveFZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PixcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zVmlldyA9IGJ1aWxkRXhwYW5kZWRPcHRpb25zVmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBvcHRpb25zXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghb3B0aW9uc1ZpZXcpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmlld3MucHVzaChcclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7ZnJhZ21lbnRFTGVtZW50SUR9X2VvYCxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWZyYWdtZW50LWJveFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNWaWV3LnZpZXdcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIClcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZENvbGxhcHNlZE9wdGlvbnNWaWV3ID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFzczogYG50LWZyLWZyYWdtZW50LW9wdGlvbnMgbnQtZnItY29sbGFwc2VkYCxcclxuICAgICAgICAgICAgICAgIG9uTW91c2VEb3duOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLmV4cGFuZE9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgKF9ldmVudDogYW55KSA9PiBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwic3BhblwiLCB7IGNsYXNzOiBgbnQtZnItb3B0aW9uLXNlbGVjdGVkYCB9LCBgJHtmcmFnbWVudC5zZWxlY3RlZD8ub3B0aW9ufWApLFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkQ29sbGFwc2VkT3B0aW9uc0JveFZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgZnJhZ21lbnRFTGVtZW50SUQ6IHN0cmluZyxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvblZpZXcgPSBidWlsZENvbGxhcHNlZE9wdGlvbnNWaWV3KGZyYWdtZW50KTtcclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7ZnJhZ21lbnRFTGVtZW50SUR9X2NvYCxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWZyYWdtZW50LWJveFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIG9wdGlvblZpZXdcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgY29uc3Qgdmlld0FueSA9IHZpZXcgYXMgYW55O1xyXG5cclxuICAgIGlmICghdmlld0FueS51aSkge1xyXG5cclxuICAgICAgICB2aWV3QW55LnVpID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgdmlld0FueS51aS5pc0NvbGxhcHNlZCA9IHRydWU7XHJcbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRBbmNpbGxhcmllc1ZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgYW5jaWxsYXJpZXM6IEFycmF5PElSZW5kZXJGcmFnbWVudD5cclxuKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoYW5jaWxsYXJpZXMubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFuY2lsbGFyaWVzVmlld3M6IENoaWxkcmVuW10gPSBbXTtcclxuICAgIGxldCBhbmNpbGxhcnlWaWV3OiBWTm9kZSB8IG51bGw7XHJcblxyXG4gICAgZm9yIChjb25zdCBhbmNpbGxhcnkgb2YgYW5jaWxsYXJpZXMpIHtcclxuXHJcbiAgICAgICAgYW5jaWxsYXJ5VmlldyA9IEJ1aWxkQW5jaWxsYXJ5VmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChhbmNpbGxhcnlWaWV3KSB7XHJcblxyXG4gICAgICAgICAgICBhbmNpbGxhcmllc1ZpZXdzLnB1c2goYW5jaWxsYXJ5Vmlldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmNpbGxhcmllc1ZpZXdzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYW5jaWxsYXJpZXNDbGFzc2VzID0gXCJudC1mci1mcmFnbWVudC1hbmNpbGxhcmllc1wiO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZCkge1xyXG5cclxuICAgICAgICBhbmNpbGxhcmllc0NsYXNzZXMgPSBgJHthbmNpbGxhcmllc0NsYXNzZXN9IG50LWZyLWZyYWdtZW50LWNoYWluYFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7YW5jaWxsYXJpZXNDbGFzc2VzfWAsXHJcbiAgICAgICAgICAgICAgICB0YWJpbmRleDogMCxcclxuICAgICAgICAgICAgICAgIC8vIG9uQmx1cjogW1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGZyYWdtZW50QWN0aW9ucy5oaWRlT3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIC8vICAgICAoX2V2ZW50OiBhbnkpID0+IGZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICAvLyBdXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBhbmNpbGxhcmllc1ZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkQW5jaWxsYXJpZXNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGFuY2lsbGFyaWVzOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+LFxyXG4gICAgZnJhZ21lbnRFTGVtZW50SUQ6IHN0cmluZyxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IGFuY2lsbGFyaWVzVmlldyA9IGJ1aWxkQW5jaWxsYXJpZXNWaWV3KFxyXG4gICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgIGFuY2lsbGFyaWVzXHJcbiAgICApO1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJpZXNWaWV3KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXcgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fYWAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1mcmFnbWVudC1ib3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllc1ZpZXdcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgY29uc3Qgdmlld0FueSA9IHZpZXcgYXMgYW55O1xyXG5cclxuICAgIGlmICghdmlld0FueS51aSkge1xyXG5cclxuICAgICAgICB2aWV3QW55LnVpID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgdmlld0FueS51aS5wcmlvcklzQW5jaWxsYXJ5ID0gdHJ1ZTtcclxuICAgIHZpZXdzLnB1c2godmlldyk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD5cclxuKTogeyB2aWV3OiBWTm9kZSwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAmJiBvcHRpb25zWzBdLm9wdGlvbiA9PT0gJydcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3ID0gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZpZXcsXHJcbiAgICAgICAgICAgIGlzQ29sbGFwc2VkOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3KFxyXG4gICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sXHJcbiAgICBmcmFnbWVudEVMZW1lbnRJRDogc3RyaW5nLFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMVxyXG4gICAgICAgICYmIG9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBidWlsZENvbGxhcHNlZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgZnJhZ21lbnRFTGVtZW50SUQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkRXhwYW5kZWRPcHRpb25zQm94VmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgIHZpZXdzXHJcbiAgICApO1xyXG59O1xyXG5cclxuXHJcbmNvbnN0IG9wdGlvbnNWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgIHx8ICFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSAvLyBEb24ndCBkcmF3IG9wdGlvbnMgb2YgbGlua3NcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHZpZXdzOiBbXSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNDb2xsYXBzZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAgICAgJiYgZnJhZ21lbnQub3B0aW9uc1swXS5vcHRpb24gPT09ICcnXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB2aWV3czogW10sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zQ29sbGFwc2VkOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc0FuZEFuY2lsbGFyaWVzID0gZ0ZyYWdtZW50Q29kZS5zcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllcyhmcmFnbWVudC5vcHRpb25zKTtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld3M6IENoaWxkcmVuW10gPSBbXHJcblxyXG4gICAgICAgICAgICBidWlsZEFuY2lsbGFyaWVzVmlldyhcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc1ZpZXdSZXN1bHRzID0gYnVpbGRPcHRpb25zVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnNWaWV3UmVzdWx0cykge1xyXG5cclxuICAgICAgICAgICAgdmlld3MucHVzaChvcHRpb25zVmlld1Jlc3VsdHMudmlldyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB2aWV3cyxcclxuICAgICAgICAgICAgb3B0aW9uc0NvbGxhcHNlZDogb3B0aW9uc1ZpZXdSZXN1bHRzPy5pc0NvbGxhcHNlZCA/PyBmYWxzZVxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkVmlldzI6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgIHx8ICFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSAvLyBEb24ndCBkcmF3IG9wdGlvbnMgb2YgbGlua3NcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIGZyYWdtZW50Lm9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEVMZW1lbnRJRCA9IGdGcmFnbWVudENvZGUuZ2V0RnJhZ21lbnRFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGJ1aWxkQW5jaWxsYXJpZXNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICBmcmFnbWVudEVMZW1lbnRJRCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zVmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4gfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkTGlua0Rpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gZmFsc2U7XHJcbiAgICBsZXQgYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9IGZhbHNlO1xyXG4gICAgY29uc3Qgdmlld3NMZW5ndGggPSB2aWV3cy5sZW5ndGg7XHJcblxyXG4gICAgaWYgKHZpZXdzTGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICBjb25zdCBsYXN0VmlldzogYW55ID0gdmlld3Nbdmlld3NMZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8uaXNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8ucHJpb3JJc0FuY2lsbGFyeSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmtFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldExpbmtFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgY29uc3QgcmVzdWx0czogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiB9ID0gb3B0aW9uc1ZpZXdzLmJ1aWxkVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgaWYgKGxpbmtFTGVtZW50SUQgPT09ICdudF9sa19mcmFnX3Q5NjhPSjF3bycpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFItRFJBV0lORyAke2xpbmtFTGVtZW50SUR9X2xgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7bGlua0VMZW1lbnRJRH1fbGAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibnQtZnItZnJhZ21lbnQtYm94XCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJudC1mci1wcmlvci1jb2xsYXBzZWQtb3B0aW9uc1wiOiBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID09PSB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibnQtZnItcHJpb3ItaXMtYW5jaWxsYXJ5XCI6IGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPT09IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGBudC1mci1mcmFnbWVudC1kaXNjdXNzaW9uYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWRpc2N1c3Npb25cIjogZnJhZ21lbnQudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiXCJcclxuICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy52aWV3c1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICBpZiAocmVzdWx0cy5vcHRpb25zQ29sbGFwc2VkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBbnkgPSB2aWV3IGFzIGFueTtcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3QW55LnVpKSB7XHJcblxyXG4gICAgICAgICAgICB2aWV3QW55LnVpID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2aWV3QW55LnVpLmlzQ29sbGFwc2VkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRMaW5rRXhpdHNWaWV3ID0gKFxyXG4gICAgX2ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBfdmlldzogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgICAvLyBpZiAoIWZyYWdtZW50Lm9wdGlvbnNcclxuICAgIC8vICAgICB8fCBmcmFnbWVudC5vcHRpb25zLmxlbmd0aCA9PT0gMFxyXG4gICAgLy8gICAgIHx8ICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZFxyXG4gICAgLy8gKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSkpIHtcclxuXHJcbiAgICAvLyAgICAgLy8gVGhlbiBtYXAgaGFzIGEgc2luZ2xlIGV4aXQgYW5kIGl0IHdhcyBtZXJnZWQgaW50byB0aGlzIGZyYWdtZW50XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIHZpZXcucHVzaChcclxuXHJcbiAgICAvLyAgICAgaChcImRpdlwiLFxyXG4gICAgLy8gICAgICAgICB7XHJcbiAgICAvLyAgICAgICAgICAgICBjbGFzczogXCJudC1mci1leGl0cy1ib3hcIlxyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICBbXHJcbiAgICAvLyAgICAgICAgICAgICBvcHRpb25zVmlld3MuYnVpbGRWaWV3KGZyYWdtZW50KVxyXG4gICAgLy8gICAgICAgICBdXHJcbiAgICAvLyAgICAgKVxyXG4gICAgLy8gKTtcclxufTtcclxuXHJcbmNvbnN0IGxpbmtWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgICAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWlsZExpbmtEaXNjdXNzaW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGlua1ZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQubGluaz8ucm9vdCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZExpbmtFeGl0c1ZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbGlua1ZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IENoaWxkcmVuIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBvcHRpb25zVmlld3MgZnJvbSBcIi4vb3B0aW9uc1ZpZXdzXCI7XHJcbmltcG9ydCBsaW5rVmlld3MgZnJvbSBcIi4vbGlua1ZpZXdzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkRGlzY3Vzc2lvblZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LnZhbHVlKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9IGZhbHNlO1xyXG4gICAgbGV0IGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPSBmYWxzZTtcclxuICAgIGNvbnN0IHZpZXdzTGVuZ3RoID0gdmlld3MubGVuZ3RoO1xyXG5cclxuICAgIGlmICh2aWV3c0xlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgY29uc3QgbGFzdFZpZXc6IGFueSA9IHZpZXdzW3ZpZXdzTGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/LmlzQ29sbGFwc2VkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/LnByaW9ySXNBbmNpbGxhcnkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmcmFnbWVudEVMZW1lbnRJRCA9IGdGcmFnbWVudENvZGUuZ2V0RnJhZ21lbnRFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG5cclxuICAgIHZpZXdzLnB1c2goXHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9kYCxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJudC1mci1mcmFnbWVudC1ib3hcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBcIm50LWZyLXByaW9yLWNvbGxhcHNlZC1vcHRpb25zXCI6IGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPT09IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJudC1mci1wcmlvci1pcy1hbmNpbGxhcnlcIjogYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogYG50LWZyLWZyYWdtZW50LWRpc2N1c3Npb25gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtZGlzY3Vzc2lvblwiOiBmcmFnbWVudC52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcIlxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIClcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBmcmFnbWVudFZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gICAgICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudFxyXG4gICAgICAgICAgICB8fCBmcmFnbWVudC51aS5kb05vdFBhaW50ID09PSB0cnVlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJ1aWxkRGlzY3Vzc2lvblZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxpbmtWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50Lmxpbms/LnJvb3QsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgb3B0aW9uc1ZpZXdzLmJ1aWxkVmlldzIoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnJhZ21lbnRWaWV3cztcclxuXHJcblxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiwgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgZnJhZ21lbnRWaWV3cyBmcm9tIFwiLi9mcmFnbWVudFZpZXdzXCI7XHJcbi8vIGltcG9ydCBnRGVidWdnZXJDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nRGVidWdnZXJDb2RlXCI7XHJcblxyXG5pbXBvcnQgXCIuLi9zY3NzL2ZyYWdtZW50cy5zY3NzXCI7XHJcblxyXG5cclxuY29uc3QgZ3VpZGVWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZENvbnRlbnRWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgaW5uZXJWaWV3czogQ2hpbGRyZW5bXSA9IFtdO1xyXG5cclxuICAgICAgICBmcmFnbWVudFZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290LFxyXG4gICAgICAgICAgICBpbm5lclZpZXdzXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICAvLyBnRGVidWdnZXJDb2RlLmxvZ1Jvb3Qoc3RhdGUpO1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IFwibnRfZnJfRnJhZ21lbnRzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgaW5uZXJWaWV3c1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGd1aWRlVmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgaW5pdEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvaW5pdEFjdGlvbnNcIjtcclxuaW1wb3J0IGd1aWRlVmlld3MgZnJvbSBcIi4uLy4uL2ZyYWdtZW50cy92aWV3cy9ndWlkZVZpZXdzXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdFZpZXcgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGluaXRBY3Rpb25zLnNldE5vdFJhdyxcclxuICAgICAgICAgICAgICAgICAgICBpZDogXCJ0cmVlU29sdmVGcmFnbWVudHNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICBndWlkZVZpZXdzLmJ1aWxkQ29udGVudFZpZXcoc3RhdGUpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFZpZXc7XHJcblxyXG4iLCJpbXBvcnQgSVNldHRpbmdzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVNldHRpbmdzXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0dGluZ3MgaW1wbGVtZW50cyBJU2V0dGluZ3Mge1xyXG5cclxuICAgIHB1YmxpYyBrZXk6IHN0cmluZyA9IFwiLTFcIjtcclxuICAgIHB1YmxpYyByOiBzdHJpbmcgPSBcIi0xXCI7XHJcblxyXG4gICAgLy8gQXV0aGVudGljYXRpb25cclxuICAgIHB1YmxpYyB1c2VyUGF0aDogc3RyaW5nID0gYHVzZXJgO1xyXG4gICAgcHVibGljIGRlZmF1bHRMb2dvdXRQYXRoOiBzdHJpbmcgPSBgbG9nb3V0YDtcclxuICAgIHB1YmxpYyBkZWZhdWx0TG9naW5QYXRoOiBzdHJpbmcgPSBgbG9naW5gO1xyXG4gICAgcHVibGljIHJldHVyblVybFN0YXJ0OiBzdHJpbmcgPSBgcmV0dXJuVXJsYDtcclxuXHJcbiAgICBwcml2YXRlIGJhc2VVcmw6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfQkFTRV9VUkwgPz8gJyc7XHJcbiAgICBwdWJsaWMgbGlua1VybDogc3RyaW5nID0gKHdpbmRvdyBhcyBhbnkpLkFTU0lTVEFOVF9MSU5LX1VSTCA/PyAnJztcclxuICAgIHB1YmxpYyBzdWJzY3JpcHRpb25JRDogc3RyaW5nID0gKHdpbmRvdyBhcyBhbnkpLkFTU0lTVEFOVF9TVUJTQ1JJUFRJT05fSUQgPz8gJyc7XHJcblxyXG4gICAgcHVibGljIGFwaVVybDogc3RyaW5nID0gYCR7dGhpcy5iYXNlVXJsfS9hcGlgO1xyXG4gICAgcHVibGljIGJmZlVybDogc3RyaW5nID0gYCR7dGhpcy5iYXNlVXJsfS9iZmZgO1xyXG4gICAgcHVibGljIGZpbGVVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vZmlsZWA7XHJcbn1cclxuIiwiXHJcbmV4cG9ydCBlbnVtIG5hdmlnYXRpb25EaXJlY3Rpb24ge1xyXG5cclxuICAgIEJ1dHRvbnMgPSAnYnV0dG9ucycsXHJcbiAgICBCYWNrd2FyZHMgPSAnYmFja3dhcmRzJyxcclxuICAgIEZvcndhcmRzID0gJ2ZvcndhcmRzJ1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBuYXZpZ2F0aW9uRGlyZWN0aW9uIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvbmF2aWdhdGlvbkRpcmVjdGlvblwiO1xyXG5pbXBvcnQgSUhpc3RvcnkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVwiO1xyXG5pbXBvcnQgSUhpc3RvcnlVcmwgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVVybFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpc3RvcnkgaW1wbGVtZW50cyBJSGlzdG9yeSB7XHJcblxyXG4gICAgcHVibGljIGhpc3RvcnlDaGFpbjogQXJyYXk8SUhpc3RvcnlVcmw+ID0gW107XHJcbiAgICBwdWJsaWMgZGlyZWN0aW9uOiBuYXZpZ2F0aW9uRGlyZWN0aW9uID0gbmF2aWdhdGlvbkRpcmVjdGlvbi5CdXR0b25zO1xyXG4gICAgcHVibGljIGN1cnJlbnRJbmRleDogbnVtYmVyID0gMDtcclxufVxyXG4iLCJpbXBvcnQgSVVzZXIgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdXNlci9JVXNlclwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVzZXIgaW1wbGVtZW50cyBJVXNlciB7XHJcblxyXG4gICAgcHVibGljIGtleTogc3RyaW5nID0gYDAxMjM0NTY3ODlgO1xyXG4gICAgcHVibGljIHI6IHN0cmluZyA9IFwiLTFcIjtcclxuICAgIHB1YmxpYyB1c2VWc0NvZGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGF1dGhvcmlzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyByYXc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGxvZ291dFVybDogc3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBzaG93TWVudTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgc3ViOiBzdHJpbmcgPSBcIlwiO1xyXG59XHJcbiIsImltcG9ydCBJUmVwZWF0RWZmZWN0cyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lSZXBlYXRFZmZlY3RzXCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBJQWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lBY3Rpb25cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBlYXRlRWZmZWN0cyBpbXBsZW1lbnRzIElSZXBlYXRFZmZlY3RzIHtcclxuXHJcbiAgICBwdWJsaWMgc2hvcnRJbnRlcnZhbEh0dHA6IEFycmF5PElIdHRwRWZmZWN0PiA9IFtdO1xyXG4gICAgcHVibGljIHJlTG9hZEdldEh0dHBJbW1lZGlhdGU6IEFycmF5PElIdHRwRWZmZWN0PiA9IFtdO1xyXG4gICAgcHVibGljIHJ1bkFjdGlvbkltbWVkaWF0ZTogQXJyYXk8SUFjdGlvbj4gPSBbXTtcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlclN0YXRlVUkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlclN0YXRlVUlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJTdGF0ZVVJIGltcGxlbWVudHMgSVJlbmRlclN0YXRlVUkge1xyXG5cclxuICAgIHB1YmxpYyByYXc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIG9wdGlvbnNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG59XHJcbiIsImltcG9ydCBJRGlzcGxheUd1aWRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlHdWlkZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlTZWN0aW9uIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlTZWN0aW9uXCI7XHJcbmltcG9ydCBJUmVuZGVyU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVJlbmRlclN0YXRlXCI7XHJcbmltcG9ydCBJQ2hhaW5TZWdtZW50IGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lDaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJTdGF0ZVVJIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3VpL0lSZW5kZXJTdGF0ZVVJXCI7XHJcbmltcG9ydCBSZW5kZXJTdGF0ZVVJIGZyb20gXCIuL3VpL1JlbmRlclN0YXRlVUlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJTdGF0ZSBpbXBsZW1lbnRzIElSZW5kZXJTdGF0ZSB7XHJcblxyXG4gICAgcHVibGljIHJlZnJlc2hVcmw6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBpc0NoYWluTG9hZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNlZ21lbnRzOiBBcnJheTxJQ2hhaW5TZWdtZW50PiA9IFtdO1xyXG4gICAgcHVibGljIGRpc3BsYXlHdWlkZTogSURpc3BsYXlHdWlkZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIG91dGxpbmVzOiBhbnkgPSB7fTtcclxuICAgIHB1YmxpYyBvdXRsaW5lVXJsczogYW55ID0ge307XHJcbiAgICBwdWJsaWMgY3VycmVudFNlY3Rpb246IElEaXNwbGF5U2VjdGlvbiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8vIFNlYXJjaCBpbmRpY2VzXHJcbiAgICBwdWJsaWMgaW5kZXhfb3V0bGluZU5vZGVzX2lkOiBhbnkgPSB7fTtcclxuICAgIHB1YmxpYyBpbmRleF9jaGFpbkZyYWdtZW50c19pZDogYW55ID0ge307XHJcblxyXG4gICAgcHVibGljIHVpOiBJUmVuZGVyU3RhdGVVSSA9IG5ldyBSZW5kZXJTdGF0ZVVJKCk7XHJcbn1cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IFNldHRpbmdzIGZyb20gXCIuL3VzZXIvU2V0dGluZ3NcIjtcclxuaW1wb3J0IElTZXR0aW5ncyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lTZXR0aW5nc1wiO1xyXG5pbXBvcnQgSUhpc3RvcnkgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVwiO1xyXG5pbXBvcnQgU3RlcEhpc3RvcnkgZnJvbSBcIi4vaGlzdG9yeS9IaXN0b3J5XCI7XHJcbmltcG9ydCBJVXNlciBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lVc2VyXCI7XHJcbmltcG9ydCBVc2VyIGZyb20gXCIuL3VzZXIvVXNlclwiO1xyXG5pbXBvcnQgSVJlcGVhdEVmZmVjdHMgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JUmVwZWF0RWZmZWN0c1wiO1xyXG5pbXBvcnQgUmVwZWF0ZUVmZmVjdHMgZnJvbSBcIi4vZWZmZWN0cy9SZXBlYXRlRWZmZWN0c1wiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lSZW5kZXJTdGF0ZVwiO1xyXG5pbXBvcnQgUmVuZGVyU3RhdGUgZnJvbSBcIi4vUmVuZGVyU3RhdGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0ZSBpbXBsZW1lbnRzIElTdGF0ZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBJU2V0dGluZ3MgPSBuZXcgU2V0dGluZ3MoKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxvYWRpbmc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGRlYnVnOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBnZW5lcmljRXJyb3I6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBuZXh0S2V5OiBudW1iZXIgPSAtMTtcclxuICAgIHB1YmxpYyBzZXR0aW5nczogSVNldHRpbmdzO1xyXG4gICAgcHVibGljIHVzZXI6IElVc2VyID0gbmV3IFVzZXIoKTtcclxuICAgIFxyXG4gICAgcHVibGljIHJlbmRlclN0YXRlOiBJUmVuZGVyU3RhdGUgPSBuZXcgUmVuZGVyU3RhdGUoKTtcclxuXHJcbiAgICBwdWJsaWMgcmVwZWF0RWZmZWN0czogSVJlcGVhdEVmZmVjdHMgPSBuZXcgUmVwZWF0ZUVmZmVjdHMoKTtcclxuXHJcbiAgICBwdWJsaWMgc3RlcEhpc3Rvcnk6IElIaXN0b3J5ID0gbmV3IFN0ZXBIaXN0b3J5KCk7XHJcbn1cclxuXHJcblxyXG4iLCJcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuLi9odHRwL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ1JlbmRlckFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ091dGxpbmVBY3Rpb25zXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBnT3V0bGluZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ091dGxpbmVDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgZ2V0R3VpZGVPdXRsaW5lID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmcgfCBudWxsLFxyXG4gICAgbG9hZERlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgb3V0bGluZVJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5XHJcbik6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRGb2xkZXJVcmwpID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhbGxJRDogc3RyaW5nID0gVS5nZW5lcmF0ZUd1aWQoKTtcclxuXHJcbiAgICBsZXQgaGVhZGVycyA9IGdBamF4SGVhZGVyQ29kZS5idWlsZEhlYWRlcnMoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgY2FsbElELFxyXG4gICAgICAgIEFjdGlvblR5cGUuR2V0T3V0bGluZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke2dGaWxlQ29uc3RhbnRzLmd1aWRlT3V0bGluZUZpbGVuYW1lfWA7XHJcblxyXG4gICAgY29uc3QgbG9hZFJlcXVlc3RlZCA9IGdPdXRsaW5lQ29kZS5yZWdpc3Rlck91dGxpbmVVcmxEb3dubG9hZChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICB1cmxcclxuICAgICk7XHJcblxyXG4gICAgaWYgKGxvYWRSZXF1ZXN0ZWQgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGdBdXRoZW50aWNhdGVkSHR0cCh7XHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogJ2pzb24nLFxyXG4gICAgICAgIGFjdGlvbjogbG9hZERlbGVnYXRlLFxyXG4gICAgICAgIGVycm9yOiAoc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB7XHJcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBnZXR0aW5nIG91dGxpbmUgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuXCIsXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z1JlbmRlckVmZmVjdHMuZ2V0R3VpZGVPdXRsaW5lLm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICBhbGVydChge1xyXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgZ2V0dGluZyBvdXRsaW5lIGRhdGEgZnJvbSB0aGUgc2VydmVyLlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dSZW5kZXJFZmZlY3RzLmdldEd1aWRlT3V0bGluZS5uYW1lfSxcclxuICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5jb25zdCBnUmVuZGVyRWZmZWN0cyA9IHtcclxuXHJcbiAgICBnZXRHdWlkZU91dGxpbmU6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmcgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/Lmd1aWRlLmZyYWdtZW50Rm9sZGVyVXJsID8/ICdudWxsJztcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnUmVuZGVyQWN0aW9ucy5sb2FkR3VpZGVPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZ2V0R3VpZGVPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmwsXHJcbiAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEd1aWRlT3V0bGluZUFuZExvYWRTZWdtZW50czogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyA9IHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8uZ3VpZGUuZnJhZ21lbnRGb2xkZXJVcmwgPz8gJ251bGwnO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdSZW5kZXJBY3Rpb25zLmxvYWRHdWlkZU91dGxpbmVBbmRTZWdtZW50cyhcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZ2V0R3VpZGVPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmwsXHJcbiAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnUmVuZGVyRWZmZWN0cztcclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvU3RhdGVcIjtcclxuaW1wb3J0IFRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvd2luZG93L1RyZWVTb2x2ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdSZW5kZXJFZmZlY3RzIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZWZmZWN0cy9nUmVuZGVyRWZmZWN0c1wiO1xyXG5pbXBvcnQgZ1JlbmRlckNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dSZW5kZXJDb2RlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dTZWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdGlhbGlzZVN0YXRlID0gKCk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgaWYgKCF3aW5kb3cuVHJlZVNvbHZlKSB7XHJcblxyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUgPSBuZXcgVHJlZVNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RhdGU6IElTdGF0ZSA9IG5ldyBTdGF0ZSgpO1xyXG4gICAgZ1JlbmRlckNvZGUucGFyc2VSZW5kZXJpbmdDb21tZW50KHN0YXRlKTtcclxuXHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFJlbmRlckRpc3BsYXkgPSAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBpZiAoIXN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdCkge1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdC5pS2V5KSA9PT0gdHJ1ZVxyXG4gICAgICAgICYmICghc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290Lm9wdGlvbnNcclxuICAgICAgICAgICAgfHwgc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290Lm9wdGlvbnMubGVuZ3RoID09PSAwKVxyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZ1JlbmRlckVmZmVjdHMuZ2V0R3VpZGVPdXRsaW5lKHN0YXRlKVxyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkU2VnbWVudHNSZW5kZXJEaXNwbGF5ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHF1ZXJ5U3RyaW5nOiBzdHJpbmdcclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID0gdHJ1ZTtcclxuXHJcbiAgICBnU2VnbWVudENvZGUucGFyc2VTZWdtZW50cyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBxdWVyeVN0cmluZ1xyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG5cclxuICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDEpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlcmUgd2FzIG9ubHkgMSBzZWdtZW50XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJvb3RTZWdtZW50ID0gc2VnbWVudHNbMF07XHJcblxyXG4gICAgaWYgKCFyb290U2VnbWVudC5zdGFydC5pc1Jvb3QpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR3VpZGVSb290IG5vdCBwcmVzZW50XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpcnN0U2VnbWVudCA9IHNlZ21lbnRzWzFdO1xyXG5cclxuICAgIGlmICghZmlyc3RTZWdtZW50LnN0YXJ0LmlzTGFzdFxyXG4gICAgICAgICYmIGZpcnN0U2VnbWVudC5zdGFydC50eXBlICE9PSBPdXRsaW5lVHlwZS5MaW5rXHJcbiAgICApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHF1ZXJ5IHN0cmluZyBmb3JtYXQgLSBpdCBzaG91bGQgc3RhcnQgd2l0aCAnLScgb3IgJ34nXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZ1JlbmRlckVmZmVjdHMuZ2V0R3VpZGVPdXRsaW5lQW5kTG9hZFNlZ21lbnRzKHN0YXRlKVxyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IGluaXRTdGF0ZSA9IHtcclxuXHJcbiAgICBpbml0aWFsaXNlOiAoKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZTogSVN0YXRlID0gaW5pdGlhbGlzZVN0YXRlKCk7XHJcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmc6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKHF1ZXJ5U3RyaW5nKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFNlZ21lbnRzUmVuZGVyRGlzcGxheShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBxdWVyeVN0cmluZ1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVuZGVyRGlzcGxheShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgICAgIHN0YXRlLmdlbmVyaWNFcnJvciA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0U3RhdGU7XHJcblxyXG4iLCJpbXBvcnQgRmlsdGVycyBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvY29uc3RhbnRzL0ZpbHRlcnNcIjtcclxuaW1wb3J0IFRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvd2luZG93L1RyZWVTb2x2ZVwiO1xyXG5cclxuXHJcbmNvbnN0IHJlbmRlckNvbW1lbnRzID0ge1xyXG5cclxuICAgIHJlZ2lzdGVyR3VpZGVDb21tZW50OiAoKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHRyZWVTb2x2ZUd1aWRlOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKEZpbHRlcnMudHJlZVNvbHZlR3VpZGVJRCkgYXMgSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0cmVlU29sdmVHdWlkZVxyXG4gICAgICAgICAgICAmJiB0cmVlU29sdmVHdWlkZS5oYXNDaGlsZE5vZGVzKCkgPT09IHRydWVcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkTm9kZTogQ2hpbGROb2RlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2hpbGROb2RlID0gdHJlZVNvbHZlR3VpZGUuY2hpbGROb2Rlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLm5vZGVUeXBlID09PSBOb2RlLkNPTU1FTlRfTk9ERSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUgPSBuZXcgVHJlZVNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnJlbmRlcmluZ0NvbW1lbnQgPSBjaGlsZE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyQ29tbWVudHM7XHJcbiIsImltcG9ydCB7IGFwcCB9IGZyb20gXCIuL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xuXG5pbXBvcnQgaW5pdFN1YnNjcmlwdGlvbnMgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvc3Vic2NyaXB0aW9ucy9pbml0U3Vic2NyaXB0aW9uc1wiO1xuaW1wb3J0IGluaXRFdmVudHMgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9pbml0RXZlbnRzXCI7XG5pbXBvcnQgaW5pdFZpZXcgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvdmlld3MvaW5pdFZpZXdcIjtcbmltcG9ydCBpbml0U3RhdGUgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9pbml0U3RhdGVcIjtcbmltcG9ydCByZW5kZXJDb21tZW50cyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL3JlbmRlckNvbW1lbnRzXCI7XG5cblxuaW5pdEV2ZW50cy5yZWdpc3Rlckdsb2JhbEV2ZW50cygpO1xucmVuZGVyQ29tbWVudHMucmVnaXN0ZXJHdWlkZUNvbW1lbnQoKTtcblxuKHdpbmRvdyBhcyBhbnkpLkNvbXBvc2l0ZUZsb3dzQXV0aG9yID0gYXBwKHtcbiAgICBcbiAgICBub2RlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRyZWVTb2x2ZUZyYWdtZW50c1wiKSxcbiAgICBpbml0OiBpbml0U3RhdGUuaW5pdGlhbGlzZSxcbiAgICB2aWV3OiBpbml0Vmlldy5idWlsZFZpZXcsXG4gICAgc3Vic2NyaXB0aW9uczogaW5pdFN1YnNjcmlwdGlvbnMsXG4gICAgb25FbmQ6IGluaXRFdmVudHMub25SZW5kZXJGaW5pc2hlZFxufSk7XG5cblxuIl0sIm5hbWVzIjpbInByb3BzIiwiY291bnQiLCJvdXRwdXQiLCJVIiwibG9jYXRpb24iLCJlZmZlY3QiLCJodHRwRWZmZWN0IiwiQWN0aW9uVHlwZSIsInN0YXRlIiwiUGFyc2VUeXBlIiwiT3V0bGluZVR5cGUiLCJTY3JvbGxIb3BUeXBlIiwib3V0bGluZVJlc3BvbnNlIiwibmF2aWdhdGlvbkRpcmVjdGlvbiIsIlN0ZXBIaXN0b3J5IiwiZ1JlbmRlckFjdGlvbnMiXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQUksZ0JBQWdCO0FBQ3BCLElBQUksWUFBWTtBQUNoQixJQUFJLFlBQVk7QUFDaEIsSUFBSSxZ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
