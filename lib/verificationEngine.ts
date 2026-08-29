export interface VerificationMetadata {
  source_url?: string;
  source_type?: 'Official' | 'Trusted Institutional' | 'Secondary';
  last_verified_date?: string;
  academic_year?: string;
  valid_from?: string;
  valid_until?: string;
  verification_status?: 'Verified' | 'Needs verification' | 'Outdated' | 'Unknown';
}

export interface VerificationResult {
  isValid: boolean;
  issues: string[];
  confidence: 'High' | 'Medium' | 'Low';
}

/**
 * Automatically flags date logic errors and assesses data freshness
 */
export function validateVerificationMetadata(
  meta?: VerificationMetadata,
  currentDate: Date = new Date()
): VerificationResult {
  const issues: string[] = [];
  let confidence: 'High' | 'Medium' | 'Low' = 'Low';

  if (!meta) {
    issues.push("No verification metadata available.");
    return { isValid: false, issues, confidence: 'Low' };
  }

  if (meta.verification_status === 'Outdated') {
    issues.push("Data is explicitly marked as outdated.");
    return { isValid: false, issues, confidence: 'Low' };
  }

  if (meta.verification_status === 'Needs verification') {
    issues.push("Data is flagged for re-verification.");
  }

  if (meta.valid_from && meta.valid_until) {
    const from = new Date(meta.valid_from);
    const until = new Date(meta.valid_until);

    if (until < from) {
      issues.push("Invalid timeline detected: End date is before start date.");
    }

    if (currentDate < from) {
      issues.push("Verification timeline is in the future. Data not yet valid.");
      confidence = 'Low';
    }

    if (currentDate > until) {
      issues.push("Deadline has already passed but data may still be presented as current.");
      // Auto-demote confidence
      confidence = 'Low';
    }
  }

  // Assess confidence based on source type
  if (issues.length === 0 && meta.verification_status === 'Verified') {
    if (meta.source_type === 'Official') {
      confidence = 'High';
    } else if (meta.source_type === 'Trusted Institutional') {
      confidence = 'Medium';
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    confidence
  };
}

/**
 * Helps format AI prompt context regarding verification status
 */
export function formatVerificationContext(meta?: VerificationMetadata): string {
  const result = validateVerificationMetadata(meta);
  
  if (!meta) return "No verified source available. Proceed with extreme caution.";

  let context = `Source Priority: ${meta.source_type || 'Unknown'} Source\n`;
  context += `Status: ${meta.verification_status || 'Unknown'}\n`;
  if (meta.last_verified_date) context += `Last Verified: ${meta.last_verified_date}\n`;
  if (meta.academic_year) context += `Academic Year: ${meta.academic_year}\n`;
  
  if (!result.isValid) {
    context += `[SYSTEM WARNING]: ${result.issues.join(' ')}\n`;
  }

  return context;
}
