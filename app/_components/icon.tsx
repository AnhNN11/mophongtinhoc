import {
  BookOpen,
  LayoutGrid,
  Mail,
  Send,
  Inbox,
  Star,
  FileText,
  ChevronRight,
  Check,
  CircleHelp,
  RotateCcw,
  Search,
  Menu,
  Plus,
  X,
  Paperclip,
  Trash2,
  ArrowLeft,
  LockKeyhole,
  Award,
  LogOut,
  Eye,
  Download,
  Lightbulb,
  Maximize2,
  type LucideIcon,
} from "lucide-react";

const icons = {
  book: BookOpen,
  grid: LayoutGrid,
  mail: Mail,
  send: Send,
  inbox: Inbox,
  star: Star,
  file: FileText,
  chevron: ChevronRight,
  check: Check,
  help: CircleHelp,
  refresh: RotateCcw,
  search: Search,
  menu: Menu,
  plus: Plus,
  close: X,
  attach: Paperclip,
  trash: Trash2,
  arrow: ArrowLeft,
  lock: LockKeyhole,
  award: Award,
  logout: LogOut,
  eye: Eye,
  download: Download,
  light: Lightbulb,
  expand: Maximize2,
} satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      strokeWidth={1.7}
      className={className}
      aria-hidden="true"
    />
  );
}
