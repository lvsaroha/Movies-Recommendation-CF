"use-strict";

// Choose theme at random
const themes = ["#F9D716", "#D64163", "#fa625f", "#007bff"];
const selTheme = themes[Math.floor(Math.random() * themes.length)];
document.documentElement.style.setProperty('--theme', selTheme);

// Set default variables
var moviesData = [];
var imdbCriticsData = [];
var metaCriticsData = [];
var rottenTomatoesData = [];
var simScore = 0;
var simScoreName = ["Pearson", "eucl"];
var user = { "Name": "Current User", Reviews: {} };
var recm = false;
var ratingSite = "Imdb_rating";

// Update dom data according to default values
document.getElementById("ratingsite_id").value = "Imdb_rating";
document.getElementById("simscore_id").value = "0";

//Show movies
function showMovies(rs, cs) {
    ratingSite = cs || "Imdb_rating";
    let dl = document.createDocumentFragment();
    document.getElementById("movies_list_id").innerHTML = '';
    Object.keys(moviesData).forEach(element => {
        let el = document.createElement("div");
        el.className = "media mb-3";
        let r = "Not Rated";
        let rv = 0;
        if (user.Reviews[element] != undefined) {
            r = user.Reviews[element].Rating;
            if (rs == "Imdb_rating" && cs != "Imdb_rating") {
                r = r * 10;
                rv = r;
            } else if (rs != "Imdb_rating" && cs == "Imdb_rating") {
                rv = r;
                r = r / 10;
            } else {
                rv = r;
            }
            user.Reviews[element].Rating = r;
        }
        el.innerHTML = `<div class="placeholder"><img class="mr-3 img-responsive canvas" src="${moviesData[element].Poster}" height="124" width="91" alt=""></div>
                    <div class="media-body">
                    <h5 class="mt-0" style="color: #444;">${moviesData[element].Title} <small class="text-theme">( ${moviesData[element].Year} )</small></h5>
                    <div class="row mb-2">
                    <div class="col-md-6"><img src="./assets/images/${ratingSite}.png" class="img-responsive"><font style="color: #888;"> ${moviesData[element].Ratings[ratingSite]}</font></div>
                    </div>
                    <h6 class="text-muted">Your Rating : <font class="text-theme" id="${element}_rating_id"> ${r} </font><h6>
                    <input type="range" min="1" max="100" onchange="javascript: saveRating(this,'${element}')" oninput="javascript: inputRating(this,'${element}');" value="${rv}" class="slider" id="myRange">
                    </div>`;
        dl.appendChild(el);
    });
    document.getElementById("movies_list_id").appendChild(dl);
}

// Input rating
function inputRating(el, element) {
    let r = el.value;
    if (ratingSite == "Imdb_rating") { r = r / 10; }
    document.getElementById(`${element}_rating_id`).innerHTML = r;
}

// Save rating
function saveRating(el, element) {
    let r = el.value;
    if (ratingSite == "Imdb_rating") { r = parseFloat(r / 10); } else {
        r = parseInt(r);
    }
    user.Reviews[element] = { "Title": moviesData[element].Title, "Rating": r };
    if (Object.keys(user.Reviews).length > 2) {
        recMovies();
    }
}

// Recommend movies
function recMovies() {
    if (Object.keys(user.Reviews).length < 2) {
        //Checks if atleast 2 movies rated
        let al = document.createElement("div");
        al.className = "alert alert-primary";
        al.id = "alert_id";
        al.innerText = 'You must rate atleast 2 movies!';
        e.target.prepend(al);
        return;
    } else {
        if (document.getElementById("alert_id") != undefined) {
            document.getElementById("alert_id").remove();
        }
    }
    let movies = {};
    recm = true;
    // Get recommendation according to site
    if (ratingSite == "Imdb_rating") {
        imdbCriticsData["u0"] = user;
        movies = getRecommendation("u0", imdbCriticsData, simScoreName[simScore], 5);
    } else if (ratingSite == "Metascore") {
        metaCriticsData["u0"] = user;
        movies = getRecommendation("u0", metaCriticsData, simScoreName[simScore], 5);
    } else {
        rottenTomatoesData["u0"] = user;
        movies = getRecommendation("u0", rottenTomatoesData, simScoreName[simScore], 5);
    }
    document.getElementById("rec_movies_id").innerHTML = '<h5 class="text-theme mb-2">You may also like</h5>';
    let res = document.createDocumentFragment();
    // Show result on page
    let limit = 5;
    if (movies.length < 5) {
        limit = movies.length;
    }
    for (let i = 0; i < limit; i++) {
        let ml = document.createElement("div");
        if (ratingSite == "Imdb_rating") {
            movies[i].Rating = movies[i].Rating * 10;
        }
        ml.className = "mb-3";
        ml.innerHTML = `<h6 class="text-muted">${movies[i].Title}</h6><div class="progress" style="height: 10px;">
                <div class="progress-bar" style="width: ${movies[i].Rating}%;" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>`;
        res.appendChild(ml);
    }
    document.getElementById("rec_movies_id").appendChild(res);
}

// Load file data
function loadFile(file) {
    return fetch(`./DataSets/${file}`, {
            method: 'get',
            credentials: 'include',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(data => data.json())
        .then(data => {
            return data;
        });
}

// Load all files 
Promise.all([loadFile("preMovies.json"), loadFile("preImdbReviews.json"), loadFile("preMetaCriticReviews.json"), loadFile("preRottenTomatoesReviews.json")]).then(function(result) {
    moviesData = result[0];
    imdbCriticsData = result[1];
    metaCriticsData = result[2];
    rottenTomatoesData = result[3];
    showMovies();
});

// Get critics data from json file
fetch("./DataSets/preImdbReviews.json", {
        method: 'get',
        credentials: 'include',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(data => data.json())
    .then(data => {
        criticsData = data;
        criticsData["c120"] = { "Name": "Love saroha", "Reviews": { "tt0071562": { "Rating": 5 }, "tt0111161": { "Rating": 8 }, "tt0110912": { "Rating": 6 } } };
    });

// Calculate eucl distance between elements
function euclDistance(first, second, data) {
    let dist = 0;
    Object.keys(first.Reviews).forEach(element => {
        if (second.Reviews[element] != undefined) {
            // Calculate sum of euclidean distance
            dist += Math.pow(first.Reviews[element].Rating - second.Reviews[element].Rating, 2);
        }
    });
    return 1 / (1 + dist);
}

// Caculating pearson correlation score
function pearsonScore(first, second, data) {
    let sumXY = 0;
    let sumX = 0;
    let sumXX = 0;
    let sumYY = 0;
    let sumY = 0;
    let total = 0;
    Object.keys(first.Reviews).forEach(element => {
        if (second.Reviews[element] != undefined) {
            // Checks if both have same elements
            sumXY += (first.Reviews[element].Rating * second.Reviews[element].Rating);
            sumX += first.Reviews[element].Rating;
            sumY += second.Reviews[element].Rating;
            sumXX += (first.Reviews[element].Rating * first.Reviews[element].Rating);
            sumYY += (second.Reviews[element].Rating * second.Reviews[element].Rating);
            total++;
        }
    });
    // Caculating pearson correlation score
    // (sum(xy) - sum(x)*sum(y) / n) / sqrt( (sum(xx) - sum(x)^2 / n) * (sum(yy) - sum(y)^2 / n) )
    let num = sumXY - ((sumX * sumY) / total);
    let den = Math.sqrt((sumXX - (Math.pow(sumX, 2) / total)) * (sumYY - (Math.pow(sumY, 2) / total)));
    if (den == 0 || isNaN(num) || isNaN(den)) { return 0; }
    return num / den;
}

// Similar k data for specicified selectedItem 
function similar(selectedId, data, correlationType) {
    // Set default values
    if (correlationType == undefined) {
        correlationType = "eucl";
    }
    let similar = [];
    Object.keys(data).forEach(element => {
        if (element != selectedId) {
            // Calculate similarity
            if (correlationType == "eucl") {
                similar.push({ "similarityScore": euclDistance(data[selectedId], data[element], data), "data": data[element] });
            } else {
                similar.push({ "similarityScore": pearsonScore(data[selectedId], data[element], data), "data": data[element] });
            }
        }
    });
    // Sort on based of similarity score
    for (let i = 0; i < similar.length; i++) {
        for (let j = i + 1; j < similar.length; j++) {
            if (similar[j].similarityScore > similar[i].similarityScore) {
                // Swap
                let temp = similar[j];
                similar[j] = similar[i];
                similar[i] = temp;
            }
        }
    }
    return similar;
}

// Recommendation 
function getRecommendation(selectedId, data, correlationType, k) {
    let simData = similar(selectedId, data, correlationType);
    let limit = k || simData.length;
    let items = {};
    for (let i = 0; i < limit; i++) {
        Object.keys(simData[i].data.Reviews).forEach(element => {
            if (data[selectedId].Reviews[element] == undefined) {
                // Item not reviewed 
                if (items[element] == undefined) {
                    items[element] = { "similarityWeight": simData[i].similarityScore * simData[i].data.Reviews[element].Rating, "similaritySum": simData[i].similarityScore };
                } else {
                    items[element].similarityWeight += (simData[i].similarityScore * simData[i].data.Reviews[element].Rating);
                    items[element].similaritySum += simData[i].similarityScore;
                }
            }
        });
    }
    let result = [];
    // Calculate prediction
    Object.keys(items).forEach(element => {
        items[element].Rating = parseFloat((items[element].similarityWeight / items[element].similaritySum).toFixed(1));
        result.push({ "Rating": items[element].Rating, "Title": moviesData[element].Title, "id": element });
    });

    result.sort((a, b) => b.Rating - a.Rating);
    return result;
}