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
}, 500));

// adds application logic to every card
$(document).on('click', '.card', function (e) {
    let portal = $(this).find('.card-text')[0].innerText;
    let dataset = $(this).find('.card-title')[0].innerText;
    $('.modal-body').empty();
    $('.modal-title').empty();

    // display loading text
    let count = 0;
    let loadingText = setInterval(function () {
        count++;
        var dots = new Array(count % 5).join('.');
        $('.modal-body').text('Loading dataset' + dots);
    }, 300);

    $('#myModal').modal({ show: true });
    $.get('http://localhost:3000/portals/' + portal + '/' + dataset, function (response) {
        clearInterval(loadingText);
        let htmlJSON = '<code class="prettyprint"><pre>' + JSON.stringify(response, null, '\t') + '</pre></code>';
        $('.modal-body').empty();
        $('.modal-body').append(htmlJSON);
        $('.modal-title').append(dataset);
    });
});

// copy schema representation to clipboard
$(document).on('click', '#copyToClipboard', function (e) {
    // if-else for multi-browser support
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById("jsonBody"));
        range.select().createTextRange();
        document.execCommand("copy");
        document.selection.empty();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById("jsonBody"));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().empty();
    }
})