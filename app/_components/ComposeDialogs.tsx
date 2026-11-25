"use client";
import { Button, Callout, Dialog, Flex, TextField } from "@radix-ui/themes";
import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { safeLink } from "../_lib/mail-model";
import { useSimulation } from "./simulation-context";
export type ComposeDialog =
  "link" | "schedule" | "confidential" | "drive" | null;
export function ComposeDialogs({
  dialog,
  setDialog,
  editor,
}: {
  dialog: ComposeDialog;
  setDialog: (value: ComposeDialog) => void;
  editor: Editor | null;
}) {
  const { draft, updateDraft, sendMail, setAttachments } = useSimulation();
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [when, setWhen] = useState("");
  const [error, setError] = useState("");
  const linkError =
    url && !safeLink(url)
      ? "Chỉ dùng liên kết đầy đủ bắt đầu bằng https://, http:// hoặc mailto:."
      : "";
  return (
    <Dialog.Root
      open={dialog !== null}
      onOpenChange={(open) => {
        if (!open) {
          setDialog(null);
          setError("");
        }
      }}
    >
      <Dialog.Content maxWidth="450px" className="gmail-dialog">
        <Dialog.Title>
          {dialog === "link"
            ? "Chèn liên kết"
            : dialog === "schedule"
              ? "Lên lịch gửi"
              : dialog === "confidential"
                ? "Chế độ bảo mật (mô phỏng)"
                : "Chèn tệp từ Drive mô phỏng"}
        </Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {dialog === "link"
            ? "Chọn văn bản trong thư trước khi chèn để gắn liên kết."
            : dialog === "schedule"
              ? "Thư được gửi tự động khi đến giờ trong lúc trang này đang mở."
              : dialog === "confidential"
                ? "Thư sẽ bị ẩn nội dung khi hết hạn trong mô phỏng này."
                : "Thử đính kèm tài liệu mẫu, không truy cập Google Drive thật."}
        </Dialog.Description>
        {dialog === "link" && (
          <>
            <label className="dialog-field">
              Văn bản hiển thị
              <TextField.Root
                aria-label="Văn bản liên kết"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Để trống để dùng văn bản đã chọn hoặc địa chỉ"
              />
            </label>
            <label className="dialog-field">
              Địa chỉ liên kết
              <TextField.Root
                aria-label="Địa chỉ liên kết"
                value={url}
                aria-invalid={!!linkError}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </label>
            {linkError && (
              <p role="alert" className="form-error">
                {linkError}
              </p>
            )}
          </>
        )}
        {(dialog === "schedule" || dialog === "confidential") && (
          <label className="dialog-field">
            {dialog === "schedule" ? "Ngày và giờ gửi" : "Thời điểm hết hạn"}
            <TextField.Root
              type="datetime-local"
              aria-label={
                dialog === "schedule" ? "Thời điểm gửi" : "Thời điểm hết hạn"
              }
              value={when}
              onChange={(e) => {
                setWhen(e.target.value);
                setError("");
              }}
            />
          </label>
        )}
        {dialog === "confidential" && (
          <Callout.Root color="gold" size="1" mt="3">
            <Callout.Text>
              Đây là bài thực hành về thời hạn xem thư, không cung cấp mã hóa
              hoặc xác thực SMS thật.
            </Callout.Text>
          </Callout.Root>
        )}
        {dialog === "drive" && (
          <Button
            variant="surface"
            onClick={() => {
              setAttachments((previous) => [
                ...previous,
                {
                  id: crypto.randomUUID(),
                  name: "Phieu-hoc-tap.txt",
                  size: 230,
                  type: "text/plain",
                  url: "/practice/phieu-hoc-tap.txt",
                },
              ]);
              setDialog(null);
            }}
          >
            📄 Phiếu học tập Tin học 6
          </Button>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Flex justify="end" gap="3" mt="5">
          <Button
            variant="surface"
            onClick={() => {
              setDialog(null);
              setError("");
            }}
          >
            Hủy
          </Button>
          {dialog !== "drive" && (
            <Button
              onClick={() => {
                if (dialog === "link") {
                  const href = safeLink(url);
                  if (!href) {
                    setError("Em hãy nhập một liên kết hợp lệ.");
                    return;
                  }
                  if (editor) {
                    const { from, to } = editor.state.selection;
                    const selected = editor.state.doc.textBetween(
                      from,
                      to,
                      " ",
                    );
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: "text",
                        text: label || selected || url,
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href,
                              target: "_blank",
                              rel: "noopener noreferrer",
                            },
                          },
                        ],
                      })
                      .run();
                  }
                  setUrl("");
                  setLabel("");
                }
                if (dialog === "schedule" || dialog === "confidential") {
                  if (!when || new Date(when).getTime() <= Date.now()) {
                    setError("Chọn ngày, giờ trong tương lai.");
                    return;
                  }
                  if (
                    dialog === "schedule" &&
                    !sendMail(undefined, new Date(when).toISOString())
                  ) {
                    setError(
                      "Hãy kiểm tra người nhận, tiêu đề và nội dung thư trước khi lên lịch.",
                    );
                    return;
                  }
                  if (dialog === "confidential")
                    updateDraft({ expiresAt: new Date(when).toISOString() });
                }
                setDialog(null);
                setError("");
                setWhen("");
              }}
            >
              {dialog === "link"
                ? "Chèn liên kết"
                : dialog === "schedule"
                  ? "Lên lịch gửi"
                  : "Lưu"}
            </Button>
          )}
          {dialog === "confidential" && draft?.expiresAt && (
            <Button
              color="red"
              variant="soft"
              onClick={() => {
                updateDraft({ expiresAt: undefined });
                setDialog(null);
              }}
            >
              Tắt bảo mật
            </Button>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
