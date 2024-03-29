import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

async function jestConfig() {
  const nextJestConfig = await createJestConfig({
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['./jest.setup.js']
  })()
  nextJestConfig.transformIgnorePatterns[0] = '/node_modules/(?!chess\.js)/'

  return nextJestConfig
}

export default jestConfig;