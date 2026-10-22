import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Upload, 
  Save, 
  Plus, 
  CheckCircle2, 
  UserCheck, 
  X, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { AppState, Room, Student, Gender } from '../types';

interface RoomManagementProps {
  state: AppState;
  onUpdateRoom: (updatedRoom: Room) => void;
  onBatchUpdateStudents: (roomId: string, newStudents: Student[]) => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  state,
  onUpdateRoom,
  onBatchUpdateStudents,
}) => {
  const { rooms, users } = state;

  const [activeAreaFilter, setActiveAreaFilter] = useState<'all' | 'nam' | 'nu'>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'room_01');

  // Modal for batch import
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchRawText, setBatchRawText] = useState('');
  const [batchParsePreview, setBatchParsePreview] = useState<{ name: string; className: string }[]>([]);

  // Add individual student form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('6/1');
  const [newStudentIsLeader, setNewStudentIsLeader] = useState(false);
  const [newStudentNote, setNewStudentNote] = useState('');

  // Editing room details
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const [editTeacherName, setEditTeacherName] = useState(selectedRoom?.managerTeacherName || '');
  const [manualCount, setManualCount] = useState<number>(
    selectedRoom?.studentCountManual || selectedRoom?.students?.length || 0
  );

  React.useEffect(() => {
    if (selectedRoom) {
      setEditTeacherName(selectedRoom.managerTeacherName);
      setManualCount(selectedRoom.studentCountManual || selectedRoom.students?.length || 0);
    }
  }, [selectedRoomId, selectedRoom]);

  // Parse batch raw text on change
  const handleBatchTextChange = (text: string) => {
    setBatchRawText(text);
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const parsed: { name: string; className: string }[] = [];

    lines.forEach((line) => {
      // split by tab, comma, or semicolon
      let parts = line.split('\t');
      if (parts.length < 2) parts = line.split(',');
      if (parts.length < 2) parts = line.split(';');

      const name = parts[0]?.trim();
      const className = parts[1]?.trim() || 'Chưa xếp lớp';
      if (name) {
        parsed.push({ name, className });
      }
    });

    setBatchParsePreview(parsed);
  };

  const handleApplyBatchImport = () => {
    if (!selectedRoom || batchParsePreview.length === 0) return;

    const newStudents: Student[] = batchParsePreview.map((item, idx) => ({
      id: `std_${selectedRoom.gender}_${selectedRoom.code}_${Date.now()}_${idx}`,
      name: item.name,
      gender: selectedRoom.gender,
      className: item.className,
      isRoomLeader: idx === 0,
      notes: idx === 0 ? 'Trưởng phòng' : undefined,
    }));

    onBatchUpdateStudents(selectedRoom.id, newStudents);
    setIsBatchModalOpen(false);
    setBatchRawText('');
    setBatchParsePreview([]);
  };

  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !newStudentName.trim()) return;

    const newStd: Student = {
      id: `std_${selectedRoom.gender}_${selectedRoom.code}_${Date.now()}`,
      name: newStudentName.trim(),
      gender: selectedRoom.gender,
      className: newStudentClass.trim(),
      isRoomLeader: newStudentIsLeader,
      notes: newStudentNote.trim() || undefined,
    };

    const updated = {
      ...selectedRoom,
      students: [...(selectedRoom.students || []), newStd],
      studentCountManual: (selectedRoom.students?.length || 0) + 1,
    };

    onUpdateRoom(updated);
    setNewStudentName('');
    setNewStudentNote('');
    setNewStudentIsLeader(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!selectedRoom) return;
    const updated = {
      ...selectedRoom,
      students: selectedRoom.students.filter((s) => s.id !== studentId),
      studentCountManual: Math.max(0, (selectedRoom.students.length || 1) - 1),
    };
    onUpdateRoom(updated);
  };

  const handleSaveRoomSettings = () => {
    if (!selectedRoom) return;
    const updated: Room = {
      ...selectedRoom,
      managerTeacherName: editTeacherName,
      studentCountManual: Number(manualCount),
    };
    onUpdateRoom(updated);
  };

  const filteredRooms = rooms.filter((r) => {
    if (activeAreaFilter === 'nam') return r.gender === 'nam';
    if (activeAreaFilter === 'nu') return r.gender === 'nu';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Quản Trị Phòng Ở &amp; Học Sinh • Ban Quản sinh Trà Đốc
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Quản Lý 25 Phòng Ở (12 Khu Nam - 13 Khu Nữ)
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Phân công giáo viên phụ trách, nhập danh sách học sinh theo phòng và nhập đồng loạt copy-paste từ Excel.
              </p>
            </div>
          </div>
          <div className="text-xs bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20">
            25 phòng • <strong>{rooms.reduce((s, r) => s + (r.students?.length || 0), 0)} học sinh</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 25 Room List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveAreaFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  activeAreaFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                Tất cả (25)
              </button>
              <button
                onClick={() => setActiveAreaFilter('nam')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  activeAreaFilter === 'nam' ? 'bg-blue-800 text-white shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                Nam (12)
              </button>
              <button
                onClick={() => setActiveAreaFilter('nu')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  activeAreaFilter === 'nu' ? 'bg-rose-800 text-white shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                Nữ (13)
              </button>
            </div>

            {/* Room cards */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredRooms.map((r) => {
                const isSelected = r.id === selectedRoomId;
                const isMale = r.gender === 'nam';
                const count = r.students?.length || r.studentCountManual || 0;

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoomId(r.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? isMale
                          ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-400'
                          : 'bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isMale ? 'bg-blue-800 text-white' : 'bg-rose-800 text-white'
                      }`}>
                        {r.code}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          GV: <strong className="text-slate-700">{r.managerTeacherName}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {count} em
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Room Details & Student Roster */}
        <div className="lg:col-span-2 space-y-4">
          {/* Room Configuration Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase text-white ${
                  selectedRoom?.gender === 'nam' ? 'bg-blue-800' : 'bg-rose-800'
                }`}>
                  {selectedRoom?.code}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedRoom?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khu vực: <strong>{selectedRoom?.gender === 'nam' ? 'Khu Nam (12 phòng)' : 'Khu Nữ (13 phòng)'}</strong>
                  </p>
                </div>
              </div>

              {/* Action: Open Batch Import Modal */}
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Nhập Đồng Loạt Học Sinh (Copy-Paste)
              </button>
            </div>

            {/* Room Settings (Teacher & Manual Student Count) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giáo viên phụ trách phòng:
                </label>
                <input
                  type="text"
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số lượng học sinh phòng:
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={manualCount}
                  onChange={(e) => setManualCount(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg text-center bg-white font-bold"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSaveRoomSettings}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Lưu Cài Đặt Phòng
                </button>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Danh Sách Học Sinh Phòng {selectedRoom?.code} ({selectedRoom?.students?.length || 0} em)
              </h4>
              <span className="text-xs text-slate-500">
                Tính tổng tự động vào sĩ số toàn trường
              </span>
            </div>

            {/* Add single student mini-form */}
            <form onSubmit={handleAddSingleStudent} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                placeholder="Họ và tên học sinh..."
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white w-full"
              />
              <select
                value={newStudentClass}
                onChange={(e) => setNewStudentClass(e.target.value)}
                className="text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-medium w-full sm:w-28"
              >
                <option value="6/1">Lớp 6/1</option>
                <option value="6/2">Lớp 6/2</option>
                <option value="7/1">Lớp 7/1</option>
                <option value="7/2">Lớp 7/2</option>
                <option value="8/1">Lớp 8/1</option>
                <option value="8/2">Lớp 8/2</option>
                <option value="9/1">Lớp 9/1</option>
                <option value="9/2">Lớp 9/2</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStudentIsLeader}
                  onChange={(e) => setNewStudentIsLeader(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Trưởng phòng</span>
              </label>
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 w-full sm:w-auto justify-center shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm em này
              </button>
            </form>

            {/* Students table */}
            {(!selectedRoom?.students || selectedRoom.students.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                Phòng này chưa có học sinh nào. Bấm &ldquo;Nhập Đồng Loạt Học Sinh&rdquo; để dán danh sách từ Excel hoặc thêm từng em ở ô trên.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">STT</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3 text-center w-20">Lớp</th>
                      <th className="py-2.5 px-3 text-center w-28">Vai trò</th>
                      <th className="py-2.5 px-3">Ghi chú</th>
                      <th className="py-2.5 px-3 text-right w-16">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRoom.students.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {student.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-700">
                          {student.className}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {student.isRoomLeader ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Trưởng phòng
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {student.notes || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Import Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  Nhập Đồng Loạt Học Sinh Phòng {selectedRoom?.code}
                </h3>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Hướng dẫn dán danh sách học sinh:
                </div>
                <p>
                  Copy danh sách từ Excel hoặc Word rồi dán vào ô bên dưới. Mỗi dòng một học sinh:
                  <br />
                  <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">
                    Họ và tên, Lớp
                  </code>{' '}
                  hoặc{' '}
                  <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">
                    Họ và tên [tab] Lớp
                  </code>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Dán nội dung danh sách vào đây:
                </label>
                <textarea
                  rows={8}
                  value={batchRawText}
                  onChange={(e) => handleBatchTextChange(e.target.value)}
                  placeholder={`Ví dụ:\nHồ Văn Sang, 6/1\nĐinh Văn Kiên, 6/2\nALăng Phúc, 7/1\nZơrâm Bảo, 7/2\nNguyễn Văn Nam, 8/1`}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Parsed Preview */}
              {batchParsePreview.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">
                    Xem trước kết quả nhận diện ({batchParsePreview.length} học sinh):
                  </h4>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y">
                    {batchParsePreview.map((item, i) => (
                      <div key={i} className="p-2 flex items-center justify-between bg-slate-50">
                        <span className="font-semibold text-slate-800">
                          {i + 1}. {item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                          {item.className}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={batchParsePreview.length === 0}
                onClick={handleApplyBatchImport}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác Nhận Nạp {batchParsePreview.length} Học Sinh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
