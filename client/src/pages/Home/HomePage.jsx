import Banner from '../../components/layout/Banner';
import TopIndustries from '../../components/sections/TopIndustries';
import FeaturedJobs from '../../components/sections/FeaturedJobs';
import TopCompanies from '../../components/sections/TopCompanies';
import WhyChooseUs from '../../components/sections/WhyChooseUs';

export default function HomePage() {
    return (
        <div>
            <Banner />
            <TopIndustries />
            <FeaturedJobs />
            <TopCompanies />
            <WhyChooseUs />
        </div>
    );
}

