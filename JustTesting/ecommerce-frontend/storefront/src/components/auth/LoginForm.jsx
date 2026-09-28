import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, pendingEmail } from "../../services/authService";
import Button from "../common/Button";
import Input from "../common/Input";
import Alert from "../common/Alert";
import { getErrorMessage } from "../../utils/helpers";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // /auth/login does NOT return a token — it triggers an OTP email.
      await login({ email, password });
      pendingEmail.set(email);
      navigate("/verify-otp", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <Input
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Input
        id="login-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        placeholder="••••••••"
      />
      <div className="flex items-center justify-end">
        <Link
          to="/forgot-password"
          className="text-sm text-brand.blue dark:text-brand.aqua hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full justify-center" size="lg" loading={loading}>
        Log In
      </Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand.blue dark:text-brand.aqua font-medium hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}