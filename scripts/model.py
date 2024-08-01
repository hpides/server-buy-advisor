import os.path

import matplotlib.pyplot as plt
import numpy as np

SORTING = "sorting"

SPECINT = "specint"

SWEDEN = "sweden"
GERMANY = "germany"
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


class System:

    def __init__(self, die_size: float, performance_indicator: float, lifetime: int, dram_capacity: int,
                 ssd_capacity: int, hdd_capacity: int, cpu_tdp: int) -> None:
        """
        :param die_size: in cm^2
        :param performance_indicator:
        :param lifetime: in years
        :param dram_capacity: in GB
        :param ssd_capacity: in GB
        :param hdd_capacity: in GB
        :param cpu_tdp: in Watt
        """
        self.packaging_size = die_size
        self.specint = performance_indicator
        self.lifetime = lifetime
        self.dram_capacity = dram_capacity
        self.ssd_capacity = ssd_capacity
        self.hdd_capacity = hdd_capacity
        self.cpu_tdp = cpu_tdp

    def calculate_capex_emissions(self):
        ####### Source of the constants: https://ugupta.com/files/Gupta_ISCA2022_ACT.pdf

        MPA = 0.5  ### Procure materials | kg co2 per cm2
        EPA = 2.15  ### 0.8-3.5 | Fab Energy | kWh per cm2
        CI_fab = 0.365  ### 30-700  | g co2 per kWh  --> converted to kg co2 per kWh
        GPA = 0.3  ### 0.1-0.5 | Kg CO2 per cm2
        _yield = 0.875  ### 0-1  | Fab yield
        E_DRAM = 0.3  ### 0 - 0.6 | Kg CO2/GB
        E_SDD = 0.015  ### 0 - 0.03 | Kg CO2/GB
        E_HDD = 0.06  ### 0 - 0.12 | Kg CO2/GB

        # Note assume package size == die size
        capex_cpu = ((CI_fab * EPA + GPA + MPA) * self.packaging_size) / _yield  #### Kg Co2
        capex_dram = self.dram_capacity * E_DRAM  #### Kg Co2
        capex_ssd = self.ssd_capacity * E_SDD  #### Kg Co2
        capex_hdd = self.hdd_capacity * E_HDD  #### Kg Co2

        capex_total = capex_cpu + capex_dram + capex_ssd + capex_hdd  #### Kg Co2

        return capex_total

    def generate_accumm_projected_opex_emissions(self, time_horizon: int, system_id: str, country: str,
                                                 utilization: float, lookup: bool):
        if lookup:
            opex_per_year = OPEX_PER_YEAR[country][utilization][system_id]
        else:
            opex_per_year = self.calculate_opex_emissions(utilization, country)
        projected_emissions = [i * opex_per_year for i in range(1, time_horizon + 1)]

        return np.array(projected_emissions)

    def calculate_opex_emissions(self, utilization: float, country: str):
        ######## Source of GCI: https://app.electricitymaps.com/zone/DE --> 2023 average for DE

        cpu_energy_consumption = (self.cpu_tdp * (utilization / 100)) / 1000  #### kW
        dram_energy_consumption = (self.dram_capacity / 256 * DRAM_WATTS_PER_256GB) / 1000  #### kW

        # Watts according to https://www.ssstc.com/knowledge-detail/ssd-vs-hdd-power-efficiency/#:~:text=On%20average%2C%20SSDs%20consume%20around,may%20consume%203%2D4%20watts.
        ssd_energy_consumption = (3 if (self.ssd_capacity > 0) else 0) / 1000  ###kW
        hdd_energy_consumption = (7 if (self.hdd_capacity > 0) else 0) / 1000  ###kW

        total_watts = cpu_energy_consumption + dram_energy_consumption + ssd_energy_consumption + hdd_energy_consumption
        total_watts_per_year = 24 * 7 * 52 * total_watts  ### kWh
        GCI = GCI_CONSTANTS[country]

        OPEX = total_watts_per_year * GCI  ###### Kg co2 per year

        return OPEX


def generate_systems_comparison(new_system: System, old_system: System, time_horizon: int, country: str,
                                utilization: int, performance_measure: str):
    if performance_measure == SPECINT:
        lookup = True
    elif performance_measure == SORTING:
        lookup = False
    else:
        raise NotImplementedError

    new_system_opex = new_system.generate_accumm_projected_opex_emissions(
        time_horizon, system_id=NEW_SYSTEM, country=country, utilization=utilization, lookup=lookup)
    new_system_capex = new_system.calculate_capex_emissions()
    old_system_opex = old_system.generate_accumm_projected_opex_emissions(
        time_horizon, system_id=OLD_SYSTEM, country=country, utilization=utilization, lookup=lookup)

    performance_factor = old_system.specint / new_system.specint  ##### --> Assumption: Better performance leads to lower utilization, hence less power draw.

    new_system_opex = new_system_opex * performance_factor

    # new_system_opex[0] = new_system_opex[0] + new_system_capex  ###### --> Add the CAPEX at time 0
    new_system_opex = np.array([opex + new_system_capex for opex in new_system_opex])

    abs_savings = new_system_opex - old_system_opex
    relative_savings = 1 - (old_system_opex / new_system_opex)
    ratio = new_system_opex / old_system_opex

    return new_system_opex, old_system_opex, abs_savings, relative_savings, ratio


###################################################################################################
######################################### PLOT ####################################################
###################################################################################################

def create_projections_plot(system_a_projected_emissions, system_b_projected_emissions, ratio, save_path):
    plt.rcParams.update({'text.usetex': True
                            , 'pgf.rcfonts': False
                            , 'text.latex.preamble': r"""\usepackage{iftex}
                                            \ifxetex
                                                \usepackage[libertine]{newtxmath}
                                                \usepackage[tt=false]{libertine}
                                                \setmonofont[StylisticSet=3]{inconsolata}
                                            \else
                                                \RequirePackage[tt=false, type1=true]{libertine}
                                            \fi"""
                         })

    bar_width = 0.25
    font_size = 26
    fig, ax1 = plt.subplots(figsize=(10, 6))
    ax2 = ax1.twinx()
    time_horizon_array = np.arange(1, system_a_projected_emissions.shape[0] + 1)

    ax1.bar(time_horizon_array - bar_width / 2, system_b_projected_emissions, color='#fdae61', label='Current HW',
            width=bar_width)

    ax1.bar(time_horizon_array + bar_width / 2, system_a_projected_emissions, color='#abd9e9', label='New HW',
            width=bar_width)

    ax2.plot(time_horizon_array, ratio, linestyle='-', color='#d01c8b', label='Ratio', marker='^')
    ax2.set_ylabel('Ratio', color='#d01c8b', fontsize=font_size)
    ax2.tick_params(axis='y', colors='#d01c8b')

    line = ax2.lines[0]
    for x_value, y_value in zip(line.get_xdata(), line.get_ydata()):
        label = "{:.2f}".format(y_value)
        ax2.annotate(label, (x_value, y_value), xytext=(0, 5),
                     textcoords="offset points", ha='center', va='bottom', color='#d01c8b', fontsize=20)
    ax2.axhline(1, color='#d01c8b', linestyle='dashed')
    ax2.annotate('Break-even', (0.6, 1), xytext=(0, 5),
                 textcoords="offset points", ha='center', va='bottom', color='#d01c8b', fontsize=20)

    ax1.legend(loc='upper center', ncols=2, fontsize=font_size, frameon=False)
    ax1.set_ylabel('Accumulated CO2 Kg.', fontsize=font_size)
    ax1.set_xlabel('Year', fontsize=font_size)
    ax1.set_xticks(time_horizon_array)
    ax1.tick_params(axis='x', labelsize=font_size)
    ax1.tick_params(axis='y', labelsize=font_size)
    ax2.tick_params(axis='y', labelsize=font_size)
    ax2.set_ylim(bottom=0)
    ax2.set_ylim(top=np.max(ratio) + np.std(ratio))

    ax1.set_title('Projected CO2 Emissions', fontsize=font_size)

    plt.tight_layout()
    plt.savefig(f"{save_path}.png")
    plt.savefig(f"{save_path}.svg")

    plt.show()


###################################################################################################
######################################### PARAMETERS ##############################################
###################################################################################################
time_horizon = 10
new_chip = 'Xeon Processor E5-2699 v4'
old_chip = 'Xeon Processor E5-2699 v3'

##### New Hardware
# Die size from: https://www.techpowerup.com/cpu-specs/epyc-9334.c2922
# 4 * 72 mm^2


###################################################################################################
######################################### SYSTEMS OUTPUT ##########################################
###################################################################################################

###################################################################################################
#### SPECINT
###################################################################################################

new_die_size = 4 * 72 / 100  # cm^2
new_system = System(
    die_size=new_die_size,
    performance_indicator=470.4,
    # according to https://www.spec.org/cpu2006/results/ and https://www.spec.org/cpu2017/results/
    lifetime=10,
    dram_capacity=8 * 64,
    ssd_capacity=2 * 1600,
    hdd_capacity=0,
    cpu_tdp=210
)

##### Old Hardware
# Die size from: https://www.techpowerup.com/cpu-specs/epyc-7502p.c2260
# 74 mm^2
old_die_size = 74 / 100  # cm^2
old_system = System(
    die_size=old_die_size,
    performance_indicator=285.44,
    # according to https://www.spec.org/cpu2006/results/ and https://www.spec.org/cpu2017/results/
    lifetime=10,
    dram_capacity=8 * 64,
    ssd_capacity=2 * 1600,
    hdd_capacity=0,
    cpu_tdp=180
)

for country in [GERMANY, SWEDEN]:
    for utilization in [30, 60, 90]:
        save_root_path = "./model_plots"
        save_path = os.path.join(save_root_path, f"country-{country}-utilization-{utilization}-workload-specint")

        new_system_opex, old_system_opex, abs_savings, relative_savings, ratio = \
            generate_systems_comparison(
                new_system=new_system,
                old_system=old_system,
                time_horizon=time_horizon,
                country=country,
                utilization=utilization,
                performance_measure=SPECINT)
        create_projections_plot(new_system_opex, old_system_opex, ratio, save_path)

###################################################################################################
#### SORTING
###################################################################################################

new_die_size = 660 / 100  # cm^2
new_system = System(
    die_size=new_die_size,
    performance_indicator=2.5,
    lifetime=10,
    dram_capacity=8 * 64,
    ssd_capacity=2 * 1600,
    hdd_capacity=0,
    cpu_tdp=205
)

##### Old Hardware
old_die_size = 541 / 100  # cm^2
old_system = System(
    die_size=old_die_size,
    performance_indicator=1,
    # according to https://www.spec.org/cpu2006/results/ and https://www.spec.org/cpu2017/results/
    lifetime=10,
    dram_capacity=8 * 64,
    ssd_capacity=2 * 1600,
    hdd_capacity=0,
    cpu_tdp=130
)

for country in [GERMANY, SWEDEN]:
    for utilization in [30, 60, 90]:
        save_root_path = "./model_plots"
        save_path = os.path.join(save_root_path, f"country-{country}-utilization-{utilization}-workload-sorting")

        new_system_opex, old_system_opex, abs_savings, relative_savings, ratio = \
            generate_systems_comparison(
                new_system=new_system,
                old_system=old_system,
                time_horizon=time_horizon,
                country=country,
                utilization=utilization,
                performance_measure=SORTING)
        create_projections_plot(new_system_opex, old_system_opex, ratio, save_path)
