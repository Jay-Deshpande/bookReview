<?php
/*
	Sends information about various books back to the user depending
	on the mode and title parameters that the user adds. It also tells
	the user when they have made an error in their request. 
*/

	error_reporting(E_ALL);
	header("Access-Control-Allow-Origin: *"); //enables access to js fetch

	if (!isset($_GET['mode'])) {
        error("Error: Please provide a mode of description, info, reviews, or books.");
		return;
	}
	switch ($_GET['mode']) {
		case "books":
		  	header("Content-type: application/json");
			$bookFolders = glob("resources/books/*");
			$output['books'] = array();
			$i = 0;
			foreach ($bookFolders as $folder) {
				$infoFile = glob($folder . "/info.txt");
				$lines = file($infoFile[0], FILE_IGNORE_NEW_LINES);
				$bookTitle = trim($lines[0]);
				$folderName = explode("/", $folder);
				$folderName = $folderName[2];
				$output['books'][$i]['title'] = $bookTitle;
				$output['books'][$i]['folder'] = $folderName;
				$i++;
			}
			print(json_encode($output));
		  	break;
		case "description": 
			if (checkTitle($_GET['title'])) {
				$descriptionPath = getPath("description", "text/plain");
				$description = file_get_contents($descriptionPath[0]);
				print(trim($description));
			}
			break;
		case "info":
			if (checkTitle($_GET['title'])) {
				$infoPath = getPath("info", "application/json");
				$info = file($infoPath[0], FILE_IGNORE_NEW_LINES);
				$output = array();
				$output['title'] = trim($info[0]);
				$output['author'] = trim($info[1]);
				$output['stars'] = trim($info[2]);
				print(json_encode($output));
			}
			break;
		case "reviews":
			if (checkTitle($_GET['title'])) {
				$reviews = getPath("review*", "application/json");
				$output = array();
				$i = 0;
				foreach ($reviews as $review) {
					$reviewLines = file($review, FILE_IGNORE_NEW_LINES);
					$output[$i]['name'] = trim($reviewLines[0]);
					$output[$i]['score'] = trim($reviewLines[1]);
					$output[$i]['text'] = trim($reviewLines[2]);
					$i++;
				}
				print(json_encode($output));
			}
			break;
		default:
        	error("Error: Please remember to add the title parameter when using a mode of 
        			description, info, or review.");
        	return;
	}

	/**
 	* Sets the header to desired content type and returns the file path of the desired file/files
 	* param {string} $desiredFile - file specified by mode parameter
 	* param {string} $headerType - desired content type for header
 	*/
	function getPath($desiredFile, $headerType) {
		header("Content-type: " . $headerType);
		return glob("resources/books/" . $_GET['title'] . "/" . $desiredFile . ".txt");
	}

	/**
 	* Ensures the request has a valid and existing title parameter
 	* param {string} $title - user requested title parameter
 	*/
	function checkTitle($title) {
		if (!$title) {
			error("Error: Please add a title parameter.");
			return false;
		}
		$bookFolders = glob("resources/books/*");
		$bookTitles = array();
		foreach ($bookFolders as $bookFolder) {
			$folderName = explode("/", $bookFolder);
			$folderName = $folderName[2];
			$bookTitles[] = $folderName;
		}
		if (in_array($title, $bookTitles)) {
			return true;
		} else {
			error("Error: Invalid title parameter.");
			return false;
		}
	}

	/**
 	* Responds to request with error and appropriate error message
 	* param {string} $errorMessage - specific error message response
 	*/
	function error($errorMessage) {
		header("HTTP/1.1 400 Invalid Request");
        header("Content-type: text/plain");
        echo $errorMessage;
	}
?>