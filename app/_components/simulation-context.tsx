"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { emptyChecks, lessons } from "../_lib/lesson-data";
import { registrationErrors, emailError } from "../_lib/validation";
import { useMailWorkspace } from "./use-mail-workspace";

function useSimulationState() {
  const [lesson, setLesson] = useState(2);
  const [checks, setChecks] = useState<boolean[][]>(emptyChecks);
  const [mode, setMode] = useState<"guided" | "free">("guided");
  const [modal, setModal] = useState<"help" | "results" | "reset" | null>(null);
  const [screen, setScreen] = useState<
    "mail" | "login" | "signup" | "review" | "welcome"
  >("mail");
  const [account, setAccount] = useState({
    name: "Hà Hoàng Hải",
    email: "hahai6a@gmail.com",
    password: "TinHoc6!",
  });
  const [registration, setRegistration] = useState({
    last: "",
    first: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");
  const [hint, setHint] = useState(false);
  const [wide, setWide] = useState(true);
  function mark(l: number, step: number, value = true) {
    setChecks((previous) => {
      const next = previous.map((row, index) =>
        index === l && !row.every(Boolean)
          ? row.map((v, s) => (s === step ? value : v))
          : row,
      );
      try {
        localStorage.setItem("tinhoc6-bai8-progress", JSON.stringify(next));
      } catch {}
      return next;
    });
  }
  const workspace = useMailWorkspace(account, mark, setToast);
  const {
    setError,
    setProfile,
    setOpened,
    setSearch,
    setFolder,
    setCompose,
    error,
  } = workspace;
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("tinhoc6-bai8-progress") || "null",
      );
      if (
        Array.isArray(saved) &&
        saved.length === 3 &&
        saved.every(
          (row, i) =>
            Array.isArray(row) &&
            row.length === lessons[i].steps.length &&
            row.every((value) => typeof value === "boolean"),
        )
      )
        setChecks(saved);
    } catch {}
  }, []);
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
    setHint(false);
    setOpened(null);
    setSearch("");
    setFolder("inbox");
    setCompose(false);
    setScreen(index === 2 ? "mail" : "login");
    setLoginEmail("");
    setLoginPassword("");
    setWide(index === 2);
  }
  function beginSignup() {
    setScreen("signup");
    setError("");
    mark(0, 0);
  }
  function signup(event: React.FormEvent) {
    event.preventDefault();
    const invalid = Object.values(registrationErrors(registration)).find(
      Boolean,
    );
    if (invalid) return setError(invalid);
    mark(0, 1);
    setError("");
    setScreen("review");
  }
  function finishSignup(event: React.FormEvent) {
    event.preventDefault();
    if (!accepted)
      return setError("Em hãy xác nhận sử dụng thông tin giả định.");
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
    setChecks(emptyChecks());
    try {
      localStorage.removeItem("tinhoc6-bai8-progress");
    } catch {}
    workspace.resetMailbox();
    setRegistration({
      last: "",
      first: "",
      username: "",
      password: "",
      confirm: "",
    });
    setAccepted(false);
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
    mode,
    setMode,
    modal,
    setModal,
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
    toast,
    setToast,
    hint,
    setHint,
    wide,
    setWide,
    mark,
    completed,
    done,
    currentStep,
    progress,
    chooseLesson,
    beginSignup,
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
