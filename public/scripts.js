

const mainContainer= document.getElementById('main-container')

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch ('/gaians', {
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        })
        const gaians = response.json()
        if(response.ok){
            if(gaians.length > 0){
                console.log(gaians)

            }else{
                console.log("No gaians")
            }
        }else{
            console.log(response.error)
        }
    } catch (error) {
        console.log(error)
    }
  });
  



function showGaians(gaians){
    gaians.forEach(gaian => {
        
    });
}