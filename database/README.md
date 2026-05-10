# MySQL lokal XAMPP

Gunakan file `mysql-xampp-schema.sql` untuk membuat database lokal yang dipakai Next.js admin dan halaman reservasi.

Langkah cepat:

1. Jalankan Apache dan MySQL dari XAMPP.
2. Buka `http://localhost/phpmyadmin`.
3. Pilih tab SQL, lalu import atau paste isi `database/mysql-xampp-schema.sql`.
4. Buat file `.env.local` di root project `rumah-kopi`:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=rumah_kopi
```

Setelah itu jalankan:

```bash
npm run dev
```

CRUD yang sudah tersambung ke MySQL:

- `GET /api/menu`
- `POST /api/menu`
- `PATCH /api/menu`
- `DELETE /api/menu?id=...`
- `POST /api/reservations`
- `PATCH /api/reservations`
- `DELETE /api/reservations?id=...`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders`
- `DELETE /api/orders?id=...`

Halaman yang memakai database ini:

- `/reservations` untuk booking publik
- `/order` untuk pemesanan menu publik
- `/admin/reservations` untuk admin booking
- `/admin/orders` untuk admin pemesanan
- `/admin/menu` untuk CRUD menu

Jika database sudah terlanjur dibuat sebelum fitur QR meja ditambahkan, import juga:

```text
database/mysql-xampp-upgrade-qr-tables.sql
```
