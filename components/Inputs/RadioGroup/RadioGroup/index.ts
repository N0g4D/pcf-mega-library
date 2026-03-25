import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { RadioGroupComponent } from "./RadioGroupComponent";

export class RadioGroup
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
    const selectedValue = context.parameters.selectedValue?.raw ?? "";
    const options = context.parameters.options?.raw ?? "";
    const layout = context.parameters.layout?.raw ?? "vertical";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(RadioGroupComponent, {
        selectedValue,
        options,
        layout,
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
