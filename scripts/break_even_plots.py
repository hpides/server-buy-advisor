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
######################################### PARAMETERS ##############################################
###################################################################################################
time_horizon = 6
system_a = system(capex=500, opex=10, lifetime=time_horizon) ##### New Hardware
system_b = system(capex=0, opex=100, lifetime=time_horizon) ##### Current Hardware
bar_width = 0.2
###################################################################################################
######################################### SYSTEMS INPUT ###########################################
###################################################################################################

system_a_projected_emissions = system_a.generate_accumm_projected_emissions(time_horizon)
system_b_projected_emissions = system_b.generate_accumm_projected_emissions(time_horizon)
time_horizon_array = np.arange(time_horizon)
abs_savings, relative_savings, ratio = generate_systems_comparison(system_a, system_b, time_horizon)

###################################################################################################
###################################################################################################
###################################################################################################

fig, ax1 = plt.subplots(figsize=(10, 6))
ax2 = ax1.twinx()

ax1.bar(time_horizon_array, system_a_projected_emissions, color='blue', label='New HW accumm. Co2 emisions', width=bar_width)
ax1.bar(time_horizon_array + bar_width, system_b_projected_emissions,  color='red', label='Current HW accumm. Co2 emisions', width=bar_width)
ax2.plot(time_horizon_array + bar_width, ratio, linestyle='-', color='green', label='Ratio')
ax2.set_ylabel('Ratio', color='green')
ax2.tick_params(axis='y', colors='green')

line = ax2.lines[0]
for x_value, y_value in zip(line.get_xdata(), line.get_ydata()):
    label = "{:.2f}".format(y_value)
    ax2.annotate(label,(x_value, y_value), xytext=(0, 5), 
        textcoords="offset points", ha='center', va='bottom', color='green') 


plt.show()

    
        


