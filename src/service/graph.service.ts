import {
  StateGraph,
  StateSchema,
  MessagesValue,
  ReducedValue,
  type CompiledGraph,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod";
import type { GraphNode } from "@langchain/langgraph";
import { mistralModel, cohereModel, giminiModel } from "./model.service.js";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent, providerStrategy } from "langchain";

const State = new StateSchema({
  messages: MessagesValue,

  solution_1: new ReducedValue(z.string().default(""), {
    reducer: (current, next) => {
      return next;
    },
  }),

  solution_2: new ReducedValue(z.string().default(""), {
    reducer: (current, next) => {
      return next;
    },
  }),

  judge_recommendation: new ReducedValue(
    z
      .object({
        solution_1_score: z.number().nullable().default(null),
        solution_2_score: z.number().nullable().default(null),
      })
      .default({
        solution_1_score: 0,
        solution_2_score: 0,
      }),
    {
      reducer: (current, next) => {
        return next;
      },
    }
  ),
});

const solution_node: GraphNode<typeof State> = async (state: typeof State) => {
  console.log(state);

  const [mistral_solution, cohore_solution] = await Promise.all([
    await mistralModel.invoke(state.messages[0].content),
    await cohereModel.invoke(state.messages[0].content),
  ]);

  return {
    solution_1: mistral_solution.text,
    solution_2: cohore_solution.text,
  };
};

const judge_node: GraphNode<typeof State> = async (state: typeof State) => {
  const { solution_1, solution_2 } = state;

  const evaluationSchema = z.object({
    solution_1_score: z.number().min(0).max(10),
    solution_2_score: z.number().min(0).max(10),
  });

  const structuredGimini = giminiModel.withStructuredOutput(evaluationSchema, {
    name: "evaluator",
    method: "functionCalling",
  });

  const result = await structuredGimini.invoke(
    `you are judge tasked with evaluating the quality of two solution to a problem. the problem is : ${state.messages[0].content} . the first solution is : ${solution_1} . the second solution is : ${solution_2}. please provide the score between 1 to 10 for each solutions, where 0 means solution is compeletly incorrect or irrelevant, and 10 means solution is perfect and fully addresses the problem.`
  );

  return {
    judge_recommendation: result,
  };
};

export default async (userMessage: string) => {
  const graph = new StateGraph(State)
    .addNode("solution_node", solution_node)
    .addNode("judge_node", judge_node)
    .addEdge(START, "solution_node")
    .addEdge("solution_node", "judge_node")
    .addEdge("judge_node", END)
    .compile();

  const result = await graph.invoke({
    messages: [new HumanMessage(userMessage)],
  });

  console.log("fetching result....");
  console.log(result);

  return result.messages;
};
