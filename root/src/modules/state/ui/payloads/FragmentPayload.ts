import IRenderFragment from "../../../interfaces/state/render/IRenderFragment";
import IFragmentPayload from "../../../interfaces/state/ui/payloads/IFragmentPayload";


export default class FragmentPayload implements IFragmentPayload {

    constructor(
        parentFragment: IRenderFragment,
        option: IRenderFragment
        ) {

        this.parentFragment = parentFragment;
        this.option = option;
    }

    public parentFragment: IRenderFragment;
    public option: IRenderFragment;
}
