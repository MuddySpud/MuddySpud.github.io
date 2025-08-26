import { Children } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IRenderFragment from "../../../interfaces/state/render/IRenderFragment";
import fragmentViews from "./fragmentViews";
import gFragmentCode from "../../../global/code/gFragmentCode";
import optionsViews from "./optionsViews";


const buildLinkDiscussionView = (
    prior: IRenderFragment | null,
    fragment: IRenderFragment,
    view: Children[]
): void => {

    let adjustForCollapsedOptions = false;

    if (prior?.ui.priorCollapsedOptions === true) {

        adjustForCollapsedOptions = gFragmentCode.elementIsParagraph(fragment.value);
    }

    const linkELementID = gFragmentCode.getLinkElementID(fragment.id);

    view.push(

        h("div",
            {
                id: `${linkELementID}_l`,
                class: {
                    "nt-fr-fragment-box": true,
                    "nt-fr-prior-collapsed-options": adjustForCollapsedOptions === true
                }
            },
            [
                h("div",
                    {
                        class: `nt-fr-fragment-discussion`,
                        "data-discussion": fragment.value
                    },
                    ""
                ),

                optionsViews.buildView(fragment)
            ]
        )
    );
};

const buildLinkExitsView = (
    _fragment: IRenderFragment,
    _view: Children[]
): void => {

    return

    // if (!fragment.options
    //     || fragment.options.length === 0
    //     || !fragment.ui.fragmentOptionsExpanded
    // ) {
    //     return;
    // }

    // if (!U.isNullOrWhiteSpace(fragment.exitKey)) {

    //     // Then map has a single exit and it was merged into this fragment
    //     return;
    // }

    // view.push(

    //     h("div",
    //         {
    //             class: "nt-fr-exits-box"
    //         },
    //         [
    //             optionsViews.buildView(fragment)
    //         ]
    //     )
    // );
};

const linkViews = {

    buildView: (
        prior: IRenderFragment | null,
        fragment: IRenderFragment,
        view: Children[]
    ): void => {

        fragment.ui.priorCollapsedOptions = false;

        buildLinkDiscussionView(
            prior,
            fragment,
            view
        );

        if (fragment.link?.root) {

            linkViews.buildView(
                prior,
                fragment.link.root,
                view
            );
        }

        buildLinkExitsView(
            fragment,
            view
        );

        fragmentViews.buildView(
            fragment,
            fragment.selected,
            view
        );
    }
};

export default linkViews;


