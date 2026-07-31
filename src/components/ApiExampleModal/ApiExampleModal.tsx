import { useState } from "react";

import "./ApiExampleModal.css";

interface ApiExampleModalProps {
  open: boolean;
  sudokuId: number;
  onClose: () => void;
}

type ApiExampleTab =
  | "get-all"
  | "get-id"
  | "post";

const API_URL =
  "https://sd-2026-1-back.up.railway.app/api/sudoku";

function ApiExampleModal({
  open,
  sudokuId,
  onClose,
}: ApiExampleModalProps) {
  const [selectedTab, setSelectedTab] =
    useState<ApiExampleTab>("get-all");

  if (!open) {
    return null;
  }

  const examples: Record<
    ApiExampleTab,
    {
      method: string;
      url: string;
      description: string;
      body: string;
    }
  > = {
    "get-all": {
      method: "GET",
      url: API_URL,
      description:
        "Retorna os Sudokus disponíveis sem carregar toda a árvore de filhos.",
      body: JSON.stringify(
        [
          {
            id: 1,
            root: {
              value: {
                board: [
                  [0, 0, 0, 4],
                  [0, 0, 0, 0],
                  [2, 0, 0, 3],
                  [4, 0, 1, 2],
                ],
                signature: {
                  identifier: "System",
                  key: "",
                },
              },
              child: [],
            },
            isFinished: false,
            final: null,
          },
        ],
        null,
        2,
      ),
    },

    "get-id": {
      method: "GET",
      url: `${API_URL}/${sudokuId}`,
      description:
        "Retorna o Sudoku selecionado com toda a árvore de contribuições.",
      body: JSON.stringify(
        {
          id: sudokuId,
          root: {
            value: {
              board: [
                [0, 0, 0, 4],
                [0, 0, 0, 0],
                [2, 0, 0, 3],
                [4, 0, 1, 2],
              ],
              signature: {
                identifier: "System",
                key: "",
              },
            },
            child: [
              {
                value: {
                  board: [
                    [1, 0, 0, 4],
                    [0, 0, 0, 0],
                    [2, 0, 0, 3],
                    [4, 0, 1, 2],
                  ],
                  signature: {
                    identifier: "Jogador1",
                    key: "ExemploKey",
                  },
                },
                child: [],
              },
            ],
          },
          isFinished: false,
          final: null,
        },
        null,
        2,
      ),
    },

    post: {
      method: "POST",
      url: `${API_URL}/${sudokuId}`,
      description:
        "Envia um novo estado de tabuleiro para o Sudoku selecionado.",
      body: JSON.stringify(
        [
          [1, 0, 0, 4],
          [0, 0, 0, 0],
          [2, 0, 0, 3],
          [4, 0, 1, 2],
        ],
        null,
        2,
      ),
    },
  };

  const example =
    examples[selectedTab];

  async function copyExample() {
    const content = [
      `${example.method} ${example.url}`,
      "",
      example.body,
    ].join("\n");

    await navigator.clipboard.writeText(
      content,
    );
  }

  return (
    <div
      className="api-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="api-example-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <h2>Exemplo da API</h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="api-tabs">
          <button
            type="button"
            className={
              selectedTab === "get-all"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedTab("get-all")
            }
          >
            GET todos
          </button>

          <button
            type="button"
            className={
              selectedTab === "get-id"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedTab("get-id")
            }
          >
            GET por ID
          </button>

          <button
            type="button"
            className={
              selectedTab === "post"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedTab("post")
            }
          >
            POST
          </button>
        </div>

        <p className="api-description">
          {example.description}
        </p>

        <div className="api-endpoint">
          <span
            className={`api-method api-method-${example.method.toLowerCase()}`}
          >
            {example.method}
          </span>

          <code>{example.url}</code>
        </div>

        <pre className="api-code">
          <code>{example.body}</code>
        </pre>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={copyExample}
          >
            Copiar exemplo
          </button>

          <button
            type="button"
            className="confirm-button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiExampleModal;