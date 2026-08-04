import fs from 'node:fs';
import path from 'node:path';
import { runTier1Tests } from './tier1.test.js';
import { runTier2Tests } from './tier2.test.js';
import { runTier3Tests } from './tier3.test.js';
import { runTier4Tests } from './tier4.test.js';

async function main() {
  console.log('===============================================================');
  console.log(' Oxford 3000 CEFR Lexicon Application - Master E2E Test Suite ');
  console.log('===============================================================');

  const startTime = Date.now();

  const tier1 = await runTier1Tests();
  const tier2 = await runTier2Tests();
  const tier3 = await runTier3Tests();
  const tier4 = await runTier4Tests();

  const totalTimeMs = Date.now() - startTime;
  const totalTime = (totalTimeMs / 1000).toFixed(2);

  const printTierResults = (title, results) => {
    console.log(`\n--- ${title} (Passed: ${results.pass}, Failed: ${results.fail}) ---`);
    results.tests.forEach((t) => {
      const icon = t.status === 'PASS' ? '✓' : '✗';
      console.log(`  [${icon}] ${t.name}`);
      if (t.error) {
        console.log(`      Error: ${t.error}`);
      }
    });
  };

  printTierResults('Tier 1: Feature Coverage (Happy Paths)', tier1);
  printTierResults('Tier 2: Boundary & Corner Cases', tier2);
  printTierResults('Tier 3: Cross-Feature Pairwise Combinations', tier3);
  printTierResults('Tier 4: Real-World Workload Scenarios', tier4);

  const totalPass = tier1.pass + tier2.pass + tier3.pass + tier4.pass;
  const totalFail = tier1.fail + tier2.fail + tier3.fail + tier4.fail;
  const totalTests = totalPass + totalFail;

  console.log('\n===============================================================');
  console.log('                       SUMMARY REPORT                          ');
  console.log('===============================================================');
  console.log(`  Tier 1 Tests Passed: ${tier1.pass} / ${tier1.pass + tier1.fail}`);
  console.log(`  Tier 2 Tests Passed: ${tier2.pass} / ${tier2.pass + tier2.fail}`);
  console.log(`  Tier 3 Tests Passed: ${tier3.pass} / ${tier3.pass + tier3.fail}`);
  console.log(`  Tier 4 Tests Passed: ${tier4.pass} / ${tier4.pass + tier4.fail}`);
  console.log('---------------------------------------------------------------');
  console.log(`  TOTAL TESTS EXECUTED : ${totalTests}`);
  console.log(`  TOTAL PASSED         : ${totalPass}`);
  console.log(`  TOTAL FAILED         : ${totalFail}`);
  console.log(`  PASS RATE            : ${((totalPass / (totalTests || 1)) * 100).toFixed(1)}%`);
  console.log(`  EXECUTION TIME       : ${totalTime}s`);
  console.log('===============================================================');

  // Export structured test-results.json artifact
  const failuresList = [];
  [...tier1.tests, ...tier2.tests, ...tier3.tests, ...tier4.tests].forEach((t) => {
    if (t.status === 'FAIL') {
      failuresList.push({ name: t.name, error: t.error });
    }
  });

  const reportData = {
    startTime,
    total: totalTests,
    passed: totalPass,
    failed: totalFail,
    skipped: 0,
    tiers: {
      tier1: { total: tier1.pass + tier1.fail, passed: tier1.pass, failed: tier1.fail },
      tier2: { total: tier2.pass + tier2.fail, passed: tier2.pass, failed: tier2.fail },
      tier3: { total: tier3.pass + tier3.fail, passed: tier3.pass, failed: tier3.fail },
      tier4: { total: tier4.pass + tier4.fail, passed: tier4.pass, failed: tier4.fail }
    },
    failures: failuresList
  };

  const reportPath = path.resolve(process.cwd(), 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
  console.log(`\nWrote structured test results artifact to: ${reportPath}`);

  if (totalFail > 0) {
    console.error('\n❌ E2E TEST SUITE FAILED!');
    process.exit(1);
  } else {
    console.log('\n✅ ALL E2E TESTS PASSED SUCCESSFULLY (100% PASS RATE)!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
