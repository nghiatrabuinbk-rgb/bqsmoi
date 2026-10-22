import { Room, UserAccount, CriterionConfig, AttendanceRecord, EvaluationRecord, DepartmentPermission, DutyAssignment } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_nghia',
    name: 'Nguyễn Trọng Nghĩa',
    role: 'admin',
    roleTitle: 'Trưởng Ban Quản sinh / Quản trị viên',
    phone: '0987.654.321',
    pin: '1234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'user_bgh_son',
    name: 'Trần Đình Sơn',
    role: 'bgh',
    roleTitle: 'Hiệu trưởng (BGH)',
    phone: '0912.345.678',
    pin: '1234',
  },
  {
    id: 'user_bgh_hoa',
    name: 'Lê Thị Hoa',
    role: 'bgh',
    roleTitle: 'Phó Hiệu trưởng (BGH)',
    phone: '0913.456.789',
    pin: '1234',
  },
  {
    id: 'user_gv_tu_hoc',
    name: 'Trần Hữu Đức',
    role: 'gv_tu_hoc_dem',
    roleTitle: 'Giáo viên trực tự học đêm (19h-20h30)',
    phone: '0905.555.666',
    pin: '1234',
  },
  {
    id: 'user_qs_lan',
    name: 'Nguyễn Thị Lan',
    role: 'thanh_vien_quan_sinh',
    roleTitle: 'Thành viên Ban Quản sinh',
    phone: '0905.888.999',
    pin: '1234',
  },
  {
    id: 'user_tpt_tung',
    name: 'Võ Thanh Tùng',
    role: 'tong_phu_trach',
    roleTitle: 'Tổng phụ trách Đội TNTP Hồ Chí Minh',
    phone: '0905.444.555',
    pin: '1234',
  },
  {
    id: 'user_doan_long',
    name: 'Nguyễn Văn Long',
    role: 'doan_thanh_nien',
    roleTitle: 'Bí thư Chi đoàn Thanh niên',
    phone: '0905.666.777',
    pin: '1234',
  },
  {
    id: 'user_tu_quan_nam',
    name: 'Đội Tự Quản Khu Nam',
    role: 'doi_tu_quan',
    roleTitle: 'Đội tự quản học sinh (Khu Nam)',
    pin: '1234',
  },
  {
    id: 'user_tu_quan_nu',
    name: 'Đội Tự Quản Khu Nữ',
    role: 'doi_tu_quan',
    roleTitle: 'Đội tự quản học sinh (Khu Nữ)',
    pin: '1234',
  },
  {
    id: 'user_tu_quan_truong',
    name: 'Hồ Văn Sang (Đội trưởng Tự Quản)',
    role: 'doi_tu_quan',
    roleTitle: 'Đội tự quản học sinh nội trú',
    pin: '1234',
  },
  {
    id: 'user_gv_tuan',
    name: 'Đinh Văn Tuấn',
    role: 'gv_phu_trach',
    roleTitle: 'Giáo viên phụ trách Khu Nam / P.01',
    assignedRoomIds: ['room_01', 'room_02'],
    phone: '0905.111.222',
    pin: '1234',
  },
  {
    id: 'user_gv_mo',
    name: 'Hồ Thị Mơ',
    role: 'gv_phu_trach',
    roleTitle: 'Giáo viên phụ trách Khu Nữ / P.13',
    assignedRoomIds: ['room_13', 'room_14'],
    phone: '0905.333.444',
    pin: '1234',
  },
  {
    id: 'user_gv_ngu_lai',
    name: 'Lê Văn Hùng',
    role: 'gv_ngu_lai',
    roleTitle: 'Giáo viên trực đêm ngủ lại',
    phone: '0905.777.888',
    pin: '1234',
  },
  {
    id: 'user_yte_thuy',
    name: 'Vũ Thị Thủy',
    role: 'y_te',
    roleTitle: 'Cán bộ Y tế học đường',
    phone: '0905.999.000',
    pin: '1234',
  },
  {
    id: 'user_thanhtra_sang',
    name: 'Huỳnh Văn Sang',
    role: 'thanh_tra',
    roleTitle: 'Trưởng Ban Thanh tra nhân dân',
    phone: '0905.222.333',
    pin: '1234',
  },
];

export const INITIAL_DEPARTMENT_PERMISSIONS: DepartmentPermission[] = [
  {
    department: 'admin',
    departmentName: 'Trưởng Ban Quản sinh (Thầy Nghĩa / Quản trị)',
    canMuc1: true,
    canMuc2: true,
    canMuc3: true,
    canMuc4: true,
    canMuc5: true,
  },
  {
    department: 'bgh',
    departmentName: 'Ban Giám Hiệu (BGH)',
    canMuc1: true,
    canMuc2: true,
    canMuc3: true,
    canMuc4: true,
    canMuc5: true,
  },
  {
    department: 'gv_tu_hoc_dem',
    departmentName: 'Giáo viên trực tự học đêm (19h-20h30)',
    canMuc1: true,
    canMuc2: false,
    canMuc3: false,
    canMuc4: true,
    canMuc5: false,
  },
  {
    department: 'thanh_vien_quan_sinh',
    departmentName: 'Thành viên Ban Quản sinh',
    canMuc1: true,
    canMuc2: true,
    canMuc3: true,
    canMuc4: true,
    canMuc5: true,
  },
  {
    department: 'tong_phu_trach',
    departmentName: 'Tổng phụ trách Đội',
    canMuc1: false,
    canMuc2: true,
    canMuc3: true,
    canMuc4: false,
    canMuc5: true,
  },
  {
    department: 'doan_thanh_nien',
    departmentName: 'Đoàn Thanh niên',
    canMuc1: false,
    canMuc2: false,
    canMuc3: true,
    canMuc4: true,
    canMuc5: true,
  },
  {
    department: 'doi_tu_quan',
    departmentName: 'Đội Tự Quản (Học sinh cán sự)',
    canMuc1: true,
    canMuc2: false,
    canMuc3: true,
    canMuc4: true,
    canMuc5: false,
  },
  {
    department: 'gv_phu_trach',
    departmentName: 'Giáo viên trực phòng / phụ trách',
    canMuc1: true,
    canMuc2: true,
    canMuc3: true,
    canMuc4: true,
    canMuc5: true,
  },
  {
    department: 'gv_ngu_lai',
    departmentName: 'Giáo viên trực đêm ngủ lại',
    canMuc1: false,
    canMuc2: false,
    canMuc3: false,
    canMuc4: true,
    canMuc5: false,
  },
  {
    department: 'y_te',
    departmentName: 'Cán bộ Y tế',
    canMuc1: false,
    canMuc2: false,
    canMuc3: true,
    canMuc4: false,
    canMuc5: false,
  },
  {
    department: 'thanh_tra',
    departmentName: 'Ban Thanh tra',
    canMuc1: true,
    canMuc2: true,
    canMuc3: true,
    canMuc4: true,
    canMuc5: true,
  },
];

export const INITIAL_DUTY_ASSIGNMENTS: DutyAssignment[] = [
  {
    id: 'duty_01',
    dayOfWeek: 'all',
    dayName: 'Tối T2 đến T5',
    targetCategory: 'muc1',
    categoryLabel: 'Mục 1: Điểm danh tự học đêm',
    department: 'gv_tu_hoc_dem',
    assignedPersonName: 'Thầy Trần Hữu Đức',
    assignedRoomScope: 'all',
    shiftTime: '19h00 - 20h30',
    notes: 'Điểm danh chuyên cần tại phòng, kiểm tra trật tự góc học tập',
  },
  {
    id: 'duty_02',
    dayOfWeek: 'all',
    dayName: 'Hàng ngày',
    targetCategory: 'muc2',
    categoryLabel: 'Mục 2: Điểm danh chính khóa',
    department: 'tong_phu_trach',
    assignedPersonName: 'Thầy Võ Thanh Tùng (TPT Đội)',
    assignedRoomScope: 'all',
    shiftTime: '07h00 - 07h30 & 13h30',
    notes: 'Nắm sĩ số tại lớp, liên hệ giáo viên chủ nhiệm và phòng nội trú',
  },
  {
    id: 'duty_03',
    dayOfWeek: 'all',
    dayName: 'Hàng ngày',
    targetCategory: 'muc3',
    categoryLabel: 'Mục 3: Chấm điểm Vệ sinh phòng ở',
    department: 'thanh_vien_quan_sinh',
    assignedPersonName: 'Cô Nguyễn Thị Lan & Cô Vũ Thị Thủy (Y tế)',
    assignedRoomScope: 'all',
    shiftTime: '06h30 - 07h00',
    notes: 'Chấm gấp chăn màn, quét dọn phòng, hành lang, có chụp ảnh',
  },
  {
    id: 'duty_04',
    dayOfWeek: 'all',
    dayName: 'Hàng ngày',
    targetCategory: 'muc3',
    categoryLabel: 'Mục 3: Đội tự quản hỗ trợ vệ sinh',
    department: 'doi_tu_quan',
    assignedPersonName: 'Đội Tự Quản Học Sinh Khu Nam & Nữ',
    assignedRoomScope: 'all',
    shiftTime: '06h15 - 06h45',
    notes: 'Nhắc nhở học sinh dọn dẹp vệ sinh trước giờ chào cờ và đi học',
  },
  {
    id: 'duty_05',
    dayOfWeek: 'all',
    dayName: 'Hàng ngày',
    targetCategory: 'muc4',
    categoryLabel: 'Mục 4: Chấm Nề nếp sinh hoạt & Ngủ đêm',
    department: 'gv_ngu_lai',
    assignedPersonName: 'Thầy Lê Văn Hùng',
    assignedRoomScope: 'all',
    shiftTime: '21h45 - 22h30',
    notes: 'Kiểm tra trật tự tắt đèn đi ngủ lúc 22h00',
  },
  {
    id: 'duty_06',
    dayOfWeek: 'T3',
    dayName: 'Chiều Thứ 3 & Thứ 5',
    targetCategory: 'muc5',
    categoryLabel: 'Mục 5: Chấp hành nội quy & Hoạt động tập thể',
    department: 'doan_thanh_nien',
    assignedPersonName: 'Thầy Nguyễn Văn Long (Bí thư Đoàn)',
    assignedRoomScope: 'all',
    shiftTime: '16h30 - 17h15',
    notes: 'Kiểm tra buổi lao động chăm sóc khuôn viên vườn hoa bán trú',
  },
];

// Helper to create sample students
const createSampleStudents = (roomIndex: number, gender: 'nam' | 'nu', count: number) => {
  const namNames = [
    'Hồ Văn Sang', 'Đinh Văn Kiên', 'ALăng Phúc', 'Zơrâm Bảo', 'Nguyễn Văn Nam',
    'Lê Quốc Huy', 'Hồ Văn Lộc', 'Phạm Quốc Cường', 'Đinh Văn Thắng', 'Trần Văn Đức',
    'Hồ Minh Hải', 'Nguyễn Tấn Đạt', 'Lê Hữu Nghĩa', 'ALăng Tuấn'
  ];
  const nuNames = [
    'Hồ Thị Mai', 'Đinh Thị Lan', 'ALăng Thị Diệu', 'Zơrâm Thị Hoa', 'Nguyễn Thị Hồng',
    'Lê Thị Thu', 'Hồ Thị Thảo', 'Phạm Thị Duyên', 'Đinh Thị Nguyệt', 'Trần Thị Mỹ',
    'Hồ Thị Yến', 'Nguyễn Thị Tuyết', 'Lê Thị Thu Thủy', 'ALăng Thị Oanh'
  ];
  const classes = ['6/1', '6/2', '7/1', '7/2', '8/1', '8/2', '9/1', '9/2'];

  const students = [];
  const sourceNames = gender === 'nam' ? namNames : nuNames;

  for (let i = 0; i < count; i++) {
    const baseName = sourceNames[i % sourceNames.length];
    const studentName = i >= sourceNames.length ? `${baseName} (${i + 1})` : baseName;
    const cls = classes[(roomIndex + i) % classes.length];
    students.push({
      id: `std_${gender}_${roomIndex}_${i + 1}`,
      name: studentName,
      gender,
      className: cls,
      isRoomLeader: i === 0,
      notes: i === 0 ? 'Trưởng phòng' : (i === 1 ? 'Phó phòng' : undefined),
    });
  }
  return students;
};

const TEACHER_NAMES = [
  'Thầy Đinh Văn Tuấn', 'Cô Hồ Thị Mơ', 'Thầy Trần Hữu Đức', 'Cô Nguyễn Thị Lan',
  'Thầy Lê Văn Hùng', 'Cô Phạm Thị Mai', 'Thầy Phan Đình Phùng', 'Cô ALăng Diệu',
  'Thầy Zơrâm Nam', 'Cô Bùi Thị Thanh', 'Thầy Huỳnh Văn Sang', 'Cô Hoàng Thị Yến',
  'Thầy Nguyễn Văn Long', 'Cô Vũ Thị Thủy', 'Thầy Võ Thanh Tùng', 'Thầy Nguyễn Trọng Nghĩa'
];

export const INITIAL_ROOMS: Room[] = Array.from({ length: 25 }, (_, index) => {
  const roomNumber = index + 1;
  const isMale = roomNumber <= 12; // 12 phòng nam (P.01 - P.12), 13 phòng nữ (P.13 - P.25)
  const code = `P.${roomNumber < 10 ? '0' + roomNumber : roomNumber}`;
  const gender = isMale ? 'nam' : 'nu';
  const count = 10 + ((roomNumber * 3) % 5); // 10 đến 14 học sinh mỗi phòng
  const teacherName = TEACHER_NAMES[index % TEACHER_NAMES.length];

  return {
    id: `room_${roomNumber < 10 ? '0' + roomNumber : roomNumber}`,
    code,
    name: `Phòng ${roomNumber < 10 ? '0' + roomNumber : roomNumber} (${isMale ? 'Khu Nam' : 'Khu Nữ'})`,
    gender,
    managerTeacherId: `teacher_${index + 1}`,
    managerTeacherName: teacherName,
    capacity: 14,
    students: createSampleStudents(roomNumber, gender, count),
    studentCountManual: count,
    note: isMale ? `Dãy nhà nam tầng ${roomNumber <= 6 ? 1 : 2}` : `Dãy nhà nữ tầng ${roomNumber <= 19 ? 1 : 2}`,
  };
});

export const INITIAL_CRITERIA: CriterionConfig[] = [
  {
    id: 'crit_muc1',
    category: 'muc1_tu_hoc',
    code: 'MUC_01',
    name: 'Mục 1: Điểm danh tự học đêm (19h00 - 20h30)',
    description: 'Kiểm tra sĩ số học sinh tự học ban đêm từ tối thứ 2 đến thứ 5. Vắng có phép không trừ điểm. Vắng không phép trừ điểm thi đua phòng.',
    defaultBaseScore: 100,
    defaultPenalty: 5, // 5 điểm / học sinh vắng không phép
    isActive: true,
    canUploadProof: false,
    applicableRoles: ['admin', 'bgh', 'gv_tu_hoc_dem', 'thanh_vien_quan_sinh', 'doi_tu_quan'],
  },
  {
    id: 'crit_muc2',
    category: 'muc2_chinh_khoa',
    code: 'MUC_02',
    name: 'Mục 2: Điểm danh đi học chính khóa',
    description: 'Kiểm tra chuyên cần đi học chính khóa buổi sáng và chiều. Vắng không phép trừ điểm thi đua phòng.',
    defaultBaseScore: 100,
    defaultPenalty: 5,
    isActive: true,
    canUploadProof: false,
    applicableRoles: ['admin', 'bgh', 'gv_phu_trach', 'tong_phu_trach', 'thanh_vien_quan_sinh'],
  },
  {
    id: 'crit_muc3',
    category: 'muc3_ve_sinh',
    code: 'MUC_03',
    name: 'Mục 3: Chấm điểm Vệ sinh và Nề nếp phòng ở',
    description: 'Chấm điểm vệ sinh phòng, hành lang, sân trước, gầm giường, gấp chăn màn mùng chiếu, nhà vệ sinh. Có tải ảnh minh chứng kèm thời gian.',
    defaultBaseScore: 100,
    defaultPenalty: 5,
    isActive: true,
    canUploadProof: true,
    applicableRoles: ['admin', 'bgh', 'gv_phu_trach', 'y_te', 'thanh_tra', 'thanh_vien_quan_sinh', 'doi_tu_quan'],
  },
  {
    id: 'crit_muc4',
    category: 'muc4_ne_nep',
    code: 'MUC_04',
    name: 'Mục 4: Chấm điểm Nề nếp sinh hoạt',
    description: 'Đánh giá việc chấp hành giờ giấc thức dậy, tắt đèn đi ngủ, giữ trật tự sau giờ giới nghiêm, ứng xử lễ phép. Có minh chứng hình ảnh.',
    defaultBaseScore: 100,
    defaultPenalty: 5,
    isActive: true,
    canUploadProof: true,
    applicableRoles: ['admin', 'bgh', 'gv_ngu_lai', 'thanh_vien_quan_sinh', 'doan_thanh_nien', 'doi_tu_quan'],
  },
  {
    id: 'crit_muc5',
    category: 'muc5_noi_quy',
    code: 'MUC_05',
    name: 'Mục 5: Chấp hành nội quy nhà trường & hoạt động tập thể',
    description: 'Đánh giá việc tham gia đầy đủ, tích cực hoạt động tuyên truyền, thể dục thể thao, văn hóa văn nghệ, lao động tập thể. Có minh chứng hình ảnh.',
    defaultBaseScore: 100,
    defaultPenalty: 5,
    isActive: true,
    canUploadProof: true,
    applicableRoles: ['admin', 'bgh', 'tong_phu_trach', 'doan_thanh_nien', 'thanh_tra', 'thanh_vien_quan_sinh'],
  },
];

// Sample photo proofs for demonstration
export const SAMPLE_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    caption: 'Kiểm tra phòng ở ngăn nắp, chăn màn gấp vuông vắn',
  },
  {
    url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80',
    caption: 'Học sinh tham gia tự học đêm tại phòng nghiêm túc',
  },
  {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    caption: 'Lao động chăm sóc bồn hoa khuôn viên nội trú',
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    caption: 'Vệ sinh sân nội trú sạch sẽ, thu gom rác đúng quy định',
  }
];

export const INITIAL_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'eval_01',
    type: 'muc3_ve_sinh',
    roomId: 'room_01',
    date: '2026-10-15',
    weekNumber: 7,
    month: 10,
    year: 2026,
    teacherId: 'user_yte_thuy',
    teacherName: 'Vũ Thị Thủy',
    teacherRole: 'y_te',
    department: 'y_te',
    departmentName: 'Cán bộ Y tế',
    evaluationTime: '06:45:00',
    proofUploadTime: '06:47:12',
    baseScore: 100,
    bonusScore: 0,
    totalPenaltyScore: 5,
    finalScore: 95,
    generalComment: 'Phòng sạch sẽ, 1 giường cuối góc chưa xếp mền ngay ngắn.',
    violations: [
      {
        id: 'viol_1',
        criterionId: 'crit_muc3',
        description: 'Chưa xếp mền gối giường số 3',
        penaltyPoints: 5,
        photoProofs: [
          {
            id: 'p_1',
            url: SAMPLE_PHOTOS[0].url,
            caption: 'Ảnh minh chứng góc phòng số 01',
            uploadedAt: '2026-10-15 06:47:12',
            uploadedBy: 'Vũ Thị Thủy (Y tế)',
          }
        ]
      }
    ],
    photoProofs: [
      {
        id: 'p_1',
        url: SAMPLE_PHOTOS[0].url,
        caption: 'Ảnh minh chứng góc phòng số 01',
        uploadedAt: '2026-10-15 06:47:12',
        uploadedBy: 'Vũ Thị Thủy (Y tế)',
      }
    ]
  },
  {
    id: 'eval_02',
    type: 'muc3_ve_sinh',
    roomId: 'room_13',
    date: '2026-10-15',
    weekNumber: 7,
    month: 10,
    year: 2026,
    teacherId: 'user_tu_quan_nu',
    teacherName: 'Đội Tự Quản Khu Nữ',
    teacherRole: 'doi_tu_quan',
    department: 'doi_tu_quan',
    departmentName: 'Đội Tự Quản (Học sinh cán sự)',
    evaluationTime: '06:50:00',
    proofUploadTime: '06:52:05',
    baseScore: 100,
    bonusScore: 5,
    totalPenaltyScore: 0,
    finalScore: 105,
    generalComment: 'Phòng 13 nữ xuất sắc, vệ sinh cực kỳ sạch sẽ, có hoa tươi để bàn.',
    violations: [],
    photoProofs: [
      {
        id: 'p_2',
        url: SAMPLE_PHOTOS[3].url,
        caption: 'Vệ sinh phòng 13 sạch sẽ tinh tươm',
        uploadedAt: '2026-10-15 06:52:05',
        uploadedBy: 'Đội Tự Quản Khu Nữ',
      }
    ]
  },
  {
    id: 'eval_03',
    type: 'muc4_ne_nep',
    roomId: 'room_03',
    date: '2026-10-14',
    weekNumber: 7,
    month: 10,
    year: 2026,
    teacherId: 'user_gv_ngu_lai',
    teacherName: 'Lê Văn Hùng',
    teacherRole: 'gv_ngu_lai',
    department: 'gv_ngu_lai',
    departmentName: 'Giáo viên trực đêm ngủ lại',
    evaluationTime: '22:15:00',
    proofUploadTime: '22:18:30',
    baseScore: 100,
    bonusScore: 0,
    totalPenaltyScore: 10,
    finalScore: 90,
    generalComment: 'Sau 22h00 còn nói chuyện to, nhắc nhở 1 lần mới trật tự.',
    violations: [
      {
        id: 'viol_2',
        criterionId: 'crit_muc4',
        description: 'Mất trật tự sau 22h00',
        penaltyPoints: 10,
        photoProofs: []
      }
    ],
    photoProofs: []
  },
  {
    id: 'eval_04',
    type: 'muc5_noi_quy',
    roomId: 'room_14',
    date: '2026-10-14',
    weekNumber: 7,
    month: 10,
    year: 2026,
    teacherId: 'user_tpt_tung',
    teacherName: 'Võ Thanh Tùng',
    teacherRole: 'tong_phu_trach',
    department: 'tong_phu_trach',
    departmentName: 'Tổng phụ trách Đội',
    evaluationTime: '16:30:00',
    proofUploadTime: '16:35:00',
    baseScore: 100,
    bonusScore: 0,
    totalPenaltyScore: 0,
    finalScore: 100,
    generalComment: 'Tham gia đầy đủ buổi lao động dọn dẹp khuôn viên trường.',
    violations: [],
    photoProofs: [
      {
        id: 'p_3',
        url: SAMPLE_PHOTOS[2].url,
        caption: 'Phòng 14 lao động chăm sóc vườn hoa bán trú',
        uploadedAt: '2026-10-14 16:35:00',
        uploadedBy: 'Võ Thanh Tùng',
      }
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_01',
    type: 'night_study',
    roomId: 'room_01',
    date: '2026-10-14',
    dayOfWeek: 'Thứ Tư',
    weekNumber: 7,
    session: 'night',
    teacherId: 'user_gv_tu_hoc',
    teacherName: 'Trần Hữu Đức',
    teacherRole: 'gv_tu_hoc_dem',
    department: 'gv_tu_hoc_dem',
    departmentName: 'Giáo viên trực tự học đêm',
    timestamp: '2026-10-14T19:30:00',
    penaltyPointsPerUnexcused: 5,
    totalUnexcused: 1,
    totalExcused: 1,
    totalPresent: 10,
    totalPenaltyScore: 5,
    note: 'Tối Thứ 4 - Em Hồ Văn Sang vắng có phép (đau đầu xuống phòng Y tế), Em Đinh Văn Kiên vắng không phép.',
    items: [
      { studentId: 'std_nam_1_1', studentName: 'Hồ Văn Sang', className: '6/1', status: 'absent_excused', note: 'Đau đầu, khám y tế' },
      { studentId: 'std_nam_1_2', studentName: 'Đinh Văn Kiên', className: '6/2', status: 'absent_unexcused', note: 'Trốn tự học ra sân bóng' },
      { studentId: 'std_nam_1_3', studentName: 'ALăng Phúc', className: '7/1', status: 'present' },
      { studentId: 'std_nam_1_4', studentName: 'Zơrâm Bảo', className: '7/2', status: 'present' },
      { studentId: 'std_nam_1_5', studentName: 'Nguyễn Văn Nam', className: '8/1', status: 'present' },
    ]
  },
  {
    id: 'att_02',
    type: 'night_study',
    roomId: 'room_13',
    date: '2026-10-14',
    dayOfWeek: 'Thứ Tư',
    weekNumber: 7,
    session: 'night',
    teacherId: 'user_tu_quan_nu',
    teacherName: 'Đội Tự Quản Khu Nữ',
    teacherRole: 'doi_tu_quan',
    department: 'doi_tu_quan',
    departmentName: 'Đội Tự Quản (Học sinh cán sự)',
    timestamp: '2026-10-14T19:45:00',
    penaltyPointsPerUnexcused: 5,
    totalUnexcused: 0,
    totalExcused: 0,
    totalPresent: 12,
    totalPenaltyScore: 0,
    note: 'Tối Thứ 4 - Chuyên cần 100%, tự giác giữ trật tự tốt.',
    items: [
      { studentId: 'std_nu_13_1', studentName: 'Hồ Thị Mai', className: '6/1', status: 'present' },
      { studentId: 'std_nu_13_2', studentName: 'Đinh Thị Lan', className: '6/2', status: 'present' },
      { studentId: 'std_nu_13_3', studentName: 'ALăng Thị Diệu', className: '7/1', status: 'present' },
    ]
  },
  {
    id: 'att_03',
    type: 'formal_class',
    roomId: 'room_02',
    date: '2026-10-15',
    weekNumber: 7,
    session: 'morning',
    teacherId: 'user_tpt_tung',
    teacherName: 'Võ Thanh Tùng',
    teacherRole: 'tong_phu_trach',
    department: 'tong_phu_trach',
    departmentName: 'Tổng phụ trách Đội',
    timestamp: '2026-10-15T07:15:00',
    penaltyPointsPerUnexcused: 5,
    totalUnexcused: 0,
    totalExcused: 0,
    totalPresent: 11,
    totalPenaltyScore: 0,
    items: []
  }
];
