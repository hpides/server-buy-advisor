import os

from lifecycle_anslysis.comparison import generate_systems_comparison
from lifecycle_anslysis.constants import GERMANY, SWEDEN, GUPTA_MODEL
from lifecycle_anslysis.plotting import create_projections_plot
from lifecycle_anslysis.system import System

# assumptions
time_horizon = 17

##############################
# Systems
##############################

# shared specs
lifetime = 10
dram_capacity = 8 * 64
ssd_capacity = 2 * 1600
hdd_capacity = 0

# Intel Xeon E7-4880, release 2014
old_system = System(
    die_size=541 / 100,  # cm^2,
    performance_indicator=1,  # own measurements Section 2 new system sorts 3.55 times more tuples per second
    cpu_tdp=130,
    lifetime=lifetime,
    dram_capacity=dram_capacity,
    ssd_capacity=ssd_capacity,
    hdd_capacity=hdd_capacity
)

# Intel Platinum 8480CL, release 2023
new_system = System(
    die_size=(4 * 477) / 100,  # cm^2,
    performance_indicator=3.55,  # own measurements Section 2 new system sorts 3.55 times more tuples per second
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
            save_path = os.path.join(save_root_path, f"country-{country}-utilization-{utilization}-workload-sorting")

            new_system_opex, old_system_opex, abs_savings, relative_savings, ratio = \
                generate_systems_comparison(
                    new_system=new_system,
                    old_system=old_system,
                    time_horizon=time_horizon,
                    country=country,
                    utilization=utilization,
                    opex_calculation=GUPTA_MODEL)

            fig_size = (10, 5)
            create_projections_plot(new_system_opex, old_system_opex, ratio, save_path, step_size=1, fig_size=fig_size)
