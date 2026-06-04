import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiCamera, FiX, FiList } from 'react-icons/fi';
import { useAppStore } from '../../store/appStore';
import { authService } from '../../services/endpoints';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface SupportModalProps {
  onClose: () => void;
}

export default function SupportModal({ onClose }: SupportModalProps) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm 5MB dan kichik bo\'lishi kerak');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const { data } = await api.post('/upload', { file: reader.result });
        if (data.success && data.data?.url) {
          setScreenshot(data.data.url);
          toast.success('Skrinshot yuklandi');
        }
      } catch {
        toast.error('Skrinshot yuklashda xatolik');
      }
    };
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Mavzu va xabar majburiy');
      return;
    }

    // Token yo'q bo'lsa, olishga harakat qil
    let token = useAppStore.getState().token;
    if (!token) {
      const id = useAppStore.getState().telegramId;
      if (id) {
        try {
          const res = await authService.initById(id);
          if (res.success && res.data?.token) {
            useAppStore.getState().setToken(res.data.token);
          }
        } catch (e) {}
      }
    }

    setSubmitting(true);
    try {
      const res = await api.post('/support', {
        subject: subject.trim(),
        message: message.trim(),
        screenshot_url: screenshot || undefined,
        page_url: window.location.href,
        device_info: navigator.userAgent,
      });
      if (res.data.success) {
        setTicketId(res.data.data.id);
        toast.success('Murojaatingiz qabul qilindi!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-dark-900 text-lg">
              {ticketId ? '✅ Murojaat qabul qilindi' : '📝 Murojaat yuborish'}
            </h2>
            {ticketId && <p className="text-xs text-dark-400 mt-0.5">ID: {ticketId.slice(0, 8)}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {ticketId ? (
          <div className="p-6 text-center">
            <span className="text-5xl">✅</span>
            <p className="text-dark-700 mt-3 font-medium">Murojaatingiz qabul qilindi</p>
            <p className="text-sm text-dark-400 mt-1">Tez orada ko'rib chiqamiz</p>
            <button onClick={() => { onClose(); navigate('/my-tickets'); }} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
              <FiList className="w-4 h-4" /> Mening murojaatlarim
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Mavzu *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" placeholder="Muammo yoki taklif mavzusi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Xabar *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-field min-h-[100px] resize-none" placeholder="Batafsil yozing..." rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Skrinshot (ixtiyoriy)</label>
              {screenshot ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                  <img src={screenshot} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setScreenshot('')} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-300">
                  <FiCamera className="w-5 h-5 text-dark-400" />
                  <span className="text-sm text-dark-500">Rasm tanlang</span>
                  <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                </label>
              )}
            </div>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <FiSend className="w-4 h-4" />
              )}
              {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
            </button>
            <button onClick={() => { onClose(); navigate('/my-tickets'); }} className="w-full text-center text-sm text-dark-400 hover:text-primary-600 mt-2 flex items-center justify-center gap-1">
              <FiList className="w-3.5 h-3.5" /> Mening murojaatlarim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
