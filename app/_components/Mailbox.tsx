"use client";
import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  IconButton,
  Popover,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import {
  Menu,
  Search,
  SlidersHorizontal,
  CircleHelp,
  Settings,
  PenLine,
  Inbox,
  Star,
  Clock3,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  OctagonAlert,
  FolderInput,
  RotateCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users,
  Info,
  ShoppingBag,
  Bookmark,
  Paperclip,
  CalendarClock,
  LogOut,
} from "lucide-react";
import { useSimulation } from "./simulation-context";
import { ComposeWindow } from "./ComposeWindow";
import { MailboxDialogs, type MailboxPanel } from "./MailboxDialogs";
import { MailReader, downloadMail } from "./MailReader";
import { isInFolder } from "../_lib/mail-model";
import type { MailAction } from "./use-mail-workspace";

function MailIcon({
  label,
  children,
  onClick,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip content={label}>
      <IconButton
        variant="ghost"
        size="1"
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className="gmail-icon"
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
function GmailLogo() {
  return (
    <span className="gmail-logo">
      <svg viewBox="0 0 32 24" width="32" height="25" aria-hidden="true">
        <path
          d="M3 22V4l13 10L29 4v18"
          fill="none"
          stroke="#4285F4"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M3 22V4l13 10L29 4v18"
          fill="none"
          stroke="#34A853"
          strokeWidth="5"
          strokeDasharray="18 44"
          strokeDashoffset="-44"
        />
        <path
          d="m3 4 13 10L29 4"
          fill="none"
          stroke="#EA4335"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M29 4v8" stroke="#FBBC04" strokeWidth="5" />
      </svg>
      Gmail
    </span>
  );
}
const folders = [
  { id: "inbox", label: "Hộp thư đến", icon: Inbox },
  { id: "starred", label: "Có gắn dấu sao", icon: Star },
  { id: "snoozed", label: "Đã tạm ẩn", icon: Clock3 },
  { id: "sent", label: "Đã gửi", icon: Send },
  { id: "drafts", label: "Thư nháp", icon: FileText },
  { id: "purchases", label: "Giao dịch", icon: ShoppingBag },
];
const moreFolders = [
  { id: "scheduled", label: "Đã lên lịch", icon: CalendarClock },
  { id: "important", label: "Quan trọng", icon: Bookmark },
  { id: "all", label: "Tất cả thư", icon: Mail },
  { id: "spam", label: "Thư rác", icon: OctagonAlert },
  { id: "trash", label: "Thùng rác", icon: Trash2 },
];
const categories = [
  { id: "primary", label: "Chính", icon: Inbox },
  { id: "promotions", label: "Quảng cáo", icon: Tag },
  { id: "social", label: "Mạng xã hội", icon: Users },
  { id: "updates", label: "Thông tin cập nhật", icon: Info },
];

export function Mailbox() {
  const {
    lesson,
    currentStep,
    account,
    mails,
    folder,
    setFolder,
    category,
    setCategory,
    opened,
    setOpened,
    openMail,
    search,
    setSearch,
    selected,
    setSelected,
    profile,
    setProfile,
    compose,
    startCompose,
    drafts,
    openDraft,
    removeDraft,
    labels,
    deleteLabel,
    assignLabel,
    applyAction,
    toggleStar,
    toggleImportant,
    setToast,
    setModal,
    mark,
    chooseLesson,
    visibleMails,
    filteredCount,
    page,
    setPage,
    pageSize,
    lastPage,
    showCategories,
    density,
  } = useSimulation();
  const [more, setMore] = useState(false),
    [collapsed, setCollapsed] = useState(false);
  const [panel, setPanel] = useState<MailboxPanel>(null);
  const [fromFilter, setFromFilter] = useState(""),
    [toFilter, setToFilter] = useState(""),
    [subjectFilter, setSubjectFilter] = useState(""),
    [withAttachment, setWithAttachment] = useState(false),
    [onlyUnread, setOnlyUnread] = useState(false);
  const targetIds = opened ? [opened.id] : selected;
  const selectedAll =
    visibleMails.length > 0 &&
    visibleMails.every((mail) => selected.includes(mail.id));
  const someSelected = visibleMails.some((mail) => selected.includes(mail.id));
  const currentTitle =
    [...folders, ...moreFolders].find((item) => item.id === folder)?.label ||
    labels.find((label) => `label:${label.id}` === folder)?.name ||
    "Hộp thư";
  function toggleSelection(id: number) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  }
  function action(value: MailAction, ids?: number[]) {
    applyAction(value, ids);
  }
  function folderCount(id: string) {
    if (id === "drafts") return drafts.length;
    return mails.filter(
      (mail) => isInFolder(mail, id) && (id !== "inbox" || !mail.read),
    ).length;
  }
  function labelMenu() {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            variant="ghost"
            size="1"
            aria-label="Gắn nhãn"
            disabled={!targetIds.length}
            className="gmail-icon"
          >
            <Tag size={18} />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Gắn / bỏ nhãn</DropdownMenu.Label>
          {labels.map((label) => (
            <DropdownMenu.CheckboxItem
              key={label.id}
              checked={
                !!targetIds.length &&
                mails
                  .filter((mail) => targetIds.includes(mail.id))
                  .every((mail) => mail.labels?.includes(label.id))
              }
              onCheckedChange={() => assignLabel(label.id)}
            >
              {label.name}
            </DropdownMenu.CheckboxItem>
          ))}
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => setPanel("label")}>
            Tạo nhãn mới
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  }
  return (
    <div
      className={`gmail-app complete-gmail ${collapsed ? "nav-collapsed" : ""} density-${density}`}
    >
      <div className="gmail-header complete-header">
        <MailIcon
          label="Ẩn hoặc hiện danh sách thư mục"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={21} />
        </MailIcon>
        <GmailLogo />
        <div className="complete-search">
          <TextField.Root
            aria-label="Tìm kiếm trong thư"
            placeholder="Tìm kiếm trong thư"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOpened(null);
            }}
          >
            <TextField.Slot>
              <Search size={19} />
            </TextField.Slot>
            <TextField.Slot side="right">
              <Popover.Root>
                <Popover.Trigger>
                  <IconButton
                    variant="ghost"
                    size="1"
                    aria-label="Tìm kiếm nâng cao"
                  >
                    <SlidersHorizontal size={18} />
                  </IconButton>
                </Popover.Trigger>
                <Popover.Content size="3" className="advanced-search">
                  <strong>Tìm kiếm thư</strong>
                  <label>
                    Từ
                    <TextField.Root
                      aria-label="Tìm từ người gửi"
                      value={fromFilter}
                      onChange={(e) => setFromFilter(e.target.value)}
                    />
                  </label>
                  <label>
                    Đến
                    <TextField.Root
                      aria-label="Tìm theo người nhận"
                      value={toFilter}
                      onChange={(e) => setToFilter(e.target.value)}
                    />
                  </label>
                  <label>
                    Tiêu đề
                    <TextField.Root
                      aria-label="Tìm theo tiêu đề"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                    />
                  </label>
                  <label className="checkbox-label">
                    <Checkbox
                      checked={withAttachment}
                      onCheckedChange={(checked) =>
                        setWithAttachment(checked === true)
                      }
                    />
                    Có tệp đính kèm
                  </label>
                  <label className="checkbox-label">
                    <Checkbox
                      checked={onlyUnread}
                      onCheckedChange={(checked) =>
                        setOnlyUnread(checked === true)
                      }
                    />
                    Chỉ thư chưa đọc
                  </label>
                  <Popover.Close>
                    <Button
                      size="2"
                      onClick={() => {
                        const quote = (value: string) =>
                          `"${value.replaceAll('"', "")}"`;
                        setSearch(
                          [
                            fromFilter && `from:${quote(fromFilter)}`,
                            toFilter && `to:${quote(toFilter)}`,
                            subjectFilter && `subject:${quote(subjectFilter)}`,
                            withAttachment && "has:attachment",
                            onlyUnread && "is:unread",
                          ]
                            .filter(Boolean)
                            .join(" "),
                        );
                        setOpened(null);
                      }}
                    >
                      Tìm kiếm
                    </Button>
                  </Popover.Close>
                </Popover.Content>
              </Popover.Root>
            </TextField.Slot>
          </TextField.Root>
        </div>
        <div className="gmail-header-tools">
          <MailIcon
            label="Trợ giúp Gmail mô phỏng"
            onClick={() => setModal("help")}
          >
            <CircleHelp size={20} />
          </MailIcon>
          <MailIcon
            label="Cài đặt hộp thư"
            onClick={() => setPanel("settings")}
          >
            <Settings size={20} />
          </MailIcon>
          <Popover.Root open={profile} onOpenChange={setProfile}>
            <Popover.Trigger>
              <Button
                variant="ghost"
                className="mail-avatar"
                aria-label="Tài khoản và đăng xuất"
              >
                <Avatar
                  size="2"
                  radius="full"
                  fallback={account.name.split(" ").at(-1)?.[0] || "H"}
                />
              </Button>
            </Popover.Trigger>
            <Popover.Content size="3" className="gmail-account">
              <Avatar
                size="4"
                fallback={account.name.split(" ").at(-1)?.[0] || "H"}
                radius="full"
              />
              <strong>{account.name}</strong>
              <small>{account.email}</small>
              <Badge color="grass">Tài khoản giả lập</Badge>
              <Button
                variant="surface"
                onClick={() => {
                  mark(1, 3);
                  chooseLesson(1);
                  setToast("Đã đăng xuất an toàn khỏi hộp thư.");
                }}
              >
                <LogOut size={16} />
                Đăng xuất
              </Button>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
      <div className="mail-body complete-mail-body">
        <button
          type="button"
          className="mail-nav-scrim"
          aria-label="Đóng danh sách thư mục"
          onClick={() => setCollapsed(false)}
        />
        <aside className="mail-sidebar complete-mail-sidebar">
          <Button
            className={`compose-button ${lesson === 2 && currentStep === 0 ? "suggested" : ""}`}
            aria-label="Soạn thư"
            onClick={startCompose}
          >
            <PenLine size={22} />
            <span>Soạn thư</span>
          </Button>
          <nav aria-label="Thư mục hộp thư">
            {[...folders, ...(more ? moreFolders : [])].map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={folder === item.id ? "selected" : ""}
                onClick={() => setFolder(item.id)}
                title={item.label}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {folderCount(item.id) > 0 && <b>{folderCount(item.id)}</b>}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="more-folders"
              aria-label={more ? "Ẩn bớt" : "Danh sách mở rộng"}
              onClick={() => setMore(!more)}
            >
              {more ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
              <span>{more ? "Ẩn bớt" : "Danh sách mở rộng"}</span>
            </Button>
          </nav>
          <div className="labels-heading">
            <strong>Nhãn</strong>
            <MailIcon label="Tạo nhãn mới" onClick={() => setPanel("label")}>
              <Plus size={17} />
            </MailIcon>
          </div>
          <div className="custom-labels">
            {labels.map((label) => (
              <div key={label.id}>
                <Button
                  variant="ghost"
                  className={folder === `label:${label.id}` ? "selected" : ""}
                  onClick={() => setFolder(`label:${label.id}`)}
                  title={label.name}
                >
                  <Tag size={16} />
                  <span>{label.name}</span>
                </Button>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton
                      variant="ghost"
                      size="1"
                      aria-label={`Tùy chọn nhãn ${label.name}`}
                    >
                      <MoreVertical size={14} />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item
                      color="red"
                      onSelect={() => deleteLabel(label.id)}
                    >
                      Xóa nhãn (giữ lại thư)
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            ))}
          </div>
        </aside>
        <section
          className="mail-content complete-mail-content"
          aria-label="Nội dung hộp thư"
        >
          <div className="mail-toolbar complete-mail-toolbar">
            <div>
              {opened ? (
                <MailIcon
                  label="Quay lại danh sách thư"
                  onClick={() => setOpened(null)}
                >
                  <ChevronLeft size={20} />
                </MailIcon>
              ) : (
                <div className="mail-select">
                  <Checkbox
                    aria-label="Chọn tất cả thư trên trang"
                    checked={
                      selectedAll
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    disabled={folder === "drafts" || !visibleMails.length}
                    onCheckedChange={() => {
                      const ids = visibleMails.map((mail) => mail.id);
                      setSelected((previous) =>
                        selectedAll
                          ? previous.filter((id) => !ids.includes(id))
                          : [...new Set([...previous, ...ids])],
                      );
                    }}
                  />
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton
                        variant="ghost"
                        size="1"
                        aria-label="Tùy chọn chọn thư"
                      >
                        <ChevronDown size={12} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        onSelect={() =>
                          setSelected(visibleMails.map((mail) => mail.id))
                        }
                      >
                        Tất cả
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => setSelected([])}>
                        Bỏ chọn
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() =>
                          setSelected(
                            visibleMails
                              .filter((mail) => !mail.read)
                              .map((mail) => mail.id),
                          )
                        }
                      >
                        Chưa đọc
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() =>
                          setSelected(
                            visibleMails
                              .filter((mail) => mail.read)
                              .map((mail) => mail.id),
                          )
                        }
                      >
                        Đã đọc
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() =>
                          setSelected(
                            visibleMails
                              .filter((mail) => mail.star)
                              .map((mail) => mail.id),
                          )
                        }
                      >
                        Có gắn dấu sao
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              )}
              {targetIds.length > 0 ? (
                <>
                  <MailIcon
                    label="Lưu trữ thư"
                    onClick={() => action("archive")}
                  >
                    <Archive size={18} />
                  </MailIcon>
                  <MailIcon
                    label="Báo cáo thư rác"
                    onClick={() => action("spam")}
                  >
                    <OctagonAlert size={18} />
                  </MailIcon>
                  <MailIcon
                    label="Chuyển vào Thùng rác"
                    onClick={() => action("trash")}
                  >
                    <Trash2 size={18} />
                  </MailIcon>
                  <span className="toolbar-divider" />
                  <MailIcon
                    label="Đánh dấu chưa đọc"
                    onClick={() => action("unread")}
                  >
                    <Mail size={18} />
                  </MailIcon>
                  <MailIcon
                    label="Tạm ẩn thư"
                    onClick={() => setPanel("snooze")}
                  >
                    <Clock3 size={18} />
                  </MailIcon>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton
                        variant="ghost"
                        size="1"
                        aria-label="Di chuyển thư"
                        className="gmail-icon"
                      >
                        <FolderInput size={18} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item onSelect={() => action("inbox")}>
                        Hộp thư đến
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => action("archive")}>
                        Lưu trữ
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => action("purchase")}>
                        Giao dịch
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => action("spam")}>
                        Thư rác
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => action("trash")}>
                        Thùng rác
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                  {labelMenu()}
                </>
              ) : (
                <MailIcon
                  label="Làm mới hộp thư"
                  onClick={() => {
                    setSelected([]);
                    setToast(
                      "Hộp thư đã cập nhật. Đây là dữ liệu luyện tập trong phiên.",
                    );
                  }}
                >
                  <RotateCw size={18} />
                </MailIcon>
              )}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    variant="ghost"
                    size="1"
                    aria-label="Tùy chọn hộp thư"
                    className="gmail-icon"
                  >
                    <MoreVertical size={19} />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onSelect={() => setPanel("settings")}>
                    Cài đặt hộp thư
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => setPanel("contacts")}>
                    Danh bạ luyện tập
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onSelect={() => setPanel("templates")}>
                    Mẫu thư luyện tập
                  </DropdownMenu.Item>
                  {targetIds.length > 0 && <>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    disabled={!targetIds.length}
                    onSelect={() => action("read")}
                  >
                    Đánh dấu đã đọc
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    disabled={!targetIds.length}
                    onSelect={() => action("unread")}
                  >
                    Đánh dấu chưa đọc
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    disabled={!targetIds.length}
                    onSelect={() => action("important")}
                  >
                    Đánh dấu quan trọng
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    disabled={!targetIds.length}
                    onSelect={() => action("unimportant")}
                  >
                    Bỏ dấu quan trọng
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    disabled={!targetIds.length}
                    onSelect={() => action("restore")}
                  >
                    Khôi phục về Hộp thư đến
                  </DropdownMenu.Item>
                  </>}
                  {opened && (
                    <DropdownMenu.Item
                      disabled={!!opened.expiresAt}
                      onSelect={() =>
                        void downloadMail(opened, account.email).catch(() =>
                          setToast(
                            "Không tải được tệp đính kèm trong phiên này.",
                          ),
                        )
                      }
                    >
                      Tải thư xuống (.eml)
                    </DropdownMenu.Item>
                  )}
                  {folder === "trash" && (
                    <DropdownMenu.Item
                      disabled={!targetIds.length}
                      color="red"
                      onSelect={() => setPanel("delete")}
                    >
                      Xóa vĩnh viễn trong mô phỏng
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
            <div className="mail-pagination">
              <span>
                {folder === "drafts"
                  ? `${drafts.length} thư nháp`
                  : filteredCount
                    ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filteredCount)} trong số ${filteredCount}`
                    : "0 thư"}
              </span>
              <MailIcon
                label="Trang thư trước"
                disabled={page === 0}
                onClick={() => {
                  setPage(page - 1);
                  setOpened(null);
                }}
              >
                <ChevronLeft size={17} />
              </MailIcon>
              <MailIcon
                label="Trang thư tiếp theo"
                disabled={page >= lastPage}
                onClick={() => {
                  setPage(page + 1);
                  setOpened(null);
                }}
              >
                <ChevronRight size={17} />
              </MailIcon>
            </div>
          </div>
          {opened ? (
            <MailReader />
          ) : folder === "drafts" ? (
            <>
              <div className="folder-heading">
                Thư nháp <small>Được lưu tự động trong phiên thực hành</small>
              </div>
              {drafts.map((draft) => (
                <div className="draft-row" key={draft.id}>
                  <FileText size={17} />
                  <Button variant="ghost" onClick={() => openDraft(draft.id)}>
                    <span>Thư nháp</span>
                    <strong>{draft.subject || "(Chưa có tiêu đề)"}</strong>
                    <small>{draft.recipient || "Chưa có người nhận"}</small>
                  </Button>
                  <MailIcon
                    label={`Xóa bản nháp ${draft.subject || "chưa có tiêu đề"}`}
                    onClick={() => removeDraft(draft.id)}
                  >
                    <Trash2 size={17} />
                  </MailIcon>
                </div>
              ))}
              {!drafts.length && (
                <div className="empty-mail">
                  <FileText size={35} />
                  <h3>Chưa có thư nháp</h3>
                  <p>Thư đang soạn sẽ tự động xuất hiện ở đây.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {search ? (
                <div className="search-results-heading">
                  <span>
                    Kết quả cho: <strong>{search}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => setSearch("")}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              ) : folder === "inbox" && showCategories ? (
                <div
                  className="gmail-category-tabs"
                  role="tablist"
                  aria-label="Nhóm thư"
                >
                  {categories.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      role="tab"
                      aria-selected={category === item.id}
                      className={category === item.id ? "active" : ""}
                      onClick={() => setCategory(item.id)}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                      {mails.filter(
                        (mail) =>
                          isInFolder(mail, "inbox") &&
                          (mail.category || "primary") === item.id &&
                          !mail.read,
                      ).length > 0 && (
                        <b>
                          {
                            mails.filter(
                              (mail) =>
                                isInFolder(mail, "inbox") &&
                                (mail.category || "primary") === item.id &&
                                !mail.read,
                            ).length
                          }{" "}
                          mới
                        </b>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="folder-heading">
                  {currentTitle}
                  {folder === "spam" && (
                    <small>Thư bị đánh dấu là không mong muốn</small>
                  )}
                  {folder === "trash" && (
                    <small>Có thể khôi phục thư bằng menu thao tác</small>
                  )}
                </div>
              )}
              <div className="mail-list">
                {visibleMails.map((mail) => (
                  <div
                    className={`mail-row ${!mail.read ? "unread" : ""} ${selected.includes(mail.id) ? "row-selected" : ""}`}
                    key={mail.id}
                  >
                    <Checkbox
                      aria-label={`Chọn thư ${mail.subject}`}
                      checked={selected.includes(mail.id)}
                      onCheckedChange={() => toggleSelection(mail.id)}
                    />
                    <IconButton
                      variant="ghost"
                      size="1"
                      className={`star-button ${mail.star ? "starred" : ""}`}
                      aria-label={`${mail.star ? "Bỏ dấu sao" : "Gắn dấu sao"}: ${mail.subject}`}
                      onClick={() => toggleStar(mail.id)}
                    >
                      <Star
                        size={17}
                        fill={mail.star ? "currentColor" : "none"}
                      />
                    </IconButton>
                    <IconButton
                      variant="ghost"
                      size="1"
                      className={`important-button ${mail.important ? "marked" : ""}`}
                      aria-label={`${mail.important ? "Bỏ dấu quan trọng" : "Đánh dấu quan trọng"}: ${mail.subject}`}
                      onClick={() => toggleImportant(mail.id)}
                    >
                      <Bookmark
                        size={14}
                        fill={mail.important ? "currentColor" : "none"}
                      />
                    </IconButton>
                    <Button
                      variant="ghost"
                      className="mail-row-open"
                      onClick={() => openMail(mail)}
                    >
                      <span className="row-sender">
                        {mail.kind === "sent" || mail.kind === "scheduled"
                          ? `Đến: ${(mail.to || [mail.email]).join(", ")}`
                          : mail.sender}
                      </span>
                      <span className="row-subject">
                        {mail.labels?.map((id) => (
                          <i key={id} className="inline-label">
                            {labels.find((label) => label.id === id)?.name ||
                              id}
                          </i>
                        ))}
                        {mail.subject}
                        <span> – {mail.body.replace(/\n/g, " ")}</span>
                      </span>
                      {!!mail.attachments?.length && <Paperclip size={13} />}
                      <span className="row-time">{mail.time}</span>
                    </Button>
                    <div className="row-hover-actions">
                      <MailIcon
                        label={`Lưu trữ thư: ${mail.subject}`}
                        onClick={() => action("archive", [mail.id])}
                      >
                        <Archive size={17} />
                      </MailIcon>
                      <MailIcon
                        label={`Xóa thư: ${mail.subject}`}
                        onClick={() => action("trash", [mail.id])}
                      >
                        <Trash2 size={17} />
                      </MailIcon>
                      <MailIcon
                        label={`${mail.read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}: ${mail.subject}`}
                        onClick={() =>
                          action(mail.read ? "unread" : "read", [mail.id])
                        }
                      >
                        {mail.read ? (
                          <Mail size={17} />
                        ) : (
                          <MailOpen size={17} />
                        )}
                      </MailIcon>
                      <MailIcon
                        label={`Tạm ẩn thư: ${mail.subject}`}
                        onClick={() => {
                          setSelected([mail.id]);
                          setPanel("snooze");
                        }}
                      >
                        <Clock3 size={17} />
                      </MailIcon>
                    </div>
                  </div>
                ))}
              </div>
              {!visibleMails.length && (
                <div className="empty-mail">
                  <Inbox size={36} />
                  <h3>
                    {search
                      ? "Không tìm thấy thư phù hợp"
                      : "Chưa có thư trong mục này"}
                  </h3>
                  <p>
                    {search
                      ? "Thử từ khóa hoặc bộ lọc khác."
                      : "Thư được chuyển đến đây sẽ xuất hiện trong danh sách."}
                  </p>
                </div>
              )}
            </>
          )}
        </section>

      </div>
      {compose && <ComposeWindow />}
      <MailboxDialogs panel={panel} setPanel={setPanel} />
    </div>
  );
}
