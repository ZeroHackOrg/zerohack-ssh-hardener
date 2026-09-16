import { describe, expect, it } from "vitest";
import { HARDENED, audit, parseConfig, renderEntries, renderHardened } from "../src/config.ts";

const FULL = renderHardened();

describe("HARDENED", () => {
  it("contains all 21 best-practice directives", () => {
    expect(HARDENED.map((d) => `${d.key} ${d.value}`)).toEqual([
      "PermitRootLogin no",
      "PasswordAuthentication no",
      "KbdInteractiveAuthentication no",
      "ChallengeResponseAuthentication no",
      "PubkeyAuthentication yes",
      "AuthorizedKeysFile .ssh/authorized_keys",
      "X11Forwarding no",
      "AllowAgentForwarding no",
      "AllowTcpForwarding no",
      "PermitEmptyPasswords no",
      "MaxAuthTries 3",
      "MaxSessions 4",
      "LoginGraceTime 30",
      "ClientAliveInterval 300",
      "ClientAliveCountMax 2",
      "TCPKeepAlive no",
      "UsePAM yes",
      "Protocol 2",
      "Port 22",
      "LogLevel VERBOSE",
      "Subsystem sftp internal-sftp",
    ]);
  });
});

describe("parseConfig", () => {
  const sample = "# auto-generated header\nPermitRootLogin no\nPort 22\nBanner /etc/issue.net"; // no blank lines

  it("parses directives with line numbers", () => {
    const entries = parseConfig(sample);
    expect(entries).toEqual([
      { key: "#", value: " auto-generated header", line: 1 },
      { key: "PermitRootLogin", value: "no", line: 2 },
      { key: "Port", value: "22", line: 3 },
      { key: "Banner", value: "/etc/issue.net", line: 4 },
    ]);
  });

  it("round-trips through renderEntries", () => {
    expect(renderEntries(parseConfig(sample))).toBe(sample);
    expect(renderEntries(parseConfig("Subsystem sftp internal-sftp"))).toBe("Subsystem sftp internal-sftp");
  });

  it("skips blank lines and parses bare keys", () => {
    const entries = parseConfig("\n\nPort 22\n\nProtocol 2\n");
    expect(entries.map((e) => e.key)).toEqual(["Port", "Protocol"]);
    const bare = parseConfig("RekeyLimit");
    expect(bare[0]).toMatchObject({ key: "RekeyLimit", value: undefined });
  });
});

describe("audit", () => {
  it("flags deliberately weak settings", () => {
    const r = audit("PermitRootLogin yes\nPasswordAuthentication yes\nPort 22");
    expect(r.weak).toContainEqual({ key: "PermitRootLogin", value: "yes" });
    expect(r.weak).toContainEqual({ key: "PasswordAuthentication", value: "yes" });
    expect(r.ok).toContain("Port");
  });

  it("reports every directive in an empty config as missing", () => {
    const r = audit("");
    expect(r.missing.length).toBe(HARDENED.length);
    expect(r.missing).toContain("PermitRootLogin");
    expect(r.missing).toContain("PasswordAuthentication");
    expect(r.missing).toContain("KbdInteractiveAuthentication");
    expect(r.ok).toEqual([]);
    expect(r.weak).toEqual([]);
  });

  it("passes a fully hardened config", () => {
    const r = audit(FULL);
    expect(r.missing).toEqual([]);
    expect(r.weak).toEqual([]);
    expect(r.ok).toHaveLength(HARDENED.length);
  });

  it("flags multi-word directives (Subsystem sftp)", () => {
    const r = audit("Subsystem sftp uuc");
    expect(r.weak).toContainEqual({ key: "Subsystem sftp", value: "uuc" });
    const ok = audit("Subsystem sftp internal-sftp");
    expect(ok.ok).toContain("Subsystem sftp");
  });
});

describe("renderHardened", () => {
  it("matches HARDENED line-for-line", () => {
    const lines = FULL.split("\n");
    for (const d of HARDENED) {
      expect(lines).toContain(`${d.key} ${d.value}`);
    }
  });

  it("carries over non-conflicting keys from the existing config", () => {
    const out = renderHardened("# hi\nBanner /etc/issue.net\nPort 22\nPermitRootLogin yes\nAllowUsers admin\n");
    expect(out).toContain("Banner /etc/issue.net");
    expect(out).toContain("AllowUsers admin");
    expect(out).not.toMatch(/^PermitRootLogin yes$/m);
    expect(out).toContain("PermitRootLogin no");
    expect(out.match(/^Port 22$/m)).toHaveLength(1); // existing dropped as conflicting, hardened provides it once
    expect(audit(out).ok).toHaveLength(HARDENED.length);
  });

  it("emits an empty hardened block without an existing config", () => {
    const out = renderHardened();
    expect(out).toMatch(/^PermitRootLogin no$/m);
    expect(out.endsWith("\n")).toBe(true);
  });
});