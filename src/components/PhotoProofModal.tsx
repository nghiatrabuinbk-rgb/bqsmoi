import React from 'react';
import { X, Calendar, User, Clock, Image as ImageIcon } from 'lucide-react';
import { PhotoProof } from '../types';

interface PhotoProofModalProps {
  photo: PhotoProof | null;
  onClose: () => void;
}

export const PhotoProofModal: React.FC<PhotoProofModalProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base sm:text-lg">Hình ảnh minh chứng chấm điểm</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image preview */}
        <div className="bg-slate-950 flex items-center justify-center p-2 overflow-auto flex-1 max-h-[60vh]">
          <img 
            src={photo.url} 
            alt={photo.caption || 'Minh chứng'} 
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        </div>

        {/* Metadata info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="font-medium text-slate-900 text-base mb-2">
            {photo.caption || 'Không có mô tả'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Thời gian tải ảnh: <strong>{photo.uploadedAt}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Người ghi nhận: <strong>{photo.uploadedBy}</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-sm transition"
          >
            Đóng xem ảnh
          </button>
        </div>
      </div>
    </div>
  );
};
