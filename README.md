# E-Register Dashboard

E-Register is a digital member and yearly-record management application. It is intended to make member information, year-wise entries, collections, and expenses easier to maintain than paper registers.

The project currently contains a React + TypeScript frontend and an Electron desktop shell. It is under development; the frontend uses example data and local storage, and there is no backend, database, or authentication system yet.

## Technology

- React 19 and TypeScript
- Vite 8 for frontend development and builds
- Electron for the Windows desktop application
- Electron Builder with NSIS for the Windows installer
- npm (`package-lock.json`) for dependency installation

## Features

- Dashboard with shortcuts to application sections
- Member list and member profile management
- Year Wise List for browsing and adding year-based member entries
- Expenses & Collection page with yearly summaries, period filtering, search, and expense editing
- Responsive React interface shared between the desktop app and web development preview

## Requirements

- Windows for Windows installer generation and installation testing
- Node.js 22 or newer and npm

## Development

Install dependencies:

```sh
npm install
```

Run the app in a desktop window:

```sh
npm run dev
```

This builds the Electron main and preload scripts, starts Vite at `http://127.0.0.1:5173`, waits for the server, and opens Electron. Developer tools are enabled only in development. Running the command a second time focuses the existing application instance.

To run only the web frontend in a browser, use:

```sh
npm run web
```

Vite uses port `8443` by default for this command; the Electron development script explicitly uses port `5173`.

## Production build

Build the frontend and Electron scripts:

```sh
npm run build
```

The Vite frontend is written to `dist/`, and the bundled Electron main/preload scripts are written to `dist-electron/`. In production, Electron loads the frontend from the packaged local files; it does not depend on Vite, npm, a browser, or a running development server.

## Windows packaging and installation

Generate the Windows NSIS installer:

```sh
npm run package
```

The installer is written to:

```text
release/E-Register-Dashboard-Setup-1.0.0.exe
```

Double-click the installer and follow its prompts. The installer provides a Desktop shortcut option, adds an E-Register Dashboard shortcut to the Start Menu, and offers to launch the application after installation. The installed app is launched from its shortcut like a normal Windows application.

The configured Windows product name is **E-Register Dashboard**, with version **1.0.0**. Update `version` in `package.json` when preparing a new release.

## Application icon

The Windows icon files are:

- `assets/icons/icon.ico` — used by Electron Builder for the Windows application and installer
- `assets/icons/icon.png` — PNG artwork/source

The current icon is a generic document placeholder. Replace `assets/icons/icon.ico` with the approved square Windows icon before publishing; include a 256 × 256 image for best Windows display quality.

## Architecture

```text
Windows
  ↓
Electron desktop shell (electron/)
  ↓
React + TypeScript frontend (src/)
  ↓
Future API service
  ↓
Future database (SQLite initially; not included)
```

Electron uses context isolation, disables Node.js integration in the renderer, and exposes only a small app-version API from its preload script. Application navigation uses hash-based routes in Electron so it works with packaged local files; browser preview uses the existing browser router. Future frontend API communication belongs in `src/services/`.

No backend or database is implemented. Expense examples are stored in local storage for demonstration. Configure only a public API URL in a local `.env` file via `VITE_API_BASE_URL`; `.env` files are ignored by git. Do not put passwords, API keys, or other secrets in `VITE_` variables, because Vite embeds those values in the frontend.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Run Vite and the Electron development window |
| `npm run web` | Run only the web frontend |
| `npm run typecheck` | Type-check the frontend and Electron code |
| `npm run build` | Build the production frontend and Electron scripts |
| `npm run package` | Build the Windows NSIS installer in `release/` |

## Project status

The desktop packaging workflow is configured for Windows. Backend services, SQLite persistence, authentication, and production signing are future work.

## Developer

Harsh Verma

B.Tech CSE Student, SVVV, Indore
