chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const { type, locations } = message;

    if (type === "NEW") {
        const start = locations[0];
        const end = locations[locations.length - 1];
        let distances = {};

        for (const source of locations) {
            distances[source] = {};

            for (const dest of locations) {
                if (dest !== source) {
                    distances[source][dest] = await calcDist(source, dest);
                } else {
                    distances[source][dest] = 0;
                }
            }
        }
        distances[end][start] = 0;
        console.log(distances);
        const bestPath = tspAlgo(distances);
        console.log(bestPath);
        let newUrl = "https://www.google.com/maps/dir";
        for (const location of bestPath) {
            newUrl += '/' + location;
        }
        console.log(newUrl);
        chrome.runtime.sendMessage({
            type: "OPT",
            newUrl: newUrl
        });
    }

    return true;
});

async function calcDist(source, dest) {
    const uri = `https://www.google.com/maps/dir/${source}/${dest}`;
    let html = await fetch(uri, {
        method: "GET",
        mode: "no-cors"
    }).then(resp => { return resp.text() });
    let el = document.querySelector('div');
    el.innerHTML = html;

    let distance_str = html.match(/(?<=")[^""]*?\d (min)/g).slice(4)[0];
    let minutes = distance_str.match(/(\d*) min/) ? parseInt(distance_str.match(/(\d*) min/)[1]) : 0;
    let hours = distance_str.match(/(\d*) hr/) ? parseInt(distance_str.match(/(\d*) hr/)[1]) : 0;
    let total_minutes = minutes + hours * 60;

    return total_minutes;
}

function tspAlgo(distances) {
    const locations = Object.keys(distances);
    const n = locations.length;
    const VISITED_ALL = (1 << n) - 1;
    const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
    const parent = Array.from({ length: 1 << n }, () => Array(n).fill(-1));
    dp[1][0] = 0;

    for (let mask = 1; mask < (1 << n); mask++) {
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                for (let j = 0; j < n; j++) {
                    if ((mask & (1 << j)) && i !== j) {
                        const newCost = dp[mask ^ (1 << i)][j] + distances[locations[j]][locations[i]];
                        if (newCost < dp[mask][i]) {
                            dp[mask][i] = newCost;
                            parent[mask][i] = j;
                        }
                    }
                }
            }
        }
    }

    let minCost = Infinity;
    let lastCity = -1;
    for (let i = 1; i < n; i++) {
        const cost = dp[VISITED_ALL][i] + distances[locations[i]][locations[0]];
        if (cost < minCost) {
            minCost = cost;
            lastCity = i;
        }
    }

    let mask = VISITED_ALL;
    const path = [];
    let city = lastCity;

    while (city !== -1) {
        path.push(locations[city]);
        const nextCity = parent[mask][city];
        mask ^= (1 << city);
        city = nextCity;
    }
    path.reverse();

    return path;
}