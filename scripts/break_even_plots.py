import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

class system:

    def __init__(self, capex:float, opex:float, lifetime:int) -> None:
        self.capex = capex
        self.opex = opex
        self.lifetime = lifetime

    def generate_accumm_projected_emissions(self, time_horizon:int):

        projected_emissions = [self.capex + i*self.opex for i in range(1, time_horizon + 1)]

        return np.array(projected_emissions)


def generate_systems_comparison(system_a:system, system_b:system, time_horizon:int):

    system_a_emissions = system_a.generate_accumm_projected_emissions(time_horizon)
    system_b_emissions = system_b.generate_accumm_projected_emissions(time_horizon)

    abs_savings = system_a_emissions - system_b_emissions
    relative_savings = 1 - (system_b_emissions / system_a_emissions)
    ratio = system_a_emissions / system_b_emissions

    return abs_savings, relative_savings, ratio

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
    # ax1.yticks(fontsize=20)
    # ax1.xticks(fontsize=20)
    # ax2.yticks(fontsize=20)
    ax2.set_ylim(top=np.max(ratio) + np.std(ratio))

    ax1.set_title('Projected CO2 Emissions', fontsize=20)

    # plt.show()
    return fig

###################################################################################################
######################################### PARAMETERS ##############################################
###################################################################################################
time_horizon = 6
system_a = system(capex=500, opex=10, lifetime=time_horizon) ##### New Hardware
system_b = system(capex=0, opex=100, lifetime=time_horizon) ##### Current Hardware

###################################################################################################
######################################### SYSTEMS OUTPUT ##########################################
###################################################################################################

system_a_projected_emissions = system_a.generate_accumm_projected_emissions(time_horizon)
system_b_projected_emissions = system_b.generate_accumm_projected_emissions(time_horizon)

abs_savings, relative_savings, ratio = generate_systems_comparison(system_a, system_b, time_horizon)

fig = create_projections_plot(system_a_projected_emissions, system_b_projected_emissions, ratio)

fig.savefig('./plots/brek_even_analysis.pdf', format='pdf' , bbox_inches="tight", transparent=True)
        


