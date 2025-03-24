import fastify from "fastify";
import dotenv from "dotenv";
import amqp from 'amqplib'

dotenv.config();
const app = fastify({ logger: true });
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('user.created', { durable: false });
        app.log.info("Connected to RabbitMQ (User Service)");
    } catch (error) {
        console.log(error);

        app.log.error("RabbitMQ connection error:", err);
        process.exit(1);
    }
}
connectRabbitMQ()

app.post('/users', async (request, reply) => {
    try {
        const { name, email } = request.body;
        const user = { id: Date.now(), name, email };

        
        if (channel) {
            channel.sendToQueue('user.created', Buffer.from(JSON.stringify(user)));
            app.log.info("User created event sent to queue");
        }

        return reply.code(201).send(user);
    } catch (err) {
        app.log.error(err);
        return reply.code(500).send({ error: "Internal Server Error" });
    }
});

app.get('/users', async (request, reply) => {
    try {
        
    } catch (error) {
        app.log.error(err);
        return reply.code(500).send({ error: "Internal Server Error" });
        
    }
})
app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info(`Server listening at ${address}`);
})
