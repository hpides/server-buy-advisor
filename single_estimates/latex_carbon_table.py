#!/usr/bin/env python3
"""
Print a LaTeX table for the single-estimate scenarios in this folder.

The table columns are:
- System
- Embodied carbon
- Operational carbon
- Total carbon
- Carbon savings

Savings are computed against the first row, which is the AWS r6a.2xlarge
instance. The AWS row itself has no savings value.
"""

from __future__ import annotations

from lifecycle_anslysis.constants import GERMANY
from lifecycle_anslysis.system import System
from single_estimates.aws_r6a_2xlarge_carbon_model import (
    CPU_TDP_WATTS as AWS_CPU_TDP_WATTS,
    DRAM_GB as AWS_DRAM_GB,
    HDD_GB as AWS_HDD_GB,
    PACKAGE_AREA_CM2 as AWS_PACKAGE_AREA_CM2,
    SSD_GB as AWS_SSD_GB,
    UTILIZATION as AWS_UTILIZATION,
)
from single_estimates.mac_studio_m4_max_carbon_model import (
    CPU_TDP_WATTS as M4_CPU_TDP_WATTS,
    DRAM_GB as M4_DRAM_GB,
    HDD_GB as M4_HDD_GB,
    PACKAGE_AREA_CM2 as M4_PACKAGE_AREA_CM2,
    SSD_GB as M4_SSD_GB,
    UTILIZATION as M4_UTILIZATION,
)
from single_estimates.mac_studio_m1_pro_carbon_model import (
    CPU_TDP_WATTS as M1_CPU_TDP_WATTS,
    DRAM_GB as M1_DRAM_GB,
    HDD_GB as M1_HDD_GB,
    PACKAGE_AREA_CM2 as M1_PACKAGE_AREA_CM2,
    SSD_GB as M1_SSD_GB,
    UTILIZATION as M1_UTILIZATION,
)
from single_estimates.lenovo_thinkstation_p620_carbon_model import (
    CPU_TDP_WATTS as LENOVO_CPU_TDP_WATTS,
    DIE_AREA_CM2 as LENOVO_DIE_AREA_CM2,
    DRAM_GB as LENOVO_DRAM_GB,
    HDD_GB as LENOVO_HDD_GB,
    SSD_GB as LENOVO_SSD_GB,
    UTILIZATION as LENOVO_UTILIZATION,
)
from single_estimates.raspberry_pi_5_carbon_model import (
    CPU_TDP_WATTS as PI_CPU_TDP_WATTS,
    DRAM_GB as PI_DRAM_GB,
    HDD_GB as PI_HDD_GB,
    PACKAGE_AREA_CM2 as PI_PACKAGE_AREA_CM2,
    SSD_GB as PI_SSD_GB,
    UTILIZATION as PI_UTILIZATION,
)
from single_estimates.zen_5_server_carbon_model import (
    CPU_TDP_WATTS as ZEN5_CPU_TDP_WATTS,
    DRAM_GB as ZEN5_DRAM_GB,
    HDD_GB as ZEN5_HDD_GB,
    PACKAGE_AREA_CM2 as ZEN5_PACKAGE_AREA_CM2,
    SSD_GB as ZEN5_SSD_GB,
    UTILIZATION as ZEN5_UTILIZATION,
)


TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY


def estimate(
    da_cm2: float,
    dram_gb: int,
    ssd_gb: int,
    hdd_gb: int,
    cpu_tdp_watts: float,
    utilization: float,
) -> tuple[float, float, float]:
    system = System(
        die_size=da_cm2,
        performance_indicator=1.0,
        lifetime=TIME_HORIZON_YEARS,
        dram_capacity=dram_gb,
        ssd_capacity=ssd_gb,
        hdd_capacity=hdd_gb,
        cpu_tdp=cpu_tdp_watts,
    )
    embodied = system.calculate_capex_emissions()
    operational = system.calculate_opex_emissions(utilization, COUNTRY) * TIME_HORIZON_YEARS
    total = embodied + operational
    return embodied, operational, total


def fmt(value: float) -> str:
    return f"{round(value):,}".replace(",", " ")


def main() -> None:
    rows = [
        (
            "r6a.2xlarge",
            *estimate(
                da_cm2=AWS_PACKAGE_AREA_CM2,
                dram_gb=AWS_DRAM_GB,
                ssd_gb=AWS_SSD_GB,
                hdd_gb=AWS_HDD_GB,
                cpu_tdp_watts=AWS_CPU_TDP_WATTS,
                utilization=AWS_UTILIZATION,
            ),
        ),
        (
            r"\amdzenfive",
            *estimate(
                da_cm2=ZEN5_PACKAGE_AREA_CM2,
                dram_gb=ZEN5_DRAM_GB,
                ssd_gb=ZEN5_SSD_GB,
                hdd_gb=ZEN5_HDD_GB,
                cpu_tdp_watts=ZEN5_CPU_TDP_WATTS,
                utilization=ZEN5_UTILIZATION,
            ),
        ),
        (
            r"\amdzentwo",
            *estimate(
                da_cm2=LENOVO_DIE_AREA_CM2,
                dram_gb=LENOVO_DRAM_GB,
                ssd_gb=LENOVO_SSD_GB,
                hdd_gb=LENOVO_HDD_GB,
                cpu_tdp_watts=LENOVO_CPU_TDP_WATTS,
                utilization=LENOVO_UTILIZATION,
            ),
        ),
        (
            r"\mfourmax",
            *estimate(
                da_cm2=M4_PACKAGE_AREA_CM2,
                dram_gb=M4_DRAM_GB,
                ssd_gb=M4_SSD_GB,
                hdd_gb=M4_HDD_GB,
                cpu_tdp_watts=M4_CPU_TDP_WATTS,
                utilization=M4_UTILIZATION,
            ),
        ),
        (
            r"\monepro",
            *estimate(
                da_cm2=M1_PACKAGE_AREA_CM2,
                dram_gb=M1_DRAM_GB,
                ssd_gb=M1_SSD_GB,
                hdd_gb=M1_HDD_GB,
                cpu_tdp_watts=M1_CPU_TDP_WATTS,
                utilization=M1_UTILIZATION,
            ),
        ),
        (
            r"\raspi",
            *estimate(
                da_cm2=PI_PACKAGE_AREA_CM2,
                dram_gb=PI_DRAM_GB,
                ssd_gb=PI_SSD_GB,
                hdd_gb=PI_HDD_GB,
                cpu_tdp_watts=PI_CPU_TDP_WATTS,
                utilization=PI_UTILIZATION,
            ),
        ),
    ]

    baseline_total = rows[0][3]
    print(r"\begin{table}[t]")
    print(r"\centering")
    print(r"\small")
    print(r"\begin{tabular}{lrrrr}")
    print(r"\toprule")
    print(r"\multirow{2}{*}{\shortstack[l]{System\\Name}} & \multicolumn{4}{c}{Carbon (kg CO$_2$e)} \\")
    print(r" & \multicolumn{1}{c}{Embod.} & \multicolumn{1}{c}{Operat.} & \multicolumn{1}{c}{Total} & \multicolumn{1}{c}{Savings} \\")
    print(r"\midrule")
    for idx, row in enumerate(rows):
        if len(row) == 5:
            name, embodied, operational, total, _ = row
            print(rf"{name} & ? & ? & ? & ? \\")
            continue
        name, embodied, operational, total = row
        savings = 0.0 if idx == 0 else baseline_total - total
        bold_savings = f"\\textbf{{{fmt(savings)}}}"
        print(f"{name} & {fmt(embodied)} & {fmt(operational)} & {fmt(total)} & {bold_savings} \\\\")
    print(r"\bottomrule")
    print(r"\end{tabular}")
    print(r"\caption{Carbon comparison of the selected systems.}")
    print(r"\label{tab:single-estimates-carbon-comparison}")
    print(r"\end{table}")


if __name__ == "__main__":
    main()
