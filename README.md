# MedTrack API

A small Express + SQLite REST API for tracking patient medication schedules.
Built as the target application for a Jenkins CI/CD/DevSecOps pipeline
(SIT223/SIT753 Task 7.3HD). The application itself is intentionally simple —
the Jenkins pipeline built around it is the graded artefact.

## Endpoints

| Method | Path                    | Operation | Description                    |
|--------|-------------------------|-----------|---------------------------------|
| POST   | /api/medications        | Create    | Add a new medication entry     |
| GET    | /api/medications        | Read      | List all medication entries    |
| GET    | /api/medications/:id    | Read      | Get a single entry by id       |
| PUT    | /api/medications/:id    | Update    | Update an existing entry       |
| DELETE | /api/medications/:id    | Delete    | Remove an entry                |
| GET    | /health                 | —         | Health check (for monitoring)  |

## Run locally

```
npm install
npm start
```

Server listens on port 3000 by default (set `PORT` to override).

## Test

```
npm test
```

## Environment variables

- `PORT` — port to listen on (default 3000)
- `DB_PATH` — path to the SQLite database file (default `./medtrack.db`)
- `APP_VERSION` — reported by `GET /`, set by the pipeline at build time
