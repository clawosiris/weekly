# Weekly

This repository is a clean, public-ready home for Weekly, Nora's planner and
checklist dashboard project.

The original OpenClaw workspace contains private assistant memory, credentials, local runtime state, and generated logs. Do not copy workspace contents into this repository without reviewing them first.

## Status

Initial repository scaffold with a static dashboard prototype and product draft.

## Dashboard Concept

- [Product requirements](docs/weekly-dashboard/PRD.md)
- [Original UI sketch](docs/weekly-dashboard/ui-sketch.html)
- [Static prototype](prototype/weekly-dashboard/index.html)

## Product Goals

The draft product requirements live in [docs/PRD.md](docs/PRD.md). GitHub issues should capture discussion and open questions; accepted decisions should be reflected back into the PRD.

## Wildlife Mascot and Reminders

The prototype rotates through a different animal beginning with **W** each week. The mascot appears on the animated opening screen, dashboard, browser icon, and task reminders. Conservation figures are labeled as estimates because populations change and some species do not have a reliable global count.

Reminder times are editable per task under **Reminders**. Browser notifications require permission and work while the web app is open or recently active. Exact closed-app alarms and automatic replacement of an already-installed home-screen icon require a native Android app or a push-notification service; the browser tab icon and in-app mascot still rotate automatically.

## License

This project is licensed under the GNU Affero General Public License version 3 or any later version. See [LICENSE](LICENSE).

## Security

Please report vulnerabilities privately using the process in [SECURITY.md](SECURITY.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.
