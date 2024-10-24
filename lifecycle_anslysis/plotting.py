import numpy as np
from matplotlib import pyplot as plt


def create_projections_plot(system_a_projected_emissions, system_b_projected_emissions, ratio, save_path, step_size=1, fig_size=(10, 6)):
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

    bar_width = 0.25 * step_size
    font_size = 26
    fig, ax1 = plt.subplots(figsize=fig_size)
    ax2 = ax1.twinx()

    x_values = list(range(1, system_a_projected_emissions.shape[0] + 1, step_size))
    system_a_projected_emissions = [system_a_projected_emissions[i - 1] for i in x_values]
    system_b_projected_emissions = [system_b_projected_emissions[i - 1] for i in x_values]
    ratio = [ratio[i - 1] for i in x_values]

    time_horizon_array = np.array(x_values)

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
    ax1.set_ylabel('Accumulated CO$_2$ Kg.', fontsize=font_size)
    ax1.set_xlabel('Year', fontsize=font_size)
    ax1.set_xticks(time_horizon_array)
    ax1.tick_params(axis='x', labelsize=font_size)
    ax1.tick_params(axis='y', labelsize=font_size)
    ax2.tick_params(axis='y', labelsize=font_size)
    ax2.set_ylim(bottom=0)
    ax2.set_ylim(top=np.max(ratio) + np.std(ratio))

    ax1.set_title('Projected CO$_2$ Emissions', fontsize=font_size)

    plt.tight_layout()
    plt.savefig(f"{save_path}.png")
    plt.savefig(f"{save_path}.svg")

    plt.show()
