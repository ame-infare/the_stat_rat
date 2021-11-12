const Tabulator = require('tabulator-tables');

// Sublines Table
let table = new Tabulator("#table-sublines", {
    layout: "fitDataFill",
    maxHeight: "970",
    selectable: true,
    //responsiveLayout: "collapse",
    //responsiveLayoutCollapseStartOpen: false,

    columns:[
        //{formatter: "responsiveCollapse", headerSort: false, width: 30},
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
                {title: "Destination", field: "destination"},
                {title: "Destination type", field: "destination_type"},
                {title: "User input", field: "destination_user_input"},
                {title: "Adults", field: "adults"},
                {title: "Children", field: "children"},
                {title: "Origin", field: "flight_origin"},
                {title: "Origin type", field: "flight_origin_type"},
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
});

// Load subline data
window.addEventListener("message", (event) => {
    let message = {
        action: 'sublines',
        data: event.data
    };

    loadData(message).then((tableData) => {
        table.setData(tableData).then(function() {
            //turn off data loading html
        });
    });
}, false);
