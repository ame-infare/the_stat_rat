// an object to store all tables
let allTables = {};

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

// nav buttons and showing selected table
function setUpNavButton(button) {
    let closeTabButton = button.querySelector('.close-tab');
    closeTabButton.addEventListener('click', function(){
        let tableIdToClose = closeTabButton.parentNode.dataset.tab;
        allTables[tableIdToClose].destroy();
        document.getElementById(tableIdToClose).remove();
        closeTabButton.parentNode.remove();
    });

    button.addEventListener('click', function(){
        if (button.classList.contains('selected')) {
            return;
        }

        navButtons = document.querySelectorAll('#nav li');
        navButtons.forEach(button => {
            button.classList.remove('selected');
        });

        button.classList.add('selected');

        let allTables = document.querySelectorAll('.table');
        allTables.forEach(table => {
            table.classList.remove('active');
        });

        let selectedTable = document.getElementById(button.dataset.tab);
        selectedTable.classList.add('active');
    });
}

let navButtons = document.querySelectorAll('#nav li');
navButtons.forEach(button => setUpNavButton(button));
