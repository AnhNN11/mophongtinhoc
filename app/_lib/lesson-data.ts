import type { IconName } from "../_components/icon";
import { emailError } from "./validation";

export type Mail = {
  id: number;
  sender: string;
  email: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  star: boolean;
  attachments?: Attachment[];
  from?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  html?: string;
  kind?: "received" | "sent" | "scheduled";
  category?: "primary" | "promotions" | "social" | "updates";
  inInbox?: boolean;
  deleted?: boolean;
  spam?: boolean;
  important?: boolean;
  purchase?: boolean;
  labels?: string[];
  snoozedUntil?: string;
  scheduledAt?: string;
  expiresAt?: string;
};
export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};
export type Draft = {
  id: string;
  recipient: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  html: string;
  attachments: Attachment[];
  expiresAt?: string;
  savedAt: number;
};
export const initialMail: Mail[] = [
  {
    id: 1,
    sender: "Phạm Thanh Nam",
    email: "thaynam@example.com",
    subject: "Phiếu học tập Tin học 6",
    body: "Chào em,\n\nThầy gửi em phiếu học tập Bài 8: Thư điện tử. Em hãy thực hành tạo tài khoản, đăng nhập, đọc thư và gửi một lá thư cho bạn.\n\nChúc em có một buổi học thật thú vị!\nThầy Nam",
    time: "09:41",
    read: false,
    star: false,
    attachments: [
      {
        id: "worksheet",
        name: "Phieu-hoc-tap.txt",
        size: 230,
        type: "text/plain",
        url: "/practice/phieu-hoc-tap.txt",
      },
    ],
  },
  {
    id: 2,
    sender: "Nguyễn Thúy",
    email: "thuyk39@example.com",
    subject: "Chào bạn, mình là Thúy!",
    body: "Hà thân mến,\n\nLâu rồi chúng mình chưa gặp nhau. Bạn học ở trường mới thế nào? Mình rất mong nhận được thư của bạn.\n\nChúc bạn luôn vui và học tốt!\nBạn của Hà,\nThúy",
    time: "08:30",
    read: false,
    star: false,
  },
  {
    id: 3,
    sender: "Cô Hương",
    email: "cohuong@example.com",
    subject: "Chào mừng em đến lớp 6A",
    body: "Chào em,\n\nChào mừng em đến với lớp 6A. Hãy cùng nhau tạo nên những kỉ niệm đẹp trong năm học này nhé!\n\nCô Hương",
    time: "Hôm qua",
    read: false,
    star: false,
  },
  {
    id: 4,
    sender: "Câu lạc bộ Tin học",
    email: "clbtinhoc@example.com",
    subject: "Cùng khám phá thế giới số",
    body: "Chào bạn,\n\nCâu lạc bộ Tin học sinh hoạt vào chiều thứ Sáu. Tuần này chúng mình sẽ cùng tìm hiểu cách sử dụng thư điện tử.\n\nHẹn gặp bạn!",
    time: "Hôm qua",
    read: true,
    star: true,
  },
  {
    id: 5,
    sender: "Lớp 6A",
    email: "lop6a@example.com",
    subject: "Ảnh kỉ niệm ngày khai trường",
    body: "Chào các bạn,\n\nMột năm học mới đã bắt đầu! Cùng lưu lại những kỉ niệm thật đẹp của lớp mình nhé.\n\nTập thể lớp 6A",
    time: "Thứ Hai",
    read: true,
    star: false,
  },
];
initialMail.push(
  {
    id: 6,
    sender: "Thư viện trường",
    email: "thuvien@example.com",
    subject: "Sách mới trong tháng",
    body: "Chào các em,\nThư viện đã bổ sung sách khoa học và kĩ năng số. Mời các em đến đọc vào giờ ra chơi.",
    time: "Thứ Hai",
    read: true,
    star: false,
    category: "updates",
  },
  {
    id: 7,
    sender: "Câu lạc bộ Mầm Xanh",
    email: "mamxanh@example.com",
    subject: "Hẹn gặp tại ngày hội đọc sách",
    body: "Chào bạn,\nCùng tham gia ngày hội đọc sách và chia sẻ cuốn sách yêu thích với các bạn nhé!",
    time: "Thứ Hai",
    read: false,
    star: false,
    category: "social",
  },
  {
    id: 8,
    sender: "Nhà sách Học đường",
    email: "nhasach@example.com",
    subject: "Giới thiệu bộ sách khoa học",
    body: "Chào em,\nNhà sách giới thiệu một số tựa sách khoa học dành cho học sinh. Đây là thư giới thiệu minh họa trong mô phỏng.",
    time: "Thứ Hai",
    read: true,
    star: false,
    category: "promotions",
  },
  {
    id: 9,
    sender: "Ban cán sự lớp",
    email: "bancansu@example.com",
    subject: "Lịch trực nhật tuần này",
    body: "Chào các bạn,\nCác tổ thực hiện trực nhật theo lịch đã thống nhất. Cảm ơn các bạn đã cùng giữ gìn lớp học sạch đẹp.",
    time: "Thứ Sáu",
    read: true,
    star: false,
    important: true,
  },
  {
    id: 10,
    sender: "Nguyễn Minh",
    email: "minh6a@example.com",
    subject: "Cùng ôn tập Tin học nhé",
    body: "An thân mến,\nCuối tuần chúng mình cùng ôn tập cách soạn và gửi thư điện tử nhé. Bạn thấy thế nào?\nMinh",
    time: "Thứ Sáu",
    read: false,
    star: false,
  },
  {
    id: 11,
    sender: "Giáo viên chủ nhiệm",
    email: "gvcn@example.com",
    subject: "Thông báo sinh hoạt lớp",
    body: "Chào các em,\nBuổi sinh hoạt lớp sẽ bắt đầu sau tiết học cuối ngày thứ Sáu. Các em chuẩn bị nội dung chia sẻ về tuần học nhé.",
    time: "Thứ Năm",
    read: true,
    star: false,
    important: true,
  },
  {
    id: 12,
    sender: "Tổ học tập số 1",
    email: "to1@example.com",
    subject: "Góp ý bài thuyết trình",
    body: "Chào bạn,\nNhóm mình đã hoàn thành dàn ý bài thuyết trình. Bạn hãy đọc và gửi góp ý nhé.\nCảm ơn bạn!",
    time: "Thứ Năm",
    read: true,
    star: false,
  },
);
export const lessons = [
  {
    title: "Tạo tài khoản",
    subtitle: "Bắt đầu hành trình kết nối",
    icon: "plus" as IconName,
    steps: [
      "Chọn Tạo tài khoản",
      "Điền thông tin tài khoản",
      "Xác nhận và hoàn tất",
    ],
    hints: [
      "Nháy nút Tạo tài khoản trên trang đăng nhập.",
      "Điền lần lượt họ tên, ngày sinh, giới tính, địa chỉ Gmail và mật khẩu giả định. Thông tin khôi phục có thể bỏ qua; nếu thêm điện thoại, hãy nhập mã luyện tập.",
      "Kiểm tra thông tin, đọc điều kiện mô phỏng và xác nhận để hoàn tất. Tài khoản trẻ em có thêm tình huống người giám hộ hỗ trợ.",
    ],
  },
  {
    title: "Đăng nhập & đọc thư",
    subtitle: "Khám phá hộp thư của em",
    icon: "inbox" as IconName,
    steps: [
      "Nhập địa chỉ thư điện tử",
      "Nhập mật khẩu và đăng nhập",
      "Mở và đọc một bức thư",
      "Đăng xuất khỏi hộp thư",
    ],
    hints: [
      "Nhập địa chỉ tài khoản vừa tạo hoặc tài khoản mẫu được cung cấp.",
      "Nhập đúng mật khẩu luyện tập, sau đó nháy Đăng nhập.",
      "Nháy vào tên người gửi hoặc tiêu đề trong Hộp thư đến.",
      "Nháy ảnh đại diện ở góc trên bên phải, rồi chọn Đăng xuất.",
    ],
  },
  {
    title: "Soạn & gửi thư",
    subtitle: "Gửi lời nhắn đầu tiên",
    icon: "send" as IconName,
    steps: [
      "Mở cửa sổ soạn thư",
      "Nhập địa chỉ người nhận",
      "Viết tiêu đề thư",
      "Soạn nội dung thư",
      "Kiểm tra và gửi thư",
    ],
    hints: [
      "Nháy nút Soạn thư ở góc trái hộp thư.",
      "Em có thể gửi cho bạn Thúy: thuyk39@example.com. Địa chỉ cần có kí tự @.",
      "Viết một tiêu đề rõ ràng, ví dụ: Thư hỏi thăm bạn.",
      "Hãy có lời chào, điều em muốn chia sẻ và lời kết. Em có thể đính kèm một tệp.",
      "Đọc lại địa chỉ, tiêu đề, nội dung rồi nháy Gửi. Xem lại thư trong mục Đã gửi.",
    ],
  },
];
export const emptyChecks = () => [
  [false, false, false],
  [false, false, false, false],
  [false, false, false, false, false],
];
export const validEmail = (value: string) => !emailError(value);
