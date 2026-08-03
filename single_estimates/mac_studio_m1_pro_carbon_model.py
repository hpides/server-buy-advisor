#!/usr/bin/env python3
"""
Estimate embodied and 6-year operational carbon for a Mac Studio with M1 Max using the repo's model.

This is a proxy estimate, not a full product LCA.

Inputs used:
- Memory: 32 GB unified memory from Apple Mac Studio technical specs
- SSD: 500 GB, normalized for the comparison table
- HDD: 0 GB
- CPU/die area:
  - AnandTech reports the M1 Max at about 432 mm^2.
  - The repo model expects a single `die_size` input, so we use that die-area
    estimate directly as the proxy for silicon area.
  - This is a die-area proxy, not a package-footprint model.
- Operational power:
  - Apple lists the Mac Studio (2022) M1 Max at 115 W max wall power.
"""

from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System


DRAM_GB = 32
SSD_GB = 500
HDD_GB = 0
UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
# Apparently 21.5 Watts just for the CPU part: https://www.notebookcheck.com/M1-Pro-vs-M1-Max_13845_13843.247552.0.html
CPU_TDP_WATTS = 21.5

# https://macperformanceguide.com/blog/2021/20211020_1400-Apple-ARM-M1X-die-size.html
# 432 mm^2 -> 4.32 cm^2
# This includes the GPUs as well!
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
