import { useSettings } from '../context/SettingsContext';
import Hero from '../components/home/Hero';
import PageStack from '../components/home/PageStack';
import Promises from '../components/home/Promises';
import CategoryShowcase from '../components/home/CategoryShowcase';
import Bestsellers from '../components/home/Bestsellers';
import BrandStory from '../components/home/BrandStory';
import NewArrivals from '../components/home/NewArrivals';
import GenderSplit from '../components/home/GenderSplit';
import SocialCTA from '../components/home/SocialCTA';
import { Loader } from '../components/ui/Loader';
import RichText from '../components/ui/RichText';

// Every section on this page is driven by data from the API / admin panel
export default function Home() {
  const { settings, categories, loading } = useSettings();
  if (loading || !settings) return <Loader />;

  // which sections show, and their headings, come from /admin/settings → Homepage sections
  const sections = settings.content.sections;
  const showTop = sections.promises.show || sections.categories.show;

  // each child of PageStack is one "page" that slides up over the previous one
  return (
    <PageStack>
      <Hero />
      {sections.genderSplit.show && <GenderSplit content={sections.genderSplit} />}
      {showTop && (
        <>
          {sections.promises.show && <Promises items={settings.promises} />}
          {sections.categories.show && <CategoryShowcase categories={categories} content={sections.categories} />}
        </>
      )}
      {sections.bestsellers.show && (
        <Bestsellers eyebrow={sections.bestsellers.eyebrow} title={<RichText text={sections.bestsellers.title} />} />
      )}
      {sections.story.show && <BrandStory story={settings.story} />}
      {sections.newArrivals.show && <NewArrivals content={sections.newArrivals} />}
      {sections.social.show && <SocialCTA settings={settings} content={sections.social} />}
    </PageStack>
  );
}
