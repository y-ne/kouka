import { Elysia } from "elysia";
import * as amqplib from "amqplib";
import type { Channel, ChannelModel } from "amqplib";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const connect = async (): Promise<void> => {
	try {
		const url = process.env.AMQP_URL!;

		connection = await amqplib.connect(url);
		channel = await connection.createChannel();

		console.log("[AMQP] Connected");

		connection.on("error", (err: Error) => {
			console.error("[AMQP] Connection error : ", err);
		});

		connection.on("close", () => {
			console.log("[AMQP] Connection closed");
		});
	} catch (error) {
		console.error("[AMQP] Connection failed : ", error);
		throw error;
	}
};

const publish = async (
	queue: string,
	data: Record<string, unknown>,
	options?: { persistent?: boolean },
): Promise<void> => {
	if (!channel) {
		throw new Error("[AMQP] not connected");
	}

	await channel.assertQueue(queue, { durable: true });

	channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
		persistent: options?.persistent ?? true,
	});

	console.log(`[AMQP] Published to queue : ${queue}`);
};

const consume = async (
	queue: string,
	handler: (data: Record<string, unknown>) => void | Promise<void>,
): Promise<void> => {
	if (!channel) {
		throw new Error("[AMQP] not connected");
	}

	await channel.assertQueue(queue, { durable: true });

	channel.consume(queue, async (msg) => {
		if (!msg) {
			console.error("[AMQP] Consumer cancelled by server");
			return;
		}

		try {
			const data = JSON.parse(msg.content.toString());
			await handler(data);
			channel!.ack(msg);
			console.log(`[AMQP] Message processed from queue : ${queue}`);
		} catch (error) {
			console.error("[AMQP] Error processing message : ", error);
			channel!.nack(msg, false, true);
		}
	});

	console.log(`[AMQP] Consumer started for queue : ${queue}`);
};

const close = async (): Promise<void> => {
	try {
		if (channel) await channel.close();
		if (connection) await connection.close();
		console.log("[AMQP] Disconnected");
	} catch (error) {
		console.error("[AMQP] Error closing connection : ", error);
	}
};

export const amqp = new Elysia({ name: "amqp" })
	.decorate("amqp", { publish, consume })
	.onStart(async () => {
		await connect();
	})
	.onStop(async () => {
		await close();
	});
