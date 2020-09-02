const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words'); 
const rateLimit = require('express-rate-limit');

const app = express();

const db = monk("mongodb+srv://cris:cris@cluster0-6psa9.gcp.mongodb.net/posts?retryWrites=true&w=majority")
const posts = db.get('posts');

const filter = new Filter();

app.use(cors());

app.use(express.json());
app.use(rateLimit({
    windowMs: 30* 1000, //30 secs
    max: 10
}))

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.get('/', (req,res) => {
    res.json({
        message: 'Hello!'
    });
});

app.get('/posts', (req,res) => {

    posts
    .find()
    .then(posts =>{
        res.json(posts);
    });
});

function isValidPost(post){
    return post.name && post.name.toString().trim() !== '' &&
     post.content && post.content.toString().trim() !== '';
}

app.post('/posts',(req, res) =>{
    if(isValidPost(req.body)){

        const post = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created_at: new Date()
        };

        posts
        .insert(post)
        .then(createdPost => {
            res.json(createdPost);
        })

    }else{
        res.status(422);
        res.json({
            message: "Hey! Name and Content are required!"
        })
    }
})