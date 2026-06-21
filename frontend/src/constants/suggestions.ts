export type CorpusSuggestion = {
  /** Short label shown on the bubble */
  label: string
  /** Full text inserted into the input when selected */
  text: string
}

/** Per-corpus starter prompts — phrases chosen to compress well against each corpus. */
export const CORPUS_SUGGESTIONS: Record<string, CorpusSuggestion[]> = {
  'tiny-shakespeare': [
    {
      label: 'What is a city',
      text: 'What is a city but the people?',
    },
    {
      label: 'O Romeo:',
      text: 'O Romeo, Romeo! wherefore art thou Romeo',
    },
  ],
  'movie-quotes': [
    {
      label: 'I am the senate!',
      text: 'I am the senate!',
    },
    {
      label: 'I wish I knew',
      text: 'I wish I knew how to quit you.',
    },
    {
      label: 'Did you ever hear',
      text:
        "Did you ever hear the tragedy of Darth Plagueis The Wise? I thought not. It's not a story the Jedi would tell you.",
    },
  ],
  'vc-glossary': [
    {
      label: 'Syndicate',
      text: 'Syndicate | A group of investors co-investing together in a deal, typically led by an experienced angel or fund through an SPV.',
    },
    {
      label: 'Pro-rata Rights',
      text: 'Pro-rata Rights | The right of an existing investor to participate in future rounds at their proportional ownership level, maintaining their percentage.',
    },
    {
      label: 'Waterfall',
      text: 'Waterfall | The order in which proceeds are distributed in a fund exit or company sale.',
    },
  ],
  copypasta: [
    {
      label: 'His palms are sweaty',
      text: "His palms are sweaty, life's bleak, child is heavy.",
    },
    {
      label: 'Listen up you',
      text: 'Listen up you fcking dweebs, this is a WAKE UP CALL',
    },
    {
      label: 'NA ULT LUL',
      text: 'NA ULT LUL',
    },
  ],
  'tech-twitter': [
    {
      label: 'AI won\'t replace',
      text: "AI won't replace developers. It'll replace developers who don't use ChatGPT.",
    },
    {
      label: 'The real 10x',
      text: 'The real 10x engineer uses Vim and refuses to explain why.',
    },
    {
      label: 'We don\'t need another',
      text: "We don't need another AI app. We need fewer meetings about AI.",
    },
  ],
  'sports-commentary': [
    {
      label: 'VAR check',
      text: 'VAR check in progress — the stadium falls silent.',
    },
    {
      label: 'Winner in stoppage',
      text: 'Winner in stoppage time! Absolute scenes at the final whistle.',
    },
    {
      label: 'Full-time whistle',
      text: "Full-time whistle. A dramatic finish — both sides will feel they could've done more.",
    },
  ],
}

export function suggestionsForCorpus(corpusId: string): CorpusSuggestion[] {
  return CORPUS_SUGGESTIONS[corpusId] ?? []
}
