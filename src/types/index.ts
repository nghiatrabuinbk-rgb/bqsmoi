export type Gender = 'nam' | 'nu';

export type UserRole = 
  | 'admin'                  // Thầy Nguyễn Trọng Nghĩa - Trưởng Ban Quản sinh / Quản trị viên
  | 'bgh'                    // Ban Giám Hiệu
  | 'gv_phu_trach'           // Giáo viên trực phòng / phụ trách phòng
  | 'gv_tu_hoc_dem'          // Giáo viên trực đêm tự học (19h - 20h30)
  | 'gv_ngu_lai'             // Giáo viên trực đêm ngủ lại
  | 'y_te'                   // Cán bộ Y tế
  | 'thanh_tra'              // Ban Thanh tra nhân dân
  | 'doan_thanh_nien'        // Đoàn Thanh niên
  | 'tong_phu_trach'         // Tổng phụ trách Đội
  | 'thanh_vien_quan_sinh'   // Thành viên Ban Quản sinh
  | 'doi_tu_quan';           // Đội Tự Quản (Học sinh cán sự / Ban tự quản nội trú)

export type DepartmentKey = 
  | 'admin'
  | 'gv_tu_hoc_dem'
  | 'thanh_vien_quan_sinh'
  | 'bgh'
  | 'tong_phu_trach'
  | 'doan_thanh_nien'
  | 'doi_tu_quan'
  | 'gv_phu_trach'
  | 'gv_ngu_lai'
  | 'y_te'
  | 'thanh_tra';

export interface DepartmentPermission {
  department: DepartmentKey;
  departmentName: string;
  canMuc1: boolean; // Điểm danh tự học đêm (19h-20h30)
  canMuc2: boolean; // Điểm danh chính khóa
  canMuc3: boolean; // Chấm điểm vệ sinh & nề nếp
  canMuc4: boolean; // Chấm điểm nề nếp sinh hoạt
  canMuc5: boolean; // Chấm điểm chấp hành nội quy
}

export interface DutyAssignment {
  id: string;
  dayOfWeek: 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN' | 'all';
  dayName: string;
  targetCategory: 'muc1' | 'muc2' | 'muc3' | 'muc4' | 'muc5' | 'toan_dien';
  categoryLabel: string;
  department: DepartmentKey;
  assignedPersonName: string;
  assignedRoomScope: 'all' | 'nam' | 'nu' | string; // 'all' (25 phòng), 'nam' (12 phòng), 'nu' (13 phòng), hoặc ID phòng cụ thể
  shiftTime: string; // VD: "19h00 - 20h30", "06h15 - 06h45", "16h30 - 17h15", "21h45 - 22h30"
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  phone?: string;
  assignedRoomIds?: string[];
  pin: string;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  className: string; // VD: 6/1, 7/2, 8/1, 9/2
  isRoomLeader?: boolean;
  notes?: string;
}

export interface Room {
  id: string;
  code: string;         // P.01, P.02 ... P.25
  name: string;         // Phòng 01 (Nam), Phòng 13 (Nữ)
  gender: Gender;       // 'nam' (P.01 - P.12) | 'nu' (P.13 - P.25)
  managerTeacherId: string; // ID giáo viên phụ trách
  managerTeacherName: string;
  students: Student[];
  studentCountManual?: number; // Tùy chỉnh số lượng nếu chưa nhập danh sách chi tiết
  capacity: number;     // Sức chứa tối đa (VD: 12-16 em)
  leaderStudentId?: string; // Trưởng phòng
  note?: string;
}

export interface CriterionConfig {
  id: string;
  category: 'muc1_tu_hoc' | 'muc2_chinh_khoa' | 'muc3_ve_sinh' | 'muc4_ne_nep' | 'muc5_noi_quy' | 'custom';
  code: string;
  name: string;
  description: string;
  defaultBaseScore: number; // Mặc định 100 điểm cho 1 mục nội dung
  defaultPenalty: number;   // Điểm trừ mặc định cho mỗi lỗi (VD: 5 điểm, 10 điểm...)
  isActive: boolean;
  canUploadProof: boolean;
  applicableRoles: UserRole[];
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused';

export interface StudentAttendanceItem {
  studentId: string;
  studentName: string;
  className: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  type: 'night_study' | 'formal_class'; // Mục 1: Tự học đêm (19h-20h30) | Mục 2: Chính khóa
  roomId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek?: string; // Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ Nhật
  weekNumber: number;
  session?: 'morning' | 'afternoon' | 'night';
  teacherId: string;
  teacherName: string;
  teacherRole: UserRole;
  department?: DepartmentKey;
  departmentName?: string;
  timestamp: string; // ISO string
  items: StudentAttendanceItem[];
  penaltyPointsPerUnexcused: number; // Tùy chọn điểm trừ/học sinh vắng không phép (VD: 5đ)
  totalUnexcused: number;
  totalExcused: number;
  totalPresent: number;
  totalPenaltyScore: number; // Trừ điểm thi đua phòng đó
  note?: string;
}

export interface PhotoProof {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ScoreViolationItem {
  id: string;
  criterionId: string;
  description: string;
  penaltyPoints: number; // Số điểm trừ
  bonusPoints?: number;  // Điểm cộng nếu có
  photoProofs: PhotoProof[];
}

export interface EvaluationRecord {
  id: string;
  type: 'muc3_ve_sinh' | 'muc4_ne_nep' | 'muc5_noi_quy' | 'custom';
  roomId: string;
  date: string; // YYYY-MM-DD
  weekNumber: number;
  month: number;
  year: number;
  teacherId: string;
  teacherName: string;
  teacherRole: UserRole;
  department?: DepartmentKey;
  departmentName?: string;
  evaluationTime: string; // Thời gian chấm điểm (HH:mm hoặc ISO)
  proofUploadTime?: string; // Thời gian tải hình ảnh minh chứng
  baseScore: number; // Điểm định mức (mặc định 100)
  violations: ScoreViolationItem[];
  bonusScore: number;
  totalPenaltyScore: number; // Tổng điểm trừ tùy chỉnh
  finalScore: number; // Điểm còn lại = baseScore - totalPenaltyScore + bonusScore
  generalComment?: string;
  photoProofs: PhotoProof[];
}

export interface RoomWeekSummary {
  roomId: string;
  roomCode: string;
  roomName: string;
  gender: Gender;
  managerTeacherName: string;
  studentCount: number;
  weekNumber: number;
  muc1Score: number;       // Điểm Mục 1 (Tự học đêm)
  muc1Deduction: number;
  muc2Score: number;       // Điểm Mục 2 (Chính khóa)
  muc2Deduction: number;
  muc3Score: number;       // Điểm Mục 3 (Vệ sinh nề nếp)
  muc3Deduction: number;
  muc4Score: number;       // Điểm Mục 4 (Nề nếp sinh hoạt)
  muc4Deduction: number;
  muc5Score: number;       // Điểm Mục 5 (Chấp hành nội quy)
  muc5Deduction: number;
  customScore: number;     // Điểm tiêu chí bổ sung
  customDeduction: number;
  totalScore: number;      // Tổng điểm thi đua
  rankInGender: number;    // Vị thứ trong khu (1-12 Nam, 1-13 Nữ)
  rankOverall: number;     // Vị thứ toàn trường (1-25)
  award: 'nhat' | 'nhi' | 'ba' | 'khuyen_khich' | 'can_co_gang';
}

export interface AppState {
  rooms: Room[];
  users: UserAccount[];
  currentUser: UserAccount;
  criteria: CriterionConfig[];
  departmentPermissions: DepartmentPermission[];
  dutyAssignments: DutyAssignment[];
  attendanceRecords: AttendanceRecord[];
  evaluationRecords: EvaluationRecord[];
  currentWeek: number;
  currentYear: string; // VD: "2026-2027"
  semester: 1 | 2;
  schoolName: string;
  boardName: string;
  headOfBoard: string;
}
