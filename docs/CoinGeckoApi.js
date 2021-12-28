function myFunction() {
    let amount = document.getElementById("amount").value;
    let toUnix1 = document.getElementById("start").value;
    let toUnix2 = document.getElementById("end").value;
    let timestamp1 = new Date(toUnix1) / 1000;
    let timestamp2 = new Date(toUnix2) / 1000 + 3600;
    let oneUnixDay = 86400;
    let unixDayCount = (timestamp2 - timestamp1) / oneUnixDay;

    fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=' + timestamp1 + '&to=' + timestamp2).then((data) => {
        return data.json();
    }).then((data) => {

        if (unixDayCount >= 90) {
            price = data.prices;
        } else {

            //  Making arrays for every day(having in mind that day data coming back length 24).......................
            everyDayArr = new Array(Math.ceil(data.prices.length / 24))
                .fill()
                .map(_ => data.prices.splice(0, 24))

            // // every day same time price array...............................

            price = [];
            for (i = 0; i < everyDayArr.length; i++) {
                price.push(everyDayArr[i][0]);
            }

        }

        // find longest decrease sequence in an array .......

        function longestDecreasing(price) {
            let longest,
                start = 0,
                i;

            for (i = 0; i < price.length; i++) {
                if (!i || price[i][1] < price[i - 1][1]) continue;
                if (!longest || longest[1] - longest[0] < i - start) longest = [start, i];
                start = i;
            }

            return price.slice(...longest && longest[1] - longest[0] > i - start ?
                longest : [start, i]);
        }

        let longestDecrease = longestDecreasing(price).length - 1;

        if (longestDecrease > 1) {

            // innerHTML......................
            document.querySelector(".p-downward").innerHTML = "<hr>" + "The maximum amount of days bitcoins price was decreasing in a row: ";
            document.querySelector(".p-downwardCount").innerHTML = "♦ " + longestDecrease;
            document.querySelector(".p-downwardDate").innerHTML = "From: " + toUnix1 + " Till: " + toUnix2;

        } else {
            document.querySelector(".p-downward").innerHTML = "";
            document.querySelector(".p-downwardDate").innerHTML = "";
            document.querySelector(".p-downwardCount").innerHTML = "";

        }

        //  buy and sell days and profit........................
        let purchase = null,
            sale = null,
            profit = null;
        for (let i = 0; i < price.length; i++) {
            for (let j = i + 1; j < price.length; j++) {
                if (price[i][1] < price[j][1]) {
                    let tempProfit = price[j][1] - price[i][1];
                    if (tempProfit > profit) {
                        profit = tempProfit;
                        purchase = i;
                        sale = j;

                    }

                }
            }
        }


        if (profit > 0) {
            //  getting unix timestamp from buy and sell days
            let purchaseUnix = price[purchase][0];
            let saleUnix = price[sale][0];

            // from unix timestamp to date.....................

            let dateBuy = new Date(purchaseUnix).toISOString().split('T')[0];;
            let dateSell = new Date(saleUnix).toISOString().split('T')[0];;

            // innerHTML......................

            document.querySelector(".p-buy").innerHTML = "<hr>" + "Buy day: " + dateBuy;
            document.querySelector(".p-sell").innerHTML = "Sell day: " + dateSell;
            document.querySelector(".p-profit").innerHTML = "♦ " + "Your profit: " + profit.toFixed() * amount + " €";


        } else {
            document.querySelector(".p-buy").innerHTML = "";
            document.querySelector(".p-sell").innerHTML = "";
            document.querySelector(".p-profit").innerHTML = '<span style="color:red">In chosen day range no profit possible.</span>';
        }

        // highest trading volume ........................

        let allVolume = data.total_volumes;

        let newArrayVolume = [];
        for (let i = 0; i < allVolume.length; i++) {
            newArrayVolume.push(allVolume[i][1]);
        }

        let maxVolume = (Math.max.apply(null, newArrayVolume));

        // unix timestamps of highest volume...............................
        let newArrayVolume2 = [];
        for (let i = 0; i < allVolume.length; i++) {
            newArrayVolume2.push(allVolume[i][0]);
        }

        let indexOfMaxVolume = newArrayVolume.indexOf(maxVolume)
        let volumeUnixTimestamp = newArrayVolume2[indexOfMaxVolume];

        // from unix timestamp to date.....................
        let dateVolume = new Date(volumeUnixTimestamp).toISOString().split('T')[0];;

        // innerHTML......................
        document.querySelector(".p-volumeDateText").innerHTML = "<hr>" + "Highest trading volume day: ";
        document.querySelector(".p-volumeDate").innerHTML = dateVolume;
        document.querySelector(".p-volumeEurosText").innerHTML = "Volume on that day in euros: ";
        document.querySelector(".p-volumeEuros").innerHTML = "♦ " + maxVolume.toFixed() + " €";

    }).catch((err) => {
        console.log(err);
    })
}