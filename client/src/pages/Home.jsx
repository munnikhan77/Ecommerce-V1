import { useSettings } from '../context/SettingsContext';
import Hero from '../components/home/Hero';
import Promises from '../components/home/Promises';
import CategoryShowcase from '../components/home/CategoryShowcase';
import ProductSection from '../components/home/ProductSection';
import BrandStory from '../components/home/BrandStory';
import SocialCTA from '../components/home/SocialCTA';
import { Loader } from '../components/ui/Loader';

// Every section on this page is driven by data from the API / admin panel
export default function Home() {
  const { settings, categories, loading } = useSettings();
  if (loading || !settings) return <Loader />;

  return (
    <>
      <Hero slides={settings.heroSlides} />
      <Promises items={settings.promises} />
      <CategoryShowcase categories={categories} />
      <ProductSection
        eyebrow="Most Loved"
        title={<>Our <em>bestsellers</em></>}
        query={{ featured: true, limit: 4 }}
        tinted
      />
      <BrandStory story={settings.story} />
      <ProductSection eyebrow="Just In" title="New arrivals" query={{ isNew: true, sort: 'newest', limit: 4 }} link="/shop?sort=newest" />
      <SocialCTA settings={settings} />
    </>
  );
}
