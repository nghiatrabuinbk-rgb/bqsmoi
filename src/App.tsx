import React, { useState, useEffect } from 'react';
import { 
  AppState, 
  Room, 
  UserAccount, 
  CriterionConfig, 
  AttendanceRecord, 
  EvaluationRecord, 
  PhotoProof, 
  Student,
  DepartmentPermission,
  DutyAssignment
} from './types';
import { loadInitialState, saveState, calculateWeekSummaries } from './utils/storage';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NightAttendance } from './components/NightAttendance';
import { SchoolAttendance } from './components/SchoolAttendance';
import { EvaluationSection } from './components/EvaluationSection';
import { RoomManagement } from './components/RoomManagement';
import { CriteriaManager } from './components/CriteriaManager';
import { DepartmentDutyManager } from './components/DepartmentDutyManager';
import { ReportsAndExport } from './components/ReportsAndExport';
import { PhotoProofModal } from './components/PhotoProofModal';
import { UserLoginModal } from './components/UserLoginModal';
import { RoomDetailModal } from './components/RoomDetailModal';
import { exportToExcel, exportToWordDoc } from './utils/exportUtils';
import confetti from 'canvas-confetti';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<PhotoProof | null>(null);
  const [selectedDetailRoom, setSelectedDetailRoom] = useState<Room | null>(null);

  // Sync state to localStorage whenever it updates
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Recalculate rankings for current week
  const { maleSummaries, femaleSummaries, allSummaries } = calculateWeekSummaries(
    state.rooms,
    state.attendanceRecords,
    state.evaluationRecords,
    state.currentWeek
  );

  // Handlers for switching user, week
  const handleSelectUser = (user: UserAccount) => {
    setState((prev) => ({ ...prev, currentUser: user }));
  };

  const handleWeekChange = (week: number) => {
    setState((prev) => ({ ...prev, currentWeek: week }));
  };

  // Handlers for Attendance (Mục 1 & Mục 2)
  const handleSaveAttendance = (record: AttendanceRecord) => {
    setState((prev) => {
      // If a record with same id exists, update, else prepend
      const existingIdx = prev.attendanceRecords.findIndex((r) => r.id === record.id);
      let updatedAtts;
      if (existingIdx >= 0) {
        updatedAtts = [...prev.attendanceRecords];
        updatedAtts[existingIdx] = record;
      } else {
        updatedAtts = [record, ...prev.attendanceRecords];
      }
      return { ...prev, attendanceRecords: updatedAtts };
    });
  };

  const handleDeleteAttendance = (recordId: string) => {
    setState((prev) => ({
      ...prev,
      attendanceRecords: prev.attendanceRecords.filter((r) => r.id !== recordId),
    }));
  };

  const handleDeleteAllNightAttendance = (weekNumber?: number) => {
    setState((prev) => ({
      ...prev,
      attendanceRecords: prev.attendanceRecords.filter((r) => {
        if (r.type !== 'night_study') return true;
        if (weekNumber !== undefined) return r.weekNumber !== weekNumber;
        return false;
      }),
    }));
  };

  const handleDeleteMultipleAttendance = (recordIds: string[]) => {
    setState((prev) => ({
      ...prev,
      attendanceRecords: prev.attendanceRecords.filter((r) => !recordIds.includes(r.id)),
    }));
  };

  const handleBatchUpdateAttendance = (updatedRecords: AttendanceRecord[]) => {
    setState((prev) => {
      const recordMap = new Map(updatedRecords.map((r) => [r.id, r]));
      const updatedAtts = prev.attendanceRecords.map((r) => recordMap.get(r.id) || r);
      return { ...prev, attendanceRecords: updatedAtts };
    });
  };

  // Handlers for Evaluations (Mục 3, 4, 5)
  const handleSaveEvaluation = (record: EvaluationRecord) => {
    setState((prev) => {
      const existingIdx = prev.evaluationRecords.findIndex((r) => r.id === record.id);
      let updatedEvals;
      if (existingIdx >= 0) {
        updatedEvals = [...prev.evaluationRecords];
        updatedEvals[existingIdx] = record;
      } else {
        updatedEvals = [record, ...prev.evaluationRecords];
      }
      return { ...prev, evaluationRecords: updatedEvals };
    });

    // Celebratory confetti if high score
    if (record.finalScore >= 100) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });
    }
  };

  const handleDeleteEvaluation = (recordId: string) => {
    setState((prev) => ({
      ...prev,
      evaluationRecords: prev.evaluationRecords.filter((r) => r.id !== recordId),
    }));
  };

  // Room & Student Updates
  const handleUpdateRoom = (updatedRoom: Room) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)),
    }));
  };

  const handleBatchUpdateStudents = (roomId: string, newStudents: Student[]) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            students: newStudents,
            studentCountManual: newStudents.length,
          };
        }
        return r;
      }),
    }));
  };

  // Criteria update
  const handleUpdateCriteria = (newCriteria: CriterionConfig[]) => {
    setState((prev) => ({
      ...prev,
      criteria: newCriteria,
    }));
  };

  // Permissions update
  const handleUpdatePermissions = (newPerms: DepartmentPermission[]) => {
    setState((prev) => ({
      ...prev,
      departmentPermissions: newPerms,
    }));
  };

  // Duty assignments update
  const handleUpdateDutyAssignments = (newDuties: DutyAssignment[]) => {
    setState((prev) => ({
      ...prev,
      dutyAssignments: newDuties,
    }));
  };

  // Reload entire state (for restore / reset)
  const handleReloadState = (newState: AppState) => {
    setState(newState);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* App Header */}
      <Header
        state={state}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onWeekChange={handleWeekChange}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            state={state}
            maleSummaries={maleSummaries}
            femaleSummaries={femaleSummaries}
            allSummaries={allSummaries}
            onNavigateTab={setActiveTab}
            onSelectRoomDetail={setSelectedDetailRoom}
            onExportExcel={() => exportToExcel(state.currentWeek, maleSummaries, femaleSummaries, allSummaries, state)}
            onExportWord={() => exportToWordDoc(state.currentWeek, maleSummaries, femaleSummaries, state)}
          />
        )}

        {activeTab === 'muc1' && (
          <NightAttendance
            state={state}
            onSaveAttendance={handleSaveAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onDeleteAllNightAttendance={handleDeleteAllNightAttendance}
            onDeleteMultipleAttendance={handleDeleteMultipleAttendance}
            onBatchUpdateAttendance={handleBatchUpdateAttendance}
          />
        )}

        {activeTab === 'muc2' && (
          <SchoolAttendance
            state={state}
            onSaveAttendance={handleSaveAttendance}
            onDeleteAttendance={handleDeleteAttendance}
          />
        )}

        {activeTab === 'muc3' && (
          <EvaluationSection
            state={state}
            categoryType="muc3_ve_sinh"
            title="Mục 3: Chấm Điểm Vệ Sinh &amp; Nề Nếp Phòng Ở (25 Phòng)"
            subTitle="Chấm điểm vệ sinh phòng, hành lang, sân trước, gầm giường, gấp mùng chiếu, nhà tắm. Có tải ảnh minh chứng kèm thời gian."
            badgeText="Mục 3"
            themeColor="emerald"
            suggestions={[
              { text: 'Chưa gấp chăn màn / mùng chiếu lộn xộn', penalty: 5 },
              { text: 'Sàn phòng bẩn, chưa quét rác sạch sẽ', penalty: 5 },
              { text: 'Gầm giường để đồ đạc lộn xộn', penalty: 5 },
              { text: 'Sân trước / hành lang phòng có rác bừa bãi', penalty: 5 },
              { text: 'Nhà vệ sinh phòng chưa cọ rửa sạch sẽ', penalty: 10 },
              { text: 'Treo phơi quần áo ướt trong phòng', penalty: 5 },
            ]}
            onSaveEvaluation={handleSaveEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
            onViewPhoto={setViewingPhoto}
          />
        )}

        {activeTab === 'muc4' && (
          <EvaluationSection
            state={state}
            categoryType="muc4_ne_nep"
            title="Mục 4: Chấm Điểm Nề Nếp Sinh Hoạt (25 Phòng)"
            subTitle="Đánh giá giờ giấc thức dậy, thể dục sáng, tắt đèn đi ngủ đúng giờ (22h00), không ồn ào mất trật tự sau giờ giới nghiêm."
            badgeText="Mục 4"
            themeColor="amber"
            suggestions={[
              { text: 'Mất trật tự sau giờ tắt đèn (22h00)', penalty: 10 },
              { text: 'Thức dậy muộn, không tham gia thể dục sáng', penalty: 5 },
              { text: 'Tự ý ra khỏi khuôn viên nội trú không xin phép', penalty: 15 },
              { text: 'Sử dụng điện thoại di động sai giờ quy định', penalty: 10 },
              { text: 'Không xếp hàng trật tự khi ăn cơm tập thể', penalty: 5 },
              { text: 'Nói tục, chửi thề trong khu nội trú', penalty: 10 },
            ]}
            onSaveEvaluation={handleSaveEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
            onViewPhoto={setViewingPhoto}
          />
        )}

        {activeTab === 'muc5' && (
          <EvaluationSection
            state={state}
            categoryType="muc5_noi_quy"
            title="Mục 5: Chấp Hành Nội Quy Nhà Trường &amp; Sinh Hoạt Tập Thể"
            subTitle="Đánh giá việc tham gia đầy đủ, tích cực các hoạt động tuyên truyền, thể dục thể thao, lao động, văn hóa văn nghệ của học sinh trong phòng."
            badgeText="Mục 5"
            themeColor="rose"
            suggestions={[
              { text: 'Vắng buổi lao động chăm sóc bồn hoa/vườn rau bán trú không phép', penalty: 10 },
              { text: 'Vắng sinh hoạt văn nghệ / thể thao / Đội TNTP không phép', penalty: 10 },
              { text: 'Không tham gia buổi chào cờ đầu tuần hoặc sinh hoạt tập thể', penalty: 10 },
              { text: 'Gây gổ, mất đoàn kết trong phòng ở bán trú', penalty: 15 },
              { text: 'Sử dụng thiết bị điện trái phép trong phòng gây nguy hiểm', penalty: 15 },
              { text: 'Lãng phí nước sạch hoặc không tắt điện khi ra ngoài', penalty: 5 },
            ]}
            onSaveEvaluation={handleSaveEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
            onViewPhoto={setViewingPhoto}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomManagement
            state={state}
            onUpdateRoom={handleUpdateRoom}
            onBatchUpdateStudents={handleBatchUpdateStudents}
          />
        )}

        {activeTab === 'criteria' && (
          <CriteriaManager
            state={state}
            onUpdateCriteria={handleUpdateCriteria}
          />
        )}

        {activeTab === 'permissions' && (
          <DepartmentDutyManager
            state={state}
            onUpdatePermissions={handleUpdatePermissions}
            onUpdateDutyAssignments={handleUpdateDutyAssignments}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAndExport
            state={state}
            maleSummaries={maleSummaries}
            femaleSummaries={femaleSummaries}
            allSummaries={allSummaries}
            onReloadState={handleReloadState}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="font-bold text-slate-200 text-sm">
            HỆ THỐNG QUẢN LÝ &amp; CHẤM ĐIỂM THI ĐUA NỘI TRÚ 25 PHÒNG Ở
          </div>
          <div className="text-slate-400">
            Trường Phổ thông Dân tộc Bán trú THCS Trà Đốc - Xã Trà Đốc, Tỉnh Quảng Nam
          </div>
          <div className="text-amber-400 font-medium">
            Phụ trách hệ thống: <strong>Thầy Nguyễn Trọng Nghĩa - Trưởng Ban Quản sinh</strong>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isLoginModalOpen && (
        <UserLoginModal
          users={state.users}
          currentUser={state.currentUser}
          onSelectUser={handleSelectUser}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {viewingPhoto && (
        <PhotoProofModal
          photo={viewingPhoto}
          onClose={() => setViewingPhoto(null)}
        />
      )}

      {selectedDetailRoom && (
        <RoomDetailModal
          room={selectedDetailRoom}
          summary={allSummaries.find((s) => s.roomId === selectedDetailRoom.id)}
          evaluations={state.evaluationRecords}
          attendances={state.attendanceRecords}
          onClose={() => setSelectedDetailRoom(null)}
          onViewPhoto={setViewingPhoto}
        />
      )}
    </div>
  );
}
