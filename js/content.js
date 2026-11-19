/*
 * Text for each project page: what it does, what I did, how it works and a
 * short excerpt of the idea behind the code. The excerpts are rewritten for
 * this portfolio; the production code belongs to my employer.
 */
window.PROFILE = {
  name: "Marta Neira",
  role: "Data Engineer · founder of Backcourt",
  city: "Barcelona, Spain",
  education: [
    "MBA, Data Analytics · Providence College",
    "BSc Mathematics & Statistics, summa cum laude · Bryant University",
  ],
  email: "mneiramartinez33@gmail.com",
  github: "https://github.com/martaneira",
  linkedin: "https://www.linkedin.com/in/marta-neira33/",
};

window.PROJECTS = [
  {
    id: "referee-explorer", no: "01", area: "Referees", title: "Referee Explorer",
    tagline: "Every referee assignment since 2000, searchable in seconds.",
    teaser: "26 seasons of games and crews behind one set of filters, with head-to-head mode and export.",
    problem: [
      "The referee department regularly asked questions like “how often has this referee worked this club’s games?” or “who refereed every meeting between these two teams?”. The answers were in the league’s public games API, but split across one endpoint per season and competition, and people exported Excel files one season at a time.",
      "I built a single explorer over the whole history, designed to be pleasant to use: crests, filter chips and instant results.",
    ],
    did: [
      "Audited the public API across every season first and documented its gaps (missing referee slots, renamed phases, cancelled games) so the app shows what the data really contains.",
      "Wrote a loader that pulls every season of both competitions and turns the three or four referee slots of each game into one row per assignment.",
      "Built a Flask API with filters for season, phase, round, referee position, team and referee, plus a head-to-head mode that only keeps games between the selected teams.",
      "Designed the single-page frontend (crests come from the API itself) and added Excel export.",
      "Deployed it on Google Cloud Run with a mock-data mode for local development.",
    ],
    flow: [["Games API", "1 call per season × competition"], ["Loader", "normalise + cache"], ["Flask /api/games", "filters, head-to-head"], ["Web UI", "chips, table, export"]],
    stack: ["Python", "Flask", "Requests", "Google Cloud Run", "JavaScript", "openpyxl"],
    files: [["app.py", "API routes, filtering, Excel export"], ["loader.py", "season-by-season fetch with cache"], ["static/index.html", "single-page UI"], ["Dockerfile", "Cloud Run image"]],
    codeFile: "app.py · head-to-head filter",
    code: `<span class="k">def</span> filter_games(games, teams=(), h2h=False, side="any"):
    <span class="c">"""Keep games involving the selected teams.

    h2h=True keeps only games *between* two selected teams, so the
    home/away side filter no longer makes sense and is ignored."""</span>
    teams = set(teams)
    <span class="k">if not</span> teams:
        <span class="k">return</span> games
    <span class="k">if</span> h2h <span class="k">and</span> len(teams) >= 2:
        <span class="k">return</span> [g <span class="k">for</span> g <span class="k">in</span> games
                <span class="k">if</span> g[<span class="s">"home"</span>] <span class="k">in</span> teams <span class="k">and</span> g[<span class="s">"away"</span>] <span class="k">in</span> teams]
    keep = {<span class="s">"home"</span>: (<span class="s">"home"</span>,), <span class="s">"away"</span>: (<span class="s">"away"</span>,)}.get(side, (<span class="s">"home"</span>, <span class="s">"away"</span>))
    <span class="k">return</span> [g <span class="k">for</span> g <span class="k">in</span> games <span class="k">if</span> any(g[k] <span class="k">in</span> teams <span class="k">for</span> k <span class="k">in</span> keep)]`,
    demoNote: "Fictional league · 26 seasons · 8,346 games generated in your browser",
  },
  {
    id: "game-kit", no: "02", area: "Media", title: "Game Kit",
    tagline: "Stats and storylines for every game of the round, ready before the round starts.",
    teaser: "Automated weekly notes for the media team, with a web app to review, edit and present them.",
    problem: [
      "Every week the media team prepares notes for each game: records, milestones, streaks and head-to-head facts. A colleague had written a script that generated these phrases from the league API, but it had to be started by hand, covered one competition at a time and its output lived in email only.",
      "I turned it into a scheduled pipeline for both competitions and gave the team a web app to work with the result.",
    ],
    did: [
      "Took over and extended a colleague’s phrase generator: both competitions, and a check that only sends a round once, when it starts within the next few days.",
      "Wrote an API client with throttling, retries that respect the Retry-After header, and an in-memory plus on-disk cache, so a full run stays polite to the API.",
      "Moved the run to GitHub Actions: it generates the phrases, emails them through SendGrid, uploads them to the app and commits the “last sent” state back to the repo.",
      "Built the Game Kit web app: browse by round, edit any phrase in place, and present one game per screen during meetings. A “Generate now” button starts the workflow.",
    ],
    flow: [["GitHub Actions", "manual or from the app"], ["Round check", "starts soon? already sent?"], ["Generator", "1 run per competition"], ["Outputs", "email + upload to app"]],
    stack: ["Python", "pandas", "Requests", "GitHub Actions", "SendGrid", "Flask"],
    files: [["send_both_if_new.py", "orchestrates both competitions"], ["run.py", "builds the phrases for one round"], ["api_client.py", "throttling, retries, cache"], ["game-kit-app/app.py", "browse, edit, present"]],
    codeFile: "send_both_if_new.py · send each round once",
    code: `<span class="k">def</span> should_send(competition, rounds, last_sent, today, window_days=4):
    <span class="c">"""Return the next round to send, or None.

    A round is sent when it starts within the window and has not been
    sent before. last_sent.json is committed back by the workflow, so
    re-running the job is always safe."""</span>
    upcoming = [r <span class="k">for</span> r <span class="k">in</span> rounds <span class="k">if</span> r.start >= today]
    <span class="k">if not</span> upcoming:
        <span class="k">return None</span>
    nxt = min(upcoming, key=<span class="k">lambda</span> r: r.start)
    <span class="k">if</span> (nxt.start - today).days > window_days:
        <span class="k">return None</span>
    <span class="k">if</span> last_sent.get(competition) == nxt.number:
        <span class="k">return None</span>
    <span class="k">return</span> nxt`,
    demoNote: "Fictional league · round 13 phrases generated from invented stats · click any phrase to edit",
  },
  {
    id: "security-report", no: "03", area: "Competition", title: "Security Report",
    tagline: "A purpose-built report every home club files after each game, and a dashboard to follow it.",
    teaser: "Replaced a generic form tool: personal links per club, reminders, completion grid and team stats.",
    problem: [
      "Home clubs reported on security after each game through a generic online form. The competition department couldn’t easily see who had submitted, who was late, or compare clubs over a season.",
      "Together with two colleagues I replaced it with our own app, built on the same pattern as our Travel Plans app.",
    ],
    did: [
      "Mapped the old questionnaire into a structured multi-step form (staffing, medical services, security meetings, incident checklist) and turned most free-text answers into options that can be counted.",
      "Gave each club a personal signed link plus password, and stored every report in BigQuery.",
      "Set up the emails: the report link goes to each club’s security manager before every home game, with reminders until it is submitted (SendGrid, scheduled jobs).",
      "Built the admin dashboard: a completion grid of teams × rounds (submitted, pending, overdue), per-team averages (spectators, ushers, stewards, paramedics), incident breakdowns and a detail view.",
      "Connected it to the department’s hub so staff sign in once for every tool.",
    ],
    flow: [["Schedule", "before each home game"], ["Email", "signed link per club"], ["Form", "multi-step, validated"], ["BigQuery", "one row per report"], ["Admin", "grid + team stats"]],
    stack: ["Python", "Flask", "itsdangerous", "BigQuery", "SendGrid", "Cloud Run", "GitHub CI deploy"],
    files: [["app.py", "club form with signed links"], ["admin.py", "grid, stats, detail, hub sign-in"], ["store.py", "BigQuery reads and writes"], ["templates/", "form steps and dashboard"]],
    codeFile: "admin.py · completion grid status",
    code: `<span class="k">def</span> cell_status(game, report, today, grace_days=2):
    <span class="c">"""Colour of one team × round cell in the completion grid."""</span>
    <span class="k">if</span> game <span class="k">is None</span>:
        <span class="k">return</span> <span class="s">"away"</span>          <span class="c"># no home game this round</span>
    <span class="k">if</span> game.date > today:
        <span class="k">return</span> <span class="s">"future"</span>
    <span class="k">if</span> report <span class="k">is not None</span>:
        <span class="k">return</span> <span class="s">"submitted"</span>
    late = (today - game.date).days > grace_days
    <span class="k">return</span> <span class="s">"overdue"</span> <span class="k">if</span> late <span class="k">else</span> <span class="s">"pending"</span>`,
    demoNote: "Fictional league · 108 reports for rounds 1–12 · click a team or a cell",
  },
  {
    id: "delegates", no: "04", area: "Competition · Marketing · Media", title: "Delegates",
    tagline: "One place where three departments read the game delegate’s report, each seeing what matters to them.",
    teaser: "Delegate reports split by department, automatic incident flags and next-morning emails.",
    problem: [
      "After every game, the league’s delegate fills in a long report (about 155 questions across three forms) on an external officiating platform. Competition, Marketing and Media each need a different part of it, and often heard about problems days later.",
    ],
    did: [
      "Built the pipeline that brings the reports from the platform’s export into BigQuery (first as Cloud Functions, later consolidated).",
      "Built the review app with one view per department: Competition sees timing, court and officials; Marketing sees LED boards, branding and the halftime show; Media sees press seats, the mixed zone and broadcast issues.",
      "Added incident detection: answers that indicate a problem are flagged and routed to the right department.",
      "Automated two emails: a night report after each game day, and a Tuesday summary of the round’s incidents.",
      "Plugged it into the department hub with single sign-in.",
    ],
    flow: [["Officiating platform", "delegate fills the report"], ["Pipeline", "export → BigQuery"], ["Rules", "flag + route incidents"], ["App", "3 department views"], ["Emails", "night + Tuesday"]],
    stack: ["Python", "Flask", "BigQuery", "Cloud Functions", "Cloud Scheduler", "SendGrid"],
    files: [["pipeline/", "export ingestion into BigQuery"], ["app.py", "department views, hub sign-in"], ["flags.py", "incident rules per department"], ["emails.py", "night and weekly summaries"]],
    codeFile: "flags.py · route incidents to departments",
    code: `RULES = [
    <span class="c"># (department, question, answer that means "problem", label)</span>
    (<span class="s">"Competition"</span>, <span class="s">"shot_clock_ok"</span>,  <span class="k">False</span>,  <span class="s">"Shot clock failure"</span>),
    (<span class="s">"Competition"</span>, <span class="s">"tip_off_delay"</span>,  <span class="k">lambda</span> m: m > 5, <span class="s">"Tip-off delayed"</span>),
    (<span class="s">"Marketing"</span>,   <span class="s">"led_boards_ok"</span>,  <span class="k">False</span>,  <span class="s">"LED boards off"</span>),
    (<span class="s">"Media"</span>,       <span class="s">"mixed_zone_late"</span>, <span class="k">True</span>,  <span class="s">"Mixed zone late"</span>),
]

<span class="k">def</span> flags_for(report):
    out = []
    <span class="k">for</span> dept, q, bad, label <span class="k">in</span> RULES:
        value = report.get(q)
        hit = bad(value) <span class="k">if</span> callable(bad) <span class="k">else</span> value == bad
        <span class="k">if</span> value <span class="k">is not None and</span> hit:
            out.append({<span class="s">"dept"</span>: dept, <span class="s">"label"</span>: label})
    <span class="k">return</span> out`,
    demoNote: "Fictional league · 18 delegate reports from rounds 11–12",
  },
  {
    id: "injury-board", no: "05", area: "Sports", title: "Injury Board",
    tagline: "Player availability for every club, without exposing a single medical detail.",
    teaser: "Daily injury sync reduced to Available · In doubt · Out, decided on the server.",
    problem: [
      "Injury records come from the clubs’ athlete-monitoring platform and from a reporting portal for the second competition. Staff needed to know who can play, but the records are medical data: diagnosis, body area and dates must stay with the medical team.",
    ],
    did: [
      "Connected to the athlete-monitoring export API and loaded it into BigQuery every morning, with a weekly summary email on Mondays.",
      "Built a reporting portal for the clubs of the second competition, and a normalisation step that maps both sources to the same categories so the competitions can be compared.",
      "Built the board: it joins rosters, crests and fixtures from the league API with the injury records, and reduces each player to Available, In doubt or Out on the server. Nothing else reaches the browser.",
      "Protected it with the hub’s signed, single-use sign-in tokens.",
    ],
    flow: [["Monitoring API", "daily export"], ["BigQuery", "injuries table"], ["Server", "reduce to 3 statuses"], ["Board", "rosters + fixtures"]],
    stack: ["Python", "Flask", "BigQuery", "Cloud Scheduler", "Cloud Run", "Privacy by design"],
    files: [["sync/main.py", "daily export → BigQuery"], ["app.py", "board API, hub sign-in"], ["normalize.py", "maps both sources to one model"], ["web/index.html", "board UI"]],
    codeFile: "app.py · only availability leaves the server",
    code: `<span class="k">def</span> availability(record, next_game_date):
    <span class="c">"""Reduce a medical record to one of three words.

    The diagnosis, body area and dates are used here and dropped:
    the JSON sent to the browser never contains them."""</span>
    <span class="k">if</span> record <span class="k">is None or</span> record.closed:
        <span class="k">return</span> <span class="s">"Available"</span>
    <span class="k">if</span> record.expected_return <span class="k">is None</span>:
        <span class="k">return</span> <span class="s">"Out"</span>
    days = (record.expected_return - next_game_date).days
    <span class="k">return</span> <span class="s">"Out"</span> <span class="k">if</span> days > 1 <span class="k">else</span> <span class="s">"In doubt"</span>

<span class="k">def</span> board_row(player, record, next_game_date):
    <span class="k">return</span> {<span class="s">"name"</span>: player.name, <span class="s">"number"</span>: player.number,
            <span class="s">"status"</span>: availability(record, next_game_date)}`,
    demoNote: "Fictional league · 234 invented players · statuses only, by design",
  },
  {
    id: "coaching-insights", no: "06", area: "Sports", title: "Coaching Insights",
    tagline: "Compare any two players, or one player against himself, in two clicks.",
    teaser: "Two-lens player comparison over three seasons, plus a live section during games.",
    problem: [
      "Coaches used a Tableau dashboard fed by a project that was being retired. They wanted the last two seasons as well as the current one, more flexible comparisons (home vs away, one season vs another) and live data during games.",
    ],
    did: [
      "Rebuilt the live box-score, shooting-chart and play-by-play loaders in our own Google Cloud project and replaced the hand-edited daily schedule with a 04:00 job that finds yesterday’s games and fills any gaps.",
      "Wrote SQL views over both competitions and a daily refresh that rebuilds the four tables the app reads.",
      "Built the Flask app: it loads those tables into memory, reloads them only when they change, and computes each side of the comparison (a “lens”) in Python.",
      "Added a Live section with a pluggable data provider, so the upcoming live stats feed can replace the simulator without touching the UI.",
    ],
    flow: [["Daily 04:00 job", "find yesterday’s games"], ["Loaders", "box score, PBP, shots"], ["BigQuery", "views + 4 app tables"], ["Flask", "in-memory lenses"], ["UI", "compare + live"]],
    stack: ["Python", "Flask", "BigQuery", "SQL", "Cloud Run", "Cloud Scheduler", "Tableau (previous)"],
    files: [["main.py", "routes and API"], ["data.py", "loads tables, computes lenses"], ["live.py", "live provider (demo / API)"], ["app_stats_refresh.sql", "daily table rebuild"]],
    codeFile: "data.py · one side of the comparison",
    code: `<span class="k">def</span> lens(logs, player_id, season=<span class="k">None</span>, venue=<span class="s">"all"</span>):
    <span class="c">"""Per-game averages for one player under one set of filters."""</span>
    df = logs[logs.player_id == player_id]
    <span class="k">if</span> season:
        df = df[df.season == season]
    <span class="k">if</span> venue != <span class="s">"all"</span>:
        df = df[df.is_home == (venue == <span class="s">"home"</span>)]
    <span class="k">if</span> df.empty:
        <span class="k">return None</span>
    avg = df[[<span class="s">"min"</span>, <span class="s">"pts"</span>, <span class="s">"reb"</span>, <span class="s">"ast"</span>, <span class="s">"stl"</span>, <span class="s">"tov"</span>, <span class="s">"pm"</span>]].mean().round(1)
    avg[<span class="s">"3p_pct"</span>] = round(100 * df.tpm.sum() / max(df.tpa.sum(), 1), 1)
    avg[<span class="s">"games"</span>] = len(df)
    <span class="k">return</span> avg.to_dict()`,
    demoNote: "Fictional league · 3 seasons of invented game logs · live game is simulated",
  },
];

window.ALSO = [
  ["Competition Hub", "One sign-in for eight department tools, using short-lived signed passes between apps."],
  ["Travel Plans", "Clubs submit away-trip plans; the app checks flight and bus distances and flags what’s missing."],
  ["High-Risk Games", "Flags high-risk games, sends security-plan letters to both clubs and follows up after 72 h."],
  ["Live game data pipeline", "Box score, play-by-play and shot chart loaders on Cloud Run, filled daily."],
  ["Doping Control Register", "Records anti-doping tests and checks testing quotas per team and phase."],
  ["Referee Ranking", "Composite referee ranking with adjustable weights; I took over and run the weekly nomination tool."],
  ["Historical data audit", "Documented 26 seasons of the league API, endpoint by endpoint, before building on it."],
];

/* ---------- Services ---------- */
window.SERVICES = {
  intro: "Backcourt builds websites and custom web apps for schools, restaurants, foundations, family businesses, clinics and clubs. Many small teams have the same problem: work that runs on forms, spreadsheets and chasing people by email. I turn that into one simple tool that does the chasing for you.",
  offers: [
    {
      tag: "Website", title: "A clear website that brings you clients",
      lead: "For businesses that need a professional site they can be proud of.",
      items: ["Up to 5 pages, designed for you, not a template", "Works on phones, tablets and computers", "Contact or booking form that lands in your inbox", "Basic search-engine setup and fast loading", "Delivered in about 2 weeks"],
      price: "Fixed price, quoted after a free call",
    },
    {
      tag: "Custom tool", title: "Your spreadsheet, turned into an app", featured: true,
      lead: "For teams that run a process by hand every week.",
      items: ["Forms with a personal link for each client, member or club", "A dashboard that shows who has done what, and who hasn’t", "Automatic emails and reminders on a schedule", "Exports to Excel and simple statistics", "One sign-in for your staff", "Delivered in 4–6 weeks, with a demo every week"],
      price: "Fixed price, quoted after a free call",
    },
    {
      tag: "Care plan", title: "Hosting and changes, every month",
      lead: "For anything I build, so it keeps working while you grow.",
      items: ["Hosting, backups and security updates", "Up to 2 hours of changes a month", "Reply within 2 working days", "Monthly check that forms and emails still work", "Cancel any month"],
      price: "Monthly fee",
    },
  ],
  fit: [
    "You collect the same information from people every week, by email or a generic form.",
    "Someone on your team spends hours a month chasing replies and copying data into Excel.",
    "Your data lives in five places and nobody is sure which version is right.",
    "You know exactly what you need, but off-the-shelf software is too big, too rigid or too expensive.",
  ],
  steps: [
    ["Free call", "30 minutes to understand how you work today and what gets in the way."],
    ["Fixed quote", "Within 2 working days: what I’ll build, the date and one fixed price. 50% to start."],
    ["Build", "A working demo every week, so you see progress and can change direction early."],
    ["Launch", "I set it up, train your team and leave a short guide. The rest is paid on delivery."],
    ["Care", "Optional monthly plan for hosting, fixes and small changes."],
  ],
  faq: [
    ["Do you only work with sports organisations?", "No. The same tools work for schools, restaurants, foundations, family businesses, clinics, gyms and event organisers. Anything that runs on forms, lists and reminders. See the example websites on the home page."],
    ["Who owns the code and the data?", "You do. After the final payment the code is yours, and your data stays in an account in your name."],
    ["What if I need changes later?", "Small changes are included in the care plan. Bigger additions get their own fixed quote, so you always know the cost before I start."],
    ["Can you work with the tools I already use?", "Usually, yes: Excel and Google Sheets, Gmail and Outlook, Google Workspace, and most services with an API."],
    ["How do you handle personal data?", "I keep it to what the tool needs, store it in the EU where possible, and sign a data processing agreement with you, as GDPR requires."],
    ["Which languages do you work in?", "English and Spanish."],
    ["Is Backcourt a big agency?", "No. Backcourt is a small studio run by me, Marta. You talk to the person who builds your tool, from the first call to delivery."],
  ],
};
