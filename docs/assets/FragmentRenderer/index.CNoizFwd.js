(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
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
  constructor(name, url, parseType, actionDelegate) {
    this.name = name;
    this.url = url;
    this.parseType = parseType;
    this.actionDelegate = actionDelegate;
  }
  name;
  url;
  parseType;
  actionDelegate;
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
    this.url = url;
  }
  url;
}
class RenderSnapShot {
  constructor(url) {
    this.url = url;
  }
  url;
  guid = null;
  created = null;
  modified = null;
  expandedOptionIDs = [];
  expandedAncillaryIDs = [];
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
  if (!fragment) {
    return;
  }
  if (fragment.link?.root) {
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
    if (state.renderState.isChainLoad === true) {
      return;
    }
    state.renderState.refreshUrl = false;
    if (!state.renderState.currentSection?.current || !state.renderState.displayGuide?.root) {
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
    if (!window?.TreeSolve?.screen?.isAutofocusFirstRun) {
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
  fragmentOptionsExpanded = false;
  discussionLoaded = false;
  ancillaryExpanded = false;
}
class RenderFragment {
  constructor(id, parentFragmentID, section, segmentIndex) {
    this.id = id;
    this.section = section;
    this.parentFragmentID = parentFragmentID;
    this.segmentIndex = segmentIndex;
  }
  id;
  iKey = null;
  iExitKey = null;
  exitKey = null;
  topLevelMapKey = "";
  mapKeyChain = "";
  guideID = "";
  guidePath = "";
  parentFragmentID;
  value = "";
  selected = null;
  isLeaf = false;
  options = [];
  variable = null;
  option = "";
  isAncillary = false;
  order = 0;
  link = null;
  section;
  segmentIndex;
  ui = new RenderFragmentUI();
}
var OutlineType = /* @__PURE__ */ ((OutlineType2) => {
  OutlineType2["None"] = "none";
  OutlineType2["Node"] = "node";
  OutlineType2["Exit"] = "exit";
  OutlineType2["Link"] = "link";
  return OutlineType2;
})(OutlineType || {});
class RenderOutlineNode {
  i = "";
  // id
  c = null;
  // index from outline chart array
  x = null;
  // iExit id
  _x = null;
  // exit id
  o = [];
  // options
  parent = null;
  type = OutlineType.Node;
  isChart = true;
  isRoot = false;
  isLast = false;
}
class RenderOutline {
  constructor(path) {
    this.path = path;
  }
  path;
  loaded = false;
  v = "";
  r = new RenderOutlineNode();
  c = [];
  e;
  mv;
}
class RenderOutlineChart {
  i = "";
  p = "";
}
class DisplayGuide {
  constructor(linkID, guide, rootID) {
    this.linkID = linkID;
    this.guide = guide;
    this.root = new RenderFragment(
      rootID,
      "guideRoot",
      this,
      0
    );
  }
  linkID;
  guide;
  outline = null;
  root;
  current = null;
}
class RenderGuide {
  constructor(id) {
    this.id = id;
  }
  id;
  title = "";
  description = "";
  path = "";
  fragmentFolderUrl = null;
}
var ScrollHopType = /* @__PURE__ */ ((ScrollHopType2) => {
  ScrollHopType2["None"] = "none";
  ScrollHopType2["Up"] = "up";
  ScrollHopType2["Down"] = "down";
  return ScrollHopType2;
})(ScrollHopType || {});
class Screen {
  autofocus = false;
  isAutofocusFirstRun = true;
  hideBanner = false;
  scrollToTop = false;
  scrollToElement = null;
  scrollHop = ScrollHopType.None;
  lastScrollY = 0;
  ua = null;
}
class TreeSolve {
  renderingComment = null;
  screen = new Screen();
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
    if (!window.TreeSolve?.renderingComment) {
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
    this.linkID = linkID;
    this.chart = chart;
  }
  linkID;
  chart;
  outline = null;
  root = null;
  parent = null;
  current = null;
}
class ChainSegment {
  constructor(index, start, end) {
    this.index = index;
    this.start = start;
    this.end = end;
    this.text = `${start.text}${end?.text ?? ""}`;
  }
  index;
  text;
  outlineNodes = [];
  outlineNodesLoaded = false;
  start;
  end;
  segmentInSection = null;
  segmentSection = null;
  segmentOutSection = null;
}
class SegmentNode {
  constructor(text, key, type, isRoot, isLast) {
    this.text = text;
    this.key = key;
    this.type = type;
    this.isRoot = isRoot;
    this.isLast = isLast;
  }
  text;
  key;
  type;
  isRoot;
  isLast;
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
    if (gUtilities.isNullOrWhiteSpace(nextSegment.segmentSection.outline?.r.i) === true) {
      throw new Error("Next segment section root key was null");
    }
    let startOutlineNode = gStateCode.getCached_outlineNode(
      state,
      nextSegment.segmentSection.linkID,
      nextSegment.segmentSection.outline?.r.i
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
    if (outlineNode?.isLast === true) {
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
      if (!firstLoop && parent?.isChart === true && parent?.isRoot === true) {
        break;
      }
      if (parent?.i === startOutlineNode.i) {
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
    if (parent.link) {
      throw new Error(`Link already loaded, rootID: ${parent.link.root?.id}`);
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
    if (parent.link) {
      throw new Error(`Link already loaded, rootID: ${parent.link.root?.id}`);
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
      if (!section.root.ui.discussionLoaded) {
        throw new Error("Section root discussion was not loaded");
      }
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
    if (outlineNode?.c == null) {
      return;
    }
    const outlineChart = gOutlineCode.getOutlineChart(
      outline,
      outlineNode?.c
    );
    gOutlineCode.getOutlineFromChart_subscription(
      state,
      outlineChart,
      fragment
    );
  },
  getSegmentOutline_subscription: (state, chart, linkFragment, segmentIndex) => {
    if (!chart) {
      throw new Error("OutlineChart was null");
    }
    if (linkFragment.link?.root) {
      console.log(`Link root already loaded: ${linkFragment.link.root?.id}`);
      return;
    }
    let nextSegmentIndex = segmentIndex;
    if (nextSegmentIndex != null) {
      nextSegmentIndex++;
    }
    const outlineChartPath = chart?.p;
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
    if (!chart) {
      throw new Error("OutlineChart was null");
    }
    if (linkFragment.link?.root) {
      console.log(`Link root already loaded: ${linkFragment.link.root?.id}`);
      return;
    }
    const outlineChartPath = chart?.p;
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
  state.loading = true;
  window.TreeSolve.screen.hideBanner = true;
  const fragmentPath = `${option.section?.outline?.path}/${option.id}${gFileConstants.fragmentFileExtension}`;
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
  if (parent?.link) {
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
  if (fragment.options?.length > 0) {
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
  if (outlineNode?.c == null) {
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
    outlineNode?.c
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
    if (ancillary.ui.discussionLoaded === true) {
      gFragmentCode.autoExpandSingleBlankOption(
        state,
        ancillary
      );
      if (!ancillary.link) {
        gOutlineCode.getFragmentLinkChartOutline(
          state,
          ancillary
        );
      }
      return gStateCode.cloneState(state);
    }
    return getFragmentFile(
      state,
      ancillary
    );
  },
  showOptionNode: (state, parentFragment, option) => {
    gFragmentCode.clearParentSectionSelected(parentFragment);
    gFragmentCode.prepareToShowOptionNode(
      state,
      option
    );
    if (option.ui.discussionLoaded === true) {
      gFragmentCode.autoExpandSingleBlankOption(
        state,
        option
      );
      if (!option.link) {
        gOutlineCode.getFragmentLinkChartOutline(
          state,
          option
        );
      }
      return gStateCode.cloneState(state);
    }
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
    if (!state) {
      return state;
    }
    const outlineNodeID = section.outline?.r.i;
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
    if (!state) {
      return state;
    }
    const segmentSection = segment.segmentSection;
    if (!segmentSection) {
      throw new Error("Segment section is null");
    }
    let parentFragmentID = outlineNode.parent?.i;
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
  let value = variableValues[variableName];
  if (value) {
    return value;
  }
  const currentValue = section.outline?.mv?.[variableName];
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
  const chart = section;
  const parent = chart.parent?.section;
  if (!parent) {
    return;
  }
  const parentValue = parent.outline?.mv?.[variableName];
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
  if (!fragment) {
    return;
  }
  clearFragmentChains(fragment.link?.root);
  for (const option of fragment.options) {
    clearFragmentChains(option);
  }
  fragment.selected = null;
  fragment.link = null;
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
  if (!option || !option.section?.outline?.path) {
    return;
  }
  gFragmentCode.prepareToShowOptionNode(
    state,
    option
  );
  if (option.ui.discussionLoaded === true) {
    return;
  }
  return gFragmentCode.getFragmentAndLinkOutline_subscripion(
    state,
    option,
    optionText
  );
};
const loadNextFragmentInSegment = (state, segment) => {
  const nextOutlineNode = gSegmentCode.getNextSegmentOutlineNode(
    state,
    segment
  );
  if (!nextOutlineNode) {
    return;
  }
  const fragmentFolderUrl = segment.segmentSection?.outline?.path;
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
    if (!fragment.selected?.id) {
      return;
    }
    if (!gFragmentCode.hasOption(fragment, fragment.selected?.id)) {
      throw new Error("Selected has been set to fragment that isn't an option");
    }
  },
  clearParentSectionSelected: (fragment) => {
    const displayChart = fragment.section;
    if (!displayChart?.parent) {
      return;
    }
    const parent = displayChart.parent;
    if (parent.selected) {
      parent.selected = null;
    }
    return gFragmentCode.clearParentSectionSelected(parent);
  },
  getFragmentAndLinkOutline_subscripion: (state, option, optionText = null) => {
    if (option.ui.discussionLoaded === true) {
      throw new Error("Discussion was already loaded");
    }
    state.loading = true;
    window.TreeSolve.screen.hideBanner = true;
    gFragmentCode.getLinkOutline_subscripion(
      state,
      option
    );
    const url = `${option.section?.outline?.path}/${option.id}${gFileConstants.fragmentFileExtension}`;
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
    if (outlineNode?.c == null || state.renderState.isChainLoad === true) {
      return;
    }
    const outlineChart = gOutlineCode.getOutlineChart(
      outline,
      outlineNode?.c
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
    if (!fragment.ui.discussionLoaded) {
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
    }
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
      if (outlineNode?.c != null) {
        return;
      }
      return showOptionNode_subscripton(
        state,
        fragment.options[0]
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
    fragment.topLevelMapKey = rawFragment.topLevelMapKey ?? "";
    fragment.mapKeyChain = rawFragment.mapKeyChain ?? "";
    fragment.guideID = rawFragment.guideID ?? "";
    fragment.guidePath = rawFragment.guidePath ?? "";
    fragment.iKey = rawFragment.iKey ?? null;
    fragment.iExitKey = rawFragment.iExitKey ?? null;
    fragment.exitKey = rawFragment.exitKey ?? null;
    fragment.variable = rawFragment.variable ?? null;
    fragment.value = rawFragment.value ?? "";
    fragment.value = fragment.value.trim();
    fragment.ui.discussionLoaded = true;
    checkForVariables(
      fragment
    );
    const outlineNode = gStateCode.getCached_outlineNode(
      state,
      fragment.section.linkID,
      fragment.id
    );
    fragment.parentFragmentID = outlineNode?.parent?.i ?? "";
    let option;
    if (rawFragment.options && Array.isArray(rawFragment.options)) {
      for (const rawOption of rawFragment.options) {
        option = loadOption(
          state,
          rawOption,
          outlineNode,
          fragment.section,
          fragment.id,
          fragment.segmentIndex
        );
        fragment.options.push(option);
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
    return gStateCode.cloneState(state);
  },
  showOptionNode: (state, payload) => {
    if (!state || !payload?.parentFragment || !payload?.option) {
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
    if (!state || !payload?.option) {
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
    this.parentFragment = parentFragment;
    this.option = option;
  }
  parentFragment;
  option;
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
          h("span", {}, ancillary.option)
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
      h("span", { class: `nt-fr-option-selected` }, `${fragment.selected?.option}`)
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
  view.ui = {
    isCollapsed: true
  };
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
  views.push(
    h(
      "div",
      {
        id: `${fragmentELementID}_a`,
        class: "nt-fr-fragment-box"
      },
      [
        ancillariesView
      ]
    )
  );
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
      optionsCollapsed: optionsViewResults?.isCollapsed ?? false
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
  let adjustForCollapsedOptions = false;
  const viewsLength = views.length;
  if (viewsLength > 0) {
    const lastView = views[viewsLength - 1];
    if (lastView?.ui?.isCollapsed === true) {
      adjustForCollapsedOptions = true;
    }
  }
  const linkELementID = gFragmentCode.getLinkElementID(fragment.id);
  const results = optionsViews.buildView(fragment);
  const view = h(
    "div",
    {
      id: `${linkELementID}_l`,
      class: {
        "nt-fr-fragment-box": true,
        "nt-fr-prior-collapsed-options": adjustForCollapsedOptions === true
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
    view.ui = {
      isCollapsed: true
    };
  }
  views.push(view);
};
const linkViews = {
  buildView: (fragment, views) => {
    buildLinkDiscussionView(
      fragment,
      views
    );
    if (fragment.link?.root) {
      linkViews.buildView(
        fragment.link.root,
        views
      );
    }
    fragmentViews.buildView(
      fragment.selected,
      views
    );
  }
};
const buildDiscussionView = (fragment, views) => {
  if (gUtilities.isNullOrWhiteSpace(fragment.value) === true) {
    return;
  }
  let adjustForCollapsedOptions = false;
  const viewsLength = views.length;
  if (viewsLength > 0) {
    const lastView = views[viewsLength - 1];
    if (lastView?.ui?.isCollapsed === true) {
      adjustForCollapsedOptions = true;
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
          "nt-fr-prior-collapsed-options": adjustForCollapsedOptions === true
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
    if (!fragment) {
      return;
    }
    buildDiscussionView(
      fragment,
      views
    );
    if (fragment.link?.root) {
      linkViews.buildView(
        fragment.link.root,
        views
      );
    }
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
    const innerViews = [];
    fragmentViews.buildView(
      state.renderState.displayGuide?.root,
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
  key = "-1";
  r = "-1";
  // Authentication
  userPath = `user`;
  defaultLogoutPath = `logout`;
  defaultLoginPath = `login`;
  returnUrlStart = `returnUrl`;
  baseUrl = window.ASSISTANT_BASE_URL ?? "";
  linkUrl = window.ASSISTANT_LINK_URL ?? "";
  subscriptionID = window.ASSISTANT_SUBSCRIPTION_ID ?? "";
  apiUrl = `${this.baseUrl}/api`;
  bffUrl = `${this.baseUrl}/bff`;
  fileUrl = `${this.baseUrl}/file`;
}
var navigationDirection = /* @__PURE__ */ ((navigationDirection2) => {
  navigationDirection2["Buttons"] = "buttons";
  navigationDirection2["Backwards"] = "backwards";
  navigationDirection2["Forwards"] = "forwards";
  return navigationDirection2;
})(navigationDirection || {});
class History {
  historyChain = [];
  direction = navigationDirection.Buttons;
  currentIndex = 0;
}
class User {
  key = `0123456789`;
  r = "-1";
  useVsCode = true;
  authorised = false;
  raw = true;
  logoutUrl = "";
  showMenu = false;
  name = "";
  sub = "";
}
class RepeateEffects {
  shortIntervalHttp = [];
  reLoadGetHttpImmediate = [];
  runActionImmediate = [];
}
class RenderStateUI {
  raw = true;
  optionsExpanded = false;
}
class RenderState {
  refreshUrl = false;
  isChainLoad = false;
  segments = [];
  displayGuide = null;
  outlines = {};
  outlineUrls = {};
  currentSection = null;
  // Search indices
  index_outlineNodes_id = {};
  index_chainFragments_id = {};
  ui = new RenderStateUI();
}
class State {
  constructor() {
    const settings = new Settings();
    this.settings = settings;
  }
  loading = true;
  debug = true;
  genericError = false;
  nextKey = -1;
  settings;
  user = new User();
  renderState = new RenderState();
  repeatEffects = new RepeateEffects();
  stepHistory = new History();
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
    if (!state) {
      return;
    }
    const fragmentFolderUrl = state.renderState.displayGuide?.guide.fragmentFolderUrl ?? "null";
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
    if (!state) {
      return;
    }
    const fragmentFolderUrl = state.renderState.displayGuide?.guide.fragmentFolderUrl ?? "null";
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
  if (!state.renderState.displayGuide?.root) {
    return state;
  }
  if (gUtilities.isNullOrWhiteSpace(state.renderState.displayGuide?.root.iKey) === true && (!state.renderState.displayGuide?.root.options || state.renderState.displayGuide?.root.options.length === 0)) {
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
class HookRegistry {
  stepHook = null;
  registerStepHook(hook) {
    this.stepHook = hook;
  }
  executeStepHook(state, step) {
    if (this.stepHook) {
      this.stepHook(
        state,
        step
      );
    }
  }
}
const registerStepHook = () => {
  if (!window.HookRegistry) {
    window.HookRegistry = new HookRegistry();
    window.HookRegistry.registerStepHook(stepHook.processStep);
  }
};
const PROCESS_STEP = "<p>PROCESS_STEP</p>";
const runProcessStep = (stepText) => {
  let firstlineEndIndex = stepText.indexOf("\n");
  let firstLine = "";
  if (firstlineEndIndex === -1) {
    firstLine = stepText;
    stepText = "";
  } else {
    firstLine = stepText.substring(0, firstlineEndIndex);
    stepText = stepText.substring(firstlineEndIndex + 1);
  }
  if (firstLine.trim() === PROCESS_STEP) {
    return {
      runProcess: true,
      stepText
    };
  }
  return {
    runProcess: false,
    stepText
  };
};
const stepHook = {
  processStep: (_state, step) => {
    const result = runProcessStep(step.value);
    if (!result.runProcess) {
      return;
    }
    step.value = result.stepText;
  }
};
registerStepHook();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguQ05vaXpGd2QuanMiLCJzb3VyY2VzIjpbIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL3RpbWUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dIdHRwLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nVXRpbGl0aWVzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnlVcmwudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dIaXN0b3J5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvaHR0cC9nQWpheEhlYWRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkVmZmVjdHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkh0dHAudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdWJzY3JpcHRpb25zL3JlcGVhdFN1YnNjcmlwdGlvbi50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy9jb2RlL29uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL29uUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9hY3Rpb25zL2luaXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyRnJhZ21lbnRVSS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckZyYWdtZW50LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZU5vZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9kaXNwbGF5L0Rpc3BsYXlHdWlkZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckd1aWRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1Njcm9sbEhvcFR5cGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9TY3JlZW4udHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9UcmVlU29sdmUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nRmlsZUNvbnN0YW50cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1JlbmRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9zZWdtZW50cy9DaGFpblNlZ21lbnQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3NlZ21lbnRzL1NlZ21lbnROb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nU2VnbWVudENvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dPdXRsaW5lQWN0aW9ucy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ091dGxpbmVDb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nRnJhZ21lbnRFZmZlY3RzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nSG9va1JlZ2lzdHJ5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvYWN0aW9ucy9mcmFnbWVudEFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VpL3BheWxvYWRzL0ZyYWdtZW50UGF5bG9hZC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvdmlld3Mvb3B0aW9uc1ZpZXdzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy92aWV3cy9saW5rVmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2ZyYWdtZW50Vmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2d1aWRlVmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlldy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdXNlci9TZXR0aW5ncy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9uYXZpZ2F0aW9uRGlyZWN0aW9uLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnkudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VzZXIvVXNlci50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvZWZmZWN0cy9SZXBlYXRlRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyU3RhdGVVSS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvUmVuZGVyU3RhdGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL1N0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nUmVuZGVyRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9yZW5kZXJDb21tZW50cy50cyIsIi4uL3Jvb3Qvc3JjL2luZGV4LnRzIiwiLi4vcm9vdC9zcmMyL0hvb2tSZWdpc3RyeS50cyIsIi4uL3Jvb3Qvc3JjMi9zdGVwSG9vay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUkVDWUNMRURfTk9ERSA9IDFcclxudmFyIExBWllfTk9ERSA9IDJcclxudmFyIFRFWFRfTk9ERSA9IDNcclxudmFyIEVNUFRZX09CSiA9IHt9XHJcbnZhciBFTVBUWV9BUlIgPSBbXVxyXG52YXIgbWFwID0gRU1QVFlfQVJSLm1hcFxyXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcclxudmFyIGRlZmVyID1cclxuICB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSBcInVuZGVmaW5lZFwiXHJcbiAgICA/IHJlcXVlc3RBbmltYXRpb25GcmFtZVxyXG4gICAgOiBzZXRUaW1lb3V0XHJcblxyXG52YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbihvYmopIHtcclxuICB2YXIgb3V0ID0gXCJcIlxyXG5cclxuICBpZiAodHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIG9ialxyXG5cclxuICBpZiAoaXNBcnJheShvYmopICYmIG9iai5sZW5ndGggPiAwKSB7XHJcbiAgICBmb3IgKHZhciBrID0gMCwgdG1wOyBrIDwgb2JqLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgIGlmICgodG1wID0gY3JlYXRlQ2xhc3Mob2JqW2tdKSkgIT09IFwiXCIpIHtcclxuICAgICAgICBvdXQgKz0gKG91dCAmJiBcIiBcIikgKyB0bXBcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBmb3IgKHZhciBrIGluIG9iaikge1xyXG4gICAgICBpZiAob2JqW2tdKSB7XHJcbiAgICAgICAgb3V0ICs9IChvdXQgJiYgXCIgXCIpICsga1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbnZhciBtZXJnZSA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICB2YXIgb3V0ID0ge31cclxuXHJcbiAgZm9yICh2YXIgayBpbiBhKSBvdXRba10gPSBhW2tdXHJcbiAgZm9yICh2YXIgayBpbiBiKSBvdXRba10gPSBiW2tdXHJcblxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxudmFyIGJhdGNoID0gZnVuY3Rpb24obGlzdCkge1xyXG4gIHJldHVybiBsaXN0LnJlZHVjZShmdW5jdGlvbihvdXQsIGl0ZW0pIHtcclxuICAgIHJldHVybiBvdXQuY29uY2F0KFxyXG4gICAgICAhaXRlbSB8fCBpdGVtID09PSB0cnVlXHJcbiAgICAgICAgPyAwXHJcbiAgICAgICAgOiB0eXBlb2YgaXRlbVswXSA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgPyBbaXRlbV1cclxuICAgICAgICA6IGJhdGNoKGl0ZW0pXHJcbiAgICApXHJcbiAgfSwgRU1QVFlfQVJSKVxyXG59XHJcblxyXG52YXIgaXNTYW1lQWN0aW9uID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIHJldHVybiBpc0FycmF5KGEpICYmIGlzQXJyYXkoYikgJiYgYVswXSA9PT0gYlswXSAmJiB0eXBlb2YgYVswXSA9PT0gXCJmdW5jdGlvblwiXHJcbn1cclxuXHJcbnZhciBzaG91bGRSZXN0YXJ0ID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIGlmIChhICE9PSBiKSB7XHJcbiAgICBmb3IgKHZhciBrIGluIG1lcmdlKGEsIGIpKSB7XHJcbiAgICAgIGlmIChhW2tdICE9PSBiW2tdICYmICFpc1NhbWVBY3Rpb24oYVtrXSwgYltrXSkpIHJldHVybiB0cnVlXHJcbiAgICAgIGJba10gPSBhW2tdXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG52YXIgcGF0Y2hTdWJzID0gZnVuY3Rpb24ob2xkU3VicywgbmV3U3VicywgZGlzcGF0Y2gpIHtcclxuICBmb3IgKFxyXG4gICAgdmFyIGkgPSAwLCBvbGRTdWIsIG5ld1N1Yiwgc3VicyA9IFtdO1xyXG4gICAgaSA8IG9sZFN1YnMubGVuZ3RoIHx8IGkgPCBuZXdTdWJzLmxlbmd0aDtcclxuICAgIGkrK1xyXG4gICkge1xyXG4gICAgb2xkU3ViID0gb2xkU3Vic1tpXVxyXG4gICAgbmV3U3ViID0gbmV3U3Vic1tpXVxyXG4gICAgc3Vicy5wdXNoKFxyXG4gICAgICBuZXdTdWJcclxuICAgICAgICA/ICFvbGRTdWIgfHxcclxuICAgICAgICAgIG5ld1N1YlswXSAhPT0gb2xkU3ViWzBdIHx8XHJcbiAgICAgICAgICBzaG91bGRSZXN0YXJ0KG5ld1N1YlsxXSwgb2xkU3ViWzFdKVxyXG4gICAgICAgICAgPyBbXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzBdLFxyXG4gICAgICAgICAgICAgIG5ld1N1YlsxXSxcclxuICAgICAgICAgICAgICBuZXdTdWJbMF0oZGlzcGF0Y2gsIG5ld1N1YlsxXSksXHJcbiAgICAgICAgICAgICAgb2xkU3ViICYmIG9sZFN1YlsyXSgpXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIDogb2xkU3ViXHJcbiAgICAgICAgOiBvbGRTdWIgJiYgb2xkU3ViWzJdKClcclxuICAgIClcclxuICB9XHJcbiAgcmV0dXJuIHN1YnNcclxufVxyXG5cclxudmFyIHBhdGNoUHJvcGVydHkgPSBmdW5jdGlvbihub2RlLCBrZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgaWYgKGtleSA9PT0gXCJrZXlcIikge1xyXG4gIH0gZWxzZSBpZiAoa2V5ID09PSBcInN0eWxlXCIpIHtcclxuICAgIGZvciAodmFyIGsgaW4gbWVyZ2Uob2xkVmFsdWUsIG5ld1ZhbHVlKSkge1xyXG4gICAgICBvbGRWYWx1ZSA9IG5ld1ZhbHVlID09IG51bGwgfHwgbmV3VmFsdWVba10gPT0gbnVsbCA/IFwiXCIgOiBuZXdWYWx1ZVtrXVxyXG4gICAgICBpZiAoa1swXSA9PT0gXCItXCIpIHtcclxuICAgICAgICBub2RlW2tleV0uc2V0UHJvcGVydHkoaywgb2xkVmFsdWUpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm9kZVtrZXldW2tdID0gb2xkVmFsdWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoa2V5WzBdID09PSBcIm9cIiAmJiBrZXlbMV0gPT09IFwiblwiKSB7XHJcbiAgICBpZiAoXHJcbiAgICAgICEoKG5vZGUuYWN0aW9ucyB8fCAobm9kZS5hY3Rpb25zID0ge30pKVtcclxuICAgICAgICAoa2V5ID0ga2V5LnNsaWNlKDIpLnRvTG93ZXJDYXNlKCkpXHJcbiAgICAgIF0gPSBuZXdWYWx1ZSlcclxuICAgICkge1xyXG4gICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LCBsaXN0ZW5lcilcclxuICAgIH0gZWxzZSBpZiAoIW9sZFZhbHVlKSB7XHJcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoIWlzU3ZnICYmIGtleSAhPT0gXCJsaXN0XCIgJiYga2V5IGluIG5vZGUpIHtcclxuICAgIG5vZGVba2V5XSA9IG5ld1ZhbHVlID09IG51bGwgfHwgbmV3VmFsdWUgPT0gXCJ1bmRlZmluZWRcIiA/IFwiXCIgOiBuZXdWYWx1ZVxyXG4gIH0gZWxzZSBpZiAoXHJcbiAgICBuZXdWYWx1ZSA9PSBudWxsIHx8XHJcbiAgICBuZXdWYWx1ZSA9PT0gZmFsc2UgfHxcclxuICAgIChrZXkgPT09IFwiY2xhc3NcIiAmJiAhKG5ld1ZhbHVlID0gY3JlYXRlQ2xhc3MobmV3VmFsdWUpKSlcclxuICApIHtcclxuICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGtleSlcclxuICB9IGVsc2Uge1xyXG4gICAgbm9kZS5zZXRBdHRyaWJ1dGUoa2V5LCBuZXdWYWx1ZSlcclxuICB9XHJcbn1cclxuXHJcbnZhciBjcmVhdGVOb2RlID0gZnVuY3Rpb24odmRvbSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgdmFyIG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXHJcbiAgdmFyIHByb3BzID0gdmRvbS5wcm9wc1xyXG4gIHZhciBub2RlID1cclxuICAgIHZkb20udHlwZSA9PT0gVEVYVF9OT0RFXHJcbiAgICAgID8gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmRvbS5uYW1lKVxyXG4gICAgICA6IChpc1N2ZyA9IGlzU3ZnIHx8IHZkb20ubmFtZSA9PT0gXCJzdmdcIilcclxuICAgICAgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHZkb20ubmFtZSwgeyBpczogcHJvcHMuaXMgfSlcclxuICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHZkb20ubmFtZSwgeyBpczogcHJvcHMuaXMgfSlcclxuXHJcbiAgZm9yICh2YXIgayBpbiBwcm9wcykge1xyXG4gICAgcGF0Y2hQcm9wZXJ0eShub2RlLCBrLCBudWxsLCBwcm9wc1trXSwgbGlzdGVuZXIsIGlzU3ZnKVxyXG4gIH1cclxuXHJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHZkb20uY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIG5vZGUuYXBwZW5kQ2hpbGQoXHJcbiAgICAgIGNyZWF0ZU5vZGUoXHJcbiAgICAgICAgKHZkb20uY2hpbGRyZW5baV0gPSBnZXRWTm9kZSh2ZG9tLmNoaWxkcmVuW2ldKSksXHJcbiAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgaXNTdmdcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuICh2ZG9tLm5vZGUgPSBub2RlKVxyXG59XHJcblxyXG52YXIgZ2V0S2V5ID0gZnVuY3Rpb24odmRvbSkge1xyXG4gIHJldHVybiB2ZG9tID09IG51bGwgPyBudWxsIDogdmRvbS5rZXlcclxufVxyXG5cclxudmFyIHBhdGNoID0gZnVuY3Rpb24ocGFyZW50LCBub2RlLCBvbGRWTm9kZSwgbmV3Vk5vZGUsIGxpc3RlbmVyLCBpc1N2Zykge1xyXG4gIGlmIChvbGRWTm9kZSA9PT0gbmV3Vk5vZGUpIHtcclxuICB9IGVsc2UgaWYgKFxyXG4gICAgb2xkVk5vZGUgIT0gbnVsbCAmJlxyXG4gICAgb2xkVk5vZGUudHlwZSA9PT0gVEVYVF9OT0RFICYmXHJcbiAgICBuZXdWTm9kZS50eXBlID09PSBURVhUX05PREVcclxuICApIHtcclxuICAgIGlmIChvbGRWTm9kZS5uYW1lICE9PSBuZXdWTm9kZS5uYW1lKSBub2RlLm5vZGVWYWx1ZSA9IG5ld1ZOb2RlLm5hbWVcclxuICB9IGVsc2UgaWYgKG9sZFZOb2RlID09IG51bGwgfHwgb2xkVk5vZGUubmFtZSAhPT0gbmV3Vk5vZGUubmFtZSkge1xyXG4gICAgbm9kZSA9IHBhcmVudC5pbnNlcnRCZWZvcmUoXHJcbiAgICAgIGNyZWF0ZU5vZGUoKG5ld1ZOb2RlID0gZ2V0Vk5vZGUobmV3Vk5vZGUpKSwgbGlzdGVuZXIsIGlzU3ZnKSxcclxuICAgICAgbm9kZVxyXG4gICAgKVxyXG4gICAgaWYgKG9sZFZOb2RlICE9IG51bGwpIHtcclxuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKG9sZFZOb2RlLm5vZGUpXHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciB0bXBWS2lkXHJcbiAgICB2YXIgb2xkVktpZFxyXG5cclxuICAgIHZhciBvbGRLZXlcclxuICAgIHZhciBuZXdLZXlcclxuXHJcbiAgICB2YXIgb2xkVlByb3BzID0gb2xkVk5vZGUucHJvcHNcclxuICAgIHZhciBuZXdWUHJvcHMgPSBuZXdWTm9kZS5wcm9wc1xyXG5cclxuICAgIHZhciBvbGRWS2lkcyA9IG9sZFZOb2RlLmNoaWxkcmVuXHJcbiAgICB2YXIgbmV3VktpZHMgPSBuZXdWTm9kZS5jaGlsZHJlblxyXG5cclxuICAgIHZhciBvbGRIZWFkID0gMFxyXG4gICAgdmFyIG5ld0hlYWQgPSAwXHJcbiAgICB2YXIgb2xkVGFpbCA9IG9sZFZLaWRzLmxlbmd0aCAtIDFcclxuICAgIHZhciBuZXdUYWlsID0gbmV3VktpZHMubGVuZ3RoIC0gMVxyXG5cclxuICAgIGlzU3ZnID0gaXNTdmcgfHwgbmV3Vk5vZGUubmFtZSA9PT0gXCJzdmdcIlxyXG5cclxuICAgIGZvciAodmFyIGkgaW4gbWVyZ2Uob2xkVlByb3BzLCBuZXdWUHJvcHMpKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAoaSA9PT0gXCJ2YWx1ZVwiIHx8IGkgPT09IFwic2VsZWN0ZWRcIiB8fCBpID09PSBcImNoZWNrZWRcIlxyXG4gICAgICAgICAgPyBub2RlW2ldXHJcbiAgICAgICAgICA6IG9sZFZQcm9wc1tpXSkgIT09IG5ld1ZQcm9wc1tpXVxyXG4gICAgICApIHtcclxuICAgICAgICBwYXRjaFByb3BlcnR5KG5vZGUsIGksIG9sZFZQcm9wc1tpXSwgbmV3VlByb3BzW2ldLCBsaXN0ZW5lciwgaXNTdmcpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsICYmIG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKG9sZEtleSA9IGdldEtleShvbGRWS2lkc1tvbGRIZWFkXSkpID09IG51bGwgfHxcclxuICAgICAgICBvbGRLZXkgIT09IGdldEtleShuZXdWS2lkc1tuZXdIZWFkXSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGF0Y2goXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRIZWFkXS5ub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZEhlYWRdLFxyXG4gICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKFxyXG4gICAgICAgICAgbmV3VktpZHNbbmV3SGVhZCsrXSxcclxuICAgICAgICAgIG9sZFZLaWRzW29sZEhlYWQrK11cclxuICAgICAgICApKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCAmJiBvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChvbGRLZXkgPSBnZXRLZXkob2xkVktpZHNbb2xkVGFpbF0pKSA9PSBudWxsIHx8XHJcbiAgICAgICAgb2xkS2V5ICE9PSBnZXRLZXkobmV3VktpZHNbbmV3VGFpbF0pXHJcbiAgICAgICkge1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhdGNoKFxyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkVGFpbF0ubm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRUYWlsXSxcclxuICAgICAgICAobmV3VktpZHNbbmV3VGFpbF0gPSBnZXRWTm9kZShcclxuICAgICAgICAgIG5ld1ZLaWRzW25ld1RhaWwtLV0sXHJcbiAgICAgICAgICBvbGRWS2lkc1tvbGRUYWlsLS1dXHJcbiAgICAgICAgKSksXHJcbiAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgaXNTdmdcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvbGRIZWFkID4gb2xkVGFpbCkge1xyXG4gICAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsKSB7XHJcbiAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUoXHJcbiAgICAgICAgICBjcmVhdGVOb2RlKFxyXG4gICAgICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShuZXdWS2lkc1tuZXdIZWFkKytdKSksXHJcbiAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgIChvbGRWS2lkID0gb2xkVktpZHNbb2xkSGVhZF0pICYmIG9sZFZLaWQubm9kZVxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChuZXdIZWFkID4gbmV3VGFpbCkge1xyXG4gICAgICB3aGlsZSAob2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkc1tvbGRIZWFkKytdLm5vZGUpXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSBvbGRIZWFkLCBrZXllZCA9IHt9LCBuZXdLZXllZCA9IHt9OyBpIDw9IG9sZFRhaWw7IGkrKykge1xyXG4gICAgICAgIGlmICgob2xkS2V5ID0gb2xkVktpZHNbaV0ua2V5KSAhPSBudWxsKSB7XHJcbiAgICAgICAgICBrZXllZFtvbGRLZXldID0gb2xkVktpZHNbaV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwpIHtcclxuICAgICAgICBvbGRLZXkgPSBnZXRLZXkoKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkXSkpXHJcbiAgICAgICAgbmV3S2V5ID0gZ2V0S2V5KFxyXG4gICAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUobmV3VktpZHNbbmV3SGVhZF0sIG9sZFZLaWQpKVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgbmV3S2V5ZWRbb2xkS2V5XSB8fFxyXG4gICAgICAgICAgKG5ld0tleSAhPSBudWxsICYmIG5ld0tleSA9PT0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWQgKyAxXSkpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV3S2V5ID09IG51bGwgfHwgb2xkVk5vZGUudHlwZSA9PT0gUkVDWUNMRURfTk9ERSkge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZCAmJiBvbGRWS2lkLm5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZCxcclxuICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIG5ld0hlYWQrK1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgb2xkSGVhZCsrXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT09IG5ld0tleSkge1xyXG4gICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLFxyXG4gICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgbmV3S2V5ZWRbbmV3S2V5XSA9IHRydWVcclxuICAgICAgICAgICAgb2xkSGVhZCsrXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoKHRtcFZLaWQgPSBrZXllZFtuZXdLZXldKSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgbm9kZS5pbnNlcnRCZWZvcmUodG1wVktpZC5ub2RlLCBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSksXHJcbiAgICAgICAgICAgICAgICB0bXBWS2lkLFxyXG4gICAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgIG5ld0tleWVkW25ld0tleV0gPSB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgb2xkVktpZCAmJiBvbGRWS2lkLm5vZGUsXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBuZXdIZWFkKytcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdoaWxlIChvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgICBpZiAoZ2V0S2V5KChvbGRWS2lkID0gb2xkVktpZHNbb2xkSGVhZCsrXSkpID09IG51bGwpIHtcclxuICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQob2xkVktpZC5ub2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICh2YXIgaSBpbiBrZXllZCkge1xyXG4gICAgICAgIGlmIChuZXdLZXllZFtpXSA9PSBudWxsKSB7XHJcbiAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKGtleWVkW2ldLm5vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKG5ld1ZOb2RlLm5vZGUgPSBub2RlKVxyXG59XHJcblxyXG52YXIgcHJvcHNDaGFuZ2VkID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIGZvciAodmFyIGsgaW4gYSkgaWYgKGFba10gIT09IGJba10pIHJldHVybiB0cnVlXHJcbiAgZm9yICh2YXIgayBpbiBiKSBpZiAoYVtrXSAhPT0gYltrXSkgcmV0dXJuIHRydWVcclxufVxyXG5cclxudmFyIGdldFRleHRWTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICByZXR1cm4gdHlwZW9mIG5vZGUgPT09IFwib2JqZWN0XCIgPyBub2RlIDogY3JlYXRlVGV4dFZOb2RlKG5vZGUpXHJcbn1cclxuXHJcbnZhciBnZXRWTm9kZSA9IGZ1bmN0aW9uKG5ld1ZOb2RlLCBvbGRWTm9kZSkge1xyXG4gIHJldHVybiBuZXdWTm9kZS50eXBlID09PSBMQVpZX05PREVcclxuICAgID8gKCghb2xkVk5vZGUgfHwgIW9sZFZOb2RlLmxhenkgfHwgcHJvcHNDaGFuZ2VkKG9sZFZOb2RlLmxhenksIG5ld1ZOb2RlLmxhenkpKVxyXG4gICAgICAgICYmICgob2xkVk5vZGUgPSBnZXRUZXh0Vk5vZGUobmV3Vk5vZGUubGF6eS52aWV3KG5ld1ZOb2RlLmxhenkpKSkubGF6eSA9XHJcbiAgICAgICAgICBuZXdWTm9kZS5sYXp5KSxcclxuICAgICAgb2xkVk5vZGUpXHJcbiAgICA6IG5ld1ZOb2RlXHJcbn1cclxuXHJcbnZhciBjcmVhdGVWTm9kZSA9IGZ1bmN0aW9uKG5hbWUsIHByb3BzLCBjaGlsZHJlbiwgbm9kZSwga2V5LCB0eXBlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6IG5hbWUsXHJcbiAgICBwcm9wczogcHJvcHMsXHJcbiAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICBub2RlOiBub2RlLFxyXG4gICAgdHlwZTogdHlwZSxcclxuICAgIGtleToga2V5XHJcbiAgfVxyXG59XHJcblxyXG52YXIgY3JlYXRlVGV4dFZOb2RlID0gZnVuY3Rpb24odmFsdWUsIG5vZGUpIHtcclxuICByZXR1cm4gY3JlYXRlVk5vZGUodmFsdWUsIEVNUFRZX09CSiwgRU1QVFlfQVJSLCBub2RlLCB1bmRlZmluZWQsIFRFWFRfTk9ERSlcclxufVxyXG5cclxudmFyIHJlY3ljbGVOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gIHJldHVybiBub2RlLm5vZGVUeXBlID09PSBURVhUX05PREVcclxuICAgID8gY3JlYXRlVGV4dFZOb2RlKG5vZGUubm9kZVZhbHVlLCBub2RlKVxyXG4gICAgOiBjcmVhdGVWTm9kZShcclxuICAgICAgICBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCksXHJcbiAgICAgICAgRU1QVFlfT0JKLFxyXG4gICAgICAgIG1hcC5jYWxsKG5vZGUuY2hpbGROb2RlcywgcmVjeWNsZU5vZGUpLFxyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgdW5kZWZpbmVkLFxyXG4gICAgICAgIFJFQ1lDTEVEX05PREVcclxuICAgICAgKVxyXG59XHJcblxyXG5leHBvcnQgdmFyIExhenkgPSBmdW5jdGlvbihwcm9wcykge1xyXG4gIHJldHVybiB7XHJcbiAgICBsYXp5OiBwcm9wcyxcclxuICAgIHR5cGU6IExBWllfTk9ERVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBoID0gZnVuY3Rpb24obmFtZSwgcHJvcHMpIHtcclxuICBmb3IgKHZhciB2ZG9tLCByZXN0ID0gW10sIGNoaWxkcmVuID0gW10sIGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOyApIHtcclxuICAgIHJlc3QucHVzaChhcmd1bWVudHNbaV0pXHJcbiAgfVxyXG5cclxuICB3aGlsZSAocmVzdC5sZW5ndGggPiAwKSB7XHJcbiAgICBpZiAoaXNBcnJheSgodmRvbSA9IHJlc3QucG9wKCkpKSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gdmRvbS5sZW5ndGg7IGktLSA+IDA7ICkge1xyXG4gICAgICAgIHJlc3QucHVzaCh2ZG9tW2ldKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHZkb20gPT09IGZhbHNlIHx8IHZkb20gPT09IHRydWUgfHwgdmRvbSA9PSBudWxsKSB7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjaGlsZHJlbi5wdXNoKGdldFRleHRWTm9kZSh2ZG9tKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb3BzID0gcHJvcHMgfHwgRU1QVFlfT0JKXHJcblxyXG4gIHJldHVybiB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICA/IG5hbWUocHJvcHMsIGNoaWxkcmVuKVxyXG4gICAgOiBjcmVhdGVWTm9kZShuYW1lLCBwcm9wcywgY2hpbGRyZW4sIHVuZGVmaW5lZCwgcHJvcHMua2V5KVxyXG59XHJcblxyXG5leHBvcnQgdmFyIGFwcCA9IGZ1bmN0aW9uKHByb3BzKSB7XHJcbiAgdmFyIHN0YXRlID0ge31cclxuICB2YXIgbG9jayA9IGZhbHNlXHJcbiAgdmFyIHZpZXcgPSBwcm9wcy52aWV3XHJcbiAgdmFyIG5vZGUgPSBwcm9wcy5ub2RlXHJcbiAgdmFyIHZkb20gPSBub2RlICYmIHJlY3ljbGVOb2RlKG5vZGUpXHJcbiAgdmFyIHN1YnNjcmlwdGlvbnMgPSBwcm9wcy5zdWJzY3JpcHRpb25zXHJcbiAgdmFyIHN1YnMgPSBbXVxyXG4gIHZhciBvbkVuZCA9IHByb3BzLm9uRW5kXHJcblxyXG4gIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBkaXNwYXRjaCh0aGlzLmFjdGlvbnNbZXZlbnQudHlwZV0sIGV2ZW50KVxyXG4gIH1cclxuXHJcbiAgdmFyIHNldFN0YXRlID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcclxuICAgIGlmIChzdGF0ZSAhPT0gbmV3U3RhdGUpIHtcclxuICAgICAgc3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xyXG4gICAgICAgIHN1YnMgPSBwYXRjaFN1YnMoc3VicywgYmF0Y2goW3N1YnNjcmlwdGlvbnMoc3RhdGUpXSksIGRpc3BhdGNoKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh2aWV3ICYmICFsb2NrKSBkZWZlcihyZW5kZXIsIChsb2NrID0gdHJ1ZSkpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RhdGVcclxuICB9XHJcblxyXG4gIHZhciBkaXNwYXRjaCA9IChwcm9wcy5taWRkbGV3YXJlIHx8XHJcbiAgICBmdW5jdGlvbihvYmopIHtcclxuICAgICAgcmV0dXJuIG9ialxyXG4gICAgfSkoZnVuY3Rpb24oYWN0aW9uLCBwcm9wcykge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBhY3Rpb24gPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICA/IGRpc3BhdGNoKGFjdGlvbihzdGF0ZSwgcHJvcHMpKVxyXG4gICAgICA6IGlzQXJyYXkoYWN0aW9uKVxyXG4gICAgICA/IHR5cGVvZiBhY3Rpb25bMF0gPT09IFwiZnVuY3Rpb25cIiB8fCBpc0FycmF5KGFjdGlvblswXSlcclxuICAgICAgICA/IGRpc3BhdGNoKFxyXG4gICAgICAgICAgICBhY3Rpb25bMF0sXHJcbiAgICAgICAgICAgIHR5cGVvZiBhY3Rpb25bMV0gPT09IFwiZnVuY3Rpb25cIiA/IGFjdGlvblsxXShwcm9wcykgOiBhY3Rpb25bMV1cclxuICAgICAgICAgIClcclxuICAgICAgICA6IChiYXRjaChhY3Rpb24uc2xpY2UoMSkpLm1hcChmdW5jdGlvbihmeCkge1xyXG4gICAgICAgICAgICBmeCAmJiBmeFswXShkaXNwYXRjaCwgZnhbMV0pXHJcbiAgICAgICAgICB9LCBzZXRTdGF0ZShhY3Rpb25bMF0pKSxcclxuICAgICAgICAgIHN0YXRlKVxyXG4gICAgICA6IHNldFN0YXRlKGFjdGlvbilcclxuICB9KVxyXG5cclxuICB2YXIgcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsb2NrID0gZmFsc2VcclxuICAgIG5vZGUgPSBwYXRjaChcclxuICAgICAgbm9kZS5wYXJlbnROb2RlLFxyXG4gICAgICBub2RlLFxyXG4gICAgICB2ZG9tLFxyXG4gICAgICAodmRvbSA9IGdldFRleHRWTm9kZSh2aWV3KHN0YXRlKSkpLFxyXG4gICAgICBsaXN0ZW5lclxyXG4gICAgKVxyXG4gICAgb25FbmQoKVxyXG4gIH1cclxuXHJcbiAgZGlzcGF0Y2gocHJvcHMuaW5pdClcclxufVxyXG4iLCJ2YXIgdGltZUZ4ID0gZnVuY3Rpb24gKGZ4OiBhbnkpIHtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKFxyXG4gICAgICAgIGFjdGlvbjogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgZngsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgZGVsYXk6IHByb3BzLmRlbGF5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdO1xyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCB2YXIgdGltZW91dCA9IHRpbWVGeChcclxuXHJcbiAgICBmdW5jdGlvbiAoXHJcbiAgICAgICAgZGlzcGF0Y2g6IGFueSxcclxuICAgICAgICBwcm9wczogYW55KSB7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChwcm9wcy5hY3Rpb24pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwcm9wcy5kZWxheVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbik7XHJcblxyXG5leHBvcnQgdmFyIGludGVydmFsID0gdGltZUZ4KFxyXG5cclxuICAgIGZ1bmN0aW9uIChcclxuICAgICAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgdmFyIGlkID0gc2V0SW50ZXJ2YWwoXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIERhdGUubm93KClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzLmRlbGF5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaWQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbik7XHJcblxyXG5cclxuLy8gZXhwb3J0IHZhciBub3dcclxuLy8gZXhwb3J0IHZhciByZXRyeVxyXG4vLyBleHBvcnQgdmFyIGRlYm91bmNlXHJcbi8vIGV4cG9ydCB2YXIgdGhyb3R0bGVcclxuLy8gZXhwb3J0IHZhciBpZGxlQ2FsbGJhY2s/XHJcbiIsIlxyXG5pbXBvcnQgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1wiO1xyXG5pbXBvcnQgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jayBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2tcIjtcclxuaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBJSHR0cE91dHB1dCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwT3V0cHV0XCI7XHJcbmltcG9ydCB7IElIdHRwU2VxdWVudGlhbEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBTZXF1ZW50aWFsRmV0Y2hJdGVtXCI7XHJcblxyXG5jb25zdCBzZXF1ZW50aWFsSHR0cEVmZmVjdCA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBzZXF1ZW50aWFsQmxvY2tzOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrPik6IHZvaWQgPT4ge1xyXG5cclxuICAgIC8vIEVhY2ggSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jayB3aWxsIHJ1biBzZXF1ZW50aWFsbHlcclxuICAgIC8vIEVhY2ggSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgaW4gZWFjaCBibG9jayB3aWxsIHJ1bm4gaW4gcGFyYWxsZWxcclxuICAgIGxldCBibG9jazogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jaztcclxuICAgIGxldCBzdWNjZXNzOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIGxldCBodHRwQ2FsbDogYW55O1xyXG4gICAgbGV0IGxhc3RIdHRwQ2FsbDogYW55O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSBzZXF1ZW50aWFsQmxvY2tzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICAgIGJsb2NrID0gc2VxdWVudGlhbEJsb2Nrc1tpXTtcclxuXHJcbiAgICAgICAgaWYgKGJsb2NrID09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShibG9jaykpIHtcclxuXHJcbiAgICAgICAgICAgIGh0dHBDYWxsID0ge1xyXG4gICAgICAgICAgICAgICAgZGVsZWdhdGU6IHByb2Nlc3NCbG9jayxcclxuICAgICAgICAgICAgICAgIGRpc3BhdGNoOiBkaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgIGJsb2NrOiBibG9jayxcclxuICAgICAgICAgICAgICAgIGluZGV4OiBgJHtpfWBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaHR0cENhbGwgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZTogcHJvY2Vzc1Byb3BzLFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxyXG4gICAgICAgICAgICAgICAgYmxvY2s6IGJsb2NrLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGAke2l9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxhc3RIdHRwQ2FsbCkge1xyXG5cclxuICAgICAgICAgICAgaHR0cENhbGwubmV4dEh0dHBDYWxsID0gbGFzdEh0dHBDYWxsO1xyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SW5kZXggPSBsYXN0SHR0cENhbGwuaW5kZXg7XHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRCbG9jayA9IGxhc3RIdHRwQ2FsbC5ibG9jaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxhc3RIdHRwQ2FsbCA9IGh0dHBDYWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChodHRwQ2FsbCkge1xyXG5cclxuICAgICAgICBodHRwQ2FsbC5kZWxlZ2F0ZShcclxuICAgICAgICAgICAgaHR0cENhbGwuZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLmJsb2NrLFxyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SHR0cENhbGwsXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLmluZGV4XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgcHJvY2Vzc0Jsb2NrID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIGJsb2NrOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrLFxyXG4gICAgbmV4dERlbGVnYXRlOiBhbnkpOiB2b2lkID0+IHtcclxuXHJcbiAgICBsZXQgcGFyYWxsZWxQcm9wczogQXJyYXk8SUh0dHBBdXRoZW50aWNhdGVkUHJvcHM+ID0gYmxvY2sgYXMgQXJyYXk8SUh0dHBBdXRoZW50aWNhdGVkUHJvcHM+O1xyXG4gICAgY29uc3QgZGVsZWdhdGVzOiBhbnlbXSA9IFtdO1xyXG4gICAgbGV0IHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcztcclxuXHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhcmFsbGVsUHJvcHMubGVuZ3RoOyBqKyspIHtcclxuXHJcbiAgICAgICAgcHJvcHMgPSBwYXJhbGxlbFByb3BzW2pdO1xyXG5cclxuICAgICAgICBkZWxlZ2F0ZXMucHVzaChcclxuICAgICAgICAgICAgcHJvY2Vzc1Byb3BzKFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICBwcm9wcyxcclxuICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZSxcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIFByb21pc2VcclxuICAgICAgICAgICAgLmFsbChkZWxlZ2F0ZXMpXHJcbiAgICAgICAgICAgIC50aGVuKClcclxuICAgICAgICAgICAgLmNhdGNoKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzUHJvcHMgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzLFxyXG4gICAgbmV4dERlbGVnYXRlOiBhbnkpOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXByb3BzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dHB1dDogSUh0dHBPdXRwdXQgPSB7XHJcbiAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgIHVybDogcHJvcHMudXJsLFxyXG4gICAgICAgIGF1dGhlbnRpY2F0aW9uRmFpbDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBcInRleHRcIixcclxuICAgIH07XHJcblxyXG4gICAgaHR0cChcclxuICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBvdXRwdXQsXHJcbiAgICAgICAgbmV4dERlbGVnYXRlXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgaHR0cEVmZmVjdCA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFwcm9wcykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdXRwdXQ6IElIdHRwT3V0cHV0ID0ge1xyXG4gICAgICAgIG9rOiBmYWxzZSxcclxuICAgICAgICB1cmw6IHByb3BzLnVybCxcclxuICAgICAgICBhdXRoZW50aWNhdGlvbkZhaWw6IGZhbHNlLFxyXG4gICAgICAgIHBhcnNlVHlwZTogcHJvcHMucGFyc2VUeXBlID8/ICdqc29uJyxcclxuICAgIH07XHJcblxyXG4gICAgaHR0cChcclxuICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICBwcm9wcyxcclxuICAgICAgICBvdXRwdXRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBodHRwID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyxcclxuICAgIG91dHB1dDogSUh0dHBPdXRwdXQsXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSA9IG51bGwpOiB2b2lkID0+IHtcclxuXHJcbiAgICBmZXRjaChcclxuICAgICAgICBwcm9wcy51cmwsXHJcbiAgICAgICAgcHJvcHMub3B0aW9ucylcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIG91dHB1dC5vayA9IHJlc3BvbnNlLm9rID09PSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgICAgICAgIG91dHB1dC50eXBlID0gcmVzcG9uc2UudHlwZTtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5yZWRpcmVjdGVkID0gcmVzcG9uc2UucmVkaXJlY3RlZDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuY2FsbElEID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDYWxsSURcIikgYXMgc3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5jb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiY29udGVudC10eXBlXCIpIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dC5jb250ZW50VHlwZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBvdXRwdXQuY29udGVudFR5cGUuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucGFyc2VUeXBlID0gXCJqc29uXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuYXV0aGVudGljYXRpb25GYWlsID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLm9uQXV0aGVudGljYXRpb25GYWlsQWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQucmVzcG9uc2VOdWxsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LmVycm9yICs9IGBFcnJvciB0aHJvd24gd2l0aCByZXNwb25zZS50ZXh0KClcclxuYDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG5cclxuICAgICAgICAgICAgb3V0cHV0LnRleHREYXRhID0gcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3VsdFxyXG4gICAgICAgICAgICAgICAgJiYgb3V0cHV0LnBhcnNlVHlwZSA9PT0gJ2pzb24nXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0Lmpzb25EYXRhID0gSlNPTi5wYXJzZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5lcnJvciArPSBgRXJyb3IgdGhyb3duIHBhcnNpbmcgcmVzcG9uc2UudGV4dCgpIGFzIGpzb25cclxuYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFvdXRwdXQub2spIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRpc3BhdGNoKFxyXG4gICAgICAgICAgICAgICAgcHJvcHMuYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobmV4dERlbGVnYXRlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHREZWxlZ2F0ZS5kZWxlZ2F0ZShcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLmJsb2NrLFxyXG4gICAgICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZS5uZXh0SHR0cENhbGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLmluZGV4XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQuZXJyb3IgKz0gZXJyb3I7XHJcblxyXG4gICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgIHByb3BzLmVycm9yLFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSlcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnSHR0cCA9IChwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMpOiBJSHR0cEZldGNoSXRlbSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBodHRwRWZmZWN0LFxyXG4gICAgICAgIHByb3BzXHJcbiAgICBdXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnU2VxdWVudGlhbEh0dHAgPSAocHJvcHNCbG9jazogQXJyYXk8SUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9jaz4pOiBJSHR0cFNlcXVlbnRpYWxGZXRjaEl0ZW0gPT4ge1xyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgc2VxdWVudGlhbEh0dHBFZmZlY3QsXHJcbiAgICAgICAgcHJvcHNCbG9ja1xyXG4gICAgXVxyXG59XHJcbiIsIlxyXG5jb25zdCBLZXlzID0ge1xyXG5cclxuICAgIHN0YXJ0VXJsOiAnc3RhcnRVcmwnLFxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBLZXlzO1xyXG5cclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEh0dHBFZmZlY3QgaW1wbGVtZW50cyBJSHR0cEVmZmVjdCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIHBhcnNlVHlwZTogUGFyc2VUeXBlLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXkpIHtcclxuXHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLnVybCA9IHVybDtcclxuICAgICAgICB0aGlzLnBhcnNlVHlwZSA9IHBhcnNlVHlwZTtcclxuICAgICAgICB0aGlzLmFjdGlvbkRlbGVnYXRlID0gYWN0aW9uRGVsZWdhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxuICAgIHB1YmxpYyBwYXJzZVR5cGU6IFBhcnNlVHlwZTtcclxuICAgIHB1YmxpYyBhY3Rpb25EZWxlZ2F0ZTogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5O1xyXG59XHJcbiIsIlxyXG5cclxuY29uc3QgZ1V0aWxpdGllcyA9IHtcclxuXHJcbiAgICByb3VuZFVwVG9OZWFyZXN0VGVuOiAodmFsdWU6IG51bWJlcikgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBmbG9vciA9IE1hdGguZmxvb3IodmFsdWUgLyAxMCk7XHJcblxyXG4gICAgICAgIHJldHVybiAoZmxvb3IgKyAxKSAqIDEwO1xyXG4gICAgfSxcclxuXHJcbiAgICByb3VuZERvd25Ub05lYXJlc3RUZW46ICh2YWx1ZTogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZsb29yID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZsb29yICogMTA7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbnZlcnRNbVRvRmVldEluY2hlczogKG1tOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBpbmNoZXMgPSBtbSAqIDAuMDM5Mzc7XHJcblxyXG4gICAgICAgIHJldHVybiBnVXRpbGl0aWVzLmNvbnZlcnRJbmNoZXNUb0ZlZXRJbmNoZXMoaW5jaGVzKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5kZXhPZkFueTogKFxyXG4gICAgICAgIGlucHV0OiBzdHJpbmcsXHJcbiAgICAgICAgY2hhcnM6IHN0cmluZ1tdLFxyXG4gICAgICAgIHN0YXJ0SW5kZXggPSAwXHJcbiAgICApOiBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hhcnMuaW5jbHVkZXMoaW5wdXRbaV0pID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RGlyZWN0b3J5OiAoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHZhciBtYXRjaGVzID0gZmlsZVBhdGgubWF0Y2goLyguKilbXFwvXFxcXF0vKTtcclxuXHJcbiAgICAgICAgaWYgKG1hdGNoZXNcclxuICAgICAgICAgICAgJiYgbWF0Y2hlcy5sZW5ndGggPiAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzWzFdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfSxcclxuXHJcbiAgICBjb3VudENoYXJhY3RlcjogKFxyXG4gICAgICAgIGlucHV0OiBzdHJpbmcsXHJcbiAgICAgICAgY2hhcmFjdGVyOiBzdHJpbmcpID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICBsZXQgY291bnQgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoaW5wdXRbaV0gPT09IGNoYXJhY3Rlcikge1xyXG4gICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBjb252ZXJ0SW5jaGVzVG9GZWV0SW5jaGVzOiAoaW5jaGVzOiBudW1iZXIpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBmZWV0ID0gTWF0aC5mbG9vcihpbmNoZXMgLyAxMik7XHJcbiAgICAgICAgY29uc3QgaW5jaGVzUmVhbWluaW5nID0gaW5jaGVzICUgMTI7XHJcbiAgICAgICAgY29uc3QgaW5jaGVzUmVhbWluaW5nUm91bmRlZCA9IE1hdGgucm91bmQoaW5jaGVzUmVhbWluaW5nICogMTApIC8gMTA7IC8vIDEgZGVjaW1hbCBwbGFjZXNcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDogc3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKGZlZXQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBgJHtmZWV0fScgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbmNoZXNSZWFtaW5pbmdSb3VuZGVkID4gMCkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gYCR7cmVzdWx0fSR7aW5jaGVzUmVhbWluaW5nUm91bmRlZH1cImA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSxcclxuXHJcbiAgICBpc051bGxPcldoaXRlU3BhY2U6IChpbnB1dDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoaW5wdXQgPT09IG51bGxcclxuICAgICAgICAgICAgfHwgaW5wdXQgPT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbnB1dCA9IGAke2lucHV0fWA7XHJcblxyXG4gICAgICAgIHJldHVybiBpbnB1dC5tYXRjaCgvXlxccyokLykgIT09IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrQXJyYXlzRXF1YWw6IChhOiBzdHJpbmdbXSwgYjogc3RyaW5nW10pOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGEgPT09IGIpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGEgPT09IG51bGxcclxuICAgICAgICAgICAgfHwgYiA9PT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgeW91IGRvbid0IGNhcmUgYWJvdXQgdGhlIG9yZGVyIG9mIHRoZSBlbGVtZW50cyBpbnNpZGVcclxuICAgICAgICAvLyB0aGUgYXJyYXksIHlvdSBzaG91bGQgc29ydCBib3RoIGFycmF5cyBoZXJlLlxyXG4gICAgICAgIC8vIFBsZWFzZSBub3RlIHRoYXQgY2FsbGluZyBzb3J0IG9uIGFuIGFycmF5IHdpbGwgbW9kaWZ5IHRoYXQgYXJyYXkuXHJcbiAgICAgICAgLy8geW91IG1pZ2h0IHdhbnQgdG8gY2xvbmUgeW91ciBhcnJheSBmaXJzdC5cclxuXHJcbiAgICAgICAgY29uc3QgeDogc3RyaW5nW10gPSBbLi4uYV07XHJcbiAgICAgICAgY29uc3QgeTogc3RyaW5nW10gPSBbLi4uYl07XHJcblxyXG4gICAgICAgIHguc29ydCgpO1xyXG4gICAgICAgIHkuc29ydCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4W2ldICE9PSB5W2ldKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgc2h1ZmZsZShhcnJheTogQXJyYXk8YW55Pik6IEFycmF5PGFueT4ge1xyXG5cclxuICAgICAgICBsZXQgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgIGxldCB0ZW1wb3JhcnlWYWx1ZTogYW55XHJcbiAgICAgICAgbGV0IHJhbmRvbUluZGV4OiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8vIFdoaWxlIHRoZXJlIHJlbWFpbiBlbGVtZW50cyB0byBzaHVmZmxlLi4uXHJcbiAgICAgICAgd2hpbGUgKDAgIT09IGN1cnJlbnRJbmRleCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXHJcbiAgICAgICAgICAgIHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgY3VycmVudEluZGV4IC09IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXHJcbiAgICAgICAgICAgIHRlbXBvcmFyeVZhbHVlID0gYXJyYXlbY3VycmVudEluZGV4XTtcclxuICAgICAgICAgICAgYXJyYXlbY3VycmVudEluZGV4XSA9IGFycmF5W3JhbmRvbUluZGV4XTtcclxuICAgICAgICAgICAgYXJyYXlbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXJyYXk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTnVtZXJpYzogKGlucHV0OiBhbnkpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICFpc05hTihpbnB1dCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTmVnYXRpdmVOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdW1lcmljKGlucHV0KSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICtpbnB1dCA8IDA7IC8vICsgY29udmVydHMgYSBzdHJpbmcgdG8gYSBudW1iZXIgaWYgaXQgY29uc2lzdHMgb25seSBvZiBkaWdpdHMuXHJcbiAgICB9LFxyXG5cclxuICAgIGhhc0R1cGxpY2F0ZXM6IDxUPihpbnB1dDogQXJyYXk8VD4pOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKG5ldyBTZXQoaW5wdXQpLnNpemUgIT09IGlucHV0Lmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGV4dGVuZDogPFQ+KGFycmF5MTogQXJyYXk8VD4sIGFycmF5MjogQXJyYXk8VD4pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgYXJyYXkyLmZvckVhY2goKGl0ZW06IFQpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGFycmF5MS5wdXNoKGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcmV0dHlQcmludEpzb25Gcm9tU3RyaW5nOiAoaW5wdXQ6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWlucHV0KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnVXRpbGl0aWVzLnByZXR0eVByaW50SnNvbkZyb21PYmplY3QoSlNPTi5wYXJzZShpbnB1dCkpO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcmV0dHlQcmludEpzb25Gcm9tT2JqZWN0OiAoaW5wdXQ6IG9iamVjdCB8IG51bGwpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWlucHV0KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgIDQgLy8gaW5kZW50ZWQgNCBzcGFjZXNcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBpc1Bvc2l0aXZlTnVtZXJpYzogKGlucHV0OiBhbnkpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVtZXJpYyhpbnB1dCkpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBOdW1iZXIoaW5wdXQpID49IDA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRpbWU6ICgpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBub3c6IERhdGUgPSBuZXcgRGF0ZShEYXRlLm5vdygpKTtcclxuICAgICAgICBjb25zdCB0aW1lOiBzdHJpbmcgPSBgJHtub3cuZ2V0RnVsbFllYXIoKX0tJHsobm93LmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9LSR7bm93LmdldERhdGUoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9ICR7bm93LmdldEhvdXJzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfToke25vdy5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfToke25vdy5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpfTo6JHtub3cuZ2V0TWlsbGlzZWNvbmRzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgzLCAnMCcpfTpgO1xyXG5cclxuICAgICAgICByZXR1cm4gdGltZTtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRCeU5ld0xpbmU6IChpbnB1dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBpbnB1dC5zcGxpdCgvW1xcclxcbl0rLyk7XHJcbiAgICAgICAgY29uc3QgY2xlYW5lZDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG5cclxuICAgICAgICByZXN1bHRzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UodmFsdWUpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2xlYW5lZC5wdXNoKHZhbHVlLnRyaW0oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNsZWFuZWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHNwbGl0QnlQaXBlOiAoaW5wdXQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoaW5wdXQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZXN1bHRzID0gaW5wdXQuc3BsaXQoJ3wnKTtcclxuICAgICAgICBjb25zdCBjbGVhbmVkOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZSh2YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGVhbmVkLnB1c2godmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gY2xlYW5lZDtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRCeU5ld0xpbmVBbmRPcmRlcjogKGlucHV0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXNcclxuICAgICAgICAgICAgLnNwbGl0QnlOZXdMaW5lKGlucHV0KVxyXG4gICAgICAgICAgICAuc29ydCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBqb2luQnlOZXdMaW5lOiAoaW5wdXQ6IEFycmF5PHN0cmluZz4pOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWlucHV0XHJcbiAgICAgICAgICAgIHx8IGlucHV0Lmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0LmpvaW4oJ1xcbicpO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVBbGxDaGlsZHJlbjogKHBhcmVudDogRWxlbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAocGFyZW50LmZpcnN0Q2hpbGQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQocGFyZW50LmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBpc09kZDogKHg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4geCAlIDIgPT09IDE7XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3J0UHJpbnRUZXh0OiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBtYXhMZW5ndGg6IG51bWJlciA9IDEwMCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZpcnN0TmV3TGluZUluZGV4OiBudW1iZXIgPSBnVXRpbGl0aWVzLmdldEZpcnN0TmV3TGluZUluZGV4KGlucHV0KTtcclxuXHJcbiAgICAgICAgaWYgKGZpcnN0TmV3TGluZUluZGV4ID4gMFxyXG4gICAgICAgICAgICAmJiBmaXJzdE5ld0xpbmVJbmRleCA8PSBtYXhMZW5ndGgpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IGlucHV0LnN1YnN0cigwLCBmaXJzdE5ld0xpbmVJbmRleCAtIDEpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMudHJpbUFuZEFkZEVsbGlwc2lzKG91dHB1dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IG1heExlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGlucHV0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gaW5wdXQuc3Vic3RyKDAsIG1heExlbmd0aCk7XHJcblxyXG4gICAgICAgIHJldHVybiBnVXRpbGl0aWVzLnRyaW1BbmRBZGRFbGxpcHNpcyhvdXRwdXQpO1xyXG4gICAgfSxcclxuXHJcbiAgICB0cmltQW5kQWRkRWxsaXBzaXM6IChpbnB1dDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgbGV0IG91dHB1dDogc3RyaW5nID0gaW5wdXQudHJpbSgpO1xyXG4gICAgICAgIGxldCBwdW5jdHVhdGlvblJlZ2V4OiBSZWdFeHAgPSAvWy4sXFwvIyEkJVxcXiZcXCo7Ont9PVxcLV9gfigpXS9nO1xyXG4gICAgICAgIGxldCBzcGFjZVJlZ2V4OiBSZWdFeHAgPSAvXFxXKy9nO1xyXG4gICAgICAgIGxldCBsYXN0Q2hhcmFjdGVyOiBzdHJpbmcgPSBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBsZXQgbGFzdENoYXJhY3RlcklzUHVuY3R1YXRpb246IGJvb2xlYW4gPVxyXG4gICAgICAgICAgICBwdW5jdHVhdGlvblJlZ2V4LnRlc3QobGFzdENoYXJhY3RlcilcclxuICAgICAgICAgICAgfHwgc3BhY2VSZWdleC50ZXN0KGxhc3RDaGFyYWN0ZXIpO1xyXG5cclxuXHJcbiAgICAgICAgd2hpbGUgKGxhc3RDaGFyYWN0ZXJJc1B1bmN0dWF0aW9uID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQuc3Vic3RyKDAsIG91dHB1dC5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgbGFzdENoYXJhY3RlciA9IG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgICAgICBsYXN0Q2hhcmFjdGVySXNQdW5jdHVhdGlvbiA9XHJcbiAgICAgICAgICAgICAgICBwdW5jdHVhdGlvblJlZ2V4LnRlc3QobGFzdENoYXJhY3RlcilcclxuICAgICAgICAgICAgICAgIHx8IHNwYWNlUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgJHtvdXRwdXR9Li4uYDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Rmlyc3ROZXdMaW5lSW5kZXg6IChpbnB1dDogc3RyaW5nKTogbnVtYmVyID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGNoYXJhY3Rlcjogc3RyaW5nO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBjaGFyYWN0ZXIgPSBpbnB1dFtpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFyYWN0ZXIgPT09ICdcXG4nXHJcbiAgICAgICAgICAgICAgICB8fCBjaGFyYWN0ZXIgPT09ICdcXHInKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBwZXJDYXNlRmlyc3RMZXR0ZXI6IChpbnB1dDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgaW5wdXQuc2xpY2UoMSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdlbmVyYXRlR3VpZDogKHVzZUh5cGVuczogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAgICAgbGV0IGQyID0gKHBlcmZvcm1hbmNlXHJcbiAgICAgICAgICAgICYmIHBlcmZvcm1hbmNlLm5vd1xyXG4gICAgICAgICAgICAmJiAocGVyZm9ybWFuY2Uubm93KCkgKiAxMDAwKSkgfHwgMDtcclxuXHJcbiAgICAgICAgbGV0IHBhdHRlcm4gPSAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4JztcclxuXHJcbiAgICAgICAgaWYgKCF1c2VIeXBlbnMpIHtcclxuICAgICAgICAgICAgcGF0dGVybiA9ICd4eHh4eHh4eHh4eHg0eHh4eXh4eHh4eHh4eHh4eHh4eCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBndWlkID0gcGF0dGVyblxyXG4gICAgICAgICAgICAucmVwbGFjZShcclxuICAgICAgICAgICAgICAgIC9beHldL2csXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgciA9IE1hdGgucmFuZG9tKCkgKiAxNjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByID0gKGQgKyByKSAlIDE2IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZCA9IE1hdGguZmxvb3IoZCAvIDE2KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByID0gKGQyICsgcikgJSAxNiB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQyID0gTWF0aC5mbG9vcihkMiAvIDE2KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYyA9PT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ3VpZDtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tJZkNocm9tZTogKCk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICAvLyBwbGVhc2Ugbm90ZSwgXHJcbiAgICAgICAgLy8gdGhhdCBJRTExIG5vdyByZXR1cm5zIHVuZGVmaW5lZCBhZ2FpbiBmb3Igd2luZG93LmNocm9tZVxyXG4gICAgICAgIC8vIGFuZCBuZXcgT3BlcmEgMzAgb3V0cHV0cyB0cnVlIGZvciB3aW5kb3cuY2hyb21lXHJcbiAgICAgICAgLy8gYnV0IG5lZWRzIHRvIGNoZWNrIGlmIHdpbmRvdy5vcHIgaXMgbm90IHVuZGVmaW5lZFxyXG4gICAgICAgIC8vIGFuZCBuZXcgSUUgRWRnZSBvdXRwdXRzIHRvIHRydWUgbm93IGZvciB3aW5kb3cuY2hyb21lXHJcbiAgICAgICAgLy8gYW5kIGlmIG5vdCBpT1MgQ2hyb21lIGNoZWNrXHJcbiAgICAgICAgLy8gc28gdXNlIHRoZSBiZWxvdyB1cGRhdGVkIGNvbmRpdGlvblxyXG5cclxuICAgICAgICBsZXQgdHNXaW5kb3c6IGFueSA9IHdpbmRvdyBhcyBhbnk7XHJcbiAgICAgICAgbGV0IGlzQ2hyb21pdW0gPSB0c1dpbmRvdy5jaHJvbWU7XHJcbiAgICAgICAgbGV0IHdpbk5hdiA9IHdpbmRvdy5uYXZpZ2F0b3I7XHJcbiAgICAgICAgbGV0IHZlbmRvck5hbWUgPSB3aW5OYXYudmVuZG9yO1xyXG4gICAgICAgIGxldCBpc09wZXJhID0gdHlwZW9mIHRzV2luZG93Lm9wciAhPT0gXCJ1bmRlZmluZWRcIjtcclxuICAgICAgICBsZXQgaXNJRWVkZ2UgPSB3aW5OYXYudXNlckFnZW50LmluZGV4T2YoXCJFZGdlXCIpID4gLTE7XHJcbiAgICAgICAgbGV0IGlzSU9TQ2hyb21lID0gd2luTmF2LnVzZXJBZ2VudC5tYXRjaChcIkNyaU9TXCIpO1xyXG5cclxuICAgICAgICBpZiAoaXNJT1NDaHJvbWUpIHtcclxuICAgICAgICAgICAgLy8gaXMgR29vZ2xlIENocm9tZSBvbiBJT1NcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzQ2hyb21pdW0gIT09IG51bGxcclxuICAgICAgICAgICAgJiYgdHlwZW9mIGlzQ2hyb21pdW0gIT09IFwidW5kZWZpbmVkXCJcclxuICAgICAgICAgICAgJiYgdmVuZG9yTmFtZSA9PT0gXCJHb29nbGUgSW5jLlwiXHJcbiAgICAgICAgICAgICYmIGlzT3BlcmEgPT09IGZhbHNlXHJcbiAgICAgICAgICAgICYmIGlzSUVlZGdlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAvLyBpcyBHb29nbGUgQ2hyb21lXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1V0aWxpdGllczsiLCJpbXBvcnQgSUhpc3RvcnlVcmwgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JSGlzdG9yeVVybFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpc3RvcnlVcmwgaW1wbGVtZW50cyBJSGlzdG9yeVVybCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IodXJsOiBzdHJpbmcpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVybCA9IHVybDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXJsOiBzdHJpbmc7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJTbmFwU2hvdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lSZW5kZXJTbmFwU2hvdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlclNuYXBTaG90IGltcGxlbWVudHMgSVJlbmRlclNuYXBTaG90IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZykge1xyXG5cclxuICAgICAgICB0aGlzLnVybCA9IHVybDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXJsOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgZ3VpZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgY3JlYXRlZDogRGF0ZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIG1vZGlmaWVkOiBEYXRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgZXhwYW5kZWRPcHRpb25JRHM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIHB1YmxpYyBleHBhbmRlZEFuY2lsbGFyeUlEczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG59XHJcbiIsImltcG9ydCBJVXJsQXNzZW1ibGVyIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSVVybEFzc2VtYmxlclwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IEhpc3RvcnlVcmwgZnJvbSBcIi4uLy4uL3N0YXRlL2hpc3RvcnkvSGlzdG9yeVVybFwiO1xyXG5pbXBvcnQgUmVuZGVyU25hcFNob3QgZnJvbSBcIi4uLy4uL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3RcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5jb25zdCBidWlsZFVybEZyb21Sb290ID0gKHJvb3Q6IElSZW5kZXJGcmFnbWVudCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgY29uc3QgdXJsQXNzZW1ibGVyOiBJVXJsQXNzZW1ibGVyID0ge1xyXG5cclxuICAgICAgICB1cmw6IGAke2xvY2F0aW9uLm9yaWdpbn0ke2xvY2F0aW9uLnBhdGhuYW1lfT9gXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyb290LnNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaW50U2VnbWVudEVuZChcclxuICAgICAgICB1cmxBc3NlbWJsZXIsXHJcbiAgICAgICAgcm9vdFxyXG4gICAgKVxyXG5cclxuICAgIHJldHVybiB1cmxBc3NlbWJsZXIudXJsO1xyXG59O1xyXG5cclxuY29uc3QgcHJpbnRTZWdtZW50RW5kID0gKFxyXG4gICAgdXJsQXNzZW1ibGVyOiBJVXJsQXNzZW1ibGVyLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICBsZXQgdXJsID0gdXJsQXNzZW1ibGVyLnVybDtcclxuICAgICAgICB1cmwgPSBgJHt1cmx9fiR7ZnJhZ21lbnQuaWR9YDtcclxuICAgICAgICB1cmxBc3NlbWJsZXIudXJsID0gdXJsO1xyXG5cclxuICAgICAgICBwcmludFNlZ21lbnRFbmQoXHJcbiAgICAgICAgICAgIHVybEFzc2VtYmxlcixcclxuICAgICAgICAgICAgZnJhZ21lbnQubGluay5yb290LFxyXG4gICAgICAgIClcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KSkge1xyXG5cclxuICAgICAgICBsZXQgdXJsID0gdXJsQXNzZW1ibGVyLnVybDtcclxuICAgICAgICB1cmwgPSBgJHt1cmx9XyR7ZnJhZ21lbnQuaWR9YDtcclxuICAgICAgICB1cmxBc3NlbWJsZXIudXJsID0gdXJsO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIWZyYWdtZW50LmxpbmtcclxuICAgICAgICAmJiAhZnJhZ21lbnQuc2VsZWN0ZWRcclxuICAgICkge1xyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH0tJHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpbnRTZWdtZW50RW5kKFxyXG4gICAgICAgIHVybEFzc2VtYmxlcixcclxuICAgICAgICBmcmFnbWVudC5zZWxlY3RlZCxcclxuICAgIClcclxufTtcclxuXHJcblxyXG5jb25zdCBnSGlzdG9yeUNvZGUgPSB7XHJcblxyXG4gICAgcmVzZXRSYXc6ICgpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uYXV0b2ZvY3VzID0gdHJ1ZTtcclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5pc0F1dG9mb2N1c0ZpcnN0UnVuID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgcHVzaEJyb3dzZXJIaXN0b3J5U3RhdGU6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuY3VycmVudFNlY3Rpb24/LmN1cnJlbnRcclxuICAgICAgICAgICAgfHwgIXN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnSGlzdG9yeUNvZGUucmVzZXRSYXcoKTtcclxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcclxuICAgICAgICBsZXQgbGFzdFVybDogc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAod2luZG93Lmhpc3Rvcnkuc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3RVcmwgPSB3aW5kb3cuaGlzdG9yeS5zdGF0ZS51cmw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsYXN0VXJsID0gYCR7bG9jYXRpb24ub3JpZ2lufSR7bG9jYXRpb24ucGF0aG5hbWV9JHtsb2NhdGlvbi5zZWFyY2h9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IGJ1aWxkVXJsRnJvbVJvb3Qoc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlLnJvb3QpO1xyXG5cclxuICAgICAgICBpZiAobGFzdFVybFxyXG4gICAgICAgICAgICAmJiB1cmwgPT09IGxhc3RVcmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICAgICAgICAgIG5ldyBSZW5kZXJTbmFwU2hvdCh1cmwpLFxyXG4gICAgICAgICAgICBcIlwiLFxyXG4gICAgICAgICAgICB1cmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5zdGVwSGlzdG9yeS5oaXN0b3J5Q2hhaW4ucHVzaChuZXcgSGlzdG9yeVVybCh1cmwpKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdIaXN0b3J5Q29kZTtcclxuXHJcbiIsImltcG9ydCB7IFBhcnNlVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZVwiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSUh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3RcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdIaXN0b3J5Q29kZSBmcm9tIFwiLi9nSGlzdG9yeUNvZGVcIjtcclxuXHJcbmxldCBjb3VudCA9IDA7XHJcblxyXG5jb25zdCBnU3RhdGVDb2RlID0ge1xyXG5cclxuICAgIHNldERpcnR5OiAoc3RhdGU6IElTdGF0ZSk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5yYXcgPSBmYWxzZTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmVzaEtleUludDogKHN0YXRlOiBJU3RhdGUpOiBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBuZXh0S2V5ID0gKytzdGF0ZS5uZXh0S2V5O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV4dEtleTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RnJlc2hLZXk6IChzdGF0ZTogSVN0YXRlKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGAke2dTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpfWA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEd1aWRLZXk6ICgpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gVS5nZW5lcmF0ZUd1aWQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmVTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgZ0hpc3RvcnlDb2RlLnB1c2hCcm93c2VySGlzdG9yeVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXdTdGF0ZTogSVN0YXRlID0geyAuLi5zdGF0ZSB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3U3RhdGU7XHJcbiAgICB9LFxyXG5cclxuICAgIEFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgICBwYXJzZVR5cGU6IFBhcnNlVHlwZSxcclxuICAgICAgICB1cmw6IHN0cmluZyxcclxuICAgICAgICBhY3Rpb25EZWxlZ2F0ZTogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codXJsKTtcclxuXHJcbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodXJsLmVuZHNXaXRoKCdpbXlvNkMwOEguaHRtbCcpKSB7XHJcbiAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBlZmZlY3Q6IElIdHRwRWZmZWN0IHwgdW5kZWZpbmVkID0gc3RhdGVcclxuICAgICAgICAgICAgLnJlcGVhdEVmZmVjdHNcclxuICAgICAgICAgICAgLnJlTG9hZEdldEh0dHBJbW1lZGlhdGVcclxuICAgICAgICAgICAgLmZpbmQoKGVmZmVjdDogSUh0dHBFZmZlY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWZmZWN0Lm5hbWUgPT09IG5hbWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoZWZmZWN0KSB7IC8vIGFscmVhZHkgYWRkZWQuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGh0dHBFZmZlY3Q6IElIdHRwRWZmZWN0ID0gbmV3IEh0dHBFZmZlY3QoXHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgcGFyc2VUeXBlLFxyXG4gICAgICAgICAgICBhY3Rpb25EZWxlZ2F0ZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5wdXNoKGh0dHBFZmZlY3QpO1xyXG4gICAgfSxcclxuXHJcbiAgICBBZGRSdW5BY3Rpb25JbW1lZGlhdGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiBJQWN0aW9uKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlLnB1c2goYWN0aW9uRGVsZWdhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZWRfb3V0bGluZU5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIGZyYWdtZW50SUQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWRcclxuICAgICk6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRJRCkpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gZ1N0YXRlQ29kZS5nZXRDYWNoZUtleShcclxuICAgICAgICAgICAgbGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudElEIGFzIHN0cmluZ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZU5vZGVzX2lkW2tleV0gPz8gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPdXRsaW5lTm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2FjaGVfb3V0bGluZU5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lTm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlLmlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZU5vZGVzX2lkW2tleV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfb3V0bGluZU5vZGVzX2lkW2tleV0gPSBvdXRsaW5lTm9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIGZyYWdtZW50SUQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWRcclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gZ1N0YXRlQ29kZS5nZXRDYWNoZUtleShcclxuICAgICAgICAgICAgbGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudElEIGFzIHN0cmluZ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9jaGFpbkZyYWdtZW50c19pZFtrZXldID8/IG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGNhY2hlX2NoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlbmRlckZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFyZW5kZXJGcmFnbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5RnJvbUZyYWdtZW50KHJlbmRlckZyYWdtZW50KTtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGtleSkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkW2tleSBhcyBzdHJpbmddKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkW2tleSBhcyBzdHJpbmddID0gcmVuZGVyRnJhZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldENhY2hlS2V5RnJvbUZyYWdtZW50OiAocmVuZGVyRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5nZXRDYWNoZUtleShcclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LmlkXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2FjaGVLZXk6IChcclxuXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nXHJcbiAgICApOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7bGlua0lEfV8ke2ZyYWdtZW50SUR9YDtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnU3RhdGVDb2RlO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuXHJcblxyXG5jb25zdCBnQXV0aGVudGljYXRpb25Db2RlID0ge1xyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb246IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnVzZXIuYXV0aG9yaXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubmFtZSA9IFwiXCI7XHJcbiAgICAgICAgc3RhdGUudXNlci5zdWIgPSBcIlwiO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubG9nb3V0VXJsID0gXCJcIjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdBdXRoZW50aWNhdGlvbkNvZGU7XHJcbiIsIlxyXG5leHBvcnQgZW51bSBBY3Rpb25UeXBlIHtcclxuXHJcbiAgICBOb25lID0gJ25vbmUnLFxyXG4gICAgRmlsdGVyVG9waWNzID0gJ2ZpbHRlclRvcGljcycsXHJcbiAgICBHZXRUb3BpYyA9ICdnZXRUb3BpYycsXHJcbiAgICBHZXRUb3BpY0FuZFJvb3QgPSAnZ2V0VG9waWNBbmRSb290JyxcclxuICAgIFNhdmVBcnRpY2xlU2NlbmUgPSAnc2F2ZUFydGljbGVTY2VuZScsXHJcbiAgICBHZXRSb290ID0gJ2dldFJvb3QnLFxyXG4gICAgR2V0U3RlcCA9ICdnZXRTdGVwJyxcclxuICAgIEdldFBhZ2UgPSAnZ2V0UGFnZScsXHJcbiAgICBHZXRDaGFpbiA9ICdnZXRDaGFpbicsXHJcbiAgICBHZXRPdXRsaW5lID0gJ2dldE91dGxpbmUnLFxyXG4gICAgR2V0RnJhZ21lbnQgPSAnZ2V0RnJhZ21lbnQnLFxyXG4gICAgR2V0Q2hhaW5GcmFnbWVudCA9ICdnZXRDaGFpbkZyYWdtZW50J1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdBamF4SGVhZGVyQ29kZSA9IHtcclxuXHJcbiAgICBidWlsZEhlYWRlcnM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNhbGxJRDogc3RyaW5nLFxyXG4gICAgICAgIGFjdGlvbjogQWN0aW9uVHlwZSk6IEhlYWRlcnMgPT4ge1xyXG5cclxuICAgICAgICBsZXQgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ1gtQ1NSRicsICcxJyk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ1N1YnNjcmlwdGlvbklEJywgc3RhdGUuc2V0dGluZ3Muc3Vic2NyaXB0aW9uSUQpO1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCdDYWxsSUQnLCBjYWxsSUQpO1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCdBY3Rpb24nLCBhY3Rpb24pO1xyXG5cclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnd2l0aENyZWRlbnRpYWxzJywgJ3RydWUnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGhlYWRlcnM7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQWpheEhlYWRlckNvZGU7XHJcblxyXG4iLCJpbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcblxyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucyBmcm9tIFwiLi9nQXV0aGVudGljYXRpb25BY3Rpb25zXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCB7IElIdHRwRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEZldGNoSXRlbVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cyA9IHtcclxuXHJcbiAgICBjaGVja1VzZXJBdXRoZW50aWNhdGVkOiAoc3RhdGU6IElTdGF0ZSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGNhbGxJRCxcclxuICAgICAgICAgICAgQWN0aW9uVHlwZS5Ob25lXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtzdGF0ZS5zZXR0aW5ncy5iZmZVcmx9LyR7c3RhdGUuc2V0dGluZ3MudXNlclBhdGh9P3NsaWRlPWZhbHNlYDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdBdXRoZW50aWNhdGVkSHR0cCh7XHJcbiAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlc3BvbnNlOiAnanNvbicsXHJcbiAgICAgICAgICAgIGFjdGlvbjogZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5sb2FkU3VjY2Vzc2Z1bEF1dGhlbnRpY2F0aW9uLFxyXG4gICAgICAgICAgICBlcnJvcjogKHN0YXRlOiBJU3RhdGUsIGVycm9yRGV0YWlsczogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciB0cnlpbmcgdG8gYXV0aGVudGljYXRlIHdpdGggdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnQXV0aGVudGljYXRpb25FZmZlY3RzLmNoZWNrVXNlckF1dGhlbnRpY2F0ZWQubmFtZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgdHJ5aW5nIHRvIGF1dGhlbnRpY2F0ZSB3aXRoIHRoZSBzZXJ2ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6IGdBdXRoZW50aWNhdGlvbkVmZmVjdHMuY2hlY2tVc2VyQXV0aGVudGljYXRlZC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGF0ZVwiOiAke0pTT04uc3RyaW5naWZ5KHN0YXRlKX1cclxuICAgICAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cztcclxuIiwiaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBLZXlzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25Db2RlIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkNvZGVcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkVmZmVjdHMgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uRWZmZWN0c1wiO1xyXG5cclxuXHJcbmNvbnN0IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMgPSB7XHJcblxyXG4gICAgbG9hZFN1Y2Nlc3NmdWxBdXRoZW50aWNhdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhcmVzcG9uc2VcclxuICAgICAgICAgICAgfHwgcmVzcG9uc2UucGFyc2VUeXBlICE9PSBcImpzb25cIlxyXG4gICAgICAgICAgICB8fCAhcmVzcG9uc2UuanNvbkRhdGEpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsYWltczogYW55ID0gcmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IG5hbWU6IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ25hbWUnXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3ViOiBhbnkgPSBjbGFpbXMuZmluZChcclxuICAgICAgICAgICAgKGNsYWltOiBhbnkpID0+IGNsYWltLnR5cGUgPT09ICdzdWInXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFuYW1lXHJcbiAgICAgICAgICAgICYmICFzdWIpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvZ291dFVybENsYWltOiBhbnkgPSBjbGFpbXMuZmluZChcclxuICAgICAgICAgICAgKGNsYWltOiBhbnkpID0+IGNsYWltLnR5cGUgPT09ICdiZmY6bG9nb3V0X3VybCdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWxvZ291dFVybENsYWltXHJcbiAgICAgICAgICAgIHx8ICFsb2dvdXRVcmxDbGFpbS52YWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUudXNlci5hdXRob3Jpc2VkID0gdHJ1ZTtcclxuICAgICAgICBzdGF0ZS51c2VyLm5hbWUgPSBuYW1lLnZhbHVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIuc3ViID0gc3ViLnZhbHVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubG9nb3V0VXJsID0gbG9nb3V0VXJsQ2xhaW0udmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja1VzZXJMb2dnZWRJbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BzOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2hlY2tVc2VyTG9nZ2VkSW5Qcm9wcyhzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICghcHJvcHMpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBwcm9wc1xyXG4gICAgICAgIF07XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrVXNlckxvZ2dlZEluUHJvcHM6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS51c2VyLnJhdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cy5jaGVja1VzZXJBdXRoZW50aWNhdGVkKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9naW46IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcblxyXG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXHJcbiAgICAgICAgICAgIEtleXMuc3RhcnRVcmwsXHJcbiAgICAgICAgICAgIGN1cnJlbnRVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3N0YXRlLnNldHRpbmdzLmJmZlVybH0vJHtzdGF0ZS5zZXR0aW5ncy5kZWZhdWx0TG9naW5QYXRofT9yZXR1cm5Vcmw9L2A7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmFzc2lnbih1cmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb246IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG4gICAgICAgIGdBdXRoZW50aWNhdGlvbkNvZGUuY2xlYXJBdXRoZW50aWNhdGlvbihzdGF0ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhckF1dGhlbnRpY2F0aW9uQW5kU2hvd0xvZ2luOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ0F1dGhlbnRpY2F0aW9uQ29kZS5jbGVhckF1dGhlbnRpY2F0aW9uKHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdBdXRoZW50aWNhdGlvbkFjdGlvbnMubG9naW4oc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2dvdXQ6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKHN0YXRlLnVzZXIubG9nb3V0VXJsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucztcclxuIiwiaW1wb3J0IHsgZ0h0dHAgfSBmcm9tIFwiLi9nSHR0cFwiO1xyXG5cclxuaW1wb3J0IElIdHRwQXV0aGVudGljYXRlZFByb3BzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNcIjtcclxuaW1wb3J0IElIdHRwUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cFByb3BzXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25BY3Rpb25zIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkFjdGlvbnNcIjtcclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ0F1dGhlbnRpY2F0ZWRIdHRwKHByb3BzOiBJSHR0cFByb3BzKTogYW55IHtcclxuXHJcbiAgICBjb25zdCBodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzID0gcHJvcHMgYXMgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHM7XHJcblxyXG4gICAgLy8gLy8gVG8gcmVnaXN0ZXIgZmFpbGVkIGF1dGhlbnRpY2F0aW9uXHJcbiAgICAvLyBodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXMub25BdXRoZW50aWNhdGlvbkZhaWxBY3Rpb24gPSBnQXV0aGVudGljYXRpb25BY3Rpb25zLmNsZWFyQXV0aGVudGljYXRpb247XHJcblxyXG4gICAgLy8gVG8gcmVnaXN0ZXIgZmFpbGVkIGF1dGhlbnRpY2F0aW9uIGFuZCBzaG93IGxvZ2luIHBhZ2VcclxuICAgIGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllcy5vbkF1dGhlbnRpY2F0aW9uRmFpbEFjdGlvbiA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2xlYXJBdXRoZW50aWNhdGlvbkFuZFNob3dMb2dpbjtcclxuXHJcbiAgICByZXR1cm4gZ0h0dHAoaHR0cEF1dGhlbnRpY2F0ZWRQcm9wZXJ0aWVzKTtcclxufVxyXG4iLCJcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdBamF4SGVhZGVyQ29kZSBmcm9tIFwiLi4vaHR0cC9nQWpheEhlYWRlckNvZGVcIjtcclxuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IElBY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSUFjdGlvblwiO1xyXG5cclxuY29uc3QgcnVuQWN0aW9uSW5uZXIgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGRpc3BhdGNoKFxyXG4gICAgICAgIHByb3BzLmFjdGlvbixcclxuICAgICk7XHJcbn07XHJcblxyXG5cclxuY29uc3QgcnVuQWN0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHF1ZXVlZEVmZmVjdHM6IEFycmF5PElBY3Rpb24+XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBjb25zdCBlZmZlY3RzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHF1ZXVlZEVmZmVjdHMuZm9yRWFjaCgoYWN0aW9uOiBJQWN0aW9uKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHByb3BzID0ge1xyXG4gICAgICAgICAgICBhY3Rpb246IGFjdGlvbixcclxuICAgICAgICAgICAgZXJyb3I6IChfc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIHJ1bm5pbmcgYWN0aW9uIGluIHJlcGVhdEFjdGlvbnNcIixcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtydW5BY3Rpb259LFxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgcnVubmluZyBhY3Rpb24gaW4gcmVwZWF0QWN0aW9uc1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICBlZmZlY3RzLnB1c2goW1xyXG4gICAgICAgICAgICBydW5BY3Rpb25Jbm5lcixcclxuICAgICAgICAgICAgcHJvcHNcclxuICAgICAgICBdKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBbXHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSksXHJcbiAgICAgICAgLi4uZWZmZWN0c1xyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IHNlbmRSZXF1ZXN0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHF1ZXVlZEVmZmVjdHM6IEFycmF5PElIdHRwRWZmZWN0PlxyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgY29uc3QgZWZmZWN0czogYW55W10gPSBbXTtcclxuXHJcbiAgICBxdWV1ZWRFZmZlY3RzLmZvckVhY2goKGh0dHBFZmZlY3Q6IElIdHRwRWZmZWN0KSA9PiB7XHJcblxyXG4gICAgICAgIGdldEVmZmVjdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGh0dHBFZmZlY3QsXHJcbiAgICAgICAgICAgIGVmZmVjdHMsXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBbXHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSksXHJcbiAgICAgICAgLi4uZWZmZWN0c1xyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IGdldEVmZmVjdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBodHRwRWZmZWN0OiBJSHR0cEVmZmVjdCxcclxuICAgIGVmZmVjdHM6IEFycmF5PElIdHRwRWZmZWN0PlxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCB1cmw6IHN0cmluZyA9IGh0dHBFZmZlY3QudXJsO1xyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgQWN0aW9uVHlwZS5HZXRTdGVwXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGVmZmVjdCA9IGdBdXRoZW50aWNhdGVkSHR0cCh7XHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBodHRwRWZmZWN0LnBhcnNlVHlwZSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzcG9uc2U6ICdqc29uJyxcclxuICAgICAgICBhY3Rpb246IGh0dHBFZmZlY3QuYWN0aW9uRGVsZWdhdGUsXHJcbiAgICAgICAgZXJyb3I6IChfc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgcG9zdGluZyBnUmVwZWF0QWN0aW9ucyBkYXRhIHRvIHRoZSBzZXJ2ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z2V0RWZmZWN0Lm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgcG9zdGluZyBnUmVwZWF0QWN0aW9ucyBkYXRhIHRvIHRoZSBzZXJ2ZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZWZmZWN0cy5wdXNoKGVmZmVjdCk7XHJcbn07XHJcblxyXG5jb25zdCBnUmVwZWF0QWN0aW9ucyA9IHtcclxuXHJcbiAgICBodHRwU2lsZW50UmVMb2FkSW1tZWRpYXRlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gTXVzdCByZXR1cm4gYWx0ZXJlZCBzdGF0ZSBmb3IgdGhlIHN1YnNjcmlwdGlvbiBub3QgdG8gZ2V0IHJlbW92ZWRcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHN0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVMb2FkSHR0cEVmZmVjdHNJbW1lZGlhdGU6IEFycmF5PElIdHRwRWZmZWN0PiA9IHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZTtcclxuICAgICAgICBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJlTG9hZEdldEh0dHBJbW1lZGlhdGUgPSBbXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlbmRSZXF1ZXN0KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVMb2FkSHR0cEVmZmVjdHNJbW1lZGlhdGVcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaWxlbnRSdW5BY3Rpb25JbW1lZGlhdGU6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVwZWF0RWZmZWN0cy5ydW5BY3Rpb25JbW1lZGlhdGUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIE11c3QgcmV0dXJuIGFsdGVyZWQgc3RhdGUgZm9yIHRoZSBzdWJzY3JpcHRpb24gbm90IHRvIGdldCByZW1vdmVkXHJcbiAgICAgICAgICAgIC8vIHJldHVybiBzdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJ1bkFjdGlvbkltbWVkaWF0ZTogQXJyYXk8SUFjdGlvbj4gPSBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZTtcclxuICAgICAgICBzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZSA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4gcnVuQWN0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcnVuQWN0aW9uSW1tZWRpYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZXBlYXRBY3Rpb25zO1xyXG5cclxuIiwiaW1wb3J0IHsgaW50ZXJ2YWwgfSBmcm9tIFwiLi4vLi4vaHlwZXJBcHAvdGltZVwiO1xyXG5cclxuaW1wb3J0IGdSZXBlYXRBY3Rpb25zIGZyb20gXCIuLi9nbG9iYWwvYWN0aW9ucy9nUmVwZWF0QWN0aW9uc1wiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IHJlcGVhdFN1YnNjcmlwdGlvbnMgPSB7XHJcblxyXG4gICAgYnVpbGRSZXBlYXRTdWJzY3JpcHRpb25zOiAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBidWlsZFJlTG9hZERhdGFJbW1lZGlhdGUgPSAoKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJlTG9hZEdldEh0dHBJbW1lZGlhdGUubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbChcclxuICAgICAgICAgICAgICAgICAgICBnUmVwZWF0QWN0aW9ucy5odHRwU2lsZW50UmVMb2FkSW1tZWRpYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHsgZGVsYXk6IDEwIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBidWlsZFJ1bkFjdGlvbnNJbW1lZGlhdGUgPSAoKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsKFxyXG4gICAgICAgICAgICAgICAgICAgIGdSZXBlYXRBY3Rpb25zLnNpbGVudFJ1bkFjdGlvbkltbWVkaWF0ZSxcclxuICAgICAgICAgICAgICAgICAgICB7IGRlbGF5OiAxMCB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVwZWF0U3Vic2NyaXB0aW9uOiBhbnlbXSA9IFtcclxuXHJcbiAgICAgICAgICAgIGJ1aWxkUmVMb2FkRGF0YUltbWVkaWF0ZSgpLFxyXG4gICAgICAgICAgICBidWlsZFJ1bkFjdGlvbnNJbW1lZGlhdGUoKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiByZXBlYXRTdWJzY3JpcHRpb247XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZXBlYXRTdWJzY3JpcHRpb25zO1xyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IHJlcGVhdFN1YnNjcmlwdGlvbnMgZnJvbSBcIi4uLy4uLy4uL3N1YnNjcmlwdGlvbnMvcmVwZWF0U3Vic2NyaXB0aW9uXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdFN1YnNjcmlwdGlvbnMgPSAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uczogYW55W10gPSBbXHJcblxyXG4gICAgICAgIC4uLnJlcGVhdFN1YnNjcmlwdGlvbnMuYnVpbGRSZXBlYXRTdWJzY3JpcHRpb25zKHN0YXRlKVxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9ucztcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdWJzY3JpcHRpb25zO1xyXG5cclxuIiwiXHJcbmNvbnN0IEZpbHRlcnMgPSB7XHJcblxyXG4gICAgdHJlZVNvbHZlR3VpZGVJRDogXCJ0cmVlU29sdmVHdWlkZVwiLFxyXG4gICAgdHJlZVNvbHZlRnJhZ21lbnRzSUQ6IFwidHJlZVNvbHZlRnJhZ21lbnRzXCIsXHJcbiAgICB1cE5hdkVsZW1lbnQ6ICcjc3RlcE5hdiAuY2hhaW4tdXB3YXJkcycsXHJcbiAgICBkb3duTmF2RWxlbWVudDogJyNzdGVwTmF2IC5jaGFpbi1kb3dud2FyZHMnLFxyXG5cclxuICAgIGZyYWdtZW50Qm94OiAnI3RyZWVTb2x2ZUZyYWdtZW50cyAubnQtZnItZnJhZ21lbnQtYm94JyxcclxuICAgIGZyYWdtZW50Qm94RGlzY3Vzc2lvbjogJyN0cmVlU29sdmVGcmFnbWVudHMgLm50LWZyLWZyYWdtZW50LWJveCAubnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbicsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpbHRlcnM7XHJcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5cclxuXHJcbmNvbnN0IG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQgPSAoKSA9PiB7XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRCb3hEaXNjdXNzaW9uczogTm9kZUxpc3RPZjxFbGVtZW50PiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoRmlsdGVycy5mcmFnbWVudEJveERpc2N1c3Npb24pO1xyXG4gICAgbGV0IGZyYWdtZW50Qm94OiBIVE1MRGl2RWxlbWVudDtcclxuICAgIGxldCBkYXRhRGlzY3Vzc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhZ21lbnRCb3hEaXNjdXNzaW9ucy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICBmcmFnbWVudEJveCA9IGZyYWdtZW50Qm94RGlzY3Vzc2lvbnNbaV0gYXMgSFRNTERpdkVsZW1lbnQ7XHJcbiAgICAgICAgZGF0YURpc2N1c3Npb24gPSBmcmFnbWVudEJveC5kYXRhc2V0LmRpc2N1c3Npb247XHJcblxyXG4gICAgICAgIGlmIChkYXRhRGlzY3Vzc2lvbiAhPSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBmcmFnbWVudEJveC5pbm5lckhUTUwgPSBkYXRhRGlzY3Vzc2lvbjtcclxuICAgICAgICAgICAgZGVsZXRlIGZyYWdtZW50Qm94LmRhdGFzZXQuZGlzY3Vzc2lvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkO1xyXG4iLCJpbXBvcnQgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCBmcm9tIFwiLi4vLi4vZnJhZ21lbnRzL2NvZGUvb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZFwiO1xyXG5cclxuXHJcbmNvbnN0IG9uUmVuZGVyRmluaXNoZWQgPSAoKSA9PiB7XHJcblxyXG4gICAgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCgpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgb25SZW5kZXJGaW5pc2hlZDtcclxuIiwiaW1wb3J0IG9uUmVuZGVyRmluaXNoZWQgZnJvbSBcIi4vb25SZW5kZXJGaW5pc2hlZFwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRFdmVudHMgPSB7XHJcblxyXG4gIG9uUmVuZGVyRmluaXNoZWQ6ICgpID0+IHtcclxuXHJcbiAgICBvblJlbmRlckZpbmlzaGVkKCk7XHJcbiAgfSxcclxuXHJcbiAgcmVnaXN0ZXJHbG9iYWxFdmVudHM6ICgpID0+IHtcclxuXHJcbiAgICB3aW5kb3cub25yZXNpemUgPSAoKSA9PiB7XHJcblxyXG4gICAgICBpbml0RXZlbnRzLm9uUmVuZGVyRmluaXNoZWQoKTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0RXZlbnRzO1xyXG5cclxuXHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRBY3Rpb25zID0ge1xyXG5cclxuICAgIHNldE5vdFJhdzogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdz8uVHJlZVNvbHZlPy5zY3JlZW4/LmlzQXV0b2ZvY3VzRmlyc3RSdW4pIHtcclxuXHJcbiAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmF1dG9mb2N1cyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaXNBdXRvZm9jdXNGaXJzdFJ1biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdEFjdGlvbnM7XHJcbiIsIlxyXG5leHBvcnQgZW51bSBQYXJzZVR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBKc29uID0gJ2pzb24nLFxyXG4gICAgVGV4dCA9ICd0ZXh0J1xyXG59XHJcblxyXG4iLCJpbXBvcnQgSVJlbmRlckZyYWdtZW50VUkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlckZyYWdtZW50VUlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJGcmFnbWVudFVJIGltcGxlbWVudHMgSVJlbmRlckZyYWdtZW50VUkge1xyXG5cclxuICAgIHB1YmxpYyBmcmFnbWVudE9wdGlvbnNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGRpc2N1c3Npb25Mb2FkZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBhbmNpbGxhcnlFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG59XHJcbiIsImltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSURpc3BsYXlTZWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlTZWN0aW9uXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50VUkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlckZyYWdtZW50VUlcIjtcclxuaW1wb3J0IFJlbmRlckZyYWdtZW50VUkgZnJvbSBcIi4uL3VpL1JlbmRlckZyYWdtZW50VUlcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJGcmFnbWVudCBpbXBsZW1lbnRzIElSZW5kZXJGcmFnbWVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uLFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyIHwgbnVsbFxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMuc2VjdGlvbiA9IHNlY3Rpb247XHJcbiAgICAgICAgdGhpcy5wYXJlbnRGcmFnbWVudElEID0gcGFyZW50RnJhZ21lbnRJRDtcclxuICAgICAgICB0aGlzLnNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaWQ6IHN0cmluZztcclxuICAgIHB1YmxpYyBpS2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBpRXhpdEtleTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgZXhpdEtleTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgdG9wTGV2ZWxNYXBLZXk6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIG1hcEtleUNoYWluOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBndWlkZUlEOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBndWlkZVBhdGg6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZztcclxuICAgIHB1YmxpYyB2YWx1ZTogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgc2VsZWN0ZWQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGlzTGVhZjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4gPSBbXTtcclxuICAgIHB1YmxpYyB2YXJpYWJsZTogbnVsbCB8IFtzdHJpbmddIHwgW3N0cmluZywgc3RyaW5nIHwgbnVtYmVyXSA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIG9wdGlvbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgaXNBbmNpbGxhcnk6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBvcmRlcjogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgbGluazogSURpc3BsYXlDaGFydCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbjtcclxuICAgIHB1YmxpYyBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGw7XHJcblxyXG4gICAgcHVibGljIHVpOiBJUmVuZGVyRnJhZ21lbnRVSSA9IG5ldyBSZW5kZXJGcmFnbWVudFVJKCk7XHJcbn1cclxuIiwiXHJcbmV4cG9ydCBlbnVtIE91dGxpbmVUeXBlIHtcclxuXHJcbiAgICBOb25lID0gJ25vbmUnLFxyXG4gICAgTm9kZSA9ICdub2RlJyxcclxuICAgIEV4aXQgPSAnZXhpdCcsXHJcbiAgICBMaW5rID0gJ2xpbmsnXHJcbn1cclxuXHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyT3V0bGluZU5vZGUgaW1wbGVtZW50cyBJUmVuZGVyT3V0bGluZU5vZGUge1xyXG5cclxuICAgIHB1YmxpYyBpOiBzdHJpbmcgPSAnJzsgLy8gaWRcclxuICAgIHB1YmxpYyBjOiBudW1iZXIgfCBudWxsID0gbnVsbDsgLy8gaW5kZXggZnJvbSBvdXRsaW5lIGNoYXJ0IGFycmF5XHJcbiAgICBwdWJsaWMgeDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCA9IG51bGw7IC8vIGlFeGl0IGlkXHJcbiAgICBwdWJsaWMgX3g6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQgPSBudWxsOyAvLyBleGl0IGlkXHJcbiAgICBwdWJsaWMgbzogQXJyYXk8SVJlbmRlck91dGxpbmVOb2RlPiA9IFtdOyAvLyBvcHRpb25zXHJcbiAgICBwdWJsaWMgcGFyZW50OiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyB0eXBlOiBPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLk5vZGU7XHJcbiAgICBwdWJsaWMgaXNDaGFydDogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgaXNSb290OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgaXNMYXN0OiBib29sZWFuID0gZmFsc2U7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IFJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuL1JlbmRlck91dGxpbmVOb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyT3V0bGluZSBpbXBsZW1lbnRzIElSZW5kZXJPdXRsaW5lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwYXRoOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nO1xyXG4gICAgcHVibGljIGxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyB2OiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyByOiBJUmVuZGVyT3V0bGluZU5vZGUgPSBuZXcgUmVuZGVyT3V0bGluZU5vZGUoKTtcclxuICAgIHB1YmxpYyBjOiBBcnJheTxJUmVuZGVyT3V0bGluZUNoYXJ0PiA9IFtdO1xyXG4gICAgcHVibGljIGU6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICAgIHB1YmxpYyBtdjogYW55IHwgdW5kZWZpbmVkO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyT3V0bGluZUNoYXJ0IGltcGxlbWVudHMgSVJlbmRlck91dGxpbmVDaGFydCB7XHJcblxyXG4gICAgcHVibGljIGk6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHA6IHN0cmluZyA9ICcnO1xyXG59XHJcbiIsImltcG9ydCBJRGlzcGxheUd1aWRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlHdWlkZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJHdWlkZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckd1aWRlXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IFJlbmRlckZyYWdtZW50IGZyb20gXCIuLi9yZW5kZXIvUmVuZGVyRnJhZ21lbnRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwbGF5R3VpZGUgaW1wbGVtZW50cyBJRGlzcGxheUd1aWRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgICAgICBndWlkZTogSVJlbmRlckd1aWRlLFxyXG4gICAgICAgIHJvb3RJRDogc3RyaW5nXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmxpbmtJRCA9IGxpbmtJRDtcclxuICAgICAgICB0aGlzLmd1aWRlID0gZ3VpZGU7XHJcblxyXG4gICAgICAgIHRoaXMucm9vdCA9IG5ldyBSZW5kZXJGcmFnbWVudChcclxuICAgICAgICAgICAgcm9vdElELFxyXG4gICAgICAgICAgICBcImd1aWRlUm9vdFwiLFxyXG4gICAgICAgICAgICB0aGlzLFxyXG4gICAgICAgICAgICAwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbGlua0lEOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgZ3VpZGU6IElSZW5kZXJHdWlkZTtcclxuICAgIHB1YmxpYyBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHJvb3Q6IElSZW5kZXJGcmFnbWVudDtcclxuICAgIHB1YmxpYyBjdXJyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyR3VpZGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW5kZXJHdWlkZSBpbXBsZW1lbnRzIElSZW5kZXJHdWlkZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZykge1xyXG5cclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlkOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBwYXRoOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiXHJcbmV4cG9ydCBlbnVtIFNjcm9sbEhvcFR5cGUge1xyXG4gICAgTm9uZSA9IFwibm9uZVwiLFxyXG4gICAgVXAgPSBcInVwXCIsXHJcbiAgICBEb3duID0gXCJkb3duXCJcclxufVxyXG4iLCJpbXBvcnQgeyBTY3JvbGxIb3BUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvU2Nyb2xsSG9wVHlwZVwiO1xyXG5pbXBvcnQgSVNjcmVlbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy93aW5kb3cvSVNjcmVlblwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmVlbiBpbXBsZW1lbnRzIElTY3JlZW4ge1xyXG5cclxuICAgIHB1YmxpYyBhdXRvZm9jdXM6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBpc0F1dG9mb2N1c0ZpcnN0UnVuOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBoaWRlQmFubmVyOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgc2Nyb2xsVG9Ub3A6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBzY3JvbGxUb0VsZW1lbnQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHNjcm9sbEhvcDogU2Nyb2xsSG9wVHlwZSA9IFNjcm9sbEhvcFR5cGUuTm9uZTtcclxuICAgIHB1YmxpYyBsYXN0U2Nyb2xsWTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgdWE6IGFueSB8IG51bGwgPSBudWxsO1xyXG59XHJcbiIsImltcG9ydCBJU2NyZWVuIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3dpbmRvdy9JU2NyZWVuXCI7XHJcbmltcG9ydCBJVHJlZVNvbHZlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3dpbmRvdy9JVHJlZVNvbHZlXCI7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSBcIi4vU2NyZWVuXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJlZVNvbHZlIGltcGxlbWVudHMgSVRyZWVTb2x2ZSB7XHJcblxyXG4gICAgcHVibGljIHJlbmRlcmluZ0NvbW1lbnQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHNjcmVlbjogSVNjcmVlbiA9IG5ldyBTY3JlZW4oKTtcclxufVxyXG4iLCJcclxuXHJcbmNvbnN0IGdGaWxlQ29uc3RhbnRzID0ge1xyXG5cclxuICAgIGZyYWdtZW50c0ZvbGRlclN1ZmZpeDogJ19mcmFncycsXHJcbiAgICBmcmFnbWVudEZpbGVFeHRlbnNpb246ICcuaHRtbCcsXHJcbiAgICBndWlkZU91dGxpbmVGaWxlbmFtZTogJ291dGxpbmUudHNvbG4nLFxyXG4gICAgZ3VpZGVSZW5kZXJDb21tZW50VGFnOiAndHNHdWlkZVJlbmRlckNvbW1lbnQgJyxcclxuICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudFRhZzogJ3RzRnJhZ21lbnRSZW5kZXJDb21tZW50ICcsXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRmlsZUNvbnN0YW50cztcclxuXHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJHdWlkZVwiO1xyXG5pbXBvcnQgRmlsdGVycyBmcm9tIFwiLi4vLi4vc3RhdGUvY29uc3RhbnRzL0ZpbHRlcnNcIjtcclxuaW1wb3J0IERpc3BsYXlHdWlkZSBmcm9tIFwiLi4vLi4vc3RhdGUvZGlzcGxheS9EaXNwbGF5R3VpZGVcIjtcclxuaW1wb3J0IFJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IFRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vc3RhdGUvd2luZG93L1RyZWVTb2x2ZVwiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4vZ1N0YXRlQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IHBhcnNlR3VpZGUgPSAocmF3R3VpZGU6IGFueSk6IElSZW5kZXJHdWlkZSA9PiB7XHJcblxyXG4gICAgY29uc3QgZ3VpZGU6IElSZW5kZXJHdWlkZSA9IG5ldyBSZW5kZXJHdWlkZShyYXdHdWlkZS5pZCk7XHJcbiAgICBndWlkZS50aXRsZSA9IHJhd0d1aWRlLnRpdGxlID8/ICcnO1xyXG4gICAgZ3VpZGUuZGVzY3JpcHRpb24gPSByYXdHdWlkZS5kZXNjcmlwdGlvbiA/PyAnJztcclxuICAgIGd1aWRlLnBhdGggPSByYXdHdWlkZS5wYXRoID8/IG51bGw7XHJcbiAgICBndWlkZS5mcmFnbWVudEZvbGRlclVybCA9IGdSZW5kZXJDb2RlLmdldEZyYWdtZW50Rm9sZGVyVXJsKHJhd0d1aWRlLmZyYWdtZW50Rm9sZGVyUGF0aCk7XHJcblxyXG4gICAgcmV0dXJuIGd1aWRlO1xyXG59O1xyXG5cclxuY29uc3QgcGFyc2VSZW5kZXJpbmdDb21tZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJhdzogYW55XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghcmF3KSB7XHJcbiAgICAgICAgcmV0dXJuIHJhdztcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG57XHJcbiAgICBcImd1aWRlXCI6IHtcclxuICAgICAgICBcImlkXCI6IFwiZEJ0N0pOMXZ0XCJcclxuICAgIH0sXHJcbiAgICBcImZyYWdtZW50XCI6IHtcclxuICAgICAgICBcImlkXCI6IFwiZEJ0N0pOMXZ0XCIsXHJcbiAgICAgICAgXCJ0b3BMZXZlbE1hcEtleVwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcIm1hcEtleUNoYWluXCI6IFwiY3YxVFJsMDFyZlwiLFxyXG4gICAgICAgIFwiZ3VpZGVJRFwiOiBcImRCdDdKTjFIZVwiLFxyXG4gICAgICAgIFwiZ3VpZGVQYXRoXCI6IFwiYzovR2l0SHViL1RFU1QuRG9jdW1lbnRhdGlvbi90c21hcHNkYXRhT3B0aW9uc0ZvbGRlci9Ib2xkZXIvZGF0YU9wdGlvbnMudHNtYXBcIixcclxuICAgICAgICBcInBhcmVudEZyYWdtZW50SURcIjogbnVsbCxcclxuICAgICAgICBcImNoYXJ0S2V5XCI6IFwiY3YxVFJsMDFyZlwiLFxyXG4gICAgICAgIFwib3B0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkQnQ3S1oxQU5cIixcclxuICAgICAgICAgICAgICAgIFwib3B0aW9uXCI6IFwiT3B0aW9uIDFcIixcclxuICAgICAgICAgICAgICAgIFwiaXNBbmNpbGxhcnlcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBcIm9yZGVyXCI6IDFcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImRCdDdLWjFSYlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcHRpb25cIjogXCJPcHRpb24gMlwiLFxyXG4gICAgICAgICAgICAgICAgXCJpc0FuY2lsbGFyeVwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwib3JkZXJcIjogMlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZEJ0N0taMjRCXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9wdGlvblwiOiBcIk9wdGlvbiAzXCIsXHJcbiAgICAgICAgICAgICAgICBcImlzQW5jaWxsYXJ5XCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgXCJvcmRlclwiOiAzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICB9XHJcbn0gICAgXHJcbiAgICAqL1xyXG5cclxuICAgIGNvbnN0IGd1aWRlID0gcGFyc2VHdWlkZShyYXcuZ3VpZGUpO1xyXG5cclxuICAgIGNvbnN0IGRpc3BsYXlHdWlkZSA9IG5ldyBEaXNwbGF5R3VpZGUoXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSksXHJcbiAgICAgICAgZ3VpZGUsXHJcbiAgICAgICAgcmF3LmZyYWdtZW50LmlkXHJcbiAgICApO1xyXG5cclxuICAgIGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkR3VpZGVSb290RnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgcmF3LmZyYWdtZW50LFxyXG4gICAgICAgIGRpc3BsYXlHdWlkZS5yb290XHJcbiAgICApO1xyXG5cclxuICAgIHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZSA9IGRpc3BsYXlHdWlkZTtcclxuICAgIHN0YXRlLnJlbmRlclN0YXRlLmN1cnJlbnRTZWN0aW9uID0gZGlzcGxheUd1aWRlO1xyXG5cclxuICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnUmVuZGVyQ29kZSA9IHtcclxuXHJcbiAgICBnZXRGcmFnbWVudEZvbGRlclVybDogKGZvbGRlclBhdGg6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBsZXQgZGl2aWRlciA9ICcnO1xyXG5cclxuICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZvbGRlclBhdGgpKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWxvY2F0aW9uLm9yaWdpbi5lbmRzV2l0aCgnLycpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFmb2xkZXJQYXRoLnN0YXJ0c1dpdGgoJy8nKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkaXZpZGVyID0gJy8nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvbGRlclBhdGguc3RhcnRzV2l0aCgnLycpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlclBhdGggPSBmb2xkZXJQYXRoLnN1YnN0cmluZygxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGAke2xvY2F0aW9uLm9yaWdpbn0ke2RpdmlkZXJ9JHtmb2xkZXJQYXRofWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgcmVnaXN0ZXJHdWlkZUNvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdHJlZVNvbHZlR3VpZGU6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRmlsdGVycy50cmVlU29sdmVHdWlkZUlEKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRyZWVTb2x2ZUd1aWRlXHJcbiAgICAgICAgICAgICYmIHRyZWVTb2x2ZUd1aWRlLmhhc0NoaWxkTm9kZXMoKSA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGROb2RlOiBDaGlsZE5vZGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93LlRyZWVTb2x2ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudCA9IGNoaWxkTm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGROb2RlLm5vZGVUeXBlICE9PSBOb2RlLlRFWFRfTk9ERSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZVJlbmRlcmluZ0NvbW1lbnQ6IChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghd2luZG93LlRyZWVTb2x2ZT8ucmVuZGVyaW5nQ29tbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgZ3VpZGVSZW5kZXJDb21tZW50ID0gd2luZG93LlRyZWVTb2x2ZS5yZW5kZXJpbmdDb21tZW50O1xyXG4gICAgICAgICAgICBndWlkZVJlbmRlckNvbW1lbnQgPSBndWlkZVJlbmRlckNvbW1lbnQudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFndWlkZVJlbmRlckNvbW1lbnQuc3RhcnRzV2l0aChnRmlsZUNvbnN0YW50cy5ndWlkZVJlbmRlckNvbW1lbnRUYWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGd1aWRlUmVuZGVyQ29tbWVudCA9IGd1aWRlUmVuZGVyQ29tbWVudC5zdWJzdHJpbmcoZ0ZpbGVDb25zdGFudHMuZ3VpZGVSZW5kZXJDb21tZW50VGFnLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJhdyA9IEpTT04ucGFyc2UoZ3VpZGVSZW5kZXJDb21tZW50KTtcclxuXHJcbiAgICAgICAgICAgIHBhcnNlUmVuZGVyaW5nQ29tbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmF3XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZWdpc3RlckZyYWdtZW50Q29tbWVudDogKCkgPT4ge1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1JlbmRlckNvZGU7XHJcbiIsImltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BsYXlDaGFydCBpbXBsZW1lbnRzIElEaXNwbGF5Q2hhcnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0XHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmxpbmtJRCA9IGxpbmtJRDtcclxuICAgICAgICB0aGlzLmNoYXJ0ID0gY2hhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxpbmtJRDogbnVtYmVyO1xyXG4gICAgcHVibGljIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0O1xyXG4gICAgcHVibGljIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgcm9vdDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBjdXJyZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlTZWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlTZWN0aW9uXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgSUNoYWluU2VnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBJU2VnbWVudE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSVNlZ21lbnROb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhaW5TZWdtZW50IGltcGxlbWVudHMgSUNoYWluU2VnbWVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgaW5kZXg6IG51bWJlcixcclxuICAgICAgICBzdGFydDogSVNlZ21lbnROb2RlLFxyXG4gICAgICAgIGVuZDogSVNlZ21lbnROb2RlXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xyXG4gICAgICAgIHRoaXMuZW5kID0gZW5kO1xyXG4gICAgICAgIHRoaXMudGV4dCA9IGAke3N0YXJ0LnRleHR9JHtlbmQ/LnRleHQgPz8gJyd9YDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5kZXg6IG51bWJlcjtcclxuICAgIHB1YmxpYyB0ZXh0OiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgb3V0bGluZU5vZGVzOiBBcnJheTxJUmVuZGVyT3V0bGluZU5vZGU+ID0gW107XHJcbiAgICBwdWJsaWMgb3V0bGluZU5vZGVzTG9hZGVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHVibGljIHN0YXJ0OiBJU2VnbWVudE5vZGU7XHJcbiAgICBwdWJsaWMgZW5kOiBJU2VnbWVudE5vZGU7XHJcblxyXG4gICAgcHVibGljIHNlZ21lbnRJblNlY3Rpb246IElEaXNwbGF5U2VjdGlvbiB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHNlZ21lbnRTZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24gfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzZWdtZW50T3V0U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcbn1cclxuXHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElTZWdtZW50Tm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JU2VnbWVudE5vZGVcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWdtZW50Tm9kZSBpbXBsZW1lbnRzIElTZWdtZW50Tm9kZXtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICB0ZXh0OiBzdHJpbmcsXHJcbiAgICAgICAga2V5OiBzdHJpbmcsXHJcbiAgICAgICAgdHlwZTogT3V0bGluZVR5cGUsXHJcbiAgICAgICAgaXNSb290OiBib29sZWFuLFxyXG4gICAgICAgIGlzTGFzdDogYm9vbGVhblxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuICAgICAgICB0aGlzLmtleSA9IGtleTtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMuaXNSb290ID0gaXNSb290O1xyXG4gICAgICAgIHRoaXMuaXNMYXN0ID0gaXNMYXN0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0ZXh0OiBzdHJpbmc7XHJcbiAgICBwdWJsaWMga2V5OiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdHlwZTogT3V0bGluZVR5cGU7XHJcbiAgICBwdWJsaWMgaXNSb290OiBib29sZWFuO1xyXG4gICAgcHVibGljIGlzTGFzdDogYm9vbGVhbjtcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgSUNoYWluU2VnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBJU2VnbWVudE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSVNlZ21lbnROb2RlXCI7XHJcbmltcG9ydCBDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL3N0YXRlL3NlZ21lbnRzL0NoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgU2VnbWVudE5vZGUgZnJvbSBcIi4uLy4uL3N0YXRlL3NlZ21lbnRzL1NlZ21lbnROb2RlXCI7XHJcbmltcG9ydCBnVXRpbGl0aWVzIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4vZ1N0YXRlQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGNoZWNrRm9yTGlua0Vycm9ycyA9IChcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBsaW5rU2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKHNlZ21lbnQuZW5kLmtleSAhPT0gbGlua1NlZ21lbnQuc3RhcnQua2V5XHJcbiAgICAgICAgfHwgc2VnbWVudC5lbmQudHlwZSAhPT0gbGlua1NlZ21lbnQuc3RhcnQudHlwZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTGluayBzZWdtZW50IHN0YXJ0IGRvZXMgbm90IG1hdGNoIHNlZ21lbnQgZW5kXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghbGlua1NlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGluIHNlY3Rpb24gd2FzIG51bGwgLSBsaW5rXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghbGlua1NlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gbGlua1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxpbmtTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgb3V0IHNlY3Rpb24gd2FzIG51bGwgLSBsaW5rXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgbm9kZSAtIGxpbmsgaUtleScpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAobGlua1NlZ21lbnQuc3RhcnQudHlwZSAhPT0gT3V0bGluZVR5cGUuTGluaykge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgbm9kZSAtIGxpbmsnKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGdldElkZW50aWZpZXJDaGFyYWN0ZXIgPSAoaWRlbnRpZmllckNoYXI6IHN0cmluZyk6IHsgdHlwZTogT3V0bGluZVR5cGUsIGlzTGFzdDogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICBsZXQgc3RhcnRPdXRsaW5lVHlwZTogT3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5Ob2RlO1xyXG4gICAgbGV0IGlzTGFzdCA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChpZGVudGlmaWVyQ2hhciA9PT0gJ34nKSB7XHJcblxyXG4gICAgICAgIHN0YXJ0T3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5MaW5rO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoaWRlbnRpZmllckNoYXIgPT09ICdfJykge1xyXG5cclxuICAgICAgICBzdGFydE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuRXhpdDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGlkZW50aWZpZXJDaGFyID09PSAnLScpIHtcclxuXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLk5vZGU7XHJcbiAgICAgICAgaXNMYXN0ID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgcXVlcnkgc3RyaW5nIG91dGxpbmUgbm9kZSBpZGVudGlmaWVyOiAke2lkZW50aWZpZXJDaGFyfWApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdHlwZTogc3RhcnRPdXRsaW5lVHlwZSxcclxuICAgICAgICBpc0xhc3Q6IGlzTGFzdFxyXG4gICAgfTtcclxufTtcclxuXHJcbmNvbnN0IGdldEtleUVuZEluZGV4ID0gKHJlbWFpbmluZ0NoYWluOiBzdHJpbmcpOiB7IGluZGV4OiBudW1iZXIsIGlzTGFzdDogYm9vbGVhbiB8IG51bGwgfSA9PiB7XHJcblxyXG4gICAgY29uc3Qgc3RhcnRLZXlFbmRJbmRleCA9IFUuaW5kZXhPZkFueShcclxuICAgICAgICByZW1haW5pbmdDaGFpbixcclxuICAgICAgICBbJ34nLCAnLScsICdfJ10sXHJcbiAgICAgICAgMVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoc3RhcnRLZXlFbmRJbmRleCA9PT0gLTEpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaW5kZXg6IHJlbWFpbmluZ0NoYWluLmxlbmd0aCxcclxuICAgICAgICAgICAgaXNMYXN0OiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGluZGV4OiBzdGFydEtleUVuZEluZGV4LFxyXG4gICAgICAgIGlzTGFzdDogbnVsbFxyXG4gICAgfTtcclxufTtcclxuXHJcbmNvbnN0IGdldE91dGxpbmVUeXBlID0gKHJlbWFpbmluZ0NoYWluOiBzdHJpbmcpOiB7IHR5cGU6IE91dGxpbmVUeXBlLCBpc0xhc3Q6IGJvb2xlYW4gfSA9PiB7XHJcblxyXG4gICAgY29uc3QgaWRlbnRpZmllckNoYXIgPSByZW1haW5pbmdDaGFpbi5zdWJzdHJpbmcoMCwgMSk7XHJcbiAgICBjb25zdCBvdXRsaW5lVHlwZSA9IGdldElkZW50aWZpZXJDaGFyYWN0ZXIoaWRlbnRpZmllckNoYXIpO1xyXG5cclxuICAgIHJldHVybiBvdXRsaW5lVHlwZTtcclxufTtcclxuXHJcbmNvbnN0IGdldE5leHRTZWdtZW50Tm9kZSA9IChyZW1haW5pbmdDaGFpbjogc3RyaW5nKTogeyBzZWdtZW50Tm9kZTogSVNlZ21lbnROb2RlIHwgbnVsbCwgZW5kQ2hhaW46IHN0cmluZyB9ID0+IHtcclxuXHJcbiAgICBsZXQgc2VnbWVudE5vZGU6IElTZWdtZW50Tm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgbGV0IGVuZENoYWluID0gXCJcIjtcclxuXHJcbiAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKHJlbWFpbmluZ0NoYWluKSkge1xyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lVHlwZSA9IGdldE91dGxpbmVUeXBlKHJlbWFpbmluZ0NoYWluKTtcclxuICAgICAgICBjb25zdCBrZXlFbmQ6IHsgaW5kZXg6IG51bWJlciwgaXNMYXN0OiBib29sZWFuIHwgbnVsbCB9ID0gZ2V0S2V5RW5kSW5kZXgocmVtYWluaW5nQ2hhaW4pO1xyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSByZW1haW5pbmdDaGFpbi5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgIDEsXHJcbiAgICAgICAgICAgIGtleUVuZC5pbmRleFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHNlZ21lbnROb2RlID0gbmV3IFNlZ21lbnROb2RlKFxyXG4gICAgICAgICAgICByZW1haW5pbmdDaGFpbi5zdWJzdHJpbmcoMCwga2V5RW5kLmluZGV4KSxcclxuICAgICAgICAgICAga2V5LFxyXG4gICAgICAgICAgICBvdXRsaW5lVHlwZS50eXBlLFxyXG4gICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgb3V0bGluZVR5cGUuaXNMYXN0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGtleUVuZC5pc0xhc3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHNlZ21lbnROb2RlLmlzTGFzdCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbmRDaGFpbiA9IHJlbWFpbmluZ0NoYWluLnN1YnN0cmluZyhrZXlFbmQuaW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2VnbWVudE5vZGUsXHJcbiAgICAgICAgZW5kQ2hhaW5cclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFNlZ21lbnQgPSAoXHJcbiAgICBzZWdtZW50czogQXJyYXk8SUNoYWluU2VnbWVudD4sXHJcbiAgICByZW1haW5pbmdDaGFpbjogc3RyaW5nXHJcbik6IHsgcmVtYWluaW5nQ2hhaW46IHN0cmluZywgc2VnbWVudDogSUNoYWluU2VnbWVudCB9ID0+IHtcclxuXHJcbiAgICBjb25zdCBzZWdtZW50U3RhcnQgPSBnZXROZXh0U2VnbWVudE5vZGUocmVtYWluaW5nQ2hhaW4pO1xyXG5cclxuICAgIGlmICghc2VnbWVudFN0YXJ0LnNlZ21lbnROb2RlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc3RhcnQgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1haW5pbmdDaGFpbiA9IHNlZ21lbnRTdGFydC5lbmRDaGFpbjtcclxuICAgIGNvbnN0IHNlZ21lbnRFbmQgPSBnZXROZXh0U2VnbWVudE5vZGUocmVtYWluaW5nQ2hhaW4pO1xyXG5cclxuICAgIGlmICghc2VnbWVudEVuZC5zZWdtZW50Tm9kZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGVuZCBub2RlIHdhcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlZ21lbnQgPSBuZXcgQ2hhaW5TZWdtZW50KFxyXG4gICAgICAgIHNlZ21lbnRzLmxlbmd0aCxcclxuICAgICAgICBzZWdtZW50U3RhcnQuc2VnbWVudE5vZGUsXHJcbiAgICAgICAgc2VnbWVudEVuZC5zZWdtZW50Tm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVtYWluaW5nQ2hhaW4sXHJcbiAgICAgICAgc2VnbWVudFxyXG4gICAgfTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkUm9vdFNlZ21lbnQgPSAoXHJcbiAgICBzZWdtZW50czogQXJyYXk8SUNoYWluU2VnbWVudD4sXHJcbiAgICByZW1haW5pbmdDaGFpbjogc3RyaW5nXHJcbik6IHsgcmVtYWluaW5nQ2hhaW46IHN0cmluZywgc2VnbWVudDogSUNoYWluU2VnbWVudCB9ID0+IHtcclxuXHJcbiAgICBjb25zdCByb290U2VnbWVudFN0YXJ0ID0gbmV3IFNlZ21lbnROb2RlKFxyXG4gICAgICAgIFwiZ3VpZGVSb290XCIsXHJcbiAgICAgICAgJycsXHJcbiAgICAgICAgT3V0bGluZVR5cGUuTm9kZSxcclxuICAgICAgICB0cnVlLFxyXG4gICAgICAgIGZhbHNlXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHJvb3RTZWdtZW50RW5kID0gZ2V0TmV4dFNlZ21lbnROb2RlKHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICBpZiAoIXJvb3RTZWdtZW50RW5kLnNlZ21lbnROb2RlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc3RhcnQgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByb290U2VnbWVudCA9IG5ldyBDaGFpblNlZ21lbnQoXHJcbiAgICAgICAgc2VnbWVudHMubGVuZ3RoLFxyXG4gICAgICAgIHJvb3RTZWdtZW50U3RhcnQsXHJcbiAgICAgICAgcm9vdFNlZ21lbnRFbmQuc2VnbWVudE5vZGVcclxuICAgICk7XHJcblxyXG4gICAgc2VnbWVudHMucHVzaChyb290U2VnbWVudCk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZW1haW5pbmdDaGFpbixcclxuICAgICAgICBzZWdtZW50OiByb290U2VnbWVudFxyXG4gICAgfTtcclxufTtcclxuXHJcbmNvbnN0IGxvYWRTZWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBzdGFydE91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gbnVsbFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBnU2VnbWVudENvZGUubG9hZFNlZ21lbnRPdXRsaW5lTm9kZXMoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBzdGFydE91dGxpbmVOb2RlXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IG5leHRTZWdtZW50T3V0bGluZU5vZGVzID0gc2VnbWVudC5vdXRsaW5lTm9kZXM7XHJcblxyXG4gICAgaWYgKG5leHRTZWdtZW50T3V0bGluZU5vZGVzLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3ROb2RlID0gbmV4dFNlZ21lbnRPdXRsaW5lTm9kZXNbbmV4dFNlZ21lbnRPdXRsaW5lTm9kZXMubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGlmIChmaXJzdE5vZGUuaSA9PT0gc2VnbWVudC5zdGFydC5rZXkpIHtcclxuXHJcbiAgICAgICAgICAgIGZpcnN0Tm9kZS50eXBlID0gc2VnbWVudC5zdGFydC50eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbGFzdE5vZGUgPSBuZXh0U2VnbWVudE91dGxpbmVOb2Rlc1swXTtcclxuXHJcbiAgICAgICAgaWYgKGxhc3ROb2RlLmkgPT09IHNlZ21lbnQuZW5kLmtleSkge1xyXG5cclxuICAgICAgICAgICAgbGFzdE5vZGUudHlwZSA9IHNlZ21lbnQuZW5kLnR5cGU7XHJcbiAgICAgICAgICAgIGxhc3ROb2RlLmlzTGFzdCA9IHNlZ21lbnQuZW5kLmlzTGFzdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5sb2FkTmV4dENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGdTZWdtZW50Q29kZSA9IHtcclxuXHJcbiAgICBzZXROZXh0U2VnbWVudFNlY3Rpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyIHwgbnVsbCxcclxuICAgICAgICBsaW5rOiBJRGlzcGxheUNoYXJ0XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzZWdtZW50SW5kZXhcclxuICAgICAgICAgICAgfHwgIXN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50c1tzZWdtZW50SW5kZXggLSAxXTtcclxuXHJcbiAgICAgICAgaWYgKCFzZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGlzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gbGluaztcclxuICAgICAgICBjb25zdCBuZXh0U2VnbWVudCA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzW3NlZ21lbnRJbmRleF07XHJcblxyXG4gICAgICAgIGlmIChuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gbGluaztcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBsaW5rOyAvLyBUaGlzIGNvdWxkIGJlIHNldCBhZ2FpbiB3aGVuIHRoZSBlbmQgbm9kZSBpcyBwcm9jZXNzZWRcclxuXHJcbiAgICAgICAgICAgIGxvYWRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgbG9hZExpbmtTZWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBsaW5rU2VnbWVudEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgbGlua0ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgbGluazogSURpc3BsYXlDaGFydFxyXG4gICAgKTogSUNoYWluU2VnbWVudCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgICAgIGlmIChsaW5rU2VnbWVudEluZGV4IDwgMSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmRleCA8IDAnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTZWdtZW50ID0gc2VnbWVudHNbbGlua1NlZ21lbnRJbmRleCAtIDFdO1xyXG4gICAgICAgIGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gbGluaztcclxuXHJcbiAgICAgICAgaWYgKGxpbmtTZWdtZW50SW5kZXggPj0gc2VnbWVudHMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05leHQgaW5kZXggPj0gYXJyYXkgbGVuZ3RoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBuZXh0U2VnbWVudCA9IHNlZ21lbnRzW2xpbmtTZWdtZW50SW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOZXh0IGxpbmsgc2VnbWVudCB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXh0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXh0U2VnbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5leHRTZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gbGluaztcclxuICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7XHJcblxyXG4gICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UobmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ub3V0bGluZT8uci5pKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmV4dCBzZWdtZW50IHNlY3Rpb24gcm9vdCBrZXkgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc3RhcnRPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbi5vdXRsaW5lPy5yLmkgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbG9hZFNlZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudCxcclxuICAgICAgICAgICAgc3RhcnRPdXRsaW5lTm9kZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNoZWNrRm9yTGlua0Vycm9ycyhcclxuICAgICAgICAgICAgY3VycmVudFNlZ21lbnQsXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LFxyXG4gICAgICAgICAgICBsaW5rRnJhZ21lbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV4dFNlZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRFeGl0U2VnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgcGx1Z0lEOiBzdHJpbmdcclxuICAgICk6IElDaGFpblNlZ21lbnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTZWdtZW50ID0gc2VnbWVudHNbc2VnbWVudEluZGV4XTtcclxuICAgICAgICBjb25zdCBleGl0U2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4ICsgMTtcclxuXHJcbiAgICAgICAgaWYgKGV4aXRTZWdtZW50SW5kZXggPj0gc2VnbWVudHMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05leHQgaW5kZXggPj0gYXJyYXkgbGVuZ3RoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBleGl0U2VnbWVudCA9IHNlZ21lbnRzW2V4aXRTZWdtZW50SW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAoIWV4aXRTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeGl0IGxpbmsgc2VnbWVudCB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChleGl0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBleGl0U2VnbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gYXMgSURpc3BsYXlDaGFydDtcclxuICAgICAgICBjb25zdCBsaW5rID0gc2VnbWVudFNlY3Rpb24ucGFyZW50O1xyXG5cclxuICAgICAgICBpZiAoIWxpbmspIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpbmsgZnJhZ21udCB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gbGluay5zZWN0aW9uO1xyXG4gICAgICAgIGV4aXRTZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgZXhpdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgZXhpdFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKCFleGl0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGluIHNlY3Rpb24gd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBleGl0T3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBleGl0U2VnbWVudC5zdGFydC5rZXlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWV4aXRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhpdE91dGxpbmVOb2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGV4aXRPdXRsaW5lTm9kZS5feCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4aXQga2V5IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGx1Z091dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50U2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIHBsdWdJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghcGx1Z091dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbHVnT3V0bGluZU5vZGUgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXhpdE91dGxpbmVOb2RlLl94ICE9PSBwbHVnT3V0bGluZU5vZGUueCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGx1Z091dGxpbmVOb2RlIGRvZXMgbm90IG1hdGNoIGV4aXRPdXRsaW5lTm9kZVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvYWRTZWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQsXHJcbiAgICAgICAgICAgIHBsdWdPdXRsaW5lTm9kZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBleGl0U2VnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZE5leHRTZWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCBuZXh0U2VnbWVudEluZGV4ID0gc2VnbWVudC5pbmRleCArIDE7XHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuXHJcbiAgICAgICAgaWYgKG5leHRTZWdtZW50SW5kZXggPj0gc2VnbWVudHMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05leHQgaW5kZXggPj0gYXJyYXkgbGVuZ3RoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBuZXh0U2VnbWVudCA9IHNlZ21lbnRzW25leHRTZWdtZW50SW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE5leHRTZWdtZW50T3V0bGluZU5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnRcclxuICAgICk6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0bGluZU5vZGUgPSBzZWdtZW50Lm91dGxpbmVOb2Rlcy5wb3AoKSA/PyBudWxsO1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGU/LmlzTGFzdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG91dGxpbmVOb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNlZ21lbnQub3V0bGluZU5vZGVzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50c1tzZWdtZW50LmluZGV4ICsgMV07XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0U2VnbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmVOb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZVNlZ21lbnRzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBxdWVyeVN0cmluZzogc3RyaW5nXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHF1ZXJ5U3RyaW5nLnN0YXJ0c1dpdGgoJz8nKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZy5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UocXVlcnlTdHJpbmcpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRzOiBBcnJheTxJQ2hhaW5TZWdtZW50PiA9IFtdO1xyXG4gICAgICAgIGxldCByZW1haW5pbmdDaGFpbiA9IHF1ZXJ5U3RyaW5nO1xyXG4gICAgICAgIGxldCByZXN1bHQ6IHsgcmVtYWluaW5nQ2hhaW46IHN0cmluZywgc2VnbWVudDogSUNoYWluU2VnbWVudCB9O1xyXG5cclxuICAgICAgICByZXN1bHQgPSBidWlsZFJvb3RTZWdtZW50KFxyXG4gICAgICAgICAgICBzZWdtZW50cyxcclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW5cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB3aGlsZSAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKHJlbWFpbmluZ0NoYWluKSkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gYnVpbGRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudHMsXHJcbiAgICAgICAgICAgICAgICByZW1haW5pbmdDaGFpblxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5zZWdtZW50LmVuZC5pc0xhc3QgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZW1haW5pbmdDaGFpbiA9IHJlc3VsdC5yZW1haW5pbmdDaGFpbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzID0gc2VnbWVudHM7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRTZWdtZW50T3V0bGluZU5vZGVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgICAgIHN0YXJ0T3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBudWxsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgaW4gc2VjdGlvbiB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNlZ21lbnRPdXRsaW5lTm9kZXM6IEFycmF5PElSZW5kZXJPdXRsaW5lTm9kZT4gPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKCFzdGFydE91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICBzdGFydE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQuc2VnbWVudEluU2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LnN0YXJ0LmtleVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzdGFydE91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhcnQgb3V0bGluZSBub2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydE91dGxpbmVOb2RlLnR5cGUgPSBzZWdtZW50LnN0YXJ0LnR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZW5kT3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnQuc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBzZWdtZW50LmVuZC5rZXlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWVuZE91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbmQgb3V0bGluZSBub2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZW5kT3V0bGluZU5vZGUudHlwZSA9IHNlZ21lbnQuZW5kLnR5cGU7XHJcbiAgICAgICAgbGV0IHBhcmVudDogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IGVuZE91dGxpbmVOb2RlO1xyXG4gICAgICAgIGxldCBmaXJzdExvb3AgPSB0cnVlO1xyXG5cclxuICAgICAgICB3aGlsZSAocGFyZW50KSB7XHJcblxyXG4gICAgICAgICAgICBzZWdtZW50T3V0bGluZU5vZGVzLnB1c2gocGFyZW50KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZmlyc3RMb29wXHJcbiAgICAgICAgICAgICAgICAmJiBwYXJlbnQ/LmlzQ2hhcnQgPT09IHRydWVcclxuICAgICAgICAgICAgICAgICYmIHBhcmVudD8uaXNSb290ID09PSB0cnVlXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQ/LmkgPT09IHN0YXJ0T3V0bGluZU5vZGUuaSkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZpcnN0TG9vcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VnbWVudC5vdXRsaW5lTm9kZXMgPSBzZWdtZW50T3V0bGluZU5vZGVzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnU2VnbWVudENvZGU7XHJcbiIsImltcG9ydCB7IFBhcnNlVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZVwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi4vY29kZS9nT3V0bGluZUNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi4vY29kZS9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuXHJcblxyXG5jb25zdCBnT3V0bGluZUFjdGlvbnMgPSB7XHJcblxyXG4gICAgbG9hZEd1aWRlT3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmdcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkU2VnbWVudENoYXJ0T3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkU2VnbWVudENoYXJ0T3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgIHNlZ21lbnRJbmRleFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkQ2hhcnRPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkQ2hhcnRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIHBhcmVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkR3VpZGVPdXRsaW5lQW5kU2VnbWVudHM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIHBhdGg6IHN0cmluZ1xyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlO1xyXG5cclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb3RTZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbMF07XHJcblxyXG4gICAgICAgIGlmICghcm9vdFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gc2VjdGlvbi5ndWlkZS5mcmFnbWVudEZvbGRlclVybDtcclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm9vdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlY3Rpb247XHJcbiAgICAgICAgcm9vdFNlZ21lbnQuc2VnbWVudFNlY3Rpb24gPSBzZWN0aW9uO1xyXG4gICAgICAgIHJvb3RTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gc2VjdGlvbjtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXRoXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWRTZWdtZW50T3V0bGluZU5vZGVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcm9vdFNlZ21lbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBmaXJzdE5vZGUgPSBnU2VnbWVudENvZGUuZ2V0TmV4dFNlZ21lbnRPdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJvb3RTZWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGZpcnN0Tm9kZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Zmlyc3ROb2RlLml9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvb3RTZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0Tm9kZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgYGxvYWRDaGFpbkZyYWdtZW50YCxcclxuICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBnU2VnbWVudENvZGUubG9hZE5leHRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByb290U2VnbWVudCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ091dGxpbmVBY3Rpb25zO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IFJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdSZW5kZXJDb2RlIGZyb20gXCIuL2dSZW5kZXJDb2RlXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBnT3V0bGluZUFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ091dGxpbmVBY3Rpb25zXCI7XHJcbmltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcblxyXG5cclxuY29uc3QgY2FjaGVOb2RlRm9yTmV3TGluayA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgbGlua0lEOiBudW1iZXIsXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuY2FjaGVfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgbGlua0lELFxyXG4gICAgICAgIG91dGxpbmVOb2RlXHJcbiAgICApO1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG91dGxpbmVOb2RlLm8pIHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3TGluayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGxvYWROb2RlID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJhd05vZGU6IGFueSxcclxuICAgIGxpbmtJRDogbnVtYmVyLFxyXG4gICAgcGFyZW50OiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gbnVsbFxyXG4pOiBJUmVuZGVyT3V0bGluZU5vZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IG5vZGUgPSBuZXcgUmVuZGVyT3V0bGluZU5vZGUoKTtcclxuICAgIG5vZGUuaSA9IHJhd05vZGUuaTtcclxuICAgIG5vZGUuYyA9IHJhd05vZGUuYyA/PyBudWxsO1xyXG4gICAgbm9kZS5feCA9IHJhd05vZGUuX3ggPz8gbnVsbDtcclxuICAgIG5vZGUueCA9IHJhd05vZGUueCA/PyBudWxsO1xyXG4gICAgbm9kZS5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICBub2RlLnR5cGUgPSBPdXRsaW5lVHlwZS5Ob2RlO1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuY2FjaGVfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgbGlua0lELFxyXG4gICAgICAgIG5vZGVcclxuICAgICk7XHJcblxyXG4gICAgaWYgKG5vZGUuYykge1xyXG5cclxuICAgICAgICBub2RlLnR5cGUgPSBPdXRsaW5lVHlwZS5MaW5rO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyYXdOb2RlLm9cclxuICAgICAgICAmJiBBcnJheS5pc0FycmF5KHJhd05vZGUubykgPT09IHRydWVcclxuICAgICAgICAmJiByYXdOb2RlLm8ubGVuZ3RoID4gMFxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IG86IElSZW5kZXJPdXRsaW5lTm9kZTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgcmF3Tm9kZS5vKSB7XHJcblxyXG4gICAgICAgICAgICBvID0gbG9hZE5vZGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIGxpbmtJRCxcclxuICAgICAgICAgICAgICAgIG5vZGVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIG5vZGUuby5wdXNoKG8pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbm9kZTtcclxufTtcclxuXHJcbmNvbnN0IGxvYWRDaGFydHMgPSAoXHJcbiAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgIHJhd091dGxpbmVDaGFydHM6IEFycmF5PGFueT5cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgb3V0bGluZS5jID0gW107XHJcbiAgICBsZXQgYzogSVJlbmRlck91dGxpbmVDaGFydDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGNoYXJ0IG9mIHJhd091dGxpbmVDaGFydHMpIHtcclxuXHJcbiAgICAgICAgYyA9IG5ldyBSZW5kZXJPdXRsaW5lQ2hhcnQoKTtcclxuICAgICAgICBjLmkgPSBjaGFydC5pO1xyXG4gICAgICAgIGMucCA9IGNoYXJ0LnA7XHJcbiAgICAgICAgb3V0bGluZS5jLnB1c2goYyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnT3V0bGluZUNvZGUgPSB7XHJcblxyXG4gICAgcmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHVybDogc3RyaW5nXHJcbiAgICApOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmVVcmxzW3VybF0gPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUub3V0bGluZVVybHNbdXJsXSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEd1aWRlT3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmdcclxuICAgICk6IElSZW5kZXJPdXRsaW5lID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGlzcGxheUd1aWRlIHdhcyBudWxsLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZ3VpZGUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU7XHJcbiAgICAgICAgY29uc3QgcmF3T3V0bGluZSA9IG91dGxpbmVSZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgZ3VpZGVPdXRsaW5lID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkT3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLFxyXG4gICAgICAgICAgICBndWlkZU91dGxpbmUsXHJcbiAgICAgICAgICAgIGd1aWRlLmxpbmtJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGd1aWRlLm91dGxpbmUgPSBndWlkZU91dGxpbmU7XHJcbiAgICAgICAgZ3VpZGVPdXRsaW5lLnIuaXNDaGFydCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3RTZWdtZW50ID0gc2VnbWVudHNbMF07XHJcbiAgICAgICAgICAgICAgICByb290U2VnbWVudC5zdGFydC5rZXkgPSBndWlkZU91dGxpbmUuci5pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNhY2hlU2VjdGlvblJvb3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBndWlkZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChndWlkZU91dGxpbmUuci5jICE9IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gTG9hZCBvdXRsaW5lIGZyb20gdGhhdCBsb2NhdGlvbiBhbmQgbG9hZCByb290XHJcblxyXG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVDaGFydChcclxuICAgICAgICAgICAgICAgIGd1aWRlT3V0bGluZSxcclxuICAgICAgICAgICAgICAgIGd1aWRlT3V0bGluZS5yLmNcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGd1aWRlUm9vdCA9IGd1aWRlLnJvb3Q7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWd1aWRlUm9vdCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGN1cnJlbnQgZnJhZ21lbnQgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgICAgICAgICBndWlkZVJvb3RcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZ3VpZGUucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5hdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGd1aWRlLnJvb3RcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBndWlkZU91dGxpbmU7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE91dGxpbmVDaGFydDogKFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGluZGV4OiBudW1iZXJcclxuICAgICk6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmUuYy5sZW5ndGggPiBpbmRleCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG91dGxpbmUuY1tpbmRleF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgYnVpbGREaXNwbGF5Q2hhcnRGcm9tUmF3T3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgcmF3T3V0bGluZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSURpc3BsYXlDaGFydCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBuZXcgRGlzcGxheUNoYXJ0KFxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLmdldEZyZXNoS2V5SW50KHN0YXRlKSxcclxuICAgICAgICAgICAgY2hhcnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgbGluay5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsaW5rLm91dGxpbmUgPSBvdXRsaW5lO1xyXG4gICAgICAgIGxpbmsucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIHBhcmVudC5saW5rID0gbGluaztcclxuXHJcbiAgICAgICAgcmV0dXJuIGxpbms7XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdMaW5rOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElEaXNwbGF5Q2hhcnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rID0gbmV3IERpc3BsYXlDaGFydChcclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSksXHJcbiAgICAgICAgICAgIGNoYXJ0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllc0Zvck5ld0xpbmsoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBsaW5rLmxpbmtJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxpbmsub3V0bGluZSA9IG91dGxpbmU7XHJcbiAgICAgICAgbGluay5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgcGFyZW50LmxpbmsgPSBsaW5rO1xyXG5cclxuICAgICAgICByZXR1cm4gbGluaztcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlclxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBMaW5rIGFscmVhZHkgbG9hZGVkLCByb290SUQ6ICR7cGFyZW50Lmxpbmsucm9vdD8uaWR9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByYXdPdXRsaW5lID0gb3V0bGluZVJlc3BvbnNlLmpzb25EYXRhO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rID0gZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbVJhd091dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgcGFyZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWRMaW5rU2VnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlZ21lbnRJbmRleCxcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2FjaGVTZWN0aW9uUm9vdChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkQ2hhcnRPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudC5saW5rKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYExpbmsgYWxyZWFkeSBsb2FkZWQsIHJvb3RJRDogJHtwYXJlbnQubGluay5yb290Py5pZH1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhd091dGxpbmUgPSBvdXRsaW5lUmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBnT3V0bGluZUNvZGUuYnVpbGREaXNwbGF5Q2hhcnRGcm9tUmF3T3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBwYXJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNhY2hlU2VjdGlvblJvb3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gTmVlZCB0byBidWlsZCBhIGRpc3BsYXlDSGFydCBoZXJlXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5wb3N0R2V0Q2hhcnRPdXRsaW5lUm9vdF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcG9zdEdldENoYXJ0T3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc2VjdGlvbi5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNlY3Rpb24ucm9vdC51aS5kaXNjdXNzaW9uTG9hZGVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWN0aW9uIHJvb3QgZGlzY3Vzc2lvbiB3YXMgbm90IGxvYWRlZCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lID0gc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2VjdGlvbiBvdXRsaW5lIHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb290RnJhZ21lbklEID0gb3V0bGluZS5yLmk7XHJcbiAgICAgICAgY29uc3QgcGF0aCA9IG91dGxpbmUucGF0aDtcclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3BhdGh9LyR7cm9vdEZyYWdtZW5JRH0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRSb290RnJhZ21lbnRBbmRTZXRTZWxlY3RlZChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYGxvYWRDaGFydE91dGxpbmVSb290YCxcclxuICAgICAgICAgICAgUGFyc2VUeXBlLlRleHQsXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldENoYXJ0QXNDdXJyZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBkaXNwbGF5U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuY3VycmVudFNlY3Rpb24gPSBkaXNwbGF5U2VjdGlvbjtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0T3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZ1xyXG4gICAgKTogSVJlbmRlck91dGxpbmUgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0bGluZTogSVJlbmRlck91dGxpbmUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lc1tmcmFnbWVudEZvbGRlclVybF07XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gb3V0bGluZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dGxpbmUgPSBuZXcgUmVuZGVyT3V0bGluZShmcmFnbWVudEZvbGRlclVybCk7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUub3V0bGluZXNbZnJhZ21lbnRGb2xkZXJVcmxdID0gb3V0bGluZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmU7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyYWdtZW50TGlua0NoYXJ0T3V0bGluZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBmcmFnbWVudC5zZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50LmlkXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0ID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVDaGFydChcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGU/LmNcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUZyb21DaGFydF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0U2VnbWVudE91dGxpbmVfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwsXHJcbiAgICAgICAgbGlua0ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXJcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWNoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ091dGxpbmVDaGFydCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpbmtGcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTGluayByb290IGFscmVhZHkgbG9hZGVkOiAke2xpbmtGcmFnbWVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5leHRTZWdtZW50SW5kZXggPSBzZWdtZW50SW5kZXg7XHJcblxyXG4gICAgICAgIGlmIChuZXh0U2VnbWVudEluZGV4ICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50SW5kZXgrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVDaGFydFBhdGggPSBjaGFydD8ucCBhcyBzdHJpbmc7XHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmwgPSBnUmVuZGVyQ29kZS5nZXRGcmFnbWVudEZvbGRlclVybChvdXRsaW5lQ2hhcnRQYXRoKSBhcyBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnRGb2xkZXJVcmwpKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBvdXRsaW5lID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3V0bGluZS5sb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWxpbmtGcmFnbWVudC5saW5rKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBnT3V0bGluZUNvZGUuYnVpbGREaXNwbGF5Q2hhcnRGcm9tT3V0bGluZUZvck5ld0xpbmsoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ1NlZ21lbnRDb2RlLnNldE5leHRTZWdtZW50U2VjdGlvbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRTZWdtZW50SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5zZXRDaGFydEFzQ3VycmVudChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBsaW5rRnJhZ21lbnQubGluayBhcyBJRGlzcGxheVNlY3Rpb25cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke2dGaWxlQ29uc3RhbnRzLmd1aWRlT3V0bGluZUZpbGVuYW1lfWA7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZFJlcXVlc3RlZCA9IGdPdXRsaW5lQ29kZS5yZWdpc3Rlck91dGxpbmVVcmxEb3dubG9hZChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICB1cmxcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxvYWRSZXF1ZXN0ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGBsb2FkQ2hhaW5DaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYXJ0T3V0bGluZUZpbGVgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnT3V0bGluZUFjdGlvbnMubG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0U2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgUGFyc2VUeXBlLkpzb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0T3V0bGluZUZyb21DaGFydF9zdWJzY3JpcHRpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0IHwgbnVsbCxcclxuICAgICAgICBsaW5rRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghY2hhcnQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3V0bGluZUNoYXJ0IHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGlua0ZyYWdtZW50Lmxpbms/LnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMaW5rIHJvb3QgYWxyZWFkeSBsb2FkZWQ6ICR7bGlua0ZyYWdtZW50Lmxpbmsucm9vdD8uaWR9YCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnRQYXRoID0gY2hhcnQ/LnAgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gZ1JlbmRlckNvZGUuZ2V0RnJhZ21lbnRGb2xkZXJVcmwob3V0bGluZUNoYXJ0UGF0aCkgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0bGluZSA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmUubG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFsaW5rRnJhZ21lbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuYnVpbGREaXNwbGF5Q2hhcnRGcm9tT3V0bGluZUZvck5ld0xpbmsoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LmxpbmsgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5wb3N0R2V0Q2hhcnRPdXRsaW5lUm9vdF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LmxpbmsgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtnRmlsZUNvbnN0YW50cy5ndWlkZU91dGxpbmVGaWxlbmFtZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRSZXF1ZXN0ZWQgPSBnT3V0bGluZUNvZGUucmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsb2FkUmVxdWVzdGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYWluQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ091dGxpbmVBY3Rpb25zLmxvYWRDaGFydE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgUGFyc2VUeXBlLkpzb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgbG9hZE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByYXdPdXRsaW5lOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXJcclxuICAgICk6IElSZW5kZXJPdXRsaW5lID0+IHtcclxuXHJcbiAgICAgICAgb3V0bGluZS52ID0gcmF3T3V0bGluZS52O1xyXG5cclxuICAgICAgICBpZiAocmF3T3V0bGluZS5jXHJcbiAgICAgICAgICAgICYmIEFycmF5LmlzQXJyYXkocmF3T3V0bGluZS5jKSA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAmJiByYXdPdXRsaW5lLmMubGVuZ3RoID4gMFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBsb2FkQ2hhcnRzKFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgIHJhd091dGxpbmUuY1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJhd091dGxpbmUuZSkge1xyXG5cclxuICAgICAgICAgICAgb3V0bGluZS5lID0gcmF3T3V0bGluZS5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3V0bGluZS5yID0gbG9hZE5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByYXdPdXRsaW5lLnIsXHJcbiAgICAgICAgICAgIGxpbmtJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIG91dGxpbmUubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICBvdXRsaW5lLnIuaXNSb290ID0gdHJ1ZTtcclxuICAgICAgICBvdXRsaW5lLm12ID0gcmF3T3V0bGluZS5tdjtcclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmU7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRPdXRsaW5lUHJvcGVydGllc0Zvck5ld0xpbms6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY2FjaGVOb2RlRm9yTmV3TGluayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmUucixcclxuICAgICAgICAgICAgbGlua0lEXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdPdXRsaW5lQ29kZTtcclxuXHJcbiIsIlxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IHsgZ0F1dGhlbnRpY2F0ZWRIdHRwIH0gZnJvbSBcIi4uL2h0dHAvZ0F1dGhlbnRpY2F0aW9uSHR0cFwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuLi9odHRwL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5cclxuXHJcbmNvbnN0IGdldEZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgIGZyYWdtZW50UGF0aDogc3RyaW5nLFxyXG4gICAgYWN0aW9uOiBBY3Rpb25UeXBlLFxyXG4gICAgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5KTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgYWN0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRQYXRofWA7XHJcblxyXG4gICAgcmV0dXJuIGdBdXRoZW50aWNhdGVkSHR0cCh7XHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBcInRleHRcIixcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3BvbnNlOiAndGV4dCcsXHJcbiAgICAgICAgYWN0aW9uOiBsb2FkQWN0aW9uLFxyXG4gICAgICAgIGVycm9yOiAoc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGB7XHJcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBnZXR0aW5nIGZyYWdtZW50IGZyb20gdGhlIHNlcnZlciwgcGF0aDogJHtmcmFnbWVudFBhdGh9LCBpZDogJHtmcmFnbWVudElEfVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dldEZyYWdtZW50fSxcclxuICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgYWxlcnQoYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgZnJhZ21lbnQgZnJvbSB0aGUgc2VydmVyLCBwYXRoOiAke2ZyYWdtZW50UGF0aH0sIGlkOiAke2ZyYWdtZW50SUR9XCIsXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z2V0RnJhZ21lbnQubmFtZX0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBnRnJhZ21lbnRFZmZlY3RzID0ge1xyXG5cclxuICAgIGdldEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBmcmFnbWVudFBhdGg6IHN0cmluZ1xyXG4gICAgKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkQWN0aW9uOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0gZ0ZyYWdtZW50QWN0aW9ucy5sb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBuZXdTdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZ2V0RnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb24uaWQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50UGF0aCxcclxuICAgICAgICAgICAgQWN0aW9uVHlwZS5HZXRGcmFnbWVudCxcclxuICAgICAgICAgICAgbG9hZEFjdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRFZmZlY3RzO1xyXG4iLCJpbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcbmltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSURpc3BsYXlTZWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlTZWN0aW9uXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBJQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lDaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ091dGxpbmVDb2RlIGZyb20gXCIuLi9jb2RlL2dPdXRsaW5lQ29kZVwiO1xyXG5pbXBvcnQgZ1NlZ21lbnRDb2RlIGZyb20gXCIuLi9jb2RlL2dTZWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRFZmZlY3RzIGZyb20gXCIuLi9lZmZlY3RzL2dGcmFnbWVudEVmZmVjdHNcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGdldEZyYWdtZW50RmlsZSA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgc3RhdGUubG9hZGluZyA9IHRydWU7XHJcbiAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5oaWRlQmFubmVyID0gdHJ1ZTtcclxuICAgIGNvbnN0IGZyYWdtZW50UGF0aCA9IGAke29wdGlvbi5zZWN0aW9uPy5vdXRsaW5lPy5wYXRofS8ke29wdGlvbi5pZH0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZ0ZyYWdtZW50RWZmZWN0cy5nZXRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgZnJhZ21lbnRQYXRoXHJcbiAgICAgICAgKVxyXG4gICAgXTtcclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NDaGFpbkZyYWdtZW50VHlwZSA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsXHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgaWQgYW5kIG91dGxpbmUgZnJhZ21lbnQgaWQnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZS50eXBlID09PSBPdXRsaW5lVHlwZS5MaW5rKSB7XHJcblxyXG4gICAgICAgICAgICBwcm9jZXNzTGluayhcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob3V0bGluZU5vZGUudHlwZSA9PT0gT3V0bGluZVR5cGUuRXhpdCkge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0V4aXQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG91dGxpbmVOb2RlLmlzQ2hhcnQgPT09IHRydWVcclxuICAgICAgICAgICAgJiYgb3V0bGluZU5vZGUuaXNSb290ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBwcm9jZXNzQ2hhcnRSb290KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob3V0bGluZU5vZGUuaXNMYXN0ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBwcm9jZXNzTGFzdChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob3V0bGluZU5vZGUudHlwZSA9PT0gT3V0bGluZVR5cGUuTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc05vZGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgZnJhZ21lbnQgdHlwZS4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbn07XHJcblxyXG5jb25zdCBjaGVja0Zvckxhc3RGcmFnbWVudEVycm9ycyA9IChcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gbGFzdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIG91dGxpbmUgbm9kZSBpZCBhbmQgZnJhZ21lbnQgaWQnKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yTm9kZUVycm9ycyA9IChcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBzZWN0aW9uIHdhcyBudWxsIC0gbm9kZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSBub2RlIC0gbGluaycpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlFeGl0S2V5KSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgbm9kZSAtIGV4aXQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIG91dGxpbmUgbm9kZSBpZCBhbmQgZnJhZ21lbnQgaWQnKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNoZWNrRm9yQ2hhcnRSb290RXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIHJvb3RcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgcm9vdCAtIGxpbmsnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pRXhpdEtleSkpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIHJvb3QgLSBleGl0Jyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjaGVja0ZvckV4aXRFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIGV4aXRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgb3V0IHNlY3Rpb24gd2FzIG51bGwgLSBleGl0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgLSBleGl0Jyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChzZWdtZW50LmVuZC50eXBlICE9PSBPdXRsaW5lVHlwZS5FeGl0KSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSBub2RlIC0gZXhpdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gb3V0bGluZSBub2RlIGlkIGFuZCBmcmFnbWVudCBpZCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0NoYXJ0Um9vdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjaGVja0ZvckNoYXJ0Um9vdEVycm9ycyhcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGdGcmFnbWVudENvZGUubG9hZE5leHRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgc2V0TGlua3NSb290KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBzZXRMaW5rc1Jvb3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3QgaW5TZWN0aW9uID0gc2VnbWVudC5zZWdtZW50SW5TZWN0aW9uO1xyXG5cclxuICAgIGlmICghaW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgaW4gc2VjdGlvbiB3YXMgbnVsbCAtIGNoYXJ0IHJvb3RcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcblxyXG4gICAgaWYgKCFzZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIGNoYXJ0IHJvb3RcIik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBhcmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgaW5TZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICBzZWdtZW50LnN0YXJ0LmtleVxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAocGFyZW50Py5saW5rKSB7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQuaWQgPT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgYW5kIEZyYWdtZW50IGFyZSB0aGUgc2FtZVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhcmVudC5saW5rLnJvb3QgPSBmcmFnbWVudDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnRGcmFnbWVudCB3YXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZWN0aW9uLmN1cnJlbnQgPSBmcmFnbWVudDtcclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NOb2RlID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjaGVja0Zvck5vZGVFcnJvcnMoXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmxvYWROZXh0Q2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIHByb2Nlc3NGcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NMYXN0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjaGVja0Zvckxhc3RGcmFnbWVudEVycm9ycyhcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIHByb2Nlc3NGcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBmcmFnbWVudC5saW5rID0gbnVsbDtcclxuICAgIGZyYWdtZW50LnNlbGVjdGVkID0gbnVsbDtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQub3B0aW9ucz8ubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5vcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0xpbmsgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gb3V0bGluZSBub2RlIGlkIGFuZCBmcmFnbWVudCBpZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dGxpbmUgPSBmcmFnbWVudC5zZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgaWYgKCFvdXRsaW5lKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZT8uYyA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZS5pc1Jvb3QgPT09IHRydWVcclxuICAgICAgICAmJiBvdXRsaW5lTm9kZS5pc0NoYXJ0ID09PSB0cnVlXHJcbiAgICApIHtcclxuICAgICAgICBzZXRMaW5rc1Jvb3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0bGluZUNoYXJ0ID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVDaGFydChcclxuICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgIG91dGxpbmVOb2RlPy5jXHJcbiAgICApO1xyXG5cclxuICAgIGdPdXRsaW5lQ29kZS5nZXRTZWdtZW50T3V0bGluZV9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgIHNlZ21lbnQuaW5kZXhcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzRXhpdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGV4aXRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNoZWNrRm9yRXhpdEVycm9ycyhcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgIGV4aXRGcmFnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzZWN0aW9uOiBJRGlzcGxheUNoYXJ0ID0gZXhpdEZyYWdtZW50LnNlY3Rpb24gYXMgSURpc3BsYXlDaGFydDtcclxuICAgIGNvbnN0IHNlY3Rpb25QYXJlbnQgPSBzZWN0aW9uLnBhcmVudDtcclxuXHJcbiAgICBpZiAoIXNlY3Rpb25QYXJlbnQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSURpc3BsYXlDaGFydCBwYXJlbnQgaXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpRXhpdEtleSA9IGV4aXRGcmFnbWVudC5leGl0S2V5O1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHNlY3Rpb25QYXJlbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLmlFeGl0S2V5ID09PSBpRXhpdEtleSkge1xyXG5cclxuICAgICAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWRFeGl0U2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudC5pbmRleCxcclxuICAgICAgICAgICAgICAgIG9wdGlvbi5pZFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBleGl0RnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBsb2FkRnJhZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmVzcG9uc2U6IGFueSxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgIGNvbnN0IHBhcmVudEZyYWdtZW50SUQgPSBvcHRpb24ucGFyZW50RnJhZ21lbnRJRCBhcyBzdHJpbmc7XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKHBhcmVudEZyYWdtZW50SUQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBmcmFnbWVudCBJRCBpcyBudWxsXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlbmRlckZyYWdtZW50ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICByZXNwb25zZS50ZXh0RGF0YSxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgIG9wdGlvbi5pZCxcclxuICAgICAgICBvcHRpb24uc2VjdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgcmV0dXJuIHJlbmRlckZyYWdtZW50O1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0ZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZXhwYW5kZWRPcHRpb246IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIGxldCBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgZnJhZ21lbnQucGFyZW50RnJhZ21lbnRJRFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIXBhcmVudEZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHBhcmVudEZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi5pZCA9PT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIGV4cGFuZGVkT3B0aW9uID0gb3B0aW9uO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChleHBhbmRlZE9wdGlvbikge1xyXG5cclxuICAgICAgICBleHBhbmRlZE9wdGlvbi51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuc2hvd09wdGlvbk5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudCxcclxuICAgICAgICAgICAgZXhwYW5kZWRPcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgZ0ZyYWdtZW50QWN0aW9ucyA9IHtcclxuXHJcbiAgICBzaG93QW5jaWxsYXJ5Tm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgLy8gcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoYW5jaWxsYXJ5LnVpLmRpc2N1c3Npb25Mb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYW5jaWxsYXJ5LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuZ2V0RnJhZ21lbnRMaW5rQ2hhcnRPdXRsaW5lKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ2V0RnJhZ21lbnRGaWxlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhclBhcmVudFNlY3Rpb25TZWxlY3RlZChwYXJlbnRGcmFnbWVudCk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUucHJlcGFyZVRvU2hvd09wdGlvbk5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLnVpLmRpc2N1c3Npb25Mb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghb3B0aW9uLmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuZ2V0RnJhZ21lbnRMaW5rQ2hhcnRPdXRsaW5lKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ2V0RnJhZ21lbnRGaWxlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8IFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG9wdGlvbi5pZClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRnJhZ21lbnRBbmRTZXRTZWxlY3RlZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBub2RlID0gbG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChub2RlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEN1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5vZGVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25UZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZS5vcHRpb24gPSBvcHRpb25UZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkKSB7XHJcblxyXG4gICAgICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkUm9vdEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGVJRCA9IHNlY3Rpb24ub3V0bGluZT8uci5pO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlSUQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlbmRlckZyYWdtZW50ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgICAgICBcInJvb3RcIixcclxuICAgICAgICAgICAgb3V0bGluZU5vZGVJRCxcclxuICAgICAgICAgICAgc2VjdGlvbixcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChyZW5kZXJGcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuc2VjdGlvbi5yb290ID0gcmVuZGVyRnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LnNlY3Rpb24uY3VycmVudCA9IHJlbmRlckZyYWdtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkQ2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGVcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudFNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYXJlbnRGcmFnbWVudElEID0gb3V0bGluZU5vZGUucGFyZW50Py5pIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlLmlzUm9vdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFvdXRsaW5lTm9kZS5pc0NoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCA9IFwiZ3VpZGVSb290XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRGcmFnbWVudElEID0gXCJyb290XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UocGFyZW50RnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBmcmFnbWVudCBJRCBpcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiB7IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsIGNvbnRpbnVlTG9hZGluZzogYm9vbGVhbiB9ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudEJhc2UoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZS50ZXh0RGF0YSxcclxuICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUuaSxcclxuICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24sXHJcbiAgICAgICAgICAgIHNlZ21lbnQuaW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHJlc3VsdC5mcmFnbWVudDtcclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24uY3VycmVudCA9IGZyYWdtZW50O1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmVudEZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudEZyYWdtZW50LmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnRGcmFnbWVudCBhbmQgRnJhZ21lbnQgYXJlIHRoZSBzYW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50LnNlbGVjdGVkID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwcm9jZXNzQ2hhaW5GcmFnbWVudFR5cGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICApO1xyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdGcmFnbWVudEFjdGlvbnM7XHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5cclxuXHJcbmNvbnN0IGdIb29rUmVnaXN0cnlDb2RlID0ge1xyXG5cclxuICAgIGV4ZWN1dGVTdGVwSG9vazogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc3RlcDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghd2luZG93Lkhvb2tSZWdpc3RyeSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cuSG9va1JlZ2lzdHJ5LmV4ZWN1dGVTdGVwSG9vayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHN0ZXBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0hvb2tSZWdpc3RyeUNvZGU7XHJcblxyXG4iLCJpbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGdIaXN0b3J5Q29kZSBmcm9tIFwiLi9nSGlzdG9yeUNvZGVcIjtcclxuaW1wb3J0IGdIb29rUmVnaXN0cnlDb2RlIGZyb20gXCIuL2dIb29rUmVnaXN0cnlDb2RlXCI7XHJcbmltcG9ydCBnT3V0bGluZUNvZGUgZnJvbSBcIi4vZ091dGxpbmVDb2RlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4vZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBnZXRWYXJpYWJsZVZhbHVlID0gKFxyXG4gICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uLFxyXG4gICAgdmFyaWFibGVWYWx1ZXM6IGFueSxcclxuICAgIHZhcmlhYmxlTmFtZTogc3RyaW5nXHJcbik6IHN0cmluZyB8IG51bGwgPT4ge1xyXG5cclxuICAgIGxldCB2YWx1ZSA9IHZhcmlhYmxlVmFsdWVzW3ZhcmlhYmxlTmFtZV07XHJcblxyXG4gICAgaWYgKHZhbHVlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBzZWN0aW9uLm91dGxpbmU/Lm12Py5bdmFyaWFibGVOYW1lXTtcclxuXHJcbiAgICBpZiAoY3VycmVudFZhbHVlKSB7XHJcblxyXG4gICAgICAgIHZhcmlhYmxlVmFsdWVzW3ZhcmlhYmxlTmFtZV0gPSBjdXJyZW50VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QW5jZXN0b3JWYXJpYWJsZVZhbHVlKFxyXG4gICAgICAgIHNlY3Rpb24sXHJcbiAgICAgICAgdmFyaWFibGVWYWx1ZXMsXHJcbiAgICAgICAgdmFyaWFibGVOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB2YXJpYWJsZVZhbHVlc1t2YXJpYWJsZU5hbWVdID8/IG51bGw7XHJcbn07XHJcblxyXG5jb25zdCBnZXRBbmNlc3RvclZhcmlhYmxlVmFsdWUgPSAoXHJcbiAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICB2YXJpYWJsZVZhbHVlczogYW55LFxyXG4gICAgdmFyaWFibGVOYW1lOiBzdHJpbmdcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3QgY2hhcnQgPSBzZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICBjb25zdCBwYXJlbnQgPSBjaGFydC5wYXJlbnQ/LnNlY3Rpb247XHJcblxyXG4gICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGFyZW50VmFsdWUgPSBwYXJlbnQub3V0bGluZT8ubXY/Llt2YXJpYWJsZU5hbWVdO1xyXG5cclxuICAgIGlmIChwYXJlbnRWYWx1ZSkge1xyXG5cclxuICAgICAgICB2YXJpYWJsZVZhbHVlc1t2YXJpYWJsZU5hbWVdID0gcGFyZW50VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QW5jZXN0b3JWYXJpYWJsZVZhbHVlKFxyXG4gICAgICAgIHBhcmVudCxcclxuICAgICAgICB2YXJpYWJsZVZhbHVlcyxcclxuICAgICAgICB2YXJpYWJsZU5hbWVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBjaGVja0ZvclZhcmlhYmxlcyA9IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBmcmFnbWVudC52YWx1ZTtcclxuICAgIGNvbnN0IHZhcmlhYmxlUmVmUGF0dGVybiA9IC/jgIjCpuKAuSg/PHZhcmlhYmxlTmFtZT5bXuKAusKmXSsp4oC6wqbjgIkvZ211O1xyXG4gICAgY29uc3QgbWF0Y2hlcyA9IHZhbHVlLm1hdGNoQWxsKHZhcmlhYmxlUmVmUGF0dGVybik7XHJcbiAgICBsZXQgdmFyaWFibGVOYW1lOiBzdHJpbmc7XHJcbiAgICBsZXQgdmFyaWFibGVWYWx1ZXM6IGFueSA9IHt9O1xyXG4gICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgbGV0IG1hcmtlciA9IDA7XHJcblxyXG4gICAgZm9yIChjb25zdCBtYXRjaCBvZiBtYXRjaGVzKSB7XHJcblxyXG4gICAgICAgIGlmIChtYXRjaFxyXG4gICAgICAgICAgICAmJiBtYXRjaC5ncm91cHNcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxyXG4gICAgICAgICAgICAmJiBtYXRjaC5pbmRleCAhPSBudWxsXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHZhcmlhYmxlTmFtZSA9IG1hdGNoLmdyb3Vwcy52YXJpYWJsZU5hbWU7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB2YXJpYWJsZVZhbHVlID0gZ2V0VmFyaWFibGVWYWx1ZShcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICB2YXJpYWJsZVZhbHVlcyxcclxuICAgICAgICAgICAgICAgIHZhcmlhYmxlTmFtZVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YXJpYWJsZVZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBWYXJpYWJsZTogJHt2YXJpYWJsZU5hbWV9IGNvdWxkIG5vdCBiZSBmb3VuZGApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgK1xyXG4gICAgICAgICAgICAgICAgdmFsdWUuc3Vic3RyaW5nKG1hcmtlciwgbWF0Y2guaW5kZXgpICtcclxuICAgICAgICAgICAgICAgIHZhcmlhYmxlVmFsdWU7XHJcblxyXG4gICAgICAgICAgICBtYXJrZXIgPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0ID0gcmVzdWx0ICtcclxuICAgICAgICB2YWx1ZS5zdWJzdHJpbmcobWFya2VyLCB2YWx1ZS5sZW5ndGgpO1xyXG5cclxuICAgIGZyYWdtZW50LnZhbHVlID0gcmVzdWx0O1xyXG59O1xyXG5cclxuY29uc3QgY2xlYXJTaWJsaW5nQ2hhaW5zID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHBhcmVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24uaWQgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICBjbGVhckZyYWdtZW50Q2hhaW5zKG9wdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgY2xlYXJGcmFnbWVudENoYWlucyA9IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghZnJhZ21lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJGcmFnbWVudENoYWlucyhmcmFnbWVudC5saW5rPy5yb290KTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBmcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGNsZWFyRnJhZ21lbnRDaGFpbnMob3B0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICBmcmFnbWVudC5saW5rID0gbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IGxvYWRPcHRpb24gPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcmF3T3B0aW9uOiBhbnksXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCxcclxuICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgIHNlZ21lbnRJbmRleDogbnVtYmVyIHwgbnVsbFxyXG4pOiBJUmVuZGVyRnJhZ21lbnQgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbiA9IG5ldyBSZW5kZXJGcmFnbWVudChcclxuICAgICAgICByYXdPcHRpb24uaWQsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICBzZWN0aW9uLFxyXG4gICAgICAgIHNlZ21lbnRJbmRleFxyXG4gICAgKTtcclxuXHJcbiAgICBvcHRpb24ub3B0aW9uID0gcmF3T3B0aW9uLm9wdGlvbiA/PyAnJztcclxuICAgIG9wdGlvbi5pc0FuY2lsbGFyeSA9IHJhd09wdGlvbi5pc0FuY2lsbGFyeSA9PT0gdHJ1ZTtcclxuICAgIG9wdGlvbi5vcmRlciA9IHJhd09wdGlvbi5vcmRlciA/PyAwO1xyXG4gICAgb3B0aW9uLmlFeGl0S2V5ID0gcmF3T3B0aW9uLmlFeGl0S2V5ID8/ICcnO1xyXG5cclxuICAgIGlmIChvdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG91dGxpbmVPcHRpb24gb2Ygb3V0bGluZU5vZGUubykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmVPcHRpb24uaSA9PT0gb3B0aW9uLmlkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZ1N0YXRlQ29kZS5jYWNoZV9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBzZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lT3B0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdTdGF0ZUNvZGUuY2FjaGVfY2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb25cclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG9wdGlvbjtcclxufTtcclxuXHJcbmNvbnN0IHNob3dQbHVnX3N1YnNjcmlwdGlvbiA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBleGl0OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBvcHRpb25UZXh0OiBzdHJpbmdcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3Qgc2VjdGlvbjogSURpc3BsYXlDaGFydCA9IGV4aXQuc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0O1xyXG4gICAgY29uc3QgcGFyZW50ID0gc2VjdGlvbi5wYXJlbnQ7XHJcblxyXG4gICAgaWYgKCFwYXJlbnQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSURpc3BsYXlDaGFydCBwYXJlbnQgaXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpRXhpdEtleSA9IGV4aXQuZXhpdEtleTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBwYXJlbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLmlFeGl0S2V5ID09PSBpRXhpdEtleSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNob3dPcHRpb25Ob2RlX3N1YnNjcmlwdG9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25UZXh0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3Qgc2hvd09wdGlvbk5vZGVfc3Vic2NyaXB0b24gPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIW9wdGlvblxyXG4gICAgICAgIHx8ICFvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aFxyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGdGcmFnbWVudENvZGUucHJlcGFyZVRvU2hvd09wdGlvbk5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgb3B0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChvcHRpb24udWkuZGlzY3Vzc2lvbkxvYWRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZ0ZyYWdtZW50Q29kZS5nZXRGcmFnbWVudEFuZExpbmtPdXRsaW5lX3N1YnNjcmlwaW9uKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIG9wdGlvbixcclxuICAgICAgICBvcHRpb25UZXh0LFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGxvYWROZXh0RnJhZ21lbnRJblNlZ21lbnQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBuZXh0T3V0bGluZU5vZGUgPSBnU2VnbWVudENvZGUuZ2V0TmV4dFNlZ21lbnRPdXRsaW5lTm9kZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIGlmICghbmV4dE91dGxpbmVOb2RlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbj8ub3V0bGluZT8ucGF0aDtcclxuICAgIGNvbnN0IHVybCA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke25leHRPdXRsaW5lTm9kZS5pfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMubG9hZENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgIG5leHRPdXRsaW5lTm9kZVxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBgbG9hZENoYWluRnJhZ21lbnRgLFxyXG4gICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgIHVybCxcclxuICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnRnJhZ21lbnRDb2RlID0ge1xyXG5cclxuICAgIGxvYWROZXh0Q2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc2VnbWVudC5vdXRsaW5lTm9kZXMubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgbG9hZE5leHRGcmFnbWVudEluU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdTZWdtZW50Q29kZS5sb2FkTmV4dFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoYXNPcHRpb246IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbklEOiBzdHJpbmdcclxuICAgICk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBmcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9uLmlkID09PSBvcHRpb25JRCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrU2VsZWN0ZWQ6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnQuc2VsZWN0ZWQ/LmlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZ0ZyYWdtZW50Q29kZS5oYXNPcHRpb24oZnJhZ21lbnQsIGZyYWdtZW50LnNlbGVjdGVkPy5pZCkpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlbGVjdGVkIGhhcyBiZWVuIHNldCB0byBmcmFnbWVudCB0aGF0IGlzbid0IGFuIG9wdGlvblwiKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyUGFyZW50U2VjdGlvblNlbGVjdGVkOiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBkaXNwbGF5Q2hhcnQgPSBmcmFnbWVudC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcblxyXG4gICAgICAgIGlmICghZGlzcGxheUNoYXJ0Py5wYXJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gZGlzcGxheUNoYXJ0LnBhcmVudDtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudC5zZWxlY3RlZCkge1xyXG5cclxuICAgICAgICAgICAgcGFyZW50LnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnRnJhZ21lbnRDb2RlLmNsZWFyUGFyZW50U2VjdGlvblNlbGVjdGVkKHBhcmVudCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyYWdtZW50QW5kTGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvblRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsLFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24udWkuZGlzY3Vzc2lvbkxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaXNjdXNzaW9uIHdhcyBhbHJlYWR5IGxvYWRlZCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUubG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaGlkZUJhbm5lciA9IHRydWU7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aH0vJHtvcHRpb24uaWR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZUFueUFycmF5ID0gKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRGcmFnbWVudEFuZFNldFNlbGVjdGVkKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgICAgIG9wdGlvblRleHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLkFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBgbG9hZEZyYWdtZW50RmlsZWAsXHJcbiAgICAgICAgICAgIFBhcnNlVHlwZS5UZXh0LFxyXG4gICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIGxvYWRBY3Rpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRMaW5rT3V0bGluZV9zdWJzY3JpcGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZSA9IG9wdGlvbi5zZWN0aW9uLm91dGxpbmU7XHJcblxyXG4gICAgICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBvcHRpb24uaWRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGU/LmMgPT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSAvLyBXaWxsIGxvYWQgaXQgZnJvbSBhIHNlZ21lbnRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0ID0gZ091dGxpbmVDb2RlLmdldE91dGxpbmVDaGFydChcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGU/LmNcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZUZyb21DaGFydF9zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldExpbmtFbGVtZW50SUQ6IChmcmFnbWVudElEOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYG50X2xrX2ZyYWdfJHtmcmFnbWVudElEfWA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyYWdtZW50RWxlbWVudElEOiAoZnJhZ21lbnRJRDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGBudF9mcl9mcmFnXyR7ZnJhZ21lbnRJRH1gO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcmVwYXJlVG9TaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLm1hcmtPcHRpb25zRXhwYW5kZWQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEN1cnJlbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnSGlzdG9yeUNvZGUucHVzaEJyb3dzZXJIaXN0b3J5U3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZUFuZExvYWRGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICAgICAgb3V0bGluZU5vZGVJRDogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdDogeyBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LCBjb250aW51ZUxvYWRpbmc6IGJvb2xlYW4gfSA9IGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkRnJhZ21lbnRCYXNlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlSUQsXHJcbiAgICAgICAgICAgIHNlY3Rpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHJlc3VsdC5mcmFnbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdC5jb250aW51ZUxvYWRpbmcgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZnJhZ21lbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5nZXRGcmFnbWVudExpbmtDaGFydE91dGxpbmUoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkRnJhZ21lbnRCYXNlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQ6IHN0cmluZyxcclxuICAgICAgICBvdXRsaW5lTm9kZUlEOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uLFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyIHwgbnVsbCA9IG51bGxcclxuICAgICk6IHsgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCwgY29udGludWVMb2FkaW5nOiBib29sZWFuIH0gPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXNlY3Rpb24ub3V0bGluZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcHRpb24gc2VjdGlvbiBvdXRsaW5lIHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByYXdGcmFnbWVudCA9IGdGcmFnbWVudENvZGUucGFyc2VGcmFnbWVudChyZXNwb25zZSk7XHJcblxyXG4gICAgICAgIGlmICghcmF3RnJhZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmF3IGZyYWdtZW50IHdhcyBudWxsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGVJRCAhPT0gcmF3RnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHJhd0ZyYWdtZW50IGlkIGRvZXMgbm90IG1hdGNoIHRoZSBvdXRsaW5lTm9kZUlEJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICBmcmFnbWVudCA9IG5ldyBSZW5kZXJGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHJhd0ZyYWdtZW50LmlkLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICAgICAgICAgIHNlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50SW5kZXhcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb250aW51ZUxvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC51aS5kaXNjdXNzaW9uTG9hZGVkKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmxvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmF3RnJhZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5jYWNoZV9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgY29udGludWVMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBjb250aW51ZUxvYWRpbmdcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBhdXRvRXhwYW5kU2luZ2xlQmxhbmtPcHRpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBvcHRpb25zQW5kQW5jaWxsYXJpZXMgPSBnRnJhZ21lbnRDb2RlLnNwbGl0T3B0aW9uc0FuZEFuY2lsbGFyaWVzKGZyYWdtZW50Lm9wdGlvbnMpO1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zWzBdLm9wdGlvbiA9PT0gJydcclxuICAgICAgICAgICAgJiYgVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSlcclxuICAgICAgICAgICAgJiYgVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5pZFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5jICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNob3dPcHRpb25Ob2RlX3N1YnNjcmlwdG9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5vcHRpb25zWzBdXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlbiBmaW5kIHRoZSBwYXJlbnQgb3B0aW9uIHdpdGggYW4gaUV4aXRLZXkgdGhhdCBtYXRjaGVzIHRoaXMgZXhpdEtleVxyXG4gICAgICAgICAgICBzaG93UGx1Z19zdWJzY3JpcHRpb24oXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBjYWNoZVNlY3Rpb25Sb290OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBkaXNwbGF5U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFkaXNwbGF5U2VjdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb290RnJhZ21lbnQgPSBkaXNwbGF5U2VjdGlvbi5yb290O1xyXG5cclxuICAgICAgICBpZiAoIXJvb3RGcmFnbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByb290RnJhZ21lbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBkaXNwbGF5U2VjdGlvbi5jdXJyZW50ID0gZGlzcGxheVNlY3Rpb24ucm9vdDtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2Ygcm9vdEZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuY2FjaGVfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBlbGVtZW50SXNQYXJhZ3JhcGg6ICh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGxldCB0cmltbWVkID0gdmFsdWU7XHJcblxyXG4gICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UodHJpbW1lZCkpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0cmltbWVkLmxlbmd0aCA+IDIwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJpbW1lZCA9IHRyaW1tZWQuc3Vic3RyaW5nKDAsIDIwKTtcclxuICAgICAgICAgICAgICAgIHRyaW1tZWQgPSB0cmltbWVkLnJlcGxhY2UoL1xccy9nLCAnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoJzxwPicpID09PSB0cnVlXHJcbiAgICAgICAgICAgICYmIHRyaW1tZWRbM10gIT09ICc8Jykge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlQW5kTG9hZEd1aWRlUm9vdEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByYXdGcmFnbWVudDogYW55LFxyXG4gICAgICAgIHJvb3Q6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghcmF3RnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5sb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByYXdGcmFnbWVudCxcclxuICAgICAgICAgICAgcm9vdFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmF3RnJhZ21lbnQ6IGFueSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZnJhZ21lbnQudG9wTGV2ZWxNYXBLZXkgPSByYXdGcmFnbWVudC50b3BMZXZlbE1hcEtleSA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5tYXBLZXlDaGFpbiA9IHJhd0ZyYWdtZW50Lm1hcEtleUNoYWluID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50Lmd1aWRlSUQgPSByYXdGcmFnbWVudC5ndWlkZUlEID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50Lmd1aWRlUGF0aCA9IHJhd0ZyYWdtZW50Lmd1aWRlUGF0aCA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5pS2V5ID0gcmF3RnJhZ21lbnQuaUtleSA/PyBudWxsO1xyXG4gICAgICAgIGZyYWdtZW50LmlFeGl0S2V5ID0gcmF3RnJhZ21lbnQuaUV4aXRLZXkgPz8gbnVsbDtcclxuICAgICAgICBmcmFnbWVudC5leGl0S2V5ID0gcmF3RnJhZ21lbnQuZXhpdEtleSA/PyBudWxsO1xyXG4gICAgICAgIGZyYWdtZW50LnZhcmlhYmxlID0gcmF3RnJhZ21lbnQudmFyaWFibGUgPz8gbnVsbDtcclxuICAgICAgICBmcmFnbWVudC52YWx1ZSA9IHJhd0ZyYWdtZW50LnZhbHVlID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50LnZhbHVlID0gZnJhZ21lbnQudmFsdWUudHJpbSgpO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmRpc2N1c3Npb25Mb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICBjaGVja0ZvclZhcmlhYmxlcyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudC5pZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnBhcmVudEZyYWdtZW50SUQgPSBvdXRsaW5lTm9kZT8ucGFyZW50Py5pID8/ICcnO1xyXG5cclxuICAgICAgICBsZXQgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmIChyYXdGcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgICYmIEFycmF5LmlzQXJyYXkocmF3RnJhZ21lbnQub3B0aW9ucylcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCByYXdPcHRpb24gb2YgcmF3RnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbiA9IGxvYWRPcHRpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmF3T3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQuc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGZyYWdtZW50Lm9wdGlvbnMucHVzaChvcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnSG9va1JlZ2lzdHJ5Q29kZS5leGVjdXRlU3RlcEhvb2soXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlRnJhZ21lbnQ6IChyZXNwb25zZTogc3RyaW5nKTogYW55ID0+IHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgICAgICAgIDxzY3JpcHQgdHlwZT1cXFwibW9kdWxlXFxcIiBzcmM9XFxcIi9Adml0ZS9jbGllbnRcXFwiPjwvc2NyaXB0PlxyXG4gICAgICAgICAgICAgICAgPCEtLSB0c0ZyYWdtZW50UmVuZGVyQ29tbWVudCB7XFxcIm5vZGVcXFwiOntcXFwiaWRcXFwiOlxcXCJkQnQ3S20yTWxcXFwiLFxcXCJ0b3BMZXZlbE1hcEtleVxcXCI6XFxcImN2MVRSbDAxcmZcXFwiLFxcXCJtYXBLZXlDaGFpblxcXCI6XFxcImN2MVRSbDAxcmZcXFwiLFxcXCJndWlkZUlEXFxcIjpcXFwiZEJ0N0pOMUhlXFxcIixcXFwiZ3VpZGVQYXRoXFxcIjpcXFwiYzovR2l0SHViL1RFU1QuRG9jdW1lbnRhdGlvbi90c21hcHNkYXRhT3B0aW9uc0ZvbGRlci9Ib2xkZXIvZGF0YU9wdGlvbnMudHNtYXBcXFwiLFxcXCJwYXJlbnRGcmFnbWVudElEXFxcIjpcXFwiZEJ0N0pOMXZ0XFxcIixcXFwiY2hhcnRLZXlcXFwiOlxcXCJjdjFUUmwwMXJmXFxcIixcXFwib3B0aW9uc1xcXCI6W119fSAtLT5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPGg0IGlkPVxcXCJvcHRpb24tMS1zb2x1dGlvblxcXCI+T3B0aW9uIDEgc29sdXRpb248L2g0PlxyXG4gICAgICAgICAgICAgICAgPHA+T3B0aW9uIDEgc29sdXRpb248L3A+XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgY29uc3QgbGluZXMgPSByZXNwb25zZS5zcGxpdCgnXFxuJyk7XHJcbiAgICAgICAgY29uc3QgcmVuZGVyQ29tbWVudFN0YXJ0ID0gYDwhLS0gJHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudFJlbmRlckNvbW1lbnRUYWd9YDtcclxuICAgICAgICBjb25zdCByZW5kZXJDb21tZW50RW5kID0gYCAtLT5gO1xyXG4gICAgICAgIGxldCBmcmFnbWVudFJlbmRlckNvbW1lbnQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGxldCBsaW5lOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IGJ1aWxkVmFsdWUgPSBmYWxzZTtcclxuICAgICAgICBsZXQgdmFsdWUgPSAnJztcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgbGluZSA9IGxpbmVzW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJ1aWxkVmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGAke3ZhbHVlfVxyXG4ke2xpbmV9YDtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKHJlbmRlckNvbW1lbnRTdGFydCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFJlbmRlckNvbW1lbnQgPSBsaW5lLnN1YnN0cmluZyhyZW5kZXJDb21tZW50U3RhcnQubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIGJ1aWxkVmFsdWUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50UmVuZGVyQ29tbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnbWVudFJlbmRlckNvbW1lbnQgPSBmcmFnbWVudFJlbmRlckNvbW1lbnQudHJpbSgpO1xyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnRSZW5kZXJDb21tZW50LmVuZHNXaXRoKHJlbmRlckNvbW1lbnRFbmQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBsZW5ndGggPSBmcmFnbWVudFJlbmRlckNvbW1lbnQubGVuZ3RoIC0gcmVuZGVyQ29tbWVudEVuZC5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmcmFnbWVudFJlbmRlckNvbW1lbnQgPSBmcmFnbWVudFJlbmRlckNvbW1lbnQuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAgIGxlbmd0aFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnJhZ21lbnRSZW5kZXJDb21tZW50ID0gZnJhZ21lbnRSZW5kZXJDb21tZW50LnRyaW0oKTtcclxuICAgICAgICBsZXQgcmF3RnJhZ21lbnQ6IGFueSB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByYXdGcmFnbWVudCA9IEpTT04ucGFyc2UoZnJhZ21lbnRSZW5kZXJDb21tZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByYXdGcmFnbWVudC52YWx1ZSA9IHZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gcmF3RnJhZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIG1hcmtPcHRpb25zRXhwYW5kZWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbGxhcHNlRnJhZ21lbnRzT3B0aW9uczogKGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudFxyXG4gICAgICAgICAgICB8fCBmcmFnbWVudC5vcHRpb25zLmxlbmd0aCA9PT0gMFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBmcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBvcHRpb24udWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3dPcHRpb25Ob2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jb2xsYXBzZUZyYWdtZW50c09wdGlvbnMoZnJhZ21lbnQpO1xyXG4gICAgICAgIG9wdGlvbi51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEN1cnJlbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICByZXNldEZyYWdtZW50VWlzOiAoc3RhdGU6IElTdGF0ZSk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBjaGFpbkZyYWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIGNoYWluRnJhZ21lbnRzKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaShjaGFpbkZyYWdtZW50c1twcm9wTmFtZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXRGcmFnbWVudFVpOiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllczogKGNoaWxkcmVuOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IHsgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiwgYW5jaWxsYXJpZXM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sIHRvdGFsOiBudW1iZXIgfSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGFuY2lsbGFyaWVzOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+ID0gW107XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiA9IFtdO1xyXG4gICAgICAgIGxldCBvcHRpb246IElSZW5kZXJGcmFnbWVudDtcclxuXHJcbiAgICAgICAgaWYgKCFjaGlsZHJlbikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllcyxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBvcHRpb24gPSBjaGlsZHJlbltpXSBhcyBJUmVuZGVyRnJhZ21lbnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbi5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbnMucHVzaChvcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYW5jaWxsYXJpZXMucHVzaChvcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICBhbmNpbGxhcmllcyxcclxuICAgICAgICAgICAgdG90YWw6IGNoaWxkcmVuLmxlbmd0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEN1cnJlbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gZnJhZ21lbnQuc2VjdGlvbjtcclxuXHJcbiAgICAgICAgbGV0IHBhcmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZnJhZ21lbnQucGFyZW50RnJhZ21lbnRJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuaWQgPT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGFuZCBGcmFnbWVudCBhcmUgdGhlIHNhbWVcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhcmVudC5zZWxlY3RlZCA9IGZyYWdtZW50O1xyXG5cclxuICAgICAgICAgICAgY2xlYXJTaWJsaW5nQ2hhaW5zKFxyXG4gICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudEZyYWdtZW50IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VjdGlvbi5jdXJyZW50ID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jaGVja1NlbGVjdGVkKGZyYWdtZW50KTtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRDb2RlO1xyXG5cclxuIiwiaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9hY3Rpb25zL2dGcmFnbWVudEFjdGlvbnNcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSUZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9wYXlsb2Fkcy9JRnJhZ21lbnRQYXlsb2FkXCI7XHJcblxyXG5cclxuY29uc3QgZnJhZ21lbnRBY3Rpb25zID0ge1xyXG5cclxuICAgIGV4cGFuZE9wdGlvbnM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZVxyXG4gICAgICAgICAgICB8fCAhZnJhZ21lbnRcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5zZXREaXJ0eShzdGF0ZSk7XHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWlzKHN0YXRlKTtcclxuICAgICAgICBjb25zdCBleHBhbmRlZCA9IGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkICE9PSB0cnVlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLm9wdGlvbnNFeHBhbmRlZCA9IGV4cGFuZGVkO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZXhwYW5kZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBoaWRlT3B0aW9uczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFmcmFnbWVudFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLnNldERpcnR5KHN0YXRlKTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGF5bG9hZDogSUZyYWdtZW50UGF5bG9hZFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFwYXlsb2FkPy5wYXJlbnRGcmFnbWVudFxyXG4gICAgICAgICAgICB8fCAhcGF5bG9hZD8ub3B0aW9uXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuc2V0RGlydHkoc3RhdGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5zaG93T3B0aW9uTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHBheWxvYWQucGFyZW50RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHBheWxvYWQub3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgdG9nZ2xlQW5jaWxsYXJ5Tm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGF5bG9hZDogSUZyYWdtZW50UGF5bG9hZFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFwYXlsb2FkPy5vcHRpb25cclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYW5jaWxsYXJ5ID0gcGF5bG9hZC5vcHRpb247XHJcbiAgICAgICAgZ1N0YXRlQ29kZS5zZXREaXJ0eShzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICghYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkKSB7XHJcblxyXG4gICAgICAgICAgICBhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMuc2hvd0FuY2lsbGFyeU5vZGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHBheWxvYWQub3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmcmFnbWVudEFjdGlvbnM7XHJcbiIsImltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSUZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9wYXlsb2Fkcy9JRnJhZ21lbnRQYXlsb2FkXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRnJhZ21lbnRQYXlsb2FkIGltcGxlbWVudHMgSUZyYWdtZW50UGF5bG9hZCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgICAgICkge1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEZyYWdtZW50ID0gcGFyZW50RnJhZ21lbnQ7XHJcbiAgICAgICAgdGhpcy5vcHRpb24gPSBvcHRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQ7XHJcbiAgICBwdWJsaWMgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQ7XHJcbn1cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4sIFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBmcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCBGcmFnbWVudFBheWxvYWQgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL3VpL3BheWxvYWRzL0ZyYWdtZW50UGF5bG9hZFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkQW5jaWxsYXJ5RGlzY3Vzc2lvblZpZXcgPSAoYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnQpOiBDaGlsZHJlbltdID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogQ2hpbGRyZW5bXSA9IFtdO1xyXG5cclxuICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgIGFuY2lsbGFyeSxcclxuICAgICAgICB2aWV3XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBidWlsZEV4cGFuZGVkQW5jaWxsYXJ5VmlldyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeVxyXG4gICAgICAgIHx8ICFhbmNpbGxhcnkuaXNBbmNpbGxhcnkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWJveFwiIH0sIFtcclxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS1oZWFkXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLnRvZ2dsZUFuY2lsbGFyeU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoX2V2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50UGF5bG9hZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJzcGFuXCIsIHt9LCBhbmNpbGxhcnkub3B0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgXSksXHJcblxyXG4gICAgICAgICAgICBidWlsZEFuY2lsbGFyeURpc2N1c3Npb25WaWV3KGFuY2lsbGFyeSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgYnVpbGRDb2xsYXBzZWRBbmNpbGxhcnlWaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5XHJcbiAgICAgICAgfHwgIWFuY2lsbGFyeS5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnktYm94IG50LWZyLWNvbGxhcHNlZFwiIH0sIFtcclxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS1oZWFkXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLnRvZ2dsZUFuY2lsbGFyeU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoX2V2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50UGF5bG9hZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJzcGFuXCIsIHt9LCBhbmNpbGxhcnkub3B0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgQnVpbGRBbmNpbGxhcnlWaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5XHJcbiAgICAgICAgfHwgIWFuY2lsbGFyeS5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBidWlsZEV4cGFuZGVkQW5jaWxsYXJ5VmlldyhcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBidWlsZENvbGxhcHNlZEFuY2lsbGFyeVZpZXcoXHJcbiAgICAgICAgcGFyZW50LFxyXG4gICAgICAgIGFuY2lsbGFyeVxyXG4gICAgKTtcclxufVxyXG5cclxuY29uc3QgQnVpbGRFeHBhbmRlZE9wdGlvblZpZXcgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFvcHRpb25cclxuICAgICAgICB8fCBvcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItb3B0aW9uLWJveFwiIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1vcHRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd246IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5zaG93T3B0aW9uTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnJhZ21lbnRQYXlsb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwge30sIG9wdGlvbi5vcHRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD5cclxuKTogeyB2aWV3OiBWTm9kZSwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvblZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcbiAgICBsZXQgb3B0aW9uVmV3OiBWTm9kZSB8IG51bGw7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9ucykge1xyXG5cclxuICAgICAgICBvcHRpb25WZXcgPSBCdWlsZEV4cGFuZGVkT3B0aW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25WZXcpIHtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvblZpZXdzLnB1c2gob3B0aW9uVmV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG9wdGlvbnNDbGFzc2VzID0gXCJudC1mci1mcmFnbWVudC1vcHRpb25zXCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LnNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgIG9wdGlvbnNDbGFzc2VzID0gYCR7b3B0aW9uc0NsYXNzZXN9IG50LWZyLWZyYWdtZW50LWNoYWluYFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7b3B0aW9uc0NsYXNzZXN9YCxcclxuICAgICAgICAgICAgICAgIHRhYmluZGV4OiAwLFxyXG4gICAgICAgICAgICAgICAgb25CbHVyOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLmhpZGVPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4gZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG9wdGlvblZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHZpZXcsXHJcbiAgICAgICAgaXNDb2xsYXBzZWQ6IGZhbHNlXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRFeHBhbmRlZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sXHJcbiAgICBmcmFnbWVudEVMZW1lbnRJRDogc3RyaW5nLFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uc1ZpZXcgPSBidWlsZEV4cGFuZGVkT3B0aW9uc1ZpZXcoXHJcbiAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIW9wdGlvbnNWaWV3KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZpZXdzLnB1c2goXHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9lb2AsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1mcmFnbWVudC1ib3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zVmlldy52aWV3XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyA9IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogVk5vZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGBudC1mci1mcmFnbWVudC1vcHRpb25zIG50LWZyLWNvbGxhcHNlZGAsXHJcbiAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5leHBhbmRPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4gZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcInNwYW5cIiwgeyBjbGFzczogYG50LWZyLW9wdGlvbi1zZWxlY3RlZGAgfSwgYCR7ZnJhZ21lbnQuc2VsZWN0ZWQ/Lm9wdGlvbn1gKSxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZENvbGxhcHNlZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25WaWV3ID0gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgY29uc3QgdmlldyA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9jb2AsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1mcmFnbWVudC1ib3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBvcHRpb25WaWV3XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIHZpZXcudWkgPSB7XHJcbiAgICAgICAgaXNDb2xsYXBzZWQ6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgdmlld3MucHVzaCh2aWV3KTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkQW5jaWxsYXJpZXNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGFuY2lsbGFyaWVzOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKGFuY2lsbGFyaWVzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhbmNpbGxhcmllc1ZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcbiAgICBsZXQgYW5jaWxsYXJ5VmlldzogVk5vZGUgfCBudWxsO1xyXG5cclxuICAgIGZvciAoY29uc3QgYW5jaWxsYXJ5IG9mIGFuY2lsbGFyaWVzKSB7XHJcblxyXG4gICAgICAgIGFuY2lsbGFyeVZpZXcgPSBCdWlsZEFuY2lsbGFyeVZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoYW5jaWxsYXJ5Vmlldykge1xyXG5cclxuICAgICAgICAgICAgYW5jaWxsYXJpZXNWaWV3cy5wdXNoKGFuY2lsbGFyeVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5jaWxsYXJpZXNWaWV3cy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFuY2lsbGFyaWVzQ2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYW5jaWxsYXJpZXNcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgYW5jaWxsYXJpZXNDbGFzc2VzID0gYCR7YW5jaWxsYXJpZXNDbGFzc2VzfSBudC1mci1mcmFnbWVudC1jaGFpbmBcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2FuY2lsbGFyaWVzQ2xhc3Nlc31gLFxyXG4gICAgICAgICAgICAgICAgdGFiaW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICAvLyBvbkJsdXI6IFtcclxuICAgICAgICAgICAgICAgIC8vICAgICBmcmFnbWVudEFjdGlvbnMuaGlkZU9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgKF9ldmVudDogYW55KSA9PiBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgLy8gXVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgYW5jaWxsYXJpZXNWaWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEFuY2lsbGFyaWVzQm94VmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcmllczogQXJyYXk8SVJlbmRlckZyYWdtZW50PixcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBhbmNpbGxhcmllc1ZpZXcgPSBidWlsZEFuY2lsbGFyaWVzVmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBhbmNpbGxhcmllc1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyaWVzVmlldykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3cy5wdXNoKFxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fYWAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1mcmFnbWVudC1ib3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllc1ZpZXdcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIClcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD5cclxuKTogeyB2aWV3OiBWTm9kZSwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAmJiBvcHRpb25zWzBdLm9wdGlvbiA9PT0gJydcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3ID0gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZpZXcsXHJcbiAgICAgICAgICAgIGlzQ29sbGFwc2VkOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3KFxyXG4gICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sXHJcbiAgICBmcmFnbWVudEVMZW1lbnRJRDogc3RyaW5nLFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMVxyXG4gICAgICAgICYmIG9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBidWlsZENvbGxhcHNlZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgZnJhZ21lbnRFTGVtZW50SUQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkRXhwYW5kZWRPcHRpb25zQm94VmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgIHZpZXdzXHJcbiAgICApO1xyXG59O1xyXG5cclxuXHJcbmNvbnN0IG9wdGlvbnNWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgIHx8ICFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSAvLyBEb24ndCBkcmF3IG9wdGlvbnMgb2YgbGlua3NcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHZpZXdzOiBbXSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNDb2xsYXBzZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAgICAgJiYgZnJhZ21lbnQub3B0aW9uc1swXS5vcHRpb24gPT09ICcnXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB2aWV3czogW10sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zQ29sbGFwc2VkOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc0FuZEFuY2lsbGFyaWVzID0gZ0ZyYWdtZW50Q29kZS5zcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllcyhmcmFnbWVudC5vcHRpb25zKTtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld3M6IENoaWxkcmVuW10gPSBbXHJcblxyXG4gICAgICAgICAgICBidWlsZEFuY2lsbGFyaWVzVmlldyhcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc1ZpZXdSZXN1bHRzID0gYnVpbGRPcHRpb25zVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnNWaWV3UmVzdWx0cykge1xyXG5cclxuICAgICAgICAgICAgdmlld3MucHVzaChvcHRpb25zVmlld1Jlc3VsdHMudmlldyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB2aWV3cyxcclxuICAgICAgICAgICAgb3B0aW9uc0NvbGxhcHNlZDogb3B0aW9uc1ZpZXdSZXN1bHRzPy5pc0NvbGxhcHNlZCA/PyBmYWxzZVxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkVmlldzI6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgIHx8ICFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSAvLyBEb24ndCBkcmF3IG9wdGlvbnMgb2YgbGlua3NcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIGZyYWdtZW50Lm9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEVMZW1lbnRJRCA9IGdGcmFnbWVudENvZGUuZ2V0RnJhZ21lbnRFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGJ1aWxkQW5jaWxsYXJpZXNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICBmcmFnbWVudEVMZW1lbnRJRCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zVmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4gfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkTGlua0Rpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gZmFsc2U7XHJcbiAgICBjb25zdCB2aWV3c0xlbmd0aCA9IHZpZXdzLmxlbmd0aDtcclxuXHJcbiAgICBpZiAodmlld3NMZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxhc3RWaWV3OiBhbnkgPSB2aWV3c1t2aWV3c0xlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBpZiAobGFzdFZpZXc/LnVpPy5pc0NvbGxhcHNlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmtFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldExpbmtFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgY29uc3QgcmVzdWx0czogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiB9ID0gb3B0aW9uc1ZpZXdzLmJ1aWxkVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgY29uc3QgdmlldyA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2xpbmtFTGVtZW50SUR9X2xgLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIm50LWZyLWZyYWdtZW50LWJveFwiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibnQtZnItcHJpb3ItY29sbGFwc2VkLW9wdGlvbnNcIjogYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogYG50LWZyLWZyYWdtZW50LWRpc2N1c3Npb25gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEtZGlzY3Vzc2lvblwiOiBmcmFnbWVudC52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcIlxyXG4gICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnZpZXdzXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIGlmIChyZXN1bHRzLm9wdGlvbnNDb2xsYXBzZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdmlldy51aSA9IHtcclxuICAgICAgICAgICAgaXNDb2xsYXBzZWQ6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHZpZXdzLnB1c2godmlldyk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZExpbmtFeGl0c1ZpZXcgPSAoXHJcbiAgICBfZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIF92aWV3OiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIHJldHVyblxyXG5cclxuICAgIC8vIGlmICghZnJhZ21lbnQub3B0aW9uc1xyXG4gICAgLy8gICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAvLyAgICAgfHwgIWZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkXHJcbiAgICAvLyApIHtcclxuICAgIC8vICAgICByZXR1cm47XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5leGl0S2V5KSkge1xyXG5cclxuICAgIC8vICAgICAvLyBUaGVuIG1hcCBoYXMgYSBzaW5nbGUgZXhpdCBhbmQgaXQgd2FzIG1lcmdlZCBpbnRvIHRoaXMgZnJhZ21lbnRcclxuICAgIC8vICAgICByZXR1cm47XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gdmlldy5wdXNoKFxyXG5cclxuICAgIC8vICAgICBoKFwiZGl2XCIsXHJcbiAgICAvLyAgICAgICAgIHtcclxuICAgIC8vICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWV4aXRzLWJveFwiXHJcbiAgICAvLyAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgIFtcclxuICAgIC8vICAgICAgICAgICAgIG9wdGlvbnNWaWV3cy5idWlsZFZpZXcoZnJhZ21lbnQpXHJcbiAgICAvLyAgICAgICAgIF1cclxuICAgIC8vICAgICApXHJcbiAgICAvLyApO1xyXG59O1xyXG5cclxuY29uc3QgbGlua1ZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgdmlld3M6IENoaWxkcmVuW11cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBidWlsZExpbmtEaXNjdXNzaW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50Lmxpbms/LnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIGxpbmtWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5saW5rLnJvb3QsXHJcbiAgICAgICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYnVpbGRMaW5rRXhpdHNWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmcmFnbWVudFZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGxpbmtWaWV3cztcclxuXHJcblxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuXHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5pbXBvcnQgbGlua1ZpZXdzIGZyb20gXCIuL2xpbmtWaWV3c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5jb25zdCBidWlsZERpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC52YWx1ZSkgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPSBmYWxzZTtcclxuICAgIGNvbnN0IHZpZXdzTGVuZ3RoID0gdmlld3MubGVuZ3RoO1xyXG5cclxuICAgIGlmICh2aWV3c0xlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgY29uc3QgbGFzdFZpZXc6IGFueSA9IHZpZXdzW3ZpZXdzTGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/LmlzQ29sbGFwc2VkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldEZyYWdtZW50RWxlbWVudElEKGZyYWdtZW50LmlkKTtcclxuXHJcbiAgICB2aWV3cy5wdXNoKFxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fZGAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibnQtZnItZnJhZ21lbnQtYm94XCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJudC1mci1wcmlvci1jb2xsYXBzZWQtb3B0aW9uc1wiOiBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID09PSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBgbnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1kaXNjdXNzaW9uXCI6IGZyYWdtZW50LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcIlwiXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGZyYWdtZW50Vmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQsXHJcbiAgICAgICAgdmlld3M6IENoaWxkcmVuW11cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJ1aWxkRGlzY3Vzc2lvblZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBsaW5rVmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQubGluay5yb290LFxyXG4gICAgICAgICAgICAgICAgdmlld3NcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9wdGlvbnNWaWV3cy5idWlsZFZpZXcyKFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmcmFnbWVudFZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZyYWdtZW50Vmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4sIFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG4vLyBpbXBvcnQgZ0RlYnVnZ2VyQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0RlYnVnZ2VyQ29kZVwiO1xyXG5cclxuaW1wb3J0IFwiLi4vc2Nzcy9mcmFnbWVudHMuc2Nzc1wiO1xyXG5cclxuXHJcbmNvbnN0IGd1aWRlVmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRDb250ZW50VmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGlubmVyVmlld3M6IENoaWxkcmVuW10gPSBbXTtcclxuXHJcbiAgICAgICAgZnJhZ21lbnRWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdCxcclxuICAgICAgICAgICAgaW5uZXJWaWV3c1xyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgLy8gZ0RlYnVnZ2VyQ29kZS5sb2dSb290KHN0YXRlKTtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBcIm50X2ZyX0ZyYWdtZW50c1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGlubmVyVmlld3NcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBndWlkZVZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IGluaXRBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2luaXRBY3Rpb25zXCI7XHJcbmltcG9ydCBndWlkZVZpZXdzIGZyb20gXCIuLi8uLi9mcmFnbWVudHMvdmlld3MvZ3VpZGVWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRWaWV3ID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiBpbml0QWN0aW9ucy5zZXROb3RSYXcsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IFwidHJlZVNvbHZlRnJhZ21lbnRzXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgZ3VpZGVWaWV3cy5idWlsZENvbnRlbnRWaWV3KHN0YXRlKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRWaWV3O1xyXG5cclxuIiwiaW1wb3J0IElTZXR0aW5ncyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lTZXR0aW5nc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNldHRpbmdzIGltcGxlbWVudHMgSVNldHRpbmdzIHtcclxuXHJcbiAgICBwdWJsaWMga2V5OiBzdHJpbmcgPSBcIi0xXCI7XHJcbiAgICBwdWJsaWMgcjogc3RyaW5nID0gXCItMVwiO1xyXG5cclxuICAgIC8vIEF1dGhlbnRpY2F0aW9uXHJcbiAgICBwdWJsaWMgdXNlclBhdGg6IHN0cmluZyA9IGB1c2VyYDtcclxuICAgIHB1YmxpYyBkZWZhdWx0TG9nb3V0UGF0aDogc3RyaW5nID0gYGxvZ291dGA7XHJcbiAgICBwdWJsaWMgZGVmYXVsdExvZ2luUGF0aDogc3RyaW5nID0gYGxvZ2luYDtcclxuICAgIHB1YmxpYyByZXR1cm5VcmxTdGFydDogc3RyaW5nID0gYHJldHVyblVybGA7XHJcblxyXG4gICAgcHJpdmF0ZSBiYXNlVXJsOiBzdHJpbmcgPSAod2luZG93IGFzIGFueSkuQVNTSVNUQU5UX0JBU0VfVVJMID8/ICcnO1xyXG4gICAgcHVibGljIGxpbmtVcmw6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfTElOS19VUkwgPz8gJyc7XHJcbiAgICBwdWJsaWMgc3Vic2NyaXB0aW9uSUQ6IHN0cmluZyA9ICh3aW5kb3cgYXMgYW55KS5BU1NJU1RBTlRfU1VCU0NSSVBUSU9OX0lEID8/ICcnO1xyXG5cclxuICAgIHB1YmxpYyBhcGlVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vYXBpYDtcclxuICAgIHB1YmxpYyBiZmZVcmw6IHN0cmluZyA9IGAke3RoaXMuYmFzZVVybH0vYmZmYDtcclxuICAgIHB1YmxpYyBmaWxlVXJsOiBzdHJpbmcgPSBgJHt0aGlzLmJhc2VVcmx9L2ZpbGVgO1xyXG59XHJcbiIsIlxyXG5leHBvcnQgZW51bSBuYXZpZ2F0aW9uRGlyZWN0aW9uIHtcclxuXHJcbiAgICBCdXR0b25zID0gJ2J1dHRvbnMnLFxyXG4gICAgQmFja3dhcmRzID0gJ2JhY2t3YXJkcycsXHJcbiAgICBGb3J3YXJkcyA9ICdmb3J3YXJkcydcclxufVxyXG5cclxuIiwiaW1wb3J0IHsgbmF2aWdhdGlvbkRpcmVjdGlvbiB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL25hdmlnYXRpb25EaXJlY3Rpb25cIjtcclxuaW1wb3J0IElIaXN0b3J5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlcIjtcclxuaW1wb3J0IElIaXN0b3J5VXJsIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlVcmxcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaXN0b3J5IGltcGxlbWVudHMgSUhpc3Rvcnkge1xyXG5cclxuICAgIHB1YmxpYyBoaXN0b3J5Q2hhaW46IEFycmF5PElIaXN0b3J5VXJsPiA9IFtdO1xyXG4gICAgcHVibGljIGRpcmVjdGlvbjogbmF2aWdhdGlvbkRpcmVjdGlvbiA9IG5hdmlnYXRpb25EaXJlY3Rpb24uQnV0dG9ucztcclxuICAgIHB1YmxpYyBjdXJyZW50SW5kZXg6IG51bWJlciA9IDA7XHJcbn1cclxuIiwiaW1wb3J0IElVc2VyIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVVzZXJcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyIGltcGxlbWVudHMgSVVzZXIge1xyXG5cclxuICAgIHB1YmxpYyBrZXk6IHN0cmluZyA9IGAwMTIzNDU2Nzg5YDtcclxuICAgIHB1YmxpYyByOiBzdHJpbmcgPSBcIi0xXCI7XHJcbiAgICBwdWJsaWMgdXNlVnNDb2RlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBhdXRob3Jpc2VkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgcmF3OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBsb2dvdXRVcmw6IHN0cmluZyA9IFwiXCI7XHJcbiAgICBwdWJsaWMgc2hvd01lbnU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIHN1Yjogc3RyaW5nID0gXCJcIjtcclxufVxyXG4iLCJpbXBvcnQgSVJlcGVhdEVmZmVjdHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JUmVwZWF0RWZmZWN0c1wiO1xyXG5pbXBvcnQgSUh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZWZmZWN0cy9JSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwZWF0ZUVmZmVjdHMgaW1wbGVtZW50cyBJUmVwZWF0RWZmZWN0cyB7XHJcblxyXG4gICAgcHVibGljIHNob3J0SW50ZXJ2YWxIdHRwOiBBcnJheTxJSHR0cEVmZmVjdD4gPSBbXTtcclxuICAgIHB1YmxpYyByZUxvYWRHZXRIdHRwSW1tZWRpYXRlOiBBcnJheTxJSHR0cEVmZmVjdD4gPSBbXTtcclxuICAgIHB1YmxpYyBydW5BY3Rpb25JbW1lZGlhdGU6IEFycmF5PElBY3Rpb24+ID0gW107XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJTdGF0ZVVJIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL0lSZW5kZXJTdGF0ZVVJXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyU3RhdGVVSSBpbXBsZW1lbnRzIElSZW5kZXJTdGF0ZVVJIHtcclxuXHJcbiAgICBwdWJsaWMgcmF3OiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBvcHRpb25zRXhwYW5kZWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlHdWlkZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5R3VpZGVcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lSZW5kZXJTdGF0ZVwiO1xyXG5pbXBvcnQgSUNoYWluU2VnbWVudCBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyU3RhdGVVSSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyU3RhdGVVSVwiO1xyXG5pbXBvcnQgUmVuZGVyU3RhdGVVSSBmcm9tIFwiLi91aS9SZW5kZXJTdGF0ZVVJXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyU3RhdGUgaW1wbGVtZW50cyBJUmVuZGVyU3RhdGUge1xyXG5cclxuICAgIHB1YmxpYyByZWZyZXNoVXJsOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgaXNDaGFpbkxvYWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBzZWdtZW50czogQXJyYXk8SUNoYWluU2VnbWVudD4gPSBbXTtcclxuICAgIHB1YmxpYyBkaXNwbGF5R3VpZGU6IElEaXNwbGF5R3VpZGUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBvdXRsaW5lczogYW55ID0ge307XHJcbiAgICBwdWJsaWMgb3V0bGluZVVybHM6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIGN1cnJlbnRTZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24gfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICAvLyBTZWFyY2ggaW5kaWNlc1xyXG4gICAgcHVibGljIGluZGV4X291dGxpbmVOb2Rlc19pZDogYW55ID0ge307XHJcbiAgICBwdWJsaWMgaW5kZXhfY2hhaW5GcmFnbWVudHNfaWQ6IGFueSA9IHt9O1xyXG5cclxuICAgIHB1YmxpYyB1aTogSVJlbmRlclN0YXRlVUkgPSBuZXcgUmVuZGVyU3RhdGVVSSgpO1xyXG59XHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBTZXR0aW5ncyBmcm9tIFwiLi91c2VyL1NldHRpbmdzXCI7XHJcbmltcG9ydCBJU2V0dGluZ3MgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvdXNlci9JU2V0dGluZ3NcIjtcclxuaW1wb3J0IElIaXN0b3J5IGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSUhpc3RvcnlcIjtcclxuaW1wb3J0IFN0ZXBIaXN0b3J5IGZyb20gXCIuL2hpc3RvcnkvSGlzdG9yeVwiO1xyXG5pbXBvcnQgSVVzZXIgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvdXNlci9JVXNlclwiO1xyXG5pbXBvcnQgVXNlciBmcm9tIFwiLi91c2VyL1VzZXJcIjtcclxuaW1wb3J0IElSZXBlYXRFZmZlY3RzIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSVJlcGVhdEVmZmVjdHNcIjtcclxuaW1wb3J0IFJlcGVhdGVFZmZlY3RzIGZyb20gXCIuL2VmZmVjdHMvUmVwZWF0ZUVmZmVjdHNcIjtcclxuaW1wb3J0IElSZW5kZXJTdGF0ZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9JUmVuZGVyU3RhdGVcIjtcclxuaW1wb3J0IFJlbmRlclN0YXRlIGZyb20gXCIuL1JlbmRlclN0YXRlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGUgaW1wbGVtZW50cyBJU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgICAgICBjb25zdCBzZXR0aW5nczogSVNldHRpbmdzID0gbmV3IFNldHRpbmdzKCk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsb2FkaW5nOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgZ2VuZXJpY0Vycm9yOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgbmV4dEtleTogbnVtYmVyID0gLTE7XHJcbiAgICBwdWJsaWMgc2V0dGluZ3M6IElTZXR0aW5ncztcclxuICAgIHB1YmxpYyB1c2VyOiBJVXNlciA9IG5ldyBVc2VyKCk7XHJcbiAgICBcclxuICAgIHB1YmxpYyByZW5kZXJTdGF0ZTogSVJlbmRlclN0YXRlID0gbmV3IFJlbmRlclN0YXRlKCk7XHJcblxyXG4gICAgcHVibGljIHJlcGVhdEVmZmVjdHM6IElSZXBlYXRFZmZlY3RzID0gbmV3IFJlcGVhdGVFZmZlY3RzKCk7XHJcblxyXG4gICAgcHVibGljIHN0ZXBIaXN0b3J5OiBJSGlzdG9yeSA9IG5ldyBTdGVwSGlzdG9yeSgpO1xyXG59XHJcblxyXG5cclxuIiwiXHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCB7IGdBdXRoZW50aWNhdGVkSHR0cCB9IGZyb20gXCIuLi9odHRwL2dBdXRoZW50aWNhdGlvbkh0dHBcIjtcclxuaW1wb3J0IGdBamF4SGVhZGVyQ29kZSBmcm9tIFwiLi4vaHR0cC9nQWpheEhlYWRlckNvZGVcIjtcclxuaW1wb3J0IGdSZW5kZXJBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dPdXRsaW5lQWN0aW9uc1wiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgZ091dGxpbmVDb2RlIGZyb20gXCIuLi9jb2RlL2dPdXRsaW5lQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdldEd1aWRlT3V0bGluZSA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nIHwgbnVsbCxcclxuICAgIGxvYWREZWxlZ2F0ZTogKHN0YXRlOiBJU3RhdGUsIG91dGxpbmVSZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheVxyXG4pOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGNhbGxJRCxcclxuICAgICAgICBBY3Rpb25UeXBlLkdldE91dGxpbmVcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtnRmlsZUNvbnN0YW50cy5ndWlkZU91dGxpbmVGaWxlbmFtZX1gO1xyXG5cclxuICAgIGNvbnN0IGxvYWRSZXF1ZXN0ZWQgPSBnT3V0bGluZUNvZGUucmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgdXJsXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChsb2FkUmVxdWVzdGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBnQXV0aGVudGljYXRlZEh0dHAoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzcG9uc2U6ICdqc29uJyxcclxuICAgICAgICBhY3Rpb246IGxvYWREZWxlZ2F0ZSxcclxuICAgICAgICBlcnJvcjogKHN0YXRlOiBJU3RhdGUsIGVycm9yRGV0YWlsczogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgZ2V0dGluZyBvdXRsaW5lIGRhdGEgZnJvbSB0aGUgc2VydmVyLlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dSZW5kZXJFZmZlY3RzLmdldEd1aWRlT3V0bGluZS5uYW1lfSxcclxuICAgICAgICAgICAgICAgIFwiY2FsbElEOiAke2NhbGxJRH1cclxuICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgYWxlcnQoYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgb3V0bGluZSBkYXRhIGZyb20gdGhlIHNlcnZlci5cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUubmFtZX0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG5cclxuY29uc3QgZ1JlbmRlckVmZmVjdHMgPSB7XHJcblxyXG4gICAgZ2V0R3VpZGVPdXRsaW5lOiAoc3RhdGU6IElTdGF0ZSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5ndWlkZS5mcmFnbWVudEZvbGRlclVybCA/PyAnbnVsbCc7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1JlbmRlckFjdGlvbnMubG9hZEd1aWRlT3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEd1aWRlT3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsLFxyXG4gICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRHdWlkZU91dGxpbmVBbmRMb2FkU2VnbWVudHM6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmcgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/Lmd1aWRlLmZyYWdtZW50Rm9sZGVyVXJsID8/ICdudWxsJztcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBnUmVuZGVyQWN0aW9ucy5sb2FkR3VpZGVPdXRsaW5lQW5kU2VnbWVudHMoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEd1aWRlT3V0bGluZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsLFxyXG4gICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1JlbmRlckVmZmVjdHM7XHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgU3RhdGUgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL1N0YXRlXCI7XHJcbmltcG9ydCBUcmVlU29sdmUgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL3dpbmRvdy9UcmVlU29sdmVcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnUmVuZGVyRWZmZWN0cyBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2VmZmVjdHMvZ1JlbmRlckVmZmVjdHNcIjtcclxuaW1wb3J0IGdSZW5kZXJDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nUmVuZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ1NlZ21lbnRDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRpYWxpc2VTdGF0ZSA9ICgpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgIGlmICghd2luZG93LlRyZWVTb2x2ZSkge1xyXG5cclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlID0gbmV3IFRyZWVTb2x2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0YXRlOiBJU3RhdGUgPSBuZXcgU3RhdGUoKTtcclxuICAgIGdSZW5kZXJDb2RlLnBhcnNlUmVuZGVyaW5nQ29tbWVudChzdGF0ZSk7XHJcblxyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRSZW5kZXJEaXNwbGF5ID0gKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3QpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3QuaUtleSkgPT09IHRydWVcclxuICAgICAgICAmJiAoIXN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8ucm9vdC5vcHRpb25zLmxlbmd0aCA9PT0gMClcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGdSZW5kZXJFZmZlY3RzLmdldEd1aWRlT3V0bGluZShzdGF0ZSlcclxuICAgIF07XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFNlZ21lbnRzUmVuZGVyRGlzcGxheSA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBxdWVyeVN0cmluZzogc3RyaW5nXHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9IHRydWU7XHJcblxyXG4gICAgZ1NlZ21lbnRDb2RlLnBhcnNlU2VnbWVudHMoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgcXVlcnlTdHJpbmdcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuXHJcbiAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAxKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIHdhcyBvbmx5IDEgc2VnbWVudFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByb290U2VnbWVudCA9IHNlZ21lbnRzWzBdO1xyXG5cclxuICAgIGlmICghcm9vdFNlZ21lbnQuc3RhcnQuaXNSb290KSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkd1aWRlUm9vdCBub3QgcHJlc2VudFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmaXJzdFNlZ21lbnQgPSBzZWdtZW50c1sxXTtcclxuXHJcbiAgICBpZiAoIWZpcnN0U2VnbWVudC5zdGFydC5pc0xhc3RcclxuICAgICAgICAmJiBmaXJzdFNlZ21lbnQuc3RhcnQudHlwZSAhPT0gT3V0bGluZVR5cGUuTGlua1xyXG4gICAgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBxdWVyeSBzdHJpbmcgZm9ybWF0IC0gaXQgc2hvdWxkIHN0YXJ0IHdpdGggJy0nIG9yICd+J1wiKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGdSZW5kZXJFZmZlY3RzLmdldEd1aWRlT3V0bGluZUFuZExvYWRTZWdtZW50cyhzdGF0ZSlcclxuICAgIF07XHJcbn07XHJcblxyXG5jb25zdCBpbml0U3RhdGUgPSB7XHJcblxyXG4gICAgaW5pdGlhbGlzZTogKCk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdGU6IElTdGF0ZSA9IGluaXRpYWxpc2VTdGF0ZSgpO1xyXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xyXG5cclxuICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShxdWVyeVN0cmluZykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRTZWdtZW50c1JlbmRlckRpc3BsYXkoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgcXVlcnlTdHJpbmdcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlbmRlckRpc3BsYXkoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZTogYW55KSB7XHJcblxyXG4gICAgICAgICAgICBzdGF0ZS5nZW5lcmljRXJyb3IgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFN0YXRlO1xyXG5cclxuIiwiaW1wb3J0IEZpbHRlcnMgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzXCI7XHJcbmltcG9ydCBUcmVlU29sdmUgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL3dpbmRvdy9UcmVlU29sdmVcIjtcclxuXHJcblxyXG5jb25zdCByZW5kZXJDb21tZW50cyA9IHtcclxuXHJcbiAgICByZWdpc3Rlckd1aWRlQ29tbWVudDogKCkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB0cmVlU29sdmVHdWlkZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChGaWx0ZXJzLnRyZWVTb2x2ZUd1aWRlSUQpIGFzIEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgICAgICBpZiAodHJlZVNvbHZlR3VpZGVcclxuICAgICAgICAgICAgJiYgdHJlZVNvbHZlR3VpZGUuaGFzQ2hpbGROb2RlcygpID09PSB0cnVlXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZE5vZGU6IENoaWxkTm9kZTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJlZVNvbHZlR3VpZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5DT01NRU5UX05PREUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3aW5kb3cuVHJlZVNvbHZlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlID0gbmV3IFRyZWVTb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5yZW5kZXJpbmdDb21tZW50ID0gY2hpbGROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgIT09IE5vZGUuVEVYVF9OT0RFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHJlbmRlckNvbW1lbnRzO1xyXG4iLCJpbXBvcnQgeyBhcHAgfSBmcm9tIFwiLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcblxuaW1wb3J0IGluaXRTdWJzY3JpcHRpb25zIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnNcIjtcbmltcG9ydCBpbml0RXZlbnRzIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdEV2ZW50c1wiO1xuaW1wb3J0IGluaXRWaWV3IGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3ZpZXdzL2luaXRWaWV3XCI7XG5pbXBvcnQgaW5pdFN0YXRlIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlXCI7XG5pbXBvcnQgcmVuZGVyQ29tbWVudHMgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9yZW5kZXJDb21tZW50c1wiO1xuXG5cbmluaXRFdmVudHMucmVnaXN0ZXJHbG9iYWxFdmVudHMoKTtcbnJlbmRlckNvbW1lbnRzLnJlZ2lzdGVyR3VpZGVDb21tZW50KCk7XG5cbih3aW5kb3cgYXMgYW55KS5Db21wb3NpdGVGbG93c0F1dGhvciA9IGFwcCh7XG4gICAgXG4gICAgbm9kZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0cmVlU29sdmVGcmFnbWVudHNcIiksXG4gICAgaW5pdDogaW5pdFN0YXRlLmluaXRpYWxpc2UsXG4gICAgdmlldzogaW5pdFZpZXcuYnVpbGRWaWV3LFxuICAgIHN1YnNjcmlwdGlvbnM6IGluaXRTdWJzY3JpcHRpb25zLFxuICAgIG9uRW5kOiBpbml0RXZlbnRzLm9uUmVuZGVyRmluaXNoZWRcbn0pO1xuXG5cbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uL3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uL3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSUhvb2tSZWdpc3RyeSBmcm9tIFwiLi4vc3JjL21vZHVsZXMvaW50ZXJmYWNlcy93aW5kb3cvSUhvb2tSZWdpc3RyeVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9va1JlZ2lzdHJ5IGltcGxlbWVudHMgSUhvb2tSZWdpc3RyeSB7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwSG9vazogKChzdGF0ZTogSVN0YXRlLCBzdGVwOiBJUmVuZGVyRnJhZ21lbnQpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIHJlZ2lzdGVyU3RlcEhvb2soaG9vazogKHN0YXRlOiBJU3RhdGUsIHN0ZXA6IElSZW5kZXJGcmFnbWVudCkgPT4gdm9pZCk6IHZvaWQge1xyXG5cclxuICAgICAgICB0aGlzLnN0ZXBIb29rID0gaG9vaztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZXhlY3V0ZVN0ZXBIb29rKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc3RlcDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkIHtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc3RlcEhvb2spIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RlcEhvb2soXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHN0ZXBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJSG9va1JlZ2lzdHJ5IGZyb20gXCIuLi9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3dpbmRvdy9JSG9va1JlZ2lzdHJ5XCI7XHJcbmltcG9ydCBIb29rUmVnaXN0cnkgZnJvbSBcIi4vSG9va1JlZ2lzdHJ5XCJcclxuXHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcblxyXG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcblxyXG4gICAgICAgIEhvb2tSZWdpc3RyeTogSUhvb2tSZWdpc3RyeVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCByZWdpc3RlclN0ZXBIb29rID0gKCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghd2luZG93Lkhvb2tSZWdpc3RyeSkge1xyXG5cclxuICAgICAgICB3aW5kb3cuSG9va1JlZ2lzdHJ5ID0gbmV3IEhvb2tSZWdpc3RyeSgpO1xyXG4gICAgICAgIHdpbmRvdy5Ib29rUmVnaXN0cnkucmVnaXN0ZXJTdGVwSG9vayhzdGVwSG9vay5wcm9jZXNzU3RlcCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBQUk9DRVNTX1NURVAgPSAnPHA+UFJPQ0VTU19TVEVQPC9wPic7XHJcblxyXG5jb25zdCBydW5Qcm9jZXNzU3RlcCA9IChzdGVwVGV4dDogc3RyaW5nKTogeyBydW5Qcm9jZXNzOiBib29sZWFuLCBzdGVwVGV4dDogc3RyaW5nIH0gPT4ge1xyXG5cclxuICAgIGxldCBmaXJzdGxpbmVFbmRJbmRleCA9IHN0ZXBUZXh0LmluZGV4T2YoJ1xcbicpO1xyXG4gICAgbGV0IGZpcnN0TGluZSA9ICcnO1xyXG5cclxuICAgIGlmIChmaXJzdGxpbmVFbmRJbmRleCA9PT0gLTEpIHtcclxuXHJcbiAgICAgICAgZmlyc3RMaW5lID0gc3RlcFRleHQ7XHJcbiAgICAgICAgc3RlcFRleHQgPSAnJ1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgZmlyc3RMaW5lID0gc3RlcFRleHQuc3Vic3RyaW5nKDAsIGZpcnN0bGluZUVuZEluZGV4KTtcclxuICAgICAgICBzdGVwVGV4dCA9IHN0ZXBUZXh0LnN1YnN0cmluZyhmaXJzdGxpbmVFbmRJbmRleCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmaXJzdExpbmUudHJpbSgpID09PSBQUk9DRVNTX1NURVApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcnVuUHJvY2VzczogdHJ1ZSxcclxuICAgICAgICAgICAgc3RlcFRleHRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcnVuUHJvY2VzczogZmFsc2UsXHJcbiAgICAgICAgc3RlcFRleHRcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBzdGVwSG9vayA9IHtcclxuXHJcbiAgICBwcm9jZXNzU3RlcDogKFxyXG4gICAgICAgIF9zdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHN0ZXA6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQ6IHsgcnVuUHJvY2VzczogYm9vbGVhbiwgc3RlcFRleHQ6IHN0cmluZyB9ID0gcnVuUHJvY2Vzc1N0ZXAoc3RlcC52YWx1ZSk7XHJcblxyXG4gICAgICAgIGlmICghcmVzdWx0LnJ1blByb2Nlc3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RlcC52YWx1ZSA9IHJlc3VsdC5zdGVwVGV4dDtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzdGVwSG9vaztcclxuXHJcblxyXG5yZWdpc3RlclN0ZXBIb29rKCk7XHJcbiJdLCJuYW1lcyI6WyJwcm9wcyIsImNvdW50Iiwib3V0cHV0IiwiVSIsImxvY2F0aW9uIiwiZWZmZWN0IiwiaHR0cEVmZmVjdCIsIkFjdGlvblR5cGUiLCJzdGF0ZSIsIlBhcnNlVHlwZSIsIk91dGxpbmVUeXBlIiwiU2Nyb2xsSG9wVHlwZSIsIm91dGxpbmVSZXNwb25zZSIsIm5hdmlnYXRpb25EaXJlY3Rpb24iLCJTdGVwSGlzdG9yeSIsImdSZW5kZXJBY3Rpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUksZ0JBQWdCO0FBQ3BCLElBQUksWUFBWTtBQUNoQixJQUFJLFlBQVk7QUFDaEIsSUFBSSxZQUFZLENBQUE7QUFDaEIsSUFBSSxZQUFZLENBQUE7QUFDaEIsSUFBSSxNQUFNLFVBQVU7QUFDcEIsSUFBSSxVQUFVLE1BQU07QUFDcEIsSUFBSSxRQUNGLE9BQU8sMEJBQTBCLGNBQzdCLHdCQUNBO0FBRU4sSUFBSSxjQUFjLFNBQVMsS0FBSztBQUM5QixNQUFJLE1BQU07QUFFVixNQUFJLE9BQU8sUUFBUSxTQUFVLFFBQU87QUFFcEMsTUFBSSxRQUFRLEdBQUcsS0FBSyxJQUFJLFNBQVMsR0FBRztBQUNsQyxhQUFTLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxRQUFRLEtBQUs7QUFDeEMsV0FBSyxNQUFNLFlBQVksSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJO0FBQ3RDLGdCQUFRLE9BQU8sT0FBTztBQUFBLE1BQ3hCO0FBQUEsSUFDRjtBQUFBLEVBQ0YsT0FBTztBQUNMLGFBQVMsS0FBSyxLQUFLO0FBQ2pCLFVBQUksSUFBSSxDQUFDLEdBQUc7QUFDVixnQkFBUSxPQUFPLE9BQU87QUFBQSxNQUN4QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUNUO0FBRUEsSUFBSSxRQUFRLFNBQVMsR0FBRyxHQUFHO0FBQ3pCLE1BQUksTUFBTSxDQUFBO0FBRVYsV0FBUyxLQUFLLEVBQUcsS0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdCLFdBQVMsS0FBSyxFQUFHLEtBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUU3QixTQUFPO0FBQ1Q7QUFFQSxJ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
