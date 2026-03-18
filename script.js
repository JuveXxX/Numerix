
const button= document.getElementById('button-click')
const temps= document.getElementById('temps')
const deb= document.getElementById('deb')
const fin= document.getElementById('fin')
const mil= document.getElementById('mil')

// La fonction pour générer un nombre aléatoire

const nombreAleatoire = () =>{
	const nombreDecimal= (Math.random() * 101)
	const nombreEntier= Math.trunc(nombreDecimal)

	return nombreEntier
}


// Le chronomètre

let secondes=0;
let minutes=0;
let heures=0;
let interval;

function afficherTemps(){
	interval= setInterval(() =>{
		secondes++;
		if (secondes===60) {
		  secondes=0;
		  minutes++;
		}

		if (minutes===60) {
			minutes=0;
			heures++;
		}

		// Formater l'affichage
		let s= secondes < 10 ? "0" + secondes: secondes;
		let m= minutes < 10 ? "0" + minutes: minutes;
		let h= heures < 10 ? "0" + heures: heures;

		// Affecter à l'interface
		temps.innerText=`${h}:${m}:${s}`;

	}, 1000);
}

// arrêt du chronomètre

function arretTemps(){
	clearInterval(interval);
}

// La fonction pour supprrimer le message après 5 secondes

function supprimeStyle(message) {
	if (message) {
		setTimeout(() =>{
			message.classList.remove('bien-joue', 'presque', 'error');
			message.innerText='';
		}, 5000)
	}
}



// Création du nombre généré
const vue= nombreAleatoire()


function situerChoix(index){
	if (vue > index) {
		deb.textContent=index;
	} else{
		fin.textContent=index;
	}
}


// Le compteur
let compteur=0;

// La fonction proposer le nombre

function proposerNombre(){

	compteur++;
	document.getElementById('clic').innerText= `fois: ${compteur}`;

	// Récupération de la valeur
	const input=document.getElementById('input-nombre')
	const valeur= input.value


	// Convertir la chaine de caractère en entier
	const valeurNet= parseInt(valeur, 10)


	// La div du message
	const message= document.getElementById('message')
	const icone= document.createElement('i')


	// Vérification du nombre proposé
	if (valeurNet=== vue) {

		mil.textContent=vue
		mil.classList.add("text-white", "bg-success", "rounded-circle", "m-1", "p-1")
		message.textContent= "Bravo" 
		message.classList.add("bien-joue", "rounded")
		arretTemps()
		

	} else if (valeurNet > vue) {
		situerChoix(valeurNet)
		console.log("trop grand")
		message.textContent= "Le nombre est plus petit"
		message.classList.add("presque", "rounded")
		supprimeStyle(message)

	} else if (valeurNet < vue) {

		situerChoix(valeurNet)
		message.textContent= "Le nombre est plus grand"
		message.classList.add("presque", "rounded")
		supprimeStyle(message)

	} else {

		message.textContent= "Erreur"
		message.classList.add("error", "rounded")
		supprimeStyle(message)
	}

}




afficherTemps();







