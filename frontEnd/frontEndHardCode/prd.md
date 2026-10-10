PRD — Halaman Detail Produk Headphone

1. Product Overview
   Data Nilai
   Nama MW75 TUMI
   Harga $750.00 per item
   Deskripsi Headphone Bluetooth dengan active noise cancelation, dilengkapi dengan driver sebesar 40 mm, dan ketahanan battery selama 32 jam pemakaian.
   Warna Hitam, Perak
   Ukuran 160.75mm x 197.83mm x 83.57mm
   Stok 10 Hitam, 0 Perak
   Foto Empat foto untuk setiap warna
   Konten utama halaman mencakup header, foto produk, nama produk, harga, deskripsi, pilihan variasi, quantity, dan footer.

2. Problem + Target User
   Problem
   Pengguna membutuhkan informasi yang jelas untuk menilai apakah produk sesuai dengan kebutuhan mereka. Pilihan warna, ukuran, dan jumlah barang juga harus mudah dipahami agar pengguna mengetahui pilihan yang sedang aktif.
   Masalah yang ingin diselesaikan:
   • Informasi produk tersebar atau sulit ditemukan.
   • Pilihan warna dan ukuran tidak memiliki penanda yang jelas.
   • Jumlah barang bisa dipilih melebihi stok atau kurang dari satu.
   • Pengguna tidak mendapatkan feedback setelah memilih produk.
   Target User
   Calon pembeli yang mengakses toko melalui desktop atau smartphone dan ingin melihat detail serta memilih variasi produk.
   Kebutuhan utama: melihat produk, memahami harga dan deskripsi, lalu memilih warna,, dan jumlah barang.
3. Goals + Non-Goals
   Goals
4. Menampilkan informasi produk dengan jelas dan mudah dibaca.
5. Memungkinkan pengguna memilih satu warna
6. Memungkinkan pengguna mengubah jumlah barang sesuai batas stok.
7. Menampilkan feedback yang menunjukkan pilihan pengguna.
8. Memberikan pengalaman yang nyaman pada desktop dan mobile.
   Non-Goals
   Versi ini tidak mencakup:
   • Login dan registrasi.
   • Pengambilan data melalui API.
   • Keranjang belanja yang tersimpan.
   • Checkout dan pembayaran.
   • Perhitungan ongkos kirim.
   • Review, rating, wishlist, atau rekomendasi produk.
   • Pengelolaan produk melalui halaman admin.
9. User Flow
10. Pengguna membuka halaman detail produk.
11. Halaman menampilkan foto, nama, harga, dan deskripsi produk.
12. Pengguna memilih warna.
13. Foto utama berubah sesuai warna yang dipilih.
14. Pengguna menekan tombol add to cart
15. Pengguna menekan tombol cart di bagian header
16. Pengguna mengatur quantity melalui tombol − dan +.
17. Ringkasan pilihan diperbarui.
18. Pengguna menekan tombol “CHECKOUT”.
    Kondisi awal:
    • Foto utama menampilkan produk warna Hitam.
    • Warna hitam dipilih
    Tombol add to cart digunakan untuk demonstrasi interaksi frontend; tidak memulai transaksi.
19. Features + Requirements
    ID Fitur Requirement
    FR-01 Header Menampilkan nama atau logo
    FR-02 Foto produk Menampilkan foto yang bisa diganti kanan kiri sebanyak 4
    FR-03 Informasi produk Menampilkan nama, harga per item, dan deskripsi produk.
    FR-04 Pilihan warna Menyediakan Hitam dan silver . Hanya satu warna dapat aktif pada satu waktu.
    FR-05 Perubahan foto Foto utama berubah sesuai warna yang dipilih.
    FR-08 Ringkasan pilihan Menampilkan warna, quantity, dan total harga berdasarkan pilihan terbaru.
    FR-10 Footer Menampilkan nama toko dan informasi hak cipta singkat.
    FR-11 Tampilan responsif Pada desktop, foto dan informasi ditampilkan berdampingan. Pada mobile, konten disusun vertikal.
    Aturan Interaksi
    • Pilihan warna memiliki penanda visual serta status yang dapat dikenali pembaca layar.
    • Memilih variasi baru menggantikan pilihan sebelumnya.
    • Harga menggunakan format Dollar
    • Jika pilihan berubah setelah konfirmasi, pesan konfirmasi sebelumnya dihapus agar tidak menampilkan informasi lama.
    • Pilihan kembali ke kondisi awal ketika halaman dimuat ulang.
20. User Stories
    ID User Story
    US-01 Sebagai calon pembeli, saya ingin melihat foto dan deskripsi headphone agar dapat memahami produk yang ditawarkan.
    US-03 Sebagai calon pembeli, saya ingin memilih warna dan melihat fotonya agar dapat membandingkan tampilan produk.
    US-05 Sebagai calon pembeli, saya ingin mengubah jumlah barang agar dapat memilih jumlah yang dibutuhkan.
    US-06 Sebagai calon pembeli, saya ingin melihat ringkasan dan konfirmasi agar yakin bahwa pilihan saya sudah benar.
21. Acceptance Criteria
    Acceptance criteria adalah kondisi yang harus terpenuhi agar fitur dianggap selesai.
    ID Skenario Hasil yang Diharapkan
    AC-01 Pengguna membuka halaman Header, foto, nama, harga, deskripsi, pilihan warna, ukuran, quantity, dan footer tampil.
    AC-08 Hanya warna atau ukuran yang dipilih Tombol konfirmasi tetap tidak aktif.
    AC-11 Halaman dibuka pada lebar 375 px Tidak ada scroll horizontal; teks, gambar, dan kontrol tetap dapat digunakan.
    AC-12 Pengguna mengoperasikan halaman dengan keyboard Semua kontrol dapat dijangkau menggunakan Tab, memiliki fokus yang terlihat, dan dapat diaktifkan dengan keyboard.
    AC-13 Halaman dimuat ulang Pilihan kembali ke kondisi awal.
22. Constraints + Success Criteria
    Constraints
    • Implementasi menggunakan HTML, CSS, dan JavaScript murni, tanpa framework.
    • Data produk disimpan langsung di frontend.
    • Foto menggunakan aset lokal yang sudah disiapkan.
    • Tidak menggunakan API, backend, database, atau penyimpanan pilihan.
    • Hanya menampilkan satu produk.
    • Semua kombinasi warna dan ukuran tersedia dengan stok contoh 10 item.
    • Quantity diubah melalui tombol − dan +; input angka manual tidak termasuk scope.
    Success Criteria
    Halaman dianggap berhasil apabila:
23. Seluruh acceptance criteria lulus saat pengujian manual.
24. Informasi produk dan status pilihan mudah dikenali.
25. Foto, ringkasan, dan total harga selalu sesuai pilihan terbaru.
26. Quantity selalu berada dalam rentang 1–10.
27. Halaman dapat digunakan pada mobile dan desktop tanpa konten terpotong.
28. Tidak ada error JavaScript saat menjalankan alur utama.
