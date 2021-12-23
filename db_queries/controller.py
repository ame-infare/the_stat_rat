from sys import argv
import json
import pyodbc
import pandas as pd

def get_message():
    return json.loads(argv[1])

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
                      WHERE relevant > 0
                      AND ("""

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
            SELECT hmd.*, sh.hotel_group_id, shim.SupplierId, shim.SupplierHotelId
            FROM becluster.vacation.dbo.hotelMasterData hmd
            LEFT JOIN
                (SELECT * 
                FROM becluster.vacation.dbo.t_specified_hotels
                WHERE hotel_group_id = @hotel_group_id) sh 
                ON sh.infare_hotel_id = hmd.InfareHotelId
            LEFT JOIN
                (SELECT *
                FROM becluster.vacation.dbo.supplierHotelIdMapping) shim 
                ON shim.InfareHotelId = hmd.InfareHotelId
            WHERE sh.infare_hotel_id IS NOT null
            ORDER BY Name
        """

    return db_query

def controller(test_json=None):
    json_message = get_message() if not test_json else json.loads(test_json)

    query = get_query(json_message)

    table_data = get_db_data(query)

    send_to_electron(table_data)

test_json = '{"action":"hotels","data":[{"note_auto":null,"note_NB":null,"profile_id":"JJC_C4_H","booking_site_id":2182,"subscription_line_id":330968,"run_date_utc":"2021-12-08","resolve_type":1,"valid":0,"invalid_all":0,"invalid_real":0,"room_error":0,"hotel_error":0,"flight_error":0,"unmapped":0,"tx_invalid":0,"tx_with_data":0,"tx_generated":2,"tx_generated_next":2,"tx_resolved":2,"unavailable_dates":0,"destination_error":0,"fhm_errors":0,"invalid2":0,"run_date_utc_next":"2022-01-08","end_run_datetime_utc":1638961200000,"end_date_proj":"2027-06-22","hotels_recognized":0,"hotels_specified_proj":4,"destination_user_input_proj":"","primary_subscription_line_id_proj":null,"collection_type":"H","data_source_id":24,"pos":"CL","destination":"IPC","destination_type":1,"destination_user_input":"","adults":2,"children":0,"flight_origin":null,"flight_origin_type":null,"flight_searched_cabin":null,"flight_max_connections":null,"flight_carrier":null,"flight_arrival_requirement":null,"hotel_group_id":3380,"hotels_specified":4,"hotel_count_to_collect":null,"hotel_room_options":20,"hotel_board_basis":0,"hotel_rating_filter":"0-5","car_offers_per_vendor":null,"car_vendor":null,"car_sipp_code":null,"car_discount_code":null,"car_pickup_time":null,"car_dropoff_time":null,"car_dropoff_location":null,"car_dropoff_location_type":null,"wildcard":null,"search_range_days":"30, 45","search_range_anchor_date":null,"search_weekdays":127,"search_nights":4,"schedule_frequency_type":3,"schedule_frequency_interval":128,"schedule_frequency_interval_relative":null,"collection_schedule_id":267,"start_date":"2021-06-08","end_date":"2027-06-22","is_priority":false,"last_touched":1623077620510,"last_touched_by":"vaninna-ratti","note":null,"last_touched_NB":null,"last_touched_by_NB":null,"profileCity":"SCL","start_time":"00:00:00.0000000","allowed_runtime_minutes":480,"flight_included":false,"hotel_included":true,"car_included":false,"is_active_profile":true,"flight_matching":null,"hotel_matching":null,"primary_booking_site_id":null,"primary_subscription_line_id":null,"primary_run_date_utc":null,"primary_resolve_type":null,"primary_valid":null,"primary_invalid_all":null,"primary_room_error":null,"primary_hotel_error":null,"primary_flight_error":null,"primary_unmapped":null,"primary_tx_invalid":null,"primary_tx_with_data":null,"primary_tx_generated":null,"primary_tx_resolved":null,"primary_unavailable_dates":null,"primary_destination_error":null,"primary_fhm_errors":null,"primary_invalid2":null,"primary_end_run_datetime_utc":null,"primary_hotels_recognized":null,"primary_hotels_specified_proj":null,"primary_destination_user_input_proj":null,"primary_end_date_proj":null,"primary_data_source_id":null,"primary_destination_user_input":null,"primary_flight_searched_cabin":null,"primary_flight_max_connections":null,"primary_flight_carrier":null,"primary_flight_arrival_requirement":null,"primary_wildcard":null,"primary_collection_schedule_id":null,"primary_start_date":null,"primary_end_date":null,"primary_is_priority":null,"primary_last_touched":null,"primary_last_touched_by":null,"primary_note":null,"primary_last_touched_NB":null,"primary_last_touched_by_NB":null,"primary_note_NB":null,"primary_start_time":null,"primary_allowed_runtime_minutes":null,"primary_is_active_profile":null,"begin_run_datetime_utc_diff":null,"key":"2182H","min_begin_run_datetime_utc_diff":null,"relevant":1}]}'

controller()
