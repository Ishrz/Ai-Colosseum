import express from "express";
import cors from "cors"
import morgan from "morgan"
import invokeRouter from "./routes/invoke.route.js"

const app =express()

app.use(morgan("dev"))
app.use(cors())
app.use(express.json())


app.use("/api/v1" , invokeRouter)

app.get("/api/v1/health" , (req,res) =>{
    res.status(200).json({
        message:"Server is running...",
        success:true
    })
})


export default app;
