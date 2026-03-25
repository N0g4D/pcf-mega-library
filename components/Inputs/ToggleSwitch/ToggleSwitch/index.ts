import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ToggleSwitchComponent } from "./ToggleSwitchComponent";

export class ToggleSwitch
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
    const checked = context.parameters.checked?.raw ?? false;
    const label = context.parameters.label?.raw ?? "";
    const labelPosition = context.parameters.labelPosition?.raw ?? "after";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(ToggleSwitchComponent, {
        checked,
        label,
        labelPosition,
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
