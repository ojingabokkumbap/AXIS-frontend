import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** Full URL opened when the certificate QR is scanned (verify page + query). */
export function buildCertificateVerifyQrUrl(
  verifyPageUrl: string,
  certNumber: string,
  holderName: string,
): string {
  const trimmed = verifyPageUrl.trim();
  const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  u.searchParams.set('certNo', certNumber.trim());
  const h = holderName.trim();
  if (h.length >= 2) {
    u.searchParams.set('holderName', h);
  }
  return u.toString();
}

/**
 * Renders a scannable QR that lands on `/verify-cert` with `certNo` (+ `holderName`
 * when present) so the public verify API can run without retyping from the paper.
 */
export function CertificateVerifyQr({
  payloadUrl,
  size = 112,
}: {
  payloadUrl: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(payloadUrl, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#002060', light: '#FFFFFF' },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [payloadUrl, size]);

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          border: '2px solid #002060',
          background: '#fff',
          boxSizing: 'border-box',
        }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="자격증 진위 확인 QR"
      width={size}
      height={size}
      style={{ display: 'block', border: '2px solid #002060', boxSizing: 'border-box' }}
    />
  );
}
