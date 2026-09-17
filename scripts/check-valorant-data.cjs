const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (name) => {
    const target = name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : path.resolve(path.dirname(file), name);
    return load(`${target}.ts`);
  };
  new Function("require", "module", "exports", code)(localRequire, module, module.exports);
  return module.exports;
}
const { mergeSettings } = load(path.join(root, "src/data/valorant/mergeSettings.ts"));
const record = (date, settings, url) => ({ source: { verifiedAt: date, url, label: "Test" }, settings });
const merged = mergeSettings(
  { player: record("2026-09-17", { dpi: 1600, sensitivity: 0.1, keyboard: "Verified keyboard" }, "https://example.com/list") },
  { player: record("2026-09-17", { crosshairCode: "0;P;h;0", keyboard: undefined }, "https://example.com/player") },
  { player: record("2026-09-16", { dpi: 800, sensitivity: 0.2 }, "https://example.com/old") },
).player;
assert.equal(merged.settings.keyboard, "Verified keyboard", "Sparse records must preserve gear");
assert.equal(merged.settings.dpi, 1600, "Older observations must not replace newer values");
assert.equal(merged.settings.edpi, 160);
assert.equal(merged.settings.crosshairCode, "0;P;h;0");
assert.equal(merged.sources.length, 2, "Preserve the sources contributing retained fields");
const { ESPORTS_PLAYERS: players } = load(path.join(root, "src/data/esportsCompendium.ts"));
const cryocells = players.find((player) => player.id === "100t-cryocells");
assert.ok(cryocells.settings.keyboard, "Cryocells' hand-verified record must not erase list gear");
assert.ok(cryocells.settings.crosshairCode);
assert.equal(players.find((player) => player.id === "lev-spike")?.role, "Duelista");
for (const player of players) {
  const settings = player.settings;
  if (settings?.dpi !== undefined && settings.sensitivity !== undefined) {
    assert.ok(Math.abs(settings.edpi - settings.dpi * settings.sensitivity) < 0.001, player.id);
  }
  if (player.observation?.agents.length) assert.ok(player.role, `Unmapped agent class: ${player.id}`);
  assert.ok(player.sources.every((source) => source.url.startsWith("https://")));
}
assert.ok(players.filter((player) => player.settings).length >= 230, "Settings coverage unexpectedly dropped");
assert.ok(players.filter((player) => player.role).length >= 310, "Role coverage unexpectedly dropped");
for (const id of ["sharper-laz", "ns-ivy", "varrel-klaus"]) {
  assert.equal(players.find((player) => player.id === id)?.settings, undefined, `Do not reuse another person's settings: ${id}`);
}
console.log(JSON.stringify({ players: players.length, settings: players.filter((p) => p.settings).length, roles: players.filter((p) => p.role).length, crosshairs: players.filter((p) => p.settings?.crosshairCode).length }));
