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
    __publicField(this, "podKey", null);
    __publicField(this, "podText", null);
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
  getOutline: (state, fragmentFolderUrl) => {
    let outline = state.renderState.outlines[fragmentFolderUrl];
    if (outline) {
      return outline;
    }
    outline = new RenderOutline(fragmentFolderUrl);
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
  getOutlineFromPod_subscription: (state, chart, optionFragment) => {
    var _a, _b;
    if (!chart) {
      throw new Error("OutlineChart was null");
    }
    if ((_a = optionFragment.link) == null ? void 0 : _a.root) {
      console.log(`Link root already loaded: ${(_b = optionFragment.link.root) == null ? void 0 : _b.id}`);
      return;
    }
    const outlineChartPath = chart == null ? void 0 : chart.p;
    const fragmentFolderUrl = gRenderCode.getFragmentFolderUrl(outlineChartPath);
    if (gUtilities.isNullOrWhiteSpace(fragmentFolderUrl)) {
      return;
    }
    const outline = gOutlineCode.getOutline(
      state,
      fragmentFolderUrl
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
    fragment.guidePath = rawFragment.guidePath ?? "";
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
  if ((_a = option.pod) == null ? void 0 : _a.root) {
    buttonClass = `${buttonClass} nt-fr-pod-button`;
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
          podViews.buildView(option),
          h("span", { class: "nt-fr-option-text" }, option.option)
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
        optionsCollapsed: false,
        hasAncillaries: false
      };
    }
    if (fragment.options.length === 1 && fragment.options[0].option === "") {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpZGUuOElXa3o5NWsuanMiLCJzb3VyY2VzIjpbIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL3RpbWUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dIdHRwLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nVXRpbGl0aWVzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnlVcmwudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dIaXN0b3J5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvaHR0cC9nQWpheEhlYWRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkVmZmVjdHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkh0dHAudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdWJzY3JpcHRpb25zL3JlcGVhdFN1YnNjcmlwdGlvbi50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy9jb2RlL29uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL29uUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9hY3Rpb25zL2luaXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyRnJhZ21lbnRVSS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckZyYWdtZW50LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZU5vZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9kaXNwbGF5L0Rpc3BsYXlHdWlkZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckd1aWRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1Njcm9sbEhvcFR5cGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9TY3JlZW4udHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9UcmVlU29sdmUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nRmlsZUNvbnN0YW50cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1JlbmRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9zZWdtZW50cy9DaGFpblNlZ21lbnQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3NlZ21lbnRzL1NlZ21lbnROb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nU2VnbWVudENvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dPdXRsaW5lQWN0aW9ucy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ091dGxpbmVDb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nRnJhZ21lbnRFZmZlY3RzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nSG9va1JlZ2lzdHJ5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvYWN0aW9ucy9mcmFnbWVudEFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VpL3BheWxvYWRzL0ZyYWdtZW50UGF5bG9hZC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvdmlld3MvcG9kVmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL29wdGlvbnNWaWV3cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvdmlld3MvbGlua1ZpZXdzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy92aWV3cy9mcmFnbWVudFZpZXdzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy92aWV3cy9ndWlkZVZpZXdzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2luaXQvdmlld3MvaW5pdFZpZXcudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VzZXIvU2V0dGluZ3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvZW51bXMvbmF2aWdhdGlvbkRpcmVjdGlvbi50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvaGlzdG9yeS9IaXN0b3J5LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS91c2VyL1VzZXIudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2VmZmVjdHMvUmVwZWF0ZUVmZmVjdHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VpL1JlbmRlclN0YXRlVUkudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL1JlbmRlclN0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9TdGF0ZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2VmZmVjdHMvZ1JlbmRlckVmZmVjdHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRTdGF0ZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvcmVuZGVyQ29tbWVudHMudHMiLCIuLi9yb290L3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUkVDWUNMRURfTk9ERSA9IDFcclxudmFyIExBWllfTk9ERSA9IDJcclxudmFyIFRFWFRfTk9ERSA9IDNcclxudmFyIEVNUFRZX09CSiA9IHt9XHJcbnZhciBFTVBUWV9BUlIgPSBbXVxyXG52YXIgbWFwID0gRU1QVFlfQVJSLm1hcFxyXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcclxudmFyIGRlZmVyID1cclxuICB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSBcInVuZGVmaW5lZFwiXHJcbiAgICA/IHJlcXVlc3RBbmltYXRpb25GcmFtZVxyXG4gICAgOiBzZXRUaW1lb3V0XHJcblxyXG52YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbihvYmopIHtcclxuICB2YXIgb3V0ID0gXCJcIlxyXG5cclxuICBpZiAodHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIG9ialxyXG5cclxuICBpZiAoaXNBcnJheShvYmopICYmIG9iai5sZW5ndGggPiAwKSB7XHJcbiAgICBmb3IgKHZhciBrID0gMCwgdG1wOyBrIDwgb2JqLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgIGlmICgodG1wID0gY3JlYXRlQ2xhc3Mob2JqW2tdKSkgIT09IFwiXCIpIHtcclxuICAgICAgICBvdXQgKz0gKG91dCAmJiBcIiBcIikgKyB0bXBcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBmb3IgKHZhciBrIGluIG9iaikge1xyXG4gICAgICBpZiAob2JqW2tdKSB7XHJcbiAgICAgICAgb3V0ICs9IChvdXQgJiYgXCIgXCIpICsga1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbnZhciBtZXJnZSA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICB2YXIgb3V0ID0ge31cclxuXHJcbiAgZm9yICh2YXIgayBpbiBhKSBvdXRba10gPSBhW2tdXHJcbiAgZm9yICh2YXIgayBpbiBiKSBvdXRba10gPSBiW2tdXHJcblxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxudmFyIGJhdGNoID0gZnVuY3Rpb24obGlzdCkge1xyXG4gIHJldHVybiBsaXN0LnJlZHVjZShmdW5jdGlvbihvdXQsIGl0ZW0pIHtcclxuICAgIHJldHVybiBvdXQuY29uY2F0KFxyXG4gICAgICAhaXRlbSB8fCBpdGVtID09PSB0cnVlXHJcbiAgICAgICAgPyAwXHJcbiAgICAgICAgOiB0eXBlb2YgaXRlbVswXSA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgPyBbaXRlbV1cclxuICAgICAgICA6IGJhdGNoKGl0ZW0pXHJcbiAgICApXHJcbiAgfSwgRU1QVFlfQVJSKVxyXG59XHJcblxyXG52YXIgaXNTYW1lQWN0aW9uID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIHJldHVybiBpc0FycmF5KGEpICYmIGlzQXJyYXkoYikgJiYgYVswXSA9PT0gYlswXSAmJiB0eXBlb2YgYVswXSA9PT0gXCJmdW5jdGlvblwiXHJcbn1cclxuXHJcbnZhciBzaG91bGRSZXN0YXJ0ID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIGlmIChhICE9PSBiKSB7XHJcbiAgICBmb3IgKHZhciBrIGluIG1lcmdlKGEsIGIpKSB7XHJcbiAgICAgIGlmIChhW2tdICE9PSBiW2tdICYmICFpc1NhbWVBY3Rpb24oYVtrXSwgYltrXSkpIHJldHVybiB0cnVlXHJcbiAgICAgIGJba10gPSBhW2tdXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG52YXIgcGF0Y2hTdWJzID0gZnVuY3Rpb24ob2xkU3VicywgbmV3U3VicywgZGlzcGF0Y2gpIHtcclxuICBmb3IgKFxyXG4gICAgdmFyIGkgPSAwLCBvbGRTdWIsIG5ld1N1Yiwgc3VicyA9IFtdO1xyXG4gICAgaSA8IG9sZFN1YnMubGVuZ3RoIHx8IGkgPCBuZXdTdWJzLmxlbmd0aDtcclxuICAgIGkrK1xyXG4gICkge1xyXG4gICAgb2xkU3ViID0gb2xkU3Vic1tpXVxyXG4gICAgbmV3U3ViID0gbmV3U3Vic1tpXVxyXG4gICAgc3Vicy5wdXNoKFxyXG4gICAgICBuZXdTdWJcclxuICAgICAgICA/ICFvbGRTdWIgfHxcclxuICAgICAgICAgIG5ld1N1YlswXSAhPT0gb2xkU3ViWzBdIHx8XHJcbiAgICAgICAgICBzaG91bGRSZXN0YXJ0KG5ld1N1YlsxXSwgb2xkU3ViWzFdKVxyXG4gICAgICAgICAgPyBbXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzBdLFxyXG4gICAgICAgICAgICAgIG5ld1N1YlsxXSxcclxuICAgICAgICAgICAgICBuZXdTdWJbMF0oZGlzcGF0Y2gsIG5ld1N1YlsxXSksXHJcbiAgICAgICAgICAgICAgb2xkU3ViICYmIG9sZFN1YlsyXSgpXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIDogb2xkU3ViXHJcbiAgICAgICAgOiBvbGRTdWIgJiYgb2xkU3ViWzJdKClcclxuICAgIClcclxuICB9XHJcbiAgcmV0dXJuIHN1YnNcclxufVxyXG5cclxudmFyIHBhdGNoUHJvcGVydHkgPSBmdW5jdGlvbihub2RlLCBrZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgaWYgKGtleSA9PT0gXCJrZXlcIikge1xyXG4gIH0gZWxzZSBpZiAoa2V5ID09PSBcInN0eWxlXCIpIHtcclxuICAgIGZvciAodmFyIGsgaW4gbWVyZ2Uob2xkVmFsdWUsIG5ld1ZhbHVlKSkge1xyXG4gICAgICBvbGRWYWx1ZSA9IG5ld1ZhbHVlID09IG51bGwgfHwgbmV3VmFsdWVba10gPT0gbnVsbCA/IFwiXCIgOiBuZXdWYWx1ZVtrXVxyXG4gICAgICBpZiAoa1swXSA9PT0gXCItXCIpIHtcclxuICAgICAgICBub2RlW2tleV0uc2V0UHJvcGVydHkoaywgb2xkVmFsdWUpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm9kZVtrZXldW2tdID0gb2xkVmFsdWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoa2V5WzBdID09PSBcIm9cIiAmJiBrZXlbMV0gPT09IFwiblwiKSB7XHJcbiAgICBpZiAoXHJcbiAgICAgICEoKG5vZGUuYWN0aW9ucyB8fCAobm9kZS5hY3Rpb25zID0ge30pKVtcclxuICAgICAgICAoa2V5ID0ga2V5LnNsaWNlKDIpLnRvTG93ZXJDYXNlKCkpXHJcbiAgICAgIF0gPSBuZXdWYWx1ZSlcclxuICAgICkge1xyXG4gICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LCBsaXN0ZW5lcilcclxuICAgIH0gZWxzZSBpZiAoIW9sZFZhbHVlKSB7XHJcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoIWlzU3ZnICYmIGtleSAhPT0gXCJsaXN0XCIgJiYga2V5IGluIG5vZGUpIHtcclxuICAgIG5vZGVba2V5XSA9IG5ld1ZhbHVlID09IG51bGwgfHwgbmV3VmFsdWUgPT0gXCJ1bmRlZmluZWRcIiA/IFwiXCIgOiBuZXdWYWx1ZVxyXG4gIH0gZWxzZSBpZiAoXHJcbiAgICBuZXdWYWx1ZSA9PSBudWxsIHx8XHJcbiAgICBuZXdWYWx1ZSA9PT0gZmFsc2UgfHxcclxuICAgIChrZXkgPT09IFwiY2xhc3NcIiAmJiAhKG5ld1ZhbHVlID0gY3JlYXRlQ2xhc3MobmV3VmFsdWUpKSlcclxuICApIHtcclxuICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGtleSlcclxuICB9IGVsc2Uge1xyXG4gICAgbm9kZS5zZXRBdHRyaWJ1dGUoa2V5LCBuZXdWYWx1ZSlcclxuICB9XHJcbn1cclxuXHJcbnZhciBjcmVhdGVOb2RlID0gZnVuY3Rpb24odmRvbSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgdmFyIG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXHJcbiAgdmFyIHByb3BzID0gdmRvbS5wcm9wc1xyXG4gIHZhciBub2RlID1cclxuICAgIHZkb20udHlwZSA9PT0gVEVYVF9OT0RFXHJcbiAgICAgID8gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmRvbS5uYW1lKVxyXG4gICAgICA6IChpc1N2ZyA9IGlzU3ZnIHx8IHZkb20ubmFtZSA9PT0gXCJzdmdcIilcclxuICAgICAgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHZkb20ubmFtZSwgeyBpczogcHJvcHMuaXMgfSlcclxuICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHZkb20ubmFtZSwgeyBpczogcHJvcHMuaXMgfSlcclxuXHJcbiAgZm9yICh2YXIgayBpbiBwcm9wcykge1xyXG4gICAgcGF0Y2hQcm9wZXJ0eShub2RlLCBrLCBudWxsLCBwcm9wc1trXSwgbGlzdGVuZXIsIGlzU3ZnKVxyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHZkb20uY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIG5vZGUuYXBwZW5kQ2hpbGQoXHJcbiAgICAgIGNyZWF0ZU5vZGUoXHJcbiAgICAgICAgKHZkb20uY2hpbGRyZW5baV0gPSBnZXRWTm9kZSh2ZG9tLmNoaWxkcmVuW2ldKSksXHJcbiAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgaXNTdmdcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuICh2ZG9tLm5vZGUgPSBub2RlKVxyXG59XHJcblxyXG52YXIgZ2V0S2V5ID0gZnVuY3Rpb24odmRvbSkge1xyXG4gIHJldHVybiB2ZG9tID09IG51bGwgPyBudWxsIDogdmRvbS5rZXlcclxufVxyXG5cclxudmFyIHBhdGNoID0gZnVuY3Rpb24ocGFyZW50LCBub2RlLCBvbGRWTm9kZSwgbmV3Vk5vZGUsIGxpc3RlbmVyLCBpc1N2Zykge1xyXG4gIGlmIChvbGRWTm9kZSA9PT0gbmV3Vk5vZGUpIHtcclxuICB9IGVsc2UgaWYgKFxyXG4gICAgb2xkVk5vZGUgIT0gbnVsbCAmJlxyXG4gICAgb2xkVk5vZGUudHlwZSA9PT0gVEVYVF9OT0RFICYmXHJcbiAgICBuZXdWTm9kZS50eXBlID09PSBURVhUX05PREVcclxuICApIHtcclxuICAgIGlmIChvbGRWTm9kZS5uYW1lICE9PSBuZXdWTm9kZS5uYW1lKSBub2RlLm5vZGVWYWx1ZSA9IG5ld1ZOb2RlLm5hbWVcclxuICB9IGVsc2UgaWYgKG9sZFZOb2RlID09IG51bGwgfHwgb2xkVk5vZGUubmFtZSAhPT0gbmV3Vk5vZGUubmFtZSkge1xyXG4gICAgbm9kZSA9IHBhcmVudC5pbnNlcnRCZWZvcmUoXHJcbiAgICAgIGNyZWF0ZU5vZGUoKG5ld1ZOb2RlID0gZ2V0Vk5vZGUobmV3Vk5vZGUpKSwgbGlzdGVuZXIsIGlzU3ZnKSxcclxuICAgICAgbm9kZVxyXG4gICAgKVxyXG4gICAgaWYgKG9sZFZOb2RlICE9IG51bGwpIHtcclxuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKG9sZFZOb2RlLm5vZGUpXHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciB0bXBWS2lkXHJcbiAgICB2YXIgb2xkVktpZFxyXG5cclxuICAgIHZhciBvbGRLZXlcclxuICAgIHZhciBuZXdLZXlcclxuXHJcbiAgICB2YXIgb2xkVlByb3BzID0gb2xkVk5vZGUucHJvcHNcclxuICAgIHZhciBuZXdWUHJvcHMgPSBuZXdWTm9kZS5wcm9wc1xyXG5cclxuICAgIHZhciBvbGRWS2lkcyA9IG9sZFZOb2RlLmNoaWxkcmVuXHJcbiAgICB2YXIgbmV3VktpZHMgPSBuZXdWTm9kZS5jaGlsZHJlblxyXG5cclxuICAgIHZhciBvbGRIZWFkID0gMFxyXG4gICAgdmFyIG5ld0hlYWQgPSAwXHJcbiAgICB2YXIgb2xkVGFpbCA9IG9sZFZLaWRzLmxlbmd0aCAtIDFcclxuICAgIHZhciBuZXdUYWlsID0gbmV3VktpZHMubGVuZ3RoIC0gMVxyXG5cclxuICAgIGlzU3ZnID0gaXNTdmcgfHwgbmV3Vk5vZGUubmFtZSA9PT0gXCJzdmdcIlxyXG5cclxuICAgIGZvciAodmFyIGkgaW4gbWVyZ2Uob2xkVlByb3BzLCBuZXdWUHJvcHMpKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAoaSA9PT0gXCJ2YWx1ZVwiIHx8IGkgPT09IFwic2VsZWN0ZWRcIiB8fCBpID09PSBcImNoZWNrZWRcIlxyXG4gICAgICAgICAgPyBub2RlW2ldXHJcbiAgICAgICAgICA6IG9sZFZQcm9wc1tpXSkgIT09IG5ld1ZQcm9wc1tpXVxyXG4gICAgICApIHtcclxuICAgICAgICBwYXRjaFByb3BlcnR5KG5vZGUsIGksIG9sZFZQcm9wc1tpXSwgbmV3VlByb3BzW2ldLCBsaXN0ZW5lciwgaXNTdmcpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsICYmIG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKG9sZEtleSA9IGdldEtleShvbGRWS2lkc1tvbGRIZWFkXSkpID09IG51bGwgfHxcclxuICAgICAgICBvbGRLZXkgIT09IGdldEtleShuZXdWS2lkc1tuZXdIZWFkXSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGF0Y2goXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRIZWFkXS5ub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZEhlYWRdLFxyXG4gICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKFxyXG4gICAgICAgICAgbmV3VktpZHNbbmV3SGVhZCsrXSxcclxuICAgICAgICAgIG9sZFZLaWRzW29sZEhlYWQrK11cclxuICAgICAgICApKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCAmJiBvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChvbGRLZXkgPSBnZXRLZXkob2xkVktpZHNbb2xkVGFpbF0pKSA9PSBudWxsIHx8XHJcbiAgICAgICAgb2xkS2V5ICE9PSBnZXRLZXkobmV3VktpZHNbbmV3VGFpbF0pXHJcbiAgICAgICkge1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhdGNoKFxyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkVGFpbF0ubm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRUYWlsXSxcclxuICAgICAgICAobmV3VktpZHNbbmV3VGFpbF0gPSBnZXRWTm9kZShcclxuICAgICAgICAgIG5ld1ZLaWRzW25ld1RhaWwtLV0sXHJcbiAgICAgICAgICBvbGRWS2lkc1tvbGRUYWlsLS1dXHJcbiAgICAgICAgKSksXHJcbiAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgaXNTdmdcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvbGRIZWFkID4gb2xkVGFpbCkge1xyXG4gICAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsKSB7XHJcbiAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUoXHJcbiAgICAgICAgICBjcmVhdGVOb2RlKFxyXG4gICAgICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShuZXdWS2lkc1tuZXdIZWFkKytdKSksXHJcbiAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgIChvbGRWS2lkID0gb2xkVktpZHNbb2xkSGVhZF0pICYmIG9sZFZLaWQubm9kZVxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChuZXdIZWFkID4gbmV3VGFpbCkge1xyXG4gICAgICB3aGlsZSAob2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkc1tvbGRIZWFkKytdLm5vZGUpXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSBvbGRIZWFkLCBrZXllZCA9IHt9LCBuZXdLZXllZCA9IHt9OyBpIDw9IG9sZFRhaWw7IGkrKykge1xyXG4gICAgICAgIGlmICgob2xkS2V5ID0gb2xkVktpZHNbaV0ua2V5KSAhPSBudWxsKSB7XHJcbiAgICAgICAgICBrZXllZFtvbGRLZXldID0gb2xkVktpZHNbaV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwpIHtcclxuICAgICAgICBvbGRLZXkgPSBnZXRLZXkoKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkXSkpXHJcbiAgICAgICAgbmV3S2V5ID0gZ2V0S2V5KFxyXG4gICAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUobmV3VktpZHNbbmV3SGVhZF0sIG9sZFZLaWQpKVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgbmV3S2V5ZWRbb2xkS2V5XSB8fFxyXG4gICAgICAgICAgKG5ld0tleSAhPSBudWxsICYmIG5ld0tleSA9PT0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWQgKyAxXSkpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV3S2V5ID09IG51bGwgfHwgb2xkVk5vZGUudHlwZSA9PT0gUkVDWUNMRURfTk9ERSkge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZCAmJiBvbGRWS2lkLm5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZCxcclxuICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIG5ld0hlYWQrK1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgb2xkSGVhZCsrXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT09IG5ld0tleSkge1xyXG4gICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLFxyXG4gICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgbmV3S2V5ZWRbbmV3S2V5XSA9IHRydWVcclxuICAgICAgICAgICAgb2xkSGVhZCsrXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoKHRtcFZLaWQgPSBrZXllZFtuZXdLZXldKSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUodG1wVktpZC5ub2RlLCBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSksXHJcbiAgICAgICAgICAgICAgICB0bXBWS2lkLFxyXG4gICAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgIG5ld0tleWVkW25ld0tleV0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgb2xkVktpZCAmJiBvbGRWS2lkLm5vZGUsXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBuZXdIZWFkKytcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdoaWxlIChvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgICBpZiAoZ2V0S2V5KChvbGRWS2lkID0gb2xkVktpZHNbb2xkSGVhZCsrXSkpID09IG51bGwpIHtcclxuICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQob2xkVktpZC5ub2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICh2YXIgaSBpbiBrZXllZCkge1xyXG4gICAgICAgIGlmIChuZXdLZXllZFtpXSA9PSBudWxsKSB7XHJcbiAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKGtleWVkW2ldLm5vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKG5ld1ZOb2RlLm5vZGUgPSBub2RlKVxyXG59XHJcblxyXG52YXIgcHJvcHNDaGFuZ2VkID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIGZvciAodmFyIGsgaW4gYSkgaWYgKGFba10gIT09IGJba10pIHJldHVybiB0cnVlXHJcbiAgZm9yICh2YXIgayBpbiBiKSBpZiAoYVtrXSAhPT0gYltrXSkgcmV0dXJuIHRydWVcclxufVxyXG5cclxudmFyIGdldFRleHRWTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICByZXR1cm4gdHlwZW9mIG5vZGUgPT09IFwib2JqZWN0XCIgPyBub2RlIDogY3JlYXRlVGV4dFZOb2RlKG5vZGUpXHJcbn1cclxuXHJcbnZhciBnZXRWTm9kZSA9IGZ1bmN0aW9uKG5ld1ZOb2RlLCBvbGRWTm9kZSkge1xyXG4gIHJldHVybiBuZXdWTm9kZS50eXBlID09PSBMQVpZX05PREVcclxuICAgID8gKCghb2xkVk5vZGUgfHwgIW9sZFZOb2RlLmxhenkgfHwgcHJvcHNDaGFuZ2VkKG9sZFZOb2RlLmxhenksIG5ld1ZOb2RlLmxhenkpKVxyXG4gICAgICAgICYmICgob2xkVk5vZGUgPSBnZXRUZXh0Vk5vZGUobmV3Vk5vZGUubGF6eS52aWV3KG5ld1ZOb2RlLmxhenkpKSkubGF6eSA9XHJcbiAgICAgICAgICBuZXdWTm9kZS5sYXp5KSxcclxuICAgICAgb2xkVk5vZGUpXHJcbiAgICA6IG5ld1ZOb2RlXHJcbn1cclxuXHJcbnZhciBjcmVhdGVWTm9kZSA9IGZ1bmN0aW9uKG5hbWUsIHByb3BzLCBjaGlsZHJlbiwgbm9kZSwga2V5LCB0eXBlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6IG5hbWUsXHJcbiAgICBwcm9wczogcHJvcHMsXHJcbiAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICBub2RlOiBub2RlLFxyXG4gICAgdHlwZTogdHlwZSxcclxuICAgIGtleToga2V5XHJcbiAgfVxyXG59XHJcblxyXG52YXIgY3JlYXRlVGV4dFZOb2RlID0gZnVuY3Rpb24odmFsdWUsIG5vZGUpIHtcclxuICByZXR1cm4gY3JlYXRlVk5vZGUodmFsdWUsIEVNUFRZX09CSiwgRU1QVFlfQVJSLCBub2RlLCB1bmRlZmluZWQsIFRFWFRfTk9ERSlcclxufVxyXG5cclxudmFyIHJlY3ljbGVOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSBURVhUX05PREVcclxuICAgID8gY3JlYXRlVGV4dFZOb2RlKG5vZGUubm9kZVZhbHVlLCBub2RlKVxyXG4gICAgOiBjcmVhdGVWTm9kZShcclxuICAgICAgICBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgRU1QVFlfT0JKLFxyXG4gICAgICAgIG1hcC5jYWxsKG5vZGUuY2hpbGROb2RlcywgcmVjeWNsZU5vZGUpLFxyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgdW5kZWZpbmVkLFxyXG4gICAgICAgIFJFQ1lDTEVEX05PREVcclxuICAgICAgKVxyXG59XHJcblxyXG5leHBvcnQgdmFyIExhenkgPSBmdW5jdGlvbihwcm9wcykge1xyXG4gIHJldHVybiB7XHJcbiAgICBsYXp5OiBwcm9wcyxcclxuICAgIHR5cGU6IExBWllfTk9ERVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBoID0gZnVuY3Rpb24obmFtZSwgcHJvcHMpIHtcclxuICBmb3IgKHZhciB2ZG9tLCByZXN0ID0gW10sIGNoaWxkcmVuID0gW10sIGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOyApIHtcclxuICAgIHJlc3QucHVzaChhcmd1bWVudHNbaV0pXHJcbiAgfVxyXG5cclxuICB3aGlsZSAocmVzdC5sZW5ndGggPiAwKSB7XHJcbiAgICBpZiAoaXNBcnJheSgodmRvbSA9IHJlc3QucG9wKCkpKSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gdmRvbS5sZW5ndGg7IGktLSA+IDA7ICkge1xyXG4gICAgICAgIHJlc3QucHVzaCh2ZG9tW2ldKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHZkb20gPT09IGZhbHNlIHx8IHZkb20gPT09IHRydWUgfHwgdmRvbSA9PSBudWxsKSB7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjaGlsZHJlbi5wdXNoKGdldFRleHRWTm9kZSh2ZG9tKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb3BzID0gcHJvcHMgfHwgRU1QVFlfT0JKXHJcblxyXG4gIHJldHVybiB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICA/IG5hbWUocHJvcHMsIGNoaWxkcmVuKVxyXG4gICAgOiBjcmVhdGVWTm9kZShuYW1lLCBwcm9wcywgY2hpbGRyZW4sIHVuZGVmaW5lZCwgcHJvcHMua2V5KVxyXG59XHJcblxyXG5leHBvcnQgdmFyIGFwcCA9IGZ1bmN0aW9uKHByb3BzKSB7XHJcbiAgdmFyIHN0YXRlID0ge31cclxuICB2YXIgbG9jayA9IGZhbHNlXHJcbiAgdmFyIHZpZXcgPSBwcm9wcy52aWV3XHJcbiAgdmFyIG5vZGUgPSBwcm9wcy5ub2RlXHJcbiAgdmFyIHZkb20gPSBub2RlICYmIHJlY3ljbGVOb2RlKG5vZGUpXHJcbiAgdmFyIHN1YnNjcmlwdGlvbnMgPSBwcm9wcy5zdWJzY3JpcHRpb25zXHJcbiAgdmFyIHN1YnMgPSBbXVxyXG4gIHZhciBvbkVuZCA9IHByb3BzLm9uRW5kXHJcblxyXG4gIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBkaXNwYXRjaCh0aGlzLmFjdGlvbnNbZXZlbnQudHlwZV0sIGV2ZW50KVxyXG4gIH1cclxuXHJcbiAgdmFyIHNldFN0YXRlID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcclxuICAgIGlmIChzdGF0ZSAhPT0gbmV3U3RhdGUpIHtcclxuICAgICAgc3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xyXG4gICAgICAgIHN1YnMgPSBwYXRjaFN1YnMoc3VicywgYmF0Y2goW3N1YnNjcmlwdGlvbnMoc3RhdGUpXSksIGRpc3BhdGNoKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh2aWV3ICYmICFsb2NrKSBkZWZlcihyZW5kZXIsIChsb2NrID0gdHJ1ZSkpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RhdGVcclxuICB9XHJcblxyXG4gIHZhciBkaXNwYXRjaCA9IChwcm9wcy5taWRkbGV3YXJlIHx8XHJcbiAgICBmdW5jdGlvbihvYmopIHtcclxuICAgICAgcmV0dXJuIG9ialxyXG4gICAgfSkoZnVuY3Rpb24oYWN0aW9uLCBwcm9wcykge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBhY3Rpb24gPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICA/IGRpc3BhdGNoKGFjdGlvbihzdGF0ZSwgcHJvcHMpKVxyXG4gICAgICA6IGlzQXJyYXkoYWN0aW9uKVxyXG4gICAgICA/IHR5cGVvZiBhY3Rpb25bMF0gPT09IFwiZnVuY3Rpb25cIiB8fCBpc0FycmF5KGFjdGlvblswXSlcclxuICAgICAgICA/IGRpc3BhdGNoKFxyXG4gICAgICAgICAgICBhY3Rpb25bMF0sXHJcbiAgICAgICAgICAgIHR5cGVvZiBhY3Rpb25bMV0gPT09IFwiZnVuY3Rpb25cIiA/IGFjdGlvblsxXShwcm9wcykgOiBhY3Rpb25bMV1cclxuICAgICAgICAgIClcclxuICAgICAgICA6IChiYXRjaChhY3Rpb24uc2xpY2UoMSkpLm1hcChmdW5jdGlvbihmeCkge1xyXG4gICAgICAgICAgICBmeCAmJiBmeFswXShkaXNwYXRjaCwgZnhbMV0pXHJcbiAgICAgICAgICB9LCBzZXRTdGF0ZShhY3Rpb25bMF0pKSxcclxuICAgICAgICAgIHN0YXRlKVxyXG4gICAgICA6IHNldFN0YXRlKGFjdGlvbilcclxuICB9KVxyXG5cclxuICB2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsb2NrID0gZmFsc2VcclxuICAgIG5vZGUgPSBwYXRjaChcclxuICAgICAgbm9kZS5wYXJlbnROb2RlLFxyXG4gICAgICBub2RlLFxyXG4gICAgICB2ZG9tLFxyXG4gICAgICAodmRvbSA9IGdldFRleHRWTm9kZSh2aWV3KHN0YXRlKSkpLFxyXG4gICAgICBsaXN0ZW5lclxyXG4gICAgKVxyXG4gICAgb25FbmQoKVxyXG4gIH1cclxuXHJcbiAgZGlzcGF0Y2gocHJvcHMuaW5pdClcclxufVxyXG4iLCJ2YXIgdGltZUZ4ID0gZnVuY3Rpb24gKGZ4OiBhbnkpIHtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKFxyXG4gICAgICAgIGFjdGlvbjogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgZngsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgZGVsYXk6IHByb3BzLmRlbGF5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdO1xyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCB2YXIgdGltZW91dCA9IHRpbWVGeChcclxuXHJcbiAgICBmdW5jdGlvbiAoXHJcbiAgICAgICAgZGlzcGF0Y2g6IGFueSxcclxuICAgICAgICBwcm9wczogYW55KSB7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChwcm9wcy5hY3Rpb24pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwcm9wcy5kZWxheVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbik7XHJcblxyXG5leHBvcnQgdmFyIGludGVydmFsID0gdGltZUZ4KFxyXG5cclxuICAgIGZ1bmN0aW9uIChcclxuICAgICAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgdmFyIGlkID0gc2V0SW50ZXJ2YWwoXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIERhdGUubm93KClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzLmRlbGF5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaWQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbik7XHJcblxyXG5cclxuLy8gZXhwb3J0IHZhciBub3dcclxuLy8gZXhwb3J0IHZhciByZXRyeVxyXG4vLyBleHBvcnQgdmFyIGRlYm91bmNlXHJcbi8vIGV4cG9ydCB2YXIgdGhyb3R0bGVcclxuLy8gZXhwb3J0IHZhciBpZGxlQ2FsbGJhY2s/XHJcbiIsIlxyXG5pbXBvcnQgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1wiO1xyXG5pbXBvcnQgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jayBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2tcIjtcclxuaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBJSHR0cE91dHB1dCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwT3V0cHV0XCI7XHJcbmltcG9ydCB7IElIdHRwU2VxdWVudGlhbEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBTZXF1ZW50aWFsRmV0Y2hJdGVtXCI7XHJcblxyXG5jb25zdCBzZXF1ZW50aWFsSHR0cEVmZmVjdCA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBzZXF1ZW50aWFsQmxvY2tzOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrPik6IHZvaWQgPT4ge1xyXG5cclxuICAgIC8vIEVhY2ggSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jayB3aWxsIHJ1biBzZXF1ZW50aWFsbHlcclxuICAgIC8vIEVhY2ggSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgaW4gZWFjaCBibG9jayB3aWxsIHJ1bm4gaW4gcGFyYWxsZWxcclxuICAgIGxldCBibG9jazogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jaztcclxuICAgIGxldCBzdWNjZXNzOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIGxldCBodHRwQ2FsbDogYW55O1xyXG4gICAgbGV0IGxhc3RIdHRwQ2FsbDogYW55O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSBzZXF1ZW50aWFsQmxvY2tzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICAgIGJsb2NrID0gc2VxdWVudGlhbEJsb2Nrc1tpXTtcclxuXHJcbiAgICAgICAgaWYgKGJsb2NrID09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShibG9jaykpIHtcclxuXHJcbiAgICAgICAgICAgIGh0dHBDYWxsID0ge1xyXG4gICAgICAgICAgICAgICAgZGVsZWdhdGU6IHByb2Nlc3NCbG9jayxcclxuICAgICAgICAgICAgICAgIGRpc3BhdGNoOiBkaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgIGJsb2NrOiBibG9jayxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBgJHtpfWBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaHR0cENhbGwgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZTogcHJvY2Vzc1Byb3BzLFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxyXG4gICAgICAgICAgICAgICAgYmxvY2s6IGJsb2NrLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGAke2l9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxhc3RIdHRwQ2FsbCkge1xyXG5cclxuICAgICAgICAgICAgaHR0cENhbGwubmV4dEh0dHBDYWxsID0gbGFzdEh0dHBDYWxsO1xyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SW5kZXggPSBsYXN0SHR0cENhbGwuaW5kZXg7XHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRCbG9jayA9IGxhc3RIdHRwQ2FsbC5ibG9jaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxhc3RIdHRwQ2FsbCA9IGh0dHBDYWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChodHRwQ2FsbCkge1xyXG5cclxuICAgICAgICBodHRwQ2FsbC5kZWxlZ2F0ZShcclxuICAgICAgICAgICAgaHR0cENhbGwuZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLmJsb2NrLFxyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SHR0cENhbGwsXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLmluZGV4XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgcHJvY2Vzc0Jsb2NrID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIGJsb2NrOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrLFxyXG4gICAgbmV4dERlbGVnYXRlOiBhbnkpOiB2b2lkID0+IHtcclxuXHJcbiAgICBsZXQgcGFyYWxsZWxQcm9wczogQXJyYXk8SUh0dHBBdXRoZW50aWNhdGVkUHJvcHM+ID0gYmxvY2sgYXMgQXJyYXk8SUh0dHBBdXRoZW50aWNhdGVkUHJvcHM+O1xyXG4gICAgY29uc3QgZGVsZWdhdGVzOiBhbnlbXSA9IFtdO1xyXG4gICAgbGV0IHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcztcclxuXHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhcmFsbGVsUHJvcHMubGVuZ3RoOyBqKyspIHtcclxuXHJcbiAgICAgICAgcHJvcHMgPSBwYXJhbGxlbFByb3BzW2pdO1xyXG5cclxuICAgICAgICBkZWxlZ2F0ZXMucHVzaChcclxuICAgICAgICAgICAgcHJvY2Vzc1Byb3BzKFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZSxcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIFByb21pc2VcclxuICAgICAgICAgICAgLmFsbChkZWxlZ2F0ZXMpXHJcbiAgICAgICAgICAgIC50aGVuKClcclxuICAgICAgICAgICAgLmNhdGNoKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzUHJvcHMgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzLFxyXG4gICAgbmV4dERlbGVnYXRlOiBhbnkpOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXByb3BzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dHB1dDogSUh0dHBPdXRwdXQgPSB7XHJcbiAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgIHVybDogcHJvcHMudXJsLFxyXG4gICAgICAgIGF1dGhlbnRpY2F0aW9uRmFpbDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBcInRleHRcIixcclxuICAgIH07XHJcblxyXG4gICAgaHR0cChcclxuICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBvdXRwdXQsXHJcbiAgICAgICAgbmV4dERlbGVnYXRlXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgaHR0cEVmZmVjdCA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFwcm9wcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdXRwdXQ6IElIdHRwT3V0cHV0ID0ge1xyXG4gICAgICAgIG9rOiBmYWxzZSxcclxuICAgICAgICB1cmw6IHByb3BzLnVybCxcclxuICAgICAgICBhdXRoZW50aWNhdGlvbkZhaWw6IGZhbHNlLFxyXG4gICAgICAgIHBhcnNlVHlwZTogcHJvcHMucGFyc2VUeXBlID8/ICdqc29uJyxcclxuICAgIH07XHJcblxyXG4gICAgaHR0cChcclxuICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBvdXRwdXRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBodHRwID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyxcclxuICAgIG91dHB1dDogSUh0dHBPdXRwdXQsXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSA9IG51bGwpOiB2b2lkID0+IHtcclxuXHJcbiAgICBmZXRjaChcclxuICAgICAgICBwcm9wcy51cmwsXHJcbiAgICAgICAgcHJvcHMub3B0aW9ucylcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIG91dHB1dC5vayA9IHJlc3BvbnNlLm9rID09PSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgICAgICAgIG91dHB1dC50eXBlID0gcmVzcG9uc2UudHlwZTtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5yZWRpcmVjdGVkID0gcmVzcG9uc2UucmVkaXJlY3RlZDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuY2FsbElEID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDYWxsSURcIikgYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5jb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiY29udGVudC10eXBlXCIpIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dC5jb250ZW50VHlwZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBvdXRwdXQuY29udGVudFR5cGUuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucGFyc2VUeXBlID0gXCJqc29uXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuYXV0aGVudGljYXRpb25GYWlsID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uQXV0aGVudGljYXRpb25GYWlsQWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQucmVzcG9uc2VOdWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LmVycm9yICs9IGBFcnJvciB0aHJvd24gd2l0aCByZXNwb25zZS50ZXh0KClcclxuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG5cclxuICAgICAgICAgICAgb3V0cHV0LnRleHREYXRhID0gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgJiYgb3V0cHV0LnBhcnNlVHlwZSA9PT0gJ2pzb24nXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0Lmpzb25EYXRhID0gSlNPTi5wYXJzZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5lcnJvciArPSBgRXJyb3IgdGhyb3duIHBhcnNpbmcgcmVzcG9uc2UudGV4dCgpIGFzIGpzb25cclxuYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFvdXRwdXQub2spIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRpc3BhdGNoKFxyXG4gICAgICAgICAgICAgICAgcHJvcHMuYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobmV4dERlbGVnYXRlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHREZWxlZ2F0ZS5kZWxlZ2F0ZShcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLmJsb2NrLFxyXG4gICAgICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZS5uZXh0SHR0cENhbGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLmluZGV4XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQuZXJyb3IgKz0gZXJyb3I7XHJcblxyXG4gICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgIHByb3BzLmVycm9yLFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSlcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnSHR0cCA9IChwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMpOiBJSHR0cEZldGNoSXRlbSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBodHRwRWZmZWN0LFxyXG4gICAgICAgIHByb3BzXHJcbiAgICBdXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnU2VxdWVudGlhbEh0dHAgPSAocHJvcHNCbG9jazogQXJyYXk8SUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jaz4pOiBJSHR0cFNlcXVlbnRpYWxGZXRjaEl0ZW0gPT4ge1xyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgc2VxdWVudGlhbEh0dHBFZmZlY3QsXHJcbiAgICAgICAgcHJvcHNCbG9ja1xyXG4gICAgXVxyXG59XHJcbiIsIlxyXG5jb25zdCBLZXlzID0ge1xyXG5cclxuICAgIHN0YXJ0VXJsOiAnc3RhcnRVcmwnLFxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBLZXlzO1xyXG5cclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEh0dHBFZmZlY3QgaW1wbGVtZW50cyBJSHR0cEVmZmVjdCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIHBhcnNlVHlwZTogUGFyc2VUeXBlLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkpIHtcclxuXHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLnVybCA9IHVybDtcclxuICAgICAgICB0aGlzLnBhcnNlVHlwZSA9IHBhcnNlVHlwZTtcclxuICAgICAgICB0aGlzLmFjdGlvbkRlbGVnYXRlID0gYWN0aW9uRGVsZWdhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxuICAgIHB1YmxpYyBwYXJzZVR5cGU6IFBhcnNlVHlwZTtcclxuICAgIHB1YmxpYyBhY3Rpb25EZWxlZ2F0ZTogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5O1xyXG59XHJcbiIsIlxyXG5cclxuY29uc3QgZ1V0aWxpdGllcyA9IHtcclxuXHJcbiAgICByb3VuZFVwVG9OZWFyZXN0VGVuOiAodmFsdWU6IG51bWJlcikgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBmbG9vciA9IE1hdGguZmxvb3IodmFsdWUgLyAxMCk7XHJcblxyXG4gICAgICAgIHJldHVybiAoZmxvb3IgKyAxKSAqIDEwO1xyXG4gICAgfSxcclxuXHJcbiAgICByb3VuZERvd25Ub05lYXJlc3RUZW46ICh2YWx1ZTogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZsb29yID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZsb29yICogMTA7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbnZlcnRNbVRvRmVldEluY2hlczogKG1tOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBpbmNoZXMgPSBtbSAqIDAuMDM5Mzc7XHJcblxyXG4gICAgICAgIHJldHVybiBnVXRpbGl0aWVzLmNvbnZlcnRJbmNoZXNUb0ZlZXRJbmNoZXMoaW5jaGVzKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5kZXhPZkFueTogKFxyXG4gICAgICAgIGlucHV0OiBzdHJpbmcsXHJcbiAgICAgICAgY2hhcnM6IHN0cmluZ1tdLFxyXG4gICAgICAgIHN0YXJ0SW5kZXggPSAwXHJcbiAgICApOiBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhcnMuaW5jbHVkZXMoaW5wdXRbaV0pID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RGlyZWN0b3J5OiAoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHZhciBtYXRjaGVzID0gZmlsZVBhdGgubWF0Y2goLyguKilbXFwvXFxcXF0vKTtcclxuXHJcbiAgICAgICAgaWYgKG1hdGNoZXNcclxuICAgICAgICAgICAgJiYgbWF0Y2hlcy5sZW5ndGggPiAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzWzFdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfSxcclxuXHJcbiAgICBjb3VudENoYXJhY3RlcjogKFxyXG4gICAgICAgIGlucHV0OiBzdHJpbmcsXHJcbiAgICAgICAgY2hhcmFjdGVyOiBzdHJpbmcpID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5wdXRbaV0gPT09IGNoYXJhY3Rlcikge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBjb252ZXJ0SW5jaGVzVG9GZWV0SW5jaGVzOiAoaW5jaGVzOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBmZWV0ID0gTWF0aC5mbG9vcihpbmNoZXMgLyAxMik7XHJcbiAgICAgICAgY29uc3QgaW5jaGVzUmVhbWluaW5nID0gaW5jaGVzICUgMTI7XHJcbiAgICAgICAgY29uc3QgaW5jaGVzUmVhbWluaW5nUm91bmRlZCA9IE1hdGgucm91bmQoaW5jaGVzUmVhbWluaW5nICogMTApIC8gMTA7IC8vIDEgZGVjaW1hbCBwbGFjZXNcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKGZlZXQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBgJHtmZWV0fScgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbmNoZXNSZWFtaW5pbmdSb3VuZGVkID4gMCkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gYCR7cmVzdWx0fSR7aW5jaGVzUmVhbWluaW5nUm91bmRlZH1cImA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSxcclxuXHJcbiAgICBpc051bGxPcldoaXRlU3BhY2U6IChpbnB1dDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoaW5wdXQgPT09IG51bGxcclxuICAgICAgICAgICAgfHwgaW5wdXQgPT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbnB1dCA9IGAke2lucHV0fWA7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnB1dC5tYXRjaCgvXlxccyokLykgIT09IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrQXJyYXlzRXF1YWw6IChhOiBzdHJpbmdbXSwgYjogc3RyaW5nW10pOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGEgPT09IGIpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGEgPT09IG51bGxcclxuICAgICAgICAgICAgfHwgYiA9PT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgeW91IGRvbid0IGNhcmUgYWJvdXQgdGhlIG9yZGVyIG9mIHRoZSBlbGVtZW50cyBpbnNpZGVcclxuICAgICAgICAvLyB0aGUgYXJyYXksIHlvdSBzaG91bGQgc29ydCBib3RoIGFycmF5cyBoZXJlLlxyXG4gICAgICAgIC8vIFBsZWFzZSBub3RlIHRoYXQgY2FsbGluZyBzb3J0IG9uIGFuIGFycmF5IHdpbGwgbW9kaWZ5IHRoYXQgYXJyYXkuXHJcbiAgICAgICAgLy8geW91IG1pZ2h0IHdhbnQgdG8gY2xvbmUgeW91ciBhcnJheSBmaXJzdC5cclxuXHJcbiAgICAgICAgY29uc3QgeDogc3RyaW5nW10gPSBbLi4uYV07XHJcbiAgICAgICAgY29uc3QgeTogc3RyaW5nW10gPSBbLi4uYl07XHJcblxyXG4gICAgICAgIHguc29ydCgpO1xyXG4gICAgICAgIHkuc29ydCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4W2ldICE9PSB5W2ldKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgc2h1ZmZsZShhcnJheTogQXJyYXk8YW55Pik6IEFycmF5PGFueT4ge1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgIGxldCB0ZW1wb3JhcnlWYWx1ZTogYW55XHJcbiAgICAgICAgbGV0IHJhbmRvbUluZGV4OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICAgICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgY3VycmVudEluZGV4IC09IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgICAgIHRlbXBvcmFyeVZhbHVlID0gYXJyYXlbY3VycmVudEluZGV4XTtcclxuICAgICAgICAgICAgYXJyYXlbY3VycmVudEluZGV4XSA9IGFycmF5W3JhbmRvbUluZGV4XTtcclxuICAgICAgICAgICAgYXJyYXlbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTnVtZXJpYzogKGlucHV0OiBhbnkpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICFpc05hTihpbnB1dCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTmVnYXRpdmVOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdW1lcmljKGlucHV0KSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICtpbnB1dCA8IDA7IC8vICsgY29udmVydHMgYSBzdHJpbmcgdG8gYSBudW1iZXIgaWYgaXQgY29uc2lzdHMgb25seSBvZiBkaWdpdHMuXHJcbiAgICB9LFxyXG5cclxuICAgIGhhc0R1cGxpY2F0ZXM6IDxUPihpbnB1dDogQXJyYXk8VD4pOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKG5ldyBTZXQoaW5wdXQpLnNpemUgIT09IGlucHV0Lmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGV4dGVuZDogPFQ+KGFycmF5MTogQXJyYXk8VD4sIGFycmF5MjogQXJyYXk8VD4pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgYXJyYXkyLmZvckVhY2goKGl0ZW06IFQpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGFycmF5MS5wdXNoKGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcmV0dHlQcmludEpzb25Gcm9tU3RyaW5nOiAoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWlucHV0KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnVXRpbGl0aWVzLnByZXR0eVByaW50SnNvbkZyb21PYmplY3QoSlNPTi5wYXJzZShpbnB1dCkpO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcmV0dHlQcmludEpzb25Gcm9tT2JqZWN0OiAoaW5wdXQ6IG9iamVjdCB8IG51bGwpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWlucHV0KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgIDQgLy8gaW5kZW50ZWQgNCBzcGFjZXNcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBpc1Bvc2l0aXZlTnVtZXJpYzogKGlucHV0OiBhbnkpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVtZXJpYyhpbnB1dCkpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBOdW1iZXIoaW5wdXQpID49IDA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRpbWU6ICgpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBub3c6IERhdGUgPSBuZXcgRGF0ZShEYXRlLm5vdygpKTtcclxuICAgICAgICBjb25zdCB0aW1lOiBzdHJpbmcgPSBgJHtub3cuZ2V0RnVsbFllYXIoKX0tJHsobm93LmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9LSR7bm93LmdldERhdGUoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9ICR7bm93LmdldEhvdXJzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfToke25vdy5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfToke25vdy5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfTo6JHtub3cuZ2V0TWlsbGlzZWNvbmRzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgzLCAnMCcpfTpgO1xyXG5cclxuICAgICAgICByZXR1cm4gdGltZTtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRCeU5ld0xpbmU6IChpbnB1dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBpbnB1dC5zcGxpdCgvW1xcclxcbl0rLyk7XHJcbiAgICAgICAgY29uc3QgY2xlYW5lZDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG5cclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UodmFsdWUpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xlYW5lZC5wdXNoKHZhbHVlLnRyaW0oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNsZWFuZWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHNwbGl0QnlQaXBlOiAoaW5wdXQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoaW5wdXQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXN1bHRzID0gaW5wdXQuc3BsaXQoJ3wnKTtcclxuICAgICAgICBjb25zdCBjbGVhbmVkOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZSh2YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGVhbmVkLnB1c2godmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gY2xlYW5lZDtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRCeU5ld0xpbmVBbmRPcmRlcjogKGlucHV0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXNcclxuICAgICAgICAgICAgLnNwbGl0QnlOZXdMaW5lKGlucHV0KVxyXG4gICAgICAgICAgICAuc29ydCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBqb2luQnlOZXdMaW5lOiAoaW5wdXQ6IEFycmF5PHN0cmluZz4pOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWlucHV0XHJcbiAgICAgICAgICAgIHx8IGlucHV0Lmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0LmpvaW4oJ1xcbicpO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVBbGxDaGlsZHJlbjogKHBhcmVudDogRWxlbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAocGFyZW50LmZpcnN0Q2hpbGQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBpc09kZDogKHg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4geCAlIDIgPT09IDE7XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3J0UHJpbnRUZXh0OiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBtYXhMZW5ndGg6IG51bWJlciA9IDEwMCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZpcnN0TmV3TGluZUluZGV4OiBudW1iZXIgPSBnVXRpbGl0aWVzLmdldEZpcnN0TmV3TGluZUluZGV4KGlucHV0KTtcclxuXHJcbiAgICAgICAgaWYgKGZpcnN0TmV3TGluZUluZGV4ID4gMFxyXG4gICAgICAgICAgICAmJiBmaXJzdE5ld0xpbmVJbmRleCA8PSBtYXhMZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IGlucHV0LnN1YnN0cigwLCBmaXJzdE5ld0xpbmVJbmRleCAtIDEpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMudHJpbUFuZEFkZEVsbGlwc2lzKG91dHB1dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IG1heExlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGlucHV0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gaW5wdXQuc3Vic3RyKDAsIG1heExlbmd0aCk7XHJcblxyXG4gICAgICAgIHJldHVybiBnVXRpbGl0aWVzLnRyaW1BbmRBZGRFbGxpcHNpcyhvdXRwdXQpO1xyXG4gICAgfSxcclxuXHJcbiAgICB0cmltQW5kQWRkRWxsaXBzaXM6IChpbnB1dDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgbGV0IG91dHB1dDogc3RyaW5nID0gaW5wdXQudHJpbSgpO1xyXG4gICAgICAgIGxldCBwdW5jdHVhdGlvblJlZ2V4OiBSZWdFeHAgPSAvWy4sXFwvIyEkJVxcXiZcXCo7Ont9PVxcLV9gfigpXS9nO1xyXG4gICAgICAgIGxldCBzcGFjZVJlZ2V4OiBSZWdFeHAgPSAvXFxXKy9nO1xyXG4gICAgICAgIGxldCBsYXN0Q2hhcmFjdGVyOiBzdHJpbmcgPSBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBsZXQgbGFzdENoYXJhY3RlcklzUHVuY3R1YXRpb246IGJvb2xlYW4gPVxyXG4gICAgICAgICAgICBwdW5jdHVhdGlvblJlZ2V4LnRlc3QobGFzdENoYXJhY3RlcilcclxuICAgICAgICAgICAgfHwgc3BhY2VSZWdleC50ZXN0KGxhc3RDaGFyYWN0ZXIpO1xyXG5cclxuXHJcbiAgICAgICAgd2hpbGUgKGxhc3RDaGFyYWN0ZXJJc1B1bmN0dWF0aW9uID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQuc3Vic3RyKDAsIG91dHB1dC5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgbGFzdENoYXJhY3RlciA9IG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgICAgICBsYXN0Q2hhcmFjdGVySXNQdW5jdHVhdGlvbiA9XHJcbiAgICAgICAgICAgICAgICBwdW5jdHVhdGlvblJlZ2V4LnRlc3QobGFzdENoYXJhY3RlcilcclxuICAgICAgICAgICAgICAgIHx8IHNwYWNlUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgJHtvdXRwdXR9Li4uYDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Rmlyc3ROZXdMaW5lSW5kZXg6IChpbnB1dDogc3RyaW5nKTogbnVtYmVyID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJhY3Rlcjogc3RyaW5nO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBpbnB1dFtpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFyYWN0ZXIgPT09ICdcXG4nXHJcbiAgICAgICAgICAgICAgICB8fCBjaGFyYWN0ZXIgPT09ICdcXHInKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBwZXJDYXNlRmlyc3RMZXR0ZXI6IChpbnB1dDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgaW5wdXQuc2xpY2UoMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdlbmVyYXRlR3VpZDogKHVzZUh5cGVuczogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAgICAgbGV0IGQyID0gKHBlcmZvcm1hbmNlXHJcbiAgICAgICAgICAgICYmIHBlcmZvcm1hbmNlLm5vd1xyXG4gICAgICAgICAgICAmJiAocGVyZm9ybWFuY2Uubm93KCkgKiAxMDAwKSkgfHwgMDtcclxuXHJcbiAgICAgICAgbGV0IHBhdHRlcm4gPSAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4JztcclxuXHJcbiAgICAgICAgaWYgKCF1c2VIeXBlbnMpIHtcclxuICAgICAgICAgICAgcGF0dGVybiA9ICd4eHh4eHh4eHh4eHg0eHh4eXh4eHh4eHh4eHh4eHh4eCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBndWlkID0gcGF0dGVyblxyXG4gICAgICAgICAgICAucmVwbGFjZShcclxuICAgICAgICAgICAgICAgIC9beHldL2csXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgciA9IE1hdGgucmFuZG9tKCkgKiAxNjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByID0gKGQgKyByKSAlIDE2IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZCA9IE1hdGguZmxvb3IoZCAvIDE2KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByID0gKGQyICsgcikgJSAxNiB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQyID0gTWF0aC5mbG9vcihkMiAvIDE2KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYyA9PT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ3VpZDtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tJZkNocm9tZTogKCk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICAvLyBwbGVhc2Ugbm90ZSwgXHJcbiAgICAgICAgLy8gdGhhdCBJRTExIG5vdyByZXR1cm5zIHVuZGVmaW5lZCBhZ2FpbiBmb3Igd2luZG93LmNocm9tZVxyXG4gICAgICAgIC8vIGFuZCBuZXcgT3BlcmEgMzAgb3V0cHV0cyB0cnVlIGZvciB3aW5kb3cuY2hyb21lXHJcbiAgICAgICAgLy8gYnV0IG5lZWRzIHRvIGNoZWNrIGlmIHdpbmRvdy5vcHIgaXMgbm90IHVuZGVmaW5lZFxyXG4gICAgICAgIC8vIGFuZCBuZXcgSUUgRWRnZSBvdXRwdXRzIHRvIHRydWUgbm93IGZvciB3aW5kb3cuY2hyb21lXHJcbiAgICAgICAgLy8gYW5kIGlmIG5vdCBpT1MgQ2hyb21lIGNoZWNrXHJcbiAgICAgICAgLy8gc28gdXNlIHRoZSBiZWxvdyB1cGRhdGVkIGNvbmRpdGlvblxyXG5cclxuICAgICAgICBsZXQgdHNXaW5kb3c6IGFueSA9IHdpbmRvdyBhcyBhbnk7XHJcbiAgICAgICAgbGV0IGlzQ2hyb21pdW0gPSB0c1dpbmRvdy5jaHJvbWU7XHJcbiAgICAgICAgbGV0IHdpbk5hdiA9IHdpbmRvdy5uYXZpZ2F0b3I7XHJcbiAgICAgICAgbGV0IHZlbmRvck5hbWUgPSB3aW5OYXYudmVuZG9yO1xyXG4gICAgICAgIGxldCBpc09wZXJhID0gdHlwZW9mIHRzV2luZG93Lm9wciAhPT0gXCJ1bmRlZmluZWRcIjtcclxuICAgICAgICBsZXQgaXNJRWVkZ2UgPSB3aW5OYXYudXNlckFnZW50LmluZGV4T2YoXCJFZGdlXCIpID4gLTE7XHJcbiAgICAgICAgbGV0IGlzSU9TQ2hyb21lID0gd2luTmF2LnVzZXJBZ2VudC5tYXRjaChcIkNyaU9TXCIpO1xyXG5cclxuICAgICAgICBpZiAoaXNJT1NDaHJvbWUpIHtcclxuICAgICAgICAgICAgLy8gaXMgR29vZ2xlIENocm9tZSBvbiBJT1NcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzQ2hyb21pdW0gIT09IG51bGxcclxuICAgICAgICAgICAgJiYgdHlwZW9mIGlzQ2hyb21pdW0gIT09IFwidW5kZWZpbmVkXCJcclxuICAgICAgICAgICAgJiYgdmVuZG9yTmFtZSA9PT0gXCJHb29nbGUgSW5jLlwiXHJcbiAgICAgICAgICAgICYmIGlzT3BlcmEgPT09IGZhbHNlXHJcbiAgICAgICAgICAgICYmIGlzSUVlZGdlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAvLyBpcyBHb29nbGUgQ2hyb21lXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1V0aWxpdGllczsiLCJpbXBvcnQgSUhpc3RvcnlVcmwgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVVybFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpc3RvcnlVcmwgaW1wbGVtZW50cyBJSGlzdG9yeVVybCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IodXJsOiBzdHJpbmcpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVybCA9IHVybDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXJsOiBzdHJpbmc7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJTbmFwU2hvdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lSZW5kZXJTbmFwU2hvdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlclNuYXBTaG90IGltcGxlbWVudHMgSVJlbmRlclNuYXBTaG90IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZykge1xyXG5cclxuICAgICAgICB0aGlzLnVybCA9IHVybDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXJsOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgZ3VpZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgY3JlYXRlZDogRGF0ZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIG1vZGlmaWVkOiBEYXRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgZXhwYW5kZWRPcHRpb25JRHM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIHB1YmxpYyBleHBhbmRlZEFuY2lsbGFyeUlEczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG59XHJcbiIsImltcG9ydCBJVXJsQXNzZW1ibGVyIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSVVybEFzc2VtYmxlclwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IEhpc3RvcnlVcmwgZnJvbSBcIi4uLy4uL3N0YXRlL2hpc3RvcnkvSGlzdG9yeVVybFwiO1xyXG5pbXBvcnQgUmVuZGVyU25hcFNob3QgZnJvbSBcIi4uLy4uL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3RcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5jb25zdCBidWlsZFVybEZyb21Sb290ID0gKHJvb3Q6IElSZW5kZXJGcmFnbWVudCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgY29uc3QgdXJsQXNzZW1ibGVyOiBJVXJsQXNzZW1ibGVyID0ge1xyXG5cclxuICAgICAgICB1cmw6IGAke2xvY2F0aW9uLm9yaWdpbn0ke2xvY2F0aW9uLnBhdGhuYW1lfT9gXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyb290LnNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaW50U2VnbWVudEVuZChcclxuICAgICAgICB1cmxBc3NlbWJsZXIsXHJcbiAgICAgICAgcm9vdFxyXG4gICAgKVxyXG5cclxuICAgIHJldHVybiB1cmxBc3NlbWJsZXIudXJsO1xyXG59O1xyXG5cclxuY29uc3QgcHJpbnRTZWdtZW50RW5kID0gKFxyXG4gICAgdXJsQXNzZW1ibGVyOiBJVXJsQXNzZW1ibGVyLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICBsZXQgdXJsID0gdXJsQXNzZW1ibGVyLnVybDtcclxuICAgICAgICB1cmwgPSBgJHt1cmx9fiR7ZnJhZ21lbnQuaWR9YDtcclxuICAgICAgICB1cmxBc3NlbWJsZXIudXJsID0gdXJsO1xyXG5cclxuICAgICAgICBwcmludFNlZ21lbnRFbmQoXHJcbiAgICAgICAgICAgIHVybEFzc2VtYmxlcixcclxuICAgICAgICAgICAgZnJhZ21lbnQubGluay5yb290LFxyXG4gICAgICAgIClcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KSkge1xyXG5cclxuICAgICAgICBsZXQgdXJsID0gdXJsQXNzZW1ibGVyLnVybDtcclxuICAgICAgICB1cmwgPSBgJHt1cmx9XyR7ZnJhZ21lbnQuaWR9YDtcclxuICAgICAgICB1cmxBc3NlbWJsZXIudXJsID0gdXJsO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIWZyYWdtZW50LmxpbmtcclxuICAgICAgICAmJiAhZnJhZ21lbnQuc2VsZWN0ZWRcclxuICAgICkge1xyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH0tJHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpbnRTZWdtZW50RW5kKFxyXG4gICAgICAgIHVybEFzc2VtYmxlcixcclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgIClcclxufTtcclxuXHJcblxyXG5jb25zdCBnSGlzdG9yeUNvZGUgPSB7XHJcblxyXG4gICAgcmVzZXRSYXc6ICgpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uYXV0b2ZvY3VzID0gdHJ1ZTtcclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5pc0F1dG9mb2N1c0ZpcnN0UnVuID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgcHVzaEJyb3dzZXJIaXN0b3J5U3RhdGU6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuY3VycmVudFNlY3Rpb24/LmN1cnJlbnRcclxuICAgICAgICAgICAgfHwgIXN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnSGlzdG9yeUNvZGUucmVzZXRSYXcoKTtcclxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcclxuICAgICAgICBsZXQgbGFzdFVybDogc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAod2luZG93Lmhpc3Rvcnkuc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3RVcmwgPSB3aW5kb3cuaGlzdG9yeS5zdGF0ZS51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsYXN0VXJsID0gYCR7bG9jYXRpb24ub3JpZ2lufSR7bG9jYXRpb24ucGF0aG5hbWV9JHtsb2NhdGlvbi5zZWFyY2h9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IGJ1aWxkVXJsRnJvbVJvb3Qoc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlLnJvb3QpO1xyXG5cclxuICAgICAgICBpZiAobGFzdFVybFxyXG4gICAgICAgICAgICAmJiB1cmwgPT09IGxhc3RVcmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICAgICAgICAgIG5ldyBSZW5kZXJTbmFwU2hvdCh1cmwpLFxyXG4gICAgICAgICAgICBcIlwiLFxyXG4gICAgICAgICAgICB1cmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5zdGVwSGlzdG9yeS5oaXN0b3J5Q2hhaW4ucHVzaChuZXcgSGlzdG9yeVVybCh1cmwpKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdIaXN0b3J5Q29kZTtcclxuXHJcbiIsImltcG9ydCB7IFBhcnNlVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZVwiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSUh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3RcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdIaXN0b3J5Q29kZSBmcm9tIFwiLi9nSGlzdG9yeUNvZGVcIjtcclxuXHJcbmxldCBjb3VudCA9IDA7XHJcblxyXG5jb25zdCBnU3RhdGVDb2RlID0ge1xyXG5cclxuICAgIHNldERpcnR5OiAoc3RhdGU6IElTdGF0ZSk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5yYXcgPSBmYWxzZTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmVzaEtleUludDogKHN0YXRlOiBJU3RhdGUpOiBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBuZXh0S2V5ID0gKytzdGF0ZS5uZXh0S2V5O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV4dEtleTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RnJlc2hLZXk6IChzdGF0ZTogSVN0YXRlKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGAke2dTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpfWA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEd1aWRLZXk6ICgpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gVS5nZW5lcmF0ZUd1aWQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmVTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgZ0hpc3RvcnlDb2RlLnB1c2hCcm93c2VySGlzdG9yeVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXdTdGF0ZTogSVN0YXRlID0geyAuLi5zdGF0ZSB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3U3RhdGU7XHJcbiAgICB9LFxyXG5cclxuICAgIEFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgICBwYXJzZVR5cGU6IFBhcnNlVHlwZSxcclxuICAgICAgICB1cmw6IHN0cmluZyxcclxuICAgICAgICBhY3Rpb25EZWxlZ2F0ZTogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codXJsKTtcclxuXHJcbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodXJsLmVuZHNXaXRoKCdpbXlvNkMwOEguaHRtbCcpKSB7XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBlZmZlY3Q6IElIdHRwRWZmZWN0IHwgdW5kZWZpbmVkID0gc3RhdGVcclxuICAgICAgICAgICAgLnJlcGVhdEVmZmVjdHNcclxuICAgICAgICAgICAgLnJlTG9hZEdldEh0dHBJbW1lZGlhdGVcclxuICAgICAgICAgICAgLmZpbmQoKGVmZmVjdDogSUh0dHBFZmZlY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWZmZWN0Lm5hbWUgPT09IG5hbWVcclxuICAgICAgICAgICAgICAgICAgICAmJiBlZmZlY3QudXJsID09PSB1cmw7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoZWZmZWN0KSB7IC8vIGFscmVhZHkgYWRkZWQuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGh0dHBFZmZlY3Q6IElIdHRwRWZmZWN0ID0gbmV3IEh0dHBFZmZlY3QoXHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgcGFyc2VUeXBlLFxyXG4gICAgICAgICAgICBhY3Rpb25EZWxlZ2F0ZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5wdXNoKGh0dHBFZmZlY3QpO1xyXG4gICAgfSxcclxuXHJcbiAgICBBZGRSdW5BY3Rpb25JbW1lZGlhdGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiBJQWN0aW9uKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlLnB1c2goYWN0aW9uRGVsZWdhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZWRfb3V0bGluZU5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIGZyYWdtZW50SUQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWRcclxuICAgICk6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRJRCkpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gZ1N0YXRlQ29kZS5nZXRDYWNoZUtleShcclxuICAgICAgICAgICAgbGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudElEIGFzIHN0cmluZ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZU5vZGVzX2lkW2tleV0gPz8gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPdXRsaW5lTm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2FjaGVfb3V0bGluZU5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlLmlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZU5vZGVzX2lkW2tleV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZU5vZGVzX2lkW2tleV0gPSBvdXRsaW5lTm9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIGZyYWdtZW50SUQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWRcclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gZ1N0YXRlQ29kZS5nZXRDYWNoZUtleShcclxuICAgICAgICAgICAgbGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudElEIGFzIHN0cmluZ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19pZFtrZXldID8/IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGNhY2hlX2NoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlbmRlckZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFyZW5kZXJGcmFnbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5RnJvbUZyYWdtZW50KHJlbmRlckZyYWdtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGtleSkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkW2tleSBhcyBzdHJpbmddKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkW2tleSBhcyBzdHJpbmddID0gcmVuZGVyRnJhZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldENhY2hlS2V5RnJvbUZyYWdtZW50OiAocmVuZGVyRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5nZXRDYWNoZUtleShcclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LmlkXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2FjaGVLZXk6IChcclxuXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nXHJcbiAgICApOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7bGlua0lEfV8ke2ZyYWdtZW50SUR9YDtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnU3RhdGVDb2RlO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuXHJcblxyXG5jb25zdCBnQXV0aGVudGljYXRpb25Db2RlID0ge1xyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb246IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnVzZXIuYXV0aG9yaXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubmFtZSA9IFwiXCI7XHJcbiAgICAgICAgc3RhdGUudXNlci5zdWIgPSBcIlwiO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubG9nb3V0VXJsID0gXCJcIjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdBdXRoZW50aWNhdGlvbkNvZGU7XHJcbiIsIlxyXG5leHBvcnQgZW51bSBBY3Rpb25UeXBlIHtcclxuXHJcbiAgICBOb25lID0gJ25vbmUnLFxyXG4gICAgRmlsdGVyVG9waWNzID0gJ2ZpbHRlclRvcGljcycsXHJcbiAgICBHZXRUb3BpYyA9ICdnZXRUb3BpYycsXHJcbiAgICBHZXRUb3BpY0FuZFJvb3QgPSAnZ2V0VG9waWNBbmRSb290JyxcclxuICAgIFNhdmVBcnRpY2xlU2NlbmUgPSAnc2F2ZUFydGljbGVTY2VuZScsXHJcbiAgICBHZXRSb290ID0gJ2dldFJvb3QnLFxyXG4gICAgR2V0U3RlcCA9ICdnZXRTdGVwJyxcclxuICAgIEdldFBhZ2UgPSAnZ2V0UGFnZScsXHJcbiAgICBHZXRDaGFpbiA9ICdnZXRDaGFpbicsXHJcbiAgICBHZXRPdXRsaW5lID0gJ2dldE91dGxpbmUnLFxyXG4gICAgR2V0RnJhZ21lbnQgPSAnZ2V0RnJhZ21lbnQnLFxyXG4gICAgR2V0Q2hhaW5GcmFnbWVudCA9ICdnZXRDaGFpbkZyYWdtZW50J1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdBamF4SGVhZGVyQ29kZSA9IHtcclxuXHJcbiAgICBidWlsZEhlYWRlcnM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNhbGxJRDogc3RyaW5nLFxyXG4gICAgICAgIGFjdGlvbjogQWN0aW9uVHlwZSk6IEhlYWRlcnMgPT4ge1xyXG5cclxuICAgICAgICBsZXQgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ1gtQ1NSRicsICcxJyk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ1N1YnNjcmlwdGlvbklEJywgc3RhdGUuc2V0dGluZ3Muc3Vic2NyaXB0aW9uSUQpO1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCdDYWxsSUQnLCBjYWxsSUQpO1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCdBY3Rpb24nLCBhY3Rpb24pO1xyXG5cclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnd2l0aENyZWRlbnRpYWxzJywgJ3RydWUnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGhlYWRlcnM7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQWpheEhlYWRlckNvZGU7XHJcblxyXG4iLCJpbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcblxyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucyBmcm9tIFwiLi9nQXV0aGVudGljYXRpb25BY3Rpb25zXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCB7IElIdHRwRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEZldGNoSXRlbVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cyA9IHtcclxuXHJcbiAgICBjaGVja1VzZXJBdXRoZW50aWNhdGVkOiAoc3RhdGU6IElTdGF0ZSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGNhbGxJRCxcclxuICAgICAgICAgICAgQWN0aW9uVHlwZS5Ob25lXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtzdGF0ZS5zZXR0aW5ncy5iZmZVcmx9LyR7c3RhdGUuc2V0dGluZ3MudXNlclBhdGh9P3NsaWRlPWZhbHNlYDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdBdXRoZW50aWNhdGVkSHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3BvbnNlOiAnanNvbicsXHJcbiAgICAgICAgICAgIGFjdGlvbjogZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5sb2FkU3VjY2Vzc2Z1bEF1dGhlbnRpY2F0aW9uLFxyXG4gICAgICAgICAgICBlcnJvcjogKHN0YXRlOiBJU3RhdGUsIGVycm9yRGV0YWlsczogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciB0cnlpbmcgdG8gYXV0aGVudGljYXRlIHdpdGggdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnQXV0aGVudGljYXRpb25FZmZlY3RzLmNoZWNrVXNlckF1dGhlbnRpY2F0ZWQubmFtZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgdHJ5aW5nIHRvIGF1dGhlbnRpY2F0ZSB3aXRoIHRoZSBzZXJ2ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6IGdBdXRoZW50aWNhdGlvbkVmZmVjdHMuY2hlY2tVc2VyQXV0aGVudGljYXRlZC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGF0ZVwiOiAke0pTT04uc3RyaW5naWZ5KHN0YXRlKX1cclxuICAgICAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cztcclxuIiwiaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBLZXlzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25Db2RlIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkNvZGVcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkVmZmVjdHMgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uRWZmZWN0c1wiO1xyXG5cclxuXHJcbmNvbnN0IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMgPSB7XHJcblxyXG4gICAgbG9hZFN1Y2Nlc3NmdWxBdXRoZW50aWNhdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhcmVzcG9uc2VcclxuICAgICAgICAgICAgfHwgcmVzcG9uc2UucGFyc2VUeXBlICE9PSBcImpzb25cIlxyXG4gICAgICAgICAgICB8fCAhcmVzcG9uc2UuanNvbkRhdGEpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYWltczogYW55ID0gcmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IG5hbWU6IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ25hbWUnXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3ViOiBhbnkgPSBjbGFpbXMuZmluZChcclxuICAgICAgICAgICAgKGNsYWltOiBhbnkpID0+IGNsYWltLnR5cGUgPT09ICdzdWInXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFuYW1lXHJcbiAgICAgICAgICAgICYmICFzdWIpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvZ291dFVybENsYWltOiBhbnkgPSBjbGFpbXMuZmluZChcclxuICAgICAgICAgICAgKGNsYWltOiBhbnkpID0+IGNsYWltLnR5cGUgPT09ICdiZmY6bG9nb3V0X3VybCdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWxvZ291dFVybENsYWltXHJcbiAgICAgICAgICAgIHx8ICFsb2dvdXRVcmxDbGFpbS52YWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUudXNlci5hdXRob3Jpc2VkID0gdHJ1ZTtcclxuICAgICAgICBzdGF0ZS51c2VyLm5hbWUgPSBuYW1lLnZhbHVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIuc3ViID0gc3ViLnZhbHVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubG9nb3V0VXJsID0gbG9nb3V0VXJsQ2xhaW0udmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja1VzZXJMb2dnZWRJbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BzOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2hlY2tVc2VyTG9nZ2VkSW5Qcm9wcyhzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICghcHJvcHMpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBwcm9wc1xyXG4gICAgICAgIF07XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrVXNlckxvZ2dlZEluUHJvcHM6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS51c2VyLnJhdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cy5jaGVja1VzZXJBdXRoZW50aWNhdGVkKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9naW46IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcblxyXG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXHJcbiAgICAgICAgICAgIEtleXMuc3RhcnRVcmwsXHJcbiAgICAgICAgICAgIGN1cnJlbnRVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3N0YXRlLnNldHRpbmdzLmJmZlVybH0vJHtzdGF0ZS5zZXR0aW5ncy5kZWZhdWx0TG9naW5QYXRofT9yZXR1cm5Vcmw9L2A7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmFzc2lnbih1cmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb246IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG4gICAgICAgIGdBdXRoZW50aWNhdGlvbkNvZGUuY2xlYXJBdXRoZW50aWNhdGlvbihzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhckF1dGhlbnRpY2F0aW9uQW5kU2hvd0xvZ2luOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ0F1dGhlbnRpY2F0aW9uQ29kZS5jbGVhckF1dGhlbnRpY2F0aW9uKHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdBdXRoZW50aWNhdGlvbkFjdGlvbnMubG9naW4oc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2dvdXQ6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKHN0YXRlLnVzZXIubG9nb3V0VXJsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucztcclxuIiwiaW1wb3J0IHsgZ0h0dHAgfSBmcm9tIFwiLi9nSHR0cFwiO1xyXG5cclxuaW1wb3J0IElIdHRwQXV0aGVudGljYXRlZFByb3BzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNcIjtcclxuaW1wb3J0IElIdHRwUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cFByb3BzXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25BY3Rpb25zIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkFjdGlvbnNcIjtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ0F1dGhlbnRpY2F0ZWRIdHRwKHByb3BzOiBJSHR0cFByb3BzKTogYW55IHtcclxuXHJcbiAgICBjb25zdCBodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzID0gcHJvcHMgYXMgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHM7XHJcblxyXG4gICAgLy8gLy8gVG8gcmVnaXN0ZXIgZmFpbGVkIGF1dGhlbnRpY2F0aW9uXHJcbiAgICAvLyBodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXMub25BdXRoZW50aWNhdGlvbkZhaWxBY3Rpb24gPSBnQXV0aGVudGljYXRpb25BY3Rpb25zLmNsZWFyQXV0aGVudGljYXRpb247XHJcblxyXG4gICAgLy8gVG8gcmVnaXN0ZXIgZmFpbGVkIGF1dGhlbnRpY2F0aW9uIGFuZCBzaG93IGxvZ2luIHBhZ2VcclxuICAgIGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllcy5vbkF1dGhlbnRpY2F0aW9uRmFpbEFjdGlvbiA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2xlYXJBdXRoZW50aWNhdGlvbkFuZFNob3dMb2dpbjtcclxuXHJcbiAgICByZXR1cm4gZ0h0dHAoaHR0cEF1dGhlbnRpY2F0ZWRQcm9wZXJ0aWVzKTtcclxufVxyXG4iLCJcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdBamF4SGVhZGVyQ29kZSBmcm9tIFwiLi4vaHR0cC9nQWpheEhlYWRlckNvZGVcIjtcclxuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IElBY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSUFjdGlvblwiO1xyXG5cclxuY29uc3QgcnVuQWN0aW9uSW5uZXIgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGRpc3BhdGNoKFxyXG4gICAgICAgIHByb3BzLmFjdGlvbixcclxuICAgICk7XHJcbn07XHJcblxyXG5cclxuY29uc3QgcnVuQWN0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHF1ZXVlZEVmZmVjdHM6IEFycmF5PElBY3Rpb24+XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBjb25zdCBlZmZlY3RzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHF1ZXVlZEVmZmVjdHMuZm9yRWFjaCgoYWN0aW9uOiBJQWN0aW9uKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BzID0ge1xyXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgZXJyb3I6IChfc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIHJ1bm5pbmcgYWN0aW9uIGluIHJlcGVhdEFjdGlvbnNcIixcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtydW5BY3Rpb259LFxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgcnVubmluZyBhY3Rpb24gaW4gcmVwZWF0QWN0aW9uc1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICBlZmZlY3RzLnB1c2goW1xyXG4gICAgICAgICAgICBydW5BY3Rpb25Jbm5lcixcclxuICAgICAgICAgICAgcHJvcHNcclxuICAgICAgICBdKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBbXHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSksXHJcbiAgICAgICAgLi4uZWZmZWN0c1xyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IHNlbmRSZXF1ZXN0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHF1ZXVlZEVmZmVjdHM6IEFycmF5PElIdHRwRWZmZWN0PlxyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgY29uc3QgZWZmZWN0czogYW55W10gPSBbXTtcclxuXHJcbiAgICBxdWV1ZWRFZmZlY3RzLmZvckVhY2goKGh0dHBFZmZlY3Q6IElIdHRwRWZmZWN0KSA9PiB7XHJcblxyXG4gICAgICAgIGdldEVmZmVjdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGh0dHBFZmZlY3QsXHJcbiAgICAgICAgICAgIGVmZmVjdHMsXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBbXHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSksXHJcbiAgICAgICAgLi4uZWZmZWN0c1xyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IGdldEVmZmVjdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBodHRwRWZmZWN0OiBJSHR0cEVmZmVjdCxcclxuICAgIGVmZmVjdHM6IEFycmF5PElIdHRwRWZmZWN0PlxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCB1cmw6IHN0cmluZyA9IGh0dHBFZmZlY3QudXJsO1xyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgQWN0aW9uVHlwZS5HZXRTdGVwXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGVmZmVjdCA9IGdBdXRoZW50aWNhdGVkSHR0cCh7XHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBodHRwRWZmZWN0LnBhcnNlVHlwZSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzcG9uc2U6ICdqc29uJyxcclxuICAgICAgICBhY3Rpb246IGh0dHBFZmZlY3QuYWN0aW9uRGVsZWdhdGUsXHJcbiAgICAgICAgZXJyb3I6IChfc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgcG9zdGluZyBnUmVwZWF0QWN0aW9ucyBkYXRhIHRvIHRoZSBzZXJ2ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z2V0RWZmZWN0Lm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgcG9zdGluZyBnUmVwZWF0QWN0aW9ucyBkYXRhIHRvIHRoZSBzZXJ2ZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZWZmZWN0cy5wdXNoKGVmZmVjdCk7XHJcbn07XHJcblxyXG5jb25zdCBnUmVwZWF0QWN0aW9ucyA9IHtcclxuXHJcbiAgICBodHRwU2lsZW50UmVMb2FkSW1tZWRpYXRlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gTXVzdCByZXR1cm4gYWx0ZXJlZCBzdGF0ZSBmb3IgdGhlIHN1YnNjcmlwdGlvbiBub3QgdG8gZ2V0IHJlbW92ZWRcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHN0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVMb2FkSHR0cEVmZmVjdHNJbW1lZGlhdGU6IEFycmF5PElIdHRwRWZmZWN0PiA9IHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZTtcclxuICAgICAgICBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJlTG9hZEdldEh0dHBJbW1lZGlhdGUgPSBbXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbmRSZXF1ZXN0KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVMb2FkSHR0cEVmZmVjdHNJbW1lZGlhdGVcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaWxlbnRSdW5BY3Rpb25JbW1lZGlhdGU6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVwZWF0RWZmZWN0cy5ydW5BY3Rpb25JbW1lZGlhdGUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIE11c3QgcmV0dXJuIGFsdGVyZWQgc3RhdGUgZm9yIHRoZSBzdWJzY3JpcHRpb24gbm90IHRvIGdldCByZW1vdmVkXHJcbiAgICAgICAgICAgIC8vIHJldHVybiBzdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJ1bkFjdGlvbkltbWVkaWF0ZTogQXJyYXk8SUFjdGlvbj4gPSBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZTtcclxuICAgICAgICBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZSA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4gcnVuQWN0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcnVuQWN0aW9uSW1tZWRpYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZXBlYXRBY3Rpb25zO1xyXG5cclxuIiwiaW1wb3J0IHsgaW50ZXJ2YWwgfSBmcm9tIFwiLi4vLi4vaHlwZXJBcHAvdGltZVwiO1xyXG5cclxuaW1wb3J0IGdSZXBlYXRBY3Rpb25zIGZyb20gXCIuLi9nbG9iYWwvYWN0aW9ucy9nUmVwZWF0QWN0aW9uc1wiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IHJlcGVhdFN1YnNjcmlwdGlvbnMgPSB7XHJcblxyXG4gICAgYnVpbGRSZXBlYXRTdWJzY3JpcHRpb25zOiAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBidWlsZFJlTG9hZERhdGFJbW1lZGlhdGUgPSAoKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJlTG9hZEdldEh0dHBJbW1lZGlhdGUubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbChcclxuICAgICAgICAgICAgICAgICAgICBnUmVwZWF0QWN0aW9ucy5odHRwU2lsZW50UmVMb2FkSW1tZWRpYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHsgZGVsYXk6IDEwIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBidWlsZFJ1bkFjdGlvbnNJbW1lZGlhdGUgPSAoKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsKFxyXG4gICAgICAgICAgICAgICAgICAgIGdSZXBlYXRBY3Rpb25zLnNpbGVudFJ1bkFjdGlvbkltbWVkaWF0ZSxcclxuICAgICAgICAgICAgICAgICAgICB7IGRlbGF5OiAxMCB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVwZWF0U3Vic2NyaXB0aW9uOiBhbnlbXSA9IFtcclxuXHJcbiAgICAgICAgICAgIGJ1aWxkUmVMb2FkRGF0YUltbWVkaWF0ZSgpLFxyXG4gICAgICAgICAgICBidWlsZFJ1bkFjdGlvbnNJbW1lZGlhdGUoKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiByZXBlYXRTdWJzY3JpcHRpb247XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZXBlYXRTdWJzY3JpcHRpb25zO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IHJlcGVhdFN1YnNjcmlwdGlvbnMgZnJvbSBcIi4uLy4uLy4uL3N1YnNjcmlwdGlvbnMvcmVwZWF0U3Vic2NyaXB0aW9uXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdFN1YnNjcmlwdGlvbnMgPSAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uczogYW55W10gPSBbXHJcblxyXG4gICAgICAgIC4uLnJlcGVhdFN1YnNjcmlwdGlvbnMuYnVpbGRSZXBlYXRTdWJzY3JpcHRpb25zKHN0YXRlKVxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9ucztcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdWJzY3JpcHRpb25zO1xyXG5cclxuIiwiXHJcbmNvbnN0IEZpbHRlcnMgPSB7XHJcblxyXG4gICAgdHJlZVNvbHZlR3VpZGVJRDogXCJ0cmVlU29sdmVHdWlkZVwiLFxyXG4gICAgdHJlZVNvbHZlRnJhZ21lbnRzSUQ6IFwidHJlZVNvbHZlRnJhZ21lbnRzXCIsXHJcbiAgICB1cE5hdkVsZW1lbnQ6ICcjc3RlcE5hdiAuY2hhaW4tdXB3YXJkcycsXHJcbiAgICBkb3duTmF2RWxlbWVudDogJyNzdGVwTmF2IC5jaGFpbi1kb3dud2FyZHMnLFxyXG5cclxuICAgIGZyYWdtZW50Qm94OiAnI3RyZWVTb2x2ZUZyYWdtZW50cyAubnQtZnItZnJhZ21lbnQtYm94JyxcclxuICAgIGZyYWdtZW50Qm94RGlzY3Vzc2lvbjogJyN0cmVlU29sdmVGcmFnbWVudHMgLm50LWZyLWZyYWdtZW50LWJveCAubnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbicsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpbHRlcnM7XHJcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5cclxuXHJcbmNvbnN0IG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQgPSAoKSA9PiB7XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRCb3hEaXNjdXNzaW9uczogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoRmlsdGVycy5mcmFnbWVudEJveERpc2N1c3Npb24pO1xyXG4gICAgbGV0IGZyYWdtZW50Qm94OiBIVE1MRGl2RWxlbWVudDtcclxuICAgIGxldCBkYXRhRGlzY3Vzc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhZ21lbnRCb3hEaXNjdXNzaW9ucy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICBmcmFnbWVudEJveCA9IGZyYWdtZW50Qm94RGlzY3Vzc2lvbnNbaV0gYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICAgICAgZGF0YURpc2N1c3Npb24gPSBmcmFnbWVudEJveC5kYXRhc2V0LmRpc2N1c3Npb247XHJcblxyXG4gICAgICAgIGlmIChkYXRhRGlzY3Vzc2lvbiAhPSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBmcmFnbWVudEJveC5pbm5lckhUTUwgPSBkYXRhRGlzY3Vzc2lvbjtcclxuICAgICAgICAgICAgZGVsZXRlIGZyYWdtZW50Qm94LmRhdGFzZXQuZGlzY3Vzc2lvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkO1xyXG4iLCJpbXBvcnQgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCBmcm9tIFwiLi4vLi4vZnJhZ21lbnRzL2NvZGUvb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZFwiO1xyXG5cclxuXHJcbmNvbnN0IG9uUmVuZGVyRmluaXNoZWQgPSAoKSA9PiB7XHJcblxyXG4gICAgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCgpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgb25SZW5kZXJGaW5pc2hlZDtcclxuIiwiaW1wb3J0IG9uUmVuZGVyRmluaXNoZWQgZnJvbSBcIi4vb25SZW5kZXJGaW5pc2hlZFwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRFdmVudHMgPSB7XHJcblxyXG4gIG9uUmVuZGVyRmluaXNoZWQ6ICgpID0+IHtcclxuXHJcbiAgICBvblJlbmRlckZpbmlzaGVkKCk7XHJcbiAgfSxcclxuXHJcbiAgcmVnaXN0ZXJHbG9iYWxFdmVudHM6ICgpID0+IHtcclxuXHJcbiAgICB3aW5kb3cub25yZXNpemUgPSAoKSA9PiB7XHJcblxyXG4gICAgICBpbml0RXZlbnRzLm9uUmVuZGVyRmluaXNoZWQoKTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0RXZlbnRzO1xyXG5cclxuXHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRBY3Rpb25zID0ge1xyXG5cclxuICAgIHNldE5vdFJhdzogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdz8uVHJlZVNvbHZlPy5zY3JlZW4/LmlzQXV0b2ZvY3VzRmlyc3RSdW4pIHtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmF1dG9mb2N1cyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaXNBdXRvZm9jdXNGaXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdEFjdGlvbnM7XHJcbiIsIlxyXG5leHBvcnQgZW51bSBQYXJzZVR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBKc29uID0gJ2pzb24nLFxyXG4gICAgVGV4dCA9ICd0ZXh0J1xyXG59XHJcblxyXG4iLCJpbXBvcnQgSVJlbmRlckZyYWdtZW50VUkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlckZyYWdtZW50VUlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJGcmFnbWVudFVJIGltcGxlbWVudHMgSVJlbmRlckZyYWdtZW50VUkge1xyXG5cclxuICAgIHB1YmxpYyBmcmFnbWVudE9wdGlvbnNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGRpc2N1c3Npb25Mb2FkZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBhbmNpbGxhcnlFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGRvTm90UGFpbnQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBzZWN0aW9uSW5kZXg6IG51bWJlciA9IDA7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5pbXBvcnQgUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vdWkvUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckZyYWdtZW50IGltcGxlbWVudHMgSVJlbmRlckZyYWdtZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBpZDogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXIgfCBudWxsXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5zZWN0aW9uID0gc2VjdGlvbjtcclxuICAgICAgICB0aGlzLnBhcmVudEZyYWdtZW50SUQgPSBwYXJlbnRGcmFnbWVudElEO1xyXG4gICAgICAgIHRoaXMuc2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpZDogc3RyaW5nO1xyXG4gICAgcHVibGljIGlLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGlFeGl0S2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBleGl0S2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBwb2RLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHBvZFRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHRvcExldmVsTWFwS2V5OiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBtYXBLZXlDaGFpbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZ3VpZGVJRDogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZ3VpZGVQYXRoOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHNlbGVjdGVkOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBpc0xlYWY6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+ID0gW107XHJcbiAgICBwdWJsaWMgdmFyaWFibGU6IEFycmF5PFtzdHJpbmddIHwgW3N0cmluZywgc3RyaW5nXT4gPSBbXTtcclxuICAgIHB1YmxpYyBjbGFzc2VzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgcHVibGljIG9wdGlvbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgaXNBbmNpbGxhcnk6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBvcmRlcjogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgbGluazogSURpc3BsYXlDaGFydCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHBvZDogSURpc3BsYXlDaGFydCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbjtcclxuICAgIHB1YmxpYyBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGw7XHJcblxyXG4gICAgcHVibGljIHVpOiBJUmVuZGVyRnJhZ21lbnRVSSA9IG5ldyBSZW5kZXJGcmFnbWVudFVJKCk7XHJcbn1cclxuIiwiXHJcbmV4cG9ydCBlbnVtIE91dGxpbmVUeXBlIHtcclxuXHJcbiAgICBOb25lID0gJ25vbmUnLFxyXG4gICAgTm9kZSA9ICdub2RlJyxcclxuICAgIEV4aXQgPSAnZXhpdCcsXHJcbiAgICBMaW5rID0gJ2xpbmsnXHJcbn1cclxuXHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyT3V0bGluZU5vZGUgaW1wbGVtZW50cyBJUmVuZGVyT3V0bGluZU5vZGUge1xyXG5cclxuICAgIHB1YmxpYyBpOiBzdHJpbmcgPSAnJzsgLy8gaWRcclxuICAgIHB1YmxpYyBjOiBudW1iZXIgfCBudWxsID0gbnVsbDsgLy8gaW5kZXggZnJvbSBvdXRsaW5lIGNoYXJ0IGFycmF5XHJcbiAgICBwdWJsaWMgZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7IC8vIGluZGV4IGZyb20gb3V0bGluZSBjaGFydCBhcnJheVxyXG4gICAgcHVibGljIHg6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQgPSBudWxsOyAvLyBpRXhpdCBpZFxyXG4gICAgcHVibGljIF94OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkID0gbnVsbDsgLy8gZXhpdCBpZFxyXG4gICAgcHVibGljIG86IEFycmF5PElSZW5kZXJPdXRsaW5lTm9kZT4gPSBbXTsgLy8gb3B0aW9uc1xyXG4gICAgcHVibGljIHBhcmVudDogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgdHlwZTogT3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5Ob2RlO1xyXG4gICAgcHVibGljIGlzQ2hhcnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGlzUm9vdDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzTGFzdDogYm9vbGVhbiA9IGZhbHNlO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi9SZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlck91dGxpbmUgaW1wbGVtZW50cyBJUmVuZGVyT3V0bGluZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGF0aDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhdGg6IHN0cmluZztcclxuICAgIHB1YmxpYyBsb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgdjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgcjogSVJlbmRlck91dGxpbmVOb2RlID0gbmV3IFJlbmRlck91dGxpbmVOb2RlKCk7XHJcbiAgICBwdWJsaWMgYzogQXJyYXk8SVJlbmRlck91dGxpbmVDaGFydD4gPSBbXTtcclxuICAgIHB1YmxpYyBlOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcbiAgICBwdWJsaWMgbXY6IGFueSB8IHVuZGVmaW5lZDtcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlck91dGxpbmVDaGFydCBpbXBsZW1lbnRzIElSZW5kZXJPdXRsaW5lQ2hhcnQge1xyXG5cclxuICAgIHB1YmxpYyBpOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBwOiBzdHJpbmcgPSAnJztcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlHdWlkZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5R3VpZGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJHdWlkZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vcmVuZGVyL1JlbmRlckZyYWdtZW50XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGxheUd1aWRlIGltcGxlbWVudHMgSURpc3BsYXlHdWlkZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZ3VpZGU6IElSZW5kZXJHdWlkZSxcclxuICAgICAgICByb290SUQ6IHN0cmluZ1xyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5saW5rSUQgPSBsaW5rSUQ7XHJcbiAgICAgICAgdGhpcy5ndWlkZSA9IGd1aWRlO1xyXG5cclxuICAgICAgICB0aGlzLnJvb3QgPSBuZXcgUmVuZGVyRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHJvb3RJRCxcclxuICAgICAgICAgICAgXCJndWlkZVJvb3RcIixcclxuICAgICAgICAgICAgdGhpcyxcclxuICAgICAgICAgICAgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxpbmtJRDogbnVtYmVyO1xyXG4gICAgcHVibGljIGd1aWRlOiBJUmVuZGVyR3VpZGU7XHJcbiAgICBwdWJsaWMgb3V0bGluZTogSVJlbmRlck91dGxpbmUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyByb290OiBJUmVuZGVyRnJhZ21lbnQ7XHJcbiAgICBwdWJsaWMgY3VycmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJHdWlkZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckd1aWRlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyR3VpZGUgaW1wbGVtZW50cyBJUmVuZGVyR3VpZGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpZDogc3RyaW5nO1xyXG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBkZXNjcmlwdGlvbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG59XHJcbiIsIlxyXG5leHBvcnQgZW51bSBTY3JvbGxIb3BUeXBlIHtcclxuICAgIE5vbmUgPSBcIm5vbmVcIixcclxuICAgIFVwID0gXCJ1cFwiLFxyXG4gICAgRG93biA9IFwiZG93blwiXHJcbn1cclxuIiwiaW1wb3J0IHsgU2Nyb2xsSG9wVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1Njcm9sbEhvcFR5cGVcIjtcclxuaW1wb3J0IElTY3JlZW4gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lTY3JlZW5cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY3JlZW4gaW1wbGVtZW50cyBJU2NyZWVuIHtcclxuXHJcbiAgICBwdWJsaWMgYXV0b2ZvY3VzOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgaXNBdXRvZm9jdXNGaXJzdFJ1bjogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgaGlkZUJhbm5lcjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNjcm9sbFRvVG9wOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgc2Nyb2xsVG9FbGVtZW50OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzY3JvbGxIb3A6IFNjcm9sbEhvcFR5cGUgPSBTY3JvbGxIb3BUeXBlLk5vbmU7XHJcbiAgICBwdWJsaWMgbGFzdFNjcm9sbFk6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHVibGljIHVhOiBhbnkgfCBudWxsID0gbnVsbDtcclxufVxyXG4iLCJpbXBvcnQgSVNjcmVlbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy93aW5kb3cvSVNjcmVlblwiO1xyXG5pbXBvcnQgSVRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy93aW5kb3cvSVRyZWVTb2x2ZVwiO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gXCIuL1NjcmVlblwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyZWVTb2x2ZSBpbXBsZW1lbnRzIElUcmVlU29sdmUge1xyXG5cclxuICAgIHB1YmxpYyByZW5kZXJpbmdDb21tZW50OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzY3JlZW46IElTY3JlZW4gPSBuZXcgU2NyZWVuKCk7XHJcbn1cclxuIiwiXHJcblxyXG5jb25zdCBnRmlsZUNvbnN0YW50cyA9IHtcclxuXHJcbiAgICBmcmFnbWVudHNGb2xkZXJTdWZmaXg6ICdfZnJhZ3MnLFxyXG4gICAgZnJhZ21lbnRGaWxlRXh0ZW5zaW9uOiAnLmh0bWwnLFxyXG4gICAgZ3VpZGVPdXRsaW5lRmlsZW5hbWU6ICdvdXRsaW5lLnRzb2xuJyxcclxuICAgIGd1aWRlUmVuZGVyQ29tbWVudFRhZzogJ3RzR3VpZGVSZW5kZXJDb21tZW50ICcsXHJcbiAgICBmcmFnbWVudFJlbmRlckNvbW1lbnRUYWc6ICd0c0ZyYWdtZW50UmVuZGVyQ29tbWVudCAnLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZpbGVDb25zdGFudHM7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IEZpbHRlcnMgZnJvbSBcIi4uLy4uL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzXCI7XHJcbmltcG9ydCBEaXNwbGF5R3VpZGUgZnJvbSBcIi4uLy4uL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUd1aWRlXCI7XHJcbmltcG9ydCBSZW5kZXJHdWlkZSBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlckd1aWRlXCI7XHJcbmltcG9ydCBUcmVlU29sdmUgZnJvbSBcIi4uLy4uL3N0YXRlL3dpbmRvdy9UcmVlU29sdmVcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBwYXJzZUd1aWRlID0gKHJhd0d1aWRlOiBhbnkpOiBJUmVuZGVyR3VpZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IGd1aWRlOiBJUmVuZGVyR3VpZGUgPSBuZXcgUmVuZGVyR3VpZGUocmF3R3VpZGUuaWQpO1xyXG4gICAgZ3VpZGUudGl0bGUgPSByYXdHdWlkZS50aXRsZSA/PyAnJztcclxuICAgIGd1aWRlLmRlc2NyaXB0aW9uID0gcmF3R3VpZGUuZGVzY3JpcHRpb24gPz8gJyc7XHJcbiAgICBndWlkZS5wYXRoID0gcmF3R3VpZGUucGF0aCA/PyBudWxsO1xyXG4gICAgZ3VpZGUuZnJhZ21lbnRGb2xkZXJVcmwgPSBnUmVuZGVyQ29kZS5nZXRGcmFnbWVudEZvbGRlclVybChyYXdHdWlkZS5mcmFnbWVudEZvbGRlclBhdGgpO1xyXG5cclxuICAgIHJldHVybiBndWlkZTtcclxufTtcclxuXHJcbmNvbnN0IHBhcnNlUmVuZGVyaW5nQ29tbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByYXc6IGFueVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXJhdykge1xyXG4gICAgICAgIHJldHVybiByYXc7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxue1xyXG4gICAgXCJndWlkZVwiOiB7XHJcbiAgICAgICAgXCJpZFwiOiBcImRCdDdKTjF2dFwiXHJcbiAgICB9LFxyXG4gICAgXCJmcmFnbWVudFwiOiB7XHJcbiAgICAgICAgXCJpZFwiOiBcImRCdDdKTjF2dFwiLFxyXG4gICAgICAgIFwidG9wTGV2ZWxNYXBLZXlcIjogXCJjdjFUUmwwMXJmXCIsXHJcbiAgICAgICAgXCJtYXBLZXlDaGFpblwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcImd1aWRlSURcIjogXCJkQnQ3Sk4xSGVcIixcclxuICAgICAgICBcImd1aWRlUGF0aFwiOiBcImM6L0dpdEh1Yi9URVNULkRvY3VtZW50YXRpb24vdHNtYXBzZGF0YU9wdGlvbnNGb2xkZXIvSG9sZGVyL2RhdGFPcHRpb25zLnRzbWFwXCIsXHJcbiAgICAgICAgXCJwYXJlbnRGcmFnbWVudElEXCI6IG51bGwsXHJcbiAgICAgICAgXCJjaGFydEtleVwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcIm9wdGlvbnNcIjogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZEJ0N0taMUFOXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9wdGlvblwiOiBcIk9wdGlvbiAxXCIsXHJcbiAgICAgICAgICAgICAgICBcImlzQW5jaWxsYXJ5XCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgXCJvcmRlclwiOiAxXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkQnQ3S1oxUmJcIixcclxuICAgICAgICAgICAgICAgIFwib3B0aW9uXCI6IFwiT3B0aW9uIDJcIixcclxuICAgICAgICAgICAgICAgIFwiaXNBbmNpbGxhcnlcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBcIm9yZGVyXCI6IDJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImRCdDdLWjI0QlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcHRpb25cIjogXCJPcHRpb24gM1wiLFxyXG4gICAgICAgICAgICAgICAgXCJpc0FuY2lsbGFyeVwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwib3JkZXJcIjogM1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG59ICAgIFxyXG4gICAgKi9cclxuXHJcbiAgICBjb25zdCBndWlkZSA9IHBhcnNlR3VpZGUocmF3Lmd1aWRlKTtcclxuXHJcbiAgICBjb25zdCBkaXNwbGF5R3VpZGUgPSBuZXcgRGlzcGxheUd1aWRlKFxyXG4gICAgICAgIGdTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpLFxyXG4gICAgICAgIGd1aWRlLFxyXG4gICAgICAgIHJhdy5mcmFnbWVudC5pZFxyXG4gICAgKTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEd1aWRlUm9vdEZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHJhdy5mcmFnbWVudCxcclxuICAgICAgICBkaXNwbGF5R3VpZGUucm9vdFxyXG4gICAgKTtcclxuXHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUgPSBkaXNwbGF5R3VpZGU7XHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50U2VjdGlvbiA9IGRpc3BsYXlHdWlkZTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmNhY2hlU2VjdGlvblJvb3QoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZ1JlbmRlckNvZGUgPSB7XHJcblxyXG4gICAgZ2V0RnJhZ21lbnRGb2xkZXJVcmw6IChmb2xkZXJQYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGRpdmlkZXIgPSAnJztcclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmb2xkZXJQYXRoKSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFsb2NhdGlvbi5vcmlnaW4uZW5kc1dpdGgoJy8nKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghZm9sZGVyUGF0aC5zdGFydHNXaXRoKCcvJykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGl2aWRlciA9ICcvJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChmb2xkZXJQYXRoLnN0YXJ0c1dpdGgoJy8nKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJQYXRoID0gZm9sZGVyUGF0aC5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBgJHtsb2NhdGlvbi5vcmlnaW59JHtkaXZpZGVyfSR7Zm9sZGVyUGF0aH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZ2lzdGVyR3VpZGVDb21tZW50OiAoKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHRyZWVTb2x2ZUd1aWRlOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKEZpbHRlcnMudHJlZVNvbHZlR3VpZGVJRCkgYXMgSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0cmVlU29sdmVHdWlkZVxyXG4gICAgICAgICAgICAmJiB0cmVlU29sdmVHdWlkZS5oYXNDaGlsZE5vZGVzKCkgPT09IHRydWVcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkTm9kZTogQ2hpbGROb2RlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2hpbGROb2RlID0gdHJlZVNvbHZlR3VpZGUuY2hpbGROb2Rlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLm5vZGVUeXBlID09PSBOb2RlLkNPTU1FTlRfTk9ERSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUgPSBuZXcgVHJlZVNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnJlbmRlcmluZ0NvbW1lbnQgPSBjaGlsZE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VSZW5kZXJpbmdDb21tZW50OiAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmU/LnJlbmRlcmluZ0NvbW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IGd1aWRlUmVuZGVyQ29tbWVudCA9IHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudDtcclxuICAgICAgICAgICAgZ3VpZGVSZW5kZXJDb21tZW50ID0gZ3VpZGVSZW5kZXJDb21tZW50LnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ3VpZGVSZW5kZXJDb21tZW50LnN0YXJ0c1dpdGgoZ0ZpbGVDb25zdGFudHMuZ3VpZGVSZW5kZXJDb21tZW50VGFnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBndWlkZVJlbmRlckNvbW1lbnQgPSBndWlkZVJlbmRlckNvbW1lbnQuc3Vic3RyaW5nKGdGaWxlQ29uc3RhbnRzLmd1aWRlUmVuZGVyQ29tbWVudFRhZy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjb25zdCByYXcgPSBKU09OLnBhcnNlKGd1aWRlUmVuZGVyQ29tbWVudCk7XHJcblxyXG4gICAgICAgICAgICBwYXJzZVJlbmRlcmluZ0NvbW1lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJhd1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVnaXN0ZXJGcmFnbWVudENvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZW5kZXJDb2RlO1xyXG4iLCJpbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwbGF5Q2hhcnQgaW1wbGVtZW50cyBJRGlzcGxheUNoYXJ0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydFxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5saW5rSUQgPSBsaW5rSUQ7XHJcbiAgICAgICAgdGhpcy5jaGFydCA9IGNoYXJ0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsaW5rSUQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydDtcclxuICAgIHB1YmxpYyBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHJvb3Q6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHBhcmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgY3VycmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lTZWdtZW50Tm9kZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYWluU2VnbWVudCBpbXBsZW1lbnRzIElDaGFpblNlZ21lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgc3RhcnQ6IElTZWdtZW50Tm9kZSxcclxuICAgICAgICBlbmQ6IElTZWdtZW50Tm9kZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgICAgICB0aGlzLnRleHQgPSBgJHtzdGFydC50ZXh0fSR7ZW5kPy50ZXh0ID8/ICcnfWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdGV4dDogc3RyaW5nO1xyXG4gICAgcHVibGljIG91dGxpbmVOb2RlczogQXJyYXk8SVJlbmRlck91dGxpbmVOb2RlPiA9IFtdO1xyXG4gICAgcHVibGljIG91dGxpbmVOb2Rlc0xvYWRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBzdGFydDogSVNlZ21lbnROb2RlO1xyXG4gICAgcHVibGljIGVuZDogSVNlZ21lbnROb2RlO1xyXG5cclxuICAgIHB1YmxpYyBzZWdtZW50SW5TZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24gfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzZWdtZW50U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2VnbWVudE91dFNlY3Rpb246IElEaXNwbGF5U2VjdGlvbiB8IG51bGwgPSBudWxsO1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcbmltcG9ydCBJU2VnbWVudE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSVNlZ21lbnROb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VnbWVudE5vZGUgaW1wbGVtZW50cyBJU2VnbWVudE5vZGV7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgdGV4dDogc3RyaW5nLFxyXG4gICAgICAgIGtleTogc3RyaW5nLFxyXG4gICAgICAgIHR5cGU6IE91dGxpbmVUeXBlLFxyXG4gICAgICAgIGlzUm9vdDogYm9vbGVhbixcclxuICAgICAgICBpc0xhc3Q6IGJvb2xlYW5cclxuICAgICkge1xyXG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLmlzUm9vdCA9IGlzUm9vdDtcclxuICAgICAgICB0aGlzLmlzTGFzdCA9IGlzTGFzdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGV4dDogc3RyaW5nO1xyXG4gICAgcHVibGljIGtleTogc3RyaW5nO1xyXG4gICAgcHVibGljIHR5cGU6IE91dGxpbmVUeXBlO1xyXG4gICAgcHVibGljIGlzUm9vdDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBpc0xhc3Q6IGJvb2xlYW47XHJcbn1cclxuXHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lTZWdtZW50Tm9kZVwiO1xyXG5pbXBvcnQgQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9zdGF0ZS9zZWdtZW50cy9DaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IFNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9zdGF0ZS9zZWdtZW50cy9TZWdtZW50Tm9kZVwiO1xyXG5pbXBvcnQgZ1V0aWxpdGllcyBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBjaGVja0ZvckxpbmtFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgbGlua1NlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmIChzZWdtZW50LmVuZC5rZXkgIT09IGxpbmtTZWdtZW50LnN0YXJ0LmtleVxyXG4gICAgICAgIHx8IHNlZ21lbnQuZW5kLnR5cGUgIT09IGxpbmtTZWdtZW50LnN0YXJ0LnR5cGVcclxuICAgICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpbmsgc2VnbWVudCBzdGFydCBkb2VzIG5vdCBtYXRjaCBzZWdtZW50IGVuZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxpbmtTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsIC0gbGlua1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxpbmtTZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIGxpbmtcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFsaW5rU2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IG91dCBzZWN0aW9uIHdhcyBudWxsIC0gbGlua1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rIGlLZXknKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGxpbmtTZWdtZW50LnN0YXJ0LnR5cGUgIT09IE91dGxpbmVUeXBlLkxpbmspIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnZXRJZGVudGlmaWVyQ2hhcmFjdGVyID0gKGlkZW50aWZpZXJDaGFyOiBzdHJpbmcpOiB7IHR5cGU6IE91dGxpbmVUeXBlLCBpc0xhc3Q6IGJvb2xlYW4gfSA9PiB7XHJcblxyXG4gICAgbGV0IHN0YXJ0T3V0bGluZVR5cGU6IE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuICAgIGxldCBpc0xhc3QgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoaWRlbnRpZmllckNoYXIgPT09ICd+Jykge1xyXG5cclxuICAgICAgICBzdGFydE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTGluaztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGlkZW50aWZpZXJDaGFyID09PSAnXycpIHtcclxuXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLkV4aXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpZGVudGlmaWVyQ2hhciA9PT0gJy0nKSB7XHJcblxyXG4gICAgICAgIHN0YXJ0T3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5Ob2RlO1xyXG4gICAgICAgIGlzTGFzdCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHF1ZXJ5IHN0cmluZyBvdXRsaW5lIG5vZGUgaWRlbnRpZmllcjogJHtpZGVudGlmaWVyQ2hhcn1gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IHN0YXJ0T3V0bGluZVR5cGUsXHJcbiAgICAgICAgaXNMYXN0OiBpc0xhc3RcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRLZXlFbmRJbmRleCA9IChyZW1haW5pbmdDaGFpbjogc3RyaW5nKTogeyBpbmRleDogbnVtYmVyLCBpc0xhc3Q6IGJvb2xlYW4gfCBudWxsIH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0S2V5RW5kSW5kZXggPSBVLmluZGV4T2ZBbnkoXHJcbiAgICAgICAgcmVtYWluaW5nQ2hhaW4sXHJcbiAgICAgICAgWyd+JywgJy0nLCAnXyddLFxyXG4gICAgICAgIDFcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHN0YXJ0S2V5RW5kSW5kZXggPT09IC0xKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluZGV4OiByZW1haW5pbmdDaGFpbi5sZW5ndGgsXHJcbiAgICAgICAgICAgIGlzTGFzdDogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbmRleDogc3RhcnRLZXlFbmRJbmRleCxcclxuICAgICAgICBpc0xhc3Q6IG51bGxcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRPdXRsaW5lVHlwZSA9IChyZW1haW5pbmdDaGFpbjogc3RyaW5nKTogeyB0eXBlOiBPdXRsaW5lVHlwZSwgaXNMYXN0OiBib29sZWFuIH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IGlkZW50aWZpZXJDaGFyID0gcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKDAsIDEpO1xyXG4gICAgY29uc3Qgb3V0bGluZVR5cGUgPSBnZXRJZGVudGlmaWVyQ2hhcmFjdGVyKGlkZW50aWZpZXJDaGFyKTtcclxuXHJcbiAgICByZXR1cm4gb3V0bGluZVR5cGU7XHJcbn07XHJcblxyXG5jb25zdCBnZXROZXh0U2VnbWVudE5vZGUgPSAocmVtYWluaW5nQ2hhaW46IHN0cmluZyk6IHsgc2VnbWVudE5vZGU6IElTZWdtZW50Tm9kZSB8IG51bGwsIGVuZENoYWluOiBzdHJpbmcgfSA9PiB7XHJcblxyXG4gICAgbGV0IHNlZ21lbnROb2RlOiBJU2VnbWVudE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIGxldCBlbmRDaGFpbiA9IFwiXCI7XHJcblxyXG4gICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShyZW1haW5pbmdDaGFpbikpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZVR5cGUgPSBnZXRPdXRsaW5lVHlwZShyZW1haW5pbmdDaGFpbik7XHJcbiAgICAgICAgY29uc3Qga2V5RW5kOiB7IGluZGV4OiBudW1iZXIsIGlzTGFzdDogYm9vbGVhbiB8IG51bGwgfSA9IGdldEtleUVuZEluZGV4KHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICBrZXlFbmQuaW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzZWdtZW50Tm9kZSA9IG5ldyBTZWdtZW50Tm9kZShcclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKDAsIGtleUVuZC5pbmRleCksXHJcbiAgICAgICAgICAgIGtleSxcclxuICAgICAgICAgICAgb3V0bGluZVR5cGUudHlwZSxcclxuICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgIG91dGxpbmVUeXBlLmlzTGFzdFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChrZXlFbmQuaXNMYXN0ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBzZWdtZW50Tm9kZS5pc0xhc3QgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZW5kQ2hhaW4gPSByZW1haW5pbmdDaGFpbi5zdWJzdHJpbmcoa2V5RW5kLmluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNlZ21lbnROb2RlLFxyXG4gICAgICAgIGVuZENoYWluXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRTZWdtZW50ID0gKFxyXG4gICAgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+LFxyXG4gICAgcmVtYWluaW5nQ2hhaW46IHN0cmluZ1xyXG4pOiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfSA9PiB7XHJcblxyXG4gICAgY29uc3Qgc2VnbWVudFN0YXJ0ID0gZ2V0TmV4dFNlZ21lbnROb2RlKHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnRTdGFydC5zZWdtZW50Tm9kZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHN0YXJ0IG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtYWluaW5nQ2hhaW4gPSBzZWdtZW50U3RhcnQuZW5kQ2hhaW47XHJcbiAgICBjb25zdCBzZWdtZW50RW5kID0gZ2V0TmV4dFNlZ21lbnROb2RlKHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnRFbmQuc2VnbWVudE5vZGUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBlbmQgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWdtZW50ID0gbmV3IENoYWluU2VnbWVudChcclxuICAgICAgICBzZWdtZW50cy5sZW5ndGgsXHJcbiAgICAgICAgc2VnbWVudFN0YXJ0LnNlZ21lbnROb2RlLFxyXG4gICAgICAgIHNlZ21lbnRFbmQuc2VnbWVudE5vZGVcclxuICAgICk7XHJcblxyXG4gICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlbWFpbmluZ0NoYWluLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFJvb3RTZWdtZW50ID0gKFxyXG4gICAgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+LFxyXG4gICAgcmVtYWluaW5nQ2hhaW46IHN0cmluZ1xyXG4pOiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfSA9PiB7XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnRTdGFydCA9IG5ldyBTZWdtZW50Tm9kZShcclxuICAgICAgICBcImd1aWRlUm9vdFwiLFxyXG4gICAgICAgICcnLFxyXG4gICAgICAgIE91dGxpbmVUeXBlLk5vZGUsXHJcbiAgICAgICAgdHJ1ZSxcclxuICAgICAgICBmYWxzZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCByb290U2VnbWVudEVuZCA9IGdldE5leHRTZWdtZW50Tm9kZShyZW1haW5pbmdDaGFpbik7XHJcblxyXG4gICAgaWYgKCFyb290U2VnbWVudEVuZC5zZWdtZW50Tm9kZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHN0YXJ0IG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBuZXcgQ2hhaW5TZWdtZW50KFxyXG4gICAgICAgIHNlZ21lbnRzLmxlbmd0aCxcclxuICAgICAgICByb290U2VnbWVudFN0YXJ0LFxyXG4gICAgICAgIHJvb3RTZWdtZW50RW5kLnNlZ21lbnROb2RlXHJcbiAgICApO1xyXG5cclxuICAgIHNlZ21lbnRzLnB1c2gocm9vdFNlZ21lbnQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVtYWluaW5nQ2hhaW4sXHJcbiAgICAgICAgc2VnbWVudDogcm9vdFNlZ21lbnRcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBsb2FkU2VnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgc3RhcnRPdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IG51bGxcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgZ1NlZ21lbnRDb2RlLmxvYWRTZWdtZW50T3V0bGluZU5vZGVzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lTm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBuZXh0U2VnbWVudE91dGxpbmVOb2RlcyA9IHNlZ21lbnQub3V0bGluZU5vZGVzO1xyXG5cclxuICAgIGlmIChuZXh0U2VnbWVudE91dGxpbmVOb2Rlcy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpcnN0Tm9kZSA9IG5leHRTZWdtZW50T3V0bGluZU5vZGVzW25leHRTZWdtZW50T3V0bGluZU5vZGVzLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3ROb2RlLmkgPT09IHNlZ21lbnQuc3RhcnQua2V5KSB7XHJcblxyXG4gICAgICAgICAgICBmaXJzdE5vZGUudHlwZSA9IHNlZ21lbnQuc3RhcnQudHlwZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxhc3ROb2RlID0gbmV4dFNlZ21lbnRPdXRsaW5lTm9kZXNbMF07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Tm9kZS5pID09PSBzZWdtZW50LmVuZC5rZXkpIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3ROb2RlLnR5cGUgPSBzZWdtZW50LmVuZC50eXBlO1xyXG4gICAgICAgICAgICBsYXN0Tm9kZS5pc0xhc3QgPSBzZWdtZW50LmVuZC5pc0xhc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdGcmFnbWVudENvZGUubG9hZE5leHRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnU2VnbWVudENvZGUgPSB7XHJcblxyXG4gICAgc2V0TmV4dFNlZ21lbnRTZWN0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGwsXHJcbiAgICAgICAgbGluazogSURpc3BsYXlDaGFydFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgIHx8ICFzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbc2VnbWVudEluZGV4IC0gMV07XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50c1tzZWdtZW50SW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gbGluazsgLy8gVGhpcyBjb3VsZCBiZSBzZXQgYWdhaW4gd2hlbiB0aGUgZW5kIG5vZGUgaXMgcHJvY2Vzc2VkXHJcblxyXG4gICAgICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRMaW5rU2VnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua1NlZ21lbnRJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIGxpbmtGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGxpbms6IElEaXNwbGF5Q2hhcnRcclxuICAgICk6IElDaGFpblNlZ21lbnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG5cclxuICAgICAgICBpZiAobGlua1NlZ21lbnRJbmRleCA8IDEpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5kZXggPCAwJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50U2VnbWVudCA9IHNlZ21lbnRzW2xpbmtTZWdtZW50SW5kZXggLSAxXTtcclxuICAgICAgICBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7XHJcblxyXG4gICAgICAgIGlmIChsaW5rU2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tsaW5rU2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKCFuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmV4dCBsaW5rIHNlZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV4dFNlZ21lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBsaW5rO1xyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLm91dGxpbmU/LnIuaSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5leHQgc2VnbWVudCBzZWN0aW9uIHJvb3Qga2V5IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0YXJ0T3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ub3V0bGluZT8uci5pIGFzIHN0cmluZ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxvYWRTZWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQsXHJcbiAgICAgICAgICAgIHN0YXJ0T3V0bGluZU5vZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjaGVja0ZvckxpbmtFcnJvcnMoXHJcbiAgICAgICAgICAgIGN1cnJlbnRTZWdtZW50LFxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudCxcclxuICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5leHRTZWdtZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRXhpdFNlZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIHBsdWdJRDogc3RyaW5nXHJcbiAgICApOiBJQ2hhaW5TZWdtZW50ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuICAgICAgICBjb25zdCBjdXJyZW50U2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRJbmRleF07XHJcbiAgICAgICAgY29uc3QgZXhpdFNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XHJcblxyXG4gICAgICAgIGlmIChleGl0U2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXhpdFNlZ21lbnQgPSBzZWdtZW50c1tleGl0U2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKCFleGl0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhpdCBsaW5rIHNlZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXhpdFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZXhpdFNlZ21lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRTZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICAgICAgY29uc3QgbGluayA9IHNlZ21lbnRTZWN0aW9uLnBhcmVudDtcclxuXHJcbiAgICAgICAgaWYgKCFsaW5rKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5rIGZyYWdtbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbmsuc2VjdGlvbjtcclxuICAgICAgICBleGl0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcblxyXG4gICAgICAgIGlmICghZXhpdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXhpdE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQuc3RhcnQua2V5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFleGl0T3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4aXRPdXRsaW5lTm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShleGl0T3V0bGluZU5vZGUuX3gpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeGl0IGtleSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBsdWdPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBwbHVnSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIXBsdWdPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGx1Z091dGxpbmVOb2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV4aXRPdXRsaW5lTm9kZS5feCAhPT0gcGx1Z091dGxpbmVOb2RlLngpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsdWdPdXRsaW5lTm9kZSBkb2VzIG5vdCBtYXRjaCBleGl0T3V0bGluZU5vZGVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGV4aXRTZWdtZW50LFxyXG4gICAgICAgICAgICBwbHVnT3V0bGluZU5vZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZXhpdFNlZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWROZXh0U2VnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnRJbmRleCA9IHNlZ21lbnQuaW5kZXggKyAxO1xyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgICAgIGlmIChuZXh0U2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tuZXh0U2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKG5leHRTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbG9hZFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnZXROZXh0U2VnbWVudE91dGxpbmVOb2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50XHJcbiAgICApOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgbGV0IG91dGxpbmVOb2RlID0gc2VnbWVudC5vdXRsaW5lTm9kZXMucG9wKCkgPz8gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5pc0xhc3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzZWdtZW50Lm91dGxpbmVOb2Rlcy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5leHRTZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbc2VnbWVudC5pbmRleCArIDFdO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmV4dFNlZ21lbnQgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VTZWdtZW50czogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcXVlcnlTdHJpbmc6IHN0cmluZ1xyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChxdWVyeVN0cmluZy5zdGFydHNXaXRoKCc/JykgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKHF1ZXJ5U3RyaW5nKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50czogQXJyYXk8SUNoYWluU2VnbWVudD4gPSBbXTtcclxuICAgICAgICBsZXQgcmVtYWluaW5nQ2hhaW4gPSBxdWVyeVN0cmluZztcclxuICAgICAgICBsZXQgcmVzdWx0OiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfTtcclxuXHJcbiAgICAgICAgcmVzdWx0ID0gYnVpbGRSb290U2VnbWVudChcclxuICAgICAgICAgICAgc2VnbWVudHMsXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYWluXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgd2hpbGUgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShyZW1haW5pbmdDaGFpbikpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGJ1aWxkU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRzLFxyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW5cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc2VnbWVudC5lbmQuaXNMYXN0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW4gPSByZXN1bHQucmVtYWluaW5nQ2hhaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cyA9IHNlZ21lbnRzO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkU2VnbWVudE91dGxpbmVOb2RlczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICAgICBzdGFydE91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gbnVsbFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGluIHNlY3Rpb24gd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZWdtZW50T3V0bGluZU5vZGVzOiBBcnJheTxJUmVuZGVyT3V0bGluZU5vZGU+ID0gW107XHJcblxyXG4gICAgICAgIGlmICghc3RhcnRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgc3RhcnRPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LnNlZ21lbnRJblNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudC5zdGFydC5rZXlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc3RhcnRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0YXJ0IG91dGxpbmUgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhcnRPdXRsaW5lTm9kZS50eXBlID0gc2VnbWVudC5zdGFydC50eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGVuZE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWdtZW50LnNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgc2VnbWVudC5lbmQua2V5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFlbmRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW5kIG91dGxpbmUgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVuZE91dGxpbmVOb2RlLnR5cGUgPSBzZWdtZW50LmVuZC50eXBlO1xyXG4gICAgICAgIGxldCBwYXJlbnQ6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBlbmRPdXRsaW5lTm9kZTtcclxuICAgICAgICBsZXQgZmlyc3RMb29wID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgd2hpbGUgKHBhcmVudCkge1xyXG5cclxuICAgICAgICAgICAgc2VnbWVudE91dGxpbmVOb2Rlcy5wdXNoKHBhcmVudCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZpcnN0TG9vcFxyXG4gICAgICAgICAgICAgICAgJiYgcGFyZW50Py5pc0NoYXJ0ID09PSB0cnVlXHJcbiAgICAgICAgICAgICAgICAmJiBwYXJlbnQ/LmlzUm9vdCA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocGFyZW50Py5pID09PSBzdGFydE91dGxpbmVOb2RlLmkpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaXJzdExvb3AgPSBmYWxzZTtcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlZ21lbnQub3V0bGluZU5vZGVzID0gc2VnbWVudE91dGxpbmVOb2RlcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1NlZ21lbnRDb2RlO1xyXG4iLCJpbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBnT3V0bGluZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ091dGxpbmVDb2RlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4uL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcblxyXG5cclxuY29uc3QgZ091dGxpbmVBY3Rpb25zID0ge1xyXG5cclxuICAgIGxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkR3VpZGVPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlclxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBzZWdtZW50SW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICBwYXJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFBvZE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRQb2RPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkR3VpZGVPdXRsaW5lQW5kU2VnbWVudHM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIHBhdGg6IHN0cmluZ1xyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlO1xyXG5cclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3RTZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbMF07XHJcblxyXG4gICAgICAgIGlmICghcm9vdFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gc2VjdGlvbi5ndWlkZS5mcmFnbWVudEZvbGRlclVybDtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm9vdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlY3Rpb247XHJcbiAgICAgICAgcm9vdFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBzZWN0aW9uO1xyXG4gICAgICAgIHJvb3RTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gc2VjdGlvbjtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXRoXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWRTZWdtZW50T3V0bGluZU5vZGVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcm9vdFNlZ21lbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBmaXJzdE5vZGUgPSBnU2VnbWVudENvZGUuZ2V0TmV4dFNlZ21lbnRPdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJvb3RTZWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGZpcnN0Tm9kZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Zmlyc3ROb2RlLml9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvb3RTZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Tm9kZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgYGxvYWRDaGFpbkZyYWdtZW50YCxcclxuICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBnU2VnbWVudENvZGUubG9hZE5leHRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByb290U2VnbWVudCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ091dGxpbmVBY3Rpb25zO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IFJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdSZW5kZXJDb2RlIGZyb20gXCIuL2dSZW5kZXJDb2RlXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnT3V0bGluZUFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ091dGxpbmVBY3Rpb25zXCI7XHJcbmltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcblxyXG5cclxuY29uc3QgY2FjaGVOb2RlRm9yTmV3TGluayA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuY2FjaGVfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgbGlua0lELFxyXG4gICAgICAgIG91dGxpbmVOb2RlXHJcbiAgICApO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG91dGxpbmVOb2RlLm8pIHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3TGluayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNhY2hlTm9kZUZvck5ld1BvZCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuY2FjaGVfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgbGlua0lELFxyXG4gICAgICAgIG91dGxpbmVOb2RlXHJcbiAgICApO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG91dGxpbmVOb2RlLm8pIHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3UG9kKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICBsaW5rSURcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbG9hZE5vZGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmF3Tm9kZTogYW55LFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBudWxsXHJcbik6IElSZW5kZXJPdXRsaW5lTm9kZSA9PiB7XHJcblxyXG4gICAgY29uc3Qgbm9kZSA9IG5ldyBSZW5kZXJPdXRsaW5lTm9kZSgpO1xyXG4gICAgbm9kZS5pID0gcmF3Tm9kZS5pO1xyXG4gICAgbm9kZS5jID0gcmF3Tm9kZS5jID8/IG51bGw7XHJcbiAgICBub2RlLmQgPSByYXdOb2RlLmQgPz8gbnVsbDtcclxuICAgIG5vZGUuX3ggPSByYXdOb2RlLl94ID8/IG51bGw7XHJcbiAgICBub2RlLnggPSByYXdOb2RlLnggPz8gbnVsbDtcclxuICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xyXG4gICAgbm9kZS50eXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuXHJcbiAgICBnU3RhdGVDb2RlLmNhY2hlX291dGxpbmVOb2RlKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGxpbmtJRCxcclxuICAgICAgICBub2RlXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChub2RlLmMpIHtcclxuXHJcbiAgICAgICAgbm9kZS50eXBlID0gT3V0bGluZVR5cGUuTGluaztcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmF3Tm9kZS5vXHJcbiAgICAgICAgJiYgQXJyYXkuaXNBcnJheShyYXdOb2RlLm8pID09PSB0cnVlXHJcbiAgICAgICAgJiYgcmF3Tm9kZS5vLmxlbmd0aCA+IDBcclxuICAgICkge1xyXG4gICAgICAgIGxldCBvOiBJUmVuZGVyT3V0bGluZU5vZGU7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHJhd05vZGUubykge1xyXG5cclxuICAgICAgICAgICAgbyA9IGxvYWROb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBub2RlLm8ucHVzaChvKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbn07XHJcblxyXG5jb25zdCBsb2FkQ2hhcnRzID0gKFxyXG4gICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICByYXdPdXRsaW5lQ2hhcnRzOiBBcnJheTxhbnk+XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIG91dGxpbmUuYyA9IFtdO1xyXG4gICAgbGV0IGM6IElSZW5kZXJPdXRsaW5lQ2hhcnQ7XHJcblxyXG4gICAgZm9yIChjb25zdCBjaGFydCBvZiByYXdPdXRsaW5lQ2hhcnRzKSB7XHJcblxyXG4gICAgICAgIGMgPSBuZXcgUmVuZGVyT3V0bGluZUNoYXJ0KCk7XHJcbiAgICAgICAgYy5pID0gY2hhcnQuaTtcclxuICAgICAgICBjLnAgPSBjaGFydC5wO1xyXG4gICAgICAgIG91dGxpbmUuYy5wdXNoKGMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgZ091dGxpbmVDb2RlID0ge1xyXG5cclxuICAgIHJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICB1cmw6IHN0cmluZ1xyXG4gICAgKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lVXJsc1t1cmxdID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmVVcmxzW3VybF0gPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nXHJcbiAgICApOiBJUmVuZGVyT3V0bGluZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rpc3BsYXlHdWlkZSB3YXMgbnVsbC4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGd1aWRlID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlO1xyXG4gICAgICAgIGNvbnN0IHJhd091dGxpbmUgPSBvdXRsaW5lUmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGd1aWRlT3V0bGluZSA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgZ3VpZGVPdXRsaW5lLFxyXG4gICAgICAgICAgICBndWlkZS5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBndWlkZS5vdXRsaW5lID0gZ3VpZGVPdXRsaW5lO1xyXG4gICAgICAgIGd1aWRlT3V0bGluZS5yLmlzQ2hhcnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCByb290U2VnbWVudCA9IHNlZ21lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgcm9vdFNlZ21lbnQuc3RhcnQua2V5ID0gZ3VpZGVPdXRsaW5lLnIuaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jYWNoZVNlY3Rpb25Sb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZ3VpZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoZ3VpZGVPdXRsaW5lLnIuYyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIExvYWQgb3V0bGluZSBmcm9tIHRoYXQgbG9jYXRpb24gYW5kIGxvYWQgcm9vdFxyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0IHwgbnVsbCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgICAgICAgICBndWlkZU91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICBndWlkZU91dGxpbmUuci5jXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBndWlkZVJvb3QgPSBndWlkZS5yb290O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFndWlkZVJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjdXJyZW50IGZyYWdtZW50IHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lRnJvbUNoYXJ0X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgICAgICAgICAgICAgZ3VpZGVSb290XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGd1aWRlLnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuZXhwYW5kT3B0aW9uUG9kcyhcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZ3VpZGUucm9vdFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5hdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGd1aWRlLnJvb3RcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBndWlkZU91dGxpbmU7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE91dGxpbmVDaGFydDogKFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGluZGV4OiBudW1iZXJcclxuICAgICk6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmUuYy5sZW5ndGggPiBpbmRleCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG91dGxpbmUuY1tpbmRleF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgYnVpbGREaXNwbGF5Q2hhcnRGcm9tUmF3T3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgcmF3T3V0bGluZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSURpc3BsYXlDaGFydCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBuZXcgRGlzcGxheUNoYXJ0KFxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLmdldEZyZXNoS2V5SW50KHN0YXRlKSxcclxuICAgICAgICAgICAgY2hhcnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgbGluay5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsaW5rLm91dGxpbmUgPSBvdXRsaW5lO1xyXG4gICAgICAgIGxpbmsucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIHBhcmVudC5saW5rID0gbGluaztcclxuXHJcbiAgICAgICAgcmV0dXJuIGxpbms7XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkUG9kRGlzcGxheUNoYXJ0RnJvbVJhd091dGxpbmU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHJhd091dGxpbmU6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElEaXNwbGF5Q2hhcnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBwb2QgPSBuZXcgRGlzcGxheUNoYXJ0KFxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLmdldEZyZXNoS2V5SW50KHN0YXRlKSxcclxuICAgICAgICAgICAgY2hhcnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgcG9kLmxpbmtJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHBvZC5vdXRsaW5lID0gb3V0bGluZTtcclxuICAgICAgICBwb2QucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIHBhcmVudC5wb2QgPSBwb2Q7XHJcblxyXG4gICAgICAgIHJldHVybiBwb2Q7XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdMaW5rOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElEaXNwbGF5Q2hhcnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rID0gbmV3IERpc3BsYXlDaGFydChcclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSksXHJcbiAgICAgICAgICAgIGNoYXJ0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllc0Zvck5ld0xpbmsoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBsaW5rLmxpbmtJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxpbmsub3V0bGluZSA9IG91dGxpbmU7XHJcbiAgICAgICAgbGluay5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgcGFyZW50LmxpbmsgPSBsaW5rO1xyXG5cclxuICAgICAgICByZXR1cm4gbGluaztcclxuICAgIH0sXHJcblxyXG4gICAgYnVpbGREaXNwbGF5Q2hhcnRGcm9tT3V0bGluZUZvck5ld1BvZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiBJRGlzcGxheUNoYXJ0ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcG9kID0gbmV3IERpc3BsYXlDaGFydChcclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSksXHJcbiAgICAgICAgICAgIGNoYXJ0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllc0Zvck5ld1BvZChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIHBvZC5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBwb2Qub3V0bGluZSA9IG91dGxpbmU7XHJcbiAgICAgICAgcG9kLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICBwYXJlbnQucG9kID0gcG9kO1xyXG5cclxuICAgICAgICByZXR1cm4gcG9kO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkU2VnbWVudENoYXJ0T3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudC5saW5rKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYExpbmsgYWxyZWFkeSBsb2FkZWQsIHJvb3RJRDogJHtwYXJlbnQubGluay5yb290Py5pZH1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhd091dGxpbmUgPSBvdXRsaW5lUmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBnT3V0bGluZUNvZGUuYnVpbGREaXNwbGF5Q2hhcnRGcm9tUmF3T3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBwYXJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnU2VnbWVudENvZGUubG9hZExpbmtTZWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VnbWVudEluZGV4LFxyXG4gICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jYWNoZVNlY3Rpb25Sb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAocGFyZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTGluayBhbHJlYWR5IGxvYWRlZCwgcm9vdElEOiAke3BhcmVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmF3T3V0bGluZSA9IG91dGxpbmVSZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgbGluayA9IGdPdXRsaW5lQ29kZS5idWlsZERpc3BsYXlDaGFydEZyb21SYXdPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIHBhcmVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBOZWVkIHRvIGJ1aWxkIGEgZGlzcGxheUNIYXJ0IGhlcmVcclxuICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLnBvc3RHZXRDaGFydE91dGxpbmVSb290X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkUG9kT3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24ucG9kKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYExpbmsgYWxyZWFkeSBsb2FkZWQsIHJvb3RJRDogJHtvcHRpb24ucG9kLnJvb3Q/LmlkfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmF3T3V0bGluZSA9IG91dGxpbmVSZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgcG9kID0gZ091dGxpbmVDb2RlLmJ1aWxkUG9kRGlzcGxheUNoYXJ0RnJvbVJhd091dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jYWNoZVNlY3Rpb25Sb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcG9kXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gLy8gTmVlZCB0byBidWlsZCBhIGRpc3BsYXlDSGFydCBoZXJlXHJcbiAgICAgICAgLy8gZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgIC8vICAgICBzdGF0ZSxcclxuICAgICAgICAvLyAgICAgbGlua1xyXG4gICAgICAgIC8vICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5wb3N0R2V0UG9kT3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcG9kXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcG9zdEdldENoYXJ0T3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc2VjdGlvbi5yb290KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAoIXNlY3Rpb24ucm9vdC51aS5kaXNjdXNzaW9uTG9hZGVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWN0aW9uIHJvb3QgZGlzY3Vzc2lvbiB3YXMgbm90IGxvYWRlZCcpO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lID0gc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2VjdGlvbiBvdXRsaW5lIHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb290RnJhZ21lbklEID0gb3V0bGluZS5yLmk7XHJcbiAgICAgICAgY29uc3QgcGF0aCA9IG91dGxpbmUucGF0aDtcclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3BhdGh9LyR7cm9vdEZyYWdtZW5JRH0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRSb290RnJhZ21lbnRBbmRTZXRTZWxlY3RlZChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYGxvYWRDaGFydE91dGxpbmVSb290YCxcclxuICAgICAgICAgICAgUGFyc2VUeXBlLlRleHQsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBvc3RHZXRQb2RPdXRsaW5lUm9vdF9zdWJzY3JpcHRpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzZWN0aW9uLnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmICghc2VjdGlvbi5yb290LnVpLmRpc2N1c3Npb25Mb2FkZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY3Rpb24gcm9vdCBkaXNjdXNzaW9uIHdhcyBub3QgbG9hZGVkJyk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBzZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWN0aW9uIG91dGxpbmUgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3RGcmFnbWVuSUQgPSBvdXRsaW5lLnIuaTtcclxuICAgICAgICBjb25zdCBwYXRoID0gb3V0bGluZS5wYXRoO1xyXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7cGF0aH0vJHtyb290RnJhZ21lbklEfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRBY3Rpb24gPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZFBvZFJvb3RGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYGxvYWRDaGFydE91dGxpbmVSb290YCxcclxuICAgICAgICAgICAgUGFyc2VUeXBlLlRleHQsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldENoYXJ0QXNDdXJyZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBkaXNwbGF5U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuY3VycmVudFNlY3Rpb24gPSBkaXNwbGF5U2VjdGlvbjtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0T3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZ1xyXG4gICAgKTogSVJlbmRlck91dGxpbmUgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0bGluZTogSVJlbmRlck91dGxpbmUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lc1tmcmFnbWVudEZvbGRlclVybF07XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dGxpbmUgPSBuZXcgUmVuZGVyT3V0bGluZShmcmFnbWVudEZvbGRlclVybCk7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUub3V0bGluZXNbZnJhZ21lbnRGb2xkZXJVcmxdID0gb3V0bGluZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmU7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGdldEZyYWdtZW50TGlua0NoYXJ0T3V0bGluZTogKFxyXG4gICAgLy8gICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAvLyAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgLy8gKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IG91dGxpbmUgPSBmcmFnbWVudC5zZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgLy8gICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm47XHJcbiAgICAvLyAgICAgfVxyXG5cclxuICAgIC8vICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgIC8vICAgICAgICAgZnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAvLyAgICAgICAgIGZyYWdtZW50LmlkXHJcbiAgICAvLyAgICAgKTtcclxuXHJcbiAgICAvLyAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGwpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgY29uc3Qgb3V0bGluZUNoYXJ0ID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVDaGFydChcclxuICAgIC8vICAgICAgICAgb3V0bGluZSxcclxuICAgIC8vICAgICAgICAgb3V0bGluZU5vZGU/LmNcclxuICAgIC8vICAgICApO1xyXG5cclxuICAgIC8vICAgICBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUZyb21DaGFydF9zdWJzY3JpcHRpb24oXHJcbiAgICAvLyAgICAgICAgIHN0YXRlLFxyXG4gICAgLy8gICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAvLyAgICAgICAgIGZyYWdtZW50XHJcbiAgICAvLyAgICAgKTtcclxuICAgIC8vIH0sXHJcblxyXG4gICAgZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBvcHRpb24uc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbi5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgb3B0aW9uLmlkXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGxcclxuICAgICAgICAgICAgfHwgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUgLy8gV2lsbCBsb2FkIGl0IGZyb20gYSBzZWdtZW50XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlPy5jXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRQb2RPdXRsaW5lX3N1YnNjcmlwaW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG9wdGlvbi5wb2RLZXkpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBzZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBvcHRpb24uaWRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGU/LmQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnQgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZT8uZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lRnJvbVBvZF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFNlZ21lbnRPdXRsaW5lX3N1YnNjcmlwdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsLFxyXG4gICAgICAgIGxpbmtGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFjaGFydCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPdXRsaW5lQ2hhcnQgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaW5rRnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExpbmsgcm9vdCBhbHJlYWR5IGxvYWRlZDogJHtsaW5rRnJhZ21lbnQubGluay5yb290Py5pZH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXh0U2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4O1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnRJbmRleCAhPSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudEluZGV4Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnRQYXRoID0gY2hhcnQ/LnAgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gZ1JlbmRlckNvZGUuZ2V0RnJhZ21lbnRGb2xkZXJVcmwob3V0bGluZUNoYXJ0UGF0aCkgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0bGluZSA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmUubG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFsaW5rRnJhZ21lbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5rID0gZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdTZWdtZW50Q29kZS5zZXROZXh0U2VnbWVudFNlY3Rpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0U2VnbWVudEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LmxpbmsgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtnRmlsZUNvbnN0YW50cy5ndWlkZU91dGxpbmVGaWxlbmFtZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRSZXF1ZXN0ZWQgPSBnT3V0bGluZUNvZGUucmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsb2FkUmVxdWVzdGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYWluQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ091dGxpbmVBY3Rpb25zLmxvYWRTZWdtZW50Q2hhcnRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRJbmRleFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwsXHJcbiAgICAgICAgbGlua0ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWNoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ091dGxpbmVDaGFydCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpbmtGcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTGluayByb290IGFscmVhZHkgbG9hZGVkOiAke2xpbmtGcmFnbWVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0UGF0aCA9IGNoYXJ0Py5wIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybCA9IGdSZW5kZXJDb2RlLmdldEZyYWdtZW50Rm9sZGVyVXJsKG91dGxpbmVDaGFydFBhdGgpIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmUgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvdXRsaW5lLmxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbGlua0ZyYWdtZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudC5saW5rIGFzIElEaXNwbGF5U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUucG9zdEdldENoYXJ0T3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudC5saW5rIGFzIElEaXNwbGF5U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkUmVxdWVzdGVkID0gZ091dGxpbmVDb2RlLnJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZFJlcXVlc3RlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFpbkNoYXJ0T3V0bGluZUZpbGVgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGBsb2FkQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICAgICAgICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdPdXRsaW5lQWN0aW9ucy5sb2FkQ2hhcnRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE91dGxpbmVGcm9tUG9kX3N1YnNjcmlwdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsLFxyXG4gICAgICAgIG9wdGlvbkZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWNoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ091dGxpbmVDaGFydCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbkZyYWdtZW50Lmxpbms/LnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMaW5rIHJvb3QgYWxyZWFkeSBsb2FkZWQ6ICR7b3B0aW9uRnJhZ21lbnQubGluay5yb290Py5pZH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVDaGFydFBhdGggPSBjaGFydD8ucCBhcyBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmwgPSBnUmVuZGVyQ29kZS5nZXRGcmFnbWVudEZvbGRlclVybChvdXRsaW5lQ2hhcnRQYXRoKSBhcyBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZSA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZS5sb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghb3B0aW9uRnJhZ21lbnQucG9kKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdQb2QoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25GcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ091dGxpbmVDb2RlLnBvc3RHZXRQb2RPdXRsaW5lUm9vdF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbkZyYWdtZW50LnBvZCBhcyBJRGlzcGxheVNlY3Rpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXF1ZXN0ZWQgPSBnT3V0bGluZUNvZGUucmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHVybFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxvYWRSZXF1ZXN0ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZztcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYWluQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ091dGxpbmVBY3Rpb25zLmxvYWRQb2RPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25GcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkT3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJhd091dGxpbmU6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBsaW5rSUQ6IG51bWJlclxyXG4gICAgKTogSVJlbmRlck91dGxpbmUgPT4ge1xyXG5cclxuICAgICAgICBvdXRsaW5lLnYgPSByYXdPdXRsaW5lLnY7XHJcblxyXG4gICAgICAgIGlmIChyYXdPdXRsaW5lLmNcclxuICAgICAgICAgICAgJiYgQXJyYXkuaXNBcnJheShyYXdPdXRsaW5lLmMpID09PSB0cnVlXHJcbiAgICAgICAgICAgICYmIHJhd091dGxpbmUuYy5sZW5ndGggPiAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGxvYWRDaGFydHMoXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgcmF3T3V0bGluZS5jXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmF3T3V0bGluZS5lKSB7XHJcblxyXG4gICAgICAgICAgICBvdXRsaW5lLmUgPSByYXdPdXRsaW5lLmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvdXRsaW5lLnIgPSBsb2FkTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUucixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgb3V0bGluZS5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIG91dGxpbmUuci5pc1Jvb3QgPSB0cnVlO1xyXG4gICAgICAgIG91dGxpbmUubXYgPSByYXdPdXRsaW5lLm12O1xyXG5cclxuICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZE91dGxpbmVQcm9wZXJ0aWVzRm9yTmV3TGluazogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXJcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjYWNoZU5vZGVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZS5yLFxyXG4gICAgICAgICAgICBsaW5rSURcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkT3V0bGluZVByb3BlcnRpZXNGb3JOZXdQb2Q6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3UG9kKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZS5yLFxyXG4gICAgICAgICAgICBsaW5rSURcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ091dGxpbmVDb2RlO1xyXG5cclxuIiwiXHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCB7IElIdHRwRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEZldGNoSXRlbVwiO1xyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4uL2h0dHAvZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcblxyXG5cclxuY29uc3QgZ2V0RnJhZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgZnJhZ21lbnRQYXRoOiBzdHJpbmcsXHJcbiAgICBhY3Rpb246IEFjdGlvblR5cGUsXHJcbiAgICBsb2FkQWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGNhbGxJRCxcclxuICAgICAgICBhY3Rpb25cclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudFBhdGh9YDtcclxuXHJcbiAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBwYXJzZVR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzcG9uc2U6ICd0ZXh0JyxcclxuICAgICAgICBhY3Rpb246IGxvYWRBY3Rpb24sXHJcbiAgICAgICAgZXJyb3I6IChzdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgZnJhZ21lbnQgZnJvbSB0aGUgc2VydmVyLCBwYXRoOiAke2ZyYWdtZW50UGF0aH0sIGlkOiAke2ZyYWdtZW50SUR9XCIsXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z2V0RnJhZ21lbnR9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICBhbGVydChge1xyXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgZ2V0dGluZyBmcmFnbWVudCBmcm9tIHRoZSBzZXJ2ZXIsIHBhdGg6ICR7ZnJhZ21lbnRQYXRofSwgaWQ6ICR7ZnJhZ21lbnRJRH1cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRGcmFnbWVudC5uYW1lfSxcclxuICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGdGcmFnbWVudEVmZmVjdHMgPSB7XHJcblxyXG4gICAgZ2V0RnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGZyYWdtZW50UGF0aDogc3RyaW5nXHJcbiAgICApOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRBY3Rpb246IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGUgPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBnRnJhZ21lbnRBY3Rpb25zLmxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIG5ld1N0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ld1N0YXRlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbi5pZCxcclxuICAgICAgICAgICAgZnJhZ21lbnRQYXRoLFxyXG4gICAgICAgICAgICBBY3Rpb25UeXBlLkdldEZyYWdtZW50LFxyXG4gICAgICAgICAgICBsb2FkQWN0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdGcmFnbWVudEVmZmVjdHM7XHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnT3V0bGluZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ091dGxpbmVDb2RlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4uL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdGcmFnbWVudEVmZmVjdHMgZnJvbSBcIi4uL2VmZmVjdHMvZ0ZyYWdtZW50RWZmZWN0c1wiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcblxyXG5cclxuY29uc3QgZ2V0RnJhZ21lbnRGaWxlID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBzdGF0ZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmhpZGVCYW5uZXIgPSB0cnVlO1xyXG4gICAgY29uc3QgZnJhZ21lbnRQYXRoID0gYCR7b3B0aW9uLnNlY3Rpb24/Lm91dGxpbmU/LnBhdGh9LyR7b3B0aW9uLmlkfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnRnJhZ21lbnRFZmZlY3RzLmdldEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICBmcmFnbWVudFBhdGhcclxuICAgICAgICApXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0NoYWluRnJhZ21lbnRUeXBlID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGxcclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGlmIChmcmFnbWVudCkge1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBpZCBhbmQgb3V0bGluZSBmcmFnbWVudCBpZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlLnR5cGUgPT09IE91dGxpbmVUeXBlLkxpbmspIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NMaW5rKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS50eXBlID09PSBPdXRsaW5lVHlwZS5FeGl0KSB7XHJcblxyXG4gICAgICAgICAgICBwcm9jZXNzRXhpdChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob3V0bGluZU5vZGUuaXNDaGFydCA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAmJiBvdXRsaW5lTm9kZS5pc1Jvb3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NDaGFydFJvb3QoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS5pc0xhc3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NMYXN0KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS50eXBlID09PSBPdXRsaW5lVHlwZS5Ob2RlKSB7XHJcblxyXG4gICAgICAgICAgICBwcm9jZXNzTm9kZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBmcmFnbWVudCB0eXBlLicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yTGFzdEZyYWdtZW50RXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBsYXN0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gb3V0bGluZSBub2RlIGlkIGFuZCBmcmFnbWVudCBpZCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JOb2RlRXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBub2RlXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rJyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUV4aXRLZXkpKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSBub2RlIC0gZXhpdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gb3V0bGluZSBub2RlIGlkIGFuZCBmcmFnbWVudCBpZCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JDaGFydFJvb3RFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gcm9vdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSByb290IC0gbGluaycpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlFeGl0S2V5KSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgcm9vdCAtIGV4aXQnKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yRXhpdEVycm9ycyA9IChcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gZXhpdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBvdXQgc2VjdGlvbiB3YXMgbnVsbCAtIGV4aXRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmV4aXRLZXkpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSAtIGV4aXQnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHNlZ21lbnQuZW5kLnR5cGUgIT09IE91dGxpbmVUeXBlLkV4aXQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBleGl0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzQ2hhcnRSb290ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNoZWNrRm9yQ2hhcnRSb290RXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5sb2FkTmV4dENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBzZXRMaW5rc1Jvb3QoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHNldExpbmtzUm9vdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBpblNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRJblNlY3Rpb247XHJcblxyXG4gICAgaWYgKCFpblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsIC0gY2hhcnQgcm9vdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuXHJcbiAgICBpZiAoIXNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gY2hhcnQgcm9vdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBpblNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgIHNlZ21lbnQuc3RhcnQua2V5XHJcbiAgICApO1xyXG5cclxuICAgIGlmIChwYXJlbnQ/LmxpbmspIHtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudC5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBhbmQgRnJhZ21lbnQgYXJlIHRoZSBzYW1lXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGFyZW50Lmxpbmsucm9vdCA9IGZyYWdtZW50O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudEZyYWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlY3Rpb24uY3VycmVudCA9IGZyYWdtZW50O1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc05vZGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNoZWNrRm9yTm9kZUVycm9ycyhcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGdGcmFnbWVudENvZGUubG9hZE5leHRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgcHJvY2Vzc0ZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0xhc3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNoZWNrRm9yTGFzdEZyYWdtZW50RXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgcHJvY2Vzc0ZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGZyYWdtZW50LmxpbmsgPSBudWxsO1xyXG4gICAgZnJhZ21lbnQuc2VsZWN0ZWQgPSBudWxsO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5vcHRpb25zPy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLm9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzTGluayA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0bGluZSA9IGZyYWdtZW50LnNlY3Rpb24ub3V0bGluZTtcclxuXHJcbiAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmlzUm9vdCA9PT0gdHJ1ZVxyXG4gICAgICAgICYmIG91dGxpbmVOb2RlLmlzQ2hhcnQgPT09IHRydWVcclxuICAgICkge1xyXG4gICAgICAgIHNldExpbmtzUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdXRsaW5lQ2hhcnQgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUNoYXJ0KFxyXG4gICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgb3V0bGluZU5vZGU/LmNcclxuICAgICk7XHJcblxyXG4gICAgZ091dGxpbmVDb2RlLmdldFNlZ21lbnRPdXRsaW5lX3N1YnNjcmlwdGlvbihcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgc2VnbWVudC5pbmRleFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NFeGl0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZXhpdEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JFeGl0RXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgZXhpdEZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNlY3Rpb246IElEaXNwbGF5Q2hhcnQgPSBleGl0RnJhZ21lbnQuc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0O1xyXG4gICAgY29uc3Qgc2VjdGlvblBhcmVudCA9IHNlY3Rpb24ucGFyZW50O1xyXG5cclxuICAgIGlmICghc2VjdGlvblBhcmVudCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJRGlzcGxheUNoYXJ0IHBhcmVudCBpcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlFeGl0S2V5ID0gZXhpdEZyYWdtZW50LmV4aXRLZXk7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2Ygc2VjdGlvblBhcmVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24uaUV4aXRLZXkgPT09IGlFeGl0S2V5KSB7XHJcblxyXG4gICAgICAgICAgICBnU2VnbWVudENvZGUubG9hZEV4aXRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LmluZGV4LFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLmlkXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEN1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGV4aXRGcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGxvYWRGcmFnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByZXNwb25zZTogYW55LFxyXG4gICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuKTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgY29uc3QgcGFyZW50RnJhZ21lbnRJRCA9IG9wdGlvbi5wYXJlbnRGcmFnbWVudElEIGFzIHN0cmluZztcclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UocGFyZW50RnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGZyYWdtZW50IElEIGlzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVuZGVyRnJhZ21lbnQgPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgb3B0aW9uLmlkLFxyXG4gICAgICAgIG9wdGlvbi5zZWN0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIHN0YXRlLmxvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICByZXR1cm4gcmVuZGVyRnJhZ21lbnQ7XHJcbn07XHJcblxyXG5jb25zdCBsb2FkUG9kRnJhZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmVzcG9uc2U6IGFueSxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgIGNvbnN0IHBhcmVudEZyYWdtZW50SUQgPSBvcHRpb24ucGFyZW50RnJhZ21lbnRJRCBhcyBzdHJpbmc7XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKHBhcmVudEZyYWdtZW50SUQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBmcmFnbWVudCBJRCBpcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlbmRlckZyYWdtZW50ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRQb2RGcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICByZXNwb25zZS50ZXh0RGF0YSxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgIG9wdGlvbi5pZCxcclxuICAgICAgICBvcHRpb24uc2VjdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIHJlbmRlckZyYWdtZW50O1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0ZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZXhwYW5kZWRPcHRpb246IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIGxldCBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgZnJhZ21lbnQucGFyZW50RnJhZ21lbnRJRFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIXBhcmVudEZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHBhcmVudEZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIGV4cGFuZGVkT3B0aW9uID0gb3B0aW9uO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChleHBhbmRlZE9wdGlvbikge1xyXG5cclxuICAgICAgICBleHBhbmRlZE9wdGlvbi51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuc2hvd09wdGlvbk5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudCxcclxuICAgICAgICAgICAgZXhwYW5kZWRPcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgZ0ZyYWdtZW50QWN0aW9ucyA9IHtcclxuXHJcbiAgICBzaG93QW5jaWxsYXJ5Tm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgLy8gcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAvLyBpZiAoYW5jaWxsYXJ5LnVpLmRpc2N1c3Npb25Mb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgLy8gICAgIGdGcmFnbWVudENvZGUuYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uKFxyXG4gICAgICAgIC8vICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgLy8gICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICAvLyAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gICAgIGlmICghYW5jaWxsYXJ5LmxpbmspIHtcclxuXHJcbiAgICAgICAgLy8gICAgICAgICBnT3V0bGluZUNvZGUuZ2V0RnJhZ21lbnRMaW5rQ2hhcnRPdXRsaW5lKFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgIC8vICAgICAgICAgKTtcclxuICAgICAgICAvLyAgICAgfVxyXG5cclxuICAgICAgICAvLyAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICByZXR1cm4gZ2V0RnJhZ21lbnRGaWxlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgLy8gZm9yIChjb25zdCBjaGlsZCBvZiBwYXJlbnRGcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIC8vICAgICBjaGlsZC51aS5kaXNjdXNzaW9uTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyUGFyZW50U2VjdGlvblNlbGVjdGVkKHBhcmVudEZyYWdtZW50LnNlY3Rpb24pO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJPcnBoYW5lZFN0ZXBzKHBhcmVudEZyYWdtZW50KTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5wcmVwYXJlVG9TaG93T3B0aW9uTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIGlmIChvcHRpb24udWkuZGlzY3Vzc2lvbkxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAvLyAgICAgZ0ZyYWdtZW50Q29kZS5hdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb24oXHJcbiAgICAgICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgICAgICAvLyAgICAgICAgIG9wdGlvblxyXG4gICAgICAgIC8vICAgICApO1xyXG5cclxuICAgICAgICAvLyAgICAgaWYgKCFvcHRpb24ubGluaykge1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIGdPdXRsaW5lQ29kZS5nZXRGcmFnbWVudExpbmtDaGFydE91dGxpbmUoXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgLy8gICAgICAgICApO1xyXG4gICAgICAgIC8vICAgICB9XHJcblxyXG4gICAgICAgIC8vICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRGcmFnbWVudEZpbGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGVcclxuICAgICAgICAgICAgfHwgVS5pc051bGxPcldoaXRlU3BhY2Uob3B0aW9uLmlkKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRGcmFnbWVudEFuZFNldFNlbGVjdGVkOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBsb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuc2V0Q3VycmVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgbm9kZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvblRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlLm9wdGlvbiA9IG9wdGlvblRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQpIHtcclxuXHJcbiAgICAgICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRQb2RGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBub2RlID0gbG9hZFBvZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChub2RlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnNldFBvZEN1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5vZGVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25UZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZS5vcHRpb24gPSBvcHRpb25UZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkKSB7XHJcblxyXG4gICAgICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkUm9vdEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGVJRCA9IHNlY3Rpb24ub3V0bGluZT8uci5pO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlSUQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlbmRlckZyYWdtZW50ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgICAgICBcInJvb3RcIixcclxuICAgICAgICAgICAgb3V0bGluZU5vZGVJRCxcclxuICAgICAgICAgICAgc2VjdGlvbixcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChyZW5kZXJGcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuc2VjdGlvbi5yb290ID0gcmVuZGVyRnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LnNlY3Rpb24uY3VycmVudCA9IHJlbmRlckZyYWdtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkUG9kUm9vdEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55LFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlSUQgPSBzZWN0aW9uLm91dGxpbmU/LnIuaTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lTm9kZUlEKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZW5kZXJGcmFnbWVudCA9IGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkUG9kRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZS50ZXh0RGF0YSxcclxuICAgICAgICAgICAgXCJyb290XCIsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlSUQsXHJcbiAgICAgICAgICAgIHNlY3Rpb24sXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAocmVuZGVyRnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LnNlY3Rpb24ucm9vdCA9IHJlbmRlckZyYWdtZW50O1xyXG4gICAgICAgICAgICByZW5kZXJGcmFnbWVudC5zZWN0aW9uLmN1cnJlbnQgPSByZW5kZXJGcmFnbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZENoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKCFzZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIGlzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcGFyZW50RnJhZ21lbnRJRCA9IG91dGxpbmVOb2RlLnBhcmVudD8uaSBhcyBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZS5pc1Jvb3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghb3V0bGluZU5vZGUuaXNDaGFydCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQgPSBcImd1aWRlUm9vdFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCA9IFwicm9vdFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKHBhcmVudEZyYWdtZW50SUQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgZnJhZ21lbnQgSUQgaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdDogeyBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LCBjb250aW51ZUxvYWRpbmc6IGJvb2xlYW4gfSA9IGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkRnJhZ21lbnRCYXNlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UudGV4dERhdGEsXHJcbiAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlLmksXHJcbiAgICAgICAgICAgIHNlZ21lbnRTZWN0aW9uLFxyXG4gICAgICAgICAgICBzZWdtZW50LmluZGV4XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSByZXN1bHQuZnJhZ21lbnQ7XHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SURcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHNlZ21lbnRTZWN0aW9uLmN1cnJlbnQgPSBmcmFnbWVudDtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJlbnRGcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRGcmFnbWVudC5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50RnJhZ21lbnQgYW5kIEZyYWdtZW50IGFyZSB0aGUgc2FtZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRGcmFnbWVudC5zZWxlY3RlZCA9IGZyYWdtZW50O1xyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQudWkuc2VjdGlvbkluZGV4ID0gcGFyZW50RnJhZ21lbnQudWkuc2VjdGlvbkluZGV4ICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NDaGFpbkZyYWdtZW50VHlwZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZyYWdtZW50QWN0aW9ucztcclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcblxyXG5cclxuY29uc3QgZ0hvb2tSZWdpc3RyeUNvZGUgPSB7XHJcblxyXG4gICAgZXhlY3V0ZVN0ZXBIb29rOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzdGVwOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCF3aW5kb3cuSG9va1JlZ2lzdHJ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5Ib29rUmVnaXN0cnkuZXhlY3V0ZVN0ZXBIb29rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc3RlcFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnSG9va1JlZ2lzdHJ5Q29kZTtcclxuXHJcbiIsImltcG9ydCB7IFBhcnNlVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgSUNoYWluU2VnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0hpc3RvcnlDb2RlIGZyb20gXCIuL2dIaXN0b3J5Q29kZVwiO1xyXG5pbXBvcnQgZ0hvb2tSZWdpc3RyeUNvZGUgZnJvbSBcIi4vZ0hvb2tSZWdpc3RyeUNvZGVcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi9nT3V0bGluZUNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4vZ1N0YXRlQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdldFZhcmlhYmxlVmFsdWUgPSAoXHJcbiAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICB2YXJpYWJsZVZhbHVlczogYW55LFxyXG4gICAgdmFyaWFibGVOYW1lOiBzdHJpbmdcclxuKTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgbGV0IHZhbHVlID0gdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXTtcclxuXHJcbiAgICBpZiAodmFsdWUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHNlY3Rpb24ub3V0bGluZT8ubXY/Llt2YXJpYWJsZU5hbWVdO1xyXG5cclxuICAgIGlmIChjdXJyZW50VmFsdWUpIHtcclxuXHJcbiAgICAgICAgdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXSA9IGN1cnJlbnRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbmNlc3RvclZhcmlhYmxlVmFsdWUoXHJcbiAgICAgICAgc2VjdGlvbixcclxuICAgICAgICB2YXJpYWJsZVZhbHVlcyxcclxuICAgICAgICB2YXJpYWJsZU5hbWVcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZhcmlhYmxlVmFsdWVzW3ZhcmlhYmxlTmFtZV0gPz8gbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IGdldEFuY2VzdG9yVmFyaWFibGVWYWx1ZSA9IChcclxuICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgIHZhcmlhYmxlVmFsdWVzOiBhbnksXHJcbiAgICB2YXJpYWJsZU5hbWU6IHN0cmluZ1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBjaGFydCA9IHNlY3Rpb24gYXMgSURpc3BsYXlDaGFydDtcclxuICAgIGNvbnN0IHBhcmVudCA9IGNoYXJ0LnBhcmVudD8uc2VjdGlvbjtcclxuXHJcbiAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXJlbnRWYWx1ZSA9IHBhcmVudC5vdXRsaW5lPy5tdj8uW3ZhcmlhYmxlTmFtZV07XHJcblxyXG4gICAgaWYgKHBhcmVudFZhbHVlKSB7XHJcblxyXG4gICAgICAgIHZhcmlhYmxlVmFsdWVzW3ZhcmlhYmxlTmFtZV0gPSBwYXJlbnRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRBbmNlc3RvclZhcmlhYmxlVmFsdWUoXHJcbiAgICAgICAgcGFyZW50LFxyXG4gICAgICAgIHZhcmlhYmxlVmFsdWVzLFxyXG4gICAgICAgIHZhcmlhYmxlTmFtZVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yVmFyaWFibGVzID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGZyYWdtZW50LnZhbHVlO1xyXG4gICAgY29uc3QgdmFyaWFibGVSZWZQYXR0ZXJuID0gL+OAiMKm4oC5KD88dmFyaWFibGVOYW1lPlte4oC6wqZdKynigLrCpuOAiS9nbXU7XHJcbiAgICBjb25zdCBtYXRjaGVzID0gdmFsdWUubWF0Y2hBbGwodmFyaWFibGVSZWZQYXR0ZXJuKTtcclxuICAgIGxldCB2YXJpYWJsZU5hbWU6IHN0cmluZztcclxuICAgIGxldCB2YXJpYWJsZVZhbHVlczogYW55ID0ge307XHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICBsZXQgbWFya2VyID0gMDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIG1hdGNoZXMpIHtcclxuXHJcbiAgICAgICAgaWYgKG1hdGNoXHJcbiAgICAgICAgICAgICYmIG1hdGNoLmdyb3Vwc1xyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxXHJcbiAgICAgICAgICAgICYmIG1hdGNoLmluZGV4ICE9IG51bGxcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgdmFyaWFibGVOYW1lID0gbWF0Y2guZ3JvdXBzLnZhcmlhYmxlTmFtZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHZhcmlhYmxlVmFsdWUgPSBnZXRWYXJpYWJsZVZhbHVlKFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuc2VjdGlvbixcclxuICAgICAgICAgICAgICAgIHZhcmlhYmxlVmFsdWVzLFxyXG4gICAgICAgICAgICAgICAgdmFyaWFibGVOYW1lXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhcmlhYmxlVmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFZhcmlhYmxlOiAke3ZhcmlhYmxlTmFtZX0gY291bGQgbm90IGJlIGZvdW5kYCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCArXHJcbiAgICAgICAgICAgICAgICB2YWx1ZS5zdWJzdHJpbmcobWFya2VyLCBtYXRjaC5pbmRleCkgK1xyXG4gICAgICAgICAgICAgICAgdmFyaWFibGVWYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIG1hcmtlciA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bHQgPSByZXN1bHQgK1xyXG4gICAgICAgIHZhbHVlLnN1YnN0cmluZyhtYXJrZXIsIHZhbHVlLmxlbmd0aCk7XHJcblxyXG4gICAgZnJhZ21lbnQudmFsdWUgPSByZXN1bHQ7XHJcbn07XHJcblxyXG5jb25zdCBjbGVhclNpYmxpbmdDaGFpbnMgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgcGFyZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi5pZCAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIGNsZWFyRnJhZ21lbnRDaGFpbnMob3B0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjbGVhckZyYWdtZW50Q2hhaW5zID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhckZyYWdtZW50Q2hhaW5zKGZyYWdtZW50Lmxpbms/LnJvb3QpO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgY2xlYXJGcmFnbWVudENoYWlucyhvcHRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZyYWdtZW50LnNlbGVjdGVkID0gbnVsbDtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICBmcmFnbWVudC5saW5rLnJvb3Quc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbG9hZE9wdGlvbiA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByYXdPcHRpb246IGFueSxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsLFxyXG4gICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uLFxyXG4gICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgc2VnbWVudEluZGV4OiBudW1iZXIgfCBudWxsXHJcbik6IElSZW5kZXJGcmFnbWVudCA9PiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uID0gbmV3IFJlbmRlckZyYWdtZW50KFxyXG4gICAgICAgIHJhd09wdGlvbi5pZCxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgIHNlY3Rpb24sXHJcbiAgICAgICAgc2VnbWVudEluZGV4XHJcbiAgICApO1xyXG5cclxuICAgIG9wdGlvbi5vcHRpb24gPSByYXdPcHRpb24ub3B0aW9uID8/ICcnO1xyXG4gICAgb3B0aW9uLmlzQW5jaWxsYXJ5ID0gcmF3T3B0aW9uLmlzQW5jaWxsYXJ5ID09PSB0cnVlO1xyXG4gICAgb3B0aW9uLm9yZGVyID0gcmF3T3B0aW9uLm9yZGVyID8/IDA7XHJcbiAgICBvcHRpb24uaUV4aXRLZXkgPSByYXdPcHRpb24uaUV4aXRLZXkgPz8gJyc7XHJcbiAgICBvcHRpb24ucG9kS2V5ID0gcmF3T3B0aW9uLnBvZEtleSA/PyAnJztcclxuICAgIG9wdGlvbi5wb2RUZXh0ID0gcmF3T3B0aW9uLnBvZFRleHQgPz8gJyc7XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3V0bGluZU9wdGlvbiBvZiBvdXRsaW5lTm9kZS5vKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAob3V0bGluZU9wdGlvbi5pID09PSBvcHRpb24uaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmVPcHRpb25cclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ1N0YXRlQ29kZS5jYWNoZV9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIG9wdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBnT3V0bGluZUNvZGUuZ2V0UG9kT3V0bGluZV9zdWJzY3JpcGlvbihcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgc2VjdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gb3B0aW9uO1xyXG59O1xyXG5cclxuY29uc3Qgc2hvd1BsdWdfc3Vic2NyaXB0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGV4aXQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvblRleHQ6IHN0cmluZ1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBzZWN0aW9uOiBJRGlzcGxheUNoYXJ0ID0gZXhpdC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICBjb25zdCBwYXJlbnQgPSBzZWN0aW9uLnBhcmVudDtcclxuXHJcbiAgICBpZiAoIXBhcmVudCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJRGlzcGxheUNoYXJ0IHBhcmVudCBpcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGlFeGl0S2V5ID0gZXhpdC5leGl0S2V5O1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHBhcmVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24uaUV4aXRLZXkgPT09IGlFeGl0S2V5KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2hvd09wdGlvbk5vZGVfc3Vic2NyaXB0b24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIG9wdGlvblRleHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBzaG93T3B0aW9uTm9kZV9zdWJzY3JpcHRvbiA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghb3B0aW9uXHJcbiAgICAgICAgfHwgIW9wdGlvbi5zZWN0aW9uPy5vdXRsaW5lPy5wYXRoXHJcbiAgICApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5wcmVwYXJlVG9TaG93T3B0aW9uTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb25cclxuICAgICk7XHJcblxyXG4gICAgLy8gaWYgKG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIHJldHVybiBnRnJhZ21lbnRDb2RlLmdldEZyYWdtZW50QW5kTGlua091dGxpbmVfc3Vic2NyaXBpb24oXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgIG9wdGlvblRleHQsXHJcbiAgICApO1xyXG59O1xyXG5cclxuLy8gY29uc3Qgc2hvd1BvZE9wdGlvbk5vZGVfc3Vic2NyaXB0b24gPSAoXHJcbi8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4vLyAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbi8vICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbFxyXG4vLyApOiB2b2lkID0+IHtcclxuXHJcbi8vICAgICBpZiAoIW9wdGlvblxyXG4vLyAgICAgICAgIHx8ICFvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aFxyXG4vLyAgICAgKSB7XHJcbi8vICAgICAgICAgcmV0dXJuO1xyXG4vLyAgICAgfVxyXG5cclxuLy8gICAgIGdGcmFnbWVudENvZGUucHJlcGFyZVRvU2hvd1BvZE9wdGlvbk5vZGUoXHJcbi8vICAgICAgICAgc3RhdGUsXHJcbi8vICAgICAgICAgb3B0aW9uXHJcbi8vICAgICApO1xyXG5cclxuLy8gICAgIHJldHVybiBnRnJhZ21lbnRDb2RlLmdldFBvZEZyYWdtZW50X3N1YnNjcmlwaW9uKFxyXG4vLyAgICAgICAgIHN0YXRlLFxyXG4vLyAgICAgICAgIG9wdGlvbixcclxuLy8gICAgICAgICBvcHRpb25UZXh0LFxyXG4vLyAgICAgKTtcclxuLy8gfTtcclxuXHJcbmNvbnN0IGxvYWROZXh0RnJhZ21lbnRJblNlZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBuZXh0T3V0bGluZU5vZGUgPSBnU2VnbWVudENvZGUuZ2V0TmV4dFNlZ21lbnRPdXRsaW5lTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGlmICghbmV4dE91dGxpbmVOb2RlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbj8ub3V0bGluZT8ucGF0aDtcclxuICAgIGNvbnN0IHVybCA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke25leHRPdXRsaW5lTm9kZS5pfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgIG5leHRPdXRsaW5lTm9kZVxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBgbG9hZENoYWluRnJhZ21lbnRgLFxyXG4gICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgIHVybCxcclxuICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnRnJhZ21lbnRDb2RlID0ge1xyXG5cclxuICAgIGxvYWROZXh0Q2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc2VnbWVudC5vdXRsaW5lTm9kZXMubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgbG9hZE5leHRGcmFnbWVudEluU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdTZWdtZW50Q29kZS5sb2FkTmV4dFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoYXNPcHRpb246IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbklEOiBzdHJpbmdcclxuICAgICk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBmcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9uLmlkID09PSBvcHRpb25JRCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrU2VsZWN0ZWQ6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQuc2VsZWN0ZWQ/LmlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ0ZyYWdtZW50Q29kZS5oYXNPcHRpb24oZnJhZ21lbnQsIGZyYWdtZW50LnNlbGVjdGVkPy5pZCkpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlbGVjdGVkIGhhcyBiZWVuIHNldCB0byBmcmFnbWVudCB0aGF0IGlzbid0IGFuIG9wdGlvblwiKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyUGFyZW50U2VjdGlvblNlbGVjdGVkOiAoZGlzcGxheUNoYXJ0OiBJRGlzcGxheVNlY3Rpb24pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gKGRpc3BsYXlDaGFydCBhcyBJRGlzcGxheUNoYXJ0KS5wYXJlbnQ7XHJcblxyXG4gICAgICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJQYXJlbnRTZWN0aW9uT3JwaGFuZWRTdGVwcyhwYXJlbnQpO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJQYXJlbnRTZWN0aW9uU2VsZWN0ZWQocGFyZW50LnNlY3Rpb24gYXMgSURpc3BsYXlDaGFydCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyUGFyZW50U2VjdGlvbk9ycGhhbmVkU3RlcHM6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJPcnBoYW5lZFN0ZXBzKGZyYWdtZW50LnNlbGVjdGVkKTtcclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyT3JwaGFuZWRTdGVwczogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhck9ycGhhbmVkU3RlcHMoZnJhZ21lbnQubGluaz8ucm9vdCk7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhck9ycGhhbmVkU3RlcHMoZnJhZ21lbnQuc2VsZWN0ZWQpO1xyXG5cclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgZnJhZ21lbnQubGluayA9IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyYWdtZW50QW5kTGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsLFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIC8vIGlmIChvcHRpb24udWkuZGlzY3Vzc2lvbkxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAvLyAgICAgdGhyb3cgbmV3IEVycm9yKCdEaXNjdXNzaW9uIHdhcyBhbHJlYWR5IGxvYWRlZCcpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaGlkZUJhbm5lciA9IHRydWU7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5nZXRMaW5rT3V0bGluZV9zdWJzY3JpcGlvbihcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke29wdGlvbi5zZWN0aW9uPy5vdXRsaW5lPy5wYXRofS8ke29wdGlvbi5pZH0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkgPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uVGV4dFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGBsb2FkRnJhZ21lbnRGaWxlYCxcclxuICAgICAgICAgICAgUGFyc2VUeXBlLlRleHQsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFBvZEZyYWdtZW50X3N1YnNjcmlwaW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5oaWRlQmFubmVyID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aH0vJHtvcHRpb24uaWR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5ID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRQb2RGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25UZXh0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYGxvYWRGcmFnbWVudEZpbGVgLFxyXG4gICAgICAgICAgICBQYXJzZVR5cGUuVGV4dCxcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBsb2FkQWN0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgIC8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgLy8gICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgLy8gKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IG91dGxpbmUgPSBvcHRpb24uc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgIC8vICAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgIC8vICAgICAgICAgc3RhdGUsXHJcbiAgICAvLyAgICAgICAgIG9wdGlvbi5zZWN0aW9uLmxpbmtJRCxcclxuICAgIC8vICAgICAgICAgb3B0aW9uLmlkXHJcbiAgICAvLyAgICAgKTtcclxuXHJcbiAgICAvLyAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGxcclxuICAgIC8vICAgICAgICAgfHwgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUgLy8gV2lsbCBsb2FkIGl0IGZyb20gYSBzZWdtZW50XHJcbiAgICAvLyAgICAgKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybjtcclxuICAgIC8vICAgICB9XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAvLyAgICAgICAgIG91dGxpbmUsXHJcbiAgICAvLyAgICAgICAgIG91dGxpbmVOb2RlPy5jXHJcbiAgICAvLyAgICAgKTtcclxuXHJcbiAgICAvLyAgICAgZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uKFxyXG4gICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgIC8vICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgLy8gICAgICAgICBvcHRpb25cclxuICAgIC8vICAgICApO1xyXG4gICAgLy8gfSxcclxuXHJcbiAgICBnZXRMaW5rRWxlbWVudElEOiAoZnJhZ21lbnRJRDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGBudF9sa19mcmFnXyR7ZnJhZ21lbnRJRH1gO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmFnbWVudEVsZW1lbnRJRDogKGZyYWdtZW50SUQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgbnRfZnJfZnJhZ18ke2ZyYWdtZW50SUR9YDtcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGFyZVRvU2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5tYXJrT3B0aW9uc0V4cGFuZGVkKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0hpc3RvcnlDb2RlLnB1c2hCcm93c2VySGlzdG9yeVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGFyZVRvU2hvd1BvZE9wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5tYXJrT3B0aW9uc0V4cGFuZGVkKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRQb2RDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVOb2RlSUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQ6IHsgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCwgY29udGludWVMb2FkaW5nOiBib29sZWFuIH0gPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlELFxyXG4gICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSByZXN1bHQuZnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQuY29udGludWVMb2FkaW5nID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZyYWdtZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkUG9kRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVOb2RlSUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQ6IHsgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCwgY29udGludWVMb2FkaW5nOiBib29sZWFuIH0gPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlELFxyXG4gICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSByZXN1bHQuZnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQuY29udGludWVMb2FkaW5nID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICAgICAgb3V0bGluZU5vZGVJRDogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGwgPSBudWxsXHJcbiAgICApOiB7IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsIGNvbnRpbnVlTG9hZGluZzogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzZWN0aW9uLm91dGxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3B0aW9uIHNlY3Rpb24gb3V0bGluZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmF3RnJhZ21lbnQgPSBnRnJhZ21lbnRDb2RlLnBhcnNlRnJhZ21lbnQocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICBpZiAoIXJhd0ZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JhdyBmcmFnbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlSUQgIT09IHJhd0ZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByYXdGcmFnbWVudCBpZCBkb2VzIG5vdCBtYXRjaCB0aGUgb3V0bGluZU5vZGVJRCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgZnJhZ21lbnQgPSBuZXcgUmVuZGVyRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICByYXdGcmFnbWVudC5pZCxcclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgICAgICAgICBzZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29udGludWVMb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGlmICghZnJhZ21lbnQudWkuZGlzY3Vzc2lvbkxvYWRlZCkge1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50LFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuY2FjaGVfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29udGludWVMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBjb250aW51ZUxvYWRpbmdcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBhdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBvcHRpb25zQW5kQW5jaWxsYXJpZXMgPSBnRnJhZ21lbnRDb2RlLnNwbGl0T3B0aW9uc0FuZEFuY2lsbGFyaWVzKGZyYWdtZW50Lm9wdGlvbnMpO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zWzBdLm9wdGlvbiA9PT0gJydcclxuICAgICAgICAgICAgJiYgVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSlcclxuICAgICAgICAgICAgJiYgVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5pZFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5jICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNob3dPcHRpb25Ob2RlX3N1YnNjcmlwdG9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zQW5kQW5jaWxsYXJpZXMub3B0aW9uc1swXVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZW4gZmluZCB0aGUgcGFyZW50IG9wdGlvbiB3aXRoIGFuIGlFeGl0S2V5IHRoYXQgbWF0Y2hlcyB0aGlzIGV4aXRLZXlcclxuICAgICAgICAgICAgc2hvd1BsdWdfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50Lm9wdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZXhwYW5kT3B0aW9uUG9kczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24uc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24uaWRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvdXRsaW5lTm9kZT8uZCA9PSBudWxsXHJcbiAgICAgICAgICAgICAgICB8fCBvcHRpb24ucG9kICE9IG51bGxcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5nZXRQb2RPdXRsaW5lX3N1YnNjcmlwaW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBvcHRpb24uc2VjdGlvblxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gcmV0dXJuIHNob3dQb2RPcHRpb25Ob2RlX3N1YnNjcmlwdG9uKFxyXG4gICAgICAgICAgICAvLyAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIC8vICAgICBvcHRpb25cclxuICAgICAgICAgICAgLy8gKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNhY2hlU2VjdGlvblJvb3Q6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGRpc3BsYXlTZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWRpc3BsYXlTZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3RGcmFnbWVudCA9IGRpc3BsYXlTZWN0aW9uLnJvb3Q7XHJcblxyXG4gICAgICAgIGlmICghcm9vdEZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuY2FjaGVfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJvb3RGcmFnbWVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGRpc3BsYXlTZWN0aW9uLmN1cnJlbnQgPSBkaXNwbGF5U2VjdGlvbi5yb290O1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiByb290RnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5jYWNoZV9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGVsZW1lbnRJc1BhcmFncmFwaDogKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgbGV0IHRyaW1tZWQgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZSh0cmltbWVkKSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHRyaW1tZWQubGVuZ3RoID4gMjApIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0cmltbWVkID0gdHJpbW1lZC5zdWJzdHJpbmcoMCwgMjApO1xyXG4gICAgICAgICAgICAgICAgdHJpbW1lZCA9IHRyaW1tZWQucmVwbGFjZSgvXFxzL2csICcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnPHA+JykgPT09IHRydWVcclxuICAgICAgICAgICAgJiYgdHJpbW1lZFszXSAhPT0gJzwnKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkR3VpZGVSb290RnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJhd0ZyYWdtZW50OiBhbnksXHJcbiAgICAgICAgcm9vdDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFyYXdGcmFnbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50LFxyXG4gICAgICAgICAgICByb290XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByYXdGcmFnbWVudDogYW55LFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBmcmFnbWVudC50b3BMZXZlbE1hcEtleSA9IHJhd0ZyYWdtZW50LnRvcExldmVsTWFwS2V5ID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50Lm1hcEtleUNoYWluID0gcmF3RnJhZ21lbnQubWFwS2V5Q2hhaW4gPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQuZ3VpZGVJRCA9IHJhd0ZyYWdtZW50Lmd1aWRlSUQgPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQuZ3VpZGVQYXRoID0gcmF3RnJhZ21lbnQuZ3VpZGVQYXRoID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50LmlLZXkgPSByYXdGcmFnbWVudC5pS2V5ID8/IG51bGw7XHJcbiAgICAgICAgZnJhZ21lbnQuZXhpdEtleSA9IHJhd0ZyYWdtZW50LmV4aXRLZXkgPz8gbnVsbDtcclxuICAgICAgICBmcmFnbWVudC52YXJpYWJsZSA9IHJhd0ZyYWdtZW50LnZhcmlhYmxlID8/IFtdO1xyXG4gICAgICAgIGZyYWdtZW50LmNsYXNzZXMgPSByYXdGcmFnbWVudC5jbGFzc2VzID8/IFtdO1xyXG4gICAgICAgIGZyYWdtZW50LnZhbHVlID0gcmF3RnJhZ21lbnQudmFsdWUgPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQudmFsdWUgPSBmcmFnbWVudC52YWx1ZS50cmltKCk7XHJcbiAgICAgICAgLy8gZnJhZ21lbnQudWkuZGlzY3Vzc2lvbkxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBjaGVja0ZvclZhcmlhYmxlcyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudC5pZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnBhcmVudEZyYWdtZW50SUQgPSBvdXRsaW5lTm9kZT8ucGFyZW50Py5pID8/ICcnO1xyXG5cclxuICAgICAgICBsZXQgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGlmIChyYXdGcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgICYmIEFycmF5LmlzQXJyYXkocmF3RnJhZ21lbnQub3B0aW9ucylcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCByYXdPcHRpb24gb2YgcmF3RnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IGZyYWdtZW50Lm9wdGlvbnMuZmluZChvID0+IG8uaWQgPT09IHJhd09wdGlvbi5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gbG9hZE9wdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhd09wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWdtZW50SW5kZXhcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5vcHRpb25zLnB1c2gob3B0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5vcHRpb24gPSByYXdPcHRpb24ub3B0aW9uID8/ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5pc0FuY2lsbGFyeSA9IHJhd09wdGlvbi5pc0FuY2lsbGFyeSA9PT0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ub3JkZXIgPSByYXdPcHRpb24ub3JkZXIgPz8gMDtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uaUV4aXRLZXkgPSByYXdPcHRpb24uaUV4aXRLZXkgPz8gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnBvZEtleSA9IHJhd09wdGlvbi5wb2RLZXkgPz8gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnBvZFRleHQgPSByYXdPcHRpb24ucG9kVGV4dCA/PyAnJztcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2VjdGlvbiA9IGZyYWdtZW50LnNlY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnBhcmVudEZyYWdtZW50SUQgPSBmcmFnbWVudC5pZDtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2VnbWVudEluZGV4ID0gZnJhZ21lbnQuc2VnbWVudEluZGV4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBvcHRpb24udWkuZG9Ob3RQYWludCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnSG9va1JlZ2lzdHJ5Q29kZS5leGVjdXRlU3RlcEhvb2soXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlRnJhZ21lbnQ6IChyZXNwb25zZTogc3RyaW5nKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwibW9kdWxlXFxcIiBzcmM9XFxcIi9Adml0ZS9jbGllbnRcXFwiPjwvc2NyaXB0PlxyXG4gICAgICAgICAgICAgICAgPCEtLSB0c0ZyYWdtZW50UmVuZGVyQ29tbWVudCB7XFxcIm5vZGVcXFwiOntcXFwiaWRcXFwiOlxcXCJkQnQ3S20yTWxcXFwiLFxcXCJ0b3BMZXZlbE1hcEtleVxcXCI6XFxcImN2MVRSbDAxcmZcXFwiLFxcXCJtYXBLZXlDaGFpblxcXCI6XFxcImN2MVRSbDAxcmZcXFwiLFxcXCJndWlkZUlEXFxcIjpcXFwiZEJ0N0pOMUhlXFxcIixcXFwiZ3VpZGVQYXRoXFxcIjpcXFwiYzovR2l0SHViL1RFU1QuRG9jdW1lbnRhdGlvbi90c21hcHNkYXRhT3B0aW9uc0ZvbGRlci9Ib2xkZXIvZGF0YU9wdGlvbnMudHNtYXBcXFwiLFxcXCJwYXJlbnRGcmFnbWVudElEXFxcIjpcXFwiZEJ0N0pOMXZ0XFxcIixcXFwiY2hhcnRLZXlcXFwiOlxcXCJjdjFUUmwwMXJmXFxcIixcXFwib3B0aW9uc1xcXCI6W119fSAtLT5cclxuXHJcbiAgICAgICAgICAgICAgICA8aDQgaWQ9XFxcIm9wdGlvbi0xLXNvbHV0aW9uXFxcIj5PcHRpb24gMSBzb2x1dGlvbjwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8cD5PcHRpb24gMSBzb2x1dGlvbjwvcD5cclxuICAgICAgICAqL1xyXG5cclxuICAgICAgICBjb25zdCBsaW5lcyA9IHJlc3BvbnNlLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICBjb25zdCByZW5kZXJDb21tZW50U3RhcnQgPSBgPCEtLSAke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50UmVuZGVyQ29tbWVudFRhZ31gO1xyXG4gICAgICAgIGNvbnN0IHJlbmRlckNvbW1lbnRFbmQgPSBgIC0tPmA7XHJcbiAgICAgICAgbGV0IGZyYWdtZW50UmVuZGVyQ29tbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgbGV0IGxpbmU6IHN0cmluZztcclxuICAgICAgICBsZXQgYnVpbGRWYWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBsaW5lID0gbGluZXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoYnVpbGRWYWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYCR7dmFsdWV9XHJcbiR7bGluZX1gO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgocmVuZGVyQ29tbWVudFN0YXJ0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGxpbmUuc3Vic3RyaW5nKHJlbmRlckNvbW1lbnRTdGFydC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgYnVpbGRWYWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRSZW5kZXJDb21tZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC50cmltKCk7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudFJlbmRlckNvbW1lbnQuZW5kc1dpdGgocmVuZGVyQ29tbWVudEVuZCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC5sZW5ndGggLSByZW5kZXJDb21tZW50RW5kLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnbWVudFJlbmRlckNvbW1lbnQgPSBmcmFnbWVudFJlbmRlckNvbW1lbnQudHJpbSgpO1xyXG4gICAgICAgIGxldCByYXdGcmFnbWVudDogYW55IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50ID0gSlNPTi5wYXJzZShmcmFnbWVudFJlbmRlckNvbW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJhd0ZyYWdtZW50LnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiByYXdGcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgbWFya09wdGlvbnNFeHBhbmRlZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWlzKHN0YXRlKTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5vcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgY29sbGFwc2VGcmFnbWVudHNPcHRpb25zOiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50XHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvbi51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNvbGxhcHNlRnJhZ21lbnRzT3B0aW9ucyhmcmFnbWVudCk7XHJcbiAgICAgICAgb3B0aW9uLnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuc2V0Q3VycmVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0RnJhZ21lbnRVaXM6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoYWluRnJhZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWQ7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gY2hhaW5GcmFnbWVudHMpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpKGNoYWluRnJhZ21lbnRzW3Byb3BOYW1lXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNldEZyYWdtZW50VWk6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRBbmNpbGxhcnlBY3RpdmU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50IHwgbnVsbFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmFjdGl2ZUFuY2lsbGFyeSA9IGFuY2lsbGFyeTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJBbmNpbGxhcnlBY3RpdmU6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmFjdGl2ZUFuY2lsbGFyeSA9IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIHNwbGl0T3B0aW9uc0FuZEFuY2lsbGFyaWVzOiAoY2hpbGRyZW46IEFycmF5PElSZW5kZXJGcmFnbWVudD4gfCBudWxsIHwgdW5kZWZpbmVkKTogeyBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+LCBhbmNpbGxhcmllczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiwgdG90YWw6IG51bWJlciB9ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgYW5jaWxsYXJpZXM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4gPSBbXTtcclxuICAgICAgICBjb25zdCBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+ID0gW107XHJcbiAgICAgICAgbGV0IG9wdGlvbjogSVJlbmRlckZyYWdtZW50O1xyXG5cclxuICAgICAgICBpZiAoIWNoaWxkcmVuKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIGFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICAgICAgdG90YWw6IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvbiA9IGNoaWxkcmVuW2ldIGFzIElSZW5kZXJGcmFnbWVudDtcclxuXHJcbiAgICAgICAgICAgIGlmICghb3B0aW9uLmlzQW5jaWxsYXJ5KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllcy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgICAgIGFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICB0b3RhbDogY2hpbGRyZW4ubGVuZ3RoXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q3VycmVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSBmcmFnbWVudC5zZWN0aW9uO1xyXG5cclxuICAgICAgICBsZXQgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmVudC5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgYW5kIEZyYWdtZW50IGFyZSB0aGUgc2FtZVwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyZW50LnNlbGVjdGVkID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIGZyYWdtZW50LnVpLnNlY3Rpb25JbmRleCA9IHBhcmVudC51aS5zZWN0aW9uSW5kZXggKyAxO1xyXG5cclxuICAgICAgICAgICAgY2xlYXJTaWJsaW5nQ2hhaW5zKFxyXG4gICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudEZyYWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VjdGlvbi5jdXJyZW50ID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jaGVja1NlbGVjdGVkKGZyYWdtZW50KTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0UG9kQ3VycmVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSBmcmFnbWVudC5zZWN0aW9uO1xyXG5cclxuICAgICAgICBsZXQgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmVudC5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgYW5kIEZyYWdtZW50IGFyZSB0aGUgc2FtZVwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFyZW50LnNlbGVjdGVkID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIGZyYWdtZW50LnVpLnNlY3Rpb25JbmRleCA9IHBhcmVudC51aS5zZWN0aW9uSW5kZXggKyAxO1xyXG5cclxuICAgICAgICAgICAgY2xlYXJTaWJsaW5nQ2hhaW5zKFxyXG4gICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudEZyYWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2VjdGlvbi5jdXJyZW50ID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jaGVja1NlbGVjdGVkKGZyYWdtZW50KTtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRDb2RlO1xyXG5cclxuIiwiaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElGcmFnbWVudFBheWxvYWQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvcGF5bG9hZHMvSUZyYWdtZW50UGF5bG9hZFwiO1xyXG5cclxuXHJcbmNvbnN0IGhpZGVGcm9tUGFpbnQgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgIGhpZGU6IGJvb2xlYW5cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLyogXHJcbiAgICAgICAgVGhpcyBpcyBhIGZpeCBmb3I6XHJcbiAgICAgICAgTm90Rm91bmRFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ2luc2VydEJlZm9yZScgb24gJ05vZGUnOiBUaGUgbm9kZSBiZWZvcmUgd2hpY2ggdGhlIG5ldyBub2RlIGlzIHRvIGJlIGluc2VydGVkIGlzIG5vdCBhIGNoaWxkIG9mIHRoaXMgbm9kZS5cclxuICAgICovXHJcblxyXG4gICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGZyYWdtZW50LnVpLmRvTm90UGFpbnQgPSBoaWRlO1xyXG5cclxuICAgIGhpZGVGcm9tUGFpbnQoXHJcbiAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxuXHJcbiAgICBoaWRlRnJvbVBhaW50KFxyXG4gICAgICAgIGZyYWdtZW50Lmxpbms/LnJvb3QsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxufVxyXG5cclxuY29uc3QgaGlkZU9wdGlvbnNGcm9tUGFpbnQgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgIGhpZGU6IGJvb2xlYW5cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgLyogXHJcbiAgICAgICAgVGhpcyBpcyBhIGZpeCBmb3I6XHJcbiAgICAgICAgTm90Rm91bmRFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ2luc2VydEJlZm9yZScgb24gJ05vZGUnOiBUaGUgbm9kZSBiZWZvcmUgd2hpY2ggdGhlIG5ldyBub2RlIGlzIHRvIGJlIGluc2VydGVkIGlzIG5vdCBhIGNoaWxkIG9mIHRoaXMgbm9kZS5cclxuICAgICovXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQ/Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaGlkZUZyb21QYWludChcclxuICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICBoaWRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2VjdGlvblBhcmVudFNlbGVjdGVkKFxyXG4gICAgICAgIGZyYWdtZW50LnNlY3Rpb24gYXMgSURpc3BsYXlDaGFydCxcclxuICAgICAgICBoaWRlXHJcbiAgICApO1xyXG59XHJcblxyXG5jb25zdCBoaWRlU2VjdGlvblBhcmVudFNlbGVjdGVkID0gKFxyXG4gICAgZGlzcGxheUNoYXJ0OiBJRGlzcGxheUNoYXJ0LFxyXG4gICAgaGlkZTogYm9vbGVhblxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIWRpc3BsYXlDaGFydD8ucGFyZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVGcm9tUGFpbnQoXHJcbiAgICAgICAgZGlzcGxheUNoYXJ0LnBhcmVudC5zZWxlY3RlZCxcclxuICAgICAgICBoaWRlXHJcbiAgICApO1xyXG5cclxuICAgIGhpZGVTZWN0aW9uUGFyZW50U2VsZWN0ZWQoXHJcbiAgICAgICAgZGlzcGxheUNoYXJ0LnBhcmVudC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGZyYWdtZW50QWN0aW9ucyA9IHtcclxuXHJcbiAgICBleHBhbmRPcHRpb25zOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGVcclxuICAgICAgICAgICAgfHwgIWZyYWdtZW50XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlnbm9yZUV2ZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuYWN0aXZlQW5jaWxsYXJ5ICE9IG51bGw7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhckFuY2lsbGFyeUFjdGl2ZShzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmIChpZ25vcmVFdmVudCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLnNldERpcnR5KHN0YXRlKTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIGNvbnN0IGV4cGFuZGVkID0gZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgIT09IHRydWU7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gZXhwYW5kZWQ7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBleHBhbmRlZDtcclxuXHJcbiAgICAgICAgaGlkZU9wdGlvbnNGcm9tUGFpbnQoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGVPcHRpb25zOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGVcclxuICAgICAgICAgICAgfHwgIWZyYWdtZW50XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlnbm9yZUV2ZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuYWN0aXZlQW5jaWxsYXJ5ICE9IG51bGw7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhckFuY2lsbGFyeUFjdGl2ZShzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmIChpZ25vcmVFdmVudCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLnNldERpcnR5KHN0YXRlKTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGhpZGVPcHRpb25zRnJvbVBhaW50KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgZmFsc2VcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHBheWxvYWQ6IElGcmFnbWVudFBheWxvYWRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhcGF5bG9hZD8ucGFyZW50RnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgIXBheWxvYWQ/Lm9wdGlvblxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpZ25vcmVFdmVudCA9IHN0YXRlLnJlbmRlclN0YXRlLmFjdGl2ZUFuY2lsbGFyeSAhPSBudWxsO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJBbmNpbGxhcnlBY3RpdmUoc3RhdGUpO1xyXG5cclxuICAgICAgICBpZiAoaWdub3JlRXZlbnQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5zZXREaXJ0eShzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLnNob3dPcHRpb25Ob2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcGF5bG9hZC5wYXJlbnRGcmFnbWVudCxcclxuICAgICAgICAgICAgcGF5bG9hZC5vcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICB0b2dnbGVBbmNpbGxhcnlOb2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBwYXlsb2FkOiBJRnJhZ21lbnRQYXlsb2FkXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFuY2lsbGFyeSA9IHBheWxvYWQub3B0aW9uO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEFuY2lsbGFyeUFjdGl2ZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChhbmNpbGxhcnkpIHtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuc2V0RGlydHkoc3RhdGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLnNob3dBbmNpbGxhcnlOb2RlKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZyYWdtZW50QWN0aW9ucztcclxuIiwiaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJRnJhZ21lbnRQYXlsb2FkIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL3BheWxvYWRzL0lGcmFnbWVudFBheWxvYWRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGcmFnbWVudFBheWxvYWQgaW1wbGVtZW50cyBJRnJhZ21lbnRQYXlsb2FkIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50XHJcbiAgICApIHtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnRGcmFnbWVudCA9IHBhcmVudEZyYWdtZW50O1xyXG4gICAgICAgIHRoaXMub3B0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQ7XHJcbiAgICBwdWJsaWMgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQ7XHJcbiAgICBwdWJsaWMgZWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbn1cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4sIFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBmcmFnbWVudFZpZXdzIGZyb20gXCIuL2ZyYWdtZW50Vmlld3NcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IG9wdGlvbnNWaWV3cyBmcm9tIFwiLi9vcHRpb25zVmlld3NcIjtcclxuXHJcblxyXG5jb25zdCBidWlsZFBvZERpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gZmFsc2U7XHJcbiAgICBsZXQgYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9IGZhbHNlO1xyXG4gICAgY29uc3Qgdmlld3NMZW5ndGggPSB2aWV3cy5sZW5ndGg7XHJcblxyXG4gICAgaWYgKHZpZXdzTGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICBjb25zdCBsYXN0VmlldzogYW55ID0gdmlld3Nbdmlld3NMZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8uaXNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8uaGFzQW5jaWxsYXJpZXMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaW5rRUxlbWVudElEID0gZ0ZyYWdtZW50Q29kZS5nZXRMaW5rRWxlbWVudElEKGZyYWdtZW50LmlkKTtcclxuICAgIGNvbnN0IHJlc3VsdHM6IHsgdmlld3M6IENoaWxkcmVuW10sIG9wdGlvbnNDb2xsYXBzZWQ6IGJvb2xlYW4sIGhhc0FuY2lsbGFyaWVzOiBib29sZWFuIH0gPSBvcHRpb25zVmlld3MuYnVpbGRWaWV3KGZyYWdtZW50KTtcclxuXHJcbiAgICBpZiAobGlua0VMZW1lbnRJRCA9PT0gJ250X2xrX2ZyYWdfdDk2OE9KMXdvJykge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgUi1EUkFXSU5HICR7bGlua0VMZW1lbnRJRH1fZGApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBjbGFzc2VzID0gXCJudC1mci1mcmFnbWVudC1ib3hcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBjbGFzc05hbWUgb2YgZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC11ci0ke2NsYXNzTmFtZX1gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LWZyLXByaW9yLWNvbGxhcHNlZC1vcHRpb25zYFxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZGp1c3RGb3JQcmlvckFuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC1mci1wcmlvci1pcy1hbmNpbGxhcnlgXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldyA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2xpbmtFTGVtZW50SUR9X2RgLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2NsYXNzZXN9YFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogYG50LWZyLWZyYWdtZW50LWRpc2N1c3Npb25gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtZGlzY3Vzc2lvblwiOiBmcmFnbWVudC52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcIlxyXG4gICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnZpZXdzXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIGlmIChyZXN1bHRzLm9wdGlvbnNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0FueSA9IHZpZXcgYXMgYW55O1xyXG5cclxuICAgICAgICBpZiAoIXZpZXdBbnkudWkpIHtcclxuXHJcbiAgICAgICAgICAgIHZpZXdBbnkudWkgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZpZXdBbnkudWkuaXNDb2xsYXBzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmhhc0FuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBbnkgPSB2aWV3IGFzIGFueTtcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3QW55LnVpKSB7XHJcblxyXG4gICAgICAgICAgICB2aWV3QW55LnVpID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2aWV3QW55LnVpLmhhc0FuY2lsbGFyaWVzID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRWaWV3ID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiBDaGlsZHJlbltdID0+IHtcclxuXHJcbiAgICBjb25zdCB2aWV3czogQ2hpbGRyZW5bXSA9IFtdO1xyXG5cclxuICAgIGJ1aWxkUG9kRGlzY3Vzc2lvblZpZXcoXHJcbiAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgdmlld3NcclxuICAgICk7XHJcblxyXG4gICAgZnJhZ21lbnRWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgdmlld3NcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXdzO1xyXG59O1xyXG5cclxuY29uc3QgcG9kVmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gICAgKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25cclxuICAgICAgICAgICAgfHwgIW9wdGlvbi5wb2Q/LnJvb3RcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB2aWV3ID0gaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLXBvZC1ib3hcIiB9LFxyXG5cclxuICAgICAgICAgICAgYnVpbGRWaWV3KG9wdGlvbi5wb2Q/LnJvb3QpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwb2RWaWV3cztcclxuXHJcblxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiwgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9mcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IEZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvdWkvcGF5bG9hZHMvRnJhZ21lbnRQYXlsb2FkXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZnJhZ21lbnRWaWV3cyBmcm9tIFwiLi9mcmFnbWVudFZpZXdzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBwb2RWaWV3cyBmcm9tIFwiLi9wb2RWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkQW5jaWxsYXJ5RGlzY3Vzc2lvblZpZXcgPSAoYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnQpOiBDaGlsZHJlbltdID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogQ2hpbGRyZW5bXSA9IFtdO1xyXG5cclxuICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgIGFuY2lsbGFyeSxcclxuICAgICAgICB2aWV3XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBidWlsZEV4cGFuZGVkQW5jaWxsYXJ5VmlldyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeVxyXG4gICAgICAgIHx8ICFhbmNpbGxhcnkuaXNBbmNpbGxhcnkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWJveFwiIH0sIFtcclxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS1oZWFkXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeSBudC1mci1hbmNpbGxhcnktdGFyZ2V0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFjdGlvbnMudG9nZ2xlQW5jaWxsYXJ5Tm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0YXJnZXQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnJhZ21lbnRQYXlsb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2lsbGFyeSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKFwic3BhblwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS10ZXh0IG50LWZyLWFuY2lsbGFyeS10YXJnZXRcIiB9LCBhbmNpbGxhcnkub3B0aW9uKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnkteCBudC1mci1hbmNpbGxhcnktdGFyZ2V0XCIgfSwgJ+KclScpXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBdKSxcclxuXHJcbiAgICAgICAgICAgIGJ1aWxkQW5jaWxsYXJ5RGlzY3Vzc2lvblZpZXcoYW5jaWxsYXJ5KVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBidWlsZENvbGxhcHNlZEFuY2lsbGFyeVZpZXcgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFhbmNpbGxhcnlcclxuICAgICAgICB8fCAhYW5jaWxsYXJ5LmlzQW5jaWxsYXJ5KSB7XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS1ib3ggbnQtZnItY29sbGFwc2VkXCIgfSwgW1xyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWhlYWRcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5IG50LWZyLWFuY2lsbGFyeS10YXJnZXRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd246IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy50b2dnbGVBbmNpbGxhcnlOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRhcmdldDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGcmFnbWVudFBheWxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaWxsYXJ5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJzcGFuXCIsIHtjbGFzczogXCJudC1mci1hbmNpbGxhcnktdGFyZ2V0XCJ9LCBhbmNpbGxhcnkub3B0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgQnVpbGRBbmNpbGxhcnlWaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5XHJcbiAgICAgICAgfHwgIWFuY2lsbGFyeS5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBidWlsZEV4cGFuZGVkQW5jaWxsYXJ5VmlldyhcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBidWlsZENvbGxhcHNlZEFuY2lsbGFyeVZpZXcoXHJcbiAgICAgICAgcGFyZW50LFxyXG4gICAgICAgIGFuY2lsbGFyeVxyXG4gICAgKTtcclxufVxyXG5cclxuY29uc3QgQnVpbGRFeHBhbmRlZE9wdGlvblZpZXcgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFvcHRpb25cclxuICAgICAgICB8fCBvcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGJ1dHRvbkNsYXNzID0gXCJudC1mci1vcHRpb25cIjtcclxuXHJcbiAgICBpZiAob3B0aW9uLnBvZD8ucm9vdCkge1xyXG5cclxuICAgICAgICBidXR0b25DbGFzcyA9IGAke2J1dHRvbkNsYXNzfSBudC1mci1wb2QtYnV0dG9uYDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJudC1mci1vcHRpb24tYm94XCIgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtidXR0b25DbGFzc31gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLnNob3dPcHRpb25Ob2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRhcmdldDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGcmFnbWVudFBheWxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvZFZpZXdzLmJ1aWxkVmlldyhvcHRpb24pLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwge2NsYXNzOiBcIm50LWZyLW9wdGlvbi10ZXh0XCJ9LCBvcHRpb24ub3B0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn1cclxuXHJcbmNvbnN0IGJ1aWxkRXhwYW5kZWRPcHRpb25zVmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+XHJcbik6IHsgdmlldzogVk5vZGUsIGlzQ29sbGFwc2VkOiBib29sZWFuIH0gfCBudWxsID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25WaWV3czogQ2hpbGRyZW5bXSA9IFtdO1xyXG4gICAgbGV0IG9wdGlvblZldzogVk5vZGUgfCBudWxsO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgb3B0aW9uVmV3ID0gQnVpbGRFeHBhbmRlZE9wdGlvblZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uVmV3KSB7XHJcblxyXG4gICAgICAgICAgICBvcHRpb25WaWV3cy5wdXNoKG9wdGlvblZldyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBvcHRpb25zQ2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtb3B0aW9uc1wiO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZCkge1xyXG5cclxuICAgICAgICBvcHRpb25zQ2xhc3NlcyA9IGAke29wdGlvbnNDbGFzc2VzfSBudC1mci1mcmFnbWVudC1jaGFpbmBcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke29wdGlvbnNDbGFzc2VzfWAsXHJcbiAgICAgICAgICAgICAgICB0YWJpbmRleDogMCxcclxuICAgICAgICAgICAgICAgIG9uQmx1cjogW1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5oaWRlT3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAoX2V2ZW50OiBhbnkpID0+IGZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBvcHRpb25WaWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB2aWV3LFxyXG4gICAgICAgIGlzQ29sbGFwc2VkOiBmYWxzZVxyXG4gICAgfTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkRXhwYW5kZWRPcHRpb25zQm94VmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+LFxyXG4gICAgZnJhZ21lbnRFTGVtZW50SUQ6IHN0cmluZyxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnNWaWV3ID0gYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3KFxyXG4gICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFvcHRpb25zVmlldykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYm94XCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2xhc3NOYW1lIG9mIGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtdXItJHtjbGFzc05hbWV9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZpZXdzLnB1c2goXHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9lb2AsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7Y2xhc3Nlc31gXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNWaWV3LnZpZXdcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIClcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZENvbGxhcHNlZE9wdGlvbnNWaWV3ID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgbGV0IGJ1dHRvbkNsYXNzID0gXCJudC1mci1mcmFnbWVudC1vcHRpb25zIG50LWZyLWNvbGxhcHNlZFwiO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZD8ucG9kPy5yb290KSB7XHJcblxyXG4gICAgICAgIGJ1dHRvbkNsYXNzID0gYCR7YnV0dG9uQ2xhc3N9IG50LWZyLXBvZC1idXR0b25gO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2J1dHRvbkNsYXNzfWAsXHJcbiAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5leHBhbmRPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4gZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgcG9kVmlld3MuYnVpbGRWaWV3KGZyYWdtZW50LnNlbGVjdGVkKSxcclxuXHJcbiAgICAgICAgICAgICAgICBoKFwic3BhblwiLCB7IGNsYXNzOiBgbnQtZnItb3B0aW9uLXNlbGVjdGVkYCB9LCBgJHtmcmFnbWVudC5zZWxlY3RlZD8ub3B0aW9ufWApLFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkQ29sbGFwc2VkT3B0aW9uc0JveFZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgZnJhZ21lbnRFTGVtZW50SUQ6IHN0cmluZyxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvblZpZXcgPSBidWlsZENvbGxhcHNlZE9wdGlvbnNWaWV3KGZyYWdtZW50KTtcclxuXHJcbiAgICBsZXQgY2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYm94XCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2xhc3NOYW1lIG9mIGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtdXItJHtjbGFzc05hbWV9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXcgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fY29gLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2NsYXNzZXN9YFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBvcHRpb25WaWV3XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIGNvbnN0IHZpZXdBbnkgPSB2aWV3IGFzIGFueTtcclxuXHJcbiAgICBpZiAoIXZpZXdBbnkudWkpIHtcclxuXHJcbiAgICAgICAgdmlld0FueS51aSA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIHZpZXdBbnkudWkuaXNDb2xsYXBzZWQgPSB0cnVlO1xyXG4gICAgdmlld3MucHVzaCh2aWV3KTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkQW5jaWxsYXJpZXNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGFuY2lsbGFyaWVzOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKGFuY2lsbGFyaWVzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhbmNpbGxhcmllc1ZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcbiAgICBsZXQgYW5jaWxsYXJ5VmlldzogVk5vZGUgfCBudWxsO1xyXG5cclxuICAgIGZvciAoY29uc3QgYW5jaWxsYXJ5IG9mIGFuY2lsbGFyaWVzKSB7XHJcblxyXG4gICAgICAgIGFuY2lsbGFyeVZpZXcgPSBCdWlsZEFuY2lsbGFyeVZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoYW5jaWxsYXJ5Vmlldykge1xyXG5cclxuICAgICAgICAgICAgYW5jaWxsYXJpZXNWaWV3cy5wdXNoKGFuY2lsbGFyeVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5jaWxsYXJpZXNWaWV3cy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFuY2lsbGFyaWVzQ2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYW5jaWxsYXJpZXNcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgYW5jaWxsYXJpZXNDbGFzc2VzID0gYCR7YW5jaWxsYXJpZXNDbGFzc2VzfSBudC1mci1mcmFnbWVudC1jaGFpbmBcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2FuY2lsbGFyaWVzQ2xhc3Nlc31gLFxyXG4gICAgICAgICAgICAgICAgdGFiaW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICAvLyBvbkJsdXI6IFtcclxuICAgICAgICAgICAgICAgIC8vICAgICBmcmFnbWVudEFjdGlvbnMuaGlkZU9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgKF9ldmVudDogYW55KSA9PiBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgLy8gXVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgYW5jaWxsYXJpZXNWaWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEFuY2lsbGFyaWVzQm94VmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcmllczogQXJyYXk8SVJlbmRlckZyYWdtZW50PixcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBhbmNpbGxhcmllc1ZpZXcgPSBidWlsZEFuY2lsbGFyaWVzVmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBhbmNpbGxhcmllc1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyaWVzVmlldykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYm94XCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2xhc3NOYW1lIG9mIGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtdXItJHtjbGFzc05hbWV9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXcgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fYWAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7Y2xhc3Nlc31gXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGFuY2lsbGFyaWVzVmlld1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICBjb25zdCB2aWV3QW55ID0gdmlldyBhcyBhbnk7XHJcblxyXG4gICAgaWYgKCF2aWV3QW55LnVpKSB7XHJcblxyXG4gICAgICAgIHZpZXdBbnkudWkgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3QW55LnVpLmhhc0FuY2lsbGFyaWVzID0gdHJ1ZTtcclxuICAgIHZpZXdzLnB1c2godmlldyk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD5cclxuKTogeyB2aWV3OiBWTm9kZSwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAmJiBvcHRpb25zWzBdLm9wdGlvbiA9PT0gJydcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3ID0gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZpZXcsXHJcbiAgICAgICAgICAgIGlzQ29sbGFwc2VkOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3KFxyXG4gICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sXHJcbiAgICBmcmFnbWVudEVMZW1lbnRJRDogc3RyaW5nLFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMVxyXG4gICAgICAgICYmIG9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBidWlsZENvbGxhcHNlZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgZnJhZ21lbnRFTGVtZW50SUQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkRXhwYW5kZWRPcHRpb25zQm94VmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgIHZpZXdzXHJcbiAgICApO1xyXG59O1xyXG5cclxuXHJcbmNvbnN0IG9wdGlvbnNWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiwgaGFzQW5jaWxsYXJpZXM6IGJvb2xlYW4gfSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQub3B0aW9uc1xyXG4gICAgICAgICAgICB8fCBmcmFnbWVudC5vcHRpb25zLmxlbmd0aCA9PT0gMFxyXG4gICAgICAgICAgICB8fCAhVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkgLy8gRG9uJ3QgZHJhdyBvcHRpb25zIG9mIGxpbmtzXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB2aWV3czogW10sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zQ29sbGFwc2VkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGhhc0FuY2lsbGFyaWVzOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIGZyYWdtZW50Lm9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdmlld3M6IFtdLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uc0NvbGxhcHNlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBoYXNBbmNpbGxhcmllczogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcbiAgICAgICAgbGV0IGhhc0FuY2lsbGFyaWVzID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdzOiBDaGlsZHJlbltdID0gW1xyXG5cclxuICAgICAgICAgICAgYnVpbGRBbmNpbGxhcmllc1ZpZXcoXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5hbmNpbGxhcmllc1xyXG4gICAgICAgICAgICApLFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGlmICh2aWV3cy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBoYXNBbmNpbGxhcmllcyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvcHRpb25zVmlld1Jlc3VsdHMgPSBidWlsZE9wdGlvbnNWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnNcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uc1ZpZXdSZXN1bHRzKSB7XHJcblxyXG4gICAgICAgICAgICB2aWV3cy5wdXNoKG9wdGlvbnNWaWV3UmVzdWx0cy52aWV3KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZpZXdzLFxyXG4gICAgICAgICAgICBvcHRpb25zQ29sbGFwc2VkOiBvcHRpb25zVmlld1Jlc3VsdHM/LmlzQ29sbGFwc2VkID8/IGZhbHNlLFxyXG4gICAgICAgICAgICBoYXNBbmNpbGxhcmllc1xyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkVmlldzI6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgIHx8ICFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSAvLyBEb24ndCBkcmF3IG9wdGlvbnMgb2YgbGlua3NcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIGZyYWdtZW50Lm9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEVMZW1lbnRJRCA9IGdGcmFnbWVudENvZGUuZ2V0RnJhZ21lbnRFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGJ1aWxkQW5jaWxsYXJpZXNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICBmcmFnbWVudEVMZW1lbnRJRCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zVmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4gfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkTGlua0Rpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gZmFsc2U7XHJcbiAgICBsZXQgYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9IGZhbHNlO1xyXG4gICAgY29uc3Qgdmlld3NMZW5ndGggPSB2aWV3cy5sZW5ndGg7XHJcblxyXG4gICAgaWYgKHZpZXdzTGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICBjb25zdCBsYXN0VmlldzogYW55ID0gdmlld3Nbdmlld3NMZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8uaXNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxhc3RWaWV3Py51aT8uaGFzQW5jaWxsYXJpZXMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaW5rRUxlbWVudElEID0gZ0ZyYWdtZW50Q29kZS5nZXRMaW5rRWxlbWVudElEKGZyYWdtZW50LmlkKTtcclxuICAgIGNvbnN0IHJlc3VsdHM6IHsgdmlld3M6IENoaWxkcmVuW10sIG9wdGlvbnNDb2xsYXBzZWQ6IGJvb2xlYW4sIGhhc0FuY2lsbGFyaWVzOiBib29sZWFuIH0gPSBvcHRpb25zVmlld3MuYnVpbGRWaWV3KGZyYWdtZW50KTtcclxuXHJcbiAgICBpZiAobGlua0VMZW1lbnRJRCA9PT0gJ250X2xrX2ZyYWdfdDk2OE9KMXdvJykge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgUi1EUkFXSU5HICR7bGlua0VMZW1lbnRJRH1fbGApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBjbGFzc2VzID0gXCJudC1mci1mcmFnbWVudC1ib3hcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBjbGFzc05hbWUgb2YgZnJhZ21lbnQuY2xhc3Nlcykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC11ci0ke2NsYXNzTmFtZX1gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY2xhc3NlcyA9IGAke2NsYXNzZXN9IG50LWZyLXByaW9yLWNvbGxhcHNlZC1vcHRpb25zYFxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZGp1c3RGb3JQcmlvckFuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC1mci1wcmlvci1pcy1hbmNpbGxhcnlgXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldyA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2xpbmtFTGVtZW50SUR9X2xgLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2NsYXNzZXN9YFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogYG50LWZyLWZyYWdtZW50LWRpc2N1c3Npb25gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtZGlzY3Vzc2lvblwiOiBmcmFnbWVudC52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcIlxyXG4gICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnZpZXdzXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIGlmIChyZXN1bHRzLm9wdGlvbnNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0FueSA9IHZpZXcgYXMgYW55O1xyXG5cclxuICAgICAgICBpZiAoIXZpZXdBbnkudWkpIHtcclxuXHJcbiAgICAgICAgICAgIHZpZXdBbnkudWkgPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZpZXdBbnkudWkuaXNDb2xsYXBzZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmhhc0FuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdBbnkgPSB2aWV3IGFzIGFueTtcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3QW55LnVpKSB7XHJcblxyXG4gICAgICAgICAgICB2aWV3QW55LnVpID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2aWV3QW55LnVpLmhhc0FuY2lsbGFyaWVzID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRMaW5rRXhpdHNWaWV3ID0gKFxyXG4gICAgX2ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBfdmlldzogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgICAvLyBpZiAoIWZyYWdtZW50Lm9wdGlvbnNcclxuICAgIC8vICAgICB8fCBmcmFnbWVudC5vcHRpb25zLmxlbmd0aCA9PT0gMFxyXG4gICAgLy8gICAgIHx8ICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZFxyXG4gICAgLy8gKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSkpIHtcclxuXHJcbiAgICAvLyAgICAgLy8gVGhlbiBtYXAgaGFzIGEgc2luZ2xlIGV4aXQgYW5kIGl0IHdhcyBtZXJnZWQgaW50byB0aGlzIGZyYWdtZW50XHJcbiAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIHZpZXcucHVzaChcclxuXHJcbiAgICAvLyAgICAgaChcImRpdlwiLFxyXG4gICAgLy8gICAgICAgICB7XHJcbiAgICAvLyAgICAgICAgICAgICBjbGFzczogXCJudC1mci1leGl0cy1ib3hcIlxyXG4gICAgLy8gICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICBbXHJcbiAgICAvLyAgICAgICAgICAgICBvcHRpb25zVmlld3MuYnVpbGRWaWV3KGZyYWdtZW50KVxyXG4gICAgLy8gICAgICAgICBdXHJcbiAgICAvLyAgICAgKVxyXG4gICAgLy8gKTtcclxufTtcclxuXHJcbmNvbnN0IGxpbmtWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgICAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWlsZExpbmtEaXNjdXNzaW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGlua1ZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQubGluaz8ucm9vdCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZExpbmtFeGl0c1ZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbGlua1ZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IENoaWxkcmVuIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBvcHRpb25zVmlld3MgZnJvbSBcIi4vb3B0aW9uc1ZpZXdzXCI7XHJcbmltcG9ydCBsaW5rVmlld3MgZnJvbSBcIi4vbGlua1ZpZXdzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkRGlzY3Vzc2lvblZpZXcgPSAoXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LnZhbHVlKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9IGZhbHNlO1xyXG4gICAgbGV0IGFkanVzdEZvclByaW9yQW5jaWxsYXJpZXMgPSBmYWxzZTtcclxuICAgIGNvbnN0IHZpZXdzTGVuZ3RoID0gdmlld3MubGVuZ3RoO1xyXG5cclxuICAgIGlmICh2aWV3c0xlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgY29uc3QgbGFzdFZpZXc6IGFueSA9IHZpZXdzW3ZpZXdzTGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/LmlzQ29sbGFwc2VkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/Lmhhc0FuY2lsbGFyaWVzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBhZGp1c3RGb3JQcmlvckFuY2lsbGFyaWVzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldEZyYWdtZW50RWxlbWVudElEKGZyYWdtZW50LmlkKTtcclxuXHJcbiAgICBsZXQgY2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYm94XCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2xhc3NOYW1lIG9mIGZyYWdtZW50LmNsYXNzZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtdXItJHtjbGFzc05hbWV9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIGNsYXNzZXMgPSBgJHtjbGFzc2VzfSBudC1mci1wcmlvci1jb2xsYXBzZWQtb3B0aW9uc2BcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWRqdXN0Rm9yUHJpb3JBbmNpbGxhcmllcyA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBjbGFzc2VzID0gYCR7Y2xhc3Nlc30gbnQtZnItcHJpb3ItaXMtYW5jaWxsYXJ5YFxyXG4gICAgfVxyXG5cclxuICAgIHZpZXdzLnB1c2goXHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9kYCxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtjbGFzc2VzfWBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGBudC1mci1mcmFnbWVudC1kaXNjdXNzaW9uYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLWRpc2N1c3Npb25cIjogZnJhZ21lbnQudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiXCJcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZnJhZ21lbnRWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCxcclxuICAgICAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRcclxuICAgICAgICAgICAgfHwgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWlsZERpc2N1c3Npb25WaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsaW5rVmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudC5saW5rPy5yb290LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG9wdGlvbnNWaWV3cy5idWlsZFZpZXcyKFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmcmFnbWVudFZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZyYWdtZW50Vmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4sIFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG4vLyBpbXBvcnQgZ0RlYnVnZ2VyQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0RlYnVnZ2VyQ29kZVwiO1xyXG5cclxuaW1wb3J0IFwiLi4vc2Nzcy9mcmFnbWVudHMuc2Nzc1wiO1xyXG5cclxuXHJcbmNvbnN0IGd1aWRlVmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRDb250ZW50VmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGlubmVyVmlld3M6IENoaWxkcmVuW10gPSBbXTtcclxuXHJcbiAgICAgICAgZnJhZ21lbnRWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdCxcclxuICAgICAgICAgICAgaW5uZXJWaWV3c1xyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gZ0RlYnVnZ2VyQ29kZS5sb2dSb290KHN0YXRlKTtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBcIm50X2ZyX0ZyYWdtZW50c1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGlubmVyVmlld3NcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBndWlkZVZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGluaXRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2luaXRBY3Rpb25zXCI7XHJcbmltcG9ydCBndWlkZVZpZXdzIGZyb20gXCIuLi8uLi9mcmFnbWVudHMvdmlld3MvZ3VpZGVWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRWaWV3ID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiBpbml0QWN0aW9ucy5zZXROb3RSYXcsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IFwidHJlZVNvbHZlRnJhZ21lbnRzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgZ3VpZGVWaWV3cy5idWlsZENvbnRlbnRWaWV3KHN0YXRlKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRWaWV3O1xyXG5cclxuIiwiaW1wb3J0IElTZXR0aW5ncyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lTZXR0aW5nc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNldHRpbmdzIGltcGxlbWVudHMgSVNldHRpbmdzIHtcclxuXHJcbiAgICBwdWJsaWMga2V5OiBzdHJpbmcgPSBcIi0xXCI7XHJcbiAgICBwdWJsaWMgcjogc3RyaW5nID0gXCItMVwiO1xyXG5cclxuICAgIC8vIEF1dGhlbnRpY2F0aW9uXHJcbiAgICBwdWJsaWMgdXNlclBhdGg6IHN0cmluZyA9IGB1c2VyYDtcclxuICAgIHB1YmxpYyBkZWZhdWx0TG9nb3V0UGF0aDogc3RyaW5nID0gYGxvZ291dGA7XHJcbiAgICBwdWJsaWMgZGVmYXVsdExvZ2luUGF0aDogc3RyaW5nID0gYGxvZ2luYDtcclxuICAgIHB1YmxpYyByZXR1cm5VcmxTdGFydDogc3RyaW5nID0gYHJldHVyblVybGA7XHJcblxyXG4gICAgcHJpdmF0ZSBiYXNlVXJsOiBzdHJpbmcgPSAod2luZG93IGFzIGFueSkuQVNTSVNUQU5UX0JBU0VfVVJMID8/ICcnO1xyXG4gICAgcHVibGljIGxpbmtVcmw6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfTElOS19VUkwgPz8gJyc7XHJcbiAgICBwdWJsaWMgc3Vic2NyaXB0aW9uSUQ6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfU1VCU0NSSVBUSU9OX0lEID8/ICcnO1xyXG5cclxuICAgIHB1YmxpYyBhcGlVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vYXBpYDtcclxuICAgIHB1YmxpYyBiZmZVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vYmZmYDtcclxuICAgIHB1YmxpYyBmaWxlVXJsOiBzdHJpbmcgPSBgJHt0aGlzLmJhc2VVcmx9L2ZpbGVgO1xyXG59XHJcbiIsIlxyXG5leHBvcnQgZW51bSBuYXZpZ2F0aW9uRGlyZWN0aW9uIHtcclxuXHJcbiAgICBCdXR0b25zID0gJ2J1dHRvbnMnLFxyXG4gICAgQmFja3dhcmRzID0gJ2JhY2t3YXJkcycsXHJcbiAgICBGb3J3YXJkcyA9ICdmb3J3YXJkcydcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgbmF2aWdhdGlvbkRpcmVjdGlvbiB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL25hdmlnYXRpb25EaXJlY3Rpb25cIjtcclxuaW1wb3J0IElIaXN0b3J5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlcIjtcclxuaW1wb3J0IElIaXN0b3J5VXJsIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlVcmxcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaXN0b3J5IGltcGxlbWVudHMgSUhpc3Rvcnkge1xyXG5cclxuICAgIHB1YmxpYyBoaXN0b3J5Q2hhaW46IEFycmF5PElIaXN0b3J5VXJsPiA9IFtdO1xyXG4gICAgcHVibGljIGRpcmVjdGlvbjogbmF2aWdhdGlvbkRpcmVjdGlvbiA9IG5hdmlnYXRpb25EaXJlY3Rpb24uQnV0dG9ucztcclxuICAgIHB1YmxpYyBjdXJyZW50SW5kZXg6IG51bWJlciA9IDA7XHJcbn1cclxuIiwiaW1wb3J0IElVc2VyIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVVzZXJcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyIGltcGxlbWVudHMgSVVzZXIge1xyXG5cclxuICAgIHB1YmxpYyBrZXk6IHN0cmluZyA9IGAwMTIzNDU2Nzg5YDtcclxuICAgIHB1YmxpYyByOiBzdHJpbmcgPSBcIi0xXCI7XHJcbiAgICBwdWJsaWMgdXNlVnNDb2RlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBhdXRob3Jpc2VkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgcmF3OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBsb2dvdXRVcmw6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgc2hvd01lbnU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIHN1Yjogc3RyaW5nID0gXCJcIjtcclxufVxyXG4iLCJpbXBvcnQgSVJlcGVhdEVmZmVjdHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JUmVwZWF0RWZmZWN0c1wiO1xyXG5pbXBvcnQgSUh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwZWF0ZUVmZmVjdHMgaW1wbGVtZW50cyBJUmVwZWF0RWZmZWN0cyB7XHJcblxyXG4gICAgcHVibGljIHNob3J0SW50ZXJ2YWxIdHRwOiBBcnJheTxJSHR0cEVmZmVjdD4gPSBbXTtcclxuICAgIHB1YmxpYyByZUxvYWRHZXRIdHRwSW1tZWRpYXRlOiBBcnJheTxJSHR0cEVmZmVjdD4gPSBbXTtcclxuICAgIHB1YmxpYyBydW5BY3Rpb25JbW1lZGlhdGU6IEFycmF5PElBY3Rpb24+ID0gW107XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJTdGF0ZVVJIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL0lSZW5kZXJTdGF0ZVVJXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyU3RhdGVVSSBpbXBsZW1lbnRzIElSZW5kZXJTdGF0ZVVJIHtcclxuXHJcbiAgICBwdWJsaWMgcmF3OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBvcHRpb25zRXhwYW5kZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlHdWlkZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5R3VpZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lSZW5kZXJTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlVUkgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlclN0YXRlVUlcIjtcclxuaW1wb3J0IFJlbmRlclN0YXRlVUkgZnJvbSBcIi4vdWkvUmVuZGVyU3RhdGVVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlclN0YXRlIGltcGxlbWVudHMgSVJlbmRlclN0YXRlIHtcclxuXHJcbiAgICBwdWJsaWMgcmVmcmVzaFVybDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzQ2hhaW5Mb2FkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+ID0gW107XHJcbiAgICBwdWJsaWMgZGlzcGxheUd1aWRlOiBJRGlzcGxheUd1aWRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgb3V0bGluZXM6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIG91dGxpbmVVcmxzOiBhbnkgPSB7fTtcclxuICAgIHB1YmxpYyBjdXJyZW50U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIGFjdGl2ZUFuY2lsbGFyeTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgLy8gU2VhcmNoIGluZGljZXNcclxuICAgIHB1YmxpYyBpbmRleF9vdXRsaW5lTm9kZXNfaWQ6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIGluZGV4X2NoYWluRnJhZ21lbnRzX2lkOiBhbnkgPSB7fTtcclxuXHJcbiAgICBwdWJsaWMgdWk6IElSZW5kZXJTdGF0ZVVJID0gbmV3IFJlbmRlclN0YXRlVUkoKTtcclxufVxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgU2V0dGluZ3MgZnJvbSBcIi4vdXNlci9TZXR0aW5nc1wiO1xyXG5pbXBvcnQgSVNldHRpbmdzIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVNldHRpbmdzXCI7XHJcbmltcG9ydCBJSGlzdG9yeSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5XCI7XHJcbmltcG9ydCBTdGVwSGlzdG9yeSBmcm9tIFwiLi9oaXN0b3J5L0hpc3RvcnlcIjtcclxuaW1wb3J0IElVc2VyIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVVzZXJcIjtcclxuaW1wb3J0IFVzZXIgZnJvbSBcIi4vdXNlci9Vc2VyXCI7XHJcbmltcG9ydCBJUmVwZWF0RWZmZWN0cyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lSZXBlYXRFZmZlY3RzXCI7XHJcbmltcG9ydCBSZXBlYXRlRWZmZWN0cyBmcm9tIFwiLi9lZmZlY3RzL1JlcGVhdGVFZmZlY3RzXCI7XHJcbmltcG9ydCBJUmVuZGVyU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVJlbmRlclN0YXRlXCI7XHJcbmltcG9ydCBSZW5kZXJTdGF0ZSBmcm9tIFwiLi9SZW5kZXJTdGF0ZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlIGltcGxlbWVudHMgSVN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2V0dGluZ3M6IElTZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZGluZzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgZGVidWc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGdlbmVyaWNFcnJvcjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG5leHRLZXk6IG51bWJlciA9IC0xO1xyXG4gICAgcHVibGljIHNldHRpbmdzOiBJU2V0dGluZ3M7XHJcbiAgICBwdWJsaWMgdXNlcjogSVVzZXIgPSBuZXcgVXNlcigpO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVuZGVyU3RhdGU6IElSZW5kZXJTdGF0ZSA9IG5ldyBSZW5kZXJTdGF0ZSgpO1xyXG5cclxuICAgIHB1YmxpYyByZXBlYXRFZmZlY3RzOiBJUmVwZWF0RWZmZWN0cyA9IG5ldyBSZXBlYXRlRWZmZWN0cygpO1xyXG5cclxuICAgIHB1YmxpYyBzdGVwSGlzdG9yeTogSUhpc3RvcnkgPSBuZXcgU3RlcEhpc3RvcnkoKTtcclxufVxyXG5cclxuXHJcbiIsIlxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCB7IElIdHRwRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEZldGNoSXRlbVwiO1xyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4uL2h0dHAvZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnUmVuZGVyQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nT3V0bGluZUFjdGlvbnNcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi4vY29kZS9nT3V0bGluZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBnZXRHdWlkZU91dGxpbmUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyB8IG51bGwsXHJcbiAgICBsb2FkRGVsZWdhdGU6IChzdGF0ZTogSVN0YXRlLCBvdXRsaW5lUmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXlcclxuKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgQWN0aW9uVHlwZS5HZXRPdXRsaW5lXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICBjb25zdCBsb2FkUmVxdWVzdGVkID0gZ091dGxpbmVDb2RlLnJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHVybFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAobG9hZFJlcXVlc3RlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3BvbnNlOiAnanNvbicsXHJcbiAgICAgICAgYWN0aW9uOiBsb2FkRGVsZWdhdGUsXHJcbiAgICAgICAgZXJyb3I6IChzdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgb3V0bGluZSBkYXRhIGZyb20gdGhlIHNlcnZlci5cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUubmFtZX0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBnZXR0aW5nIG91dGxpbmUgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuXCIsXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z1JlbmRlckVmZmVjdHMuZ2V0R3VpZGVPdXRsaW5lLm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmNvbnN0IGdSZW5kZXJFZmZlY3RzID0ge1xyXG5cclxuICAgIGdldEd1aWRlT3V0bGluZTogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyA9IHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8uZ3VpZGUuZnJhZ21lbnRGb2xkZXJVcmwgPz8gJ251bGwnO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdSZW5kZXJBY3Rpb25zLmxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRHdWlkZU91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybCxcclxuICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0R3VpZGVPdXRsaW5lQW5kTG9hZFNlZ21lbnRzOiAoc3RhdGU6IElTdGF0ZSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5ndWlkZS5mcmFnbWVudEZvbGRlclVybCA/PyAnbnVsbCc7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1JlbmRlckFjdGlvbnMubG9hZEd1aWRlT3V0bGluZUFuZFNlZ21lbnRzKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRHdWlkZU91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybCxcclxuICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZW5kZXJFZmZlY3RzO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IFN0YXRlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9TdGF0ZVwiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ1JlbmRlckVmZmVjdHMgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9lZmZlY3RzL2dSZW5kZXJFZmZlY3RzXCI7XHJcbmltcG9ydCBnUmVuZGVyQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1JlbmRlckNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuXHJcblxyXG5jb25zdCBpbml0aWFsaXNlU3RhdGUgPSAoKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmUpIHtcclxuXHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdGF0ZTogSVN0YXRlID0gbmV3IFN0YXRlKCk7XHJcbiAgICBnUmVuZGVyQ29kZS5wYXJzZVJlbmRlcmluZ0NvbW1lbnQoc3RhdGUpO1xyXG5cclxuICAgIHJldHVybiBzdGF0ZTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkUmVuZGVyRGlzcGxheSA9IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290KSB7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uoc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290LmlLZXkpID09PSB0cnVlXHJcbiAgICAgICAgJiYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3Qub3B0aW9uc1xyXG4gICAgICAgICAgICB8fCBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3Qub3B0aW9ucy5sZW5ndGggPT09IDApXHJcbiAgICApIHtcclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUoc3RhdGUpXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRTZWdtZW50c1JlbmRlckRpc3BsYXkgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVlcnlTdHJpbmc6IHN0cmluZ1xyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPSB0cnVlO1xyXG5cclxuICAgIGdTZWdtZW50Q29kZS5wYXJzZVNlZ21lbnRzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHF1ZXJ5U3RyaW5nXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSB3YXMgb25seSAxIHNlZ21lbnRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBzZWdtZW50c1swXTtcclxuXHJcbiAgICBpZiAoIXJvb3RTZWdtZW50LnN0YXJ0LmlzUm9vdCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHdWlkZVJvb3Qgbm90IHByZXNlbnRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlyc3RTZWdtZW50ID0gc2VnbWVudHNbMV07XHJcblxyXG4gICAgaWYgKCFmaXJzdFNlZ21lbnQuc3RhcnQuaXNMYXN0XHJcbiAgICAgICAgJiYgZmlyc3RTZWdtZW50LnN0YXJ0LnR5cGUgIT09IE91dGxpbmVUeXBlLkxpbmtcclxuICAgICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcXVlcnkgc3RyaW5nIGZvcm1hdCAtIGl0IHNob3VsZCBzdGFydCB3aXRoICctJyBvciAnfidcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmVBbmRMb2FkU2VnbWVudHMoc3RhdGUpXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgaW5pdFN0YXRlID0ge1xyXG5cclxuICAgIGluaXRpYWxpc2U6ICgpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlOiBJU3RhdGUgPSBpbml0aWFsaXNlU3RhdGUoKTtcclxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZzogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UocXVlcnlTdHJpbmcpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkU2VnbWVudHNSZW5kZXJEaXNwbGF5KFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5U3RyaW5nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZW5kZXJEaXNwbGF5KHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGU6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgc3RhdGUuZ2VuZXJpY0Vycm9yID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdGF0ZTtcclxuXHJcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcblxyXG5cclxuY29uc3QgcmVuZGVyQ29tbWVudHMgPSB7XHJcblxyXG4gICAgcmVnaXN0ZXJHdWlkZUNvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdHJlZVNvbHZlR3VpZGU6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRmlsdGVycy50cmVlU29sdmVHdWlkZUlEKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRyZWVTb2x2ZUd1aWRlXHJcbiAgICAgICAgICAgICYmIHRyZWVTb2x2ZUd1aWRlLmhhc0NoaWxkTm9kZXMoKSA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGROb2RlOiBDaGlsZE5vZGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93LlRyZWVTb2x2ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudCA9IGNoaWxkTm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGROb2RlLm5vZGVUeXBlICE9PSBOb2RlLlRFWFRfTk9ERSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZW5kZXJDb21tZW50cztcclxuIiwiaW1wb3J0IHsgYXBwIH0gZnJvbSBcIi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XG5cbmltcG9ydCBpbml0U3Vic2NyaXB0aW9ucyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9zdWJzY3JpcHRpb25zL2luaXRTdWJzY3JpcHRpb25zXCI7XG5pbXBvcnQgaW5pdEV2ZW50cyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHNcIjtcbmltcG9ydCBpbml0VmlldyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlld1wiO1xuaW1wb3J0IGluaXRTdGF0ZSBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRTdGF0ZVwiO1xuaW1wb3J0IHJlbmRlckNvbW1lbnRzIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvcmVuZGVyQ29tbWVudHNcIjtcblxuXG5pbml0RXZlbnRzLnJlZ2lzdGVyR2xvYmFsRXZlbnRzKCk7XG5yZW5kZXJDb21tZW50cy5yZWdpc3Rlckd1aWRlQ29tbWVudCgpO1xuXG4od2luZG93IGFzIGFueSkuQ29tcG9zaXRlRmxvd3NBdXRob3IgPSBhcHAoe1xuICAgIFxuICAgIG5vZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHJlZVNvbHZlRnJhZ21lbnRzXCIpLFxuICAgIGluaXQ6IGluaXRTdGF0ZS5pbml0aWFsaXNlLFxuICAgIHZpZXc6IGluaXRWaWV3LmJ1aWxkVmlldyxcbiAgICBzdWJzY3JpcHRpb25zOiBpbml0U3Vic2NyaXB0aW9ucyxcbiAgICBvbkVuZDogaW5pdEV2ZW50cy5vblJlbmRlckZpbmlzaGVkXG59KTtcblxuXG4iXSwibmFtZXMiOlsicHJvcHMiLCJjb3VudCIsIm91dHB1dCIsIlUiLCJsb2NhdGlvbiIsImVmZmVjdCIsImh0dHBFZmZlY3QiLCJBY3Rpb25UeXBlIiwic3RhdGUiLCJQYXJzZVR5cGUiLCJPdXRsaW5lVHlwZSIsIlNjcm9sbEhvcFR5cGUiLCJvdXRsaW5lUmVzcG9uc2UiLCJuYXZpZ2F0aW9uRGlyZWN0aW9uIiwiU3RlcEhpc3RvcnkiLCJnUmVuZGVyQWN0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBSSxnQkFBZ0I7QUFDcEIsSUFBSSxZQUFZO0FBQ2hCLElBQUksWUFBWTtBQUNoQixJQUFJLFlBQVksQ0FBQTtBQUNoQixJQUFJLFlBQVksQ0FBQTtBQUNoQixJQUFJLE1BQU0sVUFBVTtBQUNwQixJQUFJLFVBQVUsTUFBTTtBQUNwQixJQUFJLFFBQ0YsT0FBTywwQkFBMEIsY0FDN0Isd0JBQ0E7QUFFTixJQUFJLGNBQWMsU0FBUyxLQUFLO0FBQzlCLE1BQUksTUFBTTtBQUVWLE1BQUksT0FBTyxRQUFRLFNBQVUsUUFBTztBQUVwQyxNQUFJLFFBQVEsR0FBRyxLQUFLLElBQUksU0FBUyxHQUFHO0FBQ2xDLGFBQVMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSztBQUN4QyxXQUFLLE1BQU0sWUFBWSxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUk7QUFDdEMsZ0JBQVEsT0FBTyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxJQUNGO0FBQUEsRUFDRixPQUFPO0FBQ0wsYUFBUyxLQUFLLEtBQUs7QUFDakIsVUFBSSxJQUFJLENBQUMsR0FBRztBQUNWLGdCQUFRLE9BQU8sT0FBTztBQUFBLE1BQ3hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxJQUFJLFFBQVEsU0FBUyxHQUFHLEdBQUc7QUFDekIsTUFBSSxNQUFNLENBQUE7QUFFVixXQUFTLEtBQUssRUFBRyxLQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0IsV0FBUyxLQUFLLEVBQUcsS0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBRTdCLFNBQU87QUFDVDtBQUVBLElBQUksUUFBUSxTQUFTLE1BQU07QUFDekIsU0FBTyxLQUFLLE9BQU8sU0FBUyxLQUFLLE1BQU07QUFDckMsV0FBTyxJQUFJO0FBQUEsTUFDVCxDQUFDLFFBQVEsU0FBUyxPQUNkLElBQ0EsT0FBTyxLQUFLLENBQUMsTUFBTSxhQUNuQixDQUFDLElBQUksSUFDTCxNQUFNLElBQUk7QUFBQSxJQUNwQjtBQUFBLEVBQ0UsR0FBRyxTQUFTO0FBQ2Q7QUFFQSxJQUFJLGVBQWUsU0FBUyxHQUFHLEdBQUc7QUFDaEMsU0FBTyxRQUFRLENBQUMsS0FBSyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxPQUFPLEVBQUUsQ0FBQyxNQUFNO0FBQ3RFO0FBRUEsSUFBSSxnQkFBZ0IsU0FBUyxHQUFHLEdBQUc7QUFDakMsTUFBSSxNQUFNLEdBQUc7QUFDWCxhQUFTLEtBQUssTUFBTSxHQUFHLENBQUMsR0FBRztBQUN6QixVQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFHLFFBQU87QUFDdkQsUUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQUksWUFBWSxTQUFTLFNBQVMsU0FBUyxVQUFVO0FBQ25ELFdBQ00sSUFBSSxHQUFHLFFBQVEsUUFBUSxPQUFPLENBQUEsR0FDbEMsSUFBSSxRQUFRLFVBQVUsSUFBSSxRQUFRLFFBQ2xDLEtBQ0E7QUFDQSxhQUFTLFFBQVEsQ0FBQztBQUNsQixhQUFTLFFBQVEsQ0FBQztBQUNsQixTQUFLO0FBQUEsTUFDSCxTQUNJLENBQUMsVUFDRCxPQUFPLENBQUMsTUFBTSxPQUFPLENBQUMsS0FDdEIsY0FBYyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxJQUNoQztBQUFBLFFBQ0UsT0FBTyxDQUFDO0FBQUEsUUFDUixPQUFPLENBQUM7QUFBQSxRQUNSLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxDQUFDLENBQUM7QUFBQSxRQUM3QixVQUFVLE9BQU8sQ0FBQyxFQUFDO0FBQUEsTUFDakMsSUFDWSxTQUNGLFVBQVUsT0FBTyxDQUFDLEVBQUM7QUFBQSxJQUM3QjtBQUFBLEVBQ0U7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxJQUFJLGdCQUFnQixTQUFTLE1BQU0sS0FBSyxVQUFVLFVBQVUsVUFBVSxPQUFPO0FBQzNFLE1BQUksUUFBUSxNQUFPO0FBQUEsV0FDUixRQUFRLFNBQVM7QUFDMUIsYUFBUyxLQUFLLE1BQU0sVUFBVSxRQUFRLEdBQUc7QUFDdkMsaUJBQVcsWUFBWSxRQUFRLFNBQVMsQ0FBQyxLQUFLLE9BQU8sS0FBSyxTQUFTLENBQUM7QUFDcEUsVUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLO0FBQ2hCLGFBQUssR0FBRyxFQUFFLFlBQVksR0FBRyxRQUFRO0FBQUEsTUFDbkMsT0FBTztBQUNMLGFBQUssR0FBRyxFQUFFLENBQUMsSUFBSTtBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLEVBQ0YsV0FBVyxJQUFJLENBQUMsTUFBTSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUs7QUFDM0MsUUFDRSxHQUFHLEtBQUssWUFBWSxLQUFLLFVBQVUsQ0FBQSxJQUNoQyxNQUFNLElBQUksTUFBTSxDQUFDLEVBQUUsWUFBVyxDQUN2QyxJQUFVLFdBQ0o7QUFDQSxXQUFLLG9CQUFvQixLQUFLLFFBQVE7QUFBQSxJQUN4QyxXQUFXLENBQUMsVUFBVTtBQUNwQixXQUFLLGlCQUFpQixLQUFLLFFBQVE7QUFBQSxJQUNyQztBQUFBLEVBQ0YsV0FBVyxDQUFDLFNBQVMsUUFBUSxVQUFVLE9BQU8sTUFBTTtBQUNsRCxTQUFLLEdBQUcsSUFBSSxZQUFZLFFBQVEsWUFBWSxjQUFjLEtBQUs7QUFBQSxFQUNqRSxXQUNFLFlBQVksUUFDWixhQUFhLFNBQ1osUUFBUSxXQUFXLEVBQUUsV0FBVyxZQUFZLFFBQVEsSUFDckQ7QUFDQSxTQUFLLGdCQUFnQixHQUFHO0FBQUEsRUFDMUIsT0FBTztBQUNMLFNBQUssYUFBYSxLQUFLLFFBQVE7QUFBQSxFQUNqQztBQUNGO0FBRUEsSUFBSSxhQUFhLFNBQVMsTUFBTSxVQUFVLE9BQU87QUFDL0MsTUFBSSxLQUFLO0FBQ1QsTUFBSSxRQUFRLEtBQUs7QUFDakIsTUFBSSxPQUNGLEtBQUssU0FBUyxZQUNWLFNBQVMsZUFBZSxLQUFLLElBQUksS0FDaEMsUUFBUSxTQUFTLEtBQUssU0FBUyxTQUNoQyxTQUFTLGdCQUFnQixJQUFJLEtBQUssTUFBTSxFQUFFLElBQUksTUFBTSxJQUFJLElBQ3hELFNBQVMsY0FBYyxLQUFLLE1BQU0sRUFBRSxJQUFJLE1BQU0sSUFBSTtBQUV4RCxXQUFTLEtBQUssT0FBTztBQUNuQixrQkFBYyxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxVQUFVLEtBQUs7QUFBQSxFQUN4RDtBQUVBLFdBQVMsSUFBSSxHQUFHLE1BQU0sS0FBSyxTQUFTLFFBQVEsSUFBSSxLQUFLLEtBQUs7QUFDeEQsU0FBSztBQUFBLE1BQ0g7QUFBQSxRQUNHLEtBQUssU0FBUyxDQUFDLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDO0FBQUEsUUFDN0M7QUFBQSxRQUNBO0FBQUEsTUFDUjtBQUFBLElBQ0E7QUFBQSxFQUNFO0FBRUEsU0FBUSxLQUFLLE9BQU87QUFDdEI7QUFFQSxJQUFJLFNBQVMsU0FBUyxNQUFNO0FBQzFCLFNBQU8sUUFBUSxPQUFPLE9BQU8sS0FBSztBQUNwQztBQUVBLElBQUksUUFBUSxTQUFTLFFBQVEsTUFBTSxVQUFVLFVBQVUsVUFBVSxPQUFPO0FBQ3RFLE1BQUksYUFBYSxTQUFVO0FBQUEsV0FFekIsWUFBWSxRQUNaLFNBQVMsU0FBUyxhQUNsQixTQUFTLFNBQVMsV0FDbEI7QUFDQSxRQUFJLFNBQVMsU0FBUyxTQUFTLEtBQU0sTUFBSyxZQUFZLFNBQVM7QUFBQSxFQUNqRSxXQUFXLFlBQVksUUFBUSxTQUFTLFNBQVMsU0FBUyxNQUFNO0FBQzlELFdBQU8sT0FBTztBQUFBLE1BQ1osV0FBWSxXQUFXLFNBQVMsUUFBUSxHQUFJLFVBQVUsS0FBSztBQUFBLE1BQzNEO0FBQUEsSUFDTjtBQUNJLFFBQUksWUFBWSxNQUFNO0FBQ3BCLGFBQU8sWUFBWSxTQUFTLElBQUk7QUFBQSxJQUNsQztBQUFBLEVBQ0YsT0FBTztBQUNMLFFBQUk7QUFDSixRQUFJO0FBRUosUUFBSTtBQUNKLFFBQUk7QUFFSixRQUFJLFlBQVksU0FBUztBQUN6QixRQUFJLFlBQVksU0FBUztBQUV6QixRQUFJLFdBQVcsU0FBUztBQUN4QixRQUFJLFdBQVcsU0FBUztBQUV4QixRQUFJLFVBQVU7QUFDZCxRQUFJLFVBQVU7QUFDZCxRQUFJLFVBQVUsU0FBUyxTQUFTO0FBQ2hDLFFBQUksVUFBVSxTQUFTLFNBQVM7QUFFaEMsWUFBUSxTQUFTLFNBQVMsU0FBUztBQUVuQyxhQUFTLEtBQUssTUFBTSxXQUFXLFNBQVMsR0FBRztBQUN6QyxXQUNHLE1BQU0sV0FBVyxNQUFNLGNBQWMsTUFBTSxZQUN4QyxLQUFLLENBQUMsSUFDTixVQUFVLENBQUMsT0FBTyxVQUFVLENBQUMsR0FDakM7QUFDQSxzQkFBYyxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVSxLQUFLO0FBQUEsTUFDcEU7QUFBQSxJQUNGO0FBRUEsV0FBTyxXQUFXLFdBQVcsV0FBVyxTQUFTO0FBQy9DLFdBQ0csU0FBUyxPQUFPLFNBQVMsT0FBTyxDQUFDLE1BQU0sUUFDeEMsV0FBVyxPQUFPLFNBQVMsT0FBTyxDQUFDLEdBQ25DO0FBQ0E7QUFBQSxNQUNGO0FBRUE7QUFBQSxRQUNFO0FBQUEsUUFDQSxTQUFTLE9BQU8sRUFBRTtBQUFBLFFBQ2xCLFNBQVMsT0FBTztBQUFBLFFBQ2YsU0FBUyxPQUFPLElBQUk7QUFBQSxVQUNuQixTQUFTLFNBQVM7QUFBQSxVQUNsQixTQUFTLFNBQVM7QUFBQSxRQUM1QjtBQUFBLFFBQ1E7QUFBQSxRQUNBO0FBQUEsTUFDUjtBQUFBLElBQ0k7QUFFQSxXQUFPLFdBQVcsV0FBVyxXQUFXLFNBQVM7QUFDL0MsV0FDRyxTQUFTLE9BQU8sU0FBUyxPQUFPLENBQUMsTUFBTSxRQUN4QyxXQUFXLE9BQU8sU0FBUyxPQUFPLENBQUMsR0FDbkM7QUFDQTtBQUFBLE1BQ0Y7QUFFQTtBQUFBLFFBQ0U7QUFBQSxRQUNBLFNBQVMsT0FBTyxFQUFFO0FBQUEsUUFDbEIsU0FBUyxPQUFPO0FBQUEsUUFDZixTQUFTLE9BQU8sSUFBSTtBQUFBLFVBQ25CLFNBQVMsU0FBUztBQUFBLFVBQ2xCLFNBQVMsU0FBUztBQUFBLFFBQzVCO0FBQUEsUUFDUTtBQUFBLFFBQ0E7QUFBQSxNQUNSO0FBQUEsSUFDSTtBQUVBLFFBQUksVUFBVSxTQUFTO0FBQ3JCLGFBQU8sV0FBVyxTQUFTO0FBQ3pCLGFBQUs7QUFBQSxVQUNIO0FBQUEsWUFDRyxTQUFTLE9BQU8sSUFBSSxTQUFTLFNBQVMsU0FBUyxDQUFDO0FBQUEsWUFDakQ7QUFBQSxZQUNBO0FBQUEsVUFDWjtBQUFBLFdBQ1csVUFBVSxTQUFTLE9BQU8sTUFBTSxRQUFRO0FBQUEsUUFDbkQ7QUFBQSxNQUNNO0FBQUEsSUFDRixXQUFXLFVBQVUsU0FBUztBQUM1QixhQUFPLFdBQVcsU0FBUztBQUN6QixhQUFLLFlBQVksU0FBUyxTQUFTLEVBQUUsSUFBSTtBQUFBLE1BQzNDO0FBQUEsSUFDRixPQUFPO0FBQ0wsZUFBUyxJQUFJLFNBQVMsUUFBUSxDQUFBLEdBQUksV0FBVyxDQUFBLEdBQUksS0FBSyxTQUFTLEtBQUs7QUFDbEUsYUFBSyxTQUFTLFNBQVMsQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUN0QyxnQkFBTSxNQUFNLElBQUksU0FBUyxDQUFDO0FBQUEsUUFDNUI7QUFBQSxNQUNGO0FBRUEsYUFBTyxXQUFXLFNBQVM7QUFDekIsaUJBQVMsT0FBUSxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQzVDLGlCQUFTO0FBQUEsVUFDTixTQUFTLE9BQU8sSUFBSSxTQUFTLFNBQVMsT0FBTyxHQUFHLE9BQU87QUFBQSxRQUNsRTtBQUVRLFlBQ0UsU0FBUyxNQUFNLEtBQ2QsVUFBVSxRQUFRLFdBQVcsT0FBTyxTQUFTLFVBQVUsQ0FBQyxDQUFDLEdBQzFEO0FBQ0EsY0FBSSxVQUFVLE1BQU07QUFDbEIsaUJBQUssWUFBWSxRQUFRLElBQUk7QUFBQSxVQUMvQjtBQUNBO0FBQ0E7QUFBQSxRQUNGO0FBRUEsWUFBSSxVQUFVLFFBQVEsU0FBUyxTQUFTLGVBQWU7QUFDckQsY0FBSSxVQUFVLE1BQU07QUFDbEI7QUFBQSxjQUNFO0FBQUEsY0FDQSxXQUFXLFFBQVE7QUFBQSxjQUNuQjtBQUFBLGNBQ0EsU0FBUyxPQUFPO0FBQUEsY0FDaEI7QUFBQSxjQUNBO0FBQUEsWUFDZDtBQUNZO0FBQUEsVUFDRjtBQUNBO0FBQUEsUUFDRixPQUFPO0FBQ0wsY0FBSSxXQUFXLFFBQVE7QUFDckI7QUFBQSxjQUNFO0FBQUEsY0FDQSxRQUFRO0FBQUEsY0FDUjtBQUFBLGNBQ0EsU0FBUyxPQUFPO0FBQUEsY0FDaEI7QUFBQSxjQUNBO0FBQUEsWUFDZDtBQUNZLHFCQUFTLE1BQU0sSUFBSTtBQUNuQjtBQUFBLFVBQ0YsT0FBTztBQUNMLGlCQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNyQztBQUFBLGdCQUNFO0FBQUEsZ0JBQ0EsS0FBSyxhQUFhLFFBQVEsTUFBTSxXQUFXLFFBQVEsSUFBSTtBQUFBLGdCQUN2RDtBQUFBLGdCQUNBLFNBQVMsT0FBTztBQUFBLGdCQUNoQjtBQUFBLGdCQUNBO0FBQUEsY0FDaEI7QUFDYyx1QkFBUyxNQUFNLElBQUk7QUFBQSxZQUNyQixPQUFPO0FBQ0w7QUFBQSxnQkFDRTtBQUFBLGdCQUNBLFdBQVcsUUFBUTtBQUFBLGdCQUNuQjtBQUFBLGdCQUNBLFNBQVMsT0FBTztBQUFBLGdCQUNoQjtBQUFBLGdCQUNBO0FBQUEsY0FDaEI7QUFBQSxZQUNZO0FBQUEsVUFDRjtBQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFFQSxhQUFPLFdBQVcsU0FBUztBQUN6QixZQUFJLE9BQVEsVUFBVSxTQUFTLFNBQVMsQ0FBQyxLQUFNLE1BQU07QUFDbkQsZUFBSyxZQUFZLFFBQVEsSUFBSTtBQUFBLFFBQy9CO0FBQUEsTUFDRjtBQUVBLGVBQVMsS0FBSyxPQUFPO0FBQ25CLFlBQUksU0FBUyxDQUFDLEtBQUssTUFBTTtBQUN2QixlQUFLLFlBQVksTUFBTSxDQUFDLEVBQUUsSUFBSTtBQUFBLFFBQ2hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsU0FBUSxTQUFTLE9BQU87QUFDMUI7QUFFQSxJQUFJLGVBQWUsU0FBUyxHQUFHLEdBQUc7QUFDaEMsV0FBUyxLQUFLLEVBQUcsS0FBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRyxRQUFPO0FBQzNDLFdBQVMsS0FBSyxFQUFHLEtBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUcsUUFBTztBQUM3QztBQUVBLElBQUksZUFBZSxTQUFTLE1BQU07QUFDaEMsU0FBTyxPQUFPLFNBQVMsV0FBVyxPQUFPLGdCQUFnQixJQUFJO0FBQy9EO0FBRUEsSUFBSSxXQUFXLFNBQVMsVUFBVSxVQUFVO0FBQzFDLFNBQU8sU0FBUyxTQUFTLGNBQ25CLENBQUMsWUFBWSxDQUFDLFNBQVMsUUFBUSxhQUFhLFNBQVMsTUFBTSxTQUFTLElBQUksUUFDbkUsV0FBVyxhQUFhLFNBQVMsS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLEdBQUcsT0FDL0QsU0FBUyxPQUNiLFlBQ0E7QUFDTjtBQUVBLElBQUksY0FBYyxTQUFTLE1BQU0sT0FBTyxVQUFVLE1BQU0sS0FBSyxNQUFNO0FBQ2pFLFNBQU87QUFBQSxJQUNMO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0E7QUFFQSxJQUFJLGtCQUFrQixTQUFTLE9BQU8sTUFBTTtBQUMxQyxTQUFPLFlBQVksT0FBTyxXQUFXLFdBQVcsTUFBTSxRQUFXLFNBQVM7QUFDNUU7QUFFQSxJQUFJLGNBQWMsU0FBUyxNQUFNO0FBQy9CLFNBQU8sS0FBSyxhQUFhLFlBQ3JCLGdCQUFnQixLQUFLLFdBQVcsSUFBSSxJQUNwQztBQUFBLElBQ0UsS0FBSyxTQUFTLFlBQVc7QUFBQSxJQUN6QjtBQUFBLElBQ0EsSUFBSSxLQUFLLEtBQUssWUFBWSxXQUFXO0FBQUEsSUFDckM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ1I7QUFDQTtBQVNPLElBQUksSUFBSSxTQUFTLE1BQU0sT0FBTztBQUNuQyxXQUFTLE1BQU0sT0FBTyxDQUFBLEdBQUksV0FBVyxDQUFBLEdBQUksSUFBSSxVQUFVLFFBQVEsTUFBTSxLQUFLO0FBQ3hFLFNBQUssS0FBSyxVQUFVLENBQUMsQ0FBQztBQUFBLEVBQ3hCO0FBRUEsU0FBTyxLQUFLLFNBQVMsR0FBRztBQUN0QixRQUFJLFFBQVMsT0FBTyxLQUFLLElBQUcsQ0FBRSxHQUFJO0FBQ2hDLGVBQVMsSUFBSSxLQUFLLFFBQVEsTUFBTSxLQUFLO0FBQ25DLGFBQUssS0FBSyxLQUFLLENBQUMsQ0FBQztBQUFBLE1BQ25CO0FBQUEsSUFDRixXQUFXLFNBQVMsU0FBUyxTQUFTLFFBQVEsUUFBUSxLQUFNO0FBQUEsU0FDckQ7QUFDTCxlQUFTLEtBQUssYUFBYSxJQUFJLENBQUM7QUFBQSxJQUNsQztBQUFBLEVBQ0Y7QUFFQSxVQUFRLFNBQVM7QUFFakIsU0FBTyxPQUFPLFNBQVMsYUFDbkIsS0FBSyxPQUFPLFFBQVEsSUFDcEIsWUFBWSxNQUFNLE9BQU8sVUFBVSxRQUFXLE1BQU0sR0FBRztBQUM3RDtBQUVPLElBQUksTUFBTSxTQUFTLE9BQU87QUFDL0IsTUFBSSxRQUFRLENBQUE7QUFDWixNQUFJLE9BQU87QUFDWCxNQUFJLE9BQU8sTUFBTTtBQUNqQixNQUFJLE9BQU8sTUFBTTtBQUNqQixNQUFJLE9BQU8sUUFBUSxZQUFZLElBQUk7QUFDbkMsTUFBSSxnQkFBZ0IsTUFBTTtBQUMxQixNQUFJLE9BQU8sQ0FBQTtBQUNYLE1BQUksUUFBUSxNQUFNO0FBRWxCLE1BQUksV0FBVyxTQUFTLE9BQU87QUFDN0IsYUFBUyxLQUFLLFFBQVEsTUFBTSxJQUFJLEdBQUcsS0FBSztBQUFBLEVBQzFDO0FBRUEsTUFBSSxXQUFXLFNBQVMsVUFBVTtBQUNoQyxRQUFJLFVBQVUsVUFBVTtBQUN0QixjQUFRO0FBQ1IsVUFBSSxlQUFlO0FBQ2pCLGVBQU8sVUFBVSxNQUFNLE1BQU0sQ0FBQyxjQUFjLEtBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUTtBQUFBLE1BQ2hFO0FBQ0EsVUFBSSxRQUFRLENBQUMsS0FBTSxPQUFNLFFBQVMsT0FBTyxJQUFJO0FBQUEsSUFDL0M7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUVBLE1BQUksWUFBWSxNQUFNLGNBQ3BCLFNBQVMsS0FBSztBQUNaLFdBQU87QUFBQSxFQUNULEdBQUcsU0FBUyxRQUFRQSxRQUFPO0FBQzNCLFdBQU8sT0FBTyxXQUFXLGFBQ3JCLFNBQVMsT0FBTyxPQUFPQSxNQUFLLENBQUMsSUFDN0IsUUFBUSxNQUFNLElBQ2QsT0FBTyxPQUFPLENBQUMsTUFBTSxjQUFjLFFBQVEsT0FBTyxDQUFDLENBQUMsSUFDbEQ7QUFBQSxNQUNFLE9BQU8sQ0FBQztBQUFBLE1BQ1IsT0FBTyxPQUFPLENBQUMsTUFBTSxhQUFhLE9BQU8sQ0FBQyxFQUFFQSxNQUFLLElBQUksT0FBTyxDQUFDO0FBQUEsSUFDekUsS0FDVyxNQUFNLE9BQU8sTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLFNBQVMsSUFBSTtBQUN2QyxZQUFNLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFBQSxJQUM3QixHQUFHLFNBQVMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUN0QixTQUNGLFNBQVMsTUFBTTtBQUFBLEVBQ3JCLENBQUM7QUFFRCxNQUFJLFNBQVMsV0FBVztBQUN0QixXQUFPO0FBQ1AsV0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0w7QUFBQSxNQUNBO0FBQUEsTUFDQyxPQUFPLGFBQWEsS0FBSyxLQUFLLENBQUM7QUFBQSxNQUNoQztBQUFBLElBQ047QUFDSSxVQUFLO0FBQUEsRUFDUDtBQUVBLFdBQVMsTUFBTSxJQUFJO0FBQ3JCO0FDdmVBLElBQUksU0FBUyxTQUFVLElBQVM7QUFFNUIsU0FBTyxTQUNILFFBQ0EsT0FBWTtBQUVaLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLFFBQ0k7QUFBQSxRQUNBLE9BQU8sTUFBTTtBQUFBLE1BQUE7QUFBQSxJQUNqQjtBQUFBLEVBRVI7QUFDSjtBQWtCTyxJQUFJLFdBQVc7QUFBQSxFQUVsQixTQUNJLFVBQ0EsT0FBWTtBQUVaLFFBQUksS0FBSztBQUFBLE1BQ0wsV0FBWTtBQUVSO0FBQUEsVUFDSSxNQUFNO0FBQUEsVUFDTixLQUFLLElBQUE7QUFBQSxRQUFJO0FBQUEsTUFFakI7QUFBQSxNQUNBLE1BQU07QUFBQSxJQUFBO0FBR1YsV0FBTyxXQUFZO0FBRWYsb0JBQWMsRUFBRTtBQUFBLElBQ3BCO0FBQUEsRUFDSjtBQUNKO0FDbUVBLE1BQU0sYUFBYSxDQUNmLFVBQ0EsVUFDTztBQUVQLE1BQUksQ0FBQyxPQUFPO0FBQ1I7QUFBQSxFQUNKO0FBRUEsUUFBTSxTQUFzQjtBQUFBLElBQ3hCLElBQUk7QUFBQSxJQUNKLEtBQUssTUFBTTtBQUFBLElBQ1gsb0JBQW9CO0FBQUEsSUFDcEIsV0FBVyxNQUFNLGFBQWE7QUFBQSxFQUFBO0FBR2xDO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxPQUFPLENBQ1QsVUFDQSxPQUNBLFFBQ0EsZUFBb0IsU0FBZTtBQUVuQztBQUFBLElBQ0ksTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQUEsRUFDTCxLQUFLLFNBQVUsVUFBVTtBQUV0QixRQUFJLFVBQVU7QUFFVixhQUFPLEtBQUssU0FBUyxPQUFPO0FBQzVCLGFBQU8sU0FBUyxTQUFTO0FBQ3pCLGFBQU8sT0FBTyxTQUFTO0FBQ3ZCLGFBQU8sYUFBYSxTQUFTO0FBRTdCLFVBQUksU0FBUyxTQUFTO0FBRWxCLGVBQU8sU0FBUyxTQUFTLFFBQVEsSUFBSSxRQUFRO0FBQzdDLGVBQU8sY0FBYyxTQUFTLFFBQVEsSUFBSSxjQUFjO0FBRXhELFlBQUksT0FBTyxlQUNKLE9BQU8sWUFBWSxRQUFRLGtCQUFrQixNQUFNLElBQUk7QUFFMUQsaUJBQU8sWUFBWTtBQUFBLFFBQ3ZCO0FBQUEsTUFDSjtBQUVBLFVBQUksU0FBUyxXQUFXLEtBQUs7QUFFekIsZUFBTyxxQkFBcUI7QUFFNUI7QUFBQSxVQUNJLE1BQU07QUFBQSxVQUNOO0FBQUEsUUFBQTtBQUdKO0FBQUEsTUFDSjtBQUFBLElBQ0osT0FDSztBQUNELGFBQU8sZUFBZTtBQUFBLElBQzFCO0FBRUEsV0FBTztBQUFBLEVBQ1gsQ0FBQyxFQUNBLEtBQUssU0FBVSxVQUFlO0FBRTNCLFFBQUk7QUFDQSxhQUFPLFNBQVMsS0FBQTtBQUFBLElBQ3BCLFNBQ08sT0FBTztBQUNWLGFBQU8sU0FBUztBQUFBO0FBQUEsSUFFcEI7QUFBQSxFQUNKLENBQUMsRUFDQSxLQUFLLFNBQVUsUUFBUTtBQUVwQixXQUFPLFdBQVc7QUFFbEIsUUFBSSxVQUNHLE9BQU8sY0FBYyxRQUMxQjtBQUNFLFVBQUk7QUFFQSxlQUFPLFdBQVcsS0FBSyxNQUFNLE1BQU07QUFBQSxNQUN2QyxTQUNPLEtBQUs7QUFDUixlQUFPLFNBQVM7QUFBQTtBQUFBLE1BRXBCO0FBQUEsSUFDSjtBQUVBLFFBQUksQ0FBQyxPQUFPLElBQUk7QUFFWixZQUFNO0FBQUEsSUFDVjtBQUVBO0FBQUEsTUFDSSxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQUE7QUFBQSxFQUVSLENBQUMsRUFDQSxLQUFLLFdBQVk7QUFFZCxRQUFJLGNBQWM7QUFFZCxhQUFPLGFBQWE7QUFBQSxRQUNoQixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsTUFBQTtBQUFBLElBRXJCO0FBQUEsRUFDSixDQUFDLEVBQ0EsTUFBTSxTQUFVLE9BQU87QUFFcEIsV0FBTyxTQUFTO0FBRWhCO0FBQUEsTUFDSSxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQUE7QUFBQSxFQUVSLENBQUM7QUFDVDtBQUVPLE1BQU0sUUFBUSxDQUFDLFVBQW1EO0FBRXJFLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQ2pRQSxNQUFNLE9BQU87QUFBQSxFQUVULFVBQVU7QUFDZDtBQ0VBLE1BQXFCLFdBQWtDO0FBQUEsRUFFbkQsWUFDSSxNQUNBLEtBQ0EsV0FDQSxnQkFBa0U7QUFRL0Q7QUFDQTtBQUNBO0FBQ0E7QUFUSCxTQUFLLE9BQU87QUFDWixTQUFLLE1BQU07QUFDWCxTQUFLLFlBQVk7QUFDakIsU0FBSyxpQkFBaUI7QUFBQSxFQUMxQjtBQU1KO0FDdEJBLE1BQU0sYUFBYTtBQUFBLEVBRWYscUJBQXFCLENBQUMsVUFBa0I7QUFFcEMsVUFBTSxRQUFRLEtBQUssTUFBTSxRQUFRLEVBQUU7QUFFbkMsWUFBUSxRQUFRLEtBQUs7QUFBQSxFQUN6QjtBQUFBLEVBRUEsdUJBQXVCLENBQUMsVUFBa0I7QUFFdEMsVUFBTSxRQUFRLEtBQUssTUFBTSxRQUFRLEVBQUU7QUFFbkMsV0FBTyxRQUFRO0FBQUEsRUFDbkI7QUFBQSxFQUVBLHVCQUF1QixDQUFDLE9BQXVCO0FBRTNDLFVBQU0sU0FBUyxLQUFLO0FBRXBCLFdBQU8sV0FBVywwQkFBMEIsTUFBTTtBQUFBLEVBQ3REO0FBQUEsRUFFQSxZQUFZLENBQ1IsT0FDQSxPQUNBLGFBQWEsTUFDSjtBQUVULGFBQVMsSUFBSSxZQUFZLElBQUksTUFBTSxRQUFRLEtBQUs7QUFFNUMsVUFBSSxNQUFNLFNBQVMsTUFBTSxDQUFDLENBQUMsTUFBTSxNQUFNO0FBRW5DLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxjQUFjLENBQUMsYUFBNkI7QUFFeEMsUUFBSSxVQUFVLFNBQVMsTUFBTSxZQUFZO0FBRXpDLFFBQUksV0FDRyxRQUFRLFNBQVMsR0FDdEI7QUFDRSxhQUFPLFFBQVEsQ0FBQztBQUFBLElBQ3BCO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGdCQUFnQixDQUNaLE9BQ0EsY0FBc0I7QUFFdEIsUUFBSSxTQUFTLE1BQU07QUFDbkIsUUFBSUMsU0FBUTtBQUVaLGFBQVMsSUFBSSxHQUFHLElBQUksUUFBUSxLQUFLO0FBRTdCLFVBQUksTUFBTSxDQUFDLE1BQU0sV0FBVztBQUN4QixRQUFBQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBRUEsV0FBT0E7QUFBQSxFQUNYO0FBQUEsRUFFQSwyQkFBMkIsQ0FBQyxXQUEyQjtBQUVuRCxVQUFNLE9BQU8sS0FBSyxNQUFNLFNBQVMsRUFBRTtBQUNuQyxVQUFNLGtCQUFrQixTQUFTO0FBQ2pDLFVBQU0seUJBQXlCLEtBQUssTUFBTSxrQkFBa0IsRUFBRSxJQUFJO0FBRWxFLFFBQUksU0FBaUI7QUFFckIsUUFBSSxPQUFPLEdBQUc7QUFFVixlQUFTLEdBQUcsSUFBSTtBQUFBLElBQ3BCO0FBRUEsUUFBSSx5QkFBeUIsR0FBRztBQUU1QixlQUFTLEdBQUcsTUFBTSxHQUFHLHNCQUFzQjtBQUFBLElBQy9DO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLG9CQUFvQixDQUFDLFVBQThDO0FBRS9ELFFBQUksVUFBVSxRQUNQLFVBQVUsUUFBVztBQUV4QixhQUFPO0FBQUEsSUFDWDtBQUVBLFlBQVEsR0FBRyxLQUFLO0FBRWhCLFdBQU8sTUFBTSxNQUFNLE9BQU8sTUFBTTtBQUFBLEVBQ3BDO0FBQUEsRUFFQSxrQkFBa0IsQ0FBQyxHQUFhLE1BQXlCO0FBRXJELFFBQUksTUFBTSxHQUFHO0FBRVQsYUFBTztBQUFBLElBQ1g7QUFFQSxRQUFJLE1BQU0sUUFDSCxNQUFNLE1BQU07QUFFZixhQUFPO0FBQUEsSUFDWDtBQUVBLFFBQUksRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUV2QixhQUFPO0FBQUEsSUFDWDtBQU9BLFVBQU0sSUFBYyxDQUFDLEdBQUcsQ0FBQztBQUN6QixVQUFNLElBQWMsQ0FBQyxHQUFHLENBQUM7QUFFekIsTUFBRSxLQUFBO0FBQ0YsTUFBRSxLQUFBO0FBRUYsYUFBUyxJQUFJLEdBQUcsSUFBSSxFQUFFLFFBQVEsS0FBSztBQUUvQixVQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHO0FBRWYsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLFFBQVEsT0FBK0I7QUFFbkMsUUFBSSxlQUFlLE1BQU07QUFDekIsUUFBSTtBQUNKLFFBQUk7QUFHSixXQUFPLE1BQU0sY0FBYztBQUd2QixvQkFBYyxLQUFLLE1BQU0sS0FBSyxPQUFBLElBQVcsWUFBWTtBQUNyRCxzQkFBZ0I7QUFHaEIsdUJBQWlCLE1BQU0sWUFBWTtBQUNuQyxZQUFNLFlBQVksSUFBSSxNQUFNLFdBQVc7QUFDdkMsWUFBTSxXQUFXLElBQUk7QUFBQSxJQUN6QjtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxXQUFXLENBQUMsVUFBd0I7QUFFaEMsUUFBSSxXQUFXLG1CQUFtQixLQUFLLE1BQU0sTUFBTTtBQUUvQyxhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU8sQ0FBQyxNQUFNLEtBQUs7QUFBQSxFQUN2QjtBQUFBLEVBRUEsbUJBQW1CLENBQUMsVUFBd0I7QUFFeEMsUUFBSSxDQUFDLFdBQVcsVUFBVSxLQUFLLEdBQUc7QUFFOUIsYUFBTztBQUFBLElBQ1g7QUFFQSxXQUFPLENBQUMsUUFBUTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxlQUFlLENBQUksVUFBNkI7QUFFNUMsUUFBSSxJQUFJLElBQUksS0FBSyxFQUFFLFNBQVMsTUFBTSxRQUFRO0FBRXRDLGFBQU87QUFBQSxJQUNYO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLFFBQVEsQ0FBSSxRQUFrQixXQUEyQjtBQUVyRCxXQUFPLFFBQVEsQ0FBQyxTQUFZO0FBRXhCLGFBQU8sS0FBSyxJQUFJO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUVBLDJCQUEyQixDQUFDLFVBQWlDO0FBRXpELFFBQUksQ0FBQyxPQUFPO0FBRVIsYUFBTztBQUFBLElBQ1g7QUFFQSxXQUFPLFdBQVcsMEJBQTBCLEtBQUssTUFBTSxLQUFLLENBQUM7QUFBQSxFQUNqRTtBQUFBLEVBRUEsMkJBQTJCLENBQUMsVUFBaUM7QUFFekQsUUFBSSxDQUFDLE9BQU87QUFFUixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU8sS0FBSztBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLG1CQUFtQixDQUFDLFVBQXdCO0FBRXhDLFFBQUksQ0FBQyxXQUFXLFVBQVUsS0FBSyxHQUFHO0FBRTlCLGFBQU87QUFBQSxJQUNYO0FBRUEsV0FBTyxPQUFPLEtBQUssS0FBSztBQUFBLEVBQzVCO0FBQUEsRUFFQSxTQUFTLE1BQWM7QUFFbkIsVUFBTSxNQUFZLElBQUksS0FBSyxLQUFLLEtBQUs7QUFDckMsVUFBTSxPQUFlLEdBQUcsSUFBSSxZQUFBLENBQWEsS0FBSyxJQUFJLFNBQUEsSUFBYSxHQUFHLFNBQUEsRUFBVyxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxRQUFBLEVBQVUsU0FBQSxFQUFXLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLFNBQUEsRUFBVyxTQUFBLEVBQVcsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLElBQUksV0FBQSxFQUFhLFNBQUEsRUFBVyxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxXQUFBLEVBQWEsU0FBQSxFQUFXLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxJQUFJLGtCQUFrQixTQUFBLEVBQVcsU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUU5VSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsZ0JBQWdCLENBQUMsVUFBaUM7QUFFOUMsUUFBSSxXQUFXLG1CQUFtQixLQUFLLE1BQU0sTUFBTTtBQUUvQyxhQUFPLENBQUE7QUFBQSxJQUNYO0FBRUEsVUFBTSxVQUFVLE1BQU0sTUFBTSxTQUFTO0FBQ3JDLFVBQU0sVUFBeUIsQ0FBQTtBQUUvQixZQUFRLFFBQVEsQ0FBQyxVQUFrQjtBQUUvQixVQUFJLENBQUMsV0FBVyxtQkFBbUIsS0FBSyxHQUFHO0FBRXZDLGdCQUFRLEtBQUssTUFBTSxNQUFNO0FBQUEsTUFDN0I7QUFBQSxJQUNKLENBQUM7QUFFRCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsYUFBYSxDQUFDLFVBQWlDO0FBRTNDLFFBQUksV0FBVyxtQkFBbUIsS0FBSyxNQUFNLE1BQU07QUFFL0MsYUFBTyxDQUFBO0FBQUEsSUFDWDtBQUVBLFVBQU0sVUFBVSxNQUFNLE1BQU0sR0FBRztBQUMvQixVQUFNLFVBQXlCLENBQUE7QUFFL0IsWUFBUSxRQUFRLENBQUMsVUFBa0I7QUFFL0IsVUFBSSxDQUFDLFdBQVcsbUJBQW1CLEtBQUssR0FBRztBQUV2QyxnQkFBUSxLQUFLLE1BQU0sTUFBTTtBQUFBLE1BQzdCO0FBQUEsSUFDSixDQUFDO0FBRUQsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLHdCQUF3QixDQUFDLFVBQWlDO0FBRXRELFdBQU8sV0FDRixlQUFlLEtBQUssRUFDcEIsS0FBQTtBQUFBLEVBQ1Q7QUFBQSxFQUVBLGVBQWUsQ0FBQyxVQUFpQztBQUU3QyxRQUFJLENBQUMsU0FDRSxNQUFNLFdBQVcsR0FBRztBQUV2QixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU8sTUFBTSxLQUFLLElBQUk7QUFBQSxFQUMxQjtBQUFBLEVBRUEsbUJBQW1CLENBQUMsV0FBMEI7QUFFMUMsUUFBSSxXQUFXLE1BQU07QUFFakIsYUFBTyxPQUFPLFlBQVk7QUFFdEIsZUFBTyxZQUFZLE9BQU8sVUFBVTtBQUFBLE1BQ3hDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUVBLE9BQU8sQ0FBQyxNQUF1QjtBQUUzQixXQUFPLElBQUksTUFBTTtBQUFBLEVBQ3JCO0FBQUEsRUFFQSxnQkFBZ0IsQ0FDWixPQUNBLFlBQW9CLFFBQWdCO0FBRXBDLFFBQUksV0FBVyxtQkFBbUIsS0FBSyxNQUFNLE1BQU07QUFFL0MsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLG9CQUE0QixXQUFXLHFCQUFxQixLQUFLO0FBRXZFLFFBQUksb0JBQW9CLEtBQ2pCLHFCQUFxQixXQUFXO0FBRW5DLFlBQU1DLFVBQVMsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUM7QUFFcEQsYUFBTyxXQUFXLG1CQUFtQkEsT0FBTTtBQUFBLElBQy9DO0FBRUEsUUFBSSxNQUFNLFVBQVUsV0FBVztBQUUzQixhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sU0FBUyxNQUFNLE9BQU8sR0FBRyxTQUFTO0FBRXhDLFdBQU8sV0FBVyxtQkFBbUIsTUFBTTtBQUFBLEVBQy9DO0FBQUEsRUFFQSxvQkFBb0IsQ0FBQyxVQUEwQjtBQUUzQyxRQUFJLFNBQWlCLE1BQU0sS0FBQTtBQUMzQixRQUFJLG1CQUEyQjtBQUMvQixRQUFJLGFBQXFCO0FBQ3pCLFFBQUksZ0JBQXdCLE9BQU8sT0FBTyxTQUFTLENBQUM7QUFFcEQsUUFBSSw2QkFDQSxpQkFBaUIsS0FBSyxhQUFhLEtBQ2hDLFdBQVcsS0FBSyxhQUFhO0FBR3BDLFdBQU8sK0JBQStCLE1BQU07QUFFeEMsZUFBUyxPQUFPLE9BQU8sR0FBRyxPQUFPLFNBQVMsQ0FBQztBQUMzQyxzQkFBZ0IsT0FBTyxPQUFPLFNBQVMsQ0FBQztBQUV4QyxtQ0FDSSxpQkFBaUIsS0FBSyxhQUFhLEtBQ2hDLFdBQVcsS0FBSyxhQUFhO0FBQUEsSUFDeEM7QUFFQSxXQUFPLEdBQUcsTUFBTTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxzQkFBc0IsQ0FBQyxVQUEwQjtBQUU3QyxRQUFJO0FBRUosYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUVuQyxrQkFBWSxNQUFNLENBQUM7QUFFbkIsVUFBSSxjQUFjLFFBQ1gsY0FBYyxNQUFNO0FBRXZCLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxzQkFBc0IsQ0FBQyxVQUEwQjtBQUU3QyxXQUFPLE1BQU0sT0FBTyxDQUFDLEVBQUUsZ0JBQWdCLE1BQU0sTUFBTSxDQUFDO0FBQUEsRUFDeEQ7QUFBQSxFQUVBLGNBQWMsQ0FBQyxZQUFxQixVQUFrQjtBQUVsRCxRQUFJLEtBQUksb0JBQUksS0FBQSxHQUFPLFFBQUE7QUFFbkIsUUFBSSxLQUFNLGVBQ0gsWUFBWSxPQUNYLFlBQVksSUFBQSxJQUFRLE9BQVU7QUFFdEMsUUFBSSxVQUFVO0FBRWQsUUFBSSxDQUFDLFdBQVc7QUFDWixnQkFBVTtBQUFBLElBQ2Q7QUFFQSxVQUFNLE9BQU8sUUFDUjtBQUFBLE1BQ0c7QUFBQSxNQUNBLFNBQVUsR0FBRztBQUVULFlBQUksSUFBSSxLQUFLLE9BQUEsSUFBVztBQUV4QixZQUFJLElBQUksR0FBRztBQUVQLGVBQUssSUFBSSxLQUFLLEtBQUs7QUFDbkIsY0FBSSxLQUFLLE1BQU0sSUFBSSxFQUFFO0FBQUEsUUFDekIsT0FDSztBQUVELGVBQUssS0FBSyxLQUFLLEtBQUs7QUFDcEIsZUFBSyxLQUFLLE1BQU0sS0FBSyxFQUFFO0FBQUEsUUFDM0I7QUFFQSxnQkFBUSxNQUFNLE1BQU0sSUFBSyxJQUFJLElBQU0sR0FBTSxTQUFTLEVBQUU7QUFBQSxNQUN4RDtBQUFBLElBQUE7QUFHUixXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsZUFBZSxNQUFlO0FBVTFCLFFBQUksV0FBZ0I7QUFDcEIsUUFBSSxhQUFhLFNBQVM7QUFDMUIsUUFBSSxTQUFTLE9BQU87QUFDcEIsUUFBSSxhQUFhLE9BQU87QUFDeEIsUUFBSSxVQUFVLE9BQU8sU0FBUyxRQUFRO0FBQ3RDLFFBQUksV0FBVyxPQUFPLFVBQVUsUUFBUSxNQUFNLElBQUk7QUFDbEQsUUFBSSxjQUFjLE9BQU8sVUFBVSxNQUFNLE9BQU87QUFFaEQsUUFBSSxhQUFhO0FBRWIsYUFBTztBQUFBLElBQ1gsV0FDUyxlQUFlLFFBQ2pCLE9BQU8sZUFBZSxlQUN0QixlQUFlLGlCQUNmLFlBQVksU0FDWixhQUFhLE9BQU87QUFFdkIsYUFBTztBQUFBLElBQ1g7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUNKO0FDdGRBLE1BQXFCLFdBQWtDO0FBQUEsRUFFbkQsWUFBWSxLQUFhO0FBS2xCO0FBSEgsU0FBSyxNQUFNO0FBQUEsRUFDZjtBQUdKO0FDUkEsTUFBcUIsZUFBMEM7QUFBQSxFQUUzRCxZQUFZLEtBQWE7QUFLbEI7QUFDQSxnQ0FBc0I7QUFDdEIsbUNBQXVCO0FBQ3ZCLG9DQUF3QjtBQUN4Qiw2Q0FBbUMsQ0FBQTtBQUNuQyxnREFBc0MsQ0FBQTtBQVJ6QyxTQUFLLE1BQU07QUFBQSxFQUNmO0FBUUo7QUNSQSxNQUFNLG1CQUFtQixDQUFDLFNBQWtDO0FBRXhELFFBQU0sZUFBOEI7QUFBQSxJQUVoQyxLQUFLLEdBQUcsU0FBUyxNQUFNLEdBQUcsU0FBUyxRQUFRO0FBQUEsRUFBQTtBQUcvQyxNQUFJLENBQUMsS0FBSyxVQUFVO0FBRWhCLFdBQU8sYUFBYTtBQUFBLEVBQ3hCO0FBRUE7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixTQUFPLGFBQWE7QUFDeEI7QUFFQSxNQUFNLGtCQUFrQixDQUNwQixjQUNBLGFBQ087QVIvQlg7QVFpQ0ksTUFBSSxDQUFDLFVBQVU7QUFDWDtBQUFBLEVBQ0o7QUFFQSxPQUFJLGNBQVMsU0FBVCxtQkFBZSxNQUFNO0FBRXJCLFFBQUksTUFBTSxhQUFhO0FBQ3ZCLFVBQU0sR0FBRyxHQUFHLElBQUksU0FBUyxFQUFFO0FBQzNCLGlCQUFhLE1BQU07QUFFbkI7QUFBQSxNQUNJO0FBQUEsTUFDQSxTQUFTLEtBQUs7QUFBQSxJQUFBO0FBQUEsRUFFdEIsV0FDUyxDQUFDQyxXQUFFLG1CQUFtQixTQUFTLE9BQU8sR0FBRztBQUU5QyxRQUFJLE1BQU0sYUFBYTtBQUN2QixVQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsRUFBRTtBQUMzQixpQkFBYSxNQUFNO0FBQUEsRUFDdkIsV0FDUyxDQUFDLFNBQVMsUUFDWixDQUFDLFNBQVMsVUFDZjtBQUNFLFFBQUksTUFBTSxhQUFhO0FBQ3ZCLFVBQU0sR0FBRyxHQUFHLElBQUksU0FBUyxFQUFFO0FBQzNCLGlCQUFhLE1BQU07QUFBQSxFQUN2QjtBQUVBO0FBQUEsSUFDSTtBQUFBLElBQ0EsU0FBUztBQUFBLEVBQUE7QUFFakI7QUFHQSxNQUFNLGVBQWU7QUFBQSxFQUVqQixVQUFVLE1BQVk7QUFFbEIsV0FBTyxVQUFVLE9BQU8sWUFBWTtBQUNwQyxXQUFPLFVBQVUsT0FBTyxzQkFBc0I7QUFBQSxFQUNsRDtBQUFBLEVBRUEseUJBQXlCLENBQUMsVUFBd0I7QVI3RXREO0FRK0VRLFFBQUksTUFBTSxZQUFZLGdCQUFnQixNQUFNO0FBQ3hDO0FBQUEsSUFDSjtBQUVBLFVBQU0sWUFBWSxhQUFhO0FBRS9CLFFBQUksR0FBQyxXQUFNLFlBQVksbUJBQWxCLG1CQUFrQyxZQUNoQyxHQUFDLFdBQU0sWUFBWSxpQkFBbEIsbUJBQWdDLE9BQ3RDO0FBQ0U7QUFBQSxJQUNKO0FBRUEsaUJBQWEsU0FBQTtBQUNiLFVBQU1DLFlBQVcsT0FBTztBQUN4QixRQUFJO0FBRUosUUFBSSxPQUFPLFFBQVEsT0FBTztBQUV0QixnQkFBVSxPQUFPLFFBQVEsTUFBTTtBQUFBLElBQ25DLE9BQ0s7QUFDRCxnQkFBVSxHQUFHQSxVQUFTLE1BQU0sR0FBR0EsVUFBUyxRQUFRLEdBQUdBLFVBQVMsTUFBTTtBQUFBLElBQ3RFO0FBRUEsVUFBTSxNQUFNLGlCQUFpQixNQUFNLFlBQVksYUFBYSxJQUFJO0FBRWhFLFFBQUksV0FDRyxRQUFRLFNBQVM7QUFDcEI7QUFBQSxJQUNKO0FBRUEsWUFBUTtBQUFBLE1BQ0osSUFBSSxlQUFlLEdBQUc7QUFBQSxNQUN0QjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osVUFBTSxZQUFZLGFBQWEsS0FBSyxJQUFJLFdBQVcsR0FBRyxDQUFDO0FBQUEsRUFDM0Q7QUFDSjtBQzNHQSxJQUFJLFFBQVE7QUFFWixNQUFNLGFBQWE7QUFBQSxFQUVmLFVBQVUsQ0FBQyxVQUF3QjtBQUUvQixVQUFNLFlBQVksR0FBRyxNQUFNO0FBQzNCLFVBQU0sWUFBWSxjQUFjO0FBQUEsRUFDcEM7QUFBQSxFQUVBLGdCQUFnQixDQUFDLFVBQTBCO0FBRXZDLFVBQU0sVUFBVSxFQUFFLE1BQU07QUFFeEIsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGFBQWEsQ0FBQyxVQUEwQjtBQUVwQyxXQUFPLEdBQUcsV0FBVyxlQUFlLEtBQUssQ0FBQztBQUFBLEVBQzlDO0FBQUEsRUFFQSxZQUFZLE1BQWM7QUFFdEIsV0FBT0QsV0FBRSxhQUFBO0FBQUEsRUFDYjtBQUFBLEVBRUEsWUFBWSxDQUFDLFVBQTBCO0FBRW5DLFFBQUksTUFBTSxZQUFZLGVBQWUsTUFBTTtBQUV2QyxtQkFBYSx3QkFBd0IsS0FBSztBQUFBLElBQzlDO0FBRUEsUUFBSSxXQUFtQixFQUFFLEdBQUcsTUFBQTtBQUU1QixXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsOEJBQThCLENBQzFCLE9BQ0EsTUFDQSxXQUNBLEtBQ0EsbUJBQ087QUFFUCxZQUFRLElBQUksSUFBSTtBQUNoQixZQUFRLElBQUksR0FBRztBQUVmLFFBQUksUUFBUSxHQUFHO0FBQ1g7QUFBQSxJQUNKO0FBRUEsUUFBSSxJQUFJLFNBQVMsZ0JBQWdCLEdBQUc7QUFDaEM7QUFBQSxJQUNKO0FBRUEsVUFBTSxTQUFrQyxNQUNuQyxjQUNBLHVCQUNBLEtBQUssQ0FBQ0UsWUFBd0I7QUFFM0IsYUFBT0EsUUFBTyxTQUFTLFFBQ2hCQSxRQUFPLFFBQVE7QUFBQSxJQUMxQixDQUFDO0FBRUwsUUFBSSxRQUFRO0FBQ1I7QUFBQSxJQUNKO0FBRUEsVUFBTUMsY0FBMEIsSUFBSTtBQUFBLE1BQ2hDO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFVBQU0sY0FBYyx1QkFBdUIsS0FBS0EsV0FBVTtBQUFBLEVBQzlEO0FBQUEsRUFFQSx1QkFBdUIsQ0FDbkIsT0FDQSxtQkFBa0M7QUFFbEMsVUFBTSxjQUFjLG1CQUFtQixLQUFLLGNBQWM7QUFBQSxFQUM5RDtBQUFBLEVBRUEsdUJBQXVCLENBQ25CLE9BQ0EsUUFDQSxlQUM0QjtBQUU1QixRQUFJSCxXQUFFLG1CQUFtQixVQUFVLEdBQUc7QUFFbEMsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLE1BQU0sV0FBVztBQUFBLE1BQ25CO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixVQUFNLGNBQWMsTUFBTSxZQUFZLHNCQUFzQixHQUFHLEtBQUs7QUFFcEUsUUFBSSxDQUFDLGFBQWE7QUFFZCxjQUFRLElBQUksc0JBQXNCO0FBQUEsSUFDdEM7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsbUJBQW1CLENBQ2YsT0FDQSxRQUNBLGdCQUNPO0FBRVAsUUFBSSxDQUFDLGFBQWE7QUFDZDtBQUFBLElBQ0o7QUFFQSxVQUFNLE1BQU0sV0FBVztBQUFBLE1BQ25CO0FBQUEsTUFDQSxZQUFZO0FBQUEsSUFBQTtBQUdoQixRQUFJLE1BQU0sWUFBWSxzQkFBc0IsR0FBRyxHQUFHO0FBQzlDO0FBQUEsSUFDSjtBQUVBLFVBQU0sWUFBWSxzQkFBc0IsR0FBRyxJQUFJO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLHlCQUF5QixDQUNyQixPQUNBLFFBQ0EsZUFDeUI7QUFFekIsUUFBSUEsV0FBRSxtQkFBbUIsVUFBVSxNQUFNLE1BQU07QUFFM0MsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLE1BQU0sV0FBVztBQUFBLE1BQ25CO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLE1BQU0sWUFBWSx3QkFBd0IsR0FBRyxLQUFLO0FBQUEsRUFDN0Q7QUFBQSxFQUVBLHFCQUFxQixDQUNqQixPQUNBLG1CQUNPO0FBRVAsUUFBSSxDQUFDLGdCQUFnQjtBQUNqQjtBQUFBLElBQ0o7QUFFQSxVQUFNLE1BQU0sV0FBVyx3QkFBd0IsY0FBYztBQUU3RCxRQUFJQSxXQUFFLG1CQUFtQixHQUFHLE1BQU0sTUFBTTtBQUNwQztBQUFBLElBQ0o7QUFFQSxRQUFJLE1BQU0sWUFBWSx3QkFBd0IsR0FBYSxHQUFHO0FBQzFEO0FBQUEsSUFDSjtBQUVBLFVBQU0sWUFBWSx3QkFBd0IsR0FBYSxJQUFJO0FBQUEsRUFDL0Q7QUFBQSxFQUVBLHlCQUF5QixDQUFDLG1CQUFtRDtBQUV6RSxXQUFPLFdBQVc7QUFBQSxNQUNkLGVBQWUsUUFBUTtBQUFBLE1BQ3ZCLGVBQWU7QUFBQSxJQUFBO0FBQUEsRUFFdkI7QUFBQSxFQUVBLGFBQWEsQ0FFVCxRQUNBLGVBQ1M7QUFFVCxXQUFPLEdBQUcsTUFBTSxJQUFJLFVBQVU7QUFBQSxFQUNsQztBQUNKO0FDek1BLE1BQU0sc0JBQXNCO0FBQUEsRUFFeEIscUJBQXFCLENBQUMsVUFBd0I7QUFFMUMsVUFBTSxLQUFLLGFBQWE7QUFDeEIsVUFBTSxLQUFLLE9BQU87QUFDbEIsVUFBTSxLQUFLLE1BQU07QUFDakIsVUFBTSxLQUFLLFlBQVk7QUFBQSxFQUMzQjtBQUNKO0FDWE8sSUFBSywrQkFBQUksZ0JBQUw7QUFFSEEsY0FBQSxNQUFBLElBQU87QUFDUEEsY0FBQSxjQUFBLElBQWU7QUFDZkEsY0FBQSxVQUFBLElBQVc7QUFDWEEsY0FBQSxpQkFBQSxJQUFrQjtBQUNsQkEsY0FBQSxrQkFBQSxJQUFtQjtBQUNuQkEsY0FBQSxTQUFBLElBQVU7QUFDVkEsY0FBQSxTQUFBLElBQVU7QUFDVkEsY0FBQSxTQUFBLElBQVU7QUFDVkEsY0FBQSxVQUFBLElBQVc7QUFDWEEsY0FBQSxZQUFBLElBQWE7QUFDYkEsY0FBQSxhQUFBLElBQWM7QUFDZEEsY0FBQSxrQkFBQSxJQUFtQjtBQWJYLFNBQUFBO0FBQUEsR0FBQSxjQUFBLENBQUEsQ0FBQTtBQ0daLE1BQU0sa0JBQWtCO0FBQUEsRUFFcEIsY0FBYyxDQUNWLE9BQ0EsUUFDQSxXQUFnQztBQUVoQyxRQUFJLFVBQVUsSUFBSSxRQUFBO0FBQ2xCLFlBQVEsT0FBTyxnQkFBZ0Isa0JBQWtCO0FBQ2pELFlBQVEsT0FBTyxVQUFVLEdBQUc7QUFDNUIsWUFBUSxPQUFPLGtCQUFrQixNQUFNLFNBQVMsY0FBYztBQUM5RCxZQUFRLE9BQU8sVUFBVSxNQUFNO0FBQy9CLFlBQVEsT0FBTyxVQUFVLE1BQU07QUFFL0IsWUFBUSxPQUFPLG1CQUFtQixNQUFNO0FBRXhDLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUNYQSxNQUFNLHlCQUF5QjtBQUFBLEVBRTNCLHdCQUF3QixDQUFDLFVBQThDO0FBRW5FLFFBQUksQ0FBQyxPQUFPO0FBQ1I7QUFBQSxJQUNKO0FBRUEsVUFBTSxTQUFpQkosV0FBRSxhQUFBO0FBRXpCLFFBQUksVUFBVSxnQkFBZ0I7QUFBQSxNQUMxQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFdBQVc7QUFBQSxJQUFBO0FBR2YsVUFBTSxNQUFjLEdBQUcsTUFBTSxTQUFTLE1BQU0sSUFBSSxNQUFNLFNBQVMsUUFBUTtBQUV2RSxXQUFPLG1CQUFtQjtBQUFBLE1BQ3RCO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDTCxRQUFRO0FBQUEsUUFDUjtBQUFBLE1BQUE7QUFBQSxNQUVKLFVBQVU7QUFBQSxNQUNWLFFBQVEsdUJBQXVCO0FBQUEsTUFDL0IsT0FBTyxDQUFDSyxRQUFlLGlCQUFzQjtBQUV6QyxnQkFBUSxJQUFJO0FBQUE7QUFBQSw2QkFFQyxHQUFHO0FBQUEsdUNBQ08sS0FBSyxVQUFVLFlBQVksQ0FBQztBQUFBLCtCQUNwQyxLQUFLLFVBQVUsYUFBYSxLQUFLLENBQUM7QUFBQSxnQ0FDakMsdUJBQXVCLHVCQUF1QixJQUFJO0FBQUEsK0JBQ25ELE1BQU07QUFBQSxrQkFDbkI7QUFFRixjQUFNO0FBQUE7QUFBQSw2QkFFTyxHQUFHO0FBQUEsdUNBQ08sS0FBSyxVQUFVLFlBQVksQ0FBQztBQUFBLCtCQUNwQyxLQUFLLFVBQVUsYUFBYSxLQUFLLENBQUM7QUFBQTtBQUFBLCtCQUVsQyxNQUFNO0FBQUEsK0JBQ04sS0FBSyxVQUFVQSxNQUFLLENBQUM7QUFBQSxrQkFDbEM7QUFFRixlQUFPLFdBQVcsV0FBV0EsTUFBSztBQUFBLE1BQ3RDO0FBQUEsSUFBQSxDQUNIO0FBQUEsRUFDTDtBQUNKO0FDckRBLE1BQU0seUJBQXlCO0FBQUEsRUFFM0IsOEJBQThCLENBQzFCLE9BQ0EsYUFBa0M7QUFFbEMsUUFBSSxDQUFDLFNBQ0UsQ0FBQyxZQUNELFNBQVMsY0FBYyxVQUN2QixDQUFDLFNBQVMsVUFBVTtBQUV2QixhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sU0FBYyxTQUFTO0FBRTdCLFVBQU0sT0FBWSxPQUFPO0FBQUEsTUFDckIsQ0FBQyxVQUFlLE1BQU0sU0FBUztBQUFBLElBQUE7QUFHbkMsVUFBTSxNQUFXLE9BQU87QUFBQSxNQUNwQixDQUFDLFVBQWUsTUFBTSxTQUFTO0FBQUEsSUFBQTtBQUduQyxRQUFJLENBQUMsUUFDRSxDQUFDLEtBQUs7QUFFVCxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0saUJBQXNCLE9BQU87QUFBQSxNQUMvQixDQUFDLFVBQWUsTUFBTSxTQUFTO0FBQUEsSUFBQTtBQUduQyxRQUFJLENBQUMsa0JBQ0UsQ0FBQyxlQUFlLE9BQU87QUFFMUIsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLEtBQUssYUFBYTtBQUN4QixVQUFNLEtBQUssT0FBTyxLQUFLO0FBQ3ZCLFVBQU0sS0FBSyxNQUFNLElBQUk7QUFDckIsVUFBTSxLQUFLLFlBQVksZUFBZTtBQUV0QyxXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLG1CQUFtQixDQUFDLFVBQWtDO0FBRWxELFVBQU0sUUFBb0MsdUJBQXVCLHVCQUF1QixLQUFLO0FBRTdGLFFBQUksQ0FBQyxPQUFPO0FBRVIsYUFBTztBQUFBLElBQ1g7QUFFQSxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsd0JBQXdCLENBQUMsVUFBOEM7QUFFbkUsVUFBTSxLQUFLLE1BQU07QUFFakIsV0FBTyx1QkFBdUIsdUJBQXVCLEtBQUs7QUFBQSxFQUM5RDtBQUFBLEVBRUEsT0FBTyxDQUFDLFVBQWtDO0FBRXRDLFVBQU0sYUFBYSxPQUFPLFNBQVM7QUFFbkMsbUJBQWU7QUFBQSxNQUNYLEtBQUs7QUFBQSxNQUNMO0FBQUEsSUFBQTtBQUdKLFVBQU0sTUFBYyxHQUFHLE1BQU0sU0FBUyxNQUFNLElBQUksTUFBTSxTQUFTLGdCQUFnQjtBQUMvRSxXQUFPLFNBQVMsT0FBTyxHQUFHO0FBRTFCLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxxQkFBcUIsQ0FBQyxVQUFrQztBQUNwRCx3QkFBb0Isb0JBQW9CLEtBQUs7QUFFN0MsV0FBTyxXQUFXLFdBQVcsS0FBSztBQUFBLEVBQ3RDO0FBQUEsRUFFQSxpQ0FBaUMsQ0FBQyxVQUFrQztBQUVoRSx3QkFBb0Isb0JBQW9CLEtBQUs7QUFFN0MsV0FBTyx1QkFBdUIsTUFBTSxLQUFLO0FBQUEsRUFDN0M7QUFBQSxFQUVBLFFBQVEsQ0FBQyxVQUFrQztBQUV2QyxXQUFPLFNBQVMsT0FBTyxNQUFNLEtBQUssU0FBUztBQUUzQyxXQUFPO0FBQUEsRUFDWDtBQUNKO0FDMUdPLFNBQVMsbUJBQW1CLE9BQXdCO0FBRXZELFFBQU0sOEJBQXVEO0FBTTdELDhCQUE0Qiw2QkFBNkIsdUJBQXVCO0FBRWhGLFNBQU8sTUFBTSwyQkFBMkI7QUFDNUM7QUNOQSxNQUFNLGlCQUFpQixDQUNuQixVQUNBLFVBQXFCO0FBRXJCO0FBQUEsSUFDSSxNQUFNO0FBQUEsRUFBQTtBQUVkO0FBR0EsTUFBTSxZQUFZLENBQ2QsT0FDQSxrQkFDaUI7QUFFakIsUUFBTSxVQUFpQixDQUFBO0FBRXZCLGdCQUFjLFFBQVEsQ0FBQyxXQUFvQjtBQUV2QyxVQUFNLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQSxPQUFPLENBQUMsUUFBZ0IsaUJBQXNCO0FBRTFDLGdCQUFRLElBQUk7QUFBQTtBQUFBLHVDQUVXLEtBQUssVUFBVSxZQUFZLENBQUM7QUFBQSwrQkFDcEMsS0FBSyxVQUFVLGFBQWEsS0FBSyxDQUFDO0FBQUEsZ0NBQ2pDLFNBQVM7QUFBQSxrQkFDdkI7QUFFRixjQUFNLHVDQUF1QztBQUFBLE1BQ2pEO0FBQUEsSUFBQTtBQUlKLFlBQVEsS0FBSztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFBQSxDQUNIO0FBQUEsRUFDTCxDQUFDO0FBRUQsU0FBTztBQUFBLElBRUgsV0FBVyxXQUFXLEtBQUs7QUFBQSxJQUMzQixHQUFHO0FBQUEsRUFBQTtBQUVYO0FBRUEsTUFBTSxjQUFjLENBQ2hCLE9BQ0Esa0JBQ2lCO0FBRWpCLFFBQU0sVUFBaUIsQ0FBQTtBQUV2QixnQkFBYyxRQUFRLENBQUNGLGdCQUE0QjtBQUUvQztBQUFBLE1BQ0k7QUFBQSxNQUNBQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUixDQUFDO0FBRUQsU0FBTztBQUFBLElBRUgsV0FBVyxXQUFXLEtBQUs7QUFBQSxJQUMzQixHQUFHO0FBQUEsRUFBQTtBQUVYO0FBRUEsTUFBTSxZQUFZLENBQ2QsT0FDQUEsYUFDQSxZQUNPO0FBRVAsUUFBTSxNQUFjQSxZQUFXO0FBQy9CLFFBQU0sU0FBaUJILFdBQUUsYUFBQTtBQUV6QixNQUFJLFVBQVUsZ0JBQWdCO0FBQUEsSUFDMUI7QUFBQSxJQUNBO0FBQUEsSUFDQSxXQUFXO0FBQUEsRUFBQTtBQUdmLFFBQU0sU0FBUyxtQkFBbUI7QUFBQSxJQUM5QjtBQUFBLElBQ0EsV0FBV0csWUFBVztBQUFBLElBQ3RCLFNBQVM7QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSO0FBQUEsSUFBQTtBQUFBLElBRUosVUFBVTtBQUFBLElBQ1YsUUFBUUEsWUFBVztBQUFBLElBQ25CLE9BQU8sQ0FBQyxRQUFnQixpQkFBc0I7QUFFMUMsY0FBUSxJQUFJO0FBQUE7QUFBQSw2QkFFSyxHQUFHO0FBQUEsdUNBQ08sS0FBSyxVQUFVLFlBQVksQ0FBQztBQUFBLCtCQUNwQyxLQUFLLFVBQVUsYUFBYSxLQUFLLENBQUM7QUFBQSxnQ0FDakMsVUFBVSxJQUFJO0FBQUEsK0JBQ2YsTUFBTTtBQUFBLGtCQUNuQjtBQUVOLFlBQU0saURBQWlEO0FBQUEsSUFDM0Q7QUFBQSxFQUFBLENBQ0g7QUFFRCxVQUFRLEtBQUssTUFBTTtBQUN2QjtBQUVBLE1BQU0saUJBQWlCO0FBQUEsRUFFbkIsMkJBQTJCLENBQUMsVUFBa0M7QUFFMUQsUUFBSSxDQUFDLE9BQU87QUFFUixhQUFPO0FBQUEsSUFDWDtBQUVBLFFBQUksTUFBTSxjQUFjLHVCQUF1QixXQUFXLEdBQUc7QUFHekQsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLDZCQUFpRCxNQUFNLGNBQWM7QUFDM0UsVUFBTSxjQUFjLHlCQUF5QixDQUFBO0FBRTdDLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSwwQkFBMEIsQ0FBQyxVQUFrQztBQUV6RCxRQUFJLENBQUMsT0FBTztBQUVSLGFBQU87QUFBQSxJQUNYO0FBRUEsUUFBSSxNQUFNLGNBQWMsbUJBQW1CLFdBQVcsR0FBRztBQUdyRCxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0scUJBQXFDLE1BQU0sY0FBYztBQUMvRCxVQUFNLGNBQWMscUJBQXFCLENBQUE7QUFFekMsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ3BLQSxNQUFNLHNCQUFzQjtBQUFBLEVBRXhCLDBCQUEwQixDQUFDLFVBQWtCO0FBRXpDLFVBQU0sMkJBQTJCLE1BQVc7QUFFeEMsVUFBSSxNQUFNLGNBQWMsdUJBQXVCLFNBQVMsR0FBRztBQUV2RCxlQUFPO0FBQUEsVUFDSCxlQUFlO0FBQUEsVUFDZixFQUFFLE9BQU8sR0FBQTtBQUFBLFFBQUc7QUFBQSxNQUVwQjtBQUFBLElBQ0o7QUFFQSxVQUFNLDJCQUEyQixNQUFXO0FBRXhDLFVBQUksTUFBTSxjQUFjLG1CQUFtQixTQUFTLEdBQUc7QUFFbkQsZUFBTztBQUFBLFVBQ0gsZUFBZTtBQUFBLFVBQ2YsRUFBRSxPQUFPLEdBQUE7QUFBQSxRQUFHO0FBQUEsTUFFcEI7QUFBQSxJQUNKO0FBRUEsVUFBTSxxQkFBNEI7QUFBQSxNQUU5Qix5QkFBQTtBQUFBLE1BQ0EseUJBQUE7QUFBQSxJQUF5QjtBQUc3QixXQUFPO0FBQUEsRUFDWDtBQUNKO0FDcENBLE1BQU0sb0JBQW9CLENBQUMsVUFBa0I7QUFFekMsTUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLEVBQ0o7QUFFQSxRQUFNLGdCQUF1QjtBQUFBLElBRXpCLEdBQUcsb0JBQW9CLHlCQUF5QixLQUFLO0FBQUEsRUFBQTtBQUd6RCxTQUFPO0FBQ1g7QUNmQSxNQUFNLFVBQVU7QUFBQSxFQUVaLGtCQUFrQjtBQUFBLEVBTWxCLHVCQUF1QjtBQUMzQjtBQ1BBLE1BQU0sNEJBQTRCLE1BQU07QUFFcEMsUUFBTSx5QkFBOEMsU0FBUyxpQkFBaUIsUUFBUSxxQkFBcUI7QUFDM0csTUFBSTtBQUNKLE1BQUk7QUFFSixXQUFTLElBQUksR0FBRyxJQUFJLHVCQUF1QixRQUFRLEtBQUs7QUFFcEQsa0JBQWMsdUJBQXVCLENBQUM7QUFDdEMscUJBQWlCLFlBQVksUUFBUTtBQUVyQyxRQUFJLGtCQUFrQixNQUFNO0FBRXhCLGtCQUFZLFlBQVk7QUFDeEIsYUFBTyxZQUFZLFFBQVE7QUFBQSxJQUMvQjtBQUFBLEVBQ0o7QUFDSjtBQ2pCQSxNQUFNLG1CQUFtQixNQUFNO0FBRTNCLDRCQUFBO0FBQ0o7QUNIQSxNQUFNLGFBQWE7QUFBQSxFQUVqQixrQkFBa0IsTUFBTTtBQUV0QixxQkFBQTtBQUFBLEVBQ0Y7QUFBQSxFQUVBLHNCQUFzQixNQUFNO0FBRTFCLFdBQU8sV0FBVyxNQUFNO0FBRXRCLGlCQUFXLGlCQUFBO0FBQUEsSUFDYjtBQUFBLEVBQ0Y7QUFDRjtBQ2RBLE1BQU0sY0FBYztBQUFBLEVBRWhCLFdBQVcsQ0FBQyxVQUEwQjtBdkJMMUM7QXVCT1EsUUFBSSxHQUFDLDRDQUFRLGNBQVIsbUJBQW1CLFdBQW5CLG1CQUEyQixzQkFBcUI7QUFFakQsYUFBTyxVQUFVLE9BQU8sWUFBWTtBQUFBLElBQ3hDLE9BQ0s7QUFDRCxhQUFPLFVBQVUsT0FBTyxzQkFBc0I7QUFBQSxJQUNsRDtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUNoQk8sSUFBSyw4QkFBQUcsZUFBTDtBQUVIQSxhQUFBLE1BQUEsSUFBTztBQUNQQSxhQUFBLE1BQUEsSUFBTztBQUNQQSxhQUFBLE1BQUEsSUFBTztBQUpDLFNBQUFBO0FBQUEsR0FBQSxhQUFBLENBQUEsQ0FBQTtBQ0VaLE1BQXFCLGlCQUE4QztBQUFBLEVBQW5FO0FBRVcsbURBQW1DO0FBQ25DLDRDQUE0QjtBQUM1Qiw2Q0FBNkI7QUFDN0Isc0NBQXNCO0FBQ3RCLHdDQUF1QjtBQUFBO0FBQ2xDO0FDSEEsTUFBcUIsZUFBMEM7QUFBQSxFQUUzRCxZQUNJLElBQ0Esa0JBQ0EsU0FDQSxjQUNGO0FBT0s7QUFDQSxnQ0FBc0I7QUFDdEIsb0NBQTBCO0FBQzFCLG1DQUF5QjtBQUN6QixrQ0FBd0I7QUFDeEIsbUNBQXlCO0FBQ3pCLDBDQUF5QjtBQUN6Qix1Q0FBc0I7QUFDdEIsbUNBQWtCO0FBQ2xCLHFDQUFvQjtBQUNwQjtBQUNBLGlDQUFnQjtBQUNoQixvQ0FBbUM7QUFDbkMsa0NBQWtCO0FBQ2xCLG1DQUFrQyxDQUFBO0FBQ2xDLG9DQUErQyxDQUFBO0FBQy9DLG1DQUF5QixDQUFBO0FBRXpCLGtDQUFpQjtBQUNqQix1Q0FBdUI7QUFDdkIsaUNBQWdCO0FBRWhCLGdDQUE2QjtBQUM3QiwrQkFBNEI7QUFDNUI7QUFDQTtBQUVBLDhCQUF3QixJQUFJLGlCQUFBO0FBakMvQixTQUFLLEtBQUs7QUFDVixTQUFLLFVBQVU7QUFDZixTQUFLLG1CQUFtQjtBQUN4QixTQUFLLGVBQWU7QUFBQSxFQUN4QjtBQThCSjtBQ2hETyxJQUFLLGdDQUFBQyxpQkFBTDtBQUVIQSxlQUFBLE1BQUEsSUFBTztBQUNQQSxlQUFBLE1BQUEsSUFBTztBQUNQQSxlQUFBLE1BQUEsSUFBTztBQUNQQSxlQUFBLE1BQUEsSUFBTztBQUxDLFNBQUFBO0FBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtBQ0daLE1BQXFCLGtCQUFnRDtBQUFBLEVBQXJFO0FBRVcsNkJBQVk7QUFDWjtBQUFBLDZCQUFtQjtBQUNuQjtBQUFBLDZCQUFtQjtBQUNuQjtBQUFBLDZCQUErQjtBQUMvQjtBQUFBLDhCQUFnQztBQUNoQztBQUFBLDZCQUErQixDQUFBO0FBQy9CO0FBQUEsa0NBQW9DO0FBQ3BDLGdDQUFvQixZQUFZO0FBQ2hDLG1DQUFtQjtBQUNuQixrQ0FBa0I7QUFDbEIsa0NBQWtCO0FBQUE7QUFDN0I7QUNYQSxNQUFxQixjQUF3QztBQUFBLEVBRXpELFlBQVksTUFBYztBQUtuQjtBQUNBLGtDQUFTO0FBRVQsNkJBQVk7QUFDWiw2QkFBd0IsSUFBSSxrQkFBQTtBQUM1Qiw2QkFBZ0MsQ0FBQTtBQUNoQztBQUNBO0FBVkgsU0FBSyxPQUFPO0FBQUEsRUFDaEI7QUFVSjtBQ2xCQSxNQUFxQixtQkFBa0Q7QUFBQSxFQUF2RTtBQUVXLDZCQUFZO0FBQ1osNkJBQVk7QUFBQTtBQUN2QjtBQ0FBLE1BQXFCLGFBQXNDO0FBQUEsRUFFdkQsWUFDSSxRQUNBLE9BQ0EsUUFDRjtBQVlLO0FBQ0E7QUFDQSxtQ0FBaUM7QUFDakM7QUFDQSxtQ0FBa0M7QUFmckMsU0FBSyxTQUFTO0FBQ2QsU0FBSyxRQUFRO0FBRWIsU0FBSyxPQUFPLElBQUk7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFPSjtBQzNCQSxNQUFxQixZQUFvQztBQUFBLEVBRXJELFlBQVksSUFBWTtBQUtqQjtBQUNBLGlDQUFnQjtBQUNoQix1Q0FBc0I7QUFDdEIsZ0NBQWU7QUFDZiw2Q0FBbUM7QUFQdEMsU0FBSyxLQUFLO0FBQUEsRUFDZDtBQU9KO0FDZE8sSUFBSyxrQ0FBQUMsbUJBQUw7QUFDSEEsaUJBQUEsTUFBQSxJQUFPO0FBQ1BBLGlCQUFBLElBQUEsSUFBSztBQUNMQSxpQkFBQSxNQUFBLElBQU87QUFIQyxTQUFBQTtBQUFBLEdBQUEsaUJBQUEsQ0FBQSxDQUFBO0FDR1osTUFBcUIsT0FBMEI7QUFBQSxFQUEvQztBQUVXLHFDQUFxQjtBQUNyQiwrQ0FBK0I7QUFDL0Isc0NBQXNCO0FBQ3RCLHVDQUF1QjtBQUN2QiwyQ0FBaUM7QUFDakMscUNBQTJCLGNBQWM7QUFDekMsdUNBQXNCO0FBRXRCLDhCQUFpQjtBQUFBO0FBQzVCO0FDVkEsTUFBcUIsVUFBZ0M7QUFBQSxFQUFyRDtBQUVXLDRDQUFrQztBQUNsQyxrQ0FBa0IsSUFBSSxPQUFBO0FBQUE7QUFDakM7QUNQQSxNQUFNLGlCQUFpQjtBQUFBLEVBRW5CLHVCQUF1QjtBQUFBLEVBQ3ZCLHVCQUF1QjtBQUFBLEVBQ3ZCLHNCQUFzQjtBQUFBLEVBQ3RCLHVCQUF1QjtBQUFBLEVBQ3ZCLDBCQUEwQjtBQUM5QjtBQ0dBLE1BQU0sYUFBYSxDQUFDLGFBQWdDO0FBRWhELFFBQU0sUUFBc0IsSUFBSSxZQUFZLFNBQVMsRUFBRTtBQUN2RCxRQUFNLFFBQVEsU0FBUyxTQUFTO0FBQ2hDLFFBQU0sY0FBYyxTQUFTLGVBQWU7QUFDNUMsUUFBTSxPQUFPLFNBQVMsUUFBUTtBQUM5QixRQUFNLG9CQUFvQixZQUFZLHFCQUFxQixTQUFTLGtCQUFrQjtBQUV0RixTQUFPO0FBQ1g7QUFFQSxNQUFNLHdCQUF3QixDQUMxQixPQUNBLFFBQ087QUFFUCxNQUFJLENBQUMsS0FBSztBQUNOLFdBQU87QUFBQSxFQUNYO0FBdUNBLFFBQU0sUUFBUSxXQUFXLElBQUksS0FBSztBQUVsQyxRQUFNLGVBQWUsSUFBSTtBQUFBLElBQ3JCLFdBQVcsZUFBZSxLQUFLO0FBQUEsSUFDL0I7QUFBQSxJQUNBLElBQUksU0FBUztBQUFBLEVBQUE7QUFHakIsZ0JBQWM7QUFBQSxJQUNWO0FBQUEsSUFDQSxJQUFJO0FBQUEsSUFDSixhQUFhO0FBQUEsRUFBQTtBQUdqQixRQUFNLFlBQVksZUFBZTtBQUNqQyxRQUFNLFlBQVksaUJBQWlCO0FBRW5DLGdCQUFjO0FBQUEsSUFDVjtBQUFBLElBQ0EsTUFBTSxZQUFZO0FBQUEsRUFBQTtBQUUxQjtBQUVBLE1BQU0sY0FBYztBQUFBLEVBRWhCLHNCQUFzQixDQUFDLGVBQXNDO0FBRXpELFFBQUksVUFBVTtBQUVkLFFBQUksQ0FBQ1IsV0FBRSxtQkFBbUIsVUFBVSxHQUFHO0FBRW5DLFVBQUksQ0FBQyxTQUFTLE9BQU8sU0FBUyxHQUFHLEdBQUc7QUFFaEMsWUFBSSxDQUFDLFdBQVcsV0FBVyxHQUFHLEdBQUc7QUFFN0Isb0JBQVU7QUFBQSxRQUNkO0FBQUEsTUFDSixPQUNLO0FBQ0QsWUFBSSxXQUFXLFdBQVcsR0FBRyxNQUFNLE1BQU07QUFFckMsdUJBQWEsV0FBVyxVQUFVLENBQUM7QUFBQSxRQUN2QztBQUFBLE1BQ0o7QUFFQSxhQUFPLEdBQUcsU0FBUyxNQUFNLEdBQUcsT0FBTyxHQUFHLFVBQVU7QUFBQSxJQUNwRDtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxzQkFBc0IsTUFBTTtBQUV4QixVQUFNLGlCQUFpQyxTQUFTLGVBQWUsUUFBUSxnQkFBZ0I7QUFFdkYsUUFBSSxrQkFDRyxlQUFlLGNBQUEsTUFBb0IsTUFDeEM7QUFDRSxVQUFJO0FBRUosZUFBUyxJQUFJLEdBQUcsSUFBSSxlQUFlLFdBQVcsUUFBUSxLQUFLO0FBRXZELG9CQUFZLGVBQWUsV0FBVyxDQUFDO0FBRXZDLFlBQUksVUFBVSxhQUFhLEtBQUssY0FBYztBQUUxQyxjQUFJLENBQUMsT0FBTyxXQUFXO0FBRW5CLG1CQUFPLFlBQVksSUFBSSxVQUFBO0FBQUEsVUFDM0I7QUFFQSxpQkFBTyxVQUFVLG1CQUFtQixVQUFVO0FBQzlDLG9CQUFVLE9BQUE7QUFFVjtBQUFBLFFBQ0osV0FDUyxVQUFVLGFBQWEsS0FBSyxXQUFXO0FBQzVDO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBRUEsdUJBQXVCLENBQUMsVUFBa0I7QXJDeEo5QztBcUMwSlEsUUFBSSxHQUFDLFlBQU8sY0FBUCxtQkFBa0IsbUJBQWtCO0FBQ3JDO0FBQUEsSUFDSjtBQUVBLFFBQUk7QUFDQSxVQUFJLHFCQUFxQixPQUFPLFVBQVU7QUFDMUMsMkJBQXFCLG1CQUFtQixLQUFBO0FBRXhDLFVBQUksQ0FBQyxtQkFBbUIsV0FBVyxlQUFlLHFCQUFxQixHQUFHO0FBQ3RFO0FBQUEsTUFDSjtBQUVBLDJCQUFxQixtQkFBbUIsVUFBVSxlQUFlLHNCQUFzQixNQUFNO0FBQzdGLFlBQU0sTUFBTSxLQUFLLE1BQU0sa0JBQWtCO0FBRXpDO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixTQUNPLEdBQUc7QUFDTixjQUFRLE1BQU0sQ0FBQztBQUVmO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUVBLHlCQUF5QixNQUFNO0FBQUEsRUFFL0I7QUFDSjtBQ2xMQSxNQUFxQixhQUFzQztBQUFBLEVBRXZELFlBQ0ksUUFDQSxPQUNGO0FBS0s7QUFDQTtBQUNBLG1DQUFpQztBQUNqQyxnQ0FBK0I7QUFDL0Isa0NBQWlDO0FBQ2pDLG1DQUFrQztBQVRyQyxTQUFLLFNBQVM7QUFDZCxTQUFLLFFBQVE7QUFBQSxFQUNqQjtBQVFKO0FDaEJBLE1BQXFCLGFBQXNDO0FBQUEsRUFFdkQsWUFDSSxPQUNBLE9BQ0EsS0FDRjtBQU9LO0FBQ0E7QUFDQSx3Q0FBMEMsQ0FBQTtBQUMxQyw4Q0FBOEI7QUFFOUI7QUFDQTtBQUVBLDRDQUEyQztBQUMzQywwQ0FBeUM7QUFDekMsNkNBQTRDO0FBaEIvQyxTQUFLLFFBQVE7QUFDYixTQUFLLFFBQVE7QUFDYixTQUFLLE1BQU07QUFDWCxTQUFLLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBRywyQkFBSyxTQUFRLEVBQUU7QUFBQSxFQUMvQztBQWFKO0FDMUJBLE1BQXFCLFlBQW1DO0FBQUEsRUFFcEQsWUFDSSxNQUNBLEtBQ0EsTUFDQSxRQUNBLFFBQ0Y7QUFRSztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEgsU0FBSyxPQUFPO0FBQ1osU0FBSyxNQUFNO0FBQ1gsU0FBSyxPQUFPO0FBQ1osU0FBSyxTQUFTO0FBQ2QsU0FBSyxTQUFTO0FBQUEsRUFDbEI7QUFPSjtBQ1ZBLE1BQU0scUJBQXFCLENBQ3ZCLFNBQ0EsYUFDQSxhQUNPO0FBRVAsTUFBSSxRQUFRLElBQUksUUFBUSxZQUFZLE1BQU0sT0FDbkMsUUFBUSxJQUFJLFNBQVMsWUFBWSxNQUFNLE1BQzVDO0FBQ0UsVUFBTSxJQUFJLE1BQU0sK0NBQStDO0FBQUEsRUFDbkU7QUFFQSxNQUFJLENBQUMsWUFBWSxrQkFBa0I7QUFFL0IsVUFBTSxJQUFJLE1BQU0sb0NBQW9DO0FBQUEsRUFDeEQ7QUFFQSxNQUFJLENBQUMsWUFBWSxnQkFBZ0I7QUFFN0IsVUFBTSxJQUFJLE1BQU0saUNBQWlDO0FBQUEsRUFDckQ7QUFFQSxNQUFJLENBQUMsWUFBWSxtQkFBbUI7QUFFaEMsVUFBTSxJQUFJLE1BQU0scUNBQXFDO0FBQUEsRUFDekQ7QUFFQSxNQUFJQSxXQUFFLG1CQUFtQixTQUFTLElBQUksTUFBTSxNQUFNO0FBRTlDLFVBQU0sSUFBSSxNQUFNLHdEQUF3RDtBQUFBLEVBQzVFLFdBQ1MsWUFBWSxNQUFNLFNBQVMsWUFBWSxNQUFNO0FBRWxELFVBQU0sSUFBSSxNQUFNLG1EQUFtRDtBQUFBLEVBQ3ZFO0FBQ0o7QUFFQSxNQUFNLHlCQUF5QixDQUFDLG1CQUFtRTtBQUUvRixNQUFJLG1CQUFnQyxZQUFZO0FBQ2hELE1BQUksU0FBUztBQUViLE1BQUksbUJBQW1CLEtBQUs7QUFFeEIsdUJBQW1CLFlBQVk7QUFBQSxFQUNuQyxXQUNTLG1CQUFtQixLQUFLO0FBRTdCLHVCQUFtQixZQUFZO0FBQUEsRUFDbkMsV0FDUyxtQkFBbUIsS0FBSztBQUU3Qix1QkFBbUIsWUFBWTtBQUMvQixhQUFTO0FBQUEsRUFDYixPQUNLO0FBRUQsVUFBTSxJQUFJLE1BQU0sb0RBQW9ELGNBQWMsRUFBRTtBQUFBLEVBQ3hGO0FBRUEsU0FBTztBQUFBLElBQ0gsTUFBTTtBQUFBLElBQ047QUFBQSxFQUFBO0FBRVI7QUFFQSxNQUFNLGlCQUFpQixDQUFDLG1CQUFzRTtBQUUxRixRQUFNLG1CQUFtQkEsV0FBRTtBQUFBLElBQ3ZCO0FBQUEsSUFDQSxDQUFDLEtBQUssS0FBSyxHQUFHO0FBQUEsSUFDZDtBQUFBLEVBQUE7QUFHSixNQUFJLHFCQUFxQixJQUFJO0FBRXpCLFdBQU87QUFBQSxNQUNILE9BQU8sZUFBZTtBQUFBLE1BQ3RCLFFBQVE7QUFBQSxJQUFBO0FBQUEsRUFFaEI7QUFFQSxTQUFPO0FBQUEsSUFDSCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFBQTtBQUVoQjtBQUVBLE1BQU0saUJBQWlCLENBQUMsbUJBQW1FO0FBRXZGLFFBQU0saUJBQWlCLGVBQWUsVUFBVSxHQUFHLENBQUM7QUFDcEQsUUFBTSxjQUFjLHVCQUF1QixjQUFjO0FBRXpELFNBQU87QUFDWDtBQUVBLE1BQU0scUJBQXFCLENBQUMsbUJBQW1GO0FBRTNHLE1BQUksY0FBbUM7QUFDdkMsTUFBSSxXQUFXO0FBRWYsTUFBSSxDQUFDQSxXQUFFLG1CQUFtQixjQUFjLEdBQUc7QUFFdkMsVUFBTSxjQUFjLGVBQWUsY0FBYztBQUNqRCxVQUFNLFNBQW9ELGVBQWUsY0FBYztBQUV2RixVQUFNLE1BQU0sZUFBZTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxPQUFPO0FBQUEsSUFBQTtBQUdYLGtCQUFjLElBQUk7QUFBQSxNQUNkLGVBQWUsVUFBVSxHQUFHLE9BQU8sS0FBSztBQUFBLE1BQ3hDO0FBQUEsTUFDQSxZQUFZO0FBQUEsTUFDWjtBQUFBLE1BQ0EsWUFBWTtBQUFBLElBQUE7QUFHaEIsUUFBSSxPQUFPLFdBQVcsTUFBTTtBQUV4QixrQkFBWSxTQUFTO0FBQUEsSUFDekI7QUFFQSxlQUFXLGVBQWUsVUFBVSxPQUFPLEtBQUs7QUFBQSxFQUNwRDtBQUVBLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sZUFBZSxDQUNqQixVQUNBLG1CQUNxRDtBQUVyRCxRQUFNLGVBQWUsbUJBQW1CLGNBQWM7QUFFdEQsTUFBSSxDQUFDLGFBQWEsYUFBYTtBQUUzQixVQUFNLElBQUksTUFBTSw2QkFBNkI7QUFBQSxFQUNqRDtBQUVBLG1CQUFpQixhQUFhO0FBQzlCLFFBQU0sYUFBYSxtQkFBbUIsY0FBYztBQUVwRCxNQUFJLENBQUMsV0FBVyxhQUFhO0FBRXpCLFVBQU0sSUFBSSxNQUFNLDJCQUEyQjtBQUFBLEVBQy9DO0FBRUEsUUFBTSxVQUFVLElBQUk7QUFBQSxJQUNoQixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsRUFBQTtBQUdmLFdBQVMsS0FBSyxPQUFPO0FBRXJCLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sbUJBQW1CLENBQ3JCLFVBQ0EsbUJBQ3FEO0FBRXJELFFBQU0sbUJBQW1CLElBQUk7QUFBQSxJQUN6QjtBQUFBLElBQ0E7QUFBQSxJQUNBLFlBQVk7QUFBQSxJQUNaO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixRQUFNLGlCQUFpQixtQkFBbUIsY0FBYztBQUV4RCxNQUFJLENBQUMsZUFBZSxhQUFhO0FBRTdCLFVBQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUFBLEVBQ2pEO0FBRUEsUUFBTSxjQUFjLElBQUk7QUFBQSxJQUNwQixTQUFTO0FBQUEsSUFDVDtBQUFBLElBQ0EsZUFBZTtBQUFBLEVBQUE7QUFHbkIsV0FBUyxLQUFLLFdBQVc7QUFFekIsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBLFNBQVM7QUFBQSxFQUFBO0FBRWpCO0FBRUEsTUFBTSxjQUFjLENBQ2hCLE9BQ0EsU0FDQSxtQkFBOEMsU0FDdkM7QUFFUCxlQUFhO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFFBQU0sMEJBQTBCLFFBQVE7QUFFeEMsTUFBSSx3QkFBd0IsU0FBUyxHQUFHO0FBRXBDLFVBQU0sWUFBWSx3QkFBd0Isd0JBQXdCLFNBQVMsQ0FBQztBQUU1RSxRQUFJLFVBQVUsTUFBTSxRQUFRLE1BQU0sS0FBSztBQUVuQyxnQkFBVSxPQUFPLFFBQVEsTUFBTTtBQUFBLElBQ25DO0FBRUEsVUFBTSxXQUFXLHdCQUF3QixDQUFDO0FBRTFDLFFBQUksU0FBUyxNQUFNLFFBQVEsSUFBSSxLQUFLO0FBRWhDLGVBQVMsT0FBTyxRQUFRLElBQUk7QUFDNUIsZUFBUyxTQUFTLFFBQVEsSUFBSTtBQUFBLElBQ2xDO0FBQUEsRUFDSjtBQUVBLGdCQUFjO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBRVI7QUFFQSxNQUFNLGVBQWU7QUFBQSxFQUVqQix1QkFBdUIsQ0FDbkIsT0FDQSxjQUNBLFNBQ087QUFFUCxRQUFJLENBQUMsZ0JBQ0UsQ0FBQyxNQUFNLFlBQVksYUFDeEI7QUFDRTtBQUFBLElBQ0o7QUFFQSxVQUFNLFVBQVUsTUFBTSxZQUFZLFNBQVMsZUFBZSxDQUFDO0FBRTNELFFBQUksQ0FBQyxTQUFTO0FBRVYsWUFBTSxJQUFJLE1BQU0saUJBQWlCO0FBQUEsSUFDckM7QUFFQSxZQUFRLG9CQUFvQjtBQUM1QixVQUFNLGNBQWMsTUFBTSxZQUFZLFNBQVMsWUFBWTtBQUUzRCxRQUFJLGFBQWE7QUFFYixrQkFBWSxtQkFBbUIsUUFBUTtBQUN2QyxrQkFBWSxpQkFBaUI7QUFDN0Isa0JBQVksb0JBQW9CO0FBRWhDO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUFBLEVBQ0o7QUFBQSxFQUVBLGlCQUFpQixDQUNiLE9BQ0Esa0JBQ0EsY0FDQSxTQUNnQjtBekN4U3hCO0F5QzBTUSxVQUFNLFdBQVcsTUFBTSxZQUFZO0FBRW5DLFFBQUksbUJBQW1CLEdBQUc7QUFFdEIsWUFBTSxJQUFJLE1BQU0sV0FBVztBQUFBLElBQy9CO0FBRUEsVUFBTSxpQkFBaUIsU0FBUyxtQkFBbUIsQ0FBQztBQUNwRCxtQkFBZSxvQkFBb0I7QUFFbkMsUUFBSSxvQkFBb0IsU0FBUyxRQUFRO0FBRXJDLFlBQU0sSUFBSSxNQUFNLDRCQUE0QjtBQUFBLElBQ2hEO0FBRUEsVUFBTSxjQUFjLFNBQVMsZ0JBQWdCO0FBRTdDLFFBQUksQ0FBQyxhQUFhO0FBRWQsWUFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQUEsSUFDaEQ7QUFFQSxRQUFJLFlBQVksdUJBQXVCLE1BQU07QUFFekMsYUFBTztBQUFBLElBQ1g7QUFFQSxnQkFBWSxxQkFBcUI7QUFDakMsZ0JBQVksbUJBQW1CLGVBQWU7QUFDOUMsZ0JBQVksaUJBQWlCO0FBQzdCLGdCQUFZLG9CQUFvQjtBQUVoQyxRQUFJLENBQUMsWUFBWSxrQkFBa0I7QUFFL0Isa0JBQVksbUJBQW1CLGVBQWU7QUFBQSxJQUNsRDtBQUVBLFFBQUksQ0FBQyxZQUFZLGdCQUFnQjtBQUU3QixrQkFBWSxpQkFBaUIsZUFBZTtBQUFBLElBQ2hEO0FBRUEsUUFBSSxDQUFDLFlBQVksbUJBQW1CO0FBRWhDLGtCQUFZLG9CQUFvQixlQUFlO0FBQUEsSUFDbkQ7QUFFQSxRQUFJQSxXQUFFLG9CQUFtQixpQkFBWSxlQUFlLFlBQTNCLG1CQUFvQyxFQUFFLENBQUMsTUFBTSxNQUFNO0FBRXhFLFlBQU0sSUFBSSxNQUFNLHdDQUF3QztBQUFBLElBQzVEO0FBRUEsUUFBSSxtQkFBbUIsV0FBVztBQUFBLE1BQzlCO0FBQUEsTUFDQSxZQUFZLGVBQWU7QUFBQSxPQUMzQixpQkFBWSxlQUFlLFlBQTNCLG1CQUFvQyxFQUFFO0FBQUEsSUFBQTtBQUcxQztBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSjtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsaUJBQWlCLENBQ2IsT0FDQSxjQUNBLFdBQ2dCO0FBRWhCLFVBQU0sV0FBVyxNQUFNLFlBQVk7QUFDbkMsVUFBTSxpQkFBaUIsU0FBUyxZQUFZO0FBQzVDLFVBQU0sbUJBQW1CLGVBQWU7QUFFeEMsUUFBSSxvQkFBb0IsU0FBUyxRQUFRO0FBRXJDLFlBQU0sSUFBSSxNQUFNLDRCQUE0QjtBQUFBLElBQ2hEO0FBRUEsVUFBTSxjQUFjLFNBQVMsZ0JBQWdCO0FBRTdDLFFBQUksQ0FBQyxhQUFhO0FBRWQsWUFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQUEsSUFDaEQ7QUFFQSxRQUFJLFlBQVksdUJBQXVCLE1BQU07QUFFekMsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLGlCQUFpQixlQUFlO0FBQ3RDLFVBQU0sT0FBTyxlQUFlO0FBRTVCLFFBQUksQ0FBQyxNQUFNO0FBRVAsWUFBTSxJQUFJLE1BQU0sdUJBQXVCO0FBQUEsSUFDM0M7QUFFQSxtQkFBZSxvQkFBb0IsS0FBSztBQUN4QyxnQkFBWSxxQkFBcUI7QUFDakMsZ0JBQVksbUJBQW1CLGVBQWU7QUFDOUMsZ0JBQVksaUJBQWlCLGVBQWU7QUFDNUMsZ0JBQVksb0JBQW9CLGVBQWU7QUFFL0MsUUFBSSxDQUFDLFlBQVksa0JBQWtCO0FBRS9CLFlBQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUFBLElBQ2pEO0FBRUEsVUFBTSxrQkFBa0IsV0FBVztBQUFBLE1BQy9CO0FBQUEsTUFDQSxZQUFZLGlCQUFpQjtBQUFBLE1BQzdCLFlBQVksTUFBTTtBQUFBLElBQUE7QUFHdEIsUUFBSSxDQUFDLGlCQUFpQjtBQUVsQixZQUFNLElBQUksTUFBTSwwQkFBMEI7QUFBQSxJQUM5QztBQUVBLFFBQUlBLFdBQUUsbUJBQW1CLGdCQUFnQixFQUFFLE1BQU0sTUFBTTtBQUVuRCxZQUFNLElBQUksTUFBTSxtQkFBbUI7QUFBQSxJQUN2QztBQUVBLFVBQU0sa0JBQWtCLFdBQVc7QUFBQSxNQUMvQjtBQUFBLE1BQ0EsWUFBWSxlQUFlO0FBQUEsTUFDM0I7QUFBQSxJQUFBO0FBR0osUUFBSSxDQUFDLGlCQUFpQjtBQUVsQixZQUFNLElBQUksTUFBTSwwQkFBMEI7QUFBQSxJQUM5QztBQUVBLFFBQUksZ0JBQWdCLE9BQU8sZ0JBQWdCLEdBQUc7QUFFMUMsWUFBTSxJQUFJLE1BQU0sZ0RBQWdEO0FBQUEsSUFDcEU7QUFFQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsaUJBQWlCLENBQ2IsT0FDQSxZQUNPO0FBRVAsUUFBSSxRQUFRLHVCQUF1QixNQUFNO0FBQ3JDO0FBQUEsSUFDSjtBQUVBLFlBQVEscUJBQXFCO0FBQzdCLFVBQU0sbUJBQW1CLFFBQVEsUUFBUTtBQUN6QyxVQUFNLFdBQVcsTUFBTSxZQUFZO0FBRW5DLFFBQUksb0JBQW9CLFNBQVMsUUFBUTtBQUVyQyxZQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxJQUNoRDtBQUVBLFVBQU0sY0FBYyxTQUFTLGdCQUFnQjtBQUU3QyxRQUFJLGFBQWE7QUFFYixVQUFJLENBQUMsWUFBWSxrQkFBa0I7QUFFL0Isb0JBQVksbUJBQW1CLFFBQVE7QUFBQSxNQUMzQztBQUVBLFVBQUksQ0FBQyxZQUFZLGdCQUFnQjtBQUU3QixvQkFBWSxpQkFBaUIsUUFBUTtBQUFBLE1BQ3pDO0FBRUEsVUFBSSxDQUFDLFlBQVksbUJBQW1CO0FBRWhDLG9CQUFZLG9CQUFvQixRQUFRO0FBQUEsTUFDNUM7QUFFQTtBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFBQSxFQUNKO0FBQUEsRUFFQSwyQkFBMkIsQ0FDdkIsT0FDQSxZQUM0QjtBQUU1QixRQUFJLGNBQWMsUUFBUSxhQUFhLElBQUEsS0FBUztBQUVoRCxTQUFJLDJDQUFhLFlBQVcsTUFBTTtBQUU5QixhQUFPO0FBQUEsSUFDWDtBQUVBLFFBQUksUUFBUSxhQUFhLFdBQVcsR0FBRztBQUVuQyxZQUFNLGNBQWMsTUFBTSxZQUFZLFNBQVMsUUFBUSxRQUFRLENBQUM7QUFFaEUsVUFBSSxDQUFDLGFBQWE7QUFFZCxjQUFNLElBQUksTUFBTSxzQkFBc0I7QUFBQSxNQUMxQztBQUVBLFVBQUksQ0FBQyxZQUFZLGtCQUFrQjtBQUUvQixvQkFBWSxtQkFBbUIsUUFBUTtBQUFBLE1BQzNDO0FBRUEsVUFBSSxDQUFDLFlBQVksZ0JBQWdCO0FBRTdCLG9CQUFZLGlCQUFpQixRQUFRO0FBQUEsTUFDekM7QUFFQSxVQUFJLENBQUMsWUFBWSxtQkFBbUI7QUFFaEMsb0JBQVksb0JBQW9CLFFBQVE7QUFBQSxNQUM1QztBQUFBLElBQ0o7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsZUFBZSxDQUNYLE9BQ0EsZ0JBQ087QUFFUCxRQUFJLFlBQVksV0FBVyxHQUFHLE1BQU0sTUFBTTtBQUV0QyxvQkFBYyxZQUFZLFVBQVUsQ0FBQztBQUFBLElBQ3pDO0FBRUEsUUFBSSxXQUFXLG1CQUFtQixXQUFXLE1BQU0sTUFBTTtBQUNyRDtBQUFBLElBQ0o7QUFFQSxVQUFNLFdBQWlDLENBQUE7QUFDdkMsUUFBSSxpQkFBaUI7QUFDckIsUUFBSTtBQUVKLGFBQVM7QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLENBQUNBLFdBQUUsbUJBQW1CLGNBQWMsR0FBRztBQUUxQyxlQUFTO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBR0osVUFBSSxPQUFPLFFBQVEsSUFBSSxXQUFXLE1BQU07QUFDcEM7QUFBQSxNQUNKO0FBRUEsdUJBQWlCLE9BQU87QUFBQSxJQUM1QjtBQUVBLFVBQU0sWUFBWSxXQUFXO0FBQUEsRUFDakM7QUFBQSxFQUVBLHlCQUF5QixDQUNyQixPQUNBLFNBQ0EsbUJBQThDLFNBQ3ZDO0FBRVAsUUFBSSxDQUFDLFFBQVEsa0JBQWtCO0FBRTNCLFlBQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUFBLElBQ2pEO0FBRUEsUUFBSSxDQUFDLFFBQVEsZ0JBQWdCO0FBRXpCLFlBQU0sSUFBSSxNQUFNLDBCQUEwQjtBQUFBLElBQzlDO0FBRUEsUUFBSSxzQkFBaUQsQ0FBQTtBQUVyRCxRQUFJLENBQUMsa0JBQWtCO0FBRW5CLHlCQUFtQixXQUFXO0FBQUEsUUFDMUI7QUFBQSxRQUNBLFFBQVEsaUJBQWlCO0FBQUEsUUFDekIsUUFBUSxNQUFNO0FBQUEsTUFBQTtBQUdsQixVQUFJLENBQUMsa0JBQWtCO0FBRW5CLGNBQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUFBLE1BQ2pEO0FBRUEsdUJBQWlCLE9BQU8sUUFBUSxNQUFNO0FBQUEsSUFDMUM7QUFFQSxRQUFJLGlCQUFpQixXQUFXO0FBQUEsTUFDNUI7QUFBQSxNQUNBLFFBQVEsZUFBZTtBQUFBLE1BQ3ZCLFFBQVEsSUFBSTtBQUFBLElBQUE7QUFHaEIsUUFBSSxDQUFDLGdCQUFnQjtBQUVqQixZQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxJQUMvQztBQUVBLG1CQUFlLE9BQU8sUUFBUSxJQUFJO0FBQ2xDLFFBQUksU0FBb0M7QUFDeEMsUUFBSSxZQUFZO0FBRWhCLFdBQU8sUUFBUTtBQUVYLDBCQUFvQixLQUFLLE1BQU07QUFFL0IsVUFBSSxDQUFDLGNBQ0UsaUNBQVEsYUFBWSxTQUNwQixpQ0FBUSxZQUFXLE1BQ3hCO0FBQ0U7QUFBQSxNQUNKO0FBRUEsV0FBSSxpQ0FBUSxPQUFNLGlCQUFpQixHQUFHO0FBQ2xDO0FBQUEsTUFDSjtBQUVBLGtCQUFZO0FBQ1osZUFBUyxPQUFPO0FBQUEsSUFDcEI7QUFFQSxZQUFRLGVBQWU7QUFBQSxFQUMzQjtBQUNKO0FDOW5CQSxNQUFNLGtCQUFrQjtBQUFBLEVBRXBCLDRCQUE0QixDQUN4QixPQUNBLGlCQUNBLHNCQUNpQjtBQUVqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLG1DQUFtQyxDQUMvQixPQUNBLGlCQUNBLFNBQ0EsT0FDQSxRQUNBLGlCQUNpQjtBQUVqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLDRCQUE0QixDQUN4QixPQUNBLGlCQUNBLFNBQ0EsT0FDQSxXQUNpQjtBQUVqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsMEJBQTBCLENBQ3RCLE9BQ0EsaUJBQ0EsU0FDQSxPQUNBLFdBQ2lCO0FBRWpCLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osV0FBTyxXQUFXLFdBQVcsS0FBSztBQUFBLEVBQ3RDO0FBQUEsRUFFQSw2QkFBNkIsQ0FDekIsT0FDQSxpQkFDQSxTQUNpQjtBQUVqQixVQUFNLFVBQVUsTUFBTSxZQUFZO0FBRWxDLFFBQUksQ0FBQyxTQUFTO0FBRVYsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLGNBQWMsTUFBTSxZQUFZLFNBQVMsQ0FBQztBQUVoRCxRQUFJLENBQUMsYUFBYTtBQUVkLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxvQkFBb0IsUUFBUSxNQUFNO0FBRXhDLFFBQUlBLFdBQUUsbUJBQW1CLGlCQUFpQixNQUFNLE1BQU07QUFFbEQsYUFBTztBQUFBLElBQ1g7QUFFQSxnQkFBWSxtQkFBbUI7QUFDL0IsZ0JBQVksaUJBQWlCO0FBQzdCLGdCQUFZLG9CQUFvQjtBQUVoQyxpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFVBQU0sWUFBWSxhQUFhO0FBQUEsTUFDM0I7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFFBQUksV0FBVztBQUVYLFlBQU0sTUFBTSxHQUFHLGlCQUFpQixJQUFJLFVBQVUsQ0FBQyxHQUFHLGVBQWUscUJBQXFCO0FBRXRGLFlBQU0sZUFBZSxDQUNqQkssUUFDQUkscUJBQ2lCO0FBRWpCLGVBQU8saUJBQWlCO0FBQUEsVUFDcEJKO0FBQUFBLFVBQ0FJO0FBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUFBLE1BRVI7QUFFQSxpQkFBVztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQSxVQUFVO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixPQUNLO0FBQ0QsbUJBQWE7QUFBQSxRQUNUO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBRUEsV0FBTyxXQUFXLFdBQVcsS0FBSztBQUFBLEVBQ3RDO0FBQ0o7QUNuSkEsTUFBTSxzQkFBc0IsQ0FDeEIsT0FDQSxhQUNBLFdBQ087QUFFUCxhQUFXO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLGFBQVcsVUFBVSxZQUFZLEdBQUc7QUFFaEM7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FBRUEsTUFBTSxxQkFBcUIsQ0FDdkIsT0FDQSxhQUNBLFdBQ087QUFFUCxhQUFXO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLGFBQVcsVUFBVSxZQUFZLEdBQUc7QUFFaEM7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FBRUEsTUFBTSxXQUFXLENBQ2IsT0FDQSxTQUNBLFFBQ0EsU0FBb0MsU0FDZjtBQUVyQixRQUFNLE9BQU8sSUFBSSxrQkFBQTtBQUNqQixPQUFLLElBQUksUUFBUTtBQUNqQixPQUFLLElBQUksUUFBUSxLQUFLO0FBQ3RCLE9BQUssSUFBSSxRQUFRLEtBQUs7QUFDdEIsT0FBSyxLQUFLLFFBQVEsTUFBTTtBQUN4QixPQUFLLElBQUksUUFBUSxLQUFLO0FBQ3RCLE9BQUssU0FBUztBQUNkLE9BQUssT0FBTyxZQUFZO0FBRXhCLGFBQVc7QUFBQSxJQUNQO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osTUFBSSxLQUFLLEdBQUc7QUFFUixTQUFLLE9BQU8sWUFBWTtBQUFBLEVBQzVCO0FBRUEsTUFBSSxRQUFRLEtBQ0wsTUFBTSxRQUFRLFFBQVEsQ0FBQyxNQUFNLFFBQzdCLFFBQVEsRUFBRSxTQUFTLEdBQ3hCO0FBQ0UsUUFBSTtBQUVKLGVBQVcsVUFBVSxRQUFRLEdBQUc7QUFFNUIsVUFBSTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBR0osV0FBSyxFQUFFLEtBQUssQ0FBQztBQUFBLElBQ2pCO0FBQUEsRUFDSjtBQUVBLFNBQU87QUFDWDtBQUVBLE1BQU0sYUFBYSxDQUNmLFNBQ0EscUJBQ087QUFFUCxVQUFRLElBQUksQ0FBQTtBQUNaLE1BQUk7QUFFSixhQUFXLFNBQVMsa0JBQWtCO0FBRWxDLFFBQUksSUFBSSxtQkFBQTtBQUNSLE1BQUUsSUFBSSxNQUFNO0FBQ1osTUFBRSxJQUFJLE1BQU07QUFDWixZQUFRLEVBQUUsS0FBSyxDQUFDO0FBQUEsRUFDcEI7QUFDSjtBQUVBLE1BQU0sZUFBZTtBQUFBLEVBRWpCLDRCQUE0QixDQUN4QixPQUNBLFFBQ1U7QUFFVixRQUFJLE1BQU0sWUFBWSxZQUFZLEdBQUcsTUFBTSxNQUFNO0FBRTdDLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxZQUFZLFlBQVksR0FBRyxJQUFJO0FBRXJDLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSw0QkFBNEIsQ0FDeEIsT0FDQSxpQkFDQSxzQkFDaUI7QUFFakIsUUFBSSxDQUFDLE1BQU0sWUFBWSxjQUFjO0FBRWpDLFlBQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUFBLElBQzVDO0FBRUEsVUFBTSxRQUFRLE1BQU0sWUFBWTtBQUNoQyxVQUFNLGFBQWEsZ0JBQWdCO0FBRW5DLFVBQU0sZUFBZSxhQUFhO0FBQUEsTUFDOUI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxNQUFNO0FBQUEsSUFBQTtBQUdWLFVBQU0sVUFBVTtBQUNoQixpQkFBYSxFQUFFLFVBQVU7QUFFekIsUUFBSSxNQUFNLFlBQVksZ0JBQWdCLE1BQU07QUFFeEMsWUFBTSxXQUFXLE1BQU0sWUFBWTtBQUVuQyxVQUFJLFNBQVMsU0FBUyxHQUFHO0FBRXJCLGNBQU0sY0FBYyxTQUFTLENBQUM7QUFDOUIsb0JBQVksTUFBTSxNQUFNLGFBQWEsRUFBRTtBQUFBLE1BQzNDO0FBQUEsSUFDSjtBQUVBLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osUUFBSSxhQUFhLEVBQUUsS0FBSyxNQUFNO0FBRzFCLFlBQU0sZUFBMkMsYUFBYTtBQUFBLFFBQzFEO0FBQUEsUUFDQSxhQUFhLEVBQUU7QUFBQSxNQUFBO0FBR25CLFlBQU0sWUFBWSxNQUFNO0FBRXhCLFVBQUksQ0FBQyxXQUFXO0FBRVosY0FBTSxJQUFJLE1BQU0sK0JBQStCO0FBQUEsTUFDbkQ7QUFFQSxtQkFBYTtBQUFBLFFBQ1Q7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSLFdBQ1MsTUFBTSxNQUFNO0FBRWpCLG9CQUFjO0FBQUEsUUFDVjtBQUFBLFFBQ0EsTUFBTTtBQUFBLE1BQUE7QUFHVixvQkFBYztBQUFBLFFBQ1Y7QUFBQSxRQUNBLE1BQU07QUFBQSxNQUFBO0FBQUEsSUFFZDtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxpQkFBaUIsQ0FDYixTQUNBLFVBQzZCO0FBRTdCLFFBQUksUUFBUSxFQUFFLFNBQVMsT0FBTztBQUUxQixhQUFPLFFBQVEsRUFBRSxLQUFLO0FBQUEsSUFDMUI7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsaUNBQWlDLENBQzdCLE9BQ0EsT0FDQSxZQUNBLFNBQ0EsV0FDZ0I7QUFFaEIsVUFBTSxPQUFPLElBQUk7QUFBQSxNQUNiLFdBQVcsZUFBZSxLQUFLO0FBQUEsTUFDL0I7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLEtBQUs7QUFBQSxJQUFBO0FBR1QsU0FBSyxVQUFVO0FBQ2YsU0FBSyxTQUFTO0FBQ2QsV0FBTyxPQUFPO0FBRWQsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLG9DQUFvQyxDQUNoQyxPQUNBLE9BQ0EsWUFDQSxTQUNBLFdBQ2dCO0FBRWhCLFVBQU0sTUFBTSxJQUFJO0FBQUEsTUFDWixXQUFXLGVBQWUsS0FBSztBQUFBLE1BQy9CO0FBQUEsSUFBQTtBQUdKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxJQUFJO0FBQUEsSUFBQTtBQUdSLFFBQUksVUFBVTtBQUNkLFFBQUksU0FBUztBQUNiLFdBQU8sTUFBTTtBQUViLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSx3Q0FBd0MsQ0FDcEMsT0FDQSxPQUNBLFNBQ0EsV0FDZ0I7QUFFaEIsVUFBTSxPQUFPLElBQUk7QUFBQSxNQUNiLFdBQVcsZUFBZSxLQUFLO0FBQUEsTUFDL0I7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0EsS0FBSztBQUFBLElBQUE7QUFHVCxTQUFLLFVBQVU7QUFDZixTQUFLLFNBQVM7QUFDZCxXQUFPLE9BQU87QUFFZCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsdUNBQXVDLENBQ25DLE9BQ0EsT0FDQSxTQUNBLFdBQ2dCO0FBRWhCLFVBQU0sTUFBTSxJQUFJO0FBQUEsTUFDWixXQUFXLGVBQWUsS0FBSztBQUFBLE1BQy9CO0FBQUEsSUFBQTtBQUdKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBLElBQUk7QUFBQSxJQUFBO0FBR1IsUUFBSSxVQUFVO0FBQ2QsUUFBSSxTQUFTO0FBQ2IsV0FBTyxNQUFNO0FBRWIsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLG1DQUFtQyxDQUMvQixPQUNBLGlCQUNBLFNBQ0EsT0FDQSxRQUNBLGlCQUNPO0EzQ3JXZjtBMkN1V1EsUUFBSSxPQUFPLE1BQU07QUFFYixZQUFNLElBQUksTUFBTSxpQ0FBZ0MsWUFBTyxLQUFLLFNBQVosbUJBQWtCLEVBQUUsRUFBRTtBQUFBLElBQzFFO0FBRUEsVUFBTSxhQUFhLGdCQUFnQjtBQUVuQyxVQUFNLE9BQU8sYUFBYTtBQUFBLE1BQ3RCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixrQkFBYztBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLDRCQUE0QixDQUN4QixPQUNBLGlCQUNBLFNBQ0EsT0FDQSxXQUNPO0EzQzlZZjtBMkNnWlEsUUFBSSxPQUFPLE1BQU07QUFFYixZQUFNLElBQUksTUFBTSxpQ0FBZ0MsWUFBTyxLQUFLLFNBQVosbUJBQWtCLEVBQUUsRUFBRTtBQUFBLElBQzFFO0FBRUEsVUFBTSxhQUFhLGdCQUFnQjtBQUVuQyxVQUFNLE9BQU8sYUFBYTtBQUFBLE1BQ3RCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixrQkFBYztBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUlKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSwwQkFBMEIsQ0FDdEIsT0FDQSxpQkFDQSxTQUNBLE9BQ0EsV0FDTztBM0N0YmY7QTJDd2JRLFFBQUksT0FBTyxLQUFLO0FBRVosWUFBTSxJQUFJLE1BQU0saUNBQWdDLFlBQU8sSUFBSSxTQUFYLG1CQUFpQixFQUFFLEVBQUU7QUFBQSxJQUN6RTtBQUVBLFVBQU0sYUFBYSxnQkFBZ0I7QUFFbkMsVUFBTSxNQUFNLGFBQWE7QUFBQSxNQUNyQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFTSixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLHNDQUFzQyxDQUNsQyxPQUNBLFlBQ087QUFFUCxRQUFJLFFBQVEsTUFBTTtBQU9kO0FBQUEsSUFDSjtBQUVBLFVBQU0sVUFBVSxRQUFRO0FBRXhCLFFBQUksQ0FBQyxTQUFTO0FBRVYsWUFBTSxJQUFJLE1BQU0sMEJBQTBCO0FBQUEsSUFDOUM7QUFFQSxVQUFNLGdCQUFnQixRQUFRLEVBQUU7QUFDaEMsVUFBTSxPQUFPLFFBQVE7QUFDckIsVUFBTSxNQUFjLEdBQUcsSUFBSSxJQUFJLGFBQWEsR0FBRyxlQUFlLHFCQUFxQjtBQUVuRixVQUFNLGFBQWEsQ0FBQ0osUUFBZSxhQUFrQjtBQUVqRCxhQUFPLGlCQUFpQjtBQUFBLFFBQ3BCQTtBQUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBRUEsZUFBVztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQSxVQUFVO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsb0NBQW9DLENBQ2hDLE9BQ0EsWUFDTztBQUVQLFFBQUksUUFBUSxNQUFNO0FBT2Q7QUFBQSxJQUNKO0FBRUEsVUFBTSxVQUFVLFFBQVE7QUFFeEIsUUFBSSxDQUFDLFNBQVM7QUFFVixZQUFNLElBQUksTUFBTSwwQkFBMEI7QUFBQSxJQUM5QztBQUVBLFVBQU0sZ0JBQWdCLFFBQVEsRUFBRTtBQUNoQyxVQUFNLE9BQU8sUUFBUTtBQUNyQixVQUFNLE1BQWMsR0FBRyxJQUFJLElBQUksYUFBYSxHQUFHLGVBQWUscUJBQXFCO0FBRW5GLFVBQU0sYUFBYSxDQUFDQSxRQUFlLGFBQWtCO0FBRWpELGFBQU8saUJBQWlCO0FBQUEsUUFDcEJBO0FBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFFQSxlQUFXO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBLFVBQVU7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSxtQkFBbUIsQ0FDZixPQUNBLG1CQUNPO0FBRVAsVUFBTSxZQUFZLGlCQUFpQjtBQUFBLEVBQ3ZDO0FBQUEsRUFFQSxZQUFZLENBQ1IsT0FDQSxzQkFDaUI7QUFFakIsUUFBSSxVQUEwQixNQUFNLFlBQVksU0FBUyxpQkFBaUI7QUFFMUUsUUFBSSxTQUFTO0FBRVQsYUFBTztBQUFBLElBQ1g7QUFFQSxjQUFVLElBQUksY0FBYyxpQkFBaUI7QUFDN0MsVUFBTSxZQUFZLFNBQVMsaUJBQWlCLElBQUk7QUFFaEQsV0FBTztBQUFBLEVBQ1g7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFtQ0EsNEJBQTRCLENBQ3hCLE9BQ0EsV0FDTztBQUVQLFVBQU0sVUFBVSxPQUFPLFFBQVE7QUFFL0IsUUFBSSxDQUFDLFNBQVM7QUFDVjtBQUFBLElBQ0o7QUFFQSxVQUFNLGNBQWMsV0FBVztBQUFBLE1BQzNCO0FBQUEsTUFDQSxPQUFPLFFBQVE7QUFBQSxNQUNmLE9BQU87QUFBQSxJQUFBO0FBR1gsU0FBSSwyQ0FBYSxNQUFLLFFBQ2YsTUFBTSxZQUFZLGdCQUFnQixNQUN2QztBQUNFO0FBQUEsSUFDSjtBQUVBLFVBQU0sZUFBZSxhQUFhO0FBQUEsTUFDOUI7QUFBQSxNQUNBLDJDQUFhO0FBQUEsSUFBQTtBQUdqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSwyQkFBMkIsQ0FDdkIsT0FDQSxRQUNBLFlBQ087QUFFUCxRQUFJTCxXQUFFLG1CQUFtQixPQUFPLE1BQU0sTUFBTSxNQUFNO0FBQzlDO0FBQUEsSUFDSjtBQUVBLFVBQU0sVUFBVSxRQUFRO0FBRXhCLFFBQUksQ0FBQyxTQUFTO0FBQ1Y7QUFBQSxJQUNKO0FBRUEsVUFBTSxjQUFjLFdBQVc7QUFBQSxNQUMzQjtBQUFBLE1BQ0EsT0FBTyxRQUFRO0FBQUEsTUFDZixPQUFPO0FBQUEsSUFBQTtBQUdYLFNBQUksMkNBQWEsTUFBSyxNQUFNO0FBQ3hCO0FBQUEsSUFDSjtBQUVBLFVBQU0sZUFBZSxhQUFhO0FBQUEsTUFDOUI7QUFBQSxNQUNBLDJDQUFhO0FBQUEsSUFBQTtBQUdqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSxnQ0FBZ0MsQ0FDNUIsT0FDQSxPQUNBLGNBQ0EsaUJBQ087QTNDenJCZjtBMkMyckJRLFFBQUksQ0FBQyxPQUFPO0FBRVIsWUFBTSxJQUFJLE1BQU0sdUJBQXVCO0FBQUEsSUFDM0M7QUFFQSxTQUFJLGtCQUFhLFNBQWIsbUJBQW1CLE1BQU07QUFFekIsY0FBUSxJQUFJLDhCQUE2QixrQkFBYSxLQUFLLFNBQWxCLG1CQUF3QixFQUFFLEVBQUU7QUFFckU7QUFBQSxJQUNKO0FBRUEsUUFBSSxtQkFBbUI7QUFFdkIsUUFBSSxvQkFBb0IsTUFBTTtBQUUxQjtBQUFBLElBQ0o7QUFFQSxVQUFNLG1CQUFtQiwrQkFBTztBQUNoQyxVQUFNLG9CQUFvQixZQUFZLHFCQUFxQixnQkFBZ0I7QUFFM0UsUUFBSSxDQUFDQSxXQUFFLG1CQUFtQixpQkFBaUIsR0FBRztBQUUxQyxZQUFNLFVBQVUsYUFBYTtBQUFBLFFBQ3pCO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFHSixVQUFJLFFBQVEsV0FBVyxNQUFNO0FBRXpCLFlBQUksQ0FBQyxhQUFhLE1BQU07QUFFcEIsZ0JBQU0sT0FBTyxhQUFhO0FBQUEsWUFDdEI7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUFBO0FBR0osdUJBQWE7QUFBQSxZQUNUO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUFBO0FBQUEsUUFFUjtBQUVBLHFCQUFhO0FBQUEsVUFDVDtBQUFBLFVBQ0EsYUFBYTtBQUFBLFFBQUE7QUFBQSxNQUVyQixPQUNLO0FBQ0QsY0FBTSxNQUFjLEdBQUcsaUJBQWlCLElBQUksZUFBZSxvQkFBb0I7QUFFL0UsY0FBTSxnQkFBZ0IsYUFBYTtBQUFBLFVBQy9CO0FBQUEsVUFDQTtBQUFBLFFBQUE7QUFHSixZQUFJLGtCQUFrQixNQUFNO0FBQ3hCO0FBQUEsUUFDSjtBQUVBLFlBQUk7QUFFSixZQUFJLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTTtBQUV4QyxpQkFBTztBQUFBLFFBQ1gsT0FDSztBQUNELGlCQUFPO0FBQUEsUUFDWDtBQUVBLGNBQU0sZUFBZSxDQUNqQkssUUFDQSxvQkFDaUI7QUFFakIsaUJBQU8sZ0JBQWdCO0FBQUEsWUFDbkJBO0FBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFBQTtBQUFBLFFBRVI7QUFFQSxtQkFBVztBQUFBLFVBQ1A7QUFBQSxVQUNBO0FBQUEsVUFDQSxVQUFVO0FBQUEsVUFDVjtBQUFBLFVBQ0E7QUFBQSxRQUFBO0FBQUEsTUFFUjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFFQSxrQ0FBa0MsQ0FDOUIsT0FDQSxPQUNBLGlCQUNPO0EzQ255QmY7QTJDcXlCUSxRQUFJLENBQUMsT0FBTztBQUVSLFlBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUFBLElBQzNDO0FBRUEsU0FBSSxrQkFBYSxTQUFiLG1CQUFtQixNQUFNO0FBRXpCLGNBQVEsSUFBSSw4QkFBNkIsa0JBQWEsS0FBSyxTQUFsQixtQkFBd0IsRUFBRSxFQUFFO0FBRXJFO0FBQUEsSUFDSjtBQUVBLFVBQU0sbUJBQW1CLCtCQUFPO0FBQ2hDLFVBQU0sb0JBQW9CLFlBQVkscUJBQXFCLGdCQUFnQjtBQUUzRSxRQUFJLENBQUNMLFdBQUUsbUJBQW1CLGlCQUFpQixHQUFHO0FBRTFDLFlBQU0sVUFBVSxhQUFhO0FBQUEsUUFDekI7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUdKLFVBQUksUUFBUSxXQUFXLE1BQU07QUFFekIsWUFBSSxDQUFDLGFBQWEsTUFBTTtBQUVwQix1QkFBYTtBQUFBLFlBQ1Q7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUFBO0FBQUEsUUFFUjtBQUVBLHFCQUFhO0FBQUEsVUFDVDtBQUFBLFVBQ0EsYUFBYTtBQUFBLFFBQUE7QUFHakIscUJBQWE7QUFBQSxVQUNUO0FBQUEsVUFDQSxhQUFhO0FBQUEsUUFBQTtBQUFBLE1BRXJCLE9BQ0s7QUFDRCxjQUFNLE1BQWMsR0FBRyxpQkFBaUIsSUFBSSxlQUFlLG9CQUFvQjtBQUUvRSxjQUFNLGdCQUFnQixhQUFhO0FBQUEsVUFDL0I7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUdKLFlBQUksa0JBQWtCLE1BQU07QUFDeEI7QUFBQSxRQUNKO0FBRUEsWUFBSTtBQUVKLFlBQUksTUFBTSxZQUFZLGdCQUFnQixNQUFNO0FBRXhDLGlCQUFPO0FBQUEsUUFDWCxPQUNLO0FBQ0QsaUJBQU87QUFBQSxRQUNYO0FBRUEsY0FBTSxlQUFlLENBQ2pCSyxRQUNBLG9CQUNpQjtBQUVqQixpQkFBTyxnQkFBZ0I7QUFBQSxZQUNuQkE7QUFBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQUE7QUFBQSxRQUVSO0FBRUEsbUJBQVc7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1Y7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUFBLE1BRVI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBRUEsZ0NBQWdDLENBQzVCLE9BQ0EsT0FDQSxtQkFDTztBM0NwNEJmO0EyQ3M0QlEsUUFBSSxDQUFDLE9BQU87QUFFUixZQUFNLElBQUksTUFBTSx1QkFBdUI7QUFBQSxJQUMzQztBQUVBLFNBQUksb0JBQWUsU0FBZixtQkFBcUIsTUFBTTtBQUUzQixjQUFRLElBQUksOEJBQTZCLG9CQUFlLEtBQUssU0FBcEIsbUJBQTBCLEVBQUUsRUFBRTtBQUV2RTtBQUFBLElBQ0o7QUFFQSxVQUFNLG1CQUFtQiwrQkFBTztBQUNoQyxVQUFNLG9CQUFvQixZQUFZLHFCQUFxQixnQkFBZ0I7QUFFM0UsUUFBSUwsV0FBRSxtQkFBbUIsaUJBQWlCLEdBQUc7QUFDekM7QUFBQSxJQUNKO0FBRUEsVUFBTSxVQUFVLGFBQWE7QUFBQSxNQUN6QjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osUUFBSSxRQUFRLFdBQVcsTUFBTTtBQUV6QixVQUFJLENBQUMsZUFBZSxLQUFLO0FBRXJCLHFCQUFhO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQUE7QUFBQSxNQUVSO0FBRUEsbUJBQWE7QUFBQSxRQUNUO0FBQUEsUUFDQSxlQUFlO0FBQUEsTUFBQTtBQUFBLElBRXZCLE9BQ0s7QUFDRCxZQUFNLE1BQWMsR0FBRyxpQkFBaUIsSUFBSSxlQUFlLG9CQUFvQjtBQUUvRSxZQUFNLGdCQUFnQixhQUFhO0FBQUEsUUFDL0I7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUdKLFVBQUksa0JBQWtCLE1BQU07QUFDeEI7QUFBQSxNQUNKO0FBRUEsVUFBSTtBQUVKLFVBQUksTUFBTSxZQUFZLGdCQUFnQixNQUFNO0FBRXhDLGVBQU87QUFBQSxNQUNYLE9BQ0s7QUFDRCxlQUFPO0FBQUEsTUFDWDtBQUVBLFlBQU0sZUFBZSxDQUNqQkssUUFDQSxvQkFDaUI7QUFFakIsZUFBTyxnQkFBZ0I7QUFBQSxVQUNuQkE7QUFBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQUE7QUFBQSxNQUVSO0FBRUEsaUJBQVc7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0EsVUFBVTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFBQSxFQUNKO0FBQUEsRUFFQSx1QkFBdUIsQ0FDbkIsT0FDQSxZQUNBLFNBQ0EsV0FDaUI7QUFFakIsWUFBUSxJQUFJLFdBQVc7QUFFdkIsUUFBSSxXQUFXLEtBQ1IsTUFBTSxRQUFRLFdBQVcsQ0FBQyxNQUFNLFFBQ2hDLFdBQVcsRUFBRSxTQUFTLEdBQzNCO0FBQ0U7QUFBQSxRQUNJO0FBQUEsUUFDQSxXQUFXO0FBQUEsTUFBQTtBQUFBLElBRW5CO0FBRUEsUUFBSSxXQUFXLEdBQUc7QUFFZCxjQUFRLElBQUksV0FBVztBQUFBLElBQzNCO0FBRUEsWUFBUSxJQUFJO0FBQUEsTUFDUjtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1g7QUFBQSxJQUFBO0FBR0osWUFBUSxTQUFTO0FBQ2pCLFlBQVEsRUFBRSxTQUFTO0FBQ25CLFlBQVEsS0FBSyxXQUFXO0FBRXhCLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxpQ0FBaUMsQ0FDN0IsT0FDQSxTQUNBLFdBQ087QUFFUDtBQUFBLE1BQ0k7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLGdDQUFnQyxDQUM1QixPQUNBLFNBQ0EsV0FDTztBQUVQO0FBQUEsTUFDSTtBQUFBLE1BQ0EsUUFBUTtBQUFBLE1BQ1I7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDOWdDQSxNQUFNLGNBQWMsQ0FDaEIsT0FDQSxZQUNBLGNBQ0EsUUFDQSxlQUE2RjtBQUU3RixNQUFJLENBQUMsT0FBTztBQUNSO0FBQUEsRUFDSjtBQUVBLFFBQU0sU0FBaUJMLFdBQUUsYUFBQTtBQUV6QixNQUFJLFVBQVUsZ0JBQWdCO0FBQUEsSUFDMUI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixRQUFNLE1BQWMsR0FBRyxZQUFZO0FBRW5DLFNBQU8sbUJBQW1CO0FBQUEsSUFDdEI7QUFBQSxJQUNBLFdBQVc7QUFBQSxJQUNYLFNBQVM7QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSO0FBQUEsSUFBQTtBQUFBLElBRUosVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsT0FBTyxDQUFDSyxRQUFlLGlCQUFzQjtBQUV6QyxjQUFRLElBQUk7QUFBQSw0RUFDb0QsWUFBWSxTQUFTLFVBQVU7QUFBQSx5QkFDbEYsR0FBRztBQUFBLG1DQUNPLEtBQUssVUFBVSxZQUFZLENBQUM7QUFBQSwyQkFDcEMsS0FBSyxVQUFVLGFBQWEsS0FBSyxDQUFDO0FBQUEsNEJBQ2pDLFdBQVc7QUFBQSwyQkFDWixNQUFNO0FBQUEsY0FDbkI7QUFFRixZQUFNO0FBQUEsNEVBQzBELFlBQVksU0FBUyxVQUFVO0FBQUEseUJBQ2xGLEdBQUc7QUFBQSxtQ0FDTyxLQUFLLFVBQVUsWUFBWSxDQUFDO0FBQUEsMkJBQ3BDLEtBQUssVUFBVSxhQUFhLEtBQUssQ0FBQztBQUFBLDRCQUNqQyxZQUFZLElBQUk7QUFBQSwyQkFDakIsTUFBTTtBQUFBLGNBQ25CO0FBRUYsYUFBTyxXQUFXLFdBQVdBLE1BQUs7QUFBQSxJQUN0QztBQUFBLEVBQUEsQ0FDSDtBQUNMO0FBRUEsTUFBTSxtQkFBbUI7QUFBQSxFQUVyQixhQUFhLENBQ1QsT0FDQSxRQUNBLGlCQUM2QjtBQUU3QixVQUFNLGFBQXVELENBQUNBLFFBQWUsYUFBa0I7QUFFM0YsWUFBTSxXQUFXLGlCQUFpQjtBQUFBLFFBQzlCQTtBQUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFHSixlQUFTLFlBQVksYUFBYTtBQUVsQyxhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQSxPQUFPO0FBQUEsTUFDUDtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1g7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDaEZBLE1BQU0sa0JBQWtCLENBQ3BCLE9BQ0EsV0FDaUI7QTdDcEJyQjtBNkNzQkksUUFBTSxVQUFVO0FBQ2hCLFNBQU8sVUFBVSxPQUFPLGFBQWE7QUFDckMsUUFBTSxlQUFlLElBQUcsa0JBQU8sWUFBUCxtQkFBZ0IsWUFBaEIsbUJBQXlCLElBQUksSUFBSSxPQUFPLEVBQUUsR0FBRyxlQUFlLHFCQUFxQjtBQUV6RyxTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0EsaUJBQWlCO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBQ0o7QUFFUjtBQUVBLE1BQU0sMkJBQTJCLENBQzdCLE9BQ0EsU0FDQSxhQUNBLGFBQ2lCO0FBRWpCLE1BQUksVUFBVTtBQUVWLFFBQUksWUFBWSxNQUFNLFNBQVMsSUFBSTtBQUUvQixZQUFNLElBQUksTUFBTSxzREFBc0Q7QUFBQSxJQUMxRTtBQUVBLFFBQUksWUFBWSxTQUFTLFlBQVksTUFBTTtBQUV2QztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixXQUNTLFlBQVksU0FBUyxZQUFZLE1BQU07QUFFNUM7QUFBQSxRQUNJO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsV0FDUyxZQUFZLFlBQVksUUFDMUIsWUFBWSxXQUFXLE1BQU07QUFFaEM7QUFBQSxRQUNJO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixXQUNTLFlBQVksV0FBVyxNQUFNO0FBRWxDO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSLFdBQ1MsWUFBWSxTQUFTLFlBQVksTUFBTTtBQUU1QztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixPQUNLO0FBQ0QsWUFBTSxJQUFJLE1BQU0sMkJBQTJCO0FBQUEsSUFDL0M7QUFBQSxFQUNKO0FBRUEsU0FBTyxXQUFXLFdBQVcsS0FBSztBQUN0QztBQUVBLE1BQU0sNkJBQTZCLENBQy9CLFNBQ0EsYUFDQSxhQUNPO0FBRVAsTUFBSSxDQUFDLFFBQVEsZ0JBQWdCO0FBRXpCLFVBQU0sSUFBSSxNQUFNLGlDQUFpQztBQUFBLEVBQ3JEO0FBRUEsTUFBSSxZQUFZLE1BQU0sU0FBUyxJQUFJO0FBRS9CLFVBQU0sSUFBSSxNQUFNLGtEQUFrRDtBQUFBLEVBQ3RFO0FBQ0o7QUFFQSxNQUFNLHFCQUFxQixDQUN2QixTQUNBLGFBQ0EsYUFDTztBQUVQLE1BQUksQ0FBQyxRQUFRLGdCQUFnQjtBQUV6QixVQUFNLElBQUksTUFBTSxpQ0FBaUM7QUFBQSxFQUNyRDtBQUVBLE1BQUksQ0FBQ0wsV0FBRSxtQkFBbUIsU0FBUyxJQUFJLEdBQUc7QUFFdEMsVUFBTSxJQUFJLE1BQU0sbURBQW1EO0FBQUEsRUFDdkUsV0FDUyxDQUFDQSxXQUFFLG1CQUFtQixTQUFTLFFBQVEsR0FBRztBQUUvQyxVQUFNLElBQUksTUFBTSxtREFBbUQ7QUFBQSxFQUN2RTtBQUVBLE1BQUksWUFBWSxNQUFNLFNBQVMsSUFBSTtBQUUvQixVQUFNLElBQUksTUFBTSxrREFBa0Q7QUFBQSxFQUN0RTtBQUNKO0FBRUEsTUFBTSwwQkFBMEIsQ0FDNUIsU0FDQSxhQUNPO0FBRVAsTUFBSSxDQUFDLFFBQVEsZ0JBQWdCO0FBRXpCLFVBQU0sSUFBSSxNQUFNLGlDQUFpQztBQUFBLEVBQ3JEO0FBRUEsTUFBSSxDQUFDQSxXQUFFLG1CQUFtQixTQUFTLElBQUksR0FBRztBQUV0QyxVQUFNLElBQUksTUFBTSxtREFBbUQ7QUFBQSxFQUN2RSxXQUNTLENBQUNBLFdBQUUsbUJBQW1CLFNBQVMsUUFBUSxHQUFHO0FBRS9DLFVBQU0sSUFBSSxNQUFNLG1EQUFtRDtBQUFBLEVBQ3ZFO0FBQ0o7QUFFQSxNQUFNLHFCQUFxQixDQUN2QixTQUNBLGFBQ0EsYUFDTztBQUVQLE1BQUksQ0FBQyxRQUFRLGdCQUFnQjtBQUV6QixVQUFNLElBQUksTUFBTSxpQ0FBaUM7QUFBQSxFQUNyRDtBQUVBLE1BQUksQ0FBQyxRQUFRLG1CQUFtQjtBQUU1QixVQUFNLElBQUksTUFBTSxxQ0FBcUM7QUFBQSxFQUN6RDtBQUVBLE1BQUlBLFdBQUUsbUJBQW1CLFNBQVMsT0FBTyxNQUFNLE1BQU07QUFFakQsVUFBTSxJQUFJLE1BQU0sOENBQThDO0FBQUEsRUFDbEUsV0FDUyxRQUFRLElBQUksU0FBUyxZQUFZLE1BQU07QUFFNUMsVUFBTSxJQUFJLE1BQU0sbURBQW1EO0FBQUEsRUFDdkU7QUFFQSxNQUFJLFlBQVksTUFBTSxTQUFTLElBQUk7QUFFL0IsVUFBTSxJQUFJLE1BQU0sa0RBQWtEO0FBQUEsRUFDdEU7QUFDSjtBQUVBLE1BQU0sbUJBQW1CLENBQ3JCLE9BQ0EsU0FDQSxhQUNPO0FBRVA7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixnQkFBYztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxlQUFlLENBQ2pCLE9BQ0EsU0FDQSxhQUNPO0FBRVAsUUFBTSxZQUFZLFFBQVE7QUFFMUIsTUFBSSxDQUFDLFdBQVc7QUFFWixVQUFNLElBQUksTUFBTSwwQ0FBMEM7QUFBQSxFQUM5RDtBQUVBLFFBQU0sVUFBVSxRQUFRO0FBRXhCLE1BQUksQ0FBQyxTQUFTO0FBRVYsVUFBTSxJQUFJLE1BQU0sdUNBQXVDO0FBQUEsRUFDM0Q7QUFFQSxNQUFJLFNBQWlDLFdBQVc7QUFBQSxJQUM1QztBQUFBLElBQ0EsVUFBVTtBQUFBLElBQ1YsUUFBUSxNQUFNO0FBQUEsRUFBQTtBQUdsQixNQUFJLGlDQUFRLE1BQU07QUFFZCxRQUFJLE9BQU8sT0FBTyxTQUFTLElBQUk7QUFFM0IsWUFBTSxJQUFJLE1BQU0sa0NBQWtDO0FBQUEsSUFDdEQ7QUFFQSxXQUFPLEtBQUssT0FBTztBQUFBLEVBQ3ZCLE9BQ0s7QUFFRCxVQUFNLElBQUksTUFBTSx5QkFBeUI7QUFBQSxFQUM3QztBQUVBLFVBQVEsVUFBVTtBQUN0QjtBQUVBLE1BQU0sY0FBYyxDQUNoQixPQUNBLFNBQ0EsYUFDQSxhQUNPO0FBRVA7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osZ0JBQWM7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSjtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxjQUFjLENBQ2hCLE9BQ0EsU0FDQSxhQUNBLGFBQ087QTdDcFNYO0E2Q3NTSTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSjtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFdBQVMsT0FBTztBQUNoQixXQUFTLFdBQVc7QUFFcEIsUUFBSSxjQUFTLFlBQVQsbUJBQWtCLFVBQVMsR0FBRztBQUU5QixrQkFBYyxpQkFBaUIsS0FBSztBQUNwQyxhQUFTLEdBQUcsMEJBQTBCO0FBQ3RDLFVBQU0sWUFBWSxHQUFHLGtCQUFrQjtBQUFBLEVBQzNDO0FBQ0o7QUFFQSxNQUFNLGNBQWMsQ0FDaEIsT0FDQSxTQUNBLGFBQ0EsYUFDTztBQUVQLE1BQUksWUFBWSxNQUFNLFNBQVMsSUFBSTtBQUUvQixVQUFNLElBQUksTUFBTSxrREFBa0Q7QUFBQSxFQUN0RTtBQUVBLFFBQU0sVUFBVSxTQUFTLFFBQVE7QUFFakMsTUFBSSxDQUFDLFNBQVM7QUFDVjtBQUFBLEVBQ0o7QUFFQSxPQUFJLDJDQUFhLE1BQUssTUFBTTtBQUV4QixVQUFNLElBQUksTUFBQTtBQUFBLEVBQ2Q7QUFFQSxNQUFJLFlBQVksV0FBVyxRQUNwQixZQUFZLFlBQVksTUFDN0I7QUFDRTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBRUEsUUFBTSxlQUFlLGFBQWE7QUFBQSxJQUM5QjtBQUFBLElBQ0EsMkNBQWE7QUFBQSxFQUFBO0FBR2pCLGVBQWE7QUFBQSxJQUNUO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUFBO0FBRWhCO0FBRUEsTUFBTSxjQUFjLENBQ2hCLE9BQ0EsU0FDQSxhQUNBLGlCQUNPO0FBRVA7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osUUFBTSxVQUF5QixhQUFhO0FBQzVDLFFBQU0sZ0JBQWdCLFFBQVE7QUFFOUIsTUFBSSxDQUFDLGVBQWU7QUFFaEIsVUFBTSxJQUFJLE1BQU0sOEJBQThCO0FBQUEsRUFDbEQ7QUFFQSxRQUFNLFdBQVcsYUFBYTtBQUU5QixhQUFXLFVBQVUsY0FBYyxTQUFTO0FBRXhDLFFBQUksT0FBTyxhQUFhLFVBQVU7QUFFOUIsbUJBQWE7QUFBQSxRQUNUO0FBQUEsUUFDQSxRQUFRO0FBQUEsUUFDUixPQUFPO0FBQUEsTUFBQTtBQUdYLG9CQUFjO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUFBLEVBQ0o7QUFDSjtBQUVBLE1BQU0sZUFBZSxDQUNqQixPQUNBLFVBQ0EsV0FDeUI7QUFFekIsUUFBTSxtQkFBbUIsT0FBTztBQUVoQyxNQUFJQSxXQUFFLG1CQUFtQixnQkFBZ0IsTUFBTSxNQUFNO0FBRWpELFVBQU0sSUFBSSxNQUFNLDRCQUE0QjtBQUFBLEVBQ2hEO0FBRUEsUUFBTSxpQkFBaUIsY0FBYztBQUFBLElBQ2pDO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVDtBQUFBLElBQ0EsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLEVBQUE7QUFHWCxRQUFNLFVBQVU7QUFFaEIsU0FBTztBQUNYO0FBRUEsTUFBTSxrQkFBa0IsQ0FDcEIsT0FDQSxVQUNBLFdBQ3lCO0FBRXpCLFFBQU0sbUJBQW1CLE9BQU87QUFFaEMsTUFBSUEsV0FBRSxtQkFBbUIsZ0JBQWdCLE1BQU0sTUFBTTtBQUVqRCxVQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxFQUNoRDtBQUVBLFFBQU0saUJBQWlCLGNBQWM7QUFBQSxJQUNqQztBQUFBLElBQ0EsU0FBUztBQUFBLElBQ1Q7QUFBQSxJQUNBLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxFQUFBO0FBR1gsUUFBTSxVQUFVO0FBRWhCLFNBQU87QUFDWDtBQUVBLE1BQU0sa0JBQWtCLENBQ3BCLE9BQ0EsYUFDTztBQUVQLE1BQUksQ0FBQyxPQUFPO0FBQ1I7QUFBQSxFQUNKO0FBRUEsTUFBSSxpQkFBeUM7QUFFN0MsTUFBSSxpQkFBeUMsV0FBVztBQUFBLElBQ3BEO0FBQUEsSUFDQSxTQUFTLFFBQVE7QUFBQSxJQUNqQixTQUFTO0FBQUEsRUFBQTtBQUdiLE1BQUksQ0FBQyxnQkFBZ0I7QUFDakI7QUFBQSxFQUNKO0FBRUEsYUFBVyxVQUFVLGVBQWUsU0FBUztBQUV6QyxRQUFJLE9BQU8sT0FBTyxTQUFTLElBQUk7QUFFM0IsdUJBQWlCO0FBRWpCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxNQUFJLGdCQUFnQjtBQUVoQixtQkFBZSxHQUFHLDBCQUEwQjtBQUU1QyxrQkFBYztBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQ0o7QUFFQSxNQUFNLG1CQUFtQjtBQUFBLEVBRXJCLG1CQUFtQixDQUNmLE9BRUEsY0FDaUI7QUFvQmpCLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSxnQkFBZ0IsQ0FDWixPQUNBLGdCQUNBLFdBQ2lCO0FBT2pCLGtCQUFjLDJCQUEyQixlQUFlLE9BQU87QUFDL0Qsa0JBQWMsbUJBQW1CLGNBQWM7QUFFL0Msa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFxQkosV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLGNBQWMsQ0FDVixPQUNBLFVBQ0EsV0FDUztBQUVULFFBQUksQ0FBQyxTQUNFQSxXQUFFLG1CQUFtQixPQUFPLEVBQUUsR0FDbkM7QUFDRSxhQUFPO0FBQUEsSUFDWDtBQUVBO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsNEJBQTRCLENBQ3hCLE9BQ0EsVUFDQSxRQUNBLGFBQTRCLFNBQ1g7QUFFakIsUUFBSSxDQUFDLE9BQU87QUFFUixhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sT0FBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixRQUFJLE1BQU07QUFFTixvQkFBYztBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUdKLFVBQUksWUFBWTtBQUVaLGFBQUssU0FBUztBQUFBLE1BQ2xCO0FBQUEsSUFDSjtBQUVBLFFBQUksQ0FBQyxNQUFNLFlBQVksYUFBYTtBQUVoQyxZQUFNLFlBQVksYUFBYTtBQUFBLElBQ25DO0FBRUEsV0FBTyxXQUFXLFdBQVcsS0FBSztBQUFBLEVBQ3RDO0FBQUEsRUFFQSxpQkFBaUIsQ0FDYixPQUNBLFVBQ0EsUUFDQSxhQUE0QixTQUNYO0FBRWpCLFFBQUksQ0FBQyxPQUFPO0FBRVIsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLE9BQU87QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osUUFBSSxNQUFNO0FBRU4sb0JBQWM7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFHSixVQUFJLFlBQVk7QUFFWixhQUFLLFNBQVM7QUFBQSxNQUNsQjtBQUFBLElBQ0o7QUFFQSxRQUFJLENBQUMsTUFBTSxZQUFZLGFBQWE7QUFFaEMsWUFBTSxZQUFZLGFBQWE7QUFBQSxJQUNuQztBQUVBLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsZ0NBQWdDLENBQzVCLE9BQ0EsVUFDQSxZQUNpQjtBN0NwcUJ6QjtBNkNzcUJRLFFBQUksQ0FBQyxPQUFPO0FBQ1IsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLGlCQUFnQixhQUFRLFlBQVIsbUJBQWlCLEVBQUU7QUFFekMsUUFBSSxDQUFDLGVBQWU7QUFFaEIsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLGlCQUFpQixjQUFjO0FBQUEsTUFDakM7QUFBQSxNQUNBLFNBQVM7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osVUFBTSxVQUFVO0FBRWhCLFFBQUksZ0JBQWdCO0FBRWhCLHFCQUFlLFFBQVEsT0FBTztBQUM5QixxQkFBZSxRQUFRLFVBQVU7QUFBQSxJQUNyQztBQUVBLFVBQU0sWUFBWSxhQUFhO0FBRS9CLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEscUJBQXFCLENBQ2pCLE9BQ0EsVUFDQSxZQUNpQjtBN0Mxc0J6QjtBNkM0c0JRLFFBQUksQ0FBQyxPQUFPO0FBQ1IsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLGlCQUFnQixhQUFRLFlBQVIsbUJBQWlCLEVBQUU7QUFFekMsUUFBSSxDQUFDLGVBQWU7QUFFaEIsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLGlCQUFpQixjQUFjO0FBQUEsTUFDakM7QUFBQSxNQUNBLFNBQVM7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osVUFBTSxVQUFVO0FBRWhCLFFBQUksZ0JBQWdCO0FBRWhCLHFCQUFlLFFBQVEsT0FBTztBQUM5QixxQkFBZSxRQUFRLFVBQVU7QUFBQSxJQUNyQztBQUVBLFVBQU0sWUFBWSxhQUFhO0FBRS9CLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsbUJBQW1CLENBQ2YsT0FDQSxVQUNBLFNBQ0EsZ0JBQ2lCO0E3Q2p2QnpCO0E2Q212QlEsUUFBSSxDQUFDLE9BQU87QUFFUixhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0saUJBQWlCLFFBQVE7QUFFL0IsUUFBSSxDQUFDLGdCQUFnQjtBQUVqQixZQUFNLElBQUksTUFBTSx5QkFBeUI7QUFBQSxJQUM3QztBQUVBLFFBQUksb0JBQW1CLGlCQUFZLFdBQVosbUJBQW9CO0FBRTNDLFFBQUksWUFBWSxXQUFXLE1BQU07QUFFN0IsVUFBSSxDQUFDLFlBQVksU0FBUztBQUV0QiwyQkFBbUI7QUFBQSxNQUN2QixPQUNLO0FBQ0QsMkJBQW1CO0FBQUEsTUFDdkI7QUFBQSxJQUNKLFdBQ1NBLFdBQUUsbUJBQW1CLGdCQUFnQixNQUFNLE1BQU07QUFFdEQsWUFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQUEsSUFDaEQ7QUFFQSxVQUFNLFNBQWtFLGNBQWM7QUFBQSxNQUNsRjtBQUFBLE1BQ0EsU0FBUztBQUFBLE1BQ1Q7QUFBQSxNQUNBLFlBQVk7QUFBQSxNQUNaO0FBQUEsTUFDQSxRQUFRO0FBQUEsSUFBQTtBQUdaLFVBQU0sV0FBVyxPQUFPO0FBQ3hCLFVBQU0sVUFBVTtBQUVoQixRQUFJLFVBQVU7QUFFVixVQUFJLGlCQUF5QyxXQUFXO0FBQUEsUUFDcEQ7QUFBQSxRQUNBLGVBQWU7QUFBQSxRQUNmO0FBQUEsTUFBQTtBQUdKLHFCQUFlLFVBQVU7QUFFekIsVUFBSSxnQkFBZ0I7QUFFaEIsWUFBSSxlQUFlLE9BQU8sU0FBUyxJQUFJO0FBRW5DLGdCQUFNLElBQUksTUFBTSwwQ0FBMEM7QUFBQSxRQUM5RDtBQUVBLHVCQUFlLFdBQVc7QUFDMUIsaUJBQVMsR0FBRyxlQUFlLGVBQWUsR0FBRyxlQUFlO0FBQUEsTUFDaEU7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDcnpCQSxNQUFNLG9CQUFvQjtBQUFBLEVBRXRCLGlCQUFpQixDQUNiLE9BQ0EsU0FDTztBQUVQLFFBQUksQ0FBQyxPQUFPLGNBQWM7QUFDdEI7QUFBQSxJQUNKO0FBRUEsV0FBTyxhQUFhO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ0RBLE1BQU0sbUJBQW1CLENBQ3JCLFNBQ0EsZ0JBQ0EsaUJBQ2dCO0EvQ3ZCcEI7QStDeUJJLE1BQUksUUFBUSxlQUFlLFlBQVk7QUFFdkMsTUFBSSxPQUFPO0FBRVAsV0FBTztBQUFBLEVBQ1g7QUFFQSxRQUFNLGdCQUFlLG1CQUFRLFlBQVIsbUJBQWlCLE9BQWpCLG1CQUFzQjtBQUUzQyxNQUFJLGNBQWM7QUFFZCxtQkFBZSxZQUFZLElBQUk7QUFBQSxFQUNuQztBQUVBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFNBQU8sZUFBZSxZQUFZLEtBQUs7QUFDM0M7QUFFQSxNQUFNLDJCQUEyQixDQUM3QixTQUNBLGdCQUNBLGlCQUNPO0EvQ3BEWDtBK0NzREksUUFBTSxRQUFRO0FBQ2QsUUFBTSxVQUFTLFdBQU0sV0FBTixtQkFBYztBQUU3QixNQUFJLENBQUMsUUFBUTtBQUNUO0FBQUEsRUFDSjtBQUVBLFFBQU0sZUFBYyxrQkFBTyxZQUFQLG1CQUFnQixPQUFoQixtQkFBcUI7QUFFekMsTUFBSSxhQUFhO0FBRWIsbUJBQWUsWUFBWSxJQUFJO0FBQUEsRUFDbkM7QUFFQTtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sb0JBQW9CLENBQUMsYUFBb0M7QUFFM0QsUUFBTSxRQUFRLFNBQVM7QUFDdkIsUUFBTSxxQkFBcUI7QUFDM0IsUUFBTSxVQUFVLE1BQU0sU0FBUyxrQkFBa0I7QUFDakQsTUFBSTtBQUNKLE1BQUksaUJBQXNCLENBQUE7QUFDMUIsTUFBSSxTQUFTO0FBQ2IsTUFBSSxTQUFTO0FBRWIsYUFBVyxTQUFTLFNBQVM7QUFFekIsUUFBSSxTQUNHLE1BQU0sVUFFTixNQUFNLFNBQVMsTUFDcEI7QUFDRSxxQkFBZSxNQUFNLE9BQU87QUFFNUIsWUFBTSxnQkFBZ0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBR0osVUFBSSxDQUFDLGVBQWU7QUFFaEIsY0FBTSxJQUFJLE1BQU0sYUFBYSxZQUFZLHFCQUFxQjtBQUFBLE1BQ2xFO0FBRUEsZUFBUyxTQUNMLE1BQU0sVUFBVSxRQUFRLE1BQU0sS0FBSyxJQUNuQztBQUVKLGVBQVMsTUFBTSxRQUFRLE1BQU0sQ0FBQyxFQUFFO0FBQUEsSUFDcEM7QUFBQSxFQUNKO0FBRUEsV0FBUyxTQUNMLE1BQU0sVUFBVSxRQUFRLE1BQU0sTUFBTTtBQUV4QyxXQUFTLFFBQVE7QUFDckI7QUFFQSxNQUFNLHFCQUFxQixDQUN2QixRQUNBLGFBQ087QUFFUCxhQUFXLFVBQVUsT0FBTyxTQUFTO0FBRWpDLFFBQUksT0FBTyxPQUFPLFNBQVMsSUFBSTtBQUUzQiwwQkFBb0IsTUFBTTtBQUFBLElBQzlCO0FBQUEsRUFDSjtBQUNKO0FBRUEsTUFBTSxzQkFBc0IsQ0FBQyxhQUF1RDtBL0NySXBGO0ErQ3VJSSxNQUFJLENBQUMsVUFBVTtBQUNYO0FBQUEsRUFDSjtBQUVBLHVCQUFvQixjQUFTLFNBQVQsbUJBQWUsSUFBSTtBQUV2QyxhQUFXLFVBQVUsU0FBUyxTQUFTO0FBRW5DLHdCQUFvQixNQUFNO0FBQUEsRUFDOUI7QUFFQSxXQUFTLFdBQVc7QUFFcEIsT0FBSSxjQUFTLFNBQVQsbUJBQWUsTUFBTTtBQUVyQixhQUFTLEtBQUssS0FBSyxXQUFXO0FBQUEsRUFDbEM7QUFDSjtBQUVBLE1BQU0sYUFBYSxDQUNmLE9BQ0EsV0FDQSxhQUNBLFNBQ0Esa0JBQ0EsaUJBQ2tCO0FBRWxCLFFBQU0sU0FBUyxJQUFJO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFNBQU8sU0FBUyxVQUFVLFVBQVU7QUFDcEMsU0FBTyxjQUFjLFVBQVUsZ0JBQWdCO0FBQy9DLFNBQU8sUUFBUSxVQUFVLFNBQVM7QUFDbEMsU0FBTyxXQUFXLFVBQVUsWUFBWTtBQUN4QyxTQUFPLFNBQVMsVUFBVSxVQUFVO0FBQ3BDLFNBQU8sVUFBVSxVQUFVLFdBQVc7QUFFdEMsTUFBSSxhQUFhO0FBRWIsZUFBVyxpQkFBaUIsWUFBWSxHQUFHO0FBRXZDLFVBQUksY0FBYyxNQUFNLE9BQU8sSUFBSTtBQUUvQixtQkFBVztBQUFBLFVBQ1A7QUFBQSxVQUNBLFFBQVE7QUFBQSxVQUNSO0FBQUEsUUFBQTtBQUdKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsYUFBVztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLGVBQWE7QUFBQSxJQUNUO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osU0FBTztBQUNYO0FBRUEsTUFBTSx3QkFBd0IsQ0FDMUIsT0FDQSxNQUNBLGVBQ087QUFFUCxRQUFNLFVBQXlCLEtBQUs7QUFDcEMsUUFBTSxTQUFTLFFBQVE7QUFFdkIsTUFBSSxDQUFDLFFBQVE7QUFFVCxVQUFNLElBQUksTUFBTSw4QkFBOEI7QUFBQSxFQUNsRDtBQUVBLFFBQU0sV0FBVyxLQUFLO0FBRXRCLGFBQVcsVUFBVSxPQUFPLFNBQVM7QUFFakMsUUFBSSxPQUFPLGFBQWEsVUFBVTtBQUU5QixhQUFPO0FBQUEsUUFDSDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFBQSxFQUNKO0FBQ0o7QUFFQSxNQUFNLDZCQUE2QixDQUMvQixPQUNBLFFBQ0EsYUFBNEIsU0FDckI7QS9DalBYO0ErQ21QSSxNQUFJLENBQUMsVUFDRSxHQUFDLGtCQUFPLFlBQVAsbUJBQWdCLFlBQWhCLG1CQUF5QixPQUMvQjtBQUNFO0FBQUEsRUFDSjtBQUVBLGdCQUFjO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBT0osU0FBTyxjQUFjO0FBQUEsSUFDakI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQTBCQSxNQUFNLDRCQUE0QixDQUM5QixPQUNBLFlBQ087QS9DcFNYO0ErQ3NTSSxRQUFNLGtCQUFrQixhQUFhO0FBQUEsSUFDakM7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLE1BQUksQ0FBQyxpQkFBaUI7QUFDbEI7QUFBQSxFQUNKO0FBRUEsUUFBTSxxQkFBb0IsbUJBQVEsbUJBQVIsbUJBQXdCLFlBQXhCLG1CQUFpQztBQUMzRCxRQUFNLE1BQU0sR0FBRyxpQkFBaUIsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLGVBQWUscUJBQXFCO0FBRTVGLFFBQU0sZUFBZSxDQUNqQkssUUFDQSxvQkFDaUI7QUFFakIsV0FBTyxpQkFBaUI7QUFBQSxNQUNwQkE7QUFBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFFQSxhQUFXO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxJQUNBLFVBQVU7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sZ0JBQWdCO0FBQUEsRUFFbEIsdUJBQXVCLENBQ25CLE9BQ0EsWUFDTztBQUVQLFFBQUksUUFBUSxhQUFhLFNBQVMsR0FBRztBQUVqQztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsT0FDSztBQUNELG1CQUFhO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUFBLEVBQ0o7QUFBQSxFQUVBLFdBQVcsQ0FDUCxVQUNBLGFBQ1U7QUFFVixlQUFXLFVBQVUsU0FBUyxTQUFTO0FBRW5DLFVBQUksT0FBTyxPQUFPLFVBQVU7QUFFeEIsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGVBQWUsQ0FBQyxhQUFvQztBL0M5V3hEO0ErQ2dYUSxRQUFJLEdBQUMsY0FBUyxhQUFULG1CQUFtQixLQUFJO0FBQ3hCO0FBQUEsSUFDSjtBQUVBLFFBQUksQ0FBQyxjQUFjLFVBQVUsV0FBVSxjQUFTLGFBQVQsbUJBQW1CLEVBQUUsR0FBRztBQUUzRCxZQUFNLElBQUksTUFBTSx3REFBd0Q7QUFBQSxJQUM1RTtBQUFBLEVBQ0o7QUFBQSxFQUVBLDRCQUE0QixDQUFDLGlCQUF3QztBQUVqRSxVQUFNLFNBQVUsYUFBK0I7QUFFL0MsUUFBSSxDQUFDLFFBQVE7QUFDVDtBQUFBLElBQ0o7QUFFQSxrQkFBYyxnQ0FBZ0MsTUFBTTtBQUNwRCxrQkFBYywyQkFBMkIsT0FBTyxPQUF3QjtBQUFBLEVBQzVFO0FBQUEsRUFFQSxpQ0FBaUMsQ0FBQyxhQUF1RDtBQUVyRixRQUFJLENBQUMsVUFBVTtBQUNYO0FBQUEsSUFDSjtBQUVBLGtCQUFjLG1CQUFtQixTQUFTLFFBQVE7QUFDbEQsYUFBUyxXQUFXO0FBQUEsRUFDeEI7QUFBQSxFQUVBLG9CQUFvQixDQUFDLGFBQXVEO0EvQ2haaEY7QStDa1pRLFFBQUksQ0FBQyxVQUFVO0FBQ1g7QUFBQSxJQUNKO0FBRUEsa0JBQWMsb0JBQW1CLGNBQVMsU0FBVCxtQkFBZSxJQUFJO0FBQ3BELGtCQUFjLG1CQUFtQixTQUFTLFFBQVE7QUFFbEQsYUFBUyxXQUFXO0FBQ3BCLGFBQVMsT0FBTztBQUFBLEVBQ3BCO0FBQUEsRUFFQSx1Q0FBdUMsQ0FDbkMsT0FDQSxRQUNBLGFBQTRCLFNBQ3JCO0EvQ2phZjtBK0N3YVEsVUFBTSxVQUFVO0FBQ2hCLFdBQU8sVUFBVSxPQUFPLGFBQWE7QUFFckMsaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixVQUFNLE1BQU0sSUFBRyxrQkFBTyxZQUFQLG1CQUFnQixZQUFoQixtQkFBeUIsSUFBSSxJQUFJLE9BQU8sRUFBRSxHQUFHLGVBQWUscUJBQXFCO0FBRWhHLFVBQU0sYUFBK0QsQ0FBQ0EsUUFBZSxhQUFrQjtBQUVuRyxhQUFPLGlCQUFpQjtBQUFBLFFBQ3BCQTtBQUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLGVBQVc7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0EsVUFBVTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLDRCQUE0QixDQUN4QixPQUNBLFFBQ0EsYUFBNEIsU0FDckI7QS9DemNmO0ErQzJjUSxVQUFNLFVBQVU7QUFDaEIsV0FBTyxVQUFVLE9BQU8sYUFBYTtBQUNyQyxVQUFNLE1BQU0sSUFBRyxrQkFBTyxZQUFQLG1CQUFnQixZQUFoQixtQkFBeUIsSUFBSSxJQUFJLE9BQU8sRUFBRSxHQUFHLGVBQWUscUJBQXFCO0FBRWhHLFVBQU0sYUFBK0QsQ0FBQ0EsUUFBZSxhQUFrQjtBQUVuRyxhQUFPLGlCQUFpQjtBQUFBLFFBQ3BCQTtBQUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLGVBQVc7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0EsVUFBVTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBcUNBLGtCQUFrQixDQUFDLGVBQStCO0FBRTlDLFdBQU8sY0FBYyxVQUFVO0FBQUEsRUFDbkM7QUFBQSxFQUVBLHNCQUFzQixDQUFDLGVBQStCO0FBRWxELFdBQU8sY0FBYyxVQUFVO0FBQUEsRUFDbkM7QUFBQSxFQUVBLHlCQUF5QixDQUNyQixPQUNBLFdBQ087QUFFUCxrQkFBYztBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osaUJBQWEsd0JBQXdCLEtBQUs7QUFBQSxFQUM5QztBQUFBLEVBRUEsNEJBQTRCLENBQ3hCLE9BQ0EsV0FDTztBQUVQLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSxzQkFBc0IsQ0FDbEIsT0FDQSxVQUNBLGtCQUNBLGVBQ0EsWUFDeUI7QUFFekIsVUFBTSxTQUFrRSxjQUFjO0FBQUEsTUFDbEY7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFVBQU0sV0FBVyxPQUFPO0FBRXhCLFFBQUksT0FBTyxvQkFBb0IsTUFBTTtBQUVqQyxvQkFBYztBQUFBLFFBQ1Y7QUFBQSxRQUNBLE9BQU87QUFBQSxNQUFBO0FBR1gsVUFBSSxDQUFDLFNBQVMsTUFBTTtBQUVoQixxQkFBYTtBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUFBLE1BRVI7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLHlCQUF5QixDQUNyQixPQUNBLFVBQ0Esa0JBQ0EsZUFDQSxZQUN5QjtBQUV6QixVQUFNLFNBQWtFLGNBQWM7QUFBQSxNQUNsRjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osVUFBTSxXQUFXLE9BQU87QUFFeEIsUUFBSSxPQUFPLG9CQUFvQixNQUFNO0FBRWpDLG9CQUFjO0FBQUEsUUFDVjtBQUFBLFFBQ0EsT0FBTztBQUFBLE1BQUE7QUFBQSxJQUVmO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLDBCQUEwQixDQUN0QixPQUNBLFVBQ0Esa0JBQ0EsZUFDQSxTQUNBLGVBQThCLFNBQzRCO0FBRTFELFFBQUksQ0FBQyxRQUFRLFNBQVM7QUFFbEIsWUFBTSxJQUFJLE1BQU0saUNBQWlDO0FBQUEsSUFDckQ7QUFFQSxVQUFNLGNBQWMsY0FBYyxjQUFjLFFBQVE7QUFFeEQsUUFBSSxDQUFDLGFBQWE7QUFFZCxZQUFNLElBQUksTUFBTSx1QkFBdUI7QUFBQSxJQUMzQztBQUVBLFFBQUksa0JBQWtCLFlBQVksSUFBSTtBQUVsQyxZQUFNLElBQUksTUFBTSxxREFBcUQ7QUFBQSxJQUN6RTtBQUVBLFFBQUksV0FBbUMsV0FBVztBQUFBLE1BQzlDO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUjtBQUFBLElBQUE7QUFHSixRQUFJLENBQUMsVUFBVTtBQUVYLGlCQUFXLElBQUk7QUFBQSxRQUNYLFlBQVk7QUFBQSxRQUNaO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLFFBQUksa0JBQWtCO0FBSXRCLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLGVBQVc7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixzQkFBa0I7QUFHbEIsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLDZCQUE2QixDQUN6QixPQUNBLGFBQ087QUFFUCxVQUFNLHdCQUF3QixjQUFjLDJCQUEyQixTQUFTLE9BQU87QUFFdkYsUUFBSSxzQkFBc0IsUUFBUSxXQUFXLEtBQ3RDLHNCQUFzQixRQUFRLENBQUMsRUFBRSxXQUFXLE1BQzVDTCxXQUFFLG1CQUFtQixTQUFTLElBQUksS0FDbENBLFdBQUUsbUJBQW1CLFNBQVMsT0FBTyxHQUMxQztBQUNFLFlBQU0sY0FBYyxXQUFXO0FBQUEsUUFDM0I7QUFBQSxRQUNBLFNBQVMsUUFBUTtBQUFBLFFBQ2pCLFNBQVM7QUFBQSxNQUFBO0FBR2IsV0FBSSwyQ0FBYSxNQUFLLE1BQU07QUFDeEI7QUFBQSxNQUNKO0FBRUEsYUFBTztBQUFBLFFBQ0g7QUFBQSxRQUNBLHNCQUFzQixRQUFRLENBQUM7QUFBQSxNQUFBO0FBQUEsSUFFdkMsV0FDUyxDQUFDQSxXQUFFLG1CQUFtQixTQUFTLE9BQU8sR0FBRztBQUc5QztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsUUFDQSxTQUFTO0FBQUEsTUFBQTtBQUFBLElBRWpCO0FBQUEsRUFDSjtBQUFBLEVBRUEsa0JBQWtCLENBQ2QsT0FDQSxhQUNPO0FBRVAsVUFBTSx3QkFBd0IsY0FBYywyQkFBMkIsU0FBUyxPQUFPO0FBRXZGLGVBQVcsVUFBVSxzQkFBc0IsU0FBUztBQUVoRCxZQUFNLGNBQWMsV0FBVztBQUFBLFFBQzNCO0FBQUEsUUFDQSxPQUFPLFFBQVE7QUFBQSxRQUNmLE9BQU87QUFBQSxNQUFBO0FBR1gsV0FBSSwyQ0FBYSxNQUFLLFFBQ2YsT0FBTyxPQUFPLE1BQ25CO0FBQ0U7QUFBQSxNQUNKO0FBRUEsbUJBQWE7QUFBQSxRQUNUO0FBQUEsUUFDQTtBQUFBLFFBQ0EsT0FBTztBQUFBLE1BQUE7QUFBQSxJQU9mO0FBQUEsRUFDSjtBQUFBLEVBRUEsa0JBQWtCLENBQ2QsT0FDQSxtQkFDTztBQUVQLFFBQUksQ0FBQyxnQkFBZ0I7QUFDakI7QUFBQSxJQUNKO0FBRUEsVUFBTSxlQUFlLGVBQWU7QUFFcEMsUUFBSSxDQUFDLGNBQWM7QUFDZjtBQUFBLElBQ0o7QUFFQSxlQUFXO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osbUJBQWUsVUFBVSxlQUFlO0FBRXhDLGVBQVcsVUFBVSxhQUFhLFNBQVM7QUFFdkMsaUJBQVc7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBQUEsRUFDSjtBQUFBLEVBRUEsb0JBQW9CLENBQUMsVUFBMkI7QUFFNUMsUUFBSSxVQUFVO0FBRWQsUUFBSSxDQUFDQSxXQUFFLG1CQUFtQixPQUFPLEdBQUc7QUFFaEMsVUFBSSxRQUFRLFNBQVMsSUFBSTtBQUVyQixrQkFBVSxRQUFRLFVBQVUsR0FBRyxFQUFFO0FBQ2pDLGtCQUFVLFFBQVEsUUFBUSxPQUFPLEVBQUU7QUFBQSxNQUN2QztBQUFBLElBQ0o7QUFFQSxRQUFJLFFBQVEsV0FBVyxLQUFLLE1BQU0sUUFDM0IsUUFBUSxDQUFDLE1BQU0sS0FBSztBQUV2QixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSwrQkFBK0IsQ0FDM0IsT0FDQSxhQUNBLFNBQ087QUFFUCxRQUFJLENBQUMsYUFBYTtBQUNkO0FBQUEsSUFDSjtBQUVBLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLGNBQWMsQ0FDVixPQUNBLGFBQ0EsYUFDTztBL0N2MEJmO0ErQ3kwQlEsYUFBUyxpQkFBaUIsWUFBWSxrQkFBa0I7QUFDeEQsYUFBUyxjQUFjLFlBQVksZUFBZTtBQUNsRCxhQUFTLFVBQVUsWUFBWSxXQUFXO0FBQzFDLGFBQVMsWUFBWSxZQUFZLGFBQWE7QUFDOUMsYUFBUyxPQUFPLFlBQVksUUFBUTtBQUNwQyxhQUFTLFVBQVUsWUFBWSxXQUFXO0FBQzFDLGFBQVMsV0FBVyxZQUFZLFlBQVksQ0FBQTtBQUM1QyxhQUFTLFVBQVUsWUFBWSxXQUFXLENBQUE7QUFDMUMsYUFBUyxRQUFRLFlBQVksU0FBUztBQUN0QyxhQUFTLFFBQVEsU0FBUyxNQUFNLEtBQUE7QUFFaEMsYUFBUyxHQUFHLGFBQWE7QUFFekI7QUFBQSxNQUNJO0FBQUEsSUFBQTtBQUdKLFVBQU0sY0FBYyxXQUFXO0FBQUEsTUFDM0I7QUFBQSxNQUNBLFNBQVMsUUFBUTtBQUFBLE1BQ2pCLFNBQVM7QUFBQSxJQUFBO0FBR2IsYUFBUyxxQkFBbUIsZ0RBQWEsV0FBYixtQkFBcUIsTUFBSztBQUV0RCxRQUFJO0FBRUosUUFBSSxZQUFZLFdBQ1QsTUFBTSxRQUFRLFlBQVksT0FBTyxHQUN0QztBQUNFLGlCQUFXLGFBQWEsWUFBWSxTQUFTO0FBRXpDLGlCQUFTLFNBQVMsUUFBUSxLQUFLLE9BQUssRUFBRSxPQUFPLFVBQVUsRUFBRTtBQUV6RCxZQUFJLENBQUMsUUFBUTtBQUVULG1CQUFTO0FBQUEsWUFDTDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQSxTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsVUFBQTtBQUdiLG1CQUFTLFFBQVEsS0FBSyxNQUFNO0FBQUEsUUFDaEMsT0FDSztBQUNELGlCQUFPLFNBQVMsVUFBVSxVQUFVO0FBQ3BDLGlCQUFPLGNBQWMsVUFBVSxnQkFBZ0I7QUFDL0MsaUJBQU8sUUFBUSxVQUFVLFNBQVM7QUFDbEMsaUJBQU8sV0FBVyxVQUFVLFlBQVk7QUFDeEMsaUJBQU8sU0FBUyxVQUFVLFVBQVU7QUFDcEMsaUJBQU8sVUFBVSxVQUFVLFdBQVc7QUFDdEMsaUJBQU8sVUFBVSxTQUFTO0FBQzFCLGlCQUFPLG1CQUFtQixTQUFTO0FBQ25DLGlCQUFPLGVBQWUsU0FBUztBQUFBLFFBQ25DO0FBR0EsZUFBTyxHQUFHLGFBQWE7QUFBQSxNQUMzQjtBQUFBLElBQ0o7QUFFQSxzQkFBa0I7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSxlQUFlLENBQUMsYUFBMEI7QUFVdEMsVUFBTSxRQUFRLFNBQVMsTUFBTSxJQUFJO0FBQ2pDLFVBQU0scUJBQXFCLFFBQVEsZUFBZSx3QkFBd0I7QUFDMUUsVUFBTSxtQkFBbUI7QUFDekIsUUFBSSx3QkFBdUM7QUFDM0MsUUFBSTtBQUNKLFFBQUksYUFBYTtBQUNqQixRQUFJLFFBQVE7QUFFWixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBRW5DLGFBQU8sTUFBTSxDQUFDO0FBRWQsVUFBSSxZQUFZO0FBRVosZ0JBQVEsR0FBRyxLQUFLO0FBQUEsRUFDOUIsSUFBSTtBQUNVO0FBQUEsTUFDSjtBQUVBLFVBQUksS0FBSyxXQUFXLGtCQUFrQixNQUFNLE1BQU07QUFFOUMsZ0NBQXdCLEtBQUssVUFBVSxtQkFBbUIsTUFBTTtBQUNoRSxxQkFBYTtBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUVBLFFBQUksQ0FBQyx1QkFBdUI7QUFDeEI7QUFBQSxJQUNKO0FBRUEsNEJBQXdCLHNCQUFzQixLQUFBO0FBRTlDLFFBQUksc0JBQXNCLFNBQVMsZ0JBQWdCLE1BQU0sTUFBTTtBQUUzRCxZQUFNLFNBQVMsc0JBQXNCLFNBQVMsaUJBQWlCO0FBRS9ELDhCQUF3QixzQkFBc0I7QUFBQSxRQUMxQztBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLDRCQUF3QixzQkFBc0IsS0FBQTtBQUM5QyxRQUFJLGNBQTBCO0FBRTlCLFFBQUk7QUFDQSxvQkFBYyxLQUFLLE1BQU0scUJBQXFCO0FBQUEsSUFDbEQsU0FDTyxHQUFHO0FBQ04sY0FBUSxJQUFJLENBQUM7QUFBQSxJQUNqQjtBQUVBLGdCQUFZLFFBQVE7QUFFcEIsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLHFCQUFxQixDQUNqQixPQUNBLGFBQ087QUFFUCxRQUFJLENBQUMsT0FBTztBQUNSO0FBQUEsSUFDSjtBQUVBLGtCQUFjLGlCQUFpQixLQUFLO0FBQ3BDLFVBQU0sWUFBWSxHQUFHLGtCQUFrQjtBQUN2QyxhQUFTLEdBQUcsMEJBQTBCO0FBQUEsRUFDMUM7QUFBQSxFQUVBLDBCQUEwQixDQUFDLGFBQW9DO0FBRTNELFFBQUksQ0FBQyxZQUNFLFNBQVMsUUFBUSxXQUFXLEdBQ2pDO0FBQ0U7QUFBQSxJQUNKO0FBRUEsZUFBVyxVQUFVLFNBQVMsU0FBUztBQUVuQyxhQUFPLEdBQUcsMEJBQTBCO0FBQUEsSUFDeEM7QUFBQSxFQUNKO0FBQUEsRUFFQSxnQkFBZ0IsQ0FDWixPQUNBLFVBQ0EsV0FDTztBQUVQLGtCQUFjLHlCQUF5QixRQUFRO0FBQy9DLFdBQU8sR0FBRywwQkFBMEI7QUFFcEMsa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSxrQkFBa0IsQ0FBQyxVQUF3QjtBQUV2QyxVQUFNLGlCQUFpQixNQUFNLFlBQVk7QUFFekMsZUFBVyxZQUFZLGdCQUFnQjtBQUVuQyxvQkFBYyxnQkFBZ0IsZUFBZSxRQUFRLENBQUM7QUFBQSxJQUMxRDtBQUFBLEVBQ0o7QUFBQSxFQUVBLGlCQUFpQixDQUFDLGFBQW9DO0FBRWxELGFBQVMsR0FBRywwQkFBMEI7QUFDdEMsYUFBUyxHQUFHLGFBQWE7QUFBQSxFQUM3QjtBQUFBLEVBRUEsb0JBQW9CLENBQ2hCLE9BQ0EsY0FDTztBQUVQLFVBQU0sWUFBWSxrQkFBa0I7QUFBQSxFQUN4QztBQUFBLEVBRUEsc0JBQXNCLENBQUMsVUFBd0I7QUFFM0MsVUFBTSxZQUFZLGtCQUFrQjtBQUFBLEVBQ3hDO0FBQUEsRUFFQSw0QkFBNEIsQ0FBQyxhQUFpSjtBQUUxSyxVQUFNLGNBQXNDLENBQUE7QUFDNUMsVUFBTSxVQUFrQyxDQUFBO0FBQ3hDLFFBQUk7QUFFSixRQUFJLENBQUMsVUFBVTtBQUVYLGFBQU87QUFBQSxRQUNIO0FBQUEsUUFDQTtBQUFBLFFBQ0EsT0FBTztBQUFBLE1BQUE7QUFBQSxJQUVmO0FBRUEsYUFBUyxJQUFJLEdBQUcsSUFBSSxTQUFTLFFBQVEsS0FBSztBQUV0QyxlQUFTLFNBQVMsQ0FBQztBQUVuQixVQUFJLENBQUMsT0FBTyxhQUFhO0FBRXJCLGdCQUFRLEtBQUssTUFBTTtBQUFBLE1BQ3ZCLE9BQ0s7QUFDRCxvQkFBWSxLQUFLLE1BQU07QUFBQSxNQUMzQjtBQUFBLElBQ0o7QUFFQSxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxNQUNBLE9BQU8sU0FBUztBQUFBLElBQUE7QUFBQSxFQUV4QjtBQUFBLEVBRUEsWUFBWSxDQUNSLE9BQ0EsYUFDTztBQUVQLFVBQU0sVUFBVSxTQUFTO0FBRXpCLFFBQUksU0FBaUMsV0FBVztBQUFBLE1BQzVDO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsSUFBQTtBQUdiLFFBQUksUUFBUTtBQUVSLFVBQUksT0FBTyxPQUFPLFNBQVMsSUFBSTtBQUUzQixjQUFNLElBQUksTUFBTSxrQ0FBa0M7QUFBQSxNQUN0RDtBQUVBLGFBQU8sV0FBVztBQUNsQixlQUFTLEdBQUcsZUFBZSxPQUFPLEdBQUcsZUFBZTtBQUVwRDtBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsT0FDSztBQUNELFlBQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLElBQzdDO0FBRUEsWUFBUSxVQUFVO0FBQ2xCLGtCQUFjLGNBQWMsUUFBUTtBQUFBLEVBQ3hDO0FBQUEsRUFFQSxlQUFlLENBQ1gsT0FDQSxhQUNPO0FBRVAsVUFBTSxVQUFVLFNBQVM7QUFFekIsUUFBSSxTQUFpQyxXQUFXO0FBQUEsTUFDNUM7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxJQUFBO0FBR2IsUUFBSSxRQUFRO0FBRVIsVUFBSSxPQUFPLE9BQU8sU0FBUyxJQUFJO0FBRTNCLGNBQU0sSUFBSSxNQUFNLGtDQUFrQztBQUFBLE1BQ3REO0FBRUEsYUFBTyxXQUFXO0FBQ2xCLGVBQVMsR0FBRyxlQUFlLE9BQU8sR0FBRyxlQUFlO0FBRXBEO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixPQUNLO0FBQ0QsWUFBTSxJQUFJLE1BQU0seUJBQXlCO0FBQUEsSUFDN0M7QUFHQSxrQkFBYyxjQUFjLFFBQVE7QUFBQSxFQUN4QztBQUNKO0FDMW5DQSxNQUFNLGdCQUFnQixDQUNsQixVQUNBLFNBQ087QWhEYlg7QWdEb0JJLE1BQUksQ0FBQyxVQUFVO0FBQ1g7QUFBQSxFQUNKO0FBRUEsV0FBUyxHQUFHLGFBQWE7QUFFekI7QUFBQSxJQUNJLFNBQVM7QUFBQSxJQUNUO0FBQUEsRUFBQTtBQUdKO0FBQUEsS0FDSSxjQUFTLFNBQVQsbUJBQWU7QUFBQSxJQUNmO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSx1QkFBdUIsQ0FDekIsVUFDQSxTQUNPO0FBTVAsTUFBSSxDQUFDLFVBQVU7QUFDWDtBQUFBLEVBQ0o7QUFFQSxhQUFXLFVBQVUscUNBQVUsU0FBUztBQUVwQztBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFFQTtBQUFBLElBQ0ksU0FBUztBQUFBLElBQ1Q7QUFBQSxFQUFBO0FBRVI7QUFFQSxNQUFNLDRCQUE0QixDQUM5QixjQUNBLFNBQ087QUFFUCxNQUFJLEVBQUMsNkNBQWMsU0FBUTtBQUN2QjtBQUFBLEVBQ0o7QUFFQTtBQUFBLElBQ0ksYUFBYSxPQUFPO0FBQUEsSUFDcEI7QUFBQSxFQUFBO0FBR0o7QUFBQSxJQUNJLGFBQWEsT0FBTztBQUFBLElBQ3BCO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxrQkFBa0I7QUFBQSxFQUVwQixlQUFlLENBQ1gsT0FDQSxhQUNpQjtBQUVqQixRQUFJLENBQUMsU0FDRSxDQUFDLFVBQ047QUFDRSxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sY0FBYyxNQUFNLFlBQVksbUJBQW1CO0FBQ3pELGtCQUFjLHFCQUFxQixLQUFLO0FBRXhDLFFBQUksZ0JBQWdCLE1BQU07QUFFdEIsYUFBTyxXQUFXLFdBQVcsS0FBSztBQUFBLElBQ3RDO0FBRUEsZUFBVyxTQUFTLEtBQUs7QUFDekIsa0JBQWMsaUJBQWlCLEtBQUs7QUFDcEMsVUFBTSxXQUFXLFNBQVMsR0FBRyw0QkFBNEI7QUFDekQsVUFBTSxZQUFZLEdBQUcsa0JBQWtCO0FBQ3ZDLGFBQVMsR0FBRywwQkFBMEI7QUFFdEM7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLGFBQWEsQ0FDVCxPQUNBLGFBQ2lCO0FBRWpCLFFBQUksQ0FBQyxTQUNFLENBQUMsVUFDTjtBQUNFLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxjQUFjLE1BQU0sWUFBWSxtQkFBbUI7QUFDekQsa0JBQWMscUJBQXFCLEtBQUs7QUFFeEMsUUFBSSxnQkFBZ0IsTUFBTTtBQUV0QixhQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsSUFDdEM7QUFFQSxlQUFXLFNBQVMsS0FBSztBQUN6QixrQkFBYyxpQkFBaUIsS0FBSztBQUNwQyxhQUFTLEdBQUcsMEJBQTBCO0FBQ3RDLFVBQU0sWUFBWSxHQUFHLGtCQUFrQjtBQUV2QztBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsZ0JBQWdCLENBQ1osT0FDQSxZQUNpQjtBQUVqQixRQUFJLENBQUMsU0FDRSxFQUFDLG1DQUFTLG1CQUNWLEVBQUMsbUNBQVMsU0FDZjtBQUNFLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxjQUFjLE1BQU0sWUFBWSxtQkFBbUI7QUFDekQsa0JBQWMscUJBQXFCLEtBQUs7QUFFeEMsUUFBSSxnQkFBZ0IsTUFBTTtBQUV0QixhQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsSUFDdEM7QUFFQSxlQUFXLFNBQVMsS0FBSztBQUV6QixXQUFPLGlCQUFpQjtBQUFBLE1BQ3BCO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsSUFBQTtBQUFBLEVBRWhCO0FBQUEsRUFFQSxxQkFBcUIsQ0FDakIsT0FDQSxZQUNpQjtBQUVqQixRQUFJLENBQUMsT0FBTztBQUVSLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxZQUFZLFFBQVE7QUFFMUIsa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixRQUFJLFdBQVc7QUFFWCxpQkFBVyxTQUFTLEtBQUs7QUFFekIsVUFBSSxDQUFDLFVBQVUsR0FBRyxtQkFBbUI7QUFFakMsa0JBQVUsR0FBRyxvQkFBb0I7QUFFakMsZUFBTyxpQkFBaUI7QUFBQSxVQUNwQjtBQUFBLFVBQ0E7QUFBQSxRQUFBO0FBQUEsTUFFUjtBQUVBLGdCQUFVLEdBQUcsb0JBQW9CO0FBQUEsSUFDckM7QUFFQSxXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFDSjtBQ3BOQSxNQUFxQixnQkFBNEM7QUFBQSxFQUU3RCxZQUNJLGdCQUNBLFFBQ0EsU0FDRjtBQU9LO0FBQ0E7QUFDQTtBQVBILFNBQUssaUJBQWlCO0FBQ3RCLFNBQUssU0FBUztBQUNkLFNBQUssVUFBVTtBQUFBLEVBQ25CO0FBS0o7QUNYQSxNQUFNLHlCQUF5QixDQUMzQixVQUNBLFVBQ087QWxEWlg7QWtEY0ksTUFBSSw0QkFBNEI7QUFDaEMsTUFBSSw0QkFBNEI7QUFDaEMsUUFBTSxjQUFjLE1BQU07QUFFMUIsTUFBSSxjQUFjLEdBQUc7QUFFakIsVUFBTSxXQUFnQixNQUFNLGNBQWMsQ0FBQztBQUUzQyxVQUFJLDBDQUFVLE9BQVYsbUJBQWMsaUJBQWdCLE1BQU07QUFFcEMsa0NBQTRCO0FBQUEsSUFDaEM7QUFFQSxVQUFJLDBDQUFVLE9BQVYsbUJBQWMsb0JBQW1CLE1BQU07QUFFdkMsa0NBQTRCO0FBQUEsSUFDaEM7QUFBQSxFQUNKO0FBRUEsUUFBTSxnQkFBZ0IsY0FBYyxpQkFBaUIsU0FBUyxFQUFFO0FBQ2hFLFFBQU0sVUFBcUYsYUFBYSxVQUFVLFFBQVE7QUFFMUgsTUFBSSxrQkFBa0Isd0JBQXdCO0FBRTFDLFlBQVEsSUFBSSxhQUFhLGFBQWEsSUFBSTtBQUFBLEVBQzlDO0FBRUEsTUFBSSxVQUFVO0FBRWQsTUFBSSxTQUFTLFNBQVM7QUFFbEIsUUFBSSxTQUFTLFNBQVM7QUFFbEIsaUJBQVcsYUFBYSxTQUFTLFNBQVM7QUFFdEMsa0JBQVUsR0FBRyxPQUFPLFVBQVUsU0FBUztBQUFBLE1BQzNDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxNQUFJLDhCQUE4QixNQUFNO0FBRXBDLGNBQVUsR0FBRyxPQUFPO0FBQUEsRUFDeEI7QUFFQSxNQUFJLDhCQUE4QixNQUFNO0FBRXBDLGNBQVUsR0FBRyxPQUFPO0FBQUEsRUFDeEI7QUFFQSxRQUFNLE9BRUY7QUFBQSxJQUFFO0FBQUEsSUFDRTtBQUFBLE1BQ0ksSUFBSSxHQUFHLGFBQWE7QUFBQSxNQUNwQixPQUFPLEdBQUcsT0FBTztBQUFBLElBQUE7QUFBQSxJQUVyQjtBQUFBLE1BQ0k7QUFBQSxRQUFFO0FBQUEsUUFDRTtBQUFBLFVBQ0ksT0FBTztBQUFBLFVBQ1AsbUJBQW1CLFNBQVM7QUFBQSxRQUFBO0FBQUEsUUFFaEM7QUFBQSxNQUFBO0FBQUEsTUFHSixRQUFRO0FBQUEsSUFBQTtBQUFBLEVBQ1o7QUFHUixNQUFJLFFBQVEscUJBQXFCLE1BQU07QUFFbkMsVUFBTSxVQUFVO0FBRWhCLFFBQUksQ0FBQyxRQUFRLElBQUk7QUFFYixjQUFRLEtBQUssQ0FBQTtBQUFBLElBQ2pCO0FBRUEsWUFBUSxHQUFHLGNBQWM7QUFBQSxFQUM3QjtBQUVBLE1BQUksUUFBUSxtQkFBbUIsTUFBTTtBQUVqQyxVQUFNLFVBQVU7QUFFaEIsUUFBSSxDQUFDLFFBQVEsSUFBSTtBQUViLGNBQVEsS0FBSyxDQUFBO0FBQUEsSUFDakI7QUFFQSxZQUFRLEdBQUcsaUJBQWlCO0FBQUEsRUFDaEM7QUFFQSxRQUFNLEtBQUssSUFBSTtBQUNuQjtBQUVBLE1BQU0sWUFBWSxDQUFDLGFBQTBDO0FBRXpELFFBQU0sUUFBb0IsQ0FBQTtBQUUxQjtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLGdCQUFjO0FBQUEsSUFDVixTQUFTO0FBQUEsSUFDVDtBQUFBLEVBQUE7QUFHSixTQUFPO0FBQ1g7QUFFQSxNQUFNLFdBQVc7QUFBQSxFQUViLFdBQVcsQ0FDUCxXQUNlO0FsRHBJdkI7QWtEc0lRLFFBQUksQ0FBQyxVQUNFLEdBQUMsWUFBTyxRQUFQLG1CQUFZLE9BQ2xCO0FBQ0UsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLE9BQU87QUFBQSxNQUFFO0FBQUEsTUFBTyxFQUFFLE9BQU8sZ0JBQUE7QUFBQSxNQUUzQixXQUFVLFlBQU8sUUFBUCxtQkFBWSxJQUFJO0FBQUEsSUFBQTtBQUc5QixXQUFPO0FBQUEsRUFDWDtBQUNKO0FDdklBLE1BQU0sK0JBQStCLENBQUMsY0FBMkM7QUFFN0UsTUFBSSxDQUFDLFVBQVUsR0FBRyxtQkFBbUI7QUFFakMsV0FBTyxDQUFBO0FBQUEsRUFDWDtBQUVBLFFBQU0sT0FBbUIsQ0FBQTtBQUV6QixnQkFBYztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFNBQU87QUFDWDtBQUVBLE1BQU0sNkJBQTZCLENBQy9CLFFBQ0EsY0FDZTtBQUVmLE1BQUksQ0FBQyxhQUNFLENBQUMsVUFBVSxhQUFhO0FBRTNCLFdBQU87QUFBQSxFQUNYO0FBRUEsUUFBTSxPQUVGLEVBQUUsT0FBTyxFQUFFLE9BQU8seUJBQXlCO0FBQUEsSUFDdkMsRUFBRSxPQUFPLEVBQUUsT0FBTywwQkFBMEI7QUFBQSxNQUN4QztBQUFBLFFBQUU7QUFBQSxRQUNFO0FBQUEsVUFDSSxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsWUFDVCxnQkFBZ0I7QUFBQSxZQUNoQixDQUFDLFdBQWdCO0FBQ2IscUJBQU8sSUFBSTtBQUFBLGdCQUNQO0FBQUEsZ0JBQ0E7QUFBQSxnQkFDQTtBQUFBLGNBQUE7QUFBQSxZQUVSO0FBQUEsVUFBQTtBQUFBLFFBQ0o7QUFBQSxRQUVKO0FBQUEsVUFDSSxFQUFFLFFBQVEsRUFBRSxPQUFPLDhDQUFBLEdBQWlELFVBQVUsTUFBTTtBQUFBLFVBQ3BGLEVBQUUsUUFBUSxFQUFFLE9BQU8sMkNBQUEsR0FBOEMsR0FBRztBQUFBLFFBQUE7QUFBQSxNQUN4RTtBQUFBLElBQ0osQ0FDSDtBQUFBLElBRUQsNkJBQTZCLFNBQVM7QUFBQSxFQUFBLENBQ3pDO0FBRUwsU0FBTztBQUNYO0FBRUEsTUFBTSw4QkFBOEIsQ0FDaEMsUUFDQSxjQUNlO0FBRWYsTUFBSSxDQUFDLGFBQ0UsQ0FBQyxVQUFVLGFBQWE7QUFFM0IsV0FBTztBQUFBLEVBQ1g7QUFFQSxRQUFNLE9BRUYsRUFBRSxPQUFPLEVBQUUsT0FBTyx5Q0FBeUM7QUFBQSxJQUN2RCxFQUFFLE9BQU8sRUFBRSxPQUFPLDBCQUEwQjtBQUFBLE1BQ3hDO0FBQUEsUUFBRTtBQUFBLFFBQ0U7QUFBQSxVQUNJLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxZQUNULGdCQUFnQjtBQUFBLFlBQ2hCLENBQUMsV0FBZ0I7QUFDYixxQkFBTyxJQUFJO0FBQUEsZ0JBQ1A7QUFBQSxnQkFDQTtBQUFBLGdCQUNBO0FBQUEsY0FBQTtBQUFBLFlBRVI7QUFBQSxVQUFBO0FBQUEsUUFDSjtBQUFBLFFBRUo7QUFBQSxVQUNJLEVBQUUsUUFBUSxFQUFDLE9BQU8seUJBQUEsR0FBMkIsVUFBVSxNQUFNO0FBQUEsUUFBQTtBQUFBLE1BQ2pFO0FBQUEsSUFDSixDQUNIO0FBQUEsRUFBQSxDQUNKO0FBRUwsU0FBTztBQUNYO0FBRUEsTUFBTSxxQkFBcUIsQ0FDdkIsUUFDQSxjQUNlO0FBRWYsTUFBSSxDQUFDLGFBQ0UsQ0FBQyxVQUFVLGFBQWE7QUFFM0IsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFJLFVBQVUsR0FBRyxzQkFBc0IsTUFBTTtBQUV6QyxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUVBLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sMEJBQTBCLENBQzVCLFFBQ0EsV0FDZTtBbkQxSW5CO0FtRDRJSSxNQUFJLENBQUMsVUFDRSxPQUFPLGdCQUFnQixNQUFNO0FBRWhDLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxjQUFjO0FBRWxCLE9BQUksWUFBTyxRQUFQLG1CQUFZLE1BQU07QUFFbEIsa0JBQWMsR0FBRyxXQUFXO0FBQUEsRUFDaEM7QUFFQSxRQUFNLE9BRUY7QUFBQSxJQUFFO0FBQUEsSUFBTyxFQUFFLE9BQU8sbUJBQUE7QUFBQSxJQUNkO0FBQUEsTUFDSTtBQUFBLFFBQUU7QUFBQSxRQUNFO0FBQUEsVUFDSSxPQUFPLEdBQUcsV0FBVztBQUFBLFVBQ3JCLGFBQWE7QUFBQSxZQUNULGdCQUFnQjtBQUFBLFlBQ2hCLENBQUMsV0FBZ0I7QUFDYixxQkFBTyxJQUFJO0FBQUEsZ0JBQ1A7QUFBQSxnQkFDQTtBQUFBLGdCQUNBO0FBQUEsY0FBQTtBQUFBLFlBRVI7QUFBQSxVQUFBO0FBQUEsUUFDSjtBQUFBLFFBRUo7QUFBQSxVQUNJLFNBQVMsVUFBVSxNQUFNO0FBQUEsVUFFekIsRUFBRSxRQUFRLEVBQUMsT0FBTyxvQkFBQSxHQUFzQixPQUFPLE1BQU07QUFBQSxRQUFBO0FBQUEsTUFDekQ7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUdSLFNBQU87QUFDWDtBQUVBLE1BQU0sMkJBQTJCLENBQzdCLFVBQ0EsWUFDK0M7QUFFL0MsUUFBTSxjQUEwQixDQUFBO0FBQ2hDLE1BQUk7QUFFSixhQUFXLFVBQVUsU0FBUztBQUUxQixnQkFBWTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFFBQUksV0FBVztBQUVYLGtCQUFZLEtBQUssU0FBUztBQUFBLElBQzlCO0FBQUEsRUFDSjtBQUVBLE1BQUksaUJBQWlCO0FBRXJCLE1BQUksU0FBUyxVQUFVO0FBRW5CLHFCQUFpQixHQUFHLGNBQWM7QUFBQSxFQUN0QztBQUVBLFFBQU0sT0FFRjtBQUFBLElBQUU7QUFBQSxJQUNFO0FBQUEsTUFDSSxPQUFPLEdBQUcsY0FBYztBQUFBLE1BQ3hCLFVBQVU7QUFBQSxNQUNWLFFBQVE7QUFBQSxRQUNKLGdCQUFnQjtBQUFBLFFBQ2hCLENBQUMsV0FBZ0I7QUFBQSxNQUFBO0FBQUEsSUFDckI7QUFBQSxJQUdKO0FBQUEsRUFBQTtBQUdSLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQSxhQUFhO0FBQUEsRUFBQTtBQUVyQjtBQUVBLE1BQU0sOEJBQThCLENBQ2hDLFVBQ0EsU0FDQSxtQkFDQSxVQUNPO0FBRVAsUUFBTSxjQUFjO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLE1BQUksQ0FBQyxhQUFhO0FBQ2Q7QUFBQSxFQUNKO0FBRUEsTUFBSSxVQUFVO0FBRWQsTUFBSSxTQUFTLFNBQVM7QUFFbEIsUUFBSSxTQUFTLFNBQVM7QUFFbEIsaUJBQVcsYUFBYSxTQUFTLFNBQVM7QUFFdEMsa0JBQVUsR0FBRyxPQUFPLFVBQVUsU0FBUztBQUFBLE1BQzNDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxRQUFNO0FBQUEsSUFFRjtBQUFBLE1BQUU7QUFBQSxNQUNFO0FBQUEsUUFDSSxJQUFJLEdBQUcsaUJBQWlCO0FBQUEsUUFDeEIsT0FBTyxHQUFHLE9BQU87QUFBQSxNQUFBO0FBQUEsTUFFckI7QUFBQSxRQUNJLFlBQVk7QUFBQSxNQUFBO0FBQUEsSUFDaEI7QUFBQSxFQUNKO0FBRVI7QUFFQSxNQUFNLDRCQUE0QixDQUFDLGFBQXFDO0FuRG5SeEU7QW1EcVJJLE1BQUksY0FBYztBQUVsQixPQUFJLG9CQUFTLGFBQVQsbUJBQW1CLFFBQW5CLG1CQUF3QixNQUFNO0FBRTlCLGtCQUFjLEdBQUcsV0FBVztBQUFBLEVBQ2hDO0FBRUEsUUFBTSxPQUVGO0FBQUEsSUFBRTtBQUFBLElBQ0U7QUFBQSxNQUNJLE9BQU8sR0FBRyxXQUFXO0FBQUEsTUFDckIsYUFBYTtBQUFBLFFBQ1QsZ0JBQWdCO0FBQUEsUUFDaEIsQ0FBQyxXQUFnQjtBQUFBLE1BQUE7QUFBQSxJQUNyQjtBQUFBLElBRUo7QUFBQSxNQUNJLFNBQVMsVUFBVSxTQUFTLFFBQVE7QUFBQSxNQUVwQyxFQUFFLFFBQVEsRUFBRSxPQUFPLDJCQUEyQixJQUFHLGNBQVMsYUFBVCxtQkFBbUIsTUFBTSxFQUFFO0FBQUEsSUFBQTtBQUFBLEVBQ2hGO0FBR1IsU0FBTztBQUNYO0FBRUEsTUFBTSwrQkFBK0IsQ0FDakMsVUFDQSxtQkFDQSxVQUNPO0FBRVAsUUFBTSxhQUFhLDBCQUEwQixRQUFRO0FBRXJELE1BQUksVUFBVTtBQUVkLE1BQUksU0FBUyxTQUFTO0FBRWxCLFFBQUksU0FBUyxTQUFTO0FBRWxCLGlCQUFXLGFBQWEsU0FBUyxTQUFTO0FBRXRDLGtCQUFVLEdBQUcsT0FBTyxVQUFVLFNBQVM7QUFBQSxNQUMzQztBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsUUFBTSxPQUVGO0FBQUEsSUFBRTtBQUFBLElBQ0U7QUFBQSxNQUNJLElBQUksR0FBRyxpQkFBaUI7QUFBQSxNQUN4QixPQUFPLEdBQUcsT0FBTztBQUFBLElBQUE7QUFBQSxJQUVyQjtBQUFBLE1BQ0k7QUFBQSxJQUFBO0FBQUEsRUFDSjtBQUdSLFFBQU0sVUFBVTtBQUVoQixNQUFJLENBQUMsUUFBUSxJQUFJO0FBRWIsWUFBUSxLQUFLLENBQUE7QUFBQSxFQUNqQjtBQUVBLFVBQVEsR0FBRyxjQUFjO0FBQ3pCLFFBQU0sS0FBSyxJQUFJO0FBQ25CO0FBRUEsTUFBTSx1QkFBdUIsQ0FDekIsVUFDQSxnQkFDZTtBQUVmLE1BQUksWUFBWSxXQUFXLEdBQUc7QUFFMUIsV0FBTztBQUFBLEVBQ1g7QUFFQSxRQUFNLG1CQUErQixDQUFBO0FBQ3JDLE1BQUk7QUFFSixhQUFXLGFBQWEsYUFBYTtBQUVqQyxvQkFBZ0I7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixRQUFJLGVBQWU7QUFFZix1QkFBaUIsS0FBSyxhQUFhO0FBQUEsSUFDdkM7QUFBQSxFQUNKO0FBRUEsTUFBSSxpQkFBaUIsV0FBVyxHQUFHO0FBRS9CLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxxQkFBcUI7QUFFekIsTUFBSSxTQUFTLFVBQVU7QUFFbkIseUJBQXFCLEdBQUcsa0JBQWtCO0FBQUEsRUFDOUM7QUFFQSxRQUFNLE9BRUY7QUFBQSxJQUFFO0FBQUEsSUFDRTtBQUFBLE1BQ0ksT0FBTyxHQUFHLGtCQUFrQjtBQUFBLE1BQzVCLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUE7QUFBQSxJQU9kO0FBQUEsRUFBQTtBQUdSLFNBQU87QUFDWDtBQUVBLE1BQU0sMEJBQTBCLENBQzVCLFVBQ0EsYUFDQSxtQkFDQSxVQUNPO0FBRVAsUUFBTSxrQkFBa0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osTUFBSSxDQUFDLGlCQUFpQjtBQUNsQjtBQUFBLEVBQ0o7QUFFQSxNQUFJLFVBQVU7QUFFZCxNQUFJLFNBQVMsU0FBUztBQUVsQixRQUFJLFNBQVMsU0FBUztBQUVsQixpQkFBVyxhQUFhLFNBQVMsU0FBUztBQUV0QyxrQkFBVSxHQUFHLE9BQU8sVUFBVSxTQUFTO0FBQUEsTUFDM0M7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLFFBQU0sT0FFRjtBQUFBLElBQUU7QUFBQSxJQUNFO0FBQUEsTUFDSSxJQUFJLEdBQUcsaUJBQWlCO0FBQUEsTUFDeEIsT0FBTyxHQUFHLE9BQU87QUFBQSxJQUFBO0FBQUEsSUFFckI7QUFBQSxNQUNJO0FBQUEsSUFBQTtBQUFBLEVBQ0o7QUFHUixRQUFNLFVBQVU7QUFFaEIsTUFBSSxDQUFDLFFBQVEsSUFBSTtBQUViLFlBQVEsS0FBSyxDQUFBO0FBQUEsRUFDakI7QUFFQSxVQUFRLEdBQUcsaUJBQWlCO0FBQzVCLFFBQU0sS0FBSyxJQUFJO0FBQ25CO0FBRUEsTUFBTSxtQkFBbUIsQ0FDckIsVUFDQSxZQUMrQztBQUUvQyxNQUFJLFFBQVEsV0FBVyxHQUFHO0FBRXRCLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxRQUFRLFdBQVcsS0FDaEIsUUFBUSxDQUFDLEVBQUUsV0FBVyxJQUMzQjtBQUNFLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxTQUFTLFlBQ04sQ0FBQyxTQUFTLEdBQUcseUJBQXlCO0FBRXpDLFVBQU0sT0FBTywwQkFBMEIsUUFBUTtBQUUvQyxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0EsYUFBYTtBQUFBLElBQUE7QUFBQSxFQUVyQjtBQUVBLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sc0JBQXNCLENBQ3hCLFVBQ0EsU0FDQSxtQkFDQSxVQUNPO0FBRVAsTUFBSSxRQUFRLFdBQVcsR0FBRztBQUN0QjtBQUFBLEVBQ0o7QUFFQSxNQUFJLFFBQVEsV0FBVyxLQUNoQixRQUFRLENBQUMsRUFBRSxXQUFXLElBQzNCO0FBQ0U7QUFBQSxFQUNKO0FBRUEsTUFBSSxTQUFTLFlBQ04sQ0FBQyxTQUFTLEdBQUcseUJBQXlCO0FBRXpDO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKO0FBQUEsRUFDSjtBQUVBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUdBLE1BQU0sZUFBZTtBQUFBLEVBRWpCLFdBQVcsQ0FBQyxhQUF5RztBQUVqSCxRQUFJLENBQUMsU0FBUyxXQUNQLFNBQVMsUUFBUSxXQUFXLEtBQzVCLENBQUNBLFdBQUUsbUJBQW1CLFNBQVMsSUFBSSxHQUN4QztBQUNFLGFBQU87QUFBQSxRQUNILE9BQU8sQ0FBQTtBQUFBLFFBQ1Asa0JBQWtCO0FBQUEsUUFDbEIsZ0JBQWdCO0FBQUEsTUFBQTtBQUFBLElBRXhCO0FBRUEsUUFBSSxTQUFTLFFBQVEsV0FBVyxLQUN6QixTQUFTLFFBQVEsQ0FBQyxFQUFFLFdBQVcsSUFDcEM7QUFDRSxhQUFPO0FBQUEsUUFDSCxPQUFPLENBQUE7QUFBQSxRQUNQLGtCQUFrQjtBQUFBLFFBQ2xCLGdCQUFnQjtBQUFBLE1BQUE7QUFBQSxJQUV4QjtBQUVBLFVBQU0sd0JBQXdCLGNBQWMsMkJBQTJCLFNBQVMsT0FBTztBQUN2RixRQUFJLGlCQUFpQjtBQUVyQixVQUFNLFFBQW9CO0FBQUEsTUFFdEI7QUFBQSxRQUNJO0FBQUEsUUFDQSxzQkFBc0I7QUFBQSxNQUFBO0FBQUEsSUFDMUI7QUFHSixRQUFJLE1BQU0sU0FBUyxHQUFHO0FBRWxCLHVCQUFpQjtBQUFBLElBQ3JCO0FBRUEsVUFBTSxxQkFBcUI7QUFBQSxNQUN2QjtBQUFBLE1BQ0Esc0JBQXNCO0FBQUEsSUFBQTtBQUcxQixRQUFJLG9CQUFvQjtBQUVwQixZQUFNLEtBQUssbUJBQW1CLElBQUk7QUFBQSxJQUN0QztBQUVBLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQSxtQkFBa0IseURBQW9CLGdCQUFlO0FBQUEsTUFDckQ7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsWUFBWSxDQUNSLFVBQ0EsVUFDTztBQUVQLFFBQUksQ0FBQyxTQUFTLFdBQ1AsU0FBUyxRQUFRLFdBQVcsS0FDNUIsQ0FBQ0EsV0FBRSxtQkFBbUIsU0FBUyxJQUFJLEdBQ3hDO0FBQ0U7QUFBQSxJQUNKO0FBRUEsUUFBSSxTQUFTLFFBQVEsV0FBVyxLQUN6QixTQUFTLFFBQVEsQ0FBQyxFQUFFLFdBQVcsSUFDcEM7QUFDRTtBQUFBLElBQ0o7QUFFQSxVQUFNLG9CQUFvQixjQUFjLHFCQUFxQixTQUFTLEVBQUU7QUFDeEUsVUFBTSx3QkFBd0IsY0FBYywyQkFBMkIsU0FBUyxPQUFPO0FBRXZGO0FBQUEsTUFDSTtBQUFBLE1BQ0Esc0JBQXNCO0FBQUEsTUFDdEI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKO0FBQUEsTUFDSTtBQUFBLE1BQ0Esc0JBQXNCO0FBQUEsTUFDdEI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ25tQkEsTUFBTSwwQkFBMEIsQ0FDNUIsVUFDQSxVQUNPO0FwRFpYO0FvRGNJLE1BQUksNEJBQTRCO0FBQ2hDLE1BQUksNEJBQTRCO0FBQ2hDLFFBQU0sY0FBYyxNQUFNO0FBRTFCLE1BQUksY0FBYyxHQUFHO0FBRWpCLFVBQU0sV0FBZ0IsTUFBTSxjQUFjLENBQUM7QUFFM0MsVUFBSSwwQ0FBVSxPQUFWLG1CQUFjLGlCQUFnQixNQUFNO0FBRXBDLGtDQUE0QjtBQUFBLElBQ2hDO0FBRUEsVUFBSSwwQ0FBVSxPQUFWLG1CQUFjLG9CQUFtQixNQUFNO0FBRXZDLGtDQUE0QjtBQUFBLElBQ2hDO0FBQUEsRUFDSjtBQUVBLFFBQU0sZ0JBQWdCLGNBQWMsaUJBQWlCLFNBQVMsRUFBRTtBQUNoRSxRQUFNLFVBQXFGLGFBQWEsVUFBVSxRQUFRO0FBRTFILE1BQUksa0JBQWtCLHdCQUF3QjtBQUUxQyxZQUFRLElBQUksYUFBYSxhQUFhLElBQUk7QUFBQSxFQUM5QztBQUVBLE1BQUksVUFBVTtBQUVkLE1BQUksU0FBUyxTQUFTO0FBRWxCLFFBQUksU0FBUyxTQUFTO0FBRWxCLGlCQUFXLGFBQWEsU0FBUyxTQUFTO0FBRXRDLGtCQUFVLEdBQUcsT0FBTyxVQUFVLFNBQVM7QUFBQSxNQUMzQztBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsTUFBSSw4QkFBOEIsTUFBTTtBQUVwQyxjQUFVLEdBQUcsT0FBTztBQUFBLEVBQ3hCO0FBRUEsTUFBSSw4QkFBOEIsTUFBTTtBQUVwQyxjQUFVLEdBQUcsT0FBTztBQUFBLEVBQ3hCO0FBRUEsUUFBTSxPQUVGO0FBQUEsSUFBRTtBQUFBLElBQ0U7QUFBQSxNQUNJLElBQUksR0FBRyxhQUFhO0FBQUEsTUFDcEIsT0FBTyxHQUFHLE9BQU87QUFBQSxJQUFBO0FBQUEsSUFFckI7QUFBQSxNQUNJO0FBQUEsUUFBRTtBQUFBLFFBQ0U7QUFBQSxVQUNJLE9BQU87QUFBQSxVQUNQLG1CQUFtQixTQUFTO0FBQUEsUUFBQTtBQUFBLFFBRWhDO0FBQUEsTUFBQTtBQUFBLE1BR0osUUFBUTtBQUFBLElBQUE7QUFBQSxFQUNaO0FBR1IsTUFBSSxRQUFRLHFCQUFxQixNQUFNO0FBRW5DLFVBQU0sVUFBVTtBQUVoQixRQUFJLENBQUMsUUFBUSxJQUFJO0FBRWIsY0FBUSxLQUFLLENBQUE7QUFBQSxJQUNqQjtBQUVBLFlBQVEsR0FBRyxjQUFjO0FBQUEsRUFDN0I7QUFFQSxNQUFJLFFBQVEsbUJBQW1CLE1BQU07QUFFakMsVUFBTSxVQUFVO0FBRWhCLFFBQUksQ0FBQyxRQUFRLElBQUk7QUFFYixjQUFRLEtBQUssQ0FBQTtBQUFBLElBQ2pCO0FBRUEsWUFBUSxHQUFHLGlCQUFpQjtBQUFBLEVBQ2hDO0FBRUEsUUFBTSxLQUFLLElBQUk7QUFDbkI7QUFtQ0EsTUFBTSxZQUFZO0FBQUEsRUFFZCxXQUFXLENBQ1AsVUFDQSxVQUNPO0FwRHJKZjtBb0R1SlEsUUFBSSxDQUFDLFlBQ0UsU0FBUyxHQUFHLGVBQWUsTUFDaEM7QUFDRTtBQUFBLElBQ0o7QUFFQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLGNBQVU7QUFBQSxPQUNOLGNBQVMsU0FBVCxtQkFBZTtBQUFBLE1BQ2Y7QUFBQSxJQUFBO0FBUUosa0JBQWM7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNUO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ3ZLQSxNQUFNLHNCQUFzQixDQUN4QixVQUNBLFVBQ087QXJEYlg7QXFEZUksTUFBSUEsV0FBRSxtQkFBbUIsU0FBUyxLQUFLLE1BQU0sTUFBTTtBQUMvQztBQUFBLEVBQ0o7QUFFQSxNQUFJLDRCQUE0QjtBQUNoQyxNQUFJLDRCQUE0QjtBQUNoQyxRQUFNLGNBQWMsTUFBTTtBQUUxQixNQUFJLGNBQWMsR0FBRztBQUVqQixVQUFNLFdBQWdCLE1BQU0sY0FBYyxDQUFDO0FBRTNDLFVBQUksMENBQVUsT0FBVixtQkFBYyxpQkFBZ0IsTUFBTTtBQUVwQyxrQ0FBNEI7QUFBQSxJQUNoQztBQUVBLFVBQUksMENBQVUsT0FBVixtQkFBYyxvQkFBbUIsTUFBTTtBQUV2QyxrQ0FBNEI7QUFBQSxJQUNoQztBQUFBLEVBQ0o7QUFFQSxRQUFNLG9CQUFvQixjQUFjLHFCQUFxQixTQUFTLEVBQUU7QUFFeEUsTUFBSSxVQUFVO0FBRWQsTUFBSSxTQUFTLFNBQVM7QUFFbEIsUUFBSSxTQUFTLFNBQVM7QUFFbEIsaUJBQVcsYUFBYSxTQUFTLFNBQVM7QUFFdEMsa0JBQVUsR0FBRyxPQUFPLFVBQVUsU0FBUztBQUFBLE1BQzNDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxNQUFJLDhCQUE4QixNQUFNO0FBRXBDLGNBQVUsR0FBRyxPQUFPO0FBQUEsRUFDeEI7QUFFQSxNQUFJLDhCQUE4QixNQUFNO0FBRXBDLGNBQVUsR0FBRyxPQUFPO0FBQUEsRUFDeEI7QUFFQSxRQUFNO0FBQUEsSUFFRjtBQUFBLE1BQUU7QUFBQSxNQUNFO0FBQUEsUUFDSSxJQUFJLEdBQUcsaUJBQWlCO0FBQUEsUUFDeEIsT0FBTyxHQUFHLE9BQU87QUFBQSxNQUFBO0FBQUEsTUFFckI7QUFBQSxRQUNJO0FBQUEsVUFBRTtBQUFBLFVBQ0U7QUFBQSxZQUNJLE9BQU87QUFBQSxZQUNQLG1CQUFtQixTQUFTO0FBQUEsVUFBQTtBQUFBLFVBRWhDO0FBQUEsUUFBQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVSO0FBRUEsTUFBTSxnQkFBZ0I7QUFBQSxFQUVsQixXQUFXLENBQ1AsVUFDQSxVQUNPO0FyRHhGZjtBcUQwRlEsUUFBSSxDQUFDLFlBQ0UsU0FBUyxHQUFHLGVBQWUsTUFDaEM7QUFDRTtBQUFBLElBQ0o7QUFFQTtBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLGNBQVU7QUFBQSxPQUNOLGNBQVMsU0FBVCxtQkFBZTtBQUFBLE1BQ2Y7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixrQkFBYztBQUFBLE1BQ1YsU0FBUztBQUFBLE1BQ1Q7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDMUdBLE1BQU0sYUFBYTtBQUFBLEVBRWYsa0JBQWtCLENBQUMsVUFBeUI7QXREWmhEO0FzRGNRLFVBQU0sYUFBeUIsQ0FBQTtBQUUvQixrQkFBYztBQUFBLE9BQ1YsV0FBTSxZQUFZLGlCQUFsQixtQkFBZ0M7QUFBQSxNQUNoQztBQUFBLElBQUE7QUFLSixVQUFNLE9BRUY7QUFBQSxNQUFFO0FBQUEsTUFDRTtBQUFBLFFBQ0ksSUFBSTtBQUFBLE1BQUE7QUFBQSxNQUdSO0FBQUEsSUFBQTtBQUdSLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUMzQkEsTUFBTSxXQUFXO0FBQUEsRUFFYixXQUFXLENBQUMsVUFBeUI7QUFFakMsVUFBTSxPQUVGO0FBQUEsTUFBRTtBQUFBLE1BQ0U7QUFBQSxRQUNJLFNBQVMsWUFBWTtBQUFBLFFBQ3JCLElBQUk7QUFBQSxNQUFBO0FBQUEsTUFFUjtBQUFBLFFBQ0ksV0FBVyxpQkFBaUIsS0FBSztBQUFBLE1BQUE7QUFBQSxJQUNyQztBQUdSLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUN2QkEsTUFBcUIsU0FBOEI7QUFBQSxFQUFuRDtBQUVXLCtCQUFjO0FBQ2QsNkJBQVk7QUFHWjtBQUFBLG9DQUFtQjtBQUNuQiw2Q0FBNEI7QUFDNUIsNENBQTJCO0FBQzNCLDBDQUF5QjtBQUV4QixtQ0FBbUIsT0FBZSxzQkFBc0I7QUFDekQsbUNBQW1CLE9BQWUsc0JBQXNCO0FBQ3hELDBDQUEwQixPQUFlLDZCQUE2QjtBQUV0RSxrQ0FBaUIsR0FBRyxLQUFLLE9BQU87QUFDaEMsa0NBQWlCLEdBQUcsS0FBSyxPQUFPO0FBQ2hDLG1DQUFrQixHQUFHLEtBQUssT0FBTztBQUFBO0FBQzVDO0FDcEJPLElBQUssd0NBQUFVLHlCQUFMO0FBRUhBLHVCQUFBLFNBQUEsSUFBVTtBQUNWQSx1QkFBQSxXQUFBLElBQVk7QUFDWkEsdUJBQUEsVUFBQSxJQUFXO0FBSkgsU0FBQUE7QUFBQSxHQUFBLHVCQUFBLENBQUEsQ0FBQTtBQ0laLE1BQXFCLFFBQTRCO0FBQUEsRUFBakQ7QUFFVyx3Q0FBbUMsQ0FBQTtBQUNuQyxxQ0FBaUMsb0JBQW9CO0FBQ3JELHdDQUF1QjtBQUFBO0FBQ2xDO0FDUEEsTUFBcUIsS0FBc0I7QUFBQSxFQUEzQztBQUVXLCtCQUFjO0FBQ2QsNkJBQVk7QUFDWixxQ0FBcUI7QUFDckIsc0NBQXNCO0FBQ3RCLCtCQUFlO0FBQ2YscUNBQW9CO0FBQ3BCLG9DQUFvQjtBQUNwQixnQ0FBZTtBQUNmLCtCQUFjO0FBQUE7QUFDekI7QUNUQSxNQUFxQixlQUF5QztBQUFBLEVBQTlEO0FBRVcsNkNBQXdDLENBQUE7QUFDeEMsa0RBQTZDLENBQUE7QUFDN0MsOENBQXFDLENBQUE7QUFBQTtBQUNoRDtBQ1BBLE1BQXFCLGNBQXdDO0FBQUEsRUFBN0Q7QUFFVywrQkFBZTtBQUNmLDJDQUEyQjtBQUFBO0FBQ3RDO0FDRUEsTUFBcUIsWUFBb0M7QUFBQSxFQUF6RDtBQUVXLHNDQUFzQjtBQUN0Qix1Q0FBdUI7QUFDdkIsb0NBQWlDLENBQUE7QUFDakMsd0NBQXFDO0FBQ3JDLG9DQUFnQixDQUFBO0FBQ2hCLHVDQUFtQixDQUFBO0FBQ25CLDBDQUF5QztBQUV6QywyQ0FBMEM7QUFHMUM7QUFBQSxpREFBNkIsQ0FBQTtBQUM3QixtREFBK0IsQ0FBQTtBQUUvQiw4QkFBcUIsSUFBSSxjQUFBO0FBQUE7QUFDcEM7QUNiQSxNQUFxQixNQUF3QjtBQUFBLEVBRXpDLGNBQWM7QUFNUCxtQ0FBbUI7QUFDbkIsaUNBQWlCO0FBQ2pCLHdDQUF3QjtBQUN4QixtQ0FBa0I7QUFDbEI7QUFDQSxnQ0FBYyxJQUFJLEtBQUE7QUFFbEIsdUNBQTRCLElBQUksWUFBQTtBQUVoQyx5Q0FBZ0MsSUFBSSxlQUFBO0FBRXBDLHVDQUF3QixJQUFJQyxRQUFBO0FBZi9CLFVBQU0sV0FBc0IsSUFBSSxTQUFBO0FBQ2hDLFNBQUssV0FBVztBQUFBLEVBQ3BCO0FBY0o7QUNuQkEsTUFBTSxrQkFBa0IsQ0FDcEIsT0FDQSxtQkFDQSxpQkFDNkI7QUFFN0IsTUFBSVgsV0FBRSxtQkFBbUIsaUJBQWlCLE1BQU0sTUFBTTtBQUNsRDtBQUFBLEVBQ0o7QUFFQSxRQUFNLFNBQWlCQSxXQUFFLGFBQUE7QUFFekIsTUFBSSxVQUFVLGdCQUFnQjtBQUFBLElBQzFCO0FBQUEsSUFDQTtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQUE7QUFHZixRQUFNLE1BQWMsR0FBRyxpQkFBaUIsSUFBSSxlQUFlLG9CQUFvQjtBQUUvRSxRQUFNLGdCQUFnQixhQUFhO0FBQUEsSUFDL0I7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLE1BQUksa0JBQWtCLE1BQU07QUFDeEI7QUFBQSxFQUNKO0FBRUEsU0FBTyxtQkFBbUI7QUFBQSxJQUN0QjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1I7QUFBQSxJQUFBO0FBQUEsSUFFSixVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixPQUFPLENBQUNLLFFBQWUsaUJBQXNCO0FBRXpDLGNBQVEsSUFBSTtBQUFBO0FBQUEseUJBRUMsR0FBRztBQUFBLG1DQUNPLEtBQUssVUFBVSxZQUFZLENBQUM7QUFBQSwyQkFDcEMsS0FBSyxVQUFVLGFBQWEsS0FBSyxDQUFDO0FBQUEsNEJBQ2pDLGVBQWUsZ0JBQWdCLElBQUk7QUFBQSwyQkFDcEMsTUFBTTtBQUFBLGNBQ25CO0FBRUYsWUFBTTtBQUFBO0FBQUEseUJBRU8sR0FBRztBQUFBLG1DQUNPLEtBQUssVUFBVSxZQUFZLENBQUM7QUFBQSwyQkFDcEMsS0FBSyxVQUFVLGFBQWEsS0FBSyxDQUFDO0FBQUEsNEJBQ2pDLGVBQWUsZ0JBQWdCLElBQUk7QUFBQSwyQkFDcEMsTUFBTTtBQUFBLGNBQ25CO0FBRUYsYUFBTyxXQUFXLFdBQVdBLE1BQUs7QUFBQSxJQUN0QztBQUFBLEVBQUEsQ0FDSDtBQUNMO0FBRUEsTUFBTSxpQkFBaUI7QUFBQSxFQUVuQixpQkFBaUIsQ0FBQyxVQUE4QztBaEU5RXBFO0FnRWdGUSxRQUFJLENBQUMsT0FBTztBQUNSO0FBQUEsSUFDSjtBQUVBLFVBQU0sc0JBQTRCLFdBQU0sWUFBWSxpQkFBbEIsbUJBQWdDLE1BQU0sc0JBQXFCO0FBRTdGLFVBQU0sZUFBZSxDQUNqQkEsUUFDQSxvQkFDaUI7QUFFakIsYUFBT08sZ0JBQWU7QUFBQSxRQUNsQlA7QUFBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsZ0NBQWdDLENBQUMsVUFBOEM7QWhFekduRjtBZ0UyR1EsUUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLElBQ0o7QUFFQSxVQUFNLHNCQUE0QixXQUFNLFlBQVksaUJBQWxCLG1CQUFnQyxNQUFNLHNCQUFxQjtBQUU3RixVQUFNLGVBQWUsQ0FDakJBLFFBQ0Esb0JBQ2lCO0FBRWpCLGFBQU9PLGdCQUFlO0FBQUEsUUFDbEJQO0FBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFFQSxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ3hIQSxNQUFNLGtCQUFrQixNQUFjO0FBRWxDLE1BQUksQ0FBQyxPQUFPLFdBQVc7QUFFbkIsV0FBTyxZQUFZLElBQUksVUFBQTtBQUFBLEVBQzNCO0FBRUEsUUFBTSxRQUFnQixJQUFJLE1BQUE7QUFDMUIsY0FBWSxzQkFBc0IsS0FBSztBQUV2QyxTQUFPO0FBQ1g7QUFFQSxNQUFNLHFCQUFxQixDQUFDLFVBQWtDO0FqRXhCOUQ7QWlFMEJJLE1BQUksR0FBQyxXQUFNLFlBQVksaUJBQWxCLG1CQUFnQyxPQUFNO0FBRXZDLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSUwsV0FBRSxvQkFBbUIsV0FBTSxZQUFZLGlCQUFsQixtQkFBZ0MsS0FBSyxJQUFJLE1BQU0sU0FDaEUsR0FBQyxXQUFNLFlBQVksaUJBQWxCLG1CQUFnQyxLQUFLLGNBQ25DLFdBQU0sWUFBWSxpQkFBbEIsbUJBQWdDLEtBQUssUUFBUSxZQUFXLElBQ2pFO0FBQ0UsV0FBTztBQUFBLEVBQ1g7QUFFQSxTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0EsZUFBZSxnQkFBZ0IsS0FBSztBQUFBLEVBQUE7QUFFNUM7QUFFQSxNQUFNLDZCQUE2QixDQUMvQixPQUNBLGdCQUNpQjtBQUVqQixRQUFNLFlBQVksY0FBYztBQUVoQyxlQUFhO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osUUFBTSxXQUFXLE1BQU0sWUFBWTtBQUVuQyxNQUFJLFNBQVMsV0FBVyxHQUFHO0FBRXZCLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxTQUFTLFdBQVcsR0FBRztBQUV2QixVQUFNLElBQUksTUFBTSwwQkFBMEI7QUFBQSxFQUM5QztBQUVBLFFBQU0sY0FBYyxTQUFTLENBQUM7QUFFOUIsTUFBSSxDQUFDLFlBQVksTUFBTSxRQUFRO0FBRTNCLFVBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUFBLEVBQzNDO0FBRUEsUUFBTSxlQUFlLFNBQVMsQ0FBQztBQUUvQixNQUFJLENBQUMsYUFBYSxNQUFNLFVBQ2pCLGFBQWEsTUFBTSxTQUFTLFlBQVksTUFDN0M7QUFDRSxVQUFNLElBQUksTUFBTSwrREFBK0Q7QUFBQSxFQUNuRjtBQUVBLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQSxlQUFlLCtCQUErQixLQUFLO0FBQUEsRUFBQTtBQUUzRDtBQUVBLE1BQU0sWUFBWTtBQUFBLEVBRWQsWUFBWSxNQUFzQjtBQUU5QixVQUFNLFFBQWdCLGdCQUFBO0FBQ3RCLFVBQU0sY0FBc0IsT0FBTyxTQUFTO0FBRTVDLFFBQUk7QUFFQSxVQUFJLENBQUNBLFdBQUUsbUJBQW1CLFdBQVcsR0FBRztBQUVwQyxlQUFPO0FBQUEsVUFDSDtBQUFBLFVBQ0E7QUFBQSxRQUFBO0FBQUEsTUFFUjtBQUVBLGFBQU8sbUJBQW1CLEtBQUs7QUFBQSxJQUNuQyxTQUNPLEdBQVE7QUFFWCxZQUFNLGVBQWU7QUFFckIsY0FBUSxJQUFJLENBQUM7QUFFYixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFDSjtBQ2pIQSxNQUFNLGlCQUFpQjtBQUFBLEVBRW5CLHNCQUFzQixNQUFNO0FBRXhCLFVBQU0saUJBQWlDLFNBQVMsZUFBZSxRQUFRLGdCQUFnQjtBQUV2RixRQUFJLGtCQUNHLGVBQWUsY0FBQSxNQUFvQixNQUN4QztBQUNFLFVBQUk7QUFFSixlQUFTLElBQUksR0FBRyxJQUFJLGVBQWUsV0FBVyxRQUFRLEtBQUs7QUFFdkQsb0JBQVksZUFBZSxXQUFXLENBQUM7QUFFdkMsWUFBSSxVQUFVLGFBQWEsS0FBSyxjQUFjO0FBRTFDLGNBQUksQ0FBQyxPQUFPLFdBQVc7QUFFbkIsbUJBQU8sWUFBWSxJQUFJLFVBQUE7QUFBQSxVQUMzQjtBQUVBLGlCQUFPLFVBQVUsbUJBQW1CLFVBQVU7QUFDOUMsb0JBQVUsT0FBQTtBQUVWO0FBQUEsUUFDSixXQUNTLFVBQVUsYUFBYSxLQUFLLFdBQVc7QUFDNUM7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0o7QUM1QkEsV0FBVyxxQkFBQTtBQUNYLGVBQWUscUJBQUE7QUFFZCxPQUFlLHVCQUF1QixJQUFJO0FBQUEsRUFFdkMsTUFBTSxTQUFTLGVBQWUsb0JBQW9CO0FBQUEsRUFDbEQsTUFBTSxVQUFVO0FBQUEsRUFDaEIsTUFBTSxTQUFTO0FBQUEsRUFDZixlQUFlO0FBQUEsRUFDZixPQUFPLFdBQVc7QUFDdEIsQ0FBQzsifQ==
