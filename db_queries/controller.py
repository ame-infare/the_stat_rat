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
    print(table_data.to_json(orient="records"))

def get_query(json_message):
    action = json_message["action"]

    if action == 'stats':
        return 'exec beclu4.Vacation_Stats.dbo.usp_vacation_booking_site_stats'
    elif action == 'sublines':
        subline_data = json_message['data']
        return ('SELECT * FROM beclu4.Vacation_Stats.dbo.V_vacations_subscription_line_stats\n'
                 f'WHERE booking_site_id = {subline_data["bs_id"]}\n'
                 f'AND collection_type = \'{subline_data["type"]}\''
                 'AND relevant > 0')

def controller():
    json_message = get_message()

    query = get_query(json_message)

    table_data = get_db_data(query)

    send_to_electron(table_data)

controller()
