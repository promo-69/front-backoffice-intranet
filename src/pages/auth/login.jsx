import AuthLayout from "../../layouts/AuthLayout";
import LoginForm from "../../components/forms/LoginForm";

export default function Login() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>
      <LoginForm />
    </AuthLayout>
  );
}
