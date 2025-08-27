import IDisplayGuide from "../interfaces/state/display/IDisplayGuide";
import IDisplaySection from "../interfaces/state/display/IDisplaySection";
import IRenderState from "../interfaces/state/IRenderState";
import IChainSegment from "../interfaces/state/segments/IChainSegment";
import IRenderStateUI from "../interfaces/state/ui/IRenderStateUI";
import RenderStateUI from "./ui/RenderStateUI";


export default class RenderState implements IRenderState {

    public refreshUrl: boolean = false;
    public isChainLoad: boolean = false;
    public segments: Array<IChainSegment> = [];
    public displayGuide: IDisplayGuide | null = null;
    public outlines: any = {};
    public outlineUrls: any = {};
    public currentSection: IDisplaySection | null = null;

    // Search indices
    public index_outlineNodes_id: any = {};
    public index_chainFragments_id: any = {};

    public ui: IRenderStateUI = new RenderStateUI();
}
