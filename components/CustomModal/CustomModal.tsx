interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function CustomModal({ open, onClose, children }: CustomModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 text-white rounded-2xl shadow-2xl max-w-lg w-full p-6 z-10 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
          ✖
        </button>

        {children}
      </div>
    </div>
  );
}
