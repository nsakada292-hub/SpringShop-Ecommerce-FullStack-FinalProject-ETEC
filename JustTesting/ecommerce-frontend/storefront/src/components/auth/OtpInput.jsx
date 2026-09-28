import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  verifyOtp,
  sendOtp,
  pendingEmail,
  adminRedirectUrl,
} from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import Alert from "../common/Alert";
import { getErrorMessage } from "../../utils/helpers";

export default function OtpInput({ initialEmail }) {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const email = initialEmail || pendingEmail.read();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const redirectAfterVerify = (auth) => {
    if (auth.user?.role === "ADMIN") {
      window.location.href = adminRedirectUrl(auth);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const target = params.get("redirect");
    navigate(target || "/", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otpCode: code });
      const { token, refreshToken, user } = res.data;
      loginUser(user, token, refreshToken);
      pendingEmail.clear();
      redirectAfterVerify(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await sendOtp({ email });
      setCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
        Enter the 6-digit code sent to{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {email || "your email"}
        </span>
      </p>
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            inputMode="numeric"
            maxLength={1}
            className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand.skyBlue/60 focus:border-brand.skyBlue"
          />
        ))}
      </div>
      <Button type="submit" className="w-full justify-center" size="lg" loading={loading}>
        Verify & Continue
      </Button>
      <div className="flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="text-brand.blue dark:text-brand.aqua font-medium hover:underline disabled:text-slate-400 disabled:no-underline"
        >
          {resending
            ? "Sending…"
            : cooldown > 0
            ? `Resend code in ${cooldown}s`
            : "Resend code"}
        </button>
      </div>
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={() => {
            pendingEmail.clear();
            navigate("/sign-in");
          }}
          className="text-slate-500 dark:text-slate-400 hover:text-brand.blue dark:hover:text-brand.aqua"
        >
          ← Back to sign in
        </button>
      </div>
    </form>
  );
}