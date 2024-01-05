const createGaianForm = document.getElementById('create-gaian-form')
const createPostForm = document.getElementById('create-post-form')
const homePage = document.getElementById('home-page')


createGaianForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    console.log("Username is ", createGaianForm.elements['gaianName'].value)
    const formData = {
        'username': createGaianForm.elements['gaianName'].value
    }
    
    try {
        let message = document.getElementById('create-gaian-error')
        const response = await fetch('http://localhost:4000/gaians',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(formData)
        })

        const data = await response.json()
        if(response.ok){
            console.log("Gaian created successfully ", data)
            message.classList.remove('text-danger')
            message.classList.add('text-success')
            message.innerText = 'Gaian created!'
        }else if(response.status == 400){
            console.log(data.error)
            message.classList.remove('text-success')
            message.classList.add('text-danger')
            message.innerText = 'Username already exists!'
        }else{
            console.log("Something went wrong", response.error)
        }
    } catch (error) {
        console.log("Error is", error)
    }
})

createPostForm.addEventListener('submit', async(e) =>{
    e.preventDefault()
    console.log("clicked")
    try {
        let message = document.getElementById('create-post-error')
        const formData = {
            username: createPostForm.elements['postGaianUsername'].value,
            title: createPostForm.elements['postTitle'].value,
            content: createPostForm.elements['postBody'].value
        }
        const response = await fetch('http://localhost:4000/gaian/post', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json()

        if(response.ok){
            console.log(data)
            message.classList.remove('text-danger')
            message.classList.add('text-success')
            message.innerText = 'Post created!'
        }else if(response.status === 404){
            console.log(data.error)
            message.classList.remove('text-success')
            message.classList.add('text-danger')
            message.innerText = 'Username not found!'
        }else{
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log("Error is ", error)
    }
})


homePage.addEventListener('click', getAllPosts)
async function getAllPosts(){
    try {
        const response = await fetch('http://localhost:4000/posts', {
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            },
        })

        const data = await response.json()

        if(response.ok){
            console.dir(data.posts)
        }else{
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log("Error is ", error)
    }
}