import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { DropdownSelectComponent } from "./DropdownSelectComponent";

export class DropdownSelect
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
    const placeholder = context.parameters.placeholder?.raw ?? "";
    const appearance = context.parameters.appearance?.raw ?? "outline";
    const size = context.parameters.size?.raw ?? "medium";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(DropdownSelectComponent, {
        selectedValue,
        options,
        placeholder,
        appearance,
        size,
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
