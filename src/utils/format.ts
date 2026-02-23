export const formatBytes = (b) =>
  b > 1048576
    ? `${(b / 1048576).toFixed(1)} MB`
    : `${(b / 1024).toFixed(0)} KB`;
