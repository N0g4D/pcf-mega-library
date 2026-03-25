import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { SignaturePadComponent } from "./SignaturePadComponent";

export class SignaturePad
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private _container: HTMLDivElement;
  private _root: Root;
  private _notifyOutputChanged: () => void;

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
    const signatureData = context.parameters.signatureData?.raw ?? "";
    const penColor = context.parameters.penColor?.raw ?? "black";
    const penWidth = context.parameters.penWidth?.raw ?? "medium";
    const outputFormat = context.parameters.outputFormat?.raw ?? "png";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(SignaturePadComponent, {
        signatureData,
        penColor,
        penWidth,
        outputFormat,
        disabled,
      })
    );
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    this._root.unmount();
  }
}
