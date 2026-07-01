import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import GoldPrice from '../components/GoldPrice';
import About from '../components/About';
import Outlets from '../components/Outlets';
import Footer from '../components/Footer';

export default function Home({ banners, prices, outlets, companyInfo }) {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar companyInfo={companyInfo} />
      <HeroBanner banners={banners} />
      <GoldPrice prices={prices} />
      <About />
      <Outlets outlets={outlets} />
      <Footer companyInfo={companyInfo} outlets={outlets} />
    </div>
  );
}
