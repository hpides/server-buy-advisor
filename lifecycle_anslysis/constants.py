# Workloads
SORTING = "sorting"
SPECINT = "specint"

# Countries
SWEDEN = "sweden"
GERMANY = "germany"

# Systems
OLD_SYSTEM = "old_system"
NEW_SYSTEM = "new_system"

# data from files in ./raw_data_no_image
OPEX_PER_YEAR = {
    GERMANY: {
        30: {  # utilization
            OLD_SYSTEM: 2312 / 4,  # kg C02e for 4 years of operation
            NEW_SYSTEM: 2047 / 4,  # kg C02e for 4 years of operation
        },
        60: {  # utilization
            OLD_SYSTEM: 3276 / 4,  # kg C02e for 4 years of operation
            NEW_SYSTEM: 3246 / 4,  # kg C02e for 4 years of operation
        },
        90: {  # utilization
            OLD_SYSTEM: 4249 / 4,  # kg C02e for 4 years of operation
            NEW_SYSTEM: 4459 / 4,  # kg C02e for 4 years of operation
        }

    },
    SWEDEN: {
        30: {  # utilization
            OLD_SYSTEM: 158 / 4,  # 158 kg C02e for 4 years of operation
            NEW_SYSTEM: 149 / 4,  # 149 kg C02e for 4 years of operation
        },
        60: {  # utilization
            OLD_SYSTEM: 227 / 4,  # kg C02e for 4 years of operation
            NEW_SYSTEM: 236 / 4,  # kg C02e for 4 years of operation
        },
        90: {  # utilization
            OLD_SYSTEM: 296 / 4,  # kg C02e for 4 years of operation
            NEW_SYSTEM: 324 / 4,  # kg C02e for 4 years of operation
        }
    }
}

# Electricity maps
GCI_CONSTANTS = {
    SWEDEN: 25 / 1000,
    GERMANY: 344 / 1000
}

# according to https://dl.acm.org/doi/fullHtml/10.1145/3466752.3480089#tab1
DRAM_WATTS_PER_256GB = 25.9

