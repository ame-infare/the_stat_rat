const Tabulator = require('tabulator-tables');

// Stats Table
let table = new Tabulator("#table-stats", {
    layout: "fitDataFill",
    maxHeight: "970",
    selectable: 1,

    columns: [
        {title: "Prio", field: "prio"},
        {title: "Booking site", field: "booking_site", headerFilter: true},
        {title: "bs Id", field: "bs_id", headerFilter: true},
        {
            title: "Type", field: "type", 
            headerFilter: true, headerFilterParams: {values: true},
            headerFilterFunc : "=",
            editor: "select", editable: false
        },
        {title: "Code", field: "code"},
        {title: "Filter id", field: "filter_id"},
        {title: "Subs", field: "subs"},
        {title: "d_err", field: "d_err"},
        {title: "no_res", field: "no_res"},
        {title: "Subs miss", field: "sub_mis"},
        {title: "%miss", field: "%miss"},
        {title: "Valid", field: "valid"},
        {title: "%inv", field: "%inv"},
        {title: "tx_inv", field: "tx_inv"},
        {title: "%tx_inv", field: "%tx_inv"},
        {title: "%tx_miss", field: "%tx_miss"},
        {title: "%tx_limit", field: "%tx_limit"},
        {title: "Issue date", field: "issue_date"},
        {title: "Aff profiles", field: "affected_profiles", width: 150},
    ]
});

// Update how many BS are selected
const numOfSelectedBs = document.getElementById("num-selected");
table.on('rowClick', function(e, row){
    numOfSelectedBs.innerText = this.getSelectedRows().length;
});

// Load Subline Data
const loadSublinesButton = document.getElementById("load-selected-sites");
loadSublinesButton.addEventListener("click", function(){
    let selectedRows = table.getSelectedData();

    if (selectedRows.length > 0) {
        sublinesWindow = window.open('sublines.html', 'Subline stats', 'width=1920, height=1080');
        sublinesWindow.addEventListener('load', () => {
            sublinesWindow.postMessage(selectedRows[0]);
        }, false);
    }
});

// Initial Stats Load
table.on("tableBuilt", function() {
    let message = {
        action: 'stats'
    };

    loadData(message).then((tableData) => {
        table.setData(tableData).then(function() {
            //turn off data loading html
            table.off("tableBuilt");
        });
    });
});
