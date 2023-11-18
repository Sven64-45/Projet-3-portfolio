let email = document.getElementById("email");
let password = document.getElementById("password");


document.getElementById("submit-button").addEventListener("click", function(event) {
    event.preventDefault(); // Empêcher le formulaire de se soumettre normalement
    let user = {
        email: email.value,
        password: password.value
    };
    login(user);
});
function login(id) {
    // Effectuer une requête HTTP pour envoyer les informations de connexion au serveur
    // Utiliser la méthode fetch pour envoyer une requête POST avec les données de l'utilisateur
    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(id)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Traiter la réponse du serveur
        if (data.token) {
            localStorage.setItem('token', data.token);
            // Si la connexion est réussie, rediriger l'utilisateur vers la page d'accueil
            window.location.href = 'index.html';
        } else {
            // Si la connexion échoue, afficher un message d'erreur à l'utilisateur
            alert('Identifiants incorrects. Veuillez réessayer.');
        }
    })
    .catch(error => {
        // Gérer les erreurs de la requête
        console.error('Une erreur s\'est produite lors de la connexion :', error);
    });
}
