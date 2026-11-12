# Code Style & Clean Code Conventions

Dokumen ini menetapkan standar dan konvensi penulisan kode untuk seluruh pengembangan aplikasi **IN DENTAL CARE Admin Dashboard**, mencakup **Frontend (ReactJS)**, **Backend (Node.js & Express.js)**, **Database (PostgreSQL)**, dan modul **Data Analytics (Python / Jupyter Notebook)**.

Fokus utama dokumen ini adalah memastikan kode yang ditulis **bersih (*clean code*)**, **konsisten**, **mudah dibaca (*readable*)**, serta **mudah dipahami dan dipelihara (*maintainable*)**.

> [!NOTE]
> Seluruh standar, arsitektur, dan protokol keamanan sistem (seperti autentikasi, enkripsi password, rate limiting, validasi input, proteksi CSRF/CORS, dan kepatuhan OWASP) dikelola secara terpusat pada dokumen tersendiri: [security.md](file:///c:/Users/ASUS/OneDrive/Documents/GitHub/DentalCare-Dashboard/panduan/security.md).

---

## 1. Purpose (Tujuan)

Tujuan penetapan konvensi penulisan kode ini adalah:
1. **Keterbacaan Kode (Readability):** Memastikan kode mudah dipahami secara intuitif oleh seluruh anggota tim teknis tanpa memerlukan penjelasan lisan.
2. **Konsistensi Basis Kode (Consistency):** Memastikan seluruh file pada frontend, backend, database, dan analitik data memiliki pola, struktur, serta gaya penulisan yang seragam seolah ditulis oleh satu orang pengembang.
3. **Kemudahan Pemeliharaan (Maintainability):** Mempermudah proses *debugging*, penambahan fitur baru, serta *refactoring* di masa mendatang tanpa menimbulkan efek samping yang tidak terduga.
4. **Efisiensi Kolaborasi & Code Review:** Menjadi tolok ukur objektif dalam proses peninjauan kode (*Code Review*) dan pengajuan *Pull Request* (PR).

---

## 2. General Clean Code Principles (Prinsip Umum)

Setiap pengembang wajib menerapkan prinsip rekayasa perangkat lunak berikut saat menulis kode:

* **KISS (Keep It Simple, Stupid):** Tulis logika yang lugas dan tidak berbelit-belit. Hindari *over-engineering* atau membuat lapisan abstraksi yang belum dibutuhkan.
* **DRY (Don't Repeat Yourself):** Jangan menduplikasi logika. Jika ada blok kode atau logika bisnis yang digunakan berulang lebih dari dua kali, pisahkan menjadi fungsi utilitas (*helper*), *custom hook*, atau komponen modular.
* **SRP (Single Responsibility Principle):** Satu fungsi, satu komponen React, atau satu modul backend hanya boleh memiliki satu tanggung jawab spesifik. Jika sebuah fungsi melakukan lebih dari satu hal, pecah menjadi fungsi-fungsi yang lebih kecil.
* **YAGNI (You Aren't Gonna Need It):** Jangan menambahkan fungsionalitas, parameter, atau konfigurasi spekulatif hanya karena "mungkin akan dipakai nanti". Bangun apa yang dibutuhkan saat ini berdasarkan spesifikasi PRD.
* **The Boy Scout Rule:** Tinggalkan basis kode dalam keadaan lebih bersih dan rapi daripada saat Anda pertama kali membukanya (*Always leave the campground cleaner than you found it*).
* **Early Return Pattern (Guard Clauses):** Hindari percabangan `if-else` bersarang (*deep nesting*). Evaluasi kondisi gagal atau kasus khusus di awal fungsi, lalu lakukan *return* lebih awal.

```javascript
// Buruk: Nested if-else berlebihan
function processAppointment(appointment) {
  if (appointment) {
    if (appointment.status === 'SCHEDULED') {
      if (appointment.doctorAvailable) {
        return confirmAppointment(appointment);
      } else {
        return 'Dokter tidak tersedia';
      }
    } else {
      return 'Jadwal tidak valid';
    }
  }
}

// Baik: Menggunakan Early Return (Guard Clauses)
function processAppointment(appointment) {
  if (!appointment) return null;
  if (appointment.status !== 'SCHEDULED') return 'Jadwal tidak valid';
  if (!appointment.doctorAvailable) return 'Dokter tidak tersedia';

  return confirmAppointment(appointment);
}
```

---

## 3. Naming Conventions (Konvensi Penamaan)

Gunakan **Bahasa Inggris** untuk penamaan seluruh variabel, fungsi, berkas, komponen, kelas, dan entitas database agar seragam dengan pustaka standar dan ekosistem perangkat lunak yang digunakan.

### 3.1. Tabel Standar Penamaan

| Elemen | Format / Gaya | Contoh yang Benar | Keterangan |
| :--- | :--- | :--- | :--- |
| **Variables & Functions** | `camelCase` | `patientName`, `fetchDoctorSchedules`, `calculateQueueNumber` | Gunakan kata kerja aktif untuk fungsi (`fetch`, `handle`, `get`, `is`). |
| **Boolean Variables** | `camelCase` (Prefix kata tanya) | `isAppointmentValid`, `hasActiveEmr`, `shouldAutoScroll`, `canEditRecord` | Wajib diawali prefix: `is`, `has`, `can`, `should`. |
| **React Components & Pages** | `PascalCase` | `ReservationModal.jsx`, `DoctorScheduleCard.jsx`, `EmrHistoryPage.jsx` | Nama file dan nama komponen identik. |
| **React Custom Hooks** | `camelCase` (Prefix `use`) | `useReservations.js`, `useDoctorSchedule.js`, `usePatientHistory.js` | Wajib diawali kata `use`. |
| **Constants & Enum** | `UPPER_SNAKE_CASE` | `MAX_RESERVATION_PER_HOUR`, `APPOINTMENT_STATUS`, `DEFAULT_PAGE_SIZE` | Nilai statis yang nilainya tidak berubah. |
| **Backend Files & Helpers** | `kebab-case` | `reservation-controller.js`, `emr-service.js`, `date-formatter.js` | Modul Express, utilitas, dan service. |
| **PostgreSQL Tables & Columns** | `snake_case` | Tabel: `medical_records`, `doctor_schedules`<br>Kolom: `patient_id`, `created_at`, `tooth_region` | Nama tabel berbentuk jamak (*plural*). |
| **Python Analytics** | `snake_case` | `df_patient_visits`, `clean_emr_records()`, `plot_monthly_revenue()` | Mengikuti konvensi resmi **PEP 8**. |

### 3.2. Penamaan yang Bermakna & Kontekstual

* Hindari singkatan yang ambigu (misal: `p`, `rec`, `d`, `calc`). Gunakan nama yang deskriptif (misal: `patient`, `emrRecord`, `doctor`, `calculateSubtotal`).
* Nama fungsi harus mencerminkan apa yang dilakukan fungsi tersebut secara akurat:
  * `getPatientById(id)` -> mengambil satu data pasien berdasarkan ID.
  * `filterReservationsByDate(date)` -> memfilter daftar reservasi berdasarkan tanggal.
  * `formatToothRegion(regionCode)` -> memformat kode regio gigi untuk tampilan antarmuka.

---

## 4. Code Formatting & Syntax Standards

Untuk menjaga konsistensi visual di seluruh editor kode tim pengembang:

* **Indentasi:**
  * Gunakan **2 spasi** untuk berkas JavaScript, JSX, JSON, CSS/Tailwind, dan Markdown.
  * Gunakan **4 spasi** untuk berkas Python sesuai standar **PEP 8**.
  * Dilarang mencampur penggunaan *Tabs* dan *Spaces*.
* **Batas Panjang Baris (Line Length):** Maksimal **80-100 karakter** per baris. Jika melebihi batas, pecah baris secara alami pada operator atau argumen fungsi.
* **Titik Koma (Semicolons):** Gunakan *semicolons* (`;`) secara konsisten pada seluruh kode JavaScript dan Node.js untuk mencegah potensi ambigu pada *Automatic Semicolon Insertion (ASI)*.
* **Tanda Petik (Quotes):**
  * Gunakan tanda petik tunggal (`'`) untuk nilai string reguler di JavaScript/Node.js.
  * Gunakan *template literals* (`` ` ``) ketika membutuhkan interpolasi string `${variable}`.
  * Gunakan tanda petik ganda (`"`) untuk atribut pada JSX/HTML (contoh: `<div className="flex items-center">`).
* **Pengurutan Impor (Import Ordering):** Kelompokkan baris `import` dengan urutan terstruktur dan dipisahkan oleh satu baris kosong:
  1. Pustaka eksternal pihak ketiga (misal: `react`, `express`, `lucide-react`).
  2. Modul internal, komponen, atau hooks tingkat atas (misal: `../components/Button`, `../hooks/useReservations`).
  3. Utilitas, helper, dan konstanta (misal: `../utils/format-date`, `../constants/status`).
  4. Stylesheet atau aset gambar (misal: `../assets/logo.svg`, `./styles.css`).

```javascript
// Contoh urutan import di React
import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, AlertCircle } from 'lucide-react';

import ReservationModal from '../components/ReservationModal';
import useReservations from '../hooks/useReservations';

import { formatDateIndo } from '../utils/date-helper';
import { APPOINTMENT_STATUS } from '../constants/reservation-constants';

import '../styles/dashboard.css';
```

---

## 5. ReactJS & Frontend Conventions

* **Functional Components & React Hooks:** Seluruh komponen React wajib ditulis sebagai *Functional Components* menggunakan React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`). Dilarang menulis *Class Components* baru.
* **Destructuring Props:** Lakukan *destructuring* langsung pada parameter fungsi komponen agar properti yang dibutuhkan langsung terlihat jelas:
  ```jsx
  // Baik: Props terlihat eksplisit
  const PatientCard = ({ patientName, queueNumber, status, onActionClick }) => {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-800">{patientName}</h4>
        <span className="text-sm text-gray-500">Antrean #{queueNumber}</span>
      </div>
    );
  };
  ```
* **Pemisahan UI dan Logika (Custom Hooks):** Pisahkan logika pengambilan data (*data fetching*), perhitungan status, dan state kompleks dari komponen UI dengan membuat *Custom Hook* (misal: `useReservations`, `useDoctorSchedule`). Komponen JSX harus fokus pada presentasi visual.
* **Ukuran Komponen Modular:** Batasi panjang komponen maksimal **150-200 baris kode**. Jika sebuah komponen menjadi terlalu panjang atau rumit, pecah menjadi beberapa sub-komponen yang dapat digunakan kembali (*reusable child components*).
* **State Management yang Bersih:** Simpan *state* sedekat mungkin dengan komponen yang menggunakannya (*Colocate state*). Hindari menaikkan state (*lifting state up*) ke tingkat global jika state tersebut hanya digunakan oleh satu cabang pohon komponen kecil.
* **Pembersihan Side Effects:** Setiap efek pada `useEffect` yang berlangganan event, timer (`setTimeout`/`setInterval`), atau request wajib menyertakan fungsi pembersih (*cleanup function*).

---

## 6. Node.js & Express.js Backend Conventions

* **Pola Arsitektur Berlapis (Layered Architecture):** Pisahkan kode backend ke dalam struktur lapisan yang jelas:
  * **Routes (`routes/`):** Hanya mendefinisikan rute URL dan mengikat middleware terkait ke controller.
  * **Controllers (`controllers/`):** Menerima request HTTP, memvalidasi parameter, memanggil service, dan menyusun format response HTTP.
  * **Services (`services/`):** Menampung seluruh logika bisnis operasional klinik gigi (misal: validasi ketersediaan jadwal dokter lintas cabang, kalkulasi riwayat kunjungan).
  * **Models / Queries (`models/`):** Mengelola interaksi langsung dengan database PostgreSQL.
* **Penanganan Operasi Asinkron:** Selalu gunakan sintaks `async / await` dengan penanganan blok `try...catch` yang terstruktur. Hindari penggunaan callback bertingkat (*callback hell*) atau *unhandled promise rejections*.
* **Format Respons API yang Seragam:** Seluruh respons JSON dari backend wajib mengikuti struktur konsisten sesuai kontrak integrasi:
  ```javascript
  // Respons Berhasil (Success)
  {
    "success": true,
    "message": "Data reservasi berhasil diambil.",
    "data": [ ... ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10
    }
  }

  // Respons Gagal (Error)
  {
    "success": false,
    "message": "Jadwal dokter tidak ditemukan.",
    "errors": [ ... ]
  }
  ```
* **Sentralisasi Penanganan Kesalahan (Centralized Error Handling):** Lempar *error* dari *controller/service* ke *error middleware* Express terpusat (`next(error)`), hindari menulis logika pengiriman status error secara sporadis di banyak tempat.

---

## 7. Database Query Conventions (PostgreSQL)

* **Penulisan Kata Kunci SQL:** Tulis seluruh kata kunci SQL dalam huruf kapital (**UPPERCASE**) untuk membedakannya secara jelas dari nama tabel atau kolom:
  ```sql
  -- Baik: Kata kunci huruf besar dan pemilihan kolom spesifik
  SELECT 
    r.id, 
    r.patient_name, 
    r.appointment_date, 
    d.doctor_name, 
    r.status
  FROM reservations r
  INNER JOIN doctors d ON r.doctor_id = d.id
  WHERE r.appointment_date = $1 AND r.status = $2
  ORDER BY r.appointment_date ASC;
  ```
* **Hindari `SELECT *`:** Selalu tentukan kolom yang diperlukan secara eksplisit. Pemilihan kolom spesifik meningkatkan keterbacaan, mencegah kebocoran data, dan mengoptimalkan performa query.
* **Pemisahan Parameter Query:** Selalu gunakan placeholder parameter ($1, $2, ...) saat membangun query dinamis untuk keterbacaan struktur query dan kerapian pemisahan data.

---

## 8. Data Analytics Conventions (Python & Jupyter Notebook)

* **Standar PEP 8:** Seluruh skrip Python untuk analisis data klinik wajib mematuhi panduan gaya resmi **PEP 8**.
* **Struktur Sel Notebook yang Rapi:** Setiap Jupyter Notebook harus disusun secara kronologis dengan alur yang jelas:
  1. **Markdown Header:** Penjelasan ringkas mengenai tujuan analisis (misal: analisis tren tindakan EMR per kuartal).
  2. **Impor Pustaka & Konfigurasi:** Sel khusus untuk impor dependensi (`pandas`, `matplotlib`, `seaborn`) dan konfigurasi visualisasi.
  3. **Data Loading & Preprocessing:** Sel pembersihan dan pemformatan data.
  4. **Exploratory Data Analysis (EDA) & Modeling:** Sel analisis inti.
  5. **Kesimpulan & Ringkasan Temuan:** Markdown penutup yang merangkum insight bisnis bagi manajemen klinik.
* **Penamaan DataFrame yang Deskriptif:** Hindari penamaan generik seperti `df`, `df1`, atau `data`. Gunakan nama yang spesifik seperti `df_reservations`, `df_emr_treatments`, atau `df_monthly_metrics`.
* **Kerapian Visualisasi:** Setiap grafik visualisasi wajib memiliki judul (*title*), label sumbu X dan Y yang jelas, serta legenda jika memuat multi-kategori data.

---

## 9. Comments & Documentation Standards

Kode yang bersih harus mampu menjelaskan dirinya sendiri (*self-documenting code*). Namun, dokumentasi tetap penting untuk menjelaskan logika bisnis yang kompleks:

* **Jelaskan "Mengapa" (*Why*), Bukan "Apa" (*What*):**
  * *Buruk:* `// Mengubah status menjadi CANCELLED` -> `appointment.status = 'CANCELLED';`
  * *Baik:* `// Pasien tidak hadir setelah batas toleransi 30 menit; bebaskan kuota dokter` -> `appointment.status = 'CANCELLED';`
* **JSDoc untuk Fungsi & Modul:** Gunakan standar JSDoc untuk seluruh fungsi utilitas, service backend, dan controller penting:
  ```javascript
  /**
   * Menghitung ketersediaan kuota jadwal praktik dokter pada cabang tertentu.
   * @param {string} doctorId - UUID dokter yang bertugas.
   * @param {string} branchId - ID cabang klinik.
   * @param {string} targetDate - Tanggal kunjungan (format YYYY-MM-DD).
   * @returns {Promise<{ isAvailable: boolean, remainingQuota: number }>} Status ketersediaan dan sisa kuota.
   */
  async function checkDoctorAvailability(doctorId, branchId, targetDate) {
    // Logika perhitungan kuota dokter
  }
  ```
* **Docstrings pada Python:** Setiap fungsi analitik wajib dilengkapi docstring bergaya Google atau NumPy:
  ```python
  def analyze_treatment_frequency(df_emr, min_occurrences=5):
      """Menganalisis frekuensi tindakan medis gigi berdasarkan riwayat EMR.

      Args:
          df_emr (pd.DataFrame): DataFrame berisi rekam medis pasien.
          min_occurrences (int): Batas minimal frekuensi tindakan untuk ditampilkan.

      Returns:
          pd.DataFrame: Tabel rangkuman tindakan terurut dari yang terbanyak.
      """
      # Logika analisis data EMR
  ```
* **Larangan Kode Mati (*No Dead / Commented-Out Code*):** Dilarang membiarkan blok kode lama yang dikomentari di dalam repositori. Manfaatkan fitur riwayat komit Git jika ingin menelusuri implementasi sebelumnya.
* **Penanda Tugas Terstandarisasi:**
  * `// TODO:` Menandai perbaikan atau penyempurnaan fitur yang direncanakan.
  * `// FIXME:` Menandai cacat kode (*bug*) atau perilaku anomali yang perlu ditangani.
