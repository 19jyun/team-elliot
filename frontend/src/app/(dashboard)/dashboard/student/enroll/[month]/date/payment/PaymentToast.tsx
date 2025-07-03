import { useEffect, useState } from 'react';

interface PaymentToastProps {
  show: boolean;
  message: string;
}

export function PaymentToast({ show, message }: PaymentToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(false);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 300);
        
        return () => clearTimeout(hideTimer);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      
      return () => clearTimeout(hideTimer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed left-1/2 top-4 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50 transition-all duration-300 ease-in-out ${
        isAnimating 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-12 opacity-0'
      }`}
      style={{
        transform: `translate(-50%, ${isAnimating ? '0' : '-48px'})`,
        opacity: isAnimating ? 1 : 0,
      }}
    >
      {message}
    </div>
  );
} 