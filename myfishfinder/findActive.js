let url = "static_data_min.json";

fetch(url)
	.then(resp => resp.json())
	.then(data => {
		let results = ``;
		for(let i = 0; i < data.fish.length; i++){
			let fish = data.fish[i];
			if(fish.ufb === "0"){
				console.log("num");
				results += `<p>${JSON.stringify(fish)},</p>`;
			}
		}
		$("#data-container").html(results);
	})
	.catch(error => {
		console.log(`error: ${error}`);
	});