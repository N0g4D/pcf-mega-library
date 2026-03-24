import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableCellLayout,
  TableSelectionCell,
  Checkbox,
  Button,
  Input,
  Badge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Subtitle2,
  Caption1,
  Body1,
  makeStyles,
  mergeClasses,
  tokens,
  shorthands,
} from "@fluentui/react-components";
import {
  ArrowSortRegular,
  ArrowSortUpRegular,
  ArrowSortDownRegular,
  FilterRegular,
  ArrowDownloadRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  DismissRegular,
  SearchRegular,
  OpenRegular,
  CheckmarkRegular,
} from "@fluentui/react-icons";

const { useState, useMemo, useCallback, useEffect } = React;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IMatrixColumn {
  key: string;
  name: string;
  dataType: string;
  width: number;
  sortable: boolean;
}

export interface IMatrixRow {
  id: string;
  cells: Record<string, string>;
}

export interface IDataMatrixProps {
  columns: IMatrixColumn[];
  rows: IMatrixRow[];
  pageSize: number;
  enableSorting: boolean;
  enableFiltering: boolean;
  enableSelection: boolean;
  enableExport: boolean;
  compactMode: boolean;
  totalRecords: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onSort: (column: string, direction: "asc" | "desc") => void;
  onPageNext: () => void;
  onPagePrevious: () => void;
  onSelectionChange: (count: number) => void;
  onOpenRecord: (recordId: string) => void;
}

type SortDirection = "asc" | "desc" | null;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    fontFamily: tokens.fontFamilyBase,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: "hidden",
  },

  /* Toolbar */
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },

  /* Filter row */
  filterRow: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground3,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexWrap: "wrap",
  },
  filterInput: {
    minWidth: "120px",
    maxWidth: "200px",
  },

  /* Table wrapper */
  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "600px",
  },
  table: {
    width: "100%",
    minWidth: "max-content",
  },

  /* Header cell */
  headerCell: {
    cursor: "pointer",
    userSelect: "none",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  headerCellContent: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
  },
  sortIcon: {
    opacity: 0.5,
    fontSize: "12px",
  },
  sortIconActive: {
    opacity: 1,
    color: tokens.colorBrandForeground1,
  },

  /* Row */
  row: {
    cursor: "pointer",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  rowSelected: {
    backgroundColor: tokens.colorNeutralBackground2Selected,
  },
  rowCompact: {
    height: "32px",
  },

  /* Footer / pagination */
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  footerInfo: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  paginationButtons: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXXS,
  },

  /* Selection bar */
  selectionBar: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorBrandBackground2,
    borderBottom: `1px solid ${tokens.colorBrandStroke1}`,
  },

  /* Empty state */
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding(tokens.spacingVerticalXXL),
    gap: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground3,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function exportToCSV(columns: IMatrixColumn[], rows: IMatrixRow[]): void {
  const header = columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(",");
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const val = row.cells[col.key] ?? "";
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "data-matrix-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DataMatrixComponent: React.FC<IDataMatrixProps> = (props) => {
  const {
    columns,
    rows,
    pageSize,
    enableSorting,
    enableFiltering,
    enableSelection,
    enableExport,
    compactMode,
    totalRecords,
    hasNextPage,
    hasPreviousPage,
    onSort,
    onPageNext,
    onPagePrevious,
    onSelectionChange,
    onOpenRecord,
  } = props;

  const classes = useStyles();

  // -- Local state --
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange(selectedIds.size);
  }, [selectedIds.size, onSelectionChange]);

  // -- Sort handler --
  const handleSort = useCallback(
    (colKey: string) => {
      if (!enableSorting) return;
      let newDir: SortDirection;
      if (sortColumn === colKey) {
        newDir = sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc";
      } else {
        newDir = "asc";
      }
      setSortColumn(newDir ? colKey : null);
      setSortDirection(newDir);
      if (newDir) {
        onSort(colKey, newDir);
      }
    },
    [enableSorting, sortColumn, sortDirection, onSort]
  );

  // -- Filter --
  const handleFilterChange = useCallback((colKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }));
  }, []);

  const filteredRows = useMemo(() => {
    if (!enableFiltering) return rows;
    const activeFilters = Object.entries(filters).filter(([, v]) => v.trim() !== "");
    if (activeFilters.length === 0) return rows;
    return rows.filter((row) =>
      activeFilters.every(([col, query]) => {
        const cellValue = (row.cells[col] ?? "").toLowerCase();
        return cellValue.includes(query.toLowerCase());
      })
    );
  }, [rows, filters, enableFiltering]);

  // -- Selection --
  const allSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    }
  }, [allSelected, filteredRows]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // -- Sort icon --
  const getSortIcon = useCallback(
    (colKey: string) => {
      if (sortColumn !== colKey) return React.createElement(ArrowSortRegular, { className: classes.sortIcon });
      if (sortDirection === "asc")
        return React.createElement(ArrowSortUpRegular, {
          className: mergeClasses(classes.sortIcon, classes.sortIconActive),
        });
      return React.createElement(ArrowSortDownRegular, {
        className: mergeClasses(classes.sortIcon, classes.sortIconActive),
      });
    },
    [sortColumn, sortDirection, classes]
  );

  // -- Page info --
  const startRecord = hasPreviousPage ? "..." : "1";
  const endRecord = filteredRows.length.toString();

  // -- Render --
  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        {/* Toolbar */}
        <div className={classes.toolbar}>
          <div className={classes.toolbarLeft}>
            <Subtitle2>Data Matrix</Subtitle2>
            <Badge appearance="outline" color="informative" size="small">
              {totalRecords} records
            </Badge>
          </div>
          <div className={classes.toolbarRight}>
            {enableFiltering && (
              <ToolbarButton
                icon={<FilterRegular />}
                appearance={showFilters ? "primary" : "subtle"}
                onClick={() => setShowFilters((p) => !p)}
                aria-label="Toggle filters"
              >
                Filter
              </ToolbarButton>
            )}
            {enableExport && (
              <ToolbarButton
                icon={<ArrowDownloadRegular />}
                appearance="subtle"
                onClick={() => exportToCSV(columns, filteredRows)}
                aria-label="Export to CSV"
              >
                Export
              </ToolbarButton>
            )}
          </div>
        </div>

        {/* Selection bar */}
        {enableSelection && selectedIds.size > 0 && (
          <div className={classes.selectionBar}>
            <CheckmarkRegular />
            <Body1>
              <strong>{selectedIds.size}</strong> row{selectedIds.size > 1 ? "s" : ""} selected
            </Body1>
            <Button
              size="small"
              appearance="subtle"
              icon={<DismissRegular />}
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Filter row */}
        {enableFiltering && showFilters && (
          <div className={classes.filterRow}>
            {columns.map((col) => (
              <Input
                key={col.key}
                className={classes.filterInput}
                placeholder={col.name}
                size="small"
                contentBefore={<SearchRegular />}
                value={filters[col.key] ?? ""}
                onChange={(_e, data) => handleFilterChange(col.key, data.value)}
              />
            ))}
          </div>
        )}

        {/* Table */}
        <div className={classes.tableWrapper}>
          {filteredRows.length === 0 ? (
            <div className={classes.emptyState}>
              <SearchRegular style={{ fontSize: 36 }} />
              <Body1>No records to display</Body1>
              <Caption1>Adjust your filters or load data into the dataset.</Caption1>
            </div>
          ) : (
            <Table className={classes.table} size={compactMode ? "small" : "medium"}>
              <TableHeader>
                <TableRow>
                  {enableSelection && (
                    <TableSelectionCell
                      checked={allSelected ? true : selectedIds.size > 0 ? "mixed" : false}
                      onClick={toggleSelectAll}
                      aria-label="Select all rows"
                    />
                  )}
                  {columns.map((col) => (
                    <TableHeaderCell
                      key={col.key}
                      className={enableSorting ? classes.headerCell : undefined}
                      onClick={() => handleSort(col.key)}
                      style={{ minWidth: col.width }}
                    >
                      <div className={classes.headerCellContent}>
                        {col.name}
                        {enableSorting && getSortIcon(col.key)}
                      </div>
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell style={{ width: 48 }} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const isSelected = selectedIds.has(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      className={mergeClasses(
                        classes.row,
                        isSelected && classes.rowSelected,
                        compactMode && classes.rowCompact
                      )}
                    >
                      {enableSelection && (
                        <TableSelectionCell
                          checked={isSelected}
                          onClick={() => toggleSelect(row.id)}
                          aria-label={`Select row ${row.id}`}
                        />
                      )}
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          <TableCellLayout truncate>{row.cells[col.key] ?? ""}</TableCellLayout>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          appearance="subtle"
                          icon={<OpenRegular />}
                          size="small"
                          onClick={() => onOpenRecord(row.id)}
                          aria-label="Open record"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className={classes.footer}>
          <div className={classes.footerInfo}>
            <Caption1>
              Showing {filteredRows.length} of {totalRecords} records
            </Caption1>
          </div>
          <div className={classes.paginationButtons}>
            <Button
              appearance="subtle"
              icon={<ChevronLeftRegular />}
              size="small"
              disabled={!hasPreviousPage}
              onClick={onPagePrevious}
              aria-label="Previous page"
            />
            <Button
              appearance="subtle"
              icon={<ChevronRightRegular />}
              size="small"
              disabled={!hasNextPage}
              onClick={onPageNext}
              aria-label="Next page"
            />
          </div>
        </div>
      </div>
    </FluentProvider>
  );
};
