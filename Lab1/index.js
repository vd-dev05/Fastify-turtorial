import fastify from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const app = fastify();
let cache;
app.post('/register', async (request, reply) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            throw new Error("Username or password is missing");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        cache = { email, Hashpassword: hashedPassword, password: password };


        return { email, Hashpassword: hashedPassword, password: password };
    } catch (error) {
        reply.code(400);
        return { error: error.message };
    }
});

app.post('/login', async (request, reply) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            throw new Error("Username or password is missing");
        }
        if (cache.email !== email) {
            throw new Error("Invalid email");
        }

        const isMatch = await bcrypt.compare(password, cache.Hashpassword);

        if (!isMatch) {
            throw new Error("Invalid password");
        }
        if (cache.password === password) {
            const token = jwt.sign({
                email,
                password
            }, "secret", {
                expiresIn: "1h",
            });
            console.log(token);

            reply.code(200);
            return { message: "Login successful", token };
        } else {
            console.log("failed");

        }
    } catch (error) {
        console.log(error);

        reply.code(400);
        return { error: error.message };
    }
})
function middlewareTokenUser(request, reply, done) {
    try {
        const token = request.query.token;
        const decoded = jwt.verify(token, "secret");
        if (decoded) {
            request.user = decoded;
            done();
        } else {
            throw new Error("Invalid token");
        }

    } catch (error) {
        console.log(error);
        reply.code(401);
        done(error);
        return { error: "Unauthorized query" };
    }

}
app.get('/profile', { preHandler: middlewareTokenUser }, async (request, reply) => {
    try {
        reply.code(200);
        return { user: request.user} 
    } catch (error) {
        reply.code(404);
        return { error: "Unauthorized user" };
    }
})

app.get("/", async (request, reply) => {
    return { hello: "world" };
});

app.listen({ port: 9999 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});