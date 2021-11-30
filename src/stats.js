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
        let navBarItem = document.createElement('li');
        navBarItem.dataset.tab = `${elementId}-window`;
        for (let index = 0; index < rowsData.length; index++) {
            if (index > 0) {
                navBarItem.innerText += ', '
            }

            navBarItem.innerText += `${rowsData[index].booking_site} ${rowsData[index].key}`;
        }

        let closeTabButton = document.createElement('span');
        closeTabButton.innerText = String.fromCodePoint(0x274C); // x emote icon
        closeTabButton.classList.add('close-tab');
        navBarItem.appendChild(closeTabButton);

        let newButton = document.getElementById('nav').appendChild(navBarItem);
        setUpNavButton(newButton);

        // create table element
        let newTableTag = document.createElement('div');
        newTableTag.classList.add('window');
        newTableTag.id = `${elementId}-window`;

        setTemplate('./sublines.html', newTableTag, elementId);
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
