import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

class system:

    def __init__(self, packaging_size:float, TDP:float, specint:float, lifetime:int) -> None:
        self.packaging_size = packaging_size
        self.TDP = TDP
        self.specint = specint
        self.lifetime = lifetime
    
    def calculate_capex_emissions(self):

        ####### Source of the constants: https://ugupta.com/files/Gupta_ISCA2022_ACT.pdf

        MPA = 0.5           ### Procure materials | kg co2 per cm2
        EPA = 2.15          ### 0.8-3.5 | Fab Energy | kWh per cm2
        CI_fab = 0.365      ### 30-700  | g co2 per kWh  --> converted to kg co2 per kWh
        GPA = 0.3           ### 0.1-0.5 | Kg CO2 per cm2
        _yield = 0.875      ### 0-1  | Fab yield

        CAPEX = ((CI_fab * EPA + GPA + MPA) * self.packaging_size) / _yield #### Kg Co2

        return CAPEX
    
    def calculate_opex_emissions(self, utilization = 1):

        ######## Source of GCI: https://app.electricitymaps.com/zone/DE --> 2023 average for DE

        energy_consumption_per_year = (self.TDP * 24 * 7 * 52) * utilization    #### kWh per year
        GCI = 0.4                                                               #### kg co2 eq per kWh

        OPEX = energy_consumption_per_year * GCI ###### Kg co2 per year

        return OPEX 


    def generate_accumm_projected_opex_emissions(self, time_horizon:int, utilization=1):
        
        opex = self.calculate_opex_emissions(utilization)
        projected_emissions = [i*opex for i in range(1, time_horizon + 1)]

        return np.array(projected_emissions)


def generate_systems_comparison(new_system:system, old_system:system, time_horizon:int, utilization=1):

    new_system_opex = new_system.generate_accumm_projected_opex_emissions(time_horizon, utilization)
    new_system_capex = new_system.calculate_capex_emissions()
    old_system_opex = old_system.generate_accumm_projected_opex_emissions(time_horizon, utilization)

    performance_factor = old_system.specint / new_system.specint ##### --> Assumption: Better performance leads to lower utilization, hence less power draw.
    
    new_system_opex = new_system_opex * performance_factor
    new_system_opex[0] = new_system_opex[0] + new_system_capex  ###### --> Add the CAPEX at time 0

    abs_savings = new_system_opex - old_system_opex
    relative_savings = 1 - (old_system_opex / new_system_opex)
    ratio = new_system_opex / old_system_opex

    return new_system_opex, old_system_opex, abs_savings, relative_savings, ratio

###################################################################################################
######################################### PLOT ####################################################
###################################################################################################

def create_projections_plot(system_a_projected_emissions, system_b_projected_emissions, ratio):

    plt.rcParams.update({'text.usetex' : True
                    , 'pgf.rcfonts': False
                    , 'text.latex.preamble':r"""\usepackage{iftex}
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

    ax1.bar(time_horizon_array - bar_width/2, system_a_projected_emissions, color='#abd9e9', label='Alternative HW', width=bar_width)
    ax1.bar(time_horizon_array + bar_width/2, system_b_projected_emissions,  color='#fdae61', label='Current HW', width=bar_width)
    ax2.plot(time_horizon_array, ratio, linestyle='-', color='#d01c8b', label='Ratio', marker='^')
    ax2.set_ylabel('Ratio', color='#d01c8b', fontsize=20)
    ax2.tick_params(axis='y', colors='#d01c8b')

    line = ax2.lines[0]
    for x_value, y_value in zip(line.get_xdata(), line.get_ydata()):
        label = "{:.2f}".format(y_value)
        ax2.annotate(label,(x_value, y_value), xytext=(0, 5), 
            textcoords="offset points", ha='center', va='bottom', color='#d01c8b', fontsize=20) 
    ax2.axhline(1, color='#d01c8b', linestyle='dashed')
    ax2.annotate('Break-even',(0.6, 1), xytext=(0, 5), 
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
time_horizon = 6
new_chip = 'Xeon Processor E5-2699 v4'
old_chip = 'Xeon Processor E5-2699 v3'
intel_cpus_df = pd.read_csv('./intel_cpus_filtered-extended.csv')
subset = intel_cpus_df.loc[intel_cpus_df['name'].isin([new_chip, old_chip]), ['name', 'TDP', 'package-area-cm2']]

###### New Chip

new_packaging_size = subset.loc[intel_cpus_df['name'] == new_chip, 'package-area-cm2'].values[0]
new_TDP = subset.loc[intel_cpus_df['name'] == new_chip, 'TDP'].values[0]
###### Old Chip

old_packaging_size = subset.loc[intel_cpus_df['name'] == old_chip, 'package-area-cm2'].values[0]
old_TDP = subset.loc[intel_cpus_df['name'] == old_chip, 'TDP'].values[0]


new_system = system(packaging_size=new_packaging_size, TDP=new_TDP, specint=100, lifetime=5) ##### New Hardware
old_system = system(packaging_size=old_packaging_size, TDP=old_TDP, specint=50, lifetime=5) ##### Old Hardware

###################################################################################################
######################################### SYSTEMS OUTPUT ##########################################
###################################################################################################


new_system_opex, old_system_opex, abs_savings, relative_savings, ratio = generate_systems_comparison(new_system=new_system, old_system=old_system, time_horizon=time_horizon)

# fig = create_projections_plot(new_system_opex, old_system_opex, ratio)

create_projections_plot(new_system_opex, old_system_opex, ratio)

# fig.savefig('./plots/brek_even_analysis.pdf', format='pdf' , bbox_inches="tight", transparent=True)
        


