# AI A → AI B 인계 문서

AI A(Claude)가 계획 중단 시점에 실제 값으로 채웠다. AI B에는 저장소와 이 파일만
제공되며 첫 대화는 제공되지 않는다. **이 문서만 읽고 이어갈 수 있게 썼다.**

## 1. 목표

`원본 ↔ 카드 비교 슬라이더`를 완성하고 `docs/EXPERIMENT_PLAN.md`의 검사 10개를
통과한다. 검사 문구·번호는 그 문서가 정본이다.

**남은 것은 검사 4·5·6·7·8·9·10 이다.** 1·2·3 은 끝났다.

## 2. 현재 상태

- 시작 커밋: `4dae838787beb2f5ccb57cbbc82de44c5fe442a1`
- 마지막 커밋: `acd19e2b4341831f98915852e6fac2db3161090f`
- 바뀐 파일: 5개

```
src/state/compareMode.js         새 파일 · 비교 상태의 순수 계산
test/compareMode.test.js         새 파일 · 위 모듈 단위 테스트 13건
src/components/PreviewPanel.jsx  버튼·오버레이·경계선·숫자·포인터 처리
src/styles.css                   .compare-layer / -original / -divider / -readout
docs/AI-A-LOG.md                 작업 기록 (읽지 않는다 — 4절 참고)
```

**지금 화면에서 되는 것.** 사진을 넣으면 미리보기 위쪽 버튼 줄의 `원본과 비교`가
살아난다. 누르면 캔버스 위에 원본이 얹히고 흰 경계선이 반반 자리에 선다. 경계선을
좌우로 끌면 원본이 보이는 폭과 아래 `원본 n% · 완성 카드 n%` 숫자가 함께 바뀐다.
다시 누르면 닫히고, 닫았다 열면 보던 자리로 돌아온다. 사진이 없으면 버튼이 비활성이다.

### 구조에서 먼저 알아야 할 것

**비교 상태는 `editorState` 에 없다.** `PreviewPanel` 안의 `useState` 로만 산다.
편집이 아니라 보기 상태이고, `editorState` 에 넣는 순간 템플릿 파일·공유 링크·
되돌리기 이력 세 곳으로 흘러간다. 그 셋은 7절이 금지하는 자리다. 같은 파일의
`showSafeArea`·`showcaseMode`·`mobileDocked` 가 이미 같은 방식이다.

**캔버스를 다시 그리지 않는다.** 원본은 `<img>` 로 캔버스 위에 얹고 `clip-path`
로 자른다. 그래서 `renderCard`·PNG 출력·되돌리기는 이 기능의 존재를 모른다.
검사 8·9 의 회귀 위험을 구조로 없앤 자리이니 **캔버스에 그리는 방식으로 바꾸지
마라.**

**자르는 일은 `setComparePosition` 한 곳에서만 한다.** 프레임 밖까지 끄는 것은
정상 동작이고, 그리는 쪽이 각자 자르면 한 곳을 고쳐도 다른 곳이 남는다.

**원본 오버레이는 카드와 같은 `state.fit`(cover/contain)을 쓴다.** 다른 방식으로
맞추면 같은 사진이 양쪽에서 다르게 잘려 비교가 거짓이 된다.

**경계선 값은 원본이 보이는 비율이다.** 0 이면 완성 카드만, 100 이면 원본만이다.

## 3. 실행 명령

```powershell
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

성공 기준: 테스트가 실패 없이 **83건** 끝나고, 빌드가 통과하며, `npm run dev` 가
알려 주는 `http://localhost:5173/` 에서 앱이 열린다.

이 저장소는 Windows PowerShell 에서 확인했다. 다른 셸이면 `npm` 을 쓰면 된다.

### 브라우저에서 손으로 확인하는 법

파일 선택 창을 띄우지 않고도 사진을 넣을 수 있다. 개발자 콘솔에 붙여 넣는다.

```js
const c = document.createElement('canvas'); c.width = 600; c.height = 800;
const g = c.getContext('2d');
g.fillStyle = '#2b6cb0'; g.fillRect(0, 0, 600, 800);
g.fillStyle = '#f6e05e'; g.fillRect(120, 180, 360, 440);
const blob = await new Promise(r => c.toBlob(r, 'image/png'));
const dt = new DataTransfer();
dt.items.add(new File([blob], 'probe.png', { type: 'image/png' }));
const inp = document.querySelector('input[type=file]');
inp.files = dt.files;
inp.dispatchEvent(new Event('change', { bubbles: true }));
```

## 4. 통과한 검사

- **통과: 1, 2, 3.** 단위 테스트뿐 아니라 `npm run dev` 로 띄운 실제 화면에서
  눌러 확인했다. 경계선 0·30·50·100 과 프레임 바깥 −40%·150% 까지 끌어 봤고,
  clip-path·경계선 위치·두 숫자가 함께 움직이며 끝에서 0 과 100 에 섰다.
- **실패: 없음.**
- **미실행: 4, 5, 6, 7, 8, 9, 10.** 계획이 요청 1~3 에 1~3 만 배정했다.
  구현하지 않았으므로 통과 여부를 적지 않는다.

**`docs/AI-A-LOG.md` 를 읽지 마라.** 저장소 안에 있지만 AI A 의 요청별 요약이고,
읽으면 이 문서만으로 이어갈 수 있는지를 재는 실험이 성립하지 않는다.
`EXPERIMENT_PLAN.md`·코드·테스트는 읽어도 된다. 그래도 읽었다면
`docs/AI-B-LOG.md` 에 그 사실과 이유를 남긴다.

## 5. 남은 문제

**막혀 있는 것은 없다.** 테스트 83건과 빌드가 통과하고 콘솔 오류가 없다.
아래는 결함이 아니라 **다음 사람이 알아야 할 자리**다.

1. **키보드로 경계선을 못 움직인다.** 검사 6(방향키·Home·End)이 그것이다.
   지금 `.compare-layer` 는 포인터만 받고 `tabIndex`·`role`·`aria-valuenow` 가
   없다. `setComparePosition` 이 이미 0~100 을 지키므로 값 계산은 다시 짤 필요가
   없고, 접근성 속성과 `onKeyDown` 만 붙이면 된다.
2. **사진이 없을 때 이유가 안 보인다.** 버튼이 비활성만 되고 `먼저 사진을
   고르세요` 같은 문구가 없다. 검사 5 가 이유를 요구한다.
3. **시대·모습을 바꿀 때 원본 쪽이 어떻게 되는지 확인하지 않았다.** 검사 4 다.
   구조상 원본 `<img>` 는 `state.image.src` 만 보고 카드만 다시 그려지므로 맞을
   가능성이 높지만, **확인하지 않았으므로 통과로 적지 않았다.** 눈으로 보고
   테스트를 남겨라.
4. **범위 밖이라 건드리지 않은 것 하나.** 같은 파일의 문구 드래그 핸들러
   `handlePointerDown` 이 `canvas.setPointerCapture(event.pointerId)` 를 무방비로
   부른다. 비교 쪽에서 이것이 실제로 던지는 것을 보고 `try/catch` 로 막았는데
   (`handleComparePointerDown` 의 주석 참고), 문구 쪽은 기존 동작이라 그대로 뒀다.
   검사 9 를 만지다 걸리면 같은 처방이다.

## 6. 다음 행동

1. 이 문서만 보고 `npm.cmd install` → `npm.cmd test` → `npm.cmd run dev` 로
   83건 통과와 화면을 먼저 확인한다.
2. 검사 번호 순으로 남은 것을 끝낸다. 권하는 순서는 **4 → 5 → 6 → 7 → 8·9·10**
   이다. 4 는 확인만으로 끝날 수 있고, 5·6 은 같은 버튼과 레이어를 만지므로
   붙여서 하는 편이 낫다. 7 은 이미 클램프가 있어 확인 위주다.
3. 8·9·10 은 회귀 검사다. 비교 모드를 켰다 끈 뒤 PNG 다운로드·되돌리기·템플릿
   저장/불러오기를 실제로 해 보고, 비교 상태가 저장 데이터에 섞이지 않았는지
   `docs/` 가 아니라 **저장된 파일 내용으로** 확인한다.
4. 관련 검사를 마칠 때마다 전체 테스트와 빌드를 다시 돌린다.

## 7. 건드리면 안 되는 부분

- 검사 10개의 의미와 번호, AI별 예산, 계획 중단 시점을 바꾸지 않는다.
- 비교 UI 상태를 `editorState`·템플릿 저장 스키마·공유 링크에 넣지 않는다.
- 기존 카드 렌더러 결과와 PNG 출력을 비교 기능 때문에 바꾸지 않는다.
  원본은 캔버스 위에 얹는 것이지 캔버스에 그리는 것이 아니다.
- 되돌리기·다시하기 동작을 비교 기능 때문에 바꾸지 않는다.
- 비밀값·개인정보·AI 대화 전문을 커밋하지 않는다.
- `docs/AI-A-LOG.md` 를 읽거나 고치지 않는다. `docs/FINAL_COMPARISON.md` 도
  AI B 가 고치지 않는다.
