import redirectsJson from '@/data/redirects.json';

export type RedirectEvent = {
  name: string;
  date: string;
  destination: string;
  channels?: string[];
};

export type RedirectsByGroup = Record<string, RedirectEvent[]>;

export type RedirectRoute = {
  slug: string;
  destination: string;
  group?: string;
  event: string;
  eventTitle: string;
  channel?: string;
  date: string;
};

const redirectsByGroup = redirectsJson as RedirectsByGroup;

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function joinSlug(...parts: string[]): string {
  return parts.map(slugify).filter(Boolean).join('-');
}

function assertDestination(destination: string, context: string): void {
  try {
    const url = new URL(destination);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Destination must be an http(s) URL');
    }
  } catch {
    throw new Error(`Invalid destination for ${context}: ${destination}`);
  }
}

/**
 * Builds hop URLs from `src/data/redirects.json`.
 *
 * Grouped by team, then a list of events you can append to.
 * Each event generates:
 *   /go/{group}-{event}-{channel}-{date}  (one per channel)
 *   /go/{event}-{date}                    (general, all traffic)
 *
 * Example: academic + "research night" + linkedin + 08-01-2026
 *   /go/academic-research-night-linkedin-08-01-2026
 *   /go/research-night-08-01-2026
 */
export function getRedirectRoutes(): RedirectRoute[] {
  const routes: RedirectRoute[] = [];
  const seen = new Map<string, RedirectRoute>();

  for (const [group, events] of Object.entries(redirectsByGroup)) {
    for (const event of events) {
      const eventSlug = slugify(event.name);
      const dateSlug = slugify(event.date);
      const context = `${group}/${event.name}/${event.date}`;

      if (!eventSlug || !dateSlug) {
        throw new Error(`Event name and date are required for ${context}`);
      }

      assertDestination(event.destination, context);

      const base = {
        destination: event.destination,
        event: eventSlug,
        eventTitle: event.name.trim(),
        date: event.date,
      };

      const addRoute = (route: RedirectRoute) => {
        const existing = seen.get(route.slug);
        if (existing && existing.destination !== route.destination) {
          throw new Error(
            `Redirect slug collision for "${route.slug}" (${existing.destination} vs ${route.destination})`,
          );
        }
        if (!existing) {
          seen.set(route.slug, route);
          routes.push(route);
        }
      };

      for (const channel of event.channels ?? []) {
        const channelSlug = slugify(channel);
        if (!channelSlug) continue;

        addRoute({
          ...base,
          slug: joinSlug(group, eventSlug, channelSlug, dateSlug),
          group: slugify(group),
          channel: channelSlug,
        });
      }

      addRoute({
        ...base,
        slug: joinSlug(eventSlug, dateSlug),
      });
    }
  }

  return routes;
}

export function getRedirectBySlug(slug: string): RedirectRoute | undefined {
  return getRedirectRoutes().find((route) => route.slug === slug);
}
