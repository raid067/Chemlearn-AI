export interface SPMQuizQuestion {
  id: string;
  subtopic: '8.1' | '8.2' | '8.3' | '8.4';
  type: 'MCQ' | 'Structured';
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  marks?: number;
  expectedAnswer?: string;
  markingScheme?: string[];
}

export interface SPMQuiz {
  chapterId: string;
  chapterTitle: string;
  chapterNumber: number;
  questions: SPMQuizQuestion[];
}

export const chapter8SPMQuiz: SPMQuiz = {
  chapterId: 'chapter-8',
  chapterTitle: 'Manufactured Substances in Industry',
  chapterNumber: 8,
  questions: [
    // ── 8.1 Alloys (Questions 1 to 5) ──────────────────────────
    {
      id: 'spm-8-1',
      subtopic: '8.1',
      type: 'MCQ',
      question: 'Which of the following best explains why bronze is harder than pure copper?',
      options: [
        'Bronze has a higher melting point than pure copper',
        'Foreign tin atoms disrupt the orderly arrangement of copper atoms, preventing layers from sliding easily',
        'Copper atoms in bronze lose electrons more rapidly',
        'Bronze contains metallic bonds that are more ionic in nature',
      ],
      correctIndex: 1,
      explanation:
        'In bronze, foreign tin atoms of different size disrupt the orderly arrangement of copper atoms. This prevents layers of atoms from sliding easily over each other when force is applied.',
    },
    {
      id: 'spm-8-2',
      subtopic: '8.1',
      type: 'MCQ',
      question: 'Which alloy is primarily chosen for constructing airplane bodies due to its high strength and low density?',
      options: ['Brass', 'Pewter', 'Duralumin', 'Bronze'],
      correctIndex: 2,
      explanation:
        'Duralumin (Aluminium + Copper + Magnesium + Manganese) is lightweight yet strong, making it ideal for aircraft structures.',
    },
    {
      id: 'spm-8-3',
      subtopic: '8.1',
      type: 'Structured',
      question:
        'State the main elements present in stainless steel and explain why it is resistant to corrosion in moist air.',
      marks: 3,
      expectedAnswer:
        'Iron, carbon, chromium, and nickel. Chromium reacts with atmospheric oxygen to form a thin, impermeable, and protective chromium(III) oxide layer that prevents water and oxygen from corroding the iron.',
      markingScheme: [
        'States elements: Iron, chromium, nickel (and carbon) [1 mark]',
        'Mentions formation of protective chromium(III) oxide layer [1 mark]',
        'States oxide layer blocks oxygen and water from reaching iron underneath [1 mark]',
      ],
    },
    {
      id: 'spm-8-4',
      subtopic: '8.1',
      type: 'Structured',
      question:
        'A 1 kg weight is dropped from 50 cm onto steel ball bearings placed on a copper block and a bronze block. Compare the diameter of the dents formed and explain your answer.',
      marks: 3,
      expectedAnswer:
        'The diameter of the dent on the bronze block is smaller than that on the copper block. In bronze, foreign tin atoms disrupt the orderly arrangement of copper atoms, preventing layers of atoms from sliding easily, making bronze harder.',
      markingScheme: [
        'States dent on bronze is smaller / copper is larger [1 mark]',
        'Explains foreign tin atoms have different size from copper atoms and disrupt orderly arrangement [1 mark]',
        'States layers of atoms are prevented from sliding easily over one another [1 mark]',
      ],
    },
    {
      id: 'spm-8-5',
      subtopic: '8.1',
      type: 'MCQ',
      question: 'Pewter is an alloy consisting mostly of tin. What is its main SPM application?',
      options: [
        'Making electrical overhead transmission cables',
        'Manufacturing surgical scalpels and cutlery',
        'Crafting decorative souvenirs, trophies, and tea sets',
        'Constructing suspension bridges and railway tracks',
      ],
      correctIndex: 2,
      explanation:
        'Pewter has a lustrous silvery appearance, is malleable, and resists corrosion, making it perfect for decorative items and souvenirs.',
    },

    // ── 8.2 Glass (Questions 6 to 9) ───────────────────────────
    {
      id: 'spm-8-6',
      subtopic: '8.2',
      type: 'MCQ',
      question:
        'Which type of glass has a low thermal expansion coefficient and high chemical inertness, making it suitable for laboratory boiling tubes?',
      options: ['Soda-lime glass', 'Borosilicate glass', 'Lead crystal glass', 'Photochromic glass'],
      correctIndex: 1,
      explanation:
        'Borosilicate glass (Pyrex) contains boron oxide (B₂O₃), giving it a very low coefficient of thermal expansion and high thermal shock resistance.',
    },
    {
      id: 'spm-8-7',
      subtopic: '8.2',
      type: 'Structured',
      question:
        'Soda-lime glass is commonly used for manufacturing food jars and window panes. State the chemical substances used to manufacture soda-lime glass and state one disadvantage of this glass.',
      marks: 3,
      expectedAnswer:
        'Silica (SiO₂), sodium carbonate (Na₂CO₃), and calcium carbonate (CaCO₃). Disadvantage: It has a high thermal expansion coefficient and cracks easily when exposed to sudden temperature changes (low thermal shock resistance).',
      markingScheme: [
        'Substances: Silica, sodium carbonate, and calcium carbonate (limestone) [2 marks]',
        'Disadvantage: Cracks easily upon sudden heating/cooling / poor thermal shock resistance [1 mark]',
      ],
    },
    {
      id: 'spm-8-8',
      subtopic: '8.2',
      type: 'MCQ',
      question: 'Lead crystal glass sparkles more brilliantly than other glasses because of its:',
      options: [
        'High thermal conductivity and porosity',
        'High refractive index and high density due to lead(II) oxide',
        'Low melting point and flexible polymer matrix',
        'Ability to conduct electricity at room temperature',
      ],
      correctIndex: 1,
      explanation:
        'The addition of lead(II) oxide (PbO) gives lead crystal glass a high refractive index and high density, causing light to refract with sparkling brilliance.',
    },
    {
      id: 'spm-8-9',
      subtopic: '8.2',
      type: 'Structured',
      question:
        'Explain why fused silica glass has an extremely high melting point (~1700°C) and can withstand drastic temperature changes.',
      marks: 2,
      expectedAnswer:
        'Fused silica consists of pure silicon dioxide (SiO₂) arranged in a giant, strong tetrahedral covalent network with no modifier cations, giving it an extremely low thermal expansion coefficient and high thermal stability.',
      markingScheme: [
        'Mentions pure SiO₂ giant covalent network with strong covalent bonds [1 mark]',
        'Mentions negligible / extremely low thermal expansion coefficient giving high thermal shock resistance [1 mark]',
      ],
    },

    // ── 8.3 Ceramics (Questions 10 to 12) ──────────────────────
    {
      id: 'spm-8-10',
      subtopic: '8.3',
      type: 'MCQ',
      question: 'The primary mineral compound present in traditional clay ceramics is:',
      options: ['Bauxite', 'Kaolin', 'Haematite', 'Galena'],
      correctIndex: 1,
      explanation:
        'Kaolin (hydrated aluminium silicate, Al₂O₃·2SiO₂·2H₂O) is the fundamental natural clay mineral for traditional ceramics.',
    },
    {
      id: 'spm-8-11',
      subtopic: '8.3',
      type: 'Structured',
      question:
        'Advanced ceramics like zirconia (ZrO₂) are used for artificial bone replacements and dental crowns. State two properties that make advanced ceramics suitable for this application.',
      marks: 2,
      expectedAnswer:
        'Advanced ceramics are biocompatible (non-toxic to body tissues), chemically inert (do not corrode in bodily fluids), and have high hardness and wear resistance.',
      markingScheme: [
        'Biocompatible / chemically inert (does not corrode in bodily fluids) [1 mark]',
        'High hardness / wear resistance / high compressive strength [1 mark]',
      ],
    },
    {
      id: 'spm-8-12',
      subtopic: '8.3',
      type: 'MCQ',
      question: 'Why are ceramics selected as insulators for automobile spark plugs?',
      options: [
        'They are malleable and easily soldered to copper wires',
        'They are excellent electrical insulators that withstand high combustion temperatures without melting or corroding',
        'They react with unburnt hydrocarbons to reduce emissions',
        'They are transparent to infrared radiation',
      ],
      correctIndex: 1,
      explanation:
        'Ceramics possess very high electrical resistance and high thermal stability, preventing electrical short-circuiting across high-temperature engine spark gaps.',
    },

    // ── 8.4 Composite Materials (Questions 13 to 15) ───────────
    {
      id: 'spm-8-13',
      subtopic: '8.4',
      type: 'Structured',
      question:
        'Reinforced concrete is a composite material used in mega-structures. Identify its matrix phase and reinforcement phase, and describe how their combination overcomes the weakness of pure concrete.',
      marks: 3,
      expectedAnswer:
        'Matrix: Concrete. Reinforcement: Steel rods. Pure concrete is strong under compression but weak/brittle under tension. Steel rods provide high tensile strength, so the composite withstands both compression and tension forces.',
      markingScheme: [
        'Identifies Matrix: Concrete, Reinforcement: Steel rods [1 mark]',
        'States concrete has high compressive strength but low tensile strength [1 mark]',
        'Explains steel absorbs tensile forces, enabling reinforced concrete to withstand both compression and tension [1 mark]',
      ],
    },
    {
      id: 'spm-8-14',
      subtopic: '8.4',
      type: 'MCQ',
      question:
        'In photochromic glass, what chemical reaction causes the darkening of the glass when exposed to ultraviolet (UV) sunlight?',
      options: [
        'Reduction of Ag⁺ ions to elemental silver atoms: Ag⁺ + e⁻ → Ag',
        'Oxidation of Cu⁺ to Cu²⁺ ions',
        'Sublimation of silicon dioxide molecules',
        'Dissolution of sodium carbonate in atmospheric moisture',
      ],
      correctIndex: 0,
      explanation:
        'UV photons provide energy for the reduction of silver ions (Ag⁺ + e⁻ → Ag). The resulting fine silver metal particles absorb visible light, darkening the spectacle lens.',
    },
    {
      id: 'spm-8-15',
      subtopic: '8.4',
      type: 'Structured',
      question:
        'State the optical physics principle used by optical fibres to transmit light signals, and explain why the refractive index of the inner core (n₁) must be greater than that of the outer cladding (n₂).',
      marks: 3,
      expectedAnswer:
        'Principle: Total internal reflection. For total internal reflection to occur, light must travel from an optically denser medium to an optically less dense medium (n₁ > n₂) with an angle of incidence greater than the critical angle.',
      markingScheme: [
        'Identifies principle: Total internal reflection [1 mark]',
        'Explains light travels from optically denser core to less dense cladding (n₁ > n₂) [1 mark]',
        'States angle of incidence exceeds critical angle, trapping light inside the core [1 mark]',
      ],
    },
  ],
};
