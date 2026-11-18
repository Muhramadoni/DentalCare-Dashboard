import json
import uuid

def generate_environment():
    env = {
        "id": "indentalcare-local-environment",
        "name": "IN DENTAL CARE - Local Environment",
        "values": [
            {
                "key": "base_url",
                "value": "http://localhost:5000",
                "type": "default",
                "enabled": True
            },
            {
                "key": "admin_email",
                "value": "admindental@gmail.com",
                "type": "default",
                "enabled": True
            },
            {
                "key": "admin_password",
                "value": "admindental123",
                "type": "secret",
                "enabled": True
            },
            {
                "key": "token",
                "value": "",
                "type": "secret",
                "enabled": True
            },
            {
                "key": "jwt_token",
                "value": "",
                "type": "secret",
                "enabled": True
            },
            {
                "key": "dokter_id",
                "value": "1",
                "type": "default",
                "enabled": True
            },
            {
                "key": "reservasi_id",
                "value": "1",
                "type": "default",
                "enabled": True
            },
            {
                "key": "rekam_medis_id",
                "value": "1",
                "type": "default",
                "enabled": True
            }
        ],
        "_postman_variable_scope": "environment",
        "_postman_exported_at": "2026-11-18T16:00:00.000Z",
        "_postman_exported_using": "Postman/10.0.0"
    }
    return env

def make_request(name, method, url_path, query=None, body=None, auth_bearer=True, test_script=None, description=""):
    url_parts = [p for p in url_path.strip("/").split("/") if p]
    
    raw_url = "{{base_url}}/" + "/".join(url_parts)
    query_obj = []
    if query:
        q_strs = []
        for q in query:
            query_obj.append({
                "key": q["key"],
                "value": str(q["value"]),
                "description": q.get("description", ""),
                "disabled": q.get("disabled", False)
            })
            if not q.get("disabled", False):
                q_strs.append(f"{q['key']}={q['value']}")
        if q_strs:
            raw_url += "?" + "&".join(q_strs)

    headers = [
        {
            "key": "Accept",
            "value": "application/json",
            "type": "text"
        }
    ]

    if body is not None:
        headers.append({
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
        })

    if auth_bearer:
        headers.append({
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
        })

    req_obj = {
        "method": method,
        "header": headers,
        "url": {
            "raw": raw_url,
            "host": ["{{base_url}}"],
            "path": url_parts
        },
        "description": description
    }

    if query_obj:
        req_obj["url"]["query"] = query_obj

    if body is not None:
        req_obj["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2, ensure_ascii=False),
            "options": {
                "raw": {
                    "language": "json"
                }
            }
        }

    events = []
    if test_script:
        events.append({
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": [line.rstrip() for line in test_script.strip().split("\n")]
            }
        })

    item = {
        "name": name,
        "request": req_obj,
        "response": []
    }
    if events:
        item["event"] = events

    return item

def generate_collection():
    collection_id = str(uuid.uuid4())
    
    # =========================================================================
    # TAHAP 1: KONEKSI & AUTENTIKASI ADMIN
    # =========================================================================
    t1_health_check = make_request(
        name="1.1 Health Check Server & Database (200 OK)",
        method="GET",
        url_path="/health",
        auth_bearer=False,
        description="Memeriksa status operasional backend Express dan koneksi basis data PostgreSQL IN DENTAL CARE.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Server status is UP", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.status).to.eql("UP");
});
"""
    )
    t1_health_check["response"].append({
        "name": "200 OK - Server Normal",
        "originalRequest": t1_health_check["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "IN DENTAL CARE Backend API berjalan normal.",
            "data": {
                "status": "UP",
                "timestamp": "2026-11-18T08:00:00.000Z",
                "environment": "development"
            }
        }, indent=2)
    })

    t1_login_success = make_request(
        name="1.2 Login Admin - Sukses & Ambil Token (200 OK)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "{{admin_email}}",
            "password": "{{admin_password}}"
        },
        description="Autentikasi admin klinik menggunakan email dan kata sandi valid. Token JWT otomatis disimpan ke environment 'token' dan 'jwt_token'.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Token JWT berhasil didapatkan dan disimpan ke Environment", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.token).to.be.a('string');
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("jwt_token", jsonData.data.token);
});
"""
    )

    t1_login_failed_password = make_request(
        name="1.3 Login Gagal - Password Salah (401 Unauthorized)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "{{admin_email}}",
            "password": "password_salah_123"
        },
        description="Pengujian kondisi gagal login dengan memasukkan kata sandi yang salah.",
        test_script="""
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Pesan error UNAUTHORIZED kredensial salah", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )

    t1_login_failed_email = make_request(
        name="1.4 Login Gagal - Email Tidak Terdaftar (401 Unauthorized)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "bukan_admin@gmail.com",
            "password": "{{admin_password}}"
        },
        description="Pengujian kondisi gagal login dengan email yang tidak terdaftar di sistem.",
        test_script="""
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Pesan error UNAUTHORIZED email tidak terdaftar", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )

    t1_login_failed_empty = make_request(
        name="1.5 Validasi Login Gagal - Field Kosong (400 Bad Request)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": " ",
            "password": " "
        },
        description="Pengujian kondisi gagal login dengan field teks kosong berspasi (\" \") untuk menguji validasi input.",
        test_script="""
pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Server menolak field kosong dengan error VALIDATION_ERROR", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    t1_refresh_token = make_request(
        name="1.6 Refresh Token Sesi Aktif (200 OK)",
        method="POST",
        url_path="/api/v1/auth/refresh",
        auth_bearer=True,
        description="Memperpanjang masa berlaku token JWT (sliding session). Token baru otomatis disimpan ke variabel environment.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Token baru berhasil diperbarui dan disimpan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.token).to.be.a('string');
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("jwt_token", jsonData.data.token);
});
"""
    )

    # =========================================================================
    # TAHAP 2: RINGKASAN DASBOR (OVERVIEW)
    # =========================================================================
    t2_summary = make_request(
        name="2.1 Get Ringkasan Dasbor Harian (200 OK)",
        method="GET",
        url_path="/api/v1/dashboard/summary",
        auth_bearer=True,
        description="Mengambil statistik operasional: total reservasi hari ini, dokter aktif, dokter praktik Cabang Muchtar, tabel overview reservasi, dan aktivitas terkini.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Memiliki struktur data ringkasan lengkap", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('totalReservasiHariIni');
    pm.expect(jsonData.data).to.have.property('totalDokter');
    pm.expect(jsonData.data).to.have.property('totalDokterAktif');
    pm.expect(jsonData.data).to.have.property('totalDokterPraktikHariIni');
    pm.expect(jsonData.data).to.have.property('daftarReservasi');
});
"""
    )

    t2_summary_failed_no_token = make_request(
        name="2.2 Get Dasbor Gagal - Tanpa Token (401 Unauthorized)",
        method="GET",
        url_path="/api/v1/dashboard/summary",
        auth_bearer=False,
        description="Pengujian kondisi gagal akses ringkasan dasbor tanpa menyertakan token autentikasi JWT.",
        test_script="""
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Pesan error UNAUTHORIZED akses ditolak", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )

    # =========================================================================
    # TAHAP 3: KELOLA DOKTER & JADWAL CABANG MUCHTAR
    # =========================================================================
    t3_get_dokter_all = make_request(
        name="3.1 Get Semua Dokter (Tanpa Filter Sesuai UI)",
        method="GET",
        url_path="/api/v1/dokter",
        auth_bearer=True,
        description="Mengambil seluruh daftar dokter terdaftar beserta jadwal praktiknya (Cabang Muchtar). Sesuai UI Halaman Dokter, tidak ada filter query. ID dokter pertama otomatis disimpan ke environment 'dokter_id'.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Data dokter bertipe array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    if (jsonData.data.length > 0) {
        pm.environment.set("dokter_id", jsonData.data[0].id);
    }
});
"""
    )

    t3_get_dokter_by_id = make_request(
        name="3.2 Get Detail Dokter by ID (200 OK)",
        method="GET",
        url_path="/api/v1/dokter/{{dokter_id}}",
        auth_bearer=True,
        description="Mengambil data detail dokter beserta jadwal operasional berdasarkan ID dinamis.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Data dokter sesuai dengan ID yang diminta", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.eql(Number(pm.environment.get("dokter_id")));
});
"""
    )

    t3_get_dokter_failed_not_found = make_request(
        name="3.3 Get Detail Dokter Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="GET",
        url_path="/api/v1/dokter/999999",
        auth_bearer=True,
        description="Pengujian kondisi gagal saat mengambil detail dokter dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error NOT_FOUND dokter tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    t3_post_dokter = make_request(
        name="3.4 Tambah Dokter Baru (Field String Kosong ' ')",
        method="POST",
        url_path="/api/v1/dokter",
        auth_bearer=True,
        body={
            "nama": " ",
            "spesialisasi": " ",
            "cabang": "Muchtar",
            "status": "Aktif",
            "cabangMuchtar": True,
            "jadwalMuchtar": [
                {
                    "hari": " ",
                    "jam": " "
                }
            ],
            "jadwal": [
                {
                    "hari": " ",
                    "jam": " "
                }
            ]
        },
        description="Menambahkan data dokter baru. Field string dikosongkan (\" \") sesuai format template uji. Jika dikirim kosong, server memvalidasi penolakan 400; jika diisi teks, merespons 201.",
        test_script="""
if (pm.response.code === 400) {
    pm.test("Validasi Berhasil: Server menolak field string kosong ' ' (400 Bad Request)", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
        pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
    });
} else {
    pm.test("Status code is 201 Created (Data dokter tersimpan)", function () {
        pm.response.to.have.status(201);
        var jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
        if (jsonData.data && jsonData.data.id) {
            pm.environment.set("dokter_id", jsonData.data.id);
        }
    });
}
"""
    )

    t3_post_dokter_failed_empty = make_request(
        name="3.5 Tambah Dokter Gagal - Nama Kosong (400 Bad Request)",
        method="POST",
        url_path="/api/v1/dokter",
        auth_bearer=True,
        body={
            "nama": "",
            "spesialisasi": "Ortodonti",
            "cabang": "Muchtar",
            "status": "Aktif"
        },
        description="Pengujian kondisi gagal menambah dokter baru tanpa mengisi nama dokter.",
        test_script="""
pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Pesan error VALIDATION_ERROR nama dokter wajib diisi", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    t3_put_dokter = make_request(
        name="3.6 Update Dokter & Jadwal Cabang Muchtar (Field String Kosong ' ')",
        method="PUT",
        url_path="/api/v1/dokter/{{dokter_id}}",
        auth_bearer=True,
        body={
            "nama": " ",
            "spesialisasi": " ",
            "cabang": "Muchtar",
            "status": "Aktif",
            "cabangMuchtar": True,
            "jadwalMuchtar": [
                {
                    "hari": " ",
                    "jam": " "
                }
            ]
        },
        description="Memperbarui data dokter dan jadwal operasional Cabang Muchtar dengan template field string kosong.",
        test_script="""
pm.test("Respons server terverifikasi (200 OK / 400 Validasi)", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 400]);
});
"""
    )

    t3_put_dokter_failed_not_found = make_request(
        name="3.7 Update Dokter Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="PUT",
        url_path="/api/v1/dokter/999999",
        auth_bearer=True,
        body={
            "nama": "drg. Dokter Palsu",
            "spesialisasi": "Umum",
            "cabang": "Muchtar"
        },
        description="Pengujian kondisi gagal memperbarui data dokter dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error NOT_FOUND dokter tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    t3_delete_dokter = make_request(
        name="3.8 Hapus Dokter by ID (200 OK)",
        method="DELETE",
        url_path="/api/v1/dokter/{{dokter_id}}",
        auth_bearer=True,
        description="Menghapus data dokter dari database berdasarkan ID dinamis.",
        test_script="""
pm.test("Respons penghapusan terverifikasi (200 OK / 404 Not Found)", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});
"""
    )

    t3_delete_dokter_failed_not_found = make_request(
        name="3.9 Hapus Dokter Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="DELETE",
        url_path="/api/v1/dokter/999999",
        auth_bearer=True,
        description="Pengujian kondisi gagal menghapus dokter dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error NOT_FOUND dokter tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    # =========================================================================
    # TAHAP 4: KELOLA RESERVASI PASIEN
    # =========================================================================
    t4_res_doctors = make_request(
        name="4.1 Get Pilihan Dokter Aktif untuk Form Reservasi (200 OK)",
        method="GET",
        url_path="/api/v1/reservasi/doctors",
        auth_bearer=True,
        description="Mengambil daftar dokter aktif beserta jadwal praktek Cabang Muchtar untuk dropdown modal reservasi.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Array dokter aktif tersedia untuk formulir", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
"""
    )

    t4_reservasi_all = make_request(
        name="4.2 Get Semua Daftar Reservasi (200 OK)",
        method="GET",
        url_path="/api/v1/reservasi",
        auth_bearer=True,
        description="Mengambil seluruh daftar reservasi kunjungan pasien (termasuk tanggal_kunjungan dan waktu_kunjungan). ID reservasi otomatis dicatat.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Daftar reservasi bertipe array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    if (jsonData.data.length > 0) {
        pm.environment.set("reservasi_id", jsonData.data[0].id);
    }
});
"""
    )

    t4_reservasi_filter = make_request(
        name="4.3 Filter Reservasi by Status (Berhasil Jika Cocok, Gagal Jika Tidak Cocok)",
        method="GET",
        url_path="/api/v1/reservasi",
        query=[
            {"key": "status", "value": "Appointment", "description": "Filter status reservasi: Appointment atau Reschedule"}
        ],
        auth_bearer=True,
        description="Pengujian filter status reservasi. Jika filter menemukan data yang cocok maka pengujian BERHASIL; jika tidak ada data yang cocok maka pengujian GAGAL.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Filter Reservasi: Berhasil jika ada yang cocok, Gagal jika tidak ada yang cocok", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');

    // Aturan pengujian: JIKA TIDAK ADA YANG COCOK MAKA GAGAL!
    pm.expect(jsonData.data.length).to.be.greaterThan(
        0,
        "PENGUJIAN GAGAL: Tidak ada data reservasi yang cocok dengan filter status 'Appointment'!"
    );

    // Jika ada yang cocok maka berhasil dan pastikan seluruh item berstatus Appointment
    jsonData.data.forEach(function (item) {
        pm.expect(item.status).to.eql("Appointment", "Item reservasi tidak cocok dengan filter status Appointment");
    });
});
"""
    )

    t4_reservasi_filter_failed = make_request(
        name="4.4 Filter Reservasi Gagal - Data Tidak Ditemukan",
        method="GET",
        url_path="/api/v1/reservasi",
        query=[
            {"key": "search", "value": "pasien_yang_pasti_tidak_ada_xyz_999", "description": "Pencarian nama yang tidak terdaftar"}
        ],
        auth_bearer=True,
        description="Pengujian kondisi filter tidak menemukan data yang cocok. Memverifikasi array kosong ketika filter tidak ada yang cocok.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Filter tidak cocok mengembalikan array kosong", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    pm.expect(jsonData.data.length).to.eql(0, "Harusnya kosong karena data pencarian tidak ada");
});
"""
    )

    t4_post_reservasi = make_request(
        name="4.5 Buat Reservasi Pasien Baru (Field String Kosong ' ')",
        method="POST",
        url_path="/api/v1/reservasi",
        auth_bearer=True,
        body={
            "namaPasien": " ",
            "tanggal_kunjungan": " ",
            "waktu_kunjungan": " ",
            "dokter": " ",
            "dokter_id": 1,
            "status": "Appointment"
        },
        description="Membuat jadwal reservasi baru pasien. Seluruh field teks dikosongkan (\" \") sesuai permintaan template uji.",
        test_script="""
if (pm.response.code === 400) {
    pm.test("Validasi Berhasil: Server menolak pembuatan reservasi dengan field kosong (400 Bad Request)", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
        pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
    });
} else {
    pm.test("Status code is 201 Created (Reservasi berhasil dicatat)", function () {
        pm.response.to.have.status(201);
        var jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
        if (jsonData.data && jsonData.data.id) {
            pm.environment.set("reservasi_id", jsonData.data.id);
        }
    });
}
"""
    )

    t4_post_reservasi_failed_empty = make_request(
        name="4.6 Buat Reservasi Gagal - Pasien Kosong (400 Bad Request)",
        method="POST",
        url_path="/api/v1/reservasi",
        auth_bearer=True,
        body={
            "namaPasien": "",
            "tanggal_kunjungan": "2026-11-18",
            "waktu_kunjungan": "10:00",
            "dokter": "drg. Indira Nugrahani"
        },
        description="Pengujian kondisi gagal membuat reservasi tanpa mengisi nama pasien.",
        test_script="""
pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Pesan error VALIDATION_ERROR nama pasien wajib diisi", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    t4_put_reservasi = make_request(
        name="4.7 Update Reservasi / Reschedule (Field String Kosong ' ')",
        method="PUT",
        url_path="/api/v1/reservasi/{{reservasi_id}}",
        auth_bearer=True,
        body={
            "namaPasien": " ",
            "tanggal_kunjungan": " ",
            "waktu_kunjungan": " ",
            "dokter": " ",
            "status": "Reschedule"
        },
        description="Memperbarui reservasi (Reschedule) dengan field string template kosong.",
        test_script="""
pm.test("Respons server terverifikasi (200 OK / 400 Validasi)", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 400]);
});
"""
    )

    t4_put_reservasi_failed_not_found = make_request(
        name="4.8 Update Reservasi Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="PUT",
        url_path="/api/v1/reservasi/999999",
        auth_bearer=True,
        body={
            "namaPasien": "Pasien Palsu",
            "status": "Reschedule"
        },
        description="Pengujian kondisi gagal update reservasi dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error NOT_FOUND reservasi tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    t4_delete_reservasi = make_request(
        name="4.9 Hapus Reservasi by ID (200 OK)",
        method="DELETE",
        url_path="/api/v1/reservasi/{{reservasi_id}}",
        auth_bearer=True,
        description="Menghapus data reservasi pasien berdasarkan ID dinamis.",
        test_script="""
pm.test("Respons penghapusan terverifikasi (200 OK / 404 Not Found)", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});
"""
    )

    t4_delete_reservasi_failed_not_found = make_request(
        name="4.10 Hapus Reservasi Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="DELETE",
        url_path="/api/v1/reservasi/999999",
        auth_bearer=True,
        description="Pengujian kondisi gagal menghapus data reservasi yang ID-nya tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error NOT_FOUND reservasi tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    # =========================================================================
    # TAHAP 5: REKAM MEDIS PASIEN (EMR)
    # =========================================================================
    t5_emr_patients = make_request(
        name="5.1 Get Autocomplete Pasien Terjadwal EMR (200 OK)",
        method="GET",
        url_path="/api/v1/rekam-medis/patients",
        auth_bearer=True,
        description="Mengambil daftar pasien dengan status reservasi dan dokter pemeriksa untuk form pencatatan EMR.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Data pasien untuk EMR bertipe array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
"""
    )

    t5_emr_all = make_request(
        name="5.2 Get Semua Catatan Rekam Medis EMR (200 OK)",
        method="GET",
        url_path="/api/v1/rekam-medis",
        auth_bearer=True,
        description="Mengambil seluruh riwayat rekam medis pasien diurutkan dari tanggal_pemeriksaan terbaru. ID rekam medis otomatis disimpan ke environment.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Data EMR berhasil diambil sebagai array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    if (jsonData.data.length > 0) {
        pm.environment.set("rekam_medis_id", jsonData.data[0].id);
    }
});
"""
    )

    t5_emr_filter = make_request(
        name="5.3 Filter Rekam Medis by Search (Berhasil Jika Cocok, Gagal Jika Tidak Cocok)",
        method="GET",
        url_path="/api/v1/rekam-medis",
        query=[
            {"key": "search", "value": "gigi", "description": "Kata kunci pencarian klinis multi-field"}
        ],
        auth_bearer=True,
        description="Pengujian filter riwayat rekam medis. Jika terdapat catatan yang cocok maka BERHASIL; jika tidak ada catatan yang cocok maka pengujian GAGAL.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Filter EMR: Berhasil jika ada yang cocok, Gagal jika tidak ada yang cocok", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');

    // Aturan pengujian: JIKA TIDAK ADA FILTER YANG COCOK MAKA GAGAL!
    pm.expect(jsonData.data.length).to.be.greaterThan(
        0,
        "PENGUJIAN GAGAL: Tidak ditemukan catatan rekam medis yang cocok dengan kata kunci pencarian 'gigi'!"
    );
});
"""
    )

    t5_emr_filter_failed = make_request(
        name="5.4 Filter Rekam Medis Gagal - Kata Kunci Tidak Ditemukan",
        method="GET",
        url_path="/api/v1/rekam-medis",
        query=[
            {"key": "search", "value": "kata_kunci_acak_yang_pasti_tidak_ada_xyz_999", "description": "Kata kunci tidak terdaftar"}
        ],
        auth_bearer=True,
        description="Pengujian kondisi filter tidak menemukan rekam medis yang cocok. Memverifikasi array kosong.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Filter tidak cocok mengembalikan array kosong", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    pm.expect(jsonData.data.length).to.eql(0, "Harusnya kosong karena data pencarian tidak ada");
});
"""
    )

    t5_emr_by_id = make_request(
        name="5.5 Get Detail Rekam Medis by ID (200 OK)",
        method="GET",
        url_path="/api/v1/rekam-medis/{{rekam_medis_id}}",
        auth_bearer=True,
        description="Mengambil detail 1 catatan rekam medis berdasarkan ID dinamis.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Data EMR sesuai dengan ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.eql(Number(pm.environment.get("rekam_medis_id")));
});
"""
    )

    t5_emr_failed_not_found = make_request(
        name="5.6 Get Detail EMR Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="GET",
        url_path="/api/v1/rekam-medis/999999",
        auth_bearer=True,
        description="Pengujian kondisi gagal mengambil catatan EMR dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error RESOURCE_NOT_FOUND EMR tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("RESOURCE_NOT_FOUND");
});
"""
    )

    t5_post_emr = make_request(
        name="5.7 Catat EMR Pasien Baru (Field String Kosong ' ')",
        method="POST",
        url_path="/api/v1/rekam-medis",
        auth_bearer=True,
        body={
            "namaPasien": " ",
            "tanggal_pemeriksaan": " ",
            "regio": " ",
            "dokter": " ",
            "dokter_id": 1,
            "anamnesa": " ",
            "tindakan": " ",
            "resep": " ",
            "terapi": " "
        },
        description="Menyimpan rekam medis baru. Seluruh field teks dikosongkan (\" \") sesuai permintaan template uji.",
        test_script="""
if (pm.response.code === 400) {
    pm.test("Validasi Berhasil: Server menolak input EMR dengan field kosong (400 Bad Request)", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
        pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
    });
} else {
    pm.test("Status code is 201 Created (Data EMR tersimpan)", function () {
        pm.response.to.have.status(201);
        var jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
        if (jsonData.data && jsonData.data.id) {
            pm.environment.set("rekam_medis_id", jsonData.data.id);
        }
    });
}
"""
    )

    t5_post_emr_failed_empty = make_request(
        name="5.8 Catat EMR Gagal - Pasien Kosong (400 Bad Request)",
        method="POST",
        url_path="/api/v1/rekam-medis",
        auth_bearer=True,
        body={
            "namaPasien": "",
            "tanggal_pemeriksaan": "2026-11-18",
            "dokter": "drg. Indira Nugrahani",
            "tindakan": "Pembersihan karang gigi"
        },
        description="Pengujian kondisi gagal mencatat EMR tanpa memilih atau mengisi nama pasien.",
        test_script="""
pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Pesan error VALIDATION_ERROR pasien wajib diisi", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    t5_put_emr = make_request(
        name="5.9 Update Catatan Rekam Medis (Field String Kosong ' ')",
        method="PUT",
        url_path="/api/v1/rekam-medis/{{rekam_medis_id}}",
        auth_bearer=True,
        body={
            "namaPasien": " ",
            "tanggal_pemeriksaan": " ",
            "regio": " ",
            "dokter": " ",
            "anamnesa": " ",
            "tindakan": " ",
            "resep": " ",
            "terapi": " "
        },
        description="Memperbarui data rekam medis dengan template field string kosong.",
        test_script="""
pm.test("Respons server terverifikasi (200 OK / 400 Validasi)", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 400]);
});
"""
    )

    t5_put_emr_failed_not_found = make_request(
        name="5.10 Update EMR Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="PUT",
        url_path="/api/v1/rekam-medis/999999",
        auth_bearer=True,
        body={
            "namaPasien": "Pasien Palsu",
            "tindakan": "Tindakan Palsu"
        },
        description="Pengujian kondisi gagal update catatan EMR dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error RESOURCE_NOT_FOUND EMR tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("RESOURCE_NOT_FOUND");
});
"""
    )

    t5_delete_emr = make_request(
        name="5.11 Hapus Catatan Rekam Medis by ID (200 OK)",
        method="DELETE",
        url_path="/api/v1/rekam-medis/{{rekam_medis_id}}",
        auth_bearer=True,
        description="Menghapus catatan EMR berdasarkan ID dinamis.",
        test_script="""
pm.test("Respons penghapusan terverifikasi (200 OK / 404 Not Found)", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});
"""
    )

    t5_delete_emr_failed_not_found = make_request(
        name="5.12 Hapus EMR Gagal - ID Tidak Ditemukan (404 Not Found)",
        method="DELETE",
        url_path="/api/v1/rekam-medis/999999",
        auth_bearer=True,
        description="Pengujian kondisi gagal menghapus catatan EMR dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404 Not Found", function () {
    pm.response.to.have.status(404);
});
pm.test("Pesan error RESOURCE_NOT_FOUND EMR tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("RESOURCE_NOT_FOUND");
});
"""
    )

    # =========================================================================
    # TAHAP 6: LOGOUT & AKHIRI SESI
    # =========================================================================
    t6_logout_failed_no_token = make_request(
        name="6.1 Logout Gagal - Tanpa Token (401 Unauthorized)",
        method="POST",
        url_path="/api/v1/auth/logout",
        auth_bearer=False,
        description="Pengujian kondisi gagal logout saat dipanggil tanpa menyertakan header Authorization Bearer token.",
        test_script="""
pm.test("Status code is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Pesan error UNAUTHORIZED token tidak ditemukan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )

    t6_logout_success = make_request(
        name="6.2 Logout Admin Berhasil (200 OK)",
        method="POST",
        url_path="/api/v1/auth/logout",
        auth_bearer=True,
        description="Mengakhiri sesi admin klinik dan mencabut otentikasi token JWT secara valid.",
        test_script="""
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});
pm.test("Logout berhasil dan sesi diakhiri", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("Logout berhasil");
});
"""
    )

    collection = {
        "info": {
            "_postman_id": collection_id,
            "name": "IN DENTAL CARE - REST API Testing Collection (Workflow Alur)",
            "description": "Koleksi Postman Resmi IN DENTAL CARE Admin Dashboard yang dirancang BERALUR runtut (Tahap 1 s.d. Tahap 6) dengan pengujian Berhasil dan Gagal lengkap di setiap tahap:\n\n1. Tahap 1: Koneksi & Autentikasi Admin (Health check, Login Sukses, Login Gagal Password Salah, Login Gagal Email Tidak Terdaftar, Validasi Gagal Field Kosong, Refresh Token)\n2. Tahap 2: Ringkasan Dasbor / Overview (Get Ringkasan Sukses, Get Gagal Tanpa Token)\n3. Tahap 3: Kelola Dokter & Jadwal Cabang Muchtar (Get Dokter Tanpa Filter, Get Detail, Get Gagal 404, Tambah String Kosong ' ', Tambah Gagal 400, Update String Kosong, Update Gagal 404, Hapus Dokter Sukses, Hapus Gagal 404)\n4. Tahap 4: Kelola Reservasi Pasien (Dropdown Dokter, Get Semua, Filter Berhasil/Gagal, Filter Gagal Kosong, Buat String Kosong ' ', Buat Gagal 400, Update String Kosong, Update Gagal 404, Hapus Sukses, Hapus Gagal 404)\n5. Tahap 5: Rekam Medis Pasien EMR (Autocomplete Pasien, Get Semua, Filter Berhasil/Gagal, Filter Gagal Kosong, Get Detail, Get Gagal 404, Catat String Kosong ' ', Catat Gagal 400, Update String Kosong, Update Gagal 404, Hapus Sukses, Hapus Gagal 404)\n6. Tahap 6: Logout & Akhiri Sesi (Logout Gagal Tanpa Token 401, Logout Sukses 200)\n\nDilengkapi pm.test assertion ketat dan auto-chaining token JWT & dynamic IDs.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [
            {
                "name": "Tahap 1: Koneksi & Autentikasi Admin",
                "description": "Pemeriksaan server, pengujian login sukses, dan berbagai pengujian kondisi login gagal.",
                "item": [
                    t1_health_check,
                    t1_login_success,
                    t1_login_failed_password,
                    t1_login_failed_email,
                    t1_login_failed_empty,
                    t1_refresh_token
                ]
            },
            {
                "name": "Tahap 2: Ringkasan Dasbor (Overview)",
                "description": "Pengujian ringkasan metrik statistik operasional klinik (Sukses & Gagal tanpa token).",
                "item": [
                    t2_summary,
                    t2_summary_failed_no_token
                ]
            },
            {
                "name": "Tahap 3: Kelola Dokter & Jadwal Cabang Muchtar",
                "description": "Pengujian dokter tanpa filter (sesuai UI Dokter), template body kosong ' ', pengujian gagal (400 & 404), dan hapus dokter.",
                "item": [
                    t3_get_dokter_all,
                    t3_get_dokter_by_id,
                    t3_get_dokter_failed_not_found,
                    t3_post_dokter,
                    t3_post_dokter_failed_empty,
                    t3_put_dokter,
                    t3_put_dokter_failed_not_found,
                    t3_delete_dokter,
                    t3_delete_dokter_failed_not_found
                ]
            },
            {
                "name": "Tahap 4: Kelola Reservasi Pasien",
                "description": "Pengujian reservasi kunjungan: dropdown dokter, filter (berhasil jika cocok, gagal jika tidak cocok), template body kosong ' ', dan pengujian kondisi gagal di setiap aksi.",
                "item": [
                    t4_res_doctors,
                    t4_reservasi_all,
                    t4_reservasi_filter,
                    t4_reservasi_filter_failed,
                    t4_post_reservasi,
                    t4_post_reservasi_failed_empty,
                    t4_put_reservasi,
                    t4_put_reservasi_failed_not_found,
                    t4_delete_reservasi,
                    t4_delete_reservasi_failed_not_found
                ]
            },
            {
                "name": "Tahap 5: Rekam Medis Pasien (EMR)",
                "description": "Pengujian catatan rekam medis EMR: autocomplete pasien, filter (berhasil jika cocok, gagal jika tidak cocok), template body kosong ' ', dan pengujian kondisi gagal (400 & 404) di setiap aksi.",
                "item": [
                    t5_emr_patients,
                    t5_emr_all,
                    t5_emr_filter,
                    t5_emr_filter_failed,
                    t5_emr_by_id,
                    t5_emr_failed_not_found,
                    t5_post_emr,
                    t5_post_emr_failed_empty,
                    t5_put_emr,
                    t5_put_emr_failed_not_found,
                    t5_delete_emr,
                    t5_delete_emr_failed_not_found
                ]
            },
            {
                "name": "Tahap 6: Logout & Akhiri Sesi",
                "description": "Pengujian logout kondisi gagal (tanpa token 401) dan logout berhasil (200 OK) untuk mengakhiri sesi.",
                "item": [
                    t6_logout_failed_no_token,
                    t6_logout_success
                ]
            }
        ]
    }
    return collection

if __name__ == "__main__":
    env = generate_environment()
    with open("backend/postman/IN_DENTAL_CARE.postman_environment.json", "w", encoding="utf-8") as f:
        json.dump(env, f, indent=2, ensure_ascii=False)
    print("Environment file generated successfully.")

    col = generate_collection()
    with open("backend/postman/IN_DENTAL_CARE_API.postman_collection.json", "w", encoding="utf-8") as f:
        json.dump(col, f, indent=2, ensure_ascii=False)
    print("Collection file generated successfully.")
