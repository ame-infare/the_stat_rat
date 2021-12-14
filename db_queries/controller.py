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

    if action == 'stats':
        return 'exec beclu4.Vacation_Stats.dbo.usp_vacation_booking_site_stats'

    elif action == 'subs':
        subline_data = json_message['data']

        db_query = """SELECT * FROM beclu4.Vacation_Stats.dbo.V_vacations_subscription_line_stats
                      WHERE relevant > 0
                      AND ("""

        for index, booking_site in enumerate(subline_data):
            if index > 0:
                db_query += 'OR '

            db_query += f"""(booking_site_id = {booking_site["bs_id"]}
                            AND collection_type = '{booking_site["type"]}')
                        """

        db_query += ')'

        return db_query

    elif action == 'tx':
        subline_data = json_message['data']
        db_query = """
            SELECT * FROM beclu4.[Vacation_Stats].[dbo].T_Vacations_tx_Stats 
            WHERE max_scheduler_active_queue_id = scheduler_active_queue_id
            AND ("""

        for index, subline in enumerate(subline_data):
            if index > 0:
                db_query += 'OR '

            db_query += f"""(run_date_utc = '{subline["run_date_utc"]}'
                            AND subscription_line_id = {subline["subscription_line_id"]})
                        """
        
        db_query += ')'

        return db_query

def controller(test_json=None):
    json_message = get_message() if not test_json else json.loads(test_json)

    query = get_query(json_message)

    table_data = get_db_data(query)

    send_to_electron(table_data)

test_json = '{"action":"sublines","data":[{"prio":"3","booking_site":"Virgin Atlantic Vacations","bs_id":2239,"type":"C","code":"VS","filter_id":10176399,"subs":5,"d_err":0,"sub_mis":0,"%miss":0,"valid":2862,"%inv":0,"tx_inv":0,"%tx_inv":0,"%tx_miss":0,"%tx_limit":0,"issue_date":null,"affected_profiles":"BA_C","key":"2239C"},{"prio":"3","booking_site":"Virgin Holidays Vacations","bs_id":2240,"type":"FC","code":"VS","filter_id":10176400,"subs":13,"d_err":0,"sub_mis":0,"%miss":0,"valid":9452,"%inv":0,"tx_inv":0,"%tx_inv":0,"%tx_miss":14,"%tx_limit":2,"issue_date":null,"affected_profiles":"BA_FC,VS_FC","key":"2240FC"}]}'

controller()
