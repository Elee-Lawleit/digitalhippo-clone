import { ExpressContext } from "@/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { PayloadRequest } from "payload/types";
import { User } from "@/payload-types";

const t = initTRPC.context<ExpressContext>().create();
const middleware = t.middleware

const isAuth = middleware(async({ctx: context, next})=>{
  const req = context.req as PayloadRequest

  const {user} = req as {user: User | null}

  if(!user || !user.id){
    throw new TRPCError({code: "UNAUTHORIZED"})
  }

  return next({
    ctx: {
      user
    }
  })

})

export const router = t.router
export const publicProcedure = t.procedure
//to actually run the middleware before anything else
export const privateProdecure = t.procedure.use(isAuth)