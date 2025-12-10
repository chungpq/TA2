export interface VocabularyItem {
  word: string;
  pronunciation: string;
  type: string;
  meaning: string;
}

export interface QuestionItem {
  question?: string;
  correct_answer: string;
  options?: string[];
  note?: string;
  answer?: string; // For matching pairs
}

export interface MatchingPair {
  question: string;
  answer: string;
}

export interface Exercise {
  id: string;
  instruction: string;
  type: 'conjugation' | 'rewrite' | 'fill_in_blank' | 'multiple_choice' | 'rearrange' | 'matching' | 'phonetics_odd_one_out' | 'cloze_test';
  items?: QuestionItem[];
  pairs?: MatchingPair[]; // For matching type
  topic?: string;
  text?: string; // For cloze test
}

export interface Section {
  section_type: 'vocabulary' | 'grammar_exercises' | 'test';
  title?: string;
  test_name?: string;
  topic?: string;
  items?: VocabularyItem[]; // For vocabulary section
  exercises?: Exercise[]; // For grammar section
  questions?: Exercise[]; // For test section (using Exercise structure for individual test parts)
}

export interface UnitInfo {
  unit_number: number;
  unit_title: string;
  grade_level: number;
  description: string;
}

export interface UnitData {
  unit_info: UnitInfo;
  content: Section[];
}

export interface UserProgress {
  xp: number;
  completedSections: string[]; // IDs of completed exercises/tests
  scores: Record<string, number>; // ID -> Score (0-100)
  difficultWords?: string[]; // Array of words marked as difficult
}