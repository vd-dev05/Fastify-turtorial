import Fastify from "fastify";
import dotenv from "dotenv";
import Redis from "ioredis";
import postgres from "@fastify/postgres";

dotenv.config();

const app = Fastify({ logger: true });

// Kết nối Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
//   username: process.env.REDIS_USERNAME, // nếu có
//   password: process.env.REDIS_PASSWORD, // nếu có
});

// Cấu hình TTL cho cache
const CACHE = process.env.CACHE_TTL || 60;

async function startServer() {
  try {
    // Đăng ký plugin PostgreSQL và chờ hoàn tất
    await app.register(postgres, {
      connectionString: process.env.DB_URL,
    });
    app.log.info("Database connected");

    // Định nghĩa route /products
    app.get('/products', async (request, reply) => {
      try {
        const cacheKey = 'products';
        const cacheData = await redis.get(cacheKey);
       
        
        if (cacheData) {
          app.log.info("Data fetched from cache");
          return reply.send(JSON.parse(cacheData));
        }
        const client = await app.pg.connect();
        // Lấy kết quả từ database (sử dụng "rows" thay vì "row")
        const { rows } = await client.query("SELECT * FROM products");
        console.log(rows);
        
        client.release();

        // Lưu dữ liệu vào cache Redis với TTL
        await redis.set(cacheKey, JSON.stringify(rows), 'EX', CACHE);
        app.log.info("Data fetched from database");
        return reply.send(rows);
      } catch (error) {
        app.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
      }
    });

    // Route test
    app.get("/", async (request, reply) => {
      return { hello: "world" };
    });

    // Khởi động server sau khi đăng ký plugin thành công
    await app.listen({ port: process.env.PORT || 3001, host: "0.0.0.0" });
    app.log.info(`Server listening on ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
