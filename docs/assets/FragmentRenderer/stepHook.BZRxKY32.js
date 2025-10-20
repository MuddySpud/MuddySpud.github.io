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
    "powerSupply"
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcEhvb2suQlpSeEtZMzIuanMiLCJzb3VyY2VzIjpbIi4uL3Jvb3Qvc3JjMi9Ib29rUmVnaXN0cnkudHMiLCIuLi9yb290L3NyYzIvc3RlcEhvb2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IElTdGF0ZSBmcm9tIFwiLi4vc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9zdGF0ZS9JU3RhdGVcIjtcclxuaW1wb3J0IElSZW5kZXJGcmFnbWVudCBmcm9tIFwiLi4vc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9zdGF0ZS9yZW5kZXIvSVJlbmRlckZyYWdtZW50XCI7XHJcbmltcG9ydCBJSG9va1JlZ2lzdHJ5IGZyb20gXCIuLi9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3dpbmRvdy9JSG9va1JlZ2lzdHJ5XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIb29rUmVnaXN0cnkgaW1wbGVtZW50cyBJSG9va1JlZ2lzdHJ5IHtcclxuXHJcbiAgICBwcml2YXRlIHN0ZXBIb29rOiAoKHN0YXRlOiBJU3RhdGUsIHN0ZXA6IElSZW5kZXJGcmFnbWVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgcmVnaXN0ZXJTdGVwSG9vayhob29rOiAoc3RhdGU6IElTdGF0ZSwgc3RlcDogSVJlbmRlckZyYWdtZW50KSA9PiB2b2lkKTogdm9pZCB7XHJcblxyXG4gICAgICAgIHRoaXMuc3RlcEhvb2sgPSBob29rO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBleGVjdXRlU3RlcEhvb2soXHJcbiAgICAgICAgc3RhdGU6IElTdGF0ZSxcclxuICAgICAgICBzdGVwOiBJUmVuZGVyRnJhZ21lbnRcclxuICAgICk6IHZvaWQge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zdGVwSG9vaykge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGVwSG9vayhcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc3RlcFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgSVN0YXRlIGZyb20gXCIuLi9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL0lTdGF0ZVwiO1xyXG5pbXBvcnQgZ1N0YXRlQ29kZSBmcm9tIFwiLi4vc3JjL21vZHVsZXMvZ2xvYmFsL2NvZGUvZ1N0YXRlQ29kZVwiO1xyXG5pbXBvcnQgSVJlbmRlckZyYWdtZW50IGZyb20gXCIuLi9zcmMvbW9kdWxlcy9pbnRlcmZhY2VzL3N0YXRlL3JlbmRlci9JUmVuZGVyRnJhZ21lbnRcIjtcclxuaW1wb3J0IElIb29rUmVnaXN0cnkgZnJvbSBcIi4uL3NyYy9tb2R1bGVzL2ludGVyZmFjZXMvd2luZG93L0lIb29rUmVnaXN0cnlcIjtcclxuaW1wb3J0IEhvb2tSZWdpc3RyeSBmcm9tIFwiLi9Ib29rUmVnaXN0cnlcIlxyXG5pbXBvcnQgSURpc3BsYXlDaGFydCBmcm9tIFwiLi4vc3JjL21vZHVsZXMvaW50ZXJmYWNlcy9zdGF0ZS9kaXNwbGF5L0lEaXNwbGF5Q2hhcnRcIjtcclxuaW1wb3J0IElTdHJpbmdPdXRwdXQgZnJvbSBcIi4vSVN0cmluZ091dHB1dFwiO1xyXG5pbXBvcnQgZ1V0aWxpdGllcyBmcm9tIFwiLi4vc3JjL21vZHVsZXMvZ2xvYmFsL2dVdGlsaXRpZXNcIjtcclxuXHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcblxyXG4gICAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcblxyXG4gICAgICAgIEhvb2tSZWdpc3RyeTogSUhvb2tSZWdpc3RyeVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCByZWdpc3RlclN0ZXBIb29rID0gKCk6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghd2luZG93Lkhvb2tSZWdpc3RyeSkge1xyXG5cclxuICAgICAgICB3aW5kb3cuSG9va1JlZ2lzdHJ5ID0gbmV3IEhvb2tSZWdpc3RyeSgpO1xyXG4gICAgICAgIHdpbmRvdy5Ib29rUmVnaXN0cnkucmVnaXN0ZXJTdGVwSG9vayhzdGVwSG9vay5wcm9jZXNzU3RlcCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5jb25zdCBQUk9DRVNTX1NURVAgPSAnPHA+UFJPQ0VTU19TVEVQPC9wPic7XHJcblxyXG5jb25zdCBydW5Qcm9jZXNzU3RlcCA9IChzdGVwOiBJUmVuZGVyRnJhZ21lbnQpOiBib29sZWFuID0+IHtcclxuXHJcbiAgICBsZXQgc3RlcFRleHQgPSBzdGVwLnZhbHVlO1xyXG4gICAgbGV0IGZpcnN0bGluZUVuZEluZGV4ID0gc3RlcFRleHQuaW5kZXhPZignXFxuJyk7XHJcbiAgICBsZXQgZmlyc3RMaW5lID0gJyc7XHJcblxyXG4gICAgaWYgKGZpcnN0bGluZUVuZEluZGV4ID09PSAtMSkge1xyXG5cclxuICAgICAgICBmaXJzdExpbmUgPSBzdGVwVGV4dDtcclxuICAgICAgICBzdGVwVGV4dCA9ICcnXHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBmaXJzdExpbmUgPSBzdGVwVGV4dC5zdWJzdHJpbmcoMCwgZmlyc3RsaW5lRW5kSW5kZXgpO1xyXG4gICAgICAgIHN0ZXBUZXh0ID0gc3RlcFRleHQuc3Vic3RyaW5nKGZpcnN0bGluZUVuZEluZGV4ICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGZpcnN0TGluZS50cmltKCkgPT09IFBST0NFU1NfU1RFUCkge1xyXG5cclxuICAgICAgICBzdGVwLnZhbHVlID0gc3RlcFRleHQ7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbmNvbnN0IHByaW50U3RlcFZhcmlhYmxlcyA9IChcclxuICAgIHN0ZXA6IElSZW5kZXJGcmFnbWVudCxcclxuICAgIHN0cmluZ091dHB1dDogSVN0cmluZ091dHB1dFxyXG4pOiBzdHJpbmcgfCBudWxsID0+IHtcclxuXHJcbiAgICBpZiAoIXN0ZXAudmFyaWFibGVcclxuICAgICAgICB8fCBzdGVwLnZhcmlhYmxlLmxlbmd0aCA9PT0gMFxyXG4gICAgKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RlcFZhcmlhYmxlcyA9IHN0ZXAudmFyaWFibGU7XHJcbiAgICBjb25zdCBvcGVuVmFyaWFibGVzID0gc3RyaW5nT3V0cHV0Lm9wZW5WYXJpYWJsZXM7XHJcbiAgICBsZXQgdmFyaWFibGVPdXRwdXQgPSAnJztcclxuICAgIGxldCBvdXRwdXQgPSAnJztcclxuICAgIGxldCBzdGFydCA9ICcnO1xyXG4gICAgbGV0IGVuZCA9ICcnO1xyXG4gICAgbGV0IHZhcmlhYmxlTmFtZSA9ICcnO1xyXG5cclxuICAgIGNvbnN0IHVsVmFyaWFibGVzID0gW1xyXG4gICAgICAgIFwidG93ZXJMb2NhdGlvblwiLFxyXG4gICAgICAgIFwiZ3Jvd0Vhc3lcIixcclxuICAgICAgICBcImZyYW1lQ291bnRcIixcclxuICAgICAgICBcImZyYW1lXCIsXHJcbiAgICAgICAgXCJtb2R1bGVUeXBlXCIsXHJcbiAgICAgICAgXCJtb2R1bGVNb2RlbFwiLFxyXG4gICAgICAgIFwidHdpblwiLFxyXG4gICAgICAgIFwiaGVyYkJheVwiLFxyXG4gICAgICAgIFwiY3JvcENhdGVnb3J5XCJcclxuICAgIF1cclxuXHJcbiAgICBjb25zdCByZXNldFZhcmlhYmxlcyA9IFtcclxuICAgICAgICBcInBvd2VyU3VwcGx5XCJcclxuICAgIF1cclxuXHJcbiAgICBmb3IgKGNvbnN0IHZhcmlhYmxlIG9mIHN0ZXBWYXJpYWJsZXMpIHtcclxuXHJcbiAgICAgICAgc3RhcnQgPSAnPGxpPic7XHJcbiAgICAgICAgZW5kID0gJzwvbGk+JztcclxuXHJcbiAgICAgICAgaWYgKHZhcmlhYmxlLmxlbmd0aCA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgdmFyaWFibGVOYW1lID0gdmFyaWFibGVbMF0udHJpbSgpXHJcbiAgICAgICAgICAgIHZhcmlhYmxlT3V0cHV0ID0gYCR7dmFyaWFibGVOYW1lfSA9ICR7c3RlcC5zZWxlY3RlZD8ub3B0aW9uLnRyaW0oKSA/PyAnbm8gb3B0aW9uIHNlbGVjdGVkJ31gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyaWFibGVOYW1lID0gdmFyaWFibGVbMF0udHJpbSgpXHJcbiAgICAgICAgICAgIHZhcmlhYmxlT3V0cHV0ID0gYCR7dmFyaWFibGVOYW1lfSA9ICR7dmFyaWFibGVbMV0udHJpbSgpfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RyaW5nT3V0cHV0Lm5lc3RpbmdMZXZlbCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgc3RyaW5nT3V0cHV0Lm5lc3RpbmdMZXZlbCsrO1xyXG4gICAgICAgICAgICBzdGFydCA9IGA8dWw+JHtzdGFydH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlc2V0VmFyaWFibGVzLmluY2x1ZGVzKHZhcmlhYmxlTmFtZSkgPT09IHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgb3BlblZhcmlhYmxlcy5sZW5ndGg7IGsrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gYDwvdWw+JHtzdGFydH1gO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBvcGVuVmFyaWFibGVzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIHN0cmluZ091dHB1dC5uZXN0aW5nTGV2ZWwgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGNvdW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG9wZW5WYXJpYWJsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb3VudGVyKys7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9wZW5WYXJpYWJsZXNbaV0gPT09IHZhcmlhYmxlTmFtZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvdW50ZXI7IGorKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBgPC91bD4ke3N0YXJ0fWA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ091dHB1dC5uZXN0aW5nTGV2ZWwtLTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9wZW5WYXJpYWJsZXMubGVuZ3RoID0gaTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh1bFZhcmlhYmxlcy5pbmNsdWRlcyh2YXJpYWJsZU5hbWUpID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTmV4dCB2YXJpYWJsZSB3aWxsIGJlIHdpdGhpbiB0aGUgdWwgZm9yIHRocyB2YXJpYWJsZU5hbWVcclxuICAgICAgICAgICAgICAgIGVuZCA9IGAke2VuZH08dWw+YDtcclxuICAgICAgICAgICAgICAgIHN0cmluZ091dHB1dC5vcGVuVmFyaWFibGVzLnB1c2godmFyaWFibGVOYW1lKTtcclxuICAgICAgICAgICAgICAgIHN0cmluZ091dHB1dC5uZXN0aW5nTGV2ZWwrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyaWFibGVPdXRwdXQgPSBgJHtzdGFydH0ke3ZhcmlhYmxlT3V0cHV0fSR7ZW5kfWA7XHJcbiAgICAgICAgb3V0cHV0ID0gYCR7b3V0cHV0fSR7dmFyaWFibGVPdXRwdXR9XHJcbmBcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFyaWFibGVPdXRwdXQ7XHJcbn07XHJcblxyXG5jb25zdCBwcmludENoYWluU3RlcFZhcmlhYmxlcyA9IChcclxuICAgIHN0YXRlOiBJU3RhdGUsXHJcbiAgICBzdGVwOiBJUmVuZGVyRnJhZ21lbnQgfCBudWxsIHwgdW5kZWZpbmVkLFxyXG4gICAgc3RyaW5nT3V0cHV0OiBJU3RyaW5nT3V0cHV0XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGlmICghc3RlcCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdGVwVmFyaWFibGUgPSBwcmludFN0ZXBWYXJpYWJsZXMoXHJcbiAgICAgICAgc3RlcCxcclxuICAgICAgICBzdHJpbmdPdXRwdXRcclxuICAgICk7XHJcblxyXG4gICAgaWYgKHN0ZXBWYXJpYWJsZSkge1xyXG5cclxuICAgICAgICBzdHJpbmdPdXRwdXQub3V0cHV0ID0gYCR7c3RyaW5nT3V0cHV0Lm91dHB1dH1cclxuJHtzdGVwVmFyaWFibGV9YFxyXG4gICAgfVxyXG5cclxuICAgIHByaW50Q2hhaW5TdGVwVmFyaWFibGVzKFxyXG4gICAgICAgIHN0YXRlLFxyXG4gICAgICAgIHN0ZXAubGluaz8ucm9vdCxcclxuICAgICAgICBzdHJpbmdPdXRwdXRcclxuICAgICk7XHJcblxyXG4gICAgcHJpbnRDaGFpblN0ZXBWYXJpYWJsZXMoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgc3RlcC5zZWxlY3RlZCxcclxuICAgICAgICBzdHJpbmdPdXRwdXRcclxuICAgICk7XHJcbn1cclxuXHJcbmNvbnN0IHByaW50Q2hhaW5WYXJpYWJsZXMgPSAoXHJcbiAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgc3RlcDogSVJlbmRlckZyYWdtZW50XHJcbik6IHZvaWQgPT4ge1xyXG5cclxuICAgIGNvbnN0IHJvb3QgPSBzdGF0ZS5yZW5kZXJTdGF0ZS5kaXNwbGF5R3VpZGU/LnJvb3Q7XHJcblxyXG4gICAgaWYgKCFyb290KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzdHJpbmdPdXRwdXQ6IElTdHJpbmdPdXRwdXQgPSB7XHJcbiAgICAgICAgb3V0cHV0OiAnJyxcclxuICAgICAgICBuZXN0aW5nTGV2ZWw6IDAsXHJcbiAgICAgICAgb3BlblZhcmlhYmxlczogW11cclxuICAgIH07XHJcblxyXG4gICAgcHJpbnRDaGFpblN0ZXBWYXJpYWJsZXMoXHJcbiAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgcm9vdCxcclxuICAgICAgICBzdHJpbmdPdXRwdXRcclxuICAgICk7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpbmdPdXRwdXQubmVzdGluZ0xldmVsOyBpKyspIHtcclxuXHJcbiAgICAgICAgc3RyaW5nT3V0cHV0Lm91dHB1dCA9IGAke3N0cmluZ091dHB1dC5vdXRwdXR9PC91bD5gO1xyXG4gICAgfVxyXG5cclxuICAgIHN0ZXAudmFsdWUgPSBgJHtzdGVwLnZhbHVlfVxyXG4ke3N0cmluZ091dHB1dC5vdXRwdXR9YFxyXG59XHJcblxyXG5cclxuY29uc3Qgc3RlcEhvb2sgPSB7XHJcblxyXG4gICAgcHJvY2Vzc1N0ZXA6IChcclxuICAgICAgICBzdGF0ZTogSVN0YXRlLFxyXG4gICAgICAgIHN0ZXA6IElSZW5kZXJGcmFnbWVudCxcclxuICAgICk6IHZvaWQgPT4ge1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBydW5Qcm9jZXNzOiBib29sZWFuID0gcnVuUHJvY2Vzc1N0ZXAoc3RlcCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJ1blByb2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcHJpbnRDaGFpblZhcmlhYmxlcyhcclxuICAgICAgICAgICAgICAgIHN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc3RlcFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZXhwKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGV4cCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHN0ZXBIb29rO1xyXG5cclxuXHJcbnJlZ2lzdGVyU3RlcEhvb2soKTtcclxuXHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxNQUFxQixhQUFzQztBQUFBLEVBQTNEO0FBRVksb0NBQW9FO0FBQUE7QUFBQSxFQUVyRSxpQkFBaUIsTUFBNEQ7QUFFaEYsU0FBSyxXQUFXO0FBQUEsRUFDcEI7QUFBQSxFQUVPLGdCQUNILE9BQ0EsTUFDSTtBQUVKLFFBQUksS0FBSyxVQUFVO0FBRWYsV0FBSztBQUFBLFFBQ0Q7QUFBQSxRQUNBO0FBQUEsTUFBQTtBQUFBLElBRVI7QUFBQSxFQUNKO0FBQ0o7QUNSQSxNQUFNLG1CQUFtQixNQUFZO0FBRWpDLE1BQUksQ0FBQyxPQUFPLGNBQWM7QUFFdEIsV0FBTyxlQUFlLElBQUksYUFBQTtBQUMxQixXQUFPLGFBQWEsaUJBQWlCLFNBQVMsV0FBVztBQUFBLEVBQzdEO0FBQ0o7QUFFQSxNQUFNLGVBQWU7QUFFckIsTUFBTSxpQkFBaUIsQ0FBQyxTQUFtQztBQUV2RCxNQUFJLFdBQVcsS0FBSztBQUNwQixNQUFJLG9CQUFvQixTQUFTLFFBQVEsSUFBSTtBQUM3QyxNQUFJLFlBQVk7QUFFaEIsTUFBSSxzQkFBc0IsSUFBSTtBQUUxQixnQkFBWTtBQUNaLGVBQVc7QUFBQSxFQUNmLE9BQ0s7QUFDRCxnQkFBWSxTQUFTLFVBQVUsR0FBRyxpQkFBaUI7QUFDbkQsZUFBVyxTQUFTLFVBQVUsb0JBQW9CLENBQUM7QUFBQSxFQUN2RDtBQUVBLE1BQUksVUFBVSxLQUFBLE1BQVcsY0FBYztBQUVuQyxTQUFLLFFBQVE7QUFFYixXQUFPO0FBQUEsRUFDWDtBQUVBLFNBQU87QUFDWDtBQUVBLE1BQU0scUJBQXFCLENBQ3ZCLE1BQ0EsaUJBQ2dCO0FEdERwQjtBQ3dESSxNQUFJLENBQUMsS0FBSyxZQUNILEtBQUssU0FBUyxXQUFXLEdBQzlCO0FBQ0UsV0FBTztBQUFBLEVBQ1g7QUFFQSxRQUFNLGdCQUFnQixLQUFLO0FBQzNCLFFBQU0sZ0JBQWdCLGFBQWE7QUFDbkMsTUFBSSxpQkFBaUI7QUFFckIsTUFBSSxRQUFRO0FBQ1osTUFBSSxNQUFNO0FBQ1YsTUFBSSxlQUFlO0FBRW5CLFFBQU0sY0FBYztBQUFBLElBQ2hCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUFBO0FBR0osUUFBTSxpQkFBaUI7QUFBQSxJQUNuQjtBQUFBLEVBQUE7QUFHSixhQUFXLFlBQVksZUFBZTtBQUVsQyxZQUFRO0FBQ1IsVUFBTTtBQUVOLFFBQUksU0FBUyxXQUFXLEdBQUc7QUFFdkIscUJBQWUsU0FBUyxDQUFDLEVBQUUsS0FBQTtBQUMzQix1QkFBaUIsR0FBRyxZQUFZLFFBQU0sVUFBSyxhQUFMLG1CQUFlLE9BQU8sV0FBVSxvQkFBb0I7QUFBQSxJQUM5RixPQUNLO0FBQ0QscUJBQWUsU0FBUyxDQUFDLEVBQUUsS0FBQTtBQUMzQix1QkFBaUIsR0FBRyxZQUFZLE1BQU0sU0FBUyxDQUFDLEVBQUUsTUFBTTtBQUFBLElBQzVEO0FBRUEsUUFBSSxhQUFhLGlCQUFpQixHQUFHO0FBRWpDLG1CQUFhO0FBQ2IsY0FBUSxPQUFPLEtBQUs7QUFBQSxJQUN4QjtBQUVBLFFBQUksZUFBZSxTQUFTLFlBQVksTUFBTSxNQUFNO0FBRWhELGVBQVMsSUFBSSxHQUFHLElBQUksY0FBYyxRQUFRLEtBQUs7QUFFM0MsZ0JBQVEsUUFBUSxLQUFLO0FBQUEsTUFDekI7QUFFQSxvQkFBYyxTQUFTO0FBQ3ZCLG1CQUFhLGVBQWU7QUFBQSxJQUNoQyxPQUNLO0FBQ0QsVUFBSSxVQUFVO0FBRWQsZUFBUyxJQUFJLGNBQWMsU0FBUyxHQUFHLEtBQUssR0FBRyxLQUFLO0FBRWhEO0FBRUEsWUFBSSxjQUFjLENBQUMsTUFBTSxjQUFjO0FBRW5DLG1CQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsS0FBSztBQUU5QixvQkFBUSxRQUFRLEtBQUs7QUFDckIseUJBQWE7QUFBQSxVQUNqQjtBQUVBLHdCQUFjLFNBQVM7QUFFdkI7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUVBLFVBQUksWUFBWSxTQUFTLFlBQVksTUFBTSxNQUFNO0FBRzdDLGNBQU0sR0FBRyxHQUFHO0FBQ1oscUJBQWEsY0FBYyxLQUFLLFlBQVk7QUFDNUMscUJBQWE7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFFQSxxQkFBaUIsR0FBRyxLQUFLLEdBQUcsY0FBYyxHQUFHLEdBQUc7QUFBQSxFQUdwRDtBQUVBLFNBQU87QUFDWDtBQUVBLE1BQU0sMEJBQTBCLENBQzVCLE9BQ0EsTUFDQSxpQkFDTztBRC9KWDtBQ2lLSSxNQUFJLENBQUMsTUFBTTtBQUNQO0FBQUEsRUFDSjtBQUVBLFFBQU0sZUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixNQUFJLGNBQWM7QUFFZCxpQkFBYSxTQUFTLEdBQUcsYUFBYSxNQUFNO0FBQUEsRUFDbEQsWUFBWTtBQUFBLEVBQ1Y7QUFFQTtBQUFBLElBQ0k7QUFBQSxLQUNBLFVBQUssU0FBTCxtQkFBVztBQUFBLElBQ1g7QUFBQSxFQUFBO0FBR0o7QUFBQSxJQUNJO0FBQUEsSUFDQSxLQUFLO0FBQUEsSUFDTDtBQUFBLEVBQUE7QUFFUjtBQUVBLE1BQU0sc0JBQXNCLENBQ3hCLE9BQ0EsU0FDTztBRGhNWDtBQ2tNSSxRQUFNLFFBQU8sV0FBTSxZQUFZLGlCQUFsQixtQkFBZ0M7QUFFN0MsTUFBSSxDQUFDLE1BQU07QUFDUDtBQUFBLEVBQ0o7QUFFQSxNQUFJLGVBQThCO0FBQUEsSUFDOUIsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLElBQ2QsZUFBZSxDQUFBO0FBQUEsRUFBQztBQUdwQjtBQUFBLElBQ0k7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQUE7QUFHSixXQUFTLElBQUksR0FBRyxJQUFJLGFBQWEsY0FBYyxLQUFLO0FBRWhELGlCQUFhLFNBQVMsR0FBRyxhQUFhLE1BQU07QUFBQSxFQUNoRDtBQUVBLE9BQUssUUFBUSxHQUFHLEtBQUssS0FBSztBQUFBLEVBQzVCLGFBQWEsTUFBTTtBQUNyQjtBQUdBLE1BQU0sV0FBVztBQUFBLEVBRWIsYUFBYSxDQUNULE9BQ0EsU0FDTztBQUVQLFFBQUk7QUFDQSxZQUFNLGFBQXNCLGVBQWUsSUFBSTtBQUUvQyxVQUFJLENBQUMsWUFBWTtBQUNiO0FBQUEsTUFDSjtBQUVBO0FBQUEsUUFDSTtBQUFBLFFBQ0E7QUFBQSxNQUFBO0FBQUEsSUFFUixTQUNPLEtBQUs7QUFDUixjQUFRLElBQUksR0FBRztBQUFBLElBQ25CO0FBQUEsRUFDSjtBQUNKO0FBS0EsaUJBQUE7In0=
