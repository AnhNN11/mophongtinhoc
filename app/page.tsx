"use client";

import {
  Avatar,
  Badge,
  Button,
  Progress,
  SegmentedControl,
  Tabs,
  Tooltip,
} from "@radix-ui/themes";
import { Icon } from "./_components/icon";
import { LessonSidebar } from "./_components/LessonSidebar";
import { LessonGuide } from "./_components/LessonGuide";
import { PracticeBrowser } from "./_components/PracticeBrowser";
import { PracticeDialogs } from "./_components/PracticeDialogs";
import {
  SimulationProvider,
  useSimulation,
} from "./_components/simulation-context";
import { lessons } from "./_lib/lesson-data";

function PracticePage() {
  const {
    lesson,
    chooseLesson,
    checks,
    completed,
    progress,
    mode,
    setMode,
    setModal,
    wide,
    setWide,
  } = useSimulation();
  return (
    <div className="app-shell">
      <LessonSidebar />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Phòng thực hành</span>
            <Icon name="chevron" size={13} />
            <strong>Bài 8: Thư điện tử</strong>
          </div>
          <div className="topbar-right">
            <Button variant="ghost" size="1" onClick={() => setModal("help")}>
              <Icon name="help" size={16} />
              Hướng dẫn
            </Button>
            <span className="topbar-divider" />
            <Avatar size="2" fallback="HS" color="gold" radius="full" />
            <span className="student-name">
              Học sinh<small>Học tập & rèn luyện</small>
            </span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                TIN HỌC 6 · KHÔNG GIAN HỌC TẬP
              </div>
              <h1>Thực hành thư điện tử</h1>
              <p>Thao tác thực tế, rèn luyện kĩ năng sử dụng thư điện tử.</p>
            </div>
            <Tooltip content="Xóa tiến độ và bắt đầu lượt thực hành mới">
              <Button
                size="2"
                variant="surface"
                onClick={() => setModal("reset")}
                className="restart"
              >
                <Icon name="refresh" size={15} />
                <span>Làm lại từ đầu</span>
              </Button>
            </Tooltip>
          </div>
          <section className="hero-banner" aria-label="Tổng quan bài thực hành">
            <span className="exercise-insignia">
              <Icon name="mail" size={27} />
              <span>★</span>
            </span>
            <div className="hero-copy">
              <span className="hero-tag">BÀI 08 · PHẦN 3</span>
              <h2>Rèn kĩ năng. Vững kết nối.</h2>
              <p>Tạo tài khoản · Đọc thư · Soạn và gửi thư</p>
            </div>
            <div className="hero-progress">
              <span>TIẾN ĐỘ RÈN LUYỆN</span>
              <strong>
                {completed}
                <span>/ 3 nhiệm vụ</span>
              </strong>
              <Progress
                value={progress}
                size="1"
                color="gold"
                aria-label="Tiến độ toàn bài"
              />
            </div>
          </section>
          <div className="practice-heading">
            <div>
              <Icon name="grid" size={19} />
              <h2>Khu vực thực hành</h2>
              <Badge variant="soft" size="1" color="grass">
                <span className="status-dot" />
                Môi trường mô phỏng
              </Badge>
            </div>
            <Button
              size="1"
              variant="surface"
              onClick={() => setWide(!wide)}
              aria-pressed={!wide}
            >
              <Icon name="book" size={15} />
              {wide ? "Hiện nhiệm vụ" : "Ẩn nhiệm vụ"}
            </Button>
            <SegmentedControl.Root
              size="1"
              value={mode}
              onValueChange={(v) => setMode(v as "guided" | "free")}
              aria-label="Chế độ thực hành"
            >
              <SegmentedControl.Item value="guided">
                Có hướng dẫn
              </SegmentedControl.Item>
              <SegmentedControl.Item value="free">
                Tự thực hành
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </div>
          <Tabs.Root
            value={String(lesson)}
            onValueChange={(v) => chooseLesson(Number(v))}
          >
            <Tabs.List
              className="lesson-tabs"
              size="2"
              aria-label="Bài thực hành"
            >
              {lessons.map((item, i) => (
                <Tabs.Trigger key={item.title} value={String(i)}>
                  <span
                    className={`tab-number ${checks[i].every(Boolean) ? "complete" : ""}`}
                  >
                    {checks[i].every(Boolean) ? (
                      <Icon name="check" size={13} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  {item.title}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {lessons.map((item, i) => (
              <Tabs.Content key={item.title} value={String(i)}>
                <div className={`practice-layout ${wide ? "wide" : ""}`}>
                  <PracticeBrowser />
                  <LessonGuide />
                </div>
              </Tabs.Content>
            ))}
          </Tabs.Root>
          <div className="bottom-tip">
            <Icon name="light" size={16} />
            <p>
              <strong>Ghi nhớ:</strong> Kiểm tra người nhận, tiêu đề, nội dung
              và tệp đính kèm trước khi gửi thư.
            </p>
          </div>
          <footer className="page-footer">
            <span>Mầm Xanh · Trường Thiếu sinh quân miền Trung</span>
            <span>SGK Tin học 6 · Kết nối tri thức với cuộc sống</span>
          </footer>
        </main>
      </div>
      <PracticeDialogs />
    </div>
  );
}

export default function Home() {
  return (
    <SimulationProvider>
      <PracticePage />
    </SimulationProvider>
  );
}
