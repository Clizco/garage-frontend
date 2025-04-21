import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

const apiUrl = import.meta.env.VITE_API_URL || '';
const signupUrl = `${apiUrl}/users/signup/`;
const provincesUrl = `${apiUrl}/provinces/provinces/all`;

interface Province {
  id: number;
  province_name: string;
}

interface Errors {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  phone?: string;
  province?: string;
}

const generateUniqueId = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [user_unique_id, setUserUniqueId] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get<Province[]>(provincesUrl);
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
    setUserUniqueId(generateUniqueId());
  }, []);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!firstname.trim()) newErrors.firstname = "First name is required";
    if (!lastname.trim()) newErrors.lastname = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{1,8}$/.test(phone)) {
      newErrors.phone = "Only numbers allowed (max 8 digits)";
    }
    if (!province) newErrors.province = "Province is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        user_province: province,
        user_unique_id,
        role_id: 1,
      });
      alert("¡Gracias por registrarte!");
      navigate("/login");
    } catch (error: any) {
      console.error(error.response);
      alert("Ocurrió un error al registrarte.");
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, ""));
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
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

            <div>
              <Label>Province<span className="text-error-500">*</span></Label>
              <select
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">Select province</option>
                {provinces.map((prov) => (
                  <option key={prov.id} value={prov.id.toString()}>
                    {prov.province_name}
                  </option>
                ))}
              </select>
              {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
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
              className="w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
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
