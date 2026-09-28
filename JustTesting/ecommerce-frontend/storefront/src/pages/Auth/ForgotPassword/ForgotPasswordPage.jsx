import ForgotPasswordForm from "../../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
        Forgot password
      </h1>
      <ForgotPasswordForm />
    </div>
  );
}
