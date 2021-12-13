const Tabulator = require('tabulator-tables');

// an object to store all tables
let allTables = {};

const openNextIcon = function (cell, formatterParams) {
    return String.fromCodePoint(128270);
}

const openNextPage = function(event, cell) { 
    event.stopPropagation();

    openNewWindow([cell.getRow()]);
}

function createTable(templateName, tableId, tableData, selectionsButton = null) {
    let templates = {
        stats: {
            layout: "fitDataFill",
            maxHeight: "100%",
            selectable: true,

            columns: [
                {formatter: openNextIcon, hozAlign:"center", headerSort:false, cellClick: openNextPage},
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
            layout: "fitData",
            maxHeight: "100%",
            selectable: true,
        
            columns:[
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
        }
    };

    selectedTemplate = templates[templateName];
    selectedTemplate.data = tableData;

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

function openNewWindow(selectedRows) {
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

                let filterForm = newWindowTemplate.querySelector('.filter-button > form');
                if (filterForm) {
                    let inputEl = document.createElement('input');
                    inputEl.setAttribute('type', 'hidden');
                    inputEl.setAttribute('name', 'tableName');
                    inputEl.setAttribute('value', elementId);

                    filterForm.appendChild(inputEl);
                }
                
                let selectionsButton = newWindowTemplate.querySelector('.num-selected');

                document.getElementById('windows-container').appendChild(newWindowTemplate);

                return selectionsButton;
            }).then((selectionsButton) => {
                
                // get and set data to the table
                let message = {
                    action: 'sublines',
                    data: rowsData
                };

                loadData(message).then((tableData) => {
                    createTable('subs', elementId, tableData, selectionsButton);
                });
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
