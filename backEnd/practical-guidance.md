Practical Guidance: Modern Back-End Development with AI

Full Stack Web Development Bootcamp

Deskripsi Exercise
Melanjutkan exercise sebelumnya (Front-End Development), pada sesi ini student akan membuat REST API menggunakan JavaScript dengan bantuan AI coding assistant / AI coding tools. API yang dibuat akan menyediakan data product pada halaman detail product 2.

Objectives
Setelah mengikuti sesi ini, student mampu untuk:

Membuat REST API sederhana menggunakan JavaScript dan AI coding assistant / AI coding tools
Memahami secara garis besar cara kerja REST API dan komunikasi antara front-end dan back-end
Mengetahui ruang lingkup peran back-end developer dan AI coding assistant / AI coding tools
Tools
Zoom
AI coding assistant / AI coding tools
IDE
Node.js
Postman
notes: Students WAJIB mempersiapkan tools untuk exercise sebelum masuk kelas, termasuk memastikan Node.js sudah terinstall dan dapat dijalankan di IDE masing-masing.

Exercise Preparation (Before Class)
Sebelum masuk sesi kelas, student diharapkan sudah:

Berhasil install Node.js, IDE, dan AI coding assistant / AI coding tools
Hasil exercise sesi Front-End (halaman detail product 1 & 2)
In Class Exercise
Langkah 1 – Memahami Context dan Membuat API berdasarkan data product
Study Case & Context

Field minimal yang perlu ada pada response API product:

1. Nama Product

2. Harga Product

3. Foto Product

4. Variasi Product :

a. Warna/Ukuran,

b. Jumlah/Quantity

5. Deskripsi

NB : Endpoint API dapat dibuat menggunakan Node.js (contoh: Express.js) atau framework JavaScript lain sesuai preferensi. Data product pada tahap ini cukup di-hardcode langsung di dalam code back end (belum perlu database).

Contoh struktur endpoint yang dapat dibuat:

GET /api/products/:id

Contoh response JSON yang dikembalikan API:

{

"id": 1,

"name": "MW75 TUMI",

"price": 750,

"image": "https://.../product.png",

"variants": {

"color": ["Black", "Silver"],

"quantity": 10

},

"description": "Deskripsi singkat product..."

}

Langkah 2 – Setelah berhasil membuat API
Student dapat melakukan step ini :

1. Menghubungkan (integrate) API yang telah dibuat dengan halaman detail product 2 yang telah dibuat pada sesi Front-End sebelumnya

Field berikut pada halaman detail product 2 harus dapat terisi otomatis dari response API :

- Nama Product

- Harga Product

- Foto Product

- Variasi Product (Warna/Ukuran, Jumlah/Quantity)

- Deskripsi

Output Exercise

Student menghasilkan :

- 1 REST API endpoint yang mengembalikan data product sesuai field di atas

- Halaman detail product 2 yang seluruh kontennya terisi otomatis dari response API (bukan hardcode)
