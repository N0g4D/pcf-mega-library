import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { MegaActionButtonComponent, IMegaActionButtonProps, ButtonState } from "./MegaActionButtonComponent";

export class MegaActionButton
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private _container: HTMLDivElement;
  private _root: Root;
  private _notifyOutputChanged: () => void;
  private _clickCount = 0;

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
    const label = context.parameters.label?.raw ?? "Action";
    const buttonState = (context.parameters.buttonState?.raw ?? "idle") as ButtonState;
    const iconName = context.parameters.iconName?.raw ?? "send";
    const appearance = context.parameters.appearance?.raw ?? "primary";
    const size = context.parameters.size?.raw ?? "medium";
    const disabled = context.parameters.disabled?.raw === true;

    const props: IMegaActionButtonProps = {
      label: typeof label === "string" ? label : "Action",
      buttonState,
      iconName: typeof iconName === "string" ? iconName : "send",
      appearance: typeof appearance === "string" ? appearance : "primary",
      size: typeof size === "string" ? size : "medium",
      disabled,
      onClick: this._handleClick,
    };

    this._root.render(React.createElement(MegaActionButtonComponent, props));
  }

  private _handleClick = (): void => {
    this._clickCount++;
    this._notifyOutputChanged();
  };

  public getOutputs(): IOutputs {
    return { clickCount: this._clickCount };
  }

  public destroy(): void {
    this._root.unmount();
  }
}
