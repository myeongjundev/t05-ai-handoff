import { forwardRef, useEffect, useRef, useState } from 'react';
import { RATIO_KEYS, getCanvasSize } from '../state/editorState.js';
import { buildReadyChecks } from '../state/readyCheck.js';
import { getRecommendedRatio } from '../state/presets.js';
import {
  canCompare,
  comparePercents,
  createCompareState,
  positionFromKey,
  setComparePosition,
  syncCompareToImage,
  toggleCompare,
} from '../state/compareMode.js';

/**
 * 미리보기.
 *
 * 캔버스의 내부 해상도는 실제 출력 해상도(1080×H)와 같고, 화면에는 CSS 로만
 * 축소해서 보여준다. 다운로드는 이 캔버스를 그대로 파일로 만들기 때문에
 * 미리보기와 결과물이 같은 픽셀이 된다.
 */

/** 문구를 집을 수 있는 여유. 얇은 글자도 잡기 쉽도록 사각형을 조금 넓힌다. */
const GRAB_PADDING = 24;

const PreviewPanel = forwardRef(function PreviewPanel(
  {
    state,
    textArea,
    layout,
    contrast,
    onChange,
    onMoveText,
    onDownload,
    onCopyImage,
    onShare,
    canDownload,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
  },
  canvasRef
) {
  const size = getCanvasSize(state.ratio);
  const recommendedRatio = getRecommendedRatio(state.persona, state.era);
  const dragRef = useRef(null);
  const [grabbable, setGrabbable] = useState(false);
  // 커서 모양을 바꾸려면 리렌더가 필요하므로 ref 와 별개로 상태를 둔다.
  const [dragging, setDragging] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [mobileDocked, setMobileDocked] = useState(false);
  const [showcaseMode, setShowcaseMode] = useState(false);
  // 비교 모드는 보기 상태다. 편집 상태·템플릿·공유 링크에 넣지 않는다.
  const [compare, setCompare] = useState(createCompareState);
  const comparable = canCompare(state.image);
  // 사진을 지우면 열어 둔 비교 모드를 닫는다. 열린 채 갇히지 않게 한다.
  useEffect(() => {
    setCompare((current) => syncCompareToImage(current, state.image));
  }, [state.image]);
  const readyChecks = buildReadyChecks({
    state,
    layout,
    contrast,
    canExport: canDownload,
    canvasHeight: size.height,
  });
  const warningCount = readyChecks.filter((item) => item.status === 'warn').length;
  const personaLabel = {
    normal: '기본',
    social: '소셜',
    'close-friends': '친한 친구',
  }[state.persona] ?? state.persona;
  const previewLabel = [
    `카드 미리보기, ${state.ratio}`,
    `${personaLabel} 모습`,
    `${state.era} 시대`,
    state.image ? '배경 이미지 있음' : '배경 이미지 없음',
    state.text.trim() ? `문구: ${state.text.replace(/\n/g, ' ')}` : '문구 없음',
    layout?.shrunk
      ? `문구가 ${layout.fontSize < 10 ? layout.fontSize.toFixed(1) : Math.round(layout.fontSize)}픽셀로 자동 축소됨`
      : null,
  ].filter(Boolean).join('. ');

  /**
   * 화면 좌표를 0~1 정규화 좌표로 바꾼다. CSS 크기와 내부 해상도가 다르므로 비율로 계산한다.
   * 캔버스가 아직 배치되지 않아 크기가 0 이면 0 으로 나누게 되므로 null 을 돌려준다.
   */
  const toNormalized = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      nx: (event.clientX - rect.left) / rect.width,
      ny: (event.clientY - rect.top) / rect.height,
    };
  };

  /** 문구 사각형 안에서 시작했는지 본다. 빈 곳을 눌렀을 때 문구가 튀지 않게 한다. */
  const isOverText = (canvas, event) => {
    if (!textArea) return false;
    const point = toNormalized(canvas, event);
    if (!point) return false;
    const { nx, ny } = point;
    const px = nx * canvas.width;
    const py = ny * canvas.height;
    return (
      px >= textArea.x - GRAB_PADDING &&
      px <= textArea.x + textArea.width + GRAB_PADDING &&
      py >= textArea.y - GRAB_PADDING &&
      py <= textArea.y + textArea.height + GRAB_PADDING
    );
  };

  const comparePercent = comparePercents(compare);
  const compareDragRef = useRef(null);

  /**
   * 프레임 안의 가로 위치를 0~100 으로 바꾼다. 프레임 밖까지 끌어도 자르는 것은
   * `setComparePosition` 한 곳이므로 여기서는 비율만 낸다.
   */
  const moveBoundary = (frame, clientX) => {
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0) return;
    setCompare((current) =>
      setComparePosition(current, ((clientX - rect.left) / rect.width) * 100)
    );
  };

  const handleComparePointerDown = (event) => {
    const frame = event.currentTarget;
    compareDragRef.current = event.pointerId;
    // 누른 자리로 먼저 옮긴다. 아래 포인터 잡기가 실패해도 이 한 번은 살아야 한다.
    moveBoundary(frame, event.clientX);
    event.preventDefault();
    // 포인터 잡기는 없어도 되는 개선이다. 프레임 밖으로 나간 뒤의 이동까지
    // 따라가려고 쓰는 것이고, 브라우저가 거절하면 프레임 안에서만 동작한다.
    // 거절을 그대로 던지면 경계선이 눌린 자리에서 멈춘다.
    try {
      frame.setPointerCapture(event.pointerId);
    } catch {
      compareDragRef.current = null;
    }
  };

  const handleComparePointerMove = (event) => {
    if (compareDragRef.current !== event.pointerId) return;
    moveBoundary(event.currentTarget, event.clientX);
  };

  const handleComparePointerEnd = (event) => {
    if (compareDragRef.current !== event.pointerId) return;
    compareDragRef.current = null;
    const frame = event.currentTarget;
    if (frame.hasPointerCapture?.(event.pointerId)) {
      frame.releasePointerCapture(event.pointerId);
    }
  };

  const handleCompareKeyDown = (event) => {
    const next = positionFromKey(compare.position, event.key);
    if (next === null) return;
    event.preventDefault();
    setCompare((current) => {
      const position = positionFromKey(current.position, event.key);
      return position === null ? current : setComparePosition(current, position);
    });
  };

  const handlePointerDown = (event) => {
    const canvas = event.currentTarget;
    if (!isOverText(canvas, event)) return;

    const point = toNormalized(canvas, event);
    if (!point) return;
    const { nx, ny } = point;
    // 잡은 지점과 문구 기준점의 거리를 유지한다. 그래야 문구가 커서로 순간이동하지 않는다.
    dragRef.current = {
      pointerId: event.pointerId,
      startX: nx,
      startY: ny,
      originX: state.textX,
      originY: state.textY,
    };
    canvas.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    const canvas = event.currentTarget;
    const drag = dragRef.current;

    if (!drag) {
      // 끌 수 있는 자리인지 커서로 알려 준다.
      setGrabbable(isOverText(canvas, event));
      return;
    }
    if (drag.pointerId !== event.pointerId) return;

    const point = toNormalized(canvas, event);
    if (!point) return;
    onMoveText(
      drag.originX + (point.nx - drag.startX),
      drag.originY + (point.ny - drag.startY)
    );
  };

  const handlePointerEnd = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    const canvas = event.currentTarget;
    if (canvas.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section
      className={`panel panel-preview${mobileDocked ? ' is-mobile-docked' : ''}${showcaseMode ? ' is-showcase' : ''}`}
      aria-labelledby="preview-heading"
    >
      <h2 id="preview-heading"><span>02</span> 결과 확인</h2>

      {showcaseMode && (
        <div className="showcase-caption" aria-live="polite">
          <p>ALTER EGO · {state.era}</p>
          <strong>지금의 나를<br />한 시대의 장면으로.</strong>
        </div>
      )}

      <div className="preview-toolbar">
        <div className="ratio-block">
          <div className="ratio-group segmented" role="group" aria-label="화면 비율">
            {RATIO_KEYS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                aria-pressed={state.ratio === ratio}
                onClick={() => onChange({ ratio })}
              >
                {ratio}
              </button>
            ))}
          </div>
          {/*
            지금 조합에 어울리는 비율을 권할 뿐, 말없이 바꾸지는 않는다.
            비율은 사용자가 고른 값이다.
          */}
          {recommendedRatio && recommendedRatio !== state.ratio && (
            <button
              type="button"
              className="ratio-suggestion"
              onClick={() => onChange({ ratio: recommendedRatio })}
              title={`${recommendedRatio} 로 바꿉니다. 문구와 이미지는 그대로 둡니다.`}
            >
              이 조합엔 {recommendedRatio} 추천 · 적용
            </button>
          )}
        </div>

        <div className="preview-actions">
          <div className="history-icons" aria-label="편집 이력">
            <button
              type="button"
              className="small icon-button"
              aria-label="실행 취소"
              onClick={onUndo}
              disabled={!canUndo}
              title="실행 취소 (Ctrl+Z)"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10H9" />
              </svg>
            </button>
            <button
              type="button"
              className="small icon-button"
              aria-label="다시 실행"
              onClick={onRedo}
              disabled={!canRedo}
              title="다시 실행 (Ctrl+Shift+Z)"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 14l5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h6" />
              </svg>
            </button>
          </div>

          <details className="toolbar-menu view-menu">
            <summary>보기 <span aria-hidden="true">▾</span></summary>
            <div className="toolbar-popover">
              <button
                type="button"
                className="small mobile-dock-toggle"
                aria-pressed={mobileDocked}
                onClick={() => setMobileDocked((docked) => !docked)}
              >
                {mobileDocked ? '큰 미리보기' : '편집하며 보기'}
              </button>
              <button
                type="button"
                className="small showcase-toggle"
                aria-pressed={showcaseMode}
                onClick={() => setShowcaseMode((visible) => !visible)}
              >
                {showcaseMode ? '편집으로 돌아가기' : '작품으로 보기 ↗'}
              </button>
              <button
                type="button"
                className="small compare-toggle"
                aria-pressed={compare.open}
                aria-describedby={!comparable ? 'compare-unavailable' : undefined}
                disabled={!comparable}
                onClick={() => setCompare((current) => toggleCompare(current, state.image))}
              >
                {compare.open ? '비교 닫기' : '원본과 비교'}
              </button>
              {!comparable && (
                <span className="compare-unavailable" id="compare-unavailable">
                  먼저 사진을 골라야 비교할 수 있습니다.
                </span>
              )}
              {state.ratio === '9:16' && (
                <button
                  type="button"
                  className="small safe-area-toggle"
                  aria-pressed={showSafeArea}
                  onClick={() => setShowSafeArea((visible) => !visible)}
                >
                  {showSafeArea ? '안전 영역 가이드 숨기기' : '안전 영역 가이드 보기'}
                </button>
              )}
            </div>
          </details>

          <details className="toolbar-menu share-menu">
            <summary>공유 <span aria-hidden="true">▾</span></summary>
            <div className="toolbar-popover">
              <button type="button" className="small" onClick={onShare}>링크 복사</button>
              <button type="button" className="small" onClick={onCopyImage} disabled={!canDownload}>
                이미지 복사
              </button>
            </div>
          </details>

          <button
            type="button"
            className="primary download-action"
            onClick={onDownload}
            disabled={!canDownload}
          >
            이미지 다운로드
          </button>
        </div>
      </div>

      <div className="canvas-stage">
        {mobileDocked && (
          <button
            type="button"
            className="dock-restore"
            onClick={() => setMobileDocked(false)}
            aria-label="큰 미리보기로 돌아가기"
          >
            크게
          </button>
        )}
        <div
          className="canvas-frame"
          style={{ width: `min(100%, ${(size.width / size.height) * 70}vh)` }}
        >
          <canvas
            ref={canvasRef}
            className={
              dragging ? 'dragging' : grabbable ? 'grabbable' : undefined
            }
            width={size.width}
            height={size.height}
            role="img"
            aria-label={previewLabel}
            aria-describedby="preview-description ready-check-list"
            data-image-cache={layout?.imageCache ?? undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onPointerLeave={() => setGrabbable(false)}
          />
          {compare.open && state.image && (
            <div
              className="compare-layer"
              role="slider"
              tabIndex={0}
              aria-label="원본과 완성 카드 비교 경계선"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={compare.position}
              aria-valuetext={`원본 ${comparePercent.original}%, 완성 카드 ${comparePercent.card}%`}
              onPointerDown={handleComparePointerDown}
              onPointerMove={handleComparePointerMove}
              onPointerUp={handleComparePointerEnd}
              onPointerCancel={handleComparePointerEnd}
              onKeyDown={handleCompareKeyDown}
            >
              {/*
                원본은 카드와 같은 fit 으로 얹는다. 다른 방식으로 맞추면 같은
                사진이 다르게 잘려서 비교가 거짓이 된다.
              */}
              <img
                className="compare-original"
                src={state.image.src}
                alt=""
                aria-hidden="true"
                style={{
                  objectFit: state.fit,
                  clipPath: `inset(0 ${100 - compare.position}% 0 0)`,
                }}
              />
              <div
                className="compare-divider"
                style={{ left: `${compare.position}%` }}
                aria-hidden="true"
              />
            </div>
          )}
          {state.ratio === '9:16' && showSafeArea && (
            <div className="safe-area-guide" aria-hidden="true">
              <span>화면 버튼과 겹칠 수 있는 영역</span>
            </div>
          )}
        </div>
      </div>

      {compare.open && (
        <p className="compare-readout" aria-live="polite">
          원본 <strong>{comparePercent.original}%</strong>
          {' · '}
          완성 카드 <strong>{comparePercent.card}%</strong>
          <span> — 경계선을 끌거나 방향키·Home·End로 움직이세요.</span>
        </p>
      )}

      <p className="preview-meta" id="preview-description">
        출력 크기 {size.width} × {size.height}px · 화면에 보이는 그림과 내려받는
        파일은 같은 캔버스입니다.
        <br />
        문구를 끌어서 옮길 수 있습니다. 왼쪽 슬라이더로도 조절됩니다.
      </p>

      <aside className="ready-check" aria-labelledby="ready-check-heading">
        <div className="ready-check-head">
          <span className={warningCount ? 'ready-summary warn' : 'ready-summary pass'}>
            {warningCount ? `${warningCount}개 확인` : '준비 완료'}
          </span>
          <h3 id="ready-check-heading">게시 전 확인</h3>
        </div>
        <ul id="ready-check-list">
          {readyChecks.map((check) => (
            <li key={check.id} className={check.status}>
              <span aria-hidden="true">{check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '·'}</span>
              {check.label}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
});

export default PreviewPanel;
