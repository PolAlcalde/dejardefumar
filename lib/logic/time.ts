export function todayInMadrid() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Madrid"
  });
}

export function dateLabel(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
    timeZone: "Europe/Madrid",
    day: "2-digit",
    month: "short"
  });
}
