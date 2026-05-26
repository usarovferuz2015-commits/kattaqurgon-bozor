import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-dark-100/50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl bg-dark-100/50 flex items-center justify-center hover:bg-dark-200/50 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-dark-600" />
            </button>
            <div>
              <h1 className="font-bold text-dark-900 text-base">{title}</h1>
              {subtitle && <p className="text-xs text-dark-400">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  );
}
