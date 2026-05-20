import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import { useNavigate, Link } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { register, loading, error, clearError } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const passwordRules = useMemo(() => {
    const password = formData.password;

    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isEmailValid = emailRegex.test(formData.email.trim());

  const isFormValid =
    formData.username.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    isEmailValid &&
    isPasswordValid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = {};
    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    if (email && !emailRegex.test(email))
      errors.email = "Enter a valid email address";
    if (!password) errors.password = "Password is required";

    if (
      !passwordRules.length ||
      !passwordRules.upper ||
      !passwordRules.lower ||
      !passwordRules.number
    ) {
      errors.password = "Password is too weak";
    }

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    try {
      await register({ username, email, password });

      addToast({
        message: "Account created successfully!",
        type: "success",
      });

      navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setValidationErrors(fieldErrors);
      }
    }
  };

  const Rule = ({ ok, label }) => (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${
          ok ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"
        }`}
      />
      <span
        className={
          ok
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-gray-400"
        }
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign up to get started
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                aria-invalid={!!validationErrors.username}
                aria-describedby="username-error"
                className={`mt-1 w-full px-3 py-2 rounded-md border transition focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none dark:bg-gray-900 text-gray-900 dark:text-white ${
                  validationErrors.username
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              />
              {validationErrors.username && (
                <p id="username-error" className="text-xs text-red-500 mt-1">
                  {validationErrors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!validationErrors.email}
                aria-describedby="email-error"
                className={`mt-1 w-full px-3 py-2 rounded-md border transition focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none dark:bg-gray-900 ${
                  validationErrors.email
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              />
              {validationErrors.email && (
                <p id="email-error" className="text-xs text-red-500 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!validationErrors.password}
                  aria-describedby="password-error"
                  className={`w-full px-3 py-2 rounded-md border pr-10 transition focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none dark:bg-gray-900 ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-2 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password Rules */}
              <div className="mt-2 space-y-1">
                <Rule ok={passwordRules.length} label="At least 8 characters" />
                <Rule ok={passwordRules.upper} label="One uppercase letter" />
                <Rule ok={passwordRules.lower} label="One lowercase letter" />
                <Rule ok={passwordRules.number} label="One number" />
              </div>

              {validationErrors.password && (
                <p id="password-error" className="text-xs text-red-500 mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-2.5 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

            {/* Sign in */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
