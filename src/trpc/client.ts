import { createTRPCReact } from "@trpc/react-query"
import { AppRouter } from "./"

//the generic is going to contain entire types for our backend
export const trpc = createTRPCReact<AppRouter>({})