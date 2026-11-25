import test from "node:test";
import assert from "node:assert/strict";
import {
  emailError,
  usernameError,
  nameError,
  passwordError,
  confirmationError,
  registrationErrors,
  composeErrors,
} from "../app/_lib/validation.ts";

test("email: accepts common complete addresses", () => {
  for (const address of [
    "hahai6a@gmail.com",
    "thuyk39@example.com",
    "an.nguyen+lop6@school.edu.vn",
    "a@b.vn",
  ])
    assert.equal(emailError(address), "", address);
});
test("email: rejects incomplete, whitespace, repeated @ and malformed dots or domain labels", () => {
  for (const address of [
    "",
    "an",
    "an@gmail",
    "an@@gmail.com",
    "@gmail.com",
    "an@",
    "an @gmail.com",
    " an@gmail.com",
    "an@gmail.com ",
    ".an@gmail.com",
    "an.@gmail.com",
    "an..nguyen@gmail.com",
    "an@gmail..com",
    "an@-gmail.com",
    "an@gmail-.com",
    "án@gmail.com",
    "an@gm_ail.com",
    "an@gmail.c",
    "a".repeat(65) + "@gmail.com",
    "an@" + "a".repeat(64) + ".com",
  ])
    assert.notEqual(emailError(address), "", address);
});
test("username: enforces length, lowercase ASCII and correct dot placement", () => {
  for (const value of ["nguyenan6a", "ha.hai6"])
    assert.equal(usernameError(value), "", value);
  for (const value of [
    "",
    "abc",
    "A123456",
    "nguyễn",
    "nguyen an",
    "an@gmail.com",
    ".nguyenan",
    "nguyenan.",
    "nguyen..an",
    "a".repeat(31),
  ])
    assert.notEqual(usernameError(value), "", value);
});
test("names: accepts Vietnamese names and rejects digits or whitespace-only values", () => {
  assert.equal(nameError("Nguyễn Hoàng Hải"), "");
  assert.equal(nameError("O'Connor"), "");
  for (const value of ["", "   ", "Nguyễn123", "123", "---"])
    assert.notEqual(nameError(value), "", value);
});
test("password and confirmation: changing the original invalidates the confirmation immediately", () => {
  assert.equal(passwordError("ThucHanh6!"), "");
  for (const value of ["", "1234", "12345678", "abcdefgh", "Thuc Hanh6!"])
    assert.notEqual(passwordError(value), "", value);
  assert.equal(confirmationError("ThucHanh6!", "ThucHanh6!"), "");
  assert.notEqual(confirmationError("ThucHanh7!", "ThucHanh6!"), "");
  assert.notEqual(confirmationError("ThucHanh6!", ""), "");
});
test("submit and live validation share the same field rules", () => {
  const valid = {
    last: "Nguyễn",
    first: "An",
    username: "nguyenan6a",
    password: "ThucHanh6!",
    confirm: "ThucHanh6!",
  };
  assert.ok(
    Object.values(registrationErrors(valid)).every((value) => value === ""),
  );
  assert.notEqual(registrationErrors({ ...valid, confirm: "Sai" }).confirm, "");
  const message = {
    recipient: "thuyk39@example.com",
    subject: "Thư hỏi thăm",
    body: "Thúy thân mến, chúc bạn học tốt!",
  };
  assert.ok(
    Object.values(composeErrors(message)).every((value) => value === ""),
  );
  for (const [field, value] of [
    ["recipient", "an@@gmail.com"],
    ["subject", "   "],
    ["body", "ngắn"],
  ])
    assert.notEqual(composeErrors({ ...message, [field]: value })[field], "");
});
