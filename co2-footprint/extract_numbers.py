import os.path

import pandas as pd


def read_xls_file(file_path):
    try:
        # Read the .xls file
        df = pd.read_excel(file_path, engine='xlrd')

        # Display the first few rows of the DataFrame
        print("DataFrame loaded successfully. Here are the first few rows:")
        # print(df.head())

        # Return the DataFrame for further processing if needed
        return df
    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
    except ValueError:
        print("Error: The file is not a valid .xls file or could not be read.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


def get_field(df, field_name):
    return df.loc[df['Unnamed: 0'] == field_name, 'Unnamed: 1'].values[0]


def extract_values(df):
    line_voltage = get_field(df, 'Line Voltage')
    total_max_load_input_power = get_field(df, 'Total Max Load Input Power')
    total_idle_input_power = get_field(df, 'Total Idle Input Power')
    total_utilization_input_power = get_field(df, 'Total Utilization Input Power')
    total_utilization_carbon_emissions = get_field(df, 'Total Utilization Carbon Emissions')
    total_wattage_estimate = get_field(df, 'Total Wattage Estimate (Hardware + Cooling)')
    cooling_watts = get_field(df, 'Number of cooling watts required for each watt generated  ')

    result = {
        'line_voltage': float(line_voltage.replace("VAC", "")),
        'total_max_load_input_power': float(total_max_load_input_power.replace("W", "")),
        'total_idle_input_power': float(total_idle_input_power.replace("W", "")),
        'total_utilization_input_power': float(total_utilization_input_power.replace("W", "")),
        'total_utilization_carbon_emissions': float(total_utilization_carbon_emissions.replace("t CO2e", "")),
        'total_wattage_estimate': float(total_wattage_estimate),
        'cooling_watts': float(cooling_watts)
    }

    return result


def parse_list_of_files(root_path, list_of_files):
    result = {}
    for file in list_of_files:
        file_path = os.path.join(root_path, file)
        df = read_xls_file(file_path)
        result[file] = extract_values(df)

    return result


if __name__ == '__main__':
    # NOTE: to parse the files, we currently have to open them once in excel and delete the image, then save again as xls file
    root_path = '/Users/nils/Downloads/'
    list_of_files = ['test.xls']

    parsed_data = parse_list_of_files(root_path, list_of_files)

    print(parsed_data)

