import { NextRequest, NextResponse } from 'next/server';
import { consumeSignupVerification } from '@/lib/signupVerificationStore';

type CompleteVerificationRequest = {
  token?: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CompleteVerificationRequest;
    const token = payload?.token?.trim();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Missing verification token.' }, { status: 400 });
    }

    const result = consumeSignupVerification(token);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: 'error' in result ? result.error : 'Invalid verification request.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      signup: result.payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify signup token.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
