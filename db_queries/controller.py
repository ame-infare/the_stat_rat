from sys import argv
import json
import pyodbc
import pandas as pd

def get_message():
    return json.loads(argv[1])

def modify_table(table_data, mod_id):
    if mod_id == 'subs':
        # add a column missing_tx with number of missing tx for that subline
        table_data['missing_tx'] = table_data['tx_generated'] - table_data['tx_with_data'] - table_data['tx_invalid'] - table_data['fhm_errors'] - table_data['unavailable_dates']

    return table_data


def run_query(connection, query):
    return pd.read_sql(query, connection)

def get_db_data(query):
    server = 'beclu4'
    database = 'Vacation_Stats'
    connection = pyodbc.connect(
        f'DRIVER={{SQL Server}};'
        f'SERVER={server};'
        f'DATABASE={database};'
        'Trusted_Connection=yes;'
    )

    table_data = run_query(connection, query)
    return table_data

def send_to_electron(table_data):
    print(table_data.to_json(orient='records'))

def get_query(json_message):
    action = json_message['action']
    data = json_message['data']
    db_query = ''

    if action == 'stats':
        db_query = 'exec beclu4.Vacation_Stats.dbo.usp_vacation_booking_site_stats'

    elif action == 'subs':
        db_query = """SELECT * FROM beclu4.Vacation_Stats.dbo.V_vacations_subscription_line_stats
                      WHERE
                      ("""

        for index, booking_site in enumerate(data):
            if index > 0:
                db_query += 'OR '

            db_query += f"""(booking_site_id = {booking_site["bs_id"]}
                            AND collection_type = '{booking_site["type"]}')
                        """

        db_query += ')'

    elif action == 'tx':
        db_query = """
            SELECT * FROM beclu4.[Vacation_Stats].[dbo].T_Vacations_tx_Stats 
            WHERE max_scheduler_active_queue_id = scheduler_active_queue_id
            AND ("""

        for index, subline in enumerate(data):
            if index > 0:
                db_query += 'OR '

            db_query += f"""(run_date_utc = '{subline["run_date_utc"]}'
                            AND subscription_line_id = {subline["subscription_line_id"]})
                        """
        
        db_query += ')'

    elif action == 'hotels':
        
        db_query = f"""
DECLARE @hotel_group_id int = {data[0]["hotel_group_id"]}
DECLARE @booking_site_id int = {data[0]["booking_site_id"]}
DECLARE @collection_type VARCHAR(3) = '{data[0]["collection_type"]}'

SELECT mappedData.booking_site_id, hotelGroupAndData.hotel_group_id,
hotelGroupAndData.infare_hotel_id,
mappedData.SupplierId, mappedData.SupplierHotelId,
hotelGroupAndData.InfareNameKey,
mappedData.dateMapped, mappedData.UserUpdatedMapping,
hotelGroupAndData.Name, hotelGroupAndData.ChainName, 
hotelGroupAndData.AssociatedLocationCode, hotelGroupAndData.LocationTypeCode,
hotelGroupAndData.Address, hotelGroupAndData.Street1,
hotelGroupAndData.Street2,
hotelGroupAndData.City, hotelGroupAndData.Region, hotelGroupAndData.Postcode,
hotelGroupAndData.Country, hotelGroupAndData.Latitude,
hotelGroupAndData.Longitude,
hotelGroupAndData.StarRating, hotelGroupAndData.DataSupplier

FROM
	(SELECT hotel_group.hotel_group_id, hotel_group.infare_hotel_id,
	hotel_data.InfareNameKey, hotel_data.Name, hotel_data.ChainName, 
	hotel_data.AssociatedLocationCode, hotel_data.LocationTypeCode,
	hotel_data.Address, hotel_data.Street1, hotel_data.Street2,
	hotel_data.City, hotel_data.Region, hotel_data.Postcode,
	hotel_data.Country, hotel_data.Latitude, hotel_data.Longitude,
	hotel_data.StarRating, hotel_data.DataSupplier
		FROM vacation.dbo.t_specified_hotels AS hotel_group
		INNER JOIN vacation.dbo.hotelMasterData AS hotel_data
		ON hotel_group.infare_hotel_id = hotel_data.InfareHotelId
		WHERE hotel_group.hotel_group_id = @hotel_group_id)
		AS hotelGroupAndData
LEFT JOIN 
	(SELECT suppliers.booking_site_id, mapping.InfareHotelId,
	mapping.SupplierId,	mapping.SupplierHotelId,
	mapping.DateLastUpdated AS dateMapped,
	mapping.UserLastUpdated AS UserUpdatedMapping
	FROM Vacation_Stats.dbo.t_hotel_suppliers AS suppliers
	INNER JOIN vacation.dbo.supplierHotelIdMapping AS mapping
	ON mapping.SupplierId = (CASE WHEN @collection_type = 'FH' THEN suppliers.fh
			   WHEN @collection_type = 'H' THEN suppliers.h END)
	WHERE suppliers.booking_site_id = @booking_site_id) AS mappedData

ON hotelGroupAndData.infare_hotel_id = mappedData.InfareHotelId
        """

    elif action == 'valid':
        search_criterias = " OR ".join(map(
            lambda row: f"search_criteria_rowid_array LIKE '%{row['subscription_line_id']}%'", data
        ))
        db_query = f"""
SELECT *
FROM [beclu4].[vacation_data_kafka].[dbo].[T_fare_observation_vac]
WHERE
	{search_criterias}

ORDER BY scheduler_active_queue_id, search_rank DESC
        """

    return db_query

def controller(test_json=None):
    json_message = get_message() if not test_json else json.loads(test_json)

    query = get_query(json_message)

    table_data = get_db_data(query)

    table_data = modify_table(table_data, mod_id=json_message['action'])

    send_to_electron(table_data)

test_json = '{"action":"stats","data":[]}'

controller()
