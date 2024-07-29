import json
import os.path

import pandas as pd

DL325_g_10 = 'dl325g10'
DL325_g_11 = 'dl325g11'


def read_xls_file(file_path):
    try:
        df = pd.read_excel(file_path, engine='xlrd')

        print("DataFrame loaded successfully. Here are the first few rows:")

        # Return the DataFrame for further processing if needed
        return df
    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
    except ValueError:
        print("Error: The file is not a valid .xls file or could not be read.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


def get_field(df, field_name):
    print(field_name)
    return df.loc[df['Unnamed: 0'] == field_name, 'Unnamed: 1'].values[0]


def extract_values(df):
    line_voltage = get_field(df, 'Line Voltage')
    total_max_load_input_power = get_field(df, 'Total Max Load Input Power')
    total_idle_input_power = get_field(df, 'Total Idle Input Power')
    power_hardware_and_cooling = get_field(df, 'Total Utilization Input Power')
    utilization_input_power_total = get_field(df, 'Utilization Input Power total ')
    total_utilization_carbon_emissions = get_field(df, 'Total Utilization Carbon Emissions')
    total_wattage_estimate = get_field(df, 'Total Wattage Estimate (Hardware + Cooling)')
    cooling_watts = get_field(df, 'Number of cooling watts required for each watt generated  ')
    utilization = get_field(df, 'Utilization (%)')
    server_lifecycle = get_field(df, 'Server Lifecycle')

    result = {
        'line_voltage': float(line_voltage.replace("VAC", "")),
        'total_max_load_input_power': float(total_max_load_input_power.replace("W", "")),
        'total_idle_input_power': float(total_idle_input_power.replace("W", "")),
        'power_hardware_and_cooling': float(power_hardware_and_cooling.replace("W", "")),
        'total_utilization_carbon_emissions': float(total_utilization_carbon_emissions.replace("kg CO2e", "")),
        'total_wattage_estimate_hardware_and_cooling': float(total_wattage_estimate),
        'cooling_watts': float(cooling_watts),
        'utilization': float(utilization),
        'server_lifecycle': float(server_lifecycle),
        'power_hardware': float(utilization_input_power_total)
    }

    return result


def parse_list_of_files(root_path, list_of_files):
    result = {}
    for file in list_of_files:
        file_path = os.path.join(root_path, file)
        df = read_xls_file(file_path)
        result[file] = extract_values(df)

    return result


def list_files(directory):
    # Get a list of all files and directories in the specified directory
    all_files = os.listdir(directory)

    # Filter out only the files
    files = [f for f in all_files if os.path.isfile(os.path.join(directory, f))]

    return files


if __name__ == '__main__':
    input_data_path = './raw_data_no_image/'
    parsed_data_dir = './parsed_data'
    types = [DL325_g_10, DL325_g_11]

    additional_fields = {
        DL325_g_10: {"example1": "42"},
        DL325_g_11: {"example1": "42"},
    }

    for _type in types:
        root_path = os.path.join(input_data_path, _type)
        list_of_files = list_files(root_path)
        parsed_data = parse_list_of_files(root_path, list_of_files)

        for k, v in additional_fields[_type].items():
            parsed_data[k] = v

        print(parsed_data)
        output_file_path = os.path.join(parsed_data_dir, f'{_type}.json')
        with open(output_file_path, 'w') as file:
            json.dump(parsed_data, file)
