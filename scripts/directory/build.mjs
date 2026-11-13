#!/usr/bin/env node
// Builds the ZIP the OpenAI plugin directory takes (developers.openai.com/plugins/deploy/submission) from one git ref. It
// needs every skill as an immediate child of skills/, a .codex-plugin/plugin.json with an interface block, and no
// lifecycle hooks (plugins/deploy/submission-errors: skill_manifest_nested, plugin_skills_path_unsupported), while this
// repository nests skills as skills/<area>/<skill>. Any skill change needs a new ZIP, so it is rebuilt every release, and
// one ref always gives the same bytes. Anthropic's directory needs no build: it tracks main, whose Validate passes once
// llms-full.txt is gone (paperthin 1.0.1).
//
// Run at release, after the tag is pushed: node scripts/directory/build.mjs --ref vX.Y.Z
// --out-dir <dir> places the ZIP (default .re0/release/directory).
// Identity fields come from .claude-plugin/plugin.json; only the OpenAI listing fields below are written here.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import YAML from "yaml";

const TEST_FILE = /(^|\/)[^/]+\.test\.[^/]+$/;

// A hook that runs this exports GIT_DIR and GIT_INDEX_FILE; drop every inherited GIT_ variable so each call reads -C.
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));

export function reader(repo, ref) {
  const git = (args, env = {}, input) => execFileSync("git", ["-C", repo, ...args], { env: { ...cleanEnv, ...env }, input, maxBuffer: 1 << 28, windowsHide: true });
  const commit = git(["rev-parse", ref + "^{commit}"]).toString().trim();
  const blob = (p) => git(["show", commit + ":" + p]);
  const list = (dir) => git(["ls-tree", "-r", "--name-only", commit, "--", dir]).toString().split("\n").filter(Boolean);
  return { git, commit, blob, list, manifest: JSON.parse(blob(".claude-plugin/plugin.json")) };
}

const skillDirs = (manifest) => manifest.skills.map((dir) => dir.replace(/^\.\//, ""));

// The ZIP's files: every skill flattened to skills/<name>/, its tests dropped, and a generated .codex-plugin manifest.
export function openaiFiles(src) {
  const { manifest, blob, list } = src;
  const problems = [];
  const files = new Map();
  for (const dir of skillDirs(manifest)) {
    const name = dir.split("/").pop();
    const listed = list(dir + "/");
    for (const p of listed) if (!TEST_FILE.test(p)) files.set("skills/" + name + p.slice(dir.length), blob(p));
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(blob(dir + "/SKILL.md").toString());
    const front = fm ? YAML.parse(fm[1]) : {};
    if (front.name !== name) problems.push(name + ": front matter name " + front.name + " differs from its folder");
    if (!front.description || front.description.length > 1024) problems.push(name + ": description missing or over 1024 characters");
    if ((manifest.name + ":" + name).length > 64) problems.push(name + ": plugin:skill identity over 64 characters");
    if (listed.includes(dir + "/agents/openai.yaml")) {
      const y = YAML.parse(blob(dir + "/agents/openai.yaml").toString());
      if (!y?.interface?.display_name || !y?.interface?.short_description) problems.push(name + ": openai.yaml interface needs display_name and short_description");
      for (const k of Object.keys(y?.policy ?? {})) if (!["products", "allow_implicit_invocation"].includes(k)) problems.push(name + ": openai.yaml policy key " + k);
    }
  }
  for (const p of ["README.md", "LICENSE", "NOTICE", manifest.icon.replace(/^\.\//, "")]) files.set(p, blob(p));
  const prompt = (skill) => YAML.parse(blob(skillDirs(manifest).find((s) => s.endsWith("/" + skill)) + "/agents/openai.yaml").toString()).interface.default_prompt;
  const codex = {
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    author: manifest.author,
    homepage: manifest.homepage,
    repository: manifest.repository,
    license: manifest.license,
    keywords: JSON.parse(blob("package.json")).keywords,
    skills: "./skills/",
    interface: {
      displayName: "Paperthin",
      shortDescription: "Agentic design patterns",
      longDescription: manifest.description + "\n\n" + manifest.skills.length + " small skills that clean, check, plan and loop agent work: rewrite a drifted artifact into a clean v0, question requirements before effort goes in, cold-read output from a fresh context, fact-check claims, consolidate scattered facts into one source, and run build, QA and lessons cycles. Type /paperthin, then your goal, and it picks and runs the skills for it. Skills only: no MCP server, no hooks, no telemetry. Three skills ship scripts that read GitHub when run: release checks, an optional update job, and a repository audit through your own gh login.",
      developerName: manifest.author.name,
      category: "Developer Tools",
      capabilities: ["Interactive", "Write"],
      websiteURL: manifest.homepage,
      supportURL: manifest.homepage + "/issues",
      defaultPrompt: [prompt("paperthin"), prompt("re0"), prompt("elon")],
      brandColor: "#161615",
      brandColorDark: "#DFDEDF",
      composerIcon: manifest.icon,
      logo: manifest.icon,
    },
  };
  const i = codex.interface;
  if (!manifest.author?.name || manifest.author.name.length > 80) problems.push("author.name missing or over 80 characters");
  if (i.displayName.length > 30 || i.shortDescription.length > 30) problems.push("displayName and shortDescription must be 30 characters or fewer");
  if (i.longDescription.length > 4000) problems.push("longDescription over 4000 characters");
  for (const p of i.defaultPrompt) if (!p || p.length > 128) problems.push("defaultPrompt over 128 characters: " + p);
  files.set(".codex-plugin/plugin.json", Buffer.from(JSON.stringify(codex, null, 2) + "\n"));
  for (const p of files.keys()) {
    if (p.startsWith("hooks/")) problems.push("not allowed in the ZIP: " + p);
    if (/^skills\/[^/]+\/[^/]+\/SKILL\.md$/.test(p)) problems.push("nested skill: " + p);
  }
  return { files, problems };
}

// A deflated ZIP with every timestamp at 1980-01-01 and entries sorted, so one ref always gives the same bytes.
export function zip(files) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const name of [...files.keys()].sort()) {
    const data = files.get(name);
    const packed = zlib.deflateRawSync(data, { level: 9 });
    const crc = zlib.crc32(data);
    const nameBuf = Buffer.from(name, "utf8");
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6); head.writeUInt16LE(8, 8);
    head.writeUInt16LE(0, 10); head.writeUInt16LE(0x21, 12); head.writeUInt32LE(crc, 14); head.writeUInt32LE(packed.length, 18);
    head.writeUInt32LE(data.length, 22); head.writeUInt16LE(nameBuf.length, 26); head.writeUInt16LE(0, 28);
    locals.push(head, nameBuf, packed);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10);
    cen.writeUInt16LE(0, 12); cen.writeUInt16LE(0x21, 14); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(packed.length, 20); cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt32LE(0, 38); cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += 30 + nameBuf.length + packed.length;
  }
  const cenBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.size, 8); end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(cenBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cenBuf, end]);
}

function main(argv) {
  const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
  const repo = opt("--repo", process.cwd());
  const ref = opt("--ref", "HEAD");
  const src = reader(repo, ref);
  const { files, problems } = openaiFiles(src);
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  const outDir = opt("--out-dir", path.join(repo, ".re0/release/directory"));
  mkdirSync(outDir, { recursive: true });
  const bytes = zip(files);
  const out = path.join(outDir, src.manifest.name + "-" + src.manifest.version + "-openai.zip");
  writeFileSync(out, bytes);
  console.log(JSON.stringify({ ref, source: src.commit, out, files: files.size, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") }));
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
