import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Lock, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { AppState, CriterionConfig } from '../types';

interface CriteriaManagerProps {
  state: AppState;
  onUpdateCriteria: (criteria: CriterionConfig[]) => void;
}

export const CriteriaManager: React.FC<CriteriaManagerProps> = ({
  state,
  onUpdateCriteria,
}) => {
  const { criteria, currentUser } = state;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'bgh';

  const [items, setItems] = useState<CriterionConfig[]>(criteria);

  // New criterion state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBaseScore, setNewBaseScore] = useState<number>(100);
  const [newPenalty, setNewPenalty] = useState<number>(5);

  const handleToggleActive = (id: string) => {
    const updated = items.map((c) => {
      if (c.id === id) return { ...c, isActive: !c.isActive };
      return c;
    });
    setItems(updated);
    onUpdateCriteria(updated);
  };

  const handleScoreChange = (id: string, field: 'defaultBaseScore' | 'defaultPenalty', val: number) => {
    const updated = items.map((c) => {
      if (c.id === id) return { ...c, [field]: val };
      return c;
    });
    setItems(updated);
    onUpdateCriteria(updated);
  };

  const handleAddCustomCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCrit: CriterionConfig = {
      id: `crit_custom_${Date.now()}`,
      category: 'custom',
      code: newCode.trim().toUpperCase() || `TC_${items.length + 1}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Tiêu chí thi đua bổ sung do Quản trị viên thiết lập',
      defaultBaseScore: Number(newBaseScore) || 100,
      defaultPenalty: Number(newPenalty) || 5,
      isActive: true,
      canUploadProof: true,
      applicableRoles: ['admin', 'bgh', 'thanh_vien_quan_sinh'],
    };

    const updated = [...items, newCrit];
    setItems(updated);
    onUpdateCriteria(updated);
    setNewName('');
    setNewCode('');
    setNewDesc('');
  };

  const handleDeleteCriterion = (id: string) => {
    const updated = items.filter((c) => c.id !== id);
    setItems(updated);
    onUpdateCriteria(updated);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-bold shadow-lg">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Quyền Quản Trị Viên (Thầy Nguyễn Trọng Nghĩa &amp; BGH)
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Cài Đặt &amp; Tùy Biến Tiêu Chí Thi Đua 25 Phòng
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                Điểm định mức 100 điểm cho mỗi mục, thêm/bỏ tiêu chí thi đua, tùy chỉnh số điểm trừ cho toàn bộ 25 phòng ở.
              </p>
            </div>
          </div>
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 text-xs">
            Tổng số: <strong>{items.length} tiêu chí</strong> ({items.filter((c) => c.isActive).length} đang áp dụng)
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <strong>Lưu ý:</strong> Bạn đang đăng nhập với vai trò &ldquo;{currentUser.roleTitle}&rdquo;. Hãy chuyển sang tài khoản <strong>Thầy Nguyễn Trọng Nghĩa</strong> hoặc <strong>Ban Giám Hiệu</strong> để lưu các cài đặt vĩnh viễn cho trường.
          </div>
        </div>
      )}

      {/* Criteria List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((criterion, index) => (
          <div
            key={criterion.id}
            className={`p-5 rounded-2xl border transition shadow-sm space-y-3 ${
              criterion.isActive
                ? 'bg-white border-slate-200'
                : 'bg-slate-50 border-slate-300 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    {criterion.name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {criterion.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {criterion.description}
                  </div>
                </div>
              </div>

              {/* Toggle Active status */}
              <button
                type="button"
                onClick={() => handleToggleActive(criterion.id)}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  criterion.isActive
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-slate-400 bg-slate-200 hover:bg-slate-300'
                }`}
                title={criterion.isActive ? 'Đang bật - Bấm để ẩn tiêu chí' : 'Đang ẩn - Bấm để kích hoạt'}
              >
                {criterion.isActive ? (
                  <ToggleRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                )}
                <span>{criterion.isActive ? 'Áp dụng' : 'Bỏ qua'}</span>
              </button>
            </div>

            {/* Score Customization Box */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Điểm định mức khởi điểm:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={criterion.defaultBaseScore}
                    onChange={(e) =>
                      handleScoreChange(criterion.id, 'defaultBaseScore', Number(e.target.value))
                    }
                    className="w-20 p-1.5 border border-slate-300 rounded-lg text-center font-black text-blue-700 bg-white"
                  />
                  <span className="text-slate-500">điểm</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Điểm trừ mặc định / lỗi:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={criterion.defaultPenalty}
                    onChange={(e) =>
                      handleScoreChange(criterion.id, 'defaultPenalty', Number(e.target.value))
                    }
                    className="w-20 p-1.5 border border-slate-300 rounded-lg text-center font-bold text-rose-600 bg-white"
                  />
                  <span className="text-slate-500">điểm</span>
                </div>
              </div>
            </div>

            {/* Delete custom criteria if added */}
            {criterion.category === 'custom' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleDeleteCriterion(criterion.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa tiêu chí này
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Custom Criterion Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-600" />
          Thêm Tiêu Chí Thi Đua Mới Cho 25 Phòng Ở
        </h3>
        <p className="text-xs text-slate-500">
          Ví dụ: Tiết kiệm điện nước, Chăm sóc bồn hoa vườn thuốc nam bán trú, Giữ gìn tài sản chung...
        </p>

        <form onSubmit={handleAddCustomCriterion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã tiêu chí (MUC_06...):
              </label>
              <input
                type="text"
                placeholder="MUC_06"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên tiêu chí thi đua:
              </label>
              <input
                type="text"
                placeholder="Mục 6: Tiết kiệm điện nước &amp; Bảo vệ của công"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết nội dung đánh giá:
            </label>
            <textarea
              rows={2}
              placeholder="Đánh giá việc tắt quạt, tắt đèn khi ra khỏi phòng; khóa vòi nước sạch sẽ..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điểm định mức:
              </label>
              <input
                type="number"
                value={newBaseScore}
                onChange={(e) => setNewBaseScore(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điểm trừ mỗi lỗi:
              </label>
              <input
                type="number"
                value={newPenalty}
                onChange={(e) => setNewPenalty(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg text-center font-bold text-rose-600"
              />
            </div>
            <div className="col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo Tiêu Chí Mới Cho 25 Phòng
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
