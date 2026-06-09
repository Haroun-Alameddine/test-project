// ==============================================================
// InDesign ExtendScript — Educational Infographic Layout
// Spread 1 : Chapter 7  (児童労働)         Pages 366–367
// Spread 2 : Chapter 9  (経済の男女格差)   Pages 378–379
//
// HOW TO RUN:
//   InDesign > File > Scripts > Script Console
//   Paste this file or run via Scripts panel
//
// HOW TO PLACE WORD TEXT AFTERWARDS:
//   File > Place > choose your .docx file
//   Click inside any labelled text frame
// ==============================================================

#target indesign

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

var doc, NONE, BLACK, WHITE;

function mm(v) { return v; }   // units are already mm after setup

/** Add or retrieve a CMYK colour swatch */
function addColor(name, c, m, y, k) {
    var col;
    try { col = doc.colors.itemByName(name); if (col.isValid) return col; } catch(e) {}
    col = doc.colors.add();
    col.name = name;
    col.model = ColorModel.PROCESS;
    col.space = ColorSpace.CMYK;
    col.colorValue = [c, m, y, k];
    return col;
}

/**
 * Add a rectangle to a page.
 * Coordinates are PAGE-LOCAL (origin = page top-left).
 * ob = page.bounds [top, left, bottom, right] in spread coords.
 */
function R(page, ob, t, l, b, r, fill, stroke, sw) {
    var rect = page.rectangles.add();
    rect.geometricBounds = [ob[0]+t, ob[1]+l, ob[0]+b, ob[1]+r];
    rect.fillColor   = fill   || NONE;
    rect.strokeColor = stroke || NONE;
    if (sw !== undefined) rect.strokeWeight = sw;
    return rect;
}

/** Add an oval, same coordinate convention */
function O(page, ob, t, l, b, r, fill, stroke, sw) {
    var ov = page.ovals.add();
    ov.geometricBounds = [ob[0]+t, ob[1]+l, ob[0]+b, ob[1]+r];
    ov.fillColor   = fill   || NONE;
    ov.strokeColor = stroke || NONE;
    if (sw !== undefined) ov.strokeWeight = sw;
    return ov;
}

/** Add a text frame, same coordinate convention */
function T(page, ob, t, l, b, r, content, size, bold, color, align) {
    var tf = page.textFrames.add();
    tf.geometricBounds = [ob[0]+t, ob[1]+l, ob[0]+b, ob[1]+r];
    tf.fillColor   = NONE;
    tf.strokeColor = NONE;
    if (content !== null) tf.contents = content;

    var txt = tf.texts[0];
    if (size)  txt.pointSize = size;
    if (bold)  txt.fontStyle = "Bold";
    if (color) txt.fillColor = color;
    if (align) txt.justification = align;
    return tf;
}

/** Image placeholder (grey box + centred label) */
function IMG(page, ob, t, l, b, r, label) {
    var bx = R(page, ob, t, l, b, r, lightGray, BLACK, 0.25);
    var midT = t + (b - t) / 2 - 5;
    var tf  = T(page, ob, midT, l+4, midT+10, r-4,
                label, 8, false, BLACK, Justification.CENTER_ALIGN);
    return bx;
}

/** Rounded-corner rectangle */
function RR(page, ob, t, l, b, r, fill, stroke, sw, radius) {
    var rect = R(page, ob, t, l, b, r, fill, stroke, sw);
    if (radius) {
        rect.topLeftCornerOption     = CornerOptions.ROUNDED_CORNER;
        rect.topRightCornerOption    = CornerOptions.ROUNDED_CORNER;
        rect.bottomLeftCornerOption  = CornerOptions.ROUNDED_CORNER;
        rect.bottomRightCornerOption = CornerOptions.ROUNDED_CORNER;
        rect.topLeftCornerRadius     = radius;
        rect.topRightCornerRadius    = radius;
        rect.bottomLeftCornerRadius  = radius;
        rect.bottomRightCornerRadius = radius;
    }
    return rect;
}

// ──────────────────────────────────────────────────────────────
// DOCUMENT SETUP
// ──────────────────────────────────────────────────────────────

doc = app.documents.add();

doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits   = MeasurementUnits.MILLIMETERS;

with (doc.documentPreferences) {
    pageWidth  = 182;
    pageHeight = 257;
    facingPages = true;
    pagesPerDocument = 4;
    documentBleedTopOffset    = 3;
    documentBleedBottomOffset = 3;
    documentBleedInsideOrLeftOffset   = 3;
    documentBleedOutsideOrRightOffset = 3;
}

with (doc.marginPreferences) {
    top    = 10;
    bottom = 10;
    left   = 12;
    right  = 12;
}

// ──────────────────────────────────────────────────────────────
// COLOURS
// ──────────────────────────────────────────────────────────────

NONE  = doc.swatches.item("None");
BLACK = doc.colors.item("Black");
WHITE = doc.colors.item("White");

var yellow    = addColor("Yellow Border",   0,  8, 95,  0);
var green     = addColor("Header Green",   65,  0,100, 10);
var ltGreen   = addColor("Light Green BG", 12,  0, 18,  0);
var ltPurple  = addColor("Light Purple BG", 8, 14,  0,  0);
var purple    = addColor("Purple Accent",  20, 30,  0,  0);
var red       = addColor("Red Accent",      0, 85, 75,  0);
var blue      = addColor("Blue Accent",    85, 45,  0,  0);
var orange    = addColor("Orange Accent",   0, 45, 90,  0);
var lightGray = addColor("Light Gray",      0,  0,  0,  8);

// ──────────────────────────────────────────────────────────────
// PAGE REFERENCES  (spread 1 already exists; add spread 2)
// ──────────────────────────────────────────────────────────────

var PW = 182, PH = 257;

// Spread 1 pages
var s1  = doc.spreads[0];
var p1  = s1.pages[0];   // left  366
var p2  = s1.pages[1];   // right 367

// Spread 2 pages (add 2 extra pages to get a second spread)
doc.pages.add(LocationOptions.AT_END);
doc.pages.add(LocationOptions.AT_END);

var s2  = doc.spreads[1];
var p3  = s2.pages[0];   // left  378
var p4  = s2.pages[1];   // right 379

// Section numbering
doc.sections.item(0).continueNumbering = false;
doc.sections.item(0).pageNumberStart = 366;
var sec2 = doc.sections.add(p3);
sec2.continueNumbering = false;
sec2.pageNumberStart = 378;

// Page-origin bounds (spread coordinate offsets)
var o1 = p1.bounds;   // [top, left, bottom, right]
var o2 = p2.bounds;
var o3 = p3.bounds;
var o4 = p4.bounds;

// ──────────────────────────────────────────────────────────────
// SPREAD 1  ——  CHAPTER 7: CHILD LABOUR  (Pages 366–367)
// ──────────────────────────────────────────────────────────────

// ====== PAGE 1 — LEFT (366) ======

R(p1, o1, 0, 0, PH, PW, ltGreen);                          // bg
R(p1, o1, 4, 4, PH-4, PW-4, NONE, yellow, 3.5);            // border

// Chapter header bar
RR(p1, o1, 7, 7, 46, PW-7, green, NONE, 0, 6);

// "7" badge
O(p1, o1, 9, 9, 35, 35, WHITE);
T(p1, o1, 9, 9, 35, 35, "7", 18, true, green, Justification.CENTER_ALIGN);

// Chapter title
T(p1, o1, 10, 38, 44, PW-10, "教育の機会を奪う\n児童労働",
  14, true, WHITE, Justification.LEFT_ALIGN);

// Next-chapter "8" badge (right margin)
O(p1, o1, 47, PW-32, 75, PW-8, green);
T(p1, o1, 51, PW-30, 73, PW-10, "8",
  16, true, WHITE, Justification.CENTER_ALIGN);

// Intro text placeholder
var introA = T(p1, o1, 49, 10, 91, PW-36, "", 9, false, BLACK);
introA.label = "PLACE WORD TEXT HERE — intro paragraph";

// Main photo
IMG(p1, o1, 93, 8, 159, PW-8, "[ 写真: 児童労働の現場 ]");

// Infographic heading
T(p1, o1, 162, 8, 171, PW-8, "児童労働をしている子ども",
  11, true, BLACK, Justification.LEFT_ALIGN);

// Icon infographic area
IMG(p1, o1, 172, 8, 206, PW-8, "[ インフォグラフィック: 子どもの人数アイコン ]");

// Red stat callout
RR(p1, o1, 208, 8, 226, PW-8, red, NONE, 0, 5);
T(p1, o1, 210, 12, 224, PW-12,
  "約1人\n（世界の子どもの10人に1人の割合）",
  11, true, WHITE, Justification.CENTER_ALIGN);

// Page number
T(p1, o1, PH-9, 8, PH-1, 26, "366", 8, false, BLACK);

// ====== PAGE 2 — RIGHT (367) ======

R(p2, o2, 0, 0, PH, PW, WHITE);
R(p2, o2, 4, 4, PH-4, PW-4, NONE, yellow, 3.5);

T(p2, o2, 7, 8, 19, PW-8,
  "「子どもらしさ」を奪う児童労働", 13, true, BLACK);

// Bar chart section
T(p2, o2, 21, 8, 29, PW-8,
  "● 児童労働をしている子どもの数", 10, true, BLACK);
IMG(p2, o2, 30, 8, 86, PW-8, "[ 棒グラフ: 年別・男女別児童労働者数 ]");

// Body text placeholder
var bodyA = T(p2, o2, 88, 8, 116, PW-8, "", 9, false, BLACK);
bodyA.label = "PLACE WORD TEXT HERE — explanatory body text";

// Three photos
var cw = (PW - 22) / 3;
IMG(p2, o2, 118, 8,           156, 8 + cw,        "[ 写真 1 ]");
IMG(p2, o2, 118, 10 + cw,     156, 10 + cw*2,     "[ 写真 2 ]");
IMG(p2, o2, 118, 12 + cw*2,   156, PW-8,           "[ 写真 3 ]");

// Regional bar-chart section
T(p2, o2, 158, 8, 166, PW-8,
  "● 児童労働をしている子どもの数（地域別）", 10, true, BLACK);
IMG(p2, o2, 167, 8, 220, PW-8, "[ 横棒グラフ: 地域別データ ]");

// Right side-column
R(p2, o2, 21, PW-44, 116, PW-4, ltGreen);
var sideA = T(p2, o2, 23, PW-42, 114, PW-6, "", 8, false, BLACK);
sideA.label = "PLACE WORD TEXT HERE — side notes column";

// Page number
T(p2, o2, PH-9, PW-26, PH-1, PW-8, "367",
  8, false, BLACK, Justification.RIGHT_ALIGN);


// ──────────────────────────────────────────────────────────────
// SPREAD 2  ——  CHAPTER 9: GENDER ECONOMIC GAP  (Pages 378–379)
// ──────────────────────────────────────────────────────────────

// ====== PAGE 3 — LEFT (378) ======

R(p3, o3, 0, 0, PH, PW, ltPurple);
R(p3, o3, 4, 4, PH-4, PW-4, NONE, yellow, 3.5);

// Chapter header bar
RR(p3, o3, 7, 7, 55, PW-7, green, NONE, 0, 6);

// "9" badge
O(p3, o3, 9, 9, 35, 35, WHITE);
T(p3, o3, 9, 9, 35, 35, "9", 18, true, green, Justification.CENTER_ALIGN);

// Chapter title
T(p3, o3, 10, 38, 53, PW-10, "こんなに違う！\n経済の男女格差",
  14, true, WHITE, Justification.LEFT_ALIGN);

// Next-chapter "8" badge
O(p3, o3, 57, PW-32, 85, PW-8, green);
T(p3, o3, 61, PW-30, 83, PW-10, "8",
  16, true, WHITE, Justification.CENTER_ALIGN);

// Intro text placeholder
var introB = T(p3, o3, 58, 10, 83, PW-36, "", 9, false, BLACK);
introB.label = "PLACE WORD TEXT HERE — intro paragraph";

// ── Salary comparison section ──
T(p3, o3, 85, 8, 94, PW-8, "年収格差の男女差", 11, true, BLACK);

// World sub-heading
T(p3, o3, 96, 8, 105, 40, "世界", 12, true, blue);

// Male box — world
R(p3, o3, 106, 8, 132, PW/2-5, NONE, blue, 1.5);
T(p3, o3, 113, 10, 128, PW/2-7, "23,300ドル",
  13, true, blue, Justification.CENTER_ALIGN);

// Female box — world
R(p3, o3, 106, PW/2+5, 132, PW-8, NONE, red, 1.5);
T(p3, o3, 113, PW/2+7, 128, PW-10, "13,100ドル",
  13, true, red, Justification.CENTER_ALIGN);

// Person icons — world
IMG(p3, o3, 133, 8, 157, PW-8, "[ アイコン: 世界の男女労働者 ]");

// Callout — world
RR(p3, o3, 158, PW/2, 170, PW-10, orange, NONE, 0, 8);
T(p3, o3, 160, PW/2+3, 169, PW-13, "女性は男性の約56%！",
  9, true, WHITE, Justification.CENTER_ALIGN);

// Japan sub-heading
T(p3, o3, 172, 8, 181, 40, "日本", 12, true, blue);

// Male box — Japan
R(p3, o3, 182, 8, 208, PW/2-5, NONE, blue, 1.5);
T(p3, o3, 189, 10, 205, PW/2-7, "51,730円",
  13, true, blue, Justification.CENTER_ALIGN);

// Female box — Japan
R(p3, o3, 182, PW/2+5, 208, PW-8, NONE, red, 1.5);
T(p3, o3, 189, PW/2+7, 205, PW-10, "29,260円",
  13, true, red, Justification.CENTER_ALIGN);

// Callout — Japan
RR(p3, o3, 209, PW/2, 221, PW-10, orange, NONE, 0, 8);
T(p3, o3, 211, PW/2+3, 220, PW-13, "女性は男性の約57%！",
  9, true, WHITE, Justification.CENTER_ALIGN);

// Bottom question box
RR(p3, o3, 223, 8, PH-8, PW-8, purple, NONE, 0, 4);
var qTF = T(p3, o3, 225, 12, PH-10, PW-12, "", 9, false, BLACK);
qTF.label = "PLACE WORD TEXT HERE — discussion question";

// Page number
T(p3, o3, PH-9, 8, PH-1, 26, "378", 8, false, BLACK);

// ====== PAGE 4 — RIGHT (379) ======

R(p4, o4, 0, 0, PH, PW, ltPurple);
R(p4, o4, 4, 4, PH-4, PW-4, NONE, yellow, 3.5);

// "6" badge (right column indicator)
O(p4, o4, 7, PW-32, 45, PW-5, green);
T(p4, o4, 14, PW-30, 41, PW-7, "6",
  16, true, WHITE, Justification.CENTER_ALIGN);

// Section title
T(p4, o4, 7, 8, 19, PW-36,
  "「仕事をする機会」に格差がある", 13, true, BLACK);

T(p4, o4, 21, 8, 29, PW-8, "● 労働力率の男女格差", 10, true, BLACK);

// World panel
R(p4, o4, 30, 8, 70, PW/2-5, WHITE);
T(p4, o4, 32, 10, 40, PW/2-7, "世界", 11, true, BLACK);
T(p4, o4, 41, 10, 68, PW/2-7, "女性: 46.4%\n男性: 53.3%", 10, false, BLACK);

// Japan panel
R(p4, o4, 30, PW/2+5, 70, PW-8, WHITE);
T(p4, o4, 32, PW/2+7, 40, PW-10, "日本", 11, true, BLACK);
T(p4, o4, 41, PW/2+7, 68, PW-10, "女性: 71.7%\n男性: 71.0%", 10, false, BLACK);

// Icon comparison area
IMG(p4, o4, 71, 8, 112, PW-8, "[ アイコン: 男女労働力率比較 ]");

// Explanation placeholder
var explTF = T(p4, o4, 114, 8, 140, PW-8, "", 9, false, BLACK);
explTF.label = "PLACE WORD TEXT HERE — explanation text";

// Gender Gap Index box
RR(p4, o4, 142, 8, 185, PW-8, purple, NONE, 0, 4);
T(p4, o4, 144, 12, 154, PW-12, "ジェンダーギャップ指数について",
  10, true, BLACK);
var sdgTF = T(p4, o4, 155, 12, 183, PW-12, "", 9, false, BLACK);
sdgTF.label = "PLACE WORD TEXT HERE — SDG gender gap text";

// Side content area
R(p4, o4, 187, 8, 228, PW-8, ltPurple);
var sideTF4 = T(p4, o4, 189, 12, 226, PW-12, "", 9, false, BLACK);
sideTF4.label = "PLACE WORD TEXT HERE — additional side content";

// Page number
T(p4, o4, PH-9, PW-26, PH-1, PW-8, "379",
  8, false, BLACK, Justification.RIGHT_ALIGN);


// ──────────────────────────────────────────────────────────────
// FINALISE
// ──────────────────────────────────────────────────────────────

app.activeWindow.activePage = p1;
try { app.activeWindow.zoom = ZoomOptions.FIT_SPREAD; } catch(e) {}

alert(
    "✅  完了！  2スプレッド（4ページ）が作成されました。\n\n" +
    "テキストの配置方法:\n" +
    "  1. ファイル > 配置 (.docx を選択)\n" +
    "  2. 「PLACE WORD TEXT HERE」とラベルされたフレームをクリック\n" +
    "  3. テキストが自動的に流し込まれます\n\n" +
    "グレーのボックスは画像プレースホルダーです。\n" +
    "同じく ファイル > 配置 で画像を差し込んでください。"
);
