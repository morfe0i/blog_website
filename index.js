import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyPaser from "body-parser";
import session from "express-session";


const __dirname = dirname(fileURLToPath(import.meta.url));


const app = express();
const port = 3000;

let posts = []
let htmlContent = []

app.use(bodyPaser.urlencoded({extended: true}));

app.use(
    session({
      secret: "your-secret-key", 
      resave: false,
      saveUninitialized: false,
    })
  );

function getCreds(req, res, next) {
    const password = req.body.password;
    const username = req.body.username;
    console.log(password +  username);
    if (password === '123' && username === 'test'){
        req.session.isUserAuth = true;
    }
    next();
}

app.use(getCreds);

app.use(express.static("public"));


app.get('/', (req, res) =>{
    res.render('login.ejs');
})

app.post('/check', (req, res)=> {
    if (req.session.isUserAuth == true) {
        res.render('index.ejs', {posts : htmlContent.join('\n')});
    } else {
        res.render('login.ejs', {textContent : 'Wrong password or username, try again !'} );
    }
    
})

app.get('/index.html', function(req, res) {
    let mergedContent = htmlContent.join('\n');
    res.render('index.ejs', {posts : mergedContent})
});

app.get('/about.html', function(req, res) {
    res.sendFile(__dirname +'/about.html');
});

app.get('/createPost.html', function(req, res) {
    res.render('createPost.ejs');
});

app.post('/upload', (req,res)=> {
    const title = req.body.title;
    const desc = req.body.description;
    let randomID = Math.floor(Math.random() * 9999);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date());
    posts.push({id : randomID,postTitle: title, postDesc: desc, author: 'test', date : formattedDate})  
    posts = posts.reverse();
    htmlContent.push(`<div class="post-preview"><a href="./post.html?id=${randomID}"><h2 class="post-title">${title}</h2></a> <p class="post-meta"> Posted by test on ${formattedDate} </p><hr class="my-4" />`);
    let mergedContent = htmlContent.join('\n');
    
    res.render('index.ejs', {posts : mergedContent})
    console.log(posts);
})

app.get('/post.html', function(req, res) {
    const id = req.query.id;
    const postLen = posts.length;
    console.log(postLen);
    for (let i = 0; i < postLen; i++) {
        if (posts[i].id == id) {
            res.render('post.ejs', { title : posts[i].postTitle, desc : posts[i].postDesc, yearNum : posts[i].date, postId : posts[i].id});
        }  
    }
});

app.post('/edit', (req,res) => {
    const id = req.query.id;
    const post = posts.find(post => post.id == id);
    res.render('editPost.ejs', {postTitle : post.postTitle, desc : post.postDesc, id: post.id});
})

app.post('/done', (req,res)=> {
    const id = req.query.id;
    const title = req.query.title;
    const desc = req.query.desc;
    const post = posts.find(post => post.id == id);
    post.postTitle = title;
    post.postDesc = desc;
    console.log('HTML Content before update:', htmlContent);

    // update htmlContent post with new content below 
    let postString =  `<div class="post-preview"><a href="./post.html?id=${id}"><h2 class="post-title">${title}</h2></a> <p class="post-meta"> Edited by test on ${post.date} </p><hr class="my-4" />`;
    htmlContent = htmlContent.map(content => content.includes(id) ? postString : content);
    let mergedContent = htmlContent.join('\n');
    console.log('HTML Content After update:', htmlContent);

    res.render('index.ejs', {posts : mergedContent})
});

app.post('/delete', (req,res) => {
    const id = req.query.id;
    const postIndex = posts.findIndex(post => post.id == id);

    // delete post that matches the id
    if (postIndex !== -1) {
        posts.splice(postIndex, 1);
        htmlContent = htmlContent.filter(content => !content.includes(`id=${id}`))
    }

    res.render('index.ejs', {posts : htmlContent.join('\n')})
})
app.listen(port, function(){
    console.log("Listening on port : " + port);
})