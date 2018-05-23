let url = "static_data_min.json";

fetch(url)
	.then(resp => resp.json())
	.then(data => {
		let results = ``;
		for(let i = 0; i < data.fish.length; i++){
			let fish = data.fish[i];
			if(fish.ufb === "0" ||
				fish.active !== "1"){
				console.log("num");
				results += `${JSON.stringify(fish)},`;
			}
		}
		document.getElementById("data-container").innerHTML = results;
		// $("#data-container").html(results);
	})
	.catch(error => {
		console.log(`error: ${error}`);
	});