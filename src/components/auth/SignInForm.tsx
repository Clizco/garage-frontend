import { useState, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

const apiUrl = import.meta.env.VITE_API_URL || '';
const url = `${apiUrl}/users/signin/`;

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  interface SignInResponse {
    token: string;
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const lowerCaseEmail = email.toLowerCase();

      const resp = await axios.post<SignInResponse>(url, {
        user_email: lowerCaseEmail,
        user_password: password,
      });

      const token = resp.data.token;
      localStorage.setItem("token", token);

      // Obtener ID del usuario
      const decodedResponse = await axios.get<{ id: string }>(`${apiUrl}/users/user/token`, {
        headers: { "x-access-token": token },
      });

      const userId = decodedResponse.data.id;

      // Obtener rol del usuario
      const roleResponse = await axios.get<{ role: string }>(`${apiUrl}/users/users/role/${userId}`, {
        headers: { "x-access-token": token },
      });

      // Guardar info en localStorage
      localStorage.setItem("decodedToken", JSON.stringify(decodedResponse.data));
      localStorage.setItem("userRole", roleResponse.data.role);

      setLoading(false);
      navigate("/");
    } catch (error: any) {
      setLoading(false);
      if (error.response?.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Error en el servidor");
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in!
          </p>

          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <Label>Email <span className="text-error-500">*</span></Label>
                <Input
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  type="email"
                />
              </div>

              <div>
                <Label>Password <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="text-sm text-gray-700 dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {loading && <p className="text-sm text-gray-500">Cargando...</p>}

              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Iniciando..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm text-center text-gray-700 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
