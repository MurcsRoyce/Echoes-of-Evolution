import EconomyCard from './EconomyCard';

/** Browse / preview only — same layout as economy cards, distinct styling. */
export default function RaceCard(props) {
  return <EconomyCard {...props} rootClassName="economy-card--race" />;
}
