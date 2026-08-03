from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System

UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
SSD_GB = 500
HDD_GB = 0

# THe amount of DRAM we assume to use
DRAM_GB = 64

# https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-3000wx-series/amd-ryzen-threadripper-pro-3995wx.html
CPU_TDP_WATTS = 280

# - CPU:
#   - `lscpu` reports AMD Ryzen Threadripper PRO 3995WX 64-Cores.
#   - `dmidecode` reports one populated socket and 128 hardware threads.
#   - WikiChip's 3995WX page identifies this exact CPU as a 9-die multi-chip
#     package: eight Core Complex Dies plus one I/O die.
#   - Therefore, the model input here is the actual silicon die area present in
#     the 3995WX package, summed across those dies, not the package footprint and
#     not a single generic Zen 2 CCD:
#       * 8 Zen 2 CCDs at 74 mm^2 each
#       * 1 Zen 2 server I/O die at 416 mm^2
#     That gives:
#       total silicon ~= 8 * 74 + 416 = 1,008 mm^2
#       which we convert to 10.08 cm^2 for the repo model.
# Sources:
# - AMD Ryzen Threadripper PRO 3995WX product page:
#   https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen-threadripper-pro/ryzen-threadripper-pro-3000wx-series/amd-ryzen-threadripper-pro-3995wx.html
# - WikiChip Ryzen Threadripper PRO 3995WX page:
#   https://en.wikichip.org/wiki/amd/ryzen_threadripper/pro_3995wx
# - WikiChip Zen 2 die-size section:
#   https://en.wikichip.org/wiki/amd/microarchitectures/zen_2#Die
# - Lenovo ThinkStation P620 platform overview:
#   https://www.lenovo.com/us/en/p/workstations/thinkstationpseries/thinkstation-p620/
CCD_COUNT = 8
CCD_DIE_AREA_MM2 = 74.0
IOD_DIE_AREA_MM2 = 416.0
DIE_AREA_CM2 = (CCD_COUNT * CCD_DIE_AREA_MM2 + IOD_DIE_AREA_MM2) / 100.0
PACKAGE_AREA_CM2 = DIE_AREA_CM2


def main() -> None:
    system = System(
        die_size=DIE_AREA_CM2,
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
