// Stats Table
allTables['stats'] = new Tabulator("#table-stats", {
    layout: "fitDataFill",
    maxHeight: "650",
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
allTables.stats.on('rowClick', function(e, row){
    numOfSelectedBs.innerText = this.getSelectedRows().length;
});

// Load Subline Data
const loadSublinesButton = document.getElementById("load-selected-sites");
let numOfSublineTabs = 0;

loadSublinesButton.addEventListener("click", function(){
    let selectedRows = allTables.stats.getSelectedData();

    if (selectedRows.length > 0) {
        let elementId = 'sublines-' + ++numOfSublineTabs;

        // create nav bar button
        let navBarItem = document.createElement('li');
        navBarItem.dataset.tab = elementId;
        navBarItem.innerText = selectedRows[0].booking_site + ' ' + selectedRows[0].key;

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
            data: selectedRows[0]
        };
    
        loadData(message).then((tableData) => {
            allTables[elementId] = createSublinesTable(`#${elementId}-table`, tableData);
        });

        // click button
    }
});

// Initial Stats Load
allTables.stats.on("tableBuilt", function() {
    let message = {
        action: 'stats'
    };

    loadData(message).then((tableData) => {
        allTables.stats.setData(tableData).then(function() {
            //turn off data loading html
            allTables.stats.off("tableBuilt");
        });
    });
});
