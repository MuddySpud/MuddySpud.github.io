import IState from "../src/modules/interfaces/state/IState";
import gStateCode from "../src/modules/global/code/gStateCode";
import IRenderFragment from "../src/modules/interfaces/state/render/IRenderFragment";
import IHookRegistry from "../src/modules/interfaces/window/IHookRegistry";
import HookRegistry from "./HookRegistry"
import IDisplayChart from "../src/modules/interfaces/state/display/IDisplayChart";
import IStringOutput from "./IStringOutput";


declare global {

    interface Window {

        HookRegistry: IHookRegistry
    }
}

const registerStepHook = (): void => {

    if (!window.HookRegistry) {

        window.HookRegistry = new HookRegistry();
        window.HookRegistry.registerStepHook(stepHook.processStep);
    }
};

const PROCESS_STEP = '<p>PROCESS_STEP</p>';

const runProcessStep = (step: IRenderFragment): boolean => {

    let stepText = step.value;
    let firstlineEndIndex = stepText.indexOf('\n');
    let firstLine = '';

    if (firstlineEndIndex === -1) {

        firstLine = stepText;
        stepText = ''
    }
    else {
        firstLine = stepText.substring(0, firstlineEndIndex);
        stepText = stepText.substring(firstlineEndIndex + 1);
    }

    if (firstLine.trim() === PROCESS_STEP) {

        step.value = stepText;

        return true;
    }

    return false;
};

const printStepVariables = (step: IRenderFragment): string | null => {

    if (!step.variable) {

        return null;
    }

    const variable = step.variable;
    let output = '<p>';

    if (variable.length === 1) {

        output = `${variable[0]} = ${step.selected?.option ?? 'no option selected'}`;
    }
    else {

        output = `${variable[0]} = ${variable[1]}`;
    }

        output = `${output}</p>`;

    return output;
};

const printChainStepVariables = (
    state: IState,
    step: IRenderFragment | null | undefined,
    stringOutput: IStringOutput
): void => {

    if (!step) {
        return;
    }

    printChainStepVariables(
        state,
        step.link?.root,
        stringOutput
    );

    const stepVariable = printStepVariables(step);

    if (stepVariable) {

        stringOutput.output = `${stringOutput.output}
${stepVariable}`
    }

    printChainStepVariables(
        state,
        step.selected,
        stringOutput
    );
}

const printChainVariables = (
    state: IState,
    step: IRenderFragment
): void => {

    const root = state.renderState.displayGuide?.root;

    if (!root) {
        return;
    }

    let stringOutput: IStringOutput = {
        output: ''
    };

    printChainStepVariables(
        state,
        root,
        stringOutput
    );

    step.value = `${step.value}
${stringOutput.output}`
}


const stepHook = {

    processStep: (
        state: IState,
        step: IRenderFragment,
    ): void => {

        try {
            const runProcess: boolean = runProcessStep(step);

            if (!runProcess) {
                return;
            }

            printChainVariables(
                state,
                step
            );
        }
        catch (exp) {
            console.log(exp);
        }
    },
};

export default stepHook;


registerStepHook();

