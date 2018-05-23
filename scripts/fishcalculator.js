
// set all DOM references
const form = document.getElementById("query");
const levelInput = document.getElementById("level");
const budgetInput = document.getElementById("budget");
const tankInput = document.getElementById("tanks");
const timeframeInput = document.getElementById("timeframe");
const superGroInput = document.getElementById("super-Gro");
const timeframeDiv = document.getElementById("timeframe-div");
const wait = document.getElementById("wait");
let url = "static_data.json";


// on form submit, find the most profitable fish
form.addEventListener("submit", (event) => {
	event.preventDefault();
	// clear bestFish results
	resetFish();

	// get values from input
	let level = parseInt(levelInput.value);
	let budget = parseInt(budgetInput.value);
	let tanks = parseInt(tankInput.value);
	let timeframeText = timeframeInput.value;
	let timeframeVal = timeframeText.substring(timeframeText.indexOf(' '), length);
	let superGro = superGroInput.checked;

	// testing values
	// let level = 7;
	// let budget = 25000;
	// let tanks = 8;
	// let timeframeText = timeframeInput.value;
	// let timeframeVal = timeframeText.substring(timeframeText.indexOf(' '), length);
	// let superGro = superGroInput.checked;

	console.log(`level: ${level} budget: ${budget} tanks: ${tanks} timeframe: ${timeframeText} super-Gro: ${superGro}`);
	if(!validateInput(level, budget, tanks)){
		wait.style.display = "block";
		fetch(url)
			.then(response => response.json())
			.then(data => {
				// only look at fish that are:
				// currently available and
				// don't require fish bucks and
				// are available at the players level
				for(let i = 0; i < data.fish.length; i++){
					let fish = data.fish[i];
					if(fish.active === "1" &&
						fish.ufb === "0" &&
						parseInt(fish.rl) <= level &&
						parseInt(fish.pp) <= budget){
						// if the player is using supergrow, timeframe doesn't matter
						// otherwise check timeframe option
						if(superGro){
							checkFish(fish, level, budget, timeframeText, superGro, tanks);
						}
						else if(fish.aa == timeframeVal){
							checkFish(fish, level, budget, timeframeText, superGro, tanks);
						}
					}
				}
				console.log(bestFish);
				wait.style.display = "none";
				// display the best fishes stats
				showFish(tanks);
			})
			.catch(error => {
				console.log(`error: ${error}`);
			});
	}
});


function validateInput(level, budget, tanks){
	let error = `<p>Please enter a valid `;
	let numOfErrors = 0;
	if(isNaN(level) || level === ""){
		error += `level`;
		numOfErrors++;
	}
	if(isNaN(budget) || budget === ""){
		if(numOfErrors !== 0){
			error += `, `;
		}
		error += `budget`;
		numOfErrors++;
	}
	if(isNaN(tanks) || tanks === ""){
		if(numOfErrors !== 0){
			error += `, `;
		}
		error += `number of tanks`;
		numOfErrors++;
	}
	error += `.</p>`;
	if(numOfErrors > 0){
		let results = document.getElementById("fish-stats");
		results.style.display= "block";
		$("#fish-stats").html(error);
		results.scrollIntoView({behavior: 'smooth'});
	}
	return numOfErrors;
}

// if the player is using super grow, we shouldn't check timeframe
// if super grow is checked hide timeframe
superGroInput.addEventListener("change", (event) => {
	if(superGroInput.checked){
		timeframeDiv.style.display = "none";
	}
	else{
		timeframeDiv.style.display = "block";
	}
});


// set and clear bestFish results
function resetFish(){
	bestFish = {
		id: "",
		cat: "", 	// category
		n: "", 		// name
		pp: "",		// purchase price
		sp: "",		// sell price
		t: "",		// texture? (relates to image)
		profPerFish: 0,
		maxNumOfFish: 0,
		profit: 0,
		marketProfit: 0,
		totalProfit: 0,
		maxMarketProfit: 0,
		totalMarketProfit: 0,
		aa: timeframe
	}
}

// calculate the current fishes profitability and compare it to the current bestFish result
// if the profitability ois higher than the current bestFish, replace BestFish with current fish
function checkFish(fish, level, budget, timeframe, superGro, tanks){
	console.log("checking");
	let tankMax = tanks * 250;
	let maxFish = Math.floor(budget / parseInt(fish.pp));
	let profitPerFish = parseInt(fish.sp) - parseInt(fish.pp);
	if(superGro && maxFish > 250){
		maxFish = 250;
	}
	else if(maxFish > tankMax){
		maxFish = tankMax;
	}
	let prof = profitPerFish * maxFish;
	if(prof > bestFish.profit){
		let totalProf = prof + budget;
		let marketProf = Math.floor(profitPerFish / 1.15);
		let maxMarketProf = Math.floor(prof / 1.15);
		let totalMarketProf = maxMarketProf + budget;
		if(superGro){
			timeframe = "instant";
		}
		bestFish = {
			id: fish.id,
			cat: fish.cat,
			n: fish.n,
			pp: fish.pp,
			sp: fish.sp,
			t: fish.t,
			profPerFish: profitPerFish,
			maxNumOfFish: maxFish,
			profit: prof,
			marketProfit: marketProf,
			totalProfit: totalProf,
			maxMarketProfit: maxMarketProf,
			totalMarketProfit: totalMarketProf,
			aa: timeframe
		};
	}
}

// display the best fishes stats
function showFish(tanks){
	let stats = ``;
	if(bestFish.id === ""){
		stats += `<p class="no-fish">No Fish Matching This Query Was Found, Please Try Again.</p>`;
	}
	else{
		stats = `
				<div>
					<h1 id="fish-header">The Most Profitable Fish In This Case Is:</h1>
					<h2 id="fish-name">${bestFish.n}</h2>
					<img id="fish-pic" src="https://fw.bigvikinggames.com/images/dialog/itempics/Fish${bestFish.t}.jpg" alt="Picture of ${bestFish.n}">
					<ul class="results-list">
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Purchase Price: <span class="amount">${monify(parseInt(bestFish.pp))}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Sell Price: <span class="amount">${monify(parseInt(bestFish.sp))}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Profit Per Fish: <span class="amount">${monify(bestFish.profPerFish)}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Profit Per Fish At Market (-15%): <span class="amount">${monify(bestFish.marketProfit)}</span></p></li>`;
					if(bestFish.aa === "instant"){
						stats += `<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">How Many You Can Buy With Super-Gro: <span class="amount">${bestFish.maxNumOfFish.toLocaleString()}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Profit Per Super-Gro: <span class="amount">${monify(bestFish.profit)}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Total After Super-Gro: <span class="amount">${monify(bestFish.totalProfit)}</span></p></li>`;
					}
					else{
						stats += `<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">How Many You Can Buy with ${tanks} tank(s): <span class="amount">${bestFish.maxNumOfFish.toLocaleString()}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Profit Per ${bestFish.aa}: <span class="amount">${monify(bestFish.profit)}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p><p class="resultText">Total After ${bestFish.aa}: <span class="amount">${monify(bestFish.totalProfit)}</span></p></li>`;
					}
			stats += `
						<li class="result"><p class="bullet">&#x2022;</p class="resultText"><p>Profit At Market Sell (-15%): <span class="amount">${monify(bestFish.maxMarketProfit)}</span></p></li>
						<li class="result"><p class="bullet">&#x2022;</p class="resultText"><p>Total After Market Sell (-15%): <span class="amount">${monify(bestFish.totalMarketProfit)}</span></p></li>
					</ul>
				</div>`;
	}
	let results = document.getElementById("fish-stats");
	results.style.display= "block";
	$("#fish-stats").html(stats);
	results.scrollIntoView({behavior: 'smooth'});
}

function monify(value){
	return (value).toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0
	});
}

// sort adult age times
function sortTimes(times) {
	let newTimes = [];
	let checkHours = /Hour/;
	let checkMins = /Min/;
	let checkDays = /Day/;

	// check if array contains hours or mins qualifiers
	// if it does split them into 2 groups, sort them 
	// and put them back together with their qualifiers
	if(checkHours.test(times)){
		let mins = [];
		let hours = [];
		// split hours and mins values into seperate groups
		for(let i = 0; i < times.length; i++){
			if(checkMins.test(times[i])){
				mins.push(times[i]);
			}
			else {
				hours.push(times[i]);
			}
		}

		// remove hours and mins qualifiers
		for(let x = 0; x < mins.length; x++){
			mins[x] = mins[x].substring(mins[x].indexOf(' '), length);
		}
		for(let x = 0; x < hours.length; x++){
			hours[x] = hours[x].substring(hours[x].indexOf(' '), length);
		}

		// sort the numbers
		mins = mins.sort(function(a, b){return a - b});
		hours = hours.sort(function(a, b){return a - b});

		//add the qualifiers back
		for(let x = 0; x < mins.length; x++){
			mins[x] += " Mins";
		}
		for(let x = 0; x < hours.length; x++){
			hours[x] += " Hours";
		}

		// create a new array with lowest numbers and minutes first
		for(let x = 0; x < mins.length; x++){
			newTimes.push(mins[x]);
		}
		for(let x = 0; x < hours.length; x++){
			newTimes.push(hours[x]);
		}
	}
	else{ // if array only contains time values just sort them ascending
		newTimes = times.sort(function(a, b){return a - b});
	}

	// return sorted times
	return newTimes;
}

// removes time qualifiers from timeframes
function removeTimeQualifiers(times){
	let newTimes = [];
	let mins = [];
	let hours = [];
	let checkMins = /Mins/;

	// split hours and mins values into seperate groups
	for(let i = 0; i < times.length; i++){
		if(checkMins.test(times[i])){
			mins.push(times[i]);
		}
		else{
			hours.push(times[i]);
		}
	}

	// remove hours and mins qualifiers
	for(let x = 0; x < mins.length; x++){
		mins[x] = mins[x].substring(mins[x].indexOf(' '), length);
	}
	for(let x = 0; x < hours.length; x++){
		hours[x] = hours[x].substring(hours[x].indexOf(' '), length);
	}

	// sort the numbers
	mins = mins.sort(function(a, b){return a - b});
	hours = hours.sort(function(a, b){return a - b});

	// create a new array with lowest numbers and minutes first
	for(let x = 0; x < mins.length; x++){
		newTimes.push(mins[x]);
	}
	for(let x = 0; x < hours.length; x++){
		newTimes.push(hours[x]);
	}

	return newTimes;
}

// check if adult age is in minutes or hours
function checkFast(fish){
	let isFast = false;
	if(fish.m !== undefined){
		let mods = fish.m;
		let condition = /"fast":true/;
		if(condition.test(mods)){
			isFast = true;
		}
	}
	return isFast;
}

// find and display every possible option for adult age
function getTimeframeOptions(){
	fetch(url)
		.then(response => response.json())
		.then(data => {
			// create arrays to carry adult age options in text and number formats
			let timeVals = [];

			for(let i = 0; i < data.fish.length; i++){
				let fish = data.fish[i];

				// only look at fish that are:
				// currently available and
				// don't require fish bucks
				if(fish.active === "1" &&
					fish.ufb === "0"){
					let adultAge = parseInt(fish.aa);
					// to find minute values check for fast key in fish.m object
					if(checkFast(fish)){
						adultAge += " Mins";
					}
					else{
						adultAge += " Hours";
					}
					// if the fishes adult age value hasn't been found append it to the list
					if(timeVals.indexOf(adultAge) == -1){
						timeVals.push(adultAge);
					}
				}
			}
			// create var that will become DOM elements
			let timeframes = "";

			timeVals = sortTimes(timeVals);

			// create Dom elements
			for(let x = 0; x < timeVals.length; x++){
				timeframes += `<option value="${timeVals[x]}">${timeVals[x]}</option>`;
			}

			// add the elements to the DOM
			$("#timeframe").html(timeframes);
		});
}

// setup application
function main(){
	// find and display every possible option for adult age
	// getTimeframeOptions();
	// create and initialize the bestFish object
	let bestFish;
	resetFish();
}

// setup application
main();