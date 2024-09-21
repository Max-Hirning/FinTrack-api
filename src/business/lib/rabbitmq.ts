import fastifyAmqp from "fastify-amqp";
import { emailService } from "../services/inform/email.service";
import {
    EmailType,
    RabbitMqEmailPayload,
    RabbitMqMessage,
    RabbitMqQueues,
} from "@/types/rabbitmq";

const setupEmailConsumer = (channel: fastifyAmqp.FastifyAmqpChannelObject) => {
    channel.assertQueue(RabbitMqQueues.email, { durable: false });
    channel.consume(RabbitMqQueues.email, async (msg: RabbitMqMessage) => {
        if (msg !== null) {
            const { emailType, user }: RabbitMqEmailPayload = JSON.parse(
                msg.content.toString(),
            );

            try {
                switch (emailType) {
                case EmailType.deleteUser:
                    await emailService.sendDeleteUserEmail(user);
                    break;
                case EmailType.updateUserEmail:
                    await emailService.sendUpdateUserEmailEmail(user);
                    break;
                case EmailType.updateUserPassword:
                    await emailService.sendUpdateUserPasswordEmail(user);
                    break;
                default:
                    console.warn("Unknown email type:", emailType);
                    break;
                }
            } catch (error) {
                console.error("Error processing email message:", error);
                // channel.nack(msg); // Optionally handle error by requeuing the message
            }
        }
        channel.ack(msg);
    });
};

const setupImageConsumer = (channel: fastifyAmqp.FastifyAmqpChannelObject) => {
    channel.assertQueue(RabbitMqQueues.image, { durable: false });
    channel.consume(RabbitMqQueues.image, async (msg: RabbitMqMessage) => {
    // Handle image processing logic here
        channel.ack(msg); // Acknowledge after processing
    });
};

const setupNotificationConsumer = (
    channel: fastifyAmqp.FastifyAmqpChannelObject,
) => {
    channel.assertQueue(RabbitMqQueues.notification, { durable: false });
    channel.consume(RabbitMqQueues.notification, async (msg: RabbitMqMessage) => {
    // Handle notification logic here
        channel.ack(msg); // Acknowledge after processing
    });
};

export { setupEmailConsumer, setupImageConsumer, setupNotificationConsumer };