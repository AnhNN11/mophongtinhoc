"use client";

import { Button, Progress, Tooltip } from "@radix-ui/themes";
import { Icon } from "./_components/icon";
import { LessonSidebar } from "./_components/LessonSidebar";
import { LessonGuide } from "./_components/LessonGuide";
import { PracticeBrowser } from "./_components/PracticeBrowser";
import { PracticeDialogs } from "./_components/PracticeDialogs";
import { SimulationProvider, useSimulation } from "./_components/simulation-context";

function PracticePage() {
  const { lesson, completed, progress, setModal } = useSimulation();
  return (
    <div className="app-shell">
      <LessonSidebar />
      <main className="practice-main">
        <header className="practice-top">
          <div>
            <p className="practice-eyebrow">TIN HỌC 6 · BÀI 8 · PHẦN 3</p>
            <h1>Thực hành thư điện tử</h1>
          </div>
          <div className="practice-actions">
            <Button variant="ghost" size="2" onClick={() => setModal("help")}>
              <Icon name="help" size={17} /> Hướng dẫn
            </Button>
            <Tooltip content="Đặt lại tài khoản, thư và tiến độ thực hành">
              <Button variant="surface" size="2" onClick={() => setModal("reset")}>
                <Icon name="refresh" size={16} /> Làm lại
              </Button>
            </Tooltip>
          </div>
        </header>
        <LessonGuide />
        <PracticeBrowser key={lesson} />
        <footer className="practice-foot">
          <span><Icon name="lock" size={13} /> Mô phỏng an toàn · Không gửi thư ra ngoài</span>
          <Button size="1" variant="ghost" onClick={() => setModal("results")}>
            Tiến độ: {completed}/3 bài
            <Progress value={progress} size="1" aria-label="Tiến độ toàn bài" />
          </Button>
        </footer>
      </main>
      <PracticeDialogs />
    </div>
  );
}

export default function Home() {
  return <SimulationProvider><PracticePage /></SimulationProvider>;
}
