import type { Draft, Mail } from "./lesson-data";

export const contacts = [
  { name: "Nguyễn Thúy", email: "thuyk39@example.com" },
  { name: "Thầy Nam", email: "thaynam@example.com" },
  { name: "Cô Hương", email: "cohuong@example.com" },
  { name: "Nguyễn Minh", email: "minh6a@example.com" },
];
export const emptyDraft = (): Draft => ({
  id: globalThis.crypto.randomUUID(),
  recipient: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "",
  html: "",
  attachments: [],
  savedAt: Date.now(),
});
export const parseRecipients = (value: string) =>
  value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
export const hasDraftContent = (draft: Draft) =>
  !!(
    draft.recipient ||
    draft.cc ||
    draft.bcc ||
    draft.subject ||
    draft.body ||
    draft.attachments.length
  );
export function isInFolder(mail: Mail, folder: string): boolean {
  if (folder === "trash") return !!mail.deleted;
  if (mail.deleted) return false;
  if (folder === "spam") return !!mail.spam;
  if (mail.spam) return false;
  if (folder === "sent") return mail.kind === "sent";
  if (folder === "scheduled") return mail.kind === "scheduled";
  if (folder === "snoozed") return !!mail.snoozedUntil;
  if (folder === "starred") return mail.star;
  if (folder === "important") return !!mail.important;
  if (folder === "purchases") return !!mail.purchase;
  if (folder.startsWith("label:"))
    return !!mail.labels?.includes(folder.slice(6));
  if (folder === "all") return mail.kind !== "scheduled";
  if (folder === "inbox")
    return (
      (mail.inInbox ?? mail.kind !== "sent") &&
      !mail.snoozedUntil &&
      mail.kind !== "scheduled"
    );
  return false;
}
export function matchesSearch(mail: Mail, query: string): boolean {
  const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  return tokens.every((token) => {
    const separator = token.indexOf(":");
    if (separator > 0) {
      const field = token.slice(0, separator).toLowerCase();
      const term = token
        .slice(separator + 1)
        .replaceAll('"', "")
        .toLocaleLowerCase("vi");
      if (field === "from")
        return `${mail.sender} ${mail.from || mail.email}`
          .toLocaleLowerCase("vi")
          .includes(term);
      if (field === "to")
        return [...(mail.to || []), ...(mail.cc || []), ...(mail.bcc || [])]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(term);
      if (field === "subject")
        return mail.subject.toLocaleLowerCase("vi").includes(term);
      if (field === "is" && term === "unread") return !mail.read;
      if (field === "is" && term === "read") return mail.read;
      if (field === "is" && term === "starred") return mail.star;
      if (field === "has" && term === "attachment")
        return !!mail.attachments?.length;
      if (field === "in")
        return (
          term === "anywhere" ||
          isInFolder(
            mail,
            (
              {
                inbox: "inbox",
                sent: "sent",
                trash: "trash",
                spam: "spam",
              } as Record<string, string>
            )[term] || term,
          )
        );
    }
    return `${mail.sender} ${mail.email} ${mail.subject} ${mail.body}`
      .toLocaleLowerCase("vi")
      .includes(token.replaceAll('"', "").toLocaleLowerCase("vi"));
  });
}
export function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
export const plainToHtml = (text: string) =>
  text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    .join("");
export function safeLink(value: string): string | null {
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function formatBytes(value: number) {
  return value >= 1048576
    ? `${(value / 1048576).toFixed(1)} MB`
    : value >= 1024
      ? `${Math.ceil(value / 1024)} KB`
      : `${value} B`;
}
export function advanceMailTime(mail: Mail, now: number): Mail {
  if (mail.deleted || mail.spam) return mail;
  if (
    mail.kind === "scheduled" &&
    mail.scheduledAt &&
    new Date(mail.scheduledAt).getTime() <= now
  )
    return { ...mail, kind: "sent", scheduledAt: undefined, time: "Vừa gửi" };
  if (mail.snoozedUntil && new Date(mail.snoozedUntil).getTime() <= now)
    return { ...mail, snoozedUntil: undefined, inInbox: true };
  return mail;
}
