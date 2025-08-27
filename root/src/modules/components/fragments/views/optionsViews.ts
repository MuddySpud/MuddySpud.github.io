import { Children, VNode } from "hyper-app-local";
import { h } from "../../../../hyperApp/hyper-app-local";

import IRenderFragment from "../../../interfaces/state/render/IRenderFragment";
import fragmentActions from "../actions/fragmentActions";
import FragmentPayload from "../../../state/ui/payloads/FragmentPayload";
import U from "../../../global/gUtilities";
import fragmentViews from "./fragmentViews";
import gFragmentCode from "../../../global/code/gFragmentCode";


const buildAncillaryDiscussionView = (
    parent: IRenderFragment,
    ancillary: IRenderFragment
): Children[] => {

    if (!ancillary.ui.ancillaryExpanded) {

        return [];
    }

    const view: Children[] = [];

    fragmentViews.buildView(
        parent,
        ancillary,
        view
    );

    return view;
}

const buildExpandedAncillaryView = (
    parent: IRenderFragment,
    ancillary: IRenderFragment
): VNode | null => {

    if (!ancillary
        || !ancillary.isAncillary) {

        return null;
    }

    const view: VNode =

        h("div", { class: "nt-fr-ancillary-box" }, [
            h("div", { class: "nt-fr-ancillary-head" }, [
                h("a",
                    {
                        class: "nt-fr-ancillary",
                        onMouseDown: [
                            fragmentActions.toggleAncillaryNode,
                            (_event: any) => {
                                return new FragmentPayload(
                                    parent,
                                    ancillary
                                );
                            }
                        ]
                    },
                    [
                        h("span", {}, ancillary.option)
                    ]
                )
            ]),

            buildAncillaryDiscussionView(
                parent,
                ancillary
            )
        ]);

    return view;
}

const buildCollapsedAncillaryView = (
    parent: IRenderFragment,
    ancillary: IRenderFragment
): VNode | null => {

    if (!ancillary
        || !ancillary.isAncillary) {

        return null;
    }

    const view: VNode =

        h("div", { class: "nt-fr-ancillary-box nt-fr-collapsed" }, [
            h("div", { class: "nt-fr-ancillary-head" }, [
                h("a",
                    {
                        class: "nt-fr-ancillary",
                        onMouseDown: [
                            fragmentActions.toggleAncillaryNode,
                            (_event: any) => {
                                return new FragmentPayload(
                                    parent,
                                    ancillary
                                );
                            }
                        ]
                    },
                    [
                        h("span", {}, ancillary.option)
                    ]
                )
            ])
        ]);

    return view;
}

const BuildAncillaryView = (
    parent: IRenderFragment,
    ancillary: IRenderFragment
): VNode | null => {

    if (!ancillary
        || !ancillary.isAncillary) {

        return null;
    }

    if (ancillary.ui.ancillaryExpanded === true) {

        return buildExpandedAncillaryView(
            parent,
            ancillary
        );
    }

    return buildCollapsedAncillaryView(
        parent,
        ancillary
    );
}

const BuildExpandedOptionView = (
    parent: IRenderFragment,
    option: IRenderFragment
): VNode | null => {

    if (!option
        || option.isAncillary === true) {

        return null;
    }

    const view: VNode =

        h("div", { class: "nt-fr-option-box" },
            [
                h("a",
                    {
                        class: "nt-fr-option",
                        onMouseDown: [
                            fragmentActions.showOptionNode,
                            (_event: any) => {
                                return new FragmentPayload(
                                    parent,
                                    option
                                );
                            }
                        ]
                    },
                    [
                        h("span", {}, option.option)
                    ]
                )
            ]
        );

    return view;
}

const buildExpandedOptionsView = (
    fragment: IRenderFragment,
    options: Array<IRenderFragment>
): VNode | null => {

    const optionViews: Children[] = [];
    let optionVew: VNode | null;

    for (const option of options) {

        optionVew = BuildExpandedOptionView(
            fragment,
            option
        );

        if (optionVew) {

            optionViews.push(optionVew);
        }
    }

    let optionsClasses = "nt-fr-fragment-options";

    if (fragment.selected) {

        optionsClasses = `${optionsClasses} nt-fr-fragment-chain`
    }

    const view: VNode =

        h("div",
            {
                class: `${optionsClasses}`,
                tabindex: 0,
                onBlur: [
                    fragmentActions.hideOptions,
                    (_event: any) => fragment
                ]
            },

            optionViews
        );

    return view;
};

const buildCollapsedOptionsView = (fragment: IRenderFragment): VNode | null => {

    const view: VNode =

        h("a",
            {
                class: `nt-fr-fragment-options nt-fr-collapsed`,
                onMouseDown: [
                    fragmentActions.expandOptions,
                    (_event: any) => fragment
                ]
            },
            [
                h("span", { class: `nt-fr-option-selected` }, `${fragment.selected?.option}`),
            ]
        );

    return view;
};

const buildAncillariesView = (
    fragment: IRenderFragment,
    ancillaries: Array<IRenderFragment>
): VNode | null => {

    if (ancillaries.length === 0) {

        return null;
    }

    fragment.ui.priorCollapsedOptions = true;
    const ancillariesViews: Children[] = [];
    let ancillaryView: VNode | null;

    for (const ancillary of ancillaries) {

        ancillaryView = BuildAncillaryView(
            fragment,
            ancillary
        );

        if (ancillaryView) {

            ancillariesViews.push(ancillaryView);
        }
    }

    if (ancillariesViews.length === 0) {

        return null;
    }

    let ancillariesClasses = "nt-fr-fragment-ancillaries";

    if (fragment.selected) {

        ancillariesClasses = `${ancillariesClasses} nt-fr-fragment-chain`
    }

    const view: VNode =

        h("div",
            {
                class: `${ancillariesClasses}`,
                tabindex: 0,
                // onBlur: [
                //     fragmentActions.hideOptions,
                //     (_event: any) => fragment
                // ]
            },

            ancillariesViews
        );

    return view;
};

const buildOptionsView = (
    fragment: IRenderFragment,
    options: Array<IRenderFragment>
): VNode | null => {

    if (options.length === 0) {

        return null;
    }

    if (options.length === 1
        && options[0].option === ''
    ) {
        return null;
    }

    fragment.ui.priorCollapsedOptions = true;

    if (fragment.selected
        && !fragment.ui.fragmentOptionsExpanded) {

        return buildCollapsedOptionsView(fragment);
    }

    return buildExpandedOptionsView(
        fragment,
        options
    );
};


const optionsViews = {

    buildView: (fragment: IRenderFragment): Children[] => {

        if (!fragment.options
            || fragment.options.length === 0
            || !U.isNullOrWhiteSpace(fragment.iKey) // Don't draw options of links
        ) {
            return [];
        }

        if (fragment.options.length === 1
            && fragment.options[0].option === ''
        ) {
            return [];
        }

        const optionsAndAncillaries = gFragmentCode.splitOptionsAndAncillaries(fragment.options);

        const view: Children[] = [

            buildAncillariesView(
                fragment,
                optionsAndAncillaries.ancillaries
            ),

            buildOptionsView(
                fragment,
                optionsAndAncillaries.options
            )
        ];

        return view;
    }
};

export default optionsViews;


