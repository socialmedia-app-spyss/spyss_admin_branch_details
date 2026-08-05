export const weekdayVasaraPairs = [
  { weekday: "ಭಾನುವಾರ", vasara: "ರವಿವಾಸರ" },
  { weekday: "ಸೋಮವಾರ", vasara: "ಇಂದುವಾಸರ" },
  { weekday: "ಮಂಗಳವಾರ", vasara: "ಭೌಮವಾಸರ" },
  { weekday: "ಬುಧವಾರ", vasara: "ಸೌಮ್ಯವಾಸರ" },
  { weekday: "ಗುರುವಾರ", vasara: "ಬೃಹಸ್ಪತಿವಾಸರ" },
  { weekday: "ಶುಕ್ರವಾರ", vasara: "ಭಾರ್ಗವವಾಸರ" },
  { weekday: "ಶನಿವಾರ", vasara: "ಸ್ಥಿರವಾಸರ" },
] as const;

export const getWeekdayVasaraForDate = (date: string | null | undefined) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? "");
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const selectedDate = new Date(year, month - 1, day);

  if (
    selectedDate.getFullYear() !== year ||
    selectedDate.getMonth() !== month - 1 ||
    selectedDate.getDate() !== day
  ) return null;

  return weekdayVasaraPairs[selectedDate.getDay()];
};

export const panchangaOptions = {
  samvatsara: ["ಪರಾಭವ", "ಪ್ಲವಂಗ", "ಕೀಲಕ", "ಸೌಮ್ಯ", "ಸಾಧಾರಣ"],
  ayana: ["ಉತ್ತರಾಯಣ", "ದಕ್ಷಿಣಾಯಣ"],
  rutu: ["ವಸಂತ", "ಗ್ರೀಷ್ಮ", "ವರ್ಷ", "ಶರದ್", "ಹೇಮಂತ", "ಶಿಶಿರ"],
  masa: ["ಚೈತ್ರ", "ವೈಶಾಖ", "ಜ್ಯೇಷ್ಠ", "ಆಷಾಢ", "ಶ್ರಾವಣ", "ಭಾದ್ರಪದ", "ಆಶ್ವಯುಜ", "ಕಾರ್ತಿಕ", "ಮಾರ್ಗಶಿರ", "ಪುಷ್ಯ", "ಮಾಘ", "ಫಾಲ್ಗುಣ"],
  paksha: ["ಶುಕ್ಲ", "ಕೃಷ್ಣ"],
  tithi: ["ಪ್ರತಿಪದ", "ದ್ವಿತೀಯ", "ತೃಥಿಯಾ", "ಚತುರ್ಥಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಹುಣ್ಣಿಮೆ", "ಅಮಾವಾಸ್ಯೆ"],
  vasara: weekdayVasaraPairs.map(({ vasara }) => vasara),
  weekday: weekdayVasaraPairs.map(({ weekday }) => weekday),
  nakshatra: ["ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರ", "ಆರ್ದ್ರಾ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷ", "ಮಖಾ", "ಪೂರ್ವ ಫಲ್ಗುಣಿ", "ಉತ್ತರ ಫಲ್ಗುಣಿ", "ಹಸ್ತ", "ಚಿತ್ತಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖ", "ಅನುರಾಧ", "ಜ್ಯೇಷ್ಠ", "ಮೂಲ", "ಪೂರ್ವಾಷಾಢ", "ಉತ್ತರಾಷಾಢ", "ಶ್ರವಣ", "ಧನಿಷ್ಠ", "ಶತಭಿಷ", "ಪೂರ್ವಾಭಾದ್ರಪದ", "ಉತ್ತರಾಭಾದ್ರಪದ", "ರೇವತಿ"],
  yoga: ["ವಿಷ್ಕಂಭ", "ಪ್ರೀತಿ", "ಆಯುಷ್ಮಾನ್", "ಸೌಭಾಗ್ಯ", "ಶೋಭನ", "ಅತಿಗಂಡ", "ಸುಕರ್ಮ", "ಧೃತಿ", "ಶೂಲ", "ಗಂಡ", "ವೃದ್ಧಿ", "ಧ್ರುವ", "ವ್ಯಾಘಾತ", "ಹರ್ಷಣ", "ವಜ್ರ", "ಸಿದ್ಧಿ", "ವ್ಯತೀಪಾತ", "ವರೀಯಾನ್", "ಪರಿಘ", "ಶಿವ", "ಸಿದ್ಧ", "ಸಾಧ್ಯ", "ಶುಭ", "ಶುಕ್ಲ", "ಬ್ರಹ್ಮ", "ಇಂದ್ರ", "ವೈಧೃತಿ"],
  karana: ["ಬವ", "ಬಾಲವ", "ಕೌಲವ", "ತೈತಿಲ", "ಗರಜ", "ವಣಿಜ", "ಭದ್ರಾ", "ಶಕುನಿ", "ಚತುಷ್ಪಾದ", "ನಾಗ", "ಕಿಂಸ್ತುಘ್ನ"],
} as const;
