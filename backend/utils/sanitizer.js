// backend/utils/sanitizer.js
// Utilitas pembersihan dan sanitasi input teks bebas untuk mencegah serangan Cross-Site Scripting (XSS)
// Sesuai dengan panduan security.md Section 5.3 & OWASP A03

/**
 * Membersihkan string dari potensi payload berbahaya (XSS):
 * - Menghilangkan tag <script>...</script>
 * - Menghilangkan tag <style>...</style>
 * - Menghilangkan seluruh tag HTML (<...>)
 * - Menghilangkan URI scheme berbahaya seperti javascript:, data:, vbscript:
 * - Menghilangkan atribut event inline seperti onload=, onclick=, onerror=
 * @param {string} str - Teks masukan bebas
 * @returns {string} Teks yang sudah bersih dan aman disimpan ke database
 */
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';

  let clean = str;

  // 1. Hapus tag script beserta isinya
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Hapus tag style beserta isinya
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Hapus seluruh tag HTML lainnya (<...>)
  clean = clean.replace(/<[^>]+>/g, '');

  // 4. Hapus protokol berbahaya (javascript:, vbscript:, data:)
  clean = clean.replace(/javascript\s*:/gi, '');
  clean = clean.replace(/vbscript\s*:/gi, '');
  clean = clean.replace(/data\s*:\s*text\/html/gi, '');

  // 5. Hapus inline event handlers seperti onclick=, onerror=, onload=
  clean = clean.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  return clean.trim();
};

module.exports = { sanitizeText };

