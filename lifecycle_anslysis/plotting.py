import os.path

import numpy as np
from matplotlib import pyplot as plt

# colors
BAR2 = "#abd9e9"
BAR1 = "#fdae61"
LINE = "#d7191c"
LINE2 = "#2c7bb6"


def create_projections_plot(system_a_projected_emissions, system_b_projected_emissions, ratio, save_path, step_size=1,
                            y_top_lim=None, fig_size=None, break_even_label_pos=15, separate_legend=False):
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

    if system_a_projected_emissions.shape[0] > 10 and step_size == 1:
        step_size += 1

    bar_width = 0.25 * step_size
    font_size = 26
    fig, ax1 = plt.subplots(figsize=(10, 6))
    # ax2 = ax1.twinx()

    x_values = list(range(1, system_a_projected_emissions.shape[0] + 1, step_size))
    system_a_projected_emissions = [system_a_projected_emissions[i - 1] / 1000 for i in
                                    x_values]  ### Divinding by 1000 to get thousands of kgs to be consistent with the units in the model
    system_b_projected_emissions = [system_b_projected_emissions[i - 1] / 1000 for i in
                                    x_values]  ### Divinding by 1000 to get thousands of kgs to be consistent with the units in the model
    

    # Fit lines (find slope and intercept) for both curves
    m1, b1 = np.polyfit(x_values, system_a_projected_emissions, 1)  # Line 1: y = m1*x + b1
    m2, b2 = np.polyfit(x_values, system_b_projected_emissions, 1)  # Line 2: y = m2*x + b2

    # Find the intersection point analytically
    # Intersection occurs when m1*x + b1 = m2*x + b2
    # Solve for x: x = (b2 - b1) / (m1 - m2)
    intersection_x = (b2 - b1) / (m1 - m2)
    intersection_y = m1 * intersection_x + b1  # Substitute into either line equation

    x_values.insert(0, 0)
    system_b_projected_emissions.insert(0, b2)
    system_a_projected_emissions.insert(0, b1)
    time_horizon_array = np.array(x_values)

    ratio = [ratio[i - 1] for i in x_values]

    # ax1.bar(time_horizon_array - bar_width / 2, system_b_projected_emissions, color=BAR2, label='Current HW',
    #         width=bar_width)

    # ax1.bar(time_horizon_array + bar_width / 2, system_a_projected_emissions, color=BAR1, label='New HW',
    #         width=bar_width)
    
    ax1.plot(time_horizon_array, system_b_projected_emissions, color=BAR2, label='Current HW', linewidth=4)

    ax1.plot(time_horizon_array, system_a_projected_emissions, color=BAR1, label='New HW', linewidth=4)

    # Mark the intersection
    # ax1.axvline(x=intersection_x, color=LINE, linestyle="dashed", alpha=0.7, label='Break-even')  # Vertical line
    ax1.scatter(intersection_x, intersection_y, color=LINE, zorder=5)  # Mark the point

    ax1.axhline(y=system_a_projected_emissions[0], color=LINE, linestyle="dashed", alpha=0.5)  # Horizonatal line

    ax1.annotate(
        "New HW's embodied carbon", 
        xy=(time_horizon_array[-5], system_a_projected_emissions[0]), 
        xytext=(time_horizon_array[-5], system_a_projected_emissions[0] + (system_a_projected_emissions[0] + system_a_projected_emissions[1])/15), 
        # arrowprops=dict(arrowstyle="->", color=LINE),
        fontsize=font_size-3,
        color=LINE
    )
    
    if intersection_x > time_horizon_array[-1]:
        y_top_lim = intersection_y + abs(min(system_a_projected_emissions) - min(system_b_projected_emissions))/2
    if intersection_x > 1 and intersection_x < 2:
        x_text_coord = intersection_x + 0.3
        y_text_coord = intersection_y - abs(min(system_a_projected_emissions) - min(system_b_projected_emissions))
    else:
        x_text_coord = intersection_x - 3.1
        y_text_coord = intersection_y + abs(min(system_a_projected_emissions) - min(system_b_projected_emissions))/25

    ax1.annotate(
        f"{intersection_x:.1f} years", 
        xy=(intersection_x, intersection_y), 
        xytext=(x_text_coord, y_text_coord), 
        # arrowprops=dict(arrowstyle="->", color=LINE),
        fontsize=font_size-3,
        color=LINE
    )

    for idx, i in enumerate(time_horizon_array):

        if i < round(intersection_x) - 1 and idx != 0 and ratio[idx]>1:

            # Annotate with arrow and ratio text
            
            ax1.annotate(
                '',
                xy=(i, system_a_projected_emissions[idx]),  # Arrow tip (upper line)
                xytext=(i, system_b_projected_emissions[idx]),  # Arrow base (bottom line)
                arrowprops=dict(arrowstyle='<->', color=LINE),
                fontsize=font_size - 5,
                color=LINE,
                ha='center'
            )

            # Add text next to the arrow at the midpoint
            ax1.text(
                i + 0.1, (system_b_projected_emissions[idx] + system_a_projected_emissions[idx])/2,
                f'{ratio[idx]:.1f}x',
                fontsize=font_size - 3,
                ha='left',
                va='center',
                color=LINE
            )



    # ax2.plot(time_horizon_array, ratio, linestyle='-', color=LINE, marker='.', linewidth=2, markersize=20)
    # ax2.set_ylabel('Ratio', color=LINE, fontsize=font_size, fontweight='bold')
    # ax2.tick_params(axis='y', colors=LINE)

    # line = ax2.lines[0]
    # for x_value, y_value in zip(line.get_xdata(), line.get_ydata()):
    #     label = "{:.2f}".format(y_value)
    #     ax2.annotate(label, (x_value, y_value), xytext=(15, 5),
    #                  textcoords="offset points", ha='center', va='bottom', color=LINE, fontsize=font_size)
    # ax2.axhline(1, color=LINE, linestyle='dashed', linewidth=2, label="Break-even")

    ax1.set_ylabel('Acc. CO$_2$ [Tons]', fontsize=font_size)
    ax1.set_xlabel('Duration [Years]', fontsize=font_size)
    ax1.set_xticks(time_horizon_array)
    ax1.tick_params(axis='x', labelsize=font_size)
    ax1.tick_params(axis='y', labelsize=font_size)
    if y_top_lim is not None:
        ax1.set_ylim(top=y_top_lim)
    ax1.set_xlim(left=0)
    ax1.set_ylim(bottom=0)
    x_tick_labels = ax1.get_xticklabels()
    x_tick_labels[0].set_visible(False)
    # ax2.tick_params(axis='y', labelsize=font_size)
    # ax2.set_ylim(bottom=0)
    # ax2.set_ylim(top=np.max(ratio) + np.std(ratio))

    # Get handles and labels from both axes
    handles1, labels1 = ax1.get_legend_handles_labels()
    # handles2, labels2 = ax2.get_legend_handles_labels()

    # Combine them
    handles = handles1
    labels = labels1

    if not separate_legend:
        # Move the legend above the plot
        # Add a combined legend to the figure
        fig.legend(handles, labels, loc="upper center", ncol=3, fontsize=font_size, bbox_to_anchor=(0.53, 1.14))
        # ax1.legend(loc='upper center', ncol=3, fontsize=font_size,
        # bbox_to_anchor=(0.5, 1.2))  # Adjust vertical position

    
    plt.tight_layout()
    print(save_path)
    plt.savefig(f"{save_path}.png", bbox_inches='tight')
    plt.savefig(f"{save_path}.svg", bbox_inches='tight')

    if separate_legend:
        # Separate legend figure
        legend_fig = plt.figure(figsize=(8, 1))
        legend_ax = legend_fig.add_subplot(111)
        legend_ax.axis("off")
        separate_legend = legend_ax.legend(handles, labels, loc="center", ncol=3, fontsize=font_size, frameon=True)

        # Save the separate legend figure
        legend_fig.savefig(os.path.join(os.path.dirname(save_path), "legend.png"), bbox_inches="tight")
        legend_fig.savefig(os.path.join(os.path.dirname(save_path), "legend.svg"), bbox_inches="tight")

    # plt.show()
