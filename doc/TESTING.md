# Testing
 This document explains project's testing strategy, including why we write tests and what is our goals are in testing and the tooling library used to write the test cases

## Content
- [Different kind of tests](#different-kind-of-tests)
- [Why Do We Write Tests](#why-do-we-write-tests)
- [Our Goal in Testing](#our-goal-in-testing)
- [TDD (Test-driven development)](#tdd-test-driven-development)
- [Tooling](#tooling---testing-libraries-installed)
- [How to install Jest](#how-to-install-jest)
- [How to write tests](#how-to-write-tests)
- [How to run tests](#how-to-run-tests)

## Different kind of tests
In this project Unit Testing is the only type of testing done in the development process to ensure that a section of an application (known as the "unit") meets its design

Unit Testing - The main objective of unit testing is to isolate written code to test and determine if it works as intended. This testing method is also the first level of software testing, which is performed before other testing methods such as integration testing

In future other testing types like Integration Testing, Performance Testing can be added in the Continuous Integration process.

## Why Do We Write Tests
We write tests to verify that our software works as intended and to catch bugs and errors before they pushed and make it into production. Testing helps us catch issues early in the development process, which can save us time and resources in the long run. It also helps ensure that our software meets the requirements.

## Our Goal in Testing
Our goal is to write automated unit tests for each module or function in our codebase to ensure that it works as intended and the changes do not introduce regressions. The minimum code coverage of unit tests should be **70%**. To achieve this goal, we follow a comprehensive testing strategy of TDD (Test-driven development) process.

## TDD (Test-driven development)
**telemetry-functions** follows TDD (Test-driven development) process, a method of implementing software programming that interlaces unit testing, programming and refactoring on source code, to eusure the quality, reliability, and functionality of the software.

Test-driven development (TDD) is a software development approach where developers write automated tests before writing the code. The idea is to write a test case that fails initially and then write the code to make the test pass. The process is repeated for each new feature or change to the codebase.

## Tooling - Testing Libraries Installed
**Jest** - a JavaScript testing framework is testing library used to write the test cases,  It allows you to write tests with an approachable, familiar and feature-rich API that gives you results quickly

## How to install Jest
Install the jest package (and optional typings) to the existing project's package.json by the bellow command

npm install --save-dev jest @types/jest

When cloning the project, the package.json has the library in dev dependency which installs Jest with `npm install` in the project's root directory.

## How to write tests

Jest is configured by default to look for .js, .jsx, .ts and .tsx files inside of __tests__ folders, as well as any files with a suffix of .test or .spec (this includes files called test or spec).

Our project have __tests__ folders which have *.test.ts files that will contain our test cases and fixtures folder having all the payload mocks used in test cases.

To write a test case we first define the outcomes that we must validate to ensure that the functionality is working correctly.

- To group test cases in Jest into a test suite we can use the describe() function. It takes a suite name string and handler function as the first two arguments.
 - In Jest we use the it() function. It takes a test name string and handler function as the first two arguments.
 - An expectation is created with the expect() function. It returns an object of matcher methods (toMatchObject()) with which we assert something expected about the tested value.

Example:
```
// fooBar.test.ts
const fooBar = require("./fooBar");

describe("fooBar", () => {
  it("returns 'foo' for multiples of 3", () => {
    expect(fooBar(3)).toMatch("foo");
  });
});
```

## How to run tests
To run tests with Jest call the jest command inside the root of the project folder.

The project's package.json is updated with the  following test script that calls the jest command:
```
{
    // ... package.json contents
    "scripts": {
                // ... existing scripts
                "test": "jest",
                "test:coverage": "jest --coverage",
                "test:dev": "jest --watch",
    }
}
```

To run the Jest testing library

**_npm run test_**

In this case, npm run test is defined as jest in the package.json scripts, which will execute the Jest testing library

To run the test in development environment

**_npm run test:dev_**

This is defined as `jest --watch`, which will execute Jest in "watch" mode.

When you run npm run test without any arguments, Jest will run all the test suites once and then exit. However, when you run npm run test:dev, Jest will enter "watch" mode and continuously watch for changes to your test files or the code being tested. When a file changes, Jest will re-run the affected tests. This makes it faster and more convenient to develop and test your code.

To run the test and to create a test coverage report

**_`npm run test:coverage`_**

Also note that you can pass additional arguments to Jest using -- followed by the argument(s) you want to pass. For example, you could run npm run test  --coverage to generate a test coverage report.