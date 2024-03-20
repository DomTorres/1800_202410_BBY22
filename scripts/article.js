function loadArticle() {
    let params = new URL(window.location.href);
    let articleID = params.searchParams.get("articleID"); 

    db.collection("news").doc(articleID).get().then(article => {
        var title = article.id;
        var image = article.data().image;
        var content = article.data().content;

        document.querySelector("#title").innerHTML = title;
        document.querySelector("#image").setAttribute("src", image);
        document.querySelector("#content").innerHTML = content;
    })
}
loadArticle();

document.querySelector("#done-reading").addEventListener("click", () => {

    console.log("clicked!");
    console.log(userID);
 
    firebase.auth().onAuthStateChanged(user => {
        const userID = user.uid;
        console.log(userID);
        var points;

        db.collection("users").doc(userID).get()
            .then(user => {
                points = user.data().points;
                console.log(points);
                points++;
                console.log(points);
            })
            .then(() => {
                db.collection("users").doc(userID).update({
                    points: points
                });
                console.log("made it up to here woohoo");
            })
            .then(() => {
                console.log("this is the last thing");
                // window.location.replace("main.html");
            })
    })
});

