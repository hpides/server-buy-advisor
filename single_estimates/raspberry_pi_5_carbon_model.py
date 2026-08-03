from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System

# Shared Across all Systems
UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
SSD_GB = 500
HDD_GB = 0
# https://www.raspberrypi.com/news/16gb-raspberry-pi-5-on-sale-now-at-120/
DRAM_GB = 16
# https://www.tomshardware.com/reviews/raspberry-pi-5
CPU_TDP_WATTS = 7
# Die measurement source:
# https://www.jeffgeerling.com/blog/2024/new-2gb-pi-5-has-33-smaller-die-30-idle-power-savings
# If i understood correctly, we have the version with the BCM2712 D0	6.30mm	X 5.98mm	-> 37.674mm2
PACKAGE_AREA_CM2 = 37.674 / 100.0


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
