import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const evidenceOnly = process.argv.includes('--evidence-only');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const requiredFiles = [
  'CLAUDE_REQUEST_1.md',
  'CODEX_REQUEST_UI_CLEANUP.md',
  'docs/EXPERIMENT_PLAN.md',
  'docs/START-CLAUDE.md',
  'docs/AI-A-LOG.md',
  'docs/HANDOFF.md',
  'docs/AI-B-LOG.md',
  'docs/FINAL_COMPARISON.md',
  'docs/T05-VERIFICATION.md',
  'work-log/2026-08-31-ui-cleanup.md',
];

// 줄바꿈은 OS마다 달라질 수 있으므로 LF로 정규화한 본문을 고정한다.
const protectedDocuments = {
  'docs/EXPERIMENT_PLAN.md': 'aba87da0d59fb57e0feea6be3214c9c62162f2bbe22a59c290ef6eb98b166b62',
  'docs/AI-A-LOG.md': '33aaddca5948f4f29325dd60d4556183fc654415297d4c8b3a6836761ad5fcf6',
  'docs/AI-B-LOG.md': '07fd223318f3abc2fd0ce6f957953262e2eba37f0c2a49338e2b4a562266168e',
  'docs/FINAL_COMPARISON.md': 'fab0bea11106bd5ddaaa9342d30503d400db5d7515e6de0e455ea83cd5b6449a',
  'docs/HANDOFF.md': '1144568c7ea153843cdefd9194f46c92dd746342558daa2a0cac7dda18966160',
};

const milestoneCommits = [
  ['f065eb6', 'AI A가 계획대로 멈추고 HANDOFF를 남긴 커밋'],
  ['362c711', 'AI B가 남은 고정 검사를 완성한 커밋'],
  ['ad2f520', 'Studio 편집 구조를 정리한 커밋'],
  ['3392b9a', '미리보기 조작을 통합한 커밋'],
  ['91787ed', '새 UI의 회귀 검사와 기록을 남긴 커밋'],
];

function fail(message) {
  console.error(`\n[실패] ${message}`);
  process.exit(1);
}

function normalizedHash(file) {
  const text = readFileSync(resolve(root, file), 'utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(text).digest('hex');
}

function git(args) {
  return spawnSync('git', args, { cwd: root, encoding: 'utf8' });
}

function assertCommitExists(sha, label) {
  const result = git(['cat-file', '-e', `${sha}^{commit}`]);
  if (result.status !== 0) fail(`${label}(${sha})을 Git 기록에서 찾지 못했습니다.`);
}

function assertAncestor(older, newer, label) {
  const result = git(['merge-base', '--is-ancestor', older, newer]);
  if (result.status !== 0) fail(`${label}: ${older} → ${newer} 순서를 확인하지 못했습니다.`);
}

function runNpm(args, label, expectedTests) {
  console.log(`\n── ${label} ──`);
  // Windows의 npm은 .cmd 파일이다. 고정된 명령만 cmd.exe에 넘겨 경고 없이 실행한다.
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : npm;
  const commandArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', ['npm.cmd', ...args].join(' ')]
    : args;
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });

  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) fail(`${label} 실행 실패: ${result.error.message}`);
  if (result.status !== 0) fail(`${label}이 종료 코드 ${result.status}로 실패했습니다.`);

  if (expectedTests) {
    const output = `${result.stdout || ''}\n${result.stderr || ''}`;
    const tests = [...output.matchAll(/\btests\s+(\d+)\b/g)].at(-1)?.[1];
    const passed = [...output.matchAll(/\bpass\s+(\d+)\b/g)].at(-1)?.[1];
    if (Number(tests) !== expectedTests || Number(passed) !== expectedTests) {
      fail(`${label} 개수가 ${expectedTests}/${expectedTests}가 아닙니다. 실제 tests=${tests}, pass=${passed}`);
    }
  }
}

function currentCommit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  const result = git(['rev-parse', 'HEAD']);
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function writeVerificationArtifacts() {
  const report = {
    schemaVersion: 1,
    project: 'T05 AI handoff',
    result: 'passed',
    commit: currentCommit(),
    generatedAt: new Date().toISOString(),
    evidence: {
      requiredFiles: requiredFiles.length,
      protectedDocuments: Object.keys(protectedDocuments).length,
      milestoneCommits: milestoneCommits.length,
    },
    verification: {
      unit: { passed: 85, total: 85 },
      build: 'passed',
      chromiumE2e: { passed: 38, total: 38 },
    },
  };

  const reportPath = resolve(root, 'dist', 'handoff-verification.json');
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`\n배포 검증 증거 생성: ${reportPath}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const shortSha = report.commit.slice(0, 7);
    const summary = [
      '## T05 인계 검증 · PASS',
      '',
      `커밋: \`${shortSha}\``,
      '',
      '| 증거 | 결과 |',
      '|---|---:|',
      `| 필수 인계 자료 | ${report.evidence.requiredFiles}/${report.evidence.requiredFiles} |`,
      `| 보호 문서 본문 | ${report.evidence.protectedDocuments}/${report.evidence.protectedDocuments} |`,
      `| 역할 분리 커밋 | ${report.evidence.milestoneCommits}/${report.evidence.milestoneCommits} |`,
      `| 단위 테스트 | ${report.verification.unit.passed}/${report.verification.unit.total} |`,
      `| 프로덕션 빌드 | ${report.verification.build.toUpperCase()} |`,
      `| Chromium E2E | ${report.verification.chromiumE2e.passed}/${report.verification.chromiumE2e.total} |`,
      '',
      '배포 산출물에 `handoff-verification.json`을 함께 포함했습니다.',
      '',
    ].join('\n');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary, 'utf8');
  }
}

console.log('T05 인계 증거를 검사합니다.');

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) fail(`필수 인계 자료가 없습니다: ${file}`);
}
console.log(`[통과] 필수 인계 자료 ${requiredFiles.length}개`);

for (const [file, expected] of Object.entries(protectedDocuments)) {
  const actual = normalizedHash(file);
  if (actual !== expected) fail(`보호 문서 본문이 기준과 다릅니다: ${file}`);
}
console.log(`[통과] 보호 문서 ${Object.keys(protectedDocuments).length}개 본문 고정`);

if (git(['rev-parse', '--is-inside-work-tree']).status !== 0) {
  fail('분할 커밋을 검증하려면 Git 저장소에서 실행해야 합니다.');
}
for (const [sha, label] of milestoneCommits) assertCommitExists(sha, label);
assertAncestor('f065eb6', '362c711', 'AI A 인계 뒤 AI B 완성');
assertAncestor('ad2f520', '3392b9a', '구조 정리 뒤 미리보기 통합');
assertAncestor('3392b9a', '91787ed', '기능 구현 뒤 회귀 검사');
console.log(`[통과] 역할과 목적이 나뉜 핵심 커밋 ${milestoneCommits.length}개`);

if (evidenceOnly) {
  console.log('\n인계 증거 검증 완료: 문서·보호 기준·분할 커밋이 모두 확인됐습니다.');
  process.exit(0);
}

runNpm(['test'], '단위 테스트 85/85', 85);
runNpm(['run', 'build'], '프로덕션 빌드');
runNpm(['run', 'test:e2e'], 'Chromium E2E 38/38', 38);
writeVerificationArtifacts();

console.log('\nT05 전체 검증 완료: 인계 증거 + 단위 85 + 빌드 + E2E 38이 모두 통과했습니다.');
