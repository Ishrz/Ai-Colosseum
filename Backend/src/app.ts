import express from "express";
import cors from "cors"
import morgan from "morgan"
import invokeRouter from "./routes/invoke.route.js"

import path from 'path';
import { fileURLToPath } from 'url';

const app =express()


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(morgan("dev"))
app.use(cors())
app.use(express.json())

// console.log(":::filename::::")
// console.log(__filename)
// console.log(":::dirname::::")
// console.log(__dirname)

app.use(express.static(path.join(process.cwd() ,  'public')));


app.use("/api/v1" , invokeRouter)

app.get("/api/v1/health" , (req,res) =>{
    res.status(200).json({
        message:"Server is running...",
        success:true
    })
})

app.get('*any', (req, res) => {
  res.sendFile(path.join(process.cwd() , 'public', 'index.html'));
});


export default app;
