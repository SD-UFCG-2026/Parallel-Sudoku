export interface EllipticKeyPair {
  publicKey: string;
  privateKey: string;
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

  const publicKey =
    await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );

  const privateKey =
    await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

  return {
    publicKey:
      arrayBufferToBase64(publicKey),

    privateKey:
      arrayBufferToBase64(privateKey),
  };
}