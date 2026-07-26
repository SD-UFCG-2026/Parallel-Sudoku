export interface SignaturePayload {
  publicKey: string;
  signature: string;
}

export function encodeSignaturePayload(
  publicKey: string,
  signature: string,
): string {
  return btoa(
    JSON.stringify({
      publicKey,
      signature,
    }),
  );
}

export function decodeSignaturePayload(
  encoded: string,
): SignaturePayload {
  return JSON.parse(
    atob(encoded),
  ) as SignaturePayload;
}