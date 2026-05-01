/** Static copy for the guided tutorial panel (advance with Next). */
export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    body:
      'This is a safe place to learn and practice the game. You can view **card details**, **Abilities**, and **Rules** in the **top right** of the page.',
  },
  {
    id: 'turn',
    title: 'Your turn',
    body: 'Click **Start turn** to gain evolution points (+2, up to 20). Then use **Draw** — on your first turn you can draw a larger opening hand; after that you draw one card per turn (max 8 in hand).',
  },
  {
    id: 'play',
    title: 'Play cards',
    body: 'Select a card in your hand, then **Play selected** to put characters on your field or an economy card in your economy slot. Playing costs **evolution points** equal to the card’s play cost (top-right).',
  },
  {
    id: 'attack',
    title: 'Attack',
    body: 'Characters with **power** can be selected for **Attack**. Confirm with the Attack button to deal that damage to the opponent’s **health** (dice track). Reduce their health to 0 to win.',
  },
  {
    id: 'evolve',
    title: 'Evolve',
    body: 'Use **Target** and **Burn** in the sidebar, then **Evolve** to combine two cards. Open **Evolve** in the header anytime for the full rules.',
  },
  {
    id: 'done',
    title: 'Ready to play',
    body: 'Use **Rules** and **Abilities** in the header for reference. When you’re done, click **Exit tutorial** (top right) to return to the start screen — or **Join match** for a real opponent.',
  },
];
