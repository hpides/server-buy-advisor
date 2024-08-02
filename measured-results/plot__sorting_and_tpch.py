#!/usr/bin/env python

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Central variable for font size
font_size = 16

# Read the data
df = pd.read_csv("sorting_and_tpch.csv", decimal=",")
df = df.replace({"Intel Xeon ": "", "Gold ": "", "Platinum ": ""}, regex=True)

df["PLOT_KEY"] = df.LAUNCH_YEAR.astype(str) + " Q" + df.LAUNCH_QUARTER.astype(str) + " (" + df.CPU_IDENTIFIER + ")"
df["K_SORTED_TUPLES_PER_S"] = df["SORTED_TUPLES_PER_S"] / 1_000
df["M_SORTED_TUPLES_PER_S"] = df["SORTED_TUPLES_PER_S"] / 1_000_000
df["ADAPTED_MT_SPECINT"] = df.SPECINT * df.CORE_COUNT

# Melt the dataframe for easier plotting
df_melted = pd.melt(df, id_vars=["PLOT_KEY"], value_vars=["SORTED_TUPLES_PER_S", "TPCH_RUNS_PER_H", "SPECINT_RATE"],
                    var_name="BENCHMARK")

# Set whitegrid style which is quite similar to Marcel's and Ricardo's style.
sns.set_style("whitegrid")

# Update rcParams to affect the plots
plt.rcParams.update({
    'text.usetex': True,
    'pgf.rcfonts': False,
    'font.size': font_size,             # Set general font size
    'axes.titlesize': font_size,        # Set font size for axes titles
    'axes.labelsize': font_size,        # Set font size for axes labels
    'xtick.labelsize': font_size,       # Set font size for x-tick labels
    'ytick.labelsize': font_size,       # Set font size for y-tick labels
    'legend.fontsize': font_size,       # Set font size for legend
    'figure.titlesize': font_size       # Set font size for figure title
})

# Define plotting region (1 row, 3 columns)
fig, axes = plt.subplots(1, 3, figsize=(14, 3), sharey=True)

# Plot each subplot
for axis_id, column_name, axis_title, plot_title in [(0, "ADAPTED_MT_SPECINT", "Result score", "SPECint 2017"),
                                                     (1, "TPCH_RUNS_PER_H", "Runs per hour", "TPC-H - High Load"),
                                                     (2, "K_SORTED_TUPLES_PER_S", "Thousand tuples sorted per second",
                                                      "Parallel std::sort")]:
    sns.barplot(data=df, x=column_name, y="PLOT_KEY", ax=axes[axis_id], hue="PLOT_KEY", orient="h")
    axes[axis_id].set_title(plot_title, weight="bold")
    axes[axis_id].set_xlabel(axis_title)
    axes[axis_id].set_ylabel(None)
    axes[axis_id].text(df[column_name].min() + (df[column_name].max() - df[column_name].min()) / 2, 0.075,
                       f"{df[column_name].max() / df[column_name].min():.2f}x", horizontalalignment="center",
                       color="#404040", fontsize=int(0.9 * float(font_size)))
    axes[axis_id].annotate('', xy=(df[column_name].min(), 0.2), xytext=(df[column_name].max(), 0.2),
                           arrowprops=dict(arrowstyle="<->", color="#404040"))
    axes[axis_id].tick_params(axis='x', labelsize=font_size)  # Set font size for x-tick labels

# Adjust layout
plt.tight_layout()

# Save the figure
fig.savefig("sorting_and_tpch3.pdf")
plt.show()
