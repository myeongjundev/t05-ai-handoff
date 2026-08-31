/**
 * 원본 ↔ 카드 비교 모드의 상태.
 *
 * 편집 상태가 아니라 **보기 상태**다. 그래서 `editorState` 에 넣지 않고 여기서
 * 따로 다룬다. 템플릿 저장·공유 링크·되돌리기에 섞이면 안 되는 값이므로
 * 미리보기 안에서만 살고, 이 파일은 그 규칙을 지킬 수 있게 계산만 담는다.
 *
 * 지금은 열림/닫힘 하나뿐이다. 경계선 위치와 비율 계산은 검사 2·3 의 몫이라
 * 여기에 미리 만들어 두지 않는다.
 */

/** 사진이 없으면 비교할 대상이 없다. 원본 자리에 넣을 것이 없기 때문이다. */
export function canCompare(hasImage) {
  return Boolean(hasImage);
}

export function createCompareState() {
  return { open: false };
}

/**
 * 비교 모드를 뒤집는다.
 *
 * **닫는 것은 언제나 된다.** 사진이 사라진 뒤에도 열린 채로 갇히면 나갈 길이
 * 없어지므로, 사진을 요구하는 것은 여는 쪽뿐이다.
 */
export function toggleCompare(state, hasImage) {
  if (state.open) return { open: false };
  return canCompare(hasImage) ? { open: true } : state;
}

/**
 * 사진이 없어진 상황을 정리한다. 열려 있었다면 닫는다.
 * 상태가 바뀌지 않을 때는 **같은 객체를 그대로 돌려준다** — 리렌더를 만들지
 * 않기 위해서다.
 */
export function syncCompareToImage(state, hasImage) {
  if (state.open && !canCompare(hasImage)) return { open: false };
  return state;
}
