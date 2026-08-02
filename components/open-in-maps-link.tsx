import { Map } from "lucide-react";

/** Text-search Google Maps link (not lat,lon) so the opened map shows the place's info card, not a bare pin. */
export function OpenInMapsLink({ query }: { query: string }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-2 self-start rounded-full bg-accent px-4.5 py-2.5 text-sm font-bold text-accent-foreground transition hover:brightness-95 [&_svg]:size-4"
    >
      <span>在 Google 地圖上開啟</span>
      <Map />
    </a>
  );
}
