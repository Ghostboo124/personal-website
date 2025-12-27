import {
  type RuleConfigCondition,
  RuleConfigSeverity,
  type TargetCaseType,
} from "@commitlint/types";

export default {
  parserPreset: "conventional-changelog-conventionalcommits",
  rules: {
    "body-leading-blank": [RuleConfigSeverity.Warning, "always"] as const,
    "body-max-line-length": [RuleConfigSeverity.Error, "always", 100] as const,
    "footer-leading-blank": [RuleConfigSeverity.Warning, "always"] as const,
    "footer-max-line-length": [
      RuleConfigSeverity.Error,
      "always",
      100,
    ] as const,
    "header-max-length": [RuleConfigSeverity.Error, "always", 100] as const,
    "header-trim": [RuleConfigSeverity.Error, "always"] as const,
    "subject-case": [
      RuleConfigSeverity.Error,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ] as [RuleConfigSeverity, RuleConfigCondition, TargetCaseType[]],
    "subject-empty": [RuleConfigSeverity.Error, "never"] as const,
    "subject-full-stop": [RuleConfigSeverity.Error, "never", "."] as const,
    "type-case": [RuleConfigSeverity.Error, "always", "lower-case"] as const,
    "type-empty": [RuleConfigSeverity.Error, "never"] as const,
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      ["chore", "docs", "feat", "fix", "improvement", "refactor"],
    ] as [RuleConfigSeverity, RuleConfigCondition, string[]],
  },
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: {
          feat: {
            description: "A new feature",
            title: "Features",
            emoji: "󰓎",
          },
          fix: {
            description: "A bug fix",
            title: "Bug Fixes",
            emoji: "",
          },
          docs: {
            description: "Documentation only changes",
            title: "Documentation",
            emoji: "",
          },
          refactor: {
            description:
              "A code change that neither fixes a bug nor adds a feature",
            title: "Code Refactoring",
            emoji: "",
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: "Chores",
            emoji: "󰑌",
          },
          improvement: {
            description: "An improvement to a part of the code",
            title: "Improvements",
            emoji: "",
          },
        },
      },
      scope: {
        description:
          "What is the scope of this change (e.g. component or file name)",
      },
      subject: {
        description:
          "Write a short, imperative tense description of the change",
      },
      body: {
        description: "Provide a longer description of the change",
      },
      isBreaking: {
        description: "Are there any breaking changes?",
      },
      breakingBody: {
        description:
          "A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
      },
      breaking: {
        description: "Describe the breaking changes",
      },
      isIssueAffected: {
        description: "Does this change affect any open issues?",
      },
      issuesBody: {
        description:
          "If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};
