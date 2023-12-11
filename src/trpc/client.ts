import {createTRPCReact} from "@trpc/react-query"

//the generic is going to contain entire types for our backend
export const trpc = createTRPCReact<>({})