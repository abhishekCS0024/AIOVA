# Demo scenario: DEV-2026-041 (docs §13)

Assay failure in Batch API-B-2307. Reactor R-201 exceeded the 80 °C limit for about
25 minutes during crystallization; assay 97.2% vs. specification ≥ 99.0%.

Demo input files (fictional demo data, covering all three input formats):

| File | Format | Key content |
|---|---|---|
| `deviation_report.pdf` | PDF | Description of the excursion, batch, and test result |
| `equipment_log.pdf` | PDF | Sensor TT-101 reading lower than a reference probe |
| `maintenance_record.txt` | text | Cooling valve CV-12 service overdue by 3 weeks |
| `lab_results.txt` | text | Impurity levels above normal |
| `shift_notes.eml` | email | Operator noted an alarm but saw normal readings on screen |
| `past_deviation.txt` | text | Similar excursion on R-201 six months earlier |

Expected AI output: root cause TT-101 out of calibration; contributing factors CV-12
overdue maintenance, alarm not escalated, repeat issue not acted on.
