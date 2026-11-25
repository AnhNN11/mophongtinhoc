"use client";

import { useEffect, useRef } from "react";
import { Button, Checkbox, Dialog, Progress, Select, TextField } from "@radix-ui/themes";
import { Check, ChevronRight, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { useSimulation } from "./simulation-context";
import { FieldFeedback } from "./FieldFeedback";
import { useLiveValidation } from "./use-live-validation";
import {
  accountTypes, genders, registrationAge, selfManagedAge,
  signupStages, signupStepErrors, verificationError,
  type RegistrationField, type SignupStage,
} from "../_lib/registration";

const headings: Record<SignupStage, [string, string]> = {
  type: ["Tạo Tài khoản Google", "Chọn loại tài khoản để thực hành."],
  name: ["Tên của em", "Nhập họ và tên giả định."],
  personal: ["Thông tin cơ bản", "Nhập ngày sinh và giới tính giả định."],
  address: ["Chọn địa chỉ Gmail", "Địa chỉ này sẽ được dùng để đăng nhập và gửi thư."],
  password: ["Tạo mật khẩu", "Dùng mật khẩu luyện tập khác với mật khẩu thật của em."],
  recovery: ["Thông tin khôi phục", "Có thể thêm thông tin giả định hoặc bỏ qua bước này."],
  verify: ["Xác minh số điện thoại", "Nhập mã luyện tập bên dưới. Không có SMS được gửi."],
  review: ["Kiểm tra và hoàn tất", "Đọc lại thông tin trước khi tạo tài khoản mô phỏng."],
};

function SimulationTerms() {
  return (
    <Dialog.Root>
      <Dialog.Trigger><Button variant="ghost" size="1" type="button">Quyền riêng tư và điều kiện mô phỏng</Button></Dialog.Trigger>
      <Dialog.Content maxWidth="460px">
        <Dialog.Title>Điều kiện của bài mô phỏng</Dialog.Title>
        <Dialog.Description size="2">Nội dung dành cho hoạt động thực hành trên lớp.</Dialog.Description>
        <ul className="signup-terms">
          <li>Sử dụng họ tên, ngày sinh, điện thoại và email giả định; không dùng mật khẩu thật.</li>
          <li>Tài khoản và thông tin đăng ký chỉ tồn tại trong phiên mở trang. Tải lại trang sẽ đặt lại tài khoản.</li>
          <li>Chỉ tiến độ thao tác được lưu trên trình duyệt. Không tạo tài khoản Google thật, không gửi SMS hoặc email ra ngoài.</li>
          <li>Tình huống tài khoản trẻ em có người giám hộ hỗ trợ là một bước học tập; tài khoản thật cần được phụ huynh thiết lập phù hợp.</li>
        </ul>
        <Dialog.Close><Button type="button">Đã đọc</Button></Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function SignupFlow() {
  const {
    registration: value, updateRegistration, signupStage: stage, goToSignupStage,
    previousSignupStage, signup, finishSignup, verificationChallenge, sendVerificationCode,
    skipRecovery, accepted, setAccepted, termsAccepted, setTermsAccepted,
    guardianAccepted, setGuardianAccepted, showPassword, setShowPassword, error, setError,
  } = useSimulation();
  const errors = stage === "verify"
    ? { verificationCode: verificationError(value.verificationCode, verificationChallenge) }
    : signupStepErrors(value, stage);
  const validation = useLiveValidation(errors, "signup");
  const page = stage === "verify" ? 6 : signupStages.indexOf(stage) + 1;
  const age = registrationAge(value);
  const [title, description] = headings[stage];
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);
  function change(field: RegistrationField, text: string) {
    updateRegistration(field, text);
    validation.touch(field);
  }
  function feedback(field: RegistrationField) {
    return <FieldFeedback id={validation.feedbackId(field)} error={validation.error(field, value[field])} />;
  }
  function input(field: RegistrationField, label: string, options: {
    placeholder?: string; type?: "text" | "password"; inputMode?: "numeric" | "email" | "tel";
    maxLength?: number; autoComplete?: string;
  } = {}) {
    return (
      <label className="signup-field">
        <span>{label}</span>
        <TextField.Root
          size="3" {...validation.fieldProps(field, value[field])} {...options}
          aria-label={label} value={value[field]} onChange={(event) => change(field, event.target.value)}
          autoCapitalize="none" spellCheck={false}
        >
          {field === "username" && <TextField.Slot side="right">@gmail.com</TextField.Slot>}
        </TextField.Root>
        {feedback(field)}
      </label>
    );
  }
  function select(field: "birthMonth" | "gender", label: string, items: [string, string][]) {
    return (
      <label className="signup-field">
        <span id={`signup-${field}-label`}>{label}</span>
        <Select.Root size="3" value={value[field]} onValueChange={(text) => change(field, text)}>
          <Select.Trigger
            className="signup-select" placeholder={label}
            {...validation.fieldProps(field, value[field])} aria-label={label}
          />
          <Select.Content position="popper">{items.map(([id, text]) => <Select.Item key={id} value={id}>{text}</Select.Item>)}</Select.Content>
        </Select.Root>
        {feedback(field)}
      </label>
    );
  }
  return (
    <div className="signup-flow">
      <div className="signup-progress"><span>Bước {page}/7</span><Progress size="1" value={page / 7 * 100} aria-label="Tiến trình đăng ký" /></div>
      <h3 ref={headingRef} tabIndex={-1}>{title}</h3>
      <p className="signup-description">{description}</p>
      <form noValidate onSubmit={(event) => {
        if (stage === "review") finishSignup(event);
        else if (validation.validate(event)) signup(event);
        else setError("");
      }}>
        {stage === "type" && (
          <div className="signup-types">
            {Object.entries(accountTypes).map(([id, label]) => (
              <Button key={id} variant="surface" type="button" onClick={() => { change("accountType", id); goToSignupStage("name"); }}>
                {id === "child" ? <UsersRound size={22} /> : <UserRound size={22} />}
                <span>{label}<small>{id === "child" ? "Thực hành với tình huống có người giám hộ hỗ trợ" : "Thực hành tạo tài khoản cá nhân"}</small></span>
                <ChevronRight size={17} />
              </Button>
            ))}
          </div>
        )}
        {stage === "name" && <div className="signup-names">{input("last", "Họ", { placeholder: "Nguyễn" })}{input("first", "Tên", { placeholder: "An" })}</div>}
        {stage === "personal" && <>
          <div className="signup-birthday">
            {input("birthDay", "Ngày sinh", { placeholder: "Ngày", inputMode: "numeric", maxLength: 2 })}
            {select("birthMonth", "Tháng sinh", Array.from({ length: 12 }, (_, i) => [String(i + 1), `Tháng ${i + 1}`]))}
            {input("birthYear", "Năm sinh", { placeholder: "Năm", inputMode: "numeric", maxLength: 4 })}
          </div>
          {select("gender", "Giới tính", Object.entries(genders))}
          {value.gender === "custom" && input("customGender", "Giới tính tùy chỉnh", { maxLength: 60 })}
          {age !== null && age < selfManagedAge && value.accountType === "personal" && (
            <div className="signup-age-note" role="alert">
              <p>Với ngày sinh này, em chưa đủ {selfManagedAge} tuổi để tự quản lý Tài khoản Google tại Việt Nam. Hãy thực hành tình huống có người giám hộ hỗ trợ.</p>
              <Button type="button" variant="soft" size="2" data-validation-field="ageConsent" onClick={() => change("accountType", "child")}>Chuyển sang tài khoản trẻ em</Button>
            </div>
          )}
          {value.accountType === "child" && <p className="signup-note"><ShieldCheck size={16} />Đang thực hành tài khoản trẻ em. Phần cuối sẽ có xác nhận tình huống người giám hộ hỗ trợ.</p>}
        </>}
        {stage === "address" && <>
          {input("username", "Tên đăng nhập", { placeholder: "nguyenan6a", autoComplete: "off", maxLength: 30 })}
          <p className="signup-note">Dùng 6–30 kí tự: chữ thường không dấu, số và dấu chấm. Chỉ kiểm tra định dạng trong mô phỏng.</p>
        </>}
        {stage === "password" && <>
          {input("password", "Mật khẩu luyện tập", { type: showPassword ? "text" : "password", autoComplete: "new-password" })}
          {input("confirm", "Xác nhận mật khẩu", { type: showPassword ? "text" : "password", autoComplete: "new-password" })}
          <label className="checkbox-label"><Checkbox checked={showPassword} onCheckedChange={(checked) => setShowPassword(checked === true)} />Hiện mật khẩu</label>
          <p className="signup-note">Mật khẩu luyện tập cần 8–128 kí tự, có chữ và số, không có khoảng trắng.</p>
        </>}
        {stage === "recovery" && <>
          {input("phone", "Số điện thoại (không bắt buộc)", { placeholder: "Ví dụ giả định: 0900000000", inputMode: "tel", autoComplete: "off" })}
          {input("recoveryEmail", "Email khôi phục (không bắt buộc)", { placeholder: "Ví dụ: phuhuynh@example.com", inputMode: "email", autoComplete: "off" })}
          <p className="signup-note">Chỉ nhập thông tin giả định. Nếu thêm điện thoại, bước tiếp theo sẽ có mã xác minh luyện tập.</p>
        </>}
        {stage === "verify" && <>
          <div className="signup-code-sample"><span>Mã luyện tập cho {value.phone}</span><strong>{verificationChallenge}</strong><small>Mã chỉ xuất hiện trên màn hình này, không gửi SMS.</small></div>
          {input("verificationCode", "Mã xác minh", { inputMode: "numeric", placeholder: "Nhập 6 chữ số", maxLength: 6, autoComplete: "off" })}
          <Button variant="ghost" type="button" size="1" onClick={sendVerificationCode}>Tạo mã luyện tập mới</Button>
        </>}
        {stage === "review" && <>
          <dl className="signup-summary">
            <div><dt>Loại tài khoản</dt><dd>{accountTypes[value.accountType as keyof typeof accountTypes]}</dd></div>
            <div><dt>Họ tên</dt><dd>{value.last} {value.first}</dd></div>
            <div><dt>Ngày sinh</dt><dd>{value.birthDay}/{value.birthMonth}/{value.birthYear}</dd></div>
            <div><dt>Giới tính</dt><dd>{value.gender === "custom" ? value.customGender : genders[value.gender as keyof typeof genders]}</dd></div>
            <div><dt>Địa chỉ Gmail</dt><dd>{value.username}@gmail.com</dd></div>
            <div><dt>Điện thoại</dt><dd>{value.phone ? <>{value.phone} <Check size={13} aria-label="Đã xác minh giả lập" /></> : "Chưa thêm"}</dd></div>
            <div><dt>Email khôi phục</dt><dd>{value.recoveryEmail || "Chưa thêm"}</dd></div>
          </dl>
          <label className="checkbox-label"><Checkbox checked={accepted} onCheckedChange={(checked) => { setAccepted(checked === true); setError(""); }} />Em đang dùng thông tin và mật khẩu giả định để thực hành.</label>
          {value.accountType === "child" && <label className="checkbox-label"><Checkbox checked={guardianAccepted} onCheckedChange={(checked) => { setGuardianAccepted(checked === true); setError(""); }} />Trong tình huống mô phỏng, tài khoản này có người giám hộ hỗ trợ.</label>}
          <SimulationTerms />
          <label className="checkbox-label"><Checkbox checked={termsAccepted} onCheckedChange={(checked) => { setTermsAccepted(checked === true); setError(""); }} />Em đồng ý với điều kiện của bài mô phỏng.</label>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="signup-buttons">
          <Button variant="ghost" type="button" onClick={previousSignupStage}>{stage === "type" ? "Về đăng nhập" : "Quay lại"}</Button>
          {stage === "recovery" && <Button variant="ghost" type="button" onClick={skipRecovery}>Bỏ qua</Button>}
          {stage !== "type" && <Button type="submit">{stage === "review" ? "Tạo tài khoản mô phỏng" : stage === "verify" ? "Xác minh" : "Tiếp theo"}</Button>}
        </div>
      </form>
    </div>
  );
}
