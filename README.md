# TCO₂: Total Cost of Ownership
A tool for quantifying the total CO2 cost of ownership of database servers.

## Paper
[A Case for Ecological Efficiency in Database Server Lifecycles](https://hpi.de/oldsite/fileadmin/user_upload/fachgebiete/rabl/publications/2025/serverlifecycles_cidr2025.pdf)

## Web Interface
![tco2 screenshot (5)](https://github.com/user-attachments/assets/a933cf22-9561-4572-a8eb-c0199676a180)
### Section 1 - Server Configurations
Users can configure CPU, DRAM, SSD, and HDD of an existing server to compare 
it with another setup and asses its CO₂ emissions relative to its own embodied carbon.

### Section 2 - Benchmark Settings
This section enables users to modify the type of workload, the percentage of 
server utilization, and the intensity of carbon of the grid based on the 
location of the server.

Workload Types:
- **SPECrate** – Measures multi-threaded performance, simulating
environments such as databases and web servers
- **SPECspeed** – Evaluates single-threaded performance for general purpose tasks such as
data compression and text processing. We use publicly available measurements for both, SPECrate and SPECspeed.
- **Sorting** – A common yet computationally challenging task that
is difficult to fully parallelize. A vector of four billion random integer
values (uint32_t, 16GB) is generated, then the time to sort the
entire vector is measured.
- **TPC-H** – Assesses analytical database performance by running
TPC-H workloads with a scale factor of 10 and 25 read-only query
streams on the open-source in-memory database system Hyrise [5].
We collect measurements for Sorting and TPC-H experimentally in
our lab

Other Settings:
- **Server Utilization** – Defined as the ratio of queries per second
to the maximum possible queries per second. According to
the findings of Barroso and Hölzle, who monitored thousands
of Google servers over six months, servers typically operate at
between 10% and 50% of their maximum theoretical capacity rather
than being idle or running at peak levels.
- **Grid Carbon Intensity (GCI)** – The GCI also plays a crucial role
in predicting the ecological impact of upgrading components. The
carbon intensity of a country’s power grid measures the CO2 emissions per kilowatt-hour of electricity produced.

### Section 3 - Break-Even Analysis
The break-even time is visualized on a line chart, allowing users to assess 
the accumulated CO2 emissions across different configurations.

### Section 4 - Detailed Breakdown
Additional key data points, such as break-even time, grid carbon intensity,
embodied carbon of new hardware, total carbon footprint until break-even,
workload performance indicator, and breakdowns of the embodied and operational 
carbon footprint are provided to give further insights into each comparison. 
These data points along with the line chart are then dynamically updated to 
reflect any changes made to the parameters.


## Data

|File|Description|
|----|-----------|
|cpu2006-results-20240723-164205.csv|SPEC CPU 2006|
|cpu2017-results-20240723-171407.csv|SPEC CPU 2017|
|tpc_cpu.csv|TPC-H/C most used CPU + TDP|
|intel_cpus.csv|Intel CPU information crawled from https://ark.intel.com|
