import { Text } from "@radix-ui/themes";
import { CircleAlert, CircleCheck } from "lucide-react";

export function FieldFeedback({
  id,
  error,
  success,
}: {
  id: string;
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  const StatusIcon = error ? CircleAlert : CircleCheck;
  return (
    <Text
      as="p"
      id={id}
      size="1"
      className={`field-feedback ${error ? "invalid" : "valid"}`}
      role={error ? "alert" : "status"}
    >
      <StatusIcon size={13} aria-hidden="true" />
      <span>{error || success}</span>
    </Text>
  );
}
