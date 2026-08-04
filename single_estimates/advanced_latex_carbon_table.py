#!/usr/bin/env python3
"""
Print advanced LaTeX carbon tables for the single-estimate scenarios.

Semantics:
- The cloud baseline is the AWS r6a.2xlarge instance at 30% utilization.
- The script prints three tables:
  1. Non-cloud rows at 10% utilization.
  2. Non-cloud rows at the high-utilization scenario.
  3. A high-minus-10% diff table.
- The high-utilization scenario is 40% by default. Selected systems can scale
  that high point by CPU cores from the cloud baseline.
- For the diff table, embodied carbon is shown as 0 with the actual embodied
  estimate in parentheses. Savings uses the same notation: savings with
  embodied counted as 0, followed by savings including actual embodied carbon
  in parentheses.
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
    VCPUS as AWS_VCPUS,
)
from single_estimates.lenovo_thinkstation_p620_carbon_model import (
    CPU_TDP_WATTS as LENOVO_CPU_TDP_WATTS,
    DIE_AREA_CM2 as LENOVO_DIE_AREA_CM2,
    DRAM_GB as LENOVO_DRAM_GB,
    HDD_GB as LENOVO_HDD_GB,
    SSD_GB as LENOVO_SSD_GB,
)
from single_estimates.mac_studio_m1_pro_carbon_model import (
    CPU_TDP_WATTS as M1_CPU_TDP_WATTS,
    DRAM_GB as M1_DRAM_GB,
    HDD_GB as M1_HDD_GB,
    PACKAGE_AREA_CM2 as M1_PACKAGE_AREA_CM2,
    SSD_GB as M1_SSD_GB,
)
from single_estimates.mac_studio_m4_max_carbon_model import (
    CPU_TDP_WATTS as M4_CPU_TDP_WATTS,
    DRAM_GB as M4_DRAM_GB,
    HDD_GB as M4_HDD_GB,
    PACKAGE_AREA_CM2 as M4_PACKAGE_AREA_CM2,
    SSD_GB as M4_SSD_GB,
)
from single_estimates.raspberry_pi_5_carbon_model import (
    CPU_TDP_WATTS as PI_CPU_TDP_WATTS,
    DRAM_GB as PI_DRAM_GB,
    HDD_GB as PI_HDD_GB,
    PACKAGE_AREA_CM2 as PI_PACKAGE_AREA_CM2,
    SSD_GB as PI_SSD_GB,
)
from single_estimates.zen_5_server_carbon_model import (
    CPU_TDP_WATTS as ZEN5_CPU_TDP_WATTS,
    DRAM_GB as ZEN5_DRAM_GB,
    HDD_GB as ZEN5_HDD_GB,
    PACKAGE_AREA_CM2 as ZEN5_PACKAGE_AREA_CM2,
    SSD_GB as ZEN5_SSD_GB,
)


TIME_HORIZON_YEARS = 6
COUNTRY = GERMANY
CLOUD_UTILIZATION = 30
LOCAL_LOW_UTILIZATION = 10
LOCAL_HIGH_UTILIZATION = 40
SCALED_HIGH_UTILIZATION_CORES = {
    r"\amdzenfive": 192,
    r"\amdzentwo": 64,
    r"\mfourmax": 16,
    r"\monepro": 10,
    r"\raspi": 4,
}


def build_system(
    da_cm2: float,
    dram_gb: int,
    ssd_gb: int,
    hdd_gb: int,
    cpu_tdp_watts: float,
) -> System:
    return System(
        die_size=da_cm2,
        performance_indicator=1.0,
        lifetime=TIME_HORIZON_YEARS,
        dram_capacity=dram_gb,
        ssd_capacity=ssd_gb,
        hdd_capacity=hdd_gb,
        cpu_tdp=cpu_tdp_watts,
    )


def embodied(system: System) -> float:
    return system.calculate_capex_emissions()


def operational(system: System, utilization: float) -> float:
    return system.calculate_opex_emissions(utilization, COUNTRY) * TIME_HORIZON_YEARS


def high_utilization(name: str) -> float:
    cpu_cores = SCALED_HIGH_UTILIZATION_CORES.get(name)
    if cpu_cores is None:
        return LOCAL_HIGH_UTILIZATION
    return LOCAL_LOW_UTILIZATION + CLOUD_UTILIZATION * AWS_VCPUS / cpu_cores


def incremental_operational(name: str, system: System) -> float:
    high = operational(system, high_utilization(name))
    low = operational(system, LOCAL_LOW_UTILIZATION)
    return high - low


def fmt(value: float) -> str:
    return f"{rounded(value):,}".replace(",", " ")


def rounded(value: float) -> int:
    return round(value)


def fmt_utilization(value: float) -> str:
    return f"{value:.2f}".rstrip("0").rstrip(".")


def cloud_row() -> tuple[str, str, float, float, float]:
    system = build_system(
        da_cm2=AWS_PACKAGE_AREA_CM2,
        dram_gb=AWS_DRAM_GB,
        ssd_gb=AWS_SSD_GB,
        hdd_gb=AWS_HDD_GB,
        cpu_tdp_watts=AWS_CPU_TDP_WATTS,
    )
    capex = embodied(system)
    opex = operational(system, CLOUD_UTILIZATION)
    total = rounded(capex) + rounded(opex)
    return "r6a.2xlarge", fmt(capex), opex, total, 0.0


def local_systems() -> list[tuple[str, System]]:
    return [
        (
            r"\amdzenfive",
            build_system(
                da_cm2=ZEN5_PACKAGE_AREA_CM2,
                dram_gb=ZEN5_DRAM_GB,
                ssd_gb=ZEN5_SSD_GB,
                hdd_gb=ZEN5_HDD_GB,
                cpu_tdp_watts=ZEN5_CPU_TDP_WATTS,
            ),
        ),
        (
            r"\amdzentwo",
            build_system(
                da_cm2=LENOVO_DIE_AREA_CM2,
                dram_gb=LENOVO_DRAM_GB,
                ssd_gb=LENOVO_SSD_GB,
                hdd_gb=LENOVO_HDD_GB,
                cpu_tdp_watts=LENOVO_CPU_TDP_WATTS,
            ),
        ),
        (
            r"\mfourmax",
            build_system(
                da_cm2=M4_PACKAGE_AREA_CM2,
                dram_gb=M4_DRAM_GB,
                ssd_gb=M4_SSD_GB,
                hdd_gb=M4_HDD_GB,
                cpu_tdp_watts=M4_CPU_TDP_WATTS,
            ),
        ),
        (
            r"\monepro",
            build_system(
                da_cm2=M1_PACKAGE_AREA_CM2,
                dram_gb=M1_DRAM_GB,
                ssd_gb=M1_SSD_GB,
                hdd_gb=M1_HDD_GB,
                cpu_tdp_watts=M1_CPU_TDP_WATTS,
            ),
        ),
        (
            r"\raspi",
            build_system(
                da_cm2=PI_PACKAGE_AREA_CM2,
                dram_gb=PI_DRAM_GB,
                ssd_gb=PI_SSD_GB,
                hdd_gb=PI_HDD_GB,
                cpu_tdp_watts=PI_CPU_TDP_WATTS,
            ),
        ),
    ]


def utilization_rows(utilization: float) -> list[tuple[str, str, str, float, float, float]]:
    baseline = cloud_row()
    baseline_total = rounded(baseline[3])
    rows = [
        (
            baseline[0],
            fmt_utilization(CLOUD_UTILIZATION),
            baseline[1],
            baseline[2],
            baseline[3],
            baseline[4],
        )
    ]

    for name, system in local_systems():
        capex = embodied(system)
        row_utilization = high_utilization(name) if utilization == LOCAL_HIGH_UTILIZATION else utilization
        opex = operational(system, row_utilization)
        total = rounded(capex) + rounded(opex)
        rows.append(
            (
                name,
                fmt_utilization(row_utilization),
                fmt(capex),
                opex,
                total,
                baseline_total - total,
            )
        )

    return rows


def diff_rows() -> list[tuple[str, str, float, str]]:
    baseline = cloud_row()
    baseline_total = rounded(baseline[3])
    rows = [
        (
            baseline[0],
            baseline[1],
            baseline[2],
            "0 (0)",
        )
    ]

    for name, system in local_systems():
        capex = embodied(system)
        opex_delta = incremental_operational(name, system)
        rounded_capex = rounded(capex)
        rounded_opex_delta = rounded(opex_delta)
        savings_counting_embodied_zero = baseline_total - rounded_opex_delta
        savings_counting_actual_embodied = baseline_total - rounded_capex - rounded_opex_delta
        rows.append(
            (
                name,
                rf"0 ({fmt(capex)})",
                opex_delta,
                rf"{fmt(savings_counting_embodied_zero)} ({fmt(savings_counting_actual_embodied)})",
            )
        )

    return rows


def print_diff_table(
    rows: list[tuple[str, str, float, str]],
    caption: str,
    label: str,
) -> None:
    print(r"\begin{table}[t]")
    print(r"\centering")
    print(r"\small")
    print(r"\begin{tabular}{lrrr}")
    print(r"\toprule")
    print(r"\multirow{2}{*}{\shortstack[l]{System\\Name}} & \multicolumn{3}{c}{Carbon (kg CO$_2$e)} \\")
    print(r" & \multicolumn{1}{c}{Embod.} & \multicolumn{1}{c}{Operat.} & \multicolumn{1}{c}{Saved} \\")
    print(r"\midrule")
    for name, embodied_value, operational_value, savings_value in rows:
        bold_savings = f"\\textbf{{{savings_value}}}"
        print(
            f"{name} & {embodied_value} & {fmt(operational_value)} & "
            f"{bold_savings} \\\\"
        )
    print(r"\bottomrule")
    print(r"\end{tabular}")
    print(rf"\caption{{{caption}}}")
    print(rf"\label{{{label}}}")
    print(r"\end{table}")


def print_utilization_table(
    rows: list[tuple[str, str, str, float, float, float]],
    caption: str,
    label: str,
) -> None:
    print(r"\begin{table}[t]")
    print(r"\centering")
    print(r"\small")
    print(r"\begin{tabular}{lrrrrr}")
    print(r"\toprule")
    print(r"\multirow{2}{*}{\shortstack[l]{System\\Name}} & \multicolumn{1}{c}{Util.} & \multicolumn{4}{c}{Carbon (kg CO$_2$e)} \\")
    print(r" & \multicolumn{1}{c}{(\%)} & \multicolumn{1}{c}{Embod.} & \multicolumn{1}{c}{Operat.} & \multicolumn{1}{c}{Total} & \multicolumn{1}{c}{Savings} \\")
    print(r"\midrule")
    for name, utilization, embodied_value, operational_value, total_value, savings_value in rows:
        bold_savings = f"\\textbf{{{fmt(savings_value)}}}"
        print(
            f"{name} & {utilization} & {embodied_value} & "
            f"{fmt(operational_value)} & {fmt(total_value)} & {bold_savings} \\\\"
        )
    print(r"\bottomrule")
    print(r"\end{tabular}")
    print(rf"\caption{{{caption}}}")
    print(rf"\label{{{label}}}")
    print(r"\end{table}")


def main() -> None:
    print_utilization_table(
        utilization_rows(LOCAL_LOW_UTILIZATION),
        r"Advanced carbon comparison with non-cloud systems at 10\% utilization.",
        "tab:advanced-single-estimates-carbon-10pct",
    )
    print()
    print_utilization_table(
        utilization_rows(LOCAL_HIGH_UTILIZATION),
        r"Advanced carbon comparison with the high-utilization scenario for non-cloud systems.",
        "tab:advanced-single-estimates-carbon-40pct",
    )
    print()
    print_diff_table(
        diff_rows(),
        r"Advanced carbon comparison using the high-minus-10\% utilization delta for non-cloud systems.",
        "tab:advanced-single-estimates-carbon-diff",
    )


if __name__ == "__main__":
    main()
