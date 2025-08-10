// IMPORTS (no cambian)
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { notifySuccess, notifyError } from "../../utils/notify";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

// CONSTANTES
const apiUrl = import.meta.env.VITE_API_URL || '';
const signupUrl = `${apiUrl}/users/signup/`;

interface Errors {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  phone?: string;
}

const generateUniqueId = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [user_unique_id, setUserUniqueId] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [weakPassword, setWeakPassword] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    setUserUniqueId(generateUniqueId());
  }, []);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    setErrors({});
    setWeakPassword(false);
    setConfirmError("");

    if (!firstname.trim()) newErrors.firstname = "First name is required";
    if (!lastname.trim()) newErrors.lastname = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setWeakPassword(true);
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{1,8}$/.test(phone)) {
      newErrors.phone = "Only numbers allowed (max 8 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && confirmPassword === password;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post(signupUrl, {
        user_firstname: firstname,
        user_lastname: lastname,
        user_email: email,
        user_password: password,
        user_phonenumber: phone,
        user_unique_id,
        role_id: 4,
      });
      notifySuccess("¡Gracias por registrarte!");
      navigate("/");
    } catch (error: any) {
      console.error(error.response);
      if (error.response?.data?.message) {
        notifyError(error.response.data.message);
      } else {
        notifyError("Ocurrió un error al registrarte.");
      }
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "").slice(0, 8);
    setPhone(input);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <ChevronLeftIcon className="size-5" />
          Back
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign Up
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your details to create an account!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>First Name<span className="text-error-500">*</span></Label>
                <Input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="John" />
                {errors.firstname && <p className="text-sm text-red-500">{errors.firstname}</p>}
              </div>
              <div>
                <Label>Last Name<span className="text-error-500">*</span></Label>
                <Input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Doe" />
                {errors.lastname && <p className="text-sm text-red-500">{errors.lastname}</p>}
              </div>
            </div>

            <div>
              <Label>Email<span className="text-error-500">*</span></Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <Label>Password<span className="text-error-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? <EyeIcon className="size-5 fill-gray-500" /> : <EyeCloseIcon className="size-5 fill-gray-500" />}
                </span>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              {weakPassword && (
                <p className="text-sm text-yellow-500">
                  Password too weak. Use at least 6 characters, one capital letter, and one number.
                </p>
              )}
            </div>

            <div>
              <Label>Confirm Password<span className="text-error-500">*</span></Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
              {confirmError && <p className="text-sm text-red-500">{confirmError}</p>}
            </div>

            <div>
              <Label>Phone<span className="text-error-500">*</span></Label>
              <Input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="12345678"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                className="w-5 h-5"
                checked={isChecked}
                onChange={setIsChecked}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By creating an account you agree to our{" "}
                <span className="text-brand-500">Terms</span> and{" "}
                <span className="text-brand-500">Privacy Policy</span>.
              </p>
            </div>

            <button
              type="submit"
              disabled={!isChecked}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isChecked
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="text-brand-500 hover:text-brand-600">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
