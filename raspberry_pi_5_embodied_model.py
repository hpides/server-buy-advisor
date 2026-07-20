#!/usr/bin/env python3
"""
Estimate embodied and 5-year operational carbon for a Raspberry Pi 5 using the repo's model.

This is a proxy estimate, not a full product LCA.

Inputs used:
- Memory: 16 GB, from Raspberry Pi 5 product page / release announcement
- SSD: 0 GB
- HDD: 0 GB
- CPU/package area:
  - Raspberry Pi 5 uses the Broadcom BCM2712 application processor, per Raspberry Pi docs.
  - Jeff Geerling measured the BCM2712 C1 stepping at 6.47 mm x 8.63 mm
    = 55.836 mm^2.
  - We use that measured die area as the repo model's `die_size` proxy.
  - This is a die-area proxy, not the package footprint and not a board-level
    material model.
- Operational power:
  - Raspberry Pi docs list Raspberry Pi 5 typical bare-board active current consumption
    as 800 mA.
  - With the documented 5.1 V supply requirement, that is approximated as 4.08 W.

Sources:
- Raspberry Pi 5 product page:
  https://www.raspberrypi.com/products/raspberry-pi-5/?variant=raspberry-pi-5-8gb
- Raspberry Pi 5 16GB announcement:
  https://www.raspberrypi.com/news/16gb-raspberry-pi-5-on-sale-now-at-120/
- Raspberry Pi 5 product brief PDF:
  https://pip.raspberrypi.com/categories/892-raspberry-pi-5
- Raspberry Pi documentation power table:
  https://www.raspberrypi.com/documentation/computers/raspberry-pi.html
- Jeff Geerling BCM2712 die measurement:
  https://www.jeffgeerling.com/blog/2024/new-2gb-pi-5-has-33-smaller-die-30-idle-power-savings
"""

from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System


# Raspberry Pi 5 (16 GB variant) technical spec inputs
DRAM_GB = 16
SSD_GB = 0
HDD_GB = 0

# Memory/config source:
# https://www.raspberrypi.com/news/16gb-raspberry-pi-5-on-sale-now-at-120/

UTILIZATION = 60
TIME_HORIZON_YEARS = 5
COUNTRY = GERMANY

# Raspberry Pi 5 bare-board active current is documented as 800 mA.
# At 5.1 V this is 4.08 W.
# Power source:
# https://www.raspberrypi.com/documentation/computers/raspberry-pi.html
CPU_TDP_WATTS = 4.08

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
