import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { StarRatingComponent, IStarRatingProps } from "./StarRatingComponent";

export class StarRating
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private _container: HTMLDivElement;
  private _root: Root;
  private _notifyOutputChanged: () => void;
  private _currentValue = 0;

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
    const maxStarsRaw = context.parameters.maxStars?.raw ?? "5";
    const maxStars = parseInt(maxStarsRaw, 10) || 5;
    const allowHalf = context.parameters.allowHalf?.raw ?? false;
    const size = context.parameters.size?.raw ?? "medium";
    const disabled = context.parameters.disabled?.raw ?? false;

    this._currentValue = typeof value === "number" ? value : 0;

    const props: IStarRatingProps = {
      value: this._currentValue,
      maxStars,
      allowHalf,
      size,
      disabled,
      onValueChange: this._handleValueChange,
    };

    this._root.render(React.createElement(StarRatingComponent, props));
  }

  private _handleValueChange = (newValue: number): void => {
    this._currentValue = newValue;
    this._notifyOutputChanged();
  };

  public getOutputs(): IOutputs {
    return { value: this._currentValue };
  }

  public destroy(): void {
    this._root.unmount();
  }
}
