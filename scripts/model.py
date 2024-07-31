import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

OLD_SYSTEM = "old_system"
NEW_SYSTEM = "new_system"

OPEX_PER_YEAR_SWEDEN_30_PERCENT = {
    NEW_SYSTEM: 149 / 4,  # 158 kg C02e for 4 years of operation
    OLD_SYSTEM: 158 / 4  # 158 kg C02e for 4 years of operation
}

OPEX_PER_YEAR_GERMANY_30_PERCENT = {
    NEW_SYSTEM: 2154 / 4,  # 158 kg C02e for 4 years of operation
    OLD_SYSTEM: 2312 / 4  # 158 kg C02e for 4 years of operation
}

class System:

    def __init__(self, die_size: float, TDP: float, specint: float, lifetime: int, dram_capacity: int,
                 ssd_capacity: int, hdd_capacity: int) -> None:
        """
        :param die_size: in cm^2
        :param TDP: in Watts
        :param specint:
        :param lifetime: in years
        :param dram_capacity: in GB
        :param ssd_capacity: in GB
        :param hdd_capacity: in GB
        """
        self.packaging_size = die_size
        self.TDP = TDP
        self.specint = specint
        self.lifetime = lifetime
        self.dram_capacity = dram_capacity
        self.ssd_capacity = ssd_capacity
        self.hdd_capacity = hdd_capacity

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

    def generate_accumm_projected_opex_emissions(self, time_horizon: int, system_id: str):
        opex_per_year = OPEX_PER_YEAR_SWEDEN_30_PERCENT[system_id]
        projected_emissions = [i * opex_per_year for i in range(1, time_horizon + 1)]

        return np.array(projected_emissions)


def generate_systems_comparison(new_system: System, old_system: System, time_horizon: int, utilization=1):
    new_system_opex = new_system.generate_accumm_projected_opex_emissions(time_horizon, system_id=NEW_SYSTEM)
    new_system_capex = new_system.calculate_capex_emissions()
    old_system_opex = old_system.generate_accumm_projected_opex_emissions(time_horizon, system_id=NEW_SYSTEM)

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

def create_projections_plot(system_a_projected_emissions, system_b_projected_emissions, ratio):
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
    fig, ax1 = plt.subplots(figsize=(10, 6))
    ax2 = ax1.twinx()
    time_horizon_array = np.arange(system_a_projected_emissions.shape[0])

    ax1.bar(time_horizon_array - bar_width / 2, system_a_projected_emissions, color='#abd9e9', label='Alternative HW',
            width=bar_width)
    ax1.bar(time_horizon_array + bar_width / 2, system_b_projected_emissions, color='#fdae61', label='Current HW',
            width=bar_width)
    ax2.plot(time_horizon_array, ratio, linestyle='-', color='#d01c8b', label='Ratio', marker='^')
    ax2.set_ylabel('Ratio', color='#d01c8b', fontsize=20)
    ax2.tick_params(axis='y', colors='#d01c8b')

    line = ax2.lines[0]
    for x_value, y_value in zip(line.get_xdata(), line.get_ydata()):
        label = "{:.2f}".format(y_value)
        ax2.annotate(label, (x_value, y_value), xytext=(0, 5),
                     textcoords="offset points", ha='center', va='bottom', color='#d01c8b', fontsize=20)
    ax2.axhline(1, color='#d01c8b', linestyle='dashed')
    ax2.annotate('Break-even', (0.6, 1), xytext=(0, 5),
                 textcoords="offset points", ha='center', va='bottom', color='#d01c8b', fontsize=20)

    ax1.legend(loc='upper center', ncols=2, fontsize=20, frameon=False)
    ax1.set_ylabel('Accumulated CO2 Kg.', fontsize=20)
    ax1.set_xlabel('Year', fontsize=20)
    ax1.tick_params(axis='x', labelsize=20)
    ax1.tick_params(axis='y', labelsize=20)
    ax2.tick_params(axis='y', labelsize=20)
    ax2.set_ylim(top=np.max(ratio) + np.std(ratio))

    ax1.set_title('Projected CO2 Emissions', fontsize=20)

    plt.show()
    # return fig


###################################################################################################
######################################### PARAMETERS ##############################################
###################################################################################################
time_horizon = 10
new_chip = 'Xeon Processor E5-2699 v4'
old_chip = 'Xeon Processor E5-2699 v3'
intel_cpus_df = pd.read_csv('../intel_cpus_filtered-extended.csv')
subset = intel_cpus_df.loc[intel_cpus_df['name'].isin([new_chip, old_chip]), ['name', 'TDP', 'package-area-cm2']]

##### New Hardware
# Die size from: https://www.techpowerup.com/cpu-specs/epyc-9334.c2922
# 4 * 72 mm^2
new_die_size = 4 * 72 / 100  # cm^2
new_system = System(
    die_size=new_die_size,
    TDP=None,
    specint=2,
    lifetime=10,
    dram_capacity=8 * 64,
    ssd_capacity=2 * 1600,
    hdd_capacity=0
)

##### Old Hardware
# Die size from: https://www.techpowerup.com/cpu-specs/epyc-7502p.c2260
# 74 mm^2
old_die_size = 74 / 100  # cm^2
old_system = System(
    die_size=old_die_size,
    TDP=None,
    specint=1,
    lifetime=10,
    dram_capacity=8 * 64,
    ssd_capacity=2 * 1600,
    hdd_capacity=0
)

###################################################################################################
######################################### SYSTEMS OUTPUT ##########################################
###################################################################################################


new_system_opex, old_system_opex, abs_savings, relative_savings, ratio = generate_systems_comparison(
    new_system=new_system, old_system=old_system, time_horizon=time_horizon)

# fig = create_projections_plot(new_system_opex, old_system_opex, ratio)

create_projections_plot(new_system_opex, old_system_opex, ratio)

# fig.savefig('./plots/brek_even_analysis.pdf', format='pdf' , bbox_inches="tight", transparent=True)
