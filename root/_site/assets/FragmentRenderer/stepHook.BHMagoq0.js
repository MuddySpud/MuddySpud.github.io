var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class HookRegistry {
  constructor() {
    __publicField(this, "stepHook", null);
  }
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
const runProcessStep = (step) => {
  let stepText = step.value;
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
    step.value = stepText;
    return true;
  }
  return false;
};
const printStepVariables = (step, stringOutput) => {
  var _a;
  if (!step.variable || step.variable.length === 0) {
    return null;
  }
  const stepVariables = step.variable;
  const openVariables = stringOutput.openVariables;
  let variableOutput = "";
  let start = "";
  let end = "";
  let variableName = "";
  const ulVariables = [
    "towerLocation",
    "growEasy",
    "frameCount",
    "frame",
    "moduleType",
    "moduleModel",
    "twin",
    "herbBay",
    "cropCategory"
  ];
  const resetVariables = [
    "demoEnd"
  ];
  for (const variable of stepVariables) {
    start = "<li>";
    end = "</li>";
    if (variable.length === 1) {
      variableName = variable[0].trim();
      variableOutput = `${variableName} = ${((_a = step.selected) == null ? void 0 : _a.option.trim()) ?? "no option selected"}`;
    } else {
      variableName = variable[0].trim();
      variableOutput = `${variableName} = ${variable[1].trim()}`;
    }
    if (stringOutput.nestingLevel === 0) {
      stringOutput.nestingLevel++;
      start = `<ul>${start}`;
    }
    if (resetVariables.includes(variableName) === true) {
      for (let k = 0; k < openVariables.length; k++) {
        start = `</ul>${start}`;
      }
      openVariables.length = 0;
      stringOutput.nestingLevel = 1;
    } else {
      let counter = 0;
      for (let i = openVariables.length - 1; i >= 0; i--) {
        counter++;
        if (openVariables[i] === variableName) {
          for (let j = 0; j < counter; j++) {
            start = `</ul>${start}`;
            stringOutput.nestingLevel--;
          }
          openVariables.length = i;
          break;
        }
      }
      if (ulVariables.includes(variableName) === true) {
        end = `${end}<ul>`;
        stringOutput.openVariables.push(variableName);
        stringOutput.nestingLevel++;
      }
    }
    variableOutput = `${start}${variableOutput}${end}`;
  }
  return variableOutput;
};
const printChainStepVariables = (state, step, stringOutput) => {
  var _a;
  if (!step) {
    return;
  }
  const stepVariable = printStepVariables(
    step,
    stringOutput
  );
  if (stepVariable) {
    stringOutput.output = `${stringOutput.output}
${stepVariable}`;
  }
  printChainStepVariables(
    state,
    (_a = step.link) == null ? void 0 : _a.root,
    stringOutput
  );
  printChainStepVariables(
    state,
    step.selected,
    stringOutput
  );
};
const printChainVariables = (state, step) => {
  var _a;
  const root = (_a = state.renderState.displayGuide) == null ? void 0 : _a.root;
  if (!root) {
    return;
  }
  let stringOutput = {
    output: "",
    nestingLevel: 0,
    openVariables: []
  };
  printChainStepVariables(
    state,
    root,
    stringOutput
  );
  for (let i = 0; i < stringOutput.nestingLevel; i++) {
    stringOutput.output = `${stringOutput.output}</ul>`;
  }
  step.value = `${step.value}
${stringOutput.output}`;
};
const stepHook = {
  processStep: (state, step) => {
    try {
      const runProcess = runProcessStep(step);
      if (!runProcess) {
        return;
      }
      printChainVariables(
        state,
        step
      );
    } catch (exp) {
      console.log(exp);
    }
  }
};
registerStepHook();
//# sourceMappingURL=stepHook.BHMagoq0.js.map
