/* Page rendering and hash routing: #home or #<project-id>. */
(function () {
  "use strict";
  const P = window.PROJECTS, ME = window.PROFILE, D = window.DATA;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const main = document.getElementById("main");
  let cleanup = null;

  const COURT = `<svg class="court" viewBox="0 0 600 560" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
    <rect x="20" y="20" width="560" height="520"/><rect x="220" y="20" width="160" height="230"/>
    <circle cx="300" cy="250" r="60"/><path d="M60 20 V150 A240 240 0 0 0 540 150 V20"/>
    <circle cx="300" cy="62" r="11"/><line x1="270" y1="48" x2="330" y2="48"/>
    <path d="M240 540 A60 60 0 0 1 360 540"/></svg>`;

  const MARK = (w, line, fill) => `<svg width="${w}" height="${Math.round(w * 2 / 3)}" viewBox="0 0 150 100" aria-hidden="true"><rect x="4" y="4" width="71" height="92" rx="6" fill="${fill || "var(--accent)"}"/><rect x="4" y="4" width="142" height="92" rx="6" fill="none" stroke="${line || "currentColor"}" stroke-width="8"/><path d="M75 4V96" stroke="${line || "currentColor"}" stroke-width="8"/><circle cx="75" cy="50" r="17" fill="var(--ball)" stroke="${line || "currentColor"}" stroke-width="8"/></svg>`;

  const EXAMPLES = [
    { sector: "Restaurants", title: "Menus, bookings and reminders", tool: "table booking with live time slots", name: "Casa Olivera", href: "examples/restaurant/index.html", c1: "#1c2b4a", c2: "#e8b23a", c3: "#fbf8f2", font: "Georgia, serif" },
    { sector: "Schools", title: "Admissions without the paperwork", tool: "3-step application, events calendar, family portal", name: "Turó Verd", href: "examples/school/index.html", c1: "#24453b", c2: "#f6c445", c3: "#ef6f5e", font: "system-ui, sans-serif" },
    { sector: "Foundations", title: "Donations and volunteers in one place", tool: "monthly donations with impact, volunteer sign-up", name: "Pont Obert", href: "examples/foundation/index.html", c1: "#1a1a2e", c2: "#c92a5f", c3: "#2b8a8a", font: "Georgia, serif" },
    { sector: "Family businesses", title: "Sell direct, without a marketplace", tool: "online shop with live totals, trade requests", name: "Germans Vidal", href: "examples/family-company/index.html", c1: "#231f1a", c2: "#c9a227", c3: "#5f6d24", font: "Didot, Georgia, serif" },
    { sector: "Clinics & studios", title: "Appointments that book themselves", tool: "online booking by treatment, therapist and time", name: "Moviment Physio", href: "examples/clinic/index.html", c1: "#0f4c5c", c2: "#ff9f68", c3: "#f3f6f9", font: "system-ui, sans-serif" },
    { sector: "Sports clubs & leagues", title: "The tools behind a professional league", tool: "six real case studies with live demos", name: "Case studies", href: "#work", c1: "#12161d", c2: "#1d6b5a", c3: "#e2531b", font: "var(--font-display)" },
  ];

  function home() {
    document.title = "Backcourt · Websites and custom tools for teams";
    main.innerHTML = `
      <section class="hero"><div class="wrap hero-grid">
        <div class="hero-copy">
          <div class="kicker">Web &amp; data studio · ${esc(ME.city)}</div>
          <h1>The tools <em>behind</em> your team.</h1>
          <p class="lede">Backcourt builds <strong>websites and custom web apps</strong> for schools, restaurants, foundations, family businesses, clinics and clubs. Your team stops copying data between spreadsheets, forms and email, and gets back to the work that matters.</p>
          <div class="ctas"><a class="btn big" href="#contact">Book a free 30-minute call</a><a class="btn big ghost" href="#work">See the work</a></div>
          <div class="scoreboard">
            <div><b class="num">16</b><span>apps built and running</span></div>
            <div><b class="num">12</b><span>automated data jobs</span></div>
            <div><b class="num">26</b><span>seasons of data cleaned</span></div>
            <div><b class="num">1</b><span>sign-in for all of them</span></div>
          </div>
        </div>
        <div class="hero-court" aria-hidden="true">${MARK(420, "currentColor")}</div>
      </div></section>

      <section class="section"><div class="wrap">
        <div class="section-head"><h2>Why teams call Backcourt</h2><p>In basketball, the backcourt runs the play. Backcourt builds the tools that run yours: the forms, dashboards and automations behind the scenes.</p></div>
        <div class="why">
          <div><span class="n">01</span><b>Built around how you work</b><p>No generic template. I start from your process today and build exactly the tool it needs, nothing more.</p></div>
          <div><span class="n">02</span><b>Fixed price, fixed date</b><p>You get one price and one delivery date before I start, and a working demo every week.</p></div>
          <div><span class="n">03</span><b>Proven on a pro league</b><p>The same kind of tools already run operations for a European professional basketball league, every week of the season.</p></div>
          <div><span class="n">04</span><b>Yours to keep</b><p>The code and the data are yours. Everything comes with a short guide your team can follow.</p></div>
        </div>
      </div></section>

      <section class="section" id="examples" style="padding-top:0"><div class="wrap">
        <div class="section-head"><h2>Who I build for</h2><p>Every kind of team has its own spreadsheet problem. Open an example website to try it: each one includes a working tool, not just pages.</p></div>
        <div class="examples">${EXAMPLES.map((x) => `
          <a class="ex" href="${x.href}" style="--c1:${x.c1};--c2:${x.c2};--c3:${x.c3}">
            <span class="ex-prev" aria-hidden="true"><i></i><i></i><i></i><em style="font-family:${x.font}">${esc(x.name)}</em></span>
            <span class="ex-body"><span class="kicker">${esc(x.sector)}</span><b>${esc(x.title)}</b><span class="ex-tool"><strong>Includes:</strong> ${esc(x.tool)}</span><span class="go">${x.href.startsWith("#") ? "See the case studies" : "Open the example"}</span></span>
          </a>`).join("")}
        </div>
      </div></section>

      <section class="section band" id="story"><div class="wrap story">
        <div class="story-photos">
          <img class="p1" src="img/court-33.jpg" alt="Marta playing for Bryant University, number 33" width="640" height="800">
          <img class="p2" src="img/mba.jpg" alt="Marta at her MBA graduation at Providence College" width="720" height="900">
        </div>
        <div>
          <div class="kicker">Who I am</div>
          <h2>From the court to the code</h2>
          <p>I’m Marta Neira, from Barcelona. I moved to the US to play NCAA Division I basketball for Bryant University, wearing #33 as a guard in the America East conference, while studying applied mathematics and statistics.</p>
          <p>Basketball taught me how a team really works: everyone needs the right information at the right moment, and the best plays are the ones nobody notices. Maths taught me how to turn messy data into decisions.</p>
          <p>After an MBA in data analytics at Providence College, I came back to basketball from the other side. Today I work as a data engineer for a European professional basketball league, building its internal tools: the apps clubs use to send their reports, the dashboards staff check every morning and the pipelines that load every game.</p>
          <p>I started Backcourt to bring the same tools to every kind of team: schools, restaurants, foundations, family businesses and clinics that still run on spreadsheets and email.</p>
          <ol class="timeline">
            <li><b>Bryant University</b><span>Mathematics &amp; Statistics, summa cum laude · NCAA Division I basketball, #33</span></li>
            <li><b>Providence College</b><span>MBA, Data Analytics</span></li>
            <li><b>Professional basketball</b><span>Data Engineer at a European professional basketball league</span></li>
            <li><b>Backcourt</b><span>Websites and custom tools for teams of every kind, from Barcelona</span></li>
          </ol>
        </div>
      </div></section>

      <section class="section" id="work"><div class="wrap">
        <div class="section-head"><h2>Case studies from pro sport</h2><p>Six tools I built as a data engineer in professional basketball. The same building blocks (forms with personal links, dashboards, automatic emails, bookings) power the example websites above. The demos run on an invented league, so no real data appears here.</p></div>
        <div class="roster">${P.map((p) => `
          <a class="card" href="#${p.id}"><span class="area">${esc(p.area)}</span><span class="jersey">${p.no}</span><h3>${esc(p.title)}</h3><p>${esc(p.teaser)}</p><span class="go">Try the demo</span></a>`).join("")}
        </div>
        <div class="also-wrap"><h3 class="also-h">Also built</h3>
        <div class="also">${window.ALSO.map(([t, d]) => `<div><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join("")}</div></div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        <div class="section-head"><h2>What I can build for you</h2><p><a href="#services">See services and how we’ll work →</a></p></div>
        <div class="teaser-list light">${window.SERVICES.offers.map((o) => `<a href="#services"><span>${esc(o.tag)}</span><b>${esc(o.title)}</b><em>${esc(o.lead)}</em></a>`).join("")}</div>
      </div></section>

      <section class="section cta-band"><div class="wrap cta-inner">
        <div>${MARK(120, "#eef1f4", "#3fae8c")}</div>
        <div><h2>Let’s find the spreadsheet you can retire first.</h2><p>A free 30-minute call. You explain how you work today; I tell you honestly whether a tool would help and what it would take.</p></div>
        <a class="btn big" href="#contact">Book a free call</a>
      </div></section>

      <section class="section" id="about"><div class="wrap about">
        <div><div class="section-head"><h2>How I work</h2></div>
          <p>I start from the people who will use the tool: what they do today, where it breaks, and what they need to see first. Then I check the data before building on it.</p>
          <p>I ship small and often. Every tool runs in the cloud, keeps secrets out of the code, has a demo mode for testing and comes with a guide a colleague can follow.</p>
          <p>I build with an AI pair programmer, which makes me faster. I own the problem, the design, the data decisions, testing and delivery.</p>
        </div>
        <div><div class="section-head"><h2>Toolbox</h2></div>
          <div class="stack" style="margin-bottom:28px">${["Python", "Flask", "pandas", "SQL", "BigQuery", "Firestore", "Cloud Run", "Cloud Functions", "Cloud Scheduler", "GitHub Actions", "SendGrid", "REST APIs", "JavaScript", "HTML / CSS", "Tableau", "Excel", "Git"].map((t) => `<span class="chip">${t}</span>`).join("")}</div>
          <div class="section-head"><h2>Education</h2></div>
          <ul class="edu">${ME.education.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
        </div>
      </div></section>`;
  }

  function project(p) {
    document.title = `${p.title} · Backcourt`;
    const i = P.indexOf(p), prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
    main.innerHTML = `
      <section class="proj-head"><div class="wrap">
        <a class="back" href="#home">← All projects</a>
        <span class="jersey">${p.no}</span>
        <div class="kicker">${esc(p.area)}</div>
        <div><h1>${esc(p.title)}</h1><p class="tagline">${esc(p.tagline)}</p></div>
      </div></section>
      <div class="wrap">
        <div class="demo-shell"><div class="demo-bar"><span class="live">Live demo</span><span>${esc(p.demoNote)}</span></div><div class="demo" id="demo"></div></div>
        <div class="cols">
          <div><h2>The problem</h2>${p.problem.map((t) => `<p>${esc(t)}</p>`).join("")}
            <h2 style="margin-top:26px">What I did</h2><ol class="did">${p.did.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>
          <div><h2>How it works</h2>
            <div class="flow">${p.flow.map(([a, b], k) => `${k ? '<span class="arrow" aria-hidden="true">→</span>' : ""}<span class="step">${esc(a)}<small>${esc(b)}</small></span>`).join("")}</div>
            <div class="stack" style="margin-bottom:18px">${p.stack.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
            <h2 style="font-size:24px">Code at a glance</h2>
            <ul class="files">${p.files.map(([f, d]) => `<li><b>${esc(f)}</b> · ${esc(d)}</li>`).join("")}</ul>
            <div class="codefile">${esc(p.codeFile)}</div>
            <pre class="code"><code>${p.code}</code></pre>
            <p class="note">Excerpt rewritten for this portfolio. The production code belongs to my employer.</p>
          </div>
        </div>
        <nav class="next-prev" aria-label="More projects"><a href="#${prev.id}"><small>← Previous</small>${esc(prev.title)}</a><a href="#${next.id}" style="text-align:right"><small>Next →</small>${esc(next.title)}</a></nav>
      </div>`;
    const demo = window.DEMOS[p.id];
    try { cleanup = demo(document.getElementById("demo")) || null; }
    catch (e) { document.getElementById("demo").innerHTML = `<p class="note">The demo couldn’t start: ${esc(e.message)}</p>`; console.error(e); }
  }

  function services() {
    const S = window.SERVICES;
    document.title = "Services · Backcourt";
    main.innerHTML = `
      <section class="proj-head"><div class="wrap svc-head">
        <a class="back" href="#home">← Home</a>
        <div class="kicker">Backcourt services · ${esc(ME.city)}</div>
        <h1>Websites and custom tools for teams</h1>
        <p class="tagline">${esc(S.intro)}</p>
        <div class="ctas"><a class="btn big" href="#contact">Book a free 30-minute call</a><a class="btn big ghost" href="#work">See what I’ve built</a></div>
      </div></section>
      <div class="wrap">
        <section class="section">
          <div class="offers">${S.offers.map((o) => `
            <article class="offer${o.featured ? " featured" : ""}">
              <div class="offer-top"><span class="kicker">${esc(o.tag)}</span>${o.featured ? '<span class="pill hot">Most requested</span>' : ""}</div>
              <h3>${esc(o.title)}</h3><p class="lead">${esc(o.lead)}</p>
              <ul>${o.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
              <div class="price">${esc(o.price)}</div>
              <a class="btn${o.featured ? "" : " ghost"}" href="#contact" data-offer="${esc(o.tag)}">Ask about this</a>
            </article>`).join("")}</div>
        </section>

        <section class="section" style="padding-top:0"><div class="about">
          <div><div class="section-head"><h2>A good fit if</h2></div><ul class="fit">${S.fit.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>
          <div><div class="section-head"><h2>Real examples</h2></div>
            <p>Try a working example for your kind of business:</p>
            <ul class="fit">
              <li><a href="examples/restaurant/index.html">Restaurant</a>: menu, table booking with live time slots.</li>
              <li><a href="examples/school/index.html">School</a>: admissions in three steps, events calendar, family portal.</li>
              <li><a href="examples/foundation/index.html">Foundation</a>: monthly donations with impact, volunteer sign-up.</li>
              <li><a href="examples/family-company/index.html">Family business</a>: online shop and trade price requests.</li>
              <li><a href="examples/clinic/index.html">Clinic</a>: online appointments by treatment, physio and time.</li>
              <li><a href="#security-report">Security Report</a>: home clubs used to report through a generic form. Now each one has a personal link, reminders go out on their own and staff see a live completion grid.</li>
              <li><a href="#delegates">Delegates</a>: one long report, three departments. Each one now sees its own view and gets an email when something goes wrong.</li>
              <li><a href="#referee-explorer">Referee Explorer</a>: 26 seasons of Excel exports replaced by one search page.</li>
            </ul></div>
        </div></section>

        <section class="section" style="padding-top:0">
          <div class="section-head"><h2>How we’ll work</h2><p>Fixed price and a fixed date, agreed before I start.</p></div>
          <ol class="steps">${S.steps.map(([t, d], i) => `<li><span class="n">${String(i + 1).padStart(2, "0")}</span><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("")}</ol>
        </section>

        <section class="section" style="padding-top:0"><div class="about">
          <div><div class="section-head"><h2>Questions</h2></div>
            <div class="faq">${S.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div></div>
          <div id="contact"><div class="section-head"><h2>Let’s talk</h2></div>
            <form class="form" id="contact-form" novalidate>
              <label for="cf-name">Your name<input id="cf-name" type="text" required autocomplete="name"></label>
              <label for="cf-email">Email<input id="cf-email" type="email" required autocomplete="email"></label>
              <label for="cf-org">Company or organisation<input id="cf-org" type="text" autocomplete="organization"></label>
              <label for="cf-need">What do you need?<select id="cf-need">${S.offers.map((o) => `<option>${esc(o.tag)}</option>`).join("")}<option>Not sure yet</option></select></label>
              <label for="cf-msg">Tell me how you work today<textarea id="cf-msg" rows="5" placeholder="For example: we collect registrations with a Google Form, copy them into Excel and email reminders by hand every Monday."></textarea></label>
              <button class="btn big" type="submit">Send</button>
              <p class="note" id="cf-status" role="status">This opens your email app with the message ready. You can also write to <b>${esc(ME.email)}</b>.</p>
            </form>
          </div>
        </div></section>
      </div>`;
    const form = document.getElementById("contact-form");
    main.querySelectorAll("[data-offer]").forEach((a) => a.addEventListener("click", () => { document.getElementById("cf-need").value = a.dataset.offer; }));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (id) => document.getElementById(id).value.trim();
      const status = document.getElementById("cf-status");
      if (!v("cf-name") || !/^\S+@\S+\.\S+$/.test(v("cf-email"))) { status.innerHTML = "Please add your name and a valid email so I can reply."; status.classList.add("err"); return; }
      status.classList.remove("err");
      const subject = `${v("cf-need")} enquiry from ${v("cf-name")}${v("cf-org") ? " (" + v("cf-org") + ")" : ""}`;
      const body = `${v("cf-msg")}\n\n${v("cf-name")}\n${v("cf-email")}${v("cf-org") ? "\n" + v("cf-org") : ""}`;
      location.href = `mailto:${ME.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.innerHTML = `If your email app didn’t open, write to <b>${esc(ME.email)}</b> and I’ll reply within 2 working days.`;
    });
  }

  function route() {
    if (typeof cleanup === "function") cleanup();
    cleanup = null;
    const id = (location.hash || "#home").slice(1);
    const p = P.find((x) => x.id === id);
    if (p) { project(p); window.scrollTo(0, 0); }
    else if (id === "services" || id === "contact") {
      services();
      if (id === "contact") document.getElementById("contact").scrollIntoView(); else window.scrollTo(0, 0);
    }
    else {
      home();
      if (["work", "about", "story", "examples"].includes(id)) document.getElementById(id)?.scrollIntoView();
      else window.scrollTo(0, 0);
    }
  }

  document.getElementById("foot").innerHTML = `<div class="wrap foot-grid">
    <div class="foot-brand">${MARK(54, "currentColor")}<div><b>Backcourt</b><span>The tools behind your team</span></div></div>
    <div><b>Contact</b><span>${esc(ME.email)}</span><span>${esc(ME.city)}</span></div>
    <div><b>Follow</b><a href="${ME.linkedin}">LinkedIn</a><a href="${ME.github}">GitHub</a></div>
    <div class="foot-legal">© ${new Date().getFullYear()} Backcourt · Marta Neira. Demo data on this site is fictional (${esc(D.LEAGUE.name)}).</div>
  </div>`;
  document.getElementById("brand").innerHTML = `${MARK(40, "currentColor")}<span>Back<i>court</i></span>`;
  window.addEventListener("hashchange", route);
  route();
})();
