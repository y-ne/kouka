import { Elysia } from "elysia";
import * as amqplib from "amqplib";
import { Channel } from "amqplib";

// i dunno why amqplib.Connection give me this type error. it will be any until i fix this part.
// Type ChannelModel is missing the following properties from type Connection: serverProperties, expectSocketClose, sentSinceLastCheck, recvSinceLastCheck, sendMessage (ts 2739)
let connection: any = null;
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
): Promise<void> => {
	if (!channel) {
		throw new Error("[AMQP] not connected");
	}

	await channel.assertQueue(queue, { durable: true });

	channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
		persistent: true,
	});

	console.log(`[AMQP] Published to queue : ${queue}`);
};

const close = async (): Promise<void> => {
	try {
		if (channel) await channel.close();
		if (connection) await connection.close();
		console.log("[AMQP] Disconnected");
	} catch (error) {
		console.error("[AMQP] Error closing connection:", error);
	}
};

export const amqp = new Elysia({ name: "amqp" })
	.decorate("amqp", { publish })
	.onStart(async () => {
		await connect();
	})
	.onStop(async () => {
		await close();
	});
