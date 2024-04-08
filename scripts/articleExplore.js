var userID;
var userRef;
var newsID;
var displayName;

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

function loadArticle() {
    let params = new URL(window.location.href);

    newsID = params.searchParams.get("articleID"); 
    const docRef = db.collection("world").doc(newsID);

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

document.querySelector("#done-reading").addEventListener("click", () => {
    const docRef = db.collection("world").doc(newsID)
 
    const pointsForReading = 50;

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

            // Write updated points
            userRef.update({
                points: points,
            })

            var articlesLeft = Number(articlesPerDay_preference) - Number(articles_read_today);
            console.log("Articles left: " + articlesLeft);

            document.getElementById("encouragement-message").innerHTML = `Great going, ${displayName}!`;
            document.getElementById("modal-points-update").innerHTML = `<span class='material-symbols-outlined'>kid_star</span> +${pointsForReading}`;

            let doneReadingSound = new Audio("./../sounds/donereading.wav");
            doneReadingSound.play();

            // Delete article from "world" collection
            // deleteArticleFromExplore();  
        });
});

function deleteArticleFromExplore() {
    db.collection("world").doc(newsID).delete().then(() => {
        console.log("Article deleted.");
    }).catch((error) => {
        console.log("Error removing document, " + error);
    });
}

document.querySelector("#back-to-for-you-page").addEventListener("click", () => {
    window.location.replace("explore.html");
})

let titleCopy, categoryCopy, countryCopy, imageCopy, contentCopy, descriptionCopy, publishedAtCopy, sourceNameCopy, sourceURLCopy, urlCopy;

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
        }).then(() => {
            alert("saved!");
        })
    })
})

