"use client";
import { Button } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { Icon } from "./icon";
import { lessons } from "../_lib/lesson-data";
import { useSimulation } from "./simulation-context";

export function LessonGuide() {
  const { lesson, checks, showTasks, setShowTasks, done, currentStep, chooseLesson, setModal } = useSimulation();
  const task = lessons[lesson];
  const complete = currentStep === -1;
  return (
    <section className="practice-task" aria-label="Nhiệm vụ thực hành">
      <div className="task-summary">
        <div className={`task-marker ${complete ? "is-complete" : ""}`}>
          <Icon name={complete ? "check" : task.icon} size={20} />
        </div>
        <div className="task-current">
          <h2>{complete ? `Đã hoàn thành: ${task.title}` : `${currentStep + 1}/${task.steps.length} · ${task.steps[currentStep]}`}</h2>
          <p>{complete ? "Em có thể luyện tập tiếp hoặc chuyển sang bài tiếp theo." : task.hints[currentStep]}</p>
        </div>
        <Button variant="soft" size="1" aria-expanded={showTasks} aria-controls={showTasks ? "task-checklist" : undefined} onClick={() => setShowTasks(!showTasks)}>
          Các bước <span>{done}/{task.steps.length}</span>
          <ChevronDown size={14} className={showTasks ? "is-open" : ""} />
        </Button>
        {complete && (
          <Button size="1" onClick={() => lesson === 2 ? setModal("results") : chooseLesson(lesson + 1)}>
            {lesson === 2 ? "Xem kết quả" : "Bài tiếp theo"}<Icon name="chevron" size={14} />
          </Button>
        )}
      </div>
      {showTasks && (
        <ol id="task-checklist" className="task-checklist">
          {task.steps.map((step, i) => (
            <li key={step} className={`${checks[lesson][i] ? "is-done" : ""} ${currentStep === i ? "is-current" : ""}`} aria-current={currentStep === i ? "step" : undefined}>
              <span>{checks[lesson][i] ? <Icon name="check" size={13} /> : i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
