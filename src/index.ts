import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import * as morgan from 'morgan'
import { port } from "./config"
import { validationResult } from "express-validator"


function handleError(err,req,res,next){
    res.status(err.statusCode || 500).send({message: err.message}/*being sent as a json*/)
}


AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
    app.use(morgan('tiny'))
    app.use(bodyParser.json())

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, 
            ...route.Validation,
            async (req: Request, res: Response, next: Function) => {
            try{
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array() });
                }
                const result = await (new (route.controller as any))[route.action](req, res, next)
                res.json(result)
            }catch(error){
                next(error)//handle errors
            }
        })
    })

    
    app.use(handleError)
    app.listen(port)

 

    console.log(`Express server has started on port ${port}.` )

}).catch(error => console.log(error))