import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canCompare,
  createCompareState,
  syncCompareToImage,
  toggleCompare,
} from '../src/state/compareMode.js';

test('비교 모드는 닫힌 채로 시작한다', () => {
  assert.deepEqual(createCompareState(), { open: false });
});

test('사진이 있으면 열고 닫을 수 있다 — 검사 1', () => {
  const closed = createCompareState();
  const opened = toggleCompare(closed, true);
  assert.equal(opened.open, true);
  assert.equal(toggleCompare(opened, true).open, false);
});

test('사진이 없으면 열리지 않는다', () => {
  const closed = createCompareState();
  const same = toggleCompare(closed, false);
  assert.equal(same.open, false);
  assert.equal(same, closed, '바뀐 게 없으면 같은 객체를 돌려준다');
  assert.equal(canCompare(null), false);
  assert.equal(canCompare(undefined), false);
});

test('사진이 없어도 닫는 것은 언제나 된다', () => {
  // 열어 둔 채 사진을 지우면 나갈 길이 없어지면 안 된다.
  assert.equal(toggleCompare({ open: true }, false).open, false);
});

test('사진이 사라지면 열린 비교 모드를 닫는다', () => {
  assert.equal(syncCompareToImage({ open: true }, false).open, false);
});

test('바뀔 것이 없으면 같은 객체를 돌려준다', () => {
  const closed = { open: false };
  assert.equal(syncCompareToImage(closed, false), closed);
  const opened = { open: true };
  assert.equal(syncCompareToImage(opened, true), opened);
});
