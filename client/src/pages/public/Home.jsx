import Navbar from '../../components/home/Navbar.jsx';
import Hero from '../../components/home/Hero.jsx';
import About from '../../components/home/About.jsx';
import Features from '../../components/home/Features.jsx';
import Announcements from '../../components/home/Announcements.jsx';
import Footer from '../../components/home/Footer.jsx';

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <Announcements />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
