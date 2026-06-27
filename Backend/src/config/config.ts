import dotenv from "dotenv"

dotenv.config()


type CONFIG = {
    readonly GOOGLE_API_KEY : string,
    readonly MISTRAL_API_KEY : string,
    readonly COHORE_API_KEY : string
}

const config : CONFIG={
    GOOGLE_API_KEY : process.env.GOOGLE_API_KEY || "",
    MISTRAL_API_KEY : process.env.MISTRAL_API_KEY || "",
    COHORE_API_KEY : process.env.COHORE_API_KEY || ""
}



export default config

