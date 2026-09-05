import { GeneratedMCQ, GeneratedStructuredQuestion } from './ai-gateway';

export interface KSSMSubtopic {
  id: string;
  code: string; // e.g. '6.1', '8.2'
  title: string;
  learningObjectives: string[];
  keyConcepts: string[];
}

export interface KSSMChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtopics: KSSMSubtopic[];
}

/**
 * Authoritative Malaysian Form 4 KSSM Chemistry Curriculum Hierarchy
 */
export const KSSM_CURRICULUM_FORM_4: Record<string, KSSMChapter> = {
  'chapter-6': {
    id: 'chapter-6',
    chapterNumber: 6,
    title: 'Acids, Bases and Salts',
    subtopics: [
      {
        id: '6-1',
        code: '6.1',
        title: 'Role of Water in Showing Acidic and Alkaline Properties',
        learningObjectives: [
          'State the meaning of acid and alkali based on Arrhenius definition',
          'Explain the role of water in showing acidic and alkaline properties',
        ],
        keyConcepts: ['hydrogen ions', 'hydroxide ions', 'dissociation', 'glacial acid', 'molecules vs ions'],
      },
      {
        id: '6-2',
        code: '6.2',
        title: 'pH Value',
        learningObjectives: [
          'Express pH as logarithmic measure of hydrogen ion concentration',
          'Calculate pH of acid and alkali solutions',
        ],
        keyConcepts: ['pH scale', 'logarithmic relationship', 'pOH', 'ion concentration'],
      },
      {
        id: '6-3',
        code: '6.3',
        title: 'Strength of Acids and Alkalis',
        learningObjectives: [
          'Differentiate between strong and weak acids based on degree of ionisation',
          'Differentiate between strong and weak alkalis based on degree of ionisation',
        ],
        keyConcepts: ['degree of ionisation', 'complete dissociation', 'partial dissociation', 'reversible reaction'],
      },
      {
        id: '6-4',
        code: '6.4',
        title: 'Chemical Properties of Acids and Alkalis',
        learningObjectives: [
          'Summarize chemical properties of acids reacting with reactive metals, bases, and carbonates',
          'Summarize chemical properties of alkalis reacting with acids, metal ions, and ammonium salts',
        ],
        keyConcepts: ['neutralisation', 'effervescence', 'precipitation', 'ammonia gas'],
      },
      {
        id: '6-5',
        code: '6.5',
        title: 'Concentration of Aqueous Solutions',
        learningObjectives: [
          'State concentration in g dm-3 and mol dm-3',
          'Convert between g dm-3 and mol dm-3 using molar mass',
        ],
        keyConcepts: ['molarity', 'solute mass', 'solution volume', 'molar mass conversion'],
      },
      {
        id: '6-6',
        code: '6.6',
        title: 'Standard Solutions',
        learningObjectives: [
          'Explain steps to prepare a standard solution by mass and by dilution',
          'Solve dilution problems using M1V1 = M2V2',
        ],
        keyConcepts: ['volumetric flask', 'dilution formula', 'standard concentration'],
      },
      {
        id: '6-7',
        code: '6.7',
        title: 'Neutralisation and Titration',
        learningObjectives: [
          'Explain neutralisation reaction writing balanced and ionic equations',
          'Carry out acid-base titration using acid-base indicator to determine end point',
        ],
        keyConcepts: ['titration curve', 'phenolphthalein', 'methyl orange', 'end point', 'stoichiometry MaVa/a = MbVb/b'],
      },
      {
        id: '6-8',
        code: '6.8',
        title: 'Salts, Crystals and Characteristics',
        learningObjectives: [
          'State the meaning of salt',
          'Classify salts based on solubility in water',
        ],
        keyConcepts: ['SPA salts (Sodium, Potassium, Ammonium)', 'nitrate solubility', 'chloride exceptions Pb/Ag/Hg', 'sulfate exceptions Ba/Ca/Pb'],
      },
      {
        id: '6-9',
        code: '6.9',
        title: 'Preparation of Soluble and Insoluble Salts',
        learningObjectives: [
          'Describe preparation of soluble salts from acid + reactive metal / base / carbonate',
          'Describe preparation of insoluble salts via double decomposition precipitation',
        ],
        keyConcepts: ['recrystallization', 'filtration', 'washing with distilled water', 'precipitation equation'],
      },
      {
        id: '6-10',
        code: '6.10',
        title: 'Effect of Heat on Salts (Qualitative Analysis)',
        learningObjectives: [
          'Describe heating effect on carbonate, nitrate, sulfate, and chloride salts',
          'Identify gases evolved (O2, CO2, NO2, NH3, SO2, Cl2)',
        ],
        keyConcepts: ['thermal decomposition', 'glowing splint', 'limewater', 'brown NO2 gas', 'residue colour hot vs cold'],
      },
      {
        id: '6-11',
        code: '6.11',
        title: 'Qualitative Analysis of Cations and Anions',
        learningObjectives: [
          'Identify cations using NaOH(aq) and NH3(aq) reagents dropwise and excess',
          'Identify anions (CO3 2-, Cl-, SO4 2-, NO3-) using confirmatory reagents',
        ],
        keyConcepts: ['amphoteric cations Al3+, Pb2+, Zn2+', 'copper blue precipitate', 'iron(II) green vs iron(III) brown', 'brown ring test'],
      },
    ],
  },
  'chapter-8': {
    id: 'chapter-8',
    chapterNumber: 8,
    title: 'Manufactured Substances in Industry',
    subtopics: [
      {
        id: '8-1',
        code: '8.1',
        title: 'Alloys and Their Importance',
        learningObjectives: [
          'Describe the composition, properties and uses of common alloys (steel, stainless steel, bronze, brass, duralumin, pewter)',
          'Explain why alloys are harder than pure metals based on atomic arrangement and disruption of slip planes',
        ],
        keyConcepts: ['foreign atoms', 'different atomic radii', 'lattice disruption', 'slip planes', 'ductility vs hardness'],
      },
      {
        id: '8-2',
        code: '8.2',
        title: 'Composition of Glass and Its Uses',
        learningObjectives: [
          'Describe properties and components of fused silica, soda-lime, borosilicate, and lead crystal glass',
          'Relate specific properties (low thermal expansion, high refractive index) to industrial uses',
        ],
        keyConcepts: ['silicon dioxide', 'boric oxide', 'thermal expansion coefficient', 'thermal shock resistance', 'refractive index'],
      },
      {
        id: '8-3',
        code: '8.3',
        title: 'Composition of Ceramics and Their Uses',
        learningObjectives: [
          'Classify ceramics into traditional and advanced ceramics',
          'Explain properties of ceramics (high melting point, electrical insulation, chemical inertness, brittleness)',
        ],
        keyConcepts: ['clay and kaolin', 'advanced ceramics: alumina and zirconia', 'directional covalent/ionic bonds', 'thermal barrier'],
      },
      {
        id: '8-4',
        code: '8.4',
        title: 'Composite Materials and Their Importance',
        learningObjectives: [
          'Explain meaning of composite material combining matrix and reinforcement',
          'Describe properties and applications of reinforced concrete, fibreglass, optical fibres, photochromic glass, and superconductors',
        ],
        keyConcepts: ['matrix phase', 'reinforcing phase', 'compression vs tension', 'Meissner effect', 'total internal reflection'],
      },
    ],
  },
};

/**
 * Validates whether a topic code, ID, or name belongs to the official KSSM Form 4 Chemistry syllabus.
 */
export function isValidKSSMTopic(topic: string): boolean {
  if (!topic || typeof topic !== 'string') return false;
  const t = topic.toLowerCase().trim();

  for (const chapter of Object.values(KSSM_CURRICULUM_FORM_4)) {
    if (t === chapter.id.toLowerCase() || t.includes(chapter.title.toLowerCase())) {
      return true;
    }
    for (const sub of chapter.subtopics) {
      if (
        t === sub.id.toLowerCase() ||
        t === sub.code.toLowerCase() ||
        t.includes(sub.title.toLowerCase()) ||
        sub.title.toLowerCase().includes(t)
      ) {
        return true;
      }
    }
  }

  // Check common chapter numbers
  if (t === '6' || t === '8' || t === 'chapter 6' || t === 'chapter 8') return true;

  return false;
}

/**
 * Returns the authoritative learning objectives and concepts for a given chapter/topic to ground Gemini prompt generation.
 */
export function getAuthoritativeCurriculumScope(query: string): string | null {
  const q = query.toLowerCase().trim();

  for (const chapter of Object.values(KSSM_CURRICULUM_FORM_4)) {
    for (const sub of chapter.subtopics) {
      if (
        q.includes(sub.code.toLowerCase()) ||
        q.includes(sub.id.toLowerCase()) ||
        sub.title.toLowerCase().includes(q)
      ) {
        return `KSSM Chemistry Form 4 [Chapter ${chapter.chapterNumber}: ${sub.title}]\nLearning Objectives:\n- ${sub.learningObjectives.join('\n- ')}\nKey Concepts: ${sub.keyConcepts.join(', ')}`;
      }
    }
  }

  return null;
}

/**
 * Automated validation for generated MCQs.
 * Ensures pedagogical soundness, option uniqueness, valid answer index, and curriculum alignment.
 */
export function validateGeneratedMCQ(
  mcq: GeneratedMCQ,
  expectedTopic?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Check option count
  if (!Array.isArray(mcq.options) || mcq.options.length !== 4) {
    errors.push('MCQ must contain exactly 4 options.');
  }

  // 2. Check option uniqueness
  if (mcq.options && Array.isArray(mcq.options)) {
    const cleanOpts = mcq.options.map((o) => o.trim().toLowerCase());
    const unique = new Set(cleanOpts);
    if (unique.size !== 4) {
      errors.push('MCQ options must be distinct (found duplicates).');
    }
    if (cleanOpts.some((o) => o.length === 0)) {
      errors.push('MCQ options cannot be empty.');
    }
  }

  // 3. Check answer index
  if (typeof mcq.answer !== 'number' || mcq.answer < 0 || mcq.answer > 3) {
    errors.push('Answer index must be an integer between 0 and 3.');
  }

  // 4. Check explanation validity
  if (!mcq.explanation || mcq.explanation.trim().length < 5) {
    errors.push('Explanation must provide substantive pedagogical reasoning.');
  }

  // 5. Check curriculum alignment if expectedTopic is supplied
  if (expectedTopic && !isValidKSSMTopic(expectedTopic)) {
    errors.push(`Specified topic "${expectedTopic}" is not within the Malaysian KSSM Form 4 curriculum.`);
  }

  // 6. Check for hazardous chemistry synthesis keywords
  const hazardousWords = [/bomb/i, /explosive/i, /methamphetamine/i, /heroin/i, /sarin/i, /mustard gas/i];
  const combinedText = `${mcq.q} ${mcq.options?.join(' ')} ${mcq.explanation}`;
  if (hazardousWords.some((re) => re.test(combinedText))) {
    errors.push('Question content flagged for hazardous chemical synthesis.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Automated validation for generated structured SPM questions.
 */
export function validateGeneratedStructuredQuestion(
  q: GeneratedStructuredQuestion,
  expectedTopic?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!q.question || q.question.trim().length < 10) {
    errors.push('Structured question text is too short.');
  }

  if (typeof q.marks !== 'number' || q.marks < 1 || q.marks > 10) {
    errors.push('Marks must be between 1 and 10.');
  }

  if (!q.expectedAnswer || q.expectedAnswer.trim().length < 2) {
    errors.push('Expected answer must be provided.');
  }

  if (expectedTopic && !isValidKSSMTopic(expectedTopic)) {
    errors.push(`Topic "${expectedTopic}" is not within the Malaysian KSSM Form 4 curriculum.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
