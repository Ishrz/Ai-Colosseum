interface JudgeEvaluation {
    solution_1_score: number;
    solution_2_score: number;
    solution_1_reasoning: string;
    solution_2_reasoning: string;
}
export declare const State: import("@langchain/langgraph").AnnotationRoot<{
    problem: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    solution_1: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    solution_2: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    judge: import("@langchain/langgraph").BaseChannel<JudgeEvaluation, JudgeEvaluation | import("@langchain/langgraph").OverwriteValue<JudgeEvaluation>, unknown>;
}>;
declare const _default: (problem: string) => Promise<import("@langchain/langgraph").StateType<{
    problem: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    solution_1: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    solution_2: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    judge: import("@langchain/langgraph").BaseChannel<JudgeEvaluation, JudgeEvaluation | import("@langchain/langgraph").OverwriteValue<JudgeEvaluation>, unknown>;
}>>;
export default _default;
//# sourceMappingURL=graph.service.d.ts.map