/** Shared, synchronous rules for the teaching simulator and submit handlers. */
export function emailError(value: string): string {
  if (!value) return "Em hãy nhập địa chỉ thư điện tử.";
  if (/\s/.test(value)) return "Địa chỉ email không được chứa khoảng trắng.";
  if (value.length > 254) return "Địa chỉ email không được dài quá 254 kí tự.";
  if ((value.match(/@/g) || []).length !== 1)
    return "Địa chỉ email cần đúng một kí tự @. Ví dụ: thuyk39@example.com.";
  const [local, domain] = value.split("@");
  if (!local || !domain)
    return "Em cần nhập đủ tên người dùng và tên miền ở hai bên kí tự @.";
  if (local.length > 64) return "Phần trước @ không được dài quá 64 kí tự.";
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local))
    return "Phần trước @ chỉ dùng chữ không dấu, số và các kí tự email được phép.";
  if (local.startsWith(".") || local.endsWith(".") || local.includes(".."))
    return "Phần trước @ không được bắt đầu, kết thúc bằng dấu chấm hoặc có hai dấu chấm liên tiếp.";
  const labels = domain.split(".");
  if (labels.length < 2 || !/^[a-zA-Z]{2,63}$/.test(labels.at(-1) || ""))
    return "Tên miền chưa đúng định dạng. Ví dụ: gmail.com hoặc example.com.";
  if (
    labels.some(
      (label) => !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label),
    )
  )
    return "Tên miền không được có dấu chấm liên tiếp, kí tự lạ hoặc dấu gạch nối ở đầu/cuối.";
  return "";
}

export function nameError(value: string): string {
  if (!value.trim()) return "Em hãy điền thông tin này.";
  if (value.length > 80) return "Thông tin này không được dài quá 80 kí tự.";
  if (!/^[\p{L}\p{M} '\u2019-]+$/u.test(value) || !/\p{L}/u.test(value))
    return "Họ và tên chỉ dùng chữ, khoảng trắng, dấu gạch nối hoặc dấu nháy; không dùng số.";
  return "";
}

export function usernameError(value: string): string {
  if (!value) return "Em hãy chọn tên đăng nhập.";
  if (!/^[a-z0-9.]+$/.test(value))
    return "Chỉ dùng chữ thường không dấu (a–z), số và dấu chấm. Không nhập @gmail.com vào ô này.";
  if (value.startsWith(".") || value.endsWith(".") || value.includes(".."))
    return "Tên đăng nhập không được bắt đầu, kết thúc bằng dấu chấm hoặc có hai dấu chấm liên tiếp.";
  if (value.length < 6 || value.length > 30)
    return "Tên đăng nhập cần từ 6 đến 30 kí tự.";
  return "";
}

export function passwordError(value: string): string {
  if (!value) return "Em hãy nhập mật khẩu luyện tập.";
  if (/\s/.test(value))
    return "Mật khẩu luyện tập không được chứa khoảng trắng.";
  if (value.length < 8 || value.length > 128)
    return "Mật khẩu luyện tập cần từ 8 đến 128 kí tự.";
  if (!/\p{L}/u.test(value) || !/\d/.test(value))
    return "Mật khẩu luyện tập cần có cả chữ và số.";
  return "";
}

export function confirmationError(
  password: string,
  confirmation: string,
): string {
  if (!confirmation) return "Em hãy nhập lại mật khẩu để xác nhận.";
  return password === confirmation
    ? ""
    : "Mật khẩu xác nhận chưa khớp. Em hãy nhập lại giống mật khẩu ở trên.";
}

export function subjectError(value: string): string {
  return value.trim() ? "" : "Em hãy viết tiêu đề thư.";
}

export function messageError(value: string): string {
  return value.trim().length >= 10
    ? ""
    : "Nội dung thư cần ít nhất 10 kí tự. Hãy thêm lời chào và điều em muốn chia sẻ.";
}

export function registrationErrors(value: {
  last: string;
  first: string;
  username: string;
  password: string;
  confirm: string;
}) {
  return {
    last: nameError(value.last),
    first: nameError(value.first),
    username: usernameError(value.username),
    password: passwordError(value.password),
    confirm: confirmationError(value.password, value.confirm),
  };
}

export function recipientListError(value: string, required = true): string {
  const addresses = value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!addresses.length)
    return required ? "Em hãy nhập ít nhất một địa chỉ người nhận." : "";
  for (const address of addresses) {
    const error = emailError(address);
    if (error) return `${address}: ${error}`;
  }
  return "";
}
export function composeErrors(value: {
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}) {
  return {
    recipient: recipientListError(value.recipient),
    cc: recipientListError(value.cc || "", false),
    bcc: recipientListError(value.bcc || "", false),
    subject: subjectError(value.subject),
    body: messageError(value.body),
  };
}
