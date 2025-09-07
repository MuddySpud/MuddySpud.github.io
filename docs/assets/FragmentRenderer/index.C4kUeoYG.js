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
  doNotPaint = false;
  sectionIndex = 0;
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
  if (fragment.link?.root) {
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
  if (!option || !option.section?.outline?.path) {
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
    if (!fragment) {
      return;
    }
    gFragmentCode.clearOrphanedSteps(fragment.link?.root);
    gFragmentCode.clearOrphanedSteps(fragment.selected);
    fragment.selected = null;
    fragment.link = null;
  },
  getFragmentAndLinkOutline_subscripion: (state, option, optionText = null) => {
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
    fragment.parentFragmentID = outlineNode?.parent?.i ?? "";
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
  if (!fragment) {
    return;
  }
  fragment.ui.doNotPaint = hide;
  hideFromPaint(
    fragment.selected,
    hide
  );
  hideFromPaint(
    fragment.link?.root,
    hide
  );
};
const hideOptionsFromPaint = (fragment, hide) => {
  if (!fragment) {
    return;
  }
  for (const option of fragment?.options) {
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
  if (!displayChart?.parent) {
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
  if (linkELementID === "nt_lk_frag_t968OJ1wo") {
    console.log(`R-DRAWING ${linkELementID}_l`);
  }
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
    if (!fragment || fragment.ui.doNotPaint === true) {
      return;
    }
    buildLinkDiscussionView(
      fragment,
      views
    );
    linkViews.buildView(
      fragment.link?.root,
      views
    );
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
    if (!fragment || fragment.ui.doNotPaint === true) {
      return;
    }
    buildDiscussionView(
      fragment,
      views
    );
    linkViews.buildView(
      fragment.link?.root,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguQzRrVWVvWUcuanMiLCJzb3VyY2VzIjpbIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uL3Jvb3Qvc3JjL2h5cGVyQXBwL3RpbWUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dIdHRwLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL2NvbnN0YW50cy9LZXlzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9lZmZlY3RzL0h0dHBFZmZlY3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nVXRpbGl0aWVzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnlVcmwudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2hpc3RvcnkvUmVuZGVyU25hcFNob3QudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dIaXN0b3J5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2h0dHAvZ0F1dGhlbnRpY2F0aW9uQ29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvaHR0cC9nQWpheEhlYWRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkVmZmVjdHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9odHRwL2dBdXRoZW50aWNhdGlvbkh0dHAudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdWJzY3JpcHRpb25zL3JlcGVhdFN1YnNjcmlwdGlvbi50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy9jb2RlL29uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL29uUmVuZGVyRmluaXNoZWQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9hY3Rpb25zL2luaXRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyRnJhZ21lbnRVSS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckZyYWdtZW50LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZU5vZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9kaXNwbGF5L0Rpc3BsYXlHdWlkZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvcmVuZGVyL1JlbmRlckd1aWRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL2VudW1zL1Njcm9sbEhvcFR5cGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9TY3JlZW4udHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3dpbmRvdy9UcmVlU29sdmUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9nRmlsZUNvbnN0YW50cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1JlbmRlckNvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUNoYXJ0LnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9zZWdtZW50cy9DaGFpblNlZ21lbnQudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3NlZ21lbnRzL1NlZ21lbnROb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nU2VnbWVudENvZGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9hY3Rpb25zL2dPdXRsaW5lQWN0aW9ucy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ091dGxpbmVDb2RlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nRnJhZ21lbnRFZmZlY3RzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvY29kZS9nSG9va1JlZ2lzdHJ5Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvYWN0aW9ucy9mcmFnbWVudEFjdGlvbnMudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VpL3BheWxvYWRzL0ZyYWdtZW50UGF5bG9hZC50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9mcmFnbWVudHMvdmlld3Mvb3B0aW9uc1ZpZXdzLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2ZyYWdtZW50cy92aWV3cy9saW5rVmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2ZyYWdtZW50Vmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvZnJhZ21lbnRzL3ZpZXdzL2d1aWRlVmlld3MudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlldy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdXNlci9TZXR0aW5ncy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9lbnVtcy9uYXZpZ2F0aW9uRGlyZWN0aW9uLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9oaXN0b3J5L0hpc3RvcnkudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL3VzZXIvVXNlci50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvZWZmZWN0cy9SZXBlYXRlRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvdWkvUmVuZGVyU3RhdGVVSS50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvc3RhdGUvUmVuZGVyU3RhdGUudHMiLCIuLi9yb290L3NyYy9tb2R1bGVzL3N0YXRlL1N0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9nbG9iYWwvZWZmZWN0cy9nUmVuZGVyRWZmZWN0cy50cyIsIi4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlLnRzIiwiLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9yZW5kZXJDb21tZW50cy50cyIsIi4uL3Jvb3Qvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBSRUNZQ0xFRF9OT0RFID0gMVxyXG52YXIgTEFaWV9OT0RFID0gMlxyXG52YXIgVEVYVF9OT0RFID0gM1xyXG52YXIgRU1QVFlfT0JKID0ge31cclxudmFyIEVNUFRZX0FSUiA9IFtdXHJcbnZhciBtYXAgPSBFTVBUWV9BUlIubWFwXHJcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxyXG52YXIgZGVmZXIgPVxyXG4gIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09IFwidW5kZWZpbmVkXCJcclxuICAgID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lXHJcbiAgICA6IHNldFRpbWVvdXRcclxuXHJcbnZhciBjcmVhdGVDbGFzcyA9IGZ1bmN0aW9uKG9iaikge1xyXG4gIHZhciBvdXQgPSBcIlwiXHJcblxyXG4gIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSByZXR1cm4gb2JqXHJcblxyXG4gIGlmIChpc0FycmF5KG9iaikgJiYgb2JqLmxlbmd0aCA+IDApIHtcclxuICAgIGZvciAodmFyIGsgPSAwLCB0bXA7IGsgPCBvYmoubGVuZ3RoOyBrKyspIHtcclxuICAgICAgaWYgKCh0bXAgPSBjcmVhdGVDbGFzcyhvYmpba10pKSAhPT0gXCJcIikge1xyXG4gICAgICAgIG91dCArPSAob3V0ICYmIFwiIFwiKSArIHRtcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XHJcbiAgICAgIGlmIChvYmpba10pIHtcclxuICAgICAgICBvdXQgKz0gKG91dCAmJiBcIiBcIikgKyBrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxudmFyIG1lcmdlID0gZnVuY3Rpb24oYSwgYikge1xyXG4gIHZhciBvdXQgPSB7fVxyXG5cclxuICBmb3IgKHZhciBrIGluIGEpIG91dFtrXSA9IGFba11cclxuICBmb3IgKHZhciBrIGluIGIpIG91dFtrXSA9IGJba11cclxuXHJcbiAgcmV0dXJuIG91dFxyXG59XHJcblxyXG52YXIgYmF0Y2ggPSBmdW5jdGlvbihsaXN0KSB7XHJcbiAgcmV0dXJuIGxpc3QucmVkdWNlKGZ1bmN0aW9uKG91dCwgaXRlbSkge1xyXG4gICAgcmV0dXJuIG91dC5jb25jYXQoXHJcbiAgICAgICFpdGVtIHx8IGl0ZW0gPT09IHRydWVcclxuICAgICAgICA/IDBcclxuICAgICAgICA6IHR5cGVvZiBpdGVtWzBdID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgICA/IFtpdGVtXVxyXG4gICAgICAgIDogYmF0Y2goaXRlbSlcclxuICAgIClcclxuICB9LCBFTVBUWV9BUlIpXHJcbn1cclxuXHJcbnZhciBpc1NhbWVBY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgcmV0dXJuIGlzQXJyYXkoYSkgJiYgaXNBcnJheShiKSAmJiBhWzBdID09PSBiWzBdICYmIHR5cGVvZiBhWzBdID09PSBcImZ1bmN0aW9uXCJcclxufVxyXG5cclxudmFyIHNob3VsZFJlc3RhcnQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgaWYgKGEgIT09IGIpIHtcclxuICAgIGZvciAodmFyIGsgaW4gbWVyZ2UoYSwgYikpIHtcclxuICAgICAgaWYgKGFba10gIT09IGJba10gJiYgIWlzU2FtZUFjdGlvbihhW2tdLCBiW2tdKSkgcmV0dXJuIHRydWVcclxuICAgICAgYltrXSA9IGFba11cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnZhciBwYXRjaFN1YnMgPSBmdW5jdGlvbihvbGRTdWJzLCBuZXdTdWJzLCBkaXNwYXRjaCkge1xyXG4gIGZvciAoXHJcbiAgICB2YXIgaSA9IDAsIG9sZFN1YiwgbmV3U3ViLCBzdWJzID0gW107XHJcbiAgICBpIDwgb2xkU3Vicy5sZW5ndGggfHwgaSA8IG5ld1N1YnMubGVuZ3RoO1xyXG4gICAgaSsrXHJcbiAgKSB7XHJcbiAgICBvbGRTdWIgPSBvbGRTdWJzW2ldXHJcbiAgICBuZXdTdWIgPSBuZXdTdWJzW2ldXHJcbiAgICBzdWJzLnB1c2goXHJcbiAgICAgIG5ld1N1YlxyXG4gICAgICAgID8gIW9sZFN1YiB8fFxyXG4gICAgICAgICAgbmV3U3ViWzBdICE9PSBvbGRTdWJbMF0gfHxcclxuICAgICAgICAgIHNob3VsZFJlc3RhcnQobmV3U3ViWzFdLCBvbGRTdWJbMV0pXHJcbiAgICAgICAgICA/IFtcclxuICAgICAgICAgICAgICBuZXdTdWJbMF0sXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzFdLFxyXG4gICAgICAgICAgICAgIG5ld1N1YlswXShkaXNwYXRjaCwgbmV3U3ViWzFdKSxcclxuICAgICAgICAgICAgICBvbGRTdWIgJiYgb2xkU3ViWzJdKClcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgOiBvbGRTdWJcclxuICAgICAgICA6IG9sZFN1YiAmJiBvbGRTdWJbMl0oKVxyXG4gICAgKVxyXG4gIH1cclxuICByZXR1cm4gc3Vic1xyXG59XHJcblxyXG52YXIgcGF0Y2hQcm9wZXJ0eSA9IGZ1bmN0aW9uKG5vZGUsIGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICBpZiAoa2V5ID09PSBcImtleVwiKSB7XHJcbiAgfSBlbHNlIGlmIChrZXkgPT09IFwic3R5bGVcIikge1xyXG4gICAgZm9yICh2YXIgayBpbiBtZXJnZShvbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XHJcbiAgICAgIG9sZFZhbHVlID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZVtrXSA9PSBudWxsID8gXCJcIiA6IG5ld1ZhbHVlW2tdXHJcbiAgICAgIGlmIChrWzBdID09PSBcIi1cIikge1xyXG4gICAgICAgIG5vZGVba2V5XS5zZXRQcm9wZXJ0eShrLCBvbGRWYWx1ZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2RlW2tleV1ba10gPSBvbGRWYWx1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChrZXlbMF0gPT09IFwib1wiICYmIGtleVsxXSA9PT0gXCJuXCIpIHtcclxuICAgIGlmIChcclxuICAgICAgISgobm9kZS5hY3Rpb25zIHx8IChub2RlLmFjdGlvbnMgPSB7fSkpW1xyXG4gICAgICAgIChrZXkgPSBrZXkuc2xpY2UoMikudG9Mb3dlckNhc2UoKSlcclxuICAgICAgXSA9IG5ld1ZhbHVlKVxyXG4gICAgKSB7XHJcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKVxyXG4gICAgfSBlbHNlIGlmICghb2xkVmFsdWUpIHtcclxuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGtleSwgbGlzdGVuZXIpXHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICghaXNTdmcgJiYga2V5ICE9PSBcImxpc3RcIiAmJiBrZXkgaW4gbm9kZSkge1xyXG4gICAgbm9kZVtrZXldID0gbmV3VmFsdWUgPT0gbnVsbCB8fCBuZXdWYWx1ZSA9PSBcInVuZGVmaW5lZFwiID8gXCJcIiA6IG5ld1ZhbHVlXHJcbiAgfSBlbHNlIGlmIChcclxuICAgIG5ld1ZhbHVlID09IG51bGwgfHxcclxuICAgIG5ld1ZhbHVlID09PSBmYWxzZSB8fFxyXG4gICAgKGtleSA9PT0gXCJjbGFzc1wiICYmICEobmV3VmFsdWUgPSBjcmVhdGVDbGFzcyhuZXdWYWx1ZSkpKVxyXG4gICkge1xyXG4gICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxyXG4gIH0gZWxzZSB7XHJcbiAgICBub2RlLnNldEF0dHJpYnV0ZShrZXksIG5ld1ZhbHVlKVxyXG4gIH1cclxufVxyXG5cclxudmFyIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbih2ZG9tLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICB2YXIgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcclxuICB2YXIgcHJvcHMgPSB2ZG9tLnByb3BzXHJcbiAgdmFyIG5vZGUgPVxyXG4gICAgdmRvbS50eXBlID09PSBURVhUX05PREVcclxuICAgICAgPyBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2ZG9tLm5hbWUpXHJcbiAgICAgIDogKGlzU3ZnID0gaXNTdmcgfHwgdmRvbS5uYW1lID09PSBcInN2Z1wiKVxyXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG4gICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxyXG5cclxuICBmb3IgKHZhciBrIGluIHByb3BzKSB7XHJcbiAgICBwYXRjaFByb3BlcnR5KG5vZGUsIGssIG51bGwsIHByb3BzW2tdLCBsaXN0ZW5lciwgaXNTdmcpXHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmRvbS5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgbm9kZS5hcHBlbmRDaGlsZChcclxuICAgICAgY3JlYXRlTm9kZShcclxuICAgICAgICAodmRvbS5jaGlsZHJlbltpXSA9IGdldFZOb2RlKHZkb20uY2hpbGRyZW5baV0pKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICByZXR1cm4gKHZkb20ubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBnZXRLZXkgPSBmdW5jdGlvbih2ZG9tKSB7XHJcbiAgcmV0dXJuIHZkb20gPT0gbnVsbCA/IG51bGwgOiB2ZG9tLmtleVxyXG59XHJcblxyXG52YXIgcGF0Y2ggPSBmdW5jdGlvbihwYXJlbnQsIG5vZGUsIG9sZFZOb2RlLCBuZXdWTm9kZSwgbGlzdGVuZXIsIGlzU3ZnKSB7XHJcbiAgaWYgKG9sZFZOb2RlID09PSBuZXdWTm9kZSkge1xyXG4gIH0gZWxzZSBpZiAoXHJcbiAgICBvbGRWTm9kZSAhPSBudWxsICYmXHJcbiAgICBvbGRWTm9kZS50eXBlID09PSBURVhUX05PREUgJiZcclxuICAgIG5ld1ZOb2RlLnR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICkge1xyXG4gICAgaWYgKG9sZFZOb2RlLm5hbWUgIT09IG5ld1ZOb2RlLm5hbWUpIG5vZGUubm9kZVZhbHVlID0gbmV3Vk5vZGUubmFtZVxyXG4gIH0gZWxzZSBpZiAob2xkVk5vZGUgPT0gbnVsbCB8fCBvbGRWTm9kZS5uYW1lICE9PSBuZXdWTm9kZS5uYW1lKSB7XHJcbiAgICBub2RlID0gcGFyZW50Lmluc2VydEJlZm9yZShcclxuICAgICAgY3JlYXRlTm9kZSgobmV3Vk5vZGUgPSBnZXRWTm9kZShuZXdWTm9kZSkpLCBsaXN0ZW5lciwgaXNTdmcpLFxyXG4gICAgICBub2RlXHJcbiAgICApXHJcbiAgICBpZiAob2xkVk5vZGUgIT0gbnVsbCkge1xyXG4gICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQob2xkVk5vZGUubm9kZSlcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIHRtcFZLaWRcclxuICAgIHZhciBvbGRWS2lkXHJcblxyXG4gICAgdmFyIG9sZEtleVxyXG4gICAgdmFyIG5ld0tleVxyXG5cclxuICAgIHZhciBvbGRWUHJvcHMgPSBvbGRWTm9kZS5wcm9wc1xyXG4gICAgdmFyIG5ld1ZQcm9wcyA9IG5ld1ZOb2RlLnByb3BzXHJcblxyXG4gICAgdmFyIG9sZFZLaWRzID0gb2xkVk5vZGUuY2hpbGRyZW5cclxuICAgIHZhciBuZXdWS2lkcyA9IG5ld1ZOb2RlLmNoaWxkcmVuXHJcblxyXG4gICAgdmFyIG9sZEhlYWQgPSAwXHJcbiAgICB2YXIgbmV3SGVhZCA9IDBcclxuICAgIHZhciBvbGRUYWlsID0gb2xkVktpZHMubGVuZ3RoIC0gMVxyXG4gICAgdmFyIG5ld1RhaWwgPSBuZXdWS2lkcy5sZW5ndGggLSAxXHJcblxyXG4gICAgaXNTdmcgPSBpc1N2ZyB8fCBuZXdWTm9kZS5uYW1lID09PSBcInN2Z1wiXHJcblxyXG4gICAgZm9yICh2YXIgaSBpbiBtZXJnZShvbGRWUHJvcHMsIG5ld1ZQcm9wcykpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChpID09PSBcInZhbHVlXCIgfHwgaSA9PT0gXCJzZWxlY3RlZFwiIHx8IGkgPT09IFwiY2hlY2tlZFwiXHJcbiAgICAgICAgICA/IG5vZGVbaV1cclxuICAgICAgICAgIDogb2xkVlByb3BzW2ldKSAhPT0gbmV3VlByb3BzW2ldXHJcbiAgICAgICkge1xyXG4gICAgICAgIHBhdGNoUHJvcGVydHkobm9kZSwgaSwgb2xkVlByb3BzW2ldLCBuZXdWUHJvcHNbaV0sIGxpc3RlbmVyLCBpc1N2ZylcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwgJiYgb2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAob2xkS2V5ID0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWRdKSkgPT0gbnVsbCB8fFxyXG4gICAgICAgIG9sZEtleSAhPT0gZ2V0S2V5KG5ld1ZLaWRzW25ld0hlYWRdKVxyXG4gICAgICApIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaChcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZEhlYWRdLm5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0sXHJcbiAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUoXHJcbiAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkKytdLFxyXG4gICAgICAgICAgb2xkVktpZHNbb2xkSGVhZCsrXVxyXG4gICAgICAgICkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsICYmIG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKG9sZEtleSA9IGdldEtleShvbGRWS2lkc1tvbGRUYWlsXSkpID09IG51bGwgfHxcclxuICAgICAgICBvbGRLZXkgIT09IGdldEtleShuZXdWS2lkc1tuZXdUYWlsXSlcclxuICAgICAgKSB7XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGF0Y2goXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRUYWlsXS5ub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLFxyXG4gICAgICAgIChuZXdWS2lkc1tuZXdUYWlsXSA9IGdldFZOb2RlKFxyXG4gICAgICAgICAgbmV3VktpZHNbbmV3VGFpbC0tXSxcclxuICAgICAgICAgIG9sZFZLaWRzW29sZFRhaWwtLV1cclxuICAgICAgICApKSxcclxuICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICBpc1N2Z1xyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9sZEhlYWQgPiBvbGRUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwpIHtcclxuICAgICAgICBub2RlLmluc2VydEJlZm9yZShcclxuICAgICAgICAgIGNyZWF0ZU5vZGUoXHJcbiAgICAgICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKG5ld1ZLaWRzW25ld0hlYWQrK10pKSxcclxuICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkXSkgJiYgb2xkVktpZC5ub2RlXHJcbiAgICAgICAgKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG5ld0hlYWQgPiBuZXdUYWlsKSB7XHJcbiAgICAgIHdoaWxlIChvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWRzW29sZEhlYWQrK10ubm9kZSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yICh2YXIgaSA9IG9sZEhlYWQsIGtleWVkID0ge30sIG5ld0tleWVkID0ge307IGkgPD0gb2xkVGFpbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKChvbGRLZXkgPSBvbGRWS2lkc1tpXS5rZXkpICE9IG51bGwpIHtcclxuICAgICAgICAgIGtleWVkW29sZEtleV0gPSBvbGRWS2lkc1tpXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCkge1xyXG4gICAgICAgIG9sZEtleSA9IGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWRdKSlcclxuICAgICAgICBuZXdLZXkgPSBnZXRLZXkoXHJcbiAgICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShuZXdWS2lkc1tuZXdIZWFkXSwgb2xkVktpZCkpXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICBuZXdLZXllZFtvbGRLZXldIHx8XHJcbiAgICAgICAgICAobmV3S2V5ICE9IG51bGwgJiYgbmV3S2V5ID09PSBnZXRLZXkob2xkVktpZHNbb2xkSGVhZCArIDFdKSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWQubm9kZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChuZXdLZXkgPT0gbnVsbCB8fCBvbGRWTm9kZS50eXBlID09PSBSRUNZQ0xFRF9OT0RFKSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLFxyXG4gICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgIGlzU3ZnXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgbmV3SGVhZCsrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XHJcbiAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQsXHJcbiAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBuZXdLZXllZFtuZXdLZXldID0gdHJ1ZVxyXG4gICAgICAgICAgICBvbGRIZWFkKytcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICgodG1wVktpZCA9IGtleWVkW25ld0tleV0pICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZSh0bXBWS2lkLm5vZGUsIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlKSxcclxuICAgICAgICAgICAgICAgIHRtcFZLaWQsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgbmV3S2V5ZWRbbmV3S2V5XSA9IHRydWVcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICAgICBvbGRWS2lkICYmIG9sZFZLaWQubm9kZSxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5ld0hlYWQrK1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2hpbGUgKG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICAgIGlmIChnZXRLZXkoKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkKytdKSkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBpIGluIGtleWVkKSB7XHJcbiAgICAgICAgaWYgKG5ld0tleWVkW2ldID09IG51bGwpIHtcclxuICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQoa2V5ZWRbaV0ubm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiAobmV3Vk5vZGUubm9kZSA9IG5vZGUpXHJcbn1cclxuXHJcbnZhciBwcm9wc0NoYW5nZWQgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgZm9yICh2YXIgayBpbiBhKSBpZiAoYVtrXSAhPT0gYltrXSkgcmV0dXJuIHRydWVcclxuICBmb3IgKHZhciBrIGluIGIpIGlmIChhW2tdICE9PSBiW2tdKSByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG52YXIgZ2V0VGV4dFZOb2RlID0gZnVuY3Rpb24obm9kZSkge1xyXG4gIHJldHVybiB0eXBlb2Ygbm9kZSA9PT0gXCJvYmplY3RcIiA/IG5vZGUgOiBjcmVhdGVUZXh0Vk5vZGUobm9kZSlcclxufVxyXG5cclxudmFyIGdldFZOb2RlID0gZnVuY3Rpb24obmV3Vk5vZGUsIG9sZFZOb2RlKSB7XHJcbiAgcmV0dXJuIG5ld1ZOb2RlLnR5cGUgPT09IExBWllfTk9ERVxyXG4gICAgPyAoKCFvbGRWTm9kZSB8fCAhb2xkVk5vZGUubGF6eSB8fCBwcm9wc0NoYW5nZWQob2xkVk5vZGUubGF6eSwgbmV3Vk5vZGUubGF6eSkpXHJcbiAgICAgICAgJiYgKChvbGRWTm9kZSA9IGdldFRleHRWTm9kZShuZXdWTm9kZS5sYXp5LnZpZXcobmV3Vk5vZGUubGF6eSkpKS5sYXp5ID1cclxuICAgICAgICAgIG5ld1ZOb2RlLmxhenkpLFxyXG4gICAgICBvbGRWTm9kZSlcclxuICAgIDogbmV3Vk5vZGVcclxufVxyXG5cclxudmFyIGNyZWF0ZVZOb2RlID0gZnVuY3Rpb24obmFtZSwgcHJvcHMsIGNoaWxkcmVuLCBub2RlLCBrZXksIHR5cGUpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogbmFtZSxcclxuICAgIHByb3BzOiBwcm9wcyxcclxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgIG5vZGU6IG5vZGUsXHJcbiAgICB0eXBlOiB0eXBlLFxyXG4gICAga2V5OiBrZXlcclxuICB9XHJcbn1cclxuXHJcbnZhciBjcmVhdGVUZXh0Vk5vZGUgPSBmdW5jdGlvbih2YWx1ZSwgbm9kZSkge1xyXG4gIHJldHVybiBjcmVhdGVWTm9kZSh2YWx1ZSwgRU1QVFlfT0JKLCBFTVBUWV9BUlIsIG5vZGUsIHVuZGVmaW5lZCwgVEVYVF9OT0RFKVxyXG59XHJcblxyXG52YXIgcmVjeWNsZU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICAgPyBjcmVhdGVUZXh0Vk5vZGUobm9kZS5ub2RlVmFsdWUsIG5vZGUpXHJcbiAgICA6IGNyZWF0ZVZOb2RlKFxyXG4gICAgICAgIG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBFTVBUWV9PQkosXHJcbiAgICAgICAgbWFwLmNhbGwobm9kZS5jaGlsZE5vZGVzLCByZWN5Y2xlTm9kZSksXHJcbiAgICAgICAgbm9kZSxcclxuICAgICAgICB1bmRlZmluZWQsXHJcbiAgICAgICAgUkVDWUNMRURfTk9ERVxyXG4gICAgICApXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgTGF6eSA9IGZ1bmN0aW9uKHByb3BzKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGxhenk6IHByb3BzLFxyXG4gICAgdHlwZTogTEFaWV9OT0RFXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIGggPSBmdW5jdGlvbihuYW1lLCBwcm9wcykge1xyXG4gIGZvciAodmFyIHZkb20sIHJlc3QgPSBbXSwgY2hpbGRyZW4gPSBbXSwgaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkge1xyXG4gICAgcmVzdC5wdXNoKGFyZ3VtZW50c1tpXSlcclxuICB9XHJcblxyXG4gIHdoaWxlIChyZXN0Lmxlbmd0aCA+IDApIHtcclxuICAgIGlmIChpc0FycmF5KCh2ZG9tID0gcmVzdC5wb3AoKSkpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSB2ZG9tLmxlbmd0aDsgaS0tID4gMDsgKSB7XHJcbiAgICAgICAgcmVzdC5wdXNoKHZkb21baV0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodmRvbSA9PT0gZmFsc2UgfHwgdmRvbSA9PT0gdHJ1ZSB8fCB2ZG9tID09IG51bGwpIHtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goZ2V0VGV4dFZOb2RlKHZkb20pKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvcHMgPSBwcm9wcyB8fCBFTVBUWV9PQkpcclxuXHJcbiAgcmV0dXJuIHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCJcclxuICAgID8gbmFtZShwcm9wcywgY2hpbGRyZW4pXHJcbiAgICA6IGNyZWF0ZVZOb2RlKG5hbWUsIHByb3BzLCBjaGlsZHJlbiwgdW5kZWZpbmVkLCBwcm9wcy5rZXkpXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgYXBwID0gZnVuY3Rpb24ocHJvcHMpIHtcclxuICB2YXIgc3RhdGUgPSB7fVxyXG4gIHZhciBsb2NrID0gZmFsc2VcclxuICB2YXIgdmlldyA9IHByb3BzLnZpZXdcclxuICB2YXIgbm9kZSA9IHByb3BzLm5vZGVcclxuICB2YXIgdmRvbSA9IG5vZGUgJiYgcmVjeWNsZU5vZGUobm9kZSlcclxuICB2YXIgc3Vic2NyaXB0aW9ucyA9IHByb3BzLnN1YnNjcmlwdGlvbnNcclxuICB2YXIgc3VicyA9IFtdXHJcbiAgdmFyIG9uRW5kID0gcHJvcHMub25FbmRcclxuXHJcbiAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGRpc3BhdGNoKHRoaXMuYWN0aW9uc1tldmVudC50eXBlXSwgZXZlbnQpXHJcbiAgfVxyXG5cclxuICB2YXIgc2V0U3RhdGUgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xyXG4gICAgaWYgKHN0YXRlICE9PSBuZXdTdGF0ZSkge1xyXG4gICAgICBzdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XHJcbiAgICAgICAgc3VicyA9IHBhdGNoU3VicyhzdWJzLCBiYXRjaChbc3Vic2NyaXB0aW9ucyhzdGF0ZSldKSwgZGlzcGF0Y2gpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHZpZXcgJiYgIWxvY2spIGRlZmVyKHJlbmRlciwgKGxvY2sgPSB0cnVlKSlcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZVxyXG4gIH1cclxuXHJcbiAgdmFyIGRpc3BhdGNoID0gKHByb3BzLm1pZGRsZXdhcmUgfHxcclxuICAgIGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICByZXR1cm4gb2JqXHJcbiAgICB9KShmdW5jdGlvbihhY3Rpb24sIHByb3BzKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgID8gZGlzcGF0Y2goYWN0aW9uKHN0YXRlLCBwcm9wcykpXHJcbiAgICAgIDogaXNBcnJheShhY3Rpb24pXHJcbiAgICAgID8gdHlwZW9mIGFjdGlvblswXSA9PT0gXCJmdW5jdGlvblwiIHx8IGlzQXJyYXkoYWN0aW9uWzBdKVxyXG4gICAgICAgID8gZGlzcGF0Y2goXHJcbiAgICAgICAgICAgIGFjdGlvblswXSxcclxuICAgICAgICAgICAgdHlwZW9mIGFjdGlvblsxXSA9PT0gXCJmdW5jdGlvblwiID8gYWN0aW9uWzFdKHByb3BzKSA6IGFjdGlvblsxXVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIDogKGJhdGNoKGFjdGlvbi5zbGljZSgxKSkubWFwKGZ1bmN0aW9uKGZ4KSB7XHJcbiAgICAgICAgICAgIGZ4ICYmIGZ4WzBdKGRpc3BhdGNoLCBmeFsxXSlcclxuICAgICAgICAgIH0sIHNldFN0YXRlKGFjdGlvblswXSkpLFxyXG4gICAgICAgICAgc3RhdGUpXHJcbiAgICAgIDogc2V0U3RhdGUoYWN0aW9uKVxyXG4gIH0pXHJcblxyXG4gIHZhciByZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGxvY2sgPSBmYWxzZVxyXG4gICAgbm9kZSA9IHBhdGNoKFxyXG4gICAgICBub2RlLnBhcmVudE5vZGUsXHJcbiAgICAgIG5vZGUsXHJcbiAgICAgIHZkb20sXHJcbiAgICAgICh2ZG9tID0gZ2V0VGV4dFZOb2RlKHZpZXcoc3RhdGUpKSksXHJcbiAgICAgIGxpc3RlbmVyXHJcbiAgICApXHJcbiAgICBvbkVuZCgpXHJcbiAgfVxyXG5cclxuICBkaXNwYXRjaChwcm9wcy5pbml0KVxyXG59XHJcbiIsInZhciB0aW1lRnggPSBmdW5jdGlvbiAoZng6IGFueSkge1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoXHJcbiAgICAgICAgYWN0aW9uOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBmeCxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBkZWxheTogcHJvcHMuZGVsYXlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF07XHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IHZhciB0aW1lb3V0ID0gdGltZUZ4KFxyXG5cclxuICAgIGZ1bmN0aW9uIChcclxuICAgICAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgICAgIHByb3BzOiBhbnkpIHtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRpc3BhdGNoKHByb3BzLmFjdGlvbik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzLmRlbGF5XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuKTtcclxuXHJcbmV4cG9ydCB2YXIgaW50ZXJ2YWwgPSB0aW1lRngoXHJcblxyXG4gICAgZnVuY3Rpb24gKFxyXG4gICAgICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICAgICAgcHJvcHM6IGFueSkge1xyXG5cclxuICAgICAgICB2YXIgaWQgPSBzZXRJbnRlcnZhbChcclxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgRGF0ZS5ub3coKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcHMuZGVsYXlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuKTtcclxuXHJcblxyXG4vLyBleHBvcnQgdmFyIG5vd1xyXG4vLyBleHBvcnQgdmFyIHJldHJ5XHJcbi8vIGV4cG9ydCB2YXIgZGVib3VuY2VcclxuLy8gZXhwb3J0IHZhciB0aHJvdHRsZVxyXG4vLyBleHBvcnQgdmFyIGlkbGVDYWxsYmFjaz9cclxuIiwiXHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwQXV0aGVudGljYXRlZFByb3BzXCI7XHJcbmltcG9ydCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBBdXRoZW50aWNhdGVkUHJvcHNCbG9ja1wiO1xyXG5pbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IElIdHRwT3V0cHV0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBPdXRwdXRcIjtcclxuaW1wb3J0IHsgSUh0dHBTZXF1ZW50aWFsRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cFNlcXVlbnRpYWxGZXRjaEl0ZW1cIjtcclxuXHJcbmNvbnN0IHNlcXVlbnRpYWxIdHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHNlcXVlbnRpYWxCbG9ja3M6IEFycmF5PElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2s+KTogdm9pZCA9PiB7XHJcblxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrIHdpbGwgcnVuIHNlcXVlbnRpYWxseVxyXG4gICAgLy8gRWFjaCBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyBpbiBlYWNoIGJsb2NrIHdpbGwgcnVubiBpbiBwYXJhbGxlbFxyXG4gICAgbGV0IGJsb2NrOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrO1xyXG4gICAgbGV0IHN1Y2Nlc3M6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgbGV0IGh0dHBDYWxsOiBhbnk7XHJcbiAgICBsZXQgbGFzdEh0dHBDYWxsOiBhbnk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IHNlcXVlbnRpYWxCbG9ja3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgICAgYmxvY2sgPSBzZXF1ZW50aWFsQmxvY2tzW2ldO1xyXG5cclxuICAgICAgICBpZiAoYmxvY2sgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGJsb2NrKSkge1xyXG5cclxuICAgICAgICAgICAgaHR0cENhbGwgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZTogcHJvY2Vzc0Jsb2NrLFxyXG4gICAgICAgICAgICAgICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxyXG4gICAgICAgICAgICAgICAgYmxvY2s6IGJsb2NrLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IGAke2l9YFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBodHRwQ2FsbCA9IHtcclxuICAgICAgICAgICAgICAgIGRlbGVnYXRlOiBwcm9jZXNzUHJvcHMsXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXHJcbiAgICAgICAgICAgICAgICBibG9jazogYmxvY2ssXHJcbiAgICAgICAgICAgICAgICBpbmRleDogYCR7aX1gXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc3VjY2Vzcykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobGFzdEh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgICAgICBodHRwQ2FsbC5uZXh0SHR0cENhbGwgPSBsYXN0SHR0cENhbGw7XHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRJbmRleCA9IGxhc3RIdHRwQ2FsbC5pbmRleDtcclxuICAgICAgICAgICAgaHR0cENhbGwubmV4dEJsb2NrID0gbGFzdEh0dHBDYWxsLmJsb2NrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGFzdEh0dHBDYWxsID0gaHR0cENhbGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGh0dHBDYWxsKSB7XHJcblxyXG4gICAgICAgIGh0dHBDYWxsLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICBodHRwQ2FsbC5kaXNwYXRjaCxcclxuICAgICAgICAgICAgaHR0cENhbGwuYmxvY2ssXHJcbiAgICAgICAgICAgIGh0dHBDYWxsLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgaHR0cENhbGwuaW5kZXhcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBwcm9jZXNzQmxvY2sgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgYmxvY2s6IElIdHRwQXV0aGVudGljYXRlZFByb3BzQmxvY2ssXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBwYXJhbGxlbFByb3BzOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz4gPSBibG9jayBhcyBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcz47XHJcbiAgICBjb25zdCBkZWxlZ2F0ZXM6IGFueVtdID0gW107XHJcbiAgICBsZXQgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzO1xyXG5cclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFyYWxsZWxQcm9wcy5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICBwcm9wcyA9IHBhcmFsbGVsUHJvcHNbal07XHJcblxyXG4gICAgICAgIGRlbGVnYXRlcy5wdXNoKFxyXG4gICAgICAgICAgICBwcm9jZXNzUHJvcHMoXHJcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgIHByb3BzLFxyXG4gICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgUHJvbWlzZVxyXG4gICAgICAgICAgICAuYWxsKGRlbGVnYXRlcylcclxuICAgICAgICAgICAgLnRoZW4oKVxyXG4gICAgICAgICAgICAuY2F0Y2goKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NQcm9wcyA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMsXHJcbiAgICBuZXh0RGVsZWdhdGU6IGFueSk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghcHJvcHMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0OiBJSHR0cE91dHB1dCA9IHtcclxuICAgICAgICBvazogZmFsc2UsXHJcbiAgICAgICAgdXJsOiBwcm9wcy51cmwsXHJcbiAgICAgICAgYXV0aGVudGljYXRpb25GYWlsOiBmYWxzZSxcclxuICAgICAgICBwYXJzZVR5cGU6IFwidGV4dFwiLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dCxcclxuICAgICAgICBuZXh0RGVsZWdhdGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBodHRwRWZmZWN0ID0gKFxyXG4gICAgZGlzcGF0Y2g6IGFueSxcclxuICAgIHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1xyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXByb3BzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dHB1dDogSUh0dHBPdXRwdXQgPSB7XHJcbiAgICAgICAgb2s6IGZhbHNlLFxyXG4gICAgICAgIHVybDogcHJvcHMudXJsLFxyXG4gICAgICAgIGF1dGhlbnRpY2F0aW9uRmFpbDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBwcm9wcy5wYXJzZVR5cGUgPz8gJ2pzb24nLFxyXG4gICAgfTtcclxuXHJcbiAgICBodHRwKFxyXG4gICAgICAgIGRpc3BhdGNoLFxyXG4gICAgICAgIHByb3BzLFxyXG4gICAgICAgIG91dHB1dFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGh0dHAgPSAoXHJcbiAgICBkaXNwYXRjaDogYW55LFxyXG4gICAgcHJvcHM6IElIdHRwQXV0aGVudGljYXRlZFByb3BzLFxyXG4gICAgb3V0cHV0OiBJSHR0cE91dHB1dCxcclxuICAgIG5leHREZWxlZ2F0ZTogYW55ID0gbnVsbCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGZldGNoKFxyXG4gICAgICAgIHByb3BzLnVybCxcclxuICAgICAgICBwcm9wcy5vcHRpb25zKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3V0cHV0Lm9rID0gcmVzcG9uc2Uub2sgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnR5cGUgPSByZXNwb25zZS50eXBlO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnJlZGlyZWN0ZWQgPSByZXNwb25zZS5yZWRpcmVjdGVkO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5jYWxsSUQgPSByZXNwb25zZS5oZWFkZXJzLmdldChcIkNhbGxJRFwiKSBhcyBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJjb250ZW50LXR5cGVcIikgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3V0cHV0LmNvbnRlbnRUeXBlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIG91dHB1dC5jb250ZW50VHlwZS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSAhPT0gLTEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wYXJzZVR5cGUgPSBcImpzb25cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5hdXRoZW50aWNhdGlvbkZhaWwgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMub25BdXRoZW50aWNhdGlvbkZhaWxBY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5yZXNwb25zZU51bGwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQuZXJyb3IgKz0gYEVycm9yIHRocm93biB3aXRoIHJlc3BvbnNlLnRleHQoKVxyXG5gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcblxyXG4gICAgICAgICAgICBvdXRwdXQudGV4dERhdGEgPSByZXN1bHQ7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVzdWx0XHJcbiAgICAgICAgICAgICAgICAmJiBvdXRwdXQucGFyc2VUeXBlID09PSAnanNvbidcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuanNvbkRhdGEgPSBKU09OLnBhcnNlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmVycm9yICs9IGBFcnJvciB0aHJvd24gcGFyc2luZyByZXNwb25zZS50ZXh0KCkgYXMganNvblxyXG5gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW91dHB1dC5vaykge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGlzcGF0Y2goXHJcbiAgICAgICAgICAgICAgICBwcm9wcy5hY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXh0RGVsZWdhdGUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dERlbGVnYXRlLmRlbGVnYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIG5leHREZWxlZ2F0ZS5kaXNwYXRjaCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuYmxvY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dERlbGVnYXRlLm5leHRIdHRwQ2FsbCxcclxuICAgICAgICAgICAgICAgICAgICBuZXh0RGVsZWdhdGUuaW5kZXhcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgIG91dHB1dC5lcnJvciArPSBlcnJvcjtcclxuXHJcbiAgICAgICAgICAgIGRpc3BhdGNoKFxyXG4gICAgICAgICAgICAgICAgcHJvcHMuZXJyb3IsXHJcbiAgICAgICAgICAgICAgICBvdXRwdXRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGdIdHRwID0gKHByb3BzOiBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcyk6IElIdHRwRmV0Y2hJdGVtID0+IHtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIGh0dHBFZmZlY3QsXHJcbiAgICAgICAgcHJvcHNcclxuICAgIF1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdTZXF1ZW50aWFsSHR0cCA9IChwcm9wc0Jsb2NrOiBBcnJheTxJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc0Jsb2NrPik6IElIdHRwU2VxdWVudGlhbEZldGNoSXRlbSA9PiB7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzZXF1ZW50aWFsSHR0cEVmZmVjdCxcclxuICAgICAgICBwcm9wc0Jsb2NrXHJcbiAgICBdXHJcbn1cclxuIiwiXHJcbmNvbnN0IEtleXMgPSB7XHJcblxyXG4gICAgc3RhcnRVcmw6ICdzdGFydFVybCcsXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEtleXM7XHJcblxyXG4iLCJpbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHR0cEVmZmVjdCBpbXBsZW1lbnRzIElIdHRwRWZmZWN0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdXJsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyc2VUeXBlOiBQYXJzZVR5cGUsXHJcbiAgICAgICAgYWN0aW9uRGVsZWdhdGU6IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSkge1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgICAgIHRoaXMucGFyc2VUeXBlID0gcGFyc2VUeXBlO1xyXG4gICAgICAgIHRoaXMuYWN0aW9uRGVsZWdhdGUgPSBhY3Rpb25EZWxlZ2F0ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIHVybDogc3RyaW5nO1xyXG4gICAgcHVibGljIHBhcnNlVHlwZTogUGFyc2VUeXBlO1xyXG4gICAgcHVibGljIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXk7XHJcbn1cclxuIiwiXHJcblxyXG5jb25zdCBnVXRpbGl0aWVzID0ge1xyXG5cclxuICAgIHJvdW5kVXBUb05lYXJlc3RUZW46ICh2YWx1ZTogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZsb29yID0gTWF0aC5mbG9vcih2YWx1ZSAvIDEwKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChmbG9vciArIDEpICogMTA7XHJcbiAgICB9LFxyXG5cclxuICAgIHJvdW5kRG93blRvTmVhcmVzdFRlbjogKHZhbHVlOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgZmxvb3IgPSBNYXRoLmZsb29yKHZhbHVlIC8gMTApO1xyXG5cclxuICAgICAgICByZXR1cm4gZmxvb3IgKiAxMDtcclxuICAgIH0sXHJcblxyXG4gICAgY29udmVydE1tVG9GZWV0SW5jaGVzOiAobW06IG51bWJlcik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGluY2hlcyA9IG1tICogMC4wMzkzNztcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMuY29udmVydEluY2hlc1RvRmVldEluY2hlcyhpbmNoZXMpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbmRleE9mQW55OiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBjaGFyczogc3RyaW5nW10sXHJcbiAgICAgICAgc3RhcnRJbmRleCA9IDBcclxuICAgICk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGFycy5pbmNsdWRlcyhpbnB1dFtpXSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXREaXJlY3Rvcnk6IChmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBmaWxlUGF0aC5tYXRjaCgvKC4qKVtcXC9cXFxcXS8pO1xyXG5cclxuICAgICAgICBpZiAobWF0Y2hlc1xyXG4gICAgICAgICAgICAmJiBtYXRjaGVzLmxlbmd0aCA+IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNbMV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvdW50Q2hhcmFjdGVyOiAoXHJcbiAgICAgICAgaW5wdXQ6IHN0cmluZyxcclxuICAgICAgICBjaGFyYWN0ZXI6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjb3VudCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnB1dFtpXSA9PT0gY2hhcmFjdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbnZlcnRJbmNoZXNUb0ZlZXRJbmNoZXM6IChpbmNoZXM6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZlZXQgPSBNYXRoLmZsb29yKGluY2hlcyAvIDEyKTtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmcgPSBpbmNoZXMgJSAxMjtcclxuICAgICAgICBjb25zdCBpbmNoZXNSZWFtaW5pbmdSb3VuZGVkID0gTWF0aC5yb3VuZChpbmNoZXNSZWFtaW5pbmcgKiAxMCkgLyAxMDsgLy8gMSBkZWNpbWFsIHBsYWNlc1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgICAgICBpZiAoZmVldCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGAke2ZlZXR9JyBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluY2hlc1JlYW1pbmluZ1JvdW5kZWQgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBgJHtyZXN1bHR9JHtpbmNoZXNSZWFtaW5pbmdSb3VuZGVkfVwiYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTnVsbE9yV2hpdGVTcGFjZTogKGlucHV0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChpbnB1dCA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlucHV0ID0gYCR7aW5wdXR9YDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlucHV0Lm1hdGNoKC9eXFxzKiQvKSAhPT0gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tBcnJheXNFcXVhbDogKGE6IHN0cmluZ1tdLCBiOiBzdHJpbmdbXSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoYSA9PT0gYikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYSA9PT0gbnVsbFxyXG4gICAgICAgICAgICB8fCBiID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB5b3UgZG9uJ3QgY2FyZSBhYm91dCB0aGUgb3JkZXIgb2YgdGhlIGVsZW1lbnRzIGluc2lkZVxyXG4gICAgICAgIC8vIHRoZSBhcnJheSwgeW91IHNob3VsZCBzb3J0IGJvdGggYXJyYXlzIGhlcmUuXHJcbiAgICAgICAgLy8gUGxlYXNlIG5vdGUgdGhhdCBjYWxsaW5nIHNvcnQgb24gYW4gYXJyYXkgd2lsbCBtb2RpZnkgdGhhdCBhcnJheS5cclxuICAgICAgICAvLyB5b3UgbWlnaHQgd2FudCB0byBjbG9uZSB5b3VyIGFycmF5IGZpcnN0LlxyXG5cclxuICAgICAgICBjb25zdCB4OiBzdHJpbmdbXSA9IFsuLi5hXTtcclxuICAgICAgICBjb25zdCB5OiBzdHJpbmdbXSA9IFsuLi5iXTtcclxuXHJcbiAgICAgICAgeC5zb3J0KCk7XHJcbiAgICAgICAgeS5zb3J0KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhbaV0gIT09IHlbaV0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaHVmZmxlKGFycmF5OiBBcnJheTxhbnk+KTogQXJyYXk8YW55PiB7XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50SW5kZXggPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHRlbXBvcmFyeVZhbHVlOiBhbnlcclxuICAgICAgICBsZXQgcmFuZG9tSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cclxuICAgICAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cclxuICAgICAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICBjdXJyZW50SW5kZXggLT0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cclxuICAgICAgICAgICAgdGVtcG9yYXJ5VmFsdWUgPSBhcnJheVtjdXJyZW50SW5kZXhdO1xyXG4gICAgICAgICAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xyXG4gICAgICAgICAgICBhcnJheVtyYW5kb21JbmRleF0gPSB0ZW1wb3JhcnlWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhcnJheTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoZ1V0aWxpdGllcy5pc051bGxPcldoaXRlU3BhY2UoaW5wdXQpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIWlzTmFOKGlucHV0KTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNOZWdhdGl2ZU51bWVyaWM6IChpbnB1dDogYW55KTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZ1V0aWxpdGllcy5pc051bWVyaWMoaW5wdXQpKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gK2lucHV0IDwgMDsgLy8gKyBjb252ZXJ0cyBhIHN0cmluZyB0byBhIG51bWJlciBpZiBpdCBjb25zaXN0cyBvbmx5IG9mIGRpZ2l0cy5cclxuICAgIH0sXHJcblxyXG4gICAgaGFzRHVwbGljYXRlczogPFQ+KGlucHV0OiBBcnJheTxUPik6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAobmV3IFNldChpbnB1dCkuc2l6ZSAhPT0gaW5wdXQubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgZXh0ZW5kOiA8VD4oYXJyYXkxOiBBcnJheTxUPiwgYXJyYXkyOiBBcnJheTxUPik6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBhcnJheTIuZm9yRWFjaCgoaXRlbTogVCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgYXJyYXkxLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXR0eVByaW50SnNvbkZyb21TdHJpbmc6IChpbnB1dDogc3RyaW5nIHwgbnVsbCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMucHJldHR5UHJpbnRKc29uRnJvbU9iamVjdChKU09OLnBhcnNlKGlucHV0KSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHByZXR0eVByaW50SnNvbkZyb21PYmplY3Q6IChpbnB1dDogb2JqZWN0IHwgbnVsbCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgNCAvLyBpbmRlbnRlZCA0IHNwYWNlc1xyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzUG9zaXRpdmVOdW1lcmljOiAoaW5wdXQ6IGFueSk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdW1lcmljKGlucHV0KSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIE51bWJlcihpbnB1dCkgPj0gMDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0VGltZTogKCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdzogRGF0ZSA9IG5ldyBEYXRlKERhdGUubm93KCkpO1xyXG4gICAgICAgIGNvbnN0IHRpbWU6IHN0cmluZyA9IGAke25vdy5nZXRGdWxsWWVhcigpfS0keyhub3cuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0tJHtub3cuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX0gJHtub3cuZ2V0SG91cnMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7bm93LmdldE1pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9OiR7bm93LmdldFNlY29uZHMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyl9Ojoke25vdy5nZXRNaWxsaXNlY29uZHMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDMsICcwJyl9OmA7XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdEJ5TmV3TGluZTogKGlucHV0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGlucHV0LnNwbGl0KC9bXFxyXFxuXSsvKTtcclxuICAgICAgICBjb25zdCBjbGVhbmVkOiBBcnJheTxzdHJpbmc+ID0gW107XHJcblxyXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZSh2YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjbGVhbmVkLnB1c2godmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gY2xlYW5lZDtcclxuICAgIH0sXHJcblxyXG4gICAgc3BsaXRCeVBpcGU6IChpbnB1dDogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChnVXRpbGl0aWVzLmlzTnVsbE9yV2hpdGVTcGFjZShpbnB1dCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBpbnB1dC5zcGxpdCgnfCcpO1xyXG4gICAgICAgIGNvbnN0IGNsZWFuZWQ6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuXHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nKSA9PiB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKHZhbHVlKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNsZWFuZWQucHVzaCh2YWx1ZS50cmltKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjbGVhbmVkO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdEJ5TmV3TGluZUFuZE9yZGVyOiAoaW5wdXQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gZ1V0aWxpdGllc1xyXG4gICAgICAgICAgICAuc3BsaXRCeU5ld0xpbmUoaW5wdXQpXHJcbiAgICAgICAgICAgIC5zb3J0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGpvaW5CeU5ld0xpbmU6IChpbnB1dDogQXJyYXk8c3RyaW5nPik6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIGlmICghaW5wdXRcclxuICAgICAgICAgICAgfHwgaW5wdXQubGVuZ3RoID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQuam9pbignXFxuJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZUFsbENoaWxkcmVuOiAocGFyZW50OiBFbGVtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChwYXJlbnQuZmlyc3RDaGlsZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChwYXJlbnQuZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGlzT2RkOiAoeDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiB4ICUgMiA9PT0gMTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvcnRQcmludFRleHQ6IChcclxuICAgICAgICBpbnB1dDogc3RyaW5nLFxyXG4gICAgICAgIG1heExlbmd0aDogbnVtYmVyID0gMTAwKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKGlucHV0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3ROZXdMaW5lSW5kZXg6IG51bWJlciA9IGdVdGlsaXRpZXMuZ2V0Rmlyc3ROZXdMaW5lSW5kZXgoaW5wdXQpO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3ROZXdMaW5lSW5kZXggPiAwXHJcbiAgICAgICAgICAgICYmIGZpcnN0TmV3TGluZUluZGV4IDw9IG1heExlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gaW5wdXQuc3Vic3RyKDAsIGZpcnN0TmV3TGluZUluZGV4IC0gMSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1V0aWxpdGllcy50cmltQW5kQWRkRWxsaXBzaXMob3V0cHV0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dC5sZW5ndGggPD0gbWF4TGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRwdXQgPSBpbnB1dC5zdWJzdHIoMCwgbWF4TGVuZ3RoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdVdGlsaXRpZXMudHJpbUFuZEFkZEVsbGlwc2lzKG91dHB1dCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRyaW1BbmRBZGRFbGxpcHNpczogKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBsZXQgb3V0cHV0OiBzdHJpbmcgPSBpbnB1dC50cmltKCk7XHJcbiAgICAgICAgbGV0IHB1bmN0dWF0aW9uUmVnZXg6IFJlZ0V4cCA9IC9bLixcXC8jISQlXFxeJlxcKjs6e309XFwtX2B+KCldL2c7XHJcbiAgICAgICAgbGV0IHNwYWNlUmVnZXg6IFJlZ0V4cCA9IC9cXFcrL2c7XHJcbiAgICAgICAgbGV0IGxhc3RDaGFyYWN0ZXI6IHN0cmluZyA9IG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGxldCBsYXN0Q2hhcmFjdGVySXNQdW5jdHVhdGlvbjogYm9vbGVhbiA9XHJcbiAgICAgICAgICAgIHB1bmN0dWF0aW9uUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKVxyXG4gICAgICAgICAgICB8fCBzcGFjZVJlZ2V4LnRlc3QobGFzdENoYXJhY3Rlcik7XHJcblxyXG5cclxuICAgICAgICB3aGlsZSAobGFzdENoYXJhY3RlcklzUHVuY3R1YXRpb24gPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5zdWJzdHIoMCwgb3V0cHV0Lmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBsYXN0Q2hhcmFjdGVyID0gb3V0cHV0W291dHB1dC5sZW5ndGggLSAxXTtcclxuXHJcbiAgICAgICAgICAgIGxhc3RDaGFyYWN0ZXJJc1B1bmN0dWF0aW9uID1cclxuICAgICAgICAgICAgICAgIHB1bmN0dWF0aW9uUmVnZXgudGVzdChsYXN0Q2hhcmFjdGVyKVxyXG4gICAgICAgICAgICAgICAgfHwgc3BhY2VSZWdleC50ZXN0KGxhc3RDaGFyYWN0ZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGAke291dHB1dH0uLi5gO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGaXJzdE5ld0xpbmVJbmRleDogKGlucHV0OiBzdHJpbmcpOiBudW1iZXIgPT4ge1xyXG5cclxuICAgICAgICBsZXQgY2hhcmFjdGVyOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGlucHV0W2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNoYXJhY3RlciA9PT0gJ1xcbidcclxuICAgICAgICAgICAgICAgIHx8IGNoYXJhY3RlciA9PT0gJ1xccicpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cHBlckNhc2VGaXJzdExldHRlcjogKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gaW5wdXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBpbnB1dC5zbGljZSgxKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2VuZXJhdGVHdWlkOiAodXNlSHlwZW5zOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICBsZXQgZDIgPSAocGVyZm9ybWFuY2VcclxuICAgICAgICAgICAgJiYgcGVyZm9ybWFuY2Uubm93XHJcbiAgICAgICAgICAgICYmIChwZXJmb3JtYW5jZS5ub3coKSAqIDEwMDApKSB8fCAwO1xyXG5cclxuICAgICAgICBsZXQgcGF0dGVybiA9ICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnO1xyXG5cclxuICAgICAgICBpZiAoIXVzZUh5cGVucykge1xyXG4gICAgICAgICAgICBwYXR0ZXJuID0gJ3h4eHh4eHh4eHh4eDR4eHh5eHh4eHh4eHh4eHh4eHh4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGd1aWQgPSBwYXR0ZXJuXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgL1t4eV0vZyxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChjKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCByID0gTWF0aC5yYW5kb20oKSAqIDE2O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSAoZCArIHIpICUgMTYgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSAoZDIgKyByKSAlIDE2IHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZDIgPSBNYXRoLmZsb29yKGQyIC8gMTYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChjID09PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBndWlkO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja0lmQ2hyb21lOiAoKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIC8vIHBsZWFzZSBub3RlLCBcclxuICAgICAgICAvLyB0aGF0IElFMTEgbm93IHJldHVybnMgdW5kZWZpbmVkIGFnYWluIGZvciB3aW5kb3cuY2hyb21lXHJcbiAgICAgICAgLy8gYW5kIG5ldyBPcGVyYSAzMCBvdXRwdXRzIHRydWUgZm9yIHdpbmRvdy5jaHJvbWVcclxuICAgICAgICAvLyBidXQgbmVlZHMgdG8gY2hlY2sgaWYgd2luZG93Lm9wciBpcyBub3QgdW5kZWZpbmVkXHJcbiAgICAgICAgLy8gYW5kIG5ldyBJRSBFZGdlIG91dHB1dHMgdG8gdHJ1ZSBub3cgZm9yIHdpbmRvdy5jaHJvbWVcclxuICAgICAgICAvLyBhbmQgaWYgbm90IGlPUyBDaHJvbWUgY2hlY2tcclxuICAgICAgICAvLyBzbyB1c2UgdGhlIGJlbG93IHVwZGF0ZWQgY29uZGl0aW9uXHJcblxyXG4gICAgICAgIGxldCB0c1dpbmRvdzogYW55ID0gd2luZG93IGFzIGFueTtcclxuICAgICAgICBsZXQgaXNDaHJvbWl1bSA9IHRzV2luZG93LmNocm9tZTtcclxuICAgICAgICBsZXQgd2luTmF2ID0gd2luZG93Lm5hdmlnYXRvcjtcclxuICAgICAgICBsZXQgdmVuZG9yTmFtZSA9IHdpbk5hdi52ZW5kb3I7XHJcbiAgICAgICAgbGV0IGlzT3BlcmEgPSB0eXBlb2YgdHNXaW5kb3cub3ByICE9PSBcInVuZGVmaW5lZFwiO1xyXG4gICAgICAgIGxldCBpc0lFZWRnZSA9IHdpbk5hdi51c2VyQWdlbnQuaW5kZXhPZihcIkVkZ2VcIikgPiAtMTtcclxuICAgICAgICBsZXQgaXNJT1NDaHJvbWUgPSB3aW5OYXYudXNlckFnZW50Lm1hdGNoKFwiQ3JpT1NcIik7XHJcblxyXG4gICAgICAgIGlmIChpc0lPU0Nocm9tZSkge1xyXG4gICAgICAgICAgICAvLyBpcyBHb29nbGUgQ2hyb21lIG9uIElPU1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNDaHJvbWl1bSAhPT0gbnVsbFxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgaXNDaHJvbWl1bSAhPT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgICAgICAgICAmJiB2ZW5kb3JOYW1lID09PSBcIkdvb2dsZSBJbmMuXCJcclxuICAgICAgICAgICAgJiYgaXNPcGVyYSA9PT0gZmFsc2VcclxuICAgICAgICAgICAgJiYgaXNJRWVkZ2UgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIC8vIGlzIEdvb2dsZSBDaHJvbWVcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnVXRpbGl0aWVzOyIsImltcG9ydCBJSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5VXJsXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGlzdG9yeVVybCBpbXBsZW1lbnRzIElIaXN0b3J5VXJsIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZykge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlclNuYXBTaG90IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2hpc3RvcnkvSVJlbmRlclNuYXBTaG90XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyU25hcFNob3QgaW1wbGVtZW50cyBJUmVuZGVyU25hcFNob3Qge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxuICAgIHB1YmxpYyBndWlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBjcmVhdGVkOiBEYXRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgbW9kaWZpZWQ6IERhdGUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBleHBhbmRlZE9wdGlvbklEczogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgcHVibGljIGV4cGFuZGVkQW5jaWxsYXJ5SURzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbn1cclxuIiwiaW1wb3J0IElVcmxBc3NlbWJsZXIgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvaGlzdG9yeS9JVXJsQXNzZW1ibGVyXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9IaXN0b3J5VXJsXCI7XHJcbmltcG9ydCBSZW5kZXJTbmFwU2hvdCBmcm9tIFwiLi4vLi4vc3RhdGUvaGlzdG9yeS9SZW5kZXJTbmFwU2hvdFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkVXJsRnJvbVJvb3QgPSAocm9vdDogSVJlbmRlckZyYWdtZW50KTogc3RyaW5nID0+IHtcclxuXHJcbiAgICBjb25zdCB1cmxBc3NlbWJsZXI6IElVcmxBc3NlbWJsZXIgPSB7XHJcblxyXG4gICAgICAgIHVybDogYCR7bG9jYXRpb24ub3JpZ2lufSR7bG9jYXRpb24ucGF0aG5hbWV9P2BcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJvb3Quc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVybEFzc2VtYmxlci51cmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpbnRTZWdtZW50RW5kKFxyXG4gICAgICAgIHVybEFzc2VtYmxlcixcclxuICAgICAgICByb290XHJcbiAgICApXHJcblxyXG4gICAgcmV0dXJuIHVybEFzc2VtYmxlci51cmw7XHJcbn07XHJcblxyXG5jb25zdCBwcmludFNlZ21lbnRFbmQgPSAoXHJcbiAgICB1cmxBc3NlbWJsZXI6IElVcmxBc3NlbWJsZXIsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH1+JHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcblxyXG4gICAgICAgIHByaW50U2VnbWVudEVuZChcclxuICAgICAgICAgICAgdXJsQXNzZW1ibGVyLFxyXG4gICAgICAgICAgICBmcmFnbWVudC5saW5rLnJvb3QsXHJcbiAgICAgICAgKVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmV4aXRLZXkpKSB7XHJcblxyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBc3NlbWJsZXIudXJsO1xyXG4gICAgICAgIHVybCA9IGAke3VybH1fJHtmcmFnbWVudC5pZH1gO1xyXG4gICAgICAgIHVybEFzc2VtYmxlci51cmwgPSB1cmw7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghZnJhZ21lbnQubGlua1xyXG4gICAgICAgICYmICFmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IHVybEFzc2VtYmxlci51cmw7XHJcbiAgICAgICAgdXJsID0gYCR7dXJsfS0ke2ZyYWdtZW50LmlkfWA7XHJcbiAgICAgICAgdXJsQXNzZW1ibGVyLnVybCA9IHVybDtcclxuICAgIH1cclxuXHJcbiAgICBwcmludFNlZ21lbnRFbmQoXHJcbiAgICAgICAgdXJsQXNzZW1ibGVyLFxyXG4gICAgICAgIGZyYWdtZW50LnNlbGVjdGVkLFxyXG4gICAgKVxyXG59O1xyXG5cclxuXHJcbmNvbnN0IGdIaXN0b3J5Q29kZSA9IHtcclxuXHJcbiAgICByZXNldFJhdzogKCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5hdXRvZm9jdXMgPSB0cnVlO1xyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmlzQXV0b2ZvY3VzRmlyc3RSdW4gPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBwdXNoQnJvd3Nlckhpc3RvcnlTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnJlZnJlc2hVcmwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50U2VjdGlvbj8uY3VycmVudFxyXG4gICAgICAgICAgICB8fCAhc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdIaXN0b3J5Q29kZS5yZXNldFJhdygpO1xyXG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xyXG4gICAgICAgIGxldCBsYXN0VXJsOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5zdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgbGFzdFVybCA9IHdpbmRvdy5oaXN0b3J5LnN0YXRlLnVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxhc3RVcmwgPSBgJHtsb2NhdGlvbi5vcmlnaW59JHtsb2NhdGlvbi5wYXRobmFtZX0ke2xvY2F0aW9uLnNlYXJjaH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gYnVpbGRVcmxGcm9tUm9vdChzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUucm9vdCk7XHJcblxyXG4gICAgICAgIGlmIChsYXN0VXJsXHJcbiAgICAgICAgICAgICYmIHVybCA9PT0gbGFzdFVybCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShcclxuICAgICAgICAgICAgbmV3IFJlbmRlclNuYXBTaG90KHVybCksXHJcbiAgICAgICAgICAgIFwiXCIsXHJcbiAgICAgICAgICAgIHVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHN0YXRlLnN0ZXBIaXN0b3J5Lmhpc3RvcnlDaGFpbi5wdXNoKG5ldyBIaXN0b3J5VXJsKHVybCkpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0hpc3RvcnlDb2RlO1xyXG5cclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJQWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lBY3Rpb25cIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJSHR0cEVmZmVjdCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lIdHRwRWZmZWN0XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IEh0dHBFZmZlY3QgZnJvbSBcIi4uLy4uL3N0YXRlL2VmZmVjdHMvSHR0cEVmZmVjdFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0hpc3RvcnlDb2RlIGZyb20gXCIuL2dIaXN0b3J5Q29kZVwiO1xyXG5cclxubGV0IGNvdW50ID0gMDtcclxuXHJcbmNvbnN0IGdTdGF0ZUNvZGUgPSB7XHJcblxyXG4gICAgc2V0RGlydHk6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLnVpLnJhdyA9IGZhbHNlO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID0gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZyZXNoS2V5SW50OiAoc3RhdGU6IElTdGF0ZSk6IG51bWJlciA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG5leHRLZXkgPSArK3N0YXRlLm5leHRLZXk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXh0S2V5O1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmVzaEtleTogKHN0YXRlOiBJU3RhdGUpOiBzdHJpbmcgPT4ge1xyXG5cclxuICAgICAgICByZXR1cm4gYCR7Z1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSl9YDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0R3VpZEtleTogKCk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBVLmdlbmVyYXRlR3VpZCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZVN0YXRlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnSGlzdG9yeUNvZGUucHVzaEJyb3dzZXJIaXN0b3J5U3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5ld1N0YXRlOiBJU3RhdGUgPSB7IC4uLnN0YXRlIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXdTdGF0ZTtcclxuICAgIH0sXHJcblxyXG4gICAgQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHBhcnNlVHlwZTogUGFyc2VUeXBlLFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIGFjdGlvbkRlbGVnYXRlOiAoc3RhdGU6IElTdGF0ZSwgcmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXlcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhuYW1lKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG5cclxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh1cmwuZW5kc1dpdGgoJ2lteW82QzA4SC5odG1sJykpIHtcclxuICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVmZmVjdDogSUh0dHBFZmZlY3QgfCB1bmRlZmluZWQgPSBzdGF0ZVxyXG4gICAgICAgICAgICAucmVwZWF0RWZmZWN0c1xyXG4gICAgICAgICAgICAucmVMb2FkR2V0SHR0cEltbWVkaWF0ZVxyXG4gICAgICAgICAgICAuZmluZCgoZWZmZWN0OiBJSHR0cEVmZmVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBlZmZlY3QubmFtZSA9PT0gbmFtZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChlZmZlY3QpIHsgLy8gYWxyZWFkeSBhZGRlZC5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaHR0cEVmZmVjdDogSUh0dHBFZmZlY3QgPSBuZXcgSHR0cEVmZmVjdChcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBwYXJzZVR5cGUsXHJcbiAgICAgICAgICAgIGFjdGlvbkRlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlLnB1c2goaHR0cEVmZmVjdCk7XHJcbiAgICB9LFxyXG5cclxuICAgIEFkZFJ1bkFjdGlvbkltbWVkaWF0ZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgYWN0aW9uRGVsZWdhdGU6IElBY3Rpb24pOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUucmVwZWF0RWZmZWN0cy5ydW5BY3Rpb25JbW1lZGlhdGUucHVzaChhY3Rpb25EZWxlZ2F0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldENhY2hlZF9vdXRsaW5lTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgKTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudElEKSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50SUQgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSA/PyBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk91dGxpbmVOb2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG91dGxpbmVOb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjYWNoZV9vdXRsaW5lTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVLZXkoXHJcbiAgICAgICAgICAgIGxpbmtJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUuaVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5pbmRleF9vdXRsaW5lTm9kZXNfaWRba2V5XSA9IG91dGxpbmVOb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZWRfY2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZnJhZ21lbnRJRDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgKTogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudElEKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBrZXkgPSBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgIGZyYWdtZW50SUQgYXMgc3RyaW5nXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlLnJlbmRlclN0YXRlLmluZGV4X2NoYWluRnJhZ21lbnRzX2lkW2tleV0gPz8gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgY2FjaGVfY2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVuZGVyRnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXJlbmRlckZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVLZXlGcm9tRnJhZ21lbnQocmVuZGVyRnJhZ21lbnQpO1xyXG5cclxuICAgICAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uoa2V5KSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWRba2V5IGFzIHN0cmluZ10pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWRba2V5IGFzIHN0cmluZ10gPSByZW5kZXJGcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q2FjaGVLZXlGcm9tRnJhZ21lbnQ6IChyZW5kZXJGcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogc3RyaW5nIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmdldENhY2hlS2V5KFxyXG4gICAgICAgICAgICByZW5kZXJGcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuaWRcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDYWNoZUtleTogKFxyXG5cclxuICAgICAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgICAgICBmcmFnbWVudElEOiBzdHJpbmdcclxuICAgICk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgJHtsaW5rSUR9XyR7ZnJhZ21lbnRJRH1gO1xyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdTdGF0ZUNvZGU7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGdBdXRoZW50aWNhdGlvbkNvZGUgPSB7XHJcblxyXG4gICAgY2xlYXJBdXRoZW50aWNhdGlvbjogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgc3RhdGUudXNlci5hdXRob3Jpc2VkID0gZmFsc2U7XHJcbiAgICAgICAgc3RhdGUudXNlci5uYW1lID0gXCJcIjtcclxuICAgICAgICBzdGF0ZS51c2VyLnN1YiA9IFwiXCI7XHJcbiAgICAgICAgc3RhdGUudXNlci5sb2dvdXRVcmwgPSBcIlwiO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0F1dGhlbnRpY2F0aW9uQ29kZTtcclxuIiwiXHJcbmV4cG9ydCBlbnVtIEFjdGlvblR5cGUge1xyXG5cclxuICAgIE5vbmUgPSAnbm9uZScsXHJcbiAgICBGaWx0ZXJUb3BpY3MgPSAnZmlsdGVyVG9waWNzJyxcclxuICAgIEdldFRvcGljID0gJ2dldFRvcGljJyxcclxuICAgIEdldFRvcGljQW5kUm9vdCA9ICdnZXRUb3BpY0FuZFJvb3QnLFxyXG4gICAgU2F2ZUFydGljbGVTY2VuZSA9ICdzYXZlQXJ0aWNsZVNjZW5lJyxcclxuICAgIEdldFJvb3QgPSAnZ2V0Um9vdCcsXHJcbiAgICBHZXRTdGVwID0gJ2dldFN0ZXAnLFxyXG4gICAgR2V0UGFnZSA9ICdnZXRQYWdlJyxcclxuICAgIEdldENoYWluID0gJ2dldENoYWluJyxcclxuICAgIEdldE91dGxpbmUgPSAnZ2V0T3V0bGluZScsXHJcbiAgICBHZXRGcmFnbWVudCA9ICdnZXRGcmFnbWVudCcsXHJcbiAgICBHZXRDaGFpbkZyYWdtZW50ID0gJ2dldENoYWluRnJhZ21lbnQnXHJcbn1cclxuXHJcbiIsImltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgZ0FqYXhIZWFkZXJDb2RlID0ge1xyXG5cclxuICAgIGJ1aWxkSGVhZGVyczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2FsbElEOiBzdHJpbmcsXHJcbiAgICAgICAgYWN0aW9uOiBBY3Rpb25UeXBlKTogSGVhZGVycyA9PiB7XHJcblxyXG4gICAgICAgIGxldCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnWC1DU1JGJywgJzEnKTtcclxuICAgICAgICBoZWFkZXJzLmFwcGVuZCgnU3Vic2NyaXB0aW9uSUQnLCBzdGF0ZS5zZXR0aW5ncy5zdWJzY3JpcHRpb25JRCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0NhbGxJRCcsIGNhbGxJRCk7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoJ0FjdGlvbicsIGFjdGlvbik7XHJcblxyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKCd3aXRoQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xyXG5cclxuICAgICAgICByZXR1cm4gaGVhZGVycztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdBamF4SGVhZGVyQ29kZTtcclxuXHJcbiIsImltcG9ydCB7IGdBdXRoZW50aWNhdGVkSHR0cCB9IGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkh0dHBcIjtcclxuXHJcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9BY3Rpb25UeXBlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4vZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnQXV0aGVudGljYXRpb25BY3Rpb25zIGZyb20gXCIuL2dBdXRoZW50aWNhdGlvbkFjdGlvbnNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBnQXV0aGVudGljYXRpb25FZmZlY3RzID0ge1xyXG5cclxuICAgIGNoZWNrVXNlckF1dGhlbnRpY2F0ZWQ6IChzdGF0ZTogSVN0YXRlKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbGxJRDogc3RyaW5nID0gVS5nZW5lcmF0ZUd1aWQoKTtcclxuXHJcbiAgICAgICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgY2FsbElELFxyXG4gICAgICAgICAgICBBY3Rpb25UeXBlLk5vbmVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke3N0YXRlLnNldHRpbmdzLmJmZlVybH0vJHtzdGF0ZS5zZXR0aW5ncy51c2VyUGF0aH0/c2xpZGU9ZmFsc2VgO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnNcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVzcG9uc2U6ICdqc29uJyxcclxuICAgICAgICAgICAgYWN0aW9uOiBnQXV0aGVudGljYXRpb25BY3Rpb25zLmxvYWRTdWNjZXNzZnVsQXV0aGVudGljYXRpb24sXHJcbiAgICAgICAgICAgIGVycm9yOiAoc3RhdGU6IElTdGF0ZSwgZXJyb3JEZXRhaWxzOiBhbnkpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIHRyeWluZyB0byBhdXRoZW50aWNhdGUgd2l0aCB0aGUgc2VydmVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dBdXRoZW50aWNhdGlvbkVmZmVjdHMuY2hlY2tVc2VyQXV0aGVudGljYXRlZC5uYW1lfSxcclxuICAgICAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQoYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciB0cnlpbmcgdG8gYXV0aGVudGljYXRlIHdpdGggdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cy5jaGVja1VzZXJBdXRoZW50aWNhdGVkLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YXRlXCI6ICR7SlNPTi5zdHJpbmdpZnkoc3RhdGUpfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQXV0aGVudGljYXRpb25FZmZlY3RzO1xyXG4iLCJpbXBvcnQgeyBJSHR0cEZldGNoSXRlbSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2h0dHAvSUh0dHBGZXRjaEl0ZW1cIjtcclxuaW1wb3J0IEtleXMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvY29uc3RhbnRzL0tleXNcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkNvZGUgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uQ29kZVwiO1xyXG5pbXBvcnQgZ0F1dGhlbnRpY2F0aW9uRWZmZWN0cyBmcm9tIFwiLi9nQXV0aGVudGljYXRpb25FZmZlY3RzXCI7XHJcblxyXG5cclxuY29uc3QgZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucyA9IHtcclxuXHJcbiAgICBsb2FkU3VjY2Vzc2Z1bEF1dGhlbnRpY2F0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55KTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFyZXNwb25zZVxyXG4gICAgICAgICAgICB8fCByZXNwb25zZS5wYXJzZVR5cGUgIT09IFwianNvblwiXHJcbiAgICAgICAgICAgIHx8ICFyZXNwb25zZS5qc29uRGF0YSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2xhaW1zOiBhbnkgPSByZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgbmFtZTogYW55ID0gY2xhaW1zLmZpbmQoXHJcbiAgICAgICAgICAgIChjbGFpbTogYW55KSA9PiBjbGFpbS50eXBlID09PSAnbmFtZSdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBzdWI6IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ3N1YidcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIW5hbWVcclxuICAgICAgICAgICAgJiYgIXN1Yikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9nb3V0VXJsQ2xhaW06IGFueSA9IGNsYWltcy5maW5kKFxyXG4gICAgICAgICAgICAoY2xhaW06IGFueSkgPT4gY2xhaW0udHlwZSA9PT0gJ2JmZjpsb2dvdXRfdXJsJ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmICghbG9nb3V0VXJsQ2xhaW1cclxuICAgICAgICAgICAgfHwgIWxvZ291dFVybENsYWltLnZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS51c2VyLmF1dGhvcmlzZWQgPSB0cnVlO1xyXG4gICAgICAgIHN0YXRlLnVzZXIubmFtZSA9IG5hbWUudmFsdWU7XHJcbiAgICAgICAgc3RhdGUudXNlci5zdWIgPSBzdWIudmFsdWU7XHJcbiAgICAgICAgc3RhdGUudXNlci5sb2dvdXRVcmwgPSBsb2dvdXRVcmxDbGFpbS52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrVXNlckxvZ2dlZEluOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvcHM6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5jaGVja1VzZXJMb2dnZWRJblByb3BzKHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFwcm9wcykge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHByb3BzXHJcbiAgICAgICAgXTtcclxuICAgIH0sXHJcblxyXG4gICAgY2hlY2tVc2VyTG9nZ2VkSW5Qcm9wczogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnVzZXIucmF3ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiBnQXV0aGVudGljYXRpb25FZmZlY3RzLmNoZWNrVXNlckF1dGhlbnRpY2F0ZWQoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2dpbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVcmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcclxuXHJcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcclxuICAgICAgICAgICAgS2V5cy5zdGFydFVybCxcclxuICAgICAgICAgICAgY3VycmVudFVybFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7c3RhdGUuc2V0dGluZ3MuYmZmVXJsfS8ke3N0YXRlLnNldHRpbmdzLmRlZmF1bHRMb2dpblBhdGh9P3JldHVyblVybD0vYDtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKHVybCk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJBdXRoZW50aWNhdGlvbjogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcbiAgICAgICAgZ0F1dGhlbnRpY2F0aW9uQ29kZS5jbGVhckF1dGhlbnRpY2F0aW9uKHN0YXRlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyQXV0aGVudGljYXRpb25BbmRTaG93TG9naW46IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnQXV0aGVudGljYXRpb25Db2RlLmNsZWFyQXV0aGVudGljYXRpb24oc3RhdGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5sb2dpbihzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvZ291dDogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24oc3RhdGUudXNlci5sb2dvdXRVcmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnQXV0aGVudGljYXRpb25BY3Rpb25zO1xyXG4iLCJpbXBvcnQgeyBnSHR0cCB9IGZyb20gXCIuL2dIdHRwXCI7XHJcblxyXG5pbXBvcnQgSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEF1dGhlbnRpY2F0ZWRQcm9wc1wiO1xyXG5pbXBvcnQgSUh0dHBQcm9wcyBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwUHJvcHNcIjtcclxuaW1wb3J0IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMgZnJvbSBcIi4vZ0F1dGhlbnRpY2F0aW9uQWN0aW9uc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnQXV0aGVudGljYXRlZEh0dHAocHJvcHM6IElIdHRwUHJvcHMpOiBhbnkge1xyXG5cclxuICAgIGNvbnN0IGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllczogSUh0dHBBdXRoZW50aWNhdGVkUHJvcHMgPSBwcm9wcyBhcyBJSHR0cEF1dGhlbnRpY2F0ZWRQcm9wcztcclxuXHJcbiAgICAvLyAvLyBUbyByZWdpc3RlciBmYWlsZWQgYXV0aGVudGljYXRpb25cclxuICAgIC8vIGh0dHBBdXRoZW50aWNhdGVkUHJvcGVydGllcy5vbkF1dGhlbnRpY2F0aW9uRmFpbEFjdGlvbiA9IGdBdXRoZW50aWNhdGlvbkFjdGlvbnMuY2xlYXJBdXRoZW50aWNhdGlvbjtcclxuXHJcbiAgICAvLyBUbyByZWdpc3RlciBmYWlsZWQgYXV0aGVudGljYXRpb24gYW5kIHNob3cgbG9naW4gcGFnZVxyXG4gICAgaHR0cEF1dGhlbnRpY2F0ZWRQcm9wZXJ0aWVzLm9uQXV0aGVudGljYXRpb25GYWlsQWN0aW9uID0gZ0F1dGhlbnRpY2F0aW9uQWN0aW9ucy5jbGVhckF1dGhlbnRpY2F0aW9uQW5kU2hvd0xvZ2luO1xyXG5cclxuICAgIHJldHVybiBnSHR0cChodHRwQXV0aGVudGljYXRlZFByb3BlcnRpZXMpO1xyXG59XHJcbiIsIlxyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgZ0FqYXhIZWFkZXJDb2RlIGZyb20gXCIuLi9odHRwL2dBamF4SGVhZGVyQ29kZVwiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgSUFjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JQWN0aW9uXCI7XHJcblxyXG5jb25zdCBydW5BY3Rpb25Jbm5lciA9IChcclxuICAgIGRpc3BhdGNoOiBhbnksXHJcbiAgICBwcm9wczogYW55KTogdm9pZCA9PiB7XHJcblxyXG4gICAgZGlzcGF0Y2goXHJcbiAgICAgICAgcHJvcHMuYWN0aW9uLFxyXG4gICAgKTtcclxufTtcclxuXHJcblxyXG5jb25zdCBydW5BY3Rpb24gPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVldWVkRWZmZWN0czogQXJyYXk8SUFjdGlvbj5cclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGNvbnN0IGVmZmVjdHM6IGFueVtdID0gW107XHJcblxyXG4gICAgcXVldWVkRWZmZWN0cy5mb3JFYWNoKChhY3Rpb246IElBY3Rpb24pID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvcHMgPSB7XHJcbiAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxyXG4gICAgICAgICAgICBlcnJvcjogKF9zdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgcnVubmluZyBhY3Rpb24gaW4gcmVwZWF0QWN0aW9uc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke3J1bkFjdGlvbn0sXHJcbiAgICAgICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJFcnJvciBydW5uaW5nIGFjdGlvbiBpbiByZXBlYXRBY3Rpb25zXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIGVmZmVjdHMucHVzaChbXHJcbiAgICAgICAgICAgIHJ1bkFjdGlvbklubmVyLFxyXG4gICAgICAgICAgICBwcm9wc1xyXG4gICAgICAgIF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3Qgc2VuZFJlcXVlc3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVldWVkRWZmZWN0czogQXJyYXk8SUh0dHBFZmZlY3Q+XHJcbik6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICBjb25zdCBlZmZlY3RzOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHF1ZXVlZEVmZmVjdHMuZm9yRWFjaCgoaHR0cEVmZmVjdDogSUh0dHBFZmZlY3QpID0+IHtcclxuXHJcbiAgICAgICAgZ2V0RWZmZWN0KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgaHR0cEVmZmVjdCxcclxuICAgICAgICAgICAgZWZmZWN0cyxcclxuICAgICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKSxcclxuICAgICAgICAuLi5lZmZlY3RzXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0RWZmZWN0ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIGh0dHBFZmZlY3Q6IElIdHRwRWZmZWN0LFxyXG4gICAgZWZmZWN0czogQXJyYXk8SUh0dHBFZmZlY3Q+XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IHVybDogc3RyaW5nID0gaHR0cEVmZmVjdC51cmw7XHJcbiAgICBjb25zdCBjYWxsSUQ6IHN0cmluZyA9IFUuZ2VuZXJhdGVHdWlkKCk7XHJcblxyXG4gICAgbGV0IGhlYWRlcnMgPSBnQWpheEhlYWRlckNvZGUuYnVpbGRIZWFkZXJzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGNhbGxJRCxcclxuICAgICAgICBBY3Rpb25UeXBlLkdldFN0ZXBcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgZWZmZWN0ID0gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBwYXJzZVR5cGU6IGh0dHBFZmZlY3QucGFyc2VUeXBlLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogJ2pzb24nLFxyXG4gICAgICAgIGFjdGlvbjogaHR0cEVmZmVjdC5hY3Rpb25EZWxlZ2F0ZSxcclxuICAgICAgICBlcnJvcjogKF9zdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBwb3N0aW5nIGdSZXBlYXRBY3Rpb25zIGRhdGEgdG8gdGhlIHNlcnZlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRFZmZlY3QubmFtZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICAgICAgfWApO1xyXG5cclxuICAgICAgICAgICAgYWxlcnQoXCJFcnJvciBwb3N0aW5nIGdSZXBlYXRBY3Rpb25zIGRhdGEgdG8gdGhlIHNlcnZlclwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBlZmZlY3RzLnB1c2goZWZmZWN0KTtcclxufTtcclxuXHJcbmNvbnN0IGdSZXBlYXRBY3Rpb25zID0ge1xyXG5cclxuICAgIGh0dHBTaWxlbnRSZUxvYWRJbW1lZGlhdGU6IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBNdXN0IHJldHVybiBhbHRlcmVkIHN0YXRlIGZvciB0aGUgc3Vic2NyaXB0aW9uIG5vdCB0byBnZXQgcmVtb3ZlZFxyXG4gICAgICAgICAgICAvLyByZXR1cm4gc3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZUxvYWRIdHRwRWZmZWN0c0ltbWVkaWF0ZTogQXJyYXk8SUh0dHBFZmZlY3Q+ID0gc3RhdGUucmVwZWF0RWZmZWN0cy5yZUxvYWRHZXRIdHRwSW1tZWRpYXRlO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZSA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VuZFJlcXVlc3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZUxvYWRIdHRwRWZmZWN0c0ltbWVkaWF0ZVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNpbGVudFJ1bkFjdGlvbkltbWVkaWF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZXBlYXRFZmZlY3RzLnJ1bkFjdGlvbkltbWVkaWF0ZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gTXVzdCByZXR1cm4gYWx0ZXJlZCBzdGF0ZSBmb3IgdGhlIHN1YnNjcmlwdGlvbiBub3QgdG8gZ2V0IHJlbW92ZWRcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHN0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcnVuQWN0aW9uSW1tZWRpYXRlOiBBcnJheTxJQWN0aW9uPiA9IHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlID0gW107XHJcblxyXG4gICAgICAgIHJldHVybiBydW5BY3Rpb24oXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBydW5BY3Rpb25JbW1lZGlhdGVcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1JlcGVhdEFjdGlvbnM7XHJcblxyXG4iLCJpbXBvcnQgeyBpbnRlcnZhbCB9IGZyb20gXCIuLi8uLi9oeXBlckFwcC90aW1lXCI7XHJcblxyXG5pbXBvcnQgZ1JlcGVhdEFjdGlvbnMgZnJvbSBcIi4uL2dsb2JhbC9hY3Rpb25zL2dSZXBlYXRBY3Rpb25zXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgcmVwZWF0U3Vic2NyaXB0aW9ucyA9IHtcclxuXHJcbiAgICBidWlsZFJlcGVhdFN1YnNjcmlwdGlvbnM6IChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1aWxkUmVMb2FkRGF0YUltbWVkaWF0ZSA9ICgpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucmVMb2FkR2V0SHR0cEltbWVkaWF0ZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsKFxyXG4gICAgICAgICAgICAgICAgICAgIGdSZXBlYXRBY3Rpb25zLmh0dHBTaWxlbnRSZUxvYWRJbW1lZGlhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgeyBkZWxheTogMTAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1aWxkUnVuQWN0aW9uc0ltbWVkaWF0ZSA9ICgpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlcGVhdEVmZmVjdHMucnVuQWN0aW9uSW1tZWRpYXRlLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJ2YWwoXHJcbiAgICAgICAgICAgICAgICAgICAgZ1JlcGVhdEFjdGlvbnMuc2lsZW50UnVuQWN0aW9uSW1tZWRpYXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHsgZGVsYXk6IDEwIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCByZXBlYXRTdWJzY3JpcHRpb246IGFueVtdID0gW1xyXG5cclxuICAgICAgICAgICAgYnVpbGRSZUxvYWREYXRhSW1tZWRpYXRlKCksXHJcbiAgICAgICAgICAgIGJ1aWxkUnVuQWN0aW9uc0ltbWVkaWF0ZSgpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlcGVhdFN1YnNjcmlwdGlvbjtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHJlcGVhdFN1YnNjcmlwdGlvbnM7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgcmVwZWF0U3Vic2NyaXB0aW9ucyBmcm9tIFwiLi4vLi4vLi4vc3Vic2NyaXB0aW9ucy9yZXBlYXRTdWJzY3JpcHRpb25cIjtcclxuXHJcblxyXG5jb25zdCBpbml0U3Vic2NyaXB0aW9ucyA9IChzdGF0ZTogSVN0YXRlKSA9PiB7XHJcblxyXG4gICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zOiBhbnlbXSA9IFtcclxuXHJcbiAgICAgICAgLi4ucmVwZWF0U3Vic2NyaXB0aW9ucy5idWlsZFJlcGVhdFN1YnNjcmlwdGlvbnMoc3RhdGUpXHJcbiAgICBdO1xyXG5cclxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFN1YnNjcmlwdGlvbnM7XHJcblxyXG4iLCJcclxuY29uc3QgRmlsdGVycyA9IHtcclxuXHJcbiAgICB0cmVlU29sdmVHdWlkZUlEOiBcInRyZWVTb2x2ZUd1aWRlXCIsXHJcbiAgICB0cmVlU29sdmVGcmFnbWVudHNJRDogXCJ0cmVlU29sdmVGcmFnbWVudHNcIixcclxuICAgIHVwTmF2RWxlbWVudDogJyNzdGVwTmF2IC5jaGFpbi11cHdhcmRzJyxcclxuICAgIGRvd25OYXZFbGVtZW50OiAnI3N0ZXBOYXYgLmNoYWluLWRvd253YXJkcycsXHJcblxyXG4gICAgZnJhZ21lbnRCb3g6ICcjdHJlZVNvbHZlRnJhZ21lbnRzIC5udC1mci1mcmFnbWVudC1ib3gnLFxyXG4gICAgZnJhZ21lbnRCb3hEaXNjdXNzaW9uOiAnI3RyZWVTb2x2ZUZyYWdtZW50cyAubnQtZnItZnJhZ21lbnQtYm94IC5udC1mci1mcmFnbWVudC1kaXNjdXNzaW9uJyxcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRmlsdGVycztcclxuIiwiaW1wb3J0IEZpbHRlcnMgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzXCI7XHJcblxyXG5cclxuY29uc3Qgb25GcmFnbWVudHNSZW5kZXJGaW5pc2hlZCA9ICgpID0+IHtcclxuXHJcbiAgICBjb25zdCBmcmFnbWVudEJveERpc2N1c3Npb25zOiBOb2RlTGlzdE9mPEVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChGaWx0ZXJzLmZyYWdtZW50Qm94RGlzY3Vzc2lvbik7XHJcbiAgICBsZXQgZnJhZ21lbnRCb3g6IEhUTUxEaXZFbGVtZW50O1xyXG4gICAgbGV0IGRhdGFEaXNjdXNzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFnbWVudEJveERpc2N1c3Npb25zLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Qm94ID0gZnJhZ21lbnRCb3hEaXNjdXNzaW9uc1tpXSBhcyBIVE1MRGl2RWxlbWVudDtcclxuICAgICAgICBkYXRhRGlzY3Vzc2lvbiA9IGZyYWdtZW50Qm94LmRhdGFzZXQuZGlzY3Vzc2lvbjtcclxuXHJcbiAgICAgICAgaWYgKGRhdGFEaXNjdXNzaW9uICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50Qm94LmlubmVySFRNTCA9IGRhdGFEaXNjdXNzaW9uO1xyXG4gICAgICAgICAgICBkZWxldGUgZnJhZ21lbnRCb3guZGF0YXNldC5kaXNjdXNzaW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG9uRnJhZ21lbnRzUmVuZGVyRmluaXNoZWQ7XHJcbiIsImltcG9ydCBvbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkIGZyb20gXCIuLi8uLi9mcmFnbWVudHMvY29kZS9vbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkXCI7XHJcblxyXG5cclxuY29uc3Qgb25SZW5kZXJGaW5pc2hlZCA9ICgpID0+IHtcclxuXHJcbiAgICBvbkZyYWdtZW50c1JlbmRlckZpbmlzaGVkKCk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvblJlbmRlckZpbmlzaGVkO1xyXG4iLCJpbXBvcnQgb25SZW5kZXJGaW5pc2hlZCBmcm9tIFwiLi9vblJlbmRlckZpbmlzaGVkXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdEV2ZW50cyA9IHtcclxuXHJcbiAgb25SZW5kZXJGaW5pc2hlZDogKCkgPT4ge1xyXG5cclxuICAgIG9uUmVuZGVyRmluaXNoZWQoKTtcclxuICB9LFxyXG5cclxuICByZWdpc3Rlckdsb2JhbEV2ZW50czogKCkgPT4ge1xyXG5cclxuICAgIHdpbmRvdy5vbnJlc2l6ZSA9ICgpID0+IHtcclxuXHJcbiAgICAgIGluaXRFdmVudHMub25SZW5kZXJGaW5pc2hlZCgpO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRFdmVudHM7XHJcblxyXG5cclxuXHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdEFjdGlvbnMgPSB7XHJcblxyXG4gICAgc2V0Tm90UmF3OiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghd2luZG93Py5UcmVlU29sdmU/LnNjcmVlbj8uaXNBdXRvZm9jdXNGaXJzdFJ1bikge1xyXG5cclxuICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uYXV0b2ZvY3VzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnNjcmVlbi5pc0F1dG9mb2N1c0ZpcnN0UnVuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0QWN0aW9ucztcclxuIiwiXHJcbmV4cG9ydCBlbnVtIFBhcnNlVHlwZSB7XHJcblxyXG4gICAgTm9uZSA9ICdub25lJyxcclxuICAgIEpzb24gPSAnanNvbicsXHJcbiAgICBUZXh0ID0gJ3RleHQnXHJcbn1cclxuXHJcbiIsImltcG9ydCBJUmVuZGVyRnJhZ21lbnRVSSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyRnJhZ21lbnRVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlckZyYWdtZW50VUkgaW1wbGVtZW50cyBJUmVuZGVyRnJhZ21lbnRVSSB7XHJcblxyXG4gICAgcHVibGljIGZyYWdtZW50T3B0aW9uc0V4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgZGlzY3Vzc2lvbkxvYWRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGFuY2lsbGFyeUV4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgZG9Ob3RQYWludDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNlY3Rpb25JbmRleDogbnVtYmVyID0gMDtcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudFVJIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL0lSZW5kZXJGcmFnbWVudFVJXCI7XHJcbmltcG9ydCBSZW5kZXJGcmFnbWVudFVJIGZyb20gXCIuLi91aS9SZW5kZXJGcmFnbWVudFVJXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyRnJhZ21lbnQgaW1wbGVtZW50cyBJUmVuZGVyRnJhZ21lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGlkOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGxcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLnNlY3Rpb24gPSBzZWN0aW9uO1xyXG4gICAgICAgIHRoaXMucGFyZW50RnJhZ21lbnRJRCA9IHBhcmVudEZyYWdtZW50SUQ7XHJcbiAgICAgICAgdGhpcy5zZWdtZW50SW5kZXggPSBzZWdtZW50SW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlkOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgaUtleTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgaUV4aXRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGV4aXRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHRvcExldmVsTWFwS2V5OiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBtYXBLZXlDaGFpbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZ3VpZGVJRDogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZ3VpZGVQYXRoOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIHNlbGVjdGVkOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBpc0xlYWY6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+ID0gW107XHJcbiAgICBwdWJsaWMgdmFyaWFibGU6IG51bGwgfCBbc3RyaW5nXSB8IFtzdHJpbmcsIHN0cmluZyB8IG51bWJlcl0gPSBudWxsO1xyXG5cclxuICAgIHB1YmxpYyBvcHRpb246IHN0cmluZyA9ICcnO1xyXG4gICAgcHVibGljIGlzQW5jaWxsYXJ5OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgb3JkZXI6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHVibGljIGxpbms6IElEaXNwbGF5Q2hhcnQgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb247XHJcbiAgICBwdWJsaWMgc2VnbWVudEluZGV4OiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAgIHB1YmxpYyB1aTogSVJlbmRlckZyYWdtZW50VUkgPSBuZXcgUmVuZGVyRnJhZ21lbnRVSSgpO1xyXG59XHJcbiIsIlxyXG5leHBvcnQgZW51bSBPdXRsaW5lVHlwZSB7XHJcblxyXG4gICAgTm9uZSA9ICdub25lJyxcclxuICAgIE5vZGUgPSAnbm9kZScsXHJcbiAgICBFeGl0ID0gJ2V4aXQnLFxyXG4gICAgTGluayA9ICdsaW5rJ1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlck91dGxpbmVOb2RlIGltcGxlbWVudHMgSVJlbmRlck91dGxpbmVOb2RlIHtcclxuXHJcbiAgICBwdWJsaWMgaTogc3RyaW5nID0gJyc7IC8vIGlkXHJcbiAgICBwdWJsaWMgYzogbnVtYmVyIHwgbnVsbCA9IG51bGw7IC8vIGluZGV4IGZyb20gb3V0bGluZSBjaGFydCBhcnJheVxyXG4gICAgcHVibGljIHg6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQgPSBudWxsOyAvLyBpRXhpdCBpZFxyXG4gICAgcHVibGljIF94OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkID0gbnVsbDsgLy8gZXhpdCBpZFxyXG4gICAgcHVibGljIG86IEFycmF5PElSZW5kZXJPdXRsaW5lTm9kZT4gPSBbXTsgLy8gb3B0aW9uc1xyXG4gICAgcHVibGljIHBhcmVudDogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgdHlwZTogT3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5Ob2RlO1xyXG4gICAgcHVibGljIGlzQ2hhcnQ6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGlzUm9vdDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzTGFzdDogYm9vbGVhbiA9IGZhbHNlO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi9SZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlck91dGxpbmUgaW1wbGVtZW50cyBJUmVuZGVyT3V0bGluZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IocGF0aDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhdGg6IHN0cmluZztcclxuICAgIHB1YmxpYyBsb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICBwdWJsaWMgdjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgcjogSVJlbmRlck91dGxpbmVOb2RlID0gbmV3IFJlbmRlck91dGxpbmVOb2RlKCk7XHJcbiAgICBwdWJsaWMgYzogQXJyYXk8SVJlbmRlck91dGxpbmVDaGFydD4gPSBbXTtcclxuICAgIHB1YmxpYyBlOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcbiAgICBwdWJsaWMgbXY6IGFueSB8IHVuZGVmaW5lZDtcclxufVxyXG4iLCJpbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlck91dGxpbmVDaGFydCBpbXBsZW1lbnRzIElSZW5kZXJPdXRsaW5lQ2hhcnQge1xyXG5cclxuICAgIHB1YmxpYyBpOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBwOiBzdHJpbmcgPSAnJztcclxufVxyXG4iLCJpbXBvcnQgSURpc3BsYXlHdWlkZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5R3VpZGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyR3VpZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJHdWlkZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vcmVuZGVyL1JlbmRlckZyYWdtZW50XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGxheUd1aWRlIGltcGxlbWVudHMgSURpc3BsYXlHdWlkZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgbGlua0lEOiBudW1iZXIsXHJcbiAgICAgICAgZ3VpZGU6IElSZW5kZXJHdWlkZSxcclxuICAgICAgICByb290SUQ6IHN0cmluZ1xyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5saW5rSUQgPSBsaW5rSUQ7XHJcbiAgICAgICAgdGhpcy5ndWlkZSA9IGd1aWRlO1xyXG5cclxuICAgICAgICB0aGlzLnJvb3QgPSBuZXcgUmVuZGVyRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHJvb3RJRCxcclxuICAgICAgICAgICAgXCJndWlkZVJvb3RcIixcclxuICAgICAgICAgICAgdGhpcyxcclxuICAgICAgICAgICAgMFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGxpbmtJRDogbnVtYmVyO1xyXG4gICAgcHVibGljIGd1aWRlOiBJUmVuZGVyR3VpZGU7XHJcbiAgICBwdWJsaWMgb3V0bGluZTogSVJlbmRlck91dGxpbmUgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyByb290OiBJUmVuZGVyRnJhZ21lbnQ7XHJcbiAgICBwdWJsaWMgY3VycmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElSZW5kZXJHdWlkZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckd1aWRlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVuZGVyR3VpZGUgaW1wbGVtZW50cyBJUmVuZGVyR3VpZGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpZDogc3RyaW5nO1xyXG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmcgPSAnJztcclxuICAgIHB1YmxpYyBkZXNjcmlwdGlvbjogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgcGF0aDogc3RyaW5nID0gJyc7XHJcbiAgICBwdWJsaWMgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG59XHJcbiIsIlxyXG5leHBvcnQgZW51bSBTY3JvbGxIb3BUeXBlIHtcclxuICAgIE5vbmUgPSBcIm5vbmVcIixcclxuICAgIFVwID0gXCJ1cFwiLFxyXG4gICAgRG93biA9IFwiZG93blwiXHJcbn1cclxuIiwiaW1wb3J0IHsgU2Nyb2xsSG9wVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1Njcm9sbEhvcFR5cGVcIjtcclxuaW1wb3J0IElTY3JlZW4gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvd2luZG93L0lTY3JlZW5cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY3JlZW4gaW1wbGVtZW50cyBJU2NyZWVuIHtcclxuXHJcbiAgICBwdWJsaWMgYXV0b2ZvY3VzOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgaXNBdXRvZm9jdXNGaXJzdFJ1bjogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgaGlkZUJhbm5lcjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHNjcm9sbFRvVG9wOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgc2Nyb2xsVG9FbGVtZW50OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzY3JvbGxIb3A6IFNjcm9sbEhvcFR5cGUgPSBTY3JvbGxIb3BUeXBlLk5vbmU7XHJcbiAgICBwdWJsaWMgbGFzdFNjcm9sbFk6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHVibGljIHVhOiBhbnkgfCBudWxsID0gbnVsbDtcclxufVxyXG4iLCJpbXBvcnQgSVNjcmVlbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy93aW5kb3cvSVNjcmVlblwiO1xyXG5pbXBvcnQgSVRyZWVTb2x2ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy93aW5kb3cvSVRyZWVTb2x2ZVwiO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gXCIuL1NjcmVlblwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyZWVTb2x2ZSBpbXBsZW1lbnRzIElUcmVlU29sdmUge1xyXG5cclxuICAgIHB1YmxpYyByZW5kZXJpbmdDb21tZW50OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzY3JlZW46IElTY3JlZW4gPSBuZXcgU2NyZWVuKCk7XHJcbn1cclxuIiwiXHJcblxyXG5jb25zdCBnRmlsZUNvbnN0YW50cyA9IHtcclxuXHJcbiAgICBmcmFnbWVudHNGb2xkZXJTdWZmaXg6ICdfZnJhZ3MnLFxyXG4gICAgZnJhZ21lbnRGaWxlRXh0ZW5zaW9uOiAnLmh0bWwnLFxyXG4gICAgZ3VpZGVPdXRsaW5lRmlsZW5hbWU6ICdvdXRsaW5lLnRzb2xuJyxcclxuICAgIGd1aWRlUmVuZGVyQ29tbWVudFRhZzogJ3RzR3VpZGVSZW5kZXJDb21tZW50ICcsXHJcbiAgICBmcmFnbWVudFJlbmRlckNvbW1lbnRUYWc6ICd0c0ZyYWdtZW50UmVuZGVyQ29tbWVudCAnLFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZpbGVDb25zdGFudHM7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckd1aWRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyR3VpZGVcIjtcclxuaW1wb3J0IEZpbHRlcnMgZnJvbSBcIi4uLy4uL3N0YXRlL2NvbnN0YW50cy9GaWx0ZXJzXCI7XHJcbmltcG9ydCBEaXNwbGF5R3VpZGUgZnJvbSBcIi4uLy4uL3N0YXRlL2Rpc3BsYXkvRGlzcGxheUd1aWRlXCI7XHJcbmltcG9ydCBSZW5kZXJHdWlkZSBmcm9tIFwiLi4vLi4vc3RhdGUvcmVuZGVyL1JlbmRlckd1aWRlXCI7XHJcbmltcG9ydCBUcmVlU29sdmUgZnJvbSBcIi4uLy4uL3N0YXRlL3dpbmRvdy9UcmVlU29sdmVcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBwYXJzZUd1aWRlID0gKHJhd0d1aWRlOiBhbnkpOiBJUmVuZGVyR3VpZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IGd1aWRlOiBJUmVuZGVyR3VpZGUgPSBuZXcgUmVuZGVyR3VpZGUocmF3R3VpZGUuaWQpO1xyXG4gICAgZ3VpZGUudGl0bGUgPSByYXdHdWlkZS50aXRsZSA/PyAnJztcclxuICAgIGd1aWRlLmRlc2NyaXB0aW9uID0gcmF3R3VpZGUuZGVzY3JpcHRpb24gPz8gJyc7XHJcbiAgICBndWlkZS5wYXRoID0gcmF3R3VpZGUucGF0aCA/PyBudWxsO1xyXG4gICAgZ3VpZGUuZnJhZ21lbnRGb2xkZXJVcmwgPSBnUmVuZGVyQ29kZS5nZXRGcmFnbWVudEZvbGRlclVybChyYXdHdWlkZS5mcmFnbWVudEZvbGRlclBhdGgpO1xyXG5cclxuICAgIHJldHVybiBndWlkZTtcclxufTtcclxuXHJcbmNvbnN0IHBhcnNlUmVuZGVyaW5nQ29tbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByYXc6IGFueVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIXJhdykge1xyXG4gICAgICAgIHJldHVybiByYXc7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxue1xyXG4gICAgXCJndWlkZVwiOiB7XHJcbiAgICAgICAgXCJpZFwiOiBcImRCdDdKTjF2dFwiXHJcbiAgICB9LFxyXG4gICAgXCJmcmFnbWVudFwiOiB7XHJcbiAgICAgICAgXCJpZFwiOiBcImRCdDdKTjF2dFwiLFxyXG4gICAgICAgIFwidG9wTGV2ZWxNYXBLZXlcIjogXCJjdjFUUmwwMXJmXCIsXHJcbiAgICAgICAgXCJtYXBLZXlDaGFpblwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcImd1aWRlSURcIjogXCJkQnQ3Sk4xSGVcIixcclxuICAgICAgICBcImd1aWRlUGF0aFwiOiBcImM6L0dpdEh1Yi9URVNULkRvY3VtZW50YXRpb24vdHNtYXBzZGF0YU9wdGlvbnNGb2xkZXIvSG9sZGVyL2RhdGFPcHRpb25zLnRzbWFwXCIsXHJcbiAgICAgICAgXCJwYXJlbnRGcmFnbWVudElEXCI6IG51bGwsXHJcbiAgICAgICAgXCJjaGFydEtleVwiOiBcImN2MVRSbDAxcmZcIixcclxuICAgICAgICBcIm9wdGlvbnNcIjogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZEJ0N0taMUFOXCIsXHJcbiAgICAgICAgICAgICAgICBcIm9wdGlvblwiOiBcIk9wdGlvbiAxXCIsXHJcbiAgICAgICAgICAgICAgICBcImlzQW5jaWxsYXJ5XCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgXCJvcmRlclwiOiAxXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkQnQ3S1oxUmJcIixcclxuICAgICAgICAgICAgICAgIFwib3B0aW9uXCI6IFwiT3B0aW9uIDJcIixcclxuICAgICAgICAgICAgICAgIFwiaXNBbmNpbGxhcnlcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBcIm9yZGVyXCI6IDJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImRCdDdLWjI0QlwiLFxyXG4gICAgICAgICAgICAgICAgXCJvcHRpb25cIjogXCJPcHRpb24gM1wiLFxyXG4gICAgICAgICAgICAgICAgXCJpc0FuY2lsbGFyeVwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwib3JkZXJcIjogM1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG59ICAgIFxyXG4gICAgKi9cclxuXHJcbiAgICBjb25zdCBndWlkZSA9IHBhcnNlR3VpZGUocmF3Lmd1aWRlKTtcclxuXHJcbiAgICBjb25zdCBkaXNwbGF5R3VpZGUgPSBuZXcgRGlzcGxheUd1aWRlKFxyXG4gICAgICAgIGdTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpLFxyXG4gICAgICAgIGd1aWRlLFxyXG4gICAgICAgIHJhdy5mcmFnbWVudC5pZFxyXG4gICAgKTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEd1aWRlUm9vdEZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHJhdy5mcmFnbWVudCxcclxuICAgICAgICBkaXNwbGF5R3VpZGUucm9vdFxyXG4gICAgKTtcclxuXHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGUgPSBkaXNwbGF5R3VpZGU7XHJcbiAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5jdXJyZW50U2VjdGlvbiA9IGRpc3BsYXlHdWlkZTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmNhY2hlU2VjdGlvblJvb3QoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZ1JlbmRlckNvZGUgPSB7XHJcblxyXG4gICAgZ2V0RnJhZ21lbnRGb2xkZXJVcmw6IChmb2xkZXJQYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgbGV0IGRpdmlkZXIgPSAnJztcclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmb2xkZXJQYXRoKSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFsb2NhdGlvbi5vcmlnaW4uZW5kc1dpdGgoJy8nKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghZm9sZGVyUGF0aC5zdGFydHNXaXRoKCcvJykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGl2aWRlciA9ICcvJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChmb2xkZXJQYXRoLnN0YXJ0c1dpdGgoJy8nKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJQYXRoID0gZm9sZGVyUGF0aC5zdWJzdHJpbmcoMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBgJHtsb2NhdGlvbi5vcmlnaW59JHtkaXZpZGVyfSR7Zm9sZGVyUGF0aH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZ2lzdGVyR3VpZGVDb21tZW50OiAoKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHRyZWVTb2x2ZUd1aWRlOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKEZpbHRlcnMudHJlZVNvbHZlR3VpZGVJRCkgYXMgSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0cmVlU29sdmVHdWlkZVxyXG4gICAgICAgICAgICAmJiB0cmVlU29sdmVHdWlkZS5oYXNDaGlsZE5vZGVzKCkgPT09IHRydWVcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgbGV0IGNoaWxkTm9kZTogQ2hpbGROb2RlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2hpbGROb2RlID0gdHJlZVNvbHZlR3VpZGUuY2hpbGROb2Rlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLm5vZGVUeXBlID09PSBOb2RlLkNPTU1FTlRfTk9ERSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUgPSBuZXcgVHJlZVNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuVHJlZVNvbHZlLnJlbmRlcmluZ0NvbW1lbnQgPSBjaGlsZE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VSZW5kZXJpbmdDb21tZW50OiAoc3RhdGU6IElTdGF0ZSkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmU/LnJlbmRlcmluZ0NvbW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IGd1aWRlUmVuZGVyQ29tbWVudCA9IHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudDtcclxuICAgICAgICAgICAgZ3VpZGVSZW5kZXJDb21tZW50ID0gZ3VpZGVSZW5kZXJDb21tZW50LnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZ3VpZGVSZW5kZXJDb21tZW50LnN0YXJ0c1dpdGgoZ0ZpbGVDb25zdGFudHMuZ3VpZGVSZW5kZXJDb21tZW50VGFnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBndWlkZVJlbmRlckNvbW1lbnQgPSBndWlkZVJlbmRlckNvbW1lbnQuc3Vic3RyaW5nKGdGaWxlQ29uc3RhbnRzLmd1aWRlUmVuZGVyQ29tbWVudFRhZy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjb25zdCByYXcgPSBKU09OLnBhcnNlKGd1aWRlUmVuZGVyQ29tbWVudCk7XHJcblxyXG4gICAgICAgICAgICBwYXJzZVJlbmRlcmluZ0NvbW1lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJhd1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVnaXN0ZXJGcmFnbWVudENvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZW5kZXJDb2RlO1xyXG4iLCJpbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwbGF5Q2hhcnQgaW1wbGVtZW50cyBJRGlzcGxheUNoYXJ0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydFxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5saW5rSUQgPSBsaW5rSUQ7XHJcbiAgICAgICAgdGhpcy5jaGFydCA9IGNoYXJ0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsaW5rSUQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydDtcclxuICAgIHB1YmxpYyBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHJvb3Q6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIHBhcmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgY3VycmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lTZWdtZW50Tm9kZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYWluU2VnbWVudCBpbXBsZW1lbnRzIElDaGFpblNlZ21lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgc3RhcnQ6IElTZWdtZW50Tm9kZSxcclxuICAgICAgICBlbmQ6IElTZWdtZW50Tm9kZVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgICAgICB0aGlzLnRleHQgPSBgJHtzdGFydC50ZXh0fSR7ZW5kPy50ZXh0ID8/ICcnfWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluZGV4OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdGV4dDogc3RyaW5nO1xyXG4gICAgcHVibGljIG91dGxpbmVOb2RlczogQXJyYXk8SVJlbmRlck91dGxpbmVOb2RlPiA9IFtdO1xyXG4gICAgcHVibGljIG91dGxpbmVOb2Rlc0xvYWRlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHB1YmxpYyBzdGFydDogSVNlZ21lbnROb2RlO1xyXG4gICAgcHVibGljIGVuZDogSVNlZ21lbnROb2RlO1xyXG5cclxuICAgIHB1YmxpYyBzZWdtZW50SW5TZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24gfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzZWdtZW50U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2VnbWVudE91dFNlY3Rpb246IElEaXNwbGF5U2VjdGlvbiB8IG51bGwgPSBudWxsO1xyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcbmltcG9ydCBJU2VnbWVudE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSVNlZ21lbnROb2RlXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VnbWVudE5vZGUgaW1wbGVtZW50cyBJU2VnbWVudE5vZGV7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgdGV4dDogc3RyaW5nLFxyXG4gICAgICAgIGtleTogc3RyaW5nLFxyXG4gICAgICAgIHR5cGU6IE91dGxpbmVUeXBlLFxyXG4gICAgICAgIGlzUm9vdDogYm9vbGVhbixcclxuICAgICAgICBpc0xhc3Q6IGJvb2xlYW5cclxuICAgICkge1xyXG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLmlzUm9vdCA9IGlzUm9vdDtcclxuICAgICAgICB0aGlzLmlzTGFzdCA9IGlzTGFzdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGV4dDogc3RyaW5nO1xyXG4gICAgcHVibGljIGtleTogc3RyaW5nO1xyXG4gICAgcHVibGljIHR5cGU6IE91dGxpbmVUeXBlO1xyXG4gICAgcHVibGljIGlzUm9vdDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBpc0xhc3Q6IGJvb2xlYW47XHJcbn1cclxuXHJcbiIsImltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuaW1wb3J0IElEaXNwbGF5Q2hhcnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUNoYXJ0XCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lTZWdtZW50Tm9kZVwiO1xyXG5pbXBvcnQgQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9zdGF0ZS9zZWdtZW50cy9DaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IFNlZ21lbnROb2RlIGZyb20gXCIuLi8uLi9zdGF0ZS9zZWdtZW50cy9TZWdtZW50Tm9kZVwiO1xyXG5pbXBvcnQgZ1V0aWxpdGllcyBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuL2dTdGF0ZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBjaGVja0ZvckxpbmtFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgbGlua1NlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmIChzZWdtZW50LmVuZC5rZXkgIT09IGxpbmtTZWdtZW50LnN0YXJ0LmtleVxyXG4gICAgICAgIHx8IHNlZ21lbnQuZW5kLnR5cGUgIT09IGxpbmtTZWdtZW50LnN0YXJ0LnR5cGVcclxuICAgICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpbmsgc2VnbWVudCBzdGFydCBkb2VzIG5vdCBtYXRjaCBzZWdtZW50IGVuZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxpbmtTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsIC0gbGlua1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWxpbmtTZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIGxpbmtcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFsaW5rU2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IG91dCBzZWN0aW9uIHdhcyBudWxsIC0gbGlua1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rIGlLZXknKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGxpbmtTZWdtZW50LnN0YXJ0LnR5cGUgIT09IE91dGxpbmVUeXBlLkxpbmspIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBsaW5rJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBnZXRJZGVudGlmaWVyQ2hhcmFjdGVyID0gKGlkZW50aWZpZXJDaGFyOiBzdHJpbmcpOiB7IHR5cGU6IE91dGxpbmVUeXBlLCBpc0xhc3Q6IGJvb2xlYW4gfSA9PiB7XHJcblxyXG4gICAgbGV0IHN0YXJ0T3V0bGluZVR5cGU6IE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuICAgIGxldCBpc0xhc3QgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoaWRlbnRpZmllckNoYXIgPT09ICd+Jykge1xyXG5cclxuICAgICAgICBzdGFydE91dGxpbmVUeXBlID0gT3V0bGluZVR5cGUuTGluaztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGlkZW50aWZpZXJDaGFyID09PSAnXycpIHtcclxuXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lVHlwZSA9IE91dGxpbmVUeXBlLkV4aXQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpZGVudGlmaWVyQ2hhciA9PT0gJy0nKSB7XHJcblxyXG4gICAgICAgIHN0YXJ0T3V0bGluZVR5cGUgPSBPdXRsaW5lVHlwZS5Ob2RlO1xyXG4gICAgICAgIGlzTGFzdCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHF1ZXJ5IHN0cmluZyBvdXRsaW5lIG5vZGUgaWRlbnRpZmllcjogJHtpZGVudGlmaWVyQ2hhcn1gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IHN0YXJ0T3V0bGluZVR5cGUsXHJcbiAgICAgICAgaXNMYXN0OiBpc0xhc3RcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRLZXlFbmRJbmRleCA9IChyZW1haW5pbmdDaGFpbjogc3RyaW5nKTogeyBpbmRleDogbnVtYmVyLCBpc0xhc3Q6IGJvb2xlYW4gfCBudWxsIH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0S2V5RW5kSW5kZXggPSBVLmluZGV4T2ZBbnkoXHJcbiAgICAgICAgcmVtYWluaW5nQ2hhaW4sXHJcbiAgICAgICAgWyd+JywgJy0nLCAnXyddLFxyXG4gICAgICAgIDFcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHN0YXJ0S2V5RW5kSW5kZXggPT09IC0xKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGluZGV4OiByZW1haW5pbmdDaGFpbi5sZW5ndGgsXHJcbiAgICAgICAgICAgIGlzTGFzdDogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpbmRleDogc3RhcnRLZXlFbmRJbmRleCxcclxuICAgICAgICBpc0xhc3Q6IG51bGxcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBnZXRPdXRsaW5lVHlwZSA9IChyZW1haW5pbmdDaGFpbjogc3RyaW5nKTogeyB0eXBlOiBPdXRsaW5lVHlwZSwgaXNMYXN0OiBib29sZWFuIH0gPT4ge1xyXG5cclxuICAgIGNvbnN0IGlkZW50aWZpZXJDaGFyID0gcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKDAsIDEpO1xyXG4gICAgY29uc3Qgb3V0bGluZVR5cGUgPSBnZXRJZGVudGlmaWVyQ2hhcmFjdGVyKGlkZW50aWZpZXJDaGFyKTtcclxuXHJcbiAgICByZXR1cm4gb3V0bGluZVR5cGU7XHJcbn07XHJcblxyXG5jb25zdCBnZXROZXh0U2VnbWVudE5vZGUgPSAocmVtYWluaW5nQ2hhaW46IHN0cmluZyk6IHsgc2VnbWVudE5vZGU6IElTZWdtZW50Tm9kZSB8IG51bGwsIGVuZENoYWluOiBzdHJpbmcgfSA9PiB7XHJcblxyXG4gICAgbGV0IHNlZ21lbnROb2RlOiBJU2VnbWVudE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIGxldCBlbmRDaGFpbiA9IFwiXCI7XHJcblxyXG4gICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShyZW1haW5pbmdDaGFpbikpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZVR5cGUgPSBnZXRPdXRsaW5lVHlwZShyZW1haW5pbmdDaGFpbik7XHJcbiAgICAgICAgY29uc3Qga2V5RW5kOiB7IGluZGV4OiBudW1iZXIsIGlzTGFzdDogYm9vbGVhbiB8IG51bGwgfSA9IGdldEtleUVuZEluZGV4KHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICAgICAgY29uc3Qga2V5ID0gcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAxLFxyXG4gICAgICAgICAgICBrZXlFbmQuaW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzZWdtZW50Tm9kZSA9IG5ldyBTZWdtZW50Tm9kZShcclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW4uc3Vic3RyaW5nKDAsIGtleUVuZC5pbmRleCksXHJcbiAgICAgICAgICAgIGtleSxcclxuICAgICAgICAgICAgb3V0bGluZVR5cGUudHlwZSxcclxuICAgICAgICAgICAgZmFsc2UsXHJcbiAgICAgICAgICAgIG91dGxpbmVUeXBlLmlzTGFzdFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChrZXlFbmQuaXNMYXN0ID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBzZWdtZW50Tm9kZS5pc0xhc3QgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZW5kQ2hhaW4gPSByZW1haW5pbmdDaGFpbi5zdWJzdHJpbmcoa2V5RW5kLmluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNlZ21lbnROb2RlLFxyXG4gICAgICAgIGVuZENoYWluXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRTZWdtZW50ID0gKFxyXG4gICAgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+LFxyXG4gICAgcmVtYWluaW5nQ2hhaW46IHN0cmluZ1xyXG4pOiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfSA9PiB7XHJcblxyXG4gICAgY29uc3Qgc2VnbWVudFN0YXJ0ID0gZ2V0TmV4dFNlZ21lbnROb2RlKHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnRTdGFydC5zZWdtZW50Tm9kZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHN0YXJ0IG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtYWluaW5nQ2hhaW4gPSBzZWdtZW50U3RhcnQuZW5kQ2hhaW47XHJcbiAgICBjb25zdCBzZWdtZW50RW5kID0gZ2V0TmV4dFNlZ21lbnROb2RlKHJlbWFpbmluZ0NoYWluKTtcclxuXHJcbiAgICBpZiAoIXNlZ21lbnRFbmQuc2VnbWVudE5vZGUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBlbmQgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWdtZW50ID0gbmV3IENoYWluU2VnbWVudChcclxuICAgICAgICBzZWdtZW50cy5sZW5ndGgsXHJcbiAgICAgICAgc2VnbWVudFN0YXJ0LnNlZ21lbnROb2RlLFxyXG4gICAgICAgIHNlZ21lbnRFbmQuc2VnbWVudE5vZGVcclxuICAgICk7XHJcblxyXG4gICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlbWFpbmluZ0NoYWluLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFJvb3RTZWdtZW50ID0gKFxyXG4gICAgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+LFxyXG4gICAgcmVtYWluaW5nQ2hhaW46IHN0cmluZ1xyXG4pOiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfSA9PiB7XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnRTdGFydCA9IG5ldyBTZWdtZW50Tm9kZShcclxuICAgICAgICBcImd1aWRlUm9vdFwiLFxyXG4gICAgICAgICcnLFxyXG4gICAgICAgIE91dGxpbmVUeXBlLk5vZGUsXHJcbiAgICAgICAgdHJ1ZSxcclxuICAgICAgICBmYWxzZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCByb290U2VnbWVudEVuZCA9IGdldE5leHRTZWdtZW50Tm9kZShyZW1haW5pbmdDaGFpbik7XHJcblxyXG4gICAgaWYgKCFyb290U2VnbWVudEVuZC5zZWdtZW50Tm9kZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHN0YXJ0IG5vZGUgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBuZXcgQ2hhaW5TZWdtZW50KFxyXG4gICAgICAgIHNlZ21lbnRzLmxlbmd0aCxcclxuICAgICAgICByb290U2VnbWVudFN0YXJ0LFxyXG4gICAgICAgIHJvb3RTZWdtZW50RW5kLnNlZ21lbnROb2RlXHJcbiAgICApO1xyXG5cclxuICAgIHNlZ21lbnRzLnB1c2gocm9vdFNlZ21lbnQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVtYWluaW5nQ2hhaW4sXHJcbiAgICAgICAgc2VnbWVudDogcm9vdFNlZ21lbnRcclxuICAgIH07XHJcbn07XHJcblxyXG5jb25zdCBsb2FkU2VnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgc3RhcnRPdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IG51bGxcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgZ1NlZ21lbnRDb2RlLmxvYWRTZWdtZW50T3V0bGluZU5vZGVzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgc3RhcnRPdXRsaW5lTm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBuZXh0U2VnbWVudE91dGxpbmVOb2RlcyA9IHNlZ21lbnQub3V0bGluZU5vZGVzO1xyXG5cclxuICAgIGlmIChuZXh0U2VnbWVudE91dGxpbmVOb2Rlcy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpcnN0Tm9kZSA9IG5leHRTZWdtZW50T3V0bGluZU5vZGVzW25leHRTZWdtZW50T3V0bGluZU5vZGVzLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBpZiAoZmlyc3ROb2RlLmkgPT09IHNlZ21lbnQuc3RhcnQua2V5KSB7XHJcblxyXG4gICAgICAgICAgICBmaXJzdE5vZGUudHlwZSA9IHNlZ21lbnQuc3RhcnQudHlwZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxhc3ROb2RlID0gbmV4dFNlZ21lbnRPdXRsaW5lTm9kZXNbMF07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Tm9kZS5pID09PSBzZWdtZW50LmVuZC5rZXkpIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3ROb2RlLnR5cGUgPSBzZWdtZW50LmVuZC50eXBlO1xyXG4gICAgICAgICAgICBsYXN0Tm9kZS5pc0xhc3QgPSBzZWdtZW50LmVuZC5pc0xhc3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdGcmFnbWVudENvZGUubG9hZE5leHRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBnU2VnbWVudENvZGUgPSB7XHJcblxyXG4gICAgc2V0TmV4dFNlZ21lbnRTZWN0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGwsXHJcbiAgICAgICAgbGluazogSURpc3BsYXlDaGFydFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgIHx8ICFzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbc2VnbWVudEluZGV4IC0gMV07XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50c1tzZWdtZW50SW5kZXhdO1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gbGluazsgLy8gVGhpcyBjb3VsZCBiZSBzZXQgYWdhaW4gd2hlbiB0aGUgZW5kIG5vZGUgaXMgcHJvY2Vzc2VkXHJcblxyXG4gICAgICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRMaW5rU2VnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgbGlua1NlZ21lbnRJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIGxpbmtGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIGxpbms6IElEaXNwbGF5Q2hhcnRcclxuICAgICk6IElDaGFpblNlZ21lbnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG5cclxuICAgICAgICBpZiAobGlua1NlZ21lbnRJbmRleCA8IDEpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5kZXggPCAwJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50U2VnbWVudCA9IHNlZ21lbnRzW2xpbmtTZWdtZW50SW5kZXggLSAxXTtcclxuICAgICAgICBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbms7XHJcblxyXG4gICAgICAgIGlmIChsaW5rU2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tsaW5rU2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKCFuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmV4dCBsaW5rIHNlZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV4dFNlZ21lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGxpbms7XHJcbiAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24gPSBsaW5rO1xyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLm91dGxpbmU/LnIuaSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5leHQgc2VnbWVudCBzZWN0aW9uIHJvb3Qga2V5IHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHN0YXJ0T3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ub3V0bGluZT8uci5pIGFzIHN0cmluZ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxvYWRTZWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbmV4dFNlZ21lbnQsXHJcbiAgICAgICAgICAgIHN0YXJ0T3V0bGluZU5vZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjaGVja0ZvckxpbmtFcnJvcnMoXHJcbiAgICAgICAgICAgIGN1cnJlbnRTZWdtZW50LFxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudCxcclxuICAgICAgICAgICAgbGlua0ZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5leHRTZWdtZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRXhpdFNlZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIHBsdWdJRDogc3RyaW5nXHJcbiAgICApOiBJQ2hhaW5TZWdtZW50ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cztcclxuICAgICAgICBjb25zdCBjdXJyZW50U2VnbWVudCA9IHNlZ21lbnRzW3NlZ21lbnRJbmRleF07XHJcbiAgICAgICAgY29uc3QgZXhpdFNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XHJcblxyXG4gICAgICAgIGlmIChleGl0U2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXhpdFNlZ21lbnQgPSBzZWdtZW50c1tleGl0U2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKCFleGl0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhpdCBsaW5rIHNlZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZXhpdFNlZ21lbnQub3V0bGluZU5vZGVzTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZXhpdFNlZ21lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRTZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICAgICAgY29uc3QgbGluayA9IHNlZ21lbnRTZWN0aW9uLnBhcmVudDtcclxuXHJcbiAgICAgICAgaWYgKCFsaW5rKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMaW5rIGZyYWdtbnQgd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdXJyZW50U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IGxpbmsuc2VjdGlvbjtcclxuICAgICAgICBleGl0U2VnbWVudC5vdXRsaW5lTm9kZXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBjdXJyZW50U2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IGN1cnJlbnRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uO1xyXG4gICAgICAgIGV4aXRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gY3VycmVudFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcblxyXG4gICAgICAgIGlmICghZXhpdFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VnbWVudCBpbiBzZWN0aW9uIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXhpdE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBleGl0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQuc3RhcnQua2V5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFleGl0T3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4aXRPdXRsaW5lTm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShleGl0T3V0bGluZU5vZGUuX3gpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeGl0IGtleSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBsdWdPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZXhpdFNlZ21lbnQuc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBwbHVnSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoIXBsdWdPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGx1Z091dGxpbmVOb2RlIHdhcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV4aXRPdXRsaW5lTm9kZS5feCAhPT0gcGx1Z091dGxpbmVOb2RlLngpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsdWdPdXRsaW5lTm9kZSBkb2VzIG5vdCBtYXRjaCBleGl0T3V0bGluZU5vZGVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2FkU2VnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGV4aXRTZWdtZW50LFxyXG4gICAgICAgICAgICBwbHVnT3V0bGluZU5vZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZXhpdFNlZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWROZXh0U2VnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZWdtZW50Lm91dGxpbmVOb2Rlc0xvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnRJbmRleCA9IHNlZ21lbnQuaW5kZXggKyAxO1xyXG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgICAgIGlmIChuZXh0U2VnbWVudEluZGV4ID49IHNlZ21lbnRzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOZXh0IGluZGV4ID49IGFycmF5IGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tuZXh0U2VnbWVudEluZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKG5leHRTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5leHRTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uID0gc2VnbWVudC5zZWdtZW50U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50LnNlZ21lbnRPdXRTZWN0aW9uID0gc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbG9hZFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5leHRTZWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnZXROZXh0U2VnbWVudE91dGxpbmVOb2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50XHJcbiAgICApOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgbGV0IG91dGxpbmVOb2RlID0gc2VnbWVudC5vdXRsaW5lTm9kZXMucG9wKCkgPz8gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5pc0xhc3QgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzZWdtZW50Lm91dGxpbmVOb2Rlcy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5leHRTZWdtZW50ID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHNbc2VnbWVudC5pbmRleCArIDFdO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTmV4dFNlZ21lbnQgd2FzIG51bGwnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuZXh0U2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dFNlZ21lbnQuc2VnbWVudEluU2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmV4dFNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudE91dFNlY3Rpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRsaW5lTm9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VTZWdtZW50czogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcXVlcnlTdHJpbmc6IHN0cmluZ1xyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChxdWVyeVN0cmluZy5zdGFydHNXaXRoKCc/JykgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHF1ZXJ5U3RyaW5nID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGdVdGlsaXRpZXMuaXNOdWxsT3JXaGl0ZVNwYWNlKHF1ZXJ5U3RyaW5nKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWdtZW50czogQXJyYXk8SUNoYWluU2VnbWVudD4gPSBbXTtcclxuICAgICAgICBsZXQgcmVtYWluaW5nQ2hhaW4gPSBxdWVyeVN0cmluZztcclxuICAgICAgICBsZXQgcmVzdWx0OiB7IHJlbWFpbmluZ0NoYWluOiBzdHJpbmcsIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQgfTtcclxuXHJcbiAgICAgICAgcmVzdWx0ID0gYnVpbGRSb290U2VnbWVudChcclxuICAgICAgICAgICAgc2VnbWVudHMsXHJcbiAgICAgICAgICAgIHJlbWFpbmluZ0NoYWluXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgd2hpbGUgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShyZW1haW5pbmdDaGFpbikpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGJ1aWxkU2VnbWVudChcclxuICAgICAgICAgICAgICAgIHNlZ21lbnRzLFxyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW5cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc2VnbWVudC5lbmQuaXNMYXN0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVtYWluaW5nQ2hhaW4gPSByZXN1bHQucmVtYWluaW5nQ2hhaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5zZWdtZW50cyA9IHNlZ21lbnRzO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkU2VnbWVudE91dGxpbmVOb2RlczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgICAgICBzdGFydE91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUgfCBudWxsID0gbnVsbFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc2VnbWVudC5zZWdtZW50SW5TZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGluIHNlY3Rpb24gd2FzIG51bGxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnQuc2VnbWVudFNlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZWdtZW50T3V0bGluZU5vZGVzOiBBcnJheTxJUmVuZGVyT3V0bGluZU5vZGU+ID0gW107XHJcblxyXG4gICAgICAgIGlmICghc3RhcnRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgc3RhcnRPdXRsaW5lTm9kZSA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX291dGxpbmVOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LnNlZ21lbnRJblNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudC5zdGFydC5rZXlcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc3RhcnRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0YXJ0IG91dGxpbmUgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhcnRPdXRsaW5lTm9kZS50eXBlID0gc2VnbWVudC5zdGFydC50eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGVuZE91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWdtZW50LnNlZ21lbnRTZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgc2VnbWVudC5lbmQua2V5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFlbmRPdXRsaW5lTm9kZSkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW5kIG91dGxpbmUgbm9kZSB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVuZE91dGxpbmVOb2RlLnR5cGUgPSBzZWdtZW50LmVuZC50eXBlO1xyXG4gICAgICAgIGxldCBwYXJlbnQ6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwgPSBlbmRPdXRsaW5lTm9kZTtcclxuICAgICAgICBsZXQgZmlyc3RMb29wID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgd2hpbGUgKHBhcmVudCkge1xyXG5cclxuICAgICAgICAgICAgc2VnbWVudE91dGxpbmVOb2Rlcy5wdXNoKHBhcmVudCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZpcnN0TG9vcFxyXG4gICAgICAgICAgICAgICAgJiYgcGFyZW50Py5pc0NoYXJ0ID09PSB0cnVlXHJcbiAgICAgICAgICAgICAgICAmJiBwYXJlbnQ/LmlzUm9vdCA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocGFyZW50Py5pID09PSBzdGFydE91dGxpbmVOb2RlLmkpIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmaXJzdExvb3AgPSBmYWxzZTtcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlZ21lbnQub3V0bGluZU5vZGVzID0gc2VnbWVudE91dGxpbmVOb2RlcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1NlZ21lbnRDb2RlO1xyXG4iLCJpbXBvcnQgeyBQYXJzZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9QYXJzZVR5cGVcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZUNoYXJ0XCI7XHJcbmltcG9ydCBnT3V0bGluZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ091dGxpbmVDb2RlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4uL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi9jb2RlL2dTdGF0ZUNvZGVcIjtcclxuaW1wb3J0IGdGaWxlQ29uc3RhbnRzIGZyb20gXCIuLi9nRmlsZUNvbnN0YW50c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcblxyXG5cclxuY29uc3QgZ091dGxpbmVBY3Rpb25zID0ge1xyXG5cclxuICAgIGxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkR3VpZGVPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlclxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZFNlZ21lbnRDaGFydE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBzZWdtZW50SW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXMoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIGNoYXJ0LFxyXG4gICAgICAgICAgICBwYXJlbnRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEd1aWRlT3V0bGluZUFuZFNlZ21lbnRzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBwYXRoOiBzdHJpbmdcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZTtcclxuXHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByb290U2VnbWVudCA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzWzBdO1xyXG5cclxuICAgICAgICBpZiAoIXJvb3RTZWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybCA9IHNlY3Rpb24uZ3VpZGUuZnJhZ21lbnRGb2xkZXJVcmw7XHJcblxyXG4gICAgICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJvb3RTZWdtZW50LnNlZ21lbnRJblNlY3Rpb24gPSBzZWN0aW9uO1xyXG4gICAgICAgIHJvb3RTZWdtZW50LnNlZ21lbnRTZWN0aW9uID0gc2VjdGlvbjtcclxuICAgICAgICByb290U2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbiA9IHNlY3Rpb247XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkR3VpZGVPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgcGF0aFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdTZWdtZW50Q29kZS5sb2FkU2VnbWVudE91dGxpbmVOb2RlcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJvb3RTZWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3ROb2RlID0gZ1NlZ21lbnRDb2RlLmdldE5leHRTZWdtZW50T3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByb290U2VnbWVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChmaXJzdE5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGAke2ZyYWdtZW50Rm9sZGVyVXJsfS8ke2ZpcnN0Tm9kZS5pfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgICAgICByb290U2VnbWVudCxcclxuICAgICAgICAgICAgICAgICAgICBmaXJzdE5vZGVcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLkFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGBsb2FkQ2hhaW5GcmFnbWVudGAsXHJcbiAgICAgICAgICAgICAgICBQYXJzZVR5cGUuSnNvbixcclxuICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgIGxvYWREZWxlZ2F0ZVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZ1NlZ21lbnRDb2RlLmxvYWROZXh0U2VnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcm9vdFNlZ21lbnQsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdPdXRsaW5lQWN0aW9ucztcclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZVwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVDaGFydFwiO1xyXG5pbXBvcnQgSVJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IFJlbmRlck91dGxpbmUgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lXCI7XHJcbmltcG9ydCBSZW5kZXJPdXRsaW5lQ2hhcnQgZnJvbSBcIi4uLy4uL3N0YXRlL3JlbmRlci9SZW5kZXJPdXRsaW5lQ2hhcnRcIjtcclxuaW1wb3J0IFJlbmRlck91dGxpbmVOb2RlIGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyT3V0bGluZU5vZGVcIjtcclxuaW1wb3J0IGdGcmFnbWVudENvZGUgZnJvbSBcIi4vZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBnUmVuZGVyQ29kZSBmcm9tIFwiLi9nUmVuZGVyQ29kZVwiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCB7IFBhcnNlVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL1BhcnNlVHlwZVwiO1xyXG5pbXBvcnQgRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9zdGF0ZS9kaXNwbGF5L0Rpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSURpc3BsYXlTZWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlTZWN0aW9uXCI7XHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgZ091dGxpbmVBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL2dPdXRsaW5lQWN0aW9uc1wiO1xyXG5pbXBvcnQgeyBPdXRsaW5lVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL091dGxpbmVUeXBlXCI7XHJcbmltcG9ydCBnU2VnbWVudENvZGUgZnJvbSBcIi4vZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5cclxuXHJcbmNvbnN0IGNhY2hlTm9kZUZvck5ld0xpbmsgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGxpbmtJRDogbnVtYmVyLFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBnU3RhdGVDb2RlLmNhY2hlX291dGxpbmVOb2RlKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGxpbmtJRCxcclxuICAgICAgICBvdXRsaW5lTm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBvdXRsaW5lTm9kZS5vKSB7XHJcblxyXG4gICAgICAgIGNhY2hlTm9kZUZvck5ld0xpbmsoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgIGxpbmtJRFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBsb2FkTm9kZSA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICByYXdOb2RlOiBhbnksXHJcbiAgICBsaW5rSUQ6IG51bWJlcixcclxuICAgIHBhcmVudDogSVJlbmRlck91dGxpbmVOb2RlIHwgbnVsbCA9IG51bGxcclxuKTogSVJlbmRlck91dGxpbmVOb2RlID0+IHtcclxuXHJcbiAgICBjb25zdCBub2RlID0gbmV3IFJlbmRlck91dGxpbmVOb2RlKCk7XHJcbiAgICBub2RlLmkgPSByYXdOb2RlLmk7XHJcbiAgICBub2RlLmMgPSByYXdOb2RlLmMgPz8gbnVsbDtcclxuICAgIG5vZGUuX3ggPSByYXdOb2RlLl94ID8/IG51bGw7XHJcbiAgICBub2RlLnggPSByYXdOb2RlLnggPz8gbnVsbDtcclxuICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xyXG4gICAgbm9kZS50eXBlID0gT3V0bGluZVR5cGUuTm9kZTtcclxuXHJcbiAgICBnU3RhdGVDb2RlLmNhY2hlX291dGxpbmVOb2RlKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGxpbmtJRCxcclxuICAgICAgICBub2RlXHJcbiAgICApO1xyXG5cclxuICAgIGlmIChub2RlLmMpIHtcclxuXHJcbiAgICAgICAgbm9kZS50eXBlID0gT3V0bGluZVR5cGUuTGluaztcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmF3Tm9kZS5vXHJcbiAgICAgICAgJiYgQXJyYXkuaXNBcnJheShyYXdOb2RlLm8pID09PSB0cnVlXHJcbiAgICAgICAgJiYgcmF3Tm9kZS5vLmxlbmd0aCA+IDBcclxuICAgICkge1xyXG4gICAgICAgIGxldCBvOiBJUmVuZGVyT3V0bGluZU5vZGU7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHJhd05vZGUubykge1xyXG5cclxuICAgICAgICAgICAgbyA9IGxvYWROb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBsaW5rSUQsXHJcbiAgICAgICAgICAgICAgICBub2RlXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBub2RlLm8ucHVzaChvKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5vZGU7XHJcbn07XHJcblxyXG5jb25zdCBsb2FkQ2hhcnRzID0gKFxyXG4gICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICByYXdPdXRsaW5lQ2hhcnRzOiBBcnJheTxhbnk+XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIG91dGxpbmUuYyA9IFtdO1xyXG4gICAgbGV0IGM6IElSZW5kZXJPdXRsaW5lQ2hhcnQ7XHJcblxyXG4gICAgZm9yIChjb25zdCBjaGFydCBvZiByYXdPdXRsaW5lQ2hhcnRzKSB7XHJcblxyXG4gICAgICAgIGMgPSBuZXcgUmVuZGVyT3V0bGluZUNoYXJ0KCk7XHJcbiAgICAgICAgYy5pID0gY2hhcnQuaTtcclxuICAgICAgICBjLnAgPSBjaGFydC5wO1xyXG4gICAgICAgIG91dGxpbmUuYy5wdXNoKGMpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgZ091dGxpbmVDb2RlID0ge1xyXG5cclxuICAgIHJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICB1cmw6IHN0cmluZ1xyXG4gICAgKTogYm9vbGVhbiA9PiB7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5vdXRsaW5lVXJsc1t1cmxdID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmVVcmxzW3VybF0gPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueSxcclxuICAgICAgICBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nXHJcbiAgICApOiBJUmVuZGVyT3V0bGluZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rpc3BsYXlHdWlkZSB3YXMgbnVsbC4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGd1aWRlID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlO1xyXG4gICAgICAgIGNvbnN0IHJhd091dGxpbmUgPSBvdXRsaW5lUmVzcG9uc2UuanNvbkRhdGE7XHJcblxyXG4gICAgICAgIGNvbnN0IGd1aWRlT3V0bGluZSA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUubG9hZE91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgZ3VpZGVPdXRsaW5lLFxyXG4gICAgICAgICAgICBndWlkZS5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBndWlkZS5vdXRsaW5lID0gZ3VpZGVPdXRsaW5lO1xyXG4gICAgICAgIGd1aWRlT3V0bGluZS5yLmlzQ2hhcnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzZWdtZW50cyA9IHN0YXRlLnJlbmRlclN0YXRlLnNlZ21lbnRzO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCByb290U2VnbWVudCA9IHNlZ21lbnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgcm9vdFNlZ21lbnQuc3RhcnQua2V5ID0gZ3VpZGVPdXRsaW5lLnIuaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jYWNoZVNlY3Rpb25Sb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgZ3VpZGVcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoZ3VpZGVPdXRsaW5lLnIuYyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIExvYWQgb3V0bGluZSBmcm9tIHRoYXQgbG9jYXRpb24gYW5kIGxvYWQgcm9vdFxyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0IHwgbnVsbCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgICAgICAgICBndWlkZU91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICBndWlkZU91dGxpbmUuci5jXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBndWlkZVJvb3QgPSBndWlkZS5yb290O1xyXG5cclxuICAgICAgICAgICAgaWYgKCFndWlkZVJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjdXJyZW50IGZyYWdtZW50IHdhcyBudWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lRnJvbUNoYXJ0X3N1YnNjcmlwdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgICAgICAgICAgICAgZ3VpZGVSb290XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGd1aWRlLnJvb3QpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBndWlkZS5yb290XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ3VpZGVPdXRsaW5lO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRPdXRsaW5lQ2hhcnQ6IChcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBpbmRleDogbnVtYmVyXHJcbiAgICApOiBJUmVuZGVyT3V0bGluZUNoYXJ0IHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lLmMubGVuZ3RoID4gaW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBvdXRsaW5lLmNbaW5kZXhdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkRGlzcGxheUNoYXJ0RnJvbVJhd091dGxpbmU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHJhd091dGxpbmU6IGFueSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IElEaXNwbGF5Q2hhcnQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rID0gbmV3IERpc3BsYXlDaGFydChcclxuICAgICAgICAgICAgZ1N0YXRlQ29kZS5nZXRGcmVzaEtleUludChzdGF0ZSksXHJcbiAgICAgICAgICAgIGNoYXJ0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmxvYWRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIGxpbmsubGlua0lEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGluay5vdXRsaW5lID0gb3V0bGluZTtcclxuICAgICAgICBsaW5rLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICBwYXJlbnQubGluayA9IGxpbms7XHJcblxyXG4gICAgICAgIHJldHVybiBsaW5rO1xyXG4gICAgfSxcclxuXHJcbiAgICBidWlsZERpc3BsYXlDaGFydEZyb21PdXRsaW5lRm9yTmV3TGluazogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICApOiBJRGlzcGxheUNoYXJ0ID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgbGluayA9IG5ldyBEaXNwbGF5Q2hhcnQoXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuZ2V0RnJlc2hLZXlJbnQoc3RhdGUpLFxyXG4gICAgICAgICAgICBjaGFydFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5sb2FkT3V0bGluZVByb3BlcnRpZXNGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgbGluay5saW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsaW5rLm91dGxpbmUgPSBvdXRsaW5lO1xyXG4gICAgICAgIGxpbmsucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIHBhcmVudC5saW5rID0gbGluaztcclxuXHJcbiAgICAgICAgcmV0dXJuIGxpbms7XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRTZWdtZW50Q2hhcnRPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgb3V0bGluZTogSVJlbmRlck91dGxpbmUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQsXHJcbiAgICAgICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgc2VnbWVudEluZGV4OiBudW1iZXJcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAocGFyZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTGluayBhbHJlYWR5IGxvYWRlZCwgcm9vdElEOiAke3BhcmVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmF3T3V0bGluZSA9IG91dGxpbmVSZXNwb25zZS5qc29uRGF0YTtcclxuXHJcbiAgICAgICAgY29uc3QgbGluayA9IGdPdXRsaW5lQ29kZS5idWlsZERpc3BsYXlDaGFydEZyb21SYXdPdXRsaW5lKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgIHJhd091dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIHBhcmVudFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdTZWdtZW50Q29kZS5sb2FkTGlua1NlZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWdtZW50SW5kZXgsXHJcbiAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5zZXRDaGFydEFzQ3VycmVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNhY2hlU2VjdGlvblJvb3QoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZENoYXJ0T3V0bGluZVByb3BlcnRpZXM6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGNoYXJ0OiBJUmVuZGVyT3V0bGluZUNoYXJ0LFxyXG4gICAgICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBMaW5rIGFscmVhZHkgbG9hZGVkLCByb290SUQ6ICR7cGFyZW50Lmxpbmsucm9vdD8uaWR9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByYXdPdXRsaW5lID0gb3V0bGluZVJlc3BvbnNlLmpzb25EYXRhO1xyXG5cclxuICAgICAgICBjb25zdCBsaW5rID0gZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbVJhd091dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBjaGFydCxcclxuICAgICAgICAgICAgcmF3T3V0bGluZSxcclxuICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgcGFyZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jYWNoZVNlY3Rpb25Sb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIE5lZWQgdG8gYnVpbGQgYSBkaXNwbGF5Q0hhcnQgaGVyZVxyXG4gICAgICAgIGdPdXRsaW5lQ29kZS5zZXRDaGFydEFzQ3VycmVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGxpbmtcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBnT3V0bGluZUNvZGUucG9zdEdldENoYXJ0T3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHBvc3RHZXRDaGFydE91dGxpbmVSb290X3N1YnNjcmlwdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHNlY3Rpb24ucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgKCFzZWN0aW9uLnJvb3QudWkuZGlzY3Vzc2lvbkxvYWRlZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gICAgIHRocm93IG5ldyBFcnJvcignU2VjdGlvbiByb290IGRpc2N1c3Npb24gd2FzIG5vdCBsb2FkZWQnKTtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZSA9IHNlY3Rpb24ub3V0bGluZTtcclxuXHJcbiAgICAgICAgaWYgKCFvdXRsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY3Rpb24gb3V0bGluZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgcm9vdEZyYWdtZW5JRCA9IG91dGxpbmUuci5pO1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSBvdXRsaW5lLnBhdGg7XHJcbiAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtwYXRofS8ke3Jvb3RGcmFnbWVuSUR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbiA9IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5sb2FkUm9vdEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgc2VjdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGBsb2FkQ2hhcnRPdXRsaW5lUm9vdGAsXHJcbiAgICAgICAgICAgIFBhcnNlVHlwZS5UZXh0LFxyXG4gICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIGxvYWRBY3Rpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDaGFydEFzQ3VycmVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZGlzcGxheVNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLmN1cnJlbnRTZWN0aW9uID0gZGlzcGxheVNlY3Rpb247XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE91dGxpbmU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50Rm9sZGVyVXJsOiBzdHJpbmdcclxuICAgICk6IElSZW5kZXJPdXRsaW5lID0+IHtcclxuXHJcbiAgICAgICAgbGV0IG91dGxpbmU6IElSZW5kZXJPdXRsaW5lID0gc3RhdGUucmVuZGVyU3RhdGUub3V0bGluZXNbZnJhZ21lbnRGb2xkZXJVcmxdO1xyXG5cclxuICAgICAgICBpZiAob3V0bGluZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG91dGxpbmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvdXRsaW5lID0gbmV3IFJlbmRlck91dGxpbmUoZnJhZ21lbnRGb2xkZXJVcmwpO1xyXG4gICAgICAgIHN0YXRlLnJlbmRlclN0YXRlLm91dGxpbmVzW2ZyYWdtZW50Rm9sZGVyVXJsXSA9IG91dGxpbmU7XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRsaW5lO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmFnbWVudExpbmtDaGFydE91dGxpbmU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lID0gZnJhZ21lbnQuc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBmcmFnbWVudC5pZFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZT8uYyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlPy5jXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFNlZ21lbnRPdXRsaW5lX3N1YnNjcmlwdGlvbjogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgY2hhcnQ6IElSZW5kZXJPdXRsaW5lQ2hhcnQgfCBudWxsLFxyXG4gICAgICAgIGxpbmtGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHNlZ21lbnRJbmRleDogbnVtYmVyXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFjaGFydCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPdXRsaW5lQ2hhcnQgd2FzIG51bGwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChsaW5rRnJhZ21lbnQubGluaz8ucm9vdCkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYExpbmsgcm9vdCBhbHJlYWR5IGxvYWRlZDogJHtsaW5rRnJhZ21lbnQubGluay5yb290Py5pZH1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXh0U2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4O1xyXG5cclxuICAgICAgICBpZiAobmV4dFNlZ21lbnRJbmRleCAhPSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBuZXh0U2VnbWVudEluZGV4Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRsaW5lQ2hhcnRQYXRoID0gY2hhcnQ/LnAgYXMgc3RyaW5nO1xyXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Rm9sZGVyVXJsID0gZ1JlbmRlckNvZGUuZ2V0RnJhZ21lbnRGb2xkZXJVcmwob3V0bGluZUNoYXJ0UGF0aCkgYXMgc3RyaW5nO1xyXG5cclxuICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50Rm9sZGVyVXJsKSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0bGluZSA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKG91dGxpbmUubG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFsaW5rRnJhZ21lbnQubGluaykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5rID0gZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGdTZWdtZW50Q29kZS5zZXROZXh0U2VnbWVudFNlY3Rpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0U2VnbWVudEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuc2V0Q2hhcnRBc0N1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0ZyYWdtZW50LmxpbmsgYXMgSURpc3BsYXlTZWN0aW9uXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtnRmlsZUNvbnN0YW50cy5ndWlkZU91dGxpbmVGaWxlbmFtZX1gO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRSZXF1ZXN0ZWQgPSBnT3V0bGluZUNvZGUucmVnaXN0ZXJPdXRsaW5lVXJsRG93bmxvYWQoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsb2FkUmVxdWVzdGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBgbG9hZENoYWluQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFydE91dGxpbmVGaWxlYDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2U6IGFueVxyXG4gICAgICAgICAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ091dGxpbmVBY3Rpb25zLmxvYWRTZWdtZW50Q2hhcnRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFNlZ21lbnRJbmRleFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBjaGFydDogSVJlbmRlck91dGxpbmVDaGFydCB8IG51bGwsXHJcbiAgICAgICAgbGlua0ZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWNoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ091dGxpbmVDaGFydCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxpbmtGcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTGluayByb290IGFscmVhZHkgbG9hZGVkOiAke2xpbmtGcmFnbWVudC5saW5rLnJvb3Q/LmlkfWApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZUNoYXJ0UGF0aCA9IGNoYXJ0Py5wIGFzIHN0cmluZztcclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybCA9IGdSZW5kZXJDb2RlLmdldEZyYWdtZW50Rm9sZGVyVXJsKG91dGxpbmVDaGFydFBhdGgpIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmUgPSBnT3V0bGluZUNvZGUuZ2V0T3V0bGluZShcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRGb2xkZXJVcmxcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvdXRsaW5lLmxvYWRlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbGlua0ZyYWdtZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLmJ1aWxkRGlzcGxheUNoYXJ0RnJvbU91dGxpbmVGb3JOZXdMaW5rKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZ091dGxpbmVDb2RlLnNldENoYXJ0QXNDdXJyZW50KFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudC5saW5rIGFzIElEaXNwbGF5U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUucG9zdEdldENoYXJ0T3V0bGluZVJvb3Rfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudC5saW5rIGFzIElEaXNwbGF5U2VjdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2FkUmVxdWVzdGVkID0gZ091dGxpbmVDb2RlLnJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobG9hZFJlcXVlc3RlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5yZW5kZXJTdGF0ZS5pc0NoYWluTG9hZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gYGxvYWRDaGFpbkNoYXJ0T3V0bGluZUZpbGVgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGBsb2FkQ2hhcnRPdXRsaW5lRmlsZWA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9hZERlbGVnYXRlID0gKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICAgICAgICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdPdXRsaW5lQWN0aW9ucy5sb2FkQ2hhcnRPdXRsaW5lUHJvcGVydGllcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtGcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGdTdGF0ZUNvZGUuQWRkUmVMb2FkRGF0YUVmZmVjdEltbWVkaWF0ZShcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIFBhcnNlVHlwZS5Kc29uLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAgICAgICAgICBsb2FkRGVsZWdhdGVcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGxvYWRPdXRsaW5lUHJvcGVydGllczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmF3T3V0bGluZTogYW55LFxyXG4gICAgICAgIG91dGxpbmU6IElSZW5kZXJPdXRsaW5lLFxyXG4gICAgICAgIGxpbmtJRDogbnVtYmVyXHJcbiAgICApOiBJUmVuZGVyT3V0bGluZSA9PiB7XHJcblxyXG4gICAgICAgIG91dGxpbmUudiA9IHJhd091dGxpbmUudjtcclxuXHJcbiAgICAgICAgaWYgKHJhd091dGxpbmUuY1xyXG4gICAgICAgICAgICAmJiBBcnJheS5pc0FycmF5KHJhd091dGxpbmUuYykgPT09IHRydWVcclxuICAgICAgICAgICAgJiYgcmF3T3V0bGluZS5jLmxlbmd0aCA+IDBcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgbG9hZENoYXJ0cyhcclxuICAgICAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgICAgICByYXdPdXRsaW5lLmNcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyYXdPdXRsaW5lLmUpIHtcclxuXHJcbiAgICAgICAgICAgIG91dGxpbmUuZSA9IHJhd091dGxpbmUuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG91dGxpbmUuciA9IGxvYWROb2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3T3V0bGluZS5yLFxyXG4gICAgICAgICAgICBsaW5rSURcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBvdXRsaW5lLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgb3V0bGluZS5yLmlzUm9vdCA9IHRydWU7XHJcbiAgICAgICAgb3V0bGluZS5tdiA9IHJhd091dGxpbmUubXY7XHJcblxyXG4gICAgICAgIHJldHVybiBvdXRsaW5lO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkT3V0bGluZVByb3BlcnRpZXNGb3JOZXdMaW5rOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvdXRsaW5lOiBJUmVuZGVyT3V0bGluZSxcclxuICAgICAgICBsaW5rSUQ6IG51bWJlclxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNhY2hlTm9kZUZvck5ld0xpbmsoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvdXRsaW5lLnIsXHJcbiAgICAgICAgICAgIGxpbmtJRFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnT3V0bGluZUNvZGU7XHJcblxyXG4iLCJcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL2VudW1zL0FjdGlvblR5cGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IHsgSUh0dHBGZXRjaEl0ZW0gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9odHRwL0lIdHRwRmV0Y2hJdGVtXCI7XHJcbmltcG9ydCB7IGdBdXRoZW50aWNhdGVkSHR0cCB9IGZyb20gXCIuLi9odHRwL2dBdXRoZW50aWNhdGlvbkh0dHBcIjtcclxuaW1wb3J0IGdBamF4SGVhZGVyQ29kZSBmcm9tIFwiLi4vaHR0cC9nQWpheEhlYWRlckNvZGVcIjtcclxuaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ0ZyYWdtZW50QWN0aW9uc1wiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuXHJcblxyXG5jb25zdCBnZXRGcmFnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBmcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICBmcmFnbWVudFBhdGg6IHN0cmluZyxcclxuICAgIGFjdGlvbjogQWN0aW9uVHlwZSxcclxuICAgIGxvYWRBY3Rpb246IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhbGxJRDogc3RyaW5nID0gVS5nZW5lcmF0ZUd1aWQoKTtcclxuXHJcbiAgICBsZXQgaGVhZGVycyA9IGdBamF4SGVhZGVyQ29kZS5idWlsZEhlYWRlcnMoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgY2FsbElELFxyXG4gICAgICAgIGFjdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCB1cmw6IHN0cmluZyA9IGAke2ZyYWdtZW50UGF0aH1gO1xyXG5cclxuICAgIHJldHVybiBnQXV0aGVudGljYXRlZEh0dHAoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIHBhcnNlVHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNwb25zZTogJ3RleHQnLFxyXG4gICAgICAgIGFjdGlvbjogbG9hZEFjdGlvbixcclxuICAgICAgICBlcnJvcjogKHN0YXRlOiBJU3RhdGUsIGVycm9yRGV0YWlsczogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhge1xyXG4gICAgICAgICAgICAgICAgXCJtZXNzYWdlXCI6IFwiRXJyb3IgZ2V0dGluZyBmcmFnbWVudCBmcm9tIHRoZSBzZXJ2ZXIsIHBhdGg6ICR7ZnJhZ21lbnRQYXRofSwgaWQ6ICR7ZnJhZ21lbnRJRH1cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnZXRGcmFnbWVudH0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBnZXR0aW5nIGZyYWdtZW50IGZyb20gdGhlIHNlcnZlciwgcGF0aDogJHtmcmFnbWVudFBhdGh9LCBpZDogJHtmcmFnbWVudElEfVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1cmxcIjogJHt1cmx9LFxyXG4gICAgICAgICAgICAgICAgXCJlcnJvciBEZXRhaWxzXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzKX0sXHJcbiAgICAgICAgICAgICAgICBcInN0YWNrXCI6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3JEZXRhaWxzLnN0YWNrKX0sXHJcbiAgICAgICAgICAgICAgICBcIm1ldGhvZFwiOiAke2dldEZyYWdtZW50Lm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgZ0ZyYWdtZW50RWZmZWN0cyA9IHtcclxuXHJcbiAgICBnZXRGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgZnJhZ21lbnRQYXRoOiBzdHJpbmdcclxuICAgICk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgbG9hZEFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIHJlc3BvbnNlOiBhbnkpID0+IElTdGF0ZSA9IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IGdGcmFnbWVudEFjdGlvbnMubG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgbmV3U3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3U3RhdGU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uLmlkLFxyXG4gICAgICAgICAgICBmcmFnbWVudFBhdGgsXHJcbiAgICAgICAgICAgIEFjdGlvblR5cGUuR2V0RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGxvYWRBY3Rpb25cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZyYWdtZW50RWZmZWN0cztcclxuIiwiaW1wb3J0IHsgT3V0bGluZVR5cGUgfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9PdXRsaW5lVHlwZVwiO1xyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElEaXNwbGF5U2VjdGlvbiBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5U2VjdGlvblwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJUmVuZGVyT3V0bGluZU5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJPdXRsaW5lTm9kZVwiO1xyXG5pbXBvcnQgSUNoYWluU2VnbWVudCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9zZWdtZW50cy9JQ2hhaW5TZWdtZW50XCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi9jb2RlL2dGcmFnbWVudENvZGVcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi4vY29kZS9nT3V0bGluZUNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi4vY29kZS9nU2VnbWVudENvZGVcIjtcclxuaW1wb3J0IGdTdGF0ZUNvZGUgZnJvbSBcIi4uL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50RWZmZWN0cyBmcm9tIFwiLi4vZWZmZWN0cy9nRnJhZ21lbnRFZmZlY3RzXCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IFUgZnJvbSBcIi4uL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5jb25zdCBnZXRGcmFnbWVudEZpbGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIHN0YXRlLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgd2luZG93LlRyZWVTb2x2ZS5zY3JlZW4uaGlkZUJhbm5lciA9IHRydWU7XHJcbiAgICBjb25zdCBmcmFnbWVudFBhdGggPSBgJHtvcHRpb24uc2VjdGlvbj8ub3V0bGluZT8ucGF0aH0vJHtvcHRpb24uaWR9JHtnRmlsZUNvbnN0YW50cy5mcmFnbWVudEZpbGVFeHRlbnNpb259YDtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGdGcmFnbWVudEVmZmVjdHMuZ2V0RnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgIGZyYWdtZW50UGF0aFxyXG4gICAgICAgIClcclxuICAgIF07XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzQ2hhaW5GcmFnbWVudFR5cGUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbFxyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgIGlmIChvdXRsaW5lTm9kZS5pICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGlkIGFuZCBvdXRsaW5lIGZyYWdtZW50IGlkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3V0bGluZU5vZGUudHlwZSA9PT0gT3V0bGluZVR5cGUuTGluaykge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0xpbmsoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG91dGxpbmVOb2RlLnR5cGUgPT09IE91dGxpbmVUeXBlLkV4aXQpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NFeGl0KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChvdXRsaW5lTm9kZS5pc0NoYXJ0ID09PSB0cnVlXHJcbiAgICAgICAgICAgICYmIG91dGxpbmVOb2RlLmlzUm9vdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0NoYXJ0Um9vdChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG91dGxpbmVOb2RlLmlzTGFzdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgcHJvY2Vzc0xhc3QoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG91dGxpbmVOb2RlLnR5cGUgPT09IE91dGxpbmVUeXBlLk5vZGUpIHtcclxuXHJcbiAgICAgICAgICAgIHByb2Nlc3NOb2RlKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGZyYWdtZW50IHR5cGUuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JMYXN0RnJhZ21lbnRFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIGxhc3RcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjaGVja0Zvck5vZGVFcnJvcnMgPSAoXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFzZWdtZW50LnNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlZ21lbnQgc2VjdGlvbiB3YXMgbnVsbCAtIG5vZGVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgbm9kZSAtIGxpbmsnKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pRXhpdEtleSkpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIG5vZGUgLSBleGl0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG91dGxpbmVOb2RlLmkgIT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBvdXRsaW5lIG5vZGUgaWQgYW5kIGZyYWdtZW50IGlkJyk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBjaGVja0ZvckNoYXJ0Um9vdEVycm9ycyA9IChcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSByb290XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUtleSkpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIHJvb3QgLSBsaW5rJyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuaUV4aXRLZXkpKSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWlzbWF0Y2ggYmV0d2VlbiBmcmFnbWVudCBhbmQgb3V0bGluZSByb290IC0gZXhpdCcpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JFeGl0RXJyb3JzID0gKFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBleGl0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc2VnbWVudC5zZWdtZW50T3V0U2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IG91dCBzZWN0aW9uIHdhcyBudWxsIC0gZXhpdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIGZyYWdtZW50IGFuZCBvdXRsaW5lIC0gZXhpdCcpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoc2VnbWVudC5lbmQudHlwZSAhPT0gT3V0bGluZVR5cGUuRXhpdCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc21hdGNoIGJldHdlZW4gZnJhZ21lbnQgYW5kIG91dGxpbmUgbm9kZSAtIGV4aXQnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIG91dGxpbmUgbm9kZSBpZCBhbmQgZnJhZ21lbnQgaWQnKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NDaGFydFJvb3QgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JDaGFydFJvb3RFcnJvcnMoXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLmxvYWROZXh0Q2hhaW5GcmFnbWVudChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50XHJcbiAgICApO1xyXG5cclxuICAgIHNldExpbmtzUm9vdChcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgIGZyYWdtZW50XHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3Qgc2V0TGlua3NSb290ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IGluU2VjdGlvbiA9IHNlZ21lbnQuc2VnbWVudEluU2VjdGlvbjtcclxuXHJcbiAgICBpZiAoIWluU2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IGluIHNlY3Rpb24gd2FzIG51bGwgLSBjaGFydCByb290XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG5cclxuICAgIGlmICghc2VjdGlvbikge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gd2FzIG51bGwgLSBjaGFydCByb290XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGluU2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgc2VnbWVudC5zdGFydC5rZXlcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHBhcmVudD8ubGluaykge1xyXG5cclxuICAgICAgICBpZiAocGFyZW50LmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGFuZCBGcmFnbWVudCBhcmUgdGhlIHNhbWVcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJlbnQubGluay5yb290ID0gZnJhZ21lbnQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50RnJhZ21lbnQgd2FzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VjdGlvbi5jdXJyZW50ID0gZnJhZ21lbnQ7XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzTm9kZSA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JOb2RlRXJyb3JzKFxyXG4gICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgZ0ZyYWdtZW50Q29kZS5sb2FkTmV4dENoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBwcm9jZXNzRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzTGFzdCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSxcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY2hlY2tGb3JMYXN0RnJhZ21lbnRFcnJvcnMoXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICBmcmFnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBwcm9jZXNzRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgZnJhZ21lbnQubGluayA9IG51bGw7XHJcbiAgICBmcmFnbWVudC5zZWxlY3RlZCA9IG51bGw7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50Lm9wdGlvbnM/Lmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWlzKHN0YXRlKTtcclxuICAgICAgICBmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NMaW5rID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICBvdXRsaW5lTm9kZTogSVJlbmRlck91dGxpbmVOb2RlLFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaSAhPT0gZnJhZ21lbnQuaWQpIHtcclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNtYXRjaCBiZXR3ZWVuIG91dGxpbmUgbm9kZSBpZCBhbmQgZnJhZ21lbnQgaWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdXRsaW5lID0gZnJhZ21lbnQuc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgIGlmICghb3V0bGluZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGU/LmMgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUuaXNSb290ID09PSB0cnVlXHJcbiAgICAgICAgJiYgb3V0bGluZU5vZGUuaXNDaGFydCA9PT0gdHJ1ZVxyXG4gICAgKSB7XHJcbiAgICAgICAgc2V0TGlua3NSb290KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgb3V0bGluZSxcclxuICAgICAgICBvdXRsaW5lTm9kZT8uY1xyXG4gICAgKTtcclxuXHJcbiAgICBnT3V0bGluZUNvZGUuZ2V0U2VnbWVudE91dGxpbmVfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVDaGFydCxcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBzZWdtZW50LmluZGV4XHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0V4aXQgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc2VnbWVudDogSUNoYWluU2VnbWVudCxcclxuICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGUsXHJcbiAgICBleGl0RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjaGVja0ZvckV4aXRFcnJvcnMoXHJcbiAgICAgICAgc2VnbWVudCxcclxuICAgICAgICBvdXRsaW5lTm9kZSxcclxuICAgICAgICBleGl0RnJhZ21lbnRcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgc2VjdGlvbjogSURpc3BsYXlDaGFydCA9IGV4aXRGcmFnbWVudC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQ7XHJcbiAgICBjb25zdCBzZWN0aW9uUGFyZW50ID0gc2VjdGlvbi5wYXJlbnQ7XHJcblxyXG4gICAgaWYgKCFzZWN0aW9uUGFyZW50KSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIklEaXNwbGF5Q2hhcnQgcGFyZW50IGlzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaUV4aXRLZXkgPSBleGl0RnJhZ21lbnQuZXhpdEtleTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBzZWN0aW9uUGFyZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi5pRXhpdEtleSA9PT0gaUV4aXRLZXkpIHtcclxuXHJcbiAgICAgICAgICAgIGdTZWdtZW50Q29kZS5sb2FkRXhpdFNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQuaW5kZXgsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24uaWRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUuc2V0Q3VycmVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZXhpdEZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgbG9hZEZyYWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4pOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0+IHtcclxuXHJcbiAgICBjb25zdCBwYXJlbnRGcmFnbWVudElEID0gb3B0aW9uLnBhcmVudEZyYWdtZW50SUQgYXMgc3RyaW5nO1xyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShwYXJlbnRGcmFnbWVudElEKSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnQgZnJhZ21lbnQgSUQgaXMgbnVsbFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZW5kZXJGcmFnbWVudCA9IGdGcmFnbWVudENvZGUucGFyc2VBbmRMb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2UudGV4dERhdGEsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICBvcHRpb24uaWQsXHJcbiAgICAgICAgb3B0aW9uLnNlY3Rpb25cclxuICAgICk7XHJcblxyXG4gICAgc3RhdGUubG9hZGluZyA9IGZhbHNlO1xyXG5cclxuICAgIHJldHVybiByZW5kZXJGcmFnbWVudDtcclxufTtcclxuXHJcbmNvbnN0IHByb2Nlc3NGcmFnbWVudCA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGV4cGFuZGVkT3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBsZXQgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50LnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgIGZyYWdtZW50LnBhcmVudEZyYWdtZW50SURcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFwYXJlbnRGcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBwYXJlbnRGcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb24uaWQgPT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICBleHBhbmRlZE9wdGlvbiA9IG9wdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZXhwYW5kZWRPcHRpb24pIHtcclxuXHJcbiAgICAgICAgZXhwYW5kZWRPcHRpb24udWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnNob3dPcHRpb25Ob2RlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcGFyZW50RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIGV4cGFuZGVkT3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGdGcmFnbWVudEFjdGlvbnMgPSB7XHJcblxyXG4gICAgc2hvd0FuY2lsbGFyeU5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIC8vIHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgLy8gaWYgKGFuY2lsbGFyeS51aS5kaXNjdXNzaW9uTG9hZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIC8vICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAvLyAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgIC8vICAgICAgICAgYW5jaWxsYXJ5XHJcbiAgICAgICAgLy8gICAgICk7XHJcblxyXG4gICAgICAgIC8vICAgICBpZiAoIWFuY2lsbGFyeS5saW5rKSB7XHJcblxyXG4gICAgICAgIC8vICAgICAgICAgZ091dGxpbmVDb2RlLmdldEZyYWdtZW50TGlua0NoYXJ0T3V0bGluZShcclxuICAgICAgICAvLyAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAvLyAgICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICAvLyAgICAgICAgICk7XHJcbiAgICAgICAgLy8gICAgIH1cclxuXHJcbiAgICAgICAgLy8gICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEZyYWdtZW50RmlsZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGFuY2lsbGFyeVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3dPcHRpb25Ob2RlOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGZvciAoY29uc3QgY2hpbGQgb2YgcGFyZW50RnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAvLyAgICAgY2hpbGQudWkuZGlzY3Vzc2lvbkxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5jbGVhclBhcmVudFNlY3Rpb25TZWxlY3RlZChwYXJlbnRGcmFnbWVudC5zZWN0aW9uKTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyT3JwaGFuZWRTdGVwcyhwYXJlbnRGcmFnbWVudCk7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUucHJlcGFyZVRvU2hvd09wdGlvbk5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBpZiAob3B0aW9uLnVpLmRpc2N1c3Npb25Mb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgLy8gICAgIGdGcmFnbWVudENvZGUuYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uKFxyXG4gICAgICAgIC8vICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgLy8gICAgICAgICBvcHRpb25cclxuICAgICAgICAvLyAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gICAgIGlmICghb3B0aW9uLmxpbmspIHtcclxuXHJcbiAgICAgICAgLy8gICAgICAgICBnT3V0bGluZUNvZGUuZ2V0RnJhZ21lbnRMaW5rQ2hhcnRPdXRsaW5lKFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgIC8vICAgICAgICAgKTtcclxuICAgICAgICAvLyAgICAgfVxyXG5cclxuICAgICAgICAvLyAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICByZXR1cm4gZ2V0RnJhZ21lbnRGaWxlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZEZyYWdtZW50OiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICByZXNwb25zZTogYW55LFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8IFUuaXNOdWxsT3JXaGl0ZVNwYWNlKG9wdGlvbi5pZClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRnJhZ21lbnRBbmRTZXRTZWxlY3RlZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBub2RlID0gbG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChub2RlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLnNldEN1cnJlbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5vZGVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25UZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZS5vcHRpb24gPSBvcHRpb25UZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXN0YXRlLnJlbmRlclN0YXRlLmlzQ2hhaW5Mb2FkKSB7XHJcblxyXG4gICAgICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5yZWZyZXNoVXJsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkUm9vdEZyYWdtZW50QW5kU2V0U2VsZWN0ZWQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBhbnksXHJcbiAgICAgICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uXHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGVJRCA9IHNlY3Rpb24ub3V0bGluZT8uci5pO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmVOb2RlSUQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlbmRlckZyYWdtZW50ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHREYXRhLFxyXG4gICAgICAgICAgICBcInJvb3RcIixcclxuICAgICAgICAgICAgb3V0bGluZU5vZGVJRCxcclxuICAgICAgICAgICAgc2VjdGlvbixcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChyZW5kZXJGcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmVuZGVyRnJhZ21lbnQuc2VjdGlvbi5yb290ID0gcmVuZGVyRnJhZ21lbnQ7XHJcbiAgICAgICAgICAgIHJlbmRlckZyYWdtZW50LnNlY3Rpb24uY3VycmVudCA9IHJlbmRlckZyYWdtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUucmVmcmVzaFVybCA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkQ2hhaW5GcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IGFueSxcclxuICAgICAgICBzZWdtZW50OiBJQ2hhaW5TZWdtZW50LFxyXG4gICAgICAgIG91dGxpbmVOb2RlOiBJUmVuZGVyT3V0bGluZU5vZGVcclxuICAgICk6IElTdGF0ZUFueUFycmF5ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VnbWVudFNlY3Rpb24gPSBzZWdtZW50LnNlZ21lbnRTZWN0aW9uO1xyXG5cclxuICAgICAgICBpZiAoIXNlZ21lbnRTZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWdtZW50IHNlY3Rpb24gaXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwYXJlbnRGcmFnbWVudElEID0gb3V0bGluZU5vZGUucGFyZW50Py5pIGFzIHN0cmluZztcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlLmlzUm9vdCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFvdXRsaW5lTm9kZS5pc0NoYXJ0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCA9IFwiZ3VpZGVSb290XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRGcmFnbWVudElEID0gXCJyb290XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoVS5pc051bGxPcldoaXRlU3BhY2UocGFyZW50RnJhZ21lbnRJRCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcmVudCBmcmFnbWVudCBJRCBpcyBudWxsXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiB7IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsIGNvbnRpbnVlTG9hZGluZzogYm9vbGVhbiB9ID0gZ0ZyYWdtZW50Q29kZS5wYXJzZUFuZExvYWRGcmFnbWVudEJhc2UoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICByZXNwb25zZS50ZXh0RGF0YSxcclxuICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUuaSxcclxuICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24sXHJcbiAgICAgICAgICAgIHNlZ21lbnQuaW5kZXhcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudCA9IHJlc3VsdC5mcmFnbWVudDtcclxuICAgICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgcGFyZW50RnJhZ21lbnRJRFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgc2VnbWVudFNlY3Rpb24uY3VycmVudCA9IGZyYWdtZW50O1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmVudEZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudEZyYWdtZW50LmlkID09PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnRGcmFnbWVudCBhbmQgRnJhZ21lbnQgYXJlIHRoZSBzYW1lXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50LnNlbGVjdGVkID0gZnJhZ21lbnQ7XHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC51aS5zZWN0aW9uSW5kZXggPSBwYXJlbnRGcmFnbWVudC51aS5zZWN0aW9uSW5kZXggKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcHJvY2Vzc0NoYWluRnJhZ21lbnRUeXBlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgc2VnbWVudCxcclxuICAgICAgICAgICAgb3V0bGluZU5vZGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnRnJhZ21lbnRBY3Rpb25zO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuXHJcblxyXG5jb25zdCBnSG9va1JlZ2lzdHJ5Q29kZSA9IHtcclxuXHJcbiAgICBleGVjdXRlU3RlcEhvb2s6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHN0ZXA6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXdpbmRvdy5Ib29rUmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93Lkhvb2tSZWdpc3RyeS5leGVjdXRlU3RlcEhvb2soXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzdGVwXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdIb29rUmVnaXN0cnlDb2RlO1xyXG5cclxuIiwiaW1wb3J0IHsgUGFyc2VUeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvUGFyc2VUeXBlXCI7XHJcbmltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSURpc3BsYXlTZWN0aW9uIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlTZWN0aW9uXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElSZW5kZXJPdXRsaW5lTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlck91dGxpbmVOb2RlXCI7XHJcbmltcG9ydCBJQ2hhaW5TZWdtZW50IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3NlZ21lbnRzL0lDaGFpblNlZ21lbnRcIjtcclxuaW1wb3J0IFJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi9zdGF0ZS9yZW5kZXIvUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGdGcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZ0ZyYWdtZW50QWN0aW9uc1wiO1xyXG5pbXBvcnQgZ0ZpbGVDb25zdGFudHMgZnJvbSBcIi4uL2dGaWxlQ29uc3RhbnRzXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi9nVXRpbGl0aWVzXCI7XHJcbmltcG9ydCBnSGlzdG9yeUNvZGUgZnJvbSBcIi4vZ0hpc3RvcnlDb2RlXCI7XHJcbmltcG9ydCBnSG9va1JlZ2lzdHJ5Q29kZSBmcm9tIFwiLi9nSG9va1JlZ2lzdHJ5Q29kZVwiO1xyXG5pbXBvcnQgZ091dGxpbmVDb2RlIGZyb20gXCIuL2dPdXRsaW5lQ29kZVwiO1xyXG5pbXBvcnQgZ1NlZ21lbnRDb2RlIGZyb20gXCIuL2dTZWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi9nU3RhdGVDb2RlXCI7XHJcblxyXG5cclxuY29uc3QgZ2V0VmFyaWFibGVWYWx1ZSA9IChcclxuICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgIHZhcmlhYmxlVmFsdWVzOiBhbnksXHJcbiAgICB2YXJpYWJsZU5hbWU6IHN0cmluZ1xyXG4pOiBzdHJpbmcgfCBudWxsID0+IHtcclxuXHJcbiAgICBsZXQgdmFsdWUgPSB2YXJpYWJsZVZhbHVlc1t2YXJpYWJsZU5hbWVdO1xyXG5cclxuICAgIGlmICh2YWx1ZSkge1xyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3VycmVudFZhbHVlID0gc2VjdGlvbi5vdXRsaW5lPy5tdj8uW3ZhcmlhYmxlTmFtZV07XHJcblxyXG4gICAgaWYgKGN1cnJlbnRWYWx1ZSkge1xyXG5cclxuICAgICAgICB2YXJpYWJsZVZhbHVlc1t2YXJpYWJsZU5hbWVdID0gY3VycmVudFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFuY2VzdG9yVmFyaWFibGVWYWx1ZShcclxuICAgICAgICBzZWN0aW9uLFxyXG4gICAgICAgIHZhcmlhYmxlVmFsdWVzLFxyXG4gICAgICAgIHZhcmlhYmxlTmFtZVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXSA/PyBudWxsO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0QW5jZXN0b3JWYXJpYWJsZVZhbHVlID0gKFxyXG4gICAgc2VjdGlvbjogSURpc3BsYXlTZWN0aW9uLFxyXG4gICAgdmFyaWFibGVWYWx1ZXM6IGFueSxcclxuICAgIHZhcmlhYmxlTmFtZTogc3RyaW5nXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IGNoYXJ0ID0gc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0O1xyXG4gICAgY29uc3QgcGFyZW50ID0gY2hhcnQucGFyZW50Py5zZWN0aW9uO1xyXG5cclxuICAgIGlmICghcGFyZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcmVudFZhbHVlID0gcGFyZW50Lm91dGxpbmU/Lm12Py5bdmFyaWFibGVOYW1lXTtcclxuXHJcbiAgICBpZiAocGFyZW50VmFsdWUpIHtcclxuXHJcbiAgICAgICAgdmFyaWFibGVWYWx1ZXNbdmFyaWFibGVOYW1lXSA9IHBhcmVudFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFuY2VzdG9yVmFyaWFibGVWYWx1ZShcclxuICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgdmFyaWFibGVWYWx1ZXMsXHJcbiAgICAgICAgdmFyaWFibGVOYW1lXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgY2hlY2tGb3JWYXJpYWJsZXMgPSAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gZnJhZ21lbnQudmFsdWU7XHJcbiAgICBjb25zdCB2YXJpYWJsZVJlZlBhdHRlcm4gPSAv44CIwqbigLkoPzx2YXJpYWJsZU5hbWU+W17igLrCpl0rKeKAusKm44CJL2dtdTtcclxuICAgIGNvbnN0IG1hdGNoZXMgPSB2YWx1ZS5tYXRjaEFsbCh2YXJpYWJsZVJlZlBhdHRlcm4pO1xyXG4gICAgbGV0IHZhcmlhYmxlTmFtZTogc3RyaW5nO1xyXG4gICAgbGV0IHZhcmlhYmxlVmFsdWVzOiBhbnkgPSB7fTtcclxuICAgIGxldCByZXN1bHQgPSAnJztcclxuICAgIGxldCBtYXJrZXIgPSAwO1xyXG5cclxuICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgbWF0Y2hlcykge1xyXG5cclxuICAgICAgICBpZiAobWF0Y2hcclxuICAgICAgICAgICAgJiYgbWF0Y2guZ3JvdXBzXHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBlcWVxZXFcclxuICAgICAgICAgICAgJiYgbWF0Y2guaW5kZXggIT0gbnVsbFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB2YXJpYWJsZU5hbWUgPSBtYXRjaC5ncm91cHMudmFyaWFibGVOYW1lO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdmFyaWFibGVWYWx1ZSA9IGdldFZhcmlhYmxlVmFsdWUoXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgdmFyaWFibGVWYWx1ZXMsXHJcbiAgICAgICAgICAgICAgICB2YXJpYWJsZU5hbWVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFyaWFibGVWYWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVmFyaWFibGU6ICR7dmFyaWFibGVOYW1lfSBjb3VsZCBub3QgYmUgZm91bmRgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICtcclxuICAgICAgICAgICAgICAgIHZhbHVlLnN1YnN0cmluZyhtYXJrZXIsIG1hdGNoLmluZGV4KSArXHJcbiAgICAgICAgICAgICAgICB2YXJpYWJsZVZhbHVlO1xyXG5cclxuICAgICAgICAgICAgbWFya2VyID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdCA9IHJlc3VsdCArXHJcbiAgICAgICAgdmFsdWUuc3Vic3RyaW5nKG1hcmtlciwgdmFsdWUubGVuZ3RoKTtcclxuXHJcbiAgICBmcmFnbWVudC52YWx1ZSA9IHJlc3VsdDtcclxufTtcclxuXHJcbmNvbnN0IGNsZWFyU2libGluZ0NoYWlucyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBwYXJlbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAob3B0aW9uLmlkICE9PSBmcmFnbWVudC5pZCkge1xyXG5cclxuICAgICAgICAgICAgY2xlYXJGcmFnbWVudENoYWlucyhvcHRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IGNsZWFyRnJhZ21lbnRDaGFpbnMgPSAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQpOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyRnJhZ21lbnRDaGFpbnMoZnJhZ21lbnQubGluaz8ucm9vdCk7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICBjbGVhckZyYWdtZW50Q2hhaW5zKG9wdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnJhZ21lbnQuc2VsZWN0ZWQgPSBudWxsO1xyXG5cclxuICAgIGlmIChmcmFnbWVudC5saW5rPy5yb290KSB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50Lmxpbmsucm9vdC5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBsb2FkT3B0aW9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHJhd09wdGlvbjogYW55LFxyXG4gICAgb3V0bGluZU5vZGU6IElSZW5kZXJPdXRsaW5lTm9kZSB8IG51bGwsXHJcbiAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb24sXHJcbiAgICBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGxcclxuKTogSVJlbmRlckZyYWdtZW50ID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb24gPSBuZXcgUmVuZGVyRnJhZ21lbnQoXHJcbiAgICAgICAgcmF3T3B0aW9uLmlkLFxyXG4gICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgc2VjdGlvbixcclxuICAgICAgICBzZWdtZW50SW5kZXhcclxuICAgICk7XHJcblxyXG4gICAgb3B0aW9uLm9wdGlvbiA9IHJhd09wdGlvbi5vcHRpb24gPz8gJyc7XHJcbiAgICBvcHRpb24uaXNBbmNpbGxhcnkgPSByYXdPcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWU7XHJcbiAgICBvcHRpb24ub3JkZXIgPSByYXdPcHRpb24ub3JkZXIgPz8gMDtcclxuICAgIG9wdGlvbi5pRXhpdEtleSA9IHJhd09wdGlvbi5pRXhpdEtleSA/PyAnJztcclxuXHJcbiAgICBpZiAob3V0bGluZU5vZGUpIHtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvdXRsaW5lT3B0aW9uIG9mIG91dGxpbmVOb2RlLm8pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChvdXRsaW5lT3B0aW9uLmkgPT09IG9wdGlvbi5pZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGdTdGF0ZUNvZGUuY2FjaGVfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgc2VjdGlvbi5saW5rSUQsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZU9wdGlvblxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnU3RhdGVDb2RlLmNhY2hlX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgb3B0aW9uXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBvcHRpb247XHJcbn07XHJcblxyXG5jb25zdCBzaG93UGx1Z19zdWJzY3JpcHRpb24gPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZXhpdDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgb3B0aW9uVGV4dDogc3RyaW5nXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IHNlY3Rpb246IElEaXNwbGF5Q2hhcnQgPSBleGl0LnNlY3Rpb24gYXMgSURpc3BsYXlDaGFydDtcclxuICAgIGNvbnN0IHBhcmVudCA9IHNlY3Rpb24ucGFyZW50O1xyXG5cclxuICAgIGlmICghcGFyZW50KSB7XHJcblxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIklEaXNwbGF5Q2hhcnQgcGFyZW50IGlzIG51bGxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaUV4aXRLZXkgPSBleGl0LmV4aXRLZXk7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgcGFyZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbi5pRXhpdEtleSA9PT0gaUV4aXRLZXkpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzaG93T3B0aW9uTm9kZV9zdWJzY3JpcHRvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uVGV4dFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmNvbnN0IHNob3dPcHRpb25Ob2RlX3N1YnNjcmlwdG9uID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgb3B0aW9uVGV4dDogc3RyaW5nIHwgbnVsbCA9IG51bGxcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFvcHRpb25cclxuICAgICAgICB8fCAhb3B0aW9uLnNlY3Rpb24/Lm91dGxpbmU/LnBhdGhcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBnRnJhZ21lbnRDb2RlLnByZXBhcmVUb1Nob3dPcHRpb25Ob2RlKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIG9wdGlvblxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBpZiAob3B0aW9uLnVpLmRpc2N1c3Npb25Mb2FkZWQgPT09IHRydWUpIHtcclxuICAgIC8vICAgICByZXR1cm47XHJcbiAgICAvLyB9XHJcblxyXG4gICAgcmV0dXJuIGdGcmFnbWVudENvZGUuZ2V0RnJhZ21lbnRBbmRMaW5rT3V0bGluZV9zdWJzY3JpcGlvbihcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgb3B0aW9uVGV4dCxcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBsb2FkTmV4dEZyYWdtZW50SW5TZWdtZW50ID0gKFxyXG4gICAgc3RhdGU6IElTdGF0ZSxcclxuICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnRcclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3QgbmV4dE91dGxpbmVOb2RlID0gZ1NlZ21lbnRDb2RlLmdldE5leHRTZWdtZW50T3V0bGluZU5vZGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc2VnbWVudFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIW5leHRPdXRsaW5lTm9kZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybCA9IHNlZ21lbnQuc2VnbWVudFNlY3Rpb24/Lm91dGxpbmU/LnBhdGg7XHJcbiAgICBjb25zdCB1cmwgPSBgJHtmcmFnbWVudEZvbGRlclVybH0vJHtuZXh0T3V0bGluZU5vZGUuaX0ke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50RmlsZUV4dGVuc2lvbn1gO1xyXG5cclxuICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBnRnJhZ21lbnRBY3Rpb25zLmxvYWRDaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlLFxyXG4gICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICBuZXh0T3V0bGluZU5vZGVcclxuICAgICAgICApO1xyXG4gICAgfTtcclxuXHJcbiAgICBnU3RhdGVDb2RlLkFkZFJlTG9hZERhdGFFZmZlY3RJbW1lZGlhdGUoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgYGxvYWRDaGFpbkZyYWdtZW50YCxcclxuICAgICAgICBQYXJzZVR5cGUuSnNvbixcclxuICAgICAgICB1cmwsXHJcbiAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgZ0ZyYWdtZW50Q29kZSA9IHtcclxuXHJcbiAgICBsb2FkTmV4dENoYWluRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHNlZ21lbnQ6IElDaGFpblNlZ21lbnQsXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKHNlZ21lbnQub3V0bGluZU5vZGVzLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGxvYWROZXh0RnJhZ21lbnRJblNlZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlZ21lbnQsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBnU2VnbWVudENvZGUubG9hZE5leHRTZWdtZW50KFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWdtZW50LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgaGFzT3B0aW9uOiAoXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb25JRDogc3RyaW5nXHJcbiAgICApOiBib29sZWFuID0+IHtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgZnJhZ21lbnQub3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbi5pZCA9PT0gb3B0aW9uSUQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja1NlbGVjdGVkOiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50LnNlbGVjdGVkPy5pZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWdGcmFnbWVudENvZGUuaGFzT3B0aW9uKGZyYWdtZW50LCBmcmFnbWVudC5zZWxlY3RlZD8uaWQpKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWxlY3RlZCBoYXMgYmVlbiBzZXQgdG8gZnJhZ21lbnQgdGhhdCBpc24ndCBhbiBvcHRpb25cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhclBhcmVudFNlY3Rpb25TZWxlY3RlZDogKGRpc3BsYXlDaGFydDogSURpc3BsYXlTZWN0aW9uKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IChkaXNwbGF5Q2hhcnQgYXMgSURpc3BsYXlDaGFydCkucGFyZW50O1xyXG5cclxuICAgICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyUGFyZW50U2VjdGlvbk9ycGhhbmVkU3RlcHMocGFyZW50KTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyUGFyZW50U2VjdGlvblNlbGVjdGVkKHBhcmVudC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhclBhcmVudFNlY3Rpb25PcnBoYW5lZFN0ZXBzOiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNsZWFyT3JwaGFuZWRTdGVwcyhmcmFnbWVudC5zZWxlY3RlZCk7XHJcbiAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhck9ycGhhbmVkU3RlcHM6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJPcnBoYW5lZFN0ZXBzKGZyYWdtZW50Lmxpbms/LnJvb3QpO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2xlYXJPcnBoYW5lZFN0ZXBzKGZyYWdtZW50LnNlbGVjdGVkKTtcclxuXHJcbiAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIGZyYWdtZW50LmxpbmsgPSBudWxsO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmFnbWVudEFuZExpbmtPdXRsaW5lX3N1YnNjcmlwaW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb25UZXh0OiBzdHJpbmcgfCBudWxsID0gbnVsbCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICAvLyBpZiAob3B0aW9uLnVpLmRpc2N1c3Npb25Mb2FkZWQgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgLy8gICAgIHRocm93IG5ldyBFcnJvcignRGlzY3Vzc2lvbiB3YXMgYWxyZWFkeSBsb2FkZWQnKTtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHN0YXRlLmxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHdpbmRvdy5UcmVlU29sdmUuc2NyZWVuLmhpZGVCYW5uZXIgPSB0cnVlO1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmdldExpbmtPdXRsaW5lX3N1YnNjcmlwaW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7b3B0aW9uLnNlY3Rpb24/Lm91dGxpbmU/LnBhdGh9LyR7b3B0aW9uLmlkfSR7Z0ZpbGVDb25zdGFudHMuZnJhZ21lbnRGaWxlRXh0ZW5zaW9ufWA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRBY3Rpb246IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiBJU3RhdGVBbnlBcnJheSA9IChzdGF0ZTogSVN0YXRlLCByZXNwb25zZTogYW55KSA9PiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5sb2FkRnJhZ21lbnRBbmRTZXRTZWxlY3RlZChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBvcHRpb24sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25UZXh0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5BZGRSZUxvYWREYXRhRWZmZWN0SW1tZWRpYXRlKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgYGxvYWRGcmFnbWVudEZpbGVgLFxyXG4gICAgICAgICAgICBQYXJzZVR5cGUuVGV4dCxcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICBsb2FkQWN0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0TGlua091dGxpbmVfc3Vic2NyaXBpb246IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmUgPSBvcHRpb24uc2VjdGlvbi5vdXRsaW5lO1xyXG5cclxuICAgICAgICBpZiAoIW91dGxpbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3V0bGluZU5vZGUgPSBnU3RhdGVDb2RlLmdldENhY2hlZF9vdXRsaW5lTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvbi5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgb3B0aW9uLmlkXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlPy5jID09IG51bGxcclxuICAgICAgICAgICAgfHwgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPT09IHRydWUgLy8gV2lsbCBsb2FkIGl0IGZyb20gYSBzZWdtZW50XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVDaGFydCA9IGdPdXRsaW5lQ29kZS5nZXRPdXRsaW5lQ2hhcnQoXHJcbiAgICAgICAgICAgIG91dGxpbmUsXHJcbiAgICAgICAgICAgIG91dGxpbmVOb2RlPy5jXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ091dGxpbmVDb2RlLmdldE91dGxpbmVGcm9tQ2hhcnRfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZUNoYXJ0LFxyXG4gICAgICAgICAgICBvcHRpb25cclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRMaW5rRWxlbWVudElEOiAoZnJhZ21lbnRJRDogc3RyaW5nKTogc3RyaW5nID0+IHtcclxuXHJcbiAgICAgICAgcmV0dXJuIGBudF9sa19mcmFnXyR7ZnJhZ21lbnRJRH1gO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRGcmFnbWVudEVsZW1lbnRJRDogKGZyYWdtZW50SUQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XHJcblxyXG4gICAgICAgIHJldHVybiBgbnRfZnJfZnJhZ18ke2ZyYWdtZW50SUR9YDtcclxuICAgIH0sXHJcblxyXG4gICAgcHJlcGFyZVRvU2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5tYXJrT3B0aW9uc0V4cGFuZGVkKFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5zZXRDdXJyZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgb3B0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ0hpc3RvcnlDb2RlLnB1c2hCcm93c2VySGlzdG9yeVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VBbmRMb2FkRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJlc3BvbnNlOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnRJRDogc3RyaW5nLFxyXG4gICAgICAgIG91dGxpbmVOb2RlSUQ6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uOiBJRGlzcGxheVNlY3Rpb25cclxuICAgICk6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCByZXN1bHQ6IHsgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCwgY29udGludWVMb2FkaW5nOiBib29sZWFuIH0gPSBnRnJhZ21lbnRDb2RlLnBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNlLFxyXG4gICAgICAgICAgICBwYXJlbnRGcmFnbWVudElELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlELFxyXG4gICAgICAgICAgICBzZWN0aW9uXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSByZXN1bHQuZnJhZ21lbnQ7XHJcblxyXG4gICAgICAgIGlmIChyZXN1bHQuY29udGludWVMb2FkaW5nID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBnRnJhZ21lbnRDb2RlLmF1dG9FeHBhbmRTaW5nbGVCbGFua09wdGlvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWZyYWdtZW50LmxpbmspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnT3V0bGluZUNvZGUuZ2V0RnJhZ21lbnRMaW5rQ2hhcnRPdXRsaW5lKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHBhcnNlQW5kTG9hZEZyYWdtZW50QmFzZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmVzcG9uc2U6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRGcmFnbWVudElEOiBzdHJpbmcsXHJcbiAgICAgICAgb3V0bGluZU5vZGVJRDogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb246IElEaXNwbGF5U2VjdGlvbixcclxuICAgICAgICBzZWdtZW50SW5kZXg6IG51bWJlciB8IG51bGwgPSBudWxsXHJcbiAgICApOiB7IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsIGNvbnRpbnVlTG9hZGluZzogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzZWN0aW9uLm91dGxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3B0aW9uIHNlY3Rpb24gb3V0bGluZSB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcmF3RnJhZ21lbnQgPSBnRnJhZ21lbnRDb2RlLnBhcnNlRnJhZ21lbnQocmVzcG9uc2UpO1xyXG5cclxuICAgICAgICBpZiAoIXJhd0ZyYWdtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JhdyBmcmFnbWVudCB3YXMgbnVsbCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dGxpbmVOb2RlSUQgIT09IHJhd0ZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByYXdGcmFnbWVudCBpZCBkb2VzIG5vdCBtYXRjaCB0aGUgb3V0bGluZU5vZGVJRCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICBvdXRsaW5lTm9kZUlEXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudCkge1xyXG5cclxuICAgICAgICAgICAgZnJhZ21lbnQgPSBuZXcgUmVuZGVyRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICByYXdGcmFnbWVudC5pZCxcclxuICAgICAgICAgICAgICAgIHBhcmVudEZyYWdtZW50SUQsXHJcbiAgICAgICAgICAgICAgICBzZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29udGludWVMb2FkaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIGlmICghZnJhZ21lbnQudWkuZGlzY3Vzc2lvbkxvYWRlZCkge1xyXG5cclxuICAgICAgICAgICAgZ0ZyYWdtZW50Q29kZS5sb2FkRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHJhd0ZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGdTdGF0ZUNvZGUuY2FjaGVfY2hhaW5GcmFnbWVudChcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRpbnVlTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgY29udGludWVMb2FkaW5nXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgYXV0b0V4cGFuZFNpbmdsZUJsYW5rT3B0aW9uOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc0FuZEFuY2lsbGFyaWVzID0gZ0ZyYWdtZW50Q29kZS5zcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllcyhmcmFnbWVudC5vcHRpb25zKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zLmxlbmd0aCA9PT0gMVxyXG4gICAgICAgICAgICAmJiBvcHRpb25zQW5kQW5jaWxsYXJpZXMub3B0aW9uc1swXS5vcHRpb24gPT09ICcnXHJcbiAgICAgICAgICAgICYmIFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmlLZXkpXHJcbiAgICAgICAgICAgICYmIFUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmV4aXRLZXkpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LnNlY3Rpb24ubGlua0lELFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuaWRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvdXRsaW5lTm9kZT8uYyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzaG93T3B0aW9uTm9kZV9zdWJzY3JpcHRvbihcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9uc1swXVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UoZnJhZ21lbnQuZXhpdEtleSkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZW4gZmluZCB0aGUgcGFyZW50IG9wdGlvbiB3aXRoIGFuIGlFeGl0S2V5IHRoYXQgbWF0Y2hlcyB0aGlzIGV4aXRLZXlcclxuICAgICAgICAgICAgc2hvd1BsdWdfc3Vic2NyaXB0aW9uKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50Lm9wdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgY2FjaGVTZWN0aW9uUm9vdDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZGlzcGxheVNlY3Rpb246IElEaXNwbGF5U2VjdGlvblxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZGlzcGxheVNlY3Rpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgcm9vdEZyYWdtZW50ID0gZGlzcGxheVNlY3Rpb24ucm9vdDtcclxuXHJcbiAgICAgICAgaWYgKCFyb290RnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ1N0YXRlQ29kZS5jYWNoZV9jaGFpbkZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcm9vdEZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZGlzcGxheVNlY3Rpb24uY3VycmVudCA9IGRpc3BsYXlTZWN0aW9uLnJvb3Q7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHJvb3RGcmFnbWVudC5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBnU3RhdGVDb2RlLmNhY2hlX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZWxlbWVudElzUGFyYWdyYXBoOiAodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICBsZXQgdHJpbW1lZCA9IHZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKHRyaW1tZWQpKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAodHJpbW1lZC5sZW5ndGggPiAyMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHRyaW1tZWQgPSB0cmltbWVkLnN1YnN0cmluZygwLCAyMCk7XHJcbiAgICAgICAgICAgICAgICB0cmltbWVkID0gdHJpbW1lZC5yZXBsYWNlKC9cXHMvZywgJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHJpbW1lZC5zdGFydHNXaXRoKCc8cD4nKSA9PT0gdHJ1ZVxyXG4gICAgICAgICAgICAmJiB0cmltbWVkWzNdICE9PSAnPCcpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBwYXJzZUFuZExvYWRHdWlkZVJvb3RGcmFnbWVudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcmF3RnJhZ21lbnQ6IGFueSxcclxuICAgICAgICByb290OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXJhd0ZyYWdtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUubG9hZEZyYWdtZW50KFxyXG4gICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgcmF3RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHJvb3RcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkRnJhZ21lbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHJhd0ZyYWdtZW50OiBhbnksXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnRvcExldmVsTWFwS2V5ID0gcmF3RnJhZ21lbnQudG9wTGV2ZWxNYXBLZXkgPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQubWFwS2V5Q2hhaW4gPSByYXdGcmFnbWVudC5tYXBLZXlDaGFpbiA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5ndWlkZUlEID0gcmF3RnJhZ21lbnQuZ3VpZGVJRCA/PyAnJztcclxuICAgICAgICBmcmFnbWVudC5ndWlkZVBhdGggPSByYXdGcmFnbWVudC5ndWlkZVBhdGggPz8gJyc7XHJcbiAgICAgICAgZnJhZ21lbnQuaUtleSA9IHJhd0ZyYWdtZW50LmlLZXkgPz8gbnVsbDtcclxuICAgICAgICBmcmFnbWVudC5leGl0S2V5ID0gcmF3RnJhZ21lbnQuZXhpdEtleSA/PyBudWxsO1xyXG4gICAgICAgIGZyYWdtZW50LnZhcmlhYmxlID0gcmF3RnJhZ21lbnQudmFyaWFibGUgPz8gbnVsbDtcclxuICAgICAgICBmcmFnbWVudC52YWx1ZSA9IHJhd0ZyYWdtZW50LnZhbHVlID8/ICcnO1xyXG4gICAgICAgIGZyYWdtZW50LnZhbHVlID0gZnJhZ21lbnQudmFsdWUudHJpbSgpO1xyXG4gICAgICAgIC8vIGZyYWdtZW50LnVpLmRpc2N1c3Npb25Mb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmRvTm90UGFpbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgY2hlY2tGb3JWYXJpYWJsZXMoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IG91dGxpbmVOb2RlID0gZ1N0YXRlQ29kZS5nZXRDYWNoZWRfb3V0bGluZU5vZGUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZnJhZ21lbnQuaWRcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmcmFnbWVudC5wYXJlbnRGcmFnbWVudElEID0gb3V0bGluZU5vZGU/LnBhcmVudD8uaSA/PyAnJztcclxuXHJcbiAgICAgICAgbGV0IG9wdGlvbjogSVJlbmRlckZyYWdtZW50IHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAocmF3RnJhZ21lbnQub3B0aW9uc1xyXG4gICAgICAgICAgICAmJiBBcnJheS5pc0FycmF5KHJhd0ZyYWdtZW50Lm9wdGlvbnMpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmF3T3B0aW9uIG9mIHJhd0ZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBvcHRpb24gPSBmcmFnbWVudC5vcHRpb25zLmZpbmQobyA9PiBvLmlkID09PSByYXdPcHRpb24uaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IGxvYWRPcHRpb24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdPcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmVOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5zZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFnbWVudC5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQuc2VnbWVudEluZGV4XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnQub3B0aW9ucy5wdXNoKG9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ub3B0aW9uID0gcmF3T3B0aW9uLm9wdGlvbiA/PyAnJztcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uaXNBbmNpbGxhcnkgPSByYXdPcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLm9yZGVyID0gcmF3T3B0aW9uLm9yZGVyID8/IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLmlFeGl0S2V5ID0gcmF3T3B0aW9uLmlFeGl0S2V5ID8/ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5zZWN0aW9uID0gZnJhZ21lbnQuc2VjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24ucGFyZW50RnJhZ21lbnRJRCA9IGZyYWdtZW50LmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5zZWdtZW50SW5kZXggPSBmcmFnbWVudC5zZWdtZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gb3B0aW9uLnVpLmRpc2N1c3Npb25Mb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi51aS5kb05vdFBhaW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdIb29rUmVnaXN0cnlDb2RlLmV4ZWN1dGVTdGVwSG9vayhcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcGFyc2VGcmFnbWVudDogKHJlc3BvbnNlOiBzdHJpbmcpOiBhbnkgPT4ge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPVxcXCJtb2R1bGVcXFwiIHNyYz1cXFwiL0B2aXRlL2NsaWVudFxcXCI+PC9zY3JpcHQ+XHJcbiAgICAgICAgICAgICAgICA8IS0tIHRzRnJhZ21lbnRSZW5kZXJDb21tZW50IHtcXFwibm9kZVxcXCI6e1xcXCJpZFxcXCI6XFxcImRCdDdLbTJNbFxcXCIsXFxcInRvcExldmVsTWFwS2V5XFxcIjpcXFwiY3YxVFJsMDFyZlxcXCIsXFxcIm1hcEtleUNoYWluXFxcIjpcXFwiY3YxVFJsMDFyZlxcXCIsXFxcImd1aWRlSURcXFwiOlxcXCJkQnQ3Sk4xSGVcXFwiLFxcXCJndWlkZVBhdGhcXFwiOlxcXCJjOi9HaXRIdWIvVEVTVC5Eb2N1bWVudGF0aW9uL3RzbWFwc2RhdGFPcHRpb25zRm9sZGVyL0hvbGRlci9kYXRhT3B0aW9ucy50c21hcFxcXCIsXFxcInBhcmVudEZyYWdtZW50SURcXFwiOlxcXCJkQnQ3Sk4xdnRcXFwiLFxcXCJjaGFydEtleVxcXCI6XFxcImN2MVRSbDAxcmZcXFwiLFxcXCJvcHRpb25zXFxcIjpbXX19IC0tPlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8aDQgaWQ9XFxcIm9wdGlvbi0xLXNvbHV0aW9uXFxcIj5PcHRpb24gMSBzb2x1dGlvbjwvaDQ+XHJcbiAgICAgICAgICAgICAgICA8cD5PcHRpb24gMSBzb2x1dGlvbjwvcD5cclxuICAgICAgICAqL1xyXG5cclxuICAgICAgICBjb25zdCBsaW5lcyA9IHJlc3BvbnNlLnNwbGl0KCdcXG4nKTtcclxuICAgICAgICBjb25zdCByZW5kZXJDb21tZW50U3RhcnQgPSBgPCEtLSAke2dGaWxlQ29uc3RhbnRzLmZyYWdtZW50UmVuZGVyQ29tbWVudFRhZ31gO1xyXG4gICAgICAgIGNvbnN0IHJlbmRlckNvbW1lbnRFbmQgPSBgIC0tPmA7XHJcbiAgICAgICAgbGV0IGZyYWdtZW50UmVuZGVyQ29tbWVudDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgbGV0IGxpbmU6IHN0cmluZztcclxuICAgICAgICBsZXQgYnVpbGRWYWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9ICcnO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBsaW5lID0gbGluZXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoYnVpbGRWYWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYCR7dmFsdWV9XHJcbiR7bGluZX1gO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgocmVuZGVyQ29tbWVudFN0YXJ0KSA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGxpbmUuc3Vic3RyaW5nKHJlbmRlckNvbW1lbnRTdGFydC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgYnVpbGRWYWx1ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZnJhZ21lbnRSZW5kZXJDb21tZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC50cmltKCk7XHJcblxyXG4gICAgICAgIGlmIChmcmFnbWVudFJlbmRlckNvbW1lbnQuZW5kc1dpdGgocmVuZGVyQ29tbWVudEVuZCkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC5sZW5ndGggLSByZW5kZXJDb21tZW50RW5kLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZyYWdtZW50UmVuZGVyQ29tbWVudCA9IGZyYWdtZW50UmVuZGVyQ29tbWVudC5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmcmFnbWVudFJlbmRlckNvbW1lbnQgPSBmcmFnbWVudFJlbmRlckNvbW1lbnQudHJpbSgpO1xyXG4gICAgICAgIGxldCByYXdGcmFnbWVudDogYW55IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJhd0ZyYWdtZW50ID0gSlNPTi5wYXJzZShmcmFnbWVudFJlbmRlckNvbW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJhd0ZyYWdtZW50LnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiByYXdGcmFnbWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgbWFya09wdGlvbnNFeHBhbmRlZDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ0ZyYWdtZW50Q29kZS5yZXNldEZyYWdtZW50VWlzKHN0YXRlKTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5vcHRpb25zRXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgY29sbGFwc2VGcmFnbWVudHNPcHRpb25zOiAoZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50XHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGZyYWdtZW50Lm9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvbi51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2hvd09wdGlvbk5vZGU6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBnRnJhZ21lbnRDb2RlLmNvbGxhcHNlRnJhZ21lbnRzT3B0aW9ucyhmcmFnbWVudCk7XHJcbiAgICAgICAgb3B0aW9uLnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGdGcmFnbWVudENvZGUuc2V0Q3VycmVudChcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0RnJhZ21lbnRVaXM6IChzdGF0ZTogSVN0YXRlKTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoYWluRnJhZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuaW5kZXhfY2hhaW5GcmFnbWVudHNfaWQ7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gY2hhaW5GcmFnbWVudHMpIHtcclxuXHJcbiAgICAgICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpKGNoYWluRnJhZ21lbnRzW3Byb3BOYW1lXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNldEZyYWdtZW50VWk6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogdm9pZCA9PiB7XHJcblxyXG4gICAgICAgIGZyYWdtZW50LnVpLmZyYWdtZW50T3B0aW9uc0V4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZG9Ob3RQYWludCA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllczogKGNoaWxkcmVuOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+IHwgbnVsbCB8IHVuZGVmaW5lZCk6IHsgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiwgYW5jaWxsYXJpZXM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sIHRvdGFsOiBudW1iZXIgfSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGFuY2lsbGFyaWVzOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+ID0gW107XHJcbiAgICAgICAgY29uc3Qgb3B0aW9uczogQXJyYXk8SVJlbmRlckZyYWdtZW50PiA9IFtdO1xyXG4gICAgICAgIGxldCBvcHRpb246IElSZW5kZXJGcmFnbWVudDtcclxuXHJcbiAgICAgICAgaWYgKCFjaGlsZHJlbikge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllcyxcclxuICAgICAgICAgICAgICAgIHRvdGFsOiAwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBvcHRpb24gPSBjaGlsZHJlbltpXSBhcyBJUmVuZGVyRnJhZ21lbnQ7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbi5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICAgICAgICAgIG9wdGlvbnMucHVzaChvcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYW5jaWxsYXJpZXMucHVzaChvcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgICAgICBhbmNpbGxhcmllcyxcclxuICAgICAgICAgICAgdG90YWw6IGNoaWxkcmVuLmxlbmd0aFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEN1cnJlbnQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gZnJhZ21lbnQuc2VjdGlvbjtcclxuXHJcbiAgICAgICAgbGV0IHBhcmVudDogSVJlbmRlckZyYWdtZW50IHwgbnVsbCA9IGdTdGF0ZUNvZGUuZ2V0Q2FjaGVkX2NoYWluRnJhZ21lbnQoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBzZWN0aW9uLmxpbmtJRCxcclxuICAgICAgICAgICAgZnJhZ21lbnQucGFyZW50RnJhZ21lbnRJRFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQuaWQgPT09IGZyYWdtZW50LmlkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyZW50IGFuZCBGcmFnbWVudCBhcmUgdGhlIHNhbWVcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhcmVudC5zZWxlY3RlZCA9IGZyYWdtZW50O1xyXG4gICAgICAgICAgICBmcmFnbWVudC51aS5zZWN0aW9uSW5kZXggPSBwYXJlbnQudWkuc2VjdGlvbkluZGV4ICsgMTtcclxuXHJcbiAgICAgICAgICAgIGNsZWFyU2libGluZ0NoYWlucyhcclxuICAgICAgICAgICAgICAgIHBhcmVudCxcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJlbnRGcmFnbWVudCB3YXMgbnVsbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlY3Rpb24uY3VycmVudCA9IGZyYWdtZW50O1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUuY2hlY2tTZWxlY3RlZChmcmFnbWVudCk7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ0ZyYWdtZW50Q29kZTtcclxuXHJcbiIsImltcG9ydCBnRnJhZ21lbnRBY3Rpb25zIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvYWN0aW9ucy9nRnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCBnRnJhZ21lbnRDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nRnJhZ21lbnRDb2RlXCI7XHJcbmltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBJRGlzcGxheUNoYXJ0IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2Rpc3BsYXkvSURpc3BsYXlDaGFydFwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJRnJhZ21lbnRQYXlsb2FkIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3VpL3BheWxvYWRzL0lGcmFnbWVudFBheWxvYWRcIjtcclxuXHJcblxyXG5jb25zdCBoaWRlRnJvbVBhaW50ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQsXHJcbiAgICBoaWRlOiBib29sZWFuXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIC8qIFxyXG4gICAgICAgIFRoaXMgaXMgYSBmaXggZm9yOlxyXG4gICAgICAgIE5vdEZvdW5kRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdpbnNlcnRCZWZvcmUnIG9uICdOb2RlJzogVGhlIG5vZGUgYmVmb3JlIHdoaWNoIHRoZSBuZXcgbm9kZSBpcyB0byBiZSBpbnNlcnRlZCBpcyBub3QgYSBjaGlsZCBvZiB0aGlzIG5vZGUuXHJcbiAgICAqL1xyXG5cclxuICAgIGlmICghZnJhZ21lbnQpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBmcmFnbWVudC51aS5kb05vdFBhaW50ID0gaGlkZTtcclxuXHJcbiAgICBoaWRlRnJvbVBhaW50KFxyXG4gICAgICAgIGZyYWdtZW50LnNlbGVjdGVkLFxyXG4gICAgICAgIGhpZGVcclxuICAgICk7XHJcblxyXG4gICAgaGlkZUZyb21QYWludChcclxuICAgICAgICBmcmFnbWVudC5saW5rPy5yb290LFxyXG4gICAgICAgIGhpZGVcclxuICAgICk7XHJcbn1cclxuXHJcbmNvbnN0IGhpZGVPcHRpb25zRnJvbVBhaW50ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQsXHJcbiAgICBoaWRlOiBib29sZWFuXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIC8qIFxyXG4gICAgICAgIFRoaXMgaXMgYSBmaXggZm9yOlxyXG4gICAgICAgIE5vdEZvdW5kRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdpbnNlcnRCZWZvcmUnIG9uICdOb2RlJzogVGhlIG5vZGUgYmVmb3JlIHdoaWNoIHRoZSBuZXcgbm9kZSBpcyB0byBiZSBpbnNlcnRlZCBpcyBub3QgYSBjaGlsZCBvZiB0aGlzIG5vZGUuXHJcbiAgICAqL1xyXG4gICAgaWYgKCFmcmFnbWVudCkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGZyYWdtZW50Py5vcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGhpZGVGcm9tUGFpbnQoXHJcbiAgICAgICAgICAgIG9wdGlvbixcclxuICAgICAgICAgICAgaGlkZVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNlY3Rpb25QYXJlbnRTZWxlY3RlZChcclxuICAgICAgICBmcmFnbWVudC5zZWN0aW9uIGFzIElEaXNwbGF5Q2hhcnQsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxufVxyXG5cclxuY29uc3QgaGlkZVNlY3Rpb25QYXJlbnRTZWxlY3RlZCA9IChcclxuICAgIGRpc3BsYXlDaGFydDogSURpc3BsYXlDaGFydCxcclxuICAgIGhpZGU6IGJvb2xlYW5cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKCFkaXNwbGF5Q2hhcnQ/LnBhcmVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlRnJvbVBhaW50KFxyXG4gICAgICAgIGRpc3BsYXlDaGFydC5wYXJlbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgaGlkZVxyXG4gICAgKTtcclxuXHJcbiAgICBoaWRlU2VjdGlvblBhcmVudFNlbGVjdGVkKFxyXG4gICAgICAgIGRpc3BsYXlDaGFydC5wYXJlbnQuc2VjdGlvbiBhcyBJRGlzcGxheUNoYXJ0LFxyXG4gICAgICAgIGhpZGVcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBmcmFnbWVudEFjdGlvbnMgPSB7XHJcblxyXG4gICAgZXhwYW5kT3B0aW9uczogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFmcmFnbWVudFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnU3RhdGVDb2RlLnNldERpcnR5KHN0YXRlKTtcclxuICAgICAgICBnRnJhZ21lbnRDb2RlLnJlc2V0RnJhZ21lbnRVaXMoc3RhdGUpO1xyXG4gICAgICAgIGNvbnN0IGV4cGFuZGVkID0gZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgIT09IHRydWU7XHJcbiAgICAgICAgc3RhdGUucmVuZGVyU3RhdGUudWkub3B0aW9uc0V4cGFuZGVkID0gZXhwYW5kZWQ7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBleHBhbmRlZDtcclxuXHJcbiAgICAgICAgaGlkZU9wdGlvbnNGcm9tUGFpbnQoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGVPcHRpb25zOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50XHJcbiAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGVcclxuICAgICAgICAgICAgfHwgIWZyYWdtZW50XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuc2V0RGlydHkoc3RhdGUpO1xyXG4gICAgICAgIGdGcmFnbWVudENvZGUucmVzZXRGcmFnbWVudFVpcyhzdGF0ZSk7XHJcbiAgICAgICAgZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS51aS5vcHRpb25zRXhwYW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaGlkZU9wdGlvbnNGcm9tUGFpbnQoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBmYWxzZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG93T3B0aW9uTm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGF5bG9hZDogSUZyYWdtZW50UGF5bG9hZFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFwYXlsb2FkPy5wYXJlbnRGcmFnbWVudFxyXG4gICAgICAgICAgICB8fCAhcGF5bG9hZD8ub3B0aW9uXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdTdGF0ZUNvZGUuc2V0RGlydHkoc3RhdGUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ0ZyYWdtZW50QWN0aW9ucy5zaG93T3B0aW9uTm9kZShcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHBheWxvYWQucGFyZW50RnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHBheWxvYWQub3B0aW9uXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgdG9nZ2xlQW5jaWxsYXJ5Tm9kZTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgcGF5bG9hZDogSUZyYWdtZW50UGF5bG9hZFxyXG4gICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIXN0YXRlXHJcbiAgICAgICAgICAgIHx8ICFwYXlsb2FkPy5vcHRpb25cclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYW5jaWxsYXJ5ID0gcGF5bG9hZC5vcHRpb247XHJcbiAgICAgICAgZ1N0YXRlQ29kZS5zZXREaXJ0eShzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICghYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkKSB7XHJcblxyXG4gICAgICAgICAgICBhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdGcmFnbWVudEFjdGlvbnMuc2hvd0FuY2lsbGFyeU5vZGUoXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSxcclxuICAgICAgICAgICAgICAgIHBheWxvYWQub3B0aW9uXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhbmNpbGxhcnkudWkuYW5jaWxsYXJ5RXhwYW5kZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmcmFnbWVudEFjdGlvbnM7XHJcbiIsImltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgSUZyYWdtZW50UGF5bG9hZCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9wYXlsb2Fkcy9JRnJhZ21lbnRQYXlsb2FkXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRnJhZ21lbnRQYXlsb2FkIGltcGxlbWVudHMgSUZyYWdtZW50UGF5bG9hZCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcGFyZW50RnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICAgICBvcHRpb246IElSZW5kZXJGcmFnbWVudFxyXG4gICAgICAgICkge1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEZyYWdtZW50ID0gcGFyZW50RnJhZ21lbnQ7XHJcbiAgICAgICAgdGhpcy5vcHRpb24gPSBvcHRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHBhcmVudEZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQ7XHJcbiAgICBwdWJsaWMgb3B0aW9uOiBJUmVuZGVyRnJhZ21lbnQ7XHJcbn1cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4sIFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBmcmFnbWVudEFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvZnJhZ21lbnRBY3Rpb25zXCI7XHJcbmltcG9ydCBGcmFnbWVudFBheWxvYWQgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL3VpL3BheWxvYWRzL0ZyYWdtZW50UGF5bG9hZFwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2dVdGlsaXRpZXNcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkQW5jaWxsYXJ5RGlzY3Vzc2lvblZpZXcgPSAoYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnQpOiBDaGlsZHJlbltdID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeS51aS5hbmNpbGxhcnlFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogQ2hpbGRyZW5bXSA9IFtdO1xyXG5cclxuICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgIGFuY2lsbGFyeSxcclxuICAgICAgICB2aWV3XHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59XHJcblxyXG5jb25zdCBidWlsZEV4cGFuZGVkQW5jaWxsYXJ5VmlldyA9IChcclxuICAgIHBhcmVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgYW5jaWxsYXJ5OiBJUmVuZGVyRnJhZ21lbnRcclxuKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyeVxyXG4gICAgICAgIHx8ICFhbmNpbGxhcnkuaXNBbmNpbGxhcnkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LWJveFwiIH0sIFtcclxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS1oZWFkXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLnRvZ2dsZUFuY2lsbGFyeU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoX2V2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50UGF5bG9hZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJzcGFuXCIsIHsgY2xhc3M6IFwibnQtZnItYW5jaWxsYXJ5LXRleHRcIiB9LCBhbmNpbGxhcnkub3B0aW9uKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnkteFwiIH0sICfinJUnKVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgXSksXHJcblxyXG4gICAgICAgICAgICBidWlsZEFuY2lsbGFyeURpc2N1c3Npb25WaWV3KGFuY2lsbGFyeSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgYnVpbGRDb2xsYXBzZWRBbmNpbGxhcnlWaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5XHJcbiAgICAgICAgfHwgIWFuY2lsbGFyeS5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJudC1mci1hbmNpbGxhcnktYm94IG50LWZyLWNvbGxhcHNlZFwiIH0sIFtcclxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeS1oZWFkXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIm50LWZyLWFuY2lsbGFyeVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLnRvZ2dsZUFuY2lsbGFyeU5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoX2V2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZyYWdtZW50UGF5bG9hZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJzcGFuXCIsIHt9LCBhbmNpbGxhcnkub3B0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgQnVpbGRBbmNpbGxhcnlWaWV3ID0gKFxyXG4gICAgcGFyZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcnk6IElSZW5kZXJGcmFnbWVudFxyXG4pOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmICghYW5jaWxsYXJ5XHJcbiAgICAgICAgfHwgIWFuY2lsbGFyeS5pc0FuY2lsbGFyeSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5jaWxsYXJ5LnVpLmFuY2lsbGFyeUV4cGFuZGVkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBidWlsZEV4cGFuZGVkQW5jaWxsYXJ5VmlldyhcclxuICAgICAgICAgICAgcGFyZW50LFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBidWlsZENvbGxhcHNlZEFuY2lsbGFyeVZpZXcoXHJcbiAgICAgICAgcGFyZW50LFxyXG4gICAgICAgIGFuY2lsbGFyeVxyXG4gICAgKTtcclxufVxyXG5cclxuY29uc3QgQnVpbGRFeHBhbmRlZE9wdGlvblZpZXcgPSAoXHJcbiAgICBwYXJlbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbjogSVJlbmRlckZyYWdtZW50XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKCFvcHRpb25cclxuICAgICAgICB8fCBvcHRpb24uaXNBbmNpbGxhcnkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibnQtZnItb3B0aW9uLWJveFwiIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1vcHRpb25cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd246IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5zaG93T3B0aW9uTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRnJhZ21lbnRQYXlsb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcInNwYW5cIiwge30sIG9wdGlvbi5vcHRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufVxyXG5cclxuY29uc3QgYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD5cclxuKTogeyB2aWV3OiBWTm9kZSwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvblZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcbiAgICBsZXQgb3B0aW9uVmV3OiBWTm9kZSB8IG51bGw7XHJcblxyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9ucykge1xyXG5cclxuICAgICAgICBvcHRpb25WZXcgPSBCdWlsZEV4cGFuZGVkT3B0aW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIG9wdGlvblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25WZXcpIHtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvblZpZXdzLnB1c2gob3B0aW9uVmV3KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG9wdGlvbnNDbGFzc2VzID0gXCJudC1mci1mcmFnbWVudC1vcHRpb25zXCI7XHJcblxyXG4gICAgaWYgKGZyYWdtZW50LnNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgIG9wdGlvbnNDbGFzc2VzID0gYCR7b3B0aW9uc0NsYXNzZXN9IG50LWZyLWZyYWdtZW50LWNoYWluYFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGFzczogYCR7b3B0aW9uc0NsYXNzZXN9YCxcclxuICAgICAgICAgICAgICAgIHRhYmluZGV4OiAwLFxyXG4gICAgICAgICAgICAgICAgb25CbHVyOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRBY3Rpb25zLmhpZGVPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4gZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG9wdGlvblZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHZpZXcsXHJcbiAgICAgICAgaXNDb2xsYXBzZWQ6IGZhbHNlXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRFeHBhbmRlZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sXHJcbiAgICBmcmFnbWVudEVMZW1lbnRJRDogc3RyaW5nLFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9uc1ZpZXcgPSBidWlsZEV4cGFuZGVkT3B0aW9uc1ZpZXcoXHJcbiAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIW9wdGlvbnNWaWV3KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZpZXdzLnB1c2goXHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9lb2AsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1mcmFnbWVudC1ib3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zVmlldy52aWV3XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyA9IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogVk5vZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGBudC1mci1mcmFnbWVudC1vcHRpb25zIG50LWZyLWNvbGxhcHNlZGAsXHJcbiAgICAgICAgICAgICAgICBvbk1vdXNlRG93bjogW1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWN0aW9ucy5leHBhbmRPcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgIChfZXZlbnQ6IGFueSkgPT4gZnJhZ21lbnRcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcInNwYW5cIiwgeyBjbGFzczogYG50LWZyLW9wdGlvbi1zZWxlY3RlZGAgfSwgYCR7ZnJhZ21lbnQuc2VsZWN0ZWQ/Lm9wdGlvbn1gKSxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZENvbGxhcHNlZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25WaWV3ID0gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgY29uc3QgdmlldyA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGAke2ZyYWdtZW50RUxlbWVudElEfV9jb2AsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1mcmFnbWVudC1ib3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBvcHRpb25WaWV3XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICApO1xyXG5cclxuICAgIHZpZXcudWkgPSB7XHJcbiAgICAgICAgaXNDb2xsYXBzZWQ6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgdmlld3MucHVzaCh2aWV3KTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkQW5jaWxsYXJpZXNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIGFuY2lsbGFyaWVzOiBBcnJheTxJUmVuZGVyRnJhZ21lbnQ+XHJcbik6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgaWYgKGFuY2lsbGFyaWVzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhbmNpbGxhcmllc1ZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcbiAgICBsZXQgYW5jaWxsYXJ5VmlldzogVk5vZGUgfCBudWxsO1xyXG5cclxuICAgIGZvciAoY29uc3QgYW5jaWxsYXJ5IG9mIGFuY2lsbGFyaWVzKSB7XHJcblxyXG4gICAgICAgIGFuY2lsbGFyeVZpZXcgPSBCdWlsZEFuY2lsbGFyeVZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICBhbmNpbGxhcnlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAoYW5jaWxsYXJ5Vmlldykge1xyXG5cclxuICAgICAgICAgICAgYW5jaWxsYXJpZXNWaWV3cy5wdXNoKGFuY2lsbGFyeVZpZXcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5jaWxsYXJpZXNWaWV3cy5sZW5ndGggPT09IDApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFuY2lsbGFyaWVzQ2xhc3NlcyA9IFwibnQtZnItZnJhZ21lbnQtYW5jaWxsYXJpZXNcIjtcclxuXHJcbiAgICBpZiAoZnJhZ21lbnQuc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgYW5jaWxsYXJpZXNDbGFzc2VzID0gYCR7YW5jaWxsYXJpZXNDbGFzc2VzfSBudC1mci1mcmFnbWVudC1jaGFpbmBcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhc3M6IGAke2FuY2lsbGFyaWVzQ2xhc3Nlc31gLFxyXG4gICAgICAgICAgICAgICAgdGFiaW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICAvLyBvbkJsdXI6IFtcclxuICAgICAgICAgICAgICAgIC8vICAgICBmcmFnbWVudEFjdGlvbnMuaGlkZU9wdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgKF9ldmVudDogYW55KSA9PiBmcmFnbWVudFxyXG4gICAgICAgICAgICAgICAgLy8gXVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgYW5jaWxsYXJpZXNWaWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZEFuY2lsbGFyaWVzQm94VmlldyA9IChcclxuICAgIGZyYWdtZW50OiBJUmVuZGVyRnJhZ21lbnQsXHJcbiAgICBhbmNpbGxhcmllczogQXJyYXk8SVJlbmRlckZyYWdtZW50PixcclxuICAgIGZyYWdtZW50RUxlbWVudElEOiBzdHJpbmcsXHJcbiAgICB2aWV3czogQ2hpbGRyZW5bXVxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBjb25zdCBhbmNpbGxhcmllc1ZpZXcgPSBidWlsZEFuY2lsbGFyaWVzVmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBhbmNpbGxhcmllc1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoIWFuY2lsbGFyaWVzVmlldykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2aWV3cy5wdXNoKFxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fYWAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczogXCJudC1mci1mcmFnbWVudC1ib3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBhbmNpbGxhcmllc1ZpZXdcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIClcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD5cclxuKTogeyB2aWV3OiBWTm9kZSwgaXNDb2xsYXBzZWQ6IGJvb2xlYW4gfSB8IG51bGwgPT4ge1xyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAmJiBvcHRpb25zWzBdLm9wdGlvbiA9PT0gJydcclxuICAgICkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3ID0gYnVpbGRDb2xsYXBzZWRPcHRpb25zVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZpZXcsXHJcbiAgICAgICAgICAgIGlzQ29sbGFwc2VkOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYnVpbGRFeHBhbmRlZE9wdGlvbnNWaWV3KFxyXG4gICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZE9wdGlvbnNCb3hWaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIG9wdGlvbnM6IEFycmF5PElSZW5kZXJGcmFnbWVudD4sXHJcbiAgICBmcmFnbWVudEVMZW1lbnRJRDogc3RyaW5nLFxyXG4gICAgdmlld3M6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMVxyXG4gICAgICAgICYmIG9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmcmFnbWVudC5zZWxlY3RlZFxyXG4gICAgICAgICYmICFmcmFnbWVudC51aS5mcmFnbWVudE9wdGlvbnNFeHBhbmRlZCkge1xyXG5cclxuICAgICAgICBidWlsZENvbGxhcHNlZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgZnJhZ21lbnRFTGVtZW50SUQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkRXhwYW5kZWRPcHRpb25zQm94VmlldyhcclxuICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgIHZpZXdzXHJcbiAgICApO1xyXG59O1xyXG5cclxuXHJcbmNvbnN0IG9wdGlvbnNWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChmcmFnbWVudDogSVJlbmRlckZyYWdtZW50KTogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiB9ID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgIHx8ICFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSAvLyBEb24ndCBkcmF3IG9wdGlvbnMgb2YgbGlua3NcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHZpZXdzOiBbXSxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNDb2xsYXBzZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDFcclxuICAgICAgICAgICAgJiYgZnJhZ21lbnQub3B0aW9uc1swXS5vcHRpb24gPT09ICcnXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB2aWV3czogW10sXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zQ29sbGFwc2VkOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc0FuZEFuY2lsbGFyaWVzID0gZ0ZyYWdtZW50Q29kZS5zcGxpdE9wdGlvbnNBbmRBbmNpbGxhcmllcyhmcmFnbWVudC5vcHRpb25zKTtcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld3M6IENoaWxkcmVuW10gPSBbXHJcblxyXG4gICAgICAgICAgICBidWlsZEFuY2lsbGFyaWVzVmlldyhcclxuICAgICAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgY29uc3Qgb3B0aW9uc1ZpZXdSZXN1bHRzID0gYnVpbGRPcHRpb25zVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIG9wdGlvbnNBbmRBbmNpbGxhcmllcy5vcHRpb25zXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnNWaWV3UmVzdWx0cykge1xyXG5cclxuICAgICAgICAgICAgdmlld3MucHVzaChvcHRpb25zVmlld1Jlc3VsdHMudmlldyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB2aWV3cyxcclxuICAgICAgICAgICAgb3B0aW9uc0NvbGxhcHNlZDogb3B0aW9uc1ZpZXdSZXN1bHRzPy5pc0NvbGxhcHNlZCA/PyBmYWxzZVxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIGJ1aWxkVmlldzI6IChcclxuICAgICAgICBmcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbiAgICApOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgICAgIHx8ICFVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC5pS2V5KSAvLyBEb24ndCBkcmF3IG9wdGlvbnMgb2YgbGlua3NcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZyYWdtZW50Lm9wdGlvbnMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgICYmIGZyYWdtZW50Lm9wdGlvbnNbMF0ub3B0aW9uID09PSAnJ1xyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEVMZW1lbnRJRCA9IGdGcmFnbWVudENvZGUuZ2V0RnJhZ21lbnRFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnNBbmRBbmNpbGxhcmllcyA9IGdGcmFnbWVudENvZGUuc3BsaXRPcHRpb25zQW5kQW5jaWxsYXJpZXMoZnJhZ21lbnQub3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGJ1aWxkQW5jaWxsYXJpZXNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLmFuY2lsbGFyaWVzLFxyXG4gICAgICAgICAgICBmcmFnbWVudEVMZW1lbnRJRCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBidWlsZE9wdGlvbnNCb3hWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgb3B0aW9uc0FuZEFuY2lsbGFyaWVzLm9wdGlvbnMsXHJcbiAgICAgICAgICAgIGZyYWdtZW50RUxlbWVudElELFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zVmlld3M7XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQ2hpbGRyZW4gfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IGZyYWdtZW50Vmlld3MgZnJvbSBcIi4vZnJhZ21lbnRWaWV3c1wiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkTGlua0Rpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGxldCBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gZmFsc2U7XHJcbiAgICBjb25zdCB2aWV3c0xlbmd0aCA9IHZpZXdzLmxlbmd0aDtcclxuXHJcbiAgICBpZiAodmlld3NMZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGxhc3RWaWV3OiBhbnkgPSB2aWV3c1t2aWV3c0xlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICBpZiAobGFzdFZpZXc/LnVpPy5pc0NvbGxhcHNlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgYWRqdXN0Rm9yQ29sbGFwc2VkT3B0aW9ucyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmtFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldExpbmtFbGVtZW50SUQoZnJhZ21lbnQuaWQpO1xyXG4gICAgY29uc3QgcmVzdWx0czogeyB2aWV3czogQ2hpbGRyZW5bXSwgb3B0aW9uc0NvbGxhcHNlZDogYm9vbGVhbiB9ID0gb3B0aW9uc1ZpZXdzLmJ1aWxkVmlldyhmcmFnbWVudCk7XHJcblxyXG4gICAgaWYgKGxpbmtFTGVtZW50SUQgPT09ICdudF9sa19mcmFnX3Q5NjhPSjF3bycpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFItRFJBV0lORyAke2xpbmtFTGVtZW50SUR9X2xgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZDogYCR7bGlua0VMZW1lbnRJRH1fbGAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibnQtZnItZnJhZ21lbnQtYm94XCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJudC1mci1wcmlvci1jb2xsYXBzZWQtb3B0aW9uc1wiOiBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID09PSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBgbnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1kaXNjdXNzaW9uXCI6IGZyYWdtZW50LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcIlwiXHJcbiAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdHMudmlld3NcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgaWYgKHJlc3VsdHMub3B0aW9uc0NvbGxhcHNlZCA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICB2aWV3LnVpID0ge1xyXG4gICAgICAgICAgICBpc0NvbGxhcHNlZDogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgdmlld3MucHVzaCh2aWV3KTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkTGlua0V4aXRzVmlldyA9IChcclxuICAgIF9mcmFnbWVudDogSVJlbmRlckZyYWdtZW50LFxyXG4gICAgX3ZpZXc6IENoaWxkcmVuW11cclxuKTogdm9pZCA9PiB7XHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG4gICAgLy8gaWYgKCFmcmFnbWVudC5vcHRpb25zXHJcbiAgICAvLyAgICAgfHwgZnJhZ21lbnQub3B0aW9ucy5sZW5ndGggPT09IDBcclxuICAgIC8vICAgICB8fCAhZnJhZ21lbnQudWkuZnJhZ21lbnRPcHRpb25zRXhwYW5kZWRcclxuICAgIC8vICkge1xyXG4gICAgLy8gICAgIHJldHVybjtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyBpZiAoIVUuaXNOdWxsT3JXaGl0ZVNwYWNlKGZyYWdtZW50LmV4aXRLZXkpKSB7XHJcblxyXG4gICAgLy8gICAgIC8vIFRoZW4gbWFwIGhhcyBhIHNpbmdsZSBleGl0IGFuZCBpdCB3YXMgbWVyZ2VkIGludG8gdGhpcyBmcmFnbWVudFxyXG4gICAgLy8gICAgIHJldHVybjtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyB2aWV3LnB1c2goXHJcblxyXG4gICAgLy8gICAgIGgoXCJkaXZcIixcclxuICAgIC8vICAgICAgICAge1xyXG4gICAgLy8gICAgICAgICAgICAgY2xhc3M6IFwibnQtZnItZXhpdHMtYm94XCJcclxuICAgIC8vICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAgW1xyXG4gICAgLy8gICAgICAgICAgICAgb3B0aW9uc1ZpZXdzLmJ1aWxkVmlldyhmcmFnbWVudClcclxuICAgIC8vICAgICAgICAgXVxyXG4gICAgLy8gICAgIClcclxuICAgIC8vICk7XHJcbn07XHJcblxyXG5jb25zdCBsaW5rVmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQsXHJcbiAgICAgICAgdmlld3M6IENoaWxkcmVuW11cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50XHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50LnVpLmRvTm90UGFpbnQgPT09IHRydWVcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYnVpbGRMaW5rRGlzY3Vzc2lvblZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGxpbmtWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50Lmxpbms/LnJvb3QsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgYnVpbGRMaW5rRXhpdHNWaWV3KFxyXG4gICAgICAgICAgICBmcmFnbWVudCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmcmFnbWVudFZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGxpbmtWaWV3cztcclxuXHJcblxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuXHJcbmltcG9ydCBJUmVuZGVyRnJhZ21lbnQgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvcmVuZGVyL0lSZW5kZXJGcmFnbWVudFwiO1xyXG5pbXBvcnQgZ0ZyYWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ0ZyYWdtZW50Q29kZVwiO1xyXG5pbXBvcnQgb3B0aW9uc1ZpZXdzIGZyb20gXCIuL29wdGlvbnNWaWV3c1wiO1xyXG5pbXBvcnQgbGlua1ZpZXdzIGZyb20gXCIuL2xpbmtWaWV3c1wiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5jb25zdCBidWlsZERpc2N1c3Npb25WaWV3ID0gKFxyXG4gICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHZpZXdzOiBDaGlsZHJlbltdXHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudC52YWx1ZSkgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFkanVzdEZvckNvbGxhcHNlZE9wdGlvbnMgPSBmYWxzZTtcclxuICAgIGNvbnN0IHZpZXdzTGVuZ3RoID0gdmlld3MubGVuZ3RoO1xyXG5cclxuICAgIGlmICh2aWV3c0xlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgY29uc3QgbGFzdFZpZXc6IGFueSA9IHZpZXdzW3ZpZXdzTGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgIGlmIChsYXN0Vmlldz8udWk/LmlzQ29sbGFwc2VkID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJhZ21lbnRFTGVtZW50SUQgPSBnRnJhZ21lbnRDb2RlLmdldEZyYWdtZW50RWxlbWVudElEKGZyYWdtZW50LmlkKTtcclxuXHJcbiAgICB2aWV3cy5wdXNoKFxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlkOiBgJHtmcmFnbWVudEVMZW1lbnRJRH1fZGAsXHJcbiAgICAgICAgICAgICAgICBjbGFzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwibnQtZnItZnJhZ21lbnQtYm94XCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJudC1mci1wcmlvci1jb2xsYXBzZWQtb3B0aW9uc1wiOiBhZGp1c3RGb3JDb2xsYXBzZWRPcHRpb25zID09PSB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBgbnQtZnItZnJhZ21lbnQtZGlzY3Vzc2lvbmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS1kaXNjdXNzaW9uXCI6IGZyYWdtZW50LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBcIlwiXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IGZyYWdtZW50Vmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoXHJcbiAgICAgICAgZnJhZ21lbnQ6IElSZW5kZXJGcmFnbWVudCB8IG51bGwgfCB1bmRlZmluZWQsXHJcbiAgICAgICAgdmlld3M6IENoaWxkcmVuW11cclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWZyYWdtZW50XHJcbiAgICAgICAgICAgIHx8IGZyYWdtZW50LnVpLmRvTm90UGFpbnQgPT09IHRydWVcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYnVpbGREaXNjdXNzaW9uVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgbGlua1ZpZXdzLmJ1aWxkVmlldyhcclxuICAgICAgICAgICAgZnJhZ21lbnQubGluaz8ucm9vdCxcclxuICAgICAgICAgICAgdmlld3NcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBvcHRpb25zVmlld3MuYnVpbGRWaWV3MihcclxuICAgICAgICAgICAgZnJhZ21lbnQsXHJcbiAgICAgICAgICAgIHZpZXdzXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZnJhZ21lbnRWaWV3cy5idWlsZFZpZXcoXHJcbiAgICAgICAgICAgIGZyYWdtZW50LnNlbGVjdGVkLFxyXG4gICAgICAgICAgICB2aWV3c1xyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmcmFnbWVudFZpZXdzO1xyXG5cclxuXHJcbiIsImltcG9ydCB7IENoaWxkcmVuLCBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuXHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBmcmFnbWVudFZpZXdzIGZyb20gXCIuL2ZyYWdtZW50Vmlld3NcIjtcclxuLy8gaW1wb3J0IGdEZWJ1Z2dlckNvZGUgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9jb2RlL2dEZWJ1Z2dlckNvZGVcIjtcclxuXHJcbmltcG9ydCBcIi4uL3Njc3MvZnJhZ21lbnRzLnNjc3NcIjtcclxuXHJcblxyXG5jb25zdCBndWlkZVZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkQ29udGVudFZpZXc6IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBpbm5lclZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcblxyXG4gICAgICAgIGZyYWdtZW50Vmlld3MuYnVpbGRWaWV3KFxyXG4gICAgICAgICAgICBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3QsXHJcbiAgICAgICAgICAgIGlubmVyVmlld3NcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIC8vIGdEZWJ1Z2dlckNvZGUubG9nUm9vdChzdGF0ZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIixcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogXCJudF9mcl9GcmFnbWVudHNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBpbm5lclZpZXdzXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ3VpZGVWaWV3cztcclxuXHJcblxyXG4iLCJpbXBvcnQgeyBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuXHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlXCI7XHJcbmltcG9ydCBpbml0QWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9pbml0QWN0aW9uc1wiO1xyXG5pbXBvcnQgZ3VpZGVWaWV3cyBmcm9tIFwiLi4vLi4vZnJhZ21lbnRzL3ZpZXdzL2d1aWRlVmlld3NcIjtcclxuXHJcblxyXG5jb25zdCBpbml0VmlldyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgICAgICBoKFwiZGl2XCIsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogaW5pdEFjdGlvbnMuc2V0Tm90UmF3LFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBcInRyZWVTb2x2ZUZyYWdtZW50c1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgIGd1aWRlVmlld3MuYnVpbGRDb250ZW50VmlldyhzdGF0ZSksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0VmlldztcclxuXHJcbiIsImltcG9ydCBJU2V0dGluZ3MgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvdXNlci9JU2V0dGluZ3NcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXR0aW5ncyBpbXBsZW1lbnRzIElTZXR0aW5ncyB7XHJcblxyXG4gICAgcHVibGljIGtleTogc3RyaW5nID0gXCItMVwiO1xyXG4gICAgcHVibGljIHI6IHN0cmluZyA9IFwiLTFcIjtcclxuXHJcbiAgICAvLyBBdXRoZW50aWNhdGlvblxyXG4gICAgcHVibGljIHVzZXJQYXRoOiBzdHJpbmcgPSBgdXNlcmA7XHJcbiAgICBwdWJsaWMgZGVmYXVsdExvZ291dFBhdGg6IHN0cmluZyA9IGBsb2dvdXRgO1xyXG4gICAgcHVibGljIGRlZmF1bHRMb2dpblBhdGg6IHN0cmluZyA9IGBsb2dpbmA7XHJcbiAgICBwdWJsaWMgcmV0dXJuVXJsU3RhcnQ6IHN0cmluZyA9IGByZXR1cm5VcmxgO1xyXG5cclxuICAgIHByaXZhdGUgYmFzZVVybDogc3RyaW5nID0gKHdpbmRvdyBhcyBhbnkpLkFTU0lTVEFOVF9CQVNFX1VSTCA/PyAnJztcclxuICAgIHB1YmxpYyBsaW5rVXJsOiBzdHJpbmcgPSAod2luZG93IGFzIGFueSkuQVNTSVNUQU5UX0xJTktfVVJMID8/ICcnO1xyXG4gICAgcHVibGljIHN1YnNjcmlwdGlvbklEOiBzdHJpbmcgPSAod2luZG93IGFzIGFueSkuQVNTSVNUQU5UX1NVQlNDUklQVElPTl9JRCA/PyAnJztcclxuXHJcbiAgICBwdWJsaWMgYXBpVXJsOiBzdHJpbmcgPSBgJHt0aGlzLmJhc2VVcmx9L2FwaWA7XHJcbiAgICBwdWJsaWMgYmZmVXJsOiBzdHJpbmcgPSBgJHt0aGlzLmJhc2VVcmx9L2JmZmA7XHJcbiAgICBwdWJsaWMgZmlsZVVybDogc3RyaW5nID0gYCR7dGhpcy5iYXNlVXJsfS9maWxlYDtcclxufVxyXG4iLCJcclxuZXhwb3J0IGVudW0gbmF2aWdhdGlvbkRpcmVjdGlvbiB7XHJcblxyXG4gICAgQnV0dG9ucyA9ICdidXR0b25zJyxcclxuICAgIEJhY2t3YXJkcyA9ICdiYWNrd2FyZHMnLFxyXG4gICAgRm9yd2FyZHMgPSAnZm9yd2FyZHMnXHJcbn1cclxuXHJcbiIsImltcG9ydCB7IG5hdmlnYXRpb25EaXJlY3Rpb24gfSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9lbnVtcy9uYXZpZ2F0aW9uRGlyZWN0aW9uXCI7XHJcbmltcG9ydCBJSGlzdG9yeSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5XCI7XHJcbmltcG9ydCBJSGlzdG9yeVVybCBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5VXJsXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGlzdG9yeSBpbXBsZW1lbnRzIElIaXN0b3J5IHtcclxuXHJcbiAgICBwdWJsaWMgaGlzdG9yeUNoYWluOiBBcnJheTxJSGlzdG9yeVVybD4gPSBbXTtcclxuICAgIHB1YmxpYyBkaXJlY3Rpb246IG5hdmlnYXRpb25EaXJlY3Rpb24gPSBuYXZpZ2F0aW9uRGlyZWN0aW9uLkJ1dHRvbnM7XHJcbiAgICBwdWJsaWMgY3VycmVudEluZGV4OiBudW1iZXIgPSAwO1xyXG59XHJcbiIsImltcG9ydCBJVXNlciBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91c2VyL0lVc2VyXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXNlciBpbXBsZW1lbnRzIElVc2VyIHtcclxuXHJcbiAgICBwdWJsaWMga2V5OiBzdHJpbmcgPSBgMDEyMzQ1Njc4OWA7XHJcbiAgICBwdWJsaWMgcjogc3RyaW5nID0gXCItMVwiO1xyXG4gICAgcHVibGljIHVzZVZzQ29kZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgYXV0aG9yaXNlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIHJhdzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgbG9nb3V0VXJsOiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgcHVibGljIHNob3dNZW51OiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nID0gXCJcIjtcclxuICAgIHB1YmxpYyBzdWI6IHN0cmluZyA9IFwiXCI7XHJcbn1cclxuIiwiaW1wb3J0IElSZXBlYXRFZmZlY3RzIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSVJlcGVhdEVmZmVjdHNcIjtcclxuaW1wb3J0IElIdHRwRWZmZWN0IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL2VmZmVjdHMvSUh0dHBFZmZlY3RcIjtcclxuaW1wb3J0IElBY3Rpb24gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSUFjdGlvblwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcGVhdGVFZmZlY3RzIGltcGxlbWVudHMgSVJlcGVhdEVmZmVjdHMge1xyXG5cclxuICAgIHB1YmxpYyBzaG9ydEludGVydmFsSHR0cDogQXJyYXk8SUh0dHBFZmZlY3Q+ID0gW107XHJcbiAgICBwdWJsaWMgcmVMb2FkR2V0SHR0cEltbWVkaWF0ZTogQXJyYXk8SUh0dHBFZmZlY3Q+ID0gW107XHJcbiAgICBwdWJsaWMgcnVuQWN0aW9uSW1tZWRpYXRlOiBBcnJheTxJQWN0aW9uPiA9IFtdO1xyXG59XHJcbiIsImltcG9ydCBJUmVuZGVyU3RhdGVVSSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9zdGF0ZS91aS9JUmVuZGVyU3RhdGVVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlclN0YXRlVUkgaW1wbGVtZW50cyBJUmVuZGVyU3RhdGVVSSB7XHJcblxyXG4gICAgcHVibGljIHJhdzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgb3B0aW9uc0V4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbn1cclxuIiwiaW1wb3J0IElEaXNwbGF5R3VpZGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheUd1aWRlXCI7XHJcbmltcG9ydCBJRGlzcGxheVNlY3Rpb24gZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvZGlzcGxheS9JRGlzcGxheVNlY3Rpb25cIjtcclxuaW1wb3J0IElSZW5kZXJTdGF0ZSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9JUmVuZGVyU3RhdGVcIjtcclxuaW1wb3J0IElDaGFpblNlZ21lbnQgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvc2VnbWVudHMvSUNoYWluU2VnbWVudFwiO1xyXG5pbXBvcnQgSVJlbmRlclN0YXRlVUkgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvdWkvSVJlbmRlclN0YXRlVUlcIjtcclxuaW1wb3J0IFJlbmRlclN0YXRlVUkgZnJvbSBcIi4vdWkvUmVuZGVyU3RhdGVVSVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbmRlclN0YXRlIGltcGxlbWVudHMgSVJlbmRlclN0YXRlIHtcclxuXHJcbiAgICBwdWJsaWMgcmVmcmVzaFVybDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIGlzQ2hhaW5Mb2FkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgc2VnbWVudHM6IEFycmF5PElDaGFpblNlZ21lbnQ+ID0gW107XHJcbiAgICBwdWJsaWMgZGlzcGxheUd1aWRlOiBJRGlzcGxheUd1aWRlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgb3V0bGluZXM6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIG91dGxpbmVVcmxzOiBhbnkgPSB7fTtcclxuICAgIHB1YmxpYyBjdXJyZW50U2VjdGlvbjogSURpc3BsYXlTZWN0aW9uIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgLy8gU2VhcmNoIGluZGljZXNcclxuICAgIHB1YmxpYyBpbmRleF9vdXRsaW5lTm9kZXNfaWQ6IGFueSA9IHt9O1xyXG4gICAgcHVibGljIGluZGV4X2NoYWluRnJhZ21lbnRzX2lkOiBhbnkgPSB7fTtcclxuXHJcbiAgICBwdWJsaWMgdWk6IElSZW5kZXJTdGF0ZVVJID0gbmV3IFJlbmRlclN0YXRlVUkoKTtcclxufVxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgU2V0dGluZ3MgZnJvbSBcIi4vdXNlci9TZXR0aW5nc1wiO1xyXG5pbXBvcnQgSVNldHRpbmdzIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVNldHRpbmdzXCI7XHJcbmltcG9ydCBJSGlzdG9yeSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9oaXN0b3J5L0lIaXN0b3J5XCI7XHJcbmltcG9ydCBTdGVwSGlzdG9yeSBmcm9tIFwiLi9oaXN0b3J5L0hpc3RvcnlcIjtcclxuaW1wb3J0IElVc2VyIGZyb20gXCIuLi9pbnRlcmZhY2VzL3N0YXRlL3VzZXIvSVVzZXJcIjtcclxuaW1wb3J0IFVzZXIgZnJvbSBcIi4vdXNlci9Vc2VyXCI7XHJcbmltcG9ydCBJUmVwZWF0RWZmZWN0cyBmcm9tIFwiLi4vaW50ZXJmYWNlcy9zdGF0ZS9lZmZlY3RzL0lSZXBlYXRFZmZlY3RzXCI7XHJcbmltcG9ydCBSZXBlYXRlRWZmZWN0cyBmcm9tIFwiLi9lZmZlY3RzL1JlcGVhdGVFZmZlY3RzXCI7XHJcbmltcG9ydCBJUmVuZGVyU3RhdGUgZnJvbSBcIi4uL2ludGVyZmFjZXMvc3RhdGUvSVJlbmRlclN0YXRlXCI7XHJcbmltcG9ydCBSZW5kZXJTdGF0ZSBmcm9tIFwiLi9SZW5kZXJTdGF0ZVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlIGltcGxlbWVudHMgSVN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgY29uc3Qgc2V0dGluZ3M6IElTZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbG9hZGluZzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBwdWJsaWMgZGVidWc6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHVibGljIGdlbmVyaWNFcnJvcjogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHVibGljIG5leHRLZXk6IG51bWJlciA9IC0xO1xyXG4gICAgcHVibGljIHNldHRpbmdzOiBJU2V0dGluZ3M7XHJcbiAgICBwdWJsaWMgdXNlcjogSVVzZXIgPSBuZXcgVXNlcigpO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgcmVuZGVyU3RhdGU6IElSZW5kZXJTdGF0ZSA9IG5ldyBSZW5kZXJTdGF0ZSgpO1xyXG5cclxuICAgIHB1YmxpYyByZXBlYXRFZmZlY3RzOiBJUmVwZWF0RWZmZWN0cyA9IG5ldyBSZXBlYXRlRWZmZWN0cygpO1xyXG5cclxuICAgIHB1YmxpYyBzdGVwSGlzdG9yeTogSUhpc3RvcnkgPSBuZXcgU3RlcEhpc3RvcnkoKTtcclxufVxyXG5cclxuXHJcbiIsIlxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgVSBmcm9tIFwiLi4vZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvZW51bXMvQWN0aW9uVHlwZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCB7IElIdHRwRmV0Y2hJdGVtIH0gZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvaHR0cC9JSHR0cEZldGNoSXRlbVwiO1xyXG5pbXBvcnQgeyBnQXV0aGVudGljYXRlZEh0dHAgfSBmcm9tIFwiLi4vaHR0cC9nQXV0aGVudGljYXRpb25IdHRwXCI7XHJcbmltcG9ydCBnQWpheEhlYWRlckNvZGUgZnJvbSBcIi4uL2h0dHAvZ0FqYXhIZWFkZXJDb2RlXCI7XHJcbmltcG9ydCBnUmVuZGVyQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9nT3V0bGluZUFjdGlvbnNcIjtcclxuaW1wb3J0IElTdGF0ZUFueUFycmF5IGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZUFueUFycmF5XCI7XHJcbmltcG9ydCBnRmlsZUNvbnN0YW50cyBmcm9tIFwiLi4vZ0ZpbGVDb25zdGFudHNcIjtcclxuaW1wb3J0IGdPdXRsaW5lQ29kZSBmcm9tIFwiLi4vY29kZS9nT3V0bGluZUNvZGVcIjtcclxuXHJcblxyXG5jb25zdCBnZXRHdWlkZU91dGxpbmUgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyB8IG51bGwsXHJcbiAgICBsb2FkRGVsZWdhdGU6IChzdGF0ZTogSVN0YXRlLCBvdXRsaW5lUmVzcG9uc2U6IGFueSkgPT4gSVN0YXRlQW55QXJyYXlcclxuKTogSUh0dHBGZXRjaEl0ZW0gfCB1bmRlZmluZWQgPT4ge1xyXG5cclxuICAgIGlmIChVLmlzTnVsbE9yV2hpdGVTcGFjZShmcmFnbWVudEZvbGRlclVybCkgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2FsbElEOiBzdHJpbmcgPSBVLmdlbmVyYXRlR3VpZCgpO1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gZ0FqYXhIZWFkZXJDb2RlLmJ1aWxkSGVhZGVycyhcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBjYWxsSUQsXHJcbiAgICAgICAgQWN0aW9uVHlwZS5HZXRPdXRsaW5lXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHVybDogc3RyaW5nID0gYCR7ZnJhZ21lbnRGb2xkZXJVcmx9LyR7Z0ZpbGVDb25zdGFudHMuZ3VpZGVPdXRsaW5lRmlsZW5hbWV9YDtcclxuXHJcbiAgICBjb25zdCBsb2FkUmVxdWVzdGVkID0gZ091dGxpbmVDb2RlLnJlZ2lzdGVyT3V0bGluZVVybERvd25sb2FkKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHVybFxyXG4gICAgKTtcclxuXHJcbiAgICBpZiAobG9hZFJlcXVlc3RlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZ0F1dGhlbnRpY2F0ZWRIdHRwKHtcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlc3BvbnNlOiAnanNvbicsXHJcbiAgICAgICAgYWN0aW9uOiBsb2FkRGVsZWdhdGUsXHJcbiAgICAgICAgZXJyb3I6IChzdGF0ZTogSVN0YXRlLCBlcnJvckRldGFpbHM6IGFueSkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coYHtcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIkVycm9yIGdldHRpbmcgb3V0bGluZSBkYXRhIGZyb20gdGhlIHNlcnZlci5cIixcclxuICAgICAgICAgICAgICAgIFwidXJsXCI6ICR7dXJsfSxcclxuICAgICAgICAgICAgICAgIFwiZXJyb3IgRGV0YWlsc1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscyl9LFxyXG4gICAgICAgICAgICAgICAgXCJzdGFja1wiOiAke0pTT04uc3RyaW5naWZ5KGVycm9yRGV0YWlscy5zdGFjayl9LFxyXG4gICAgICAgICAgICAgICAgXCJtZXRob2RcIjogJHtnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUubmFtZX0sXHJcbiAgICAgICAgICAgICAgICBcImNhbGxJRDogJHtjYWxsSUR9XHJcbiAgICAgICAgICAgIH1gKTtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0KGB7XHJcbiAgICAgICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJFcnJvciBnZXR0aW5nIG91dGxpbmUgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIuXCIsXHJcbiAgICAgICAgICAgICAgICBcInVybFwiOiAke3VybH0sXHJcbiAgICAgICAgICAgICAgICBcImVycm9yIERldGFpbHNcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMpfSxcclxuICAgICAgICAgICAgICAgIFwic3RhY2tcIjogJHtKU09OLnN0cmluZ2lmeShlcnJvckRldGFpbHMuc3RhY2spfSxcclxuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6ICR7Z1JlbmRlckVmZmVjdHMuZ2V0R3VpZGVPdXRsaW5lLm5hbWV9LFxyXG4gICAgICAgICAgICAgICAgXCJjYWxsSUQ6ICR7Y2FsbElEfVxyXG4gICAgICAgICAgICB9YCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbmNvbnN0IGdSZW5kZXJFZmZlY3RzID0ge1xyXG5cclxuICAgIGdldEd1aWRlT3V0bGluZTogKHN0YXRlOiBJU3RhdGUpOiBJSHR0cEZldGNoSXRlbSB8IHVuZGVmaW5lZCA9PiB7XHJcblxyXG4gICAgICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZnJhZ21lbnRGb2xkZXJVcmw6IHN0cmluZyA9IHN0YXRlLnJlbmRlclN0YXRlLmRpc3BsYXlHdWlkZT8uZ3VpZGUuZnJhZ21lbnRGb2xkZXJVcmwgPz8gJ251bGwnO1xyXG5cclxuICAgICAgICBjb25zdCBsb2FkRGVsZWdhdGUgPSAoXHJcbiAgICAgICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgICAgIG91dGxpbmVSZXNwb25zZTogYW55XHJcbiAgICAgICAgKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGdSZW5kZXJBY3Rpb25zLmxvYWRHdWlkZU91dGxpbmVQcm9wZXJ0aWVzKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRHdWlkZU91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybCxcclxuICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0R3VpZGVPdXRsaW5lQW5kTG9hZFNlZ21lbnRzOiAoc3RhdGU6IElTdGF0ZSk6IElIdHRwRmV0Y2hJdGVtIHwgdW5kZWZpbmVkID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudEZvbGRlclVybDogc3RyaW5nID0gc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5ndWlkZS5mcmFnbWVudEZvbGRlclVybCA/PyAnbnVsbCc7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWREZWxlZ2F0ZSA9IChcclxuICAgICAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICAgICAgb3V0bGluZVJlc3BvbnNlOiBhbnlcclxuICAgICAgICApOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZ1JlbmRlckFjdGlvbnMubG9hZEd1aWRlT3V0bGluZUFuZFNlZ21lbnRzKFxyXG4gICAgICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lUmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBnZXRHdWlkZU91dGxpbmUoXHJcbiAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICBmcmFnbWVudEZvbGRlclVybCxcclxuICAgICAgICAgICAgbG9hZERlbGVnYXRlXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGdSZW5kZXJFZmZlY3RzO1xyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgSVN0YXRlQW55QXJyYXkgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvc3RhdGUvSVN0YXRlQW55QXJyYXlcIjtcclxuaW1wb3J0IFN0YXRlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9TdGF0ZVwiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcbmltcG9ydCBVIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvZ1V0aWxpdGllc1wiO1xyXG5pbXBvcnQgZ1JlbmRlckVmZmVjdHMgZnJvbSBcIi4uLy4uLy4uL2dsb2JhbC9lZmZlY3RzL2dSZW5kZXJFZmZlY3RzXCI7XHJcbmltcG9ydCBnUmVuZGVyQ29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1JlbmRlckNvZGVcIjtcclxuaW1wb3J0IGdTZWdtZW50Q29kZSBmcm9tIFwiLi4vLi4vLi4vZ2xvYmFsL2NvZGUvZ1NlZ21lbnRDb2RlXCI7XHJcbmltcG9ydCB7IE91dGxpbmVUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvZW51bXMvT3V0bGluZVR5cGVcIjtcclxuXHJcblxyXG5jb25zdCBpbml0aWFsaXNlU3RhdGUgPSAoKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICBpZiAoIXdpbmRvdy5UcmVlU29sdmUpIHtcclxuXHJcbiAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdGF0ZTogSVN0YXRlID0gbmV3IFN0YXRlKCk7XHJcbiAgICBnUmVuZGVyQ29kZS5wYXJzZVJlbmRlcmluZ0NvbW1lbnQoc3RhdGUpO1xyXG5cclxuICAgIHJldHVybiBzdGF0ZTtcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkUmVuZGVyRGlzcGxheSA9IChzdGF0ZTogSVN0YXRlKTogSVN0YXRlQW55QXJyYXkgPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290KSB7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoVS5pc051bGxPcldoaXRlU3BhY2Uoc3RhdGUucmVuZGVyU3RhdGUuZGlzcGxheUd1aWRlPy5yb290LmlLZXkpID09PSB0cnVlXHJcbiAgICAgICAgJiYgKCFzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3Qub3B0aW9uc1xyXG4gICAgICAgICAgICB8fCBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3Qub3B0aW9ucy5sZW5ndGggPT09IDApXHJcbiAgICApIHtcclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmUoc3RhdGUpXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRTZWdtZW50c1JlbmRlckRpc3BsYXkgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgcXVlcnlTdHJpbmc6IHN0cmluZ1xyXG4pOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgc3RhdGUucmVuZGVyU3RhdGUuaXNDaGFpbkxvYWQgPSB0cnVlO1xyXG5cclxuICAgIGdTZWdtZW50Q29kZS5wYXJzZVNlZ21lbnRzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHF1ZXJ5U3RyaW5nXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNlZ21lbnRzID0gc3RhdGUucmVuZGVyU3RhdGUuc2VnbWVudHM7XHJcblxyXG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSB3YXMgb25seSAxIHNlZ21lbnRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgcm9vdFNlZ21lbnQgPSBzZWdtZW50c1swXTtcclxuXHJcbiAgICBpZiAoIXJvb3RTZWdtZW50LnN0YXJ0LmlzUm9vdCkge1xyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHdWlkZVJvb3Qgbm90IHByZXNlbnRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlyc3RTZWdtZW50ID0gc2VnbWVudHNbMV07XHJcblxyXG4gICAgaWYgKCFmaXJzdFNlZ21lbnQuc3RhcnQuaXNMYXN0XHJcbiAgICAgICAgJiYgZmlyc3RTZWdtZW50LnN0YXJ0LnR5cGUgIT09IE91dGxpbmVUeXBlLkxpbmtcclxuICAgICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcXVlcnkgc3RyaW5nIGZvcm1hdCAtIGl0IHNob3VsZCBzdGFydCB3aXRoICctJyBvciAnfidcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICBzdGF0ZSxcclxuICAgICAgICBnUmVuZGVyRWZmZWN0cy5nZXRHdWlkZU91dGxpbmVBbmRMb2FkU2VnbWVudHMoc3RhdGUpXHJcbiAgICBdO1xyXG59O1xyXG5cclxuY29uc3QgaW5pdFN0YXRlID0ge1xyXG5cclxuICAgIGluaXRpYWxpc2U6ICgpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlOiBJU3RhdGUgPSBpbml0aWFsaXNlU3RhdGUoKTtcclxuICAgICAgICBjb25zdCBxdWVyeVN0cmluZzogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgIGlmICghVS5pc051bGxPcldoaXRlU3BhY2UocXVlcnlTdHJpbmcpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkU2VnbWVudHNSZW5kZXJEaXNwbGF5KFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5U3RyaW5nXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZW5kZXJEaXNwbGF5KHN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGU6IGFueSkge1xyXG5cclxuICAgICAgICAgICAgc3RhdGUuZ2VuZXJpY0Vycm9yID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRTdGF0ZTtcclxuXHJcbiIsImltcG9ydCBGaWx0ZXJzIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS9jb25zdGFudHMvRmlsdGVyc1wiO1xyXG5pbXBvcnQgVHJlZVNvbHZlIGZyb20gXCIuLi8uLi8uLi9zdGF0ZS93aW5kb3cvVHJlZVNvbHZlXCI7XHJcblxyXG5cclxuY29uc3QgcmVuZGVyQ29tbWVudHMgPSB7XHJcblxyXG4gICAgcmVnaXN0ZXJHdWlkZUNvbW1lbnQ6ICgpID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdHJlZVNvbHZlR3VpZGU6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoRmlsdGVycy50cmVlU29sdmVHdWlkZUlEKSBhcyBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRyZWVTb2x2ZUd1aWRlXHJcbiAgICAgICAgICAgICYmIHRyZWVTb2x2ZUd1aWRlLmhhc0NoaWxkTm9kZXMoKSA9PT0gdHJ1ZVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGROb2RlOiBDaGlsZE5vZGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWVTb2x2ZUd1aWRlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSB0cmVlU29sdmVHdWlkZS5jaGlsZE5vZGVzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93LlRyZWVTb2x2ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LlRyZWVTb2x2ZSA9IG5ldyBUcmVlU29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5UcmVlU29sdmUucmVuZGVyaW5nQ29tbWVudCA9IGNoaWxkTm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGROb2RlLm5vZGVUeXBlICE9PSBOb2RlLlRFWFRfTk9ERSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCByZW5kZXJDb21tZW50cztcclxuIiwiaW1wb3J0IHsgYXBwIH0gZnJvbSBcIi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XG5cbmltcG9ydCBpbml0U3Vic2NyaXB0aW9ucyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9zdWJzY3JpcHRpb25zL2luaXRTdWJzY3JpcHRpb25zXCI7XG5pbXBvcnQgaW5pdEV2ZW50cyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHNcIjtcbmltcG9ydCBpbml0VmlldyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC92aWV3cy9pbml0Vmlld1wiO1xuaW1wb3J0IGluaXRTdGF0ZSBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRTdGF0ZVwiO1xuaW1wb3J0IHJlbmRlckNvbW1lbnRzIGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvcmVuZGVyQ29tbWVudHNcIjtcblxuXG5pbml0RXZlbnRzLnJlZ2lzdGVyR2xvYmFsRXZlbnRzKCk7XG5yZW5kZXJDb21tZW50cy5yZWdpc3Rlckd1aWRlQ29tbWVudCgpO1xuXG4od2luZG93IGFzIGFueSkuQ29tcG9zaXRlRmxvd3NBdXRob3IgPSBhcHAoe1xuICAgIFxuICAgIG5vZGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHJlZVNvbHZlRnJhZ21lbnRzXCIpLFxuICAgIGluaXQ6IGluaXRTdGF0ZS5pbml0aWFsaXNlLFxuICAgIHZpZXc6IGluaXRWaWV3LmJ1aWxkVmlldyxcbiAgICBzdWJzY3JpcHRpb25zOiBpbml0U3Vic2NyaXB0aW9ucyxcbiAgICBvbkVuZDogaW5pdEV2ZW50cy5vblJlbmRlckZpbmlzaGVkXG59KTtcblxuXG4iXSwibmFtZXMiOlsicHJvcHMiLCJjb3VudCIsIm91dHB1dCIsIlUiLCJsb2NhdGlvbiIsImVmZmVjdCIsImh0dHBFZmZlY3QiLCJBY3Rpb25UeXBlIiwic3RhdGUiLCJQYXJzZVR5cGUiLCJPdXRsaW5lVHlwZSIsIlNjcm9sbEhvcFR5cGUiLCJvdXRsaW5lUmVzcG9uc2UiLCJuYXZpZ2F0aW9uRGlyZWN0aW9uIiwiU3RlcEhpc3RvcnkiLCJnUmVuZGVyQWN0aW9ucyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxnQkFBZ0I7QUFDcEIsSUFBSSxZQUFZO0FBQ2hCLElBQUksWUFBWTtBQUNoQixJQUFJLFlBQVksQ0FBQTtBQUNoQixJQUFJLFlBQVksQ0FBQTtBQUNoQixJQUFJLE1BQU0sVUFBVTtBQUNwQixJQUFJLFVBQVUsTUFBTTtBQUNwQixJQUFJLFFBQ0YsT0FBTywwQkFBMEIsY0FDN0Isd0JBQ0E7QUFFTixJQUFJLGNBQWMsU0FBUyxLQUFLO0FBQzlCLE1BQUksTUFBTTtBQUVWLE1BQUksT0FBTyxRQUFRLFNBQVUsUUFBTztBQUVwQyxNQUFJLFFBQVEsR0FBRyxLQUFLLElBQUksU0FBUyxHQUFHO0FBQ2xDLGFBQVMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSztBQUN4QyxXQUFLLE1BQU0sWUFBWSxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUk7QUFDdEMsZ0JBQVEsT0FBTyxPQUFPO0FBQUEsTUFDeEI7QUFBQSxJQUNGO0FBQUEsRUFDRixPQUFPO0FBQ0wsYUFBUyxLQUFLLEtBQUs7QUFDakIsVUFBSSxJQUFJLENBQUMsR0FBRztBQUNWLGdCQUFRLE9BQU8sT0FBTztBQUFBLE1BQ3hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxJQUFJLFFBQVEsU0FBUyxHQUFHLEdBQUc7QUFDekIsTUFBSSxNQUFNLENBQUE7QUFFVixXQUFTLEtBQUssRUFBRyxLQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0IsV0FBUyxLQUFLLEVBQUcsS0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBRTdCLFNBQU87QUFDVDtBQUVBLElBQUksUUFBUSxTQUFTLE1BQU07QUFDekIsU0FBTyxLQUFLLE9BQU8sU0FBUyxLQUFLLE1BQU07QUFDckMsV0FBTyxJQUFJO0FBQUEsTUFDVCxDQUFDLFFBQVEsU0FBUyxPQUNkLElBQ0EsT0FBTyxLQUFLLENBQUMsTUFBTSxhQUNuQixDQUFDLElBQUksSUFDTCxNQUFNLElBQUk7QUFBQSxJQUNwQjtBQUFBLEVBQ0UsR0FBRyxTQUFTO0FBQ2Q7QUFFQSxJQUFJLGVBQWUsU0FBUyxHQUFHLEdBQUc7QUFDaEMsU0FBTyxRQUFRLENBQUMsS0FBSyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxPQUFPLEVBQUUsQ0FBQyxNQUFNO0FBQ3RFO0FBRUEsSUFBSSxnQkFBZ0IsU0FBUyxHQUFHLEdBQUc7QUFDakMsTUFBSSxNQUFNLEdBQUc7QUFDWCxhQUFTLEtBQUssTUFBTSxHQUFHLENBQUMsR0FBRztBQUN6QixVQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFHLFFBQU87QUFDdkQsUUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQUksWUFBWSxTQUFTLFNBQVMsU0FBUyxVQUFVO0FBQ25ELFdBQ00sSUFBSSxHQUFHLFFBQVEsUUFBUSxPQUFPLENBQUEsR0FDbEMsSUFBSSxRQUFRLFVBQVUsSUFBSSxRQUFRLFFBQ2xDLEtBQ0E7QUFDQSxhQUFTLFFBQVEsQ0FBQztBQUNsQixhQUFTLFFBQVEsQ0FBQztBQUNsQixTQUFLO0FBQUEsTUFDSCxTQUNJLENBQUMsVUFDRCxPQUFPLENBQUMsTUFBTSxPQUFPLENBQUMsS0FDdEIsY0FBYyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxJQUNoQztBQUFBLFFBQ0UsT0FBTyxDQUFDO0FBQUEsUUFDUixPQUFPLENBQUM7QUFBQSxRQUNSLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxDQUFDLENBQUM7QUFBQSxRQUM3QixVQUFVLE9BQU8sQ0FBQyxFQUFDO0FBQUEsTUFDakMsSUFDWSxTQUNGLFVBQVUsT0FBTyxDQUFDLEVBQUM7QUFBQSxJQUM3QjtBQUFBLEVBQ0U7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxJQUFJLGdCQUFnQixTQUFTLE1BQU0sS0FBSyxVQUFVLFVBQVUsVUFBVSxPQUFPO0FBQzNFLE1BQUksUUFBUSxNQUFPO0FBQUEsV0FDUixRQUFRLFNBQVM7QUFDMUIsYUFBUyxLQUFLLE1BQU0sVUFBVSxRQUFRLEdBQUc7QUFDdkMsaUJBQVcsWUFBWSxRQUFRLFNBQVMsQ0FBQyxLQUFLLE9BQU8sS0FBSyxTQUFTLENBQUM7QUFDcEUsVUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLO0FBQ2hCLGFBQUssR0FBRyxFQUFFLFlBQVksR0FBRyxRQUFRO0FBQUEsTUFDbkMsT0FBTztBQUNMLGFBQUssR0FBRyxFQUFFLENBQUMsSUFBSTtBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLEVBQ0YsV0FBVyxJQUFJLENBQUMsTUFBTSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUs7QUFDM0MsUUFDRSxHQUFHLEtBQUssWUFBWSxLQUFLLFVBQVUsQ0FBQSxJQUNoQyxNQUFNLElBQUksTUFBTSxDQUFDLEVBQUUsWUFBVyxDQUN2QyxJQUFVLFdBQ0o7QUFDQSxXQUFLLG9CQUFvQixLQUFLLFFBQVE7QUFBQSxJQUN4QyxXQUFXLENBQUMsVUFBVTtBQUNwQixXQUFLLGlCQUFpQixLQUFLLFFBQVE7QUFBQSxJQUNyQztBQUFBLEVBQ0YsV0FBVyxDQUFDLFNBQVMsUUFBUSxVQUFVLE9BQU8sTUFBTTtBQUNsRCxTQUFLLEdBQUcsSUFBSSxZQUFZLFFBQVEsWUFBWSxjQUFjLEtBQUs7QUFBQSxFQUNqRSxXQUNFLFlBQVksUUFDWixhQUFhLFNBQ1osUUFBUSxXQUFXLEVBQUUsV0FBVyxZQUFZLFFBQVEsSUFDckQ7QUFDQSxTQUFLLGdCQUFnQixHQUFHO0FBQUEsRUFDMUIsT0FBTztBQUNMLFNBQUssYUFBYSxLQUFLLFFBQVE7QUFBQSxFQUNqQztBQUNGO0FBRUEsSUFBSSxhQUFhLFNBQVMsTUFBTSxVQUFVLE9BQU87QUFDL0MsTUFBSSxLQUFLO0FBQ1QsTUFBSSxRQUFRLEtBQUs7QUFDakIsTUFBSSxPQUNGLEtBQUssU0FBUyxZQUNWLFNBQVMsZUFBZSxLQUFLLElBQUksS0FDaEMsUUFBUSxTQUFTLEtBQUssU0FBUyxTQUNoQyxTQUFTLGdCQUFnQixJQUFJLEtBQUssTUFBTSxFQUFFLElBQUksTUFBTSxJQUFJLElBQ3hELFNBQVMsY0FBYyxLQUFLLE1BQU0sRUFBRSxJQUFJLE1BQU0sSUFBSTtBQUV4RCxXQUFTLEtBQUssT0FBTztBQUNuQixrQkFBYyxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxVQUFVLEtBQUs7QUFBQSxFQUN4RDtBQUVBLFdBQVMsSUFBSSxHQUFHLE1BQU0sS0FBSyxTQUFTLFFBQVEsSUFBSSxLQUFLLEtBQUs7QUFDeEQsU0FBSztBQUFBLE1BQ0g7QUFBQSxRQUNHLEtBQUssU0FBUyxDQUFDLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDO0FBQUEsUUFDN0M7QUFBQSxRQUNBO0FBQUEsTUFDUjtBQUFBLElBQ0E7QUFBQSxFQUNFO0FBRUEsU0FBUSxLQUFLLE9BQU87QUFDdEI7QUFFQSxJQUFJLFNBQVMsU0FBUyxNQUFNO0FBQzFCLFNBQU8sUUFBUSxPQUFPLE9BQU8sS0FBSztBQUNwQztBQUVBLElBQUksUUFBUSxTQUFTLFFBQVEsTUFBTSxVQUFVLFVBQVUsVUFBVSxPQUFPO0FBQ3RFLE1BQUksYUFBYSxTQUFVO0FBQUEsV0FFekIsWUFBWSxRQUNaLFNBQVMsU0FBUyxhQUNsQixTQUFTLFNBQVMsV0FDbEI7QUFDQSxRQUFJLFNBQVMsU0FBUyxTQUFTLEtBQU0sTUFBSyxZQUFZLFNBQVM7QUFBQSxFQUNqRSxXQUFXLFlBQVksUUFBUSxTQUFTLFNBQVMsU0FBUyxNQUFNO0FBQzlELFdBQU8sT0FBTztBQUFBLE1BQ1osV0FBWSxXQUFXLFNBQVMsUUFBUSxHQUFJLFVBQVUsS0FBSztBQUFBLE1BQzNEO0FBQUEsSUFDTjtBQUNJLFFBQUksWUFBWSxNQUFNO0FBQ3BCLGFBQU8sWUFBWSxTQUFTLElBQUk7QUFBQSxJQUNsQztBQUFBLEVBQ0YsT0FBTztBQUNMLFFBQUk7QUFDSixRQUFJO0FBRUosUUFBSTtBQUNKLFFBQUk7QUFFSixRQUFJLFlBQVksU0FBUztBQUN6QixRQUFJLFlBQVksU0FBUztBQUV6QixRQUFJLFdBQVcsU0FBUztBQUN4QixRQUFJLFdBQVcsU0FBUztBQUV4QixRQUFJLFVBQVU7QUFDZCxRQUFJLFVBQVU7QUFDZCxRQUFJLFVBQVUsU0FBUyxTQUFTO0FBQ2hDLFFBQUksVUFBVSxTQUFTLFNBQVM7QUFFaEMsWUFBUSxTQUFTLFNBQVMsU0FBUztBQUVuQyxhQUFTLEtBQUssTUFBTSxXQUFXLFNBQVMsR0FBRztBQUN6QyxXQUNHLE1BQU0sV0FBVyxNQUFNLGNBQWMsTUFBTSxZQUN4QyxLQUFLLENBQUMsSUFDTixVQUFVLENBQUMsT0FBTyxVQUFVLENBQUMsR0FDakM7QUFDQSxzQkFBYyxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVSxLQUFLO0FBQUEsTUFDcEU7QUFBQSxJQUNGO0FBRUEsV0FBTyxXQUFXLFdBQVcsV0FBVyxTQUFTO0FBQy9DLFdBQ0csU0FBUyxPQUFPLFNBQVMsT0FBTyxDQUFDLE1BQU0sUUFDeEMsV0FBVyxPQUFPLFNBQVMsT0FBTyxDQUFDLEdBQ25DO0FBQ0E7QUFBQSxNQUNGO0FBRUE7QUFBQSxRQUNFO0FBQUEsUUFDQSxTQUFTLE9BQU8sRUFBRTtBQUFBLFFBQ2xCLFNBQVMsT0FBTztBQUFBLFFBQ2YsU0FBUyxPQUFPLElBQUk7QUFBQSxVQUNuQixTQUFTLFNBQVM7QUFBQSxVQUNsQixTQUFTLFNBQVM7QUFBQSxRQUM1QjtBQUFBLFFBQ1E7QUFBQSxRQUNBO0FBQUEsTUFDUjtBQUFBLElBQ0k7QUFFQSxXQUFPLFdBQVcsV0FBVyxXQUFXLFNBQVM7QUFDL0MsV0FDRyxTQUFTLE9BQU8sU0FBUyxPQUFPLENBQUMsTUFBTSxRQUN4QyxXQUFXLE9BQU8sU0FBUyxPQUFPLENBQUMsR0FDbkM7QUFDQTtBQUFBLE1BQ0Y7QUFFQTtBQUFBLFFBQ0U7QUFBQSxRQUNBLFNBQVMsT0FBTyxFQUFFO0FBQUEsUUFDbEIsU0FBUyxPQUFPO0FBQUEsUUFDZixTQUFTLE9BQU8sSUFBSTtBQUFBLFVBQ25CLFNBQVMsU0FBUztBQUFBLFVBQ2xCLFNBQVMsU0FBUztBQUFBLFFBQzVCO0FBQUEsUUFDUTtBQUFBLFFBQ0E7QUFBQSxNQUNSO0FBQUEsSUFDSTtBQUVBLFFBQUksVUFBVSxTQUFTO0FBQ3JCLGFBQU8sV0FBVyxTQUFTO0FBQ3pCLGFBQUs7QUFBQSxVQUNIO0FBQUEsWUFDRyxTQUFTLE9BQU8sSUFBSSxTQUFTLFNBQVMsU0FBUyxDQUFDO0FBQUEsWUFDakQ7QUFBQSxZQUNBO0FBQUEsVUFDWjtBQUFBLFdBQ1csVUFBVSxTQUFTLE9BQU8sTUFBTSxRQUFRO0FBQUEsUUFDbkQ7QUFBQSxNQUNNO0FBQUEsSUFDRixXQUFXLFVBQVUsU0FBUztBQUM1QixhQUFPLFdBQVcsU0FBUztBQUN6QixhQUFLLFlBQVksU0FBUyxTQUFTLEVBQUUsSUFBSTtBQUFBLE1BQzNDO0FBQUEsSUFDRixPQUFPO0FBQ0wsZUFBUyxJQUFJLFNBQVMsUUFBUSxDQUFBLEdBQUksV0FBVyxDQUFBLEdBQUksS0FBSyxTQUFTLEtBQUs7QUFDbEUsYUFBSyxTQUFTLFNBQVMsQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUN0QyxnQkFBTSxNQUFNLElBQUksU0FBUyxDQUFDO0FBQUEsUUFDNUI7QUFBQSxNQUNGO0FBRUEsYUFBTyxXQUFXLFNBQVM7QUFDekIsaUJBQVMsT0FBUSxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQzVDLGlCQUFTO0FBQUEsVUFDTixTQUFTLE9BQU8sSUFBSSxTQUFTLFNBQVMsT0FBTyxHQUFHLE9BQU87QUFBQSxRQUNsRTtBQUVRLFlBQ0UsU0FBUyxNQUFNLEtBQ2QsVUFBVSxRQUFRLFdBQVcsT0FBTyxTQUFTLFVBQVUsQ0FBQyxDQUFDLEdBQzFEO0FBQ0EsY0FBSSxVQUFVLE1BQU07QUFDbEIsaUJBQUssWUFBWSxRQUFRLElBQUk7QUFBQSxVQUMvQjtBQUNBO0FBQ0E7QUFBQSxRQUNGO0FBRUEsWUFBSSxVQUFVLFFBQVEsU0FBUyxTQUFTLGVBQWU7QUFDckQsY0FBSSxVQUFVLE1BQU07QUFDbEI7QUFBQSxjQUNFO0FBQUEsY0FDQSxXQUFXLFFBQVE7QUFBQSxjQUNuQjtBQUFBLGNBQ0EsU0FBUyxPQUFPO0FBQUEsY0FDaEI7QUFBQSxjQUNBO0FBQUEsWUFDZDtBQUNZO0FBQUEsVUFDRjtBQUNBO0FBQUEsUUFDRixPQUFPO0FBQ0wsY0FBSSxXQUFXLFFBQVE7QUFDckI7QUFBQSxjQUNFO0FBQUEsY0FDQSxRQUFRO0FBQUEsY0FDUjtBQUFBLGNBQ0EsU0FBUyxPQUFPO0FBQUEsY0FDaEI7QUFBQSxjQUNBO0FBQUEsWUFDZDtBQUNZLHFCQUFTLE1BQU0sSUFBSTtBQUNuQjtBQUFBLFVBQ0YsT0FBTztBQUNMLGlCQUFLLFVBQVUsTUFBTSxNQUFNLE1BQU0sTUFBTTtBQUNyQztBQUFBLGdCQUNFO0FBQUEsZ0JBQ0EsS0FBSyxhQUFhLFFBQVEsTUFBTSxXQUFXLFFBQVEsSUFBSTtBQUFBLGdCQUN2RDtBQUFBLGdCQUNBLFNBQVMsT0FBTztBQUFBLGdCQUNoQjtBQUFBLGdCQUNBO0FBQUEsY0FDaEI7QUFDYyx1QkFBUyxNQUFNLElBQUk7QUFBQSxZQUNyQixPQUFPO0FBQ0w7QUFBQSxnQkFDRTtBQUFBLGdCQUNBLFdBQVcsUUFBUTtBQUFBLGdCQUNuQjtBQUFBLGdCQUNBLFNBQVMsT0FBTztBQUFBLGdCQUNoQjtBQUFBLGdCQUNBO0FBQUEsY0FDaEI7QUFBQSxZQUNZO0FBQUEsVUFDRjtBQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFFQSxhQUFPLFdBQVcsU0FBUztBQUN6QixZQUFJLE9BQVEsVUFBVSxTQUFTLFNBQVMsQ0FBQyxLQUFNLE1BQU07QUFDbkQsZUFBSyxZQUFZLFFBQVEsSUFBSTtBQUFBLFFBQy9CO0FBQUEsTUFDRjtBQUVBLGVBQVMsS0FBSyxPQUFPO0FBQ25CLFlBQUksU0FBUyxDQUFDLEtBQUssTUFBTTtBQUN2QixlQUFLLFlBQVksTUFBTSxDQUFDLEVBQUUsSUFBSTtBQUFBLFFBQ2hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsU0FBUSxTQUFTLE9BQU87QUFDMUI7QUFFQSxJQUFJLGVBQWUsU0FBUyxHQUFHLEdBQUc7QUFDaEMsV0FBUyxLQUFLLEVBQUcsS0FBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRyxRQUFPO0FBQzNDLFdBQVMsS0FBSyxFQUFHLEtBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUcsUUFBTztBQUM3QztBQUVBLElBQUksZUFBZSxTQUFTLE1BQU07QUFDaEMsU0FBTyxPQUFPLFNBQVMsV0FBVyxPQUFPLGdCQUFnQixJQUFJO0FBQy9EO0FBRUEsSUFBSSxXQUFXLFNBQVMsVUFBVSxVQUFVO0FBQzFDLFNBQU8sU0FBUyxTQUFTLGNBQ25CLENBQUMsWUFBWSxDQUFDLFNBQVMsUUFBUSxhQUFhLFNBQVMsTUFBTSxTQUFTLElBQUksUUFDbkUsV0FBVyxhQUFhLFNBQVMsS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLEdBQUcsT0FDL0QsU0FBUyxPQUNiLFlBQ0E7QUFDTjtBQUVBLElBQUksY0FBYyxTQUFTLE1BQU0sT0FBTyxVQUFVLE1BQU0sS0FBSyxNQUFNO0FBQ2pFLFNBQU87QUFBQSxJQUNMO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQ0E7QUFFQSxJQUFJLGtCQUFrQixTQUFTLE9BQU8sTUFBTTtBQUMxQyxTQUFPLFlBQVksT0FBTyxXQUFXLFdBQVcsTUFBTSxRQUFXLFNBQVM7QUFDNUU7QUFFQSxJQUFJLGNBQWMsU0FBUyxNQUFNO0FBQy9CLFNBQU8sS0FBSyxhQUFhLFlBQ3JCLGdCQUFnQixLQUFLLFdBQVcsSUFBSSxJQUNwQztBQUFBLElBQ0UsS0FBSyxTQUFTLFlBQVc7QUFBQSxJQUN6QjtBQUFBLElBQ0EsSUFBSSxLQUFLLEtBQUssWUFBWSxXQUFXO0FBQUEsSUFDckM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ1I7QUFDQTtBQVNPLElBQUksSUFBSSxTQUFTLE1BQU0sT0FBTztBQUNuQyxXQUFTLE1BQU0sT0FBTyxDQUFBLEdBQUksV0FBVyxDQUFBLEdBQUksSUFBSSxVQUFVLFFBQVEsTUFBTSxLQUFLO0FBQ3hFLFNBQUssS0FBSyxVQUFVLENBQUMsQ0FBQztBQUFBLEVBQ3hCO0FBRUEsU0FBTyxLQUFLLFNBQVMsR0FBRztBQUN0QixRQUFJLFFBQVMsT0FBTyxLQUFLLElBQUcsQ0FBRSxHQUFJO0FBQ2hDLGVBQVMsSUFBSSxLQUFLLFFBQVEsTUFBTSxLQUFLO0FBQ25DLGFBQUssS0FBSyxLQUFLLENBQUMsQ0FBQztBQUFBLE1BQ25CO0FBQUEsSUFDRixXQUFXLFNBQVMsU0FBUyxTQUFTLFFBQVEsUUFBUSxLQUFNO0FBQUEsU0FDckQ7QUFDTCxlQUFTLEtBQUssYUFBYSxJQUFJLENBQUM7QUFBQSxJQUNsQztBQUFBLEVBQ0Y7QUFFQSxVQUFRLFNBQVM7QUFFakIsU0FBTyxPQUFPLFNBQVMsYUFDbkIsS0FBSyxPQUFPLFFBQVEsSUFDcEIsWUFBWSxNQUFNLE9BQU8sVUFBVSxRQUFXLE1BQU0sR0FBRztBQUM3RDtBQUVPLElBQUksTUFBTSxTQUFTLE9BQU87QUFDL0IsTUFBSSxRQUFRLENBQUE7QUFDWixNQUFJLE9BQU87QUFDWCxNQUFJLE9BQU8sTUFBTTtBQUNqQixNQUFJLE9BQU8sTUFBTTtBQUNqQixNQUFJLE9BQU8sUUFBUSxZQUFZLElBQUk7QUFDbkMsTUFBSSxnQkFBZ0IsTUFBTTtBQUMxQixNQUFJLE9BQU8sQ0FBQTtBQUNYLE1BQUksUUFBUSxNQUFNO0FBRWxCLE1BQUksV0FBVyxTQUFTLE9BQU87QUFDN0IsYUFBUyxLQUFLLFFBQVEsTUFBTSxJQUFJLEdBQUcsS0FBSztBQUFBLEVBQzFDO0FBRUEsTUFBSSxXQUFXLFNBQVMsVUFBVTtBQUNoQyxRQUFJLFVBQVUsVUFBVTtBQUN0QixjQUFRO0FBQ1IsVUFBSSxlQUFlO0FBQ2pCLGVBQU8sVUFBVSxNQUFNLE1BQU0sQ0FBQyxjQUFjLEtBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUTtBQUFBLE1BQ2hFO0FBQ0EsVUFBSSxRQUFRLENBQUMsS0FBTSxPQUFNLFFBQVMsT0FBTyxJQUFJO0FBQUEsSUFDL0M7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUVBLE1BQUksWUFBWSxNQUFNLGNBQ3BCLFNBQVMsS0FBSztBQUNaLFdBQU87QUFBQSxFQUNULEdBQUcsU0FBUyxRQUFRQSxRQUFPO0FBQzNCLFdBQU8sT0FBTyxXQUFXLGFBQ3JCLFNBQVMsT0FBTyxPQUFPQSxNQUFLLENBQUMsSUFDN0IsUUFBUSxNQUFNLElBQ2QsT0FBTyxPQUFPLENBQUMsTUFBTSxjQUFjLFFBQVEsT0FBTyxDQUFDLENBQUMsSUFDbEQ7QUFBQSxNQUNFLE9BQU8sQ0FBQztBQUFBLE1BQ1IsT0FBTyxPQUFPLENBQUMsTUFBTSxhQUFhLE9BQU8sQ0FBQyxFQUFFQSxNQUFLLElBQUksT0FBTyxDQUFDO0FBQUEsSUFDekUsS0FDVyxNQUFNLE9BQU8sTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLFNBQVMsSUFBSTtBQUN2QyxZQUFNLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFBQSxJQUM3QixHQUFHLFNBQVMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUN0QixTQUNGLFNBQVMsTUFBTTtBQUFBLEVBQ3JCLENBQUM7QUFFRCxNQUFJLFNBQVMsV0FBVztBQUN0QixXQUFPO0FBQ1AsV0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0w7QUFBQSxNQUNBO0FBQUEsTUFDQyxPQUFPLGFBQWEsS0FBSyxLQUFLLENBQUM7QUFBQSxNQUNoQztBQUFBLElBQ047QUFDSSxVQUFLO0FBQUEsRUFDUDtBQUVBLFdBQVMsTUFBTSxJQUFJO0FBQ3JCO0FDdmVBLElBQUksU0FBUyxTQUFVLElBQVM7QUFFNUIsU0FBTyxTQUNILFFBQ0EsT0FBWTtBQUVaLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLFFBQ0k7QUFBQSxRQUNBLE9BQU8sTUFBTTtBQUFBLE1BQUE7QUFBQSxJQUNqQjtBQUFBLEVBRVI7QUFDSjtBQWtCTyxJQUFJLFdBQVc7QUFBQSxFQUVsQixTQUNJLFVBQ0EsT0FBWTtBQUVaLFFBQUksS0FBSztBQUFBLE1BQ0wsV0FBWTtBQUVSO0FBQUEsVUFDSSxNQUFNO0FBQUEsVUFDTixLQUFLLElBQUE7QUFBQSxRQUFJO0FBQUEsTUFFakI7QUFBQSxNQUNBLE1BQU07QUFBQSxJQUFBO0FBR1YsV0FBTyxXQUFZO0FBRWYsb0JBQWMsRUFBRTtBQUFBLElBQ3BCO0FBQUEsRUFDSjtBQUNKO0FDbUVBLE1BQU0sYUFBYSxDQUNmLFVBQ0EsVUFDTztBQUVQLE1BQUksQ0FBQyxPQUFPO0FBQ1I7QUFBQSxFQUNKO0FBRUEsUUFBTSxTQUFzQjtBQUFBLElBQ3hCLElBQUk7QUFBQSxJQUNKLEtBQUssTUFBTTtBQUFBLElBQ1gsb0JBQW9CO0FBQUEsSUFDcEIsV0FBVyxNQUFNLGFBQWE7QUFBQSxFQUFBO0FBR2xDO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxPQUFPLENBQ1QsVUFDQSxPQUNBLFFBQ0EsZUFBb0IsU0FBZTtBQUVuQztBQUFBLElBQ0ksTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQUEsRUFDTCxLQUFLLFNBQVUsVUFBVTtBQUV0QixRQUFJLFVBQVU7QUFFVixhQUFPLEtBQUssU0FBUyxPQUFPO0FBQzVCLGFBQU8sU0FBUyxTQUFTO0FBQ3pCLGFBQU8sT0FBTyxTQUFTO0FBQ3ZCLGFBQU8sYUFBYSxTQUFTO0FBRTdCLFVBQUksU0FBUyxTQUFTO0FBRWxCLGVBQU8sU0FBUyxTQUFTLFFBQVEsSUFBSSxRQUFRO0FBQzdDLGVBQU8sY0FBYyxTQUFTLFFBQVEsSUFBSSxjQUFjO0FBRXhELFlBQUksT0FBTyxlQUNKLE9BQU8sWUFBWSxRQUFRLGtCQUFrQixNQUFNLElBQUk7QUFFMUQsaUJBQU8sWUFBWTtBQUFBLFFBQ3ZCO0FBQUEsTUFDSjtBQUVBLFVBQUksU0FBUyxXQUFXLEtBQUs7QUFFekIsZUFBTyxxQkFBcUI7QUFFNUI7QUFBQSxVQUNJLE1BQU07QUFBQSxVQUNOO0FBQUEsUUFBQTtBQUdKO0FBQUEsTUFDSjtBQUFBLElBQ0osT0FDSztBQUNELGFBQU8sZUFBZTtBQUFBLElBQzFCO0FBRUEsV0FBTztBQUFBLEVBQ1gsQ0FBQyxFQUNBLEtBQUssU0FBVSxVQUFlO0FBRTNCLFFBQUk7QUFDQSxhQUFPLFNBQVMsS0FBQTtBQUFBLElBQ3BCLFNBQ08sT0FBTztBQUNWLGFBQU8sU0FBUztBQUFBO0FBQUEsSUFFcEI7QUFBQSxFQUNKLENBQUMsRUFDQSxLQUFLLFNBQVUsUUFBUTtBQUVwQixXQUFPLFdBQVc7QUFFbEIsUUFBSSxVQUNHLE9BQU8sY0FBYyxRQUMxQjtBQUNFLFVBQUk7QUFFQSxlQUFPLFdBQVcsS0FBSyxNQUFNLE1BQU07QUFBQSxNQUN2QyxTQUNPLEtBQUs7QUFDUixlQUFPLFNBQVM7QUFBQTtBQUFBLE1BRXBCO0FBQUEsSUFDSjtBQUVBLFFBQUksQ0FBQyxPQUFPLElBQUk7QUFFWixZQUFNO0FBQUEsSUFDVjtBQUVBO0FBQUEsTUFDSSxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQUE7QUFBQSxFQUVSLENBQUMsRUFDQSxLQUFLLFdBQVk7QUFFZCxRQUFJLGNBQWM7QUFFZCxhQUFPLGFBQWE7QUFBQSxRQUNoQixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsTUFBQTtBQUFBLElBRXJCO0FBQUEsRUFDSixDQUFDLEVBQ0EsTUFBTSxTQUFVLE9BQU87QUFFcEIsV0FBTyxTQUFTO0FBRWhCO0FBQUEsTUFDSSxNQUFNO0FBQUEsTUFDTjtBQUFBLElBQUE7QUFBQSxFQUVSLENBQUM7QUFDVDtBQUVPLE1BQU0sUUFBUSxDQUFDLFVBQW1EO0FBRXJFLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQ2pRQSxNQUFNLE9BQU87QUFBQSxFQUVULFVBQVU7QUFDZDtBQ0VBLE1BQXFCLFdBQWtDO0FBQUEsRUFFbkQsWUFDSSxNQUNBLEtBQ0EsV0FDQSxnQkFBa0U7QUFFbEUsU0FBSyxPQUFPO0FBQ1osU0FBSyxNQUFNO0FBQ1gsU0FBSyxZQUFZO0FBQ2pCLFNBQUssaUJBQWlCO0FBQUEsRUFDMUI7QUFBQSxFQUVPO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ1g7QUN0QkEsTUFBTSxhQUFhO0FBQUEsRUFFZixxQkFBcUIsQ0FBQyxVQUFrQjtBQUVwQyxVQUFNLFFBQVEsS0FBSyxNQUFNLFFBQVEsRUFBRTtBQUVuQyxZQUFRLFFBQVEsS0FBSztBQUFBLEVBQ3pCO0FBQUEsRUFFQSx1QkFBdUIsQ0FBQyxVQUFrQjtBQUV0QyxVQUFNLFFBQVEsS0FBSyxNQUFNLFFBQVEsRUFBRTtBQUVuQyxXQUFPLFFBQVE7QUFBQSxFQUNuQjtBQUFBLEVBRUEsdUJBQXVCLENBQUMsT0FBdUI7QUFFM0MsVUFBTSxTQUFTLEtBQUs7QUFFcEIsV0FBTyxXQUFXLDBCQUEwQixNQUFNO0FBQUEsRUFDdEQ7QUFBQSxFQUVBLFlBQVksQ0FDUixPQUNBLE9BQ0EsYUFBYSxNQUNKO0FBRVQsYUFBUyxJQUFJLFlBQVksSUFBSSxNQUFNLFFBQVEsS0FBSztBQUU1QyxVQUFJLE1BQU0sU0FBUyxNQUFNLENBQUMsQ0FBQyxNQUFNLE1BQU07QUFFbkMsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGNBQWMsQ0FBQyxhQUE2QjtBQUV4QyxRQUFJLFVBQVUsU0FBUyxNQUFNLFlBQVk7QUFFekMsUUFBSSxXQUNHLFFBQVEsU0FBUyxHQUN0QjtBQUNFLGFBQU8sUUFBUSxDQUFDO0FBQUEsSUFDcEI7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsZ0JBQWdCLENBQ1osT0FDQSxjQUFzQjtBQUV0QixRQUFJLFNBQVMsTUFBTTtBQUNuQixRQUFJQyxTQUFRO0FBRVosYUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLEtBQUs7QUFFN0IsVUFBSSxNQUFNLENBQUMsTUFBTSxXQUFXO0FBQ3hCLFFBQUFBO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFFQSxXQUFPQTtBQUFBLEVBQ1g7QUFBQSxFQUVBLDJCQUEyQixDQUFDLFdBQTJCO0FBRW5ELFVBQU0sT0FBTyxLQUFLLE1BQU0sU0FBUyxFQUFFO0FBQ25DLFVBQU0sa0JBQWtCLFNBQVM7QUFDakMsVUFBTSx5QkFBeUIsS0FBSyxNQUFNLGtCQUFrQixFQUFFLElBQUk7QUFFbEUsUUFBSSxTQUFpQjtBQUVyQixRQUFJLE9BQU8sR0FBRztBQUVWLGVBQVMsR0FBRyxJQUFJO0FBQUEsSUFDcEI7QUFFQSxRQUFJLHlCQUF5QixHQUFHO0FBRTVCLGVBQVMsR0FBRyxNQUFNLEdBQUcsc0JBQXNCO0FBQUEsSUFDL0M7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsb0JBQW9CLENBQUMsVUFBOEM7QUFFL0QsUUFBSSxVQUFVLFFBQ1AsVUFBVSxRQUFXO0FBRXhCLGFBQU87QUFBQSxJQUNYO0FBRUEsWUFBUSxHQUFHLEtBQUs7QUFFaEIsV0FBTyxNQUFNLE1BQU0sT0FBTyxNQUFNO0FBQUEsRUFDcEM7QUFBQSxFQUVBLGtCQUFrQixDQUFDLEdBQWEsTUFBeUI7QUFFckQsUUFBSSxNQUFNLEdBQUc7QUFFVCxhQUFPO0FBQUEsSUFDWDtBQUVBLFFBQUksTUFBTSxRQUNILE1BQU0sTUFBTTtBQUVmLGFBQU87QUFBQSxJQUNYO0FBRUEsUUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBRXZCLGFBQU87QUFBQSxJQUNYO0FBT0EsVUFBTSxJQUFjLENBQUMsR0FBRyxDQUFDO0FBQ3pCLFVBQU0sSUFBYyxDQUFDLEdBQUcsQ0FBQztBQUV6QixNQUFFLEtBQUE7QUFDRixNQUFFLEtBQUE7QUFFRixhQUFTLElBQUksR0FBRyxJQUFJLEVBQUUsUUFBUSxLQUFLO0FBRS9CLFVBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUc7QUFFZixlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsUUFBUSxPQUErQjtBQUVuQyxRQUFJLGVBQWUsTUFBTTtBQUN6QixRQUFJO0FBQ0osUUFBSTtBQUdKLFdBQU8sTUFBTSxjQUFjO0FBR3ZCLG9CQUFjLEtBQUssTUFBTSxLQUFLLE9BQUEsSUFBVyxZQUFZO0FBQ3JELHNCQUFnQjtBQUdoQix1QkFBaUIsTUFBTSxZQUFZO0FBQ25DLFlBQU0sWUFBWSxJQUFJLE1BQU0sV0FBVztBQUN2QyxZQUFNLFdBQVcsSUFBSTtBQUFBLElBQ3pCO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLFdBQVcsQ0FBQyxVQUF3QjtBQUVoQyxRQUFJLFdBQVcsbUJBQW1CLEtBQUssTUFBTSxNQUFNO0FBRS9DLGFBQU87QUFBQSxJQUNYO0FBRUEsV0FBTyxDQUFDLE1BQU0sS0FBSztBQUFBLEVBQ3ZCO0FBQUEsRUFFQSxtQkFBbUIsQ0FBQyxVQUF3QjtBQUV4QyxRQUFJLENBQUMsV0FBVyxVQUFVLEtBQUssR0FBRztBQUU5QixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU8sQ0FBQyxRQUFRO0FBQUEsRUFDcEI7QUFBQSxFQUVBLGVBQWUsQ0FBSSxVQUE2QjtBQUU1QyxRQUFJLElBQUksSUFBSSxLQUFLLEVBQUUsU0FBUyxNQUFNLFFBQVE7QUFFdEMsYUFBTztBQUFBLElBQ1g7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsUUFBUSxDQUFJLFFBQWtCLFdBQTJCO0FBRXJELFdBQU8sUUFBUSxDQUFDLFNBQVk7QUFFeEIsYUFBTyxLQUFLLElBQUk7QUFBQSxJQUNwQixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBRUEsMkJBQTJCLENBQUMsVUFBaUM7QUFFekQsUUFBSSxDQUFDLE9BQU87QUFFUixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU8sV0FBVywwQkFBMEIsS0FBSyxNQUFNLEtBQUssQ0FBQztBQUFBLEVBQ2pFO0FBQUEsRUFFQSwyQkFBMkIsQ0FBQyxVQUFpQztBQUV6RCxRQUFJLENBQUMsT0FBTztBQUVSLGFBQU87QUFBQSxJQUNYO0FBRUEsV0FBTyxLQUFLO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUE7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsbUJBQW1CLENBQUMsVUFBd0I7QUFFeEMsUUFBSSxDQUFDLFdBQVcsVUFBVSxLQUFLLEdBQUc7QUFFOUIsYUFBTztBQUFBLElBQ1g7QUFFQSxXQUFPLE9BQU8sS0FBSyxLQUFLO0FBQUEsRUFDNUI7QUFBQSxFQUVBLFNBQVMsTUFBYztBQUVuQixVQUFNLE1BQVksSUFBSSxLQUFLLEtBQUssS0FBSztBQUNyQyxVQUFNLE9BQWUsR0FBRyxJQUFJLFlBQUEsQ0FBYSxLQUFLLElBQUksU0FBQSxJQUFhLEdBQUcsU0FBQSxFQUFXLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLFFBQUEsRUFBVSxTQUFBLEVBQVcsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLElBQUksU0FBQSxFQUFXLFNBQUEsRUFBVyxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxXQUFBLEVBQWEsU0FBQSxFQUFXLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLFdBQUEsRUFBYSxTQUFBLEVBQVcsU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksa0JBQWtCLFNBQUEsRUFBVyxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBRTlVLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxnQkFBZ0IsQ0FBQyxVQUFpQztBQUU5QyxRQUFJLFdBQVcsbUJBQW1CLEtBQUssTUFBTSxNQUFNO0FBRS9DLGFBQU8sQ0FBQTtBQUFBLElBQ1g7QUFFQSxVQUFNLFVBQVUsTUFBTSxNQUFNLFNBQVM7QUFDckMsVUFBTSxVQUF5QixDQUFBO0FBRS9CLFlBQVEsUUFBUSxDQUFDLFVBQWtCO0FBRS9CLFVBQUksQ0FBQyxXQUFXLG1CQUFtQixLQUFLLEdBQUc7QUFFdkMsZ0JBQVEsS0FBSyxNQUFNLE1BQU07QUFBQSxNQUM3QjtBQUFBLElBQ0osQ0FBQztBQUVELFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxhQUFhLENBQUMsVUFBaUM7QUFFM0MsUUFBSSxXQUFXLG1CQUFtQixLQUFLLE1BQU0sTUFBTTtBQUUvQyxhQUFPLENBQUE7QUFBQSxJQUNYO0FBRUEsVUFBTSxVQUFVLE1BQU0sTUFBTSxHQUFHO0FBQy9CLFVBQU0sVUFBeUIsQ0FBQTtBQUUvQixZQUFRLFFBQVEsQ0FBQyxVQUFrQjtBQUUvQixVQUFJLENBQUMsV0FBVyxtQkFBbUIsS0FBSyxHQUFHO0FBRXZDLGdCQUFRLEtBQUssTUFBTSxNQUFNO0FBQUEsTUFDN0I7QUFBQSxJQUNKLENBQUM7QUFFRCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsd0JBQXdCLENBQUMsVUFBaUM7QUFFdEQsV0FBTyxXQUNGLGVBQWUsS0FBSyxFQUNwQixLQUFBO0FBQUEsRUFDVDtBQUFBLEVBRUEsZUFBZSxDQUFDLFVBQWlDO0FBRTdDLFFBQUksQ0FBQyxTQUNFLE1BQU0sV0FBVyxHQUFHO0FBRXZCLGFBQU87QUFBQSxJQUNYO0FBRUEsV0FBTyxNQUFNLEtBQUssSUFBSTtBQUFBLEVBQzFCO0FBQUEsRUFFQSxtQkFBbUIsQ0FBQyxXQUEwQjtBQUUxQyxRQUFJLFdBQVcsTUFBTTtBQUVqQixhQUFPLE9BQU8sWUFBWTtBQUV0QixlQUFPLFlBQVksT0FBTyxVQUFVO0FBQUEsTUFDeEM7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBRUEsT0FBTyxDQUFDLE1BQXVCO0FBRTNCLFdBQU8sSUFBSSxNQUFNO0FBQUEsRUFDckI7QUFBQSxFQUVBLGdCQUFnQixDQUNaLE9BQ0EsWUFBb0IsUUFBZ0I7QUFFcEMsUUFBSSxXQUFXLG1CQUFtQixLQUFLLE1BQU0sTUFBTTtBQUUvQyxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sb0JBQTRCLFdBQVcscUJBQXFCLEtBQUs7QUFFdkUsUUFBSSxvQkFBb0IsS0FDakIscUJBQXFCLFdBQVc7QUFFbkMsWUFBTUMsVUFBUyxNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQztBQUVwRCxhQUFPLFdBQVcsbUJBQW1CQSxPQUFNO0FBQUEsSUFDL0M7QUFFQSxRQUFJLE1BQU0sVUFBVSxXQUFXO0FBRTNCLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxTQUFTLE1BQU0sT0FBTyxHQUFHLFNBQVM7QUFFeEMsV0FBTyxXQUFXLG1CQUFtQixNQUFNO0FBQUEsRUFDL0M7QUFBQSxFQUVBLG9CQUFvQixDQUFDLFVBQTBCO0FBRTNDLFFBQUksU0FBaUIsTUFBTSxLQUFBO0FBQzNCLFFBQUksbUJBQTJCO0FBQy9CLFFBQUksYUFBcUI7QUFDekIsUUFBSSxnQkFBd0IsT0FBTyxPQUFPLFNBQVMsQ0FBQztBQUVwRCxRQUFJLDZCQUNBLGlCQUFpQixLQUFLLGFBQWEsS0FDaEMsV0FBVyxLQUFLLGFBQWE7QUFHcEMsV0FBTywrQkFBK0IsTUFBTTtBQUV4QyxlQUFTLE9BQU8sT0FBTyxHQUFHLE9BQU8sU0FBUyxDQUFDO0FBQzNDLHNCQUFnQixPQUFPLE9BQU8sU0FBUyxDQUFDO0FBRXhDLG1DQUNJLGlCQUFpQixLQUFLLGFBQWEsS0FDaEMsV0FBVyxLQUFLLGFBQWE7QUFBQSxJQUN4QztBQUVBLFdBQU8sR0FBRyxNQUFNO0FBQUEsRUFDcEI7QUFBQSxFQUVBLHNCQUFzQixDQUFDLFVBQTBCO0FBRTdDLFFBQUk7QUFFSixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBRW5DLGtCQUFZLE1BQU0sQ0FBQztBQUVuQixVQUFJLGNBQWMsUUFDWCxjQUFjLE1BQU07QUFFdkIsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLHNCQUFzQixDQUFDLFVBQTBCO0FBRTdDLFdBQU8sTUFBTSxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsTUFBTSxNQUFNLENBQUM7QUFBQSxFQUN4RDtBQUFBLEVBRUEsY0FBYyxDQUFDLFlBQXFCLFVBQWtCO0FBRWxELFFBQUksS0FBSSxvQkFBSSxLQUFBLEdBQU8sUUFBQTtBQUVuQixRQUFJLEtBQU0sZUFDSCxZQUFZLE9BQ1gsWUFBWSxJQUFBLElBQVEsT0FBVTtBQUV0QyxRQUFJLFVBQVU7QUFFZCxRQUFJLENBQUMsV0FBVztBQUNaLGdCQUFVO0FBQUEsSUFDZDtBQUVBLFVBQU0sT0FBTyxRQUNSO0FBQUEsTUFDRztBQUFBLE1BQ0EsU0FBVSxHQUFHO0FBRVQsWUFBSSxJQUFJLEtBQUssT0FBQSxJQUFXO0FBRXhCLFlBQUksSUFBSSxHQUFHO0FBRVAsZUFBSyxJQUFJLEtBQUssS0FBSztBQUNuQixjQUFJLEtBQUssTUFBTSxJQUFJLEVBQUU7QUFBQSxRQUN6QixPQUNLO0FBRUQsZUFBSyxLQUFLLEtBQUssS0FBSztBQUNwQixlQUFLLEtBQUssTUFBTSxLQUFLLEVBQUU7QUFBQSxRQUMzQjtBQUVBLGdCQUFRLE1BQU0sTUFBTSxJQUFLLElBQUksSUFBTSxHQUFNLFNBQVMsRUFBRTtBQUFBLE1BQ3hEO0FBQUEsSUFBQTtBQUdSLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxlQUFlLE1BQWU7QUFVMUIsUUFBSSxXQUFnQjtBQUNwQixRQUFJLGFBQWEsU0FBUztBQUMxQixRQUFJLFNBQVMsT0FBTztBQUNwQixRQUFJLGFBQWEsT0FBTztBQUN4QixRQUFJLFVBQVUsT0FBTyxTQUFTLFFBQVE7QUFDdEMsUUFBSSxXQUFXLE9BQU8sVUFBVSxRQUFRLE1BQU0sSUFBSTtBQUNsRCxRQUFJLGNBQWMsT0FBTyxVQUFVLE1BQU0sT0FBTztBQUVoRCxRQUFJLGFBQWE7QUFFYixhQUFPO0FBQUEsSUFDWCxXQUNTLGVBQWUsUUFDakIsT0FBTyxlQUFlLGVBQ3RCLGVBQWUsaUJBQ2YsWUFBWSxTQUNaLGFBQWEsT0FBTztBQUV2QixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUN0ZEEsTUFBcUIsV0FBa0M7QUFBQSxFQUVuRCxZQUFZLEtBQWE7QUFFckIsU0FBSyxNQUFNO0FBQUEsRUFDZjtBQUFBLEVBRU87QUFDWDtBQ1JBLE1BQXFCLGVBQTBDO0FBQUEsRUFFM0QsWUFBWSxLQUFhO0FBRXJCLFNBQUssTUFBTTtBQUFBLEVBQ2Y7QUFBQSxFQUVPO0FBQUEsRUFDQSxPQUFzQjtBQUFBLEVBQ3RCLFVBQXVCO0FBQUEsRUFDdkIsV0FBd0I7QUFBQSxFQUN4QixvQkFBbUMsQ0FBQTtBQUFBLEVBQ25DLHVCQUFzQyxDQUFBO0FBQ2pEO0FDUkEsTUFBTSxtQkFBbUIsQ0FBQyxTQUFrQztBQUV4RCxRQUFNLGVBQThCO0FBQUEsSUFFaEMsS0FBSyxHQUFHLFNBQVMsTUFBTSxHQUFHLFNBQVMsUUFBUTtBQUFBLEVBQUE7QUFHL0MsTUFBSSxDQUFDLEtBQUssVUFBVTtBQUVoQixXQUFPLGFBQWE7QUFBQSxFQUN4QjtBQUVBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osU0FBTyxhQUFhO0FBQ3hCO0FBRUEsTUFBTSxrQkFBa0IsQ0FDcEIsY0FDQSxhQUNPO0FBRVAsTUFBSSxDQUFDLFVBQVU7QUFDWDtBQUFBLEVBQ0o7QUFFQSxNQUFJLFNBQVMsTUFBTSxNQUFNO0FBRXJCLFFBQUksTUFBTSxhQUFhO0FBQ3ZCLFVBQU0sR0FBRyxHQUFHLElBQUksU0FBUyxFQUFFO0FBQzNCLGlCQUFhLE1BQU07QUFFbkI7QUFBQSxNQUNJO0FBQUEsTUFDQSxTQUFTLEtBQUs7QUFBQSxJQUFBO0FBQUEsRUFFdEIsV0FDUyxDQUFDQyxXQUFFLG1CQUFtQixTQUFTLE9BQU8sR0FBRztBQUU5QyxRQUFJLE1BQU0sYUFBYTtBQUN2QixVQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsRUFBRTtBQUMzQixpQkFBYSxNQUFNO0FBQUEsRUFDdkIsV0FDUyxDQUFDLFNBQVMsUUFDWixDQUFDLFNBQVMsVUFDZjtBQUNFLFFBQUksTUFBTSxhQUFhO0FBQ3ZCLFVBQU0sR0FBRyxHQUFHLElBQUksU0FBUyxFQUFFO0FBQzNCLGlCQUFhLE1BQU07QUFBQSxFQUN2QjtBQUVBO0FBQUEsSUFDSTtBQUFBLElBQ0EsU0FBUztBQUFBLEVBQUE7QUFFakI7QUFHQSxNQUFNLGVBQWU7QUFBQSxFQUVqQixVQUFVLE1BQVk7QUFFbEIsV0FBTyxVQUFVLE9BQU8sWUFBWTtBQUNwQyxXQUFPLFVBQVUsT0FBTyxzQkFBc0I7QUFBQSxFQUNsRDtBQUFBLEVBRUEseUJBQXlCLENBQUMsVUFBd0I7QUFFOUMsUUFBSSxNQUFNLFlBQVksZ0JBQWdCLE1BQU07QUFDeEM7QUFBQSxJQUNKO0FBRUEsVUFBTSxZQUFZLGFBQWE7QUFFL0IsUUFBSSxDQUFDLE1BQU0sWUFBWSxnQkFBZ0IsV0FDaEMsQ0FBQyxNQUFNLFlBQVksY0FBYyxNQUN0QztBQUNFO0FBQUEsSUFDSjtBQUVBLGlCQUFhLFNBQUE7QUFDYixVQUFNQyxZQUFXLE9BQU87QUFDeEIsUUFBSTtBQUVKLFFBQUksT0FBTyxRQUFRLE9BQU87QUFFdEIsZ0JBQVUsT0FBTyxRQUFRLE1BQU07QUFBQSxJQUNuQyxPQUNLO0FBQ0QsZ0JBQVUsR0FBR0EsVUFBUyxNQUFNLEdBQUdBLFVBQVMsUUFBUSxHQUFHQSxVQUFTLE1BQU07QUFBQSxJQUN0RTtBQUVBLFVBQU0sTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsSUFBSTtBQUVoRSxRQUFJLFdBQ0csUUFBUSxTQUFTO0FBQ3BCO0FBQUEsSUFDSjtBQUVBLFlBQVE7QUFBQSxNQUNKLElBQUksZUFBZSxHQUFHO0FBQUEsTUFDdEI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFVBQU0sWUFBWSxhQUFhLEtBQUssSUFBSSxXQUFXLEdBQUcsQ0FBQztBQUFBLEVBQzNEO0FBQ0o7QUMzR0EsSUFBSSxRQUFRO0FBRVosTUFBTSxhQUFhO0FBQUEsRUFFZixVQUFVLENBQUMsVUFBd0I7QUFFL0IsVUFBTSxZQUFZLEdBQUcsTUFBTTtBQUMzQixVQUFNLFlBQVksY0FBYztBQUFBLEVBQ3BDO0FBQUEsRUFFQSxnQkFBZ0IsQ0FBQyxVQUEwQjtBQUV2QyxVQUFNLFVBQVUsRUFBRSxNQUFNO0FBRXhCLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxhQUFhLENBQUMsVUFBMEI7QUFFcEMsV0FBTyxHQUFHLFdBQVcsZUFBZSxLQUFLLENBQUM7QUFBQSxFQUM5QztBQUFBLEVBRUEsWUFBWSxNQUFjO0FBRXRCLFdBQU9ELFdBQUUsYUFBQTtBQUFBLEVBQ2I7QUFBQSxFQUVBLFlBQVksQ0FBQyxVQUEwQjtBQUVuQyxRQUFJLE1BQU0sWUFBWSxlQUFlLE1BQU07QUFFdkMsbUJBQWEsd0JBQXdCLEtBQUs7QUFBQSxJQUM5QztBQUVBLFFBQUksV0FBbUIsRUFBRSxHQUFHLE1BQUE7QUFFNUIsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLDhCQUE4QixDQUMxQixPQUNBLE1BQ0EsV0FDQSxLQUNBLG1CQUNPO0FBRVAsWUFBUSxJQUFJLElBQUk7QUFDaEIsWUFBUSxJQUFJLEdBQUc7QUFFZixRQUFJLFFBQVEsR0FBRztBQUNYO0FBQUEsSUFDSjtBQUVBLFFBQUksSUFBSSxTQUFTLGdCQUFnQixHQUFHO0FBQ2hDO0FBQUEsSUFDSjtBQUVBLFVBQU0sU0FBa0MsTUFDbkMsY0FDQSx1QkFDQSxLQUFLLENBQUNFLFlBQXdCO0FBRTNCLGFBQU9BLFFBQU8sU0FBUztBQUFBLElBQzNCLENBQUM7QUFFTCxRQUFJLFFBQVE7QUFDUjtBQUFBLElBQ0o7QUFFQSxVQUFNQyxjQUEwQixJQUFJO0FBQUEsTUFDaEM7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osVUFBTSxjQUFjLHVCQUF1QixLQUFLQSxXQUFVO0FBQUEsRUFDOUQ7QUFBQSxFQUVBLHVCQUF1QixDQUNuQixPQUNBLG1CQUFrQztBQUVsQyxVQUFNLGNBQWMsbUJBQW1CLEtBQUssY0FBYztBQUFBLEVBQzlEO0FBQUEsRUFFQSx1QkFBdUIsQ0FDbkIsT0FDQSxRQUNBLGVBQzRCO0FBRTVCLFFBQUlILFdBQUUsbUJBQW1CLFVBQVUsR0FBRztBQUVsQyxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sTUFBTSxXQUFXO0FBQUEsTUFDbkI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFVBQU0sY0FBYyxNQUFNLFlBQVksc0JBQXNCLEdBQUcsS0FBSztBQUVwRSxRQUFJLENBQUMsYUFBYTtBQUVkLGNBQVEsSUFBSSxzQkFBc0I7QUFBQSxJQUN0QztBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSxtQkFBbUIsQ0FDZixPQUNBLFFBQ0EsZ0JBQ087QUFFUCxRQUFJLENBQUMsYUFBYTtBQUNkO0FBQUEsSUFDSjtBQUVBLFVBQU0sTUFBTSxXQUFXO0FBQUEsTUFDbkI7QUFBQSxNQUNBLFlBQVk7QUFBQSxJQUFBO0FBR2hCLFFBQUksTUFBTSxZQUFZLHNCQUFzQixHQUFHLEdBQUc7QUFDOUM7QUFBQSxJQUNKO0FBRUEsVUFBTSxZQUFZLHNCQUFzQixHQUFHLElBQUk7QUFBQSxFQUNuRDtBQUFBLEVBRUEseUJBQXlCLENBQ3JCLE9BQ0EsUUFDQSxlQUN5QjtBQUV6QixRQUFJQSxXQUFFLG1CQUFtQixVQUFVLE1BQU0sTUFBTTtBQUUzQyxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sTUFBTSxXQUFXO0FBQUEsTUFDbkI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFdBQU8sTUFBTSxZQUFZLHdCQUF3QixHQUFHLEtBQUs7QUFBQSxFQUM3RDtBQUFBLEVBRUEscUJBQXFCLENBQ2pCLE9BQ0EsbUJBQ087QUFFUCxRQUFJLENBQUMsZ0JBQWdCO0FBQ2pCO0FBQUEsSUFDSjtBQUVBLFVBQU0sTUFBTSxXQUFXLHdCQUF3QixjQUFjO0FBRTdELFFBQUlBLFdBQUUsbUJBQW1CLEdBQUcsTUFBTSxNQUFNO0FBQ3BDO0FBQUEsSUFDSjtBQUVBLFFBQUksTUFBTSxZQUFZLHdCQUF3QixHQUFhLEdBQUc7QUFDMUQ7QUFBQSxJQUNKO0FBRUEsVUFBTSxZQUFZLHdCQUF3QixHQUFhLElBQUk7QUFBQSxFQUMvRDtBQUFBLEVBRUEseUJBQXlCLENBQUMsbUJBQW1EO0FBRXpFLFdBQU8sV0FBVztBQUFBLE1BQ2QsZUFBZSxRQUFRO0FBQUEsTUFDdkIsZUFBZTtBQUFBLElBQUE7QUFBQSxFQUV2QjtBQUFBLEVBRUEsYUFBYSxDQUVULFFBQ0EsZUFDUztBQUVULFdBQU8sR0FBRyxNQUFNLElBQUksVUFBVTtBQUFBLEVBQ2xDO0FBQ0o7QUN4TUEsTUFBTSxzQkFBc0I7QUFBQSxFQUV4QixxQkFBcUIsQ0FBQyxVQUF3QjtBQUUxQyxVQUFNLEtBQUssYUFBYTtBQUN4QixVQUFNLEtBQUssT0FBTztBQUNsQixVQUFNLEtBQUssTUFBTTtBQUNqQixVQUFNLEtBQUssWUFBWTtBQUFBLEVBQzNCO0FBQ0o7QUNYTyxJQUFLLCtCQUFBSSxnQkFBTDtBQUVIQSxjQUFBLE1BQUEsSUFBTztBQUNQQSxjQUFBLGNBQUEsSUFBZTtBQUNmQSxjQUFBLFVBQUEsSUFBVztBQUNYQSxjQUFBLGlCQUFBLElBQWtCO0FBQ2xCQSxjQUFBLGtCQUFBLElBQW1CO0FBQ25CQSxjQUFBLFNBQUEsSUFBVTtBQUNWQSxjQUFBLFNBQUEsSUFBVTtBQUNWQSxjQUFBLFNBQUEsSUFBVTtBQUNWQSxjQUFBLFVBQUEsSUFBVztBQUNYQSxjQUFBLFlBQUEsSUFBYTtBQUNiQSxjQUFBLGFBQUEsSUFBYztBQUNkQSxjQUFBLGtCQUFBLElBQW1CO0FBYlgsU0FBQUE7QUFBQSxHQUFBLGNBQUEsQ0FBQSxDQUFBO0FDR1osTUFBTSxrQkFBa0I7QUFBQSxFQUVwQixjQUFjLENBQ1YsT0FDQSxRQUNBLFdBQWdDO0FBRWhDLFFBQUksVUFBVSxJQUFJLFFBQUE7QUFDbEIsWUFBUSxPQUFPLGdCQUFnQixrQkFBa0I7QUFDakQsWUFBUSxPQUFPLFVBQVUsR0FBRztBQUM1QixZQUFRLE9BQU8sa0JBQWtCLE1BQU0sU0FBUyxjQUFjO0FBQzlELFlBQVEsT0FBTyxVQUFVLE1BQU07QUFDL0IsWUFBUSxPQUFPLFVBQVUsTUFBTTtBQUUvQixZQUFRLE9BQU8sbUJBQW1CLE1BQU07QUFFeEMsV0FBTztBQUFBLEVBQ1g7QUFDSjtBQ1hBLE1BQU0seUJBQXlCO0FBQUEsRUFFM0Isd0JBQXdCLENBQUMsVUFBOEM7QUFFbkUsUUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLElBQ0o7QUFFQSxVQUFNLFNBQWlCSixXQUFFLGFBQUE7QUFFekIsUUFBSSxVQUFVLGdCQUFnQjtBQUFBLE1BQzFCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsV0FBVztBQUFBLElBQUE7QUFHZixVQUFNLE1BQWMsR0FBRyxNQUFNLFNBQVMsTUFBTSxJQUFJLE1BQU0sU0FBUyxRQUFRO0FBRXZFLFdBQU8sbUJBQW1CO0FBQUEsTUFDdEI7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSO0FBQUEsTUFBQTtBQUFBLE1BRUosVUFBVTtBQUFBLE1BQ1YsUUFBUSx1QkFBdUI7QUFBQSxNQUMvQixPQUFPLENBQUNLLFFBQWUsaUJBQXNCO0FBRXpDLGdCQUFRLElBQUk7QUFBQTtBQUFBLDZCQUVDLEdBQUc7QUFBQSx1Q0FDTyxLQUFLLFVBQVUsWUFBWSxDQUFDO0FBQUEsK0JBQ3BDLEtBQUssVUFBVSxhQUFhLEtBQUssQ0FBQztBQUFBLGdDQUNqQyx1QkFBdUIsdUJBQXVCLElBQUk7QUFBQSwrQkFDbkQsTUFBTTtBQUFBLGtCQUNuQjtBQUVGLGNBQU07QUFBQTtBQUFBLDZCQUVPLEdBQUc7QUFBQSx1Q0FDTyxLQUFLLFVBQVUsWUFBWSxDQUFDO0FBQUEsK0JBQ3BDLEtBQUssVUFBVSxhQUFhLEtBQUssQ0FBQztBQUFBO0FBQUEsK0JBRWxDLE1BQU07QUFBQSwrQkFDTixLQUFLLFVBQVVBLE1BQUssQ0FBQztBQUFBLGtCQUNsQztBQUVGLGVBQU8sV0FBVyxXQUFXQSxNQUFLO0FBQUEsTUFDdEM7QUFBQSxJQUFBLENBQ0g7QUFBQSxFQUNMO0FBQ0o7QUNyREEsTUFBTSx5QkFBeUI7QUFBQSxFQUUzQiw4QkFBOEIsQ0FDMUIsT0FDQSxhQUFrQztBQUVsQyxRQUFJLENBQUMsU0FDRSxDQUFDLFlBQ0QsU0FBUyxjQUFjLFVBQ3ZCLENBQUMsU0FBUyxVQUFVO0FBRXZCLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxTQUFjLFNBQVM7QUFFN0IsVUFBTSxPQUFZLE9BQU87QUFBQSxNQUNyQixDQUFDLFVBQWUsTUFBTSxTQUFTO0FBQUEsSUFBQTtBQUduQyxVQUFNLE1BQVcsT0FBTztBQUFBLE1BQ3BCLENBQUMsVUFBZSxNQUFNLFNBQVM7QUFBQSxJQUFBO0FBR25DLFFBQUksQ0FBQyxRQUNFLENBQUMsS0FBSztBQUVULGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxpQkFBc0IsT0FBTztBQUFBLE1BQy9CLENBQUMsVUFBZSxNQUFNLFNBQVM7QUFBQSxJQUFBO0FBR25DLFFBQUksQ0FBQyxrQkFDRSxDQUFDLGVBQWUsT0FBTztBQUUxQixhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sS0FBSyxhQUFhO0FBQ3hCLFVBQU0sS0FBSyxPQUFPLEtBQUs7QUFDdkIsVUFBTSxLQUFLLE1BQU0sSUFBSTtBQUNyQixVQUFNLEtBQUssWUFBWSxlQUFlO0FBRXRDLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsbUJBQW1CLENBQUMsVUFBa0M7QUFFbEQsVUFBTSxRQUFvQyx1QkFBdUIsdUJBQXVCLEtBQUs7QUFFN0YsUUFBSSxDQUFDLE9BQU87QUFFUixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSx3QkFBd0IsQ0FBQyxVQUE4QztBQUVuRSxVQUFNLEtBQUssTUFBTTtBQUVqQixXQUFPLHVCQUF1Qix1QkFBdUIsS0FBSztBQUFBLEVBQzlEO0FBQUEsRUFFQSxPQUFPLENBQUMsVUFBa0M7QUFFdEMsVUFBTSxhQUFhLE9BQU8sU0FBUztBQUVuQyxtQkFBZTtBQUFBLE1BQ1gsS0FBSztBQUFBLE1BQ0w7QUFBQSxJQUFBO0FBR0osVUFBTSxNQUFjLEdBQUcsTUFBTSxTQUFTLE1BQU0sSUFBSSxNQUFNLFNBQVMsZ0JBQWdCO0FBQy9FLFdBQU8sU0FBUyxPQUFPLEdBQUc7QUFFMUIsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLHFCQUFxQixDQUFDLFVBQWtDO0FBQ3BELHdCQUFvQixvQkFBb0IsS0FBSztBQUU3QyxXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLGlDQUFpQyxDQUFDLFVBQWtDO0FBRWhFLHdCQUFvQixvQkFBb0IsS0FBSztBQUU3QyxXQUFPLHVCQUF1QixNQUFNLEtBQUs7QUFBQSxFQUM3QztBQUFBLEVBRUEsUUFBUSxDQUFDLFVBQWtDO0FBRXZDLFdBQU8sU0FBUyxPQUFPLE1BQU0sS0FBSyxTQUFTO0FBRTNDLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUMxR08sU0FBUyxtQkFBbUIsT0FBd0I7QUFFdkQsUUFBTSw4QkFBdUQ7QUFNN0QsOEJBQTRCLDZCQUE2Qix1QkFBdUI7QUFFaEYsU0FBTyxNQUFNLDJCQUEyQjtBQUM1QztBQ05BLE1BQU0saUJBQWlCLENBQ25CLFVBQ0EsVUFBcUI7QUFFckI7QUFBQSxJQUNJLE1BQU07QUFBQSxFQUFBO0FBRWQ7QUFHQSxNQUFNLFlBQVksQ0FDZCxPQUNBLGtCQUNpQjtBQUVqQixRQUFNLFVBQWlCLENBQUE7QUFFdkIsZ0JBQWMsUUFBUSxDQUFDLFdBQW9CO0FBRXZDLFVBQU0sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLE9BQU8sQ0FBQyxRQUFnQixpQkFBc0I7QUFFMUMsZ0JBQVEsSUFBSTtBQUFBO0FBQUEsdUNBRVcsS0FBSyxVQUFVLFlBQVksQ0FBQztBQUFBLCtCQUNwQyxLQUFLLFVBQVUsYUFBYSxLQUFLLENBQUM7QUFBQSxnQ0FDakMsU0FBUztBQUFBLGtCQUN2QjtBQUVGLGNBQU0sdUNBQXVDO0FBQUEsTUFDakQ7QUFBQSxJQUFBO0FBSUosWUFBUSxLQUFLO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUFBLENBQ0g7QUFBQSxFQUNMLENBQUM7QUFFRCxTQUFPO0FBQUEsSUFFSCxXQUFXLFdBQVcsS0FBSztBQUFBLElBQzNCLEdBQUc7QUFBQSxFQUFBO0FBRVg7QUFFQSxNQUFNLGNBQWMsQ0FDaEIsT0FDQSxrQkFDaUI7QUFFakIsUUFBTSxVQUFpQixDQUFBO0FBRXZCLGdCQUFjLFFBQVEsQ0FBQ0YsZ0JBQTRCO0FBRS9DO0FBQUEsTUFDSTtBQUFBLE1BQ0FBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSLENBQUM7QUFFRCxTQUFPO0FBQUEsSUFFSCxXQUFXLFdBQVcsS0FBSztBQUFBLElBQzNCLEdBQUc7QUFBQSxFQUFBO0FBRVg7QUFFQSxNQUFNLFlBQVksQ0FDZCxPQUNBQSxhQUNBLFlBQ087QUFFUCxRQUFNLE1BQWNBLFlBQVc7QUFDL0IsUUFBTSxTQUFpQkgsV0FBRSxhQUFBO0FBRXpCLE1BQUksVUFBVSxnQkFBZ0I7QUFBQSxJQUMxQjtBQUFBLElBQ0E7QUFBQSxJQUNBLFdBQVc7QUFBQSxFQUFBO0FBR2YsUUFBTSxTQUFTLG1CQUFtQjtBQUFBLElBQzlCO0FBQUEsSUFDQSxXQUFXRyxZQUFXO0FBQUEsSUFDdEIsU0FBUztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1I7QUFBQSxJQUFBO0FBQUEsSUFFSixVQUFVO0FBQUEsSUFDVixRQUFRQSxZQUFXO0FBQUEsSUFDbkIsT0FBTyxDQUFDLFFBQWdCLGlCQUFzQjtBQUUxQyxjQUFRLElBQUk7QUFBQTtBQUFBLDZCQUVLLEdBQUc7QUFBQSx1Q0FDTyxLQUFLLFVBQVUsWUFBWSxDQUFDO0FBQUEsK0JBQ3BDLEtBQUssVUFBVSxhQUFhLEtBQUssQ0FBQztBQUFBLGdDQUNqQyxVQUFVLElBQUk7QUFBQSwrQkFDZixNQUFNO0FBQUEsa0JBQ25CO0FBRU4sWUFBTSxpREFBaUQ7QUFBQSxJQUMzRDtBQUFBLEVBQUEsQ0FDSDtBQUVELFVBQVEsS0FBSyxNQUFNO0FBQ3ZCO0FBRUEsTUFBTSxpQkFBaUI7QUFBQSxFQUVuQiwyQkFBMkIsQ0FBQyxVQUFrQztBQUUxRCxRQUFJLENBQUMsT0FBTztBQUVSLGFBQU87QUFBQSxJQUNYO0FBRUEsUUFBSSxNQUFNLGNBQWMsdUJBQXVCLFdBQVcsR0FBRztBQUd6RCxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sNkJBQWlELE1BQU0sY0FBYztBQUMzRSxVQUFNLGNBQWMseUJBQXlCLENBQUE7QUFFN0MsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLDBCQUEwQixDQUFDLFVBQWtDO0FBRXpELFFBQUksQ0FBQyxPQUFPO0FBRVIsYUFBTztBQUFBLElBQ1g7QUFFQSxRQUFJLE1BQU0sY0FBYyxtQkFBbUIsV0FBVyxHQUFHO0FBR3JELGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxxQkFBcUMsTUFBTSxjQUFjO0FBQy9ELFVBQU0sY0FBYyxxQkFBcUIsQ0FBQTtBQUV6QyxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDcEtBLE1BQU0sc0JBQXNCO0FBQUEsRUFFeEIsMEJBQTBCLENBQUMsVUFBa0I7QUFFekMsVUFBTSwyQkFBMkIsTUFBVztBQUV4QyxVQUFJLE1BQU0sY0FBYyx1QkFBdUIsU0FBUyxHQUFHO0FBRXZELGVBQU87QUFBQSxVQUNILGVBQWU7QUFBQSxVQUNmLEVBQUUsT0FBTyxHQUFBO0FBQUEsUUFBRztBQUFBLE1BRXBCO0FBQUEsSUFDSjtBQUVBLFVBQU0sMkJBQTJCLE1BQVc7QUFFeEMsVUFBSSxNQUFNLGNBQWMsbUJBQW1CLFNBQVMsR0FBRztBQUVuRCxlQUFPO0FBQUEsVUFDSCxlQUFlO0FBQUEsVUFDZixFQUFFLE9BQU8sR0FBQTtBQUFBLFFBQUc7QUFBQSxNQUVwQjtBQUFBLElBQ0o7QUFFQSxVQUFNLHFCQUE0QjtBQUFBLE1BRTlCLHlCQUFBO0FBQUEsTUFDQSx5QkFBQTtBQUFBLElBQXlCO0FBRzdCLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUNwQ0EsTUFBTSxvQkFBb0IsQ0FBQyxVQUFrQjtBQUV6QyxNQUFJLENBQUMsT0FBTztBQUNSO0FBQUEsRUFDSjtBQUVBLFFBQU0sZ0JBQXVCO0FBQUEsSUFFekIsR0FBRyxvQkFBb0IseUJBQXlCLEtBQUs7QUFBQSxFQUFBO0FBR3pELFNBQU87QUFDWDtBQ2ZBLE1BQU0sVUFBVTtBQUFBLEVBRVosa0JBQWtCO0FBQUEsRUFNbEIsdUJBQXVCO0FBQzNCO0FDUEEsTUFBTSw0QkFBNEIsTUFBTTtBQUVwQyxRQUFNLHlCQUE4QyxTQUFTLGlCQUFpQixRQUFRLHFCQUFxQjtBQUMzRyxNQUFJO0FBQ0osTUFBSTtBQUVKLFdBQVMsSUFBSSxHQUFHLElBQUksdUJBQXVCLFFBQVEsS0FBSztBQUVwRCxrQkFBYyx1QkFBdUIsQ0FBQztBQUN0QyxxQkFBaUIsWUFBWSxRQUFRO0FBRXJDLFFBQUksa0JBQWtCLE1BQU07QUFFeEIsa0JBQVksWUFBWTtBQUN4QixhQUFPLFlBQVksUUFBUTtBQUFBLElBQy9CO0FBQUEsRUFDSjtBQUNKO0FDakJBLE1BQU0sbUJBQW1CLE1BQU07QUFFM0IsNEJBQUE7QUFDSjtBQ0hBLE1BQU0sYUFBYTtBQUFBLEVBRWpCLGtCQUFrQixNQUFNO0FBRXRCLHFCQUFBO0FBQUEsRUFDRjtBQUFBLEVBRUEsc0JBQXNCLE1BQU07QUFFMUIsV0FBTyxXQUFXLE1BQU07QUFFdEIsaUJBQVcsaUJBQUE7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUNGO0FDZEEsTUFBTSxjQUFjO0FBQUEsRUFFaEIsV0FBVyxDQUFDLFVBQTBCO0FBRWxDLFFBQUksQ0FBQyxRQUFRLFdBQVcsUUFBUSxxQkFBcUI7QUFFakQsYUFBTyxVQUFVLE9BQU8sWUFBWTtBQUFBLElBQ3hDLE9BQ0s7QUFDRCxhQUFPLFVBQVUsT0FBTyxzQkFBc0I7QUFBQSxJQUNsRDtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUNoQk8sSUFBSyw4QkFBQUcsZUFBTDtBQUVIQSxhQUFBLE1BQUEsSUFBTztBQUNQQSxhQUFBLE1BQUEsSUFBTztBQUNQQSxhQUFBLE1BQUEsSUFBTztBQUpDLFNBQUFBO0FBQUEsR0FBQSxhQUFBLENBQUEsQ0FBQTtBQ0VaLE1BQXFCLGlCQUE4QztBQUFBLEVBRXhELDBCQUFtQztBQUFBLEVBQ25DLG1CQUE0QjtBQUFBLEVBQzVCLG9CQUE2QjtBQUFBLEVBQzdCLGFBQXNCO0FBQUEsRUFDdEIsZUFBdUI7QUFDbEM7QUNIQSxNQUFxQixlQUEwQztBQUFBLEVBRTNELFlBQ0ksSUFDQSxrQkFDQSxTQUNBLGNBQ0Y7QUFDRSxTQUFLLEtBQUs7QUFDVixTQUFLLFVBQVU7QUFDZixTQUFLLG1CQUFtQjtBQUN4QixTQUFLLGVBQWU7QUFBQSxFQUN4QjtBQUFBLEVBRU87QUFBQSxFQUNBLE9BQXNCO0FBQUEsRUFDdEIsV0FBMEI7QUFBQSxFQUMxQixVQUF5QjtBQUFBLEVBQ3pCLGlCQUF5QjtBQUFBLEVBQ3pCLGNBQXNCO0FBQUEsRUFDdEIsVUFBa0I7QUFBQSxFQUNsQixZQUFvQjtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxRQUFnQjtBQUFBLEVBQ2hCLFdBQW1DO0FBQUEsRUFDbkMsU0FBa0I7QUFBQSxFQUNsQixVQUFrQyxDQUFBO0FBQUEsRUFDbEMsV0FBd0Q7QUFBQSxFQUV4RCxTQUFpQjtBQUFBLEVBQ2pCLGNBQXVCO0FBQUEsRUFDdkIsUUFBZ0I7QUFBQSxFQUVoQixPQUE2QjtBQUFBLEVBQzdCO0FBQUEsRUFDQTtBQUFBLEVBRUEsS0FBd0IsSUFBSSxpQkFBQTtBQUN2QztBQzVDTyxJQUFLLGdDQUFBQyxpQkFBTDtBQUVIQSxlQUFBLE1BQUEsSUFBTztBQUNQQSxlQUFBLE1BQUEsSUFBTztBQUNQQSxlQUFBLE1BQUEsSUFBTztBQUNQQSxlQUFBLE1BQUEsSUFBTztBQUxDLFNBQUFBO0FBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtBQ0daLE1BQXFCLGtCQUFnRDtBQUFBLEVBRTFELElBQVk7QUFBQTtBQUFBLEVBQ1osSUFBbUI7QUFBQTtBQUFBLEVBQ25CLElBQStCO0FBQUE7QUFBQSxFQUMvQixLQUFnQztBQUFBO0FBQUEsRUFDaEMsSUFBK0IsQ0FBQTtBQUFBO0FBQUEsRUFDL0IsU0FBb0M7QUFBQSxFQUNwQyxPQUFvQixZQUFZO0FBQUEsRUFDaEMsVUFBbUI7QUFBQSxFQUNuQixTQUFrQjtBQUFBLEVBQ2xCLFNBQWtCO0FBQzdCO0FDVkEsTUFBcUIsY0FBd0M7QUFBQSxFQUV6RCxZQUFZLE1BQWM7QUFFdEIsU0FBSyxPQUFPO0FBQUEsRUFDaEI7QUFBQSxFQUVPO0FBQUEsRUFDQSxTQUFTO0FBQUEsRUFFVCxJQUFZO0FBQUEsRUFDWixJQUF3QixJQUFJLGtCQUFBO0FBQUEsRUFDNUIsSUFBZ0MsQ0FBQTtBQUFBLEVBQ2hDO0FBQUEsRUFDQTtBQUNYO0FDbEJBLE1BQXFCLG1CQUFrRDtBQUFBLEVBRTVELElBQVk7QUFBQSxFQUNaLElBQVk7QUFDdkI7QUNBQSxNQUFxQixhQUFzQztBQUFBLEVBRXZELFlBQ0ksUUFDQSxPQUNBLFFBQ0Y7QUFDRSxTQUFLLFNBQVM7QUFDZCxTQUFLLFFBQVE7QUFFYixTQUFLLE9BQU8sSUFBSTtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRU87QUFBQSxFQUNBO0FBQUEsRUFDQSxVQUFpQztBQUFBLEVBQ2pDO0FBQUEsRUFDQSxVQUFrQztBQUM3QztBQzNCQSxNQUFxQixZQUFvQztBQUFBLEVBRXJELFlBQVksSUFBWTtBQUVwQixTQUFLLEtBQUs7QUFBQSxFQUNkO0FBQUEsRUFFTztBQUFBLEVBQ0EsUUFBZ0I7QUFBQSxFQUNoQixjQUFzQjtBQUFBLEVBQ3RCLE9BQWU7QUFBQSxFQUNmLG9CQUFtQztBQUM5QztBQ2RPLElBQUssa0NBQUFDLG1CQUFMO0FBQ0hBLGlCQUFBLE1BQUEsSUFBTztBQUNQQSxpQkFBQSxJQUFBLElBQUs7QUFDTEEsaUJBQUEsTUFBQSxJQUFPO0FBSEMsU0FBQUE7QUFBQSxHQUFBLGlCQUFBLENBQUEsQ0FBQTtBQ0daLE1BQXFCLE9BQTBCO0FBQUEsRUFFcEMsWUFBcUI7QUFBQSxFQUNyQixzQkFBK0I7QUFBQSxFQUMvQixhQUFzQjtBQUFBLEVBQ3RCLGNBQXVCO0FBQUEsRUFDdkIsa0JBQWlDO0FBQUEsRUFDakMsWUFBMkIsY0FBYztBQUFBLEVBQ3pDLGNBQXNCO0FBQUEsRUFFdEIsS0FBaUI7QUFDNUI7QUNWQSxNQUFxQixVQUFnQztBQUFBLEVBRTFDLG1CQUFrQztBQUFBLEVBQ2xDLFNBQWtCLElBQUksT0FBQTtBQUNqQztBQ1BBLE1BQU0saUJBQWlCO0FBQUEsRUFFbkIsdUJBQXVCO0FBQUEsRUFDdkIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsdUJBQXVCO0FBQUEsRUFDdkIsMEJBQTBCO0FBQzlCO0FDR0EsTUFBTSxhQUFhLENBQUMsYUFBZ0M7QUFFaEQsUUFBTSxRQUFzQixJQUFJLFlBQVksU0FBUyxFQUFFO0FBQ3ZELFFBQU0sUUFBUSxTQUFTLFNBQVM7QUFDaEMsUUFBTSxjQUFjLFNBQVMsZUFBZTtBQUM1QyxRQUFNLE9BQU8sU0FBUyxRQUFRO0FBQzlCLFFBQU0sb0JBQW9CLFlBQVkscUJBQXFCLFNBQVMsa0JBQWtCO0FBRXRGLFNBQU87QUFDWDtBQUVBLE1BQU0sd0JBQXdCLENBQzFCLE9BQ0EsUUFDTztBQUVQLE1BQUksQ0FBQyxLQUFLO0FBQ04sV0FBTztBQUFBLEVBQ1g7QUF1Q0EsUUFBTSxRQUFRLFdBQVcsSUFBSSxLQUFLO0FBRWxDLFFBQU0sZUFBZSxJQUFJO0FBQUEsSUFDckIsV0FBVyxlQUFlLEtBQUs7QUFBQSxJQUMvQjtBQUFBLElBQ0EsSUFBSSxTQUFTO0FBQUEsRUFBQTtBQUdqQixnQkFBYztBQUFBLElBQ1Y7QUFBQSxJQUNBLElBQUk7QUFBQSxJQUNKLGFBQWE7QUFBQSxFQUFBO0FBR2pCLFFBQU0sWUFBWSxlQUFlO0FBQ2pDLFFBQU0sWUFBWSxpQkFBaUI7QUFFbkMsZ0JBQWM7QUFBQSxJQUNWO0FBQUEsSUFDQSxNQUFNLFlBQVk7QUFBQSxFQUFBO0FBRTFCO0FBRUEsTUFBTSxjQUFjO0FBQUEsRUFFaEIsc0JBQXNCLENBQUMsZUFBc0M7QUFFekQsUUFBSSxVQUFVO0FBRWQsUUFBSSxDQUFDUixXQUFFLG1CQUFtQixVQUFVLEdBQUc7QUFFbkMsVUFBSSxDQUFDLFNBQVMsT0FBTyxTQUFTLEdBQUcsR0FBRztBQUVoQyxZQUFJLENBQUMsV0FBVyxXQUFXLEdBQUcsR0FBRztBQUU3QixvQkFBVTtBQUFBLFFBQ2Q7QUFBQSxNQUNKLE9BQ0s7QUFDRCxZQUFJLFdBQVcsV0FBVyxHQUFHLE1BQU0sTUFBTTtBQUVyQyx1QkFBYSxXQUFXLFVBQVUsQ0FBQztBQUFBLFFBQ3ZDO0FBQUEsTUFDSjtBQUVBLGFBQU8sR0FBRyxTQUFTLE1BQU0sR0FBRyxPQUFPLEdBQUcsVUFBVTtBQUFBLElBQ3BEO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLHNCQUFzQixNQUFNO0FBRXhCLFVBQU0saUJBQWlDLFNBQVMsZUFBZSxRQUFRLGdCQUFnQjtBQUV2RixRQUFJLGtCQUNHLGVBQWUsY0FBQSxNQUFvQixNQUN4QztBQUNFLFVBQUk7QUFFSixlQUFTLElBQUksR0FBRyxJQUFJLGVBQWUsV0FBVyxRQUFRLEtBQUs7QUFFdkQsb0JBQVksZUFBZSxXQUFXLENBQUM7QUFFdkMsWUFBSSxVQUFVLGFBQWEsS0FBSyxjQUFjO0FBRTFDLGNBQUksQ0FBQyxPQUFPLFdBQVc7QUFFbkIsbUJBQU8sWUFBWSxJQUFJLFVBQUE7QUFBQSxVQUMzQjtBQUVBLGlCQUFPLFVBQVUsbUJBQW1CLFVBQVU7QUFDOUMsb0JBQVUsT0FBQTtBQUVWO0FBQUEsUUFDSixXQUNTLFVBQVUsYUFBYSxLQUFLLFdBQVc7QUFDNUM7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFFQSx1QkFBdUIsQ0FBQyxVQUFrQjtBQUV0QyxRQUFJLENBQUMsT0FBTyxXQUFXLGtCQUFrQjtBQUNyQztBQUFBLElBQ0o7QUFFQSxRQUFJO0FBQ0EsVUFBSSxxQkFBcUIsT0FBTyxVQUFVO0FBQzFDLDJCQUFxQixtQkFBbUIsS0FBQTtBQUV4QyxVQUFJLENBQUMsbUJBQW1CLFdBQVcsZUFBZSxxQkFBcUIsR0FBRztBQUN0RTtBQUFBLE1BQ0o7QUFFQSwyQkFBcUIsbUJBQW1CLFVBQVUsZUFBZSxzQkFBc0IsTUFBTTtBQUM3RixZQUFNLE1BQU0sS0FBSyxNQUFNLGtCQUFrQjtBQUV6QztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsU0FDTyxHQUFHO0FBQ04sY0FBUSxNQUFNLENBQUM7QUFFZjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFFQSx5QkFBeUIsTUFBTTtBQUFBLEVBRS9CO0FBQ0o7QUNsTEEsTUFBcUIsYUFBc0M7QUFBQSxFQUV2RCxZQUNJLFFBQ0EsT0FDRjtBQUNFLFNBQUssU0FBUztBQUNkLFNBQUssUUFBUTtBQUFBLEVBQ2pCO0FBQUEsRUFFTztBQUFBLEVBQ0E7QUFBQSxFQUNBLFVBQWlDO0FBQUEsRUFDakMsT0FBK0I7QUFBQSxFQUMvQixTQUFpQztBQUFBLEVBQ2pDLFVBQWtDO0FBQzdDO0FDaEJBLE1BQXFCLGFBQXNDO0FBQUEsRUFFdkQsWUFDSSxPQUNBLE9BQ0EsS0FDRjtBQUNFLFNBQUssUUFBUTtBQUNiLFNBQUssUUFBUTtBQUNiLFNBQUssTUFBTTtBQUNYLFNBQUssT0FBTyxHQUFHLE1BQU0sSUFBSSxHQUFHLEtBQUssUUFBUSxFQUFFO0FBQUEsRUFDL0M7QUFBQSxFQUVPO0FBQUEsRUFDQTtBQUFBLEVBQ0EsZUFBMEMsQ0FBQTtBQUFBLEVBQzFDLHFCQUE4QjtBQUFBLEVBRTlCO0FBQUEsRUFDQTtBQUFBLEVBRUEsbUJBQTJDO0FBQUEsRUFDM0MsaUJBQXlDO0FBQUEsRUFDekMsb0JBQTRDO0FBQ3ZEO0FDMUJBLE1BQXFCLFlBQW1DO0FBQUEsRUFFcEQsWUFDSSxNQUNBLEtBQ0EsTUFDQSxRQUNBLFFBQ0Y7QUFDRSxTQUFLLE9BQU87QUFDWixTQUFLLE1BQU07QUFDWCxTQUFLLE9BQU87QUFDWixTQUFLLFNBQVM7QUFDZCxTQUFLLFNBQVM7QUFBQSxFQUNsQjtBQUFBLEVBRU87QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ1g7QUNWQSxNQUFNLHFCQUFxQixDQUN2QixTQUNBLGFBQ0EsYUFDTztBQUVQLE1BQUksUUFBUSxJQUFJLFFBQVEsWUFBWSxNQUFNLE9BQ25DLFFBQVEsSUFBSSxTQUFTLFlBQVksTUFBTSxNQUM1QztBQUNFLFVBQU0sSUFBSSxNQUFNLCtDQUErQztBQUFBLEVBQ25FO0FBRUEsTUFBSSxDQUFDLFlBQVksa0JBQWtCO0FBRS9CLFVBQU0sSUFBSSxNQUFNLG9DQUFvQztBQUFBLEVBQ3hEO0FBRUEsTUFBSSxDQUFDLFlBQVksZ0JBQWdCO0FBRTdCLFVBQU0sSUFBSSxNQUFNLGlDQUFpQztBQUFBLEVBQ3JEO0FBRUEsTUFBSSxDQUFDLFlBQVksbUJBQW1CO0FBRWhDLFVBQU0sSUFBSSxNQUFNLHFDQUFxQztBQUFBLEVBQ3pEO0FBRUEsTUFBSUEsV0FBRSxtQkFBbUIsU0FBUyxJQUFJLE1BQU0sTUFBTTtBQUU5QyxVQUFNLElBQUksTUFBTSx3REFBd0Q7QUFBQSxFQUM1RSxXQUNTLFlBQVksTUFBTSxTQUFTLFlBQVksTUFBTTtBQUVsRCxVQUFNLElBQUksTUFBTSxtREFBbUQ7QUFBQSxFQUN2RTtBQUNKO0FBRUEsTUFBTSx5QkFBeUIsQ0FBQyxtQkFBbUU7QUFFL0YsTUFBSSxtQkFBZ0MsWUFBWTtBQUNoRCxNQUFJLFNBQVM7QUFFYixNQUFJLG1CQUFtQixLQUFLO0FBRXhCLHVCQUFtQixZQUFZO0FBQUEsRUFDbkMsV0FDUyxtQkFBbUIsS0FBSztBQUU3Qix1QkFBbUIsWUFBWTtBQUFBLEVBQ25DLFdBQ1MsbUJBQW1CLEtBQUs7QUFFN0IsdUJBQW1CLFlBQVk7QUFDL0IsYUFBUztBQUFBLEVBQ2IsT0FDSztBQUVELFVBQU0sSUFBSSxNQUFNLG9EQUFvRCxjQUFjLEVBQUU7QUFBQSxFQUN4RjtBQUVBLFNBQU87QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxpQkFBaUIsQ0FBQyxtQkFBc0U7QUFFMUYsUUFBTSxtQkFBbUJBLFdBQUU7QUFBQSxJQUN2QjtBQUFBLElBQ0EsQ0FBQyxLQUFLLEtBQUssR0FBRztBQUFBLElBQ2Q7QUFBQSxFQUFBO0FBR0osTUFBSSxxQkFBcUIsSUFBSTtBQUV6QixXQUFPO0FBQUEsTUFDSCxPQUFPLGVBQWU7QUFBQSxNQUN0QixRQUFRO0FBQUEsSUFBQTtBQUFBLEVBRWhCO0FBRUEsU0FBTztBQUFBLElBQ0gsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLEVBQUE7QUFFaEI7QUFFQSxNQUFNLGlCQUFpQixDQUFDLG1CQUFtRTtBQUV2RixRQUFNLGlCQUFpQixlQUFlLFVBQVUsR0FBRyxDQUFDO0FBQ3BELFFBQU0sY0FBYyx1QkFBdUIsY0FBYztBQUV6RCxTQUFPO0FBQ1g7QUFFQSxNQUFNLHFCQUFxQixDQUFDLG1CQUFtRjtBQUUzRyxNQUFJLGNBQW1DO0FBQ3ZDLE1BQUksV0FBVztBQUVmLE1BQUksQ0FBQ0EsV0FBRSxtQkFBbUIsY0FBYyxHQUFHO0FBRXZDLFVBQU0sY0FBYyxlQUFlLGNBQWM7QUFDakQsVUFBTSxTQUFvRCxlQUFlLGNBQWM7QUFFdkYsVUFBTSxNQUFNLGVBQWU7QUFBQSxNQUN2QjtBQUFBLE1BQ0EsT0FBTztBQUFBLElBQUE7QUFHWCxrQkFBYyxJQUFJO0FBQUEsTUFDZCxlQUFlLFVBQVUsR0FBRyxPQUFPLEtBQUs7QUFBQSxNQUN4QztBQUFBLE1BQ0EsWUFBWTtBQUFBLE1BQ1o7QUFBQSxNQUNBLFlBQVk7QUFBQSxJQUFBO0FBR2hCLFFBQUksT0FBTyxXQUFXLE1BQU07QUFFeEIsa0JBQVksU0FBUztBQUFBLElBQ3pCO0FBRUEsZUFBVyxlQUFlLFVBQVUsT0FBTyxLQUFLO0FBQUEsRUFDcEQ7QUFFQSxTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBRVI7QUFFQSxNQUFNLGVBQWUsQ0FDakIsVUFDQSxtQkFDcUQ7QUFFckQsUUFBTSxlQUFlLG1CQUFtQixjQUFjO0FBRXRELE1BQUksQ0FBQyxhQUFhLGFBQWE7QUFFM0IsVUFBTSxJQUFJLE1BQU0sNkJBQTZCO0FBQUEsRUFDakQ7QUFFQSxtQkFBaUIsYUFBYTtBQUM5QixRQUFNLGFBQWEsbUJBQW1CLGNBQWM7QUFFcEQsTUFBSSxDQUFDLFdBQVcsYUFBYTtBQUV6QixVQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxFQUMvQztBQUVBLFFBQU0sVUFBVSxJQUFJO0FBQUEsSUFDaEIsU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLEVBQUE7QUFHZixXQUFTLEtBQUssT0FBTztBQUVyQixTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBRVI7QUFFQSxNQUFNLG1CQUFtQixDQUNyQixVQUNBLG1CQUNxRDtBQUVyRCxRQUFNLG1CQUFtQixJQUFJO0FBQUEsSUFDekI7QUFBQSxJQUNBO0FBQUEsSUFDQSxZQUFZO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osUUFBTSxpQkFBaUIsbUJBQW1CLGNBQWM7QUFFeEQsTUFBSSxDQUFDLGVBQWUsYUFBYTtBQUU3QixVQUFNLElBQUksTUFBTSw2QkFBNkI7QUFBQSxFQUNqRDtBQUVBLFFBQU0sY0FBYyxJQUFJO0FBQUEsSUFDcEIsU0FBUztBQUFBLElBQ1Q7QUFBQSxJQUNBLGVBQWU7QUFBQSxFQUFBO0FBR25CLFdBQVMsS0FBSyxXQUFXO0FBRXpCLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTO0FBQUEsRUFBQTtBQUVqQjtBQUVBLE1BQU0sY0FBYyxDQUNoQixPQUNBLFNBQ0EsbUJBQThDLFNBQ3ZDO0FBRVAsZUFBYTtBQUFBLElBQ1Q7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixRQUFNLDBCQUEwQixRQUFRO0FBRXhDLE1BQUksd0JBQXdCLFNBQVMsR0FBRztBQUVwQyxVQUFNLFlBQVksd0JBQXdCLHdCQUF3QixTQUFTLENBQUM7QUFFNUUsUUFBSSxVQUFVLE1BQU0sUUFBUSxNQUFNLEtBQUs7QUFFbkMsZ0JBQVUsT0FBTyxRQUFRLE1BQU07QUFBQSxJQUNuQztBQUVBLFVBQU0sV0FBVyx3QkFBd0IsQ0FBQztBQUUxQyxRQUFJLFNBQVMsTUFBTSxRQUFRLElBQUksS0FBSztBQUVoQyxlQUFTLE9BQU8sUUFBUSxJQUFJO0FBQzVCLGVBQVMsU0FBUyxRQUFRLElBQUk7QUFBQSxJQUNsQztBQUFBLEVBQ0o7QUFFQSxnQkFBYztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxlQUFlO0FBQUEsRUFFakIsdUJBQXVCLENBQ25CLE9BQ0EsY0FDQSxTQUNPO0FBRVAsUUFBSSxDQUFDLGdCQUNFLENBQUMsTUFBTSxZQUFZLGFBQ3hCO0FBQ0U7QUFBQSxJQUNKO0FBRUEsVUFBTSxVQUFVLE1BQU0sWUFBWSxTQUFTLGVBQWUsQ0FBQztBQUUzRCxRQUFJLENBQUMsU0FBUztBQUVWLFlBQU0sSUFBSSxNQUFNLGlCQUFpQjtBQUFBLElBQ3JDO0FBRUEsWUFBUSxvQkFBb0I7QUFDNUIsVUFBTSxjQUFjLE1BQU0sWUFBWSxTQUFTLFlBQVk7QUFFM0QsUUFBSSxhQUFhO0FBRWIsa0JBQVksbUJBQW1CLFFBQVE7QUFDdkMsa0JBQVksaUJBQWlCO0FBQzdCLGtCQUFZLG9CQUFvQjtBQUVoQztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFBQSxFQUNKO0FBQUEsRUFFQSxpQkFBaUIsQ0FDYixPQUNBLGtCQUNBLGNBQ0EsU0FDZ0I7QUFFaEIsVUFBTSxXQUFXLE1BQU0sWUFBWTtBQUVuQyxRQUFJLG1CQUFtQixHQUFHO0FBRXRCLFlBQU0sSUFBSSxNQUFNLFdBQVc7QUFBQSxJQUMvQjtBQUVBLFVBQU0saUJBQWlCLFNBQVMsbUJBQW1CLENBQUM7QUFDcEQsbUJBQWUsb0JBQW9CO0FBRW5DLFFBQUksb0JBQW9CLFNBQVMsUUFBUTtBQUVyQyxZQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxJQUNoRDtBQUVBLFVBQU0sY0FBYyxTQUFTLGdCQUFnQjtBQUU3QyxRQUFJLENBQUMsYUFBYTtBQUVkLFlBQU0sSUFBSSxNQUFNLDRCQUE0QjtBQUFBLElBQ2hEO0FBRUEsUUFBSSxZQUFZLHVCQUF1QixNQUFNO0FBRXpDLGFBQU87QUFBQSxJQUNYO0FBRUEsZ0JBQVkscUJBQXFCO0FBQ2pDLGdCQUFZLG1CQUFtQixlQUFlO0FBQzlDLGdCQUFZLGlCQUFpQjtBQUM3QixnQkFBWSxvQkFBb0I7QUFFaEMsUUFBSSxDQUFDLFlBQVksa0JBQWtCO0FBRS9CLGtCQUFZLG1CQUFtQixlQUFlO0FBQUEsSUFDbEQ7QUFFQSxRQUFJLENBQUMsWUFBWSxnQkFBZ0I7QUFFN0Isa0JBQVksaUJBQWlCLGVBQWU7QUFBQSxJQUNoRDtBQUVBLFFBQUksQ0FBQyxZQUFZLG1CQUFtQjtBQUVoQyxrQkFBWSxvQkFBb0IsZUFBZTtBQUFBLElBQ25EO0FBRUEsUUFBSUEsV0FBRSxtQkFBbUIsWUFBWSxlQUFlLFNBQVMsRUFBRSxDQUFDLE1BQU0sTUFBTTtBQUV4RSxZQUFNLElBQUksTUFBTSx3Q0FBd0M7QUFBQSxJQUM1RDtBQUVBLFFBQUksbUJBQW1CLFdBQVc7QUFBQSxNQUM5QjtBQUFBLE1BQ0EsWUFBWSxlQUFlO0FBQUEsTUFDM0IsWUFBWSxlQUFlLFNBQVMsRUFBRTtBQUFBLElBQUE7QUFHMUM7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0o7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGlCQUFpQixDQUNiLE9BQ0EsY0FDQSxXQUNnQjtBQUVoQixVQUFNLFdBQVcsTUFBTSxZQUFZO0FBQ25DLFVBQU0saUJBQWlCLFNBQVMsWUFBWTtBQUM1QyxVQUFNLG1CQUFtQixlQUFlO0FBRXhDLFFBQUksb0JBQW9CLFNBQVMsUUFBUTtBQUVyQyxZQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxJQUNoRDtBQUVBLFVBQU0sY0FBYyxTQUFTLGdCQUFnQjtBQUU3QyxRQUFJLENBQUMsYUFBYTtBQUVkLFlBQU0sSUFBSSxNQUFNLDRCQUE0QjtBQUFBLElBQ2hEO0FBRUEsUUFBSSxZQUFZLHVCQUF1QixNQUFNO0FBRXpDLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxpQkFBaUIsZUFBZTtBQUN0QyxVQUFNLE9BQU8sZUFBZTtBQUU1QixRQUFJLENBQUMsTUFBTTtBQUVQLFlBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUFBLElBQzNDO0FBRUEsbUJBQWUsb0JBQW9CLEtBQUs7QUFDeEMsZ0JBQVkscUJBQXFCO0FBQ2pDLGdCQUFZLG1CQUFtQixlQUFlO0FBQzlDLGdCQUFZLGlCQUFpQixlQUFlO0FBQzVDLGdCQUFZLG9CQUFvQixlQUFlO0FBRS9DLFFBQUksQ0FBQyxZQUFZLGtCQUFrQjtBQUUvQixZQUFNLElBQUksTUFBTSw2QkFBNkI7QUFBQSxJQUNqRDtBQUVBLFVBQU0sa0JBQWtCLFdBQVc7QUFBQSxNQUMvQjtBQUFBLE1BQ0EsWUFBWSxpQkFBaUI7QUFBQSxNQUM3QixZQUFZLE1BQU07QUFBQSxJQUFBO0FBR3RCLFFBQUksQ0FBQyxpQkFBaUI7QUFFbEIsWUFBTSxJQUFJLE1BQU0sMEJBQTBCO0FBQUEsSUFDOUM7QUFFQSxRQUFJQSxXQUFFLG1CQUFtQixnQkFBZ0IsRUFBRSxNQUFNLE1BQU07QUFFbkQsWUFBTSxJQUFJLE1BQU0sbUJBQW1CO0FBQUEsSUFDdkM7QUFFQSxVQUFNLGtCQUFrQixXQUFXO0FBQUEsTUFDL0I7QUFBQSxNQUNBLFlBQVksZUFBZTtBQUFBLE1BQzNCO0FBQUEsSUFBQTtBQUdKLFFBQUksQ0FBQyxpQkFBaUI7QUFFbEIsWUFBTSxJQUFJLE1BQU0sMEJBQTBCO0FBQUEsSUFDOUM7QUFFQSxRQUFJLGdCQUFnQixPQUFPLGdCQUFnQixHQUFHO0FBRTFDLFlBQU0sSUFBSSxNQUFNLGdEQUFnRDtBQUFBLElBQ3BFO0FBRUE7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGlCQUFpQixDQUNiLE9BQ0EsWUFDTztBQUVQLFFBQUksUUFBUSx1QkFBdUIsTUFBTTtBQUNyQztBQUFBLElBQ0o7QUFFQSxZQUFRLHFCQUFxQjtBQUM3QixVQUFNLG1CQUFtQixRQUFRLFFBQVE7QUFDekMsVUFBTSxXQUFXLE1BQU0sWUFBWTtBQUVuQyxRQUFJLG9CQUFvQixTQUFTLFFBQVE7QUFFckMsWUFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQUEsSUFDaEQ7QUFFQSxVQUFNLGNBQWMsU0FBUyxnQkFBZ0I7QUFFN0MsUUFBSSxhQUFhO0FBRWIsVUFBSSxDQUFDLFlBQVksa0JBQWtCO0FBRS9CLG9CQUFZLG1CQUFtQixRQUFRO0FBQUEsTUFDM0M7QUFFQSxVQUFJLENBQUMsWUFBWSxnQkFBZ0I7QUFFN0Isb0JBQVksaUJBQWlCLFFBQVE7QUFBQSxNQUN6QztBQUVBLFVBQUksQ0FBQyxZQUFZLG1CQUFtQjtBQUVoQyxvQkFBWSxvQkFBb0IsUUFBUTtBQUFBLE1BQzVDO0FBRUE7QUFBQSxRQUNJO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBQUEsRUFDSjtBQUFBLEVBRUEsMkJBQTJCLENBQ3ZCLE9BQ0EsWUFDNEI7QUFFNUIsUUFBSSxjQUFjLFFBQVEsYUFBYSxJQUFBLEtBQVM7QUFFaEQsUUFBSSxhQUFhLFdBQVcsTUFBTTtBQUU5QixhQUFPO0FBQUEsSUFDWDtBQUVBLFFBQUksUUFBUSxhQUFhLFdBQVcsR0FBRztBQUVuQyxZQUFNLGNBQWMsTUFBTSxZQUFZLFNBQVMsUUFBUSxRQUFRLENBQUM7QUFFaEUsVUFBSSxDQUFDLGFBQWE7QUFFZCxjQUFNLElBQUksTUFBTSxzQkFBc0I7QUFBQSxNQUMxQztBQUVBLFVBQUksQ0FBQyxZQUFZLGtCQUFrQjtBQUUvQixvQkFBWSxtQkFBbUIsUUFBUTtBQUFBLE1BQzNDO0FBRUEsVUFBSSxDQUFDLFlBQVksZ0JBQWdCO0FBRTdCLG9CQUFZLGlCQUFpQixRQUFRO0FBQUEsTUFDekM7QUFFQSxVQUFJLENBQUMsWUFBWSxtQkFBbUI7QUFFaEMsb0JBQVksb0JBQW9CLFFBQVE7QUFBQSxNQUM1QztBQUFBLElBQ0o7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsZUFBZSxDQUNYLE9BQ0EsZ0JBQ087QUFFUCxRQUFJLFlBQVksV0FBVyxHQUFHLE1BQU0sTUFBTTtBQUV0QyxvQkFBYyxZQUFZLFVBQVUsQ0FBQztBQUFBLElBQ3pDO0FBRUEsUUFBSSxXQUFXLG1CQUFtQixXQUFXLE1BQU0sTUFBTTtBQUNyRDtBQUFBLElBQ0o7QUFFQSxVQUFNLFdBQWlDLENBQUE7QUFDdkMsUUFBSSxpQkFBaUI7QUFDckIsUUFBSTtBQUVKLGFBQVM7QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLENBQUNBLFdBQUUsbUJBQW1CLGNBQWMsR0FBRztBQUUxQyxlQUFTO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBR0osVUFBSSxPQUFPLFFBQVEsSUFBSSxXQUFXLE1BQU07QUFDcEM7QUFBQSxNQUNKO0FBRUEsdUJBQWlCLE9BQU87QUFBQSxJQUM1QjtBQUVBLFVBQU0sWUFBWSxXQUFXO0FBQUEsRUFDakM7QUFBQSxFQUVBLHlCQUF5QixDQUNyQixPQUNBLFNBQ0EsbUJBQThDLFNBQ3ZDO0FBRVAsUUFBSSxDQUFDLFFBQVEsa0JBQWtCO0FBRTNCLFlBQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUFBLElBQ2pEO0FBRUEsUUFBSSxDQUFDLFFBQVEsZ0JBQWdCO0FBRXpCLFlBQU0sSUFBSSxNQUFNLDBCQUEwQjtBQUFBLElBQzlDO0FBRUEsUUFBSSxzQkFBaUQsQ0FBQTtBQUVyRCxRQUFJLENBQUMsa0JBQWtCO0FBRW5CLHlCQUFtQixXQUFXO0FBQUEsUUFDMUI7QUFBQSxRQUNBLFFBQVEsaUJBQWlCO0FBQUEsUUFDekIsUUFBUSxNQUFNO0FBQUEsTUFBQTtBQUdsQixVQUFJLENBQUMsa0JBQWtCO0FBRW5CLGNBQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUFBLE1BQ2pEO0FBRUEsdUJBQWlCLE9BQU8sUUFBUSxNQUFNO0FBQUEsSUFDMUM7QUFFQSxRQUFJLGlCQUFpQixXQUFXO0FBQUEsTUFDNUI7QUFBQSxNQUNBLFFBQVEsZUFBZTtBQUFBLE1BQ3ZCLFFBQVEsSUFBSTtBQUFBLElBQUE7QUFHaEIsUUFBSSxDQUFDLGdCQUFnQjtBQUVqQixZQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxJQUMvQztBQUVBLG1CQUFlLE9BQU8sUUFBUSxJQUFJO0FBQ2xDLFFBQUksU0FBb0M7QUFDeEMsUUFBSSxZQUFZO0FBRWhCLFdBQU8sUUFBUTtBQUVYLDBCQUFvQixLQUFLLE1BQU07QUFFL0IsVUFBSSxDQUFDLGFBQ0UsUUFBUSxZQUFZLFFBQ3BCLFFBQVEsV0FBVyxNQUN4QjtBQUNFO0FBQUEsTUFDSjtBQUVBLFVBQUksUUFBUSxNQUFNLGlCQUFpQixHQUFHO0FBQ2xDO0FBQUEsTUFDSjtBQUVBLGtCQUFZO0FBQ1osZUFBUyxPQUFPO0FBQUEsSUFDcEI7QUFFQSxZQUFRLGVBQWU7QUFBQSxFQUMzQjtBQUNKO0FDOW5CQSxNQUFNLGtCQUFrQjtBQUFBLEVBRXBCLDRCQUE0QixDQUN4QixPQUNBLGlCQUNBLHNCQUNpQjtBQUVqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLG1DQUFtQyxDQUMvQixPQUNBLGlCQUNBLFNBQ0EsT0FDQSxRQUNBLGlCQUNpQjtBQUVqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLDRCQUE0QixDQUN4QixPQUNBLGlCQUNBLFNBQ0EsT0FDQSxXQUNpQjtBQUVqQixpQkFBYTtBQUFBLE1BQ1Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsNkJBQTZCLENBQ3pCLE9BQ0EsaUJBQ0EsU0FDaUI7QUFFakIsVUFBTSxVQUFVLE1BQU0sWUFBWTtBQUVsQyxRQUFJLENBQUMsU0FBUztBQUVWLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxjQUFjLE1BQU0sWUFBWSxTQUFTLENBQUM7QUFFaEQsUUFBSSxDQUFDLGFBQWE7QUFFZCxhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sb0JBQW9CLFFBQVEsTUFBTTtBQUV4QyxRQUFJQSxXQUFFLG1CQUFtQixpQkFBaUIsTUFBTSxNQUFNO0FBRWxELGFBQU87QUFBQSxJQUNYO0FBRUEsZ0JBQVksbUJBQW1CO0FBQy9CLGdCQUFZLGlCQUFpQjtBQUM3QixnQkFBWSxvQkFBb0I7QUFFaEMsaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixVQUFNLFlBQVksYUFBYTtBQUFBLE1BQzNCO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixRQUFJLFdBQVc7QUFFWCxZQUFNLE1BQU0sR0FBRyxpQkFBaUIsSUFBSSxVQUFVLENBQUMsR0FBRyxlQUFlLHFCQUFxQjtBQUV0RixZQUFNLGVBQWUsQ0FDakJLLFFBQ0FJLHFCQUNpQjtBQUVqQixlQUFPLGlCQUFpQjtBQUFBLFVBQ3BCSjtBQUFBQSxVQUNBSTtBQUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQUE7QUFBQSxNQUVSO0FBRUEsaUJBQVc7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0EsVUFBVTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsT0FDSztBQUNELG1CQUFhO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUNKO0FDaElBLE1BQU0sc0JBQXNCLENBQ3hCLE9BQ0EsYUFDQSxXQUNPO0FBRVAsYUFBVztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixhQUFXLFVBQVUsWUFBWSxHQUFHO0FBRWhDO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQUVBLE1BQU0sV0FBVyxDQUNiLE9BQ0EsU0FDQSxRQUNBLFNBQW9DLFNBQ2Y7QUFFckIsUUFBTSxPQUFPLElBQUksa0JBQUE7QUFDakIsT0FBSyxJQUFJLFFBQVE7QUFDakIsT0FBSyxJQUFJLFFBQVEsS0FBSztBQUN0QixPQUFLLEtBQUssUUFBUSxNQUFNO0FBQ3hCLE9BQUssSUFBSSxRQUFRLEtBQUs7QUFDdEIsT0FBSyxTQUFTO0FBQ2QsT0FBSyxPQUFPLFlBQVk7QUFFeEIsYUFBVztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixNQUFJLEtBQUssR0FBRztBQUVSLFNBQUssT0FBTyxZQUFZO0FBQUEsRUFDNUI7QUFFQSxNQUFJLFFBQVEsS0FDTCxNQUFNLFFBQVEsUUFBUSxDQUFDLE1BQU0sUUFDN0IsUUFBUSxFQUFFLFNBQVMsR0FDeEI7QUFDRSxRQUFJO0FBRUosZUFBVyxVQUFVLFFBQVEsR0FBRztBQUU1QixVQUFJO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFHSixXQUFLLEVBQUUsS0FBSyxDQUFDO0FBQUEsSUFDakI7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUNYO0FBRUEsTUFBTSxhQUFhLENBQ2YsU0FDQSxxQkFDTztBQUVQLFVBQVEsSUFBSSxDQUFBO0FBQ1osTUFBSTtBQUVKLGFBQVcsU0FBUyxrQkFBa0I7QUFFbEMsUUFBSSxJQUFJLG1CQUFBO0FBQ1IsTUFBRSxJQUFJLE1BQU07QUFDWixNQUFFLElBQUksTUFBTTtBQUNaLFlBQVEsRUFBRSxLQUFLLENBQUM7QUFBQSxFQUNwQjtBQUNKO0FBRUEsTUFBTSxlQUFlO0FBQUEsRUFFakIsNEJBQTRCLENBQ3hCLE9BQ0EsUUFDVTtBQUVWLFFBQUksTUFBTSxZQUFZLFlBQVksR0FBRyxNQUFNLE1BQU07QUFFN0MsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLFlBQVksWUFBWSxHQUFHLElBQUk7QUFFckMsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLDRCQUE0QixDQUN4QixPQUNBLGlCQUNBLHNCQUNpQjtBQUVqQixRQUFJLENBQUMsTUFBTSxZQUFZLGNBQWM7QUFFakMsWUFBTSxJQUFJLE1BQU0sd0JBQXdCO0FBQUEsSUFDNUM7QUFFQSxVQUFNLFFBQVEsTUFBTSxZQUFZO0FBQ2hDLFVBQU0sYUFBYSxnQkFBZ0I7QUFFbkMsVUFBTSxlQUFlLGFBQWE7QUFBQSxNQUM5QjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLE1BQU07QUFBQSxJQUFBO0FBR1YsVUFBTSxVQUFVO0FBQ2hCLGlCQUFhLEVBQUUsVUFBVTtBQUV6QixRQUFJLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTTtBQUV4QyxZQUFNLFdBQVcsTUFBTSxZQUFZO0FBRW5DLFVBQUksU0FBUyxTQUFTLEdBQUc7QUFFckIsY0FBTSxjQUFjLFNBQVMsQ0FBQztBQUM5QixvQkFBWSxNQUFNLE1BQU0sYUFBYSxFQUFFO0FBQUEsTUFDM0M7QUFBQSxJQUNKO0FBRUEsa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixRQUFJLGFBQWEsRUFBRSxLQUFLLE1BQU07QUFHMUIsWUFBTSxlQUEyQyxhQUFhO0FBQUEsUUFDMUQ7QUFBQSxRQUNBLGFBQWEsRUFBRTtBQUFBLE1BQUE7QUFHbkIsWUFBTSxZQUFZLE1BQU07QUFFeEIsVUFBSSxDQUFDLFdBQVc7QUFFWixjQUFNLElBQUksTUFBTSwrQkFBK0I7QUFBQSxNQUNuRDtBQUVBLG1CQUFhO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsV0FDUyxNQUFNLE1BQU07QUFFakIsb0JBQWM7QUFBQSxRQUNWO0FBQUEsUUFDQSxNQUFNO0FBQUEsTUFBQTtBQUFBLElBRWQ7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsaUJBQWlCLENBQ2IsU0FDQSxVQUM2QjtBQUU3QixRQUFJLFFBQVEsRUFBRSxTQUFTLE9BQU87QUFFMUIsYUFBTyxRQUFRLEVBQUUsS0FBSztBQUFBLElBQzFCO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLGlDQUFpQyxDQUM3QixPQUNBLE9BQ0EsWUFDQSxTQUNBLFdBQ2dCO0FBRWhCLFVBQU0sT0FBTyxJQUFJO0FBQUEsTUFDYixXQUFXLGVBQWUsS0FBSztBQUFBLE1BQy9CO0FBQUEsSUFBQTtBQUdKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxLQUFLO0FBQUEsSUFBQTtBQUdULFNBQUssVUFBVTtBQUNmLFNBQUssU0FBUztBQUNkLFdBQU8sT0FBTztBQUVkLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSx3Q0FBd0MsQ0FDcEMsT0FDQSxPQUNBLFNBQ0EsV0FDZ0I7QUFFaEIsVUFBTSxPQUFPLElBQUk7QUFBQSxNQUNiLFdBQVcsZUFBZSxLQUFLO0FBQUEsTUFDL0I7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0EsS0FBSztBQUFBLElBQUE7QUFHVCxTQUFLLFVBQVU7QUFDZixTQUFLLFNBQVM7QUFDZCxXQUFPLE9BQU87QUFFZCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsbUNBQW1DLENBQy9CLE9BQ0EsaUJBQ0EsU0FDQSxPQUNBLFFBQ0EsaUJBQ087QUFFUCxRQUFJLE9BQU8sTUFBTTtBQUViLFlBQU0sSUFBSSxNQUFNLGdDQUFnQyxPQUFPLEtBQUssTUFBTSxFQUFFLEVBQUU7QUFBQSxJQUMxRTtBQUVBLFVBQU0sYUFBYSxnQkFBZ0I7QUFFbkMsVUFBTSxPQUFPLGFBQWE7QUFBQSxNQUN0QjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSw0QkFBNEIsQ0FDeEIsT0FDQSxpQkFDQSxTQUNBLE9BQ0EsV0FDTztBQUVQLFFBQUksT0FBTyxNQUFNO0FBRWIsWUFBTSxJQUFJLE1BQU0sZ0NBQWdDLE9BQU8sS0FBSyxNQUFNLEVBQUUsRUFBRTtBQUFBLElBQzFFO0FBRUEsVUFBTSxhQUFhLGdCQUFnQjtBQUVuQyxVQUFNLE9BQU8sYUFBYTtBQUFBLE1BQ3RCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixrQkFBYztBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUlKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQUEsRUFFQSxzQ0FBc0MsQ0FDbEMsT0FDQSxZQUNPO0FBRVAsUUFBSSxRQUFRLE1BQU07QUFPZDtBQUFBLElBQ0o7QUFFQSxVQUFNLFVBQVUsUUFBUTtBQUV4QixRQUFJLENBQUMsU0FBUztBQUVWLFlBQU0sSUFBSSxNQUFNLDBCQUEwQjtBQUFBLElBQzlDO0FBRUEsVUFBTSxnQkFBZ0IsUUFBUSxFQUFFO0FBQ2hDLFVBQU0sT0FBTyxRQUFRO0FBQ3JCLFVBQU0sTUFBYyxHQUFHLElBQUksSUFBSSxhQUFhLEdBQUcsZUFBZSxxQkFBcUI7QUFFbkYsVUFBTSxhQUFhLENBQUNKLFFBQWUsYUFBa0I7QUFFakQsYUFBTyxpQkFBaUI7QUFBQSxRQUNwQkE7QUFBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLGVBQVc7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0EsVUFBVTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLG1CQUFtQixDQUNmLE9BQ0EsbUJBQ087QUFFUCxVQUFNLFlBQVksaUJBQWlCO0FBQUEsRUFDdkM7QUFBQSxFQUVBLFlBQVksQ0FDUixPQUNBLHNCQUNpQjtBQUVqQixRQUFJLFVBQTBCLE1BQU0sWUFBWSxTQUFTLGlCQUFpQjtBQUUxRSxRQUFJLFNBQVM7QUFFVCxhQUFPO0FBQUEsSUFDWDtBQUVBLGNBQVUsSUFBSSxjQUFjLGlCQUFpQjtBQUM3QyxVQUFNLFlBQVksU0FBUyxpQkFBaUIsSUFBSTtBQUVoRCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsNkJBQTZCLENBQ3pCLE9BQ0EsYUFDTztBQUVQLFVBQU0sVUFBVSxTQUFTLFFBQVE7QUFFakMsUUFBSSxDQUFDLFNBQVM7QUFDVjtBQUFBLElBQ0o7QUFFQSxVQUFNLGNBQWMsV0FBVztBQUFBLE1BQzNCO0FBQUEsTUFDQSxTQUFTLFFBQVE7QUFBQSxNQUNqQixTQUFTO0FBQUEsSUFBQTtBQUdiLFFBQUksYUFBYSxLQUFLLE1BQU07QUFDeEI7QUFBQSxJQUNKO0FBRUEsVUFBTSxlQUFlLGFBQWE7QUFBQSxNQUM5QjtBQUFBLE1BQ0EsYUFBYTtBQUFBLElBQUE7QUFHakIsaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsZ0NBQWdDLENBQzVCLE9BQ0EsT0FDQSxjQUNBLGlCQUNPO0FBRVAsUUFBSSxDQUFDLE9BQU87QUFFUixZQUFNLElBQUksTUFBTSx1QkFBdUI7QUFBQSxJQUMzQztBQUVBLFFBQUksYUFBYSxNQUFNLE1BQU07QUFFekIsY0FBUSxJQUFJLDZCQUE2QixhQUFhLEtBQUssTUFBTSxFQUFFLEVBQUU7QUFFckU7QUFBQSxJQUNKO0FBRUEsUUFBSSxtQkFBbUI7QUFFdkIsUUFBSSxvQkFBb0IsTUFBTTtBQUUxQjtBQUFBLElBQ0o7QUFFQSxVQUFNLG1CQUFtQixPQUFPO0FBQ2hDLFVBQU0sb0JBQW9CLFlBQVkscUJBQXFCLGdCQUFnQjtBQUUzRSxRQUFJLENBQUNMLFdBQUUsbUJBQW1CLGlCQUFpQixHQUFHO0FBRTFDLFlBQU0sVUFBVSxhQUFhO0FBQUEsUUFDekI7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUdKLFVBQUksUUFBUSxXQUFXLE1BQU07QUFFekIsWUFBSSxDQUFDLGFBQWEsTUFBTTtBQUVwQixnQkFBTSxPQUFPLGFBQWE7QUFBQSxZQUN0QjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQUE7QUFHSix1QkFBYTtBQUFBLFlBQ1Q7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQUE7QUFBQSxRQUVSO0FBRUEscUJBQWE7QUFBQSxVQUNUO0FBQUEsVUFDQSxhQUFhO0FBQUEsUUFBQTtBQUFBLE1BRXJCLE9BQ0s7QUFDRCxjQUFNLE1BQWMsR0FBRyxpQkFBaUIsSUFBSSxlQUFlLG9CQUFvQjtBQUUvRSxjQUFNLGdCQUFnQixhQUFhO0FBQUEsVUFDL0I7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUdKLFlBQUksa0JBQWtCLE1BQU07QUFDeEI7QUFBQSxRQUNKO0FBRUEsWUFBSTtBQUVKLFlBQUksTUFBTSxZQUFZLGdCQUFnQixNQUFNO0FBRXhDLGlCQUFPO0FBQUEsUUFDWCxPQUNLO0FBQ0QsaUJBQU87QUFBQSxRQUNYO0FBRUEsY0FBTSxlQUFlLENBQ2pCSyxRQUNBLG9CQUNpQjtBQUVqQixpQkFBTyxnQkFBZ0I7QUFBQSxZQUNuQkE7QUFBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUFBO0FBQUEsUUFFUjtBQUVBLG1CQUFXO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBLFVBQVU7QUFBQSxVQUNWO0FBQUEsVUFDQTtBQUFBLFFBQUE7QUFBQSxNQUVSO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUVBLGtDQUFrQyxDQUM5QixPQUNBLE9BQ0EsaUJBQ087QUFFUCxRQUFJLENBQUMsT0FBTztBQUVSLFlBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUFBLElBQzNDO0FBRUEsUUFBSSxhQUFhLE1BQU0sTUFBTTtBQUV6QixjQUFRLElBQUksNkJBQTZCLGFBQWEsS0FBSyxNQUFNLEVBQUUsRUFBRTtBQUVyRTtBQUFBLElBQ0o7QUFFQSxVQUFNLG1CQUFtQixPQUFPO0FBQ2hDLFVBQU0sb0JBQW9CLFlBQVkscUJBQXFCLGdCQUFnQjtBQUUzRSxRQUFJLENBQUNMLFdBQUUsbUJBQW1CLGlCQUFpQixHQUFHO0FBRTFDLFlBQU0sVUFBVSxhQUFhO0FBQUEsUUFDekI7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUdKLFVBQUksUUFBUSxXQUFXLE1BQU07QUFFekIsWUFBSSxDQUFDLGFBQWEsTUFBTTtBQUVwQix1QkFBYTtBQUFBLFlBQ1Q7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUFBO0FBQUEsUUFFUjtBQUVBLHFCQUFhO0FBQUEsVUFDVDtBQUFBLFVBQ0EsYUFBYTtBQUFBLFFBQUE7QUFHakIscUJBQWE7QUFBQSxVQUNUO0FBQUEsVUFDQSxhQUFhO0FBQUEsUUFBQTtBQUFBLE1BRXJCLE9BQ0s7QUFDRCxjQUFNLE1BQWMsR0FBRyxpQkFBaUIsSUFBSSxlQUFlLG9CQUFvQjtBQUUvRSxjQUFNLGdCQUFnQixhQUFhO0FBQUEsVUFDL0I7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUdKLFlBQUksa0JBQWtCLE1BQU07QUFDeEI7QUFBQSxRQUNKO0FBRUEsWUFBSTtBQUVKLFlBQUksTUFBTSxZQUFZLGdCQUFnQixNQUFNO0FBRXhDLGlCQUFPO0FBQUEsUUFDWCxPQUNLO0FBQ0QsaUJBQU87QUFBQSxRQUNYO0FBRUEsY0FBTSxlQUFlLENBQ2pCSyxRQUNBLG9CQUNpQjtBQUVqQixpQkFBTyxnQkFBZ0I7QUFBQSxZQUNuQkE7QUFBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQUE7QUFBQSxRQUVSO0FBRUEsbUJBQVc7QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1Y7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUFBLE1BRVI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBRUEsdUJBQXVCLENBQ25CLE9BQ0EsWUFDQSxTQUNBLFdBQ2lCO0FBRWpCLFlBQVEsSUFBSSxXQUFXO0FBRXZCLFFBQUksV0FBVyxLQUNSLE1BQU0sUUFBUSxXQUFXLENBQUMsTUFBTSxRQUNoQyxXQUFXLEVBQUUsU0FBUyxHQUMzQjtBQUNFO0FBQUEsUUFDSTtBQUFBLFFBQ0EsV0FBVztBQUFBLE1BQUE7QUFBQSxJQUVuQjtBQUVBLFFBQUksV0FBVyxHQUFHO0FBRWQsY0FBUSxJQUFJLFdBQVc7QUFBQSxJQUMzQjtBQUVBLFlBQVEsSUFBSTtBQUFBLE1BQ1I7QUFBQSxNQUNBLFdBQVc7QUFBQSxNQUNYO0FBQUEsSUFBQTtBQUdKLFlBQVEsU0FBUztBQUNqQixZQUFRLEVBQUUsU0FBUztBQUNuQixZQUFRLEtBQUssV0FBVztBQUV4QixXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsaUNBQWlDLENBQzdCLE9BQ0EsU0FDQSxXQUNPO0FBRVA7QUFBQSxNQUNJO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUjtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQ0o7QUN2ckJBLE1BQU0sY0FBYyxDQUNoQixPQUNBLFlBQ0EsY0FDQSxRQUNBLGVBQTZGO0FBRTdGLE1BQUksQ0FBQyxPQUFPO0FBQ1I7QUFBQSxFQUNKO0FBRUEsUUFBTSxTQUFpQkwsV0FBRSxhQUFBO0FBRXpCLE1BQUksVUFBVSxnQkFBZ0I7QUFBQSxJQUMxQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFFBQU0sTUFBYyxHQUFHLFlBQVk7QUFFbkMsU0FBTyxtQkFBbUI7QUFBQSxJQUN0QjtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1gsU0FBUztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1I7QUFBQSxJQUFBO0FBQUEsSUFFSixVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixPQUFPLENBQUNLLFFBQWUsaUJBQXNCO0FBRXpDLGNBQVEsSUFBSTtBQUFBLDRFQUNvRCxZQUFZLFNBQVMsVUFBVTtBQUFBLHlCQUNsRixHQUFHO0FBQUEsbUNBQ08sS0FBSyxVQUFVLFlBQVksQ0FBQztBQUFBLDJCQUNwQyxLQUFLLFVBQVUsYUFBYSxLQUFLLENBQUM7QUFBQSw0QkFDakMsV0FBVztBQUFBLDJCQUNaLE1BQU07QUFBQSxjQUNuQjtBQUVGLFlBQU07QUFBQSw0RUFDMEQsWUFBWSxTQUFTLFVBQVU7QUFBQSx5QkFDbEYsR0FBRztBQUFBLG1DQUNPLEtBQUssVUFBVSxZQUFZLENBQUM7QUFBQSwyQkFDcEMsS0FBSyxVQUFVLGFBQWEsS0FBSyxDQUFDO0FBQUEsNEJBQ2pDLFlBQVksSUFBSTtBQUFBLDJCQUNqQixNQUFNO0FBQUEsY0FDbkI7QUFFRixhQUFPLFdBQVcsV0FBV0EsTUFBSztBQUFBLElBQ3RDO0FBQUEsRUFBQSxDQUNIO0FBQ0w7QUFFQSxNQUFNLG1CQUFtQjtBQUFBLEVBRXJCLGFBQWEsQ0FDVCxPQUNBLFFBQ0EsaUJBQzZCO0FBRTdCLFVBQU0sYUFBdUQsQ0FBQ0EsUUFBZSxhQUFrQjtBQUUzRixZQUFNLFdBQVcsaUJBQWlCO0FBQUEsUUFDOUJBO0FBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUdKLGVBQVMsWUFBWSxhQUFhO0FBRWxDLGFBQU87QUFBQSxJQUNYO0FBRUEsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBLE9BQU87QUFBQSxNQUNQO0FBQUEsTUFDQSxXQUFXO0FBQUEsTUFDWDtBQUFBLElBQUE7QUFBQSxFQUVSO0FBQ0o7QUNoRkEsTUFBTSxrQkFBa0IsQ0FDcEIsT0FDQSxXQUNpQjtBQUVqQixRQUFNLFVBQVU7QUFDaEIsU0FBTyxVQUFVLE9BQU8sYUFBYTtBQUNyQyxRQUFNLGVBQWUsR0FBRyxPQUFPLFNBQVMsU0FBUyxJQUFJLElBQUksT0FBTyxFQUFFLEdBQUcsZUFBZSxxQkFBcUI7QUFFekcsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLE1BQ2I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFBQSxFQUNKO0FBRVI7QUFFQSxNQUFNLDJCQUEyQixDQUM3QixPQUNBLFNBQ0EsYUFDQSxhQUNpQjtBQUVqQixNQUFJLFVBQVU7QUFFVixRQUFJLFlBQVksTUFBTSxTQUFTLElBQUk7QUFFL0IsWUFBTSxJQUFJLE1BQU0sc0RBQXNEO0FBQUEsSUFDMUU7QUFFQSxRQUFJLFlBQVksU0FBUyxZQUFZLE1BQU07QUFFdkM7QUFBQSxRQUNJO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsV0FDUyxZQUFZLFNBQVMsWUFBWSxNQUFNO0FBRTVDO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSLFdBQ1MsWUFBWSxZQUFZLFFBQzFCLFlBQVksV0FBVyxNQUFNO0FBRWhDO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsV0FDUyxZQUFZLFdBQVcsTUFBTTtBQUVsQztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixXQUNTLFlBQVksU0FBUyxZQUFZLE1BQU07QUFFNUM7QUFBQSxRQUNJO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsT0FDSztBQUNELFlBQU0sSUFBSSxNQUFNLDJCQUEyQjtBQUFBLElBQy9DO0FBQUEsRUFDSjtBQUVBLFNBQU8sV0FBVyxXQUFXLEtBQUs7QUFDdEM7QUFFQSxNQUFNLDZCQUE2QixDQUMvQixTQUNBLGFBQ0EsYUFDTztBQUVQLE1BQUksQ0FBQyxRQUFRLGdCQUFnQjtBQUV6QixVQUFNLElBQUksTUFBTSxpQ0FBaUM7QUFBQSxFQUNyRDtBQUVBLE1BQUksWUFBWSxNQUFNLFNBQVMsSUFBSTtBQUUvQixVQUFNLElBQUksTUFBTSxrREFBa0Q7QUFBQSxFQUN0RTtBQUNKO0FBRUEsTUFBTSxxQkFBcUIsQ0FDdkIsU0FDQSxhQUNBLGFBQ087QUFFUCxNQUFJLENBQUMsUUFBUSxnQkFBZ0I7QUFFekIsVUFBTSxJQUFJLE1BQU0saUNBQWlDO0FBQUEsRUFDckQ7QUFFQSxNQUFJLENBQUNMLFdBQUUsbUJBQW1CLFNBQVMsSUFBSSxHQUFHO0FBRXRDLFVBQU0sSUFBSSxNQUFNLG1EQUFtRDtBQUFBLEVBQ3ZFLFdBQ1MsQ0FBQ0EsV0FBRSxtQkFBbUIsU0FBUyxRQUFRLEdBQUc7QUFFL0MsVUFBTSxJQUFJLE1BQU0sbURBQW1EO0FBQUEsRUFDdkU7QUFFQSxNQUFJLFlBQVksTUFBTSxTQUFTLElBQUk7QUFFL0IsVUFBTSxJQUFJLE1BQU0sa0RBQWtEO0FBQUEsRUFDdEU7QUFDSjtBQUVBLE1BQU0sMEJBQTBCLENBQzVCLFNBQ0EsYUFDTztBQUVQLE1BQUksQ0FBQyxRQUFRLGdCQUFnQjtBQUV6QixVQUFNLElBQUksTUFBTSxpQ0FBaUM7QUFBQSxFQUNyRDtBQUVBLE1BQUksQ0FBQ0EsV0FBRSxtQkFBbUIsU0FBUyxJQUFJLEdBQUc7QUFFdEMsVUFBTSxJQUFJLE1BQU0sbURBQW1EO0FBQUEsRUFDdkUsV0FDUyxDQUFDQSxXQUFFLG1CQUFtQixTQUFTLFFBQVEsR0FBRztBQUUvQyxVQUFNLElBQUksTUFBTSxtREFBbUQ7QUFBQSxFQUN2RTtBQUNKO0FBRUEsTUFBTSxxQkFBcUIsQ0FDdkIsU0FDQSxhQUNBLGFBQ087QUFFUCxNQUFJLENBQUMsUUFBUSxnQkFBZ0I7QUFFekIsVUFBTSxJQUFJLE1BQU0saUNBQWlDO0FBQUEsRUFDckQ7QUFFQSxNQUFJLENBQUMsUUFBUSxtQkFBbUI7QUFFNUIsVUFBTSxJQUFJLE1BQU0scUNBQXFDO0FBQUEsRUFDekQ7QUFFQSxNQUFJQSxXQUFFLG1CQUFtQixTQUFTLE9BQU8sTUFBTSxNQUFNO0FBRWpELFVBQU0sSUFBSSxNQUFNLDhDQUE4QztBQUFBLEVBQ2xFLFdBQ1MsUUFBUSxJQUFJLFNBQVMsWUFBWSxNQUFNO0FBRTVDLFVBQU0sSUFBSSxNQUFNLG1EQUFtRDtBQUFBLEVBQ3ZFO0FBRUEsTUFBSSxZQUFZLE1BQU0sU0FBUyxJQUFJO0FBRS9CLFVBQU0sSUFBSSxNQUFNLGtEQUFrRDtBQUFBLEVBQ3RFO0FBQ0o7QUFFQSxNQUFNLG1CQUFtQixDQUNyQixPQUNBLFNBQ0EsYUFDTztBQUVQO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osZ0JBQWM7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSjtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sZUFBZSxDQUNqQixPQUNBLFNBQ0EsYUFDTztBQUVQLFFBQU0sWUFBWSxRQUFRO0FBRTFCLE1BQUksQ0FBQyxXQUFXO0FBRVosVUFBTSxJQUFJLE1BQU0sMENBQTBDO0FBQUEsRUFDOUQ7QUFFQSxRQUFNLFVBQVUsUUFBUTtBQUV4QixNQUFJLENBQUMsU0FBUztBQUVWLFVBQU0sSUFBSSxNQUFNLHVDQUF1QztBQUFBLEVBQzNEO0FBRUEsTUFBSSxTQUFpQyxXQUFXO0FBQUEsSUFDNUM7QUFBQSxJQUNBLFVBQVU7QUFBQSxJQUNWLFFBQVEsTUFBTTtBQUFBLEVBQUE7QUFHbEIsTUFBSSxRQUFRLE1BQU07QUFFZCxRQUFJLE9BQU8sT0FBTyxTQUFTLElBQUk7QUFFM0IsWUFBTSxJQUFJLE1BQU0sa0NBQWtDO0FBQUEsSUFDdEQ7QUFFQSxXQUFPLEtBQUssT0FBTztBQUFBLEVBQ3ZCLE9BQ0s7QUFFRCxVQUFNLElBQUksTUFBTSx5QkFBeUI7QUFBQSxFQUM3QztBQUVBLFVBQVEsVUFBVTtBQUN0QjtBQUVBLE1BQU0sY0FBYyxDQUNoQixPQUNBLFNBQ0EsYUFDQSxhQUNPO0FBRVA7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osZ0JBQWM7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSjtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxjQUFjLENBQ2hCLE9BQ0EsU0FDQSxhQUNBLGFBQ087QUFFUDtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSjtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFdBQVMsT0FBTztBQUNoQixXQUFTLFdBQVc7QUFFcEIsTUFBSSxTQUFTLFNBQVMsU0FBUyxHQUFHO0FBRTlCLGtCQUFjLGlCQUFpQixLQUFLO0FBQ3BDLGFBQVMsR0FBRywwQkFBMEI7QUFDdEMsVUFBTSxZQUFZLEdBQUcsa0JBQWtCO0FBQUEsRUFDM0M7QUFDSjtBQUVBLE1BQU0sY0FBYyxDQUNoQixPQUNBLFNBQ0EsYUFDQSxhQUNPO0FBRVAsTUFBSSxZQUFZLE1BQU0sU0FBUyxJQUFJO0FBRS9CLFVBQU0sSUFBSSxNQUFNLGtEQUFrRDtBQUFBLEVBQ3RFO0FBRUEsUUFBTSxVQUFVLFNBQVMsUUFBUTtBQUVqQyxNQUFJLENBQUMsU0FBUztBQUNWO0FBQUEsRUFDSjtBQUVBLE1BQUksYUFBYSxLQUFLLE1BQU07QUFFeEIsVUFBTSxJQUFJLE1BQUE7QUFBQSxFQUNkO0FBRUEsTUFBSSxZQUFZLFdBQVcsUUFDcEIsWUFBWSxZQUFZLE1BQzdCO0FBQ0U7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUVBLFFBQU0sZUFBZSxhQUFhO0FBQUEsSUFDOUI7QUFBQSxJQUNBLGFBQWE7QUFBQSxFQUFBO0FBR2pCLGVBQWE7QUFBQSxJQUNUO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUFBO0FBRWhCO0FBRUEsTUFBTSxjQUFjLENBQ2hCLE9BQ0EsU0FDQSxhQUNBLGlCQUNPO0FBRVA7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osUUFBTSxVQUF5QixhQUFhO0FBQzVDLFFBQU0sZ0JBQWdCLFFBQVE7QUFFOUIsTUFBSSxDQUFDLGVBQWU7QUFFaEIsVUFBTSxJQUFJLE1BQU0sOEJBQThCO0FBQUEsRUFDbEQ7QUFFQSxRQUFNLFdBQVcsYUFBYTtBQUU5QixhQUFXLFVBQVUsY0FBYyxTQUFTO0FBRXhDLFFBQUksT0FBTyxhQUFhLFVBQVU7QUFFOUIsbUJBQWE7QUFBQSxRQUNUO0FBQUEsUUFDQSxRQUFRO0FBQUEsUUFDUixPQUFPO0FBQUEsTUFBQTtBQUdYLG9CQUFjO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUFBLEVBQ0o7QUFDSjtBQUVBLE1BQU0sZUFBZSxDQUNqQixPQUNBLFVBQ0EsV0FDeUI7QUFFekIsUUFBTSxtQkFBbUIsT0FBTztBQUVoQyxNQUFJQSxXQUFFLG1CQUFtQixnQkFBZ0IsTUFBTSxNQUFNO0FBRWpELFVBQU0sSUFBSSxNQUFNLDRCQUE0QjtBQUFBLEVBQ2hEO0FBRUEsUUFBTSxpQkFBaUIsY0FBYztBQUFBLElBQ2pDO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVDtBQUFBLElBQ0EsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLEVBQUE7QUFHWCxRQUFNLFVBQVU7QUFFaEIsU0FBTztBQUNYO0FBRUEsTUFBTSxrQkFBa0IsQ0FDcEIsT0FDQSxhQUNPO0FBRVAsTUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLEVBQ0o7QUFFQSxNQUFJLGlCQUF5QztBQUU3QyxNQUFJLGlCQUF5QyxXQUFXO0FBQUEsSUFDcEQ7QUFBQSxJQUNBLFNBQVMsUUFBUTtBQUFBLElBQ2pCLFNBQVM7QUFBQSxFQUFBO0FBR2IsTUFBSSxDQUFDLGdCQUFnQjtBQUNqQjtBQUFBLEVBQ0o7QUFFQSxhQUFXLFVBQVUsZUFBZSxTQUFTO0FBRXpDLFFBQUksT0FBTyxPQUFPLFNBQVMsSUFBSTtBQUUzQix1QkFBaUI7QUFFakI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUVBLE1BQUksZ0JBQWdCO0FBRWhCLG1CQUFlLEdBQUcsMEJBQTBCO0FBRTVDLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQUVBLE1BQU0sbUJBQW1CO0FBQUEsRUFFckIsbUJBQW1CLENBQ2YsT0FFQSxjQUNpQjtBQW9CakIsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLGdCQUFnQixDQUNaLE9BQ0EsZ0JBQ0EsV0FDaUI7QUFPakIsa0JBQWMsMkJBQTJCLGVBQWUsT0FBTztBQUMvRCxrQkFBYyxtQkFBbUIsY0FBYztBQUUvQyxrQkFBYztBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQXFCSixXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsY0FBYyxDQUNWLE9BQ0EsVUFDQSxXQUNTO0FBRVQsUUFBSSxDQUFDLFNBQ0VBLFdBQUUsbUJBQW1CLE9BQU8sRUFBRSxHQUNuQztBQUNFLGFBQU87QUFBQSxJQUNYO0FBRUE7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osV0FBTyxXQUFXLFdBQVcsS0FBSztBQUFBLEVBQ3RDO0FBQUEsRUFFQSw0QkFBNEIsQ0FDeEIsT0FDQSxVQUNBLFFBQ0EsYUFBNEIsU0FDWDtBQUVqQixRQUFJLENBQUMsT0FBTztBQUVSLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxPQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFFBQUksTUFBTTtBQUVOLG9CQUFjO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBR0osVUFBSSxZQUFZO0FBRVosYUFBSyxTQUFTO0FBQUEsTUFDbEI7QUFBQSxJQUNKO0FBRUEsUUFBSSxDQUFDLE1BQU0sWUFBWSxhQUFhO0FBRWhDLFlBQU0sWUFBWSxhQUFhO0FBQUEsSUFDbkM7QUFFQSxXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLGdDQUFnQyxDQUM1QixPQUNBLFVBQ0EsWUFDaUI7QUFFakIsUUFBSSxDQUFDLE9BQU87QUFDUixhQUFPO0FBQUEsSUFDWDtBQUVBLFVBQU0sZ0JBQWdCLFFBQVEsU0FBUyxFQUFFO0FBRXpDLFFBQUksQ0FBQyxlQUFlO0FBRWhCLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxpQkFBaUIsY0FBYztBQUFBLE1BQ2pDO0FBQUEsTUFDQSxTQUFTO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFVBQU0sVUFBVTtBQUVoQixRQUFJLGdCQUFnQjtBQUVoQixxQkFBZSxRQUFRLE9BQU87QUFDOUIscUJBQWUsUUFBUSxVQUFVO0FBQUEsSUFDckM7QUFFQSxVQUFNLFlBQVksYUFBYTtBQUUvQixXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFBQSxFQUVBLG1CQUFtQixDQUNmLE9BQ0EsVUFDQSxTQUNBLGdCQUNpQjtBQUVqQixRQUFJLENBQUMsT0FBTztBQUVSLGFBQU87QUFBQSxJQUNYO0FBRUEsVUFBTSxpQkFBaUIsUUFBUTtBQUUvQixRQUFJLENBQUMsZ0JBQWdCO0FBRWpCLFlBQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLElBQzdDO0FBRUEsUUFBSSxtQkFBbUIsWUFBWSxRQUFRO0FBRTNDLFFBQUksWUFBWSxXQUFXLE1BQU07QUFFN0IsVUFBSSxDQUFDLFlBQVksU0FBUztBQUV0QiwyQkFBbUI7QUFBQSxNQUN2QixPQUNLO0FBQ0QsMkJBQW1CO0FBQUEsTUFDdkI7QUFBQSxJQUNKLFdBQ1NBLFdBQUUsbUJBQW1CLGdCQUFnQixNQUFNLE1BQU07QUFFdEQsWUFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQUEsSUFDaEQ7QUFFQSxVQUFNLFNBQWtFLGNBQWM7QUFBQSxNQUNsRjtBQUFBLE1BQ0EsU0FBUztBQUFBLE1BQ1Q7QUFBQSxNQUNBLFlBQVk7QUFBQSxNQUNaO0FBQUEsTUFDQSxRQUFRO0FBQUEsSUFBQTtBQUdaLFVBQU0sV0FBVyxPQUFPO0FBQ3hCLFVBQU0sVUFBVTtBQUVoQixRQUFJLFVBQVU7QUFFVixVQUFJLGlCQUF5QyxXQUFXO0FBQUEsUUFDcEQ7QUFBQSxRQUNBLGVBQWU7QUFBQSxRQUNmO0FBQUEsTUFBQTtBQUdKLHFCQUFlLFVBQVU7QUFFekIsVUFBSSxnQkFBZ0I7QUFFaEIsWUFBSSxlQUFlLE9BQU8sU0FBUyxJQUFJO0FBRW5DLGdCQUFNLElBQUksTUFBTSwwQ0FBMEM7QUFBQSxRQUM5RDtBQUVBLHVCQUFlLFdBQVc7QUFDMUIsaUJBQVMsR0FBRyxlQUFlLGVBQWUsR0FBRyxlQUFlO0FBQUEsTUFDaEU7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDOXNCQSxNQUFNLG9CQUFvQjtBQUFBLEVBRXRCLGlCQUFpQixDQUNiLE9BQ0EsU0FDTztBQUVQLFFBQUksQ0FBQyxPQUFPLGNBQWM7QUFDdEI7QUFBQSxJQUNKO0FBRUEsV0FBTyxhQUFhO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ0RBLE1BQU0sbUJBQW1CLENBQ3JCLFNBQ0EsZ0JBQ0EsaUJBQ2dCO0FBRWhCLE1BQUksUUFBUSxlQUFlLFlBQVk7QUFFdkMsTUFBSSxPQUFPO0FBRVAsV0FBTztBQUFBLEVBQ1g7QUFFQSxRQUFNLGVBQWUsUUFBUSxTQUFTLEtBQUssWUFBWTtBQUV2RCxNQUFJLGNBQWM7QUFFZCxtQkFBZSxZQUFZLElBQUk7QUFBQSxFQUNuQztBQUVBO0FBQUEsSUFDSTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFNBQU8sZUFBZSxZQUFZLEtBQUs7QUFDM0M7QUFFQSxNQUFNLDJCQUEyQixDQUM3QixTQUNBLGdCQUNBLGlCQUNPO0FBRVAsUUFBTSxRQUFRO0FBQ2QsUUFBTSxTQUFTLE1BQU0sUUFBUTtBQUU3QixNQUFJLENBQUMsUUFBUTtBQUNUO0FBQUEsRUFDSjtBQUVBLFFBQU0sY0FBYyxPQUFPLFNBQVMsS0FBSyxZQUFZO0FBRXJELE1BQUksYUFBYTtBQUViLG1CQUFlLFlBQVksSUFBSTtBQUFBLEVBQ25DO0FBRUE7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBRVI7QUFFQSxNQUFNLG9CQUFvQixDQUFDLGFBQW9DO0FBRTNELFFBQU0sUUFBUSxTQUFTO0FBQ3ZCLFFBQU0scUJBQXFCO0FBQzNCLFFBQU0sVUFBVSxNQUFNLFNBQVMsa0JBQWtCO0FBQ2pELE1BQUk7QUFDSixNQUFJLGlCQUFzQixDQUFBO0FBQzFCLE1BQUksU0FBUztBQUNiLE1BQUksU0FBUztBQUViLGFBQVcsU0FBUyxTQUFTO0FBRXpCLFFBQUksU0FDRyxNQUFNLFVBRU4sTUFBTSxTQUFTLE1BQ3BCO0FBQ0UscUJBQWUsTUFBTSxPQUFPO0FBRTVCLFlBQU0sZ0JBQWdCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1Q7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUdKLFVBQUksQ0FBQyxlQUFlO0FBRWhCLGNBQU0sSUFBSSxNQUFNLGFBQWEsWUFBWSxxQkFBcUI7QUFBQSxNQUNsRTtBQUVBLGVBQVMsU0FDTCxNQUFNLFVBQVUsUUFBUSxNQUFNLEtBQUssSUFDbkM7QUFFSixlQUFTLE1BQU0sUUFBUSxNQUFNLENBQUMsRUFBRTtBQUFBLElBQ3BDO0FBQUEsRUFDSjtBQUVBLFdBQVMsU0FDTCxNQUFNLFVBQVUsUUFBUSxNQUFNLE1BQU07QUFFeEMsV0FBUyxRQUFRO0FBQ3JCO0FBRUEsTUFBTSxxQkFBcUIsQ0FDdkIsUUFDQSxhQUNPO0FBRVAsYUFBVyxVQUFVLE9BQU8sU0FBUztBQUVqQyxRQUFJLE9BQU8sT0FBTyxTQUFTLElBQUk7QUFFM0IsMEJBQW9CLE1BQU07QUFBQSxJQUM5QjtBQUFBLEVBQ0o7QUFDSjtBQUVBLE1BQU0sc0JBQXNCLENBQUMsYUFBdUQ7QUFFaEYsTUFBSSxDQUFDLFVBQVU7QUFDWDtBQUFBLEVBQ0o7QUFFQSxzQkFBb0IsU0FBUyxNQUFNLElBQUk7QUFFdkMsYUFBVyxVQUFVLFNBQVMsU0FBUztBQUVuQyx3QkFBb0IsTUFBTTtBQUFBLEVBQzlCO0FBRUEsV0FBUyxXQUFXO0FBRXBCLE1BQUksU0FBUyxNQUFNLE1BQU07QUFFckIsYUFBUyxLQUFLLEtBQUssV0FBVztBQUFBLEVBQ2xDO0FBQ0o7QUFFQSxNQUFNLGFBQWEsQ0FDZixPQUNBLFdBQ0EsYUFDQSxTQUNBLGtCQUNBLGlCQUNrQjtBQUVsQixRQUFNLFNBQVMsSUFBSTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixTQUFPLFNBQVMsVUFBVSxVQUFVO0FBQ3BDLFNBQU8sY0FBYyxVQUFVLGdCQUFnQjtBQUMvQyxTQUFPLFFBQVEsVUFBVSxTQUFTO0FBQ2xDLFNBQU8sV0FBVyxVQUFVLFlBQVk7QUFFeEMsTUFBSSxhQUFhO0FBRWIsZUFBVyxpQkFBaUIsWUFBWSxHQUFHO0FBRXZDLFVBQUksY0FBYyxNQUFNLE9BQU8sSUFBSTtBQUUvQixtQkFBVztBQUFBLFVBQ1A7QUFBQSxVQUNBLFFBQVE7QUFBQSxVQUNSO0FBQUEsUUFBQTtBQUdKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRUEsYUFBVztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLFNBQU87QUFDWDtBQUVBLE1BQU0sd0JBQXdCLENBQzFCLE9BQ0EsTUFDQSxlQUNPO0FBRVAsUUFBTSxVQUF5QixLQUFLO0FBQ3BDLFFBQU0sU0FBUyxRQUFRO0FBRXZCLE1BQUksQ0FBQyxRQUFRO0FBRVQsVUFBTSxJQUFJLE1BQU0sOEJBQThCO0FBQUEsRUFDbEQ7QUFFQSxRQUFNLFdBQVcsS0FBSztBQUV0QixhQUFXLFVBQVUsT0FBTyxTQUFTO0FBRWpDLFFBQUksT0FBTyxhQUFhLFVBQVU7QUFFOUIsYUFBTztBQUFBLFFBQ0g7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBQUEsRUFDSjtBQUNKO0FBRUEsTUFBTSw2QkFBNkIsQ0FDL0IsT0FDQSxRQUNBLGFBQTRCLFNBQ3JCO0FBRVAsTUFBSSxDQUFDLFVBQ0UsQ0FBQyxPQUFPLFNBQVMsU0FBUyxNQUMvQjtBQUNFO0FBQUEsRUFDSjtBQUVBLGdCQUFjO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBT0osU0FBTyxjQUFjO0FBQUEsSUFDakI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sNEJBQTRCLENBQzlCLE9BQ0EsWUFDTztBQUVQLFFBQU0sa0JBQWtCLGFBQWE7QUFBQSxJQUNqQztBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osTUFBSSxDQUFDLGlCQUFpQjtBQUNsQjtBQUFBLEVBQ0o7QUFFQSxRQUFNLG9CQUFvQixRQUFRLGdCQUFnQixTQUFTO0FBQzNELFFBQU0sTUFBTSxHQUFHLGlCQUFpQixJQUFJLGdCQUFnQixDQUFDLEdBQUcsZUFBZSxxQkFBcUI7QUFFNUYsUUFBTSxlQUFlLENBQ2pCSyxRQUNBLG9CQUNpQjtBQUVqQixXQUFPLGlCQUFpQjtBQUFBLE1BQ3BCQTtBQUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUVBLGFBQVc7QUFBQSxJQUNQO0FBQUEsSUFDQTtBQUFBLElBQ0EsVUFBVTtBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxnQkFBZ0I7QUFBQSxFQUVsQix1QkFBdUIsQ0FDbkIsT0FDQSxZQUNPO0FBRVAsUUFBSSxRQUFRLGFBQWEsU0FBUyxHQUFHO0FBRWpDO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixPQUNLO0FBQ0QsbUJBQWE7QUFBQSxRQUNUO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBQUEsRUFDSjtBQUFBLEVBRUEsV0FBVyxDQUNQLFVBQ0EsYUFDVTtBQUVWLGVBQVcsVUFBVSxTQUFTLFNBQVM7QUFFbkMsVUFBSSxPQUFPLE9BQU8sVUFBVTtBQUV4QixlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsZUFBZSxDQUFDLGFBQW9DO0FBRWhELFFBQUksQ0FBQyxTQUFTLFVBQVUsSUFBSTtBQUN4QjtBQUFBLElBQ0o7QUFFQSxRQUFJLENBQUMsY0FBYyxVQUFVLFVBQVUsU0FBUyxVQUFVLEVBQUUsR0FBRztBQUUzRCxZQUFNLElBQUksTUFBTSx3REFBd0Q7QUFBQSxJQUM1RTtBQUFBLEVBQ0o7QUFBQSxFQUVBLDRCQUE0QixDQUFDLGlCQUF3QztBQUVqRSxVQUFNLFNBQVUsYUFBK0I7QUFFL0MsUUFBSSxDQUFDLFFBQVE7QUFDVDtBQUFBLElBQ0o7QUFFQSxrQkFBYyxnQ0FBZ0MsTUFBTTtBQUNwRCxrQkFBYywyQkFBMkIsT0FBTyxPQUF3QjtBQUFBLEVBQzVFO0FBQUEsRUFFQSxpQ0FBaUMsQ0FBQyxhQUF1RDtBQUVyRixRQUFJLENBQUMsVUFBVTtBQUNYO0FBQUEsSUFDSjtBQUVBLGtCQUFjLG1CQUFtQixTQUFTLFFBQVE7QUFDbEQsYUFBUyxXQUFXO0FBQUEsRUFDeEI7QUFBQSxFQUVBLG9CQUFvQixDQUFDLGFBQXVEO0FBRXhFLFFBQUksQ0FBQyxVQUFVO0FBQ1g7QUFBQSxJQUNKO0FBRUEsa0JBQWMsbUJBQW1CLFNBQVMsTUFBTSxJQUFJO0FBQ3BELGtCQUFjLG1CQUFtQixTQUFTLFFBQVE7QUFFbEQsYUFBUyxXQUFXO0FBQ3BCLGFBQVMsT0FBTztBQUFBLEVBQ3BCO0FBQUEsRUFFQSx1Q0FBdUMsQ0FDbkMsT0FDQSxRQUNBLGFBQTRCLFNBQ3JCO0FBT1AsVUFBTSxVQUFVO0FBQ2hCLFdBQU8sVUFBVSxPQUFPLGFBQWE7QUFFckMsa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixVQUFNLE1BQU0sR0FBRyxPQUFPLFNBQVMsU0FBUyxJQUFJLElBQUksT0FBTyxFQUFFLEdBQUcsZUFBZSxxQkFBcUI7QUFFaEcsVUFBTSxhQUErRCxDQUFDQSxRQUFlLGFBQWtCO0FBRW5HLGFBQU8saUJBQWlCO0FBQUEsUUFDcEJBO0FBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBRUEsZUFBVztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQSxVQUFVO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsNEJBQTRCLENBQ3hCLE9BQ0EsV0FDTztBQUVQLFVBQU0sVUFBVSxPQUFPLFFBQVE7QUFFL0IsUUFBSSxDQUFDLFNBQVM7QUFDVjtBQUFBLElBQ0o7QUFFQSxVQUFNLGNBQWMsV0FBVztBQUFBLE1BQzNCO0FBQUEsTUFDQSxPQUFPLFFBQVE7QUFBQSxNQUNmLE9BQU87QUFBQSxJQUFBO0FBR1gsUUFBSSxhQUFhLEtBQUssUUFDZixNQUFNLFlBQVksZ0JBQWdCLE1BQ3ZDO0FBQ0U7QUFBQSxJQUNKO0FBRUEsVUFBTSxlQUFlLGFBQWE7QUFBQSxNQUM5QjtBQUFBLE1BQ0EsYUFBYTtBQUFBLElBQUE7QUFHakIsaUJBQWE7QUFBQSxNQUNUO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsa0JBQWtCLENBQUMsZUFBK0I7QUFFOUMsV0FBTyxjQUFjLFVBQVU7QUFBQSxFQUNuQztBQUFBLEVBRUEsc0JBQXNCLENBQUMsZUFBK0I7QUFFbEQsV0FBTyxjQUFjLFVBQVU7QUFBQSxFQUNuQztBQUFBLEVBRUEseUJBQXlCLENBQ3JCLE9BQ0EsV0FDTztBQUVQLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixpQkFBYSx3QkFBd0IsS0FBSztBQUFBLEVBQzlDO0FBQUEsRUFFQSxzQkFBc0IsQ0FDbEIsT0FDQSxVQUNBLGtCQUNBLGVBQ0EsWUFDeUI7QUFFekIsVUFBTSxTQUFrRSxjQUFjO0FBQUEsTUFDbEY7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFVBQU0sV0FBVyxPQUFPO0FBRXhCLFFBQUksT0FBTyxvQkFBb0IsTUFBTTtBQUVqQyxvQkFBYztBQUFBLFFBQ1Y7QUFBQSxRQUNBLE9BQU87QUFBQSxNQUFBO0FBR1gsVUFBSSxDQUFDLFNBQVMsTUFBTTtBQUVoQixxQkFBYTtBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsUUFBQTtBQUFBLE1BRVI7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVBLDBCQUEwQixDQUN0QixPQUNBLFVBQ0Esa0JBQ0EsZUFDQSxTQUNBLGVBQThCLFNBQzRCO0FBRTFELFFBQUksQ0FBQyxRQUFRLFNBQVM7QUFFbEIsWUFBTSxJQUFJLE1BQU0saUNBQWlDO0FBQUEsSUFDckQ7QUFFQSxVQUFNLGNBQWMsY0FBYyxjQUFjLFFBQVE7QUFFeEQsUUFBSSxDQUFDLGFBQWE7QUFFZCxZQUFNLElBQUksTUFBTSx1QkFBdUI7QUFBQSxJQUMzQztBQUVBLFFBQUksa0JBQWtCLFlBQVksSUFBSTtBQUVsQyxZQUFNLElBQUksTUFBTSxxREFBcUQ7QUFBQSxJQUN6RTtBQUVBLFFBQUksV0FBbUMsV0FBVztBQUFBLE1BQzlDO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUjtBQUFBLElBQUE7QUFHSixRQUFJLENBQUMsVUFBVTtBQUVYLGlCQUFXLElBQUk7QUFBQSxRQUNYLFlBQVk7QUFBQSxRQUNaO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLFFBQUksa0JBQWtCO0FBSWxCLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLGVBQVc7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixzQkFBa0I7QUFHdEIsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLDZCQUE2QixDQUN6QixPQUNBLGFBQ087QUFFUCxVQUFNLHdCQUF3QixjQUFjLDJCQUEyQixTQUFTLE9BQU87QUFFdkYsUUFBSSxzQkFBc0IsUUFBUSxXQUFXLEtBQ3RDLHNCQUFzQixRQUFRLENBQUMsRUFBRSxXQUFXLE1BQzVDTCxXQUFFLG1CQUFtQixTQUFTLElBQUksS0FDbENBLFdBQUUsbUJBQW1CLFNBQVMsT0FBTyxHQUMxQztBQUNFLFlBQU0sY0FBYyxXQUFXO0FBQUEsUUFDM0I7QUFBQSxRQUNBLFNBQVMsUUFBUTtBQUFBLFFBQ2pCLFNBQVM7QUFBQSxNQUFBO0FBR2IsVUFBSSxhQUFhLEtBQUssTUFBTTtBQUN4QjtBQUFBLE1BQ0o7QUFFQSxhQUFPO0FBQUEsUUFDSDtBQUFBLFFBQ0EsU0FBUyxRQUFRLENBQUM7QUFBQSxNQUFBO0FBQUEsSUFFMUIsV0FDUyxDQUFDQSxXQUFFLG1CQUFtQixTQUFTLE9BQU8sR0FBRztBQUc5QztBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsUUFDQSxTQUFTO0FBQUEsTUFBQTtBQUFBLElBRWpCO0FBQUEsRUFDSjtBQUFBLEVBRUEsa0JBQWtCLENBQ2QsT0FDQSxtQkFDTztBQUVQLFFBQUksQ0FBQyxnQkFBZ0I7QUFDakI7QUFBQSxJQUNKO0FBRUEsVUFBTSxlQUFlLGVBQWU7QUFFcEMsUUFBSSxDQUFDLGNBQWM7QUFDZjtBQUFBLElBQ0o7QUFFQSxlQUFXO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osbUJBQWUsVUFBVSxlQUFlO0FBRXhDLGVBQVcsVUFBVSxhQUFhLFNBQVM7QUFFdkMsaUJBQVc7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBQUEsRUFDSjtBQUFBLEVBRUEsb0JBQW9CLENBQUMsVUFBMkI7QUFFNUMsUUFBSSxVQUFVO0FBRWQsUUFBSSxDQUFDQSxXQUFFLG1CQUFtQixPQUFPLEdBQUc7QUFFaEMsVUFBSSxRQUFRLFNBQVMsSUFBSTtBQUVyQixrQkFBVSxRQUFRLFVBQVUsR0FBRyxFQUFFO0FBQ2pDLGtCQUFVLFFBQVEsUUFBUSxPQUFPLEVBQUU7QUFBQSxNQUN2QztBQUFBLElBQ0o7QUFFQSxRQUFJLFFBQVEsV0FBVyxLQUFLLE1BQU0sUUFDM0IsUUFBUSxDQUFDLE1BQU0sS0FBSztBQUV2QixhQUFPO0FBQUEsSUFDWDtBQUVBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFQSwrQkFBK0IsQ0FDM0IsT0FDQSxhQUNBLFNBQ087QUFFUCxRQUFJLENBQUMsYUFBYTtBQUNkO0FBQUEsSUFDSjtBQUVBLGtCQUFjO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLGNBQWMsQ0FDVixPQUNBLGFBQ0EsYUFDTztBQUVQLGFBQVMsaUJBQWlCLFlBQVksa0JBQWtCO0FBQ3hELGFBQVMsY0FBYyxZQUFZLGVBQWU7QUFDbEQsYUFBUyxVQUFVLFlBQVksV0FBVztBQUMxQyxhQUFTLFlBQVksWUFBWSxhQUFhO0FBQzlDLGFBQVMsT0FBTyxZQUFZLFFBQVE7QUFDcEMsYUFBUyxVQUFVLFlBQVksV0FBVztBQUMxQyxhQUFTLFdBQVcsWUFBWSxZQUFZO0FBQzVDLGFBQVMsUUFBUSxZQUFZLFNBQVM7QUFDdEMsYUFBUyxRQUFRLFNBQVMsTUFBTSxLQUFBO0FBRWhDLGFBQVMsR0FBRyxhQUFhO0FBRXpCO0FBQUEsTUFDSTtBQUFBLElBQUE7QUFHSixVQUFNLGNBQWMsV0FBVztBQUFBLE1BQzNCO0FBQUEsTUFDQSxTQUFTLFFBQVE7QUFBQSxNQUNqQixTQUFTO0FBQUEsSUFBQTtBQUdiLGFBQVMsbUJBQW1CLGFBQWEsUUFBUSxLQUFLO0FBRXRELFFBQUk7QUFFSixRQUFJLFlBQVksV0FDVCxNQUFNLFFBQVEsWUFBWSxPQUFPLEdBQ3RDO0FBQ0UsaUJBQVcsYUFBYSxZQUFZLFNBQVM7QUFFekMsaUJBQVMsU0FBUyxRQUFRLEtBQUssT0FBSyxFQUFFLE9BQU8sVUFBVSxFQUFFO0FBRXpELFlBQUksQ0FBQyxRQUFRO0FBRVQsbUJBQVM7QUFBQSxZQUNMO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxVQUFBO0FBR2IsbUJBQVMsUUFBUSxLQUFLLE1BQU07QUFBQSxRQUNoQyxPQUNLO0FBQ0QsaUJBQU8sU0FBUyxVQUFVLFVBQVU7QUFDcEMsaUJBQU8sY0FBYyxVQUFVLGdCQUFnQjtBQUMvQyxpQkFBTyxRQUFRLFVBQVUsU0FBUztBQUNsQyxpQkFBTyxXQUFXLFVBQVUsWUFBWTtBQUN4QyxpQkFBTyxVQUFVLFNBQVM7QUFDMUIsaUJBQU8sbUJBQW1CLFNBQVM7QUFDbkMsaUJBQU8sZUFBZSxTQUFTO0FBQUEsUUFDbkM7QUFHQSxlQUFPLEdBQUcsYUFBYTtBQUFBLE1BQzNCO0FBQUEsSUFDSjtBQUVBLHNCQUFrQjtBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLGVBQWUsQ0FBQyxhQUEwQjtBQVV0QyxVQUFNLFFBQVEsU0FBUyxNQUFNLElBQUk7QUFDakMsVUFBTSxxQkFBcUIsUUFBUSxlQUFlLHdCQUF3QjtBQUMxRSxVQUFNLG1CQUFtQjtBQUN6QixRQUFJLHdCQUF1QztBQUMzQyxRQUFJO0FBQ0osUUFBSSxhQUFhO0FBQ2pCLFFBQUksUUFBUTtBQUVaLGFBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFFbkMsYUFBTyxNQUFNLENBQUM7QUFFZCxVQUFJLFlBQVk7QUFFWixnQkFBUSxHQUFHLEtBQUs7QUFBQSxFQUM5QixJQUFJO0FBQ1U7QUFBQSxNQUNKO0FBRUEsVUFBSSxLQUFLLFdBQVcsa0JBQWtCLE1BQU0sTUFBTTtBQUU5QyxnQ0FBd0IsS0FBSyxVQUFVLG1CQUFtQixNQUFNO0FBQ2hFLHFCQUFhO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBRUEsUUFBSSxDQUFDLHVCQUF1QjtBQUN4QjtBQUFBLElBQ0o7QUFFQSw0QkFBd0Isc0JBQXNCLEtBQUE7QUFFOUMsUUFBSSxzQkFBc0IsU0FBUyxnQkFBZ0IsTUFBTSxNQUFNO0FBRTNELFlBQU0sU0FBUyxzQkFBc0IsU0FBUyxpQkFBaUI7QUFFL0QsOEJBQXdCLHNCQUFzQjtBQUFBLFFBQzFDO0FBQUEsUUFDQTtBQUFBLE1BQUE7QUFBQSxJQUVSO0FBRUEsNEJBQXdCLHNCQUFzQixLQUFBO0FBQzlDLFFBQUksY0FBMEI7QUFFOUIsUUFBSTtBQUNBLG9CQUFjLEtBQUssTUFBTSxxQkFBcUI7QUFBQSxJQUNsRCxTQUNPLEdBQUc7QUFDTixjQUFRLElBQUksQ0FBQztBQUFBLElBQ2pCO0FBRUEsZ0JBQVksUUFBUTtBQUVwQixXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEscUJBQXFCLENBQ2pCLE9BQ0EsYUFDTztBQUVQLFFBQUksQ0FBQyxPQUFPO0FBQ1I7QUFBQSxJQUNKO0FBRUEsa0JBQWMsaUJBQWlCLEtBQUs7QUFDcEMsVUFBTSxZQUFZLEdBQUcsa0JBQWtCO0FBQ3ZDLGFBQVMsR0FBRywwQkFBMEI7QUFBQSxFQUMxQztBQUFBLEVBRUEsMEJBQTBCLENBQUMsYUFBb0M7QUFFM0QsUUFBSSxDQUFDLFlBQ0UsU0FBUyxRQUFRLFdBQVcsR0FDakM7QUFDRTtBQUFBLElBQ0o7QUFFQSxlQUFXLFVBQVUsU0FBUyxTQUFTO0FBRW5DLGFBQU8sR0FBRywwQkFBMEI7QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUVBLGdCQUFnQixDQUNaLE9BQ0EsVUFDQSxXQUNPO0FBRVAsa0JBQWMseUJBQXlCLFFBQVE7QUFDL0MsV0FBTyxHQUFHLDBCQUEwQjtBQUVwQyxrQkFBYztBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFBQSxFQUVBLGtCQUFrQixDQUFDLFVBQXdCO0FBRXZDLFVBQU0saUJBQWlCLE1BQU0sWUFBWTtBQUV6QyxlQUFXLFlBQVksZ0JBQWdCO0FBRW5DLG9CQUFjLGdCQUFnQixlQUFlLFFBQVEsQ0FBQztBQUFBLElBQzFEO0FBQUEsRUFDSjtBQUFBLEVBRUEsaUJBQWlCLENBQUMsYUFBb0M7QUFFbEQsYUFBUyxHQUFHLDBCQUEwQjtBQUN0QyxhQUFTLEdBQUcsYUFBYTtBQUFBLEVBQzdCO0FBQUEsRUFFQSw0QkFBNEIsQ0FBQyxhQUFpSjtBQUUxSyxVQUFNLGNBQXNDLENBQUE7QUFDNUMsVUFBTSxVQUFrQyxDQUFBO0FBQ3hDLFFBQUk7QUFFSixRQUFJLENBQUMsVUFBVTtBQUVYLGFBQU87QUFBQSxRQUNIO0FBQUEsUUFDQTtBQUFBLFFBQ0EsT0FBTztBQUFBLE1BQUE7QUFBQSxJQUVmO0FBRUEsYUFBUyxJQUFJLEdBQUcsSUFBSSxTQUFTLFFBQVEsS0FBSztBQUV0QyxlQUFTLFNBQVMsQ0FBQztBQUVuQixVQUFJLENBQUMsT0FBTyxhQUFhO0FBRXJCLGdCQUFRLEtBQUssTUFBTTtBQUFBLE1BQ3ZCLE9BQ0s7QUFDRCxvQkFBWSxLQUFLLE1BQU07QUFBQSxNQUMzQjtBQUFBLElBQ0o7QUFFQSxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxNQUNBLE9BQU8sU0FBUztBQUFBLElBQUE7QUFBQSxFQUV4QjtBQUFBLEVBRUEsWUFBWSxDQUNSLE9BQ0EsYUFDTztBQUVQLFVBQU0sVUFBVSxTQUFTO0FBRXpCLFFBQUksU0FBaUMsV0FBVztBQUFBLE1BQzVDO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsSUFBQTtBQUdiLFFBQUksUUFBUTtBQUVSLFVBQUksT0FBTyxPQUFPLFNBQVMsSUFBSTtBQUUzQixjQUFNLElBQUksTUFBTSxrQ0FBa0M7QUFBQSxNQUN0RDtBQUVBLGFBQU8sV0FBVztBQUNsQixlQUFTLEdBQUcsZUFBZSxPQUFPLEdBQUcsZUFBZTtBQUVwRDtBQUFBLFFBQ0k7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVIsT0FDSztBQUNELFlBQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLElBQzdDO0FBRUEsWUFBUSxVQUFVO0FBQ2xCLGtCQUFjLGNBQWMsUUFBUTtBQUFBLEVBQ3hDO0FBQ0o7QUMxN0JBLE1BQU0sZ0JBQWdCLENBQ2xCLFVBQ0EsU0FDTztBQU9QLE1BQUksQ0FBQyxVQUFVO0FBQ1g7QUFBQSxFQUNKO0FBRUEsV0FBUyxHQUFHLGFBQWE7QUFFekI7QUFBQSxJQUNJLFNBQVM7QUFBQSxJQUNUO0FBQUEsRUFBQTtBQUdKO0FBQUEsSUFDSSxTQUFTLE1BQU07QUFBQSxJQUNmO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSx1QkFBdUIsQ0FDekIsVUFDQSxTQUNPO0FBTVAsTUFBSSxDQUFDLFVBQVU7QUFDWDtBQUFBLEVBQ0o7QUFFQSxhQUFXLFVBQVUsVUFBVSxTQUFTO0FBRXBDO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUVBO0FBQUEsSUFDSSxTQUFTO0FBQUEsSUFDVDtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sNEJBQTRCLENBQzlCLGNBQ0EsU0FDTztBQUVQLE1BQUksQ0FBQyxjQUFjLFFBQVE7QUFDdkI7QUFBQSxFQUNKO0FBRUE7QUFBQSxJQUNJLGFBQWEsT0FBTztBQUFBLElBQ3BCO0FBQUEsRUFBQTtBQUdKO0FBQUEsSUFDSSxhQUFhLE9BQU87QUFBQSxJQUNwQjtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sa0JBQWtCO0FBQUEsRUFFcEIsZUFBZSxDQUNYLE9BQ0EsYUFDaUI7QUFFakIsUUFBSSxDQUFDLFNBQ0UsQ0FBQyxVQUNOO0FBQ0UsYUFBTztBQUFBLElBQ1g7QUFFQSxlQUFXLFNBQVMsS0FBSztBQUN6QixrQkFBYyxpQkFBaUIsS0FBSztBQUNwQyxVQUFNLFdBQVcsU0FBUyxHQUFHLDRCQUE0QjtBQUN6RCxVQUFNLFlBQVksR0FBRyxrQkFBa0I7QUFDdkMsYUFBUyxHQUFHLDBCQUEwQjtBQUV0QztBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsYUFBYSxDQUNULE9BQ0EsYUFDaUI7QUFFakIsUUFBSSxDQUFDLFNBQ0UsQ0FBQyxVQUNOO0FBQ0UsYUFBTztBQUFBLElBQ1g7QUFFQSxlQUFXLFNBQVMsS0FBSztBQUN6QixrQkFBYyxpQkFBaUIsS0FBSztBQUNwQyxhQUFTLEdBQUcsMEJBQTBCO0FBQ3RDLFVBQU0sWUFBWSxHQUFHLGtCQUFrQjtBQUV2QztBQUFBLE1BQ0k7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFdBQU8sV0FBVyxXQUFXLEtBQUs7QUFBQSxFQUN0QztBQUFBLEVBRUEsZ0JBQWdCLENBQ1osT0FDQSxZQUNpQjtBQUVqQixRQUFJLENBQUMsU0FDRSxDQUFDLFNBQVMsa0JBQ1YsQ0FBQyxTQUFTLFFBQ2Y7QUFDRSxhQUFPO0FBQUEsSUFDWDtBQUVBLGVBQVcsU0FBUyxLQUFLO0FBRXpCLFdBQU8saUJBQWlCO0FBQUEsTUFDcEI7QUFBQSxNQUNBLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxJQUFBO0FBQUEsRUFFaEI7QUFBQSxFQUVBLHFCQUFxQixDQUNqQixPQUNBLFlBQ2lCO0FBRWpCLFFBQUksQ0FBQyxTQUNFLENBQUMsU0FBUyxRQUNmO0FBQ0UsYUFBTztBQUFBLElBQ1g7QUFFQSxVQUFNLFlBQVksUUFBUTtBQUMxQixlQUFXLFNBQVMsS0FBSztBQUV6QixRQUFJLENBQUMsVUFBVSxHQUFHLG1CQUFtQjtBQUVqQyxnQkFBVSxHQUFHLG9CQUFvQjtBQUVqQyxhQUFPLGlCQUFpQjtBQUFBLFFBQ3BCO0FBQUEsUUFDQSxRQUFRO0FBQUEsTUFBQTtBQUFBLElBRWhCO0FBRUEsY0FBVSxHQUFHLG9CQUFvQjtBQUVqQyxXQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsRUFDdEM7QUFDSjtBQ3BMQSxNQUFxQixnQkFBNEM7QUFBQSxFQUU3RCxZQUNJLGdCQUNBLFFBQ0U7QUFFRixTQUFLLGlCQUFpQjtBQUN0QixTQUFLLFNBQVM7QUFBQSxFQUNsQjtBQUFBLEVBRU87QUFBQSxFQUNBO0FBQ1g7QUNOQSxNQUFNLCtCQUErQixDQUFDLGNBQTJDO0FBRTdFLE1BQUksQ0FBQyxVQUFVLEdBQUcsbUJBQW1CO0FBRWpDLFdBQU8sQ0FBQTtBQUFBLEVBQ1g7QUFFQSxRQUFNLE9BQW1CLENBQUE7QUFFekIsZ0JBQWM7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixTQUFPO0FBQ1g7QUFFQSxNQUFNLDZCQUE2QixDQUMvQixRQUNBLGNBQ2U7QUFFZixNQUFJLENBQUMsYUFDRSxDQUFDLFVBQVUsYUFBYTtBQUUzQixXQUFPO0FBQUEsRUFDWDtBQUVBLFFBQU0sT0FFRixFQUFFLE9BQU8sRUFBRSxPQUFPLHlCQUF5QjtBQUFBLElBQ3ZDLEVBQUUsT0FBTyxFQUFFLE9BQU8sMEJBQTBCO0FBQUEsTUFDeEM7QUFBQSxRQUFFO0FBQUEsUUFDRTtBQUFBLFVBQ0ksT0FBTztBQUFBLFVBQ1AsYUFBYTtBQUFBLFlBQ1QsZ0JBQWdCO0FBQUEsWUFDaEIsQ0FBQyxXQUFnQjtBQUNiLHFCQUFPLElBQUk7QUFBQSxnQkFDUDtBQUFBLGdCQUNBO0FBQUEsY0FBQTtBQUFBLFlBRVI7QUFBQSxVQUFBO0FBQUEsUUFDSjtBQUFBLFFBRUo7QUFBQSxVQUNJLEVBQUUsUUFBUSxFQUFFLE9BQU8sdUJBQUEsR0FBMEIsVUFBVSxNQUFNO0FBQUEsVUFDN0QsRUFBRSxRQUFRLEVBQUUsT0FBTyxvQkFBQSxHQUF1QixHQUFHO0FBQUEsUUFBQTtBQUFBLE1BQ2pEO0FBQUEsSUFDSixDQUNIO0FBQUEsSUFFRCw2QkFBNkIsU0FBUztBQUFBLEVBQUEsQ0FDekM7QUFFTCxTQUFPO0FBQ1g7QUFFQSxNQUFNLDhCQUE4QixDQUNoQyxRQUNBLGNBQ2U7QUFFZixNQUFJLENBQUMsYUFDRSxDQUFDLFVBQVUsYUFBYTtBQUUzQixXQUFPO0FBQUEsRUFDWDtBQUVBLFFBQU0sT0FFRixFQUFFLE9BQU8sRUFBRSxPQUFPLHlDQUF5QztBQUFBLElBQ3ZELEVBQUUsT0FBTyxFQUFFLE9BQU8sMEJBQTBCO0FBQUEsTUFDeEM7QUFBQSxRQUFFO0FBQUEsUUFDRTtBQUFBLFVBQ0ksT0FBTztBQUFBLFVBQ1AsYUFBYTtBQUFBLFlBQ1QsZ0JBQWdCO0FBQUEsWUFDaEIsQ0FBQyxXQUFnQjtBQUNiLHFCQUFPLElBQUk7QUFBQSxnQkFDUDtBQUFBLGdCQUNBO0FBQUEsY0FBQTtBQUFBLFlBRVI7QUFBQSxVQUFBO0FBQUEsUUFDSjtBQUFBLFFBRUo7QUFBQSxVQUNJLEVBQUUsUUFBUSxJQUFJLFVBQVUsTUFBTTtBQUFBLFFBQUE7QUFBQSxNQUNsQztBQUFBLElBQ0osQ0FDSDtBQUFBLEVBQUEsQ0FDSjtBQUVMLFNBQU87QUFDWDtBQUVBLE1BQU0scUJBQXFCLENBQ3ZCLFFBQ0EsY0FDZTtBQUVmLE1BQUksQ0FBQyxhQUNFLENBQUMsVUFBVSxhQUFhO0FBRTNCLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxVQUFVLEdBQUcsc0JBQXNCLE1BQU07QUFFekMsV0FBTztBQUFBLE1BQ0g7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFFQSxTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBRVI7QUFFQSxNQUFNLDBCQUEwQixDQUM1QixRQUNBLFdBQ2U7QUFFZixNQUFJLENBQUMsVUFDRSxPQUFPLGdCQUFnQixNQUFNO0FBRWhDLFdBQU87QUFBQSxFQUNYO0FBRUEsUUFBTSxPQUVGO0FBQUEsSUFBRTtBQUFBLElBQU8sRUFBRSxPQUFPLG1CQUFBO0FBQUEsSUFDZDtBQUFBLE1BQ0k7QUFBQSxRQUFFO0FBQUEsUUFDRTtBQUFBLFVBQ0ksT0FBTztBQUFBLFVBQ1AsYUFBYTtBQUFBLFlBQ1QsZ0JBQWdCO0FBQUEsWUFDaEIsQ0FBQyxXQUFnQjtBQUNiLHFCQUFPLElBQUk7QUFBQSxnQkFDUDtBQUFBLGdCQUNBO0FBQUEsY0FBQTtBQUFBLFlBRVI7QUFBQSxVQUFBO0FBQUEsUUFDSjtBQUFBLFFBRUo7QUFBQSxVQUNJLEVBQUUsUUFBUSxJQUFJLE9BQU8sTUFBTTtBQUFBLFFBQUE7QUFBQSxNQUMvQjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBR1IsU0FBTztBQUNYO0FBRUEsTUFBTSwyQkFBMkIsQ0FDN0IsVUFDQSxZQUMrQztBQUUvQyxRQUFNLGNBQTBCLENBQUE7QUFDaEMsTUFBSTtBQUVKLGFBQVcsVUFBVSxTQUFTO0FBRTFCLGdCQUFZO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osUUFBSSxXQUFXO0FBRVgsa0JBQVksS0FBSyxTQUFTO0FBQUEsSUFDOUI7QUFBQSxFQUNKO0FBRUEsTUFBSSxpQkFBaUI7QUFFckIsTUFBSSxTQUFTLFVBQVU7QUFFbkIscUJBQWlCLEdBQUcsY0FBYztBQUFBLEVBQ3RDO0FBRUEsUUFBTSxPQUVGO0FBQUEsSUFBRTtBQUFBLElBQ0U7QUFBQSxNQUNJLE9BQU8sR0FBRyxjQUFjO0FBQUEsTUFDeEIsVUFBVTtBQUFBLE1BQ1YsUUFBUTtBQUFBLFFBQ0osZ0JBQWdCO0FBQUEsUUFDaEIsQ0FBQyxXQUFnQjtBQUFBLE1BQUE7QUFBQSxJQUNyQjtBQUFBLElBR0o7QUFBQSxFQUFBO0FBR1IsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBLGFBQWE7QUFBQSxFQUFBO0FBRXJCO0FBRUEsTUFBTSw4QkFBOEIsQ0FDaEMsVUFDQSxTQUNBLG1CQUNBLFVBQ087QUFFUCxRQUFNLGNBQWM7QUFBQSxJQUNoQjtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osTUFBSSxDQUFDLGFBQWE7QUFDZDtBQUFBLEVBQ0o7QUFFQSxRQUFNO0FBQUEsSUFFRjtBQUFBLE1BQUU7QUFBQSxNQUNFO0FBQUEsUUFDSSxJQUFJLEdBQUcsaUJBQWlCO0FBQUEsUUFDeEIsT0FBTztBQUFBLE1BQUE7QUFBQSxNQUVYO0FBQUEsUUFDSSxZQUFZO0FBQUEsTUFBQTtBQUFBLElBQ2hCO0FBQUEsRUFDSjtBQUVSO0FBRUEsTUFBTSw0QkFBNEIsQ0FBQyxhQUFxQztBQUVwRSxRQUFNLE9BRUY7QUFBQSxJQUFFO0FBQUEsSUFDRTtBQUFBLE1BQ0ksT0FBTztBQUFBLE1BQ1AsYUFBYTtBQUFBLFFBQ1QsZ0JBQWdCO0FBQUEsUUFDaEIsQ0FBQyxXQUFnQjtBQUFBLE1BQUE7QUFBQSxJQUNyQjtBQUFBLElBRUo7QUFBQSxNQUNJLEVBQUUsUUFBUSxFQUFFLE9BQU8sMkJBQTJCLEdBQUcsU0FBUyxVQUFVLE1BQU0sRUFBRTtBQUFBLElBQUE7QUFBQSxFQUNoRjtBQUdSLFNBQU87QUFDWDtBQUVBLE1BQU0sK0JBQStCLENBQ2pDLFVBQ0EsbUJBQ0EsVUFDTztBQUVQLFFBQU0sYUFBYSwwQkFBMEIsUUFBUTtBQUVyRCxRQUFNLE9BRUY7QUFBQSxJQUFFO0FBQUEsSUFDRTtBQUFBLE1BQ0ksSUFBSSxHQUFHLGlCQUFpQjtBQUFBLE1BQ3hCLE9BQU87QUFBQSxJQUFBO0FBQUEsSUFFWDtBQUFBLE1BQ0k7QUFBQSxJQUFBO0FBQUEsRUFDSjtBQUdSLE9BQUssS0FBSztBQUFBLElBQ04sYUFBYTtBQUFBLEVBQUE7QUFHakIsUUFBTSxLQUFLLElBQUk7QUFDbkI7QUFFQSxNQUFNLHVCQUF1QixDQUN6QixVQUNBLGdCQUNlO0FBRWYsTUFBSSxZQUFZLFdBQVcsR0FBRztBQUUxQixXQUFPO0FBQUEsRUFDWDtBQUVBLFFBQU0sbUJBQStCLENBQUE7QUFDckMsTUFBSTtBQUVKLGFBQVcsYUFBYSxhQUFhO0FBRWpDLG9CQUFnQjtBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUdKLFFBQUksZUFBZTtBQUVmLHVCQUFpQixLQUFLLGFBQWE7QUFBQSxJQUN2QztBQUFBLEVBQ0o7QUFFQSxNQUFJLGlCQUFpQixXQUFXLEdBQUc7QUFFL0IsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFJLHFCQUFxQjtBQUV6QixNQUFJLFNBQVMsVUFBVTtBQUVuQix5QkFBcUIsR0FBRyxrQkFBa0I7QUFBQSxFQUM5QztBQUVBLFFBQU0sT0FFRjtBQUFBLElBQUU7QUFBQSxJQUNFO0FBQUEsTUFDSSxPQUFPLEdBQUcsa0JBQWtCO0FBQUEsTUFDNUIsVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQTtBQUFBLElBT2Q7QUFBQSxFQUFBO0FBR1IsU0FBTztBQUNYO0FBRUEsTUFBTSwwQkFBMEIsQ0FDNUIsVUFDQSxhQUNBLG1CQUNBLFVBQ087QUFFUCxRQUFNLGtCQUFrQjtBQUFBLElBQ3BCO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixNQUFJLENBQUMsaUJBQWlCO0FBQ2xCO0FBQUEsRUFDSjtBQUVBLFFBQU07QUFBQSxJQUVGO0FBQUEsTUFBRTtBQUFBLE1BQ0U7QUFBQSxRQUNJLElBQUksR0FBRyxpQkFBaUI7QUFBQSxRQUN4QixPQUFPO0FBQUEsTUFBQTtBQUFBLE1BRVg7QUFBQSxRQUNJO0FBQUEsTUFBQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBRVI7QUFFQSxNQUFNLG1CQUFtQixDQUNyQixVQUNBLFlBQytDO0FBRS9DLE1BQUksUUFBUSxXQUFXLEdBQUc7QUFFdEIsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFJLFFBQVEsV0FBVyxLQUNoQixRQUFRLENBQUMsRUFBRSxXQUFXLElBQzNCO0FBQ0UsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFJLFNBQVMsWUFDTixDQUFDLFNBQVMsR0FBRyx5QkFBeUI7QUFFekMsVUFBTSxPQUFPLDBCQUEwQixRQUFRO0FBRS9DLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQSxhQUFhO0FBQUEsSUFBQTtBQUFBLEVBRXJCO0FBRUEsU0FBTztBQUFBLElBQ0g7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBRUEsTUFBTSxzQkFBc0IsQ0FDeEIsVUFDQSxTQUNBLG1CQUNBLFVBQ087QUFFUCxNQUFJLFFBQVEsV0FBVyxHQUFHO0FBQ3RCO0FBQUEsRUFDSjtBQUVBLE1BQUksUUFBUSxXQUFXLEtBQ2hCLFFBQVEsQ0FBQyxFQUFFLFdBQVcsSUFDM0I7QUFDRTtBQUFBLEVBQ0o7QUFFQSxNQUFJLFNBQVMsWUFDTixDQUFDLFNBQVMsR0FBRyx5QkFBeUI7QUFFekM7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0o7QUFBQSxFQUNKO0FBRUE7QUFBQSxJQUNJO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUVSO0FBR0EsTUFBTSxlQUFlO0FBQUEsRUFFakIsV0FBVyxDQUFDLGFBQWdGO0FBRXhGLFFBQUksQ0FBQyxTQUFTLFdBQ1AsU0FBUyxRQUFRLFdBQVcsS0FDNUIsQ0FBQ0EsV0FBRSxtQkFBbUIsU0FBUyxJQUFJLEdBQ3hDO0FBQ0UsYUFBTztBQUFBLFFBQ0gsT0FBTyxDQUFBO0FBQUEsUUFDUCxrQkFBa0I7QUFBQSxNQUFBO0FBQUEsSUFFMUI7QUFFQSxRQUFJLFNBQVMsUUFBUSxXQUFXLEtBQ3pCLFNBQVMsUUFBUSxDQUFDLEVBQUUsV0FBVyxJQUNwQztBQUNFLGFBQU87QUFBQSxRQUNILE9BQU8sQ0FBQTtBQUFBLFFBQ1Asa0JBQWtCO0FBQUEsTUFBQTtBQUFBLElBRTFCO0FBRUEsVUFBTSx3QkFBd0IsY0FBYywyQkFBMkIsU0FBUyxPQUFPO0FBRXZGLFVBQU0sUUFBb0I7QUFBQSxNQUV0QjtBQUFBLFFBQ0k7QUFBQSxRQUNBLHNCQUFzQjtBQUFBLE1BQUE7QUFBQSxJQUMxQjtBQUdKLFVBQU0scUJBQXFCO0FBQUEsTUFDdkI7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLElBQUE7QUFHMUIsUUFBSSxvQkFBb0I7QUFFcEIsWUFBTSxLQUFLLG1CQUFtQixJQUFJO0FBQUEsSUFDdEM7QUFFQSxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0Esa0JBQWtCLG9CQUFvQixlQUFlO0FBQUEsSUFBQTtBQUFBLEVBRTdEO0FBQUEsRUFFQSxZQUFZLENBQ1IsVUFDQSxVQUNPO0FBRVAsUUFBSSxDQUFDLFNBQVMsV0FDUCxTQUFTLFFBQVEsV0FBVyxLQUM1QixDQUFDQSxXQUFFLG1CQUFtQixTQUFTLElBQUksR0FDeEM7QUFDRTtBQUFBLElBQ0o7QUFFQSxRQUFJLFNBQVMsUUFBUSxXQUFXLEtBQ3pCLFNBQVMsUUFBUSxDQUFDLEVBQUUsV0FBVyxJQUNwQztBQUNFO0FBQUEsSUFDSjtBQUVBLFVBQU0sb0JBQW9CLGNBQWMscUJBQXFCLFNBQVMsRUFBRTtBQUN4RSxVQUFNLHdCQUF3QixjQUFjLDJCQUEyQixTQUFTLE9BQU87QUFFdkY7QUFBQSxNQUNJO0FBQUEsTUFDQSxzQkFBc0I7QUFBQSxNQUN0QjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0o7QUFBQSxNQUNJO0FBQUEsTUFDQSxzQkFBc0I7QUFBQSxNQUN0QjtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDaGhCQSxNQUFNLDBCQUEwQixDQUM1QixVQUNBLFVBQ087QUFFUCxNQUFJLDRCQUE0QjtBQUNoQyxRQUFNLGNBQWMsTUFBTTtBQUUxQixNQUFJLGNBQWMsR0FBRztBQUVqQixVQUFNLFdBQWdCLE1BQU0sY0FBYyxDQUFDO0FBRTNDLFFBQUksVUFBVSxJQUFJLGdCQUFnQixNQUFNO0FBRXBDLGtDQUE0QjtBQUFBLElBQ2hDO0FBQUEsRUFDSjtBQUVBLFFBQU0sZ0JBQWdCLGNBQWMsaUJBQWlCLFNBQVMsRUFBRTtBQUNoRSxRQUFNLFVBQTRELGFBQWEsVUFBVSxRQUFRO0FBRWpHLE1BQUksa0JBQWtCLHdCQUF3QjtBQUUxQyxZQUFRLElBQUksYUFBYSxhQUFhLElBQUk7QUFBQSxFQUM5QztBQUVBLFFBQU0sT0FFRjtBQUFBLElBQUU7QUFBQSxJQUNFO0FBQUEsTUFDSSxJQUFJLEdBQUcsYUFBYTtBQUFBLE1BQ3BCLE9BQU87QUFBQSxRQUNILHNCQUFzQjtBQUFBLFFBQ3RCLGlDQUFpQyw4QkFBOEI7QUFBQSxNQUFBO0FBQUEsSUFDbkU7QUFBQSxJQUVKO0FBQUEsTUFDSTtBQUFBLFFBQUU7QUFBQSxRQUNFO0FBQUEsVUFDSSxPQUFPO0FBQUEsVUFDUCxtQkFBbUIsU0FBUztBQUFBLFFBQUE7QUFBQSxRQUVoQztBQUFBLE1BQUE7QUFBQSxNQUdKLFFBQVE7QUFBQSxJQUFBO0FBQUEsRUFDWjtBQUdSLE1BQUksUUFBUSxxQkFBcUIsTUFBTTtBQUVuQyxTQUFLLEtBQUs7QUFBQSxNQUNOLGFBQWE7QUFBQSxJQUFBO0FBQUEsRUFFckI7QUFFQSxRQUFNLEtBQUssSUFBSTtBQUNuQjtBQW1DQSxNQUFNLFlBQVk7QUFBQSxFQUVkLFdBQVcsQ0FDUCxVQUNBLFVBQ087QUFFUCxRQUFJLENBQUMsWUFDRSxTQUFTLEdBQUcsZUFBZSxNQUNoQztBQUNFO0FBQUEsSUFDSjtBQUVBO0FBQUEsTUFDSTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osY0FBVTtBQUFBLE1BQ04sU0FBUyxNQUFNO0FBQUEsTUFDZjtBQUFBLElBQUE7QUFRSixrQkFBYztBQUFBLE1BQ1YsU0FBUztBQUFBLE1BQ1Q7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUNKO0FDNUhBLE1BQU0sc0JBQXNCLENBQ3hCLFVBQ0EsVUFDTztBQUVQLE1BQUlBLFdBQUUsbUJBQW1CLFNBQVMsS0FBSyxNQUFNLE1BQU07QUFDL0M7QUFBQSxFQUNKO0FBRUEsTUFBSSw0QkFBNEI7QUFDaEMsUUFBTSxjQUFjLE1BQU07QUFFMUIsTUFBSSxjQUFjLEdBQUc7QUFFakIsVUFBTSxXQUFnQixNQUFNLGNBQWMsQ0FBQztBQUUzQyxRQUFJLFVBQVUsSUFBSSxnQkFBZ0IsTUFBTTtBQUVwQyxrQ0FBNEI7QUFBQSxJQUNoQztBQUFBLEVBQ0o7QUFFQSxRQUFNLG9CQUFvQixjQUFjLHFCQUFxQixTQUFTLEVBQUU7QUFFeEUsUUFBTTtBQUFBLElBRUY7QUFBQSxNQUFFO0FBQUEsTUFDRTtBQUFBLFFBQ0ksSUFBSSxHQUFHLGlCQUFpQjtBQUFBLFFBQ3hCLE9BQU87QUFBQSxVQUNILHNCQUFzQjtBQUFBLFVBQ3RCLGlDQUFpQyw4QkFBOEI7QUFBQSxRQUFBO0FBQUEsTUFDbkU7QUFBQSxNQUVKO0FBQUEsUUFDSTtBQUFBLFVBQUU7QUFBQSxVQUNFO0FBQUEsWUFDSSxPQUFPO0FBQUEsWUFDUCxtQkFBbUIsU0FBUztBQUFBLFVBQUE7QUFBQSxVQUVoQztBQUFBLFFBQUE7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFUjtBQUVBLE1BQU0sZ0JBQWdCO0FBQUEsRUFFbEIsV0FBVyxDQUNQLFVBQ0EsVUFDTztBQUVQLFFBQUksQ0FBQyxZQUNFLFNBQVMsR0FBRyxlQUFlLE1BQ2hDO0FBQ0U7QUFBQSxJQUNKO0FBRUE7QUFBQSxNQUNJO0FBQUEsTUFDQTtBQUFBLElBQUE7QUFHSixjQUFVO0FBQUEsTUFDTixTQUFTLE1BQU07QUFBQSxNQUNmO0FBQUEsSUFBQTtBQUdKLGlCQUFhO0FBQUEsTUFDVDtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBR0osa0JBQWM7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNUO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ2hGQSxNQUFNLGFBQWE7QUFBQSxFQUVmLGtCQUFrQixDQUFDLFVBQXlCO0FBRXhDLFVBQU0sYUFBeUIsQ0FBQTtBQUUvQixrQkFBYztBQUFBLE1BQ1YsTUFBTSxZQUFZLGNBQWM7QUFBQSxNQUNoQztBQUFBLElBQUE7QUFLSixVQUFNLE9BRUY7QUFBQSxNQUFFO0FBQUEsTUFDRTtBQUFBLFFBQ0ksSUFBSTtBQUFBLE1BQUE7QUFBQSxNQUdSO0FBQUEsSUFBQTtBQUdSLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUMzQkEsTUFBTSxXQUFXO0FBQUEsRUFFYixXQUFXLENBQUMsVUFBeUI7QUFFakMsVUFBTSxPQUVGO0FBQUEsTUFBRTtBQUFBLE1BQ0U7QUFBQSxRQUNJLFNBQVMsWUFBWTtBQUFBLFFBQ3JCLElBQUk7QUFBQSxNQUFBO0FBQUEsTUFFUjtBQUFBLFFBQ0ksV0FBVyxpQkFBaUIsS0FBSztBQUFBLE1BQUE7QUFBQSxJQUNyQztBQUdSLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUN2QkEsTUFBcUIsU0FBOEI7QUFBQSxFQUV4QyxNQUFjO0FBQUEsRUFDZCxJQUFZO0FBQUE7QUFBQSxFQUdaLFdBQW1CO0FBQUEsRUFDbkIsb0JBQTRCO0FBQUEsRUFDNUIsbUJBQTJCO0FBQUEsRUFDM0IsaUJBQXlCO0FBQUEsRUFFeEIsVUFBbUIsT0FBZSxzQkFBc0I7QUFBQSxFQUN6RCxVQUFtQixPQUFlLHNCQUFzQjtBQUFBLEVBQ3hELGlCQUEwQixPQUFlLDZCQUE2QjtBQUFBLEVBRXRFLFNBQWlCLEdBQUcsS0FBSyxPQUFPO0FBQUEsRUFDaEMsU0FBaUIsR0FBRyxLQUFLLE9BQU87QUFBQSxFQUNoQyxVQUFrQixHQUFHLEtBQUssT0FBTztBQUM1QztBQ3BCTyxJQUFLLHdDQUFBVSx5QkFBTDtBQUVIQSx1QkFBQSxTQUFBLElBQVU7QUFDVkEsdUJBQUEsV0FBQSxJQUFZO0FBQ1pBLHVCQUFBLFVBQUEsSUFBVztBQUpILFNBQUFBO0FBQUEsR0FBQSx1QkFBQSxDQUFBLENBQUE7QUNJWixNQUFxQixRQUE0QjtBQUFBLEVBRXRDLGVBQW1DLENBQUE7QUFBQSxFQUNuQyxZQUFpQyxvQkFBb0I7QUFBQSxFQUNyRCxlQUF1QjtBQUNsQztBQ1BBLE1BQXFCLEtBQXNCO0FBQUEsRUFFaEMsTUFBYztBQUFBLEVBQ2QsSUFBWTtBQUFBLEVBQ1osWUFBcUI7QUFBQSxFQUNyQixhQUFzQjtBQUFBLEVBQ3RCLE1BQWU7QUFBQSxFQUNmLFlBQW9CO0FBQUEsRUFDcEIsV0FBb0I7QUFBQSxFQUNwQixPQUFlO0FBQUEsRUFDZixNQUFjO0FBQ3pCO0FDVEEsTUFBcUIsZUFBeUM7QUFBQSxFQUVuRCxvQkFBd0MsQ0FBQTtBQUFBLEVBQ3hDLHlCQUE2QyxDQUFBO0FBQUEsRUFDN0MscUJBQXFDLENBQUE7QUFDaEQ7QUNQQSxNQUFxQixjQUF3QztBQUFBLEVBRWxELE1BQWU7QUFBQSxFQUNmLGtCQUEyQjtBQUN0QztBQ0NBLE1BQXFCLFlBQW9DO0FBQUEsRUFFOUMsYUFBc0I7QUFBQSxFQUN0QixjQUF1QjtBQUFBLEVBQ3ZCLFdBQWlDLENBQUE7QUFBQSxFQUNqQyxlQUFxQztBQUFBLEVBQ3JDLFdBQWdCLENBQUE7QUFBQSxFQUNoQixjQUFtQixDQUFBO0FBQUEsRUFDbkIsaUJBQXlDO0FBQUE7QUFBQSxFQUd6Qyx3QkFBNkIsQ0FBQTtBQUFBLEVBQzdCLDBCQUErQixDQUFBO0FBQUEsRUFFL0IsS0FBcUIsSUFBSSxjQUFBO0FBQ3BDO0FDVkEsTUFBcUIsTUFBd0I7QUFBQSxFQUV6QyxjQUFjO0FBRVYsVUFBTSxXQUFzQixJQUFJLFNBQUE7QUFDaEMsU0FBSyxXQUFXO0FBQUEsRUFDcEI7QUFBQSxFQUVPLFVBQW1CO0FBQUEsRUFDbkIsUUFBaUI7QUFBQSxFQUNqQixlQUF3QjtBQUFBLEVBQ3hCLFVBQWtCO0FBQUEsRUFDbEI7QUFBQSxFQUNBLE9BQWMsSUFBSSxLQUFBO0FBQUEsRUFFbEIsY0FBNEIsSUFBSSxZQUFBO0FBQUEsRUFFaEMsZ0JBQWdDLElBQUksZUFBQTtBQUFBLEVBRXBDLGNBQXdCLElBQUlDLFFBQUE7QUFDdkM7QUNuQkEsTUFBTSxrQkFBa0IsQ0FDcEIsT0FDQSxtQkFDQSxpQkFDNkI7QUFFN0IsTUFBSVgsV0FBRSxtQkFBbUIsaUJBQWlCLE1BQU0sTUFBTTtBQUNsRDtBQUFBLEVBQ0o7QUFFQSxRQUFNLFNBQWlCQSxXQUFFLGFBQUE7QUFFekIsTUFBSSxVQUFVLGdCQUFnQjtBQUFBLElBQzFCO0FBQUEsSUFDQTtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQUE7QUFHZixRQUFNLE1BQWMsR0FBRyxpQkFBaUIsSUFBSSxlQUFlLG9CQUFvQjtBQUUvRSxRQUFNLGdCQUFnQixhQUFhO0FBQUEsSUFDL0I7QUFBQSxJQUNBO0FBQUEsRUFBQTtBQUdKLE1BQUksa0JBQWtCLE1BQU07QUFDeEI7QUFBQSxFQUNKO0FBRUEsU0FBTyxtQkFBbUI7QUFBQSxJQUN0QjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1I7QUFBQSxJQUFBO0FBQUEsSUFFSixVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixPQUFPLENBQUNLLFFBQWUsaUJBQXNCO0FBRXpDLGNBQVEsSUFBSTtBQUFBO0FBQUEseUJBRUMsR0FBRztBQUFBLG1DQUNPLEtBQUssVUFBVSxZQUFZLENBQUM7QUFBQSwyQkFDcEMsS0FBSyxVQUFVLGFBQWEsS0FBSyxDQUFDO0FBQUEsNEJBQ2pDLGVBQWUsZ0JBQWdCLElBQUk7QUFBQSwyQkFDcEMsTUFBTTtBQUFBLGNBQ25CO0FBRUYsWUFBTTtBQUFBO0FBQUEseUJBRU8sR0FBRztBQUFBLG1DQUNPLEtBQUssVUFBVSxZQUFZLENBQUM7QUFBQSwyQkFDcEMsS0FBSyxVQUFVLGFBQWEsS0FBSyxDQUFDO0FBQUEsNEJBQ2pDLGVBQWUsZ0JBQWdCLElBQUk7QUFBQSwyQkFDcEMsTUFBTTtBQUFBLGNBQ25CO0FBRUYsYUFBTyxXQUFXLFdBQVdBLE1BQUs7QUFBQSxJQUN0QztBQUFBLEVBQUEsQ0FDSDtBQUNMO0FBRUEsTUFBTSxpQkFBaUI7QUFBQSxFQUVuQixpQkFBaUIsQ0FBQyxVQUE4QztBQUU1RCxRQUFJLENBQUMsT0FBTztBQUNSO0FBQUEsSUFDSjtBQUVBLFVBQU0sb0JBQTRCLE1BQU0sWUFBWSxjQUFjLE1BQU0scUJBQXFCO0FBRTdGLFVBQU0sZUFBZSxDQUNqQkEsUUFDQSxvQkFDaUI7QUFFakIsYUFBT08sZ0JBQWU7QUFBQSxRQUNsQlA7QUFBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUjtBQUVBLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUFBO0FBQUEsRUFFUjtBQUFBLEVBRUEsZ0NBQWdDLENBQUMsVUFBOEM7QUFFM0UsUUFBSSxDQUFDLE9BQU87QUFDUjtBQUFBLElBQ0o7QUFFQSxVQUFNLG9CQUE0QixNQUFNLFlBQVksY0FBYyxNQUFNLHFCQUFxQjtBQUU3RixVQUFNLGVBQWUsQ0FDakJBLFFBQ0Esb0JBQ2lCO0FBRWpCLGFBQU9PLGdCQUFlO0FBQUEsUUFDbEJQO0FBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFFQSxXQUFPO0FBQUEsTUFDSDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFBQTtBQUFBLEVBRVI7QUFDSjtBQ3hIQSxNQUFNLGtCQUFrQixNQUFjO0FBRWxDLE1BQUksQ0FBQyxPQUFPLFdBQVc7QUFFbkIsV0FBTyxZQUFZLElBQUksVUFBQTtBQUFBLEVBQzNCO0FBRUEsUUFBTSxRQUFnQixJQUFJLE1BQUE7QUFDMUIsY0FBWSxzQkFBc0IsS0FBSztBQUV2QyxTQUFPO0FBQ1g7QUFFQSxNQUFNLHFCQUFxQixDQUFDLFVBQWtDO0FBRTFELE1BQUksQ0FBQyxNQUFNLFlBQVksY0FBYyxNQUFNO0FBRXZDLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSUwsV0FBRSxtQkFBbUIsTUFBTSxZQUFZLGNBQWMsS0FBSyxJQUFJLE1BQU0sU0FDaEUsQ0FBQyxNQUFNLFlBQVksY0FBYyxLQUFLLFdBQ25DLE1BQU0sWUFBWSxjQUFjLEtBQUssUUFBUSxXQUFXLElBQ2pFO0FBQ0UsV0FBTztBQUFBLEVBQ1g7QUFFQSxTQUFPO0FBQUEsSUFDSDtBQUFBLElBQ0EsZUFBZSxnQkFBZ0IsS0FBSztBQUFBLEVBQUE7QUFFNUM7QUFFQSxNQUFNLDZCQUE2QixDQUMvQixPQUNBLGdCQUNpQjtBQUVqQixRQUFNLFlBQVksY0FBYztBQUVoQyxlQUFhO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osUUFBTSxXQUFXLE1BQU0sWUFBWTtBQUVuQyxNQUFJLFNBQVMsV0FBVyxHQUFHO0FBRXZCLFdBQU87QUFBQSxFQUNYO0FBRUEsTUFBSSxTQUFTLFdBQVcsR0FBRztBQUV2QixVQUFNLElBQUksTUFBTSwwQkFBMEI7QUFBQSxFQUM5QztBQUVBLFFBQU0sY0FBYyxTQUFTLENBQUM7QUFFOUIsTUFBSSxDQUFDLFlBQVksTUFBTSxRQUFRO0FBRTNCLFVBQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUFBLEVBQzNDO0FBRUEsUUFBTSxlQUFlLFNBQVMsQ0FBQztBQUUvQixNQUFJLENBQUMsYUFBYSxNQUFNLFVBQ2pCLGFBQWEsTUFBTSxTQUFTLFlBQVksTUFDN0M7QUFDRSxVQUFNLElBQUksTUFBTSwrREFBK0Q7QUFBQSxFQUNuRjtBQUVBLFNBQU87QUFBQSxJQUNIO0FBQUEsSUFDQSxlQUFlLCtCQUErQixLQUFLO0FBQUEsRUFBQTtBQUUzRDtBQUVBLE1BQU0sWUFBWTtBQUFBLEVBRWQsWUFBWSxNQUFzQjtBQUU5QixVQUFNLFFBQWdCLGdCQUFBO0FBQ3RCLFVBQU0sY0FBc0IsT0FBTyxTQUFTO0FBRTVDLFFBQUk7QUFFQSxVQUFJLENBQUNBLFdBQUUsbUJBQW1CLFdBQVcsR0FBRztBQUVwQyxlQUFPO0FBQUEsVUFDSDtBQUFBLFVBQ0E7QUFBQSxRQUFBO0FBQUEsTUFFUjtBQUVBLGFBQU8sbUJBQW1CLEtBQUs7QUFBQSxJQUNuQyxTQUNPLEdBQVE7QUFFWCxZQUFNLGVBQWU7QUFFckIsY0FBUSxJQUFJLENBQUM7QUFFYixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFDSjtBQ2pIQSxNQUFNLGlCQUFpQjtBQUFBLEVBRW5CLHNCQUFzQixNQUFNO0FBRXhCLFVBQU0saUJBQWlDLFNBQVMsZUFBZSxRQUFRLGdCQUFnQjtBQUV2RixRQUFJLGtCQUNHLGVBQWUsY0FBQSxNQUFvQixNQUN4QztBQUNFLFVBQUk7QUFFSixlQUFTLElBQUksR0FBRyxJQUFJLGVBQWUsV0FBVyxRQUFRLEtBQUs7QUFFdkQsb0JBQVksZUFBZSxXQUFXLENBQUM7QUFFdkMsWUFBSSxVQUFVLGFBQWEsS0FBSyxjQUFjO0FBRTFDLGNBQUksQ0FBQyxPQUFPLFdBQVc7QUFFbkIsbUJBQU8sWUFBWSxJQUFJLFVBQUE7QUFBQSxVQUMzQjtBQUVBLGlCQUFPLFVBQVUsbUJBQW1CLFVBQVU7QUFDOUMsb0JBQVUsT0FBQTtBQUVWO0FBQUEsUUFDSixXQUNTLFVBQVUsYUFBYSxLQUFLLFdBQVc7QUFDNUM7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0o7QUM1QkEsV0FBVyxxQkFBQTtBQUNYLGVBQWUscUJBQUE7QUFFZCxPQUFlLHVCQUF1QixJQUFJO0FBQUEsRUFFdkMsTUFBTSxTQUFTLGVBQWUsb0JBQW9CO0FBQUEsRUFDbEQsTUFBTSxVQUFVO0FBQUEsRUFDaEIsTUFBTSxTQUFTO0FBQUEsRUFDZixlQUFlO0FBQUEsRUFDZixPQUFPLFdBQVc7QUFDdEIsQ0FBQzsifQ==
