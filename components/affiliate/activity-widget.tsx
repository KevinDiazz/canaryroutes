'use client';

import { GYG_PARTNER_ID, getGygLocaleCode } from '@/lib/affiliates';
import type { Locale } from '@/lib/types';

interface ActivityWidgetProps {
  locale: Locale;
  /** One or more GetYourGuide tour IDs to feature, e.g. ["430098"]. */
  tourIds: string[];
  /** Number of activity cards to render. Defaults to the number of tourIds. */
  numberOfItems?: number;
  /** URL shown in the "Powered by GetYourGuide" attribution link. */
  attributionHref?: string;
}

/**
 * Embeds the GetYourGuide "Activities" widget, showing one or more
 * bookable experiences as cards (image, rating, price).
 *
 * Relies on the global GYG widget script loaded once via
 * `GygTrackingScript` in the root layout.
 */
export function ActivityWidget({
  locale,
  tourIds,
  numberOfItems,
  attributionHref = 'https://www.getyourguide.com/',
}: ActivityWidgetProps) {
  return (
    <div
      data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
      data-gyg-locale-code={getGygLocaleCode(locale)}
      data-gyg-widget="activities"
      data-gyg-number-of-items={numberOfItems ?? tourIds.length}
      data-gyg-partner-id={GYG_PARTNER_ID}
      data-gyg-tour-ids={tourIds.join(',')}
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
