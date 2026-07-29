#!/usr/bin/env python3
"""
Estimate embodied and 5-year operational carbon for Apple M3 Max using the repo's model.

This is a proxy estimate, not a full product LCA.

Inputs used:
- Memory: 36 GB unified memory from Apple MacBook Pro technical specs
- SSD: 1024 GB SSD from Apple MacBook Pro technical specs
- HDD: 0 GB
- CPU/die area:
  - A third-party AnandTech forum measurement puts M3 Max at about 429 mm^2.
  - The repo model expects a single `die_size` input, so we use that die-area
    estimate directly as the proxy for silicon area.
  - This is a die-area proxy, not a package-footprint model.
- Operational power:
  - Notebookcheck lists the M3 Max chip at 78 W TDP / total power.

Sources:
- Apple press release for M3 Max transistor count:
  https://www.apple.com/ca/newsroom/2023/10/apple-unveils-m3-m3-pro-and-m3-max-the-most-advanced-chips-for-a-personal-computer/
- Apple Support MacBook Pro (14-inch, M3 Pro or M3 Max, Nov 2023) tech specs:
  https://support.apple.com/en-la/117736
- AnandTech forum thread with the M3 Max die-size estimate:
  https://forums.anandtech.com/threads/apple-silicon-soc-thread.2587205/page-262
- Notebookcheck M3 Max specs:
  https://www.notebookcheck.net/Apple-M3-Max-16-Core-Processor-Benchmarks-and-Specs.781712.0.html
"""

from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System


DRAM_GB = 36
SSD_GB = 1024
HDD_GB = 0
UTILIZATION = 60
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
CPU_TDP_WATTS = 78

# 429 mm^2 -> 4.29 cm^2
PACKAGE_AREA_CM2 = 429.0 / 100.0


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
