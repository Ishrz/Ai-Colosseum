import {StateGraph,StateSchema,MessagesValue,   ReducedValue, type CompiledGraph ,START,END,} from "@langchain/langgraph";
import {z} from "zod"
import type {GraphNode, GraphNodeTypes} from "@langchain/langgraph"
import type { TypeOf } from "zod/v3";
import {mistralModel,cohereModel} from "./model.service.js"
import { HumanMessage } from "@langchain/core/messages";


const State  = new StateSchema({
    messages : MessagesValue,

    solution_1: new ReducedValue(z.string().default(""),{
        reducer: (current,next) =>{
            return next
        }
    }),

    solution_2: new ReducedValue(z.string().default(""),{
        reducer: (current,next) =>{
            return next
        }
    }),
    
    judge_recommendation: new ReducedValue(z.object().default({
        solution_1_score:0,
        solution_2_score:0,
    }),{
        reducer: (current,next) =>{
            return next
        }
    })
})

const solution_node : GraphNode<typeof State> = async (state : typeof State) =>{

    console.log(state)

    const [mistral_solution,cohore_solution] = await Promise.all([
        await mistralModel.invoke(state.messages[0].content),
        await cohereModel.invoke(state.messages[0].content)
    ])

    return {
        solution_1:mistral_solution.text,
        solution_2:cohore_solution.text
    }
}




export default async (userMessage : string)=>{
    const graph = new StateGraph (State)
                .addNode("solution_node" , solution_node)
                .addEdge(START , "solution_node")
                .addEdge("solution_node" , END)
                .compile()

        const result = await graph.invoke({
            messages:[ new HumanMessage(userMessage)]
        })

        console.log("fetching result....")
        console.log(result)

        return result.messages
}

