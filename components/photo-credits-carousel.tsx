'use client';

import type { Locale } from '@/lib/types';
import type { PhotoCreditGroup } from '@/lib/image-credits';
import { useUiStrings } from '@/lib/ui-strings';

/** Devuelve el grupo de créditos que corresponde a la foto activa (índice 0-based), o `undefined` si esa foto no requiere atribución. */
export function getCreditForPhoto(groups: PhotoCreditGroup[], photoIndex: number): PhotoCreditGroup | undefined {
  return groups.find((group) => group.positions.includes(photoIndex + 1));
}

interface PhotoCreditLineProps {
  group: PhotoCreditGroup;
  locale: Locale;
}

/**
 * Bloque de créditos para la foto actualmente visible del carrusel, con
 * formato de ficha: título, obra, autor, fuente, licencia y modificaciones.
 */
export function PhotoCreditLine({ group, locale }: PhotoCreditLineProps) {
  const t = useUiStrings(locale).credits;

  return (
    <details style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
        {t.title}
      </summary>
      <div style={{ marginTop: '4px' }}>
        {group.isOwn ? (
          <div>
            {t.ownNotice}
            {group.author ? ` — ${group.author}` : ''}
          </div>
        ) : (
          <>
            {group.title && (
              <div>
                <strong>{t.work}:</strong> {group.title}
              </div>
            )}
            {group.author && (
              <div>
                <strong>{t.author}:</strong> {group.author}
              </div>
            )}
            {group.sourceName && (
              <div>
                <strong>{t.sourceLink}:</strong>{' '}
                {group.sourceUrl ? (
                  <a href={group.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1f9d61' }}>
                    {group.sourceName}
                  </a>
                ) : (
                  group.sourceName
                )}
              </div>
            )}
            {group.licenseLabel && (
              <div>
                <strong>{t.license}:</strong>{' '}
                {group.licenseUrl ? (
                  <a href={group.licenseUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1f9d61' }}>
                    {group.licenseLabel}
                  </a>
                ) : (
                  group.licenseLabel
                )}
              </div>
            )}
            {(group.modifications || group.modified) && (
              <div>
                <strong>{t.modificationsLabel}:</strong> {group.modifications ?? t.modifications}
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
}
