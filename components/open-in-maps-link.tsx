import { Map } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Text-search Google Maps link (not lat,lon) so the opened map shows the place's info card, not a bare pin. */
export function OpenInMapsLink({ query }: { query: string }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "secondary" })}
    >
      <span>在 Google 地圖上開啟</span>
      <Map />
    </a>
  );
}
