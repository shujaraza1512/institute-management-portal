import { ABOUT_TEXT, STATS } from '../../constants/siteContent.js';

function About() {
  return (
    <section id="about" className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-display text-navy-800">About the Institute</h2>
          <p className="mt-4 text-muted">{ABOUT_TEXT}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="text-2xl md:text-3xl font-display text-navy-700">{stat.value}</p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
