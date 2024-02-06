const createGaianForm = document.getElementById('create-gaian-form')
const createPostForm = document.getElementById('create-post-form')


const mainContainer = document.getElementById('main-container')
const homePage = document.getElementById('home-page')


const viewGaiansLink = document.getElementById('view-gaians')
const searchButton = document.getElementById('search-button')

document.addEventListener('DOMContentLoaded', populatePostBoard);

homePage.addEventListener('click', async () => {
    mainContainer.innerHTML = ''
    const child = document.createElement('div');

    child.innerHTML = `
        <h1 class="text-center">Viewing Posts</h1>
        <div id="post-board" class="container-lg d-md-flex flex-column justifiy-content-center align-items-center">
    `
    mainContainer.appendChild(child)

    await populatePostBoard(child);
})


viewGaiansLink.addEventListener('click', async function (event) {
    event.preventDefault();
    mainContainer.innerHTML = ''

    mainContainer.innerHTML += `
    <h1 class="text-center">Viewing Gaians</h1>
        <div class="dropdown my-4">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Sort by: <span>Username </span>
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Username</a></li>
                <li><a class="dropdown-item" href="#">Post Count</a></li>
            </ul>
        </div>
    <div class="container">

        <div class="row row-cols-3"  id="gaian-board">

        </div>
       
    </div> 
    `
    const board = document.getElementById('gaian-board')

    let gaians = await getAllGaians();

    if (gaians.length > 0) {
        for (i = 0; i < gaians.length; i++) {

            const element = `
             <div class="col">
                <div class="container-sm d-sm-flex flex-column border border-secondary-subtle my-2 post" id="${gaians[i].id}">
                    <p class="fw-bold text-center text-truncate">@${gaians[i].username}</p>
                    <p class="fw-bold text-center text-truncate">Posts: ${gaians[i].total_posts}</p>
                </div>
  
            </div>
            `
            board.innerHTML += element
        }
    }

});

createGaianForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log("Username is ", createGaianForm.elements['gaianName'].value)
    const formData = {
        'username': createGaianForm.elements['gaianName'].value
    }

    try {
        let message = document.getElementById('create-gaian-error')
        const response = await fetch('http://localhost:4000/gaians', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })

        const data = await response.json()
        if (response.ok) {
            console.log("Gaian created successfully ", data)
            message.classList.remove('text-danger')
            message.classList.add('text-success')
            message.innerText = 'Gaian created!'
        } else if (response.status == 400) {
            console.log(data.error)
            message.classList.remove('text-success')
            message.classList.add('text-danger')
            message.innerText = 'Username already exists!'
        } else {
            console.log("Something went wrong", response.error)
        }
    } catch (error) {
        console.log("Error is", error)
    }
})

createPostForm.addEventListener('submit', async (e) => {
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json()

        if (response.ok) {
            console.log(data)
            message.classList.remove('text-danger')
            message.classList.add('text-success')
            message.innerText = 'Post created!'
        } else if (response.status === 404) {
            console.log(data.error)
            message.classList.remove('text-success')
            message.classList.add('text-danger')
            message.innerText = 'Username not found!'
        } else {
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log("Error is ", error)
    }
})


homePage.addEventListener('click', getAllPosts)



async function getAllPosts() {
    try {
        const response = await fetch('http://localhost:4000/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        const data = await response.json()

        if (response.ok) {
            return data.posts
        } else {
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log("Error is ", error)
    }
}

async function populatePostBoard(postBoard) {
    let posts = await getAllPosts(); // Wait for the promise to resolve

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
            const { hours, minutes, ampm } = convertTimeToHoursMinutes(time);

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
    } else {
        const postHTML = `
            <h1>No Posts Available </h1>

         `;

        postBoard.innerHTML += postHTML
    }
}
async function getAllGaians() {
    try {
        const response = await fetch('http://localhost:4000/gaians', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (response.ok) {
            return data
        } else {
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log(error)
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