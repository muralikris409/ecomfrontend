module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['./jest.setup.js'], // Assuming you have the localStorage mock here
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx'],
  };
  