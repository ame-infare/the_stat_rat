// Stats Table
allTables['stats'] = new Tabulator("#table-stats", {
    layout: "fitDataFill",
    maxHeight: "650",
    selectable: true,

    columns: [
        {title: "Prio", field: "prio"},
        {title: "Booking site", field: "booking_site", headerFilter: true},
        {title: "bs Id", field: "bs_id", headerFilter: true},
        {
            title: "Type", field: "type", 
            headerFilter: true, headerFilterParams: {values: true},
            headerFilterFunc : "="
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

// Initial Stats Load
allTables.stats.on('tableBuilt', function() {
    let message = {
        action: 'stats'
    };

    loadData(message).then((tableData) => {
        allTables.stats.setData(tableData).then(function() {

            //turn off data loading html
            allTables.stats.off('tableBuilt');
        });
    });
});


const numOfSelectedBs = document.getElementById("num-selected");
let selectedRows = [];
allTables.stats.on('rowSelected', function(row) {
    if (!selectedRows.includes(row)) {
        selectedRows.push(row);
    }

    numOfSelectedBs.innerText = selectedRows.length;
});

allTables.stats.on('rowDeselected', function(row) {
    const index = selectedRows.indexOf(row);
    if (index > -1) {
        selectedRows.splice(index, 1);
    }

    numOfSelectedBs.innerText = selectedRows.length;
});

allTables.stats.on('dataSorted', function(sorters, rows){
    rows.forEach(row => {
        if (selectedRows.includes(row)) {
            allTables.stats.selectRow(row);
        }
    });
});
