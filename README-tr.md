<div align="center">

<img src="docs/media/whell.gif" alt="ClipWheel Action" width="600" />

# ClipWheel — Eşsiz Radyal Pano Yöneticisi

**Pano geçmişi listelerinde gezinmeyi bırakın. Dairesel menü arayüzü ile panonuza erişmenin en hızlı yolunu keşfedin. Tek bir kısayola basın, istediğiniz dilime kaydırın ve yapıştırın.**

ClipWheel; **macOS, Windows ve Linux** için ücretsiz, açık kaynaklı ve gizlilik odaklı bir pano yöneticisidir. Son 4–12 kopyanıza yalnızca tek bir hareketle ulaşmanızı sağlayan ve verilerinizin makinenizden asla çıkmadığı çarpıcı bir radyal tekerleğe (dairesel menü veya işaretleme menüsü olarak da bilinir) sahiptir.

<div style="margin-bottom: 20px;">
<img src="assets/brand/clipwheel-logo-transparent.png" alt="ClipWheel logo" width="128" />
</div>

[![Release](https://img.shields.io/github/v/release/mustafasavul/ClipWheel?style=flat-square)](https://github.com/mustafasavul/ClipWheel/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Platforms](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)](#-kurulum-ve-hızlı-başlangıç)
[![Telemetry: none](https://img.shields.io/badge/telemetry-none-brightgreen?style=flat-square)](#-gizlilik-modeli)

![ClipWheel demo — hızlı ve akıcı radyal pano tekerleği iş başında](docs/media/clipwhell-entry.gif)

</div>

---

## 🎡 Neden başka bir liste değil de tekerlek?

Diğer tüm pano yöneticileri size **dikey bir liste** sunar: Bir pencere açın, yukarıdan aşağıya okuyun, doğru satırı bulun, tıklayın. Bu bir *arama* görevidir — her seferinde gözleriniz yorulur.

ClipWheel bunu bir **kas hafızası** görevine dönüştürür.

- **Sabit konumlar.** Son N kopyanız her seferinde aynı dilimlerde bulunur. "Sondan bir önceki" her zaman aynı yöndedir — "2. satırın buralarda bir yerde" değil, her zaman sağ üsttedir.
- **Radyal eşit mesafedir.** Bir listede 8. öğe 1. öğeden sekiz satır daha uzaktadır. Tekerlekte ise her dilim aynı uzaklıktadır.
- **Tek hareket, okumak yok.** Tekerleği açın, dilime doğru hareket edin, seçin. Veya `1`–`8` tuşlarına basın. Tekerlek kapanır ve öğe tekrar panonuza alınır.
- **Uygulamadan önce göz atın.** `Shift` tuşuna basılı tutarak **Hızlı Bakış** (Quicklook) yapın — tekerlekten çıkmadan o dilimdeki metin, kod veya görüntünün tam önizlemesini görün.
- **Arşivinize göre değil, hatırlamanıza göre boyutlandırıldı.** 4 ile 12 dilim arası seçim sizin. Tekerlek, bir saniyenin altında %90'lık durum olan kopyaladığınız son birkaç şeyi yönetir. Geçmiş penceresi ise arama, filtreleme ve önizlemelerle diğer %10'luk durumu yönetir.

---

## ✨ Temel Özellikler

### Tekerlek
- Ekranın ortasında veya imlecinizin bulunduğu yerde genel bir kısayol üzerinde **radyal katman**.
- **4–12 yapılandırılabilir dilim**, klavye ile seçim (`1`–`8`, `Enter`), kapatmak için `Esc`.
  <br/>
  <a href="docs/media/clipwhell-whell-customize-whell-items.png" target="_blank"><img src="docs/media/clipwhell-whell-customize-whell-items.png" width="600" alt="Tekerlek Öğelerini Özelleştir" /></a>
- **Shift ile Hızlı Bakış** — metin, kod ve görüntü dilimlerinin satır içi önizlemesi.
  <br/>
  <a href="docs/media/clipwhell-whell-quicklook.png" target="_blank"><img src="docs/media/clipwhell-whell-quicklook.png" width="600" alt="Hızlı Bakış Önizlemesi" /></a>
- **Klavye Kısayolları** — Kas hafızanızı kullanan yıldırım hızında seçim.
  <br/>
  <a href="docs/media/clipwhell-whell-shortcuts.png" target="_blank"><img src="docs/media/clipwhell-whell-shortcuts.png" width="600" alt="Kısayol Yapılandırması" /></a>
- **Tamamen temalandırılabilir** — renk ön ayarları, segmente özel paletler ve segmentler, aktif dilim, halkalar, etiketler ve panel için özel renkler; 24'e kadar kaydedilmiş özel ön ayar.
  <br/>
  <p align="center">
    <a href="docs/media/clipwhell-apperance-color-1.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-1.png" width="30%" alt="Tema Rengi 1" /></a>
    <a href="docs/media/clipwhell-apperance-color-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-2.png" width="30%" alt="Tema Rengi 2" /></a>
    <a href="docs/media/clipwhell-apperance-color-3.png" target="_blank"><img src="docs/media/clipwhell-apperance-color-3.png" width="30%" alt="Tema Rengi 3" /></a>
  </p>
  <p align="center">
    <a href="docs/media/clipwhell-apperance.png" target="_blank"><img src="docs/media/clipwhell-apperance.png" width="48%" alt="Görünüm Ayarları" /></a>
    <a href="docs/media/clipwhell-apperance-2.png" target="_blank"><img src="docs/media/clipwhell-apperance-2.png" width="48%" alt="Görünüm Özelleştirmesi" /></a>
  </p>

### Geçmiş ve Arama
- **Arama, tür filtreleri, tarih filtreleri ve sayfalama** ile tam geçmiş penceresi.
- Metin, kod, zengin metin, URL'ler, resimler ve dosya referansları için **zengin önizleme paneli**.
- **Her öğe için meta veriler**: bayt boyutu, okunabilir boyut, metin uzunluğu, satır sayısı, dosya sayısı, oluşturulma ve son kullanılma zamanı.
- Herhangi bir girişi **sabitleme, favorilere ekleme ve metin dönüşümleri**.
- **Geri dönüşüm kutusu ile yumuşak silme**, geri yükleme ve kalıcı olarak silme.

### Yakalama
- Düz metin · zengin metin / HTML / RTF · resimler ve ekran görüntüleri · dosya ve klasör referansları · URL'ler · dil algılamalı kod parçacıkları · terminal komutları.
- Oluşturulan küçük resimlerle (thumbnails) yerel resim öğesi depolama.
- Tür bazında yakalama geçişleri ve kopya (yinelenen öğe) işleme.

### Gizlilik ve Kontrol
- **Yakalamayı duraklatma**, **yoksayılan kaynak uygulamalar** ve **çıkışta temizleme**.
- Sistem / koyu / açık tema, varsayılan olarak işletim sistemini izler.
- RTL (Arapça, Farsça) dahil **24 dil** desteği.
- Sistem tepsisi simgesi, otomatik başlatma ve GitHub sürümlerinden yerinde güncellemeler.

---

## 🔒 Gizlilik Modeli

ClipWheel, **vaatlerle değil, tasarımı gereği yerel önceliklidir**:

- Her şey, Tauri uygulama veri dizini içindeki yerel bir **SQLite** veritabanında ve resim öğesi klasöründe yaşar.
- **Telemetri yok. Analitik yok. Hesap yok. Bulut senkronizasyonu yok. Harici servis yok.**
- Uygulamanın yaptığı tek ağ çağrısı, genel GitHub sürümleri meta veri URL'sine karşı yapılan güncelleme kontrolüdür.
- Pano içeriği tam olarak kopyalandığı gibi saklanır — cihaz dışına herhangi bir şey gönderen bir bulut sınıflandırıcısı, OCR veya maskeleme katmanı yoktur.

Panonuz genellikle en hassas verilerinizi barındırır: şifreler, belirteçler (token), özel mesajlar. Bu nedenle makineden asla ayrılmaz.

---

## 📦 Kurulum ve Hızlı Başlangıç

### macOS

```bash
brew install --cask mustafasavul/tap/clipwheel
```

Veya yonganız için `.dmg` dosyasını [en son sürümden](https://github.com/mustafasavul/ClipWheel/releases/latest) edinin: `ClipWheel_0.2.0_aarch64.dmg` (Apple Silicon) veya `ClipWheel_0.2.0_x64.dmg` (Intel).

### Windows

[En son sürümden](https://github.com/mustafasavul/ClipWheel/releases/latest) indirip çalıştırın: `ClipWheel_0.2.0_x64-setup.exe` (NSIS yükleyici) veya `ClipWheel_0.2.0_x64_en-US.msi`.

### Linux

```bash
sudo apt install ./ClipWheel_0.2.0_amd64.deb
```

```bash
chmod +x ClipWheel_0.2.0_amd64.AppImage && ./ClipWheel_0.2.0_amd64.AppImage
```

> Erken sürümler imzasız veya geçici olarak imzalanmış olabilir. macOS Gatekeeper ve Windows SmartScreen, Apple noter onayı ve Windows güvenilir imzası yapılandırılana kadar uyarabilir.

### İlk 30 saniye

1. ClipWheel'i başlatın — sistem tepsinizde / menü çubuğunuzda yaşar.
2. Birkaç şey kopyalayın.
3. **`Cmd+Shift+V`** (macOS) veya **`Ctrl+Shift+V`** (Windows/Linux) tuşlarına basın.
4. Bir dilime doğru ilerleyin veya `1`–`8` tuşlarına basın. Önce önizleme yapmak için `Shift` tuşunu basılı tutun.
5. Yapıştırın.

| Eylem | Kısayol |
| --- | --- |
| Tekerleği aç | `Cmd+Shift+V` / `Ctrl+Shift+V` |
| Öğe seç | `1`–`8` veya `Enter` |
| Hızlı bakış önizleme | `Shift` tuşuna basılı tutun |
| Tekerleği kapat | `Esc` |

---

## 🧱 Teknoloji Yığını

| Katman | Teknoloji |
| --- | --- |
| Masaüstü çalışma zamanı | Tauri v2 |
| Yerel arka uç (Backend) | Rust — pano yoklama, genel kısayollar, sistem tepsisi, işletim sistemi API'leri |
| Depolama | Diesel ORM ve geçişleri aracılığıyla SQLite |
| Ön uç (Frontend) | React 19, TypeScript, Vite |
| Asenkron durum | TanStack React Query |
| Kullanıcı Arayüzü (UI) | `lucide-react`, `highlight.js`, `sanitize-html`, semantik CSS tokenleri |
| Kalite | Vitest, ESLint, `tsc --noEmit` |
| Paketleme | Tauri CLI — dmg, msi, nsis, AppImage, deb |

Yerel uygulama (binary), küçük ayak izi, Electron kullanılmaz.

---

## 🛠 Geliştirme

```bash
pnpm install
pnpm dev
```

Bir PR açmadan önce doğrulayın:

```bash
pnpm lint && pnpm typecheck && pnpm version:check && pnpm test
```

Yükleyicileri derleyin:

```bash
pnpm tauri build
```

Sürüm derlemeleri `TAURI_SIGNING_PRIVATE_KEY` (ve isteğe bağlı olarak `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`) gerektirir. CI duman paketlemesi (smoke packaging) `pnpm package:ci` kullanır, bu nedenle çekme istekleri (pull requests) sürüm imzalama sırları olmadan derlenir.

### Proje yapısı

| Yol | Görev |
| --- | --- |
| `src-tauri/src` | İşletim sistemi API'leri, pano, tepsi, kısayollar, SQLite, temizleme, Tauri komutları |
| `src/shared` | Saf TypeScript etki alanı türleri, sabitler, i18n paketleri, yardımcı programlar |
| `src/renderer/api` | Yazılı Tauri komut/olay sınırı (`clipwheelClient.ts`) |
| `src/renderer/data` | React Query kancaları (hooks), önbellek geçersiz kılma, API sağlayıcı bağlantısı |
| `src/renderer/features` | Özellik yüzeyleri: `wheel`, `history`, `preview`, `settings` |
| `src/renderer/presentation` | Biçimlendirme ve görüntüleme yardımcıları |
| `src/renderer/ui` | Yeniden kullanılabilir kullanıcı arayüzü temel bileşenleri |
| `src/renderer/styles` | Semantik belirteçler, düzen ve özellik CSS'leri |

Katkıda bulunanlar ve kodlama ajanları için mimari kuralları: [AGENTS.md](AGENTS.md). İş akışı: [CONTRIBUTING.md](CONTRIBUTING.md). Sürüm ve versiyonlandırma belgeleri: [docs/](docs).

---

## 🗺 Yol Haritası

- Apple noter onaylı ve Windows güvenilir imzalı derlemeler
- Yapılandırılabilir genel kısayol kaydı
- Yerel dosya panosu geri yüklemesi
- Yerel yedeklemeler için içe / dışa aktarma
- Daha fazla sözdizimi dili ve önizleme türü

## ⚠️ Bilinen Sınırlamalar

- Otomatik yapıştırma bir ayar olarak mevcuttur ancak devre dışıdır ve henüz simüle edilmemiştir.
- Dosya referansları şimdilik metin yolları olarak geri yükleniyor.
- Kaynak uygulama algılaması bir yer tutucudur (placeholder) — çapraz platform aktif uygulama API'leri farklılık gösterir.
- Önceden `koyu` (dark) veya `açık` (light) tema seçen kurulumlar o seçimi korur; yeni kurulumlarda varsayılan `sistem`dir.

---

## 🤝 Katkıda Bulunma

Sorunlar ve çekme istekleri (pull requests) memnuniyetle karşılanır — bkz. [CONTRIBUTING.md](CONTRIBUTING.md) ve [SECURITY.md](SECURITY.md). Eğer ClipWheel size zaman kazandırırsa, bırakacağınız bir ⭐ diğer insanların da onu bulmasına yardımcı olur.

## 📄 Lisans

[MIT](LICENSE) © ClipWheel Katkıda Bulunanları

---

<div align="center">

<sub><b>Anahtar Kelimeler:</b> pano yöneticisi · radyal menü · pasta menü · dairesel menü · yuvarlak menü · tekerlek menü · döner menü · işaretleme menüsü · halka menü · yay menü · pusula menü · döndürücü menü · sıcak kutu (hotbox) · pano geçmişi · macOS pano yöneticisi · Windows pano yöneticisi · Linux pano yöneticisi · açık kaynaklı pano yöneticisi · gizlilik öncelikli · çevrimdışı · Tauri · Rust · React · Ditto alternatifi · Paste alternatifi · Maccy alternatifi · CopyQ alternatifi</sub>

</div>
