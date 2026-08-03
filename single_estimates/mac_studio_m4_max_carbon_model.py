#!/usr/bin/env python3
"""
Estimate embodied carbon for a Mac Studio with M4 Max using the repo's model.

This is a proxy estimate, not Apple-reported product carbon.

Inputs used:
- Memory: 64 GB unified memory from Apple Mac Studio technical specs
- SSD: 500 GB, normalized for the comparison table
- HDD: 0 GB
- CPU/package area:
  - Apple M4 die size = 169.35 mm^2 from Wikipedia's Apple silicon page
    (comparison table, M4 row; line 1085 in the page dump used here)
    exact page: https://en.wikipedia.org/wiki/Apple_silicon
  - Apple M4 transistor count = 28 billion from the same source
  - Apple M3 Max transistor count = 92 billion from Wikipedia's Transistor count page
  - We do not have a public M4 Max die/package area in the repo or from Apple.
    To keep the model usable, we extrapolate from the closest public Apple silicon
    data point we have:
      1. Take M4 as the reference process-density anchor.
      2. Compute an approximate transistor density for M4:
         28B transistors / 169.35 mm^2.
      3. Assume M4 Max has roughly M3 Max-scale transistor count.
      4. Convert that transistor count into area by preserving the M4 density:
         area_m4_max_mm2 ~= 92B * (169.35 mm^2 / 28B).
      5. That yields about 556.44 mm^2, which we convert to 5.5644 cm^2 for the
         repository's `System` model.
  - This is intentionally a proxy estimate. It captures "more transistors at
    roughly the same density implies more silicon area," but it does not model
    Apple-specific packaging, chiplet/Fusion design details, or interposer area.

Sources:
- https://www.apple.com/mac-studio/specs/
- https://en.wikipedia.org/wiki/Apple_silicon
- https://en.wikipedia.org/wiki/Transistor_count
- https://en.wikipedia.org/wiki/Apple_M4
"""

from lifecycle_anslysis.system import System
from lifecycle_anslysis.constants import GERMANY


# Apple Mac Studio (M4 Max) technical spec inputs
DRAM_GB = 64
SSD_GB = 500
HDD_GB = 0
UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
# https://www.notebookcheck.net/Apple-MacBook-Pro-16-M4-Max-review-The-M4-Max-is-one-of-the-fastest-mobile-processors.929593.0.html
CPU_TDP_WATTS = 57.0

# Proxy package-area estimate for M4 Max.
# This uses the density-preserving extrapolation described in the module docstring.
# The repo's model expects cm^2, so we convert mm^2 to cm^2 by dividing by 100.
# 169.35 * 92 / 28 = 556.4357142857142 mm^2, which is 5.564357142857142 cm^2.
PACKAGE_AREA_CM2 = 556.4357142857142 / 100.0


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
