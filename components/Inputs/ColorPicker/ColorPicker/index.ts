import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ColorPickerComponent } from "./ColorPickerComponent";

export class ColorPicker
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
    const color = context.parameters.color?.raw ?? "";
    const format = context.parameters.format?.raw ?? "hex";
    const showAlpha = context.parameters.showAlpha?.raw ?? false;
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(ColorPickerComponent, {
        color,
        format,
        showAlpha,
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
