export const REGISTER_FOR = [
  {label: 'For myself', icon: '🙋'},
  {label: 'For my son', icon: '👦', gender: 'Male'},
  {label: 'For my daughter', icon: '👧', gender: 'Female'},
  {label: 'For my brother', icon: '👦', gender: 'Male'},
  {label: 'For my sister', icon: '👧', gender: 'Female'},
  {label: 'For a relative', icon: '👨‍👩‍👧'},
];

export const GENDERS = ['Male', 'Female'];

export const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Jain', 'Buddhist', 'Other'];

export const MOTHER_TONGUES = ['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'Other'];

export const MARITAL = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

export const EDUCATION = ['10th / SSLC', '12th / HSC', 'Diploma', 'UG Degree', 'PG Degree', 'Doctorate (PhD)', 'Other'];

export const PROFESSIONS = [
  'Software / IT',
  'Doctor',
  'Engineer',
  'Teacher / Academic',
  'Govt. Employee',
  'Business Owner',
  'Lawyer',
  'Chartered Accountant',
  'Agriculture',
  'Student',
  'Other',
];

export const INCOMES = ['Prefer not to say', 'Below 3 LPA', '3–6 LPA', '6–10 LPA', '10–15 LPA', '15–25 LPA', '25 LPA+'];

export const MONTHS = [
  {value: '01', label: 'January'},
  {value: '02', label: 'February'},
  {value: '03', label: 'March'},
  {value: '04', label: 'April'},
  {value: '05', label: 'May'},
  {value: '06', label: 'June'},
  {value: '07', label: 'July'},
  {value: '08', label: 'August'},
  {value: '09', label: 'September'},
  {value: '10', label: 'October'},
  {value: '11', label: 'November'},
  {value: '12', label: 'December'},
];

export const FT_HEIGHTS = [
  "Below 4'0\"",
  "4'0\" - 122 cm",
  "4'1\" - 124 cm",
  "4'2\" - 127 cm",
  "4'3\" - 129 cm",
  "4'4\" - 132 cm",
  "4'5\" - 134 cm",
  "4'6\" - 137 cm",
  "4'7\" - 139 cm",
  "4'8\" - 142 cm",
  "4'9\" - 144 cm",
  "4'10\" - 147 cm",
  "4'11\" - 149 cm",
  "5'0\" - 152 cm",
  "5'1\" - 154 cm",
  "5'2\" - 157 cm",
  "5'3\" - 160 cm",
  "5'4\" - 162 cm",
  "5'5\" - 165 cm",
  "5'6\" - 167 cm",
  "5'7\" - 170 cm",
  "5'8\" - 172 cm",
  "5'9\" - 175 cm",
  "5'10\" - 177 cm",
  "5'11\" - 180 cm",
  "6'0\" - 182 cm",
  "6'1\" - 185 cm",
  "6'2\" - 187 cm",
  "6'3\" - 190 cm",
  "6'4\" - 193 cm",
  "6'5\" - 195 cm",
  "Above 6'5\"",
];

export const CM_HEIGHTS = [
  'Below 135 cm',
  "135 cm (4'5\")",
  "137 cm (4'6\")",
  "140 cm (4'7\")",
  "142 cm (4'8\")",
  "145 cm (4'9\")",
  "147 cm (4'10\")",
  "150 cm (4'11\")",
  "152 cm (5'0\")",
  "155 cm (5'1\")",
  "157 cm (5'2\")",
  "160 cm (5'3\")",
  "162 cm (5'4\")",
  "165 cm (5'5\")",
  "167 cm (5'6\")",
  "170 cm (5'7\")",
  "172 cm (5'8\")",
  "175 cm (5'9\")",
  "177 cm (5'10\")",
  "180 cm (5'11\")",
  "182 cm (6'0\")",
  "185 cm (6'1\")",
  "187 cm (6'2\")",
  "190 cm (6'3\")",
  "193 cm (6'4\")",
  "195 cm (6'5\")",
  'Above 195 cm',
];

export const WHY_REGISTER = [
  {
    title: 'Full control',
    body: 'Every field is yours to fill. Tell your story exactly as you want it told.',
  },
  {
    title: 'Tamil & English',
    body: 'Registration is available in both Tamil and English.',
  },
  {
    title: 'Family-assisted',
    body: 'Parents or siblings can help fill in the form together.',
  },
  {
    title: 'Verified within 24 hrs',
    body: 'Once submitted, the validation team reviews your credentials within 24 hours.',
  },
];

export function birthYears() {
  const latest = new Date().getFullYear() - 18;
  return Array.from({length: 63}, (_, index) => String(latest - index));
}

export function daysInMonth(year: string, month: string) {
  if (!year || !month) {
    return 31;
  }
  return new Date(Number(year), Number(month), 0).getDate();
}
