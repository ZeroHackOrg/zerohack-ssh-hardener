<div align="center">

```
 ____________ _____   ____  _    _          _____ _  __
|___  /  ____|  __ \ / __ \| |  | |   /\   / ____| |/ /
   / /| |__  | |__) | |  | | |__| |  /  \ | |    | ' / 
  / / |  __| |  _  /| |  | |  __  | / /\ \| |    |  <  
 / /__| |____| | \ \| |__| | |  | |/ ____ \ |____| . \ 
/_____|______|_|  \_\____/|_|  |_/_/    \_\_____|_|\_\

              Fortifying the Digital Frontier
```

# @zerohack/ssh-hardener · `zh-ssh`

**Audit sshd_config and generate hardened configs — CIS best practice**

[![License](https://img.shields.io/badge/license-Apache--2.0-00B0BD?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](tsconfig.json)
[![Zero Budget](https://img.shields.io/badge/cost-%240-00b894?style=for-the-badge)](https://zerohack.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00B0BD?style=for-the-badge)](CONTRIBUTING.md)

**Part of the [ZeroHack](https://zerohack.org) Geek Tools ecosystem**
Category: `devsecops` · `ssh` · `hardening` · `cis` · `audit`

</div>

---

> **⚡ Zero Budget. Zero Cloud Dependencies. Pure Local Power.**

---

## What It Does

Audits an existing `sshd_config` against a 21-directive best-practice
checklist and generates a hardened config. Pure, deterministic, no daemons
touched — you run the CLI where you want, point it at a file, and copy the
result.

---

## Quick Start

### Standalone

```bash
git clone https://github.com/ZeroHackOrg/zerohack-ssh-hardener.git
cd zerohack-ssh-hardener && npm install
npx tsx src/bin.ts audit /etc/ssh/sshd_config
```

### Standalone Resolution

```bash
git clone https://github.com/ZeroHackOrg/zerohack-shared.git
cd zerohack-shared && npm install && npm link
cd ../zerohack-ssh-hardener && npm link @zerohack/shared
```

---

## Commands

| Command | Description |
|---|---|
| `zh-ssh template` | Print the full hardened `sshd_config` |
| `zh-ssh audit <path> [--json]` | Table of weak / missing / ok directives + compliance % |
| `zh-ssh harden <path> [--out <path>] [--json]` | Render hardened config; write file with `--out`, else stdout |

`audit` accepts `-j, --json`.

---

## Library API

```ts
import { HARDENED, parseConfig, audit, renderHardened, renderEntries } from "@zerohack/ssh-hardener";

audit("PermitRootLogin yes\nPort 22");
// { missing: [...], weak: [{ key: "PermitRootLogin", value: "yes" }], ok: ["Port"] }

renderHardened();                    // full hardened text
renderHardened(existingConfig);      // hardened + non-conflicting keys
parseConfig(text);                   // [{ key, value?, line }]
```

- `HARDENED` — readonly `{ key, value, comment }[]` (21 directives).
- `audit` checks every directive against the raw text: missing = absent,
  weak = present with a non-hardened value, ok = matches exactly.
- `renderHardened(existing)` reapplies the hardened block and preserves
  any non-conflicting custom directives (e.g. `Banner`, `AllowUsers`).

---

## Env

None — all tools are zero-dependency, zero-config, and run offline.

---

## Tests

```bash
npm run typecheck --workspace @zerohack/ssh-hardener
npm run test    --workspace @zerohack/ssh-hardener
```

Zero I/O in the core — `parseConfig`/`audit`/`renderHardened` are pure.
File reads/writes live only in `bin.ts`. Compliance % =
`ok.length / HARDENED.length`.

---

## Architecture

```
zerohack-ssh-hardener/
├── src/
│   ├── bin.ts          # CLI entrypoint (commander)
│   ├── index.ts        # Re-exports
│   └── config.ts       # HARDENED list, parseConfig, audit, renderHardened
├── test/
│   └── config.test.ts  # Unit tests (vitest)
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE             # Apache-2.0
├── SECURITY.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

**Design principles:**
- Pure core: parsing + audit + rendering have zero I/O.
- Deterministic: same input → same config, same output.
- Uses `table` from `@zerohack/shared` for CLI output.
- Zero runtime dependencies on any cloud service.

---

## Security

Does not modify any system files unless you explicitly use `--out` to write a
hardened config. Never starts or restarts the SSH daemon. Read-only audit by
default.

For vulnerability reports, see [SECURITY.md](SECURITY.md).

---

## Related Packages

| Package | Binary | What It Does |
|---|---|---|
| [@zerohack/shared](https://github.com/ZeroHackOrg/zerohack-shared) | — | Types, schemas, catalog |
| [@zerohack/cli](https://github.com/ZeroHackOrg/zerohack-cli) | `zh` | Unified CLI |
| [@zerohack/supalite-api](https://github.com/ZeroHackOrg/zerohack-supalite-api) | `zh-api` | PostgREST API |
| [@zerohack/pal](https://github.com/ZeroHackOrg/zerohack-pal) | `zh-pal` | Local AI assistant |
| [@zerohack/honeypot](https://github.com/ZeroHackOrg/zerohack-honeypot) | `zh-honeypot` | Honeypot |
| [@zerohack/osint-cli](https://github.com/ZeroHackOrg/zerohack-osint-cli) | `zh-osint` | OSINT tools |
| [@zerohack/secret-scanner](https://github.com/ZeroHackOrg/zerohack-secret-scanner) | `zh-secret` | Secret scanner |
| [@zerohack/recon-bot](https://github.com/ZeroHackOrg/zerohack-recon-bot) | `zh-recon` | Recon automation |
| [@zerohack/log-analyzer](https://github.com/ZeroHackOrg/zerohack-log-analyzer) | `zh-log` | Log forensics |
| [@zerohack/ctf-lab](https://github.com/ZeroHackOrg/zerohack-ctf-lab) | `zh-lab` | CTF lab runner |
| [@zerohack/ctf-automation](https://github.com/ZeroHackOrg/zerohack-ctf-automation) | `zh-ctf` | CTF solver |
---

## Community

- **Issues:** [GitHub Issues](https://github.com/ZeroHackOrg/zerohack-ssh-hardener/issues)
- **PRs:** [Pull Requests](https://github.com/ZeroHackOrg/zerohack-ssh-hardener/pulls)
- **Security:** [SECURITY.md](SECURITY.md)
- **Platform:** [zerohack.org](https://zerohack.org)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Read our [Code of Conduct](CODE_OF_CONDUCT.md) first.

## License

[Apache-2.0](LICENSE) — Copyright 2026 ZeroHack Security