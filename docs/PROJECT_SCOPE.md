# Project Scope

This repository was created as a clean public-ready scaffold.

Do not import the parent OpenClaw workspace wholesale. It contains private data and runtime state, including assistant memory, secrets, authentication files, generated logs, and local configuration.

When adding source code:

1. Start from a reviewed file list.
2. Exclude private runtime state and credentials.
3. Preserve license headers where present.
4. Add tests and CI for the imported language stack.
5. Update README setup instructions.
