import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { TimePickerComponent } from "./TimePickerComponent";

export class TimePicker
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
    const selectedTime = context.parameters.selectedTime?.raw ?? "";
    const increment = context.parameters.increment?.raw ?? "30";
    const hourCycle = context.parameters.hourCycle?.raw ?? "h12";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(TimePickerComponent, {
        selectedTime,
        increment,
        hourCycle,
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
