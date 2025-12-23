import { useState, useEffect } from 'react';

export const useTimer = (initialTime, onComplete) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            if (onComplete) onComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (onComplete) onComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = (newTime) => {
    setTimeLeft(newTime || initialTime);
    setIsActive(false);
  };

  return { timeLeft, isActive, start, pause, reset };
};
