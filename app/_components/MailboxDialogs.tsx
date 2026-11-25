"use client";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  Select,
  TextField,
} from "@radix-ui/themes";
import { useSimulation } from "./simulation-context";
import { contacts } from "../_lib/mail-model";
export type MailboxPanel =
  "settings" | "label" | "snooze" | "templates" | "contacts" | "delete" | null;
export function MailboxDialogs({
  panel,
  setPanel,
}: {
  panel: MailboxPanel;
  setPanel: (panel: MailboxPanel) => void;
}) {
  const {
    density,
    setDensity,
    pageSize,
    setPageSize,
    showCategories,
    setShowCategories,
    createLabel,
    snooze,
    startCompose,
    setRecipient,
    setSubject,
    setBody,
    setToast,
    opened,
    selected,
    permanentlyDelete,
  } = useSimulation();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  return (
    <Dialog.Root
      open={panel !== null}
      onOpenChange={(open) => {
        if (!open) {
          setPanel(null);
          setError("");
          setValue("");
        }
      }}
    >
      <Dialog.Content maxWidth="440px" className="gmail-dialog">
        <Dialog.Title>
          {
            (
              {
                settings: "Cài đặt nhanh",
                label: "Tạo nhãn mới",
                snooze: "Tạm ẩn thư",
                templates: "Mẫu thư luyện tập",
                contacts: "Danh bạ",
                delete: "Xóa vĩnh viễn trong mô phỏng",
              } as Record<string, string>
            )[panel || ""]
          }
        </Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {panel === "settings"
            ? "Tùy chỉnh cách hiển thị hộp thư luyện tập."
            : panel === "delete"
              ? "Chỉ xóa các thư đang chọn trong bài mô phỏng này."
              : panel === "snooze"
                ? "Thư sẽ trở lại Hộp thư đến vào giờ đã chọn, khi trang đang mở."
                : "Dữ liệu luyện tập, không kết nối với tài khoản Google thật."}
        </Dialog.Description>
        {panel === "settings" && (
          <div className="settings-fields">
            <label>
              Mật độ hiển thị
              <Select.Root
                value={density}
                onValueChange={(value) =>
                  setDensity(value as "normal" | "compact")
                }
              >
                <Select.Trigger aria-label="Mật độ hiển thị" />
                <Select.Content>
                  <Select.Item value="normal">Mặc định</Select.Item>
                  <Select.Item value="compact">Gọn</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
            <label>
              Số thư mỗi trang
              <Select.Root
                value={String(pageSize)}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <Select.Trigger aria-label="Số thư mỗi trang" />
                <Select.Content>
                  {[5, 10, 20, 50].map((size) => (
                    <Select.Item key={size} value={String(size)}>
                      {size} thư
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>
            <label className="checkbox-label">
              <Checkbox
                checked={showCategories}
                onCheckedChange={(checked) =>
                  setShowCategories(checked === true)
                }
              />
              Hiển thị các thẻ nhóm thư
            </label>
          </div>
        )}
        {(panel === "label" || panel === "snooze") && (
          <label className="dialog-field">
            {panel === "label" ? "Tên nhãn" : "Ngày và giờ nhắc lại"}
            <TextField.Root
              autoFocus
              aria-label={
                panel === "label" ? "Tên nhãn mới" : "Thời điểm nhắc lại"
              }
              type={panel === "snooze" ? "datetime-local" : "text"}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError("");
              }}
            />
          </label>
        )}
        {panel === "templates" && (
          <div className="template-list">
            {[
              {
                title: "Thư hỏi thăm bạn",
                body: "Thúy thân mến,\n\nBạn học ở trường mới thế nào? Mình rất nhớ bạn. Hãy viết thư cho mình biết nhé!\n\nChúc bạn vui và học tốt!",
              },
              {
                title: "Gửi bài tập Tin học",
                body: "Em chào thầy,\n\nEm gửi thầy bài thực hành Tin học. Nhờ thầy xem và góp ý giúp em.\n\nEm cảm ơn thầy!",
              },
            ].map((template) => (
              <Button
                key={template.title}
                variant="surface"
                onClick={() => {
                  startCompose();
                  setSubject(template.title);
                  setBody(template.body);
                  setPanel(null);
                }}
              >
                {template.title}
              </Button>
            ))}
          </div>
        )}
        {panel === "contacts" &&
          contacts.map((contact) => (
            <Button
              key={contact.email}
              variant="ghost"
              className="contact-option"
              onClick={() => {
                startCompose();
                setRecipient(contact.email);
                setPanel(null);
              }}
            >
              <span>
                {contact.name}
                <small>{contact.email}</small>
              </span>
            </Button>
          ))}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Flex gap="3" justify="end" mt="5">
          <Button
            variant="surface"
            onClick={() => {
              setPanel(null);
              setError("");
              setValue("");
            }}
          >
            {panel === "settings" ? "Xong" : "Đóng"}
          </Button>
          {(panel === "label" || panel === "snooze") && (
            <Button
              onClick={() => {
                if (panel === "label") {
                  const message = createLabel(value);
                  if (message) {
                    setError(message);
                    return;
                  }
                  setToast("Đã tạo nhãn mới.");
                } else if (
                  !value ||
                  !Number.isFinite(new Date(value).getTime()) ||
                  new Date(value).getTime() <= Date.now()
                ) {
                  setError("Chọn một thời điểm trong tương lai.");
                  return;
                } else if (!snooze(new Date(value).toISOString())) return;
                setPanel(null);
                setValue("");
                setError("");
              }}
            >
              {panel === "label" ? "Tạo nhãn" : "Lưu"}
            </Button>
          )}
          {panel === "delete" && (
            <Button
              color="red"
              onClick={() => {
                const ids = opened ? [opened.id] : selected;
                permanentlyDelete(ids);
                setPanel(null);
              }}
            >
              Xóa vĩnh viễn
            </Button>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
