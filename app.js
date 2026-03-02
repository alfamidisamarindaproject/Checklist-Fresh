// GANTI DENGAN URL APPS SCRIPT ANDA
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwoz-Nw43oPupfnTxDvE5CQ4lqzZNPGfssmvuNMxkTu6rJwONMKDx5dhbCQ-iBAX0n9/exec'; 

const photoInput = document.getElementById('photoInput');
const imagePreview = document.getElementById('imagePreview');
const previewWrapper = document.getElementById('previewWrapper');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imageContainer = document.getElementById('imageContainer');
const submitBtn = document.getElementById('submitBtn');
let currentStatus = "Belum Dipilih";
let markers = [];

// 1. Handling Upload & Preview
photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.src = event.target.result;
            previewWrapper.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
});

// 2. Fitur Tap to Mark (Menandai buah tidak layak)
imageContainer.addEventListener('click', function(e) {
    const rect = imageContainer.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Tambah Marker Secara Visual
    const marker = document.createElement('div');
    marker.className = 'tap-marker';
    marker.style.left = x + '%';
    marker.style.top = y + '%';
    marker.innerHTML = '✕';
    imageContainer.appendChild(marker);
    
    markers.push({x, y});
    
    // Auto-set status ke Tidak Layak jika ada tanda
    setStatus('Tidak Layak');
});

// 3. Status Switcher UI
function setStatus(status) {
    currentStatus = status;
    const btnL = document.getElementById('btnLayak');
    const btnTL = document.getElementById('btnTidakLayak');

    if(status === 'Layak') {
        btnL.className = 'flex-1 py-3 rounded-2xl bg-green-500 border-green-500 text-white font-bold transition-all';
        btnTL.className = 'flex-1 py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-400 transition-all';
    } else {
        btnTL.className = 'flex-1 py-3 rounded-2xl bg-red-600 border-red-600 text-white font-bold transition-all';
        btnL.className = 'flex-1 py-3 rounded-2xl border-2 border-gray-100 font-bold text-gray-400 transition-all';
    }
}

// 4. Submit Data
document.getElementById('mainForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Gabungkan gambar asli dengan marker menggunakan Canvas sebelum kirim
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sedang Mengirim...";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;
    
    ctx.drawImage(imagePreview, 0, 0);
    
    // Gambar semua marker ke canvas agar tersimpan di Drive
    ctx.fillStyle = "red";
    ctx.strokeStyle = "white";
    ctx.lineWidth = canvas.width * 0.005;
    const radius = canvas.width * 0.02;

    markers.forEach(m => {
        const realX = (m.x / 100) * canvas.width;
        const realY = (m.y / 100) * canvas.height;
        
        ctx.beginPath();
        ctx.arc(realX, realY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

    const finalImage = canvas.toDataURL('image/jpeg', 0.6);

    const payload = {
        toko: document.getElementById('toko').value,
        pic: document.getElementById('pic').value,
        catatan: document.getElementById('catatan').value,
        status: currentStatus,
        imageBase64: finalImage
    };

    try {
        const resp = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk Apps Script
            body: JSON.stringify(payload)
        });
        alert('Laporan Terkirim! Terima kasih.');
        location.reload();
    } catch (err) {
        alert('Gagal mengirim laporan. Cek koneksi Anda.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = "KIRIM LAPORAN SEKARANG";
    }
});

document.getElementById('resetPhoto').addEventListener('click', () => {
    location.reload();
});
