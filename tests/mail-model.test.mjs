import test from "node:test";
import assert from "node:assert/strict";
import {
  isInFolder,
  matchesSearch,
  parseRecipients,
  plainToHtml,
  safeLink,
  hasDraftContent,
  advanceMailTime,
} from "../app/_lib/mail-model.ts";
import { composeErrors, recipientListError } from "../app/_lib/validation.ts";
const mail = {
  id: 1,
  sender: "Thầy Nam",
  email: "thaynam@example.com",
  subject: "Phiếu học tập Tin học",
  body: "Nội dung luyện tập thư điện tử",
  time: "09:41",
  read: false,
  star: true,
  labels: ["school"],
  attachments: [
    {
      id: "a",
      name: "bai.txt",
      size: 10,
      type: "text/plain",
      url: "/practice/phieu-hoc-tap.txt",
    },
  ],
};
test("scheduled send and snooze run only when due, while deleted messages stay deleted", () => {
  const due = "2026-11-26T02:00:00Z",
    now = Date.parse(due);
  const scheduled = {
    ...mail,
    kind: "scheduled",
    inInbox: false,
    scheduledAt: due,
  };
  assert.equal(advanceMailTime(scheduled, now - 1), scheduled);
  assert.equal(advanceMailTime(scheduled, now).kind, "sent");
  assert.equal(advanceMailTime(scheduled, now).scheduledAt, undefined);
  const deleted = { ...scheduled, deleted: true };
  assert.equal(advanceMailTime(deleted, now), deleted);
  const snoozed = { ...mail, inInbox: false, snoozedUntil: due };
  assert.equal(advanceMailTime(snoozed, now - 1), snoozed);
  assert.equal(advanceMailTime(snoozed, now).inInbox, true);
  assert.equal(advanceMailTime(snoozed, now).snoozedUntil, undefined);
});
test("folder transitions keep archive, sent, spam and trash distinct", () => {
  assert.equal(isInFolder(mail, "inbox"), true);
  assert.equal(isInFolder({ ...mail, inInbox: false }, "inbox"), false);
  assert.equal(isInFolder({ ...mail, inInbox: false }, "all"), true);
  assert.equal(isInFolder({ ...mail, deleted: true }, "inbox"), false);
  assert.equal(isInFolder({ ...mail, deleted: true }, "trash"), true);
  assert.equal(isInFolder({ ...mail, spam: true }, "all"), false);
  assert.equal(isInFolder({ ...mail, spam: true }, "spam"), true);
  assert.equal(isInFolder({ ...mail, kind: "sent" }, "inbox"), false);
  assert.equal(isInFolder({ ...mail, kind: "sent" }, "sent"), true);
  assert.equal(isInFolder({ ...mail, kind: "scheduled" }, "sent"), false);
  assert.equal(isInFolder({ ...mail, kind: "scheduled" }, "scheduled"), true);
  assert.equal(
    isInFolder({ ...mail, snoozedUntil: "2099-01-01T00:00:00Z" }, "inbox"),
    false,
  );
  assert.equal(isInFolder(mail, "label:school"), true);
});
test("search combines quoted phrases and Gmail-style operators", () => {
  assert.equal(
    matchesSearch(
      mail,
      'from:"Thầy Nam" subject:"Phiếu học" has:attachment is:unread',
    ),
    true,
  );
  assert.equal(matchesSearch(mail, "is:read"), false);
  assert.equal(matchesSearch(mail, "is:starred"), true);
  assert.equal(matchesSearch(mail, "subject:khác"), false);
  assert.equal(
    matchesSearch(
      { ...mail, to: ["an@example.com"], cc: ["minh@example.com"] },
      "to:minh@example.com",
    ),
    true,
  );
});
test("To, Cc and Bcc each reject invalid addresses in recipient lists", () => {
  assert.deepEqual(parseRecipients("a@b.com, c@d.vn; e@f.edu.vn"), [
    "a@b.com",
    "c@d.vn",
    "e@f.edu.vn",
  ]);
  assert.equal(recipientListError("a@b.com, c@d.vn"), "");
  assert.equal(recipientListError("", false), "");
  assert.notEqual(recipientListError("a@b.com, sai@@gmail.com"), "");
  const draft = {
    recipient: "a@b.com",
    cc: "c@d.vn",
    bcc: "e@f.com",
    subject: "Thư thử",
    body: "Nội dung thực hành đủ dài",
  };
  assert.ok(Object.values(composeErrors(draft)).every((value) => !value));
  assert.notEqual(composeErrors({ ...draft, bcc: "sai" }).bcc, "");
  assert.notEqual(composeErrors({ ...draft, cc: "sai" }).cc, "");
});
test("plain text is escaped before becoming HTML and unsafe links are refused", () => {
  assert.equal(
    plainToHtml("<script>alert(1)</script>\nXin chào"),
    "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p><p>Xin chào</p>",
  );
  assert.equal(safeLink("javascript:alert(1)"), null);
  assert.equal(safeLink("data:text/html,<script>"), null);
  assert.equal(safeLink("https://example.com"), "https://example.com/");
  assert.equal(safeLink("mailto:an@example.com"), "mailto:an@example.com");
});
test("a draft with only Cc or an attachment is retained", () => {
  const base = {
    id: "draft",
    recipient: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    html: "",
    attachments: [],
    savedAt: 1,
  };
  assert.equal(hasDraftContent(base), false);
  assert.equal(hasDraftContent({ ...base, cc: "a@b.com" }), true);
  assert.equal(
    hasDraftContent({ ...base, attachments: mail.attachments }),
    true,
  );
});
