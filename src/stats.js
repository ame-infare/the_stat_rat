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
    openNewWindow(selectedRows);
});
