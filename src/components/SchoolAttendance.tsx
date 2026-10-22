import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Trash2, 
  Sun, 
  Sunrise 
} from 'lucide-react';
import { AppState, Room, AttendanceRecord, AttendanceStatus, StudentAttendanceItem, DepartmentKey } from '../types';

interface SchoolAttendanceProps {
  state: AppState;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (recordId: string) => void;
}

export const SchoolAttendance: React.FC<SchoolAttendanceProps> = ({
  state,
  onSaveAttendance,
  onDeleteAttendance,
}) => {
  const { rooms, users, currentUser, currentWeek, attendanceRecords, departmentPermissions } = state;

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'room_01');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentKey>('tong_phu_trach');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(currentUser.id);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState<'morning' | 'afternoon'>('morning');
  const [penaltyPerUnexcused, setPenaltyPerUnexcused] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const selectedTeacher = users.find((u) => u.id === selectedTeacherId) || currentUser;
  const deptPermission = departmentPermissions?.find((d) => d.department === selectedDepartment);
  const isPermitted = deptPermission ? deptPermission.canMuc2 : true;

  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

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

    const sessionLabel = session === 'morning' ? 'Chính khóa Buổi Sáng' : 'Chính khóa Buổi Chiều';

    const newRecord: AttendanceRecord = {
      id: `att_formal_${Date.now()}`,
      type: 'formal_class',
      roomId: selectedRoom.id,
      date,
      weekNumber: currentWeek,
      session,
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
      note: notes ? `${sessionLabel} - ${notes}` : sessionLabel,
      items,
    };

    onSaveAttendance(newRecord);
  };

  const weekFormalRecords = attendanceRecords.filter(
    (r) => r.type === 'formal_class' && r.weekNumber === currentWeek
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-400 text-blue-950 flex items-center justify-center font-bold shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Mục 2 • Ban Quản sinh PTDTBT THCS Trà Đốc
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Điểm Danh Học Sinh Đi Học Chính Khóa (Sáng / Chiều)
              </h2>
              <p className="text-xs text-sky-200 mt-0.5">
                Theo dõi chuyên cần theo từng phòng ở. Học sinh vắng không phép bị trừ điểm thi đua của phòng ở đó.
              </p>
            </div>
          </div>
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 text-xs">
            Ca học: <strong>Buổi Sáng &amp; Buổi Chiều</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              Chọn Phòng Ở &amp; Buổi Học
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn phòng (trong 25 phòng ở):
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-600 outline-none"
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
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1" title="Chưa được cấp quyền Mục 2 trong Ma Trận">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Chưa phân quyền
                  </span>
                )}
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as DepartmentKey)}
                className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-600 outline-none"
              >
                <option value="tong_phu_trach">Tổng phụ trách Đội (Mặc định)</option>
                <option value="thanh_vien_quan_sinh">Thành viên Ban Quản sinh</option>
                <option value="bgh">Ban Giám Hiệu (BGH)</option>
                <option value="gv_phu_trach">Giáo viên trực phòng / phụ trách</option>
                <option value="doi_tu_quan">Đội Tự Quản (Học sinh cán sự)</option>
                <option value="admin">Trưởng Ban Quản sinh (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người điểm danh cụ thể:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buổi học:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSession('morning')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                      session === 'morning'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Sunrise className="w-3.5 h-3.5 text-amber-600" />
                    Sáng
                  </button>
                  <button
                    type="button"
                    onClick={() => setSession('afternoon')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                      session === 'afternoon'
                        ? 'bg-sky-100 text-sky-900 border-sky-300 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-sky-600" />
                    Chiều
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày điểm danh:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>

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
                Trừ trực tiếp vào điểm thi đua phòng {selectedRoom?.code}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Kiểm tra chuyên cần tiết 1..."
                className="w-full text-xs p-2 border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs uppercase font-bold text-sky-400 mb-2">
              Chuyên cần chính khóa {selectedRoom?.code}
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

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Học sinh phòng {selectedRoom?.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
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
                Đi học đầy đủ 100%
              </button>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có danh sách học sinh. Vui lòng vào tab &ldquo;25 Phòng &amp; Học Sinh&rdquo; để nhập!
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
                            Lớp: <strong className="text-sky-700">{student.className}</strong>
                            {student.notes && ` • ${student.notes}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
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
                          Đi học
                        </button>

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
                          Có phép (0đ)
                        </button>

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

                        {(isExcused || isUnexcused) && (
                          <input
                            type="text"
                            placeholder="Ghi chú lý do..."
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

            <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-800 hover:to-blue-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-xs sm:text-sm"
              >
                <Save className="w-4 h-4" />
                Lưu Điểm Danh Chính Khóa {selectedRoom?.code}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              Lịch sử điểm danh chính khóa Tuần {currentWeek}
            </h4>

            {weekFormalRecords.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có bản ghi điểm danh nào trong tuần {currentWeek}.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {weekFormalRecords.map((rec) => {
                  const room = rooms.find((r) => r.id === rec.roomId);
                  return (
                    <div
                      key={rec.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-700 px-1.5 py-0.5 rounded bg-sky-100">
                          {room?.code || rec.roomId}
                        </span>
                        <span className="text-slate-600">
                          {rec.date} • {rec.session === 'morning' ? 'Buổi sáng' : 'Buổi chiều'}
                        </span>
                        <span className="text-slate-400">
                          (GV: {rec.teacherName})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600">
                          Đi học: <strong>{rec.totalPresent}</strong> • Vắng KP: <strong className="text-rose-600">{rec.totalUnexcused}</strong>
                        </span>
                        <span className="font-bold text-rose-600">
                          -{rec.totalPenaltyScore}đ
                        </span>
                        <button
                          onClick={() => onDeleteAttendance(rec.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Xóa bản ghi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
