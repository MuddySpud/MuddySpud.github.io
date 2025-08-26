import { Children } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IRenderFragment from "../../../interfaces/state/render/IRenderFragment";
import gFragmentCode from "../../../global/code/gFragmentCode";
import optionsViews from "./optionsViews";
import linkViews from "./linkViews";
import U from "../../../global/gUtilities";


const buildDiscussionView = (
    prior: IRenderFragment | null,
    fragment: IRenderFragment,
    view: Children[]
): void => {

    if (U.isNullOrWhiteSpace(fragment.value) === true) {
        return;
    }

    let adjustForCollapsedOptions = false;

    if (prior?.ui.priorCollapsedOptions === true) {

        adjustForCollapsedOptions = gFragmentCode.elementIsParagraph(fragment.value);
    }

    const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);

    view.push(

        h("div",
            {
                id: `${fragmentELementID}_d`,
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
            ]
        )
    );
};

const buildOptionsView = (
    fragment: IRenderFragment,
    view: Children[]
): void => {

    const optionViews = optionsViews.buildView(fragment);

    if (optionViews.length === 0) {
        return;
    }

    const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);

    view.push(

        h("div",
            {
                id: `${fragmentELementID}_o`,
                class: "nt-fr-fragment-box"
            },

            optionViews
        )
    );
};

const fragmentViews = {

    buildView: (
        prior: IRenderFragment | null,
        fragment: IRenderFragment | null | undefined,
        view: Children[]
    ): void => {

        if (!fragment) {
            return;
        }

        fragment.ui.priorCollapsedOptions = false;

        buildDiscussionView(
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

        buildOptionsView(
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

export default fragmentViews;


