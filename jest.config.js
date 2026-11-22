export default {
	transform: {},
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/**/*.test.js'],
	testTimeout: 30000,
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.js'],
	coverageDirectory: 'coverage'
};
