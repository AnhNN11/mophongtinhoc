"use client";
import { DropdownMenu, IconButton, Select, Tooltip } from "@radix-ui/themes";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RemoveFormatting,
  Quote,
  Palette,
  Highlighter,
  IndentIncrease,
  IndentDecrease,
} from "lucide-react";

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip content={label}>
      <IconButton
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        size="1"
        variant={active ? "soft" : "ghost"}
        className="format-tool"
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
const colors = [
  "#202124",
  "#5f6368",
  "#1a73e8",
  "#188038",
  "#d93025",
  "#9334e6",
  "#e37400",
  "#ffffff",
];
export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            bullet: e.isActive("bulletList"),
            numbered: e.isActive("orderedList"),
            font: e.getAttributes("textStyle").fontFamily || "Arial",
            size: e.getAttributes("textStyle").fontSize || "13px",
            undo: e.can().undo(),
            redo: e.can().redo(),
          }
        : null,
  });
  if (!editor) return null;
  return (
    <div
      className="format-toolbar"
      role="toolbar"
      aria-label="Định dạng nội dung thư"
    >
      <Tool
        label="Hoàn tác văn bản"
        disabled={!state?.undo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 size={16} />
      </Tool>
      <Tool
        label="Làm lại văn bản"
        disabled={!state?.redo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 size={16} />
      </Tool>
      <span className="format-separator" />
      <Select.Root
        value={state?.font || "Arial"}
        onValueChange={(font) =>
          editor.chain().focus().setFontFamily(font).run()
        }
      >
        <Select.Trigger
          aria-label="Phông chữ"
          variant="ghost"
          className="font-select"
        />
        <Select.Content>
          <Select.Item value="Arial">Sans Serif</Select.Item>
          <Select.Item value="Georgia">Serif</Select.Item>
          <Select.Item value="monospace">Cố định</Select.Item>
          <Select.Item value="Verdana">Verdana</Select.Item>
          <Select.Item value="Tahoma">Tahoma</Select.Item>
        </Select.Content>
      </Select.Root>
      <Select.Root
        value={state?.size || "13px"}
        onValueChange={(size) => editor.chain().focus().setFontSize(size).run()}
      >
        <Select.Trigger aria-label="Cỡ chữ" variant="ghost" />
        <Select.Content>
          <Select.Item value="10px">Nhỏ</Select.Item>
          <Select.Item value="13px">Bình thường</Select.Item>
          <Select.Item value="18px">Lớn</Select.Item>
          <Select.Item value="24px">Rất lớn</Select.Item>
        </Select.Content>
      </Select.Root>
      <span className="format-separator" />
      <Tool
        label="In đậm"
        active={state?.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </Tool>
      <Tool
        label="In nghiêng"
        active={state?.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </Tool>
      <Tool
        label="Gạch chân"
        active={state?.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={16} />
      </Tool>
      <Tool
        label="Gạch ngang"
        active={state?.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </Tool>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            type="button"
            size="1"
            variant="ghost"
            aria-label="Màu chữ"
          >
            <Palette size={17} />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Màu chữ</DropdownMenu.Label>
          {colors.map((color) => (
            <DropdownMenu.Item
              key={color}
              onSelect={() => editor.chain().focus().setColor(color).run()}
            >
              <span className="color-swatch" style={{ background: color }} />
              {
                (
                  {
                    "#202124": "Đen",
                    "#5f6368": "Xám",
                    "#1a73e8": "Xanh dương",
                    "#188038": "Xanh lá",
                    "#d93025": "Đỏ",
                    "#9334e6": "Tím",
                    "#e37400": "Cam",
                    "#ffffff": "Trắng",
                  } as Record<string, string>
                )[color]
              }
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            type="button"
            size="1"
            variant="ghost"
            aria-label="Màu nền chữ"
          >
            <Highlighter size={17} />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {["#fff59d", "#b7e1cd", "#aecbfa", "#f4cccc"].map((color) => (
            <DropdownMenu.Item
              key={color}
              onSelect={() =>
                editor.chain().focus().setBackgroundColor(color).run()
              }
            >
              <span className="color-swatch" style={{ background: color }} />
              {color}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Item
            onSelect={() => editor.chain().focus().unsetBackgroundColor().run()}
          >
            Bỏ màu nền
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <span className="format-separator" />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            type="button"
            size="1"
            variant="ghost"
            aria-label="Căn lề"
          >
            <AlignLeft size={17} />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {[
            { id: "left", label: "Căn trái", icon: AlignLeft },
            { id: "center", label: "Căn giữa", icon: AlignCenter },
            { id: "right", label: "Căn phải", icon: AlignRight },
            { id: "justify", label: "Căn đều", icon: AlignJustify },
          ].map((item) => (
            <DropdownMenu.Item
              key={item.id}
              onSelect={() =>
                editor.chain().focus().setTextAlign(item.id).run()
              }
            >
              <item.icon size={16} />
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Tool
        label="Danh sách đánh số"
        active={state?.numbered}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={17} />
      </Tool>
      <Tool
        label="Danh sách dấu đầu dòng"
        active={state?.bullet}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={17} />
      </Tool>
      <Tool
        label="Tăng thụt lề danh sách"
        disabled={!editor.can().sinkListItem("listItem")}
        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
      >
        <IndentIncrease size={16} />
      </Tool>
      <Tool
        label="Giảm thụt lề danh sách"
        disabled={!editor.can().liftListItem("listItem")}
        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
      >
        <IndentDecrease size={16} />
      </Tool>
      <Tool
        label="Trích dẫn"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={16} />
      </Tool>
      <Tool
        label="Xóa định dạng"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        <RemoveFormatting size={17} />
      </Tool>
    </div>
  );
}
