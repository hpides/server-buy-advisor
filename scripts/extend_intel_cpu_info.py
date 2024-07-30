import math
import os.path

import pandas as pd


def _compute_area(size_str):
    if not isinstance(size_str, str) and math.isnan(size_str):
        return ""

    print(size_str)
    size_str = size_str.strip("[]").replace("mm", "").replace("'", "")
    if 'x' in size_str:
        dimensions = size_str.split('x')
    elif ',' in size_str:
        dimensions = size_str.split(', ')
    else:
        raise NotImplementedError

    width = float(dimensions[0])
    height = float(dimensions[1])

    # Compute the area in mm^2 and convert to cm^2
    area_cm2 = (width * height) / 100.0
    return area_cm2


def add_package_size_cm2(csv_path):
    data = pd.read_csv(csv_path)
    base_path = directory = os.path.dirname(csv_path)
    file_name_without_extension = os.path.splitext(os.path.basename(csv_path))[0]

    # Apply the function to compute the area for each row
    data['package-area-cm2'] = data['Package Size'].apply(_compute_area)

    # Save the updated DataFrame to a new CSV file
    output_path = os.path.join(base_path, f'{file_name_without_extension}-extended.csv')
    data.to_csv(output_path, index=False)


if __name__ == '__main__':
    csv_file = '../intel_cpus_filtered.csv'
    add_package_size_cm2(csv_file)
