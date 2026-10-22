import React, { useState } from 'react';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Building2, 
  User, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  Eye, 
  Image as ImageIcon,
  Award
} from 'lucide-react';
import { AppState, EvaluationRecord, PhotoProof, ScoreViolationItem, UserRole, DepartmentKey } from '../types';

interface EvaluationSectionProps {
  state: AppState;
  categoryType: 'muc3_ve_sinh' | 'muc4_ne_nep' | 'muc5_noi_quy' | 'custom';
  title: string;
  subTitle: string;
  badgeText: string;
  themeColor: 'emerald' | 'amber' | 'rose' | 'indigo';
  suggestions: { text: string; penalty: number }[];
  onSaveEvaluation: (record: EvaluationRecord) => void;
  onDeleteEvaluation: (recordId: string) => void;
  onViewPhoto: (photo: PhotoProof) => void;
}

export const EvaluationSection: React.FC<EvaluationSectionProps> = ({
  state,
  categoryType,
  title,
  subTitle,
  badgeText,
  themeColor,
  suggestions,
  onSaveEvaluation,
  onDeleteEvaluation,
  onViewPhoto,
}) => {
  const { rooms, users, currentUser, currentWeek, evaluationRecords, departmentPermissions } = state;

  const defaultDept: DepartmentKey = 
    categoryType === 'muc3_ve_sinh' ? 'thanh_vien_quan_sinh' :
    categoryType === 'muc4_ne_nep' ? 'gv_ngu_lai' :
    categoryType === 'muc5_noi_quy' ? 'tong_phu_trach' : 'thanh_vien_quan_sinh';

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'room_01');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentKey>(defaultDept);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(currentUser.id);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [evalTime, setEvalTime] = useState<string>(
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
  const [baseScore, setBaseScore] = useState<number>(100);
  const [bonusScore, setBonusScore] = useState<number>(0);
  const [generalComment, setGeneralComment] = useState<string>('');

  const deptPermission = departmentPermissions?.find((d) => d.department === selectedDepartment);
  const isPermitted = deptPermission 
    ? (categoryType === 'muc3_ve_sinh' ? deptPermission.canMuc3 :
       categoryType === 'muc4_ne_nep' ? deptPermission.canMuc4 :
       categoryType === 'muc5_noi_quy' ? deptPermission.canMuc5 : true)
    : true;

  // Violations list
  const [violations, setViolations] = useState<{ id: string; description: string; penalty: number }[]>([]);
  const [customDesc, setCustomDesc] = useState<string>('');
  const [customPenalty, setCustomPenalty] = useState<number>(5);

  // Photos
  const [photos, setPhotos] = useState<PhotoProof[]>([]);
  const [photoCaption, setPhotoCaption] = useState<string>('');

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const selectedTeacher = users.find((u) => u.id === selectedTeacherId) || currentUser;

  // Add suggestion
  const handleAddSuggestion = (sug: { text: string; penalty: number }) => {
    setViolations((prev) => [
      ...prev,
      {
        id: `v_${Date.now()}_${Math.random()}`,
        description: sug.text,
        penalty: sug.penalty,
      },
    ]);
  };

  // Add custom violation
  const handleAddCustomViolation = () => {
    if (!customDesc.trim()) return;
    setViolations((prev) => [
      ...prev,
      {
        id: `v_${Date.now()}`,
        description: customDesc.trim(),
        penalty: Number(customPenalty) || 0,
      },
    ]);
    setCustomDesc('');
  };

  const handleRemoveViolation = (id: string) => {
    setViolations((prev) => prev.filter((v) => v.id !== id));
  };

  // Photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const nowStr = new Date().toLocaleString('vi-VN');
      const newPhoto: PhotoProof = {
        id: `photo_${Date.now()}`,
        url: result,
        caption: photoCaption.trim() || `Minh chứng chấm ${selectedRoom?.code}`,
        uploadedAt: nowStr,
        uploadedBy: selectedTeacher.name,
      };
      setPhotos((prev) => [...prev, newPhoto]);
      setPhotoCaption('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Score calculations
  const totalPenalty = violations.reduce((sum, v) => sum + v.penalty, 0);
  const finalScore = Math.max(0, baseScore - totalPenalty + bonusScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const nowIso = new Date().toISOString();
    const violationItems: ScoreViolationItem[] = violations.map((v) => ({
      id: v.id,
      criterionId: categoryType,
      description: v.description,
      penaltyPoints: v.penalty,
      photoProofs: photos,
    }));

    const newRecord: EvaluationRecord = {
      id: `eval_${categoryType}_${Date.now()}`,
      type: categoryType,
      roomId: selectedRoom.id,
      date,
      weekNumber: currentWeek,
      month: new Date(date).getMonth() + 1,
      year: new Date(date).getFullYear(),
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      teacherRole: selectedTeacher.role,
      department: selectedDepartment,
      departmentName: deptPermission?.departmentName || selectedDepartment,
      evaluationTime: evalTime,
      proofUploadTime: photos.length > 0 ? photos[0].uploadedAt : undefined,
      baseScore,
      violations: violationItems,
      bonusScore,
      totalPenaltyScore: totalPenalty,
      finalScore,
      generalComment,
      photoProofs: photos,
    };

    onSaveEvaluation(newRecord);
    // Reset violations & photos for next room
    setViolations([]);
    setPhotos([]);
    setGeneralComment('');
  };

  // Filter history
  const historyRecords = evaluationRecords.filter(
    (e) => e.type === categoryType && e.weekNumber === currentWeek
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`p-5 rounded-2xl shadow-md text-white ${
        themeColor === 'emerald'
          ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
          : themeColor === 'amber'
          ? 'bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900'
          : themeColor === 'rose'
          ? 'bg-gradient-to-r from-rose-900 via-red-900 to-slate-900'
          : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold shadow-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                {badgeText} • Ban Quản sinh PTDTBT THCS Trà Đốc
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
              <p className="text-xs text-white/80 mt-0.5">{subTitle}</p>
            </div>
          </div>
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 text-xs">
            Định mức: <strong>{baseScore} điểm</strong> (Tùy chỉnh trừ/cộng)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room & Teacher & Base Settings */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Thông Tin Chấm Điểm
            </h3>

            {/* Room */}
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
                  Bộ phận thực hiện chấm điểm:
                </label>
                {isPermitted ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Có quyền
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1" title="Chưa được cấp quyền mục này trong Ma Trận">
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
                <option value="thanh_vien_quan_sinh">Thành viên Ban Quản sinh</option>
                <option value="gv_tu_hoc_dem">Giáo viên trực tự học đêm</option>
                <option value="gv_ngu_lai">Giáo viên trực đêm ngủ lại</option>
                <option value="tong_phu_trach">Tổng phụ trách Đội</option>
                <option value="doan_thanh_nien">Đoàn Thanh niên</option>
                <option value="doi_tu_quan">Đội Tự Quản (Học sinh cán sự)</option>
                <option value="bgh">Ban Giám Hiệu (BGH)</option>
                <option value="gv_phu_trach">Giáo viên phụ trách phòng</option>
                <option value="y_te">Cán bộ Y tế</option>
                <option value="thanh_tra">Ban Thanh tra</option>
                <option value="admin">Trưởng Ban Quản sinh (Admin)</option>
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Người chấm điểm cụ thể:
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

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày chấm:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời gian chấm:
                </label>
                <input
                  type="time"
                  value={evalTime}
                  onChange={(e) => setEvalTime(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Base score & Bonus */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm định mức:
                </label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={baseScore}
                  onChange={(e) => setBaseScore(Number(e.target.value))}
                  className="w-full text-sm font-bold p-1.5 border border-slate-300 rounded-lg text-center bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Điểm cộng (+):
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={bonusScore}
                  onChange={(e) => setBonusScore(Number(e.target.value))}
                  className="w-full text-sm font-bold p-1.5 border border-slate-300 rounded-lg text-center bg-white text-emerald-600"
                />
              </div>
            </div>

            {/* General comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhận xét tổng quát:
              </label>
              <textarea
                rows={2}
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                placeholder="Nhận xét tình hình phòng ở..."
                className="w-full text-xs p-2 border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Result Score Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs uppercase font-bold text-amber-400 mb-3 flex items-center justify-between">
              <span>Kết Quả Điểm Mục Này</span>
              <span className="text-[10px] text-slate-400 font-normal">{selectedRoom?.code}</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Điểm định mức:</span>
                <span className="font-semibold">{baseScore}đ</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Tổng điểm trừ ({violations.length} lỗi):</span>
                <span className="font-bold">-{totalPenalty}đ</span>
              </div>
              {bonusScore > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Điểm thưởng cộng:</span>
                  <span className="font-bold">+{bonusScore}đ</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                <span className="font-bold text-white">Điểm thi đua còn lại:</span>
                <span className="text-2xl font-black text-amber-400">
                  {finalScore}đ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Violations, Suggestions & Photo Proofs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
            {/* Quick Suggestions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Gợi ý vi phạm thường gặp (Bấm để thêm nhanh):
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSuggestion(sug)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>{sug.text}</span>
                    <span className="text-rose-600 font-bold">(-{sug.penalty}đ)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Violation Form */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Nhập vi phạm khác / Tùy chỉnh số điểm trừ:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Mô tả lỗi vi phạm cụ thể..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white"
                />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600">Trừ:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customPenalty}
                      onChange={(e) => setCustomPenalty(Number(e.target.value))}
                      className="w-16 text-xs p-2 border border-slate-300 rounded-lg text-center bg-white font-bold text-rose-600"
                    />
                    <span className="text-xs text-slate-600">điểm</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomViolation}
                    className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm lỗi
                  </button>
                </div>
              </div>
            </div>

            {/* Active Violations List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between">
                <span>Danh sách lỗi vi phạm bị trừ điểm ({violations.length})</span>
                {violations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViolations([])}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Xóa tất cả lỗi
                  </button>
                )}
              </h4>

              {violations.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Phòng đạt chuẩn xuất sắc! Chưa có lỗi vi phạm nào được ghi nhận.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {violations.map((v, i) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{v.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-rose-600 text-sm">
                          -{v.penalty}đ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveViolation(v.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photo Proof Upload Section - Explicitly requested! */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Tải Hình Ảnh Minh Chứng (Kèm thời gian ghi nhận)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  {photos.length} hình ảnh
                </span>
              </div>

              {/* Upload input & caption */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Mô tả ảnh minh chứng (VD: Góc phòng 01 chưa quét rác...)"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white"
                />
                <label className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Chọn ảnh / Chụp</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo previews list */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col"
                    >
                      <div className="h-28 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="p-2 text-[10px] space-y-0.5">
                        <div className="font-semibold text-slate-800 truncate" title={photo.caption}>
                          {photo.caption}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{photo.uploadedAt}</span>
                        </div>
                      </div>

                      {/* Overlay action buttons */}
                      <div className="absolute top-1 right-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => onViewPhoto(photo)}
                          className="p-1 rounded bg-black/60 text-white hover:bg-black/90 transition"
                          title="Xem phóng to"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="p-1 rounded bg-rose-600/80 text-white hover:bg-rose-700 transition"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-xs sm:text-sm"
              >
                <Save className="w-4 h-4" />
                Lưu Kết Quả Chấm Điểm Phòng {selectedRoom?.code}
              </button>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Lịch sử chấm {title} trong Tuần {currentWeek}
            </h4>

            {historyRecords.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có kết quả chấm nào trong tuần {currentWeek}.</p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {historyRecords.map((rec) => {
                  const room = rooms.find((r) => r.id === rec.roomId);
                  return (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-700 px-1.5 py-0.5 rounded bg-blue-100">
                            {room?.code || rec.roomId}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {room?.name}
                          </span>
                          <span className="text-slate-400">
                            • Giờ chấm: {rec.evaluationTime} ngày {rec.date}
                          </span>
                        </div>
                        <div className="text-slate-600 mt-1">
                          GV chấm: <strong>{rec.teacherName}</strong>
                          {rec.generalComment && ` • Nhận xét: ${rec.generalComment}`}
                        </div>
                        {rec.photoProofs && rec.photoProofs.length > 0 && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {rec.photoProofs.length} ảnh minh chứng (Tải lúc: {rec.proofUploadTime || rec.evaluationTime})
                            </span>
                            {rec.photoProofs.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => onViewPhoto(p)}
                                className="text-[11px] text-blue-600 underline font-medium hover:text-blue-800"
                              >
                                [Xem ảnh]
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="font-black text-blue-700 text-sm">
                            {rec.finalScore} / {rec.baseScore}đ
                          </div>
                          {rec.totalPenaltyScore > 0 && (
                            <div className="text-[10px] text-rose-600 font-semibold">
                              -{rec.totalPenaltyScore}đ
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onDeleteEvaluation(rec.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Xóa đánh giá"
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
