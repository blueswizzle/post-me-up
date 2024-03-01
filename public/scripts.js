const PORT = 4000
const mainContainer = document.getElementById('main-container')
const post_display_limit = 10;

async function createGaian(formData){
    try {
        console.log(formData)
        let message = document.getElementById('create-gaian-message')
        const response = await fetch(`http://localhost:${PORT}/gaians`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })

        if (response.ok) {
            const data = await response.json()
            console.log("Gaian created successfully ", data)
            message.classList.remove('text-danger')
            message.classList.add('text-success')
            message.innerText = 'Gaian created!'
        } else if (response.status == 400) {
            const errorData = await response.json()
            console.log(errorData)
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
        const response = await fetch(`http://localhost:${PORT}/gaian/post`, {
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
        const response = await fetch(`http://localhost:${PORT}/posts`, {
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
    if(posts.length > post_display_limit){
        const pagination = createPaginationElements(posts)
        postBoard.appendChild(pagination)
    }
    
}

async function deletePost(postID) {
    try {
        const response = await fetch(`http://localhost:${PORT}/posts/${postID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const deletedPost = await response.json();
            console.log("Deleted Post: ", deletedPost);
            return true;
        } else {
            const errorData = await response.json(); 
            console.log(errorData);
            return false;
        }
    } catch (error) {
        console.log(error);
    }
}

async function getPostDetails(postID){
    try {
        const response = await fetch(`http://localhost:${PORT}/posts/${postID}`,{
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

async function getAllGaians() {
    try {
        const response = await fetch(`http://localhost:${PORT}/gaians`, {
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
        will show the full post body. There you can update and/or delete the post. Same applies for gaians in regards to deletion.
      </p> 
    `
    mainContainer.innerHTML += child;
}

async function showPostsPage(){
    const posts = await getAllPosts()
    mainContainer.innerHTML = ''
    const child = document.createElement('div');

    child.innerHTML = `
        <h1 class="text-center">Viewing All Posts</h1>
        <div id="post-board" class="container-lg d-md-flex flex-column justifiy-content-center align-items-center">
    `
    mainContainer.appendChild(child)
    const postBoard = document.getElementById('post-board')
    if(posts.length > post_display_limit){
        const pagination = createPaginationElements(posts)
        mainContainer.append(pagination)

        const pagination_nav = document.querySelectorAll('.page-link')
        pagination_nav.forEach((page_number) =>{
            page_number.addEventListener('click', (e)=>{
                let clicked_index = e.target.textContent
                console.log(clicked_index)
                changeDisplayedPosts(clicked_index,posts,postBoard)
            })
        })

        renderPosts(posts,postBoard,0,post_display_limit)
    }else{
        renderPosts(posts,postBoard,0,posts.length)
    }

    
    
}

async function showGaiansPage(){
    mainContainer.innerHTML = '';
    const child = `
    <h1 class="text-center">Viewing All Gaians</h1>
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
    mainContainer.innerHTML += child
 
    const sortByText = document.getElementById('sort-by-text')
    const board = document.getElementById('gaian-board');

    let gaians = await getAllGaians();

    const renderGaians = () => {
        board.innerHTML = '';
        gaians.forEach(gaian => {
            const element = `
                <div class="col">
                    <div class="container-sm d-sm-flex flex-column border border-secondary-subtle my-2 gaian" data-gaian-id="${gaian.id}">
                        <p class="fw-bold text-center text-truncate">@${gaian.username}</p>
                        <p class="fw-bold text-center text-truncate">Posts: ${gaian.total_posts}</p>
                    </div>
                </div>
            `;
            board.innerHTML += element;
        });
        let elements = document.querySelectorAll('.gaian')
        elements.forEach((element) =>{
            element.addEventListener('click', (e)=>{
                let gaianID = e.target.closest('.gaian').getAttribute('data-gaian-id')
                window.location.hash = `#gaian/${gaianID}`
            })
        })
        
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
            const createdPostDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(postDate);

            let time = post.post_time
            const { hours, minutes, ampm } = convertTimeToHoursMinutes(time);

            const updatedDate = new Date(post.updated_date);
            const updatedPostDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(updatedDate);

            let updatedTime = post.updated_time

            
            const updated_time = convertTimeToHoursMinutes(updatedTime)
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
                                <p class="card-text post-username" data-gaian-id=${post.gaian_id}> @${post.username}</p>
                                <p class="card-text ">Posted on: ${createdPostDate}  ${hours}:${minutes} ${ampm}</p>
                                <p class="card-text ">Last Updated: ${updatedPostDate}  ${updated_time.hours}:${updated_time.minutes} ${updated_time.ampm}</p>
                                <hr>
                                <p class="card-text post-details" style="white-space: pre-wrap;">${post.content} </p>
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
                let deleted = await deletePost(postID)
                if(deleted){
                    const modal = document.getElementById('cofirmPostDeletionModal'); 
                    const bootstrapModal = bootstrap.Modal.getInstance(modal)
                    await bootstrapModal.hide();

                    window.location.hash = '#posts'
                }else{
                    alert("Something went wrong. Post was not deleted")
                }
            })
            
            document.querySelector('.post-username').addEventListener('click', (e)=>{
                let gaianID = e.target.getAttribute('data-gaian-id')
                window.location.hash = `#gaian/${gaianID}`
            })
        } else {
            console.log("Failed to get post details");
            
        }
    } catch (error) {
        console.log("Error:", error);
    }
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
            const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
            const currentTime = new Date().toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const data = {
                title:editableItems[0].innerText,
                content:editableItems[1].innerText,
                updated_date: currentDate,
                updated_time: currentTime
            }
            console.log(data)
            let postID = window.location.hash.substring(6);
            const response = await fetch(`http://localhost:${PORT}/posts/${postID}`, {
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
function showCreatePostPage(){
    mainContainer.innerHTML = ''
    const child = `
    <h1 class = "text-center">Create A Post </h1>
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
        <button type="submit" class="btn btn-outline-dark">Create Post</button>
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
    <h1 class = "text-center">Create A Gaian </h1>
    <form id="create-gaian-form">
        <div class="mb-3">
            <label for="gaianUsername" class="form-label">Username</label>
            <input type="text" class="form-control" id="gaianUsername" placeholder="Enter username" required>
        </div>
        <button type="submit" class="btn btn-outline-dark">Create Gaian</button>
        
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


async function getGaianProfileData(gaianID){
    try {
        const response = await fetch(`http://localhost:${PORT}/gaians/${gaianID}`, {
            method:'GET',
            headers:{
                'Content-Type':'applicatin/json'
            }
        })

        if(response.ok){
            const data = await response.json()
            return data;
        }else{
            const errorData = await response.json()
            return errorData;
        }
    } catch (error) {
        console.log(error)
    }
}


async function showGaianProfilePage(gaianID){
    try {
        const {gaian,posts} = await getGaianProfileData(gaianID)
        mainContainer.innerHTML = ''
        const child = `
            <div class="container mt-5">
                <div class="row">
                    <div class="col-12 text-center">
                        <h2>${gaian.username}'s Profile</h2>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <h4>Total Posts: ${posts.length}</h4>
                    </div>
                </div>
                <div class="my-2">
                    <button type="button" class="btn btn-danger">Delete Gaian</button>
                </div>
                <div class="dropdown my-4">
                    <button class="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Sort by: <span id="sort-by-text">Recently Updated</span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" data-sortby="recently_updated">Recently Updated</a></li>
                        <li><a class="dropdown-item" href="#" data-sortby="new">New</a></li>
                        <li><a class="dropdown-item" href="#" data-sortby="old">Old</a></li>
                    </ul>
                </div>
                
                <div id="post-container">
            
                </div>   
            </div>
        
        `
        mainContainer.innerHTML += child
        
        
        let board = document.getElementById('post-container')
        const sortByText = document.getElementById('sort-by-text')
       
        const pagination = createPaginationElements(posts)
        mainContainer.appendChild(pagination);
        const sortPosts = (sortBy) => {
            if (sortBy === 'recently_updated') {
                posts.sort((post1,post2) => compareDateTime(post1,post2,'recently_updated'))
                sortByText.textContent = "Recently Updated"
            }else if (sortBy === 'new') {
                posts.sort((post1,post2) => compareDateTime(post1,post2,'asc'))
                sortByText.textContent = "New"
            }else if (sortBy === 'old') {
                posts.sort((post1,post2) => compareDateTime(post1,post2,'desc'))
                sortByText.textContent = "Old"
            }
            board.innerHTML = ''
            renderPosts(posts,board,0,post_display_limit)
        };

        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault()
                const sortBy = item.getAttribute('data-sortby');
                sortPosts(sortBy);
            });
        });

        const pagination_nav = document.querySelectorAll('.page-link')
        pagination_nav.forEach((page_number) =>{
            page_number.addEventListener('click', (e)=>{
                let clicked_index = e.target.textContent
                console.log(clicked_index)
                changeDisplayedPosts(clicked_index,posts,board)
            })
        })


        renderPosts(posts,board,0,post_display_limit)
        
    } catch (error) {
        console.log(error)
    }
}

function createPaginationElements(posts) {
    const pagination = document.createElement('nav');
    pagination.innerHTML = `
        <ul class="pagination">
            ${
                Array.from({ length: Math.ceil(posts.length / 10) }, (_, i) => `
                    <li class="page-item">
                        <p class="page-link">${i + 1}</p>
                    </li>
                `).join('')
            }
        </ul>
    `;
    return pagination;
}


function compareDateTime(obj1, obj2, sortOrder = 'asc') {
    if(sortOrder === 'recently_updated'){
        const dateTime1 = obj1.updated_date + ' ' + obj1.updated_time
        const dateTime2 = obj2.updated_date + ' ' + obj2.updated_time
        return dateTime2.localeCompare(dateTime1);
    }else{
        const dateTime1 = obj1.post_date + ' ' + obj1.post_time;
        const dateTime2 = obj2.post_date + ' ' + obj2.post_time;
        
        
        if (sortOrder === 'asc') {
            return dateTime2.localeCompare(dateTime1);
        } else {
            return dateTime1.localeCompare(dateTime2);
        }
    }
    
}


function renderPosts(posts,board,starting_index,ending_index){
    board.innerHTML = ''
    if (posts.length > 0) {
        
       
        for (let i = starting_index; i< ending_index; i++) {

            // Convert the ISO date string to a Date object
            const postDate = new Date(posts[i].post_date);

            // Format the date
            const postedOnDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(postDate);

            let time = posts[i].post_time
            const { hours, minutes, ampm } = convertTimeToHoursMinutes(time);

           
            const postHTML = `
                    <div class="container-sm d-sm-flex flex-column my-2 border-top text-break post" data-post-id=${posts[i].id}>
                        <p class="fw-light">@${posts[i].username}</p>
                        <p class="overflow-hidden fs-5 fw-bold">${posts[i].title}</p>
                        <p class="overflow-hidden fs-6">${posts[i].content.substring(0,100)}</p>
                        <p class="fs-6 fw-lighter"> <span class= "fst-italic" >Posted On</span>: ${postedOnDate} <span>${hours}:${minutes} ${ampm}</span></p>
                    </div>
                    
                    
            `;
            board.innerHTML += postHTML; 
        }
        document.querySelectorAll('.post').forEach(box =>{
            box.addEventListener('click', ()=>{
                window.location.hash = `#post/${box.getAttribute('data-post-id')}`
            })
        })
    } else {
        const postHTML = `
            <h1 class="text-center my-5"> No posts to show :( </h1>
         `;

        board.innerHTML += postHTML
    }
}

function changeDisplayedPosts(clickedIndex,all_posts,post_board){
    const starting_index = (clickedIndex * post_display_limit) -10;
    const ending_index = starting_index + post_display_limit;
    if(all_posts.length < ending_index){
        renderPosts(all_posts,post_board,starting_index,all_posts.length)
    }else{
        renderPosts(all_posts,post_board,starting_index,ending_index)
    }
    
}

function selectPageView() {
    const hash = window.location.hash;
  
    if (hash.startsWith('#post/')) {
      const postID = hash.substring(6); 
      showPostDetailsPage(postID);
    } else if(hash.startsWith('#gaian/')){
        const gaianID = hash.substring(7)
        showGaianProfilePage(gaianID)
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