# Aplikasi Lelang Ikan (LelangIkan)

Aplikasi Lelang Ikan adalah platform digital yang memfasilitasi proses lelang ikan antara penjual dan pembeli. Aplikasi ini dikembangkan menggunakan MERN stack (MongoDB, Express, React, Node.js) dengan fitur real-time menggunakan Socket.io.

## Fitur Utama

- Sistem multi-role (Admin, Penjual, Pembeli)
- Upload produk ikan dengan detail dan gambar
- Lelang real-time dengan sistem penawaran
- Pengaturan lelang yang fleksibel (harga awal, kenaikan minimum, beli langsung)
- Marketplace dengan filter dan pencarian
- Fitur switch mode antara penjual dan pembeli

## Instalasi dan Pengaturan

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan aplikasi:

1. Pastikan Anda telah menginstal:
   - Node.js dan npm
   - MongoDB
   
2. Clone repositori:
   ```
   git clone <repository-url>
   cd LelangIkan
   ```

3. Jalankan skrip setup:
   ```
   npm run setup
   ```
   
   Skrip ini akan menyiapkan struktur direktori dan menginstal semua dependensi.

4. Buat file `.env` di root folder dengan konten berikut:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/LelangIkan
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

5. Jalankan aplikasi dalam mode pengembangan:
   ```
   npm run dev
   ```

## Struktur Folder

```
/
├── client/                    # Front-end React application
│   ├── public/                # Static files
│   └── src/                   # React source code
│       ├── components/        # React components
│       ├── pages/             # Page components
│       ├── services/          # API services
│       ├── utils/             # Utility functions
│       ├── hooks/             # Custom React hooks
│       ├── context/           # React context providers
│       └── assets/            # Assets (images, styles)
│
├── server/                    # Back-end Node.js application
│   ├── config/                # Configuration files
│   ├── controllers/           # Route controllers
│   ├── middlewares/           # Express middlewares
│   ├── models/                # Mongoose models
│   ├── routes/                # Express routes
│   ├── services/              # Business logic
│   ├── uploads/               # Uploaded files
│   ├── utils/                 # Utility functions
│   ├── sockets/               # Socket.io logic
│   └── index.js               # Entry point
│
├── .env                       # Environment variables
├── package.json               # Project dependencies
└── setup.sh                   # Setup script
```

## Penggunaan

- Server berjalan di port 5000
- Client React berjalan di port 3000
- Akses aplikasi di browser melalui http://localhost:3000

## Fitur Pengembangan

- [ ] Dashboard admin untuk manajemen pengguna dan lelang
- [ ] Sistem notifikasi untuk aktivitas lelang
- [ ] Integrasi pembayaran
- [ ] Sistem logistik pengiriman

## Lisensi

MIT 