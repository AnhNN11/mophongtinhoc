"use client";
import { useEffect, useState } from "react";
import { Button, DropdownMenu, IconButton } from "@radix-ui/themes";
import {
  ChevronDown,
  MoreVertical,
  Printer,
  Reply,
  ReplyAll,
  Forward,
  FileText,
  Download,
  LockKeyhole,
  Clock3,
} from "lucide-react";
import { useSimulation } from "./simulation-context";
import { formatBytes, plainToHtml } from "../_lib/mail-model";
import type { Mail } from "../_lib/lesson-data";

export async function downloadMail(mail: Mail, ownEmail: string) {
  const subject = btoa(
    Array.from(new TextEncoder().encode(mail.subject), (byte) =>
      String.fromCharCode(byte),
    ).join(""),
  );
  const outgoing = mail.kind === "sent" || mail.kind === "scheduled";
  const boundary = `practice-${crypto.randomUUID()}`;
  function encode(bytes: Uint8Array) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return (btoa(binary).match(/.{1,76}/g) || []).join("\r\n");
  }
  let source = `From: ${mail.sender} <${mail.from || (outgoing ? ownEmail : mail.email)}>\r\nTo: ${(mail.to || (outgoing ? [mail.email] : [ownEmail])).join(", ")}\r\nCc: ${(mail.cc || []).join(", ")}\r\n${outgoing && mail.bcc?.length ? `Bcc: ${mail.bcc.join(", ")}\r\n` : ""}Subject: =?UTF-8?B?${subject}?=\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${encode(new TextEncoder().encode(mail.html || plainToHtml(mail.body)))}\r\n`;
  for (const file of mail.attachments || []) {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error("Attachment unavailable");
    const bytes = new Uint8Array(await response.arrayBuffer());
    source += `--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\nContent-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(file.name)}\r\nContent-Transfer-Encoding: base64\r\n\r\n${encode(bytes)}\r\n`;
  }
  source += `--${boundary}--\r\n`;
  const url = URL.createObjectURL(
    new Blob([source], { type: "message/rfc822" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${mail.subject.replace(/[^\p{L}\p{N} -]/gu, "").slice(0, 60) || "thu"}.eml`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function MailReader() {
  const {
    opened,
    account,
    replyTo,
    cancelScheduled,
    toggleStar,
    labels,
    setToast,
  } = useSimulation();
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    function update() {
      setExpired(
        !!opened?.expiresAt &&
          new Date(opened.expiresAt).getTime() <= Date.now(),
      );
    }
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [opened?.id, opened?.expiresAt]);
  if (!opened) return null;
  const outgoing = opened.kind === "sent" || opened.kind === "scheduled";
  return (
    <article className="opened-mail gmail-reader">
      <div className="reader-subject">
        <h3>{opened.subject}</h3>
        <div className="reader-top-actions">
          <IconButton
            size="1"
            variant="ghost"
            aria-label="In thư"
            onClick={() => window.print()}
          >
            <Printer size={18} />
          </IconButton>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                size="1"
                variant="ghost"
                aria-label="Tùy chọn nội dung thư"
              >
                <MoreVertical size={19} />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                disabled={expired || !!opened.expiresAt}
                onSelect={() =>
                  void downloadMail(opened, account.email).catch(() =>
                    setToast("Không tải được tệp đính kèm trong phiên này."),
                  )
                }
              >
                <Download size={16} />
                Tải thư xuống (.eml)
              </DropdownMenu.Item>
              <DropdownMenu.Item
                disabled={expired}
                onSelect={() => replyTo(opened, true)}
              >
                Trả lời tất cả
              </DropdownMenu.Item>
              <DropdownMenu.Item
                disabled={expired || !!opened.expiresAt}
                onSelect={() => replyTo(opened, false, true)}
              >
                Chuyển tiếp
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
      <div className="reader-labels">
        {opened.labels?.map((id) => (
          <span key={id}>
            {labels.find((label) => label.id === id)?.name || id}
          </span>
        ))}
      </div>
      {opened.kind === "scheduled" && (
        <div className="scheduled-banner">
          <Clock3 size={17} />
          <span>
            Đã lên lịch:{" "}
            {new Date(opened.scheduledAt || "").toLocaleString("vi-VN")}
          </span>
          <Button
            size="1"
            variant="ghost"
            onClick={() => cancelScheduled(opened)}
          >
            Hủy lịch gửi
          </Button>
        </div>
      )}
      <div className="sender-info">
        <span className="sender-avatar">{opened.sender[0]}</span>
        <div>
          <strong>{opened.sender}</strong>
          <small>
            &lt;{opened.from || (outgoing ? account.email : opened.email)}&gt;
          </small>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button size="1" variant="ghost" className="recipient-details">
                đến{" "}
                {outgoing ? (opened.to || [opened.email]).join(", ") : "tôi"}
                <ChevronDown size={11} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Thông tin thư</DropdownMenu.Label>
              <div className="mail-metadata">
                <p>
                  <b>Từ:</b>{" "}
                  {opened.from || (outgoing ? account.email : opened.email)}
                </p>
                <p>
                  <b>Đến:</b>{" "}
                  {(
                    opened.to || (outgoing ? [opened.email] : [account.email])
                  ).join(", ")}
                </p>
                {!!opened.cc?.length && (
                  <p>
                    <b>Cc:</b> {opened.cc.join(", ")}
                  </p>
                )}
                {outgoing && !!opened.bcc?.length && (
                  <p>
                    <b>Bcc:</b> {opened.bcc.join(", ")}
                  </p>
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <span>{opened.time}</span>
        <IconButton
          size="1"
          variant="ghost"
          aria-label={
            opened.star ? "Bỏ dấu sao thư đang đọc" : "Gắn dấu sao thư đang đọc"
          }
          onClick={() => toggleStar(opened.id)}
        >
          {opened.star ? "★" : "☆"}
        </IconButton>
      </div>
      {opened.expiresAt && (
        <div className="confidential-banner">
          <LockKeyhole size={16} />
          {expired
            ? "Thư đã hết thời hạn xem trong mô phỏng."
            : `Thư bảo mật mô phỏng · Hết hạn ${new Date(opened.expiresAt).toLocaleString("vi-VN")}`}
        </div>
      )}
      {expired ? (
        <div className="empty-mail">
          <LockKeyhole size={35} />
          <h3>Nội dung không còn khả dụng</h3>
        </div>
      ) : (
        <>
          <div
            className="rendered-message"
            dangerouslySetInnerHTML={{
              __html: opened.html || plainToHtml(opened.body),
            }}
          />
          <div className="reader-attachments">
            {opened.attachments?.map((file) => (
              <div className="received-attachment" key={file.id}>
                <FileText size={24} />
                <span>
                  {file.name}
                  <small>{formatBytes(file.size)}</small>
                </span>
                {!opened.expiresAt && (
                  <a
                    href={file.url}
                    download={file.name}
                    aria-label={`Tải tệp ${file.name}`}
                  >
                    <Download size={17} />
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="reader-replies">
            <Button variant="surface" onClick={() => replyTo(opened)}>
              <Reply size={16} />
              Trả lời
            </Button>
            <Button variant="surface" onClick={() => replyTo(opened, true)}>
              <ReplyAll size={16} />
              Trả lời tất cả
            </Button>
            <Button
              variant="surface"
              disabled={!!opened.expiresAt}
              onClick={() => replyTo(opened, false, true)}
            >
              <Forward size={16} />
              Chuyển tiếp
            </Button>
          </div>
        </>
      )}
    </article>
  );
}
