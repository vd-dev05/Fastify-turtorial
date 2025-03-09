const fastifyPlugin = require('fastify-plugin');

// routes
async function routes (fastify, options) {
    fastify.get('/api/v1', (request, reply) => {
        reply.send({
            success : true,
            message : "fastify api"
        });
    });
}

module.exports = fastifyPlugin(routes);

