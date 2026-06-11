# Security policy

## Supported versions

html-kit is alpha software (v0.x). Only the latest tagged release receives
fixes.

## Reporting a vulnerability

Please **do not** open a public issue for a security problem.

Preferred channel: use GitHub's private
[Security Advisories](https://github.com/nyashkn/html-kit/security/advisories/new)
to report privately.

If that's unavailable, open a minimal public issue asking a maintainer to
make contact — without disclosing details — and we'll follow up.

<!-- TODO: maintainer (KN) — add a direct security contact email here. -->

### Scope notes

- The daemon (`scripts/html-kit-daemon.ts`) binds a local port (**63839**) and
  is intended for **localhost-only** use. Reports about exposure when it is
  deliberately bound to a public interface are out of scope.
- Rendered artifacts are self-contained HTML opened locally; treat any artifact
  generated from untrusted input with the same caution as any untrusted HTML.

Expect an acknowledgement within a few days. Thanks for helping keep html-kit
safe.
