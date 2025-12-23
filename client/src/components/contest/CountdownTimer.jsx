import { useState, useEffect } from 'react';
import { formatTime } from '../../utils/formatTime';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ endTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const total = Date.parse(endTime) - Date.parse(new Date());
      return Math.max(0, Math.floor(total / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  return (
    <div className="flex items-center gap-2 bg-dark-800 px-4 py-2 rounded-lg border border-dark-700">
      <Clock className="w-5 h-5 text-primary-500" />
      <span className="font-mono text-lg font-semibold text-gray-100">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default CountdownTimer;
