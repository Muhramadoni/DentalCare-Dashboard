// backend/test-auth.js
// Script verifikasi menyeluruh untuk endpoint autentikasi Hari 1

require('dotenv').config();
const app = require('./server');

const TEST_PORT = 5055;

async function runTests() {
  const server = app.listen(TEST_PORT, async () => {
    console.log(`\n🧪 Server uji coba berjalan di http://localhost:${TEST_PORT}\n`);

    try {
      // 1. Test Health Check
      console.log('--- TEST 1: Health Check ---');
      const healthRes = await fetch(`http://localhost:${TEST_PORT}/health`);
      const healthData = await healthRes.json();
      console.log(`Status HTTP: ${healthRes.status}`);
      console.log('Response:', JSON.stringify(healthData, null, 2));

      // 2. Test Login Gagal (Password Salah)
      console.log('\n--- TEST 2: Login Gagal (Password Salah) ---');
      const failRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admindental@gmail.com',
          password: 'password_salah_123',
        }),
      });
      const failData = await failRes.json();
      console.log(`Status HTTP: ${failRes.status} (Ekspektasi: 401)`);
      console.log('Response:', JSON.stringify(failData, null, 2));

      // 3. Test Login Berhasil (Kredensial Resmi)
      console.log('\n--- TEST 3: Login Berhasil (admindental@gmail.com / admindental123) ---');
      const successRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admindental@gmail.com',
          password: 'admindental123',
        }),
      });
      const successData = await successRes.json();
      console.log(`Status HTTP: ${successRes.status} (Ekspektasi: 200)`);
      console.log('Response:', JSON.stringify(successData, null, 2));

      const token = successData.data?.token;

      // 4. Test Logout dengan Bearer Token
      console.log('\n--- TEST 4: Logout dengan Bearer Token ---');
      const logoutRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const logoutData = await logoutRes.json();
      console.log(`Status HTTP: ${logoutRes.status} (Ekspektasi: 200)`);
      console.log('Response:', JSON.stringify(logoutData, null, 2));

      // 5. Test Logout Tanpa Token (Harus Ditolak 401)
      console.log('\n--- TEST 5: Logout Tanpa Token ---');
      const logoutNoTokenRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const logoutNoTokenData = await logoutNoTokenRes.json();
      console.log(`Status HTTP: ${logoutNoTokenRes.status} (Ekspektasi: 401)`);
      console.log('Response:', JSON.stringify(logoutNoTokenData, null, 2));

      console.log('\n========================================');
      console.log('🎉 SEMUA TEST SELESAI DENGAN SUKSES! 🎉');
      console.log('========================================\n');
    } catch (err) {
      console.error('❌ Terjadi kesalahan saat pengujian:', err);
    } finally {
      server.close(() => {
        console.log('🛑 Server uji coba ditutup.');
        process.exit(0);
      });
    }
  });
}

runTests();

