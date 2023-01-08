/**
 * Loads data from the server and returns the response.
 * 
 * The function first restores the state of the page from session storage. 
 * It then generates a request object based on the page state and sends a POST
 * request to the server. The response from the server is returned as a promise.
 * 
 * @return {Promise} - A promise that resolves with the server response.
 */
async function loadData() {
    await restoreState();

    var standardRequest = { "lang" : "de", "sentiment" : "nor", "hardcore" : false }

    var pageState = JSON.parse(sessionStorage.getItem('pageState'));
    if (pageState) {
        standardRequest = {
            ...standardRequest,
            ...pageState
        };
    }

    try {
        const response = await fetch('/load', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(standardRequest)
        });

        const resp = await response.json();
        return resp;

    } catch (error) {
        console.error(error);
    }
}