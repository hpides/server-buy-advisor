#!/usr/bin/env python3
"""
Estimate embodied and 6-year operational carbon for an AWS r6a.2xlarge instance
using the repo's model.

This is a proxy estimate, not a full cloud LCA.

Inputs used:
- Memory: 64 GiB from the AWS R6a instance family page
- SSD: 500 GB, normalized for the comparison table
- HDD: 0 GB
- CPU/package area and power:
  - AWS says r6a instances are powered by 3rd generation AMD EPYC processors,
    specifically AMD EPYC 7R13, a 48-core Milan-generation part.
  - r6a.xlarge's published spec confirms 2:1 SMT (4 logical cores on 2 physical
    cores), so r6a.2xlarge's 8 vCPUs correspond to 4 physical cores, not 8.
  - This 4-physical-core figure, and the 48-core 7R13 denominator, are used
    consistently for BOTH the power fraction and the silicon area fraction
    below. Earlier drafts of this script used 4 cores for power but 8 cores
    (a full CCD) and a 64-core socket for area -- that mismatch is fixed here.
  - TDP: full-chip reported TDP for the 7R13 is 280 W (vendor listing, not an
    AMD public datasheet since this is a cloud-exclusive SKU -- treat as a
    rough proxy; other listings for the same part show 225 W).
    Physical-core share: 4 / 48 physical cores.
  - Silicon area: Milan CCDs are 8-core dies (~80 mm^2 each), so 4 cores is
    half a CCD's worth of silicon. The IOD (~416 mm^2) is shared by the whole
    48-core socket and amortized by the same 4/48 core fraction.
  - This keeps the estimate tied to actual silicon, not the larger package
    outline, and uses one consistent core-count model throughout.
- Operational power:
  - AWS does not publish a per-instance power draw for r6a.2xlarge.
  - We use the EPYC 7R13's reported 280 W full-chip TDP, scaled by the 4/48
    physical-core fraction, as a Milan-era proxy. See caveats above: this
    assumes linear power scaling per core, which likely understates the
    true share since uncore/IO power doesn't scale down linearly.

Sources:
- AWS R6a instance page:
  https://aws.amazon.com/ec2/instance-types/r6a/
- AWS memory-optimized instance table:
  https://aws.amazon.com/ec2/instance-types/memory-optimized/
- EPYC 7R13 280 W TDP listing (vendor, not AMD datasheet -- cloud-exclusive SKU):
  https://serverorbit.com/amd-100-000000311wof-epyc-7r13-48-core-2-65ghz-280w-processor/
- r6a.xlarge SMT confirmation (4 logical cores on 2 physical cores):
  https://sparecores.com/server/aws/r6a.xlarge
- WikiChip Milan silicon/package overview (CCD/IOD sizes):
  https://en.wikichip.org/wiki/amd/cores/milan
"""

from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System


# AWS r6a.2xlarge technical spec inputs
VCPUS = 8
DRAM_GB = 64
SSD_GB = 500
HDD_GB = 0
UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY

# --- Consistent core-count model (used for BOTH power and area below) ---
# r6a.xlarge spec confirms 2:1 SMT (4 logical cores on 2 physical cores),
# so 8 vCPUs on r6a.2xlarge = 4 physical cores.
SMT_RATIO = 2
PHYSICAL_CORES_USED = VCPUS / SMT_RATIO   # 4

# EPYC 7R13 is a 48-core part (confirmed via search), not 64-core.
SOCKET_CORES = 48
CORE_FRACTION = PHYSICAL_CORES_USED / SOCKET_CORES   # 4/48 = 1/12

# Full-chip TDP proxy for EPYC 7R13. Vendor listings disagree (225 W vs
# 280 W); 280 W used here as the more commonly cited figure. Not an AMD
# public datasheet value since 7R13 is a cloud-exclusive SKU.
FULL_CHIP_TDP_WATTS = 280.0
CPU_TDP_WATTS = FULL_CHIP_TDP_WATTS * CORE_FRACTION   # 280 * 4/48 ~= 23.33 W

# Measured Milan silicon proxies:
# - one Zen 3 CCD (8 cores) ~= 80 mm^2  ->  4 cores = half a CCD = 40 mm^2
# - Milan IOD ~= 416 mm^2, shared by the full 48-core socket, amortized by
#   the same 4/48 core fraction used for power above.
CCD_MM2_PER_8_CORES = 80.0
IOD_MM2_FULL_SOCKET = 416.0

ccd_area_mm2 = CCD_MM2_PER_8_CORES * (PHYSICAL_CORES_USED / 8.0)   # 40 mm^2
iod_area_mm2 = IOD_MM2_FULL_SOCKET * CORE_FRACTION                 # 34.67 mm^2
package_area_mm2 = ccd_area_mm2 + iod_area_mm2                     # ~74.67 mm^2

# The repo model expects cm^2, so convert mm^2 to cm^2 by dividing by 100.
PACKAGE_AREA_CM2 = package_area_mm2 / 100.0


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

    print(f"Physical cores used: {PHYSICAL_CORES_USED} / {SOCKET_CORES} (fraction {CORE_FRACTION:.4f})")
    print(f"CPU TDP proxy: {CPU_TDP_WATTS:.2f} W")
    print(f"Package area proxy: {PACKAGE_AREA_CM2:.4f} cm^2")
    print()
    print(f"Embodied carbon: {embodied:.2f} kg CO2e")
    print(f"Operational carbon ({TIME_HORIZON_YEARS}y, {UTILIZATION}%, Germany): {operational:.2f} kg CO2e")
    print(f"Total carbon ({TIME_HORIZON_YEARS}y): {total:.2f} kg CO2e")


if __name__ == "__main__":
    main()