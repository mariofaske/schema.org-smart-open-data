$(document).ready(function () {
    $('#inputLarge').attr("placeholder", "Loading datasets...");
    $('#inputLarge').prop("disabled", true);
    $.get('http://localhost:3000/portals?viewMode=web', function (response) {
        let html = '<div class="row">';
        for (let odPortal in response) {
            if (!response.hasOwnProperty(odPortal)) continue;
            let datasetTitle = response[odPortal];
            for (let datasetIndex in datasetTitle) {
                if (!datasetTitle.hasOwnProperty(datasetIndex)) continue;
                // fix required since all indices except the first one need to be checked
                if ((datasetIndex % 3) == 0 || datasetIndex == 0) {
                    html += '</div><div class="row">';
                };
                let datasetNumber = parseInt(datasetIndex) + 1;
                html += '<div class="col"><div class="card text-white bg-primary mb-3" style="max-width: 20rem;">'
                    + '<div class="card-header">Dataset '
                    + datasetNumber + '</div><div class="card-body"><h4 class="card-title">'
                    + datasetTitle[datasetIndex] + '</h4><p class="card-text">'
                    + odPortal + '</p></div></div></div>';
            }
        }
        html += '</div>';
        loadingComplete(html);
    })
});

// show results inside search-results when request complete
function loadingComplete(html) {
    $('#search-results').html(html);
    $('#inputLarge').attr("placeholder", "Search datasets");
    $('#inputLarge').prop("disabled", false);
}

// function to delay filter, reduce refresh of dom
function delay(callback, ms) {
    let timer = 0;
    return function () {
        let context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

// input filter logic
$('#inputLarge').keyup(delay(function (event) {
    if (event.which != '13') {
        let cardTitle = document.getElementsByClassName('card-title');
        for (let i = 0; i < cardTitle.length; i++) {
            let cardValue = cardTitle[i].innerText;
            if (cardValue.includes($('#inputLarge').val())) {
                cardTitle[i].parentElement.parentElement.style.display = "";
            } else {
                cardTitle[i].parentElement.parentElement.style.display = "none";
            }
        }
    }
}, 800));