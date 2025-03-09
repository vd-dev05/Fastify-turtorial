const Fastify = require('fastify')
const dotenv = require('dotenv')
dotenv.config()
require('module-alias').addAlias('@api', __dirname + '/api')


const routes = require('@api/routes/routes.js')


// config fastify
const fastify = Fastify({
    logger: true
  })
const port = process.env.PORT ||  3001


// routes
fastify.register(routes)

// run server
const start = async () => {
    try {
        await fastify.listen({
            port : port,
            host : '0.0.0.0'
        })
        console.log(`server listening on http://localhost:${port}`);
        
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}
start()

