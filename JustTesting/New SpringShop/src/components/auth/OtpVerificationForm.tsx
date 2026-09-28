import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';

interface OtpVerificationFormProps {
  email: string;
  demoOtp?: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  email,
  demoOtp = '123456',
  onSubmit,
  onResend,
  isLoading = false,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    // Auto-focus first input box
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, val: string) => {
    // Only take the last character typed if single entry
    const cleaned = val.replace(/\D/g, '');
    const char = cleaned.slice(-1);

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // If completed 6 digits, auto-submit
    if (newDigits.every(d => d !== '')) {
      onSubmit(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    inputsRef.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      onSubmit(pastedData);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = digits.join('');
    if (fullOtp.length === 6) {
      onSubmit(fullOtp);
    }
  };

  const handleQuickFillDemo = () => {
    const arr = (demoOtp || '123456').split('');
    setDigits(arr);
    onSubmit(arr.join(''));
  };

  const handleResendClick = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await onResend();
      setResendCooldown(60);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* 6 Digits Boxes with auto-advance and paste support */}
      <div className="flex justify-between gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputsRef.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#009dff] focus:ring-4 focus:ring-[#009dff]/15 rounded-xl outline-none transition-all text-zinc-900 dark:text-zinc-100"
          />
        ))}
      </div>

      {/* Demo OTP Helper Notice */}
      <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-center">
        <p className="text-xs text-sky-800 dark:text-sky-300">
          Demo verification code: <strong className="font-mono text-sm tracking-widest text-[#009dff]">{demoOtp}</strong>
        </p>
        <button
          type="button"
          onClick={handleQuickFillDemo}
          className="mt-1.5 text-[11px] font-semibold text-[#009dff] hover:underline"
        >
          Click to auto-fill code
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={digits.some(d => !d)}
        className="w-full"
      >
        Verify Code & Continue
      </Button>

      <div className="text-center text-xs text-zinc-500">
        Didn't receive the code?{' '}
        <button
          type="button"
          onClick={handleResendClick}
          disabled={resendCooldown > 0 || isResending}
          className="font-semibold text-[#009dff] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </button>
      </div>
    </form>
  );
};
