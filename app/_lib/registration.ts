import {
  nameError, usernameError, passwordError, confirmationError, emailError,
} from "./validation.ts";

export const signupStages = ["type", "name", "personal", "address", "password", "recovery", "review"] as const;
export type SignupStage = typeof signupStages[number] | "verify";
export const accountTypes = { personal: "Cho bản thân tôi", child: "Dành cho trẻ em" };
export const genders = { female: "Nữ", male: "Nam", undisclosed: "Không muốn trả lời", custom: "Tùy chỉnh" };
export const selfManagedAge = 15; // Google Account Help: Vietnam, answer/1350409.
export function emptyRegistration() {
  return {
    accountType: "", last: "", first: "", birthDay: "", birthMonth: "", birthYear: "",
    gender: "", customGender: "", username: "", password: "", confirm: "",
    phone: "", recoveryEmail: "", verificationCode: "",
  };
}
export type Registration = ReturnType<typeof emptyRegistration>;
export type RegistrationField = keyof Registration;

export function birthdayErrors(value: Pick<Registration, "birthDay" | "birthMonth" | "birthYear">, today = new Date()) {
  const day = Number(value.birthDay), month = Number(value.birthMonth), year = Number(value.birthYear);
  const errors = {
    birthDay: /^\d{1,2}$/.test(value.birthDay) && day >= 1 && day <= 31 ? "" : "Nhập ngày từ 1 đến 31.",
    birthMonth: /^\d{1,2}$/.test(value.birthMonth) && month >= 1 && month <= 12 ? "" : "Em hãy chọn tháng sinh.",
    birthYear: /^\d{4}$/.test(value.birthYear) && year >= 1900 && year <= today.getFullYear() ? "" : `Nhập năm từ 1900 đến ${today.getFullYear()}.`,
  };
  if (!Object.values(errors).some(Boolean)) {
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      errors.birthDay = "Ngày này không tồn tại trong tháng và năm đã chọn.";
    else if (date > new Date(today.getFullYear(), today.getMonth(), today.getDate()))
      errors.birthDay = "Ngày sinh không được nằm trong tương lai.";
  }
  return errors;
}

export function registrationAge(value: Registration, today = new Date()): number | null {
  if (Object.values(birthdayErrors(value, today)).some(Boolean)) return null;
  const birthdayPassed = today.getMonth() + 1 > Number(value.birthMonth) ||
    (today.getMonth() + 1 === Number(value.birthMonth) && today.getDate() >= Number(value.birthDay));
  return today.getFullYear() - Number(value.birthYear) - (birthdayPassed ? 0 : 1);
}

export function normalizedPhone(value: string) { return value.replace(/[\s()-]/g, ""); }
export function phoneError(value: string) {
  if (!value) return "";
  const phone = normalizedPhone(value);
  return /^0\d{9,10}$/.test(phone) || /^\+[1-9]\d{7,14}$/.test(phone)
    ? "" : "Nhập số Việt Nam gồm 10–11 chữ số bắt đầu bằng 0, hoặc số quốc tế bắt đầu bằng + (8–15 chữ số).";
}
function canonicalEmail(value: string) {
  const [local, domain] = value.toLowerCase().split("@");
  return domain === "gmail.com" || domain === "googlemail.com"
    ? `${local.split("+")[0].replaceAll(".", "")}@gmail.com` : value.toLowerCase();
}
export function recoveryEmailError(value: string, username: string) {
  if (!value) return "";
  return emailError(value) || (canonicalEmail(value) === canonicalEmail(`${username}@gmail.com`)
    ? "Email khôi phục phải khác địa chỉ Gmail em đang tạo." : "");
}
export function verificationError(value: string, expected: string) {
  if (!/^\d{6}$/.test(value)) return "Mã xác minh cần đúng 6 chữ số.";
  return expected && value === expected ? "" : "Mã chưa đúng. Hãy nhập mã luyện tập đang hiển thị.";
}
export function signupErrors(value: Registration, today = new Date()) {
  const age = registrationAge(value, today);
  return {
    accountType: Object.hasOwn(accountTypes, value.accountType) ? "" : "Em hãy chọn loại tài khoản.",
    last: nameError(value.last), first: nameError(value.first),
    ...birthdayErrors(value, today),
    gender: Object.hasOwn(genders, value.gender) ? "" : "Em hãy chọn giới tính hoặc Không muốn trả lời.",
    customGender: value.gender === "custom" && (!value.customGender.trim() || value.customGender.trim().length > 60)
      ? "Nhập giới tính tùy chỉnh, tối đa 60 kí tự." : "",
    ageConsent: age !== null && age < selfManagedAge && value.accountType !== "child"
      ? "Với ngày sinh này, hãy chuyển sang tài khoản dành cho trẻ em có người giám hộ hỗ trợ." : "",
    username: usernameError(value.username), password: passwordError(value.password),
    confirm: confirmationError(value.password, value.confirm),
    phone: phoneError(value.phone), recoveryEmail: recoveryEmailError(value.recoveryEmail, value.username),
  };
}
export function signupStepErrors(value: Registration, stage: SignupStage) {
  const errors = signupErrors(value);
  const fields: Record<SignupStage, (keyof typeof errors)[]> = {
    type: ["accountType"], name: ["last", "first"],
    personal: ["birthDay", "birthMonth", "birthYear", "gender", "customGender", "ageConsent"],
    address: ["username"], password: ["password", "confirm"],
    recovery: ["phone", "recoveryEmail"], verify: [], review: Object.keys(errors) as (keyof typeof errors)[],
  };
  return Object.fromEntries(fields[stage].map((field) => [field, errors[field]])) as Record<string, string>;
}
