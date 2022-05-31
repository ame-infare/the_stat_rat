const Tabulator = require('tabulator-tables');

// an object to store all instantiated tables
let allTables = {};

let numOfTabsOpen = 0;

async function openNewTab(selectedRows, windowName) {
    if (selectedRows.length > 0 || windowName === 'stats') {
        let elementId = windowName + ++numOfTabsOpen;
        let rowsData = selectedRows.length > 0 ? Array.from(selectedRows, x => x.getData()) : null;

        allTables[elementId] = new Table(windowName, elementId);

        await createNavBarButton(rowsData, elementId);

        let newWindowTemplate = await createWindow(elementId);
        
        await setupButtons(elementId, newWindowTemplate);

        // add new window to main html page and click to open the tab
        document.getElementById('windows-container').appendChild(newWindowTemplate);

        if (windowName === 'stats') {
            document.getElementById('nav').querySelector('li:last-child').click();
        }

        allTables[elementId].createTable(rowsData);
    }
}

async function createNavBarButton(rowsData, elementId) {
    let navBarTemplate = await getHTMLTemplate('tabButton.html');

    let navBarButton = navBarTemplate.querySelector('li');
    navBarButton.dataset.tab = `${elementId}-window`;

    let tabNameHTML = navBarTemplate.querySelector('.tab-name');
    
    if (rowsData !== null) {
        tabNameDataKeys = allTables[elementId].getTableOptions('tabNameDataKeys');
        for (let index = 0; index < rowsData.length; index++) {
            if (index > 0) {
                tabNameHTML.innerText += ', ';
            }
            let tabName = tabNameDataKeys.map(key => rowsData[index][key]).join(" ")
            tabNameHTML.innerText += tabName;
        }
    } else {
        tabNameHTML.innerText = 'STATS';
    }

    if (elementId.startsWith('valid')) {
        tabNameHTML.innerText += ' valid data';
    } else if (elementId.startsWith('invalid')) {
        tabNameHTML.innerText += ' invalid data';
    }
    
    document.getElementById('nav').appendChild(navBarTemplate)
    
    setUpNavButton(document.getElementById('nav').querySelector('li:last-child'));
}

async function createWindow(elementId) {
    let newWindowTemplate = await getHTMLTemplate('window.html');

    let windowContainer = newWindowTemplate.querySelector('.window');
    windowContainer.id = `${elementId}-window`;

    let tableContainer = newWindowTemplate.querySelector('.table-content');
    tableContainer.id = elementId;

    return newWindowTemplate;
}

async function setupButtons(elementId, newWindowTemplate) {
    let buttonsToAdd = allTables[elementId].getTableOptions('buttons');
    if (buttonsToAdd) {
        let buttonTemplates = await getHTMLTemplate('windowButtons.html');
        let buttonsContainer = newWindowTemplate.querySelector('.window-buttons');

        await buttonsToAdd.forEach(button => {
            let buttonTemplate = buttonTemplates.querySelector(`#${button}`).content.cloneNode(true);
            buttonsContainer.appendChild(buttonTemplate);
        });
    }

    // Setting up Load Selected Button
    const loadSelectedButton = newWindowTemplate.querySelector('.load-selected');
    allTables[elementId].numOfSelectedRowsDial = newWindowTemplate.querySelector('.num-selected');
    if (loadSelectedButton) {
        let nextPageName = allTables[elementId].getTableOptions('loadSelectedNextPageName');

        loadSelectedButton.addEventListener('click', function(event){
            event.stopPropagation();

            openNewTab(allTables[elementId].selectedRows, nextPageName);

            allTables[elementId].clearSelections();
        });
    }
    
    // Setting up Valid and Invalid data buttons
    const validDataButton = newWindowTemplate.querySelector('.valid');
    if (validDataButton) {
        validDataButton.addEventListener('click', function(event){
            event.stopPropagation();
            openNewTab([allTables[elementId].table.getRows()[0]], 'valid');
        });
    }
    const invalidDataButton = newWindowTemplate.querySelector('.invalid');
    if (invalidDataButton) {
        invalidDataButton.addEventListener('click', function(event){
            event.stopPropagation();
            openNewTab([allTables[elementId].table.getRows()[0]], 'invalid');
        });
    }

    //handling filter form button
    const filterForm = newWindowTemplate.querySelector('.filter-button form');
    if (filterForm) {

        //create hidden input element with table name in filter form
        let inputEl = document.createElement('input');
        inputEl.setAttribute('type', 'hidden');
        inputEl.setAttribute('name', 'tableName');
        inputEl.setAttribute('value', elementId);
        filterForm.appendChild(inputEl);

        // filter button functionality
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();

            let columnName = event.target.elements.columns.value;
            let filterType = event.target.elements.filterType.value;
            let value = event.target.elements.filterValue.value;
            let tableName = event.target.elements.tableName.value;

            if (columnName && value && tableName) {

                allTables[elementId].table.addFilter(columnName, filterType, value);

                let newFilter = document.createElement('div');
                newFilter.classList.add('active');
                newFilter.addEventListener('click', (event) => {
                    event.stopPropagation();
                    
                    if (newFilter.classList.contains('active')) {
                        newFilter.classList.remove('active')
                        allTables[elementId].table.removeFilter(columnName, filterType, value);
                    } else {
                        newFilter.classList.add('active');
                        allTables[elementId].table.addFilter(columnName, filterType, value);
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
                        allTables[elementId].table.removeFilter(columnName, filterType, value);
                    }

                    newFilter.remove();
                });

                newFilter.appendChild(text);
                newFilter.appendChild(closeButton);

                const filterElement = document.querySelector(`#${elementId}-window .applied-filters`);
                filterElement.appendChild(newFilter);
            }
        });
    }
}

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

// Initial Stats Load
openNewTab([], 'stats');
