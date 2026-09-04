export const chapter6 = {
  id: 'chapter-6',
  title: 'Acids, Bases and Salts',
  description: 'Understand the role of water, pH values, strength of acids/alkalis, and the preparation of salts.',
  emoji: '🧪',
  color: '#4f46e5',
  bg: '#eef2ff',
  topics: [
    {
      id: '6-1',
      title: '6.1 Role of Water in Showing Acidic and Alkaline Properties',
      estimatedTime: '15 min',
      difficulty: 'Easy',
      content: `
# The Role of Water

Acids and alkalis only show their properties in the presence of **water**. Why is this?

When an acid is dissolved in water, it ionises to produce **hydrogen ions**, $H^+$. The presence of $H^+$ ions allows the acid to show its acidic properties. 

### Without Water
For example, glacial ethanoic acid (pure ethanoic acid without water) does **not** change the colour of blue litmus paper. It exists as molecules.

### With Water
When water is added to glacial ethanoic acid, it ionises:
$$ CH_3COOH(aq) \rightleftharpoons CH_3COO^-(aq) + H^+(aq) $$

The $H^+$ ions produced cause the blue litmus paper to turn red, proving the acidic properties!

> [!TIP]
> **Key Concept:** Water is essential for the ionisation of acids and alkalis. Without water, they remain as neutral molecules and do not exhibit acidic or alkaline properties.
      `,
    },
    {
      id: '6-2',
      title: '6.2 pH Value',
      estimatedTime: '20 min',
      difficulty: 'Medium',
      content: `
# Understanding pH Value

The pH scale is used to indicate the degree of acidity or alkalinity of an aqueous solution. It ranges from 0 to 14.

- **pH < 7**: Acidic solution (higher concentration of $H^+$)
- **pH = 7**: Neutral solution
- **pH > 7**: Alkaline solution (higher concentration of $OH^-$)

### Calculating pH
The pH value is a logarithmic measure of the hydrogen ion concentration:
$$ pH = -\log_{10}[H^+] $$

Similarly, for alkalis, we calculate pOH first, then find pH:
$$ pOH = -\log_{10}[OH^-] $$
$$ pH + pOH = 14 $$

> [!IMPORTANT]
> A change of 1 unit on the pH scale represents a 10-fold change in the concentration of $H^+$ ions!
      `,
    },
    {
      id: '6-3',
      title: '6.3 Strength of Acids and Alkalis',
      estimatedTime: '15 min',
      difficulty: 'Medium',
      content: `
# Strong vs Weak Acids

The strength of an acid or alkali depends on its **degree of dissociation (ionisation)** in water.

### Strong Acids
A strong acid **ionises completely** in water to produce a high concentration of hydrogen ions.
*Example: Hydrochloric acid (HCl), Sulphuric acid (H₂SO₄), Nitric acid (HNO₃)*

### Weak Acids
A weak acid **ionises partially** in water to produce a low concentration of hydrogen ions.
*Example: Ethanoic acid (CH₃COOH)*

> [!CAUTION]
> Do not confuse **strength** with **concentration**. Strength is about how much the acid ionises, while concentration is about how much acid is dissolved in a given volume of water!
      `,
    },
    // The rest of the topics (6.4 to 6.11) are stubbed out for now to ensure the file isn't overwhelmingly large
    {
      id: '6-4',
      title: '6.4 Chemical Properties of Acids and Alkalis',
      estimatedTime: '25 min',
      difficulty: 'Hard',
      content: `# Chemical Properties\n\nAcids react with bases, metals, and metal carbonates. Alkalis react with acids, metal ions, and ammonium salts.`,
    },
    {
      id: '6-5',
      title: '6.5 Concentration of Aqueous Solution',
      estimatedTime: '15 min',
      difficulty: 'Medium',
      content: `# Concentration\n\nConcentration can be measured in $g\\,dm^{-3}$ or $mol\\,dm^{-3}$ (molarity).`,
    },
    {
      id: '6-6',
      title: '6.6 Standard Solution',
      estimatedTime: '20 min',
      difficulty: 'Hard',
      content: `# Standard Solution\n\nA standard solution is a solution whose concentration is accurately known. Prepared using a volumetric flask.`,
    },
    {
      id: '6-7',
      title: '6.7 Neutralisation',
      estimatedTime: '25 min',
      difficulty: 'Medium',
      content: `# Neutralisation\n\nThe reaction between an acid and a base to form salt and water only. $H^+ + OH^- \\rightarrow H_2O$`,
    },
    {
      id: '6-8',
      title: '6.8 Salts, Crystals and Their Uses',
      estimatedTime: '15 min',
      difficulty: 'Easy',
      content: `# Salts and Crystals\n\nA salt is an ionic compound formed when the hydrogen ion of an acid is replaced by a metal ion or ammonium ion.`,
    },
    {
      id: '6-9',
      title: '6.9 Preparation of Salts',
      estimatedTime: '30 min',
      difficulty: 'Hard',
      content: `# Preparation of Salts\n\nSoluble salts (SPA and non-SPA) and insoluble salts (precipitation method).`,
    },
    {
      id: '6-10',
      title: '6.10 Effect of Heat on Salts',
      estimatedTime: '20 min',
      difficulty: 'Medium',
      content: `# Effect of Heat\n\nCarbonate salts decompose to form metal oxides and carbon dioxide. Nitrate salts decompose to form metal oxides, nitrogen dioxide, and oxygen.`,
    },
    {
      id: '6-11',
      title: '6.11 Qualitative Analysis',
      estimatedTime: '35 min',
      difficulty: 'Hard',
      content: `# Qualitative Analysis\n\nIdentifying cations, anions, and gases through chemical tests.`,
    }
  ]
};
