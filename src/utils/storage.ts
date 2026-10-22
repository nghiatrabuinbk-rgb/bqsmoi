import { AppState, RoomWeekSummary, Room, EvaluationRecord, AttendanceRecord, Gender } from '../types';
import { INITIAL_USERS, INITIAL_ROOMS, INITIAL_CRITERIA, INITIAL_ATTENDANCE, INITIAL_EVALUATIONS, INITIAL_DEPARTMENT_PERMISSIONS, INITIAL_DUTY_ASSIGNMENTS } from '../data/initialData';

const STORAGE_KEY = 'tra_doc_boarding_eval_v2';

export const loadInitialState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all fields exist
      if (parsed.rooms && parsed.users && parsed.criteria) {
        return {
          ...parsed,
          departmentPermissions: parsed.departmentPermissions || INITIAL_DEPARTMENT_PERMISSIONS,
          dutyAssignments: parsed.dutyAssignments || INITIAL_DUTY_ASSIGNMENTS,
        };
      }
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  // Fallback default state
  return {
    rooms: INITIAL_ROOMS,
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0], // Nguyễn Trọng Nghĩa (Trưởng ban quản sinh)
    criteria: INITIAL_CRITERIA,
    departmentPermissions: INITIAL_DEPARTMENT_PERMISSIONS,
    dutyAssignments: INITIAL_DUTY_ASSIGNMENTS,
    attendanceRecords: INITIAL_ATTENDANCE,
    evaluationRecords: INITIAL_EVALUATIONS,
    currentWeek: 7,
    currentYear: '2026-2027',
    semester: 1,
    schoolName: 'TRƯỜNG PTDTBT THCS TRÀ ĐỐC',
    boardName: 'BAN QUẢN SINH NỘI TRÚ - BÁN TRÚ',
    headOfBoard: 'Nguyễn Trọng Nghĩa',
  };
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
};

export const resetToDefaultData = (): AppState => {
  localStorage.removeItem(STORAGE_KEY);
  return loadInitialState();
};

export const exportStateAsJSON = (state: AppState): string => {
  return JSON.stringify(state, null, 2);
};

export const importStateFromJSON = (jsonString: string): AppState => {
  const parsed = JSON.parse(jsonString);
  if (!parsed.rooms || !parsed.users) {
    throw new Error('Dữ liệu không hợp lệ!');
  }
  saveState(parsed);
  return parsed;
};

// Calculate summary & rankings for a given week
export const calculateWeekSummaries = (
  rooms: Room[],
  attendanceRecords: AttendanceRecord[],
  evaluationRecords: EvaluationRecord[],
  weekNumber: number
): { maleSummaries: RoomWeekSummary[]; femaleSummaries: RoomWeekSummary[]; allSummaries: RoomWeekSummary[] } => {
  const summaries: RoomWeekSummary[] = rooms.map((room) => {
    // 1. Mục 1: Tự học đêm
    const nightAtts = attendanceRecords.filter(
      (r) => r.roomId === room.id && r.weekNumber === weekNumber && r.type === 'night_study'
    );
    const muc1Deduction = nightAtts.reduce((sum, r) => sum + (r.totalPenaltyScore || 0), 0);
    const muc1Score = Math.max(0, 100 - muc1Deduction);

    // 2. Mục 2: Chính khóa
    const formalAtts = attendanceRecords.filter(
      (r) => r.roomId === room.id && r.weekNumber === weekNumber && r.type === 'formal_class'
    );
    const muc2Deduction = formalAtts.reduce((sum, r) => sum + (r.totalPenaltyScore || 0), 0);
    const muc2Score = Math.max(0, 100 - muc2Deduction);

    // 3. Mục 3: Vệ sinh nề nếp
    const vsEvals = evaluationRecords.filter(
      (e) => e.roomId === room.id && e.weekNumber === weekNumber && e.type === 'muc3_ve_sinh'
    );
    const muc3Deduction = vsEvals.reduce((sum, e) => sum + (e.totalPenaltyScore || 0), 0);
    const muc3Bonus = vsEvals.reduce((sum, e) => sum + (e.bonusScore || 0), 0);
    const muc3Score = Math.max(0, 100 - muc3Deduction + muc3Bonus);

    // 4. Mục 4: Nề nếp sinh hoạt
    const nnEvals = evaluationRecords.filter(
      (e) => e.roomId === room.id && e.weekNumber === weekNumber && e.type === 'muc4_ne_nep'
    );
    const muc4Deduction = nnEvals.reduce((sum, e) => sum + (e.totalPenaltyScore || 0), 0);
    const muc4Bonus = nnEvals.reduce((sum, e) => sum + (e.bonusScore || 0), 0);
    const muc4Score = Math.max(0, 100 - muc4Deduction + muc4Bonus);

    // 5. Mục 5: Chấp hành nội quy nhà trường
    const nqEvals = evaluationRecords.filter(
      (e) => e.roomId === room.id && e.weekNumber === weekNumber && e.type === 'muc5_noi_quy'
    );
    const muc5Deduction = nqEvals.reduce((sum, e) => sum + (e.totalPenaltyScore || 0), 0);
    const muc5Bonus = nqEvals.reduce((sum, e) => sum + (e.bonusScore || 0), 0);
    const muc5Score = Math.max(0, 100 - muc5Deduction + muc5Bonus);

    // Custom
    const customEvals = evaluationRecords.filter(
      (e) => e.roomId === room.id && e.weekNumber === weekNumber && e.type === 'custom'
    );
    const customDeduction = customEvals.reduce((sum, e) => sum + (e.totalPenaltyScore || 0), 0);
    const customBonus = customEvals.reduce((sum, e) => sum + (e.bonusScore || 0), 0);
    const customScore = Math.max(0, (customEvals.length > 0 ? 100 : 0) - customDeduction + customBonus);

    const totalScore = muc1Score + muc2Score + muc3Score + muc4Score + muc5Score + (customEvals.length > 0 ? customScore : 0);

    const studentCount = room.students && room.students.length > 0 
      ? room.students.length 
      : (room.studentCountManual || 0);

    return {
      roomId: room.id,
      roomCode: room.code,
      roomName: room.name,
      gender: room.gender,
      managerTeacherName: room.managerTeacherName,
      studentCount,
      weekNumber,
      muc1Score,
      muc1Deduction,
      muc2Score,
      muc2Deduction,
      muc3Score,
      muc3Deduction,
      muc4Score,
      muc4Deduction,
      muc5Score,
      muc5Deduction,
      customScore,
      customDeduction,
      totalScore,
      rankInGender: 0,
      rankOverall: 0,
      award: 'khuyen_khich',
    };
  });

  // Sort overall
  const sortedOverall = [...summaries].sort((a, b) => b.totalScore - a.totalScore);
  sortedOverall.forEach((item, idx) => {
    item.rankOverall = idx + 1;
  });

  // Separate and sort Khu Nam (12 phòng)
  const maleList = summaries
    .filter((s) => s.gender === 'nam')
    .sort((a, b) => b.totalScore - a.totalScore);

  maleList.forEach((item, idx) => {
    item.rankInGender = idx + 1;
    if (idx === 0) item.award = 'nhat';
    else if (idx === 1) item.award = 'nhi';
    else if (idx === 2) item.award = 'ba';
    else if (item.totalScore < 450) item.award = 'can_co_gang';
    else item.award = 'khuyen_khich';
  });

  // Separate and sort Khu Nữ (13 phòng)
  const femaleList = summaries
    .filter((s) => s.gender === 'nu')
    .sort((a, b) => b.totalScore - a.totalScore);

  femaleList.forEach((item, idx) => {
    item.rankInGender = idx + 1;
    if (idx === 0) item.award = 'nhat';
    else if (idx === 1) item.award = 'nhi';
    else if (idx === 2) item.award = 'ba';
    else if (item.totalScore < 450) item.award = 'can_co_gang';
    else item.award = 'khuyen_khich';
  });

  return {
    maleSummaries: maleList,
    femaleSummaries: femaleList,
    allSummaries: sortedOverall,
  };
};
