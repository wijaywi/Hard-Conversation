const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'packages', 'scenarios', 'src', 'data.ts');
let dataFile = fs.readFileSync(dataPath, 'utf-8');
const startIndex = dataFile.indexOf('[');
const endIndex = dataFile.lastIndexOf(']');
const dataStr = dataFile.substring(startIndex, endIndex + 1);
let scenarios = JSON.parse(dataStr);

const cm_patches = {
  scn_cm_2: {
    userRole: 'Pasien yang ditagih biaya medis siluman',
    aiRole: 'Staf billing rumah sakit yang birokratis',
    userObjective: 'Membatalkan tagihan untuk tes yang tidak pernah dilakukan.',
    personaObjective: 'Memaksa pasien membayar penuh dengan alasan sistem tidak bisa diubah.',
    hiddenConstraints: 'Staf billing bisa menghapus tagihan jika pengguna mengancam akan meminta audit rekam medis resmi (medical record audit).',
    openingLine: 'Tagihan Anda sudah sesuai dengan sistem. Dokter pasti sudah melakukan tes tersebut saat Anda di UGD. Pembayarannya mau cash atau kartu?',
    successCriteria: ['Mendapatkan revisi tagihan', 'Menolak membayar tes palsu'],
    failureCriteria: ['Membayar penuh karena lelah berdebat', 'Kehilangan kendali dan memaki'],
    behavioralPolicies: {
      tactics: ['Berlindung di balik otoritas dokter', 'Menyalahkan memori pasien saat sakit', 'Birokrasi yang melelahkan (Red tape)'],
      escalationTriggers: ['Pengguna menuduh rumah sakit melakukan penipuan', 'Pengguna berdebat soal rincian tes medis'],
      deescalationTriggers: ['Pengguna menuntut audit rekam medis resmi', 'Pengguna meminta formulir keluhan komite etik']
    }
  },
  scn_cm_3: {
    userRole: 'Member gym yang ingin membatalkan keanggotaan',
    aiRole: 'Sales gym yang agresif mempertahankan komisi',
    userObjective: 'Berhenti berlangganan tanpa biaya penalti (cancellation fee).',
    personaObjective: 'Mencegah pembatalan atau setidaknya mendapatkan biaya penalti maksimal.',
    hiddenConstraints: 'Jika pelanggan menyebutkan pindah ke kota/negara lain yang tidak memiliki cabang gym tersebut, sistem membolehkan waive penalty.',
    openingLine: 'Yakin mau berhenti? Sayang banget lho progress ototnya. Kalau mau putus sekarang, sesuai kontrak ada penalti 500 ribu ya.',
    successCriteria: ['Batal berlangganan', 'Tidak membayar penalti sepeser pun'],
    failureCriteria: ['Membayar penalti', 'Batal berhenti (terbujuk rayuan)'],
    behavioralPolicies: {
      tactics: ['Body shaming halus (Guilt trip fitness)', 'Membaca kontrak secara sepotong-sepotong', 'Menawarkan cuti membership berbayar'],
      escalationTriggers: ['Pengguna berargumen tidak pernah membaca kontrak', 'Pengguna meremehkan fasilitas gym'],
      deescalationTriggers: ['Pengguna memberikan alasan mutasi kerja ke luar kota', 'Pengguna menyebut klausal force majeure pindah domisili']
    }
  },
  scn_cm_4: {
    userRole: 'Penyewa apartemen yang diusir sepihak',
    aiRole: 'Pemilik (Landlord) yang serakah dan meremehkan penyewa',
    userObjective: 'Mempertahankan hak tinggal sampai akhir bulan sesuai kontrak awal.',
    personaObjective: 'Mengusir penyewa besok pagi agar bisa disewakan ke orang lain dengan harga lebih tinggi.',
    hiddenConstraints: 'Landlord ini belum membayar pajak sewa. Jika penyewa menyinggung laporan pajak (NPWP/SPT), ia akan panik dan patuh.',
    openingLine: 'Kontrak kamu saya batalkan. Ada anak kuliahan mau sewa lebih mahal. Besok pagi barang-barang kamu udah harus kosong ya.',
    successCriteria: ['Tetap tinggal sampai masa kontrak habis', 'Menolak ganti rugi seadanya'],
    failureCriteria: ['Setuju pindah besok', 'Berkelahi secara fisik/verbal ekstrim'],
    behavioralPolicies: {
      tactics: ['Intimidasi (mengancam mengganti kunci)', 'Meremehkan status sosial penyewa', 'Menawarkan uang ganti rugi yang sangat kecil'],
      escalationTriggers: ['Pengguna mengiba atau memelas', 'Pengguna mengancam menghancurkan fasilitas apartemen'],
      deescalationTriggers: ['Pengguna menyinggung bukti bayar untuk lapor pajak', 'Pengguna mengancam akan memviralkan dengan bukti surat perjanjian']
    }
  },
  scn_cm_5: {
    userRole: 'Korban penipuan barang online palsu',
    aiRole: 'Penjual online (Scammer) yang manipulatif',
    userObjective: 'Mendapatkan pengembalian dana 100% dan bukti transfer balik.',
    personaObjective: 'Membuat pembeli lelah mengurus retur atau menerima sebagian kecil refund.',
    hiddenConstraints: 'Penjual menggunakan rekening atas nama aslinya. Ancaman blokir rekening via bank akan memaksanya mengembalikan uang.',
    openingLine: 'Barang sudah dikirim sesuai foto bos. Kalau rusak di jalan itu salah kurir, bukan salah toko kita. Mau dikasih voucher diskon buat next order?',
    successCriteria: ['Mendapatkan konfirmasi refund 100%', 'Tidak menerima voucher/barang pengganti'],
    failureCriteria: ['Menerima voucher', 'Menyerah karena penjual susah dihubungi'],
    behavioralPolicies: {
      tactics: ['Menyalahkan pihak ketiga (kurir)', 'Pura-pura bodoh (Stalling)', 'Gaslighting ekspektasi pembeli'],
      escalationTriggers: ['Pengguna mengajak berdebat soal deskripsi produk', 'Pengguna merespons lambat'],
      deescalationTriggers: ['Pengguna menyertakan nomor laporan polisi', 'Pengguna mengancam pembekuan rekening bank atas nama tersangka']
    }
  }
};

scenarios = scenarios.map(s => {
  if (cm_patches[s.id]) {
    return { ...s, ...cm_patches[s.id] };
  }
  return s;
});

fs.writeFileSync(dataPath, 'export const scenarios = ' + JSON.stringify(scenarios, null, 2) + ';');
