import {Router} from  "express"
import {invoke} from "../controllers/invoke.controller.js"

const invokeRouter = Router()


invokeRouter.post("/invoke", invoke)


export default invokeRouter