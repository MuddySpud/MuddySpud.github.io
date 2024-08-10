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
  };
  dispatch(props.init);
};
const initSubscriptions = (state) => {
  if (!state) {
    return [];
  }
  const subscriptions = [];
  return subscriptions;
};
const initEvents = {
  onRenderFinished: () => {
  },
  registerGlobalEvents: () => {
    window.onresize = () => {
    };
  }
};
const gStateCode = {
  cloneState: (state) => {
    let newState = { ...state };
    return newState;
  }
};
const pentSideValidationCode = {
  validateValues: (pent) => {
    let alertText = "";
    if (pent.maxStudDistance == null) {
      alertText += `maxStudDistance is undefined
    `;
    }
    if (pent.framingSizePivot == null) {
      alertText += `framingSizePivot is undefined
    `;
    }
    if (pent.floorOverhangStandard == null) {
      alertText += `floorOverhangStandard is undefined
    `;
    }
    if (pent.floorOverhangHeavy == null) {
      alertText += `floorOverhangHeavy is undefined
    `;
    }
    if (pent.maxPanelLength == null) {
      alertText += `maxPanelLength is undefined
    `;
    }
    if (pent.floorDepth == null) {
      alertText += `floorDepth is undefined
    `;
    }
    if (pent.frontHeight == null) {
      alertText += `frontHeight is undefined
    `;
    }
    if (pent.backHeight == null) {
      alertText += `backHeight is undefined
    `;
    }
    if (pent.framingWidth == null) {
      alertText += `framingWidth is undefined
    `;
    }
    if (pent.framingDepth == null) {
      alertText += `framingDepth is undefined
    `;
    }
    if (pent.roofRailWidth == null) {
      alertText += `roofRailWidth is undefined
    `;
    }
    if (pent.roofRailDepth == null) {
      alertText += `roofRailDepth is undefined
    `;
    }
    if (pent.sideCount == null) {
      alertText += `sideCount is undefined
    `;
    }
    if (pent.buildPanelsTogether == null) {
      alertText += `buildPanelsTogether is undefined
    `;
    }
    if (pent.shiplapBottomOverhang == null) {
      alertText += `shiplapBottomOverhang is undefined
    `;
    }
    if (pent.shiplapButtingWidth == null) {
      alertText += `shiplapButtingWidth is undefined
    `;
    }
    if (pent.shiplapDepth == null) {
      alertText += `shiplapDepth is undefined
    `;
    }
    if (pent.maxStudDistance < 100 || pent.maxStudDistance > 1e3) {
      alertText += `maxStudDistance is less than 100 or greater than 1000
    `;
    }
    if (pent.framingSizePivot < 10 || pent.framingSizePivot > 1e3) {
      alertText += `framingSizePivot is undefined
    `;
    }
    if (pent.floorOverhangStandard < 1 || pent.floorOverhangStandard > 100) {
      alertText += `floorOverhangStandard is less than 1 or greater than 100
    `;
    }
    if (pent.floorOverhangHeavy < 1 || pent.floorOverhangHeavy > 100) {
      alertText += `floorOverhangHeavy is less than 100 or greater than 100
    `;
    }
    if (pent.maxPanelLength < 100 || pent.maxPanelLength > 5e3) {
      alertText += `maxPanelLength is less than 100 or greater than 5000
    `;
    }
    if (pent.floorDepth && (pent.floorDepth < 100 || pent.floorDepth > 2e4)) {
      alertText += `floorDepth is less than 100 or greater than 20000
    `;
    }
    if (pent.frontHeight && (pent.frontHeight < 100 || pent.frontHeight > 4e3)) {
      alertText += `frontHeight is less than 100 or greater than 4000
    `;
    }
    if (pent.backHeight && (pent.backHeight < 100 || pent.backHeight > 4e3)) {
      alertText += `backHeight is less than 100 or greater than 4000
    `;
    }
    if (pent.framingWidth < 10 || pent.framingWidth > 300) {
      alertText += `framingWidth is less than 10 or greater than 300
    `;
    }
    if (pent.framingDepth < 10 || pent.framingDepth > 300) {
      alertText += `framingDepth is less than 10 or greater than 300
    `;
    }
    if (pent.roofRailWidth < 10 || pent.roofRailWidth > 300) {
      alertText += `roofRailWidth is less than 10 or greater than 300
    `;
    }
    if (pent.roofRailDepth < 10 || pent.roofRailDepth > 300) {
      alertText += `roofRailDepth is less than 10 or greater than 300
    `;
    }
    if (pent.sideCount < 1 || pent.sideCount > 2) {
      alertText += `sideCount is less than 1 or greater than 2
    `;
    }
    if (pent.shiplapBottomOverhang < 1 || pent.shiplapBottomOverhang > 100) {
      alertText += `shiplapBottomOverhang is less than 1 or greater than 100
    `;
    }
    if (pent.shiplapButtingWidth < 10 || pent.shiplapButtingWidth > 1e3) {
      alertText += `shiplapButtingWidth is less than 10 or greater than 1000
    `;
    }
    if (pent.shiplapDepth < 10 || pent.shiplapDepth > 1e3) {
      alertText += `shiplapDepth is less than 10 or greater than 1000
    `;
    }
    if (alertText && alertText.length > 0) {
      alert(alertText);
    }
  }
};
let currentPageChildren = [];
let pages = [];
const addPage = () => {
  currentPageChildren = [];
  pages.push({
    type: "page",
    properties: {},
    value: currentPageChildren
  });
};
const addUiElement = (type, value, properties = null) => {
  currentPageChildren.push({
    type,
    properties,
    value
  });
};
const addUiChildElement = (parentArray, type, value, properties = null) => {
  parentArray.push({
    type,
    properties,
    value
  });
};
const calculateFrameUprightAdjustment = (horizontalDistanceFromFront, roofAngleRadians) => {
  const adjustment = horizontalDistanceFromFront * Math.tan(roofAngleRadians);
  return adjustment;
};
const printShiplapTimberRequirements = (printPanelName, shiplapButtingWidthInt, shiplapDepthInt) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Shiplap cutting list`
  );
  addUiElement(
    "h3",
    `Timber requirements:`,
    { class: "top-padded" }
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `Shiplap with a back butting width of ${shiplapButtingWidthInt}mm and depth of ${shiplapDepthInt}mm`
  );
};
const printShiplapCuttingList = (pent, printShiplapBoardCount, printFrameBottomLength, printPanelName = "") => {
  printShiplapTimberRequirements(
    printPanelName,
    pent.shiplapButtingWidth,
    pent.shiplapDepth
  );
  addUiElement(
    "h3",
    "Shiplap boards"
  );
  addUiElement(
    "p",
    "YY Cut both ends square."
  );
  addUiElement(
    "p",
    `Cut ${printShiplapBoardCount} lengths at the following measurement:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${printFrameBottomLength}mm`
  );
};
const printCladdingInstructions = (pent, printPanelName) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Shiplap cladding instructions`
  );
  addUiElement(
    "p",
    `Start at the panel bottom and work upwards.`
  );
  addUiElement(
    "p",
    `On pent sides the shiplap finishes flush with the frame.`
  );
  addUiElement(
    "p",
    `The first board must overhang the bottom rail downwards by bottom overhang shown below. Use a set square to make sure this is the case at both ends of the board.`
  );
  addUiElement(
    "p",
    `Make sure all shiplap edges are flush with the frame before fixing.`
  );
  addUiElement(
    "p",
    `Nail one board at a time while pulling down hard against the already fixed boards - to prevent any gaps between the boards showing on the inside shed when finished.`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `bottom overhang: ${pent.shiplapBottomOverhang}mm`
  );
};
const printFrameAssemblyInstructions = (printPanelName) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Frame assembly instructions`
  );
  addUiElement(
    "p",
    `Sides should be mirror images - BEWARE - an all too easy mistake to make is to build them as identical instead.
The best way to prevent this mistake, and indeed cladding ones, is to assemble all 4 sides on top of the floor and then mark CLEARLY the faces that need cladding and any cladding overlaps.
If this is not possible, place the two sides on top of each other with the sides you want cladded facing up. Make sure the 2 top slopes point in opposite directions. Then mark CLEARLY the top face of each side as the one needing cladding.`
  );
  addUiElement(
    "p",
    `Make sure all edges are flush before fixing.`
  );
  addUiElement(
    "p",
    `Use 2 screws to fix each end of an upright to the top and bottom rails.`
  );
  addUiElement(
    "p",
    `When screwing the 2 outer frame uprights pilot the top and bottom rails first, otherwise the rails will split.`
  );
  addUiElement(
    "p",
    `When piloting the top frame rail remember it is angled, so drill at the same slant as the slant on the cut face.`
  );
};
const printFrameTimberRequirements = (printPanelName, framingSize) => {
  addPage();
  if (printPanelName && printPanelName.length > 0) {
    addUiElement(
      "h1",
      `Panel ${printPanelName}`
    );
  }
  addUiElement(
    "h2",
    `Frame cutting list`
  );
  addUiElement(
    "h3",
    `Timber requirements:`,
    { class: "top-padded" }
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${framingSize} framing`
  );
};
const printFrameBottom = (printCountLengths, printPanelFrameBottomLength, framingSize, printPanelName = "") => {
  printFrameTimberRequirements(
    printPanelName,
    framingSize
  );
  addUiElement(
    "h3",
    "Frame bottom"
  );
  addUiElement(
    "p",
    "Cut both ends square."
  );
  addUiElement(
    "p",
    `Cut ${printCountLengths} of the following measurement:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${printPanelFrameBottomLength}mm`
  );
};
const printFrameTop = (printCountLengths, printPanelFrameTopLengthRoundedInt, roofAngleDegreesRounded, framingSize, printPanelName = "") => {
  printFrameTimberRequirements(
    printPanelName,
    framingSize
  );
  addUiElement(
    "h3",
    "Frame top"
  );
  addUiElement(
    "p",
    `Cut both ends at an angle of ${roofAngleDegreesRounded}°.`
  );
  addUiElement(
    "p",
    "The angled ends must be parallel - ie face in the same direction."
  );
  addUiElement(
    "p",
    `The angle should be on the shorter face of the framing - the depth.`
  );
  addUiElement(
    "p",
    `Cut ${printCountLengths} of the following measurement:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  addUiChildElement(
    children,
    "li",
    `${printPanelFrameTopLengthRoundedInt}mm`
  );
};
const printUprights = (printCountLengths, printPanelUprights, roofAngleDegreesRounded, framingSize, printPanelName = "") => {
  printFrameTimberRequirements(
    printPanelName,
    framingSize
  );
  addUiElement(
    "h3",
    "Frame uprights"
  );
  addUiElement(
    "p",
    `The top end will be cut at an angle, the bottom square.`
  );
  addUiElement(
    "p",
    `Start each length by cutting the top end at an angle of ${roofAngleDegreesRounded}°.`
  );
  addUiElement(
    "p",
    "Measure down from the peak of the angled cut and cut the bottom square."
  );
  addUiElement(
    "p",
    `The angle should be on the shorter face of the framing - the depth.`
  );
  addUiElement(
    "p",
    `Cut ${printCountLengths} of the following measurements:`
  );
  const children = [];
  addUiElement(
    "ul",
    children
  );
  for (let i = 0; i < printPanelUprights.length; i++) {
    addUiChildElement(
      children,
      "li",
      `${printPanelUprights[i]}mm`
    );
  }
};
const printSpacers = (pent, printPanelAvailableLength, printHorizontalStudSpacer, framingSize, printPanelIndex = 0, printPanelName = "") => {
  if (printPanelAvailableLength > pent.maxStudDistance) {
    printFrameTimberRequirements(
      printPanelName,
      framingSize
    );
    addUiElement(
      "h3",
      "Stud spacers"
    );
    addUiElement(
      "p",
      "Cut both ends square."
    );
    if (printPanelIndex === 0) {
      addUiElement(
        "p",
        `Cut 2 lengths of the following measurement:`
      );
    } else {
      addUiElement(
        "p",
        `Use the 2 spacers already cut with the following measurement:`
      );
    }
    const children = [];
    addUiElement(
      "ul",
      children
    );
    addUiChildElement(
      children,
      "li",
      `${printHorizontalStudSpacer}mm`
    );
  }
};
const printPanel = (pent, printCountLengths, printPanelFrameBottomLength, printPanelFrameTopLengthRoundedInt, printPanelUprights, printPanelAvailableLength, printHorizontalStudSpacer, printShiplapBoardCount, framingSize, roofAngleDegreesRounded, printPanelName = "", printPanelIndex = 0) => {
  printFrameBottom(
    printCountLengths,
    printPanelFrameBottomLength,
    framingSize,
    printPanelName
  );
  printFrameTop(
    printCountLengths,
    printPanelFrameTopLengthRoundedInt,
    roofAngleDegreesRounded,
    framingSize,
    printPanelName
  );
  printUprights(
    printCountLengths,
    printPanelUprights,
    roofAngleDegreesRounded,
    framingSize,
    printPanelName
  );
  printSpacers(
    pent,
    printPanelAvailableLength,
    printHorizontalStudSpacer,
    framingSize,
    printPanelIndex,
    printPanelName
  );
  printFrameAssemblyInstructions(printPanelName);
  printShiplapCuttingList(
    pent,
    printShiplapBoardCount,
    printPanelFrameBottomLength,
    printPanelName
  );
  printCladdingInstructions(
    pent,
    printPanelName
  );
};
const pentSideCalculationCode = {
  calculate: (state) => {
    pentSideValidationCode.validateValues(state.pent);
    pages = [];
    currentPageChildren = [];
    const pent = state.pent;
    pent.floorDepth = pent.floorDepth ?? 0;
    pent.frontHeight = pent.frontHeight ?? 0;
    pent.backHeight = pent.backHeight ?? 0;
    const floorOverhang = pent.framingWidth > pent.framingSizePivot ? pent.floorOverhangHeavy : pent.floorOverhangStandard;
    const frameBottomLength = pent.floorDepth + 2 * floorOverhang;
    const framingSize = `${pent.framingWidth}mm x ${pent.framingDepth}mm`;
    const adjustedFrameBottomLength = frameBottomLength - pent.framingWidth;
    const triangleHeight = pent.frontHeight - pent.backHeight;
    const roofAngleRadians = Math.atan2(triangleHeight, adjustedFrameBottomLength);
    const heightAdjustmentInt = pent.framingWidth * Math.tan(roofAngleRadians);
    const adjustedFrontHeightInt = pent.frontHeight + heightAdjustmentInt;
    const adjustedTriangleHeight = triangleHeight + heightAdjustmentInt;
    const roofAngleDegreesRounded = Math.round(roofAngleRadians * 180 / Math.PI);
    const angleAdjustedFrameDepth = pent.framingDepth / Math.cos(roofAngleRadians);
    const angleAdjustedRailWidth = pent.roofRailWidth / Math.cos(roofAngleRadians);
    const panelCountInt = Math.ceil(frameBottomLength / pent.maxPanelLength);
    const panelFrameTopLengthRoundedInt = Math.round(adjustedTriangleHeight / (Math.sin(roofAngleRadians) * panelCountInt));
    const sideFrameFrontLengthInt = adjustedFrontHeightInt - pent.framingDepth - angleAdjustedFrameDepth + angleAdjustedRailWidth;
    const panelAvailableLength = frameBottomLength - pent.framingDepth;
    const studDivisionCount = Math.floor(panelAvailableLength / pent.maxStudDistance) + 1;
    const horizontalSpacing = Math.round(panelAvailableLength / studDivisionCount);
    const horizontalStudSpacer = horizontalSpacing - pent.framingDepth;
    const spacingAdjustment = calculateFrameUprightAdjustment(
      horizontalSpacing,
      roofAngleRadians
    );
    const frameDepthAdjustment = calculateFrameUprightAdjustment(
      pent.framingDepth,
      roofAngleRadians
    );
    const shiplapBoardCounts = [];
    const sideUprights = [];
    let panelUprights;
    let runningAdjustment = 0;
    let uprightHeightRounded = 0;
    let shiplapBoardCount = 0;
    for (let i = 0; i < panelCountInt; i++) {
      panelUprights = [];
      for (let j = 0; j <= studDivisionCount; j++) {
        uprightHeightRounded = Math.round(sideFrameFrontLengthInt - runningAdjustment);
        if (j === 0) {
          shiplapBoardCount = Math.ceil((uprightHeightRounded + pent.shiplapBottomOverhang) / pent.shiplapButtingWidth);
          shiplapBoardCounts.push(shiplapBoardCount);
        }
        panelUprights.push(uprightHeightRounded);
        runningAdjustment += spacingAdjustment;
      }
      sideUprights.push(panelUprights);
      runningAdjustment += frameDepthAdjustment;
    }
    if (pent.buildPanelsTogether === true) {
      const lengthsCountInt = pent.sideCount * panelCountInt;
      let lengthsCount = `${lengthsCountInt} length`;
      if (lengthsCountInt > 1) {
        lengthsCount = `${lengthsCount}s`;
      }
      let sideShiplapBoardCount = 0;
      for (let m = 0; m < shiplapBoardCounts.length; m++) {
        sideShiplapBoardCount += shiplapBoardCounts[m];
      }
      printPanel(
        pent,
        lengthsCount,
        frameBottomLength,
        panelFrameTopLengthRoundedInt,
        sideUprights.flat(),
        panelAvailableLength,
        horizontalStudSpacer,
        sideShiplapBoardCount,
        framingSize,
        roofAngleDegreesRounded
      );
    } else {
      for (let k = 0; k < panelCountInt; k++) {
        let panelLengthsCount = `${pent.sideCount} length`;
        if (pent.sideCount > 1) {
          panelLengthsCount = `${panelLengthsCount}s`;
        }
        printPanel(
          pent,
          panelLengthsCount,
          frameBottomLength,
          panelFrameTopLengthRoundedInt,
          sideUprights[k],
          panelAvailableLength,
          horizontalStudSpacer,
          shiplapBoardCounts[k],
          framingSize,
          roofAngleDegreesRounded,
          `A${k + 1}`,
          k
        );
      }
    }
    state.pages = pages;
    state.currentPageIndex = 0;
  }
};
const pentSideActions = {
  setFloorDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.floorDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setFrontHeight: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.frontHeight = +element.value;
    return gStateCode.cloneState(state);
  },
  setBackHeight: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.backHeight = +element.value;
    return gStateCode.cloneState(state);
  },
  setFramingWidth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.framingWidth = +element.value;
    return gStateCode.cloneState(state);
  },
  setFramingDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.framingDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setRoofRailWidth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.roofRailWidth = +element.value;
    return gStateCode.cloneState(state);
  },
  setRoofRailDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.roofRailDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setSideCount: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.sideCount = +element.value;
    return gStateCode.cloneState(state);
  },
  // setBuildPanelsTogether: (
  //     state: IState,
  //     value: boolean
  // ): IState => {
  //     if (!element) {
  //         return state;
  //     }
  //     state.pent.buildPanelsTogether = value;
  //     return gStateCode.cloneState(state);
  // },
  setShiplapBottomOverhang: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.shiplapBottomOverhang = +element.value;
    return gStateCode.cloneState(state);
  },
  setShiplapButtingWidth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.shiplapButtingWidth = +element.value;
    return gStateCode.cloneState(state);
  },
  setShiplapDepth: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.shiplapDepth = +element.value;
    return gStateCode.cloneState(state);
  },
  setMaxStudDistance: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.maxStudDistance = +element.value;
    return gStateCode.cloneState(state);
  },
  setFramingSizePivot: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.framingSizePivot = +element.value;
    return gStateCode.cloneState(state);
  },
  setFloorOverhangStandard: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.floorOverhangStandard = +element.value;
    return gStateCode.cloneState(state);
  },
  setFloorOverhangHeavy: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.floorOverhangHeavy = +element.value;
    return gStateCode.cloneState(state);
  },
  setMaxPanelLength: (state, element) => {
    if (!element) {
      return state;
    }
    state.pent.maxPanelLength = +element.value;
    return gStateCode.cloneState(state);
  },
  minimiseDefaults: (state) => {
    state.showDefaults = state.showDefaults !== true;
    return gStateCode.cloneState(state);
  },
  nextPage: (state) => {
    state.currentPageIndex++;
    if (state.currentPageIndex > state.pages.length - 1) {
      state.currentPageIndex = state.pages.length - 1;
    }
    return gStateCode.cloneState(state);
  },
  previousPage: (state) => {
    state.currentPageIndex--;
    if (state.currentPageIndex < -1) {
      state.currentPageIndex = -1;
    }
    return gStateCode.cloneState(state);
  },
  calculate: (state) => {
    pentSideCalculationCode.calculate(state);
    return gStateCode.cloneState(state);
  }
};
const inputViews = {
  buildNumberView: (id, value, required, label, placeholder, error, action) => {
    const view = h("div", { class: "nft-i-numeric" }, [
      h("h4", {}, `${label}`),
      h("div", { class: "input-wrapper" }, [
        h("div", { class: "title-table" }, [
          h("div", { class: "title-row" }, [
            h("div", { class: "title-cell" }, [
              h("div", { class: "error" }, `${error ?? ""}`)
            ])
          ])
        ]),
        h(
          "input",
          {
            id: `${id}`,
            value: `${value ?? 0}`,
            required: required === true,
            tabindex: 0,
            // if this is not set it is not focusable
            // min: rangeMin,
            // max: rangeMax,
            type: "text",
            placeholder: `${placeholder}`,
            onInput: [
              action,
              (event) => {
                return event.target;
              }
            ]
          },
          ""
        )
      ])
    ]);
    return view;
  },
  buildSelectView: (selectedValue, label, placeholder, optionValues, action) => {
    let selectClasses = "nft-i-select";
    let selected = false;
    let selectionMade = false;
    const optionViews = [
      h(
        "option",
        {
          class: "select-default",
          value: ""
        },
        `--select ${placeholder}--`
      )
    ];
    optionValues.forEach((choice) => {
      if (choice === selectedValue) {
        selected = true;
        selectionMade = true;
      } else {
        selected = false;
      }
      optionViews.push(
        h(
          "option",
          {
            value: `${choice}`,
            selected
          },
          `${choice}`
        )
      );
    });
    if (selectionMade) {
      selectClasses = `${selectClasses} selected`;
    }
    const view = h(
      "div",
      {
        class: `${selectClasses}`,
        onChange: [
          action,
          (event) => {
            return event.target;
          }
        ]
      },
      [
        h("h4", {}, `${label}`),
        h("select", {}, optionViews)
      ]
    );
    return view;
  }
};
const buildShowHideButton = (state) => {
  let label;
  if (!state.showDefaults) {
    label = "Show defaults";
  } else {
    label = "Hide defaults";
  }
  const view = h(
    "button",
    {
      type: "button",
      onClick: pentSideActions.minimiseDefaults
    },
    `${label}`
  );
  return view;
};
const buildInputsView = (state) => {
  const view = [
    inputViews.buildNumberView(
      "maxStudDistance",
      state.pent.maxStudDistance,
      true,
      "Max inter-stud distance (mm)",
      "Max inter-stud distance",
      state.pent.maxStudDistanceError,
      pentSideActions.setMaxStudDistance
    ),
    inputViews.buildNumberView(
      "framingSizePivot",
      state.pent.framingSizePivot,
      true,
      "Framing pivot standard to heavy (mm)",
      "Framing pivot standard to heavy",
      state.pent.framingSizePivotError,
      pentSideActions.setFramingSizePivot
    ),
    inputViews.buildNumberView(
      "floorOverhangStandard",
      state.pent.floorOverhangStandard,
      true,
      "Panel floor overhang (mm)",
      "Panel floor overhang",
      state.pent.floorOverhangStandardError,
      pentSideActions.setFloorOverhangStandard
    ),
    inputViews.buildNumberView(
      "floorOverhangHeavy",
      state.pent.floorOverhangHeavy,
      true,
      "Heavy duty panel floor overhang (mm)",
      "Heavy duty floor overhang",
      state.pent.floorOverhangHeavyError,
      pentSideActions.setFloorOverhangHeavy
    ),
    inputViews.buildNumberView(
      "shiplapBottomOverhang",
      state.pent.shiplapBottomOverhang,
      true,
      "Shiplap bottom overhang (mm)",
      "Shiplap bottom overhang",
      state.pent.shiplapBottomOverhangError,
      pentSideActions.setShiplapBottomOverhang
    ),
    inputViews.buildNumberView(
      "maxPanelLength",
      state.pent.maxPanelLength,
      true,
      "Max side length (mm)",
      "Max side length",
      state.pent.maxPanelLengthError,
      pentSideActions.setMaxPanelLength
    )
  ];
  return view;
};
const buildMinimisedView = (state) => {
  const view = h("div", { class: "nft-collapse-group minimised" }, [
    buildShowHideButton(state)
  ]);
  return view;
};
const buildMaximisedView = (state) => {
  const view = h("div", { class: "nft-collapse-group" }, [
    buildShowHideButton(state),
    ...buildInputsView(state)
  ]);
  return view;
};
const defaultViews = {
  buildView: (state) => {
    if (!state.showDefaults) {
      return buildMinimisedView(state);
    } else {
      return buildMaximisedView(state);
    }
  }
};
const shedViews = {
  buildView: (state) => {
    const view = h("div", { class: "nft-display-group" }, [
      h("h4", { class: "label" }, "Shed"),
      h("div", { class: "display-contents" }, [
        inputViews.buildNumberView(
          "floorDepth",
          state.pent.floorDepth,
          true,
          "Floor depth (mm)",
          "Floor depth",
          state.pent.floorDepthError,
          pentSideActions.setFloorDepth
        ),
        inputViews.buildNumberView(
          "frontHeight",
          state.pent.frontHeight,
          true,
          "Front height (mm)",
          "Front height",
          state.pent.frontHeightError,
          pentSideActions.setFrontHeight
        ),
        inputViews.buildNumberView(
          "backHeight",
          state.pent.backHeight,
          true,
          "Back height (mm)",
          "Back height",
          state.pent.backHeightError,
          pentSideActions.setBackHeight
        ),
        inputViews.buildSelectView(
          `${state.pent.sideCount}`,
          "Side build count",
          "side build count",
          ["1", "2"],
          pentSideActions.setSideCount
        )
      ])
    ]);
    return view;
  }
};
const shedDisplayViews = {
  buildView: (state) => {
    const view = h("div", { class: "nft-display-group" }, [
      h("h4", { class: "label" }, "Timber"),
      h("div", { class: "display-contents" }, [
        inputViews.buildNumberView(
          "framingWidth",
          state.pent.framingWidth,
          true,
          "Framing timber width (mm)",
          "Framing timber width",
          state.pent.framingWidthError,
          pentSideActions.setFramingWidth
        ),
        inputViews.buildNumberView(
          "framingDepth",
          state.pent.framingDepth,
          true,
          "Framing timber depth (mm)",
          "Framing timber depth",
          state.pent.framingDepthError,
          pentSideActions.setFramingDepth
        ),
        inputViews.buildNumberView(
          "roofRailWidth",
          state.pent.roofRailWidth,
          true,
          "Roof rail timber width (mm)",
          "Roof rail timber width",
          state.pent.roofRailWidthError,
          pentSideActions.setRoofRailWidth
        ),
        inputViews.buildNumberView(
          "roofRailDepth",
          state.pent.roofRailDepth,
          true,
          "Roof rail timber depth (mm)",
          "Roof rail timber depth",
          state.pent.roofRailDepthError,
          pentSideActions.setRoofRailDepth
        ),
        inputViews.buildNumberView(
          "shiplapButtingWidth",
          state.pent.shiplapButtingWidth,
          true,
          "Shiplap butting width (mm)",
          "Shiplap butting width",
          state.pent.shiplapButtingWidthError,
          pentSideActions.setShiplapButtingWidth
        ),
        inputViews.buildNumberView(
          "shiplapDepth",
          state.pent.shiplapDepth,
          true,
          "Shiplap depth (mm)",
          "Shiplap depth",
          state.pent.shiplapDepthError,
          pentSideActions.setShiplapDepth
        )
      ])
    ]);
    return view;
  }
};
const pentSideInputViews = {
  buildView: (state) => {
    const view = h("div", { id: "stepView" }, [
      h("div", { class: "step-discussion" }, [
        h("div", { class: "discussion" }, [
          h("h4", { class: "title-text" }, "Pent shed side calculator"),
          h("div", { id: "inputView" }, [
            defaultViews.buildView(state),
            shedViews.buildView(state),
            shedDisplayViews.buildView(state)
          ])
        ])
      ]),
      h("div", { class: "step-options" }, [
        h(
          "a",
          {
            class: "option",
            onClick: pentSideActions.calculate
          },
          [
            h(
              "p",
              {},
              "Calculate"
            )
          ]
        )
      ])
    ]);
    return view;
  }
};
const buildPatternView = (views, node) => {
  if (node.value) {
    if (Array.isArray(node.value)) {
      views.push(
        h(
          node.type,
          node.properties,
          elementViews.buildView(node.value)
        )
      );
    } else {
      views.push(
        h(
          node.type,
          node.properties,
          node.value
        )
      );
    }
  }
};
const elementViews = {
  buildView: (viewPatterns) => {
    const views = [];
    for (let i = 0; i < viewPatterns.length; i++) {
      buildPatternView(
        views,
        viewPatterns[i]
      );
    }
    return views;
  }
};
const buildPageBackwards = (_state) => {
  const view = h(
    "a",
    {
      onClick: pentSideActions.previousPage
    },
    [
      h("div", { class: "page-backwards-icon" }, "")
    ]
  );
  return view;
};
const buildPageForwards = (state) => {
  if (state.currentPageIndex >= state.pages.length - 1) {
    return null;
  }
  const view = h(
    "a",
    {
      onClick: pentSideActions.nextPage
    },
    [
      h("div", { class: "page-forwards-icon" }, "")
    ]
  );
  return view;
};
const pentSidePagesView = {
  buildPageView: (state) => {
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage.value || !Array.isArray(currentPage.value)) {
      return null;
    }
    const view = h("div", { id: "stepView" }, [
      h("div", { class: "step-discussion" }, [
        h("div", { class: "discussion" }, [
          h("h4", { class: "title-text" }, "Pent side"),
          h("div", { id: "inputView" }, [
            h("div", { class: "nft-i-pattern" }, [
              h("div", { class: "nft-i-page" }, [
                elementViews.buildView(currentPage.value)
              ])
            ])
          ])
        ])
      ]),
      h("div", { class: "step-page-buttons" }, [
        h(
          "div",
          { class: "page-backwards" },
          buildPageBackwards()
        ),
        h(
          "div",
          { class: "page-forwards" },
          buildPageForwards(state)
        )
      ])
    ]);
    return view;
  }
};
const pentSideViews = {
  buildView: (state) => {
    if (state.pages && state.pages.length > 0 && state.currentPageIndex > -1) {
      return pentSidePagesView.buildPageView(state);
    } else {
      return pentSideInputViews.buildView(state);
    }
  }
};
const initView = {
  buildView: (state) => {
    const view = h(
      "div",
      { id: "treeSolveAuthor" },
      pentSideViews.buildView(state)
    );
    return view;
  }
};
class Pent {
  constructor() {
    // defaults
    __publicField(this, "maxStudDistance", 400);
    __publicField(this, "framingSizePivot", 50);
    __publicField(this, "floorOverhangStandard", 10);
    __publicField(this, "floorOverhangHeavy", 15);
    __publicField(this, "maxPanelLength", 4e3);
    __publicField(this, "buildPanelsTogether", false);
    // shed measurements
    __publicField(this, "floorDepth", 0);
    __publicField(this, "frontHeight", 0);
    __publicField(this, "backHeight", 0);
    // frame sizes
    __publicField(this, "framingWidth", 45);
    __publicField(this, "framingDepth", 33);
    __publicField(this, "roofRailWidth", 69);
    __publicField(this, "roofRailDepth", 34);
    __publicField(this, "shiplapBottomOverhang", 35);
    __publicField(this, "shiplapButtingWidth", 112);
    __publicField(this, "shiplapDepth", 12);
    __publicField(this, "sideCount", 2);
    __publicField(this, "maxStudDistanceError", null);
    __publicField(this, "framingSizePivotError", null);
    __publicField(this, "floorOverhangStandardError", null);
    __publicField(this, "floorOverhangHeavyError", null);
    __publicField(this, "maxPanelLengthError", null);
    __publicField(this, "buildPanelsTogetherError", null);
    // shed measurements
    __publicField(this, "floorDepthError", null);
    __publicField(this, "frontHeightError", null);
    __publicField(this, "backHeightError", null);
    __publicField(this, "framingWidthError", null);
    __publicField(this, "framingDepthError", null);
    // frame sizes
    __publicField(this, "roofRailWidthError", null);
    __publicField(this, "roofRailDepthError", null);
    __publicField(this, "shiplapBottomOverhangError", null);
    __publicField(this, "shiplapButtingWidthError", null);
    __publicField(this, "shiplapDepthError", null);
    __publicField(this, "sideCountError", null);
  }
}
class State {
  constructor() {
    __publicField(this, "pent", new Pent());
    __publicField(this, "showDefaults", false);
    __publicField(this, "pages", []);
    __publicField(this, "currentPageIndex", 0);
  }
}
const initState = {
  initialise: () => {
    const state = new State();
    return state;
  }
};
initEvents.registerGlobalEvents();
window.CompositeFlowsAuthor = app({
  node: document.getElementById("treeSolveAuthor"),
  init: initState.initialise,
  view: initView.buildView,
  subscriptions: initSubscriptions,
  onEnd: initEvents.onRenderFinished
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3Jvb3Qvc3JjL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbC5qcyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3N1YnNjcmlwdGlvbnMvaW5pdFN1YnNjcmlwdGlvbnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2dsb2JhbC9jb2RlL2dTdGF0ZUNvZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvY29kZS9wZW50U2lkZVZhbGlkYXRpb25Db2RlLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL3BlbnRTaWRlL2NvZGUvcGVudFNpZGVDYWxjdWxhdGlvbkNvZGUudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvYWN0aW9ucy9wZW50U2lkZUFjdGlvbnMudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3MvaW5wdXRWaWV3cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9wZW50U2lkZS92aWV3cy9kZWZhdWx0Vmlld3MudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3Mvc2hlZFZpZXdzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL3BlbnRTaWRlL3ZpZXdzL3RpbWJlclZpZXdzLnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9jb21wb25lbnRzL3BlbnRTaWRlL3ZpZXdzL3BlbnRTaWRlSW5wdXRWaWV3cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9wZW50U2lkZS92aWV3cy9lbGVtZW50Vmlld3MudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3MvcGVudFNpZGVQYWdlc1ZpZXcudHMiLCIuLi8uLi9yb290L3NyYy9tb2R1bGVzL2NvbXBvbmVudHMvcGVudFNpZGUvdmlld3MvcGVudFNpZGVWaWV3cy50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3ZpZXdzL2luaXRWaWV3LnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9QZW50LnRzIiwiLi4vLi4vcm9vdC9zcmMvbW9kdWxlcy9zdGF0ZS9TdGF0ZS50cyIsIi4uLy4uL3Jvb3Qvc3JjL21vZHVsZXMvY29tcG9uZW50cy9pbml0L2NvZGUvaW5pdFN0YXRlLnRzIiwiLi4vLi4vcm9vdC9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIFJFQ1lDTEVEX05PREUgPSAxXHJcbnZhciBMQVpZX05PREUgPSAyXHJcbnZhciBURVhUX05PREUgPSAzXHJcbnZhciBFTVBUWV9PQkogPSB7fVxyXG52YXIgRU1QVFlfQVJSID0gW11cclxudmFyIG1hcCA9IEVNUFRZX0FSUi5tYXBcclxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XHJcbnZhciBkZWZlciA9XHJcbiAgdHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcclxuICAgIDogc2V0VGltZW91dFxyXG5cclxudmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24ob2JqKSB7XHJcbiAgdmFyIG91dCA9IFwiXCJcclxuXHJcbiAgaWYgKHR5cGVvZiBvYmogPT09IFwic3RyaW5nXCIpIHJldHVybiBvYmpcclxuXHJcbiAgaWYgKGlzQXJyYXkob2JqKSAmJiBvYmoubGVuZ3RoID4gMCkge1xyXG4gICAgZm9yICh2YXIgayA9IDAsIHRtcDsgayA8IG9iai5sZW5ndGg7IGsrKykge1xyXG4gICAgICBpZiAoKHRtcCA9IGNyZWF0ZUNsYXNzKG9ialtrXSkpICE9PSBcIlwiKSB7XHJcbiAgICAgICAgb3V0ICs9IChvdXQgJiYgXCIgXCIpICsgdG1wXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcclxuICAgICAgaWYgKG9ialtrXSkge1xyXG4gICAgICAgIG91dCArPSAob3V0ICYmIFwiIFwiKSArIGtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG91dFxyXG59XHJcblxyXG52YXIgbWVyZ2UgPSBmdW5jdGlvbihhLCBiKSB7XHJcbiAgdmFyIG91dCA9IHt9XHJcblxyXG4gIGZvciAodmFyIGsgaW4gYSkgb3V0W2tdID0gYVtrXVxyXG4gIGZvciAodmFyIGsgaW4gYikgb3V0W2tdID0gYltrXVxyXG5cclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbnZhciBiYXRjaCA9IGZ1bmN0aW9uKGxpc3QpIHtcclxuICByZXR1cm4gbGlzdC5yZWR1Y2UoZnVuY3Rpb24ob3V0LCBpdGVtKSB7XHJcbiAgICByZXR1cm4gb3V0LmNvbmNhdChcclxuICAgICAgIWl0ZW0gfHwgaXRlbSA9PT0gdHJ1ZVxyXG4gICAgICAgID8gMFxyXG4gICAgICAgIDogdHlwZW9mIGl0ZW1bMF0gPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgID8gW2l0ZW1dXHJcbiAgICAgICAgOiBiYXRjaChpdGVtKVxyXG4gICAgKVxyXG4gIH0sIEVNUFRZX0FSUilcclxufVxyXG5cclxudmFyIGlzU2FtZUFjdGlvbiA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICByZXR1cm4gaXNBcnJheShhKSAmJiBpc0FycmF5KGIpICYmIGFbMF0gPT09IGJbMF0gJiYgdHlwZW9mIGFbMF0gPT09IFwiZnVuY3Rpb25cIlxyXG59XHJcblxyXG52YXIgc2hvdWxkUmVzdGFydCA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICBpZiAoYSAhPT0gYikge1xyXG4gICAgZm9yICh2YXIgayBpbiBtZXJnZShhLCBiKSkge1xyXG4gICAgICBpZiAoYVtrXSAhPT0gYltrXSAmJiAhaXNTYW1lQWN0aW9uKGFba10sIGJba10pKSByZXR1cm4gdHJ1ZVxyXG4gICAgICBiW2tdID0gYVtrXVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxudmFyIHBhdGNoU3VicyA9IGZ1bmN0aW9uKG9sZFN1YnMsIG5ld1N1YnMsIGRpc3BhdGNoKSB7XHJcbiAgZm9yIChcclxuICAgIHZhciBpID0gMCwgb2xkU3ViLCBuZXdTdWIsIHN1YnMgPSBbXTtcclxuICAgIGkgPCBvbGRTdWJzLmxlbmd0aCB8fCBpIDwgbmV3U3Vicy5sZW5ndGg7XHJcbiAgICBpKytcclxuICApIHtcclxuICAgIG9sZFN1YiA9IG9sZFN1YnNbaV1cclxuICAgIG5ld1N1YiA9IG5ld1N1YnNbaV1cclxuICAgIHN1YnMucHVzaChcclxuICAgICAgbmV3U3ViXHJcbiAgICAgICAgPyAhb2xkU3ViIHx8XHJcbiAgICAgICAgICBuZXdTdWJbMF0gIT09IG9sZFN1YlswXSB8fFxyXG4gICAgICAgICAgc2hvdWxkUmVzdGFydChuZXdTdWJbMV0sIG9sZFN1YlsxXSlcclxuICAgICAgICAgID8gW1xyXG4gICAgICAgICAgICAgIG5ld1N1YlswXSxcclxuICAgICAgICAgICAgICBuZXdTdWJbMV0sXHJcbiAgICAgICAgICAgICAgbmV3U3ViWzBdKGRpc3BhdGNoLCBuZXdTdWJbMV0pLFxyXG4gICAgICAgICAgICAgIG9sZFN1YiAmJiBvbGRTdWJbMl0oKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICA6IG9sZFN1YlxyXG4gICAgICAgIDogb2xkU3ViICYmIG9sZFN1YlsyXSgpXHJcbiAgICApXHJcbiAgfVxyXG4gIHJldHVybiBzdWJzXHJcbn1cclxuXHJcbnZhciBwYXRjaFByb3BlcnR5ID0gZnVuY3Rpb24obm9kZSwga2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUsIGxpc3RlbmVyLCBpc1N2Zykge1xyXG4gIGlmIChrZXkgPT09IFwia2V5XCIpIHtcclxuICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHlsZVwiKSB7XHJcbiAgICBmb3IgKHZhciBrIGluIG1lcmdlKG9sZFZhbHVlLCBuZXdWYWx1ZSkpIHtcclxuICAgICAgb2xkVmFsdWUgPSBuZXdWYWx1ZSA9PSBudWxsIHx8IG5ld1ZhbHVlW2tdID09IG51bGwgPyBcIlwiIDogbmV3VmFsdWVba11cclxuICAgICAgaWYgKGtbMF0gPT09IFwiLVwiKSB7XHJcbiAgICAgICAgbm9kZVtrZXldLnNldFByb3BlcnR5KGssIG9sZFZhbHVlKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGVba2V5XVtrXSA9IG9sZFZhbHVlXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2UgaWYgKGtleVswXSA9PT0gXCJvXCIgJiYga2V5WzFdID09PSBcIm5cIikge1xyXG4gICAgaWYgKFxyXG4gICAgICAhKChub2RlLmFjdGlvbnMgfHwgKG5vZGUuYWN0aW9ucyA9IHt9KSlbXHJcbiAgICAgICAgKGtleSA9IGtleS5zbGljZSgyKS50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICBdID0gbmV3VmFsdWUpXHJcbiAgICApIHtcclxuICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGtleSwgbGlzdGVuZXIpXHJcbiAgICB9IGVsc2UgaWYgKCFvbGRWYWx1ZSkge1xyXG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoa2V5LCBsaXN0ZW5lcilcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKCFpc1N2ZyAmJiBrZXkgIT09IFwibGlzdFwiICYmIGtleSBpbiBub2RlKSB7XHJcbiAgICBub2RlW2tleV0gPSBuZXdWYWx1ZSA9PSBudWxsIHx8IG5ld1ZhbHVlID09IFwidW5kZWZpbmVkXCIgPyBcIlwiIDogbmV3VmFsdWVcclxuICB9IGVsc2UgaWYgKFxyXG4gICAgbmV3VmFsdWUgPT0gbnVsbCB8fFxyXG4gICAgbmV3VmFsdWUgPT09IGZhbHNlIHx8XHJcbiAgICAoa2V5ID09PSBcImNsYXNzXCIgJiYgIShuZXdWYWx1ZSA9IGNyZWF0ZUNsYXNzKG5ld1ZhbHVlKSkpXHJcbiAgKSB7XHJcbiAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShrZXkpXHJcbiAgfSBlbHNlIHtcclxuICAgIG5vZGUuc2V0QXR0cmlidXRlKGtleSwgbmV3VmFsdWUpXHJcbiAgfVxyXG59XHJcblxyXG52YXIgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKHZkb20sIGxpc3RlbmVyLCBpc1N2Zykge1xyXG4gIHZhciBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxyXG4gIHZhciBwcm9wcyA9IHZkb20ucHJvcHNcclxuICB2YXIgbm9kZSA9XHJcbiAgICB2ZG9tLnR5cGUgPT09IFRFWFRfTk9ERVxyXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZkb20ubmFtZSlcclxuICAgICAgOiAoaXNTdmcgPSBpc1N2ZyB8fCB2ZG9tLm5hbWUgPT09IFwic3ZnXCIpXHJcbiAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCB2ZG9tLm5hbWUsIHsgaXM6IHByb3BzLmlzIH0pXHJcbiAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh2ZG9tLm5hbWUsIHsgaXM6IHByb3BzLmlzIH0pXHJcblxyXG4gIGZvciAodmFyIGsgaW4gcHJvcHMpIHtcclxuICAgIHBhdGNoUHJvcGVydHkobm9kZSwgaywgbnVsbCwgcHJvcHNba10sIGxpc3RlbmVyLCBpc1N2ZylcclxuICB9XHJcblxyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB2ZG9tLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICBub2RlLmFwcGVuZENoaWxkKFxyXG4gICAgICBjcmVhdGVOb2RlKFxyXG4gICAgICAgICh2ZG9tLmNoaWxkcmVuW2ldID0gZ2V0Vk5vZGUodmRvbS5jaGlsZHJlbltpXSkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcblxyXG4gIHJldHVybiAodmRvbS5ub2RlID0gbm9kZSlcclxufVxyXG5cclxudmFyIGdldEtleSA9IGZ1bmN0aW9uKHZkb20pIHtcclxuICByZXR1cm4gdmRvbSA9PSBudWxsID8gbnVsbCA6IHZkb20ua2V5XHJcbn1cclxuXHJcbnZhciBwYXRjaCA9IGZ1bmN0aW9uKHBhcmVudCwgbm9kZSwgb2xkVk5vZGUsIG5ld1ZOb2RlLCBsaXN0ZW5lciwgaXNTdmcpIHtcclxuICBpZiAob2xkVk5vZGUgPT09IG5ld1ZOb2RlKSB7XHJcbiAgfSBlbHNlIGlmIChcclxuICAgIG9sZFZOb2RlICE9IG51bGwgJiZcclxuICAgIG9sZFZOb2RlLnR5cGUgPT09IFRFWFRfTk9ERSAmJlxyXG4gICAgbmV3Vk5vZGUudHlwZSA9PT0gVEVYVF9OT0RFXHJcbiAgKSB7XHJcbiAgICBpZiAob2xkVk5vZGUubmFtZSAhPT0gbmV3Vk5vZGUubmFtZSkgbm9kZS5ub2RlVmFsdWUgPSBuZXdWTm9kZS5uYW1lXHJcbiAgfSBlbHNlIGlmIChvbGRWTm9kZSA9PSBudWxsIHx8IG9sZFZOb2RlLm5hbWUgIT09IG5ld1ZOb2RlLm5hbWUpIHtcclxuICAgIG5vZGUgPSBwYXJlbnQuaW5zZXJ0QmVmb3JlKFxyXG4gICAgICBjcmVhdGVOb2RlKChuZXdWTm9kZSA9IGdldFZOb2RlKG5ld1ZOb2RlKSksIGxpc3RlbmVyLCBpc1N2ZyksXHJcbiAgICAgIG5vZGVcclxuICAgIClcclxuICAgIGlmIChvbGRWTm9kZSAhPSBudWxsKSB7XHJcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChvbGRWTm9kZS5ub2RlKVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB2YXIgdG1wVktpZFxyXG4gICAgdmFyIG9sZFZLaWRcclxuXHJcbiAgICB2YXIgb2xkS2V5XHJcbiAgICB2YXIgbmV3S2V5XHJcblxyXG4gICAgdmFyIG9sZFZQcm9wcyA9IG9sZFZOb2RlLnByb3BzXHJcbiAgICB2YXIgbmV3VlByb3BzID0gbmV3Vk5vZGUucHJvcHNcclxuXHJcbiAgICB2YXIgb2xkVktpZHMgPSBvbGRWTm9kZS5jaGlsZHJlblxyXG4gICAgdmFyIG5ld1ZLaWRzID0gbmV3Vk5vZGUuY2hpbGRyZW5cclxuXHJcbiAgICB2YXIgb2xkSGVhZCA9IDBcclxuICAgIHZhciBuZXdIZWFkID0gMFxyXG4gICAgdmFyIG9sZFRhaWwgPSBvbGRWS2lkcy5sZW5ndGggLSAxXHJcbiAgICB2YXIgbmV3VGFpbCA9IG5ld1ZLaWRzLmxlbmd0aCAtIDFcclxuXHJcbiAgICBpc1N2ZyA9IGlzU3ZnIHx8IG5ld1ZOb2RlLm5hbWUgPT09IFwic3ZnXCJcclxuXHJcbiAgICBmb3IgKHZhciBpIGluIG1lcmdlKG9sZFZQcm9wcywgbmV3VlByb3BzKSkge1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKGkgPT09IFwidmFsdWVcIiB8fCBpID09PSBcInNlbGVjdGVkXCIgfHwgaSA9PT0gXCJjaGVja2VkXCJcclxuICAgICAgICAgID8gbm9kZVtpXVxyXG4gICAgICAgICAgOiBvbGRWUHJvcHNbaV0pICE9PSBuZXdWUHJvcHNbaV1cclxuICAgICAgKSB7XHJcbiAgICAgICAgcGF0Y2hQcm9wZXJ0eShub2RlLCBpLCBvbGRWUHJvcHNbaV0sIG5ld1ZQcm9wc1tpXSwgbGlzdGVuZXIsIGlzU3ZnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCAmJiBvbGRIZWFkIDw9IG9sZFRhaWwpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChvbGRLZXkgPSBnZXRLZXkob2xkVktpZHNbb2xkSGVhZF0pKSA9PSBudWxsIHx8XHJcbiAgICAgICAgb2xkS2V5ICE9PSBnZXRLZXkobmV3VktpZHNbbmV3SGVhZF0pXHJcbiAgICAgICkge1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhdGNoKFxyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0ubm9kZSxcclxuICAgICAgICBvbGRWS2lkc1tvbGRIZWFkXSxcclxuICAgICAgICAobmV3VktpZHNbbmV3SGVhZF0gPSBnZXRWTm9kZShcclxuICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWQrK10sXHJcbiAgICAgICAgICBvbGRWS2lkc1tvbGRIZWFkKytdXHJcbiAgICAgICAgKSksXHJcbiAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgaXNTdmdcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlIChuZXdIZWFkIDw9IG5ld1RhaWwgJiYgb2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgIGlmIChcclxuICAgICAgICAob2xkS2V5ID0gZ2V0S2V5KG9sZFZLaWRzW29sZFRhaWxdKSkgPT0gbnVsbCB8fFxyXG4gICAgICAgIG9sZEtleSAhPT0gZ2V0S2V5KG5ld1ZLaWRzW25ld1RhaWxdKVxyXG4gICAgICApIHtcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwYXRjaChcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLm5vZGUsXHJcbiAgICAgICAgb2xkVktpZHNbb2xkVGFpbF0sXHJcbiAgICAgICAgKG5ld1ZLaWRzW25ld1RhaWxdID0gZ2V0Vk5vZGUoXHJcbiAgICAgICAgICBuZXdWS2lkc1tuZXdUYWlsLS1dLFxyXG4gICAgICAgICAgb2xkVktpZHNbb2xkVGFpbC0tXVxyXG4gICAgICAgICkpLFxyXG4gICAgICAgIGxpc3RlbmVyLFxyXG4gICAgICAgIGlzU3ZnXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICBpZiAob2xkSGVhZCA+IG9sZFRhaWwpIHtcclxuICAgICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCkge1xyXG4gICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKFxyXG4gICAgICAgICAgY3JlYXRlTm9kZShcclxuICAgICAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUobmV3VktpZHNbbmV3SGVhZCsrXSkpLFxyXG4gICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICksXHJcbiAgICAgICAgICAob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWRdKSAmJiBvbGRWS2lkLm5vZGVcclxuICAgICAgICApXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAobmV3SGVhZCA+IG5ld1RhaWwpIHtcclxuICAgICAgd2hpbGUgKG9sZEhlYWQgPD0gb2xkVGFpbCkge1xyXG4gICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQob2xkVktpZHNbb2xkSGVhZCsrXS5ub2RlKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBpID0gb2xkSGVhZCwga2V5ZWQgPSB7fSwgbmV3S2V5ZWQgPSB7fTsgaSA8PSBvbGRUYWlsOyBpKyspIHtcclxuICAgICAgICBpZiAoKG9sZEtleSA9IG9sZFZLaWRzW2ldLmtleSkgIT0gbnVsbCkge1xyXG4gICAgICAgICAga2V5ZWRbb2xkS2V5XSA9IG9sZFZLaWRzW2ldXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsKSB7XHJcbiAgICAgICAgb2xkS2V5ID0gZ2V0S2V5KChvbGRWS2lkID0gb2xkVktpZHNbb2xkSGVhZF0pKVxyXG4gICAgICAgIG5ld0tleSA9IGdldEtleShcclxuICAgICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKG5ld1ZLaWRzW25ld0hlYWRdLCBvbGRWS2lkKSlcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgIG5ld0tleWVkW29sZEtleV0gfHxcclxuICAgICAgICAgIChuZXdLZXkgIT0gbnVsbCAmJiBuZXdLZXkgPT09IGdldEtleShvbGRWS2lkc1tvbGRIZWFkICsgMV0pKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgaWYgKG9sZEtleSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQob2xkVktpZC5ub2RlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgb2xkSGVhZCsrXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5ld0tleSA9PSBudWxsIHx8IG9sZFZOb2RlLnR5cGUgPT09IFJFQ1lDTEVEX05PREUpIHtcclxuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBwYXRjaChcclxuICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgIG9sZFZLaWQsXHJcbiAgICAgICAgICAgICAgbmV3VktpZHNbbmV3SGVhZF0sXHJcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgaXNTdmdcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBuZXdIZWFkKytcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAob2xkS2V5ID09PSBuZXdLZXkpIHtcclxuICAgICAgICAgICAgcGF0Y2goXHJcbiAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICBvbGRWS2lkLm5vZGUsXHJcbiAgICAgICAgICAgICAgb2xkVktpZCxcclxuICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcclxuICAgICAgICAgICAgICBsaXN0ZW5lcixcclxuICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIG5ld0tleWVkW25ld0tleV0gPSB0cnVlXHJcbiAgICAgICAgICAgIG9sZEhlYWQrK1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCh0bXBWS2lkID0ga2V5ZWRbbmV3S2V5XSkgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIG5vZGUuaW5zZXJ0QmVmb3JlKHRtcFZLaWQubm9kZSwgb2xkVktpZCAmJiBvbGRWS2lkLm5vZGUpLFxyXG4gICAgICAgICAgICAgICAgdG1wVktpZCxcclxuICAgICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICBuZXdLZXllZFtuZXdLZXldID0gdHJ1ZVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBhdGNoKFxyXG4gICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlLFxyXG4gICAgICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIsXHJcbiAgICAgICAgICAgICAgICBpc1N2Z1xyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbmV3SGVhZCsrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB3aGlsZSAob2xkSGVhZCA8PSBvbGRUYWlsKSB7XHJcbiAgICAgICAgaWYgKGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWQrK10pKSA9PSBudWxsKSB7XHJcbiAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG9sZFZLaWQubm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGkgaW4ga2V5ZWQpIHtcclxuICAgICAgICBpZiAobmV3S2V5ZWRbaV0gPT0gbnVsbCkge1xyXG4gICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChrZXllZFtpXS5ub2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIChuZXdWTm9kZS5ub2RlID0gbm9kZSlcclxufVxyXG5cclxudmFyIHByb3BzQ2hhbmdlZCA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICBmb3IgKHZhciBrIGluIGEpIGlmIChhW2tdICE9PSBiW2tdKSByZXR1cm4gdHJ1ZVxyXG4gIGZvciAodmFyIGsgaW4gYikgaWYgKGFba10gIT09IGJba10pIHJldHVybiB0cnVlXHJcbn1cclxuXHJcbnZhciBnZXRUZXh0Vk5vZGUgPSBmdW5jdGlvbihub2RlKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBub2RlID09PSBcIm9iamVjdFwiID8gbm9kZSA6IGNyZWF0ZVRleHRWTm9kZShub2RlKVxyXG59XHJcblxyXG52YXIgZ2V0Vk5vZGUgPSBmdW5jdGlvbihuZXdWTm9kZSwgb2xkVk5vZGUpIHtcclxuICByZXR1cm4gbmV3Vk5vZGUudHlwZSA9PT0gTEFaWV9OT0RFXHJcbiAgICA/ICgoIW9sZFZOb2RlIHx8ICFvbGRWTm9kZS5sYXp5IHx8IHByb3BzQ2hhbmdlZChvbGRWTm9kZS5sYXp5LCBuZXdWTm9kZS5sYXp5KSlcclxuICAgICAgICAmJiAoKG9sZFZOb2RlID0gZ2V0VGV4dFZOb2RlKG5ld1ZOb2RlLmxhenkudmlldyhuZXdWTm9kZS5sYXp5KSkpLmxhenkgPVxyXG4gICAgICAgICAgbmV3Vk5vZGUubGF6eSksXHJcbiAgICAgIG9sZFZOb2RlKVxyXG4gICAgOiBuZXdWTm9kZVxyXG59XHJcblxyXG52YXIgY3JlYXRlVk5vZGUgPSBmdW5jdGlvbihuYW1lLCBwcm9wcywgY2hpbGRyZW4sIG5vZGUsIGtleSwgdHlwZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiBuYW1lLFxyXG4gICAgcHJvcHM6IHByb3BzLFxyXG4gICAgY2hpbGRyZW46IGNoaWxkcmVuLFxyXG4gICAgbm9kZTogbm9kZSxcclxuICAgIHR5cGU6IHR5cGUsXHJcbiAgICBrZXk6IGtleVxyXG4gIH1cclxufVxyXG5cclxudmFyIGNyZWF0ZVRleHRWTm9kZSA9IGZ1bmN0aW9uKHZhbHVlLCBub2RlKSB7XHJcbiAgcmV0dXJuIGNyZWF0ZVZOb2RlKHZhbHVlLCBFTVBUWV9PQkosIEVNUFRZX0FSUiwgbm9kZSwgdW5kZWZpbmVkLCBURVhUX05PREUpXHJcbn1cclxuXHJcbnZhciByZWN5Y2xlTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcclxuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gVEVYVF9OT0RFXHJcbiAgICA/IGNyZWF0ZVRleHRWTm9kZShub2RlLm5vZGVWYWx1ZSwgbm9kZSlcclxuICAgIDogY3JlYXRlVk5vZGUoXHJcbiAgICAgICAgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgIEVNUFRZX09CSixcclxuICAgICAgICBtYXAuY2FsbChub2RlLmNoaWxkTm9kZXMsIHJlY3ljbGVOb2RlKSxcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIHVuZGVmaW5lZCxcclxuICAgICAgICBSRUNZQ0xFRF9OT0RFXHJcbiAgICAgIClcclxufVxyXG5cclxuZXhwb3J0IHZhciBMYXp5ID0gZnVuY3Rpb24ocHJvcHMpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbGF6eTogcHJvcHMsXHJcbiAgICB0eXBlOiBMQVpZX05PREVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgaCA9IGZ1bmN0aW9uKG5hbWUsIHByb3BzKSB7XHJcbiAgZm9yICh2YXIgdmRvbSwgcmVzdCA9IFtdLCBjaGlsZHJlbiA9IFtdLCBpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSB7XHJcbiAgICByZXN0LnB1c2goYXJndW1lbnRzW2ldKVxyXG4gIH1cclxuXHJcbiAgd2hpbGUgKHJlc3QubGVuZ3RoID4gMCkge1xyXG4gICAgaWYgKGlzQXJyYXkoKHZkb20gPSByZXN0LnBvcCgpKSkpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IHZkb20ubGVuZ3RoOyBpLS0gPiAwOyApIHtcclxuICAgICAgICByZXN0LnB1c2godmRvbVtpXSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh2ZG9tID09PSBmYWxzZSB8fCB2ZG9tID09PSB0cnVlIHx8IHZkb20gPT0gbnVsbCkge1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2hpbGRyZW4ucHVzaChnZXRUZXh0Vk5vZGUodmRvbSkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm9wcyA9IHByb3BzIHx8IEVNUFRZX09CSlxyXG5cclxuICByZXR1cm4gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgPyBuYW1lKHByb3BzLCBjaGlsZHJlbilcclxuICAgIDogY3JlYXRlVk5vZGUobmFtZSwgcHJvcHMsIGNoaWxkcmVuLCB1bmRlZmluZWQsIHByb3BzLmtleSlcclxufVxyXG5cclxuZXhwb3J0IHZhciBhcHAgPSBmdW5jdGlvbihwcm9wcykge1xyXG4gIHZhciBzdGF0ZSA9IHt9XHJcbiAgdmFyIGxvY2sgPSBmYWxzZVxyXG4gIHZhciB2aWV3ID0gcHJvcHMudmlld1xyXG4gIHZhciBub2RlID0gcHJvcHMubm9kZVxyXG4gIHZhciB2ZG9tID0gbm9kZSAmJiByZWN5Y2xlTm9kZShub2RlKVxyXG4gIHZhciBzdWJzY3JpcHRpb25zID0gcHJvcHMuc3Vic2NyaXB0aW9uc1xyXG4gIHZhciBzdWJzID0gW11cclxuICB2YXIgb25FbmQgPSBwcm9wcy5vbkVuZFxyXG5cclxuICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZGlzcGF0Y2godGhpcy5hY3Rpb25zW2V2ZW50LnR5cGVdLCBldmVudClcclxuICB9XHJcblxyXG4gIHZhciBzZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XHJcbiAgICBpZiAoc3RhdGUgIT09IG5ld1N0YXRlKSB7XHJcbiAgICAgIHN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcclxuICAgICAgICBzdWJzID0gcGF0Y2hTdWJzKHN1YnMsIGJhdGNoKFtzdWJzY3JpcHRpb25zKHN0YXRlKV0pLCBkaXNwYXRjaClcclxuICAgICAgfVxyXG4gICAgICBpZiAodmlldyAmJiAhbG9jaykgZGVmZXIocmVuZGVyLCAobG9jayA9IHRydWUpKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0YXRlXHJcbiAgfVxyXG5cclxuICB2YXIgZGlzcGF0Y2ggPSAocHJvcHMubWlkZGxld2FyZSB8fFxyXG4gICAgZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgIHJldHVybiBvYmpcclxuICAgIH0pKGZ1bmN0aW9uKGFjdGlvbiwgcHJvcHMpIHtcclxuICAgIHJldHVybiB0eXBlb2YgYWN0aW9uID09PSBcImZ1bmN0aW9uXCJcclxuICAgICAgPyBkaXNwYXRjaChhY3Rpb24oc3RhdGUsIHByb3BzKSlcclxuICAgICAgOiBpc0FycmF5KGFjdGlvbilcclxuICAgICAgPyB0eXBlb2YgYWN0aW9uWzBdID09PSBcImZ1bmN0aW9uXCIgfHwgaXNBcnJheShhY3Rpb25bMF0pXHJcbiAgICAgICAgPyBkaXNwYXRjaChcclxuICAgICAgICAgICAgYWN0aW9uWzBdLFxyXG4gICAgICAgICAgICB0eXBlb2YgYWN0aW9uWzFdID09PSBcImZ1bmN0aW9uXCIgPyBhY3Rpb25bMV0ocHJvcHMpIDogYWN0aW9uWzFdXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgOiAoYmF0Y2goYWN0aW9uLnNsaWNlKDEpKS5tYXAoZnVuY3Rpb24oZngpIHtcclxuICAgICAgICAgICAgZnggJiYgZnhbMF0oZGlzcGF0Y2gsIGZ4WzFdKVxyXG4gICAgICAgICAgfSwgc2V0U3RhdGUoYWN0aW9uWzBdKSksXHJcbiAgICAgICAgICBzdGF0ZSlcclxuICAgICAgOiBzZXRTdGF0ZShhY3Rpb24pXHJcbiAgfSlcclxuXHJcbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbG9jayA9IGZhbHNlXHJcbiAgICBub2RlID0gcGF0Y2goXHJcbiAgICAgIG5vZGUucGFyZW50Tm9kZSxcclxuICAgICAgbm9kZSxcclxuICAgICAgdmRvbSxcclxuICAgICAgKHZkb20gPSBnZXRUZXh0Vk5vZGUodmlldyhzdGF0ZSkpKSxcclxuICAgICAgbGlzdGVuZXJcclxuICAgIClcclxuICAgIG9uRW5kKClcclxuICB9XHJcblxyXG4gIGRpc3BhdGNoKHByb3BzLmluaXQpXHJcbn1cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuXHJcblxyXG5jb25zdCBpbml0U3Vic2NyaXB0aW9ucyA9IChzdGF0ZTogSVN0YXRlKTogYW55W10gPT4ge1xyXG5cclxuICAgIGlmICghc3RhdGUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnM6IGFueVtdID0gW1xyXG5cclxuICAgIF07XHJcblxyXG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnM7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0U3Vic2NyaXB0aW9ucztcclxuXHJcbiIsIlxyXG5cclxuY29uc3QgaW5pdEV2ZW50cyA9IHtcclxuXHJcbiAgICBvblJlbmRlckZpbmlzaGVkOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGNvbXBhcmlzb25PblJlbmRlckZpbmlzaGVkLnNldFVwKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZ2lzdGVyR2xvYmFsRXZlbnRzOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9ICgpID0+IHtcclxuXHJcbiAgICAgICAgICAgIGluaXRFdmVudHMub25SZW5kZXJGaW5pc2hlZCgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gKF9ldmVudDogTW91c2VFdmVudCk6IGJvb2xlYW4gPT4ge1xyXG5cclxuICAgICAgICAvLyAgICAgbGV0IGhhbmRsZWQgPSBjb21wYXJpc29uT25SZW5kZXJGaW5pc2hlZC5zZXRVcE1vdXNlTW92ZUhhbmRsZXJzKCk7XHJcblxyXG4gICAgICAgIC8vICAgICBpZiAoaGFuZGxlZCkge1xyXG5cclxuICAgICAgICAvLyAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvLyAgICAgfVxyXG5cclxuICAgICAgICAvLyAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgLy8gfTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGluaXRFdmVudHM7XHJcblxyXG5cclxuIiwiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuXHJcblxyXG4vLyBUaGlzIGlzIHdoZXJlIGFsbCBhbGVydHMgdG8gZGF0YSBjaGFuZ2VzIHNob3VsZCBiZSBtYWRlXHJcbmNvbnN0IGdTdGF0ZUNvZGUgPSB7XHJcblxyXG4gICAgY2xvbmVTdGF0ZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBsZXQgbmV3U3RhdGU6IElTdGF0ZSA9IHsgLi4uc3RhdGUgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ld1N0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZ1N0YXRlQ29kZTtcclxuXHJcbiIsImltcG9ydCBJUGVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JUGVudFwiO1xyXG5cclxuXHJcbmNvbnN0IHBlbnRTaWRlVmFsaWRhdGlvbkNvZGUgPSB7XHJcblxyXG4gICAgdmFsaWRhdGVWYWx1ZXM6IChwZW50OiBJUGVudCk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICBsZXQgYWxlcnRUZXh0ID0gXCJcIjtcclxuXHJcbiAgICAgICAgaWYgKHBlbnQubWF4U3R1ZERpc3RhbmNlID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgbWF4U3R1ZERpc3RhbmNlIGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZyYW1pbmdTaXplUGl2b3QgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmcmFtaW5nU2l6ZVBpdm90IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZsb29yT3ZlcmhhbmdTdGFuZGFyZCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZsb29yT3ZlcmhhbmdTdGFuZGFyZCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mbG9vck92ZXJoYW5nSGVhdnkgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmbG9vck92ZXJoYW5nSGVhdnkgaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQubWF4UGFuZWxMZW5ndGggPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBtYXhQYW5lbExlbmd0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mbG9vckRlcHRoID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZmxvb3JEZXB0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mcm9udEhlaWdodCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZyb250SGVpZ2h0IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmJhY2tIZWlnaHQgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBiYWNrSGVpZ2h0IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZyYW1pbmdXaWR0aCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZyYW1pbmdXaWR0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mcmFtaW5nRGVwdGggPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmcmFtaW5nRGVwdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQucm9vZlJhaWxXaWR0aCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHJvb2ZSYWlsV2lkdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQucm9vZlJhaWxEZXB0aCA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHJvb2ZSYWlsRGVwdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuc2lkZUNvdW50ID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgc2lkZUNvdW50IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmJ1aWxkUGFuZWxzVG9nZXRoZXIgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBidWlsZFBhbmVsc1RvZ2V0aGVyIGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnNoaXBsYXBCb3R0b21PdmVyaGFuZyA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHNoaXBsYXBCb3R0b21PdmVyaGFuZyBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5zaGlwbGFwQnV0dGluZ1dpZHRoID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgc2hpcGxhcEJ1dHRpbmdXaWR0aCBpcyB1bmRlZmluZWRcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5zaGlwbGFwRGVwdGggPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBzaGlwbGFwRGVwdGggaXMgdW5kZWZpbmVkXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmIChwZW50Lm1heFN0dWREaXN0YW5jZSA8IDEwMFxyXG4gICAgICAgICAgICB8fCBwZW50Lm1heFN0dWREaXN0YW5jZSA+IDEwMDBcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgbWF4U3R1ZERpc3RhbmNlIGlzIGxlc3MgdGhhbiAxMDAgb3IgZ3JlYXRlciB0aGFuIDEwMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mcmFtaW5nU2l6ZVBpdm90IDwgMTBcclxuICAgICAgICAgICAgfHwgcGVudC5mcmFtaW5nU2l6ZVBpdm90ID4gMTAwMFxyXG4gICAgICAgICkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBmcmFtaW5nU2l6ZVBpdm90IGlzIHVuZGVmaW5lZFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZsb29yT3ZlcmhhbmdTdGFuZGFyZCA8IDFcclxuICAgICAgICAgICAgfHwgcGVudC5mbG9vck92ZXJoYW5nU3RhbmRhcmQgPiAxMDBcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZmxvb3JPdmVyaGFuZ1N0YW5kYXJkIGlzIGxlc3MgdGhhbiAxIG9yIGdyZWF0ZXIgdGhhbiAxMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5mbG9vck92ZXJoYW5nSGVhdnkgPCAxXHJcbiAgICAgICAgICAgIHx8IHBlbnQuZmxvb3JPdmVyaGFuZ0hlYXZ5ID4gMTAwXHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYGZsb29yT3ZlcmhhbmdIZWF2eSBpcyBsZXNzIHRoYW4gMTAwIG9yIGdyZWF0ZXIgdGhhbiAxMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGVudC5tYXhQYW5lbExlbmd0aCA8IDEwMFxyXG4gICAgICAgICAgICB8fCBwZW50Lm1heFBhbmVsTGVuZ3RoID4gNTAwMFxyXG4gICAgICAgICkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBtYXhQYW5lbExlbmd0aCBpcyBsZXNzIHRoYW4gMTAwIG9yIGdyZWF0ZXIgdGhhbiA1MDAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuZmxvb3JEZXB0aFxyXG4gICAgICAgICAgICAmJiAocGVudC5mbG9vckRlcHRoIDwgMTAwXHJcbiAgICAgICAgICAgICAgICB8fCBwZW50LmZsb29yRGVwdGggPiAyMDAwMClcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZmxvb3JEZXB0aCBpcyBsZXNzIHRoYW4gMTAwIG9yIGdyZWF0ZXIgdGhhbiAyMDAwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmZyb250SGVpZ2h0XHJcbiAgICAgICAgICAgICYmIChwZW50LmZyb250SGVpZ2h0IDwgMTAwXHJcbiAgICAgICAgICAgICAgICB8fCBwZW50LmZyb250SGVpZ2h0ID4gNDAwMClcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZnJvbnRIZWlnaHQgaXMgbGVzcyB0aGFuIDEwMCBvciBncmVhdGVyIHRoYW4gNDAwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LmJhY2tIZWlnaHRcclxuICAgICAgICAgICAgJiYgKHBlbnQuYmFja0hlaWdodCA8IDEwMFxyXG4gICAgICAgICAgICAgICAgfHwgcGVudC5iYWNrSGVpZ2h0ID4gNDAwMClcclxuICAgICAgICApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgYmFja0hlaWdodCBpcyBsZXNzIHRoYW4gMTAwIG9yIGdyZWF0ZXIgdGhhbiA0MDAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuZnJhbWluZ1dpZHRoIDwgMTBcclxuICAgICAgICAgICAgfHwgcGVudC5mcmFtaW5nV2lkdGggPiAzMDApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZnJhbWluZ1dpZHRoIGlzIGxlc3MgdGhhbiAxMCBvciBncmVhdGVyIHRoYW4gMzAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuZnJhbWluZ0RlcHRoIDwgMTBcclxuICAgICAgICAgICAgfHwgcGVudC5mcmFtaW5nRGVwdGggPiAzMDApIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgZnJhbWluZ0RlcHRoIGlzIGxlc3MgdGhhbiAxMCBvciBncmVhdGVyIHRoYW4gMzAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQucm9vZlJhaWxXaWR0aCA8IDEwXHJcbiAgICAgICAgICAgIHx8IHBlbnQucm9vZlJhaWxXaWR0aCA+IDMwMCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGByb29mUmFpbFdpZHRoIGlzIGxlc3MgdGhhbiAxMCBvciBncmVhdGVyIHRoYW4gMzAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQucm9vZlJhaWxEZXB0aCA8IDEwXHJcbiAgICAgICAgICAgIHx8IHBlbnQucm9vZlJhaWxEZXB0aCA+IDMwMCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGByb29mUmFpbERlcHRoIGlzIGxlc3MgdGhhbiAxMCBvciBncmVhdGVyIHRoYW4gMzAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuc2lkZUNvdW50IDwgMVxyXG4gICAgICAgICAgICB8fCBwZW50LnNpZGVDb3VudCA+IDIpIHtcclxuXHJcbiAgICAgICAgICAgIGFsZXJ0VGV4dCArPSBgc2lkZUNvdW50IGlzIGxlc3MgdGhhbiAxIG9yIGdyZWF0ZXIgdGhhbiAyXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuc2hpcGxhcEJvdHRvbU92ZXJoYW5nIDwgMVxyXG4gICAgICAgICAgICB8fCBwZW50LnNoaXBsYXBCb3R0b21PdmVyaGFuZyA+IDEwMCkge1xyXG5cclxuICAgICAgICAgICAgYWxlcnRUZXh0ICs9IGBzaGlwbGFwQm90dG9tT3ZlcmhhbmcgaXMgbGVzcyB0aGFuIDEgb3IgZ3JlYXRlciB0aGFuIDEwMFxyXG4gICAgYDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwZW50LnNoaXBsYXBCdXR0aW5nV2lkdGggPCAxMFxyXG4gICAgICAgICAgICB8fCBwZW50LnNoaXBsYXBCdXR0aW5nV2lkdGggPiAxMDAwKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHNoaXBsYXBCdXR0aW5nV2lkdGggaXMgbGVzcyB0aGFuIDEwIG9yIGdyZWF0ZXIgdGhhbiAxMDAwXHJcbiAgICBgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBlbnQuc2hpcGxhcERlcHRoIDwgMTBcclxuICAgICAgICAgICAgfHwgcGVudC5zaGlwbGFwRGVwdGggPiAxMDAwKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydFRleHQgKz0gYHNoaXBsYXBEZXB0aCBpcyBsZXNzIHRoYW4gMTAgb3IgZ3JlYXRlciB0aGFuIDEwMDBcclxuICAgIGA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYWxlcnRUZXh0XHJcbiAgICAgICAgICAgICYmIGFsZXJ0VGV4dC5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBhbGVydChhbGVydFRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHBlbnRTaWRlVmFsaWRhdGlvbkNvZGU7XHJcblxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgcGVudFNpZGVWYWxpZGF0aW9uQ29kZSBmcm9tIFwiLi9wZW50U2lkZVZhbGlkYXRpb25Db2RlXCI7XHJcbmltcG9ydCBJUGVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JUGVudFwiO1xyXG5pbXBvcnQgSVZpZXdFbGVtZW50IGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lWaWV3RWxlbWVudFwiO1xyXG5cclxuXHJcbmxldCBjdXJyZW50UGFnZUNoaWxkcmVuOiBJVmlld0VsZW1lbnRbXSA9IFtdO1xyXG5sZXQgcGFnZXM6IElWaWV3RWxlbWVudFtdID0gW107XHJcblxyXG5jb25zdCBhZGRQYWdlID0gKCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGN1cnJlbnRQYWdlQ2hpbGRyZW4gPSBbXTtcclxuXHJcbiAgICBwYWdlcy5wdXNoKHtcclxuICAgICAgICB0eXBlOiAncGFnZScsXHJcbiAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgdmFsdWU6IGN1cnJlbnRQYWdlQ2hpbGRyZW5cclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBhZGRVaUVsZW1lbnQgPSAoXHJcbiAgICB0eXBlOiBzdHJpbmcsXHJcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IEFycmF5PElWaWV3RWxlbWVudD4sXHJcbiAgICBwcm9wZXJ0aWVzOiBhbnkgfCBudWxsID0gbnVsbFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBwcm9wZXJ0aWVzID8/IHt9O1xyXG5cclxuICAgIGN1cnJlbnRQYWdlQ2hpbGRyZW4ucHVzaCh7XHJcbiAgICAgICAgdHlwZSxcclxuICAgICAgICBwcm9wZXJ0aWVzLFxyXG4gICAgICAgIHZhbHVlXHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgYWRkVWlDaGlsZEVsZW1lbnQgPSAoXHJcbiAgICBwYXJlbnRBcnJheTogSVZpZXdFbGVtZW50W10sXHJcbiAgICB0eXBlOiBzdHJpbmcsXHJcbiAgICB2YWx1ZTogc3RyaW5nIHwgbnVsbCB8IEFycmF5PElWaWV3RWxlbWVudD4sXHJcbiAgICBwcm9wZXJ0aWVzOiBhbnkgfCBudWxsID0gbnVsbFxyXG4pOiB2b2lkID0+IHtcclxuXHJcbiAgICBwcm9wZXJ0aWVzID8/IHt9O1xyXG5cclxuICAgIHBhcmVudEFycmF5LnB1c2goe1xyXG4gICAgICAgIHR5cGUsXHJcbiAgICAgICAgcHJvcGVydGllcyxcclxuICAgICAgICB2YWx1ZVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IGNhbGN1bGF0ZUZyYW1lVXByaWdodEFkanVzdG1lbnQgPSAoXHJcbiAgICBob3Jpem9udGFsRGlzdGFuY2VGcm9tRnJvbnQ6IG51bWJlcixcclxuICAgIHJvb2ZBbmdsZVJhZGlhbnM6IG51bWJlclxyXG4pOiBudW1iZXIgPT4ge1xyXG5cclxuICAgIGNvbnN0IGFkanVzdG1lbnQgPSBob3Jpem9udGFsRGlzdGFuY2VGcm9tRnJvbnQgKiBNYXRoLnRhbihyb29mQW5nbGVSYWRpYW5zKTtcclxuXHJcbiAgICByZXR1cm4gYWRqdXN0bWVudDtcclxufVxyXG5cclxuY29uc3QgcHJpbnRTaGlwbGFwVGltYmVyUmVxdWlyZW1lbnRzID0gKFxyXG4gICAgcHJpbnRQYW5lbE5hbWU6IHN0cmluZyxcclxuICAgIHNoaXBsYXBCdXR0aW5nV2lkdGhJbnQ6IG51bWJlcixcclxuICAgIHNoaXBsYXBEZXB0aEludDogbnVtYmVyXHJcbikgPT4ge1xyXG5cclxuICAgIGFkZFBhZ2UoKTtcclxuXHJcbiAgICBpZiAocHJpbnRQYW5lbE5hbWVcclxuICAgICAgICAmJiBwcmludFBhbmVsTmFtZS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAgICAgJ2gxJyxcclxuICAgICAgICAgICAgYFBhbmVsICR7cHJpbnRQYW5lbE5hbWV9YFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMicsXHJcbiAgICAgICAgYFNoaXBsYXAgY3V0dGluZyBsaXN0YFxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUaW1iZXJcclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAnaDMnLFxyXG4gICAgICAgIGBUaW1iZXIgcmVxdWlyZW1lbnRzOmAsXHJcbiAgICAgICAgeyBjbGFzczogJ3RvcC1wYWRkZWQnIH1cclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgY2hpbGRyZW46IEFycmF5PElWaWV3RWxlbWVudD4gPSBbXTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3VsJyxcclxuICAgICAgICBjaGlsZHJlblxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUNoaWxkRWxlbWVudChcclxuICAgICAgICBjaGlsZHJlbixcclxuICAgICAgICAnbGknLFxyXG4gICAgICAgIGBTaGlwbGFwIHdpdGggYSBiYWNrIGJ1dHRpbmcgd2lkdGggb2YgJHtzaGlwbGFwQnV0dGluZ1dpZHRoSW50fW1tIGFuZCBkZXB0aCBvZiAke3NoaXBsYXBEZXB0aEludH1tbWBcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcmludFNoaXBsYXBDdXR0aW5nTGlzdCA9IChcclxuICAgIHBlbnQ6IElQZW50LFxyXG4gICAgcHJpbnRTaGlwbGFwQm9hcmRDb3VudDogbnVtYmVyLFxyXG4gICAgcHJpbnRGcmFtZUJvdHRvbUxlbmd0aDogbnVtYmVyLFxyXG4gICAgcHJpbnRQYW5lbE5hbWUgPSBcIlwiXHJcbikgPT4ge1xyXG5cclxuICAgIHByaW50U2hpcGxhcFRpbWJlclJlcXVpcmVtZW50cyhcclxuICAgICAgICBwcmludFBhbmVsTmFtZSxcclxuICAgICAgICBwZW50LnNoaXBsYXBCdXR0aW5nV2lkdGgsXHJcbiAgICAgICAgcGVudC5zaGlwbGFwRGVwdGhcclxuICAgICk7XHJcblxyXG4gICAgLy8gU2hpcGxhcFxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMycsXHJcbiAgICAgICAgJ1NoaXBsYXAgYm9hcmRzJ1xyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgICdZWSBDdXQgYm90aCBlbmRzIHNxdWFyZS4nXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYEN1dCAke3ByaW50U2hpcGxhcEJvYXJkQ291bnR9IGxlbmd0aHMgYXQgdGhlIGZvbGxvd2luZyBtZWFzdXJlbWVudDpgXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICd1bCcsXHJcbiAgICAgICAgY2hpbGRyZW5cclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlDaGlsZEVsZW1lbnQoXHJcbiAgICAgICAgY2hpbGRyZW4sXHJcbiAgICAgICAgJ2xpJyxcclxuICAgICAgICBgJHtwcmludEZyYW1lQm90dG9tTGVuZ3RofW1tYFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHByaW50Q2xhZGRpbmdJbnN0cnVjdGlvbnMgPSAoXHJcbiAgICBwZW50OiBJUGVudCxcclxuICAgIHByaW50UGFuZWxOYW1lOiBzdHJpbmdcclxuKSA9PiB7XHJcblxyXG4gICAgYWRkUGFnZSgpO1xyXG5cclxuICAgIGlmIChwcmludFBhbmVsTmFtZVxyXG4gICAgICAgICYmIHByaW50UGFuZWxOYW1lLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICAgICAnaDEnLFxyXG4gICAgICAgICAgICBgUGFuZWwgJHtwcmludFBhbmVsTmFtZX1gXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ2gyJyxcclxuICAgICAgICBgU2hpcGxhcCBjbGFkZGluZyBpbnN0cnVjdGlvbnNgXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYFN0YXJ0IGF0IHRoZSBwYW5lbCBib3R0b20gYW5kIHdvcmsgdXB3YXJkcy5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYE9uIHBlbnQgc2lkZXMgdGhlIHNoaXBsYXAgZmluaXNoZXMgZmx1c2ggd2l0aCB0aGUgZnJhbWUuYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBUaGUgZmlyc3QgYm9hcmQgbXVzdCBvdmVyaGFuZyB0aGUgYm90dG9tIHJhaWwgZG93bndhcmRzIGJ5IGJvdHRvbSBvdmVyaGFuZyBzaG93biBiZWxvdy4gVXNlIGEgc2V0IHNxdWFyZSB0byBtYWtlIHN1cmUgdGhpcyBpcyB0aGUgY2FzZSBhdCBib3RoIGVuZHMgb2YgdGhlIGJvYXJkLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgTWFrZSBzdXJlIGFsbCBzaGlwbGFwIGVkZ2VzIGFyZSBmbHVzaCB3aXRoIHRoZSBmcmFtZSBiZWZvcmUgZml4aW5nLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgTmFpbCBvbmUgYm9hcmQgYXQgYSB0aW1lIHdoaWxlIHB1bGxpbmcgZG93biBoYXJkIGFnYWluc3QgdGhlIGFscmVhZHkgZml4ZWQgYm9hcmRzIC0gdG8gcHJldmVudCBhbnkgZ2FwcyBiZXR3ZWVuIHRoZSBib2FyZHMgc2hvd2luZyBvbiB0aGUgaW5zaWRlIHNoZWQgd2hlbiBmaW5pc2hlZC5gXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICd1bCcsXHJcbiAgICAgICAgY2hpbGRyZW5cclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlDaGlsZEVsZW1lbnQoXHJcbiAgICAgICAgY2hpbGRyZW4sXHJcbiAgICAgICAgJ2xpJyxcclxuICAgICAgICBgYm90dG9tIG92ZXJoYW5nOiAke3BlbnQuc2hpcGxhcEJvdHRvbU92ZXJoYW5nfW1tYFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHByaW50RnJhbWVBc3NlbWJseUluc3RydWN0aW9ucyA9IChcclxuICAgIHByaW50UGFuZWxOYW1lOiBzdHJpbmdcclxuKSA9PiB7XHJcblxyXG4gICAgYWRkUGFnZSgpO1xyXG5cclxuICAgIGlmIChwcmludFBhbmVsTmFtZVxyXG4gICAgICAgICYmIHByaW50UGFuZWxOYW1lLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICAgICAnaDEnLFxyXG4gICAgICAgICAgICBgUGFuZWwgJHtwcmludFBhbmVsTmFtZX1gXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ2gyJyxcclxuICAgICAgICBgRnJhbWUgYXNzZW1ibHkgaW5zdHJ1Y3Rpb25zYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBTaWRlcyBzaG91bGQgYmUgbWlycm9yIGltYWdlcyAtIEJFV0FSRSAtIGFuIGFsbCB0b28gZWFzeSBtaXN0YWtlIHRvIG1ha2UgaXMgdG8gYnVpbGQgdGhlbSBhcyBpZGVudGljYWwgaW5zdGVhZC5cclxuVGhlIGJlc3Qgd2F5IHRvIHByZXZlbnQgdGhpcyBtaXN0YWtlLCBhbmQgaW5kZWVkIGNsYWRkaW5nIG9uZXMsIGlzIHRvIGFzc2VtYmxlIGFsbCA0IHNpZGVzIG9uIHRvcCBvZiB0aGUgZmxvb3IgYW5kIHRoZW4gbWFyayBDTEVBUkxZIHRoZSBmYWNlcyB0aGF0IG5lZWQgY2xhZGRpbmcgYW5kIGFueSBjbGFkZGluZyBvdmVybGFwcy5cclxuSWYgdGhpcyBpcyBub3QgcG9zc2libGUsIHBsYWNlIHRoZSB0d28gc2lkZXMgb24gdG9wIG9mIGVhY2ggb3RoZXIgd2l0aCB0aGUgc2lkZXMgeW91IHdhbnQgY2xhZGRlZCBmYWNpbmcgdXAuIE1ha2Ugc3VyZSB0aGUgMiB0b3Agc2xvcGVzIHBvaW50IGluIG9wcG9zaXRlIGRpcmVjdGlvbnMuIFRoZW4gbWFyayBDTEVBUkxZIHRoZSB0b3AgZmFjZSBvZiBlYWNoIHNpZGUgYXMgdGhlIG9uZSBuZWVkaW5nIGNsYWRkaW5nLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgTWFrZSBzdXJlIGFsbCBlZGdlcyBhcmUgZmx1c2ggYmVmb3JlIGZpeGluZy5gXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgYFVzZSAyIHNjcmV3cyB0byBmaXggZWFjaCBlbmQgb2YgYW4gdXByaWdodCB0byB0aGUgdG9wIGFuZCBib3R0b20gcmFpbHMuYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBXaGVuIHNjcmV3aW5nIHRoZSAyIG91dGVyIGZyYW1lIHVwcmlnaHRzIHBpbG90IHRoZSB0b3AgYW5kIGJvdHRvbSByYWlscyBmaXJzdCwgb3RoZXJ3aXNlIHRoZSByYWlscyB3aWxsIHNwbGl0LmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgV2hlbiBwaWxvdGluZyB0aGUgdG9wIGZyYW1lIHJhaWwgcmVtZW1iZXIgaXQgaXMgYW5nbGVkLCBzbyBkcmlsbCBhdCB0aGUgc2FtZSBzbGFudCBhcyB0aGUgc2xhbnQgb24gdGhlIGN1dCBmYWNlLmBcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcmludEZyYW1lVGltYmVyUmVxdWlyZW1lbnRzID0gKFxyXG4gICAgcHJpbnRQYW5lbE5hbWU6IHN0cmluZyxcclxuICAgIGZyYW1pbmdTaXplOiBzdHJpbmdcclxuKSA9PiB7XHJcblxyXG4gICAgYWRkUGFnZSgpO1xyXG5cclxuICAgIGlmIChwcmludFBhbmVsTmFtZVxyXG4gICAgICAgICYmIHByaW50UGFuZWxOYW1lLmxlbmd0aCA+IDApIHtcclxuXHJcbiAgICAgICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICAgICAnaDEnLFxyXG4gICAgICAgICAgICBgUGFuZWwgJHtwcmludFBhbmVsTmFtZX1gXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ2gyJyxcclxuICAgICAgICBgRnJhbWUgY3V0dGluZyBsaXN0YFxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUaW1iZXJcclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAnaDMnLFxyXG4gICAgICAgIGBUaW1iZXIgcmVxdWlyZW1lbnRzOmAsXHJcbiAgICAgICAgeyBjbGFzczogJ3RvcC1wYWRkZWQnIH1cclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgY2hpbGRyZW46IEFycmF5PElWaWV3RWxlbWVudD4gPSBbXTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3VsJyxcclxuICAgICAgICBjaGlsZHJlblxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUNoaWxkRWxlbWVudChcclxuICAgICAgICBjaGlsZHJlbixcclxuICAgICAgICAnbGknLFxyXG4gICAgICAgIGAke2ZyYW1pbmdTaXplfSBmcmFtaW5nYFxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHByaW50RnJhbWVCb3R0b20gPSAoXHJcbiAgICBwcmludENvdW50TGVuZ3Roczogc3RyaW5nLFxyXG4gICAgcHJpbnRQYW5lbEZyYW1lQm90dG9tTGVuZ3RoOiBudW1iZXIsXHJcbiAgICBmcmFtaW5nU2l6ZTogc3RyaW5nLFxyXG4gICAgcHJpbnRQYW5lbE5hbWUgPSBcIlwiKSA9PiB7XHJcblxyXG4gICAgcHJpbnRGcmFtZVRpbWJlclJlcXVpcmVtZW50cyhcclxuICAgICAgICBwcmludFBhbmVsTmFtZSxcclxuICAgICAgICBmcmFtaW5nU2l6ZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBCb3R0b21zXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ2gzJyxcclxuICAgICAgICAnRnJhbWUgYm90dG9tJ1xyXG4gICAgKTtcclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAncCcsXHJcbiAgICAgICAgJ0N1dCBib3RoIGVuZHMgc3F1YXJlLidcclxuICAgICk7XHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBDdXQgJHtwcmludENvdW50TGVuZ3Roc30gb2YgdGhlIGZvbGxvd2luZyBtZWFzdXJlbWVudDpgXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxJVmlld0VsZW1lbnQ+ID0gW107XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICd1bCcsXHJcbiAgICAgICAgY2hpbGRyZW5cclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlDaGlsZEVsZW1lbnQoXHJcbiAgICAgICAgY2hpbGRyZW4sXHJcbiAgICAgICAgJ2xpJyxcclxuICAgICAgICBgJHtwcmludFBhbmVsRnJhbWVCb3R0b21MZW5ndGh9bW1gXHJcbiAgICApO1xyXG59O1xyXG5cclxuY29uc3QgcHJpbnRGcmFtZVRvcCA9IChcclxuICAgIHByaW50Q291bnRMZW5ndGhzOiBzdHJpbmcsXHJcbiAgICBwcmludFBhbmVsRnJhbWVUb3BMZW5ndGhSb3VuZGVkSW50OiBudW1iZXIsXHJcbiAgICByb29mQW5nbGVEZWdyZWVzUm91bmRlZDogbnVtYmVyLFxyXG4gICAgZnJhbWluZ1NpemU6IHN0cmluZyxcclxuICAgIHByaW50UGFuZWxOYW1lID0gXCJcIikgPT4ge1xyXG5cclxuICAgIHByaW50RnJhbWVUaW1iZXJSZXF1aXJlbWVudHMoXHJcbiAgICAgICAgcHJpbnRQYW5lbE5hbWUsXHJcbiAgICAgICAgZnJhbWluZ1NpemVcclxuICAgICk7XHJcblxyXG4gICAgLy8gVG9wXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ2gzJyxcclxuICAgICAgICAnRnJhbWUgdG9wJ1xyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBDdXQgYm90aCBlbmRzIGF0IGFuIGFuZ2xlIG9mICR7cm9vZkFuZ2xlRGVncmVlc1JvdW5kZWR9wrAuYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgICdUaGUgYW5nbGVkIGVuZHMgbXVzdCBiZSBwYXJhbGxlbCAtIGllIGZhY2UgaW4gdGhlIHNhbWUgZGlyZWN0aW9uLidcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgVGhlIGFuZ2xlIHNob3VsZCBiZSBvbiB0aGUgc2hvcnRlciBmYWNlIG9mIHRoZSBmcmFtaW5nIC0gdGhlIGRlcHRoLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgQ3V0ICR7cHJpbnRDb3VudExlbmd0aHN9IG9mIHRoZSBmb2xsb3dpbmcgbWVhc3VyZW1lbnQ6YFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8SVZpZXdFbGVtZW50PiA9IFtdO1xyXG5cclxuICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAndWwnLFxyXG4gICAgICAgIGNoaWxkcmVuXHJcbiAgICApO1xyXG5cclxuICAgIGFkZFVpQ2hpbGRFbGVtZW50KFxyXG4gICAgICAgIGNoaWxkcmVuLFxyXG4gICAgICAgICdsaScsXHJcbiAgICAgICAgYCR7cHJpbnRQYW5lbEZyYW1lVG9wTGVuZ3RoUm91bmRlZEludH1tbWBcclxuICAgICk7XHJcbn07XHJcblxyXG5jb25zdCBwcmludFVwcmlnaHRzID0gKFxyXG4gICAgcHJpbnRDb3VudExlbmd0aHM6IHN0cmluZyxcclxuICAgIHByaW50UGFuZWxVcHJpZ2h0czogQXJyYXk8bnVtYmVyPixcclxuICAgIHJvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkOiBudW1iZXIsXHJcbiAgICBmcmFtaW5nU2l6ZTogc3RyaW5nLFxyXG4gICAgcHJpbnRQYW5lbE5hbWUgPSBcIlwiKSA9PiB7XHJcblxyXG4gICAgcHJpbnRGcmFtZVRpbWJlclJlcXVpcmVtZW50cyhcclxuICAgICAgICBwcmludFBhbmVsTmFtZSxcclxuICAgICAgICBmcmFtaW5nU2l6ZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBVcHJpZ2h0c1xyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdoMycsXHJcbiAgICAgICAgJ0ZyYW1lIHVwcmlnaHRzJ1xyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBUaGUgdG9wIGVuZCB3aWxsIGJlIGN1dCBhdCBhbiBhbmdsZSwgdGhlIGJvdHRvbSBzcXVhcmUuYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgIGBTdGFydCBlYWNoIGxlbmd0aCBieSBjdXR0aW5nIHRoZSB0b3AgZW5kIGF0IGFuIGFuZ2xlIG9mICR7cm9vZkFuZ2xlRGVncmVlc1JvdW5kZWR9wrAuYFxyXG4gICAgKTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3AnLFxyXG4gICAgICAgICdNZWFzdXJlIGRvd24gZnJvbSB0aGUgcGVhayBvZiB0aGUgYW5nbGVkIGN1dCBhbmQgY3V0IHRoZSBib3R0b20gc3F1YXJlLidcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgVGhlIGFuZ2xlIHNob3VsZCBiZSBvbiB0aGUgc2hvcnRlciBmYWNlIG9mIHRoZSBmcmFtaW5nIC0gdGhlIGRlcHRoLmBcclxuICAgICk7XHJcblxyXG4gICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICdwJyxcclxuICAgICAgICBgQ3V0ICR7cHJpbnRDb3VudExlbmd0aHN9IG9mIHRoZSBmb2xsb3dpbmcgbWVhc3VyZW1lbnRzOmBcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgY2hpbGRyZW46IEFycmF5PElWaWV3RWxlbWVudD4gPSBbXTtcclxuXHJcbiAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgJ3VsJyxcclxuICAgICAgICBjaGlsZHJlblxyXG4gICAgKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByaW50UGFuZWxVcHJpZ2h0cy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICBhZGRVaUNoaWxkRWxlbWVudChcclxuICAgICAgICAgICAgY2hpbGRyZW4sXHJcbiAgICAgICAgICAgICdsaScsXHJcbiAgICAgICAgICAgIGAke3ByaW50UGFuZWxVcHJpZ2h0c1tpXX1tbWBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgcHJpbnRTcGFjZXJzID0gKFxyXG4gICAgcGVudDogSVBlbnQsXHJcbiAgICBwcmludFBhbmVsQXZhaWxhYmxlTGVuZ3RoOiBudW1iZXIsXHJcbiAgICBwcmludEhvcml6b250YWxTdHVkU3BhY2VyOiBudW1iZXIsXHJcbiAgICBmcmFtaW5nU2l6ZTogc3RyaW5nLFxyXG4gICAgcHJpbnRQYW5lbEluZGV4ID0gMCxcclxuICAgIHByaW50UGFuZWxOYW1lID0gXCJcIlxyXG4pID0+IHtcclxuXHJcbiAgICBpZiAocHJpbnRQYW5lbEF2YWlsYWJsZUxlbmd0aCA+IHBlbnQubWF4U3R1ZERpc3RhbmNlKSB7XHJcblxyXG4gICAgICAgIHByaW50RnJhbWVUaW1iZXJSZXF1aXJlbWVudHMoXHJcbiAgICAgICAgICAgIHByaW50UGFuZWxOYW1lLFxyXG4gICAgICAgICAgICBmcmFtaW5nU2l6ZVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIFNwYWNlclxyXG4gICAgICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAgICAgJ2gzJyxcclxuICAgICAgICAgICAgJ1N0dWQgc3BhY2VycydcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgICAgICdwJyxcclxuICAgICAgICAgICAgJ0N1dCBib3RoIGVuZHMgc3F1YXJlLidcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBpZiAocHJpbnRQYW5lbEluZGV4ID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICBhZGRVaUVsZW1lbnQoXHJcbiAgICAgICAgICAgICAgICAncCcsXHJcbiAgICAgICAgICAgICAgICBgQ3V0IDIgbGVuZ3RocyBvZiB0aGUgZm9sbG93aW5nIG1lYXN1cmVtZW50OmBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFkZFVpRWxlbWVudChcclxuICAgICAgICAgICAgICAgICdwJyxcclxuICAgICAgICAgICAgICAgIGBVc2UgdGhlIDIgc3BhY2VycyBhbHJlYWR5IGN1dCB3aXRoIHRoZSBmb2xsb3dpbmcgbWVhc3VyZW1lbnQ6YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW46IEFycmF5PElWaWV3RWxlbWVudD4gPSBbXTtcclxuXHJcbiAgICAgICAgYWRkVWlFbGVtZW50KFxyXG4gICAgICAgICAgICAndWwnLFxyXG4gICAgICAgICAgICBjaGlsZHJlblxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGFkZFVpQ2hpbGRFbGVtZW50KFxyXG4gICAgICAgICAgICBjaGlsZHJlbixcclxuICAgICAgICAgICAgJ2xpJyxcclxuICAgICAgICAgICAgYCR7cHJpbnRIb3Jpem9udGFsU3R1ZFNwYWNlcn1tbWBcclxuICAgICAgICApO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY29uc3QgcHJpbnRQYW5lbCA9IChcclxuICAgIHBlbnQ6IElQZW50LFxyXG4gICAgcHJpbnRDb3VudExlbmd0aHM6IHN0cmluZywgLy8gc2lkZUNvdW50TGVuZ3Roc1xyXG4gICAgcHJpbnRQYW5lbEZyYW1lQm90dG9tTGVuZ3RoOiBudW1iZXIsIC8vZnJhbWVCb3R0b21MZW5ndGhcclxuICAgIHByaW50UGFuZWxGcmFtZVRvcExlbmd0aFJvdW5kZWRJbnQ6IG51bWJlciwgLy8gcGFuZWxGcmFtZVRvcExlbmd0aFJvdW5kZWRJbnRcclxuICAgIHByaW50UGFuZWxVcHJpZ2h0czogQXJyYXk8bnVtYmVyPiwgLy9wYW5lbFVwcmlnaHRzXHJcbiAgICBwcmludFBhbmVsQXZhaWxhYmxlTGVuZ3RoOiBudW1iZXIsIC8vcGFuZWxBdmFpbGFibGVMZW5ndGhcclxuICAgIHByaW50SG9yaXpvbnRhbFN0dWRTcGFjZXI6IG51bWJlciwgLy8gaG9yaXpvbnRhbFN0dWRTcGFjZXJcclxuICAgIHByaW50U2hpcGxhcEJvYXJkQ291bnQ6IG51bWJlcixcclxuICAgIGZyYW1pbmdTaXplOiBzdHJpbmcsXHJcbiAgICByb29mQW5nbGVEZWdyZWVzUm91bmRlZDogbnVtYmVyLFxyXG4gICAgcHJpbnRQYW5lbE5hbWUgPSAnJyxcclxuICAgIHByaW50UGFuZWxJbmRleCA9IDBcclxuKSA9PiB7XHJcblxyXG4gICAgcHJpbnRGcmFtZUJvdHRvbShcclxuICAgICAgICBwcmludENvdW50TGVuZ3RocyxcclxuICAgICAgICBwcmludFBhbmVsRnJhbWVCb3R0b21MZW5ndGgsXHJcbiAgICAgICAgZnJhbWluZ1NpemUsXHJcbiAgICAgICAgcHJpbnRQYW5lbE5hbWVcclxuICAgICk7XHJcblxyXG4gICAgcHJpbnRGcmFtZVRvcChcclxuICAgICAgICBwcmludENvdW50TGVuZ3RocyxcclxuICAgICAgICBwcmludFBhbmVsRnJhbWVUb3BMZW5ndGhSb3VuZGVkSW50LFxyXG4gICAgICAgIHJvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkLFxyXG4gICAgICAgIGZyYW1pbmdTaXplLFxyXG4gICAgICAgIHByaW50UGFuZWxOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIHByaW50VXByaWdodHMoXHJcbiAgICAgICAgcHJpbnRDb3VudExlbmd0aHMsXHJcbiAgICAgICAgcHJpbnRQYW5lbFVwcmlnaHRzLFxyXG4gICAgICAgIHJvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkLFxyXG4gICAgICAgIGZyYW1pbmdTaXplLFxyXG4gICAgICAgIHByaW50UGFuZWxOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIHByaW50U3BhY2VycyhcclxuICAgICAgICBwZW50LFxyXG4gICAgICAgIHByaW50UGFuZWxBdmFpbGFibGVMZW5ndGgsXHJcbiAgICAgICAgcHJpbnRIb3Jpem9udGFsU3R1ZFNwYWNlcixcclxuICAgICAgICBmcmFtaW5nU2l6ZSxcclxuICAgICAgICBwcmludFBhbmVsSW5kZXgsXHJcbiAgICAgICAgcHJpbnRQYW5lbE5hbWVcclxuICAgICk7XHJcblxyXG4gICAgcHJpbnRGcmFtZUFzc2VtYmx5SW5zdHJ1Y3Rpb25zKHByaW50UGFuZWxOYW1lKTtcclxuXHJcbiAgICBwcmludFNoaXBsYXBDdXR0aW5nTGlzdChcclxuICAgICAgICBwZW50LFxyXG4gICAgICAgIHByaW50U2hpcGxhcEJvYXJkQ291bnQsXHJcbiAgICAgICAgcHJpbnRQYW5lbEZyYW1lQm90dG9tTGVuZ3RoLFxyXG4gICAgICAgIHByaW50UGFuZWxOYW1lXHJcbiAgICApO1xyXG5cclxuICAgIHByaW50Q2xhZGRpbmdJbnN0cnVjdGlvbnMoXHJcbiAgICAgICAgcGVudCxcclxuICAgICAgICBwcmludFBhbmVsTmFtZVxyXG4gICAgKTtcclxufTtcclxuXHJcbmNvbnN0IHBlbnRTaWRlQ2FsY3VsYXRpb25Db2RlID0ge1xyXG5cclxuICAgIGNhbGN1bGF0ZTogKHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcclxuXHJcbiAgICAgICAgcGVudFNpZGVWYWxpZGF0aW9uQ29kZS52YWxpZGF0ZVZhbHVlcyhzdGF0ZS5wZW50KTtcclxuICAgICAgICBwYWdlcyA9IFtdO1xyXG4gICAgICAgIGN1cnJlbnRQYWdlQ2hpbGRyZW4gPSBbXTtcclxuXHJcbiAgICAgICAgY29uc3QgcGVudCA9IHN0YXRlLnBlbnQ7XHJcbiAgICAgICAgcGVudC5mbG9vckRlcHRoID0gcGVudC5mbG9vckRlcHRoID8/IDA7XHJcbiAgICAgICAgcGVudC5mcm9udEhlaWdodCA9IHBlbnQuZnJvbnRIZWlnaHQgPz8gMDtcclxuICAgICAgICBwZW50LmJhY2tIZWlnaHQgPSBwZW50LmJhY2tIZWlnaHQgPz8gMDtcclxuXHJcbiAgICAgICAgY29uc3QgZmxvb3JPdmVyaGFuZyA9IHBlbnQuZnJhbWluZ1dpZHRoID4gcGVudC5mcmFtaW5nU2l6ZVBpdm90ID8gcGVudC5mbG9vck92ZXJoYW5nSGVhdnkgOiBwZW50LmZsb29yT3ZlcmhhbmdTdGFuZGFyZDtcclxuICAgICAgICBjb25zdCBmcmFtZUJvdHRvbUxlbmd0aCA9IHBlbnQuZmxvb3JEZXB0aCArICgyICogZmxvb3JPdmVyaGFuZyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYW1pbmdTaXplID0gYCR7cGVudC5mcmFtaW5nV2lkdGh9bW0geCAke3BlbnQuZnJhbWluZ0RlcHRofW1tYDtcclxuXHJcblxyXG4gICAgICAgIC8vIHNpZGUgc2l6ZXNcclxuICAgICAgICBjb25zdCBhZGp1c3RlZEZyYW1lQm90dG9tTGVuZ3RoID0gZnJhbWVCb3R0b21MZW5ndGggLSBwZW50LmZyYW1pbmdXaWR0aDsgLy8gQmVjYXVzZSB0aGUgcm9vZiByYWlscyB3aWxsIHNpdCBvbiB0aGUgYmFjayBvZiB0aGUgZnJvbnQgcGFuZWxzIGZyYW1lIG5vdCB0aGUgdGhlIGZyb250XHJcbiAgICAgICAgY29uc3QgdHJpYW5nbGVIZWlnaHQgPSBwZW50LmZyb250SGVpZ2h0IC0gcGVudC5iYWNrSGVpZ2h0O1xyXG4gICAgICAgIGNvbnN0IHJvb2ZBbmdsZVJhZGlhbnMgPSBNYXRoLmF0YW4yKHRyaWFuZ2xlSGVpZ2h0LCBhZGp1c3RlZEZyYW1lQm90dG9tTGVuZ3RoKTtcclxuXHJcbiAgICAgICAgY29uc3QgaGVpZ2h0QWRqdXN0bWVudEludCA9IHBlbnQuZnJhbWluZ1dpZHRoICogTWF0aC50YW4ocm9vZkFuZ2xlUmFkaWFucyk7XHJcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRGcm9udEhlaWdodEludCA9IHBlbnQuZnJvbnRIZWlnaHQgKyBoZWlnaHRBZGp1c3RtZW50SW50O1xyXG4gICAgICAgIGNvbnN0IGFkanVzdGVkVHJpYW5nbGVIZWlnaHQgPSB0cmlhbmdsZUhlaWdodCArIGhlaWdodEFkanVzdG1lbnRJbnQ7XHJcblxyXG4gICAgICAgIGNvbnN0IHJvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkID0gTWF0aC5yb3VuZChyb29mQW5nbGVSYWRpYW5zICogMTgwIC8gTWF0aC5QSSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGFuZ2xlQWRqdXN0ZWRGcmFtZURlcHRoID0gcGVudC5mcmFtaW5nRGVwdGggLyBNYXRoLmNvcyhyb29mQW5nbGVSYWRpYW5zKTtcclxuICAgICAgICBjb25zdCBhbmdsZUFkanVzdGVkUmFpbFdpZHRoID0gcGVudC5yb29mUmFpbFdpZHRoIC8gTWF0aC5jb3Mocm9vZkFuZ2xlUmFkaWFucyk7XHJcblxyXG4gICAgICAgIC8vIHNpZGUgcGFuZWwgc2l6ZXNcclxuICAgICAgICBjb25zdCBwYW5lbENvdW50SW50ID0gTWF0aC5jZWlsKGZyYW1lQm90dG9tTGVuZ3RoIC8gcGVudC5tYXhQYW5lbExlbmd0aCk7XHJcbiAgICAgICAgLy8gY29uc3QgcGFuZWxGcmFtZUJvdHRvbUxlbmd0aEludCA9IE1hdGgucm91bmQoZnJhbWVCb3R0b21MZW5ndGggLyBwYW5lbENvdW50SW50KTtcclxuICAgICAgICBjb25zdCBwYW5lbEZyYW1lVG9wTGVuZ3RoUm91bmRlZEludCA9IE1hdGgucm91bmQoYWRqdXN0ZWRUcmlhbmdsZUhlaWdodCAvIChNYXRoLnNpbihyb29mQW5nbGVSYWRpYW5zKSAqIHBhbmVsQ291bnRJbnQpKTtcclxuICAgICAgICBjb25zdCBzaWRlRnJhbWVGcm9udExlbmd0aEludCA9IGFkanVzdGVkRnJvbnRIZWlnaHRJbnQgLSBwZW50LmZyYW1pbmdEZXB0aCAtIGFuZ2xlQWRqdXN0ZWRGcmFtZURlcHRoICsgYW5nbGVBZGp1c3RlZFJhaWxXaWR0aDtcclxuXHJcbiAgICAgICAgY29uc3QgcGFuZWxBdmFpbGFibGVMZW5ndGggPSBmcmFtZUJvdHRvbUxlbmd0aCAtIHBlbnQuZnJhbWluZ0RlcHRoO1xyXG4gICAgICAgIGNvbnN0IHN0dWREaXZpc2lvbkNvdW50ID0gTWF0aC5mbG9vcihwYW5lbEF2YWlsYWJsZUxlbmd0aCAvIHBlbnQubWF4U3R1ZERpc3RhbmNlKSArIDE7XHJcbiAgICAgICAgY29uc3QgaG9yaXpvbnRhbFNwYWNpbmcgPSBNYXRoLnJvdW5kKHBhbmVsQXZhaWxhYmxlTGVuZ3RoIC8gc3R1ZERpdmlzaW9uQ291bnQpO1xyXG4gICAgICAgIGNvbnN0IGhvcml6b250YWxTdHVkU3BhY2VyID0gaG9yaXpvbnRhbFNwYWNpbmcgLSBwZW50LmZyYW1pbmdEZXB0aDtcclxuXHJcbiAgICAgICAgY29uc3Qgc3BhY2luZ0FkanVzdG1lbnQgPSBjYWxjdWxhdGVGcmFtZVVwcmlnaHRBZGp1c3RtZW50KFxyXG4gICAgICAgICAgICBob3Jpem9udGFsU3BhY2luZyxcclxuICAgICAgICAgICAgcm9vZkFuZ2xlUmFkaWFuc1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZyYW1lRGVwdGhBZGp1c3RtZW50ID0gY2FsY3VsYXRlRnJhbWVVcHJpZ2h0QWRqdXN0bWVudChcclxuICAgICAgICAgICAgcGVudC5mcmFtaW5nRGVwdGgsXHJcbiAgICAgICAgICAgIHJvb2ZBbmdsZVJhZGlhbnNcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBzaGlwbGFwQm9hcmRDb3VudHM6IEFycmF5PG51bWJlcj4gPSBbXTtcclxuICAgICAgICBjb25zdCBzaWRlVXByaWdodHM6IEFycmF5PEFycmF5PG51bWJlcj4+ID0gW107XHJcbiAgICAgICAgbGV0IHBhbmVsVXByaWdodHM6IEFycmF5PG51bWJlcj47XHJcbiAgICAgICAgbGV0IHJ1bm5pbmdBZGp1c3RtZW50ID0gMDtcclxuICAgICAgICBsZXQgdXByaWdodEhlaWdodFJvdW5kZWQgPSAwO1xyXG4gICAgICAgIGxldCBzaGlwbGFwQm9hcmRDb3VudCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFuZWxDb3VudEludDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBwYW5lbFVwcmlnaHRzID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8PSBzdHVkRGl2aXNpb25Db3VudDsgaisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdXByaWdodEhlaWdodFJvdW5kZWQgPSBNYXRoLnJvdW5kKHNpZGVGcmFtZUZyb250TGVuZ3RoSW50IC0gcnVubmluZ0FkanVzdG1lbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChqID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNoaXBsYXBCb2FyZENvdW50ID0gTWF0aC5jZWlsKCh1cHJpZ2h0SGVpZ2h0Um91bmRlZCArIHBlbnQuc2hpcGxhcEJvdHRvbU92ZXJoYW5nKSAvIHBlbnQuc2hpcGxhcEJ1dHRpbmdXaWR0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hpcGxhcEJvYXJkQ291bnRzLnB1c2goc2hpcGxhcEJvYXJkQ291bnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBhbmVsVXByaWdodHMucHVzaCh1cHJpZ2h0SGVpZ2h0Um91bmRlZCk7XHJcbiAgICAgICAgICAgICAgICBydW5uaW5nQWRqdXN0bWVudCArPSBzcGFjaW5nQWRqdXN0bWVudDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2lkZVVwcmlnaHRzLnB1c2gocGFuZWxVcHJpZ2h0cyk7XHJcbiAgICAgICAgICAgIHJ1bm5pbmdBZGp1c3RtZW50ICs9IGZyYW1lRGVwdGhBZGp1c3RtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTmVlZCB0byBnZXQgdGhlbSB0byBsYWJlbCBlYWNoIHBhcnQgc28gdGhlcmUgaXMgbm8gY29uZnVzaW9uXHJcbiAgICAgICAgLy8gQWxzbyB3YW50IHRvIHNwbGl0IGl0IG91dCBpbiBtb3JlIHBhZ2VzIHRvIG1ha2UgaXQgZWFzaWVyXHJcbiAgICAgICAgaWYgKHBlbnQuYnVpbGRQYW5lbHNUb2dldGhlciA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbGVuZ3Roc0NvdW50SW50ID0gcGVudC5zaWRlQ291bnQgKiBwYW5lbENvdW50SW50O1xyXG4gICAgICAgICAgICBsZXQgbGVuZ3Roc0NvdW50ID0gYCR7bGVuZ3Roc0NvdW50SW50fSBsZW5ndGhgO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxlbmd0aHNDb3VudEludCA+IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZW5ndGhzQ291bnQgPSBgJHtsZW5ndGhzQ291bnR9c2A7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBzaWRlU2hpcGxhcEJvYXJkQ291bnQgPSAwO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgbSA9IDA7IG0gPCBzaGlwbGFwQm9hcmRDb3VudHMubGVuZ3RoOyBtKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzaWRlU2hpcGxhcEJvYXJkQ291bnQgKz0gc2hpcGxhcEJvYXJkQ291bnRzW21dO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcmludFBhbmVsKFxyXG4gICAgICAgICAgICAgICAgcGVudCxcclxuICAgICAgICAgICAgICAgIGxlbmd0aHNDb3VudCxcclxuICAgICAgICAgICAgICAgIGZyYW1lQm90dG9tTGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgcGFuZWxGcmFtZVRvcExlbmd0aFJvdW5kZWRJbnQsXHJcbiAgICAgICAgICAgICAgICBzaWRlVXByaWdodHMuZmxhdCgpLFxyXG4gICAgICAgICAgICAgICAgcGFuZWxBdmFpbGFibGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBob3Jpem9udGFsU3R1ZFNwYWNlcixcclxuICAgICAgICAgICAgICAgIHNpZGVTaGlwbGFwQm9hcmRDb3VudCxcclxuICAgICAgICAgICAgICAgIGZyYW1pbmdTaXplLFxyXG4gICAgICAgICAgICAgICAgcm9vZkFuZ2xlRGVncmVlc1JvdW5kZWRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcGFuZWxDb3VudEludDsgaysrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBhbmVsTGVuZ3Roc0NvdW50ID0gYCR7cGVudC5zaWRlQ291bnR9IGxlbmd0aGA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBlbnQuc2lkZUNvdW50ID4gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwYW5lbExlbmd0aHNDb3VudCA9IGAke3BhbmVsTGVuZ3Roc0NvdW50fXNgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHByaW50UGFuZWwoXHJcbiAgICAgICAgICAgICAgICAgICAgcGVudCxcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbExlbmd0aHNDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBmcmFtZUJvdHRvbUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBwYW5lbEZyYW1lVG9wTGVuZ3RoUm91bmRlZEludCxcclxuICAgICAgICAgICAgICAgICAgICBzaWRlVXByaWdodHNba10sXHJcbiAgICAgICAgICAgICAgICAgICAgcGFuZWxBdmFpbGFibGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgaG9yaXpvbnRhbFN0dWRTcGFjZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hpcGxhcEJvYXJkQ291bnRzW2tdLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyYW1pbmdTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvb2ZBbmdsZURlZ3JlZXNSb3VuZGVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGBBJHtrICsgMX1gLFxyXG4gICAgICAgICAgICAgICAgICAgIGtcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBhZ2VzID0gcGFnZXM7XHJcbiAgICAgICAgc3RhdGUuY3VycmVudFBhZ2VJbmRleCA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwZW50U2lkZUNhbGN1bGF0aW9uQ29kZTtcclxuXHJcbiIsImltcG9ydCBnU3RhdGVDb2RlIGZyb20gXCIuLi8uLi8uLi9nbG9iYWwvY29kZS9nU3RhdGVDb2RlXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVN0YXRlXCI7XHJcbmltcG9ydCBwZW50U2lkZUNhbGN1bGF0aW9uQ29kZSBmcm9tIFwiLi4vY29kZS9wZW50U2lkZUNhbGN1bGF0aW9uQ29kZVwiO1xyXG5cclxuXHJcbmNvbnN0IHBlbnRTaWRlQWN0aW9ucyA9IHtcclxuXHJcbiAgICBzZXRGbG9vckRlcHRoOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuZmxvb3JEZXB0aCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0RnJvbnRIZWlnaHQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5mcm9udEhlaWdodCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0QmFja0hlaWdodDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LmJhY2tIZWlnaHQgPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEZyYW1pbmdXaWR0aDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LmZyYW1pbmdXaWR0aCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0RnJhbWluZ0RlcHRoOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuZnJhbWluZ0RlcHRoID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRSb29mUmFpbFdpZHRoOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQucm9vZlJhaWxXaWR0aCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Um9vZlJhaWxEZXB0aDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LnJvb2ZSYWlsRGVwdGggPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldFNpZGVDb3VudDogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTFNlbGVjdEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5zaWRlQ291bnQgPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHNldEJ1aWxkUGFuZWxzVG9nZXRoZXI6IChcclxuICAgIC8vICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgLy8gICAgIHZhbHVlOiBib29sZWFuXHJcbiAgICAvLyApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgIC8vICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAvLyAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgIC8vICAgICB9XHJcblxyXG4gICAgLy8gICAgIHN0YXRlLnBlbnQuYnVpbGRQYW5lbHNUb2dldGhlciA9IHZhbHVlO1xyXG5cclxuICAgIC8vICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIC8vIH0sXHJcblxyXG4gICAgc2V0U2hpcGxhcEJvdHRvbU92ZXJoYW5nOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcEJvdHRvbU92ZXJoYW5nID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRTaGlwbGFwQnV0dGluZ1dpZHRoOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcEJ1dHRpbmdXaWR0aCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0U2hpcGxhcERlcHRoOiAoXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBlbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50XHJcbiAgICApOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcERlcHRoID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRNYXhTdHVkRGlzdGFuY2U6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5tYXhTdHVkRGlzdGFuY2UgPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEZyYW1pbmdTaXplUGl2b3Q6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5mcmFtaW5nU2l6ZVBpdm90ID0gK2VsZW1lbnQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRGbG9vck92ZXJoYW5nU3RhbmRhcmQ6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5mbG9vck92ZXJoYW5nU3RhbmRhcmQgPSArZWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEZsb29yT3ZlcmhhbmdIZWF2eTogKFxyXG4gICAgICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICAgICAgZWxlbWVudDogSFRNTElucHV0RWxlbWVudFxyXG4gICAgKTogSVN0YXRlID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0ZS5wZW50LmZsb29yT3ZlcmhhbmdIZWF2eSA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0TWF4UGFuZWxMZW5ndGg6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnRcclxuICAgICk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGUucGVudC5tYXhQYW5lbExlbmd0aCA9ICtlbGVtZW50LnZhbHVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgbWluaW1pc2VEZWZhdWx0czogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5zaG93RGVmYXVsdHMgPSBzdGF0ZS5zaG93RGVmYXVsdHMgIT09IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBnU3RhdGVDb2RlLmNsb25lU3RhdGUoc3RhdGUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBuZXh0UGFnZTogKHN0YXRlOiBJU3RhdGUpOiBJU3RhdGUgPT4ge1xyXG5cclxuICAgICAgICBzdGF0ZS5jdXJyZW50UGFnZUluZGV4Kys7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZS5jdXJyZW50UGFnZUluZGV4ID4gc3RhdGUucGFnZXMubGVuZ3RoIC0gMSkge1xyXG5cclxuICAgICAgICAgICAgc3RhdGUuY3VycmVudFBhZ2VJbmRleCA9IHN0YXRlLnBhZ2VzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJldmlvdXNQYWdlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIHN0YXRlLmN1cnJlbnRQYWdlSW5kZXgtLTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlLmN1cnJlbnRQYWdlSW5kZXggPCAtMSkge1xyXG5cclxuICAgICAgICAgICAgc3RhdGUuY3VycmVudFBhZ2VJbmRleCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZ1N0YXRlQ29kZS5jbG9uZVN0YXRlKHN0YXRlKTtcclxuICAgIH0sXHJcblxyXG4gICAgY2FsY3VsYXRlOiAoc3RhdGU6IElTdGF0ZSk6IElTdGF0ZSA9PiB7XHJcblxyXG4gICAgICAgIHBlbnRTaWRlQ2FsY3VsYXRpb25Db2RlLmNhbGN1bGF0ZShzdGF0ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGdTdGF0ZUNvZGUuY2xvbmVTdGF0ZShzdGF0ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwZW50U2lkZUFjdGlvbnM7XHJcbiIsImltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5cclxuXHJcbmNvbnN0IGlucHV0Vmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGROdW1iZXJWaWV3OiAoXHJcbiAgICAgICAgaWQ6IHN0cmluZyxcclxuICAgICAgICB2YWx1ZTogbnVtYmVyIHwgbnVsbCxcclxuICAgICAgICByZXF1aXJlZDogYm9vbGVhbixcclxuICAgICAgICAvLyByYW5nZU1pbjogbnVtYmVyLFxyXG4gICAgICAgIC8vIHJhbmdlTWF4OiBudW1iZXIsXHJcbiAgICAgICAgbGFiZWw6IHN0cmluZyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogc3RyaW5nLFxyXG4gICAgICAgIGVycm9yOiBzdHJpbmcgfCBudWxsLFxyXG4gICAgICAgIGFjdGlvbjogKHN0YXRlOiBJU3RhdGUsIGVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQpID0+IElTdGF0ZVxyXG4gICAgKTogVk5vZGUgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCB2aWV3OiBWTm9kZSA9XHJcblxyXG4gICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibmZ0LWktbnVtZXJpY1wiIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoXCJoNFwiLCB7fSwgYCR7bGFiZWx9YCksXHJcblxyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcImlucHV0LXdyYXBwZXJcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInRpdGxlLXRhYmxlXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwidGl0bGUtcm93XCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInRpdGxlLWNlbGxcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcImVycm9yXCIgfSwgYCR7ZXJyb3IgPz8gJyd9YCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoXCJpbnB1dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogYCR7aWR9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBgJHt2YWx1ZSA/PyAwfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogcmVxdWlyZWQgPT09IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJpbmRleDogMCwgLy8gaWYgdGhpcyBpcyBub3Qgc2V0IGl0IGlzIG5vdCBmb2N1c2FibGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1pbjogcmFuZ2VNaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXg6IHJhbmdlTWF4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogYCR7cGxhY2Vob2xkZXJ9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSW5wdXQ6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXCJcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfSxcclxuXHJcbiAgICBidWlsZFNlbGVjdFZpZXc6IChcclxuICAgICAgICBzZWxlY3RlZFZhbHVlOiBzdHJpbmcsXHJcbiAgICAgICAgbGFiZWw6IHN0cmluZyxcclxuICAgICAgICBwbGFjZWhvbGRlcjogc3RyaW5nLFxyXG4gICAgICAgIG9wdGlvblZhbHVlczogQXJyYXk8c3RyaW5nPixcclxuICAgICAgICBhY3Rpb246IChzdGF0ZTogSVN0YXRlLCBlbGVtZW50OiBIVE1MU2VsZWN0RWxlbWVudCkgPT4gSVN0YXRlXHJcbiAgICApOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGxldCBzZWxlY3RDbGFzc2VzOiBzdHJpbmcgPSBcIm5mdC1pLXNlbGVjdFwiO1xyXG4gICAgICAgIGxldCBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBzZWxlY3Rpb25NYWRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGNvbnN0IG9wdGlvblZpZXdzOiBWTm9kZVtdID0gW1xyXG5cclxuICAgICAgICAgICAgaChcIm9wdGlvblwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcInNlbGVjdC1kZWZhdWx0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBgLS1zZWxlY3QgJHtwbGFjZWhvbGRlcn0tLWBcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIG9wdGlvblZhbHVlcy5mb3JFYWNoKChjaG9pY2U6IHN0cmluZykgPT4ge1xyXG5cclxuICAgICAgICAgICAgaWYgKGNob2ljZSA9PT0gc2VsZWN0ZWRWYWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbk1hZGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgb3B0aW9uVmlld3MucHVzaChcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaChcIm9wdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGAke2Nob2ljZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGAke2Nob2ljZX1gXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChzZWxlY3Rpb25NYWRlKSB7XHJcblxyXG4gICAgICAgICAgICBzZWxlY3RDbGFzc2VzID0gYCR7c2VsZWN0Q2xhc3Nlc30gc2VsZWN0ZWRgO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiBgJHtzZWxlY3RDbGFzc2VzfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgaChcImg0XCIsIHt9LCBgJHtsYWJlbH1gKSxcclxuICAgICAgICAgICAgICAgICAgICBoKFwic2VsZWN0XCIsIHt9LCBvcHRpb25WaWV3cylcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5wdXRWaWV3cztcclxuXHJcbiIsImltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgcGVudFNpZGVBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL3BlbnRTaWRlQWN0aW9uc1wiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgaW5wdXRWaWV3cyBmcm9tIFwiLi9pbnB1dFZpZXdzXCI7XHJcblxyXG5cclxuY29uc3QgYnVpbGRTaG93SGlkZUJ1dHRvbiA9IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgPT4ge1xyXG5cclxuICAgIGxldCBsYWJlbDogc3RyaW5nO1xyXG5cclxuICAgIGlmICghc3RhdGUuc2hvd0RlZmF1bHRzKSB7XHJcblxyXG4gICAgICAgIGxhYmVsID0gJ1Nob3cgZGVmYXVsdHMnO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgbGFiZWwgPSAnSGlkZSBkZWZhdWx0cyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBwZW50U2lkZUFjdGlvbnMubWluaW1pc2VEZWZhdWx0cyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYCR7bGFiZWx9YFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHZpZXc7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZElucHV0c1ZpZXcgPSAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlW10gPT4ge1xyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlW10gPSBbXHJcblxyXG4gICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAnbWF4U3R1ZERpc3RhbmNlJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5tYXhTdHVkRGlzdGFuY2UsXHJcbiAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICdNYXggaW50ZXItc3R1ZCBkaXN0YW5jZSAobW0pJyxcclxuICAgICAgICAgICAgJ01heCBpbnRlci1zdHVkIGRpc3RhbmNlJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5tYXhTdHVkRGlzdGFuY2VFcnJvcixcclxuICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldE1heFN0dWREaXN0YW5jZVxyXG4gICAgICAgICksXHJcblxyXG4gICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAnZnJhbWluZ1NpemVQaXZvdCcsXHJcbiAgICAgICAgICAgIHN0YXRlLnBlbnQuZnJhbWluZ1NpemVQaXZvdCxcclxuICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgJ0ZyYW1pbmcgcGl2b3Qgc3RhbmRhcmQgdG8gaGVhdnkgKG1tKScsXHJcbiAgICAgICAgICAgICdGcmFtaW5nIHBpdm90IHN0YW5kYXJkIHRvIGhlYXZ5JyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5mcmFtaW5nU2l6ZVBpdm90RXJyb3IsXHJcbiAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRGcmFtaW5nU2l6ZVBpdm90XHJcbiAgICAgICAgKSxcclxuXHJcbiAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICdmbG9vck92ZXJoYW5nU3RhbmRhcmQnLFxyXG4gICAgICAgICAgICBzdGF0ZS5wZW50LmZsb29yT3ZlcmhhbmdTdGFuZGFyZCxcclxuICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgJ1BhbmVsIGZsb29yIG92ZXJoYW5nIChtbSknLFxyXG4gICAgICAgICAgICAnUGFuZWwgZmxvb3Igb3ZlcmhhbmcnLFxyXG4gICAgICAgICAgICBzdGF0ZS5wZW50LmZsb29yT3ZlcmhhbmdTdGFuZGFyZEVycm9yLFxyXG4gICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0Rmxvb3JPdmVyaGFuZ1N0YW5kYXJkXHJcbiAgICAgICAgKSxcclxuXHJcbiAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICdmbG9vck92ZXJoYW5nSGVhdnknLFxyXG4gICAgICAgICAgICBzdGF0ZS5wZW50LmZsb29yT3ZlcmhhbmdIZWF2eSxcclxuICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgJ0hlYXZ5IGR1dHkgcGFuZWwgZmxvb3Igb3ZlcmhhbmcgKG1tKScsXHJcbiAgICAgICAgICAgICdIZWF2eSBkdXR5IGZsb29yIG92ZXJoYW5nJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5mbG9vck92ZXJoYW5nSGVhdnlFcnJvcixcclxuICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldEZsb29yT3ZlcmhhbmdIZWF2eVxyXG4gICAgICAgICksXHJcblxyXG4gICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAnc2hpcGxhcEJvdHRvbU92ZXJoYW5nJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5zaGlwbGFwQm90dG9tT3ZlcmhhbmcsXHJcbiAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICdTaGlwbGFwIGJvdHRvbSBvdmVyaGFuZyAobW0pJyxcclxuICAgICAgICAgICAgJ1NoaXBsYXAgYm90dG9tIG92ZXJoYW5nJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5zaGlwbGFwQm90dG9tT3ZlcmhhbmdFcnJvcixcclxuICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldFNoaXBsYXBCb3R0b21PdmVyaGFuZ1xyXG4gICAgICAgICksXHJcblxyXG4gICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAnbWF4UGFuZWxMZW5ndGgnLFxyXG4gICAgICAgICAgICBzdGF0ZS5wZW50Lm1heFBhbmVsTGVuZ3RoLFxyXG4gICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAnTWF4IHNpZGUgbGVuZ3RoIChtbSknLFxyXG4gICAgICAgICAgICAnTWF4IHNpZGUgbGVuZ3RoJyxcclxuICAgICAgICAgICAgc3RhdGUucGVudC5tYXhQYW5lbExlbmd0aEVycm9yLFxyXG4gICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0TWF4UGFuZWxMZW5ndGhcclxuICAgICAgICApLFxyXG4gICAgXTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGJ1aWxkTWluaW1pc2VkVmlldyA9IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgPT4ge1xyXG5cclxuICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcIm5mdC1jb2xsYXBzZS1ncm91cCBtaW5pbWlzZWRcIiB9LCBbXHJcblxyXG4gICAgICAgICAgICBidWlsZFNob3dIaWRlQnV0dG9uKHN0YXRlKVxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgIHJldHVybiB2aWV3O1xyXG59O1xyXG5cclxuY29uc3QgYnVpbGRNYXhpbWlzZWRWaWV3ID0gKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwibmZ0LWNvbGxhcHNlLWdyb3VwXCIgfSwgW1xyXG5cclxuICAgICAgICAgICAgYnVpbGRTaG93SGlkZUJ1dHRvbihzdGF0ZSksXHJcbiAgICAgICAgICAgIC4uLmJ1aWxkSW5wdXRzVmlldyhzdGF0ZSlcclxuICAgICAgICBdKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxufTtcclxuXHJcbmNvbnN0IGRlZmF1bHRWaWV3cyA9IHtcclxuXHJcbiAgICBidWlsZFZpZXc6IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICAgICAgaWYgKCFzdGF0ZS5zaG93RGVmYXVsdHMpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBidWlsZE1pbmltaXNlZFZpZXcoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkTWF4aW1pc2VkVmlldyhzdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmYXVsdFZpZXdzO1xyXG5cclxuIiwiaW1wb3J0IHsgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCBwZW50U2lkZUFjdGlvbnMgZnJvbSBcIi4uL2FjdGlvbnMvcGVudFNpZGVBY3Rpb25zXCI7XHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVN0YXRlXCI7XHJcbmltcG9ydCBpbnB1dFZpZXdzIGZyb20gXCIuL2lucHV0Vmlld3NcIjtcclxuXHJcblxyXG5jb25zdCBzaGVkVmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJuZnQtZGlzcGxheS1ncm91cFwiIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoXCJoNFwiLCB7IGNsYXNzOiBcImxhYmVsXCIgfSwgXCJTaGVkXCIpLFxyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcImRpc3BsYXktY29udGVudHNcIiB9LCBbXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmxvb3JEZXB0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuZmxvb3JEZXB0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Zsb29yIGRlcHRoIChtbSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnRmxvb3IgZGVwdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmZsb29yRGVwdGhFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldEZsb29yRGVwdGhcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2Zyb250SGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5mcm9udEhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Zyb250IGhlaWdodCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Zyb250IGhlaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuZnJvbnRIZWlnaHRFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldEZyb250SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrSGVpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5iYWNrSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQmFjayBoZWlnaHQgKG1tKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdCYWNrIGhlaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuYmFja0hlaWdodEVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0QmFja0hlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGRTZWxlY3RWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtzdGF0ZS5wZW50LnNpZGVDb3VudH1gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2lkZSBidWlsZCBjb3VudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzaWRlIGJ1aWxkIGNvdW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgWycxJywgJzInXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldFNpZGVDb3VudFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzaGVkVmlld3M7XHJcblxyXG4iLCJpbXBvcnQgeyBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHBlbnRTaWRlQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9wZW50U2lkZUFjdGlvbnNcIjtcclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuaW1wb3J0IGlucHV0Vmlld3MgZnJvbSBcIi4vaW5wdXRWaWV3c1wiO1xyXG5cclxuXHJcbmNvbnN0IHNoZWREaXNwbGF5Vmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJuZnQtZGlzcGxheS1ncm91cFwiIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoXCJoNFwiLCB7IGNsYXNzOiBcImxhYmVsXCIgfSwgXCJUaW1iZXJcIiksXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwiZGlzcGxheS1jb250ZW50c1wiIH0sIFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdmcmFtaW5nV2lkdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmZyYW1pbmdXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0ZyYW1pbmcgdGltYmVyIHdpZHRoIChtbSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnRnJhbWluZyB0aW1iZXIgd2lkdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmZyYW1pbmdXaWR0aEVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0RnJhbWluZ1dpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdmcmFtaW5nRGVwdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmZyYW1pbmdEZXB0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0ZyYW1pbmcgdGltYmVyIGRlcHRoIChtbSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnRnJhbWluZyB0aW1iZXIgZGVwdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LmZyYW1pbmdEZXB0aEVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0RnJhbWluZ0RlcHRoXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRWaWV3cy5idWlsZE51bWJlclZpZXcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdyb29mUmFpbFdpZHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5yb29mUmFpbFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnUm9vZiByYWlsIHRpbWJlciB3aWR0aCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1Jvb2YgcmFpbCB0aW1iZXIgd2lkdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LnJvb2ZSYWlsV2lkdGhFcnJvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVudFNpZGVBY3Rpb25zLnNldFJvb2ZSYWlsV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnB1dFZpZXdzLmJ1aWxkTnVtYmVyVmlldyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3Jvb2ZSYWlsRGVwdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wZW50LnJvb2ZSYWlsRGVwdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdSb29mIHJhaWwgdGltYmVyIGRlcHRoIChtbSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnUm9vZiByYWlsIHRpbWJlciBkZXB0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQucm9vZlJhaWxEZXB0aEVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0Um9vZlJhaWxEZXB0aFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnc2hpcGxhcEJ1dHRpbmdXaWR0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcEJ1dHRpbmdXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1NoaXBsYXAgYnV0dGluZyB3aWR0aCAobW0pJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1NoaXBsYXAgYnV0dGluZyB3aWR0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcEJ1dHRpbmdXaWR0aEVycm9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZW50U2lkZUFjdGlvbnMuc2V0U2hpcGxhcEJ1dHRpbmdXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0Vmlld3MuYnVpbGROdW1iZXJWaWV3KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnc2hpcGxhcERlcHRoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUucGVudC5zaGlwbGFwRGVwdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdTaGlwbGFwIGRlcHRoIChtbSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnU2hpcGxhcCBkZXB0aCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnBlbnQuc2hpcGxhcERlcHRoRXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbnRTaWRlQWN0aW9ucy5zZXRTaGlwbGFwRGVwdGhcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3O1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc2hlZERpc3BsYXlWaWV3cztcclxuXHJcbiIsIi8vIGltcG9ydCB7IGh9IGZyb20gXCIuLi8uLi8uLi8uLi9kZWZpbml0aW9ucy9oeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgZGVmYXVsdFZpZXdzIGZyb20gXCIuL2RlZmF1bHRWaWV3c1wiO1xyXG5pbXBvcnQgc2hlZFZpZXdzIGZyb20gXCIuL3NoZWRWaWV3c1wiO1xyXG5pbXBvcnQgdGltYmVyVmlld3MgZnJvbSBcIi4vdGltYmVyVmlld3NcIjtcclxuaW1wb3J0IHBlbnRTaWRlQWN0aW9ucyBmcm9tIFwiLi4vYWN0aW9ucy9wZW50U2lkZUFjdGlvbnNcIjtcclxuXHJcblxyXG5jb25zdCBwZW50U2lkZUlucHV0Vmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlID0+IHtcclxuXHJcbiAgICAgICAgY29uc3QgdmlldzogVk5vZGUgPVxyXG5cclxuICAgICAgICAgICAgaChcImRpdlwiLCB7IGlkOiBcInN0ZXBWaWV3XCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInN0ZXAtZGlzY3Vzc2lvblwiIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwiZGlzY3Vzc2lvblwiIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcImg0XCIsIHsgY2xhc3M6IFwidGl0bGUtdGV4dFwiIH0sIFwiUGVudCBzaGVkIHNpZGUgY2FsY3VsYXRvclwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGlkOiBcImlucHV0Vmlld1wiIH0sIFtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0Vmlld3MuYnVpbGRWaWV3KHN0YXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoZWRWaWV3cy5idWlsZFZpZXcoc3RhdGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltYmVyVmlld3MuYnVpbGRWaWV3KHN0YXRlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwic3RlcC1vcHRpb25zXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoXCJhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBcIm9wdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogcGVudFNpZGVBY3Rpb25zLmNhbGN1bGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaChcInBcIiwge30sIFwiQ2FsY3VsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwZW50U2lkZUlucHV0Vmlld3M7XHJcblxyXG4iLCJpbXBvcnQgeyBDaGlsZHJlbiB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9oeXBlckFwcC9oeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IElWaWV3RWxlbWVudCBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JVmlld0VsZW1lbnRcIjtcclxuXHJcblxyXG5jb25zdCBidWlsZFBhdHRlcm5WaWV3ID0gKFxyXG4gICAgdmlld3M6IENoaWxkcmVuW10sXHJcbiAgICBub2RlOiBJVmlld0VsZW1lbnQpOiB2b2lkID0+IHtcclxuXHJcbiAgICBpZiAobm9kZS52YWx1ZSkge1xyXG5cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlLnZhbHVlKSkge1xyXG5cclxuICAgICAgICAgICAgdmlld3MucHVzaChcclxuICAgICAgICAgICAgICAgIGgoXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Vmlld3MuYnVpbGRWaWV3KG5vZGUudmFsdWUpXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdHJpbmdcclxuICAgICAgICAgICAgdmlld3MucHVzaChcclxuICAgICAgICAgICAgICAgIGgoXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnZhbHVlXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBlbGVtZW50Vmlld3MgPSB7XHJcblxyXG4gICAgYnVpbGRWaWV3OiAodmlld1BhdHRlcm5zOiBBcnJheTxJVmlld0VsZW1lbnQ+KTogQ2hpbGRyZW5bXSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdzOiBDaGlsZHJlbltdID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmlld1BhdHRlcm5zLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBidWlsZFBhdHRlcm5WaWV3KFxyXG4gICAgICAgICAgICAgICAgdmlld3MsXHJcbiAgICAgICAgICAgICAgICB2aWV3UGF0dGVybnNbaV1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2aWV3cztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGVsZW1lbnRWaWV3cztcclxuXHJcbiIsIi8vIGltcG9ydCB7IGh9IGZyb20gXCIuLi8uLi8uLi8uLi9kZWZpbml0aW9ucy9oeXBlci1hcHAtbG9jYWxcIjtcclxuaW1wb3J0IHsgVk5vZGUgfSBmcm9tIFwiaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IGggfSBmcm9tIFwiLi4vLi4vLi4vLi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgZWxlbWVudFZpZXdzIGZyb20gXCIuL2VsZW1lbnRWaWV3c1wiO1xyXG5pbXBvcnQgcGVudFNpZGVBY3Rpb25zIGZyb20gXCIuLi9hY3Rpb25zL3BlbnRTaWRlQWN0aW9uc1wiO1xyXG5cclxuXHJcbmNvbnN0IGJ1aWxkUGFnZUJhY2t3YXJkcyA9IChfc3RhdGU6IElTdGF0ZSk6IFZOb2RlID0+IHtcclxuXHJcbiAgICBjb25zdCB2aWV3ID1cclxuXHJcbiAgICAgICAgaChcImFcIixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb25DbGljazogcGVudFNpZGVBY3Rpb25zLnByZXZpb3VzUGFnZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInBhZ2UtYmFja3dhcmRzLWljb25cIiB9LCBcIlwiKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxuXHJcbn07XHJcblxyXG5jb25zdCBidWlsZFBhZ2VGb3J3YXJkcyA9IChzdGF0ZTogSVN0YXRlKTogVk5vZGUgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoc3RhdGUuY3VycmVudFBhZ2VJbmRleCA+PSBzdGF0ZS5wYWdlcy5sZW5ndGggLSAxKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZpZXcgPVxyXG5cclxuICAgICAgICBoKFwiYVwiLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBwZW50U2lkZUFjdGlvbnMubmV4dFBhZ2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJwYWdlLWZvcndhcmRzLWljb25cIiB9LCBcIlwiKVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICByZXR1cm4gdmlldztcclxuXHJcbn07XHJcblxyXG5jb25zdCBwZW50U2lkZVBhZ2VzVmlldyA9IHtcclxuXHJcbiAgICBidWlsZFBhZ2VWaWV3OiAoc3RhdGU6IElTdGF0ZSk6IFZOb2RlIHwgbnVsbCA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gc3RhdGUucGFnZXNbc3RhdGUuY3VycmVudFBhZ2VJbmRleF07XHJcblxyXG4gICAgICAgIGlmICghY3VycmVudFBhZ2UudmFsdWVcclxuICAgICAgICAgICAgfHwgIUFycmF5LmlzQXJyYXkoY3VycmVudFBhZ2UudmFsdWUpXHJcbiAgICAgICAgKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID1cclxuXHJcbiAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBpZDogXCJzdGVwVmlld1wiIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJzdGVwLWRpc2N1c3Npb25cIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcImRpc2N1c3Npb25cIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJoNFwiLCB7IGNsYXNzOiBcInRpdGxlLXRleHRcIiB9LCBcIlBlbnQgc2lkZVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGlkOiBcImlucHV0Vmlld1wiIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJuZnQtaS1wYXR0ZXJuXCIgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJuZnQtaS1wYWdlXCIgfSwgW1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFZpZXdzLmJ1aWxkVmlldyhjdXJyZW50UGFnZS52YWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBoKFwiZGl2XCIsIHsgY2xhc3M6IFwic3RlcC1wYWdlLWJ1dHRvbnNcIiB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaChcImRpdlwiLCB7IGNsYXNzOiBcInBhZ2UtYmFja3dhcmRzXCIgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFnZUJhY2t3YXJkcyhzdGF0ZSlcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoXCJkaXZcIiwgeyBjbGFzczogXCJwYWdlLWZvcndhcmRzXCIgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkUGFnZUZvcndhcmRzKHN0YXRlKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdmlldztcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHBlbnRTaWRlUGFnZXNWaWV3O1xyXG5cclxuIiwiLy8gaW1wb3J0IHsgaH0gZnJvbSBcIi4uLy4uLy4uLy4uL2RlZmluaXRpb25zL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gXCJoeXBlci1hcHAtbG9jYWxcIjtcclxuXHJcbmltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVN0YXRlXCI7XHJcbmltcG9ydCBwZW50U2lkZUlucHV0Vmlld3MgZnJvbSBcIi4vcGVudFNpZGVJbnB1dFZpZXdzXCI7XHJcbmltcG9ydCBwZW50U2lkZVBhZ2VzVmlldyBmcm9tIFwiLi9wZW50U2lkZVBhZ2VzVmlld1wiO1xyXG5cclxuaW1wb3J0IFwiLi4vc2Nzcy9wZW50U2lkZS5zY3NzXCI7XHJcbmltcG9ydCBcIi4uL3Njc3MvaW5wdXRzLnNjc3NcIjtcclxuXHJcblxyXG5jb25zdCBwZW50U2lkZVZpZXdzID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSB8IG51bGwgPT4ge1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUucGFnZXNcclxuICAgICAgICAgICAgJiYgc3RhdGUucGFnZXMubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAmJiBzdGF0ZS5jdXJyZW50UGFnZUluZGV4ID4gLTFcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBlbnRTaWRlUGFnZXNWaWV3LmJ1aWxkUGFnZVZpZXcoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBlbnRTaWRlSW5wdXRWaWV3cy5idWlsZFZpZXcoc3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHBlbnRTaWRlVmlld3M7XHJcblxyXG4iLCIvLyBpbXBvcnQgeyBofSBmcm9tIFwiLi4vLi4vLi4vLi4vZGVmaW5pdGlvbnMvaHlwZXItYXBwLWxvY2FsXCI7XHJcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSBcImh5cGVyLWFwcC1sb2NhbFwiO1xyXG5pbXBvcnQgeyBoIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2h5cGVyQXBwL2h5cGVyLWFwcC1sb2NhbFwiO1xyXG5cclxuaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVcIjtcclxuaW1wb3J0IHBlbnRTaWRlVmlld3MgZnJvbSBcIi4uLy4uL3BlbnRTaWRlL3ZpZXdzL3BlbnRTaWRlVmlld3NcIjtcclxuXHJcbmltcG9ydCBcIi4uL3Njc3MvaW5kZXguc2Nzc1wiO1xyXG5cclxuXHJcbmNvbnN0IGluaXRWaWV3ID0ge1xyXG5cclxuICAgIGJ1aWxkVmlldzogKHN0YXRlOiBJU3RhdGUpOiBWTm9kZSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXc6IFZOb2RlID0gaChcImRpdlwiLCB7IGlkOiBcInRyZWVTb2x2ZUF1dGhvclwiIH0sXHJcblxyXG4gICAgICAgICAgICBwZW50U2lkZVZpZXdzLmJ1aWxkVmlldyhzdGF0ZSksXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHZpZXc7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBpbml0VmlldztcclxuXHJcbiIsImltcG9ydCBJUGVudCBmcm9tIFwiLi4vaW50ZXJmYWNlcy9JUGVudFwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlbnQgaW1wbGVtZW50cyBJUGVudCB7XHJcblxyXG4gICAgLy8gZGVmYXVsdHNcclxuICAgIHB1YmxpYyBtYXhTdHVkRGlzdGFuY2U6IG51bWJlciA9IDQwMDtcclxuICAgIHB1YmxpYyBmcmFtaW5nU2l6ZVBpdm90OiBudW1iZXIgPSA1MDtcclxuICAgIHB1YmxpYyBmbG9vck92ZXJoYW5nU3RhbmRhcmQ6IG51bWJlciA9IDEwO1xyXG4gICAgcHVibGljIGZsb29yT3ZlcmhhbmdIZWF2eTogbnVtYmVyID0gMTU7XHJcbiAgICBwdWJsaWMgbWF4UGFuZWxMZW5ndGg6IG51bWJlciA9IDQwMDA7XHJcbiAgICBwdWJsaWMgYnVpbGRQYW5lbHNUb2dldGhlcjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHNoZWQgbWVhc3VyZW1lbnRzXHJcbiAgICBwdWJsaWMgZmxvb3JEZXB0aDogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBmcm9udEhlaWdodDogbnVtYmVyID0gMDtcclxuICAgIHB1YmxpYyBiYWNrSGVpZ2h0OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIC8vIGZyYW1lIHNpemVzXHJcbiAgICBwdWJsaWMgZnJhbWluZ1dpZHRoOiBudW1iZXIgPSA0NTtcclxuICAgIHB1YmxpYyBmcmFtaW5nRGVwdGg6IG51bWJlciA9IDMzO1xyXG4gICAgcHVibGljIHJvb2ZSYWlsV2lkdGg6IG51bWJlciA9IDY5O1xyXG4gICAgcHVibGljIHJvb2ZSYWlsRGVwdGg6IG51bWJlciA9IDM0O1xyXG4gICAgcHVibGljIHNoaXBsYXBCb3R0b21PdmVyaGFuZzogbnVtYmVyID0gMzU7XHJcbiAgICBwdWJsaWMgc2hpcGxhcEJ1dHRpbmdXaWR0aDogbnVtYmVyID0gMTEyO1xyXG4gICAgcHVibGljIHNoaXBsYXBEZXB0aDogbnVtYmVyID0gMTI7XHJcblxyXG4gICAgcHVibGljIHNpZGVDb3VudDogbnVtYmVyID0gMjtcclxuXHJcbiAgICBwdWJsaWMgbWF4U3R1ZERpc3RhbmNlRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGZyYW1pbmdTaXplUGl2b3RFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgZmxvb3JPdmVyaGFuZ1N0YW5kYXJkRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGZsb29yT3ZlcmhhbmdIZWF2eUVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBtYXhQYW5lbExlbmd0aEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBidWlsZFBhbmVsc1RvZ2V0aGVyRXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8vIHNoZWQgbWVhc3VyZW1lbnRzXHJcbiAgICBwdWJsaWMgZmxvb3JEZXB0aEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBmcm9udEhlaWdodEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBiYWNrSGVpZ2h0RXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgcHVibGljIGZyYW1pbmdXaWR0aEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBmcmFtaW5nRGVwdGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAvLyBmcmFtZSBzaXplc1xyXG4gICAgcHVibGljIHJvb2ZSYWlsV2lkdGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgcm9vZlJhaWxEZXB0aEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzaGlwbGFwQm90dG9tT3ZlcmhhbmdFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwdWJsaWMgc2hpcGxhcEJ1dHRpbmdXaWR0aEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxuICAgIHB1YmxpYyBzaGlwbGFwRGVwdGhFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBcclxuICAgIHB1YmxpYyBzaWRlQ291bnRFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblxyXG59XHJcbiIsImltcG9ydCBJUGVudCBmcm9tIFwiLi4vaW50ZXJmYWNlcy9JUGVudFwiO1xyXG5pbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9pbnRlcmZhY2VzL0lTdGF0ZVwiO1xyXG5pbXBvcnQgUGVudCBmcm9tIFwiLi9QZW50XCI7XHJcbmltcG9ydCBJVmlld0VsZW1lbnQgZnJvbSBcIi4uL2ludGVyZmFjZXMvSVZpZXdFbGVtZW50XCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGUgaW1wbGVtZW50cyBJU3RhdGUge1xyXG5cclxuICAgIHB1YmxpYyBwZW50OiBJUGVudCA9IG5ldyBQZW50KCk7XHJcbiAgICBwdWJsaWMgc2hvd0RlZmF1bHRzOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgcGFnZXM6IEFycmF5PElWaWV3RWxlbWVudD4gPSBbXTtcclxuICAgIHB1YmxpYyBjdXJyZW50UGFnZUluZGV4OiBudW1iZXIgPSAwO1xyXG59XHJcbiIsImltcG9ydCBJU3RhdGUgZnJvbSBcIi4uLy4uLy4uL2ludGVyZmFjZXMvSVN0YXRlXCI7XHJcbmltcG9ydCBJU3RhdGVBbnlBcnJheSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9JU3RhdGVBbnlBcnJheVwiO1xyXG5pbXBvcnQgU3RhdGUgZnJvbSBcIi4uLy4uLy4uL3N0YXRlL1N0YXRlXCI7XHJcblxyXG5cclxuY29uc3QgaW5pdFN0YXRlID0ge1xyXG5cclxuICAgIGluaXRpYWxpc2U6ICgpOiBJU3RhdGVBbnlBcnJheSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlOiBJU3RhdGUgPSBuZXcgU3RhdGUoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaW5pdFN0YXRlO1xyXG5cclxuIiwiaW1wb3J0IHsgYXBwIH0gZnJvbSBcIi4vaHlwZXJBcHAvaHlwZXItYXBwLWxvY2FsXCI7XHJcblxyXG5pbXBvcnQgaW5pdFN1YnNjcmlwdGlvbnMgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvc3Vic2NyaXB0aW9ucy9pbml0U3Vic2NyaXB0aW9uc1wiO1xyXG5pbXBvcnQgaW5pdEV2ZW50cyBmcm9tIFwiLi9tb2R1bGVzL2NvbXBvbmVudHMvaW5pdC9jb2RlL2luaXRFdmVudHNcIjtcclxuaW1wb3J0IGluaXRWaWV3IGZyb20gXCIuL21vZHVsZXMvY29tcG9uZW50cy9pbml0L3ZpZXdzL2luaXRWaWV3XCI7XHJcbmltcG9ydCBpbml0U3RhdGUgZnJvbSBcIi4vbW9kdWxlcy9jb21wb25lbnRzL2luaXQvY29kZS9pbml0U3RhdGVcIjtcclxuXHJcblxyXG5pbml0RXZlbnRzLnJlZ2lzdGVyR2xvYmFsRXZlbnRzKCk7XHJcblxyXG4od2luZG93IGFzIGFueSkuQ29tcG9zaXRlRmxvd3NBdXRob3IgPSBhcHAoe1xyXG4gICAgXHJcbiAgICBub2RlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRyZWVTb2x2ZUF1dGhvclwiKSxcclxuICAgIGluaXQ6IGluaXRTdGF0ZS5pbml0aWFsaXNlLFxyXG4gICAgdmlldzogaW5pdFZpZXcuYnVpbGRWaWV3LFxyXG4gICAgc3Vic2NyaXB0aW9uczogaW5pdFN1YnNjcmlwdGlvbnMsXHJcbiAgICBvbkVuZDogaW5pdEV2ZW50cy5vblJlbmRlckZpbmlzaGVkXHJcbn0pO1xyXG5cclxuIl0sIm5hbWVzIjpbInByb3BzIiwidGltYmVyVmlld3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLGdCQUFnQjtBQUNwQixJQUFJLFlBQVk7QUFDaEIsSUFBSSxZQUFZO0FBQ2hCLElBQUksWUFBWSxDQUFFO0FBQ2xCLElBQUksWUFBWSxDQUFFO0FBQ2xCLElBQUksTUFBTSxVQUFVO0FBQ3BCLElBQUksVUFBVSxNQUFNO0FBQ3BCLElBQUksUUFDRixPQUFPLDBCQUEwQixjQUM3Qix3QkFDQTtBQUVOLElBQUksY0FBYyxTQUFTLEtBQUs7QUFDOUIsTUFBSSxNQUFNO0FBRVYsTUFBSSxPQUFPLFFBQVEsU0FBVSxRQUFPO0FBRXBDLE1BQUksUUFBUSxHQUFHLEtBQUssSUFBSSxTQUFTLEdBQUc7QUFDbEMsYUFBUyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLO0FBQ3hDLFdBQUssTUFBTSxZQUFZLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSTtBQUN0QyxnQkFBUSxPQUFPLE9BQU87QUFBQSxNQUN2QjtBQUFBLElBQ0Y7QUFB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
