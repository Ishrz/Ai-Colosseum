import express from "express";
import GraphCall from "./service/graph.service.js"
const app =express()





app.get("/api/v1/query",async (req,res) =>{


    const result =await GraphCall("who is nikola tesla")

    // res.status(201).json({
    //     message:result
    // })

})





app.get("/api/v1/health" , (req,res) =>{
    res.status(200).json({
        message:"Server is running...",
        success:true
    })
})


export default app;
