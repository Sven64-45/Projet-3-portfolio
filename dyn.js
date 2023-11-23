const api_url = 'http://localhost:5678/api/works';

const btnAll = document.querySelector("#filterTous");
const btnObjets = document.querySelector("#filterObjets");
const btnAPPT = document.querySelector("#filterAppt");
const btnHotelrestau = document.querySelector("#filterHotelrestau");

const gallery = document.querySelector(".gallery");

let data = null;
let id;

getProjets(data, null);

// purge gallery

function purgeGallery(){
    gallery.innerHTML="";
}

// génération gallery

async function getProjets(data, id) {
    const response = await fetch(api_url); 
    data = await response.json();
    purgeGallery();

     // Filtre les résultats
     if ([1, 2, 3].includes(id)) {
        data = data.filter(data => data.categoryId == id);}
    
    if (id === null || [1, 2, 3].includes(id)) {
        for (let i = 0; i < data.length; i++) {
            
            const figure = document.createElement("figure"); 
            gallery.appendChild(figure);
            figure.classList.add(`js-projet-${data[i].id}`); // Ajoute l'id du projet pour le lien vers la modale lors de la supression 
            const img = document.createElement("img");
            img.src = data[i].imageUrl;
            img.alt = data[i].title;
            figure.appendChild(img);

            const figcaption = document.createElement("figcaption");
            figcaption.innerHTML = data[i].title;
            figure.appendChild(figcaption);
        }

    }
}

// bouttons filtres

btnAll.addEventListener("click", () => { // Tous les projets
    getProjets(data, null);})

btnObjets.addEventListener("click", () => { // Objets
    getProjets(data, 1);})

btnAPPT.addEventListener("click", () => { // Appartements
    getProjets(data, 2);})

btnHotelrestau.addEventListener("click", () => { // Hôtels & restaurants
    getProjets(data, 3);})

// ****************** GESTION TOKEN ******************

// Récupération du token
const token = localStorage.getItem('token');
console.log(token);
baradmin();

// affichage barre admin et changement login/logout

async function baradmin() {

    document.querySelectorAll(".edit-admin").forEach(a => {
        if (token == null) {
            return;
        } else {
            a.removeAttribute("aria-hidden");
            a.removeAttribute("style");
            document.getElementById("js-logout").innerHTML = "logout";
            document.getElementById("js-logout").setAttribute("href", "#");
        }
    });
}

// Logout function
function logout() {
    // Clear the token from local storage
    localStorage.removeItem('token');
    
    // Redirect to the login page or perform any other desired action
    // For example, you can redirect to the homepage:
    window.location.href = '/login.html';
}

// Call the logout function when the logout button is clicked
document.getElementById('js-logout').addEventListener('click', logout);


// ***************** affichage modale *****************

let modal =null
let dataAdmin;

// purge gallery modale

function purgeGalleryModale(){
    document.querySelector(".js-admin-gallery").innerHTML="";
};


const openModale = function(event) {
    event.preventDefault();
    modal = document.querySelector(event.target.getAttribute("href"))
    galleryModale (); // affichage gallery de la modale
    modal.style.display = null
    modal.setAttribute("aria-hidden", "false")
    modal.setAttribute("aria-modal", "true")

    document.querySelectorAll(".js-modale-projet").forEach (a => {
        a.addEventListener("click", openModaleProjets);
    });

    modal.addEventListener("click", closeModale) 
    modal.querySelector(".js-modale-close").addEventListener("click", closeModale)
    modal.querySelector(".js-modale-stop").addEventListener("click", stopPropagation)
}

const closeModale = function(event) {
    if (modal === null) return
    event.preventDefault();
    modal.style.display = "none"
    modal.setAttribute("aria-hidden", "true")
    modal.removeAttribute("aria-modal")
    modal.removeEventListener("click", closeModale)
    modal.querySelector(".js-modale-close").removeEventListener("click", closeModale)
    modal.querySelector(".js-modale-stop").removeEventListener("click", stopPropagation)
    modal = null
}
document.querySelectorAll(".js-modale").forEach(a => {
    a.addEventListener("click", openModale);
});

const stopPropagation = function(event) {
    event.stopPropagation()
}  

window.addEventListener("keydown", function(event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModale(event)
    }
});

// ***************** affichage gallery modale *****************

async function galleryModale() {
    const response = await fetch(api_url); 
    dataAdmin = await response.json();
    const galleryModale = document.querySelector(".js-admin-gallery");
    purgeGalleryModale();

    for (let i = 0; i < dataAdmin.length; i++) {

        const div = document.createElement("div");
        div.classList.add("gallery-modale-projet");
        galleryModale.appendChild(div);

        const img = document.createElement("img");
        img.src = dataAdmin[i].imageUrl;
        img.alt = dataAdmin[i].title;
        div.appendChild(img);

        const p = document.createElement("p");
        div.appendChild(p);
        p.classList.add(dataAdmin[i].id, "js-modale-projet-suppr");

        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can");
        p.appendChild(icon);


    }
    deleteProjet();
};

// ************ SUPPRESSION PROJET ************

//listner sur les boutons supprimer
function deleteProjet () {
   let boutonsuppr = document.querySelectorAll(".js-modale-projet-suppr");
    for (let i = 0; i < boutonsuppr.length; i++) {
        boutonsuppr[i].addEventListener("click", deleteImage);
        };
};

async function deleteImage() {
    // console.log("DEBUG SUPRESSION")
    // console.log(this.classList[0])
    // console.log(token)
    await fetch(`http://localhost:5678/api/works/${this.classList[0]}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`},
    })
    .then (response => {
        console.log(response)
        // Token good
        if (response.status === 204) {
            console.log("DEBUG SUPPRESION DU PROJET " + this.classList[0])
            refreshPage(this.classList[0])
        }
        // Token inorrect
        else if (response.status === 401) {
            alert("Vous n'êtes pas autorisé à supprimer ce projet, merci de vous connecter avec un compte valide")
            window.location.href = "login.html";
        }
    })
    .catch (error => {
        console.log(error)
    })
}
// Rafraichit les projets sans recharger la page
async function refreshPage(i){
    galleryModale(); // Re lance une génération des projets dans la modale admin

    // supprime le projet de la page d'accueil
    const projet = document.querySelector(`.js-projet-${i}`);
    projet.style.display = "none";
}


// ************ AJOUT MODALE PROJET ************

let modaleProjets = null;
const openModaleProjets = function(event) {
    event.preventDefault();
    console.log("TEST MODALE PROJETS")
    modaleProjets = document.querySelector(event.target.getAttribute("href"))

    modaleProjets.style.display = null
    modaleProjets.setAttribute("aria-hidden", "false")
    modaleProjets.setAttribute("aria-modal", "true")
    // fermeture modaleProjets
    modaleProjets.addEventListener("click", closeModaleProjets) 
    modaleProjets.querySelector(".js-modale-close").addEventListener("click", closeModaleProjets)
    modaleProjets.querySelector(".js-modale-stop").addEventListener("click", stopPropagation)

    modaleProjets.querySelector(".js-modale-return").addEventListener("click", retourModale)

};

const closeModaleProjets = function(event) {   
    if (modaleProjets === null) 
    return
    // event.preventDefault();

    modaleProjets.setAttribute("aria-hidden", "true")
    modaleProjets.removeAttribute("aria-modal")

    modaleProjets.removeEventListener("click", closeModaleProjets)

    modaleProjets.querySelector(".js-modale-close").removeEventListener("click", closeModaleProjets)
    modaleProjets.querySelector(".js-modale-stop").removeEventListener("click", stopPropagation)

    modaleProjets.style.display = "none"
    modaleProjets = null
    closeModale(event)
};

// fonction retour modale
const retourModale = function(event) {
    event.preventDefault();
    modaleProjets.style.display = "none"
    modaleProjets = null
    modaleProjets(dataAdmin)
};

// listner sur le bouton ajouter projet
// document.querySelectorAll(".js-modale-projet").forEach (a => {
//     a.addEventListener("click", openModaleProjets);
// });

// listener sur le bouton validation ajouter projet
const btnAjouterProjet = document.querySelector(".js-add-work");
btnAjouterProjet.addEventListener("click", addProjet);

// ************ AJOUT PROJET ************

// async function addProjet(event) {
//     event.preventDefault();
//     // console.log("DEBUG AJOUT PROJET")
//     // console.log(token)
//     const form = document.querySelector(".modale-projet-form");
//     const formData = new FormData(form);
//     const dataForm = Object.fromEntries(formData);
//     console.log(dataForm)
//     await fetch("http://localhost:5678/api/works", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`},
//         body: JSON.stringify(dataForm),
//     })
//     // console.log(JSON.stringify(dataForm));
//     .then (response => {
//         console.log(response)
//         // Token good
//         if (response.status === 201) {
//             console.log("DEBUG AJOUT DU PROJET")
//             // refreshPage(dataForm)
//             alert("Projet ajouté avec succès :)");
//             modaleProjets(dataAdmin);
//             backToModale(event);
//             generationProjets(data, null);
//         }
//         // Token inorrect
//         else if (response.status === 401) {
//             alert("Vous n'êtes pas autorisé à ajouter un projet, merci de vous connecter avec un compte valide")
//             window.location.href = "login.html";
//         }
//     })
//     .catch (error => {
//         console.log(error)
//     })
// }

async function addProjet(event) {

    event.preventDefault();

    const title = document.querySelector(".js-title").value;
    const categoryId = document.querySelector(".js-categoryId").value;
    const image = document.querySelector(".js-image").files[0];

    if (title === "" || categoryId === "" || image === undefined) {
        alert("Merci de remplir tous les champs");
        return;
    } else if (categoryId !== "1" && categoryId !== "2" && categoryId !== "3") {
        alert("Merci de choisir une catégorie valide");
        return;
        } else {
            try {
                const formData = new FormData();
                formData.append("title", title);
                formData.append("category", categoryId);
                formData.append("image", image);

                const response = await fetch("http://localhost:5678/api/works", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
                console.log(response);
                console.log(formData);
                if (response.status === 201) {
                    alert("Projet ajouté avec succès :)");
                    galleryModale(dataAdmin);
                    retourModale(event);
                    getProjets(data, null);
                    
                } else if (response.status === 400) {
                    alert("Merci de remplir tous les champs");
                } else if (response.status === 500) {
                    alert("Erreur serveur");
                } else if (response.status === 401) {
                    alert("Vous n'êtes pas autorisé à ajouter un projet");
                    window.location.href = "login.html";
            }}

            catch (error) {
                console.log(error);
}}}
