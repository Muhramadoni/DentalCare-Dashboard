# IN Dental Care - Dashboard & EMR System (DESIGN.md)

Dokumen ini menetapkan panduan visual, palet warna, tipografi, dan bahasa komponen UI secara spesifik untuk memastikan seluruh layar dan tampilan halaman pada aplikasi IN DENTAL CARE - Dashboard & EMR System memiliki nuansa (*look and feel*) yang konsisten, profesional, dan seragam.

## 1. Brand Identity & Filosofi Visual

* **Esensi Merek:** Profesional, fungsional, bersih, terstruktur, dan efisien untuk kebutuhan operasional klinik gigi modern.

* **Tone of Voice:** Informatif, akurat, intuitif, dan terpercaya bagi tenaga medis serta staf administrasi.

* **Tagline Resmi:** #CareForEverySmile

## 2. Palet Warna (Color Palette)

Penggunaan warna pada seluruh komponen UI dashboard dirancang khusus untuk menciptakan lingkungan kerja digital yang kontras, bersih, dan nyaman dalam jangka waktu lama.

| Token / Nama Warna | Kode HEX | Kegunaan Utama | 
| ----- | ----- | ----- | 
| **Primary Navy** | `#001e2f `(bg-navy-900) | Background utama Sidebar Navigasi dan elemen kontras tinggi. | 
| **Primary Navy Hover** | `#0a232f` (bg-navy-500) | Warna interaksi state hover pada menu sidebar. | 
| **Accent Cyan Blue** | `#49baff `(bg-brand-blue) | Warna utama tombol aksi, tab aktif, ikon indikator, dan teks penekanan. | 
| **Accent Cyan Blue Hover** | `#98cfff `(hover:bg-brand-blueHover) | State interaksi saat tombol utama disentuh/*hover*. | 
| **Lime Green** | `#e5ff8f `(bg-brand-lime) | Badge status Reschedule, Terdaftar, dan indikator sukses. | 
| **Neutral Soft Background** | `#f9f8ff `(bg-\[Purple-50\]) | Warna latar belakang area konten utama (*main content area*). | 
| **Card & Text Neutral** | `#ffffff` / `#2b3674` | Warna latar kartu putih bersih serta teks judul utama halaman (*headings*). | 

## 3. Tipografi (Typography)

* **Font Keluarga Utama:** Poppins, sans-serif (diimpor langsung dari Google Fonts).

* **Skala Ukuran Teks & Hierarki:**

  * **Title H2 (Judul Halaman):** `text-xl`, `font-bold`, `text-slate-800`.

  * **Card Header H3:** `text-lg`, `font-bold`, `text-slate-800`.

  * **Sub-header / Label Form:** `text-sm`, `font-medium`, `text-gray-800`.

  * **Body Text / Tabel Item:** `text-sm`, `font-medium`, `text-gray-700`.

  * **Caption / Small Subtitle:** `text-xs`, `text-gray-500`.

  * **Small Badges / Metadata:** `text-[10px]` atau `text-[11px]`, `font-medium`.

## 4. Sistem Spasi & Bentuk Geometris (Layout & Shape System)

* **Struktur Tata Letak Utama:** Menggunakan arsitektur Fixed Sidebar (`w-64`, penuh di sisi kiri) dipadukan dengan Dynamic Scrollable Main Content (`flex-1`, latar `#f8f9fe`, padding `p-8`).

* **Grid System Responsif:**

  * **Top Stat Cards:** `grid grid-cols-1 md:grid-cols-2 gap-6`.

  * **Main Section Split:** `grid grid-cols-1 lg:grid-cols-3 gap-6` (pembagian proporsi tabel dan panel aktivitas).

  * **Doctor/Service Cards:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.

* **Card Radius & Shadow Tokens:**

  * **Card Radius:** Menggunakan sudut membulat `rounded-2xl` pada kontainer data, tabel, dan kotak statistik.

  * **Reference Shadow:** Menggunakan bayangan lembut standar `box-shadow: 0 4px 20px 0 rgba(0,0,0,0.06)` (`reference-shadow`).

## 5. Komponen UI & Interaksi (Component Guidelines)

### A. Tombol Utama (Primary Buttons)

* **Struktur & Warna:** Menggunakan latar `bg-brand-blue` dengan teks putih, sudut membulat `rounded-xl`, ukuran `text-sm font-semibold`, serta dilengkapi efek bayangan halus (`shadow-md shadow-brand-blue/30`).

* **Hover State:** Berubah mulus ke `hover:bg-brand-blueHover` dengan transisi intuitif.

### B. Status Badges (Pill Status)

* **Appointment / Terjadwal:** Menggunakan kombinasi warna Cyan (`bg-[#e6f7ff] text-[#49baff] border border-[#49baff] rounded-full px-3 py-1`).

* **Reschedule / Perubahan Jadwal:** Menggunakan kombinasi warna Lime (`bg-[#f6fcc9] text-[#8da607] border border-[#adc91f] rounded-full px-3 py-1`).

### C. Form Inputs & Selects

* **Desain Input:** Seluruh elemen formulir dan dropdown wajib memiliki sudut membulat `rounded-xl`, latar belakang abu-abu terang (`bg-gray-50`), garis tepi tipis (`border border-gray-300`), serta garis fokus berwarna biru terang (`focus:border-brand-blue`).