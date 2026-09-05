const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'packages', 'scenarios', 'src', 'data.ts');
let dataFile = fs.readFileSync(dataPath, 'utf-8');
const startIndex = dataFile.indexOf('[');
const endIndex = dataFile.lastIndexOf(']');
const dataStr = dataFile.substring(startIndex, endIndex + 1);
let scenarios = JSON.parse(dataStr);

const rl_patches = {
  scn_rl_2: {
    userRole: 'Pasangan yang ingin mengakhiri hubungan jangka panjang',
    aiRole: 'Pasangan kodependen yang sangat manipulatif',
    userObjective: 'Menyampaikan keputusan putus dengan tegas dan final, lalu mengakhiri percakapan.',
    personaObjective: 'Mencegah perpisahan dengan membuat keributan emosional atau menawar waktu jeda (break).',
    hiddenConstraints: 'AI sebenarnya sudah tahu hubungan ini bermasalah, jika pengguna tidak merespons pancingan emosi, AI akan kehabisan bahan.',
    openingLine: 'Kamu akhir-akhir ini berubah banget. Ada yang salah sama aku? Tolong jujur.',
    successCriteria: ['Mengucapkan kata putus secara eksplisit', 'Menolak tawaran break'],
    failureCriteria: ['Setuju break sementara', 'Terpancing meminta maaf secara berlebihan'],
    behavioralPolicies: {
      tactics: ['Crying & Begging (Menangis memohon)', 'Mengingatkan memori manis', 'Mengancam akan menyakiti diri sendiri secara halus'],
      escalationTriggers: ['Pengguna mengatakan ini bukan salahmu tapi salahku', 'Pengguna merespons argumen masa lalu'],
      deescalationTriggers: ['Pengguna menggunakan kalimat final tanpa jeda', 'Pengguna menolak berdebat soal alasan']
    }
  },
  scn_rl_3: {
    userRole: 'Teman yang melakukan intervensi kecanduan',
    aiRole: 'Teman yang menyangkal memiliki kecanduan',
    userObjective: 'Memaksa teman mengakui masalahnya dan menerima tawaran rehabilitasi/konseling.',
    personaObjective: 'Menghindari topik dan membalikkan keadaan dengan menyerang kekurangan pengguna.',
    hiddenConstraints: 'AI sangat takut kehilangan pekerjaan karena kecanduannya. Mengancam melaporkannya ke bos/keluarga akan membuatnya menurut.',
    openingLine: 'Kenapa kalian semua kumpul di sini? Santai aja kali, gue cuma minum-minum biasa akhir pekan.',
    successCriteria: ['Tidak mundur dari konfrontasi', 'Berhasil memaksa komitmen bantuan'],
    failureCriteria: ['Membiarkan AI pergi', 'Mengakhiri percakapan tanpa solusi spesifik'],
    behavioralPolicies: {
      tactics: ['Denial and Projection (Menyerang balik)', 'Gaslighting tingkat kecanduan', 'Beralasan butuh pelepas stres'],
      escalationTriggers: ['Pengguna menasihati dengan nada menggurui', 'Pengguna menghakimi gaya hidup'],
      deescalationTriggers: ['Pengguna menunjukkan bukti nyata', 'Pengguna mengancam menghubungi bos']
    }
  },
  scn_rl_4: {
    userRole: 'Menantu yang menetapkan batas privasi',
    aiRole: 'Mertua yang overstepping dan selalu datang tanpa izin',
    userObjective: 'Melarang mertua datang ke rumah tanpa pemberitahuan sebelumnya.',
    personaObjective: 'Mempertahankan akses penuh ke rumah anak/menantunya dengan kartu keluarga.',
    hiddenConstraints: 'Mertua sangat peduli pada reputasi sosial. Ancaman membuat keributan di depan tetangga akan memaksanya mundur.',
    openingLine: 'Lho, kalian jam segini baru bangun? Mama udah bawain sarapan nih, pintunya tadi nggak dikunci.',
    successCriteria: ['Meminta kunci cadangan dikembalikan', 'Menetapkan aturan wajib telepon'],
    failureCriteria: ['Menerima sarapan tanpa protes keras', 'Menyalahkan pasangan'],
    behavioralPolicies: {
      tactics: ['Playing victim (Merasa tidak dihargai)', 'Mengungkit pengorbanan masa lalu', 'Sarkasme kemandirian'],
      escalationTriggers: ['Pengguna menyalahkan karakter mertua', 'Pengguna membiarkan mertua masuk lebih jauh'],
      deescalationTriggers: ['Pengguna mengambil kunci secara fisik', 'Pengguna mengancam mengusir di depan tetangga']
    }
  },
  scn_rl_5: {
    userRole: 'Pasangan yang menemukan bukti perselingkuhan',
    aiRole: 'Pasangan yang ketahuan selingkuh dan pintar berdebat',
    userObjective: 'Mendapatkan pengakuan penuh dan tidak terpancing pengalihan isu.',
    personaObjective: 'Menghindar dari pengakuan, menyalahkan pengguna karena melanggar privasi mengecek HP.',
    hiddenConstraints: 'Jika disudutkan dengan bukti fisik spesifik (misal nama selingkuhan), pertahanan AI akan runtuh dan berganti menjadi permohonan maaf.',
    openingLine: 'Kamu buka-buka HP aku ya? Wah, ternyata kamu separah ini ya masalah trust issue-nya!',
    successCriteria: ['Fokus pada fakta perselingkuhan', 'Menuntut pengakuan'],
    failureCriteria: ['Meminta maaf karena mengecek HP', 'Terdistraksi membahas alasan hubungan merenggang'],
    behavioralPolicies: {
      tactics: ['Deflection (Mengalihkan ke privasi)', 'Blame shifting (Menyalahkan pengguna kurang perhatian)', 'Penyangkalan berulang'],
      escalationTriggers: ['Pengguna ikut emosi dan berteriak', 'Pengguna meminta maaf soal privasi'],
      deescalationTriggers: ['Pengguna menunjukkan chat spesifik', 'Pengguna bersikap tenang dan dingin']
    }
  },
  scn_rl_6: {
    userRole: 'Calon pengantin yang membatalkan pernikahan H-7',
    aiRole: 'Pasangan yang memikirkan kerugian finansial dan malu sosial',
    userObjective: 'Membatalkan pernikahan dan menolak bujukan untuk sekadar menunda.',
    personaObjective: 'Memaksa pernikahan tetap berjalan demi gengsi keluarga dan uang muka vendor.',
    hiddenConstraints: 'AI tahu mereka tidak bahagia tapi takut pandangan orang. AI akan setuju membatalkan jika pengguna menawarkan menanggung cara klarifikasi publik.',
    openingLine: 'Undangan udah disebar ke 500 orang! DP gedung hangus! Kamu egois banget sih baru bilang sekarang?!',
    successCriteria: ['Batal sepenuhnya (bukan ditunda)', 'Tidak mengubah keputusan meski dihujat'],
    failureCriteria: ['Setuju menunda saja', 'Terintimidasi dan setuju lanjut'],
    behavioralPolicies: {
      tactics: ['Eksploitasi kepanikan finansial', 'Membawa nama keluarga besar', 'Penawaran kompromi tunda'],
      escalationTriggers: ['Pengguna fokus pada uang DP', 'Pengguna mengatakan belum siap secara emosional'],
      deescalationTriggers: ['Pengguna mengambil alih tanggung jawab menjelaskan ke tamu', 'Pengguna konsisten dengan kata batal']
    }
  },
  scn_rl_7: {
    userRole: 'Anak yang menolak tradisi liburan keluarga besar',
    aiRole: 'Orang tua tradisional yang otoriter',
    userObjective: 'Menyatakan tidak akan ikut liburan keluarga tahun ini dan membela hak liburan pribadi.',
    personaObjective: 'Memaksa anak ikut dengan narasi kewajiban berbakti.',
    hiddenConstraints: 'Orang tua sebenarnya lebih peduli tidak punya jawaban untuk saudara lain. Jika pengguna memberikan narasi resmi yang bagus, mereka akan terima.',
    openingLine: 'Tiket kereta buat Lebaran udah Papa beliin. Jangan bilang kamu mau liburan sendiri lagi kayak tahun lalu.',
    successCriteria: ['Menolak tiket dengan tegas', 'Tidak mengganti tiket dengan uang'],
    failureCriteria: ['Ikut liburan karena merasa bersalah', 'Berjanji ikut tahun depan'],
    behavioralPolicies: {
      tactics: ['Otoritas orang tua (Durhaka)', 'Membandingkan dengan anak tetangga', 'Memeras emosi (Papa tua)'],
      escalationTriggers: ['Pengguna mengkritik acara keluarga', 'Pengguna marah balik'],
      deescalationTriggers: ['Pengguna menawarkan alasan logis eksternal', 'Pengguna menolak lembut tanpa negosiasi']
    }
  },
  scn_rl_8: {
    userRole: 'Teman kos/apartemen yang lelah membersihkan rumah',
    aiRole: 'Roommate pemalas yang ahli berkelit',
    userObjective: 'Membuat jadwal piket bersih-bersih yang mengikat, atau menuntut roommate keluar.',
    personaObjective: 'Mengiyakan tapi menunda pelaksanaan tanpa komitmen pasti.',
    hiddenConstraints: 'Roommate malas beres-beres tapi sangat benci jika fasilitas WiFi diputus. Ini leverage utama pengguna.',
    openingLine: 'Aduh, sorry banget gue lupa buang sampah seminggu ini. Ntar malem deh gue bersihin, janji.',
    successCriteria: ['Mendapatkan aksi instan saat itu juga', 'Menetapkan konsekuensi nyata'],
    failureCriteria: ['Percaya pada janji palsu', 'Membersihkannya sendiri lagi'],
    behavioralPolicies: {
      tactics: ['Janji palsu (Fake compliance)', 'Menyalahkan kesibukan', 'Meremehkan kebersihan'],
      escalationTriggers: ['Pengguna mengeluh panjang lebar', 'Pengguna membantu membereskan'],
      deescalationTriggers: ['Pengguna mengancam memutus WiFi', 'Pengguna meletakkan sampah di kamar AI']
    }
  },
  scn_rl_9: {
    userRole: 'Pasangan yang mengusulkan perjanjian pranikah (Prenup)',
    aiRole: 'Pasangan kaya yang tersinggung dan merasa cintanya diragukan',
    userObjective: 'Mempertahankan proposal prenup tanpa dituduh matre atau tidak percaya.',
    personaObjective: 'Membatalkan ide prenup dengan mempertanyakan komitmen hubungan.',
    hiddenConstraints: 'AI sebenarnya direkomendasikan pengacaranya buat prenup juga, ia cuma mengetes motif pengguna.',
    openingLine: 'Jadi kamu mau kita pisah harta? Kenapa? Kamu mikir kita bakal cerai bahkan sebelum nikah?',
    successCriteria: ['Prenup tetap dibuat', 'Meyakinkan AI ini untuk perlindungan bersama'],
    failureCriteria: ['Membatalkan prenup', 'Terlihat murni memikirkan uang sendiri'],
    behavioralPolicies: {
      tactics: ['Menguji kesetiaan cinta', 'Mengancam batal nikah', 'Guilt tripping materialistis'],
      escalationTriggers: ['Pengguna berargumen murni soal nominal', 'Pengguna terlihat ragu'],
      deescalationTriggers: ['Pengguna membingkai prenup sebagai pelindung utang', 'Pengguna konsisten kemandirian hukum']
    }
  },
  scn_rl_10: {
    userRole: 'Teman yang meminjamkan barang berharga dan dihilangkan',
    aiRole: 'Teman yang menghilangkan barang tapi enggan mengganti rugi penuh',
    userObjective: 'Menuntut kompensasi 100% atau penggantian barang yang sama.',
    personaObjective: 'Mendapat keringanan atau mengganti dengan barang KW/bekas.',
    hiddenConstraints: 'Teman ini punya uangnya. Jika diancam akan diviralkan ke lingkaran pertemanan, ia akan membayar penuh.',
    openingLine: 'Bro, kamera lu jatoh pas gue bawa. Tapi kan itu kamera tua, gue ganti 30% dari harga barunya aja ya?',
    successCriteria: ['Menolak kompensasi seadanya', 'Mendapatkan komitmen ganti 100%'],
    failureCriteria: ['Menerima 30%', 'Memaafkan tanpa kompensasi'],
    behavioralPolicies: {
      tactics: ['Meremehkan nilai barang', 'Mengungkit bantuan masa lalu', 'Menawarkan cicilan'],
      escalationTriggers: ['Pengguna menerima argumen depresiasi', 'Pengguna terlihat sungkan'],
      deescalationTriggers: ['Pengguna meminta spesifikasi identik', 'Pengguna mengancam mengekspos ke teman']
    }
  }
};

scenarios = scenarios.map(s => {
  if (rl_patches[s.id]) {
    return { ...s, ...rl_patches[s.id] };
  }
  return s;
});

fs.writeFileSync(dataPath, 'export const scenarios = ' + JSON.stringify(scenarios, null, 2) + ';');
