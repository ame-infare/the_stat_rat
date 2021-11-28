
const numOfSelectedBs = document.getElementById("num-selected");
let selectedRows = [];

// Initial Stats Load
loadData({action: 'stats'}).then((tableData) => {
    allTables['stats'] = createTable('stats', '#table-stats', tableData)
});

// Load Subline Data
const loadSublinesButton = document.getElementById("load-selected-sites");
let numOfSublineTabs = 0;

loadSublinesButton.addEventListener("click", function(){
    if (selectedRows.length > 0) {
        let elementId = 'sublines-' + ++numOfSublineTabs;
        let rowsData = Array.from(selectedRows, x => x.getData());

        // create nav bar button
        let navBarItem = document.createElement('li');
        navBarItem.dataset.tab = elementId;
        for (let index = 0; index < rowsData.length; index++) {
            if (index > 0) {
                navBarItem.innerText += ', '
            }

            navBarItem.innerText += `${rowsData[index].booking_site} ${rowsData[index].key}`;
        }

        let closeTabButton = document.createElement('span');
        closeTabButton.innerText = String.fromCodePoint(0x274C);
        closeTabButton.classList.add('close-tab');
        navBarItem.appendChild(closeTabButton);

        let newButton = document.getElementById('nav').appendChild(navBarItem);
        setUpNavButton(newButton);

        // create table element
        let newTableTag = document.createElement('div');
        newTableTag.classList.add('table');
        newTableTag.id = elementId;

        setTemplate('./sublines.html', newTableTag, elementId + '-table');
        document.getElementById('tables-container').appendChild(newTableTag);

        // get and set data to the table
        let message = {
            action: 'sublines',
            data: rowsData
        };

        loadData(message).then((tableData) => {
            allTables[elementId] = createSublinesTable(`#${elementId}-table`, tableData);
        });

        //deselect all rows and clear selected rows var
        selectedRows = [];
        allTables.stats.deselectRow();
        numOfSelectedBs.innerText = '0';
    }
});
