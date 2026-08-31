/**
 * 원본 ↔ 카드 비교 모드의 상태.
 *
 * 편집 상태가 아니라 **보기 상태**다. 그래서 `editorState` 에 넣지 않고 여기서
 * 따로 다룬다. 템플릿 저장·공유 링크·되돌리기에 섞이면 안 되는 값이므로
 * 미리보기 안에서만 살고, 이 파일은 그 규칙을 지킬 수 있게 계산만 담는다.
 *
 * 담는 것은 열림/닫힘과 경계선 위치 둘이다.
 *
 * **경계선 값은 원본이 보이는 비율이다.** 0 이면 완성 카드만, 100 이면 원본만,
 * 50 이면 반반이다. 화면의 어느 쪽이 원본인지는 이 숫자가 정하지 않는다 —
 * 그리는 쪽이 정하고, 여기서는 0~100 하나만 지킨다.
 */

/** 경계선이 열릴 때 서는 자리. 반반이 비교의 기본이다. */
export const DEFAULT_POSITION = 50;

/** 사진이 없으면 비교할 대상이 없다. 원본 자리에 넣을 것이 없기 때문이다. */
export function canCompare(hasImage) {
  return Boolean(hasImage);
}

export function createCompareState() {
  return { open: false, position: DEFAULT_POSITION };
}

/**
 * 경계선을 옮긴다. 0~100 을 벗어나면 끝값에 세우고, 숫자가 아니면 무시한다.
 *
 * 미리보기 밖까지 끌어도 값이 튀지 않아야 하므로 자르는 일은 여기서 한 번만
 * 한다. 그리는 쪽이 각자 자르면 한 곳을 고쳐도 다른 곳이 남는다.
 */
export function setComparePosition(state, value) {
  const next = clampPosition(value);
  if (next === null || next === state.position) return state;
  return { ...state, position: next };
}

export function clampPosition(value) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

/**
 * 슬라이더 표준 키를 다음 경계선 위치로 바꾼다.
 * 지원하지 않는 키는 null 이므로 화면이 다른 단축키를 가로채지 않는다.
 */
export function positionFromKey(position, key, step = 1) {
  if (key === 'Home') return 0;
  if (key === 'End') return 100;
  if (key === 'ArrowRight' || key === 'ArrowUp') {
    return clampPosition(position + step);
  }
  if (key === 'ArrowLeft' || key === 'ArrowDown') {
    return clampPosition(position - step);
  }
  return null;
}

/** 화면에 적는 두 숫자. 합이 언제나 100 이라 서로를 검산한다. */
export function comparePercents(state) {
  return { original: state.position, card: 100 - state.position };
}

/**
 * 비교 모드를 뒤집는다.
 *
 * **닫는 것은 언제나 된다.** 사진이 사라진 뒤에도 열린 채로 갇히면 나갈 길이
 * 없어지므로, 사진을 요구하는 것은 여는 쪽뿐이다.
 */
export function toggleCompare(state, hasImage) {
  // 위치는 그대로 둔다. 닫았다 열었을 때 보던 자리로 돌아온다.
  if (state.open) return { ...state, open: false };
  return canCompare(hasImage) ? { ...state, open: true } : state;
}

/**
 * 사진이 없어진 상황을 정리한다. 열려 있었다면 닫는다.
 * 상태가 바뀌지 않을 때는 **같은 객체를 그대로 돌려준다** — 리렌더를 만들지
 * 않기 위해서다.
 */
export function syncCompareToImage(state, hasImage) {
  if (state.open && !canCompare(hasImage)) return { ...state, open: false };
  return state;
}
