var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
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
  constructor(name, url, actionDelegate) {
    __publicField(this, "name");
    __publicField(this, "url");
    __publicField(this, "actionDelegate");
    this.name = name;
    this.url = url;
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
  getDirectory: (filePath) => {
    var matches = filePath.match(/(.*)[\/\\]/);
    if (matches && matches.length > 0) {
      return matches[1];
    }
    return "";
  },
  countCharacter: (input, character) => {
    let length = input.length;
    let count = 0;
    for (let i = 0; i < length; i++) {
      if (input[i] === character) {
        count++;
      }
    }
    return count;
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
const gStateCode = {
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
    let newState = { ...state };
    return newState;
  },
  AddReLoadDataEffectImmediate: (state, name, url, actionDelegate) => {
    const effect = state.repeatEffects.reLoadGetHttpImmediate.find((effect2) => {
      return effect2.name === name;
    });
    if (effect) {
      return;
    }
    const httpEffect2 = new HttpEffect(
      name,
      url,
      actionDelegate
    );
    state.repeatEffects.reLoadGetHttpImmediate.push(httpEffect2);
  },
  AddRunActionImmediate: (state, actionDelegate) => {
    state.repeatEffects.runActionImmediate.push(actionDelegate);
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
      error: (_state, _errorDetails) => {
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
    options: {
      method: "GET",
      headers
    },
    response: "json",
    action: httpEffect2.actionDelegate,
    error: (_state, _errorDetails) => {
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
    if (dataDiscussion) {
      fragmentBox.innerHTML = dataDiscussion;
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
    return gStateCode.cloneState(state);
  }
};
class RenderFragmentUI {
  constructor() {
    __publicField(this, "optionExpanded", false);
    __publicField(this, "fragmentOptionsExpanded", false);
    __publicField(this, "discussionLoaded", false);
  }
}
class RenderFragment {
  constructor(id) {
    __publicField(this, "id");
    __publicField(this, "outlineFragmentID", null);
    __publicField(this, "topLevelMapKey", "");
    __publicField(this, "mapKeyChain", "");
    __publicField(this, "guideID", "");
    __publicField(this, "guidePath", "");
    __publicField(this, "parentFragmentID", null);
    __publicField(this, "value", "");
    __publicField(this, "selected", null);
    __publicField(this, "options", []);
    __publicField(this, "option", "");
    __publicField(this, "isAncillary", false);
    __publicField(this, "order", 0);
    __publicField(this, "ui", new RenderFragmentUI());
    this.id = id;
  }
}
const gFileConstants = {
  fragmentsFolderSuffix: "_frags",
  fragmentFileExtension: ".html",
  guideOutlineFilename: "outline.tsoln",
  guideRenderCommentTag: "tsGuideRenderComment ",
  fragmentRenderCommentTag: "tsFragmentRenderComment "
};
const parseAndLoadFragment = (state, rawFragment, outlineFragmentID) => {
  if (!rawFragment) {
    return null;
  }
  const index_chainFragments_outlineFragmentID = state.renderState.index_chainFragments_outlineFragmentID;
  let fragment = index_chainFragments_outlineFragmentID[outlineFragmentID];
  let cache = false;
  if (!fragment) {
    fragment = new RenderFragment(rawFragment.id);
    cache = true;
  }
  fragment.outlineFragmentID = outlineFragmentID;
  index_chainFragments_outlineFragmentID[outlineFragmentID] = fragment;
  gFragmentCode.loadFragment(
    state,
    rawFragment,
    fragment
  );
  if (cache === true) {
    gFragmentCode.indexChainFragment(
      state,
      fragment
    );
  }
  return fragment;
};
const loadOption = (state, rawOption, outlineFragment) => {
  const option = new RenderFragment(rawOption.id);
  option.option = rawOption.option ?? "";
  option.isAncillary = rawOption.isAncillary ?? false;
  option.order = rawOption.order ?? 0;
  if (outlineFragment) {
    for (const outlineOption of outlineFragment.o) {
      if (outlineOption.f === option.id) {
        option.outlineFragmentID = outlineOption.i;
        state.renderState.index_outlineFragments_outlineFragmentID[outlineOption.i] = outlineOption;
        break;
      }
    }
  }
  gFragmentCode.indexChainFragment(
    state,
    option
  );
  return option;
};
const gFragmentCode = {
  getFragmentElementID: (fragmentID) => {
    return `nt_fr_frag_${fragmentID}`;
  },
  getChainFragment: (state, outlineFragmentID) => {
    const fragment = state.renderState.index_chainFragments_outlineFragmentID[outlineFragmentID];
    return fragment ?? null;
  },
  loadFragmentFromChainFragments: (state, fragment) => {
    const outlineFragmentID = fragment.outlineFragmentID;
    if (gUtilities.isNullOrWhiteSpace(outlineFragmentID) === true) {
      return;
    }
    const cachedfragment = state.renderState.index_chainFragments_outlineFragmentID[outlineFragmentID];
    fragment.topLevelMapKey = cachedfragment.topLevelMapKey;
    fragment.mapKeyChain = cachedfragment.mapKeyChain;
    fragment.guideID = cachedfragment.guideID;
    fragment.guidePath = cachedfragment.guidePath;
    fragment.parentFragmentID = cachedfragment.parentFragmentID;
    fragment.value = cachedfragment.value;
    fragment.ui.discussionLoaded = true;
    fragment.option = cachedfragment.option;
    fragment.isAncillary = cachedfragment.isAncillary;
    fragment.order = cachedfragment.order;
    let option;
    if (cachedfragment.options && Array.isArray(cachedfragment.options)) {
      for (const fragmentOption of cachedfragment.options) {
        option = new RenderFragment(fragmentOption.id);
        option.option = cachedfragment.option;
        option.isAncillary = cachedfragment.isAncillary;
        option.order = cachedfragment.order;
        fragment.options.push(option);
      }
    }
  },
  indexChainFragment: (state, fragment) => {
    const outlineFragmentID = fragment.outlineFragmentID;
    if (gUtilities.isNullOrWhiteSpace(outlineFragmentID) === true) {
      return;
    }
    const index_chainFragments_outlineFragmentID = state.renderState.index_chainFragments_outlineFragmentID;
    if (index_chainFragments_outlineFragmentID[outlineFragmentID]) {
      return;
    }
    index_chainFragments_outlineFragmentID[outlineFragmentID] = fragment;
  },
  parseAndLoadFragment: (state, response, outlineFragmentID) => {
    const rawFragment = gFragmentCode.parseFragment(response);
    return parseAndLoadFragment(
      state,
      rawFragment,
      outlineFragmentID
    );
  },
  setRootOutlineFragmentID: (state) => {
    var _a;
    const root = state.renderState.root;
    if (!root) {
      return;
    }
    const outlineRoot = (_a = state.renderState.outline) == null ? void 0 : _a.r;
    if (!outlineRoot) {
      return;
    }
    if (root.id === outlineRoot.f) {
      root.outlineFragmentID = outlineRoot.i;
      state.renderState.index_chainFragments_outlineFragmentID[root.outlineFragmentID] = root;
      state.renderState.currentFragment = root;
    }
    for (const option of root.options) {
      for (const outlineOption of outlineRoot.o) {
        if (outlineOption.f === option.id) {
          option.outlineFragmentID = outlineOption.i;
          state.renderState.index_chainFragments_outlineFragmentID[option.outlineFragmentID] = option;
          break;
        }
      }
    }
  },
  parseAndLoadRootFragment: (state, rawFragment) => {
    if (!rawFragment) {
      return;
    }
    const fragment = new RenderFragment(rawFragment.id);
    gFragmentCode.loadFragment(
      state,
      rawFragment,
      fragment
    );
    state.renderState.root = fragment;
    gFragmentCode.setRootOutlineFragmentID(state);
  },
  loadFragment: (state, rawFragment, fragment) => {
    fragment.topLevelMapKey = rawFragment.topLevelMapKey ?? "";
    fragment.mapKeyChain = rawFragment.mapKeyChain ?? "";
    fragment.guideID = rawFragment.guideID ?? "";
    fragment.guidePath = rawFragment.guidePath ?? "";
    fragment.parentFragmentID = rawFragment.parentFragmentID ?? "";
    fragment.value = rawFragment.value ?? "";
    fragment.value = fragment.value.trim();
    fragment.ui.discussionLoaded = true;
    let outlineFragment = null;
    if (!gUtilities.isNullOrWhiteSpace(fragment.outlineFragmentID)) {
      outlineFragment = state.renderState.index_outlineFragments_outlineFragmentID[fragment.outlineFragmentID];
    }
    let option;
    if (rawFragment.options && Array.isArray(rawFragment.options)) {
      for (const rawOption of rawFragment.options) {
        option = loadOption(
          state,
          rawOption,
          outlineFragment
        );
        fragment.options.push(option);
      }
    }
  },
  cloneFragment: (fragment) => {
    const clone = new RenderFragment(fragment.id);
    clone.topLevelMapKey = fragment.topLevelMapKey;
    clone.mapKeyChain = fragment.mapKeyChain;
    clone.guideID = fragment.guideID;
    clone.guidePath = fragment.guidePath;
    clone.parentFragmentID = fragment.parentFragmentID;
    clone.value = fragment.value;
    clone.ui.discussionLoaded = true;
    clone.option = fragment.option;
    clone.isAncillary = fragment.isAncillary;
    clone.order = fragment.order;
    let cloneOption;
    if (fragment.options && Array.isArray(fragment.options)) {
      for (const fragmentOption of fragment.options) {
        cloneOption = new RenderFragment(fragmentOption.id);
        cloneOption.option = fragmentOption.option;
        cloneOption.isAncillary = fragmentOption.isAncillary;
        cloneOption.order = fragmentOption.order;
        clone.options.push(cloneOption);
      }
    }
    return clone;
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
  showOptionNode: (fragment, option) => {
    gFragmentCode.collapseFragmentsOptions(fragment);
    option.ui.fragmentOptionsExpanded = false;
    fragment.selected = option;
  },
  resetFragmentUis: (state) => {
    console.log("resetFragmentUis called");
    const chainFragments = state.renderState.index_chainFragments_outlineFragmentID;
    for (const propName in chainFragments) {
      gFragmentCode.resetFragmentUi(chainFragments[propName]);
    }
    const index_chainFragments_outlineFragmentID = state.renderState.index_chainFragments_outlineFragmentID;
    let fragment;
    for (const fragmentID in index_chainFragments_outlineFragmentID) {
      fragment = index_chainFragments_outlineFragmentID[fragmentID];
      if (fragment.ui.fragmentOptionsExpanded === true) {
        throw new Error("Not all options were collapsed");
      }
    }
  },
  resetFragmentUi: (fragment) => {
    fragment.ui.fragmentOptionsExpanded = false;
  },
  setCurrent: (state, parent, fragment) => {
    parent.selected = fragment;
    state.renderState.currentFragment = fragment;
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
const gHistoryCode = {
  resetRaw: () => {
    window.TreeSolve.screen.autofocus = true;
    window.TreeSolve.screen.isAutofocusFirstRun = true;
  },
  pushBrowserHistoryState: (state) => {
    if (!state.renderState.currentFragment) {
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
    const current = state.renderState.currentFragment;
    if (gUtilities.isNullOrWhiteSpace(current.outlineFragmentID) === true) {
      return;
    }
    const url = `${location2.origin}${location2.pathname}?${current.outlineFragmentID}`;
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
  // getRootStep: (
  //     state: IState,
  //     rootID: string): IHttpFetchItem | undefined => {
  //     if (!state) {
  //         return;
  //     }
  //     return getStep(
  //         state,
  //         rootID,
  //         '0',
  //         ActionType.GetRoot,
  //         gStepActions.loadRootStep
  //     );
  // },
  getFragment: (state, option, fragmentPath) => {
    const loadAction = (state2, response) => {
      return gFragmentActions.loadFragment(
        state2,
        response,
        option
      );
    };
    return getFragment(
      state,
      option.id,
      fragmentPath,
      ActionType.GetFragment,
      loadAction
    );
  },
  getChainFragment: (state, fragmentID, fragmentPath, outlineFragmentID) => {
    const loadAction = (state2, response) => {
      return gFragmentActions.loadChainFragment(
        state2,
        response,
        outlineFragmentID
      );
    };
    return getFragment(
      state,
      fragmentID,
      fragmentPath,
      ActionType.GetChainFragment,
      loadAction
    );
  }
  // getAncillary: (
  //     state: IState,
  //     stepID: string,
  //     parentChainID: string,
  //     uiID: number): IHttpFetchItem | undefined => {
  //     const loadAction: (state: IState, response: any) => IStateAnyArray = (state: IState, response: any) => {
  //         const chainResponse = {
  //             response,
  //             parentChainID,
  //             uiID
  //         };
  //         return gStepActions.loadAncillary(
  //             state,
  //             chainResponse
  //         );
  //     };
  //     return getStep(
  //         state,
  //         stepID,
  //         parentChainID,
  //         ActionType.GetStep,
  //         loadAction
  //     );
  // },
  // getAncillaryStep: (
  //     state: IState,
  //     stepID: string,
  //     parentChainID: string,
  //     uiID: number): IHttpFetchItem | undefined => {
  //     const loadAction: (state: IState, response: any) => IStateAnyArray = (state: IState, response: any) => {
  //         const chainResponse = {
  //             response,
  //             parentChainID,
  //             uiID
  //         };
  //         return gStepActions.loadAncillaryChainStep(
  //             state,
  //             chainResponse
  //         );
  //     };
  //     return getStep(
  //         state,
  //         stepID,
  //         parentChainID,
  //         ActionType.GetStep,
  //         loadAction
  //     );
  // }
};
const gFragmentActions = {
  showOptionNode: (state, parentFragment, option) => {
    var _a;
    if (!option) {
      return state;
    }
    gFragmentCode.markOptionsExpanded(
      state,
      option
    );
    gFragmentCode.setCurrent(
      state,
      parentFragment,
      option
    );
    gHistoryCode.pushBrowserHistoryState(state);
    if (option.ui.discussionLoaded === true) {
      return gStateCode.cloneState(state);
    }
    state.loading = true;
    window.TreeSolve.screen.hideBanner = true;
    const fragmentPath = `${(_a = state.renderState.guide) == null ? void 0 : _a.fragmentFolderUrl}/${option.id}${gFileConstants.fragmentFileExtension}`;
    return [
      state,
      gFragmentEffects.getFragment(
        state,
        option,
        fragmentPath
      )
    ];
  },
  loadFragment: (state, response, option) => {
    if (!state || gUtilities.isNullOrWhiteSpace(option.outlineFragmentID)) {
      return state;
    }
    gFragmentCode.parseAndLoadFragment(
      state,
      response.textData,
      option.outlineFragmentID
    );
    state.loading = false;
    return gStateCode.cloneState(state);
  },
  loadChainFragment: (state, response, outlineFragmentID) => {
    if (!state || !state.renderState.currentFragment) {
      return state;
    }
    state.loading = false;
    gFragmentCode.parseAndLoadFragment(
      state,
      response.textData,
      outlineFragmentID
    );
    const loadingChainCache_OutlineFragments = state.renderState.loadingChainCache_OutlineFragments;
    if (loadingChainCache_OutlineFragments) {
      const nextOutlineFragment = loadingChainCache_OutlineFragments.at(-1) ?? null;
      if (nextOutlineFragment) {
        const parentFragment = state.renderState.currentFragment;
        const expandedOption = state.renderState.index_chainFragments_outlineFragmentID[nextOutlineFragment.i];
        expandedOption.ui.fragmentOptionsExpanded = true;
        gFragmentCode.showOptionNode(
          parentFragment,
          expandedOption
        );
        gFragmentCode.setCurrent(
          state,
          state.renderState.currentFragment,
          expandedOption
        );
      }
    }
    return gStateCode.cloneState(state);
  }
};
const fragmentActions = {
  expandOptions: (state, fragment) => {
    if (!state || !fragment) {
      return state;
    }
    state.renderState.ui.raw = false;
    gFragmentCode.resetFragmentUis(state);
    const expanded = fragment.ui.fragmentOptionsExpanded !== true;
    state.renderState.ui.optionsExpanded = expanded;
    fragment.ui.fragmentOptionsExpanded = expanded;
    return gStateCode.cloneState(state);
  },
  hideOptions: (state, fragment) => {
    if (!state || !fragment) {
      return state;
    }
    state.renderState.ui.raw = false;
    gFragmentCode.resetFragmentUis(state);
    fragment.ui.fragmentOptionsExpanded = false;
    state.renderState.ui.optionsExpanded = false;
    return gStateCode.cloneState(state);
  },
  showOptionNode: (state, payload) => {
    if (!state || !(payload == null ? void 0 : payload.parentFragment) || !(payload == null ? void 0 : payload.option)) {
      return state;
    }
    state.renderState.ui.raw = false;
    return gFragmentActions.showOptionNode(
      state,
      payload.parentFragment,
      payload.option
    );
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
const buildExpandedOptionsView = (fragment) => {
  const optionViews = [];
  let optionVew;
  for (const option of fragment.options) {
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
    [
      optionViews
    ]
  );
  return view;
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
const buildOptionsView = (fragment) => {
  if (!fragment.options || fragment.options.length === 0) {
    return null;
  }
  if (fragment.selected && !fragment.ui.fragmentOptionsExpanded) {
    return buildCollapsedOptionsView(fragment);
  }
  return buildExpandedOptionsView(fragment);
};
const buildFragmentView = (fragment) => {
  if (!fragment) {
    return [];
  }
  const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);
  const view = [
    h(
      "div",
      {
        id: `${fragmentELementID}`,
        class: "nt-fr-fragment-box"
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
        buildOptionsView(fragment)
      ]
    ),
    buildFragmentView(fragment.selected)
  ];
  return view;
};
const fragmentViews = {
  buildContentView: (state) => {
    const view = h("div", { id: "nt_fr_Fragments" }, [
      buildFragmentView(state.renderState.root)
    ]);
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
        fragmentViews.buildContentView(state)
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
    __publicField(this, "guide", null);
    __publicField(this, "root", null);
    __publicField(this, "currentFragment", null);
    __publicField(this, "outline", null);
    __publicField(this, "loadingChainCache_OutlineFragments", null);
    // Search indices
    __publicField(this, "index_outlineFragments_outlineFragmentID", {});
    __publicField(this, "index_chainFragments_outlineFragmentID", {});
    __publicField(this, "index_rawFragments_fragmentID", {});
    __publicField(this, "ui", new RenderStateUI());
  }
}
class State {
  constructor() {
    __publicField(this, "showMenu", false);
    __publicField(this, "showSolutionsMenu", false);
    __publicField(this, "twitterUrl", "https://twitter.com/netoftrees");
    __publicField(this, "linkedinUrl", "https://www.linkedin.com/company/netoftrees/about");
    __publicField(this, "loading", true);
    __publicField(this, "debug", true);
    __publicField(this, "genericError", false);
    __publicField(this, "nextKey", 0);
    __publicField(this, "settings");
    __publicField(this, "user", new User());
    __publicField(this, "renderState", new RenderState());
    __publicField(this, "repeatEffects", new RepeateEffects());
    __publicField(this, "stepHistory", new History());
    const settings = new Settings();
    this.settings = settings;
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
class RenderOutlineFragment {
  constructor() {
    __publicField(this, "i", "");
    // id
    __publicField(this, "f", "");
    // fragment id
    __publicField(this, "c", "");
    // chart id from outline chart array
    __publicField(this, "o", []);
    // options
    __publicField(this, "parent", null);
  }
}
class RenderOutline {
  constructor() {
    __publicField(this, "v", "");
    __publicField(this, "r", new RenderOutlineFragment());
    __publicField(this, "c", []);
  }
}
class RenderOutlineChart {
  constructor() {
    __publicField(this, "i", "");
    __publicField(this, "p", "");
  }
}
const loadFragment = (state, rawFragment, parent = null) => {
  const fragment = new RenderOutlineFragment();
  fragment.i = rawFragment.i;
  fragment.f = rawFragment.f;
  fragment.parent = parent;
  state.renderState.index_outlineFragments_outlineFragmentID[fragment.i] = fragment;
  if (rawFragment.o && Array.isArray(rawFragment.o) === true && rawFragment.o.length > 0) {
    let o;
    for (const option of rawFragment.o) {
      o = loadFragment(
        state,
        option,
        fragment
      );
      fragment.o.push(o);
    }
  }
  return fragment;
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
  getOutlineFragment: (state, fragmentID) => {
    const fragment = state.renderState.index_outlineFragments_outlineFragmentID[fragmentID];
    return fragment ?? null;
  },
  getOutlineFragmentChain: (state, fragmentID) => {
    const fragmentIDs = [];
    let fragment;
    while (fragmentID) {
      fragment = gOutlineCode.getOutlineFragment(
        state,
        fragmentID
      );
      if (!fragment) {
        break;
      }
      fragmentID = fragment.i;
      fragmentIDs.push(fragmentID);
    }
    return fragmentIDs;
  },
  loadOutline: (state, outlineResponse) => {
    const rawOutline = outlineResponse.jsonData;
    const outline = new RenderOutline();
    outline.v = rawOutline.v;
    if (rawOutline.c && Array.isArray(rawOutline.c) === true && rawOutline.c.length > 0) {
      loadCharts(
        outline,
        rawOutline.c
      );
    }
    outline.v = rawOutline.v;
    outline.r = loadFragment(
      state,
      rawOutline.r
    );
    state.renderState.outline = outline;
    gFragmentCode.setRootOutlineFragmentID(state);
  }
};
const gOutlineActions = {
  loadOutline: (state, outlineResponse) => {
    gOutlineCode.loadOutline(
      state,
      outlineResponse
    );
    return gStateCode.cloneState(state);
  },
  loadOutlineAndRequestFragments: (state, outlineResponse, lastOutlineFragmentID) => {
    var _a;
    const fragmentFolderUrl = (_a = state.renderState.guide) == null ? void 0 : _a.fragmentFolderUrl;
    if (gUtilities.isNullOrWhiteSpace(fragmentFolderUrl) === true) {
      return state;
    }
    gOutlineCode.loadOutline(
      state,
      outlineResponse
    );
    let chainOutlineFragments = [];
    let outlineFragment = gOutlineCode.getOutlineFragment(
      state,
      lastOutlineFragmentID
    );
    while (outlineFragment) {
      chainOutlineFragments.push(outlineFragment);
      outlineFragment = outlineFragment.parent;
    }
    chainOutlineFragments.pop();
    state.renderState.loadingChainCache_OutlineFragments = chainOutlineFragments;
    const index_chainFragments_outlineFragmentID = state.renderState.index_chainFragments_outlineFragmentID;
    const fragmentLoadEffects = [];
    let fragment;
    let fragmentPath;
    let loadFragmentEffect;
    for (let i = chainOutlineFragments.length - 1; i >= 0; i--) {
      outlineFragment = chainOutlineFragments[i];
      fragment = index_chainFragments_outlineFragmentID[outlineFragment.f];
      if (fragment && fragment.ui.discussionLoaded === true) {
        continue;
      }
      fragmentPath = `${fragmentFolderUrl}/${outlineFragment.f}${gFileConstants.fragmentFileExtension}`;
      loadFragmentEffect = gFragmentEffects.getChainFragment(
        state,
        outlineFragment.f,
        fragmentPath,
        outlineFragment.i
      );
      if (loadFragmentEffect) {
        fragmentLoadEffects.push(loadFragmentEffect);
      }
    }
    return [
      state,
      fragmentLoadEffects
    ];
  }
};
const getGuideOutline = (state, loadDelegate) => {
  var _a;
  if (!((_a = state.renderState.guide) == null ? void 0 : _a.path)) {
    return;
  }
  const callID = gUtilities.generateGuid();
  let headers = gAjaxHeaderCode.buildHeaders(
    state,
    callID,
    ActionType.GetOutline
  );
  const fragmentFolderUrl = state.renderState.guide.fragmentFolderUrl ?? "null";
  const url = `${fragmentFolderUrl}/${gFileConstants.guideOutlineFilename}`;
  return gAuthenticatedHttp({
    url,
    options: {
      method: "GET",
      headers
    },
    response: "json",
    action: loadDelegate,
    error: (state2, errorDetails) => {
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
    if (!state) {
      return;
    }
    return getGuideOutline(
      state,
      gOutlineActions.loadOutline
    );
  },
  getGuideOutlineAndLoadFragments: (state, lastOutlineFragmentID) => {
    if (!state) {
      return;
    }
    const loadDelegate = (state2, outlineResponse) => {
      return gOutlineActions.loadOutlineAndRequestFragments(
        state2,
        outlineResponse,
        lastOutlineFragmentID
      );
    };
    return getGuideOutline(
      state,
      loadDelegate
    );
  }
};
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
const parseGuide = (rawGuide) => {
  const guide = new RenderGuide(rawGuide.id);
  guide.title = rawGuide.title ?? "";
  guide.description = rawGuide.description ?? "";
  guide.path = rawGuide.path ?? null;
  let folderPath = rawGuide.fragmentFolderPath ?? null;
  let divider = "";
  if (!gUtilities.isNullOrWhiteSpace(folderPath)) {
    if (!location.origin.endsWith("/")) {
      if (!folderPath.startsWith("/")) {
        divider = "/";
      }
    } else {
      if (folderPath.startsWIth("/") === true) {
        folderPath = folderPath.substring(1);
      }
    }
    guide.fragmentFolderUrl = `${location.origin}${divider}${folderPath}`;
  }
  return guide;
};
const parseRenderingComment = (state, raw) => {
  if (!raw) {
    return raw;
  }
  state.renderState.guide = parseGuide(raw.guide);
  gFragmentCode.parseAndLoadRootFragment(
    state,
    raw.fragment
  );
};
const gRenderCode = {
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
const initialiseState = () => {
  if (!window.TreeSolve) {
    window.TreeSolve = new TreeSolve();
  }
  const state = new State();
  gRenderCode.parseRenderingComment(state);
  return state;
};
const buildRenderDisplay = (state) => {
  if (!state.renderState.root || !state.renderState.root.options || state.renderState.root.options.length === 0) {
    return state;
  }
  return [
    state,
    gRenderEffects.getGuideOutline(state)
  ];
};
const buildRenderChainDisplay = (state, queryString) => {
  if (queryString.startsWith("?") === true) {
    queryString = queryString.substring(1);
  }
  const lastOutlineFragmentID = queryString;
  return [
    state,
    gRenderEffects.getGuideOutlineAndLoadFragments(
      state,
      lastOutlineFragmentID
    )
  ];
};
const initialiseWithoutAuthorisation = (state) => {
  const queryString = window.location.search;
  try {
    if (!gUtilities.isNullOrWhiteSpace(queryString)) {
      return buildRenderChainDisplay(
        state,
        queryString
      );
    }
    return buildRenderDisplay(state);
  } catch (e) {
    state.genericError = true;
    return state;
  }
};
const initState = {
  initialise: () => {
    const state = initialiseState();
    return initialiseWithoutAuthorisation(state);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguQmp2VE5OZkouanMiLCJzb3VyY2VzIjpbIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL3RpbWUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dIdHRwLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nVXRpbGl0aWVzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nU3RhdGVDb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvaHR0cC9nQXV0aGVudGljYXRpb25Db2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBamF4SGVhZGVyQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2FjdGlvbnMvZ1JlcGVhdEFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N1YnNjcmlwdGlvbnMvcmVwZWF0U3Vic2NyaXB0aW9uLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2luaXQvc3Vic2NyaXB0aW9ucy9pbml0U3Vic2NyaXB0aW9ucy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvY29uc3RhbnRzL0ZpbHRlcnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL2NvZGUvb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvb25SZW5kZXJGaW5pc2hlZC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdEV2ZW50cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2FjdGlvbnMvaW5pdEFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VpL1JlbmRlckZyYWdtZW50VUkudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJGcmFnbWVudC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2dGaWxlQ29uc3RhbnRzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnlVcmwudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dIaXN0b3J5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2VmZmVjdHMvZ0ZyYWdtZW50RWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2FjdGlvbnMvZ0ZyYWdtZW50QWN0aW9ucy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvYWN0aW9ucy9mcmFnbWVudEFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VpL3BheWxvYWRzL0ZyYWdtZW50UGF5bG9hZC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvdmlld3MvZnJhZ21lbnRWaWV3cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3ZpZXdzL2luaXRWaWV3LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS91c2VyL1NldHRpbmdzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL25hdmlnYXRpb25EaXJlY3Rpb24udHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2hpc3RvcnkvSGlzdG9yeS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdXNlci9Vc2VyLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9lZmZlY3RzL1JlcGVhdGVFZmZlY3RzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS91aS9SZW5kZXJTdGF0ZVVJLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9SZW5kZXJTdGF0ZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvU3RhdGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvZW51bXMvU2Nyb2xsSG9wVHlwZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvd2luZG93L1NjcmVlbi50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvd2luZG93L1RyZWVTb2x2ZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVGcmFnbWVudC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lQ2hhcnQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dPdXRsaW5lQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2FjdGlvbnMvZ091dGxpbmVBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nUmVuZGVyRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckd1aWRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nUmVuZGVyQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9yZW5kZXJDb21tZW50cy50cyIsIi4uL3Jvb3Qvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBSRUNZQ0xFRF9OT0RFID0gMVxyXG52YXIgTEFaWV9OT0RFID0gMlxyXG52YXIgVEVYVF9OT0RFID0gM1xyXG52YXIgRU1QVFlfT0JKID0ge31cclxudmFyIEVNUFRZX0FSUiA9IFtdXHJcbnZhciBtYXAgPSBFTVBUWV9BUlIubWFwXHJcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxyXG52YXIgZGVmZXIgPVxyXG4gIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09IFwidW5kZWZpbmVkXCJcclxuICAgID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgICA6IHNldFRpbWVvdXRcclxuXHJcbnZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uKG9iaikge1xyXG4gIHZhciBvdXQgPSBcIlwiXHJcblxyXG4gIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSByZXR1cm4gb2JqXHJcblxyXG4gIGlmIChpc0FycmF5KG9iaikgJiYgb2JqLmxlbmd0aCA+IDApIHtcclxuICAgIGZvciAodmFyIGsgPSAwLCB0bXA7IGsgPCBvYmoubGVuZ3RoOyBrKyspIHtcclxuICAgICAgaWYgKCh0bXAgPSBjcmVhdGVDbGFzcyhvYmpba10pKSAhPT0gXCJcIikge1xyXG4gICAgICAgIG91dCArPSAob3V0ICYmIFwiIFwiKSArIHRtcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmpba10pIHtcclxuICAgICAgICBvdXQgKz0gKG91dCAmJiBcIiBcIikgKyBrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxudmFyIG1lcmdlID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIHZhciBvdXQgPSB7fVxyXG5cclxuICBmb3IgKHZhciBrIGluIGEpIG91dFtrXSA9IGFba11cclxuICBmb3IgKHZhciBrIGluIGIpIG91dFtrXSA9IGJba11cclxuXHJcbiAgcmV0dXJuIG91dFxyXG59XHJcblxyXG52YXIgYmF0Y2ggPSBmdW5jdGlvbihsaXN0KSB7XHJcbiAgcmV0dXJuIGxpc3QucmVkdWNlKGZ1bmN0aW9uKG91dCwgaXRlbSkge1xyXG4gICAgcmV0dXJuIG91dC5jb25jYXQoXHJcbiAgICAgICFpdGVtIHx8IGl0ZW0gPT09IHRydWVcclxuICAgICAgICA/IDBcclxuICAgICAgICA6IHR5cGVvZiBpdGVtWzBdID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgICA/IFtpdGVtXVxyXG4gICAgICAgIDogYmF0Y2goaXRlbSlcclxuICAgIClcclxuICB9LCBFTVBUWV9BUlIpXHJcbn1cclxuXHJcbnZhciBpc1NhbWVBY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgcmV0dXJuIGlzQXJyYXkoYSkgJiYgaXNBcnJheShiKSAmJiBhWzBdID09PSBiWzBdICYmIHR5cGVvZiBhWzBdID09PSBcImZ1bmN0aW9uXCJcclxufVxyXG5cclxudmFyIHNob3VsZFJlc3RhcnQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgaWYgKGEgIT09IGIpIHtcclxuICAgIGZvciAodmFyIGsgaW4gbWVyZ2UoYSwgYikpIHtcclxuICAgICAgaWYgKGFba10gIT09IGJba10gJiYgIWlzU2FtZUFjdGlvbihhW2tdLCBiW2tdKSkgcmV0dXJuIHRydWVcclxuICAgICAgYltrXSA9IGFba11cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnZhciBwYXRjaFN1YnMgPSBmdW5jdGlvbihvbGRTdWJzLCBuZXdTdWJzLCBkaXNwYXRjaCkge1xyXG4gIGZvciAoXHJcbiAgICB2YXIgaSA9IDAsIG9sZFN1YiwgbmV3U3ViLCBzdWJzID0gW107XHJcbiAgICBpIDwgb2xkU3Vicy5sZW5ndGggfHwgaSA8IG5ld1N1YnMubGVuZ3RoO1xyXG4gICAgaSsrXHJcbiAgKSB7XHJcbiAgICBvbGRTdWIgPSBvbGRTdWJzW2ldXHJcbiAgICBuZXdTdWIgPSBuZXdTdWJzW2ldXHJcbiAgICBzdWJzLnB1c2goXHJcbiAgICAgIG5ld1N1YlxyXG4gICAgICAgID8gIW9sZFN1YiB8fFxyXG4gICAgICAgICAgbmV3U3ViWzBdICE9PSBvbGRTdWJbMF0gfHxcclxuICAgICAgICAgIHNob3VsZFJlc3RhcnQobmV3U3ViWzFdLCBvbGRTdWJbMV0pXHJcbiAgICAgICAgICA/IFtcclxuICAgICAgICAgICAgICBuZXdTdWJbMF0sXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzFdLFxyXG4gICAgICAgICAgICAgIG5ld1N1YlswXShkaXNwYXRjaCwgbmV3U3ViWzFdKSxcclxuICAgICAgICAgICAgICBvbGRTdWIgJiYgb2xkU3ViWzJdKClcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgOiBvbGRTdWJcclxuICAgICAgICA6IG9sZFN1YiAmJiBvbGRTdWJbMl0oKVxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4gc3Vic1xyXG59XHJcblxyXG52YXIgcGF0Y2hQcm9wZXJ0eSA9IGZ1bmN0aW9uKG5vZGUsIGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICBpZiAoa2V5ID09PSBcImtleVwiKSB7XHJcbiAgfSBlbHNlIGlmIChrZXkgPT09IFwic3R5bGVcIikge1xyXG4gICAgZm9yICh2YXIgayBpbiBtZXJnZShvbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XHJcbiAgICAgIG9sZFZhbHVlID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZVtrXSA9PSBudWxsID8gXCJcIiA6IG5ld1ZhbHVlW2tdXHJcbiAgICAgIGlmIChrWzBdID09PSBcIi1cIikge1xyXG4gICAgICAgIG5vZGVba2V5XS5zZXRQcm9wZXJ0eShrLCBvbGRWYWx1ZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2RlW2tleV1ba10gPSBvbGRWYWx1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChrZXlbMF0gPT09IFwib1wiICYmIGtleVsxXSA9PT0gXCJuXCIpIHtcclxuICAgIGlmIChcclxuICAgICAgISgobm9kZS5hY3Rpb25zIHx8IChub2RlLmFjdGlvbnMgPSB7fSkpW1xyXG4gICAgICAgIChrZXkgPSBrZXkuc2xpY2UoMikudG9Mb3dlckNhc2UoKSlcclxuICAgICAgXSA9IG5ld1ZhbHVlKVxyXG4gICAgKSB7XHJcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKVxyXG4gICAgfSBlbHNlIGlmICghb2xkVmFsdWUpIHtcclxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGtleSwgbGlzdGVuZXIpXHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICghaXNTdmcgJiYga2V5ICE9PSBcImxpc3RcIiAmJiBrZXkgaW4gbm9kZSkge1xyXG4gICAgbm9kZVtrZXldID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZSA9PSBcInVuZGVmaW5lZFwiID8gXCJcIiA6IG5ld1ZhbHVlXHJcbiAgfSBlbHNlIGlmIChcclxuICAgIG5ld1ZhbHVlID09IG51bGwgfHxcclxuICAgIG5ld1ZhbHVlID09PSBmYWxzZSB8fFxyXG4gICAgKGtleSA9PT0gXCJjbGFzc1wiICYmICEobmV3VmFsdWUgPSBjcmVhdGVDbGFzcyhuZXdWYWx1ZSkpKVxyXG4gICkge1xyXG4gICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxyXG4gIH0gZWxzZSB7XHJcbiAgICBub2RlLnNldEF0dHJpYnV0ZShrZXksIG5ld1ZhbHVlKVxyXG4gIH1cclxufVxyXG5cclxudmFyIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbih2ZG9tLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICB2YXIgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcclxuICB2YXIgcHJvcHMgPSB2ZG9tLnByb3BzXHJcbiAgdmFyIG5vZGUgPVxyXG4gICAgdmRvbS50eXBlID09PSBURVhUX05PREVcclxuICAgICAgPyBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2ZG9tLm5hbWUpXHJcbiAgICAgIDogKGlzU3ZnID0gaXNTdmcgfHwgdmRvbS5uYW1lID09PSBcInN2Z1wiKVxyXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG4gICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG5cclxuICBmb3IgKHZhciBrIGluIHByb3BzKSB7XHJcbiAgICBwYXRjaFByb3BlcnR5KG5vZGUsIGssIG51bGwsIHByb3BzW2tdLCBsaXN0ZW5lciwgaXNTdmcpXHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmRvbS5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgbm9kZS5hcHBlbmRDaGlsZChcclxuICAgICAgY3JlYXRlTm9kZShcclxuICAgICAgICAodmRvbS5jaGlsZHJlbltpXSA9IGdldFZOb2RlKHZkb20uY2hpbGRyZW5baV0pKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICByZXR1cm4gKHZkb20ubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBnZXRLZXkgPSBmdW5jdGlvbih2ZG9tKSB7XHJcbiAgcmV0dXJuIHZkb20gPT0gbnVsbCA/IG51bGwgOiB2ZG9tLmtleVxyXG59XHJcblxyXG52YXIgcGF0Y2ggPSBmdW5jdGlvbihwYXJlbnQsIG5vZGUsIG9sZFZOb2RlLCBuZXdWTm9kZSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgaWYgKG9sZFZOb2RlID09PSBuZXdWTm9kZSkge1xyXG4gIH0gZWxzZSBpZiAoXHJcbiAgICBvbGRWTm9kZSAhPSBudWxsICYmXHJcbiAgICBvbGRWTm9kZS50eXBlID09PSBURVhUX05PREUgJiZcclxuICAgIG5ld1ZOb2RlLnR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICkge1xyXG4gICAgaWYgKG9sZFZOb2RlLm5hbWUgIT09IG5ld1ZOb2RlLm5hbWUpIG5vZGUubm9kZVZhbHVlID0gbmV3Vk5vZGUubmFtZVxyXG4gIH0gZWxzZSBpZiAob2xkVk5vZGUgPT0gbnVsbCB8fCBvbGRWTm9kZS5uYW1lICE9PSBuZXdWTm9kZS5uYW1lKSB7XHJcbiAgICBub2RlID0gcGFyZW50Lmluc2VydEJlZm9yZShcclxuICAgICAgY3JlYXRlTm9kZSgobmV3Vk5vZGUgPSBnZXRWTm9kZShuZXdWTm9kZSkpLCBsaXN0ZW5lciwgaXNTdmcpLFxyXG4gICAgICBub2RlXHJcbiAgICApXHJcbiAgICBpZiAob2xkVk5vZGUgIT0gbnVsbCkge1xyXG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQob2xkVk5vZGUubm9kZSlcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIHRtcFZLaWRcclxuICAgIHZhciBvbGRWS2lkXHJcblxyXG4gICAgdmFyIG9sZEtleVxyXG4gICAgdmFyIG5ld0tleVxyXG5cclxuICAgIHZhciBvbGRWUHJvcHMgPSBvbGRWTm9kZS5wcm9wc1xyXG4gICAgdmFyIG5ld1ZQcm9wcyA9IG5ld1ZOb2RlLnByb3BzXHJcblxyXG4gICAgdmFyIG9sZFZLaWRzID0gb2xkVk5vZGUuY2hpbGRyZW5cclxuICAgIHZhciBuZXdWS2lkcyA9IG5ld1ZOb2RlLmNoaWxkcmVuXHJcblxyXG4gICAgdmFyIG9sZEhlYWQgPSAwXHJcbiAgICB2YXIgbmV3SGVhZCA9IDBcclxuICAgIHZhciBvbGRUYWlsID0gb2xkVktpZHMubGVuZ3RoIC0gMVxyXG4gICAgdmFyIG5ld1RhaWwgPSBuZXdWS2lkcy5sZW5ndGggLSAxXHJcblxyXG4gICAgaXNTdmcgPSBpc1N2ZyB8fCBuZXdWTm9kZS5uYW1lID09PSBcInN2Z1wiXHJcblxyXG4gICAgZm9yICh2YXIgaSBpbiBtZXJnZShvbGRWUHJvcHMsIG5ld1ZQcm9wcykpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChpID09PSBcInZhbHVlXCIgfHwgaSA9PT0gXCJzZWxlY3RlZFwiIHx8IGkgPT09IFwiY2hlY2tlZFwiXHJcbiAgICAgICAgICA/IG5vZGVbaV1cclxuICAgICAgICAgIDogb2xkVlByb3BzW2ldKSAhPT0gbmV3VlByb3BzW2ldXHJcbiAgICAgICkge1xyXG4gICAgICAgIHBhdGNoUHJvcGVydHkobm9kZSwgaSwgb2xkVlByb3BzW2ldLCBuZXdWUHJvcHNbaV0sIGxpc3RlbmVyLCBpc1N2ZylcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwgJiYgb2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAob2xkS2V5ID0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWRdKSkgPT0gbnVsbCB8fFxyXG4gICAgICAgIG9sZEtleSAhPT0gZ2V0S2V5KG5ld1ZLaWRzW25ld0hlYWRdKVxyXG4gICAgICApIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaChcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZEhlYWRdLm5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0sXHJcbiAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUoXHJcbiAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkKytdLFxyXG4gICAgICAgICAgb2xkVktpZHNbb2xkSGVhZCsrXVxyXG4gICAgICAgICkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsICYmIG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKG9sZEtleSA9IGdldEtleShvbGRWS2lkc1tvbGRUYWlsXSkpID09IG51bGwgfHxcclxuICAgICAgICBvbGRLZXkgIT09IGdldEtleShuZXdWS2lkc1tuZXdUYWlsXSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGF0Y2goXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRUYWlsXS5ub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLFxyXG4gICAgICAgIChuZXdWS2lkc1tuZXdUYWlsXSA9IGdldFZOb2RlKFxyXG4gICAgICAgICAgbmV3VktpZHNbbmV3VGFpbC0tXSxcclxuICAgICAgICAgIG9sZFZLaWRzW29sZFRhaWwtLV1cclxuICAgICAgICApKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9sZEhlYWQgPiBvbGRUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwpIHtcclxuICAgICAgICBub2RlLmluc2VydEJlZm9yZShcclxuICAgICAgICAgIGNyZWF0ZU5vZGUoXHJcbiAgICAgICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKG5ld1ZLaWRzW25ld0hlYWQrK10pKSxcclxuICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkXSkgJiYgb2xkVktpZC5ub2RlXHJcbiAgICAgICAgKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG5ld0hlYWQgPiBuZXdUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWRzW29sZEhlYWQrK10ubm9kZSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IG9sZEhlYWQsIGtleWVkID0ge30sIG5ld0tleWVkID0ge307IGkgPD0gb2xkVGFpbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKChvbGRLZXkgPSBvbGRWS2lkc1tpXS5rZXkpICE9IG51bGwpIHtcclxuICAgICAgICAgIGtleWVkW29sZEtleV0gPSBvbGRWS2lkc1tpXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCkge1xyXG4gICAgICAgIG9sZEtleSA9IGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWRdKSlcclxuICAgICAgICBuZXdLZXkgPSBnZXRLZXkoXHJcbiAgICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShuZXdWS2lkc1tuZXdIZWFkXSwgb2xkVktpZCkpXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICBuZXdLZXllZFtvbGRLZXldIHx8XHJcbiAgICAgICAgICAobmV3S2V5ICE9IG51bGwgJiYgbmV3S2V5ID09PSBnZXRLZXkob2xkVktpZHNbb2xkSGVhZCArIDFdKSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWQubm9kZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdLZXkgPT0gbnVsbCB8fCBvbGRWTm9kZS50eXBlID09PSBSRUNZQ0xFRF9OT0RFKSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLFxyXG4gICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgbmV3SGVhZCsrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XHJcbiAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQsXHJcbiAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBuZXdLZXllZFtuZXdLZXldID0gdHJ1ZVxyXG4gICAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICgodG1wVktpZCA9IGtleWVkW25ld0tleV0pICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZSh0bXBWS2lkLm5vZGUsIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlKSxcclxuICAgICAgICAgICAgICAgIHRtcFZLaWQsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgbmV3S2V5ZWRbbmV3S2V5XSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5ld0hlYWQrK1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICAgIGlmIChnZXRLZXkoKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkKytdKSkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBpIGluIGtleWVkKSB7XHJcbiAgICAgICAgaWYgKG5ld0tleWVkW2ldID09IG51bGwpIHtcclxuICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQoa2V5ZWRbaV0ubm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiAobmV3Vk5vZGUubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBwcm9wc0NoYW5nZWQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgZm9yICh2YXIgayBpbiBhKSBpZiAoYVtrXSAhPT0gYltrXSkgcmV0dXJuIHRydWVcclxuICBmb3IgKHZhciBrIGluIGIpIGlmIChhW2tdICE9PSBiW2tdKSByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG52YXIgZ2V0VGV4dFZOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gIHJldHVybiB0eXBlb2Ygbm9kZSA9PT0gXCJvYmplY3RcIiA/IG5vZGUgOiBjcmVhdGVUZXh0Vk5vZGUobm9kZSlcclxufVxyXG5cclxudmFyIGdldFZOb2RlID0gZnVuY3Rpb24obmV3Vk5vZGUsIG9sZFZOb2RlKSB7XHJcbiAgcmV0dXJuIG5ld1ZOb2RlLnR5cGUgPT09IExBWllfTk9ERVxyXG4gICAgPyAoKCFvbGRWTm9kZSB8fCAhb2xkVk5vZGUubGF6eSB8fCBwcm9wc0NoYW5nZWQob2xkVk5vZGUubGF6eSwgbmV3Vk5vZGUubGF6eSkpXHJcbiAgICAgICAgJiYgKChvbGRWTm9kZSA9IGdldFRleHRWTm9kZShuZXdWTm9kZS5sYXp5LnZpZXcobmV3Vk5vZGUubGF6eSkpKS5sYXp5ID1cclxuICAgICAgICAgIG5ld1ZOb2RlLmxhenkpLFxyXG4gICAgICBvbGRWTm9kZSlcclxuICAgIDogbmV3Vk5vZGVcclxufVxyXG5cclxudmFyIGNyZWF0ZVZOb2RlID0gZnVuY3Rpb24obmFtZSwgcHJvcHMsIGNoaWxkcmVuLCBub2RlLCBrZXksIHR5cGUpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogbmFtZSxcclxuICAgIHByb3BzOiBwcm9wcyxcclxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgIG5vZGU6IG5vZGUsXHJcbiAgICB0eXBlOiB0eXBlLFxyXG4gICAga2V5OiBrZXlcclxuICB9XHJcbn1cclxuXHJcbnZhciBjcmVhdGVUZXh0Vk5vZGUgPSBmdW5jdGlvbih2YWx1ZSwgbm9kZSkge1xyXG4gIHJldHVybiBjcmVhdGVWTm9kZSh2YWx1ZSwgRU1QVFlfT0JKLCBFTVBUWV9BUlIsIG5vZGUsIHVuZGVmaW5lZCwgVEVYVF9OT0RFKVxyXG59XHJcblxyXG52YXIgcmVjeWNsZU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICAgPyBjcmVhdGVUZXh0Vk5vZGUobm9kZS5ub2RlVmFsdWUsIG5vZGUpXHJcbiAgICA6IGNyZWF0ZVZOb2RlKFxyXG4gICAgICAgIG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBFTVBUWV9PQkosXHJcbiAgICAgICAgbWFwLmNhbGwobm9kZS5jaGlsZE5vZGVzLCByZWN5Y2xlTm9kZSksXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICB1bmRlZmluZWQsXHJcbiAgICAgICAgUkVDWUNMRURfTk9ERVxyXG4gICAgICApXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgTGF6eSA9IGZ1bmN0aW9uKHByb3BzKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGxhenk6IHByb3BzLFxyXG4gICAgdHlwZTogTEFaWV9OT0RFXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIGggPSBmdW5jdGlvbihuYW1lLCBwcm9wcykge1xyXG4gIGZvciAodmFyIHZkb20sIHJlc3QgPSBbXSwgY2hpbGRyZW4gPSBbXSwgaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkge1xyXG4gICAgcmVzdC5wdXNoKGFyZ3VtZW50c1tpXSlcclxuICB9XHJcblxyXG4gIHdoaWxlIChyZXN0Lmxlbmd0aCA+IDApIHtcclxuICAgIGlmIChpc0FycmF5KCh2ZG9tID0gcmVzdC5wb3AoKSkpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSB2ZG9tLmxlbmd0aDsgaS0tID4gMDsgKSB7XHJcbiAgICAgICAgcmVzdC5wdXNoKHZkb21baV0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodmRvbSA9PT0gZmFsc2UgfHwgdmRvbSA9PT0gdHJ1ZSB8fCB2ZG9tID09IG51bGwpIHtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goZ2V0VGV4dFZOb2RlKHZkb20pKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvcHMgPSBwcm9wcyB8fCBFTVBUWV9PQkpcclxuXHJcbiAgcmV0dXJuIHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCJcclxuICAgID8gbmFtZShwcm9wcywgY2hpbGRyZW4pXHJcbiAgICA6IGNyZWF0ZVZOb2RlKG5hbWUsIHByb3BzLCBjaGlsZHJlbiwgdW5kZWZpbmVkLCBwcm9wcy5rZXkpXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgYXBwID0gZnVuY3Rpb24ocHJvcHMpIHtcclxuICB2YXIgc3RhdGUgPSB7fVxyXG4gIHZhciBsb2NrID0gZmFsc2VcclxuICB2YXIgdmlldyA9IHByb3BzLnZpZXdcclxuICB2YXIgbm9kZSA9IHByb3BzLm5vZGVcclxuICB2YXIgdmRvbSA9IG5vZGUgJiYgcmVjeWNsZU5vZGUobm9kZSlcclxuICB2YXIgc3Vic2NyaXB0aW9ucyA9IHByb3BzLnN1YnNjcmlwdGlvbnNcclxuICB2YXIgc3VicyA9IFtdXHJcbiAgdmFyIG9uRW5kID0gcHJvcHMub25FbmRcclxuXHJcbiAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGRpc3BhdGNoKHRoaXMuYWN0aW9uc1tldmVudC50eXBlXSwgZXZlbnQpXHJcbiAgfVxyXG5cclxuICB2YXIgc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xyXG4gICAgaWYgKHN0YXRlICE9PSBuZXdTdGF0ZSkge1xyXG4gICAgICBzdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XHJcbiAgICAgICAgc3VicyA9IHBhdGNoU3VicyhzdWJzLCBiYXRjaChbc3Vic2NyaXB0aW9ucyhzdGF0ZSldKSwgZGlzcGF0Y2gpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHZpZXcgJiYgIWxvY2spIGRlZmVyKHJlbmRlciwgKGxvY2sgPSB0cnVlKSlcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZVxyXG4gIH1cclxuXHJcbiAgdmFyIGRpc3BhdGNoID0gKHByb3BzLm1pZGRsZXdhcmUgfHxcclxuICAgIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gb2JqXHJcbiAgICB9KShmdW5jdGlvbihhY3Rpb24sIHByb3BzKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgID8gZGlzcGF0Y2goYWN0aW9uKHN0YXRlLCBwcm9wcykpXHJcbiAgICAgIDogaXNBcnJheShhY3Rpb24pXHJcbiAgICAgID8gdHlwZW9mIGFjdGlvblswXSA9PT0gXCJmdW5jdGlvblwiIHx8IGlzQXJyYXkoYWN0aW9uWzBdKVxyXG4gICAgICAgID8gZGlzcGF0Y2goXHJcbiAgICAgICAgICAgIGFjdGlvblswXSxcclxuICAgICAgICAgICAgdHlwZW9mIGFjdGlvblsxXSA9PT0gXCJmdW5jdGlvblwiID8gYWN0aW9uWzFdKHByb3BzKSA6IGFjdGlvblsxXVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIDogKGJhdGNoKGFjdGlvbi5zbGljZSgxKSkubWFwKGZ1bmN0aW9uKGZ4KSB7XHJcbiAgICAgICAgICAgIGZ4ICYmIGZ4WzBdKGRpc3BhdGNoLCBmeFsxXSlcclxuICAgICAgICAgIH0sIHNldFN0YXRlKGFjdGlvblswXSkpLFxyXG4gICAgICAgICAgc3RhdGUpXHJcbiAgICAgIDogc2V0U3RhdGUoYWN0aW9uKVxyXG4gIH0pXHJcblxyXG4gIHZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGxvY2sgPSBmYWxzZVxyXG4gICAgbm9kZSA9IHBhdGNoKFxyXG4gICAgICBub2RlLnBhcmVudE5vZGUsXHJcbiAgICAgIG5vZGUsXHJcbiAgICAgIHZkb20sXHJcbiAgICAgICh2ZG9tID0gZ2V0VGV4dFZOb2RlKHZpZXcoc3RhdGUpKSksXHJcbiAgICAgIGxpc3RlbmVyXHJcbiAgICApXHJcbiAgICBvbkVuZCgpXHJcbiAgfVxyXG5cclxuICBkaXNwYXRjaChwcm9wcy5pbml0KVxyXG59XHJcbiIsInZhciB0aW1lRnggPSBmdW5jdGlvbiAoZng6IGFueSkge1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoXHJcbiAgICAgICAgYWN0aW9uOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBmeCxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBkZWxheTogcHJvcHMuZGVsYXlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF07XHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IHZhciB0aW1lb3V0ID0gdGltZUZ4KFxyXG5cclxuICAgIGZ1bmN0aW9uIChcclxuICAgICAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRpc3BhdGNoKHByb3BzLmFjdGlvbik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzLmRlbGF5XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuKTtcclxuXHJcbmV4cG9ydCB2YXIgaW50ZXJ2YWwgPSB0aW1lRngoXHJcblxyXG4gICAgZnVuY3Rpb24gKFxyXG4gICAgICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICB2YXIgaWQgPSBzZXRJbnRlcnZhbChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgRGF0ZS5ub3coKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcHMuZGVsYXlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuKTtcclxuXHJcblxyXG4vLyBleHBvcnQgdmFyIG5vd1xyXG4vLyBleHBvcnQgdmFyIHJldHJ5XHJcbi8vIGV4cG9ydCB2YXIgZGVib3VuY2VcclxuLy8gZXhwb3J0IHZhciB0aHJvdHRsZVxyXG4vLyBleHBvcnQgdmFyIGlkbGVDYWxsYmFjaz9cclxuIiwiXHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwQXV0aGVudGljYXRlZFByb3BzXCI7XHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9ja1wiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IElIdHRwT3V0cHV0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBPdXRwdXRcIjtcclxuaW1wb3J0IHsgSUh0dHBTZXF1ZW50aWFsRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cFNlcXVlbnRpYWxGZXRjaEl0ZW1cIjtcclxuXHJcbmNvbnN0IHNlcXVlbnRpYWxIdHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHNlcXVlbnRpYWxCbG9ja3M6IEFycmF5PElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2s+KTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIHdpbGwgcnVuIHNlcXVlbnRpYWxseVxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBpbiBlYWNoIGJsb2NrIHdpbGwgcnVubiBpbiBwYXJhbGxlbFxyXG4gICAgbGV0IGJsb2NrOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrO1xyXG4gICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgbGV0IGh0dHBDYWxsOiBhbnk7XHJcbiAgICBsZXQgbGFzdEh0dHBDYWxsOiBhbnk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IHNlcXVlbnRpYWxCbG9ja3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgICAgYmxvY2sgPSBzZXF1ZW50aWFsQmxvY2tzW2ldO1xyXG5cclxuICAgICAgICBpZiAoYmxvY2sgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGJsb2NrKSkge1xyXG5cclxuICAgICAgICAgICAgaHR0cENhbGwgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZTogcHJvY2Vzc0Jsb2NrLFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxyXG4gICAgICAgICAgICAgICAgYmxvY2s6IGJsb2NrLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGAke2l9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBodHRwQ2FsbCA9IHtcclxuICAgICAgICAgICAgICAgIGRlbGVnYXRlOiBwcm9jZXNzUHJvcHMsXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICBibG9jazogYmxvY2ssXHJcbiAgICAgICAgICAgICAgICBpbmRleDogYCR7aX1gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3VjY2Vzcykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGFzdEh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SHR0cENhbGwgPSBsYXN0SHR0cENhbGw7XHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRJbmRleCA9IGxhc3RIdHRwQ2FsbC5pbmRleDtcclxuICAgICAgICAgICAgaHR0cENhbGwubmV4dEJsb2NrID0gbGFzdEh0dHBDYWxsLmJsb2NrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGFzdEh0dHBDYWxsID0gaHR0cENhbGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgIGh0dHBDYWxsLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICBodHRwQ2FsbC5kaXNwYXRjaCxcclxuICAgICAgICAgICAgaHR0cENhbGwuYmxvY2ssXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgaHR0cENhbGwuaW5kZXhcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBwcm9jZXNzQmxvY2sgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgYmxvY2s6IElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2ssXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBwYXJhbGxlbFByb3BzOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz4gPSBibG9jayBhcyBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz47XHJcbiAgICBjb25zdCBkZWxlZ2F0ZXM6IGFueVtdID0gW107XHJcbiAgICBsZXQgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzO1xyXG5cclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFyYWxsZWxQcm9wcy5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICBwcm9wcyA9IHBhcmFsbGVsUHJvcHNbal07XHJcblxyXG4gICAgICAgIGRlbGVnYXRlcy5wdXNoKFxyXG4gICAgICAgICAgICBwcm9jZXNzUHJvcHMoXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgUHJvbWlzZVxyXG4gICAgICAgICAgICAuYWxsKGRlbGVnYXRlcylcclxuICAgICAgICAgICAgLnRoZW4oKVxyXG4gICAgICAgICAgICAuY2F0Y2goKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NQcm9wcyA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMsXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghcHJvcHMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0OiBJSHR0cE91dHB1dCA9IHtcclxuICAgICAgICBvazogZmFsc2UsXHJcbiAgICAgICAgdXJsOiBwcm9wcy51cmwsXHJcbiAgICAgICAgYXV0aGVudGljYXRpb25GYWlsOiBmYWxzZSxcclxuICAgICAgICBwYXJzZVR5cGU6IFwidGV4dFwiLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dCxcclxuICAgICAgICBuZXh0RGVsZWdhdGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBodHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXByb3BzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dHB1dDogSUh0dHBPdXRwdXQgPSB7XHJcbiAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgIHVybDogcHJvcHMudXJsLFxyXG4gICAgICAgIGF1dGhlbnRpY2F0aW9uRmFpbDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBwcm9wcy5wYXJzZVR5cGUgPz8gJ2pzb24nLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGh0dHAgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzLFxyXG4gICAgb3V0cHV0OiBJSHR0cE91dHB1dCxcclxuICAgIG5leHREZWxlZ2F0ZTogYW55ID0gbnVsbCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGZldGNoKFxyXG4gICAgICAgIHByb3BzLnVybCxcclxuICAgICAgICBwcm9wcy5vcHRpb25zKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3V0cHV0Lm9rID0gcmVzcG9uc2Uub2sgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnR5cGUgPSByZXNwb25zZS50eXBlO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnJlZGlyZWN0ZWQgPSByZXNwb25zZS5yZWRpcmVjdGVkO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5jYWxsSUQgPSByZXNwb25zZS5oZWFkZXJzLmdldChcIkNhbGxJRFwiKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIikgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3V0cHV0LmNvbnRlbnRUeXBlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHB1dC5jb250ZW50VHlwZS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSAhPT0gLTEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wYXJzZVR5cGUgPSBcImpzb25cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5hdXRoZW50aWNhdGlvbkZhaWwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25BdXRoZW50aWNhdGlvbkZhaWxBY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5yZXNwb25zZU51bGwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuZXJyb3IgKz0gYEVycm9yIHRocm93biB3aXRoIHJlc3BvbnNlLnRleHQoKVxyXG5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQudGV4dERhdGEgPSByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0XHJcbiAgICAgICAgICAgICAgICAmJiBvdXRwdXQucGFyc2VUeXBlID09PSAnanNvbidcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuanNvbkRhdGEgPSBKU09OLnBhcnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmVycm9yICs9IGBFcnJvciB0aHJvd24gcGFyc2luZyByZXNwb25zZS50ZXh0KCkgYXMganNvblxyXG5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW91dHB1dC5vaykge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXh0RGVsZWdhdGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dERlbGVnYXRlLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZS5kaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuYmxvY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuaW5kZXhcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgIG91dHB1dC5lcnJvciArPSBlcnJvcjtcclxuXHJcbiAgICAgICAgICAgIGRpc3BhdGNoKFxyXG4gICAgICAgICAgICAgICAgcHJvcHMuZXJyb3IsXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdIdHRwID0gKHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyk6IElIdHRwRmV0Y2hJdGVtID0+IHtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIGh0dHBFZmZlY3QsXHJcbiAgICAgICAgcHJvcHNcclxuICAgIF1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdTZXF1ZW50aWFsSHR0cCA9IChwcm9wc0Jsb2NrOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrPik6IElIdHRwU2VxdWVudGlhbEZldGNoSXRlbSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzZXF1ZW50aWFsSHR0cEVmZmVjdCxcclxuICAgICAgICBwcm9wc0Jsb2NrXHJcbiAgICBdXHJcbn1cclxuIiwiXHJcbmNvbnN0IEtleXMgPSB7XHJcblxyXG4gICAgc3RhcnRVcmw6ICdzdGFydFVybCcsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEtleXM7XHJcblxyXG4iLCJpbXBvcnQgSUh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIdHRwRWZmZWN0IGltcGxlbWVudHMgSUh0dHBFZmZlY3Qge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgICB1cmw6IHN0cmluZyxcclxuICAgICAgICBhY3Rpb25EZWxlZ2F0ZTogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5KSB7XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICAgICAgdGhpcy5hY3Rpb25EZWxlZ2F0ZSA9IGFjdGlvbkRlbGVnYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdXJsOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgYWN0aW9uRGVsZWdhdGU6IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheTtcclxufVxyXG4iLCJcclxuXHJcbmNvbnN0IGdVdGlsaXRpZXMgPSB7XHJcblxyXG4gICAgcm91bmRVcFRvTmVhcmVzdFRlbjogKHZhbHVlOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZmxvb3IgPSBNYXRoLmZsb29yKHZhbHVlIC8gMTApO1xyXG5cclxuICAgICAgICByZXR1cm4gKGZsb29yICsgMSkgKiAxMDtcclxuICAgIH0sXHJcblxyXG4gICAgcm91bmREb3duVG9OZWFyZXN0VGVuOiAodmFsdWU6IG51bWJlcikgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBmbG9vciA9IE1hdGguZmxvb3IodmFsdWUgLyAxMCk7XHJcblxyXG4gICAgICAgIHJldHVybiBmbG9vciAqIDEwO1xyXG4gICAgfSxcclxuXHJcbiAgICBjb252ZXJ0TW1Ub0ZlZXRJbmNoZXM6IChtbTogbnVtYmVyKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgaW5jaGVzID0gbW0gKiAwLjAzOTM3O1xyXG5cclxuICAgICAgICByZXR1cm4gZ1V0aWxpdGllcy5jb252ZXJ0SW5jaGVzVG9GZWV0SW5jaGVzKGluY2hlcyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldERpcmVjdG9yeTogKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICB2YXIgbWF0Y2hlcyA9IGZpbGVQYXRoLm1hdGNoKC8oLiopW1xcL1xcXFxdLyk7XHJcblxyXG4gICAgICAgIGlmIChtYXRjaGVzXHJcbiAgICAgICAgICAgICYmIG1hdGNoZXMubGVuZ3RoID4gMFxyXG4gICAgICAgICkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNbMV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvdW50Q2hhcmFjdGVyOiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBjaGFyYWN0ZXI6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dFtpXSA9PT0gY2hhcmFjdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbnZlcnRJbmNoZXNUb0ZlZXRJbmNoZXM6IChpbmNoZXM6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZlZXQgPSBNYXRoLmZsb29yKGluY2hlcyAvIDEyKTtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmcgPSBpbmNoZXMgJSAxMjtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmdSb3VuZGVkID0gTWF0aC5yb3VuZChpbmNoZXNSZWFtaW5pbmcgKiAxMCkgLyAxMDsgLy8gMSBkZWNpbWFsIHBsYWNlc1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBpZiAoZmVldCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGAke2ZlZXR9JyBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluY2hlc1JlYW1pbmluZ1JvdW5kZWQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBgJHtyZXN1bHR9JHtpbmNoZXNSZWFtaW5pbmdSb3VuZGVkfVwiYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTnVsbE9yV2hpdGVTcGFjZTogKGlucHV0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dCA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucHV0ID0gYCR7aW5wdXR9YDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0Lm1hdGNoKC9eXFxzKiQvKSAhPT0gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tBcnJheXNFcXVhbDogKGE6IHN0cmluZ1tdLCBiOiBzdHJpbmdbXSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoYSA9PT0gYikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYSA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBiID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3QgY2FyZSBhYm91dCB0aGUgb3JkZXIgb2YgdGhlIGVsZW1lbnRzIGluc2lkZVxyXG4gICAgICAgIC8vIHRoZSBhcnJheSwgeW91IHNob3VsZCBzb3J0IGJvdGggYXJyYXlzIGhlcmUuXHJcbiAgICAgICAgLy8gUGxlYXNlIG5vdGUgdGhhdCBjYWxsaW5nIHNvcnQgb24gYW4gYXJyYXkgd2lsbCBtb2RpZnkgdGhhdCBhcnJheS5cclxuICAgICAgICAvLyB5b3UgbWlnaHQgd2FudCB0byBjbG9uZSB5b3VyIGFycmF5IGZpcnN0LlxyXG5cclxuICAgICAgICBjb25zdCB4OiBzdHJpbmdbXSA9IFsuLi5hXTtcclxuICAgICAgICBjb25zdCB5OiBzdHJpbmdbXSA9IFsuLi5iXTtcclxuICAgICAgICBcclxuICAgICAgICB4LnNvcnQoKTtcclxuICAgICAgICB5LnNvcnQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeFtpXSAhPT0geVtpXSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHNodWZmbGUoYXJyYXk6IEFycmF5PGFueT4pOiBBcnJheTxhbnk+IHtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRJbmRleCA9IGFycmF5Lmxlbmd0aDtcclxuICAgICAgICBsZXQgdGVtcG9yYXJ5VmFsdWU6IGFueVxyXG4gICAgICAgIGxldCByYW5kb21JbmRleDogbnVtYmVyO1xyXG5cclxuICAgICAgICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxyXG4gICAgICAgIHdoaWxlICgwICE9PSBjdXJyZW50SW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxyXG4gICAgICAgICAgICByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCAtPSAxO1xyXG5cclxuICAgICAgICAgICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxyXG4gICAgICAgICAgICB0ZW1wb3JhcnlWYWx1ZSA9IGFycmF5W2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgICAgIGFycmF5W2N1cnJlbnRJbmRleF0gPSBhcnJheVtyYW5kb21JbmRleF07XHJcbiAgICAgICAgICAgIGFycmF5W3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFycmF5O1xyXG4gICAgfSxcclxuXHJcbiAgICBpc051bWVyaWM6IChpbnB1dDogYW55KTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAhaXNOYU4oaW5wdXQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpc05lZ2F0aXZlTnVtZXJpYzogKGlucHV0OiBhbnkpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVtZXJpYyhpbnB1dCkpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAraW5wdXQgPCAwOyAvLyArIGNvbnZlcnRzIGEgc3RyaW5nIHRvIGEgbnVtYmVyIGlmIGl0IGNvbnNpc3RzIG9ubHkgb2YgZGlnaXRzLlxyXG4gICAgfSxcclxuXHJcbiAgICBoYXNEdXBsaWNhdGVzOiA8VD4oaW5wdXQ6IEFycmF5PFQ+KTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChuZXcgU2V0KGlucHV0KS5zaXplICE9PSBpbnB1dC5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBleHRlbmQ6IDxUPihhcnJheTE6IEFycmF5PFQ+LCBhcnJheTI6IEFycmF5PFQ+KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGFycmF5Mi5mb3JFYWNoKChpdGVtOiBUKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBhcnJheTEucHVzaChpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJldHR5UHJpbnRKc29uRnJvbVN0cmluZzogKGlucHV0OiBzdHJpbmcgfCBudWxsKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFpbnB1dCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ1V0aWxpdGllcy5wcmV0dHlQcmludEpzb25Gcm9tT2JqZWN0KEpTT04ucGFyc2UoaW5wdXQpKTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJldHR5UHJpbnRKc29uRnJvbU9iamVjdDogKGlucHV0OiBvYmplY3QgfCBudWxsKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFpbnB1dCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICA0IC8vIGluZGVudGVkIDQgc3BhY2VzXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNQb3NpdGl2ZU51bWVyaWM6IChpbnB1dDogYW55KTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZ1V0aWxpdGllcy5pc051bWVyaWMoaW5wdXQpKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gTnVtYmVyKGlucHV0KSA+PSAwO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRUaW1lOiAoKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgbm93OiBEYXRlID0gbmV3IERhdGUoRGF0ZS5ub3coKSk7XHJcbiAgICAgICAgY29uc3QgdGltZTogc3RyaW5nID0gYCR7bm93LmdldEZ1bGxZZWFyKCl9LSR7KG5vdy5nZXRNb250aCgpICsgMSkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfS0ke25vdy5nZXREYXRlKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfSAke25vdy5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06JHtub3cuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06JHtub3cuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX06OiR7bm93LmdldE1pbGxpc2Vjb25kcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKX06YDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRpbWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHNwbGl0QnlOZXdMaW5lOiAoaW5wdXQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoaW5wdXQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXN1bHRzID0gaW5wdXQuc3BsaXQoL1tcXHJcXG5dKy8pO1xyXG4gICAgICAgIGNvbnN0IGNsZWFuZWQ6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKHZhbHVlKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNsZWFuZWQucHVzaCh2YWx1ZS50cmltKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjbGVhbmVkO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdEJ5UGlwZTogKGlucHV0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGlucHV0LnNwbGl0KCd8Jyk7XHJcbiAgICAgICAgY29uc3QgY2xlYW5lZDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG5cclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UodmFsdWUpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xlYW5lZC5wdXNoKHZhbHVlLnRyaW0oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNsZWFuZWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHNwbGl0QnlOZXdMaW5lQW5kT3JkZXI6IChpbnB1dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBnVXRpbGl0aWVzXHJcbiAgICAgICAgICAgIC5zcGxpdEJ5TmV3TGluZShpbnB1dClcclxuICAgICAgICAgICAgLnNvcnQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgam9pbkJ5TmV3TGluZTogKGlucHV0OiBBcnJheTxzdHJpbmc+KTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFpbnB1dFxyXG4gICAgICAgICAgICB8fCBpbnB1dC5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpbnB1dC5qb2luKCdcXG4nKTtcclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlQWxsQ2hpbGRyZW46IChwYXJlbnQ6IEVsZW1lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKHBhcmVudC5maXJzdENoaWxkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKHBhcmVudC5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgaXNPZGQ6ICh4OiBudW1iZXIpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHggJSAyID09PSAxO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG9ydFByaW50VGV4dDogKFxyXG4gICAgICAgIGlucHV0OiBzdHJpbmcsXHJcbiAgICAgICAgbWF4TGVuZ3RoOiBudW1iZXIgPSAxMDApOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoaW5wdXQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmaXJzdE5ld0xpbmVJbmRleDogbnVtYmVyID0gZ1V0aWxpdGllcy5nZXRGaXJzdE5ld0xpbmVJbmRleChpbnB1dCk7XHJcblxyXG4gICAgICAgIGlmIChmaXJzdE5ld0xpbmVJbmRleCA+IDBcclxuICAgICAgICAgICAgJiYgZmlyc3ROZXdMaW5lSW5kZXggPD0gbWF4TGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBvdXRwdXQgPSBpbnB1dC5zdWJzdHIoMCwgZmlyc3ROZXdMaW5lSW5kZXggLSAxKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnVXRpbGl0aWVzLnRyaW1BbmRBZGRFbGxpcHNpcyhvdXRwdXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBtYXhMZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpbnB1dDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IGlucHV0LnN1YnN0cigwLCBtYXhMZW5ndGgpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1V0aWxpdGllcy50cmltQW5kQWRkRWxsaXBzaXMob3V0cHV0KTtcclxuICAgIH0sXHJcblxyXG4gICAgdHJpbUFuZEFkZEVsbGlwc2lzOiAoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGxldCBvdXRwdXQ6IHN0cmluZyA9IGlucHV0LnRyaW0oKTtcclxuICAgICAgICBsZXQgcHVuY3R1YXRpb25SZWdleDogUmVnRXhwID0gL1suLFxcLyMhJCVcXF4mXFwqOzp7fT1cXC1fYH4oKV0vZztcclxuICAgICAgICBsZXQgc3BhY2VSZWdleDogUmVnRXhwID0gL1xcVysvZztcclxuICAgICAgICBsZXQgbGFzdENoYXJhY3Rlcjogc3RyaW5nID0gb3V0cHV0W291dHB1dC5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgbGV0IGxhc3RDaGFyYWN0ZXJJc1B1bmN0dWF0aW9uOiBib29sZWFuID1cclxuICAgICAgICAgICAgcHVuY3R1YXRpb25SZWdleC50ZXN0KGxhc3RDaGFyYWN0ZXIpXHJcbiAgICAgICAgICAgIHx8IHNwYWNlUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKTtcclxuXHJcblxyXG4gICAgICAgIHdoaWxlIChsYXN0Q2hhcmFjdGVySXNQdW5jdHVhdGlvbiA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0LnN1YnN0cigwLCBvdXRwdXQubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIGxhc3RDaGFyYWN0ZXIgPSBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICAgICAgbGFzdENoYXJhY3RlcklzUHVuY3R1YXRpb24gPVxyXG4gICAgICAgICAgICAgICAgcHVuY3R1YXRpb25SZWdleC50ZXN0KGxhc3RDaGFyYWN0ZXIpXHJcbiAgICAgICAgICAgICAgICB8fCBzcGFjZVJlZ2V4LnRlc3QobGFzdENoYXJhY3Rlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYCR7b3V0cHV0fS4uLmA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZpcnN0TmV3TGluZUluZGV4OiAoaW5wdXQ6IHN0cmluZyk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICAgIGxldCBjaGFyYWN0ZXI6IHN0cmluZztcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgY2hhcmFjdGVyID0gaW5wdXRbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhcmFjdGVyID09PSAnXFxuJ1xyXG4gICAgICAgICAgICAgICAgfHwgY2hhcmFjdGVyID09PSAnXFxyJykge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwcGVyQ2FzZUZpcnN0TGV0dGVyOiAoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnB1dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGlucHV0LnNsaWNlKDEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZW5lcmF0ZUd1aWQ6ICh1c2VIeXBlbnM6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGxldCBkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgICAgIGxldCBkMiA9IChwZXJmb3JtYW5jZVxyXG4gICAgICAgICAgICAmJiBwZXJmb3JtYW5jZS5ub3dcclxuICAgICAgICAgICAgJiYgKHBlcmZvcm1hbmNlLm5vdygpICogMTAwMCkpIHx8IDA7XHJcblxyXG4gICAgICAgIGxldCBwYXR0ZXJuID0gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCc7XHJcblxyXG4gICAgICAgIGlmICghdXNlSHlwZW5zKSB7XHJcbiAgICAgICAgICAgIHBhdHRlcm4gPSAneHh4eHh4eHh4eHh4NHh4eHl4eHh4eHh4eHh4eHh4eHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZ3VpZCA9IHBhdHRlcm5cclxuICAgICAgICAgICAgLnJlcGxhY2UoXHJcbiAgICAgICAgICAgICAgICAvW3h5XS9nLFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKGMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHIgPSBNYXRoLnJhbmRvbSgpICogMTY7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IChkICsgcikgJSAxNiB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IChkMiArIHIpICUgMTYgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkMiA9IE1hdGguZmxvb3IoZDIgLyAxNik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGMgPT09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGd1aWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrSWZDaHJvbWU6ICgpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgLy8gcGxlYXNlIG5vdGUsIFxyXG4gICAgICAgIC8vIHRoYXQgSUUxMSBub3cgcmV0dXJucyB1bmRlZmluZWQgYWdhaW4gZm9yIHdpbmRvdy5jaHJvbWVcclxuICAgICAgICAvLyBhbmQgbmV3IE9wZXJhIDMwIG91dHB1dHMgdHJ1ZSBmb3Igd2luZG93LmNocm9tZVxyXG4gICAgICAgIC8vIGJ1dCBuZWVkcyB0byBjaGVjayBpZiB3aW5kb3cub3ByIGlzIG5vdCB1bmRlZmluZWRcclxuICAgICAgICAvLyBhbmQgbmV3IElFIEVkZ2Ugb3V0cHV0cyB0byB0cnVlIG5vdyBmb3Igd2luZG93LmNocm9tZVxyXG4gICAgICAgIC8vIGFuZCBpZiBub3QgaU9TIENocm9tZSBjaGVja1xyXG4gICAgICAgIC8vIHNvIHVzZSB0aGUgYmVsb3cgdXBkYXRlZCBjb25kaXRpb25cclxuXHJcbiAgICAgICAgbGV0IHRzV2luZG93OiBhbnkgPSB3aW5kb3cgYXMgYW55O1xyXG4gICAgICAgIGxldCBpc0Nocm9taXVtID0gdHNXaW5kb3cuY2hyb21lO1xyXG4gICAgICAgIGxldCB3aW5OYXYgPSB3aW5kb3cubmF2aWdhdG9yO1xyXG4gICAgICAgIGxldCB2ZW5kb3JOYW1lID0gd2luTmF2LnZlbmRvcjtcclxuICAgICAgICBsZXQgaXNPcGVyYSA9IHR5cGVvZiB0c1dpbmRvdy5vcHIgIT09IFwidW5kZWZpbmVkXCI7XHJcbiAgICAgICAgbGV0IGlzSUVlZGdlID0gd2luTmF2LnVzZXJBZ2VudC5pbmRleE9mKFwiRWRnZVwiKSA+IC0xO1xyXG4gICAgICAgIGxldCBpc0lPU0Nocm9tZSA9IHdpbk5hdi51c2VyQWdlbnQubWF0Y2goXCJDcmlPU1wiKTtcclxuXHJcbiAgICAgICAgaWYgKGlzSU9TQ2hyb21lKSB7XHJcbiAgICAgICAgICAgIC8vIGlzIEdvb2dsZSBDaHJvbWUgb24gSU9TXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpc0Nocm9taXVtICE9PSBudWxsXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBpc0Nocm9taXVtICE9PSBcInVuZGVmaW5lZFwiXHJcbiAgICAgICAgICAgICYmIHZlbmRvck5hbWUgPT09IFwiR29vZ2xlIEluYy5cIlxyXG4gICAgICAgICAgICAmJiBpc09wZXJhID09PSBmYWxzZVxyXG4gICAgICAgICAgICAmJiBpc0lFZWRnZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgLy8gaXMgR29vZ2xlIENocm9tZVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdVdGlsaXRpZXM7IiwiaW1wb3J0IElBY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSUFjdGlvblwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IEh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL3N0YXRlL2VmZmVjdHMvSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGdTdGF0ZUNvZGUgPSB7XHJcblxyXG4gICAgZ2V0RnJlc2hLZXlJbnQ6IChzdGF0ZTogSVN0YXRlKTogbnVtYmVyID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgbmV4dEtleSA9ICsrc3RhdGUubmV4dEtleTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5leHRLZXk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyZXNoS2V5OiAoc3RhdGU6IElTdGF0ZSk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgJHtnU3RhdGVDb2RlLmdldEZyZXNoS2V5SW50KHN0YXRlKX1gO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRHdWlkS2V5OiAoKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFUuZ2VuZXJhdGVHdWlkKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb25lU3RhdGU6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgbGV0IG5ld1N0YXRlOiBJU3RhdGUgPSB7IC4uLnN0YXRlIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgIH0sXHJcblxyXG4gICAgQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZWZmZWN0OiBJSHR0cEVmZmVjdCB8IHVuZGVmaW5lZCA9IHN0YXRlXHJcbiAgICAgICAgICAgIC5yZXBlYXRFZmZlY3RzXHJcbiAgICAgICAgICAgIC5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlXHJcbiAgICAgICAgICAgIC5maW5kKChlZmZlY3Q6IElIdHRwRWZmZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVmZmVjdC5uYW1lID09PSBuYW1lO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGVmZmVjdCkgeyAvLyBhbHJlYWR5IGFkZGVkLlxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBodHRwRWZmZWN0OiBJSHR0cEVmZmVjdCA9IG5ldyBIdHRwRWZmZWN0KFxyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIGFjdGlvbkRlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlLnB1c2goaHR0cEVmZmVjdCk7XHJcbiAgICB9LFxyXG5cclxuICAgIEFkZFJ1bkFjdGlvbkltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgYWN0aW9uRGVsZWdhdGU6IElBY3Rpb24pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5ydW5BY3Rpb25JbW1lZGlhdGUucHVzaChhY3Rpb25EZWxlZ2F0ZSk7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1N0YXRlQ29kZTtcclxuXHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgZ0F1dGhlbnRpY2F0aW9uQ29kZSA9IHtcclxuXHJcbiAgICBjbGVhckF1dGhlbnRpY2F0aW9uOiAoc3RhdGU6IElTdGF0ZSk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS51c2VyLmF1dGhvcmlzZWQgPSBmYWxzZTtcclxuICAgICAgICBzdGF0ZS51c2VyLm5hbWUgPSBcIlwiO1xyXG4gICAgICAgIHN0YXRlLnVzZXIuc3ViID0gXCJcIjtcclxuICAgICAgICBzdGF0ZS51c2VyLmxvZ291dFVybCA9IFwiXCI7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQXV0aGVudGljYXRpb25Db2RlO1xyXG4iLCJcclxuZXhwb3J0IGVudW0gQWN0aW9uVHlwZSB7XHJcblxyXG4gICAgTm9uZSA9ICdub25lJyxcclxuICAgIEZpbHRlclRvcGljcyA9ICdmaWx0ZXJUb3BpY3MnLFxyXG4gICAgR2V0VG9waWMgPSAnZ2V0VG9waWMnLFxyXG4gICAgR2V0VG9waWNBbmRSb290ID0gJ2dldFRvcGljQW5kUm9vdCcsXHJcbiAgICBTYXZlQXJ0aWNsZVNjZW5lID0gJ3NhdmVBcnRpY2xlU2NlbmUnLFxyXG4gICAgR2V0Um9vdCA9ICdnZXRSb290JyxcclxuICAgIEdldFN0ZXAgPSAnZ2V0U3RlcCcsXHJcbiAgICBHZXRQYWdlID0gJ2dldFBhZ2UnLFxyXG4gICAgR2V0Q2hhaW4gPSAnZ2V0Q2hhaW4nLFxyXG4gICAgR2V0T3V0bGluZSA9ICdnZXRPdXRsaW5lJyxcclxuICAgIEdldEZyYWdtZW50ID0gJ2dldEZyYWdtZW50JyxcclxuICAgIEdldENoYWluRnJhZ21lbnQgPSAnZ2V0Q2hhaW5GcmFnbWVudCdcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuXHJcblxyXG5jb25zdCBnQWpheEhlYWRlckNvZGUgPSB7XHJcblxyXG4gICAgYnVpbGRIZWFkZXJzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjYWxsSUQ6IHN0cmluZyxcclxuICAgICAgICBhY3Rpb246IEFjdGlvblR5cGUpOiBIZWFkZXJzID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCdYLUNTUkYnLCAnMScpO1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCdTdWJzY3JpcHRpb25JRCcsIHN0YXRlLnNldHRpbmdzLnN1YnNjcmlwdGlvbklEKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnQ2FsbElEJywgY2FsbElEKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnQWN0aW9uJywgYWN0aW9uKTtcclxuXHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ3dpdGhDcmVkZW50aWFscycsICd0cnVlJyk7XHJcblxyXG4gICAgICAgIHJldHVybiBoZWFkZXJzO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0FqYXhIZWFkZXJDb2RlO1xyXG5cclxuIiwiaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5cclxuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGdBamF4SGVhZGVyQ29kZSBmcm9tIFwiLi9nQWpheEhlYWRlckNvZGVcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uQWN0aW9uc1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdBdXRoZW50aWNhdGlvbkVmZmVjdHMgPSB7XHJcblxyXG4gICAgY2hlY2tVc2VyQXV0aGVudGljYXRlZDogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgICAgICBsZXQgaGVhZGVycyA9IGdBamF4SGVhZGVyQ29kZS5idWlsZEhlYWRlcnMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgICAgIEFjdGlvblR5cGUuTm9uZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7c3RhdGUuc2V0dGluZ3MuYmZmVXJsfS8ke3N0YXRlLnNldHRpbmdzLnVzZXJQYXRofT9zbGlkZT1mYWxzZWA7XHJcblxyXG4gICAgICAgIHJldHVybiBnQXV0aGVudGljYXRlZEh0dHAoe1xyXG4gICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXNwb25zZTogJ2pzb24nLFxyXG4gICAgICAgICAgICBhY3Rpb246IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMubG9hZFN1Y2Nlc3NmdWxBdXRoZW50aWNhdGlvbixcclxuICAgICAgICAgICAgZXJyb3I6IChzdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgdHJ5aW5nIHRvIGF1dGhlbnRpY2F0ZSB3aXRoIHRoZSBzZXJ2ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6IGdBdXRoZW50aWNhdGlvbkVmZmVjdHMuY2hlY2tVc2VyQXV0aGVudGljYXRlZC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGF0ZVwiOiAke0pTT04uc3RyaW5naWZ5KHN0YXRlKX1cclxuICAgICAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cztcclxuIiwiaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBLZXlzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25Db2RlIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkNvZGVcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkVmZmVjdHMgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uRWZmZWN0c1wiO1xyXG5cclxuXHJcbmNvbnN0IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMgPSB7XHJcblxyXG4gICAgbG9hZFN1Y2Nlc3NmdWxBdXRoZW50aWNhdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhcmVzcG9uc2VcclxuICAgICAgICAgICAgfHwgcmVzcG9uc2UucGFyc2VUeXBlICE9PSBcImpzb25cIlxyXG4gICAgICAgICAgICB8fCAhcmVzcG9uc2UuanNvbkRhdGEpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYWltczogYW55ID0gcmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IG5hbWU6IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ25hbWUnXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3ViOiBhbnkgPSBjbGFpbXMuZmluZChcclxuICAgICAgICAgICAgKGNsYWltOiBhbnkpID0+IGNsYWltLnR5cGUgPT09ICdzdWInXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFuYW1lXHJcbiAgICAgICAgICAgICYmICFzdWIpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvZ291dFVybENsYWltOiBhbnkgPSBjbGFpbXMuZmluZChcclxuICAgICAgICAgICAgKGNsYWltOiBhbnkpID0+IGNsYWltLnR5cGUgPT09ICdiZmY6bG9nb3V0X3VybCdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWxvZ291dFVybENsYWltXHJcbiAgICAgICAgICAgIHx8ICFsb2dvdXRVcmxDbGFpbS52YWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUudXNlci5hdXRob3Jpc2VkID0gdHJ1ZTtcclxuICAgICAgICBzdGF0ZS51c2VyLm5hbWUgPSBuYW1lLnZhbHVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIuc3ViID0gc3ViLnZhbHVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubG9nb3V0VXJsID0gbG9nb3V0VXJsQ2xhaW0udmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja1VzZXJMb2dnZWRJbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BzOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2hlY2tVc2VyTG9nZ2VkSW5Qcm9wcyhzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICghcHJvcHMpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBwcm9wc1xyXG4gICAgICAgIF07XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrVXNlckxvZ2dlZEluUHJvcHM6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS51c2VyLnJhdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cy5jaGVja1VzZXJBdXRoZW50aWNhdGVkKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9naW46IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcblxyXG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXHJcbiAgICAgICAgICAgIEtleXMuc3RhcnRVcmwsXHJcbiAgICAgICAgICAgIGN1cnJlbnRVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3N0YXRlLnNldHRpbmdzLmJmZlVybH0vJHtzdGF0ZS5zZXR0aW5ncy5kZWZhdWx0TG9naW5QYXRofT9yZXR1cm5Vcmw9L2A7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmFzc2lnbih1cmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb246IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG4gICAgICAgIGdBdXRoZW50aWNhdGlvbkNvZGUuY2xlYXJBdXRoZW50aWNhdGlvbihzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhckF1dGhlbnRpY2F0aW9uQW5kU2hvd0xvZ2luOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ0F1dGhlbnRpY2F0aW9uQ29kZS5jbGVhckF1dGhlbnRpY2F0aW9uKHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdBdXRoZW50aWNhdGlvbkFjdGlvbnMubG9naW4oc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2dvdXQ6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKHN0YXRlLnVzZXIubG9nb3V0VXJsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucztcclxuIiwiaW1wb3J0IHsgZ0h0dHAgfSBmcm9tIFwiLi9nSHR0cFwiO1xyXG5cclxuaW1wb3J0IElIdHRwQXV0aGVudGljYXRlZFByb3BzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNcIjtcclxuaW1wb3J0IElIdHRwUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cFByb3BzXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25BY3Rpb25zIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkFjdGlvbnNcIjtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ0F1dGhlbnRpY2F0ZWRIdHRwKHByb3BzOiBJSHR0cFByb3BzKTogYW55IHtcclxuXHJcbiAgICBjb25zdCBodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzID0gcHJvcHMgYXMgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHM7XHJcblxyXG4gICAgLy8gLy8gVG8gcmVnaXN0ZXIgZmFpbGVkIGF1dGhlbnRpY2F0aW9uXHJcbiAgICAvLyBodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXMub25BdXRoZW50aWNhdGlvbkZhaWxBY3Rpb24gPSBnQXV0aGVudGljYXRpb25BY3Rpb25zLmNsZWFyQXV0aGVudGljYXRpb247XHJcblxyXG4gICAgLy8gVG8gcmVnaXN0ZXIgZmFpbGVkIGF1dGhlbnRpY2F0aW9uIGFuZCBzaG93IGxvZ2luIHBhZ2VcclxuICAgIGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllcy5vbkF1dGhlbnRpY2F0aW9uRmFpbEFjdGlvbiA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2xlYXJBdXRoZW50aWNhdGlvbkFuZFNob3dMb2dpbjtcclxuXHJcbiAgICByZXR1cm4gZ0h0dHAoaHR0cEF1dGhlbnRpY2F0ZWRQcm9wZXJ0aWVzKTtcclxufVxyXG4iLCJcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdBamF4SGVhZGVyQ29kZSBmcm9tIFwiLi4vaHR0cC9nQWpheEhlYWRlckNvZGVcIjtcclxuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IElBY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSUFjdGlvblwiO1xyXG5cclxuY29uc3QgcnVuQWN0aW9uSW5uZXIgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGRpc3BhdGNoKFxyXG4gICAgICAgIHByb3BzLmFjdGlvbixcclxuICAgICk7XHJcbn07XHJcblxyXG5cclxuY29uc3QgcnVuQWN0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHF1ZXVlZEVmZmVjdHM6IEFycmF5PElBY3Rpb24+XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBjb25zdCBlZmZlY3RzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHF1ZXVlZEVmZmVjdHMuZm9yRWFjaCgoYWN0aW9uOiBJQWN0aW9uKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BzID0ge1xyXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgZXJyb3I6IChfc3RhdGU6IElTdGF0ZSwgX2Vycm9yRGV0YWlsczogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJFcnJvciBydW5uaW5nIGFjdGlvbiBpbiByZXBlYXRBY3Rpb25zXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIGVmZmVjdHMucHVzaChbXHJcbiAgICAgICAgICAgIHJ1bkFjdGlvbklubmVyLFxyXG4gICAgICAgICAgICBwcm9wc1xyXG4gICAgICAgIF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3Qgc2VuZFJlcXVlc3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVldWVkRWZmZWN0czogQXJyYXk8SUh0dHBFZmZlY3Q+XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBjb25zdCBlZmZlY3RzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHF1ZXVlZEVmZmVjdHMuZm9yRWFjaCgoaHR0cEVmZmVjdDogSUh0dHBFZmZlY3QpID0+IHtcclxuXHJcbiAgICAgICAgZ2V0RWZmZWN0KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgaHR0cEVmZmVjdCxcclxuICAgICAgICAgICAgZWZmZWN0cyxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0RWZmZWN0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGh0dHBFZmZlY3Q6IElIdHRwRWZmZWN0LFxyXG4gICAgZWZmZWN0czogQXJyYXk8SUh0dHBFZmZlY3Q+KTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3QgdXJsOiBzdHJpbmcgPSBodHRwRWZmZWN0LnVybDtcclxuICAgIGNvbnN0IGNhbGxJRDogc3RyaW5nID0gVS5nZW5lcmF0ZUd1aWQoKTtcclxuXHJcbiAgICBsZXQgaGVhZGVycyA9IGdBamF4SGVhZGVyQ29kZS5idWlsZEhlYWRlcnMoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgY2FsbElELFxyXG4gICAgICAgIEFjdGlvblR5cGUuR2V0U3RlcFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBlZmZlY3QgPSBnQXV0aGVudGljYXRlZEh0dHAoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogJ2pzb24nLFxyXG4gICAgICAgIGFjdGlvbjogaHR0cEVmZmVjdC5hY3Rpb25EZWxlZ2F0ZSxcclxuICAgICAgICBlcnJvcjogKF9zdGF0ZTogSVN0YXRlLCBfZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgcG9zdGluZyBnUmVwZWF0QWN0aW9ucyBkYXRhIHRvIHRoZSBzZXJ2ZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZWZmZWN0cy5wdXNoKGVmZmVjdCk7XHJcbn07XHJcblxyXG5jb25zdCBnUmVwZWF0QWN0aW9ucyA9IHtcclxuXHJcbiAgICBodHRwU2lsZW50UmVMb2FkSW1tZWRpYXRlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gTXVzdCByZXR1cm4gYWx0ZXJlZCBzdGF0ZSBmb3IgdGhlIHN1YnNjcmlwdGlvbiBub3QgdG8gZ2V0IHJlbW92ZWRcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHN0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVMb2FkSHR0cEVmZmVjdHNJbW1lZGlhdGU6IEFycmF5PElIdHRwRWZmZWN0PiA9IHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZTtcclxuICAgICAgICBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJlTG9hZEdldEh0dHBJbW1lZGlhdGUgPSBbXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbmRSZXF1ZXN0KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVMb2FkSHR0cEVmZmVjdHNJbW1lZGlhdGVcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaWxlbnRSdW5BY3Rpb25JbW1lZGlhdGU6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVwZWF0RWZmZWN0cy5ydW5BY3Rpb25JbW1lZGlhdGUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIE11c3QgcmV0dXJuIGFsdGVyZWQgc3RhdGUgZm9yIHRoZSBzdWJzY3JpcHRpb24gbm90IHRvIGdldCByZW1vdmVkXHJcbiAgICAgICAgICAgIC8vIHJldHVybiBzdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJ1bkFjdGlvbkltbWVkaWF0ZTogQXJyYXk8SUFjdGlvbj4gPSBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZTtcclxuICAgICAgICBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZSA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4gcnVuQWN0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcnVuQWN0aW9uSW1tZWRpYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZXBlYXRBY3Rpb25zO1xyXG5cclxuIiwiaW1wb3J0IHsgaW50ZXJ2YWwgfSBmcm9tIFwiLi4vLi4vaHlwZXJBcHAvdGltZVwiO1xyXG5cclxuaW1wb3J0IGdSZXBlYXRBY3Rpb25zIGZyb20gXCIuLi9nbG9iYWwvYWN0aW9ucy9nUmVwZWF0QWN0aW9uc1wiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IHJlcGVhdFN1YnNjcmlwdGlvbnMgPSB7XHJcblxyXG4gICAgYnVpbGRSZXBlYXRTdWJzY3JpcHRpb25zOiAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBidWlsZFJlTG9hZERhdGFJbW1lZGlhdGUgPSAoKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJlTG9hZEdldEh0dHBJbW1lZGlhdGUubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbChcclxuICAgICAgICAgICAgICAgICAgICBnUmVwZWF0QWN0aW9ucy5odHRwU2lsZW50UmVMb2FkSW1tZWRpYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHsgZGVsYXk6IDEwIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBidWlsZFJ1bkFjdGlvbnNJbW1lZGlhdGUgPSAoKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsKFxyXG4gICAgICAgICAgICAgICAgICAgIGdSZXBlYXRBY3Rpb25zLnNpbGVudFJ1bkFjdGlvbkltbWVkaWF0ZSxcclxuICAgICAgICAgICAgICAgICAgICB7IGRlbGF5OiAxMCB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVwZWF0U3Vic2NyaXB0aW9uOiBhbnlbXSA9IFtcclxuXHJcbiAgICAgICAgICAgIGJ1aWxkUmVMb2FkRGF0YUltbWVkaWF0ZSgpLFxyXG4gICAgICAgICAgICBidWlsZFJ1bkFjdGlvbnNJbW1lZGlhdGUoKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiByZXBlYXRTdWJzY3JpcHRpb247XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZXBlYXRTdWJzY3JpcHRpb25zO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IHJlcGVhdFN1YnNjcmlwdGlvbnMgZnJvbSBcIi4uLy4uLy4uL3N1YnNjcmlwdGlvbnMvcmVwZWF0U3Vic2NyaXB0aW9uXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdFN1YnNjcmlwdGlvbnMgPSAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uczogYW55W10gPSBbXHJcblxyXG4gICAgICAgIC4uLnJlcGVhdFN1YnNjcmlwdGlvbnMuYnVpbGRSZXBlYXRTdWJzY3JpcHRpb25zKHN0YXRlKVxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9ucztcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdWJzY3JpcHRpb25zO1xyXG5cclxuIiwiXHJcbmNvbnN0IEZpbHRlcnMgPSB7XHJcblxyXG4gICAgdHJlZVNvbHZlR3VpZGVJRDogXCJ0cmVlU29sdmVHdWlkZVwiLFxyXG4gICAgdHJlZVNvbHZlRnJhZ21lbnRzSUQ6IFwidHJlZVNvbHZlRnJhZ21lbnRzXCIsXHJcbiAgICB1cE5hdkVsZW1lbnQ6ICcjc3RlcE5hdiAuY2hhaW4tdXB3YXJkcycsXHJcbiAgICBkb3duTmF2RWxlbWVudDogJyNzdGVwTmF2IC5jaGFpbi1kb3dud2FyZHMnLFxyXG5cclxuICAgIGZyYWdtZW50Qm94OiAnI3RyZWVTb2x2ZUZyYWdtZW50cyAubnQtZnItZnJhZ21lbnQtYm94JyxcclxuICAgIGZyYWdtZW50Qm94RGlzY3Vzc2lvbjogJyN0cmVlU29sdmVGcmFnbWVudHMgLm50LWZyLWZyYWdtZW50LWJveCAubnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbicsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpbHRlcnM7XHJcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5cclxuXHJcbmNvbnN0IG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQgPSAoKSA9PiB7XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRCb3hEaXNjdXNzaW9uczogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoRmlsdGVycy5mcmFnbWVudEJveERpc2N1c3Npb24pO1xyXG4gICAgbGV0IGZyYWdtZW50Qm94OiBIVE1MRGl2RWxlbWVudDtcclxuICAgIGxldCBkYXRhRGlzY3Vzc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhZ21lbnRCb3hEaXNjdXNzaW9ucy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICBmcmFnbWVudEJveCA9IGZyYWdtZW50Qm94RGlzY3Vzc2lvbnNbaV0gYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICAgICAgZGF0YURpc2N1c3Npb24gPSBmcmFnbWVudEJveC5kYXRhc2V0LmRpc2N1c3Npb247XHJcblxyXG4gICAgICAgIGlmIChkYXRhRGlzY3Vzc2lvbikge1xyXG5cclxuICAgICAgICAgICAgZnJhZ21lbnRCb3guaW5uZXJIVE1MID0gZGF0YURpc2N1c3Npb247XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZDtcclxuIiwiaW1wb3J0IG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQgZnJvbSBcIi4uLy4uL2ZyYWdtZW50cy9jb2RlL29uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWRcIjtcclxuXHJcblxyXG5jb25zdCBvblJlbmRlckZpbmlzaGVkID0gKCkgPT4ge1xyXG5cclxuICAgIG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQoKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG9uUmVuZGVyRmluaXNoZWQ7XHJcbiIsImltcG9ydCBvblJlbmRlckZpbmlzaGVkIGZyb20gXCIuL29uUmVuZGVyRmluaXNoZWRcIjtcclxuXHJcblxyXG5jb25zdCBpbml0RXZlbnRzID0ge1xyXG5cclxuICBvblJlbmRlckZpbmlzaGVkOiAoKSA9PiB7XHJcblxyXG4gICAgb25SZW5kZXJGaW5pc2hlZCgpO1xyXG4gIH0sXHJcblxyXG4gIHJlZ2lzdGVyR2xvYmFsRXZlbnRzOiAoKSA9PiB7XHJcblxyXG4gICAgd2luZG93Lm9ucmVzaXplID0gKCkgPT4ge1xyXG5cclxuICAgICAgaW5pdEV2ZW50cy5vblJlbmRlckZpbmlzaGVkKCk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdEV2ZW50cztcclxuXHJcblxyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBpbml0QWN0aW9ucyA9IHtcclxuXHJcbiAgICBzZXROb3RSYXc6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCF3aW5kb3c/LlRyZWVTb2x2ZT8uc2NyZWVuPy5pc0F1dG9mb2N1c0ZpcnN0UnVuKSB7XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5hdXRvZm9jdXMgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmlzQXV0b2ZvY3VzRmlyc3RSdW4gPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdEFjdGlvbnM7XHJcbiIsImltcG9ydCBJUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckZyYWdtZW50VUkgaW1wbGVtZW50cyBJUmVuZGVyRnJhZ21lbnRVSSB7XHJcblxyXG4gICAgcHVibGljIG9wdGlvbkV4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBkaXNjdXNzaW9uTG9hZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5pbXBvcnQgUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vdWkvUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckZyYWdtZW50IGltcGxlbWVudHMgSVJlbmRlckZyYWdtZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaWQ6IHN0cmluZztcclxuICAgIHB1YmxpYyBvdXRsaW5lRnJhZ21lbnRJRDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgdG9wTGV2ZWxNYXBLZXk6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIG1hcEtleUNoYWluOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBndWlkZUlEOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBndWlkZVBhdGg6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBzZWxlY3RlZDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiA9IFtdO1xyXG5cclxuICAgIHB1YmxpYyBvcHRpb246IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIGlzQW5jaWxsYXJ5OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgb3JkZXI6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHVibGljIHVpOiBJUmVuZGVyRnJhZ21lbnRVSSA9IG5ldyBSZW5kZXJGcmFnbWVudFVJKCk7XHJcbn1cclxuIiwiXHJcblxyXG5jb25zdCBnRmlsZUNvbnN0YW50cyA9IHtcclxuXHJcbiAgICBmcmFnbWVudHNGb2xkZXJTdWZmaXg6ICdfZnJhZ3MnLFxyXG4gICAgZnJhZ21lbnRGaWxlRXh0ZW5zaW9uOiAnLmh0bWwnLFxyXG4gICAgZ3VpZGVPdXRsaW5lRmlsZW5hbWU6ICdvdXRsaW5lLnRzb2xuJyxcclxuICAgIGd1aWRlUmVuZGVyQ29tbWVudFRhZzogJ3RzR3VpZGVSZW5kZXJDb21tZW50ICcsXHJcbiAgICBmcmFnbWVudFJlbmRlckNvbW1lbnRUYWc6ICd0c0ZyYWdtZW50UmVuZGVyQ29tbWVudCAnLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZpbGVDb25zdGFudHM7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lRnJhZ21lbnRcIjtcclxuaW1wb3J0IFJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IHBhcnNlQW5kTG9hZEZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJhd0ZyYWdtZW50OiBhbnksXHJcbiAgICBvdXRsaW5lRnJhZ21lbnRJRDogc3RyaW5nXHJcbik6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghcmF3RnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SUQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRDtcclxuICAgIGxldCBmcmFnbWVudCA9IGluZGV4X2NoYWluRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEW291dGxpbmVGcmFnbWVudElEIGFzIHN0cmluZ11cclxuICAgIGxldCBjYWNoZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgZnJhZ21lbnQgPSBuZXcgUmVuZGVyRnJhZ21lbnQocmF3RnJhZ21lbnQuaWQpO1xyXG4gICAgICAgIGNhY2hlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmcmFnbWVudC5vdXRsaW5lRnJhZ21lbnRJRCA9IG91dGxpbmVGcmFnbWVudElEO1xyXG4gICAgaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SURbb3V0bGluZUZyYWdtZW50SUQgYXMgc3RyaW5nXSA9IGZyYWdtZW50O1xyXG5cclxuICAgIGdGcmFnbWVudENvZGUubG9hZEZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHJhd0ZyYWdtZW50LFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGlmIChjYWNoZSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmluZGV4Q2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnJhZ21lbnQ7XHJcbn07XHJcblxyXG5jb25zdCBsb2FkT3B0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJhd09wdGlvbjogYW55LFxyXG4gICAgb3V0bGluZUZyYWdtZW50OiBJUmVuZGVyT3V0bGluZUZyYWdtZW50IHwgbnVsbFxyXG4pOiBJUmVuZGVyRnJhZ21lbnQgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbiA9IG5ldyBSZW5kZXJGcmFnbWVudChyYXdPcHRpb24uaWQpO1xyXG4gICAgb3B0aW9uLm9wdGlvbiA9IHJhd09wdGlvbi5vcHRpb24gPz8gJyc7XHJcbiAgICBvcHRpb24uaXNBbmNpbGxhcnkgPSByYXdPcHRpb24uaXNBbmNpbGxhcnkgPz8gZmFsc2U7XHJcbiAgICBvcHRpb24ub3JkZXIgPSByYXdPcHRpb24ub3JkZXIgPz8gMDtcclxuXHJcbiAgICBpZiAob3V0bGluZUZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3V0bGluZU9wdGlvbiBvZiBvdXRsaW5lRnJhZ21lbnQubykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmVPcHRpb24uZiA9PT0gb3B0aW9uLmlkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLm91dGxpbmVGcmFnbWVudElEID0gb3V0bGluZU9wdGlvbi5pO1xyXG4gICAgICAgICAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZUZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRFtvdXRsaW5lT3B0aW9uLmldID0gb3V0bGluZU9wdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmluZGV4Q2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb25cclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG9wdGlvbjtcclxufTtcclxuXHJcbmNvbnN0IGdGcmFnbWVudENvZGUgPSB7XHJcblxyXG4gICAgZ2V0RnJhZ21lbnRFbGVtZW50SUQ6IChmcmFnbWVudElEOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYG50X2ZyX2ZyYWdfJHtmcmFnbWVudElEfWA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldENoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVGcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEW291dGxpbmVGcmFnbWVudElEXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZyYWdtZW50ID8/IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRGcmFnbWVudEZyb21DaGFpbkZyYWdtZW50czogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVGcmFnbWVudElEID0gZnJhZ21lbnQub3V0bGluZUZyYWdtZW50SUQgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uob3V0bGluZUZyYWdtZW50SUQpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhY2hlZGZyYWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SURbb3V0bGluZUZyYWdtZW50SURdO1xyXG5cclxuICAgICAgICBmcmFnbWVudC50b3BMZXZlbE1hcEtleSA9IGNhY2hlZGZyYWdtZW50LnRvcExldmVsTWFwS2V5O1xyXG4gICAgICAgIGZyYWdtZW50Lm1hcEtleUNoYWluID0gY2FjaGVkZnJhZ21lbnQubWFwS2V5Q2hhaW47XHJcbiAgICAgICAgZnJhZ21lbnQuZ3VpZGVJRCA9IGNhY2hlZGZyYWdtZW50Lmd1aWRlSUQ7XHJcbiAgICAgICAgZnJhZ21lbnQuZ3VpZGVQYXRoID0gY2FjaGVkZnJhZ21lbnQuZ3VpZGVQYXRoO1xyXG4gICAgICAgIGZyYWdtZW50LnBhcmVudEZyYWdtZW50SUQgPSBjYWNoZWRmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEO1xyXG4gICAgICAgIGZyYWdtZW50LnZhbHVlID0gY2FjaGVkZnJhZ21lbnQudmFsdWU7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZGlzY3Vzc2lvbkxvYWRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Lm9wdGlvbiA9IGNhY2hlZGZyYWdtZW50Lm9wdGlvbjtcclxuICAgICAgICBmcmFnbWVudC5pc0FuY2lsbGFyeSA9IGNhY2hlZGZyYWdtZW50LmlzQW5jaWxsYXJ5O1xyXG4gICAgICAgIGZyYWdtZW50Lm9yZGVyID0gY2FjaGVkZnJhZ21lbnQub3JkZXI7XHJcblxyXG4gICAgICAgIGxldCBvcHRpb246IElSZW5kZXJGcmFnbWVudDtcclxuXHJcbiAgICAgICAgaWYgKGNhY2hlZGZyYWdtZW50Lm9wdGlvbnNcclxuICAgICAgICAgICAgJiYgQXJyYXkuaXNBcnJheShjYWNoZWRmcmFnbWVudC5vcHRpb25zKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZyYWdtZW50T3B0aW9uIG9mIGNhY2hlZGZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSBuZXcgUmVuZGVyRnJhZ21lbnQoZnJhZ21lbnRPcHRpb24uaWQpO1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLm9wdGlvbiA9IGNhY2hlZGZyYWdtZW50Lm9wdGlvbjtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5pc0FuY2lsbGFyeSA9IGNhY2hlZGZyYWdtZW50LmlzQW5jaWxsYXJ5O1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLm9yZGVyID0gY2FjaGVkZnJhZ21lbnQub3JkZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9ucy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGluZGV4Q2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVGcmFnbWVudElEID0gZnJhZ21lbnQub3V0bGluZUZyYWdtZW50SUQgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uob3V0bGluZUZyYWdtZW50SUQpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGluZGV4X2NoYWluRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SUQ7XHJcblxyXG4gICAgICAgIGlmIChpbmRleF9jaGFpbkZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRFtvdXRsaW5lRnJhZ21lbnRJRF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SURbb3V0bGluZUZyYWdtZW50SURdID0gZnJhZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlQW5kTG9hZEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVGcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByYXdGcmFnbWVudCA9IGdGcmFnbWVudENvZGUucGFyc2VGcmFnbWVudChyZXNwb25zZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZUFuZExvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50LFxyXG4gICAgICAgICAgICBvdXRsaW5lRnJhZ21lbnRJRFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldFJvb3RPdXRsaW5lRnJhZ21lbnRJRDogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgcm9vdCA9IHN0YXRlLnJlbmRlclN0YXRlLnJvb3Q7XHJcblxyXG4gICAgICAgIGlmICghcm9vdCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lUm9vdCA9IHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmU/LnI7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZVJvb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJvb3QuaWQgPT09IG91dGxpbmVSb290LmYpIHtcclxuXHJcbiAgICAgICAgICAgIHJvb3Qub3V0bGluZUZyYWdtZW50SUQgPSBvdXRsaW5lUm9vdC5pO1xyXG4gICAgICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRFtyb290Lm91dGxpbmVGcmFnbWVudElEXSA9IHJvb3Q7XHJcbiAgICAgICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmN1cnJlbnRGcmFnbWVudCA9IHJvb3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiByb290Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb3V0bGluZU9wdGlvbiBvZiBvdXRsaW5lUm9vdC5vKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG91dGxpbmVPcHRpb24uZiA9PT0gb3B0aW9uLmlkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5vdXRsaW5lRnJhZ21lbnRJRCA9IG91dGxpbmVPcHRpb24uaTtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRFtvcHRpb24ub3V0bGluZUZyYWdtZW50SURdID0gb3B0aW9uO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkUm9vdEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByYXdGcmFnbWVudDogYW55LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghcmF3RnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgUmVuZGVyRnJhZ21lbnQocmF3RnJhZ21lbnQuaWQpO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50LFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJvb3QgPSBmcmFnbWVudDtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRSb290T3V0bGluZUZyYWdtZW50SUQoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJhd0ZyYWdtZW50OiBhbnksXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnRvcExldmVsTWFwS2V5ID0gcmF3RnJhZ21lbnQudG9wTGV2ZWxNYXBLZXkgPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQubWFwS2V5Q2hhaW4gPSByYXdGcmFnbWVudC5tYXBLZXlDaGFpbiA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5ndWlkZUlEID0gcmF3RnJhZ21lbnQuZ3VpZGVJRCA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5ndWlkZVBhdGggPSByYXdGcmFnbWVudC5ndWlkZVBhdGggPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQucGFyZW50RnJhZ21lbnRJRCA9IHJhd0ZyYWdtZW50LnBhcmVudEZyYWdtZW50SUQgPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQudmFsdWUgPSByYXdGcmFnbWVudC52YWx1ZSA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC52YWx1ZSA9IGZyYWdtZW50LnZhbHVlLnRyaW0oKTtcclxuICAgICAgICBmcmFnbWVudC51aS5kaXNjdXNzaW9uTG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgbGV0IG91dGxpbmVGcmFnbWVudDogSVJlbmRlck91dGxpbmVGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Lm91dGxpbmVGcmFnbWVudElEKSkge1xyXG5cclxuICAgICAgICAgICAgb3V0bGluZUZyYWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZUZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRFtmcmFnbWVudC5vdXRsaW5lRnJhZ21lbnRJRCBhcyBzdHJpbmddO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9wdGlvbjogSVJlbmRlckZyYWdtZW50O1xyXG5cclxuICAgICAgICBpZiAocmF3RnJhZ21lbnQub3B0aW9uc1xyXG4gICAgICAgICAgICAmJiBBcnJheS5pc0FycmF5KHJhd0ZyYWdtZW50Lm9wdGlvbnMpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmF3T3B0aW9uIG9mIHJhd0ZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSBsb2FkT3B0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhd09wdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lRnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9ucy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb25lRnJhZ21lbnQ6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogSVJlbmRlckZyYWdtZW50ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgY2xvbmUgPSBuZXcgUmVuZGVyRnJhZ21lbnQoZnJhZ21lbnQuaWQpO1xyXG4gICAgICAgIGNsb25lLnRvcExldmVsTWFwS2V5ID0gZnJhZ21lbnQudG9wTGV2ZWxNYXBLZXk7XHJcbiAgICAgICAgY2xvbmUubWFwS2V5Q2hhaW4gPSBmcmFnbWVudC5tYXBLZXlDaGFpbjtcclxuICAgICAgICBjbG9uZS5ndWlkZUlEID0gZnJhZ21lbnQuZ3VpZGVJRDtcclxuICAgICAgICBjbG9uZS5ndWlkZVBhdGggPSBmcmFnbWVudC5ndWlkZVBhdGg7XHJcbiAgICAgICAgY2xvbmUucGFyZW50RnJhZ21lbnRJRCA9IGZyYWdtZW50LnBhcmVudEZyYWdtZW50SUQ7XHJcbiAgICAgICAgY2xvbmUudmFsdWUgPSBmcmFnbWVudC52YWx1ZTtcclxuICAgICAgICBjbG9uZS51aS5kaXNjdXNzaW9uTG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY2xvbmUub3B0aW9uID0gZnJhZ21lbnQub3B0aW9uO1xyXG4gICAgICAgIGNsb25lLmlzQW5jaWxsYXJ5ID0gZnJhZ21lbnQuaXNBbmNpbGxhcnk7XHJcbiAgICAgICAgY2xvbmUub3JkZXIgPSBmcmFnbWVudC5vcmRlcjtcclxuXHJcbiAgICAgICAgbGV0IGNsb25lT3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgICYmIEFycmF5LmlzQXJyYXkoZnJhZ21lbnQub3B0aW9ucylcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBmcmFnbWVudE9wdGlvbiBvZiBmcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xvbmVPcHRpb24gPSBuZXcgUmVuZGVyRnJhZ21lbnQoZnJhZ21lbnRPcHRpb24uaWQpO1xyXG4gICAgICAgICAgICAgICAgY2xvbmVPcHRpb24ub3B0aW9uID0gZnJhZ21lbnRPcHRpb24ub3B0aW9uO1xyXG4gICAgICAgICAgICAgICAgY2xvbmVPcHRpb24uaXNBbmNpbGxhcnkgPSBmcmFnbWVudE9wdGlvbi5pc0FuY2lsbGFyeTtcclxuICAgICAgICAgICAgICAgIGNsb25lT3B0aW9uLm9yZGVyID0gZnJhZ21lbnRPcHRpb24ub3JkZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xvbmUub3B0aW9ucy5wdXNoKGNsb25lT3B0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNsb25lO1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZUZyYWdtZW50OiAocmVzcG9uc2U6IHN0cmluZyk6IGFueSA9PiB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICA8c2NyaXB0IHR5cGU9XFxcIm1vZHVsZVxcXCIgc3JjPVxcXCIvQHZpdGUvY2xpZW50XFxcIj48L3NjcmlwdD5cclxuICAgICAgICAgICAgICAgIDwhLS0gdHNGcmFnbWVudFJlbmRlckNvbW1lbnQge1xcXCJub2RlXFxcIjp7XFxcImlkXFxcIjpcXFwiZEJ0N0ttMk1sXFxcIixcXFwidG9wTGV2ZWxNYXBLZXlcXFwiOlxcXCJjdjFUUmwwMXJmXFxcIixcXFwibWFwS2V5Q2hhaW5cXFwiOlxcXCJjdjFUUmwwMXJmXFxcIixcXFwiZ3VpZGVJRFxcXCI6XFxcImRCdDdKTjFIZVxcXCIsXFxcImd1aWRlUGF0aFxcXCI6XFxcImM6L0dpdEh1Yi9IQUwuRG9jdW1lbnRhdGlvbi90c21hcHNUZXN0L1Rlc3RPcHRpb25zRm9sZGVyL0hvbGRlci9UZXN0T3B0aW9ucy50c21hcFxcXCIsXFxcInBhcmVudEZyYWdtZW50SURcXFwiOlxcXCJkQnQ3Sk4xdnRcXFwiLFxcXCJjaGFydEtleVxcXCI6XFxcImN2MVRSbDAxcmZcXFwiLFxcXCJvcHRpb25zXFxcIjpbXX19IC0tPlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8aDQgaWQ9XFxcIm9wdGlvbi0xLXNvbHV0aW9uXFxcIj5PcHRpb24gMSBzb2x1dGlvbjwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8cD5PcHRpb24gMSBzb2x1dGlvbjwvcD5cclxuICAgICAgICAqL1xyXG5cclxuICAgICAgICBjb25zdCBsaW5lcyA9IHJlc3BvbnNlLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICBjb25zdCByZW5kZXJDb21tZW50U3RhcnQgPSBgPCEtLSAke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50UmVuZGVyQ29tbWVudFRhZ31gO1xyXG4gICAgICAgIGNvbnN0IHJlbmRlckNvbW1lbnRFbmQgPSBgIC0tPmA7XHJcbiAgICAgICAgbGV0IGZyYWdtZW50UmVuZGVyQ29tbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgbGV0IGxpbmU6IHN0cmluZztcclxuICAgICAgICBsZXQgYnVpbGRWYWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBsaW5lID0gbGluZXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoYnVpbGRWYWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYCR7dmFsdWV9XHJcbiR7bGluZX1gO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgocmVuZGVyQ29tbWVudFN0YXJ0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGxpbmUuc3Vic3RyaW5nKHJlbmRlckNvbW1lbnRTdGFydC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgYnVpbGRWYWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRSZW5kZXJDb21tZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC50cmltKCk7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudFJlbmRlckNvbW1lbnQuZW5kc1dpdGgocmVuZGVyQ29tbWVudEVuZCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC5sZW5ndGggLSByZW5kZXJDb21tZW50RW5kLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnbWVudFJlbmRlckNvbW1lbnQgPSBmcmFnbWVudFJlbmRlckNvbW1lbnQudHJpbSgpO1xyXG4gICAgICAgIGxldCByYXdGcmFnbWVudDogYW55IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50ID0gSlNPTi5wYXJzZShmcmFnbWVudFJlbmRlckNvbW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJhd0ZyYWdtZW50LnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiByYXdGcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgbWFya09wdGlvbnNFeHBhbmRlZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbGxhcHNlRnJhZ21lbnRzT3B0aW9uczogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudFxyXG4gICAgICAgICAgICB8fCBmcmFnbWVudC5vcHRpb25zLmxlbmd0aCA9PT0gMFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBmcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBvcHRpb24udWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3dPcHRpb25Ob2RlOiAoXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY29sbGFwc2VGcmFnbWVudHNPcHRpb25zKGZyYWdtZW50KTtcclxuICAgICAgICBvcHRpb24udWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG9wdGlvbjtcclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXRGcmFnbWVudFVpczogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ3Jlc2V0RnJhZ21lbnRVaXMgY2FsbGVkJylcclxuICAgICAgICBjb25zdCBjaGFpbkZyYWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIGNoYWluRnJhZ21lbnRzKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaShjaGFpbkZyYWdtZW50c1twcm9wTmFtZV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SUQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRDtcclxuICAgICAgICBsZXQgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudDtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBmcmFnbWVudElEIGluIGluZGV4X2NoYWluRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEKSB7XHJcblxyXG4gICAgICAgICAgICBmcmFnbWVudCA9IGluZGV4X2NoYWluRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEW2ZyYWdtZW50SURdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGFsbCBvcHRpb25zIHdlcmUgY29sbGFwc2VkXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNldEZyYWdtZW50VWk6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEN1cnJlbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBwYXJlbnQuc2VsZWN0ZWQgPSBmcmFnbWVudDtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50RnJhZ21lbnQgPSBmcmFnbWVudDtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRDb2RlO1xyXG5cclxuIiwiaW1wb3J0IElIaXN0b3J5VXJsIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlVcmxcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaXN0b3J5VXJsIGltcGxlbWVudHMgSUhpc3RvcnlVcmwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVybDogc3RyaW5nO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyU25hcFNob3QgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JUmVuZGVyU25hcFNob3RcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJTbmFwU2hvdCBpbXBsZW1lbnRzIElSZW5kZXJTbmFwU2hvdCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IodXJsOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVybDogc3RyaW5nO1xyXG4gICAgcHVibGljIGd1aWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGNyZWF0ZWQ6IERhdGUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBtb2RpZmllZDogRGF0ZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGV4cGFuZGVkT3B0aW9uSURzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICBwdWJsaWMgZXhwYW5kZWRBbmNpbGxhcnlJRHM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxufVxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9IaXN0b3J5VXJsXCI7XHJcbmltcG9ydCBSZW5kZXJTbmFwU2hvdCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9SZW5kZXJTbmFwU2hvdFwiO1xyXG5pbXBvcnQgZ1V0aWxpdGllcyBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGdIaXN0b3J5Q29kZSA9IHtcclxuXHJcbiAgICByZXNldFJhdzogKCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5hdXRvZm9jdXMgPSB0cnVlO1xyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmlzQXV0b2ZvY3VzRmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBwdXNoQnJvd3Nlckhpc3RvcnlTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50RnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0hpc3RvcnlDb2RlLnJlc2V0UmF3KCk7XHJcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb247XHJcbiAgICAgICAgbGV0IGxhc3RVcmw6IHN0cmluZztcclxuXHJcbiAgICAgICAgaWYgKHdpbmRvdy5oaXN0b3J5LnN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICBsYXN0VXJsID0gd2luZG93Lmhpc3Rvcnkuc3RhdGUudXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGFzdFVybCA9IGAke2xvY2F0aW9uLm9yaWdpbn0ke2xvY2F0aW9uLnBhdGhuYW1lfSR7bG9jYXRpb24uc2VhcmNofWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuY3VycmVudEZyYWdtZW50O1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoY3VycmVudC5vdXRsaW5lRnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7bG9jYXRpb24ub3JpZ2lufSR7bG9jYXRpb24ucGF0aG5hbWV9PyR7Y3VycmVudC5vdXRsaW5lRnJhZ21lbnRJRH1gO1xyXG5cclxuICAgICAgICBpZiAobGFzdFVybFxyXG4gICAgICAgICAgICAmJiB1cmwgPT09IGxhc3RVcmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICAgICAgICAgIG5ldyBSZW5kZXJTbmFwU2hvdCh1cmwpLFxyXG4gICAgICAgICAgICBcIlwiLFxyXG4gICAgICAgICAgICB1cmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5zdGVwSGlzdG9yeS5oaXN0b3J5Q2hhaW4ucHVzaChuZXcgSGlzdG9yeVVybCh1cmwpKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdIaXN0b3J5Q29kZTtcclxuXHJcbiIsIlxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuLi9odHRwL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5cclxuXHJcbmNvbnN0IGdldEZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgIGZyYWdtZW50UGF0aDogc3RyaW5nLFxyXG4gICAgYWN0aW9uOiBBY3Rpb25UeXBlLFxyXG4gICAgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5KTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgYWN0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNvbnN0IHBhdGg6IHN0cmluZyA9IGBTdGVwLyR7c3RlcElEfWA7XHJcbiAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke2ZyYWdtZW50UGF0aH1gO1xyXG5cclxuICAgIHJldHVybiBnQXV0aGVudGljYXRlZEh0dHAoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIHBhcnNlVHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogJ3RleHQnLFxyXG4gICAgICAgIGFjdGlvbjogbG9hZEFjdGlvbixcclxuICAgICAgICBlcnJvcjogKHN0YXRlOiBJU3RhdGUsIGVycm9yRGV0YWlsczogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBhbGVydChge1xyXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgZ2V0dGluZyBmcmFnbWVudCBmcm9tIHRoZSBzZXJ2ZXIsIHBhdGg6ICR7ZnJhZ21lbnRQYXRofSwgaWQ6ICR7ZnJhZ21lbnRJRH1cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRGcmFnbWVudC5uYW1lfSxcclxuICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGdGcmFnbWVudEVmZmVjdHMgPSB7XHJcblxyXG4gICAgLy8gZ2V0Um9vdFN0ZXA6IChcclxuICAgIC8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgLy8gICAgIHJvb3RJRDogc3RyaW5nKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgIC8vICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybjtcclxuICAgIC8vICAgICB9XHJcblxyXG4gICAgLy8gICAgIHJldHVybiBnZXRTdGVwKFxyXG4gICAgLy8gICAgICAgICBzdGF0ZSxcclxuICAgIC8vICAgICAgICAgcm9vdElELFxyXG4gICAgLy8gICAgICAgICAnMCcsXHJcbiAgICAvLyAgICAgICAgIEFjdGlvblR5cGUuR2V0Um9vdCxcclxuICAgIC8vICAgICAgICAgZ1N0ZXBBY3Rpb25zLmxvYWRSb290U3RlcFxyXG4gICAgLy8gICAgICk7XHJcbiAgICAvLyB9LFxyXG5cclxuICAgIGdldEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBmcmFnbWVudFBhdGg6IHN0cmluZ1xyXG4gICAgKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkgPSAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbi5pZCxcclxuICAgICAgICAgICAgZnJhZ21lbnRQYXRoLFxyXG4gICAgICAgICAgICBBY3Rpb25UeXBlLkdldEZyYWdtZW50LFxyXG4gICAgICAgICAgICBsb2FkQWN0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIGZyYWdtZW50UGF0aDogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVGcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5ID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVGcmFnbWVudElEXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRJRCxcclxuICAgICAgICAgICAgZnJhZ21lbnRQYXRoLFxyXG4gICAgICAgICAgICBBY3Rpb25UeXBlLkdldENoYWluRnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGxvYWRBY3Rpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBnZXRBbmNpbGxhcnk6IChcclxuICAgIC8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgLy8gICAgIHN0ZXBJRDogc3RyaW5nLFxyXG4gICAgLy8gICAgIHBhcmVudENoYWluSUQ6IHN0cmluZyxcclxuICAgIC8vICAgICB1aUlEOiBudW1iZXIpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IGxvYWRBY3Rpb246IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSA9IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiB7XHJcblxyXG4gICAgLy8gICAgICAgICBjb25zdCBjaGFpblJlc3BvbnNlID0ge1xyXG4gICAgLy8gICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAvLyAgICAgICAgICAgICBwYXJlbnRDaGFpbklELFxyXG4gICAgLy8gICAgICAgICAgICAgdWlJRFxyXG4gICAgLy8gICAgICAgICB9O1xyXG5cclxuICAgIC8vICAgICAgICAgcmV0dXJuIGdTdGVwQWN0aW9ucy5sb2FkQW5jaWxsYXJ5KFxyXG4gICAgLy8gICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAvLyAgICAgICAgICAgICBjaGFpblJlc3BvbnNlXHJcbiAgICAvLyAgICAgICAgICk7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgcmV0dXJuIGdldFN0ZXAoXHJcbiAgICAvLyAgICAgICAgIHN0YXRlLFxyXG4gICAgLy8gICAgICAgICBzdGVwSUQsXHJcbiAgICAvLyAgICAgICAgIHBhcmVudENoYWluSUQsXHJcbiAgICAvLyAgICAgICAgIEFjdGlvblR5cGUuR2V0U3RlcCxcclxuICAgIC8vICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgLy8gICAgICk7XHJcbiAgICAvLyB9LFxyXG5cclxuICAgIC8vIGdldEFuY2lsbGFyeVN0ZXA6IChcclxuICAgIC8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgLy8gICAgIHN0ZXBJRDogc3RyaW5nLFxyXG4gICAgLy8gICAgIHBhcmVudENoYWluSUQ6IHN0cmluZyxcclxuICAgIC8vICAgICB1aUlEOiBudW1iZXIpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgLy8gICAgIGNvbnN0IGxvYWRBY3Rpb246IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSA9IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiB7XHJcblxyXG4gICAgLy8gICAgICAgICBjb25zdCBjaGFpblJlc3BvbnNlID0ge1xyXG4gICAgLy8gICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAvLyAgICAgICAgICAgICBwYXJlbnRDaGFpbklELFxyXG4gICAgLy8gICAgICAgICAgICAgdWlJRFxyXG4gICAgLy8gICAgICAgICB9O1xyXG5cclxuICAgIC8vICAgICAgICAgcmV0dXJuIGdTdGVwQWN0aW9ucy5sb2FkQW5jaWxsYXJ5Q2hhaW5TdGVwKFxyXG4gICAgLy8gICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAvLyAgICAgICAgICAgICBjaGFpblJlc3BvbnNlXHJcbiAgICAvLyAgICAgICAgICk7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgcmV0dXJuIGdldFN0ZXAoXHJcbiAgICAvLyAgICAgICAgIHN0YXRlLFxyXG4gICAgLy8gICAgICAgICBzdGVwSUQsXHJcbiAgICAvLyAgICAgICAgIHBhcmVudENoYWluSUQsXHJcbiAgICAvLyAgICAgICAgIEFjdGlvblR5cGUuR2V0U3RlcCxcclxuICAgIC8vICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgLy8gICAgICk7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRFZmZlY3RzO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdIaXN0b3J5Q29kZSBmcm9tIFwiLi4vY29kZS9nSGlzdG9yeUNvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50RWZmZWN0cyBmcm9tIFwiLi4vZWZmZWN0cy9nRnJhZ21lbnRFZmZlY3RzXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5jb25zdCBnRnJhZ21lbnRBY3Rpb25zID0ge1xyXG5cclxuICAgIHNob3dPcHRpb25Ob2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghb3B0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLm1hcmtPcHRpb25zRXhwYW5kZWQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEN1cnJlbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0hpc3RvcnlDb2RlLnB1c2hCcm93c2VySGlzdG9yeVN0YXRlKHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmhpZGVCYW5uZXIgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50UGF0aCA9IGAke3N0YXRlLnJlbmRlclN0YXRlLmd1aWRlPy5mcmFnbWVudEZvbGRlclVybH0vJHtvcHRpb24uaWR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGdGcmFnbWVudEVmZmVjdHMuZ2V0RnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50UGF0aFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgXTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8IFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG9wdGlvbi5vdXRsaW5lRnJhZ21lbnRJRClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgICAgICBvcHRpb24ub3V0bGluZUZyYWdtZW50SUQgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZENoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3V0bGluZUZyYWdtZW50SUQ6IHN0cmluZ1xyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50RnJhZ21lbnRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UudGV4dERhdGEsXHJcbiAgICAgICAgICAgIG91dGxpbmVGcmFnbWVudElEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZGluZ0NoYWluQ2FjaGVfT3V0bGluZUZyYWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLmxvYWRpbmdDaGFpbkNhY2hlX091dGxpbmVGcmFnbWVudHM7XHJcblxyXG4gICAgICAgIGlmIChsb2FkaW5nQ2hhaW5DYWNoZV9PdXRsaW5lRnJhZ21lbnRzKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXh0T3V0bGluZUZyYWdtZW50ID0gbG9hZGluZ0NoYWluQ2FjaGVfT3V0bGluZUZyYWdtZW50cy5hdCgtMSkgPz8gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXh0T3V0bGluZUZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50RnJhZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50RnJhZ21lbnQ7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBleHBhbmRlZE9wdGlvbjogSVJlbmRlckZyYWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SURbbmV4dE91dGxpbmVGcmFnbWVudC5pXTtcclxuICAgICAgICAgICAgICAgIGV4cGFuZGVkT3B0aW9uLnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnNob3dPcHRpb25Ob2RlKFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkT3B0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGdGcmFnbWVudENvZGUuc2V0Q3VycmVudChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50RnJhZ21lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwYW5kZWRPcHRpb25cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZyYWdtZW50QWN0aW9ucztcclxuIiwiaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSUZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9wYXlsb2Fkcy9JRnJhZ21lbnRQYXlsb2FkXCI7XHJcblxyXG5cclxuY29uc3QgZnJhZ21lbnRBY3Rpb25zID0ge1xyXG5cclxuICAgIGV4cGFuZE9wdGlvbnM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhZnJhZ21lbnRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkucmF3ID0gZmFsc2U7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWlzKHN0YXRlKTtcclxuICAgICAgICBjb25zdCBleHBhbmRlZCA9IGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkICE9PSB0cnVlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLm9wdGlvbnNFeHBhbmRlZCA9IGV4cGFuZGVkO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZXhwYW5kZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBoaWRlT3B0aW9uczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFmcmFnbWVudFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5yYXcgPSBmYWxzZTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGF5bG9hZDogSUZyYWdtZW50UGF5bG9hZFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFwYXlsb2FkPy5wYXJlbnRGcmFnbWVudFxyXG4gICAgICAgICAgICB8fCAhcGF5bG9hZD8ub3B0aW9uXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLnJhdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5zaG93T3B0aW9uTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHBheWxvYWQucGFyZW50RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHBheWxvYWQub3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZyYWdtZW50QWN0aW9ucztcclxuIiwiaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJRnJhZ21lbnRQYXlsb2FkIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL3BheWxvYWRzL0lGcmFnbWVudFBheWxvYWRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGcmFnbWVudFBheWxvYWQgaW1wbGVtZW50cyBJRnJhZ21lbnRQYXlsb2FkIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50RnJhZ21lbnQgPSBwYXJlbnRGcmFnbWVudDtcclxuICAgICAgICB0aGlzLm9wdGlvbiA9IG9wdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudDtcclxuICAgIHB1YmxpYyBvcHRpb246IElSZW5kZXJGcmFnbWVudDtcclxufVxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiwgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9mcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IEZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvdWkvcGF5bG9hZHMvRnJhZ21lbnRQYXlsb2FkXCI7XHJcblxyXG5pbXBvcnQgXCIuLi9zY3NzL2ZyYWdtZW50cy5zY3NzXCI7XHJcblxyXG5cclxuY29uc3QgQnVpbGRFeHBhbmRlZE9wdGlvblZpZXcgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFvcHRpb25cclxuICAgICAgICB8fCBvcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItb3B0aW9uLWJveFwiIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1vcHRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd246IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5zaG93T3B0aW9uTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnJhZ21lbnRQYXlsb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwge30sIG9wdGlvbi5vcHRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3ID0gKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvblZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcbiAgICBsZXQgb3B0aW9uVmV3OiBWTm9kZSB8IG51bGw7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBvcHRpb25WZXcgPSBCdWlsZEV4cGFuZGVkT3B0aW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25WZXcpIHtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvblZpZXdzLnB1c2gob3B0aW9uVmV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG9wdGlvbnNDbGFzc2VzID0gXCJudC1mci1mcmFnbWVudC1vcHRpb25zXCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LnNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgIG9wdGlvbnNDbGFzc2VzID0gYCR7b3B0aW9uc0NsYXNzZXN9IG50LWZyLWZyYWdtZW50LWNoYWluYFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7b3B0aW9uc0NsYXNzZXN9YCxcclxuICAgICAgICAgICAgICAgIHRhYmluZGV4OiAwLFxyXG4gICAgICAgICAgICAgICAgb25CbHVyOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLmhpZGVPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4gZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSwgW1xyXG5cclxuICAgICAgICAgICAgb3B0aW9uVmlld3NcclxuICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkQ29sbGFwc2VkT3B0aW9uc1ZpZXcgPSAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFzczogYG50LWZyLWZyYWdtZW50LW9wdGlvbnMgbnQtZnItY29sbGFwc2VkYCxcclxuICAgICAgICAgICAgICAgIG9uTW91c2VEb3duOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLmV4cGFuZE9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgKF9ldmVudDogYW55KSA9PiBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwic3BhblwiLCB7IGNsYXNzOiBgbnQtZnItb3B0aW9uLXNlbGVjdGVkYCB9LCBgJHtmcmFnbWVudC5zZWxlY3RlZD8ub3B0aW9ufWApLFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkT3B0aW9uc1ZpZXcgPSAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgfHwgZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDBcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICByZXR1cm4gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGJ1aWxkRXhwYW5kZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEZyYWdtZW50VmlldyA9IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCk6IENoaWxkcmVuW10gPT4ge1xyXG5cclxuICAgIGlmICghZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZyYWdtZW50RUxlbWVudElEID0gZ0ZyYWdtZW50Q29kZS5nZXRGcmFnbWVudEVsZW1lbnRJRChmcmFnbWVudC5pZCk7XHJcblxyXG4gICAgY29uc3QgdmlldzogQ2hpbGRyZW5bXSA9IFtcclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7ZnJhZ21lbnRFTGVtZW50SUR9YCxcclxuICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWZyYWdtZW50LWJveFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBgbnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1kaXNjdXNzaW9uXCI6IGZyYWdtZW50LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcIlwiXHJcbiAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgIGJ1aWxkT3B0aW9uc1ZpZXcoZnJhZ21lbnQpXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApLFxyXG5cclxuICAgICAgICBidWlsZEZyYWdtZW50VmlldyhmcmFnbWVudC5zZWxlY3RlZClcclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBmcmFnbWVudFZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkQ29udGVudFZpZXc6IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgaWQ6IFwibnRfZnJfRnJhZ21lbnRzXCIgfSwgW1xyXG5cclxuICAgICAgICAgICAgICAgIGJ1aWxkRnJhZ21lbnRWaWV3KHN0YXRlLnJlbmRlclN0YXRlLnJvb3QpXHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZyYWdtZW50Vmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgaW5pdEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvaW5pdEFjdGlvbnNcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4uLy4uL2ZyYWdtZW50cy92aWV3cy9mcmFnbWVudFZpZXdzXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdFZpZXcgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGluaXRBY3Rpb25zLnNldE5vdFJhdyxcclxuICAgICAgICAgICAgICAgICAgICBpZDogXCJ0cmVlU29sdmVGcmFnbWVudHNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudFZpZXdzLmJ1aWxkQ29udGVudFZpZXcoc3RhdGUpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFZpZXc7XHJcblxyXG4iLCJpbXBvcnQgSVNldHRpbmdzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVNldHRpbmdzXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0dGluZ3MgaW1wbGVtZW50cyBJU2V0dGluZ3Mge1xyXG5cclxuICAgIHB1YmxpYyBrZXk6IHN0cmluZyA9IFwiLTFcIjtcclxuICAgIHB1YmxpYyByOiBzdHJpbmcgPSBcIi0xXCI7XHJcblxyXG4gICAgLy8gQXV0aGVudGljYXRpb25cclxuICAgIHB1YmxpYyB1c2VyUGF0aDogc3RyaW5nID0gYHVzZXJgO1xyXG4gICAgcHVibGljIGRlZmF1bHRMb2dvdXRQYXRoOiBzdHJpbmcgPSBgbG9nb3V0YDtcclxuICAgIHB1YmxpYyBkZWZhdWx0TG9naW5QYXRoOiBzdHJpbmcgPSBgbG9naW5gO1xyXG4gICAgcHVibGljIHJldHVyblVybFN0YXJ0OiBzdHJpbmcgPSBgcmV0dXJuVXJsYDtcclxuXHJcbiAgICBwcml2YXRlIGJhc2VVcmw6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfQkFTRV9VUkwgPz8gJyc7XHJcbiAgICBwdWJsaWMgbGlua1VybDogc3RyaW5nID0gKHdpbmRvdyBhcyBhbnkpLkFTU0lTVEFOVF9MSU5LX1VSTCA/PyAnJztcclxuICAgIHB1YmxpYyBzdWJzY3JpcHRpb25JRDogc3RyaW5nID0gKHdpbmRvdyBhcyBhbnkpLkFTU0lTVEFOVF9TVUJTQ1JJUFRJT05fSUQgPz8gJyc7XHJcblxyXG4gICAgcHVibGljIGFwaVVybDogc3RyaW5nID0gYCR7dGhpcy5iYXNlVXJsfS9hcGlgO1xyXG4gICAgcHVibGljIGJmZlVybDogc3RyaW5nID0gYCR7dGhpcy5iYXNlVXJsfS9iZmZgO1xyXG4gICAgcHVibGljIGZpbGVVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vZmlsZWA7XHJcbn1cclxuIiwiXHJcbmV4cG9ydCBlbnVtIG5hdmlnYXRpb25EaXJlY3Rpb24ge1xyXG5cclxuICAgIEJ1dHRvbnMgPSAnYnV0dG9ucycsXHJcbiAgICBCYWNrd2FyZHMgPSAnYmFja3dhcmRzJyxcclxuICAgIEZvcndhcmRzID0gJ2ZvcndhcmRzJ1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBuYXZpZ2F0aW9uRGlyZWN0aW9uIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvbmF2aWdhdGlvbkRpcmVjdGlvblwiO1xyXG5pbXBvcnQgSUhpc3RvcnkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVwiO1xyXG5pbXBvcnQgSUhpc3RvcnlVcmwgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVVybFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpc3RvcnkgaW1wbGVtZW50cyBJSGlzdG9yeSB7XHJcblxyXG4gICAgcHVibGljIGhpc3RvcnlDaGFpbjogQXJyYXk8SUhpc3RvcnlVcmw+ID0gW107XHJcbiAgICBwdWJsaWMgZGlyZWN0aW9uOiBuYXZpZ2F0aW9uRGlyZWN0aW9uID0gbmF2aWdhdGlvbkRpcmVjdGlvbi5CdXR0b25zO1xyXG4gICAgcHVibGljIGN1cnJlbnRJbmRleDogbnVtYmVyID0gMDtcclxufVxyXG4iLCJpbXBvcnQgSVVzZXIgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdXNlci9JVXNlclwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVzZXIgaW1wbGVtZW50cyBJVXNlciB7XHJcblxyXG4gICAgcHVibGljIGtleTogc3RyaW5nID0gYDAxMjM0NTY3ODlgO1xyXG4gICAgcHVibGljIHI6IHN0cmluZyA9IFwiLTFcIjtcclxuICAgIHB1YmxpYyB1c2VWc0NvZGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGF1dGhvcmlzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyByYXc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGxvZ291dFVybDogc3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBzaG93TWVudTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG5hbWU6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgc3ViOiBzdHJpbmcgPSBcIlwiO1xyXG59XHJcbiIsImltcG9ydCBJUmVwZWF0RWZmZWN0cyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lSZXBlYXRFZmZlY3RzXCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBJQWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lBY3Rpb25cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBlYXRlRWZmZWN0cyBpbXBsZW1lbnRzIElSZXBlYXRFZmZlY3RzIHtcclxuXHJcbiAgICBwdWJsaWMgc2hvcnRJbnRlcnZhbEh0dHA6IEFycmF5PElIdHRwRWZmZWN0PiA9IFtdO1xyXG4gICAgcHVibGljIHJlTG9hZEdldEh0dHBJbW1lZGlhdGU6IEFycmF5PElIdHRwRWZmZWN0PiA9IFtdO1xyXG4gICAgcHVibGljIHJ1bkFjdGlvbkltbWVkaWF0ZTogQXJyYXk8SUFjdGlvbj4gPSBbXTtcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlclN0YXRlVUkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlclN0YXRlVUlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJTdGF0ZVVJIGltcGxlbWVudHMgSVJlbmRlclN0YXRlVUkge1xyXG5cclxuICAgIHB1YmxpYyByYXc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIG9wdGlvbnNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVJlbmRlclN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlckd1aWRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVGcmFnbWVudCBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlVUkgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlclN0YXRlVUlcIjtcclxuaW1wb3J0IFJlbmRlclN0YXRlVUkgZnJvbSBcIi4vdWkvUmVuZGVyU3RhdGVVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlclN0YXRlIGltcGxlbWVudHMgSVJlbmRlclN0YXRlIHtcclxuXHJcbiAgICBwdWJsaWMgZ3VpZGU6IElSZW5kZXJHdWlkZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHJvb3Q6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGN1cnJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgb3V0bGluZTogSVJlbmRlck91dGxpbmUgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgbG9hZGluZ0NoYWluQ2FjaGVfT3V0bGluZUZyYWdtZW50czogQXJyYXk8SVJlbmRlck91dGxpbmVGcmFnbWVudD4gfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAvLyBTZWFyY2ggaW5kaWNlc1xyXG4gICAgcHVibGljIGluZGV4X291dGxpbmVGcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SUQ6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIGluZGV4X2NoYWluRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEOiBhbnkgPSB7fTtcclxuICAgIHB1YmxpYyBpbmRleF9yYXdGcmFnbWVudHNfZnJhZ21lbnRJRDogYW55ID0ge307XHJcblxyXG4gICAgcHVibGljIHVpOiBJUmVuZGVyU3RhdGVVSSA9IG5ldyBSZW5kZXJTdGF0ZVVJKCk7XHJcbn1cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IFNldHRpbmdzIGZyb20gXCIuL3VzZXIvU2V0dGluZ3NcIjtcclxuaW1wb3J0IElTZXR0aW5ncyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lTZXR0aW5nc1wiO1xyXG5pbXBvcnQgSUhpc3RvcnkgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVwiO1xyXG5pbXBvcnQgU3RlcEhpc3RvcnkgZnJvbSBcIi4vaGlzdG9yeS9IaXN0b3J5XCI7XHJcbmltcG9ydCBJVXNlciBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lVc2VyXCI7XHJcbmltcG9ydCBVc2VyIGZyb20gXCIuL3VzZXIvVXNlclwiO1xyXG5pbXBvcnQgSVJlcGVhdEVmZmVjdHMgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JUmVwZWF0RWZmZWN0c1wiO1xyXG5pbXBvcnQgUmVwZWF0ZUVmZmVjdHMgZnJvbSBcIi4vZWZmZWN0cy9SZXBlYXRlRWZmZWN0c1wiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lSZW5kZXJTdGF0ZVwiO1xyXG5pbXBvcnQgUmVuZGVyU3RhdGUgZnJvbSBcIi4vUmVuZGVyU3RhdGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0ZSBpbXBsZW1lbnRzIElTdGF0ZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNldHRpbmdzOiBJU2V0dGluZ3MgPSBuZXcgU2V0dGluZ3MoKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3dNZW51OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgc2hvd1NvbHV0aW9uc01lbnU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyB0d2l0dGVyVXJsOiBzdHJpbmcgPSAnaHR0cHM6Ly90d2l0dGVyLmNvbS9uZXRvZnRyZWVzJztcclxuICAgIHB1YmxpYyBsaW5rZWRpblVybDogc3RyaW5nID0gJ2h0dHBzOi8vd3d3LmxpbmtlZGluLmNvbS9jb21wYW55L25ldG9mdHJlZXMvYWJvdXQnO1xyXG5cclxuICAgIHB1YmxpYyBsb2FkaW5nOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgZ2VuZXJpY0Vycm9yOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgbmV4dEtleTogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBzZXR0aW5nczogSVNldHRpbmdzO1xyXG4gICAgcHVibGljIHVzZXI6IElVc2VyID0gbmV3IFVzZXIoKTtcclxuICAgIFxyXG4gICAgcHVibGljIHJlbmRlclN0YXRlOiBJUmVuZGVyU3RhdGUgPSBuZXcgUmVuZGVyU3RhdGUoKTtcclxuXHJcbiAgICBwdWJsaWMgcmVwZWF0RWZmZWN0czogSVJlcGVhdEVmZmVjdHMgPSBuZXcgUmVwZWF0ZUVmZmVjdHMoKTtcclxuXHJcbiAgICBwdWJsaWMgc3RlcEhpc3Rvcnk6IElIaXN0b3J5ID0gbmV3IFN0ZXBIaXN0b3J5KCk7XHJcbn1cclxuXHJcblxyXG4iLCJcclxuZXhwb3J0IGVudW0gU2Nyb2xsSG9wVHlwZSB7XHJcbiAgICBOb25lID0gXCJub25lXCIsXHJcbiAgICBVcCA9IFwidXBcIixcclxuICAgIERvd24gPSBcImRvd25cIlxyXG59XHJcbiIsImltcG9ydCB7IFNjcm9sbEhvcFR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9TY3JvbGxIb3BUeXBlXCI7XHJcbmltcG9ydCBJU2NyZWVuIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3dpbmRvdy9JU2NyZWVuXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NyZWVuIGltcGxlbWVudHMgSVNjcmVlbiB7XHJcblxyXG4gICAgcHVibGljIGF1dG9mb2N1czogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzQXV0b2ZvY3VzRmlyc3RSdW46IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGhpZGVCYW5uZXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBzY3JvbGxUb1RvcDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNjcm9sbFRvRWxlbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2Nyb2xsSG9wOiBTY3JvbGxIb3BUeXBlID0gU2Nyb2xsSG9wVHlwZS5Ob25lO1xyXG4gICAgcHVibGljIGxhc3RTY3JvbGxZOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyB1YTogYW55IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElTY3JlZW4gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lTY3JlZW5cIjtcclxuaW1wb3J0IElUcmVlU29sdmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lUcmVlU29sdmVcIjtcclxuaW1wb3J0IFNjcmVlbiBmcm9tIFwiLi9TY3JlZW5cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmVlU29sdmUgaW1wbGVtZW50cyBJVHJlZVNvbHZlIHtcclxuXHJcbiAgICBwdWJsaWMgcmVuZGVyaW5nQ29tbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2NyZWVuOiBJU2NyZWVuID0gbmV3IFNjcmVlbigpO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyT3V0bGluZUZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUZyYWdtZW50XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyT3V0bGluZUZyYWdtZW50IGltcGxlbWVudHMgSVJlbmRlck91dGxpbmVGcmFnbWVudCB7XHJcblxyXG4gICAgcHVibGljIGk6IHN0cmluZyA9ICcnOyAvLyBpZFxyXG4gICAgcHVibGljIGY6IHN0cmluZyA9ICcnOyAvLyBmcmFnbWVudCBpZFxyXG4gICAgcHVibGljIGM6IHN0cmluZyA9ICcnOyAvLyBjaGFydCBpZCBmcm9tIG91dGxpbmUgY2hhcnQgYXJyYXlcclxuICAgIHB1YmxpYyBvOiBBcnJheTxJUmVuZGVyT3V0bGluZUZyYWdtZW50PiA9IFtdOyAvLyBvcHRpb25zXHJcbiAgICBwdWJsaWMgcGFyZW50OiBJUmVuZGVyT3V0bGluZUZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVGcmFnbWVudFwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZUZyYWdtZW50IGZyb20gXCIuL1JlbmRlck91dGxpbmVGcmFnbWVudFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlck91dGxpbmUgaW1wbGVtZW50cyBJUmVuZGVyT3V0bGluZSB7XHJcblxyXG4gICAgcHVibGljIHY6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHI6IElSZW5kZXJPdXRsaW5lRnJhZ21lbnQgPSBuZXcgUmVuZGVyT3V0bGluZUZyYWdtZW50KCk7XHJcbiAgICBwdWJsaWMgYzogQXJyYXk8SVJlbmRlck91dGxpbmVDaGFydD4gPSBbXTtcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlck91dGxpbmVDaGFydCBpbXBsZW1lbnRzIElSZW5kZXJPdXRsaW5lQ2hhcnQge1xyXG5cclxuICAgIHB1YmxpYyBpOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBwOiBzdHJpbmcgPSAnJztcclxufVxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUZyYWdtZW50XCI7XHJcbmltcG9ydCBSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBSZW5kZXJPdXRsaW5lRnJhZ21lbnQgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lRnJhZ21lbnRcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4vZ0ZyYWdtZW50Q29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGxvYWRGcmFnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByYXdGcmFnbWVudDogYW55LFxyXG4gICAgcGFyZW50OiBJUmVuZGVyT3V0bGluZUZyYWdtZW50IHwgbnVsbCA9IG51bGxcclxuKTogSVJlbmRlck91dGxpbmVGcmFnbWVudCA9PiB7XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgUmVuZGVyT3V0bGluZUZyYWdtZW50KCk7XHJcbiAgICBmcmFnbWVudC5pID0gcmF3RnJhZ21lbnQuaTtcclxuICAgIGZyYWdtZW50LmYgPSByYXdGcmFnbWVudC5mO1xyXG4gICAgZnJhZ21lbnQucGFyZW50ID0gcGFyZW50O1xyXG4gICAgc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZUZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRFtmcmFnbWVudC5pXSA9IGZyYWdtZW50O1xyXG5cclxuICAgIGlmIChyYXdGcmFnbWVudC5vXHJcbiAgICAgICAgJiYgQXJyYXkuaXNBcnJheShyYXdGcmFnbWVudC5vKSA9PT0gdHJ1ZVxyXG4gICAgICAgICYmIHJhd0ZyYWdtZW50Lm8ubGVuZ3RoID4gMFxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IG86IElSZW5kZXJPdXRsaW5lRnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHJhd0ZyYWdtZW50Lm8pIHtcclxuXHJcbiAgICAgICAgICAgIG8gPSBsb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBmcmFnbWVudC5vLnB1c2gobyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmcmFnbWVudDtcclxufTtcclxuXHJcbmNvbnN0IGxvYWRDaGFydHMgPSAoXHJcbiAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgIHJhd091dGxpbmVDaGFydHM6IEFycmF5PGFueT5cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgb3V0bGluZS5jID0gW107XHJcbiAgICBsZXQgYzogSVJlbmRlck91dGxpbmVDaGFydDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGNoYXJ0IG9mIHJhd091dGxpbmVDaGFydHMpIHtcclxuXHJcbiAgICAgICAgYyA9IG5ldyBSZW5kZXJPdXRsaW5lQ2hhcnQoKTtcclxuICAgICAgICBjLmkgPSBjaGFydC5pO1xyXG4gICAgICAgIGMucCA9IGNoYXJ0LnA7XHJcbiAgICAgICAgb3V0bGluZS5jLnB1c2goYyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnT3V0bGluZUNvZGUgPSB7XHJcblxyXG4gICAgZ2V0T3V0bGluZUZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IElSZW5kZXJPdXRsaW5lRnJhZ21lbnQgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lRnJhZ21lbnRzX291dGxpbmVGcmFnbWVudElEW2ZyYWdtZW50SURdO1xyXG5cclxuICAgICAgICByZXR1cm4gZnJhZ21lbnQgPz8gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0T3V0bGluZUZyYWdtZW50Q2hhaW46IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50SUQ6IHN0cmluZ1xyXG4gICAgKTogQXJyYXk8c3RyaW5nPiA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50SURzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICAgICAgbGV0IGZyYWdtZW50OiBJUmVuZGVyT3V0bGluZUZyYWdtZW50IHwgbnVsbDtcclxuXHJcbiAgICAgICAgd2hpbGUgKGZyYWdtZW50SUQpIHtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50ID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRJRFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50SUQgPSBmcmFnbWVudC5pO1xyXG4gICAgICAgICAgICBmcmFnbWVudElEcy5wdXNoKGZyYWdtZW50SUQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZyYWdtZW50SURzO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkT3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByYXdPdXRsaW5lID0gb3V0bGluZVJlc3BvbnNlLmpzb25EYXRhO1xyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBuZXcgUmVuZGVyT3V0bGluZSgpO1xyXG4gICAgICAgIG91dGxpbmUudiA9IHJhd091dGxpbmUudjtcclxuXHJcbiAgICAgICAgaWYgKHJhd091dGxpbmUuY1xyXG4gICAgICAgICAgICAmJiBBcnJheS5pc0FycmF5KHJhd091dGxpbmUuYykgPT09IHRydWVcclxuICAgICAgICAgICAgJiYgcmF3T3V0bGluZS5jLmxlbmd0aCA+IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgbG9hZENoYXJ0cyhcclxuICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICByYXdPdXRsaW5lLmNcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dGxpbmUudiA9IHJhd091dGxpbmUudjtcclxuXHJcbiAgICAgICAgb3V0bGluZS5yID0gbG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSwgXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUuclxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmUgPSBvdXRsaW5lO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnNldFJvb3RPdXRsaW5lRnJhZ21lbnRJRChzdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnT3V0bGluZUNvZGU7XHJcblxyXG4iLCJpbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVGcmFnbWVudFwiO1xyXG5pbXBvcnQgZ091dGxpbmVDb2RlIGZyb20gXCIuLi9jb2RlL2dPdXRsaW5lQ29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRFZmZlY3RzIGZyb20gXCIuLi9lZmZlY3RzL2dGcmFnbWVudEVmZmVjdHNcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGdPdXRsaW5lQWN0aW9ucyA9IHtcclxuXHJcbiAgICBsb2FkT3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRPdXRsaW5lQW5kUmVxdWVzdEZyYWdtZW50czogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgbGFzdE91dGxpbmVGcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmwgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5ndWlkZT8uZnJhZ21lbnRGb2xkZXJVcmw7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkT3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIEZpbmQgb3V0bGluZWZyYWdtZW50IHdpdGggaWQgPSBsYXN0RnJhZ21lbnRJRDtcclxuICAgICAgICAvLyBUaGVuIHdhbGsgdXAgdGhyb3VnaCB0aGUgcGFyZW50cywgbG9hZGluZyBlYWNoIGluIHR1cm4gdW50aWwgcmVhY2hpbmcgcm9vdFxyXG5cclxuICAgICAgICBsZXQgY2hhaW5PdXRsaW5lRnJhZ21lbnRzOiBBcnJheTxJUmVuZGVyT3V0bGluZUZyYWdtZW50PiA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgb3V0bGluZUZyYWdtZW50ID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxhc3RPdXRsaW5lRnJhZ21lbnRJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHdoaWxlIChvdXRsaW5lRnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGNoYWluT3V0bGluZUZyYWdtZW50cy5wdXNoKG91dGxpbmVGcmFnbWVudCk7XHJcbiAgICAgICAgICAgIG91dGxpbmVGcmFnbWVudCA9IG91dGxpbmVGcmFnbWVudC5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjaGFpbk91dGxpbmVGcmFnbWVudHMucG9wKCk7IC8vIFJlbW92ZSBhcyB0aGlzIGlzIHRoZSByb290IGFuZCBpcyBhbHJlYWR5IGxvYWRlZCB3aXRoIHRoZSBndWlkZVxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmxvYWRpbmdDaGFpbkNhY2hlX091dGxpbmVGcmFnbWVudHMgPSBjaGFpbk91dGxpbmVGcmFnbWVudHM7XHJcbiAgICAgICAgY29uc3QgaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SUQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19vdXRsaW5lRnJhZ21lbnRJRDtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRMb2FkRWZmZWN0czogQXJyYXk8SUh0dHBGZXRjaEl0ZW0+ID0gW107XHJcbiAgICAgICAgbGV0IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQ7XHJcbiAgICAgICAgbGV0IGZyYWdtZW50UGF0aDogc3RyaW5nO1xyXG4gICAgICAgIGxldCBsb2FkRnJhZ21lbnRFZmZlY3Q6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gY2hhaW5PdXRsaW5lRnJhZ21lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICAgICAgICBvdXRsaW5lRnJhZ21lbnQgPSBjaGFpbk91dGxpbmVGcmFnbWVudHNbaV07XHJcbiAgICAgICAgICAgIGZyYWdtZW50ID0gaW5kZXhfY2hhaW5GcmFnbWVudHNfb3V0bGluZUZyYWdtZW50SURbb3V0bGluZUZyYWdtZW50LmZdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICAmJiBmcmFnbWVudC51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50UGF0aCA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke291dGxpbmVGcmFnbWVudC5mfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgICAgICAgICBsb2FkRnJhZ21lbnRFZmZlY3QgPSBnRnJhZ21lbnRFZmZlY3RzLmdldENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVGcmFnbWVudC5mLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRQYXRoLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZUZyYWdtZW50LmlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2FkRnJhZ21lbnRFZmZlY3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudExvYWRFZmZlY3RzLnB1c2gobG9hZEZyYWdtZW50RWZmZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50TG9hZEVmZmVjdHNcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ091dGxpbmVBY3Rpb25zO1xyXG4iLCJcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuLi9odHRwL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ1JlbmRlckFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ091dGxpbmVBY3Rpb25zXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcblxyXG5cclxuY29uc3QgZ2V0R3VpZGVPdXRsaW5lID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGxvYWREZWxlZ2F0ZTogKHN0YXRlOiBJU3RhdGUsIG91dGxpbmVSZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheVxyXG4pOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5ndWlkZT8ucGF0aCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGNhbGxJRCxcclxuICAgICAgICBBY3Rpb25UeXBlLkdldE91dGxpbmVcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyA9IHN0YXRlLnJlbmRlclN0YXRlLmd1aWRlLmZyYWdtZW50Rm9sZGVyVXJsID8/ICdudWxsJztcclxuICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3BvbnNlOiAnanNvbicsXHJcbiAgICAgICAgYWN0aW9uOiBsb2FkRGVsZWdhdGUsXHJcbiAgICAgICAgZXJyb3I6IChzdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgYWxlcnQoYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgb3V0bGluZSBkYXRhIGZyb20gdGhlIHNlcnZlci5cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUubmFtZX0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuY29uc3QgZ1JlbmRlckVmZmVjdHMgPSB7XHJcblxyXG4gICAgZ2V0R3VpZGVPdXRsaW5lOiAoc3RhdGU6IElTdGF0ZSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ2V0R3VpZGVPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZ1JlbmRlckFjdGlvbnMubG9hZE91dGxpbmVcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRHdWlkZU91dGxpbmVBbmRMb2FkRnJhZ21lbnRzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBsYXN0T3V0bGluZUZyYWdtZW50SUQ6IHN0cmluZ1xyXG4gICAgKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSwgXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdSZW5kZXJBY3Rpb25zLmxvYWRPdXRsaW5lQW5kUmVxdWVzdEZyYWdtZW50cyhcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgbGFzdE91dGxpbmVGcmFnbWVudElEXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEd1aWRlT3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnUmVuZGVyRWZmZWN0cztcclxuIiwiaW1wb3J0IElSZW5kZXJHdWlkZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckd1aWRlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyR3VpZGUgaW1wbGVtZW50cyBJUmVuZGVyR3VpZGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpZDogc3RyaW5nO1xyXG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBkZXNjcmlwdGlvbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG59XHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJHdWlkZVwiO1xyXG5pbXBvcnQgRmlsdGVycyBmcm9tIFwiLi4vLi4vc3RhdGUvY29uc3RhbnRzL0ZpbHRlcnNcIjtcclxuaW1wb3J0IFJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IFRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vc3RhdGUvd2luZG93L1RyZWVTb2x2ZVwiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuL2dGcmFnbWVudENvZGVcIjtcclxuXHJcblxyXG5jb25zdCBwYXJzZUd1aWRlID0gKHJhd0d1aWRlOiBhbnkpOiBJUmVuZGVyR3VpZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IGd1aWRlOiBJUmVuZGVyR3VpZGUgPSBuZXcgUmVuZGVyR3VpZGUocmF3R3VpZGUuaWQpO1xyXG4gICAgZ3VpZGUudGl0bGUgPSByYXdHdWlkZS50aXRsZSA/PyAnJztcclxuICAgIGd1aWRlLmRlc2NyaXB0aW9uID0gcmF3R3VpZGUuZGVzY3JpcHRpb24gPz8gJyc7XHJcbiAgICBndWlkZS5wYXRoID0gcmF3R3VpZGUucGF0aCA/PyBudWxsO1xyXG4gICAgbGV0IGZvbGRlclBhdGggPSByYXdHdWlkZS5mcmFnbWVudEZvbGRlclBhdGggPz8gbnVsbDtcclxuICAgIGxldCBkaXZpZGVyID0gJyc7XHJcblxyXG4gICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmb2xkZXJQYXRoKSkge1xyXG5cclxuICAgICAgICBpZiAoIWxvY2F0aW9uLm9yaWdpbi5lbmRzV2l0aCgnLycpKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZvbGRlclBhdGguc3RhcnRzV2l0aCgnLycpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZGl2aWRlciA9ICcvJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGZvbGRlclBhdGguc3RhcnRzV0l0aCgnLycpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9sZGVyUGF0aCA9IGZvbGRlclBhdGguc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBndWlkZS5mcmFnbWVudEZvbGRlclVybCA9IGAke2xvY2F0aW9uLm9yaWdpbn0ke2RpdmlkZXJ9JHtmb2xkZXJQYXRofWA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGd1aWRlO1xyXG59O1xyXG5cclxuY29uc3QgcGFyc2VSZW5kZXJpbmdDb21tZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJhdzogYW55XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghcmF3KSB7XHJcbiAgICAgICAgcmV0dXJuIHJhdztcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG57XHJcbiAgICBcImd1aWRlXCI6IHtcclxuICAgICAgICBcImlkXCI6IFwiZEJ0N0pOMXZ0XCJcclxuICAgIH0sXHJcbiAgICBcImZyYWdtZW50XCI6IHtcclxuICAgICAgICBcImlkXCI6IFwiZEJ0N0pOMXZ0XCIsXHJcbiAgICAgICAgXCJ0b3BMZXZlbE1hcEtleVwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcIm1hcEtleUNoYWluXCI6IFwiY3YxVFJsMDFyZlwiLFxyXG4gICAgICAgIFwiZ3VpZGVJRFwiOiBcImRCdDdKTjFIZVwiLFxyXG4gICAgICAgIFwiZ3VpZGVQYXRoXCI6IFwiYzovR2l0SHViL0hBTC5Eb2N1bWVudGF0aW9uL3RzbWFwc1Rlc3QvVGVzdE9wdGlvbnNGb2xkZXIvSG9sZGVyL1Rlc3RPcHRpb25zLnRzbWFwXCIsXHJcbiAgICAgICAgXCJwYXJlbnRGcmFnbWVudElEXCI6IG51bGwsXHJcbiAgICAgICAgXCJjaGFydEtleVwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcIm9wdGlvbnNcIjogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZEJ0N0taMUFOXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9wdGlvblwiOiBcIk9wdGlvbiAxXCIsXHJcbiAgICAgICAgICAgICAgICBcImlzQW5jaWxsYXJ5XCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgXCJvcmRlclwiOiAxXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkQnQ3S1oxUmJcIixcclxuICAgICAgICAgICAgICAgIFwib3B0aW9uXCI6IFwiT3B0aW9uIDJcIixcclxuICAgICAgICAgICAgICAgIFwiaXNBbmNpbGxhcnlcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBcIm9yZGVyXCI6IDJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImRCdDdLWjI0QlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcHRpb25cIjogXCJPcHRpb24gM1wiLFxyXG4gICAgICAgICAgICAgICAgXCJpc0FuY2lsbGFyeVwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwib3JkZXJcIjogM1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG59ICAgIFxyXG4gICAgKi9cclxuXHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5ndWlkZSA9IHBhcnNlR3VpZGUocmF3Lmd1aWRlKTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZFJvb3RGcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICByYXcuZnJhZ21lbnRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnUmVuZGVyQ29kZSA9IHtcclxuXHJcbiAgICByZWdpc3Rlckd1aWRlQ29tbWVudDogKCkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB0cmVlU29sdmVHdWlkZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChGaWx0ZXJzLnRyZWVTb2x2ZUd1aWRlSUQpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgICAgICBpZiAodHJlZVNvbHZlR3VpZGVcclxuICAgICAgICAgICAgJiYgdHJlZVNvbHZlR3VpZGUuaGFzQ2hpbGROb2RlcygpID09PSB0cnVlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZE5vZGU6IENoaWxkTm9kZTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJlZVNvbHZlR3VpZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5DT01NRU5UX05PREUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cuVHJlZVNvbHZlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlID0gbmV3IFRyZWVTb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5yZW5kZXJpbmdDb21tZW50ID0gY2hpbGROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgIT09IE5vZGUuVEVYVF9OT0RFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlUmVuZGVyaW5nQ29tbWVudDogKHN0YXRlOiBJU3RhdGUpID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCF3aW5kb3cuVHJlZVNvbHZlPy5yZW5kZXJpbmdDb21tZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBndWlkZVJlbmRlckNvbW1lbnQgPSB3aW5kb3cuVHJlZVNvbHZlLnJlbmRlcmluZ0NvbW1lbnQ7XHJcbiAgICAgICAgICAgIGd1aWRlUmVuZGVyQ29tbWVudCA9IGd1aWRlUmVuZGVyQ29tbWVudC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWd1aWRlUmVuZGVyQ29tbWVudC5zdGFydHNXaXRoKGdGaWxlQ29uc3RhbnRzLmd1aWRlUmVuZGVyQ29tbWVudFRhZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ3VpZGVSZW5kZXJDb21tZW50ID0gZ3VpZGVSZW5kZXJDb21tZW50LnN1YnN0cmluZyhnRmlsZUNvbnN0YW50cy5ndWlkZVJlbmRlckNvbW1lbnRUYWcubGVuZ3RoKTtcclxuICAgICAgICAgICAgY29uc3QgcmF3ID0gSlNPTi5wYXJzZShndWlkZVJlbmRlckNvbW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgcGFyc2VSZW5kZXJpbmdDb21tZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByYXdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZ2lzdGVyRnJhZ21lbnRDb21tZW50OiAoKSA9PiB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnUmVuZGVyQ29kZTtcclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvU3RhdGVcIjtcclxuaW1wb3J0IFRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vLi4vc3RhdGUvd2luZG93L1RyZWVTb2x2ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdSZW5kZXJFZmZlY3RzIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZWZmZWN0cy9nUmVuZGVyRWZmZWN0c1wiO1xyXG5pbXBvcnQgZ1JlbmRlckNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dSZW5kZXJDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdGlhbGlzZVN0YXRlID0gKCk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgaWYgKCF3aW5kb3cuVHJlZVNvbHZlKSB7XHJcblxyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUgPSBuZXcgVHJlZVNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RhdGU6IElTdGF0ZSA9IG5ldyBTdGF0ZSgpO1xyXG4gICAgZ1JlbmRlckNvZGUucGFyc2VSZW5kZXJpbmdDb21tZW50KHN0YXRlKTtcclxuXHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFJlbmRlckRpc3BsYXkgPSAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBpZiAoIXN0YXRlLnJlbmRlclN0YXRlLnJvb3RcclxuICAgICAgICB8fCAhc3RhdGUucmVuZGVyU3RhdGUucm9vdC5vcHRpb25zXHJcbiAgICAgICAgfHwgc3RhdGUucmVuZGVyU3RhdGUucm9vdC5vcHRpb25zLmxlbmd0aCA9PT0gMFxyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZ1JlbmRlckVmZmVjdHMuZ2V0R3VpZGVPdXRsaW5lKHN0YXRlKVxyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkUmVuZGVyQ2hhaW5EaXNwbGF5ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHF1ZXJ5U3RyaW5nOiBzdHJpbmdcclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGlmIChxdWVyeVN0cmluZy5zdGFydHNXaXRoKCc/JykgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZy5zdWJzdHJpbmcoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGFzdE91dGxpbmVGcmFnbWVudElEID0gcXVlcnlTdHJpbmc7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmVBbmRMb2FkRnJhZ21lbnRzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGFzdE91dGxpbmVGcmFnbWVudElEXHJcbiAgICAgICAgKVxyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IGluaXRpYWxpc2VXaXRob3V0QXV0aG9yaXNhdGlvbiA9IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGNvbnN0IHF1ZXJ5U3RyaW5nOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xyXG5cclxuICAgIHRyeSB7XHJcblxyXG4gICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UocXVlcnlTdHJpbmcpKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZW5kZXJDaGFpbkRpc3BsYXkoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5U3RyaW5nXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYnVpbGRSZW5kZXJEaXNwbGF5KHN0YXRlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgc3RhdGUuZ2VuZXJpY0Vycm9yID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBpbml0U3RhdGUgPSB7XHJcblxyXG4gICAgaW5pdGlhbGlzZTogKCk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdGU6IElTdGF0ZSA9IGluaXRpYWxpc2VTdGF0ZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gaW5pdGlhbGlzZVdpdGhvdXRBdXRob3Jpc2F0aW9uKHN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdGF0ZTtcclxuXHJcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcblxyXG5cclxuY29uc3QgcmVuZGVyQ29tbWVudHMgPSB7XHJcblxyXG4gICAgcmVnaXN0ZXJHdWlkZUNvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdHJlZVNvbHZlR3VpZGU6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRmlsdGVycy50cmVlU29sdmVHdWlkZUlEKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRyZWVTb2x2ZUd1aWRlXHJcbiAgICAgICAgICAgICYmIHRyZWVTb2x2ZUd1aWRlLmhhc0NoaWxkTm9kZXMoKSA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGROb2RlOiBDaGlsZE5vZGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93LlRyZWVTb2x2ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudCA9IGNoaWxkTm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGROb2RlLm5vZGVUeXBlICE9PSBOb2RlLlRFWFRfTk9ERSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZW5kZXJDb21tZW50cztcclxuIiwiaW1wb3J0IHsgYXBwIH0gZnJvbSBcIi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XG5cbmltcG9ydCBpbml0U3Vic2NyaXB0aW9ucyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9zdWJzY3JpcHRpb25zL2luaXRTdWJzY3JpcHRpb25zXCI7XG5pbXBvcnQgaW5pdEV2ZW50cyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHNcIjtcbmltcG9ydCBpbml0VmlldyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlld1wiO1xuaW1wb3J0IGluaXRTdGF0ZSBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRTdGF0ZVwiO1xuaW1wb3J0IHJlbmRlckNvbW1lbnRzIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvcmVuZGVyQ29tbWVudHNcIjtcblxuXG5pbml0RXZlbnRzLnJlZ2lzdGVyR2xvYmFsRXZlbnRzKCk7XG5yZW5kZXJDb21tZW50cy5yZWdpc3Rlckd1aWRlQ29tbWVudCgpO1xuXG4od2luZG93IGFzIGFueSkuQ29tcG9zaXRlRmxvd3NBdXRob3IgPSBhcHAoe1xuICAgIFxuICAgIG5vZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHJlZVNvbHZlRnJhZ21lbnRzXCIpLFxuICAgIGluaXQ6IGluaXRTdGF0ZS5pbml0aWFsaXNlLFxuICAgIHZpZXc6IGluaXRWaWV3LmJ1aWxkVmlldyxcbiAgICBzdWJzY3JpcHRpb25zOiBpbml0U3Vic2NyaXB0aW9ucyxcbiAgICBvbkVuZDogaW5pdEV2ZW50cy5vblJlbmRlckZpbmlzaGVkXG59KTtcblxuXG4iXSwibmFtZXMiOlsicHJvcHMiLCJvdXRwdXQiLCJVIiwiZWZmZWN0IiwiaHR0cEVmZmVjdCIsIkFjdGlvblR5cGUiLCJzdGF0ZSIsImxvY2F0aW9uIiwibmF2aWdhdGlvbkRpcmVjdGlvbiIsIlN0ZXBIaXN0b3J5IiwiU2Nyb2xsSG9wVHlwZSIsImdSZW5kZXJBY3Rpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSSxnQkFBZ0I7QUFDcEIsSUFBSSxZQUFZO0FBQ2hCLElBQUksWUFBWTtBQUNoQixJQUFJLFlBQVksQ0FBRTtBQUNsQixJQUFJLFlBQVksQ0FBRTtBQUNsQixJQUFJLE1BQU0sVUFBVTtBQUNwQixJQUFJLFVBQVUsTUFBTTtBQUNwQixJQUFJLFFBQ0Ys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
