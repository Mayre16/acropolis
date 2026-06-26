import { getMapPinsFromVenues, venueToCms } from "../lib/cms/venues-edit";
import { VENUE_LOCATIONS } from "../lib/locations";

const venues = VENUE_LOCATIONS;
const pins = getMapPinsFromVenues(venues);

const sdSede = pins.filter((p) => p.city === "Santo Domingo" && p.variant === "sede");
const sdCentro = pins.filter((p) => p.variant === "centro");
const roberto = venues.find((v) => v.id === "punto-cultural-roberto-pastoriza");

if (sdSede.length !== 1) {
  throw new Error(`Expected 1 SD sede pin (city default), got ${sdSede.length}`);
}
if (sdCentro.length !== 0) {
  throw new Error(
    `Roberto Pastoriza (SD, has sede, no coords) should not pin; got ${sdCentro.length}`,
  );
}

const oneExplicitSede = getMapPinsFromVenues([
  {
    ...venues.find((v) => v.id === "sede-naco")!,
    mapX: 560,
    mapY: 410,
  },
  venues.find((v) => v.id === "sede-los-prados")!,
  venues.find((v) => v.id === "punto-cultural-roberto-pastoriza")!,
  venues.find((v) => v.id === "sede-santiago")!,
]);
const sdPinsOne = oneExplicitSede.filter((p) => p.city === "Santo Domingo");
if (sdPinsOne.length !== 1 || sdPinsOne[0].variant !== "sede") {
  throw new Error(
    `One sede pin when only Naco has coords; got ${sdPinsOne.length}`,
  );
}
if (sdPinsOne[0].id !== "sede-naco") {
  throw new Error("Should show Naco with explicit map coords");
}

const bothSedesExplicit = getMapPinsFromVenues([
  {
    ...venues.find((v) => v.id === "sede-naco")!,
    mapX: 560,
    mapY: 410,
  },
  {
    ...venues.find((v) => v.id === "sede-los-prados")!,
    mapX: 548,
    mapY: 418,
  },
  venues.find((v) => v.id === "punto-cultural-roberto-pastoriza")!,
  venues.find((v) => v.id === "sede-santiago")!,
]);
const sdPinsBoth = bothSedesExplicit.filter(
  (p) => p.city === "Santo Domingo" && p.variant === "sede",
);
if (sdPinsBoth.length !== 2) {
  throw new Error(
    `Expected 2 SD sede pins when Naco and Los Prados have coords; got ${sdPinsBoth.length}`,
  );
}
if (!sdPinsBoth.some((p) => p.id === "sede-los-prados")) {
  throw new Error("Los Prados should appear with its own pin");
}
if (sdPinsBoth.some((p) => p.label !== "Santo Domingo")) {
  throw new Error("Sede pins should show city name, not sede name");
}

const withPin = getMapPinsFromVenues([
  ...venues.filter((v) => v.id !== "punto-cultural-roberto-pastoriza"),
  {
    ...roberto!,
    mapX: 580,
    mapY: 420,
  },
]);
if (!withPin.some((p) => p.id === "punto-cultural-roberto-pastoriza")) {
  throw new Error("Explicit coords should show cultural point in city with sede");
}

const soloCentro = getMapPinsFromVenues([
  venueToCms({
    id: "pc-test",
    name: "Centro León",
    kind: "centro-cultural",
    city: "Santiago",
    zone: "Centro",
    address: "Test",
    mapsQuery: "test",
  }),
]);
if (soloCentro.length !== 1 || soloCentro[0].variant !== "centro") {
  throw new Error("Centro in city without sede should auto-pin");
}

console.log("map pins OK:", pins.map((p) => `${p.city}:${p.variant}`).join(", "));
