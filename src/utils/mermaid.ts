const generateMermaidConfig = (config: Record<string, unknown>) => {
  const json = JSON.stringify(config, null, 2);
  return `%%{init: ${json}}%%\n`;
};

export { generateMermaidConfig };
