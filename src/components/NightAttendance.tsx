import React, { useState } from 'react';
import { 
  Moon, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Trash2,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  Filter,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Edit2,
  AlertTriangle,
  CheckSquare,
  Square,
  Check,
  X,
  CalendarDays,
  Layers
} from 'lucide-react';
import { AppState, Room, AttendanceRecord, AttendanceStatus, StudentAttendanceItem, DepartmentKey } from '../types';

export const DAYS_OF_WEEK_CONFIG = [
  { key: 'Thứ Hai', short: 'Thứ 2', sessionLabel: 'Tối Thứ 2' },
  { key: 'Thứ Ba', short: 'Thứ 3', sessionLabel: 'Tối Thứ 3' },
  { key: 'Thứ Tư', short: 'Thứ 4', sessionLabel: 'Tối Thứ 4' },
  { key: 'Thứ Năm', short: 'Thứ 5', sessionLabel: 'Tối Thứ 5' },
  { key: 'Thứ Sáu', short: 'Thứ 6', sessionLabel: 'Tối Thứ 6' },
  { key: 'Thứ Bảy', short: 'Thứ 7', sessionLabel: 'Tối Thứ 7' },
  { key: 'Chủ Nhật', short: 'Chủ Nhật', sessionLabel: 'Tối Chủ Nhật' },
];

export const getDayOfWeekFromDateString = (dateStr: string): string => {
  if (!dateStr) return 'Thứ Hai';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const day = d.getDay();
    switch (day) {
      case 0: return 'Chủ Nhật';
      case 1: return 'Thứ Hai';
      case 2: return 'Thứ Ba';
      case 3: return 'Thứ Tư';
      case 4: return 'Thứ Năm';
      case 5: return 'Thứ Sáu';
      case 6: return 'Thứ Bảy';
      default: return 'Thứ Hai';
    }
  }
  return 'Thứ Hai';
};

export const getRecordDayOfWeek = (rec: AttendanceRecord): string => {
  if (rec.dayOfWeek) return rec.dayOfWeek;
  if (rec.note) {
    if (rec.note.includes('Thứ 2') || rec.note.includes('Thứ Hai')) return 'Thứ Hai';
    if (rec.note.includes('Thứ 3') || rec.note.includes('Thứ Ba')) return 'Thứ Ba';
    if (rec.note.includes('Thứ 4') || rec.note.includes('Thứ Tư')) return 'Thứ Tư';
    if (rec.note.includes('Thứ 5') || rec.note.includes('Thứ Năm')) return 'Thứ Năm';
    if (rec.note.includes('Thứ 6') || rec.note.includes('Thứ Sáu')) return 'Thứ Sáu';
    if (rec.note.includes('Thứ 7') || rec.note.includes('Thứ Bảy')) return 'Thứ Bảy';
    if (rec.note.includes('Chủ Nhật') || rec.note.includes('Tối CN')) return 'Chủ Nhật';
  }
  return getDayOfWeekFromDateString(rec.date);
};

interface NightAttendanceProps {
  state: AppState;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (recordId: string) => void;
  onDeleteAllNightAttendance?: (weekNumber?: number) => void;
  onDeleteMultipleAttendance?: (recordIds: string[]) => void;
  onBatchUpdateAttendance?: (updatedRecords: AttendanceRecord[]) => void;
}

export const NightAttendance: React.FC<NightAttendanceProps> = ({
  state,
  onSaveAttendance,
  onDeleteAttendance,
  onDeleteAllNightAttendance,
  onDeleteMultipleAttendance,
  onBatchUpdateAttendance,
}) => {
  const { rooms, users, currentUser, currentWeek, attendanceRecords, departmentPermissions } = state;

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'room_01');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentKey>('gv_tu_hoc_dem');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(currentUser.id);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [penaltyPerUnexcused, setPenaltyPerUnexcused] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [sessionDay, setSessionDay] = useState<string>('Tối Thứ 2');

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const selectedTeacher = users.find((u) => u.id === selectedTeacherId) || currentUser;
  const deptPermission = departmentPermissions?.find((d) => d.department === selectedDepartment);
  const isPermitted = deptPermission ? deptPermission.canMuc1 : true;

  // Initialize or maintain attendance state for students in the room
  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

  // States for Admin view, customize, and delete absent students in History
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'has_absent' | 'has_unexcused'>('all');
  const [showAllStudentsMap, setShowAllStudentsMap] = useState<Record<string, boolean>>({});

  // Multi-selection for batch actions
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

  // In-app Confirmation Modal (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // In-app Toast message (replaces window.alert)
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Day-of-week filtering and customization states
  const [dayFilter, setDayFilter] = useState<string>('all');

  // Single Record Date/Day Edit Modal
  const [editDateModal, setEditDateModal] = useState<{
    record: AttendanceRecord;
    date: string;
    dayOfWeek: string;
    weekNumber: number;
    sessionDay: string;
    note: string;
  } | null>(null);

  // Batch Edit Modal (Selected or all 25 rooms)
  const [batchEditModal, setBatchEditModal] = useState<{
    targetRecordIds: string[];
    scope: 'selected' | 'all25';
    date: string;
    dayOfWeek: string;
    weekNumber: number;
    sessionDay: string;
  } | null>(null);

  // Handle Date Change in creation form with auto day-of-week sync
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const dayStr = getDayOfWeekFromDateString(newDate);
    const found = DAYS_OF_WEEK_CONFIG.find((d) => d.key === dayStr);
    if (found) {
      setSessionDay(found.sessionLabel);
    }
  };

  // Handler: Save single record date/day update
  const handleSaveSingleEditDate = () => {
    if (!editDateModal) return;
    const { record, date: newDate, dayOfWeek: newDay, weekNumber: newWeek, sessionDay: newSessionDay, note: newNote } = editDateModal;
    
    let updatedNote = newNote;
    if (!updatedNote || updatedNote.startsWith('Tối Thứ') || updatedNote.startsWith('Tối CN') || updatedNote.startsWith('Tối Chủ Nhật')) {
      const splitNote = updatedNote ? updatedNote.split(' - ') : [];
      const customPart = splitNote.length > 1 ? splitNote.slice(1).join(' - ') : (splitNote[0]?.startsWith('Tối') ? '' : splitNote[0]);
      updatedNote = customPart ? `${newSessionDay} - ${customPart}` : newSessionDay;
    }

    const updatedRecord: AttendanceRecord = {
      ...record,
      date: newDate,
      dayOfWeek: newDay,
      weekNumber: Number(newWeek) || record.weekNumber,
      note: updatedNote,
    };

    onSaveAttendance(updatedRecord);
    setEditDateModal(null);
    const room = rooms.find((r) => r.id === record.roomId);
    showToast(`Đã cập nhật ngày (${newDate}) & thứ (${newDay}) cho phòng ${room?.code || record.roomId}!`, 'success');
  };

  // Handler: Save batch date/day update (for selected rooms or all 25 rooms)
  const handleSaveBatchEditDate = () => {
    if (!batchEditModal) return;
    const { targetRecordIds, scope, date: newDate, dayOfWeek: newDay, weekNumber: newWeek, sessionDay: newSessionDay } = batchEditModal;

    const recordsToUpdate = weekNightRecords.filter((r) => {
      if (scope === 'all25') return true;
      return targetRecordIds.includes(r.id);
    });

    if (recordsToUpdate.length === 0) {
      showToast('Không có bản ghi nào để cập nhật.', 'info');
      setBatchEditModal(null);
      return;
    }

    const updatedRecords = recordsToUpdate.map((rec) => {
      let updatedNote = rec.note || '';
      const splitNote = updatedNote ? updatedNote.split(' - ') : [];
      const customPart = splitNote.length > 1 ? splitNote.slice(1).join(' - ') : (splitNote[0]?.startsWith('Tối') ? '' : splitNote[0]);
      const finalNote = customPart ? `${newSessionDay} - ${customPart}` : newSessionDay;

      return {
        ...rec,
        date: newDate,
        dayOfWeek: newDay,
        weekNumber: Number(newWeek) || rec.weekNumber,
        note: finalNote,
      };
    });

    if (onBatchUpdateAttendance) {
      onBatchUpdateAttendance(updatedRecords);
    } else {
      updatedRecords.forEach((r) => onSaveAttendance(r));
    }

    setBatchEditModal(null);
    showToast(`Đã đổi đồng loạt ngày (${newDate}), thứ (${newDay}) cho ${updatedRecords.length} phòng!`, 'success');
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3800);
  };

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'bgh' || currentUser.role === 'thanh_vien_quan_sinh';

  // Admin Handler: Update an absent student's status directly in a history record
  const handleStudentStatusInHistory = (record: AttendanceRecord, studentId: string, newStatus: AttendanceStatus) => {
    const updatedItems = (record.items || []).map((item) => {
      if (item.studentId === studentId) {
        return {
          ...item,
          status: newStatus,
          note: newStatus === 'present' ? '' : item.note,
        };
      }
      return item;
    });

    const unexcused = updatedItems.filter((i) => i.status === 'absent_unexcused').length;
    const excused = updatedItems.filter((i) => i.status === 'absent_excused').length;
    const present = updatedItems.filter((i) => i.status === 'present').length;
    const penaltyPer = record.penaltyPointsPerUnexcused || 5;
    const totalPenalty = unexcused * penaltyPer;

    const updatedRecord: AttendanceRecord = {
      ...record,
      items: updatedItems,
      totalUnexcused: unexcused,
      totalExcused: excused,
      totalPresent: present,
      totalPenaltyScore: totalPenalty,
    };

    onSaveAttendance(updatedRecord);
  };

  // Admin Handler: Delete student absence (mark as present and refund penalty) with In-App Modal
  const handleDeleteAbsentStudent = (record: AttendanceRecord, studentId: string, studentName: string) => {
    setConfirmModal({
      title: 'Xóa Lượt Vắng Học Sinh',
      message: `Bạn có chắc chắn muốn xóa lượt vắng của em "${studentName}"? Thao tác này sẽ chuyển em thành "Có mặt" và hoàn trả lại điểm thi đua cho phòng.`,
      confirmText: 'Xác Nhận Xóa Vắng',
      isDanger: false,
      onConfirm: () => {
        handleStudentStatusInHistory(record, studentId, 'present');
        setConfirmModal(null);
        showToast(`Đã xóa lượt vắng của em "${studentName}", hoàn trả điểm cho phòng!`, 'success');
      },
    });
  };

  // Admin Handler: Remove a student completely from this attendance record with In-App Modal
  const handleRemoveStudentFromRecord = (record: AttendanceRecord, studentId: string, studentName: string) => {
    setConfirmModal({
      title: 'Xóa Học Sinh Khỏi Bản Ghi Ca Trực',
      message: `Bạn có chắc chắn muốn xóa hẳn học sinh "${studentName}" khỏi bản ghi ca tự học đêm này?`,
      confirmText: 'Xác Nhận Xóa',
      isDanger: true,
      onConfirm: () => {
        const updatedItems = (record.items || []).filter((i) => i.studentId !== studentId);
        const unexcused = updatedItems.filter((i) => i.status === 'absent_unexcused').length;
        const excused = updatedItems.filter((i) => i.status === 'absent_excused').length;
        const present = updatedItems.filter((i) => i.status === 'present').length;
        const penaltyPer = record.penaltyPointsPerUnexcused || 5;
        const totalPenalty = unexcused * penaltyPer;

        const updatedRecord: AttendanceRecord = {
          ...record,
          items: updatedItems,
          totalUnexcused: unexcused,
          totalExcused: excused,
          totalPresent: present,
          totalPenaltyScore: totalPenalty,
        };

        onSaveAttendance(updatedRecord);
        setConfirmModal(null);
        showToast(`Đã xóa học sinh "${studentName}" khỏi bản ghi ca tự học đêm.`, 'info');
      },
    });
  };

  // Admin Handler: Edit absence note / reason
  const handleUpdateStudentNoteInHistory = (record: AttendanceRecord, studentId: string, newNote: string) => {
    const updatedItems = (record.items || []).map((item) => {
      if (item.studentId === studentId) {
        return {
          ...item,
          note: newNote,
        };
      }
      return item;
    });

    onSaveAttendance({
      ...record,
      items: updatedItems,
    });
    showToast('Đã lưu lý do vắng học sinh.', 'info');
  };

  // Admin Handler: Customize penalty points per unexcused student for this record
  const handleUpdatePenaltyPointsInHistory = (record: AttendanceRecord, newPenaltyPoints: number) => {
    const penaltyPer = Math.max(0, newPenaltyPoints);
    const totalPenalty = (record.totalUnexcused || 0) * penaltyPer;
    onSaveAttendance({
      ...record,
      penaltyPointsPerUnexcused: penaltyPer,
      totalPenaltyScore: totalPenalty,
    });
    showToast(`Đã cập nhật mức trừ: ${penaltyPer}đ / 1 em vắng không phép.`, 'info');
  };

  // Delete single attendance record with In-App Confirmation Modal
  const handleRequestDeleteRecord = (rec: AttendanceRecord) => {
    const room = rooms.find((r) => r.id === rec.roomId);
    setConfirmModal({
      title: 'Xóa Bản Ghi Điểm Danh',
      message: `Bạn có chắc chắn muốn xóa bản ghi điểm danh tự học đêm phòng ${room?.code || rec.roomId} ngày ${rec.date}? Điểm trừ thi đua của buổi này sẽ được xóa bỏ hoàn toàn.`,
      confirmText: 'Xóa Bản Ghi Này',
      isDanger: true,
      onConfirm: () => {
        onDeleteAttendance(rec.id);
        setSelectedRecordIds((prev) => prev.filter((id) => id !== rec.id));
        setConfirmModal(null);
        showToast(`Đã xóa thành công bản ghi phòng ${room?.code || rec.roomId}!`, 'success');
      },
    });
  };

  // Multi-selection toggles
  const toggleSelectRecord = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = (filteredIds: string[]) => {
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedRecordIds.includes(id));
    if (allSelected) {
      setSelectedRecordIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedRecordIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Delete selected attendance records
  const handleRequestDeleteSelected = () => {
    if (selectedRecordIds.length === 0) return;
    setConfirmModal({
      title: `Xóa ${selectedRecordIds.length} Bản Ghi Đã Chọn`,
      message: `Bạn có chắc chắn muốn xóa ${selectedRecordIds.length} bản ghi điểm danh tự học đêm đã chọn? Điểm trừ của các phòng tương ứng sẽ được giải phóng.`,
      confirmText: `Xác Nhận Xóa ${selectedRecordIds.length} Bản Ghi`,
      isDanger: true,
      onConfirm: () => {
        if (onDeleteMultipleAttendance) {
          onDeleteMultipleAttendance(selectedRecordIds);
        } else {
          selectedRecordIds.forEach((id) => onDeleteAttendance(id));
        }
        setSelectedRecordIds([]);
        setConfirmModal(null);
        showToast(`Đã xóa thành công ${selectedRecordIds.length} bản ghi!`, 'success');
      },
    });
  };

  // Reset/sync when room changes
  React.useEffect(() => {
    if (selectedRoom) {
      const initial: Record<string, { status: AttendanceStatus; note: string }> = {};
      selectedRoom.students.forEach((std) => {
        initial[std.id] = { status: 'present', note: '' };
      });
      setStudentStatusMap(initial);
    }
  }, [selectedRoomId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatusMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleStudentNoteChange = (studentId: string, note: string) => {
    setStudentStatusMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    if (!selectedRoom) return;
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    selectedRoom.students.forEach((std) => {
      updated[std.id] = { status: 'present', note: '' };
    });
    setStudentStatusMap(updated);
  };

  // Calculations
  const students = selectedRoom?.students || [];
  let presentCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;

  students.forEach((std) => {
    const item = studentStatusMap[std.id];
    if (item?.status === 'absent_unexcused') {
      unexcusedCount++;
    } else if (item?.status === 'absent_excused') {
      excusedCount++;
    } else {
      presentCount++;
    }
  });

  const totalPenalty = unexcusedCount * penaltyPerUnexcused;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const items: StudentAttendanceItem[] = students.map((std) => ({
      studentId: std.id,
      studentName: std.name,
      className: std.className,
      status: studentStatusMap[std.id]?.status || 'present',
      note: studentStatusMap[std.id]?.note || '',
    }));

    const detectedDay = getDayOfWeekFromDateString(date);
    const matchingDay = DAYS_OF_WEEK_CONFIG.find((d) => d.sessionLabel === sessionDay)?.key || detectedDay;

    const newRecord: AttendanceRecord = {
      id: `att_night_${Date.now()}`,
      type: 'night_study',
      roomId: selectedRoom.id,
      date,
      dayOfWeek: matchingDay,
      weekNumber: currentWeek,
      session: 'night',
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      teacherRole: selectedTeacher.role,
      department: selectedDepartment,
      departmentName: deptPermission?.departmentName || selectedDepartment,
      timestamp: new Date().toISOString(),
      penaltyPointsPerUnexcused: penaltyPerUnexcused,
      totalUnexcused: unexcusedCount,
      totalExcused: excusedCount,
      totalPresent: presentCount,
      totalPenaltyScore: totalPenalty,
      note: notes ? `${sessionDay} - ${notes}` : sessionDay,
      items,
    };

    onSaveAttendance(newRecord);
    showToast(`Đã lưu điểm danh tự học đêm phòng ${selectedRoom.code}! Tổng điểm trừ: ${totalPenalty} điểm.`, 'success');
  };

  // Admin Handler: Quick create full attendance for all 25 rooms for current date & day
  const handleQuickAttendanceAll25Rooms = () => {
    const detectedDay = getDayOfWeekFromDateString(date);
    const matchingDay = DAYS_OF_WEEK_CONFIG.find((d) => d.sessionLabel === sessionDay)?.key || detectedDay;

    setConfirmModal({
      title: 'ĐIỂM DANH NHANH 25 PHÒNG (100% CÓ MẶT)',
      message: `Bạn có muốn tạo bản ghi điểm danh tự học đêm (${sessionDay}, ngày ${date}) cho toàn bộ 25 phòng ở với trạng thái tất cả học sinh đi học đầy đủ (0 điểm trừ)? Sau đó quản trị viên có thể tùy chỉnh ngày, thứ trong tuần hoặc sửa học sinh vắng từng phòng.`,
      confirmText: 'Tạo Cho Cả 25 Phòng',
      isDanger: false,
      onConfirm: () => {
        const newRecords: AttendanceRecord[] = rooms.map((room) => {
          const stds = room.students || [];
          const items: StudentAttendanceItem[] = stds.map((std) => ({
            studentId: std.id,
            studentName: std.name,
            className: std.className,
            status: 'present',
            note: '',
          }));
          return {
            id: `att_night_${room.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            type: 'night_study',
            roomId: room.id,
            date,
            dayOfWeek: matchingDay,
            weekNumber: currentWeek,
            session: 'night',
            teacherId: selectedTeacher.id,
            teacherName: selectedTeacher.name,
            teacherRole: selectedTeacher.role,
            department: selectedDepartment,
            departmentName: deptPermission?.departmentName || selectedDepartment,
            timestamp: new Date().toISOString(),
            penaltyPointsPerUnexcused: penaltyPerUnexcused,
            totalUnexcused: 0,
            totalExcused: 0,
            totalPresent: stds.length,
            totalPenaltyScore: 0,
            note: sessionDay,
            items,
          };
        });

        if (onBatchUpdateAttendance) {
          onBatchUpdateAttendance(newRecords);
        } else {
          newRecords.forEach((r) => onSaveAttendance(r));
        }
        setConfirmModal(null);
        showToast(`Đã tạo bản ghi tự học đêm (${sessionDay}, ${date}) cho toàn bộ 25 phòng!`, 'success');
      },
    });
  };

  // History for this week
  const weekNightRecords = attendanceRecords.filter(
    (r) => r.type === 'night_study' && r.weekNumber === currentWeek
  );

  // Delete ALL records of this week for all 25 rooms
  const handleRequestDeleteAll = () => {
    if (weekNightRecords.length === 0) {
      showToast('Không có bản ghi nào trong tuần này để xóa.', 'info');
      return;
    }
    setConfirmModal({
      title: `XÓA TẤT CẢ ${weekNightRecords.length} BẢN GHI TUẦN ${currentWeek} CỦA 25 PHÒNG`,
      message: `Bạn đang thực hiện quyền Quản trị viên: XÓA TOÀN BỘ ${weekNightRecords.length} bản ghi điểm danh tự học đêm của Tuần ${currentWeek} (25 phòng ở). Tất cả dữ liệu và điểm trừ thi đua tự học đêm của tuần này sẽ được xóa sạch. Bạn có chắc chắn muốn xóa toàn bộ không?`,
      confirmText: `Xác Nhận Xóa Hết (${weekNightRecords.length} bản ghi)`,
      isDanger: true,
      onConfirm: () => {
        if (onDeleteAllNightAttendance) {
          onDeleteAllNightAttendance(currentWeek);
        } else if (onDeleteMultipleAttendance) {
          onDeleteMultipleAttendance(weekNightRecords.map((r) => r.id));
        } else {
          weekNightRecords.forEach((r) => onDeleteAttendance(r.id));
        }
        setSelectedRecordIds([]);
        setConfirmModal(null);
        showToast(`Đã xóa sạch toàn bộ ${weekNightRecords.length} bản ghi tự học đêm của tuần ${currentWeek}!`, 'success');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-lg">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Mục 1 • Ban Quản sinh PTDTBT THCS Trà Đốc
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Điểm Danh Tự Học Đêm (19h00 - 20h30)
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Áp dụng từ tối Thứ 2 đến Thứ 5 hàng tuần. Vắng có phép: 0đ trừ. Vắng không phép: Trừ điểm thi đua của phòng.
              </p>
            </div>
          </div>
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 text-xs">
            Thời gian: <strong>19h00 - 20h30 (T2 - T5)</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls & Room Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Chọn Phòng Ở & Giáo Viên Điểm Danh
            </h3>

            {/* Room selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn phòng (trong 25 phòng ở):
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <optgroup label="Khu Nam (12 phòng: P.01 - P.12)">
                  {rooms.filter((r) => r.gender === 'nam').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.name} (GV: {r.managerTeacherName})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Khu Nữ (13 phòng: P.13 - P.25)">
                  {rooms.filter((r) => r.gender === 'nu').map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.name} (GV: {r.managerTeacherName})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Department selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Bộ phận thực hiện điểm danh:
                </label>
                {isPermitted ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Có quyền
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1" title="Chưa được cấp quyền Mục 1 trong Ma Trận">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Chưa phân quyền
                  </span>
                )}
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as DepartmentKey)}
                className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="gv_tu_hoc_dem">Giáo viên trực tự học đêm (19h-20h30)</option>
                <option value="thanh_vien_quan_sinh">Thành viên Ban Quản sinh</option>
                <option value="bgh">Ban Giám Hiệu (BGH)</option>
                <option value="doi_tu_quan">Đội Tự Quản (Học sinh cán sự)</option>
                <option value="tong_phu_trach">Tổng phụ trách Đội</option>
                <option value="doan_thanh_nien">Đoàn Thanh niên</option>
                <option value="gv_phu_trach">Giáo viên trực phòng / phụ trách</option>
                <option value="admin">Trưởng Ban Quản sinh (Admin)</option>
              </select>
            </div>

            {/* Teacher selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người điểm danh cụ thể:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Day */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buổi tự học:
                </label>
                <select
                  value={sessionDay}
                  onChange={(e) => setSessionDay(e.target.value)}
                  className="w-full text-xs font-medium p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  {DAYS_OF_WEEK_CONFIG.map((d) => (
                    <option key={d.sessionLabel} value={d.sessionLabel}>
                      {d.sessionLabel} ({d.key})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày điểm danh:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full text-xs font-medium p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Penalty per unexcused */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                Điểm trừ / 1 học sinh vắng không phép:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={penaltyPerUnexcused}
                  onChange={(e) => setPenaltyPerUnexcused(Number(e.target.value))}
                  className="w-24 text-sm font-bold text-center py-1 border border-amber-300 rounded-lg bg-white"
                />
                <span className="text-xs text-amber-800">điểm / em</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Điểm này sẽ trực tiếp trừ vào điểm thi đua tuần của phòng {selectedRoom?.code}.
              </p>
            </div>

            {/* General notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú ca tự học (nếu có):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Phòng tự giác cao, học bài nghiêm túc..."
                className="w-full text-xs p-2 border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Quick Stat Summary Box */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs uppercase font-bold text-amber-400 mb-2">
              Tổng kết buổi điểm danh {selectedRoom?.code}
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-950/80 p-2 rounded-xl border border-emerald-700/50">
                <div className="font-bold text-emerald-400 text-lg">{presentCount}</div>
                <div className="text-[10px] text-slate-300">Có mặt</div>
              </div>
              <div className="bg-blue-950/80 p-2 rounded-xl border border-blue-700/50">
                <div className="font-bold text-blue-300 text-lg">{excusedCount}</div>
                <div className="text-[10px] text-slate-300">Có phép (0đ)</div>
              </div>
              <div className="bg-rose-950/80 p-2 rounded-xl border border-rose-700/50">
                <div className="font-bold text-rose-400 text-lg">{unexcusedCount}</div>
                <div className="text-[10px] text-slate-300">Không phép</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">Tổng điểm trừ thi đua:</span>
              <span className="text-base font-black text-rose-400">
                -{totalPenalty} điểm
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Student Attendance Checklist (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Danh sách học sinh {selectedRoom?.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    {students.length} học sinh
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  GV Phụ trách: <strong>{selectedRoom?.managerTeacherName}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Điểm danh đủ cả phòng (Có mặt 100%)
              </button>
            </div>

            {/* Student list */}
            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Phòng này chưa có danh sách học sinh. Vui lòng vào tab &ldquo;25 Phòng &amp; Học Sinh&rdquo; để nhập danh sách!
              </div>
            ) : (
              <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {students.map((student, index) => {
                  const stateItem = studentStatusMap[student.id] || { status: 'present', note: '' };
                  const isPresent = stateItem.status === 'present';
                  const isExcused = stateItem.status === 'absent_excused';
                  const isUnexcused = stateItem.status === 'absent_unexcused';

                  return (
                    <div
                      key={student.id}
                      className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isUnexcused
                          ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                          : isExcused
                          ? 'bg-blue-50/70 border-blue-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Student info */}
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                            {student.name}
                            {student.isRoomLeader && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                                Trưởng phòng
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Lớp: <strong className="text-blue-700">{student.className}</strong>
                            {student.notes && ` • ${student.notes}`}
                          </div>
                        </div>
                      </div>

                      {/* Status Buttons & Reason note */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Present button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Có mặt
                        </button>

                        {/* Excused button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent_excused')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            isExcused
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Vắng có phép
                        </button>

                        {/* Unexcused button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent_unexcused')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            isUnexcused
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Vắng không phép (-{penaltyPerUnexcused}đ)
                        </button>

                        {/* Reason Note */}
                        {(isExcused || isUnexcused) && (
                          <input
                            type="text"
                            placeholder="Lý do vắng..."
                            value={stateItem.note}
                            onChange={(e) => handleStudentNoteChange(student.id, e.target.value)}
                            className="text-xs p-1.5 border border-slate-300 rounded-lg w-full sm:w-36 outline-none bg-white"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save Button & Quick Attend All 25 Rooms */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleQuickAttendanceAll25Rooms}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                  title="Tạo nhanh bản ghi điểm danh cho tất cả 25 phòng với 100% học sinh có mặt"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Điểm Danh Nhanh Cả 25 Phòng (100% Có Mặt)</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-xs sm:text-sm cursor-pointer ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Bảng Điểm Danh Tự Học Đêm {selectedRoom?.code}</span>
              </button>
            </div>
          </div>

          {/* History of Night Attendance this week */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            {/* History Header & Admin Batch Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Lịch Sử Điểm Danh Tự Học Đêm Trong Tuần {currentWeek}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi danh sách các phòng đã điểm danh. Quản trị viên có toàn quyền kiểm tra, tùy chỉnh, xóa học sinh vắng hoặc xóa tất cả bản ghi của 25 phòng.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Admin Privileges Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Quyền Quản Trị: Xem, Tùy Chỉnh &amp; Xóa</span>
                </div>

                {/* DELETE ALL RECORDS FOR 25 ROOMS (Week) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleRequestDeleteAll}
                    disabled={weekNightRecords.length === 0}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title={`Xóa toàn bộ ${weekNightRecords.length} bản ghi điểm danh tuần này của 25 phòng`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa tất cả ({weekNightRecords.length} bản ghi tuần này)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters Row: Day-of-week & Absence status */}
            <div className="space-y-2.5">
              {/* Day of Week Filter Bar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <span>Lọc theo thứ:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDayFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    dayFilter === 'all'
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Tất cả các thứ ({weekNightRecords.length})
                </button>
                {DAYS_OF_WEEK_CONFIG.map((d) => {
                  const count = weekNightRecords.filter((r) => getRecordDayOfWeek(r) === d.key).length;
                  const isSelected = dayFilter === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDayFilter(d.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-700 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{d.short}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status filter buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Lọc theo trạng thái:
                  </span>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      historyFilter === 'all'
                        ? 'bg-blue-800 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({weekNightRecords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('has_absent')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      historyFilter === 'has_absent'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Có học sinh vắng ({weekNightRecords.filter((r) => (r.totalUnexcused || 0) + (r.totalExcused || 0) > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('has_unexcused')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      historyFilter === 'has_unexcused'
                        ? 'bg-rose-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Bị trừ điểm ({weekNightRecords.filter((r) => (r.totalUnexcused || 0) > 0).length})
                  </button>
                </div>

                {/* Batch Edit All 25 Rooms Button */}
                {isAdmin && weekNightRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const defaultDate = weekNightRecords[0]?.date || new Date().toISOString().split('T')[0];
                      const defaultDay = getDayOfWeekFromDateString(defaultDate);
                      const dayCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.key === defaultDay);
                      setBatchEditModal({
                        targetRecordIds: weekNightRecords.map((r) => r.id),
                        scope: 'all25',
                        date: defaultDate,
                        dayOfWeek: defaultDay,
                        weekNumber: currentWeek,
                        sessionDay: dayCfg?.sessionLabel || 'Tối Thứ 2',
                      });
                    }}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Mở bảng sửa ngày và thứ đồng loạt cho toàn bộ 25 phòng"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Sửa Ngày/Thứ Toàn Bộ 25 Phòng</span>
                  </button>
                )}
              </div>
            </div>

            {/* Multi-Selection & Batch Actions Bar */}
            {(() => {
              const filteredList = weekNightRecords.filter((rec) => {
                if (dayFilter !== 'all') {
                  const recDay = getRecordDayOfWeek(rec);
                  if (recDay !== dayFilter) return false;
                }
                const totalAbsent = (rec.totalUnexcused || 0) + (rec.totalExcused || 0);
                if (historyFilter === 'has_absent') return totalAbsent > 0;
                if (historyFilter === 'has_unexcused') return (rec.totalUnexcused || 0) > 0;
                return true;
              });

              if (filteredList.length === 0 && weekNightRecords.length > 0) {
                return (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic text-center">
                    Không tìm thấy bản ghi nào phù hợp với bộ lọc đã chọn ({dayFilter !== 'all' ? dayFilter : ''}).
                  </div>
                );
              }

              if (filteredList.length === 0) return null;

              const allFilteredSelected =
                filteredList.length > 0 && filteredList.every((r) => selectedRecordIds.includes(r.id));

              return (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectAllFiltered(filteredList.map((r) => r.id))}
                      className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-blue-700 cursor-pointer"
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-700 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>Chọn tất cả hiển thị ({filteredList.length})</span>
                    </button>

                    {selectedRecordIds.length > 0 && (
                      <span className="text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                        Đã chọn: {selectedRecordIds.length} bản ghi
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedRecordIds.length > 0 && (
                      <>
                        {/* Batch Edit Selected Records */}
                        <button
                          type="button"
                          onClick={() => {
                            const firstRec = weekNightRecords.find((r) => selectedRecordIds.includes(r.id));
                            const defaultDate = firstRec?.date || new Date().toISOString().split('T')[0];
                            const defaultDay = firstRec ? getRecordDayOfWeek(firstRec) : getDayOfWeekFromDateString(defaultDate);
                            const dayCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.key === defaultDay);
                            setBatchEditModal({
                              targetRecordIds: selectedRecordIds,
                              scope: 'selected',
                              date: defaultDate,
                              dayOfWeek: defaultDay,
                              weekNumber: firstRec?.weekNumber || currentWeek,
                              sessionDay: dayCfg?.sessionLabel || 'Tối Thứ 2',
                            });
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          title="Sửa ngày và thứ cho các phòng đang chọn"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Sửa Ngày/Thứ ({selectedRecordIds.length} phòng đã chọn)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRecordIds([])}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestDeleteSelected}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa ({selectedRecordIds.length})</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Records List */}
            {weekNightRecords.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-6 text-center border border-dashed rounded-xl">
                Chưa có bản ghi điểm danh tự học đêm nào trong tuần {currentWeek}. Bạn có thể bấm "Điểm Danh Nhanh Cả 25 Phòng (100% Có Mặt)" phía trên để tạo bản ghi cho toàn bộ 25 phòng.
              </p>
            ) : (
              <div className="space-y-3">
                {weekNightRecords
                  .filter((rec) => {
                    if (dayFilter !== 'all') {
                      const recDay = getRecordDayOfWeek(rec);
                      if (recDay !== dayFilter) return false;
                    }
                    const totalAbsent = (rec.totalUnexcused || 0) + (rec.totalExcused || 0);
                    if (historyFilter === 'has_absent') return totalAbsent > 0;
                    if (historyFilter === 'has_unexcused') return (rec.totalUnexcused || 0) > 0;
                    return true;
                  })
                  .map((rec) => {
                    const room = rooms.find((r) => r.id === rec.roomId);
                    const isExpanded = expandedRecordId === rec.id;
                    const items = rec.items || [];
                    const absentItems = items.filter((i) => i.status === 'absent_unexcused' || i.status === 'absent_excused');
                    const showAll = !!showAllStudentsMap[rec.id];
                    const isSelected = selectedRecordIds.includes(rec.id);
                    const recDayOfWeek = getRecordDayOfWeek(rec);

                    return (
                      <div
                        key={rec.id}
                        className={`rounded-2xl border transition overflow-hidden shadow-sm ${
                          isExpanded
                            ? 'border-blue-400 ring-2 ring-blue-100 bg-white'
                            : isSelected
                            ? 'border-blue-300 bg-blue-50/40'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                        }`}
                      >
                        {/* Summary Bar */}
                        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Checkbox for batch selection */}
                            <button
                              type="button"
                              onClick={() => toggleSelectRecord(rec.id)}
                              className="mt-0.5 p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer shrink-0"
                              title={isSelected ? 'Bỏ chọn bản ghi này' : 'Chọn bản ghi này'}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-700" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-blue-800 px-2 py-0.5 rounded-lg bg-blue-100 text-xs">
                                  {room?.code || rec.roomId}
                                </span>
                                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                  {room?.name || rec.roomId}
                                </span>

                                {/* Day of Week Badge */}
                                <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3 text-indigo-700" />
                                  <span>{recDayOfWeek}</span>
                                </span>

                                {/* Date Badge */}
                                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-500" />
                                  <span>{rec.date}</span>
                                </span>

                                {/* Week Badge */}
                                <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                  Tuần {rec.weekNumber}
                                </span>

                                {rec.note && (
                                  <span className="text-slate-500 text-xs italic">
                                    • {rec.note}
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                                <span>Người điểm danh: <strong className="text-slate-700">{rec.teacherName}</strong></span>
                                {rec.departmentName && (
                                  <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                                    {rec.departmentName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stats Badges & Actions */}
                          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
                            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              {rec.totalPresent} có mặt
                            </span>

                            {rec.totalExcused > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                                {rec.totalExcused} vắng phép
                              </span>
                            )}

                            {rec.totalUnexcused > 0 ? (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black">
                                {rec.totalUnexcused} không phép (-{rec.totalPenaltyScore}đ)
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                                0đ trừ
                              </span>
                            )}

                            {/* Single Edit Date & Day of Week Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const curDate = rec.date || new Date().toISOString().split('T')[0];
                                const curDay = getRecordDayOfWeek(rec);
                                const dayCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.key === curDay);
                                setEditDateModal({
                                  record: rec,
                                  date: curDate,
                                  dayOfWeek: curDay,
                                  weekNumber: rec.weekNumber,
                                  sessionDay: dayCfg?.sessionLabel || 'Tối Thứ 2',
                                  note: rec.note || '',
                                });
                              }}
                              className="px-2.5 py-1 text-blue-700 hover:bg-blue-100 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Tùy chỉnh ngày và thứ trong tuần cho phòng này"
                            >
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>Sửa Ngày/Thứ</span>
                            </button>

                            {/* Expand / Collapse Button */}
                            <button
                              type="button"
                              onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                isExpanded
                                  ? 'bg-blue-700 text-white shadow-sm'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                              title="Xem chi tiết học sinh vắng & quản trị"
                            >
                              <span>Học sinh vắng ({absentItems.length})</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete single attendance record with in-app confirm */}
                            <button
                              type="button"
                              onClick={() => handleRequestDeleteRecord(rec)}
                              className="px-2.5 py-1 text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Xóa toàn bộ bản ghi ca trực này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Admin Detail Panel */}
                        {isExpanded && (
                          <div className="border-t border-blue-200 bg-blue-50/20 p-4 space-y-4 animate-fade-in">
                            {/* Admin Controls Top Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-700" />
                                <span className="font-bold text-slate-800 text-xs">
                                  Bảng Quản Trị Trạng Thái Học Sinh Vắng Phòng {room?.code}
                                </span>
                              </div>

                              {/* Customize penalty points */}
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-600 font-medium">Mức trừ / 1 em không phép:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={rec.penaltyPointsPerUnexcused || 5}
                                  onChange={(e) => handleUpdatePenaltyPointsInHistory(rec, Number(e.target.value))}
                                  className="w-16 p-1 text-center font-bold border border-slate-300 rounded-lg bg-slate-50 text-rose-600 text-xs"
                                />
                                <span className="text-slate-500">điểm</span>
                              </div>
                            </div>

                            {/* List of Absent Students */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                  <span>Danh Sách Học Sinh Vắng Học ({absentItems.length} em)</span>
                                </h5>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowAllStudentsMap((prev) => ({ ...prev, [rec.id]: !prev[rec.id] }))
                                  }
                                  className="text-xs text-blue-700 hover:underline font-semibold"
                                >
                                  {showAll ? 'Chỉ hiện học sinh vắng' : `Hiện toàn bộ cả phòng (${items.length} em)`}
                                </button>
                              </div>

                              {absentItems.length === 0 && !showAll ? (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                      Buổi tự học này phòng <strong>{room?.code}</strong> đi học đầy đủ 100%, không có học sinh nào vắng học!
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {(showAll ? items : absentItems).map((stdItem, sIdx) => {
                                    const isUnexcused = stdItem.status === 'absent_unexcused';
                                    const isExcused = stdItem.status === 'absent_excused';
                                    const isPresent = stdItem.status === 'present';

                                    return (
                                      <div
                                        key={stdItem.studentId || sIdx}
                                        className={`p-3 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                                          isUnexcused
                                            ? 'bg-rose-50/90 border-rose-300 shadow-sm'
                                            : isExcused
                                            ? 'bg-blue-50/80 border-blue-200'
                                            : 'bg-white border-slate-200 opacity-80'
                                        }`}
                                      >
                                        {/* Student Info */}
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-400 w-5 text-center">
                                              {sIdx + 1}
                                            </span>
                                            <span className="font-bold text-slate-900 text-sm">
                                              {stdItem.studentName}
                                            </span>
                                            <span className="px-2 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold text-[11px]">
                                              Lớp {stdItem.className}
                                            </span>

                                            {/* Status Badge */}
                                            {isUnexcused && (
                                              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                                                <XCircle className="w-3 h-3" />
                                                Vắng không phép (-{rec.penaltyPointsPerUnexcused || 5}đ)
                                              </span>
                                            )}
                                            {isExcused && (
                                              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                                                <AlertCircle className="w-3 h-3" />
                                                Vắng có phép (0đ)
                                              </span>
                                            )}
                                            {isPresent && (
                                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                Có mặt
                                              </span>
                                            )}
                                          </div>

                                          {/* Editable Reason Note */}
                                          <div className="flex items-center gap-1.5 pl-7">
                                            <span className="text-[11px] text-slate-500 font-medium">Lý do:</span>
                                            <input
                                              type="text"
                                              placeholder="Nhập lý do vắng học..."
                                              defaultValue={stdItem.note || ''}
                                              onBlur={(e) =>
                                                handleUpdateStudentNoteInHistory(rec, stdItem.studentId, e.target.value)
                                              }
                                              className="p-1 px-2 text-xs border border-slate-300 rounded-lg outline-none bg-white font-normal w-full sm:w-64 focus:ring-1 focus:ring-blue-600"
                                            />
                                          </div>
                                        </div>

                                        {/* Admin Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-2 pl-7 md:pl-0">
                                          {/* Switch to Excused */}
                                          {isUnexcused && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleStudentStatusInHistory(rec, stdItem.studentId, 'absent_excused')
                                              }
                                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition flex items-center gap-1"
                                              title="Chuyển sang vắng có phép để hoàn trả điểm cho phòng"
                                            >
                                              <CheckCircle2 className="w-3 h-3" />
                                              Đổi sang Có phép (0đ)
                                            </button>
                                          )}

                                          {/* Switch to Unexcused */}
                                          {isExcused && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleStudentStatusInHistory(rec, stdItem.studentId, 'absent_unexcused')
                                              }
                                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition flex items-center gap-1"
                                              title="Chuyển sang vắng không phép (trừ điểm)"
                                            >
                                              <AlertCircle className="w-3 h-3" />
                                              Đổi sang Không phép
                                            </button>
                                          )}

                                          {/* DELETE ABSENCE BUTTON (Mark as Present & Refund Room Points) */}
                                          {!isPresent && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteAbsentStudent(rec, stdItem.studentId, stdItem.studentName)
                                              }
                                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] shadow-sm transition flex items-center gap-1.5"
                                              title="Xóa lượt vắng này: Chuyển em thành Có mặt và cộng lại điểm thi đua cho phòng"
                                            >
                                              <UserCheck className="w-3.5 h-3.5" />
                                              <span>Xóa Vắng (Cho Có Mặt)</span>
                                            </button>
                                          )}

                                          {/* If present, option to mark absent */}
                                          {isPresent && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleStudentStatusInHistory(rec, stdItem.studentId, 'absent_unexcused')
                                              }
                                              className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg font-medium text-[11px] transition"
                                            >
                                              Đánh dấu Vắng
                                            </button>
                                          )}

                                          {/* Remove student from record completely */}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveStudentFromRecord(rec, stdItem.studentId, stdItem.studentName)
                                            }
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 rounded-lg transition"
                                            title="Xóa hẳn học sinh này khỏi ca điểm danh"
                                          >
                                            <UserMinus className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Live recalculated score summary */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <span className="text-slate-600">
                                Kết quả sau khi Quản trị viên cập nhật: 
                                <strong className="text-slate-900 ml-1">
                                  {rec.totalPresent} có mặt • {rec.totalExcused} có phép • {rec.totalUnexcused} không phép
                                </strong>
                              </span>
                              <span className="font-bold text-rose-600">
                                Tổng điểm trừ phòng {room?.code}: -{rec.totalPenaltyScore} điểm
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Tùy chỉnh Sửa Ngày & Thứ Cho Từng Phòng */}
      {editDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    Sửa Ngày &amp; Thứ Điểm Danh - {rooms.find((r) => r.id === editDateModal.record.roomId)?.code}
                  </h4>
                  <p className="text-[11px] text-blue-100">
                    {rooms.find((r) => r.id === editDateModal.record.roomId)?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditDateModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Date picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ngày điểm danh mới (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  value={editDateModal.date}
                  onChange={(e) => {
                    const newD = e.target.value;
                    const detectedDay = getDayOfWeekFromDateString(newD);
                    const foundCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.key === detectedDay);
                    setEditDateModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            date: newD,
                            dayOfWeek: detectedDay,
                            sessionDay: foundCfg?.sessionLabel || prev.sessionDay,
                          }
                        : null
                    );
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Day of Week Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thứ trong tuần:
                  </label>
                  <select
                    value={editDateModal.dayOfWeek}
                    onChange={(e) => {
                      const newDay = e.target.value;
                      const foundCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.key === newDay);
                      setEditDateModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              dayOfWeek: newDay,
                              sessionDay: foundCfg?.sessionLabel || prev.sessionDay,
                            }
                          : null
                      );
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DAYS_OF_WEEK_CONFIG.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.key} ({d.sessionLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Buổi tự học:
                  </label>
                  <select
                    value={editDateModal.sessionDay}
                    onChange={(e) => {
                      const newSes = e.target.value;
                      const foundCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.sessionLabel === newSes);
                      setEditDateModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              sessionDay: newSes,
                              dayOfWeek: foundCfg?.key || prev.dayOfWeek,
                            }
                          : null
                      );
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DAYS_OF_WEEK_CONFIG.map((d) => (
                      <option key={d.sessionLabel} value={d.sessionLabel}>
                        {d.sessionLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Week Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tuần học thi đua:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={editDateModal.weekNumber}
                    onChange={(e) =>
                      setEditDateModal((prev) =>
                        prev ? { ...prev, weekNumber: Number(e.target.value) } : null
                      )
                    }
                    className="w-28 p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold text-center text-blue-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500">
                    (Tuần hiện tại của hệ thống: <strong>Tuần {currentWeek}</strong>)
                  </span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú ca tự học:
                </label>
                <input
                  type="text"
                  value={editDateModal.note}
                  onChange={(e) =>
                    setEditDateModal((prev) =>
                      prev ? { ...prev, note: e.target.value } : null
                    )
                  }
                  placeholder="Ghi chú buổi tự học..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditDateModal(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveSingleEditDate}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi Ngày / Thứ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Sửa Ngày & Thứ Đồng Loạt (Cho Các Phòng Đã Chọn hoặc Cả 25 Phòng) */}
      {batchEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">
                    {batchEditModal.scope === 'all25'
                      ? `ĐỔI NGÀY & THỨ CHO TOÀN BỘ 25 PHÒNG (TUẦN ${currentWeek})`
                      : `ĐỔI NGÀY & THỨ CHO ${batchEditModal.targetRecordIds.length} PHÒNG ĐÃ CHỌN`}
                  </h4>
                  <p className="text-[11px] text-indigo-100">
                    Cập nhật đồng bộ ngày và thứ trong tuần cho 25 phòng ở
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBatchEditModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Scope selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Phạm vi áp dụng thay đổi:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 cursor-pointer">
                    <input
                      type="radio"
                      name="batchScope"
                      checked={batchEditModal.scope === 'all25'}
                      onChange={() =>
                        setBatchEditModal((prev) =>
                          prev
                            ? {
                                ...prev,
                                scope: 'all25',
                                targetRecordIds: weekNightRecords.map((r) => r.id),
                              }
                            : null
                        )
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-indigo-950 block">
                        Toàn bộ 25 phòng ở ({weekNightRecords.length} bản ghi tuần {currentWeek})
                      </span>
                      <span className="text-[11px] text-indigo-700">
                        Áp dụng thay đổi ngày/thứ cho tất cả các phòng đã điểm danh trong tuần này
                      </span>
                    </div>
                  </label>

                  {selectedRecordIds.length > 0 && (
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="batchScope"
                        checked={batchEditModal.scope === 'selected'}
                        onChange={() =>
                          setBatchEditModal((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  scope: 'selected',
                                  targetRecordIds: selectedRecordIds,
                                }
                              : null
                          )
                        }
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          Chỉ {selectedRecordIds.length} phòng đang được chọn trong danh sách
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Chỉ cập nhật cho các phòng có dấu tick chọn
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Date picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn ngày điểm danh mới (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  value={batchEditModal.date}
                  onChange={(e) => {
                    const newD = e.target.value;
                    const detectedDay = getDayOfWeekFromDateString(newD);
                    const foundCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.key === detectedDay);
                    setBatchEditModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            date: newD,
                            dayOfWeek: detectedDay,
                            sessionDay: foundCfg?.sessionLabel || prev.sessionDay,
                          }
                        : null
                    );
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Day of Week */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thứ trong tuần:
                  </label>
                  <select
                    value={batchEditModal.dayOfWeek}
                    onChange={(e) => {
                      const newDay = e.target.value;
                      const foundCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.key === newDay);
                      setBatchEditModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              dayOfWeek: newDay,
                              sessionDay: foundCfg?.sessionLabel || prev.sessionDay,
                            }
                          : null
                      );
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS_OF_WEEK_CONFIG.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.key} ({d.sessionLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Buổi tự học:
                  </label>
                  <select
                    value={batchEditModal.sessionDay}
                    onChange={(e) => {
                      const newSes = e.target.value;
                      const foundCfg = DAYS_OF_WEEK_CONFIG.find((d) => d.sessionLabel === newSes);
                      setBatchEditModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              sessionDay: newSes,
                              dayOfWeek: foundCfg?.key || prev.dayOfWeek,
                            }
                          : null
                      );
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS_OF_WEEK_CONFIG.map((d) => (
                      <option key={d.sessionLabel} value={d.sessionLabel}>
                        {d.sessionLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Week Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tuần học thi đua:
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={batchEditModal.weekNumber}
                  onChange={(e) =>
                    setBatchEditModal((prev) =>
                      prev ? { ...prev, weekNumber: Number(e.target.value) } : null
                    )
                  }
                  className="w-28 p-2 border border-slate-300 rounded-xl bg-slate-50 font-bold text-center text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Info notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Xác nhận thông tin:</span>
                </div>
                <p>
                  Sẽ đổi đồng loạt sang ngày <strong>{batchEditModal.date}</strong> ({batchEditModal.dayOfWeek} - {batchEditModal.sessionDay}), Tuần{' '}
                  <strong>{batchEditModal.weekNumber}</strong> cho{' '}
                  <strong>
                    {batchEditModal.scope === 'all25'
                      ? `${weekNightRecords.length} phòng`
                      : `${batchEditModal.targetRecordIds.length} phòng đã chọn`}
                  </strong>
                  . Điểm thi đua và danh sách học sinh vắng của từng phòng được giữ nguyên.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBatchEditModal(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatchEditDate}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-indigo-700 hover:bg-indigo-800 shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {batchEditModal.scope === 'all25'
                      ? `Cập Nhật Cho Cả 25 Phòng`
                      : `Cập Nhật Cho ${batchEditModal.targetRecordIds.length} Phòng`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal (Fixes iframe window.confirm blocking) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all">
            <div
              className={`p-4 ${
                confirmModal.isDanger
                  ? 'bg-rose-50 border-b border-rose-200'
                  : 'bg-blue-50 border-b border-blue-200'
              } flex items-center gap-3`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  confirmModal.isDanger ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{confirmModal.title}</h4>
                <p className="text-[11px] text-slate-500">Xác nhận thao tác quản trị</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {confirmModal.message}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer active:scale-95 ${
                    confirmModal.isDanger
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmModal.confirmText || 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Floating Toast Notification (Fixes iframe window.alert blocking) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 bg-slate-950/95 text-white text-xs font-bold backdrop-blur-md">
          {toastMessage.type === 'success' && (
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          )}
          {toastMessage.type === 'info' && (
            <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {toastMessage.type === 'error' && (
            <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
              <X className="w-4 h-4" />
            </div>
          )}
          <span className="leading-tight">{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
