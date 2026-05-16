export const QUESTION_TYPES = [
  { value: 'mcq-single', label: 'MCQ (Single Answer)' },
  { value: 'mcq-multiple', label: 'MCQ (Multiple Answers)' },
  { value: 'true-false', label: 'True / False' },
  { value: 'coding', label: 'Coding' },
  { value: 'debugging', label: 'Debugging' },
  { value: 'output-prediction', label: 'Output Prediction' },
  { value: 'subjective', label: 'Subjective' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
];

export const CATEGORIES = ['Arrays', 'Pointers', 'Functions', 'Loops', 'Structures', 'Strings', 'Recursion', 'Dynamic Memory', 'File Handling', 'General'];
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const ROUNDS = ['Prelims', 'Finals', 'Both'];
export const TEAM_STATUSES = ['pending', 'approved', 'rejected', 'locked'];

export const STATUS_COLORS = {
  pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', locked: 'badge-danger',
};

export const PRIORITY_COLORS = {
  high: 'badge-danger', normal: 'badge-info', low: 'badge-neutral',
};
