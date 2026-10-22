import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Users, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  FileSpreadsheet, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { RoomWeekSummary, AppState, Room } from '../types';

interface DashboardProps {
  state: AppState;
  maleSummaries: RoomWeekSummary[];
  femaleSummaries: RoomWeekSummary[];
  allSummaries: RoomWeekSummary[];
  onNavigateTab: (tab: string) => void;
  onSelectRoomDetail: (room: Room) => void;
  onExportExcel: () => void;
  onExportWord: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  maleSummaries,
  femaleSummaries,
  allSummaries,
  onNavigateTab,
  onSelectRoomDetail,
  onExportExcel,
  onExportWord,
}) => {
  const [activeAreaTab, setActiveAreaTab] = useState<'both' | 'nam' | 'nu'>('both');
  const [searchTerm, setSearchTerm] = useState('');

  const totalStudents = state.rooms.reduce((acc, r) => {
    return acc + (r.students?.length > 0 ? r.students.length : (r.studentCountManual || 0));
  }, 0);

  const topMale = maleSummaries[0];
  const topFemale = femaleSummaries[0];

  const getAwardBadge = (award: string, rank: number) => {
    switch (award) {
      case 'nhat':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm animate-pulse">
            <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            CỜ NHẤT
          </span>
        );
      case 'nhi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-sm">
            <Award className="w-3.5 h-3.5 text-slate-600" />
            GIẢI NHÌ
          </span>
        );
      case 'ba':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300 shadow-sm">
            <Award className="w-3.5 h-3.5 text-orange-600" />
            GIẢI BA
          </span>
        );
      case 'can_co_gang':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Cần chấn chỉnh
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đạt chuẩn
          </span>
        );
    }
  };

  const renderRankingTable = (list: RoomWeekSummary[], title: string, gender: 'nam' | 'nu') => {
    const filtered = list.filter((item) => 
      item.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.managerTeacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Title Bar */}
        <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
          gender === 'nam' 
            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white' 
            : 'bg-gradient-to-r from-rose-900 via-pink-900 to-rose-800 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg">
              {gender === 'nam' ? '♂' : '♀'}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{title}</h3>
              <p className="text-xs text-white/80">
                Tính điểm và xếp hạng thi đua độc lập theo quy chế Ban Quản sinh
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full w-fit">
            Tổng số: {list.length} phòng ở
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-14">Hạng</th>
                <th className="py-3 px-3">Phòng ở</th>
                <th className="py-3 px-3">GV Phụ trách</th>
                <th className="py-3 px-3 text-center w-16">Sĩ số</th>
                <th className="py-3 px-2 text-center" title="Mục 1: Tự học đêm (100đ)">M1: Tự học</th>
                <th className="py-3 px-2 text-center" title="Mục 2: Chính khóa (100đ)">M2: Khóa</th>
                <th className="py-3 px-2 text-center" title="Mục 3: Vệ sinh (100đ)">M3: V.Sinh</th>
                <th className="py-3 px-2 text-center" title="Mục 4: Nề nếp (100đ)">M4: Nề nếp</th>
                <th className="py-3 px-2 text-center" title="Mục 5: Nội quy (100đ)">M5: Nội quy</th>
                <th className="py-3 px-3 text-center font-bold text-slate-800 w-24">TỔNG ĐIỂM</th>
                <th className="py-3 px-3 text-center">Xếp loại</th>
                <th className="py-3 px-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const roomObj = state.rooms.find((r) => r.id === item.roomId);
                const isFirst = item.rankInGender === 1;

                return (
                  <tr 
                    key={item.roomId}
                    className={`hover:bg-slate-50/80 transition ${isFirst ? 'bg-amber-50/50 font-medium' : ''}`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                        item.rankInGender === 1 
                          ? 'bg-amber-500 text-white shadow-sm'
                          : item.rankInGender === 2
                          ? 'bg-slate-400 text-white'
                          : item.rankInGender === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.rankInGender}
                      </span>
                    </td>

                    {/* Room Info */}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-700 font-bold">{item.roomCode}</span>
                        <span className="text-slate-400">•</span>
                        <span>{item.roomName.replace(` (${gender === 'nam' ? 'Khu Nam' : 'Khu Nữ'})`, '')}</span>
                      </div>
                    </td>

                    {/* Teacher */}
                    <td className="py-3 px-3 text-slate-700">
                      {item.managerTeacherName}
                    </td>

                    {/* Student count */}
                    <td className="py-3 px-3 text-center font-medium text-slate-600">
                      {item.studentCount} em
                    </td>

                    {/* M1 */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold">{item.muc1Score}</span>
                      {item.muc1Deduction > 0 && (
                        <div className="text-[10px] text-rose-600 font-medium">-{item.muc1Deduction}</div>
                      )}
                    </td>

                    {/* M2 */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold">{item.muc2Score}</span>
                      {item.muc2Deduction > 0 && (
                        <div className="text-[10px] text-rose-600 font-medium">-{item.muc2Deduction}</div>
                      )}
                    </td>

                    {/* M3 */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold">{item.muc3Score}</span>
                      {item.muc3Deduction > 0 && (
                        <div className="text-[10px] text-rose-600 font-medium">-{item.muc3Deduction}</div>
                      )}
                    </td>

                    {/* M4 */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold">{item.muc4Score}</span>
                      {item.muc4Deduction > 0 && (
                        <div className="text-[10px] text-rose-600 font-medium">-{item.muc4Deduction}</div>
                      )}
                    </td>

                    {/* M5 */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold">{item.muc5Score}</span>
                      {item.muc5Deduction > 0 && (
                        <div className="text-[10px] text-rose-600 font-medium">-{item.muc5Deduction}</div>
                      )}
                    </td>

                    {/* Total Score */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-base font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {item.totalScore}
                      </span>
                    </td>

                    {/* Award / Status */}
                    <td className="py-3 px-3 text-center">
                      {getAwardBadge(item.award, item.rankInGender)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      {roomObj && (
                        <button
                          onClick={() => onSelectRoomDetail(roomObj)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                          title="Xem chi tiết phòng & danh sách học sinh"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 25 Phòng */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số phòng ở
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              25 <span className="text-xs font-normal text-slate-500">phòng</span>
            </div>
            <div className="text-xs text-blue-700 font-medium mt-1">
              12 Nam (P.01 - P.12) • 13 Nữ (P.13 - P.25)
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tổng học sinh */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng học sinh nội trú
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalStudents} <span className="text-xs font-normal text-slate-500">học sinh</span>
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              Tính tự động từ các phòng nhập
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Nhất Khu Nam */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-4 shadow-md text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Dẫn Đầu Khu Nam
            </div>
            <div className="text-xl font-black mt-1">
              {topMale ? `${topMale.roomCode} - ${topMale.roomName}` : 'Chưa có'}
            </div>
            <div className="text-xs text-blue-200 mt-1">
              Điểm: <strong className="text-white">{topMale?.totalScore || 0}đ</strong> • GV: {topMale?.managerTeacherName}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
            #1
          </div>
        </div>

        {/* Card 4: Nhất Khu Nữ */}
        <div className="bg-gradient-to-br from-rose-900 to-pink-900 rounded-2xl p-4 shadow-md text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Dẫn Đầu Khu Nữ
            </div>
            <div className="text-xl font-black mt-1">
              {topFemale ? `${topFemale.roomCode} - ${topFemale.roomName}` : 'Chưa có'}
            </div>
            <div className="text-xs text-rose-200 mt-1">
              Điểm: <strong className="text-white">{topFemale?.totalScore || 0}đ</strong> • GV: {topFemale?.managerTeacherName}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
            #1
          </div>
        </div>
      </div>

      {/* Action shortcuts & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Area Toggle Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveAreaTab('both')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeAreaTab === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất Cả 25 Phòng
          </button>
          <button
            onClick={() => setActiveAreaTab('nam')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeAreaTab === 'nam' ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khu Nam (12 Phòng)
          </button>
          <button
            onClick={() => setActiveAreaTab('nu')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeAreaTab === 'nu' ? 'bg-rose-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khu Nữ (13 Phòng)
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm phòng, GV phụ trách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Quick Export buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={onExportWord}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            <span>Xuất Word (.doc)</span>
          </button>
        </div>
      </div>

      {/* Distinct Ranking Sections */}
      {(activeAreaTab === 'both' || activeAreaTab === 'nam') && (
        <section className="space-y-3">
          {renderRankingTable(maleSummaries, 'BẢNG XẾP HẠNG THI ĐUA KHU NAM (12 PHÒNG Ở)', 'nam')}
        </section>
      )}

      {(activeAreaTab === 'both' || activeAreaTab === 'nu') && (
        <section className="space-y-3">
          {renderRankingTable(femaleSummaries, 'BẢNG XẾP HẠNG THI ĐUA KHU NỮ (13 PHÒNG Ở)', 'nu')}
        </section>
      )}

      {/* Scoring Guide Footnote */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Nguyên tắc tính điểm & Xếp thứ hạng thi đua (Ban Quản sinh - PTDTBT THCS Trà Đốc):
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>
            <strong>Điểm định mức:</strong> Mỗi mục nội dung khởi điểm 100 điểm. Vi phạm sẽ bị trừ điểm theo số lỗi hoặc số học sinh vi phạm.
          </li>
          <li>
            <strong>Mục 1 & Mục 2 (Chuyên cần):</strong> Học sinh vắng có phép không trừ điểm thi đua; học sinh vắng không phép trừ điểm thi đua của phòng theo mức quy định.
          </li>
          <li>
            <strong>Mục 3, 4, 5 (Nề nếp, vệ sinh, nội quy):</strong> Giáo viên trực phòng, Y tế, Thanh tra, Đoàn, Đội chấm điểm trực tiếp, có hình ảnh minh chứng và thời gian ghi nhận.
          </li>
          <li>
            <strong>Xếp hạng riêng biệt:</strong> Khu Nam và Khu Nữ có điều kiện sinh hoạt và số lượng phòng riêng, được xếp hạng độc lập từ vị thứ 1 đến 12 (Nam) và 1 đến 13 (Nữ) để trao cờ thi đua công bằng.
          </li>
        </ul>
      </div>
    </div>
  );
};
