import express from "express"
import { getPayloadClient } from "./get-payload"
import { nextApp, nextHandler } from "./next-utils"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter } from "./trpc"
import { inferAsyncReturnType } from "@trpc/server"
import bodyParser from "body-parser"
import { IncomingMessage } from "http"
import { stripeWebHookHandler } from "./webhooks"
import nextBuild from "next/dist/build"
import path from "path"
import { PayloadRequest } from "payload/types"
import {parse} from "url"

const app = express()

const PORT = Number(process.env.PORT) || 3000

//for trpc
const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
})

//the above should be telling us what we can get from the context but I guess we need to tell typescript that as well, so

//inferAsyncReturnType is coming from @trpc/server
export type ExpressContext = inferAsyncReturnType<typeof createContext>

//extending the type so we can receive the raw body of the stripe req
export type WebHookRequest = IncomingMessage & { rawBody: Buffer }

const start = async () => {
  const webhookMiddleware = bodyParser.json({
    verify: (req: WebHookRequest, _, buffer) => {
      req.rawBody = buffer
    },
  })

  app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebHookHandler)


    const payload = await getPayloadClient({
      initOptions: {
        express: app,
        onInit: async (cms) => {
          cms.logger.info(`Admin URL ${cms.getAdminURL()}`)
        },
      },
    })

  const cartRouter = express.Router()

  cartRouter.use(payload.authenticate)
  
  cartRouter.get("/", (req, res)=>{
    const request = req as PayloadRequest
    if(!request.user) return res.redirect("/sign-in?origin=cart")

    const parsedUrl = parse(req.url, true)
    return nextApp.render(req, res, "/cart", parsedUrl.query)
  })

  app.use("/cart", cartRouter)

  if(process.env.NEXT_BUILD){
    app.listen(PORT, async()=>{
      payload.logger.info("Next.js is building for production")
      // @ts-expect-error
      await nextBuild(path.join(__dirname, "../"))

      process.exit()
    })

    return
  }

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  )

  app.use((req, res) => nextHandler(req, res))

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js started")

    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      )
    })
  })
}

start()
