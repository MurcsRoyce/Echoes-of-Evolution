import { DOCTOR_DESIGN } from '../data/occupations/doctor';
import CharacterCard from './CharacterCard';
import './DoctorDesignPanel.css';

export default function DoctorDesignPanel() {
  const { name, icon, theme, strengths, weakness, riskAxis, quote, baseCharacters } = DOCTOR_DESIGN;

  return (
    <section className="doctor-design">
      <header className="doctor-design__header">
        <h2 className="doctor-design__title">{icon} {name}</h2>
        <p className="doctor-design__subtitle">Occupation design — base character cards</p>
      </header>

      <div className="doctor-design__identity">
        <h3 className="doctor-design__section-title">Core identity</h3>
        <dl className="doctor-design__dl">
          <dt>Theme</dt>
          <dd>{theme}</dd>
          <dt>Strengths</dt>
          <dd>{strengths}</dd>
          <dt>Weakness</dt>
          <dd>{weakness}</dd>
          <dt>Risk axis</dt>
          <dd>{riskAxis}</dd>
        </dl>
        <blockquote className="doctor-design__quote">{quote}</blockquote>
      </div>

      <div className="doctor-design__cards">
        <h3 className="doctor-design__section-title">Base character cards (6)</h3>
        <div className="doctor-design__grid">
          {baseCharacters.map((char) => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </div>
      </div>
    </section>
  );
}
