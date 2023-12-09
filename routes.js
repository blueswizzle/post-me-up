require('dotenv').config()
const express = require('express');
const router = express.Router();
const pool = require('./db');


// SELECT ALL GAIANS FROM DATABASE
router.get('/gaians', async(req,res)=>{
    try {
        const AllGaians = await pool.query(
            "SELECT * FROM gaian"
        );

        return res.status(200).json(AllGaians.rows)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({error:error})
    }
})

// GET A SPECIFIC GAIAN
router.get('/gaians/:id', async (req,res)=>{
    try {
        const id= req.params.id

        const gaian = await pool.query(
            'SELECT * FROM gaian WHERE gaian.id = $1', [id]
        )
        return res.status(200).json(gaian.rows)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json(error)
    }


})

// SELECT ALL POSTS FROM DATABASE
router.get('/posts', async (req,res)=>{
    try {
        const allPosts = await pool.query(
            'SELECT * FROM post'
        )
        return res.status(200).json({message:'Got all posts', posts:allPosts.rows})
    } catch (error) {
        console.log(error.message)
    }
})


// CREATE NEW GAIAN
router.post('/gaians', async (req,res)=>{
    try {
        const data = req.body;
        console.log("REQ BODY IS ", data)
        const gaian = await pool.query(
            "INSERT INTO gaian (firstname,lastname,username,pass,email) VALUES ($1,$2,$3,$4,$5) RETURNING *",
            [data.firstname, data.lastname,data.username,data.pass,data.email]
            );

        return res.status(200).json(gaian.rows[0]);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({error:error})
    }

})


// CREATE NEW POST FOR A GAIAN
router.post('/gaian/post', async (req,res)=>{
    try {
        const {gaian_id, title,content, post_date, post_time} = req.body;

        const newPost = await pool.query(
            "INSERT INTO post (gaian_id,title,content,post_date,post_time) VALUES($1,$2,$3,$4,$5) RETURNING *",
            [gaian_id,title,content,post_date,post_time]
        )
        return res.status(200).json({message: 'Created new post', post: newPost.rows})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json(error)
    }
})

// GET ALL POSTS FROM A SINGLE GAIAN
router.get('/gaian/:id/posts',async (req,res)=>{
    try {
        const id = req.params.id

        const gaianPosts = await pool.query(
            'SELECT * FROM post WHERE post.gaian_id = $1',
            [id]
        );

        if(gaianPosts.rows.length == 0){
            return res.status(404).json({message: `No posts from gaian with id ${id}`})
        }
        return res.status(200).json({message:'Got all posts from gaian', posts: gaianPosts.rows})

    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})


// GET ALL POSTS WHERE TITLE MATCHES A SEARCH PHRASE
router.get('/posts/:search', async (req, res) => {
    try {
        const phrase = req.params.search;
        const lowercasedPhrase = phrase.toLowerCase(); // Save the result of toLowerCase

        const matchingPosts = await pool.query(
            "SELECT * FROM post WHERE LOWER(title) LIKE $1",
            [`%${lowercasedPhrase}%`]
        );

        return res.status(200).json({ message: 'Matching posts', posts: matchingPosts.rows });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});



router.get('/',(req,res)=>{
    res.sendFile('./frontend/index.html')
})

module.exports = router;