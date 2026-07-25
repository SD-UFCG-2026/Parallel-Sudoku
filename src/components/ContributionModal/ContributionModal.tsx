import {
  useEffect,
  useState,
} from "react";

import type { Signature } from "../../types/signature";
import {generateEllipticKeyPair} from "../../utils/ellipticKey";
import "./ContributionModal.css";

interface ContributionModalProps {
  open: boolean;
  onClose: () => void;

  onConfirm: (
    signature: Signature,
  ) => Promise<void> | void;
}

type ModalStep =
  | "form"
  | "sending"
  | "success";

function ContributionModal({
  open,
  onClose,
  onConfirm,
}: ContributionModalProps) {
  const [nickname, setNickname] =
    useState("");

  const [privateKey, setPrivateKey] =
    useState("");

  const [publicKey, setPublicKey] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [step, setStep] =
    useState<ModalStep>("form");

  useEffect(() => {
    if (!open) {
      return;
    }

    setNickname("");
    setPrivateKey("");
    setPublicKey("");
    setCopied(false);
    setStep("form");
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleConfirm() {
    const trimmedNickname =
      nickname.trim();

    if (!trimmedNickname) {
      return;
    }

    try {
      setStep("sending");

      const keyPair =
        await generateEllipticKeyPair();

      const signature: Signature = {
        identifier: trimmedNickname,
        key: keyPair.publicKey,
      };

      await onConfirm(signature);

      setPublicKey(
        keyPair.publicKey,
      );

      setPrivateKey(
        keyPair.privateKey,
      );

      setStep("success");
    } catch (error) {
      console.error(
        "Erro ao enviar contribuição:",
        error,
      );

      setStep("form");
    }
  }

  async function copyPrivateKey() {
    if (!privateKey) {
      return;
    }

    await navigator.clipboard.writeText(
      privateKey,
    );

    setCopied(true);
  }

  function downloadPrivateKey() {
    if (!privateKey) {
      return;
    }

    const content = [
      "Sudoku Shared Computing",
      "",
      `Nick: ${nickname.trim()}`,
      "",
      "PRIVATE KEY:",
      privateKey,
      "",
      "PUBLIC KEY:",
      publicKey,
      "",
      "IMPORTANTE:",
      "Não compartilhe sua chave privada.",
    ].join("\n");

    const blob = new Blob(
      [content],
      {
        type: "text/plain;charset=utf-8",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "sudoku-contribution-key.txt";

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={
        step === "success"
          ? undefined
          : onClose
      }
    >
      <div
        className="contribution-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {step === "form" && (
          <>
            <div className="modal-header">
              <h2>
                Enviar contribuição
              </h2>

              <button
                type="button"
                className="modal-close"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <p className="modal-description">
              Escolha um nick para
              identificar sua contribuição.
            </p>

            <label className="modal-field">
              <span>Nick</span>

              <input
                type="text"
                value={nickname}
                maxLength={40}
                placeholder="Ex.: PlayerOne"
                onChange={(event) =>
                  setNickname(
                    event.target.value,
                  )
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="confirm-button"
                disabled={
                  nickname.trim()
                    .length === 0
                }
                onClick={
                  handleConfirm
                }
              >
                Enviar contribuição
              </button>
            </div>
          </>
        )}

        {step === "sending" && (
          <div className="modal-status">
            <h2>
              Enviando contribuição...
            </h2>

            <p>
              Aguarde enquanto a
              contribuição é preparada.
            </p>
          </div>
        )}

        {step === "success" && (
          <>
            <div className="modal-header">
              <h2>
                Contribuição enviada
              </h2>
            </div>

            <p className="modal-description">
              Sua contribuição foi
              registrada. Guarde a chave
              abaixo.
            </p>

            <div className="key-section">
              <span className="key-label">
                Sua chave privada
              </span>

              <div className="key-value">
                {privateKey}
              </div>

              <p className="key-warning">
                Esta chave não será
                exibida novamente. Guarde-a
                em um local seguro.
              </p>

              <div className="key-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    copyPrivateKey
                  }
                >
                  {copied
                    ? "Copiado"
                    : "Copiar chave"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    downloadPrivateKey
                  }
                >
                  Baixar .txt
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="confirm-button"
                onClick={onClose}
              >
                Concluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ContributionModal;