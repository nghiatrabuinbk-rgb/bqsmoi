import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Key, Lock, CheckCircle2 } from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface UserLoginModalProps {
  users: UserAccount[];
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
  onClose: () => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  users,
  currentUser,
  onSelectUser,
  onClose,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const targetUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUser.pin && pin && pin !== targetUser.pin && pin !== '1234') {
      setError('Mã PIN không chính xác! (Mặc định: 1234)');
      return;
    }
    onSelectUser(targetUser);
    onClose();
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-rose-100 text-rose-800 border-rose-300',
    bgh: 'bg-purple-100 text-purple-800 border-purple-300',
    gv_phu_trach: 'bg-blue-100 text-blue-800 border-blue-300',
    gv_tu_hoc_dem: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    gv_ngu_lai: 'bg-amber-100 text-amber-800 border-amber-300',
    y_te: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    thanh_tra: 'bg-orange-100 text-orange-800 border-orange-300',
    doan_thanh_nien: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    tong_phu_trach: 'bg-red-100 text-red-800 border-red-300',
    thanh_vien_quan_sinh: 'bg-teal-100 text-teal-800 border-teal-300',
    doi_tu_quan: 'bg-violet-100 text-violet-800 border-violet-300',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Đăng Nhập / Phân Quyền</h3>
              <p className="text-xs text-blue-200">Hội đồng chấm thi đua nội trú PTDTBT THCS Trà Đốc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Chọn tài khoản Cán bộ / Giáo viên:
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
              {users.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setError('');
                    }}
                    className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition border ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 shadow-sm'
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        u.role === 'admin' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                          {u.name}
                          {u.id === currentUser.id && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {u.roleTitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-1">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span>Vai trò được cấp quyền:</span>
            </div>
            <div className="text-xs text-slate-700">
              <span className={`inline-block px-2 py-0.5 rounded font-medium border text-[11px] ${roleColors[targetUser.role]}`}>
                {targetUser.roleTitle}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mã PIN xác thực (mặc định: 1234):
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập 1234"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Xác nhận Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
