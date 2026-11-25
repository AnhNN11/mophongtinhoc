"use client";
import { Button } from "@radix-ui/themes";
import Image from "next/image";
import { Icon } from "./icon";
import { lessons } from "../_lib/lesson-data";

import { useSimulation } from "./simulation-context";

export function LessonSidebar() {
  const { lesson, checks, setModal, chooseLesson } = useSimulation();
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="/"
        aria-label="Mầm Xanh – Trường Thiếu sinh quân miền Trung"
      >
        <Image
          className="school-logo"
          src="/mam-xanh-logo.png"
          alt="Logo Mầm Xanh, Trường Thiếu sinh quân miền Trung"
          width={68}
          height={68}
          priority
        />
        <span className="brand-name">
          MẦM XANH
          <small>
            TRƯỜNG THIẾU SINH QUÂN
            <br />
            MIỀN TRUNG
          </small>
        </span>
      </a>
      <div className="course-label">KHÔNG GIAN HỌC TẬP</div>
      <Button
        variant="soft"
        className="side-home"
        onClick={() => chooseLesson(2)}
      >
        <Icon name="grid" /> Phòng thực hành <span className="tiny-dot" />
      </Button>
      <div className="side-divider" />
      <div className="course-label">CHỦ ĐỀ 3</div>
      <p className="topic-title">
        Tổ chức lưu trữ, tìm kiếm
        <br />
        và trao đổi thông tin
      </p>
      <div className="current-chapter">
        <span>08</span>
        <div>
          <strong>Thư điện tử</strong>
          <small>Phần 3 · Thực hành</small>
        </div>
        <Icon name="chevron" size={16} />
      </div>
      <nav className="lesson-nav" aria-label="Các bài thực hành">
        {lessons.map((item, i) => (
          <Button
            variant="soft"
            key={item.title}
            aria-label={item.title}
            className={`lesson-nav-item ${lesson === i ? "active" : ""}`}
            onClick={() => chooseLesson(i)}
          >
            <span
              className={`lesson-number ${checks[i].every(Boolean) ? "complete" : ""}`}
            >
              {checks[i].every(Boolean) ? (
                <Icon name="check" size={14} />
              ) : (
                `0${i + 1}`
              )}
            </span>
            <span>
              {item.title}
              <small>
                {i === 0
                  ? "Đăng kí hộp thư mới"
                  : i === 1
                    ? "Đọc thư và đăng xuất"
                    : "Viết và gửi lời nhắn"}
              </small>
            </span>
            {lesson === i && <span className="nav-indicator" />}
          </Button>
        ))}
      </nav>
      <Button
        variant="soft"
        className="result-link"
        onClick={() => setModal("results")}
      >
        <Icon name="award" />
        Kết quả học tập
        <Icon name="chevron" size={15} />
      </Button>
      <div className="sidebar-bottom">
        <div className="little-note">
          <span className="little-note-icon">
            <Icon name="light" />
          </span>
          <strong>Học tập & rèn luyện</strong>
          <p>Kỉ luật · Chủ động · Sáng tạo</p>
          <span className="note-decoration">★</span>
        </div>
        <div className="book-source">
          <Icon name="book" size={16} />
          <span>
            SGK Tin học 6<small>Kết nối tri thức với cuộc sống</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
