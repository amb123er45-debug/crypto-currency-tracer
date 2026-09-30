// DEMO ONLY: simulates tracing. Replace simulateTrace() with a call to a real blockchain analytics API.
const EXCHANGES = ["Exchange A", "Exchange B", "Exchange C", "Exchange D", "Exchange E"];
const HOP_TYPES = ["peel chain split", "consolidation wallet", "cross-chain bridge", "swap to stablecoin", "intermediate wallet"];
const SAMPLES = [
  "0x8f3a1c92b7d4e0a5c6b1d2e3f4a5b6c7d8e9f001",
  "0x1b2c3d4e5f60718293a4b5c6d7e8f9012a3b4c5d",
  "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
];

const $ = id => document.getElementById(id);
const valid = a => /^0x[a-fA-F0-9]{40}$/.test(a) || /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,60}$/.test(a) || /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a);

function hash(str) { // small deterministic hash so the same address gives the same demo result
  let h = 2166136261;
  for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const short = a => a.slice(0, 8) + "..." + a.slice(-6);

function simulateTrace(addr) {
  let h = hash(addr);
  const next = () => (h = Math.imul(h, 1103515245) + 12345 >>> 0);
  const hops = [];
  const count = 2 + next() % 3;
  for (let i = 0; i < count; i++) {
    hops.push({ type: HOP_TYPES[next() % HOP_TYPES.length], pct: 55 + next() % 45 });
  }
  return { addr, hops, exchange: EXCHANGES[next() % EXCHANGES.length], confidence: 60 + next() % 39 };
}

function render(traces) {
  const tally = {};
  traces.forEach(t => {
    tally[t.exchange] = tally[t.exchange] || { n: 0, conf: 0 };
    tally[t.exchange].n++; tally[t.exchange].conf += t.confidence;
  });
  const rows = Object.entries(tally).sort((a, b) => b[1].n - a[1].n);
  const max = rows[0][1].n;
  $("ranking").innerHTML = rows.map(([name, v]) => `
    <div class="rank"><span>${name}</span>
    <div class="bar" title="${v.n} of ${traces.length} traces"><i style="width:${v.n / max * 100}%"></i></div>
    <span>${v.n}/${traces.length}</span></div>`).join("");
  $("paths").innerHTML = traces.map(t => `
    <div class="path"><h3>${t.addr}</h3><ul class="hops">
      ${t.hops.map(h => `<li>${h.type}, about ${h.pct}% of funds carried forward</li>`).join("")}
      <li class="end">Deposited at <span>${t.exchange}</span>, ${t.confidence}% attribution confidence</li>
    </ul></div>`).join("");
  $("results").hidden = false;
}

$("sample").addEventListener("click", () => { $("addrs").value = SAMPLES.join("\n"); });
$("run").addEventListener("click", () => {
  const list = [...new Set($("addrs").value.split(/\s+/).filter(Boolean))];
  const bad = list.filter(a => !valid(a));
  const err = $("error");
  if (!list.length) { err.textContent = "Enter at least one wallet address."; err.hidden = false; return; }
  if (bad.length) { err.textContent = `Not a valid address: ${short(bad[0])}. Use Ethereum (0x...), Bitcoin or Tron formats.`; err.hidden = false; return; }
  err.hidden = true;
  render(list.map(simulateTrace));
});
