const selectedBsButton = document.querySelector('#stats-window .num-selected');

// Initial Stats Load
loadData({action: 'stats'}).then((tableData) => {
    createTable('stats', 'stats', tableData, selectedBsButton);
});

// Load Subline Data
const loadSublinesButton = document.querySelector('#stats-window .load-selected-sites');

loadSublinesButton.addEventListener('click', function(event){
    event.stopPropagation();

    let selectedRows = allTables.stats.selectedRows;

    // deselect all selected rows
    allTables.stats.selectedRows = [];
    allTables.stats.table.deselectRow();
    selectedBsButton.innerText = '0';

    openNewTab(selectedRows, 'subs');
});
