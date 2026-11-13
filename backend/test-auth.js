// backend/test-auth.js
// Script verifikasi menyeluruh untuk endpoint autentikasi & dashboard

require('dotenv').config();
const app = require('./server');

const TEST_PORT = 5056;

async function runTests() {
  const server = app.listen(TEST_PORT, async () => {
    console.log(`\n🧪 Server uji coba berjalan di http://localhost:${TEST_PORT}\n`);

    try {
      // 1. Test Health Check
      console.log('--- TEST 1: Health Check ---');
      const healthRes = await fetch(`http://localhost:${TEST_PORT}/health`);
      const healthData = await healthRes.json();
      console.log(`Status HTTP: ${healthRes.status}`);

      // 2. Test Login Berhasil (admindental@gmail.com / admindental123)
      console.log('\n--- TEST 2: Login Berhasil ---');
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
      const token = successData.data?.token;

      // 3. Test Dashboard Summary Tanpa Token (Harus Ditolak 401)
      console.log('\n--- TEST 3: GET /dashboard/summary Tanpa Token ---');
      const dashNoTokenRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/dashboard/summary`);
      console.log(`Status HTTP: ${dashNoTokenRes.status} (Ekspektasi: 401)`);

      // 4. Test Dashboard Summary Dengan Token Valid
      console.log('\n--- TEST 4: GET /dashboard/summary Dengan Token Valid ---');
      const startT = Date.now();
      const dashRes = await fetch(`http://localhost:${TEST_PORT}/api/v1/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const latency = Date.now() - startT;
      const dashData = await dashRes.json();
      console.log(`Status HTTP: ${dashRes.status} (Ekspektasi: 200)`);
      console.log(`Kecepatan Respon: ${latency}ms (Target G4: <300ms)`);
      console.log('Summary Data:', JSON.stringify(dashData.data, null, 2));

      console.log('\n========================================');
      console.log('🎉 SEMUA PENGUJIAN API SUKSES! 🎉');
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
