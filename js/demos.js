/* Interactive demos. Each one renders into a container and runs only on the
   fictional data from data.js. */
(function () {
  "use strict";
  const D = window.DATA;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n) => Number(n).toLocaleString("en-GB");
  const crest = (code, size) => {
    const c = D.CLUB[code];
    const st = size ? ` style="background:${c.color};width:${size}px;height:${size}px;font-size:${Math.round(size / 3)}px"` : ` style="background:${c.color}"`;
    return `<span class="crest" aria-hidden="true"${st}>${code}</span>`;
  };
  const team = (code, full) => `<span class="team">${crest(code)}${esc(full ? D.CLUB[code].name : code)}</span>`;
  const refName = Object.fromEntries(D.REFEREES.map((r) => [r.id, r.name]));
  const ordinal = (n) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");
  const winner = (g) => { const [h, a] = g.score.split("-").map(Number); return h > a ? g.home : g.away; };

  function bars(rows, opts = {}) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return `<div class="bars">${rows.map((r, i) => `
      <div class="bar-row"><span class="lbl" title="${esc(r.label)}">${r.labelHtml || esc(r.label)}</span>
        <span class="track"><span class="fill${(opts.hotFirst && i === 0) ? " hot" : ""}" style="width:${(100 * r.value / max).toFixed(1)}%"></span></span>
        <span class="v">${opts.fmt ? opts.fmt(r.value) : fmt(r.value)}</span></div>`).join("")}</div>`;
  }

  async function copyText(text, btn) {
    const old = btn.textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
    catch (e) { btn.textContent = "Copy not allowed here"; }
    setTimeout(() => (btn.textContent = old), 1600);
  }

  // =====================================================================
  // 01 Referee Explorer
  // =====================================================================
  function refereeExplorer(root) {
    const seasons = [...new Set(D.HIST_GAMES.map((g) => g.season))].reverse();
    const st = { season: "all", phase: "all", ref: "all", teams: new Set(), h2h: false, page: 0 };
    const PER = 12;
    root.innerHTML = `
      <div class="controls">
        <label class="field" for="re-season">Season<select id="re-season"><option value="all">All seasons</option>${seasons.map((s) => `<option>${s}</option>`).join("")}</select></label>
        <label class="field" for="re-phase">Phase<select id="re-phase"><option value="all">All phases</option><option>Regular Season</option><option>Playoffs</option><option>Final Four</option></select></label>
        <label class="field" for="re-ref">Referee<select id="re-ref"><option value="all">All referees</option>${D.REFEREES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((r) => `<option value="${r.id}">${esc(r.name)} (${r.country})</option>`).join("")}</select></label>
        <button class="btn ghost" id="re-reset" type="button">Reset filters</button>
        <button class="btn ghost" id="re-copy" type="button">Copy as CSV</button>
      </div>
      <div class="field" style="margin-bottom:8px">Teams</div>
      <div class="stack" id="re-teams" style="margin-bottom:10px">${D.CLUBS.map((c) => `<button type="button" class="chip" data-team="${c.code}" aria-pressed="false" title="${esc(c.name)}">${crest(c.code, 18)}${c.code}</button>`).join("")}</div>
      <label class="check disabled" id="re-h2h-wrap" style="margin-bottom:16px"><input type="checkbox" id="re-h2h" disabled> Only games between the selected teams</label>
      <div class="tiles" id="re-tiles"></div>
      <div class="split stacked">
        <div><div class="tablewrap"><table class="t"><thead><tr><th>Season</th><th>Date</th><th>Phase</th><th>Rd</th><th>Home</th><th>Score</th><th>Away</th><th>Referee 1</th><th>Referee 2</th><th>Referee 3</th></tr></thead><tbody id="re-body"></tbody></table></div>
          <div class="pager"><span id="re-count"></span><span><button class="btn ghost" id="re-prev" type="button">Previous</button> <button class="btn ghost" id="re-next" type="button">Next</button></span></div></div>
        <div class="panel"><h4 id="re-top-h">Most assigned referees</h4><div id="re-top"></div><p class="note">Counts every slot (1, 2 or 3) in the filtered games.</p></div>
      </div>`;
    const $ = (id) => root.querySelector("#" + id);

    function filtered() {
      let g = D.HIST_GAMES;
      if (st.season !== "all") g = g.filter((x) => x.season === st.season);
      if (st.phase !== "all") g = g.filter((x) => x.phase === st.phase);
      if (st.ref !== "all") g = g.filter((x) => x.refs.includes(st.ref));
      if (st.teams.size) {
        g = st.h2h && st.teams.size >= 2
          ? g.filter((x) => st.teams.has(x.home) && st.teams.has(x.away))
          : g.filter((x) => st.teams.has(x.home) || st.teams.has(x.away));
      }
      return g.slice().sort((a, b) => b.date.localeCompare(a.date));
    }
    function render() {
      const rows = filtered();
      const counts = {};
      rows.forEach((g) => g.refs.forEach((r) => (counts[r] = (counts[r] || 0) + 1)));
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      $("re-tiles").innerHTML = `
        <div class="tile"><b class="num">${fmt(rows.length)}</b><span>games</span></div>
        <div class="tile"><b class="num">${fmt(rows.length * 3)}</b><span>referee assignments</span></div>
        <div class="tile"><b class="num">${top.length}</b><span>different referees</span></div>
        <div class="tile"><b style="font-size:22px;line-height:1.35">${top[0] ? esc(refName[top[0][0]]) : "–"}</b><span>most assigned${top[0] ? ` · ${top[0][1]} games` : ""}</span></div>`;
      const pages = Math.max(1, Math.ceil(rows.length / PER));
      st.page = Math.min(st.page, pages - 1);
      const slice = rows.slice(st.page * PER, st.page * PER + PER);
      $("re-body").innerHTML = slice.length ? slice.map((g) => `<tr><td>${g.season}</td><td>${g.date}</td><td>${g.phase}</td><td>${g.round}</td><td>${team(g.home)}</td><td>${g.score}</td><td>${team(g.away)}</td>${g.refs.map((r) => `<td${r === st.ref ? ' style="font-weight:700;color:var(--accent)"' : ""}>${esc(refName[r])}</td>`).join("")}</tr>`).join("")
        : `<tr><td colspan="10" style="padding:28px;text-align:center;color:var(--muted)">No games match these filters. Remove a team or pick another season.</td></tr>`;
      $("re-count").textContent = rows.length ? `Showing ${st.page * PER + 1}–${st.page * PER + slice.length} of ${fmt(rows.length)} · page ${st.page + 1} of ${pages}` : "0 games";
      $("re-prev").disabled = st.page === 0; $("re-next").disabled = st.page >= pages - 1;
      $("re-top").innerHTML = top.length ? bars(top.slice(0, 8).map(([id, v]) => ({ label: refName[id], value: v })), { hotFirst: true }) : `<p class="note">No assignments.</p>`;
      const can = st.teams.size >= 2;
      $("re-h2h").disabled = !can; $("re-h2h-wrap").classList.toggle("disabled", !can);
      if (!can) { $("re-h2h").checked = false; st.h2h = false; }
    }
    $("re-season").onchange = (e) => { st.season = e.target.value; st.page = 0; render(); };
    $("re-phase").onchange = (e) => { st.phase = e.target.value; st.page = 0; render(); };
    $("re-ref").onchange = (e) => { st.ref = e.target.value; st.page = 0; render(); };
    $("re-h2h").onchange = (e) => { st.h2h = e.target.checked; st.page = 0; render(); };
    $("re-teams").onclick = (e) => {
      const b = e.target.closest("[data-team]"); if (!b) return;
      const t = b.dataset.team;
      st.teams.has(t) ? st.teams.delete(t) : st.teams.add(t);
      b.classList.toggle("on", st.teams.has(t)); b.setAttribute("aria-pressed", st.teams.has(t));
      st.page = 0; render();
    };
    $("re-prev").onclick = () => { st.page--; render(); };
    $("re-next").onclick = () => { st.page++; render(); };
    $("re-reset").onclick = () => {
      Object.assign(st, { season: "all", phase: "all", ref: "all", h2h: false, page: 0 }); st.teams.clear();
      ["re-season", "re-phase", "re-ref"].forEach((id) => ($(id).value = "all"));
      root.querySelectorAll("[data-team]").forEach((b) => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
      render();
    };
    $("re-copy").onclick = (e) => {
      const rows = filtered();
      const csv = ["season,date,phase,round,home,away,score,referee_1,referee_2,referee_3"].concat(rows.map((g) => [g.season, g.date, g.phase, g.round, D.CLUB[g.home].name, D.CLUB[g.away].name, g.score, ...g.refs.map((r) => refName[r])].join(","))).join("\n");
      copyText(csv, e.target);
    };
    // open on an interesting state: two rivals, head-to-head
    ["ALT", "KOR"].forEach((t) => { st.teams.add(t); const b = root.querySelector(`[data-team="${t}"]`); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); });
    render(); st.h2h = true; $("re-h2h").checked = true; render();
  }

  // =====================================================================
  // 02 Game Kit
  // =====================================================================
  function gameKit(root) {
    const played = D.CUR_GAMES.filter((g) => g.played);
    const curLogs = {};
    D.PLAYERS.forEach((p) => (curLogs[p.id] = D.gameLogs(p).filter((l) => l.season === D.CURRENT.season)));
    const avg = (p, k) => curLogs[p.id].reduce((s, l) => s + l[k], 0) / curLogs[p.id].length;
    const leaders = {};
    ["pts", "reb", "ast"].forEach((k) => (leaders[k] = D.PLAYERS.slice().sort((a, b) => avg(b, k) - avg(a, k)).map((p) => p.id)));
    const label = { pts: "points", reb: "rebounds", ast: "assists" };

    function record(code, venue) {
      let w = 0, l = 0;
      played.forEach((g) => {
        if (venue === "home" && g.home !== code) return;
        if (venue === "away" && g.away !== code) return;
        if (g.home !== code && g.away !== code) return;
        winner(g) === code ? w++ : l++;
      });
      return [w, l];
    }
    function streak(code) {
      const games = played.filter((g) => g.home === code || g.away === code).sort((a, b) => b.round - a.round);
      const first = winner(games[0]) === code; let n = 0;
      for (const g of games) { if ((winner(g) === code) === first) n++; else break; }
      return [first, n];
    }
    function phrases(g) {
      const r = D.rngFrom(parseInt(g.id.slice(1), 10) * 3 + 11);
      const H = D.CLUB[g.home].name, A = D.CLUB[g.away].name, out = [];
      const [hw, hl] = record(g.home, "home"), [aw, al] = record(g.away, "away");
      out.push(["Club record", `${H} are ${hw}-${hl} at home this season; ${A} are ${aw}-${al} on the road.`]);
      const sc = streak(g.home)[1] >= streak(g.away)[1] ? g.home : g.away; const [sw, sn] = streak(sc);
      out.push(["Streak", sn > 1 ? `${D.CLUB[sc].name} have ${sw ? "won" : "lost"} their last ${sn} games.` : `${D.CLUB[sc].name} ${sw ? "won" : "lost"} their last game.`]);
      const roster = D.PLAYERS.filter((p) => p.club === g.home || p.club === g.away);
      const ms = roster.map((p) => { const cp = D.careerPoints(p); const thr = Math.ceil((cp + 1) / 500) * 500; return { p, cp, thr, need: thr - cp }; }).sort((a, b) => a.need - b.need)[0];
      out.push(["Milestone", `${ms.p.name} (${ms.p.club}) needs ${ms.need} point${ms.need > 1 ? "s" : ""} to reach ${fmt(ms.thr)} career points in the league.`]);
      const k = r.pick(["pts", "reb", "ast"]);
      const best = roster.map((p) => ({ p, rank: leaders[k].indexOf(p.id) + 1 })).sort((a, b) => a.rank - b.rank)[0];
      out.push(["Top 10", `${best.p.name} ranks ${ordinal(best.rank)} in the league in ${label[k]} (${avg(best.p, k).toFixed(1)} per game).`]);
      const h2h = D.HIST_GAMES.filter((x) => (x.home === g.home && x.away === g.away) || (x.home === g.away && x.away === g.home));
      const hW = h2h.filter((x) => winner(x) === g.home).length;
      const aW = h2h.length - hW;
      out.push(["Head-to-head", hW === aW ? `The all-time series between ${H} and ${A} is level at ${hW}-${aW}.` : hW > aW ? `${H} lead the all-time series against ${A} ${hW}-${aW}.` : `${A} lead the all-time series against ${H} ${aW}-${hW}.`]);
      const scorer = roster.slice().sort((a, b) => avg(b, "pts") - avg(a, "pts"))[r.int(0, 2)];
      const hi = curLogs[scorer.id].reduce((m, l) => (l.pts > m.pts ? l : m), curLogs[scorer.id][0]);
      out.push(["Season high", `${scorer.name}’s season high is ${hi.pts} points, in round ${hi.game}.`]);
      return out;
    }

    const rounds = [D.CURRENT.nextRound, D.CURRENT.nextRound + 1, D.CURRENT.nextRound + 2];
    const st = { round: rounds[0], edits: {} };
    root.innerHTML = `
      <div class="controls">
        <label class="field" for="gk-round">Round<select id="gk-round">${rounds.map((r) => `<option value="${r}">Round ${r}</option>`).join("")}</select></label>
        <button class="btn" id="gk-present" type="button">Present</button>
        <span class="note" id="gk-meta" style="margin:0"></span>
      </div>
      <div class="gk-games" id="gk-games"></div>`;
    const $ = (id) => root.querySelector("#" + id);
    let current = [];
    function render() {
      const games = D.CUR_GAMES.filter((g) => g.round === st.round);
      current = games.map((g) => ({ g, ph: phrases(g) }));
      const edited = Object.keys(st.edits).filter((k) => k.startsWith(st.round + ":")).length;
      $("gk-meta").textContent = `${games.length} games · ${games.length * 6} phrases · first game ${games[0].date}${edited ? ` · ${edited} edited` : ""}`;
      $("gk-games").innerHTML = current.map(({ g, ph }) => `
        <article class="gk-card"><header><span>${team(g.home, true)}</span><span style="color:var(--muted);font-weight:400">vs</span><span>${team(g.away, true)}</span></header>
        <ul>${ph.map(([cat, text], i) => { const key = `${st.round}:${g.id}:${i}`; const e = st.edits[key]; return `<li class="${e != null ? "edited" : ""}"><span class="cat">${cat}</span><span contenteditable="true" spellcheck="false" data-key="${key}" aria-label="${cat} phrase, editable">${esc(e ?? text)}</span></li>`; }).join("")}</ul></article>`).join("");
    }
    $("gk-round").onchange = (e) => { st.round = +e.target.value; render(); };
    $("gk-games").addEventListener("input", (e) => {
      const key = e.target.dataset.key; if (!key) return;
      st.edits[key] = e.target.textContent; e.target.closest("li").classList.add("edited");
    });
    $("gk-present").onclick = () => {
      let i = 0;
      const ov = document.createElement("div"); ov.className = "present"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
      const show = () => {
        const { g, ph } = current[i];
        ov.innerHTML = `<div class="ph"><span>${D.LEAGUE.name} · Game Kit · Round ${st.round}</span><span>${i + 1} / ${current.length}</span></div>
          <h2>${esc(D.CLUB[g.home].name)} <span>vs</span> ${esc(D.CLUB[g.away].name)}</h2>
          <ol>${ph.map(([c, t], k) => `<li>${esc(st.edits[`${st.round}:${g.id}:${k}`] ?? t)}</li>`).join("")}</ol>
          <div class="pf"><button class="btn ghost" data-a="prev" type="button">Previous</button><button class="btn" data-a="next" type="button">Next game</button><button class="btn ghost" data-a="close" type="button" style="margin-left:auto">Close (Esc)</button></div>`;
        ov.querySelector('[data-a="next"]').focus();
      };
      const close = () => { ov.remove(); document.removeEventListener("keydown", key); $("gk-present").focus(); };
      const key = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") { i = (i + 1) % current.length; show(); } if (e.key === "ArrowLeft") { i = (i - 1 + current.length) % current.length; show(); } };
      ov.onclick = (e) => { const a = e.target.dataset.a; if (a === "close") close(); if (a === "next") { i = (i + 1) % current.length; show(); } if (a === "prev") { i = (i - 1 + current.length) % current.length; show(); } };
      document.addEventListener("keydown", key); document.body.appendChild(ov); show();
    };
    render();
  }

  // =====================================================================
  // 03 Security Report
  // =====================================================================
  function securityReport(root) {
    const R = D.SECURITY_REPORTS;
    const byKey = Object.fromEntries(R.map((r) => [r.home + ":" + r.round, r]));
    const rounds = Array.from({ length: 17 }, (_, i) => i + 1);
    const homeGame = Object.fromEntries(D.CUR_GAMES.map((g) => [g.home + ":" + g.round, g]));
    const incidentRate = (code) => { const rs = R.filter((r) => r.home === code && r.submitted); return rs.length ? rs.filter((r) => r.incidents.length).length / rs.length : 0; };
    const st = { team: D.CLUBS.slice().sort((a, b) => incidentRate(b.code) - incidentRate(a.code))[0].code, cell: null };
    const sub = R.filter((r) => r.submitted);
    root.innerHTML = `
      <div class="tiles">
        <div class="tile"><b class="num">${sub.length}<span style="font-size:18px;color:var(--muted)"> / ${R.length}</span></b><span>reports submitted, rounds 1–${D.CURRENT.playedRounds}</span></div>
        <div class="tile"><b class="num" style="color:var(--bad)">${R.filter((r) => r.status === "overdue").length}</b><span>overdue (reminder sent)</span></div>
        <div class="tile"><b class="num" style="color:var(--warn)">${R.filter((r) => r.status === "pending").length}</b><span>pending, last round</span></div>
        <div class="tile"><b class="num">${Math.round(100 * sub.filter((r) => r.incidents.length).length / sub.length)}%</b><span>games with an incident</span></div>
      </div>
      <div class="split">
        <div>
          <div class="tablewrap" style="border:0"><table class="grid-sec" id="sr-grid"><thead><tr><th class="rowh">Home club</th>${rounds.map((r) => `<th>R${r}</th>`).join("")}</tr></thead><tbody></tbody></table></div>
          <div class="legend"><span><i style="background:var(--ok)"></i>Submitted</span><span><i style="background:var(--warn)"></i>Pending</span><span><i style="background:var(--bad)"></i>Overdue</span><span><i style="background:var(--idle-bg);border:1px solid var(--line)"></i>Away game</span><span><i style="border:1px dashed var(--line)"></i>Not played yet</span></div>
        </div>
        <div class="panel" id="sr-side"></div>
      </div>
      <div class="panel" style="margin-top:16px"><h4>Share of home games with an incident, by club</h4><div id="sr-rates"></div></div>`;
    const $ = (id) => root.querySelector("#" + id);
    function render() {
      $("sr-grid").querySelector("tbody").innerHTML = D.CLUBS.map((c) => `<tr class="${c.code === st.team ? "selrow" : ""}"><th class="rowh"><button type="button" class="chip${c.code === st.team ? " on" : ""}" data-team="${c.code}" style="padding:4px 8px">${c.code}</button></th>${rounds.map((r) => {
        const g = homeGame[c.code + ":" + r];
        if (!g) return `<td class="away" title="Away game"></td>`;
        if (!g.played) return `<td class="future" title="Round ${r}, not played yet"></td>`;
        const rep = byKey[c.code + ":" + r];
        return `<td class="${rep.status}${st.cell === g.id ? " sel" : ""}" data-game="${g.id}" tabindex="0" title="R${r} vs ${g.away}: ${rep.status}">${rep.incidents.length ? '<span style="color:#fff;font-weight:700">!</span>' : ""}</td>`;
      }).join("")}</tr>`).join("");
      side();
      $("sr-rates").innerHTML = bars(D.CLUBS.map((c) => ({ label: c.name, labelHtml: team(c.code, true), value: Math.round(100 * incidentRate(c.code)) })).sort((a, b) => b.value - a.value).slice(0, 8), { hotFirst: true, fmt: (v) => v + "%" });
    }
    function side() {
      if (st.cell) {
        const r = R.find((x) => x.game === st.cell);
        $("sr-side").innerHTML = `<h4>Report · round ${r.round}</h4>
          <p style="margin:0 0 10px">${team(r.home, true)} <span style="color:var(--muted)">vs</span> ${team(r.away)}</p>
          ${r.submitted ? `<dl class="kv">
            <dt>Spectators</dt><dd class="num">${fmt(r.spectators)}</dd><dt>Ushers</dt><dd class="num">${r.ushers}</dd><dt>Stewards</dt><dd class="num">${r.stewards}</dd>
            <dt>Paramedics</dt><dd class="num">${r.paramedics} · ${r.ambulances} ambulance${r.ambulances > 1 ? "s" : ""}</dd><dt>Security meeting</dt><dd>${r.meeting}</dd>
            <dt>Risk level</dt><dd><span class="pill ${r.risk === "High" ? "bad" : r.risk === "Medium" ? "warn" : "ok"}">${r.risk}</span></dd>
            <dt>Incidents</dt><dd>${r.incidents.length ? r.incidents.map((i) => `<span class="pill bad" style="margin:0 4px 4px 0">${i}</span>`).join("") : "None reported"}</dd></dl>`
          : `<p><span class="pill ${r.status === "overdue" ? "bad" : "warn"}">${r.status}</span></p><p class="note">No report yet. ${r.status === "overdue" ? "An automatic reminder went to the club’s security manager." : "The link was emailed after the game."}</p>`}
          <p class="note"><button class="btn ghost" type="button" id="sr-back">Back to team stats</button></p>`;
        $("sr-back").onclick = () => { st.cell = null; render(); };
        return;
      }
      const rs = R.filter((r) => r.home === st.team && r.submitted);
      const mean = (k) => rs.length ? Math.round(rs.reduce((s, r) => s + r[k], 0) / rs.length) : 0;
      const types = {}; rs.forEach((r) => r.incidents.forEach((i) => (types[i] = (types[i] || 0) + 1)));
      $("sr-side").innerHTML = `<h4>Team stats · home games</h4>
        <p style="margin:0 0 12px;font-weight:600">${team(st.team, true)}</p>
        <div class="tiles" style="grid-template-columns:1fr 1fr">
          <div class="tile"><b class="num">${fmt(mean("spectators"))}</b><span>avg spectators</span></div>
          <div class="tile"><b class="num">${mean("ushers")}</b><span>avg ushers</span></div>
          <div class="tile"><b class="num">${mean("stewards")}</b><span>avg stewards</span></div>
          <div class="tile"><b class="num">${mean("paramedics")}</b><span>avg paramedics</span></div>
        </div>
        <h4>Incidents reported</h4>
        ${Object.keys(types).length ? bars(Object.entries(types).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: v }))) : `<p class="note">No incidents in ${rs.length} reports.</p>`}
        <p class="note">Click a coloured cell to open one report.</p>`;
    }
    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-team]"); if (t) { st.team = t.dataset.team; st.cell = null; render(); return; }
      const c = e.target.closest("td[data-game]"); if (c) { st.cell = c.dataset.game; st.team = R.find((x) => x.game === st.cell).home; render(); }
    });
    root.addEventListener("keydown", (e) => { const c = e.target.closest("td[data-game]"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); c.click(); } });
    render();
  }

  // =====================================================================
  // 04 Delegates
  // =====================================================================
  function delegates(root) {
    const reps = D.DELEGATE_REPORTS.slice().sort((a, b) => b.round - a.round || a.game.localeCompare(b.game));
    const st = { dept: "Competition", sel: reps.find((r) => r.flags.length)?.game || reps[0].game };
    const FIELDS = {
      Competition: [["Tip-off", (r) => r.competition.tipOff], ["Court condition", (r) => r.competition.courtCondition], ["Officials", (r) => r.competition.officials], ["Attendance", (r) => r.competition.attendance ? fmt(r.competition.attendance) : "Not reported"]],
      Marketing: [["LED boards", (r) => r.marketing.ledBoards], ["Floor branding", (r) => r.marketing.floorBranding], ["Halftime show", (r) => r.marketing.halftime], ["Mascot", (r) => r.marketing.mascot]],
      Media: [["Press seats used", (r) => r.media.pressSeats], ["Mixed zone", (r) => r.media.mixedZone], ["Photographers", (r) => r.media.photographers], ["Broadcast", (r) => r.media.broadcast]],
    };
    root.innerHTML = `<div class="tabs" role="tablist" id="dl-tabs">${["Competition", "Marketing", "Media", "Emails"].map((t) => `<button type="button" role="tab" data-tab="${t}">${t}</button>`).join("")}</div><div id="dl-body"></div>`;
    const $ = (id) => root.querySelector("#" + id);
    const gameLine = (r) => `${team(r.home)} <span class="num" style="margin:0 6px">${r.score}</span> ${team(r.away)}`;
    function nightEmail() {
      const last = reps.filter((r) => r.round === D.CURRENT.playedRounds);
      const lines = last.map((r) => {
        const f = r.flags.filter((x) => x.dept === "Media");
        return `${D.CLUB[r.home].name} ${r.score} ${D.CLUB[r.away].name}\n  Delegate: ${r.delegate} · Press seats: ${r.media.pressSeats} · Mixed zone: ${r.media.mixedZone}${f.length ? "\n  ⚑ " + f.map((x) => x.text).join("\n  ⚑ ") : ""}`;
      });
      return `To: media-team@example.org\nSubject: Night report · Round ${D.CURRENT.playedRounds} · ${last.length} games\n\nGood morning,\n\nHere is the media summary from last night's delegate reports.\n\n${lines.join("\n\n")}\n\nFull reports: delegates app → Media view.`;
    }
    function weeklyEmail() {
      const rs = reps.filter((r) => r.round === D.CURRENT.playedRounds && r.flags.length);
      const by = {}; rs.forEach((r) => r.flags.forEach((f) => (by[f.dept] = by[f.dept] || []).push(`${r.home}–${r.away}: ${f.text}`)));
      return `To: competition@example.org, marketing@example.org, media-team@example.org\nSubject: Round ${D.CURRENT.playedRounds} incidents · ${Object.values(by).flat().length} flagged\n\n${Object.entries(by).map(([d, l]) => `${d.toUpperCase()}\n${l.map((x) => "  • " + x).join("\n")}`).join("\n\n") || "No incidents this round."}\n\nSent every Tuesday at 09:00.`;
    }
    function render() {
      root.querySelectorAll("[data-tab]").forEach((b) => { b.classList.toggle("on", b.dataset.tab === st.dept); b.setAttribute("aria-selected", b.dataset.tab === st.dept); });
      if (st.dept === "Emails") {
        $("dl-body").innerHTML = `<div class="split" style="grid-template-columns:1fr 1fr"><div><h4 class="field" style="margin:0 0 8px">Night report · Media</h4><pre class="email">${esc(nightEmail())}</pre></div><div><h4 class="field" style="margin:0 0 8px">Tuesday incident summary · all departments</h4><pre class="email">${esc(weeklyEmail())}</pre></div></div><p class="note">Both emails are built from the same flagged answers you see in the department views.</p>`;
        return;
      }
      const r = reps.find((x) => x.game === st.sel);
      const flags = r.flags.filter((f) => f.dept === st.dept);
      $("dl-body").innerHTML = `<div class="split">
        <div class="dl-list" id="dl-list">${reps.map((x) => { const n = x.flags.filter((f) => f.dept === st.dept).length; return `<button type="button" class="dl-item${x.game === st.sel ? " on" : ""}" data-game="${x.game}"><span class="row"><span>${gameLine(x)}</span>${n ? `<span class="pill bad">${n} flag${n > 1 ? "s" : ""}</span>` : `<span class="pill ok">OK</span>`}</span><span class="row" style="font-size:12.5px;color:var(--muted)"><span>Round ${x.round} · ${x.date}</span><span>${esc(x.delegate)}</span></span></button>`; }).join("")}</div>
        <div class="panel"><h4>${st.dept} view · round ${r.round}</h4><p style="margin:0 0 12px">${gameLine(r)}</p>
          <dl class="kv">${FIELDS[st.dept].map(([k, f]) => `<dt>${k}</dt><dd>${esc(f(r))}</dd>`).join("")}<dt>Delegate</dt><dd>${esc(r.delegate)}</dd></dl>
          <h4 style="margin-top:16px">Flagged for ${st.dept}</h4>${flags.length ? flags.map((f) => `<p style="margin:0 0 6px"><span class="pill bad">Flag</span> ${esc(f.text)}</p>`).join("") : `<p class="note" style="margin:0">Nothing flagged for this department.</p>`}
          ${r.flags.length > flags.length ? `<p class="note">${r.flags.length - flags.length} more flag${r.flags.length - flags.length > 1 ? "s" : ""} in other departments.</p>` : ""}</div></div>`;
    }
    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-tab]"); if (t) { st.dept = t.dataset.tab; render(); return; }
      const g = e.target.closest("[data-game]"); if (g) { st.sel = g.dataset.game; const sc = $("dl-list").scrollTop; render(); $("dl-list").scrollTop = sc; }
    });
    render();
  }

  // =====================================================================
  // 05 Injury Board
  // =====================================================================
  function injuryBoard(root) {
    const st = { club: "DUN", status: "all" };
    const counts = (list) => list.reduce((a, p) => (a[D.AVAILABILITY[p.id]]++, a), { Available: 0, "In doubt": 0, Out: 0 });
    root.innerHTML = `
      <div class="controls">
        <label class="field" for="ib-club">Club<select id="ib-club"><option value="all">All clubs</option>${D.CLUBS.map((c) => `<option value="${c.code}">${esc(c.name)}</option>`).join("")}</select></label>
        <div class="field">Status<div class="stack" id="ib-status">${["all", "Available", "In doubt", "Out"].map((s) => `<button type="button" class="chip" data-s="${s}">${s === "all" ? "All" : s}</button>`).join("")}</div></div>
      </div>
      <div class="tiles" id="ib-tiles"></div>
      <div class="split"><div class="roster-grid" id="ib-grid"></div>
        <div class="panel"><h4>What the browser receives</h4><pre class="code" id="ib-json" style="margin:0;font-size:12px"></pre><p class="note">The server decides the status and sends only name, number, position and status. Diagnosis, body area and dates never leave it.</p></div></div>`;
    const $ = (id) => root.querySelector("#" + id);
    function render() {
      $("ib-club").value = st.club;
      root.querySelectorAll("[data-s]").forEach((b) => b.classList.toggle("on", b.dataset.s === st.status));
      const pool = D.PLAYERS.filter((p) => st.club === "all" || p.club === st.club);
      const c = counts(pool);
      const next = st.club === "all" ? null : D.CUR_GAMES.find((g) => g.round === D.CURRENT.nextRound && (g.home === st.club || g.away === st.club));
      $("ib-tiles").innerHTML = `
        <div class="tile"><b class="num" style="color:var(--ok)">${c.Available}</b><span>available</span></div>
        <div class="tile"><b class="num" style="color:var(--warn)">${c["In doubt"]}</b><span>in doubt</span></div>
        <div class="tile"><b class="num" style="color:var(--bad)">${c.Out}</b><span>out</span></div>
        <div class="tile"><b style="font-size:18px;line-height:1.5">${next ? `${next.home === st.club ? "vs" : "at"} ${esc(D.CLUB[next.home === st.club ? next.away : next.home].name)}` : `${D.CLUBS.length} clubs`}</b><span>${next ? `next game · ${next.date}` : "league overview"}</span></div>`;
      const list = pool.filter((p) => st.status === "all" || D.AVAILABILITY[p.id] === st.status)
        .sort((a, b) => ["Out", "In doubt", "Available"].indexOf(D.AVAILABILITY[a.id]) - ["Out", "In doubt", "Available"].indexOf(D.AVAILABILITY[b.id]) || a.number - b.number);
      $("ib-grid").innerHTML = list.length ? list.slice(0, 60).map((p) => { const s = D.AVAILABILITY[p.id]; return `<div class="pcard ${s.replace(" ", "-")}"><span class="no">${p.number}</span><span class="nm">${esc(p.name)}</span><span class="meta"><span>${st.club === "all" ? p.club + " · " : ""}${p.pos} · ${p.height} cm</span><span class="pill ${s === "Available" ? "ok" : s === "Out" ? "bad" : "warn"}">${s}</span></span></div>`; }).join("") + (list.length > 60 ? `<p class="note">Showing 60 of ${list.length}. Pick a club to see its full roster.</p>` : "")
        : `<p class="note">No players with this status.</p>`;
      const sample = list.slice(0, 2).map((p) => ({ name: p.name, number: p.number, pos: p.pos, status: D.AVAILABILITY[p.id] }));
      $("ib-json").textContent = JSON.stringify(sample, null, 2);
    }
    $("ib-club").onchange = (e) => { st.club = e.target.value; render(); };
    $("ib-status").onclick = (e) => { const b = e.target.closest("[data-s]"); if (b) { st.status = b.dataset.s; render(); } };
    render();
  }

  // =====================================================================
  // 06 Coaching Insights
  // =====================================================================
  function coachingInsights(root) {
    const stars = D.PLAYERS.filter((p) => p.tier === 1).sort((a, b) => b.skill.pts - a.skill.pts);
    const st = { a: { p: stars[0].id, season: "2026-27", venue: "all" }, b: { p: stars[0].id, season: "2025-26", venue: "all" } };
    const opts = D.CLUBS.map((c) => `<optgroup label="${esc(c.name)}">${D.PLAYERS.filter((p) => p.club === c.code).map((p) => `<option value="${p.id}">${esc(p.name)} · ${p.pos}</option>`).join("")}</optgroup>`).join("");
    const lensHtml = (k) => `<div class="lens ${k}"><div class="who" id="ci-who-${k}"></div><div class="controls">
      <label class="field" for="ci-p-${k}">Player<select id="ci-p-${k}">${opts}</select></label>
      <label class="field" for="ci-s-${k}">Season<select id="ci-s-${k}">${D.LOG_SEASONS.map((s) => `<option>${s}</option>`).join("")}</select></label>
      <label class="field" for="ci-v-${k}">Games<select id="ci-v-${k}"><option value="all">All</option><option value="home">Home</option><option value="away">Away</option></select></label></div></div>`;
    root.innerHTML = `
      <div class="tabs" id="ci-tabs"><button type="button" data-tab="compare" class="on">Compare players</button><button type="button" data-tab="live">Live game</button></div>
      <div id="ci-compare">
        <div class="lenses">${lensHtml("a")}${lensHtml("b")}</div>
        <div class="butterfly" id="ci-bf"></div>
        <p class="note">Opens on the same player in two seasons. Change either side to compare two different players. Turnovers: lower is better.</p>
      </div>
      <div id="ci-live" hidden></div>`;
    const $ = (id) => root.querySelector("#" + id);
    const METRICS = [["games", "Games", 0], ["min", "Minutes", 1], ["pts", "Points", 1], ["reb", "Rebounds", 1], ["ast", "Assists", 1], ["stl", "Steals", 1], ["tov", "Turnovers", 1, true], ["three", "3P %", 1], ["pm", "+/-", 1]];
    function lens(s) {
      const p = D.PLAYER[s.p];
      let l = D.gameLogs(p).filter((x) => x.season === s.season);
      if (s.venue !== "all") l = l.filter((x) => x.home === (s.venue === "home"));
      const m = (k) => l.reduce((t, x) => t + x[k], 0) / Math.max(1, l.length);
      const tpa = l.reduce((t, x) => t + x.tpa, 0);
      return { games: l.length, min: m("min"), pts: m("pts"), reb: m("reb"), ast: m("ast"), stl: m("stl"), tov: m("tov"), pm: m("pm"), three: tpa ? 100 * l.reduce((t, x) => t + x.tpm, 0) / tpa : 0 };
    }
    function render() {
      ["a", "b"].forEach((k) => {
        const s = st[k], p = D.PLAYER[s.p];
        $("ci-p-" + k).value = s.p; $("ci-s-" + k).value = s.season; $("ci-v-" + k).value = s.venue;
        $("ci-who-" + k).innerHTML = `${crest(p.club)}<span>${esc(p.name)}</span><span style="color:var(--muted);font-weight:400;font-size:13px">#${p.number} · ${p.pos} · ${p.height} cm · ${p.age}</span>`;
      });
      const A = lens(st.a), B = lens(st.b);
      $("ci-bf").innerHTML = METRICS.map(([k, name, dec, lowBetter]) => {
        const a = A[k], b = B[k];
        if (k === "pm") {
          const mx = Math.max(1, Math.abs(a), Math.abs(b));
          return row(name, a, b, Math.abs(a) / mx, Math.abs(b) / mx, dec, false, (v) => (v > 0 ? "+" : "") + v.toFixed(1));
        }
        const mx = Math.max(a, b, 0.001);
        return row(name, a, b, a / mx, b / mx, dec, lowBetter);
      }).join("");
      function row(name, a, b, wa, wb, dec, lowBetter, f) {
        f = f || ((v) => v.toFixed(dec));
        const aw = lowBetter ? a < b : a > b, bw = lowBetter ? b < a : b > a;
        return `<div class="bf-row"><span class="l"><span class="val${aw ? " win" : ""}">${f(a)}</span><span class="bar" style="width:${(wa * 100).toFixed(1)}%"></span></span><span class="mid">${name}</span><span class="r"><span class="bar" style="width:${(wb * 100).toFixed(1)}%"></span><span class="val${bw ? " win" : ""}">${f(b)}</span></span></div>`;
      }
    }
    ["a", "b"].forEach((k) => {
      $("ci-p-" + k).onchange = (e) => { st[k].p = e.target.value; render(); };
      $("ci-s-" + k).onchange = (e) => { st[k].season = e.target.value; render(); };
      $("ci-v-" + k).onchange = (e) => { st[k].venue = e.target.value; render(); };
    });
    render();

    // ---- simulated live game ----
    const live = { timer: null, started: false };
    function startLive() {
      if (live.started) return; live.started = true;
      const g = D.CUR_GAMES.find((x) => x.round === D.CURRENT.nextRound);
      const r = D.rngFrom(31337);
      const players = { [g.home]: D.PLAYERS.filter((p) => p.club === g.home && p.tier === 1), [g.away]: D.PLAYERS.filter((p) => p.club === g.away && p.tier === 1) };
      const s = { [g.home]: 0, [g.away]: 0 }, pts = {}, events = [];
      let q = 1, clock = 600;
      const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      $("ci-live").innerHTML = `<div class="livebox"><div class="panel">
          <h4>${D.LEAGUE.name} · round ${g.round} · simulated feed</h4>
          <div class="score"><div>${crest(g.home, 40)}<div style="font-weight:600;margin-top:4px">${esc(D.CLUB[g.home].name)}</div></div><div class="s" id="lv-h">0</div><div class="clock" id="lv-clock">Q1<br>10:00</div><div class="s" id="lv-a">0</div><div style="text-align:right">${crest(g.away, 40)}<div style="font-weight:600;margin-top:4px">${esc(D.CLUB[g.away].name)}</div></div></div>
          <div style="margin-top:14px"><button class="btn ghost" id="lv-toggle" type="button">${reduced ? "Start" : "Pause"}</button></div>
          <h4 style="margin-top:16px">Top scorers</h4><div id="lv-top"></div></div>
        <div class="panel"><h4>Play by play</h4><ul class="pbp" id="lv-pbp" aria-live="off"></ul><p class="note">The app reads a pluggable provider: this simulator today, the official live feed when it’s available.</p></div></div>`;
      function tick() {
        const side = r.chance(0.5) ? g.home : g.away;
        const p = r.pick(players[side]);
        const kind = r.next();
        let text, v = 0;
        if (kind < 0.3) { v = 3; text = `${p.name} makes a three`; }
        else if (kind < 0.72) { v = 2; text = `${p.name} scores${r.chance(0.3) ? " in the paint" : " a jumper"}`; }
        else if (kind < 0.84) { v = 1; text = `${p.name} free throw`; }
        else text = r.pick([`${p.name} defensive rebound`, `${p.name} assist`, `Turnover by ${p.name}`, `${p.name} steal`]);
        s[side] += v; if (v) pts[p.id] = (pts[p.id] || 0) + v;
        clock -= r.int(14, 32);
        if (clock <= 0) { if (q === 4) { clearInterval(live.timer); live.timer = null; text = "End of game"; clock = 0; $("lv-toggle").disabled = true; } else { q++; clock = 600; text = `End of Q${q - 1}`; } }
        const mm = `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, "0")}`;
        events.unshift(`<li><time>Q${q} ${mm}</time><span>${crest(side, 18)}${esc(text)}${v ? ` <b>+${v}</b>` : ""}</span></li>`);
        $("lv-h").textContent = s[g.home]; $("lv-a").textContent = s[g.away];
        $("lv-clock").innerHTML = `Q${q}<br>${mm}`;
        $("lv-pbp").innerHTML = events.slice(0, 40).join("");
        const top = Object.entries(pts).sort((a, b) => b[1] - a[1]).slice(0, 4);
        $("lv-top").innerHTML = bars(top.map(([id, v]) => ({ label: D.PLAYER[id].name, labelHtml: `${crest(D.PLAYER[id].club, 18)}${esc(D.PLAYER[id].name)}`, value: v })), { hotFirst: true });
      }
      for (let i = 0; i < 12; i++) tick();
      const run = () => { live.timer = setInterval(tick, 1400); $("lv-toggle").textContent = "Pause"; };
      $("lv-toggle").onclick = () => { if (live.timer) { clearInterval(live.timer); live.timer = null; $("lv-toggle").textContent = "Resume"; } else run(); };
      if (!reduced) run();
    }
    $("ci-tabs").onclick = (e) => {
      const b = e.target.closest("[data-tab]"); if (!b) return;
      root.querySelectorAll("#ci-tabs [data-tab]").forEach((x) => x.classList.toggle("on", x === b));
      const isLive = b.dataset.tab === "live";
      $("ci-compare").hidden = isLive; $("ci-live").hidden = !isLive;
      if (isLive) startLive();
    };
    return () => { if (live.timer) clearInterval(live.timer); };
  }

  window.DEMOS = {
    "referee-explorer": refereeExplorer,
    "game-kit": gameKit,
    "security-report": securityReport,
    delegates,
    "injury-board": injuryBoard,
    "coaching-insights": coachingInsights,
  };
})();
