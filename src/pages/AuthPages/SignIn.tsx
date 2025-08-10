import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Koli - SignIn"
        description="Inicia sesión en el sistema Koli"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
