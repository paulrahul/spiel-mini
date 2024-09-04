import json
import traceback

import gspread

DUMP_FILE_PATH = "_dump.txt"

def fetch_from_gsheet():
    try:
        print(f"Reading Google Spreadsheet file")
        
        # Authenticate with Google Sheets API
        gc = gspread.oauth()

        # Open the spreadsheet by title
        spreadsheet = gc.open('Vokabeln und Phrasen')

        # Select the worksheet by title
        worksheet = spreadsheet.worksheet('Vokabeln')

        # Get all values from the worksheet
        return worksheet.get_all_records()

    except Exception as e:
        # Catch any exception and print its contents
        print(f"Fetching Google sheet failed")
        traceback.print_exc()
        return None

def create_data_file():
    rows = fetch_from_gsheet()

    if rows is None:
        print("No rows found in spreadsheet")
    else:
        data = "const data = "
        formatted_data = json.dumps(rows, indent=4)
        data += formatted_data + ";"
        
        # Write the updated list back to the file
        with open(DUMP_FILE_PATH, 'w') as file:
            file.write(data)
            
if __name__ == "__main__":
    create_data_file()
