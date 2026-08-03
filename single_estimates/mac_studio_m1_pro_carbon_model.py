from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System

UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
SSD_GB = 500
HDD_GB = 0

# Our M1 has actually 96 GB, but for our experiments we limited it to 32GB
DRAM_GB = 32
# A MAc Studio M1 Max has ~30W; but since we use it to approximate an M1 Pro we take these numbers
# Apparently 21.5 Watts just for the CPU part: https://www.notebookcheck.com/M1-Pro-vs-M1-Max_13845_13843.247552.0.html
CPU_TDP_WATTS = 21.5

# https://macperformanceguide.com/blog/2021/20211020_1400-Apple-ARM-M1X-die-size.html
# 432 mm^2 -> 4.32 cm^2
# NOTE: This is the entire chip, so also includes the GPUs
PACKAGE_AREA_CM2 = 432.0 / 100.0


def main() -> None:
    system = System(
        die_size=PACKAGE_AREA_CM2,
        performance_indicator=1.0,
        lifetime=TIME_HORIZON_YEARS,
        dram_capacity=DRAM_GB,
        ssd_capacity=SSD_GB,
        hdd_capacity=HDD_GB,
        cpu_tdp=CPU_TDP_WATTS,
    )

    embodied = system.calculate_capex_emissions()
    operational = system.calculate_opex_emissions(UTILIZATION, COUNTRY) * TIME_HORIZON_YEARS
    total = embodied + operational

    print(f"Embodied carbon: {embodied:.2f} kg CO2e")
    print(f"Operational carbon ({TIME_HORIZON_YEARS}y, {UTILIZATION}%, Germany): {operational:.2f} kg CO2e")
    print(f"Total carbon ({TIME_HORIZON_YEARS}y): {total:.2f} kg CO2e")


if __name__ == "__main__":
    main()
