import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  AlertCircle, 
  Info, 
  Printer, 
  Moon, 
  GraduationCap, 
  Sparkles, 
  BedDouble, 
  CheckSquare 
} from 'lucide-react';
import { AppState, DepartmentPermission, DepartmentKey, DutyAssignment } from '../types';

interface DepartmentDutyManagerProps {
  state: AppState;
  onUpdatePermissions: (newPerms: DepartmentPermission[]) => void;
  onUpdateDutyAssignments: (newDuties: DutyAssignment[]) => void;
}

export const DepartmentDutyManager: React.FC<DepartmentDutyManagerProps> = ({
  state,
  onUpdatePermissions,
  onUpdateDutyAssignments,
}) => {
  const { departmentPermissions, dutyAssignments, currentUser, users } = state;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'bgh';

  const [activeTab, setActiveTab] = useState<'matrix' | 'schedule'>('matrix');

  // Duty assignment form state
  const [dayOfWeek, setDayOfWeek] = useState<'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN' | 'all'>('all');
  const [targetCategory, setTargetCategory] = useState<'muc1' | 'muc2' | 'muc3' | 'muc4' | 'muc5'>('muc1');
  const [department, setDepartment] = useState<DepartmentKey>('gv_tu_hoc_dem');
  const [assignedPersonName, setAssignedPersonName] = useState('Thầy Trần Hữu Đức');
  const [assignedRoomScope, setAssignedRoomScope] = useState<'all' | 'nam' | 'nu'>('all');
  const [shiftTime, setShiftTime] = useState('19h00 - 20h30');
  const [notes, setNotes] = useState('');

  // Handle permission toggle
  const handleTogglePerm = (deptKey: DepartmentKey, field: 'canMuc1' | 'canMuc2' | 'canMuc3' | 'canMuc4' | 'canMuc5') => {
    const updated = departmentPermissions.map((item) => {
      if (item.department === deptKey) {
        return {
          ...item,
          [field]: !item[field],
        };
      }
      return item;
    });
    onUpdatePermissions(updated);
  };

  const handleGrantAll = (deptKey: DepartmentKey) => {
    const updated = departmentPermissions.map((item) => {
      if (item.department === deptKey) {
        return {
          ...item,
          canMuc1: true,
          canMuc2: true,
          canMuc3: true,
          canMuc4: true,
          canMuc5: true,
        };
      }
      return item;
    });
    onUpdatePermissions(updated);
  };

  const handleRevokeAll = (deptKey: DepartmentKey) => {
    const updated = departmentPermissions.map((item) => {
      if (item.department === deptKey) {
        return {
          ...item,
          canMuc1: false,
          canMuc2: false,
          canMuc3: false,
          canMuc4: false,
          canMuc5: false,
        };
      }
      return item;
    });
    onUpdatePermissions(updated);
  };

  const handleAddDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedPersonName.trim()) return;

    const categoryLabels: Record<string, string> = {
      muc1: 'Mục 1: Điểm danh tự học đêm (19h-20h30)',
      muc2: 'Mục 2: Điểm danh chính khóa',
      muc3: 'Mục 3: Chấm điểm Vệ sinh & nề nếp',
      muc4: 'Mục 4: Chấm Nề nếp sinh hoạt & trật tự',
      muc5: 'Mục 5: Chấp hành nội quy & hoạt động',
    };

    const dayLabels: Record<string, string> = {
      all: 'Tối T2 đến T5',
      T2: 'Thứ 2',
      T3: 'Thứ 3',
      T4: 'Thứ 4',
      T5: 'Thứ 5',
      T6: 'Thứ 6',
      T7: 'Thứ 7',
      CN: 'Chủ nhật',
    };

    const newDuty: DutyAssignment = {
      id: `duty_${Date.now()}`,
      dayOfWeek,
      dayName: dayLabels[dayOfWeek] || dayOfWeek,
      targetCategory,
      categoryLabel: categoryLabels[targetCategory] || targetCategory,
      department,
      assignedPersonName: assignedPersonName.trim(),
      assignedRoomScope,
      shiftTime: shiftTime.trim(),
      notes: notes.trim() || undefined,
    };

    onUpdateDutyAssignments([newDuty, ...dutyAssignments]);
    setNotes('');
  };

  const handleDeleteDuty = (dutyId: string) => {
    onUpdateDutyAssignments(dutyAssignments.filter((d) => d.id !== dutyId));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Quy Chế Hoạt Động • Ban Quản sinh PTDTBT THCS Trà Đốc
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Phân Công &amp; Phân Quyền Các Bộ Phận Chấm Điểm &amp; Điểm Danh
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Cấu hình quyền hạn chấm điểm Mục 3, 4, 5 và điểm danh Mục 1, 2 cho: Giáo viên trực tự học đêm, Thành viên ban quản sinh, BGH, Tổng phụ trách, Đoàn thanh niên, Đội tự quản.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/10 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'matrix' ? 'bg-amber-400 text-blue-950 font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                Ma Trận Phân Quyền
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'schedule' ? 'bg-amber-400 text-blue-950 font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                Lịch Phân Công Trực Tuần
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 1: Permissions Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-700" />
                  Bảng Phân Quyền Chức Năng Cho Từng Bộ Phận
                </h3>
                <p className="text-xs text-slate-500">
                  Tích chọn các mục nhiệm vụ mà bộ phận được phép thực hiện. Thay đổi được lưu tự động và áp dụng ngay trong toàn bộ phần mềm.
                </p>
              </div>

              {!isAdmin && (
                <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                  Chỉ Thầy Nguyễn Trọng Nghĩa &amp; BGH có quyền sửa đổi ma trận phân quyền
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-64">Bộ Phận / Ban Phụ Trách</th>
                    <th className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Mục 1: Tự học đêm</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal">19h00 - 20h30</div>
                    </th>
                    <th className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                        <span>Mục 2: Chính khóa</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal">Sáng &amp; Chiều</div>
                    </th>
                    <th className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mục 3: Vệ sinh</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal">Có ảnh minh chứng</div>
                    </th>
                    <th className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mục 4: Nề nếp</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal">Giờ giấc / Trật tự</div>
                    </th>
                    <th className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                        <span>Mục 5: Nội quy</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal">Lao động / TDTT</div>
                    </th>
                    <th className="py-3 px-3 text-center w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departmentPermissions.map((perm) => {
                    const isKeyDept = [
                      'gv_tu_hoc_dem',
                      'thanh_vien_quan_sinh',
                      'bgh',
                      'tong_phu_trach',
                      'doan_thanh_nien',
                      'doi_tu_quan',
                    ].includes(perm.department);

                    return (
                      <tr 
                        key={perm.department} 
                        className={`hover:bg-slate-50 transition ${isKeyDept ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {perm.departmentName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Mã: {perm.department}
                            {isKeyDept && (
                              <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold font-sans">
                                Trọng tâm
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Can Muc 1 */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canMuc1}
                            disabled={!isAdmin && currentUser.role !== 'admin'}
                            onChange={() => handleTogglePerm(perm.department, 'canMuc1')}
                            className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                          />
                        </td>

                        {/* Can Muc 2 */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canMuc2}
                            disabled={!isAdmin && currentUser.role !== 'admin'}
                            onChange={() => handleTogglePerm(perm.department, 'canMuc2')}
                            className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                          />
                        </td>

                        {/* Can Muc 3 */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canMuc3}
                            disabled={!isAdmin && currentUser.role !== 'admin'}
                            onChange={() => handleTogglePerm(perm.department, 'canMuc3')}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                          />
                        </td>

                        {/* Can Muc 4 */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canMuc4}
                            disabled={!isAdmin && currentUser.role !== 'admin'}
                            onChange={() => handleTogglePerm(perm.department, 'canMuc4')}
                            className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                          />
                        </td>

                        {/* Can Muc 5 */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.canMuc5}
                            disabled={!isAdmin && currentUser.role !== 'admin'}
                            onChange={() => handleTogglePerm(perm.department, 'canMuc5')}
                            className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                          />
                        </td>

                        {/* Fast actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleGrantAll(perm.department)}
                              disabled={!isAdmin && currentUser.role !== 'admin'}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-semibold transition"
                              title="Cấp toàn bộ quyền"
                            >
                              Tất cả
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevokeAll(perm.department)}
                              disabled={!isAdmin && currentUser.role !== 'admin'}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 font-semibold transition"
                              title="Bỏ toàn bộ quyền"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Ghi chú phân quyền Ban Quản sinh:</strong> Khi một bộ phận được cấp quyền ở mục nào, giáo viên/thành viên thuộc bộ phận đó sẽ có thể vào chấm điểm, đánh giá và tải hình ảnh minh chứng ở mục tương ứng. Bộ phận không có quyền sẽ được thông báo khi chấm hoặc cần Trưởng ban quản sinh phê duyệt.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Duty Assignment Schedule */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Add Assignment Form */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Phân Công Ca Trực Mới
              </h3>

              <form onSubmit={handleAddDuty} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thời gian / Buổi trực:
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-slate-50 font-bold"
                  >
                    <option value="all">Tối Thứ 2 đến Thứ 5 (Tự học đêm)</option>
                    <option value="T2">Thứ 2 hàng tuần</option>
                    <option value="T3">Thứ 3 hàng tuần</option>
                    <option value="T4">Thứ 4 hàng tuần</option>
                    <option value="T5">Thứ 5 hàng tuần</option>
                    <option value="T6">Thứ 6 hàng tuần</option>
                    <option value="T7">Thứ 7 hàng tuần</option>
                    <option value="CN">Chủ nhật</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nội dung nhiệm vụ chấm / điểm danh:
                  </label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-slate-50 font-bold text-blue-800"
                  >
                    <option value="muc1">Mục 1: Điểm danh tự học đêm (19h-20h30)</option>
                    <option value="muc2">Mục 2: Điểm danh chính khóa (Sáng/Chiều)</option>
                    <option value="muc3">Mục 3: Chấm điểm Vệ sinh &amp; Nề nếp (25 phòng)</option>
                    <option value="muc4">Mục 4: Chấm Nề nếp sinh hoạt &amp; Tắt đèn ngủ</option>
                    <option value="muc5">Mục 5: Chấp hành nội quy &amp; Hoạt động tập thể</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bộ phận thực hiện:
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as DepartmentKey)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-slate-50 font-semibold"
                  >
                    {departmentPermissions.map((d) => (
                      <option key={d.department} value={d.department}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người / Đội phụ trách cụ thể:
                  </label>
                  <input
                    type="text"
                    value={assignedPersonName}
                    onChange={(e) => setAssignedPersonName(e.target.value)}
                    placeholder="VD: Thầy Trần Hữu Đức, Đội Tự Quản Khu Nam..."
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phạm vi phòng:
                    </label>
                    <select
                      value={assignedRoomScope}
                      onChange={(e) => setAssignedRoomScope(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-slate-50 font-semibold"
                    >
                      <option value="all">Toàn bộ 25 phòng</option>
                      <option value="nam">12 phòng Khu Nam</option>
                      <option value="nu">13 phòng Khu Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Khung giờ trực:
                    </label>
                    <input
                      type="text"
                      value={shiftTime}
                      onChange={(e) => setShiftTime(e.target.value)}
                      placeholder="19h00 - 20h30"
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yêu cầu / Ghi chú ca trực:
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhiệm vụ cụ thể, hướng dẫn..."
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Phân Công Trực
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Duty List / Schedule */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-700" />
                    Lịch Phân Công Trực &amp; Chấm Điểm Ban Quản Sinh ({dutyAssignments.length} ca trực)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bảng phân công nhiệm vụ cụ thể hàng tuần của các thầy cô và các bộ phận
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                  title="In lịch trực"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>In lịch trực</span>
                </button>
              </div>

              {dutyAssignments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                  Chưa có ca phân công trực nào. Hãy điền form bên trái để thêm ca trực.
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {dutyAssignments.map((duty) => {
                    const deptInfo = departmentPermissions.find((d) => d.department === duty.department);

                    return (
                      <div
                        key={duty.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px]">
                              {duty.dayName}
                            </span>
                            <span className="font-semibold text-slate-800 text-sm">
                              {duty.categoryLabel}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {duty.shiftTime}
                            </span>
                          </div>

                          <div className="text-slate-600">
                            Phụ trách: <strong className="text-blue-800">{duty.assignedPersonName}</strong> • Bộ phận: <strong>{deptInfo?.departmentName || duty.department}</strong>
                          </div>

                          <div className="text-slate-500 text-[11px] flex items-center gap-2">
                            <span>Phạm vi: <strong>{duty.assignedRoomScope === 'all' ? 'Toàn bộ 25 phòng' : duty.assignedRoomScope === 'nam' ? '12 phòng Khu Nam' : '13 phòng Khu Nữ'}</strong></span>
                            {duty.notes && (
                              <span>• Ghi chú: {duty.notes}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleDeleteDuty(duty.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Xóa phân công"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}
    </div>
  );
};
