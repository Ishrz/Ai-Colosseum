import express from "express";
import GraphCall from "./service/graph.service.js"
const app =express()



app.use(express.json())

app.get("/api/v1/query",async (req,res) =>{
    try {

        const { message } = req.query as { message?: string }
        if (!message) {
            return res.status(400).json({
                message: "Missing message query parameter"
            })
        }

        const result = await GraphCall(message)

        res.status(201).json({
            message: result
        })
        
    } catch (error) {
        res.json({
            message:"something went wrong",
            error:error
        })
    }

})





app.get("/api/v1/health" , (req,res) =>{
    res.status(200).json({
        message:"Server is running...",
        success:true
    })
})


export default app;
