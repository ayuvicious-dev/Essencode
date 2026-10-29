# Essencode — Rekap Kode Transaksi

PWA untuk merekap & mencari kode transaksi dari Excel. Login Firebase Auth (Email/Password), data di Cloud Firestore, hosting GitHub Pages.

## Struktur
```
icons/            ikon aplikasi
.nojekyll
README.md
index.html        seluruh aplikasi (HTML + CSS + JS dalam satu file)
manifest.json
service-worker.js
```

## Setup Firebase (project essencode-304b8)
1. **Authentication → Sign-in method**: aktifkan *Email/Password* (sudah).
2. **Authentication → Settings → Authorized domains**: tambahkan `USERNAME.github.io`.
3. **Firestore Database → Rules**: ganti dengan aturan berikut lalu *Publish*:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Deploy
Upload semua isi folder ini ke repository GitHub → Settings → Pages → Deploy from branch (`main`, `/root`).

## Cara kerja impor Excel
- Header dicari otomatis (kolom: Dana, Nama Kontak, Kode Transaksi, Keterangan, Debit 1, Kredit 1, Debit 2, Kredit 2). Baris catatan/kosong dilewati.
- Identitas data = **Kode Transaksi + Nama Kontak** (karena satu kode, mis. CR-U-O-HMBGY, bisa punya beberapa baris).
- Kode yang sama → **diganti**; kode baru → **ditambah**; yang identik → dilewati. Tidak ada data dobel.
- Jika kode hanya muncul satu kali di file dan di database tetapi nama kontaknya berubah, dianggap penggantian.
- Kode yang tidak ada di file tidak dihapus.
