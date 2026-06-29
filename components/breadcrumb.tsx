import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface Props {
  items: BreadcrumbItem[];
  /** true = visually hidden (map pages), false = visible (route/content pages) */
  srOnly?: boolean;
}

export function Breadcrumb({ items, srOnly = false }: Props) {
  const style = srOnly
    ? { position: 'absolute' as const, width: '1px', height: '1px',
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' as const }
    : { display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' as const };

  return (
    <nav aria-label="Breadcrumb" style={style}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: '6px',
                   listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.href}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isLast ? (
                <span aria-current="page" style={{ color: '#374151', fontWeight: 500 }}>
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.href} style={{ color: '#1f9d61', textDecoration: 'none' }}>
                    {item.name}
                  </Link>
                  <span aria-hidden="true" style={{ color: '#d1d5db' }}>›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
