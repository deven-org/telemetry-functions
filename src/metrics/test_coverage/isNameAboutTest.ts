// be careful not to add a /g/ or /y/ flag
// (or change isNameAboutTest to not use regex.test() which is stateful then)
const testNameRegex =
  /test|jest|[^j]ava|puppeteer|cypress|selenium|playwright|mocha|jasmine/;

export function isNameAboutTest(name: string) {
  return testNameRegex.test(name.toLowerCase());
}
