import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import GoldPrice from '../components/GoldPrice';
import About from '../components/About';
import Outlets from '../components/Outlets';
import Footer from '../components/Footer';

export default function Home({ banners, prices, outlets, companyInfo, settingsLoading, liveStatus, onRefresh }) {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors duration-300">
      <Navbar companyInfo={companyInfo} />
      <HeroBanner banners={banners} isLoading={settingsLoading} />
      <GoldPrice prices={prices} liveStatus={liveStatus} onRefresh={onRefresh} companyInfo={companyInfo} />
      <About outlets={outlets} />
      <Outlets outlets={outlets} mapEmbedUrl={companyInfo?.outletsMapEmbedUrl} />
      <Footer companyInfo={companyInfo} outlets={outlets} />
    </div>
  );
}
