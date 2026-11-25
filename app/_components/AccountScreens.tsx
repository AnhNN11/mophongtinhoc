"use client";

import { Button, TextField, Checkbox } from "@radix-ui/themes";
import { Icon } from "./icon";
import { useSimulation } from "./simulation-context";
import { registrationErrors, emailError } from "../_lib/validation";
import { useLiveValidation } from "./use-live-validation";
import { FieldFeedback } from "./FieldFeedback";

export function AccountScreens() {
  const {
    lesson,
    screen,
    setScreen,
    account,
    registration,
    setRegistration,
    accepted,
    setAccepted,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showPassword,
    setShowPassword,
    error,
    setError,
    mark,
    chooseLesson,
    beginSignup,
    signup,
    finishSignup,
    login,
  } = useSimulation();
  const signValidation = useLiveValidation(
    registrationErrors(registration),
    "signup",
  );
  const loginValidation = useLiveValidation(
    {
      loginEmail: emailError(loginEmail),
      loginPassword: loginPassword ? "" : "Em hãy nhập mật khẩu luyện tập.",
    },
    "login",
  );
  const signError = (field: keyof typeof registration) =>
    signValidation.error(field, registration[field]);
  const loginEmailError = loginValidation.error("loginEmail", loginEmail);
  const loginPasswordError = loginValidation.error(
    "loginPassword",
    loginPassword,
  );
  function updateRegistration(field: keyof typeof registration, value: string) {
    setRegistration((previous) => ({ ...previous, [field]: value }));
    signValidation.touch(field);
    setError("");
  }
  function signFeedback(field: keyof typeof registration, success?: string) {
    return (
      <FieldFeedback
        id={signValidation.feedbackId(field)}
        error={signError(field)}
        success={registration[field] && !signError(field) ? success : undefined}
      />
    );
  }
  return (
    <div className="account-page">
      <div className="account-card">
        <div className="google-word" aria-label="Google">
          <span>G</span>
          <span>o</span>
          <span>o</span>
          <span>g</span>
          <span>l</span>
          <span>e</span>
        </div>
        {screen === "login" && (
          <>
            <h3>Đăng nhập</h3>
            <p>Tiếp tục đến Gmail mô phỏng</p>
            <form
              onSubmit={(event) => {
                if (loginValidation.validate(event)) login(event);
                else setError("");
              }}
              noValidate
            >
              <label>
                Địa chỉ thư điện tử
                <TextField.Root
                  {...loginValidation.fieldProps("loginEmail", loginEmail)}
                  aria-label="Địa chỉ đăng nhập"
                  autoComplete="off"
                  inputMode="email"
                  placeholder="Tên đăng nhập@gmail.com"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    loginValidation.touch("loginEmail");
                    setError("");
                    if (lesson === 1)
                      mark(
                        1,
                        0,
                        !emailError(e.target.value) &&
                          e.target.value.toLowerCase() ===
                            account.email.toLowerCase(),
                      );
                  }}
                />
                <FieldFeedback
                  id={loginValidation.feedbackId("loginEmail")}
                  error={loginEmailError}
                />
              </label>
              <label>
                Mật khẩu luyện tập
                <div className="password-field">
                  <TextField.Root
                    {...loginValidation.fieldProps(
                      "loginPassword",
                      loginPassword,
                    )}
                    aria-label="Mật khẩu luyện tập"
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      loginValidation.touch("loginPassword");
                      setError("");
                    }}
                  />
                  <Button
                    variant="soft"
                    type="button"
                    aria-label="Hiện hoặc ẩn mật khẩu"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name="eye" size={17} />
                  </Button>
                </div>
                <FieldFeedback
                  id={loginValidation.feedbackId("loginPassword")}
                  error={loginPasswordError}
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="account-buttons">
                <Button
                  variant="soft"
                  type="button"
                  className="text-button"
                  onClick={beginSignup}
                >
                  Tạo tài khoản
                </Button>
                <Button variant="soft" type="submit" className="google-button">
                  Đăng nhập
                </Button>
              </div>
            </form>
            <div className="demo-credentials">
              <Icon name="light" size={17} />
              <div>
                <strong>Tài khoản luyện tập</strong>
                <span>{account.email}</span>
                <span>
                  Mật khẩu: <b>{account.password}</b>
                </span>
              </div>
            </div>
          </>
        )}
        {screen === "signup" && (
          <>
            <h3>Tạo tài khoản</h3>
            <p>Sử dụng thông tin giả định để luyện tập</p>
            <form
              onSubmit={(event) => {
                if (signValidation.validate(event)) signup(event);
                else setError("");
              }}
              noValidate
            >
              <div className="name-fields">
                <label>
                  Họ
                  <TextField.Root
                    {...signValidation.fieldProps("last", registration.last)}
                    aria-label="Họ"
                    value={registration.last}
                    placeholder="Hoàng Hải"
                    onChange={(e) => updateRegistration("last", e.target.value)}
                  />
                  {signFeedback("last")}
                </label>
                <label>
                  Tên
                  <TextField.Root
                    {...signValidation.fieldProps("first", registration.first)}
                    aria-label="Tên"
                    value={registration.first}
                    placeholder="Hà"
                    onChange={(e) =>
                      updateRegistration("first", e.target.value)
                    }
                  />
                  {signFeedback("first")}
                </label>
              </div>
              <label>
                Tên đăng nhập
                <div className="username-field">
                  <TextField.Root
                    {...signValidation.fieldProps(
                      "username",
                      registration.username,
                    )}
                    aria-label="Tên đăng nhập"
                    value={registration.username}
                    placeholder="hahai6a"
                    autoCapitalize="none"
                    onChange={(e) =>
                      updateRegistration("username", e.target.value)
                    }
                  />
                  <span>@gmail.com</span>
                </div>
                {signFeedback("username", "Tên đăng nhập đúng định dạng.")}
              </label>
              <label>
                Mật khẩu luyện tập
                <TextField.Root
                  {...signValidation.fieldProps(
                    "password",
                    registration.password,
                  )}
                  aria-label="Mật khẩu luyện tập"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={registration.password}
                  onChange={(e) =>
                    updateRegistration("password", e.target.value)
                  }
                />
                {signFeedback("password", "Mật khẩu đạt yêu cầu luyện tập.")}
              </label>
              <label>
                Xác nhận mật khẩu
                <TextField.Root
                  {...signValidation.fieldProps(
                    "confirm",
                    registration.confirm,
                  )}
                  aria-label="Xác nhận mật khẩu"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={registration.confirm}
                  onChange={(e) =>
                    updateRegistration("confirm", e.target.value)
                  }
                />
                {signFeedback("confirm", "Hai mật khẩu đã khớp.")}
              </label>
              <label className="checkbox-label">
                <Checkbox
                  checked={showPassword}
                  onCheckedChange={(checked) =>
                    setShowPassword(checked === true)
                  }
                />
                Hiện mật khẩu
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="account-buttons">
                <Button
                  variant="soft"
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setScreen("login");
                    setError("");
                  }}
                >
                  Đăng nhập
                </Button>
                <Button variant="soft" className="google-button" type="submit">
                  Tiếp theo
                </Button>
              </div>
            </form>
          </>
        )}
        {screen === "review" && (
          <>
            <span className="review-icon">
              <Icon name="mail" size={30} />
            </span>
            <h3>Kiểm tra thông tin</h3>
            <p>Một bước nữa là có hộp thư của em!</p>
            <div className="account-summary">
              <strong>
                {registration.last} {registration.first}
              </strong>
              <span>{registration.username}@gmail.com</span>
            </div>
            <form onSubmit={finishSignup} noValidate>
              <label className="checkbox-label">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(checked) => {
                    setAccepted(checked === true);
                    setError("");
                  }}
                />
                Em đang dùng thông tin và mật khẩu giả định để thực hành.
              </label>
              <p className="account-notice">
                Khi tạo tài khoản thật, hãy nhờ phụ huynh hoặc thầy cô hỗ trợ.
              </p>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="account-buttons">
                <Button
                  variant="soft"
                  type="button"
                  className="text-button"
                  onClick={() => setScreen("signup")}
                >
                  Quay lại
                </Button>
                <Button variant="soft" type="submit" className="google-button">
                  Tạo tài khoản
                </Button>
              </div>
            </form>
          </>
        )}
        {screen === "welcome" && (
          <>
            <span className="welcome-check">
              <Icon name="check" size={35} />
            </span>
            <h3>Chào mừng {account.name.split(" ").at(-1)}!</h3>
            <p>Em đã tạo thành công tài khoản mô phỏng.</p>
            <div className="account-summary">
              <strong>{account.email}</strong>
              <span>Hãy ghi nhớ tên đăng nhập và mật khẩu.</span>
            </div>
            <Button
              variant="soft"
              className="primary-button"
              onClick={() => chooseLesson(1)}
            >
              Thực hành đăng nhập
              <Icon name="chevron" size={16} />
            </Button>
          </>
        )}
      </div>
      <p className="account-footer">
        <Icon name="lock" size={13} />
        Môi trường mô phỏng · Không tạo tài khoản Google thật
      </p>
    </div>
  );
}
