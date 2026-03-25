import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { DatePickerComponent } from "./DatePickerComponent";

export class DatePicker
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
    const selectedDate = context.parameters.selectedDate?.raw ?? "";
    const placeholder = context.parameters.placeholder?.raw ?? "";
    const minDate = context.parameters.minDate?.raw ?? "";
    const maxDate = context.parameters.maxDate?.raw ?? "";
    const firstDayOfWeek = context.parameters.firstDayOfWeek?.raw ?? "sunday";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(DatePickerComponent, {
        selectedDate,
        placeholder,
        minDate,
        maxDate,
        firstDayOfWeek,
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
