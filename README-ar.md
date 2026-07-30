<div align="center" dir="rtl">

<img src="docs/media/whell.gif" alt="ClipWheel Action" width="600" />

# ClipWheel — مدير الحافظة الدائري الفريد

**توقف عن التمرير عبر قوائم تاريخ الحافظة. اكتشف أسرع طريقة للوصول إلى حافظتك من خلال واجهة القائمة الدائرية. اضغط على اختصار واحد، ومرر سريعًا نحو الشريحة التي تريدها، والصق.**

ClipWheel هو مدير حافظة مجاني ومفتوح المصدر يركز على الخصوصية لأنظمة **macOS و Windows و Linux** — يتميز بعجلة دائرية مذهلة (تُعرف أيضًا باسم القائمة الدائرية، أو قائمة التأشير، أو صندوق الاختصارات) تضع آخر 4 إلى 12 عملية نسخ على بعد إيماءة واحدة فقط، دون أن تغادر بياناتك جهازك أبدًا.

<div style="margin-bottom: 20px;">
<img src="assets/brand/clipwheel-logo-transparent.png" alt="شعار ClipWheel" width="128" />
</div>

[![Release](https://img.shields.io/github/v/release/mustafasavul/ClipWheel?style=flat-square)](https://github.com/mustafasavul/ClipWheel/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Platforms](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)](#-التثبيت-والبدء-السريع)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen?style=flat-square)](#-نموذج-الخصوصية)

![عرض ClipWheel - عجلة حافظة دائرية سريعة وسلسة أثناء العمل](docs/media/clipwhell-entry.gif)

</div>

---

<div dir="rtl">

## 🎡 لماذا العجلة، وليس قائمة أخرى؟

كل مدير حافظة آخر يعطيك **قائمة عمودية**: افتح نافذة، اقرأ من أعلى إلى أسفل، اعثر على الصف الصحيح، وانقر. إنها مهمة *بحث* — حيث تقوم عيناك بالعمل في كل مرة.

ClipWheel يجعلها مهمة **ذاكرة عضلية**.

- **مواضع ثابتة.** تقع عمليات النسخ الـ N الأخيرة في نفس الشرائح في كل مرة. "النسخة قبل الأخيرة" تكون دائمًا في نفس الاتجاه — أعلى اليمين، وليس "في مكان ما حول الصف 2".
- **الدائري يعني المسافة المتساوية.** في القائمة، يبعد العنصر 8 ثمانية صفوف عن العنصر 1. في العجلة، كل شريحة تبعد بنفس المسافة.
- **إيماءة واحدة، بلا قراءة.** افتح العجلة، تحرك نحو الشريحة، وحدد. أو اضغط على `1`–`8`. تُغلق العجلة ويعود العنصر إلى حافظتك.
- **نظرة سريعة قبل التطبيق.** استمر في الضغط على `Shift` للحصول على **Quicklook (نظرة سريعة)** — معاينة كاملة للنص أو الكود أو الصورة في تلك الشريحة دون مغادرة العجلة.
- **حجم يتناسب مع تذكرك، وليس أرشيفك.** من 4 إلى 12 شريحة، الخيار لك. تتعامل العجلة مع آخر الأشياء التي نسختها — وهي تشكل 90% من الحالات، في أقل من ثانية. نافذة السجل تتعامل مع الـ 10% الأخرى، باستخدام البحث والفلاتر والمعاينات.

---

## ✨ الميزات الرئيسية

### العجلة
- **تراكب دائري** على اختصار عام، في وسط الشاشة أو عند مؤشر الماوس.
- **4 إلى 12 شريحة قابلة للتكوين**، اختيار عبر لوحة المفاتيح (`1`–`8`، `Enter`)، `Esc` للإغلاق.
  <br/>
  <a href="docs/media/clipwhell-whell-customize-whell-items.png" target="_blank"><img src="docs/media/clipwhell-whell-customize-whell-items.png" width="600" alt="تخصيص عناصر العجلة" /></a>
- **Shift للحصول على النظرة السريعة (Quicklook)** — معاينة مضمنة لشرائح النصوص، الأكواد، والصور.
  <br/>
  <a href="docs/media/clipwhell-whell-quicklook.png" target="_blank"><img src="docs/media/clipwhell-whell-quicklook.png" width="600" alt="معاينة النظرة السريعة" /></a>
- **اختصارات لوحة المفاتيح** — تحديد بسرعة البرق باستخدام ذاكرتك العضلية.
  <br/>
  <a href="docs/media/clipwhell-whell-shortcuts.png" target="_blank"><img src="docs/media/clipwhell-whell-shortcuts.png" width="600" alt="تكوين الاختصارات" /></a>
- **قابلة للتخصيص بالكامل** — ألوان مسبقة الإعداد، لوحات مخصصة لكل شريحة، وألوان مخصصة للشرائح والشريحة النشطة والحلقات والتسميات واللوحة؛ مع حفظ ما يصل إلى 24 إعدادًا مخصصًا.
  <br/>
  <p align="center" dir="ltr">
    <a href="docs/media/clipwhell-apperance-color-1.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-1.png" width="30%" alt="لون السمة 1" /></a>
    <a href="docs/media/clipwhell-apperance-color-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-2.png" width="30%" alt="لون السمة 2" /></a>
    <a href="docs/media/clipwhell-apperance-color-3.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-3.png" width="30%" alt="لون السمة 3" /></a>
  </p>
  <p align="center" dir="ltr">
    <a href="docs/media/clipwhell-apperance.png" target="_blank"><img src="docs/media/clipwhell-apperance.png" width="48%" alt="إعدادات المظهر" /></a>
    <a href="docs/media/clipwhell-apperance-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-2.png" width="48%" alt="تخصيص المظهر" /></a>
  </p>

### السجل والبحث
- نافذة سجل كاملة مع **البحث، فلاتر النوع، فلاتر التاريخ، وترقيم الصفحات**.
- **لوحة معاينة غنية** للنصوص، الأكواد، النصوص المنسقة، الروابط، الصور، ومراجع الملفات.
- **البيانات الوصفية لكل عنصر**: الحجم بالبايت، الحجم المقروء، طول النص، عدد الأسطر، عدد الملفات، وقت الإنشاء ووقت آخر استخدام.
- **تثبيت، تمييز كمفضلة، وتحويلات نصية** على أي إدخال.
- **سلة مهملات مع حذف مؤقت**، واستعادة، ومسح دائم صريح.

### الالتقاط
- نص عادي · نص منسق / HTML / RTF · صور ولقطات شاشة · مراجع ملفات ومجلدات · روابط · مقتطفات برمجية مع اكتشاف اللغة · أوامر طرفية (Terminal).
- تخزين أصول الصور محليًا مع إنشاء صور مصغرة.
- خيارات التبديل للالتقاط لكل نوع، والتعامل مع النسخ المكررة.

### الخصوصية والتحكم
- **إيقاف مؤقت للالتقاط**، **تطبيقات المصدر المتجاهلة**، و **مسح عند الخروج**.
- سمة النظام / السمة الداكنة / الفاتحة، تتبع نظام التشغيل افتراضيًا.
- **24 لغة** مضمنة، بما في ذلك اللغات التي تُكتب من اليمين إلى اليسار (العربية والفارسية).
- أيقونة شريط المهام، البدء التلقائي، وتحديثات موقعة في المكان من إصدارات GitHub.

---

## 🔒 نموذج الخصوصية

تم تصميم ClipWheel ليكون **محليًا أولاً بالتصميم، وليس بالوعد**:

- يتم تخزين كل شيء في قاعدة بيانات **SQLite** محلية ومجلد لأصول الصور داخل دليل بيانات تطبيق Tauri.
- **لا توجد تحليلات أو تتبع. لا توجد حسابات. لا توجد مزامنة سحابية. لا توجد خدمات خارجية.**
- الاستدعاء الوحيد للشبكة الذي يقوم به التطبيق هو التحقق من التحديث مقابل رابط بيانات الإصدارات العامة على GitHub.
- يتم تخزين محتوى الحافظة كما تم نسخه تمامًا — لا يوجد مصنف سحابي، ولا تقنية التعرف الضوئي على الحروف (OCR)، ولا طبقة إخفاء ترسل أي شيء خارج الجهاز.

غالبًا ما تكون حافظتك هي بياناتك الأكثر حساسية: كلمات المرور، الرموز، الرسائل الخاصة. لهذا السبب لا تترك جهازك أبدًا.

---

## 📦 التثبيت والبدء السريع

### macOS

```bash
brew install --cask mustafasavul/tap/clipwheel
```

أو احصل على ملف `.dmg` لشريحتك من [أحدث إصدار](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.2.0_aarch64.dmg` (Apple Silicon) أو `ClipWheel_0.2.0_x64.dmg` (Intel).

### Windows

قم بالتنزيل والتشغيل من [أحدث إصدار](https://github.com/mustafasavul/ClipWheel/releases/latest): `ClipWheel_0.2.0_x64-setup.exe` (مثبت NSIS) أو `ClipWheel_0.2.0_x64_en-US.msi`.

### Linux

```bash
sudo apt install ./ClipWheel_0.2.0_amd64.deb
```

```bash
chmod +x ClipWheel_0.2.0_amd64.AppImage && ./ClipWheel_0.2.0_amd64.AppImage
```

> قد تكون الإصدارات المبكرة غير موقعة أو موقعة بشكل مخصص. قد تحذر Gatekeeper في macOS و SmartScreen في Windows حتى يتم تكوين التوثيق من Apple والتوقيع الموثوق من Windows.

### أول 30 ثانية

1. قم بتشغيل ClipWheel — سيكون موجودًا في شريط المهام / شريط القوائم.
2. انسخ بضعة أشياء.
3. اضغط **`Cmd+Shift+V`** (في macOS) أو **`Ctrl+Shift+V`** (في Windows/Linux).
4. تحرك نحو شريحة، أو اضغط على `1`–`8`. اضغط باستمرار على `Shift` للمعاينة أولاً.
5. الصق.

| الإجراء | الاختصار |
| --- | --- |
| فتح العجلة | `Cmd+Shift+V` / `Ctrl+Shift+V` |
| تحديد عنصر | `1`–`8` أو `Enter` |
| معاينة النظرة السريعة (Quicklook) | اضغط باستمرار على `Shift` |
| إغلاق العجلة | `Esc` |

---

## 🧱 التقنيات المستخدمة

| الطبقة | التكنولوجيا |
| --- | --- |
| بيئة تشغيل سطح المكتب | Tauri v2 |
| واجهة خلفية أصلية | Rust — استطلاع الحافظة، الاختصارات العامة، شريط المهام، واجهات نظام التشغيل |
| التخزين | SQLite عبر Diesel ORM وعمليات الترحيل |
| الواجهة الأمامية | React 19، TypeScript، Vite |
| الحالة غير المتزامنة | TanStack React Query |
| واجهة المستخدم | `lucide-react`، `highlight.js`، `sanitize-html`، وحدات CSS الدلالية |
| الجودة | Vitest، ESLint، `tsc --noEmit` |
| التعبئة والتغليف | Tauri CLI — dmg, msi, nsis, AppImage, deb |

تطبيق أصلي (Binary)، بصمة صغيرة، بدون Electron.

---

## 🛠 التطوير

```bash
pnpm install
pnpm dev
```

التحقق قبل فتح طلب سحب (PR):

```bash
pnpm lint && pnpm typecheck && pnpm version:check && pnpm test
```

إنشاء برامج التثبيت:

```bash
pnpm tauri build
```

تتطلب إصدارات النشر `TAURI_SIGNING_PRIVATE_KEY` (واختيارياً `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`). يستخدم تغليف CI الدخاني `pnpm package:ci`، لذلك يتم بناء طلبات السحب بدون أسرار توقيع النشر.

### هيكل المشروع

| المسار | الوظيفة |
| --- | --- |
| `src-tauri/src` | واجهات نظام التشغيل، الحافظة، شريط المهام، الاختصارات، SQLite، التنظيف، أوامر Tauri |
| `src/shared` | أنواع مجال TypeScript النقية، الثوابت، حزم الترجمة (i18n)، الأدوات المساعدة |
| `src/renderer/api` | حدود أوامر/أحداث Tauri المكتوبة (`clipwheelClient.ts`) |
| `src/renderer/data` | خطافات React Query، إبطال ذاكرة التخزين المؤقت، ربط مزود API |
| `src/renderer/features` | ميزات الواجهة: `wheel` (العجلة)، `history` (السجل)، `preview` (المعاينة)، `settings` (الإعدادات) |
| `src/renderer/presentation` | مساعدات التنسيق والعرض |
| `src/renderer/ui` | عناصر واجهة مستخدم قابلة لإعادة الاستخدام |
| `src/renderer/styles` | وحدات CSS الدلالية، وتخطيط الميزات |

قواعد الهندسة المعمارية للمساهمين ووكلاء التكويد: [AGENTS.md](AGENTS.md). سير العمل: [CONTRIBUTING.md](CONTRIBUTING.md). مستندات النشر وتحديد الإصدارات: [docs/](docs).

---

## 🗺 خريطة الطريق

- بناء إصدارات موثقة من Apple وموقعة بشكل موثوق من Windows.
- تسجيل اختصار عام قابل للتكوين.
- استعادة الحافظة للملفات الأصلية.
- استيراد / تصدير للنسخ الاحتياطية المحلية.
- دعم المزيد من لغات البرمجة وأنواع المعاينة.

## ⚠️ القيود المعروفة

- اللصق التلقائي موجود كإعداد ولكنه معطل ولم يتم محاكاته بعد.
- تتم استعادة مراجع الملفات كمسارات نصية في الوقت الحالي.
- يعد اكتشاف التطبيق المصدر مجرد عنصر نائب (Placeholder) — تختلف واجهات التطبيقات النشطة عبر الأنظمة الأساسية.
- التثبيتات التي اختارت المظهر `الداكن` (dark) أو `الفاتح` (light) مسبقًا تحتفظ بهذا الخيار؛ بينما الافتراضي للتثبيتات الجديدة هو سمة `النظام` (system).

---

## 🤝 المساهمة

نرحب بطلبات الإبلاغ عن المشكلات وطلبات السحب (Pull Requests) — راجع [CONTRIBUTING.md](CONTRIBUTING.md) و [SECURITY.md](SECURITY.md). إذا وفر لك ClipWheel الوقت، فإن ترك ⭐ سيساعد الآخرين في العثور عليه.

## 📄 الترخيص

[MIT](LICENSE) © مساهمي ClipWheel

---

<div align="center" dir="ltr">

<sub><b>الكلمات المفتاحية:</b> مدير الحافظة · القائمة الدائرية · قائمة الفطيرة · القائمة الدائرية · القائمة المستديرة · قائمة العجلة · القائمة الدوارة · قائمة التأشير · قائمة الحلقة · قائمة القوس · قائمة البوصلة · قائمة الدوار · صندوق الاختصارات · تاريخ الحافظة · مدير حافظة macOS · مدير حافظة Windows · مدير حافظة Linux · مدير حافظة مفتوح المصدر · الخصوصية أولاً · بدون إنترنت · Tauri · Rust · React · بديل Ditto · بديل Paste · بديل Maccy · بديل CopyQ</sub>

</div>
</div>
