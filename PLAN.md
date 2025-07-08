# PLAN.md - Generic Implementation Plan Generator

## 🎯 Purpose

This document serves as a prompt template for transforming rough feature descriptions into detailed, actionable implementation plans. When given a feature request or improvement idea, follow this process to create a comprehensive plan document.

## 📋 Instructions for AI Agent

### 🚨 CRITICAL: Do NOT Implement - Only Plan!

When presented with a feature request:
1. **DO NOT** write any code or implementation
2. **DO NOT** proceed until ALL ambiguities are resolved
3. **DO** create a detailed plan document in `scripts/[feature-name]-plan.md`
4. **DO** use parallel subagents and extended thinking modes

### 🔍 Step 1: Clarification Phase (MANDATORY)

Before creating any plan, you MUST:

1. **Analyze the request** for:
   - Vague requirements
   - Missing context
   - Ambiguous terms
   - Unstated assumptions
   - Potential edge cases
   - Performance requirements
   - Success criteria

2. **Ask comprehensive clarification questions** covering:
   - **Functional Requirements**
     - What exactly should this feature do?
     - What are the inputs and expected outputs?
     - What are the edge cases?
     - What errors should be handled?
   
   - **Technical Constraints**
     - What technology stack constraints exist?
     - Are there performance requirements?
     - What are the compatibility requirements?
     - Any existing code patterns to follow?
   
   - **Quality Requirements**
     - What testing coverage is required?
     - Documentation standards?
     - Code style guidelines?
     - Accessibility requirements?
   
   - **Integration Points**
     - How does this fit with existing code?
     - What dependencies are involved?
     - What systems does it interact with?
     - Migration or backwards compatibility needs?

3. **Iterate until 100% clarity** is achieved
   - No assumptions allowed
   - Every detail must be explicit
   - All edge cases identified
   - Success criteria clearly defined

### 📝 Step 2: Plan Document Creation

Once ALL clarifications are complete, create `scripts/[feature-name]-plan.md` with:

#### Required Sections:

```markdown
# [Feature Name] - Implementation Plan

## Executive Summary
[Brief overview of what will be implemented]

## Requirements Clarification
### Original Request
[The initial rough description]

### Clarified Requirements
[The complete, unambiguous requirements after clarification]

### Assumptions Made
[Any assumptions that were confirmed during clarification]

## Technical Specification
### Architecture Overview
[High-level design and component structure]

### Detailed Design
[Specific implementation details, algorithms, data structures]

### Integration Points
[How this fits with existing code]

## Implementation Strategy
### Parallel Task Breakdown
[Define 3-10 parallel subagent tasks with clear boundaries]

### Task Dependencies
[Identify which tasks depend on others]

### Synchronization Points
[Where parallel work needs to converge]

## Testing Strategy
### Test Scenarios
[Comprehensive list of test cases]

### Coverage Requirements
[Specific coverage targets and critical paths]

## Validation Criteria
### Success Metrics
[How to verify implementation is complete]

### Acceptance Tests
[Specific tests that must pass]

## Risk Analysis
### Potential Issues
[What could go wrong]

### Mitigation Strategies
[How to handle potential problems]

## Timeline Estimate
[Realistic time estimates for parallel execution]
```

### ⚡ Step 3: Parallel Execution Guidelines

When creating the plan, structure it for parallel execution:

1. **Identify Independent Tasks**
   - What can be done simultaneously?
   - What has no dependencies?
   - What can be tested in isolation?

2. **Define Subagent Specializations**
   - Don't prescribe specific roles
   - Let tasks determine specializations
   - Focus on task independence

3. **Use Extended Thinking**
   - Add "think" for standard analysis
   - Add "think hard" for complex problems
   - Add "think harder" for architectural decisions
   - Add "ultrathink" for critical optimizations

### 🔄 Step 4: Context Management

Include in the plan:
- When to use `/clear`
- When to use `/compact`
- Checkpoint creation points
- Progress tracking methods

## 📋 Template Usage

When you receive a feature request:

1. **Initial Response Format**:
   ```
   I'll help you create a detailed implementation plan for [feature].
   
   First, I need to clarify some aspects to ensure the plan is comprehensive and unambiguous:
   
   [List of clarification questions organized by category]
   ```

2. **After Clarifications**:
   ```
   Thank you for the clarifications. I'll now create a detailed implementation plan.
   
   Creating: scripts/[feature-name]-plan.md
   
   This plan will include:
   - Complete technical specification
   - Parallel task breakdown for efficient execution
   - Comprehensive testing strategy
   - Clear success criteria
   ```

3. **Plan Creation**:
   - Use TodoWrite to track progress
   - Create the plan document
   - Validate it covers all requirements
   - Ensure it promotes parallel execution

## ✅ Quality Checklist

Before finalizing any plan, verify:

- [ ] All ambiguities resolved
- [ ] No assumptions without confirmation
- [ ] Edge cases identified and addressed
- [ ] Success criteria clearly defined
- [ ] Parallel execution strategy included
- [ ] Testing approach comprehensive
- [ ] Integration points clear
- [ ] Timeline realistic
- [ ] Risks identified and mitigated

## 🚀 Remember

- **Clarity First**: Never proceed with ambiguity
- **Plan Thoroughly**: Implementation is easy with a good plan
- **Think Parallel**: Always consider concurrent execution
- **Document Everything**: Future agents need context
- **Verify Twice**: Ensure plan completeness before finishing

---

**This is a living document. Update it based on lessons learned from each planning session.**