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

Sources:
- Apple Support Mac Studio power consumption table:
  https://support.apple.com/en-mide/102027
- Apple Mac Studio technical specifications:
  https://www.apple.com/mac-studio/specs/
- AnandTech M1 Max article:
  https://www.anandtech.com/show/17019/apple-announced-m1-pro-m1-max-giant-new-socs-with-allout-performance
"""

from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System


DRAM_GB = 32
SSD_GB = 500
HDD_GB = 0
UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
CPU_TDP_WATTS = 115

# 432 mm^2 -> 4.32 cm^2
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
