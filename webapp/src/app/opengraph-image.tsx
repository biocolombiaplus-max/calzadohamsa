import { ImageResponse } from 'next/og';
import { getBranding, paddedLogoUrl } from '@/lib/branding';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BADGES = ['💵 Contra entrega', '🔥 2×1 con envío gratis', '🔒 Compra segura'];

export default async function OgImage() {
  const { storeName, logoUrl, primary, cream } = await getBranding();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: cream,
        }}
      >
        <div style={{ display: 'flex', height: 10, width: '100%', background: primary }} />

        <div
          style={{
            display: 'flex',
            flex: 1,
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={paddedLogoUrl(logoUrl, 560, 220, cream)}
              width={560}
              height={220}
              style={{ objectFit: 'contain' }}
              alt=""
            />
          ) : (
            <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, color: primary }}>{storeName}</div>
          )}

          <div style={{ display: 'flex', marginTop: 22, fontSize: 30, color: '#6b5847' }}>
            Sandalias y calzado femenino · Envío a toda Colombia
          </div>

          <div style={{ display: 'flex', marginTop: 40, gap: 16 }}>
            {BADGES.map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '12px 22px',
                  borderRadius: 999,
                  background: 'white',
                  color: '#3a2a1c',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
