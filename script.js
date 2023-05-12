document.querySelector('#valueDisplay').textContent = document.querySelector('#daysnumber').value.toString();

// récupération du timestamp actuel puis du timestamp 3 mois en arrière
let actualDate = parseInt(Date.now() / 1000);

let myRange = document.querySelector('#daysnumber');
myRange.addEventListener('mousedown', (e) =>{
    document.querySelector('#valueDisplay').textContent = document.querySelector('#daysnumber').value.toString();
    myRange.addEventListener('mousemove', (e) =>{
        document.querySelector('#valueDisplay').textContent = document.querySelector('#daysnumber').value.toString();
    })
    myRange.addEventListener('mouseup', (e) =>{
        document.querySelector('#valueDisplay').textContent = document.querySelector('#daysnumber').value.toString();
    })
})

// initialisation de la table qui stockera les dates/prix
let resultTable = [];
let myChart = false;
let gran;
let url;
let coin;

// creation de l'url de requete avec les deux timestamp précédents
//let requestUrl = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=eur&from=${threeMonthesDate}&to=${actualDate}`;

// récupération du bouton et lancement de la fonction au clic
let launchButton = document.querySelector('.launch-api');
launchButton.addEventListener('click', getValue)

function getRequestUrl() {
    //let selectedDuration = document.querySelector('#user-choice').value;
    let daysRange = document.querySelector('#daysnumber').value;

    let granurality = 'daily';
    if(parseInt(daysRange)<=5){
        granurality = 'hourly';
    }
    coin = document.querySelector('.user-choice').value;
    let coinTitle;
    if(coin == 'ethereum') coinTitle = 'de l\'Ethereum';
    if(coin == 'bitcoin') coinTitle = 'du Bitcoin';
    let chartTitle = document.querySelector('.canvas-title');
    let titleDuration = `les ${daysRange} derniers jours`;
    if(daysRange<2) titleDuration='la dernière journée';
    chartTitle.textContent = `Cours ${coinTitle} sur ${titleDuration}`

    let requestUrl = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=eur&days=${daysRange}&interval=${granurality}`

    return {url : requestUrl , gran : granurality};
}

/**
 * Fonction qui récupère avec un fetch les valeurs en euro de l'ethereum sur les 91 derniers jours avec l'url créée précédemment pour la requete
 */
async function getValue() {
    

    document.querySelector('#controls').classList.replace('d-flex','d-none')
    document.querySelector('.affichage').classList.replace('d-none', 'd-flex')
    let myUrlAndGran = getRequestUrl();
    url = myUrlAndGran.url;
    gran = myUrlAndGran.gran
    try {
        const response = await fetch(url);
        if (!response.ok || response.status !== 200) {
            throw new Error('Url surement incorrecte')
        }
        const object = await response.json();
        //console.log(object);
        sortResult(object.prices);
    } catch (error) {
        console.error(error);
    }
}

/**
 * fonction qui sort une liste d'objets avec la date et le prix de l'ethereum
 * 
 * @param {*} prices liste d'objets comprenant les prix et timestamps correspondants
 */
function sortResult(prices) {
    let higherPrice = 0;
    let lowerPrice = prices[0][1];
    if(gran =='daily'){
        
        for (let price of prices) {
            let date = new Date(price[0]);
            let thisDatePrice ={}
            if (price[1]>higherPrice) higherPrice=price[1];
            if (price[1]<lowerPrice) lowerPrice=price[1];
            thisDatePrice = { date: `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`, prix: price[1].toFixed(2) };
            resultTable.push(thisDatePrice)
        }
    }
    else if(gran =='hourly'){
        for (let price of prices) {
            let date = new Date(price[0]);
            let thisDatePrice ={}
            if (price[1]>higherPrice) higherPrice=price[1];
            if (price[1]<lowerPrice) lowerPrice=price[1];
            thisDatePrice = { date: `le ${date.getDate()} à ${date.getHours()} h`, prix: price[1].toFixed(2) };
            resultTable.push(thisDatePrice)
        }
        
    }
   document.querySelector('.info-sup').innerHTML = `<ul class="list-group list-group-flush"><li class="list-group-item">Prix le plus élevé : ${higherPrice.toFixed(2)}</li><li class="list-group-item">Prix le plus bas : ${lowerPrice.toFixed(2)}</li></ul>`

    createChart();

}

function updateChart() {
    myChart.data.labels.pop();
    myChart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    myChart.data.labels.push(resultTable.map(row => row.date));
    myChart.data.datasets.forEach((dataset) => {
        dataset.data.push(resultTable.map(row => row.prix))
    });
    myChart.clear();

    myChart.update();
}

/**
 * Crée le graphique selon les données reçues avec la requete (prix/date)
 */
function createChart() {


    myChart = new Chart(
        document.querySelector('#my-chart'),
        {
            type: 'line',
            data: {
                labels: resultTable.map(row => row.date),
                datasets: [
                    {
                        label: 'Euros',
                        data: resultTable.map(row => row.prix),
                        backgroundColor: 'rgba(41, 223, 255, 0.4)',
                        borderColor: 'rgba(31, 163, 186, 0.678)',
                        fill: 'origin',
                    }
                ]
            }
        }
    )

}


