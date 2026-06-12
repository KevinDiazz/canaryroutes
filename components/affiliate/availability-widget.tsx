'use client';

import { GYG_PARTNER_ID, GYG_CURRENCY, getGygLocaleCode } from '@/lib/affiliates';
import type { Locale } from '@/lib/types';

interface AvailabilityWidgetProps {
  /** GetYourGuide tour ID, e.g. "430098" */
  tourId: string;
  locale: Locale;
  /** Layout orientation. "horizontal" works well inside the POI detail sheet. */
  variant?: 'horizontal' | 'vertical';
  /** URL shown in the "Powered by GetYourGuide" attribution link. */
  attributionHref?: string;
}

/**
 * Embeds the GetYourGuide "Availability" widget for a single activity.
 * Shows live price + dates and a direct booking CTA.
 *
 * Relies on the global GYG widget script loaded once via
 * `GygTrackingScript` in the root layout.
 */
export function AvailabilityWidget({
  tourId,
  locale,
  variant = 'horizontal',
  attributionHref = 'https://www.getyourguide.com/',
}: AvailabilityWidgetProps) {
  return (
    <div
      data-gyg-href="https://widget.getyourguide.com/default/availability.frame"
      data-gyg-tour-id={tourId}
      data-gyg-locale-code={getGygLocaleCode(locale)}
      data-gyg-currency={GYG_CURRENCY}
      data-gyg-widget="availability"
      data-gyg-variant={variant}
      data-gyg-partner-id={GYG_PARTNER_ID}
    >
      <span>
        Powered by{' '}
        <a target="_blank" rel="sponsored noopener" href={attributionHref}>
          GetYourGuide
        </a>
      </span>
    </div>
  );
}
