const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4SNcXkV6eU_SuhTT0A80wRgr8mqHwjrDeEDqxZmQ51ZJoinWQNSCQ3vWjSVNaLQXC/exec"; // Ganti dengan URL deployment Anda

const state = {
    foto_display: null,
    foto_repack: null
};

// Fungsi Kompresi Gambar
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}

// Handle Upload & Preview
async function handlePhoto(inputId, prevId, badgeId, stateKey) {
    const input = document.getElementById(inputId);
    input.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const compressed = await compressImage(file);
            
            state[stateKey] = compressed;
            
            const prev = document.getElementById(prevId);
            prev.src = compressed;
            prev.style.display = 'block';
            document.getElementById(badgeId).style.display = 'block';
            
            updateProgress();
            validateForm();
        }
    });
}

handlePhoto('img-display', 'prev-display', 'badge-display', 'foto_display');
handlePhoto('img-repack', 'prev-repack', 'badge-repack', 'foto_repack');

// Progress Bar Logic
function updateProgress() {
    let score = 0;
    if (document.getElementById('pic_name').value) score += 20;
    if (document.getElementById('store_code').value) score += 20;
    if (document.querySelectorAll('.fresh-task:checked').length > 0) score += 20;
    if (state.foto_display) score += 20;
    if (state.foto_repack) score += 20;
    
    document.getElementById('fill-progress').style.width = score + "%";
}

// Validation
function validateForm() {
    const name = document.getElementById('pic_name').value;
    const store = document.getElementById('store_code').value;
    const tasks = document.querySelectorAll('.fresh-task:checked').length;
    const btn = document.getElementById('btn-submit');
    
    btn.disabled = !(name && store && tasks > 0 && state.foto_display && state.foto_repack);
}

// Event Listeners
document.getElementById('pic_name').oninput = () => { updateProgress(); validateForm(); };
document.getElementById('store_code').oninput = () => { updateProgress(); validateForm(); };
document.querySelectorAll('.fresh-task').forEach(t => t.onchange = () => { updateProgress(); validateForm(); });

// Submit Logic
document.getElementById('btn-submit').onclick = async () => {
    Swal.fire({
        title: 'Mengirim...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const selectedTasks = Array.from(document.querySelectorAll('.fresh-task:checked')).map(t => t.value);

    const payload = {
        pic: document.getElementById('pic_name').value,
        toko: document.getElementById('store_code').value,
        aktivitas: selectedTasks.join(", "),
        foto_display: state.foto_display,
        foto_repack: state.foto_repack
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        Swal.fire('Berhasil!', 'Laporan Fresh telah tersimpan.', 'success')
            .then(() => location.reload());
            
    } catch (error) {
        Swal.fire('Error', 'Gagal mengirim data.', 'error');
    }
};
