import {
  venueDisplayName,
  venueKindLabel,
  type VenueKind,
} from "@/lib/locations";

export function VenueNameLockup({
  name,
  kind,
  size = "card",
}: {
  name: string;
  kind: VenueKind;
  size?: "card" | "teaser";
}) {
  const isSede = kind === "sede";
  const textSize =
    size === "card" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl";

  return (
    <h3 className={`mt-1.5 font-black leading-tight ${textSize}`}>
      <span className={isSede ? "text-na-amon" : "text-na-kefer"}>
        {venueKindLabel(kind)}
      </span>{" "}
      <span className="text-na-heketDark">{venueDisplayName(name, kind)}</span>
    </h3>
  );
}
