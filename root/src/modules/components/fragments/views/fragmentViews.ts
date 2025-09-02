import { Children } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IRenderFragment from "../../../interfaces/state/render/IRenderFragment";
import gFragmentCode from "../../../global/code/gFragmentCode";
import optionsViews from "./optionsViews";
import linkViews from "./linkViews";
import U from "../../../global/gUtilities";


const buildDiscussionView = (
    fragment: IRenderFragment,
    views: Children[]
): void => {

    if (U.isNullOrWhiteSpace(fragment.value) === true) {
        return;
    }

    let adjustForCollapsedOptions = false;
    const viewsLength = views.length;

    if (viewsLength > 0) {

        const lastView: any = views[viewsLength - 1];

        if (lastView?.ui?.isCollapsed === true) {

            adjustForCollapsedOptions = true;
        }
    }

    const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);

    views.push(

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

// const buildOptionsView = (
//     fragment: IRenderFragment,
//     view: Children[]
// ): void => {

//     const optionViews = optionsViews.buildView2(fragment);

//     if (optionViews.length === 0) {
//         return;
//     }

//     const fragmentELementID = gFragmentCode.getFragmentElementID(fragment.id);

//     view.push(

//         h("div",
//             {
//                 id: `${fragmentELementID}_o`,
//                 class: "nt-fr-fragment-box"
//             },

//             optionViews
//         )
//     );
// };

const fragmentViews = {

    buildView: (
        fragment: IRenderFragment | null | undefined,
        views: Children[]
    ): void => {

        if (!fragment) {
            return;
        }

        buildDiscussionView(
            fragment,
            views
        );

        if (fragment.link?.root) {

            linkViews.buildView(
                fragment.link.root,
                views
            );
        }

        optionsViews.buildView2(
            fragment,
            views
        );

        // buildOptionsView(
        //     fragment,
        //     views
        // );

        fragmentViews.buildView(
            fragment.selected,
            views
        );
    }
};

export default fragmentViews;


