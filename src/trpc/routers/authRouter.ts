import { TRPCError } from "@trpc/server"
import { getPayloadClient } from "../../get-payload"
import { AuthCredentialsValidator } from "../../lib/validators/account-credentials-validator"
import { publicProcedure, router } from "../trpc"

export const authRouter = router({
    craetePayloadUser: publicProcedure.input(AuthCredentialsValidator).mutation(async ({ input }) => {
        const { email, password } = input

        console.log("DATA: ", email," ", password)
        const payload = await getPayloadClient()

        const { docs: users } = await payload.find({
            collection: "users",
            where: {
                email: {
                    equals: email
                }
            }
        })

        if (users.length !== 0) {
            throw new TRPCError({ code: "CONFLICT" })
        }

        await payload.create({
            collection: "users",
            //the types for collections will come from generate:types command -> src/payload-types.ts
            data: {
                email: email,
                password: password,
                role: "user"
            }
        })

        return {success: true, sentToEmail: email}
    })
})