import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import GoldPrice from '../components/GoldPrice';
import About from '../components/About';
import Outlets from '../components/Outlets';
import Footer from '../components/Footer';

export default function Home({ banners, prices, outlets, companyInfo, liveStatus, onRefresh }) {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors duration-300">
      <Navbar companyInfo={companyInfo} />
      <HeroBanner banners={banners} />
      <GoldPrice prices={prices} liveStatus={liveStatus} onRefresh={onRefresh} />
      <About />
      <Outlets outlets={outlets} />
      <Footer companyInfo={companyInfo} outlets={outlets} />
    </div>
  );
}
