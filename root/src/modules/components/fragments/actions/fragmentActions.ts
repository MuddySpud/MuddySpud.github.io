import gFragmentActions from "../../../global/actions/gFragmentActions";
import gFragmentCode from "../../../global/code/gFragmentCode";
import gStateCode from "../../../global/code/gStateCode";
import IState from "../../../interfaces/state/IState";
import IStateAnyArray from "../../../interfaces/state/IStateAnyArray";
import IRenderFragment from "../../../interfaces/state/render/IRenderFragment";
import IFragmentPayload from "../../../interfaces/state/ui/payloads/IFragmentPayload";


const fragmentActions = {

    expandOptions: (
        state: IState,
        fragment: IRenderFragment
    ): IStateAnyArray => {

        if (!state
            || !fragment
        ) {
            return state;
        }

        gStateCode.setDirty(state);
        gFragmentCode.resetFragmentUis(state);
        const expanded = fragment.ui.fragmentOptionsExpanded !== true;
        state.renderState.ui.optionsExpanded = expanded;
        fragment.ui.fragmentOptionsExpanded = expanded;

        return gStateCode.cloneState(state);
    },

    hideOptions: (
        state: IState,
        fragment: IRenderFragment
    ): IStateAnyArray => {

        if (!state
            || !fragment
        ) {
            return state;
        }

        gStateCode.setDirty(state);
        gFragmentCode.resetFragmentUis(state);
        fragment.ui.fragmentOptionsExpanded = false;
        state.renderState.ui.optionsExpanded = false;

        return gStateCode.cloneState(state);
    },

    showOptionNode: (
        state: IState,
        payload: IFragmentPayload
    ): IStateAnyArray => {

        if (!state
            || !payload?.parentFragment
            || !payload?.option
        ) {
            return state;
        }

        gStateCode.setDirty(state);

        return gFragmentActions.showOptionNode(
            state,
            payload.parentFragment,
            payload.option
        );
    },

    toggleAncillaryNode: (
        state: IState,
        payload: IFragmentPayload
    ): IStateAnyArray => {

        if (!state
            || !payload?.parentFragment
            || !payload?.option
        ) {
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

export default fragmentActions;
