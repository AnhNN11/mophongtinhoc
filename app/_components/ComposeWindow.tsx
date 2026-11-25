"use client";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  DropdownMenu,
  IconButton,
  Popover,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import {
  Minus,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  Paperclip,
  Link as LinkIcon,
  Smile,
  Image as ImageIcon,
  LockKeyhole,
  MoreVertical,
  Trash2,
  Type,
  Triangle,
  Clock3,
  Printer,
  Users,
  FileText,
  Check,
} from "lucide-react";
import { useSimulation } from "./simulation-context";
import { composeErrors, recipientListError } from "../_lib/validation";
import { contacts, formatBytes, plainToHtml } from "../_lib/mail-model";
import { useLiveValidation } from "./use-live-validation";
import { FieldFeedback } from "./FieldFeedback";
import { EditorToolbar } from "./EditorToolbar";
import { ComposeDialogs, type ComposeDialog } from "./ComposeDialogs";

function Action({
  label,
  onClick,
  children,
  active = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Tooltip content={label}>
      <IconButton
        type="button"
        aria-label={label}
        aria-pressed={active}
        size="2"
        variant={active ? "soft" : "ghost"}
        className="composer-action"
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
export function ComposeWindow() {
  const {
    account,
    draft,
    error,
    setError,
    recipient,
    setRecipient,
    cc,
    setCc,
    bcc,
    setBcc,
    subject,
    setSubject,
    body,
    bodyHtml,
    setBodyRich,
    attachments,
    setAttachments,
    minimized,
    setMinimized,
    composeExpanded,
    setComposeExpanded,
    fileRef,
    mark,
    sendMail,
    closeCompose,
    discardDraft,
    addAttachments,
  } = useSimulation();
  const [showCc, setShowCc] = useState(!!cc),
    [showBcc, setShowBcc] = useState(!!bcc),
    [formatting, setFormatting] = useState(true),
    [spellcheck, setSpellcheck] = useState(true);
  const [dialog, setDialog] = useState<ComposeDialog>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const validation = useLiveValidation(
    composeErrors({ recipient, cc, bcc, subject, body }),
    "compose",
  );
  const contentError = validation.error("body", body);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageExtension.configure({ allowBase64: true, inline: true }),
    ],
    content: bodyHtml || plainToHtml(body),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "mail-editor-content",
        role: "textbox",
        "aria-label": "Nội dung thư",
        "aria-multiline": "true",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: e }) => {
      const value = e.getText();
      setBodyRich(value, e.getHTML());
      validation.touch("body");
      setError("");
      mark(2, 3, value.trim().length >= 10);
    },
  });
  useEffect(() => {
    if (editor && editor.getText() !== body)
      editor.commands.setContent(bodyHtml || plainToHtml(body), {
        emitUpdate: false,
      });
  }, [editor, body, bodyHtml]);
  useEffect(() => {
    editor?.setOptions({
      editorProps: {
        attributes: {
          class: "mail-editor-content",
          role: "textbox",
          "aria-label": "Nội dung thư",
          "aria-multiline": "true",
          "aria-invalid": String(!!contentError),
          "aria-describedby": contentError ? "compose-body-feedback" : "",
          spellcheck: String(spellcheck),
        },
      },
    });
  }, [editor, contentError, spellcheck]);
  async function insertImage(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        file.type,
      ) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Chọn ảnh PNG, JPEG, GIF hoặc WebP, tối đa 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      editor
        ?.chain()
        .focus()
        .setImage({ src: String(reader.result), alt: file.name })
        .run();
    reader.readAsDataURL(file);
  }
  function recipientRow(
    kind: "recipient" | "cc" | "bcc",
    label: string,
    value: string,
    update: (value: string) => void,
  ) {
    const invalid = validation.error(kind, value);
    return (
      <>
        <div className="recipient-row">
          <span>{label}</span>
          <TextField.Root
            {...validation.fieldProps(kind, value)}
            aria-label={
              kind === "recipient"
                ? "Địa chỉ người nhận"
                : kind === "cc"
                  ? "Địa chỉ Cc"
                  : "Địa chỉ Bcc"
            }
            inputMode="email"
            value={value}
            placeholder={
              kind === "recipient"
                ? "Nhập email, ngăn cách bằng dấu phẩy"
                : "Địa chỉ email"
            }
            onChange={(e) => {
              update(e.target.value);
              validation.touch(kind);
              setError("");
              if (kind === "recipient")
                mark(2, 1, !recipientListError(e.target.value));
            }}
          />
          {kind === "recipient" && (
            <div className="recipient-options">
              {!showCc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="1"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </Button>
              )}
              {!showBcc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="1"
                  onClick={() => setShowBcc(true)}
                >
                  Bcc
                </Button>
              )}
              <Popover.Root>
                <Popover.Trigger>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="1"
                    aria-label="Chọn người nhận từ danh bạ"
                  >
                    <Users size={16} />
                  </IconButton>
                </Popover.Trigger>
                <Popover.Content size="2">
                  <strong>Danh bạ luyện tập</strong>
                  {contacts.map((contact) => (
                    <Popover.Close key={contact.email}>
                      <Button
                        className="contact-option"
                        variant="ghost"
                        onClick={() => {
                          const next = recipient
                            ? `${recipient}, ${contact.email}`
                            : contact.email;
                          setRecipient(next);
                          mark(2, 1, !recipientListError(next));
                        }}
                      >
                        <span>
                          {contact.name}
                          <small>{contact.email}</small>
                        </span>
                      </Button>
                    </Popover.Close>
                  ))}
                </Popover.Content>
              </Popover.Root>
            </div>
          )}
        </div>
        <FieldFeedback id={validation.feedbackId(kind)} error={invalid} />
      </>
    );
  }
  return (
    <form
      className={`compose-window gmail-compose ${minimized ? "minimized" : ""} ${composeExpanded ? "compose-expanded" : ""}`}
      aria-label="Soạn thư mới"
      noValidate
      onSubmit={(event) => {
        if (!showCc && cc) setShowCc(true);
        if (!showBcc && bcc) setShowBcc(true);
        if (validation.validate(event)) sendMail(event);
        else {
          setError("");
          if (
            !recipientListError(recipient) &&
            !recipientListError(cc, false) &&
            !recipientListError(bcc, false) &&
            subject.trim() &&
            body.trim().length < 10
          )
            editor?.commands.focus();
        }
      }}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.requestSubmit();
        }
      }}
    >
      <div className="compose-title">
        <strong>{subject || "Thư mới"}</strong>
        <div>
          <IconButton
            type="button"
            variant="ghost"
            size="1"
            aria-label={minimized ? "Mở lại thư" : "Thu nhỏ thư"}
            onClick={() => setMinimized(!minimized)}
          >
            <Minus size={15} />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            size="1"
            aria-label={
              composeExpanded
                ? "Thu gọn cửa sổ soạn thư"
                : "Phóng to cửa sổ soạn thư"
            }
            onClick={() => {
              setComposeExpanded(!composeExpanded);
              setMinimized(false);
            }}
          >
            {composeExpanded ? (
              <Minimize2 size={15} />
            ) : (
              <Maximize2 size={15} />
            )}
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            size="1"
            aria-label="Đóng và lưu thư nháp"
            onClick={closeCompose}
          >
            <X size={16} />
          </IconButton>
        </div>
      </div>
      <div className="compose-fields">
        <div className="compose-from">
          <span>Từ</span>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button type="button" variant="ghost" size="1">
                {account.name} <span>&lt;{account.email}&gt;</span>
                <ChevronDown size={13} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>
                Địa chỉ người gửi trong mô phỏng
              </DropdownMenu.Label>
              <DropdownMenu.Item>
                <Check size={14} />
                {account.email}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        {recipientRow("recipient", "Đến", recipient, setRecipient)}
        {showCc && recipientRow("cc", "Cc", cc, setCc)}
        {showBcc && recipientRow("bcc", "Bcc", bcc, setBcc)}
        <div className="compose-subject">
          <TextField.Root
            {...validation.fieldProps("subject", subject)}
            aria-label="Tiêu đề thư"
            value={subject}
            placeholder="Tiêu đề"
            onChange={(e) => {
              setSubject(e.target.value);
              validation.touch("subject");
              setError("");
              mark(2, 2, !!e.target.value.trim());
            }}
          />
        </div>
        <FieldFeedback
          id={validation.feedbackId("subject")}
          error={validation.error("subject", subject)}
        />
        <div
          className={`rich-editor ${contentError ? "editor-invalid" : ""}`}
          data-placeholder="Viết nội dung thư…"
          data-empty={!body.trim() && !bodyHtml.includes("<img")}
        >
          <EditorContent editor={editor} />
          <input type="hidden" name="body" value={body} />
        </div>
        <FieldFeedback
          id={validation.feedbackId("body")}
          error={contentError}
        />
        {draft?.expiresAt && (
          <div className="confidential-banner">
            <LockKeyhole size={15} />
            Nội dung hết hạn:{" "}
            {new Date(draft.expiresAt).toLocaleString("vi-VN")}
            <Button
              type="button"
              size="1"
              variant="ghost"
              onClick={() => setDialog("confidential")}
            >
              Thay đổi
            </Button>
          </div>
        )}
        <div className="attachment-list">
          {attachments.map((file) => (
            <div key={file.id}>
              <FileText size={16} />
              <a href={file.url} download={file.name}>
                {file.name} <small>({formatBytes(file.size)})</small>
              </a>
              <IconButton
                type="button"
                size="1"
                variant="ghost"
                aria-label={`Bỏ tệp ${file.name}`}
                onClick={() =>
                  setAttachments((previous) =>
                    previous.filter((item) => item.id !== file.id),
                  )
                }
              >
                <X size={13} />
              </IconButton>
            </div>
          ))}
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {formatting && <EditorToolbar editor={editor} />}
        <div className="compose-actions">
          <div className="send-split">
            <Button type="submit" className="send-button">
              Gửi
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton
                  type="button"
                  aria-label="Tùy chọn gửi"
                  className="send-options"
                >
                  <ChevronDown size={15} />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => setDialog("schedule")}>
                  <Clock3 size={17} />
                  Lên lịch gửi
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
          <Action
            label="Tùy chọn định dạng"
            active={formatting}
            onClick={() => setFormatting(!formatting)}
          >
            <Type size={20} />
          </Action>
          <Action label="Đính kèm tệp" onClick={() => fileRef.current?.click()}>
            <Paperclip size={19} />
          </Action>
          <Action label="Chèn liên kết" onClick={() => setDialog("link")}>
            <LinkIcon size={19} />
          </Action>
          <Popover.Root>
            <Popover.Trigger>
              <IconButton
                type="button"
                variant="ghost"
                aria-label="Chèn biểu tượng cảm xúc"
                className="composer-action"
              >
                <Smile size={20} />
              </IconButton>
            </Popover.Trigger>
            <Popover.Content size="2">
              <div className="emoji-grid">
                {[
                  "😊",
                  "😀",
                  "😄",
                  "🥰",
                  "😍",
                  "🤔",
                  "😎",
                  "👏",
                  "👍",
                  "💪",
                  "🙏",
                  "❤️",
                  "🌻",
                  "🌱",
                  "⭐",
                  "🎉",
                  "📚",
                  "✉️",
                  "✅",
                  "💻",
                  "🎓",
                  "🫡",
                  "🇻🇳",
                  "👋",
                ].map((emoji) => (
                  <Popover.Close key={emoji}>
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={`Chèn ${emoji}`}
                      onClick={() =>
                        editor?.chain().focus().insertContent(emoji).run()
                      }
                    >
                      {emoji}
                    </Button>
                  </Popover.Close>
                ))}
              </div>
            </Popover.Content>
          </Popover.Root>
          <Action
            label="Chèn tệp từ Drive mô phỏng"
            onClick={() => setDialog("drive")}
          >
            <Triangle size={20} />
          </Action>
          <Action label="Chèn ảnh" onClick={() => imageRef.current?.click()}>
            <ImageIcon size={20} />
          </Action>
          <Action
            label="Chế độ bảo mật"
            active={!!draft?.expiresAt}
            onClick={() => setDialog("confidential")}
          >
            <LockKeyhole size={20} />
          </Action>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                type="button"
                variant="ghost"
                aria-label="Tùy chọn khác của thư"
                className="composer-action"
              >
                <MoreVertical size={20} />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => window.print()}>
                <Printer size={16} />
                In thư đang soạn
              </DropdownMenu.Item>
              <DropdownMenu.CheckboxItem
                checked={spellcheck}
                onCheckedChange={setSpellcheck}
              >
                Kiểm tra chính tả của trình duyệt
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.Item
                onSelect={() =>
                  editor?.chain().focus().unsetAllMarks().clearNodes().run()
                }
              >
                Xóa định dạng văn bản
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red" onSelect={discardDraft}>
                Bỏ thư nháp
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <Action label="Xóa thư nháp" onClick={discardDraft}>
            <Trash2 size={19} />
          </Action>
        </div>
        <div className="compose-status">
          {recipient || cc || bcc || subject || body || attachments.length
            ? "Đã lưu vào Thư nháp · "
            : ""}Ctrl + Enter để gửi · Mô phỏng
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          onChange={(e) => {
            addAttachments(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={(e) => {
            void insertImage(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>
      <ComposeDialogs dialog={dialog} setDialog={setDialog} editor={editor} />
    </form>
  );
}
