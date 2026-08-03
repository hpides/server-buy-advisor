from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System

UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
SSD_GB = 500
HDD_GB = 0

SOCKETS = 1
CCDS_PER_SOCKET = 12
CCD_AREA_MM2 = 85.0
IOD_AREA_MM2 = 426.0

# The amount of DRAM we assume to use
DRAM_GB = 128
# https://www.amd.com/en/products/processors/server/epyc/9005-series/amd-epyc-9965.html
CPU_TDP_WATTS = SOCKETS * 500

# - CPU:
#   - The server reports AMD EPYC 9965 192-Core Processor and 2 sockets.
#   - The workload uses one NUMA node, so we model one socket worth of CPU and
#     associated memory locality instead of the full dual-socket machine.
#   - AMD lists EPYC 9965 with a default TDP of 500 W per socket.
#   - For the embodied estimate we use a silicon-area proxy based on Turin die
#     sizes instead of package footprint:
#       * Zen 5c CCD: about 85 mm^2
#       * Turin IOD: about 426 mm^2
#       * 12 CCDs per socket for a 192-core part
#     That gives:
#       per-socket silicon ~= 12 * 85 + 426 = 1,446 mm^2
# Sources:
# - AMD EPYC 9965 product page:
#   https://www.amd.com/en/products/processors/server/epyc/9005-series/amd-epyc-9965.html
# - Zen 5c Turin CCD / IOD size discussion:
#   https://www.pvsm.ru/news/441776
# - AMD Zen 5c die-shot article:
#   https://www.tomshardware.com/pc-components/cpus/amd-16-core-zen-5c-die-shots-show-long-narrow-ccx-all-16-cores-sharing-a-single-l3-cache

PACKAGE_AREA_CM2 = (SOCKETS * (CCDS_PER_SOCKET * CCD_AREA_MM2 + IOD_AREA_MM2)) / 100.0


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
