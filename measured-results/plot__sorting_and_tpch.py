#!/usr/bin/env python3

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import socket


TWO_FIGURES = True  # does not work, script now rather hard coded for two subfigures

# colors
BAR2 = "#abd9e9"
BAR1 = "#fdae61"
LINE = "#d7191c"

# Central variable for font size
font_size = 16

# Read the data
df = pd.read_csv("sorting_and_tpch.csv", decimal=",")
df = df.replace({"Intel Xeon ": "", "Gold ": "", "Platinum ": ""}, regex=True)

df["PLOT_KEY"] = df.LAUNCH_YEAR.astype(str) + " Q" + df.LAUNCH_QUARTER.astype(str) + " (" + df.CPU_IDENTIFIER + ")"
df["K_SORTED_TUPLES_PER_S"] = df["SORTED_TUPLES_PER_S"] / 1_000
df["M_SORTED_TUPLES_PER_S"] = df["SORTED_TUPLES_PER_S"] / 1_000_000
df["M_SORTED_TUPLES_PER_JOULE"] = df["SORTED_TUPLES_PER_JOULE"] / 1_000_000
df["ADAPTED_MT_SPECINT"] = df.SPECINT * df.CORE_COUNT

df = df.query("CPU_IDENTIFIER != '6240L'")

# Melt the dataframe for easier plotting
df_melted = pd.melt(df, id_vars=["PLOT_KEY"], value_vars=["SORTED_TUPLES_PER_S", "TPCH_RUNS_PER_H", "SPECINT_RATE"],
                    var_name="BENCHMARK")

# Set whitegrid style which is quite similar to Marcel's and Ricardo's style.
sns.set_style("whitegrid")

# Update rcParams to affect the plots
plt.rcParams.update({
    'text.usetex': "Peteretina" not in socket.gethostname(),
    # 'pgf.rcfonts': "Peteretina" not in socket.gethostname(),
    'pgf.rcfonts': True,
    'font.size': font_size,             # Set general font size
    'axes.titlesize': font_size,        # Set font size for axes titles
    'axes.labelsize': font_size,        # Set font size for axes labels
    'xtick.labelsize': font_size,       # Set font size for x-tick labels
    'ytick.labelsize': font_size,       # Set font size for y-tick labels
    'legend.fontsize': font_size,       # Set font size for legend
    'figure.titlesize': font_size       # Set font size for figure title
})

# Define plotting region (1 row, 3 columns)
fig, axes = plt.subplots(2, 3, figsize=(14, 7), sharey=True)

# Plot each subplot
for row_id, plot_title, color, plot_meta in [
        (0, "Performance", BAR1, [
                                  # (0, "ADAPTED_MT_SPECINT", "Result score", "SPECint 2017", 0),
                                  (0, "SPECINT_RATE", "Result Score", "SPECrate Integer 2017", 0),
                                  (1, "TPCH_RUNS_PER_H", "Runs per Hour", "TPC-H - High Load", 0),
                                  (2, "K_SORTED_TUPLES_PER_S", "Million Tuples Sorted per Second", "Parallel std::sort", 0)]),
        (1, "Efficiency", BAR2, [
                                 # (0, "SPECINT_PER_TDP", "Result score per Watt", "SPECint 2017", 0),
                                 (0, "SPECINTrate_PER_TDP", "Result Score per Watt", "SPECrate Integer 2017", 0),
                                 (1, "TPCH_RUNS_PER_KJOULE", "Runs per kJoule", "TPC-H - High Load", 0),
                                 (2, "M_SORTED_TUPLES_PER_JOULE", "Million Tuples Sorted per Joule", "Parallel std::sort", 2)])]:
    if TWO_FIGURES:
        fig, axes = plt.subplots(1, 3, figsize=(14, 3), sharey=True)
        row_id = 0

    for col_id, column_name, axis_title, subplot_title, arrow_offset in plot_meta:
        sns.barplot(data=df, x=column_name, y="PLOT_KEY", ax=axes[col_id], color=color, orient="h")
        if row_id == 0:
            axes[col_id].set_title(subplot_title, weight="bold") #, y=1.2, pad=14)
        axes[col_id].set_xlabel(axis_title)
        if not TWO_FIGURES:
            axes[col_id].set_ylabel(plot_title, labelpad=50.0, weight="bold")
        else:
            # axes[col_id].set_ylabel(None)
            # Test if it helps?
            axes[col_id].set_ylabel(plot_title, labelpad=30.0, weight="bold")
        axes[col_id].text(df[column_name].min() + (df[column_name].max() - df[column_name].min()) / 2,
                          arrow_offset + 0.075,
                          f"{df[column_name].max() / df[column_name].min():.2f}x", horizontalalignment="center",
                          color=LINE, fontsize=int(0.9 * float(font_size)))
        axes[col_id].annotate('', xy=(df[column_name].min(), arrow_offset + 0.2), xytext=(df[column_name].max(), arrow_offset + 0.2),
                               arrowprops=dict(arrowstyle="<->", color=LINE))
        axes[col_id].tick_params(axis='x', labelsize=font_size)  # Set font size for x-tick labels

    if TWO_FIGURES:
        plt.tight_layout()
        fig.savefig(f"sorting_and_tpch__{plot_title.lower()}.pdf")
        # plt.show()

if not TWO_FIGURES:
    # Adjust layout
    plt.tight_layout(h_pad=2.0)  # two rows

    # Save the figure
    fig.savefig("sorting_and_tpch3.pdf")
    plt.show()
