import os

from lifecycle_anslysis.comparison import generate_systems_comparison
from lifecycle_anslysis.constants import GERMANY, SWEDEN, GUPTA_MODEL
from lifecycle_anslysis.plotting import create_projections_plot
from lifecycle_anslysis.system import System

# assumptions
time_horizon = 9

##############################
# Systems
##############################

# shared specs
lifetime = 20
dram_capacity = 8 * 64
ssd_capacity = 2 * 1600
hdd_capacity = 0

# Intel 8352Y, release 2021
old_system = System(
    die_size=660 / 100,  # cm^2,
    performance_indicator=210,
    cpu_tdp=205,
    lifetime=lifetime,
    dram_capacity=dram_capacity,
    ssd_capacity=ssd_capacity,
    hdd_capacity=hdd_capacity
)

# Intel Platinum 8480CL, release 2023
new_system = System(
    die_size=(4 * 477) / 100,  # cm^2,
    performance_indicator=445,
    cpu_tdp=350,
    lifetime=lifetime,
    dram_capacity=dram_capacity,
    ssd_capacity=ssd_capacity,
    hdd_capacity=hdd_capacity
)

if __name__ == '__main__':
    # plot comparison plots
    save_root_path = "./plots"
    os.makedirs(save_root_path, exist_ok=True)
    for country in [GERMANY, SWEDEN]:
        for utilization in [30, 60, 90]:
            save_path = os.path.join(save_root_path, f"country-{country}-utilization-{utilization}-workload-specint")

            new_system_opex, old_system_opex, abs_savings, relative_savings, ratio = \
                generate_systems_comparison(
                    new_system=new_system,
                    old_system=old_system,
                    time_horizon=time_horizon,
                    country=country,
                    utilization=utilization,
                    opex_calculation=GUPTA_MODEL)

            fig_size = (10, 5)
            create_projections_plot(new_system_opex, old_system_opex, ratio, save_path, step_size=1, fig_size=fig_size,
                                    break_even_label_pos=420)
