import {publicProcedure, router} from "./trpc"


export const appRouter = router({
    exampleApiRoute: publicProcedure.query(()=>{
        return "Hello"
    })
})

export type AppRouter = typeof appRouter