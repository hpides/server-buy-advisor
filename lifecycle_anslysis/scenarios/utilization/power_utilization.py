import os.path

import numpy as np
from matplotlib import pyplot as plt
from matplotlib.axes import Axes

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

def create_utilization_plots(intercept:float, ax:Axes, color):

    def generate_normalized_power_usage(intercept):

        #### Source: https://ieeexplore.ieee.org/document/4404806/?arnumber=4404806&tag=1
        ### See Fig 2
        power_slope = (100 - intercept) / (100 - 0)
        utilization_range = list(range(0, 110, 25))

        return [(intercept + utilization * power_slope) for utilization in utilization_range]
    
    npc = generate_normalized_power_usage(intercept)
    utilization_range = list(range(0, 110, 25))

    ax.plot(utilization_range, npc, color=color, label=f'$\\textsf{{P}}_0$: {intercept}', linewidth=1.5)

# Define the capped exponential growth function
def capped_exponential(x, L, a, k):
    return L - (L - a) * np.exp(-k * x)

fig, ax = plt.subplots(figsize=(2, 1))

intercept_range = [i for i in range(0, 110, 25)]
colors = ['#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']

for id, intercept in enumerate(intercept_range):
    color = colors[id]
    create_utilization_plots(intercept, ax, color)

save_root_path = "lifecycle_anslysis/scenarios/utilization/plots/"
os.makedirs(save_root_path, exist_ok=True)
# save_path = os.path.join(save_root_path, f"utilization_power_usage")

# ax.set_title('A) Linear Model', fontsize = 25)
ax.set_xlabel('Utilization [\%]', fontsize = 10)
ax.set_ylabel('NPC [\%]', fontsize = 10)
# Place legend outside the Axes on the right
ax.legend(loc='upper right', bbox_to_anchor=(1.7, 1.175), fontsize=10, frameon=True)
ax.tick_params(axis='x', labelsize=10)  # Set x-axis tick label size
ax.tick_params(axis='y', labelsize=10)  # Set y-axis tick label size
fig.savefig(os.path.join(os.path.dirname(save_root_path), "utilization_power.png"), bbox_inches="tight")
fig.savefig(os.path.join(os.path.dirname(save_root_path), "utilization_power.svg"), bbox_inches="tight")

# # Set parameters
# L = 100      # Cap (upper bound)
# a = 50       # Initial value
# k_values = np.arange(0.03, 1, round((1-0.045)/4, 2))  # Different values of k
# colors = ['#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']

# # Generate x values
# x = np.linspace(0, 110, 25)

# # Plot the curves for different k values
# # plt.figure(figsize=(10, 6))
# for idk, k in enumerate(k_values):
#     y = capped_exponential(x, L, a, k)
#     ax[1].plot(x, y, label=f'$\\textsf{{k}}= {round(k, 2)}$', color=colors[idk], linewidth=3)

# # Customize the plot
# ax[1].set_title('B) Exponential Growth Model', fontsize = 25)
# ax[1].set_xlabel('Utilization [\%]', fontsize = 25)
# # ax[1].set_ylabel('Normalized Power Usage [\%]', fontsize = 20)
# ax[1].legend(fontsize = 19)
# ax[0].set_xlim(-1,105)
# ax[1].set_xlim(-1,105)
# ax[0].set_ylim(-1,105)
# ax[1].set_ylim(-1,105)
# ax[0].tick_params(axis='x', labelsize=25)  # Set x-axis tick label size
# ax[0].tick_params(axis='y', labelsize=25)  # Set y-axis tick label size
# ax[1].tick_params(axis='x', labelsize=25)  # Set x-axis tick label size
# ax[1].tick_params(axis='y', labelsize=25)  # Set y-axis tick label size
# plt.tight_layout()
# # plt.grid(True)
# plt.savefig(os.path.join(os.path.dirname(save_root_path), "power_models.png"), bbox_inches="tight")
# plt.savefig(os.path.join(os.path.dirname(save_root_path), "power_models.svg"), bbox_inches="tight")