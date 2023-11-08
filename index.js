

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app=express();
const port=3000;

function createClient(){
return new pg.Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "password",
    database: "mydb"
});
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//first page
app.get("/", async (req, res)=>{
    const client=createClient();
    try{
    await client.connect();
    const result=await client.query("Select * from tasks");
    client.end();
    len=result.rowCount;
    res.json(result.rows);
    }catch(error){
        res.status(500).json({error: error});
    }
});

//get by id
app.get("/tasks/:id", async (req, res)=>{
    const client=createClient();
    try{
        await client.connect();
        const dbItem=await client.query("SELECT * FROM tasks WHERE id = $1",[req.params.id]);
        client.end();
        if(dbItem.rows){
            res.json(dbItem.rows);
        }else{
            res.status(404).json({message: "No Task with this Id"});
        }
    }catch(error){
        res.status(500).json({error: "error"+error});
    }
    //const dbItem=db.find((a)=> parseInt(req.params.id) === a.id);
    
});

//add items to db
app.post("/tasks", async (req, res)=>{

    len+=1;
    const newTask={
        id: len,
        title: req.body.title,
        content: req.body.content,
        completed: false,
        date: new Date(),
    };
    
    const client=createClient();
    try{
    await client.connect();
    await client.query(`INSERT INTO tasks(id, title, content, completed, date) 
    VALUES($1, $2, $3, $4, $5)`, [newTask.id, newTask.title, newTask.content, newTask.completed, newTask.date]);
    client.end();
    //res.redirect("/");
    //db.push(newTask);
    res.json(newTask);
    }catch(error){
        res.status(500).json({error: error});
    }
});

//delete item from db
app.delete("/tasks/:id", async (req, res)=>{
    const client=createClient();
    try{
        await client.connect();
        await client.query('DELETE FROM "tasks" WHERE "id" = $1', [req.params.id]);
        client.end();
        res.json({message: "Task deleted successfully"});
    }catch(error){
        res.status(500).json({error: "eroro"+error});
    }
    /*const index=db.findIndex((a)=> a.id === parseInt(req.params.id));   
    if(index === -1) return res.status(404).json({error: "No Task with the entered Id"});

    db.splice(index, 1);*/
    //res.json({message: "Task deleted successfully"});
});

//update item in db
app.patch("/tasks/:id", async (req, res)=>{
    const client=createClient();
    try{
        await client.connect();
        const task=await client.query("SELECT * FROM tasks WHERE id = $1",[req.params.id]);
        const newTask={
            id: req.params.id,
            title: req.body.title || task.rows[0].title,
            content: req.body.content || task.rows[0].content,
            completed: req.body.completed || false,
            date: new Date()
        };
        await client.query(`UPDATE tasks SET title=$2, content=$3, completed=$4, date=$5 
        WHERE id=$1`, [newTask.id, newTask.title, newTask.content, newTask.completed, newTask.date]);

        client.end();
        res.json(newTask);
    }catch(error){
        res.status(500).json({error: "error"+error});
    }

});

app.listen(port, ()=>{
    console.log(`App running at ${port}`);
});


let len=0;

export default app;

/*
let db=[
    {
        id: 1,
        title: "The Rise of Decentralized Finance",
        content:
          "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
        completed: false,
        date: "2023-08-01T10:00:00Z",
      },
      {
        id: 2,
        title: "The Impact of Artificial Intelligence on Modern Businesses",
        content:
          "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
        completed: true,
        date: "2023-08-05T14:30:00Z",
      },
      {
        id: 3,
        title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
        content:
          "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
        completed: false,
        date: "2023-08-10T09:15:00Z",
      },
];*/