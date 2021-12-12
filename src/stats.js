const selectedBsButton = document.querySelector('#stats-window .num-selected');

// Initial Stats Load
loadData({action: 'stats'}).then((tableData) => {
    createTable('stats', 'stats', tableData, selectedBsButton);
});

// Load Subline Data
const loadSublinesButton = document.querySelector('#stats-window .load-selected-sites');
let numOfSublineTabsOpen = 0;

loadSublinesButton.addEventListener('click', function(event){
    event.stopPropagation();

    let selectedRows = allTables.stats.selectedRows;

    if (selectedRows.length > 0) {
        let elementId = 'sublines' + ++numOfSublineTabsOpen;
        let rowsData = Array.from(selectedRows, x => x.getData());

        // deselect all selected rows
        allTables.stats.selectedRows = [];
        allTables.stats.table.deselectRow();
        selectedBsButton.innerText = '0';
        
        // create nav bar button
        getTemplate('./templates/tabButton.html')
            .then(navBarTemplate => {
                let tabButton = navBarTemplate.querySelector('li');
                tabButton.dataset.tab = `${elementId}-window`;

                let tabName = navBarTemplate.querySelector('.tab-name');
                for (let index = 0; index < rowsData.length; index++) {
                    if (index > 0) {
                        tabName.innerText += ', ';
                    }

                    tabName.innerText += `${rowsData[index].booking_site} ${rowsData[index].key}`;
                }

                document.getElementById('nav').appendChild(navBarTemplate)
                
                setUpNavButton(document.getElementById('nav').querySelector('li:last-child'));
            });

        // create table element
        getTemplate('./templates/window.html')
            .then(newWindowTemplate => {
                let windowContainer = newWindowTemplate.querySelector('.window');
                windowContainer.id = `${elementId}-window`;
        
                let tableContainer = newWindowTemplate.querySelector('.table-content');
                tableContainer.id = elementId;
        
                document.getElementById('windows-container').appendChild(newWindowTemplate);
            }).finally(() => {
                
                // get and set data to the table
                let message = {
                    action: 'sublines',
                    data: rowsData
                };

                loadData(message).then((tableData) => {
                    createTable('subs', elementId, tableData);
                });
            });
    }
});
