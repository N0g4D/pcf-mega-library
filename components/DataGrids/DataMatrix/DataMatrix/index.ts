import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { DataMatrixComponent, IDataMatrixProps, IMatrixColumn, IMatrixRow } from "./DataMatrixComponent";

export class DataMatrix
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private _container: HTMLDivElement;
  private _root: Root;
  private _notifyOutputChanged: () => void;
  private _selectedCount = 0;

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
    const dataSet = context.parameters.dataSet;

    // Extract columns
    const columns: IMatrixColumn[] = dataSet.columns.map((col) => ({
      key: col.name,
      name: col.displayName,
      dataType: col.dataType,
      width: col.visualSizeFactor ?? 100,
      sortable: true,
    }));

    // Extract rows
    const rows: IMatrixRow[] = dataSet.sortedRecordIds.map((id) => {
      const record = dataSet.records[id];
      const cells: Record<string, string> = {};
      for (const col of dataSet.columns) {
        cells[col.name] = record.getFormattedValue(col.name) ?? "";
      }
      return { id, cells };
    });

    const pageSize = context.parameters.pageSize?.raw ?? 25;
    const enableSorting = context.parameters.enableSorting?.raw !== false;
    const enableFiltering = context.parameters.enableFiltering?.raw !== false;
    const enableSelection = context.parameters.enableSelection?.raw !== false;
    const enableExport = context.parameters.enableExport?.raw !== false;
    const density = context.parameters.density?.raw ?? "comfortable";
    const compactMode = density === "compact";

    const totalRecords = dataSet.paging?.totalResultCount ?? rows.length;
    const hasNextPage = dataSet.paging?.hasNextPage === true;
    const hasPreviousPage = dataSet.paging?.hasPreviousPage === true;

    const props: IDataMatrixProps = {
      columns,
      rows,
      pageSize: typeof pageSize === "number" ? pageSize : 25,
      enableSorting,
      enableFiltering,
      enableSelection,
      enableExport,
      compactMode,
      totalRecords,
      hasNextPage,
      hasPreviousPage,
      onSort: (colName: string, dir: "asc" | "desc") => {
        if (dataSet.sorting && dataSet.sorting.length > 0) {
          dataSet.sorting[0] = { name: colName, sortDirection: dir === "asc" ? 0 : 1 };
        }
        dataSet.refresh();
      },
      onPageNext: () => {
        dataSet.paging?.loadNextPage();
      },
      onPagePrevious: () => {
        dataSet.paging?.loadPreviousPage();
      },
      onSelectionChange: (count: number) => {
        this._selectedCount = count;
        this._notifyOutputChanged();
      },
      onOpenRecord: (recordId: string) => {
        dataSet.openDatasetItem(dataSet.records[recordId].getNamedReference());
      },
    };

    this._root.render(React.createElement(DataMatrixComponent, props));
  }

  public getOutputs(): IOutputs {
    return { selectedCount: this._selectedCount };
  }

  public destroy(): void {
    this._root.unmount();
  }
}
