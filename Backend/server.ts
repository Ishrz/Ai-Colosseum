import config from "./src/config/config.js"
import app from "./src/app.js"

const PORT = process.env.PORT || 10000


app.listen(3000, ()=>{
    console.log("Server is connected to port : ", PORT)
})