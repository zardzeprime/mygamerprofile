export const NOCTIS_OPEN_EVENT = "impar:noctis:open-dialog";

export function requestNoctisOpen() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOCTIS_OPEN_EVENT));
}
