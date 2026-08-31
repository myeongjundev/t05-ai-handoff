const HANDOFF_ITEMS = [
  '목표',
  '현재 상태',
  '실행 명령',
  '통과한 검사',
  '남은 문제',
  '다음 행동',
  '주의 사항',
];

export default function HandoffExperiment() {
  return (
    <section className="handoff-experiment" aria-labelledby="handoff-heading">
      <header className="handoff-heading" data-reveal>
        <p>05 / AI HANDOFF EXPERIMENT</p>
        <h2 id="handoff-heading">대화가 끊겨도,<br />프로젝트는 이어졌습니다.</h2>
        <p>
          Claude가 검사 1~3에서 계획대로 멈추고 저장소와 일곱 항목의 인계 문서를
          남겼습니다. Codex는 첫 대화 없이 그 문서를 작업 기준으로 삼아 검사 4~10을
          완성했습니다.
        </p>
      </header>

      <ol className="handoff-flow" aria-label="AI 인계 과정">
        <li data-reveal style={{ '--reveal-order': 1 }}>
          <span>AI A · CLAUDE</span>
          <strong>작은 수직 기능</strong>
          <p>열기·닫기, 경계선 이동, 0·50·100 상태를 구현한 뒤 계획 중단.</p>
        </li>
        <li data-reveal style={{ '--reveal-order': 2 }}>
          <span>HANDOFF.MD</span>
          <strong>대화 대신 실행 가능한 문서</strong>
          <p>현재 코드의 이유, 통과 검사, 남은 문제와 금지 영역을 일곱 항목으로 전달.</p>
        </li>
        <li data-reveal style={{ '--reveal-order': 3 }}>
          <span>AI B · CODEX</span>
          <strong>완성과 회귀 검증</strong>
          <p>키보드·안내 상태를 보강하고 PNG·이력·템플릿까지 검사 10개를 완료.</p>
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
        </article>

        <article data-reveal style={{ '--reveal-order': 1 }}>
          <p className="handoff-kicker">같은 기준으로 비교한 결과</p>
          <div className="handoff-table-wrap">
            <table>
              <thead>
                <tr><th>구분</th><th>AI A</th><th>AI B</th></tr>
              </thead>
              <tbody>
                <tr><th>담당</th><td>첫 구현</td><td>완성·회귀</td></tr>
                <tr><th>검사</th><td>1~3</td><td>4~10 + 전체 재검사</td></tr>
                <tr><th>종료</th><td>계획 중단</td><td>10/10 통과</td></tr>
                <tr><th>대화 전달</th><td>전달하지 않음</td><td>HANDOFF로 재개</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <aside className="handoff-lessons" data-reveal>
        <p className="handoff-kicker">다음 과제의 선택 기준</p>
        <ul>
          <li>화면 한 곳의 작은 기능은 빠른 구현과 좁은 검사로 시작합니다.</li>
          <li>저장·내보내기·이력까지 닿는 기능은 실제 브라우저 회귀 검사를 우선합니다.</li>
          <li>인계 문서에는 설명보다 실행 명령·통과 번호·금지 영역을 먼저 남깁니다.</li>
        </ul>
      </aside>

      <p className="handoff-disclosure" data-reveal>
        과정 감사 중 AI B가 금지된 AI A 작업 로그를 실수로 열람한 사실도 숨기지 않고
        기록했습니다. 이후 구현 판단은 인계 문서·코드·고정 검사만으로 진행했습니다.
      </p>
    </section>
  );
}
