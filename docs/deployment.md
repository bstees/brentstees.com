# Production deployment

The existing `CI` workflow verifies digest content, builds the site and runs the
full Playwright suite. A successful **push to main** (including a merged PR)
then deploys the verified build to the existing Cloudflare Worker
`brentstees-com`, serving `brentstees.com` and `www.brentstees.com`.
Pull requests and other branches never deploy or receive Cloudflare credentials.
Direct pushes to main deploy too; use repository branch rules if merges must be
the only way to update main. This change does not modify branch rules.

## One-time credentials

In this repository's **Settings → Secrets and variables → Actions**, configure:

- `CLOUDFLARE_API_TOKEN`: a dedicated Cloudflare API token for this deployment.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account containing the existing Worker.

Create the token using Cloudflare's **Edit Cloudflare Workers** template, scoped
to the specific account and `brentstees.com` zone, not all accounts/zones. Review
its permissions before accepting them. Never use a Global API Key or commit a
token. Store values directly in GitHub's secret editor, not chat, source files,
workflow inputs or logs. Rotate/revoke through Cloudflare and update GitHub when
necessary. The workflow only injects these secrets into the deployment step.

Reference: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

The connector used to author this workflow cannot list or set Actions secrets.
Their presence and Cloudflare authorization must be verified by an actual
successful main-branch run. A missing credential fails closed with a setup error.

## Verification and recovery

- The deployment job downloads the same run's verified `dist` artifact, checks out
  the exact commit and uses the lockfile-pinned Wrangler. It does not rebuild it.
- Production deployments are serialized and are not canceled mid-upload. A run
  whose commit is no longer main is skipped before uploading.
- A small public `/deployment.json` exposes only the Git commit SHA. The smoke
  check requires that exact SHA, a working homepage, a real 404, and the www
  redirect. A green build alone does not establish a successful deployment.
- If credentials were missing, add them and use **Actions → CI → Run workflow →
  main**. This reruns all checks; dispatches against other branches do not deploy.
- If verification fails after Wrangler succeeds, the site may already have
  changed. Inspect Cloudflare's deployment and the live site before retrying.
- To roll back code, revert the offending commit through a reviewed PR to main;
  the resulting verified commit deploys normally. No automatic rollback is done.

Do not enable a second Cloudflare Git build integration for the same Worker:
that could race this pipeline or bypass its verification gate. Local emergency
`npm run deploy` remains available to authenticated maintainers, but does not
provide this workflow's verification guarantees.
