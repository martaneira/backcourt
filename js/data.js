/*
 * Fictional test data for every demo on this site.
 *
 * Nothing here comes from a real league: clubs, players, referees, games,
 * reports and injuries are generated from a fixed seed, so every visitor
 * sees the same "Atlas Basketball League" and the demos stay reproducible.
 */
(function () {
  "use strict";

  // ---------- deterministic random numbers ----------
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rngFrom(seed) {
    const r = mulberry32(seed);
    return {
      next: r,
      int: (a, b) => a + Math.floor(r() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      chance: (p) => r() < p,
      normal: (mu, sd) => {
        const u = 1 - r(), v = r();
        return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      },
    };
  }
  const R = rngFrom(20261119);

  // ---------- league ----------
  const LEAGUE = { name: "Atlas Basketball League", short: "ABL" };

  const CLUBS = [
    ["ALT", "Altamira Comets", "#d1495b"],
    ["BRV", "Brava Mariners", "#00798c"],
    ["CDR", "Cedarholm Owls", "#6a4c93"],
    ["DUN", "Dunmore Foxes", "#e07a1f"],
    ["ESK", "Eskerra Bulls", "#3d405b"],
    ["FAL", "Falkvik Ravens", "#22223b"],
    ["GRN", "Granmar Tide", "#118ab2"],
    ["HAL", "Halvard Wolves", "#7f5539"],
    ["IRN", "Ironvale Miners", "#5f6f52"],
    ["JUN", "Juniper Sparks", "#ef476f"],
    ["KOR", "Korsa Royals", "#4361ee"],
    ["LUM", "Lumeria Lights", "#f4a261"],
    ["MAR", "Marisol Waves", "#2a9d8f"],
    ["NOR", "Nordhaven Pines", "#264653"],
    ["OST", "Ostrova Bears", "#9d0208"],
    ["PAL", "Palmera Suns", "#e9c46a"],
    ["QUA", "Quarry City Stones", "#6c757d"],
    ["RIV", "Riverton Herons", "#0077b6"],
  ].map(([code, name, color]) => ({ code, name, color, city: name.split(" ").slice(0, -1).join(" ") }));
  const CLUB = Object.fromEntries(CLUBS.map((c) => [c.code, c]));

  const FIRST = ["Adrian","Bruno","Carles","Dario","Elias","Filip","Goran","Hugo","Ivo","Jonas","Kai","Luka","Marco","Nico","Oskar","Pau","Rafael","Sami","Teo","Uros","Viktor","Yannis","Zoran","Aaron","Bastian","Cedric","Dmitri","Emil","Felix","Gael","Henrik","Isaac","Jalen","Kevin","Lars","Mateo","Nolan","Omar","Pedro","Quentin","Ruben","Stefan","Tomas","Andre","Bogdan","Cyril","Dorian","Enzo"];
  const LAST = ["Abaroa","Belic","Castell","Dimou","Ekström","Ferrand","Galvez","Horak","Ilic","Jansen","Kovac","Lindqvist","Moreau","Novak","Okafor","Petrakis","Quiroga","Rossi","Sander","Tanaka","Udeh","Varga","Weiss","Xanthos","Yilmaz","Zubiri","Arnaud","Brandt","Costa","Dragic","Esposito","Fonseca","Grau","Haddad","Iversen","Jovic","Kral","Lopes","Mendez","Nakamura","Olsen","Palacios","Renard","Sousa","Toivonen","Valdes","Wagner","Zeller"];
  const COUNTRIES = ["ESP","FRA","ITA","GRE","SRB","TUR","LTU","GER","CRO","SLO","POL","ISR","NED","POR","CZE","FIN","LAT","BEL"];

  // players: 13 per club
  const POS = ["G","G","G","G","F","F","F","F","F","C","C","C","G"];
  const PLAYERS = [];
  let pid = 1000;
  const usedNames = new Set();
  CLUBS.forEach((club, ci) => {
    const numbers = new Set();
    POS.forEach((pos, i) => {
      let name;
      do { name = R.pick(FIRST) + " " + R.pick(LAST); } while (usedNames.has(name));
      usedNames.add(name);
      let num; do { num = R.int(0, 55); } while (numbers.has(num)); numbers.add(num);
      const tier = i < 5 ? 1 : i < 9 ? 0.72 : 0.45; // starters / rotation / bench
      PLAYERS.push({
        id: "P" + pid++, name, club: club.code, pos, number: num,
        height: pos === "G" ? R.int(183, 198) : pos === "F" ? R.int(198, 207) : R.int(206, 216),
        country: R.pick(COUNTRIES), tier, age: R.int(20, 35),
        skill: { pts: R.normal(pos === "C" ? 11 : 13, 3.2) * tier, reb: (pos === "C" ? 7.5 : pos === "F" ? 5 : 3) * tier * R.normal(1, 0.15), ast: (pos === "G" ? 5 : pos === "F" ? 2.2 : 1.3) * tier * R.normal(1, 0.2), three: Math.min(0.46, Math.max(0.22, R.normal(pos === "C" ? 0.29 : 0.36, 0.04))) },
      });
    });
  });
  const PLAYER = Object.fromEntries(PLAYERS.map((p) => [p.id, p]));

  // referees
  const REFEREES = [];
  const refNames = new Set();
  for (let i = 0; i < 42; i++) {
    let n; do { n = R.pick(FIRST) + " " + R.pick(LAST); } while (refNames.has(n) || usedNames.has(n));
    refNames.add(n);
    // a third of the crew starts in 2000, a third is still active today
    const start = i < 14 ? 2000 : R.int(2001, 2018);
    const end = i >= 28 ? 2025 : Math.min(2025, start + R.int(8, 20));
    REFEREES.push({ id: "R" + (100 + i), name: n, country: R.pick(COUNTRIES), from: start, to: end, weight: 0.4 + R.next() });
  }

  // ---------- schedules ----------
  function roundRobin(codes, seed) {
    const r = rngFrom(seed);
    const t = codes.slice().sort(() => r.next() - 0.5);
    const n = t.length, rounds = [];
    for (let k = 0; k < n - 1; k++) {
      const games = [];
      for (let i = 0; i < n / 2; i++) {
        const a = t[i], b = t[n - 1 - i];
        games.push(k % 2 === 0 ? [a, b] : [b, a]);
      }
      rounds.push(games);
      t.splice(1, 0, t.pop()); // rotate all but the first
    }
    return rounds.concat(rounds.map((g) => g.map(([h, a]) => [a, h])));
  }

  function seasonLabel(y) { return y + "-" + String((y + 1) % 100).padStart(2, "0"); }

  // historical games 2000-01 .. 2025-26 for the Referee Explorer
  const HIST_GAMES = [];
  for (let y = 2000; y <= 2025; y++) {
    const r = rngFrom(7000 + y);
    const rounds = roundRobin(CLUBS.map((c) => c.code), 300 + y);
    const start = new Date(Date.UTC(y, 9, 2));
    const refsActive = REFEREES.filter((x) => x.from <= y && x.to >= y);
    const addGame = (phase, round, home, away, day) => {
      const crew = [];
      while (crew.length < 3) {
        const total = refsActive.reduce((s, x) => s + x.weight, 0);
        let pickW = r.next() * total, chosen = refsActive[0];
        for (const x of refsActive) { pickW -= x.weight; if (pickW <= 0) { chosen = x; break; } }
        if (!crew.includes(chosen.id)) crew.push(chosen.id);
      }
      const hs = r.int(66, 98), as = r.int(62, 95) - (hs === 0 ? 0 : 0);
      HIST_GAMES.push({
        season: seasonLabel(y), year: y, phase, round, home, away,
        date: new Date(start.getTime() + day * 86400000).toISOString().slice(0, 10),
        score: hs + "-" + (as === hs ? as - 2 : as), refs: crew,
      });
    };
    rounds.forEach((games, ri) => games.forEach(([h, a]) => addGame("Regular Season", ri + 1, h, a, ri * 5 + r.int(0, 1))));
    // playoffs: 4 series, best of 3, then final four
    const seeds = CLUBS.map((c) => c.code).sort(() => r.next() - 0.5).slice(0, 8);
    for (let s = 0; s < 4; s++) for (let g = 0; g < 3; g++) addGame("Playoffs", g + 1, g === 1 ? seeds[7 - s] : seeds[s], g === 1 ? seeds[s] : seeds[7 - s], 175 + g * 3);
    addGame("Final Four", 1, seeds[0], seeds[3], 196); addGame("Final Four", 1, seeds[1], seeds[2], 196);
    addGame("Final Four", 2, seeds[0], seeds[1], 198);
  }

  // current season 2026-27 (used by Security Report, Delegates, Game Kit, Injuries)
  const CURRENT = { season: "2026-27", playedRounds: 12, nextRound: 13 };
  const CUR_ROUNDS = roundRobin(CLUBS.map((c) => c.code), 2026);
  const CUR_GAMES = [];
  CUR_ROUNDS.forEach((games, ri) => {
    const r = rngFrom(9100 + ri);
    games.forEach(([h, a], gi) => {
      const played = ri + 1 <= CURRENT.playedRounds;
      const hs = r.int(70, 99), as = r.int(66, 96);
      CUR_GAMES.push({
        id: "G" + String(ri + 1).padStart(2, "0") + String(gi + 1).padStart(2, "0"),
        round: ri + 1, home: h, away: a, played,
        date: new Date(Date.UTC(2026, 9, 1) + ri * 7 * 86400000 + (gi % 2) * 86400000).toISOString().slice(0, 10),
        score: played ? hs + "-" + (as === hs ? as + 3 : as) : null,
      });
    });
  });

  // ---------- security reports ----------
  const INCIDENT_TYPES = ["Pyrotechnics", "Objects thrown", "Court invasion attempt", "Discriminatory chants", "Fan altercation", "Unauthorised banner"];
  const SECURITY = {};
  CLUBS.forEach((c, i) => {
    const r = rngFrom(4000 + i);
    SECURITY[c.code] = { capacity: r.int(5, 16) * 1000, ushersBase: r.int(25, 70), riskiness: r.next() };
  });
  const SECURITY_REPORTS = CUR_GAMES.filter((g) => g.played).map((g) => {
    const r = rngFrom(5000 + parseInt(g.id.slice(1), 10));
    const s = SECURITY[g.home];
    const overdueChance = g.round >= CURRENT.playedRounds - 1 ? 0.35 : 0.06;
    const submitted = !r.chance(overdueChance);
    const incidents = [];
    if (r.chance(0.12 + s.riskiness * 0.25)) {
      incidents.push(r.pick(INCIDENT_TYPES));
      if (r.chance(0.3)) incidents.push(r.pick(INCIDENT_TYPES));
    }
    return {
      game: g.id, round: g.round, home: g.home, away: g.away, submitted,
      status: submitted ? "submitted" : g.round === CURRENT.playedRounds ? "pending" : "overdue",
      spectators: Math.round(s.capacity * (0.55 + r.next() * 0.45)),
      ushers: Math.round(s.ushersBase * (0.85 + r.next() * 0.3)),
      stewards: r.int(20, 60), paramedics: r.int(4, 12), ambulances: r.int(1, 3),
      risk: incidents.length > 1 ? "High" : incidents.length ? "Medium" : "Low",
      incidents: [...new Set(incidents)],
      meeting: r.pick(["90 min before tip-off", "120 min before tip-off", "Day before the game"]),
    };
  });

  // ---------- delegate reports ----------
  const DELEGATES = ["Ines Berg", "Jordi Puig", "Karin Holm", "Luca Ferri", "Mia Kostas", "Nils Ahlberg"];
  const DELEGATE_REPORTS = CUR_GAMES.filter((g) => g.round >= CURRENT.playedRounds - 1 && g.played).map((g) => {
    const r = rngFrom(6100 + parseInt(g.id.slice(1), 10));
    const flags = [];
    const add = (dept, text) => flags.push({ dept, text });
    if (r.chance(0.22)) add("Competition", r.pick(["Shot clock failed for 4 min in Q2; backup used", "Tip-off delayed 12 min (court cleaning)", "Scoreboard showed wrong team fouls in Q3"]));
    if (r.chance(0.18)) add("Competition", r.pick(["Home bench technical after the buzzer", "Visiting team arrived 25 min late to the arena"]));
    if (r.chance(0.25)) add("Marketing", r.pick(["LED boards off for the first 3 minutes", "Sponsor floor decal peeling at the baseline", "Halftime show ran 2 min over"]));
    if (r.chance(0.22)) add("Media", r.pick(["Mixed zone opened 15 min late", "Two press seats without power", "Broadcast camera blocked by a banner"]));
    return {
      game: g.id, round: g.round, home: g.home, away: g.away, date: g.date, score: g.score,
      delegate: r.pick(DELEGATES),
      competition: { tipOff: r.chance(0.9) ? "On time" : "Delayed", courtCondition: r.pick(["Good", "Good", "Good", "Slippery near the baseline"]), officials: "3 referees, table crew complete", attendance: SECURITY_REPORTS.find((s) => s.game === g.id)?.spectators },
      marketing: { ledBoards: r.chance(0.85) ? "Working" : "Partially off", floorBranding: r.pick(["Correct", "Correct", "Decal damaged"]), halftime: r.pick(["Dance team", "Youth game", "Fan contest"]), mascot: r.chance(0.7) ? "Present" : "Absent" },
      media: { pressSeats: r.int(18, 40), mixedZone: r.chance(0.85) ? "On time" : "Late", photographers: r.int(4, 14), broadcast: r.chance(0.9) ? "No issues" : "Camera position blocked" },
      flags,
    };
  });

  // ---------- game logs (Coaching Insights) ----------
  const LOG_SEASONS = ["2024-25", "2025-26", "2026-27"];
  function gameLogs(player) {
    if (player._logs) return player._logs;
    const logs = [];
    LOG_SEASONS.forEach((season, si) => {
      const r = rngFrom(parseInt(player.id.slice(1), 10) * 7 + si * 131);
      const n = season === "2026-27" ? CURRENT.playedRounds : 34;
      const form = r.normal(1, 0.1) * (1 + si * 0.04 * (player.age < 26 ? 1 : -0.5));
      for (let g = 1; g <= n; g++) {
        const home = g % 2 === 0;
        const f = form * (home ? 1.05 : 0.95) * Math.max(0.2, r.normal(1, 0.32));
        const min = Math.max(4, Math.min(36, r.normal(32 * player.tier, 4)));
        const tpa = Math.max(0, Math.round(r.normal(player.pos === "C" ? 1.2 : 4.5, 1.5) * player.tier));
        const tpm = Array.from({ length: tpa }, () => r.chance(player.skill.three)).filter(Boolean).length;
        logs.push({
          season, game: g, home, min: Math.round(min),
          pts: Math.max(0, Math.round(player.skill.pts * f)),
          reb: Math.max(0, Math.round(player.skill.reb * f * r.normal(1, 0.25))),
          ast: Math.max(0, Math.round(player.skill.ast * f * r.normal(1, 0.3))),
          stl: Math.max(0, Math.round(r.normal(0.9, 0.8) * player.tier)),
          tov: Math.max(0, Math.round(r.normal(1.6, 1) * player.tier)),
          tpm, tpa, pm: Math.round(r.normal(home ? 2 : -1, 8)),
        });
      }
    });
    player._logs = logs;
    return logs;
  }

  // ---------- injuries (availability only) ----------
  const AVAILABILITY = {};
  PLAYERS.forEach((p, i) => {
    const r = rngFrom(8800 + i);
    const x = r.next();
    AVAILABILITY[p.id] = x < 0.08 ? "Out" : x < 0.15 ? "In doubt" : "Available";
  });

  // ---------- Game Kit phrase facts ----------
  function careerPoints(p) { return Math.round(p.skill.pts * (p.age - 18) * 30 * 0.8); }

  window.DATA = {
    rngFrom, LEAGUE, CLUBS, CLUB, PLAYERS, PLAYER, REFEREES, HIST_GAMES, CURRENT,
    CUR_GAMES, SECURITY_REPORTS, INCIDENT_TYPES, DELEGATE_REPORTS, LOG_SEASONS, gameLogs,
    AVAILABILITY, careerPoints,
  };
})();
