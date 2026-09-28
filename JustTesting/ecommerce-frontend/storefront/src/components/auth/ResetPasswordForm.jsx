import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  resetPassword,
  verifyOtp,
  pendingEmail,
  adminRedirectUrl,
} from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import Input from "../common/Input";
import Alert from "../common/Alert";
import { getErrorMessage } from "../../utils/helpers";

export default function ResetPasswordForm() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || pendingEmail.read();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleCodeChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = cleaned;
    setCode(next);
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!email) {
      setError("Missing email. Please start again.");
      return;
    }
    const resetCode = code.join("");
    if (resetCode.length !== 6) {
      setError("Please enter the 6-digit reset code");
      return;
    }
    setLoading(true);
    try {
      // POST /auth/reset-password is part of the spec but not yet
      // implemented by the backend — surface that cleanly instead of
      // pretending the reset went through.
      await resetPassword({ email, code: resetCode, newPassword });
      const res = await verifyOtp({ email, otpCode: resetCode });
      const { token, refreshToken, user } = res.data;
      loginUser(user, token, refreshToken);
      pendingEmail.clear();
      if (user.role === "ADMIN") {
        window.location.href = adminRedirectUrl(res.data);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
        Enter the reset code and your new password.
      </p>
      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            inputMode="numeric"
            maxLength={1}
            className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand.skyBlue/60 focus:border-brand.skyBlue"
          />
        ))}
      </div>
      <Input
        id="reset-password"
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="At least 6 characters"
      />
      <Input
        id="reset-confirm"
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        placeholder="Re-enter new password"
      />
      <Button type="submit" className="w-full justify-center" size="lg" loading={loading}>
        Reset Password & Log In
      </Button>
      <Link to="/sign-in" className="block text-center text-sm text-brand.blue dark:text-brand.aqua hover:underline">
        Back to Log in
      </Link>
    </form>
  );
}