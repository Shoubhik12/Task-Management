const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const app = express()
app.use(express.json())
const {initialiseDatabase} = require("./db/db.connect")
const Project = require("./models/project.model")
const Tag = require("./models/tag.model")
const Team = require("./models/team.model")
const Task = require("./models/task.model")
const User = require("./models/user.model")
const bcrypt = require("bcrypt")


const jwtSecret = "task_secret"


const corsOptions= {
    origin:"*",
    credentials:true
}

app.use(cors(corsOptions))

initialiseDatabase()

async function createUser(userData) {
    try {
        const newUser = new User(userData)
        return await newUser.save()
    } catch (error) {
        throw error;
    }
}




app.post("/auth/signup", async (req,res) => {
    try {
        const {name,email,password} = req.body

        const hasedPass = await bcrypt.hash(password,10)

        const user = await createUser({name,email,password:hasedPass})

        if(user){
            res.status(201).json({message:"User created."})
        }
        else{
            res.status(404).json({error:"Inavlid data."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
} )

const verifyJWT = (req,res,next)=>{
     const token = req.headers["authorization"]

     if(!token){
        return res.status(401).json({message:'No token provided.'})
     }

     try {
        const tokenDecoded = jwt.verify(token,jwtSecret)
        req.user = tokenDecoded
        next()
     } catch (error) {
        return res.status(403).json({message:'Invalid token.'})
     }
}

app.get("/", async (req,res) => {
    res.json({message:"The site is working."})
})


app.post("/auth/login", async (req,res)=>{
    try {
        const {email,password} = req.body
    
        const user = await User.findOne({email})
        
        if(!user){
            res.status(404).json({error:"Invalid email."})
        }

        const valid = await bcrypt.compare(password,user.password)

        if(!valid){
            res.status(401).json({error:"Inavid password."})
        }

        const token = jwt.sign({role:"admin"},jwtSecret,{expiresIn:"24h"})

        if(token){
            res.status(200).json({message:"Login successful",token})
        }

    } catch (error) {
        res.status(500).json({error:error})
    }
})

app.get("/admin/api/data",verifyJWT,(req,res)=>{
    res.json({message:"Protected route accessible"})
})


async function createTasks(task) {
    
    try {
        const newTask = new Task(task)
        return await newTask.save()
    } catch (error) {
        throw error
    }
}

app.post("/tasks",async (req,res) => {
    try {
        const task = await createTasks(req.body)
        if(task){
            res.status(201).json({message:"Task created successfully."})
        }
        else{
            res.status(400).json({error:"Inavlid input"})
        }
    } catch (error) {
        res.status(404).json({error:error})
    }
})

async function readTasks() {
    try {
        const task = await Task.find()
        return task
    } catch (error) {
        throw error        
    }
}

app.get("/tasks", async (req,res) => {
    try {
        const data = await readTasks()
        if(data){
            res.send(data)
        }
        else{
            res.status(404).json({error:"Task not found."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})


async function updateTasks(id,taskData) {
    try {
        const task = await Task.findByIdAndUpdate(id,taskData)
        return task
    } catch (error) {
        throw error
    }
}

app.post("/tasks/:id", async (req,res) => {
    try {
        const task = await updateTasks(req.params.id,req.body)
        if(task){
            res.status(200).json({message:'Task updated.'})
        }
        else{
            res.status(404).json({error:"Invalid data"})
        }
    } catch (error) {
        res.status(500).json({error:"Task not updated."})
    }
})


async function deleteTask(taskId) {
    try {
        const deletedTask = await Task.findByIdAndDelete(taskId) 
        return deletedTask
    } catch (error) {
        throw error
    }
}

app.delete("/tasks/:id", async (req,res) => {
    try {
        const deletedData = await  deleteTask(req.params.id)
        if(deletedData){
            res.status(200).json({message:"Task deleted successfully."})
        }
        else{
            res.status(404).json({error:"Task not deleted."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})

async function createTeam(teamData) {
    try {
        const newTeam = new Team(teamData)
        return await newTeam.save()
    } catch (error) {
        throw error
    }
}

app.post("/teams", async (req,res) => {
  try {
     const team = await createTeam(req.body)
     if(team){
        res.status(201).json({message:"Team created."})
     }
     else{
        res.status(404).json({error:"Inavlid team details."})
     }
  } catch (error) {
    res.status(500).json({error:error})
  }    
})

async function readTeam() {
    try {
        const teams = await Team.find()
        return teams
    } catch (error) {
        throw error
    }
}

app.get("/teams", async (req,res) => {
    try {
        const teamData = await readTeam()
        if(teamData){
            res.send(teamData)
        }
        else{
            res.status(404).json({error:"Data not found."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})

async function createProject(projData) {
    try {
        const newProject = new Project(projData)
        return await newProject.save()
    } catch (error) {
        throw error
    }
}

app.post("/projects", async (req,res) => {
    try {
       const data = createProject(req.body)
       if(data){
           res.status(201).json({message:"Project created."})
       }
       else{
          res.status(404).json({error:"Unable to create project."})
       }        
    } catch (error) {
        res.status(500).json({error:error})
    }
})

async function readProject() {
    try {
        const projects = await Project.find()
        return projects
    } catch (error) {
       throw error   
    }
}

app.get("/projects", async (req,res) => {
    try {
       const data = await readProject()
       if(data){
        res.send(data)
       }
       else{
        res.status(404).json({error:"Data not found."})
       }        
    } catch (error) {
        res.status(500).json({error:error})
    }
})

async function createTag(tagData) {
    try {
        const newTag = new Tag(tagData)
        return await newTag.save()
    } catch (error) {
        throw error
    }
}


app.post("/tags", async (req,res) => {
    try {
        const data = await createTag(req.body)
        if(data){
            res.status(201).json({message:"Tag created successfully."})
        }
        else{
            res.status(404).json({error:"Unable to create tag."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})

async function readTag() {
    try {
        const tags = await Tag.find()
        return tags
    } catch (error) {
        throw error
    }
}

app.get("/tags", async (req,res) => {
    try {
        const data = await readTag()
        if(data){
            res.send(data)
        }
        else{
            res.status(404).json({message:"Tag not found."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})

async function report() {
    try {
        const seventhDate = new Date()
        seventhDate.setDate(seventhDate.getDate()-7)
        const tasks = await Task.find({
            status:"Completed",
            updatedAt: {$gte:seventhDate}
        })

        return tasks
    } catch (error) {
        throw error
    }
}

app.get("/report/last-week", async (req,res) => {
    try {
        const data = await report()
        if(data){
            res.send(data)
        }
        else{
            res.status(404).json({error:"Unable to fetch the data."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})


async function pending() {
   try {
      const tasks = await Task.find({status:{$ne:"Completed"}})

      const totalTime = tasks.reduce((acc,curr)=>acc+curr.timeToComplete,0)

      return {"total days of work pending for all tasks":totalTime}
   } catch (error) {
     throw error
   }    
}

app.get("/report/pending", async (req,res) => {
    try {
        const data = await pending()
        if(data){
            res.send(data)
        }
        else{
            res.status(404).json({error:"Unable to fetch the data."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})


async function closed() {
    try {
        const tasks = await Task.find({status:"Completed"})
        return {"total number of closed tasks":tasks.length}
    } catch (error) {
        throw error
    }
}

app.get("/report/closed-task", async (req,res) => {
    try {
        const data = await closed()
        if(data){
            res.send(data)
        }
        else{
            res.status(404).json({error:"Unable to fetch the data."})
        }
    } catch (error) {
        res.status(500).json({error:error})
    }
})

const PORT = 3000 || process.env.PORT

app.listen(PORT, ()=>console.log("Server is running on 3000."))