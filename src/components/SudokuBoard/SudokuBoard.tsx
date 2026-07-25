import "./SudokuBoard.css";

interface SudokuBoardProps {
  board: number[][];
  parentBoard?: number[][] | null;
  editableBoard?: number[][];
  editable?: boolean;

  onChange?: (
    rowIndex: number,
    columnIndex: number,
    value: number,
  ) => void;
}

function SudokuBoard({
  board,
  parentBoard = null,
  editableBoard = board,
  editable = false,
  onChange,
}: SudokuBoardProps) {
  function handleChange(
    rowIndex: number,
    columnIndex: number,
    rawValue: string,
  ) {
    if (!onChange) {
      return;
    }

    if (rawValue === "") {
      onChange(
        rowIndex,
        columnIndex,
        0,
      );

      return;
    }

    const value = Number(rawValue);

    if (!Number.isInteger(value)) {
      return;
    }

    if (
      value < 1 ||
      value > board.length
    ) {
      return;
    }

    onChange(
      rowIndex,
      columnIndex,
      value,
    );
  }

  function isNodeContribution(
    rowIndex: number,
    columnIndex: number,
  ): boolean {
    if (!parentBoard) {
      return false;
    }

    const parentValue =
      parentBoard[rowIndex]?.[
        columnIndex
      ] ?? 0;

    const nodeValue =
      board[rowIndex]?.[
        columnIndex
      ] ?? 0;

    return (
      parentValue === 0 &&
      nodeValue !== 0
    );
  }

  function isCurrentContribution(
    rowIndex: number,
    columnIndex: number,
  ): boolean {
    const nodeValue =
      board[rowIndex]?.[
        columnIndex
      ] ?? 0;

    const editedValue =
      editableBoard[rowIndex]?.[
        columnIndex
      ] ?? 0;

    return (
      nodeValue === 0 &&
      editedValue !== 0
    );
  }

  return (
    <div className="sudoku-board">
      {board.map(
        (row, rowIndex) => (
          <div
            className="sudoku-row"
            key={rowIndex}
          >
            {row.map(
              (
                nodeValue,
                columnIndex,
              ) => {
                const editedValue =
                  editableBoard[
                    rowIndex
                  ]?.[
                    columnIndex
                  ] ?? 0;

                const nodeContribution =
                  isNodeContribution(
                    rowIndex,
                    columnIndex,
                  );

                const currentContribution =
                  isCurrentContribution(
                    rowIndex,
                    columnIndex,
                  );

                const canEdit =
                  editable &&
                  nodeValue === 0;

                const cellClasses = [
                  "sudoku-cell",

                  nodeContribution
                    ? "sudoku-cell-node-contribution"
                    : "",

                  currentContribution
                    ? "sudoku-cell-current-contribution"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div
                    className={
                      cellClasses
                    }
                    key={`${rowIndex}-${columnIndex}`}
                  >
                    {canEdit ? (
                      <input
                        className="sudoku-input"
                        type="number"
                        min={1}
                        max={
                          board.length
                        }
                        value={
                          editedValue ===
                          0
                            ? ""
                            : editedValue
                        }
                        onChange={(
                          event,
                        ) =>
                          handleChange(
                            rowIndex,
                            columnIndex,
                            event.target
                              .value,
                          )
                        }
                      />
                    ) : nodeValue ===
                      0 ? (
                      <span className="sudoku-empty">
                        ·
                      </span>
                    ) : (
                      nodeValue
                    )}
                  </div>
                );
              },
            )}
          </div>
        ),
      )}
    </div>
  );
}

export default SudokuBoard;