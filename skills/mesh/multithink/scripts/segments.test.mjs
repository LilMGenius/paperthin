import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Every case calls the CLI through a junction to this folder, the way an installed skill runs it.
function linked(body) {
  const root = mkdtempSync(join(tmpdir(), 'segments-'));
  const link = join(root, 'scripts');
  symlinkSync(here, link, process.platform === 'win32' ? 'junction' : 'dir');
  const cli = (...args) => spawnSync(process.execPath, [join(link, 'segments.mjs'), ...args], { encoding: 'utf8' });
  try {
    body(root, cli);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const crlfBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('first line\r\nsecond line\r\n\r\n  trailing spaces  \r\nno newline at end', 'utf8')]);
const plain = Buffer.from('a read with LF\nand a tab\there\n', 'utf8');

function packTwo(root, cli) {
  const a = join(root, 'a.md');
  const b = join(root, 'b.md');
  writeFileSync(a, crlfBom);
  writeFileSync(b, plain);
  const out = join(root, 'report.md');
  const packed = cli('pack', out, a, b);
  assert.equal(packed.status, 0, packed.stderr);
  return { a, b, out, index: out + '.index.json' };
}

test('CRLF, a UTF-8 BOM and a missing final newline survive byte-identical', () => {
  linked((root, cli) => {
    const { a, b, out, index } = packTwo(root, cli);
    const report = readFileSync(out);
    const { segments } = JSON.parse(readFileSync(index, 'utf8'));
    assert.deepEqual(segments.map((s) => [s.source, s.label, s.length]), [[a, 'round0-1', crlfBom.length], [b, 'round0-2', plain.length]]);
    assert.ok(report.subarray(segments[0].offset, segments[0].offset + segments[0].length).equals(crlfBom));
    assert.ok(report.subarray(segments[1].offset, segments[1].offset + segments[1].length).equals(plain));
    const ok = cli('verify', out, index, a, b);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /SEGMENTS GREEN 2/);
    assert.equal(cli('verify', out, index).status, 0);
  });
});

test('a one-byte edit in the report fails verify and names the segment', () => {
  linked((root, cli) => {
    const { a, b, out, index } = packTwo(root, cli);
    const report = readFileSync(out);
    const second = JSON.parse(readFileSync(index, 'utf8')).segments[1];
    report[second.offset + 2] ^= 0x01;
    writeFileSync(out, report);
    const red = cli('verify', out, index, a, b);
    assert.equal(red.status, 1);
    assert.match(red.stderr, /MISMATCH round0-2 .*sha256 differs/);
    assert.doesNotMatch(red.stderr, /round0-1/);
  });
});

test('a segment whose digest matches the index but not the given original fails', () => {
  linked((root, cli) => {
    const { b, out, index } = packTwo(root, cli);
    const red = cli('verify', out, index, b, b);
    assert.equal(red.status, 1);
    assert.match(red.stderr, /MISMATCH round0-1 .*bytes differ from/);
  });
});

test('usage errors and unreadable inputs exit 2', () => {
  linked((root, cli) => {
    const { a, out, index } = packTwo(root, cli);
    assert.equal(cli().status, 2);
    assert.equal(cli('merge', out, a).status, 2);
    assert.equal(cli('pack', out).status, 2);
    assert.equal(cli('pack', join(root, 'again.md'), join(root, 'absent.md')).status, 2);
    assert.equal(cli('verify', out).status, 2);
    writeFileSync(join(root, 'bad.json'), '{ not json');
    assert.equal(cli('verify', out, join(root, 'bad.json')).status, 2);
    assert.equal(cli('verify', out, index, a).status, 2);
  });
});
