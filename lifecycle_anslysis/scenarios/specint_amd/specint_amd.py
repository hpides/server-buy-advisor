import os

from lifecycle_anslysis.comparison import generate_systems_comparison
from lifecycle_anslysis.constants import GERMANY, SWEDEN, SPECINT
from lifecycle_anslysis.plotting import create_projections_plot
from lifecycle_anslysis.system import System

# assumptions
time_horizon = 10

##############################
# Systems
##############################

# shared specs
lifetime = 10
dram_capacity = 8 * 64
ssd_capacity = 2 * 1600
hdd_capacity = 0

# AMD EPYC 7502P, 2.5GHz
old_system = System(
    die_size=74 / 100,  # cm^2; # Die size from: https://www.techpowerup.com/cpu-specs/epyc-7502p.c2260,
    performance_indicator=285.44,
    # according to https://www.spec.org/cpu2006/results/ and https://www.spec.org/cpu2017/results/
    cpu_tdp=180,
    lifetime=lifetime,
    dram_capacity=dram_capacity,
    ssd_capacity=ssd_capacity,
    hdd_capacity=hdd_capacity,
)

# AMD 9334, 2.7 GHz
new_system = System(
    die_size=4 * 72 / 100,  # cm^2,
    performance_indicator=470.4,
    # according to https://www.spec.org/cpu2006/results/ and https://www.spec.org/cpu2017/results/
    cpu_tdp=210,
    lifetime=lifetime,
    dram_capacity=dram_capacity,
    ssd_capacity=ssd_capacity,
    hdd_capacity=hdd_capacity,
)

if __name__ == '__main__':
    # plot comparison plots
    for country in [GERMANY, SWEDEN]:
        for utilization in [30, 60, 90]:
            save_path = os.path.join("./plots", f"country-{country}-utilization-{utilization}-workload-specint")

            new_system_opex, old_system_opex, abs_savings, relative_savings, ratio = \
                generate_systems_comparison(
                    new_system=new_system,
                    old_system=old_system,
                    time_horizon=time_horizon,
                    country=country,
                    utilization=utilization,
                    performance_measure=SPECINT)

            fig_size = (10, 5)
            create_projections_plot(new_system_opex, old_system_opex, ratio, save_path, fig_size=fig_size)
