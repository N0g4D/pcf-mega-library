import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { TextAreaComponent } from "./TextAreaComponent";

export class TextArea
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
    const value = context.parameters.value?.raw ?? "";
    const placeholder = context.parameters.placeholder?.raw ?? "";
    const rows = context.parameters.rows?.raw ?? 0;
    const resize = context.parameters.resize?.raw ?? "vertical";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._root.render(
      React.createElement(TextAreaComponent, {
        value,
        placeholder,
        rows,
        resize,
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
