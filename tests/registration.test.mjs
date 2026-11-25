import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyRegistration, birthdayErrors, registrationAge, phoneError,
  recoveryEmailError, verificationError, signupErrors, signupStepErrors,
} from "../app/_lib/registration.ts";

const today = new Date(2026, 10, 25);
const valid = {
  ...emptyRegistration(), accountType: "personal", last: "Nguyễn", first: "An",
  birthDay: "25", birthMonth: "11", birthYear: "2000", gender: "undisclosed",
  username: "nguyenan6a", password: "ThucHanh6!", confirm: "ThucHanh6!",
};

test("birthday: validates actual calendar dates, leap years, future and malformed input", () => {
  for (const [birthDay, birthMonth, birthYear] of [["29", "2", "2024"], ["25", "11", "2026"], ["31", "12", "2000"]]) {
    assert.ok(Object.values(birthdayErrors({ birthDay, birthMonth, birthYear }, today)).every((error) => !error));
  }
  for (const [birthDay, birthMonth, birthYear] of [["29", "2", "2025"], ["31", "4", "2020"], ["26", "11", "2026"], ["1", "1", "2027"], ["0", "1", "2010"], ["1", "13", "2010"], ["1", "1", "1899"], ["1e1", "1", "2010"], ["", "", ""]]) {
    assert.ok(Object.values(birthdayErrors({ birthDay, birthMonth, birthYear }, today)).some(Boolean), `${birthDay}/${birthMonth}/${birthYear}`);
  }
});
test("age: the exact birthday controls the personal versus guardian route", () => {
  const child = { ...valid, birthYear: "2011", birthDay: "26" };
  assert.equal(registrationAge(child, today), 14);
  assert.notEqual(signupErrors(child, today).ageConsent, "");
  assert.equal(signupErrors({ ...child, accountType: "child" }, today).ageConsent, "");
  assert.equal(registrationAge({ ...child, birthDay: "25" }, today), 15);
  assert.equal(signupErrors({ ...child, birthDay: "25" }, today).ageConsent, "");
  assert.equal(registrationAge({ ...child, birthDay: "" }, today), null);
});
test("recovery: optional information is accepted, invalid or self-referencing email is rejected", () => {
  for (const phone of ["", "0900000000", "02412345678", "+84 900 000 000", "+12025550123"])
    assert.equal(phoneError(phone), "", phone);
  for (const phone of ["   ", "090abc0000", "1234567890", "+0012345678", "+123", "090000000000", "+1234567890123456"])
    assert.notEqual(phoneError(phone), "", phone);
  assert.equal(recoveryEmailError("", valid.username), "");
  assert.equal(recoveryEmailError("phuhuynh@example.com", valid.username), "");
  for (const address of ["sai@diachi", "nguyenan6a@gmail.com", "Nguyen.An6a+test@googlemail.com"])
    assert.notEqual(recoveryEmailError(address, valid.username), "", address);
});
test("verification: only the active six-digit sample code is accepted", () => {
  assert.equal(verificationError("123456", "123456"), "");
  for (const [input, expected] of [["12345", "123456"], ["abcdef", "123456"], ["654321", "123456"], ["123456", ""]])
    assert.notEqual(verificationError(input, expected), "");
});
test("signup: each page validates its fields while completion checks the whole registration", () => {
  assert.ok(Object.values(signupErrors(valid, today)).every((error) => !error));
  const partial = { ...emptyRegistration(), last: "Nguyễn", first: "An" };
  assert.ok(Object.values(signupStepErrors(partial, "name")).every((error) => !error));
  assert.ok(Object.values(signupStepErrors(partial, "personal")).some(Boolean));
  assert.notEqual(signupErrors({ ...valid, accountType: "constructor" }, today).accountType, "");
  assert.notEqual(signupErrors({ ...valid, gender: "constructor" }, today).gender, "");
  assert.notEqual(signupErrors({ ...valid, gender: "custom", customGender: "" }, today).customGender, "");
  assert.equal(signupErrors({ ...valid, gender: "custom", customGender: "Phi nhị nguyên" }, today).customGender, "");
});
