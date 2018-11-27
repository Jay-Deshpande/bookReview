/*
	Fills the bestreads page with books from an api and allows the user
	to click on different books to learn more about them. The javascript
	enables the user to view a lot of information about individual books,
	including a short description and various reviews.
*/

"use strict";
(function() {

	window.onload = function() {
		fetch("http://localhost:8888/bestreads.php?mode=books")
			.then(checkStatus)
			.then(function(responseText) {
				$("singlebook").classList.add("hidden");
				displayBooks(JSON.parse(responseText));
			})
			.catch(function(responseText) {
				error(responseText);
			});
			$("error-message").classList.add("hidden");
			$("back").onclick =
				function() {
					window.location.reload(true); //forces reload from server
				};
	};

	/**
 	* Displays every book's title and cover from the api response
 	* @param {object} response - api response of all books
 	*/
	function displayBooks(response) {
		for (let i = 0; i < response['books'].length; i++) {
			let title = document.createTextNode(response['books'][i]['title']);
			let newPara = document.createElement("p");
			newPara.appendChild(title);
			let folder = response['books'][i]['folder'];
			let img = document.createElement("IMG");
			let imgPath = "resources/books/" + folder + "/cover.jpg";
			img.setAttribute("src", imgPath);
			let bookDiv = document.createElement("div");
			bookDiv.appendChild(newPara);
			bookDiv.appendChild(img);
			bookDiv.onclick = function() {
				displaySingleBook(folder, imgPath);
			};
			$("allbooks").appendChild(bookDiv);
		}
	}

	/**
 	* Displays information about a single chosen book
 	* @param {string} folder - name of the folder that contains information about book
 	* @param {string} imgPath - book cover image path
 	*/
	function displaySingleBook(folder, imgPath) {
		//empty allbooks
		let allBooks = $("allbooks").childNodes;
		for (let i = 0; i < allBooks.length; i++) {
			while(allBooks[i].firstChild) {
				allBooks[i].removeChild(allBooks[i].firstChild);
			}
		}
		$("allbooks").classList.add("hidden");
		//show singlebook and get book info
		$("singlebook").classList.remove("hidden");
		$("cover").src = imgPath;
		getBookInfo("description", folder);
		getBookInfo("info", folder);
		getBookInfo("reviews", folder);
	}

	/**
 	* Fetches information about an individual book from the api
 	* @param {string} mode - api mode
 	* @param {string} folder - name of the folder containing resources for book
 	*/
	function getBookInfo(mode, folder) {
		fetch("http://localhost:8888/bestreads.php?mode=" + mode + "&title=" + folder)
			.then(checkStatus)
			.then(function(responseText) {
				useApiResponse(mode, responseText);
			})
			.catch(function(responseText) {
				error(responseText);
			});
	}

	/**
 	* Uses information from the api response to display information for chosen book
 	* @param {string} mode - api mode
 	* @param {object} response - api response
 	*/
	function useApiResponse(mode, response) {
		if (mode === "description") {
			$("description").innerText = response;
		} else if (mode === "info") {
			response = JSON.parse(response);
			$("title").innerText = response['title'];
			$("author").innerText = response['author'];
			$("stars").innerText = response['stars'];
		} else {
			response = JSON.parse(response);
			for (let i = 0; i < response.length; i++) {
				// review name goes in h3 element, score goes in span element then added to h3
				let reviewTitle = document.createElement("h3");
				let scoreSpan = document.createElement("span");
				let score = document.createTextNode(" " + response[i]['score']);
				scoreSpan.appendChild(score);
				let reviewName = document.createTextNode(response[i]['name']);
				reviewTitle.appendChild(reviewName);
				reviewTitle.appendChild(scoreSpan);
				// review text goes in p element
				let reviewPara = document.createElement("p");
				let reviewText = document.createTextNode(response[i]['text']);
				reviewPara.appendChild(reviewText);
				// append both directly into reviews section
				$("reviews").appendChild(reviewTitle);
				$("reviews").appendChild(reviewPara);
			}
		}
	}

	/**
 	* Displays an error message to the user if api returns error
 	* @param {string} errorMessage - error message shown to user
 	*/
	function error(errorMessage) {
		$("error-message").classList.remove("hidden");
		$("error-text").innerText = errorMessage;
	}

	/**
 	* Determines if api call is successful.
 	* @param {object} response - element ID
 	* @return {object} text version of api response
 	*/
	function checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return response.text();
		} else {
			return Promise.reject(new Error(response.status + ": " + response.statusText));
		}
	}

	/**
 	* Returns the element that has the ID attribute with the specified value.
 	* @param {string} id - element ID
 	* @return {object} DOM object associated with id
 	*/
	function $(id) {
		return document.getElementById(id);
	}

})();