"use client";

import { Button, TextField } from "@radix-ui/themes";
import { Icon } from "./icon";
import { useSimulation } from "./simulation-context";
import { emailError } from "../_lib/validation";
import { useLiveValidation } from "./use-live-validation";
import { FieldFeedback } from "./FieldFeedback";
import { SignupFlow } from "./SignupFlow";

export function AccountScreens() {
  const {
    lesson,
    screen,
    signupStage,
    account,
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
    login,
  } = useSimulation();
  const loginValidation = useLiveValidation(
    {
      loginEmail: emailError(loginEmail),
      loginPassword: loginPassword ? "" : "Em hãy nhập mật khẩu luyện tập.",
    },
    "login",
  );
  const loginEmailError = loginValidation.error("loginEmail", loginEmail);
  const loginPasswordError = loginValidation.error(
    "loginPassword",
    loginPassword,
  );
  return (
    <div className={`account-page ${screen === "signup" || screen === "review" ? "registration-page" : ""}`}>
      <div className={`account-card ${screen === "signup" || screen === "review" ? "registration-card" : ""}`}>
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
                  onClick={() => chooseLesson(0)}
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
        {(screen === "signup" || screen === "review") && <SignupFlow key={signupStage} />}
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
