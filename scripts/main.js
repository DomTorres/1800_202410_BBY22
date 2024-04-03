// $(document).ready(function () {
//     alert("Hello!");
//     $("#for-you-nav-link").addClass("active");
// });

// $(".nav-link").on("click", function(){
//     $(".nav-link").find(".active").removeClass("active");
//     $(this).addClass("active");
//     alert("Hello!");
//   });
  
// function getNameFromAuth() {
//     firebase.auth().onAuthStateChanged(user => {
//         // Check if a user is signed in:
//         if (user) {
//             // Do something for the currently logged-in user here: 
//             console.log(user.uid); //print the uid in the browser console
//             console.log(user.displayName);  //print the user name in the browser console
//             userName = user.displayName;

//             //method #1:  insert with JS
//             document.getElementById("name-goes-here").innerText = userName;    

//             //method #2:  insert using jquery
//             //$("#name-goes-here").text(userName); //using jquery

//             //method #3:  insert using querySelector
//             //document.querySelector("#name-goes-here").innerText = userName

//         } else {
//             // No user is signed in.
//             console.log ("No user is logged in");
//         }
//     });
// }
// getNameFromAuth(); //run the function

// console.log(today);
// todayString = String(today);
// console.log(todayString);

// console.log(Date(todayString));


// Get date function
// function printDate() {
//     const currentDate = new Date();
//     console.log(currentDate);

//     const currentDayOfMonth = currentDate.getDate();
//     const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
//     const currentYear = currentDate.getFullYear();
    
//     const dateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
//     console.log("The date is: " + dateString);

//     // const timestamp = currentDate.getTime(); 
//     // console.log("The timestramp is: " + timestamp);
// }
// printDate();

const userID = localStorage.getItem("userID");
const userRef = db.collection("users").doc(userID);

function doAll() {
    saveUserIDToLocalStorage();
    loadNewsForToday();
    displayCards();
}
doAll();

// Get logged in user's ID, save it to local storage for future purposes
function saveUserIDToLocalStorage() {
    firebase.auth().onAuthStateChanged(user => {
        localStorage.setItem("userID", user.uid);
    })
}

/**
 * This function is intended to run only ONCE per day, at the user's first load on that day. 
 */
function fetchNewsFromAPI() {
    console.log("Entered function fetchNewsFromAPI");

    // delete existing articles in the "for you" collection first
    // userRef.collection("for_you").get().then()

    // if user didn't complete yesterday's goal, set streak to 0
    userRef.get()
        .then(user => {
            if (Number(user.data().articlesPerDay_preference) != Number(user.data().articles_read_today)) {
                userRef.update({
                    streak: 0
                })
            }
        })

    // reset user's number of articles read today
    userRef.update({
        articles_read_today: 0
    })

    // fetch news from API
    userRef.get()
        .then(user => {

        var country = user.data().country_preference;
        var category = user.data().category_preference;
        var articlesPerDay = user.data().articlesPerDay_preference;
        var from = "2024-03-17T00:00:00Z"; // This needs to be dynamically based based on the current date.

        // console.log("Country read from database: " + country);
        // console.log("Category read from database: " + category);
        // console.log("articlesPerDay read from database: " + articlesPerDay);

        var url = `https://gnews.io/api/v4/top-headlines?category=${category}&country=${country}&max=${articlesPerDay}&from=${from}&apikey=${news_api_key}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                var articles = data.articles;
                // console.log(articles);
                // console.log("length:" + articles.length);

                for(let i = 0; i < articles.length; i++) {                    

                    // Write each article into the database
                    db.collection("users").doc(userID).collection("for_you").add({
                        title: articles[i].title,
                        description: articles[i].description,
                        content: articles[i].content,
                        // url: articles[i].url,
                        image: articles[i].image,
                        publishedAt: articles[i].publishedAt,
                        // sourceName: articles[i].source.name,
                        // sourceURL: articles[i].source.url

                        country: country,
                        category: category
                    });
                }  

                // Set date last loaded to today
                userRef.update({
                    // date_last_loaded: String(new Date())) // ACTUAL CODE
                    date_last_loaded: String(new Date("Mar 03, 2024")), // CODE FOR TESTING PURPOSES
                })

                displayCards();
            })
        })
}

function loadNewsForToday() {
    userRef.get()
        .then(user => {
            console.log("Date read from database: " + user.data().date_last_loaded);

            var dateLastLoaded = new Date(user.data().date_last_loaded);
            console.log(dateLastLoaded);

            // var dateToday = new Date(); // ACTUAL CODE
            var dateToday = new Date("Mar 04, 2024") // CODE FOR TESTING PURPOSES
            console.log("Date today: " + dateToday);

            console.log(dateLastLoaded.getDate() > dateToday.getDate());
            if (dateToday > dateLastLoaded) {
                console.log("We need to fetch news for today.");
                fetchNewsFromAPI();
            } else {
                console.log("Today's cards are already fetched.");
            }
        }) 

}

// Display news from database
function displayCards() {
    let cardTemplate = document.getElementById("newsCardTemplate");

    userRef.collection("for_you").get()
        .then(query => {
            query.forEach(article => {
                // Clone template card
                let newcard = cardTemplate.content.cloneNode(true);

                // Set card details
                newcard.querySelector('.card-img').setAttribute("src", article.data().image);
                newcard.querySelector('.headline').innerHTML = article.data().title;
                newcard.querySelector('.preview').innerHTML = article.data().description;
                // newcard.querySelector('.time-to-read').innerHTML = time_to_read + " minute read";
                newcard.querySelector('.country').innerHTML = article.data().country;

                // Set card hyperlink
                newcard.querySelector("a").href = "article.html?id=" + article.id;

                // Add card to DOM
                document.getElementById("for-you-cards-go-here").appendChild(newcard);
            })
        })
}

userRef.onSnapshot(user => {
    var articlesLeft = Number(user.data().articlesPerDay_preference) - Number(user.data().articles_read_today);

    if (articlesLeft == 0) {
        document.getElementById("articles-left-goes-here").innerHTML = "You've completed your daily goal! Come back tomorrow.";
    } else {
        document.getElementById("articles-left-goes-here").innerHTML = "Nice going! Read " + articlesLeft + " more articles to complete your daily goal.";
    }
});
