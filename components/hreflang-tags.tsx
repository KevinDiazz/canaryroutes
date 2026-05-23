import { getHreflangLinks } from '@/lib/i18n';

export function HreflangTags({ path }: { path: string }) {
  const links = getHreflangLinks(path);
  return (
    <>
      {links.map(({ locale, href }) => (
        <link key={locale} rel="alternate" hrefLang={locale} href={href} />
      ))}
    </>
  );
}
