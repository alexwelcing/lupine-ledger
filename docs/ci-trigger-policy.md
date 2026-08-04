# CI trigger policy

The August 2026 CI-noise audit found no trigger to prune. The single workflow runs verification only for relevant pull-request and `main`-push paths. Its deploy job is skipped on pull requests and runs only for an explicit dispatch or a relevant push to `main`, so validation and credentialed deployment are not duplicated.

Keep deployment conditions at job level in this combined workflow: pull requests need the same fail-closed content and ontology verification, but must not receive deployment credentials.
