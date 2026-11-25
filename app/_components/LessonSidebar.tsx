"use client";
import { Button } from "@radix-ui/themes";
import Image from "next/image";
import { Icon } from "./icon";
import { lessons } from "../_lib/lesson-data";
import { useSimulation } from "./simulation-context";

export function LessonSidebar() {
  const { lesson, checks, setModal, chooseLesson } = useSimulation();
  return (
    <aside className="course-rail">
      <div className="course-brand">
        <Image src="/mam-xanh-logo.png" alt="Logo Mầm Xanh, Trường Thiếu sinh quân miền Trung" width={64} height={64} priority />
        <span>MẦM XANH<small>Trường Thiếu sinh quân<br />miền Trung</small></span>
      </div>
      <div className="course-caption">BÀI 8 · THƯ ĐIỆN TỬ<small>Phần 3 — Thực hành</small></div>
      <nav className="course-lessons" aria-label="Các bài thực hành">
        {lessons.map((item, i) => (
          <Button
            variant="soft"
            key={item.title}
            aria-label={item.title}
            aria-current={lesson === i ? "step" : undefined}
            className={`course-lesson ${lesson === i ? "is-active" : ""}`}
            onClick={() => chooseLesson(i)}
          >
            <span className={`course-number ${checks[i].every(Boolean) ? "is-complete" : ""}`}>
              {checks[i].every(Boolean) ? <Icon name="check" size={15} /> : i + 1}
            </span>
            <span className="course-lesson-name">{item.title}<small>{checks[i].filter(Boolean).length}/{item.steps.length} bước hoàn thành</small></span>
          </Button>
        ))}
      </nav>
      <Button variant="ghost" className="course-results" onClick={() => setModal("results")}>
        <Icon name="award" size={18} /> Kết quả học tập
      </Button>
      <p className="course-source">SGK Tin học 6<small>Kết nối tri thức với cuộc sống</small></p>
    </aside>
  );
}
