const parseHHLanguages = (languages: string | undefined) => {
  if (!languages) return [];
  return languages.split(",");
};

export default parseHHLanguages;
