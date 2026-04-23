const isYouTubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
  return pattern.test(String(url || ""));
};

module.exports = {
  isYouTubeUrl
};
