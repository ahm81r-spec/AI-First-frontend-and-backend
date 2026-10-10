# Product Requirements Document (PRD) for api without db

## 1. Ringkasan Produk

Produk ini adalah REST API untuk halaman detail product 2 yang menampilkan informasi produk lengkap pada front-end. API akan menyediakan data produk berdasarkan `id` dan digunakan oleh halaman detail product untuk menampilkan nama produk, harga, foto, variasi, dan deskripsi secara dinamis.

Tujuan utama dari produk ini:

- Menyediakan satu endpoint API yang konsisten dan mudah diintegrasikan
- Memisahkan data produk dari front-end agar lebih mudah di-maintain
- Menyediakan pengalaman detail produk yang lebih rapi dan dapat diperbarui dengan cepat
- Menambahkan validasi input yang kuat agar API aman dan konsisten

## 2. Latar Belakang dan Konteks Bisnis

Pada sesi front-end, halaman detail product 2 sudah dibuat dan memiliki area yang perlu diisi berdasarkan data produk yang berasal dari API. Saat ini, data produk masih hardcoded di sisi front-end. Proyek ini akan menyiapkan API backend yang menyediakan data produk agar halaman detail product dapat menerima data yang dinamis dan siap diperbarui.

## 3. Tujuan Produk

### 3.1 Tujuan bisnis

- Mempercepat pengembangan antarmuka detail produk
- Memudahkan perubahan data produk tanpa mengubah front-end
- Menyediakan struktur data yang jelas untuk tim frontend dan backend

### 3.2 Tujuan pengguna

- User dapat melihat informasi produk lengkap di halaman detail
- User dapat melihat variasi produk seperti warna atau ukuran
- User dapat memahami deskripsi produk secara cepat

## 4. Target Pengguna

- Pengguna akhir (customer) yang sedang melihat detail produk
- Tim front-end yang membutuhkan data produk dari API
- Tim back-end yang bertanggung jawab terhadap API dan validasi

## 5. Ruang Lingkup

### 5.1 Dalam ruang lingkup

- Endpoint `GET /api/products/:id`
- Data produk di-hardcode dalam backend untuk fase awal
- Validasi input pada parameter `id` dan payload/response structure
- Dokumentasi response schema dan error handling

### 5.2 Di luar ruang lingkup

- Sistem autentikasi user
- Database relasional atau persistent storage
- Checkout dan transaksi
- Manajemen admin produk

## 6. User Story

### User Story Utama

1. Sebagai user, saya ingin melihat nama produk di halaman detail agar saya tahu produk yang sedang saya lihat.
2. Sebagai user, saya ingin melihat harga produk agar saya bisa mempertimbangkan keputusan pembelian.
3. Sebagai user, saya ingin melihat foto produk agar saya bisa menilai tampilan dan kualitas produk.
4. Sebagai user, saya ingin melihat variasi produk seperti warna atau ukuran agar saya bisa memilih opsi yang sesuai.
5. Sebagai user, saya ingin membaca deskripsi produk agar saya memahami fitur dan manfaat produk.

### User Story Teknis

1. Sebagai frontend developer, saya ingin API mengembalikan data produk dalam format JSON yang konsisten agar halaman detail dapat render otomatis.
2. Sebagai backend developer, saya ingin validasi input diterapkan pada parameter route agar API tidak menerima request yang tidak valid.
3. Sebagai QA, saya ingin endpoint memberikan response error yang jelas saat data tidak ditemukan atau request tidak valid.

## 7. Functional Requirements

### 7.1 Endpoint Produk

- API menyediakan endpoint `GET /api/products/:id`
- Endpoint harus mengembalikan data produk sesuai `id` yang diminta
- Jika `id` valid dan data tersedia, API mengembalikan status `200 OK`
- Jika `id` tidak ditemukan, API mengembalikan status `404 Not Found`
- Jika parameter `id` tidak valid, API mengembalikan status `400 Bad Request`

### 7.2 Struktur Response Produk

Response JSON harus mengikuti struktur berikut:

```json
{
  "id": 1,
  "name": "MW75 TUMI",
  "price": 750,
  "image": "https://example.com/product.png",
  "variants": {
    "color": ["Black", "Silver"],
    "quantity": 10
  },
  "description": "Deskripsi singkat product..."
}
```

### 7.3 Aturan Data Produk

- `id` harus berupa angka integer positif
- `name` harus berupa string tidak kosong
- `price` harus berupa angka positif
- `image` harus berupa URL valid
- `variants.color` harus berupa array string yang tidak kosong
- `variants.quantity` harus berupa integer yang lebih besar atau sama dengan 0
- `description` harus berupa string tidak kosong dan maksimal 1000 karakter

## 8. Data Schema

### 8.1 Product Schema

```json
{
  "id": "number",
  "name": "string",
  "price": "number",
  "image": "string",
  "variants": {
    "color": ["string"],
    "quantity": "number"
  },
  "description": "string"
}
```

### 8.2 Field Definitions

| Field             | Type   | Required | Rule                                 |
| ----------------- | ------ | -------: | ------------------------------------ |
| id                | number |      Yes | Integer positif, lebih besar dari 0  |
| name              | string |      Yes | Tidak kosong, trim whitespace        |
| price             | number |      Yes | Lebih besar dari 0                   |
| image             | string |      Yes | URL valid                            |
| variants.color    | array  |      Yes | Minimal 1 item, setiap item string   |
| variants.quantity | number |      Yes | Integer >= 0                         |
| description       | string |      Yes | Tidak kosong, maksimal 1000 karakter |

## 9. Validasi Input

### 9.1 Validasi route parameter `id`

- Parameter `id` wajib ada
- Hanya menerima nilai numerik
- Nilai harus berupa integer positif
- Tidak menerima angka negatif, angka desimal, atau string non-numerik

Contoh validasi:

```javascript
if (!Number.isInteger(Number(req.params.id)) || Number(req.params.id) <= 0) {
  return res.status(400).json({ message: "Invalid product id" });
}
```

### 9.2 Validasi `name`

- Harus berupa string
- Value setelah di-trim tidak boleh kosong
- Panjang sebaiknya 1-100 karakter

### 9.3 Validasi `price`

- Harus angka
- Nilai > 0
- Hindari nilai NaN, Infinity, string kosong

### 9.4 Validasi `image`

- Harus URL valid
- Pastikan URL menggunakan protokol `http` atau `https`
- Redirect dan empty string harus ditolak

### 9.5 Validasi `variants`

- `color` wajib berupa array
- Minimal 1 item
- Semua item harus bertipe string dan tidak kosong
- `quantity` wajib integer >= 0

### 9.6 Validasi `description`

- Harus string
- Tidak boleh kosong setelah trim
- Panjang maksimal 1000 karakter

### 9.7 Error Handling

API harus mengembalikan response yang jelas, contoh:

```json
{
  "success": false,
  "message": "Invalid product id"
}
```

Status code yang umum digunakan:

- `200` untuk sukses
- `400` untuk input tidak valid
- `404` untuk data tidak ditemukan
- `500` untuk error internal server

## 10. Acceptance Criteria

### 10.1 Endpoint berhasil mengambil data

- [ ] `GET /api/products/1` mengembalikan status `200` dengan JSON valid
- [ ] Response berisi field `id`, `name`, `price`, `image`, `variants`, dan `description`
- [ ] Data yang dikembalikan sesuai dengan contoh struktur yang telah ditentukan

### 10.2 Data tidak ditemukan

- [ ] `GET /api/products/999` mengembalikan status `404`
- [ ] Response body berisi pesan yang jelas seperti `Product not found`

### 10.3 Input tidak valid

- [ ] `GET /api/products/0` mengembalikan status `400`
- [ ] `GET /api/products/abc` mengembalikan status `400`
- [ ] Input dengan nilai kosong atau format tidak sesuai ditolak oleh API

### 10.4 Front-end integration

- [ ] Halaman detail product 2 dapat menampilkan nama produk dari API
- [ ] Harga, foto, variasi, dan deskripsi seluruhnya terisi otomatis dari response API
- [ ] Tidak ada data hardcoded yang diperlukan di front-end untuk field utama produk

## 11. Non-Functional Requirements

- API harus responsif dan cepat untuk request tunggal
- Format response harus konsisten dan mudah diprediksi
- API harus mudah dikembangkan dan di-maintain
- Validasi input harus dilakukan sebelum proses pengambilan data
- Error message harus jelas dan developer-friendly

## 12. Assumptions

- Data produk pada tahap awal akan di-hardcode di backend, bukan dari database
- Project scope terbatas pada satu endpoint produk detail
- Front-end sudah tersedia dari exercise sebelumnya
- Pengembangan dapat dilakukan dengan Node.js dan Express.js atau framework yang sesuai

## 13. Kesimpulan

PRD ini mendefinisikan kebutuhan dasar untuk membangun API detail product yang aman, konsisten, dan siap digunakan oleh halaman detail product 2. Dengan validasi input yang kuat, API dapat mencegah request yang tidak valid dan meningkatkan kualitas pengalaman pengguna serta stabilitas aplikasi.
