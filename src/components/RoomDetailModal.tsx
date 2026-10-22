import React from 'react';
import { X, Building2, User, Users, Trophy, Award, CheckCircle2, Clock, Image as ImageIcon } from 'lucide-react';
import { Room, RoomWeekSummary, EvaluationRecord, AttendanceRecord, PhotoProof } from '../types';

interface RoomDetailModalProps {
  room: Room | null;
  summary?: RoomWeekSummary;
  evaluations: EvaluationRecord[];
  attendances: AttendanceRecord[];
  onClose: () => void;
  onViewPhoto: (photo: PhotoProof) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  summary,
  evaluations,
  attendances,
  onClose,
  onViewPhoto,
}) => {
  if (!room) return null;

  const roomEvals = evaluations.filter((e) => e.roomId === room.id);
  const roomAtts = attendances.filter((a) => a.roomId === room.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          room.gender === 'nam'
            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900'
            : 'bg-gradient-to-r from-rose-900 via-pink-900 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-base">
              {room.code}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{room.name}</h3>
              <p className="text-xs text-white/80">
                GV Phụ trách: <strong>{room.managerTeacherName}</strong> • {room.gender === 'nam' ? 'Khu Nam (12 phòng)' : 'Khu Nữ (13 phòng)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Summary Score banner if available */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Vị thứ khu</div>
                <div className="text-2xl font-black text-blue-800 mt-1">#{summary.rankInGender}</div>
                <div className="text-[10px] text-blue-600 font-medium">Trên {room.gender === 'nam' ? '12 phòng Nam' : '13 phòng Nữ'}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Tổng điểm thi đua</div>
                <div className="text-2xl font-black text-amber-700 mt-1">{summary.totalScore}đ</div>
                <div className="text-[10px] text-amber-800 font-medium">{summary.award === 'nhat' ? '⭐ Cờ Nhất' : summary.award === 'nhi' ? '🥈 Giải Nhì' : 'Đạt chuẩn'}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Sĩ số học sinh</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">{summary.studentCount} em</div>
                <div className="text-[10px] text-emerald-600 font-medium">Khối 6, 7, 8, 9</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-center">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Điểm trừ tuần</div>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  -{(summary.muc1Deduction + summary.muc2Deduction + summary.muc3Deduction + summary.muc4Deduction + summary.muc5Deduction)}đ
                </div>
                <div className="text-[10px] text-purple-700 font-medium">Tổng 5 mục</div>
              </div>
            </div>
          )}

          {/* Student Roster */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Danh Sách Học Sinh Trong Phòng ({room.students?.length || 0} em)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b">
                  <tr>
                    <th className="py-2 px-3 text-center w-10">STT</th>
                    <th className="py-2 px-3">Họ và tên</th>
                    <th className="py-2 px-3 text-center w-16">Lớp</th>
                    <th className="py-2 px-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {room.students?.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {s.name}
                        {s.isRoomLeader && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            Trưởng phòng
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-700">{s.className}</td>
                      <td className="py-2 px-3 text-slate-500">{s.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Photos Proofs for this room */}
          {roomEvals.some((e) => e.photoProofs && e.photoProofs.length > 0) && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Hình Ảnh Minh Chứng Chấm Điểm Phòng
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roomEvals.flatMap((e) => e.photoProofs || []).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onViewPhoto(p)}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-slate-200 shadow-sm relative"
                  >
                    <img src={p.url} alt={p.caption} className="w-full h-24 object-cover group-hover:scale-105 transition" />
                    <div className="p-1.5 bg-white text-[10px]">
                      <div className="font-medium truncate">{p.caption}</div>
                      <div className="text-slate-400">{p.uploadedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
