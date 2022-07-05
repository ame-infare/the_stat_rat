const { PythonShell } = require('python-shell');

async function getHTMLTemplate(path) {
    const response = await fetch(`./templates/${path}`);
    const template = await response.text();
    return document.createRange().createContextualFragment(template);
}

class Table {
    constructor(type, tableId) {
        this.type = type;
        this.tableId = tableId;

        this.selectedRows = [];
        this.table;

        this.numOfSelectedRowsDial;
    }

    clearSelections() {
        this.selectedRows = [];
        this.table.deselectRow();
        this.numOfSelectedRowsDial.innerText = '0';
    }

    async createTable(dataToSend) {
        let tableTemplate = this.getTableTemplate();

        let tableData = await this.getDataFromDb(dataToSend);

        tableTemplate.data = tableData;
        
        this.table = new Tabulator(`#${this.tableId}`, tableTemplate);

        // double left mouse click will select cell text for copying
        this.table.on('cellDblClick', (e, cell) => {
            let cellElement = cell.getElement();

            if (document.body.createTextRange) {
                const range = document.body.createTextRange();
                range.moveToElementText(cellElement);
                range.select();
            } else if (window.getSelection) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(cellElement);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });

        this.addColumnsAsOptionsForFilterButton();
        this.setupRowSelection();
    }

    async getDataFromDb(dataToSend) {
        let message = {
            action: this.type,
            data: dataToSend
        };
        
        let options = {
            mode: 'json',
            pythonPath: './env/Scripts/python',
            pythonOptions: ['-u'],
            scriptPath: './db_queries/',
            args: [JSON.stringify(message)]
        };

        return new Promise(resolve => {
            PythonShell.run('controller.py', options, function (err, results) {
                if (err) throw err;
                resolve(results[0]);
            });
        });
    }

    addColumnsAsOptionsForFilterButton() {
        let tableId = this.tableId;

        this.table.on('tableBuilt', function() {
            let tableFilterFields = document.querySelector(`div#${tableId}-window [name=columns]`);

            if (tableFilterFields) {
                let columnDefinitions = this.getColumnDefinitions();

                function addNewColumnFilter(column) {
                    let option = document.createElement('option');

                    option.value = column.field;
                    option.innerText = column.title;

                    tableFilterFields.appendChild(option);
                }

                columnDefinitions.forEach(column => {
                    if (!column.title) {
                        return;
                    }

                    if (column.columns) {
                        column.columns.forEach(innerColumn => {
                            addNewColumnFilter(innerColumn);
                        });
                    } else {
                        addNewColumnFilter(column);
                    }
                });

                this.off('tableBuilt');
            }
        });
    }
              
    toggleIcons(icons) {
        icons.forEach(icon => {
            icon.classList.contains('active') ? icon.classList.remove('active') : icon.classList.add('active');
        });
    }

    setupRowSelection() {
        this.table.on('rowSelected', function(row) {
            let selectedRows = allTables[this.element.id].selectedRows;
            let numOfSelectedRowsDial = allTables[this.element.id].numOfSelectedRowsDial;

            if (!selectedRows.includes(row)) {
                selectedRows.push(row);
            }
        
            if (numOfSelectedRowsDial) {
                numOfSelectedRowsDial.innerText = selectedRows.length;
            }
        });
        
        this.table.on('rowDeselected', function(row) {
            let selectedRows = allTables[this.element.id].selectedRows;
            let numOfSelectedRowsDial = allTables[this.element.id].numOfSelectedRowsDial;

            const index = selectedRows.indexOf(row);
            if (index > -1) {
                selectedRows.splice(index, 1);
            }
        
            if (numOfSelectedRowsDial) {
                numOfSelectedRowsDial.innerText = selectedRows.length;
            }
        });
        
        this.table.on('dataSorted', function(sorters, rows) {
            let selectedRows = allTables[this.element.id].selectedRows;

            rows.forEach(row => {
                if (selectedRows.includes(row)) {
                    this.selectRow(row);
                }
            });
        });
    }

    expandRow(cell, tableObj) {
        let expandIcon = document.createElement('span');
        expandIcon.classList.add('icon', 'active');
        expandIcon.innerText = String.fromCodePoint(10133);
    
        expandIcon.addEventListener('click', event => {
            event.stopPropagation();

            tableObj.toggleIcons(expandIcon.parentNode.querySelectorAll('.icon'));

            let rowData = cell.getRow().getData();
            let columns = cell.getTable().getColumnDefinitions();

            let dataContainer = cell.getRow().getElement().querySelector('.data-container');
            dataContainer.classList.add('active');
            
            if (!dataContainer.innerText) {
                for (const column of columns) {
                    if (column.columns) {
                        let columnGroup = document.createElement('ul');
                        columnGroup.classList.add('column-group');

                        let groupName = document.createElement('h3');
                        groupName.innerText = column.title;
                        columnGroup.appendChild(groupName);

                        for (const innerColumn of column.columns) {
                            let columnDataContainer = document.createElement('li');
                            columnDataContainer.classList.add('column-data');
    
                            columnDataContainer.innerText = `${innerColumn.field}: ${rowData[innerColumn.field]}`;
    
                            columnGroup.appendChild(columnDataContainer);
                        }
    
                        dataContainer.appendChild(columnGroup);
                    }
                }
            }    
        });

        let closeIcon = document.createElement('span');
        closeIcon.classList.add('icon');
        closeIcon.innerText = String.fromCodePoint(10134);

        closeIcon.addEventListener('click', event => {
            event.stopPropagation();

            tableObj.toggleIcons(closeIcon.parentNode.querySelectorAll('.icon'));

            let dataContainer = cell.getRow().getElement().querySelector('.data-container');
            dataContainer.classList.remove('active');
        });
        
        let iconContainer = document.createElement('div');
        iconContainer.appendChild(expandIcon);
        iconContainer.appendChild(closeIcon);

        return iconContainer;
    }

    expandableRow(row) {
        let rowElement = row.getElement();

        let expandableDataContainer = document.createElement('div');
        expandableDataContainer.classList.add('data-container');
        rowElement.appendChild(expandableDataContainer);
    }

    openNextIcon(cell, tabName) {

        // transactions are only available 7 days after the end time
        if (tabName === 'tx') {
            const rowData = cell.getData();
            let txEndTime = new Date(rowData['end_run_datetime_utc']);
            if (new Date() - txEndTime >= 604800000) {
                return null;
            }
        }
    
        let nextPageIcon = document.createElement('span');
        nextPageIcon.innerText = String.fromCodePoint(128270);
    
        nextPageIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            openNewTab([cell.getRow()], tabName);
        });
    
        return nextPageIcon;
    }
    
    hotelsIcon(cell) {
        let rowData = cell.getData();
        if (rowData['hotel_group_id']) {
            let hotelsIcon = document.createElement('span');
            hotelsIcon.innerText = String.fromCodePoint(9962);
        
            hotelsIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                openNewTab([cell.getRow()], 'hotels');
            });
            
            return hotelsIcon;
        }
    
        return null;
    }

    addNote(cell, tableObj) {
        let addNote = document.createElement('span');
        addNote.classList.add('icon', 'active');
        addNote.innerText = String.fromCodePoint(9997);

        let notBookable = document.createElement('span');
        notBookable.classList.add('icon');
        notBookable.innerText = String.fromCodePoint(128277);
                
        let iconContainer = document.createElement('div');
        iconContainer.appendChild(addNote);
        iconContainer.appendChild(notBookable);

        async function addNoteFunctionality(event, cell) {
            event.stopPropagation();

            let tableWindow = document.querySelector(`#${tableObj.tableId}-window`);

            let form = tableWindow.querySelector('.not-bookable');
            if (!form) {
                let formTemplate = await getHTMLTemplate('notBookableForm.html');
                form = formTemplate.querySelector('form');

                //add element to store row index in the form
                let rowIndex = document.createElement('input');
                rowIndex.setAttribute('type', 'hidden');
                rowIndex.setAttribute('name', 'index');
                form.appendChild(rowIndex);
    
                let cancelButton = form.querySelector('.cancel');
                cancelButton.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    cancelButton.parentNode.classList.remove('active');
                });
                                  
                form.addEventListener('submit', event => {
                    event.preventDefault();
    
                    let nbNote = event.target.elements.note.value;
                    let rowIndex = event.target.elements.index.value;
    
                    let cellToModify = cell.getTable().getRowFromPosition(rowIndex).getCell(cell.getColumn())
    
                    cellToModify.setValue(nbNote);
    
                    if (nbNote && cellToModify.getElement().querySelector('.icon.active').innerText === String.fromCodePoint(9997) ||
                        !nbNote && cellToModify.getElement().querySelector('.icon.active').innerText === String.fromCodePoint(128277)) {
                        tableObj.toggleIcons(cellToModify.getElement().querySelectorAll('.icon'));
                    }
    
                    form.classList.remove('active');
                });
    
                tableWindow.appendChild(form);
            }
            
            form.classList.add('active');

            let formName = form.querySelector('.name');
            formName.innerText = `Add a note for subline: ${cell.getRow().getData().subscription_line_id}`;

            //get note that exists and add to note input element
            //make input in focus
            let inputElement = form.querySelector('.note');
            inputElement.focus();
            inputElement.value = cell.getValue() === undefined ? '' : cell.getValue();

            //set row index position to the form
            let rowIndex = form.querySelector('[name=index]')
            rowIndex.setAttribute('value', cell.getRow().getPosition());
        }
    
        addNote.addEventListener('click', event => {addNoteFunctionality(event, cell)});
        notBookable.addEventListener('click', event => {addNoteFunctionality(event, cell)});

        return iconContainer;
    }

    sendNotes() {
        let sendNotesButton = document.createElement('button');
        sendNotesButton.classList.add('send-notes');
        sendNotesButton.innerText = 'unBook';

        sendNotesButton.addEventListener('click', () => {
            let allRows = this.table.getData();
            let rowsWithNotes = allRows.filter(row => row.add_note);

            if (rowsWithNotes.length > 0) {
                getHTMLTemplate('freeForm.html').then(form => {
                    let formElement = form.querySelector('form');


                    let data = document.createElement('div');
                    let initialQuery = document.createElement('span');
                    initialQuery.innerText = 'INSERT INTO beclu4.Vacation_Stats.dbo.T_Vacations_NB_Sublines (subscription_line_id, note) VALUES\n';
                    data.appendChild(initialQuery);
                    rowsWithNotes.forEach((row, index) => {
                        let rowData = document.createElement('span');

                        rowData.innerText = (index == 0 ? '' : ',') + `(${row.subscription_line_id}, '${row.add_note}')\n`;

                        data.appendChild(rowData);
                    });
    
                    formElement.prepend(data);

                    formElement.addEventListener('submit', event => {
                        event.stopPropagation();
                        event.preventDefault();

                        //send to python query
                        formElement.remove();
                    });

                    formElement.querySelector('.cancel').addEventListener('click', event => {
                        event.stopPropagation();
                        event.preventDefault();

                        formElement.remove();
                    });

                    formElement.classList.add('active');

                    this.table.element.parentElement.appendChild(formElement);
                });
            }
        });

        return sendNotesButton;
    }

    formatUnixTime(cell) {
        let unixTime = cell.getValue();
        if (unixTime) {
            let date = new Date(unixTime);

            return date.toISOString().replace('T', ' ').replace('Z', '')
        }
        
        return null;
    }

    getTableOptions(option) {
        let options = {
            stats: {
                loadSelectedNextPageName: 'subs',
                buttons: ['load-selected', 'filter-button']
            },
            subs: {
                tabNameDataKeys: ['booking_site', 'key'],
                loadSelectedNextPageName: 'tx',
                buttons: ['load-selected', 'filter-button', 'valid', 'invalid']
            },
            tx: {
                tabNameDataKeys: ['subscription_line_id', 'key'],
                buttons: ['filter-button']
            },
            hotels: {
                tabNameDataKeys: ['hotel_group_id', 'subscription_line_id'],
                buttons: ['filter-button']
            },
            valid: {
                tabNameDataKeys: ['subscription_line_id'],
                buttons: ['filter-button']
            },
            invalid: {
                tabNameDataKeys: ['subscription_line_id'],
                buttons: ['filter-button']
            }
        }

        return options[this.type][option];
    }

    getTableTemplate() {
        let templates = {

            default: {
                layout: "fitDataFill",
                height: "100%",
                selectable: true,
                scrollToRowIfVisible: true, //otherwise expandable rows are buggy when scrolling
            },

            stats: {   
                columns: [
                    {
                        title: "SUBLINES",
                        formatter: this.openNextIcon, formatterParams: () => {return 'subs'}, 
                        hozAlign:"center", headerSort:false, headerVertical:true
                    },
                    {title: "Prio", field: "prio"},
                    {title: "Booking site", field: "booking_site", headerFilter: true},
                    {title: "BS Id", field: "bs_id", headerFilter: true},
                    {
                        title: "Type", field: "type", 
                        headerFilter: true, headerFilterFunc : "="
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
                    {
                        title: "Issue date", field: "issue_date",
                        formatter: this.formatUnixTime
                    },
                    {title: "Aff profiles", field: "affected_profiles"},
                ]
            },
    
            subs: {
                rowFormatter: this.expandableRow,

                columns:[
                    {
                        title: "EXPAND",
                        formatter: this.expandRow, formatterParams: () => {return this},
                        hozAlign:"center", headerSort:false, headerVertical:true
                    },
                    {
                        title: "TRANSACTIONS",
                        formatter: this.openNextIcon, formatterParams: () => {return 'tx'},
                        hozAlign:"center", headerSort:false, headerVertical:true
                    },
                    {
                        title: "HOTELS",
                        formatter: this.hotelsIcon, 
                        hozAlign:"center", headerSort:false, headerVertical:true
                    },
                    {
                        title: "NOTE", field: "add_note",
                        formatter: this.addNote, formatterParams: () => {return this},
                        titleFormatter: this.sendNotes,
                        hozAlign:"center", headerSort:false, headerVertical:true
                    },
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
                    {title: "tx missing", field: "missing_tx"},
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
    
            hotels: {
                columns: [
                    {title: "BS Id", field: "booking_site_id"},
                    {title: "Hotel Group", field: "hotel_group_id"},
                    {title: "Infare Hotel Id", field: "infare_hotel_id"},
                    {title: "Supplier Id", field: "SupplierId"},
                    {title: "Supplier Hotel Id", field: "SupplierHotelId"},
                    {title: "Infare Name Key", field: "InfareNameKey"},
                    {title: "Date Mapped", field: "DateMapped"},
                    {title: "User Updated Mapping", field: "UserUpdatedMapping"},
                    {title: "Name", field: "Name"},
                    {title: "Chain Name", field: "ChainName"},
                    {title: "Associated Location Code", field: "AssociatedLocationCode"},
                    {title: "Location Type Code", field: "LocationTypeCode"},
                    {title: "Address", field: "Address"},
                    {title: "Street1", field: "Street1"},
                    {title: "Street2", field: "Street2"},
                    {title: "City", field: "City"},
                    {title: "Region", field: "Region"},
                    {title: "Postcode", field: "Postcode"},
                    {title: "Country", field: "Country"},
                    {title: "Latitude", field: "Latitude"},
                    {title: "Longitude", field: "Longitude"},
                    {title: "Star Rating", field: "StarRating"},
                    {title: "Data Supplier", field: "DataSupplier"},
                ]
            },
    
            tx: {
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
            },

            valid: {
                rowFormatter: this.expandableRow,

                columns: [
                    {
                        title: "EXPAND",
                        formatter: this.expandRow, formatterParams: () => {return this},
                        hozAlign:"center", headerSort:false, headerVertical:true
                    },
                    {title: "Queue Id", field: "scheduler_active_queue_id"},
                    {title: "Search Rank", field: "search_rank"},
                    {
                        title: "Time Found",
                        columns: [
                            {title: "Found BPTD UTC", field: "found_BPTD_utc"},
                            {title: "Found BPTS UTC", field: "found_BPTS_utc"},
                        ]
                    },
                    {
                        title: "OUT flight data",
                        columns: [
                            {title: "Seg1 Origin station code", field: "out_seg1_origin_station_code"},
                            {title: "Seg1 Dest station code", field: "out_seg1_destination_station_code"},
                            {title: "Seg1 Carrier", field: "out_seg1_carrier_code"},
                            {title: "Seg1 Operating Carrier", field: "out_seg1_operating_carrier_code"},
                            {title: "Seg1 Flight Number", field: "out_seg1_flight_number"},
                            {title: "Seg1 BPT Departure", field: "out_seg1_BPT_departure"},
                            {title: "Seg1 BPT Arrival", field: "out_seg1_BPT_arrival"},
                            {title: "Seg1 Flight Duration", field: "out_seg1_flight_duration"},
                            {title: "Seg1 Equipment", field: "out_seg1_equipment"},
                            {title: "Seg1 Legs Count", field: "out_seg1_legs_count"},
                            {title: "Seg1 Legs Stops Array", field: "out_seg1_legs_stops_array"},
                            {title: "Seg1 Available Seats", field: "out_seg1_available_seats"},
                            {title: "Seg1 Cabin Class", field: "out_seg1_cabin_class"},
                            {title: "Seg1 Fare Family", field: "out_seg1_fare_family"},
                            {title: "Seg1 Booking Class", field: "out_seg1_booking_class"},
                            {title: "Seg1 Fare Basis", field: "out_seg1_fare_basis_code"},
                            {title: "Seg2 Origin station code", field: "out_seg2_origin_station_code"},
                            {title: "Seg2 Dest station code", field: "out_seg2_destination_station_code"},
                            {title: "Seg2 Carrier", field: "out_seg2_carrier_code"},
                            {title: "Seg2 Operating Carrier", field: "out_seg2_operating_carrier_code"},
                            {title: "Seg2 Flight Number", field: "out_seg2_flight_number"},
                            {title: "Seg2 BPT Departure", field: "out_seg2_BPT_departure"},
                            {title: "Seg2 BPT Arrival", field: "out_seg2_BPT_arrival"},
                            {title: "Seg2 Flight Duration", field: "out_seg2_flight_duration"},
                            {title: "Seg2 Equipment", field: "out_seg2_equipment"},
                            {title: "Seg2 Legs Count", field: "out_seg2_legs_count"},
                            {title: "Seg2 Legs Stops Array", field: "out_seg2_legs_stops_array"},
                            {title: "Seg2 Available Seats", field: "out_seg2_available_seats"},
                            {title: "Seg2 Cabin Class", field: "out_seg2_cabin_class"},
                            {title: "Seg2 Fare Family", field: "out_seg2_fare_family"},
                            {title: "Seg2 Booking Class", field: "out_seg2_booking_class"},
                            {title: "Seg2 Fare Basis", field: "out_seg2_fare_basis_code"},
                            {title: "Seg3 Origin station code", field: "out_seg3_origin_station_code"},
                            {title: "Seg3 Dest station code", field: "out_seg3_destination_station_code"},
                            {title: "Seg3 Carrier", field: "out_seg3_carrier_code"},
                            {title: "Seg3 Operating Carrier", field: "out_seg3_operating_carrier_code"},
                            {title: "Seg3 Flight Number", field: "out_seg3_flight_number"},
                            {title: "Seg3 BPT Departure", field: "out_seg3_BPT_departure"},
                            {title: "Seg3 BPT Arrival", field: "out_seg3_BPT_arrival"},
                            {title: "Seg3 Flight Duration", field: "out_seg3_flight_duration"},
                            {title: "Seg3 Equipment", field: "out_seg3_equipment"},
                            {title: "Seg3 Legs Count", field: "out_seg3_legs_count"},
                            {title: "Seg3 Legs Stops Array", field: "out_seg3_legs_stops_array"},
                            {title: "Seg3 Available Seats", field: "out_seg3_available_seats"},
                            {title: "Seg3 Cabin Class", field: "out_seg3_cabin_class"},
                            {title: "Seg3 Fare Family", field: "out_seg3_fare_family"},
                            {title: "Seg3 Booking Class", field: "out_seg3_booking_class"},
                            {title: "Seg3 Fare Basis", field: "out_seg3_fare_basis_code"},
                        ]
                    },
                    {
                        title: "IN flight data",
                        columns: [
                            {title: "Seg1 Origin station code", field: "in_seg1_origin_station_code"},
                            {title: "Seg1 Dest station code", field: "in_seg1_destination_station_code"},
                            {title: "Seg1 Carrier", field: "in_seg1_carrier_code"},
                            {title: "Seg1 Operating Carrier", field: "in_seg1_operating_carrier_code"},
                            {title: "Seg1 Flight Number", field: "in_seg1_flight_number"},
                            {title: "Seg1 BPT Departure", field: "in_seg1_BPT_departure"},
                            {title: "Seg1 BPT Arrival", field: "in_seg1_BPT_arrival"},
                            {title: "Seg1 Flight Duration", field: "in_seg1_flight_duration"},
                            {title: "Seg1 Equipment", field: "in_seg1_equipment"},
                            {title: "Seg1 Legs Count", field: "in_seg1_legs_count"},
                            {title: "Seg1 Legs Stops Array", field: "in_seg1_legs_stops_array"},
                            {title: "Seg1 Available Seats", field: "in_seg1_available_seats"},
                            {title: "Seg1 Cabin Class", field: "in_seg1_cabin_class"},
                            {title: "Seg1 Fare Family", field: "in_seg1_fare_family"},
                            {title: "Seg1 Booking Class", field: "in_seg1_booking_class"},
                            {title: "Seg1 Fare Basis", field: "in_seg1_fare_basis_code"},

                            {title: "Seg1 Origin station code", field: "in_seg2_origin_station_code"},
                            {title: "Seg1 Dest station code", field: "in_seg2_destination_station_code"},
                            {title: "Seg1 Carrier", field: "in_seg2_carrier_code"},
                            {title: "Seg1 Operating Carrier", field: "in_seg2_operating_carrier_code"},
                            {title: "Seg1 Flight Number", field: "in_seg2_flight_number"},
                            {title: "Seg1 BPT Departure", field: "in_seg2_BPT_departure"},
                            {title: "Seg1 BPT Arrival", field: "in_seg2_BPT_arrival"},
                            {title: "Seg1 Flight Duration", field: "in_seg2_flight_duration"},
                            {title: "Seg1 Equipment", field: "in_seg2_equipment"},
                            {title: "Seg1 Legs Count", field: "in_seg2_legs_count"},
                            {title: "Seg1 Legs Stops Array", field: "in_seg2_legs_stops_array"},
                            {title: "Seg1 Available Seats", field: "in_seg2_available_seats"},
                            {title: "Seg1 Cabin Class", field: "in_seg2_cabin_class"},
                            {title: "Seg1 Fare Family", field: "in_seg2_fare_family"},
                            {title: "Seg1 Booking Class", field: "in_seg2_booking_class"},
                            {title: "Seg1 Fare Basis", field: "in_seg2_fare_basis_code"},
                            
                            {title: "Seg1 Origin station code", field: "in_seg3_origin_station_code"},
                            {title: "Seg1 Dest station code", field: "in_seg3_destination_station_code"},
                            {title: "Seg1 Carrier", field: "in_seg3_carrier_code"},
                            {title: "Seg1 Operating Carrier", field: "in_seg3_operating_carrier_code"},
                            {title: "Seg1 Flight Number", field: "in_seg3_flight_number"},
                            {title: "Seg1 BPT Departure", field: "in_seg3_BPT_departure"},
                            {title: "Seg1 BPT Arrival", field: "in_seg3_BPT_arrival"},
                            {title: "Seg1 Flight Duration", field: "in_seg3_flight_duration"},
                            {title: "Seg1 Equipment", field: "in_seg3_equipment"},
                            {title: "Seg1 Legs Count", field: "in_seg3_legs_count"},
                            {title: "Seg1 Legs Stops Array", field: "in_seg3_legs_stops_array"},
                            {title: "Seg1 Available Seats", field: "in_seg3_available_seats"},
                            {title: "Seg1 Cabin Class", field: "in_seg3_cabin_class"},
                            {title: "Seg1 Fare Family", field: "in_seg3_fare_family"},
                            {title: "Seg1 Booking Class", field: "in_seg3_booking_class"},
                            {title: "Seg1 Fare Basis", field: "in_seg3_fare_basis_code"},
                        ]
                    },
                    {
                        title: "OUT general",
                        columns: [
                            {title: "BPTD Departure", field: "out_BPTD_departure"},
                            {title: "BPTS Departure", field: "out_BPTS_departure"},
                            {title: "BPT Arrival", field: "out_BPT_arrival"},
                            {title: "Duration", field: "out_duration"},
                            {title: "Segments Count", field: "out_segments_count"},
                            {title: "Legs Count", field: "out_legs_count"},
                            {title: "Distance km", field: "out_distance_km"},
                            {title: "Main Segment", field: "out_main_segment"},
                            {title: "Origin Station Code", field: "out_origin_station_code"},
                            {title: "Destination Station Code", field: "out_destination_station_code"},
                            {title: "Cabin Class", field: "out_cabin_class"},
                            {title: "Fare Family", field: "out_fare_family"},
                            {title: "Booking Class", field: "out_booking_class"},
                            {title: "Fare Basis Code", field: "out_fare_basis_code"},
                            {title: "Fare exc", field: "out_fare_exc"},
                            {title: "Fare inc", field: "out_fare_inc"},
                            {title: "Taxes fees", field: "out_taxes_fees"},
                            {title: "Fare exc USD", field: "out_fare_exc_usd"},
                            {title: "Fare inc USD", field: "out_fare_inc_usd"},
                        ]
                    },
                    {
                        title: "IN General",
                        columns: [
                            {title: "BPTD Departure", field: "in_BPTD_departure"},
                            {title: "BPTS Departure", field: "in_BPTS_departure"},
                            {title: "BPT Arrival", field: "in_BPT_arrival"},
                            {title: "Duration", field: "in_duration"},
                            {title: "Segments Count", field: "in_segments_count"},
                            {title: "Legs Count", field: "in_legs_count"},
                            {title: "Distance km", field: "in_distance_km"},
                            {title: "Main Segment", field: "in_main_segment"},
                            {title: "Origin Station Code", field: "in_origin_station_code"},
                            {title: "Destination Station Code", field: "in_destination_station_code"},
                            {title: "Cabin Class", field: "in_cabin_class"},
                            {title: "Fare Family", field: "in_fare_family"},
                            {title: "Booking Class", field: "in_booking_class"},
                            {title: "Fare Basis Code", field: "in_fare_basis_code"},
                            {title: "Fare exc", field: "in_fare_exc"},
                            {title: "Fare inc", field: "in_fare_inc"},
                            {title: "Taxes fees", field: "in_taxes_fees"},
                            {title: "Fare exc USD", field: "in_fare_exc_usd"},
                            {title: "Fare inc USD", field: "in_fare_inc_usd"},
                        ]
                    },
                    {
                        title: "Trip Data",
                        columns: [
                            {title: "Geodesic Distance km", field: "origin_destination_geodesic_distance_km"},
                            {title: "Point Of Sale", field: "trip_point_of_sale"},
                            {title: "Advance Purchase", field: "trip_advance_purchase"},
                            {title: "Min Stay", field: "trip_min_stay"},
                            {title: "Is One way", field: "trip_is_one_way"},
                            {title: "Is Domestic", field: "trip_is_domestic"},
                            {title: "Is Fare Basis Constructed Bitmask", field: "trip_is_fare_basis_constructed_bitmask"},
                            {title: "State ID", field: "trip_state_id"},
                            {title: "Fare exc", field: "trip_fare_exc"},
                            {title: "Fare inc", field: "trip_fare_inc"},
                            {title: "Taxes Fees", field: "trip_taxes_fees"},
                            {title: "Fee CreditCard", field: "trip_fee_creditcard"},
                            {title: "Fee YQ", field: "trip_fee_yq"},
                            {title: "Fee YR", field: "trip_fee_yr"},
                            {title: "Fee Booking", field: "trip_fee_booking"},
                            {title: "Ancillaries Dict", field: "trip_ancilliaries_dictionary"},
                            {title: "Fare exc USD", field: "trip_fare_exc_usd"},
                            {title: "Fare inc USD", field: "trip_fare_inc_usd"},
                            {title: "Currency Code Fare", field: "currency_code_fare"},
                            {title: "Currency Code Taxes Fees", field: "currency_code_taxes_fees"},
                            {title: "Currency Rate Fate to USD", field: "currency_rate_fare_to_usd"},
                            {title: "Currency Rate Fare Date BPTD", field: "currency_rate_fare_date_BPTD"},
                            {title: "BPT Inserted UTC", field: "bpt_inserted_utc"},
                            {title: "Passenger Count", field: "trip_passenger_count"},
                            {title: "Passenger Type", field: "trip_passenger_type"},
                            {title: "Included Extras dict", field: "trip_included_extras_dictionary"},
                            {title: "Excluded Extras dict", field: "trip_excluded_extras_dictionary"},
                            {title: "Misc Data dict", field: "misc_data_dictionary"},
                        ]
                    },
                    {
                        title: "Others",
                        columns: [
                            {title: "DFS Custom dict", field: "dfs_custom_dictionary"},
                            {title: "Found URL", field: "found_url"},
                            {title: "SC RowID array", field: "search_criteria_rowid_array"},
                            {title: "Profile ID array", field: "profile_id_array"},
                            {title: "Feed ID array", field: "feed_id_array"},
                            {title: "Valid Bitmask", field: "valid_bitmask"},
                            {title: "Robot Could Collect Bitmask", field: "robot_could_collect_bitmask"},
                            {title: "Robot Collected Bitmask", field: "robot_collected_bitmask"},
                            {title: "Robot Instance ID", field: "robot_instance_id"},
                            {title: "Batch Name", field: "batch_name"},
                            {title: "Version", field: "version"},
                            {title: "DCT Debug dict", field: "dct_debug_dictionary"},
                            {title: "DCT state", field: "dct_state"},
                        ]
                    },
                    {
                        title: "Hotel Data",
                        columns: [
                            {title: "Hotel included", field: "hotel_is_included"},
                            {title: "Rating Searched", field: "hotel_rating_searched"},
                            {title: "Check In BPTD", field: "hotel_check_in_bptd"},
                            {title: "Check Out BPTD", field: "hotel_check_out_bptd"},
                            {title: "Nights Stay", field: "hotel_nights_stay"},
                            {title: "Associaled Location Code", field: "hotel_associated_location_code"},
                            {title: "Location Code Type", field: "hotel_location_code_type"},
                            {title: "Observed Name", field: "hotel_observed_name"},
                            {title: "Observed Rating", field: "hotel_observed_rating"},
                            {title: "Observed Address", field: "hotel_observed_address"},
                            {title: "Observed Street", field: "hotel_observed_street"},
                            {title: "Observed City", field: "hotel_observed_city"},
                            {title: "Observed Region", field: "hotel_observed_region"},
                            {title: "Observed Postcode", field: "hotel_observed_postcode"},
                            {title: "Observed Latitude", field: "hotel_observed_latitude"},
                            {title: "Observed Longitude", field: "hotel_observed_longitude"},
                            {title: "Name Infare Key", field: "hotel_name_infare_key"},
                            {title: "Supplier ID", field: "hotel_supplier_id"},
                            {title: "Mapped ID", field: "hotel_mapped_id"},
                            {title: "Mapped Name", field: "hotel_mapped_name"},
                            {title: "Mapped Address", field: "hotel_mapped_address"},
                            {title: "Mapped Longitude", field: "hotel_mapped_longitude"},
                            {title: "Mapped Latitude", field: "hotel_mapped_latitude"},
                            {title: "Room Description", field: "hotel_room_description"},
                            {title: "Room Type", field: "hotel_room_type"},
                            {title: "Room Class", field: "hotel_room_class"},
                            {title: "Room Bed Size", field: "hotel_room_bed_size"},
                            {title: "Room View", field: "hotel_room_view"},
                            {title: "Board Basis", field: "hotel_board_basis"},
                            {title: "Board Basis Searched", field: "hotel_board_basis_searched"},
                            {title: "Room Amenities", field: "hotel_room_amenities"},
                            {title: "Is Refundable", field: "hotel_refundable"},
                            {title: "Payment Type", field: "hotel_payment_type"},
                            {title: "Rate exc", field: "hotel_rate_exc"},
                            {title: "Rate inc", field: "hotel_rate_inc"},
                            {title: "Taxes and fees", field: "hotel_taxes_fees"},
                            {title: "Nightly rates dict", field: "hotel_nightly_rates_dictionary"},
                            {title: "Due fees", field: "hotel_due_fees"},
                            {title: "Due Fees currency", field: "hotel_due_fees_currency"},
                        ]
                    },
                    {
                        title: "Car Data",
                        columns: [
                            {title: "Car Included", field: "car_is_included"},
                            {title: "Rental Company", field: "car_rental_company"},
                            {title: "Make Model", field: "car_make_model"},
                            {title: "SIPP", field: "car_sipp_code"},
                            {title: "SIPP Searched", field: "car_sipp_code_searched"},
                            {title: "Allowed mileage", field: "car_allowed_mileage"},
                            {title: "Unlimited mileage", field: "car_unlimited_mileage"},
                            {title: "Discount Code Searched", field: "car_discount_code_searched"},
                            {title: "Pickup Location", field: "car_pickup_location"},
                            {title: "Pickup Location Type", field: "car_pickup_location_type"},
                            {title: "Dropoff Location", field: "car_dropoff_location"},
                            {title: "Dropoff Location Type", field: "car_dropoff_location_type"},
                            {title: "Pickup BPTD", field: "car_pickup_bptd"},
                            {title: "Pickup BPTS", field: "car_pickup_bpts"},
                            {title: "Dropoff BPTD", field: "car_dropoff_bptd"},
                            {title: "Dropoff BPTS", field: "car_dropoff_bpts"},
                            {title: "Payment Type", field: "car_payment_type"},
                            {title: "Rate exc", field: "car_rate_exc"},
                            {title: "Rate inc", field: "car_rate_inc"},
                            {title: "Taxes and Fees", field: "car_taxes_fees"},
                        ]
                    },
                    {
                        title: "Package data",
                        columns: [
                            {title: "Price exc", field: "package_price_exc"},
                            {title: "Price inc", field: "package_price_inc"},
                            {title: "Taxes and Fees", field: "package_taxes_fees"},
                            {title: "Claimed Discount", field: "package_claimed_discount"},
                            {title: "Special Offer Text", field: "package_special_offer_text"},
                        ]
                    },
                    {
                        title: "Subline",
                        columns: [
                            {title: "Adults", field: "adults"},
                            {title: "Children", field: "children"},
                            {title: "Dest User Input", field: "destination_user_input"},
                            {title: "Flight Included", field: "flight_is_included"},
                            {title: "Carrier Searched", field: "flight_carrier_searched"},
                            {title: "Max Connections", field: "flight_max_connections_searched"},
                            {title: "Searched Cabin Class", field: "searched_cabin_class"},
                            {title: "Validating carrier code", field: "validating_carrier_code"},
                        ]
                    },
                    {
                        title: "Tx data",
                        columns: [
                            {title: "Partition Number", field: "partition_number"},
                            {title: "Data collection Type ID", field: "data_collection_type_id"},
                            {title: "Booking Site ID", field: "booking_site_id"},
                            {title: "Data source ID", field: "data_source_id"},
                            {title: "Distribution Channel Id", field: "distribution_channel_id"},
                            {title: "Sales Channel Booking Site ID", field: "sales_channel_booking_site_id"},
                        ]
                    },
                ]
            }
        };
        
        return Object.assign(templates.default, templates[this.type]);
    }
}