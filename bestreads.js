/*
    Author: Jessmer John Palanca
    Section: CSC337 Web Programming SPRING2019, Homework 7
    Filename: bestreads.js
    Description: The json file for the bestreads.html
*/

'use strict';

(function() {
    /** the fetchAllBooks and homeBtn functiona once the page is loaded.
    */
    window.onload = function(){
        fetchAllBooks();
        homeBtn();
    };

    /** This function fetches the book's cover image and title by using the mode=books
      * from the web service, and add these info to the div of the corresponding book.
    */
    function fetchAllBooks(){
        // resets the allbooks when the homeBtn is clicked
        document.getElementById("allbooks").innerHTML="";
        // hides the singlebook once the webpage is loaded or the allbooks is
        // being displayed/reloaded
        document.getElementById("singlebook").style.display = 'none';
        // url for fetching all the books (mod=books) from the web service
        let url = "http://localhost:3000/?mode=books";

        // fetching all the books from the web service
        fetch(url)
            .then(checkStatus)
            .then(function(responseText){
                // parsing the data into JSON format (an object)
                let json = JSON.parse(responseText);
                let allbooks = document.getElementById("allbooks");
                // a loop that takes care of adding tbe image of the book's cover
                // and the book's title to a div and adding that specific div to the
                // allbooks div that's already on the page.
                for (let i = 0; i < json.books.length; i++){
                    // getting the source of the image element
                    let imgSrc = "books/" + json.books[i].folder + "/cover.jpg";
                    // creating a new div for the cover image and the title
                    let newDiv = document.createElement("div");
                    newDiv.id = "book"+i;
                    newDiv.setAttribute("name", json.books[i].folder);
                    newDiv.classList.add("book");
                    // new element for the image
                    let newImg = document.createElement("img");
                    // adding the image source
                    newImg.src = imgSrc;
                    // new element for the title
                    let newP = document.createElement("p");
                    let text = document.createTextNode(json.books[i].title);
                    newP.appendChild(text);
                    newDiv.appendChild(newImg);
                    newDiv.appendChild(newP);
                    // appending the new div to the allbooks div
                    allbooks.appendChild(newDiv);
                }
                // go to this function immediately after all the books are displayed
                selectEvent();
            })
            .catch(function(error){
                alert(error);
            });
    }

    /** a function that creates a event listener when the home button is clicked
    */
    function homeBtn(){
        let homeBtn = document.getElementById("back");
        homeBtn.addEventListener("click", back);
    }

    /** When this function is called (when the home button is clicked), the allbooks
      * is displayed back from being hidden and calls the fetchAllBooks function
    */
    function back(){
        document.getElementById("allbooks").style.display = "block";
        fetchAllBooks();
    }

    /** this is an event function for when the user clicks a book from the page
    */
    function selectEvent(){
        // lists all the books in the page
        let bookList = document.querySelectorAll(".book");
        for(let i = 0; i < bookList.length; i++){
            let id = document.getElementById("book"+i);
            // getting the title of the book that's being selected by using the name
            // name attribute that was set in the fetchAllBooks function
            let title = id.getAttribute("name");
            // go to selectBook function that takes the title of the book that's being selected
            bookList[i].addEventListener("click", function(){selectBook(title);});
        }
    }

    /** This function fetches the book's info, description and reviews, and adding these
      * info to the singlebook div that's corresponding to the book that's being selected
    */
    function selectBook(title){
        // when a book is selected, the allbooks div will be hidden and the
        // singlebook div will be displayed
        document.getElementById("allbooks").style.display = 'none';
        document.getElementById("singlebook").style.display = 'block';
        // adding the image to the corresponding book
        let cover = document.getElementById("cover");
        cover.src = "books/" + title + "/cover.jpg";

        // URLs for tbe three modes from the web service
        let infoUrl = "http://localhost:3000/?mode=info&title=" + title;
        let descriptionUrl = "http://localhost:3000/?mode=description&title=" + title;
        let reviewsUrl = "http://localhost:3000/?mode=reviews&title=" + title;

        // fetching the info of the book
        fetch(infoUrl)
            .then(checkStatus)
            .then(function(responseText) {
                // parsing the data into a JSON object
                let json = JSON.parse(responseText);
                // adding the info of the book to its corresponding divs
                document.getElementById("title").innerHTML = json.title;
                document.getElementById("author").innerHTML = json.author;
                document.getElementById("stars").innerHTML = json.stars;
            });

        // fethcing the description of the book
        fetch(descriptionUrl)
            .then(checkStatus)
            .then(function(responseText) {
                document.getElementById("description").innerHTML = responseText;
            });

        // fetching the reviews of the book
        fetch(reviewsUrl)
            .then(checkStatus)
            .then(function(responseText) {
                // parsing the data into a JSON object
                let json = JSON.parse(responseText);
                let reviews = document.getElementById("reviews");
                // clearing the reviews div everytime when the page is fetching the
                // reviews of a particular book (overiding the previus review that was loaded)
                reviews.innerHTML = "";
                for(let i = 0; i < json.reviews.length; i++){
                    // adding an h3 element for the name and rating of the reviewer
                    let newh3 = document.createElement("h3");
                    let span = document.createElement("span");
                    span.innerHTML = json.reviews[i].stars;
                    newh3.innerHTML = json.reviews[i].name + " ";
                    newh3.appendChild(span);
                    // adding a paragraph for the user's book review
                    let review = document.createElement("p");
                    let text = document.createTextNode(json.reviews[i].review);
                    review.appendChild(text);
                    // appending these element to the review div that's already on the page
                    reviews.appendChild(newh3);
                    reviews.appendChild(review);
                }
            });
    }

    /** a function that checks and catches errors when the file is being fetched.
      * if an error is detected, it returns an error message, Otherwise, returns the
      * data that was requested.
    */
    function checkStatus(response) {
        if(response.status >= 200 && response.status < 300){
            return response.text();
        }
        else if(response.status === 400){
            return Promise.reject(new Error("Missing a mode parameter."));
        }
        else if (response.status === 404){
            return Promise.reject(new Error("File not found."));
        }
        else{
            return Promise.reject(new Error(response.status+": "+response.statusText));
        }
    }
})();
