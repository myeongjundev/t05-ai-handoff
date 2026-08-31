# Claude 작업 재료 색인

> T05에서 Claude가 입력으로 받은 문서, 직접 만든 구현, 인계 기록과 종료 후 보완
> 자료를 한곳에서 찾기 위한 색인이다. 실험 원본은 이동하거나 다시 쓰지 않는다.

## 한눈에 보기

| 구분 | 파일 | 상태 |
|---|---|---|
| 공식 입력 | [`../CLAUDE_REQUEST_1.md`](../CLAUDE_REQUEST_1.md) | AI A 요청 1과 중단 규칙 |
| 운영 규칙 | [`START-CLAUDE.md`](START-CLAUDE.md) | 요청 2·3과 계획 중단 절차 |
| 고정 기준 | [`EXPERIMENT_PLAN.md`](EXPERIMENT_PLAN.md) | 기능 범위·검사 10개·예산의 정본 |
| Claude 기록 | [`AI-A-LOG.md`](AI-A-LOG.md) | 11분·3회 요청·검사 1~3 수행 기록 |
| 인계 산출물 | [`HANDOFF.md`](HANDOFF.md) | 목표부터 금지 영역까지 7개 항목 |
| 구현 | [`../src/state/compareMode.js`](../src/state/compareMode.js) | 비교 상태·비율·0~100 클램프 |
| UI | [`../src/components/PreviewPanel.jsx`](../src/components/PreviewPanel.jsx) | 비교 버튼·원본 오버레이·경계선·포인터 처리 |
| 스타일 | [`../src/styles.css`](../src/styles.css) | 비교 레이어와 경계선 표시 |
| 검사 | [`../test/compareMode.test.js`](../test/compareMode.test.js) | Claude가 만든 최초 13건, 최종 15건 |
| 종료 후 정리 | [`FINAL_COMPARISON.md`](FINAL_COMPARISON.md) | AI A·B 실측 비교 초안 |

## Claude 공식 작업 범위

기준 커밋은 `4dae838`, 계획 중단 뒤 기록까지 포함한 마지막 커밋은 `ec93fe1`이다.
이 구간에서 Claude가 실제로 바꾼 파일은 다음 6개다.

```text
docs/AI-A-LOG.md
docs/HANDOFF.md
src/components/PreviewPanel.jsx
src/state/compareMode.js
src/styles.css
test/compareMode.test.js
```

| 커밋 | 내용 |
|---|---|
| `6820a35` | 사진이 있을 때 비교 모드를 열고 닫는 검사 1 구현 |
| `9355193` | 요청 1 구현 커밋을 AI A 기록에 확정 |
| `acd19e2` | 경계선 이동·두 비율·0·50·100 검사 2~3 구현 |
| `f065eb6` | 계획대로 구현을 멈추고 7개 항목 인계 문서 작성 |
| `ec93fe1` | AI A 기록에 마지막 구현 커밋 확정 |

종료 후 `c01fa23`에서 Claude가 공동 작성자로 참여해 `FINAL_COMPARISON.md`의 실측
부분을 채웠다. 이 커밋은 AI A의 제한 시간 작업과 분리해서 본다.

## 그대로 쓸 수 있는 재료

- 비교 상태를 편집 상태와 분리한 구조
- 캔버스를 다시 그리지 않고 원본 이미지를 위에 얹는 방식
- 0~100 경계값과 원본·완성 카드 비율 규칙
- 검사 1~3의 단위 테스트와 실제 화면 확인 기록
- 목표·현재 상태·명령·통과 검사·남은 문제·다음 행동·주의 사항으로 구성한 인계 양식
- `setPointerCapture` 실패를 발견하고 비교 경계선 쪽에서 방어한 시행착오 기록

## 후속 제출 정리에서 반영한 부분

Claude의 종료 후 비교 초안은 Git 이력 `c01fa23`에 그대로 남아 있다. 이후 제출 정리
단계에서 실행 기록과 대조해 다음 네 항목을 `FINAL_COMPARISON.md` 확정본에 반영했다.

1. `2026-08-31 12:0x`를 실제 완료 시각 `12:00 KST`로 확정했다.
2. 검증 주체를 실제 수행 방식인 Codex의 로컬 Playwright와 GitHub Actions로 바로잡았다.
3. 기존 e2e를 **30건**, T05 추가 검사를 8건, 최종 합계를 38건으로 정정했다.
4. 사용자의 판단을 반영해 다음 과제 선택 기준 3개와 `AI 3줄`을 완성했다.

## 현재 검증값

- 단위 테스트: **85/85 통과**
- 실제 브라우저 e2e: **38/38 통과**
  - `pixels.e2e.js` 12건
  - `interaction.e2e.js` 10건
  - `contrast.e2e.js` 8건
  - `compare.e2e.js` 8건
- 빌드: 통과
- GitHub Pages 배포: 통과

이 문서는 파일을 옮기는 대신 역할별 입구를 제공한다. 커밋 증거와 상대 경로를
깨뜨리지 않으면서도, 제출 준비 때 필요한 재료와 보완점을 바로 찾을 수 있다.
