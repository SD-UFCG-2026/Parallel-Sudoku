import {
  useEffect,
  useState,
} from "react";

import RunTree from "../../components/RunTree/RunTree";
import SudokuBoard from "../../components/SudokuBoard/SudokuBoard";
import ContributionModal from "../../components/ContributionModal/ContributionModal";
import { runMock } from "../../mocks/runMock";
import type { Signature } from "../../types/signature";
import type { NodeDto } from "../../types/node";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] =
    useState<NodeDto>(runMock.root);

  const [editableBoard, setEditableBoard] =
  useState<number[][]>(
    structuredClone(
      selectedNode.value.board,
    ),
  );
  useEffect(() => {
    setEditableBoard(
      structuredClone(
        selectedNode.value.board,
      ),
    );
  }, [selectedNode]);

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
    return original.some(
      (row, rowIndex) =>
        row.some(
          (value, columnIndex) =>
            value !==
            edited[rowIndex][columnIndex],
        ),
    );
  }

  async function handleConfirmContribution(
    signature: Signature,
  ) {
    console.log(
      "Board enviado:",
      editableBoard,
    );

    console.log(
      "Signature enviada:",
      signature,
    );

    // TO DO: Implementar a lógica de envio da contribuição para o backend
    // await runApi.submitContribution(...);
  }
  const boardHasChanges = hasChanges(
    selectedNode.value.board,
    editableBoard,
  );
  const parentNode = findParent(
    runMock.root,
    selectedNode,
  );

  const additions = countAdditions(
    selectedNode,
    parentNode,
  );

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

          <RunTree
            root={runMock.root}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />

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
            <SudokuBoard
              board={selectedNode.value.board}
              parentBoard={
                parentNode?.value.board ?? null
              }
              editableBoard={editableBoard}
              editable
              onChange={handleBoardChange}
            />
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
              {selectedNode.value.signature.identifier
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                Contribuição:{" "}
                {selectedNode.value.signature.identifier}
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