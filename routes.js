require('dotenv').config()
const express = require('express');
const router = express.Router();
const pool = require('./db');


// SELECT ALL GAIANS FROM DATABASE
router.get('/gaians', async(req,res)=>{
    try {
        const AllGaians = await pool.query(
            "SELECT g.*, COUNT(p) AS total_posts FROM gaian g LEFT JOIN post p ON g.id = p.gaian_id GROUP BY g.id ORDER BY g.username"
        );
        console.log("Gaians are", AllGaians.rows)
        return res.status(200).json(AllGaians.rows)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({error:error})
    }
})

// GET A SPECIFIC GAIAN
router.get('/gaians/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const gaianQuery = await pool.query(
            'SELECT * FROM gaian WHERE id = $1;', [id]
        );

        if (gaianQuery.rows.length === 1) {
            const gaian = gaianQuery.rows[0];

            const postsQuery = await pool.query(
                'SELECT p.*, g.username AS username FROM post p JOIN gaian g ON g.id = p.gaian_id WHERE gaian_id = $1 ORDER BY p.updated_date DESC, p.updated_time DESC;', [id]
            );

            const posts = postsQuery.rows;

            return res.status(200).json({ gaian, posts });
        } else {
            return res.status(404).json({ error: "Gaian not found" });
        }
    } catch (error) {
        console.error("Error fetching Gaian:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
});



// SELECT ALL POSTS FROM DATABASE
router.get('/posts', async (req,res)=>{
    try {
        const allPosts = await pool.query(
            'SELECT gaian.id AS gaian_id, gaian.username, post.id AS post_id, post.title,post.content,post.post_date,post.post_time FROM gaian JOIN post ON gaian.id= post.gaian_id ORDER BY post.post_date DESC, post.post_time DESC;'
        )
        return res.status(200).json({message:'Got all posts', posts:allPosts.rows})
    } catch (error) {
        console.log(error.message)
    }
})


// GET A SPECIFIC POST BY ID

router.get('/posts/:id', async (req,res)=>{
    const id = req.params.id
    try {
        const postDetails = await pool.query(
            'SELECT p.*, g.username FROM post p JOIN gaian g ON g.id = p.gaian_id WHERE p.id = $1',
            [id]
        );
        if(postDetails.rows.length === 1){
            return res.status(200).json(postDetails.rows[0])
        }else{
            return res.status(404).json({error:"Post not found"})
        }
        
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({error:error})
    }
})


// CREATE NEW GAIAN
router.post('/gaians', async (req,res)=>{
    try {
        const data = req.body;
        console.log("REQ BODY IS ", data)
        const gaian = await pool.query(
            "INSERT INTO gaian (username) VALUES ($1) RETURNING *",
            [data.username]
            );

        return res.status(200).json(gaian.rows[0]);
    } catch (error) {
          // Check if the error is a unique constraint violation
        if (error.code === '23505' && error.constraint === 'gaian_username_key') {
            return res.status(400).json({ error: "Username already exists" });
        }
        console.log(error.message)
        return res.status(500).json({error:error})
    }

})


// CREATE NEW POST FOR A GAIAN
router.post('/gaian/post', async (req,res)=>{
    try {
        const {title,content,username} = req.body;
        const gaian = await pool.query(
            "SELECT * FROM gaian WHERE gaian.username = $1", [username]
        )
        if(gaian.rows.length ===0){
            return res.status(404).json({error:"Gaian not found"})
        }

        const newPost = await pool.query(
            "INSERT INTO post (gaian_id,title,content) VALUES($1,$2,$3) RETURNING *",
            [gaian.rows[0].id,title,content]
        )
        return res.status(200).json({message: 'Created new post', post: newPost.rows[0] })
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
            return res.status(404).json({error: `No posts from gaian with id ${id}`})
        }
        return res.status(200).json({message:'Got all posts from gaian', posts: gaianPosts.rows})

    } catch (error) {
        console.log(error)
        return res.status(500).json("An internal server error occured")
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
        return res.status(500).json("An internal server error occured")
    }
});



// UPDATE POST BY ID WITH NEW DATA
router.patch('/posts/:id', async (req,res) =>{
    try {
        const id = req.params.id
        const {title,content,updated_date,updated_time} = req.body
        const response = await pool.query(
            "UPDATE post SET title = $1, content = $2, updated_date = $3, updated_time = $4 WHERE id = $5 RETURNING *"
            ,[title,content,updated_date,updated_time,id]
        )
        if (response.rowCount === 1) {
            res.status(200).json({ message: 'Post updated successfully', post: response.rows[0] });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.log(error);
        if(error.code === '22001'){
            return res.status(400).json("Title is too long!")
        }
        return res.status(500).json( error.value);
    }
})


router.delete('/posts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletePost = await pool.query(
            "DELETE FROM post WHERE id = $1 RETURNING *", [id]
        );
        console.log("Post to be deleted: ", deletePost)
        if (deletePost.rows.length === 1) {
            return res.status(200).json(deletePost.rows[0]);
        } else {
            return res.status(404).json("Post not found!");
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json("An internal server error occurred.");
    }
});


router.get('/',(req,res)=>{
    res.sendFile('index.html')
})

module.exports = router;