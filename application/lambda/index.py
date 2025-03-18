from bs4 import BeautifulSoup
import requests
import boto3
import os
URL = os.getenv('URL')
TABLE_NAME = os.getenv('TABLE_NAME')
DESIRED_COUNTRY = os.getenv('DESIRED_COUNTRY')
DESIRED_STATUS = os.getenv('DESIRED_STATUS')
SNS_TOPIC = os.getenv('SNS_TOPIC')

def update_status(client, status):
    updated = client.update_item(
        Key={
            'status': status
        }
    )
    print("State table updated")
    return


def send_alert(country, status):
    client = boto3.client('sns')
    message = "{} country is with current status: {}".format(country, status)
    client.publish(TopicArn=SNS_TOPIC, Subject="[WORK HOLIDAY VISA] Updates", Message=message)
    print("SNS alert sent")


def check_last(table_client):
    response = table_client.scan()['Items']
    if response == []:
        return None
    else:
        return response[0]['status']


def action_status(table_client):
    html_doc = requests.get(URL).text
    soup = BeautifulSoup(html_doc, 'html.parser')
    for table_row in soup.find_all("tr"):
        try:
            country = table_row.td.string
            status = table_row.span.string

            if country == DESIRED_COUNTRY:
                if status == DESIRED_STATUS:
                    print("{} reached desired status: {}".format(country, status))
                    send_alert(country, status)
                    update_status(table_client, status)
                break
        except:
            continue

def handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(TABLE_NAME)
    last_status = check_last(table)
    print("Last status: {}".format(last_status))
    if last_status != DESIRED_STATUS:
        action_status(table)