import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty or first input on mount
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[targetIndex]?.focus();
  }, []);

  const handleChange = (index: number, char: string) => {
    if (disabled) return;
    
    // Only accept numeric characters
    const cleaned = char.replace(/\D/g, '');
    if (!cleaned) return;

    const lastChar = cleaned[cleaned.length - 1];
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const newOtp = newDigits.join('');

    onChange(newOtp);

    // Auto focus next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.length === length && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      
      if (digits[index]) {
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();

    const pastedData = e.clipboardData.getData('text/plain').trim();
    const numbersOnly = pastedData.replace(/\D/g, '').slice(0, length);

    if (numbersOnly.length > 0) {
      onChange(numbersOnly);

      const nextFocus = Math.min(numbersOnly.length, length - 1);
      inputRefs.current[nextFocus]?.focus();

      if (numbersOnly.length === length && onComplete) {
        onComplete(numbersOnly);
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 my-4">
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[index]}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border bg-[#161616] text-[#FEF8E8] transition-all duration-200 outline-none
              ${
                hasError
                  ? 'border-red-500/80 bg-red-500/5 text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : isFilled
                  ? 'border-[#F44A22] bg-[#F44A22]/5 shadow-sm shadow-[#F44A22]/10'
                  : 'border-[#2A2A2A] hover:border-[#3A3A3A] focus:border-[#F44A22] focus:ring-2 focus:ring-[#F44A22]/20'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          />
        );
      })}
    </div>
  );
};
