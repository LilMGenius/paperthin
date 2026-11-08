#!/usr/bin/env node
// Render the re0-decide decision surface from a decisions JSON file: one self-contained HTML file, no network, no build step.
// The agent decides what the instrument contains (which items, tags, citations, quotes, options) and writes it to the JSON file;
// everything fixed lives here: markup, control types, the decider's path, verdict arithmetic, saved answers, copy-out, escaping and the output path.
// Usage: node render.mjs <decisions.json> [--out <file.html>] [--json]
// Exit codes: 0 rendered (or already identical); 2 usage, unreadable input, a schema violation or an unusable image, naming the field;
// 3 a surface adds nothing a chat reply cannot carry (no option image, five decider answers or fewer, no hand-off reader): reply with a numbered list instead.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node render.mjs <decisions.json> [--out <file.html>] [--json]';

export class InputError extends Error {}

export const ANSWERERS = ['artifact', 'submitter', 'delegate', 'decider'];
export const KINDS = ['gate', 'judgment', 'fork', 'intervention', 'exclusion', 'risk', 'missing'];
const CONTROLLED = ['gate', 'judgment', 'fork'];
const MARKS = ['evidenced', 'claim'];
// The page speaks the material's language. The verdict state the page computes is always one of the three rule words; only its shown word changes.
export const STRINGS = {
  en: {
    kind: { gate: 'Gate', judgment: 'Judgment', fork: 'Fork', intervention: 'Human intervention point', exclusion: 'Exclusion', risk: 'Admitted risk', missing: 'Missing criterion' },
    answerer: { artifact: 'artifact', submitter: 'submitter', delegate: 'delegate', decider: 'decider' },
    mark: { evidenced: 'evidenced', claim: 'claim' },
    binary: { gate: ['Met', 'Not met'], judgment: ['Accepted', 'Not accepted'] },
    state: { blocked: 'blocked', conditional: 'conditional', clear: 'clear' },
    heading: 'Decision', material: 'Material: ', verdict: 'Verdict: ', stepOf: '{n} of {total}', options: 'Options',
    blocks: 'If not met, this blocks: ', weigh: 'To weigh: ', leadsTo: 'Leads to: ', defers: 'Defers the decision: the verdict stays open',
    enlarge: 'Enlarge', close: 'Close', fallback: 'Fallback the material gives: ', handling: 'Stated handling: ', says: 'What the material says',
    back: 'Back', next: 'Next', keys: 'Keys: 1 to 9 answer and move on, arrows step, Enter next', open: 'open',
    record: 'Decision record', recordHint: 'copy and hand on', copy: 'Copy record', reset: 'Clear answers', alsoYou: 'Also on you',
    recordRule: 'The verdict is blocked while any gate is not met, conditional while a judgment is not accepted or a fork is unchosen or deferred, and clear otherwise. Which option a fork takes never changes it.',
    others: 'Handled by others: {count} ({groups})', items: (n) => n + ' item' + (n === 1 ? '' : 's'),
    finding: 'Finding: the material leaves every item to the decider; no item could be answered by the artifact, the submitter or a delegate.',
    noscript: 'This page computes its verdict and record in the browser; enable scripts to use it. Every item is listed above.',
    page: {
      answered: '{a} of {t} answered', notMet: '{n} gate(s) not met', forOthers: ', {n} for others to check', open: '{n} open', allIn: 'every answer in',
      notAnswered: '(not answered)', deferred: ' (defers the decision)', openMark: 'open', recordTitle: 'Decision record', material: 'Material: ', verdict: 'Verdict: ',
      answeredLine: 'Answered: {a} of {t} on the decider path', decisions: 'Decisions:', gatesNotMet: 'Gates not met (blocking):', notMetMark: 'not met', notAnsweredMark: 'not answered',
      blocks: 'blocks: ', judgmentsOpen: 'Judgments not accepted (conditions):', weigh: 'weigh: ', forksOpen: 'Forks still open (conditions):', byOthers: 'Answered by others:',
      copied: 'Copied', copyFailed: 'Copy failed: select the record and copy it', kept: 'Answers are kept in this browser across reloads.', notKept: 'This browser does not keep answers: copy the record before closing.',
      confirmReset: 'Clear every answer on this page? Nothing else changes.',
    },
  },
  ko: {
    kind: { gate: '관문', judgment: '판단', fork: '갈림길', intervention: '사람이 나설 자리', exclusion: '승인 밖', risk: '인정한 위험', missing: '빠진 기준' },
    answerer: { artifact: '산출물', submitter: '제출자', delegate: '대리인', decider: '결정자' },
    mark: { evidenced: '근거 있음', claim: '주장' },
    binary: { gate: ['충족', '미충족'], judgment: ['받아들임', '받아들이지 않음'] },
    state: { blocked: '막힘', conditional: '조건부', clear: '통과' },
    heading: '결정', material: '자료: ', verdict: '판정: ', stepOf: '{total}개 중 {n}', options: '선택지',
    blocks: '충족하지 않으면 막는 것: ', weigh: '따져 볼 것: ', leadsTo: '고르면: ', defers: '결정을 미룬다: 판정이 열린 채 남는다',
    enlarge: '크게 보기', close: '닫기', fallback: '자료가 정한 대안: ', handling: '자료가 적은 대응: ', says: '자료 원문',
    back: '이전', next: '다음', keys: '키: 1~9 답하고 다음으로, 화살표로 이동, Enter 다음', open: '미정',
    record: '결정 기록', recordHint: '복사해 넘기기', copy: '기록 복사', reset: '답 지우기', alsoYou: '결정자 몫으로 남은 것',
    recordRule: '관문 하나라도 미충족이면 막힘, 판단을 받아들이지 않았거나 갈림길을 고르지 않았거나 미뤘으면 조건부, 그 밖에는 통과다. 갈림길에서 무엇을 고르는지는 판정을 바꾸지 않는다.',
    others: '다른 사람이 맡은 항목 {count} ({groups})', items: (n) => n + '개',
    finding: '발견: 자료가 모든 항목을 결정자에게 남긴다. 산출물, 제출자, 대리인이 답할 수 있는 항목이 없다.',
    noscript: '이 페이지는 판정과 기록을 브라우저에서 계산한다. 스크립트를 켜야 쓸 수 있고, 모든 항목은 위에 있다.',
    page: {
      answered: '{t}개 중 {a}개 답함', notMet: '미충족 관문 {n}개', forOthers: ', 그중 {n}개는 다른 사람이 확인', open: '열린 것 {n}개', allIn: '모든 답이 들어옴',
      notAnswered: '(답 없음)', deferred: ' (결정을 미룸)', openMark: '미정', recordTitle: '결정 기록', material: '자료: ', verdict: '판정: ',
      answeredLine: '답한 수: 결정자 몫 {t}개 중 {a}개', decisions: '결정:', gatesNotMet: '미충족 관문 (막는 것):', notMetMark: '미충족', notAnsweredMark: '답 없음',
      blocks: '막는 것: ', judgmentsOpen: '받아들이지 않은 판단 (조건):', weigh: '따져 볼 것: ', forksOpen: '아직 열린 갈림길 (조건):', byOthers: '다른 사람이 답한 것:',
      copied: '복사했다', copyFailed: '복사하지 못했다: 기록을 선택해 복사하라', kept: '답은 이 브라우저에 남아 새로 고쳐도 유지된다.', notKept: '이 브라우저는 답을 남기지 않는다: 닫기 전에 기록을 복사하라.',
      confirmReset: '이 페이지의 답을 모두 지울까? 다른 것은 바뀌지 않는다.',
    },
  },
};
export const LANGS = Object.keys(STRINGS);
// A chat reply carries a numbered list of this many answers as well as a page does; past it the page earns its place.
export const CHAT_LIST_MAX = 5;
// An embedded image travels inside the page, so it is downscaled before rendering; past this size the page itself turns heavy.
export const IMAGE_MAX_BYTES = 1024 * 1024;
const IMAGE_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
// Keys each item kind may carry beyond the common ones; anything else is a typo and fails at the boundary.
const COMMON = ['kind', 'text', 'source', 'mark', 'answerer', 'title', 'quote'];
const EXTRA = {
  gate: ['consequence'],
  judgment: ['note'],
  fork: ['options', 'fallback'],
  intervention: [],
  exclusion: [],
  risk: ['handling'],
  missing: [],
};
const OPTION_KEYS = ['label', 'detail', 'consequence', 'image', 'defer'];
// The two answers a gate or judgment takes; neither starts chosen, so an unanswered item reads apart from one answered no.
const BINARY_VALUES = ['met', 'unmet'];

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function reject(field, message) {
  throw new InputError('decisions.' + field + ': ' + message);
}

function onlyKeys(object, allowed, field) {
  for (const key of Object.keys(object)) if (!allowed.includes(key)) reject(field + '.' + key, 'unknown field (allowed: ' + allowed.join(', ') + ')');
}

function requireText(object, key, field) {
  if (!isText(object[key])) reject(field + '.' + key, 'required non-empty string');
}

function optionalText(object, key, field) {
  if (object[key] !== undefined && !isText(object[key])) reject(field + '.' + key, 'must be a non-empty string when present');
}

// An option is a bare label or an object naming its label and what the material says about it.
export const optionOf = (option) => (typeof option === 'string' ? { label: option } : option);
export const quotesOf = (item) => (item.quote === undefined ? [] : [].concat(item.quote));

function validateOption(option, field) {
  if (typeof option === 'string') {
    if (!isText(option)) reject(field, 'must be a non-empty string or an object with a label');
    return;
  }
  if (!isObject(option)) reject(field, 'must be a non-empty string or an object with a label');
  onlyKeys(option, OPTION_KEYS, field);
  requireText(option, 'label', field);
  optionalText(option, 'detail', field);
  optionalText(option, 'consequence', field);
  optionalText(option, 'image', field);
  if (option.image !== undefined && !IMAGE_TYPES[extname(option.image).toLowerCase()]) reject(field + '.image', 'must name a ' + Object.keys(IMAGE_TYPES).join(', ') + ' file');
  if (option.defer !== undefined && option.defer !== true) reject(field + '.defer', 'must be true when present (the option defers the decision)');
}

// Boundary parser: returns the document unchanged when it is well formed, otherwise throws InputError naming the first bad field.
export function validate(doc) {
  if (!isObject(doc)) reject('(root)', 'must be an object');
  onlyKeys(doc, ['material', 'items'], '(root)');
  if (!isObject(doc.material)) reject('material', 'required object');
  onlyKeys(doc.material, ['identity', 'path', 'handoff', 'lang'], 'material');
  if (doc.material.lang !== undefined && !LANGS.includes(doc.material.lang)) reject('material.lang', 'must be one of ' + LANGS.join(', '));
  requireText(doc.material, 'identity', 'material');
  optionalText(doc.material, 'path', 'material');
  optionalText(doc.material, 'handoff', 'material');
  if (!Array.isArray(doc.items) || doc.items.length === 0) reject('items', 'required non-empty array');
  doc.items.forEach((item, i) => {
    const at = 'items[' + i + ']';
    if (!isObject(item)) reject(at, 'must be an object');
    if (!KINDS.includes(item.kind)) reject(at + '.kind', 'must be one of ' + KINDS.join(', '));
    onlyKeys(item, COMMON.concat(EXTRA[item.kind]), at);
    requireText(item, 'text', at);
    requireText(item, 'source', at);
    optionalText(item, 'title', at);
    if (item.quote !== undefined) {
      if (typeof item.quote === 'string') optionalText(item, 'quote', at);
      else if (!Array.isArray(item.quote) || item.quote.length === 0) reject(at + '.quote', 'must be a non-empty string or a non-empty array of strings');
      else item.quote.forEach((line, j) => { if (!isText(line)) reject(at + '.quote[' + j + ']', 'must be a non-empty string'); });
    }
    if (!MARKS.includes(item.mark)) reject(at + '.mark', 'must be one of ' + MARKS.join(', '));
    if (!ANSWERERS.includes(item.answerer)) reject(at + '.answerer', 'must be one of ' + ANSWERERS.join(', '));
    if (item.kind === 'gate') requireText(item, 'consequence', at);
    if (item.kind === 'judgment') requireText(item, 'note', at);
    if (item.kind === 'risk') optionalText(item, 'handling', at);
    if (item.kind === 'fork') {
      optionalText(item, 'fallback', at);
      if (!Array.isArray(item.options) || item.options.length < 2) reject(at + '.options', 'required array of at least 2 named alternatives');
      item.options.forEach((option, j) => validateOption(option, at + '.options[' + j + ']'));
      const labels = item.options.map((option) => optionOf(option).label);
      if (new Set(labels).size !== labels.length) reject(at + '.options', 'alternatives must be distinct');
    }
  });
  return doc;
}

// Reads every option image the file names, relative to the decisions file, as a data URL; the page then needs nothing beside it.
export function loadImages(doc, baseDir) {
  const images = new Map();
  doc.items.forEach((item, i) => {
    if (item.kind !== 'fork') return;
    item.options.forEach((option, j) => {
      const image = optionOf(option).image;
      if (!image) return;
      const field = 'items[' + i + '].options[' + j + '].image';
      const file = resolve(baseDir, image);
      if (!existsSync(file) || !statSync(file).isFile()) reject(field, 'no such image file: ' + image);
      const size = statSync(file).size;
      if (size > IMAGE_MAX_BYTES) reject(field, image + ' is ' + size + ' bytes; downscale it to ' + IMAGE_MAX_BYTES + ' bytes or less, since the page embeds it');
      images.set(i + ':' + j, 'data:' + IMAGE_TYPES[extname(file).toLowerCase()] + ';base64,' + readFileSync(file).toString('base64'));
    });
  });
  return images;
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

const onPath = (item) => item.answerer === 'decider' && CONTROLLED.includes(item.kind);

export function stats(doc) {
  const count = (kind) => doc.items.filter((item) => item.kind === kind).length;
  const decider = doc.items.filter((item) => item.answerer === 'decider').length;
  const deciderAnswers = doc.items.filter(onPath).length;
  const images = doc.items.some((item) => item.kind === 'fork' && item.options.some((option) => optionOf(option).image));
  const handoff = Boolean(doc.material.handoff);
  return {
    items: doc.items.length,
    gates: count('gate'),
    judgments: count('judgment'),
    forks: count('fork'),
    decider,
    deciderAnswers,
    images,
    handoff,
    surface: images || handoff || deciderAnswers > CHAT_LIST_MAX,
    everyItemToDecider: decider === doc.items.length,
  };
}

// The key answers are saved under in the browser: one per version of the decisions file, so a reload keeps them and an edited file starts empty.
export const storeKey = (doc) => 're0-decide:' + createHash('sha256').update(JSON.stringify(doc)).digest('hex').slice(0, 16);

// Beside the material unless the decider names a path; a material path in the JSON is relative to the JSON file.
export function defaultOut(doc, jsonPath) {
  if (!doc.material.path) return null;
  const material = resolve(dirname(resolve(jsonPath)), doc.material.path);
  return join(dirname(material), basename(material, extname(material)) + '.decision.html');
}

const STYLE = [
  ':root{--ink:#1b1b1f;--muted:#55555f;--line:#d9d9e0;--paper:#fff;--soft:#f5f5f8;--accent:#1f3a93;--accent-soft:#eef2ff;--blocked:#b00020;--conditional:#8a4b00;--clear:#1b6e2d}',
  '*{box-sizing:border-box}',
  'body{font:16px/1.5 system-ui,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic",sans-serif;margin:0;color:var(--ink);background:var(--soft)}',
  'h1{font-size:1.1rem;margin:0}h2{font-size:1.3rem;line-height:1.35;margin:.25rem 0 .5rem}h3{font-size:1rem;margin:.75rem 0 .25rem}',
  '.top{position:static;z-index:2;background:var(--paper);border-bottom:1px solid var(--line);padding:.6rem 1rem;display:flex;flex-wrap:wrap;gap:.4rem 1.25rem;align-items:center;justify-content:space-between}',
  '.identity{margin:0;color:var(--muted);font-size:.8rem;overflow-wrap:anywhere}',
  '@media (min-width:600px) and (min-height:1000px){.top{position:sticky;top:0}}@media (max-width:599px){.identity{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100vw - 2rem)}}',
  '.status{display:flex;flex-wrap:wrap;gap:.4rem 1rem;align-items:center}',
  '.verdict{margin:0;font-weight:700;border:2px solid var(--muted);border-radius:999px;padding:.15rem .75rem;font-size:.9rem}',
  '.verdict[data-state=blocked]{border-color:var(--blocked);color:var(--blocked)}.verdict[data-state=conditional]{border-color:var(--conditional);color:var(--conditional)}.verdict[data-state=clear]{border-color:var(--clear);color:var(--clear)}',
  '.verdict .why{font-weight:400}',
  '.progress{margin:0;display:flex;align-items:center;gap:.5rem;font-size:.9rem;color:var(--muted)}',
  '.bar{display:inline-block;width:8rem;height:.5rem;border-radius:999px;background:var(--line);overflow:hidden}.bar span{display:block;height:100%;width:0;background:var(--accent)}',
  '.finding{border:2px dashed var(--conditional);background:var(--paper);padding:.5rem 1rem;margin:1rem}',
  '.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;max-width:76rem;margin:0 auto;padding:1rem}',
  '@media (min-width:900px){.layout{grid-template-columns:17rem minmax(0,1fr)}.rail{position:sticky;top:var(--head,1rem);align-self:start;max-height:calc(100vh - var(--head,1rem) - 1rem);overflow:auto}}',
  '.rail ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.25rem}',
  '.goto{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:1.8rem minmax(0,1fr);gap:0 .4rem;width:100%;min-height:44px;padding:.35rem .5rem;border-radius:.4rem;border:1px solid transparent;background:var(--paper)}',
  '.goto:hover{border-color:var(--line)}.goto:focus-visible{outline:3px solid var(--accent);outline-offset:1px}',
  '.goto[aria-current=step]{border-color:var(--accent);background:var(--accent-soft)}',
  '.goto .n{grid-row:span 2;font-weight:700;color:var(--muted);text-align:right}',
  '.goto .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.9rem}',
  '.goto .a{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.8rem;color:var(--muted)}',
  '.goto .a[data-answered=yes]{color:var(--accent)}.goto .a[data-answered=open]{color:var(--conditional)}',
  '@media (max-width:899px){.rail ol{flex-direction:row;flex-wrap:wrap}.rail li{flex:0 0 auto}.goto{width:auto;min-width:44px;grid-template-columns:auto;text-align:center;padding:.35rem .6rem}.goto .n{grid-row:auto;text-align:center}.goto .t,.goto .a{display:none}.goto[data-answered=yes] .n{color:var(--accent)}}',
  '.step{scroll-margin-top:var(--head,1rem);background:var(--paper);border:1px solid var(--line);border-radius:.6rem;padding:1rem 1.25rem;margin:0 0 1rem}',
  '.js .step{display:none}.js .step.current{display:block}',
  '.step h2[tabindex]:focus{outline:none}',
  '.eyebrow{margin:0;font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}',
  '.text{margin:.25rem 0 .75rem;color:#33333b;overflow-wrap:anywhere}',
  '.ask{margin:.25rem 0 .75rem;padding:.5rem .75rem;border-left:4px solid var(--line);background:var(--soft);overflow-wrap:anywhere}',
  '.options{border:0;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr));gap:.75rem}',
  '.options.binary{grid-template-columns:repeat(2,minmax(0,1fr))}',
  '.options.images{grid-template-columns:repeat(auto-fit,minmax(min(100%,10.5rem),1fr));gap:.6rem}',
  '.options.images .opt label{padding:.5rem;gap:.25rem}.options.images .opt .key{left:.9rem;top:.9rem;background:var(--paper);z-index:1}',
  '.options.images .odetail,.options.images .oconseq{font-size:.85rem}',
  '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
  '.opt{position:relative}',
  '.opt label{display:flex;flex-direction:column;gap:.3rem;height:100%;min-height:44px;padding:.75rem .75rem .75rem 2.6rem;border:2px solid var(--line);border-radius:.6rem;background:var(--paper);cursor:pointer;position:relative;overflow-wrap:anywhere}',
  '.opt label:hover{border-color:#9aa3c7}',
  '.opt input{position:absolute;opacity:0;width:1px;height:1px;margin:0}',
  '.opt .key{position:absolute;left:.6rem;top:.7rem;width:1.5rem;height:1.5rem;border-radius:50%;border:2px solid var(--muted);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:var(--muted)}',
  '.opt input:checked + .key{background:var(--accent);border-color:var(--accent);color:#fff}',
  '.opt label:has(input:checked){border-color:var(--accent);background:var(--accent-soft)}',
  '.opt label:has(input:focus-visible){outline:3px solid var(--accent);outline-offset:2px}',
  '.opt img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:.4rem;background:var(--soft)}',
  '.olabel{font-weight:600}.odetail{font-size:.9rem;color:#33333b}.oconseq{font-size:.9rem;color:var(--muted)}',
  '.defer{font-size:.8rem;color:var(--conditional)}',
  '.zoom{position:absolute;right:.5rem;top:.5rem;min-width:44px;min-height:44px;border:1px solid var(--line);border-radius:.4rem;background:rgba(255,255,255,.92);font:inherit;font-size:.8rem;cursor:pointer}',
  '.fallback{margin:.75rem 0 0;font-size:.9rem;color:var(--muted)}',
  'details.quote{margin:.9rem 0 0;border-top:1px solid var(--line);padding-top:.5rem}',
  'details.quote summary,details.others>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600}',
  'blockquote{margin:.25rem 0;padding:.25rem .9rem;border-left:4px solid var(--accent);background:var(--soft);overflow-wrap:anywhere}blockquote p{margin:.35rem 0}',
  '.meta{margin:.6rem 0 0;font-size:.8rem;color:var(--muted);overflow-wrap:anywhere}',
  '.mark{border:1px solid #888;border-radius:.25rem;padding:0 .3rem;margin-right:.4rem}',
  '.nav{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-top:1rem}',
  '.nav button,.record button{font:inherit;min-height:44px;padding:.4rem 1rem;border-radius:.4rem;border:1px solid var(--line);background:var(--paper);cursor:pointer}',
  '.nav .next{background:var(--accent);color:#fff;border-color:var(--accent)}',
  '.keys{font-size:.8rem;color:var(--muted);margin-left:auto}',
  'pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--soft);padding:.75rem;border-radius:.4rem;font-size:.85rem}',
  '.item{padding:.6rem 0;border-top:1px solid var(--line)}.item:first-of-type{border-top:0}',
  '.kind{font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin-right:.5rem}',
  '.sub{margin:.2rem 0 0;font-size:.9rem;color:#33333b;overflow-wrap:anywhere}',
  '.item .options{margin-top:.4rem;max-width:24rem}.item .opt label{padding:.4rem .5rem .4rem 2.4rem}.item .opt .key{top:.45rem}',
  'details.others{margin:0 0 2rem}',
  'details.others>summary{background:var(--paper);border:1px solid var(--line);border-radius:.6rem;padding:.5rem 1rem}',
  '.group{background:var(--paper);border:1px solid var(--line);border-radius:.6rem;padding:.5rem 1rem;margin:.75rem 0}',
  '.count{font-weight:400;color:var(--muted);margin-left:.5rem}',
  'dialog{border:0;padding:0;max-width:96vw;max-height:94vh;background:transparent}dialog::backdrop{background:rgba(0,0,0,.8)}',
  'dialog img{display:block;max-width:96vw;max-height:86vh;object-fit:contain}dialog button{font:inherit;min-height:44px;margin-top:.5rem;padding:.4rem 1rem}',
  '@media (prefers-reduced-motion:no-preference){.opt label{transition:border-color .12s,background-color .12s}}',
].join('\n');

// Static page behaviour, embedded through its own source text and never interpolated with submitted text. It reads labels from the
// DOM with textContent, recomputes the verdict on every change, and saves only the decider's own answers.
function pageScript() {
  document.documentElement.classList.add('js');
  // The wording table is read from the page, where the renderer wrote it from its own fixed strings, never from submitted text.
  var words = JSON.parse(document.body.getAttribute('data-words'));
  var T = words.page;
  var S = words.state;
  var K = words.kind;
  var fmt = function (template, values) { return template.replace(/\{(\w+)\}/g, function (m, k) { return String(values[k]); }); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var all = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var textOf = function (box, sel) { var el = $(sel, box); return el ? el.textContent : ''; };
  var steps = all('.step');
  // A sticky header would cover a step scrolled to the top, so its height becomes the offset steps and the rail keep from it.
  function offset() {
    var head = $('header.top');
    var sticky = getComputedStyle(head).position === 'sticky';
    document.documentElement.style.setProperty('--head', sticky ? (head.offsetHeight + 16) + 'px' : '1rem');
  }
  offset();
  window.addEventListener('resize', offset);
  var key = document.body.getAttribute('data-store');
  var current = 0;
  var advance = null;
  // An unchosen fork, or one whose choice defers the decision, leaves the decision open exactly as an unmet judgment does.
  function verdictOf(unmetGates, openJudgments, openForks) { return unmetGates ? 'blocked' : openJudgments || openForks ? 'conditional' : 'clear'; }
  function read(box) {
    var kind = box.getAttribute('data-kind');
    var picked = $('input:checked', box);
    var entry = { box: box, kind: kind, path: box.hasAttribute('data-step'), label: textOf(box, '.label'), answer: '', open: true, detail: '' };
    if (kind === 'fork') {
      entry.answer = picked ? textOf(picked.closest('.opt'), '.olabel') : '';
      entry.deferred = Boolean(picked && picked.getAttribute('data-defer') === 'true');
      entry.open = !picked || entry.deferred;
    } else {
      entry.answer = picked ? textOf(picked.closest('.opt'), '.olabel') : '';
      entry.state = picked ? picked.value : 'unanswered';
      entry.open = entry.state !== 'met';
      entry.detail = textOf(box, kind === 'gate' ? '.consequence' : '.note');
    }
    entry.answered = Boolean(picked);
    return entry;
  }
  function compute() {
    var entries = all('[data-control]').map(read);
    var gates = entries.filter(function (e) { return e.kind === 'gate'; });
    var judgments = entries.filter(function (e) { return e.kind === 'judgment'; });
    var forks = entries.filter(function (e) { return e.kind === 'fork'; });
    var unmetGates = gates.filter(function (e) { return e.open; });
    var openJudgments = judgments.filter(function (e) { return e.open; });
    var openForks = forks.filter(function (e) { return e.open; });
    var path = entries.filter(function (e) { return e.path; });
    return {
      entries: entries, path: path, unmetGates: unmetGates, openJudgments: openJudgments, openForks: openForks,
      answered: path.filter(function (e) { return e.answered; }).length,
      state: verdictOf(unmetGates.length, openJudgments.length, openForks.length),
    };
  }
  function shown(e) {
    if (!e.answered) return T.notAnswered;
    if (e.kind === 'fork') return e.answer + (e.deferred ? T.deferred : '');
    return e.answer;
  }
  function summary(r) {
    var lines = [T.recordTitle, T.material + $('#identity').textContent, T.verdict + S[r.state], fmt(T.answeredLine, { a: r.answered, t: r.path.length }), '', T.decisions];
    r.path.forEach(function (e, i) { lines.push((i + 1) + '. ' + e.label + ': ' + shown(e)); });
    if (r.unmetGates.length) {
      lines.push('', T.gatesNotMet);
      r.unmetGates.forEach(function (e) { lines.push('- ' + e.label + ' [' + (e.answered ? T.notMetMark : T.notAnsweredMark) + '] (' + T.blocks + e.detail + ')'); });
    }
    if (r.openJudgments.length) {
      lines.push('', T.judgmentsOpen);
      r.openJudgments.forEach(function (e) { lines.push('- ' + e.label + ' (' + T.weigh + e.detail + ')'); });
    }
    if (r.openForks.length) {
      lines.push('', T.forksOpen);
      r.openForks.forEach(function (e) { lines.push('- ' + e.label + ': ' + shown(e)); });
    }
    var others = r.entries.filter(function (e) { return !e.path; });
    if (others.length) {
      lines.push('', T.byOthers);
      others.forEach(function (e) { lines.push('- ' + K[e.kind] + ' [' + (e.answered ? e.answer : T.notAnsweredMark) + '] ' + e.label); });
    }
    return lines.join('\n');
  }
  // A browser that refuses storage still works; the page says answers will not survive a reload instead of failing quietly.
  function kept(ok) { $('#save-status').textContent = ok ? T.kept : T.notKept; return ok; }
  function save() {
    var answers = {};
    all('input:checked').forEach(function (input) { answers[input.name] = input.value; });
    try { localStorage.setItem(key, JSON.stringify({ answers: answers, step: current })); return kept(true); } catch (e) { return kept(false); }
  }
  function restore() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { kept(false); return 0; }
    if (!saved || typeof saved !== 'object') return 0;
    Object.keys(saved.answers || {}).forEach(function (name) {
      all('input[type=radio]').forEach(function (input) { if (input.name === name && input.value === saved.answers[name]) input.checked = true; });
    });
    return typeof saved.step === 'number' && saved.step >= 0 && saved.step < steps.length ? saved.step : 0;
  }
  function update() {
    var r = compute();
    var chip = $('#verdict');
    chip.setAttribute('data-state', r.state);
    $('#verdict-state').textContent = S[r.state];
    var byOthers = r.unmetGates.filter(function (e) { return !e.path; }).length;
    var opened = r.openJudgments.length + r.openForks.length;
    var why = r.unmetGates.length ? fmt(T.notMet, { n: r.unmetGates.length }) + (byOthers ? fmt(T.forOthers, { n: byOthers }) : '') : opened ? fmt(T.open, { n: opened }) : T.allIn;
    $('#verdict-why').textContent = why;
    $('#progress-text').textContent = fmt(T.answered, { a: r.answered, t: r.path.length });
    $('#progress-bar').style.width = (r.path.length ? Math.round(100 * r.answered / r.path.length) : 100) + '%';
    r.path.forEach(function (e) {
      var i = e.box.getAttribute('data-step');
      var mark = $('[data-answer-for="' + i + '"]');
      var open = e.kind === 'fork' ? e.deferred : e.answered && e.state !== 'met';
      if (mark) { mark.textContent = e.answered ? e.answer : T.openMark; mark.setAttribute('data-answered', e.answered ? (open ? 'open' : 'yes') : 'no'); }
      var go = $('[data-goto="' + i + '"]');
      if (go) go.setAttribute('data-answered', e.answered ? 'yes' : 'no');
    });
    $('#summary').textContent = summary(r);
  }
  function show(i, focus) {
    current = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach(function (step, j) { step.classList.toggle('current', j === current); });
    all('[data-goto]').forEach(function (go) {
      if (go.getAttribute('data-goto') === String(current)) go.setAttribute('aria-current', 'step'); else go.removeAttribute('aria-current');
    });
    if (focus) { var h = $('h2', steps[current]); if (h) h.focus({ preventScroll: true }); window.scrollTo(0, 0); }
    save();
  }
  function copy() {
    var text = $('#summary').textContent;
    var done = function () { $('#copy-status').textContent = T.copied; };
    var failed = function () { $('#copy-status').textContent = T.copyFailed; };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, failed); return; }
    var area = document.createElement('textarea');
    area.value = text; document.body.appendChild(area); area.select();
    try { document.execCommand('copy'); done(); } catch (e) { failed(); }
    document.body.removeChild(area);
  }
  all('input[type=radio]').forEach(function (input) { input.addEventListener('change', function () { update(); save(); }); });
  all('[data-goto]').forEach(function (go) { go.addEventListener('click', function () { show(Number(go.getAttribute('data-goto')), true); }); });
  all('.prev').forEach(function (b) { b.addEventListener('click', function () { show(current - 1, true); }); });
  all('.next').forEach(function (b) { b.addEventListener('click', function () { show(current + 1, true); }); });
  all('.zoom').forEach(function (b) {
    b.addEventListener('click', function () {
      var img = $('img', b.closest('.opt'));
      var view = $('#viewer img') || $('#viewer').insertBefore(document.createElement('img'), $('#viewer-close'));
      view.src = img.src; view.alt = img.alt;
      $('#viewer').showModal();
    });
  });
  $('#viewer-close').addEventListener('click', function () { $('#viewer').close(); });
  $('#copy').addEventListener('click', copy);
  $('#reset').addEventListener('click', function () {
    if (!window.confirm(T.confirmReset)) return;
    all('input[type=radio]').forEach(function (input) { input.checked = false; });
    update(); show(0, true);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.altKey || ev.ctrlKey || ev.metaKey || $('#viewer').open) return;
    var tag = ev.target && ev.target.tagName;
    if (/^[1-9]$/.test(ev.key)) {
      var input = all('.options > .opt input', steps[current])[Number(ev.key) - 1];
      if (!input) return;
      ev.preventDefault();
      input.checked = true; input.focus();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      clearTimeout(advance);
      // A digit answers and moves on, so a run of decisions takes one key each; the rail and the record show every answer to revisit.
      advance = setTimeout(function () { show(current + 1, true); }, 350);
    } else if (ev.key === 'ArrowRight' || (ev.key === 'Enter' && (tag === 'INPUT' || ev.target === document.body || /^H2$/.test(tag)))) {
      ev.preventDefault(); show(current + 1, true);
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault(); show(current - 1, true);
    }
  });
  show(restore(), false);
  update();
}

function quoteBlock(item, t) {
  const lines = quotesOf(item);
  if (!lines.length) return '';
  return '<details class="quote" open><summary>' + t.says + '</summary><blockquote>' + lines.map((line) => '<p>' + esc(line) + '</p>').join('') + '</blockquote></details>';
}

function meta(item, t) {
  return '<p class="meta"><span class="mark" data-mark="' + item.mark + '">' + t.mark[item.mark] + '</span><span class="source">' + esc(item.source) + '</span></p>';
}

// The answers a controlled item takes, as cards. Digits on the cards match the keys that pick them.
function choices(item, i, images, t) {
  const name = 'item-' + i;
  if (item.kind !== 'fork') {
    return '<fieldset class="options binary"><legend class="sr">' + t.kind[item.kind] + '</legend>' +
      BINARY_VALUES.map((value, j) =>
        '<div class="opt"><label><input type="radio" name="' + name + '" value="' + value + '" data-kind="' + item.kind + '"><span class="key">' + (j + 1) + '</span>' +
        '<span class="olabel">' + t.binary[item.kind][j] + '</span></label></div>').join('') + '</fieldset>';
  }
  const pictured = item.options.some((raw) => optionOf(raw).image);
  return '<fieldset class="options' + (pictured ? ' images' : '') + '"><legend class="sr">' + t.options + '</legend>' + item.options.map((raw, j) => {
    const option = optionOf(raw);
    const src = images.get(i + ':' + j);
    return '<div class="opt"><label><input type="radio" name="' + name + '" value="' + j + '" data-kind="fork"' + (option.defer ? ' data-defer="true"' : '') + '>' +
      '<span class="key">' + (j + 1) + '</span>' +
      (src ? '<img src="' + src + '" alt="' + esc(option.label) + '">' : '') +
      '<span class="olabel">' + esc(option.label) + '</span>' +
      (option.detail ? '<span class="odetail">' + esc(option.detail) + '</span>' : '') +
      (option.consequence ? '<span class="oconseq">' + t.leadsTo + '<span>' + esc(option.consequence) + '</span></span>' : '') +
      (option.defer ? '<span class="defer">' + t.defers + '</span>' : '') +
      '</label>' + (src ? '<button type="button" class="zoom">' + t.enlarge + '</button>' : '') + '</div>';
  }).join('') + '</fieldset>';
}

// What the decider is asked, between the context and the cards: a gate's cost when unmet, a judgment's question.
function ask(item, t) {
  if (item.kind === 'gate') return '<p class="ask">' + t.blocks + '<span class="consequence">' + esc(item.consequence) + '</span></p>';
  if (item.kind === 'judgment') return '<p class="ask">' + t.weigh + '<span class="note">' + esc(item.note) + '</span></p>';
  return '';
}

const stepOf = (t, n, total) => t.stepOf.replace('{n}', n).replace('{total}', total);

function step(item, i, n, total, images, t) {
  const heading = item.title || item.text;
  return '<section class="step" id="step-' + n + '" data-step="' + n + '" data-kind="' + item.kind + '" data-control aria-labelledby="h-' + n + '">' +
    '<p class="eyebrow"><span class="kind">' + t.kind[item.kind] + '</span> ' + stepOf(t, n + 1, total) + '</p>' +
    '<h2 id="h-' + n + '" tabindex="-1" class="label">' + esc(heading) + '</h2>' +
    (item.title ? '<p class="text">' + esc(item.text) + '</p>' : '') +
    ask(item, t) + choices(item, i, images, t) +
    (item.kind === 'fork' && item.fallback ? '<p class="fallback">' + t.fallback + '<span>' + esc(item.fallback) + '</span></p>' : '') +
    quoteBlock(item, t) + meta(item, t) +
    '<div class="nav"><button type="button" class="prev">' + t.back + '</button><button type="button" class="next">' + t.next + '</button>' +
    '<span class="keys">' + t.keys + '</span></div></section>';
}

// An item off the decider's path: tagged text, plus its answer cards when it is a gate or judgment someone else checks.
function entry(item, i, images, t) {
  const controlled = CONTROLLED.includes(item.kind);
  return '<div class="item"' + (controlled ? ' data-control' : '') + ' data-kind="' + item.kind + '" data-answerer="' + item.answerer + '">' +
    '<span class="kind">' + t.kind[item.kind] + '</span><span class="label">' + esc(item.title || item.text) + '</span>' +
    (item.title ? '<p class="sub">' + esc(item.text) + '</p>' : '') +
    (item.kind === 'gate' ? '<p class="sub">' + t.blocks + '<span class="consequence">' + esc(item.consequence) + '</span></p>' : '') +
    (item.kind === 'judgment' ? '<p class="sub">' + t.weigh + '<span class="note">' + esc(item.note) + '</span></p>' : '') +
    (item.kind === 'risk' && item.handling ? '<p class="sub">' + t.handling + '<span class="handling">' + esc(item.handling) + '</span></p>' : '') +
    (controlled ? choices(item, i, images, t) : '') +
    (item.kind === 'fork' && item.fallback ? '<p class="sub">' + t.fallback + esc(item.fallback) + '</p>' : '') +
    quoteBlock(item, t) + meta(item, t) + '</div>';
}

// The decider's path opens on the decisions themselves: forks, then judgments, then the gates the decider checks, each in material order.
const PATH_ORDER = ['fork', 'judgment', 'gate'];

export function render(doc, images = new Map()) {
  const info = stats(doc);
  const lang = doc.material.lang || 'en';
  const t = STRINGS[lang];
  const indexed = doc.items.map((item, i) => ({ item, i }));
  const path = PATH_ORDER.flatMap((kind) => indexed.filter((e) => onPath(e.item) && e.item.kind === kind));
  const aside = indexed.filter((e) => e.item.answerer === 'decider' && !onPath(e.item));
  const others = indexed.filter((e) => e.item.answerer !== 'decider');
  const total = path.length + 1;
  const rail = path.map((e, n) =>
    '<li><button type="button" class="goto" data-goto="' + n + '"><span class="n">' + (n + 1) + '</span><span class="t">' + esc(e.item.title || e.item.text) + '</span>' +
    '<span class="a" data-answer-for="' + n + '">' + t.open + '</span></button></li>').join('') +
    '<li><button type="button" class="goto" data-goto="' + path.length + '"><span class="n">' + total + '</span><span class="t">' + t.record + '</span><span class="a">' + t.recordHint + '</span></button></li>';
  const record =
    '<section class="step record" id="step-' + path.length + '" data-step="' + path.length + '" data-kind="record" aria-labelledby="h-record">' +
    '<p class="eyebrow">' + stepOf(t, total, total) + '</p><h2 id="h-record" tabindex="-1">' + t.record + '</h2>' +
    '<p class="text">' + t.recordRule + '</p>' +
    '<p><button type="button" id="copy">' + t.copy + '</button> <span id="copy-status" role="status"></span></p><pre id="summary"></pre><p class="meta" id="save-status"></p>' +
    (aside.length ? '<h3>' + t.alsoYou + '</h3>' + aside.map((e) => entry(e.item, e.i, images, t)).join('') : '') +
    '<div class="nav"><button type="button" class="prev">' + t.back + '</button><button type="button" id="reset">' + t.reset + '</button></div></section>';
  const counts = ANSWERERS.filter((a) => a !== 'decider').map((answerer) => ({ answerer, list: others.filter((e) => e.item.answerer === answerer) })).filter((g) => g.list.length);
  const folded = others.length
    ? '<details class="others" id="others"><summary>' + t.others.replace('{count}', t.items(others.length)).replace('{groups}', counts.map((g) => t.answerer[g.answerer] + ' ' + g.list.length).join(', ')) + '</summary>' +
      counts.map((g) => '<section class="group" data-answerer="' + g.answerer + '"><h3>' + t.answerer[g.answerer] + '<span class="count">' + t.items(g.list.length) + '</span></h3>' +
        g.list.map((e) => entry(e.item, e.i, images, t)).join('') + '</section>').join('') + '</details>'
    : '';
  const finding = info.everyItemToDecider ? '<p class="finding" data-finding="all-decider">' + t.finding + '</p>' : '';
  const words = { page: t.page, state: t.state, kind: t.kind };
  return [
    '<!doctype html>',
    '<html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + t.heading + ': ' + esc(doc.material.identity) + '</title>',
    '<style>' + STYLE + '</style></head><body data-store="' + storeKey(doc) + '" data-words="' + esc(JSON.stringify(words)) + '">',
    '<header class="top"><div><h1>' + t.heading + '</h1><p class="identity">' + t.material + '<span id="identity">' + esc(doc.material.identity) + '</span></p></div>',
    '<div class="status"><p class="verdict" id="verdict" aria-live="polite">' + t.verdict + '<span class="state" id="verdict-state"></span> <span class="why" id="verdict-why"></span></p>',
    '<p class="progress"><span id="progress-text"></span><span class="bar"><span id="progress-bar"></span></span></p></div></header>',
    finding,
    '<div class="layout"><nav class="rail" aria-label="' + t.heading + '"><ol>' + rail + '</ol></nav>',
    '<main id="stage">' + path.map((e, n) => step(e.item, e.i, n, total, images, t)).join('\n') + record + folded + '</main></div>',
    '<dialog id="viewer"><button type="button" id="viewer-close">' + t.close + '</button></dialog>',
    '<noscript><p>' + t.noscript + '</p></noscript>',
    '<script>(' + pageScript.toString() + ')();</script>',
    '</body></html>',
    '',
  ].join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { out: { type: 'string' }, json: { type: 'boolean' }, help: { type: 'boolean' } },
    }));
  } catch (error) {
    if (typeof error.code === 'string' && error.code.startsWith('ERR_PARSE_ARGS')) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (positionals.length !== 1) {
    console.error('name exactly one decisions file\n' + USAGE);
    return 2;
  }
  const jsonPath = positionals[0];
  try {
    if (!existsSync(jsonPath)) throw new InputError('no such file: ' + jsonPath);
    let doc;
    try {
      doc = JSON.parse(readFileSync(jsonPath, 'utf8'));
    } catch (error) {
      throw new InputError('not valid JSON: ' + error.message);
    }
    validate(doc);
    const info = stats(doc);
    if (!info.surface) {
      console.error('render: ' + info.deciderAnswers + ' decider answer(s), no option image and no hand-off reader: reply in the conversation with a short numbered list carrying the same elements instead of a surface');
      return 3;
    }
    const images = loadImages(doc, dirname(resolve(jsonPath)));
    const out = values.out ? resolve(values.out) : defaultOut(doc, jsonPath);
    if (!out) throw new InputError('decisions.material.path: required when --out is not given, to place the surface beside the material');
    const html = render(doc, images);
    const same = existsSync(out) && readFileSync(out, 'utf8') === html;
    if (!same) {
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, html);
    }
    const result = { out, written: !same, ...info };
    console.log(values.json ? JSON.stringify(result) : (same ? 'unchanged ' : 'wrote ') + out);
    return 0;
  } catch (error) {
    if (error instanceof InputError) {
      console.error('render: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
