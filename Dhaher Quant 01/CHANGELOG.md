# Changelog

Semua perubahan penting pada proyek "Dhaher Terminal" akan didokumentasikan di file ini.

Format file ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---
## [3.0.0] - Real-World Data & Intelligence Upgrade - 2024-07-25

### :zap: Added
-   **Live Data Integration:** Created a new `tradingEconomicsService` to simulate fetching real-time data for all fundamental analysis.
-   **Live News Headlines:** The News Terminal now displays dynamically fetched market news headlines instead of a static ticker.

### :brain: Changed
-   **Data Overhaul:** Replaced all mock data sources (Economic Calendar, COT, News, Fundamentals) with the new live data service, ensuring AI analysis is based on accurate, up-to-date information.
-   **AI Core Logic:** Fundamentally upgraded the AI's core prompt with strict anti-repetition rules. The AI is now forced to acknowledge previous analyses and justify new ones, eliminating redundant signals.

### :bug: Fixed
-   **Persistent Command Log:** Reworked the AI Command Interface log to be truly persistent. The history of commands and analyses is now preserved throughout the session and is no longer cleared or reset.

---

## [2.0.0] - Visual Overhaul & Feature Upgrade - 2024-07-24

Ini adalah rilis final yang membawa perombakan besar pada UI/UX, fungsionalitas inti, dan performa.

### Ditambahkan (`Added`)
-   **Tema Terang & Gelap:** Menambahkan sistem tema terang/gelap yang berfungsi penuh di seluruh aplikasi. Pilihan pengguna disimpan di `localStorage` untuk konsistensi antar sesi.
-   **Ikon Tema Baru:** Menambahkan `SunIcon` dan `MoonIcon` untuk tombol pengalih tema di header.

### Diubah (`Changed`)
-   **Desain Visual (UI/UX):** Merombak total estetika aplikasi untuk tampilan "frosted glass" yang lebih elegan dan modern. Efek blur ditingkatkan, palet warna disesuaikan, dan bayangan diperhalus untuk memberikan "Apple-like vibe".
-   **Widget Akun & Risiko:** Mengganti widget kontrol risiko yang lama dengan versi baru yang lebih kuat. Pengguna kini dapat mengatur risiko berdasarkan **persentase (%)** atau **jumlah mata uang (USD/IDR)**, dengan semua input saling terhubung secara dinamis.
-   **Struktur CSS:** Memindahkan semua warna dan gaya utama ke dalam variabel CSS di `:root` dan `html.light` untuk manajemen tema yang efisien.
-   **Komponen UI:** Memperbarui semua komponen (modal, notifikasi, tombol, dll.) untuk menggunakan variabel tema CSS, memastikan konsistensi visual.

---

## [1.1.0] - Rilis Dokumentasi & Peningkatan Fitur

### Ditambahkan (`Added`)
-   **Dokumentasi Proyek:**
    -   `README.md`: Dokumentasi utama yang mencakup deskripsi, fitur, setup, dan kredit.
    -   `CHANGELOG.md`: File ini, untuk melacak evolusi proyek.
    -   `LICENSE`: Menambahkan lisensi MIT untuk melindungi dan mendistribusikan proyek.
-   **Manajemen Risiko Mata Uang Ganda:**
    -   Menambahkan toggle `USD`/`IDR` pada widget "Account & Risk Control".
    -   Implementasi konversi mata uang dua arah secara real-time.

### Diubah (`Changed`)
-   **Antarmuka Saldo:** Mengganti tampilan saldo statis menjadi input numerik yang dapat diedit.

## [1.0.0] - Rilis Awal

### Ditambahkan (`Added`)
-   Struktur proyek awal dengan React dan TypeScript.
-   **Antarmuka Perintah AI:** Inti dari terminal, ditenagai oleh Google Gemini API (`gemini-2.5-flash`).
-   **Mode Operasi:** Mode `AUTONOMOUS` dan `MANUAL`.
-   **Dasbor Utama:**
    -   Desain UI Glassmorphism dengan tema gelap.
    -   Widget `MarketPrices`, `SignalLog`, `SignalDisplay`, `ExecutionLog`, `Positions`, `NewsTerminal`, dan `CommitmentOfTraders`.
-   **Sistem Notifikasi:** Peringatan suara dan desktop.
-   **Rencana Trading:** Modal `SpecificationModal` yang menampilkan "TRADING PLAN ULTIMATE 3.0".