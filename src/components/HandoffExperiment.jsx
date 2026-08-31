import { useState } from 'react';

const HANDOFF_ITEMS = ['목표', '현재 상태', '실행 명령', '통과한 검사', '남은 문제', '다음 행동', '주의 사항'];

const METRICS = [
  ['작업시간', '11분', '8분'],
  ['요청', '3회', '1회'],
  ['배정 검사', '1~3', '4~10'],
  ['남긴 오류', '0개', '0개'],
  ['사람 재작업', '0개', '0개'],
  ['인계 이해 오류', '해당 없음', '절차 1건'],
];

const CHECKS = [
  ['1', 'AI A', '열기·닫기', '단위 + 화면'],
  ['2', 'AI A', '경계선·두 비율', '단위 + 화면'],
  ['3', 'AI A', '0·50·100 끝값', '단위 + 화면'],
  ['4', 'AI B', '시대 변경 시 카드만 갱신', '브라우저 e2e'],
  ['5', 'AI B', '사진 없음 안내', '브라우저 e2e'],
  ['6', 'AI B', '방향키·Home·End', '단위 + e2e'],
  ['7', 'AI B', '프레임 밖 0~100 고정', '브라우저 e2e'],
  ['8', 'AI B', 'PNG 바이트 불변', '브라우저 e2e'],
  ['9', 'AI B', '되돌리기·다시하기', '브라우저 e2e'],
  ['10', 'AI B', '템플릿에 비교 상태 제외', '브라우저 e2e'],
];

export default function HandoffExperiment({ onGoToStudio }) {
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <section className="handoff-experiment" id="t05-result" aria-labelledby="handoff-heading">
      <header className="handoff-heading" data-reveal>
        <p>05 / AI HANDOFF EXPERIMENT</p>
        <h2 id="handoff-heading">대화가 끊겨도,<br />프로젝트는 이어졌습니다.</h2>
        <p>
          Claude가 검사 1~3에서 계획대로 멈추고 저장소와 일곱 항목의 인계 문서를
          남겼습니다. Codex는 첫 대화 없이 그 문서를 작업 기준으로 삼아 검사 4~10을
          완성했습니다. 여기서 비교하는 것은 모델의 속도가 아니라, 설명이 사라진 뒤에도
          문서가 다음 행동을 만들 수 있었는가입니다.
        </p>
        <button
          className="handoff-review-button"
          type="button"
          aria-expanded={reviewOpen}
          aria-controls="handoff-review-guide"
          onClick={() => setReviewOpen((open) => !open)}
        >
          {reviewOpen ? '30초 검증 안내 닫기' : '30초 검증 시작'}
        </button>
      </header>

      {reviewOpen && (
        <div className="handoff-review" id="handoff-review-guide" role="region" aria-label="30초 검증 안내">
          <ol>
            <li><strong>사진 선택</strong><span>Studio에서 샘플 또는 내 사진을 고릅니다.</span></li>
            <li><strong>비교 열기</strong><span>결과 확인의 ‘보기’에서 ‘원본과 비교’를 누릅니다.</span></li>
            <li><strong>경계 이동</strong><span>드래그·방향키·Home·End로 0~100을 확인합니다.</span></li>
          </ol>
          <button type="button" className="handoff-studio-link" onClick={onGoToStudio}>
            Studio에서 직접 검증하기 <span aria-hidden="true">→</span>
          </button>
        </div>
      )}

      <ol className="handoff-flow" aria-label="AI 인계 과정">
        <li data-reveal style={{ '--reveal-order': 1 }}>
          <span>AI A · CLAUDE</span>
          <strong>작은 수직 기능</strong>
          <p>열기·닫기, 경계선 이동, 0·50·100 상태를 구현한 뒤 계획 중단.</p>
          <small>11분 · 요청 3회 · 검사 1~3</small>
        </li>
        <li data-reveal style={{ '--reveal-order': 2 }}>
          <span>HANDOFF.MD</span>
          <strong>대화 대신 실행 가능한 문서</strong>
          <p>현재 코드의 이유, 통과 검사, 남은 문제와 금지 영역을 일곱 항목으로 전달.</p>
          <small>사람의 추가 설명 0회 · 문서 수정 0회</small>
        </li>
        <li data-reveal style={{ '--reveal-order': 3 }}>
          <span>AI B · CODEX</span>
          <strong>완성과 회귀 검증</strong>
          <p>키보드·안내 상태를 보강하고 PNG·이력·템플릿까지 검사 10개를 완료.</p>
          <small>8분 · 요청 1회 · 검사 4~10</small>
        </li>
      </ol>

      <div className="handoff-grid">
        <article data-reveal>
          <p className="handoff-kicker">인계 문서의 일곱 항목</p>
          <ul className="handoff-items">
            {HANDOFF_ITEMS.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>
            ))}
          </ul>
          <p className="handoff-note">
            특히 ‘건드리면 안 되는 부분’이 편집 상태·PNG·되돌리기 경계를 고정해,
            다음 AI가 기능을 넓히면서 기존 결과를 바꾸지 않게 했습니다.
          </p>
        </article>

        <article data-reveal style={{ '--reveal-order': 1 }}>
          <p className="handoff-kicker">같은 단위로 기록한 결과</p>
          <div className="handoff-table-wrap">
            <table>
              <thead><tr><th>구분</th><th>AI A</th><th>AI B</th></tr></thead>
              <tbody>
                {METRICS.map(([label, a, b]) => (
                  <tr key={label}><th>{label}</th><td>{a}</td><td>{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="handoff-note">
            3 대 7은 속도 점수가 아니라 계획이 나눈 역할입니다. AI A 시간에는 기준 확인과
            인계 작성이, AI B 시간에는 전체 회귀 검사가 포함돼 단순 시간 순위로 쓰지 않습니다.
          </p>
        </article>
      </div>

      <article className="handoff-evidence" data-reveal>
        <div>
          <p className="handoff-kicker">고정 검사 10개 · 결과를 추측하지 않고 실행</p>
          <h3>3개를 넘겼고, 7개를 이어받아, 10/10 통과했습니다.</h3>
          <p>최종 회귀 검증은 단위 85건과 실제 브라우저 38건을 모두 실행했습니다.</p>
        </div>
        <ol className="handoff-checks">
          {CHECKS.map(([number, owner, title, proof]) => (
            <li key={number} className={owner === 'AI A' ? 'is-ai-a' : 'is-ai-b'}>
              <span>{number}</span>
              <div><strong>{title}</strong><small>{owner} · {proof}</small></div>
              <b>PASS</b>
            </li>
          ))}
        </ol>
      </article>

      <div className="handoff-conclusion" data-reveal>
        <article>
          <p className="handoff-kicker">다음 과제의 선택 기준</p>
          <ol>
            <li><strong>작고 고립된 UI</strong><span>Claude로 수직 구현을 시작하고, 저장·공유·이력 경계를 넘으면 Codex 검증으로 전환합니다.</span></li>
            <li><strong>회귀 범위가 넓은 기능</strong><span>Codex로 자동 검사를 먼저 고정하고, 화면 언어와 서사가 약하면 Claude 검토를 붙입니다.</span></li>
            <li><strong>AI를 바꾸는 순간</strong><span>HANDOFF와 받는 AI의 시작 지시서를 함께 만들고, 사람이 같은 내용을 다시 설명하면 인계 실패로 기록합니다.</span></li>
          </ol>
        </article>
        <article>
          <p className="handoff-kicker">AI 활용 3줄</p>
          <dl className="handoff-three-lines">
            <div><dt>AI에게 맡긴 일</dt><dd>기능 구현, 자동 검사, 인계 문서 구조화와 원격 동기화.</dd></div>
            <div><dt>내가 판단한 일</dt><dd>비교 기능 선택, 두 AI의 순서, 중단 시점과 제출 기준.</dd></div>
            <div><dt>AI 말을 안 들은 일</dt><dd>검사 통과만으로 끝내지 않고, 과정과 판단이 보이도록 한 단계 더 깊게 보강.</dd></div>
          </dl>
        </article>
      </div>

      <p className="handoff-disclosure" data-reveal>
        과정 감사 중 AI B가 금지된 AI A 작업 로그를 실수로 열람한 사실도 숨기지 않고
        기록했습니다. 구현 오류는 아니지만, 받는 AI용 시작 지시서도 인계 문서와 함께
        필요하다는 다음 실험의 개선점이 됐습니다.
      </p>
    </section>
  );
}
