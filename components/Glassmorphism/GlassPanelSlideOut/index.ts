import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { GlassPanelSlideOutComponent, IGlassPanelProps, SlideDirection, IContentZone } from "./GlassPanelSlideOutComponent";

export class GlassPanelSlideOut
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private _container: HTMLDivElement;
  private _root: Root;
  private _notifyOutputChanged: () => void;
  private _pendingIsOpen: boolean | undefined;

  constructor() {
    // Empty
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._root = createRoot(container);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const isOpen = context.parameters.isOpen?.raw === true;
    const panelTitle = context.parameters.panelTitle?.raw ?? "Panel";
    const slideDirection = (context.parameters.slideDirection?.raw ?? "right") as SlideDirection;
    const blurIntensity = context.parameters.blurIntensity?.raw ?? 20;
    const tintColor = context.parameters.tintColor?.raw ?? "rgba(255, 255, 255, 0.15)";
    const panelSize = context.parameters.panelSize?.raw ?? "400px";

    let contentZones: IContentZone[] = [];
    const rawZones = context.parameters.contentZones?.raw;
    if (rawZones && typeof rawZones === "string" && rawZones.trim()) {
      try {
        contentZones = JSON.parse(rawZones);
      } catch {
        contentZones = [];
      }
    }

    const props: IGlassPanelProps = {
      isOpen,
      panelTitle: typeof panelTitle === "string" ? panelTitle : "Panel",
      slideDirection,
      blurIntensity: typeof blurIntensity === "number" ? blurIntensity : 20,
      tintColor: typeof tintColor === "string" ? tintColor : "rgba(255,255,255,0.15)",
      panelSize: typeof panelSize === "string" ? panelSize : "400px",
      contentZones,
      onDismiss: this._handleDismiss,
    };

    this._root.render(React.createElement(GlassPanelSlideOutComponent, props));
  }

  private _handleDismiss = (): void => {
    this._pendingIsOpen = false;
    this._notifyOutputChanged();
  };

  public getOutputs(): IOutputs {
    if (this._pendingIsOpen !== undefined) {
      const val = this._pendingIsOpen;
      this._pendingIsOpen = undefined;
      return { isOpen: val };
    }
    return {};
  }

  public destroy(): void {
    this._root.unmount();
  }
}
