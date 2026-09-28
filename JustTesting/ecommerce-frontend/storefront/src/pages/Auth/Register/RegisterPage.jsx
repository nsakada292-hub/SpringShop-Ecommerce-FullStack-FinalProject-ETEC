import RegisterForm from "../../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
        Create your account
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
        Join LAGOON and start shopping
      </p>
      <RegisterForm />
    </div>
  );
}
