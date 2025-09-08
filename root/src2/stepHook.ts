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

const printStepVariables = (
    step: IRenderFragment,
    stringOutput: IStringOutput
): string | null => {

    if (!step.variable
        || step.variable.length === 0
    ) {
        return null;
    }

    const stepVariables = step.variable;
    let variableOutput = '';
    let output = '';
    let start = '';
    let end = '';

    for (const variable of stepVariables) {

        start = '<li>';
        end = '</li>';

        if (variable.length === 1) {

            variableOutput = `${variable[0].trim()} = ${step.selected?.option.trim() ?? 'no option selected'}`;
        }
        else {

            variableOutput = `${variable[0].trim()} = ${variable[1].trim()}`;
        }

        if (stringOutput.nestingLevel === 0) {

            stringOutput.nestingLevel++;
            start = `<ul>${start}`;
        }

        if (variableOutput.startsWith('frame = 1') === true
            || variableOutput.startsWith('module = 1') === true
            || variableOutput.startsWith('cropChoice = ') === true
            || variableOutput.startsWith('herbBay = 1') === true
        ) {
            end = `${end}<ul>`;
            stringOutput.nestingLevel++;
        }
        else if (variableOutput.startsWith('cropChoice =') === true) {

            start = `${start}`;
            end = `${end}<ul>`;
            stringOutput.nestingLevel++;
        }
        else if (variableOutput.startsWith('herbBay = ') === true) {

            start = `</ul>${start}`;
            end = `${end}<ul>`;
        }
        else if (!variableOutput.startsWith('module = S')
            && !variableOutput.startsWith('module = D')
            && variableOutput.startsWith('module =') === true
        ) {
            start = `</ul></ul>${start}`;
            end = `${end}<ul>`;
            stringOutput.nestingLevel--;
        }
        else if (variableOutput.startsWith('frame =') === true) {

            start = `</ul></ul></ul>${start}`;
            end = `${end}<ul>`;
            stringOutput.nestingLevel--;
            stringOutput.nestingLevel--;
        }

        variableOutput = `${start}${variableOutput}${end}`;
        output = `${output}${variableOutput}
`
    }

    return variableOutput;
};

const printChainStepVariables = (
    state: IState,
    step: IRenderFragment | null | undefined,
    stringOutput: IStringOutput
): void => {

    if (!step) {
        return;
    }

    const stepVariable = printStepVariables(
        step,
        stringOutput
    );

    if (stepVariable) {

        stringOutput.output = `${stringOutput.output}
${stepVariable}`
    }

    printChainStepVariables(
        state,
        step.link?.root,
        stringOutput
    );

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
        output: '',
        nestingLevel: 0
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

