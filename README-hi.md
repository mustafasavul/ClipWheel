<div align="center">

<img src="assets/brand/clipwheel-logo-transparent.png" alt="ClipWheel logo" width="128" />

<img src="docs/media/whell.gif" alt="ClipWheel Action" width="600" />

# ClipWheel — अद्वितीय रेडियल क्लिपबोर्ड मैनेजर

**क्लिपबोर्ड इतिहास की सूचियों को स्क्रॉल करना बंद करें। पाई मेनू इंटरफ़ेस के साथ अपने क्लिपबोर्ड तक पहुँचने का सबसे तेज़ तरीका खोजें। एक शॉर्टकट दबाएं, मनचाहे स्लाइस (हिस्से) की ओर फ़्लिक करें, और पेस्ट करें।**

ClipWheel **macOS, Windows और Linux** के लिए एक मुफ़्त, ओपन-सोर्स, प्राइवेसी-फ़र्स्ट (गोपनीयता-प्रथम) क्लिपबोर्ड मैनेजर है — जिसमें एक शानदार रेडियल व्हील (जिसे सर्कुलर मेनू, मार्किंग मेनू या हॉटबॉक्स भी कहा जाता है) शामिल है। यह आपके पिछले 4–12 कॉपी किए गए आइटम को केवल एक जेस्चर (इशारे) की दूरी पर रखता है, और आपका डेटा कभी भी आपकी मशीन से बाहर नहीं जाता है।

[![Release](https://img.shields.io/github/v/release/mustafasavul/ClipWheel?style=flat-square)](https://github.com/mustafasavul/ClipWheel/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Platforms](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)](#-installation--quick-start)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen?style=flat-square)](#-privacy-model)

![ClipWheel demo — तेज़ और शानदार रेडियल क्लिपबोर्ड व्हील एक्शन में](docs/media/clipwhell-entry.gif)

</div>

---

## 🎡 सूची के बजाय व्हील क्यों?

हर दूसरा क्लिपबोर्ड मैनेजर आपको एक **वर्टिकल लिस्ट (लंबवत सूची)** देता है: एक विंडो खोलें, ऊपर से नीचे पढ़ें, सही पंक्ति ढूंढें, और क्लिक करें। यह एक *खोज (search)* कार्य है — आपकी आंखें हर बार काम करती हैं।

ClipWheel इसे एक **मसल-मेमोरी (मांसपेशियों की याददाश्त)** का कार्य बनाता है।

- **निश्चित स्थान।** आपकी अंतिम N कॉपी हर बार उन्हीं स्लाइस में स्थित होती हैं। "अंतिम से पहले वाला" हमेशा एक ही दिशा में होता है — ऊपर-दाएं, न कि "पंक्ति 2 के आसपास कहीं"।
- **रेडियल का अर्थ है समान दूरी।** एक सूची में, आइटम 8 आइटम 1 से आठ पंक्तियाँ दूर है। व्हील पर, हर स्लाइस समान दूरी पर होता है।
- **एक जेस्चर, कोई पढ़ना नहीं।** व्हील खोलें, स्लाइस की ओर बढ़ें, और चुनें। या `1`–`8` दबाएं। व्हील बंद हो जाता है और आइटम आपके क्लिपबोर्ड पर वापस आ जाता है।
- **कन्फर्म करने से पहले झांकें।** **Quicklook (त्वरित पूर्वावलोकन)** के लिए `Shift` को दबाए रखें — व्हील को छोड़े बिना उस स्लाइस में टेक्स्ट, कोड या छवि का पूरा पूर्वावलोकन करें।
- **आपके आर्काइव के लिए नहीं, आपकी याददाश्त के अनुसार आकार।** 4 से 12 स्लाइस, आपकी पसंद। व्हील आपके द्वारा कॉपी की गई पिछली कुछ चीज़ों को संभालता है — 90% मामलों में, एक सेकंड से भी कम समय में। हिस्ट्री विंडो सर्च, फिल्टर और पूर्वावलोकन के साथ अन्य 10% को संभालती है।

---

## ✨ मुख्य विशेषताएँ (Key Features)

### व्हील (The Wheel)
- ग्लोबल शॉर्टकट पर **रेडियल ओवरले**, स्क्रीन के केंद्र में या आपके कर्सर पर।
- **4–12 कॉन्फ़िगर करने योग्य स्लाइस**, कीबोर्ड चयन (`1`–`8`, `Enter`), बंद करने के लिए `Esc`।
  <br/>
  <a href="docs/media/clipwhell-whell-customize-whell-items.png" target="_blank"><img src="docs/media/clipwhell-whell-customize-whell-items.png" width="600" alt="Customize Wheel Items" /></a>
- **Shift-से-Quicklook** — टेक्स्ट, कोड और छवि स्लाइस का इनलाइन पूर्वावलोकन।
  <br/>
  <a href="docs/media/clipwhell-whell-quicklook.png" target="_blank"><img src="docs/media/clipwhell-whell-quicklook.png" width="600" alt="Quicklook Preview" /></a>
- **कीबोर्ड शॉर्टकट** — आपकी मसल मेमोरी का उपयोग करते हुए बिजली की तेजी से चयन।
  <br/>
  <a href="docs/media/clipwhell-whell-shortcuts.png" target="_blank"><img src="docs/media/clipwhell-whell-shortcuts.png" width="600" alt="Shortcuts Configuration" /></a>
- **पूरी तरह से थीम योग्य** — रंग प्रीसेट, प्रति-सेगमेंट पैलेट, और सेगमेंट, सक्रिय स्लाइस, रिंग, लेबल और पैनल के लिए कस्टम रंग; 24 तक सहेजे गए कस्टम प्रीसेट।
  <br/>
  <p align="center">
    <a href="docs/media/clipwhell-apperance-color-1.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-1.png" width="30%" alt="Theme Color 1" /></a>
    <a href="docs/media/clipwhell-apperance-color-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-2.png" width="30%" alt="Theme Color 2" /></a>
    <a href="docs/media/clipwhell-apperance-color-3.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-3.png" width="30%" alt="Theme Color 3" /></a>
  </p>
  <p align="center">
    <a href="docs/media/clipwhell-apperance.png" target="_blank"><img src="docs/media/clipwhell-apperance.png" width="48%" alt="Appearance Settings" /></a>
    <a href="docs/media/clipwhell-apperance-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-2.png" width="48%" alt="Appearance Customization" /></a>
  </p>

### इतिहास और खोज (History & Search)
- **सर्च, टाइप फिल्टर, डेट फिल्टर और पेजिनेशन** के साथ पूर्ण हिस्ट्री विंडो।
- टेक्स्ट, कोड, रिच टेक्स्ट, यूआरएल, इमेज और फ़ाइल संदर्भों के लिए **रिच प्रीव्यू पैनल**।
- **प्रति आइटम मेटाडेटा**: बाइट आकार, पढ़ने योग्य आकार, टेक्स्ट की लंबाई, लाइन काउंट, फ़ाइल काउंट, निर्माण और अंतिम-उपयोग का समय।
- किसी भी प्रविष्टि पर **पिन, पसंदीदा (फेवरेट), और टेक्स्ट ट्रांसफॉर्मेशन**।
- **सॉफ्ट डिलीट के साथ ट्रैश**, रिस्टोर (पुनर्स्थापित), और स्पष्ट स्थायी डिलीट विकल्प।

### कैप्चर (Capture)
- प्लेन टेक्स्ट · रिच टेक्स्ट / HTML / RTF · इमेज और स्क्रीनशॉट · फ़ाइल और फ़ोल्डर संदर्भ · यूआरएल · भाषा पहचान के साथ कोड स्निपेट · टर्मिनल कमांड।
- जेनरेट किए गए थंबनेल के साथ लोकल इमेज एसेट स्टोरेज।
- प्रति-प्रकार (per-type) कैप्चर टॉगल और डुप्लिकेट हैंडलिंग।

### गोपनीयता और नियंत्रण (Privacy & Control)
- **पॉज़ (रोकें) कैप्चर**, **इग्नोर किए गए स्रोत ऐप्स**, और **क्विट करने पर क्लियर** करें।
- सिस्टम / डार्क / लाइट थीम, डिफ़ॉल्ट रूप से OS का पालन करता है।
- **24 भाषाएँ** शामिल हैं, जिनमें RTL (अरबी, फ़ारसी) भी शामिल है।
- ट्रे आइकन, ऑटोस्टार्ट, और GitHub रिलीज़ से इन-प्लेस अपडेट।

---

## 🔒 गोपनीयता मॉडल (Privacy Model)

ClipWheel **वादे से नहीं, बल्कि डिज़ाइन से लोकल-फ़र्स्ट** है:

- सब कुछ Tauri ऐप डेटा डायरेक्टरी के अंदर एक लोकल **SQLite** डेटाबेस और एक इमेज एसेट फोल्डर में रहता है।
- **कोई टेलीमेट्री नहीं। कोई एनालिटिक्स नहीं। कोई अकाउंट नहीं। कोई क्लाउड सिंक नहीं। कोई बाहरी सेवा नहीं।**
- ऐप जो एकमात्र नेटवर्क कॉल करता है वह है सार्वजनिक GitHub रिलीज़ मेटाडेटा URL के विरुद्ध अपडेट की जाँच।
- क्लिपबोर्ड सामग्री ठीक उसी तरह संग्रहीत की जाती है जैसे कॉपी की गई थी — कोई क्लाउड क्लासिफायर नहीं, कोई OCR नहीं, कोई मास्किंग लेयर नहीं जो आपके डिवाइस से बाहर कुछ भी भेज रही हो।

आपका क्लिपबोर्ड अक्सर आपका सबसे संवेदनशील डेटा होता है: पासवर्ड, टोकन, निजी संदेश। इसलिए यह मशीन को कभी नहीं छोड़ता।

---

## 📦 इंस्टालेशन और क्विक स्टार्ट

### macOS

```bash
brew install --cask mustafasavul/tap/clipwheel
```

या [latest release](https://github.com/mustafasavul/ClipWheel/releases/latest) से अपनी चिप के लिए `.dmg` फ़ाइल प्राप्त करें: `ClipWheel_0.2.0_aarch64.dmg` (Apple Silicon) या `ClipWheel_0.2.0_x64.dmg` (Intel)।

### Windows

[latest release](https://github.com/mustafasavul/ClipWheel/releases/latest) से डाउनलोड करें और चलाएं: `ClipWheel_0.2.0_x64-setup.exe` (NSIS इंस्टॉलर) या `ClipWheel_0.2.0_x64_en-US.msi`।

### Linux

```bash
sudo apt install ./ClipWheel_0.2.0_amd64.deb
```

```bash
chmod +x ClipWheel_0.2.0_amd64.AppImage && ./ClipWheel_0.2.0_amd64.AppImage
```

> शुरुआती रिलीज़ पर हस्ताक्षर नहीं किए जा सकते हैं या तदर्थ (ad-hoc) हस्ताक्षर हो सकते हैं। macOS Gatekeeper और Windows SmartScreen तब तक चेतावनी दे सकते हैं जब तक Apple नोटरीकरण और Windows विश्वस्त हस्ताक्षर कॉन्फ़िगर नहीं हो जाते।

### पहले 30 सेकंड

1. ClipWheel लॉन्च करें — यह आपके सिस्टम ट्रे / मेनू बार में रहता है।
2. कुछ चीज़ें कॉपी करें।
3. **`Cmd+Shift+V`** (macOS) या **`Ctrl+Shift+V`** (Windows/Linux) दबाएं।
4. एक स्लाइस की ओर बढ़ें, या `1`–`8` दबाएं। पहले पूर्वावलोकन करने के लिए `Shift` दबाए रखें।
5. पेस्ट (Paste) करें।

| कार्य (Action) | शॉर्टकट |
| --- | --- |
| व्हील खोलें | `Cmd+Shift+V` / `Ctrl+Shift+V` |
| आइटम चुनें | `1`–`8` या `Enter` |
| क्विक्लुक पूर्वावलोकन | `Shift` दबाए रखें |
| व्हील बंद करें | `Esc` |

---

## 🧱 टेक स्टैक (Tech Stack)

| लेयर | तकनीक |
| --- | --- |
| डेस्कटॉप रनटाइम | Tauri v2 |
| नेटिव बैकएंड | Rust — क्लिपबोर्ड पोलिंग, ग्लोबल शॉर्टकट, ट्रे, OS APIs |
| स्टोरेज | Diesel ORM और माइग्रेशन के माध्यम से SQLite |
| फ्रंटएंड | React 19, TypeScript, Vite |
| एसिंक स्टेट | TanStack React Query |
| UI | `lucide-react`, `highlight.js`, `sanitize-html`, सिमेंटिक CSS टोकन |
| गुणवत्ता (Quality) | Vitest, ESLint, `tsc --noEmit` |
| पैकेजिंग | Tauri CLI — dmg, msi, nsis, AppImage, deb |

नेटिव बाइनरी, छोटा पदचिह्न (स्मॉल फुटप्रिंट), कोई Electron नहीं।

---

## 🛠 विकास (Development)

```bash
pnpm install
pnpm dev
```

PR खोलने से पहले सत्यापित (Validate) करें:

```bash
pnpm lint && pnpm typecheck && pnpm version:check && pnpm test
```

इंस्टॉलर बनाएं:

```bash
pnpm tauri build
```

रिलीज़ बिल्ड के लिए `TAURI_SIGNING_PRIVATE_KEY` (और वैकल्पिक रूप से `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`) की आवश्यकता होती है। CI स्मोक पैकेजिंग `pnpm package:ci` का उपयोग करता है, इसलिए पुल रिक्वेस्ट (pull requests) बिना रिलीज़ साइनिंग सीक्रेट्स के बिल्ड होते हैं।

### प्रोजेक्ट संरचना

| पाथ | विवरण |
| --- | --- |
| `src-tauri/src` | OS APIs, क्लिपबोर्ड, ट्रे, शॉर्टकट, SQLite, क्लीनअप, Tauri कमांड |
| `src/shared` | शुद्ध TypeScript डोमेन प्रकार, स्थिरांक (constants), i18n बंडल, उपयोगिताएँ |
| `src/renderer/api` | टाइप की गई Tauri कमांड/इवेंट बाउंड्री (`clipwheelClient.ts`) |
| `src/renderer/data` | React Query हुक, कैश अमान्यकरण (invalidation), API प्रदाता वायरिंग |
| `src/renderer/features` | फ़ीचर सरफेस: `wheel`, `history`, `preview`, `settings` |
| `src/renderer/presentation` | फ़ॉर्मेटिंग और डिस्प्ले सहायक |
| `src/renderer/ui` | पुन: प्रयोज्य (Reusable) UI प्रिमिटिव्स |
| `src/renderer/styles` | सिमेंटिक टोकन, लेआउट और फ़ीचर CSS |

योगदानकर्ताओं (Contributors) और कोडिंग एजेंटों के लिए वास्तुकला नियम: [AGENTS.md](AGENTS.md)। वर्कफ़्लो: [CONTRIBUTING.md](CONTRIBUTING.md)। रिलीज़ और वर्जनिंग डॉक्स: [docs/](docs)।

---

## 🗺 रोडमैप (Roadmap)

- Apple नोटरीकृत (notarized) और Windows ट्रस्टेड-साइन बिल्ड
- कॉन्फ़िगर करने योग्य ग्लोबल शॉर्टकट रिकॉर्डिंग
- नेटिव फ़ाइल क्लिपबोर्ड पुनर्स्थापना
- लोकल बैकअप के लिए आयात / निर्यात (Import / export)
- अधिक सिंटैक्स भाषाएँ और पूर्वावलोकन प्रकार

## ⚠️ ज्ञात सीमाएँ (Known Limitations)

- ऑटो पेस्ट एक सेटिंग के रूप में मौजूद है लेकिन अक्षम है और अभी तक सिम्युलेटेड नहीं है।
- फ़ाइल संदर्भ अभी के लिए टेक्स्ट पथ (paths) के रूप में पुनर्स्थापित होते हैं।
- स्रोत ऐप डिटेक्शन एक प्लेसहोल्डर है — क्रॉस-प्लेटफॉर्म सक्रिय-ऐप एपीआई भिन्न होते हैं।
- जिन इंस्टाल में पहले से ही `dark` या `light` चुना गया है, वे उस विकल्प को बनाए रखते हैं; नए इंस्टाल डिफ़ॉल्ट रूप से `system` पर सेट होते हैं।

---

## 🤝 योगदान (Contributing)

समस्याओं (Issues) और पुल रिक्वेस्ट्स का स्वागत है — [CONTRIBUTING.md](CONTRIBUTING.md) और [SECURITY.md](SECURITY.md) देखें। अगर ClipWheel आपका समय बचाता है, तो एक ⭐ अन्य लोगों को इसे खोजने में मदद करेगा।

## 📄 लाइसेंस

[MIT](LICENSE) © ClipWheel योगदानकर्ता

---

<div align="center">

<sub><b>कीवर्ड्स (Keywords):</b> clipboard manager · radial menu · pie menu · circular menu · round menu · wheel menu · rotary menu · marking menu · ring menu · arc menu · compass menu · spinner menu · hotbox · clipboard history · macOS clipboard manager · Windows clipboard manager · Linux clipboard manager · open source clipboard manager · privacy-first · offline · Tauri · Rust · React · Ditto alternative · Paste alternative · Maccy alternative · CopyQ alternative</sub>

</div>
