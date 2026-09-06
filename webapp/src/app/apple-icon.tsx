import { ImageResponse } from 'next/og';
import { getBranding, paddedLogoUrl } from '@/lib/branding';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const { storeName, logoUrl, primary, cream } = await getBranding();
  const initial = storeName.trim().charAt(0).toUpperCase() || 'H';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: logoUrl ? cream : primary,
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={paddedLogoUrl(logoUrl, size.width, size.height, cream)}
            width={size.width}
            height={size.height}
            style={{ objectFit: 'contain' }}
            alt=""
          />
        ) : (
          <span style={{ fontSize: 96, fontWeight: 700, color: cream }}>{initial}</span>
        )}
      </div>
    ),
    { ...size },
  );
}
