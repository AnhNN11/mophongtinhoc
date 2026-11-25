import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import "./_styles/classroom.css";
import "./_styles/mailbox.css";
import "./_styles/lesson-guide.css";
import "./_styles/message.css";
import "./_styles/account.css";
import "./_styles/dialogs.css";
import "./_styles/validation.css";
import "./_styles/responsive.css";
import "./_styles/gmail-complete.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mầm Xanh · Tin học 6 · Thực hành thư điện tử",
  description:
    "Mô phỏng tương tác Bài 8: tạo tài khoản, đăng nhập, đọc thư, soạn và gửi thư điện tử. Học bằng cách làm, an toàn để khám phá.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Theme
          appearance="light"
          accentColor="grass"
          grayColor="olive"
          radius="small"
          panelBackground="solid"
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
