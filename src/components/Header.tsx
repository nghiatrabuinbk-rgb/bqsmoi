import React from 'react';
import { 
  Building2, 
  Calendar, 
  CheckSquare, 
  Moon, 
  Sparkles, 
  Users, 
  Award, 
  Sliders, 
  FileSpreadsheet, 
  ShieldCheck, 
  BedDouble, 
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { UserAccount, AppState } from '../types';

interface HeaderProps {
  state: AppState;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onWeekChange: (week: number) => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  activeTab,
  onTabChange,
  onWeekChange,
  onOpenLoginModal,
}) => {
  const { currentUser, currentWeek, currentYear, schoolName, boardName } = state;

  const tabs = [
    { id: 'dashboard', label: 'Xếp Hạng & Thi Đua', icon: Award, badge: 'Nam & Nữ riêng' },
    { id: 'muc1', label: 'Mục 1: Tự Học Đêm', icon: Moon, badge: '19h - 20h30' },
    { id: 'muc2', label: 'Mục 2: Chính Khóa', icon: GraduationCap, badge: 'Sáng / Chiều' },
    { id: 'muc3', label: 'Mục 3: Vệ Sinh Nề Nếp', icon: Sparkles, badge: 'Có ảnh minh chứng' },
    { id: 'muc4', label: 'Mục 4: Nề Nếp Sinh Hoạt', icon: BedDouble, badge: 'Giờ giấc / Trật tự' },
    { id: 'muc5', label: 'Mục 5: Chấp Hành Nội Quy', icon: CheckSquare, badge: 'Lao động / TDTT' },
    { id: 'rooms', label: '25 Phòng & Học Sinh', icon: Users, badge: '12 Nam / 13 Nữ' },
    { id: 'criteria', label: 'Cài Đặt Tiêu Chí', icon: Sliders, badge: 'Admin' },
    { id: 'permissions', label: 'Phân Công & Phân Quyền', icon: ShieldCheck, badge: 'Bộ phận M1-M5' },
    { id: 'reports', label: 'Xuất Báo Cáo', icon: FileSpreadsheet, badge: 'Word & Excel' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl sticky top-0 z-40">
      {/* Top Notification / Title Banner */}
      <div className="border-b border-blue-800/60 px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* School & Board title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-blue-950 font-black text-xl border-2 border-white/20">
              TĐ
            </div>
            <div>
              <div className="text-[11px] font-semibold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
                <span>{schoolName}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                {boardName} - CHẤM ĐIỂM THI ĐUA 25 PHÒNG NỘI TRÚ
              </h1>
            </div>
          </div>

          {/* User & Week selection controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Week Selector */}
            <div className="flex items-center bg-blue-950/80 border border-blue-700/60 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
              <span className="text-slate-300 mr-1.5 font-medium">Tuần thi đua:</span>
              <select
                value={currentWeek}
                onChange={(e) => onWeekChange(Number(e.target.value))}
                aria-label="Tuần thi đua"
                className="bg-blue-800 text-white font-bold rounded-lg px-2 py-0.5 outline-none text-xs border border-blue-600 cursor-pointer hover:bg-blue-700"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w} (HK{w <= 18 ? 'I' : 'II'})
                  </option>
                ))}
              </select>
              <span className="text-slate-400 ml-2 hidden sm:inline text-[11px]">
                Năm học {currentYear}
              </span>
            </div>

            {/* Current user badge & Switch */}
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-700 hover:to-indigo-700 border border-blue-600/70 rounded-xl px-3 py-1.5 transition shadow-sm text-left group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-200 flex items-center gap-1">
                  {currentUser.name}
                  <ChevronDown className="w-3 h-3 text-slate-300" />
                </div>
                <div className="text-[10px] text-blue-200">
                  {currentUser.roleTitle.split('/')[0]}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="px-3 sm:px-6 bg-slate-900/80 backdrop-blur-md overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`hidden md:inline text-[9px] px-1.5 py-0.5 rounded-full uppercase font-medium ${
                      isActive ? 'bg-black/20 text-slate-900' : 'bg-blue-950 text-blue-200 border border-blue-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
