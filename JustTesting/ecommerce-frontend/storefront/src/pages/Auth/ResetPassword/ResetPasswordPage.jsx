import ResetPasswordForm from "../../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
        Reset password
      </h1>
      <ResetPasswordForm />
    </div>
  );
}
