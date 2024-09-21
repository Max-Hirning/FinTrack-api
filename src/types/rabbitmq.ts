import { User } from "@prisma/client";

enum EmailType {
  deleteUser = "deleteUser",
  updateUserEmail = "updateUserEmail",
  updateUserPassword = "updateUserPassword",
}
enum RabbitMqQueues {
  image = "image",
  email = "email",
  notification = "notification",
}

interface RabbitMqMessage {
  content: Buffer;
  properties: {
    [key: string]: unknown; // Adjust as needed for specific properties
  };
}
interface RabbitMqEmailPayload {
  emailType: EmailType;
  user: Pick<User, "email" | "firstName" | "lastName">;
}

export { EmailType, RabbitMqQueues };

export type { RabbitMqMessage, RabbitMqEmailPayload };
