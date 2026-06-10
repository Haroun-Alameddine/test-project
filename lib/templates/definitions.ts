import type {
  Template,
  ProjectPage,
  CanvasObject,
  TextObjectData,
  ImageObjectData,
  ShapeObjectData,
  TableObjectData,
  TextStyle,
  ProjectTheme,
  DocumentSettings,
} from '@/types';

// ─── Shared helpers ───────────────────────────────────────────────────────────

// A4 at 96 dpi: 210mm × 297mm → 794px × 1123px
const A4_W = 794;
const A4_H = 1123;

let _idCounter = 1;
function uid(prefix = 'obj'): string {
  return `${prefix}_${String(_idCounter++).padStart(4, '0')}`;
}

const rtlBase: TextStyle = {
  fontFamily: 'Cairo',
  fontSize: 14,
  fontWeight: '400',
  color: '#1C1C1C',
  align: 'right',
  direction: 'rtl',
  lineHeight: 1.8,
  letterSpacing: 0,
  paragraphSpacing: 10,
};

function textObj(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  styleOverrides: Partial<TextStyle> = {},
  dataOverrides: Partial<TextObjectData> = {},
  zIndex = 10,
): CanvasObject {
  return {
    id,
    type: 'text',
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex,
    data: {
      text,
      style: { ...rtlBase, ...styleOverrides },
      padding: { top: 8, right: 12, bottom: 8, left: 12 },
      background: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      ...dataOverrides,
    } as TextObjectData,
  };
}

function imageObj(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  src = '',
  alt = 'صورة',
  zIndex = 5,
): CanvasObject {
  return {
    id,
    type: 'image',
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex,
    data: {
      src,
      alt,
      objectFit: 'cover',
      borderRadius: 0,
      borderColor: 'transparent',
      borderWidth: 0,
    } as ImageObjectData,
  };
}

function shapeObj(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: 'rect' | 'circle' | 'triangle' | 'star',
  fill: string,
  stroke = 'transparent',
  strokeWidth = 0,
  zIndex = 1,
): CanvasObject {
  return {
    id,
    type: 'shape',
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex,
    data: {
      shape,
      fill,
      stroke,
      strokeWidth,
      borderRadius: shape === 'rect' ? 0 : 0,
    } as ShapeObjectData,
  };
}

function tableObj(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  rows: number,
  cols: number,
  headers: string[],
  zIndex = 8,
): CanvasObject {
  const cells: TableObjectData['cells'] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      content: r === 0 ? (headers[c] ?? `عمود ${c + 1}`) : '',
      style: {
        ...rtlBase,
        fontWeight: r === 0 ? '700' : '400',
        color: r === 0 ? '#ffffff' : '#1C1C1C',
      },
      background: r === 0 ? '#1A3A6B' : r % 2 === 0 ? '#F0F4FA' : '#ffffff',
      colspan: 1,
      rowspan: 1,
    })),
  );

  return {
    id,
    type: 'table',
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex,
    data: {
      rows,
      cols,
      cells,
      headerRow: true,
      style: {
        borderColor: '#D4D4D4',
        borderWidth: 1,
        headerBackground: '#1A3A6B',
        alternateRows: true,
      },
    } as TableObjectData,
  };
}

// ─── Shared document settings ─────────────────────────────────────────────────

const a4DocSettings: DocumentSettings = {
  width: 210,
  height: 297,
  unit: 'mm',
  orientation: 'portrait',
  bleed: 3,
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  columns: 1,
  gutter: 5,
};

// ─── ARABIC GRADE 1 THEME ─────────────────────────────────────────────────────

const grade1Theme: ProjectTheme = {
  colors: {
    primary: '#1A6B3A',       // forest green
    secondary: '#F5A623',     // amber
    accent: '#E8F8EE',        // light green tint
    background: '#FFFFFF',
    text: '#1C1C1C',
    heading: '#1A6B3A',
    border: '#D4D4D4',
  },
  fonts: { heading: 'Cairo', body: 'Tajawal', ui: 'Cairo' },
  fontSizes: { heading1: 28, heading2: 22, heading3: 18, body: 14, caption: 11 },
  lineSpacing: 1.8,
  paragraphSpacing: 10,
};

// ─── ARABIC GRADE 2 THEME ─────────────────────────────────────────────────────

const grade2Theme: ProjectTheme = {
  colors: {
    primary: '#1A3A6B',       // deep navy
    secondary: '#C6922A',     // gold
    accent: '#E8F0FB',        // light blue
    background: '#FFFFFF',
    text: '#1C1C1C',
    heading: '#1A3A6B',
    border: '#D4D4D4',
  },
  fonts: { heading: 'Cairo', body: 'Tajawal', ui: 'Cairo' },
  fontSizes: { heading1: 32, heading2: 24, heading3: 18, body: 14, caption: 11 },
  lineSpacing: 1.8,
  paragraphSpacing: 10,
};

// ─── SUPPORT BOOK THEME ───────────────────────────────────────────────────────

const supportTheme: ProjectTheme = {
  colors: {
    primary: '#7B2D8B',       // purple
    secondary: '#F5A623',     // amber
    accent: '#F3E8F8',        // light purple tint
    background: '#FFFFFF',
    text: '#1C1C1C',
    heading: '#7B2D8B',
    border: '#D4D4D4',
  },
  fonts: { heading: 'Cairo', body: 'Tajawal', ui: 'Cairo' },
  fontSizes: { heading1: 28, heading2: 22, heading3: 18, body: 14, caption: 11 },
  lineSpacing: 1.8,
  paragraphSpacing: 10,
};

// ─── SCIENCE BOOK THEME ───────────────────────────────────────────────────────

const scienceTheme: ProjectTheme = {
  colors: {
    primary: '#0A6E8A',       // teal
    secondary: '#E84F4F',     // coral red
    accent: '#E0F5FA',        // light teal tint
    background: '#FFFFFF',
    text: '#1C1C1C',
    heading: '#0A6E8A',
    border: '#D4D4D4',
  },
  fonts: { heading: 'Cairo', body: 'Tajawal', ui: 'Cairo' },
  fontSizes: { heading1: 28, heading2: 22, heading3: 18, body: 14, caption: 11 },
  lineSpacing: 1.8,
  paragraphSpacing: 10,
};

// ─── TEACHER GUIDE THEME ──────────────────────────────────────────────────────

const teacherTheme: ProjectTheme = {
  colors: {
    primary: '#2C3E50',       // charcoal
    secondary: '#E67E22',     // orange
    accent: '#EAF1F8',        // light blue-grey
    background: '#FAFAFA',
    text: '#2C2C2C',
    heading: '#2C3E50',
    border: '#CCCCCC',
  },
  fonts: { heading: 'Cairo', body: 'Tajawal', ui: 'Cairo' },
  fontSizes: { heading1: 26, heading2: 20, heading3: 16, body: 13, caption: 10 },
  lineSpacing: 1.7,
  paragraphSpacing: 8,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ARABIC GRADE 1 PAGES ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const g1Cover: ProjectPage = {
  id: 'g1_cover',
  pageNumber: 1,
  templateType: 'cover',
  width: A4_W,
  height: A4_H,
  background: '#1A6B3A',
  objects: [
    // full green background already set
    // decorative top arc shape
    shapeObj(uid(), 0, 0, A4_W, 220, 'rect', '#15593110', 'transparent', 0, 1),
    // gold accent bar bottom
    shapeObj(uid(), 0, A4_H - 80, A4_W, 80, 'rect', '#F5A623', 'transparent', 0, 2),
    // white card in centre
    shapeObj(uid(), 80, 180, 634, 480, 'rect', '#FFFFFF', 'transparent', 0, 3),
    // main title
    textObj(uid(), 80, 220, 634, 80, 'كتاب اللغة العربية', {
      fontFamily: 'Cairo', fontSize: 36, fontWeight: '700', color: '#1A6B3A',
      align: 'center', direction: 'rtl',
    }, {}, 10),
    // subtitle
    textObj(uid(), 80, 310, 634, 50, 'الصف الأول الابتدائي', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '400', color: '#555555',
      align: 'center', direction: 'rtl',
    }, {}, 11),
    // grade badge circle
    shapeObj(uid(), 347, 390, 100, 100, 'circle', '#F5A623', 'transparent', 0, 12),
    textObj(uid(), 347, 415, 100, 50, 'الأول', {
      fontFamily: 'Cairo', fontSize: 16, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 13),
    // image placeholder
    imageObj(uid(), 180, 510, 434, 120, '', 'غلاف الكتاب', 8),
    // decorative border lines
    shapeObj(uid(), 60, 160, A4_W - 120, 4, 'rect', '#F5A623', 'transparent', 0, 4),
    shapeObj(uid(), 60, 680, A4_W - 120, 4, 'rect', '#F5A623', 'transparent', 0, 5),
    // footer text
    textObj(uid(), 0, A4_H - 65, A4_W, 40, 'وزارة التربية والتعليم', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 14),
  ],
};

const g1UnitOpener: ProjectPage = {
  id: 'g1_unit_opener',
  pageNumber: 2,
  templateType: 'unit_opener',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // colour band top
    shapeObj(uid(), 0, 0, A4_W, 200, 'rect', '#1A6B3A', 'transparent', 0, 1),
    // unit number circle
    shapeObj(uid(), A4_W - 130, 30, 100, 100, 'circle', '#F5A623', 'transparent', 0, 5),
    textObj(uid(), A4_W - 130, 60, 100, 45, '١', {
      fontFamily: 'Cairo', fontSize: 42, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 6),
    textObj(uid(), A4_W - 130, 105, 100, 24, 'الوحدة', {
      fontFamily: 'Cairo', fontSize: 12, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 7),
    // unit title
    textObj(uid(), 40, 60, 580, 80, 'الأسرة والبيت', {
      fontFamily: 'Cairo', fontSize: 34, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // green accent strip
    shapeObj(uid(), 0, 200, A4_W, 6, 'rect', '#F5A623', 'transparent', 0, 2),
    // lesson list area
    shapeObj(uid(), 40, 240, A4_W - 80, 600, 'rect', '#F8FBF9', '#1A6B3A', 1, 3),
    textObj(uid(), 60, 260, 300, 36, 'دروس الوحدة', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '700', color: '#1A6B3A',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    // lesson bullets
    ...[
      'الدرس الأول: أفراد الأسرة',
      'الدرس الثاني: أعمال أفراد الأسرة',
      'الدرس الثالث: البيت الجميل',
    ].map((lesson, i) =>
      textObj(uid(), 60, 320 + i * 60, 600, 44, `• ${lesson}`, {
        fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
        align: 'right', direction: 'rtl',
      }, {}, 12),
    ),
    // image placeholder
    imageObj(uid(), 420, 290, 300, 260, '', 'صورة الوحدة', 4),
    // footer
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '١', {
      fontFamily: 'Cairo', fontSize: 12, fontWeight: '400', color: '#888888',
      align: 'center', direction: 'ltr',
    }, {}, 15),
  ],
};

const g1Lesson: ProjectPage = {
  id: 'g1_lesson',
  pageNumber: 3,
  templateType: 'lesson',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // header bar
    shapeObj(uid(), 0, 0, A4_W, 90, 'rect', '#1A6B3A', 'transparent', 0, 1),
    textObj(uid(), 40, 20, 600, 50, 'الدرس الأول: أفراد الأسرة', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // main reading frame
    shapeObj(uid(), 40, 110, 500, 700, 'rect', '#F9F9F9', '#D4D4D4', 1, 2),
    textObj(uid(), 60, 130, 460, 660, 'أنا اسمي أحمد. أسرتي صغيرة. أبي يعمل مهندسًا. أمي معلمة. لدي أخ وأخت. نعيش معًا في بيت جميل في المدينة. نحب بعضنا كثيرًا.', {
      fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl', lineHeight: 2.2,
    }, {}, 11),
    // sidebar notes
    shapeObj(uid(), 560, 110, 194, 340, 'rect', '#E8F8EE', '#1A6B3A', 1, 3),
    textObj(uid(), 570, 120, 174, 30, 'ملاحظات', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#1A6B3A',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    imageObj(uid(), 560, 460, 194, 200, '', 'صورة الدرس', 4),
    // vocab strip bottom
    shapeObj(uid(), 40, 830, 714, 60, 'rect', '#F5A623', 'transparent', 0, 5),
    textObj(uid(), 60, 843, 674, 34, 'مفردات: أسرة – أب – أم – أخ – أخت – بيت', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 13),
    // page number
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٢', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 15),
  ],
};

const g1ReadingText: ProjectPage = {
  id: 'g1_reading_text',
  pageNumber: 4,
  templateType: 'reading_text',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // title strip
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#1A6B3A', 'transparent', 0, 1),
    textObj(uid(), 40, 15, 714, 40, 'النص القرائي', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    imageObj(uid(), 40, 90, 714, 200, '', 'صورة النص', 2),
    textObj(uid(), 40, 310, 714, 600, 'كان ياما كان في قديم الزمان ولد صغير اسمه علي. كان يحب القراءة كثيرًا. في كل يوم كان يجلس تحت الشجرة الكبيرة في حديقة البيت ويقرأ كتبه. أحب أصدقاؤه جميعًا القراءة بسببه. وكبر علي وصار أستاذًا مشهورًا يحب العلم والمعرفة.', {
      fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl', lineHeight: 2.2,
    }, {}, 11),
    // comprehension questions heading
    shapeObj(uid(), 40, 860, 714, 40, 'rect', '#E8F8EE', '#1A6B3A', 1, 3),
    textObj(uid(), 60, 868, 674, 24, 'أسئلة الفهم والاستيعاب', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '700', color: '#1A6B3A',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٣', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 15),
  ],
};

const g1Activity: ProjectPage = {
  id: 'g1_activity',
  pageNumber: 5,
  templateType: 'activity',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // header
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#F5A623', 'transparent', 0, 1),
    textObj(uid(), 40, 18, 714, 36, 'نشاط ١: الحروف والكلمات', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    textObj(uid(), 40, 90, 714, 40, 'صل الحرف بالصورة المناسبة:', {
      fontFamily: 'Cairo', fontSize: 16, fontWeight: '700', color: '#1A6B3A',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    // answer boxes row 1
    ...Array.from({ length: 3 }, (_, i) =>
      shapeObj(uid(), 40 + i * 240, 150, 200, 200, 'rect', '#F9F9F9', '#D4D4D4', 1, 2 + i),
    ),
    // answer boxes row 2
    ...Array.from({ length: 3 }, (_, i) =>
      shapeObj(uid(), 40 + i * 240, 380, 200, 200, 'rect', '#F9F9F9', '#D4D4D4', 1, 5 + i),
    ),
    // lined answer area
    textObj(uid(), 40, 620, 714, 30, 'اكتب الكلمات التي تعلمتها:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1A6B3A',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    ...Array.from({ length: 4 }, (_, i) =>
      shapeObj(uid(), 40, 670 + i * 50, 714, 2, 'rect', '#D4D4D4', 'transparent', 0, 20 + i),
    ),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٤', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g1Question: ProjectPage = {
  id: 'g1_question',
  pageNumber: 6,
  templateType: 'question',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#1A6B3A', 'transparent', 0, 1),
    textObj(uid(), 40, 18, 714, 36, 'أسئلة التقييم', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // Q1
    shapeObj(uid(), 40, 90, 714, 100, 'rect', '#F0FBF4', '#1A6B3A', 1, 2),
    textObj(uid(), 60, 100, 674, 36, '١. اختر الإجابة الصحيحة: أفراد الأسرة هم:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    textObj(uid(), 60, 140, 674, 40, 'أ) الأصدقاء     ب) الجيران     ج) الأب والأم والأبناء', {
      fontFamily: 'Tajawal', fontSize: 14, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    // Q2
    shapeObj(uid(), 40, 210, 714, 100, 'rect', '#F0FBF4', '#1A6B3A', 1, 3),
    textObj(uid(), 60, 220, 674, 36, '٢. أكمل الجملة: يعمل أبي ............. في المدرسة.', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 13),
    // Q3 long answer
    shapeObj(uid(), 40, 330, 714, 160, 'rect', '#F9F9F9', '#D4D4D4', 1, 4),
    textObj(uid(), 60, 340, 674, 36, '٣. اكتب جملة تصف أسرتك:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 14),
    ...Array.from({ length: 3 }, (_, i) =>
      shapeObj(uid(), 60, 390 + i * 38, 634, 2, 'rect', '#D4D4D4', 'transparent', 0, 20 + i),
    ),
    // Q4
    shapeObj(uid(), 40, 510, 714, 100, 'rect', '#F0FBF4', '#1A6B3A', 1, 5),
    textObj(uid(), 60, 520, 674, 36, '٤. ضع دائرة حول الكلمة الدخيلة: بيت – غرفة – سيارة – مطبخ', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 15),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٥', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g1Vocabulary: ProjectPage = {
  id: 'g1_vocabulary',
  pageNumber: 7,
  templateType: 'vocabulary',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#1A6B3A', 'transparent', 0, 1),
    textObj(uid(), 40, 18, 714, 36, 'المفردات الجديدة', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    ...['أسرة', 'أب', 'أم', 'أخ', 'أخت', 'بيت', 'حديقة', 'مدرسة'].map((word, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return shapeObj(uid(), 40 + col * 380, 90 + row * 130, 340, 110, 'rect', col === 0 ? '#E8F8EE' : '#FEF6E4', '#D4D4D4', 1, 2 + i);
    }),
    ...['أسرة', 'أب', 'أم', 'أخ', 'أخت', 'بيت', 'حديقة', 'مدرسة'].map((word, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return textObj(uid(), 60 + col * 380, 120 + row * 130, 300, 50, word, {
        fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#1A6B3A',
        align: 'center', direction: 'rtl',
      }, {}, 20 + i);
    }),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٦', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g1Summary: ProjectPage = {
  id: 'g1_summary',
  pageNumber: 8,
  templateType: 'summary',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#F5A623', 'transparent', 0, 1),
    textObj(uid(), 40, 18, 714, 36, 'ملخص الوحدة الأولى', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    shapeObj(uid(), 40, 90, 714, 500, 'rect', '#FFFDF5', '#F5A623', 1, 2),
    textObj(uid(), 60, 110, 674, 460, 'في هذه الوحدة تعلمنا:\n• أسماء أفراد الأسرة\n• أعمال أفراد الأسرة\n• وصف البيت وغرفه\n• مفردات الوحدة: أسرة، أب، أم، أخ، أخت، بيت، حديقة\n• جملة وصفية بسيطة', {
      fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl', lineHeight: 2.2,
    }, {}, 11),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٧', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g1Empty: ProjectPage = {
  id: 'g1_empty',
  pageNumber: 9,
  templateType: 'empty',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٨', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g1BackCover: ProjectPage = {
  id: 'g1_back_cover',
  pageNumber: 10,
  templateType: 'back_cover',
  width: A4_W,
  height: A4_H,
  background: '#1A6B3A',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 120, 'rect', '#F5A623', 'transparent', 0, 1),
    textObj(uid(), 40, 35, 714, 50, 'كتاب اللغة العربية – الصف الأول', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#1A6B3A',
      align: 'center', direction: 'rtl',
    }, {}, 10),
    imageObj(uid(), 200, 200, 394, 300, '', 'صورة الغلاف الخلفي', 2),
    textObj(uid(), 40, 560, 714, 100, 'يتضمن هذا الكتاب مجموعة من الوحدات التعليمية المتكاملة التي تنمّي مهارات اللغة العربية لدى الطالب في المرحلة الابتدائية.', {
      fontFamily: 'Tajawal', fontSize: 15, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl', lineHeight: 2,
    }, {}, 11),
    shapeObj(uid(), 0, A4_H - 80, A4_W, 80, 'rect', '#15593110', 'transparent', 0, 3),
    textObj(uid(), 0, A4_H - 58, A4_W, 36, 'وزارة التربية والتعليم', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 12),
  ],
};

const g1TableOfContents: ProjectPage = {
  id: 'g1_toc',
  pageNumber: 0,
  templateType: 'table_of_contents',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#1A6B3A', 'transparent', 0, 1),
    textObj(uid(), 40, 18, 714, 36, 'فهرس المحتويات', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    tableObj(uid(), 40, 90, 714, 600, 7, 3, ['رقم الصفحة', 'عنوان الدرس', 'الوحدة'], 8),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, 'أ', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'rtl',
    }, {}, 30),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ARABIC GRADE 2 PAGES (detailed) ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const g2Cover: ProjectPage = {
  id: 'g2_cover',
  pageNumber: 1,
  templateType: 'cover',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // blue gradient rectangle background upper 60%
    shapeObj(uid(), 0, 0, A4_W, 680, 'rect', '#1A3A6B', 'transparent', 0, 1),
    // gold bottom band
    shapeObj(uid(), 0, A4_H - 100, A4_W, 100, 'rect', '#C6922A', 'transparent', 0, 2),
    // decorative outer border – top
    shapeObj(uid(), 20, 20, A4_W - 40, 10, 'rect', '#C6922A', 'transparent', 0, 3),
    // decorative outer border – bottom (inside gold)
    shapeObj(uid(), 20, A4_H - 30, A4_W - 40, 10, 'rect', '#1A3A6B', 'transparent', 0, 4),
    // decorative outer border – left
    shapeObj(uid(), 20, 20, 10, A4_H - 40, 'rect', '#C6922A', 'transparent', 0, 5),
    // decorative outer border – right
    shapeObj(uid(), A4_W - 30, 20, 10, A4_H - 40, 'rect', '#C6922A', 'transparent', 0, 6),
    // inner white card
    shapeObj(uid(), 60, 100, A4_W - 120, 560, 'rect', '#FFFFFF', 'transparent', 0, 7),
    // title
    textObj(uid(), 80, 130, A4_W - 160, 70, 'كتاب اللغة العربية', {
      fontFamily: 'Cairo', fontSize: 38, fontWeight: '800', color: '#1A3A6B',
      align: 'center', direction: 'rtl',
    }, {}, 20),
    // subtitle
    textObj(uid(), 80, 210, A4_W - 160, 40, 'للمرحلة الابتدائية', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '400', color: '#555555',
      align: 'center', direction: 'rtl',
    }, {}, 21),
    // gold divider
    shapeObj(uid(), 160, 260, A4_W - 320, 4, 'rect', '#C6922A', 'transparent', 0, 22),
    // grade badge
    shapeObj(uid(), (A4_W - 120) / 2, 280, 120, 120, 'circle', '#1A3A6B', '#C6922A', 4, 23),
    textObj(uid(), (A4_W - 120) / 2, 300, 120, 50, 'الصف', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 24),
    textObj(uid(), (A4_W - 120) / 2, 348, 120, 50, 'الثاني', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#C6922A',
      align: 'center', direction: 'rtl',
    }, {}, 25),
    // image placeholder
    imageObj(uid(), 180, 420, 434, 200, '', 'صورة غلاف الكتاب', 8),
    // white area for publisher info
    shapeObj(uid(), 60, 690, A4_W - 120, 100, 'rect', '#FFFFFF', 'transparent', 0, 10),
    textObj(uid(), 80, 710, A4_W - 160, 35, 'وزارة التربية والتعليم', {
      fontFamily: 'Cairo', fontSize: 16, fontWeight: '700', color: '#1A3A6B',
      align: 'center', direction: 'rtl',
    }, {}, 26),
    textObj(uid(), 80, 750, A4_W - 160, 28, '١٤٤٦ هـ  –  ٢٠٢٥ م', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '400', color: '#777777',
      align: 'center', direction: 'rtl',
    }, {}, 27),
    // footer text
    textObj(uid(), 0, A4_H - 75, A4_W, 36, 'الطبعة الأولى', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 28),
  ],
};

const g2UnitOpener: ProjectPage = {
  id: 'g2_unit_opener',
  pageNumber: 2,
  templateType: 'unit_opener',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // full-width blue top band
    shapeObj(uid(), 0, 0, A4_W, 240, 'rect', '#1A3A6B', 'transparent', 0, 1),
    // gold diagonal accent strip
    shapeObj(uid(), 0, 220, A4_W, 30, 'rect', '#C6922A', 'transparent', 0, 2),
    // unit number badge on right side of band
    shapeObj(uid(), A4_W - 150, 20, 110, 110, 'circle', '#C6922A', '#FFFFFF', 3, 5),
    textObj(uid(), A4_W - 150, 40, 110, 70, '٢', {
      fontFamily: 'Cairo', fontSize: 52, fontWeight: '700', color: '#1A3A6B',
      align: 'center', direction: 'rtl',
    }, {}, 6),
    textObj(uid(), A4_W - 150, 140, 110, 28, 'الوحدة', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 7),
    // main unit title
    textObj(uid(), 40, 70, 580, 80, 'الطبيعة والبيئة', {
      fontFamily: 'Cairo', fontSize: 36, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    textObj(uid(), 40, 160, 500, 40, 'نستكشف جمال الطبيعة ونتعرف على عناصر البيئة', {
      fontFamily: 'Tajawal', fontSize: 15, fontWeight: '400', color: '#E8F0FB',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    // sub-items area
    shapeObj(uid(), 40, 270, A4_W - 80, 680, 'rect', '#F5F8FF', '#1A3A6B', 1, 3),
    // column labels
    textObj(uid(), 60, 290, 300, 36, 'دروس الوحدة', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '700', color: '#1A3A6B',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    // lesson list with bullet icons
    ...[
      'الدرس الأول: الغابة الخضراء',
      'الدرس الثاني: الأنهار والبحيرات',
      'الدرس الثالث: الحيوانات في الطبيعة',
      'الدرس الرابع: الإنسان والبيئة',
    ].map((lesson, i) => [
      shapeObj(uid(), A4_W - 80, 344 + i * 80, 14, 14, 'circle', '#C6922A', 'transparent', 0, 13 + i * 2),
      textObj(uid(), 60, 338 + i * 80, 660, 44, lesson, {
        fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
        align: 'right', direction: 'rtl',
      }, {}, 14 + i * 2),
    ]).flat(),
    // image placeholder in lower right
    imageObj(uid(), 420, 640, 314, 280, '', 'صورة الوحدة', 4),
    // page num
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '١', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g2Lesson: ProjectPage = {
  id: 'g2_lesson',
  pageNumber: 3,
  templateType: 'lesson',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // header with lesson number
    shapeObj(uid(), 0, 0, A4_W, 100, 'rect', '#1A3A6B', 'transparent', 0, 1),
    // lesson number pill
    shapeObj(uid(), A4_W - 120, 15, 80, 70, 'rect', '#C6922A', 'transparent', 0, 2),
    textObj(uid(), A4_W - 120, 22, 80, 56, '٠١', {
      fontFamily: 'Cairo', fontSize: 28, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'ltr',
    }, {}, 3),
    textObj(uid(), 40, 30, 600, 40, 'الغابة الخضراء', {
      fontFamily: 'Cairo', fontSize: 24, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    textObj(uid(), 40, 72, 600, 26, 'الدرس الأول | وحدة الطبيعة والبيئة', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#C6D8F0',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    // gold bar under header
    shapeObj(uid(), 0, 100, A4_W, 6, 'rect', '#C6922A', 'transparent', 0, 4),
    // main reading area (left 66%)
    shapeObj(uid(), 40, 120, 500, 660, 'rect', '#FAFAFA', '#E0E8F4', 1, 5),
    textObj(uid(), 60, 140, 460, 620, 'الغابة مكان رائع مليء بالأشجار الطويلة والنباتات الخضراء. تسكن فيها الحيوانات وتتغذى الطيور من ثمارها. تحتاج الغابة إلى الماء وضوء الشمس لتنمو. علينا المحافظة على الغابات لأنها رئة الأرض.', {
      fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl', lineHeight: 2.3,
    }, {}, 12),
    // sidebar for notes (right 28%)
    shapeObj(uid(), 560, 120, 194, 320, 'rect', '#E8F0FB', '#1A3A6B', 1, 6),
    textObj(uid(), 570, 130, 174, 30, 'ملاحظاتي', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#1A3A6B',
      align: 'right', direction: 'rtl',
    }, {}, 13),
    ...Array.from({ length: 5 }, (_, i) =>
      shapeObj(uid(), 575, 172 + i * 48, 170, 2, 'rect', '#B0C4DE', 'transparent', 0, 20 + i),
    ),
    // image placeholder in sidebar bottom
    imageObj(uid(), 560, 452, 194, 188, '', 'صورة الدرس', 7),
    // vocab highlight strip
    shapeObj(uid(), 40, 800, A4_W - 80, 55, 'rect', '#1A3A6B', 'transparent', 0, 8),
    textObj(uid(), 60, 812, 180, 32, 'مفردات الدرس:', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#C6922A',
      align: 'right', direction: 'rtl',
    }, {}, 14),
    textObj(uid(), 240, 812, 490, 32, 'غابة – شجرة – نبات – حيوان – طير – ثمرة – ماء – شمس', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 15),
    // page num
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٢', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g2Activity: ProjectPage = {
  id: 'g2_activity',
  pageNumber: 5,
  templateType: 'activity',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    // orange accent header
    shapeObj(uid(), 0, 0, A4_W, 80, 'rect', '#E8872A', 'transparent', 0, 1),
    // activity icon box
    shapeObj(uid(), A4_W - 100, 10, 60, 60, 'rect', '#FFFFFF', 'transparent', 0, 2),
    textObj(uid(), A4_W - 100, 14, 60, 52, '✏️', {
      fontFamily: 'Cairo', fontSize: 30, fontWeight: '400', color: '#E8872A',
      align: 'center', direction: 'ltr',
    }, {}, 3),
    textObj(uid(), 40, 22, 620, 40, 'نشاط ٢: استكشف الطبيعة', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // instruction text
    shapeObj(uid(), 40, 100, A4_W - 80, 60, 'rect', '#FFF3E8', '#E8872A', 1, 4),
    textObj(uid(), 60, 112, A4_W - 120, 36, 'الهدف: أن يكتشف الطالب مكونات البيئة الطبيعية ويسميها.', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '700', color: '#E8872A',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    textObj(uid(), 40, 180, A4_W - 80, 40, 'تعليمات: انظر إلى الصورة وأجب عن الأسئلة التالية:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1A3A6B',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    // image placeholder for activity
    imageObj(uid(), 40, 230, A4_W - 80, 220, '', 'صورة النشاط', 5),
    // answer boxes grid
    textObj(uid(), 40, 470, A4_W - 80, 36, 'أسئلة النشاط:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1A3A6B',
      align: 'right', direction: 'rtl',
    }, {}, 13),
    // answer box 1
    shapeObj(uid(), 40, 516, 340, 100, 'rect', '#F9F9F9', '#E8872A', 1, 6),
    textObj(uid(), 60, 526, 300, 30, '١. ما اسم الشجرة في الصورة؟', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 14),
    ...Array.from({ length: 2 }, (_, i) =>
      shapeObj(uid(), 60, 566 + i * 26, 300, 2, 'rect', '#D4D4D4', 'transparent', 0, 20 + i),
    ),
    // answer box 2
    shapeObj(uid(), 404, 516, 350, 100, 'rect', '#F9F9F9', '#E8872A', 1, 7),
    textObj(uid(), 424, 526, 310, 30, '٢. ماذا يوجد في الغابة؟', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 15),
    ...Array.from({ length: 2 }, (_, i) =>
      shapeObj(uid(), 424, 566 + i * 26, 310, 2, 'rect', '#D4D4D4', 'transparent', 0, 22 + i),
    ),
    // answer box 3 – full width
    shapeObj(uid(), 40, 636, A4_W - 80, 120, 'rect', '#F9F9F9', '#E8872A', 1, 8),
    textObj(uid(), 60, 646, A4_W - 120, 30, '٣. اكتب جملة تصف البيئة الطبيعية:', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 16),
    ...Array.from({ length: 3 }, (_, i) =>
      shapeObj(uid(), 60, 688 + i * 24, A4_W - 120, 2, 'rect', '#D4D4D4', 'transparent', 0, 24 + i),
    ),
    // page num
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٤', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g2Question: ProjectPage = {
  id: 'g2_question',
  pageNumber: 6,
  templateType: 'question',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 80, 'rect', '#1A3A6B', 'transparent', 0, 1),
    textObj(uid(), 40, 20, 714, 40, 'أسئلة وتقييم | وحدة الطبيعة والبيئة', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // Q1 numbered question box
    shapeObj(uid(), 40, 100, 714, 110, 'rect', '#F0F5FF', '#1A3A6B', 1, 2),
    shapeObj(uid(), A4_W - 80, 106, 36, 36, 'circle', '#1A3A6B', 'transparent', 0, 3),
    textObj(uid(), A4_W - 80, 110, 36, 28, '١', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'ltr',
    }, {}, 4),
    textObj(uid(), 60, 104, 620, 36, 'ما الفرق بين البيئة الطبيعية والبيئة الصناعية؟', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 5),
    ...Array.from({ length: 3 }, (_, i) =>
      shapeObj(uid(), 60, 148 + i * 24, 660, 2, 'rect', '#C0C8D8', 'transparent', 0, 10 + i),
    ),
    // Q2
    shapeObj(uid(), 40, 230, 714, 110, 'rect', '#F0F5FF', '#1A3A6B', 1, 6),
    shapeObj(uid(), A4_W - 80, 236, 36, 36, 'circle', '#C6922A', 'transparent', 0, 7),
    textObj(uid(), A4_W - 80, 240, 36, 28, '٢', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'ltr',
    }, {}, 8),
    textObj(uid(), 60, 234, 620, 36, 'اذكر ثلاثة حيوانات تعيش في الغابة:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 9),
    ...Array.from({ length: 3 }, (_, i) =>
      shapeObj(uid(), 60, 278 + i * 24, 660, 2, 'rect', '#C0C8D8', 'transparent', 0, 13 + i),
    ),
    // Q3
    shapeObj(uid(), 40, 360, 714, 140, 'rect', '#F0F5FF', '#1A3A6B', 1, 16),
    shapeObj(uid(), A4_W - 80, 366, 36, 36, 'circle', '#1A3A6B', 'transparent', 0, 17),
    textObj(uid(), A4_W - 80, 370, 36, 28, '٣', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'ltr',
    }, {}, 18),
    textObj(uid(), 60, 364, 620, 36, 'لماذا يجب المحافظة على الغابات؟ اكتب فقرة قصيرة:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 19),
    ...Array.from({ length: 4 }, (_, i) =>
      shapeObj(uid(), 60, 408 + i * 24, 660, 2, 'rect', '#C0C8D8', 'transparent', 0, 20 + i),
    ),
    // Q4 MCQ
    shapeObj(uid(), 40, 520, 714, 120, 'rect', '#FEF6E4', '#C6922A', 1, 25),
    shapeObj(uid(), A4_W - 80, 526, 36, 36, 'circle', '#C6922A', 'transparent', 0, 26),
    textObj(uid(), A4_W - 80, 530, 36, 28, '٤', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'ltr',
    }, {}, 27),
    textObj(uid(), 60, 524, 620, 36, 'اختر الإجابة الصحيحة: رئة الأرض هي:', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 28),
    textObj(uid(), 60, 565, 620, 60, 'أ) المحيطات     ب) الغابات     ج) الجبال     د) الصحاري', {
      fontFamily: 'Tajawal', fontSize: 14, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 29),
    // page num
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٥', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g2ReadingText: ProjectPage = {
  id: 'g2_reading_text',
  pageNumber: 4,
  templateType: 'reading_text',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#1A3A6B', 'transparent', 0, 1),
    shapeObj(uid(), 0, 70, A4_W, 6, 'rect', '#C6922A', 'transparent', 0, 2),
    textObj(uid(), 40, 16, 714, 40, 'نص قرائي: في الغابة الخضراء', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    imageObj(uid(), 40, 96, 714, 220, '', 'صورة النص', 3),
    textObj(uid(), 40, 336, 714, 460, 'خرج سامي مع أبيه إلى الغابة القريبة من البيت. كانت الأشجار طويلة والهواء نقيًا. سمع أصوات الطيور تغني فوق الأغصان. رأى أرنبًا صغيرًا يجري بين الأشجار. قال سامي لأبيه: "يا أبي، الغابة جميلة جدًا!" فرد الأب: "نعم يا بني، وعلينا المحافظة عليها."', {
      fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl', lineHeight: 2.2,
    }, {}, 11),
    shapeObj(uid(), 40, 816, 714, 50, 'rect', '#E8F0FB', '#1A3A6B', 1, 4),
    textObj(uid(), 60, 826, 674, 30, 'فهم المقروء: ما الذي رآه سامي في الغابة؟', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '700', color: '#1A3A6B',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٣', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g2Vocabulary: ProjectPage = {
  id: 'g2_vocabulary',
  pageNumber: 7,
  templateType: 'vocabulary',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#1A3A6B', 'transparent', 0, 1),
    shapeObj(uid(), 0, 70, A4_W, 6, 'rect', '#C6922A', 'transparent', 0, 2),
    textObj(uid(), 40, 16, 714, 40, 'المفردات والمعاني', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    ...['غابة: مكان كثيف به أشجار', 'شجرة: نبات كبير له جذع وأغصان', 'نبات: كائن حي يمتص الماء والضوء', 'حيوان: كائن حي يتحرك ويتغذى', 'طير: حيوان له جناحان يطير', 'ثمرة: ما تنتجه الشجرة من الفاكهة', 'بيئة: المحيط الطبيعي الذي يعيش فيه الكائن', 'محافظة: الحرص على شيء وعدم إتلافه'].map((entry, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const [word, meaning] = entry.split(': ');
      return [
        shapeObj(uid(), 40 + col * 380, 90 + row * 120, 340, 100, 'rect', col === 0 ? '#E8F0FB' : '#FEF6E4', '#D4D4D4', 1, 3 + i * 3),
        textObj(uid(), 60 + col * 380, 100 + row * 120, 300, 36, word, {
          fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#1A3A6B',
          align: 'right', direction: 'rtl',
        }, {}, 4 + i * 3),
        textObj(uid(), 60 + col * 380, 138 + row * 120, 300, 40, meaning, {
          fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#555555',
          align: 'right', direction: 'rtl',
        }, {}, 5 + i * 3),
      ];
    }).flat(),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٦', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 60),
  ],
};

const g2Summary: ProjectPage = {
  id: 'g2_summary',
  pageNumber: 8,
  templateType: 'summary',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 80, 'rect', '#C6922A', 'transparent', 0, 1),
    textObj(uid(), 40, 20, 714, 40, 'ملخص الوحدة الثانية: الطبيعة والبيئة', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    shapeObj(uid(), 40, 100, 714, 600, 'rect', '#FFFDF5', '#C6922A', 1, 2),
    textObj(uid(), 60, 120, 674, 560, 'ماذا تعلمنا في هذه الوحدة:\n\n• الغابة: بيئة غنية بالأشجار والحيوانات والطيور.\n• الأنهار والبحيرات: مصادر مياه عذبة مهمة للحياة.\n• الحيوانات: تنوع كبير بين البيئات الطبيعية.\n• الإنسان والبيئة: مسؤوليتنا في المحافظة على الطبيعة.\n\nمفردات الوحدة:\nغابة – شجرة – نبات – حيوان – طير – نهر – بحيرة – بيئة – محافظة', {
      fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl', lineHeight: 2.2,
    }, {}, 11),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٧', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

const g2Empty: ProjectPage = {
  id: 'g2_empty',
  pageNumber: 9,
  templateType: 'empty',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, A4_H - 45, A4_W, 2, 'rect', '#D4D4D4', 'transparent', 0, 1),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٨', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 2),
  ],
};

const g2BackCover: ProjectPage = {
  id: 'g2_back_cover',
  pageNumber: 10,
  templateType: 'back_cover',
  width: A4_W,
  height: A4_H,
  background: '#1A3A6B',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 120, 'rect', '#C6922A', 'transparent', 0, 1),
    textObj(uid(), 40, 35, 714, 50, 'كتاب اللغة العربية – الصف الثاني', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#1A3A6B',
      align: 'center', direction: 'rtl',
    }, {}, 10),
    imageObj(uid(), 200, 200, 394, 320, '', 'صورة الغلاف الخلفي', 2),
    textObj(uid(), 60, 560, 674, 120, 'كتاب اللغة العربية للصف الثاني يقدم محتوى تعليميًا متكاملًا يشمل النصوص القرائية والأنشطة التفاعلية والتقييمات المتنوعة. صُمِّم وفق المناهج الحديثة لتنمية مهارات القراءة والكتابة والتعبير.', {
      fontFamily: 'Tajawal', fontSize: 15, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl', lineHeight: 2,
    }, {}, 11),
    shapeObj(uid(), 0, A4_H - 80, A4_W, 80, 'rect', '#C6922A', 'transparent', 0, 3),
    textObj(uid(), 0, A4_H - 58, A4_W, 36, 'وزارة التربية والتعليم  |  ١٤٤٦ هـ', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '400', color: '#1A3A6B',
      align: 'center', direction: 'rtl',
    }, {}, 12),
  ],
};

const g2TableOfContents: ProjectPage = {
  id: 'g2_toc',
  pageNumber: 0,
  templateType: 'table_of_contents',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 70, 'rect', '#1A3A6B', 'transparent', 0, 1),
    shapeObj(uid(), 0, 70, A4_W, 6, 'rect', '#C6922A', 'transparent', 0, 2),
    textObj(uid(), 40, 16, 714, 40, 'فهرس المحتويات', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    tableObj(uid(), 40, 96, 714, 680, 8, 3, ['الصفحة', 'عنوان الدرس / الوحدة', 'م'], 8),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, 'أ', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'rtl',
    }, {}, 30),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SUPPORT BOOK PAGES ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const supportCover: ProjectPage = {
  id: 'sup_cover',
  pageNumber: 1,
  templateType: 'cover',
  width: A4_W,
  height: A4_H,
  background: '#7B2D8B',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 300, 'rect', '#6A2578', 'transparent', 0, 1),
    shapeObj(uid(), 0, A4_H - 100, A4_W, 100, 'rect', '#F5A623', 'transparent', 0, 2),
    shapeObj(uid(), 60, 80, A4_W - 120, 580, 'rect', '#FFFFFF', 'transparent', 0, 3),
    textObj(uid(), 80, 120, A4_W - 160, 70, 'كتاب الدعم التعليمي', {
      fontFamily: 'Cairo', fontSize: 34, fontWeight: '700', color: '#7B2D8B',
      align: 'center', direction: 'rtl',
    }, {}, 10),
    textObj(uid(), 80, 200, A4_W - 160, 40, 'اللغة العربية', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '400', color: '#555555',
      align: 'center', direction: 'rtl',
    }, {}, 11),
    shapeObj(uid(), (A4_W - 100) / 2, 260, 100, 100, 'circle', '#F5A623', '#7B2D8B', 3, 12),
    textObj(uid(), (A4_W - 100) / 2, 282, 100, 56, '٣', {
      fontFamily: 'Cairo', fontSize: 38, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 13),
    imageObj(uid(), 160, 380, 474, 240, '', 'غلاف كتاب الدعم', 4),
    textObj(uid(), 0, A4_H - 75, A4_W, 36, 'كتاب الدعم التعليمي – الصف الثالث', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 14),
  ],
};

const supportLesson: ProjectPage = {
  id: 'sup_lesson',
  pageNumber: 2,
  templateType: 'lesson',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 90, 'rect', '#7B2D8B', 'transparent', 0, 1),
    textObj(uid(), 40, 24, 600, 42, 'دعم درس: الجملة الاسمية', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // key concept box
    shapeObj(uid(), 40, 110, A4_W - 80, 80, 'rect', '#F3E8F8', '#7B2D8B', 2, 2),
    textObj(uid(), 60, 120, 180, 30, '💡 تذكر:', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '700', color: '#7B2D8B',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    textObj(uid(), 240, 120, 494, 50, 'الجملة الاسمية تبدأ باسم. تتكون من المبتدأ والخبر.', {
      fontFamily: 'Tajawal', fontSize: 15, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    // examples
    shapeObj(uid(), 40, 210, A4_W - 80, 200, 'rect', '#F9F9F9', '#D4D4D4', 1, 3),
    textObj(uid(), 60, 220, 300, 36, 'أمثلة:', {
      fontFamily: 'Cairo', fontSize: 16, fontWeight: '700', color: '#7B2D8B',
      align: 'right', direction: 'rtl',
    }, {}, 13),
    ...['البيت واسع', 'الطالب مجتهد', 'السماء صافية'].map((ex, i) =>
      textObj(uid(), 60, 264 + i * 46, 600, 36, `• ${ex}`, {
        fontFamily: 'Tajawal', fontSize: 16, fontWeight: '400', color: '#1C1C1C',
        align: 'right', direction: 'rtl',
      }, {}, 14 + i),
    ),
    // practice
    textObj(uid(), 40, 430, A4_W - 80, 36, 'تدريبات:', {
      fontFamily: 'Cairo', fontSize: 16, fontWeight: '700', color: '#7B2D8B',
      align: 'right', direction: 'rtl',
    }, {}, 20),
    ...Array.from({ length: 5 }, (_, i) => [
      textObj(uid(), 60, 476 + i * 80, A4_W - 120, 30, `${i + 1}. أكمل الجملة الاسمية: ........ كبير.`, {
        fontFamily: 'Cairo', fontSize: 14, fontWeight: '400', color: '#1C1C1C',
        align: 'right', direction: 'rtl',
      }, {}, 21 + i * 2),
      shapeObj(uid(), 60, 510 + i * 80, A4_W - 120, 2, 'rect', '#D4D4D4', 'transparent', 0, 22 + i * 2),
    ]).flat(),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٢', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 50),
  ],
};

function makeSupportPageStub(id: string, num: number, type: ProjectPage['templateType'], title: string, primaryColor: string): ProjectPage {
  return {
    id,
    pageNumber: num,
    templateType: type,
    width: A4_W,
    height: A4_H,
    background: '#FFFFFF',
    objects: [
      shapeObj(uid(), 0, 0, A4_W, 70, 'rect', primaryColor, 'transparent', 0, 1),
      textObj(uid(), 40, 18, 714, 36, title, {
        fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
        align: 'right', direction: 'rtl',
      }, {}, 10),
      shapeObj(uid(), 40, 90, A4_W - 80, A4_H - 180, 'rect', '#FAFAFA', '#D4D4D4', 1, 2),
      textObj(uid(), 0, A4_H - 45, A4_W, 30, String(num), {
        fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
        align: 'center', direction: 'ltr',
      }, {}, 30),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SCIENCE BOOK PAGES ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const scienceCover: ProjectPage = {
  id: 'sci_cover',
  pageNumber: 1,
  templateType: 'cover',
  width: A4_W,
  height: A4_H,
  background: '#0A6E8A',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, A4_H, 'rect', '#0A6E8A', 'transparent', 0, 1),
    shapeObj(uid(), 0, A4_H - 140, A4_W, 140, 'rect', '#E84F4F', 'transparent', 0, 2),
    shapeObj(uid(), 50, 60, A4_W - 100, 600, 'rect', '#FFFFFF', 'transparent', 0, 3),
    textObj(uid(), 70, 100, A4_W - 140, 70, 'كتاب العلوم', {
      fontFamily: 'Cairo', fontSize: 40, fontWeight: '700', color: '#0A6E8A',
      align: 'center', direction: 'rtl',
    }, {}, 10),
    textObj(uid(), 70, 180, A4_W - 140, 40, 'الصف الرابع الابتدائي', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '400', color: '#555555',
      align: 'center', direction: 'rtl',
    }, {}, 11),
    shapeObj(uid(), (A4_W - 110) / 2, 240, 110, 110, 'circle', '#0A6E8A', '#E84F4F', 3, 12),
    textObj(uid(), (A4_W - 110) / 2, 260, 110, 70, '٤', {
      fontFamily: 'Cairo', fontSize: 44, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 13),
    imageObj(uid(), 140, 370, 514, 240, '', 'غلاف كتاب العلوم', 4),
    textObj(uid(), 0, A4_H - 110, A4_W, 50, 'الطبعة المحدثة | ١٤٤٦ هـ', {
      fontFamily: 'Cairo', fontSize: 16, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 14),
  ],
};

const scienceLesson: ProjectPage = {
  id: 'sci_lesson',
  pageNumber: 3,
  templateType: 'lesson',
  width: A4_W,
  height: A4_H,
  background: '#FFFFFF',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 90, 'rect', '#0A6E8A', 'transparent', 0, 1),
    shapeObj(uid(), 0, 90, A4_W, 6, 'rect', '#E84F4F', 'transparent', 0, 2),
    textObj(uid(), 40, 22, 600, 46, 'الدرس الأول: المادة وخصائصها', {
      fontFamily: 'Cairo', fontSize: 22, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // learning outcomes
    shapeObj(uid(), 40, 116, A4_W - 80, 100, 'rect', '#E0F5FA', '#0A6E8A', 1, 3),
    textObj(uid(), 60, 126, 400, 30, 'أهداف الدرس:', {
      fontFamily: 'Cairo', fontSize: 14, fontWeight: '700', color: '#0A6E8A',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    textObj(uid(), 60, 160, 674, 46, '• تعرف خصائص المادة  • التمييز بين المواد المختلفة  • فهم التحولات الطبيعية', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    // main body + image
    shapeObj(uid(), 40, 236, 480, 560, 'rect', '#FAFAFA', '#D4D4D4', 1, 4),
    textObj(uid(), 60, 256, 440, 520, 'المادة هي كل ما يشغل حيزًا من الفراغ وله كتلة. توجد المادة في ثلاثة أحوال: صلبة وسائلة وغازية. يمكن للمادة أن تنتقل من حال إلى أخرى بتأثير الحرارة أو البرودة.', {
      fontFamily: 'Tajawal', fontSize: 15, fontWeight: '400', color: '#1C1C1C',
      align: 'right', direction: 'rtl', lineHeight: 2.1,
    }, {}, 13),
    // diagram area
    imageObj(uid(), 540, 236, 214, 300, '', 'مخطط أحوال المادة', 5),
    // table of states
    tableObj(uid(), 540, 556, 214, 200, 4, 2, ['مثال', 'الحال'], 8),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٣', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

function makeSciencePage(id: string, num: number, type: ProjectPage['templateType'], title: string): ProjectPage {
  return makeSupportPageStub(id, num, type, title, '#0A6E8A');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TEACHER GUIDE PAGES ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const teacherCover: ProjectPage = {
  id: 'tg_cover',
  pageNumber: 1,
  templateType: 'cover',
  width: A4_W,
  height: A4_H,
  background: '#2C3E50',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, A4_H, 'rect', '#2C3E50', 'transparent', 0, 1),
    shapeObj(uid(), 0, 0, A4_W, 180, 'rect', '#E67E22', 'transparent', 0, 2),
    textObj(uid(), 40, 40, A4_W - 80, 60, 'دليل المعلم', {
      fontFamily: 'Cairo', fontSize: 36, fontWeight: '700', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 10),
    textObj(uid(), 40, 110, A4_W - 80, 40, 'اللغة العربية – الصف الخامس', {
      fontFamily: 'Cairo', fontSize: 18, fontWeight: '400', color: '#2C3E50',
      align: 'center', direction: 'rtl',
    }, {}, 11),
    shapeObj(uid(), 60, 210, A4_W - 120, 480, 'rect', '#FFFFFF', 'transparent', 0, 3),
    textObj(uid(), 80, 250, A4_W - 160, 50, 'مرجع المعلم الشامل', {
      fontFamily: 'Cairo', fontSize: 26, fontWeight: '700', color: '#2C3E50',
      align: 'center', direction: 'rtl',
    }, {}, 12),
    imageObj(uid(), 160, 320, 474, 280, '', 'صورة غلاف دليل المعلم', 4),
    shapeObj(uid(), 0, A4_H - 120, A4_W, 120, 'rect', '#1A2C3B', 'transparent', 0, 5),
    textObj(uid(), 0, A4_H - 90, A4_W, 36, 'الإدارة العامة للمناهج', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '400', color: '#FFFFFF',
      align: 'center', direction: 'rtl',
    }, {}, 13),
    textObj(uid(), 0, A4_H - 52, A4_W, 30, '١٤٤٦ هـ', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '400', color: '#E67E22',
      align: 'center', direction: 'rtl',
    }, {}, 14),
  ],
};

const teacherLesson: ProjectPage = {
  id: 'tg_lesson',
  pageNumber: 3,
  templateType: 'lesson',
  width: A4_W,
  height: A4_H,
  background: '#FAFAFA',
  objects: [
    shapeObj(uid(), 0, 0, A4_W, 80, 'rect', '#2C3E50', 'transparent', 0, 1),
    shapeObj(uid(), 0, 80, A4_W, 5, 'rect', '#E67E22', 'transparent', 0, 2),
    textObj(uid(), 40, 20, 600, 40, 'خطة الدرس: المفعول به', {
      fontFamily: 'Cairo', fontSize: 20, fontWeight: '700', color: '#FFFFFF',
      align: 'right', direction: 'rtl',
    }, {}, 10),
    // lesson meta
    shapeObj(uid(), 40, 104, A4_W - 80, 80, 'rect', '#EAF1F8', '#2C3E50', 1, 3),
    textObj(uid(), 60, 114, 300, 28, 'الحصة: ٤٥ دقيقة', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#2C3E50',
      align: 'right', direction: 'rtl',
    }, {}, 11),
    textObj(uid(), 60, 145, 600, 28, 'الأهداف: تعرف المفعول به، التمييز في الجملة الفعلية، التطبيق', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#2C3E50',
      align: 'right', direction: 'rtl',
    }, {}, 12),
    // phase 1 intro
    shapeObj(uid(), 40, 204, 20, 140, 'rect', '#E67E22', 'transparent', 0, 4),
    textObj(uid(), 70, 204, 680, 30, 'أولًا: التمهيد (٨ دقائق)', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#2C3E50',
      align: 'right', direction: 'rtl',
    }, {}, 13),
    textObj(uid(), 70, 240, 680, 94, 'ابدأ بسؤال: "هل تذكرون الفاعل؟ من فعل الفعل؟" ثم انتقل إلى "من استقبل الفعل؟". اعرض جملة على السبورة: "أكل الطالبُ التفاحةَ" واطلب من المتعلمين تحديد المفعول.', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#444',
      align: 'right', direction: 'rtl', lineHeight: 2,
    }, {}, 14),
    // phase 2 presentation
    shapeObj(uid(), 40, 364, 20, 140, 'rect', '#2C3E50', 'transparent', 0, 5),
    textObj(uid(), 70, 364, 680, 30, 'ثانيًا: العرض والشرح (١٥ دقيقة)', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#2C3E50',
      align: 'right', direction: 'rtl',
    }, {}, 15),
    textObj(uid(), 70, 400, 680, 94, 'اشرح تعريف المفعول به وعلامة نصبه. قدم أمثلة متدرجة من الكتاب. استخدم الألوان للتفريق بين الفاعل والمفعول على اللوح.', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#444',
      align: 'right', direction: 'rtl', lineHeight: 2,
    }, {}, 16),
    // phase 3 practice
    shapeObj(uid(), 40, 524, 20, 140, 'rect', '#E67E22', 'transparent', 0, 6),
    textObj(uid(), 70, 524, 680, 30, 'ثالثًا: التطبيق والتدريب (١٥ دقيقة)', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#2C3E50',
      align: 'right', direction: 'rtl',
    }, {}, 17),
    textObj(uid(), 70, 560, 680, 80, 'وزّع ورقة النشاط. اطلب من المتعلمين العمل ثنائيًا. تجول وقدم دعمًا فرديًا للمحتاجين.', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#444',
      align: 'right', direction: 'rtl', lineHeight: 2,
    }, {}, 18),
    // closing
    shapeObj(uid(), 40, 664, 20, 100, 'rect', '#2C3E50', 'transparent', 0, 7),
    textObj(uid(), 70, 664, 680, 30, 'رابعًا: الختام والتقييم (٧ دقائق)', {
      fontFamily: 'Cairo', fontSize: 15, fontWeight: '700', color: '#2C3E50',
      align: 'right', direction: 'rtl',
    }, {}, 19),
    textObj(uid(), 70, 700, 680, 54, 'اطرح سؤالًا ختاميًا. سجّل الطلاب الذين يحتاجون متابعة في سجل التقييم التكويني.', {
      fontFamily: 'Tajawal', fontSize: 13, fontWeight: '400', color: '#444',
      align: 'right', direction: 'rtl', lineHeight: 2,
    }, {}, 20),
    // notes area
    shapeObj(uid(), 40, 780, A4_W - 80, 90, 'rect', '#FFF3E0', '#E67E22', 1, 8),
    textObj(uid(), 60, 790, 300, 28, 'ملاحظات المعلم:', {
      fontFamily: 'Cairo', fontSize: 13, fontWeight: '700', color: '#E67E22',
      align: 'right', direction: 'rtl',
    }, {}, 21),
    textObj(uid(), 0, A4_H - 45, A4_W, 30, '٣', {
      fontFamily: 'Cairo', fontSize: 12, color: '#888888', fontWeight: '400',
      align: 'center', direction: 'ltr',
    }, {}, 30),
  ],
};

function makeTeacherPage(id: string, num: number, type: ProjectPage['templateType'], title: string): ProjectPage {
  return makeSupportPageStub(id, num, type, title, '#2C3E50');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TEMPLATE DEFINITIONS ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export const arabicGrade1Template: Template = {
  id: 'arabic_grade_1',
  name: 'كتاب اللغة العربية – الصف الأول',
  bookType: 'arabic_book',
  grade: '1',
  subject: 'اللغة العربية',
  language: 'ar',
  colorStyle: 'green_gold',
  preview: '/previews/arabic_grade_1.jpg',
  documentSettings: a4DocSettings,
  theme: grade1Theme,
  pages: [
    g1TableOfContents,
    g1Cover,
    g1UnitOpener,
    g1Lesson,
    g1ReadingText,
    g1Activity,
    g1Question,
    g1Vocabulary,
    g1Summary,
    g1Empty,
    g1BackCover,
  ],
};

export const arabicGrade2Template: Template = {
  id: 'arabic_grade_2',
  name: 'كتاب اللغة العربية – الصف الثاني',
  bookType: 'arabic_book',
  grade: '2',
  subject: 'اللغة العربية',
  language: 'ar',
  colorStyle: 'navy_gold',
  preview: '/previews/arabic_grade_2.jpg',
  documentSettings: a4DocSettings,
  theme: grade2Theme,
  pages: [
    g2TableOfContents,
    g2Cover,
    g2UnitOpener,
    g2Lesson,
    g2ReadingText,
    g2Activity,
    g2Question,
    g2Vocabulary,
    g2Summary,
    g2Empty,
    g2BackCover,
  ],
};

export const supportBookTemplate: Template = {
  id: 'support_book_grade_3',
  name: 'كتاب الدعم التعليمي – الصف الثالث',
  bookType: 'support_book',
  grade: '3',
  subject: 'اللغة العربية',
  language: 'ar',
  colorStyle: 'purple_amber',
  preview: '/previews/support_book.jpg',
  documentSettings: a4DocSettings,
  theme: supportTheme,
  pages: [
    makeSupportPageStub('sup_toc', 0, 'table_of_contents', 'فهرس المحتويات', '#7B2D8B'),
    supportCover,
    makeSupportPageStub('sup_unit', 2, 'unit_opener', 'الوحدة الأولى: القواعد النحوية', '#7B2D8B'),
    supportLesson,
    makeSupportPageStub('sup_reading', 4, 'reading_text', 'نص قرائي: القصة والنحو', '#7B2D8B'),
    makeSupportPageStub('sup_activity', 5, 'activity', 'نشاط تدريبي: تطبيق القواعد', '#7B2D8B'),
    makeSupportPageStub('sup_question', 6, 'question', 'أسئلة التقييم', '#7B2D8B'),
    makeSupportPageStub('sup_vocab', 7, 'vocabulary', 'المصطلحات النحوية', '#7B2D8B'),
    makeSupportPageStub('sup_summary', 8, 'summary', 'ملخص الوحدة', '#7B2D8B'),
    makeSupportPageStub('sup_empty', 9, 'empty', '', '#7B2D8B'),
    makeSupportPageStub('sup_back', 10, 'back_cover', 'الغلاف الخلفي', '#7B2D8B'),
  ],
};

export const scienceBookTemplate: Template = {
  id: 'science_book_grade_4',
  name: 'كتاب العلوم – الصف الرابع',
  bookType: 'science_book',
  grade: '4',
  subject: 'العلوم',
  language: 'ar',
  colorStyle: 'teal_coral',
  preview: '/previews/science_book.jpg',
  documentSettings: a4DocSettings,
  theme: scienceTheme,
  pages: [
    makeSciencePage('sci_toc', 0, 'table_of_contents', 'فهرس المحتويات'),
    scienceCover,
    makeSciencePage('sci_unit', 2, 'unit_opener', 'الوحدة الأولى: المادة والطاقة'),
    scienceLesson,
    makeSciencePage('sci_reading', 4, 'reading_text', 'نص علمي: تحولات المادة'),
    makeSciencePage('sci_activity', 5, 'activity', 'تجربة عملية: إذابة السكر'),
    makeSciencePage('sci_question', 6, 'question', 'أسئلة وتقييم'),
    makeSciencePage('sci_vocab', 7, 'vocabulary', 'المفاهيم العلمية'),
    makeSciencePage('sci_summary', 8, 'summary', 'ملخص الوحدة'),
    makeSciencePage('sci_empty', 9, 'empty', ''),
    makeSciencePage('sci_back', 10, 'back_cover', 'الغلاف الخلفي'),
  ],
};

export const teacherGuideTemplate: Template = {
  id: 'teacher_guide_grade_5',
  name: 'دليل المعلم – اللغة العربية – الصف الخامس',
  bookType: 'teacher_guide',
  grade: '5',
  subject: 'اللغة العربية',
  language: 'ar',
  colorStyle: 'charcoal_orange',
  preview: '/previews/teacher_guide.jpg',
  documentSettings: a4DocSettings,
  theme: teacherTheme,
  pages: [
    makeTeacherPage('tg_toc', 0, 'table_of_contents', 'فهرس الدليل'),
    teacherCover,
    makeTeacherPage('tg_unit', 2, 'unit_opener', 'الوحدة الأولى: الجملة العربية وأنواعها'),
    teacherLesson,
    makeTeacherPage('tg_reading', 4, 'reading_text', 'نصوص القراءة الموجهة'),
    makeTeacherPage('tg_activity', 5, 'activity', 'أنشطة المعلم والمتعلم'),
    makeTeacherPage('tg_question', 6, 'question', 'أسئلة التقييم ومفاتيح الإجابات'),
    makeTeacherPage('tg_vocab', 7, 'vocabulary', 'قاموس المصطلحات'),
    makeTeacherPage('tg_summary', 8, 'summary', 'ملخص وحدة التدريس'),
    makeTeacherPage('tg_empty', 9, 'empty', ''),
    makeTeacherPage('tg_back', 10, 'back_cover', 'الغلاف الخلفي'),
  ],
};

export const allTemplates: Template[] = [
  arabicGrade1Template,
  arabicGrade2Template,
  supportBookTemplate,
  scienceBookTemplate,
  teacherGuideTemplate,
];
