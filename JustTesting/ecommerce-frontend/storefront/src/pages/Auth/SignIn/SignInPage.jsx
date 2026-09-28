import LoginForm from "../../../components/auth/LoginForm";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
        Welcome back
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
        Log in to your LAGOON account
      </p>
      <LoginForm />
    </div>
  );
}
