const createGaianForm = document.getElementById('create-gaian-form')
const createPostForm = document.getElementById('create-post-form')
const homePage = document.getElementById('home-page')
const postBoard = document.getElementById('post-board')
const viewGaiansModal = document.getElementById('view-gaians-modal-body')

const viewGaiansLink = document.getElementById('view-gaians')
const searchButton = document.getElementById('search-button')

document.addEventListener('DOMContentLoaded', populatePostBoard);

viewGaiansLink.addEventListener('click', async function (event) {
    event.preventDefault(); 
    
    await populateGaianModal();
 
  
  });

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
            return data.posts
        }else{
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log("Error is ", error)
    }
}

async function populatePostBoard() {
    let posts = await getAllPosts(); // Wait for the promise to resolve
    console.log("POSTS are ", posts);

    if (posts.length > 0) {
        for (const post of posts) {

            // Convert the ISO date string to a Date object
            const postDate = new Date(post.post_date);

            // Format the date
            const formattedDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(postDate);

            let time = post.post_time
            const { hours, minutes,ampm } = convertTimeToHoursMinutes(time);

            // Use template literals to create HTML
            const postHTML = `
                <div class="container-sm d-sm-flex flex-column border border-secondary-subtle my-4 w-50 post" id=${post.post_id}>
                    <p class="fw-bold">@${post.username}</p>
                    <p class="overflow-hidden">${post.title}</p>
                    <p class="fs-6 fw-lighter">${formattedDate} <span>${hours}:${minutes} ${ampm}</span></p>
                </div>
            `;

            // Append the HTML string to the postBoard
            postBoard.innerHTML += postHTML;
        }
    }else{
        const postHTML = `
            <h1>No Posts Available </h1>

         `;

        postBoard.innerHTML += postHTML
    }
}


async function getAllGaians(){
    try {
        const response = await fetch('http://localhost:4000/gaians',{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        })

        const data = await response.json()

        if(response.ok){
            console.dir(data)
            return data
        }else{
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log(error)
    }
}

async function populateGaianModal(){
    let gaians = await getAllGaians()
    if(gaians> 0){
        for(const gaian in gaians){
            const gaianHtml = `
                <div class="container-sm d-sm-flex flex-column border align-items-center border-secondary-subtle my-4 w-50 post" id=${gaian.id}>
                    <p class="fw-bold text-center">@${gaian.username}</p>
                </div>
            `;

            viewGaiansModal.innerHTML += gaianHtml;
        }
    }
}

function convertTimeToHoursMinutes(timeString) {
    // Parse the time string
    const time = new Date(`1970-01-01T${timeString}Z`);

    // Extract hours, minutes, and AM/PM
    const hours = (time.getUTCHours() + 24) % 12 || 12; // Convert 0 to 12
    const minutes = time.getUTCMinutes().toString().padStart(2, '0');
    const ampm = time.getUTCHours() < 12 ? 'AM' : 'PM';
  
    // Return the result
    return { hours, minutes, ampm };
}