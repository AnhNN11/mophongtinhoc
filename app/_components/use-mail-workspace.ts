"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  initialMail,
  type Attachment,
  type Draft,
  type Mail,
} from "../_lib/lesson-data";
import { composeErrors } from "../_lib/validation";
import {
  emptyDraft,
  hasDraftContent,
  isInFolder,
  matchesSearch,
  parseRecipients,
  plainToHtml,
  advanceMailTime,
} from "../_lib/mail-model";

export type MailAction =
  | "archive"
  | "trash"
  | "spam"
  | "restore"
  | "read"
  | "unread"
  | "important"
  | "unimportant"
  | "inbox"
  | "purchase";
export function useMailWorkspace(
  account: { name: string; email: string },
  mark: (lesson: number, step: number, value?: boolean) => void,
  setToast: (message: string) => void,
) {
  const [mails, setMails] = useState<Mail[]>(() =>
    initialMail.map((mail) => ({ ...mail })),
  );
  const [folder, setFolder] = useState("inbox");
  const [category, updateCategory] = useState("primary");
  const [openedId, setOpenedId] = useState<number | null>(null);
  const [search, updateSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [profile, setProfile] = useState(false);
  const [compose, setCompose] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [composeExpanded, setComposeExpanded] = useState(false);
  const [{ draft, drafts }, setDraftWorkspace] = useState<{
    draft: Draft | null;
    drafts: Draft[];
  }>({ draft: null, drafts: [] });
  function setDraft(value: SetStateAction<Draft | null>) {
    setDraftWorkspace((previous) => {
      const next = typeof value === "function" ? value(previous.draft) : value;
      const otherDrafts = next
        ? previous.drafts.filter((item) => item.id !== next.id)
        : previous.drafts;
      return {
        draft: next,
        drafts: next && hasDraftContent(next) ? [next, ...otherDrafts] : otherDrafts,
      };
    });
  }
  function setDrafts(value: SetStateAction<Draft[]>) {
    setDraftWorkspace((previous) => ({
      ...previous,
      drafts: typeof value === "function" ? value(previous.drafts) : value,
    }));
  }
  const [error, setError] = useState("");
  const [labels, setLabels] = useState([
    { id: "school", name: "Học tập" },
    { id: "class", name: "Lớp 6A" },
  ]);
  const [undoSnapshot, setUndoSnapshot] = useState<{
    mails: Mail[];
    draft?: Draft;
    label: string;
  } | null>(null);
  const [density, setDensity] = useState<"normal" | "compact">("normal");
  const [pageSize, updatePageSize] = useState(10);
  const [showCategories, setShowCategories] = useState(true);
  const [page, setPage] = useState(0);
  const [mailFullscreen, setMailFullscreen] = useState(false);
  const objectUrls = useRef<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const recipient = draft?.recipient || "",
    cc = draft?.cc || "",
    bcc = draft?.bcc || "",
    subject = draft?.subject || "",
    body = draft?.body || "",
    bodyHtml = draft?.html || "",
    attachments = draft?.attachments || [];
  const opened = mails.find((mail) => mail.id === openedId) || null;
  const sent = mails.filter((mail) => mail.kind === "sent" && !mail.deleted);
  function updateDraft(patch: Partial<Draft>) {
    setDraft((previous) => ({
      ...(previous || emptyDraft()),
      ...patch,
      savedAt: Date.now(),
    }));
  }
  const setRecipient = (value: string) => updateDraft({ recipient: value });
  const setCc = (value: string) => updateDraft({ cc: value });
  const setBcc = (value: string) => updateDraft({ bcc: value });
  const setSubject = (value: string) => updateDraft({ subject: value });
  const setBody = (value: string) =>
    updateDraft({ body: value, html: plainToHtml(value) });
  const setBodyRich = (value: string, html: string) =>
    updateDraft({ body: value, html });
  function setAttachments(value: SetStateAction<Attachment[]>) {
    setDraft((previous) => {
      const current = previous || emptyDraft();
      return {
        ...current,
        attachments:
          typeof value === "function" ? value(current.attachments) : value,
        savedAt: Date.now(),
      };
    });
  }
  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );
  useEffect(() => {
    if (!undoSnapshot) return;
    const timer = setTimeout(() => setUndoSnapshot(null), 8000);
    return () => clearTimeout(timer);
  }, [undoSnapshot]);
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setMails((previous) => {
        let changed = false;
        const next = previous.map((mail) => {
          const next = advanceMailTime(mail, now);
          if (next !== mail) changed = true;
          return next;
        });
        return changed ? next : previous;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  function resetPagination() {
    setPage(0);
    setSelected([]);
  }
  function setSearch(value: string) {
    updateSearch(value);
    resetPagination();
  }
  function setCategory(value: string) {
    updateCategory(value);
    resetPagination();
  }
  function setPageSize(value: number) {
    updatePageSize(value);
    resetPagination();
  }
  const filtered = mails.filter((mail) => {
    const anywhere = /\bin:anywhere\b/i.test(search);
    if (search) {
      if (!anywhere && mail.deleted && !/\bin:trash\b/i.test(search))
        return false;
      if (!anywhere && mail.spam && !/\bin:spam\b/i.test(search)) return false;
    } else if (!isInFolder(mail, folder)) return false;
    if (
      !search &&
      folder === "inbox" &&
      showCategories &&
      (mail.category || "primary") !== category
    )
      return false;
    return matchesSearch(mail, search);
  });
  const lastPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const safePage = Math.min(page, lastPage);
  const visibleMails = filtered.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize,
  );
  function setOpened(mail: Mail | null) {
    setOpenedId(mail?.id ?? null);
  }
  function openMail(mail: Mail) {
    setOpenedId(mail.id);
    setMails((previous) =>
      previous.map((item) =>
        item.id === mail.id ? { ...item, read: true } : item,
      ),
    );
    if (mail.kind !== "sent" && mail.kind !== "scheduled") mark(1, 2);
  }
  function navigateFolder(value: string) {
    setFolder(value);
    setOpenedId(null);
    setSearch("");
    setSelected([]);
    setPage(0);
  }
  function startCompose() {
    setDraft(emptyDraft());
    setCompose(true);
    setMinimized(false);
    setError("");
    mark(2, 0);
  }
  function openDraft(id: string) {
    const saved = drafts.find((item) => item.id === id);
    if (saved) {
      setDraft(saved);
      setCompose(true);
      setMinimized(false);
      setError("");
      mark(2, 0);
    }
  }
  function closeCompose() {
    setCompose(false);
    setDraft(null);
    setError("");
    if (draft && hasDraftContent(draft))
      setToast("Đã lưu thư nháp trong phiên thực hành.");
  }
  function discardDraft() {
    if (draft)
      setDrafts((previous) => previous.filter((item) => item.id !== draft.id));
    setDraft(null);
    setCompose(false);
    setError("");
    setToast("Đã bỏ thư nháp.");
  }
  function removeDraft(id: string) {
    setDrafts((previous) => previous.filter((item) => item.id !== id));
    if (draft?.id === id) {
      setDraft(null);
      setCompose(false);
    }
    setToast("Đã xóa thư nháp trong mô phỏng.");
  }
  function permanentlyDelete(ids = targets()) {
    setMails((previous) => previous.filter((mail) => !ids.includes(mail.id)));
    setSelected([]);
    setOpenedId(null);
    setUndoSnapshot(null);
    setToast("Đã xóa các thư đã chọn khỏi mô phỏng.");
  }
  function addAttachments(files: File[]) {
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setError("Mỗi tệp đính kèm tối đa 10 MB.");
      return false;
    }
    if (
      attachments.reduce((sum, file) => sum + file.size, 0) +
        files.reduce((sum, file) => sum + file.size, 0) >
      25 * 1024 * 1024
    ) {
      setError("Tổng dung lượng tệp đính kèm tối đa 25 MB.");
      return false;
    }
    const added = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url,
      };
    });
    setAttachments((previous) => [...previous, ...added]);
    setError("");
    return true;
  }
  function sendMail(event?: FormEvent, scheduledAt?: string) {
    event?.preventDefault();
    const invalid = Object.values(
      composeErrors({ recipient, cc, bcc, subject, body }),
    ).find(Boolean);
    if (invalid) {
      setError(invalid);
      return false;
    }
    if (
      scheduledAt &&
      (!Number.isFinite(new Date(scheduledAt).getTime()) ||
        new Date(scheduledAt).getTime() <= Date.now())
    ) {
      setError("Em hãy chọn thời điểm gửi trong tương lai.");
      return false;
    }
    const outgoing: Mail = {
      id: Date.now(),
      sender: account.name,
      from: account.email,
      email: recipient,
      to: parseRecipients(recipient),
      cc: parseRecipients(cc),
      bcc: parseRecipients(bcc),
      subject: subject.trim(),
      body: body.trim(),
      html: bodyHtml,
      attachments: [...attachments],
      time: scheduledAt
        ? new Date(scheduledAt).toLocaleString("vi-VN")
        : "Vừa xong",
      read: true,
      star: false,
      kind: scheduledAt ? "scheduled" : "sent",
      inInbox: false,
      category: "primary",
      scheduledAt,
      expiresAt: draft?.expiresAt,
    };
    setUndoSnapshot({
      mails: [...mails],
      draft: draft || undefined,
      label: scheduledAt ? "Hủy lịch gửi" : "Hoàn tác gửi",
    });
    setMails((previous) => [outgoing, ...previous]);
    if (draft)
      setDrafts((previous) => previous.filter((item) => item.id !== draft.id));
    setDraft(null);
    setCompose(false);
    setError("");
    [1, 2, 3, 4].forEach((step) => mark(2, step));
    setToast(
      scheduledAt
        ? "Đã lên lịch gửi trong mô phỏng. Xem mục Đã lên lịch."
        : "Đã gửi thư trong mô phỏng. Em có thể hoàn tác hoặc xem mục Đã gửi.",
    );
    return true;
  }
  function targets() {
    return opened ? [opened.id] : selected;
  }
  function applyAction(action: MailAction, ids = targets()) {
    if (!ids.length) return;
    const labelsByAction = {
      archive: "Đã lưu trữ thư.",
      trash: "Đã chuyển vào Thùng rác.",
      spam: "Đã chuyển vào Thư rác.",
      restore: "Đã khôi phục thư vào Hộp thư đến.",
      read: "Đã đánh dấu đã đọc.",
      unread: "Đã đánh dấu chưa đọc.",
      important: "Đã đánh dấu quan trọng.",
      unimportant: "Đã bỏ dấu quan trọng.",
      inbox: "Đã chuyển vào Hộp thư đến.",
      purchase: "Đã chuyển thư vào Giao dịch.",
    };
    setUndoSnapshot({ mails: [...mails], label: "Hoàn tác" });
    setMails((previous) =>
      previous.map((mail) =>
        !ids.includes(mail.id)
          ? mail
          : {
              ...mail,
              ...{
                archive: { inInbox: false },
                trash: { deleted: true },
                spam: { spam: true, inInbox: false },
                restore: {
                  deleted: false,
                  spam: false,
                  inInbox: true,
                  snoozedUntil: undefined,
                },
                read: { read: true },
                unread: { read: false },
                important: { important: true },
                unimportant: { important: false },
                inbox: {
                  inInbox: true,
                  spam: false,
                  deleted: false,
                  snoozedUntil: undefined,
                },
                purchase: { purchase: true, inInbox: false },
              }[action],
            },
      ),
    );
    if (["archive", "trash", "spam", "restore", "inbox"].includes(action)) {
      setOpenedId(null);
      setSelected([]);
    }
    setToast(labelsByAction[action]);
  }
  function toggleStar(id: number) {
    setMails((previous) =>
      previous.map((mail) =>
        mail.id === id ? { ...mail, star: !mail.star } : mail,
      ),
    );
  }
  function toggleImportant(id: number) {
    setMails((previous) =>
      previous.map((mail) =>
        mail.id === id ? { ...mail, important: !mail.important } : mail,
      ),
    );
  }
  function assignLabel(labelId: string, ids = targets()) {
    if (!ids.length) return;
    const remove = mails
      .filter((mail) => ids.includes(mail.id))
      .every((mail) => mail.labels?.includes(labelId));
    setMails((previous) =>
      previous.map((mail) =>
        !ids.includes(mail.id)
          ? mail
          : {
              ...mail,
              labels: remove
                ? (mail.labels || []).filter((id) => id !== labelId)
                : [...new Set([...(mail.labels || []), labelId])],
            },
      ),
    );
    setToast("Đã cập nhật nhãn của thư.");
  }
  function createLabel(name: string) {
    const value = name.trim();
    if (!value) return "Em hãy nhập tên nhãn.";
    if (
      labels.some((label) => label.name.toLowerCase() === value.toLowerCase())
    )
      return "Nhãn này đã tồn tại.";
    setLabels((previous) => [
      ...previous,
      { id: crypto.randomUUID(), name: value },
    ]);
    return "";
  }
  function deleteLabel(id: string) {
    setLabels((previous) => previous.filter((label) => label.id !== id));
    setMails((previous) =>
      previous.map((mail) => ({
        ...mail,
        labels: mail.labels?.filter((label) => label !== id),
      })),
    );
    if (folder === `label:${id}`) navigateFolder("inbox");
  }
  function snooze(until: string, ids = targets()) {
    if (!ids.length) return;
    if (new Date(until).getTime() <= Date.now()) {
      setError("Chọn thời điểm nhắc lại trong tương lai.");
      return false;
    }
    setUndoSnapshot({ mails: [...mails], label: "Hoàn tác" });
    setMails((previous) =>
      previous.map((mail) =>
        ids.includes(mail.id)
          ? { ...mail, snoozedUntil: until, inInbox: false }
          : mail,
      ),
    );
    setOpenedId(null);
    setSelected([]);
    setToast(
      "Đã tạm ẩn thư. Thư sẽ trở lại khi đến giờ, trong lúc trang đang mở.",
    );
    return true;
  }
  function replyTo(mail: Mail, all = false, forward = false) {
    const next = emptyDraft();
    next.recipient = forward
      ? ""
      : mail.kind === "sent"
        ? (mail.to || [mail.email]).join(", ")
        : mail.from || mail.email;
    next.cc = all
      ? [
          ...new Set(
            [...(mail.to || []), ...(mail.cc || [])].filter(
              (address) =>
                address !== account.email &&
                !parseRecipients(next.recipient).includes(address),
            ),
          ),
        ].join(", ")
      : "";
    next.subject = `${forward ? "Fwd" : "Re"}: ${mail.subject.replace(/^(Re|Fwd):\s*/i, "")}`;
    if (forward) {
      next.body = `\n\n---------- Thư được chuyển tiếp ----------\nTừ: ${mail.sender} <${mail.from || mail.email}>\nTiêu đề: ${mail.subject}\n\n${mail.body}`;
      next.html = `<p><br></p>${plainToHtml(`---------- Thư được chuyển tiếp ----------\nTừ: ${mail.sender} <${mail.from || mail.email}>\nTiêu đề: ${mail.subject}`)}<blockquote>${mail.html || plainToHtml(mail.body)}</blockquote>`;
      next.attachments = mail.attachments || [];
    }
    setDraft(next);
    setCompose(true);
    setMinimized(false);
    mark(2, 0);
    if (next.recipient) mark(2, 1);
    mark(2, 2);
  }
  function undoAction() {
    if (!undoSnapshot) return;
    setMails(undoSnapshot.mails);
    if (undoSnapshot.draft) {
      setDraft(undoSnapshot.draft);
      setCompose(true);
      setMinimized(false);
    }
    setOpenedId(null);
    setSelected([]);
    setToast("Đã hoàn tác thao tác.");
    setUndoSnapshot(null);
  }
  function cancelScheduled(mail: Mail) {
    setMails((previous) => previous.filter((item) => item.id !== mail.id));
    const next: Draft = {
      id: crypto.randomUUID(),
      recipient: (mail.to || [mail.email]).join(", "),
      cc: (mail.cc || []).join(", "),
      bcc: (mail.bcc || []).join(", "),
      subject: mail.subject,
      body: mail.body,
      html: mail.html || plainToHtml(mail.body),
      attachments: mail.attachments || [],
      expiresAt: mail.expiresAt,
      savedAt: Date.now(),
    };
    setDraft(next);
    setCompose(true);
    setMinimized(false);
    setOpenedId(null);
    setToast("Đã hủy lịch gửi và mở lại thư nháp.");
  }
  function resetMailbox() {
    setMails(initialMail.map((mail) => ({ ...mail })));
    setDraft(null);
    setDrafts([]);
    setCompose(false);
    setSelected([]);
    setOpenedId(null);
    setSearch("");
    setProfile(false);
    setUndoSnapshot(null);
    setFolder("inbox");
    setCategory("primary");
    setPage(0);
    setError("");
    setComposeExpanded(false);
    setMinimized(false);
    setLabels([
      { id: "school", name: "Học tập" },
      { id: "class", name: "Lớp 6A" },
    ]);
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current = [];
  }
  return {
    mails,
    setMails,
    sent,
    folder,
    setFolder: navigateFolder,
    category,
    setCategory,
    opened,
    setOpened,
    search,
    setSearch,
    selected,
    setSelected,
    profile,
    setProfile,
    compose,
    setCompose,
    minimized,
    setMinimized,
    composeExpanded,
    setComposeExpanded,
    draft,
    drafts,
    setDrafts,
    recipient,
    setRecipient,
    cc,
    setCc,
    bcc,
    setBcc,
    subject,
    setSubject,
    body,
    setBody,
    bodyHtml,
    setBodyRich,
    attachments,
    setAttachments,
    error,
    setError,
    labels,
    createLabel,
    deleteLabel,
    assignLabel,
    undoSnapshot,
    undoAction,
    density,
    setDensity,
    pageSize,
    setPageSize,
    showCategories,
    setShowCategories,
    page: safePage,
    setPage,
    lastPage,
    filteredCount: filtered.length,
    visibleMails,
    mailFullscreen,
    setMailFullscreen,
    fileRef,
    updateDraft,
    startCompose,
    openDraft,
    closeCompose,
    discardDraft,
    removeDraft,
    permanentlyDelete,
    addAttachments,
    sendMail,
    openMail,
    applyAction,
    toggleStar,
    toggleImportant,
    snooze,
    replyTo,
    cancelScheduled,
    resetMailbox,
  };
}
