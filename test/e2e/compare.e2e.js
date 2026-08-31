import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
import { startDistServer } from './server.js';

let server;
let browser;

before(async () => {
  server = await startDistServer();
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await server?.close();
});

async function freshPage({ image = true } = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(server.url, { waitUntil: 'networkidle' });
  await page.waitForSelector('.canvas-frame canvas');
  if (image) {
    await page.locator('input[type="file"]').first().setInputFiles('public/sample/portrait-800x1400.png');
    await page.waitForTimeout(500);
  }
  return page;
}

async function openViewMenu(page) {
  const menu = page.locator('details.view-menu');
  if ((await menu.getAttribute('open')) === null) await menu.locator('summary').click();
}

async function openTemplateGroup(page) {
  const group = page.locator('details.group', {
    has: page.locator('.group-title', { hasText: '내 템플릿' }),
  });
  if ((await group.getAttribute('open')) === null) await group.locator('summary').click();
}

async function openComparison(page) {
  await openViewMenu(page);
  await page.getByRole('button', { name: '원본과 비교' }).click();
  const slider = page.getByRole('slider', { name: '원본과 완성 카드 비교 경계선' });
  await slider.waitFor();
  return slider;
}

async function downloadPng(page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '이미지 다운로드' }).click(),
  ]);
  return fs.readFileSync(await download.path());
}

test('비교 중 시대를 바꾸면 카드만 바뀌고 원본은 유지된다 — 검사 4', async () => {
  const page = await freshPage();
  try {
    await openComparison(page);
    const original = page.locator('.compare-original');
    const originalSrc = await original.getAttribute('src');
    const canvasBefore = await page.locator('.canvas-frame canvas').evaluate((canvas) => canvas.toDataURL());

    await page.locator('.era-timeline button', { hasText: '2004' }).click();
    await page.waitForTimeout(400);

    assert.equal(await original.getAttribute('src'), originalSrc, '시대를 바꿨는데 원본 사진이 바뀌었다');
    assert.notEqual(
      await page.locator('.canvas-frame canvas').evaluate((canvas) => canvas.toDataURL()),
      canvasBefore,
      '시대를 바꿨는데 완성 카드가 갱신되지 않았다'
    );
  } finally {
    await page.close();
  }
});

test('사진이 없으면 비교할 수 없는 이유가 함께 보인다 — 검사 5', async () => {
  const page = await freshPage({ image: false });
  try {
    await openViewMenu(page);
    const button = page.getByRole('button', { name: '원본과 비교' });
    assert.equal(await button.isDisabled(), true);
    assert.equal(
      await page.getByText('먼저 사진을 골라야 비교할 수 있습니다.').isVisible(),
      true
    );
  } finally {
    await page.close();
  }
});

test('방향키·Home·End가 경계선을 0~100 안에서 움직인다 — 검사 6', async () => {
  const page = await freshPage();
  try {
    const slider = await openComparison(page);
    await slider.focus();
    await slider.press('End');
    assert.equal(await slider.getAttribute('aria-valuenow'), '100');
    await slider.press('ArrowRight');
    assert.equal(await slider.getAttribute('aria-valuenow'), '100', '100을 넘어갔다');
    await slider.press('Home');
    assert.equal(await slider.getAttribute('aria-valuenow'), '0');
    await slider.press('ArrowLeft');
    assert.equal(await slider.getAttribute('aria-valuenow'), '0', '0 아래로 내려갔다');
    await slider.press('ArrowUp');
    assert.equal(await slider.getAttribute('aria-valuenow'), '1');
  } finally {
    await page.close();
  }
});

test('프레임 밖까지 끌면 양 끝에 고정되고 오류가 나지 않는다 — 검사 7', async () => {
  const page = await freshPage();
  try {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const slider = await openComparison(page);
    const box = await slider.boundingBox();
    assert.ok(box);

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 120, box.y + box.height / 2);
    await page.mouse.up();
    assert.equal(await slider.getAttribute('aria-valuenow'), '0');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 120, box.y + box.height / 2);
    await page.mouse.up();
    assert.equal(await slider.getAttribute('aria-valuenow'), '100');
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test('비교 모드를 사용해도 내려받는 PNG 바이트가 같다 — 검사 8', async () => {
  const page = await freshPage();
  try {
    const before = await downloadPng(page);
    const slider = await openComparison(page);
    await slider.focus();
    await slider.press('Home');
    await slider.press('ArrowRight');
    const after = await downloadPng(page);
    assert.deepEqual(after, before);
  } finally {
    await page.close();
  }
});

test('비교 모드 뒤에도 편집값 되돌리기와 다시하기가 동작한다 — 검사 9', async () => {
  const page = await freshPage();
  try {
    await page.locator('.ratio-group button', { hasText: '4:5' }).click();
    await openComparison(page);
    await page.locator('.ratio-group button', { hasText: '9:16' }).click();

    await page.getByRole('button', { name: /실행 취소/ }).click();
    assert.notEqual(
      await page.locator('.ratio-group button[aria-pressed="true"]').innerText(),
      '9:16',
      '되돌리기가 편집값을 되돌리지 않았다'
    );
    await page.getByRole('button', { name: /다시 실행/ }).click();
    assert.equal(await page.locator('.ratio-group button[aria-pressed="true"]').innerText(), '9:16');
  } finally {
    await page.close();
  }
});

test('템플릿은 편집값만 복원하고 비교 상태를 저장하지 않는다 — 검사 10', async () => {
  const page = await freshPage();
  try {
    await page.locator('#text-input').fill('비교 상태 비저장 검사');
    await page.locator('.era-timeline button', { hasText: '2004' }).click();
    const slider = await openComparison(page);
    await slider.focus();
    await slider.press('End');

    await openTemplateGroup(page);
    await page.locator('#template-name').fill('비교 검사');
    await page.getByRole('button', { name: '현재 설정을 템플릿으로 저장' }).click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('t03-card-studio/templates')));
    assert.equal(JSON.stringify(stored).includes('compare'), false, '템플릿에 비교 상태가 섞였다');

    await page.getByRole('button', { name: '비교 닫기' }).click();
    await page.locator('#text-input').fill('바뀐 문구');
    await page.locator('.era-timeline button', { hasText: '2026' }).click();
    await page.getByRole('button', { name: '불러오기' }).click();

    assert.equal(await page.locator('#text-input').inputValue(), '비교 상태 비저장 검사');
    assert.equal(
      await page.locator('.era-timeline button[aria-pressed="true"] span').innerText(),
      '2004'
    );
    assert.equal(await page.getByRole('button', { name: '원본과 비교' }).isVisible(), true);
    assert.equal(await page.locator('.compare-layer').count(), 0, '저장했던 비교 모드가 다시 열렸다');
  } finally {
    await page.close();
  }
});

test('공개 화면에서 AI A → 인계 → AI B 결과가 함께 보인다', async () => {
  const page = await freshPage({ image: false });
  try {
    const section = page.locator('.handoff-experiment');
    await page.getByRole('button', { name: 'T05 결과' }).click();
    await page.waitForTimeout(500);
    assert.equal(await section.isVisible(), true);
    assert.equal(await section.getByText('AI A · CLAUDE').isVisible(), true);
    assert.equal(await section.getByText('HANDOFF.MD').isVisible(), true);
    assert.equal(await section.getByText('AI B · CODEX').isVisible(), true);
    assert.match(await section.innerText(), /10\/10 통과/);

    const cleanup = page.locator('.cleanup-case');
    const sectionRail = page.getByRole('navigation', { name: '구획 바로가기' });
    assert.equal(await sectionRail.isVisible(), true);
    await sectionRail.getByRole('button', { name: '제품 판단' }).click();
    await page.waitForTimeout(500);
    const cleanupTop = await cleanup.evaluate((element) => element.getBoundingClientRect().top);
    assert.ok(cleanupTop >= 0 && cleanupTop < 300, `제품 판단 구획으로 이동하지 못했다: ${cleanupTop}`);
    assert.equal(await cleanup.getByText('Canvas-first 2열').isVisible(), true);
    assert.match(await cleanup.innerText(), /23[\s\S]*약 14/);
    assert.match(await cleanup.innerText(), /85\/85[\s\S]*38\/38/);

    await page.getByRole('button', { name: '샘플로 30초 체험' }).click();
    await page.waitForTimeout(500);
    assert.match(await page.locator('.file-current').innerText(), /공개 샘플/);
    await openViewMenu(page);
    assert.equal(await page.getByRole('button', { name: '원본과 비교' }).isEnabled(), true);
    assert.match(await section.innerText(), /11분 · 요청 3회 · 검사 1~3/);
    assert.match(await section.innerText(), /8분 · 요청 1회 · 검사 4~10/);
    assert.match(await section.innerText(), /AI에게 맡긴 일/);

    const reviewButton = section.getByRole('button', { name: '30초 검증 시작' });
    await reviewButton.click();
    assert.equal(await section.getByRole('region', { name: '30초 검증 안내' }).isVisible(), true);
    assert.equal(await section.getByRole('button', { name: /Studio에서 직접 검증하기/ }).isVisible(), true);
  } finally {
    await page.close();
  }
});
