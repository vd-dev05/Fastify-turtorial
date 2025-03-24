import fastify from "fastify";
import dotenv from 'dotenv';
import amqp from 'amqplib';

dotenv.config();
const app = fastify({ logger: true });
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
let channel;
let order = [];
let dataUser ;
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('user.created', { durable: false });

        // channel.consume('user.created', (msg) => {
        //     if (msg) {
        //         const user = JSON.parse(msg.content.toString());
        //         console.log(msg);
                
        //         // const user = JSON.parse(msg.content.toString());
        //         app.log.info(`Received new user event: ${JSON.stringify(user)}`);
        //         channel.ack(msg);
        //     }
        // }, { noAck: false });
        channel.consume('user.created', (msg) => {
            if (msg) {
                // console.log(msg);
                console.log("Data Received: ", msg.content.toString());
                console.log("Data Received: ", JSON.parse(msg.content.toString()));
            }
        })
        app.log.info("Connected to RabbitMQ (User Service)");
    } catch (error) {
        console.log(error);

        app.log.error("RabbitMQ connection error:", err);
        process.exit(1);
    }
}
connectRabbitMQ()

app.get('/orders', async (request, reply) => {
    return [{ id: 1, item: "Sample Order", status: "pending" }];
  });
app.listen({port :3001} , (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info(`Server listening at ${address}`);
})