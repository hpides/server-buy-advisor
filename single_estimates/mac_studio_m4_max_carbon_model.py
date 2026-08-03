from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System

UTILIZATION = 30
TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
SSD_GB = 500
HDD_GB = 0

# Thats what our M4 Max has
DRAM_GB = 64
# https://www.notebookcheck.net/Apple-MacBook-Pro-16-M4-Max-review-The-M4-Max-is-one-of-the-fastest-mobile-processors.929593.0.html
CPU_TDP_WATTS = 57.0

# - CPU/package area:
#   - Apple M4 die size = 169.35 mm^2 from Wikipedia's Apple silicon page
#     (comparison table, M4 row; line 1085 in the page dump used here)
#     exact page: https://en.wikipedia.org/wiki/Apple_silicon
#   - Apple M4 transistor count = 28 billion from the same source
#   - Apple M3 Max transistor count = 92 billion from Wikipedia's Transistor count page
#   - We do not have a public M4 Max die/package area in the repo or from Apple.
#     To keep the model usable, we extrapolate from the closest public Apple silicon
#     data point we have:
#       1. Take M4 as the reference process-density anchor.
#       2. Compute an approximate transistor density for M4:
#          28B transistors / 169.35 mm^2.
#       3. Assume M4 Max has roughly M3 Max-scale transistor count.
#       4. Convert that transistor count into area by preserving the M4 density:
#          area_m4_max_mm2 ~= 92B * (169.35 mm^2 / 28B).
#       5. That yields about 556.44 mm^2, which we convert to 5.5644 cm^2 for the
#          repository's `System` model.
# The repo's model expects cm^2, so we convert mm^2 to cm^2 by dividing by 100.

# NOTE: This is the entire chip, so also includes the GPUs
PACKAGE_AREA_CM2 = 556.44 / 100.0


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
