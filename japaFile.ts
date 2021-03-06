import "reflect-metadata"
import { configure } from "japa"
import sourceMapSupport from "source-map-support"
import getPort from "get-port"
import { join } from "path"

process.env.NODE_ENV = "testing"
process.env.ADONIS_ACE_CWD = join(__dirname)
process.env.LASTFM_API_KEY = "fake_lastfm_api_key"

sourceMapSupport.install({ handleUncaughtExceptions: false })

const startHttpServer = async () => {
  const { Ignitor } = await import("@adonisjs/core/build/src/Ignitor")
  process.env.PORT = String(await getPort())
  await new Ignitor(__dirname).httpServer().start()
}

configure({
  files: ["test/**/*.spec.ts"],
  before: [startHttpServer],
})
