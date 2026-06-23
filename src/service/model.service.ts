import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatMistralAI} from "@langchain/mistralai"
import {ChatCohere} from "@langchain/cohere"
import config from "../config/config.js";

export const giminiModel = new ChatGoogleGenerativeAI({
    model:"gemini-2.5-flash",
    apiKey: config.GOOGLE_API_KEY
})

export const mistralModel = new ChatMistralAI({
    model:"mistral-small-latest",
    apiKey: config.MISTRAL_API_KEY
})

export const cohereModel = new ChatCohere({
    model:"command-a-03-2025",
    apiKey: config.COHORE_API_KEY
})