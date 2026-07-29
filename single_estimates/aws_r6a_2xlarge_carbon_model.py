#!/usr/bin/env python3
"""
Estimate embodied and 6-year operational carbon for an AWS r6a.2xlarge instance
using the repo's model.

This is a proxy estimate, not a full cloud LCA.

Inputs used:
- Memory: 64 GiB from the AWS R6a instance family page
- SSD: 0 GB
- HDD: 0 GB
- CPU/package area:
  - AWS says r6a instances are powered by 3rd generation AMD EPYC processors,
    specifically AMD EPYC 7R13.
  - The repo model expects a single `die_size` input, so we need a silicon-area
    proxy, not a package footprint.
  - The estimate here uses measured Milan silicon areas instead of substrate size:
    one Zen 3 CCD at about 80 mm^2 plus an IOD at about 416 mm^2.
  - r6a.2xlarge exposes 8 vCPUs. We treat that as one active 8-core CCD and
    amortize the shared IOD across the full socket. Using a 64-core socket
    denominator, the IOD share is 416 * (8/64) = 52 mm^2.
  - Total proxy silicon area = 80 + 52 = 132 mm^2.
  - This keeps the estimate tied to actual silicon, not the larger package outline.
- Operational power:
  - AWS does not publish a per-instance power draw for r6a.2xlarge.
  - We use AMD EPYC 7643P's default TDP of 225 W as a Milan-era proxy,
    since it is the closest public AMD Milan SKU with a published TDP.

Sources:
- AWS R6a instance page:
  https://aws.amazon.com/ec2/instance-types/r6a/
- AWS memory-optimized instance table:
  https://aws.amazon.com/ec2/instance-types/memory-optimized/
- AMD EPYC 7643P product page:
  https://www.amd.com/en/products/processors/server/epyc/7003-series/amd-epyc-7643p.html
- WikiChip Milan silicon/package overview:
  https://en.wikichip.org/wiki/amd/cores/milan
"""

from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System


# AWS r6a.2xlarge technical spec inputs
VCPUS = 8
DRAM_GB = 64
SSD_GB = 0
HDD_GB = 0
UTILIZATION = 20
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
CPU_TDP_WATTS = 225

# Measured Milan silicon proxies:
# - one Zen 3 CCD ~= 80 mm^2
# - Milan IOD ~= 416 mm^2
# For r6a.2xlarge, 8 vCPUs map to one CCD, and the IOD is amortized across
# the full socket. Using a 64-core denominator for the socket gives:
# 80 + 416 * (8 / 64) = 132 mm^2.
# The repo model expects cm^2, so we convert mm^2 to cm^2 by dividing by 100.
PACKAGE_AREA_CM2 = (80.0 + 416.0 * (VCPUS / 64.0)) / 100.0


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
