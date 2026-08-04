# CI trigger policy

The August 2026 CI-noise audit pruned root `docs/**` and `README.md` from the `main`-push trigger because those files do not change the Pages artifact. Pull requests that edit them still run verification, while credentialed deployment runs only for an explicit dispatch or a push that changes deployable content, source, build tooling, or deployment configuration.

Keep deployment conditions at job level in this combined workflow: pull requests need the same fail-closed content and ontology verification, but must not receive deployment credentials.
