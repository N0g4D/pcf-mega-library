import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { SliderInputComponent } from "./SliderInputComponent";

export class SliderInput
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
    const value = context.parameters.value?.raw ?? 0;
    const min = context.parameters.min?.raw ?? 0;
    const max = context.parameters.max?.raw ?? 0;
    const step = context.parameters.step?.raw ?? 0;
    const size = context.parameters.size?.raw ?? "medium";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(SliderInputComponent, {
        value,
        min,
        max,
        step,
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
