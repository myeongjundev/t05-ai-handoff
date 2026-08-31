const METRICS = [
  ['주요 시각 구역', '23', '약 14'],
  ['반복 안내', '8', '3'],
  ['미리보기 조작 줄', '3', '1'],
  ['Studio 열', '3', '2'],
];

function BeforeWireframe() {
  return (
    <div className="cleanup-wireframe is-before" aria-hidden="true">
      <div className="wire-column wire-editor"><i /><i /><i /><i /></div>
      <div className="wire-column wire-canvas"><span /><b /><i /></div>
      <div className="wire-column wire-template"><i /><i /><i /></div>
    </div>
  );
}

function AfterWireframe() {
  return (
    <div className="cleanup-wireframe is-after" aria-hidden="true">
      <div className="wire-column wire-editor"><i /><i /><i /></div>
      <div className="wire-column wire-canvas"><span /><b /></div>
    </div>
  );
}

export default function StudioCleanupCaseStudy() {
  return (
    <section className="cleanup-case" aria-labelledby="cleanup-heading">
      <header className="cleanup-heading" data-reveal>
        <p>06 / POST-EXPERIMENT PRODUCT DECISION</p>
        <h2 id="cleanup-heading">기능을 덜지 않고,<br />결정해야 할 것만 먼저 보이게.</h2>
        <p>
          T05 실험을 끝낸 뒤 Studio를 다시 보니, 편집·결과·템플릿이 같은 무게로
          경쟁하고 있었습니다. 두 가지 목업을 비교한 뒤 결과물을 크게 보는
          Canvas-first 구조를 선택했습니다.
        </p>
      </header>

      <div className="cleanup-compare" data-reveal style={{ '--reveal-order': 1 }}>
        <article>
          <div className="cleanup-label"><span>BEFORE</span><strong>세 방향으로 분산</strong></div>
          <BeforeWireframe />
          <p>편집기, 미리보기, 템플릿이 모두 독립 패널이라 다음 행동보다 화면 구획이 먼저 보였습니다.</p>
        </article>
        <article className="is-selected">
          <div className="cleanup-label"><span>AFTER · OPTION A</span><strong>Canvas-first 2열</strong></div>
          <AfterWireframe />
          <p>템플릿은 편집기에 접고 저빈도 조작은 메뉴로 묶어, 편집과 결과의 관계를 가장 크게 남겼습니다.</p>
        </article>
      </div>

      <div className="cleanup-results" data-reveal>
        <div className="cleanup-metrics" aria-label="UI 정리 전후 측정">
          {METRICS.map(([label, before, after]) => (
            <div key={label}>
              <span>{label}</span>
              <p><del>{before}</del><b aria-label={`${before}에서 ${after}로`}>→</b><strong>{after}</strong></p>
            </div>
          ))}
        </div>
        <article className="cleanup-decision">
          <p>WHY OPTION A</p>
          <h3>Single-column보다 결과 확인 거리가 짧았습니다.</h3>
          <ul>
            <li>넓은 화면에서 편집과 결과를 동시에 비교</li>
            <li>PNG·템플릿·공유·비교 기능은 그대로 유지</li>
            <li>390px에서는 미리보기를 편집기보다 먼저 배치</li>
          </ul>
          <p className="cleanup-proof">회귀 검증 · 단위 85/85 · Chromium E2E 38/38</p>
        </article>
      </div>
    </section>
  );
}
