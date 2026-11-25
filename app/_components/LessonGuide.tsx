"use client";
import { Button, Progress } from "@radix-ui/themes";

import { Icon } from "./icon";
import { lessons } from "../_lib/lesson-data";

import { useSimulation } from "./simulation-context";

export function LessonGuide() {
  const {
    lesson,
    checks,
    mode,
    setModal,
    setBody,
    hint,
    setHint,
    mark,
    done,
    currentStep,
    progress,
    chooseLesson,
  } = useSimulation();
  return (
    <aside className="instruction-panel">
      <div className="instruction-title">
        <span>
          <Icon name="book" size={19} />
        </span>
        <h3>Nhiệm vụ của em</h3>
        <span className="instruction-count">0{lesson + 1}</span>
      </div>
      <div className="task-intro">
        <span className="task-kicker">BÀI THỰC HÀNH {lesson + 1}</span>
        <h3>{lessons[lesson].title}</h3>
        <p>
          {lesson === 2 ? (
            <>
              Gửi thư hỏi thăm một người bạn.
              <br />
              Hãy bắt đầu bằng một lời chào nhé!
            </>
          ) : lesson === 1 ? (
            "Vào hộp thư, đọc một lời nhắn và đăng xuất an toàn."
          ) : (
            "Tạo một hộp thư của riêng em bằng thông tin giả định."
          )}
        </p>
      </div>
      <div className="task-progress">
        <span>Tiến độ thực hiện</span>
        <strong>
          {done}/{lessons[lesson].steps.length} bước
        </strong>
        <Progress
          value={(done / lessons[lesson].steps.length) * 100}
          size="1"
          aria-label="Tiến độ bài thực hành"
        />
      </div>
      {mode === "guided" ? (
        <ol className="task-steps">
          {lessons[lesson].steps.map((step, i) => (
            <li
              key={step}
              className={`${checks[lesson][i] ? "done" : ""} ${currentStep === i ? "current" : ""}`}
            >
              <span className="step-number">
                {checks[lesson][i] ? <Icon name="check" size={13} /> : i + 1}
              </span>
              <div>
                <strong>{step}</strong>
                {currentStep === i && <p>{lessons[lesson].hints[i]}</p>}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="free-practice">
          <Icon name="send" size={30} />
          <strong>Đến lượt em khám phá!</strong>
          <p>
            Tự thực hiện các thao tác. Hệ thống vẫn ghi nhận tiến độ của em.
          </p>
        </div>
      )}
      {done === lessons[lesson].steps.length ? (
        <div className="task-success">
          <Icon name="award" size={24} />
          <strong>Em làm tốt lắm!</strong>
          <p>Đã hoàn thành bài thực hành này.</p>
          <Button
            variant="soft"
            onClick={() =>
              lesson === 2 ? setModal("results") : chooseLesson(lesson + 1)
            }
          >
            {lesson === 2 ? "Xem kết quả" : "Bài thực hành tiếp theo"}
            <Icon name="chevron" size={14} />
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant="soft"
            className="hint-button"
            aria-expanded={hint}
            onClick={() => setHint(!hint)}
          >
            <Icon name="light" size={17} />
            {hint ? "Ẩn gợi ý" : "Em cần một gợi ý?"}
            <Icon name="chevron" size={14} />
          </Button>
          {hint && (
            <div className="hint-content">
              {lessons[lesson].hints[Math.max(0, currentStep)]}
              {lesson === 2 && currentStep === 3 && (
                <Button
                  variant="soft"
                  onClick={() => {
                    setBody(
                      "Thúy thân mến,\n\nBạn học ở trường mới thế nào? Mình rất nhớ bạn và mong sớm gặp lại bạn. Hãy viết thư cho mình nhé!\n\nChúc bạn luôn vui và học tốt.\nBạn của Thúy,\nHà",
                    );
                    mark(2, 3);
                  }}
                >
                  Thử nội dung mẫu
                </Button>
              )}
            </div>
          )}
        </>
      )}
      <div className="safety-note">
        <Icon name="lock" size={15} />
        <p>
          <strong>An toàn để khám phá</strong>Thông tin và thư chỉ dùng trong mô
          phỏng, không gửi ra ngoài.
        </p>
      </div>
    </aside>
  );
}
