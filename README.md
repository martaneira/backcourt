# Backcourt

**The tools behind your team.** Backcourt is Marta Neira's web and data studio in Barcelona: websites and custom web apps that replace spreadsheets, forms and email chasing.

This repository is the studio website: five example websites for different industries (restaurant, school, foundation, family business, clinic), each with a working tool, and six case studies from professional sport with live demos.

**Live site:** https://martaneira.github.io

| # | Project | What it shows |
|---|---|---|
| 01 | Referee Explorer | 26 seasons of referee assignments, filters, head-to-head mode |
| 02 | Game Kit | Automated weekly game notes; edit and present them |
| 03 | Security Report | Club reports, completion grid, team stats |
| 04 | Delegates | Delegate reports split by department, incident emails |
| 05 | Injury Board | Availability only, decided on the server (privacy by design) |
| 06 | Coaching Insights | Two-lens player comparison and a simulated live game |

The site also has a **Services** page (`#services`) for freelance web projects.

## About the data

Every demo runs on the **Atlas Basketball League**, a fictional league generated in the
browser from a fixed seed (`js/data.js`). No real club, player, referee or medical data is used.
The code excerpts on each page are rewritten for this portfolio; the production code belongs to my employer.

## Structure

```
index.html        page shell
img/              photos and favicon
examples/         five demo websites for fictional businesses
css/styles.css    design tokens, light and dark theme
js/data.js        fictional league generator (seeded, reproducible)
js/content.js     project texts and code excerpts
js/demos.js       the six interactive demos
js/app.js         home page, project pages, hash routing
```

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```powershell
python -m http.server 8000
```

Then open http://localhost:8000.
