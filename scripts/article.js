// news constatns
var userID;
var userRef;
var newsID;
var displayName;

// triggers function calls
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("Logged in");

        userID = user.uid;
        displayName = user.displayName;
        console.log(userID);

        userRef = db.collection("users").doc(userID);
        console.log(userRef);

        // localStorage.setItem("userID", user.uid);
        console.log("Saved auto userID to local storage.");

        // call function isNewDay
        loadArticle();

    } else {
        console.log("No user is signed in.");
    }
});

// loads article
function loadArticle() {
    let params = new URL(window.location.href);

    newsID = params.searchParams.get("id"); 
    const docRef = userRef.collection("for_you").doc(newsID);

    docRef.get().then(article => {
        let title = article.data().title;
        let image = article.data().image;
        let content = article.data().content;
        let publishedAt = article.data().publishedAt;
        let sourceName = article.data().sourceName;
        let url = article.data().url;

        document.querySelector("#title").innerHTML = title;
        document.querySelector("#publishedAt-goes-here").innerHTML = publishedAt;
        document.querySelector("#sourceName-goes-here").innerHTML = sourceName;
        document.querySelector("#image").setAttribute("src", image);
        document.querySelector("#content").innerHTML = content;
        document.querySelector("#url-goes-here").innerHTML = url;
        document.querySelector("#url-goes-here").setAttribute("href", url);
    })
}

// when done reading, updates user points and streak
document.querySelector("#done-reading").addEventListener("click", () => {
    const docRef = db.collection("news").doc(newsID)
 
    const pointsForReading = 100;
    const bonusPointsForReading = 50;

    userRef.get()
        .then(user => {
            // Read points, articles read today
            points = user.data().points;
            console.log("Points read from database:" + points);

            streak = user.data().streak;
            console.log("Streak read from database: " + streak);

            articles_read_today = user.data().articles_read_today;
            console.log("Articles read today read from database: " + articles_read_today);

            articlesPerDay_preference = user.data().articlesPerDay_preference;
            console.log("Articles per day preference read from database: " + articlesPerDay_preference);

            // Update points, articles read today
            points += pointsForReading;
            console.log(articles_read_today);
            articles_read_today++;
            console.log(articles_read_today);
            if (articles_read_today == articlesPerDay_preference) {
                streak++;
                points += bonusPointsForReading;
            }

            console.log(articles_read_today);
            // Write updated points
            userRef.update({
                points: points,
                articles_read_today: articles_read_today,
                streak: streak
            })

            var articlesLeft = Number(articlesPerDay_preference) - Number(articles_read_today);
            console.log("Articles left: " + articlesLeft);

            if (articlesLeft == 0) {
                document.getElementById("encouragement-message").innerHTML = `You've completed your daily goal! Come back tomorrow for fresh news.`;
                document.getElementById("modal-streak-update").innerHTML = `<span class="material-symbols-outlined">local_fire_department</span> +1`;
                document.getElementById("modal-points-update").innerHTML = `<span class='material-symbols-outlined'>kid_star</span> +${pointsForReading + bonusPointsForReading}`;

                let completedDailyGoalSound = new Audio("./../sounds/completeddailygoal.wav")
                completedDailyGoalSound.play();
            } else {
                document.getElementById("encouragement-message").innerHTML = `Great going, ${displayName}!`;
                document.getElementById("modal-points-update").innerHTML = `<span class='material-symbols-outlined'>kid_star</span> +${pointsForReading}`;
                document.getElementById("modal-progress-message").innerHTML = `Read ${articlesLeft} more articles to complete your daily goal.`;

                let doneReadingSound = new Audio("./../sounds/donereading.wav");
                doneReadingSound.play();
            }

            // Delete article from "for you" array
            deleteArticleFromForYou();  
        });
});

// delete article
function deleteArticleFromForYou() {
    userRef.collection("for_you").doc(newsID).delete().then(() => {
        console.log("Article deleted.");
    }).catch((error) => {
        console.log("Error removing document, " + error);
    });
}

// back to for you
document.querySelector("#back-to-for-you-page").addEventListener("click", () => {
    window.location.replace("main.html");
})

// variable copies, for copying into saved subcollection
let titleCopy, categoryCopy, countryCopy, imageCopy, contentCopy, descriptionCopy, publishedAtCopy, sourceNameCopy, sourceURLCopy, urlCopy;

// save article
document.querySelector("#save").addEventListener("click", () => {
    // retrieve document contents
    userRef.collection("for_you").doc(newsID).get().then(article => {
        titleCopy = article.data().title;
        categoryCopy = article.data().category;
        countryCopy = article.data().country;
        imageCopy = article.data().image;
        contentCopy = article.data().content;
        descriptionCopy = article.data().description;
        publishedAtCopy = article.data().publishedAt;
        sourceNameCopy = article.data().sourceName;
        sourceURLCopy = article.data().sourceURL;
        urlCopy = article.data().url;
    }).then(() => {
        userRef.collection("saved").doc(newsID).set({
            title: titleCopy,
            category: categoryCopy,
            country: countryCopy,
            image: imageCopy,
            content: contentCopy,
            description: descriptionCopy,
            publishedAt: publishedAtCopy,
            sourceName: sourceNameCopy,
            sourceURL: sourceURLCopy,
            url: urlCopy
        })
    })
})


