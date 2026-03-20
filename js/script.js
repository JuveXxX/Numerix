
const button= document.getElementById('button-check')
const temps= document.getElementById('temps')
const deb= document.getElementById('deb')
const fin= document.getElementById('fin')
const mil= document.getElementById('mil')
const message= document.getElementById('message')
const icone= document.createElement('i')
const input=document.getElementById('input-nombre')
const clic= document.getElementById('clic')

let jeuTermine=false;

// Le compteur
let compteur=0;




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
		temps.innerText=`${h}h:${m}m:${s}s`;

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
let vue= nombreAleatoire()


function situerChoix(index){
	if (vue > index && index > 1) {
		deb.textContent=index;

	} else if(vue < index && index < 101){
		fin.textContent=index;

	} else if (vue > index && index < 1){
		deb.textContent="1";

	} else if (vue < index && index > 101) {
		fin.textContent="100";
	}
}

// La fonction proposer le nombre

function proposerNombre(){

	if (jeuTermine) {
		rejouer();
		return;
	}

	compteur++;
	clic.innerText= `coup: ${compteur}`;

	// Récupération de la valeur
	const valeur= input.value


	// Convertir la chaine de caractère en entier
	const valeurNet= parseInt(valeur, 10)


	// Vérification du nombre proposé
	if (valeurNet=== vue) {

		mil.textContent=vue
		mil.classList.add("text-white", "bg-success", "rounded-circle", "m-1", "p-1")
		message.textContent= "Bravo" 
		message.classList.add("bien-joue", "rounded")
		arretTemps()

		button.innerText= "Rejouer";
		button.classList.remove("btn-primary");
		button.classList.add("btn-warning");
		jeuTermine=true;
		

	} else if (valeurNet > vue) {
		situerChoix(valeurNet)
		message.textContent= "Le nombre est plus petit"
		message.classList.add("presque", "rounded")
		supprimeStyle(message)

	} else if (valeurNet < vue) {

		situerChoix(valeurNet)
		message.textContent= "Le nombre est plus grand"
		message.classList.add("presque", "rounded")
		supprimeStyle(message)

	} else if(valeurNet < 1 || valeurNet > 100){

		message.textContent= "La valeur ne se situe pas dans l'intervalle"
		message.classList.add("error", "rounded")
		supprimeStyle(message)
	}

	else{
		message.textContent= "Entrez un nombre"
		message.classList.add("error", "rounded")
		supprimeStyle(message)
	}

}


// La fonction de rejouer

function rejouer() {

	vue= nombreAleatoire();
	temps.innerText="00h:00m:00s";
	message.classList.remove('bien-joue', 'presque', 'error');
	message.textContent="";
	input.value="";
	clic.innerText="coup: 0";
	deb.textContent="1";
	mil.textContent="?";
	mil.classList.remove("text-white", "bg-success", "rounded-circle", "m-1", "p-1");
	fin.textContent="100";
	button.innerText="Valider";
	button.classList.remove("btn-warning");
	button.classList.add("btn-primary");
	afficherTemps()
	jeuTermine= false;
}





afficherTemps();







