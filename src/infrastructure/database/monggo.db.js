import fastifyPlugin from 'fastify-plugin'
import fastifyMongo from '@fastify/mongodb'

async function dbMongoConection(fastify, options) {
    fastify.register(fastifyMongo, {
        url: process.env.MONGGO_URI
    })
}
export default fastifyPlugin(dbMongoConection)