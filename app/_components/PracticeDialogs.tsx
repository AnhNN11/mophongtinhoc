"use client";

import { Button, Callout, Dialog, Flex, IconButton } from "@radix-ui/themes";
import { Icon } from "./icon";
import { useSimulation } from "./simulation-context";
import { lessons } from "../_lib/lesson-data";

export function PracticeDialogs() {
  const {
    modal,
    setModal,
    toast,
    setToast,
    completed,
    checks,
    chooseLesson,
    downloadResult,
    reset,
    undoSnapshot,
    undoAction,
  } = useSimulation();
  return (
    <>
      {toast && (
        <Callout.Root role="status" className="toast" size="1">
          <Callout.Icon>
            <Icon name="check" size={18} />
          </Callout.Icon>
          <Callout.Text>{toast}</Callout.Text>
          {undoSnapshot && (
            <Button size="1" variant="ghost" onClick={undoAction}>
              {undoSnapshot.label}
            </Button>
          )}
          <IconButton
            size="1"
            variant="ghost"
            aria-label="Đóng thông báo"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={15} />
          </IconButton>
        </Callout.Root>
      )}
      <Dialog.Root
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <Dialog.Content
          maxWidth="500px"
          className="practice-dialog"
          aria-describedby="practice-dialog-description"
        >
          <Dialog.Close>
            <IconButton
              className="modal-close"
              variant="ghost"
              size="1"
              aria-label="Đóng"
            >
              <Icon name="close" size={19} />
            </IconButton>
          </Dialog.Close>
          <span className="modal-symbol">
            <Icon
              name={
                modal === "results"
                  ? "award"
                  : modal === "reset"
                    ? "refresh"
                    : "book"
              }
              size={26}
            />
          </span>
          <Dialog.Title>
            {modal === "results"
              ? "Kết quả rèn luyện"
              : modal === "reset"
                ? "Bắt đầu lượt thực hành mới?"
                : "Hướng dẫn thực hành"}
          </Dialog.Title>
          <Dialog.Description
            id="practice-dialog-description"
            size="2"
            color="gray"
            mb="4"
          >
            {modal === "results"
              ? `Đã hoàn thành ${completed}/3 bài thực hành · ${checks.flat().filter(Boolean).length}/12 thao tác.`
              : modal === "reset"
                ? "Tiến độ, tài khoản và thư trong lượt thực hành hiện tại sẽ được đặt lại."
                : "Phần 3, Bài 8 – SGK Tin học 6, Kết nối tri thức với cuộc sống (trang 34–35)."}
          </Dialog.Description>
          {modal === "help" && (
            <>
              <ol className="help-list">
                <li>
                  <strong>Tạo tài khoản:</strong> Bài này mở thẳng màn hình đăng
                  ký. Chọn loại tài khoản, điền thông tin giả định và xác nhận.
                </li>
                <li>
                  <strong>Đăng nhập & đọc thư:</strong> Dùng tài khoản vừa tạo
                  hoặc tài khoản mẫu. Mở một thư, sau đó nháy ảnh đại diện để
                  đăng xuất.
                </li>
                <li>
                  <strong>Soạn & gửi thư:</strong> Nhập người nhận, tiêu đề, nội
                  dung rồi gửi. Có thể đính kèm tệp, tối đa 10 MB/tệp.
                </li>
              </ol>
              <Callout.Root size="1" color="gold" my="4">
                <Callout.Text>
                  Em có thể chọn bất kì bài nào. Tiến độ được lưu trên trình
                  duyệt; tài khoản, mật khẩu và thư chỉ tồn tại trong phiên mở
                  trang. Không có thư được gửi ra ngoài.
                </Callout.Text>
              </Callout.Root>
              <Dialog.Close>
                <Button>
                  Em đã sẵn sàng
                  <Icon name="chevron" size={15} />
                </Button>
              </Dialog.Close>
            </>
          )}
          {modal === "results" && (
            <>
              <div className="result-rows">
                {lessons.map((l, i) => (
                  <Button
                    key={l.title}
                    variant="surface"
                    onClick={() => {
                      chooseLesson(i);
                      setModal(null);
                    }}
                  >
                    <span
                      className={`result-check ${checks[i].every(Boolean) ? "finished" : ""}`}
                    >
                      <Icon
                        name={checks[i].every(Boolean) ? "check" : l.icon}
                        size={19}
                      />
                    </span>
                    <span>
                      <strong>{l.title}</strong>
                      <small>
                        {checks[i].filter(Boolean).length}/{l.steps.length} thao
                        tác hoàn thành
                      </small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </Button>
                ))}
              </div>
              <p className="result-detail">
                Tải lại trang sẽ giữ tiến độ, nhưng bắt đầu một phiên hộp thư
                mới.
              </p>
              <Button onClick={downloadResult} mt="4">
                <Icon name="download" size={16} />
                Tải kết quả thực hành
              </Button>
            </>
          )}
          {modal === "reset" && (
            <Flex gap="3" justify="end" mt="5">
              <Dialog.Close>
                <Button variant="surface">Tiếp tục học</Button>
              </Dialog.Close>
              <Button onClick={reset}>Bắt đầu lại</Button>
            </Flex>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
