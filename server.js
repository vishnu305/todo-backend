const express = require('express');
const wbm = require('wbm');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const fast2sms = require('fast-two-sms');
require('dotenv').config();
const ObjectId = require('mongoose').Types.ObjectId;
mongoose.connect("mongodb+srv://admin-vishnu:Test123@cluster0.z5urb.mongodb.net/vishnutodolist", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const userSchema = new mongoose.Schema({
  username: String,
  userid:String,
  password: String,
  phone: String
})
const User = mongoose.model("User",userSchema);
const todosSchema = new mongoose.Schema({
  userId: String,
  todos: [{todo: String,date: String,time: String,checked: Boolean,starred: Boolean}],
})
const Todos = mongoose.model("Todos",todosSchema);
const sectiontodosSchema = new mongoose.Schema({
  userId: String,
  head: String,
  todos: [{todo: String,date: String,time: String,checked: Boolean,starred: Boolean}],
})
const Sectiontodos = mongoose.model("Sectiontodos",sectiontodosSchema);
const sectionsSchema = new mongoose.Schema({
  userId: String,
  sections: [{section: String}],
})

const Sections = mongoose.model("Sections",sectionsSchema);



const keepSchema = new mongoose.Schema({
  userId: String,
  todos: [{title: String,content: String}],
})
const Keep = mongoose.model("Keep",keepSchema);


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors());

app.use(express.json());

// setInterval(function(){
//    window.location.reload(1);
// }, 30000);

app.get("/",async (req,res)=>{
  var d = new Date();
  var h=d.getHours();
  var m=d.getMinutes();
  var ampm=h >= 12 ? 'pm':'am';
  h = h % 12;
  h = h ? h : 12;
  var time = h + ':' + m + ' ' + ampm;
  var user = await User.find().exec();
  var list = [];
  for (var i=0;i<user.length;i++){
    if(user[i]["phone"].length === 10){
    list.push(user[i]["phone"]);
    // console.log(list);
  }
  }
  res.send("hi");

  // var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
  // var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
  //
  // const client = require('twilio')(accountSid, authToken, {
  //     lazyLoading: true
  // });
  //
  // const sendMessage = async (message,senderId) => {
  //   try{
  //     await client.messages.create({
  //       to: senderId,
  //       body: message,
  //       from: 'whatsapp:+14155238886'
  //     })
  //     .then(message => console.log(message.sid))
  //     .done()
  //   } catch (error) {
  //     console.log(`Error at sendMessage --> ${error}`);
  //   }
  // };
  //
  // sendMessage('hello','whatsapp:+919390182229');





  var today = new Date();
  // var date = today.toLocaleDateString("en-US");
  var date = today.toISOString().substr(0,10);
  // if(time === '8:5 am' || time==="10:5 am" || time === '6:5 pm' || time === '11:5 am' || time === '10:15 pm'){
  // const response = await fast2sms.sendMessage({authorization : process.env.API_KEY,message: "Complete your uncompleted tasks in your Vishnu's todo list app",numbers:list})
  for (var i=0;i<user.length;i++){
    if(user[i]["phone"].length === 10){
      // console.log(user[i]["_id"])
      var kmm = user[i]['phone'];
      var kmm1 = user[i]['username'];
      var a = await Todos.findOne({userId: user[i]["_id"]}).exec();
      // console.log(a);
      if(!a){
        console.log("no user todos found");
      }else{
        todos = a.todos;
      for(var k=0;k<todos.length;k++){
        if(todos[k].date === date){
        if(todos[k].time === time || time === '10:5 am' || time === '3:5 pm' || time === '9:5 am' || time==='12:5 pm' || time === '5:5 pm' || time === '7:5 pm'){
          var kmm2 = todos[k].todo;
          var hi = await fast2sms.sendMessage({authorization : process.env.API_KEY,message: `Dear ${user[i]['username']}  Complete your uncompleted task-> '${todos[k].todo}' task in your Vishnu's todo list app`,numbers:[user[i]["phone"]]});
          console.log("success");

          wbm.start().then(async () => {
            const phones = [`+91${kmm}`];
            const message = `Dear ${kmm1}  Complete your uncompleted task-> '${kmm2}' task in your Vishnu's todo list app`;
            await wbm.send(phones, message);
            await wbm.end();
        }).catch(err => console.log(err));
      }
      }
    }
    }
  }
  }
})

app.post("/register", async (req,res)=>{
  const {username,userid,password,phone}=req.body;
  const user = await User.findOne({userid}).exec();
  if (user){
    res.status(500);
    res.json({
      message: "user already exists",
    });
    return;
  }
  await User.create({username,userid,password,phone});
  res.json({message:"success"});

  // User.findOne({email:userid},function(err,foundList){
  //   if(foundList){
  //     console.log("user already exists");
  //     return;
  //   }else{
  //     const user = new User({name: username,email: userid,password: password});
  //     user.save();
  //
  //   }
  // });
});
app.post("/login", async (req,res)=>{
  const { username,userid,password} = req.body;
  const user = await User.findOne({ userid }).exec();
  if(!user || user.password !== password || user.username !== username){
    res.status(403);
    res.json({message:"invalid login",});
    return;
  }
  res.json({message:"success",});

})

app.post("/todos", async (req,res) => {
  const { authorization } = req.headers;
  const [, token]= authorization.split(" ");
  const [userid,password] = token.split(":");
  const user = await User.findOne({ userid }).exec();
  const todosItems = req.body;
  if(!user || user.password !== password){
    res.status(403);
    res.json({message:"invalid access",});
    return;
  }
  // console.log(user.username,todosItems);
  const todos = await Todos.findOne({userId: String(user._id)}).exec();
  if(!todos){
    await Todos.create({
      userId:String(user._id),
      todos: todosItems,
    })
  }else{
    todos.todos = todosItems;
    await todos.save();
  }
  res.json(todosItems);
})


app.post("/sectiontodos", async (req,res) => {
  const { authorization } = req.headers;
  const [, token]= authorization.split(" ");
  const [id,head] = token.split(":");
  // const user = await User.findOne({ userid }).exec();
  const todosItems = req.body;
  // if(!user || user.password !== password){
  //   res.status(403);
  //   res.json({message:"invalid access",});
  //   return;
  // }
  // console.log(user.username,todosItems);
  const todos = await Sectiontodos.findOne({userId: String(id)}).exec();
  if(!todos){
    await Sectiontodos.create({
      userId:String(id),
      head: head,
      todos: todosItems,
    })
  }else{
    todos.todos = todosItems;
    await todos.save();
  }
  res.json(todosItems);
})


app.post("/keep", async (req,res) => {
  const { authorization } = req.headers;
  const [, userid]= authorization.split(" ");
  // const user = await User.findOne({ userid }).exec();
  const todosItems = req.body;
  // if(!user || user.password !== password){
  //   res.status(403);
  //   res.json({message:"invalid access",});
  //   return;
  // }
  // console.log(user.username,todosItems);
  const todos = await Keep.findOne({userId: String(userid)}).exec();
  if(!todos){
    await Keep.create({
      userId:String(userid),
      todos: todosItems,
    })
  }else{
    todos.todos = todosItems;
    await todos.save();
  }
  res.json(todosItems);
})





app.post('/section', async (req,res)=>{
  const { authorization } = req.headers;
  const [, token]= authorization.split(" ");
  const [userid,password] = token.split(":");
  const user = await User.findOne({ userid }).exec();
  const todosItems = req.body;
  if(!user || user.password !== password){
    res.status(403);
    res.json({message:"invalid access",});
    return;
  }
  // console.log(user.username,todosItems);
  const sections = await Sections.findOne({userId: user._id}).exec();
  if(!sections){
    await Sections.create({
      userId:user._id,
      sections: todosItems,
    })
  }else{
    sections.sections = todosItems;
    await sections.save();
  }
  res.json(todosItems);
})
app.get("/section", async (req,res)=>{
  const { authorization } = req.headers;
  const [, token]= authorization.split(" ");
  const [userid,password] = token.split(":");
  const user = await User.findOne({ userid }).exec();
  if(!user || user.password !== password){
    res.status(403);
    res.json();
    return;
  }
  const b = await Sections.findOne({userId: user._id}).exec();
  if(!b){
    res.json([]);
    return;
  }
  res.json(b.sections);
  // Sections.findOne({userId: user._id},function(err,todos1){
  //   if(todos1){
  //     res.json(todos1.sections);
  //     // console.log(todos1)
  //   }
  //   else{
  //     res.status(404);
  //     res.json();
  //     return;
  //   }
  // })
  // console.log(sections);
  // res.json(sections);
})
app.get("/todos", async (req,res)=>{
  const { authorization } = req.headers;
  const [, token]= authorization.split(" ");
  const [userid,password] = token.split(":");
  const user = await User.findOne({ userid }).exec();
  if(!user || user.password !== password){
    res.status(403);
    res.json();
    return;
  }
  const { todos } = await Todos.findOne({userId: user._id}).exec();
  res.json(todos);
})

app.get("/sectiontodos", async (req,res)=>{
  const { authorization } = req.headers;
  const [, token]= authorization.split(" ");
  const [id,head] = token.split(":");
  // const user = await User.findOne({ userid }).exec();
  // if(!user || user.password !== password){
  //   res.status(403);
  //   res.json();
  //   return;
  // }
  const a = await Sectiontodos.findOne({userId:String(id)}).exec();
  if(!a){
    res.json([]);
    return;
  }
  res.json(a.todos);
})


app.get("/keep", async (req,res)=>{
  const { authorization } = req.headers;
  const [,userid] = authorization.split(" ");

  const a = await Keep.findOne({userId: String(userid)}).exec();
  if(!a){
    res.json([]);
    return;
  }
  res.json(a.todos);
})

app.get("/todoscompleted", async (req,res)=>{
  const { authorization } = req.headers;
  const [, token]=authorization.split(" ");
  const [userid,password] = token.split(":");
  const user = await User.findOne({ userid }).exec();
  if(!user || user.password !== password){
    res.status(403);
    res.json();
    return;
  }
  const { todos } = await Todos.findOne({userId: user._id}).exec();
  // console.log(todos);
  for( let i=0;i<todos.length;i++){
    if(todos[i].checked !== true){
      todos.splice(i,1);
    }
  }
  res.json(todos);
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  app.listen(port,()=>{
    console.log(`Example app listnening at http://localhost:${port}`);
  })
});
