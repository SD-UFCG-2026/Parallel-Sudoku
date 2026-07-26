import {
  useEffect,
  useState,
} from "react";

import RunTree from "../../components/RunTree/RunTree";
import SudokuBoard from "../../components/SudokuBoard/SudokuBoard";
import ContributionModal from "../../components/ContributionModal/ContributionModal";

import type { Signature } from "../../types/signature";
import type { NodeDto } from "../../types/node";
import type { RunDto } from "../../types/run";

import {
  getAllSudokus,
  getSudokuById,
  submitContribution,
} from "../../api/sudokuApi";


import "./RunPage.css";

function findParent(
  root: NodeDto,
  target: NodeDto,
): NodeDto | null {
  for (const child of root.child) {
    if (child === target) {
      return root;
    }

    const result = findParent(
      child,
      target,
    );

    if (result) {
      return result;
    }
  }

  return null;
}

function countAdditions(
  node: NodeDto,
  parent: NodeDto | null,
): number {
  if (!parent) {
    return 0;
  }

  let additions = 0;

  for (
    let row = 0;
    row < node.value.board.length;
    row++
  ) {
    for (
      let col = 0;
      col < node.value.board[row].length;
      col++
    ) {
      if (
        parent.value.board[row][col] === 0 &&
        node.value.board[row][col] !== 0
      ) {
        additions++;
      }
    }
  }

  return additions;
}



function RunPage() {
  const [sudokus, setSudokus] =
    useState<RunDto[]>([]);

  const [selectedSudoku, setSelectedSudoku] =
    useState<RunDto | null>(null);

  const [selectedSudokuIndex, setSelectedSudokuIndex] =
    useState(0);

  const [selectedNode, setSelectedNode] =
    useState<NodeDto | null>(null);

  const [editableBoard, setEditableBoard] =
    useState<number[][]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingTree, setLoadingTree] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const selectedSudokuSummary =
    sudokus[selectedSudokuIndex] ?? null;

  const selectedSudokuId =
    selectedSudokuSummary?.id ?? null;

  useEffect(() => {
    async function loadSudokus() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getAllSudokus();

        setSudokus(data);

        if (data.length === 0) {
          return;
        }

        const firstSudoku =
          await getSudokuById(
            data[0].id,
          );

        setSelectedSudoku(
          firstSudoku,
        );

        setSelectedNode(
          firstSudoku.root,
        );
      } catch (error) {
        console.error(error);

        setError(
          "Não foi possível carregar os Sudokus.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSudokus();
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      return;
    }

    setEditableBoard(
      structuredClone(
        selectedNode.value.board,
      ),
    );
  }, [selectedNode]);

  async function selectSudoku(
    index: number,
  ) {
    const sudokuSummary =
      sudokus[index];

    if (!sudokuSummary) {
      return;
    }

    try {
      setLoadingTree(true);

      const sudoku =
        await getSudokuById(
          sudokuSummary.id,
        );

      setSelectedSudokuIndex(
        index,
      );

      setSelectedSudoku(
        sudoku,
      );

      setSelectedNode(
        sudoku.root,
      );
    } catch (error) {
      console.error(
        "Erro ao carregar Sudoku:",
        error,
      );

      setError(
        "Não foi possível carregar a árvore do Sudoku.",
      );
    } finally {
      setLoadingTree(false);
    }
  }

  function previousSudoku() {
    selectSudoku(
      selectedSudokuIndex - 1,
    );
  }

  function nextSudoku() {
    selectSudoku(
      selectedSudokuIndex + 1,
    );
  }

  function handleBoardChange(
    rowIndex: number,
    columnIndex: number,
    value: number,
  ) {
    setEditableBoard((current) => {
      const updated =
        structuredClone(current);

      updated[rowIndex][columnIndex] =
        value;

      return updated;
    });
  }

  function hasChanges(
      original: number[][],
      edited: number[][],
    ): boolean {
      if (
        original.length === 0 ||
        edited.length === 0 ||
        original.length !== edited.length
      ) {
        return false;
      }

      return original.some(
        (row, rowIndex) => {
          const editedRow = edited[rowIndex];

          if (!editedRow || row.length !== editedRow.length) {
            return false;
          }

          return row.some(
            (value, columnIndex) =>
              value !== editedRow[columnIndex],
          );
        },
      );
    }
  
  async function refreshSelectedSudoku() {
    if (!selectedSudoku) {
      return;
    }

    const updated =
      await getSudokuById(
        selectedSudoku.id,
      );

    setSelectedSudoku(
      updated,
    );

    setSelectedNode(
      updated.root,
    );
  }

  async function handleConfirmContribution(
    signature: Signature,
  ) {
    if (
      !selectedSudoku ||
      !selectedNode
    ) {
      throw new Error(
        "Nenhum Sudoku selecionado.",
      );
    }

    await submitContribution(
      selectedSudoku.id,
      {
        board: editableBoard,
        signature,
      },
    );

    await refreshSelectedSudoku();
  }

    const boardHasChanges =
      selectedNode &&
      editableBoard.length > 0
        ? hasChanges(
            selectedNode.value.board,
            editableBoard,
          )
        : false;

    const parentNode =
    selectedSudoku &&
    selectedNode
      ? findParent(
          selectedSudoku.root,
          selectedNode,
        )
      : null;

    const additions =
    selectedNode
      ? countAdditions(
          selectedNode,
          parentNode,
        )
      : 0;
    
    if (loading) {
      return (
        <main className="run-page">
          <div className="run-status">
            <h2>Carregando Sudokus...</h2>
            <p>
              Buscando as árvores de contribuições.
            </p>
          </div>
        </main>
      );
    }

    if (error) {
      return (
        <main className="run-page">
          <div className="run-status run-status-error">
            <h2>Erro ao carregar Sudokus</h2>
            <p>{error}</p>
          </div>
        </main>
      );
    }

    if (sudokus.length === 0) {
      return (
        <main className="run-page">
          <div className="run-status">
            <h2>Nenhum Sudoku disponível</h2>
            <p>
              Não existem Sudokus disponíveis para
              contribuição no momento.
            </p>
          </div>
        </main>
      );
    }
    
    return (
      <main className="run-page">
        <header className="run-header">
          <h1>
            Sudoku Parallel Computing
          </h1>

          <p>
            Selecione um nó da árvore para
            visualizar sua contribuição.
          </p>
        </header>

        <div className="run-layout">
          <section className="run-panel">
            <h2>
              Árvore de contribuições
            </h2>
            <div className="sudoku-navigation">
            <button
              type="button"
              onClick={previousSudoku}
              disabled={
                selectedSudokuIndex === 0
              }
            >
              ←
            </button>

            <div>
              <strong>
                Sudoku #{selectedSudokuId ?? "-"}
              </strong>

              <span>
                {selectedSudokuIndex + 1}
                {" / "}
                {sudokus.length}
              </span>
            </div>

            <button
              type="button"
              onClick={nextSudoku}
              disabled={
                selectedSudokuIndex ===
                sudokus.length - 1
              }
            >
              →
            </button>
          </div>
            {loadingTree && (
              <div className="tree-loading">
                Carregando árvore...
              </div>
            )}
            {selectedSudoku &&
            selectedNode &&
            !loadingTree && (
              <RunTree
                root={
                  selectedSudoku.root
                }
                selectedNode={
                  selectedNode
                }
                onSelectNode={
                  setSelectedNode
                }
              />
            )}

            <div className="run-legend">
              <h3>Legenda</h3>

              <div>
                <span className="legend-dot system" />
                Sudoku inicial
              </div>

              <div>
                <span className="legend-dot selected" />
                Nó selecionado
              </div>

              <div>
                <span className="legend-dot normal" />
                Outros nós
              </div>
            </div>
          </section>

          <section className="run-panel">
            <h2>
              Sudoku selecionado
            </h2>

            <div className="board-area">
              {selectedNode && (
                <SudokuBoard
                  board={selectedNode.value.board}
                  parentBoard={
                    parentNode?.value.board ?? null
                  }
                  editableBoard={editableBoard}
                editable
                onChange={handleBoardChange}
                />
              )}
            </div>

            <div className="board-legend">
              <div>
                <span className="board-legend-color inherited" />
                Herdado do nó pai
              </div>

              <div>
                <span className="board-legend-color node-added" />
                Adicionado nesta contribuição
              </div>

              <div>
                <span className="board-legend-color current-added" />
                Sua nova adição
              </div>
            </div>

            <div className="contribution-info">
              <div className="contribution-avatar">
                {selectedNode?.value.signature.identifier
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
              <strong className="contribution-name">
                Contribuição:{" "}
                <span
                  title={selectedNode?.value.signature.identifier}
                >
                  {selectedNode?.value.signature.identifier}
                </span>
              </strong>

                <p>
                  Adições em relação ao pai:{" "}
                  {additions}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="submit-contribution-button"
              disabled={!boardHasChanges}
              onClick={() => setModalOpen(true)}
            >
              Enviar contribuição
            </button>

            <div className="board-help">
              <h3>Como funciona</h3>

              <p>
                Ao adicionar números ao Sudoku, você está contribuindo para a solução do quebra-cabeça. 
                Cada contribuição é registrada na árvore de contribuições, permitindo que outros usuários vejam e construam sobre o seu trabalho. 
                Certifique-se de revisar suas alterações antes de enviar sua contribuição. Sua adição só será efetivada se correta e não conflitar com as contribuições anteriores.
                OBS: Pode demorar alguns minutos para que sua contribuição seja processada e refletida na árvore de contribuições.
              </p>
            </div>
          </section>
          <ContributionModal
            open={modalOpen}
            onClose={() =>
              setModalOpen(false)
            }
            onConfirm={
              handleConfirmContribution
            }
          />
        </div>
      </main>
    );
}

export default RunPage;
