/*
    Author: Jessmer John Palanca
    Section: CSC337 Web Programming SPRING2019, Homework 7
    Filename: bestreads.js
    Description: The web service for the bestreads.js
*/

const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.static('public'));

/** a fucntion that reads a file and stores each line into a lists
  * returns the list
*/
function readFile(bookTitle, mode_){
    let file = fs.readFileSync("books/" + bookTitle + "/" + mode_, 'utf8');
    let lines = file.split("\n");
    return lines;
}

/** a function that creates an info object
*/
function infoMode(title){
    // initializing an array of an object
    let info = {};
    // reading and parsing the info file
    let lines = readFile(title, "info.txt");
    // appending fieldname along with its corresponding value
    info["title"] = lines[0];
    info["author"] = lines[1];
    info["stars"] = lines[2];

    return info;
}

/** a function that creates a reviews object
*/
function reviewsMode(title, reviewFiles){
    // initializing an object for the reviews of the book
    let reviews = {};
    // stores all the review object
    // this will be the value of the fieldname "reviews" object
    let array = [];
    for (let i = 0; i < reviewFiles.length; i++){
        // creating a new array that stores a reviewer's name, rating, and the review
        let newObj = {};
        let lines = readFile(title, reviewFiles[i]);
        // removing an empty element in the list
        lines = lines.filter(Boolean);
        // appending fieldname along with its corresponding value
        newObj["name"] = lines[0];
        newObj["stars"] = lines[1];
        let rev = "";
        // if the reviewer wrote a multiple paragraph review
        if (lines.length > 3){
            for(let j = 2; j < lines.length; j++){
                rev += lines[j] + "\n";
            }
        }
        else{
            rev = lines[2];
        }
        newObj["review"] = rev;
        // adding the new object to the list
        array.push(newObj);
    }
    reviews["reviews"] = array;

    return reviews;
}

/** a function that creates a books object
*/
function booksMode(){
    // creating an object where its fieldname is 'book', and the value is a
    // list of book objects that has a book's title and folder name as the
    // fieldnames
    let books = {};
    // storing the book objects as a list
    let array = [];
    // a list of the foldernames in the books directory
    let files = fs.readdirSync("books");
    for(let i = 0; i < files.length; i++){
        let newObj = {};
        // fetching the the title of the book using the book's info
        let lines = readFile(files[i], "info.txt");
        let title = lines[0];
        // appending fieldname along with its corresponding value
        newObj["title"] = title;
        newObj["folder"] = files[i];
        // adding the object to the list
        array.push(newObj);
    }
    // setting the reviews object
    books["books"] = array;

    return books;
}

console.log('web service started');

app.get('/', function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    // query parameters
    let mode = req.query.mode;
    let title = req.query.title;
    // sending an error status and message when the user doesn't provide the mode parameter
    if(mode == undefined){
        res.status(400);
        res.send("Missing a mode parameter");
    }
    // if the mode requested/passed is info
    if(mode == "info"){
        let info = infoMode(title);
        // sending the data (in a string format)
        res.send(JSON.stringify(info));
    }

    // if the mode requested/passed is description
    else if(mode == "description"){
        // fetching the description of the book, and sending the requested data
        let description = readFile(title, "description.txt");
        res.send(description[0]);
    }

    // if the mode requested/passed is reviews
    else if(mode == "reviews"){
        // getting all the files inside the book directory folder
        // and store it in a list
        let files = fs.readdirSync("books/"+title);
        let reviewFiles = [];
        // parsing only the files that contains a "review" in their filenames
        // store it in a list
        for(let i = 0; i < files.length; i++){
            if(files[i].toLowerCase().includes("review")){
                reviewFiles.push(files[i]);
            }
        }

        let reviews = reviewsMode(title, reviewFiles);
        // sending the reviews object in a string format
        res.send(JSON.stringify(reviews));
    }

    // if the mode requested/passed is 'books'
    else if(mode == "books"){
        let books = booksMode();
        // sending the books object in a string format
        res.send(JSON.stringify(books));
    }
});
app.listen(3000);
