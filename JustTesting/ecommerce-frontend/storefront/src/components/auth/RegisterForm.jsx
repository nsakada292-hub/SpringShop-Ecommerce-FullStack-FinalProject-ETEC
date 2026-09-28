import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, pendingEmail } from "../../services/authService";
import Button from "../common/Button";
import Input from "../common/Input";
import Alert from "../common/Alert";
import { getErrorMessage } from "../../utils/helpers";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password });
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
        id="reg-name"
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
        placeholder="Jane Doe"
      />
      <Input
        id="reg-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Input
        id="reg-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="At least 6 characters"
      />
      <Input
        id="reg-confirm"
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        placeholder="Re-enter password"
      />
      <Button type="submit" className="w-full justify-center" size="lg" loading={loading}>
        Create Account
      </Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link to="/sign-in" className="text-brand.blue dark:text-brand.aqua font-medium hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
