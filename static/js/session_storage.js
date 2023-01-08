/**
 * Saves the state of the page in session storage.
 * 
 * The page state is saved as an object containing the following properties:
 * - sentiment_lov, sentiment_sma, sentiment_nor, sentiment_ann, sentiment_ang
 *   are booleans indicating which sentiment checkbox is checked
 * - lang_de, lang_ru, lang_fr, lang_es, lang_it: booleans indicating which 
 *   language checkbox is checked
 * - hardcore: a boolean indicating whether the "Hardcore" mode is on
 */
function saveState() {
    // Get the current page state
    var pageState = {
        sentiment_lov: document.getElementById("sentiment_lov").checked,
        sentiment_sma: document.getElementById("sentiment_sma").checked,
        sentiment_nor: document.getElementById("sentiment_nor").checked,
        sentiment_ann: document.getElementById("sentiment_ann").checked,
        sentiment_ang: document.getElementById("sentiment_ang").checked,
        lang_de: document.getElementById("lang_de").checked,
        lang_ru: document.getElementById("lang_ru").checked,
        lang_fr: document.getElementById("lang_fr").checked,
        lang_es: document.getElementById("lang_es").checked,
        lang_it: document.getElementById("lang_it").checked,
        hardcore: document.getElementById("hardcore").checked,
    };
    // Save the page state in session storage
    sessionStorage.setItem('pageState', JSON.stringify(pageState));
}

/**
 * The page state is restored from an object that was previously saved in 
 * session storage.
 */
async function restoreState() {
    // Get the page state from session storage
    var pageState = JSON.parse(sessionStorage.getItem('pageState'));
    if (!pageState) return;

    for (const [key, value] of Object.entries(pageState)) {
        if (value) { 
            document.getElementById(key).click();
        }
        document.getElementById(key).checked = value;
    }           
}
