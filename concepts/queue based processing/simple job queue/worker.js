const executeJob = (job) => {
  // simulate the job execution
  const resolveTime = Math.floor(Math.random() * 5000) + 2000;
  return new Promise((resolve, _) =>
    setTimeout(() => resolve(`${resolveTime}`), resolveTime)
  );
};

module.exports = { executeJob };
