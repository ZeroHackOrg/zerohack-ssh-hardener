#!/usr/bin/env node
/** zh-ssh — audit and generate a hardened sshd_config against a best-practice checklist. */

import { readFile, writeFile } from "node:fs/promises";
import { Command } from "commander";
import { table } from "@zerohack/shared";
import { HARDENED, audit, renderHardened } from "./config.ts";

const program = new Command();

program
  .name("zh-ssh")
  .description("Audit and generate hardened sshd_config from a best-practice checklist with a compliance score.")
  .version("0.1.0", "-v, --version")
  .showHelpAfterError();

const expectedOf = (key: string): string => HARDENED.find((d) => d.key === key)?.value ?? "?";
const compliance = (a: { ok: string[]; weak: { key: string; value: string }[]; missing: string[] }): string =>
  `${Math.round((a.ok.length / HARDENED.length) * 100)}%`;

program
  .command("template")
  .description("print the full hardened sshd_config to stdout")
  .action(() => {
    process.stdout.write(renderHardened());
  });

program
  .command("audit <path>")
  .description("read a sshd_config and print weak/missing/ok checks plus compliance")
  .option("-j, --json", "print JSON")
  .action(async (path: string, opts: { json?: boolean }) => {
    const text = await readFile(path, "utf8");
    const result = audit(text);
    if (opts.json) {
      console.log(JSON.stringify({ compliance: compliance(result), ...result }, null, 2));
      return;
    }
    console.log(`[zh-ssh] compliance: ${compliance(result)} (${result.ok.length}/${HARDENED.length} directives hardened)`);
    if (result.weak.length) {
      console.log(`[zh-ssh] weak (${result.weak.length})`);
      console.log(
        table({
          headers: ["directive", "found", "expected"],
          rows: result.weak.map((w) => [w.key, w.value, expectedOf(w.key)]),
        })
      );
    }
    if (result.missing.length) {
      console.log(`[zh-ssh] missing (${result.missing.length})`);
      console.log(
        table({
          headers: ["directive", "expected"],
          rows: result.missing.map((key) => [key, expectedOf(key)]),
        })
      );
    }
    if (result.ok.length) {
      console.log(`[zh-ssh] ok (${result.ok.length})`);
      console.log(
        table({
          headers: ["directive", "value"],
          rows: result.ok.map((key) => [key, expectedOf(key)]),
        })
      );
    }
  });

program
  .command("harden <path>")
  .description("render the hardened config; write it with --out (else print to stdout)")
  .option("--out <path>", "write the hardened config to this file")
  .option("-j, --json", "print JSON")
  .action(async (path: string, opts: { out?: string; json?: boolean }) => {
    const text = await readFile(path, "utf8");
    const rendered = renderHardened(text);
    if (opts.json) {
      console.log(JSON.stringify({ out: opts.out ?? null, bytes: rendered.length }, null, 2));
      return;
    }
    if (opts.out) {
      await writeFile(opts.out, rendered, "utf8");
      console.log(`[zh-ssh] wrote ${rendered.length} bytes to ${opts.out}`);
      return;
    }
    process.stdout.write(rendered);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(`zh-ssh: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});