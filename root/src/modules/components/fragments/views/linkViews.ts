import { Children } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IRenderFragment from "../../../interfaces/state/render/IRenderFragment";
import fragmentViews from "./fragmentViews";
import gFragmentCode from "../../../global/code/gFragmentCode";
import optionsViews from "./optionsViews";


const buildLinkDiscussionView = (
    fragment: IRenderFragment,
    views: Children[]
): void => {

    let adjustForCollapsedOptions = false;
    const viewsLength = views.length;

    if (viewsLength > 0) {

        const lastView: any = views[viewsLength - 1];

        if (lastView?.ui?.isCollapsed === true) {

            adjustForCollapsedOptions = true;
        }
    }

    const linkELementID = gFragmentCode.getLinkElementID(fragment.id);
    const results: { views: Children[], optionsCollapsed: boolean } = optionsViews.buildView(fragment);

    const view =

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

                results.views
            ]
        );

    if (results.optionsCollapsed === true) {

        view.ui = {
            isCollapsed: true
        };
    }

    views.push(view);
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
        fragment: IRenderFragment,
        views: Children[]
    ): void => {

        buildLinkDiscussionView(
            fragment,
            views
        );

        if (fragment.link?.root) {

            linkViews.buildView(
                fragment.link.root,
                views
            );
        }

        buildLinkExitsView(
            fragment,
            views
        );

        if (!fragment.ui.hideSelected) {

            fragmentViews.buildView(
                fragment.selected,
                views
            );
        }
    }
};

export default linkViews;


