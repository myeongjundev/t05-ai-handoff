from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    PageBreak,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "T05-final-submission.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

font_regular = Path(r"C:\Windows\Fonts\malgun.ttf")
font_bold = Path(r"C:\Windows\Fonts\malgunbd.ttf")
pdfmetrics.registerFont(TTFont("Malgun", str(font_regular)))
pdfmetrics.registerFont(TTFont("MalgunBold", str(font_bold)))

NAVY = colors.HexColor("#102A43")
BLUE = colors.HexColor("#1769E0")
CYAN = colors.HexColor("#10B6C8")
INK = colors.HexColor("#1F2937")
MUTED = colors.HexColor("#52606D")
PALE = colors.HexColor("#EFF6FF")
PALE_CYAN = colors.HexColor("#ECFEFF")
LINE = colors.HexColor("#D9E2EC")
GREEN = colors.HexColor("#16835A")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="KBody", fontName="Malgun", fontSize=7.5, leading=10.5, textColor=INK, spaceAfter=1.5 * mm))
styles.add(ParagraphStyle(name="KSmall", fontName="Malgun", fontSize=6.3, leading=8.6, textColor=MUTED))
styles.add(ParagraphStyle(name="KTitle", fontName="MalgunBold", fontSize=20, leading=24, textColor=NAVY, spaceAfter=2 * mm))
styles.add(ParagraphStyle(name="KDeck", fontName="Malgun", fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=3 * mm))
styles.add(ParagraphStyle(name="KH1", fontName="MalgunBold", fontSize=12.5, leading=16, textColor=NAVY, spaceBefore=1.5 * mm, spaceAfter=1.5 * mm))
styles.add(ParagraphStyle(name="KH2", fontName="MalgunBold", fontSize=9.5, leading=12, textColor=BLUE, spaceBefore=1 * mm, spaceAfter=1 * mm))
styles.add(ParagraphStyle(name="KCard", fontName="Malgun", fontSize=7.2, leading=9.6, textColor=INK))
styles.add(ParagraphStyle(name="KCardBold", fontName="MalgunBold", fontSize=7.2, leading=9.6, textColor=NAVY))
styles.add(ParagraphStyle(name="KCardWhite", fontName="MalgunBold", fontSize=7.2, leading=9.6, textColor=colors.white))
styles.add(ParagraphStyle(name="KCenter", fontName="MalgunBold", fontSize=7, leading=9, textColor=INK, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="KCenterWhite", fontName="MalgunBold", fontSize=7, leading=9, textColor=colors.white, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="KUrl", fontName="Malgun", fontSize=6.7, leading=9, textColor=BLUE, wordWrap="CJK"))


def p(text, style="KBody"):
    return Paragraph(text, styles[style])


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 8 * mm, width, 8 * mm, fill=1, stroke=0)
    canvas.setFillColor(CYAN)
    canvas.rect(0, height - 8 * mm, 45 * mm, 1.2 * mm, fill=1, stroke=0)
    canvas.setFont("Malgun", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "SKT FLY AI · T05 제출 확인 자료")
    canvas.drawRightString(width - 18 * mm, 10 * mm, f"{doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    topMargin=14 * mm,
    bottomMargin=13 * mm,
    title="T05 최종 제출 확인 자료",
    author="T05 AI Handoff Project",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=header_footer)])

story = []
story += [Spacer(1, 2 * mm), p("T05 · 대화가 끊겨도 이어지는 프로젝트", "KTitle")]
story += [p("두 AI 세션이 같은 검사와 사용 상한 아래 하나의 기능을 이어서 완성하고, 저장소와 인수인계 문서만으로 작업을 재개할 수 있는지 검증한 결과입니다.", "KDeck")]
story += [p("고정 검사 10/10 · 단위 85/85 · Chromium 38/38 · 프로덕션 빌드 PASS", "KCardBold")]

story += [p("1. 제출 URL", "KH1")]
url_table = Table([
    [p("결과물", "KCardBold"), p("https://myeongjundev.github.io/t05-ai-handoff/", "KUrl")],
    [p("고정 소스", "KCardBold"), p("https://github.com/myeongjundev/t05-ai-handoff/commit/bb774e890ba65b73ee99dac44453e9883b3650a9", "KUrl")],
], colWidths=[30 * mm, doc.width - 30 * mm])
url_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, -1), PALE),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story += [url_table, Spacer(1, 2 * mm)]

story += [p("2. 재현·통과 확인 4가지", "KH1")]
checks = [
    ("어디로 가나요", "공개 결과물 URL을 열고 사이드바의 Studio로 이동합니다."),
    ("무엇을 하나요", "① 샘플 사진 선택 → ② 보기에서 원본과 비교 선택 → ③ 흰 경계선을 좌우로 이동합니다."),
    ("통과 모습", "원본과 완성 카드의 비율 숫자가 즉시 함께 바뀌고, T05 결과에서 AI A → HANDOFF → AI B와 검사 10/10이 보입니다."),
    ("안 될 때", "사진이 없으면 비교 버튼이 비활성화되고 먼저 사진을 고르라는 안내가 보입니다."),
]
card_rows = [[p(title, "KCardBold"), p(body, "KCard")] for title, body in checks]
card = Table(card_rows, colWidths=[32 * mm, doc.width - 32 * mm])
card.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, -1), PALE_CYAN),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story += [card, Spacer(1, 2 * mm)]

story += [p("3. AI와 내 판단 3줄", "KH1")]
judgment = [
    ("AI에게 맡긴 일", "비교 슬라이더 구현, 자동 검사 작성·실행, 인수인계 문서 구조화와 회귀 검증"),
    ("내가 판단한 일", "비교 기능 선택, 검사 10개와 공통 상한, AI A 중단 시점, A → B 순서와 최종 제출 기준"),
    ("AI 말을 안 들은 일", "검사 통과만 보여 주는 대신 과정과 판단이 보이도록 사례 연구와 30초 검증 동선을 추가"),
]
j_rows = [[p(a, "KCardBold"), p(b, "KCard")] for a, b in judgment]
jtable = Table(j_rows, colWidths=[38 * mm, doc.width - 38 * mm])
jtable.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, -1), PALE),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story += [jtable]

story += [Spacer(1, 2 * mm), p("4. 작업 전에 고정한 검사 10개", "KH1")]
story += [p("T05-TEST-01~10은 작업 전에 고정한 검사 1~10의 제출용 식별자이며, 내용·입력·기대값은 변경하지 않았습니다.", "KSmall")]
tests = [
    ("T05-TEST-01", "사진 선택 후 비교 버튼 두 번 입력", "비교 화면 열림 → 닫힘"),
    ("T05-TEST-02", "경계선을 30%로 이동", "원본 30% · 카드 70%가 함께 표시"),
    ("T05-TEST-03", "경계선을 0·50·100%로 이동", "완성만 · 반반 · 원본만 표시"),
    ("T05-TEST-04", "비교 중 시대 또는 모습 변경", "카드만 갱신, 원본·비교 상태 유지"),
    ("T05-TEST-05", "사진 없이 비교 버튼 확인", "비활성화와 사진 선택 이유 표시"),
    ("T05-TEST-06", "방향키·Home·End 입력", "0~100 안에서 한 칸·양 끝 이동"),
    ("T05-TEST-07", "경계선을 프레임 밖까지 드래그", "0 또는 100 고정, 오류 없음"),
    ("T05-TEST-08", "비교 전후 PNG 다운로드", "PNG 바이트 동일"),
    ("T05-TEST-09", "비교 뒤 되돌리기·다시하기", "편집값 이전 상태와 복원 상태 일치"),
    ("T05-TEST-10", "비교 중 템플릿 저장·불러오기", "편집값만 복원, 비교 상태 미저장"),
]
test_data = [[p("ID", "KCenterWhite"), p("입력", "KCenterWhite"), p("관찰 가능한 기대값", "KCenterWhite"), p("결과", "KCenterWhite")]]
for test_id, inp, expected in tests:
    test_data.append([p(test_id, "KSmall"), p(inp, "KSmall"), p(expected, "KSmall"), p("PASS", "KCenter")])
tt = Table(test_data, colWidths=[30 * mm, 54 * mm, 68 * mm, 22 * mm], repeatRows=1)
tt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("TOPPADDING", (0, 0), (-1, -1), 3),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
]))
story += [tt, Spacer(1, 2 * mm), p("검사 삭제 0건 · 검사 완화 0건 · 기대값 변경 0건 · 최종 10/10 PASS", "KCardBold")]

story += [PageBreak(), Spacer(1, 2 * mm), p("5. 이름을 가린 측정표", "KH1")]
story += [p("두 AI에 작업 전에 같은 상한인 최대 45분, 최대 요청 5회를 적용했습니다. 오류 수는 고정 검사 실행에서 하나 이상의 FAIL이 나온 실행 회차 수입니다.", "KBody")]
metrics = [
    [p("판정용 이름", "KCenterWhite"), p("작업시간", "KCenterWhite"), p("요청", "KCenterWhite"), p("FAIL 회차", "KCenterWhite"), p("통과", "KCenterWhite"), p("상한", "KCenterWhite")],
    [p("AI A", "KCenter"), p("11분", "KCenter"), p("3회", "KCenter"), p("0회", "KCenter"), p("3/10", "KCenter"), p("PASS", "KCenter")],
    [p("AI B", "KCenter"), p("8분", "KCenter"), p("1회", "KCenter"), p("0회", "KCenter"), p("10/10", "KCenter"), p("PASS", "KCenter")],
]
mt = Table(metrics, colWidths=[34 * mm, 28 * mm, 25 * mm, 30 * mm, 28 * mm, 29 * mm])
mt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("BACKGROUND", (0, 1), (-1, -1), PALE_CYAN),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [mt, Spacer(1, 2 * mm), p("AI A 종료: 1~3 PASS · 4~10 미실행 · FAIL 회차 0. AI B는 4~10 구현 뒤 전체 1~10을 재실행해 10/10 PASS를 확인했습니다.", "KSmall")]
story += [p("판정 구간의 비교표는 공개 결과물 화면 · README · FINAL_COMPARISON 모두 모델·서비스 이름을 가린 AI A / AI B 로만 표기합니다. 실제 이름은 docs/AI-A-LOG.md 와 docs/AI-B-LOG.md 에 그대로 공개합니다.", "KSmall")]
story += [p("FINAL_COMPARISON 의 AI B 통과 검사는 한때 7로 적혀 같은 문서의 최종 검사표와 어긋나 있었습니다. 7은 배정 수였고, 배정 검사 7 과 최종 실행·통과 검사 10 으로 나눠 정정했습니다.", "KSmall")]

story += [Spacer(1, 2 * mm), p("6. 고정 소스 버전과 인수인계", "KH1")]
versions = [
    [p("구간", "KCenterWhite"), p("시작 버전", "KCenterWhite"), p("종료 버전", "KCenterWhite")],
    [p("AI A", "KCenter"), p("4dae838787beb2f5ccb57cbbc82de44c5fe442a1", "KSmall"), p("f065eb6a090c516d59ac4766039df03a62d911e4", "KSmall")],
    [p("AI B", "KCenter"), p("ec93fe1a8f0b7bb9b3181f461dc79cd8c2ed9310", "KSmall"), p("362c7118765429d7477c7c1a6ed5474ad2c22bb5", "KSmall")],
]
vt = Table(versions, colWidths=[24 * mm, 75 * mm, 75 * mm])
vt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [vt, Spacer(1, 2 * mm)]
story += [p("순서: AI A 시작 → AI A 종료·인수인계 → AI B 시작 → AI B 완료", "KCardBold")]
story += [p("공통 입력: 기능 문장 · 고정 검사 10개 · 45분/5회 상한 · 시작 소스. 역할별 지시: AI A는 1~3 뒤 인계, AI B는 4~10 완성과 전체 재검사.", "KSmall")]
story += [p("인수인계 7항목: 목표 · 현재 상태 · 실행 명령 · 통과 검사 · 남은 문제 · 다음 행동 · 건드리지 말 것. HANDOFF 수정 0회, 별도 대화 전문 제공 0회. AI-A-LOG를 연 절차 오류 1건은 공개 기록했습니다.", "KSmall")]
story += [p("HANDOFF 의 성공 기준인 단위 83건은 AI A 가 멈춘 시점의 값입니다. AI B 가 검사 6용 단위 2건을 추가해 현재는 85건이며, 검사 완화나 삭제로 늘어난 수가 아닙니다.", "KSmall")]

story += [Spacer(1, 2 * mm), p("7. 새 작업 폴더 재현과 자동 검증", "KH1")]
verification = [
    [p("인계 증거", "KCardBold"), p("필수 자료 10개 · 보호 문서 5개 · 핵심 커밋 5개 PASS (봉인 정정 2건은 각 문서의 정정 이력에 기록)", "KCard")],
    [p("제품 검증", "KCardBold"), p("단위 85/85 · Chromium 38/38 · 프로덕션 빌드 PASS", "KCard")],
    [p("새 폴더 재현", "KCardBold"), p("고정 소스 8409608… 과 제출 커밋 bb774e8… 을 각각 새 폴더에 재수신 → npm install → 단위 85/85 → 빌드 PASS", "KCard")],
    [p("봉인 정정", "KCardBold"), p("2026-09-01 AI-B-LOG 시작 커밋 오기 1건과 FINAL_COMPARISON 통과 수 표기·이름 가림을 정정하며 봉인 값을 재고정. 두 문서 하단 정정 이력에 무엇을·왜·언제를 기록. 측정값 변경 0건", "KCard")],
    [p("공개 접근", "KCardBold"), p("결과물 URL · 고정 소스 URL 모두 HTTP 200", "KCard")],
    [p("안전 확인", "KCardBold"), p("개인정보 0건 · 비밀값 원문 0건", "KCard")],
]
ver = Table(verification, colWidths=[32 * mm, doc.width - 32 * mm])
ver.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, -1), PALE_CYAN),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story += [ver, Spacer(1, 2 * mm)]
decision = Table([[p("도구 선택 기준", "KCardWhite"), p("화면 한 곳의 작은 UI는 AI A로 빠르게 수직 구현하고, 저장·공유·이력처럼 영향 범위가 넓어지면 AI B로 전환해 자동 회귀 검사를 고정한다.", "KCard")]], colWidths=[34 * mm, doc.width - 34 * mm])
decision.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (0, 0), colors.white),
    ("BACKGROUND", (1, 0), (1, 0), PALE),
    ("BOX", (0, 0), (-1, -1), 0.8, BLUE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 9),
    ("RIGHTPADDING", (0, 0), (-1, -1), 9),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story += [decision]

story += [Spacer(1, 2 * mm), p("8. 제출 전 최종 체크", "KH1")]
final_checks = [
    ("공개 접근", "결과물과 소스 고정 커밋이 로그인·초대·비밀번호 없이 열림", "PASS"),
    ("판정 동선", "Studio에서 사진 선택 → 원본과 비교 → 경계 이동, 3단계", "PASS"),
    ("고정 조건", "검사 10개, 공통 45분·5회 상한, 삭제·완화·기대값 변경 0건", "PASS"),
    ("인수인계", "7항목과 A 시작 → A 인계 → B 시작 → B 완료 순서 보존", "PASS"),
    ("익명 비교", "판정 구간에는 모델명 대신 AI A·AI B만 표시", "PASS"),
    ("제출 문구", "확인 방법 4가지와 AI·내 판단 3줄을 구분해 작성", "PASS"),
]
fc_data = [[p("항목", "KCenterWhite"), p("확인 내용", "KCenterWhite"), p("결과", "KCenterWhite")]]
for label, detail, result in final_checks:
    fc_data.append([p(label, "KCardBold"), p(detail, "KCard"), p(result, "KCenter")])
fc = Table(fc_data, colWidths=[30 * mm, 122 * mm, 22 * mm], repeatRows=1)
fc.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
    ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story += [fc, Spacer(1, 2 * mm)]
story += [p("평가자가 확인할 핵심 근거", "KH2")]
story += [p("docs/EXPERIMENT_PLAN.md · docs/HANDOFF.md · docs/AI-A-LOG.md · docs/AI-B-LOG.md · docs/FINAL_COMPARISON.md · docs/T05-VERIFICATION.md", "KSmall")]

doc.build(story)
print(OUTPUT)
