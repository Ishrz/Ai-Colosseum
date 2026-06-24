import app from "./src/app.js"
import config from "./src/config/config.js"
import graphCall  from "./src/service/graph.service.js"

graphCall()


app.listen(3000, ()=>{
    console.log("Server is connected to port : ", 3000)
})