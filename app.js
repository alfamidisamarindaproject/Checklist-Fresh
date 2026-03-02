// File: app.js

// 1. KONFIGURASI URL GOOGLE APPS SCRIPT
const SCRIPT_URL = 'MASUKKAN_URL_WEB_APP_ANDA_DISINI'; 

// 2. DEKLARASI ELEMEN DOM
const photoInput = document.getElementById('photoInput');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const btnDeteksi = document.getElementById('btnDeteksi');
const statusResult = document.getElementById('statusResult');
const checklistForm = document.getElementById('checklistForm');
const btnSubmit = document.getElementById('btnSubmit');

const inputToko = document.getElementById('inputToko');
const inputPIC = document.getElementById('inputPIC');
const inputCatatan = document.getElementById('inputCatatan');

let uploadedImage = new Image();
let statusDeteksi = "Aman (Belum dicek AI)";

// 3. EVENT: SAAT GAMBAR DIUPLOAD
photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedImage.onload = function() {
            previewArea.classList.remove('hidden');
            statusResult.innerHTML = '';
            statusDeteksi = "Aman (Belum dicek AI)";
            
            // Kompresi ukuran gambar (Max Width 800px) agar upload cepat
            const MAX_WIDTH = 800;
            let width = uploadedImage.width;
            let height = uploadedImage.height;
            
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Gambar foto ke canvas
            ctx.drawImage(uploadedImage, 0, 0, width, height);
        }
        uploadedImage.src = event.target.result;
    }
    reader.readAsDataURL(file);
});

// 4. EVENT: SIMULASI DETEKSI AI
btnDeteksi.addEventListener('click', function() {
    if (!uploadedImage.src) return;
    
    // Refresh canvas ke gambar awal (menghapus kotak jika diklik 2x)
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    
    // Konfigurasi Styling Kotak Deteksi
    ctx.strokeStyle = '#ED1C24'; // Merah Alfamidi
    ctx.lineWidth = canvas.width * 0.01; 
    
    // Menggambar kotak secara acak di area tengah (Simulasi)
    const boxX = canvas.width * 0.3;
    const boxY = canvas.height * 0.3;
    const boxWidth = canvas.width * 0.35;
    const boxHeight = canvas.height * 0.35;

    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Menggambar background teks peringatan
    ctx.fillStyle = '#ED1C24';
    const fontSize = canvas.width * 0.04;
    ctx.fillRect(boxX, boxY - fontSize - 10, canvas.width * 0.45, fontSize + 10);

    // Menuliskan teks di dalam background merah
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillText('⚠ Tidak Layak Display', boxX + 5, boxY - 10);

    // Update Status di layar
    statusDeteksi = "Terdeteksi 1 Item Tidak Layak";
    statusResult.innerHTML = `<span class="text-red-600">${statusDeteksi}</span>`;
});

// 5. EVENT: SUBMIT FORM KE GOOGLE SHEETS
checklistForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah halaman reload
    
    // Ubah UI tombol menjadi loading
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = 'Mengirim Laporan... ⏳';
    btnSubmit.disabled = true;
    btnSubmit.classList.replace('bg-green-600', 'bg-gray-400');

    // Ambil gambar dari canvas menjadi text Base64 (Quality 0.7 = 70%)
    const base64Image = canvas.width > 0 ? canvas.toDataURL('image/jpeg', 0.7) : null;

    // Susun data yang akan dikirim (Format JSON)
    const payload = {
        toko: inputToko.value,
        pic: inputPIC.value,
        catatan: inputCatatan.value,
        status: statusDeteksi,
        imageBase64: base64Image
    };

    // Proses pengiriman melalui Fetch API ke URL Google Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        // Content-Type di-set text/plain untuk menghindari error CORS preflight di Google
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success') {
            alert('Laporan berhasil disubmit!\nData masuk ke Google Sheets & Foto tersimpan di Drive.');
            
            // Reset Form dan UI
            checklistForm.reset();
            previewArea.classList.add('hidden');
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            statusResult.innerHTML = '';
            uploadedImage.src = ''; 
        } else {
            alert('Gagal mengirim data: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error Pengiriman:', error);
        alert('Terjadi kesalahan koneksi internet atau URL Script salah.');
    })
    .finally(() => {
        // Kembalikan tombol ke keadaan normal
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
        btnSubmit.classList.replace('bg-gray-400', 'bg-green-600');
    });
});
