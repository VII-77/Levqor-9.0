import { NextRequest, NextResponse } from "next/server";

interface WorkflowStep {
  step: number;
  action: string;
  description: string;
  service?: string;
}

const STUB_WORKFLOWS: Record<string, WorkflowStep[]> = {
  email: [
    { step: 1, action: "Trigger: Email received", description: "Monitor inbox for new emails matching your criteria", service: "Gmail/Outlook" },
    { step: 2, action: "Filter: Check conditions", description: "Evaluate subject, sender, or body content", service: "Levqor" },
    { step: 3, action: "Action: Process email", description: "Extract data, forward, or archive based on rules", service: "Levqor" },
    { step: 4, action: "Notify: Send alert", description: "Send notification to Slack, SMS, or webhook", service: "Slack/Twilio" },
    { step: 5, action: "Log: Record action", description: "Save execution details for audit trail", service: "Levqor" },
  ],
  crm: [
    { step: 1, action: "Trigger: New lead captured", description: "Detect new form submission or lead source", service: "Typeform/Webflow" },
    { step: 2, action: "Enrich: Get company data", description: "Lookup company info and social profiles", service: "Clearbit/Apollo" },
    { step: 3, action: "Create: Add to CRM", description: "Create new contact record with enriched data", service: "HubSpot/Salesforce" },
    { step: 4, action: "Assign: Route to sales rep", description: "Auto-assign based on territory or round-robin", service: "Levqor" },
    { step: 5, action: "Notify: Alert sales team", description: "Send Slack message with lead details", service: "Slack" },
    { step: 6, action: "Follow-up: Schedule task", description: "Create follow-up task for assigned rep", service: "CRM" },
  ],
  slack: [
    { step: 1, action: "Trigger: Message received", description: "Monitor Slack channel or DM for new messages", service: "Slack" },
    { step: 2, action: "Parse: Extract information", description: "Use AI to understand intent and extract data", service: "Levqor AI" },
    { step: 3, action: "Action: Execute task", description: "Perform the requested action based on intent", service: "Various" },
    { step: 4, action: "Respond: Send reply", description: "Post response back to Slack thread", service: "Slack" },
  ],
  backup: [
    { step: 1, action: "Schedule: Cron trigger", description: "Run at specified time (daily/weekly/monthly)", service: "Levqor Scheduler" },
    { step: 2, action: "Connect: Access source", description: "Connect to database or file storage", service: "PostgreSQL/MySQL" },
    { step: 3, action: "Export: Create backup", description: "Generate backup file with timestamp", service: "Levqor" },
    { step: 4, action: "Upload: Store securely", description: "Upload to cloud storage with encryption", service: "S3/GCS" },
    { step: 5, action: "Verify: Check integrity", description: "Validate backup and send confirmation", service: "Levqor" },
    { step: 6, action: "Cleanup: Rotate old backups", description: "Delete backups older than retention period", service: "Levqor" },
  ],
  default: [
    { step: 1, action: "Trigger: Start workflow", description: "Initiate workflow based on your specified trigger", service: "Levqor" },
    { step: 2, action: "Validate: Check inputs", description: "Verify all required data is present", service: "Levqor" },
    { step: 3, action: "Process: Execute logic", description: "Run your business logic and transformations", service: "Levqor" },
    { step: 4, action: "Integrate: Connect services", description: "Send data to connected applications", service: "Various" },
    { step: 5, action: "Handle: Error management", description: "Catch errors and retry or escalate", service: "Levqor" },
    { step: 6, action: "Complete: Finalize", description: "Log success and trigger any follow-up actions", service: "Levqor" },
  ],
};

function detectWorkflowType(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("email") || lower.includes("inbox") || lower.includes("mail")) return "email";
  if (lower.includes("crm") || lower.includes("lead") || lower.includes("salesforce") || lower.includes("hubspot")) return "crm";
  if (lower.includes("slack") || lower.includes("channel") || lower.includes("message")) return "slack";
  if (lower.includes("backup") || lower.includes("database") || lower.includes("sync")) return "backup";
  return "default";
}

export async function POST(request: NextRequest) {
  try {
    const { description, userType } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const workflowType = detectWorkflowType(description);
    const baseSteps = STUB_WORKFLOWS[workflowType];
    
    const steps = baseSteps.map((step, index) => {
      let modifiedStep = { ...step };
      
      if (userType === "business" && step.action.includes("Notify")) {
        modifiedStep.description = modifiedStep.description + " with compliance logging";
      }
      
      return modifiedStep;
    });

    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    return NextResponse.json({
      success: true,
      workflowType,
      steps,
      message: `Generated ${steps.length} workflow steps for your ${workflowType} automation`,
    });
  } catch (error) {
    console.error("Autogen error:", error);
    return NextResponse.json({ error: "Failed to generate workflow" }, { status: 500 });
  }
}
