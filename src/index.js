window.$ = window.jquery = require("jquery");

//$('#stats').load('./stats.html');

// function setTemplate(link, element) {
//     fetch(link)
//         .then(response => {
//             return response.text();
//         })
//         .then(template => {
//             element.innerHTML = template;
            
//         });
// }

// setTemplate('./stats.html', document.getElementById('stats'));

// nav buttons and showing selected table
function setUpNavButton(button) {
    button.addEventListener("click", function(){
        if (button.classList.contains('selected')) {
            return;
        }

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
