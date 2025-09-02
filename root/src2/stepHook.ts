import IState from "../src/modules/interfaces/state/IState";
import IRenderFragment from "../src/modules/interfaces/state/render/IRenderFragment";
import IHookRegistry from "../src/modules/interfaces/window/IHookRegistry";
import HookRegistry from "./HookRegistry"


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

const runProcessStep = (stepText: string): { runProcess: boolean, stepText: string } => {

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

    processStep: (
        _state: IState,
        step: IRenderFragment,
    ): void => {

        const result: { runProcess: boolean, stepText: string } = runProcessStep(step.value);

        if (!result.runProcess) {
            return;
        }

        step.value = result.stepText;
    },
};

export default stepHook;


registerStepHook();
