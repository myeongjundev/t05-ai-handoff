import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canCompare,
  clampPosition,
  comparePercents,
  createCompareState,
  positionFromKey,
  setComparePosition,
  syncCompareToImage,
  toggleCompare,
} from '../src/state/compareMode.js';

test('비교 모드는 닫힌 채로 시작한다', () => {
  assert.deepEqual(createCompareState(), { open: false, position: 50 });
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

test('경계선은 반반에서 시작한다', () => {
  assert.equal(createCompareState().position, 50);
});

test('경계선을 옮기면 두 숫자가 함께 바뀐다 — 검사 2', () => {
  let state = createCompareState();
  assert.deepEqual(comparePercents(state), { original: 50, card: 50 });
  state = setComparePosition(state, 72);
  assert.equal(state.position, 72);
  assert.deepEqual(comparePercents(state), { original: 72, card: 28 });
});

test('두 숫자의 합은 언제나 100이다', () => {
  for (const value of [0, 1, 33, 50, 67, 99, 100]) {
    const { original, card } = comparePercents(setComparePosition(createCompareState(), value));
    assert.equal(original + card, 100, `${value} 에서 합이 100이 아니다`);
  }
});

test('0·50·100은 완성만·반반·원본만이 된다 — 검사 3', () => {
  const at = (value) => comparePercents(setComparePosition(createCompareState(), value));
  assert.deepEqual(at(0), { original: 0, card: 100 }, '0이면 완성 카드만');
  assert.deepEqual(at(50), { original: 50, card: 50 }, '50이면 반반');
  assert.deepEqual(at(100), { original: 100, card: 0 }, '100이면 원본만');
});

test('0~100을 벗어나면 끝값에 선다', () => {
  assert.equal(clampPosition(-40), 0);
  assert.equal(clampPosition(140), 100);
  assert.equal(setComparePosition(createCompareState(), -1).position, 0);
  assert.equal(setComparePosition(createCompareState(), 101).position, 100);
});

test('숫자가 아닌 값은 경계선을 움직이지 못한다', () => {
  const state = createCompareState();
  assert.equal(clampPosition(NaN), null);
  assert.equal(clampPosition('abc'), null);
  assert.equal(setComparePosition(state, NaN), state, '같은 객체를 그대로 돌려준다');
  assert.equal(setComparePosition(state, 50), state, '같은 값이면 리렌더를 만들지 않는다');
});

test('닫았다 열어도 보던 자리로 돌아온다', () => {
  let state = setComparePosition(toggleCompare(createCompareState(), true), 80);
  state = toggleCompare(state, true);
  assert.equal(state.open, false);
  state = toggleCompare(state, true);
  assert.deepEqual(state, { open: true, position: 80 });
});

test('방향키는 경계선을 한 칸씩 움직이고 범위를 벗어나지 않는다 — 검사 6', () => {
  assert.equal(positionFromKey(50, 'ArrowRight'), 51);
  assert.equal(positionFromKey(50, 'ArrowUp'), 51);
  assert.equal(positionFromKey(50, 'ArrowLeft'), 49);
  assert.equal(positionFromKey(50, 'ArrowDown'), 49);
  assert.equal(positionFromKey(100, 'ArrowRight'), 100);
  assert.equal(positionFromKey(0, 'ArrowLeft'), 0);
});

test('Home·End는 양 끝으로 가고 다른 키는 무시한다 — 검사 6', () => {
  assert.equal(positionFromKey(37, 'Home'), 0);
  assert.equal(positionFromKey(37, 'End'), 100);
  assert.equal(positionFromKey(37, 'Enter'), null);
});
