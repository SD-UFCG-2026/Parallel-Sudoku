export interface EllipticKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface SignedContribution
  extends EllipticKeyPair {
  signature: string;
}

export async function generateEllipticKeyPair(): Promise<EllipticKeyPair> {
  const keyPair =
    await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"],
    );

  const publicKeyBuffer =
    await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );

  const privateKeyBuffer =
    await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

  return {
    publicKey:
      arrayBufferToBase64(
        publicKeyBuffer,
      ),

    privateKey:
      arrayBufferToBase64(
        privateKeyBuffer,
      ),
  };
}

export interface SignedContribution {
  publicKey: string;
  privateKey: string;
  signature: string;
}

function arrayBufferToBase64(
  buffer: ArrayBuffer,
): string {
  const bytes = new Uint8Array(buffer);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

/**
 * Monta exatamente os bytes que serão assinados.
 *
 * IMPORTANTE:
 * o backend precisa reconstruir a mesma mensagem,
 * no mesmo formato, para verificar a assinatura.
 */
function createContributionMessage(
  identifier: string,
  board: number[][],
): ArrayBuffer {
  const message = JSON.stringify({
    identifier,
    board,
  });

  const encoded =
    new TextEncoder().encode(message);

  return new Uint8Array(encoded).buffer;
}

export async function signContribution(
  identifier: string,
  board: number[][],
): Promise<SignedContribution> {
  /*
   * 1. Gera um novo par de chaves ECDSA.
   */
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );

  /*
   * 2. Constrói a mensagem que será assinada.
   */
  const message = createContributionMessage(
    identifier,
    board,
  );

  /*
   * 3. Assina a mensagem utilizando a chave privada.
   */
  const signatureBuffer =
    await crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      keyPair.privateKey,
      message,
    );

  /*
   * 4. Exporta a chave pública no formato SPKI.
   */
  const publicKeyBuffer =
    await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );

  /*
   * 5. Exporta a chave privada no formato PKCS#8.
   *
   * Essa chave NÃO será enviada ao backend.
   * Será entregue somente ao usuário.
   */
  const privateKeyBuffer =
    await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

  /*
   * 6. Converte tudo para Base64 para facilitar
   * transporte/armazenamento como string.
   */
  return {
    publicKey:
      arrayBufferToBase64(
        publicKeyBuffer,
      ),

    privateKey:
      arrayBufferToBase64(
        privateKeyBuffer,
      ),

    signature:
      arrayBufferToBase64(
        signatureBuffer,
      ),
  };
}