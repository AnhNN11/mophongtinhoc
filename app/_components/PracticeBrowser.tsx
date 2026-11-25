"use client";
import { Button } from "@radix-ui/themes";

import { Icon } from "./icon";

import { useSimulation } from "./simulation-context";
import { Mailbox } from "./Mailbox";
import { AccountScreens } from "./AccountScreens";
export function PracticeBrowser() {
  const { screen, mailFullscreen, setMailFullscreen } = useSimulation();
  return (
    <div
      className={`browser-window ${mailFullscreen ? "mail-fullscreen" : ""}`}
    >
      <div className="browser-chrome">
        <div className="traffic-lights">
          <i />
          <i />
          <i />
        </div>
        <div className="address">
          <Icon name="lock" size={12} />
          <span>
            {screen === "mail" ? "mail.google.com" : "accounts.google.com"}
          </span>
          <span className="sim-label">MÔ PHỎNG</span>
        </div>
        <Button
          variant="soft"
          className="icon-button expand-button"
          aria-label={
            mailFullscreen
              ? "Thoát toàn màn hình hộp thư"
              : "Toàn màn hình hộp thư"
          }
          onClick={() => setMailFullscreen(!mailFullscreen)}
        >
          <Icon name="expand" size={15} />
        </Button>
      </div>

      {screen === "mail" ? <Mailbox /> : <AccountScreens />}
    </div>
  );
}
