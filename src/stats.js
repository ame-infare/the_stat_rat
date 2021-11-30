const selectedBsButton = document.getElementById("num-selected");

// Initial Stats Load
loadData({action: 'stats'}).then((tableData) => {
    createTable('stats', 'stats', tableData, selectedBsButton);
});

// Load Subline Data
const loadSublinesButton = document.getElementById("load-selected-sites");
let numOfSublineTabsOpen = 0;

loadSublinesButton.addEventListener("click", function(){
    let selectedRows = allTables.stats.selectedRows;

    if (selectedRows.length > 0) {
        let elementId = 'sublines' + ++numOfSublineTabsOpen;
        let rowsData = Array.from(selectedRows, x => x.getData());

        // deselect all selected rows
        allTables.stats.selectedRows = [];
        allTables.stats.table.deselectRow();
        selectedBsButton.innerText = '0';
        
        // create nav bar button
        let navBarTemplate = getTemplate('./templates/tabButton.html');
        let tabButton = navBarTemplate.querySelector('li');
        tabButton.dataset.tab = `${elementId}-window`;
        for (let index = 0; index < rowsData.length; index++) {
            if (index > 0) {
                tabButton.innerText += ', '
            }

            tabButton.innerText += `${rowsData[index].booking_site} ${rowsData[index].key}`;
        }

        let newButton = document.getElementById('nav').appendChild(navBarTemplate);
        setUpNavButton(newButton);

        // create table element
        let newWindowTemplate = getTemplate('./templates/window.html');

        let windowContainer = newWindowTemplate.querySelector('.window');
        windowContainer.id = `${elementId}-window`;

        let tableContainer = newWindowTemplate.querySelector('.table-content');
        tableContainer.id = elementId;

        document.getElementById('windows-container').appendChild(newTableTag);

        // get and set data to the table
        let message = {
            action: 'sublines',
            data: rowsData
        };

        loadData(message).then((tableData) => {
            createTable('subs', elementId, tableData);
        });
    }
});
