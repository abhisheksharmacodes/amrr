import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface SnackbarProps {
  message: string;
  type?: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Snackbar = ({ message, type = 'success', isVisible, onClose, duration = 4000 }: SnackbarProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? FaCheckCircle : FaTimesCircle;
  const bgColor = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const iconColor = isSuccess ? 'text-green-500' : 'text-red-500';

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:max-w-sm z-[9999] px-0 sm:px-4">
      <div
        className={`
          ${bgColor} 
          ${textColor}
          border rounded-lg shadow-lg p-4 
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'}
        `}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-center sm:text-left">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snackbar; 