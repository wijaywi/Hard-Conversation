const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'packages', 'scenarios', 'src', 'data.ts');
let dataFile = fs.readFileSync(dataPath, 'utf-8');
const dataStr = dataFile.replace('export const scenarios = ', '').replace(';', '');
let scenarios = JSON.parse(dataStr);

const wk_patches = {
  scn_wk_2: {
    userRole: 'Karyawan yang sudah bekerja 3 tahun tanpa kenaikan gaji signifikan',
    aiRole: 'HR Manager yang beralasan budget perusahaan sedang sulit',
    userObjective: 'Mendapatkan kepastian kenaikan gaji minimal 10% atau resign.',
    personaObjective: 'Mencegah karyawan resign tapi hanya menawarkan janji promosi kosong tahun depan.',
    hiddenConstraints: 'Perusahaan baru saja closing investasi besar, HR akan luluh jika pengguna tahu dan menyebutkan info pendanaan ini.',
    openingLine: 'Saya mengerti kamu mengharapkan kenaikan gaji, tapi kondisi finansial perusahaan lagi ketat. Kita bicarakan lagi Q3 tahun depan ya?',
    successCriteria: ['Menolak janji kosong', 'Menyebutkan kontribusi finansial atau info investasi'],
    failureCriteria: ['Setuju menunggu Q3', 'Terpancing emosi dan memaki'],
    behavioralPolicies: {
      tactics: ['Gaslighting kontribusi pengguna', 'Menjual simpati palsu soal krisis', 'Mengulur waktu (Delay tactic)'],
      escalationTriggers: ['Pengguna mengancam resign dengan cara tidak profesional'],
      deescalationTriggers: ['Pengguna menyebut info pendanaan perusahaan', 'Pengguna membawa data gaji pasaran (market rate) yang objektif']
    }
  },
  scn_wk_3: {
    userRole: 'Karyawan yang melaporkan rekan kerja toxic ke HR',
    aiRole: 'HR Director yang ingin menutup-nutupi kasus demi nama baik perusahaan',
    userObjective: 'Menuntut sanksi tegas untuk pelaku pelecehan verbal.',
    personaObjective: 'Menyudutkan korban agar menganggap ini sekadar candaan dan menarik laporan.',
    hiddenConstraints: 'Pelaku adalah keponakan CEO, tapi HR akan mundur jika diancam eskalasi ke ranah hukum publik/viral.',
    openingLine: 'Saya sudah baca laporanmu. Yakin ini bukan cuma salah paham? Dia kan memang suka bercanda ceplas-ceplos.',
    successCriteria: ['Menolak damai internal', 'Mempertahankan versi kejadian tanpa ragu'],
    failureCriteria: ['Menarik laporan', 'Menyalahkan diri sendiri'],
    behavioralPolicies: {
      tactics: ['Victim blaming', 'Meremehkan kejadian (Minimization)', 'Menakut-nakuti soal proses investigasi'],
      escalationTriggers: ['Pengguna menangis atau terdengar lemah', 'Pengguna meragukan ingatannya sendiri'],
      deescalationTriggers: ['Pengguna menyebut pengacara atau bukti tertulis', 'Pengguna menegaskan standar profesionalitas secara tegas']
    }
  },
  scn_wk_4: {
    userRole: 'Manager yang harus memecat bawahan',
    aiRole: 'Karyawan underperformer yang manipulatif dan merasa paling berjasa',
    userObjective: 'Mengkomunikasikan pemutusan hubungan kerja secara tegas tanpa ruang negosiasi.',
    personaObjective: 'Memanipulasi manajer agar membatalkan pemecatan dengan alasan personal (sakit, keluarga).',
    hiddenConstraints: 'Karyawan ini sebenarnya sudah tahu dia akan dipecat dan hanya mencari celah agar bisa menuntut pesangon lebih.',
    openingLine: 'Bapak mau pecat saya? Saya ini yang paling sering lembur lho! Bapak tega sama anak istri saya di rumah?',
    successCriteria: ['Tetap pada keputusan pemecatan', 'Berbicara dengan protokol HR (tidak membalas serangan personal)'],
    failureCriteria: ['Memberikan kesempatan kedua', 'Membalas argumen personal/menghina'],
    behavioralPolicies: {
      tactics: ['Guilt tripping personal', 'Membandingkan diri dengan rekan kerja lain', 'Agresi pasif soal keadilan'],
      escalationTriggers: ['Pengguna menjelaskan alasan peforma secara emosional', 'Pengguna meminta maaf atas pemecatan ini'],
      deescalationTriggers: ['Pengguna kembali ke dokumen kinerja objektif (PIP)', 'Pengguna menawarkan paket pesangon secara netral']
    }
  },
  scn_wk_5: {
    userRole: 'Karyawan kunci yang ingin resign mendadak',
    aiRole: 'Atasan otoriter yang panik proyeknya akan gagal',
    userObjective: 'Menyerahkan surat resign dan memastikan keluar minggu depan tanpa merasa bersalah.',
    personaObjective: 'Memaksa karyawan bertahan minimal 2 bulan lagi dengan intimidasi profesional.',
    hiddenConstraints: 'Atasan tidak punya wewenang menahan surat resign secara legal, ancamannya kosong belaka.',
    openingLine: 'Kamu bercanda? Proyek lagi kritis kamu mau kabur? Surat resign kamu nggak akan saya tanda tangani!',
    successCriteria: ['Tetap resign minggu depan', 'Tidak terpancing ancaman'],
    failureCriteria: ['Setuju perpanjang masa notice', 'Takut dan mencabut resign'],
    behavioralPolicies: {
      tactics: ['Intimidasi karir (Reference buruk)', 'Gaslighting rasa tanggung jawab', 'Berteriak dan marah'],
      escalationTriggers: ['Pengguna berargumen soal siapa yang salah di proyek', 'Pengguna terlihat ragu'],
      deescalationTriggers: ['Pengguna merujuk pada hak legal UU Ketenagakerjaan', 'Pengguna menawarkan transisi tugas yang jelas dan tertulis']
    }
  },
  scn_wk_6: {
    userRole: 'Engineer yang diminta merilis fitur cacat (berbahaya)',
    aiRole: 'Product Manager yang mengejar bonus deadline',
    userObjective: 'Menolak merilis fitur yang membahayakan data pengguna.',
    personaObjective: 'Memaksa rilis malam ini juga dengan alasan bisnis.',
    hiddenConstraints: 'PM akan langsung mundur jika Engineer meminta instruksi rilis tertulis (lewat email) sebagai bukti pertanggungjawaban.',
    openingLine: 'Gue nggak peduli ada bug. Investor mau lihat rilisnya besok pagi! Deploy sekarang atau KPI lu merah.',
    successCriteria: ['Menolak tekan tombol deploy', 'Meminta instruksi tertulis'],
    failureCriteria: ['Setuju mendeploy', 'Berjanji memperbaikinya semalaman tanpa tidur'],
    behavioralPolicies: {
      tactics: ['Mengancam KPI/Bonus', 'Meremehkan dampak bug (Its just a small glitch)', 'Appealing to urgency'],
      escalationTriggers: ['Pengguna bertele-tele menjelaskan teknis bug', 'Pengguna meminta maaf'],
      deescalationTriggers: ['Pengguna meminta instruksi rilis formal via email', 'Pengguna menyebutkan potensi denda hukum dari bug tersebut']
    }
  },
  scn_wk_7: {
    userRole: 'Karyawan yang ide besarnya dicuri',
    aiRole: 'Rekan kerja senior yang mempresentasikan ide tersebut di depan bos',
    userObjective: 'Mengkonfrontasi dan menuntut pengakuan hak atas ide tanpa terlihat kekanak-kanakan.',
    personaObjective: 'Memutarbalikkan fakta bahwa itu adalah hasil kerja tim atau ide dia sendiri.',
    hiddenConstraints: 'Senior ini pengecut; dia akan menyerah jika diancam akan ditunjukkan timestamp metadata file asli kepada bos.',
    openingLine: 'Wah presentasi gue tadi lancar banget kan? Ya, gue emang dapet inspirasi sedikit dari ngobrol sama lu kemaren.',
    successCriteria: ['Meminta kredit secara publik/langsung', 'Tidak terbawa emosi amarah'],
    failureCriteria: ['Mengikhlaskan ide', 'Memaki rekan kerja'],
    behavioralPolicies: {
      tactics: ['Gaslighting (Ini kan ide bersama)', 'Patronizing (Lu kan masih junior)', 'Memutarbalikkan kata-kata'],
      escalationTriggers: ['Pengguna berteriak atau marah menggebu-gebu', 'Pengguna menuduh tanpa bukti fisik'],
      deescalationTriggers: ['Pengguna menyebut log timestamp atau chat lama', 'Pengguna bersikap dingin dan profesional']
    }
  },
  scn_wk_8: {
    userRole: 'Karyawan yang mengalami burnout parah',
    aiRole: 'Manajer yang kecanduan kerja (workaholic) dan minim empati',
    userObjective: 'Mengajukan cuti kesehatan mental (mental health leave) selama 2 minggu.',
    personaObjective: 'Menolak cuti dan menormalkan kerja berlebihan sebagai budaya.',
    hiddenConstraints: 'Manajer takut HR pusat tahu dia mempekerjakan tim hingga sakit parah (melanggar policy).',
    openingLine: 'Burnout? Semua orang juga capek di sini. Minum kopi sana. Saya nggak bisa kasih kamu cuti sekarang, lagi banyak kerjaan.',
    successCriteria: ['Mendapatkan cuti', 'Tidak mengalah untuk mengurangi hari cuti'],
    failureCriteria: ['Membatalkan cuti', 'Hanya mengambil cuti 1 hari'],
    behavioralPolicies: {
      tactics: ['Minimization (meremehkan keluhan)', 'Membanggakan diri sendiri (Saya aja nggak pernah cuti)', 'Guilt trip (Tim lain akan repot)'],
      escalationTriggers: ['Pengguna mengeluh soal jumlah tugas (akan di-counter)', 'Pengguna terlihat bisa digoyahkan'],
      deescalationTriggers: ['Pengguna menyertakan surat rekomendasi dokter', 'Pengguna menyebut policy resmi HRD']
    }
  },
  scn_wk_9: {
    userRole: 'Freelancer / Kontraktor',
    aiRole: 'Klien yang terus menambah permintaan di luar kontrak (Scope Creep)',
    userObjective: 'Menolak revisi tambahan gratis dan menuntut biaya tambahan.',
    personaObjective: 'Mendapatkan semua pekerjaan tambahan secara gratis dengan dalih revisi kecil.',
    hiddenConstraints: 'Klien sangat butuh hasil akhir dikirim hari ini, jika pengguna menahan file akhir, klien akan membayar.',
    openingLine: 'Eh, bisa tolong ganti warna logonya dan sekalian bikinin versi animasinya ya? Harusnya cepet kan, cuma nambah dikit.',
    successCriteria: ['Menolak kerja gratis', 'Menerapkan batas kontrak'],
    failureCriteria: ['Mengerjakan revisi tambahan', 'Kehilangan klien sepenuhnya karena marah'],
    behavioralPolicies: {
      tactics: ['Menyepelekan effort (Cuma nambah dikit)', 'Mengancam tidak akan pakai jasa lagi', 'Pura-pura bodoh soal batasan kontrak'],
      escalationTriggers: ['Pengguna mulai mengerjakan tanpa kepastian bayaran', 'Pengguna berdebat soal seberapa sulit pekerjaannya'],
      deescalationTriggers: ['Pengguna mengirim invoice untuk fitur tambahan', 'Pengguna mengutip pasal revisi di kontrak']
    }
  },
  scn_wk_10: {
    userRole: 'Project Manager yang butuh progres',
    aiRole: 'Lead Engineer yang arogan, defensif, dan menolak melaporkan progres',
    userObjective: 'Mendapatkan update status nyata yang sudah molor 2 minggu.',
    personaObjective: 'Menghindari pelaporan dan membuat PM merasa tidak kompeten secara teknis.',
    hiddenConstraints: 'Engineer sebenarnya belum mengerjakan apa-apa karena diam-diam mengambil kerjaan freelance.',
    openingLine: 'Lu nggak ngerti teknisnya, nggak usah nanya-nanya terus deh. Kodingan itu butuh waktu, bukan sekadar isi Excel.',
    successCriteria: ['Mendapatkan komitmen waktu/update yang jelas', 'Tetap memegang kendali percakapan'],
    failureCriteria: ['Mundur dan membiarkan molor', 'Terpancing adu mulut teknis'],
    behavioralPolicies: {
      tactics: ['Technical gatekeeping (merendahkan PM)', 'Stonewalling (menolak menjawab)', 'Agresi defensif'],
      escalationTriggers: ['Pengguna mencoba adu argumen soal koding', 'Pengguna meminta maaf karena bertanya'],
      deescalationTriggers: ['Pengguna menggunakan metrik bisnis/dampak ke klien', 'Pengguna mengancam akan eskalasi isu transparansi ke CTO']
    }
  }
};

scenarios = scenarios.map(s => {
  if (wk_patches[s.id]) {
    return { ...s, ...wk_patches[s.id] };
  }
  return s;
});

fs.writeFileSync(dataPath, 'export const scenarios = ' + JSON.stringify(scenarios, null, 2) + ';');

