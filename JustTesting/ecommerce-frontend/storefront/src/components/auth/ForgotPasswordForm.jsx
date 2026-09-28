import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword, pendingEmail } from "../../services/authService";
import Button from "../common/Button";
import Input from "../common/Input";
import Alert from "../common/Alert";
import { getErrorMessage } from "../../utils/helpers";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      pendingEmail.set(email);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <Alert type="success">
          A reset code has been sent to {email}. Check your inbox.
        </Alert>
        <Button
          onClick={() => navigate("/reset-password", { state: { email } })}
          className="w-full justify-center"
          size="lg"
        >
          Continue to Reset
        </Button>
        <Link to="/sign-in" className="block text-sm text-brand.blue dark:text-brand.aqua hover:underline">
          Back to Log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Enter your account email and we'll send you a code to reset your password.
      </p>
      <Input
        id="forgot-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Button type="submit" className="w-full justify-center" size="lg" loading={loading}>
        Send Reset Code
      </Button>
      <Link to="/sign-in" className="block text-center text-sm text-brand.blue dark:text-brand.aqua hover:underline">
        Back to Log in
      </Link>
    </form>
  );
}
