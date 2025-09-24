import UtilizationScaling from "../assets/UtilizationScaling.png"
import EmissionsScaling from "../assets/EmissionsScaling.png"
import ResourceScaling from "../assets/ResourceScaling.png"

function LearnMore() {
  return (
      <div className="py-20">
        <h2 id="FurtherDetails" className="text-3xl text-center">Further Details</h2>
        <p className="text-xl text-center py-14 w-1/2 mx-auto">Data centers produce a significant and increasing amount of CO2 emissions. In the past, these have been predominantly due to energy generation for powering data centers. With the transition to energy sources with lower carbon production, the embodied carbon (i.e., CO2 and other greenhouse gas emissions during production, transport, and end-of-life) plays an increasing role when planning server lifecycles. While replacing an old server with newer hardware will typically reduce the power consumption of individual tasks, due to better efficiency of modern CPUs, offsetting the embodied carbon of new hardware can take months to tens of years, depending on the grid carbon intensity.</p>
        <section id="LearnMore" className="grid grid-cols-2">
          <div>
            <h3 id="modelDescription">Model Description</h3>
            <p>TCO₂ computes the total carbon cost of ownership of a server, combining:</p>
            <ul>
              <li><span>Embodied Carbon Footprint (ECF):</span> emissions from manufacturing, transport, and disposal of hardware (CPU, DRAM, SSD/HDD).</li>
              <li>Where total ECF = ECF<sub>CPU</sub> + ECF<sub>DRAM</sub> + ECF<sub>SSD</sub> + ECF<sub>HDD</sub></li>
              <li><span>Operational Carbon Footprint (OCF):</span> emissions from using the server, based on utilization, efficiency, and local grid carbon intensity.</li>
              <li>Where total OCF = OCF<sub>CPU</sub> + OCF<sub>DRAM</sub> + OCF<sub>SSD</sub> + OCF<sub>HDD</sub></li>
            </ul>
            <br />
            <p>A break-even point is reached when the combined operational and embodied carbon of the new server meets the operational carbon of the current server. We do not include the embodied carbon of the current server as we consider it to be amortized.</p>
            <p>More details about the model can be found in Section 3.1 of our <a className="underline" href='https://hpi.de/oldsite/fileadmin/user_upload/fachgebiete/rabl/publications/2025/serverlifecycles_cidr2025.pdf' target='_blank' >server lifecycle paper.</a></p>
          </div>
          <div>
            <h3>Measurements vs. Estimations</h3>
            <p>TCO<sub>2</sub> uses a mix of in-house performance measurements, published spec sheet data, and carbon estimates.</p>
            <ul>
              <li><span>Measurements:</span> Performance benchmarks (SPEC CPU 2017 Rate & Speed, sorting tasks, TPC-H) provide hardware performance ratios. Sorting and TPC-H were measured in-house at HPI with the intel processors that were available. The remaining AMD CPUs only consist of the SPEC benchmarks which were gathered online.</li>
              <li><span>Estimations:</span> Embodied carbon of components (CPU, DRAM, SSD, HDD) are calculated using <a href="https://ugupta.com/files/Gupta_ISCA2022_ACT.pdf" className="underline">published frameworks</a> since precise manufacturer data is often unavailable.</li>
              <li><span>Operational emissions:</span> Calculated from maximum power draw (TDP), average yearly country grid carbon intensity gathered from <a className="underline" href="https://www.electricitymaps.com/">Electricity Maps</a>, and normalized utilization.</li>
            </ul>
          </div>
          <div>
            <h3>Scaling Options</h3>
            <p>TCO<sub>2</sub> supports different methods of scaling to further mimick real world replacement scenarios:</p>
            <ul>
              <li><span>Utilization scaling:</span> Scales down the utilization on stronger hardware proportionally to its performance gain so that throughput stays comparable. <img className="mx-auto h-20 my-3" src={UtilizationScaling} /></li>
              <li><span>Emissions scaling:</span> Scales up emissions on weaker hardware to reflect an N-for-1 replacement scenario.<img  className="mx-auto h-20 my-3" src={EmissionsScaling} /></li>
              <li><span>Resource scaling:</span> Scales DRAM, SSD, and HDD capacities in proportion to performance ratios between CPU generations.<img className="mx-auto h-20 my-3" src={ResourceScaling} /></li>
            </ul>
          </div>
          <div>
            <h3>Limitations</h3>
            <p>TCO<sub>2</sub> serves as a basic estimation tool to compare the carbon footprint of server replacements, therefore a multitude of assumptions are made to keep the model simplistic.</p>
            <ul>
              <li>Embodied carbon values estimates rather than manufacturer-verified data. Our estimates based on the ACT⁴ model are conservative estimates relative to other frameworks. This means that the break-even times gathered here are a lower bound estimate.</li>
              <li>The scope is limited to CPUs, DRAM, and SSD/HDD. We do not include other factors such as cooling, networking, and power consumption from other overheads such as material recycling/transportation.</li>
              <li>Workloads are limited to the four benchmarks available, which may not capture all real-world scenarios.</li>
              <li>Local grid carbon intensities, utilization levels, and workloads are assumed to be static, which do not reflect the fluctuating nature of real-world scenarios.</li>
            </ul>
          </div>
        </section>
      </div>
  )
}

export default LearnMore;
