import * as XLSX from 'xlsx';
import { RoomWeekSummary, AppState } from '../types';

export const exportToExcel = (
  weekNumber: number,
  maleList: RoomWeekSummary[],
  femaleList: RoomWeekSummary[],
  allList: RoomWeekSummary[],
  state: AppState
) => {
  const wb = XLSX.utils.book_new();

  const formatSummaryForSheet = (items: RoomWeekSummary[], sectionName: string) => {
    return items.map((item, idx) => ({
      'Vị thứ': item.rankInGender || idx + 1,
      'Hạng toàn trường': item.rankOverall,
      'Mã phòng': item.roomCode,
      'Tên phòng': item.roomName,
      'Khu': item.gender === 'nam' ? 'Khu Nam' : 'Khu Nữ',
      'Giáo viên phụ trách': item.managerTeacherName,
      'Sĩ số (học sinh)': item.studentCount,
      'Mục 1: Tự học đêm (100đ)': item.muc1Score,
      'Trừ M1': item.muc1Deduction,
      'Mục 2: Chính khóa (100đ)': item.muc2Score,
      'Trừ M2': item.muc2Deduction,
      'Mục 3: Vệ sinh (100đ)': item.muc3Score,
      'Trừ M3': item.muc3Deduction,
      'Mục 4: Nề nếp (100đ)': item.muc4Score,
      'Trừ M4': item.muc4Deduction,
      'Mục 5: Nội quy (100đ)': item.muc5Score,
      'Trừ M5': item.muc5Deduction,
      'TỔNG ĐIỂM THI ĐUA': item.totalScore,
      'Xếp loại / Cờ thi đua': 
        item.award === 'nhat' ? 'Giải Nhất (Xuất sắc)' :
        item.award === 'nhi' ? 'Giải Nhì' :
        item.award === 'ba' ? 'Giải Ba' :
        item.award === 'can_co_gang' ? 'Cần chấn chỉnh' : 'Khuyến khích'
    }));
  };

  // Sheet 1: Khu Nam (12 phòng)
  const wsMale = XLSX.utils.json_to_sheet(formatSummaryForSheet(maleList, 'Khu Nam'));
  XLSX.utils.book_append_sheet(wb, wsMale, 'Khu Nam (12 Phòng)');

  // Sheet 2: Khu Nữ (13 phòng)
  const wsFemale = XLSX.utils.json_to_sheet(formatSummaryForSheet(femaleList, 'Khu Nữ'));
  XLSX.utils.book_append_sheet(wb, wsFemale, 'Khu Nu (13 Phong)');

  // Sheet 3: Toàn trường 25 phòng
  const wsAll = XLSX.utils.json_to_sheet(formatSummaryForSheet(allList, 'Toàn trường'));
  XLSX.utils.book_append_sheet(wb, wsAll, 'Tong Hop 25 Phong');

  // Generate file and trigger download
  const fileName = `ThiDua_NoiTru_TraDoc_Tuan_${weekNumber}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToWordDoc = (
  weekNumber: number,
  maleList: RoomWeekSummary[],
  femaleList: RoomWeekSummary[],
  state: AppState
) => {
  const currentDate = new Date().toLocaleDateString('vi-VN');

  const renderTableRows = (list: RoomWeekSummary[]) => {
    return list.map((item) => `
      <tr style="text-align: center;">
        <td style="border: 1px solid #333; padding: 6px; font-weight: bold; background: ${item.award === 'nhat' ? '#fef08a' : item.award === 'nhi' ? '#e2e8f0' : item.award === 'ba' ? '#fed7aa' : 'transparent'};">
          ${item.rankInGender}
        </td>
        <td style="border: 1px solid #333; padding: 6px; font-weight: bold;">${item.roomCode}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: left;">${item.roomName}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: left;">${item.managerTeacherName}</td>
        <td style="border: 1px solid #333; padding: 6px;">${item.studentCount}</td>
        <td style="border: 1px solid #333; padding: 6px;">${item.muc1Score} <span style="font-size: 10px; color: #dc2626;">(-${item.muc1Deduction})</span></td>
        <td style="border: 1px solid #333; padding: 6px;">${item.muc2Score} <span style="font-size: 10px; color: #dc2626;">(-${item.muc2Deduction})</span></td>
        <td style="border: 1px solid #333; padding: 6px;">${item.muc3Score} <span style="font-size: 10px; color: #dc2626;">(-${item.muc3Deduction})</span></td>
        <td style="border: 1px solid #333; padding: 6px;">${item.muc4Score} <span style="font-size: 10px; color: #dc2626;">(-${item.muc4Deduction})</span></td>
        <td style="border: 1px solid #333; padding: 6px;">${item.muc5Score} <span style="font-size: 10px; color: #dc2626;">(-${item.muc5Deduction})</span></td>
        <td style="border: 1px solid #333; padding: 6px; font-weight: bold; color: #1d4ed8; font-size: 14px;">${item.totalScore}</td>
        <td style="border: 1px solid #333; padding: 6px; font-weight: 600;">
          ${item.award === 'nhat' ? '⭐ Giải Nhất' : item.award === 'nhi' ? '🥈 Giải Nhì' : item.award === 'ba' ? '🥉 Giải Ba' : item.award === 'can_co_gang' ? '⚠️ Cần chấn chỉnh' : 'Khuyến khích'}
        </td>
      </tr>
    `).join('');
  };

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Báo Cáo Thi Đua Nội Trú PTDTBT THCS Trà Đốc</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.3; color: #000; }
        table { border-collapse: collapse; width: 100%; font-size: 11pt; }
        th { border: 1px solid #333; padding: 6px; background-color: #f1f5f9; text-align: center; }
        .header-table { width: 100%; border: none; margin-bottom: 20px; }
        .header-table td { border: none; vertical-align: top; }
        .title { text-align: center; font-size: 16pt; font-weight: bold; margin-top: 20px; text-transform: uppercase; }
        .subtitle { text-align: center; font-size: 13pt; font-style: italic; margin-bottom: 25px; }
        .section-title { font-size: 13pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #1e3a8a; }
        .sign-table { width: 100%; border: none; margin-top: 40px; }
        .sign-table td { border: none; text-align: center; vertical-align: top; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 45%; text-align: center;">
            <div style="font-weight: bold; font-size: 11.5pt;">TRƯỜNG PTDTBT THCS TRÀ ĐỐC</div>
            <div style="font-weight: bold; font-size: 11pt;">BAN QUẢN SINH NỘI TRÚ</div>
            <div style="width: 120px; border-bottom: 1px solid #333; margin: 4px auto;"></div>
            <div style="font-size: 10pt; margin-top: 4px;">Số: .... /BC-BQS</div>
          </td>
          <td style="width: 55%; text-align: center;">
            <div style="font-weight: bold; font-size: 11.5pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-weight: bold; font-size: 12pt;">Độc lập - Tự do - Hạnh phúc</div>
            <div style="width: 150px; border-bottom: 1px solid #333; margin: 4px auto;"></div>
            <div style="font-style: italic; font-size: 11pt; margin-top: 8px;">Trà Đốc, ngày ${currentDate}</div>
          </td>
        </tr>
      </table>

      <div class="title">BÁO CÁO KẾT QUẢ THI ĐUA PHÒNG Ở NỘI TRÚ</div>
      <div class="subtitle">Tuần số: ${weekNumber} - Năm học: ${state.currentYear || '2026-2027'}</div>

      <p>Kính gửi: <strong>Ban Giám Hiệu trường PTDTBT THCS Trà Đốc</strong></p>
      <p style="text-indent: 25px; text-align: justify;">
        Căn cứ quy chế hoạt động của Ban Quản sinh và kết quả theo dõi, chấm điểm của các bộ phận: Giáo viên trực đêm tự học, Giáo viên trực đêm ngủ lại, Giáo viên phụ trách phòng, Y tế học đường, Ban Thanh tra, Đoàn Thanh niên và Tổng phụ trách Đội; Ban Quản sinh xin tổng hợp và công bố kết quả thi đua của 25 phòng ở bán trú / nội trú như sau:
      </p>

      <div class="section-title">I. BẢNG XẾP HẠNG THI ĐUA KHU NAM (12 PHÒNG Ở)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">Vị thứ</th>
            <th style="width: 55px;">Phòng</th>
            <th>Tên phòng</th>
            <th>GV Phụ trách</th>
            <th style="width: 45px;">Sĩ số</th>
            <th>M1 (Tự học)</th>
            <th>M2 (Khóa)</th>
            <th>M3 (V.Sinh)</th>
            <th>M4 (Nề nếp)</th>
            <th>M5 (Nội quy)</th>
            <th style="width: 65px;">Tổng điểm</th>
            <th>Xếp loại</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(maleList)}
        </tbody>
      </table>

      <div class="section-title" style="margin-top: 30px;">II. BẢNG XẾP HẠNG THI ĐUA KHU NỮ (13 PHÒNG Ở)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">Vị thứ</th>
            <th style="width: 55px;">Phòng</th>
            <th>Tên phòng</th>
            <th>GV Phụ trách</th>
            <th style="width: 45px;">Sĩ số</th>
            <th>M1 (Tự học)</th>
            <th>M2 (Khóa)</th>
            <th>M3 (V.Sinh)</th>
            <th>M4 (Nề nếp)</th>
            <th>M5 (Nội quy)</th>
            <th style="width: 65px;">Tổng điểm</th>
            <th>Xếp loại</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(femaleList)}
        </tbody>
      </table>

      <div class="section-title" style="margin-top: 30px;">III. NHẬN XÉT VÀ ĐÁNH GIÁ CHUNG CỦA TRƯỞNG BAN QUẢN SINH</div>
      <p style="text-indent: 25px; text-align: justify;">
        - <strong>Ưu điểm:</strong> Đa số học sinh các phòng ở duy trì nền nếp tự học đêm từ 19h00 đến 20h30 nghiêm túc. Việc ăn ở, vệ sinh phòng ốc và khuôn viên được các thầy cô trực phòng nhắc nhở thường xuyên, phòng ốc gọn gàng ngăn nắp. Nhiều phòng đạt điểm tối đa ở cả 5 mục thi đua.
      </p>
      <p style="text-indent: 25px; text-align: justify;">
        - <strong>Tồn tại, hạn chế cần khắc phục:</strong> Một số phòng nam còn tình trạng mất trật tự sau giờ tắt đèn (22h00); một vài học sinh còn vắng tự học không phép để đi chơi hoặc ra ngoài khuôn viên trường; cần tăng cường kiểm tra nề nếp gấp chăn màn buổi sáng.
      </p>
      <p style="text-indent: 25px; text-align: justify;">
        - <strong>Đề xuất khen thưởng & Chấn chỉnh:</strong> Biểu dương cờ Thi đua xuất sắc cho phòng đứng đầu Khu Nam và Khu Nữ trong buổi chào cờ đầu tuần. Yêu cầu giáo viên phụ trách các phòng xếp loại cần cố gắng họp phòng và chấn chỉnh kịp thời.
      </p>

      <table class="sign-table">
        <tr>
          <td style="width: 50%;">
            <div style="font-weight: bold; text-transform: uppercase;">HIỆU TRƯỞNG DUYỆT</div>
            <div style="font-style: italic; font-size: 10.5pt;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 70px;"></div>
            <div style="font-weight: bold;">Trần Đình Sơn</div>
          </td>
          <td style="width: 50%;">
            <div style="font-weight: bold; text-transform: uppercase;">TRƯỞNG BAN QUẢN SINH</div>
            <div style="font-style: italic; font-size: 10.5pt;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 70px;"></div>
            <div style="font-weight: bold;">Nguyễn Trọng Nghĩa</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BaoCao_ThiDua_NoiTru_TraDoc_Tuan_${weekNumber}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
