import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Calendar, 
  Download, 
  Upload, 
  RefreshCw, 
  Award, 
  CheckCircle2, 
  Building2, 
  Trophy 
} from 'lucide-react';
import { AppState, RoomWeekSummary } from '../types';
import { exportToExcel, exportToWordDoc } from '../utils/exportUtils';
import { exportStateAsJSON, importStateFromJSON, resetToDefaultData } from '../utils/storage';

interface ReportsAndExportProps {
  state: AppState;
  maleSummaries: RoomWeekSummary[];
  femaleSummaries: RoomWeekSummary[];
  allSummaries: RoomWeekSummary[];
  onReloadState: (newState: AppState) => void;
}

export const ReportsAndExport: React.FC<ReportsAndExportProps> = ({
  state,
  maleSummaries,
  femaleSummaries,
  allSummaries,
  onReloadState,
}) => {
  const [reportType, setReportType] = useState<'week' | 'month' | 'year'>('week');
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  const handleExportExcel = () => {
    exportToExcel(state.currentWeek, maleSummaries, femaleSummaries, allSummaries, state);
  };

  const handleExportWord = () => {
    exportToWordDoc(state.currentWeek, maleSummaries, femaleSummaries, state);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackup = () => {
    const jsonStr = exportStateAsJSON(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_ThiDua_TraDoc_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importStateFromJSON(reader.result as string);
        onReloadState(imported);
      } catch (err) {
        console.error('Tệp dữ liệu không hợp lệ', err);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    const def = resetToDefaultData();
    onReloadState(def);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Tổng Hợp &amp; Báo Cáo Thi Đua • Ban Quản sinh PTDTBT THCS Trà Đốc
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Xuất Báo Cáo File Excel &amp; Word Theo Tuần, Tháng, Năm
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Bảng tổng hợp xếp hạng riêng biệt Khu Nam (12 phòng) và Khu Nữ (13 phòng), chuẩn thể thức trường học Việt Nam.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleExportWord}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Word (.doc)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="In báo cáo"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Period Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase">Kỳ báo cáo:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setReportType('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'week' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Theo Tuần ({state.currentWeek})
            </button>
            <button
              onClick={() => setReportType('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'month' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setReportType('year')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'year' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Cả Năm Học ({state.currentYear})
            </button>
          </div>
        </div>

        {reportType === 'month' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Chọn tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="p-1.5 border border-slate-300 rounded-lg bg-white font-bold text-blue-800 outline-none"
            >
              {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Backup & Restore controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleBackup}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition"
            title="Lưu file JSON dữ liệu vào máy tính"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Sao lưu dữ liệu</span>
          </button>
          <label className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phục hồi</span>
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
          <button
            onClick={handleResetData}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
            title="Khôi phục lại dữ liệu mẫu gốc"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Preview (Standard Vietnamese School Document Format) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-6 sm:p-10 font-serif text-slate-900 max-w-5xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0">
        {/* National Header */}
        <div className="grid grid-cols-2 text-center text-xs sm:text-sm border-b pb-4 border-slate-200">
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">TRƯỜNG PTDTBT THCS TRÀ ĐỐC</div>
            <div className="font-bold text-blue-900 text-xs sm:text-sm">BAN QUẢN SINH NỘI TRÚ</div>
            <div className="w-24 border-b-2 border-slate-800 mx-auto mt-1"></div>
            <div className="text-[11px] text-slate-500 mt-1">Số: .... /BC-BQS</div>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">Độc lập - Tự do - Hạnh phúc</div>
            <div className="w-32 border-b-2 border-slate-800 mx-auto mt-1"></div>
            <div className="text-xs text-slate-600 italic mt-2">
              Trà Đốc, ngày {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-bold uppercase text-slate-900 tracking-wide">
            BÁO CÁO TỔNG HỢP KẾT QUẢ THI ĐUA PHÒNG Ở NỘI TRÚ
          </h2>
          <div className="text-xs sm:text-sm font-semibold italic text-blue-900">
            {reportType === 'week'
              ? `Tuần số: ${state.currentWeek} • Năm học: ${state.currentYear}`
              : reportType === 'month'
              ? `Tháng ${selectedMonth} • Năm học: ${state.currentYear}`
              : `Cả năm học: ${state.currentYear}`}
          </div>
        </div>

        {/* Section 1: Khu Nam */}
        <div className="space-y-3">
          <div className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            I. BẢNG XẾP HẠNG THI ĐUA KHU NAM (12 PHÒNG Ở)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-12">Hạng</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Phòng</th>
                  <th className="border border-slate-300 p-2">Tên phòng</th>
                  <th className="border border-slate-300 p-2">GV Phụ trách</th>
                  <th className="border border-slate-300 p-2 text-center w-12">Sĩ số</th>
                  <th className="border border-slate-300 p-2 text-center">M1: Tự học</th>
                  <th className="border border-slate-300 p-2 text-center">M2: Khóa</th>
                  <th className="border border-slate-300 p-2 text-center">M3: V.Sinh</th>
                  <th className="border border-slate-300 p-2 text-center">M4: Nề nếp</th>
                  <th className="border border-slate-300 p-2 text-center">M5: Nội quy</th>
                  <th className="border border-slate-300 p-2 text-center font-bold">Tổng điểm</th>
                  <th className="border border-slate-300 p-2 text-center">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {maleSummaries.map((item) => (
                  <tr key={item.roomId} className={item.rankInGender === 1 ? 'bg-amber-50 font-bold' : ''}>
                    <td className="border border-slate-300 p-2 text-center font-bold">{item.rankInGender}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-blue-800">{item.roomCode}</td>
                    <td className="border border-slate-300 p-2">{item.roomName}</td>
                    <td className="border border-slate-300 p-2">{item.managerTeacherName}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.studentCount}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc1Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc2Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc3Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc4Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc5Score}</td>
                    <td className="border border-slate-300 p-2 text-center font-black text-blue-700 text-sm">{item.totalScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">
                      {item.award === 'nhat' ? '⭐ Cờ Nhất' : item.award === 'nhi' ? '🥈 Giải Nhì' : item.award === 'ba' ? '🥉 Giải Ba' : item.award === 'can_co_gang' ? 'Cần chấn chỉnh' : 'Khuyến khích'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Khu Nu */}
        <div className="space-y-3 pt-3">
          <div className="font-bold text-sm text-rose-900 uppercase flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            II. BẢNG XẾP HẠNG THI ĐUA KHU NỮ (13 PHÒNG Ở)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px]">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-12">Hạng</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Phòng</th>
                  <th className="border border-slate-300 p-2">Tên phòng</th>
                  <th className="border border-slate-300 p-2">GV Phụ trách</th>
                  <th className="border border-slate-300 p-2 text-center w-12">Sĩ số</th>
                  <th className="border border-slate-300 p-2 text-center">M1: Tự học</th>
                  <th className="border border-slate-300 p-2 text-center">M2: Khóa</th>
                  <th className="border border-slate-300 p-2 text-center">M3: V.Sinh</th>
                  <th className="border border-slate-300 p-2 text-center">M4: Nề nếp</th>
                  <th className="border border-slate-300 p-2 text-center">M5: Nội quy</th>
                  <th className="border border-slate-300 p-2 text-center font-bold">Tổng điểm</th>
                  <th className="border border-slate-300 p-2 text-center">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {femaleSummaries.map((item) => (
                  <tr key={item.roomId} className={item.rankInGender === 1 ? 'bg-amber-50 font-bold' : ''}>
                    <td className="border border-slate-300 p-2 text-center font-bold">{item.rankInGender}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-rose-800">{item.roomCode}</td>
                    <td className="border border-slate-300 p-2">{item.roomName}</td>
                    <td className="border border-slate-300 p-2">{item.managerTeacherName}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.studentCount}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc1Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc2Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc3Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc4Score}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.muc5Score}</td>
                    <td className="border border-slate-300 p-2 text-center font-black text-rose-700 text-sm">{item.totalScore}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">
                      {item.award === 'nhat' ? '⭐ Cờ Nhất' : item.award === 'nhi' ? '🥈 Giải Nhì' : item.award === 'ba' ? '🥉 Giải Ba' : item.award === 'can_co_gang' ? 'Cần chấn chỉnh' : 'Khuyến khích'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 text-center pt-8 text-xs sm:text-sm">
          <div>
            <div className="font-bold uppercase text-slate-800">HIỆU TRƯỞNG DUYỆT</div>
            <div className="italic text-slate-500 text-[11px]">(Ký và đóng dấu)</div>
            <div className="h-20"></div>
            <div className="font-bold text-slate-900">Trần Đình Sơn</div>
          </div>
          <div>
            <div className="font-bold uppercase text-slate-800">TRƯỞNG BAN QUẢN SINH</div>
            <div className="italic text-slate-500 text-[11px]">(Ký và ghi rõ họ tên)</div>
            <div className="h-20"></div>
            <div className="font-bold text-slate-900">Nguyễn Trọng Nghĩa</div>
          </div>
        </div>
      </div>
    </div>
  );
};
