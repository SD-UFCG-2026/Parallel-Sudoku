import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  generateEllipticKeyPair,
} from "../../utils/ellipticKey";

import "./DockerContributionModal.css";

interface DockerContributionModalProps {
  open: boolean;
  sudokuId: number;
  onClose: () => void;
}

const DOCKER_IMAGE =
  "ghcr.io/sd-ufcg-2026/sudoku-solver-probabilistic:latest";

const API_URL =
  "https://sd-2026-1-back.up.railway.app/api/sudoku";

function DockerContributionModal({
  open,
  sudokuId,
  onClose,
}: DockerContributionModalProps) {
  const [nickname, setNickname] =
    useState("");

  const [publicKey, setPublicKey] =
    useState("");

  const [privateKey, setPrivateKey] =
    useState("");

  const [loadingKeys, setLoadingKeys] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setNickname("");
    setPublicKey("");
    setPrivateKey("");
    setCopied(false);

    async function generateKeys() {
      try {
        setLoadingKeys(true);

        const keys =
          await generateEllipticKeyPair();

        setPublicKey(keys.publicKey);
        setPrivateKey(keys.privateKey);
      } catch (error) {
        console.error(
          "Erro ao gerar chaves:",
          error,
        );
      } finally {
        setLoadingKeys(false);
      }
    }

    void generateKeys();
  }, [open]);

  const dockerCommand =
    useMemo(() => {
      if (
        !nickname.trim() ||
        !publicKey ||
        !privateKey
      ) {
        return "";
      }

      return [
        `docker run`,
        `-e PRIVATE_KEY="${privateKey}"`,
        `-e PUBLIC_KEY="${publicKey}"`,
        `-e IDENTIFIER="${nickname.trim()}"`,
        `-e URL="${API_URL}/${sudokuId}"`,
        `${DOCKER_IMAGE}`
      ].join(" ");
    }, [
      nickname,
      privateKey,
      publicKey,
      sudokuId,
    ]);

  if (!open) {
    return null;
  }

  async function copyCommand() {
    if (!dockerCommand) {
      return;
    }

    await navigator.clipboard.writeText(
      dockerCommand,
    );

    setCopied(true);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="docker-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <h2>
            Contribuir utilizando Docker
          </h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="docker-description">
          Você também pode contribuir
          executando um worker local. Informe
          um nick e copie o comando abaixo
          para executar no Docker.
        </p>

        <label className="modal-field">
          <span>Nick</span>

          <input
            type="text"
            value={nickname}
            maxLength={40}
            placeholder="Ex.: PlayerOne"
            onChange={(event) => {
              setNickname(
                event.target.value,
              );

              setCopied(false);
            }}
          />
        </label>

        {loadingKeys ? (
          <div className="docker-loading">
            Gerando par de chaves...
          </div>
        ) : (
          <>
            <div className="docker-command-section">
              <span className="docker-command-label">
                Docker Run
              </span>

              <pre className="docker-command">
                {dockerCommand ||
                  "Informe um nick para gerar o comando."}
              </pre>

              <button
                type="button"
                className="secondary-button"
                disabled={!dockerCommand}
                onClick={copyCommand}
              >
                {copied
                  ? "Comando copiado"
                  : "Copiar comando"}
              </button>
            </div>

            <div className="docker-info">
              <strong>
                Sudoku #{sudokuId}
              </strong>

              <p>
                O worker será conectado
                diretamente a este Sudoku.
              </p>
            </div>
          </>
        )}

        <div className="modal-actions">
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

export default DockerContributionModal;
