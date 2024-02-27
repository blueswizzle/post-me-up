const mainContainer = document.getElementById('main-container')

async function createGaian(formData){
    try {
        console.log(formData)
        let message = document.getElementById('create-gaian-message')
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
}

async function createPost(formData){
    try {
        let message = document.getElementById('create-post-message')
        console.log(formData)
        const response = await fetch('http://localhost:4000/gaian/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json()

        if (response.ok) {
            console.log(data.post.id)
            message.classList.remove('text-danger')
            message.classList.add('text-success')
            message.innerText = 'Post created!'
            window.location.hash = `#post/${data.post.id}`
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
}


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
    let posts = await getAllPosts();

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
            <a href="#post/${post.post_id}" class="text-decoration-none link-light">
                <div class="container-sm d-sm-flex flex-column border border-secondary-subtle my-4 w-50 post" id=${post.post_id}>
                    <p class="fw-bold">@${post.username}</p>
                    <p class="overflow-hidden">${post.title}</p>
                    <p class="fs-6 fw-lighter">${formattedDate} <span>${hours}:${minutes} ${ampm}</span></p>
                </div>
            </a>
            `;


           

            // Append the HTML string to the postBoard
            postBoard.innerHTML += postHTML;
        }
        document.querySelectorAll('.post').forEach(box =>{
            box.addEventListener('click', ()=>{
                window.location.hash = `#post/${box.id}`
            })
        })
        
        
    } else {
        const postHTML = `
            <h1 class="text-center"> No Posts Available </h1>

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


function showHomePage(){
    mainContainer.innerHTML = ''
    const child = `
      <h1 class="text-center">Welcome to PostMeUp</h1>
      <h2 class="text-center">You're essentially an admin that can create gaians (users), posts, update, and delete them</h2>
      <p class="text-center my-5">Use the nav links to create gaians,posts, and to view them. Clicking on a post
        will show the full post body. There you can update and/or delete the post. Same applies for gaians.
      </p> 
    `
    mainContainer.innerHTML += child;
}

async function showPostsPage(){
    mainContainer.innerHTML = ''
    const child = document.createElement('div');

    child.innerHTML = `
        <h1 class="text-center">Viewing Posts</h1>
        <div id="post-board" class="container-lg d-md-flex flex-column justifiy-content-center align-items-center">
    `
    mainContainer.appendChild(child)

    await populatePostBoard(child);
}

async function showGaiansPage(){
    mainContainer.innerHTML = '';

    mainContainer.innerHTML += `
    <h1 class="text-center">Viewing Gaians</h1>
        <div class="dropdown my-4">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Sort by: <span id="sort-by-text">A-Z</span>
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" data-sortby="a-z">A-Z</a></li>
                <li><a class="dropdown-item" href="#" data-sortby="z-a">Z-A</a></li>
                <li><a class="dropdown-item" href="#" data-sortby="posts-asc">Post ASC</a></li>
                <li><a class="dropdown-item" href="#" data-sortby="posts-desc">Post DESC</a></li>
            </ul>
        </div>
    <div class="container">
        <div class="row row-cols-3"  id="gaian-board">
        </div>
    </div> 
    `;
    const sortByText = document.getElementById('sort-by-text')
    const board = document.getElementById('gaian-board');

    let gaians = await getAllGaians();

    const renderGaians = () => {
        board.innerHTML = '';
        gaians.forEach(gaian => {
            const element = `
                <div class="col">
                    <div class="container-sm d-sm-flex flex-column border border-secondary-subtle my-2 gaian" id="${gaian.id}">
                        <p class="fw-bold text-center text-truncate">@${gaian.username}</p>
                        <p class="fw-bold text-center text-truncate">Posts: ${gaian.total_posts}</p>
                    </div>
                </div>
            `;
            board.innerHTML += element;
        });
    };

    
    renderGaians();

    
    const sortGaians = (sortBy) => {
        if (sortBy === 'a-z') {
            gaians.sort((a, b) => a.username.localeCompare(b.username));
            sortByText.textContent = "A-Z"
        }else if (sortBy === 'z-a') {
            gaians.sort((a,b) => b.username.localeCompare(a.username))
            sortByText.textContent = "Z-A"
        }else if (sortBy === 'posts-asc') {
            gaians.sort((a, b) => a.total_posts - b.total_posts);
            sortByText.textContent = "Post asc"
        }else if (sortBy === 'posts-desc'){
            gaians.sort((a,b) => b.total_posts - a.total_posts);
            sortByText.textContent = "Post desc"
        }
        
        renderGaians();
    };

    
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            const sortBy = item.getAttribute('data-sortby');
            sortGaians(sortBy);
        });
    });
}

async function showPostDetailsPage(id) {
    let postID = id;
    try {
        const post = await getPostDetails(postID);

        if (post) {
            
            const postDate = new Date(post.post_date);
            const formattedDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(postDate);

            let time = post.post_time
            const { hours, minutes, ampm } = convertTimeToHoursMinutes(time);
            mainContainer.innerHTML = ''
            
            const child = `
            <div class="modal" id="cofirmPostDeletionModal" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Confirm Deletion</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p>Do you want to delete this post?</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" id="confirm-delete" class="btn btn-danger">Delete</button>
                </div>
              </div>
            </div>
          </div>
            
            
            <div class="container">
                <div class="row">
                    <div class="col-md-8 offset-md-2">
                        <div class="card mt-5">
                            <div class="card-body">
                                <h5 class="card-title post-details">${post.title}</h5>
                                <p class="card-text"> @${post.username}</p>
                                <p class="card-text ">${formattedDate}</p>
                                <p class="card-text">${hours}:${minutes} ${ampm}</p>
                                <hr>
                                <p class="card-text post-details">${post.content} </p>
                                <div class="text-center mt-4" id="post-button-options">
                                    <button type="button" id="edit-post" class="btn btn-primary mx-4">Edit</button>
                                    <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#cofirmPostDeletionModal">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
            mainContainer.innerHTML += child;

            document.getElementById('edit-post').addEventListener('click', ()=>{
                editPostDetails()
            })

            document.getElementById('confirm-delete').addEventListener('click', async ()=>{
                let postID = window.location.hash.substring(6)
                await deletePost(postID)
            })
            
            
        } else {
            console.log("Failed to get post details");
            
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

function showCreatePostPage(){
    mainContainer.innerHTML = ''
    const child = `
    <h1 class = "text-center">Create Post </h1>
    <form id="create-post-form">
        <div class="mb-3">
        <label for="gaianUsername" class="form-label">Username</label>
        <input type="text" class="form-control" id="gaianUsername" placeholder="Enter username" required>
        </div>
        <div class="mb-3">
        <label for="postTitle" class="form-label">Post Title</label>
        <input type="text" class="form-control" id="postTitle" placeholder="Enter title" required>
        </div>
        <div class="mb-3">
        <label for="postContent" class="form-label">Content</label>
        <textarea class="form-control" id="postContent" rows="5" required></textarea>
        </div>
        <button type="submit" class="btn btn-light">Create Post</button>
    </form>
    <p id="create-post-message"> </p>
    `
    mainContainer.innerHTML += child;

    let form = document.getElementById('create-post-form')
    form.addEventListener('submit', async (e)=>{
        e.preventDefault()
        const formData = {
            username: form.elements['gaianUsername'].value,
            title: form.elements['postTitle'].value,
            content: form.elements['postContent'].value
        }
        await createPost(formData);
    })

}

function showCreateGaianPage(){
    mainContainer.innerHTML = ''
    const child = `
    <h1 class = "text-center">Create Gaian </h1>
    <form id="create-gaian-form">
        <div class="mb-3">
            <label for="gaianUsername" class="form-label">Username</label>
            <input type="text" class="form-control" id="gaianUsername" placeholder="Enter username" required>
        </div>
        <button type="submit" class="btn btn-light">Create Gaian</button>
        
    </form>
    <p id="create-gaian-message"> </p>
    `
    mainContainer.innerHTML += child
    let form = document.getElementById('create-gaian-form')
    form.addEventListener('submit', async (e) =>{
        e.preventDefault()
        const formData = {
            'username': form.elements['gaianUsername'].value
        }
        await createGaian(formData)
    })

}

function editPostDetails(){
    let editableItems = document.querySelectorAll('.post-details')
    let buttons = document.querySelectorAll('#post-button-options button')
    buttons.forEach(button =>{
        button.style.display = 'none'
    })
    
    const editOptions = `
    <button type="button" id="save-edit" class="btn btn-primary mr-2">Save</button>
    <button type="button" id="cancel-edit" class="btn btn-danger">Cancel</button>
    `

    
    document.getElementById('post-button-options').innerHTML += editOptions
  
    
    editableItems.forEach((item, index) =>{
        item.contentEditable = true;
        item.classList.add('border')
        item.classList.add('border-info')
        item.classList.add('p-1')
        item.classList.add('rounded')
        if(index == 0){
            item.addEventListener('beforeinput', (e) => {
                const maxLength = 100; 
                if (item.textContent.length >= maxLength && e.inputType !== 'deleteContentBackward') {
                    e.preventDefault(); 
                }
                
                
            });
        }
        
    })

   
    document.getElementById('save-edit').addEventListener('click', async ()=>{
        try {
            const data = {
                title:editableItems[0].innerText,
                content:editableItems[1].innerText
            }

            let postID = window.location.hash.substring(6);
            const response = await fetch(`http://localhost:4000/posts/${postID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(data)
            })
            const r = await response.json();
            if(response.ok){
                showPostDetailsPage(postID);
            }else{
                console.log(r)
            } 
        } catch (error) {
            alert(error.error)
        }
    })

    document.getElementById('cancel-edit').addEventListener('click', ()=>{
        showPostDetailsPage(window.location.hash.substring(6));
    })
}

async function deletePost(postID) {
    try {
        const response = await fetch(`http://localhost:4000/posts/${postID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const deletedPost = await response.json();
            console.log("Deleted Post: ", deletedPost);
        } else {
            const errorData = await response.json(); 
            console.log(errorData);
        }
    } catch (error) {
        console.log(error);
    }
}

async function getPostDetails(postID){
    try {
        const response = await fetch(`http://localhost:4000/posts/${postID}`,{
            method: 'GET',
            headers:{
                'Content-Type':'application/json'
            }
        })

        const data = await response.json()

        if(response.ok){
            return data
        }else{
            console.log('Something went wrong', response.error)
        }
    } catch (error) {
        console.log(error)
    }
}

function selectPageView() {
    const hash = window.location.hash;
  
    if (hash.startsWith('#post/')) {
      const postId = hash.substring(6); 
      showPostDetailsPage(postId);
    } else {
      switch (hash) {
        case '#posts':
          showPostsPage();
          break;
        case '#gaians':
          showGaiansPage();
          break;
        case '#createPost':
          showCreatePostPage();
          break;
        case '#createGaian':
          showCreateGaianPage();
          break;    
        default:
          showHomePage();
          break;
      }
    }
  }
  
  window.addEventListener('hashchange', selectPageView);

  selectPageView();