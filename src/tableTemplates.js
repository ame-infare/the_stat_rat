const Tabulator = require('tabulator-tables');

// an object to store all tables
let allTables = {};

// Initial Stats Load
loadData({action: 'stats'}).then((tableData) => {
    openNewTab([], 'stats');
});

const openNextIcon = function (cell, tabName) {
    let nextPageIcon = document.createElement('span');

    nextPageIcon.innerText = String.fromCodePoint(128270);
    nextPageIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        openNewTab([cell.getRow()], tabName);
    });

    return nextPageIcon
}

function createTable(templateName, tableId, tableData, selectionsButton = null) {
    let templates = {
        stats: {
            data: tableData,
            layout: "fitDataFill",
            maxHeight: "100%",
            selectable: true,

            columns: [
                {formatter: openNextIcon, formatterParams: () => {return 'subs'}, hozAlign:"center", headerSort:false},
                {title: "Prio", field: "prio"},
                {title: "Booking site", field: "booking_site", headerFilter: true},
                {title: "BS Id", field: "bs_id", headerFilter: true},
                {
                    title: "Type", field: "type", 
                    headerFilter: true, headerFilterParams: {values: true},
                    headerFilterFunc : "="
                },
                {title: "Code", field: "code"},
                {title: "Filter id", field: "filter_id"},
                {title: "Subs", field: "subs"},
                {title: "Dest err", field: "d_err"},
                {title: "no resolution", field: "no_res"},
                {title: "Subs miss", field: "sub_mis"},
                {title: "%miss", field: "%miss"},
                {title: "Valid", field: "valid"},
                {title: "%inv", field: "%inv"},
                {title: "tx_inv", field: "tx_inv"},
                {title: "%tx_inv", field: "%tx_inv"},
                {title: "%tx_miss", field: "%tx_miss"},
                {title: "%tx_limit", field: "%tx_limit"},
                {title: "Issue date", field: "issue_date"},
                {title: "Aff profiles", field: "affected_profiles"},
            ]
        },

        subs: {
            data: tableData,
            layout: "fitDataFill",
            maxHeight: "100%",
            selectable: true,
        
            columns:[
                {formatter: openNextIcon, formatterParams: () => {return 'tx'}, hozAlign:"center", headerSort:false},
                {title: "key", field: "key", headerFilter: true},
                {title: "Subline", field: "subscription_line_id", headerFilter: true},
                {title: "Last Run", field: "run_date_utc", headerFilter: true},
                {title: "Profile", field: "profile_id", headerFilter: true},
                {title: "valid", field: "valid", headerFilter: true, headerFilterFunc : "="},
                {title: "invalid all", field: "invalid_all"},
                {title: "invalid real", field: "invalid_real"},
                {title: "room error", field: "room_error"},
                {title: "hotel error", field: "hotel_error"},
                {title: "flight error", field: "flight_error"},
                {title: "destination error", field: "destination_error"},
                {title: "fhm errors", field: "fhm_errors"},
                {title: "unmapped", field: "unmapped"},
                {title: "tx invalid", field: "tx_invalid"},
                {title: "tx with data", field: "tx_with_data"},
                {title: "tx generated", field: "tx_generated"},
                {title: "tx resolved", field: "tx_resolved"},
                {title: "unavailable dates", field: "unavailable_dates"},
                {
                    title: "Travel info",
                    columns: [
                        {title: "POS", field: "pos"},
                        {title: "Origin", field: "flight_origin"},
                        {title: "Origin type", field: "flight_origin_type"},
                        {title: "Destination", field: "destination"},
                        {title: "Destination type", field: "destination_type"},
                        {title: "User input", field: "destination_user_input"},
                        {title: "Adults", field: "adults"},
                        {title: "Children", field: "children"},
                    ]
                },
                {
                    title: "Flight",
                    columns: [
                        {title: "Flight included", field: "flight_included"},
                        {title: "Searched cabin", field: "flight_searched_cabin"},
                        {title: "Max connections", field: "flight_max_connections"},
                        {title: "Carrier", field: "flight_carrier"},
                        {title: "Arrival Requirement", field: "flight_arrival_requirement"}
                    ]
                },
                {
                    title: "Hotel",
                    columns: [
                        {title: "Hotel included", field: "hotel_included"},
                        {title: "Hotel group", field: "hotel_group_id"},
                        {title: "Hotels specified", field: "hotels_specified"},
                        {title: "Hotel count to collect", field: "hotel_count_to_collect"},
                        {title: "Room options", field: "hotel_room_options"},
                        {title: "Board basis", field: "hotel_board_basis"},
                        {title: "Rating filter", field: "hotel_rating_filter"}
                    ]
                },
                {
                    title: "Cars",
                    columns: [
                        {title: "Car included", field: "car_included"},
                        {title: "Car offers per vendor", field: "car_offers_per_vendor"},
                        {title: "Vendor", field: "car_vendor"},
                        {title: "SIPP code", field: "car_sipp_code"},
                        {title: "Car discount code", field: "car_discount_code"},
                        {title: "Pickup time", field: "car_pickup_time"},
                        {title: "Dropoff time", field: "car_dropoff_time"},
                        {title: "Dropoff location", field: "car_dropoff_location"},
                        {title: "Dropoff location type", field: "car_dropoff_location_type"},
                    ]
                },
                {title: "Wildcard", field: "wildcard"},
                {
                    title: "Search Range",
                    columns: [
                        {title: "Search range days", field: "search_range_days"},
                        {title: "Search range anchor date", field: "search_range_anchor_date"},
                        {title: "Search weekdays", field: "search_weekdays"},
                        {title: "Search nights", field: "search_nights"}
                    ]
                },
                {
                    title: "Schedule",
                    columns: [
                        {title: "Schedule frequency type", field: "schedule_frequency_type"},
                        {title: "Schedule frequency interval", field: "schedule_frequency_interval"},
                        {title: "Schedule frequency interval relative", field: "schedule_frequency_interval_relative"},
                        {title: "Schedule id", field: "collection_schedule_id"},
                        {title: "Start date", field: "start_date"},
                        {title: "End date", field: "end_date"},
                        {title: "Start time", field: "start_time"},
                        {title: "Allowed runtime minutes", field: "allowed_runtime_minutes"},
                    ]
                },
            ],
        },

        tx: {
            data: tableData,
            layout: "fitDataFill",
            maxHeight: "100%",
            selectable: true,

            columns: [
                {title: "BS Id", field: "booking_site_id"},
                {title: "Subline", field: "subscription_line_id"},
                {title: "Profile", field: "profile_id"},
                {title: "Resolve Type", field: "resolve_type"},
                {title: "Begin Run", field: "begin_run_datetime_utc"},
                {title: "End Run", field: "end_run_datetime_utc"},
                {title: "Run Date", field: "run_date_utc"},
                {title: "Dearture Date", field: "depDate"},
                {title: "Scheduler Active Queue", field: "scheduler_active_queue_id"},
                {title: "Hotels Recognized", field: "hotels_recognized"},
                {title: "Hotels Found", field: "hotels_found"},
                {title: "Invalid All", field: "invalid_all"},
                {title: "Invalid2", field: "invalid2"},
                {title: "Unmapped", field: "unmapped"},
                {title: "FHM Errors", field: "fhm_errors"},
                {title: "Unavailable Dates", field: "unavailable_dates"},
                {title: "Tx Invalid", field: "tx_invalid"},
                {title: "Room Error", field: "room_error"},
                {title: "Hotel Error", field: "hotel_error"},
                {title: "Destination Error", field: "destination_error"},
                {title: "Flight Error", field: "flight_error"},
                {title: "Hotel Duplicates", field: "hotel_dpl"},
                {title: "Last Touched", field: "last_touched"},
                {title: "ID", field: "ID"},
            ]
        }
    };

    selectedTemplate = templates[templateName];

    allTables[tableId] = {
        table: new Tabulator(`#${tableId}`, selectedTemplate),
        selectedRows: []
    };
    let thisTable = allTables[tableId].table; 

    thisTable.on('rowSelected', function(row) {
        if (!allTables[tableId].selectedRows.includes(row)) {
            allTables[tableId].selectedRows.push(row);
        }
    
        if (selectionsButton) {
            selectionsButton.innerText = allTables[tableId].selectedRows.length;
        }
    });
    
    thisTable.on('rowDeselected', function(row) {
        const index = allTables[tableId].selectedRows.indexOf(row);
        if (index > -1) {
            allTables[tableId].selectedRows.splice(index, 1);
        }
    
        if (selectionsButton) {
            selectionsButton.innerText = allTables[tableId].selectedRows.length;
        }
    });
    
    thisTable.on('dataSorted', function(sorters, rows) {
        rows.forEach(row => {
            if (allTables[tableId].selectedRows.includes(row)) {
                thisTable.selectRow(row);
            }
        });
    });

    //get all columns and add them as options in filter
    thisTable.on('tableBuilt', function() {
        let tableFilterFields = document.querySelector(`div#${tableId}-window [name=columns]`);

        if (tableFilterFields) {
            let columnDefinitions = thisTable.getColumnDefinitions();
            let addNewColumnFilter = function (column) {
                let option = document.createElement('option');
    
                option.value = column.field;
                option.innerText = column.title;
    
                tableFilterFields.appendChild(option);
            }

            columnDefinitions.forEach(column => {
                if (column.columns) {
                    column.columns.forEach(innerColumn => {
                        addNewColumnFilter(innerColumn);
                    });
                } else {
                    addNewColumnFilter(column);
                }
            });

            thisTable.off('tableBuilt');
        }
    });

    //handling filter form
    const filterForm = document.querySelector(`#${tableId}-window .filter-button form`);
    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();

            let columnName = event.target.elements.columns.value;
            let filterType = event.target.elements.filterType.value;
            let value = event.target.elements.filterValue.value;
            let tableName = event.target.elements.tableName.value;

            if (columnName && value && tableName) {

                thisTable.addFilter(columnName, filterType, value);

                let newFilter = document.createElement('div');
                newFilter.classList.add('active');
                newFilter.addEventListener('click', (event) => {
                    event.stopPropagation();
                    
                    if (newFilter.classList.contains('active')) {
                        newFilter.classList.remove('active')
                        thisTable.removeFilter(columnName, filterType, value);
                    } else {
                        newFilter.classList.add('active');
                        thisTable.addFilter(columnName, filterType, value);
                    }
                });

                let text = document.createElement('span');
                text.innerText = `${columnName} ${filterType} ${value}`;

                let closeButton = document.createElement('span');
                closeButton.innerText = String.fromCodePoint(10060);
                closeButton.classList.add('remove');

                closeButton.addEventListener('click', (event) => {
                    event.stopPropagation();

                    if (newFilter.classList.contains('active')) {
                        thisTable.removeFilter(columnName, filterType, value);
                    }

                    newFilter.remove();
                });

                newFilter.appendChild(text);
                newFilter.appendChild(closeButton);

                const filterElement = document.querySelector(`#${tableId}-window .applied-filters`);
                filterElement.appendChild(newFilter);
            }
        });
    }
}

let numOfTabsOpen = 0;
async function openNewTab(selectedRows, windowName) {
    if (selectedRows.length > 0 || windowName === 'stats') {
        let elementId = windowName + ++numOfTabsOpen;
        let rowsData = selectedRows.length > 0 ? Array.from(selectedRows, x => x.getData()) : null;
      
        // create nav bar button
        let navBarTemplate = await getTemplate('./templates/tabButton.html');

        let navBarButton = navBarTemplate.querySelector('li');
        navBarButton.dataset.tab = `${elementId}-window`;

        let tabName = navBarTemplate.querySelector('.tab-name');
        let tabNameDataKeys = {
            subs: ['booking_site', 'key'],
            tx: ['subscription_line_id', 'key']
        };

        if (rowsData !== null) {

            for (let index = 0; index < rowsData.length; index++) {
                if (index > 0) {
                    tabName.innerText += ', ';
                }
    
                tabName.innerText += `${rowsData[index][tabNameDataKeys[windowName][0]]} ${rowsData[index][tabNameDataKeys[windowName][1]]}`;
            }
        } else {
            tabName.innerText = 'STATS';
        }
        
        document.getElementById('nav').appendChild(navBarTemplate)
       
        setUpNavButton(document.getElementById('nav').querySelector('li:last-child'));

        // create window
        let newWindowTemplate = await getTemplate('./templates/window.html');

        let windowContainer = newWindowTemplate.querySelector('.window');
        windowContainer.id = `${elementId}-window`;

        let tableContainer = newWindowTemplate.querySelector('.table-content');
        tableContainer.id = elementId;

        let filterForm = newWindowTemplate.querySelector('.filter-button > form');
        if (filterForm) {
            let inputEl = document.createElement('input');
            inputEl.setAttribute('type', 'hidden');
            inputEl.setAttribute('name', 'tableName');
            inputEl.setAttribute('value', elementId);

            filterForm.appendChild(inputEl);
        }
        
        // Setting up Load Selected Button
        const loadSelectedButton = newWindowTemplate.querySelector('.load-selected');
        const numOfSelectedRowsDial = newWindowTemplate.querySelector('.num-selected');
        if (loadSelectedButton) {
            let tabLoadNextPageName = {
                stats: 'subs',
                subs: 'tx'
            };
    
            loadSelectedButton.addEventListener('click', function(event){
                event.stopPropagation();
    
                let selectedRows = allTables[elementId].selectedRows;
    
                // deselect all selected rows
                allTables[elementId].selectedRows = [];
                allTables[elementId].table.deselectRow();
                numOfSelectedRowsDial.innerText = '0';
    
                openNewTab(selectedRows, tabLoadNextPageName[windowName]);
            });
        }

        // add new window to main html page and click to open the tab
        document.getElementById('windows-container').appendChild(newWindowTemplate);
        if (windowName === 'stats') {
            document.getElementById('nav').querySelector('li:last-child').click();
        }
                
        // get and set data to the table
        let message = {
            action: windowName,
            data: rowsData
        };

        loadData(message).then((tableData) => {
            createTable(windowName, elementId, tableData, numOfSelectedRowsDial);
        });
    } 
}

// nav buttons and showing selected table
function setUpNavButton(button) {

    //close tab
    let closeTabButton = button.querySelector('.close-tab');
    closeTabButton.addEventListener('click', function(event){
        event.stopPropagation();

        let windowIdToClose = closeTabButton.parentNode.dataset.tab;
        let tableIdToClose = windowIdToClose.split('-')[0];

        allTables[tableIdToClose].table.destroy();
        delete allTables[tableIdToClose];

        document.getElementById(windowIdToClose).remove();
        closeTabButton.parentNode.remove();
    });

    // change tab
    button.addEventListener('click', function(event){
        event.stopPropagation();

        if (button.classList.contains('selected')) {
            return;
        }

        navButtons = document.querySelectorAll('#nav li');
        navButtons.forEach(button => {
            button.classList.remove('selected');
        });

        button.classList.add('selected');

        let allTables = document.querySelectorAll('.window');
        allTables.forEach(table => {
            table.classList.remove('active');
        });

        let selectedTable = document.getElementById(button.dataset.tab);
        selectedTable.classList.add('active');
    });
}
