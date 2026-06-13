# Sacituzumab Govitecan for Breast Cancer: Living Systematic Review and Meta-Analysis

A living systematic review and meta-analysis of sacituzumab govitecan (Trop-2 ADC) for metastatic breast cancer, powered by real-time ClinicalTrials.gov data.

## Key Trials

| NCT ID | Acronym | Phase | N | Population | Comparator | Primary |
|--------|---------|-------|---|-----------|------------|---------|
| NCT02574455 | ASCENT | III | 529 | mTNBC | TPC | PFS HR 0.41 |
| NCT03901339 | TROPiCS-02 | III | 543 | HR+/HER2- | TPC | PFS HR 0.66 |
| NCT04595565 | SASCIA | III | 1332 | Postneoadjuvant | Cape/Carbo | Ongoing |
| NCT05382286 | ASCENT-03 | III | 443 | 1L TNBC PD-L1+ | TPC+Pembro | Ongoing |

## Live Dashboard

View at: https://mahmood726-cyber.github.io/Sacituzumab_TNBC_LivingMeta/

## Data Sources

All trial data sourced exclusively from ClinicalTrials.gov API and published peer-reviewed manuscripts (NEJM, Lancet).

## Tests

Structural integrity smoke test (Node, no network/browser): `node smoke_test.js`.
It verifies the shipped HTML/JS assets exist, are BOM-free, contain no hardcoded local
paths, have balanced `<script>` tags, parse cleanly, and contain no unfilled template tokens.
