# Nora & Osiris OpenClaw PRD

Status: Draft
Owner: Nora, with Daniel and Osiris supporting
Last updated: 2026-07-20

## Summary

Nora & Osiris OpenClaw is an open-source, self-hostable assistant workspace for building and operating practical personal-agent workflows. The project should make it easier to turn Nora's goals, preferences, and recurring needs into reliable local tools, while keeping private memory, secrets, and runtime state out of the public repository.

This PRD captures the initial project goals from the current Nora & Osiris OpenClaw discussion. It is intentionally lightweight until Nora reviews and adds direct product input.

## Goals

- Provide a usable web UI for managing assistant workflows, project context, and task status.
- Provide a reliable backend service for local orchestration, GitHub-backed project work, and future integrations.
- Keep security, privacy, and source hygiene central from the beginning.
- Make the project understandable and welcoming as an AGPL-licensed OSS project.
- Preserve clear separation between public source code and private OpenClaw workspace data.

## Non-Goals

- Do not publish private OpenClaw workspace memory, credentials, logs, generated transcripts, or runtime configuration.
- Do not build a general SaaS platform before the local/self-hosted experience is solid.
- Do not commit to a specific external model provider as a hard dependency in v0.
- Do not treat GitHub issues as the long-term source of truth for product requirements; issues should track discussion and implementation.

## Intended Users

- Nora, as the primary product stakeholder and day-to-day user.
- Daniel and trusted collaborators, as maintainers and contributors.
- Technical OSS users who want a self-hostable assistant workspace with strong privacy boundaries.

## Product Principles

- Local-first where practical: private state should stay local unless explicitly shared.
- Transparent by default: workflows, decisions, and automation should be inspectable.
- Small reliable loops: prefer simple workflows that complete correctly over broad automation that is hard to trust.
- Secure contribution path: default repository settings should help prevent accidental secret exposure and unsafe changes.
- Human-in-the-loop for sensitive actions: repository, credential, messaging, and deployment operations should be reviewable.

## Recommended Architecture

The initial implementation should follow the TypeScript UI + Go backend direction.

### Frontend

- Use TypeScript for the user interface.
- Prefer a modern component-based web stack.
- Keep the first screen focused on the actual workspace experience rather than a marketing landing page.
- Prioritize dense, calm, operational UI for reviewing tasks, context, and workflow state.

### Backend

- Use Go for the backend service.
- Expose a small, documented HTTP API for the UI.
- Keep integration boundaries explicit for GitHub, local filesystem workspaces, scheduled jobs, and future connector support.
- Treat secrets and private workspace state as local runtime concerns, not repository content.

### Repository Shape

Expected initial layout:

```text
apps/web/        TypeScript UI
services/api/    Go backend service
docs/            Product, architecture, and security docs
scripts/         Development and maintenance scripts
```

This layout can change once the first implementation PR lands, but the repo should avoid mixing source code with local OpenClaw runtime state.

## Core Workflows

### Project Goals Review

Nora and maintainers should be able to read a concise project-goals document, discuss changes in issues or PRs, and merge updates through normal review.

Acceptance criteria:

- A canonical PRD lives in `docs/PRD.md`.
- Draft product questions are tracked in a GitHub issue.
- Changes to the PRD happen through pull requests.

### Local Workspace Safety

Contributors should be able to work locally without accidentally publishing private OpenClaw state.

Acceptance criteria:

- `.gitignore` excludes common secret, log, transcript, and OpenClaw runtime paths.
- Documentation warns against copying the parent workspace wholesale.
- Security reporting guidance exists before external users are invited.

### Assistant Workflow Dashboard

Nora should eventually have a UI that shows active tasks, status, recent outcomes, and required follow-up.

Acceptance criteria:

- UI can display a list of workflows/tasks with status.
- UI can show a detail view for a selected workflow/task.
- Backend provides task/status data through a typed API.
- Sensitive actions are visibly marked and require confirmation where appropriate.

### GitHub-Backed Project Work

Maintainers should be able to use GitHub issues and PRs to coordinate public project work.

Acceptance criteria:

- Product discussions are captured in issues.
- Implementation lands through PRs.
- Admin/collaborator and branch-protection decisions are documented.
- PRs and issue comments made by the assistant include an `Agent: Nora` footer.

## Security and Privacy Requirements

- Never commit real secrets, private keys, API tokens, personal memory, local logs, or generated conversation transcripts.
- Keep `.env` files local; commit only `.env.example`.
- Prefer least-privilege tokens and explicit permission boundaries.
- Require review for changes to authentication, authorization, secrets handling, deployment, and messaging flows.
- Preserve AGPL-3.0-or-later licensing for project contributions.
- Keep private vulnerability reporting enabled on GitHub.

## Open Questions for Nora

- What are the first three assistant workflows that would make this project immediately useful?
- Should the first UI be a task dashboard, a memory/context editor, a workflow builder, or a message review queue?
- What should the assistant be allowed to do automatically, and what should always require confirmation?
- Who is the first non-maintainer audience for the OSS version?
- What should be explicitly out of scope for v0?

## v0 Success Criteria

- The project has a reviewed PRD and an issue thread for Nora's follow-up input.
- The repository has a TypeScript UI skeleton and Go backend skeleton.
- Local development can run with one documented command or a short set of commands.
- The first workflow can be demonstrated end-to-end using non-private sample data.
- Security and privacy boundaries are documented and enforced by repository defaults where possible.

## Source of Truth

This document is the canonical PRD. GitHub issues should be used for discussion, questions, and implementation tracking. When decisions are made in issues or PRs, update this document so future contributors can understand the current product direction without reading the entire discussion history.
