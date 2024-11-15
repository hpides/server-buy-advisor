import os

from lifecycle_anslysis.comparison import generate_systems_comparison
from lifecycle_anslysis.constants import GERMANY, SWEDEN, HPE_POWER_ADVISOR, GUPTA_MODEL
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

# AMD EPYC 7502P, 2.5GHz
old_system = System(
    # cm^2; # Die size from: https://www.techpowerup.com/cpu-specs/epyc-7502p.c2260
    die_size=74 / 100,
    # according to https://www.spec.org/cpu2017/results/res2020q2/cpu2017-20200413-21933.pdf
    performance_indicator=217,
    cpu_tdp=180,
    lifetime=lifetime,
    dram_capacity=dram_capacity,
    ssd_capacity=ssd_capacity,
    hdd_capacity=hdd_capacity,
)

# AMD 9334, 2.7 GHz
new_system = System(
    die_size=4 * 72 / 100,  # cm^2,
    # according to https://www.spec.org/cpu2017/results/res2023q1/cpu2017-20230130-33834.pdf
    performance_indicator=363,
    cpu_tdp=210,
    lifetime=lifetime,
    dram_capacity=dram_capacity,
    ssd_capacity=ssd_capacity,
    hdd_capacity=hdd_capacity,
)

if __name__ == '__main__':
    # plot comparison plots
    save_root_path = "./plots"
    os.makedirs(save_root_path, exist_ok=True)
    for country in [GERMANY, SWEDEN]:
        for utilization in [30, 60, 90]:
            fig_size = (10, 5)

            save_path = os.path.join(save_root_path,
                                     f"HPE-country-{country}-utilization-{utilization}-workload-specint")
            hpe_new_system_opex, hpe_old_system_opex, hpe_abs_savings, hpe_relative_savings, hpe_ratio = \
                generate_systems_comparison(
                    new_system=new_system,
                    old_system=old_system,
                    time_horizon=time_horizon,
                    country=country,
                    utilization=utilization,
                    opex_calculation=HPE_POWER_ADVISOR)
            create_projections_plot(hpe_new_system_opex, hpe_old_system_opex, hpe_ratio, save_path, fig_size=fig_size)

            save_path = os.path.join("./plots", f"MODEL-country-{country}-utilization-{utilization}-workload-specint")
            model_new_system_opex, model_old_system_opex, model_abs_savings, model_relative_savings, model_ratio = \
                generate_systems_comparison(
                    new_system=new_system,
                    old_system=old_system,
                    time_horizon=time_horizon,
                    country=country,
                    utilization=utilization,
                    opex_calculation=GUPTA_MODEL)
            create_projections_plot(model_new_system_opex, model_old_system_opex, model_ratio, save_path,
                                    fig_size=fig_size)
