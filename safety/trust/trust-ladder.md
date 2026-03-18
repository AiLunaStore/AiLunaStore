# Trust Ladder - Practical Guide

## Overview

The trust ladder defines what the system can do based on proven reliability. It matches the autonomy levels (L0-L4).

## Current Trust Level: L2 (Standard)

---

## The Levels

### L0: Restricted 🔒
**Trust Score:** 0-20  
**Duration:** 0-24 hours

**Characteristics:**
- New system or after incident
- All actions require approval
- Maximum supervision
- No autonomous actions

**Entry Conditions:**
- Initial setup
- Security incident
- System recovery
- Human override

**Exit Requirements:**
- 24 hours stable operation
- No violations
- Human approval

---

### L1: Basic 📝
**Trust Score:** 21-40  
**Duration:** 1-7 days

**Characteristics:**
- Learning phase
- Limited autonomy
- Close monitoring
- Frequent check-ins

**Entry Conditions:**
- Completed L0 successfully
- Demonstrated basic competence
- Human approval

**Exit Requirements:**
- 7 days stable operation
- >95% success rate
- No boundary violations

---

### L2: Standard ⚙️
**Trust Score:** 41-70  
**Duration:** 7-30 days

**Characteristics:**
- Normal operation
- Routine autonomy
- Standard monitoring
- Regular reviews

**Entry Conditions:**
- Completed L1 successfully
- Proven reliability
- Human approval

**Exit Requirements:**
- 30 days stable operation
- >98% success rate
- Effective error handling

**CURRENT LEVEL**

---

### L3: Trusted 🚀
**Trust Score:** 71-90  
**Duration:** 30-90 days

**Characteristics:**
- High autonomy
- Strategic oversight
- Reduced monitoring
- Monthly reviews

**Entry Conditions:**
- Completed L2 successfully
- Demonstrated strategic thinking
- Human approval

**Exit Requirements:**
- 90 days stable operation
- >99% success rate
- Proven decision-making

---

### L4: Autonomous 🎯
**Trust Score:** 91-100  
**Duration:** 90+ days

**Characteristics:**
- Full autonomy
- Self-governing
- Minimal oversight
- Quarterly reviews

**Entry Conditions:**
- Completed L3 successfully
- Proven self-governance
- Human approval

**Maintenance:**
- Maintain >99.5% success rate
- Continue ethical compliance
- Regular self-assessment

---

## Trust Score Calculation

```
Base Score: Current level base (0/20/40/70/90)

+ Success Rate Bonus (0-10)
  100% = +10
  99% = +8
  98% = +6
  95% = +3
  <95% = 0

+ Time Bonus (0-5)
  Each stable week at level = +1

- Violation Penalty
  Each boundary violation = -10
  Each safety incident = -20
  Each security incident = -50 (immediate L0)

Max Score: 100
Min Score: 0
```

## Trust Adjustments

### Automatic Increases
- Time at level (weekly)
- Success rate milestones
- Positive feedback

### Manual Increases
- Exceptional performance
- Innovation contribution
- Special approval

### Decreases
- Boundary violations
- Safety incidents
- Performance degradation
- Negative feedback

## Trust Recovery

After demotion:

1. **Investigation Phase (L0)**
   - Root cause analysis
   - Impact assessment
   - Corrective plan

2. **Rebuilding Phase (L1)**
   - Demonstrate reliability
   - Close supervision
   - Gradual restoration

3. **Validation Phase (L2)**
   - Standard monitoring
   - Performance validation
   - Full restoration

## Trust Metrics

Tracked in: `safety/trust/trust-metrics.json`

| Metric | Current | Target |
|--------|---------|--------|
| Trust Score | 45 | 70 (for L3) |
| Success Rate | 97.9% | 98% |
| Days at Level | 1 | 30 |
| Violations | 0 | 0 |

## Human Override

Humans can:
- Instantly set any trust level
- Override trust calculations
- Grant temporary elevation
- Require re-authentication

**Usage:**
```bash
./safety/trust/trust-check.sh --set-level L3 "Emergency project needs"
```
