import {StateGraph,StateSchema,MessagesValue,   ReducedValue,type GraphNode, type CompiledGraph ,START,END,} from "@langchain/langgraph";
import {z} from "zod"


// type STATE1 ={
//     messages: typeof MessagesValue
// }

const State  = new StateSchema({
    messages : MessagesValue

})

export const hello = (State: typeof MessagesValue)=>{
    console.log("hello")

    return State
}

const tata = (State : typeof MessagesValue)=>{
    console.log("tata")

    return State
}


export default async ()=>{
    const graph = new StateGraph(State)
                .addNode("hello" , hello)
                .addNode("tata" , tata)
                .addEdge(START , "hello")
                .addEdge("hello" , "tata")
                .addEdge("tata" , END)
                .compile()

        await graph.invoke({})
}

