"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { emptyChecks, lessons } from "../_lib/lesson-data";
import { emailError } from "../_lib/validation";
import {
  accountTypes, emptyRegistration, signupErrors, signupStepErrors, signupStages,
  normalizedPhone, phoneError, verificationError,
  type SignupStage, type Registration, type RegistrationField,
} from "../_lib/registration";
import { useMailWorkspace } from "./use-mail-workspace";

const progressKey = "tinhoc6-bai8-progress";
const initialProgress = JSON.stringify(emptyChecks());
let memoryProgress = initialProgress;
let memoryOnly = false;
function readProgress() {
  if (memoryOnly) return memoryProgress;
  try {
    return localStorage.getItem(progressKey) || initialProgress;
  } catch {
    return memoryProgress;
  }
}
function parseProgress(raw: string): boolean[][] {
  try {
    const saved = JSON.parse(raw);
    if (
      Array.isArray(saved) &&
      saved.length === lessons.length &&
      saved.every((row, i) =>
        Array.isArray(row) && row.length === lessons[i].steps.length &&
        row.every((value) => typeof value === "boolean"),
      )
    ) return saved;
  } catch {}
  return emptyChecks();
}
function subscribeProgress(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("lesson-progress", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("lesson-progress", onChange);
  };
}

function useSimulationState() {
  const [lesson, setLesson] = useState(2);
  const savedProgress = useSyncExternalStore(subscribeProgress, readProgress, () => initialProgress);
  const checks = useMemo(() => parseProgress(savedProgress), [savedProgress]);
  const [modal, setModal] = useState<"help" | "results" | "reset" | null>(null);
  const [screen, setScreen] = useState<
    "mail" | "login" | "signup" | "review" | "welcome"
  >("mail");
  const [account, setAccount] = useState({
    name: "Hà Hoàng Hải",
    email: "hahai6a@gmail.com",
    password: "TinHoc6!",
  });
  const [registration, setRegistration] = useState(emptyRegistration);
  const [signupStage, setSignupStage] = useState<SignupStage>("type");
  const [verificationChallenge, setVerificationChallenge] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [guardianAccepted, setGuardianAccepted] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  function mark(l: number, step: number, value = true) {
    const next = parseProgress(readProgress()).map((row, index) =>
      index === l && !row.every(Boolean)
        ? row.map((v, s) => (s === step ? value : v))
        : row,
    );
    memoryProgress = JSON.stringify(next);
    try {
      localStorage.setItem(progressKey, memoryProgress);
    } catch { memoryOnly = true; }
    window.dispatchEvent(new Event("lesson-progress"));
  }
  const workspace = useMailWorkspace(account, mark, setToast);
  const {
    setError,
    setProfile,
    setOpened,
    setSearch,
    setFolder,
    setCompose,
  } = workspace;
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 8000);
    return () => clearTimeout(timer);
  }, [toast]);
  const completed = checks.filter((row) => row.every(Boolean)).length;
  const done = checks[lesson].filter(Boolean).length;
  const currentStep = checks[lesson].findIndex((value) => !value);
  const progress = Math.round(
    (checks.flat().filter(Boolean).length / 12) * 100,
  );
  function chooseLesson(index: number) {
    setLesson(index);
    setError("");
    setProfile(false);
    setOpened(null);
    setSearch("");
    setFolder("inbox");
    setCompose(false);
    if (index === 0) beginSignup();
    else setScreen(index === 2 ? "mail" : "login");
    setLoginEmail("");
    setLoginPassword("");
    setShowTasks(false);
  }
  function beginSignup() {
    setRegistration(emptyRegistration());
    setVerificationChallenge("");
    setVerifiedPhone("");
    setShowPassword(false);
    setScreen("signup");
    setSignupStage("type");
    setAccepted(false);
    setTermsAccepted(false);
    setGuardianAccepted(false);
    setError("");
  }
  function updateRegistration(field: RegistrationField, value: string) {
    setRegistration((previous) => ({ ...previous, [field]: value }));
    if (field === "accountType" && Object.hasOwn(accountTypes, value)) mark(0, 0);
    setAccepted(false);
    setTermsAccepted(false);
    setGuardianAccepted(false);
    setError("");
    if (field === "phone") {
      setVerifiedPhone("");
      setVerificationChallenge("");
      setRegistration((previous) => ({ ...previous, verificationCode: "" }));
    }
  }
  function goToSignupStage(stage: SignupStage) {
    setSignupStage(stage);
    setScreen(stage === "review" ? "review" : "signup");
    setError("");
  }
  function previousSignupStage() {
    if (signupStage === "type") {
      chooseLesson(1);
    } else if (signupStage === "verify" || signupStage === "review") {
      goToSignupStage("recovery");
    } else {
      goToSignupStage(signupStages[signupStages.indexOf(signupStage) - 1]);
    }
  }
  function sendVerificationCode() {
    if (!registration.phone || phoneError(registration.phone)) return;
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    let code = String(100000 + random % 900000);
    if (code === verificationChallenge) code = String(100000 + (Number(code) - 100000 + 1) % 900000);
    setVerificationChallenge(code);
    setRegistration((previous) => ({ ...previous, verificationCode: "" }));
    goToSignupStage("verify");
  }
  function completeRegistrationInfo(value: Registration = registration) {
    const invalid = Object.values(signupErrors(value)).find(Boolean);
    if (invalid) return setError(invalid);
    mark(0, 1);
    goToSignupStage("review");
  }
  function skipRecovery() {
    const next = { ...registration, phone: "", recoveryEmail: "", verificationCode: "" };
    setRegistration(next);
    setVerifiedPhone("");
    setVerificationChallenge("");
    setAccepted(false);
    setTermsAccepted(false);
    setGuardianAccepted(false);
    completeRegistrationInfo(next);
  }
  function signup(event: React.FormEvent) {
    event.preventDefault();
    const invalid = Object.values(signupStepErrors(registration, signupStage)).find(Boolean);
    if (invalid) return setError(invalid);
    setError("");
    if (signupStage === "verify") {
      const invalidCode = verificationError(registration.verificationCode, verificationChallenge);
      if (invalidCode) return setError(invalidCode);
      setVerifiedPhone(normalizedPhone(registration.phone));
      completeRegistrationInfo();
    } else if (signupStage === "recovery") {
      if (registration.phone && verifiedPhone !== normalizedPhone(registration.phone)) sendVerificationCode();
      else completeRegistrationInfo();
    } else if (signupStage !== "review") {
      goToSignupStage(signupStages[signupStages.indexOf(signupStage) + 1]);
    }
  }
  function finishSignup(event: React.FormEvent) {
    event.preventDefault();
    const invalid = Object.values(signupErrors(registration)).find(Boolean);
    if (invalid) return setError(invalid);
    if (registration.phone && verifiedPhone !== normalizedPhone(registration.phone)) {
      goToSignupStage("recovery");
      return setError("Em cần xác minh lại số điện thoại đã thay đổi.");
    }
    if (!accepted)
      return setError("Em hãy xác nhận sử dụng thông tin giả định.");
    if (registration.accountType === "child" && !guardianAccepted)
      return setError("Em hãy xác nhận tình huống có người giám hộ hỗ trợ.");
    if (!termsAccepted)
      return setError("Em hãy đọc và đồng ý với điều kiện của bài mô phỏng.");
    setAccount({
      name: `${registration.last.trim()} ${registration.first.trim()}`,
      email: `${registration.username}@gmail.com`,
      password: registration.password,
    });
    mark(0, 2);
    setScreen("welcome");
    setError("");
  }
  function login(event: React.FormEvent) {
    event.preventDefault();
    const format = emailError(loginEmail);
    if (format) return setError(format);
    if (loginEmail.toLowerCase() !== account.email.toLowerCase())
      return setError(
        "Địa chỉ chưa đúng. Hãy dùng tài khoản mẫu hoặc tài khoản em vừa tạo.",
      );
    mark(1, 0);
    if (loginPassword !== account.password)
      return setError("Mật khẩu chưa đúng. Hãy kiểm tra mật khẩu luyện tập.");
    mark(1, 1);
    setScreen("mail");
    setError("");
    setLoginPassword("");
    setToast("Đăng nhập thành công. Hãy mở một bức thư nhé!");
  }
  function reset() {
    memoryProgress = initialProgress;
    try {
      localStorage.removeItem(progressKey);
    } catch { memoryOnly = true; }
    window.dispatchEvent(new Event("lesson-progress"));
    workspace.resetMailbox();
    setAccount({
      name: "Hà Hoàng Hải",
      email: "hahai6a@gmail.com",
      password: "TinHoc6!",
    });
    setModal(null);
    chooseLesson(0);
    setToast("Đã sẵn sàng cho lượt thực hành mới.");
  }
  function downloadResult() {
    const text =
      `KẾT QUẢ THỰC HÀNH TIN HỌC 6\nBài 8 – Thư điện tử, phần 3\n\nHoàn thành: ${completed}/3 bài thực hành (${progress}% thao tác)\n\n` +
      lessons
        .map(
          (l, i) =>
            `${i + 1}. ${l.title}\n${l.steps.map((s, j) => `${checks[i][j] ? "[x]" : "[ ]"} ${s}`).join("\n")}`,
        )
        .join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ket-qua-thuc-hanh-bai-8.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return {
    ...workspace,
    lesson,
    setLesson,
    checks,
    modal,
    setModal,
    screen,
    setScreen,
    account,
    registration,
    updateRegistration,
    signupStage,
    goToSignupStage,
    previousSignupStage,
    verificationChallenge,
    sendVerificationCode,
    skipRecovery,
    accepted,
    setAccepted,
    termsAccepted,
    setTermsAccepted,
    guardianAccepted,
    setGuardianAccepted,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showPassword,
    setShowPassword,
    toast,
    setToast,
    showTasks,
    setShowTasks,
    mark,
    completed,
    done,
    currentStep,
    progress,
    chooseLesson,
    signup,
    finishSignup,
    login,
    reset,
    downloadResult,
  };
}
const Context = createContext<ReturnType<typeof useSimulationState> | null>(
  null,
);
export function SimulationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const simulation = useSimulationState();
  return <Context.Provider value={simulation}>{children}</Context.Provider>;
}
export function useSimulation() {
  const context = useContext(Context);
  if (!context) throw new Error("SimulationProvider is required");
  return context;
}
