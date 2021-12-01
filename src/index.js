function setTemplate(link, containerElement, tableId) {
    fetch(link)
        .then(response => {
            return response.text();
        })
        .then(template => {
            containerElement.innerHTML = template;
            let tableContents = containerElement.querySelector('.table-content');
            tableContents.id = tableId;
        });
}

async function getTemplate(path) {
    const response = await fetch(path);
    const template = await response.text();
    return document.createRange().createContextualFragment(template);
}

// nav buttons and showing selected table
function setUpNavButton(button) {

    //close tab
    let closeTabButton = button.querySelector('.close-tab');
    closeTabButton.addEventListener('click', function(event){
        event.stopPropagation();

        let windowIdToClose = closeTabButton.parentNode.dataset.tab;
        let tableIdToClose = windowIdToClose.split('-')[0];

        allTables[tableIdToClose].table.destroy();
        delete allTables[tableIdToClose];

        document.getElementById(windowIdToClose).remove();
        closeTabButton.parentNode.remove();
    });

    // change tab
    button.addEventListener('click', function(event){
        event.stopPropagation();

        if (button.classList.contains('selected')) {
            return;
        }

        navButtons = document.querySelectorAll('#nav li');
        navButtons.forEach(button => {
            button.classList.remove('selected');
        });

        button.classList.add('selected');

        let allTables = document.querySelectorAll('.window');
        allTables.forEach(table => {
            table.classList.remove('active');
        });

        let selectedTable = document.getElementById(button.dataset.tab);
        selectedTable.classList.add('active');
    });
}

let navButtons = document.querySelectorAll('#nav li');
navButtons.forEach(button => setUpNavButton(button));
