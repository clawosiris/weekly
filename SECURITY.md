# Security Policy

## Supported Versions

Security fixes are accepted for the default branch unless maintainers publish a more specific support policy.

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues.

Contact the maintainers privately through GitHub Security Advisories after the repository is published. Until that is available, contact a project maintainer directly.

Please include:

- A description of the vulnerability and impact.
- Steps to reproduce or a proof of concept.
- Affected versions, commits, or deployments if known.
- Any suggested mitigation.

Maintainers should acknowledge reports promptly, coordinate fixes privately, and publish an advisory when appropriate.

## Secret Handling

Never commit:

- API keys, OAuth tokens, session cookies, passwords, or private keys.
- OpenClaw runtime state, private assistant memory, local logs, or generated conversation transcripts.
- Production configuration containing hostnames, internal routes, credentials, or personal data.
