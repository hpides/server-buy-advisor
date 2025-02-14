import hpiLogo from './assets/hpi_logo.svg';
import desLogo from './assets/des_logo.png';
import './style.css'
import Compare from './partials/Compare';
import BenchmarkSettings from './partials/BenchmarkSettings';
import BenchmarkEvaluations from './partials/BenchmarkEvaluations';

type SectionsProps = {
  title: string;
  markup: React.ReactNode;
};

const Sections: React.FC<SectionsProps> = ({ title, markup }) => {
  return (
    <>
      <section>
        <div className='w-full flex items-center gap-4'>
          <h2 className='text-2xl'>{title}</h2>
          <hr className='border-t-[#AF313A] grow border-t-2 border-r-full' />
        </div>
        {markup}
      </section>
    </>
  );
};

function App() {

  return (
    <>
      <header className='h-24 p-4 flex gap-4'>
        <img src={hpiLogo} className='h-full' />
        <img src={desLogo} className='h-full' />
      </header>
      <main className='w-full md:w-2/3 max-w-[2000px] mx-auto relative flex flex-col gap-8'>
        <section>
          <h1 className='text-3xl text-center'>Ecological Efficiency in Database Server Lifecycles</h1>
          <p className='text-cyan-700 underline underline-offset-2 text-xl text-center'>
            <a
              href='https://hpi.de/rabl/news/2024/paper-on-ecological-efficiency-of-database-servers-accepted-at-cidr-2025.html'
              target='_blank'
            >Read Paper</a>
          </p>
        </section>
        <Sections title='Compare' markup={<Compare />} />
        <Sections title='Benchmark settings' markup={<BenchmarkSettings />} />
        <Sections title='Evaluated Benchmarks' markup={<BenchmarkEvaluations />} />
      </main>
      <footer className='w-full flex flex-col py-10 items-center gap-3 bg-[#CE682A] text-white mt-24 bottom-0'>
        <div className='w-full md:w-2/3 max-w-[2000px] text-xl flex flex-col gap-2'>
          <p className='hover:underline w-fit'>
            <a href='https://hpi.de/'>
              Hasso Plattner Institute
            </a>
          </p>
          <p className='hover:underline w-fit'>
            <a href='https://hpi.de/rabl/home.html'>
              Data Engineering Systems Group
            </a>
          </p>
          <p className='hover:underline w-fit'>
            <a href='https://hpi.de/rabl/news/2024/paper-on-ecological-efficiency-of-database-servers-accepted-at-cidr-2025.html'>Read Paper</a>
          </p>
        </div>
        <p className='text-center font-extralight'>© Copyright Hasso-Plattner-Institut 2025</p>
      </footer>
    </>
  )
}

export default App
