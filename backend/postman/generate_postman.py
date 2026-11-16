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
                "key": "test_dokter_id",
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
                "key": "test_reservasi_id",
                "value": "1",
                "type": "default",
                "enabled": True
            },
            {
                "key": "rekam_medis_id",
                "value": "1",
                "type": "default",
                "enabled": True
            },
            {
                "key": "test_emr_id",
                "value": "1",
                "type": "default",
                "enabled": True
            }
        ],
        "_postman_variable_scope": "environment",
        "_postman_exported_at": "2026-11-16T16:30:00.000Z",
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
    # 00. Health Check
    # =========================================================================
    health_check = make_request(
        name="0.1 Health Check Server & Database",
        method="GET",
        url_path="/health",
        auth_bearer=False,
        description="Memeriksa status operasional server Express dan basis data IN DENTAL CARE.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Server status is UP", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.status).to.eql("UP");
});
"""
    )
    health_check["response"].append({
        "name": "200 OK - Server Normal",
        "originalRequest": health_check["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "IN DENTAL CARE Backend API berjalan normal.",
            "data": {
                "status": "UP",
                "timestamp": "2026-11-16T09:25:00.000Z",
                "environment": "development"
            }
        }, indent=2)
    })

    # =========================================================================
    # 01. Authentication
    # =========================================================================
    login_success = make_request(
        name="1.1 Login Berhasil - Kredensial Valid (200 OK)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "{{admin_email}}",
            "password": "{{admin_password}}"
        },
        description="Autentikasi admin dengan email dan password. Token JWT otomatis disimpan ke variabel environment 'token' dan 'jwt_token'.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Token JWT berhasil didapatkan dan disimpan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.token).to.be.a('string');
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("jwt_token", jsonData.data.token);
});
"""
    )
    login_success["response"].append({
        "name": "200 OK - Login Berhasil",
        "originalRequest": login_success["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Login berhasil. Selamat datang di IN DENTAL CARE Dashboard.",
            "data": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "id": 1,
                    "email": "admindental@gmail.com"
                }
            }
        }, indent=2)
    })

    login_failed_cred = make_request(
        name="1.2 Login Gagal - Password Salah (401)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "{{admin_email}}",
            "password": "password_salah_123"
        },
        description="Uji coba login dengan password yang tidak cocok.",
        test_script="""
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code UNAUTHORIZED", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )
    login_failed_cred["response"].append({
        "name": "401 Unauthorized - Password Salah",
        "originalRequest": login_failed_cred["request"],
        "status": "Unauthorized",
        "code": 401,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": False,
            "error": {
                "code": "UNAUTHORIZED",
                "message": "Email atau password yang Anda masukkan salah."
            }
        }, indent=2)
    })

    login_failed_unregistered = make_request(
        name="1.3 Login Gagal - Email Tidak Terdaftar (401)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "unregistered_admin@gmail.com",
            "password": "{{admin_password}}"
        },
        description="Uji coba login dengan email yang tidak terdaftar di database.",
        test_script="""
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code UNAUTHORIZED", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )
    login_failed_unregistered["response"].append({
        "name": "401 Unauthorized - Email Tidak Terdaftar",
        "originalRequest": login_failed_unregistered["request"],
        "status": "Unauthorized",
        "code": 401,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": False,
            "error": {
                "code": "UNAUTHORIZED",
                "message": "Email atau password yang Anda masukkan salah."
            }
        }, indent=2)
    })

    login_validation_email = make_request(
        name="1.4 Login Gagal - Format Email Tidak Valid (400)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "format_email_bukan_email",
            "password": "{{admin_password}}"
        },
        description="Uji coba login dengan format email tidak sesuai standar regex.",
        test_script="""
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code VALIDATION_ERROR", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )
    login_validation_email["response"].append({
        "name": "400 Bad Request - Format Email Tidak Valid",
        "originalRequest": login_validation_email["request"],
        "status": "Bad Request",
        "code": 400,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Format email tidak valid.",
                "details": [
                    {"field": "email", "issue": "Masukkan format email yang benar."}
                ]
            }
        }, indent=2)
    })

    login_validation_empty = make_request(
        name="1.5 Login Gagal - Field Kosong (400)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "",
            "password": ""
        },
        description="Uji coba login dengan payload kosong untuk menguji validasi input wajib.",
        test_script="""
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code VALIDATION_ERROR", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )
    login_validation_empty["response"].append({
        "name": "400 Bad Request - Field Kosong",
        "originalRequest": login_validation_empty["request"],
        "status": "Bad Request",
        "code": 400,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Email dan password wajib diisi.",
                "details": [
                    {"field": "email", "issue": "Email tidak boleh kosong."},
                    {"field": "password", "issue": "Password tidak boleh kosong."}
                ]
            }
        }, indent=2)
    })

    refresh_token = make_request(
        name="1.6 Refresh Token (200 OK)",
        method="POST",
        url_path="/api/v1/auth/refresh",
        auth_bearer=True,
        description="Memperbarui masa berlaku token JWT (sliding session). Token baru otomatis disimpan ke variabel 'token' dan 'jwt_token'.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Token berhasil diperbarui", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.token).to.be.a('string');
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("jwt_token", jsonData.data.token);
});
"""
    )
    refresh_token["response"].append({
        "name": "200 OK - Token Diperpanjang",
        "originalRequest": refresh_token["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Sesi berhasil diperpanjang.",
            "data": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }, indent=2)
    })

    logout_no_token = make_request(
        name="1.7 Logout Gagal - Tanpa Token (401)",
        method="POST",
        url_path="/api/v1/auth/logout",
        auth_bearer=False,
        description="Uji coba memanggil endpoint logout tanpa menyertakan header Authorization.",
        test_script="""
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code UNAUTHORIZED", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )
    logout_no_token["response"].append({
        "name": "401 Unauthorized - Tanpa Token",
        "originalRequest": logout_no_token["request"],
        "status": "Unauthorized",
        "code": 401,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": False,
            "error": {
                "code": "UNAUTHORIZED",
                "message": "Akses ditolak. Token autentikasi tidak ditemukan."
            }
        }, indent=2)
    })

    logout_req = make_request(
        name="1.8 Logout Berhasil (200 OK)",
        method="POST",
        url_path="/api/v1/auth/logout",
        auth_bearer=True,
        description="Mengakhiri sesi admin. Frontend menghapus token dari sessionStorage.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Logout berhasil", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("Logout berhasil");
});
"""
    )
    logout_req["response"].append({
        "name": "200 OK - Logout Berhasil",
        "originalRequest": logout_req["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Logout berhasil. Sampai jumpa!",
            "data": None
        }, indent=2)
    })

    login_relogin = make_request(
        name="1.9 Login Ulang Admin (Untuk Sesi Uji Lanjutan)",
        method="POST",
        url_path="/api/v1/auth/login",
        auth_bearer=False,
        body={
            "email": "{{admin_email}}",
            "password": "{{admin_password}}"
        },
        description="Mendapatkan token aktif baru setelah pengujian logout agar modul-modul berikutnya dapat dijalankan secara berurutan dalam Collection Runner.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Login ulang berhasil & token aktif disimpan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("jwt_token", jsonData.data.token);
});
"""
    )
    login_relogin["response"].append({
        "name": "200 OK - Relogin Berhasil",
        "originalRequest": login_relogin["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Login berhasil. Selamat datang di IN DENTAL CARE Dashboard.",
            "data": {
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "user": {
                    "id": 1,
                    "email": "admindental@gmail.com"
                }
            }
        }, indent=2)
    })

    # =========================================================================
    # 02. Dashboard Summary
    # =========================================================================
    summary_req = make_request(
        name="2.1 Get Dashboard Summary (200 OK)",
        method="GET",
        url_path="/api/v1/dashboard/summary",
        auth_bearer=True,
        description="Mengambil statistik harian: total reservasi hari ini, breakdown status appointment/reschedule, dokter aktif, dokter praktik realtime, daftar reservasi overview, dan log aktivitas operasional.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Memiliki struktur data ringkasan dashboard lengkap", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property('totalReservasiHariIni');
    pm.expect(jsonData.data).to.have.property('totalDokter');
    pm.expect(jsonData.data).to.have.property('totalDokterAktif');
    pm.expect(jsonData.data).to.have.property('totalDokterPraktikHariIni');
    pm.expect(jsonData.data).to.have.property('rekapStatus');
    pm.expect(jsonData.data).to.have.property('daftarReservasi');
    pm.expect(jsonData.data).to.have.property('riwayatAktivitas');
});
"""
    )
    summary_req["response"].append({
        "name": "200 OK - Ringkasan Dashboard",
        "originalRequest": summary_req["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Data ringkasan operasional dashboard berhasil diambil.",
            "data": {
                "totalReservasiHariIni": 4,
                "totalDokter": 6,
                "totalDokterAktif": 5,
                "totalDokterPraktikHariIni": 3,
                "rekapStatus": {
                    "appointment": 3,
                    "reschedule": 1
                },
                "cards": {
                    "totalReservasiHariIni": 4,
                    "totalDokter": 6,
                    "dokterPraktik": 3,
                    "dokterAktif": 5
                },
                "daftarReservasi": [
                    {
                        "id": 1,
                        "namaPasien": "Budi Santoso",
                        "jadwal": "16-11-2026 10:00 WIB",
                        "dokter": "drg. Indira Nugrahani",
                        "cabang": "Muchtar",
                        "status": "Appointment"
                    }
                ],
                "reservations": [
                    {
                        "id": 1,
                        "namaPasien": "Budi Santoso",
                        "jadwal": "16-11-2026 10:00 WIB",
                        "dokter": "drg. Indira Nugrahani",
                        "cabang": "Muchtar",
                        "status": "Appointment"
                    }
                ],
                "riwayatAktivitas": [
                    {
                        "id": "act_1",
                        "waktu": "16:15 WIB",
                        "tipe": "reservasi",
                        "status": "Tambah",
                        "deskripsi": "Menambahkan reservasi pasien: Budi Santoso (Appointment)"
                    }
                ],
                "activities": [
                    {
                        "id": "act_1",
                        "waktu": "16:15 WIB",
                        "tipe": "reservasi",
                        "status": "Tambah",
                        "deskripsi": "Menambahkan reservasi pasien: Budi Santoso (Appointment)"
                    }
                ]
            }
        }, indent=2)
    })

    summary_no_token = make_request(
        name="2.2 Get Dashboard Gagal - Tanpa Token (401)",
        method="GET",
        url_path="/api/v1/dashboard/summary",
        auth_bearer=False,
        description="Uji coba mengakses ringkasan dashboard tanpa menyertakan token autentikasi.",
        test_script="""
pm.test("Status code is 401", function () {
    pm.response.to.have.status(401);
});
pm.test("Error code UNAUTHORIZED", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("UNAUTHORIZED");
});
"""
    )

    # =========================================================================
    # 03. Kelola Dokter & Jadwal Praktik
    # =========================================================================
    get_dokter_all = make_request(
        name="3.1 Get Semua Dokter (200 OK)",
        method="GET",
        url_path="/api/v1/dokter",
        auth_bearer=True,
        description="Mengambil seluruh daftar dokter terdaftar beserta jadwal praktiknya.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Data dokter bertipe array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    if (jsonData.data.length > 0) {
        pm.environment.set("dokter_id", jsonData.data[0].id);
        pm.environment.set("test_dokter_id", jsonData.data[0].id);
    }
});
"""
    )
    get_dokter_all["response"].append({
        "name": "200 OK - Daftar Semua Dokter",
        "originalRequest": get_dokter_all["request"],
        "status": "OK",
        "code": 200,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Daftar dokter berhasil diambil.",
            "data": [
                {
                    "id": 1,
                    "nama": "drg. Indira Nugrahani",
                    "spesialisasi": "Konservasi Gigi (Sp.KG)",
                    "cabang": "Muchtar",
                    "status": "Aktif",
                    "jadwal_json": {
                        "cabangMuchtar": True,
                        "jadwalMuchtar": [
                            {"hari": "Senin", "jam": "10.00-14.00"},
                            {"hari": "Rabu", "jam": "14.00-18.00"}
                        ]
                    },
                    "cabangMuchtar": True,
                    "jadwalMuchtar": [
                        {"hari": "Senin", "jam": "10.00-14.00"},
                        {"hari": "Rabu", "jam": "14.00-18.00"}
                    ],
                    "jadwal": [
                        {"hari": "Senin", "jam": "10.00-14.00"},
                        {"hari": "Rabu", "jam": "14.00-18.00"}
                    ]
                }
            ]
        }, indent=2)
    })

    get_dokter_filter = make_request(
        name="3.2 Filter Dokter by Status, Cabang, & Search (200 OK)",
        method="GET",
        url_path="/api/v1/dokter",
        query=[
            {"key": "cabang", "value": "Muchtar", "description": "Filter cabang dokter"},
            {"key": "status", "value": "Aktif", "description": "Filter status (Aktif, Tidak Aktif)"},
            {"key": "search", "value": "Indira", "description": "Pencarian nama dokter"}
        ],
        auth_bearer=True,
        description="Menyaring data dokter berdasarkan cabang, status, dan pencarian nama.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Filter dokter berhasil", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
"""
    )

    post_dokter = make_request(
        name="3.3 Tambah Dokter Baru - Valid (201 Created)",
        method="POST",
        url_path="/api/v1/dokter",
        auth_bearer=True,
        body={
            "nama": "drg. Ahmad Fauzi",
            "spesialisasi": "Ortodonti (Sp.Ort)",
            "cabang": "Muchtar",
            "status": "Aktif",
            "cabangMuchtar": True,
            "jadwalMuchtar": [
                {"hari": "Senin", "jam": "09.00 - 13.00"},
                {"hari": "Rabu", "jam": "14.00 - 18.00"}
            ],
            "jadwal": [
                {"hari": "Senin", "jam": "09.00 - 13.00"},
                {"hari": "Rabu", "jam": "14.00 - 18.00"}
            ]
        },
        description="Menambahkan master dokter baru beserta jadwal praktiknya (sesuai field frontend dokter.jsx). ID dokter baru otomatis disimpan ke variabel 'dokter_id' dan 'test_dokter_id'.",
        test_script="""
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
pm.test("Dokter berhasil dibuat dan ID disimpan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.be.a('number');
    pm.environment.set("dokter_id", jsonData.data.id);
    pm.environment.set("test_dokter_id", jsonData.data.id);
});
"""
    )
    post_dokter["response"].append({
        "name": "201 Created - Dokter Ditambahkan",
        "originalRequest": post_dokter["request"],
        "status": "Created",
        "code": 201,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Data dokter berhasil ditambahkan.",
            "data": {
                "id": 2,
                "nama": "drg. Ahmad Fauzi",
                "spesialisasi": "Ortodonti (Sp.Ort)",
                "cabang": "Muchtar",
                "status": "Aktif",
                "jadwal_json": {
                    "jadwal": [
                        {"hari": "Senin", "jam": "09.00 - 13.00"},
                        {"hari": "Rabu", "jam": "14.00 - 18.00"}
                    ],
                    "jadwalMuchtar": [
                        {"hari": "Senin", "jam": "09.00 - 13.00"},
                        {"hari": "Rabu", "jam": "14.00 - 18.00"}
                    ],
                    "cabangMuchtar": True
                },
                "cabangMuchtar": True,
                "jadwalMuchtar": [
                    {"hari": "Senin", "jam": "09.00 - 13.00"},
                    {"hari": "Rabu", "jam": "14.00 - 18.00"}
                ],
                "jadwal": [
                    {"hari": "Senin", "jam": "09.00 - 13.00"},
                    {"hari": "Rabu", "jam": "14.00 - 18.00"}
                ]
            }
        }, indent=2)
    })

    post_dokter_empty = make_request(
        name="3.4 Tambah Dokter Gagal - Nama Kosong (400)",
        method="POST",
        url_path="/api/v1/dokter",
        auth_bearer=True,
        body={
            "nama": "",
            "spesialisasi": "Ortodonti",
            "cabang": "Muchtar",
            "status": "Aktif"
        },
        description="Uji coba menambah dokter baru tanpa mengisi nama.",
        test_script="""
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code VALIDATION_ERROR", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    get_dokter_by_id = make_request(
        name="3.5 Get Detail Dokter by ID (200 OK)",
        method="GET",
        url_path="/api/v1/dokter/{{dokter_id}}",
        auth_bearer=True,
        description="Mengambil detail lengkap data 1 dokter berdasarkan ID dinamis.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Data dokter sesuai ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.eql(Number(pm.environment.get("dokter_id")));
});
"""
    )

    get_dokter_not_found = make_request(
        name="3.6 Get Detail Dokter Gagal - ID Tidak Ditemukan (404)",
        method="GET",
        url_path="/api/v1/dokter/999999",
        auth_bearer=True,
        description="Uji coba mengambil dokter dengan ID yang tidak ada di database.",
        test_script="""
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});
pm.test("Error code NOT_FOUND", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    put_dokter = make_request(
        name="3.7 Update Dokter by ID (200 OK)",
        method="PUT",
        url_path="/api/v1/dokter/{{dokter_id}}",
        auth_bearer=True,
        body={
            "nama": "drg. Ahmad Fauzi, Sp.Ort",
            "spesialisasi": "Spesialis Ortodonsia (Kawat Gigi)",
            "cabang": "Muchtar",
            "status": "Aktif",
            "cabangMuchtar": True,
            "jadwalMuchtar": [
                {"hari": "Selasa", "jam": "10.00 - 15.00"},
                {"hari": "Kamis", "jam": "10.00 - 15.00"}
            ],
            "jadwal": [
                {"hari": "Selasa", "jam": "10.00 - 15.00"},
                {"hari": "Kamis", "jam": "10.00 - 15.00"}
            ]
        },
        description="Memperbarui nama, spesialisasi, status, atau jadwal praktik dokter.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Data dokter berhasil diperbarui", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.nama).to.include("drg. Ahmad Fauzi");
});
"""
    )

    delete_dokter = make_request(
        name="3.8 Hapus Dokter by ID (200 OK)",
        method="DELETE",
        url_path="/api/v1/dokter/{{dokter_id}}",
        auth_bearer=True,
        description="Menghapus data dokter dari sistem secara permanen.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Dokter berhasil dihapus", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.eql(Number(pm.environment.get("dokter_id")));
});
"""
    )

    delete_dokter_not_found = make_request(
        name="3.9 Hapus Dokter Gagal - ID Tidak Ditemukan (404)",
        method="DELETE",
        url_path="/api/v1/dokter/999999",
        auth_bearer=True,
        description="Uji coba menghapus data dokter yang ID-nya tidak terdaftar.",
        test_script="""
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});
pm.test("Error code NOT_FOUND", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    # =========================================================================
    # 04. Kelola Reservasi Pasien
    # =========================================================================
    get_res_doctors = make_request(
        name="4.1 Get Dokter Aktif untuk Dropdown (200 OK)",
        method="GET",
        url_path="/api/v1/reservasi/doctors",
        auth_bearer=True,
        description="Mengambil daftar dokter aktif untuk mengisi pilihan dropdown modal tambah/edit reservasi.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Mengembalikan array dokter aktif", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
"""
    )

    get_reservasi_all = make_request(
        name="4.2 Get Semua Reservasi (200 OK)",
        method="GET",
        url_path="/api/v1/reservasi",
        auth_bearer=True,
        description="Mengambil daftar seluruh reservasi pasien.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Data reservasi bertipe array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    if (jsonData.data.length > 0) {
        pm.environment.set("reservasi_id", jsonData.data[0].id);
        pm.environment.set("test_reservasi_id", jsonData.data[0].id);
    }
});
"""
    )

    get_reservasi_filter = make_request(
        name="4.3 Filter Reservasi by Tanggal, Status, & Search (200 OK)",
        method="GET",
        url_path="/api/v1/reservasi",
        query=[
            {"key": "tanggal_reservasi", "value": "2026-11-16", "description": "Filter tanggal (YYYY-MM-DD)"},
            {"key": "status", "value": "Appointment", "description": "Appointment / Reschedule"},
            {"key": "search", "value": "Budi", "description": "Pencarian nama pasien"}
        ],
        auth_bearer=True,
        description="Menyaring data reservasi berdasarkan tanggal, status, dan nama pasien.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Filter reservasi berhasil", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
"""
    )

    post_reservasi = make_request(
        name="4.4 Buat Reservasi Baru - Valid (201 Created)",
        method="POST",
        url_path="/api/v1/reservasi",
        auth_bearer=True,
        body={
            "namaPasien": "Budi Santoso",
            "tanggal": "2026-11-16",
            "waktu": "10:00",
            "dokter": "drg. Indira Nugrahani",
            "dokter_id": 1,
            "status": "Appointment"
        },
        description="Membuat jadwal reservasi baru pasien (sesuai payload frontend reservasi.jsx). ID reservasi baru disimpan ke 'reservasi_id' dan 'test_reservasi_id'.",
        test_script="""
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
pm.test("Reservasi berhasil dibuat dan ID disimpan", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.be.a('number');
    pm.environment.set("reservasi_id", jsonData.data.id);
    pm.environment.set("test_reservasi_id", jsonData.data.id);
});
"""
    )
    post_reservasi["response"].append({
        "name": "201 Created - Reservasi Dibuat",
        "originalRequest": post_reservasi["request"],
        "status": "Created",
        "code": 201,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Reservasi berhasil dibuat.",
            "data": {
                "id": 1,
                "pasien_id": 1,
                "dokter_id": 1,
                "namaPasien": "Budi Santoso",
                "dokter": "drg. Indira Nugrahani",
                "tanggal": "16-11-2026",
                "tanggalIso": "2026-11-16",
                "tanggal_reservasi": "2026-11-16T00:00:00.000Z",
                "waktu": "10:00",
                "waktu_reservasi": "10:00",
                "jadwal": "16-11-2026 10:00",
                "status": "Appointment",
                "pasien": {"id": 1, "nama": "Budi Santoso"},
                "dokterDetail": {"id": 1, "nama": "drg. Indira Nugrahani"}
            }
        }, indent=2)
    })

    post_reservasi_empty = make_request(
        name="4.5 Buat Reservasi Gagal - Pasien Kosong (400)",
        method="POST",
        url_path="/api/v1/reservasi",
        auth_bearer=True,
        body={
            "namaPasien": "",
            "tanggal": "2026-11-16",
            "waktu": "10:00",
            "dokter": "drg. Indira Nugrahani"
        },
        description="Uji coba reservasi tanpa mengisi nama pasien.",
        test_script="""
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code VALIDATION_ERROR", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    put_reservasi = make_request(
        name="4.6 Update Reservasi - Reschedule Jadwal (200 OK)",
        method="PUT",
        url_path="/api/v1/reservasi/{{reservasi_id}}",
        auth_bearer=True,
        body={
            "namaPasien": "Budi Santoso",
            "tanggal": "2026-11-17",
            "waktu": "14:00",
            "dokter": "drg. Indira Nugrahani",
            "dokter_id": 1,
            "status": "Reschedule"
        },
        description="Memperbarui tanggal, waktu, dokter, atau status reservasi pasien (misalnya Reschedule).",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Reservasi berhasil diupdate", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.status).to.eql("Reschedule");
});
"""
    )

    delete_reservasi = make_request(
        name="4.7 Hapus Reservasi by ID (200 OK)",
        method="DELETE",
        url_path="/api/v1/reservasi/{{reservasi_id}}",
        auth_bearer=True,
        description="Menghapus data reservasi pasien.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Reservasi berhasil dihapus", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.eql(Number(pm.environment.get("reservasi_id")));
});
"""
    )

    delete_reservasi_not_found = make_request(
        name="4.8 Hapus Reservasi Gagal - ID Tidak Ditemukan (404)",
        method="DELETE",
        url_path="/api/v1/reservasi/999999",
        auth_bearer=True,
        description="Uji coba menghapus data reservasi dengan ID yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});
pm.test("Error code NOT_FOUND", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("NOT_FOUND");
});
"""
    )

    # =========================================================================
    # 05. Rekam Medis Elektronik / EMR
    # =========================================================================
    get_emr_patients = make_request(
        name="5.1 Get Autocomplete Pasien Terjadwal (200 OK)",
        method="GET",
        url_path="/api/v1/rekam-medis/patients",
        auth_bearer=True,
        description="Mengambil daftar pasien dengan status reservasi dan dokter terkait untuk auto-fill form pencatatan EMR.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Data pasien untuk EMR bertipe array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
"""
    )

    get_emr_all = make_request(
        name="5.2 Get Semua Rekam Medis (200 OK)",
        method="GET",
        url_path="/api/v1/rekam-medis",
        auth_bearer=True,
        description="Mengambil riwayat seluruh rekam medis pasien diurutkan dari yang terbaru.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Data EMR bertipe array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    if (jsonData.data.length > 0) {
        pm.environment.set("rekam_medis_id", jsonData.data[0].id);
        pm.environment.set("test_emr_id", jsonData.data[0].id);
    }
});
"""
    )

    get_emr_filter = make_request(
        name="5.3 Filter Rekam Medis by Search, Dokter, & Tanggal (200 OK)",
        method="GET",
        url_path="/api/v1/rekam-medis",
        query=[
            {"key": "search", "value": "karang gigi", "description": "Pencarian multi-field (anamnesa, tindakan, regio, pasien, dokter)"},
            {"key": "dokter_id", "value": "1", "description": "Filter ID dokter pemeriksa", "disabled": False},
            {"key": "startDate", "value": "2026-11-01", "description": "Tanggal awal rentang (YYYY-MM-DD)", "disabled": False},
            {"key": "endDate", "value": "2026-11-30", "description": "Tanggal akhir rentang (YYYY-MM-DD)", "disabled": False}
        ],
        auth_bearer=True,
        description="Menyaring data EMR berdasarkan kata kunci klinis, dokter, dan rentang tanggal.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Filter rekam medis berhasil", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
"""
    )

    post_emr = make_request(
        name="5.4 Tambah Rekam Medis Baru - Valid (201 Created)",
        method="POST",
        url_path="/api/v1/rekam-medis",
        auth_bearer=True,
        body={
            "namaPasien": "Budi Santoso",
            "tanggal": "2026-11-16",
            "regio": "16, 17",
            "dokter": "drg. Indira Nugrahani",
            "dokter_id": 1,
            "anamnesa": "Pasien mengeluhkan gigi geraham kanan berdenyut sejak 2 hari yang lalu setelah makan.",
            "tindakan": "Pembersihan kavitas, ekskavasi jaringan karies, dan aplikasi tumpatan sementara.",
            "resep": "Asam Mefenamat 500mg 3x1 tablet sesudah makan, Amoxicillin 500mg 3x1 tablet.",
            "terapi": "Hindari mengunyah makanan keras di sisi kanan selama 24 jam. Kontrol 1 minggu lagi."
        },
        description="Menyimpan rekam medis baru ke database dengan sanitasi XSS otomatis (sesuai payload frontend EMR.jsx). ID rekam medis otomatis disimpan ke variabel 'rekam_medis_id' dan 'test_emr_id'.",
        test_script="""
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
pm.test("Rekam medis berhasil disimpan dan ID dicatat", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.be.a('number');
    pm.environment.set("rekam_medis_id", jsonData.data.id);
    pm.environment.set("test_emr_id", jsonData.data.id);
});
"""
    )
    post_emr["response"].append({
        "name": "201 Created - Rekam Medis Disimpan",
        "originalRequest": post_emr["request"],
        "status": "Created",
        "code": 201,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": True,
            "message": "Data rekam medis berhasil disimpan.",
            "data": {
                "id": 1,
                "pasien_id": 1,
                "dokter_id": 1,
                "namaPasien": "Budi Santoso",
                "dokter": "drg. Indira Nugrahani",
                "tanggal": "16-11-2026",
                "tanggalIso": "2026-11-16",
                "tanggal_rekam": "2026-11-16T00:00:00.000Z",
                "regio": "16, 17",
                "anamnesa": "Pasien mengeluhkan gigi geraham kanan berdenyut sejak 2 hari yang lalu setelah makan.",
                "tindakan": "Pembersihan kavitas, ekskavasi jaringan karies, dan aplikasi tumpatan sementara.",
                "resep": "Asam Mefenamat 500mg 3x1 tablet sesudah makan, Amoxicillin 500mg 3x1 tablet.",
                "terapi": "Hindari mengunyah makanan keras di sisi kanan selama 24 jam. Kontrol 1 minggu lagi.",
                "pasien": {"id": 1, "nama": "Budi Santoso"},
                "dokterDetail": {"id": 1, "nama": "drg. Indira Nugrahani"}
            }
        }, indent=2)
    })

    post_emr_empty_patient = make_request(
        name="5.5 Tambah EMR Gagal - Pasien Kosong (400)",
        method="POST",
        url_path="/api/v1/rekam-medis",
        auth_bearer=True,
        body={
            "namaPasien": "",
            "tanggal": "2026-11-16",
            "dokter": "drg. Indira Nugrahani",
            "tindakan": "Pembersihan karang gigi"
        },
        description="Uji coba menyimpan EMR tanpa memilih atau memasukkan nama pasien.",
        test_script="""
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code VALIDATION_ERROR", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    post_emr_empty_date = make_request(
        name="5.6 Tambah EMR Gagal - Tanggal Kosong (400)",
        method="POST",
        url_path="/api/v1/rekam-medis",
        auth_bearer=True,
        body={
            "namaPasien": "Budi Santoso",
            "tanggal": "",
            "dokter": "drg. Indira Nugrahani",
            "tindakan": "Pembersihan karang gigi"
        },
        description="Uji coba menyimpan EMR tanpa tanggal kunjungan.",
        test_script="""
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code VALIDATION_ERROR", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("VALIDATION_ERROR");
});
"""
    )

    get_emr_by_id = make_request(
        name="5.7 Get Detail Rekam Medis by ID (200 OK)",
        method="GET",
        url_path="/api/v1/rekam-medis/{{rekam_medis_id}}",
        auth_bearer=True,
        description="Mengambil detail 1 data rekam medis berdasarkan ID dinamis.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Data rekam medis sesuai ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.eql(Number(pm.environment.get("rekam_medis_id")));
});
"""
    )

    put_emr = make_request(
        name="5.8 Update Rekam Medis by ID (200 OK)",
        method="PUT",
        url_path="/api/v1/rekam-medis/{{rekam_medis_id}}",
        auth_bearer=True,
        body={
            "namaPasien": "Budi Santoso",
            "tanggal": "2026-11-16",
            "regio": "16, 17",
            "dokter": "drg. Indira Nugrahani",
            "dokter_id": 1,
            "anamnesa": "Pemeriksaan pasca penambalan sementara, rasa ngilu dan nyeri sudah hilang.",
            "tindakan": "Bongkar tumpatan sementara, preparasi akhir, dan restorasi komposit resin permanen.",
            "resep": "Vitamin C 500mg 1x1 sehari.",
            "terapi": "Menjaga kebersihan rongga mulut dengan menyikat gigi minimal 2x sehari."
        },
        description="Memperbarui catatan klinis EMR pasien.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Rekam medis berhasil diperbarui", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.tindakan).to.include("restorasi komposit");
});
"""
    )

    delete_emr = make_request(
        name="5.9 Hapus Rekam Medis by ID (200 OK)",
        method="DELETE",
        url_path="/api/v1/rekam-medis/{{rekam_medis_id}}",
        auth_bearer=True,
        description="Menghapus data rekam medis pasien.",
        test_script="""
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Rekam medis berhasil dihapus", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.id).to.eql(Number(pm.environment.get("rekam_medis_id")));
});
"""
    )

    delete_emr_not_found = make_request(
        name="5.10 Hapus EMR Gagal - ID Tidak Ditemukan (404)",
        method="DELETE",
        url_path="/api/v1/rekam-medis/999999",
        auth_bearer=True,
        description="Uji coba menghapus data EMR dengan ID yang tidak ada.",
        test_script="""
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});
pm.test("Error code RESOURCE_NOT_FOUND", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("RESOURCE_NOT_FOUND");
});
"""
    )

    # =========================================================================
    # 06. Endpoint Tidak Ditemukan (404 Not Found)
    # =========================================================================
    not_found_req = make_request(
        name="6.1 Test Rute Tidak Dikenal (404 Not Found)",
        method="GET",
        url_path="/api/v1/rute-yang-pasti-tidak-ada-di-server",
        auth_bearer=False,
        description="Memvalidasi respons global notFoundHandler Express saat mengakses URL yang tidak terdaftar.",
        test_script="""
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});
pm.test("Error code RESOURCE_NOT_FOUND", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error.code).to.eql("RESOURCE_NOT_FOUND");
});
"""
    )
    not_found_req["response"].append({
        "name": "404 Not Found - Rute Tidak Ada",
        "originalRequest": not_found_req["request"],
        "status": "Not Found",
        "code": 404,
        "_postman_previewlanguage": "json",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": json.dumps({
            "success": False,
            "error": {
                "code": "RESOURCE_NOT_FOUND",
                "message": "Endpoint GET /api/v1/rute-yang-pasti-tidak-ada-di-server tidak ditemukan."
            }
        }, indent=2)
    })

    collection = {
        "info": {
            "_postman_id": collection_id,
            "name": "IN DENTAL CARE - REST API Testing Collection (All Modules)",
            "description": "Koleksi Postman resmi dan komprehensif untuk pengujian REST API IN DENTAL CARE Admin Dashboard:\n1. Health Check\n2. Modul Autentikasi (/api/v1/auth)\n3. Modul Dashboard Overview (/api/v1/dashboard)\n4. Modul Kelola Dokter (/api/v1/dokter)\n5. Modul Kelola Reservasi (/api/v1/reservasi)\n6. Modul Rekam Medis EMR (/api/v1/rekam-medis)\n7. Endpoint 404 Not Found Handling\n\nDilengkapi pm.test assertion untuk kode status, format JSON, error code, serta auto-chaining JWT token dan dynamic IDs.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [
            {
                "name": "0. Health Check",
                "description": "Endpoint pemeriksaan koneksi dan status kesehatan server Express.",
                "item": [health_check]
            },
            {
                "name": "1. Modul Autentikasi",
                "description": "Endpoint autentikasi admin: Login (JWT), Sliding Session Refresh, dan Logout.",
                "item": [
                    login_success,
                    login_failed_cred,
                    login_failed_unregistered,
                    login_validation_email,
                    login_validation_empty,
                    refresh_token,
                    logout_no_token,
                    logout_req,
                    login_relogin
                ]
            },
            {
                "name": "2. Modul Dashboard Overview",
                "description": "Endpoint ringkasan metrik statistik operasional klinik harian, overview tabel reservasi, dan log audit aktivitas.",
                "item": [
                    summary_req,
                    summary_no_token
                ]
            },
            {
                "name": "3. Modul Kelola Dokter",
                "description": "Endpoint CRUD manajemen dokter dan jadwal praktik klinik (Muchtar / cabang lainnya).",
                "item": [
                    get_dokter_all,
                    get_dokter_filter,
                    post_dokter,
                    post_dokter_empty,
                    get_dokter_by_id,
                    get_dokter_not_found,
                    put_dokter,
                    delete_dokter,
                    delete_dokter_not_found
                ]
            },
            {
                "name": "4. Modul Kelola Reservasi",
                "description": "Endpoint CRUD manajemen jadwal reservasi kunjungan pasien (Appointment & Reschedule).",
                "item": [
                    get_res_doctors,
                    get_reservasi_all,
                    get_reservasi_filter,
                    post_reservasi,
                    post_reservasi_empty,
                    put_reservasi,
                    delete_reservasi,
                    delete_reservasi_not_found
                ]
            },
            {
                "name": "5. Modul Rekam Medis (EMR)",
                "description": "Endpoint CRUD catatan rekam medis gigi pasien (regio, anamnesa, tindakan, resep obat, dan terapi).",
                "item": [
                    get_emr_patients,
                    get_emr_all,
                    get_emr_filter,
                    post_emr,
                    post_emr_empty_patient,
                    post_emr_empty_date,
                    get_emr_by_id,
                    put_emr,
                    delete_emr,
                    delete_emr_not_found
                ]
            },
            {
                "name": "6. Endpoint Tidak Ditemukan (404)",
                "description": "Validasi perlakuan error 404 pada route yang tidak terdaftar di server.",
                "item": [not_found_req]
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
