import {
  useEffect,
  useRef,
  useState,
} from "react";

import RunTree from "../../components/RunTree/RunTree";
import SudokuBoard from "../../components/SudokuBoard/SudokuBoard";
import ContributionModal from "../../components/ContributionModal/ContributionModal";
import DockerContributionModal from "../../components/DockerContributionModal/DockerContributionModal";
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
  //Movimentação Tabuleiro
  const boardViewportRef =
  useRef<HTMLDivElement | null>(null);

  const boardContentRef =
    useRef<HTMLDivElement | null>(null);

  const [boardZoom, setBoardZoom] =
    useState(1);

  const [boardPosition, setBoardPosition] =
    useState({
      x: 0,
      y: 0,
    });

  const [isDraggingBoard, setIsDraggingBoard] =
    useState(false);

  const dragStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    boardX: 0,
    boardY: 0,
  });
  //Movimentação Árvore
  const treeViewportRef =
    useRef<HTMLDivElement | null>(null);

  const [treeZoom, setTreeZoom] =
    useState(1);

  const [treePosition, setTreePosition] =
    useState({
      x: 24,
      y: 24,
    });

  const [isDraggingTree, setIsDraggingTree] =
    useState(false);

  const treeDragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    treeX: 0,
    treeY: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [dockerModalOpen, setDockerModalOpen] = useState(false);

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

  useEffect(() => {
    const animationFrame =
      requestAnimationFrame(() => {
        fitBoardToViewport();
      });

    return () =>
      cancelAnimationFrame(
        animationFrame,
      );
  }, [selectedNode]);

  useEffect(() => {
    function handleResize() {
      fitBoardToViewport();
    }

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

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
//Movimentação Árvore
  function changeTreeZoom(
    difference: number,
  ) {
    setTreeZoom((currentZoom) => {
      const nextZoom = Math.min(
        2,
        Math.max(
          0.25,
          currentZoom + difference,
        ),
      );

      return Number(
        nextZoom.toFixed(2),
      );
    });
  }

  function resetTreeView() {
    setTreeZoom(1);

    setTreePosition({
      x: 24,
      y: 24,
    });
  }
  function handleTreePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (event.button !== 0) {
      return;
    }

    const target =
      event.target as HTMLElement;

    /*
    * Evita iniciar o arraste ao clicar
    * diretamente em um nó da árvore.
    */
    if (
      target.closest(
        "button, input, textarea, select",
      )
    ) {
      return;
    }

    setIsDraggingTree(true);

    treeDragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      treeX: treePosition.x,
      treeY: treePosition.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function handleTreePointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (!isDraggingTree) {
      return;
    }

    const deltaX =
      event.clientX -
      treeDragStartRef.current.pointerX;

    const deltaY =
      event.clientY -
      treeDragStartRef.current.pointerY;

    setTreePosition({
      x:
        treeDragStartRef.current.treeX +
        deltaX,

      y:
        treeDragStartRef.current.treeY +
        deltaY,
    });
  }

  function handleTreePointerUp(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    setIsDraggingTree(false);

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }
  }


//Movimentação Tabuleiro
  function fitBoardToViewport() {
    const viewport =
      boardViewportRef.current;

    const content =
      boardContentRef.current;

    if (!viewport || !content) {
      return;
    }

    const viewportWidth =
      viewport.clientWidth - 32;

    const viewportHeight =
      viewport.clientHeight - 32;

    const boardWidth =
      content.scrollWidth;

    const boardHeight =
      content.scrollHeight;

    if (
      boardWidth === 0 ||
      boardHeight === 0
    ) {
      return;
    }

    const scaleX =
      viewportWidth / boardWidth;

    const scaleY =
      viewportHeight / boardHeight;

    const fittedZoom = Math.min(
      scaleX,
      scaleY,
      1,
    );

    setBoardZoom(fittedZoom);

    setBoardPosition({
      x:
        (viewport.clientWidth -
          boardWidth * fittedZoom) /
        2,

      y:
        (viewport.clientHeight -
          boardHeight * fittedZoom) /
        2,
    });
  }
  function changeBoardZoom(
    difference: number,
  ) {
    setBoardZoom((currentZoom) => {
      const nextZoom = Math.min(
        2,
        Math.max(
          0.2,
          currentZoom + difference,
        ),
      );

      return Number(
        nextZoom.toFixed(2),
      );
    });
  }

  function resetBoardView() {
    fitBoardToViewport();
  }

  function handleBoardPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        "input, button, textarea, select",
      )
    ) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    setIsDraggingBoard(true);

    dragStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      boardX: boardPosition.x,
      boardY: boardPosition.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function handleBoardPointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (!isDraggingBoard) {
      return;
    }

    const deltaX =
      event.clientX -
      dragStartRef.current.mouseX;

    const deltaY =
      event.clientY -
      dragStartRef.current.mouseY;

    setBoardPosition({
      x:
        dragStartRef.current.boardX +
        deltaX,

      y:
        dragStartRef.current.boardY +
        deltaY,
    });
  }

  function handleBoardPointerUp(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    setIsDraggingBoard(false);

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
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
          <div className="tree-controls">
            <button
              type="button"
              className="tree-control-button"
              aria-label="Diminuir zoom da árvore"
              onClick={() =>
                changeTreeZoom(-0.1)
              }
            >
              −
            </button>

            <span className="tree-zoom-value">
              {Math.round(treeZoom * 100)}%
            </span>

            <button
              type="button"
              className="tree-control-button"
              aria-label="Aumentar zoom da árvore"
              onClick={() =>
                changeTreeZoom(0.1)
              }
            >
              +
            </button>

            <button
              type="button"
              className="tree-reset-button"
              onClick={resetTreeView}
            >
              Redefinir
            </button>
          </div>

          <div
            ref={treeViewportRef}
            className={`tree-viewport ${
              isDraggingTree
                ? "tree-viewport-dragging"
                : ""
            }`}
            onPointerDown={
              handleTreePointerDown
            }
            onPointerMove={
              handleTreePointerMove
            }
            onPointerUp={
              handleTreePointerUp
            }
            onPointerCancel={
              handleTreePointerUp
            }
          >
            <div
              className="tree-zoom-content"
              style={{
                transform: `
                  translate(
                    ${treePosition.x}px,
                    ${treePosition.y}px
                  )
                  scale(${treeZoom})
                `,
              }}
            >
              {selectedSudoku &&
                selectedNode &&
                !loadingTree && (
                  <RunTree
                    root={selectedSudoku.root}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                  />
                )}
            </div>
          </div>

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

            <div className="board-section">
              <div className="board-controls">
                <button
                  type="button"
                  className="board-control-button"
                  aria-label="Diminuir zoom"
                  onClick={() =>
                    changeBoardZoom(-0.1)
                  }
                >
                  −
                </button>

                <span className="board-zoom-value">
                  {Math.round(
                    boardZoom * 100,
                  )}
                  %
                </span>

                <button
                  type="button"
                  className="board-control-button"
                  aria-label="Aumentar zoom"
                  onClick={() =>
                    changeBoardZoom(0.1)
                  }
                >
                  +
                </button>

                <button
                  type="button"
                  className="board-fit-button"
                  onClick={resetBoardView}
                >
                  Ajustar
                </button>
              </div>

              <div
                ref={boardViewportRef}
                className={`board-viewport ${
                  isDraggingBoard
                    ? "board-viewport-dragging"
                    : ""
                }`}
                onPointerDown={
                  handleBoardPointerDown
                }
                onPointerMove={
                  handleBoardPointerMove
                }
                onPointerUp={
                  handleBoardPointerUp
                }
                onPointerCancel={
                  handleBoardPointerUp
                }
              >
                <div
                  ref={boardContentRef}
                  className="board-zoom-content"
                  style={{
                    transform: `
                      translate(
                        ${boardPosition.x}px,
                        ${boardPosition.y}px
                      )
                      scale(${boardZoom})
                    `,
                  }}
                >
                  {selectedNode && (
                    <SudokuBoard
                      board={
                        selectedNode.value.board
                      }
                      parentBoard={
                        parentNode?.value.board ??
                        null
                      }
                      editableBoard={
                        editableBoard
                      }
                      editable
                      onChange={
                        handleBoardChange
                      }
                    />
                  )}
                </div>
              </div>
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

            <div className="contribution-actions">
              <button
                type="button"
                className="submit-contribution-button"
                disabled={!boardHasChanges}
                onClick={() =>
                  setModalOpen(true)
                }
              >
                Enviar contribuição
              </button>

              <button
                type="button"
                className="docker-contribution-button"
                disabled={!selectedSudoku}
                onClick={() =>
                  setDockerModalOpen(true)
                }
              >
                Contribuir com Docker
              </button>
            </div>
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
            board={editableBoard}
            onConfirm={
              handleConfirmContribution
            }
          />
          {selectedSudoku && (
            <DockerContributionModal
              open={dockerModalOpen}
              sudokuId={selectedSudoku.id}
              onClose={() =>
                setDockerModalOpen(false)
              }
            />
          )}
        </div>
      </main>
    );
}

export default RunPage;
